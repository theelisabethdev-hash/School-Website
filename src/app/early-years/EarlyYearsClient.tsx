"use client";

import { useState, useEffect } from "react";
import Lightbox from "@/components/Lightbox";

const profileImages = [
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/profile-img-1.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/profile-img-2.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/profile-img-3.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/profile-img-4.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/profile-img-5.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/profile-img-6.jpeg",
];

const galleryImages = [
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-1.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-2.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-3.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-4.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-5.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-6.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-7.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-8.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-9.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-10.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-11.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-12.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-13.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-14.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-15.jpeg",
  "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/early-years/gallery/gallery-16.jpeg",
];

const activitiesLeft = [
  "Music Time",
  "Fun Dance",
  "Montessori Modules",
  "Indoor and Outdoor Play",
  "Motor Skill Development Activities",
];

const activitiesRight = [
  "Story-telling & Role-play",
  "Circle Time Activities",
  "Art and Craft",
  "Festival Celebrations",
  "Thematic Integrated Learning",
];

export default function EarlyYearsClient() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightbox, setLightbox] = useState<{ images: string[]; title: string; i: number } | null>(null);

  // Auto-play the profile slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % profileImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + profileImages.length) % profileImages.length);
  };

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % profileImages.length);
  };

  return (
    <div className="ey-page-container">
      <style dangerouslySetInnerHTML={{ __html: `
        /* ---- Early Years Page Custom Styles ---- */
        .ey-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px 60px;
          font-family: 'Lato', 'Roboto', sans-serif;
          color: #2d3748;
        }

        /* Introduction Layout */
        .ey-intro-section {
          display: flex;
          gap: 40px;
          align-items: center;
          margin-bottom: 50px;
        }

        .ey-intro-text {
          flex: 1.2;
        }

        .ey-intro-text p {
          font-size: 16px;
          line-height: 1.7;
          color: #4a5568;
          margin-bottom: 20px;
        }

        .ey-intro-slideshow {
          flex: 0.8;
          min-width: 300px;
          max-width: 420px;
        }

        /* Dynamic Slideshow */
        .ey-slideshow-container {
          position: relative;
          width: 100%;
          padding-bottom: 130%; /* Designed for portrait profile-img ratios */
          height: 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          background: #f7fafc;
          border: 1px solid rgba(0,0,0,0.04);
        }

        .ey-slide-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
          transform: scale(1.02);
        }

        .ey-slide-img.active {
          opacity: 1;
          transform: scale(1);
        }

        .ey-slide-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.85);
          color: #214AB3;
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
          z-index: 10;
          font-size: 16px;
        }

        .ey-slide-btn:hover {
          background: #214AB3;
          color: white;
        }

        .ey-slide-btn.prev { left: 12px; }
        .ey-slide-btn.next { right: 12px; }

        .ey-slide-dots {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .ey-slide-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.55);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .ey-slide-dot.active {
          background: #ffffff;
          width: 18px;
          border-radius: 4px;
        }

        /* Activity Grid/List */
        .ey-activities-title {
          font-size: 22px;
          font-weight: 700;
          color: #214AB3;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 8px;
        }

        .ey-activities-title::after {
          content: '';
          display: block;
          width: 40px;
          height: 3px;
          background: #e67e22;
          margin-top: 6px;
          border-radius: 2px;
        }

        .ey-activities-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 30px;
        }

        .ey-activity-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          color: #2d3748;
        }

        .ey-activity-icon {
          color: #e67e22;
          font-size: 16px;
          flex-shrink: 0;
        }

        /* Call To Action Box */
        .ey-cta-card {
          background: linear-gradient(135deg, #214AB3 0%, #173683 100%);
          border-radius: 16px;
          padding: 30px 40px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: justify;
          gap: 20px;
          margin-bottom: 60px;
          box-shadow: 0 10px 30px rgba(33, 74, 179, 0.2);
        }

        .ey-cta-text h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .ey-cta-text p {
          font-size: 14px;
          margin: 0;
          opacity: 0.9;
          line-height: 1.5;
        }

        .ey-cta-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .ey-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none !important;
          transition: all 0.25s ease;
          border: none;
          cursor: pointer;
        }

        .ey-btn-primary {
          background: #ffffff;
          color: #214AB3;
        }

        .ey-btn-primary:hover {
          background: #eef2ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255,255,255,0.25);
        }

        .ey-btn-outline {
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.6);
        }

        .ey-btn-outline:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: white;
          transform: translateY(-2px);
        }

        /* Photo Gallery Section */
        .ey-gallery-section {
          border-top: 1px solid rgba(0,0,0,0.08);
          padding-top: 40px;
        }

        .ey-gallery-title {
          font-size: 28px;
          font-weight: 700;
          color: #214AB3;
          text-align: center;
          margin-bottom: 10px;
        }

        .ey-gallery-subtitle {
          font-size: 16px;
          color: #718096;
          text-align: center;
          margin-bottom: 35px;
        }

        .ey-gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .ey-gallery-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 4/3;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          cursor: pointer;
          border: 1px solid rgba(0,0,0,0.03);
          background: #eee;
        }

        .ey-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ey-gallery-card:hover .ey-gallery-img {
          transform: scale(1.08);
        }

        .ey-gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(33, 74, 179, 0.6);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ey-gallery-card:hover .ey-gallery-overlay {
          opacity: 1;
        }

        .ey-gallery-icon {
          color: white;
          font-size: 24px;
          transform: translateY(15px);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ey-gallery-card:hover .ey-gallery-icon {
          transform: translateY(0);
        }

        /* Responsive Breakpoints */
        @media (max-width: 991px) {
          .ey-intro-section {
            flex-direction: column-reverse;
            gap: 30px;
          }
          
          .ey-intro-slideshow {
            width: 100%;
            max-width: 100%;
          }

          .ey-gallery-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }

          .ey-cta-card {
            flex-direction: column;
            text-align: center;
            padding: 24px;
          }

          .ey-cta-actions {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 640px) {
          .ey-gallery-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .ey-activities-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .ey-page-container {
            padding: 20px 15px;
          }
        }
      `}} />

      {/* Intro Section */}
      <div className="ey-intro-section">
        <div className="ey-intro-text">
          <p>
            Elisabeth Gauba’s Preparatory School was founded by Mrs. Elisabeth Gauba in 1938. 
            Carrying forward her legacy, the preschool offers fun activities for our young students 
            from age 2+ years onwards. It works as a good support system for our parents and 
            siblings of existing students besides benefitting the young parent community at large.
          </p>

          <h3 className="ey-activities-title">Nurturing Learning & Play</h3>
          <div className="ey-activities-grid">
            <div>
              {activitiesLeft.map((act, index) => (
                <div key={index} className="ey-activity-item" style={{ marginBottom: "12px" }}>
                  <span className="ey-activity-icon"><i className="fa fa-check-circle"></i></span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
            <div>
              {activitiesRight.map((act, index) => (
                <div key={index} className="ey-activity-item" style={{ marginBottom: "12px" }}>
                  <span className="ey-activity-icon"><i className="fa fa-check-circle"></i></span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          <p>
            We celebrate all festivals with great enthusiasm! Our specially designed, thematic 
            integrated curriculum empowers children to develop physically, emotionally, 
            intellectually, and socially. Our unique ‘Shiv Niketan’ method ensures a sound
            foundation for our young buds in a safe, secure and fun environment.
          </p>
        </div>

        {/* Carousel Slideshow */}
        <div className="ey-intro-slideshow">
          <div className="ey-slideshow-container">
            {profileImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Preschool life image ${idx + 1}`}
                className={`ey-slide-img ${idx === slideIndex ? "active" : ""}`}
              />
            ))}

            <button className="ey-slide-btn prev" onClick={handlePrevSlide} aria-label="Previous slide">
              <i className="fa fa-chevron-left"></i>
            </button>
            <button className="ey-slide-btn next" onClick={handleNextSlide} aria-label="Next slide">
              <i className="fa fa-chevron-right"></i>
            </button>

            <div className="ey-slide-dots">
              {profileImages.map((_, idx) => (
                <button
                  key={idx}
                  className={`ey-slide-dot ${idx === slideIndex ? "active" : ""}`}
                  onClick={() => setSlideIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="ey-cta-card">
        <div className="ey-cta-text">
          <h3>Admissions & Inquiries</h3>
          <p>
            Enrolling children from 2+ years onwards for Playgroup and Pre-Nursery. For queries, please call: 011-23367633, 011-41646990, +91-8800541280.
          </p>
        </div>
        <div className="ey-cta-actions">
          <a href="/registration" className="ey-btn ey-btn-primary">Register Online</a>
          <a href="/contact" className="ey-btn ey-btn-outline">Contact Us</a>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="ey-gallery-section">
        <h2 className="ey-gallery-title">Preschool Photo Gallery</h2>
        <p className="ey-gallery-subtitle">A glimpse into the daily activities and fun learning moments of our kids</p>

        <div className="ey-gallery-grid">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className="ey-gallery-card"
              onClick={() => setLightbox({ images: galleryImages, title: "Early Years Gallery", i })}
            >
              <img
                src={img}
                alt={`Early Years gallery photo ${i + 1}`}
                className="ey-gallery-img"
                loading="lazy"
              />
              <div className="ey-gallery-overlay">
                <div className="ey-gallery-icon">
                  <i className="fa fa-arrows-alt"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          title={lightbox.title}
          index={lightbox.i}
          onIndex={(i) => setLightbox((l) => (l ? { ...l, i } : null))}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
