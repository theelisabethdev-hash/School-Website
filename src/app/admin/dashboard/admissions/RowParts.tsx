import type { KeyboardEvent, ReactNode } from "react";
import { formatDateTime, formatRelative, submittedAt } from "./model";
import s from "./admissions.module.css";

/** Props that make a whole table row act as one button. */
export function rowProps(id: string, label: string, isOpen: boolean, onOpen: (id: string) => void) {
  return {
    "data-row-id": id,
    tabIndex: 0,
    role: "button",
    "aria-label": label,
    className: `${s.row} ${isOpen ? s.rowOpen : ""}`,
    onClick: () => onOpen(id),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen(id);
      }
    },
  } as const;
}

export function Submitted({ record }: { record: { timestamp?: { _seconds: number }; doe?: string } }) {
  const d = submittedAt(record);
  if (!d) return <span className={s.muted}>—</span>;
  return <span title={formatDateTime(d)}>{formatRelative(d)}</span>;
}

export function Pill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return <span className={`${s.pill} ${ok ? s.pillOk : s.pillWarn}`}>{children}</span>;
}
