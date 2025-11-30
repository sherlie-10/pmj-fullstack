import React, { useEffect, useState } from 'react';
import '../../styles/shipments.css';

export default function ShipmentForm({ open = false, shipment = null, onClose, onSave }) {
  const [form, setForm] = useState(initialForm());

  useEffect(() => {
    setForm(shipment ? mapShipmentToForm(shipment) : initialForm());
  }, [shipment, open]);

  if (!open) return null;

  function initialForm() {
    return {
      id: null,
      trackingId: '',
      senderName: '',
      receiverName: '',
      originCity: '',
      originAddress: '',
      destinationCity: '',
      destinationAddress: '',
      expectedDelivery: '',
      weightKg: '',
      currentStatus: 'CREATED',
      notes: ''
    };
  }

  function mapShipmentToForm(s) {
    return {
      id: s.id,
      trackingId: s.trackingId ?? s.trackingNo ?? '',
      senderName: s.senderName ?? '',
      receiverName: s.receiverName ?? '',
      originCity: s.origin?.city ?? s.origin ?? '',
      originAddress: s.origin?.address ?? '',
      destinationCity: s.destination?.city ?? s.destination ?? '',
      destinationAddress: s.destination?.address ?? '',
      expectedDelivery: s.expectedDelivery ?? '',
      weightKg: s.weightKg ?? '',
      currentStatus: s.currentStatus ?? s.status ?? 'CREATED',
      notes: s.notes ?? ''
    };
  }

  function update(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function save() {
    if (!form.trackingId || !form.originCity || !form.destinationCity) {
      alert('Please fill tracking id, origin city and destination city.');
      return;
    }
    const payload = {
      id: form.id || `tmp-${Math.random().toString(36).slice(2,9)}`,
      trackingId: form.trackingId,
      senderName: form.senderName,
      receiverName: form.receiverName,
      origin: { city: form.originCity, address: form.originAddress },
      destination: { city: form.destinationCity, address: form.destinationAddress },
      expectedDelivery: form.expectedDelivery,
      weightKg: form.weightKg,
      currentStatus: form.currentStatus,
      notes: form.notes,
      createdAt: (shipment && shipment.createdAt) || new Date().toISOString(),
      lastUpdateAt: new Date().toISOString(),
      events: shipment?.events ?? []
    };
    onSave && onSave(payload);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <h3>{form.id ? 'Edit Shipment' : 'Create Shipment'}</h3>
          <div>
            <button className="btn ghost small" onClick={onClose}>Cancel</button>
            <button className="btn primary small" onClick={save}>Save</button>
          </div>
        </header>

        <div className="modal-body">
          <div className="form-row">
            <label>Tracking ID*</label>
            <input value={form.trackingId} onChange={e => update('trackingId', e.target.value)} />
          </div>

          <div className="form-row">
            <label>Sender name</label>
            <input value={form.senderName} onChange={e => update('senderName', e.target.value)} />
          </div>

          <div className="form-row">
            <label>Receiver name</label>
            <input value={form.receiverName} onChange={e => update('receiverName', e.target.value)} />
          </div>

          <div className="grid-2">
            <div className="form-row">
              <label>Origin city*</label>
              <input value={form.originCity} onChange={e => update('originCity', e.target.value)} />
            </div>
            <div className="form-row">
              <label>Destination city*</label>
              <input value={form.destinationCity} onChange={e => update('destinationCity', e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-row">
              <label>Expected delivery</label>
              <input type="datetime-local" value={form.expectedDelivery} onChange={e => update('expectedDelivery', e.target.value)} />
            </div>
            <div className="form-row">
              <label>Weight (kg)</label>
              <input type="number" step="0.1" value={form.weightKg} onChange={e => update('weightKg', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
