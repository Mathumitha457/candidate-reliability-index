import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Welcome back! Logged in successfully.");
      navigate("/");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">
          🔷 Reliabilix
        </h1>
        <p className="login-subtitle">Candidate Reliability Index System</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.4rem", display: "block" }}>Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@reliabilix.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.4rem", display: "block" }}>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
            Demo Accounts for Testing:
            <br />
            <strong>admin@reliabilix.com</strong> / <strong>admin123</strong> (Admin)
            <br />
            <strong>teacher@reliabilix.com</strong> / <strong>teacher123</strong> (Teacher)
            <br />
            <strong>hr@reliabilix.com</strong> / <strong>hr123</strong> (HR)
          </p>
        </div>
      </div>
    </div>
  );
}
