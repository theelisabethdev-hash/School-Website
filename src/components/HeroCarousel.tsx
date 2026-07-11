"use client";

import { useEffect, useState } from "react";

/**
 * Homepage hero slider — reproduces the legacy `fade-carousel` (#bs-carousel,
 * data-interval="4000") that crossfades through the banner images. On the
 * original site the slides are injected from the banners API; here we pass in
 * whatever images are available (API banners when configured, otherwise the
 * local /banner/* set) and crossfade them every 4s just like the live site.
 */
export default function HeroCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(t);
  }, [images.length]);

  const activeIdx = idx >= images.length ? 0 : idx;

  return (
    <div className="hero-carousel-container" style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      {images.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt="The Elisabeth Gauba School"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: i === activeIdx ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        />
      ))}

      {/* Clickable dot indicators — jump straight to any banner. */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "18px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            zIndex: 20,
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIdx}
              onClick={() => setIdx(i)}
              style={{
                width: i === activeIdx ? "26px" : "12px",
                height: "12px",
                padding: 0,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                background: i === activeIdx ? "#FFB232" : "rgba(255,255,255,0.6)",
                boxShadow: "0 0 3px rgba(0,0,0,0.4)",
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        .hero-carousel-container {
          height: 70vh;
        }
        @media (max-width: 768px) {
          .hero-carousel-container {
            height: 45vh;
          }
        }
        @media (max-width: 480px) {
          .hero-carousel-container {
            height: 30vh;
          }
        }
      `}</style>
    </div>
  );
}
