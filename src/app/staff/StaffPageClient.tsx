"use client";

import { useState, useEffect, useMemo } from "react";
import { StaffMember, StaffCarouselImage } from "@/lib/api";

type Props = {
  staff: StaffMember[];
  carousel: StaffCarouselImage[];
};

const CATEGORIES = [
  "All Staff",
  "Administration",
  "Coordinators",
  "Co-Curricular Teachers",
  "Special Educator",
  "Teachers (I-V)",
  "Support Staff"
];

const SECTION_ORDER = [
  "Administration",
  "Coordinators",
  "Co-Curricular Teachers",
  "Special Educator",
  "Teachers (I-V)",
  "Support Staff"
];

// Helper to get initials from name (filtering salutations)
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  
  let startIdx = 0;
  const salutations = ["mrs.", "mr.", "ms.", "dr.", "prof.", "mrs", "mr", "ms", "dr"];
  
  if (salutations.includes(parts[0].toLowerCase()) && parts.length > 1) {
    startIdx = 1;
  }
  
  const first = parts[startIdx] ? parts[startIdx].charAt(0) : "";
  const second = parts[startIdx + 1] ? parts[startIdx + 1].charAt(0) : "";
  
  return (first + second).toUpperCase() || parts[0].charAt(0).toUpperCase();
};

// Helper to get a beautiful modern gradient for avatar fallback
const getGradientForCategory = (category: string): string => {
  switch (category) {
    case "Administration":
      return "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"; // Royal Blue
    case "Coordinators":
      return "linear-gradient(135deg, #ec4899 0%, #be185d 100%)"; // Deep Pink
    case "Co-Curricular Teachers":
      return "linear-gradient(135deg, #10b981 0%, #047857 100%)"; // Emerald Green
    case "Special Educator":
      return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"; // Amber
    case "Teachers (I-V)":
      return "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"; // Indigo Purple
    case "Support Staff":
      return "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"; // Slate
    default:
      return "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"; // Indigo
  }
};

