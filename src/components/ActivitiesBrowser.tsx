"use client";

import { useState } from "react";
import Lightbox from "./Lightbox";

export type ActivityData = { title: string; content?: string; images: string[] };
export type MonthData = { name: string; sortKey: number; activities: ActivityData[] };

const BLUE = "#214AB3";
const GOLD = "#f0ad4e";

/**
 * Two-level browser for the Activities page:
 *   Month  ->  click to reveal the activities in that month
 *   Activity title  ->  click to reveal all its photos
 * The most recent month starts open so there is something to see on load.
 *
 * Clicking a photo opens an in-page lightbox (no new tab); the user steps
 * through that activity's photos with the ‹ / › buttons or arrow keys.
 */
export default function ActivitiesBrowser({ months }: { months: MonthData[] }) {
  const [openMonth, setOpenMonth] = useState<string | null>(months[0]?.name ?? null);
  // The set of photos currently open in the lightbox, plus the active index.
  const [lightbox, setLightbox] = useState<{ images: string[]; title: string; i: number } | null>(
    null
  );

  return (
    <div>
      {months.map((m) => {
        const isOpen = openMonth === m.name;
        return (
          <div key={m.name} style={{ marginBottom: "14px" }}>
            <button
              type="button"
              onClick={() => setOpenMonth(isOpen ? null : m.name)}
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
              <span>{m.name}</span>
              <span style={{ fontSize: "14px" }}>{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
              <div style={{ padding: "14px 4px 4px" }}>
                {m.activities.map((a) => (
                  <ActivityItem
                     key={a.title}
                     activity={a}
                     onOpen={(i) => setLightbox({ images: a.images, title: a.title, i })}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

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

function ActivityItem({
  activity,
  onOpen,
}: {
  activity: ActivityData;
  onOpen: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: "12px" }}>
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
          padding: "10px 14px",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>{activity.title}</span>
        <span style={{ fontSize: "13px", color: "#888", whiteSpace: "nowrap" }}>
          {activity.images.length} photo{activity.images.length === 1 ? "" : "s"}{" "}
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "12px 4px 4px" }}>
          {/* Activity description / content */}
          {activity.content && activity.content.trim() && (
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "14px",
                color: "#555",
                fontStyle: "italic",
                lineHeight: 1.6,
                borderLeft: `3px solid ${GOLD}`,
                paddingLeft: "12px",
              }}
            >
              {activity.content}
            </p>
          )}

          {/* Photo grid */}
          <div className="row">
            {activity.images.map((img, i) => (
              <div className="col-md-3 col-xs-6" key={img} style={{ marginBottom: "15px" }}>
                <button
                  type="button"
                  onClick={() => onOpen(i)}
                  style={{ padding: 0, border: "none", background: "none", cursor: "pointer", width: "100%" }}
                  aria-label={`Open ${activity.title} photo ${i + 1}`}
                >
                  <img
                    src={img}
                    alt={`${activity.title} photo ${i + 1}`}
                    className="img-responsive"
                    style={{ width: "100%", height: "170px", objectFit: "cover" }}
                    loading="lazy"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
