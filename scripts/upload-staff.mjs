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
const tempCredPath = path.join(process.cwd(), 'scratch-credentials-staff.json');
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

const FALLBACK_STAFF = [
  // Administration
  { name: "Mrs. Monica Ahuja Rao", title: "Administration", role: "Principal", order: 1 },
  { name: "Mrs. Meenakshi Aggarwal", title: "Administration", role: "Account Head", order: 2 },
  { name: "Mr. Mayank Singh Rawat", title: "Administration", role: "IT & Admin Officer", order: 3 },
  { name: "Mrs. Kanchan Sharma", title: "Administration", role: "Receptionist", order: 4 },
  
  // Coordinators
  { name: "Mrs. Karishma Manchanda", title: "Coordinators", role: "Pre-Primary", order: 1 },

  // Co-Curricular Teachers
  { name: "Mrs. Priyanka Khanna", title: "Co-Curricular Teachers", role: "", order: 1 },
  { name: "Mrs. Soma Saha", title: "Co-Curricular Teachers", role: "", order: 2 },
  { name: "Mrs. Bharti", title: "Co-Curricular Teachers", role: "", order: 3 },
  { name: "Ms. Sharon Bhardwaj", title: "Co-Curricular Teachers", role: "", order: 4 },
  { name: "Ms. Prerna Negi", title: "Co-Curricular Teachers", role: "", order: 5 },
  { name: "Ms. Bhavya Sharma", title: "Co-Curricular Teachers", role: "", order: 6 },
  { name: "Mr. Garv Solanki", title: "Co-Curricular Teachers", role: "Sport Teacher", order: 7 },

  // Special Educator
  { name: "Ms. Shikha Awasthi", title: "Special Educator", role: "", order: 1 },

  // Teachers (I-V)
  { name: "Ms. Jeevika Lamba", title: "Teachers (I-V)", role: "", order: 1 },
  { name: "Ms. Nanda Devi", title: "Teachers (I-V)", role: "", order: 2 },
  { name: "Ms. Neeru Kalra", title: "Teachers (I-V)", role: "", order: 3 },
  { name: "Ms. Sundus Khan", title: "Teachers (I-V)", role: "", order: 4 },
  { name: "Ms. Rakhi Datta", title: "Teachers (I-V)", role: "", order: 5 },

  // Support Staff
  { name: "Asha Tomar", title: "Support Staff", role: "", order: 1 },
  { name: "Ranjeeta", title: "Support Staff", role: "", order: 2 },
  { name: "Geeta", title: "Support Staff", role: "", order: 3 },
  { name: "Aarti", title: "Support Staff", role: "", order: 4 },
  { name: "Manisha", title: "Support Staff", role: "", order: 5 },
  { name: "Soban Singh", title: "Support Staff", role: "", order: 6 },
  { name: "Ramesh Chand", title: "Support Staff", role: "", order: 7 },
];

const CAROUSEL_FILES = ['st-1.jpg', 'st-2.jpg', 'st-3.jpg', 'st-4.jpg'];

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
    console.log('\n--- Seeding Staff Data in Firebase ---');

    // 1. Clear existing collections
    console.log('Clearing existing "staff" and "staff_carousel" collections...');
    for (const database of dbs) {
      const staffColl = database.collection('staff');
      const existingStaff = await staffColl.get();
      const staffBatch = database.batch();
      existingStaff.forEach(doc => staffBatch.delete(doc.ref));
      await staffBatch.commit();

      const carouselColl = database.collection('staff_carousel');
      const existingCarousel = await carouselColl.get();
      const carouselBatch = database.batch();
      existingCarousel.forEach(doc => carouselBatch.delete(doc.ref));
      await carouselBatch.commit();
    }
    console.log('Cleared existing collections.');

    // 2. Upload Carousel Slides to Storage and Save to Firestore
    console.log('\nUploading slideshow images to Firebase Storage...');
    const slideshowUrls = [];
    const imagesDir = path.join(process.cwd(), 'public', 'images');

    for (let i = 0; i < CAROUSEL_FILES.length; i++) {
      const fileName = CAROUSEL_FILES[i];
      const localPath = path.join(imagesDir, fileName);
      if (!fs.existsSync(localPath)) {
        console.warn(`Local file ${localPath} not found. Skipping.`);
        continue;
      }
      
      console.log(`- Uploading ${fileName}...`);
      const destPath = `staff/carousel/${fileName}`;
      const url = await uploadFile(localPath, destPath, 'image/jpeg');
      slideshowUrls.push({ url, order: i + 1 });
    }

    console.log('Writing slideshow image links to Firestore...');
    for (const slide of slideshowUrls) {
      const docData = {
        image: slide.url,
        order: slide.order,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      for (const database of dbs) {
        await database.collection('staff_carousel').add(docData);
      }
    }
    console.log('Slideshow carousel uploaded and stored successfully.');

    // 3. Seed Teachers Data to Firestore
    console.log('\nWriting staff list to Firestore...');
    for (const teacher of FALLBACK_STAFF) {
      const docData = {
        name: teacher.name,
        title: teacher.title,
        role: teacher.role,
        image: '', // fallback profile is empty
        order: teacher.order,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      for (const database of dbs) {
        await database.collection('staff').add(docData);
      }
    }
    console.log(`Successfully seeded ${FALLBACK_STAFF.length} staff members.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Clean up temporary credentials file
    if (fs.existsSync(tempCredPath)) {
      fs.unlinkSync(tempCredPath);
    }
    console.log('Firebase Seeding completed.');
  }
}

run();
