import React, { useState,useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import "../styles/header.css";

export default function Header() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  

  useEffect(() => {
  if (open) {
    document.body.classList.add("pmj-nav-open");
  } else {
    document.body.classList.remove("pmj-nav-open");
  }

  return () => {
    document.body.classList.remove("pmj-nav-open");
  };
}, [open]);

// Close mobile nav when route changes (footer links, header links, anything)
useEffect(() => {
  setOpen(false);
  window.scrollTo({ top: 0, behavior: "instant" });
}, [location.pathname]);

  const userEmail =
    auth?.user?.email || localStorage.getItem("pmj_email") || "";

  const role =
    (auth?.role || localStorage.getItem("pmj_role") || "").toUpperCase();

  // eslint-disable-next-line no-unused-vars
  const isAdmin = role === "ADMIN";

  function handleLogout() {
    try {
      auth?.logout?.();
    } catch (e) {}
    localStorage.removeItem("pmj_token");
    localStorage.removeItem("pmj_role");
    localStorage.removeItem("pmj_email");
    navigate("/login");
  }

  return (
    <header className="pmj-header" role="banner">
      <div className="pmj-brand-wrap">
        <Link to="/" className="brand">
          PMJ Logistics Solutions
        </Link>
      </div>

      <nav className={`pmj-nav ${open ? "open" : ""}`} role="navigation">
        <div className="nav-links" aria-hidden={!open}>
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/enquiry" onClick={() => setOpen(false)}>Enquiry</Link>
          <Link to="/shipments" onClick={() => setOpen(false)}>Shipments</Link>
        </div>

        <div className="nav-profile">
          {userEmail ? (
            <>
              <span className="muted small">{userEmail}</span>
              {role && <span className="muted small">{role}</span>}
              <button className="btn link-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn link-btn">Login</Link>
              <Link to="/register" className="btn-ghost">Register</Link>
            </>
          )}
        </div>
      </nav>

      <button
        className="hamburger"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d={
              open
                ? "M18.3 5.71L12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.71 2.88 18.3 9.18 12 2.88 5.71 4.29 4.3 10.59 10.59 16.89 4.3z"
                : "M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"
            }
          />
        </svg>
      </button>
    </header>
  );
}
