import React, { useCallback, useMemo, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  isSameMonth,
} from 'date-fns';
import { Bars } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import CustomDropdown from '../../../components/CustomDropdown';
import {
  useGetPlantationMonthlyPlanAcceptBoardQuery,
  useBulkApprovePlantationMonthlyPlanRequestsMutation,
  useBulkRejectPlantationMonthlyPlanRequestsMutation,
} from '../../../api/services NodeJs/plantationDashboardApi';
import {
  buildBulkApprovePayload,
  buildBulkRejectPayload,
} from '../../opsroom/plantation-plan-requests/plantationMonthlyPlanApproval';
import '../../../styles/acceptMonthlyPlansBoard.css';
import '../../../styles/bookingsCalender.css';
import '../../../styles/updateservices.css';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ALL_ESTATES = { id: '', group: 'All estates' };
const ALL_MISSIONS = { id: '', group: 'All missions' };
const ALL_CROPS = { id: '', group: 'All crops' };

function slotMatchesFilters(slot, { estateId, missionTypeId, cropTypeId }) {
  if (estateId && Number(slot.estateId) !== Number(estateId)) return false;
  if (missionTypeId) {
    const m = String(missionTypeId).toLowerCase();
    if (String(slot.missionTypeId || '').toLowerCase() !== m) return false;
  }
  if (cropTypeId && Number(slot.cropTypeId) !== Number(cropTypeId)) return false;
  return true;
}

function hasActiveFilters(filters) {
  return Boolean(filters.estateId || filters.missionTypeId || filters.cropTypeId);
}

