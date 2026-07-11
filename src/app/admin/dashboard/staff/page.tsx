"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type StaffMember = {
  id: string;
  name: string;
  title: string; // The section/category title
  role?: string;  // Designation
  image?: string; // Photo URL
  order?: number;
};

type CarouselImage = {
  id: string;
  image: string;
  order?: number;
};

const DEFAULT_CATEGORIES = [
  "Administration",
  "Coordinators",
  "Co-Curricular Teachers",
  "Special Educator",
  "Teachers (I-V)",
  "Support Staff"
];

export default function StaffManagerPage() {
  const [activeTab, setActiveTab] = useState<"teachers" | "carousel">("teachers");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data states
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [carousel, setCarousel] = useState<CarouselImage[]>([]);

  // Teacher Form Form-fields
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editTeacher, setEditTeacher] = useState<StaffMember | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [teacherTitle, setTeacherTitle] = useState(DEFAULT_CATEGORIES[0]);
  const [customTitle, setCustomTitle] = useState("");
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [teacherRole, setTeacherRole] = useState("");
  const [teacherOrder, setTeacherOrder] = useState(0);
  const [teacherFile, setTeacherFile] = useState<File | null>(null);
  const [deleteProfileImage, setDeleteProfileImage] = useState(false);

  // Carousel Form Form-fields
  const [showCarouselForm, setShowCarouselForm] = useState(false);
  const [carouselOrder, setCarouselOrder] = useState(0);
  const [carouselFile, setCarouselFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const [staffRes, carouselRes] = await Promise.all([
        fetch(`${API_BASE}/staff`),
        fetch(`${API_BASE}/staff/carousel`)
      ]);

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(Array.isArray(staffData) ? staffData : []);
      }
      if (carouselRes.ok) {
        const carouselData = await carouselRes.json();
        setCarousel(Array.isArray(carouselData) ? carouselData : []);
      }
    } catch (err) {
      console.error("Failed to load staff management data", err);
      setError("Failed to fetch staff data from the server.");
    } finally {
      setLoading(false);
    }
  }

  // Teacher handlers
  const handleOpenAddTeacher = () => {
    setEditTeacher(null);
    setTeacherName("");
    setTeacherTitle(DEFAULT_CATEGORIES[0]);
    setCustomTitle("");
    setIsCustomTitle(false);
    setTeacherRole("");
    setTeacherOrder(0);
    setTeacherFile(null);
    setDeleteProfileImage(false);
    setShowTeacherForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEditTeacher = (member: StaffMember) => {
    setEditTeacher(member);
    setTeacherName(member.name || "");
    setTeacherRole(member.role || "");
    setTeacherOrder(member.order || 0);
    setTeacherFile(null);
    setDeleteProfileImage(false);

    if (DEFAULT_CATEGORIES.includes(member.title)) {
      setTeacherTitle(member.title);
      setIsCustomTitle(false);
    } else {
      setTeacherTitle("Other");
      setCustomTitle(member.title || "");
      setIsCustomTitle(true);
    }

    setShowTeacherForm(true);
    setError("");
    setSuccess("");
  };

  const handleTeacherTitleChange = (val: string) => {
    setTeacherTitle(val);
    if (val === "Other") {
      setIsCustomTitle(true);
    } else {
      setIsCustomTitle(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      setError("Please enter the teacher's name.");
      return;
    }

    const finalTitle = isCustomTitle ? customTitle.trim() : teacherTitle;
    if (!finalTitle.trim()) {
      setError("Please specify a category or title.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append("name", teacherName.trim());
      formData.append("title", finalTitle);
      formData.append("role", teacherRole.trim());
      formData.append("order", String(teacherOrder));

      if (teacherFile) {
        formData.append("image", teacherFile);
      }
      if (deleteProfileImage) {
        formData.append("deleteImage", "true");
      }

      let res;
      if (editTeacher) {
        res = await fetch(`${API_BASE}/admin/staff/${editTeacher.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE}/admin/staff`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      if (!res.ok) throw new Error("API call failed");

      setSuccess(editTeacher ? "Staff details updated!" : "Staff member added successfully!");
      fetchData();
      setTimeout(() => {
        setShowTeacherForm(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/staff/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Staff member deleted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete staff member.");
    }
  };

  // Slideshow handlers
  const handleOpenAddCarousel = () => {
    setCarouselOrder(carousel.length + 1);
    setCarouselFile(null);
    setShowCarouselForm(true);
    setError("");
    setSuccess("");
  };

  const handleCarouselSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carouselFile) {
      setError("Please choose an image file to upload.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append("image", carouselFile);
      formData.append("order", String(carouselOrder));

      const res = await fetch(`${API_BASE}/admin/staff/carousel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Carousel upload failed");

      setSuccess("Slideshow image uploaded successfully!");
      fetchData();
      setTimeout(() => {
        setShowCarouselForm(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to upload slide.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCarousel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slideshow image?")) return;
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/staff/carousel/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Slideshow image deleted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete slideshow image.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="row" style={{ marginBottom: "30px" }}>
        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>Staff & Teacher Management</h2>
            <p style={{ color: "#777", marginTop: "5px" }}>Manage school teaching staff directory and the staff page slide carousel.</p>
          </div>
          <div>
            {activeTab === "teachers" ? (
              <button className="btn btn-primary" onClick={handleOpenAddTeacher}>
                <i className="fa fa-user-plus"></i> Add New Teacher
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleOpenAddCarousel}>
                <i className="fa fa-upload"></i> Upload Slide Image
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="row" style={{ marginBottom: "20px" }}>
        <div className="col-md-12">
          <ul className="nav nav-tabs" style={{ borderBottom: "1px solid #ddd", display: "flex", listStyle: "none", paddingLeft: 0 }}>
            <li style={{ marginRight: "10px" }}>
              <button
                className="btn"
                style={{
                  border: "1px solid transparent",
                  borderBottom: activeTab === "teachers" ? "3px solid #214AB3" : "none",
                  fontWeight: activeTab === "teachers" ? "bold" : "normal",
                  color: activeTab === "teachers" ? "#214AB3" : "#555",
                  background: "none",
                  padding: "10px 15px",
                  outline: "none"
                }}
                onClick={() => setActiveTab("teachers")}
              >
                Teachers List
              </button>
            </li>
            <li>
              <button
                className="btn"
                style={{
                  border: "1px solid transparent",
                  borderBottom: activeTab === "carousel" ? "3px solid #214AB3" : "none",
                  fontWeight: activeTab === "carousel" ? "bold" : "normal",
                  color: activeTab === "carousel" ? "#214AB3" : "#555",
                  background: "none",
                  padding: "10px 15px",
                  outline: "none"
                }}
                onClick={() => setActiveTab("carousel")}
              >
                Slideshow Carousel
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Notifications */}
      <div className="row">
        <div className="col-md-12">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      </div>

      {/* Content */}
      <div className="row">
        {loading ? (
          <div className="col-md-12 text-center" style={{ padding: "50px" }}>
            <h4>Loading staff data...</h4>
          </div>
        ) : activeTab === "teachers" ? (
          /* Teachers List Display */
          staff.length === 0 ? (
            <div className="col-md-12 text-center" style={{ padding: "50px", color: "#666" }}>
              No teachers added yet. Click "Add New Teacher" to build the staff directory.
            </div>
          ) : (
            <div className="col-md-12">
              <div className="panel panel-default" style={{ border: "1px solid #ddd" }}>
                <div className="panel-heading" style={{ background: "#f9f9f9", fontWeight: "bold" }}>
                  Active Staff Directory ({staff.length} Members)
                </div>
                <div className="panel-body" style={{ padding: 0 }}>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "12px 15px" }}>Photo</th>
                          <th style={{ padding: "12px 15px" }}>Name</th>
                          <th style={{ padding: "12px 15px" }}>Category / Title</th>
                          <th style={{ padding: "12px 15px" }}>Role / Designation</th>
                          <th style={{ padding: "12px 15px" }}>Order</th>
                          <th style={{ padding: "12px 15px", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.map((member) => (
                          <tr key={member.id}>
                            <td style={{ padding: "12px 15px", verticalAlign: "middle" }}>
                              {member.image ? (
                                <img
                                  src={member.image}
                                  alt={member.name}
                                  style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover", border: "1px solid #ccc" }}
                                />
                              ) : (
                                <div style={{
                                  width: "45px",
                                  height: "45px",
                                  borderRadius: "50%",
                                  background: "#214AB3",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                  fontSize: "16px"
                                }}>
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "12px 15px", fontWeight: "bold", verticalAlign: "middle" }}>{member.name}</td>
                            <td style={{ padding: "12px 15px", verticalAlign: "middle" }}>
                              <span className="label label-default" style={{ background: "#eee", color: "#333", border: "1px solid #ddd", padding: "4px 8px" }}>
                                {member.title}
                              </span>
                            </td>
                            <td style={{ padding: "12px 15px", verticalAlign: "middle" }}>
                              {member.role ? (
                                <span style={{ color: "#214AB3", fontWeight: "500" }}>{member.role}</span>
                              ) : (
                                <span style={{ color: "#aaa", fontStyle: "italic" }}>None</span>
                              )}
                            </td>
                            <td style={{ padding: "12px 15px", verticalAlign: "middle" }}>{member.order || 0}</td>
                            <td style={{ padding: "12px 15px", textAlign: "right", verticalAlign: "middle" }}>
                              <button
                                className="btn btn-xs btn-primary"
                                style={{ marginRight: "5px" }}
                                onClick={() => handleOpenEditTeacher(member)}
                              >
                                <i className="fa fa-pencil"></i> Edit
                              </button>
                              <button
                                className="btn btn-xs btn-danger"
                                onClick={() => handleDeleteTeacher(member.id)}
                              >
                                <i className="fa fa-trash"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* Carousel/Slideshow Display */
          carousel.length === 0 ? (
            <div className="col-md-12 text-center" style={{ padding: "50px", color: "#666" }}>
              No custom slides uploaded. The staff page is currently showing default group photos st-1 to st-4.
            </div>
          ) : (
            <div className="col-md-12">
              <div className="row">
                {carousel.map((slide) => (
                  <div key={slide.id} className="col-md-3 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
                    <div className="thumbnail" style={{ padding: "8px", border: "1px solid #ddd", background: "#fff", display: "flex", flexDirection: "column" }}>
                      <div style={{ position: "relative", height: "140px", overflow: "hidden", background: "#f5f5f5", borderRadius: "2px" }}>
                        <img
                          src={slide.image}
                          alt="Staff slide image"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                        <span className="label label-info" style={{ background: "#214AB3" }}>
                          Order: {slide.order || 0}
                        </span>
                        <button
                          className="btn btn-xs btn-danger"
                          onClick={() => handleDeleteCarousel(slide.id)}
                        >
                          <i className="fa fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {/* 1. Add / Edit Teacher Modal Form */}
      {showTeacherForm && (
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
            maxWidth: "550px",
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
                {editTeacher ? "Edit Teacher Details" : "Add New Teacher"}
              </h4>
              <button type="button" className="close" onClick={() => setShowTeacherForm(false)} style={{ color: "#fff", opacity: 0.8, background: "none", border: "none", fontSize: "20px" }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit}>
              <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
                {/* Name */}
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Teacher / Staff Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="e.g. Mrs. Monica Ahuja Rao"
                    required
                  />
                </div>

                {/* Title / Section Dropdown */}
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Category / Section Title *</label>
                  <select
                    className="form-control"
                    value={isCustomTitle ? "Other" : teacherTitle}
                    onChange={(e) => handleTeacherTitleChange(e.target.value)}
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Other">Other (Type Custom Category)</option>
                  </select>
                </div>

                {/* Custom Category Input */}
                {isCustomTitle && (
                  <div className="form-group" style={{ marginBottom: "15px" }}>
                    <label className="control-label" style={{ fontWeight: "bold" }}>Specify Category Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Nursery Department"
                      required
                    />
                  </div>
                )}

                {/* Role */}
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Role / Designation (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={teacherRole}
                    onChange={(e) => setTeacherRole(e.target.value)}
                    placeholder="e.g. Principal / Account Head / Sport Teacher"
                  />
                </div>

                {/* Order */}
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Sorting Order (Lower appears first)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={teacherOrder}
                    onChange={(e) => setTeacherOrder(Number(e.target.value))}
                    min={0}
                  />
                </div>

                {/* Image Upload */}
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Profile Photo (Optional)</label>
                  
                  {editTeacher && editTeacher.image && !deleteProfileImage && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
                      <img
                        src={editTeacher.image}
                        alt="Current Profile"
                        style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        className="btn btn-xs btn-danger"
                        onClick={() => setDeleteProfileImage(true)}
                      >
                        <i className="fa fa-trash"></i> Remove Photo
                      </button>
                    </div>
                  )}

                  {(!editTeacher || !editTeacher.image || deleteProfileImage) && (
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => setTeacherFile(e.target.files ? e.target.files[0] : null)}
                    />
                  )}
                </div>
              </div>

              <div style={{ background: "#f5f5f5", padding: "15px", borderTop: "1px solid #ddd", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn-default" onClick={() => setShowTeacherForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: "#214AB3" }} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Slideshow Image Modal Form */}
      {showCarouselForm && (
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
              <h4 style={{ margin: 0, fontWeight: "bold" }}>Upload Slideshow Image</h4>
              <button type="button" className="close" onClick={() => setShowCarouselForm(false)} style={{ color: "#fff", opacity: 0.8, background: "none", border: "none", fontSize: "20px" }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCarouselSubmit}>
              <div style={{ padding: "20px" }}>
                {/* Image File */}
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Choose Slideshow Image *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setCarouselFile(e.target.files ? e.target.files[0] : null)}
                    required
                  />
                  <p className="help-block" style={{ fontSize: "12px", color: "#777", marginTop: "5px" }}>
                    Recommended size: 800x600 pixels or landscape aspect ratio.
                  </p>
                </div>

                {/* Display Order */}
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Display Order Sequence</label>
                  <input
                    type="number"
                    className="form-control"
                    value={carouselOrder}
                    onChange={(e) => setCarouselOrder(Number(e.target.value))}
                    min={0}
                    required
                  />
                </div>
              </div>

              <div style={{ background: "#f5f5f5", padding: "15px", borderTop: "1px solid #ddd", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn-default" onClick={() => setShowCarouselForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: "#214AB3" }} disabled={submitting}>
                  {submitting ? "Uploading..." : "Upload Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
