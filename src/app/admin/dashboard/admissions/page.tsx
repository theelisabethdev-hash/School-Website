"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { exportToCSV } from "@/lib/export";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type OnlineRegistration = {
  id: string;
  reg_class: string;
  academic: string;
  student_name: string;
  studdob: string;
  words_dob?: string;
  sex?: string;
  nationality?: string;
  category?: string;
  adhar_card_no?: string;
  blood_group?: string;
  father_name: string;
  father_profession?: string;
  f_designation?: string;
  f_mobile_no?: string;
  f_mail_id?: string;
  f_telephone?: string;
  f_address?: string;
  fr_address?: string;
  m_name: string;
  m_profession?: string;
  m_designation?: string;
  m_mobile?: string;
  m_email_id?: string;
  mo_tongue?: string;
  mo_address?: string;
  mr_address?: string;
  g_name?: string;
  g_relation?: string;
  g_profession?: string;
  g_mobile?: string;
  g_mail_id?: string;
  go_address?: string;
  single_parent?: string;
  special_child?: string;
  special_child_details?: string;
  sibling?: string;
  sibling_name?: string;
  sibling_section?: string;
  last_school?: string;
  last_school_name?: string;
  last_school_address?: string;
  alumni?: string;
  sc_transport?: string;
  health?: string;
  illness?: string;
  medication?: string;
  allergy?: string;
  allergy_specify?: string;
  documents?: {
    child_photo?: string;
    child_cert?: string;
    residence_proof?: string;
    payement_image?: string;
    adhar_card?: string;
    cert_copy?: string;
  };
  per_name?: string;
  per_email?: string;
  per_mobile?: string;
  trans_id?: string;
  per_date_time?: string;
  doe?: string;
};

type FormUpload = {
  id: string;
  per_name: string;
  per_email: string;
  per_mobile: string;
  trans_id: string;
  per_date_time: string;
  pdf_doc?: string;
  payement_image?: string;
  document?: string;
  doe?: string;
};

