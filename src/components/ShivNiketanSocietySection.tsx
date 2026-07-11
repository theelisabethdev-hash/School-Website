"use client";

import { useCallback, useEffect, useState } from "react";

export type SocietyCategory = { name: string; images: string[] };
export type SocietyFile = { name: string; url: string; sizeLabel: string };

const BLUE = "#214AB3";
const GOLD = "#f0ad4e";

const FILE_ICONS: Record<string, string> = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  xls: "📊",
  xlsx: "📊",
  ppt: "📑",
  pptx: "📑",
};

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return FILE_ICONS[ext] ?? "📎";
}

/**
 * Shiv Niketan Society section for the Activities page: photos (grouped by
 * category, with a lightbox) and downloadable files, kept separate from the
 * monthly school Activities above it.
 */
export default function ShivNiketanSocietySection({
  categories,
  files,
}: {
  categories: SocietyCategory[];
  files: SocietyFile[];
}) {
  const [openCategory, setOpenCategory] = useState<string | null>(
    categories[0]?.name ?? null
  );
  const [lightbox, setLightbox] = useState<{ images: string[]; title: string; i: number } | null>(
    null
  );

  const isEmpty = categories.length === 0 && files.length === 0;

  return (
    <div style={{ marginTop: "40px" }}>
      <div className="wthree-heading">
        <h2 className="Main_header">Shiv Niketan Society</h2>
      </div>

      {isEmpty && (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          Photos and documents will be added here soon.
        </p>
      )}

      {categories.length > 0 && (
        <div style={{ marginBottom: files.length > 0 ? "30px" : 0 }}>
          {categories.map((cat) => {
            const isOpen = openCategory === cat.name;
            return (
              <div key={cat.name} style={{ marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setOpenCategory(isOpen ? null : cat.name)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: isOpen ? BLUE : "#f5f5f5",
                    color: isOpen ? "#fff" : BLUE,
                    border: `1px solid ${BLUE}`,
                    borderRadius: "6px",
                    padding: "12px 16px",
                    fontSize: "18px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{cat.name}</span>
                  <span style={{ fontSize: "14px" }}>
                    {cat.images.length} photo{cat.images.length === 1 ? "" : "s"}{" "}
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen && (
                  <div className="row" style={{ marginTop: "12px" }}>
                    {cat.images.map((img, i) => (
                      <div className="col-md-3 col-xs-6" key={img} style={{ marginBottom: "15px" }}>
                        <button
                          type="button"
                          onClick={() => setLightbox({ images: cat.images, title: cat.name, i })}
                          style={{ padding: 0, border: "none", background: "none", cursor: "pointer", width: "100%" }}
                          aria-label={`Open ${cat.name} photo ${i + 1}`}
                        >
                          <img
                            src={img}
                            alt={`${cat.name} photo ${i + 1}`}
                            className="img-responsive"
                            style={{ width: "100%", height: "170px", objectFit: "cover" }}
                            loading="lazy"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {files.length > 0 && (
        <div>
          <h3 style={{ color: BLUE, fontSize: "18px", marginBottom: "10px" }}>Documents</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {files.map((f) => (
              <li key={f.url} style={{ marginBottom: "8px" }}>
                <a
                  href={f.url}
                  download
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    border: `1px solid ${GOLD}`,
                    borderLeft: `5px solid ${GOLD}`,
                    borderRadius: "5px",
                    color: "#333",
                    textDecoration: "none",
                    background: "#fff",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{iconFor(f.name)}</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontSize: "13px", color: "#888" }}>{f.sizeLabel}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          title={lightbox.title}
          index={lightbox.i}
          onIndex={(i) => setLightbox((l) => (l ? { ...l, i } : l))}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function Lightbox({
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

  const navBtn: React.CSSProperties = {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "52px",
    height: "52px",
    fontSize: "30px",
    lineHeight: "1",
    cursor: "pointer",
    flexShrink: 0,
  };

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

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          padding: "0 12px 24px",
          minHeight: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button type="button" onClick={prev} aria-label="Previous photo" style={navBtn}>
            ‹
          </button>
        )}
        <img
          src={images[index]}
          alt={`${title} photo ${index + 1}`}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "4px" }}
        />
        {images.length > 1 && (
          <button type="button" onClick={next} aria-label="Next photo" style={navBtn}>
            ›
          </button>
        )}
      </div>
    </div>
  );
}
