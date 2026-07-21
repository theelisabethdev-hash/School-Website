"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type CalendarInfo = {
  pdfUrl: string;
  storagePath: string;
  fileName: string;
  updatedAt: string;
};

export default function AcademicCalendarAdminPage() {
  const [calendar, setCalendar] = useState<CalendarInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCalendar();
  }, []);

  async function fetchCalendar() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/academic-calendar`);
      if (res.ok) {
        const data = await res.json();
        setCalendar(data);
      }
    } catch (err) {
      console.error("Failed to load academic calendar", err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError("");
      setSuccess("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a PDF file first.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append("pdf", selectedFile);

      const res = await fetch(`${API_BASE}/admin/academic-calendar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      setSuccess("Academic Calendar uploaded successfully! Changes are live.");
      setCalendar(data.calendar);
      setSelectedFile(null);
      
      // Reset input element
      const fileInput = document.getElementById("calendar-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An error occurred while uploading the file.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the uploaded academic calendar? This will revert the public site to the legacy default document.")) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/academic-calendar`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server returned ${res.status}`);
      }

      setSuccess("Academic Calendar deleted successfully! Public page reverted to default.");
      setCalendar(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete the calendar.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <h3 className="Main_header">Loading Academic Calendar Details...</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: "30px" }}>
        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>Manage Academic Calendar</h2>
            <p style={{ color: "#777", marginTop: "5px" }}>Upload a PDF of the Academic Calendar. Only one calendar can be active at a time.</p>
          </div>
          <div>
            <a href="/admin/dashboard" className="btn btn-default">
              <i className="fa fa-arrow-left"></i> Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Message Alerts */}
      <div className="row">
        <div className="col-md-12">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      </div>

      <div className="row">
        {/* Left Column: Current Status */}
        <div className="col-md-6">
          <div className="panel panel-primary" style={{ borderColor: "#214AB3" }}>
            <div className="panel-heading" style={{ background: "#214AB3", borderColor: "#214AB3" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Current Calendar</h3>
            </div>
            <div className="panel-body" style={{ padding: "20px" }}>
              {calendar ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                    <div style={{ fontSize: "40px", color: "#c0392b" }}>
                      <i className="fa fa-file-pdf-o"></i>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontWeight: "bold", wordBreak: "break-all" }}>{calendar.fileName}</h4>
                      <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                        Uploaded: {new Date(calendar.updatedAt).toLocaleString("en-GB")}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "10px" }}>
                    <a href={calendar.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ background: "#214AB3" }}>
                      <i className="fa fa-download"></i> View / Download PDF
                    </a>
                    <button onClick={handleDelete} className="btn btn-danger" disabled={submitting}>
                      <i className="fa fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: "48px", color: "#ccc", marginBottom: "10px" }}>
                    <i className="fa fa-calendar-times-o"></i>
                  </div>
                  <p style={{ color: "#777", fontWeight: "bold" }}>No custom calendar uploaded yet.</p>
                  <p style={{ color: "#999", fontSize: "13px" }}>The website is currently using the default legacy PDF.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upload Form */}
        <div className="col-md-6">
          <div className="panel panel-primary" style={{ borderColor: "#214AB3" }}>
            <div className="panel-heading" style={{ background: "#214AB3", borderColor: "#214AB3" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>{calendar ? "Replace Academic Calendar" : "Upload Academic Calendar"}</h3>
            </div>
            <div className="panel-body" style={{ padding: "20px" }}>
              <form onSubmit={handleUpload}>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="control-label" style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                    Select PDF File *
                  </label>
                  <input
                    id="calendar-file-input"
                    type="file"
                    accept="application/pdf"
                    className="form-control"
                    onChange={handleFileChange}
                    required
                    style={{ height: "auto", padding: "10px" }}
                  />
                  <span className="help-block" style={{ color: "#777", fontSize: "12px", marginTop: "5px", display: "block" }}>
                    Please upload the school academic calendar in PDF format only. Uploading a new PDF will automatically delete the previous file.
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  style={{ background: "#214AB3", fontWeight: "bold", padding: "10px" }}
                  disabled={submitting || !selectedFile}
                >
                  {submitting ? "Uploading..." : calendar ? "Replace Calendar PDF" : "Upload Calendar PDF"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
