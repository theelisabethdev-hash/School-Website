// Imports & compresses activity photos from the local "Activity folder".
//
// Source layout:  <root>/<Month YYYY>/<Activity title>/*.jpg
// Output layout:  web/public/activities/<Month YYYY>/<Activity title>/*.jpg
//
// Each image is resized to fit within 1280px and re-encoded as mozjpeg q78 so
// the gallery stays light. Re-run whenever the source folder changes:
//   node scripts/import-activities.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "C:/Users/singh/phpschool/Activity folder";
const OUT = path.join(process.cwd(), "public", "activities");

const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif)$/i;
const MAX_DIM = 1280;
const QUALITY = 78;

function dirs(p) {
  try {
    return fs
      .readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

let months = 0;
let activities = 0;
let images = 0;
let srcBytes = 0;
let outBytes = 0;

for (const month of dirs(SRC)) {
  const monthSrc = path.join(SRC, month);
  const activityNames = dirs(monthSrc);
  if (activityNames.length === 0) continue;
  months += 1;

  for (const activity of activityNames) {
    const actSrc = path.join(monthSrc, activity);
    const actOut = path.join(OUT, month, activity);
    fs.mkdirSync(actOut, { recursive: true });
    activities += 1;

    const files = fs
      .readdirSync(actSrc)
      .filter((f) => IMAGE_RE.test(f))
      .sort();

    for (const file of files) {
      const from = path.join(actSrc, file);
      // Always output .jpg so the gallery loads a single, well-compressed format.
      const to = path.join(actOut, file.replace(IMAGE_RE, ".jpg"));
      srcBytes += fs.statSync(from).size;

      await sharp(from)
        .rotate() // respect EXIF orientation
        .resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(to);

      outBytes += fs.statSync(to).size;
      images += 1;
    }
  }
}

const mb = (b) => (b / 1024 / 1024).toFixed(1);
console.log(
  `Imported ${images} photos across ${activities} activities in ${months} months.`
);
console.log(`Size: ${mb(srcBytes)} MB -> ${mb(outBytes)} MB compressed.`);
