
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api/api";
import '../styles/forms.css';


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);
  const nav = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await api.register(name.trim(), email.trim(), password);
      // If backend returns immediate token, optionally log them in:
      if (res?.token) {
        localStorage.setItem("pmj_token", res.token);
        localStorage.setItem("pmj_email", res.email || email.trim());
        localStorage.setItem("pmj_role", res.role || "USER");
        nav("/"); // or nav("/login") if you prefer verify step
        return;
      }
      setOk("Registered successfully. Please login.");
      // If backend doesn't return token, forward to login:
      setTimeout(() => nav("/login"), 1400);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Registration failed");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 640, margin: "24px auto" }}>
      <h2>Register</h2>

      <form onSubmit={handleRegister} className="form">
        <label>
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>

        <button className="btn">Create account</button>
      </form>

      {ok && <div className="status" style={{ marginTop: 12 }}>{ok}</div>}
      {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
    </div>
  );
}
