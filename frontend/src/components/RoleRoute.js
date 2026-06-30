import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ children, allowedRoles }) {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p>Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", maxWidth: "600px", margin: "4rem auto", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>🚫 Access Denied</h2>
        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
          Your role as <strong>{role ? role.toUpperCase() : "Unknown"}</strong> does not have permission to view or manage resources on this page.
        </p>
        <button onClick={() => window.history.back()} className="btn-small">Go Back</button>
      </div>
    );
  }

  return children;
}
