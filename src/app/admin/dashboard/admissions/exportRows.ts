import {
  type FormUpload,
  type Registration,
  classLabel,
  formatDateTime,
  formatIsoDate,
  genderLabel,
  hasReceipt,
  submittedAt,
} from "./model";

const stamp = (r: { timestamp?: { _seconds: number }; doe?: string }) => {
  const d = submittedAt(r);
  return d ? formatDateTime(d) : "";
};

export const registrationRows = (rows: Registration[]) =>
  rows.map((r) => ({
    "Form No": r.stud_id ?? "",
    "Student Name": r.student_name,
    Class: classLabel(r.reg_class),
    Session: r.academic,
    DOB: formatIsoDate(r.studdob),
    Gender: genderLabel(r.sex),
    Category: r.category ?? "",
    "Father Name": r.father_name,
    "Father Mobile": r.f_mobile_no ?? "",
    "Father Email": r.f_mail_id ?? "",
    "Mother Name": r.m_name,
    "Mother Mobile": r.m_mobile ?? "",
    "Mother Email": r.m_email_id ?? "",
    "Transaction ID": r.trans_id ?? "",
    Receipt: hasReceipt(r) ? "Yes" : "No",
    Submitted: stamp(r),
    "Registration ID": r.id,
  }));

export const uploadRows = (rows: FormUpload[]) =>
  rows.map((u) => ({
    "Parent Name": u.per_name,
    Email: u.per_email,
    Mobile: u.per_mobile,
    "Transaction ID": u.trans_id,
    "Transaction Time": u.per_date_time,
    Submitted: stamp(u),
    "Registration Form PDF": u.pdf_doc || "None",
    "Payment Receipt": u.payement_image || "None",
    "Supporting Doc": u.document || "None",
    "Submission ID": u.id,
  }));
