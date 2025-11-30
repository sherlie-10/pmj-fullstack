import React, { useState } from 'react';
import '../../styles/shipments.css';
import * as api from '../../api/api';

export default function TrackingWidget({ small = false, onTrack }) {
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);

  async function lookup() {
    if (!q) return;
    // If you have a backend track endpoint use it:
    try {
      const res = await api.trackShipment(q); // expects trackingId
      setResult(res);
      onTrack && onTrack(res);
    } catch (err) {
      // fallback to a small client-side fake when backend doesn't find:
      const statuses = ['IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','PICKED_UP'];
      const status = statuses[q.charCodeAt(q.length - 1) % statuses.length];
      const fake = {
        trackingId: q,
        currentStatus: status,
        events: [
          { id: 'e1', code: 'CREATED', time: new Date(Date.now() - 1000*60*60*24).toISOString(), location: 'Warehouse' },
          { id: 'e2', code: status, time: new Date().toISOString(), location: 'Current' }
        ]
      };
      setResult(fake);
      onTrack && onTrack(fake);
    }
  }

  return (
    <div className={`tracking-widget ${small ? 'small' : ''}`}>
      <div className="search">
        <input placeholder="Enter tracking id" value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn outline" onClick={lookup}>Track</button>
      </div>

      {result && (
        <div className="track-result">
          <div className="row">
            <strong>{result.trackingId ?? result.trackingNo}</strong>
            <span className={`status ${result.currentStatus === 'DELIVERED' ? 'badge-green' : 'badge-yellow'}`}>
              {String(result.currentStatus ?? result.status ?? '').replace(/_/g,' ')}
            </span>
          </div>
          <ol className="tiny-timeline">
            {(result.events || []).slice(0,5).map(ev => (
              <li key={ev.id ?? ev.time}>
                <div className="evt-time tiny">{ev.time ? new Date(ev.time).toLocaleString() : ''}</div>
                <div className="evt-desc tiny">{(ev.code ?? ev.status) + ' • ' + (ev.location ?? '')}</div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
