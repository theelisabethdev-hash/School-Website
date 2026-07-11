"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <fieldset className="LeaveMessage">
      <form onSubmit={handleSubmit} className="myforms" noValidate>
        <div className="form-group">
          <input name="name" required placeholder="Name" className="form-control" autoComplete="name" />
        </div>
        <div className="form-group">
          <input name="mobile" type="tel" placeholder="Phone No" className="form-control" autoComplete="tel" />
        </div>
        <div className="form-group">
          <input name="email" type="email" required placeholder="Email ID" className="form-control" autoComplete="email" />
        </div>
        <div className="form-group">
          <input name="subject" placeholder="Subject" className="form-control" />
        </div>
        <div className="form-group">
          <textarea name="message" rows={4} required placeholder="Message" className="form-control" />
        </div>
        <button type="submit" disabled={status === "sending"} className="btn btn-primary">
          {status === "sending" ? "Sending…" : "Send Message"}
        </button>

        {status === "sent" && (
          <p role="status" className="text-success" style={{ marginTop: "10px" }}>
            Thank you! Your message has been sent — we will get back to you soon.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-danger" style={{ marginTop: "10px" }}>
            Sorry, the message could not be sent. Please try again, or email us directly.
          </p>
        )}
      </form>
    </fieldset>
  );
}
