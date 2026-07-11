import { useCallback, useEffect } from "react";

export default function Lightbox({
  images,
  title,
  index,
  onIndex,
  onClose,
}: {
  images: string[];
  title: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const prev = useCallback(
    () => onIndex((index - 1 + images.length) % images.length),
    [index, images.length, onIndex]
  );
  const next = useCallback(
    () => onIndex((index + 1) % images.length),
    [index, images.length, onIndex]
  );

  // Arrow keys navigate; Escape closes. Also lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [prev, next, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        zIndex: 100000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header: title + counter + close */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          color: "#fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: "15px", fontWeight: 600 }}>
          {title} — {index + 1}/{images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{ background: "none", border: "none", color: "#fff", fontSize: "34px", cursor: "pointer", lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* Body: prev | image | next */}
      <div
        className="lightbox-body"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "0 12px 24px",
          minHeight: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button type="button" onClick={prev} aria-label="Previous photo" className="lightbox-nav-btn lightbox-nav-btn--prev">
            ‹
          </button>
        )}
        <img
          src={images[index]}
          alt={`${title} photo ${index + 1}`}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "4px", zIndex: 1 }}
        />
        {images.length > 1 && (
          <button type="button" onClick={next} aria-label="Next photo" className="lightbox-nav-btn lightbox-nav-btn--next">
            ›
          </button>
        )}
      </div>

      <style>{`
        .lightbox-nav-btn {
          background: rgba(255,255,255,0.15);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 52px;
          height: 52px;
          font-size: 30px;
          line-height: 1;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          z-index: 10;
        }
        .lightbox-nav-btn:hover {
          background: rgba(255,255,255,0.3);
        }
        @media (max-width: 768px) {
          .lightbox-nav-btn {
            position: absolute;
            width: 44px;
            height: 44px;
            font-size: 24px;
            background: rgba(0,0,0,0.5);
          }
          .lightbox-nav-btn--prev {
            left: 15px;
          }
          .lightbox-nav-btn--next {
            right: 15px;
          }
        }
      `}</style>
    </div>
  );
}
