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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    description: site.description,
    foundingDate: site.founded,
    email: site.contact.email,
    telephone: site.contact.phones[0],
    sameAs: site.sameAs,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.contact.address,
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
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
