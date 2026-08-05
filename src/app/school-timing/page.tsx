import { pageMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { getSchoolTiming, getFaqs } from "@/lib/api";
import FaqSection from "@/components/FaqSection";
import SchoolTimingClient from "./SchoolTimingClient";

export const metadata = pageMetadata("/school-timing");
export const dynamic = "force-dynamic";

export default async function Page() {
  const [timing, faqsData] = await Promise.all([getSchoolTiming(), getFaqs()]);
  const faqs = faqsData?.schoolTiming || [];

  return (
    <div id="body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: `${site.url}/` },
              { name: "Admissions", url: `${site.url}/admissions` },
              { name: "School Timing", url: `${site.url}/school-timing` },
            ])
          ),
        }}
      />
      <section className="content-wrapper main-content clear-fix">
        <SchoolTimingClient timing={timing} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
        />
        <FaqSection items={faqs} />
      </section>
    </div>
  );
}
