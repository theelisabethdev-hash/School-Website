"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/api";

export default function NoticesAccordion({ notices }: { notices: NewsItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="notices-accordion-wrap">
      {notices.map((n, idx) => {
        const isOpen = openId === n.id;
        return (
          <div
            key={n.id}
            className={`notice-card${isOpen ? " notice-card--open" : ""}`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* ── Header row (always visible) ── */}
            <button
              className="notice-header"
              onClick={() => toggle(n.id)}
              aria-expanded={isOpen}
              aria-controls={`notice-body-${n.id}`}
              id={`notice-btn-${n.id}`}
            >
              {/* left: index badge + title */}
              <span className="notice-left">
                <span className="notice-index">{String(idx + 1).padStart(2, "0")}</span>
                <span className="notice-title">{n.title || "Notice"}</span>
              </span>

              {/* right: date + chevron */}
              <span className="notice-right">
                {n.doe1 && (
                  <span className="notice-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {n.doe1}
                  </span>
                )}
                <span className={`notice-chevron${isOpen ? " notice-chevron--up" : ""}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
              </span>
            </button>

            {/* ── Collapsible body ── */}
            <div
              id={`notice-body-${n.id}`}
              role="region"
              aria-labelledby={`notice-btn-${n.id}`}
              className={`notice-body${isOpen ? " notice-body--open" : ""}`}
            >
              <div className="notice-body-inner">
                {n.full_content ? (
                  <div
                    className="notice-content"
                    dangerouslySetInnerHTML={{ __html: n.full_content }}
                  />
                ) : (
                  <p className="notice-no-desc">No description available.</p>
                )}

                {n.image && (
                  <a
                    href={n.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="notice-download-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download / View Document
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        /* ── Wrapper ── */
        .notices-accordion-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 8px 0 32px;
          max-width: 860px;
          margin: 0 auto;
        }

        /* ── Card ── */
        @keyframes noticeSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .notice-card {
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
          animation: noticeSlideIn 0.4s ease both;
        }
        .notice-card:hover {
          box-shadow: 0 6px 20px rgba(30,80,160,0.10);
          border-color: #b0c4e8;
        }
        .notice-card--open {
          border-color: #2563eb;
          box-shadow: 0 6px 24px rgba(37,99,235,0.14);
        }

        /* ── Header button ── */
        .notice-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 20px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s ease;
        }
        .notice-header:hover {
          background: #f0f5ff;
        }
        .notice-card--open .notice-header {
          background: linear-gradient(90deg, #eff6ff 0%, #f8faff 100%);
          border-bottom: 1.5px solid #dbeafe;
        }

        /* left side */
        .notice-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }
        .notice-index {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          box-shadow: 0 2px 6px rgba(37,99,235,0.30);
        }
        .notice-title {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        .notice-card--open .notice-title {
          color: #2563eb;
        }

        /* right side */
        .notice-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .notice-date {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 500;
          color: #64748b;
          white-space: nowrap;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          background: #f1f5f9;
          border-radius: 20px;
          padding: 4px 10px;
        }
        .notice-chevron {
          color: #94a3b8;
          display: flex;
          align-items: center;
          transition: transform 0.3s cubic-bezier(.4,0,.2,1), color 0.2s;
          transform: rotate(0deg);
        }
        .notice-chevron--up {
          transform: rotate(180deg);
          color: #2563eb;
        }

        /* ── Collapsible body ── */
        .notice-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.35s cubic-bezier(.4,0,.2,1);
        }
        .notice-body--open {
          grid-template-rows: 1fr;
        }
        .notice-body-inner {
          overflow: hidden;
          padding: 0 20px;
          transition: padding 0.35s ease;
        }
        .notice-body--open .notice-body-inner {
          padding: 18px 20px 20px;
        }

        /* ── Content inside body ── */
        .notice-content {
          font-size: 14.5px;
          line-height: 1.75;
          color: #374151;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        .notice-content p { margin: 0 0 10px; }
        .notice-content ul, .notice-content ol { padding-left: 20px; margin: 8px 0; }
        .notice-content a { color: #2563eb; text-decoration: underline; }

        .notice-no-desc {
          font-size: 14px;
          color: #94a3b8;
          font-style: italic;
          margin: 0;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        /* ── Download button ── */
        .notice-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 14px;
          padding: 9px 18px;
          border-radius: 8px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #fff !important;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none !important;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .notice-download-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .notice-header { padding: 13px 14px; }
          .notice-title  { font-size: 13.5px; }
          .notice-date   { display: none; }
          .notice-index  { width: 30px; height: 30px; font-size: 11px; }
          .notice-body--open .notice-body-inner { padding: 14px; }
        }
      `}</style>
    </div>
  );
}
