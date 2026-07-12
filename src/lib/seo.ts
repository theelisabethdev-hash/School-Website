import type { Metadata } from "next";
import { site, getPage } from "./site";

/**
 * Build per-page Metadata (title, description, canonical, Open Graph,
 * Twitter) from the central page manifest. Every page should export:
 *   export const metadata = pageMetadata("/slug");
 * so SEO stays consistent and lives in one place.
 */
export function pageMetadata(slug: string): Metadata {
  const p = getPage(slug);
  const title = p?.title ?? site.name;
  const description = p?.description ?? site.description;
  const canonical = slug === "/" ? site.url : `${site.url}${slug}`;

  const ogImage = "/images/school-logo.jpg";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url: canonical,
      locale: site.locale,
      images: [{ url: ogImage, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * School JSON-LD for local/education search (and for AI answer engines —
 * Google AI Overviews, ChatGPT, Perplexity, etc. — that ground answers in
 * structured entity data). Kept consistent with the Google Business Profile:
 * same phone-first, same address, same social links.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "School",
    "@id": `${site.url}/#school`,
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    description: site.description,
    foundingDate: site.founded,
    email: site.contact.email,
    telephone: site.contact.phones[0],
    logo: { "@type": "ImageObject", url: `${site.url}/images/school-logo.jpg` },
    image: `${site.url}/images/school-logo.jpg`,
    sameAs: site.sameAs,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.contact.address,
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      postalCode: "110001",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    contactPoint: site.contact.phones.map((telephone) => ({
      "@type": "ContactPoint",
      telephone,
      contactType: "admissions",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "13:40",
    },
    areaServed: [
      "Gole Market, New Delhi",
      "Connaught Place, New Delhi",
      "President's Estate, New Delhi",
      "Chanakyapuri, New Delhi",
    ].map((name) => ({ "@type": "Place", name })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Grades Offered",
      itemListElement: [
        { name: "Nursery", programType: "Pre-Primary" },
        { name: "Kindergarten (K.G.)", programType: "Pre-Primary" },
        { name: "Class I", programType: "Primary" },
        { name: "Class II", programType: "Primary" },
        { name: "Class III", programType: "Primary" },
        { name: "Class IV", programType: "Primary" },
        { name: "Class V", programType: "Primary" },
      ].map(({ name, programType }) => ({
        "@type": "Offer",
        itemOffered: { "@type": "EducationalOccupationalProgram", name, programType },
      })),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** A single FAQ entry: visible copy that also seeds the FAQPage JSON-LD. */
export type FaqItem = { question: string; answer: string };

/**
 * Facts pulled from the school's own admissions/fee/timing pages so AI
 * answer engines and Google's "People also ask" have a clean, quotable
 * source to cite instead of third-party directory listings.
 */
export const homeFaqs: FaqItem[] = [
  {
    question: "What classes does The Elisabeth Gauba School offer?",
    answer:
      "The Elisabeth Gauba School (Shiv Niketan) is a pre-primary and primary school offering Nursery, Kindergarten (K.G.), and Class I through Class V.",
  },
  {
    question: "What is the age criteria for admission?",
    answer:
      "Nursery: 3+ and below 4 years; K.G.: 4+ and below 5 years; Class I: 5+ and below 6 years, all as on 31st March of the admission year. Admission to higher classes depends on vacancies.",
  },
  {
    question: "What are the school timings?",
    answer:
      "Classes run Monday to Friday, 8:00 AM to 1:40 PM. The academic session runs April to March, with a summer break (mid-May to early July), a short Dussehra break in October, and a winter break in December–January.",
  },
  {
    question: "Where is The Elisabeth Gauba School located?",
    answer:
      "Entry from Gate No. 9, Kali Bari Lane, Havelock Square, Type III, President's Estate, New Delhi 110001 — near Gole Market and Connaught Place in central Delhi.",
  },
  {
    question: "How do I apply for admission?",
    answer:
      "Registration is open online and offline. Scan the QR code / pay the ₹25 form fee, fill the registration form, and submit it online or at the school reception with the required documents. See the Admission Process page for the full steps.",
  },
  {
    question: "Who founded The Elisabeth Gauba School?",
    answer:
      "Mrs. Elisabeth Gauba founded the school in 1938 at 8, Hailey Road, New Delhi. The Shiv Niketan Society, registered in 1969, has run the school since.",
  },
];

export const admissionsFaqs: FaqItem[] = [
  {
    question: "What documents are required for admission at The Elisabeth Gauba School?",
    answer:
      "You need one passport-size photograph of the child, a self-attested photocopy of the birth certificate, a self-attested photocopy of a parent's residence proof (Voter ID, Aadhaar or Passport — utility bills must not be older than 2 months), and a certified copy of the previous year's report card if applicable. Original documents must be shown at the time of admission.",
  },
  {
    question: "How much does the registration form cost and how do I pay?",
    answer:
      "The registration form costs ₹25. You can pay online by scanning the QR code (account: The Elisabeth Gauba School), or offline by collecting and paying for the form at the school reception.",
  },
  {
    question: "Can I register online or do I have to visit the school in person?",
    answer:
      "Both options are available. Online: fill the registration form and submit it via the online form or by emailing theelisabethgaubaschool@gmail.com, then upload the form and payment receipt on the Form Submission page. Offline: collect, fill and submit the form at the school reception with the required documents.",
  },
  {
    question: "What is the age criteria for admission?",
    answer:
      "Nursery: 3+ and below 4 years; K.G.: 4+ and below 5 years; Class I: 5+ and below 6 years — all as on 31st March of the admission year. Admission to higher classes depends on vacancies.",
  },
  {
    question: "Is admission to higher classes (above Class I) available?",
    answer:
      "Yes. Admission to higher classes is offered against vacancies in the specific class, subject to availability.",
  },
];

export const feeFaqs: FaqItem[] = [
  {
    question: "How is the school fee paid at The Elisabeth Gauba School?",
    answer:
      "Fee is payable for twelve months of the academic year. Payment details and the current fee schedule are provided on the Fee Structure page and at the school office; online payment is available through the school's payment portal.",
  },
  {
    question: "Are there any one-time charges at the time of admission?",
    answer:
      "Along with the monthly tuition fee, applicable admission and annual charges are collected at the time of admission. Please refer to the current fee schedule on this page or contact the school office for the exact amounts.",
  },
  {
    question: "How can I contact the school about fees?",
    answer:
      "Call +91-8800541280, 011-23367633 or 011-41646990, or email theelisabethgaubaschool@gmail.com. The office is open Monday to Friday, 8:00 AM to 1:40 PM.",
  },
];

export const timingFaqs: FaqItem[] = [
  {
    question: "What are the school timings at The Elisabeth Gauba School?",
    answer:
      "Classes run Monday to Friday, 8:00 AM to 1:40 PM. Office hours are also 8:00 AM to 1:40 PM on all working days.",
  },
  {
    question: "When can parents meet the teachers or the Principal?",
    answer:
      "Parents can meet teachers by noting the reason in the almanac. The Principal can be met by prior appointment only.",
  },
  {
    question: "What are the term dates and holidays for the academic year?",
    answer:
      "The academic session runs from April to March. The school closes for summer vacation from mid-May to early July, with a short Dussehra break in October and a winter break in December–January.",
  },
];

/** FAQPage JSON-LD built from a list of visible FAQ items. */
export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
