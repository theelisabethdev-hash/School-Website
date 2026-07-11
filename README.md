# The Elisabeth Gauba School — Website

Codebase for the official website of **The Elisabeth Gauba School (Shiv Niketan)**, a pre-primary and primary school located near President's Estate / Gole Market, New Delhi.

- 🌐 **Public Website:** https://the-elisabeth-gauba-scho-534b5.web.app
- 🖥️ **Admin panel:** https://the-elisabeth-gauba-scho-534b5.web.app/admin

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| **Next.js** | 16 (App Router) | React framework, routing, SSR |
| **React** | 19 | UI component library |
| **TypeScript** | 5 | Type-safe JavaScript |
| **Tailwind CSS** | 4 | Utility-first styling (dev dep) |
| **Bootstrap 3** | Legacy | Served from `public/` for design parity with the original site |
| **jQuery** | Legacy | Loaded from `public/` alongside Bootstrap |
| **Owl Carousel** | 1.3.3 | Image gallery carousels on pages |

> The original Bootstrap 3 / jQuery design is preserved intentionally — the Next.js migration changed the framework, not the look.

### Backend
| Technology | Role |
|---|---|
| **Firebase Cloud Functions** | Serverless REST API (Node.js + Express) |
| **Express.js** | HTTP routing for API endpoints |
| **Multer** | File / image uploads |
| **Nodemailer** | Registration & contact form emails |

**API endpoints exposed by `functions/index.js`:**
`/banners` · `/news` · `/gallery` · `/activities` · `/staff` · `/register` · `/contact`

### Database & Storage
| Service | Purpose |
|---|---|
| **Cloud Firestore** | Banners, notices, activities, gallery metadata, registrations |
| **Firebase Storage** | Uploaded images and documents (child photos, receipts, etc.) |

The Next.js app reads Firebase through the `NEXT_PUBLIC_API_BASE` environment variable. When it is not set the site falls back to local static content — **this is by design**, so the site works offline during development.

### SEO & Analytics
- Per-page `<title>` and `<meta>` tags via `src/lib/seo.ts`
- Open Graph and Twitter Card tags on every page
- Organisation JSON-LD structured data in the root layout
- Auto-generated `sitemap.xml` (`src/app/sitemap.ts`) and `robots.txt` (`src/app/robots.ts`)
- **Google Analytics 4** — activated by setting `NEXT_PUBLIC_GA4_ID`

### Deployment
| Target | Service |
|---|---|
| Frontend | Vercel or Firebase Hosting (Next.js) |
| Backend / DB / Storage | Existing Firebase project |

---

## 📁 File Structure

```
php_website/                        ← project root (clone this folder)
│
├── src/                            ← Next.js source
│   ├── app/                        ← App Router pages
│   │   ├── layout.tsx              ← Root layout (fonts, metadata, JSON-LD, GA4)
│   │   ├── page.tsx                ← Homepage
│   │   ├── globals.css             ← Global CSS reset / overrides
│   │   ├── sitemap.ts              ← Auto-generated sitemap
│   │   ├── robots.ts               ← robots.txt generator
│   │   ├── admin/                  ← Admin panel pages
│   │   ├── about-us/               ← /about-us page
│   │   ├── admissions/             ← /admissions page
│   │   ├── activities/             ← /activities page
│   │   ├── co-curricular/          ← /co-curricular page
│   │   ├── contact/                ← /contact page
│   │   ├── facilities/             ← /facilities page
│   │   ├── gallery/                ← /gallery page
│   │   ├── notices/                ← /notices page
│   │   ├── registration/           ← /registration page
│   │   ├── staff/                  ← /staff page
│   │   └── ...                     ← (other route folders)
│   │
│   ├── components/                 ← Reusable React components
│   │   ├── Header.tsx              ← Site-wide navigation header
│   │   ├── Footer.tsx              ← Site-wide footer
│   │   ├── HeroCarousel.tsx        ← Homepage hero banner crossfade
│   │   ├── OwlInit.tsx             ← Owl Carousel initialiser (galleries)
│   │   ├── AdmissionPopup.tsx      ← Bottom-right admission popup
│   │   ├── NoticesAccordion.tsx    ← Accordion notice list
│   │   ├── GalleryBrowser.tsx      ← Gallery page browser
│   │   ├── ActivitiesBrowser.tsx   ← Activities listing browser
│   │   ├── RegistrationForm.tsx    ← Online registration form
│   │   ├── ContactForm.tsx         ← Contact page form
│   │   └── ...                     ← (other components)
│   │
│   ├── lib/                        ← Shared utilities & configuration
│   │   ├── site.ts                 ← Site-wide config (school info, nav links, etc.)
│   │   ├── seo.ts                  ← Per-page metadata helper (pageMetadata)
│   │   ├── api.ts                  ← Firebase / backend API client
│   │   ├── firebase.ts             ← Firebase SDK initialisation
│   │   └── export.ts               ← Data export utilities
│   │
│   └── content/                    ← Ported legacy page HTML content
│
├── functions/                      ← Firebase Cloud Functions (backend)
│   ├── index.js                    ← Express REST API + legacy wrappers
│   ├── templates/                  ← Email HTML templates (Nodemailer)
│   └── package.json                ← Backend dependencies
│
├── public/                         ← Static assets served at /
│   ├── css/                        ← Bootstrap 3 & custom legacy CSS
│   ├── js/                         ← jQuery, Owl Carousel, custom scripts
│   ├── images/                     ← Site images (logos, banners, etc.)
│   ├── fonts/                      ← Web fonts
│   └── uploads/                    ← User-uploaded files (not tracked in git)
│
├── scripts/                        ← Developer utility scripts
├── .env.local                      ← Local environment variables (not in git)
├── .firebaserc                     ← Firebase project target
├── firebase.json                   ← Hosting rewrites, Functions config, emulator ports
├── next.config.ts                  ← Next.js configuration
├── tsconfig.json                   ← TypeScript configuration
├── eslint.config.mjs               ← ESLint configuration
├── package.json                    ← Frontend dependencies & scripts
└── .gitignore

---

## 🚀 Run Locally from GitHub

### Prerequisites

Make sure these are installed before you begin:

| Tool | Minimum Version | Check |
|---|---|---|
| **Node.js** | 18+ | `node -v` |
| **npm** | 9+ | `npm -v` |
| **Git** | any | `git --version` |
| **Java (JDK)** | 11+ *(only for Firebase emulator)* | `java -version` |
| **Firebase CLI** | latest *(only for Firebase emulator)* | `firebase --version` |

Install the Firebase CLI globally if needed:
```bash
npm install -g firebase-tools
firebase login
```

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>/php_website
```

> Replace `<your-org>/<your-repo>` with the actual GitHub path shared with you.

---

### Step 2 — Install frontend dependencies

```bash
npm install
```

---

### Step 3 — Set up environment variables *(optional)*

Create a `.env.local` file in the `php_website/` folder:

```bash
# Firebase Functions API base URL (for live data)
NEXT_PUBLIC_API_BASE=http://127.0.0.1:5001/<firebase-project-id>/us-central1/api

# Google Analytics 4 (optional)
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

> **Without `.env.local`:** The site runs perfectly using local static fallback content. Dynamic sections (hero banners, notices, gallery, activities) will show placeholder / locally-defined data.

---

### Step 4 — Start the development server

```bash
npm run dev
```

Public Website **http://localhost:3000** in your browser. Hot-reload is enabled — changes to source files reflect instantly.

Admin Panel **http://localhost:3000/admin**

---

## ☁️ Deploy to Firebase

```bash
# Deploy everything (Hosting + Functions + Rules)
firebase deploy
