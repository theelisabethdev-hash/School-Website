"use client";

import { useState, useEffect } from "react";
import { CoCurricularItem } from "@/lib/api";

type Props = {
  items: CoCurricularItem[];
};

export default function CoCurricularPageClient({ items }: Props) {
  return (
    <div className="cocurricular-container">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Color Palette & Variables */
        :root {
          --primary-color: #214AB3;
          --secondary-color: #1abc9c;
          --text-dark: #2d3748;
          --text-muted: #718096;
          --bg-light: #f7fafc;
          --bg-card: #ffffff;
          --shadow-sm: 0 4px 6px rgba(0,0,0,0.05);
          --shadow-md: 0 10px 20px rgba(0,0,0,0.08);
          --shadow-lg: 0 20px 40px rgba(0,0,0,0.12);
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          --border-radius: 16px;
        }

        .cocurricular-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Lato', 'Roboto', sans-serif;
          color: var(--text-dark);
        }

        /* Hero Header */
        .hero-header {
          text-align: center;
          padding: 20px 0;
          margin-bottom: 40px;
          animation: fadeIn 0.8s ease-out;
        }

        .hero-header h1 {
          font-size: 42px;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 15px;
          position: relative;
          display: inline-block;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .hero-header h1::after {
          content: '';
          display: block;
          width: 60px;
          height: 4px;
          background: var(--secondary-color);
          margin: 10px auto 0;
          border-radius: 2px;
        }

        .hero-header p {
          font-size: 18px;
          color: var(--text-muted);
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Activity Section / Rows */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 60px;
        }

        .activity-row {
          display: flex;
          align-items: center;
          gap: 50px;
          background: var(--bg-card);
          padding: 30px;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(0,0,0,0.03);
          transition: var(--transition);
          animation: slideUp 0.8s ease-out;
        }

        .activity-row:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
          border-color: rgba(33, 74, 179, 0.15);
        }

        .activity-row.reverse {
          flex-direction: row-reverse;
        }

        .activity-info {
          flex: 1.2;
        }

        .activity-media {
          flex: 0.8;
          min-width: 320px;
          max-width: 450px;
        }

        /* Tags */
        .activity-tag {
          display: inline-block;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--secondary-color);
          background: rgba(26, 188, 156, 0.1);
          border-radius: 20px;
          margin-bottom: 15px;
        }

        .activity-title {
          font-size: 26px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 15px;
          line-height: 1.3;
        }

        .activity-content {
          font-size: 15px;
          color: #4a5568;
          line-height: 1.7;
          white-space: pre-line;
        }

        /* Image Slider / Carousel */
        .slider-container {
          position: relative;
          width: 100%;
          padding-bottom: 75%; /* 4:3 Aspect Ratio */
          height: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          background: #eee;
        }

        .slider-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
          transform: scale(1.02);
        }

        .slider-image.active {
          opacity: 1;
          transform: scale(1);
        }

        .slider-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          color: var(--text-dark);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
          transition: var(--transition);
          z-index: 10;
          font-size: 14px;
        }

        .slider-btn:hover {
          background: var(--primary-color);
          color: white;
        }

        .slider-btn.prev {
          left: 12px;
        }

        .slider-btn.next {
          right: 12px;
        }

        .slider-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 10;
        }

        .slider-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: var(--transition);
        }

        .slider-dot.active {
          background: white;
          width: 16px;
          border-radius: 4px;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 991px) {
          .activity-row {
            flex-direction: column !important;
            gap: 25px;
            padding: 20px;
          }
          
          .activity-media {
            width: 100%;
            max-width: 100%;
          }
          
          .hero-header h1 {
            font-size: 32px;
          }
        }
      `}} />




      <div className="activity-list">
        {items.map((item) => (
          <ActivityRow key={item.id} item={item} isEven={true} />
        ))}
      </div>
    </div>
  );
}

function ActivityRow({ item, isEven }: { item: CoCurricularItem; isEven: boolean }) {
  const images = item.images && item.images.length > 0 ? item.images : ["/images/school-logo.jpg"];
  const [slideIndex, setSlideIndex] = useState(0);

  // Auto-play slides every 5 seconds if there are multiple images
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className={`activity-row ${isEven ? "" : "reverse"}`}>
      <div className="activity-info">
        <h3 className="activity-title">{item.title}</h3>
        <p className="activity-content">{item.content}</p>
      </div>

      <div className="activity-media">
        <div className="slider-container">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${item.title} gallery image ${idx + 1}`}
              className={`slider-image ${idx === slideIndex ? "active" : ""}`}
            />
          ))}

          {images.length > 1 && (
            <>
              <button className="slider-btn prev" onClick={handlePrev}>
                <i className="fa fa-chevron-left"></i>
              </button>
              <button className="slider-btn next" onClick={handleNext}>
                <i className="fa fa-chevron-right"></i>
              </button>

              <div className="slider-dots">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`slider-dot ${idx === slideIndex ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideIndex(idx);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
