
import React, { useState } from "react";
import * as api from "../api/api";
import '../styles/forms.css';


export default function EnquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    try {
      await api.createEnquiry({ name, email, phone, message });
      setStatus("Submitted — thank you!");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setStatus("Error: " + (err.response?.data?.error || err.message));
    }
  }

  return (
    <div className="card" style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>Send an Enquiry</h2>
      <form className="form" onSubmit={submit}>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <label>Message<textarea value={message} onChange={(e) => setMessage(e.target.value)} required /></label>
        <button className="btn">Send</button>
      </form>
      {status && <div className="status" style={{ marginTop: 10 }}>{status}</div>}
    </div>
  );
}
