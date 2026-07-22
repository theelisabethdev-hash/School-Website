const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const { getFirestore } = require('firebase-admin/firestore');

admin.initializeApp();

const db = getFirestore('schooldb');
const bucket = admin.storage().bucket();

const app = express();

// Enable CORS
app.use(cors({ origin: true }));

// Strip /api prefix if present
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.substring(4);
  }
  next();
});

// Middleware to reconstruct request stream from req.rawBody for Multer/Busboy on GCP Cloud Functions
app.use((req, res, next) => {
  if (req.rawBody && req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    const { Readable } = require('stream');
    const customStream = new Readable();
    customStream.push(req.rawBody);
    customStream.push(null);
    
    req.on = customStream.on.bind(customStream);
    req.read = customStream.read.bind(customStream);
    req.pipe = customStream.pipe.bind(customStream);
    req.resume = customStream.resume.bind(customStream);
    req.unpipe = customStream.unpipe.bind(customStream);
    req.pause = customStream.pause.bind(customStream);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer to store uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper to upload a file to Firebase Storage and get public URL
async function uploadToStorage(file, folder = 'documents') {
  if (!file) return '';
  
  const uniqueName = `${folder}/${Date.now()}_${Math.floor(Math.random() * 10000)}_${file.originalname}`;
  const fileRef = bucket.file(uniqueName);
  
  await fileRef.save(file.buffer, {
    metadata: { contentType: file.mimetype },
    public: true
  });
  
  // Return the public URL
  return `https://storage.googleapis.com/${bucket.name}/${uniqueName}`;
}

// Middleware to verify Firebase Auth ID Token for admin routes
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
}

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

// 1. Get Banners
app.get('/banners', async (req, res) => {
  try {
    const snapshot = await db.collection('banners').orderBy('order', 'asc').get();
    const banners = [];
    snapshot.forEach(doc => {
      banners.push({ id: doc.id, ...doc.data() });
    });
    return res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. Get News & Notices
app.get('/news', async (req, res) => {
  try {
    const homepageOnly = req.query.homepage === '1';
    const query = db.collection('news').orderBy('doe1', 'desc');
    const snapshot = await query.get();
    let news = [];
    snapshot.forEach(doc => {
      news.push({ id: doc.id, ...doc.data() });
    });
    if (homepageOnly) {
      news = news.filter(item => item.home_page === '1');
    }
    return res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. Get Gallery Items
app.get('/gallery', async (req, res) => {
  try {
    const snapshot = await db.collection('gallery').get();
    const gallery = [];
    snapshot.forEach(doc => {
      gallery.push({ id: doc.id, ...doc.data() });
    });
    return res.json(gallery);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. Get Annual Events / Activities
app.get('/activities', async (req, res) => {
  try {
    const snapshot = await db.collection('activities').get();
    const activities = [];
    snapshot.forEach(doc => {
      activities.push({ id: doc.id, ...doc.data() });
    });
    return res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get Co-Curricular items (with auto-seeding if empty)
app.get('/cocurricular', async (req, res) => {
  try {
    const snapshot = await db.collection('cocurricular').orderBy('order', 'asc').get();
    let items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });

    if (items.length === 0) {
      // Seed default items
      const defaults = [
        {
          title: "Music (Indian and Western)",
          content: "It is an interesting medium to make students learn rhythm, melody, beats and lyrics. The school aims to nurture the love for music in students. This will probably help many children to tap their talent by providing them the right direction and encouragement.",
          images: [
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular101.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular102.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular103.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular104.jpg"
          ],
          order: 1
        },
        {
          title: "Art & Craft",
          content: "Art and Craft form an integral part of the curriculum. Art allows students to experiment with colours, paint their imagination and express their creativity. Similarly, craft enables students to indulge in brainstorming and come out with innovative ideas. This improves their fine motor coordination and they are able to produce best out of waste. The various activities done are collage making, paper tearing, cutting and pasting, sketching, compositions, calligraphy etc.",
          images: [
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular101.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular102.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular103.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular104.jpg"
          ],
          order: 2
        },
        {
          title: "Performing Arts",
          content: "Performing arts is the art of expressing one's emotions through expressions, dance, drama, plays, music and much more. It was started in school with an aim to help improve self confidence and communication skills in children. They get to explore different emotions through acts, stories etc. Performing arts help in overall development of students. It is all about self expression and embracing one's individuality. Children look forward to this fun filled experience.",
          images: [
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular202.jpg"
          ],
          order: 3
        },
        {
          title: "Taekwondo",
          content: "It is one of the most systematic and scientific Korean traditional martial arts that teaches more than just the physical fighting skills. It is a discipline that shows ways of enhancing our spirit, body and life through training our mind. It helps to inculcate self discipline in students as well as develop positive energy in them.",
          images: [
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular202.jpg"
          ],
          order: 4
        },
        {
          title: "Dance & Fitness",
          content: "It is a program specially designed to help students understand rhythm and develop flexibility. Music and movement enables them to develop large and fine motor coordination, eye hand coordination and strength. Not only do they learn different dance steps, they also learn to coordinate the right step with the right beat and be a part of the group. They also have fun while dancing as it is a stress buster.",
          images: [
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular301.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular302.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular303.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular304.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular320.jpg"
          ],
          order: 5
        },
        {
          title: "Games & Yoga",
          content: "The school has facilities for both indoor and outdoor games. The aim is to infuse positive aggression, team spirit as well as the spirit of never quiting. The students are trained in basketball, volleyball, badminton, table tennis, throw ball and kho-kho. Indoor games include ludo, carrom, chess etc. Yoga is the acknowledged exercise routine which ensures all round development of students. It improves concentration and focus. It brings discipline into their lives. The students do various asanas that keep them fit, agile and refreshed, thereby reducing anxiety and stress.",
          images: [
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular301.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular302.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular303.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular304.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/Curricular320.jpg"
          ],
          order: 6
        },
        {
          title: "Excursions & Educational Trips",
          content: "The school organizes meaningful educational trips as well as fun excursions in and around Delhi from time to time. The age of the children as well as the content that they are studying is taken into consideration while planning these trips. The children are also taken for plays, musical and dance events.",
          images: [
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/S101.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/S102.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/S103.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/S104.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/S105.jpg"
          ],
          order: 7
        },
        {
          title: "Workshops",
          content: "The school organizes workshops for both students and teachers from time to time.",
          images: [
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/S101.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/S102.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/S103.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/S104.jpg",
            "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/cocurricular/S105.jpg"
          ],
          order: 8
        }
      ];

      for (const item of defaults) {
        const docRef = await db.collection('cocurricular').add({
          ...item,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        items.push({ id: docRef.id, ...item });
      }

      items.sort((a, b) => a.order - b.order);
    }

    return res.json(items);
  } catch (error) {
    console.error('Error fetching co-curricular items:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get Facilities & Infrastructure items (with auto-seeding if empty)
app.get('/facilities', async (req, res) => {
  try {
    const snapshot = await db.collection('facilities').orderBy('order', 'asc').get();
    let items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });

    if (items.length === 0) {
      // Seed default items
      const defaults = [
        {
          title: "Computer Lab",
          content: "The computer lab has 20 systems for students to work on and a separate system for the teacher which is attached to a projector screen. This helps the teacher to demonstrate practical work to students. Emphasis is given on practical work so that the students are well versed with basics of computers.",
          images: [
            "/images/F101.jpg",
            "/images/F102.jpg",
            "/images/F103.jpg",
            "/images/F104.jpg",
            "/images/F106.jpg"
          ],
          order: 1
        },
        {
          title: "Library",
          content: "The school has a well equipped library with lot of reading material for children. There are course books, story books, journals and magazines for children to read.",
          images: [
            "/images/F101.jpg",
            "/images/F102.jpg",
            "/images/F103.jpg",
            "/images/F104.jpg",
            "/images/F106.jpg"
          ],
          order: 2
        },
        {
          title: "Infirmary",
          content: "The school has all medical facilities to help students in case of an emergency. The school has the provision for infirmary (separate medical room) where first aid is provided by a well trained full time nurse, who is available during school hours. The height and weight of all the students are checked from time to time.",
          images: [
            "/images/F201.jpg",
            "/images/F210.jpg",
            "/images/F211.jpg",
            "/images/F212.jpg",
            "/images/F213.jpg",
            "/images/F214.jpg",
            "/images/F215.jpg"
          ],
          order: 3
        },
        {
          title: "School Kitchen",
          content: "Freshly cooked wholesome food is served to children of nursery and KG as part of mid-day meal. The canteen facility is provided to children of classes I – V at a nominal cost. The meal is prepared in the school kitchen every morning. The hygiene factor is given prime importance while preparing and serving meals. Junk food is not served at all.",
          images: [
            "/images/F201.jpg",
            "/images/F210.jpg",
            "/images/F211.jpg",
            "/images/F212.jpg",
            "/images/F213.jpg",
            "/images/F214.jpg",
            "/images/F215.jpg"
          ],
          order: 4
        },
        {
          title: "Houses",
          content: "The children are introduced to the house system in class III. The four houses are JAL, AGNI, VAYU and PRITHVI. Many inter-house activities take place throughout the year. Children participate in them with great enthusiasm. Many of their talents including those of their house mistresses get highlighted during these presentations. The winners are suitably rewarded.",
          images: [],
          order: 5
        },
        {
          title: "Playground",
          content: "The school has a safe and spacious outdoor playground with swings, slides and spring rider equipment set on soft artificial turf. Children enjoy supervised playtime here, helping them build physical strength, coordination and social skills through active play.",
          images: [
            "/images/F301.jpg",
            "/images/F302.jpg",
            "/images/F303.jpg",
            "/images/F304.jpg",
            "/images/F305.jpg",
            "/images/F306.jpg",
            "/images/F307.jpg"
          ],
          order: 6
        }
      ];

      for (const item of defaults) {
        const docRef = await db.collection('facilities').add({
          ...item,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        items.push({ id: docRef.id, ...item });
      }

      items.sort((a, b) => a.order - b.order);
    }

    return res.json(items);
  } catch (error) {
    console.error('Error fetching facilities items:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get Shiv Niketan Society Items
app.get('/society', async (req, res) => {
  try {
    const snapshot = await db.collection('society').orderBy('timestamp', 'desc').get();
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return res.json(items);
  } catch (error) {
    console.error('Error fetching society items:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get School Timing
app.get('/school-timing', async (req, res) => {
  try {
    const doc = await db.collection('school_timing').doc('main').get();
    if (!doc.exists) {
      // Return default data if not yet set in Firestore
      return res.json({
        mainSchedule: 'Monday to Friday — 8:00 A.M. to 1:40 P.M.',
        officeHours: 'Office timing is from 8:00 A.M. to 1:40 P.M. hrs on all working days.',
        teacherMeeting: 'Parents can meet the teachers by communicating the reason in the almanac.',
        principalMeeting: 'Parents can meet the Principal by prior appointment only.',
        noteSession: 'The academic session starts in April and ends in March every year. The school closes for summer vacation from mid of May to the beginning of July.',
        noteDussehra: 'There is a short break in October during the Dussehra period and a winter break in December-January.',
        noteFee: 'Fee is to be paid for twelve months of the academic year.',
        faqs: [
          {
            question: "What are the school timings at The Elisabeth Gauba School?",
            answer: "Classes run Monday to Friday, 8:00 AM to 1:40 PM. Office hours are also 8:00 AM to 1:40 PM on all working days."
          },
          {
            question: "When can parents meet the teachers or the Principal?",
            answer: "Parents can meet teachers by noting the reason in the almanac. The Principal can be met by prior appointment only."
          },
          {
            question: "What are the term dates and holidays for the academic year?",
            answer: "The academic session runs from April to March. The school closes for summer vacation from mid-May to early July, with a short Dussehra break in October and a winter break in December–January."
          }
        ],
      });
    }
    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching school timing:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get vacancies
app.get('/vacancies', async (req, res) => {
  try {
    const snapshot = await db.collection('vacancies').get();
    const vacancies = [];
    snapshot.forEach(doc => {
      vacancies.push({ id: doc.id, ...doc.data() });
    });
    return res.json(vacancies);
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get staff members
app.get('/staff', async (req, res) => {
  try {
    const snapshot = await db.collection('staff').orderBy('order', 'asc').get();
    const staff = [];
    snapshot.forEach(doc => {
      staff.push({ id: doc.id, ...doc.data() });
    });
    return res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get staff carousel images
app.get('/staff/carousel', async (req, res) => {
  try {
    const snapshot = await db.collection('staff_carousel').orderBy('order', 'asc').get();
    const carousel = [];
    snapshot.forEach(doc => {
      carousel.push({ id: doc.id, ...doc.data() });
    });
    return res.json(carousel);
  } catch (error) {
    console.error('Error fetching staff carousel:', error);
    return res.status(500).json({ error: error.message });
  }
});


// Get Single News/Notice by ID
app.get('/news/:id', async (req, res) => {
  try {
    const doc = await db.collection('news').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'News not found' });
    }
    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching single news:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get Single Registration by ID (used for viewing submitted registration)
app.get('/registrations/:id', async (req, res) => {
  try {
    const doc = await db.collection('registrations').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching single registration:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 5. Submit Student Registration
app.post('/register', upload.fields([
  { name: 'payement_image', maxCount: 1 },
  { name: 'child_photo', maxCount: 1 },
  { name: 'child_cert', maxCount: 1 },
  { name: 'residence_proof', maxCount: 1 },
  { name: 'adhar_card', maxCount: 1 },
  { name: 'cert_copy', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;

    // Upload documents to Firebase Storage
    const uploadedDocs = {};
    if (files) {
      if (files.payement_image) uploadedDocs.payement_image = await uploadToStorage(files.payement_image[0], 'registrations');
      if (files.child_photo) uploadedDocs.child_photo = await uploadToStorage(files.child_photo[0], 'registrations');
      if (files.child_cert) uploadedDocs.child_cert = await uploadToStorage(files.child_cert[0], 'registrations');
      if (files.residence_proof) uploadedDocs.residence_proof = await uploadToStorage(files.residence_proof[0], 'registrations');
      if (files.adhar_card) uploadedDocs.adhar_card = await uploadToStorage(files.adhar_card[0], 'registrations');
      if (files.cert_copy) uploadedDocs.cert_copy = await uploadToStorage(files.cert_copy[0], 'registrations');
    }

    // Get incremental registration/student ID
    const statsRef = db.collection('settings').doc('registration_stats');
    let studId = '000001';
    
    await db.runTransaction(async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      let count = 1;
      if (statsDoc.exists) {
        count = (statsDoc.data().last_id || 0) + 1;
      }
      transaction.set(statsRef, { last_id: count }, { merge: true });
      studId = String(count).padStart(6, '0');
    });

    const registrationData = {
      stud_id: studId,
      today_date: new Date().toLocaleDateString('en-GB'),
      reg_class: data.reg_class || '',
      academic: data.academic || '',
      student_name: data.student_name || '',
      studdob: data.studdob || '',
      words_dob: data.words_dob || '',
      sex: data.sex || '',
      nationality: data.nationality || '',
      category: data.category || '',
      adhar_card_no: data.adhar_card_no || '',
      
      // Father Details
      father_name: data.father_name || '',
      father_profession: data.father_profession || '',
      job_transfer: data.job_transfer || '',
      f_designation: data.f_designation || '',
      f_address: data.f_address || '',
      fr_address: data.fr_address || '',
      f_telephone: data.f_telephone || '',
      fo_number: data.fo_number || '',
      f_mobile_no: data.f_mobile_no || '',
      f_mail_id: data.f_mail_id || '',
      
      // Mother Details
      m_name: data.m_name || '',
      m_profession: data.m_profession || '',
      m_transfer: data.m_transfer || '',
      m_designation: data.m_designation || '',
      mo_address: data.mo_address || '',
      mr_address: data.mr_address || '',
      m_telephone: data.m_telephone || '',
      mo_telephone: data.mo_telephone || '',
      mo_tongue: data.mo_tongue || '',
      m_mobile: data.m_mobile || '',
      m_email_id: data.m_email_id || '',
      
      // Guardian & Sibling Details
      g_name: data.g_name || '',
      g_relation: data.g_relation || '',
      g_profession: data.g_profession || '',
      g_transer: data.g_transer || '',
      go_address: data.go_address || '',
      gr_address: data.gr_address || '',
      g_telephone_no: data.g_telephone_no || '',
      go_telephone: data.go_telephone || '',
      g_mobile: data.g_mobile || '',
      g_mail_id: data.g_mail_id || '',
      g_designation: data.g_designation || '',
      
      single_parent: data.single_parent || '',
      special_child: data.special_child || '',
      special_child_details: data.special_child_details || '',
      sibling: data.sibling || '',
      sibling_name: data.sibling_name || '',
      sibling_section: data.sibling_section || '',
      
      // Schooling & Health Info
      last_school: data.last_school || '',
      last_school_name: data.last_school_name || '',
      last_school_address: data.last_school_address || '',
      alumni: data.alumni || '',
      sc_transport: data.sc_transport || '',
      blood_group: data.blood_group || '',
      health: data.health || '',
      illness: data.illness || '',
      medication: data.medication || '',
      allergy: data.allergy || '',
      allergy_specify: data.allergy_specify || '',
      guardian_name: data.guardian_name || '',
      guardian_type: data.guardian_type || '',
      student_name_under: data.student_name_under || '',

      // Payment Details
      per_name: data.per_name || '',
      per_email: data.per_email || '',
      per_mobile: data.per_mobile || '',
      trans_id: data.trans_id || '',
      per_date_time: data.per_date_time || '',
      
      // Uploaded Document Links
      documents: uploadedDocs,
      doe: new Date().toLocaleDateString('en-GB'),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('registrations').add(registrationData);
    
    return res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      id: docRef.id,
      stud_id: studId
    });
  } catch (error) {
    console.error('Error in student registration:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 6. Generic Form Submission (e.g. general contact/admission forms)
app.post('/submit', upload.fields([
  { name: 'payement_image', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'pdf_doc', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;

    const uploadedDocs = {};
    if (files) {
      if (files.payement_image) uploadedDocs.payement_image = await uploadToStorage(files.payement_image[0], 'submissions');
      if (files.document) uploadedDocs.document = await uploadToStorage(files.document[0], 'submissions');
      if (files.pdf_doc) uploadedDocs.pdf_doc = await uploadToStorage(files.pdf_doc[0], 'submissions');
    }

    const submissionData = {
      per_name: data.per_name || '',
      per_email: data.per_email || '',
      per_mobile: data.per_mobile || '',
      trans_id: data.trans_id || '',
      per_date_time: data.per_date_time || new Date().toISOString(),
      pdf_doc: uploadedDocs.pdf_doc || '',
      payement_image: uploadedDocs.payement_image || '',
      document: uploadedDocs.document || '',
      documents: uploadedDocs,
      doe: new Date().toLocaleDateString('en-GB'),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('submissions').add(submissionData);

    return res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      id: docRef.id
    });
  } catch (error) {
    console.error('Error in form submission:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 7. Save Contact Enquiry to Firestore (Email sending removed as per request)
app.post('/contact', async (req, res) => {
  try {
    const { name, email, mobile, subject, message } = req.body;

    // Always save to Firestore so admin can view it
    const contactData = {
      name: name || '',
      email: email || '',
      mobile: mobile || '',
      subject: subject || '',
      message: message || '',
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('contacts').add(contactData);

    return res.json({ success: true, message: 'Message received successfully' });
  } catch (error) {
    console.error('Error handling contact form:', error);
    return res.status(500).json({ error: 'Failed to process message: ' + error.message });
  }
});

// Get Academic Calendar
app.get('/academic-calendar', async (req, res) => {
  try {
    const doc = await db.collection('academic_calendar').doc('main').get();
    if (!doc.exists) {
      return res.json(null);
    }
    return res.json(doc.data());
  } catch (error) {
    console.error('Error fetching academic calendar:', error);
    return res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   ADMIN SECURE API ENDPOINTS (Require Authentication Middleware)
   ========================================================================== */

app.use('/admin', authMiddleware);

// Admin: Get All Registrations
app.get('/admin/registrations', authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('registrations').orderBy('timestamp', 'desc').get();
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Get All Contact Messages
app.get('/admin/contacts', async (req, res) => {
  try {
    const snapshot = await db.collection('contacts').orderBy('timestamp', 'desc').get();
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Mark Contact Message as Read
app.patch('/admin/contacts/:id/read', async (req, res) => {
  try {
    await db.collection('contacts').doc(req.params.id).update({ read: true });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Contact Message
app.delete('/admin/contacts/:id', async (req, res) => {
  try {
    await db.collection('contacts').doc(req.params.id).delete();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Add Vacancy
app.post('/admin/vacancies', async (req, res) => {
  try {
    const data = req.body;
    const vacancyData = {
      post: data.post || '',
      qualification: data.qualification || '',
      status: data.status || 'Open',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('vacancies').add(vacancyData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Update Vacancy
app.put('/admin/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updateData = {
      post: data.post || '',
      qualification: data.qualification || '',
      status: data.status || 'Open'
    };
    await db.collection('vacancies').doc(id).update(updateData);
    return res.json({ success: true, message: 'Vacancy updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Vacancy
app.delete('/admin/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('vacancies').doc(id).delete();
    return res.json({ success: true, message: 'Vacancy deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


// Admin: News CRUD
app.post('/admin/news', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = await uploadToStorage(req.file, 'notice');
    }

    const newsData = {
      title: data.title || '',
      title_url: (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      image: imageUrl,
      home_page: data.home_page || '0',
      doe1: data.doe1 || '',
      full_content: data.full_content || '',
      doe: new Date().toLocaleDateString('en-GB')
    };

    const docRef = await db.collection('news').add(newsData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/admin/news/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updateData = {
      title: data.title || '',
      title_url: (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      home_page: data.home_page || '0',
      doe1: data.doe1 || '',
      full_content: data.full_content || ''
    };

    if (req.file) {
      updateData.image = await uploadToStorage(req.file, 'notice');
    }

    await db.collection('news').doc(id).update(updateData);
    return res.json({ success: true, message: 'Notice updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/admin/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('news').doc(id).delete();
    return res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Banners CRUD
app.post('/admin/banners', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    const imageUrl = await uploadToStorage(req.file, 'banners');
    const bannerData = {
      image: imageUrl,
      title: req.body.title || '',
      order: parseInt(req.body.order || '0')
    };
    const docRef = await db.collection('banners').add(bannerData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/admin/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('banners').doc(id).delete();
    return res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Get all form submissions
app.get('/admin/submissions', authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('submissions').orderBy('timestamp', 'desc').get();
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Create Activity
app.post('/admin/activities', upload.array('images', 10), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || [];
    
    const imageUrls = [];
    for (const file of files) {
      const url = await uploadToStorage(file, 'activities');
      imageUrls.push(url);
    }
    
    const activityData = {
      title: data.title || '',
      content: data.content || '',
      images: imageUrls,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('activities').add(activityData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Update Activity
app.put('/admin/activities/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const files = req.files || [];
    
    const updateData = {
      title: data.title || '',
      content: data.content || ''
    };
    
    let existingImages = [];
    let hasExistingImagesField = false;
    if (data.existingImages !== undefined) {
      hasExistingImagesField = true;
      try {
        existingImages = JSON.parse(data.existingImages);
        if (!Array.isArray(existingImages)) {
          existingImages = [existingImages];
        }
      } catch (e) {
        existingImages = Array.isArray(data.existingImages) ? data.existingImages : [data.existingImages].filter(Boolean);
      }
    }
    
    const newImageUrls = [];
    if (files.length > 0) {
      for (const file of files) {
        const url = await uploadToStorage(file, 'activities');
        newImageUrls.push(url);
      }
    }
    
    if (hasExistingImagesField) {
      updateData.images = [...existingImages, ...newImageUrls];
    } else if (files.length > 0) {
      updateData.images = newImageUrls;
    }
    
    await db.collection('activities').doc(id).update(updateData);
    return res.json({ success: true, message: 'Activity updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Activity
app.delete('/admin/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('activities').doc(id).delete();
    return res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Create Co-Curricular Item
app.post('/admin/cocurricular', upload.array('images', 10), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || [];
    
    const imageUrls = [];
    for (const file of files) {
      const url = await uploadToStorage(file, 'cocurricular');
      imageUrls.push(url);
    }
    
    const itemData = {
      title: data.title || '',
      content: data.content || '',
      order: parseInt(data.order || '0'),
      images: imageUrls,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('cocurricular').add(itemData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Update Co-Curricular Item
app.put('/admin/cocurricular/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const files = req.files || [];
    
    const updateData = {
      title: data.title || '',
      content: data.content || '',
      order: parseInt(data.order || '0')
    };
    
    let existingImages = [];
    let hasExistingImagesField = false;
    if (data.existingImages !== undefined) {
      hasExistingImagesField = true;
      try {
        existingImages = JSON.parse(data.existingImages);
        if (!Array.isArray(existingImages)) {
          existingImages = [existingImages];
        }
      } catch (e) {
        existingImages = Array.isArray(data.existingImages) ? data.existingImages : [data.existingImages].filter(Boolean);
      }
    }
    
    const newImageUrls = [];
    if (files.length > 0) {
      for (const file of files) {
        const url = await uploadToStorage(file, 'cocurricular');
        newImageUrls.push(url);
      }
    }
    
    if (hasExistingImagesField) {
      updateData.images = [...existingImages, ...newImageUrls];
    } else if (files.length > 0) {
      updateData.images = newImageUrls;
    }
    
    await db.collection('cocurricular').doc(id).update(updateData);
    return res.json({ success: true, message: 'Co-Curricular item updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Co-Curricular Item
app.delete('/admin/cocurricular/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('cocurricular').doc(id).delete();
    return res.json({ success: true, message: 'Co-Curricular item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Create Facilities Item
app.post('/admin/facilities', upload.array('images', 10), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || [];
    
    const imageUrls = [];
    for (const file of files) {
      const url = await uploadToStorage(file, 'facilities');
      imageUrls.push(url);
    }
    
    const itemData = {
      title: data.title || '',
      content: data.content || '',
      order: parseInt(data.order || '0'),
      images: imageUrls,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('facilities').add(itemData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Update Facilities Item
app.put('/admin/facilities/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const files = req.files || [];
    
    const updateData = {
      title: data.title || '',
      content: data.content || '',
      order: parseInt(data.order || '0')
    };
    
    let existingImages = [];
    let hasExistingImagesField = false;
    if (data.existingImages !== undefined) {
      hasExistingImagesField = true;
      try {
        existingImages = JSON.parse(data.existingImages);
        if (!Array.isArray(existingImages)) {
          existingImages = [existingImages];
        }
      } catch (e) {
        existingImages = Array.isArray(data.existingImages) ? data.existingImages : [data.existingImages].filter(Boolean);
      }
    }
    
    const newImageUrls = [];
    if (files.length > 0) {
      for (const file of files) {
        const url = await uploadToStorage(file, 'facilities');
        newImageUrls.push(url);
      }
    }
    
    if (hasExistingImagesField) {
      updateData.images = [...existingImages, ...newImageUrls];
    } else if (files.length > 0) {
      updateData.images = newImageUrls;
    }
    
    await db.collection('facilities').doc(id).update(updateData);
    return res.json({ success: true, message: 'Facilities item updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Facilities Item
app.delete('/admin/facilities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('facilities').doc(id).delete();
    return res.json({ success: true, message: 'Facilities item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Update School Timing
app.put('/admin/school-timing', async (req, res) => {
  try {
    const data = req.body;
    const timingData = {
      mainSchedule: data.mainSchedule || '',
      officeHours: data.officeHours || '',
      teacherMeeting: data.teacherMeeting || '',
      principalMeeting: data.principalMeeting || '',
      noteSession: data.noteSession || '',
      noteDussehra: data.noteDussehra || '',
      noteFee: data.noteFee || '',
      faqs: Array.isArray(data.faqs) ? data.faqs : [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('school_timing').doc('main').set(timingData, { merge: true });
    return res.json({ success: true, message: 'School timing updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Create Shiv Niketan Society Item
app.post('/admin/society', upload.array('files', 10), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || [];
    
    const type = data.type || 'category'; // 'category' or 'document'
    const name = data.name || '';
    
    if (type === 'category') {
      const imageUrls = [];
      for (const file of files) {
        const url = await uploadToStorage(file, 'society/photos');
        imageUrls.push(url);
      }
      
      const societyData = {
        type,
        name,
        images: imageUrls,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await db.collection('society').add(societyData);
      return res.status(201).json({ success: true, id: docRef.id });
    } else {
      // Document upload
      if (files.length === 0) {
        return res.status(400).json({ error: 'Document file is required' });
      }
      const file = files[0];
      const url = await uploadToStorage(file, 'society/files');
      
      const bytes = file.size;
      const sizeLabel = bytes > 1024 * 1024 
        ? `${(bytes / 1024 / 1024).toFixed(1)} MB` 
        : `${Math.ceil(bytes / 1024)} KB`;
        
      const societyData = {
        type,
        name,
        url,
        sizeLabel,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await db.collection('society').add(societyData);
      return res.status(201).json({ success: true, id: docRef.id });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Update Shiv Niketan Society Item
app.put('/admin/society/:id', upload.array('files', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const files = req.files || [];
    
    const type = data.type || 'category';
    const name = data.name || '';
    
    const updateData = {
      name
    };
    
    if (type === 'category') {
      if (files.length > 0) {
        const imageUrls = [];
        for (const file of files) {
          const url = await uploadToStorage(file, 'society/photos');
          imageUrls.push(url);
        }
        updateData.images = imageUrls;
      }
    } else {
      // Document
      if (files.length > 0) {
        const file = files[0];
        const url = await uploadToStorage(file, 'society/files');
        const bytes = file.size;
        const sizeLabel = bytes > 1024 * 1024 
          ? `${(bytes / 1024 / 1024).toFixed(1)} MB` 
          : `${Math.ceil(bytes / 1024)} KB`;
          
        updateData.url = url;
        updateData.sizeLabel = sizeLabel;
      }
    }
    
    await db.collection('society').doc(id).update(updateData);
    return res.json({ success: true, message: 'Society item updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Shiv Niketan Society Item
app.delete('/admin/society/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('society').doc(id).delete();
    return res.json({ success: true, message: 'Society item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Create Gallery Section
app.post('/admin/gallery', upload.array('images', 20), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || [];
    const names = JSON.parse(data.imageNames || '[]');
    
    const images = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadToStorage(files[i], 'gallery');
      images.push({
        image: url,
        name: names[i] || files[i].originalname
      });
    }
    
    const galleryData = {
      title: data.title || '',
      category: data.category || '',
      images: images,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('gallery').add(galleryData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Gallery Section
app.delete('/admin/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('gallery').doc(id).delete();
    return res.json({ success: true, message: 'Gallery deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Update Gallery Section
app.put('/admin/gallery/:id', upload.array('images', 20), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const files = req.files || [];
    const names = JSON.parse(data.imageNames || '[]');

    const updateData = {
      title: data.title || '',
      category: data.category || ''
    };

    if (files.length > 0) {
      const newImages = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadToStorage(files[i], 'gallery');
        newImages.push({
          image: url,
          name: names[i] || files[i].originalname
        });
      }

      if (data.appendImages === 'true') {
        const doc = await db.collection('gallery').doc(id).get();
        const existingImages = doc.exists ? (doc.data().images || []) : [];
        updateData.images = [...existingImages, ...newImages];
      } else {
        updateData.images = newImages;
      }
    } else if (data.existingImagesJson) {
      updateData.images = JSON.parse(data.existingImagesJson);
    }

    await db.collection('gallery').doc(id).update(updateData);
    return res.json({ success: true, message: 'Gallery updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Get all Newsletters
app.get('/admin/newsletters', async (req, res) => {
  try {
    const snapshot = await db.collection('newsletters').orderBy('timestamp', 'desc').get();
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Create Newsletter
app.post('/admin/newsletters', async (req, res) => {
  try {
    const data = req.body;
    const newsletterData = {
      title: data.title || '',
      subtitle: data.subtitle || '',
      content: data.content || '',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('newsletters').add(newsletterData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Newsletter
app.delete('/admin/newsletters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('newsletters').doc(id).delete();
    return res.json({ success: true, message: 'Newsletter deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Get all members
app.get('/admin/members', async (req, res) => {
  try {
    const snapshot = await db.collection('members').orderBy('timestamp', 'desc').get();
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Create Member
app.post('/admin/members', async (req, res) => {
  try {
    const data = req.body;
    const memberData = {
      applicantname: data.applicantname || '',
      email: data.email || '',
      contact: data.contact || '',
      status: data.status || 'Active',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('members').add(memberData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Member
app.delete('/admin/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('members').doc(id).delete();
    return res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Create Staff Member
app.post('/admin/staff', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToStorage(req.file, 'staff');
    }
    const staffData = {
      name: data.name || '',
      title: data.title || '',
      role: data.role || '',
      image: imageUrl,
      order: parseInt(data.order || '0'),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('staff').add(staffData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Update Staff Member
app.put('/admin/staff/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updateData = {
      name: data.name || '',
      title: data.title || '',
      role: data.role || '',
      order: parseInt(data.order || '0')
    };

    if (data.deleteImage === 'true') {
      updateData.image = '';
    } else if (req.file) {
      updateData.image = await uploadToStorage(req.file, 'staff');
    }

    await db.collection('staff').doc(id).update(updateData);
    return res.json({ success: true, message: 'Staff member updated successfully' });
  } catch (error) {
    console.error('Error updating staff member:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Staff Member
app.delete('/admin/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('staff').doc(id).delete();
    return res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Upload Staff Carousel Image
app.post('/admin/staff/carousel', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    const imageUrl = await uploadToStorage(req.file, 'staff/carousel');
    const carouselData = {
      image: imageUrl,
      order: parseInt(req.body.order || '0'),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('staff_carousel').add(carouselData);
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error uploading staff carousel image:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Staff Carousel Image
app.delete('/admin/staff/carousel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('staff_carousel').doc(id).delete();
    return res.json({ success: true, message: 'Staff carousel image deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff carousel image:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Upload Academic Calendar
app.post('/admin/academic-calendar', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }
    
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    
    // Get existing document to delete old file
    const docRef = db.collection('academic_calendar').doc('main');
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      if (data.storagePath) {
        try {
          await bucket.file(data.storagePath).delete();
        } catch (err) {
          console.error('Failed to delete old academic calendar file:', err);
        }
      }
    }
    
    // Upload new file
    const folder = 'academic-calendar';
    const uniqueName = `${folder}/${Date.now()}_${req.file.originalname}`;
    const fileRef = bucket.file(uniqueName);
    
    await fileRef.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
      public: true
    });
    
    const pdfUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueName}`;
    
    const calendarData = {
      pdfUrl,
      storagePath: uniqueName,
      fileName: req.file.originalname,
      updatedAt: new Date().toISOString()
    };
    
    await docRef.set(calendarData);
    
    return res.status(200).json({ success: true, calendar: calendarData });
  } catch (error) {
    console.error('Error uploading academic calendar:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Academic Calendar
app.delete('/admin/academic-calendar', async (req, res) => {
  try {
    const docRef = db.collection('academic_calendar').doc('main');
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      if (data.storagePath) {
        try {
          await bucket.file(data.storagePath).delete();
        } catch (err) {
          console.error('Failed to delete academic calendar file:', err);
        }
      }
      await docRef.delete();
    }
    return res.json({ success: true, message: 'Academic calendar deleted successfully' });
  } catch (error) {
    console.error('Error deleting academic calendar:', error);
    return res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   PHP COMPATIBILITY WRAPPERS (Enables existing AJAX calls to work out-of-the-box)
   ========================================================================== */

// Helper to parse filename into prefix and numeric index
function parseFilename(filename) {
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  
  // 1. Check for year + index: e.g., Dussehra20211 -> Dussehra2021, 1; IDay202110 -> IDay2021, 10
  const yearMatch = nameWithoutExt.match(/^(.+?202\d)(\d+)$/);
  if (yearMatch) {
    return {
      prefix: yearMatch[1],
      index: parseInt(yearMatch[2], 10)
    };
  }
  
  // 2. Check for 1xx/2xx index: e.g., AnnualDay101 -> AnnualDay, 101
  const hundredMatch = nameWithoutExt.match(/^(.+?)(1\d\d|2\d\d)$/);
  if (hundredMatch) {
    return {
      prefix: hundredMatch[1],
      index: parseInt(hundredMatch[2], 10)
    };
  }
  
  // 3. Fallback: split by trailing digits
  const fallbackMatch = nameWithoutExt.match(/^(.+?)(\d+)$/);
  if (fallbackMatch) {
    return {
      prefix: fallbackMatch[1],
      index: parseInt(fallbackMatch[2], 10)
    };
  }
  
  return {
    prefix: nameWithoutExt,
    index: 0
  };
}

// Helper to get friendly album title from prefix
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
  
  if (mappings[prefix]) {
    return mappings[prefix];
  }
  
  return prefix
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/(\d+)/g, ' $1')
    .trim();
}

// 1. banner.php
app.get('/banner.php', async (req, res) => {
  try {
    let banners = [];
    
    // Check if local banner directory exists and has files
    const bannerDir = path.join(__dirname, '../public/banner');
    if (fs.existsSync(bannerDir)) {
      try {
        const files = fs.readdirSync(bannerDir)
          .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        
        banners = files.map((file, index) => ({
          image: `/banner/${file}`,
          title: '',
          order: index
        }));
      } catch (err) {
        console.error('Error reading local banner directory:', err);
      }
    }
    
    // Fall back to Firestore if no local banners found
    if (banners.length === 0) {
      const snapshot = await db.collection('banners').orderBy('order', 'asc').get();
      snapshot.forEach(doc => {
        const data = doc.data();
        banners.push({
          image: data.image || '',
          title: data.title || '',
          order: data.order || 0
        });
      });
    }

    let indicators = '<ol class="carousel-indicators">\n';
    let inner = '<div class="carousel-inner">\n';
    
    let count = 0;
    banners.forEach(banner => {
      const activeClass = count === 0 ? 'active' : '';
      indicators += `    <li data-target="#bs-carousel" data-slide-to="${count}" class="${activeClass}"></li>\n`;
      inner += `    <div class="item slides ${activeClass}">
      <div class="slide-1" style="background-image: url('${banner.image}'); height:100% !important; background-size: cover;background-position: center center;background-repeat: no-repeat;"></div>
      <div class="hero">
        <hgroup>
        <h2>${banner.title}</h2>
        </hgroup>
      </div>
    </div>\n`;
      count++;
    });
    
    indicators += '  </ol>\n';
    inner += '  </div>\n';
    
    return res.send(indicators + '\n' + inner);
  } catch (error) {
    console.error('Error in banner.php wrapper:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

// 2. home_notice.php
app.get('/home_notice.php', async (req, res) => {
  try {
    const snapshot = await db.collection('news').where('home_page', '==', '1').get();
    let html = `<marquee style="height: 245px;" loop="infinite" behavior="scroll" onmouseover="this.stop()" onmouseout="this.start()" direction="up" specialeffect="blinking" scrolldelay="80">\n`;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      html += `                                    <div>
                                                    <div class="ideaboxNews in-easing in-relative" id="idx1" style="max-width: 100%;">
                                                        <ul class="mCustomScrollbar _mCS_1 mCS-autoHide" style="overflow: visible;">
                                                            <li>
                                                            <div class="in-image">
                                                                    <div class="tt-b-day rem-border ">
                                                                        <span id="MainContent_dgvNews_Label2_2">${data.doe1 || ''}</span>
                                                                    </div>
                                                            </div>
                                                                <div class="in-content">
                                                                    <a style="color: #000000;" href="NewsDetails.php?news_id=${doc.id}">
                                                                        <span id="MainContent_dgvNews_Label1_0">${data.title || ''}</span></a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
</div>\n`;
    });
    
    html += `                               </marquee>\n`;
    return res.send(html);
  } catch (error) {
    console.error('Error in home_notice.php wrapper:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

// 3. home_gallery.php
app.get('/home_gallery.php', async (req, res) => {
  try {
    let imagesForHome = [];
    
    // Check if local gallery directory exists and has files
    const gallaryDir = path.join(__dirname, '../public/Gallary');
    if (fs.existsSync(gallaryDir)) {
      try {
        const files = fs.readdirSync(gallaryDir)
          .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
        
        // Group files by prefix
        const groups = {};
        files.forEach(file => {
          const parsed = parseFilename(file);
          if (!groups[parsed.prefix]) {
            groups[parsed.prefix] = [];
          }
          groups[parsed.prefix].push({
            image: `/Gallary/${file}`,
            index: parsed.index
          });
        });
        
        // Sort prefixes and pick the first image of the first 5 groups
        const prefixes = Object.keys(groups).sort();
        const selectedPrefixes = prefixes.slice(0, 5);
        selectedPrefixes.forEach(prefix => {
          const sortedImgs = groups[prefix].sort((a, b) => a.index - b.index);
          if (sortedImgs.length > 0) {
            imagesForHome.push(sortedImgs[0].image);
          }
        });
      } catch (err) {
        console.error('Error reading local gallery for home:', err);
      }
    }
    
    // Fall back to Firestore if no local images found
    if (imagesForHome.length === 0) {
      const snapshot = await db.collection('gallery').limit(5).get();
      snapshot.forEach(doc => {
        const data = doc.data();
        const images = data.images || [];
        if (images.length > 0) {
          imagesForHome.push(images[0].image);
        }
      });
    }

    let html = `                <div class="major-caousel js-carousel-1 owl-carousel">\n`;
    imagesForHome.forEach(imgUrl => {
      html += `                    <div class="media d-block media-custom text-center">
                        <img src="${imgUrl}" alt="Image Placeholder" style="height:250px;" class="img-fluid">
                    </div>\n`;
    });
    
    html += `                </div>
 <script src="js/Gallery/owl.carousel.min.js"></script>
    <script src="js/Gallery/main.js"></script>\n`;
    return res.send(html);
  } catch (error) {
    console.error('Error in home_gallery.php wrapper:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

// 4. gallery.php
app.get('/gallery.php', async (req, res) => {
  try {
    let galleryData = [];
    
    // Check if local gallery directory exists and has files
    const gallaryDir = path.join(__dirname, '../public/Gallary');
    if (fs.existsSync(gallaryDir)) {
      try {
        const files = fs.readdirSync(gallaryDir)
          .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
        
        // Group by prefix
        const groups = {};
        files.forEach(file => {
          const parsed = parseFilename(file);
          if (!groups[parsed.prefix]) {
            groups[parsed.prefix] = [];
          }
          groups[parsed.prefix].push({
            image: `/Gallary/${file}`,
            name: parsed.prefix + ' - Image ' + parsed.index,
            index: parsed.index
          });
        });
        
        // Convert to array of albums and sort
        const albums = Object.keys(groups).map(prefix => {
          const images = groups[prefix].sort((a, b) => a.index - b.index);
          return {
            id: prefix,
            title: getFriendlyTitle(prefix),
            images: images
          };
        });
        
        // Sort albums by title
        albums.sort((a, b) => a.title.localeCompare(b.title));
        galleryData = albums;
      } catch (err) {
        console.error('Error reading local gallery directory:', err);
      }
    }
    
    // Fall back to Firestore if no local gallery data found
    if (galleryData.length === 0) {
      const snapshot = await db.collection('gallery').get();
      snapshot.forEach(doc => {
        const data = doc.data();
        galleryData.push({
          id: doc.id,
          title: data.title || '',
          images: data.images || []
        });
      });
    }

    let html = `<div class="popular-section-wthree">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                   <h2 class="Main_header">Our Photo Gallery</h2>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="w3ls_gallery_grids">
                        <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">\n`;
    
    galleryData.forEach(album => {
      const id = album.id;
      html += `                            <div class="panel panel-default">
                                <div class="panel-heading" role="tab" id="heading${id}">
                                    <h4 class="panel-title">
                                        <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse${id}"
                                            aria-expanded="true" aria-controls="collapse${id}">${album.title}</a>
                                    </h4>
                                </div>
                                <div id="collapse${id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading${id}">
                                    <div class="panel-body">\n`;
      
      const images = album.images || [];
      images.forEach(img => {
        html += `                                                <div class="w3_agile_gallery_grid col-md-4">
                                                    <div class="agile_gallery_grid">
                                                        <a href="${img.image || ''}">
                                                            <div class="agile_gallery_grid1">
                                                                <img src="${img.image || ''}" alt=" " class="img-responsive" />
                                                                <div class="w3layouts_gallery_grid1_pos">
                                                                </div>
                                                            </div>
                                                        </a>
                                                        <h4 style="text-align: center">${img.name || ''}</h4>
                                                    </div>
                                                </div>\n`;
      });
      
      html += `                                    </div>
                                </div>
                            </div>\n`;
    });
    
    html += `                        </div>
                    </div>
                </div>
            </div>
            <div class="clearfix"></div>
        </div>
    </div>
     <script>
        $('.w3_agile_gallery_grid a').simpleLightbox();
    </script>\n`;
    return res.send(html);
  } catch (error) {
    console.error('Error in gallery.php wrapper:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

// 5. news.php
app.get('/news.php', async (req, res) => {
  try {
    const snapshot = await db.collection('news').orderBy('doe1', 'desc').get();
    let html = `<style>
table { width:100%; padding:10px; }
table tr th { padding:10px; }
table tr td { padding:10px; }
</style>
<div class="popular-section-wthree">
        <div class="container">
            <div class="wthree-heading">
                <h2 class="Main_header">Notices</h2>
            </div>
            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <div class="bs-docs-example">
                        <table class="table" style="width:100%; border-radius:15px!important;" border="0" >
                            <tbody>
                                <tr>
                                    <td>
                                        <div>
	<table cellspacing="0" id="MainContent_dgvNews" style="border-style:None;width:100%;border-collapse:collapse;">\n`;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      html += `		<tr>
			<td>
                                                    <span id="MainContent_dgvNews_lblNewsDate_0">${data.doe1 || ''}</span>
                                                </td><td>&nbsp;</td><td>
                                                    <span id="MainContent_dgvNews_lblNewTitle_0"><a href="NewsDetails.php?news_id=${doc.id}">${data.title || ''}</a></span>
                                                </td><td>
                                                </td>
		</tr>\n`;
    });
    
    html += `	</table>
</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="col-md-1"></div>
            </div>
        </div>
        <div class="clearfix"></div>
    </div>\n`;
    return res.send(html);
  } catch (error) {
    console.error('Error in news.php wrapper:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

// 6. AnualEvents.php
app.get('/AnualEvents.php', async (req, res) => {
  try {
    const snapshot = await db.collection('activities').get();
    let html = `<div class="popular-section-wthree">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                   <h2 class="Main_header">Activities</h2>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="w3ls_gallery_grids">
                        <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">\n`;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const id = doc.id;
      html += `                            <div class="panel panel-default">
                                <div class="panel-heading" role="tab" id="headingAct${id}">
                                    <h4 class="panel-title">
                                        <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseAct${id}"
                                            aria-expanded="true" aria-controls="collapseAct${id}">${data.title || ''}</a>
                                    </h4>
                                </div>
                                <div id="collapseAct${id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingAct${id}">
                                    <div class="panel-body">
											 <div class="w3_agile_gallery_grid">
                                                        ${data.content || ''}
                                                     </div>\n`;
      
      const images = data.images || [];
      images.forEach(imgUrl => {
        html += `                                                    <div class="col-md-4 w3_agile_gallery_grid">
                                                        <div class="agile_gallery_grid">
                                                            <a href="${imgUrl}">
                                                                <div class="agile_gallery_grid1">
                                                                    <img src="${imgUrl}" style="height:250px; width:100%;"  alt=" " class="img-responsive" />
                                                                    <div class="w3layouts_gallery_grid1_pos">
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        </div>
                                                    </div>\n`;
      });
      
      html += `                                    </div>
                                </div>
                            </div>\n`;
    });
    
    html += `                        </div>
                    </div>
                </div>
            </div>
            <div class="clearfix"></div>
        </div>
    </div>
    <script>
        $('.w3_agile_gallery_grid a').simpleLightbox();
    </script>\n`;
    return res.send(html);
  } catch (error) {
    console.error('Error in AnualEvents.php wrapper:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

// 7. contact_email.php
app.post('/contact_email.php', async (req, res) => {
  try {
    const { name, phone, email, c_address } = req.body;
    
    const mailConfigDoc = await db.collection('settings').doc('mail_config').get();
    let transporter;
    
    if (mailConfigDoc.exists) {
      const config = mailConfigDoc.data();
      transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass
        }
      });
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      });
    }

    const htmlBody = `<h1> Name : ${name} </h1>
<h1>Phone Number : ${phone} </h1>
<h1>Email : ${email} </h1>
<h1>Address : ${c_address} </h1>`;

    const mailOptions = {
      from: 'theelis1@theelisabethgaubaschool.com',
      to: 'theelisabethgaubaschool@gmail.com',
      replyTo: email,
      subject: 'Enquiry Mail From theelisabethgaubaschool',
      html: htmlBody
    };

    await transporter.sendMail(mailOptions);
    return res.send('success');
  } catch (error) {
    console.error('Error in contact_email.php wrapper:', error);
    return res.send('Mailer Error: ' + error.message);
  }
});

// 8. registeration.php (Student registration submit)
app.post('/registeration.php', upload.fields([
  { name: 'payement_image', maxCount: 1 },
  { name: 'child_photo', maxCount: 1 },
  { name: 'child_cert', maxCount: 1 },
  { name: 'residence_proof', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;

    const uploadedDocs = {};
    if (files) {
      if (files.payement_image) uploadedDocs.payement_image = await uploadToStorage(files.payement_image[0], 'registrations');
      if (files.child_photo) uploadedDocs.child_photo = await uploadToStorage(files.child_photo[0], 'registrations');
      if (files.child_cert) uploadedDocs.child_cert = await uploadToStorage(files.child_cert[0], 'registrations');
      if (files.residence_proof) uploadedDocs.residence_proof = await uploadToStorage(files.residence_proof[0], 'registrations');
    }

    const statsRef = db.collection('settings').doc('registration_stats');
    let studId = '000001';
    
    await db.runTransaction(async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      let count = 1;
      if (statsDoc.exists) {
        count = (statsDoc.data().last_id || 0) + 1;
      }
      transaction.set(statsRef, { last_id: count }, { merge: true });
      studId = String(count).padStart(6, '0');
    });

    const registrationData = {
      stud_id: studId,
      today_date: new Date().toLocaleDateString('en-GB'),
      reg_class: data.reg_class || '',
      academic: data.academic || '',
      student_name: data.student_name || '',
      studdob: data.studdob || '',
      words_dob: data.words_dob || '',
      sex: data.sex || '',
      nationality: data.nationality || '',
      category: data.category || '',
      adhar_card_no: data.adhar_card_no || '',
      
      father_name: data.father_name || '',
      father_profession: data.father_profession || '',
      job_transfer: data.job_transfer || '',
      f_designation: data.f_designation || '',
      f_address: data.f_address || '',
      fr_address: data.fr_address || '',
      f_telephone: data.f_telephone || '',
      fo_number: data.fo_number || '',
      f_mobile_no: data.f_mobile_no || '',
      f_mail_id: data.f_mail_id || '',
      
      m_name: data.m_name || '',
      m_profession: data.m_profession || '',
      m_transfer: data.m_transfer || '',
      m_designation: data.m_designation || '',
      mo_address: data.mo_address || '',
      mr_address: data.mr_address || '',
      m_telephone: data.m_telephone || '',
      mo_telephone: data.mo_telephone || '',
      mo_tongue: data.mo_tongue || '',
      m_mobile: data.m_mobile || '',
      m_email_id: data.m_email_id || '',
      
      g_name: data.g_name || '',
      g_relation: data.g_relation || '',
      g_profession: data.g_profession || '',
      g_transer: data.g_transer || '',
      go_address: data.go_address || '',
      gr_address: data.gr_address || '',
      g_telephone_no: data.g_telephone_no || '',
      go_telephone: data.go_telephone || '',
      g_mobile: data.g_mobile || '',
      g_mail_id: data.g_mail_id || '',
      g_designation: data.g_designation || '',
      
      single_parent: data.single_parent || '',
      special_child: data.special_child || '',
      special_child_details: data.special_child_details || '',
      sibling: data.sibling || '',
      sibling_name: data.sibling_name || '',
      sibling_section: data.sibling_section || '',
      
      last_school: data.last_school || '',
      last_school_name: data.last_school_name || '',
      last_school_address: data.last_school_address || '',
      alumni: data.alumni || '',
      sc_transport: data.sc_transport || '',
      blood_group: data.blood_group || '',
      health: data.health || '',
      illness: data.illness || '',
      medication: data.medication || '',
      allergy: data.allergy || '',
      allergy_specify: data.allergy_specify || '',
      guardian_name: data.guardian_name || '',
      guardian_type: data.guardian_type || '',
      student_name_under: data.student_name_under || '',
      
      documents: uploadedDocs,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('registrations').add(registrationData);
    return res.redirect(`success.php?registraion=${docRef.id}`);
  } catch (error) {
    console.error('Error in registeration.php wrapper:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

// 9. success.php
app.get('/success.php', (req, res) => {
  const registraionId = req.query.registraion || '';
  const html = `<link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<div class="container">
    <div class="row" style="margin-top: 50px;">
        <div class="col-md-6 offset-md-3">
            <div class="card">
                <div class="card-body text-center" style="padding: 40px 20px;">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" style="width: 80px; height: 80px; margin: 0 auto 20px; display: block;">
								<circle cx="26" cy="26" r="25" fill="none" stroke="#28a745" stroke-width="2"/>
								<path fill="none" stroke="#28a745" stroke-width="3" d="M14 27l8 8 16-16" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<h1>Thank You!</h1>
							<p style="font-size: 16px; margin: 15px 0;">Your form submission is received and we will contact you soon</p>
							<h3 class="cupon-pop" style="font-size: 18px; margin-bottom: 10px;"><a href="index.html" class="btn btn-primary btn-block">Back To Home Page</a></h3>
							${registraionId ? `<h3 class="cupon-pop" style="font-size: 18px;"><a href="show_registration.php?registraion=${registraionId}" class="btn btn-outline-secondary btn-block">View Submitted Form</a></h3>` : ''}
						</div>
                </div>
            </div>
        </div>
    </div>
</div>`;
  return res.send(html);
});

// 10. submission.php (Generic submission)
app.post('/submission.php', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    let paymentImgUrl = '';
    
    if (req.file) {
      paymentImgUrl = await uploadToStorage(req.file, 'submissions');
    }

    const submissionData = {
      per_name: data.per_name || '',
      per_email: data.per_email || '',
      per_mobile: data.per_mobile || '',
      payement_image: paymentImgUrl,
      per_date_time: data.per_date_time || new Date().toISOString(),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('submissions').add(submissionData);
    return res.send("<b style='color:#61c100;'>Added Form Submission Successfully</b>");
  } catch (error) {
    console.error('Error in submission.php wrapper:', error);
    return res.send("<b style='color:#d70000;'>Problem in Adding Form Submission</b>");
  }
});

// Helper to render form_submission.php with optional message
function renderFormSubmission(msg = '') {
  const templatePath = path.join(__dirname, 'templates/form_submission.php');
  if (!fs.existsSync(templatePath)) {
    return 'Template file not found.';
  }
  let html = fs.readFileSync(templatePath, 'utf8');
  // Remove top PHP logic block
  html = html.replace(/<\?php[\s\S]*?if\(isset\(\$_POST\['submit'\]\)\)[\s\S]*?\?>/i, '');
  // Replace message block
  const msgHtml = msg ? msg : '';
  html = html.replace(/<\?php\s+if\(!empty\(\$msg\)\)\s*\{[\s\S]*?echo\s+\$msg;[\s\S]*?\}\s*\?>/gi, msgHtml);
  return html;
}

// 11. form_submission.php (GET)
app.get('/form_submission.php', (req, res) => {
  const html = renderFormSubmission();
  return res.send(html);
});

// 11. form_submission.php (POST)
app.post('/form_submission.php', upload.fields([
  { name: 'pdf_doc', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]), async (req, res) => {
  let msg = '';
  try {
    const data = req.body;
    const files = req.files;
    
    const uploadedDocs = {};
    if (files) {
      if (files.pdf_doc) uploadedDocs.pdf_doc = await uploadToStorage(files.pdf_doc[0], 'submissions');
      if (files.image) uploadedDocs.payement_image = await uploadToStorage(files.image[0], 'submissions');
      if (files.document) uploadedDocs.document = await uploadToStorage(files.document[0], 'submissions');
    }

    const submissionData = {
      per_name: data.per_name || '',
      per_email: data.per_email || '',
      per_mobile: data.per_mobile || '',
      trans_id: data.trans_id || '',
      per_date_time: data.per_date_time || new Date().toISOString(),
      pdf_doc: uploadedDocs.pdf_doc || '',
      payement_image: uploadedDocs.payement_image || '',
      document: uploadedDocs.document || '',
      doe: new Date().toLocaleDateString('en-US'),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('submissions').add(submissionData);
    msg = "<b style='color:#61c100;'>Added Form Submission Successfully</b>";
  } catch (error) {
    console.error('Error in form_submission.php wrapper:', error);
    msg = `<b style='color:#d70000;'>Problem in Adding Form Submission: ${error.message}</b>`;
  }
  const html = renderFormSubmission(msg);
  return res.send(html);
});


// 12. NewsDetails.php
app.get('/NewsDetails.php', async (req, res) => {
  try {
    const newsId = req.query.news_id;
    if (!newsId) {
      return res.status(400).send('Missing news_id parameter');
    }
    const doc = await db.collection('news').doc(newsId).get();
    if (!doc.exists) {
      return res.status(404).send('Notice not found');
    }
    const data = doc.data();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>News Detail - ${data.title || ''}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="css/bootstrap.css" rel="stylesheet" type="text/css">
    <link href="css/style.css" rel="stylesheet" type="text/css">
</head>
<body>
    <div class="header row">
        <div class="col-md-12 text-center">                
            <a href="index.html"><img src="images/logo_desktop.png" class="img-responsive" style="margin: 20px auto;"></a>                
        </div>
    </div>
    <div class="popular-section-wthree" style="padding: 40px 0;">
        <div class="container">
            <div class="row">
                <div class="col-md-10 col-md-offset-1">
                    <h2 class="Main_header" style="margin-bottom: 20px;">${data.title || ''}</h2>
                    <p><strong>Published Date:</strong> ${data.doe1 || ''}</p>
                    <hr>
                    ${data.image ? `<p><a class="btn btn-primary" target="_blank" href="${data.image}">Download PDF Document</a></p><br>` : ''}
                    <div style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
                        ${data.full_content || ''}
                    </div>
                    <br><br>
                    <a href="index.html" class="btn btn-default">Back to Home</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    return res.send(html);
  } catch (error) {
    console.error('Error in NewsDetails.php wrapper:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

// 13. show_registration.php
app.get('/show_registration.php', async (req, res) => {
  try {
    const regId = req.query.registraion;
    if (!regId) {
      return res.redirect('/index.html');
    }
    const doc = await db.collection('registrations').doc(regId).get();
    if (!doc.exists) {
      return res.status(404).send('Registration record not found.');
    }
    const data = doc.data();

    const templatePath = path.join(__dirname, 'templates/show_registration.php');
    if (!fs.existsSync(templatePath)) {
      return res.status(500).send('Template file not found.');
    }
    
    let html = fs.readFileSync(templatePath, 'utf8');

    // Remove PHP tags at the top
    html = html.replace(/<\?php[\s\S]*?if\(\$result_update2->num_rows > 0\)[\s\S]*?\}\s*else[\s\S]*?\}\s*\?>/i, '');

    // Dynamic regex replacement for <?php echo @$rows[...] ?> tags
    html = html.replace(/<\?php\s+echo\s+@\$rows\[['"](\w+)['"]\]\s*;?\s*\?>/g, (match, fieldName) => {
      return data[fieldName] || '';
    });
    html = html.replace(/<\?php\s+echo\s+@\$rows1\[['"](\w+)['"]\]\s*;?\s*\?>/g, (match, fieldName) => {
      return data[fieldName] || '';
    });
    html = html.replace(/<\?php\s+echo\s+@\$rows2\[['"](\w+)['"]\]\s*;?\s*\?>/g, (match, fieldName) => {
      if (fieldName === 'child_photo') return (data.documents && data.documents.child_photo) || '';
      if (fieldName === 'child_cert') return (data.documents && data.documents.child_cert) || '';
      if (fieldName === 'residence_proof') return (data.documents && data.documents.residence_proof) || '';
      if (fieldName === 'payement_image') return (data.documents && data.documents.payement_image) || '';
      return data[fieldName] || '';
    });

    return res.send(html);
  } catch (error) {
    console.error('Error in show_registration.php wrapper:', error);
    return res.status(500).send(`Error rendering registration details: ${error.message}`);
  }
});

// Export Express App as a Cloud Function in asia-south1 (Mumbai, India region)
exports.api = functions.region('asia-south1').https.onRequest(app);
