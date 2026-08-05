"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type FaqItem = {
  question: string;
  answer: string;
};

type SchoolTiming = {
  mainSchedule: string;
  officeHours: string;
  teacherMeeting?: string;
  principalMeeting?: string;
  noteSession: string;
  noteDussehra: string;
  noteFee: string;
};

const DEFAULT: SchoolTiming = {
  mainSchedule: "Monday to Friday — 8:00 A.M. to 1:40 P.M.",
  officeHours: "Office timing is from 8:00 A.M. to 1:40 P.M. hrs on all working days.",
  teacherMeeting: "Parents can meet the teachers by communicating the reason in the almanac.",
  principalMeeting: "Parents can meet the Principal by prior appointment only.",
  noteSession:
    "The academic session starts in April and ends in March every year. The school closes for summer vacation from mid of May to the beginning of July.",
  noteDussehra:
    "There is a short break in October during the Dussehra period and a winter break in December-January.",
  noteFee: "Fee is to be paid for twelve months of the academic year.",
};

export default function SchoolTimingAdminPage() {
  const [form, setForm] = useState<SchoolTiming>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTiming();
  }, []);

  async function fetchTiming() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/school-timing`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          mainSchedule: data.mainSchedule ?? DEFAULT.mainSchedule,
          officeHours: data.officeHours ?? DEFAULT.officeHours,
          teacherMeeting: data.teacherMeeting ?? DEFAULT.teacherMeeting,
          principalMeeting: data.principalMeeting ?? DEFAULT.principalMeeting,
          noteSession: data.noteSession ?? DEFAULT.noteSession,
          noteDussehra: data.noteDussehra ?? DEFAULT.noteDussehra,
          noteFee: data.noteFee ?? DEFAULT.noteFee,
        });
      }
    } catch (err) {
      console.error("Failed to load school timing", err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field: keyof SchoolTiming, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/school-timing`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server error ${res.status}`);
      }
      setSuccess("School timing updated successfully! Changes are live on the public page.");
    } catch (err: any) {
      setError(err?.message || "Failed to save changes.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!confirm("Reset all fields to their original default values?")) return;
    setForm(DEFAULT);
    setSuccess("");
    setError("");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <h3 className="Main_header">Loading School Timing...</h3>
      </div>
    );
  }

  const fieldConfig: {
    key: keyof SchoolTiming;
    label: string;
    placeholder: string;
    multiline?: boolean;
    rows?: number;
    help?: string;
    icon: string;
    color: string;
  }[] = [
    {
      key: "mainSchedule",
      label: "Main Schedule (Banner Headline)",
      placeholder: "e.g. Monday to Friday — 8:00 A.M. to 1:40 P.M.",
      icon: "fa-clock-o",
      color: "#214AB3",
      help: "This appears as the primary schedule headline on the public page.",
    },
    {
      key: "officeHours",
      label: "Office Hours Description",
      placeholder: "Office timing is from …",
      multiline: true,
      rows: 2,
      icon: "fa-building-o",
      color: "#214AB3",
    },

    {
      key: "noteSession",
      label: "Note — Academic Session",
      placeholder: "The academic session starts in …",
      multiline: true,
      rows: 3,
      icon: "fa-graduation-cap",
      color: "#8e44ad",
      help: "Appears in the Important Notes section.",
    },
    {
      key: "noteDussehra",
      label: "Note — Holiday Breaks",
      placeholder: "There is a short break in October …",
      multiline: true,
      rows: 2,
      icon: "fa-calendar",
      color: "#c59b27",
      help: "Appears in the Important Notes section.",
    },
    {
      key: "noteFee",
      label: "Note — Fee Policy",
      placeholder: "Fee is to be paid for …",
      multiline: true,
      rows: 2,
      icon: "fa-money",
      color: "#27ae60",
      help: "Appears in the Important Notes section.",
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="row" style={{ marginBottom: "30px" }}>
        <div
          className="col-md-12"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}
        >
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>
              School Timing Manager
            </h2>
            <p style={{ color: "#777", marginTop: "5px", marginBottom: 0 }}>
              Edit the school timing information shown on the public{" "}
              <a href="/school-timing" target="_blank" rel="noreferrer" style={{ color: "#214AB3" }}>
                School Timing <i className="fa fa-external-link" style={{ fontSize: "11px" }}></i>
              </a>{" "}
              page.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-default"
              onClick={handleReset}
              disabled={submitting}
            >
              <i className="fa fa-undo"></i> Reset to Defaults
            </button>
            <a href="/school-timing" target="_blank" rel="noreferrer" className="btn btn-default">
              <i className="fa fa-eye"></i> Preview Page
            </a>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="row">
        <div className="col-md-12">
          {error && <div className="alert alert-danger"><i className="fa fa-times-circle"></i> {error}</div>}
          {success && <div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div>}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="row">
          {fieldConfig.map((field) => (
            <div className="col-md-12" key={field.key} style={{ marginBottom: "20px" }}>
              <div
                className="panel panel-default"
                style={{ border: "1px solid #e0e0e0", borderRadius: "6px", overflow: "hidden" }}
              >
                {/* Panel header */}
                <div
                  className="panel-heading"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#fafafa",
                    borderBottom: "1px solid #eee",
                    padding: "12px 16px",
                  }}
                >
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      background: field.color,
                      borderRadius: "6px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    <i className={`fa ${field.icon}`}></i>
                  </span>
                  <span style={{ fontWeight: "bold", fontSize: "15px", color: "#333" }}>
                    {field.label}
                  </span>
                </div>

                {/* Panel body */}
                <div className="panel-body" style={{ padding: "16px" }}>
                  {field.multiline ? (
                    <textarea
                      className="form-control"
                      value={form[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      rows={field.rows || 2}
                      placeholder={field.placeholder}
                      style={{ resize: "vertical", fontSize: "14px" }}
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={form[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      style={{ fontSize: "14px" }}
                    />
                  )}
                  {field.help && (
                    <p className="help-block" style={{ fontSize: "12px", color: "#888", marginTop: "6px", marginBottom: 0 }}>
                      <i className="fa fa-info-circle"></i> {field.help}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Submit Bar */}
        <div
          style={{
            background: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
            marginTop: "10px",
          }}
        >
          <span style={{ color: "#888", fontSize: "13px", marginRight: "auto" }}>
            <i className="fa fa-info-circle"></i> Changes will be reflected immediately on the public page after saving.
          </span>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ background: "#214AB3", borderColor: "#214AB3", padding: "8px 28px", fontWeight: "bold" }}
          >
            {submitting ? (
              <><i className="fa fa-spinner fa-spin"></i> Saving...</>
            ) : (
              <><i className="fa fa-save"></i> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
