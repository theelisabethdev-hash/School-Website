import PageShell from "@/components/PageShell";
import ActivitiesBrowser, { type MonthData } from "@/components/ActivitiesBrowser";
import { pageMetadata } from "@/lib/seo";
import { getActivities, type Activity } from "@/lib/api";

export const metadata = pageMetadata("/activities");
export const dynamic = "force-dynamic";

const MONTH_INDEX: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

// Convert activities fetched from Firebase API into structured MonthData format
function getMonthsFromApi(apiActivities: Activity[]): MonthData[] {
  const groups: Record<string, { title: string; content?: string; images: string[] }[]> = {};

  apiActivities.forEach((act) => {
    const titleRaw = act.title || "";
    const images = act.images || [];
    if (images.length === 0) return;

    // Parse the month from title in format: "Activity Title (Month YYYY)"
    const match = titleRaw.match(/^(.*?)\s*\(([^)]+)\)$/);
    let title = titleRaw;
    let month = "General";

    if (match) {
      title = match[1].trim();
      month = match[2].trim().replace(/-/g, " ");
    }

    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push({ title, content: act.content, images });
  });

  return Object.entries(groups)
    .map(([month, activities]) => {
      const parts = month.split(/[\s-]+/);
      const mi = MONTH_INDEX[(parts[0] || "").toLowerCase()];
      const year = parseInt(parts[1] || "", 10);
      const sortKey = Number.isFinite(year) && mi !== undefined ? year * 12 + mi : -1;

      // Sort activities inside this month alphabetically
      activities.sort((a, b) => a.title.localeCompare(b.title));

      return { name: month, sortKey, activities };
    })
    .sort((a, b) => b.sortKey - a.sortKey);
}

export default async function ActivitiesPage() {
  const apiActivities = await getActivities();
  const months = getMonthsFromApi(apiActivities);

  return (
    <PageShell
      title="Activities & Events"
      intro="Highlights from our school activities and events. Pick a month, then click an activity to view its photos."
    >
      {months.length === 0 ? (
        <p className="Main_header three">
          Our activities are being updated. Please check back soon for highlights from school events.
        </p>
      ) : (
        <ActivitiesBrowser months={months} />
      )}
    </PageShell>
  );
}
