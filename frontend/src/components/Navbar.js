import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaChartLine, FaUsers, FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🔷 <span>Reliabilix</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/" className={`navbar-link ${isActive("/")}`}>
            <FaChartLine /> Dashboard
          </Link>
          <Link to="/candidates" className={`navbar-link ${isActive("/candidates")}`}>
            <FaUsers /> Candidates
          </Link>
        </nav>

        <div className="navbar-user">
          <span className={`role-badge ${user.role}`}>{user.role}</span>
          <div className="user-avatar" title={`${user.name} (${user.email})`}>
            {getInitials(user.name)}
          </div>
          <button className="btn-logout" onClick={logout} title="Sign Out">
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
