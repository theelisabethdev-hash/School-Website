"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { API_BASE } from "@/lib/api";

/* ─── helpers ─── */

function getToday() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function yearDiff(dob: string): number {
  // dob is an ISO date string from <input type="date">
  const dt1 = new Date(dob);
  const dt2 = new Date("2026-03-31");
  const diff = (dt2.getTime() - dt1.getTime()) / 1000 / 60 / 60 / 25 / 365.26;
  return parseFloat(diff.toFixed(2));
}

/* ─── tiny shared sub-components ─── */

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="row">{children}</div>;
}

function Col({
  size = 3,
  children,
}: {
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`col-md-${size} col-xs-12`} style={{ marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Label({
  text,
  required,
}: {
  text: string;
  required?: boolean;
}) {
  return (
    <label className="labelfont">
      {text}
      {required && <span className="Redcolor"> *</span>}
    </label>
  );
}

function YesNo({
  name,
  defaultNo = true,
  onChange,
}: {
  name: string;
  defaultNo?: boolean;
  onChange?: (val: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
      <label style={{ fontWeight: "normal", cursor: "pointer" }}>
        <input
          type="radio"
          name={name}
          value="Yes"
          defaultChecked={!defaultNo}
          onChange={() => onChange?.("Yes")}
          style={{ marginRight: 4 }}
        />
        Yes
      </label>
      <label style={{ fontWeight: "normal", cursor: "pointer" }}>
        <input
          type="radio"
          name={name}
          value="No"
          defaultChecked={defaultNo}
          onChange={() => onChange?.("No")}
          style={{ marginRight: 4 }}
        />
        No
      </label>
    </div>
  );
}

function SectionBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset
      className="scheduler-border col-md-12 col-xs-12 left"
      style={{ marginBottom: 24 }}
    >
      <legend className="scheduler-border legendName">
        <label className="labelfont">{title}</label>
      </legend>
      {children}
    </fieldset>
  );
}

/* ─── main component ─── */

type Status = "idle" | "sending" | "sent" | "error";
type Page = "form" | "payment";

export default function RegistrationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [studId, setStudId] = useState<string>("");
  const [page, setPage] = useState<Page>("form");

  // conditional field states
  const [specialNeed, setSpecialNeed] = useState(false);
  const [allergy, setAllergy] = useState(false);
  const [lastSchool, setLastSchool] = useState(false);

  // guardian auto-fill
  const fatherNameRef = useRef<HTMLInputElement>(null);
  const motherNameRef = useRef<HTMLInputElement>(null);
  const studentNameRef = useRef<HTMLInputElement>(null);
  const guardianNameRef = useRef<HTMLInputElement>(null);
  const studentNameUnderRef = useRef<HTMLInputElement>(null);

  // refs for validation
  const formRef = useRef<HTMLFormElement>(null);
  const regClassRef = useRef<HTMLSelectElement>(null);
  const studentNameInputRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const nationalityRef = useRef<HTMLInputElement>(null);
  const fatherNameInputRef = useRef<HTMLInputElement>(null);
  const fatherProfRef = useRef<HTMLInputElement>(null);
  const frAddressRef = useRef<HTMLTextAreaElement>(null);
  const fMobileRef = useRef<HTMLInputElement>(null);
  const fEmailRef = useRef<HTMLInputElement>(null);
  const mNameRef = useRef<HTMLInputElement>(null);
  const childPhotoRef = useRef<HTMLInputElement>(null);
  const childCertRef = useRef<HTMLInputElement>(null);
  const residenceProofRef = useRef<HTMLInputElement>(null);
  const guardianTypeRef = useRef<HTMLInputElement>(null);
  const studentNameUnderInputRef = useRef<HTMLInputElement>(null);

  // today's date
  const today = getToday();

  function guardianAutoFill(val: string) {
    const father = fatherNameRef.current?.value || "";
    const mother = motherNameRef.current?.value || "";
    const student = studentNameRef.current?.value || "";
    if (guardianNameRef.current) {
      guardianNameRef.current.value = val === "Father" ? father : mother;
    }
    if (studentNameUnderRef.current) {
      studentNameUnderRef.current.value = student;
    }
  }

  function validateForm(): boolean {
    const regClass = regClassRef.current?.value || "";
    const studentName = studentNameInputRef.current?.value.trim() || "";
    const dob = dobRef.current?.value || "";
    const nationality = nationalityRef.current?.value.trim() || "";
    const fatherName = fatherNameInputRef.current?.value.trim() || "";
    const fatherProf = fatherProfRef.current?.value.trim() || "";
    const frAddress = frAddressRef.current?.value.trim() || "";
    const fMobile = fMobileRef.current?.value.trim() || "";
    const fEmail = fEmailRef.current?.value.trim() || "";
    const mName = mNameRef.current?.value.trim() || "";
    const childPhoto = childPhotoRef.current?.files?.length || 0;
    const childCert = childCertRef.current?.files?.length || 0;
    const residenceProof = residenceProofRef.current?.files?.length || 0;
    const guardianNameVal = guardianNameRef.current?.value.trim() || "";
    const studentNameUnder = studentNameUnderRef.current?.value.trim() || "";

    // gender
    const genderRadios = document.getElementsByName("sex") as NodeListOf<HTMLInputElement>;
    const genderChecked = Array.from(genderRadios).some((r) => r.checked);

    // category
    const categoryRadios = document.getElementsByName("category") as NodeListOf<HTMLInputElement>;
    const categoryChecked = Array.from(categoryRadios).some((r) => r.checked);

    // guardian type
    const guardianTypeRadios = document.getElementsByName("guardian_type") as NodeListOf<HTMLInputElement>;
    const guardianTypeChecked = Array.from(guardianTypeRadios).some((r) => r.checked);

    if (!regClass) {
      alert("Please select a Registration for Class");
      regClassRef.current?.focus();
      return false;
    }
    if (!studentName) {
      alert("Student name is empty");
      studentNameInputRef.current?.focus();
      return false;
    }
    if (!dob) {
      alert("Date of birth is empty");
      dobRef.current?.focus();
      return false;
    }

    // age validation
    const age = yearDiff(dob);
    const ageRules: Record<string, [number, number]> = {
      Nursery: [3, 4],
      KG: [4, 5],
      CLASS1: [5, 6],
      CLASS2: [6, 7],
      CLASS3: [7, 8],
      CLASS4: [8, 9],
      CLASS5: [9, 10],
    };
    if (ageRules[regClass]) {
      const [min, max] = ageRules[regClass];
      if (age < min || age >= max) {
        alert(`Age must be above ${min} years and below ${max} years for ${regClass}`);
        dobRef.current?.focus();
        return false;
      }
    }

    if (!genderChecked) {
      alert("Please select Gender");
      return false;
    }
    if (!nationality) {
      alert("Nationality is empty");
      nationalityRef.current?.focus();
      return false;
    }
    if (!categoryChecked) {
      alert("Please select Category");
      return false;
    }
    if (!fatherName) {
      alert("Father name is empty");
      fatherNameInputRef.current?.focus();
      return false;
    }
    if (!fatherProf) {
      alert("Father Profession is empty");
      fatherProfRef.current?.focus();
      return false;
    }
    if (!frAddress) {
      alert("Father Residential Address is empty");
      frAddressRef.current?.focus();
      return false;
    }
    if (!fMobile) {
      alert("Father Mobile Number is empty");
      fMobileRef.current?.focus();
      return false;
    }
    if (!fEmail) {
      alert("Father Email ID is empty");
      fEmailRef.current?.focus();
      return false;
    }
    if (!mName) {
      alert("Mother name is empty");
      mNameRef.current?.focus();
      return false;
    }
    if (childPhoto === 0) {
      alert("Child Passport Photo is required");
      childPhotoRef.current?.focus();
      return false;
    }
    if (childCert === 0) {
      alert("Child Birth Certificate is required");
      childCertRef.current?.focus();
      return false;
    }
    if (residenceProof === 0) {
      alert("Residence Proof is required");
      residenceProofRef.current?.focus();
      return false;
    }
    if (!guardianNameVal) {
      alert("Guardian/Parent name in undertaking is empty");
      guardianNameRef.current?.focus();
      return false;
    }
    if (!guardianTypeChecked) {
      alert("Please select Father or Mother in undertaking");
      return false;
    }
    if (!studentNameUnder) {
      alert("Student name in undertaking is empty");
      studentNameUnderRef.current?.focus();
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        body: new FormData(form),
      });
      if (!res.ok) throw new Error("Request failed");
      const json = await res.json();
      setStudId(json.stud_id || "");
      setStatus("sent");
      form.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="alert alert-success" style={{ padding: "30px", textAlign: "center" }}>
        <h2 className="Main_header">Thank you!</h2>
        <p>
          Your registration has been submitted successfully
          {studId && (
            <>
              . Your registration number is <strong>{studId}</strong>
            </>
          )}
          . We will contact you soon.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ─── Instructions ─── */}
      <div className="row" style={{ marginBottom: 16 }}>
        <div className="col-md-10">
          <h4 className="Main_header">Instructions for Filling up the Online form:</h4>
          <p>
            <i className="fa fa-minus fa-1x" aria-hidden="true" /> Please read
            the instructions carefully to avoid rejection of your form.
          </p>
          <p>
            <i className="fa fa-minus fa-1x" aria-hidden="true" />{" "}
            <b>DO NOT</b> press ENTER KEY to move from one field to another. Use
            &ldquo;TAB KEY&rdquo; or mouse control.
          </p>
          <p>
            <i className="fa fa-minus fa-1x" aria-hidden="true" /> After
            completing the registration form, click on{" "}
            <b>&ldquo;Continue For Payment&rdquo;</b> for final registration.
          </p>
          <p>
            <i className="fa fa-minus fa-1x" aria-hidden="true" />{" "}
            <b>DO NOT</b> fill more than one form per applicant.
          </p>
          <p>
            <i className="fa fa-minus fa-1x" aria-hidden="true" /> Incomplete
            forms will not be accepted by the system.
          </p>
        </div>
        <div className="col-md-2" style={{ paddingTop: 20 }}>
          <a href="/form-submission">Already Registered, click here</a>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
        {/* ══════════════════════════ BLOCK 1 ══════════════════════════ */}
        <div id="reg-block1" style={{ display: page === "form" ? "block" : "none" }}>

          {/* ── Registration Details ── */}
          <SectionBox title="Registration Details:">
            <FieldRow>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Registration for Class" required />
                  <select
                    ref={regClassRef}
                    name="reg_class"
                    id="reg_class"
                    className="form-control"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>Select</option>
                    <option value="Nursery">Nursery</option>
                    <option value="KG">KG</option>
                    <option value="CLASS1">CLASS 1</option>
                    <option value="CLASS2">CLASS 2</option>
                    <option value="CLASS3">CLASS 3</option>
                    <option value="CLASS4">CLASS 4</option>
                    <option value="CLASS5">CLASS 5</option>
                  </select>
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Academic Year" required />
                  <input
                    name="academic"
                    type="text"
                    value="2026-2027"
                    readOnly
                    className="form-control"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Registration Date" required />
                  <input
                    name="today_date"
                    type="text"
                    value={today}
                    readOnly
                    className="form-control"
                  />
                </div>
              </Col>
            </FieldRow>
          </SectionBox>

          {/* ── Student Details ── */}
          <SectionBox title="Student's Details:">
            <FieldRow>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Name of the Student" required />
                  <input
                    ref={(el) => {
                      (studentNameInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                      (studentNameRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                    }}
                    name="student_name"
                    id="student_name"
                    type="text"
                    maxLength={90}
                    className="form-control"
                    placeholder="Name of the Student"
                    required
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Date of Birth" required />
                  <input
                    ref={dobRef}
                    name="studdob"
                    id="studdob"
                    type="date"
                    className="form-control"
                    required
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Date of Birth (In words)" />
                  <input
                    name="words_dob"
                    type="text"
                    maxLength={150}
                    className="form-control"
                    placeholder="Date of Birth (In words)"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Sex" required />
                  <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                    <label style={{ fontWeight: "normal", cursor: "pointer" }}>
                      <input type="radio" name="sex" value="Male" defaultChecked style={{ marginRight: 4 }} />
                      Male
                    </label>
                    <label style={{ fontWeight: "normal", cursor: "pointer" }}>
                      <input type="radio" name="sex" value="Female" style={{ marginRight: 4 }} />
                      Female
                    </label>
                  </div>
                </div>
              </Col>
            </FieldRow>

            <FieldRow>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Nationality" required />
                  <input
                    ref={nationalityRef}
                    name="nationality"
                    id="nationality"
                    type="text"
                    maxLength={30}
                    className="form-control"
                    placeholder="Nationality"
                    required
                  />
                </div>
              </Col>

              <Col size={3}>
                <div className="form-group">
                  <Label text="Applying Under Category" required />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 6 }}>
                    {["General", "OBC", "SC", "ST"].map((cat) => (
                      <label key={cat} style={{ fontWeight: "normal", cursor: "pointer" }}>
                        <input type="radio" name="category" value={cat} style={{ marginRight: 4 }} />
                        {cat}
                      </label>
                    ))}
                  </div>
                  <p className="help-block" style={{ fontSize: 11 }}>
                    (In case of OBC / SC / ST, enclose a self-attested certificate)
                  </p>
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Aadhar Card No. of the child" />
                  <input
                    name="adhar_card_no"
                    type="text"
                    maxLength={12}
                    className="form-control"
                    placeholder="Aadhar No"
                  />
                </div>
              </Col>
            </FieldRow>
          </SectionBox>

          {/* ── Father's Details ── */}
          <SectionBox title="Father's Details:">
            <FieldRow>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Father's Name" required />
                  <input
                    ref={(el) => {
                      (fatherNameInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                      (fatherNameRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                    }}
                    name="father_name"
                    id="father_name"
                    type="text"
                    maxLength={150}
                    className="form-control"
                    placeholder="Father Name"
                    required
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Profession" required />
                  <input
                    ref={fatherProfRef}
                    name="father_profession"
                    id="father_profession"
                    type="text"
                    maxLength={50}
                    className="form-control"
                    placeholder="Profession"
                    required
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Is the Job Transferable?" />
                  <YesNo name="job_transfer" />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Designation" />
                  <input
                    name="f_designation"
                    type="text"
                    maxLength={40}
                    className="form-control"
                    placeholder="Designation"
                  />
                </div>
              </Col>
            </FieldRow>

            <FieldRow>
              <Col size={6}>
                <div className="form-group">
                  <Label text="Office Address" />
                  <textarea
                    name="f_address"
                    rows={3}
                    className="form-control"
                    placeholder="Office Address"
                    maxLength={200}
                  />
                </div>
              </Col>
              <Col size={6}>
                <div className="form-group">
                  <Label text="Residential Address" required />
                  <textarea
                    ref={frAddressRef}
                    name="fr_address"
                    rows={3}
                    className="form-control"
                    placeholder="Residential Address"
                    maxLength={200}
                    required
                  />
                </div>
              </Col>
            </FieldRow>

            <FieldRow>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Residential Telephone No" />
                  <input
                    name="f_telephone"
                    type="text"
                    maxLength={12}
                    className="form-control"
                    placeholder="Residential Telephone No"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Office Telephone No" />
                  <input
                    name="fo_number"
                    type="text"
                    maxLength={12}
                    className="form-control"
                    placeholder="Office Telephone No"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Mobile No" required />
                  <input
                    ref={fMobileRef}
                    name="f_mobile_no"
                    id="f_mobile_no"
                    type="tel"
                    maxLength={10}
                    className="form-control"
                    placeholder="Mobile No"
                    required
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Email ID" required />
                  <input
                    ref={fEmailRef}
                    name="f_mail_id"
                    id="f_mail_id"
                    type="email"
                    maxLength={60}
                    className="form-control"
                    placeholder="Email ID"
                    required
                  />
                </div>
              </Col>
            </FieldRow>
          </SectionBox>

          {/* ── Mother's Details ── */}
          <SectionBox title="Mother's Details:">
            <FieldRow>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Mother's Name" required />
                  <input
                    ref={(el) => {
                      (mNameRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                      (motherNameRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                    }}
                    name="m_name"
                    id="m_name"
                    type="text"
                    maxLength={80}
                    className="form-control"
                    placeholder="Mother Name"
                    required
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Profession" />
                  <input
                    name="m_profession"
                    type="text"
                    maxLength={40}
                    className="form-control"
                    placeholder="Profession"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Is the Job Transferable?" />
                  <YesNo name="m_transfer" />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Designation" />
                  <input
                    name="m_designation"
                    type="text"
                    maxLength={50}
                    className="form-control"
                    placeholder="Designation"
                  />
                </div>
              </Col>
            </FieldRow>

            <FieldRow>
              <Col size={6}>
                <div className="form-group">
                  <Label text="Office Address" />
                  <textarea
                    name="mo_address"
                    rows={3}
                    className="form-control"
                    placeholder="Office Address"
                    maxLength={200}
                  />
                </div>
              </Col>
              <Col size={6}>
                <div className="form-group">
                  <Label text="Residential Address" />
                  <textarea
                    name="mr_address"
                    rows={3}
                    className="form-control"
                    placeholder="Residential Address"
                    maxLength={200}
                  />
                </div>
              </Col>
            </FieldRow>

            <FieldRow>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Residential Telephone No" />
                  <input
                    name="m_telephone"
                    type="text"
                    maxLength={12}
                    className="form-control"
                    placeholder="Residential Telephone No"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Office Telephone No" />
                  <input
                    name="mo_telephone"
                    type="text"
                    maxLength={12}
                    className="form-control"
                    placeholder="Office Telephone No"
                  />
                </div>
              </Col>
              <Col size={2}>
                <div className="form-group">
                  <Label text="Mobile No" required />
                  <input
                    name="m_mobile"
                    id="m_mobile"
                    type="tel"
                    maxLength={10}
                    className="form-control"
                    placeholder="Mother Mobile No"
                    required
                  />
                </div>
              </Col>
              <Col size={2}>
                <div className="form-group">
                  <Label text="Email ID" required />
                  <input
                    name="m_email_id"
                    id="m_email_id"
                    type="email"
                    maxLength={100}
                    className="form-control"
                    placeholder="Mother Email ID"
                    required
                  />
                </div>
              </Col>
            </FieldRow>
          </SectionBox>

          {/* ── Guardian's Details ── */}
          <SectionBox title="Guardian's Details:">
            <FieldRow>
              <Col size={2}>
                <div className="form-group">
                  <Label text="Guardian's Name" />
                  <input
                    ref={guardianNameRef}
                    name="g_name"
                    type="text"
                    maxLength={100}
                    className="form-control"
                    placeholder="Guardian Name"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Relation with the child" />
                  <input
                    name="g_relation"
                    type="text"
                    maxLength={50}
                    className="form-control"
                    placeholder="Relation with child"
                  />
                </div>
              </Col>
              <Col size={2}>
                <div className="form-group">
                  <Label text="Profession" />
                  <input
                    name="g_profession"
                    type="text"
                    maxLength={50}
                    className="form-control"
                    placeholder="Profession"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Is the Job Transferable?" />
                  <YesNo name="g_transer" />
                </div>
              </Col>
              <Col size={2}>
                <div className="form-group">
                  <Label text="Designation" />
                  <input
                    name="g_designation"
                    type="text"
                    maxLength={30}
                    className="form-control"
                    placeholder="Designation"
                  />
                </div>
              </Col>
            </FieldRow>

            <FieldRow>
              <Col size={6}>
                <div className="form-group">
                  <Label text="Office Address" />
                  <textarea
                    name="go_address"
                    rows={3}
                    className="form-control"
                    placeholder="Office Address"
                    maxLength={150}
                  />
                </div>
              </Col>
              <Col size={6}>
                <div className="form-group">
                  <Label text="Residential Address" />
                  <textarea
                    name="gr_address"
                    rows={3}
                    className="form-control"
                    placeholder="Residential Address"
                    maxLength={200}
                  />
                </div>
              </Col>
            </FieldRow>

            <FieldRow>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Residential Telephone No" />
                  <input
                    name="g_telephone_no"
                    type="text"
                    maxLength={12}
                    className="form-control"
                    placeholder="Residential Telephone No"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Office Telephone No" />
                  <input
                    name="go_telephone"
                    type="text"
                    maxLength={12}
                    className="form-control"
                    placeholder="Office Telephone No"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Mobile No" />
                  <input
                    name="g_mobile"
                    type="tel"
                    maxLength={10}
                    className="form-control"
                    placeholder="Mobile No"
                  />
                </div>
              </Col>
              <Col size={3}>
                <div className="form-group">
                  <Label text="Email ID" />
                  <input
                    name="g_mail_id"
                    type="email"
                    maxLength={100}
                    className="form-control"
                    placeholder="Email ID"
                  />
                </div>
              </Col>
            </FieldRow>
          </SectionBox>

          {/* ── Other Details ── */}
          <SectionBox title="Other Details:">
            <div className="row">
              <div className="col-md-12">
                <table className="table" style={{ marginBottom: 0 }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        Are you a Single Parent?
                      </td>
                      <td style={{ width: "10%" }}>
                        <YesNo name="single_parent" />
                      </td>
                      <td colSpan={2}>&nbsp;</td>
                    </tr>

                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        Does the child have some special needs?{" "}
                        <em>(If yes, kindly attach Medical Certificate)</em>
                      </td>
                      <td style={{ width: "15%" }}>
                        <YesNo
                          name="special_child"
                          onChange={(v) => setSpecialNeed(v === "Yes")}
                        />
                      </td>
                      <td style={{ width: "1%" }}>&nbsp;</td>
                      <td style={{ width: "34%" }}>
                        <div className="form-group">
                          <input
                            name="special_child_details"
                            type="text"
                            maxLength={100}
                            className="form-control"
                            placeholder="Please specify Details"
                            disabled={!specialNeed}
                          />
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        Is any sibling of the student studying in the school?
                        Please reply only with reference to real sister or
                        brother (Not cousins).{" "}
                        <em>(If yes, kindly give the sibling details.)</em>
                      </td>
                      <td style={{ width: "15%" }}>
                        <YesNo name="sibling" />
                      </td>
                      <td style={{ width: "1%" }}>&nbsp;</td>
                      <td style={{ width: "34%" }}>
                        <div className="form-group">
                          <input
                            name="sibling_name"
                            type="text"
                            maxLength={50}
                            className="form-control"
                            placeholder="Sibling Student Name"
                            style={{ marginBottom: 6 }}
                          />
                          <input
                            name="sibling_section"
                            type="text"
                            maxLength={50}
                            className="form-control"
                            placeholder="Class &amp; Section"
                          />
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        Name and address of last school attended (If applicable){" "}
                        <em>(If yes, kindly give the details.)</em>
                      </td>
                      <td style={{ width: "15%" }}>
                        <YesNo
                          name="last_school"
                          onChange={(v) => setLastSchool(v === "Yes")}
                        />
                      </td>
                      <td style={{ width: "1%" }}>&nbsp;</td>
                      <td style={{ width: "34%" }}>
                        <div className="form-group">
                          <input
                            name="last_school_name"
                            type="text"
                            maxLength={100}
                            className="form-control"
                            placeholder="Last School Name"
                            disabled={!lastSchool}
                            style={{ marginBottom: 6 }}
                          />
                          <input
                            name="last_school_address"
                            type="text"
                            maxLength={200}
                            className="form-control"
                            placeholder="Last School Address"
                            disabled={!lastSchool}
                          />
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        Is either of the parents an Alumni of the school?
                      </td>
                      <td style={{ width: "15%" }}>
                        <YesNo name="alumni" />
                      </td>
                      <td colSpan={2}>&nbsp;</td>
                    </tr>

                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        Is the school transportation required?
                      </td>
                      <td style={{ width: "20%" }}>
                        <YesNo name="sc_transport" />
                      </td>
                      <td colSpan={2}>&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </SectionBox>

          {/* ── Medical History ── */}
          <SectionBox title="Medical History of the child">
            <div className="row">
              <div className="col-md-12">
                <table className="table" style={{ marginBottom: 0 }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        Blood Group
                      </td>
                      <td style={{ width: "20%" }}>
                        <div className="form-group">
                          <input
                            name="blood_group"
                            id="blood_group"
                            type="text"
                            maxLength={20}
                            className="form-control"
                            placeholder="e.g. B+"
                          />
                        </div>
                      </td>
                      <td colSpan={2}>&nbsp;</td>
                    </tr>
                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        General Health
                      </td>
                      <td style={{ width: "20%" }}>
                        <div className="form-group">
                          <input
                            name="health"
                            id="health"
                            type="text"
                            maxLength={100}
                            className="form-control"
                            placeholder="General Health"
                          />
                        </div>
                      </td>
                      <td colSpan={2}>&nbsp;</td>
                    </tr>
                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        Any previous record of illness / disease:{" "}
                        <em>(If yes, kindly attach a medical certificate)</em>
                      </td>
                      <td style={{ width: "20%" }}>
                        <YesNo name="illness" />
                      </td>
                      <td colSpan={2}>&nbsp;</td>
                    </tr>
                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        Is the child on any specific medication?{" "}
                        <em>(If yes, kindly attach a medical certificate)</em>
                      </td>
                      <td style={{ width: "20%" }}>
                        <YesNo name="medication" />
                      </td>
                      <td colSpan={2}>&nbsp;</td>
                    </tr>
                    <tr>
                      <td style={{ width: "50%" }} className="labelfont">
                        Does the child have allergy to any food or medication?
                      </td>
                      <td style={{ width: "15%" }}>
                        <YesNo
                          name="allergy"
                          onChange={(v) => setAllergy(v === "Yes")}
                        />
                      </td>
                      <td style={{ width: "1%" }}>&nbsp;</td>
                      <td style={{ width: "34%" }}>
                        <div className="form-group">
                          <input
                            name="allergy_specify"
                            id="allergy_specify"
                            type="text"
                            maxLength={200}
                            className="form-control"
                            placeholder="Please specify allergy"
                            disabled={!allergy}
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </SectionBox>

          {/* ── Documents ── */}
          <SectionBox title="Documents">
            <div className="row">
              <div className="col-md-12" style={{ padding: "8px 20px" }}>
                <p>
                  Self-attested photocopy of the following documents to be
                  enclosed along with this registration form:
                </p>
                <table className="table" style={{ marginBottom: 0 }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "5%", verticalAlign: "middle" }}>
                        <strong>a)</strong>
                      </td>
                      <td style={{ width: "35%", verticalAlign: "middle" }} className="labelfont">
                        Child Passport Photo <span className="Redcolor">*</span>
                      </td>
                      <td>
                        <input
                          ref={childPhotoRef}
                          name="child_photo"
                          id="child_photo"
                          type="file"
                          accept="image/*"
                          className="form-control"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: "middle" }}>
                        <strong>b)</strong>
                      </td>
                      <td style={{ verticalAlign: "middle" }} className="labelfont">
                        Birth Certificate of the child{" "}
                        <span className="Redcolor">*</span>
                      </td>
                      <td>
                        <input
                          ref={childCertRef}
                          name="child_cert"
                          id="child_cert"
                          type="file"
                          accept="image/*"
                          className="form-control"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: "middle" }}>
                        <strong>c)</strong>
                      </td>
                      <td style={{ verticalAlign: "middle" }} className="labelfont">
                        Residence Proof (Aadhar Card / Voter ID / Polling Card
                        of either parent) <span className="Redcolor">*</span>
                      </td>
                      <td>
                        <input
                          ref={residenceProofRef}
                          name="residence_proof"
                          id="residence_proof"
                          type="file"
                          accept="image/*"
                          className="form-control"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: "middle" }}>
                        <strong>d)</strong>
                      </td>
                      <td style={{ verticalAlign: "middle" }} className="labelfont">
                        Aadhar Card of the Child{" "}
                        <em style={{ fontWeight: "normal" }}>(Not Mandatory)</em>
                      </td>
                      <td>
                        <input
                          name="adhar_card"
                          id="adhar_card"
                          type="file"
                          accept="image/*"
                          className="form-control"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: "middle" }}>
                        <strong>e)</strong>
                      </td>
                      <td style={{ verticalAlign: "middle" }} className="labelfont">
                        Certified copy of school report card of the last
                        academic year (if applicable){" "}
                        <em style={{ fontWeight: "normal" }}>(Not Mandatory)</em>
                      </td>
                      <td>
                        <input
                          name="cert_copy"
                          id="cert_copy"
                          type="file"
                          accept="image/*"
                          className="form-control"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </SectionBox>

          {/* ── Undertaking ── */}
          <SectionBox title="Undertaking">
            <div className="row">
              <div className="col-md-12" style={{ padding: "8px 20px" }}>
                <p>
                  I&nbsp;
                  <input
                    ref={guardianNameRef}
                    name="guardian_name"
                    id="guardian_name"
                    type="text"
                    placeholder="Parent Name"
                    style={{
                      display: "inline-block",
                      width: 200,
                      border: "none",
                      borderBottom: "1px solid #333",
                      outline: "none",
                      background: "transparent",
                    }}
                  />
                  &nbsp;&nbsp;
                  <label style={{ fontWeight: "normal", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="guardian_type"
                      value="Father"
                      onChange={() => guardianAutoFill("Father")}
                      style={{ marginRight: 4 }}
                    />
                    Father
                  </label>
                  &nbsp;&nbsp;
                  <label style={{ fontWeight: "normal", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="guardian_type"
                      value="Mother"
                      onChange={() => guardianAutoFill("Mother")}
                      style={{ marginRight: 4 }}
                    />
                    Mother
                  </label>
                  &nbsp;of&nbsp;
                  <input
                    ref={studentNameUnderRef}
                    name="student_name_under"
                    id="student_name_under"
                    type="text"
                    placeholder="Student Name"
                    style={{
                      display: "inline-block",
                      width: 200,
                      border: "none",
                      borderBottom: "1px solid #333",
                      outline: "none",
                      background: "transparent",
                    }}
                  />
                  &nbsp;hereby declare that the information given by me is
                  correct. Admission of child may be cancelled if any
                  information is found to be false.
                </p>
                <p>
                  <br />
                  Signature Of Parent &nbsp;
                  ..............................
                </p>
                <p>
                  <br />
                  Date &nbsp; ..............................
                </p>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 10 }}
                  onClick={() => {
                    if (validateForm()) {
                      setPage("payment");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                >
                  Continue For Payment
                </button>
              </div>
            </div>
          </SectionBox>
        </div>

        {/* ══════════════════════════ BLOCK 2 – Payment ══════════════════════════ */}
        <div id="reg-block2" style={{ display: page === "payment" ? "block" : "none" }}>
          <SectionBox title="QR Code Payment Section:">
            <div className="row">
              <div className="col-md-12">
                <Col size={12}>
                  <p className="labelfont" style={{ marginBottom: 8 }}>
                    Scan the QR code below and fill in all the payment details:
                  </p>
                </Col>

                <div className="col-md-3">
                  <div className="form-group">
                    <Image
                      src="/images/qr_code.jpeg"
                      alt="Payment QR Code"
                      width={220}
                      height={220}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <Label text="Name" required />
                    <input
                      name="per_name"
                      type="text"
                      className="form-control"
                      placeholder="Name"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <Label text="Email" required />
                    <input
                      name="per_email"
                      type="email"
                      className="form-control"
                      placeholder="Email ID"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <Label text="Mobile Number" required />
                    <input
                      name="per_mobile"
                      type="tel"
                      className="form-control"
                      placeholder="Mobile Number"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <Label text="Payment Screenshot (jpg/png image)" required />
                    <input
                      name="payement_image"
                      type="file"
                      accept="image/*"
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <Label text="Transaction Number" required />
                    <input
                      name="trans_id"
                      type="text"
                      className="form-control"
                      placeholder="Transaction Number"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <Label text="Payment Date &amp; Time" required />
                    <input
                      name="per_date_time"
                      type="text"
                      maxLength={20}
                      className="form-control"
                      placeholder="e.g. 23-07-2026 10:30 AM"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Back & Submit buttons */}
              <div className="col-md-12" style={{ marginTop: 16 }}>
                <div className="col-md-3">
                  <button
                    type="button"
                    className="btn btn-default"
                    style={{ width: "100%" }}
                    onClick={() => {
                      setPage("form");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ← Back
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? "Submitting…" : "Submit Registration"}
                  </button>
                </div>
              </div>

              {status === "error" && (
                <div className="col-md-12" style={{ marginTop: 12 }}>
                  <p role="alert" className="text-danger">
                    Submission failed. Please check your details and try again.
                  </p>
                </div>
              )}
            </div>
          </SectionBox>
        </div>
      </form>
    </>
  );
}
