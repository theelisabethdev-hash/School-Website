/**
 * Central site configuration — single source of truth for
 * organisation details, navigation, and the page manifest.
 * Imported by the layout, header/footer, sitemap and every page.
 */

export const site = {
  name: "The Elisabeth Gauba School",
  shortName: "Shiv Niketan School",
  // Update this to the production domain at cutover.
  url: "https://theelisabethgaubaschool.com",
  description:
    "The Elisabeth Gauba School (Shiv Niketan) is a nurturing pre-primary and primary school near President's Estate, Gole Market, New Delhi, blending strong academics with sports and co-curricular learning.",
  locale: "en_IN",
  // Firebase Functions API base. Empty string = same-origin /api (production).
  // For local emulator, set NEXT_PUBLIC_API_BASE to the functions URL.
  contact: {
    address: "Sector-II, DIZ Area, Kali Bari Marg (Entry from Gate No-9, Kali Bari Lane)",
    email: "shivniketan1@rediffmail.com",
    // [0] matches the number shown on the Google Business Profile — keep it
    // first so JSON-LD stays consistent with the GBP listing (NAP match).
    phones: ["+91-8800541280", "011-23367633", "011-41646990"],
  },
  founded: "1938",
  // From the homepage's Google Maps embed (Elisabeth Gauba School pin).
  geo: { lat: 28.628154, lng: 77.201898 },
  sameAs: [
    "https://m.facebook.com/TheElisabethGaubaSchool",
    "https://www.instagram.com/theelisabethgaubaschool/",
  ],
  // Retired UA property replaced by a GA4 id. Set the real id at cutover.
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
} as const;

export type NavItem = { label: string; href: string };
export type NavGroup = { label: string; href?: string; children?: NavItem[] };

export const nav: NavGroup[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    children: [
      { label: "About Us", href: "/about-us" },
      { label: "History Of School", href: "/school-history" },
      { label: "About Society", href: "/about-society" },
      { label: "Objective", href: "/objective" },
      { label: "Mission", href: "/mission" },
    ],
  },
  {
    label: "School Management",
    children: [
      { label: "Message From Our Chairperson", href: "/chairperson" },
      { label: "Message From The Principal's Desk", href: "/principal" },
      { label: "Executive Committee", href: "/committee" },
      { label: "Staff Members", href: "/staff" },
    ],
  },
  {
    label: "Curriculum",
    children: [
      { label: "Approach", href: "/approach" },
      { label: "Academic Calendar", href: "/academic-calendar" },
      { label: "Co-Curricular", href: "/co-curricular" },
      { label: "Facilities & Infrastructure", href: "/facilities" },
      { label: "Safety & Security", href: "/safety-security" },
      { label: "School With Social Consciouness", href: "/social-consciousness" },
    ],
  },
  {
    label: "Admissions",
    children: [
      { label: "Admission Process & Requirements", href: "/admissions" },
      { label: "Online Registration", href: "/registration" },
      { label: "Fee Structure And Payment", href: "/fee-structure" },
      { label: "School Timing", href: "/school-timing" },
    ],
  },
  {
    label: "Useful Link",
    children: [
      { label: "Students Placements", href: "/placements" },
      { label: "Online/Pandemic Learning", href: "/online-learning" },
      { label: "Vacancy", href: "/vacancies" },
      { label: "Notices", href: "/notices" },
      // { label: "Photo Gallery", href: "/gallery" }, 
      { label: "Activities", href: "/activities" },
    ],
  },
  { label: "Early Years", href: "/early-years" },
  { label: "Fee Pay", href: "https://octopod.co.in/student/admission/a966c6ce5044ccbecd62c1683a1eb19b" },
  { label: "Contact Us", href: "/contact" },
];

