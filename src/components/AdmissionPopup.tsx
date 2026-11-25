"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen admissions poster shown on the home page during admission
 * season. It covers the page on load and closes with the round × button,
 * a click outside the poster, or Esc. The page doesn't scroll behind it.
 */
export default function AdmissionPopup() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="egs-admission-popup" role="dialog" aria-modal="true" aria-label="Admission Notice" onClick={() => setOpen(false)}>
      <div className="egs-admission-popup__card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="egs-admission-popup__close"
          aria-label="Close"
          autoFocus
          onClick={() => setOpen(false)}
        >
          &times;
        </button>
        <img
          src="/images/admission-2027-28.jpg"
          width={950}
          height={1187}
          alt="Admissions open for 2027-28: Nursery, LKG, UKG and Class I. Forms available offline and online from 1 December 2026."
        />
      </div>

      <style>{`
        .egs-admission-popup {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, 0.75);
        }
        .egs-admission-popup__card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          background: #ffffff;
          line-height: 0;
        }
        .egs-admission-popup img {
          display: block;
          width: auto;
          height: auto;
          max-width: calc(100vw - 32px);
          max-height: calc(100dvh - 32px);
        }
        .egs-admission-popup__close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.6);
          color: #ffffff;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 24px;
          line-height: 34px;
          text-align: center;
          cursor: pointer;
          z-index: 10;
          padding: 0;
          transition: background 0.2s;
        }
        .egs-admission-popup__close:hover {
          background: rgba(0, 0, 0, 0.85);
        }
      `}</style>
    </div>
  );
}