export default function AdmissionsManagerPage() {
  const [activeTab, setActiveTab] = useState<"online" | "uploads">("online");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [onlineData, setOnlineData] = useState<OnlineRegistration[]>([]);
  const [uploadsData, setUploadsData] = useState<FormUpload[]>([]);

  // Selected Detail Modal
  const [selectedOnline, setSelectedOnline] = useState<OnlineRegistration | null>(null);
  const [selectedUpload, setSelectedUpload] = useState<FormUpload | null>(null);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  async function fetchAdmissions() {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [regRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/admin/registrations`, { headers }),
        fetch(`${API_BASE}/admin/submissions`, { headers }),
      ]);

      if (regRes.ok) {
        const data = await regRes.json();
        setOnlineData(Array.isArray(data) ? data : []);
      }
      if (subRes.ok) {
        const data = await subRes.json();
        setUploadsData(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load admissions data", err);
    } finally {
      setLoading(false);
    }
  }

  // Filtered lists
  const filteredOnline = onlineData.filter((r) =>
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.father_name.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUploads = uploadsData.filter((u) =>
    u.per_name.toLowerCase().includes(search.toLowerCase()) ||
    u.per_email.toLowerCase().includes(search.toLowerCase()) ||
    u.trans_id.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportOnlineExcel = () => {
    const exportData = onlineData.map(r => ({
      "Registration ID": r.id,
      Class: r.reg_class,
      Session: r.academic,
      "Student Name": r.student_name,
      DOB: r.studdob,
      Sex: r.sex || "",
      Category: r.category || "",
      "Father Name": r.father_name,
      "Father Mobile": r.f_mobile_no || "",
      "Father Email": r.f_mail_id || "",
      "Mother Name": r.m_name,
      "Mother Mobile": r.m_mobile || "",
      "Submission Date": r.doe || ""
    }));
    exportToCSV(exportData, "online_registrations");
  };

  const handleExportUploadsExcel = () => {
    const exportData = uploadsData.map(u => ({
      "Submission ID": u.id,
      "Parent Name": u.per_name,
      Email: u.per_email,
      Mobile: u.per_mobile,
      "Transaction ID": u.trans_id,
      "Transaction Time": u.per_date_time,
      "Upload Date": u.doe || "",
      "Registration Form PDF": u.pdf_doc || "None",
      "Payment Receipt": u.payement_image || "None",
      "Supporting Doc": u.document || "None"
    }));
    exportToCSV(exportData, "uploaded_registration_forms");
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

      {/* Page Header */}
      <div className="row no-print" style={{ marginBottom: "30px" }}>
        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="Main_header" style={{ fontSize: "28px", margin: 0 }}>Admissions Data Dashboard</h2>
            <p style={{ color: "#777", marginTop: "5px" }}>Review, manage, and export student admissions registrations and uploaded forms.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-default" onClick={activeTab === "online" ? handleExportOnlineExcel : handleExportUploadsExcel}>
              <i className="fa fa-file-excel-o"></i> Export to Excel
            </button>
            <button className="btn btn-default" onClick={() => window.print()}>
              <i className="fa fa-print"></i> Print List
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="row no-print" style={{ marginBottom: "20px" }}>
        <div className="col-md-8">
          <ul className="nav nav-pills">
            <li className={activeTab === "online" ? "active" : ""}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("online"); }} style={{ fontWeight: "bold" }}>
                Online Registrations ({onlineData.length})
              </a>
            </li>
            <li className={activeTab === "uploads" ? "active" : ""}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("uploads"); }} style={{ fontWeight: "bold" }}>
                Form Uploads ({uploadsData.length})
              </a>
            </li>
          </ul>
        </div>
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-addon"><i className="fa fa-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="row" id="print-area">
        <div className="col-md-12">
          <div className="panel panel-primary" style={{ borderColor: "#214AB3" }}>
            <div className="panel-heading no-print" style={{ background: "#214AB3", borderColor: "#214AB3" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>
                {activeTab === "online" ? "Online Student Applications" : "Uploaded Registration Forms"}
              </h3>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                {activeTab === "online" ? (
                  <table className="table table-striped table-bordered" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: "#f5f5f5" }}>
                        <th>ID</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>DOB</th>
                        <th>Father's Name</th>
                        <th>Mother's Name</th>
                        <th className="no-print">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>Loading data...</td>
                        </tr>
                      ) : filteredOnline.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>No online registrations found.</td>
                        </tr>
                      ) : (
                        filteredOnline.map((r) => (
                          <tr key={r.id}>
                            <td><strong>{r.id.substring(0, 8)}</strong></td>
                            <td><strong>{r.student_name}</strong></td>
                            <td>{r.reg_class} ({r.academic})</td>
                            <td>{r.studdob}</td>
                            <td>{r.father_name}</td>
                            <td>{r.m_name}</td>
                            <td className="no-print" style={{ textAlign: "center" }}>
                              <button className="btn btn-xs btn-primary" onClick={() => setSelectedOnline(r)}>
                                <i className="fa fa-eye"></i> Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="table table-striped table-bordered" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: "#f5f5f5" }}>
                        <th>ID</th>
                        <th>Parent Name</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>Transaction ID</th>
                        <th>Docs Uploaded</th>
                        <th className="no-print">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>Loading data...</td>
                        </tr>
                      ) : filteredUploads.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>No uploaded forms found.</td>
                        </tr>
                      ) : (
                        filteredUploads.map((u) => (
                          <tr key={u.id}>
                            <td><strong>{u.id.substring(0, 8)}</strong></td>
                            <td><strong>{u.per_name}</strong></td>
                            <td>{u.per_mobile}</td>
                            <td>{u.per_email}</td>
                            <td><code>{u.trans_id}</code></td>
                            <td>
                              <div style={{ display: "flex", gap: "5px" }}>
                                {u.pdf_doc && <span className="label label-info">Form</span>}
                                {u.payement_image && <span className="label label-success">Receipt</span>}
                                {u.document && <span className="label label-warning">Support</span>}
                              </div>
                            </td>
                            <td className="no-print" style={{ textAlign: "center" }}>
                              <button className="btn btn-xs btn-primary" onClick={() => setSelectedUpload(u)}>
                                <i className="fa fa-eye"></i> Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online Candidate Details Overlay Modal */}
      {selectedOnline && (
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
            width: "90%",
            maxWidth: "800px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh"
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
              <h4 style={{ margin: 0, fontWeight: "bold" }}>Online Candidate Application Form</h4>
              <button type="button" className="close" onClick={() => setSelectedOnline(null)} style={{ color: "#fff", opacity: 0.8 }}>
                &times;
              </button>
            </div>

            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              <div className="row" style={{ marginBottom: "20px" }}>
                <div className="col-xs-8">
                  <h3 className="Main_header" style={{ margin: "0 0 10px 0", color: "#214AB3" }}>
                    {selectedOnline.student_name}
                  </h3>
                  <p><strong>Registration ID:</strong> {selectedOnline.id}</p>
                  <p><strong>Applying For:</strong> Class {selectedOnline.reg_class} ({selectedOnline.academic})</p>
                  <p><strong>Date of Birth:</strong> {selectedOnline.studdob} {selectedOnline.words_dob ? `(${selectedOnline.words_dob})` : ""}</p>
                  <p><strong>Gender / Nationality:</strong> {selectedOnline.sex} / {selectedOnline.nationality || "Indian"}</p>
                  <p><strong>Category / Aadhaar:</strong> {selectedOnline.category || "General"} / {selectedOnline.adhar_card_no || "N/A"}</p>
                </div>
                <div className="col-xs-4 text-right">
                  {selectedOnline.documents?.child_photo ? (
                    <img
                      src={selectedOnline.documents.child_photo}
                      alt="Student Portrait"
                      style={{ width: "120px", height: "120px", objectFit: "cover", border: "1px solid #ddd", borderRadius: "4px" }}
                    />
                  ) : (
                    <div style={{ width: "120px", height: "120px", background: "#eee", display: "inline-flex", justifyContent: "center", alignItems: "center", color: "#aaa" }}>
                      No Photo
                    </div>
                  )}
                </div>
              </div>

              <hr style={{ margin: "10px 0 20px 0" }} />

              <div className="row">
                <div className="col-md-6">
                  <h4 style={{ fontWeight: "bold", color: "#214AB3", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Father's Details</h4>
                  <p><strong>Name:</strong> {selectedOnline.father_name}</p>
                  <p><strong>Profession:</strong> {selectedOnline.father_profession || "N/A"} ({selectedOnline.f_designation || "N/A"})</p>
                  <p><strong>Mobile:</strong> {selectedOnline.f_mobile_no || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedOnline.f_mail_id || "N/A"}</p>
                  <p><strong>Office Address:</strong> {selectedOnline.f_address || "N/A"}</p>
                  <p><strong>Residence Address:</strong> {selectedOnline.fr_address || "N/A"}</p>
                </div>
                <div className="col-md-6">
                  <h4 style={{ fontWeight: "bold", color: "#214AB3", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Mother's Details</h4>
                  <p><strong>Name:</strong> {selectedOnline.m_name}</p>
                  <p><strong>Profession:</strong> {selectedOnline.m_profession || "N/A"} ({selectedOnline.m_designation || "N/A"})</p>
                  <p><strong>Mobile:</strong> {selectedOnline.m_mobile || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedOnline.m_email_id || "N/A"}</p>
                  <p><strong>Office Address:</strong> {selectedOnline.mo_address || "N/A"}</p>
                  <p><strong>Residence Address:</strong> {selectedOnline.mr_address || "N/A"}</p>
                </div>
              </div>

              <hr />

              <div className="row">
                <div className="col-md-6">
                  <h4 style={{ fontWeight: "bold", color: "#214AB3", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Family & Sibling Info</h4>
                  <p><strong>Single Parent / Special Child:</strong> {selectedOnline.single_parent || "No"} / {selectedOnline.special_child || "No"}</p>
                  {selectedOnline.special_child === "Yes" && <p><strong>Special child details:</strong> {selectedOnline.special_child_details}</p>}
                  <p><strong>Sibling in School:</strong> {selectedOnline.sibling || "No"}</p>
                  {selectedOnline.sibling === "Yes" && <p><strong>Sibling:</strong> {selectedOnline.sibling_name} ({selectedOnline.sibling_section})</p>}
                </div>
                <div className="col-md-6">
                  <h4 style={{ fontWeight: "bold", color: "#214AB3", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Previous School & Health</h4>
                  <p><strong>Attended School Before:</strong> {selectedOnline.last_school || "No"}</p>
                  {selectedOnline.last_school === "Yes" && <p><strong>School Name/Address:</strong> {selectedOnline.last_school_name} ({selectedOnline.last_school_address})</p>}
                  <p><strong>Transport Required / Alumni Family:</strong> {selectedOnline.sc_transport || "No"} / {selectedOnline.alumni || "No"}</p>
                  <p><strong>Health Status / Medication:</strong> {selectedOnline.health || "Good"} / {selectedOnline.medication || "None"}</p>
                </div>
              </div>

              <hr />

              <div className="row">
                <div className="col-md-12">
                  <h4 style={{ fontWeight: "bold", color: "#214AB3", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Payment Details</h4>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Payer Name:</strong> {selectedOnline.per_name || "N/A"}</p>
                      <p><strong>Payer Email:</strong> {selectedOnline.per_email || "N/A"}</p>
                      <p><strong>Payer Mobile:</strong> {selectedOnline.per_mobile || "N/A"}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Transaction ID:</strong> <code>{selectedOnline.trans_id || "N/A"}</code></p>
                      <p><strong>Payment Date &amp; Time:</strong> {selectedOnline.per_date_time || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <div className="row">
                <div className="col-md-12">
                  <h4 style={{ fontWeight: "bold", color: "#214AB3", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Uploaded Documents</h4>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                    {selectedOnline.documents?.child_cert && (
                      <a href={selectedOnline.documents.child_cert} target="_blank" rel="noreferrer" className="btn btn-default">
                        <i className="fa fa-file-pdf-o"></i> Birth Certificate
                      </a>
                    )}
                    {selectedOnline.documents?.residence_proof && (
                      <a href={selectedOnline.documents.residence_proof} target="_blank" rel="noreferrer" className="btn btn-default">
                        <i className="fa fa-file-pdf-o"></i> Residence Address Proof
                      </a>
                    )}
                    {selectedOnline.documents?.payement_image && (
                      <a href={selectedOnline.documents.payement_image} target="_blank" rel="noreferrer" className="btn btn-default">
                        <i className="fa fa-file-image-o"></i> Payment Receipt Screenshot
                      </a>
                    )}
                    {selectedOnline.documents?.adhar_card && (
                      <a href={selectedOnline.documents.adhar_card} target="_blank" rel="noreferrer" className="btn btn-default">
                        <i className="fa fa-file-pdf-o"></i> Child Aadhaar Card
                      </a>
                    )}
                    {selectedOnline.documents?.cert_copy && (
                      <a href={selectedOnline.documents.cert_copy} target="_blank" rel="noreferrer" className="btn btn-default">
                        <i className="fa fa-file-pdf-o"></i> Report Card of Last School
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: "#f5f5f5",
              padding: "15px",
              borderBottomLeftRadius: "4px",
              borderBottomRightRadius: "4px",
              display: "flex",
              justifyContent: "flex-end"
            }}>
              <button type="button" className="btn btn-default" onClick={() => setSelectedOnline(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Upload Details Overlay Modal */}
      {selectedUpload && (
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
            width: "90%",
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
              <h4 style={{ margin: 0, fontWeight: "bold" }}>Form Upload Submission Details</h4>
              <button type="button" className="close" onClick={() => setSelectedUpload(null)} style={{ color: "#fff", opacity: 0.8 }}>
                &times;
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <h3 className="Main_header" style={{ margin: "0 0 15px 0", color: "#214AB3" }}>
                {selectedUpload.per_name}
              </h3>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td style={{ width: "35%", fontWeight: "bold", background: "#f9f9f9" }}>Submission ID</td>
                    <td>{selectedUpload.id}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", background: "#f9f9f9" }}>Email Address</td>
                    <td>{selectedUpload.per_email}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", background: "#f9f9f9" }}>Mobile Number</td>
                    <td>{selectedUpload.per_mobile}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", background: "#f9f9f9" }}>Transaction Reference ID</td>
                    <td><code>{selectedUpload.trans_id}</code></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", background: "#f9f9f9" }}>Transaction Date/Time</td>
                    <td>{selectedUpload.per_date_time}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", background: "#f9f9f9" }}>Submission Date</td>
                    <td>{selectedUpload.doe || "N/A"}</td>
                  </tr>
                </tbody>
              </table>

              <hr />

              <h4 style={{ fontWeight: "bold", color: "#214AB3", marginBottom: "15px" }}>Submitted Files</h4>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {selectedUpload.pdf_doc ? (
                  <a href={selectedUpload.pdf_doc} target="_blank" rel="noreferrer" className="btn btn-default">
                    <i className="fa fa-file-pdf-o"></i> Registration Form (PDF)
                  </a>
                ) : (
                  <span className="label label-danger">Missing Form PDF</span>
                )}

                {selectedUpload.payement_image ? (
                  <a href={selectedUpload.payement_image} target="_blank" rel="noreferrer" className="btn btn-default">
                    <i className="fa fa-file-image-o"></i> Payment Receipt
                  </a>
                ) : (
                  <span className="label label-danger">Missing Payment Receipt</span>
                )}

                {selectedUpload.document && (
                  <a href={selectedUpload.document} target="_blank" rel="noreferrer" className="btn btn-default">
                    <i className="fa fa-file-pdf-o"></i> Supporting Document
                  </a>
                )}
              </div>
            </div>

            <div style={{
              background: "#f5f5f5",
              padding: "15px",
              borderBottomLeftRadius: "4px",
              borderBottomRightRadius: "4px",
              display: "flex",
              justifyContent: "flex-end"
            }}>
              <button type="button" className="btn btn-default" onClick={() => setSelectedUpload(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
