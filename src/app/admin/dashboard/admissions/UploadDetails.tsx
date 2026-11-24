import { type FormUpload, formatIsoDateTime, formatDateTime, submittedAt } from "./model";
import { CopyValue, DocRow, Mail, Section, Tel } from "./DetailParts";

export function UploadDetails({ u }: { u: FormUpload }) {
  const at = submittedAt(u);
  return (
    <>
      <Section
        title="Contact"
        rows={[
          ["Email", <Mail key="e" value={u.per_email} />],
          ["Mobile", <Tel key="m" value={u.per_mobile} />],
        ]}
      />
      <Section
        title="Payment"
        rows={[
          ["Transaction ID", <CopyValue key="t" value={u.trans_id} />],
          ["Paid on", formatIsoDateTime(u.per_date_time)],
          ["Submitted", at ? formatDateTime(at) : undefined],
        ]}
      />
      <Section title="Files" always>
        <DocRow label="Registration form (PDF)" url={u.pdf_doc} />
        <DocRow label="Payment receipt" url={u.payement_image} />
        <DocRow label="Supporting document" url={u.document} />
      </Section>
    </>
  );
}
