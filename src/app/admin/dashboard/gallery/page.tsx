"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type GalleryImage = {
  image: string;
  name: string;
};

type Album = {
  id: string;
  title: string;
  category: string; // Subtitle / Category
  images: GalleryImage[];
};

export default function GalleryManagerPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gallery`);
      if (res.ok) {
        const data = await res.json();
        setAlbums(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load gallery albums", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditAlbum(null);
    setTitle("");
    setCategory("");
    setFiles(null);
    setExistingImages([]);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (album: Album) => {
    setEditAlbum(album);
    setTitle(album.title);
    setCategory(album.category || "");
    setFiles(null);
    setExistingImages(album.images || []);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditAlbum(null);
  };

  const handleRemoveExistingImage = (idx: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
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
      formData.append("category", category);

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append("images", files[i]);
        }
      }

      let res;
      if (editAlbum) {
        // Edit Mode: Send remaining existing images JSON + new files
        formData.append("existingImagesJson", JSON.stringify(existingImages));
        formData.append("appendImages", "true");
        res = await fetch(`${API_BASE}/admin/gallery/${editAlbum.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        // Add Mode
        res = await fetch(`${API_BASE}/admin/gallery`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      if (!res.ok) throw new Error("Upload failed");

      setSuccess(editAlbum ? "Gallery album updated successfully!" : "Gallery album created successfully!");
      fetchAlbums();
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
    if (!confirm("Are you sure you want to delete this gallery album? This cannot be undone.")) return;
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Album deleted successfully!");
      fetchAlbums();
    } catch (err) {
      console.error(err);
      setError("Failed to delete album.");
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: "30px" }}>
        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>Photo Gallery Albums</h2>
            <p style={{ color: "#777", marginTop: "5px" }}>Create and manage school photo albums shown in the Photo Gallery page.</p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <i className="fa fa-plus"></i> Create New Album
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

      {/* Albums Grid */}
      <div className="row">
        {loading ? (
          <div className="col-md-12 text-center" style={{ padding: "50px" }}>
            Loading gallery albums...
          </div>
        ) : albums.length === 0 ? (
          <div className="col-md-12 text-center" style={{ padding: "50px" }}>
            No albums found. Create an album and upload photos to showcase school life!
          </div>
        ) : (
          albums.map((a) => (
            <div key={a.id} className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "30px" }}>
              <div className="panel panel-default" style={{ border: "1px solid #ddd" }}>
                <div style={{ height: "180px", background: "#eee", overflow: "hidden", position: "relative" }}>
                  {a.images && a.images.length > 0 ? (
                    <img
                      src={a.images[0].image}
                      alt={a.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#999" }}>
                      No Images Uploaded
                    </div>
                  )}
                  <span className="label label-primary" style={{ position: "absolute", top: "10px", right: "10px", background: "#214AB3" }}>
                    {a.images ? a.images.length : 0} Photos
                  </span>
                </div>
                <div className="panel-body" style={{ padding: "15px" }}>
                  <h4 style={{ fontWeight: "bold", fontSize: "18px", margin: "0 0 5px 0" }}>{a.title}</h4>
                  <p style={{ color: "#777", fontSize: "13px", marginBottom: "15px" }}>
                    {a.category || <span style={{ fontStyle: "italic" }}>No category/subtitle</span>}
                  </p>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button className="btn btn-xs btn-primary" onClick={() => handleOpenEdit(a)}>
                      <i className="fa fa-pencil"></i> Edit Album
                    </button>
                    <button className="btn btn-xs btn-danger" onClick={() => handleDelete(a.id)}>
                      <i className="fa fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Album Form Modal */}
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
                {editAlbum ? "Edit Album Details" : "Create New Photo Album"}
              </h4>
              <button type="button" className="close" onClick={handleCloseForm} style={{ color: "#fff", opacity: 0.8 }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Album Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Independence Day Celebrations"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Subtitle / Category *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    placeholder="e.g. Co-Curricular / Cultural Events"
                  />
                </div>

                {/* Existing Images list in Edit Mode */}
                {editAlbum && existingImages.length > 0 && (
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="control-label" style={{ fontWeight: "bold" }}>Current Photos ({existingImages.length})</label>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "10px",
                      background: "#f9f9f9",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}>
                      {existingImages.map((img, idx) => (
                        <div key={idx} style={{ position: "relative", height: "70px", background: "#eee" }}>
                          <img src={img.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(idx)}
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              background: "#d9534f",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: "18px",
                              height: "18px",
                              fontSize: "12px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              cursor: "pointer",
                              lineHeight: 1
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "10px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>
                    {editAlbum ? "Upload Additional Images" : "Select Album Images *"}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFiles(e.target.files)}
                    required={!editAlbum}
                  />
                  <p className="help-block" style={{ fontSize: "12px", color: "#777" }}>
                    You can select and upload multiple images at once (up to 20 images).
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
                  {submitting ? "Uploading photos..." : "Save Album"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
