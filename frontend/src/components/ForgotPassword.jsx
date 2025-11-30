// src/components/ForgotPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import "../styles/forms.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setStatus({ type: "success", msg: "If that email exists, we sent reset instructions." });
    } catch (err) {
      setStatus({ type: "error", msg: "Unable to send reset. Try again later." });
      console.error(err);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 640, margin: "40px auto" }}>
      <h2>Forgot password</h2>
      <form className="form" onSubmit={submit}>
        <label>
          Enter your account email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="btn" type="submit">Send reset link</button>
      </form>

      {status && (
        <div className={status.type === "error" ? "error" : "status"} style={{ marginTop: 12 }}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
