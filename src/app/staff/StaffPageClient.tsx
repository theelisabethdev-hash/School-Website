"use client";

import { useState, useEffect } from "react";
import { StaffMember, StaffCarouselImage } from "@/lib/api";

type Props = {
  staff: StaffMember[];
  carousel: StaffCarouselImage[];
};

export default function StaffPageClient({ staff, carousel }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);

  // Autoplay slideshow every 4.5 seconds
  useEffect(() => {
    if (carousel.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % carousel.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [carousel.length]);

  // Helper to filter and sort staff members by title
  const getSortedByTitle = (title: string) => {
    return staff
      .filter((m) => m.title === title)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  };

  const administration = getSortedByTitle("Administration");
  const coordinators = getSortedByTitle("Coordinators");
  const coCurricular = getSortedByTitle("Co-Curricular Teachers");
  const specialEducator = getSortedByTitle("Special Educator");
  const prePrimaryTeachers = getSortedByTitle("Teachers (Pre-Primary)");
  const ivTeachers = getSortedByTitle("Teachers (I-V)");
  const supportStaff = getSortedByTitle("Support Staff");

  const standardTitles = [
    "Administration",
    "Coordinators",
    "Co-Curricular Teachers",
    "Special Educator",
    "Teachers (Pre-Primary)",
    "Teachers (I-V)",
    "Support Staff"
  ];

  // Detect any other custom categories dynamically added via CMS
  const customTitles = Array.from(new Set(staff.map((m) => m.title)))
    .filter((title) => title && !standardTitles.includes(title));

  return (
    <div className="popular-section-wthree" style={{ backgroundColor: "#ffffff", padding: "40px 0" }}>
      <div className="container">
        
        {/* Title */}
        <div className="row" style={{ marginBottom: "30px" }}>
          <div className="col-md-12">
            <h2 className="Main_header">List of Staff</h2>
          </div>
        </div>

        {/* Row 1: Administration & Carousel */}
        <div className="row" style={{ marginBottom: "40px" }}>
          {/* Administration List */}
          <div className="col-md-5">
            <div className="bs-docs-example">
              <h4 className="Main_header" style={{ marginTop: 0 }}>Administration:</h4>
              <table className="table table-hover">
                <tbody>
                  {administration.map((member) => (
                    <tr key={member.id}>
                      <td style={{ width: "20px" }}></td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.name}
                      </td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.role ? `- ${member.role}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Carousel Showcase */}
          <div className="col-md-7">
            {carousel.length > 0 && (
              <div style={{ position: "relative", width: "100%" }}>
                {/* Images Container */}
                <div style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1.36", // matches the aspect ratio of the old website images (e.g. 580x425)
                  overflow: "hidden",
                  borderRadius: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  {carousel.map((slide, idx) => (
                    <img
                      key={slide.id}
                      src={slide.image}
                      alt="Elisabeth Gauba School staff showcase"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: idx === slideIndex ? 1 : 0,
                        transition: "opacity 0.8s ease-in-out"
                      }}
                    />
                  ))}
                </div>

                {/* Orange pagination dots matching owl.theme.css style */}
                {carousel.length > 1 && (
                  <div className="owl-theme">
                    <div className="owl-controls" style={{ marginTop: "15px", textAlign: "center" }}>
                      <div className="owl-pagination" style={{ display: "inline-block" }}>
                        {carousel.map((_, idx) => (
                          <div
                            key={idx}
                            className={`owl-page ${idx === slideIndex ? "active" : ""}`}
                            style={{ display: "inline-block", cursor: "pointer" }}
                            onClick={() => setSlideIndex(idx)}
                          >
                            <span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Coordinators, Co-Curricular Teachers, Special Educator */}
        <div className="row" style={{ marginBottom: "40px" }}>
          {/* Coordinators */}
          <div className="col-md-4">
            <div className="bs-docs-example">
              <h4 className="Main_header">Coordinators:</h4>
              <table className="table table-hover">
                <tbody>
                  {coordinators.map((member) => (
                    <tr key={member.id}>
                      <td style={{ width: "20px" }}></td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.name}
                      </td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.role ? `- ${member.role}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Co-Curricular Teachers */}
          <div className="col-md-4">
            <div className="bs-docs-example">
              <h4 className="Main_header">Co-Curricular Teachers:</h4>
              <table className="table table-hover">
                <tbody>
                  {coCurricular.map((member) => (
                    <tr key={member.id}>
                      <td style={{ width: "20px" }}></td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.name}
                      </td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.role ? `- ${member.role}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Special Educator */}
          <div className="col-md-4">
            <div className="bs-docs-example">
              <h4 className="Main_header">Special Educator:</h4>
              <table className="table table-hover">
                <tbody>
                  {specialEducator.map((member) => (
                    <tr key={member.id}>
                      <td style={{ width: "20px" }}></td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.name}
                      </td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.role ? `- ${member.role}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Row 3: Teachers (Pre-Primary) & Teachers (I-V) & Support Staff */}
        <div className="row">
          {/* Teachers (Pre-Primary) */}
          <div className="col-md-4">
            <div className="bs-docs-example">
              <h4 className="Main_header">Teachers (Pre-Primary):</h4>
              <table className="table table-hover">
                <tbody>
                  {prePrimaryTeachers.map((member) => (
                    <tr key={member.id}>
                      <td style={{ width: "20px" }}></td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.name}
                      </td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.role ? `- ${member.role}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teachers (I-V) */}
          <div className="col-md-4">
            <div className="bs-docs-example">
              <h4 className="Main_header">Teachers (I-V):</h4>
              <table className="table table-hover">
                <tbody>
                  {ivTeachers.map((member) => (
                    <tr key={member.id}>
                      <td style={{ width: "20px" }}></td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.name}
                      </td>
                      <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                        {member.role ? `- ${member.role}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Support Staff */}
          <div className="col-md-4">
            {supportStaff.length > 0 && (
              <div className="bs-docs-example">
                <h4 className="Main_header">Support Staff:</h4>
                <table className="table table-hover">
                  <tbody>
                    {supportStaff.map((member) => (
                      <tr key={member.id}>
                        <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                          {member.name}
                        </td>
                        <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                          {member.role ? `- ${member.role}` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Custom categories dynamically added via CMS */}
        {customTitles.map((title) => {
          const members = getSortedByTitle(title);
          return (
            <div key={title} className="row" style={{ marginTop: "20px" }}>
              <div className="col-md-12">
                <div className="bs-docs-example">
                  <h4 className="Main_header">{title}:</h4>
                  <table className="table table-hover">
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id}>
                          <td style={{ width: "20px" }}></td>
                          <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                            {member.name}
                          </td>
                          <td style={{ padding: "6px 0", color: "#333", fontSize: "15px", border: "none" }}>
                            {member.role ? `- ${member.role}` : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}

        <div className="clearfix"></div>
      </div>
    </div>
  );
}
