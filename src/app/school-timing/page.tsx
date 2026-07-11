import { pageMetadata } from "@/lib/seo";
import { getSchoolTiming } from "@/lib/api";
import SchoolTimingClient from "./SchoolTimingClient";

export const metadata = pageMetadata("/school-timing");
export const dynamic = "force-dynamic";

export default async function Page() {
  const timing = await getSchoolTiming();

  return (
    <div id="body">
      <section className="content-wrapper main-content clear-fix">
        <SchoolTimingClient timing={timing} />
      </section>
    </div>
  );
}
