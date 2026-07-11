// Imports Shiv Niketan Society photos & files from a local source folder,
// kept separate from the monthly school Activities.
//
// Source layout:
//   <root>/Photos/<Category>/*.jpg|png|...   -> compressed like activities
//   <root>/Files/*.pdf|docx|...              -> copied as-is (downloadable docs)
//
// Output layout:
//   web/public/shiv-niketan-society/photos/<Category>/*.jpg
//   web/public/shiv-niketan-society/files/*
//
// Re-run whenever the source folder changes:
//   node scripts/import-shiv-niketan-society.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "C:/Users/singh/phpschool/Shiv Niketan Society folder";
const OUT = path.join(process.cwd(), "public", "shiv-niketan-society");

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

function files(p) {
  try {
    return fs
      .readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

let categories = 0;
let photos = 0;
let docs = 0;
let srcBytes = 0;
let outBytes = 0;

// --- Photos (compressed, grouped by category) ---
const photosSrc = path.join(SRC, "Photos");
const photosOut = path.join(OUT, "photos");
for (const category of dirs(photosSrc)) {
  const catSrc = path.join(photosSrc, category);
  const catOut = path.join(photosOut, category);
  const imgFiles = files(catSrc).filter((f) => IMAGE_RE.test(f)).sort();
  if (imgFiles.length === 0) continue;

  fs.mkdirSync(catOut, { recursive: true });
  categories += 1;

  for (const file of imgFiles) {
    const from = path.join(catSrc, file);
    const to = path.join(catOut, file.replace(IMAGE_RE, ".jpg"));
    srcBytes += fs.statSync(from).size;

    await sharp(from)
      .rotate()
      .resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(to);

    outBytes += fs.statSync(to).size;
    photos += 1;
  }
}

// --- Files (copied as-is, flat list) ---
const filesSrc = path.join(SRC, "Files");
const filesOut = path.join(OUT, "files");
const docFiles = files(filesSrc).sort();
if (docFiles.length > 0) {
  fs.mkdirSync(filesOut, { recursive: true });
  for (const file of docFiles) {
    fs.copyFileSync(path.join(filesSrc, file), path.join(filesOut, file));
    docs += 1;
  }
}

const mb = (b) => (b / 1024 / 1024).toFixed(1);
console.log(
  `Imported ${photos} photos across ${categories} categories, and ${docs} files.`
);
console.log(`Photo size: ${mb(srcBytes)} MB -> ${mb(outBytes)} MB compressed.`);
