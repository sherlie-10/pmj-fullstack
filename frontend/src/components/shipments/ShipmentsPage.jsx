// src/components/shipments/ShipmentsPage.jsx
import React, { useEffect, useState } from "react";
import * as api from "../../api/api";
import "../../styles/shipments.css";
import { useAuth } from "../../auth";

export default function ShipmentsPage() {
  const auth = useAuth();
  const isAdmin = (auth?.role || localStorage.getItem("pmj_role")) === "ADMIN";

  const [shipments, setShipments] = useState([]);         // all shipments (admin)
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("cards");              // "cards" | "table"
  const [tracking, setTracking] = useState("");           // input value
  const [results, setResults] = useState([]);             // results from tracking (for public & admin)
  const [modalShipment, setModalShipment] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Admin still loads full list for management
        const res = await api.getShipments();
        if (!mounted) return;
        setShipments(res || []);
      } catch (err) {
        console.error("Failed to load shipments from server", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // format updated timestamp for display (short)
  function formatUpdated(dateStr) {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  }

  // When user clicks Track or presses enter
  async function handleTrack(e) {
    if (e && e.key === "Enter") e.preventDefault();
    const q = tracking?.trim();
    if (!q) {
      // clear results if input cleared
      setResults([]);
      return;
    }

    // prefer backend track endpoint if available
    if (typeof api.trackShipment === "function") {
      try {
        const r = await api.trackShipment(q);
        // backend may return single object or array
        if (!r) setResults([]);
        else setResults(Array.isArray(r) ? r : [r]);
      } catch (err) {
        console.error("Track error (api.trackShipment)", err);
        setResults([]);
      }
      return;
    }

    // fallback: simple client-side filter against loaded shipments
    const found = shipments.filter(s => {
      const tid = (s.trackingId || s.trackingNo || "").toLowerCase();
      return tid.includes(q.toLowerCase());
    });
    setResults(found);
  }

  function clearTrack() {
    setTracking("");
    setResults([]);
  }

  function openView(s) {
    setModalShipment(s);
  }

  function closeView() {
    setModalShipment(null);
  }

  function handleEdit(s) {
    // placeholder — hook into your routing or edit modal
    console.log("Edit requested for", s?.id ?? s?.trackingId);
    // Example: navigate(`/shipments/${s.id}/edit`) (if you have router)
  }

  // Helper to render a compact card (used for both admin list and public results)
  function renderCard(s) {
    return (
      <article key={s.id ?? s.trackingId} className="shipment-card">
        <div className="card-header">
          <div>
            <div className="tracking">{s.trackingId || s.trackingNo || "—"}</div>
            <div className="meta">
              <span className={`status ${statusClassFrom(s)}`}>{(s.currentStatus || s.status || "N/A").toUpperCase()}</span>
              <div style={{ width: 8 }} />
              <div className="customer" title={s.receiverName ?? s.senderName ?? ''}>
                {s.receiverName ?? s.senderName ?? s.customerName ?? "Unknown customer"}
              </div>
            </div>
          </div>

          <div className="meta">
            <span className={`pill-blue`} style={{ opacity: 0.95 }}>{/* visual placeholder if needed */}</span>
          </div>
        </div>

        <div className="card-body">
          <div className="route">{s.origin || "Origin"} → {s.destination || "Destination"}</div>
          <div className="meta-small">{s.weight ? `${s.weight} kg` : ""}</div>
        </div>

        <div className="card-footer">
          <div className="updated">Updated <span className="muted mono">{formatUpdated(s.updatedAt ?? s.createdAt)}</span></div>
          <div className="actions">
            <button className="btn-ghost" onClick={() => openView(s)}>View</button>
            {isAdmin && <button className="btn-primary" onClick={() => handleEdit(s)}>Edit</button>}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="container shipments-page" style={{ paddingTop: 8 }}>
      <section className="shipments-topbar">
        <div className="left">
          <h2 className="shipments-title">Shipments</h2>
          <div className="muted shipments-sub">Manage and track shipments — cards for mobile, table for power users.</div>

          <div className="tracking-widget compact" style={{ marginTop: 12 }}>
            <input
              placeholder="Enter tracking id"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              onKeyDown={handleTrack}
              aria-label="Enter tracking id"
            />
            <button className="btn track-btn" onClick={handleTrack}>Track</button>
            <button className="btn-ghost" onClick={clearTrack} style={{ marginLeft: 8 }}>Clear</button>
            <div className="ship-count" style={{ marginLeft: 12 }}>{loading ? "Loading…" : `${shipments.length} shipments`}</div>
          </div>
        </div>

        <div className="shipments-actions-row">
          {/* admin-only view controls */}
          {isAdmin && (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="segmented" role="tablist" aria-label="View selector">
                <button className={view === "cards" ? "seg-active" : ""} onClick={() => setView("cards")}>Cards</button>
                <button className={view === "table" ? "seg-active" : ""} onClick={() => setView("table")}>Table</button>
              </div>
              <button className="btn-create">+ Create</button>
            </div>
          )}
        </div>
      </section>

      <section className="content-area" style={{ marginTop: 8 }}>
        {/* PUBLIC USER: show only tracking results, not the whole grid */}
        {!isAdmin ? (
          <>
            {results.length === 0 ? (
              <div className="shipments-empty" style={{ padding: 24 }}>
                Enter a tracking id and click <strong>Track</strong> to view shipment details.
              </div>
            ) : (
              <div className="card-grid" style={{ marginTop: 12 }}>
                {results.map(renderCard)}
              </div>
            )}
          </>
        ) : (
          /* ADMIN: full management UI (cards OR table) */
          <>
            {view === "table" ? (
              <div className="shipments-table">
                <div className="shipment-table-wrapper">
                  <table className="shipment-table" cellPadding={0} cellSpacing={0}>
                    <thead>
                      <tr>
                        <th>Tracking</th>
                        <th>Route</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Updated</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map(s => (
                        <tr key={s.id ?? s.trackingId}>
                          <td className="mono">{s.trackingId || "—"}</td>
                          <td>{(s.origin || "Origin") + " → " + (s.destination || "Destination")}</td>
                          <td>{s.receiverName ?? s.senderName ?? s.customerName ?? "Unknown customer"}</td>
                          <td><span className={`status ${statusClassFrom(s)}`}>{(s.currentStatus || s.status || "N/A").toUpperCase()}</span></td>
                          <td className="muted mono">{formatUpdated(s.updatedAt)}</td>
                          <td className="actions-col">
                            <button className="btn-ghost" onClick={() => openView(s)}>View</button>
                            <button className="btn-primary" onClick={() => handleEdit(s)}>Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card-grid" style={{ marginTop: 18 }}>
                {shipments.map(renderCard)}
              </div>
            )}
          </>
        )}
      </section>

      {/* modal view (shared) */}
      {modalShipment && (
        <div className="modal-backdrop" onClick={closeView}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalShipment.trackingId || modalShipment.trackingNo}</h3>
              <div className="modal-actions">
                <button className="btn-ghost" onClick={closeView}>Close</button>
                {isAdmin && <button className="btn-primary" onClick={() => handleEdit(modalShipment)}>Edit</button>}
              </div>
            </div>

            <div className="modal-body">
              <p><strong>Customer:</strong> {modalShipment.receiverName ?? modalShipment.senderName ?? modalShipment.customerName ?? '—'}</p>
              <p><strong>Route:</strong> {modalShipment.origin ?? '—'} → {modalShipment.destination ?? '—'}</p>
              <p><strong>Status:</strong> {modalShipment.currentStatus ?? modalShipment.status ?? '—'}</p>
              <p><strong>ETA:</strong> {modalShipment.expectedDelivery ? new Date(modalShipment.expectedDelivery).toLocaleString() : '—'}</p>
              <p><strong>Weight:</strong> {modalShipment.weight ?? modalShipment.weightKg ?? '—'} kg</p>
              <pre style={{ marginTop: 12, background: '#f7fbff', padding: 12, borderRadius: 8 }}>
                <span className="mono">Updated: {modalShipment.updatedAt ?? modalShipment.createdAt ?? '—'}</span>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- small helpers ---------- */
function statusClassFrom(s) {
  const status = (s?.currentStatus || s?.status || "").toString().toUpperCase();
  if (!status) return "pill-grey";
  if (status.includes("DELIVERED")) return "pill-green";
  if (status.includes("IN_TRANSIT")) return "pill-yellow";
  if (status.includes("PICKED") || status.includes("PICKED_UP")) return "pill-blue";
  if (status.includes("OUT_FOR")) return "pill-orange";
  if (status.includes("CANCEL")) return "pill-red";
  return "pill-grey";
}
