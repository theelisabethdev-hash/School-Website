"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type FacilitiesItem = {
  id: string;
  title: string;
  content: string;
  order: number;
  images?: string[];
};

export default function FacilitiesManagerPage() {
  const [items, setItems] = useState<FacilitiesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<FacilitiesItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/facilities`);
      if (res.ok) {
        const data = await res.json();
        // Sort by order ascending
        const sorted = Array.isArray(data) ? data : [];
        sorted.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(sorted);
      }
    } catch (err) {
      console.error("Failed to load facilities items", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditItem(null);
    setTitle("");
    setContent("");
    // Default order to next available
    const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.order || 0)) + 1 : 1;
    setOrder(nextOrder);
    setFiles(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (item: FacilitiesItem) => {
    setEditItem(item);
    setTitle(item.title || "");
    setContent(item.content || "");
    setOrder(item.order || 0);
    setFiles(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 10) {
      setError("You can only upload up to 10 images per facility.");
      setFiles(null);
      e.target.value = ""; // clear selection
    } else {
      setFiles(selectedFiles);
      setError("");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("order", order.toString());

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append("images", files[i]);
        }
      }

      let res;
      if (editItem) {
        // Edit Item
        res = await fetch(`${API_BASE}/admin/facilities/${editItem.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        // Add Item
        res = await fetch(`${API_BASE}/admin/facilities`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || errorData?.message || `Server returned status ${res.status}`;
        throw new Error(errorMessage);
      }

      setSuccess(editItem ? "Facility item updated successfully!" : "Facility item added successfully!");
      fetchItems();
      setTimeout(() => {
        handleCloseForm();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this facility item? This cannot be undone.")) return;
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/facilities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Facility item deleted successfully!");
      fetchItems();
    } catch (err) {
      console.error(err);
      setError("Failed to delete facility item.");
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: "30px" }}>
        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>Facilities & Infrastructure Manager</h2>
            <p style={{ color: "#777", marginTop: "5px" }}>Create and manage school facilities and infrastructure displays.</p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleOpenAdd} style={{ background: "#e67e22", borderColor: "#d35400" }}>
              <i className="fa fa-plus"></i> Add New Facility
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

      {/* List */}
      <div className="row">
        {loading ? (
          <div className="col-md-12 text-center" style={{ padding: "50px" }}>
            Loading facilities...
          </div>
        ) : items.length === 0 ? (
          <div className="col-md-12 text-center" style={{ padding: "50px" }}>
            No facilities found. Add one to display school infrastructure!
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="col-md-6 col-sm-12" style={{ marginBottom: "30px" }}>
              <div className="panel panel-default" style={{ border: "1px solid #ddd", height: "100%", display: "flex", flexDirection: "column" }}>
                <div className="panel-heading" style={{ background: "#f9f9f9", fontWeight: "bold", fontSize: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{item.title}</span>
                  <span className="label label-info" style={{ background: "#e67e22", color: "#fff", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "normal" }}>
                    Order: {item.order}
                  </span>
                </div>
                <div className="panel-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {item.content && item.content.trim() ? (
                    <p style={{ color: "#555", flex: 1, fontSize: "14px", lineBreak: "anywhere", whiteSpace: "pre-line" }}>
                      {item.content}
                    </p>
                  ) : (
                    <div style={{ flex: 1 }}></div>
                  )}
                  
                  {/* Images preview grid */}
                  {item.images && item.images.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto", margin: "15px 0" }}>
                      {item.images.map((img, idx) => (
                        <div key={idx} style={{ flexShrink: 0, width: "80px", height: "80px", background: "#eee", borderRadius: "4px", overflow: "hidden" }}>
                          <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                    <button className="btn btn-xs btn-primary" onClick={() => handleOpenEdit(item)}>
                      <i className="fa fa-pencil"></i> Edit
                    </button>
                    <button className="btn btn-xs btn-danger" onClick={() => handleDelete(item.id)}>
                      <i className="fa fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
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
              background: "#e67e22",
              color: "#fff",
              padding: "15px",
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h4 style={{ margin: 0, fontWeight: "bold" }}>
                {editItem ? "Edit Facility Item" : "Add New Facility"}
              </h4>
              <button type="button" className="close" onClick={handleCloseForm} style={{ color: "#fff", opacity: 0.8 }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Facility Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Computer Lab"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Description / Content *</label>
                  <textarea
                    className="form-control"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={5}
                    placeholder="Describe the facility's design, utility, and equipment details..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Display Order *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    required
                    min={1}
                    placeholder="e.g. 1"
                  />
                  <p className="help-block" style={{ fontSize: "11px", color: "#666" }}>
                    Lower numbers will appear first on the page.
                  </p>
                </div>

                {editItem && editItem.images && editItem.images.length > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <label className="control-label" style={{ fontWeight: "bold" }}>Existing Images ({editItem.images.length})</label>
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto", background: "#f5f5f5", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
                      {editItem.images.map((img, idx) => (
                        <div key={idx} style={{ flexShrink: 0, width: "60px", height: "60px", background: "#eee", borderRadius: "4px", overflow: "hidden" }}>
                          <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                    <p className="help-block" style={{ fontSize: "11px", color: "#666" }}>
                      Note: Uploading new files below will completely replace all existing images for this facility.
                    </p>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "10px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>
                    {editItem ? "Upload New Images (Optional)" : "Select Facility Images"}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className="help-block" style={{ fontSize: "12px", color: "#777" }}>
                    Select one or more images for the facility (up to 10 images).
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
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: "#e67e22", borderColor: "#d35400" }}>
                  {submitting ? "Saving..." : "Save Facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
