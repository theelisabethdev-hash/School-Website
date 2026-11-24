"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatPhone, has } from "./model";
import s from "./admissions.module.css";

export type Field = readonly [label: string, value: ReactNode | undefined];

const filled = (f: Field) => (typeof f[1] === "string" ? has(f[1]) : !!f[1]);

/** A definition list that drops fields with no value instead of printing "N/A". */
export function Fields({ rows, stack = false }: { rows: Field[]; stack?: boolean }) {
  const shown = rows.filter(filled);
  if (shown.length === 0) return null;
  return (
    <dl className={`${s.dl} ${stack ? s.dlStack : ""}`}>
      {shown.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Hidden entirely when every field is empty. Pass `always` for sections that must stay visible. */
export function Section({
  title,
  rows,
  always = false,
  children,
}: {
  title: string;
  rows?: Field[];
  always?: boolean;
  children?: ReactNode;
}) {
  if (!always && !children && !(rows ?? []).some(filled)) return null;
  return (
    <section className={s.section}>
      <h3 className={s.sectionTitle}>{title}</h3>
      <div className={s.sectionBody}>
        {rows && <Fields rows={rows} />}
        {children}
      </div>
    </section>
  );
}

export function telLink(value?: string) {
  if (!has(value)) return undefined;
  return (
    <a className={s.link} href={`tel:${value.replace(/[^\d+]/g, "")}`}>
      {formatPhone(value)}
    </a>
  );
}

export function mailLink(value?: string) {
  if (!has(value)) return undefined;
  return (
    <a className={s.link} href={`mailto:${value}`}>
      {value}
    </a>
  );
}

export function DocRow({ label, url }: { label: string; url?: string }) {
  return (
    <div className={s.docRow}>
      <span>{label}</span>
      {has(url) ? (
        <a className={`${s.btnLink} ${s.btnSmall}`} href={url} target="_blank" rel="noreferrer" aria-label={`Open ${label}`}>
          Open <i className="fa fa-external-link" aria-hidden="true" />
        </a>
      ) : (
        <span className={s.muted}>Not uploaded</span>
      )}
    </div>
  );
}

export function CopyValue({ value }: { value?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!has(value)) return undefined;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className={s.copyLine}>
      <span>{value}</span>
      <button type="button" className={s.copy} onClick={copy} aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}
