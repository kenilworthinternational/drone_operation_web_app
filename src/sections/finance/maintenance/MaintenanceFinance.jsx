import React, { useMemo, useState } from 'react';
import { CircularProgress } from '@mui/material';
import {
  useFinanceDecideVehicleMaintenanceRequestMutation,
  useGetVehicleAppMaintenanceRequestsQuery,
  useMarkVehicleMaintenancePaidMutation,
} from '../../../api/services NodeJs/vehicleAppApi';
import '../../../styles/transportFinanceMaintenance.css';

function getRollingMonthOptions(monthsBack = 24) {
  const now = new Date();
  const out = [];
  for (let i = 0; i < monthsBack; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    out.push({ value, label });
  }
  return out;
}

function toDateOnly(value) {
  const text = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return '-';
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hrStatusChip(row) {
  const status = String(row?.hr_approval || row?.approval || 'p');
  if (status === 'a') {
    return (
      <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-hr-approved-transport-finance">
        Approved
      </span>
    );
  }
  if (status === 'd') {
    return (
      <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-hr-declined-transport-finance">
         Declined
      </span>
    );
  }
  return (
    <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-hr-pending-transport-finance">
      Pending
    </span>
  );
}

function financeStatusChip(row) {
  const status = String(row?.finance_approval || 'p');
  if (status === 'a') {
    return (
      <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-finance-approved-transport-finance">
        Approved
      </span>
    );
  }
  if (status === 'd') {
    return (
      <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-finance-declined-transport-finance">
        Declined
      </span>
    );
  }
  return (
    <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-finance-pending-transport-finance">
      Pending
    </span>
  );
}

function paidStatusChip(row) {
  return Number(row?.finance_paid) === 1 ? (
    <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-paid-transport-finance">
      Paid
    </span>
  ) : (
    <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-not-paid-transport-finance">
      Not Paid
    </span>
  );
}

function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function MaintenanceFinance({
  embedded = false,
  externalMonth = '',
  onMonthChange = null,
  prefetchedRows = null,
  prefetchedLoading = null,
}) {
  const defaultMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);
  const [internalMonth, setInternalMonth] = useState(defaultMonth);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [proofById, setProofById] = useState({});
  const [noteById, setNoteById] = useState({});
  const [financeDecisionModal, setFinanceDecisionModal] = useState({
    open: false,
    row: null,
    approval: 'a',
    declineReason: '',
    error: '',
  });
  const [maintenanceNotice, setMaintenanceNotice] = useState({
    open: false,
    title: '',
    message: '',
    tone: 'success',
  });
  const [paymentProofModal, setPaymentProofModal] = useState({
    open: false,
    row: null,
    error: '',
  });

  const selectedMonth = externalMonth || internalMonth;
  const monthOptions = useMemo(() => getRollingMonthOptions(24), []);
  const shouldFetchInside = !Array.isArray(prefetchedRows);
  const { data: fetchedRows = [], isLoading: fetchedLoading } = useGetVehicleAppMaintenanceRequestsQuery(selectedMonth, {
    skip: !shouldFetchInside,
  });
  const rows = Array.isArray(prefetchedRows) ? prefetchedRows : fetchedRows;
  const isLoading = typeof prefetchedLoading === 'boolean' ? prefetchedLoading : fetchedLoading;
  const hasRows = Array.isArray(rows) && rows.length > 0;
  const showSpinner = Boolean(isLoading) && !hasRows;
  const [financeDecide, { isLoading: deciding }] = useFinanceDecideVehicleMaintenanceRequestMutation();
  const [markPaid, { isLoading: markingPaid }] = useMarkVehicleMaintenancePaidMutation();

  const vehicleOptions = useMemo(
    () => [...new Set((rows || []).map((r) => String(r?.vehicle_no || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [rows]
  );
  const filteredRows = useMemo(() => {
    const selectedVehicleKey = String(selectedVehicle || '').trim().toLowerCase();
    const hrVisibleRows = (rows || []).filter((r) => {
      const hrStatus = String(r?.hr_approval || r?.approval || 'p');
      return hrStatus !== 'd';
    });
    if (!selectedVehicleKey) return hrVisibleRows;
    return hrVisibleRows.filter((r) => {
      const vehicleKey = String(r?.vehicle_no || r?.vehicle || '').trim().toLowerCase();
      return vehicleKey === selectedVehicleKey;
    });
  }, [rows, selectedVehicle]);
  const safeRows = Array.isArray(filteredRows) ? filteredRows : [];

  const updateMonth = (value) => {
    if (onMonthChange) {
      onMonthChange(value);
      return;
    }
    setInternalMonth(value);
  };

  const onFinanceDecision = async (row, approval) => {
    setFinanceDecisionModal({
      open: true,
      row,
      approval,
      declineReason: '',
      error: '',
    });
  };

  const closeFinanceDecisionModal = () => {
    setFinanceDecisionModal({
      open: false,
      row: null,
      approval: 'a',
      declineReason: '',
      error: '',
    });
  };

  const submitFinanceDecision = async () => {
    const row = financeDecisionModal.row;
    if (!row?.id) return;
    const approval = financeDecisionModal.approval;
    const declineReason = String(financeDecisionModal.declineReason || '').trim();
    if (approval === 'd' && !declineReason) {
      setFinanceDecisionModal((prev) => ({ ...prev, error: 'Decline reason is required.' }));
      return;
    }
    try {
      await financeDecide({
        id: row.id,
        approval,
        decline_reason: approval === 'd' ? declineReason : null,
      }).unwrap();
      closeFinanceDecisionModal();
      setMaintenanceNotice({
        open: true,
        title: 'Success',
        message: `Maintenance request #${row.id} ${approval === 'a' ? 'finance approved' : 'finance declined'} successfully.`,
        tone: 'success',
      });
    } catch (error) {
      setFinanceDecisionModal((prev) => ({
        ...prev,
        error: error?.data?.message || error?.message || 'Failed finance decision',
      }));
    }
  };

  const onMarkPaid = async (row) => {
    const proof = proofById[row.id];
    if (!proof?.dataUri) {
      setPaymentProofModal((prev) => ({ ...prev, error: 'Payment proof is required before submit.' }));
      return false;
    }
    try {
      await markPaid({
        id: row.id,
        payment_image: proof.dataUri,
        payment_note: noteById[row.id] || null,
      }).unwrap();
      setMaintenanceNotice({
        open: true,
        title: 'Success',
        message: `Maintenance request #${row.id} marked as paid.`,
        tone: 'success',
      });
      return true;
    } catch (error) {
      setMaintenanceNotice({
        open: true,
        title: 'Error',
        message: error?.data?.message || error?.message || 'Failed to mark paid',
        tone: 'error',
      });
      return false;
    }
  };

  const openPaymentProofModal = (row) => {
    setPaymentProofModal({
      open: true,
      row,
      error: '',
    });
  };

  const closePaymentProofModal = () => {
    setPaymentProofModal({
      open: false,
      row: null,
      error: '',
    });
  };

  return (
    <div className={`maintenance-finance-root-transport-finance ${embedded ? 'maintenance-finance-root-embedded-transport-finance' : ''}`}>
      <div className="maintenance-finance-toolbar-transport-finance">
        <strong className="maintenance-finance-toolbar-title-transport-finance">Maintenance Finance</strong>
      </div>
      <div className="maintenance-finance-filters-row-transport-finance">
        <label className="maintenance-finance-filter-label-transport-finance">
          <span className="maintenance-finance-filter-label-title-transport-finance">Month</span>
          <select className="maintenance-finance-select-transport-finance" value={selectedMonth} onChange={(e) => updateMonth(e.target.value)}>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className="maintenance-finance-filter-label-transport-finance">
          <span className="maintenance-finance-filter-label-title-transport-finance">Vehicle</span>
          <select className="maintenance-finance-select-transport-finance" value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
            <option value="">All Vehicles</option>
            {vehicleOptions.map((vehicleNo) => (
              <option key={vehicleNo} value={vehicleNo}>{vehicleNo}</option>
            ))}
          </select>
        </label>
      </div>

      {showSpinner ? (
        <div className="maintenance-finance-loading-transport-finance">
          <CircularProgress />
        </div>
      ) : (
        <div className="maintenance-finance-table-wrap-transport-finance">
          <table className="maintenance-finance-table-transport-finance">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Category</th>
                <th>Cost</th>
                <th>HR</th>
                <th>Finance</th>
                <th>Action</th>
                <th>Paid</th>
                <th>Payment Proof</th>
              </tr>
            </thead>
            <tbody>
              {safeRows.map((row) => {
                const hrStatus = String(row?.hr_approval || row?.approval || 'p');
                const financeStatus = String(row?.finance_approval || 'p');
                const paid = Number(row?.finance_paid) === 1;
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{toDateOnly(row.date)}</td>
                    <td>{row.vehicle_no || '-'}</td>
                    <td>{row.driver_name || '-'}</td>
                    <td>{row.category_name || '-'}</td>
                    <td>{row.cost_estimation != null ? Number(row.cost_estimation).toFixed(2) : '-'}</td>
                    <td>{hrStatusChip(row)}</td>
                    <td>{financeStatusChip(row)}</td>
                    <td className="maintenance-finance-action-cell-transport-finance">
                      {paid && row.payment_image_url ? (
                        <span className="maintenance-finance-muted-transport-finance">Completed</span>
                      ) : hrStatus !== 'a' ? (
                        <span className="maintenance-finance-muted-transport-finance">Awaiting HR</span>
                      ) : financeStatus === 'p' ? (
                        <div className="maintenance-finance-actions-row-transport-finance maintenance-finance-actions-row-tight-transport-finance">
                          <button type="button" className="maintenance-finance-btn-outline-transport-finance" disabled={deciding} onClick={() => onFinanceDecision(row, 'a')}>
                            Approve
                          </button>
                          <button type="button" className="maintenance-finance-btn-secondary-transport-finance" disabled={deciding} onClick={() => onFinanceDecision(row, 'd')}>
                            Decline
                          </button>
                        </div>
                      ) : financeStatus === 'a' && !paid ? (
                        <button type="button" className="maintenance-finance-btn-outline-transport-finance" disabled={markingPaid} onClick={() => openPaymentProofModal(row)}>
                          Mark Paid
                        </button>
                      ) : (
                        <span className="maintenance-finance-muted-transport-finance">Finance Declined</span>
                      )}
                    </td>
                    <td>{paidStatusChip(row)}</td>
                    <td>
                      {paid && row.payment_image_url ? (
                        <a className="maintenance-finance-proof-link-transport-finance" href={row.payment_image_url} target="_blank" rel="noreferrer">
                          View proof
                        </a>
                      ) : financeStatus !== 'a' ? (
                        <span className="maintenance-finance-muted-transport-finance">Enable after finance approval</span>
                      ) : financeStatus === 'p' ? (
                        <span className="maintenance-finance-muted-transport-finance">Enable after finance approval</span>
                      ) : (
                        <button
                          type="button"
                          className="maintenance-finance-btn-outline-transport-finance"
                          disabled={markingPaid}
                          onClick={() => openPaymentProofModal(row)}
                        >
                          Add Proof
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!safeRows.length ? (
                <tr>
                  <td colSpan={11} className="maintenance-finance-no-rows-transport-finance">
                    No maintenance finance records for the selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {financeDecisionModal.open ? (
        <div className="maintenance-finance-modal-overlay-transport-finance" role="presentation" onClick={closeFinanceDecisionModal}>
          <div className="maintenance-finance-modal-card-transport-finance" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="maintenance-finance-modal-toolbar-transport-finance">
              <h3 className="maintenance-finance-modal-title-transport-finance">
                Confirm {financeDecisionModal.approval === 'a' ? 'Finance Approve' : 'Finance Decline'}
              </h3>
              <button type="button" className="maintenance-finance-btn-secondary-transport-finance" onClick={closeFinanceDecisionModal} disabled={deciding}>
                Close
              </button>
            </div>
            <div className="maintenance-finance-modal-body-transport-finance">
              <p className="maintenance-finance-modal-hint-transport-finance">
                Request #{financeDecisionModal.row?.id} • Vehicle {financeDecisionModal.row?.vehicle_no || '-'} • Driver {financeDecisionModal.row?.driver_name || '-'}
              </p>
              {financeDecisionModal.approval === 'd' ? (
                <div className="maintenance-finance-modal-field-transport-finance">
                  <label className="maintenance-finance-modal-label-transport-finance" htmlFor="maintenance-finance-decline-reason">
                    Decline Reason
                  </label>
                  <textarea
                    id="maintenance-finance-decline-reason"
                    rows={4}
                    value={financeDecisionModal.declineReason}
                    onChange={(e) => setFinanceDecisionModal((prev) => ({ ...prev, declineReason: e.target.value, error: '' }))}
                    className="maintenance-finance-modal-textarea-transport-finance"
                    placeholder="Enter reason for finance decline"
                  />
                </div>
              ) : (
                <p className="maintenance-finance-modal-confirm-text-transport-finance">
                  Are you sure you want to finance approve this maintenance request?
                </p>
              )}
              {financeDecisionModal.error ? (
                <p className="maintenance-finance-modal-error-transport-finance">{financeDecisionModal.error}</p>
              ) : null}
              <div className="maintenance-finance-modal-actions-transport-finance">
                <button type="button" className="maintenance-finance-btn-secondary-transport-finance" onClick={closeFinanceDecisionModal} disabled={deciding}>
                  Cancel
                </button>
                <button type="button" className="maintenance-finance-btn-outline-transport-finance" onClick={submitFinanceDecision} disabled={deciding}>
                  {deciding ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {maintenanceNotice.open ? (
        <div className="maintenance-finance-modal-overlay-transport-finance" role="presentation" onClick={() => setMaintenanceNotice({ open: false, title: '', message: '', tone: 'success' })}>
          <div className="maintenance-finance-modal-card-transport-finance" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="maintenance-finance-modal-toolbar-transport-finance">
              <h3 className="maintenance-finance-modal-title-transport-finance">{maintenanceNotice.title}</h3>
            </div>
            <div className="maintenance-finance-modal-body-transport-finance">
              <p className={`maintenance-finance-notice-text-transport-finance ${maintenanceNotice.tone === 'error' ? 'maintenance-finance-notice-error-transport-finance' : 'maintenance-finance-notice-success-transport-finance'}`}>
                {maintenanceNotice.message}
              </p>
              <div className="maintenance-finance-modal-actions-transport-finance">
                <button
                  type="button"
                  className="maintenance-finance-btn-outline-transport-finance"
                  onClick={() => setMaintenanceNotice({ open: false, title: '', message: '', tone: 'success' })}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {paymentProofModal.open ? (
        <div className="maintenance-finance-modal-overlay-transport-finance" role="presentation" onClick={closePaymentProofModal}>
          <div className="maintenance-finance-modal-card-transport-finance" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="maintenance-finance-modal-toolbar-transport-finance">
              <h3 className="maintenance-finance-modal-title-transport-finance">
                Submit Payment Proof
              </h3>
              <button type="button" className="maintenance-finance-btn-secondary-transport-finance" onClick={closePaymentProofModal} disabled={markingPaid}>
                Close
              </button>
            </div>
            <div className="maintenance-finance-modal-body-transport-finance">
              <p className="maintenance-finance-modal-hint-transport-finance">
                Request #{paymentProofModal.row?.id} • Vehicle {paymentProofModal.row?.vehicle_no || '-'} • Driver {paymentProofModal.row?.driver_name || '-'}
              </p>
              <div className="maintenance-finance-proof-grid-transport-finance">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const dataUri = await fileToDataUri(file);
                      setProofById((prev) => ({ ...prev, [paymentProofModal.row.id]: { dataUri, fileName: file.name } }));
                      setPaymentProofModal((prev) => ({ ...prev, error: '' }));
                    } catch (error) {
                      setPaymentProofModal((prev) => ({ ...prev, error: error?.message || 'Failed to load proof file' }));
                    }
                  }}
                />
                <small className="maintenance-finance-proof-filename-transport-finance">
                  {paymentProofModal.row ? (proofById[paymentProofModal.row.id]?.fileName || 'No file selected') : 'No file selected'}
                </small>
                <input
                  type="text"
                  placeholder="Payment note (optional)"
                  value={paymentProofModal.row ? (noteById[paymentProofModal.row.id] || '') : ''}
                  onChange={(e) => {
                    if (!paymentProofModal.row) return;
                    setNoteById((prev) => ({ ...prev, [paymentProofModal.row.id]: e.target.value }));
                  }}
                  className="maintenance-finance-text-input-transport-finance"
                />
              </div>
              {paymentProofModal.error ? (
                <p className="maintenance-finance-modal-error-transport-finance">{paymentProofModal.error}</p>
              ) : null}
              <div className="maintenance-finance-modal-actions-transport-finance">
                <button type="button" className="maintenance-finance-btn-secondary-transport-finance" onClick={closePaymentProofModal} disabled={markingPaid}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="maintenance-finance-btn-outline-transport-finance"
                  onClick={async () => {
                    if (!paymentProofModal.row) return;
                    const ok = await onMarkPaid(paymentProofModal.row);
                    if (ok) {
                      closePaymentProofModal();
                    }
                  }}
                  disabled={markingPaid}
                >
                  {markingPaid ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MaintenanceFinance;
