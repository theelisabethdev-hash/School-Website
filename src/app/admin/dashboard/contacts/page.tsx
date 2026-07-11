"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  subject?: string;
  message: string;
  read: boolean;
  timestamp?: { seconds: number };
};

function formatDate(ts?: { seconds: number }) {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactsAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchMessages() {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      setMessages(await res.json());
    } catch (err) {
      console.error("Failed to fetch contact messages:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function markRead(id: string) {
    setActionLoading(id + "_read");
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${API_BASE}/admin/contacts/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m))
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setActionLoading(id + "_delete");
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${API_BASE}/admin/contacts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setActionLoading(null);
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <h3 className="Main_header">Loading Messages...</h3>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="row" style={{ marginBottom: "24px" }}>
        <div className="col-md-12">
          <h2
            className="Main_header"
            style={{
              fontSize: "26px",
              borderBottom: "2px solid #214AB3",
              paddingBottom: "10px",
            }}
          >
            Contact Messages
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: "12px",
                  background: "#e74c3c",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "2px 10px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p style={{ color: "#555", marginTop: "8px" }}>
            Messages submitted via the &ldquo;Leave a Message&rdquo; form on the homepage and Contact Us page.
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#888",
            border: "1px dashed #ccc",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontSize: "18px" }}>No messages yet.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover" style={{ fontSize: "14px" }}>
            <thead style={{ background: "#214AB3", color: "#fff" }}>
              <tr>
                <th style={{ width: "20px" }}>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Subject</th>
                <th>Received</th>
                <th style={{ width: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, idx) => (
                <>
                  <tr
                    key={msg.id}
                    style={{
                      background: msg.read ? "#fff" : "#fffbe6",
                      cursor: "pointer",
                      fontWeight: msg.read ? "normal" : "bold",
                    }}
                    onClick={() =>
                      setExpanded(expanded === msg.id ? null : msg.id)
                    }
                  >
                    <td>{idx + 1}</td>
                    <td>
                      {!msg.read && (
                        <span
                          style={{
                            display: "inline-block",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#e74c3c",
                            marginRight: "6px",
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                      {msg.name}
                    </td>
                    <td>
                      <a href={`mailto:${msg.email}`} onClick={(e) => e.stopPropagation()}>
                        {msg.email}
                      </a>
                    </td>
                    <td>{msg.mobile || "—"}</td>
                    <td>{msg.subject || "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(msg.timestamp)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {!msg.read && (
                        <button
                          className="btn btn-xs btn-default"
                          style={{ marginRight: "6px", fontSize: "12px" }}
                          disabled={actionLoading === msg.id + "_read"}
                          onClick={() => markRead(msg.id)}
                        >
                          {actionLoading === msg.id + "_read" ? "..." : "Mark Read"}
                        </button>
                      )}
                      <button
                        className="btn btn-xs btn-danger"
                        style={{ fontSize: "12px" }}
                        disabled={actionLoading === msg.id + "_delete"}
                        onClick={() => deleteMessage(msg.id)}
                      >
                        {actionLoading === msg.id + "_delete" ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded message row */}
                  {expanded === msg.id && (
                    <tr key={msg.id + "_exp"} style={{ background: "#f0f4ff" }}>
                      <td colSpan={7} style={{ padding: "16px 24px" }}>
                        <strong>Message:</strong>
                        <p
                          style={{
                            marginTop: "8px",
                            whiteSpace: "pre-wrap",
                            background: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            padding: "12px",
                            fontWeight: "normal",
                          }}
                        >
                          {msg.message}
                        </p>
                        {!msg.read && (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ background: "#214AB3", marginTop: "4px" }}
                            onClick={() => markRead(msg.id)}
                          >
                            Mark as Read
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
