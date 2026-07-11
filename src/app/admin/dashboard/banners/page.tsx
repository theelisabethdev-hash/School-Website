"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type Banner = {
  id: string;
  image: string;
  title?: string;
  order?: number;
};

export default function BannersManagerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/banners`);
      if (res.ok) {
        const data = await res.json();
        setBanners(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load banners", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setTitle("");
    setOrder(banners.length + 1);
    setFile(null);
    setShowAddForm(true);
    setError("");
    setSuccess("");
  };

  const handleCloseAdd = () => {
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a banner image file to upload.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("order", String(order));
      formData.append("image", file);

      const res = await fetch(`${API_BASE}/admin/banners`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setSuccess("Banner image uploaded successfully!");
      fetchBanners();
      setTimeout(() => {
        handleCloseAdd();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to upload banner. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner image?")) return;
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Banner deleted successfully!");
      fetchBanners();
    } catch (err) {
      console.error(err);
      setError("Failed to delete banner.");
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: "30px" }}>
        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>Homepage Banner Images</h2>
            <p style={{ color: "#777", marginTop: "5px" }}>Upload and manage sliding images showcased on the homepage carousel.</p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <i className="fa fa-upload"></i> Upload New Banner
            </button>
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

      {/* Banners Grid */}
      <div className="row">
        {loading ? (
          <div className="col-md-12 text-center" style={{ padding: "50px" }}>
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="col-md-12 text-center" style={{ padding: "50px" }}>
            No banners found. Upload one to start customizing the homepage!
          </div>
        ) : (
          banners.map((b) => (
            <div key={b.id} className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "25px" }}>
              <div className="thumbnail" style={{ padding: "10px", border: "1px solid #ddd" }}>
                <div style={{ position: "relative", height: "180px", overflow: "hidden", background: "#eee" }}>
                  <img
                    src={b.image}
                    alt={b.title || "School Banner"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="caption" style={{ padding: "10px 0 0 0" }}>
                  <h4 style={{ fontWeight: "bold", fontSize: "16px", margin: "5px 0" }}>
                    {b.title || <span style={{ color: "#aaa", fontStyle: "italic" }}>No Title</span>}
                  </h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                    <span className="label label-primary" style={{ background: "#214AB3" }}>
                      Order: {b.order || 0}
                    </span>
                    <button className="btn btn-xs btn-danger" onClick={() => handleDelete(b.id)}>
                      <i className="fa fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal Form */}
      {showAddForm && (
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
            maxWidth: "500px",
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
              <h4 style={{ margin: 0, fontWeight: "bold" }}>Upload Banner Image</h4>
              <button type="button" className="close" onClick={handleCloseAdd} style={{ color: "#fff", opacity: 0.8 }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: "20px" }}>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Banner Title (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Welcome to Elisabeth Gauba School"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Display Order Sequence</label>
                  <input
                    type="number"
                    className="form-control"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "10px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Select Banner Image *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    required
                  />
                  <p className="help-block" style={{ fontSize: "12px", color: "#777" }}>
                    Recommended size: 1920x600 pixels (aspect ratio 3.2:1) for optimal display on the homepage.
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
                <button type="button" className="btn btn-default" onClick={handleCloseAdd}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Uploading image..." : "Upload Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
