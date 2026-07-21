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
  faqs?: FaqItem[];
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
  faqs: [
    {
      question: "What are the school timings at The Elisabeth Gauba School?",
      answer: "Classes run Monday to Friday, 8:00 AM to 1:40 PM. Office hours are also 8:00 AM to 1:40 PM on all working days.",
    },
    {
      question: "When can parents meet the teachers or the Principal?",
      answer: "Parents can meet teachers by noting the reason in the almanac. The Principal can be met by prior appointment only.",
    },
    {
      question: "What are the term dates and holidays for the academic year?",
      answer: "The academic session runs from April to March. The school closes for summer vacation from mid-May to early July, with a short Dussehra break in October and a winter break in December–January.",
    },
  ],
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
          faqs: data.faqs ?? DEFAULT.faqs,
        });
      }
    } catch (err) {
      console.error("Failed to load school timing", err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field: Exclude<keyof SchoolTiming, "faqs">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: "", answer: "" }],
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setForm((prev) => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== index),
    }));
  };

  const handleFaqChange = (index: number, field: keyof FaqItem, value: string) => {
    setForm((prev) => {
      const newFaqs = [...(prev.faqs || [])];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return { ...prev, faqs: newFaqs };
    });
  };

  const handleMoveFaq = (index: number, direction: "up" | "down") => {
    setForm((prev) => {
      const newFaqs = [...(prev.faqs || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newFaqs.length) return prev;
      
      const temp = newFaqs[index];
      newFaqs[index] = newFaqs[targetIndex];
      newFaqs[targetIndex] = temp;
      
      return { ...prev, faqs: newFaqs };
    });
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
    key: Exclude<keyof SchoolTiming, "faqs">;
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

        {/* FAQs Section */}
        <div className="row">
          <div className="col-md-12" style={{ marginBottom: "20px" }}>
            <div
              className="panel panel-default"
              style={{ border: "1px solid #e0e0e0", borderRadius: "6px", overflow: "hidden" }}
            >
              {/* Panel header */}
              <div
                className="panel-heading"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fafafa",
                  borderBottom: "1px solid #eee",
                  padding: "12px 16px",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "#214AB3",
                      borderRadius: "6px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    <i className="fa fa-question-circle"></i>
                  </span>
                  <span style={{ fontWeight: "bold", fontSize: "15px", color: "#333" }}>
                    Frequently Asked Questions (FAQs)
                  </span>
                </span>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={handleAddFaq}
                  style={{ background: "#27ae60", borderColor: "#27ae60", fontWeight: "bold" }}
                >
                  <i className="fa fa-plus"></i> Add FAQ
                </button>
              </div>

              {/* Panel body */}
              <div className="panel-body" style={{ padding: "16px" }}>
                {form.faqs && form.faqs.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {form.faqs.map((faq, index) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: "6px",
                          padding: "16px",
                          background: "#fdfdfd",
                          position: "relative",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span style={{ fontWeight: "bold", color: "#214AB3" }}>FAQ #{index + 1}</span>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button
                              type="button"
                              className="btn btn-default btn-xs"
                              onClick={() => handleMoveFaq(index, "up")}
                              disabled={index === 0}
                            >
                              <i className="fa fa-arrow-up"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-default btn-xs"
                              onClick={() => handleMoveFaq(index, "down")}
                              disabled={index === (form.faqs?.length || 0) - 1}
                            >
                              <i className="fa fa-arrow-down"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-xs"
                              onClick={() => handleRemoveFaq(index)}
                              style={{ background: "#d9534f", borderColor: "#d43f3a", color: "#fff" }}
                            >
                              <i className="fa fa-trash"></i> Remove
                            </button>
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: "10px" }}>
                          <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", display: "block", marginBottom: "5px" }}>
                            Question
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={faq.question}
                            onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                            placeholder="e.g. What are the school timings?"
                            required
                            style={{ fontSize: "14px" }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", display: "block", marginBottom: "5px" }}>
                            Answer
                          </label>
                          <textarea
                            className="form-control"
                            value={faq.answer}
                            onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                            placeholder="e.g. Classes run Monday to Friday..."
                            rows={3}
                            required
                            style={{ resize: "vertical", fontSize: "14px" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                    <i className="fa fa-info-circle" style={{ fontSize: "20px", marginBottom: "10px", display: "block" }}></i>
                    No FAQs added yet. Click "+ Add FAQ" to add one.
                  </div>
                )}
              </div>
            </div>
          </div>
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
