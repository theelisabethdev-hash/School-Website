/** Pure data model for the admissions page. No React in here. */

export type Registration = {
  id: string;
  stud_id?: string;
  reg_class: string;
  academic: string;
  student_name: string;
  studdob: string;
  words_dob?: string;
  sex?: string;
  nationality?: string;
  category?: string;
  adhar_card_no?: string;
  blood_group?: string;
  father_name: string;
  father_profession?: string;
  f_designation?: string;
  f_mobile_no?: string;
  f_mail_id?: string;
  f_telephone?: string;
  f_address?: string;
  fr_address?: string;
  m_name: string;
  m_profession?: string;
  m_designation?: string;
  m_mobile?: string;
  m_email_id?: string;
  mo_tongue?: string;
  mo_address?: string;
  mr_address?: string;
  g_name?: string;
  g_relation?: string;
  g_profession?: string;
  g_mobile?: string;
  g_mail_id?: string;
  go_address?: string;
  single_parent?: string;
  special_child?: string;
  special_child_details?: string;
  sibling?: string;
  sibling_name?: string;
  sibling_section?: string;
  last_school?: string;
  last_school_name?: string;
  last_school_address?: string;
  alumni?: string;
  sc_transport?: string;
  health?: string;
  illness?: string;
  medication?: string;
  allergy?: string;
  allergy_specify?: string;
  documents?: {
    child_photo?: string;
    child_cert?: string;
    residence_proof?: string;
    payement_image?: string;
    adhar_card?: string;
    cert_copy?: string;
  };
  per_name?: string;
  per_email?: string;
  per_mobile?: string;
  trans_id?: string;
  per_date_time?: string;
  doe?: string;
  timestamp?: { _seconds: number; _nanoseconds?: number };
};

export type FormUpload = {
  id: string;
  per_name: string;
  per_email: string;
  per_mobile: string;
  trans_id: string;
  per_date_time: string;
  pdf_doc?: string;
  payement_image?: string;
  document?: string;
  doe?: string;
  timestamp?: { _seconds: number; _nanoseconds?: number };
};

export type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; registrations: Registration[]; uploads: FormUpload[] };

export type Tab = "online" | "uploads";

/* ---------- Classes ---------- */

export const CLASSES: { key: string; label: string }[] = [
  { key: "Nursery", label: "Nursery" },
  { key: "KG", label: "KG" },
  ...Array.from({ length: 12 }, (_, i) => ({ key: `CLASS${i + 1}`, label: `Class ${i + 1}` })),
];

export function classLabel(key: string): string {
  return CLASSES.find((c) => c.key === key)?.label ?? key;
}

/** Known classes in school order, unknown keys after them in alphabetical order. */
export function compareClassKeys(a: string, b: string): number {
  const rank = (k: string) => {
    const i = CLASSES.findIndex((c) => c.key === k);
    return i === -1 ? CLASSES.length : i;
  };
  return rank(a) - rank(b) || a.localeCompare(b);
}

/* ---------- Form numbers ---------- */

export type FormNo = { session: string; n: number };

/** "ON009/2027-28" becomes { session: "2027-28", n: 9 }. Old 6-digit numbers return null. */
export function parseFormNo(studId?: string): FormNo | null {
  const m = /^ON(\d+)\/(\d{4}-\d{2,4})$/i.exec((studId ?? "").trim());
  return m ? { session: m[2], n: Number(m[1]) } : null;
}

const sessionYear = (s: string) => parseInt(s, 10) || 0;

/** The newest session present in the data, used to hide the session on current rows. */
export function currentSession(regs: Registration[]): string {
  return regs.reduce((best, r) => (sessionYear(r.academic) > sessionYear(best) ? r.academic : best), "");
}

/* ---------- Dates ---------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Stamped = { timestamp?: { _seconds: number; _nanoseconds?: number }; doe?: string };

/** The API serialises Firestore timestamps as { _seconds }. Falls back to doe ("dd/mm/yyyy"). */
export function submittedAt(r: Stamped): Date | null {
  if (typeof r.timestamp?._seconds === "number") return new Date(r.timestamp._seconds * 1000);
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(r.doe ?? "");
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}

export function formatDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(d: Date): string {
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

export function formatDateTime(d: Date): string {
  return `${formatDate(d)}, ${formatTime(d)}`;
}

const dayNumber = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);

export function formatRelative(d: Date, now: Date = new Date()): string {
  const days = dayNumber(now) - dayNumber(d);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 6) return `${days} days ago`;
  return formatDate(d);
}

