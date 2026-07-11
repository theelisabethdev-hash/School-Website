"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Redirect if already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = "/admin/dashboard";
      } else {
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>
        <h3 className="Main_header">Loading Admin Panel...</h3>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "60px 0" }}>
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <div 
            style={{ 
              background: "#f9f9f9", 
              border: "1px solid #ddd", 
              padding: "40px 30px", 
              borderRadius: "4px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
            }}
          >
            <h2 className="Main_header" style={{ textAlign: "center", marginBottom: "30px", fontSize: "24px" }}>
              Administrator Login
            </h2>
            
            {error && (
              <div className="alert alert-danger" style={{ padding: "12px", marginBottom: "20px" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="myforms">
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="control-label" style={{ fontWeight: "bold" }}>
                  Email Address <span style={{ color: "#c0392b" }}>*</span>
                </label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  placeholder="admin@school.com"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "25px" }}>
                <label className="control-label" style={{ fontWeight: "bold" }}>
                  Password <span style={{ color: "#c0392b" }}>*</span>
                </label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                style={{ height: "45px", fontSize: "16px", fontWeight: "bold" }}
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Login to Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