export default function StaffPageClient({ staff, carousel }: Props) {
  const [selectedTab, setSelectedTab] = useState("All Staff");
  const [slideIndex, setSlideIndex] = useState(0);

  // Group staff by category/title
  const grouped = useMemo(() => {
    const res: Record<string, StaffMember[]> = {};
    staff.forEach((member) => {
      const title = member.title || "Other";
      if (!res[title]) res[title] = [];
      res[title].push(member);
    });

    // Sort members in each category by order
    Object.keys(res).forEach((cat) => {
      res[cat].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return res;
  }, [staff]);

  // Counts of staff in each category for the tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "All Staff": staff.length };
    SECTION_ORDER.forEach((cat) => {
      counts[cat] = grouped[cat]?.length || 0;
    });
    return counts;
  }, [staff, grouped]);

  // Autoplay slideshow every 4.5 seconds
  useEffect(() => {
    if (carousel.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % carousel.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [carousel.length]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev - 1 + carousel.length) % carousel.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev + 1) % carousel.length);
  };

  // Determine which sections to render based on selection
  const activeSections = useMemo(() => {
    if (selectedTab === "All Staff") {
      return SECTION_ORDER.filter((cat) => grouped[cat] && grouped[cat].length > 0);
    }
    return [selectedTab].filter((cat) => grouped[cat] && grouped[cat].length > 0);
  }, [selectedTab, grouped]);

  return (
    <div className="staff-page-container">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Theme Variables */
        :root {
          --primary: #214AB3;
          --secondary: #1abc9c;
          --text-main: #2d3748;
          --text-muted: #718096;
          --bg-gray: #f8fafc;
          --bg-card: #ffffff;
          --border: #e2e8f0;
          --radius-lg: 20px;
          --radius-md: 12px;
          --shadow-sm: 0 4px 6px rgba(33, 74, 179, 0.04);
          --shadow-md: 0 10px 25px rgba(33, 74, 179, 0.08);
          --shadow-lg: 0 20px 35px rgba(33, 74, 179, 0.12);
          --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .staff-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Lato', 'Roboto', sans-serif;
          color: var(--text-main);
        }



        /* Top Panel: Leaderboard & Showcase Carousel */
        .top-panel-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 30px;
          margin-bottom: 50px;
          animation: staffSlideUp 0.8s ease-out;
        }

        @media (max-width: 991px) {
          .top-panel-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Administration Panel Card */
        .admin-card-container {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 30px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .panel-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 25px;
          position: relative;
          padding-left: 15px;
        }

        .panel-title::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 4px;
          background: var(--secondary);
          border-radius: 2px;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        @media (max-width: 575px) {
          .admin-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Card Elements */
        .staff-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: var(--transition-smooth);
          box-shadow: var(--shadow-sm);
        }

        .staff-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: rgba(33, 74, 179, 0.2);
        }

        .staff-avatar-wrapper {
          flex-shrink: 0;
          position: relative;
        }

        .staff-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--bg-gray);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: var(--transition-smooth);
        }

        .staff-card:hover .staff-avatar {
          transform: scale(1.05);
          border-color: var(--secondary);
        }

        .staff-avatar-placeholder {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 20px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.1);
        }

        .staff-info {
          flex-grow: 1;
          min-width: 0;
        }

        .staff-name {
          font-size: 15px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .staff-role-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          color: var(--primary);
          background: rgba(33, 74, 179, 0.07);
          padding: 3px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* React Slideshow */
        .slideshow-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          overflow: hidden;
          position: relative;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border);
          aspect-ratio: 4 / 3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slide-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.8s ease-in-out, transform 1s ease-in-out;
          transform: scale(1.03);
        }

        .slide-img.active {
          opacity: 1;
          transform: scale(1);
        }

        .slider-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
          padding: 25px 20px 15px;
          color: white;
          z-index: 5;
        }

        .slider-overlay h4 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 5px 0;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        .slider-overlay p {
          font-size: 13px;
          margin: 0;
          opacity: 0.9;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .slide-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          color: var(--text-main);
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: var(--transition-smooth);
          z-index: 10;
          opacity: 0;
        }

        .slideshow-card:hover .slide-nav-btn {
          opacity: 1;
        }

        .slide-nav-btn:hover {
          background: var(--primary);
          color: white;
        }

        .slide-nav-btn.prev { left: 15px; }
        .slide-nav-btn.next { right: 15px; }

        .slide-dots {
          position: absolute;
          bottom: 15px;
          right: 20px;
          display: flex;
          gap: 6px;
          z-index: 10;
        }

        .slide-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: var(--transition-smooth);
        }

        .slide-dot.active {
          background: white;
          width: 18px;
          border-radius: 4px;
        }

        /* Filter Tab Switcher */
        .tabs-container {
          margin-bottom: 40px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          animation: staffFadeIn 0.8s ease-out;
        }

        .tab-button {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 10px 18px;
          border-radius: 30px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-main);
          cursor: pointer;
          transition: var(--transition-smooth);
          box-shadow: var(--shadow-sm);
        }

        .tab-button:hover {
          background: var(--bg-gray);
          border-color: var(--primary);
          color: var(--primary);
        }

        .tab-button.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(33, 74, 179, 0.25);
        }

        .tab-count {
          font-size: 11px;
          opacity: 0.8;
          margin-left: 5px;
          background: rgba(0, 0, 0, 0.08);
          padding: 1px 6px;
          border-radius: 10px;
        }

        .tab-button.active .tab-count {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Staff Sections */
        .section-container {
          margin-bottom: 45px;
          animation: staffFadeIn 0.5s ease-out;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .section-header h3 {
          font-size: 20px;
          font-weight: 800;
          color: #1a202c;
          white-space: nowrap;
        }

        .section-header-line {
          flex-grow: 1;
          height: 1px;
          background: var(--border);
        }

        /* General Staff Cards Grid */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        /* Support Staff compact grid */
        .support-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 15px;
        }

        .support-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: var(--transition-smooth);
          box-shadow: var(--shadow-sm);
        }

        .support-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: rgba(33, 74, 179, 0.15);
        }

        .support-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--bg-gray);
        }

        .support-avatar-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 15px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .support-name {
          font-size: 14px;
          font-weight: 700;
          color: #2d3748;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .support-tag {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 40px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px dashed var(--border);
          color: var(--text-muted);
        }

        /* Keyframes */
        @keyframes staffFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes staffSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />



      <div className="wthree-heading" style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 className="Main_header">Our Teaching Staff</h1>
      </div>

      {/* Top Panel: Administration grid and Slideshow */}
      <div className="top-panel-grid">
        {/* Administration Cards */}
        <div className="admin-card-container">
          <div>
            <h3 className="panel-title">School Administration</h3>
            {grouped["Administration"] && grouped["Administration"].length > 0 ? (
              <div className="admin-grid">
                {grouped["Administration"].map((member) => (
                  <div key={member.id} className="staff-card">
                    {member.image && (
                      <div className="staff-avatar-wrapper">
                        <img src={member.image} alt={member.name} className="staff-avatar" />
                      </div>
                    )}
                    <div className="staff-info">
                      <div className="staff-name" title={member.name}>{member.name}</div>
                      {member.role && (
                        <span className="staff-role-badge">{member.role}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No administration staff listed.</div>
            )}
          </div>
        </div>

        {/* Dynamic Slideshow Showcase */}
        <div className="slideshow-card">
          {carousel.map((slide, idx) => (
            <img
              key={slide.id}
              src={slide.image}
              alt="Elisabeth Gauba School staff showcase"
              className={`slide-img ${idx === slideIndex ? "active" : ""}`}
            />
          ))}
          
          <div className="slider-overlay">
            <h4>Life at Elisabeth Gauba School</h4>
            <p>Capturing learning, teaching, and shared experiences.</p>
          </div>

          {carousel.length > 1 && (
            <>
              <button className="slide-nav-btn prev" onClick={handlePrevSlide} aria-label="Previous slide">
                <i className="fa fa-chevron-left"></i>
              </button>
              <button className="slide-nav-btn next" onClick={handleNextSlide} aria-label="Next slide">
                <i className="fa fa-chevron-right"></i>
              </button>

              <div className="slide-dots">
                {carousel.map((_, idx) => (
                  <button
                    key={idx}
                    className={`slide-dot ${idx === slideIndex ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideIndex(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container">
        {CATEGORIES.map((cat) => {
          // If counts are zero for a specific category, we don't display it except "All Staff"
          const count = categoryCounts[cat] || 0;
          if (cat !== "All Staff" && count === 0) return null;

          return (
            <button
              key={cat}
              className={`tab-button ${selectedTab === cat ? "active" : ""}`}
              onClick={() => setSelectedTab(cat)}
            >
              {cat}
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Staff lists by Category */}
      {activeSections.length > 0 ? (
        activeSections.map((cat) => {
          const members = grouped[cat] || [];
          const isSupport = cat === "Support Staff";
          
          return (
            <div key={cat} className="section-container">
              <div className="section-header">
                <h3>{cat}</h3>
                <div className="section-header-line"></div>
              </div>

              {isSupport ? (
                <div className="support-grid">
                  {members.map((member) => (
                    <div key={member.id} className="support-card">
                      {member.image && (
                        <img src={member.image} alt={member.name} className="support-avatar" />
                      )}
                      <div>
                        <div className="support-name" title={member.name}>{member.name}</div>
                        <div className="support-tag">{cat}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cards-grid">
                  {members.map((member) => (
                    <div key={member.id} className="staff-card">
                      {member.image && (
                        <div className="staff-avatar-wrapper">
                          <img src={member.image} alt={member.name} className="staff-avatar" />
                        </div>
                      )}
                      <div className="staff-info">
                        <div className="staff-name" title={member.name}>{member.name}</div>
                        {member.role && (
                          <span className="staff-role-badge">
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="empty-state" style={{ marginTop: "20px" }}>
          No staff found for this selection.
        </div>
      )}
    </div>
  );
}
