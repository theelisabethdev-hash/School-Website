import { pageMetadata } from "@/lib/seo";
import { getFacilities } from "@/lib/api";
import FacilitiesPageClient from "./FacilitiesPageClient";

export const metadata = pageMetadata("/facilities");
export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await getFacilities();

  return (
    <div id="body">
      <section className="content-wrapper main-content clear-fix">
        <FacilitiesPageClient items={items} />
      </section>
    </div>
  );
}

