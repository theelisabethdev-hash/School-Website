"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type SocietyItem = {
  id: string;
  type: "category" | "document";
  name: string;
  images?: string[];
  url?: string;
  sizeLabel?: string;
};

export default function SocietyManagerPage() {
  const [items, setItems] = useState<SocietyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"category" | "document">("category");
  const [editItem, setEditItem] = useState<SocietyItem | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/society`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load society items", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = (type: "category" | "document") => {
    setEditItem(null);
    setFormType(type);
    setName("");
    setFiles(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (item: SocietyItem) => {
    setEditItem(item);
    setFormType(item.type);
    setName(item.name);
    setFiles(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      if (formType === "category" && selectedFiles.length > 10) {
        setError("You can only upload up to 10 images per album.");
        setFiles(null);
        e.target.value = "";
      } else if (formType === "document" && selectedFiles.length > 1) {
        setError("You can only upload 1 document file.");
        setFiles(null);
        e.target.value = "";
      } else {
        setFiles(selectedFiles);
        setError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append("type", formType);
      formData.append("name", name);

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
      }

      let res;
      if (editItem) {
        // Edit Item
        res = await fetch(`${API_BASE}/admin/society/${editItem.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        // Add Item
        res = await fetch(`${API_BASE}/admin/society`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      if (!res.ok) throw new Error("Submission failed");

      setSuccess(editItem ? "Item updated successfully!" : "Item added successfully!");
      fetchItems();
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
    if (!confirm("Are you sure you want to delete this item? This cannot be undone.")) return;
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/society/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Item deleted successfully!");
      fetchItems();
    } catch (err) {
      console.error(err);
      setError("Failed to delete item.");
    }
  };

  const categories = items.filter((i) => i.type === "category");
  const documents = items.filter((i) => i.type === "document");

  return (
    <div>
      {/* Header */}
      <div className="row" style={{ marginBottom: "30px" }}>
        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>Shiv Niketan Society Manager</h2>
            <p style={{ color: "#777", marginTop: "5px" }}>Manage photo albums and downloadable files shown under Shiv Niketan Society on the Activities page.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-primary" onClick={() => handleOpenAdd("category")}>
              <i className="fa fa-plus"></i> Add Photo Album
            </button>
            <button className="btn btn-warning" onClick={() => handleOpenAdd("document")} style={{ background: "#c59b27", borderColor: "#c59b27", color: "#fff" }}>
              <i className="fa fa-file-pdf-o"></i> Add Document (PDF)
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

      {loading ? (
        <div className="row">
          <div className="col-md-12 text-center" style={{ padding: "50px" }}>
            Loading society items...
          </div>
        </div>
      ) : (
        <div className="row">
          {/* Categories/Albums List */}
          <div className="col-md-6 col-sm-12" style={{ marginBottom: "30px" }}>
            <div className="panel panel-default" style={{ border: "1px solid #ddd", minHeight: "350px" }}>
              <div className="panel-heading" style={{ background: "#f9f9f9", fontWeight: "bold", fontSize: "16px", color: "#214AB3" }}>
                <i className="fa fa-picture-o"></i> Photo Albums ({categories.length})
              </div>
              <div className="panel-body" style={{ padding: "15px" }}>
                {categories.length === 0 ? (
                  <p style={{ color: "#999", fontStyle: "italic" }}>No albums created yet.</p>
                ) : (
                  <ul className="list-group" style={{ margin: 0 }}>
                    {categories.map((cat) => (
                      <li key={cat.id} className="list-group-item" style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px", padding: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "bold", fontSize: "15px" }}>{cat.name}</span>
                          <span className="label label-primary" style={{ background: "#214AB3" }}>
                            {cat.images?.length || 0} photos
                          </span>
                        </div>
                        
                        {cat.images && cat.images.length > 0 && (
                          <div style={{ display: "flex", gap: "6px", overflowX: "auto", padding: "5px 0" }}>
                            {cat.images.map((img, idx) => (
                              <div key={idx} style={{ flexShrink: 0, width: "60px", height: "60px", background: "#eee", borderRadius: "4px", overflow: "hidden" }}>
                                <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #eee", paddingTop: "8px" }}>
                          <button className="btn btn-xs btn-primary" onClick={() => handleOpenEdit(cat)}>
                            <i className="fa fa-pencil"></i> Edit Name/Photos
                          </button>
                          <button className="btn btn-xs btn-danger" onClick={() => handleDelete(cat.id)}>
                            <i className="fa fa-trash"></i> Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="col-md-6 col-sm-12" style={{ marginBottom: "30px" }}>
            <div className="panel panel-default" style={{ border: "1px solid #ddd", minHeight: "350px" }}>
              <div className="panel-heading" style={{ background: "#f9f9f9", fontWeight: "bold", fontSize: "16px", color: "#c59b27" }}>
                <i className="fa fa-file-text-o"></i> Downloadable Documents ({documents.length})
              </div>
              <div className="panel-body" style={{ padding: "15px" }}>
                {documents.length === 0 ? (
                  <p style={{ color: "#999", fontStyle: "italic" }}>No documents uploaded yet.</p>
                ) : (
                  <ul className="list-group" style={{ margin: 0 }}>
                    {documents.map((doc) => (
                      <li key={doc.id} className="list-group-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "20px" }}>📄</span>
                          <div>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: "bold", color: "#333", textDecoration: "none" }}>
                              {doc.name}
                            </a>
                            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Size: {doc.sizeLabel}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-xs btn-primary" onClick={() => handleOpenEdit(doc)}>
                            <i className="fa fa-pencil"></i> Edit
                          </button>
                          <button className="btn btn-xs btn-danger" onClick={() => handleDelete(doc.id)}>
                            <i className="fa fa-trash"></i> Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
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
            maxWidth: "600px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{
              background: formType === "category" ? "#214AB3" : "#c59b27",
              color: "#fff",
              padding: "15px",
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h4 style={{ margin: 0, fontWeight: "bold" }}>
                {editItem 
                  ? `Edit ${formType === "category" ? "Photo Album" : "Document"}` 
                  : `Add New ${formType === "category" ? "Photo Album" : "Document"}`}
              </h4>
              <button type="button" className="close" onClick={handleCloseForm} style={{ color: "#fff", opacity: 0.8 }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
                
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>
                    {formType === "category" ? "Album Name *" : "Document Display Name *"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={formType === "category" ? "e.g. Society General Meeting 2026" : "e.g. Audited Balance Sheet 2025-26"}
                  />
                </div>

                {/* Album Images Preview if Editing */}
                {formType === "category" && editItem && editItem.images && editItem.images.length > 0 && (
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
                      Note: Uploading new files below will completely replace all existing images.
                    </p>
                  </div>
                )}

                {/* Document File Link if Editing */}
                {formType === "document" && editItem && editItem.url && (
                  <div style={{ marginBottom: "15px" }}>
                    <label className="control-label" style={{ fontWeight: "bold" }}>Current File</label>
                    <div style={{ padding: "8px 12px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: "4px" }}>
                      <a href={editItem.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: "bold" }}>
                        View Current Document ({editItem.sizeLabel})
                      </a>
                    </div>
                    <p className="help-block" style={{ fontSize: "11px", color: "#666" }}>
                      Note: Uploading a new file below will replace the current file.
                    </p>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "10px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>
                    {formType === "category" 
                      ? (editItem ? "Upload New Album Photos (Optional)" : "Select Album Photos *")
                      : (editItem ? "Upload New Document File (Optional)" : "Select Document File *")}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    multiple={formType === "category"}
                    accept={formType === "category" ? "image/*" : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"}
                    onChange={handleFileChange}
                    required={!editItem}
                  />
                  <p className="help-block" style={{ fontSize: "12px", color: "#777" }}>
                    {formType === "category" 
                      ? "Select one or more images from the event (up to 10 images)."
                      : "Select a single document file (PDF, Word, Excel, PowerPoint)."}
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
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: formType === "category" ? "#214AB3" : "#c59b27", borderColor: formType === "category" ? "#214AB3" : "#c59b27" }}>
                  {submitting ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