export type PageMeta = {
  slug: string;         // route path, e.g. "/about-us"
  source: string;       // legacy html file this was ported from
  title: string;        // <title> / og:title
  description: string;  // meta description (~150 chars, natural language)
  h1: string;           // the single visible <h1>
  legacy: string[];     // old URLs to 301-redirect from
  dynamic?: boolean;    // true = server-renders from the API
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: number;
};

/**
 * The canonical page manifest. Every ported page registers here so the
 * sitemap, redirects and metadata all stay consistent. Agents building
 * pages read their entry from here — do not duplicate metadata in pages.
 */
export const pages: PageMeta[] = [
  { slug: "/", source: "index.html", title: "Best Preschool near President's Estate, Delhi — The Elisabeth Gauba School", description: "The Elisabeth Gauba School (Shiv Niketan), a nurturing pre-primary & primary school near President's Estate and Gole Market, New Delhi.", h1: "Welcome to The Elisabeth Gauba School", legacy: ["/index.html"], changefreq: "weekly", priority: 1.0 },

  { slug: "/about-us", source: "AboutUs.html", title: "About The Elisabeth Gauba School", description: "Founded by Mrs. Elisabeth Gauba in 1938, the school (formerly Shiv Niketan) nurtures each child in small, caring groups near Gole Market, Delhi.", h1: "About The Elisabeth Gauba School", legacy: ["/AboutUs.html", "/Welcome.html"], changefreq: "monthly", priority: 0.8 },
  { slug: "/school-history", source: "Schoolhistory.html", title: "History of the School", description: "The journey of The Elisabeth Gauba School from a 1938 preparatory school on Hailey Road to today's Shiv Niketan legacy in New Delhi.", h1: "History of the School", legacy: ["/Schoolhistory.html"], changefreq: "yearly", priority: 0.6 },
  { slug: "/about-society", source: "AboutSociety.html", title: "About the Shiv Niketan Society", description: "About the Shiv Niketan Society that runs The Elisabeth Gauba School, registered in 1969 and guided by a legacy of progressive education.", h1: "About the Society", legacy: ["/AboutSociety.html"], changefreq: "yearly", priority: 0.6 },
  { slug: "/objective", source: "Objective.html", title: "Objective of the School", description: "The guiding objectives of The Elisabeth Gauba School — nurturing free expression, curiosity and character in every young learner.", h1: "Objective of the School", legacy: ["/Objective.html"], changefreq: "yearly", priority: 0.6 },
  { slug: "/mission", source: "Mission.html", title: "Mission of the School", description: "The mission of The Elisabeth Gauba School: to provide a caring, stimulating environment where children learn through open and free expression.", h1: "Mission of the School", legacy: ["/Mission.html"], changefreq: "yearly", priority: 0.6 },
  { slug: "/founder", source: "Founder.html", title: "A Few Words from our Founder", description: "Remembering Mrs. Elisabeth Gauba, founder of the school, and her enduring vision for child-centred education in Delhi.", h1: "A Few Words from our Founder", legacy: ["/Founder.html"], changefreq: "yearly", priority: 0.6 },
  { slug: "/chairperson", source: "Chairperson.html", title: "Message from our Chairperson", description: "A message from the Chairperson of The Elisabeth Gauba School on the school's values, vision and community.", h1: "Message from our Chairperson", legacy: ["/Chairperson.html"], changefreq: "yearly", priority: 0.6 },
  { slug: "/principal", source: "Principal.html", title: "Message from the Principal", description: "A message from the Principal of The Elisabeth Gauba School welcoming families to a nurturing learning community in New Delhi.", h1: "Message from the Principal", legacy: ["/Principal.html"], changefreq: "yearly", priority: 0.6 },
  { slug: "/committee", source: "Committee.html", title: "Executive Committee", description: "The Managing / Executive Committee that governs The Elisabeth Gauba School and the Shiv Niketan Society.", h1: "Executive Committee", legacy: ["/Committee.html"], changefreq: "yearly", priority: 0.5 },
  { slug: "/staff", source: "teachingstaff.html", title: "Our Teaching Staff", description: "Meet the dedicated teaching staff of The Elisabeth Gauba School who nurture every child's growth and learning.", h1: "Our Teaching Staff", legacy: ["/teachingstaff.html"], changefreq: "monthly", priority: 0.5 },

  { slug: "/approach", source: "Approach.html", title: "Our Approach to Learning", description: "The child-centred approach of The Elisabeth Gauba School — small groups, individual attention and learning through free expression.", h1: "Our Approach", legacy: ["/Approach.html"], changefreq: "yearly", priority: 0.6 },
  { slug: "/academic-calendar", source: "AcademicCalendar.html", title: "Academic Calendar", description: "The academic calendar of The Elisabeth Gauba School — term dates, holidays and key events for the school year.", h1: "Academic Calendar", legacy: ["/AcademicCalendar.html"], changefreq: "monthly", priority: 0.6 },
  { slug: "/co-curricular", source: "Curricular.html", title: "Co-Curricular Activities", description: "Sports, arts, music and co-curricular programmes at The Elisabeth Gauba School that build well-rounded, confident children.", h1: "Co-Curricular Activities", legacy: ["/Curricular.html"], dynamic: true, changefreq: "monthly", priority: 0.7 },
  { slug: "/facilities", source: "SchoolInfrastructure.html", title: "Facilities & Infrastructure", description: "Explore the facilities at The Elisabeth Gauba School — computer lab, library, infirmary, kitchen, playground and safe campus.", h1: "Facilities & Infrastructure", legacy: ["/SchoolInfrastructure.html"], dynamic: true, changefreq: "monthly", priority: 0.7 },
  { slug: "/safety-security", source: "Security.html", title: "Safety & Security", description: "How The Elisabeth Gauba School keeps children safe — supervised campus, trained staff, CCTV and careful safety practices.", h1: "Safety & Security", legacy: ["/Security.html"], changefreq: "yearly", priority: 0.6 },
  { slug: "/social-consciousness", source: "SocialConsciouness.html", title: "School with Social Consciousness", description: "The social initiatives of The Elisabeth Gauba School that teach children empathy, responsibility and community values.", h1: "School with Social Consciousness", legacy: ["/SocialConsciouness.html"], changefreq: "yearly", priority: 0.5 },
  { slug: "/online-learning", source: "Pandemic.html", title: "Online & Pandemic Learning", description: "How The Elisabeth Gauba School continued caring, effective learning online through the pandemic and beyond.", h1: "Online & Pandemic Learning", legacy: ["/Pandemic.html"], changefreq: "yearly", priority: 0.4 },

  { slug: "/admissions", source: "AdmissionProcess.html", title: "Admission Process & Requirements", description: "Admission process, eligibility and requirements for The Elisabeth Gauba School (Shiv Niketan), New Delhi — how to apply for your child.", h1: "Admission Process & Requirements", legacy: ["/AdmissionProcess.html", "/AdmissionProcesscc73.html"], changefreq: "monthly", priority: 0.9 },
  { slug: "/registration", source: "Registration.html", title: "Online Registration", description: "Register your child online for admission to The Elisabeth Gauba School. Complete the form and upload the required documents.", h1: "Online Registration", legacy: ["/Registration.html", "/RegisterStudent.html"], dynamic: true, changefreq: "monthly", priority: 0.8 },
  { slug: "/fee-structure", source: "FeeStructure.html", title: "Fee Structure & Payment", description: "Fee structure and payment details for The Elisabeth Gauba School (Shiv Niketan), New Delhi.", h1: "Fee Structure & Payment", legacy: ["/FeeStructure.html"], changefreq: "yearly", priority: 0.7 },
  { slug: "/school-timing", source: "SchoolTiming.html", title: "School Timing", description: "School timings for The Elisabeth Gauba School across pre-primary and primary classes.", h1: "School Timing", legacy: ["/SchoolTiming.html"], changefreq: "yearly", priority: 0.5 },
  { slug: "/results", source: "result.html", title: "Admission Results", description: "Admission results and selected-candidate lists for The Elisabeth Gauba School.", h1: "Admission Results", legacy: ["/result.html"], changefreq: "monthly", priority: 0.6 },

  { slug: "/placements", source: "Placements.html", title: "Students Placements", description: "Where our students go next — placements and progression from The Elisabeth Gauba School.", h1: "Students Placements", legacy: ["/Placements.html"], changefreq: "yearly", priority: 0.5 },
  { slug: "/setu-project", source: "shiv-niketan-setu-project-community-outreach.html", title: "Shiv Niketan Setu Project — Community Outreach", description: "The Shiv Niketan Setu Project — the school's community outreach bringing education and care to underserved children.", h1: "Shiv Niketan Setu Project", legacy: ["/shiv-niketan-setu-project-community-outreach.html"], changefreq: "yearly", priority: 0.5 },
  { slug: "/vacancies", source: "Vacancies.html", title: "Careers & Vacancies", description: "Current teaching and staff vacancies at The Elisabeth Gauba School — join our caring school community.", h1: "Careers with The Elisabeth Gauba School", legacy: ["/Vacancies.html"], changefreq: "monthly", priority: 0.5 },

  { slug: "/gallery", source: "Gallery.html", title: "Photo Gallery", description: "Photos from life at The Elisabeth Gauba School — events, activities, celebrations and everyday learning.", h1: "Our Photo Gallery", legacy: ["/Gallery.html", "/Gallery535a.html"], dynamic: true, changefreq: "weekly", priority: 0.7 },
  { slug: "/activities", source: "AnualEvents.html", title: "Activities & Events", description: "Annual events and activities at The Elisabeth Gauba School that make learning joyful and memorable.", h1: "Activities & Events", legacy: ["/AnualEvents.html"], dynamic: true, changefreq: "weekly", priority: 0.7 },
  { slug: "/notices", source: "News.html", title: "Notices & News", description: "Latest notices, circulars and news from The Elisabeth Gauba School.", h1: "Notices & News", legacy: ["/News.html"], dynamic: true, changefreq: "weekly", priority: 0.7 },
  { slug: "/contact", source: "ContactUs.html", title: "Contact Us", description: "Contact The Elisabeth Gauba School — address, phone, email and enquiry form. Gate No-9, Kali Bari Lane, New Delhi.", h1: "Contact Us", legacy: ["/ContactUs.html"], dynamic: true, changefreq: "yearly", priority: 0.8 },
  { slug: "/form-submission", source: "form_submission.html", title: "Registration Form Submission", description: "Upload your filled registration form PDF and payment receipt screenshot.", h1: "Registration Form Submission", legacy: [], changefreq: "monthly", priority: 0.7 },

  { slug: "/best-preschool-feroz-shah-road", source: "best-preschool-near-feroz-shah-road.html", title: "Best Preschool near Feroz Shah Road, Delhi", description: "Looking for the best preschool near Feroz Shah Road? The Elisabeth Gauba School offers nurturing early education in central Delhi.", h1: "Best Preschool near Feroz Shah Road", legacy: ["/best-preschool-near-feroz-shah-road.html"], changefreq: "monthly", priority: 0.6 },
  { slug: "/early-years", source: "egps.html", title: "Early Years (Playgroup & Pre-Nursery) — The Elisabeth Gauba School", description: "Learn about Elisabeth Gauba's Preparatory School for Playgroup and Pre-Nursery. Fun activities, caring environment for children aged 2+.", h1: "Early Years (Playgroup & Pre-Nursery)", legacy: ["/egps/egps.html"], changefreq: "monthly", priority: 0.8 },
];

export function getPage(slug: string): PageMeta | undefined {
  return pages.find((p) => p.slug === slug);
}
