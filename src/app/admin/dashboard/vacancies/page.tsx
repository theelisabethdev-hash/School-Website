"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type Vacancy = {
  id: string;
  post: string;
  qualification: string;
  status: string;
};

export default function VacanciesManagerPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit / Add state
  const [editVacancy, setEditVacancy] = useState<Vacancy | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [post, setPost] = useState("");
  const [qualification, setQualification] = useState("");
  const [status, setStatus] = useState("Open");

  useEffect(() => {
    fetchVacancies();
  }, []);

  async function fetchVacancies() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/vacancies`);
      if (res.ok) {
        const data = await res.json();
        setVacancies(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load vacancies", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditVacancy(null);
    setPost("");
    setQualification("");
    setStatus("Open");
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (vacancy: Vacancy) => {
    setEditVacancy(vacancy);
    setPost(vacancy.post);
    setQualification(vacancy.qualification);
    setStatus(vacancy.status || "Open");
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditVacancy(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const payload = { post, qualification, status };

      let res;
      if (editVacancy) {
        res = await fetch(`${API_BASE}/admin/vacancies/${editVacancy.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/admin/vacancies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("API request failed");

      setSuccess(editVacancy ? "Vacancy updated successfully!" : "Vacancy added successfully!");
      fetchVacancies();
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
    if (!confirm("Are you sure you want to delete this vacancy?")) return;
    setError("");
    setSuccess("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/vacancies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Vacancy deleted successfully!");
      fetchVacancies();
    } catch (err) {
      console.error(err);
      setError("Failed to delete vacancy.");
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: "30px" }}>
        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>Manage Careers & Vacancies</h2>
            <p style={{ color: "#777", marginTop: "5px" }}>Add, edit, or delete job postings displayed on the website vacancies page.</p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <i className="fa fa-plus"></i> Add New Vacancy
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

      {/* Vacancies Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="panel panel-primary" style={{ borderColor: "#214AB3" }}>
            <div className="panel-heading" style={{ background: "#214AB3", borderColor: "#214AB3" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Active Job Postings</h3>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table table-striped table-bordered" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      <th style={{ width: "25%" }}>Post Name</th>
                      <th style={{ width: "50%" }}>Qualifications Details</th>
                      <th style={{ width: "10%", textAlign: "center" }}>Status</th>
                      <th style={{ width: "15%", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "30px" }}>Loading vacancies...</td>
                      </tr>
                    ) : vacancies.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "30px" }}>No active vacancies found. Click &quot;Add New Vacancy&quot; to publish one!</td>
                      </tr>
                    ) : (
                      vacancies.map((v) => (
                        <tr key={v.id}>
                          <td><strong>{v.post}</strong></td>
                          <td style={{ whiteSpace: "pre-line" }}>{v.qualification}</td>
                          <td style={{ textAlign: "center" }}>
                            <span className={`label label-${v.status.toLowerCase() === "open" ? "success" : "default"}`}>
                              {v.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                              <button className="btn btn-xs btn-primary" onClick={() => handleOpenEdit(v)}>
                                <i className="fa fa-pencil"></i> Edit
                              </button>
                              <button className="btn btn-xs btn-danger" onClick={() => handleDelete(v.id)}>
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
                {editVacancy ? "Edit Vacancy Details" : "Add New Vacancy"}
              </h4>
              <button type="button" className="close" onClick={handleCloseForm} style={{ color: "#fff", opacity: 0.8 }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Post Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={post}
                    onChange={(e) => setPost(e.target.value)}
                    required
                    placeholder="e.g. Pre-Primary & Primary Teachers"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Status *</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="control-label" style={{ fontWeight: "bold" }}>Qualifications Details *</label>
                  <textarea
                    className="form-control"
                    rows={6}
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    required
                    placeholder="Provide details about requirements, qualifications, and role responsibilities. You can use separate lines for each point."
                  />
                </div>
              </div>

              <div style={{
                background: "#f5f5f5",
                padding: "15px",
                borderBottomLeftRadius: "4px",
                borderBottomRightRadius: "4px",
                textAlign: "right",
                borderTop: "1px solid #e5e5e5"
              }}>
                <button type="button" className="btn btn-default" onClick={handleCloseForm} style={{ marginRight: "10px" }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: "#214AB3" }} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Vacancy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
