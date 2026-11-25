/**
 * Fills the school's offline registration form (public/templates/empty_form.pdf,
 * the same file parents download) with an online registration, then appends
 * the uploaded documents. Restored from the version that was live until
 * 24 Nov 2026 but was never committed; every coordinate below is unchanged.
 *
 * Coordinates are in pixels of a 2x scan of the form, measured from the top
 * left, so each one is halved and flipped into PDF points.
 */
import { PDFDocument, PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { Registration } from "./model";

const BLACK = rgb(0, 0, 0);
const A4: [number, number] = [595.28, 841.89];

type Line = { x: number; y: number; maxWidthPx: number };

const DOCUMENTS: [keyof NonNullable<Registration["documents"]>, string][] = [
  ["child_cert", "Attached Document: Birth Certificate of the Child"],
  ["residence_proof", "Attached Document: Residence Address Proof"],
  ["payement_image", "Attached Document: Payment Receipt / Screenshot"],
  ["adhar_card", "Attached Document: Aadhaar Card of the Child"],
  ["cert_copy", "Attached Document: Report Card of Last School"],
];

/** Storage files send no CORS headers, so the browser fetches them through our own route. */
const proxied = (url: string) => `/doc-proxy?url=${encodeURIComponent(url)}`;

const norm = (v?: string) => (v || "").trim().toLowerCase();

export async function buildApplicationPdf(r: Registration): Promise<Uint8Array> {
  const template = await fetch("/templates/empty_form.pdf").then((res) => {
    if (!res.ok) throw new Error(`Form template returned ${res.status}`);
    return res.arrayBuffer();
  });
  const pdf = await PDFDocument.load(template);
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const height = pages[0].getHeight();

  /** One line of text, shrunk (down to 6pt) until it fits maxWidthPx. */
  const text = (page: PDFPage, x: number, y: number, value: unknown, maxWidthPx = 300, size = 9) => {
    const str = (value ?? "").toString().trim();
    if (!str) return;
    let s = size;
    while (font.widthOfTextAtSize(str, s) > maxWidthPx / 2 && s > 6) s -= 0.5;
    page.drawText(str, { x: x / 2, y: height - y / 2, size: s, font, color: BLACK });
  };

  /** Word-wraps across the given lines; text that doesn't fit is dropped. */
  const wrap = (page: PDFPage, lines: Line[], value: unknown, size = 9) => {
    const str = (value ?? "").toString().trim();
    if (!str) return;
    const out: string[] = [];
    let i = 0;
    let cur = "";
    for (const word of str.split(/\s+/)) {
      if (i >= lines.length) break;
      const next = cur ? `${cur} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= lines[i].maxWidthPx / 2) cur = next;
      else {
        out.push(cur);
        i += 1;
        cur = word;
      }
    }
    if (cur && i < lines.length) out.push(cur);
    out.forEach((line, n) => text(page, lines[n].x, lines[n].y, line, lines[n].maxWidthPx, size));
  };

  /** An X centred on a tick box. */
  const tick = (page: PDFPage, x: number, y: number, on: boolean) => {
    if (!on) return;
    const w = font.widthOfTextAtSize("X", 10);
    page.drawText("X", { x: x / 2 - w / 2, y: height - y / 2 - 5 + 1, size: 10, font, color: BLACK });
  };

  /** One digit centred in a date-of-birth box. */
  const digit = (page: PDFPage, x1: number, x2: number, y1: number, y2: number, d: string) => {
    if (!d) return;
    const w = font.widthOfTextAtSize(d, 10);
    page.drawText(d, { x: (x1 + x2) / 4 - w / 2, y: height - (y1 + y2) / 4 - 5 + 1, size: 10, font, color: BLACK });
  };

  // Page 1: class, student, parents' names.
  const p1 = pages[0];
  text(p1, 365, 668, `${r.reg_class || ""}${r.academic ? ` (${r.academic})` : ""}`, 700);
  text(p1, 615, 750, r.student_name, 460);
  const dob = /^(\d{4})-(\d{2})-(\d{2})$/.exec(r.studdob || "");
  if (dob) {
    const [, y, m, d] = dob;
    digit(p1, 361, 391, 805, 838, d[0]);
    digit(p1, 391, 421, 805, 838, d[1]);
    digit(p1, 507, 538, 805, 838, m[0]);
    digit(p1, 538, 569, 805, 838, m[1]);
    digit(p1, 657, 691, 805, 838, y[0]);
    digit(p1, 691, 725, 805, 838, y[1]);
    digit(p1, 725, 759, 805, 838, y[2]);
    digit(p1, 759, 793, 805, 838, y[3]);
  }
  text(p1, 300, 897, r.words_dob, 780);
  tick(p1, 331, 1055, norm(r.sex) === "male");
  tick(p1, 483, 1055, norm(r.sex) === "female");
  text(p1, 335, 1105, r.nationality, 460);
  text(p1, 1005, 1105, r.mo_tongue, 170);
  tick(p1, 456, 1160, r.category === "General");
  tick(p1, 605, 1160, r.category === "OBC");
  tick(p1, 731, 1160, r.category === "SC");
  tick(p1, 835, 1160, r.category === "ST");
  text(p1, 512, 1260, r.adhar_card_no, 570);
  text(p1, 407, 1368, r.father_name, 675);
  text(p1, 298, 1418, r.father_profession, 790);
  if (r.documents?.child_photo) {
    try {
      const bytes = await fetchBytes(r.documents.child_photo);
      const img = await embedImage(pdf, bytes.bytes, bytes.contentType);
      const fit = img.scaleToFit(99, 105.5);
      p1.drawImage(img, { x: 437.5 + (105 - fit.width) / 2, y: 568 + (111.5 - fit.height) / 2, width: fit.width, height: fit.height });
    } catch (err) {
      console.error("Failed to embed student photo:", err);
    }
  }

  // Page 2: father's and mother's details, guardian.
  const p2 = pages[1];
  text(p2, 310, 143, r.f_designation, 810);
  wrap(p2, [{ x: 345, y: 190, maxWidthPx: 775 }, { x: 175, y: 246, maxWidthPx: 945 }], r.f_address);
  wrap(p2, [{ x: 400, y: 296, maxWidthPx: 720 }, { x: 175, y: 356, maxWidthPx: 945 }], r.fr_address);
  text(p2, 445, 404, r.f_telephone, 675);
  text(p2, 305, 511, r.f_mobile_no, 815);
  text(p2, 275, 566, r.f_mail_id, 845);
  text(p2, 340, 620, r.m_name, 780);
  text(p2, 295, 676, r.m_profession, 825);
  text(p2, 310, 785, r.m_designation, 810);
  wrap(p2, [{ x: 345, y: 841, maxWidthPx: 775 }, { x: 175, y: 898, maxWidthPx: 945 }], r.mo_address);
  wrap(p2, [{ x: 400, y: 953, maxWidthPx: 720 }, { x: 175, y: 1013, maxWidthPx: 945 }], r.mr_address);
  text(p2, 305, 1168, r.m_mobile, 815);
  text(p2, 275, 1223, r.m_email_id, 845);
  text(p2, 365, 1278, r.g_name, 755);
  text(p2, 415, 1331, r.g_relation, 705);
  text(p2, 288, 1385, r.g_profession, 832);

  // Page 3: guardian contact, family and previous school.
  const p3 = pages[2];
  wrap(p3, [{ x: 345, y: 250, maxWidthPx: 775 }, { x: 175, y: 306, maxWidthPx: 945 }], r.go_address);
  text(p3, 305, 608, r.g_mobile, 815);
  text(p3, 288, 663, r.g_mail_id, 832);
  tick(p3, 509, 720, norm(r.single_parent) === "yes");
  tick(p3, 610, 720, norm(r.single_parent) === "no");
  tick(p3, 662, 785, norm(r.special_child) === "yes");
  tick(p3, 784, 785, norm(r.special_child) === "no");
  wrap(p3, [{ x: 712, y: 845, maxWidthPx: 410 }, { x: 180, y: 908, maxWidthPx: 945 }], r.special_child_details);
  tick(p3, 570, 1032, norm(r.sibling) === "yes");
  tick(p3, 670, 1032, norm(r.sibling) === "no");
  text(p3, 295, 1158, r.sibling_name, 600);
  text(p3, 392, 1232, r.sibling_section, 505);
  const lastSchool = [r.last_school_name, r.last_school_address].filter(Boolean).join(", ");
  wrap(p3, [{ x: 712, y: 1273, maxWidthPx: 405 }, { x: 180, y: 1335, maxWidthPx: 945 }], lastSchool);
  tick(p3, 730, 1405, norm(r.alumni) === "yes");
  tick(p3, 822, 1405, norm(r.alumni) === "no");
  tick(p3, 642, 1465, norm(r.sc_transport) === "yes");
  tick(p3, 741, 1465, norm(r.sc_transport) === "no");

  // Page 4: medical history and undertaking.
  const p4 = pages[3];
  text(p4, 305, 195, r.blood_group, 385);
  text(p4, 350, 250, r.health, 365);
  tick(p4, 638, 310, norm(r.illness) === "yes");
  tick(p4, 740, 310, norm(r.illness) === "no");
  tick(p4, 639, 422, norm(r.medication) === "yes");
  tick(p4, 740, 422, norm(r.medication) === "no");
  tick(p4, 760, 533, norm(r.allergy) === "yes");
  tick(p4, 850, 533, norm(r.allergy) === "no");
  wrap(p4, [{ x: 385, y: 590, maxWidthPx: 715 }, { x: 180, y: 650, maxWidthPx: 945 }], r.allergy_specify);
  text(p4, 130, 1122, r.father_name || r.m_name, 360);
  text(p4, 800, 1122, r.student_name, 295);

  // Uploaded documents: images first, one per page, then PDFs merged whole.
  const fetched: { label: string; url: string; contentType: string; bytes: ArrayBuffer }[] = [];
  for (const [key, label] of DOCUMENTS) {
    const url = r.documents?.[key];
    if (!url) continue;
    try {
      fetched.push({ label, url, ...(await fetchBytes(url)) });
    } catch (err) {
      console.error("Failed to fetch document:", label, url, err);
    }
  }
  const isPdf = (d: { contentType: string; url: string }) => d.contentType.includes("pdf") || d.url.toLowerCase().includes(".pdf");
  for (const d of fetched.filter((d) => !isPdf(d))) {
    try {
      const img = await embedImage(pdf, d.bytes, d.contentType);
      const page = pdf.addPage(A4);
      const fit = img.scaleToFit(500, 700);
      page.drawImage(img, { x: page.getWidth() / 2 - fit.width / 2, y: (page.getHeight() - 70 - fit.height) / 2, width: fit.width, height: fit.height });
      page.drawText(d.label, { x: 50, y: 800, size: 14, font, color: BLACK });
    } catch (err) {
      console.error("Failed to embed image document:", d.label, err);
    }
  }
  for (const d of fetched.filter(isPdf)) {
    try {
      pdf.addPage(A4).drawText(d.label, { x: 50, y: 780, size: 14, font, color: BLACK });
      const src = await PDFDocument.load(d.bytes);
      for (const page of await pdf.copyPages(src, src.getPageIndices())) pdf.addPage(page);
    } catch (err) {
      console.error("Failed to merge PDF document:", d.label, err);
    }
  }

  return pdf.save();
}

async function fetchBytes(url: string) {
  const res = await fetch(proxied(url));
  if (!res.ok) throw new Error(`Document proxy returned ${res.status}`);
  return { contentType: (res.headers.get("content-type") || "").toLowerCase(), bytes: await res.arrayBuffer() };
}

/** pdf-lib reads only JPEG and PNG; anything else the browser can decode is re-encoded as JPEG. */
async function embedImage(pdf: PDFDocument, bytes: ArrayBuffer, contentType: string) {
  try {
    return contentType.includes("png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
  } catch {
    try {
      return await pdf.embedPng(bytes);
    } catch {
      return pdf.embedJpg(await toJpeg(bytes, contentType));
    }
  }
}

async function toJpeg(bytes: ArrayBuffer, contentType: string): Promise<Uint8Array> {
  const url = URL.createObjectURL(new Blob([bytes], { type: contentType || "image/jpeg" }));
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Unable to decode image"));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const bin = atob(canvas.toDataURL("image/jpeg", 0.92).split(",")[1]);
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } finally {
    URL.revokeObjectURL(url);
  }
}
