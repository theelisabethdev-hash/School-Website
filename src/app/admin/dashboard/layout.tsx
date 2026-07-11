"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
        setLoading(false);
      } else {
        setAuthenticated(false);
        setLoading(false);
        window.location.href = "/admin";
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>
        <h3 className="Main_header">Verifying Administrator Session...</h3>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="container" style={{ minHeight: "60vh", padding: "30px 0" }}>
      {children}
    </div>
  );
}
