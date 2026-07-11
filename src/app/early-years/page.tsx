import PageShell from "@/components/PageShell";
import { pageMetadata } from "@/lib/seo";
import EarlyYearsClient from "./EarlyYearsClient";

export const metadata = pageMetadata("/early-years");

export default function EarlyYearsPage() {
  return (
    <PageShell title="Early Years (Playgroup & Pre-Nursery)">
      <EarlyYearsClient />
    </PageShell>
  );
}
