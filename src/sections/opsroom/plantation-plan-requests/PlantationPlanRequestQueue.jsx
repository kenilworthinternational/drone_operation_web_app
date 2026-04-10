import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaCheck, FaHistory, FaTimes } from 'react-icons/fa';
import { Bars } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import { format, parse } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';
import {
  useGetPlantationPlanRequestsListQuery,
  useDeclinePlantationPlanRequestMutation,
  useMarkPlantationPlanRequestApprovedMutation,
  useLazyGetCalendarPlansQuery,
} from '../../../api/services NodeJs/plantationDashboardApi';
import { baseApi, useGetMissionTypesQuery, useGetCropTypesQuery } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import './plantationPlanRequestQueue.css';

function normalizeDropdownList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object' && (raw.status === 'true' || raw.status === true)) {
    return Object.keys(raw)
      .filter((k) => !isNaN(Number(k)) && k !== 'status' && k !== 'count')
      .map((k) => raw[k]);
  }
  if (typeof raw === 'object') {
    return Object.keys(raw)
      .filter((k) => !isNaN(Number(k)))
      .map((k) => raw[k]);
  }
  return [];
}

function ymFromPicked(picked) {
  const s = String(picked || '');
  return s.length >= 7 ? s.slice(0, 7) : '';
}

/** Original plan slots requested (immutable after submit); falls back to plan_count for older rows. */
function originalRequestedSlots(row) {
  if (row == null) return 0;
  const raw =
    row.requested_plan_count != null && row.requested_plan_count !== ''
      ? row.requested_plan_count
      : row.plan_count;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

function formatPlanDay(pickedDateVal) {
  if (pickedDateVal == null) return '';
  if (typeof pickedDateVal === 'string') return pickedDateVal.slice(0, 10);
  try {
    return format(new Date(pickedDateVal), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

const PlantationPlanRequestQueue = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const dispatch = useAppDispatch();
  const go = (path) => navigate({ pathname: path, search: routerLocation.search });

  const {
    data: listPayload,
    isLoading: pendingLoading,
    isFetching: pendingFetching,
    error: listError,
    refetch: refetchPending,
    isError,
  } = useGetPlantationPlanRequestsListQuery(
    { status: 'pending' },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      staleTime: 0,
    }
  );

  const {
    data: allHistoryPayload,
    isLoading: historyLoading,
    isFetching: historyFetching,
    refetch: refetchHistory,
  } = useGetPlantationPlanRequestsListQuery(
    { status: 'all', limit: 500 },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      staleTime: 0,
    }
  );

  const [triggerCalendarPlans, calendarPlansResult] = useLazyGetCalendarPlansQuery();

  const rows = useMemo(() => (Array.isArray(listPayload) ? listPayload : []), [listPayload]);
  const allRows = useMemo(() => (Array.isArray(allHistoryPayload) ? allHistoryPayload : []), [allHistoryPayload]);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyMonthYm, setHistoryMonthYm] = useState(() => format(new Date(), 'yyyy-MM'));

  const historyMonthLabel = useMemo(() => {
    try {
      return format(parse(`${historyMonthYm}-01`, 'yyyy-MM-dd', new Date()), 'MMMM yyyy');
    } catch {
      return historyMonthYm;
    }
  }, [historyMonthYm]);

  const historyForSelectedMonth = useMemo(
    () =>
      allRows
        .filter(
          (r) =>
            ['approved', 'declined'].includes(String(r.status || '').toLowerCase()) &&
            ymFromPicked(r.picked_date) === historyMonthYm
        )
        .sort((a, b) => {
          const da = String(a.picked_date || '');
          const db = String(b.picked_date || '');
          if (da !== db) return db.localeCompare(da);
          return (b.id || 0) - (a.id || 0);
        }),
    [allRows, historyMonthYm]
  );

  const historyMonthStats = useMemo(() => {
    const st = (r) => String(r.status || '').toLowerCase();
    const inMonth = allRows.filter((r) => ymFromPicked(r.picked_date) === historyMonthYm);
    const requestedRows = inMonth.length;
    const approvedRows = inMonth.filter((r) => st(r) === 'approved').length;
    const declinedRows = inMonth.filter((r) => st(r) === 'declined').length;
    const pendingRows = inMonth.filter((r) => st(r) === 'pending').length;
    const planUnitsApproved = inMonth
      .filter((r) => st(r) === 'approved')
      .reduce((acc, r) => acc + (parseInt(r.plan_count, 10) || 0), 0);
    return {
      requestedRows,
      approvedRows,
      declinedRows,
      pendingRows,
      planUnitsApproved,
    };
  }, [allRows, historyMonthYm]);

  const { data: missionTypesRaw } = useGetMissionTypesQuery();
  const { data: cropTypesRaw } = useGetCropTypesQuery();
  const missionTypes = useMemo(() => normalizeDropdownList(missionTypesRaw), [missionTypesRaw]);
  const cropTypes = useMemo(() => normalizeDropdownList(cropTypesRaw), [cropTypesRaw]);

  const missionLabel = (idOrCode) => {
    const key = String(idOrCode ?? '');
    const m = missionTypes.find(
      (x) =>
        String(x.id) === key ||
        String(x.mission_type_code ?? '').toLowerCase() === key.toLowerCase()
    );
    return m?.mission_type_name || m?.mission_type || idOrCode || '—';
  };
  const cropLabel = (id) => {
    const c = cropTypes.find((x) => String(x.id) === String(id));
    return c?.crop || c?.name || `#${id}`;
  };

  const [busyId, setBusyId] = useState(null);
  const [editablePlanCounts, setEditablePlanCounts] = useState({});
  const [dateModalRow, setDateModalRow] = useState(null);

  const [declineMutation] = useDeclinePlantationPlanRequestMutation();
  const [markApprovedMutation] = useMarkPlantationPlanRequestApprovedMutation();

  const calendarRaw = calendarPlansResult?.data;
  const calendarPlans = useMemo(() => {
    const inner = calendarRaw?.data;
    return Array.isArray(inner) ? inner : [];
  }, [calendarRaw]);

  /** All booking plans on the clicked date (any estate) — same month payload as plantation calendar. */
  const plansForModalDay = useMemo(() => {
    if (!dateModalRow) return [];
    const day = String(dateModalRow.picked_date || '').slice(0, 10);
    return calendarPlans.filter((p) => formatPlanDay(p.pickedDate ?? p.picked_date) === day);
  }, [calendarPlans, dateModalRow]);

  /** Count of plans per estate for that day, sorted by estate name. */
  const estatePlanCountsForModalDay = useMemo(() => {
    const map = new Map();
    plansForModalDay.forEach((p) => {
      const eid = Number(p.estateId ?? p.estate_id);
      const name = p.estate_name || (Number.isFinite(eid) ? `Estate #${eid}` : 'Unknown estate');
      const key = Number.isFinite(eid) ? `id:${eid}` : `name:${name}`;
      if (!map.has(key)) {
        map.set(key, { estateId: eid, estateName: name, count: 0 });
      }
      map.get(key).count += 1;
    });
    return Array.from(map.values()).sort((a, b) =>
      String(a.estateName).localeCompare(String(b.estateName), undefined, { sensitivity: 'base' })
    );
  }, [plansForModalDay]);

  const otherPendingSameDay = useMemo(() => {
    if (!dateModalRow) return 0;
    const day = String(dateModalRow.picked_date || '').slice(0, 10);
    const eid = Number(dateModalRow.estate_id);
    return rows.filter(
      (r) =>
        r.id !== dateModalRow.id &&
        String(r.picked_date || '').slice(0, 10) === day &&
        Number(r.estate_id) === eid
    ).length;
  }, [dateModalRow, rows]);

  useEffect(() => {
    if (!dateModalRow) return;
    const ym = ymFromPicked(dateModalRow.picked_date);
    if (!ym) return;
    triggerCalendarPlans({ yearMonth: ym, missionType: 'all' });
  }, [dateModalRow, triggerCalendarPlans]);

  useEffect(() => {
    const next = {};
    rows.forEach((r) => {
      next[r.id] = String(parseInt(r.plan_count, 10) || 1);
    });
    setEditablePlanCounts(next);
  }, [rows]);

  const refetchAll = () => {
    refetchPending();
    refetchHistory();
  };

  /** Decline uses confirm() only — no `declineId` / reason modal state. */
  const handleDecline = async (requestId) => {
    if (!window.confirm('Decline this request? No plans will be created.')) return;
    setBusyId(requestId);
    try {
      await declineMutation({ id: requestId, declineReason: '' }).unwrap();
      toast.success('Request declined.');
      refetchAll();
    } catch (e) {
      toast.error(e?.data?.message || e?.message || 'Decline failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (row) => {
    const id = row.id;
    setBusyId(id);
    let created = 0;
    const n = parseInt(editablePlanCounts[id] ?? row.plan_count, 10) || 0;
    if (!Number.isFinite(n) || n < 1 || n > 100) {
      toast.error('Plan count must be between 1 and 100.');
      setBusyId(null);
      return;
    }
    try {
      for (let i = 0; i < n; i += 1) {
        const submissionData = {
          flag: 'np',
          missionId: 0,
          estateId: row.estate_id,
          groupId: row.group_id,
          regionId: row.region_id,
          plantationId: row.plantation_id,
          missionTypeId: row.mission_type_id,
          cropTypeId: row.crop_type_id,
          totalExtent: '0.00',
          pickedDate: row.picked_date,
          divisions: [],
        };
        const createResult = await dispatch(baseApi.endpoints.createPlan.initiate(submissionData));
        const result = createResult.data;
        if (result?.status === 'true' || result?.status === true) {
          created += 1;
        } else {
          toast.error(`Plan ${i + 1} failed to create. Stopped.`);
          break;
        }
      }
      if (created === n && n > 0) {
        await markApprovedMutation({ id, planCount: n }).unwrap();
        toast.success(`Approved: ${created} plan(s) created.`);
        refetchAll();
      } else if (n === 0) {
        toast.error('Invalid plan count.');
      }
    } catch (e) {
      toast.error(e?.data?.message || e?.message || 'Approval failed.');
    } finally {
      setBusyId(null);
    }
  };

  const statusBadgeClass = (st) => {
    const s = String(st || '').toLowerCase();
    if (s === 'approved') return 'status-badge-plat-req-plantation status-approved-plat-req-plantation';
    if (s === 'declined') return 'status-badge-plat-req-plantation status-declined-plat-req-plantation';
    if (s === 'pending') return 'status-badge-plat-req-plantation status-pending-plat-req-plantation';
    return 'status-badge-plat-req-plantation';
  };

  const formatReviewedAt = (v) => {
    if (v == null || v === '') return '—';
    const s = String(v);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 16).replace('T', ' ');
    return s;
  };

  const renderHistoryTable = (list, emptyMsg) => {
    if (historyLoading || historyFetching) {
      return (
        <div className="history-loading-plat-req-plantation">
          <Bars height={32} width={32} color="#2d8659" />
          <span>Loading history…</span>
        </div>
      );
    }
    if (list.length === 0) {
      return <p className="history-empty-plat-req-plantation">{emptyMsg}</p>;
    }
    return (
      <div className="table-wrap-plat-req-plantation">
        <table className="table-plat-req-plantation table-history-plat-req-plantation">
          <thead>
            <tr>
              <th>ID</th>
              <th>Picked date</th>
              <th>Estate</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Approved</th>
              <th>Crop</th>
              <th>Mission</th>
              <th>Requested by</th>
              <th>Reviewed by</th>
              <th>Reviewed at</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={`h-${row.id}`}>
                <td>{row.id}</td>
                <td>
                  <button
                    type="button"
                    className="date-link-plat-req-plantation"
                    onClick={() => setDateModalRow(row)}
                  >
                    {row.picked_date}
                  </button>
                </td>
                <td>{row.estate_name || row.estate_id}</td>
                <td>
                  <span className={statusBadgeClass(row.status)}>{row.status || '—'}</span>
                </td>
                <td>{originalRequestedSlots(row)}</td>
                <td>
                  {String(row.status || '').toLowerCase() === 'approved'
                    ? parseInt(row.plan_count, 10) || 0
                    : '—'}
                </td>
                <td>{cropLabel(row.crop_type_id)}</td>
                <td>{missionLabel(row.mission_type_id)}</td>
                <td>{row.requester_name || '—'}</td>
                <td>{row.reviewed_by_name || '—'}</td>
                <td className="cell-muted-plat-req-plantation">{formatReviewedAt(row.reviewed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="page-plat-req-plantation">
      <div className="header-plat-req-plantation header-bar-plat-req-plantation">
        <div className="header-start-plat-req-plantation">
          <button type="button" className="back-btn-plat-req-plantation" onClick={() => go('/home/workflowDashboard')}>
            <FaArrowLeft /> Back
          </button>
          <h1 className="title-plat-req-plantation">Plantation calendar plan requests</h1>
        </div>
        <button
          type="button"
          className="btn-history-top-plat-req-plantation"
          onClick={() => {
            setHistoryMonthYm(format(new Date(), 'yyyy-MM'));
            setHistoryOpen(true);
          }}
        >
          <FaHistory aria-hidden /> History
        </button>
      </div>
      <p className="intro-plat-req-plantation">
        Pending requests from estate users on the plantation calendar. Approve to create empty plans (no field selection) via the same flow as Create Bookings.
        Decline to reject without creating plans. Click a date to see all booking plans on that day (every estate), with counts per estate.
      </p>

      <h2 className="section-title-plat-req-plantation">Pending approval</h2>
      {(pendingLoading || pendingFetching) && rows.length === 0 && (
        <div className="loading-plat-req-plantation">
          <Bars height={40} width={40} color="#2d8659" />
          <span>Loading requests…</span>
        </div>
      )}

      {(listError || isError) && (
        <div className="error-plat-req-plantation">
          Failed to load requests.
          {listError?.data?.message || listError?.error || listError?.message
            ? ` (${String(listError?.data?.message || listError?.error || listError?.message)})`
            : ''}
        </div>
      )}

      {!pendingLoading && !pendingFetching && !listError && !isError && rows.length === 0 && (
        <p className="empty-plat-req-plantation">No pending plantation plan requests.</p>
      )}

      {!listError && !isError && rows.length > 0 && (
        <div className="table-wrap-plat-req-plantation">
          <table className="table-plat-req-plantation">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Estate</th>
                <th>Requested</th>
                <th>Approve #</th>
                <th>Crop</th>
                <th>Mission</th>
                <th>Requested by</th>
                <th className="th-actions-plat-req-plantation">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>
                    <button type="button" className="date-link-plat-req-plantation" onClick={() => setDateModalRow(row)}>
                      {row.picked_date}
                    </button>
                  </td>
                  <td>{row.estate_name || row.estate_id}</td>
                  <td className="cell-requested-plat-req-plantation">{originalRequestedSlots(row)}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="plan-count-input-plat-req-plantation"
                      value={editablePlanCounts[row.id] ?? String(row.plan_count ?? 1)}
                      title="Number of plans to create on approve (can be less than requested)"
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditablePlanCounts((prev) => ({ ...prev, [row.id]: val }));
                      }}
                      disabled={busyId != null}
                    />
                  </td>
                  <td>{cropLabel(row.crop_type_id)}</td>
                  <td>{missionLabel(row.mission_type_id)}</td>
                  <td>{row.requester_name || '—'}</td>
                  <td>
                    <div className="actions-row-plat-req-plantation">
                      <button
                        type="button"
                        className="btn-approve-plat-req-plantation"
                        disabled={busyId != null}
                        onClick={() => handleApprove(row)}
                      >
                        {busyId === row.id ? <Bars height={16} width={16} color="#fff" /> : <FaCheck />} Approve
                      </button>
                      <button
                        type="button"
                        className="btn-decline-plat-req-plantation"
                        disabled={busyId != null}
                        onClick={() => handleDecline(row.id)}
                      >
                        {busyId === row.id ? <Bars height={16} width={16} color="#fff" /> : <FaTimes />} Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {historyOpen && (
        <div className="modal-overlay-plat-req-plantation history-overlay-plat-req-plantation" onClick={() => setHistoryOpen(false)}>
          <div className="modal-panel-plat-req-plantation history-panel-plat-req-plantation" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head-plat-req-plantation">
              <h2 className="modal-heading-plat-req-plantation">History — {historyMonthLabel}</h2>
              <button type="button" className="modal-dismiss-plat-req-plantation" onClick={() => setHistoryOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="modal-main-plat-req-plantation history-modal-body-plat-req-plantation">
              <div className="history-month-row-plat-req-plantation">
                <span className="history-month-label-plat-req-plantation">Picked date in month</span>
                <div className="history-month-field-plat-req-plantation">
                  <span className="history-month-display-plat-req-plantation" aria-hidden>
                    {historyMonthLabel}
                  </span>
                  <FaCalendarAlt className="history-month-icon-plat-req-plantation" aria-hidden />
                  <input
                    type="month"
                    className="history-month-input-cover-plat-req-plantation"
                    value={historyMonthYm}
                    min="2020-01"
                    max="2035-12"
                    onChange={(e) => setHistoryMonthYm(e.target.value)}
                    aria-label="Picked date in month"
                  />
                </div>
              </div>
              {!historyLoading && !historyFetching && (
                <div className="history-stats-bar-plat-req-plantation" role="region" aria-label="Summary for selected month">
                  <div className="history-stat-card-plat-req-plantation">
                    <span className="history-stat-value-plat-req-plantation">{historyMonthStats.requestedRows}</span>
                    <span className="history-stat-label-plat-req-plantation">Requests (picked in month)</span>
                    <span className="history-stat-sub-plat-req-plantation">All statuses</span>
                  </div>
                  <div className="history-stat-card-plat-req-plantation history-stat-card-accent-plat-req-plantation">
                    <span className="history-stat-value-plat-req-plantation">{historyMonthStats.approvedRows}</span>
                    <span className="history-stat-label-plat-req-plantation">Approved</span>
                    <span className="history-stat-sub-plat-req-plantation">
                      {historyMonthStats.planUnitsApproved} plan slot{historyMonthStats.planUnitsApproved === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="history-stat-card-plat-req-plantation">
                    <span className="history-stat-value-plat-req-plantation">{historyMonthStats.declinedRows}</span>
                    <span className="history-stat-label-plat-req-plantation">Declined</span>
                    <span className="history-stat-sub-placeholder-plat-req-plantation" aria-hidden />
                  </div>
                  <div className="history-stat-card-plat-req-plantation">
                    <span className="history-stat-value-plat-req-plantation">{historyMonthStats.pendingRows}</span>
                    <span className="history-stat-label-plat-req-plantation">Still pending</span>
                    <span className="history-stat-sub-placeholder-plat-req-plantation" aria-hidden />
                  </div>
                </div>
              )}
              {(historyLoading || historyFetching) && (
                <p className="history-stats-loading-plat-req-plantation">Loading month summary…</p>
              )}
              <p className="history-hint-plat-req-plantation">
                Table below lists <strong>approved</strong> and <strong>declined</strong> only (picked date in this month). Opens on the current month by default.
              </p>
              {renderHistoryTable(
                historyForSelectedMonth,
                'No approved or declined requests for this month.'
              )}
              <div className="modal-footer-plat-req-plantation">
                <button type="button" className="btn-modal-cancel-plat-req-plantation" onClick={() => setHistoryOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dateModalRow != null && (
        <div className="modal-overlay-plat-req-plantation day-overlay-plat-req-plantation" onClick={() => setDateModalRow(null)}>
          <div className="modal-panel-plat-req-plantation day-panel-plat-req-plantation" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head-plat-req-plantation">
              <h2 className="modal-heading-plat-req-plantation">Plans on {dateModalRow.picked_date}</h2>
              <button type="button" className="modal-dismiss-plat-req-plantation" onClick={() => setDateModalRow(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="modal-main-plat-req-plantation">
              <p className="day-summary-plat-req-plantation">
                Request row estate:{' '}
                <strong>{dateModalRow.estate_name || `Estate #${dateModalRow.estate_id}`}</strong>
              </p>
              <p className="day-hint-plat-req-plantation">
                Below: all booking plans on this date (every estate), same data as the plantation calendar month view.
              </p>
              <p className="day-stats-plat-req-plantation">
                Total plans on this date (all estates):{' '}
                <strong>{calendarPlansResult.isLoading ? '…' : plansForModalDay.length}</strong>
                {estatePlanCountsForModalDay.length > 0 && (
                  <>
                    {' '}
                    · Estates with plans: <strong>{estatePlanCountsForModalDay.length}</strong>
                  </>
                )}
              </p>
              {otherPendingSameDay > 0 && (
                <p className="day-stats-plat-req-plantation">Other pending queue rows for this date &amp; same estate: {otherPendingSameDay}</p>
              )}
              {calendarPlansResult.isLoading && (
                <div className="history-loading-plat-req-plantation">
                  <Bars height={28} width={28} color="#2d8659" />
                  <span>Loading calendar plans…</span>
                </div>
              )}
              {calendarPlansResult.isError && (
                <p className="day-error-plat-req-plantation">
                  Could not load calendar plans. Try again or open the plantation calendar for this month.
                </p>
              )}
              {!calendarPlansResult.isLoading && !calendarPlansResult.isError && plansForModalDay.length === 0 && (
                <p className="day-empty-plat-req-plantation">No active plans in the booking calendar for this date (any estate).</p>
              )}
              {!calendarPlansResult.isLoading && !calendarPlansResult.isError && estatePlanCountsForModalDay.length > 0 && (
                <div className="day-estate-table-wrap-plat-req-plantation">
                  <p className="day-section-title-plat-req-plantation">Plans by estate</p>
                  <table className="day-estate-table-plat-req-plantation">
                    <thead>
                      <tr>
                        <th>Estate</th>
                        <th className="day-estate-th-num-plat-req-plantation">Plans</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estatePlanCountsForModalDay.map((row) => (
                        <tr
                          key={`${row.estateId}-${row.estateName}`}
                          className={
                            Number(dateModalRow.estate_id) === Number(row.estateId)
                              ? 'day-estate-row-highlight-plat-req-plantation'
                              : undefined
                          }
                        >
                          <td>{row.estateName}</td>
                          <td className="day-estate-td-num-plat-req-plantation">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!calendarPlansResult.isLoading && !calendarPlansResult.isError && plansForModalDay.length > 0 && (
                <>
                  <p className="day-section-title-plat-req-plantation">All plans on this date</p>
                  <ul className="day-plan-list-plat-req-plantation">
                    {plansForModalDay.map((p) => (
                      <li key={p.id} className="day-plan-item-plat-req-plantation">
                        <span className="day-plan-id-plat-req-plantation">Plan #{p.id}</span>
                        <span className="day-plan-meta-plat-req-plantation">
                          {missionLabel(p.mission_type_name || p.missionTypeId)} · {p.estate_name || `Estate #${p.estateId ?? p.estate_id}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="modal-footer-plat-req-plantation">
                <button type="button" className="btn-modal-cancel-plat-req-plantation" onClick={() => setDateModalRow(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" newestOnTop />
    </div>
  );
};

export default PlantationPlanRequestQueue;
