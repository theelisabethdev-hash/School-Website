"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type Status = "idle" | "sending" | "sent" | "error";

function Field({
  label,
  name,
  type = "text",
  required = false,
  as = "input",
  accept,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  as?: "input" | "textarea" | "file";
  accept?: string;
}) {
  return (
    <div className="col-md-6" style={{ marginBottom: "15px" }}>
      <div className="form-group">
        <label className="control-label">
          {label}
          {required && <span style={{ color: "#c0392b" }}> *</span>}
        </label>
        {as === "textarea" ? (
          <textarea name={name} required={required} rows={2} className="form-control" />
        ) : as === "file" ? (
          <input name={name} type="file" required={required} accept={accept} className="form-control" />
        ) : (
          <input name={name} type={type} required={required} className="form-control" />
        )}
      </div>
    </div>
  );
}

export default function FormSubmissionForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    try {
      const res = await fetch(`${API_BASE}/form_submission.php`, {
        method: "POST",
        body: new FormData(form),
      });
      if (!res.ok) throw new Error("Request failed");
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
        <h2 className="Main_header" style={{ color: "#27ae60" }}>Submitted Successfully!</h2>
        <p style={{ fontSize: "16px", marginTop: "10px" }}>
          Your filled registration form and payment receipt have been uploaded successfully. We will review your submission and contact you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="myforms" encType="multipart/form-data">
      <fieldset style={{ marginBottom: "25px" }}>
        <legend className="Main_header" style={{ fontSize: "20px", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
          Applicant Information
        </legend>
        <div className="row">
          <Field label="Parent/Guardian Name" name="per_name" required />
          <Field label="Email Address" name="per_email" type="email" required />
          <Field label="Mobile Number" name="per_mobile" type="tel" required />
        </div>
      </fieldset>

      <fieldset style={{ marginBottom: "25px" }}>
        <legend className="Main_header" style={{ fontSize: "20px", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
          Payment & Transaction Details
        </legend>
        <div className="row">
          <Field label="Transaction ID / Reference ID" name="trans_id" required />
          <Field label="Transaction Date & Time" name="per_date_time" type="datetime-local" required />
        </div>
      </fieldset>

      <fieldset style={{ marginBottom: "25px" }}>
        <legend className="Main_header" style={{ fontSize: "20px", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
          Upload Documents (Max 5MB each)
        </legend>
        <div className="row">
          <Field
            label="Filled Registration Form (PDF format only)"
            name="pdf_doc"
            as="file"
            accept=".pdf"
            required
          />
          <Field
            label="Payment Receipt Screenshot"
            name="image"
            as="file"
            accept="image/*,.pdf"
            required
          />
          <Field
            label="Supporting Document (optional, PDF format only)"
            name="document"
            as="file"
            accept=".pdf"
          />
        </div>
      </fieldset>

      <div style={{ marginTop: "20px" }}>
        <button type="submit" disabled={status === "sending"} className="btn btn-primary">
          {status === "sending" ? "Uploading files…" : "Submit Registration Files"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-danger" style={{ marginTop: "15px" }}>
            Upload failed. Please check your network connection and file sizes, then try again.
          </p>
        )}
      </div>
    </form>
  );
}
