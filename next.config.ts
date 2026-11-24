import type { NextConfig } from "next";

// 301-redirect every legacy .html / .aspx URL to its new clean slug so we
// keep the SEO value of the old, indexed URLs.
// The source of truth for legacy URLs (firebase.json repeats most of them as
// hosting redirects). Keep it in this file: next.config.ts is
// loaded at runtime inside the Firebase SSR function, where src/ is not
// bundled, so importing from src/ crashes the server.
const LEGACY_URLS: [string, string[]][] = [
  ["/", ["/index.html"]],
  ["/about-us", ["/AboutUs.html", "/Welcome.html"]],
  ["/school-history", ["/Schoolhistory.html"]],
  ["/about-society", ["/AboutSociety.html"]],
  ["/objective", ["/Objective.html"]],
  ["/mission", ["/Mission.html"]],
  ["/founder", ["/Founder.html"]],
  ["/chairperson", ["/Chairperson.html"]],
  ["/principal", ["/Principal.html"]],
  ["/committee", ["/Committee.html"]],
  ["/staff", ["/teachingstaff.html"]],
  ["/approach", ["/Approach.html"]],
  ["/academic-calendar", ["/AcademicCalendar.html"]],
  ["/co-curricular", ["/Curricular.html"]],
  ["/facilities", ["/SchoolInfrastructure.html"]],
  ["/safety-security", ["/Security.html"]],
  ["/social-consciousness", ["/SocialConsciouness.html"]],
  ["/online-learning", ["/Pandemic.html"]],
  ["/admissions", ["/AdmissionProcess.html", "/AdmissionProcesscc73.html"]],
  ["/registration", ["/Registration.html", "/RegisterStudent.html"]],
  ["/fee-structure", ["/FeeStructure.html"]],
  ["/school-timing", ["/SchoolTiming.html"]],
  ["/results", ["/result.html"]],
  ["/placements", ["/Placements.html"]],
  ["/setu-project", ["/shiv-niketan-setu-project-community-outreach.html"]],
  ["/vacancies", ["/Vacancies.html"]],
  ["/gallery", ["/Gallery.html", "/Gallery535a.html"]],
  ["/activities", ["/AnualEvents.html"]],
  ["/notices", ["/News.html"]],
  ["/contact", ["/ContactUs.html"]],
  ["/best-preschool-feroz-shah-road", ["/best-preschool-near-feroz-shah-road.html"]],
  ["/early-years", ["/egps/egps.html"]],
];

const legacyRedirects = LEGACY_URLS.flatMap(([slug, legacy]) =>
  legacy.map((from) => ({
    source: from,
    destination: slug,
    permanent: true,
  }))
);

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in the home dir otherwise
  // makes Next infer the wrong root.
  turbopack: { root: __dirname },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      ...legacyRedirects,
      // PDF Redirects to Firebase Storage
      {
        source: "/Documents/:file*",
        destination: "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/Documents/:file*",
        permanent: true,
      },
      {
        source: "/uploads/notice/:file*",
        destination: "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/uploads/notice/:file*",
        permanent: true,
      },
      {
        source: "/:file.pdf",
        destination: "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/:file.pdf",
        permanent: true,
      },
    ];
  },
  images: {
    // Ported content uses plain <img> to legacy asset paths and the
    // Firebase Storage bucket; don't run them through the optimizer.
    unoptimized: true,
  },
};

export default nextConfig;
