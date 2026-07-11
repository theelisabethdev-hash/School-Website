import fs from "node:fs";
import path from "node:path";
import PageShell from "@/components/PageShell";
import ActivitiesBrowser, { type MonthData } from "@/components/ActivitiesBrowser";
import ShivNiketanSocietySection, {
  type SocietyCategory,
  type SocietyFile,
} from "@/components/ShivNiketanSocietySection";
import { pageMetadata } from "@/lib/seo";
import { getActivities, getSocietyItems, type Activity } from "@/lib/api";

export const metadata = pageMetadata("/activities");
export const dynamic = "force-dynamic";

const MONTH_INDEX: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif)$/i;

function subDirs(p: string): string[] {
  try {
    return fs
      .readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

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

const FILE_LABEL_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|txt)$/i;

// Scan public/shiv-niketan-society/photos/<Category>/*.jpg for the Society's
// own photo groups, kept separate from the monthly Activities above.
function getSocietyCategories(): SocietyCategory[] {
  const root = path.join(process.cwd(), "public", "shiv-niketan-society", "photos");

  return subDirs(root)
    .map((name) => {
      let images: string[] = [];
      try {
        images = fs
          .readdirSync(path.join(root, name))
          .filter((f) => IMAGE_RE.test(f))
          .sort()
          .map((f) => `/shiv-niketan-society/photos/${encodeURIComponent(name)}/${encodeURIComponent(f)}`);
      } catch {
        images = [];
      }
      return { name, images };
    })
    .filter((c) => c.images.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Scan public/shiv-niketan-society/files/* for downloadable Society documents.
function getSocietyFiles(): SocietyFile[] {
  const root = path.join(process.cwd(), "public", "shiv-niketan-society", "files");
  let names: string[] = [];
  try {
    names = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isFile() && FILE_LABEL_RE.test(d.name))
      .map((d) => d.name)
      .sort();
  } catch {
    names = [];
  }

  return names.map((name) => {
    const bytes = fs.statSync(path.join(root, name)).size;
    const sizeLabel = bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
    return { name, url: `/shiv-niketan-society/files/${encodeURIComponent(name)}`, sizeLabel };
  });
}

export default async function ActivitiesPage() {
  const apiActivities = await getActivities();
  const months = getMonthsFromApi(apiActivities);

  // Fetch society items from Firestore
  const apiSocietyItems = await getSocietyItems();

  let societyCategories: SocietyCategory[] = [];
  let societyFiles: SocietyFile[] = [];

  if (apiSocietyItems && apiSocietyItems.length > 0) {
    apiSocietyItems.forEach((item) => {
      if (item.type === "category") {
        societyCategories.push({
          name: item.name,
          images: item.images || [],
        });
      } else if (item.type === "document") {
        societyFiles.push({
          name: item.name,
          url: item.url || "",
          sizeLabel: item.sizeLabel || "",
        });
      }
    });
    // Sort items
    societyCategories.sort((a, b) => a.name.localeCompare(b.name));
    societyFiles.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Fallback to static folders if Firestore has no documents
    societyCategories = getSocietyCategories();
    societyFiles = getSocietyFiles();
  }

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

      <ShivNiketanSocietySection categories={societyCategories} files={societyFiles} />
    </PageShell>
  );
}
