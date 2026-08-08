import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiBookOpen, FiBriefcase, FiShield } from "react-icons/fi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleCardSelect = (role, demoEmail, demoPassword) => {
    setActiveRole(role);
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.success(`Demo credentials filled for: ${role.toUpperCase()}`, { id: "role-select" });
  };

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
        <h1 className="login-title">🔷 Reliabilix</h1>
        <p className="login-subtitle">Candidate Reliability Index Portal</p>

        <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", display: "block", textAlign: "center" }}>
          Select Login Role
        </label>
        
        <div className="login-role-cards-container">
          <div
            className={`login-role-card teacher-card ${activeRole === "teacher" ? "active" : ""}`}
            onClick={() => handleRoleCardSelect("teacher", "teacher@reliabilix.com", "teacher123")}
          >
            <FiBookOpen className="role-icon" />
            <h4>Teacher</h4>
          </div>

          <div
            className={`login-role-card hr-card ${activeRole === "hr" ? "active" : ""}`}
            onClick={() => handleRoleCardSelect("hr", "hr@reliabilix.com", "hr123")}
          >
            <FiBriefcase className="role-icon" />
            <h4>HR User</h4>
          </div>

          <div
            className={`login-role-card admin-card ${activeRole === "admin" ? "active" : ""}`}
            onClick={() => handleRoleCardSelect("admin", "admin@reliabilix.com", "admin123")}
          >
            <FiShield className="role-icon" />
            <h4>Admin</h4>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.4rem", display: "block" }}>
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setActiveRole(null); // Reset highlighted card if manually editing
              }}
              placeholder="e.g. admin@reliabilix.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.4rem", display: "block" }}>
              Password
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setActiveRole(null);
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
