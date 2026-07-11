"use client";

import { useState } from "react";
import Lightbox from "./Lightbox";
import type { GalleryAlbum } from "@/lib/api";

const GOLD = "#f0ad4e";

export default function GalleryBrowser({ albums }: { albums: GalleryAlbum[] }) {
  // Lightbox state
  const [lightbox, setLightbox] = useState<{ images: string[]; title: string; i: number } | null>(
    null
  );

  return (
    <div>
      {albums.map((album) => (
        <AlbumItem
          key={album.id}
          album={album}
          onOpen={(i) =>
            setLightbox({
              images: album.images.map((img) => img.image),
              title: album.title || "Gallery",
              i,
            })
          }
        />
      ))}

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

function AlbumItem({
  album,
  onOpen,
}: {
  album: GalleryAlbum;
  onOpen: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const title = album.title || "Album";

  return (
    <div style={{ marginBottom: "14px" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          textAlign: "left",
          background: "#fff",
          color: "#333",
          border: `1px solid ${GOLD}`,
          borderLeft: `5px solid ${GOLD}`,
          borderRadius: "5px",
          padding: "12px 16px",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: "13px", color: "#888", whiteSpace: "nowrap" }}>
          {album.images.length} photo{album.images.length === 1 ? "" : "s"}{" "}
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="row" style={{ marginTop: "12px" }}>
          {album.images.map((img, i) => (
            <div className="col-md-3 col-xs-6" key={`${img.image}-${i}`} style={{ marginBottom: "15px" }}>
              <button
                type="button"
                onClick={() => onOpen(i)}
                style={{ padding: 0, border: "none", background: "none", cursor: "pointer", width: "100%" }}
                aria-label={`Open ${title} photo ${i + 1}`}
              >
                <img
                  src={img.image}
                  alt={img.name || `${title} photo ${i + 1}`}
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
}
