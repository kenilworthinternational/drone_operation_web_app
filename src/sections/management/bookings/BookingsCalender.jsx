import React, { useEffect, useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bars } from 'react-loader-spinner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths } from 'date-fns';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import '../../../styles/bookingsCalender.css';

const BookingsCalender = ({ currentMonth, onMonthChange, tasksData = [], calendarLoading = false, onDateClick = null, selectedDate = null, submittingDate = null }) => {
  const [loading, setLoading] = useState(false);
  const [tasksByDate, setTasksByDate] = useState({});
  const [deletingPlanId, setDeletingPlanId] = useState(null);
  const dispatch = useAppDispatch();

  // Check if user can delete plans (developers or job role 'md')
  const canDeletePlan = useMemo(() => {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const jobRole = userData.job_role || '';
    const memberType = userData.member_type || '';
    
    // Developers get access
    if (memberType === 'i' && userData.user_level === 'i') {
      return true;
    }
    
    // Job role 'md' gets access
    if (jobRole === 'md') {
      return true;
    }
    
    return false;
  }, []);

  // Group tasks by date
  useEffect(() => {
    const grouped = tasksData.reduce((acc, task) => {
      if (!acc[task.date]) acc[task.date] = [];
      
      let taskEstate = task.estate;
      let taskArea = `${task.area} Ha`;
      
      acc[task.date].push({ 
        ...task, 
        estate: taskEstate, 
        area: taskArea 
      });
      return acc;
    }, {});
    
    setTasksByDate(grouped);
  }, [tasksData]);

  // Get calendar days
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days;
  };

  const calendarDays = getCalendarDays();

  // Get day number
  const getDayNumber = (date) => {
    return format(date, 'd');
  };

  const handleDeletePlan = async (planId) => {
    if (!planId) return;
    const confirmed = window.confirm('Are you sure you want to delete this plan? This action cannot be undone.');
    if (!confirmed) return;
    try {
      setDeletingPlanId(planId);
      const deleteResult = await dispatch(baseApi.endpoints.deletePlan.initiate(planId));
      const response = deleteResult.data;
      const isSuccess = response?.status === "true" || response?.success === true;
      if (!isSuccess) {
        alert(response?.message || 'Failed to delete the plan.');
        return;
      }
      // Optimistically remove from current calendar view
      setTasksByDate((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((dateKey) => {
          updated[dateKey] = (updated[dateKey] || []).filter((t) => t.id !== planId);
        });
        return updated;
      });
    } catch (e) {
      console.error(e);
      alert('Error occurred while deleting the plan.');
    } finally {
      setDeletingPlanId(null);
    }
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    onMonthChange(addMonths(currentMonth, -1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  // Render calendar
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

        {/* Day headers */}
        <div className="booking-calender-weekday-headers">
          {weekdayNames.map((day, index) => (
            <div key={index} className="booking-calender-weekday-header">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="booking-calender-grid">
          {/* Empty spaces for days before month starts */}
          {[...Array(firstDayOfWeek)].map((_, index) => (
            <div key={`empty-${index}`} className="booking-calender-day-empty" />
          ))}

          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const allTasks = tasksByDate[dayStr] || [];
            // Filter out plans where activated=0
            const dayTasks = allTasks.filter(task => task.activated === 1);
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
                      <span className="booking-calender-task-estate">{task.estate} - ID: {task.id}</span>
                      {canDeletePlan && (
                        <button
                          className="booking-calender-task-delete"
                          aria-label="Delete plan"
                          title="Delete plan"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(task.id);
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
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm13-15h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                            </svg>
                          )}
                        </button>
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
    </div>
  );
};

export default BookingsCalender;

