import React, { useEffect, useState, useMemo } from 'react';
import { Bars } from 'react-loader-spinner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths } from 'date-fns';
import { toast } from 'react-toastify';
import CustomDropdown from '../../../components/CustomDropdown';
import {
  useDeleteBookingPlanMutation,
  useDeactivateBookingPlanMutation,
} from '../../../api/services NodeJs/bookingCreationApi';
import { useGetDeactivateReasonsQuery } from '../../../api/services NodeJs/reasonsApi';
import '../../../styles/bookingsCalender.css';
import '../../../styles/updateservices.css';
import '../../../styles/deactivateplan.css';

const DeactivatePlanIcon = () => (
  <svg
    className="booking-calender-task-deactivate-icon"
    viewBox="0 0 24 24"
    width="12"
    height="12"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <line x1="7.2" y1="7.2" x2="16.8" y2="16.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const BookingsCalender = ({
  currentMonth,
  onMonthChange,
  tasksData = [],
  calendarLoading = false,
  onDateClick = null,
  selectedDate = null,
  submittingDate = null,
  onCalendarChange = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [tasksByDate, setTasksByDate] = useState({});
  const [deletingPlanId, setDeletingPlanId] = useState(null);
  const [deactivatingPlanId, setDeactivatingPlanId] = useState(null);
  const [deleteModalTask, setDeleteModalTask] = useState(null);
  const [deactivateModalTask, setDeactivateModalTask] = useState(null);
  const [selectedDeactivateReason, setSelectedDeactivateReason] = useState(null);
  const [deleteBookingPlan] = useDeleteBookingPlanMutation();
  const [deactivateBookingPlan] = useDeactivateBookingPlanMutation();
  const { data: deactivateReasons } = useGetDeactivateReasonsQuery({ include_inactive: false });

  const deactivateReasonOptions = useMemo(
    () =>
      (deactivateReasons || [])
        .filter((row) => Number(row.id) !== 1)
        .map((row) => ({ id: row.id, group: row.reason })),
    [deactivateReasons]
  );

  const canManagePlans = useMemo(() => {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const jobRole = userData.job_role || '';
    const memberType = userData.member_type || '';

    if (memberType === 'i' && userData.user_level === 'i') {
      return true;
    }
    if (jobRole === 'md') {
      return true;
    }
    return false;
  }, []);

  const closeDeleteModal = () => setDeleteModalTask(null);

  const closeDeactivateModal = () => {
    setDeactivateModalTask(null);
    setSelectedDeactivateReason(null);
  };

  useEffect(() => {
    const grouped = tasksData.reduce((acc, task) => {
      if (!acc[task.date]) acc[task.date] = [];

      const taskEstate = task.estate;
      const taskArea = `${task.area} Ha`;

      acc[task.date].push({
        ...task,
        estate: taskEstate,
        area: taskArea,
      });
      return acc;
    }, {});

    setTasksByDate(grouped);
  }, [tasksData]);

  useEffect(() => {
    if (!deactivateModalTask || selectedDeactivateReason) return;
    if (deactivateReasonOptions.length === 1) {
      setSelectedDeactivateReason(deactivateReasonOptions[0]);
    }
  }, [deactivateModalTask, deactivateReasonOptions, selectedDeactivateReason]);

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  const calendarDays = getCalendarDays();

  const getDayNumber = (date) => format(date, 'd');

  const openDeleteModal = (task) => {
    if (!task?.id) return;
    if (task.can_delete === false) {
      toast.error(task.delete_block_reason || 'This plan cannot be deleted.', {
        position: 'top-center',
        autoClose: 5000,
      });
      return;
    }
    setDeleteModalTask(task);
  };

  const openDeactivateModal = (task) => {
    if (!task?.id) return;
    if (!deactivateReasonOptions.length) {
      toast.error('No deactivate reasons are configured. Add reasons in master data first.', {
        position: 'top-center',
        autoClose: 5000,
      });
      return;
    }
    setSelectedDeactivateReason(null);
    setDeactivateModalTask(task);
  };

  const executeDeletePlan = async (task) => {
    try {
      setDeletingPlanId(task.id);
      const deleteResult = await deleteBookingPlan(task.id);
      if (deleteResult.error) {
        const errMsg =
          deleteResult.error?.data?.message ||
          deleteResult.error?.message ||
          'Failed to delete the plan.';
        toast.error(errMsg, {
          position: 'top-center',
          autoClose: 5000,
        });
        return;
      }
      const response = deleteResult.data;
      const isSuccess = response?.status === 'true' || response?.success === true;
      if (!isSuccess) {
        toast.error(response?.message || 'Failed to delete the plan.', {
          position: 'top-center',
          autoClose: 5000,
        });
        return;
      }
      setTasksByDate((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((dateKey) => {
          updated[dateKey] = (updated[dateKey] || []).filter((t) => t.id !== task.id);
        });
        return updated;
      });
      if (onCalendarChange) {
        await onCalendarChange();
      }
      toast.success('Plan deleted.', { position: 'top-center', autoClose: 3000 });
      closeDeleteModal();
    } catch (e) {
      console.error(e);
      toast.error('Error occurred while deleting the plan.', {
        position: 'top-center',
        autoClose: 5000,
      });
    } finally {
      setDeletingPlanId(null);
    }
  };

  const confirmDeactivatePlan = async () => {
    const task = deactivateModalTask;
    if (!task?.id) return;
    if (!selectedDeactivateReason?.id) {
      toast.error('Please select a deactivate reason.', {
        position: 'top-center',
        autoClose: 4000,
      });
      return;
    }
    await executeDeactivatePlan(task, selectedDeactivateReason.id);
  };

  const executeDeactivatePlan = async (task, reasonId) => {
    try {
      setDeactivatingPlanId(task.id);
      const result = await deactivateBookingPlan({
        plan_id: task.id,
        deactivate_reason_id: reasonId,
      });
      if (result.error) {
        const errMsg =
          result.error?.data?.message ||
          result.error?.message ||
          'Failed to deactivate the plan.';
        toast.error(errMsg, {
          position: 'top-center',
          autoClose: 5000,
        });
        return;
      }
      const response = result.data;
      const isSuccess = response?.status === 'true' || response?.success === true;
      if (!isSuccess) {
        toast.error(response?.message || 'Failed to deactivate the plan.', {
          position: 'top-center',
          autoClose: 5000,
        });
        return;
      }
      setTasksByDate((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((dateKey) => {
          updated[dateKey] = (updated[dateKey] || []).filter((t) => t.id !== task.id);
        });
        return updated;
      });
      if (onCalendarChange) {
        await onCalendarChange();
      }
      toast.success('Plan deactivated.', { position: 'top-center', autoClose: 3000 });
      closeDeactivateModal();
    } catch (e) {
      console.error(e);
      toast.error('Error occurred while deactivating the plan.', {
        position: 'top-center',
        autoClose: 5000,
      });
    } finally {
      setDeactivatingPlanId(null);
    }
  };

  const handlePreviousMonth = () => {
    onMonthChange(addMonths(currentMonth, -1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const renderDeleteModal = () => {
    if (!deleteModalTask) return null;
    const task = deleteModalTask;
    return (
      <div className="plan-popup-overlay" onClick={closeDeleteModal}>
        <div className="plan-popup-container" onClick={(e) => e.stopPropagation()}>
          <div className="plan-popup-header">
            <h3>Delete plan</h3>
            <button type="button" className="plan-popup-close" onClick={closeDeleteModal} aria-label="Close">
              ×
            </button>
          </div>
          <div className="plan-popup-content">
            <p className="plan-popup-message">
              Delete plan <strong>#{task.id}</strong> ({task.estate})? This cannot be undone.
            </p>
          </div>
          <div className="plan-popup-footer">
            <div className="plan-popup-actions">
              <button type="button" className="plan-popup-cancel-btn" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button
                type="button"
                className="plan-popup-danger-btn"
                onClick={() => executeDeletePlan(task)}
                disabled={deletingPlanId === task.id}
              >
                {deletingPlanId === task.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeactivateModal = () => {
    if (!deactivateModalTask) return null;
    const task = deactivateModalTask;
    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <h3>Deactivate Plan</h3>
          <p>Select a reason before deactivating this plan.</p>
          <div className="deactivate-modal-plan">
            Plan #{task.id} - {task.estate || '-'}
          </div>
          <div style={{ marginTop: 12 }}>
            <CustomDropdown
              options={deactivateReasonOptions}
              onSelect={(option) => setSelectedDeactivateReason(option)}
              selectedValue={selectedDeactivateReason}
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="confirm-button"
              onClick={confirmDeactivatePlan}
              disabled={deactivatingPlanId === task.id}
            >
              {deactivatingPlanId === task.id ? 'Updating...' : 'Deactivate'}
            </button>
            <button type="button" className="cancel-button" onClick={closeDeactivateModal}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const firstDayOfWeek = monthStart.getDay();
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = format(currentMonth, 'MMMM yyyy');

    return (
      <div className="booking-calender-container">
        <div className="booking-calender-header">
          <button
            className="booking-calender-nav-btn"
            onClick={handlePreviousMonth}
            aria-label="Previous month"
          >
            ◀
          </button>
          <h3 className="booking-calender-title">{monthName}</h3>
          <button
            className="booking-calender-nav-btn"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            ▶
          </button>
        </div>

        <div className="booking-calender-weekday-headers">
          {weekdayNames.map((day, index) => (
            <div key={index} className="booking-calender-weekday-header">
              {day}
            </div>
          ))}
        </div>

        <div className="booking-calender-grid">
          {[...Array(firstDayOfWeek)].map((_, index) => (
            <div key={`empty-${index}`} className="booking-calender-day-empty" />
          ))}

          {calendarDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const allTasks = tasksByDate[dayStr] || [];
            const dayTasks = allTasks.filter((task) => task.activated === 1);
            const planCount = dayTasks.length;
            const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dayStr;
            const isSubmitting = submittingDate && format(submittingDate, 'yyyy-MM-dd') === dayStr;

            return (
              <div
                key={dayStr}
                className={`booking-calender-day ${isSameMonth(day, currentMonth) ? '' : 'booking-calender-day-other-month'} ${isSelected ? 'booking-calender-day-selected' : ''} ${onDateClick ? 'booking-calender-day-clickable' : ''} ${isSubmitting ? 'booking-calender-day-submitting' : ''}`}
                onClick={onDateClick ? () => onDateClick(day) : undefined}
                style={{ cursor: onDateClick ? 'pointer' : 'default' }}
              >
                <div className="booking-calender-day-header">
                  <div className="booking-calender-day-number">{getDayNumber(day)}</div>
                  {planCount > 0 && <div className="booking-calender-day-count">({planCount})</div>}
                </div>
                <div className="booking-calender-tasks">
                  {dayTasks.map((task, index) => (
                    <div
                      key={index}
                      className="booking-calender-task"
                      title={`${task.estate} - ${task.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="booking-calender-task-estate">
                        {task.estate} - ID: {task.id}
                      </span>
                      {canManagePlans && (
                        <span className="booking-calender-task-actions">
                          {task.can_delete !== false && (
                            <button
                              className="booking-calender-task-delete"
                              aria-label="Delete plan"
                              title="Delete plan"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(task);
                              }}
                              disabled={deletingPlanId === task.id}
                            >
                              {deletingPlanId === task.id ? '...' : (
                                <svg
                                  className="booking-calender-task-delete-icon"
                                  viewBox="0 0 24 24"
                                  width="12"
                                  height="12"
                                  aria-hidden="true"
                                  focusable="false"
                                >
                                  <path
                                    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm13-15h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                                    fill="currentColor"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                          {task.can_delete === false && task.activated === 1 && (
                            <button
                              className="booking-calender-task-deactivate"
                              aria-label="Deactivate plan"
                              title={task.delete_block_reason || 'Deactivate plan'}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeactivateModal(task);
                              }}
                              disabled={deactivatingPlanId === task.id}
                            >
                              {deactivatingPlanId === task.id ? '...' : <DeactivatePlanIcon />}
                            </button>
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                  {isSubmitting && (
                    <div className="booking-calender-submitting-indicator">
                      <div className="booking-calender-loading-bar"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="booking-calender-wrapper">
      {(calendarLoading || loading) && (
        <div className="booking-calender-loading-overlay">
          <div className="booking-calender-loading-content">
            <Bars
              height="50"
              width="50"
              color="#003057FF"
              ariaLabel="bars-loading"
              visible={true}
            />
            <p>Loading calendar data...</p>
          </div>
        </div>
      )}
      {renderCalendar()}
      {renderDeleteModal()}
      {renderDeactivateModal()}
    </div>
  );
};

export default BookingsCalender;
