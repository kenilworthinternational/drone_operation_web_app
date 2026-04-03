import React, { useEffect, useMemo, useRef, useState } from 'react';
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
        HR Approved
      </span>
    );
  }
  if (status === 'd') {
    return (
      <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-hr-declined-transport-finance">
        HR Declined
      </span>
    );
  }
  return (
    <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-hr-pending-transport-finance">
      HR Pending
    </span>
  );
}

function financeStatusChip(row) {
  const status = String(row?.finance_approval || 'p');
  if (status === 'a') {
    return (
      <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-finance-approved-transport-finance">
        Finance Approved
      </span>
    );
  }
  if (status === 'd') {
    return (
      <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-finance-declined-transport-finance">
        Finance Declined
      </span>
    );
  }
  return (
    <span className="maintenance-finance-chip-transport-finance maintenance-finance-chip-finance-pending-transport-finance">
      Finance Pending
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
  const tableWrapRef = useRef(null);
  const tableRef = useRef(null);
  const containerRef = useRef(null);

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
    if (!selectedVehicleKey) return rows || [];
    return (rows || []).filter((r) => {
      const vehicleKey = String(r?.vehicle_no || r?.vehicle || '').trim().toLowerCase();
      return vehicleKey === selectedVehicleKey;
    });
  }, [rows, selectedVehicle]);
  const safeRows = Array.isArray(filteredRows) ? filteredRows : [];

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7388/ingest/2847869f-00fd-4bf5-84a4-26f0333f83f0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6fcd8b'},body:JSON.stringify({sessionId:'6fcd8b',runId:'pre-fix-1',hypothesisId:'H2',location:'MaintenanceFinance.jsx:rows+filters',message:'Maintenance finance rows/filter snapshot',data:{selectedMonth,selectedVehicle,hasPrefetchedRows:Array.isArray(prefetchedRows),prefetchedRowsCount:Array.isArray(prefetchedRows)?prefetchedRows.length:-1,fetchedRowsCount:Array.isArray(fetchedRows)?fetchedRows.length:-1,rowsCount:Array.isArray(rows)?rows.length:-1,filteredRowsCount:Array.isArray(filteredRows)?filteredRows.length:-1,safeRowsCount:Array.isArray(safeRows)?safeRows.length:-1,isLoading,showSpinner},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [selectedMonth, selectedVehicle, prefetchedRows, fetchedRows, rows, filteredRows, safeRows, isLoading, showSpinner]);

  useEffect(() => {
    if (!safeRows.length) return;
    const sample = safeRows[0] || {};
    // #region agent log
    fetch('http://127.0.0.1:7388/ingest/2847869f-00fd-4bf5-84a4-26f0333f83f0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6fcd8b'},body:JSON.stringify({sessionId:'6fcd8b',runId:'pre-fix-1',hypothesisId:'H3',location:'MaintenanceFinance.jsx:first-row-shape',message:'Maintenance finance first row shape',data:{keys:Object.keys(sample||{}).slice(0,30),id:sample?.id??null,hr_approval:sample?.hr_approval??null,finance_approval:sample?.finance_approval??null,finance_paid:sample?.finance_paid??null,vehicle_no:sample?.vehicle_no??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [safeRows]);

  useEffect(() => {
    const wrapEl = tableWrapRef.current;
    const tableEl = tableRef.current;
    const containerEl = containerRef.current;
    const sectionWrapEl = wrapEl?.closest ? wrapEl.closest('.transport-finance-section-wrap') : null;
    const wrapRect = wrapEl?.getBoundingClientRect ? wrapEl.getBoundingClientRect() : null;
    const tableRect = tableEl?.getBoundingClientRect ? tableEl.getBoundingClientRect() : null;
    const containerRect = containerEl?.getBoundingClientRect ? containerEl.getBoundingClientRect() : null;
    const sectionWrapRect = sectionWrapEl?.getBoundingClientRect ? sectionWrapEl.getBoundingClientRect() : null;
    const wrapStyle = wrapEl ? window.getComputedStyle(wrapEl) : null;
    const tableStyle = tableEl ? window.getComputedStyle(tableEl) : null;
    const containerStyle = containerEl ? window.getComputedStyle(containerEl) : null;
    const sectionWrapStyle = sectionWrapEl ? window.getComputedStyle(sectionWrapEl) : null;
    const pointX = tableRect ? Math.round(tableRect.left + 10) : null;
    const pointY = tableRect ? Math.round(tableRect.top + 10) : null;
    const topEl = pointX != null && pointY != null && document.elementFromPoint
      ? document.elementFromPoint(pointX, pointY)
      : null;
    const topElMeta = topEl
      ? { tag: topEl.tagName, className: topEl.className || null, id: topEl.id || null }
      : null;
    // #region agent log
    fetch('http://127.0.0.1:7388/ingest/2847869f-00fd-4bf5-84a4-26f0333f83f0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6fcd8b'},body:JSON.stringify({sessionId:'6fcd8b',runId:'pre-fix-4',hypothesisId:'H6',location:'MaintenanceFinance.jsx:flow-position',message:'Maintenance finance flow/position diagnostics',data:{hasRows:safeRows.length>0,wrapTop:wrapRect?Math.round(wrapRect.top):null,wrapHeight:wrapRect?Math.round(wrapRect.height):null,tableTop:tableRect?Math.round(tableRect.top):null,tableHeight:tableRect?Math.round(tableRect.height):null,tablePosition:tableStyle?.position||null,tableFloat:tableStyle?.float||null,tableTransform:tableStyle?.transform||null,tableOffsetParentTag:tableEl?.offsetParent?.tagName||null,tableOffsetParentClass:tableEl?.offsetParent?.className||null,wrapPosition:wrapStyle?.position||null,wrapOverflowY:wrapStyle?.overflowY||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // #region agent log
    fetch('http://127.0.0.1:7388/ingest/2847869f-00fd-4bf5-84a4-26f0333f83f0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6fcd8b'},body:JSON.stringify({sessionId:'6fcd8b',runId:'pre-fix-2',hypothesisId:'H4',location:'MaintenanceFinance.jsx:elementFromPoint',message:'elementFromPoint inside table',data:{hasRows:safeRows.length>0,pointX,pointY,topElMeta},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [safeRows, showSpinner]);

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
      setMaintenanceNotice({
        open: true,
        title: 'Missing Payment Proof',
        message: 'Payment proof is required before mark paid.',
        tone: 'error',
      });
      return;
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
    } catch (error) {
      setMaintenanceNotice({
        open: true,
        title: 'Error',
        message: error?.data?.message || error?.message || 'Failed to mark paid',
        tone: 'error',
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`maintenance-finance-root-transport-finance ${embedded ? 'maintenance-finance-root-embedded-transport-finance' : ''}`}
    >
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
        <div ref={tableWrapRef} className="maintenance-finance-table-wrap-transport-finance">
          <table
            ref={tableRef}
            className="maintenance-finance-table-transport-finance"
          >
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
                <th>Paid</th>
                <th>Payment Proof</th>
                <th>Action</th>
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
                    <td>{paidStatusChip(row)}</td>
                    <td>
                      {paid && row.payment_image_url ? (
                        <a className="maintenance-finance-proof-link-transport-finance" href={row.payment_image_url} target="_blank" rel="noreferrer">
                          View proof
                        </a>
                      ) : (
                        <div className="maintenance-finance-proof-grid-transport-finance">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const dataUri = await fileToDataUri(file);
                                setProofById((prev) => ({ ...prev, [row.id]: { dataUri, fileName: file.name } }));
                              } catch (error) {
                                setMaintenanceNotice({
                                  open: true,
                                  title: 'Error',
                                  message: error?.message || 'Failed to load proof file',
                                  tone: 'error',
                                });
                              }
                            }}
                          />
                          <small className="maintenance-finance-proof-filename-transport-finance">
                            {proofById[row.id]?.fileName || 'No file selected'}
                          </small>
                          <input
                            type="text"
                            placeholder="Payment note (optional)"
                            value={noteById[row.id] || ''}
                            onChange={(e) => setNoteById((prev) => ({ ...prev, [row.id]: e.target.value }))}
                            className="maintenance-finance-text-input-transport-finance"
                          />
                        </div>
                      )}
                    </td>
                    <td>
                      {hrStatus !== 'a' ? (
                        <span className="maintenance-finance-muted-transport-finance">Awaiting HR</span>
                      ) : financeStatus === 'p' ? (
                        <div className="maintenance-finance-actions-row-transport-finance">
                          <button type="button" className="maintenance-finance-btn-outline-transport-finance" disabled={deciding} onClick={() => onFinanceDecision(row, 'a')}>
                            Finance Approve
                          </button>
                          <button type="button" className="maintenance-finance-btn-secondary-transport-finance" disabled={deciding} onClick={() => onFinanceDecision(row, 'd')}>
                            Finance Decline
                          </button>
                        </div>
                      ) : financeStatus === 'a' && !paid ? (
                        <button type="button" className="maintenance-finance-btn-outline-transport-finance" disabled={markingPaid} onClick={() => onMarkPaid(row)}>
                          Mark Paid
                        </button>
                      ) : (
                        <span className="maintenance-finance-muted-transport-finance">Completed</span>
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
    </div>
  );
}

export default MaintenanceFinance;
