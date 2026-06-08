import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bars } from 'react-loader-spinner';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  parse,
} from 'date-fns';
import { useGetMissionTypesQuery, useGetCropTypesQuery } from '../../../api/services/allEndpoints';
import {
  useGetPlantationMonthlyPlanRequestByIdQuery,
  useGetPlantationMonthlyPlanRequestCalendarContextQuery,
  useApprovePlantationMonthlyPlanRequestMutation,
  useDeclinePlantationMonthlyPlanRequestMutation,
} from '../../../api/services NodeJs/plantationDashboardApi';
import { withCurrentWingSearch } from '../../../config/wingRouteGuard';
import {
  formatTargetMonthLabel,
  mapMonthlyDetailLines,
  approveMonthlyPlanRequest,
  declineMonthlyPlanRequest,
} from '../plantation-plan-requests/plantationMonthlyPlanApproval';
import '../../../styles/requestProceed.css';
import '../../../styles/monthlyRequestProceed.css';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MonthlyRequestProceed() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestId = location.state?.requestId;

  const { data: detailPayload, isLoading, isError, refetch } = useGetPlantationMonthlyPlanRequestByIdQuery(
    requestId,
    { skip: !requestId }
  );
  const { data: calendarPayload } = useGetPlantationMonthlyPlanRequestCalendarContextQuery(requestId, {
    skip: !requestId,
  });
  const { data: missionTypesRaw } = useGetMissionTypesQuery();
  const { data: cropTypesRaw } = useGetCropTypesQuery();

  const [approveMutation] = useApprovePlantationMonthlyPlanRequestMutation();
  const [declineMutation] = useDeclinePlantationMonthlyPlanRequestMutation();

  const detail = detailPayload?.data ?? detailPayload;
  const calendarContext = calendarPayload?.data ?? calendarPayload;

  const initialLines = useMemo(
    () => mapMonthlyDetailLines(detail?.lines, { missionTypes: missionTypesRaw, cropTypes: cropTypesRaw }),
    [detail?.lines, missionTypesRaw, cropTypesRaw]
  );

  const [lineState, setLineState] = useState([]);
  const [highlightDate, setHighlightDate] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDecline, setShowDecline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setLineState(initialLines);
  }, [initialLines]);

  const targetYm = detail?.target_year_month || '';
  const monthLabel = formatTargetMonthLabel(targetYm);

  const calendarDays = useMemo(() => {
    if (!targetYm) return { days: [], startPadding: 0 };
    const monthDate = parse(`${targetYm}-01`, 'yyyy-MM-dd', new Date());
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });
    return { days, startPadding: getDay(start) };
  }, [targetYm]);

  const existingByDate = calendarContext?.existingPlansByDate || {};

  const linesByDate = useMemo(() => {
    const map = new Map();
    lineState.forEach((line) => {
      const key = line.picked_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(line);
    });
    return map;
  }, [lineState]);

  const selectedPlanTotal = useMemo(
    () =>
      lineState.reduce((sum, l) => (l.ops_selected ? sum + (parseInt(l.approved_plan_count, 10) || 0) : sum), 0),
    [lineState]
  );

  const handleLineToggle = (lineId, checked) => {
    setLineState((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, ops_selected: checked } : l))
    );
  };

  const handleCountChange = (lineId, value) => {
    const n = parseInt(value, 10);
    setLineState((prev) =>
      prev.map((l) =>
        l.lineId === lineId
          ? { ...l, approved_plan_count: Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : 0 }
          : l
      )
    );
  };

  const markAll = (selected) => {
    setLineState((prev) =>
      prev.map((l) => ({
        ...l,
        ops_selected: selected,
        approved_plan_count: selected ? l.requested_plan_count : l.approved_plan_count,
      }))
    );
  };

  const handleApprove = async () => {
    setMessage('');
    setBusy(true);
    try {
      const result = await approveMonthlyPlanRequest({
        id: requestId,
        lines: lineState,
        approveMutation,
      });
      if (!result.ok) {
        setMessage(result.error || 'Approval failed');
        return;
      }
      setMessage(`Created ${result.plansCreated} plan(s).`);
      setTimeout(() => {
        navigate(withCurrentWingSearch('/home/requestsQueue', location.search));
      }, 800);
    } catch (e) {
      setMessage(e?.data?.message || e?.message || 'Approval failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDecline = async () => {
    setMessage('');
    setBusy(true);
    try {
      await declineMonthlyPlanRequest({
        id: requestId,
        declineMutation,
        declineReason,
      });
      navigate(withCurrentWingSearch('/home/requestsQueue', location.search));
    } catch (e) {
      setMessage(e?.data?.message || e?.message || 'Decline failed');
    } finally {
      setBusy(false);
    }
  };

  if (!requestId) {
    return (
      <div className="wrapper-req-proceed">
        <p>No request selected.</p>
        <button type="button" onClick={() => navigate(withCurrentWingSearch('/home/requestsQueue', location.search))}>
          Back to queue
        </button>
      </div>
    );
  }

  return (
    <div className="wrapper-req-proceed">
      <div className="header-req-proceed">
        <button
          type="button"
          className="back-btn-req-proceed"
          disabled={isNavigating}
          onClick={() => {
            setIsNavigating(true);
            navigate(withCurrentWingSearch('/home/requestsQueue', location.search));
          }}
          aria-label="Back"
        >
          {isNavigating ? (
            <Bars height="16" width="16" color="#004b71" ariaLabel="loading" visible />
          ) : (
            <svg className="back-icon-req-proceed" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          )}
        </button>
        <div className="center-header-req-proceed">
          <div className="heading-req-proceed">Monthly Request Proceed</div>
          <div className="monthly-proceed-subtitle">{monthLabel}</div>
        </div>
      </div>

      {isLoading && (
        <div className="loading-req-proceed">
          <Bars height="30" width="30" color="#003057" visible />
          <span>Loading request...</span>
        </div>
      )}
      {isError && (
        <div className="error-req-proceed">
          Failed to load request.{' '}
          <button type="button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && detail && (
        <div className="monthly-proceed-layout">
          <div className="monthly-proceed-left">
            <div className="monthly-proceed-summary">
              <div className="monthly-proceed-summary-row">
                <span className="label">Estate</span>
                <span>{detail.estate_name || `#${detail.estate_id}`}</span>
              </div>
              <div className="monthly-proceed-summary-row">
                <span className="label">Target month</span>
                <span>{monthLabel}</span>
              </div>
              <div className="monthly-proceed-summary-row">
                <span className="label">Requester</span>
                <span>{detail.requester_name || '—'}</span>
              </div>
              <div className="monthly-proceed-summary-row">
                <span className="label">Submitted</span>
                <span>{detail.requested_at || '—'}</span>
              </div>
              <div className="monthly-proceed-summary-row">
                <span className="label">Requested</span>
                <span>
                  {detail.total_requested_lines} lines · {detail.total_requested_plans} plans
                </span>
              </div>
            </div>

            <div className="monthly-proceed-line-actions">
              <button type="button" className="monthly-proceed-mark-btn" onClick={() => markAll(true)}>
                Mark all
              </button>
              <button type="button" className="monthly-proceed-mark-btn secondary" onClick={() => markAll(false)}>
                Clear all
              </button>
            </div>

            <div className="monthly-proceed-lines">
              {lineState.map((line) => (
                <div
                  key={line.lineId}
                  className={`monthly-proceed-line ${line.ops_selected ? 'selected' : ''} ${
                    highlightDate === line.picked_date ? 'highlight' : ''
                  }`}
                >
                  <label className="monthly-proceed-line-check">
                    <input
                      type="checkbox"
                      checked={line.ops_selected}
                      onChange={(e) => handleLineToggle(line.lineId, e.target.checked)}
                    />
                    <span>
                      {line.picked_date} · {line.mission_label} · {line.crop_label}
                    </span>
                  </label>
                  <div className="monthly-proceed-line-count">
                    <span>Req {line.requested_plan_count}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={line.approved_plan_count ?? line.requested_plan_count}
                      disabled={!line.ops_selected}
                      onChange={(e) => handleCountChange(line.lineId, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="monthly-proceed-footer">
              <div className="monthly-proceed-selected-total">
                Selected plans: <strong>{selectedPlanTotal}</strong>
              </div>
              {message ? <div className="monthly-proceed-message">{message}</div> : null}
              <div className="monthly-proceed-action-row">
                <button type="button" className="monthly-proceed-decline-btn" onClick={() => setShowDecline((v) => !v)}>
                  Decline
                </button>
                <button
                  type="button"
                  className="monthly-proceed-approve-btn"
                  disabled={busy || selectedPlanTotal < 1}
                  onClick={handleApprove}
                >
                  {busy ? 'Approving…' : 'Approve selected'}
                </button>
              </div>
              {showDecline ? (
                <div className="monthly-proceed-decline-box">
                  <textarea
                    placeholder="Decline reason (optional)"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    rows={3}
                  />
                  <button type="button" disabled={busy} onClick={handleDecline}>
                    Confirm decline
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="monthly-proceed-right">
            <div className="monthly-proceed-calendar-head">{monthLabel}</div>
            <div className="monthly-proceed-legend">
              <span className="legend existing">Existing plans</span>
              <span className="legend selected">Selected</span>
              <span className="legend unselected">Unselected</span>
            </div>
            <div className="monthly-proceed-weekdays">
              {weekDays.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="monthly-proceed-grid">
              {Array.from({ length: calendarDays.startPadding }).map((_, i) => (
                <div key={`pad-${i}`} className="monthly-proceed-day empty" />
              ))}
              {calendarDays.days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const existing = existingByDate[dateKey] || [];
                const requestedLines = linesByDate.get(dateKey) || [];
                const selectedLines = requestedLines.filter((l) => l.ops_selected);
                const hasExisting = existing.length > 0;
                const hasSelected = selectedLines.length > 0;
                const hasUnselected = requestedLines.some((l) => !l.ops_selected);

                let cellClass = 'monthly-proceed-day';
                if (hasExisting) cellClass += ' has-existing';
                if (hasSelected) cellClass += ' has-selected';
                else if (hasUnselected) cellClass += ' has-unselected';
                if (highlightDate === dateKey) cellClass += ' focused';

                const badgeSpy = (lines, field) =>
                  lines
                    .filter((l) => String(l.mission_type_id || '').toLowerCase() === 'spy')
                    .reduce((s, l) => s + (parseInt(l[field], 10) || 0), 0);
                const badgeSpd = (lines, field) =>
                  lines
                    .filter((l) => String(l.mission_type_id || '').toLowerCase() === 'spd')
                    .reduce((s, l) => s + (parseInt(l[field], 10) || 0), 0);
                const countField = selectedLines.length > 0 ? 'approved_plan_count' : 'requested_plan_count';
                const countLines = selectedLines.length > 0 ? selectedLines : requestedLines;
                const spyN = badgeSpy(countLines, countField);
                const spdN = badgeSpd(countLines, countField);
                const badge =
                  spyN > 0 && spdN > 0 ? `${spyN}+${spdN}` : String(spyN + spdN || 0);
                const badgeDisplay = requestedLines.length > 0 && badge !== '0' ? badge : null;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={cellClass}
                    onClick={() => setHighlightDate(dateKey)}
                  >
                    <span className="day-num">{format(day, 'd')}</span>
                    {badgeDisplay ? <span className="day-badge">{badgeDisplay}</span> : null}
                    {hasExisting ? <span className="day-existing-dot">{existing.length}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlyRequestProceed;
