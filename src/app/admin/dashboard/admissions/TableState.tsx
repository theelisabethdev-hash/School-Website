import s from "./admissions.module.css";

export function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className={s.skelRow}>
          {Array.from({ length: 6 }, (_, j) => (
            <div key={j} className={s.skelBar} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Notice({
  title,
  text,
  action,
  onAction,
}: {
  title?: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className={s.notice} role="status">
      {title && <p className={s.noticeTitle}>{title}</p>}
      <p className={s.noticeText}>{text}</p>
      {action && (
        <button type="button" className={s.btn} onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
