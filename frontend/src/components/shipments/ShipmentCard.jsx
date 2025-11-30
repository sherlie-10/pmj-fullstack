// src/components/shipments/ShipmentCard.jsx
import React from 'react';
import '../../styles/shipments.css';

const DISPLAY_NAME_MODE = 'receiver';
const CUSTOM_DISPLAY = (s) => `${s.senderName ?? '—'} → ${s.receiverName ?? '—'}`;

export default function ShipmentCard({ shipment, onView, onEdit, onSelect, selected }) {
  if (!shipment) return null;

  const status = shipment.currentStatus ?? shipment.status ?? '';
  const statusClass = statusToClass(status);

  let displayName = '';
  if (DISPLAY_NAME_MODE === 'receiver') displayName = shipment.receiverName ?? '';
  else if (DISPLAY_NAME_MODE === 'sender') displayName = shipment.senderName ?? '';
  else if (DISPLAY_NAME_MODE === 'both') displayName = `${shipment.senderName ?? '—'} / ${shipment.receiverName ?? '—'}`;
  else displayName = CUSTOM_DISPLAY(shipment);

  return (
    <article className={`shipment-card ${selected ? 'selected' : ''}`}>
      <header className="card-header">
        <div>
          <h4 className="tracking">{shipment.trackingId ?? shipment.trackingNo ?? '—'}</h4>

          <div className="meta">
            <span className={`status ${statusClass}`} aria-label={`Status: ${status}`}>
              {String(status).replace(/_/g, ' ')}
            </span>

            {/* NOTE: use .customer so your CSS applies */}
            <div style={{ width: 8 }} />
            <div className="customer" title={displayName || ''}>
              {displayName || 'Unknown customer'}
            </div>
          </div>
        </div>

        <div className="card-actions">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onSelect && onSelect(shipment.id)}
            aria-label={`Select ${shipment.trackingId ?? shipment.trackingNo ?? ''}`}
          />
        </div>
      </header>

      <div className="card-body">
        <p className="route">
          <strong>{shipment.origin?.city ?? shipment.origin ?? '—'}</strong> →{' '}
          <strong>{shipment.destination?.city ?? shipment.destination ?? '—'}</strong>
        </p>

        <p className="small">
          <strong>ETA:</strong> {formatETA(shipment.expectedDelivery)}
        </p>

        <p className="small">
          Weight: {shipment.weightKg ?? '—'} kg • {shipment.service ?? '—'}
        </p>
      </div>

      <footer className="card-footer">
        <div className="updated">Updated {timeAgo(shipment.lastUpdateAt ?? shipment.updatedAt ?? shipment.createdAt)}</div>
        <div className="btns">
          <button className="btn-outline" onClick={() => onView && onView(shipment.id)}>View</button>
          <button className="btn-primary" onClick={() => onEdit && onEdit(shipment.id)}>Edit</button>
        </div>
      </footer>
    </article>
  );
}

/* helpers */
function formatETA(iso) {
  if (!iso) return '—';
  try {
    const target = new Date(iso);
    if (isNaN(target.getTime())) return '—';
    const now = new Date();
    const diff = target - now;
    if (diff < 0) {
      const daysAgo = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
      if (daysAgo === 0) return 'earlier today';
      return `${daysAgo}d ago`;
    }
    if (diff < 1000 * 60 * 60) return `${Math.ceil(diff / (1000 * 60))}m`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.ceil(diff / (1000 * 60 * 60))}h`;
    if (diff < 1000 * 60 * 60 * 24 * 7) return `in ${Math.ceil(diff / (1000 * 60 * 60 * 24))}d`;
    return target.toLocaleString();
  } catch (e) {
    return '—';
  }
}

function statusToClass(s) {
  if (!s) return 'pill-grey';
  const norm = String(s).toUpperCase();
  if (norm.includes('DELIVERED')) return 'pill-green';
  if (norm.includes('IN_TRANSIT')) return 'pill-yellow';
  if (norm.includes('PICKED') || norm.includes('PICKED_UP')) return 'pill-blue';
  if (norm.includes('OUT_FOR')) return 'pill-orange';
  if (norm.includes('CANCEL')) return 'pill-red';
  return 'pill-grey';
}

function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
