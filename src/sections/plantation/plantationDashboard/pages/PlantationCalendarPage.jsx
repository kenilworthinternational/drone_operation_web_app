import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlantationCalendar from '../components/PlantationCalendar';
import {
  useGetPlantationPlanRequestsEstateMonthQuery,
  useGetPlantationPlanRequestMonthStatsQuery,
} from '../../../../api/services NodeJs/plantationDashboardApi';
import { useGetMissionTypesQuery, useGetCropTypesQuery } from '../../../../api/services/allEndpoints';
import { Bars } from 'react-loader-spinner';
import '../../../../styles/plantationDashboard.css';
import { getUserData, hasHierarchyForPlantationPlanRequest } from '../../../../utils/authUtils';

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

function originalRequestedSlots(row) {
  if (row == null) return 0;
  const raw =
    row.requested_plan_count != null && row.requested_plan_count !== ''
      ? row.requested_plan_count
      : row.plan_count;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

function finalApprovedSlotsDisplay(row) {
  const s = String(row.status || '').toLowerCase();
  if (s === 'approved') return String(parseInt(row.plan_count, 10) || 0);
  return '—';
}


const PlantationCalendarPage = ({ basePath = '/home/plantation-dashboard' } = {}) => {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState('All');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewRequestsOpen, setViewRequestsOpen] = useState(false);

  const missionType =
    selectedAction === 'Spray' ? 'spy' : selectedAction === 'Spread' ? 'spd' : 'all';

  const userData = getUserData();
  const enablePlanRequestUi =
    basePath === '/home/plantation-dashboard' && hasHierarchyForPlantationPlanRequest(userData);

  const yearMonth = useMemo(
    () => `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`,
    [currentMonth]
  );

  const { data: estateMonthRaw, isFetching: estateMonthLoading } = useGetPlantationPlanRequestsEstateMonthQuery(
    { yearMonth },
    { skip: !viewRequestsOpen || !enablePlanRequestUi }
  );
  const estateMonthRows = Array.isArray(estateMonthRaw?.data) ? estateMonthRaw.data : [];

  const { data: monthStatsRes, isFetching: modalStatsLoading } = useGetPlantationPlanRequestMonthStatsQuery(
    { yearMonth },
    { skip: !viewRequestsOpen || !enablePlanRequestUi }
  );
  const monthStats = monthStatsRes?.data;

  const { data: missionTypesRaw } = useGetMissionTypesQuery(undefined, { skip: !viewRequestsOpen || !enablePlanRequestUi });
  const { data: cropTypesRaw } = useGetCropTypesQuery(undefined, { skip: !viewRequestsOpen || !enablePlanRequestUi });
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

  return (
    <div className="plantation-dashboard-container">
      <div className="plantation-page-header">
        <button className="plantation-back-btn" onClick={() => navigate(basePath)}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="plantation-page-title">Calendar</h1>
      </div>

      <div className="plantation-page-content">
        {basePath === '/home/plantation-dashboard' && !hasHierarchyForPlantationPlanRequest(userData) && (
          <p className="plantation-plan-request-hierarchy-hint" role="status">
            Plan requests (month stats, day markers, and new requests) need your profile to include{' '}
            <strong>Group</strong>, <strong>Plantation</strong>, <strong>Region</strong>, and{' '}
            <strong>Estate</strong>. An estate is required — contact admin if any field is missing.
          </p>
        )}
        {/* Mission type: all spray plans, all spread plans, or both */}
        <div className="plantation-action-section">
          <div className="plantation-actions-row plantation-actions-row--split">
            <div className="plantation-actions-mission-group">
              <span className="plantation-charts-control-label">Mission Type:</span>
              <button
                type="button"
                className={`plantation-action-btn ${selectedAction === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedAction('All')}
              >
                All
              </button>
              <button
                type="button"
                className={`plantation-action-btn ${selectedAction === 'Spray' ? 'active' : ''}`}
                onClick={() => setSelectedAction('Spray')}
              >
                Spray
              </button>
              <button
                type="button"
                className={`plantation-action-btn ${selectedAction === 'Spread' ? 'active' : ''}`}
                onClick={() => setSelectedAction('Spread')}
              >
                Spread
              </button>
            </div>
            {enablePlanRequestUi && (
              <button
                type="button"
                className="plantation-view-requests-btn"
                onClick={() => setViewRequestsOpen(true)}
              >
                View requests
              </button>
            )}
          </div>
        </div>

        <PlantationCalendar
          missionType={missionType}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          enablePlanRequestUi={enablePlanRequestUi}
        />
      </div>

      {viewRequestsOpen && enablePlanRequestUi && (
        <div
          className="plantation-calendar-request-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plantation-estate-month-req-title"
          onClick={() => setViewRequestsOpen(false)}
        >
          <div
            className="plantation-calendar-request-modal plantation-plan-requests-list-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="plantation-calendar-request-modal-header">
              <span id="plantation-estate-month-req-title">
                Plan requests — {yearMonth}
              </span>
              <button
                type="button"
                className="plantation-plan-modal-close"
                onClick={() => setViewRequestsOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="plantation-plan-requests-list-body">
              {(estateMonthLoading || modalStatsLoading) && (
                <div className="plantation-plan-requests-list-loading">
                  <Bars height="32" width="32" color="#2d8659" />
                  <span>Loading…</span>
                </div>
              )}
              {!estateMonthLoading && !modalStatsLoading && (
                <>
                  <div className="plantation-estate-req-summary-plat" aria-live="polite">
                    <div className="plantation-estate-req-stat-plat">
                      <span className="plantation-estate-req-stat-val-plat">{monthStats?.totalRequests ?? 0}</span>
                      <span className="plantation-estate-req-stat-lbl-plat">Requests (picked in month)</span>
                      <span className="plantation-estate-req-stat-sub-plat">All statuses</span>
                    </div>
                    <div className="plantation-estate-req-stat-plat plantation-estate-req-stat-plat--accent">
                      <span className="plantation-estate-req-stat-val-plat">{monthStats?.acceptedCount ?? 0}</span>
                      <span className="plantation-estate-req-stat-lbl-plat">Approved</span>
                      <span className="plantation-estate-req-stat-sub-plat">
                        {monthStats?.acceptedPlanUnits ?? 0} plan slot
                        {(monthStats?.acceptedPlanUnits ?? 0) === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="plantation-estate-req-stat-plat">
                      <span className="plantation-estate-req-stat-val-plat">{monthStats?.declinedCount ?? 0}</span>
                      <span className="plantation-estate-req-stat-lbl-plat">Declined</span>
                      <span className="plantation-estate-req-stat-spacer-plat" aria-hidden />
                    </div>
                    <div className="plantation-estate-req-stat-plat">
                      <span className="plantation-estate-req-stat-val-plat">{monthStats?.pendingCount ?? 0}</span>
                      <span className="plantation-estate-req-stat-lbl-plat">Still pending</span>
                      <span className="plantation-estate-req-stat-spacer-plat" aria-hidden />
                    </div>
                  </div>
                  <p className="plantation-estate-req-summary-line-plat">
                    Plan slots requested (total): <strong>{monthStats?.totalPlanUnits ?? 0}</strong>
                    <span className="plantation-estate-req-dot-plat" aria-hidden>
                      ·
                    </span>
                    Approved (created): <strong>{monthStats?.acceptedPlanUnits ?? 0}</strong>
                  </p>
                </>
              )}
              {!estateMonthLoading && estateMonthRows.length === 0 && (
                <p className="plantation-plan-requests-list-empty">No requests for this month.</p>
              )}
              {!estateMonthLoading && estateMonthRows.length > 0 && (
                <div className="plantation-plan-requests-table-wrap">
                  <table className="plantation-plan-requests-table plantation-plan-requests-table--detail">
                    <thead>
                      <tr>
                        <th>Picked date</th>
                        <th>Req. slots</th>
                        <th>Approved slots</th>
                        <th>Mission</th>
                        <th>Crop</th>
                        <th>Status</th>
                        <th>Requested by</th>
                        <th>Submitted</th>
                        <th>Reviewed by</th>
                        <th>Reviewed at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estateMonthRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.picked_date}</td>
                          <td>{originalRequestedSlots(row)}</td>
                          <td>{finalApprovedSlotsDisplay(row)}</td>
                          <td>{missionLabel(row.mission_type_id)}</td>
                          <td>{cropLabel(row.crop_type_id)}</td>
                          <td>
                            <span
                              className={`plantation-req-status plantation-req-status--${String(row.status || '').toLowerCase()}`}
                            >
                              {row.status || '—'}
                            </span>
                          </td>
                          <td>{row.requester_name || '—'}</td>
                          <td className="plantation-plan-req-muted-plat">{row.created_at || '—'}</td>
                          <td>{row.reviewed_by_name || '—'}</td>
                          <td className="plantation-plan-req-muted-plat">{row.reviewed_at || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" newestOnTop />
    </div>
  );
};

export default PlantationCalendarPage;
