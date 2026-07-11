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
const tempCredPath = path.join(process.cwd(), 'scratch-credentials-safety.json');
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

console.log('Initializing Firebase Admin...');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID,
  storageBucket: BUCKET_NAME
});

const bucket = admin.storage().bucket();

const filesToUpload = [
  'S101.jpg',
  'S102.jpg',
  'S103.jpg',
  's104-2.jpg'
];

async function uploadFile(localPath, destinationPath, mimetype) {
  const fileRef = bucket.file(destinationPath);
  
  // Check if file already exists in Storage
  const [exists] = await fileRef.exists();
  if (exists) {
    console.log(`  File already exists in Storage: ${destinationPath}`);
    return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
  }

  console.log(`  Uploading ${localPath} -> ${destinationPath}`);
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
    console.log('\n--- Seeding Safety & Security Images ---');
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      console.error('Local public/images directory not found.');
      process.exit(1);
    }

    const results = {};

    for (const file of filesToUpload) {
      const localPath = path.join(imagesDir, file);
      if (!fs.existsSync(localPath)) {
        console.error(`Error: Local image file not found at ${localPath}`);
        process.exit(1);
      }
      const destPath = `safety-security/${file}`;
      const url = await uploadFile(localPath, destPath, 'image/jpeg');
      results[file] = url;
      console.log(`Uploaded successfully: ${file} -> ${url}`);
    }

    console.log('\nAll Safety & Security images uploaded successfully!');
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('Upload failed:', err);
  } finally {
    // Clean up temporary credentials file
    if (fs.existsSync(tempCredPath)) {
      fs.unlinkSync(tempCredPath);
    }
  }
}

run();
