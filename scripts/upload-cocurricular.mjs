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

console.log('Initializing Firebase Admin...');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID,
  storageBucket: BUCKET_NAME
});

const { Firestore } = require('../functions/node_modules/@google-cloud/firestore');
const dbSchool = new Firestore({ projectId: PROJECT_ID, databaseId: 'schooldb' });
const dbDefault = new Firestore({ projectId: PROJECT_ID, databaseId: '(default)' });
const dbs = [dbSchool, dbDefault];
const bucket = admin.storage().bucket();

const defaults = [
  {
    title: "Music (Indian and Western)",
    content: "It is an interesting medium to make students learn rhythm, melody, beats and lyrics. The school aims to nurture the love for music in students. This will probably help many children to tap their talent by providing them the right direction and encouragement.",
    imageFiles: [
      "Curricular101.jpg",
      "Curricular102.jpg",
      "Curricular103.jpg",
      "Curricular104.jpg"
    ],
    order: 1
  },
  {
    title: "Art & Craft",
    content: "Art and Craft form an integral part of the curriculum. Art allows students to experiment with colours, paint their imagination and express their creativity. Similarly, craft enables students to indulge in brainstorming and come out with innovative ideas. This improves their fine motor coordination and they are able to produce best out of waste. The various activities done are collage making, paper tearing, cutting and pasting, sketching, compositions, calligraphy etc.",
    imageFiles: [
      "Curricular101.jpg",
      "Curricular102.jpg",
      "Curricular103.jpg",
      "Curricular104.jpg"
    ],
    order: 2
  },
  {
    title: "Performing Arts",
    content: "Performing arts is the art of expressing one's emotions through expressions, dance, drama, plays, music and much more. It was started in school with an aim to help improve self confidence and communication skills in children. They get to explore different emotions through acts, stories etc. Performing arts help in overall development of students. It is all about self expression and embracing one's individuality. Children look forward to this fun filled experience.",
    imageFiles: [
      "Curricular202.jpg"
    ],
    order: 3
  },
  {
    title: "Taekwondo",
    content: "It is one of the most systematic and scientific Korean traditional martial arts that teaches more than just the physical fighting skills. It is a discipline that shows ways of enhancing our spirit, body and life through training our mind. It helps to inculcate self discipline in students as well as develop positive energy in them.",
    imageFiles: [
      "Curricular202.jpg"
    ],
    order: 4
  },
  {
    title: "Dance & Fitness",
    content: "It is a program specially designed to help students understand rhythm and develop flexibility. Music and movement enables them to develop large and fine motor coordination, eye hand coordination and strength. Not only do they learn different dance steps, they also learn to coordinate the right step with the right beat and be a part of the group. They also have fun while dancing as it is a stress buster.",
    imageFiles: [
      "Curricular301.jpg",
      "Curricular302.jpg",
      "Curricular303.jpg",
      "Curricular304.jpg",
      "Curricular320.jpg"
    ],
    order: 5
  },
  {
    title: "Games & Yoga",
    content: "The school has facilities for both indoor and outdoor games. The aim is to infuse positive aggression, team spirit as well as the spirit of never quiting. The students are trained in basketball, volleyball, badminton, table tennis, throw ball and kho-kho. Indoor games include ludo, carrom, chess etc. Yoga is the acknowledged exercise routine which ensures all round development of students. It improves concentration and focus. It brings discipline into their lives. The students do various asanas that keep them fit, agile and refreshed, thereby reducing anxiety and stress.",
    imageFiles: [
      "Curricular301.jpg",
      "Curricular302.jpg",
      "Curricular303.jpg",
      "Curricular304.jpg",
      "Curricular320.jpg"
    ],
    order: 6
  },
  {
    title: "Excursions & Educational Trips",
    content: "The school organizes meaningful educational trips as well as fun excursions in and around Delhi from time to time. The age of the children as well as the content that they are studying is taken into consideration while planning these trips. The children are also taken for plays, musical and dance events.",
    imageFiles: [
      "S101.jpg",
      "S102.jpg",
      "S103.jpg",
      "S104.jpg",
      "S105.jpg"
    ],
    order: 7
  },
  {
    title: "Workshops",
    content: "The school organizes workshops for both students and teachers from time to time.",
    imageFiles: [
      "S101.jpg",
      "S102.jpg",
      "S103.jpg",
      "S104.jpg",
      "S105.jpg"
    ],
    order: 8
  }
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
    console.log('\n--- Seeding Co-Curricular Activities ---');
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      console.error('Local public/images directory not found.');
      process.exit(1);
    }

    // Collect all unique image files
    const uniqueImages = new Set();
    defaults.forEach(item => {
      item.imageFiles.forEach(file => uniqueImages.add(file));
    });

    console.log(`Found ${uniqueImages.size} unique image files to upload.`);
    const urlMap = {};

    // Upload images to Storage
    for (const file of uniqueImages) {
      const localPath = path.join(imagesDir, file);
      if (!fs.existsSync(localPath)) {
        console.warn(`Warning: Local image file not found at ${localPath}`);
        continue;
      }
      const destPath = `cocurricular/${file}`;
      const url = await uploadFile(localPath, destPath, 'image/jpeg');
      urlMap[file] = url;
    }

    // Clear existing cocurricular collection in both databases
    console.log('\nClearing existing cocurricular collection in Firestore (both databases)...');
    for (const database of dbs) {
      const collection = database.collection('cocurricular');
      const snapshot = await collection.get();
      const batch = database.batch();
      snapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`Cleared Firestore database: ${database.databaseId || 'default'}`);
    }

    // Add seeded items with GCS URLs
    console.log('\nAdding items to Firestore...');
    for (const item of defaults) {
      const gcsUrls = item.imageFiles.map(file => urlMap[file] || `/images/${file}`);
      
      const payload = {
        title: item.title,
        content: item.content,
        order: item.order,
        images: gcsUrls,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      for (const database of dbs) {
        await database.collection('cocurricular').add(payload);
      }
      console.log(`Added: "${item.title}"`);
    }

    console.log('\nCo-curricular migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    // Clean up temporary credentials file
    if (fs.existsSync(tempCredPath)) {
      fs.unlinkSync(tempCredPath);
    }
  }
}

run();
