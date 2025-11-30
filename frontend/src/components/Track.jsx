
// src/components/Track.jsx
import React, { useState } from "react";
import * as api from "../api/api";
import "../styles/shipments.css";
import "../styles/track.css"; // <-- correct relative path (was ./styles/track.css)

export default function Track() {
  const [id, setId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function doTrack(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!id) return setError("Please enter a tracking id.");
    try {
      setLoading(true);
      const res = await api.trackShipment(id); // your API wrapper
      setResult(res);
    } catch (err) {
      setError("Not found or server error");
      console.error("track error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card track-card container" style={{ marginTop: 20 }}>
      <h2>Track a Package</h2>

      <form className="form" onSubmit={doTrack} style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
        <input
          placeholder="Enter tracking id"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{ flex: 1, padding: "10px 12px", borderRadius: 10 }}
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: "6px 0" }}>Result</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f7fbff", padding: 12, borderRadius: 8 }}>
            {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
