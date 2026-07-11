"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { exportToCSV } from "@/lib/export";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type Notice = {
  id: string;
  title: string;
  title_url?: string;
  image?: string;
  home_page: string;
  doe1: string;
  full_content: string;
  doe?: string;
};

export default function NoticesManagerPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit / Add state
  const [editNotice, setEditNotice] = useState<Notice | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [doe1, setDoe1] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [homePage, setHomePage] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/news`);
      if (res.ok) {
        const data = await res.json();
        setNotices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load notices", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditNotice(null);
    setTitle("");
    setDoe1(new Date().toISOString().split("T")[0]);
    setFullContent("");
    setHomePage(false);
    setFile(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (notice: Notice) => {
    setEditNotice(notice);
    setTitle(notice.title);
    setDoe1(notice.doe1 || "");
    setFullContent(notice.full_content || "");
    setHomePage(notice.home_page === "1");
    setFile(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("doe1", doe1);
      formData.append("full_content", fullContent);
      formData.append("home_page", homePage ? "1" : "0");
      if (file) {
        formData.append("image", file);
      }

      let res;
      if (editNotice) {
        // Edit Notice
        res = await fetch(`${API_BASE}/admin/news/${editNotice.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        // Add Notice
        res = await fetch(`${API_BASE}/admin/news`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      if (!res.ok) throw new Error("API request failed");

      setSuccess(editNotice ? "Notice updated successfully!" : "Notice added successfully!");
      fetchNotices();
      setTimeout(() => {
        handleCloseForm();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred. Please verify your fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Notice deleted successfully!");
      fetchNotices();
    } catch (err) {
      console.error(err);
      setError("Failed to delete notice.");
    }
  };

  const handleExportExcel = () => {
    const exportData = notices.map(n => ({
      ID: n.id,
      Title: n.title,
      "Publish Date": n.doe1,
      "Show on Homepage": n.home_page === "1" ? "Yes" : "No",
      Content: n.full_content,
      "Created Date": n.doe || "",
      "Document/Image URL": n.image || "None"
    }));
    exportToCSV(exportData, "school_notices");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="row no-print" style={{ marginBottom: "30px" }}>
        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>Manage Notices & News</h2>
            <p style={{ color: "#777", marginTop: "5px" }}>Add, edit, or delete notices and news circulars displayed on the website.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <i className="fa fa-plus"></i> Add New Notice
            </button>
            <button className="btn btn-default" onClick={handleExportExcel} title="Export to Excel">
              <i className="fa fa-file-excel-o"></i> Excel
            </button>
            <button className="btn btn-default" onClick={handlePrint} title="Print Notices">
              <i className="fa fa-print"></i> Print
            </button>
          </div>
        </div>
      </div>

      {/* Message Alerts */}
      <div className="row no-print">
        <div className="col-md-12">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      </div>

      {/* Notices Table */}
      <div className="row" id="print-area">
        <div className="col-md-12">
          <div className="panel panel-primary" style={{ borderColor: "#214AB3" }}>
            <div className="panel-heading no-print" style={{ background: "#214AB3", borderColor: "#214AB3" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Published Notices List</h3>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table table-striped table-bordered" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      <th style={{ width: "15%" }}>Date</th>
                      <th style={{ width: "40%" }}>Title</th>
                      <th style={{ width: "15%", textAlign: "center" }}>Show on Home</th>
                      <th style={{ width: "15%", textAlign: "center" }}>Document</th>
                      <th style={{ width: "15%", textAlign: "center" }} className="no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "30px" }}>Loading notices...</td>
                      </tr>
                    ) : notices.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "30px" }}>No notices found. Add one to get started!</td>
                      </tr>
                    ) : (
                      notices.map((n) => (
                        <tr key={n.id}>
                          <td>{n.doe1}</td>
                          <td>
                            <strong>{n.title}</strong>
                            <div className="no-print" style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                              {n.full_content.substring(0, 100)}{n.full_content.length > 100 ? "..." : ""}
                            </div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className={`label label-${n.home_page === "1" ? "success" : "default"}`}>
                              {n.home_page === "1" ? "Yes" : "No"}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {n.image ? (
                              <a href={n.image} target="_blank" rel="noreferrer" className="btn btn-xs btn-default">
                                <i className="fa fa-download"></i> View File
                              </a>
                            ) : (
                              <span style={{ color: "#aaa" }}>None</span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }} className="no-print">
                            <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                              <button className="btn btn-xs btn-primary" onClick={() => handleOpenEdit(n)}>
                                <i className="fa fa-pencil"></i> Edit
                              </button>
                              <button className="btn btn-xs btn-danger" onClick={() => handleDelete(n.id)}>
                                <i className="fa fa-trash"></i> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="no-print" style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1050
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "4px",
            width: "95%",
            maxWidth: "600px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{
              background: "#214AB3",
              color: "#fff",
              padding: "15px",
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h4 style={{ margin: 0, fontWeight: "bold" }}>
                {editNotice ? "Edit Notice Details" : "Add New Notice"}
              </h4>
              <button type="button" className="close" onClick={handleCloseForm} style={{ color: "#fff", opacity: 0.8 }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Notice Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Nursery Admission List 2026-27"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group" style={{ marginBottom: "15px" }}>
                      <label className="control-label" style={{ fontWeight: "bold" }}>Publish Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={doe1}
                        onChange={(e) => setDoe1(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6" style={{ paddingTop: "25px" }}>
                    <div className="checkbox">
                      <label style={{ fontWeight: "bold" }}>
                        <input
                          type="checkbox"
                          checked={homePage}
                          onChange={(e) => setHomePage(e.target.checked)}
                        />
                        Display on Homepage?
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Description / Text Details *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={fullContent}
                    onChange={(e) => setFullContent(e.target.value)}
                    required
                    placeholder="Enter main text of the circular..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "10px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>
                    Attachment File (PDF, Image) (Optional)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*,.pdf"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <p className="help-block" style={{ fontSize: "12px", color: "#777" }}>
                    Upload the official notice circular PDF or image receipt.
                  </p>
                </div>
              </div>

              <div style={{
                background: "#f5f5f5",
                padding: "15px",
                borderBottomLeftRadius: "4px",
                borderBottomRightRadius: "4px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px"
              }}>
                <button type="button" className="btn btn-default" onClick={handleCloseForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving changes..." : "Save Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
