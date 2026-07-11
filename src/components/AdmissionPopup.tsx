"use client";

import { useState } from "react";

/**
 * Bottom-right admission popup — a faithful reproduction of the legacy
 * `#onload` Bootstrap modal from index.html. It appears on page load,
 * floats in the bottom-right corner with no backdrop, and stays visible
 * until the visitor closes it with the round × button (no auto-dismiss).
 */
export default function AdmissionPopup() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="egs-admission-popup" role="dialog" aria-label="Admission Notice">
      <button
        type="button"
        className="egs-admission-popup__close"
        aria-label="Close"
        onClick={() => setOpen(false)}
      >
        &times;
      </button>
      <img src="/images/admission.jpeg" alt="Admission Notice" />

      <style>{`
        .egs-admission-popup {
          position: fixed;
          bottom: 20px;
          right: 20px;
          left: auto;
          top: auto;
          width: 350px;
          max-width: calc(100% - 40px);
          height: auto;
          margin: 0;
          padding: 0;
          z-index: 99999;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: #ffffff;
        }
        .egs-admission-popup img {
          width: 100%;
          height: auto;
          display: block;
        }
        .egs-admission-popup__close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.6);
          color: #ffffff;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          font-size: 20px;
          line-height: 28px;
          text-align: center;
          cursor: pointer;
          z-index: 10;
          padding: 0;
          transition: background 0.2s;
        }
        .egs-admission-popup__close:hover {
          background: rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
}
