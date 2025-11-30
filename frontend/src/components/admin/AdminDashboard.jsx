import React from "react";
import '../../styles/adminDashboard.css';


export default function AdminDashboard() {
  return (
    <div className="card" style={{ maxWidth: 1000, margin: "20px auto" }}>
      <h2>Admin Dashboard</h2>

      <p style={{ color: "var(--muted)" }}>
        Welcome Admin! This page is only visible to ADMIN role.
      </p>

      <ul>
        <li>📦 View Shipments</li>
        <li>📨 View All Enquiries</li>
        <li>👤 Manage Admin Users (optional)</li>
        <li>⚙ System Settings (optional)</li>
      </ul>
    </div>
  );
}
