import React, { useMemo, useState } from 'react';
import { Bars } from 'react-loader-spinner';
import {
  useGetPoolRequestCategoriesQuery,
  useGetPoolVehicleTasksQuery,
  useGetPoolPassengerUsersQuery,
  useGetPoolVehiclesForAssignmentQuery,
  useCreatePoolVehicleRequestMutation,
  useHrDecidePoolVehicleTaskMutation,
  useAssignPoolVehicleTaskMutation,
} from '../../api/services NodeJs/poolVehicleTaskApi';
import { useGetWingsQuery } from '../../api/services NodeJs/jdManagementApi';
import { formatVehicleOwnershipFromRecord } from '../../utils/vehicleOwnership';

const todayIso = () => new Date().toISOString().slice(0, 10);

const normalizeWings = (wingsData) => {
  if (!wingsData) return [];
  if (Array.isArray(wingsData)) return wingsData;
  if (Array.isArray(wingsData.data)) return wingsData.data;
  if (Array.isArray(wingsData.wings)) return wingsData.wings;
  return [];
};

const resolveDepartmentLabel = (code, wings) => {
  if (!code) return '—';
  const wing = wings.find(
    (w) => w.wingsCode === code || String(w.wing || '').trim() === String(code).trim()
  );
  return wing?.wing || code;
};

const statusLabel = (row) => {
  if (row?.task_status === 'assigned') return 'Assigned';
  if (row?.hr_approval === 'r' || row?.task_status === 'rejected') return 'Rejected';
  if (row?.hr_approval === 'a' && !row?.vehicle_id) return 'Approved — awaiting vehicle';
  if (row?.hr_approval === 'a') return 'Approved';
  return 'Pending approval';
};

const emptyRequestForm = () => ({
  category_id: '',
  task_date: todayIso(),
  task_end_date: todayIso(),
  required_from_time: '',
  required_to_time: '',
  pickup_location: '',
  destination: '',
  passenger_user_ids: [],
  requester_department: '',
  request_reason: '',
  notes: '',
});

const openNativeDateTimePicker = (event) => {
  const input = event.currentTarget;
  if (!input || (input.type !== 'date' && input.type !== 'time')) return;
  if (typeof input.showPicker === 'function') {
    try {
      input.showPicker();
    } catch {
      input.focus();
    }
    return;
  }
  input.focus();
};

