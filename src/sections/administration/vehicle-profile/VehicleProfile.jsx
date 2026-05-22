import React, { useEffect, useMemo, useState } from 'react';
import {
  useGetVehicleProfileQuery,
  useUpdateVehicleMutation,
} from '../../../api/services/assetsApi';
import '../../../styles/vehicleProfile.css';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'schedule', label: 'Maintenance schedule' },
  { key: 'history', label: 'Schedule history' },
  { key: 'requests', label: 'Maintenance requests' },
];

/** Matches backend upload field names (stock-assets/update_vehicle). */
const VEHICLE_DOCUMENT_SLOTS = [
  { key: 'vehicle_image', label: 'Vehicle photo', accept: 'image/jpeg,image/png,image/webp,image/gif' },
  { key: 'vehicle_revenue_license_image', label: 'Revenue license', accept: 'image/*,.pdf' },
  { key: 'copy_of_registration_document', label: 'Registration document', accept: 'image/*,.pdf' },
  { key: 'smoke_test_image', label: 'Emission test', accept: 'image/*' },
  { key: 'insurance_image', label: 'Insurance', accept: 'image/*' },
];

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatMeter(value) {
  if (value === null || value === undefined || value === '') return '-';
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString() : String(value);
}

function scheduleFieldToString(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function parseScheduleMeterForApi(value) {
  const s = scheduleFieldToString(value).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function sourceLabel(source) {
  if (source === 'registration') return 'Registration';
  if (source === 'mobile') return 'Transport app';
  if (source === 'web') return 'Web app';
  return source || '-';
}

function requestStatusBadges(row) {
  const hr = String(row?.hr_approval || row?.approval || 'p').toLowerCase();
  const fin = String(row?.finance_approval || 'p').toLowerCase();
  const status = String(row?.maintenance_status || '').toLowerCase();
  const paid = status === 'paid' || Number(row?.finance_paid) === 1;
  const hrName = String(row?.hr_approved_by_name || '').trim();
  const finName = String(row?.finance_approved_by_name || '').trim();
  const paidName = String(row?.finance_paid_by_name || '').trim();

  const items = [];

  if (hr === 'd') {
    items.push({
      tone: 'declined',
      text: hrName || 'Declined (HR)',
      title: hrName ? 'Declined by HR' : undefined,
    });
  } else if (hr === 'a') {
    items.push({
      tone: 'approved',
      text: hrName || 'HR',
      title: hrName ? 'HR approval' : 'HR approved (no name recorded)',
    });
  }

  if (fin === 'd') {
    items.push({
      tone: 'declined',
      text: finName || 'Declined (Finance)',
      title: finName ? 'Declined by Finance' : undefined,
    });
  } else if (fin === 'a') {
    items.push({
      tone: 'approved',
      text: finName || 'Finance',
      title: finName ? 'Finance approval' : 'Finance approved (no name recorded)',
    });
  }

  if (paid) {
    items.push({
      tone: 'paid',
      text: paidName || 'Paid',
      title: paidName ? 'Marked paid' : undefined,
    });
  }

  if (!items.length) {
    items.push({ tone: 'pending', text: 'Pending' });
  }

  return (
    <div className="vehicle-profile-status-stack">
      {items.map((item) => (
        <span
          key={`${item.tone}-${item.text}`}
          className={`vehicle-profile-badge vehicle-profile-badge--${item.tone}`}
          title={item.title}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}

export default function VehicleProfile({ vehicleId, onBack, onEditVehicle }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [scheduleForm, setScheduleForm] = useState({
    last_serviced_meter: '',
    next_serviced: '',
    wheel_alignment_meter: '',
    next_wheel_alignment_meter: '',
  });
  const [saveMessage, setSaveMessage] = useState(null);
  const [uploadingDocKey, setUploadingDocKey] = useState(null);
  const [docMessage, setDocMessage] = useState(null);

  const { data: profile, isLoading, isError, refetch } = useGetVehicleProfileQuery(vehicleId, {
    skip: !vehicleId,
  });
  const [updateVehicle, { isLoading: saving }] = useUpdateVehicleMutation();

  const vehicle = profile?.vehicle;
  const schedule = profile?.maintenance_schedule;
  const history = profile?.maintenance_history || [];
  const requests = profile?.maintenance_requests || [];
  const fuelCard = profile?.fuel_card;
  const vehicleDocuments = profile?.vehicle_documents || [];
  const documentsByKey = useMemo(
    () => Object.fromEntries(vehicleDocuments.map((d) => [d.key, d])),
    [vehicleDocuments]
  );
  const primaryImageUrl = profile?.primary_image_url || vehicle?.primary_image_url || null;

  const handleUploadDocument = async (fieldKey, file) => {
    if (!file || !vehicleId) return;
    setUploadingDocKey(fieldKey);
    setDocMessage(null);
    try {
      const fd = new FormData();
      fd.append('id', String(vehicleId));
      fd.append(fieldKey, file);
      const res = await updateVehicle(fd).unwrap();
      if (res?.status === false) throw new Error(res?.message || 'Upload failed');
      setDocMessage({ type: 'success', text: 'Document saved.' });
      await refetch();
    } catch (e) {
      setDocMessage({
        type: 'error',
        text: e?.data?.message || e?.message || 'Failed to upload document',
      });
    } finally {
      setUploadingDocKey(null);
    }
  };

  useEffect(() => {
    if (!schedule) return;
    setScheduleForm({
      last_serviced_meter: scheduleFieldToString(schedule.last_serviced_meter),
      next_serviced: scheduleFieldToString(schedule.next_serviced),
      wheel_alignment_meter: scheduleFieldToString(schedule.wheel_alignment_meter),
      next_wheel_alignment_meter: scheduleFieldToString(schedule.next_wheel_alignment_meter),
    });
  }, [schedule, vehicleId]);

  const headerTitle = useMemo(() => {
    const no = vehicle?.vehicle_no || `Vehicle #${vehicleId}`;
    const mm = [vehicle?.make, vehicle?.model].filter(Boolean).join(' ');
    return mm ? `${no} — ${mm}` : no;
  }, [vehicle, vehicleId]);

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setSaveMessage(null);
    try {
      const payload = {
        id: vehicleId,
        last_serviced_meter: parseScheduleMeterForApi(scheduleForm.last_serviced_meter),
        next_serviced: parseScheduleMeterForApi(scheduleForm.next_serviced),
        wheel_alignment_meter: parseScheduleMeterForApi(scheduleForm.wheel_alignment_meter),
        next_wheel_alignment_meter: parseScheduleMeterForApi(scheduleForm.next_wheel_alignment_meter),
      };
      const res = await updateVehicle(payload).unwrap();
      if (res?.status === false) throw new Error(res?.message || 'Update failed');
      setSaveMessage({ type: 'success', text: 'Maintenance schedule updated.' });
      refetch();
      setActiveTab('history');
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err?.data?.message || err?.message || 'Failed to update schedule',
      });
    }
  };

  if (!vehicleId) return null;

  if (isLoading) {
    return <div className="vehicle-profile-loading">Loading vehicle profile…</div>;
  }

  if (isError || !vehicle) {
    return (
      <div className="vehicle-profile-wrap">
        <button type="button" className="vehicle-profile-back" onClick={onBack}>
          ← Back to fleet list
        </button>
        <p className="vehicle-profile-empty">Could not load vehicle profile.</p>
      </div>
    );
  }

  const overviewFields = [
    { label: 'Vehicle number', value: vehicle.vehicle_no },
    { label: 'Ownership', value: vehicle.ownership_label || vehicle.ownership },
    { label: 'Chassis no', value: vehicle.chassis_no },
    { label: 'Engine no', value: vehicle.engine_no },
    { label: 'Make / model', value: [vehicle.make, vehicle.model].filter(Boolean).join(' ') || '-' },
    { label: 'Wing', value: vehicle.wing_name || vehicle.wing },
    { label: 'Driver', value: vehicle.driver_name || '-' },
    { label: 'Initial mileage', value: formatMeter(vehicle.initial_mileage) },
    { label: 'Operational status', value: vehicle.operational_status === 'y' ? 'Active' : 'Inactive' },
    { label: 'Vehicle category', value: vehicle.vehicle_category_name || '-' },
    { label: 'Fuel category', value: vehicle.fuel_category_name || '-' },
    { label: 'Tank capacity (L)', value: vehicle.tank_capacity_ltr ?? '-' },
    { label: 'Avg fuel consumption', value: vehicle.avg_fuel_consumption ?? '-' },
    { label: 'Insurance expiry', value: formatDate(vehicle.insurance_expire_date) },
    { label: 'Revenue license expiry', value: formatDate(vehicle.revenue_license_expire_date) },
    { label: 'Fuel card', value: fuelCard?.card_no_masked || '-' },
  ];

  if (vehicle.ownership === 'r') {
    overviewFields.push(
      { label: 'Owner name', value: vehicle.owner_name },
      { label: 'Owner contact', value: vehicle.owner_contact_no },
      { label: 'Monthly rate', value: vehicle.monthly_rate },
      { label: 'Rate per km', value: vehicle.rate_per_km }
    );
  }

  return (
    <div className="vehicle-profile-wrap">
      <button type="button" className="vehicle-profile-back" onClick={onBack}>
        ← Back to fleet list
      </button>

      <div className="vehicle-profile-header vehicle-profile-header-with-photo">
        <div className="vehicle-profile-header-main">
          <h2 className="vehicle-profile-title">{headerTitle}</h2>
          <p className="vehicle-profile-subtitle">
            {vehicle.ownership_label || vehicle.ownership}
            {vehicle.wing_name ? ` · ${vehicle.wing_name}` : ''}
          </p>
          <div className="vehicle-profile-metrics">
            <span className="vehicle-profile-metric">
              <strong>Last serviced:</strong> {formatMeter(schedule?.last_serviced_meter)}
            </span>
            <span className="vehicle-profile-metric">
              <strong>Next service:</strong> {formatMeter(schedule?.next_serviced)}
            </span>
            <span className="vehicle-profile-metric">
              <strong>Requests:</strong> {requests.length}
            </span>
          </div>
          <div className="vehicle-profile-actions" style={{ marginTop: 12 }}>
            {onEditVehicle ? (
              <button type="button" className="vehicle-profile-btn-primary" onClick={() => onEditVehicle(vehicle)}>
                Edit vehicle info
              </button>
            ) : null}
          </div>
        </div>
        <div className="vehicle-profile-hero-photo">
          {primaryImageUrl ? (
            <img src={primaryImageUrl} alt={vehicle.vehicle_no || 'Vehicle'} />
          ) : (
            <div className="vehicle-profile-hero-placeholder">
              <span>No photo</span>
              <small>Upload at registration</small>
            </div>
          )}
        </div>
      </div>

      <div className="vehicle-profile-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`vehicle-profile-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            {t.key === 'requests' && requests.length > 0 ? ` (${requests.length})` : ''}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="vehicle-profile-section">
            <h4>Vehicle details</h4>
            <div className="vehicle-profile-grid">
              {overviewFields.map((f) => (
                <div key={f.label} className="vehicle-profile-field">
                  <label>{f.label}</label>
                  <span>{f.value ?? '-'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="vehicle-profile-section">
            <h4>Documents & images</h4>
            <p className="vehicle-profile-subtitle" style={{ marginBottom: 12 }}>
              Update each document here — no need to open the full edit form.
            </p>
            {docMessage ? (
              <p
                className={`vehicle-profile-schedule-message vehicle-profile-schedule-message--${docMessage.type}`}
                style={{ marginBottom: 12 }}
              >
                {docMessage.text}
              </p>
            ) : null}
            <div className="vehicle-profile-gallery">
              {VEHICLE_DOCUMENT_SLOTS.map((slot) => {
                const doc = documentsByKey[slot.key];
                const url = doc?.url || vehicle?.[slot.key] || null;
                const hasFile = doc?.has_file ?? Boolean(url);
                const isImage = doc?.is_image ?? (url && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(String(url)));
                const busy = uploadingDocKey === slot.key;
                const inputId = `vp-doc-${slot.key}`;

                return (
                  <div key={slot.key} className="vehicle-profile-gallery-card">
                    <div className="vehicle-profile-gallery-preview">
                      {hasFile && isImage && url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={slot.label} />
                        </a>
                      ) : hasFile && url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="vehicle-profile-doc-link"
                        >
                          View file
                        </a>
                      ) : (
                        <div className="vehicle-profile-gallery-empty">No file yet</div>
                      )}
                    </div>
                    <span className="vehicle-profile-gallery-label">{slot.label}</span>
                    <div className="vehicle-profile-gallery-actions">
                      <input
                        id={inputId}
                        type="file"
                        accept={slot.accept}
                        className="vehicle-profile-gallery-file-input"
                        disabled={busy || saving}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadDocument(slot.key, file);
                          e.target.value = '';
                        }}
                      />
                      <label htmlFor={inputId} className="vehicle-profile-gallery-upload-btn">
                        {busy ? 'Uploading…' : hasFile ? 'Replace' : 'Upload'}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'schedule' && (
        <div className="vehicle-profile-section">
          <h4>Current maintenance schedule</h4>
          <p className="vehicle-profile-subtitle" style={{ marginBottom: 14 }}>
            Set at registration; update here or via the transport app. Each save adds a history record.
          </p>
          <form className="vehicle-profile-schedule-form" onSubmit={handleSaveSchedule}>
            <div className="vehicle-profile-schedule-group">
              <h5 className="vehicle-profile-schedule-group-title">Service</h5>
              <div className="vehicle-profile-schedule-grid">
                <div className="vehicle-profile-schedule-field">
                  <label htmlFor="vp-last-serviced">Last serviced</label>
                  <span className="vehicle-profile-schedule-hint">Odometer (km)</span>
                  <input
                    id="vp-last-serviced"
                    type="number"
                    min="0"
                    placeholder="e.g. 15000"
                    value={scheduleForm.last_serviced_meter}
                    onChange={(e) =>
                      setScheduleForm((s) => ({ ...s, last_serviced_meter: e.target.value }))
                    }
                  />
                </div>
                <div className="vehicle-profile-schedule-field">
                  <label htmlFor="vp-next-service">Next service due</label>
                  <span className="vehicle-profile-schedule-hint">Odometer (km)</span>
                  <input
                    id="vp-next-service"
                    type="number"
                    min="0"
                    placeholder="e.g. 18000"
                    value={scheduleForm.next_serviced}
                    onChange={(e) => setScheduleForm((s) => ({ ...s, next_serviced: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="vehicle-profile-schedule-group">
              <h5 className="vehicle-profile-schedule-group-title">Wheel alignment</h5>
              <div className="vehicle-profile-schedule-grid">
                <div className="vehicle-profile-schedule-field">
                  <label htmlFor="vp-alignment-done">Alignment done at</label>
                  <span className="vehicle-profile-schedule-hint">Odometer (km)</span>
                  <input
                    id="vp-alignment-done"
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={scheduleForm.wheel_alignment_meter}
                    onChange={(e) =>
                      setScheduleForm((s) => ({ ...s, wheel_alignment_meter: e.target.value }))
                    }
                  />
                </div>
                <div className="vehicle-profile-schedule-field">
                  <label htmlFor="vp-next-alignment">Next alignment due</label>
                  <span className="vehicle-profile-schedule-hint">Odometer (km)</span>
                  <input
                    id="vp-next-alignment"
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={scheduleForm.next_wheel_alignment_meter}
                    onChange={(e) =>
                      setScheduleForm((s) => ({ ...s, next_wheel_alignment_meter: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            {saveMessage ? (
              <p
                className={`vehicle-profile-schedule-message vehicle-profile-schedule-message--${saveMessage.type}`}
              >
                {saveMessage.text}
              </p>
            ) : null}
            <div className="vehicle-profile-schedule-footer">
              <button type="submit" className="vehicle-profile-btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="vehicle-profile-section">
          <h4>Maintenance schedule history</h4>
          <p className="vehicle-profile-subtitle" style={{ marginBottom: 12 }}>
            Previous schedule values recorded at registration, web updates, and transport app updates.
          </p>
          {history.length === 0 ? (
            <p className="vehicle-profile-empty">No schedule history yet.</p>
          ) : (
            <div className="vehicle-profile-table-wrap">
              <table className="vehicle-profile-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Last serviced</th>
                    <th>Next service</th>
                    <th>Alignment</th>
                    <th>Next alignment</th>
                    <th>Updated by</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id}>
                      <td>{formatDateTime(row.created_at)}</td>
                      <td>{sourceLabel(row.source)}</td>
                      <td>{formatMeter(row.last_serviced_meter)}</td>
                      <td>{formatMeter(row.next_serviced)}</td>
                      <td>{formatMeter(row.wheel_alignment_meter)}</td>
                      <td>{formatMeter(row.next_wheel_alignment_meter)}</td>
                      <td>{row.changed_by_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="vehicle-profile-section">
          <h4>Maintenance requests</h4>
          <p className="vehicle-profile-subtitle" style={{ marginBottom: 12 }}>
            Requests submitted from the transport app for this vehicle.
          </p>
          {requests.length === 0 ? (
            <p className="vehicle-profile-empty">No maintenance requests for this vehicle.</p>
          ) : (
            <div className="vehicle-profile-table-wrap">
              <table className="vehicle-profile-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Est. cost</th>
                    <th>Driver</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((row) => (
                    <tr key={row.id}>
                      <td>{formatDate(row.date)}</td>
                      <td>{row.category_name || row.category || '-'}</td>
                      <td>{row.description_name || row.description || '-'}</td>
                      <td>
                        {row.cost_estimation != null
                          ? `LKR ${Number(row.cost_estimation).toLocaleString()}`
                          : '-'}
                      </td>
                      <td>{row.driver_name || '-'}</td>
                      <td>{requestStatusBadges(row)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