/** "2023-06-09" becomes "9 Jun 2023". Anything else is returned untouched. */
export function formatIsoDate(s?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s ?? "");
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : (s ?? "");
}

/** "2026-11-20T10:30" becomes "20 Nov 2026, 10:30 am". */
export function formatIsoDateTime(s?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(s ?? "");
  if (!m) return formatIsoDate(s);
  return `${formatIsoDate(s)}, ${formatTime(new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]))}`;
}

/* ---------- Other formatters ---------- */

/** Groups 10-digit Indian mobiles as "98100 11009". Anything else is left as typed. */
export function formatPhone(p?: string): string {
  const digits = (p ?? "").replace(/\D/g, "");
  const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return /^\d{10}$/.test(ten) && /^[\d\s]+$/.test(p ?? "") ? `${ten.slice(0, 5)} ${ten.slice(5)}` : (p ?? "");
}

export function genderLabel(sex?: string): string {
  const s = (sex ?? "").trim().toUpperCase();
  return s === "M" ? "Boy" : s === "F" ? "Girl" : (sex ?? "");
}

export const has = (v?: string | null): v is string => !!v && v.trim() !== "";

export function primaryParent(r: Registration): { name: string; mobile: string } {
  return has(r.father_name)
    ? { name: r.father_name, mobile: r.f_mobile_no ?? "" }
    : { name: r.m_name ?? "", mobile: r.m_mobile ?? "" };
}

export const hasReceipt = (r: Registration) => has(r.documents?.payement_image);

/* ---------- Search ---------- */

const digitsOf = (s?: string) => (s ?? "").replace(/\D/g, "");

function matchesFields(texts: (string | undefined)[], phones: (string | undefined)[], query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (texts.some((t) => (t ?? "").toLowerCase().includes(q))) return true;
  const qd = digitsOf(q);
  return /^[\d\s+-]+$/.test(q) && qd !== "" && phones.some((p) => digitsOf(p).includes(qd));
}

export const matchesRegistration = (r: Registration, query: string) =>
  matchesFields(
    [r.stud_id, r.student_name, r.father_name, r.m_name, r.f_mobile_no, r.m_mobile, r.f_mail_id, r.m_email_id, r.trans_id],
    [r.f_mobile_no, r.m_mobile],
    query,
  );

export const matchesUpload = (u: FormUpload, query: string) =>
  matchesFields([u.per_name, u.per_email, u.per_mobile, u.trans_id], [u.per_mobile], query);

/* ---------- Sorting ---------- */

type Cmp<T> = (a: T, b: T) => number;

// Milliseconds with the sub-millisecond part kept, so records saved within the
// same second still sort in submission order.
const time = (r: Stamped) =>
  typeof r.timestamp?._seconds === "number"
    ? r.timestamp._seconds * 1000 + (r.timestamp._nanoseconds ?? 0) / 1e6
    : (submittedAt(r)?.getTime() ?? null);

/** Newest first, records without a date last. */
function byTime(dir: 1 | -1): Cmp<Stamped> {
  return (a, b) => {
    const x = time(a);
    const y = time(b);
    if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1;
    return (x - y) * -dir;
  };
}

const byFormNo: Cmp<Registration> = (a, b) => {
  const x = parseFormNo(a.stud_id);
  const y = parseFormNo(b.stud_id);
  if (!x || !y) return x === y ? byTime(-1)(a, b) : x ? -1 : 1;
  return sessionYear(x.session) - sessionYear(y.session) || x.n - y.n;
};

export type SortKey = "newest" | "oldest" | "formno" | "name";

export const SORTS: {
  key: SortKey;
  label: string;
  compare: Cmp<Registration>;
  /** Absent when the sort has no meaning for form uploads. */
  compareUpload?: Cmp<FormUpload>;
}[] = [
  { key: "newest", label: "Newest first", compare: byTime(1), compareUpload: byTime(1) },
  { key: "oldest", label: "Oldest first", compare: byTime(-1), compareUpload: byTime(-1) },
  { key: "formno", label: "Form number", compare: byFormNo },
  {
    key: "name",
    label: "Student name",
    compare: (a, b) => a.student_name.localeCompare(b.student_name),
    compareUpload: (a, b) => a.per_name.localeCompare(b.per_name),
  },
];

export const DEFAULT_SORT: SortKey = "newest";

export const isSortKey = (v: string | null): v is SortKey => SORTS.some((s) => s.key === v);