export default function PoolVehicleTasksPanel() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState(emptyRequestForm);
  const [filterStatus, setFilterStatus] = useState('all');
  const [assignTaskId, setAssignTaskId] = useState(null);
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [message, setMessage] = useState('');
  const [passengerSearch, setPassengerSearch] = useState('');

  const { data: categories = [], isLoading: loadingCategories } = useGetPoolRequestCategoriesQuery();
  const { data: wingsData, isLoading: loadingWings } = useGetWingsQuery();
  const wings = useMemo(() => normalizeWings(wingsData), [wingsData]);
  const { data: passengerUsers = [], isLoading: loadingPassengers } = useGetPoolPassengerUsersQuery(undefined, {
    skip: !showRequestModal,
  });

  const filteredPassengerUsers = useMemo(() => {
    const q = passengerSearch.trim().toLowerCase();
    const internal = passengerUsers.filter((u) => !u.is_guest && Number(u.id) !== 0);
    const guest = passengerUsers.find((u) => u.is_guest || Number(u.id) === 0);
    const filteredInternal = q
      ? internal.filter((u) => String(u.name || '').toLowerCase().includes(q))
      : internal;
    return guest ? [...filteredInternal, guest] : filteredInternal;
  }, [passengerUsers, passengerSearch]);
  const queryParams = useMemo(() => {
    if (filterStatus === 'pending') return { hr_approval: 'p' };
    if (filterStatus === 'approved') return { hr_approval: 'a', unassigned_only: '1' };
    if (filterStatus === 'assigned') return { task_status: 'assigned' };
    return {};
  }, [filterStatus]);

  const { data: tasks = [], isLoading: loadingTasks, refetch } = useGetPoolVehicleTasksQuery(queryParams);
  const { data: poolVehicles = [] } = useGetPoolVehiclesForAssignmentQuery(undefined, {
    skip: !assignTaskId,
  });

  const [createRequest, { isLoading: creating }] = useCreatePoolVehicleRequestMutation();
  const [hrDecide, { isLoading: deciding }] = useHrDecidePoolVehicleTaskMutation();
  const [assignVehicle, { isLoading: assigning }] = useAssignPoolVehicleTaskMutation();

  const assignTask = useMemo(
    () => tasks.find((row) => Number(row.id) === Number(assignTaskId)) || null,
    [tasks, assignTaskId]
  );

  const closeAssignModal = () => {
    setAssignTaskId(null);
    setAssignVehicleId('');
  };

  const formatTaskDateRange = (row) => {
    if (!row) return '—';
    const start = String(row.task_date || '').slice(0, 10);
    const end = String(row.task_end_date || row.task_date || '').slice(0, 10);
    if (end && end !== start) return `${start} → ${end}`;
    return start || '—';
  };

  const openRequestModal = () => {
    setRequestForm(emptyRequestForm());
    setPassengerSearch('');
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestForm(emptyRequestForm());
  };

  const togglePassengerUser = (userId) => {
    const id = Number(userId);
    setRequestForm((prev) => {
      const ids = [...(prev.passenger_user_ids || [])];
      const idx = ids.indexOf(id);
      if (idx >= 0) ids.splice(idx, 1);
      else ids.push(id);
      return { ...prev, passenger_user_ids: ids };
    });
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await createRequest({
        ...requestForm,
        category_id: Number(requestForm.category_id),
        passenger_user_ids: requestForm.passenger_user_ids || [],
      }).unwrap();
      closeRequestModal();
      setMessage('Vehicle request submitted.');
      refetch();
    } catch (err) {
      setMessage(err?.data?.message || err?.message || 'Could not submit request.');
    }
  };

  const handleApprove = async (id, approved) => {
    setMessage('');
    try {
      await hrDecide({ id, approved, rejection_reason: approved ? null : 'Not approved' }).unwrap();
      refetch();
    } catch (err) {
      setMessage(err?.data?.message || err?.message || 'HR decision failed.');
    }
  };

  const handleAssign = async () => {
    if (!assignTaskId || !assignVehicleId) return;
    setMessage('');
    try {
      await assignVehicle({ id: assignTaskId, vehicle_id: Number(assignVehicleId) }).unwrap();
      closeAssignModal();
      refetch();
      setMessage('Pool vehicle assigned.');
    } catch (err) {
      setMessage(err?.data?.message || err?.message || 'Assignment failed.');
    }
  };

  return (
    <div className="pool-tasks-panel-transport-hr">
      <div className="pool-tasks-toolbar-transport-hr">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <label htmlFor="pool-task-filter">Show</label>
          <select
            id="pool-task-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="assign-vehicle-date-input-transport-hr"
          >
            <option value="all">All requests</option>
            <option value="pending">Pending approval</option>
            <option value="approved">Approved — unassigned</option>
            <option value="assigned">Assigned</option>
          </select>
          <button
            type="button"
            className="action-btn-outline-transport-hr"
            onClick={openRequestModal}
          >
            New office request
          </button>
        </div>
      </div>

      {message ? <p className="pool-tasks-message-transport-hr">{message}</p> : null}

      {loadingTasks ? (
        <div className="pilot-assignment-teams-loading-pilotsassign">
          <Bars height="32" width="32" color="#003057" ariaLabel="bars-loading" visible />
          <span>Loading additional tasks…</span>
        </div>
      ) : (
        <table className="details-table-transport-hr">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Requester</th>
              <th>Reason</th>
              <th>Passengers</th>
              <th>Route</th>
              <th>Status</th>
              <th>Vehicle / Driver</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((row) => (
              <tr key={row.id}>
                <td>
                  <div>
                    {String(row.task_date || '').slice(0, 10)}
                    {row.task_end_date &&
                    String(row.task_end_date).slice(0, 10) !== String(row.task_date || '').slice(0, 10)
                      ? ` → ${String(row.task_end_date).slice(0, 10)}`
                      : ''}
                  </div>
                  {(row.required_from_time || row.required_to_time) ? (
                    <small style={{ color: '#64748b' }}>
                      {[row.required_from_time, row.required_to_time].filter(Boolean).join(' – ')}
                    </small>
                  ) : null}
                </td>
                <td>{row.category_name || '-'}</td>
                <td>
                  <div>{row.requester_name || row.requested_by_name || '-'}</div>
                  {row.requester_department ? (
                    <small style={{ color: '#64748b' }}>
                      {resolveDepartmentLabel(row.requester_department, wings)}
                    </small>
                  ) : null}
                </td>
                <td>
                  <div title={row.request_reason || row.notes || ''}>
                    {row.request_reason || row.notes || '—'}
                  </div>
                </td>
                <td>{row.passengers_display || '—'}</td>
                <td>
                  <div>{row.pickup_location || '—'}</div>
                  <small style={{ color: '#64748b' }}>{row.destination || ''}</small>
                </td>
                <td>{statusLabel(row)}</td>
                <td>
                  {row.vehicle_no
                    ? `${row.vehicle_no}${row.driver_name ? ` · ${row.driver_name}` : ''}`
                    : '—'}
                </td>
                <td>
                  {row.hr_approval === 'p' ? (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="action-btn-outline-transport-hr"
                        disabled={deciding}
                        onClick={() => handleApprove(row.id, true)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="action-btn-secondary-transport-hr"
                        disabled={deciding}
                        onClick={() => handleApprove(row.id, false)}
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                  {row.hr_approval === 'a' && !row.vehicle_id ? (
                    <button
                      type="button"
                      className="action-btn-outline-transport-hr"
                      onClick={() => {
                        setAssignTaskId(row.id);
                        setAssignVehicleId('');
                      }}
                    >
                      Assign pool vehicle
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!tasks.length ? (
              <tr>
                <td colSpan={9}>No additional pool vehicle tasks.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}

      {showRequestModal ? (
        <div
          className="pool-assign-modal-transport-hr"
          role="presentation"
          onClick={closeRequestModal}
        >
          <div
            className="pool-request-modal-card-transport-hr"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pool-request-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="pool-request-modal-title">Request a pool vehicle</h4>
            <form className="pool-request-form-transport-hr" onSubmit={handleCreateRequest}>
              <div className="pool-request-grid-transport-hr">
                <div className="pool-request-category-dept-row-transport-hr">
                <label className="pool-request-category-field-transport-hr">
                  Request category *
                  <select
                    required
                    value={requestForm.category_id}
                    onChange={(e) => setRequestForm((p) => ({ ...p, category_id: e.target.value }))}
                    disabled={loadingCategories}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Department
                  <select
                    value={requestForm.requester_department}
                    onChange={(e) => setRequestForm((p) => ({ ...p, requester_department: e.target.value }))}
                    disabled={loadingWings}
                  >
                    <option value="">{loadingWings ? 'Loading departments…' : 'Select department'}</option>
                    {wings.map((wing) => (
                      <option key={wing.id} value={wing.wingsCode}>
                        {wing.wing || wing.wingsCode}
                      </option>
                    ))}
                  </select>
                </label>
                </div>
                <label className="pool-datetime-label-transport-hr">
                  Start date *
                  <input
                    type="date"
                    className="pool-datetime-input-transport-hr"
                    required
                    value={requestForm.task_date}
                    onClick={openNativeDateTimePicker}
                    onChange={(e) => {
                      const nextStart = e.target.value;
                      setRequestForm((p) => ({
                        ...p,
                        task_date: nextStart,
                        task_end_date:
                          !p.task_end_date || p.task_end_date < nextStart ? nextStart : p.task_end_date,
                      }));
                    }}
                  />
                </label>
                <label className="pool-datetime-label-transport-hr">
                  End date *
                  <input
                    type="date"
                    className="pool-datetime-input-transport-hr"
                    required
                    min={requestForm.task_date || undefined}
                    value={requestForm.task_end_date}
                    onClick={openNativeDateTimePicker}
                    onChange={(e) => setRequestForm((p) => ({ ...p, task_end_date: e.target.value }))}
                  />
                </label>
                <label className="pool-datetime-label-transport-hr">
                  From time
                  <input
                    type="time"
                    className="pool-datetime-input-transport-hr"
                    value={requestForm.required_from_time}
                    onClick={openNativeDateTimePicker}
                    onChange={(e) => setRequestForm((p) => ({ ...p, required_from_time: e.target.value }))}
                  />
                </label>
                <label className="pool-datetime-label-transport-hr">
                  To time
                  <input
                    type="time"
                    className="pool-datetime-input-transport-hr"
                    value={requestForm.required_to_time}
                    onClick={openNativeDateTimePicker}
                    onChange={(e) => setRequestForm((p) => ({ ...p, required_to_time: e.target.value }))}
                  />
                </label>
                <label className="pool-request-span2-transport-hr pool-passenger-field-transport-hr">
                  Passengers
                  <div className="pool-passenger-picker-transport-hr">
                    <input
                      type="search"
                      className="pool-passenger-search-transport-hr"
                      placeholder="Search internal users…"
                      value={passengerSearch}
                      onChange={(e) => setPassengerSearch(e.target.value)}
                    />
                    {loadingPassengers ? <span style={{ gridColumn: '1 / -1', padding: 6 }}>Loading users…</span> : null}
                    {!loadingPassengers && filteredPassengerUsers.length === 0 ? (
                      <span style={{ gridColumn: '1 / -1', padding: 6, color: '#64748b' }}>No users match your search.</span>
                    ) : null}
                    {!loadingPassengers && filteredPassengerUsers.map((user) => {
                      const uid = Number(user.id);
                      const checked = (requestForm.passenger_user_ids || []).includes(uid);
                      const isGuest = user.is_guest || uid === 0;
                      return (
                        <label
                          key={`passenger-${uid}`}
                          className={`pool-passenger-option-transport-hr${isGuest ? ' pool-passenger-guest-transport-hr' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePassengerUser(uid)}
                          />
                          <span>{user.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  {(requestForm.passenger_user_ids || []).length > 0 ? (
                    <small className="pool-passenger-selected-transport-hr">
                      Selected: {(requestForm.passenger_user_ids || [])
                        .map((id) => passengerUsers.find((u) => Number(u.id) === Number(id))?.name || `User #${id}`)
                        .join(', ')}
                    </small>
                  ) : null}
                </label>
                <label>
                  Pickup location
                  <input
                    type="text"
                    value={requestForm.pickup_location}
                    onChange={(e) => setRequestForm((p) => ({ ...p, pickup_location: e.target.value }))}
                  />
                </label>
                <label>
                  Destination
                  <input
                    type="text"
                    value={requestForm.destination}
                    onChange={(e) => setRequestForm((p) => ({ ...p, destination: e.target.value }))}
                  />
                </label>
                <label className="pool-request-span2-transport-hr">
                  Reason for request *
                  <textarea
                    required
                    rows={3}
                    value={requestForm.request_reason}
                    onChange={(e) => setRequestForm((p) => ({ ...p, request_reason: e.target.value }))}
                    placeholder="Explain why you need the vehicle (meeting, client visit, delivery, etc.)"
                  />
                </label>
                <label className="pool-request-span2-transport-hr">
                  Additional notes
                  <textarea
                    rows={2}
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Optional extra details"
                  />
                </label>
              </div>
              <div className="pool-request-modal-actions-transport-hr">
                <button
                  type="button"
                  className="action-btn-secondary-transport-hr"
                  onClick={closeRequestModal}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn-outline-transport-hr" disabled={creating}>
                  {creating ? 'Submitting…' : 'Submit request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {assignTaskId ? (
        <div
          className="pool-assign-modal-transport-hr"
          role="presentation"
          onClick={closeAssignModal}
        >
          <div
            className="pool-assign-card-transport-hr"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pool-assign-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="pool-assign-modal-title">Assign pool vehicle</h4>

            {assignTask ? (
              <div className="pool-assign-summary-transport-hr">
                <div className="pool-assign-summary-row-transport-hr">
                  <span className="pool-assign-summary-label-transport-hr">Requester</span>
                  <span className="pool-assign-summary-value-transport-hr">
                    {assignTask.requester_name || assignTask.requested_by_name || '—'}
                    {assignTask.requester_department ? (
                      <> · {resolveDepartmentLabel(assignTask.requester_department, wings)}</>
                    ) : null}
                  </span>
                </div>
                <div className="pool-assign-summary-row-transport-hr">
                  <span className="pool-assign-summary-label-transport-hr">Category</span>
                  <span className="pool-assign-summary-value-transport-hr">{assignTask.category_name || '—'}</span>
                </div>
                <div className="pool-assign-summary-row-transport-hr">
                  <span className="pool-assign-summary-label-transport-hr">Dates</span>
                  <span className="pool-assign-summary-value-transport-hr">{formatTaskDateRange(assignTask)}</span>
                </div>
                {(assignTask.pickup_location || assignTask.destination) ? (
                  <div className="pool-assign-summary-row-transport-hr">
                    <span className="pool-assign-summary-label-transport-hr">Route</span>
                    <span className="pool-assign-summary-value-transport-hr">
                      {assignTask.pickup_location || '—'}
                      {assignTask.destination ? ` → ${assignTask.destination}` : ''}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}

            <label className="pool-assign-field-transport-hr">
              Pool vehicle *
              <select
                value={assignVehicleId}
                onChange={(e) => setAssignVehicleId(e.target.value)}
                className="pool-assign-select-transport-hr"
              >
                <option value="">Select pool vehicle</option>
                {poolVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicle_no} — {v.make} {v.model}
                    {v.assigned_driver_name ? ` (${v.assigned_driver_name})` : ''}
                    {' · '}
                    {formatVehicleOwnershipFromRecord(v)}
                  </option>
                ))}
              </select>
              <small className="pool-assign-hint-transport-hr">
                Only vehicles marked as pool are listed. Driver is taken from the vehicle record when assigned.
              </small>
            </label>

            <div className="pool-assign-actions-transport-hr">
              <button
                type="button"
                className="action-btn-secondary-transport-hr"
                onClick={closeAssignModal}
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-btn-outline-transport-hr"
                disabled={!assignVehicleId || assigning}
                onClick={handleAssign}
              >
                {assigning ? 'Assigning…' : 'Confirm assign'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
