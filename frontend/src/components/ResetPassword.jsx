// src/components/ResetPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/forms.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    try {
      await axios.post("/api/auth/reset-password", { token, password });
      setStatus({ type: "success", msg: "Password reset. Redirecting to login…" });
      setTimeout(() => navigate("/login"), 1600);
    } catch (err) {
      setStatus({ type: "error", msg: err?.response?.data?.message || "Reset failed" });
      console.error(err);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 640, margin: "40px auto" }}>
      <h2>Reset password</h2>
      <form className="form" onSubmit={submit}>
        <label>
          New password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        <button className="btn" type="submit">Save</button>
      </form>

      {status && (
        <div className={status.type === "error" ? "error" : "status"} style={{ marginTop: 12 }}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
