import { type Registration, formatIsoDate, formatIsoDateTime, genderLabel, has } from "./model";
import { CopyValue, DocRow, Fields, Mail, Section, Tel, type Field } from "./DetailParts";
import s from "./admissions.module.css";

const join = (...parts: (string | undefined)[]) => parts.filter(has).join(", ");

export function RegistrationDetails({ r }: { r: Registration }) {
  const d = r.documents ?? {};
  const dob = has(r.studdob) ? `${formatIsoDate(r.studdob)}${has(r.words_dob) ? ` (${r.words_dob})` : ""}` : "";

  const child: Field[] = [
    ["Date of birth", dob],
    ["Gender", genderLabel(r.sex)],
    ["Nationality", r.nationality],
    ["Category", r.category],
    ["Aadhaar", r.adhar_card_no],
    ["Blood group", r.blood_group],
  ];
  const father: Field[] = [
    ["Name", r.father_name],
    ["Profession", join(r.father_profession, r.f_designation)],
    ["Mobile", <Tel key="m" value={r.f_mobile_no} />],
    ["Telephone", <Tel key="t" value={r.f_telephone} />],
    ["Email", <Mail key="e" value={r.f_mail_id} />],
    ["Office address", r.f_address],
    ["Residence", r.fr_address],
  ];
  const mother: Field[] = [
    ["Name", r.m_name],
    ["Profession", join(r.m_profession, r.m_designation)],
    ["Mobile", <Tel key="m" value={r.m_mobile} />],
    ["Email", <Mail key="e" value={r.m_email_id} />],
    ["Mother tongue", r.mo_tongue],
    ["Office address", r.mo_address],
    ["Residence", r.mr_address],
  ];
  const guardian: Field[] = [
    ["Name", r.g_name],
    ["Relation", r.g_relation],
    ["Profession", r.g_profession],
    ["Mobile", <Tel key="m" value={r.g_mobile} />],
    ["Email", <Mail key="e" value={r.g_mail_id} />],
    ["Address", r.go_address],
  ];
  const family: Field[] = [
    ["Single parent", r.single_parent],
    ["Special child", r.special_child],
    ["Special child details", r.special_child_details],
    ["Sibling in school", r.sibling],
    ["Sibling", join(r.sibling_name, r.sibling_section)],
  ];
  const school: Field[] = [
    ["Attended school before", r.last_school],
    ["Last school", join(r.last_school_name, r.last_school_address)],
    ["Needs school transport", r.sc_transport],
    ["Alumni family", r.alumni],
    ["Health", r.health],
    ["Illness", r.illness],
    ["Medication", r.medication],
    ["Allergy", r.allergy],
    ["Allergy details", r.allergy_specify],
  ];
  const payment: Field[] = [
    ["Payer name", r.per_name],
    ["Payer email", <Mail key="e" value={r.per_email} />],
    ["Payer mobile", <Tel key="m" value={r.per_mobile} />],
    ["Transaction ID", <CopyValue key="t" value={r.trans_id} />],
    ["Paid on", formatIsoDateTime(r.per_date_time)],
  ];

  return (
    <>
      <Section title="Child" always>
        <div className={s.childRow}>
          {d.child_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={s.photo} src={d.child_photo} alt={`Photo of ${r.student_name}`} />
          ) : (
            <div className={`${s.photo} ${s.photoNone}`} aria-hidden="true">
              <i className="fa fa-user" />
            </div>
          )}
          <Fields rows={child} />
        </div>
      </Section>

      <Section title="Parents" always>
        <div className={s.cols2}>
          <div>
            <h4 className={s.colTitle}>Father</h4>
            <Fields rows={father} stack />
          </div>
          <div>
            <h4 className={s.colTitle}>Mother</h4>
            <Fields rows={mother} stack />
          </div>
        </div>
      </Section>

      {has(r.g_name) && <Section title="Guardian" rows={guardian} />}
      <Section title="Family" rows={family} />
      <Section title="Previous school and health" rows={school} />
      <Section title="Payment" rows={payment} />

      <Section title="Documents" always>
        <DocRow label="Photo" url={d.child_photo} />
        <DocRow label="Birth certificate" url={d.child_cert} />
        <DocRow label="Residence proof" url={d.residence_proof} />
        <DocRow label="Payment receipt" url={d.payement_image} />
        <DocRow label="Aadhaar" url={d.adhar_card} />
        <DocRow label="Last school report card" url={d.cert_copy} />
      </Section>
    </>
  );
}
