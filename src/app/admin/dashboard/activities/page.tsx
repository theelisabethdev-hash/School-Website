"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type Activity = {
  id: string;
  title: string;
  content: string; // Subtitle / description text
  images?: string[];
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getCurrentMonth = () => {
  const date = new Date();
  return MONTHS[date.getMonth()];
};

const getCurrentYear = () => {
  return new Date().getFullYear().toString();
};

const getYearsList = () => {
  const cy = new Date().getFullYear();
  const list = [];
  for (let y = cy - 5; y <= cy + 10; y++) {
    list.push(y.toString());
  }
  return list;
};
const YEARS = getYearsList();

export default function ActivitiesManagerPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [files, setFiles] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/activities`);
      if (res.ok) {
        const data = await res.json();
        setActivities(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load activities", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditActivity(null);
    setTitle("");
    setContent("");
    setSelectedMonth(getCurrentMonth());
    setSelectedYear(getCurrentYear());
    setFiles(null);
    setExistingImages([]);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (activity: Activity) => {
    setEditActivity(activity);
    
    const titleRaw = activity.title || "";
    const match = titleRaw.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (match) {
      setTitle(match[1].trim());
      const my = match[2].trim();
      const myParts = my.split(/[\s-]+/);
      if (myParts.length >= 2) {
        const matchedMonth = MONTHS.find(m => m.toLowerCase() === myParts[0].toLowerCase());
        setSelectedMonth(matchedMonth || getCurrentMonth());
        setSelectedYear(myParts[1]);
      } else {
        setSelectedMonth(getCurrentMonth());
        setSelectedYear(getCurrentYear());
      }
    } else {
      setTitle(titleRaw);
      setSelectedMonth(getCurrentMonth());
      setSelectedYear(getCurrentYear());
    }

    setContent(activity.content || "");
    setFiles(null);
    setExistingImages(activity.images || []);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 10) {
      setError("You can only upload up to 10 images per activity.");
      setFiles(null);
      e.target.value = ""; // clear selection
    } else {
      setFiles(selectedFiles);
      setError("");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditActivity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      const combinedTitle = `${title.trim()} (${selectedMonth} ${selectedYear})`;
      formData.append("title", combinedTitle);
      formData.append("content", content);
      if (editActivity) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append("images", files[i]);
        }
      }

      let res;
      if (editActivity) {
        // Edit Activity
        res = await fetch(`${API_BASE}/admin/activities/${editActivity.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        // Add Activity
        res = await fetch(`${API_BASE}/admin/activities`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      if (!res.ok) throw new Error("Submission failed");

      setSuccess(editActivity ? "Activity updated successfully!" : "Activity added successfully!");
      fetchActivities();
      setTimeout(() => {
        handleCloseForm();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity? This cannot be undone.")) return;
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/activities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Activity deleted successfully!");
      fetchActivities();
    } catch (err) {
      console.error(err);
      setError("Failed to delete activity.");
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: "30px" }}>
        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>School Activities Manager</h2>
            <p style={{ color: "#777", marginTop: "5px" }}>Create and manage school activities shown on the Activities page.</p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <i className="fa fa-plus"></i> Add New Activity
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="row">
        <div className="col-md-12">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      </div>

      {/* Activities List */}
      <div className="row">
        {loading ? (
          <div className="col-md-12 text-center" style={{ padding: "50px" }}>
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="col-md-12 text-center" style={{ padding: "50px" }}>
            No activities found. Add an activity to display school events!
          </div>
        ) : (
          activities.map((act) => {
            const titleRaw = act.title || "";
            const match = titleRaw.match(/^(.*?)\s*\(([^)]+)\)$/);
            const displayTitle = match ? match[1].trim() : titleRaw;
            const displayMonthYear = match ? match[2].trim().replace(/-/g, " ") : "";

            return (
              <div key={act.id} className="col-md-6 col-sm-12" style={{ marginBottom: "30px" }}>
                <div className="panel panel-default" style={{ border: "1px solid #ddd", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div className="panel-heading" style={{ background: "#f9f9f9", fontWeight: "bold", fontSize: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{displayTitle}</span>
                    {displayMonthYear && (
                      <span className="label label-info" style={{ background: "#214AB3", color: "#fff", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "normal" }}>
                        {displayMonthYear}
                      </span>
                    )}
                  </div>
                  <div className="panel-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {act.content && act.content.trim() ? (
                      <p style={{ color: "#555", flex: 1, fontSize: "14px", lineBreak: "anywhere" }}>{act.content}</p>
                    ) : (
                      <div style={{ flex: 1 }}></div>
                    )}
                  
                  {/* Images preview grid */}
                  {act.images && act.images.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto", margin: "15px 0" }}>
                      {act.images.map((img, idx) => (
                        <div key={idx} style={{ flexShrink: 0, width: "80px", height: "80px", background: "#eee", borderRadius: "4px", overflow: "hidden" }}>
                          <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                    <button className="btn btn-xs btn-primary" onClick={() => handleOpenEdit(act)}>
                      <i className="fa fa-pencil"></i> Edit
                    </button>
                    <button className="btn btn-xs btn-danger" onClick={() => handleDelete(act.id)}>
                      <i className="fa fa-trash"></i> Delete
                    </button>
                </div>
              </div>
            </div>
          </div>
        );
      })
    )}
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div style={{
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
            maxWidth: "650px",
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
                {editActivity ? "Edit Activity Details" : "Add New Activity"}
              </h4>
              <button type="button" className="close" onClick={handleCloseForm} style={{ color: "#fff", opacity: 0.8 }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Activity Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Science Exhibition 2026"
                  />
                </div>

                <div className="row" style={{ marginBottom: "15px" }}>
                  <div className="col-xs-6">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="control-label" style={{ fontWeight: "bold" }}>Activity Month *</label>
                      <select
                        className="form-control"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        required
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-xs-6">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="control-label" style={{ fontWeight: "bold" }}>Activity Year *</label>
                      <select
                        className="form-control"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        required
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {editActivity && existingImages && existingImages.length > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <label className="control-label" style={{ fontWeight: "bold" }}>Existing Images ({existingImages.length})</label>
                    <div style={{ display: "flex", gap: "10px", overflowX: "auto", background: "#f5f5f5", padding: "12px", border: "1px solid #ddd", borderRadius: "4px" }}>
                      {existingImages.map((img, idx) => (
                        <div key={idx} style={{ position: "relative", flexShrink: 0, width: "60px", height: "60px", background: "#eee", borderRadius: "4px", overflow: "visible" }}>
                          <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }} />
                          <button
                            type="button"
                            onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-6px",
                              background: "#d9534f",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: "18px",
                              height: "18px",
                              fontSize: "12px",
                              lineHeight: "18px",
                              textAlign: "center",
                              cursor: "pointer",
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                            }}
                            title="Delete Image"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="help-block" style={{ fontSize: "11px", color: "#666", marginTop: "5px" }}>
                      Note: Click the red cross on an image to delete it. Uploading new files below will add them to the remaining images.
                    </p>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "10px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>
                    {editActivity ? "Upload New Images (Optional)" : "Select Activity Images *"}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!editActivity}
                  />
                  <p className="help-block" style={{ fontSize: "12px", color: "#777" }}>
                    Select one or more images from the activity (up to 10 images).
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
                  {submitting ? "Saving activity..." : "Save Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
