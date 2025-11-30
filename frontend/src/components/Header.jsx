import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";               // <-- corrected path (from src/components -> src/auth)
import "../styles/header.css";                   // <-- corrected path (from src/components -> src/styles)

export default function Header() {
  const auth = (typeof useAuth === "function") ? useAuth() : null;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const userEmail = auth?.user?.email || localStorage.getItem("pmj_email") || "";
  const role = (auth?.role || localStorage.getItem("pmj_role") || "").toUpperCase();
  const isAdmin = role === "ADMIN";

  function handleLogout() {
    if (auth?.logout) {
      auth.logout();
    } else {
      localStorage.removeItem("pmj_token");
      localStorage.removeItem("pmj_role");
      localStorage.removeItem("pmj_email");
    }
    navigate("/login");
  }

  return (
    <header className="pmj-header" role="banner">
      <div className="pmj-brand-wrap" style={{ display: "flex", alignItems: "center" }}>
        <Link to="/" className="brand" aria-label="PMJ Logistics Solutions">
          PMJ Logistics Solutions
        </Link>
      </div>

      <nav
        className={`pmj-nav ${open ? "open" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/enquiry">Enquiry</Link>
          <Link to="/shipments">Shipments</Link>
        </div>

        <div className="nav-profile">
          {userEmail ? (
            <>
              <span className="muted small" style={{ marginRight: 12 }}>{userEmail}</span>
              {role && <span className="muted small" style={{ marginRight: 12 }}>{role}</span>}
              <button className="btn link-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn link-btn">Login</Link>
              <Link to="/register" className="btn-ghost" style={{ marginLeft: 12 }}>Register</Link>
            </>
          )}
        </div>
      </nav>

      <button
        className="hamburger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d={open
              ? "M18.3 5.71L12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.71 2.88 18.3 9.18 12 2.88 5.71 4.29 4.3 10.59 10.59 16.89 4.3z"
              : "M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"}
          />
        </svg>
      </button>
    </header>
  );
}
