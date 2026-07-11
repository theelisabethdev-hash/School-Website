import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');

// 1. Get credentials from local firebase-tools.json config
const homeDir = process.env.USERPROFILE || process.env.HOME || 'C:/Users/Aditya Narayan';
const configPath = path.join(homeDir, '.config', 'configstore', 'firebase-tools.json');

if (!fs.existsSync(configPath)) {
  console.error(`Firebase CLI credentials not found at ${configPath}. Please run 'firebase login' first.`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const refreshToken = config.tokens?.refresh_token;

if (!refreshToken) {
  console.error('No refresh token found in firebase-tools.json. Please run "firebase login" first.');
  process.exit(1);
}

// 2. Generate temporary Application Default Credentials JSON
const tempCredPath = path.join(process.cwd(), 'scratch-credentials.json');
const creds = {
  type: 'authorized_user',
  client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
  client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
  refresh_token: refreshToken
};

fs.writeFileSync(tempCredPath, JSON.stringify(creds, null, 2));
process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredPath;

const PROJECT_ID = 'the-elisabeth-gauba-scho-534b5';
const BUCKET_NAME = 'the-elisabeth-gauba-scho-534b5.firebasestorage.app';
const DATABASE_ID = 'schooldb';

console.log('Initializing Firebase Admin...');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  storageBucket: BUCKET_NAME
});

const { Firestore } = require('../functions/node_modules/@google-cloud/firestore');
const dbSchool = new Firestore({ projectId: PROJECT_ID, databaseId: 'schooldb' });
const dbDefault = new Firestore({ projectId: PROJECT_ID, databaseId: '(default)' });
const dbs = [dbSchool, dbDefault];
const bucket = admin.storage().bucket();

const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif)$/i;

function subDirs(p) {
  try {
    return fs
      .readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

// Concurrency helper
async function pLimit(items, limit, fn) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

async function uploadFile(localPath, destinationPath, mimetype) {
  const fileRef = bucket.file(destinationPath);
  
  // Check if file already exists in Storage
  const [exists] = await fileRef.exists();
  if (exists) {
    return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
  }

  await bucket.upload(localPath, {
    destination: destinationPath,
    public: true,
    metadata: {
      contentType: mimetype
    }
  });

  return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
}

async function run() {
  try {
    console.log('\n--- Processing Activities ---');
    const activitiesDir = path.join(process.cwd(), 'public', 'activities');
    if (!fs.existsSync(activitiesDir)) {
      console.error('Local activities directory not found.');
      process.exit(1);
    }

    const months = subDirs(activitiesDir);
    console.log(`Found ${months.length} month directories.`);

    // Clear existing activities in both databases
    console.log('Clearing existing activities collection in Firestore (both databases)...');
    for (const database of dbs) {
      const activitiesCollection = database.collection('activities');
      const existingActivities = await activitiesCollection.get();
      const clearBatch = database.batch();
      existingActivities.forEach(doc => clearBatch.delete(doc.ref));
      await clearBatch.commit();
    }

    for (const month of months) {
      const monthPath = path.join(activitiesDir, month);
      const activityTitles = subDirs(monthPath);
      if (activityTitles.length === 0) continue;

      console.log(`Processing month: "${month}" (${activityTitles.length} activities)...`);

      for (const title of activityTitles) {
        const activityPath = path.join(monthPath, title);
        const files = fs.readdirSync(activityPath)
          .filter(f => IMAGE_RE.test(f))
          .sort();

        if (files.length === 0) continue;
        console.log(`- Activity: "${title}" (${files.length} images). Uploading...`);

        const imageUrls = [];

        // Upload images concurrently (up to 5 at a time)
        await pLimit(files, 5, async (file) => {
          const localPath = path.join(activityPath, file);
          const destPath = `activities/${month}/${title}/${file}`;
          const ext = path.extname(file).toLowerCase();
          const mimetype = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
          
          const url = await uploadFile(localPath, destPath, mimetype);
          imageUrls.push(url);
        });

        // Construct document payload
        const activityDoc = {
          title: `${title} (${month})`,
          content: `${title} held in ${month}.`,
          images: imageUrls,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        // Write to both databases
        for (const database of dbs) {
          await database.collection('activities').add(activityDoc);
        }
        console.log(`  Activity "${title} (${month})" written to both Firestore databases.`);
      }
    }
    console.log('\nActivities migration completed successfully.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Clean up temporary credentials file
    if (fs.existsSync(tempCredPath)) {
      fs.unlinkSync(tempCredPath);
    }
  }
}

run();
