"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { exportToCSV } from "@/lib/export";
import {
  type FormUpload,
  type LoadState,
  type Registration,
  type SortKey,
  type Tab,
  DEFAULT_SORT,
  SORTS,
  classLabel,
  compareClassKeys,
  currentSession,
  isSortKey,
  matchesRegistration,
  matchesUpload,
} from "./model";
import { registrationRows, uploadRows } from "./exportRows";
import { Drawer } from "./Drawer";
import { PrintStyles, printScope } from "./PrintStyles";
import { RegistrationDetails } from "./RegistrationDetails";
import { RegistrationsTable } from "./RegistrationsTable";
import { UploadDetails } from "./UploadDetails";
import { UploadsTable } from "./UploadsTable";
import { Notice, Skeleton } from "./TableState";
import s from "./admissions.module.css";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

async function fetchAll(): Promise<LoadState> {
  const token = await auth.currentUser?.getIdToken();
  const headers = { Authorization: `Bearer ${token}` };
  const [reg, sub] = await Promise.all([
    fetch(`${API_BASE}/admin/registrations`, { headers }),
    fetch(`${API_BASE}/admin/submissions`, { headers }),
  ]);
  if (!reg.ok || !sub.ok) throw new Error(`Admissions API returned ${reg.status} and ${sub.status}`);
  const [registrations, uploads] = await Promise.all([reg.json(), sub.json()]);
  return {
    status: "ready",
    registrations: Array.isArray(registrations) ? registrations : [],
    uploads: Array.isArray(uploads) ? uploads : [],
  };
}

function useAdmissions() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const run = useRef(0);
  const fetchInto = useCallback(() => {
    const id = ++run.current;
    fetchAll().then(
      (next) => id === run.current && setState(next),
      (err) => {
        console.error("Failed to load admissions data", err);
        if (id === run.current) setState({ status: "error" });
      },
    );
  }, []);
  useEffect(fetchInto, [fetchInto]);
  const reload = useCallback(() => {
    setState({ status: "loading" });
    fetchInto();
  }, [fetchInto]);
  return [state, reload] as const;
}

function AdmissionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [state, reload] = useAdmissions();

  const tab: Tab = params.get("tab") === "uploads" ? "uploads" : "online";
  const urlQuery = params.get("q") ?? "";
  const cls = params.get("class") ?? "";
  const openId = params.get("open");
  const sortParam = params.get("sort");
  const sortKey: SortKey = isSortKey(sortParam) && (tab === "online" || SORTS.find((x) => x.key === sortParam)?.compareUpload) ? sortParam : DEFAULT_SORT;

  // The input keeps its own copy so typing never waits on the router.
  const [query, setQuery] = useState(urlQuery);

  // Query strings sent to router.replace that useSearchParams has not shown yet.
  // window.location lags these, so update() builds on the newest one instead.
  const inflight = useRef<string[]>([]);
  const paramsKey = params.toString();
  useEffect(() => {
    const i = inflight.current.indexOf(paramsKey);
    if (i >= 0) {
      inflight.current = inflight.current.slice(i + 1);
      return;
    }
    // Not one of ours (back/forward): the URL wins.
    inflight.current = [];
    setQuery(new URLSearchParams(paramsKey).get("q") ?? "");
  }, [paramsKey]);

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(inflight.current.at(-1) ?? window.location.search);
      const before = next.toString();
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      const qs = next.toString();
      if (qs === before) return;
      inflight.current.push(qs);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const ready = state.status === "ready";
  const registrations = useMemo<Registration[]>(() => (state.status === "ready" ? state.registrations : []), [state]);
  const uploads = useMemo<FormUpload[]>(() => (state.status === "ready" ? state.uploads : []), [state]);

  const searched = useMemo(() => registrations.filter((r) => matchesRegistration(r, query)), [registrations, query]);
  const classCounts = useMemo(() => {
    const keys = [...new Set(registrations.map((r) => r.reg_class))].sort(compareClassKeys);
    return keys.map((key) => ({ key, count: searched.filter((r) => r.reg_class === key).length }));
  }, [registrations, searched]);

  const visibleRegs = useMemo(() => {
    const compare = SORTS.find((x) => x.key === sortKey)!.compare;
    return searched.filter((r) => !cls || r.reg_class === cls).sort(compare);
  }, [searched, cls, sortKey]);
  const visibleUploads = useMemo(() => {
    const compare = SORTS.find((x) => x.key === sortKey)!.compareUpload ?? SORTS[0].compareUpload!;
    return uploads.filter((u) => matchesUpload(u, query)).sort(compare);
  }, [uploads, query, sortKey]);

  const online = tab === "online";
  const visible = online ? visibleRegs : visibleUploads;
  const total = online ? registrations.length : uploads.length;
  const session = currentSession(registrations);

  const ids = visible.map((x) => x.id);
  const openIndex = openId ? ids.indexOf(openId) : -1;
  const openReg = online && openId ? registrations.find((x) => x.id === openId) : undefined;
  const openUpload = !online && openId ? uploads.find((x) => x.id === openId) : undefined;

  const openRow = (id: string) => update({ open: id });
  const closeDrawer = () => {
    update({ open: null });
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(openId ?? "")}"]`)?.focus());
  };
  const step = (delta: number) => {
    const id = ids[openIndex + delta];
    if (id) update({ open: id });
  };

  const setTab = (next: Tab) => update({ tab: next === "uploads" ? "uploads" : null, class: null, open: null });
  const onQuery = (value: string) => {
    setQuery(value);
    update({ q: value.trim() ? value : null });
  };
  const clearAll = () => {
    setQuery("");
    update({ q: null, class: null });
  };

  const exportCsv = () =>
    online ? exportToCSV(registrationRows(visibleRegs), "online_registrations") : exportToCSV(uploadRows(visibleUploads), "uploaded_registration_forms");

  const noun = online ? "registrations" : "uploaded forms";
  const sorts = SORTS.filter((x) => online || x.compareUpload);

  let content;
  if (state.status === "loading") content = <Skeleton />;
  else if (state.status === "error")
    content = <Notice text="Couldn't load registrations. Check your connection and try again." action="Try again" onAction={reload} />;
  else if (total === 0)
    content = (
      <Notice
        text={online ? "No online registrations yet. New registrations appear here as parents submit the form." : "No uploaded forms yet. Forms that parents upload appear here."}
      />
    );
  else if (visible.length === 0)
    content = (
      <Notice
        title={query.trim() ? `No ${noun} match "${query.trim()}".` : `No ${noun} in ${classLabel(cls)}.`}
        text="Try a different spelling, a phone number, or another class."
        action="Clear search and filters"
        onAction={clearAll}
      />
    );
  else
    content = online ? (
      <RegistrationsTable rows={visibleRegs} currentSession={session} openId={openId} onOpen={openRow} />
    ) : (
      <UploadsTable rows={visibleUploads} openId={openId} onOpen={openRow} />
    );

  const position = openIndex >= 0 ? { index: openIndex + 1, total: visible.length } : null;
  const drawerCommon = { position, onPrev: () => step(-1), onNext: () => step(1), onClose: closeDrawer };

  return (
    <div className={s.page}>
      <PrintStyles />

      <div className={`${s.header} ${s.noPrint}`}>
        <div>
          <h2 className="Main_header">Admissions</h2>
          <p className={s.lead}>{session ? `Registrations for ${session} and uploaded forms.` : "Online registrations and uploaded forms."}</p>
        </div>
        <div className={s.actions}>
          <button type="button" className={s.btn} onClick={exportCsv} disabled={!ready || visible.length === 0}>
            <i className="fa fa-download" aria-hidden="true" /> Export {visible.length} {visible.length === 1 ? "row" : "rows"}
          </button>
          <button type="button" className={s.btn} onClick={() => printScope("list")} disabled={!ready || visible.length === 0}>
            <i className="fa fa-print" aria-hidden="true" /> Print list
          </button>
        </div>
      </div>

      <div className={`${s.tabs} ${s.noPrint}`} role="group" aria-label="Admission records">
        {(["online", "uploads"] as const).map((t) => (
          <button key={t} type="button" className={`${s.tab} ${tab === t ? s.tabActive : ""}`} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t === "online" ? "Online registrations" : "Form uploads"}
            {ready && <span className={s.tabCount}>{t === "online" ? registrations.length : uploads.length}</span>}
          </button>
        ))}
      </div>

      <div className={`${s.toolbar} ${s.noPrint}`}>
        <div className={s.toolbarRow}>
          <div className={s.search}>
            <i className={`fa fa-search ${s.searchIcon}`} aria-hidden="true" />
            <input
              className={s.input}
              type="text"
              value={query}
              placeholder={online ? "Search form no., name, phone or email" : "Search parent, phone or transaction ID"}
              aria-label="Search"
              onChange={(e) => onQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && query && onQuery("")}
            />
            {query && (
              <button type="button" className={s.clear} aria-label="Clear search" onClick={() => onQuery("")}>
                <i className="fa fa-times" aria-hidden="true" />
              </button>
            )}
          </div>
          <label className={s.sort}>
            Sort
            <select className={s.select} value={sortKey} onChange={(e) => update({ sort: e.target.value === DEFAULT_SORT ? null : e.target.value })}>
              {sorts.map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={s.toolbarRow}>
          {online && ready ? (
            <div className={s.chips} role="group" aria-label="Filter by class">
              <Chip label="All" count={searched.length} active={!cls} onClick={() => update({ class: null })} />
              {classCounts.map(({ key, count }) => (
                <Chip key={key} label={classLabel(key)} count={count} active={cls === key} onClick={() => update({ class: key })} />
              ))}
            </div>
          ) : (
            <span />
          )}
          {ready && (
            <span className={s.showing} aria-live="polite">
              Showing {visible.length} of {total}
            </span>
          )}
        </div>
      </div>

      <div className={s.shell} data-print-region="list">
        <h3 className={s.printTitle}>
          {online ? "Online registrations" : "Form uploads"}, {visible.length} of {total}
          {cls ? `, ${classLabel(cls)}` : ""}
          {query.trim() ? `, matching "${query.trim()}"` : ""}
        </h3>
        {content}
      </div>

      {openReg && (
        <Drawer {...drawerCommon} heading={openReg.stud_id || "No form number"} name={openReg.student_name} meta={`${classLabel(openReg.reg_class)}, ${openReg.academic}`}>
          <RegistrationDetails r={openReg} />
        </Drawer>
      )}
      {openUpload && (
        <Drawer {...drawerCommon} heading={openUpload.per_name} meta="Uploaded registration form">
          <UploadDetails u={openUpload} />
        </Drawer>
      )}
    </div>
  );
}

function Chip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`${s.chip} ${active ? s.chipActive : ""}`} aria-pressed={active} onClick={onClick}>
      {label}
      <span className={s.chipCount}>{count}</span>
    </button>
  );
}

export default function AdmissionsManagerPage() {
  return (
    <Suspense fallback={null}>
      <AdmissionsPage />
    </Suspense>
  );
}
