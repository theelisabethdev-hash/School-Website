"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type Stats = {
  notices: number;
  banners: number;
  gallery: number;
  activities: number;
  registrations: number;
  submissions: number;
  contacts: number;
  contactsUnread: number;
  vacancies: number;
  society: number;
  staff: number;
  cocurricular: number;
  facilities: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    notices: 0,
    banners: 0,
    gallery: 0,
    activities: 0,
    registrations: 0,
    submissions: 0,
    contacts: 0,
    contactsUnread: 0,
    vacancies: 0,
    society: 0,
    staff: 0,
    cocurricular: 0,
    facilities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = await auth.currentUser?.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all in parallel
        const [bannersRes, noticesRes, galleryRes, activitiesRes, regRes, subRes, contactsRes, vacanciesRes, societyRes, staffRes, cocurricularRes, facilitiesRes] = await Promise.all([
          fetch(`${API_BASE}/banners`),
          fetch(`${API_BASE}/news`),
          fetch(`${API_BASE}/gallery`),
          fetch(`${API_BASE}/activities`),
          fetch(`${API_BASE}/admin/registrations`, { headers }),
          fetch(`${API_BASE}/admin/submissions`, { headers }),
          fetch(`${API_BASE}/admin/contacts`, { headers }),
          fetch(`${API_BASE}/vacancies`),
          fetch(`${API_BASE}/society`),
          fetch(`${API_BASE}/staff`),
          fetch(`${API_BASE}/cocurricular`),
          fetch(`${API_BASE}/facilities`),
        ]);

        const banners = bannersRes.ok ? await bannersRes.json() : [];
        const notices = noticesRes.ok ? await noticesRes.json() : [];
        const gallery = galleryRes.ok ? await galleryRes.json() : [];
        const activities = activitiesRes.ok ? await activitiesRes.json() : [];
        const registrations = regRes.ok ? await regRes.json() : [];
        const submissions = subRes.ok ? await subRes.json() : [];
        const contacts = contactsRes.ok ? await contactsRes.json() : [];
        const vacancies = vacanciesRes.ok ? await vacanciesRes.json() : [];
        const society = societyRes.ok ? await societyRes.json() : [];
        const staff = staffRes.ok ? await staffRes.json() : [];
        const cocurricular = cocurricularRes.ok ? await cocurricularRes.json() : [];
        const facilities = facilitiesRes.ok ? await facilitiesRes.json() : [];

        setStats({
          banners: Array.isArray(banners) ? banners.length : 0,
          notices: Array.isArray(notices) ? notices.length : 0,
          gallery: Array.isArray(gallery) ? gallery.length : 0,
          activities: Array.isArray(activities) ? activities.length : 0,
          registrations: Array.isArray(registrations) ? registrations.length : 0,
          submissions: Array.isArray(submissions) ? submissions.length : 0,
          contacts: Array.isArray(contacts) ? contacts.length : 0,
          contactsUnread: Array.isArray(contacts) ? contacts.filter((c: {read: boolean}) => !c.read).length : 0,
          vacancies: Array.isArray(vacancies) ? vacancies.length : 0,
          society: Array.isArray(society) ? society.length : 0,
          staff: Array.isArray(staff) ? staff.length : 0,
          cocurricular: Array.isArray(cocurricular) ? cocurricular.length : 0,
          facilities: Array.isArray(facilities) ? facilities.length : 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <h3 className="Main_header">Loading Dashboard Statistics...</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: "30px" }}>
        <div className="col-md-12">
          <h2 className="Main_header" style={{ fontSize: "28px", borderBottom: "2px solid #214AB3", paddingBottom: "10px" }}>
            Administration Overview
          </h2>
          <p style={{ fontSize: "16px", color: "#555", marginTop: "10px" }}>
            Welcome to the Elisabeth Gauba School management portal. Use the tabs above to manage content and view registrations.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#214AB3" }}>
            <div className="panel-heading" style={{ background: "#214AB3", borderColor: "#214AB3" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Notices & News</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#214AB3" }}>{stats.notices}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>Active notices published on the site.</p>
              <a href="/admin/dashboard/notices" className="btn btn-primary btn-block" style={{ background: "#214AB3" }}>
                Manage Notices
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#214AB3" }}>
            <div className="panel-heading" style={{ background: "#214AB3", borderColor: "#214AB3" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Banners Carousel</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#214AB3" }}>{stats.banners}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>Slideshow banner images on the homepage.</p>
              <a href="/admin/dashboard/banners" className="btn btn-primary btn-block" style={{ background: "#214AB3" }}>
                Manage Banners
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#214AB3" }}>
            <div className="panel-heading" style={{ background: "#214AB3", borderColor: "#214AB3" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Photo Gallery</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#214AB3" }}>{stats.gallery}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>Albums and photo sets available to users.</p>
              <a href="/admin/dashboard/gallery" className="btn btn-primary btn-block" style={{ background: "#214AB3" }}>
                Manage Gallery
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: "10px" }}>
        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#27ae60" }}>
            <div className="panel-heading" style={{ background: "#27ae60", borderColor: "#27ae60" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>School Activities</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#27ae60" }}>{stats.activities}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>Monthly school activity postings.</p>
              <a href="/admin/dashboard/activities" className="btn btn-success btn-block" style={{ background: "#27ae60", borderColor: "#27ae60" }}>
                Manage Activities
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#8e44ad" }}>
            <div className="panel-heading" style={{ background: "#8e44ad", borderColor: "#8e44ad" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Online Registrations</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#8e44ad" }}>{stats.registrations}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>Full online applications submitted by parents.</p>
              <a href="/admin/dashboard/admissions" className="btn btn-block" style={{ background: "#8e44ad", color: "#fff" }}>
                View Registrations
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#d35400" }}>
            <div className="panel-heading" style={{ background: "#d35400", borderColor: "#d35400" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Form Uploads</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#d35400" }}>{stats.submissions}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>Filled PDF files and receipts uploaded.</p>
              <a href="/admin/dashboard/admissions?tab=uploads" className="btn btn-warning btn-block" style={{ background: "#d35400", borderColor: "#d35400", color: "#fff" }}>
                View Uploaded Forms
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#16a085" }}>
            <div className="panel-heading" style={{ background: "#16a085", borderColor: "#16a085" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Contact Messages</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#16a085" }}>{stats.contacts}</h1>
              {stats.contactsUnread > 0 && (
                <p style={{ color: "#e74c3c", fontWeight: "bold", marginBottom: "4px" }}>
                  {stats.contactsUnread} unread
                </p>
              )}
              <p style={{ color: "#777", marginBottom: "20px" }}>Messages from homepage &amp; Contact Us form.</p>
              <a href="/admin/dashboard/contacts" className="btn btn-block" style={{ background: "#16a085", color: "#fff" }}>
                View Messages
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#2980b9" }}>
            <div className="panel-heading" style={{ background: "#2980b9", borderColor: "#2980b9" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Vacancies</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#2980b9" }}>{stats.vacancies}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>Active job vacancy listings on the careers page.</p>
              <a href="/admin/dashboard/vacancies" className="btn btn-block" style={{ background: "#2980b9", color: "#fff" }}>
                Manage Vacancies
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#c59b27" }}>
            <div className="panel-heading" style={{ background: "#c59b27", borderColor: "#c59b27" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Shiv Niketan Society</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#c59b27" }}>{stats.society}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>Photos and PDF files for Shiv Niketan Society.</p>
              <a href="/admin/dashboard/society" className="btn btn-block" style={{ background: "#c59b27", color: "#fff" }}>
                Manage Society Section
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#214AB3" }}>
            <div className="panel-heading" style={{ background: "#214AB3", borderColor: "#214AB3" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Teaching Staff</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#214AB3" }}>{stats.staff}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>Teachers and administrative staff members.</p>
              <a href="/admin/dashboard/staff" className="btn btn-primary btn-block" style={{ background: "#214AB3" }}>
                Manage Staff
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#1abc9c" }}>
            <div className="panel-heading" style={{ background: "#1abc9c", borderColor: "#1abc9c" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Co-Curricular</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#1abc9c" }}>{stats.cocurricular}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>Co-Curricular activities (Music, Sports, etc.).</p>
              <a href="/admin/dashboard/co-curricular" className="btn btn-block" style={{ background: "#1abc9c", borderColor: "#1abc9c", color: "#fff" }}>
                Manage Co-Curricular
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#e67e22" }}>
            <div className="panel-heading" style={{ background: "#e67e22", borderColor: "#e67e22" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>Facilities & Infrastructure</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0", color: "#e67e22" }}>{stats.facilities}</h1>
              <p style={{ color: "#777", marginBottom: "20px" }}>School facilities (Labs, Library, Swing, etc.).</p>
              <a href="/admin/dashboard/facilities" className="btn btn-block" style={{ background: "#e67e22", borderColor: "#e67e22", color: "#fff" }}>
                Manage Facilities
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6 col-xs-12" style={{ marginBottom: "20px" }}>
          <div className="panel panel-primary" style={{ borderColor: "#6c757d" }}>
            <div className="panel-heading" style={{ background: "#6c757d", borderColor: "#6c757d" }}>
              <h3 className="panel-title" style={{ fontWeight: "bold" }}>School Timing</h3>
            </div>
            <div className="panel-body" style={{ textAlign: "center", padding: "30px 15px" }}>
              <div style={{ fontSize: "48px", margin: "10px 0", color: "#6c757d" }}>
                <i className="fa fa-clock-o" aria-hidden="true"></i>
              </div>
              <p style={{ color: "#777", marginBottom: "20px" }}>Manage school hours, office timing, and important notes.</p>
              <a href="/admin/dashboard/school-timing" className="btn btn-block" style={{ background: "#6c757d", borderColor: "#6c757d", color: "#fff" }}>
                Edit School Timing
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
