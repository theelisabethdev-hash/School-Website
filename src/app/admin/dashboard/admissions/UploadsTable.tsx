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
    <table className={`${s.table} ${s.uploads}`}>
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
              <td className={s.uName}>
                <span className={s.strong}>{u.per_name}</span>
              </td>
              <td className={s.uContact}>
                {formatPhone(u.per_mobile)}
                <span className={s.sub}>{u.per_email}</span>
              </td>
              <td className={s.uTxn}>{u.trans_id}</td>
              <td className={s.uFiles}>
                <Pill ok={has(u.payement_image)}>{has(u.payement_image) ? "Receipt attached" : "No receipt"}</Pill>
                <span className={s.sub}>{files} of 3 files</span>
              </td>
              <td className={`${s.uDate} ${s.nowrap}`}>
                <Submitted record={u} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
