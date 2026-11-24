import { type FormUpload, formatIsoDateTime, formatDateTime, has, submittedAt } from "./model";
import { CopyValue, DocRow, Section, mailLink, telLink } from "./DetailParts";

export function UploadDetails({ u }: { u: FormUpload }) {
  const at = submittedAt(u);
  return (
    <>
      <Section
        title="Contact"
        rows={[
          ["Email", mailLink(u.per_email)],
          ["Mobile", telLink(u.per_mobile)],
        ]}
      />
      <Section
        title="Payment"
        rows={[
          ["Transaction ID", has(u.trans_id) ? <CopyValue value={u.trans_id} /> : undefined],
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
