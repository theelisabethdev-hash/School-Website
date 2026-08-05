"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { FaqsData, FaqItem } from "@/lib/api";
import { homeFaqs, admissionsFaqs, feeFaqs, timingFaqs } from "@/lib/seo";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

const DEFAULT: FaqsData = {
  home: homeFaqs,
  admissions: admissionsFaqs,
  feeStructure: feeFaqs,
  schoolTiming: timingFaqs,
};

type FaqSectionKey = keyof FaqsData;

const SECTIONS: { key: FaqSectionKey; label: string; icon: string; color: string }[] = [
  { key: "home", label: "Home Page FAQs", icon: "fa-home", color: "#214AB3" },
  { key: "admissions", label: "Admissions FAQs", icon: "fa-graduation-cap", color: "#8e44ad" },
  { key: "feeStructure", label: "Fee Structure FAQs", icon: "fa-money", color: "#27ae60" },
  { key: "schoolTiming", label: "School Timing FAQs", icon: "fa-clock-o", color: "#c59b27" },
];

export default function FaqsAdminPage() {
  const [form, setForm] = useState<FaqsData>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState<FaqSectionKey>("home");

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/faqs`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          home: data.home ?? DEFAULT.home,
          admissions: data.admissions ?? DEFAULT.admissions,
          feeStructure: data.feeStructure ?? DEFAULT.feeStructure,
          schoolTiming: data.schoolTiming ?? DEFAULT.schoolTiming,
        });
      }
    } catch (err) {
      console.error("Failed to load FAQs", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddFaq = (section: FaqSectionKey) => {
    setForm((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), { question: "", answer: "" }],
    }));
  };

  const handleRemoveFaq = (section: FaqSectionKey, index: number) => {
    setForm((prev) => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index),
    }));
  };

  const handleFaqChange = (section: FaqSectionKey, index: number, field: keyof FaqItem, value: string) => {
    setForm((prev) => {
      const newFaqs = [...(prev[section] || [])];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return { ...prev, [section]: newFaqs };
    });
  };

  const handleMoveFaq = (section: FaqSectionKey, index: number, direction: "up" | "down") => {
    setForm((prev) => {
      const newFaqs = [...(prev[section] || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newFaqs.length) return prev;
      
      const temp = newFaqs[index];
      newFaqs[index] = newFaqs[targetIndex];
      newFaqs[targetIndex] = temp;
      
      return { ...prev, [section]: newFaqs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/faqs`, {
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
      setSuccess("FAQs updated successfully! Changes are live on the public pages.");
    } catch (err: any) {
      setError(err?.message || "Failed to save changes.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!confirm("Reset all FAQs to their original default values?")) return;
    setForm(DEFAULT);
    setSuccess("");
    setError("");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <h3 className="Main_header">Loading FAQs...</h3>
      </div>
    );
  }

  const currentFaqs = form[activeSection] || [];
  const currentSectionMeta = SECTIONS.find(s => s.key === activeSection)!;

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
              FAQ Manager
            </h2>
            <p style={{ color: "#777", marginTop: "5px", marginBottom: 0 }}>
              Edit the Frequently Asked Questions shown on various public pages.
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

      {/* Tabs */}
      <ul className="nav nav-tabs" style={{ marginBottom: "20px" }}>
        {SECTIONS.map((section) => (
          <li
            key={section.key}
            className={activeSection === section.key ? "active" : ""}
            style={{ cursor: "pointer" }}
          >
            <a onClick={() => setActiveSection(section.key)}>
              <i className={`fa ${section.icon}`} style={{ marginRight: "6px", color: activeSection === section.key ? section.color : "#777" }}></i>
              {section.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Form */}
      <form onSubmit={handleSubmit}>
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
                      background: currentSectionMeta.color,
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
                    {currentSectionMeta.label}
                  </span>
                </span>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => handleAddFaq(activeSection)}
                  style={{ background: "#27ae60", borderColor: "#27ae60", fontWeight: "bold" }}
                >
                  <i className="fa fa-plus"></i> Add FAQ
                </button>
              </div>

              {/* Panel body */}
              <div className="panel-body" style={{ padding: "16px" }}>
                {currentFaqs.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {currentFaqs.map((faq, index) => (
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
                          <span style={{ fontWeight: "bold", color: currentSectionMeta.color }}>FAQ #{index + 1}</span>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button
                              type="button"
                              className="btn btn-default btn-xs"
                              onClick={() => handleMoveFaq(activeSection, index, "up")}
                              disabled={index === 0}
                            >
                              <i className="fa fa-arrow-up"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-default btn-xs"
                              onClick={() => handleMoveFaq(activeSection, index, "down")}
                              disabled={index === currentFaqs.length - 1}
                            >
                              <i className="fa fa-arrow-down"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-xs"
                              onClick={() => handleRemoveFaq(activeSection, index)}
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
                            onChange={(e) => handleFaqChange(activeSection, index, "question", e.target.value)}
                            placeholder="e.g. What is the age criteria for admission?"
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
                            onChange={(e) => handleFaqChange(activeSection, index, "answer", e.target.value)}
                            placeholder="e.g. Nursery: 3+ and below 4 years..."
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
                    No FAQs added yet for this section. Click "+ Add FAQ" to add one.
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
            <i className="fa fa-info-circle"></i> Changes will be reflected immediately on the public pages after saving.
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
              <><i className="fa fa-save"></i> Save All FAQs</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
