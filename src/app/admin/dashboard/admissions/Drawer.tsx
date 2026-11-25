"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { printScope } from "./PrintStyles";
import s from "./admissions.module.css";

type Props = {
  heading: string;
  name?: string;
  meta?: string;
  /** Position in the visible list, 1-based. Null when the open record is filtered out. */
  position: { index: number; total: number } | null;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  /** Replaces the browser print of the drawer, e.g. with the filled offline form. */
  onPrint?: () => void;
  printing?: boolean;
  children: ReactNode;
};

const FOCUSABLE = 'a[href], button:not(:disabled), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const typing = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

export function Drawer({ heading, name, meta, position, onPrev, onNext, onClose, onPrint, printing, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const handlers = useRef({ onPrev, onNext, onClose });
  useEffect(() => {
    handlers.current = { onPrev, onNext, onClose };
  });

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      const h = handlers.current;
      if (e.key === "Escape") {
        h.onClose();
        return;
      }
      if (e.key === "Tab" && ref.current) {
        const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
        const first = items[0];
        const last = items[items.length - 1];
        const wrapTo = e.shiftKey && document.activeElement === first ? last : !e.shiftKey && document.activeElement === last ? first : null;
        if (wrapTo) {
          e.preventDefault();
          wrapTo.focus();
        }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      const dir = e.key === "ArrowDown" || e.key === "j" ? h.onNext : e.key === "ArrowUp" || e.key === "k" ? h.onPrev : null;
      if (dir) {
        e.preventDefault();
        dir();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const labelId = "admissions-drawer-title";
  return createPortal(
    <>
      <div className={s.backdrop} onClick={onClose} />
      <div ref={ref} className={s.drawer} role="dialog" aria-modal="true" aria-labelledby={labelId} data-print-region="drawer">
        <div className={s.head}>
          <div className={s.headText}>
            <h2 id={labelId} className={s.headForm}>
              {heading}
            </h2>
            {name && <p className={s.headName}>{name}</p>}
            {meta && <p className={s.headMeta}>{meta}</p>}
          </div>
          <div className={s.headActions}>
            <button type="button" className={`${s.btn} ${s.btnSmall}`} onClick={onPrint ?? (() => printScope("drawer"))} disabled={printing}>
              <i className={`fa ${printing ? "fa-spinner fa-spin" : "fa-print"}`} aria-hidden="true" /> {printing ? "Preparing form…" : "Print application"}
            </button>
            {position && <span className={s.position}>{position.index} of {position.total}</span>}
            <button type="button" className={s.iconBtn} onClick={onPrev} disabled={!position || position.index <= 1} aria-label="Previous registration" title="Previous (Up arrow or k)">
              <i className="fa fa-chevron-up" aria-hidden="true" />
            </button>
            <button type="button" className={s.iconBtn} onClick={onNext} disabled={!position || position.index >= position.total} aria-label="Next registration" title="Next (Down arrow or j)">
              <i className="fa fa-chevron-down" aria-hidden="true" />
            </button>
            <button ref={closeRef} type="button" className={s.iconBtn} onClick={onClose} aria-label="Close" title="Close (Esc)">
              <i className="fa fa-times" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={s.body}>{children}</div>
      </div>
    </>,
    document.body,
  );
}
