"use client";

import { useState } from "react";

import { API_BASE } from "@/lib/api";

type Status = "idle" | "sending" | "sent" | "error";

function Field({
  label,
  name,
  type = "text",
  required = false,
  as = "input",
  options,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  as?: "input" | "select" | "textarea" | "file";
  options?: string[];
}) {
  return (
    <div className="col-sm-6">
      <div className="form-group">
        <label className="control-label">
          {label}
          {required && <span style={{ color: "#c0392b" }}> *</span>}
        </label>
        {as === "select" ? (
          <select name={name} required={required} className="form-control" defaultValue="">
            <option value="" disabled>Select…</option>
            {options?.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ) : as === "textarea" ? (
          <textarea name={name} required={required} rows={2} className="form-control" />
        ) : as === "file" ? (
          <input name={name} type="file" accept="image/*,.pdf" className="form-control" />
        ) : (
          <input name={name} type={type} required={required} className="form-control" />
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset style={{ marginBottom: "25px" }}>
      <legend className="Main_header" style={{ fontSize: "20px", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
        {title}
      </legend>
      <div className="row">{children}</div>
    </fieldset>
  );
}

export default function RegistrationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [studId, setStudId] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        body: new FormData(form),
      });
      if (!res.ok) throw new Error("Request failed");
      const json = await res.json();
      setStudId(json.stud_id || "");
      setStatus("sent");
      form.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="alert alert-success" style={{ padding: "30px", textAlign: "center" }}>
        <h2 className="Main_header">Thank you!</h2>
        <p>
          Your registration has been submitted successfully
          {studId && (
            <>
              . Your registration number is <strong>{studId}</strong>
            </>
          )}
          . We will contact you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="myforms" encType="multipart/form-data">
      <Section title="Registration Details">
        <Field label="Class applied for" name="reg_class" as="select" required options={["Nursery", "KG", "Class I", "Class II", "Class III", "Class IV", "Class V"]} />
        <Field label="Academic session" name="academic" required />
      </Section>

      <Section title="Student Details">
        <Field label="Student's name" name="student_name" required />
        <Field label="Date of birth" name="studdob" type="date" required />
        <Field label="Date of birth (in words)" name="words_dob" />
        <Field label="Sex" name="sex" as="select" options={["Male", "Female", "Other"]} />
        <Field label="Nationality" name="nationality" />
        <Field label="Category" name="category" as="select" options={["General", "OBC", "SC", "ST", "EWS"]} />
        <Field label="Aadhaar card number" name="adhar_card_no" />
        <Field label="Blood group" name="blood_group" />
      </Section>

      <Section title="Father's Details">
        <Field label="Father's name" name="father_name" required />
        <Field label="Profession" name="father_profession" />
        <Field label="Designation" name="f_designation" />
        <Field label="Mobile number" name="f_mobile_no" type="tel" />
        <Field label="Email" name="f_mail_id" type="email" />
        <Field label="Telephone" name="f_telephone" type="tel" />
        <Field label="Office address" name="f_address" as="textarea" />
        <Field label="Residence address" name="fr_address" as="textarea" />
      </Section>

      <Section title="Mother's Details">
        <Field label="Mother's name" name="m_name" required />
        <Field label="Profession" name="m_profession" />
        <Field label="Designation" name="m_designation" />
        <Field label="Mobile number" name="m_mobile" type="tel" />
        <Field label="Email" name="m_email_id" type="email" />
        <Field label="Mother tongue" name="mo_tongue" />
        <Field label="Office address" name="mo_address" as="textarea" />
        <Field label="Residence address" name="mr_address" as="textarea" />
      </Section>

      <Section title="Guardian's Details (if applicable)">
        <Field label="Guardian's name" name="g_name" />
        <Field label="Relation" name="g_relation" />
        <Field label="Profession" name="g_profession" />
        <Field label="Mobile number" name="g_mobile" type="tel" />
        <Field label="Email" name="g_mail_id" type="email" />
        <Field label="Address" name="go_address" as="textarea" />
      </Section>

      <Section title="Family & Sibling Details">
        <Field label="Single parent?" name="single_parent" as="select" options={["No", "Yes"]} />
        <Field label="Special child?" name="special_child" as="select" options={["No", "Yes"]} />
        <Field label="If yes, details" name="special_child_details" />
        <Field label="Sibling in school?" name="sibling" as="select" options={["No", "Yes"]} />
        <Field label="Sibling's name" name="sibling_name" />
        <Field label="Sibling's class/section" name="sibling_section" />
      </Section>

      <Section title="Previous Schooling & Health">
        <Field label="Attended school before?" name="last_school" as="select" options={["No", "Yes"]} />
        <Field label="Previous school name" name="last_school_name" />
        <Field label="Previous school address" name="last_school_address" as="textarea" />
        <Field label="Alumni family?" name="alumni" as="select" options={["No", "Yes"]} />
        <Field label="School transport required?" name="sc_transport" as="select" options={["No", "Yes"]} />
        <Field label="General health" name="health" />
        <Field label="Any illness" name="illness" />
        <Field label="Regular medication" name="medication" />
        <Field label="Any allergy?" name="allergy" as="select" options={["No", "Yes"]} />
        <Field label="If yes, specify allergy" name="allergy_specify" />
      </Section>

      <Section title="Documents & Payment">
        <Field label="Child's photograph" name="child_photo" as="file" />
        <Field label="Birth certificate" name="child_cert" as="file" />
        <Field label="Residence proof" name="residence_proof" as="file" />
        <Field label="Payment receipt (₹25 form fee)" name="payement_image" as="file" />
      </Section>

      <div style={{ marginTop: "10px" }}>
        <button type="submit" disabled={status === "sending"} className="btn btn-primary">
          {status === "sending" ? "Submitting…" : "Submit Registration"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-danger" style={{ marginTop: "10px" }}>
            Submission failed. Please check your details and try again.
          </p>
        )}
      </div>
    </form>
  );
}
