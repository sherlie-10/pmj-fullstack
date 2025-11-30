import React from 'react';
import '../../styles/shipments.css';

export default function ShipmentTable({ shipments = [], onView, onEdit, onSelect, selectedIds = new Set() }) {
  return (
    <div className="shipment-table-wrapper">
      <table className="shipment-table" role="table">
        <thead>
          <tr>
            <th><input type="checkbox" aria-label="Select all" /></th>
            <th>Tracking</th>
            <th>Status</th>
            <th>Route</th>
            <th>ETA</th>
            <th>Weight</th>
            <th>Sender / Receiver</th>
            <th>Last update</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map(s => (
            <tr key={s.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(s.id)}
                  onChange={() => onSelect && onSelect(s.id)}
                  aria-label={`Select ${s.trackingId ?? s.trackingNo ?? ''}`}
                />
              </td>
              <td className="mono">{s.trackingId ?? s.trackingNo}</td>
              <td><span className={`status ${shortStatusClass(s.currentStatus ?? s.status)}`}>{String(s.currentStatus ?? s.status ?? '').replace(/_/g,' ')}</span></td>
              <td>{s.origin?.city ?? s.origin ?? '—'} → {s.destination?.city ?? s.destination ?? '—'}</td>
              <td>{s.expectedDelivery ? new Date(s.expectedDelivery).toLocaleDateString() : '—'}</td>
              <td>{s.weightKg ?? '—'}</td>
              <td>{(s.senderName ? s.senderName + ' / ' : '') + (s.receiverName ?? '')}</td>
              <td>{s.lastUpdateAt ? new Date(s.lastUpdateAt).toLocaleString() : (s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '—')}</td>
              <td>
                <button className="btn outline tiny" onClick={() => onView(s.id)}>View</button>
                <button className="btn primary tiny" onClick={() => onEdit(s.id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function shortStatusClass(s) {
  if (!s) return 'badge-grey';
  const norm = String(s).toUpperCase();
  if (norm.includes('DELIVERED')) return 'badge-green';
  if (norm.includes('IN_TRANSIT')) return 'badge-yellow';
  if (norm.includes('PICKED')) return 'badge-blue';
  if (norm.includes('OUT_FOR')) return 'badge-orange';
  if (norm.includes('CANCEL')) return 'badge-red';
  return 'badge-grey';
}