export default function AcceptMonthlyPlansBoard({
  estates = [],
  missionTypes = [],
  cropTypes = [],
  currentMonth,
  onMonthChange,
  onApproved,
}) {
  const yearMonth = format(currentMonth, 'yyyy-MM');

  const [filterEstate, setFilterEstate] = useState(null);
  const [filterMission, setFilterMission] = useState(null);
  const [filterCrop, setFilterCrop] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const filters = useMemo(
    () => ({
      estateId: filterEstate?.id ?? null,
      missionTypeId: filterMission?.id ?? null,
      cropTypeId: filterCrop?.id ?? null,
    }),
    [filterEstate, filterMission, filterCrop]
  );

  const filtersActive = hasActiveFilters(filters);

  const { data: board, isLoading, isError, refetch, isFetching } =
    useGetPlantationMonthlyPlanAcceptBoardQuery({ yearMonth, status: 'open' });

  const [bulkApprove] = useBulkApprovePlantationMonthlyPlanRequestsMutation();
  const [bulkReject] = useBulkRejectPlantationMonthlyPlanRequestsMutation();

  const existingPlans = board?.existingPlans || [];
  const requestedSlots = board?.requestedSlots || [];
  const openRequestSlots = useMemo(
    () => requestedSlots.filter((slot) => slot.slotStatus !== 'approved'),
    [requestedSlots]
  );
  const pendingSlots = useMemo(
    () => openRequestSlots.filter((slot) => slot.slotStatus === 'pending'),
    [openRequestSlots]
  );

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const firstDayOfWeek = monthStart.getDay();

  const existingByDate = useMemo(() => {
    const map = new Map();
    for (const plan of existingPlans) {
      const d = plan.pickedDate;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(plan);
    }
    return map;
  }, [existingPlans]);

  const slotsByDate = useMemo(() => {
    const map = new Map();
    for (const slot of openRequestSlots) {
      const d = slot.pickedDate;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(slot);
    }
    return map;
  }, [openRequestSlots]);

  const toggleSlot = useCallback((slot) => {
    if (slot.slotStatus !== 'pending') return;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot.slotKey)) next.delete(slot.slotKey);
      else next.add(slot.slotKey);
      return next;
    });
  }, []);

  const selectAllFiltered = useCallback(() => {
    const next = new Set();
    for (const slot of pendingSlots) {
      if (!filtersActive || slotMatchesFilters(slot, filters)) {
        next.add(slot.slotKey);
      }
    }
    setSelectedSlots(next);
  }, [pendingSlots, filters, filtersActive]);

  const clearSelection = useCallback(() => setSelectedSlots(new Set()), []);

  const selectedCount = selectedSlots.size;

  const runApprove = async () => {
    const payload = buildBulkApprovePayload(requestedSlots, selectedSlots);
    if (!payload.requestApprovals?.length) {
      toast.error('Nothing selected to approve.', { position: 'top-center' });
      return;
    }
    setBusy(true);
    try {
      const result = await bulkApprove(payload).unwrap();
      const data = result?.data ?? result;
      const created = data?.totalPlansCreated ?? 0;
      const approved = data?.approvedRequestCount ?? 0;
      toast.success(`Approved ${approved} request(s), created ${created} plan(s).`, {
        position: 'top-center',
      });
      setSelectedSlots(new Set());
      setConfirmAction(null);
      await refetch();
      if (onApproved) await onApproved();
    } catch (e) {
      toast.error(e?.data?.message || e?.message || 'Bulk approval failed.', {
        position: 'top-center',
      });
    } finally {
      setBusy(false);
    }
  };

  const runReject = async () => {
    const payload = buildBulkRejectPayload(requestedSlots, selectedSlots);
    if (!payload.requestRejections?.length) {
      toast.error('Nothing selected to reject.', { position: 'top-center' });
      return;
    }
    setBusy(true);
    try {
      const result = await bulkReject(payload).unwrap();
      const data = result?.data ?? result;
      const rejected = data?.totalSlotsRejected ?? 0;
      toast.success(`Rejected ${rejected} requested plan(s).`, {
        position: 'top-center',
      });
      setSelectedSlots(new Set());
      setConfirmAction(null);
      await refetch();
      if (onApproved) await onApproved();
    } catch (e) {
      toast.error(e?.data?.message || e?.message || 'Bulk rejection failed.', {
        position: 'top-center',
      });
    } finally {
      setBusy(false);
    }
  };

  const requestApproveConfirm = () => {
    if (selectedCount < 1 || busy) return;
    const payload = buildBulkApprovePayload(requestedSlots, selectedSlots);
    if (!payload.requestApprovals?.length) {
      toast.error('Nothing selected to approve.', { position: 'top-center' });
      return;
    }
    setConfirmAction('approve');
  };

  const requestRejectConfirm = () => {
    if (selectedCount < 1 || busy) return;
    const payload = buildBulkRejectPayload(requestedSlots, selectedSlots);
    if (!payload.requestRejections?.length) {
      toast.error('Nothing selected to reject.', { position: 'top-center' });
      return;
    }
    setConfirmAction('reject');
  };

  const closeConfirm = () => {
    if (!busy) setConfirmAction(null);
  };

  const estateOptions = useMemo(
    () => estates.map((e) => ({ id: e.id, group: e.estate })),
    [estates]
  );

  const missionOptions = useMemo(
    () =>
      missionTypes.map(({ mission_type_code, mission_type_name }) => ({
        id: mission_type_code,
        group: mission_type_name,
      })),
    [missionTypes]
  );

  const cropOptions = useMemo(
    () => cropTypes.map(({ id, crop }) => ({ id, group: crop })),
    [cropTypes]
  );

  const showEmptyHint =
    !isLoading &&
    !isError &&
    board &&
    (board.pendingSlotCount ?? 0) === 0 &&
    openRequestSlots.length === 0;

  return (
    <div className="accept-monthly-board">
      <div className="form-section-top">
        <div className="accept-monthly-actions-row">
          <div className="mission-type-controls accept-monthly-inline-filter">
            <label htmlFor="accept-filter-estate">Estate</label>
            <CustomDropdown
              options={[ALL_ESTATES, ...estateOptions]}
              onSelect={(val) => setFilterEstate(val?.id ? val : null)}
              selectedValue={filterEstate || ALL_ESTATES}
            />
          </div>
          <div className="mission-type-controls accept-monthly-inline-filter">
            <label htmlFor="accept-filter-mission">Mission</label>
            <CustomDropdown
              options={[ALL_MISSIONS, ...missionOptions]}
              onSelect={(val) => setFilterMission(val?.id ? val : null)}
              selectedValue={filterMission || ALL_MISSIONS}
            />
          </div>
          <div className="mission-type-controls accept-monthly-inline-filter">
            <label htmlFor="accept-filter-crop">Crop</label>
            <CustomDropdown
              options={[ALL_CROPS, ...cropOptions]}
              onSelect={(val) => setFilterCrop(val?.id ? val : null)}
              selectedValue={filterCrop || ALL_CROPS}
            />
          </div>
          <button type="button" className="accept-monthly-mark-btn" onClick={selectAllFiltered}>
            Select filtered
          </button>
          <button type="button" className="accept-monthly-mark-btn secondary" onClick={clearSelection}>
            Clear selection
          </button>
          <button
            type="button"
            className="accept-monthly-mark-btn approve"
            disabled={busy || selectedCount < 1}
            onClick={requestApproveConfirm}
          >
            {busy && confirmAction === 'approve' ? 'Approving…' : `Approve selected (${selectedCount})`}
          </button>
          <button
            type="button"
            className="accept-monthly-mark-btn reject"
            disabled={busy || selectedCount < 1}
            onClick={requestRejectConfirm}
          >
            {busy && confirmAction === 'reject' ? 'Rejecting…' : `Reject selected (${selectedCount})`}
          </button>
        </div>

        {(isLoading || isFetching) && !board ? (
          <div className="accept-monthly-loading-bar">
            <Bars height="18" width="18" color="#004b71" visible />
            Loading monthly requests…
          </div>
        ) : null}

        <div className="accept-monthly-meta-bar">
          <div className="accept-monthly-legend">
            <span className="legend existing">Current plans</span>
            <span className="legend pending">Pending request</span>
            <span className="legend rejected">Rejected request</span>
            <span className="legend selected">Selected</span>
          </div>
        </div>

        {isError ? (
          <div className="accept-monthly-alert" role="alert">
            <span>Could not load monthly requests. Check that the backend is running and try again.</span>
            <button type="button" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        ) : null}

        {showEmptyHint ? (
          <div className="accept-monthly-empty-hint">
            No open monthly requests for {format(currentMonth, 'MMMM yyyy')}. Try another month or wait for
            estate managers to submit (from the 20th for the next month).
          </div>
        ) : null}
      </div>

      <div className="calendar-section-bottom accept-monthly-calendar-section">
        <div className="booking-calender-wrapper">
          <div className="booking-calender-container">
            <div className="booking-calender-header">
              <button
                type="button"
                className="booking-calender-nav-btn"
                onClick={() => onMonthChange(addMonths(currentMonth, -1))}
                aria-label="Previous month"
              >
                ◀
              </button>
              <h3 className="booking-calender-title">{format(currentMonth, 'MMMM yyyy')}</h3>
              <button
                type="button"
                className="booking-calender-nav-btn"
                onClick={() => onMonthChange(addMonths(currentMonth, 1))}
                aria-label="Next month"
              >
                ▶
              </button>
            </div>

            <div className="booking-calender-weekday-headers">
              {weekDays.map((d) => (
                <div key={d} className="booking-calender-weekday-header">
                  {d}
                </div>
              ))}
            </div>

            <div className="booking-calender-grid">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`pad-${i}`} className="booking-calender-day-empty" />
              ))}

              {calendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const existing = existingByDate.get(dateKey) || [];
                const slots = slotsByDate.get(dateKey) || [];
                const inMonth = isSameMonth(day, currentMonth);
                const dayClasses = [
                  'booking-calender-day',
                  !inMonth ? 'booking-calender-day-other-month' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div key={dateKey} className={dayClasses}>
                    <div className="booking-calender-day-header">
                      <div className="booking-calender-day-number">{format(day, 'd')}</div>
                      {(existing.length > 0 || slots.length > 0) && (
                        <div className="booking-calender-day-count">
                          ({existing.length + slots.length})
                        </div>
                      )}
                    </div>
                    <div className="booking-calender-tasks accept-monthly-tasks">
                      {existing.map((plan) => (
                        <div
                          key={`ex-${plan.id}`}
                          className="booking-calender-task accept-monthly-task-existing"
                          title="Existing plan"
                        >
                          <span className="booking-calender-task-estate">
                            {plan.estateName} - ID:{plan.id}
                          </span>
                        </div>
                      ))}
                      {slots.map((slot) => {
                        const isSelected = selectedSlots.has(slot.slotKey);
                        const isPending = slot.slotStatus === 'pending';
                        const matches = slotMatchesFilters(slot, filters);
                        const cls = [
                          'booking-calender-task',
                          'accept-monthly-task-requested',
                          `accept-monthly-task-${slot.slotStatus || 'pending'}`,
                          filtersActive && matches && isPending ? 'accept-monthly-task-filtered' : '',
                          filtersActive && !matches && isPending ? 'accept-monthly-task-dimmed' : '',
                          isSelected ? 'accept-monthly-task-selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ');
                        const slotLabel = `${slot.estateName} - ${slot.missionLabel}`;
                        const slotTitle = `Request #${slot.requestId} · ${slot.pickedDate}`;

                        if (!isPending) {
                          return (
                            <div key={slot.slotKey} className={cls} title={slotTitle}>
                              <span className="booking-calender-task-estate">{slotLabel}</span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={slot.slotKey}
                            type="button"
                            className={cls}
                            onClick={() => toggleSlot(slot)}
                            title={slotTitle}
                          >
                            <span className="booking-calender-task-estate">{slotLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {confirmAction ? (
        <div className="plan-popup-overlay" onClick={closeConfirm}>
          <div className="plan-popup-container" onClick={(e) => e.stopPropagation()}>
            <div className="plan-popup-header">
              <h3>{confirmAction === 'approve' ? 'Approve selected plans' : 'Reject selected plans'}</h3>
              <button
                type="button"
                className="plan-popup-close"
                onClick={closeConfirm}
                aria-label="Close"
                disabled={busy}
              >
                ×
              </button>
            </div>
            <div className="plan-popup-content">
              <p className="plan-popup-message">
                {confirmAction === 'approve' ? (
                  <>
                    Approve <strong>{selectedCount}</strong> selected requested plan
                    {selectedCount === 1 ? '' : 's'}? This will create booking plan
                    {selectedCount === 1 ? '' : 's'} for operations.
                  </>
                ) : (
                  <>
                    Reject <strong>{selectedCount}</strong> selected requested plan
                    {selectedCount === 1 ? '' : 's'}? Rejected items will not be created as bookings.
                  </>
                )}
              </p>
            </div>
            <div className="plan-popup-footer">
              <div className="plan-popup-actions">
                <button
                  type="button"
                  className="plan-popup-cancel-btn"
                  onClick={closeConfirm}
                  disabled={busy}
                >
                  Cancel
                </button>
                {confirmAction === 'approve' ? (
                  <button
                    type="button"
                    className="plan-popup-create-btn"
                    onClick={runApprove}
                    disabled={busy}
                  >
                    {busy ? 'Approving…' : 'Approve'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="plan-popup-danger-btn"
                    onClick={runReject}
                    disabled={busy}
                  >
                    {busy ? 'Rejecting…' : 'Reject'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
