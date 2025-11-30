import React from 'react';
import '../../styles/shipments.css';

export default function ShipmentDetailDrawer({ shipment, onClose, onEdit }) {
  if (!shipment) return null;

  return (
    <div className="drawer-backdrop" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <aside className="drawer">
        <header className="drawer-header">
          <div>
            <h3 id="drawer-title">{shipment.trackingId ?? shipment.trackingNo}</h3>
            <div className="muted small">
              {shipment.origin?.city ?? shipment.origin ?? '—'} → {shipment.destination?.city ?? shipment.destination ?? '—'}
            </div>
          </div>
          <div className="drawer-actions">
            <button className="btn outline" onClick={() => onEdit && onEdit(shipment.id)}>Edit</button>
            <button className="btn ghost" onClick={onClose}>Close</button>
          </div>
        </header>

        <div className="drawer-body">
          <section className="drawer-section">
            <h4>Summary</h4>
            <dl className="summary-grid">
              <div><dt>Sender</dt><dd>{shipment.senderName ?? '—'}</dd></div>
              <div><dt>Receiver</dt><dd>{shipment.receiverName ?? '—'}</dd></div>
              <div><dt>Status</dt><dd>{shipment.currentStatus ?? shipment.status ?? '—'}</dd></div>
              <div><dt>ETA</dt><dd>{shipment.expectedDelivery ?? '—'}</dd></div>
            </dl>
          </section>

          <section className="drawer-section">
            <h4>Timeline</h4>
            <ol className="timeline">
              {(shipment.events || []).length === 0 && <div className="muted">No events yet.</div>}
              {(shipment.events || []).map(ev => (
                <li key={ev.id || ev.time}>
                  <div className="evt-time">{ev.time ? new Date(ev.time).toLocaleString() : '—'}</div>
                  <div className="evt-body">
                    <strong>{ev.code ?? ev.status ?? 'UPDATE'}</strong>
                    <div className="muted small">{ev.location ?? ''} — {ev.meta ?? ''}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="drawer-section">
            <h4>Attachments</h4>
            <div className="attachments">
              {(shipment.attachments || []).length === 0 && <div className="muted small">No attachments.</div>}
              {(shipment.attachments || []).map(a => (
                <a key={a.id ?? a.url} href={a.url} target="_blank" rel="noreferrer" className="attachment">
                  {a.type ?? 'file'}
                </a>
              ))}
            </div>
            <div className="muted tiny">Upload is backend-enabled; this is read-only UI for now.</div>
          </section>

          <section className="drawer-section">
            <h4>Notes</h4>
            <div className="notes">
              {shipment.notes ?? <span className="muted">No notes</span>}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
