/**
 * Client for the existing Firebase Cloud Functions JSON API.
 * Reused as-is from the legacy backend (functions/index.js) — the clean
 * JSON endpoints (/banners, /news, /gallery, /activities), NOT the old
 * .php HTML wrappers.
 *
 * Set NEXT_PUBLIC_API_BASE to the functions base URL. Falls back to a
 * relative "/api" path (works behind Firebase Hosting rewrites).
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://asia-south1-the-elisabeth-gauba-scho-534b5.cloudfunctions.net/api";

export type Banner = { id: string; image: string; title?: string; order?: number };
export type NewsItem = {
  id: string;
  title?: string;
  title_url?: string;
  image?: string;
  home_page?: string;
  doe?: string;
  doe1?: string;
  full_content?: string;
};
export type GalleryImage = { image: string; name?: string };
export type GalleryAlbum = { id: string; title?: string; category?: string; images: GalleryImage[] };
export type Activity = { id: string; title?: string; content?: string; images?: string[] };
export type SocietyItem = {
  id: string;
  type: 'category' | 'document';
  name: string;
  images?: string[];
  url?: string;
  sizeLabel?: string;
};
export type Vacancy = { id: string; post: string; qualification: string; status: string };
export type StaffMember = {
  id: string;
  name: string;
  title: string; // Category/section title, e.g. "Administration"
  role?: string;  // Designation, e.g. "Principal"
  image?: string; // Profile photo URL
  order?: number;
};
export type StaffCarouselImage = {
  id: string;
  image: string;
  order?: number;
};
export type CoCurricularItem = {
  id: string;
  title: string;
  content: string;
  images?: string[];
  order: number;
};

export type FacilitiesItem = {
  id: string;
  title: string;
  content: string;
  images?: string[];
  order: number;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type SchoolTiming = {
  mainSchedule: string;
  officeHours: string;
  teacherMeeting?: string;
  principalMeeting?: string;
  noteSession: string;
  noteDussehra: string;
  noteFee: string;
  faqs?: FaqItem[];
};

const DEFAULT_SCHOOL_TIMING: SchoolTiming = {
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
      answer: "Classes run Monday to Friday, 8:00 AM to 1:40 PM. Office hours are also 8:00 AM to 1:40 PM on all working days.",
    },
    {
      question: "When can parents meet the teachers or the Principal?",
      answer: "Parents can meet teachers by noting the reason in the almanac. The Principal can be met by prior appointment only.",
    },
    {
      question: "What are the term dates and holidays for the academic year?",
      answer: "The academic session runs from April to March. The school closes for summer vacation from mid-May to early July, with a short Dussehra break in October and a winter break in December–January.",
    },
  ],
};

export const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "TjCao8sZUmjyo5MMuebp",
    title: "Tuesday, 25th August: Raksha Bandhan Assembly",
    title_url: "tuesday-25th-august-raksha-bandhan-assembly",
    image: "",
    home_page: "1",
    full_content: " ",
    doe: "30/07/2026",
    doe1: "2026-08-25"
  },
  {
    id: "xzdqmaf75HRKVcSssgpD",
    title: "Thursday, 20th - 25th August, Tuesday: Class I - V - Best out of waste",
    title_url: "thursday-20th-25th-august-tuesday-class-i-v-best-out-of-waste",
    image: "",
    home_page: "1",
    doe1: "2026-08-20",
    full_content: " ",
    doe: "30/07/2026"
  },
  {
    id: "r07Qg3sh8W18dej5Tymm",
    title: "Thursday, 13th August: •Independence Day Assembly •Inter-house Dance Competition ",
    title_url: "thursday-13th-august-independence-day-assembly-inter-house-dance-competition",
    image: "",
    full_content: " ",
    doe: "30/07/2026",
    home_page: "1",
    doe1: "2026-08-13"
  },
  {
    id: "bJE774qhXYWEyp7SWC0l",
    title: "Tuesday, 11th August: * Patriotic theme fancy dress Class PN * Patriotic rhyme recitation- Class Nur * Dress up as any leader and speak few lines Class KG",
    title_url: "tuesday-11th-august-patriotic-theme-fancy-dress-class-pn-patriotic-rhyme-recitation-class-nur-dress-up-as-any-leader-and-speak-few-lines-class-kg",
    image: "",
    home_page: "1",
    doe1: "2026-08-11",
    full_content: " ",
    doe: "30/07/2026"
  },
  {
    id: "4j0Cdb7H3FIWFA8jiHa7",
    title: "Monday, 10th August: •Maths Activity- Classes I-V •Fireless Cooking (Tri-colour sandwich)- Classes PN - KG",
    title_url: "monday-10th-august-maths-activity-classes-i-v-fireless-cooking-tri-colour-sandwich-classes-pn-kg",
    image: "",
    home_page: "1",
    doe1: "2026-08-10",
    full_content: " ",
    doe: "30/07/2026"
  },
  {
    id: "XDVgAuDnASaiBaOOdn2p",
    image: "",
    doe1: "2026-08-04",
    doe: "30/07/2026",
    home_page: "1",
    title_url: "independence-day-activity-classes-i-ii-classes-iii-v-english-creative-writing",
    full_content: "\r\n",
    title: "Independence Day Activity-* Classes I & II * ⁠Classes III - V: English creative writing"
  }
];

async function getJSON<T>(path: string, fallback: T): Promise<T> {
  const baseUrl = !API_BASE || API_BASE.startsWith("/")
    ? "https://asia-south1-the-elisabeth-gauba-scho-534b5.cloudfunctions.net/api"
    : API_BASE;
  const fullUrl = `${baseUrl.replace(/\/+$/, "")}${path}`;

  try {
    const res = await fetch(fullUrl, {
      // Direct CMS updates must show up instantly
      cache: "no-store",
      // Never let a cold Cloud Function stall the render.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as T;
    if (Array.isArray(data) && data.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
      return fallback;
    }
    return data;
  } catch {
    // Network / cold-start / timeout must never crash the page render.
    return fallback;
  }
}

export const getBanners = () => getJSON<Banner[]>("/banners", []);
export const getNews = (homepageOnly = false) =>
  getJSON<NewsItem[]>(`/news${homepageOnly ? "?homepage=1" : ""}`, DEFAULT_NEWS);
export const getGallery = () => getJSON<GalleryAlbum[]>("/gallery", []);
export const getActivities = () => getJSON<Activity[]>("/activities", []);
export const getSocietyItems = () => getJSON<SocietyItem[]>("/society", []);
export const getVacancies = () => getJSON<Vacancy[]>("/vacancies", []);
export const getStaff = () => getJSON<StaffMember[]>("/staff", []);
export const getStaffCarousel = () => getJSON<StaffCarouselImage[]>("/staff/carousel", []);
export const getCoCurricular = () => getJSON<CoCurricularItem[]>("/cocurricular", []);
export const getFacilities = () => getJSON<FacilitiesItem[]>("/facilities", []);
export const getSchoolTiming = () => getJSON<SchoolTiming>("/school-timing", DEFAULT_SCHOOL_TIMING);

export type AcademicCalendar = {
  pdfUrl: string;
  storagePath: string;
  fileName: string;
  updatedAt: string;
};

export const getAcademicCalendar = () => getJSON<AcademicCalendar | null>("/academic-calendar", null);
