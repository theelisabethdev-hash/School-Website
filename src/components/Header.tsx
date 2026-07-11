"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { nav } from "@/lib/site";

const auth = getAuth(app);

export default function Header() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/admin";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const isAdminRoute = pathname?.startsWith("/admin");
  const isDashboardRoute = pathname?.startsWith("/admin/dashboard");

  if (isAdminRoute) {
    return (
      <>
        <div className="header row">
          <div className="col-sm-12 col-xs-12 text-center header-left-col">
            <a
              href="/admin/dashboard"
              className="header-logo-link"
              style={{
                float: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "15px",
                textDecoration: "none",
              }}
            >
              <img
                src="/images/school-logo.jpg"
                alt="Shiv Niketan Education Society"
                className="header-logo-img"
                style={{ height: "62px", width: "62px", objectFit: "contain" }}
              />
              <span style={{ textAlign: "left" }} className="header-text-container">
                <span
                  className="header-title"
                  style={{
                    display: "block",
                    color: "#214AB3",
                    fontWeight: "bold",
                    fontFamily: "Georgia, 'Times New Roman', Times, serif",
                    fontSize: "26px",
                    lineHeight: "1.3",
                  }}
                >
                  The Elisabeth Gauba School — Admin Panel
                </span>
                <span className="header-subtitle" style={{ display: "block", color: "#000", fontSize: "14px" }}>
                  ESTD : 1938 | Managed by Shiv Niketan Society
                </span>
              </span>
            </a>
          </div>
        </div>

        {isDashboardRoute && (
          <div className="main_header_area">
            <div className="col-md-12 text-center">
              <header>
                <div className="main_menu_area">
                  <div className="mainmenu">
                    <nav style={{ display: "block" }}>
                      <ul id="nav" style={{ fontSize: "10px" }}>
                        <li></li>
                        <li className={pathname === "/admin/dashboard" ? "current_page_item" : ""}>
                          <a href="/admin/dashboard">Overview</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/notices") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/notices">Notices</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/banners") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/banners">Banners</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/gallery") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/gallery">Gallery</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/activities") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/activities">Activities</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/co-curricular") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/co-curricular">Co-Curricular</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/facilities") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/facilities">Facilities</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/admissions") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/admissions">Admissions Data</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/contacts") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/contacts">Messages</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/vacancies") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/vacancies">Vacancies</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/staff") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/staff">Staff</a>
                        </li>
                        <li className={pathname.startsWith("/admin/dashboard/school-timing") ? "current_page_item" : ""}>
                          <a href="/admin/dashboard/school-timing">School Timing</a>
                        </li>
                        {userEmail && (
                          <li className="admin-logout">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: "#e74c3c" }}>
                              Logout ({userEmail})
                            </a>
                          </li>
                        )}
                      </ul>
                    </nav>
                  </div>
                </div>
              </header>
            </div>
          </div>
        )}
      </>
    );
  }

  // Helper — is a top-level nav group "active" for the current path?
  function isGroupActive(group: (typeof nav)[0]): boolean {
    if (group.href) return pathname === group.href;
    return (group.children ?? []).some((child) => pathname.startsWith(child.href));
  }

  return (
    <>
      <div className="header row">
        <div className="col-sm-10 col-xs-12 text-center header-left-col">
          <a
            href="/"
            className="header-logo-link"
            style={{
              float: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "15px",
              textDecoration: "none",
            }}
          >
            <img
              src="/images/school-logo.jpg"
              alt="Shiv Niketan Education Society"
              className="header-logo-img"
              style={{ height: "62px", width: "62px", objectFit: "contain" }}
            />
            <span style={{ textAlign: "left" }} className="header-text-container">
              <span
                className="header-title"
                style={{
                  display: "block",
                  color: "#214AB3",
                  fontWeight: "bold",
                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                  fontSize: "26px",
                  lineHeight: "1.3",
                }}
              >
                The Elisabeth Gauba School
              </span>
              <span className="header-subtitle" style={{ display: "block", color: "#000", fontSize: "14px" }}>
                ESTD : 1938 | Formerly, Shiv Niketan School
              </span>
            </span>
          </a>
        </div>
        <div className="col-sm-2 col-xs-12 header-social-col" style={{ marginTop: "20px" }}>
          <div className="social-icons-wrapper">
            <a href="https://m.facebook.com/TheElisabethGaubaSchool" target="_blank" rel="noreferrer">
              <i style={{ fontSize: "30px" }} className="fa fa-facebook-square" aria-hidden="true"></i>
            </a>
            &nbsp;
            <a href="https://www.instagram.com/theelisabethgaubaschool/" target="_blank" rel="noreferrer">
              <i style={{ fontSize: "30px" }} className="fa fa-instagram" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="main_header_area">
        <div className="col-md-12 text-center">
          <header>
            <div className="main_menu_area">
              <div className="mainmenu">
                <nav style={{ display: "block" }}>
                  <ul id="nav" style={{ fontSize: "8px" }}>
                    {/* Empty first li preserved from legacy markup for menu plugin compatibility */}
                    <li></li>

                    {nav.map((group) => (
                      <li
                        key={group.label}
                        className={isGroupActive(group) ? "current_page_item" : ""}
                      >
                        {group.href ? (
                          <a href={group.href}>{group.label}</a>
                        ) : (
                          <>
                            <a href="#">
                              {group.label}
                              <i className="fa fa-caret-down"></i>
                            </a>
                            <ul className="sub-menu">
                              {(group.children ?? []).map((child) => (
                                <li key={child.href}>
                                  <a href={child.href}>{child.label}</a>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </header>
        </div>
      </div>
    </>
  );
}
