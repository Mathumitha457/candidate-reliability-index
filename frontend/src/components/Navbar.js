import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaChartLine, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { FiUser, FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          🔷 <span>Reliabilix</span>
        </Link>

        <nav className={`navbar-links ${mobileMenuOpen ? "open" : ""}`}>
          <Link to="/" className={`navbar-link ${isActive("/")}`} onClick={() => setMobileMenuOpen(false)}>
            <FaChartLine /> Dashboard
          </Link>
          <Link to="/candidates" className={`navbar-link ${isActive("/candidates")}`} onClick={() => setMobileMenuOpen(false)}>
            <FaUsers /> Candidates
          </Link>
        </nav>

        <div className="navbar-right">
          <div className="navbar-user-info">
            <span className={`role-badge ${user.role}`}>{user.role}</span>
            <span className="user-display-name">{user.name}</span>
            <div className="role-icon-circle" title={`${user.name} (${user.email})`}>
              <FiUser />
            </div>
          </div>
          
          <button className="btn-logout" onClick={logout} title="Sign Out">
            <FaSignOutAlt /> <span>Logout</span>
          </button>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle navigation menu">
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  );
}
