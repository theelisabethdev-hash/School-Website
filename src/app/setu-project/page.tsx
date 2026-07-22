import fs from "node:fs";
import path from "node:path";
import ShivNiketanSocietySection, {
  type SocietyCategory,
  type SocietyFile,
} from "@/components/ShivNiketanSocietySection";
import { pageMetadata } from "@/lib/seo";
import { getSocietyItems } from "@/lib/api";
import html from "@/content/setu-project";

export const metadata = pageMetadata("/setu-project");
export const dynamic = "force-dynamic";

const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif)$/i;
const FILE_LABEL_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|txt)$/i;

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

// Scan public/shiv-niketan-society/photos/<Category>/*.jpg for the Society's
// own photo groups
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

export default async function SetuProjectPage() {
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
    <div id="body">
      <section
        className="content-wrapper main-content clear-fix"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="container" style={{ paddingBottom: "40px" }}>
        <ShivNiketanSocietySection categories={societyCategories} files={societyFiles} />
      </div>
    </div>
  );
}
