import { type FormUpload, formatPhone, has } from "./model";
import { Pill, Submitted, rowProps } from "./RowParts";
import s from "./admissions.module.css";

type Props = {
  rows: FormUpload[];
  openId: string | null;
  onOpen: (id: string) => void;
};

export function UploadsTable({ rows, openId, onOpen }: Props) {
  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th>Parent</th>
          <th>Contact</th>
          <th>Transaction ID</th>
          <th>Files</th>
          <th>Submitted</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((u) => {
          const files = [u.pdf_doc, u.payement_image, u.document].filter(has).length;
          return (
            <tr key={u.id} {...rowProps(u.id, `Open upload from ${u.per_name}`, u.id === openId, onOpen)}>
              <td className={s.cStudent}>
                <span className={s.strong}>{u.per_name}</span>
              </td>
              <td className={s.cParent}>
                {formatPhone(u.per_mobile)}
                <span className={s.sub}>{u.per_email}</span>
              </td>
              <td className={s.cClass}>{u.trans_id}</td>
              <td className={s.cPay}>
                <Pill ok={has(u.payement_image)}>{has(u.payement_image) ? "Receipt attached" : "No receipt"}</Pill>
                <span className={s.sub}>{files} of 3 files</span>
              </td>
              <td className={`${s.cDate} ${s.nowrap}`}>
                <Submitted record={u} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
