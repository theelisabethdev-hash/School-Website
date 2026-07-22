"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type Status = "idle" | "sending" | "sent" | "error";

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
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="row">
        <div className="col-md-12">

          {/* Registration Form PDF Upload */}
          <div className="col-md-12">
            <div className="control-group form-group">
              <label className="labelfont">
                Registration Form Pdf Upload<span className="Redcolor">*</span>
              </label>
              <input
                required
                name="pdf_doc"
                accept=".pdf"
                type="file"
                className="form-control pull-right MandetoryField"
                placeholder="Registration Date"
              />
              <p className="help-block"></p>
            </div>
          </div>

          {/* Name */}
          <div className="col-md-12">
            <div className="control-group form-group">
              <div className="controls">
                <label className="labelfont">
                  Name<span className="Redcolor">*</span>
                </label>
                <input
                  required
                  name="per_name"
                  type="text"
                  maxLength={20}
                  className="form-control pull-right MandetoryField"
                  placeholder="Full Name"
                />
                <p className="help-block"></p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="col-md-12">
            <div className="control-group form-group">
              <div className="controls">
                <label className="labelfont">
                  Email<span className="Redcolor">*</span>
                </label>
                <input
                  required
                  name="per_email"
                  type="email"
                  className="form-control pull-right MandetoryField"
                  placeholder="Email Id"
                />
                <p className="help-block"></p>
              </div>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="col-md-12">
            <div className="control-group form-group">
              <div className="controls">
                <label className="labelfont">
                  Mobile Number<span className="Redcolor">*</span>
                </label>
                <input
                  required
                  name="per_mobile"
                  type="text"
                  maxLength={20}
                  className="form-control pull-right MandetoryField"
                  placeholder="Mobile Number"
                />
                <p className="help-block"></p>
              </div>
            </div>
          </div>

          {/* Payment Screenshot */}
          <div className="col-md-12">
            <div className="control-group form-group">
              <label className="labelfont">
                Payement Screenshot (jpg/png image)<span className="Redcolor">*</span>
              </label>
              <input
                required
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="form-control pull-right MandetoryField"
              />
              <p className="help-block"></p>
            </div>
          </div>

          {/* Transaction Number */}
          <div className="col-md-12">
            <div className="control-group form-group">
              <div className="controls">
                <label className="labelfont">
                  Transaction number<span className="Redcolor">*</span>
                </label>
                <input
                  required
                  name="trans_id"
                  type="text"
                  className="form-control pull-right MandetoryField"
                  placeholder="Transaction number"
                />
                <p className="help-block"></p>
              </div>
            </div>
          </div>

          {/* Upload Document (Upto 15MB) */}
          <div className="col-md-12">
            <div className="control-group form-group">
              <label className="labelfont">
                Upload Document (Upto 15MB)<span className="Redcolor">*</span>
              </label>
              <input
                required
                name="document"
                accept=".pdf"
                type="file"
                className="form-control pull-right MandetoryField"
              />
              <p className="help-block"></p>
            </div>
          </div>

          {/* Payment Date & Time */}
          <div className="col-md-12">
            <div className="control-group form-group">
              <div className="controls">
                <label className="labelfont">
                  Payement Date &amp; time<span className="Redcolor">*</span>
                </label>
                <input
                  required
                  name="per_date_time"
                  type="text"
                  className="form-control pull-right MandetoryField"
                  placeholder="e.g. 23-07-2025 10:30 AM"
                />
                <p className="help-block"></p>
              </div>
            </div>
          </div>

          <br />

          {/* Submit Button */}
          <div className="col-md-3" style={{ marginTop: "10px" }}>
            <button
              type="submit"
              name="submit"
              disabled={status === "sending"}
              className="form-control btn btn-primary pull-right"
            >
              {status === "sending" ? "Uploading…" : "Submit"}
            </button>
          </div>

          {status === "error" && (
            <div className="col-md-12" style={{ marginTop: "15px" }}>
              <p role="alert" className="text-danger">
                Upload failed. Please check your network connection and file sizes, then try again.
              </p>
            </div>
          )}

        </div>
      </div>
    </form>
  );
}
