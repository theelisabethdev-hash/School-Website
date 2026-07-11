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

// Helper to parse filename into prefix and numeric index (matching functions/index.js)
function parseFilename(filename) {
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  const yearMatch = nameWithoutExt.match(/^(.+?202\d)(\d+)$/);
  if (yearMatch) {
    return { prefix: yearMatch[1], index: parseInt(yearMatch[2], 10) };
  }
  const hundredMatch = nameWithoutExt.match(/^(.+?)(1\d\d|2\d\d)$/);
  if (hundredMatch) {
    return { prefix: hundredMatch[1], index: parseInt(hundredMatch[2], 10) };
  }
  const fallbackMatch = nameWithoutExt.match(/^(.+?)(\d+)$/);
  if (fallbackMatch) {
    return { prefix: fallbackMatch[1], index: parseInt(fallbackMatch[2], 10) };
  }
  return { prefix: nameWithoutExt, index: 0 };
}

// Helper to get friendly album title from prefix (matching functions/index.js)
function getFriendlyTitle(prefix) {
  const mappings = {
    'ADMADActivity': 'AD MAD Activity',
    'AnnualDay': 'Annual Day',
    'COMMUNITYActivity': 'Community Activity',
    'CSActivity': 'CS Activity',
    'Dance': 'Dance',
    'Dussehra2021': 'Dussehra 2021',
    'EID2022Activity': 'EID 2022 Activity',
    'EVSDay': 'EVS Day',
    'Earlyday': 'Early Day',
    'EidDay': 'Eid Day',
    'Gallery': 'Gallery',
    'IDay2021': 'Independence Day 2021',
    'Independence': 'Independence Day',
    'InterHouse': 'Inter House',
    'Kabali': 'Kabali',
    'LemonadeActivity': 'Lemonade Activity',
    'MangoActivity': 'Mango Activity',
    'MathsActivity': 'Maths Activity',
    'MusicDayActivity': 'Music Day Activity',
    'NewsDetail': 'News Detail',
    'OLYMPIADActivity': 'Olympiad Activity',
    'Republic': 'Republic Day',
    'RhymeActivity': 'Rhyme Activity',
    'RolePlayActivity': 'Role Play Activity',
    'SSTActivity': 'SST Activity',
    'SUMMERBREAKActivity': 'Summer Break Activity',
    'ShowActivity': 'Show Activity',
    'TeachersDay': 'Teachers Day',
    'TigerDay': 'Tiger Day',
    'theatre': 'Theatre'
  };
  return mappings[prefix] || prefix
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/(\d+)/g, ' $1')
    .trim();
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
    // --- 1. Process Banners ---
    console.log('\n--- Processing Banners ---');
    const bannerDir = path.join(process.cwd(), 'public', 'banner');
    if (!fs.existsSync(bannerDir)) {
      console.warn('Local banner directory not found, skipping banner upload.');
    } else {
      const bannerFiles = fs.readdirSync(bannerDir)
        .filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      console.log(`Found ${bannerFiles.length} local banner images. Uploading...`);
      
      const bannerDocs = [];
      let orderCount = 1;
      
      for (const file of bannerFiles) {
        const localPath = path.join(bannerDir, file);
        const destPath = `banners/${Date.now()}_${file}`;
        const ext = path.extname(file).toLowerCase();
        const mimetype = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        
        console.log(`Uploading banner: ${file}...`);
        const url = await uploadFile(localPath, destPath, mimetype);
        
        bannerDocs.push({
          image: url,
          title: '',
          order: orderCount++
        });
      }

      // Write to Firestore (delete existing banners to refresh)
      console.log('Writing banners to Firestore (both databases)...');
      for (const database of dbs) {
        const bannersCollection = database.collection('banners');
        const existingBanners = await bannersCollection.get();
        const batch = database.batch();
        
        existingBanners.forEach(doc => batch.delete(doc.ref));
        bannerDocs.forEach(doc => {
          const ref = bannersCollection.doc();
          batch.set(ref, doc);
        });
        await batch.commit();
      }
      console.log('Banners collection updated successfully in both databases.');
    }

    // --- 2. Process Gallery ---
    console.log('\n--- Processing Gallery ---');
    const galleryDir = path.join(process.cwd(), 'public', 'Gallary');
    if (!fs.existsSync(galleryDir)) {
      console.warn('Local Gallery directory not found, skipping gallery upload.');
    } else {
      const galleryFiles = fs.readdirSync(galleryDir)
        .filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file));

      console.log(`Found ${galleryFiles.length} local gallery images. Grouping into albums...`);

      // Group files by prefix
      const groups = {};
      galleryFiles.forEach(file => {
        const parsed = parseFilename(file);
        if (!groups[parsed.prefix]) {
          groups[parsed.prefix] = [];
        }
        groups[parsed.prefix].push({
          file: file,
          index: parsed.index
        });
      });

      const prefixes = Object.keys(groups).sort();
      console.log(`Grouped into ${prefixes.length} albums.`);

      // Let's clear existing gallery collection first in both databases
      console.log('Clearing existing gallery collections in Firestore (both databases)...');
      for (const database of dbs) {
        const galleryCollection = database.collection('gallery');
        const existingGallery = await galleryCollection.get();
        const clearBatch = database.batch();
        existingGallery.forEach(doc => clearBatch.delete(doc.ref));
        await clearBatch.commit();
      }

      for (const prefix of prefixes) {
        const title = getFriendlyTitle(prefix);
        console.log(`Processing album: "${title}" (${groups[prefix].length} images)...`);
        
        const sortedImages = groups[prefix].sort((a, b) => a.index - b.index);
        const imagesData = [];
        
        // Upload images in parallel (up to 5 concurrently per album to avoid hitting rate limits)
        await pLimit(sortedImages, 5, async (imgInfo) => {
          const file = imgInfo.file;
          const localPath = path.join(galleryDir, file);
          const destPath = `gallery/${prefix}/${file}`;
          const ext = path.extname(file).toLowerCase();
          const mimetype = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
          
          const url = await uploadFile(localPath, destPath, mimetype);
          imagesData.push({
            image: url,
            name: `${title} - Image ${imgInfo.index}`,
            index: imgInfo.index // helper for sorting in script
          });
        });

        // Sort imagesData by index before saving
        imagesData.sort((a, b) => a.index - b.index);
        // Remove index field from final firestore save
        const finalImages = imagesData.map(img => ({
          image: img.image,
          name: img.name
        }));

        const galleryDoc = {
          title: title,
          category: title,
          images: finalImages,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        for (const database of dbs) {
          const galleryCollection = database.collection('gallery');
          await galleryCollection.add(galleryDoc);
        }
        console.log(`Album "${title}" written to both Firestore databases.`);
      }
      console.log('Gallery upload and database indexing completed successfully.');
    }

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
