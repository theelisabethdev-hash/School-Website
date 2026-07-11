import { pageMetadata } from "@/lib/seo";
import { getCoCurricular } from "@/lib/api";
import CoCurricularPageClient from "./CoCurricularPageClient";

export const metadata = pageMetadata("/co-curricular");
export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await getCoCurricular();

  return (
    <div id="body">
      <section className="content-wrapper main-content clear-fix">
        <CoCurricularPageClient items={items} />
      </section>
    </div>
  );
}
