import {
  type Registration,
  classLabel,
  formatIsoDate,
  formatPhone,
  genderLabel,
  has,
  hasReceipt,
  primaryParent,
} from "./model";
import { Pill, Submitted, rowProps } from "./RowParts";
import s from "./admissions.module.css";

type Props = {
  rows: Registration[];
  currentSession: string;
  openId: string | null;
  onOpen: (id: string) => void;
};

export function RegistrationsTable({ rows, currentSession, openId, onOpen }: Props) {
  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th>Form no.</th>
          <th>Student</th>
          <th>Class</th>
          <th>Parent</th>
          <th>Payment</th>
          <th>Submitted</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const parent = primaryParent(r);
          const gender = genderLabel(r.sex);
          const born = has(r.studdob) ? `born ${formatIsoDate(r.studdob)}` : "";
          const detail = [gender, born].filter(Boolean).join(", ");
          return (
            <tr key={r.id} {...rowProps(r.id, `Open ${r.stud_id ?? "application"}, ${r.student_name}`, r.id === openId, onOpen)}>
              <td className={s.cForm}>
                {has(r.stud_id) ? <span className={s.formNo}>{r.stud_id}</span> : <span className={s.muted}>—</span>}
              </td>
              <td className={s.cStudent}>
                <span className={s.strong}>{r.student_name}</span>
                {detail && <span className={s.sub}>{detail.charAt(0).toUpperCase() + detail.slice(1)}</span>}
              </td>
              <td className={s.cClass}>
                <span className={s.nowrap}>{classLabel(r.reg_class)}</span>
                {r.academic !== currentSession && <span className={s.sub}>{r.academic}</span>}
              </td>
              <td className={s.cParent}>
                {parent.name}
                {has(parent.mobile) && <span className={s.sub}>{formatPhone(parent.mobile)}</span>}
              </td>
              <td className={s.cPay}>
                <Pill ok={hasReceipt(r)}>{hasReceipt(r) ? "Receipt attached" : "No receipt"}</Pill>
              </td>
              <td className={`${s.cDate} ${s.nowrap}`}>
                <Submitted record={r} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
