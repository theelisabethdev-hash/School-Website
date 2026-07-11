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
const tempCredPath = path.join(process.cwd(), 'scratch-credentials-ey.json');
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
    console.log('\n--- Seeding Early Years Images ---');
    const baseDir = path.join(process.cwd(), 'public', 'egps', 'assets', 'img');
    if (!fs.existsSync(baseDir)) {
      console.error('Local public/egps/assets/img directory not found.');
      process.exit(1);
    }

    const mapping = {
      profile: {},
      gallery: {}
    };

    // 1. Process Profile Images
    const files = fs.readdirSync(baseDir);
    for (const file of files) {
      const filePath = path.join(baseDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile() && /\.(jpe?g|png)$/i.test(file)) {
        const destPath = `early-years/${file}`;
        const mimetype = file.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        const url = await uploadFile(filePath, destPath, mimetype);
        
        // We use relative path as key for simple substitution later
        const relPath = `/egps/assets/img/${file}`;
        mapping.profile[relPath] = url;
        console.log(`  Uploaded Profile Image: ${file} -> ${url}`);
      }
    }

    // 2. Process Gallery Images
    const galleryDir = path.join(baseDir, 'gallery');
    if (fs.existsSync(galleryDir)) {
      const galleryFiles = fs.readdirSync(galleryDir);
      for (const file of galleryFiles) {
        const filePath = path.join(galleryDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile() && /\.(jpe?g|png)$/i.test(file)) {
          const destPath = `early-years/gallery/${file}`;
          const mimetype = file.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          const url = await uploadFile(filePath, destPath, mimetype);
          
          const relPath = `/egps/assets/img/gallery/${file}`;
          mapping.gallery[relPath] = url;
          console.log(`  Uploaded Gallery Image: ${file} -> ${url}`);
        }
      }
    }

    // Save mappings to scratchpad
    const scratchpadDir = path.join(process.cwd(), 'scratchpad');
    if (!fs.existsSync(scratchpadDir)) {
      fs.mkdirSync(scratchpadDir);
    }
    const mappingFile = path.join(scratchpadDir, 'early_years_urls.json');
    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    console.log(`\nURL mapping written to ${mappingFile}`);

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
