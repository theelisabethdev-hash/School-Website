/**
 * Client for the existing Firebase Cloud Functions JSON API.
 * Reused as-is from the legacy backend (functions/index.js) — the clean
 * JSON endpoints (/banners, /news, /gallery, /activities), NOT the old
 * .php HTML wrappers.
 *
 * Set NEXT_PUBLIC_API_BASE to the functions base URL. Falls back to a
 * relative "/api" path (works behind Firebase Hosting rewrites).
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

export type Banner = { id: string; image: string; title?: string; order?: number };
export type NewsItem = {
  id: string;
  title?: string;
  title_url?: string;
  image?: string;
  home_page?: string;
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

export type SchoolTiming = {
  mainSchedule: string;
  officeHours: string;
  teacherMeeting: string;
  principalMeeting: string;
  noteSession: string;
  noteDussehra: string;
  noteFee: string;
};

const DEFAULT_SCHOOL_TIMING: SchoolTiming = {
  mainSchedule: 'Monday to Friday — 8:00 A.M. to 1:40 P.M.',
  officeHours: 'Office timing is from 8:00 A.M. to 1:40 P.M. hrs on all working days.',
  teacherMeeting: 'Parents can meet the teachers by communicating the reason in the almanac.',
  principalMeeting: 'Parents can meet the Principal by prior appointment only.',
  noteSession: 'The academic session starts in April and ends in March every year. The school closes for summer vacation from mid of May to the beginning of July.',
  noteDussehra: 'There is a short break in October during the Dussehra period and a winter break in December-January.',
  noteFee: 'Fee is to be paid for twelve months of the academic year.',
};

async function getJSON<T>(path: string, fallback: T): Promise<T> {
  // A relative base (default "/api") can't be fetched from a Server Component
  // — there's no host to resolve it against (e.g. during `next build`).
  // Skip and return the fallback so the page still renders/prerenders.
  if (!/^https?:\/\//i.test(API_BASE)) return fallback;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      // Direct CMS updates must show up instantly
      cache: "no-store",
      // Never let a cold Cloud Function stall the render.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    // Network / cold-start / timeout must never crash the page render.
    return fallback;
  }
}

export const getBanners = () => getJSON<Banner[]>("/banners", []);
export const getNews = (homepageOnly = false) =>
  getJSON<NewsItem[]>(`/news${homepageOnly ? "?homepage=1" : ""}`, []);
export const getGallery = () => getJSON<GalleryAlbum[]>("/gallery", []);
export const getActivities = () => getJSON<Activity[]>("/activities", []);
export const getSocietyItems = () => getJSON<SocietyItem[]>("/society", []);
export const getVacancies = () => getJSON<Vacancy[]>("/vacancies", []);
export const getStaff = () => getJSON<StaffMember[]>("/staff", []);
export const getStaffCarousel = () => getJSON<StaffCarouselImage[]>("/staff/carousel", []);
export const getCoCurricular = () => getJSON<CoCurricularItem[]>("/cocurricular", []);
export const getFacilities = () => getJSON<FacilitiesItem[]>("/facilities", []);
export const getSchoolTiming = () => getJSON<SchoolTiming>("/school-timing", DEFAULT_SCHOOL_TIMING);
