import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bars } from 'react-loader-spinner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import '../../../styles/requestProceed.css';

const RequestProceed = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [requestType, setRequestType] = useState('adhoc'); // 'adhoc' or 'reschedule'
  
  const [adhocLoading, setAdhocLoading] = useState(false);
  const [adhocData, setAdhocData] = useState(null);
  const [adhocError, setAdhocError] = useState('');
  
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleData, setRescheduleData] = useState(null);
  const [rescheduleError, setRescheduleError] = useState('');
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansByDate, setPlansByDate] = useState({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const normalizeId = (id) => (id !== null && id !== undefined ? String(id) : null);

  const monthRange = useMemo(() => {
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    return { start, end };
  }, [currentMonth]);

  useEffect(() => {
    // Get request data from location state if passed
    const requestId = location.state?.requestId;
    const type = location.state?.requestType || 'adhoc';
    
    if (requestId !== undefined && requestId !== null) {
      setSelectedRequestId(normalizeId(requestId));
    }
    if (type) {
      setRequestType(type);
    }

    const fetchAdhocData = async () => {
      setAdhocLoading(true);
      setAdhocError('');
      try {
        const result = await dispatch(baseApi.endpoints.getPendingAdHocRequests.initiate());
        const data = result.data;
        if (data && data.status === 'true') {
          setAdhocData(data);
        } else {
          setAdhocData({ requests: [], request_count: 0 });
        }
      } catch (e) {
        setAdhocError('Failed to load ad-hoc requests');
        setAdhocData({ requests: [], request_count: 0 });
      } finally {
        setAdhocLoading(false);
      }
    };

    const fetchRescheduleData = async () => {
      setRescheduleLoading(true);
      setRescheduleError('');
      try {
        const result = await dispatch(baseApi.endpoints.getPendingRescheduleRequestsByManager.initiate());
        const data = result.data;
        if (data && data.requests) {
          setRescheduleData(data);
        } else {
          setRescheduleData({ requests: [] });
        }
      } catch (e) {
        setRescheduleError('Failed to load reschedule requests');
        setRescheduleData({ requests: [] });
      } finally {
        setRescheduleLoading(false);
      }
    };

    fetchAdhocData();
    if (type === 'reschedule') {
      fetchRescheduleData();
    }
  }, [location]);

  useEffect(() => {
    let isCancelled = false;
    const fetchPlansData = async () => {
      setPlansLoading(true);
      try {
        const result = await dispatch(baseApi.endpoints.getAllPlansByDateRange.initiate({
          startDate: monthRange.start,
          endDate: monthRange.end
        }));
        const data = result.data;
        if (isCancelled) return;
        const grouped = {};
        if (data && (data.status === 'true' || data.status === true)) {
          Object.keys(data)
            .filter((k) => !isNaN(k))
            .forEach((k) => {
              const item = data[k];
              const dateKey = item.date;
              if (!grouped[dateKey]) grouped[dateKey] = [];
              grouped[dateKey].push(item);
            });
        }
        setPlansByDate(grouped);
      } catch (e) {
        if (!isCancelled) console.error('Failed to load calendar plans data');
      } finally {
        if (!isCancelled) setPlansLoading(false);
      }
    };
    fetchPlansData();
    return () => {
      isCancelled = true;
    };
  }, [monthRange]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const formatDates = (datesString) => {
    if (!datesString) return 'N/A';
    return datesString.split(',').map(d => d.trim()).join(', ');
  };

  // Helper to get estate name for modal
  const getEstateName = () => {
    if (requestType === 'reschedule') {
      return selectedRescheduleRequest?.estate || 'N/A';
    }
    return selectedAdhocRequest?.estate || 'N/A';
  };

  const handleCreateClick = () => {
    if (!selectedDate) {
      setErrorMessage('Please select a date from the calendar');
      setShowError(true);
      return;
    }
    if (!selectedRequestId) {
      setErrorMessage('Please select a request');
      setShowError(true);
      return;
    }
    setShowCreateConfirm(true);
  };

  const handleCreatePlan = async () => {
    setShowCreateConfirm(false);
    setIsSubmitting(true);
    try {
      // Validate inputs
      if (!selectedDate) {
        setErrorMessage('Please select a date from the calendar');
        setShowError(true);
        setIsSubmitting(false);
        return;
      }
      if (!selectedRequestId) {
        setErrorMessage('Please select a request');
        setShowError(true);
        setIsSubmitting(false);
        return;
      }

      const dateFormatted = format(selectedDate, 'yyyy-MM-dd');
      const parsedRequestId = selectedRequestId ? Number(selectedRequestId) : null;
      const apiRequestId = parsedRequestId !== null && !Number.isNaN(parsedRequestId)
        ? parsedRequestId
        : selectedRequestId;
      
      console.log('Creating plan:', {
        requestType,
        selectedRequestId,
        dateFormatted,
        status: 'a'
      });
      
      // Call appropriate API based on request type
      const result = requestType === 'reschedule' 
        ? await dispatch(baseApi.endpoints.updateRescheduleRequest.initiate({ requestId: apiRequestId, datePlanned: dateFormatted, status: 'a' }))
        : await dispatch(baseApi.endpoints.updateAdHocRequest.initiate({ requestId: apiRequestId, datePlanned: dateFormatted, status: 'a' }));
      const resultData = result.data;
      
      console.log('API Response:', resultData);
      
      // Handle null/undefined response
      if (!resultData) {
        console.error('API returned null or undefined');
        setErrorMessage('No response from server. Please try again.');
        setShowError(true);
        return;
      }
      
      // Check for success - handle both string 'true' and boolean true
      if (resultData.status === 'true' || resultData.status === true || resultData.success === true) {
        setSuccessMessage('Plan created successfully');
        setShowSuccess(true);
        
        // Refresh the request list based on type
        if (requestType === 'reschedule') {
          try {
            const result = await dispatch(baseApi.endpoints.getPendingRescheduleRequestsByManager.initiate());
        const data = result.data;
            if (data && data.requests) {
              setRescheduleData(data);
              const stillExists = data.requests?.find(r => String(r.request_id) === selectedRequestId);
              if (!stillExists) {
                setSelectedRequestId(null);
                setSelectedDate(null);
              }
            }
          } catch (refreshError) {
            console.error('Failed to refresh reschedule requests:', refreshError);
            // Don't show error to user as plan was created successfully
          }
        } else {
          try {
            const result = await dispatch(baseApi.endpoints.getPendingAdHocRequests.initiate());
        const data = result.data;
            if (data && data.status === 'true') {
              setAdhocData(data);
              const stillExists = data.requests?.find(r => String(r.request_id) === selectedRequestId);
              if (!stillExists) {
                setSelectedRequestId(null);
                setSelectedDate(null);
              }
            }
          } catch (refreshError) {
            console.error('Failed to refresh adhoc requests:', refreshError);
            // Don't show error to user as plan was created successfully
          }
        }
        
        // Refresh the calendar
        const monthRange = {
          start: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        };
        try {
          const calendarResult = await dispatch(baseApi.endpoints.getAllPlansByDateRange.initiate({
            startDate: monthRange.start,
            endDate: monthRange.end
          }));
          const calendarData = calendarResult.data;
          const grouped = {};
          if (calendarData && (calendarData.status === 'true' || calendarData.status === true)) {
            Object.keys(calendarData)
              .filter((k) => !isNaN(k))
              .forEach((k) => {
                const item = calendarData[k];
                const dateKey = item.date;
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(item);
              });
          }
          setPlansByDate(grouped);
        } catch (e) {
          console.error('Failed to refresh calendar data:', e);
          // Don't show error to user as plan was created successfully
        }
      } else {
        // Show more detailed error message
        console.error('Plan creation failed:', result);
        const errorMsg = result?.message || 
                        result?.error?.message || 
                        result?.error?.exception || 
                        result?.error ||
                        (typeof result === 'string' ? result : 'Failed to create plan');
        setErrorMessage(errorMsg);
        setShowError(true);
      }
    } catch (e) {
      console.error('Error creating plan:', e);
      const errorMsg = e.response?.data?.message || 
                      e.response?.data?.exception || 
                      e.response?.data?.error ||
                      e.message || 
                      'Failed to create plan. Please try again.';
      setErrorMessage(errorMsg);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineClick = () => {
    if (!selectedRequestId) {
      setErrorMessage('Please select a request');
      setShowError(true);
      return;
    }
    setShowDeclineConfirm(true);
  };

  const handleDeclinePlan = async () => {
    setShowDeclineConfirm(false);
    setIsSubmitting(true);
    try {
      // Validate inputs
      if (!selectedRequestId) {
        setErrorMessage('Please select a request');
        setShowError(true);
        setIsSubmitting(false);
        return;
      }

      console.log('Declining request:', {
        requestType,
        selectedRequestId,
        status: 'r'
      });
      
      // Call appropriate API based on request type
      const parsedRequestId = selectedRequestId ? Number(selectedRequestId) : null;
      const apiRequestId = parsedRequestId !== null && !Number.isNaN(parsedRequestId)
        ? parsedRequestId
        : selectedRequestId;

      const result = requestType === 'reschedule'
        ? await dispatch(baseApi.endpoints.updateRescheduleRequest.initiate({ requestId: apiRequestId, datePlanned: '', status: 'r' }))
        : await dispatch(baseApi.endpoints.updateAdHocRequest.initiate({ requestId: apiRequestId, datePlanned: '', status: 'r' }));
      const resultData = result.data;
      
      console.log('Decline API Response:', resultData);
      
      // Handle null/undefined response
      if (!resultData) {
        console.error('API returned null or undefined');
        setErrorMessage('No response from server. Please try again.');
        setShowError(true);
        return;
      }
      
      // Check for success - handle both string 'true' and boolean true
      if (resultData.status === 'true' || resultData.status === true || resultData.success === true) {
        setSuccessMessage('Request declined successfully');
        setShowSuccess(true);
        
        // Clear selection immediately
        setSelectedRequestId(null);
        setSelectedDate(null);
        
        // Refresh the request list based on type
        if (requestType === 'reschedule') {
          try {
            const result = await dispatch(baseApi.endpoints.getPendingRescheduleRequestsByManager.initiate());
        const data = result.data;
            if (data && data.requests) {
              setRescheduleData(data);
            } else {
              // If no data returned, set empty array
              setRescheduleData({ requests: [] });
            }
          } catch (refreshError) {
            console.error('Failed to refresh reschedule requests:', refreshError);
            // Still show success as decline was successful
            // Try to refresh again or set empty state
            setRescheduleData({ requests: [] });
          }
        } else {
          try {
            const result = await dispatch(baseApi.endpoints.getPendingAdHocRequests.initiate());
        const data = result.data;
            console.log('Refreshed adhoc data:', data);
            // Handle different response structures
            if (data) {
              if (data.status === 'true' || data.status === true) {
                setAdhocData(data);
              } else if (data.requests) {
                // If data has requests array directly
                setAdhocData({ ...data, status: 'true' });
              } else {
                // If data structure is different, set with empty requests
                setAdhocData({ requests: [], request_count: 0, status: 'true' });
              }
            } else {
              // If no data returned, set empty state
              setAdhocData({ requests: [], request_count: 0, status: 'true' });
            }
          } catch (refreshError) {
            console.error('Failed to refresh adhoc requests:', refreshError);
            // Still show success as decline was successful
            // Set empty state to clear the queue
            setAdhocData({ requests: [], request_count: 0, status: 'true' });
          }
        }
        
        // Refresh the calendar
        const monthRange = {
          start: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        };
        try {
          const calendarResult = await dispatch(baseApi.endpoints.getAllPlansByDateRange.initiate({
            startDate: monthRange.start,
            endDate: monthRange.end
          }));
          const calendarData = calendarResult.data;
          const grouped = {};
          if (calendarData && (calendarData.status === 'true' || calendarData.status === true)) {
            Object.keys(calendarData)
              .filter((k) => !isNaN(k))
              .forEach((k) => {
                const item = calendarData[k];
                const dateKey = item.date;
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(item);
              });
          }
          setPlansByDate(grouped);
        } catch (e) {
          console.error('Failed to refresh calendar data:', e);
          // Don't show error to user as decline was successful
        }
      } else {
        // Show more detailed error message
        console.error('Request decline failed:', result);
        const errorMsg = result?.message || 
                        result?.error?.message || 
                        result?.error?.exception || 
                        result?.error ||
                        (typeof result === 'string' ? result : 'Failed to decline request');
        setErrorMessage(errorMsg);
        setShowError(true);
      }
    } catch (e) {
      console.error('Error declining request:', e);
      const errorMsg = e.response?.data?.message || 
                      e.response?.data?.exception || 
                      e.response?.data?.error ||
                      e.message || 
                      'Failed to decline request. Please try again.';
      setErrorMessage(errorMsg);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAdhocRequest = useMemo(() => {
    if (!selectedRequestId || !adhocData?.requests) return null;
    return adhocData.requests.find((r) => String(r.request_id) === selectedRequestId) || null;
  }, [adhocData?.requests, selectedRequestId]);

  const selectedRescheduleRequest = useMemo(() => {
    if (!selectedRequestId || !rescheduleData?.requests) return null;
    return rescheduleData.requests.find((r) => String(r.request_id) === selectedRequestId) || null;
  }, [rescheduleData?.requests, selectedRequestId]);

  const sortedAdhocRequests = useMemo(() => {
    const requests = adhocData?.requests || [];
    if (!selectedRequestId) return requests;
    const selectedIndex = requests.findIndex((r) => String(r.request_id) === selectedRequestId);
    if (selectedIndex === -1) return requests;
    const selected = requests[selectedIndex];
    const others = requests.filter((_, idx) => idx !== selectedIndex);
    return [selected, ...others];
  }, [adhocData?.requests, selectedRequestId]);

  const sortedRescheduleRequests = useMemo(() => {
    const requests = rescheduleData?.requests || [];
    if (!selectedRequestId) return requests;
    const selectedIndex = requests.findIndex((r) => String(r.request_id) === selectedRequestId);
    if (selectedIndex === -1) return requests;
    const selected = requests[selectedIndex];
    const others = requests.filter((_, idx) => idx !== selectedIndex);
    return [selected, ...others];
  }, [rescheduleData?.requests, selectedRequestId]);
  
  const selectedRequest = requestType === 'reschedule' ? selectedRescheduleRequest : selectedAdhocRequest;

  // Parse requested dates from selected request
  const requestedDatesSet = useMemo(() => {
    if (!selectedRequest) return new Set();
    
    // Handle reschedule requests (uses requested_dates)
    if (requestType === 'reschedule' && selectedRequest.requested_dates) {
      const datesString = selectedRequest.requested_dates;
      if (!datesString) return new Set();
      const dates = datesString.split(',').map(d => d.trim()).filter(d => d);
      return new Set(dates);
    }
    
    // Handle adhoc requests (uses dates)
    if (requestType === 'adhoc' && selectedRequest.dates) {
      const datesString = selectedRequest.dates;
      if (!datesString) return new Set();
      const dates = datesString.split(',').map(d => d.trim()).filter(d => d);
      return new Set(dates);
    }
    
    return new Set();
  }, [selectedRequest, requestType]);

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const firstDayOfWeek = monthStart.getDay();
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = format(currentMonth, 'MMMM yyyy');
    const calendarDays = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) });

    return (
      <div className="calendar-container-req-proceed">
        <div className="calendar-header-sticky-req-proceed">
          <div className="calendar-header-req-proceed">
            <button 
              className="calendar-nav-btn-req-proceed" 
              onClick={handlePreviousMonth}
              aria-label="Previous month"
            >
              ◀
            </button>
            <h3 className="calendar-title-req-proceed">{monthName}</h3>
            <button 
              className="calendar-nav-btn-req-proceed" 
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              ▶
            </button>
          </div>

          {/* Day headers */}
          <div className="calendar-weekday-headers-req-proceed">
            {weekdayNames.map((day, index) => (
              <div key={index} className="calendar-weekday-header-req-proceed">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar grid - scrollable */}
        <div className="calendar-grid-wrapper-req-proceed">
          <div className="calendar-grid-req-proceed">
          {/* Empty spaces for days before month starts */}
          {[...Array(firstDayOfWeek)].map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day-empty-req-proceed" />
          ))}

          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const allPlans = plansByDate[dayStr] || [];
            // Filter out plans where activated=0
            const dayPlans = allPlans.filter(plan => plan.activated === 1);
            const planCount = dayPlans.length;
            const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dayStr;
            const isToday = format(new Date(), 'yyyy-MM-dd') === dayStr;
            const isRequestedDate = requestedDatesSet.has(dayStr);
            
            return (
              <div 
                key={dayStr} 
                className={`calendar-day-req-proceed ${isSelected ? 'calendar-day-selected-req-proceed' : ''} ${isToday ? 'calendar-day-today-req-proceed' : ''} ${isRequestedDate ? 'calendar-day-requested-req-proceed' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <div className="calendar-day-header-req-proceed">
                  <div className="calendar-day-number-req-proceed">{format(day, 'd')}</div>
                  {planCount > 0 && (
                    <div className="calendar-day-count-req-proceed">({planCount})</div>
                  )}
                </div>
                <div className="calendar-day-plans-req-proceed">
                  {dayPlans.map((plan, index) => (
                    <div 
                      key={index} 
                      className="calendar-day-plan-req-proceed"
                      title={`${plan.estate} - ${plan.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="calendar-day-plan-text-req-proceed">
                        {plan.estate} - ID: {plan.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="wrapper-req-proceed">
      <div className="header-req-proceed">
        <button 
          className="back-btn-req-proceed" 
          onClick={() => {
            if (isNavigating) return;
            setIsNavigating(true);
            navigate('/home/requestsQueue');
          }} 
          disabled={isNavigating}
          aria-label="Back"
        >
          {isNavigating ? (
            <Bars height="16" width="16" color="#004b71" ariaLabel="bars-loading" visible={true} />
          ) : (
            <svg className="back-icon-req-proceed" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          )}
        </button>
        <div className="center-header-req-proceed">
          <div className="heading-req-proceed">
            {requestType === 'reschedule' ? 'Reschedule Plan Request Queue' : 'Add-hoc Plan Request Queue'}
          </div>
        </div>
      </div>

      <div className="content-container-req-proceed">
        {/* Left Side: Request List */}
        <div className="requests-column-req-proceed">
          <div className="column-header-req-proceed">
            <h2 className="column-title-req-proceed">
              {requestType === 'reschedule' ? 'Plantation Reschedule Request Queue' : 'Plantation Add-hoc Request Queue'}
            </h2>
            <span className="column-count-req-proceed">
              Plans {requestType === 'reschedule' ? (rescheduleData?.requests?.length || 0) : (adhocData?.request_count || 0)} »
            </span>
          </div>
          
          <div className="requests-list-req-proceed">
            {requestType === 'reschedule' ? (
              <>
                {rescheduleLoading && (
                  <div className="loading-req-proceed">
                    <Bars height="30" width="30" color="#003057" ariaLabel="bars-loading" visible={true} />
                    <span>Loading...</span>
                  </div>
                )}
                {rescheduleError && <div className="error-req-proceed">{rescheduleError}</div>}
                {!rescheduleLoading && !rescheduleError && (
                  <>
                    {(!rescheduleData?.requests || rescheduleData.requests.length === 0) ? (
                      <div className="empty-req-proceed">No pending requests</div>
                    ) : (
                      sortedRescheduleRequests.map((request, idx) => (
                        <div 
                          key={`${request.request_id}-${request.plan_date || 'no-date'}-${idx}`} 
                          className={`request-tile-req-proceed ${selectedRequestId === String(request.request_id) ? 'request-tile-selected-req-proceed' : ''}`}
                          onClick={() => setSelectedRequestId(normalizeId(request.request_id))}
                        >
                          <div className="tile-header-req-proceed">
                            <span className="tile-id-req-proceed">Plan #{request.plan}</span>
                            <span className="tile-status-req-proceed">
                              {request.status === 'p' ? 'Pending' : request.status}
                            </span>
                          </div>
                          <div className="tile-body-req-proceed">
                            <div className="tile-row-req-proceed">
                              <span className="tile-label-req-proceed">Estate:</span>
                              <span className="tile-value-req-proceed">{request.estate || 'N/A'}</span>
                            </div>
                            {request.plan_date && (
                              <div className="tile-row-req-proceed">
                                <span className="tile-label-req-proceed">Original Date:</span>
                                <span className="tile-value-req-proceed">{request.plan_date}</span>
                              </div>
                            )}
                            {request.reason && (
                              <div className="tile-row-req-proceed">
                                <span className="tile-label-req-proceed">Reason:</span>
                                <span className="tile-value-req-proceed">{request.reason}</span>
                              </div>
                            )}
                            <div className="tile-row-req-proceed">
                              <span className="tile-label-req-proceed">Requested Dates:</span>
                              <span className="tile-value-req-proceed">{formatDates(request.requested_dates)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {adhocLoading && (
                  <div className="loading-req-proceed">
                    <Bars height="30" width="30" color="#003057" ariaLabel="bars-loading" visible={true} />
                    <span>Loading...</span>
                  </div>
                )}
                {adhocError && <div className="error-req-proceed">{adhocError}</div>}
                {!adhocLoading && !adhocError && (
                  <>
                    {(!adhocData?.requests || adhocData.requests.length === 0) ? (
                      <div className="empty-req-proceed">No pending requests</div>
                    ) : (
                      sortedAdhocRequests.map((request) => (
                        <div 
                          key={request.request_id} 
                          className={`request-tile-req-proceed ${selectedRequestId === String(request.request_id) ? 'request-tile-selected-req-proceed' : ''}`}
                          onClick={() => setSelectedRequestId(normalizeId(request.request_id))}
                        >
                          <div className="tile-header-req-proceed">
                            <span className="tile-id-req-proceed">Request #{request.request_id}</span>
                            <span className="tile-status-req-proceed">
                              {request.status === 'p' ? 'Pending' : request.status}
                            </span>
                          </div>
                          <div className="tile-body-req-proceed">
                            <div className="tile-row-req-proceed">
                              <span className="tile-label-req-proceed">Estate:</span>
                              <span className="tile-value-req-proceed">{request.estate || 'N/A'}</span>
                            </div>
                            {request.crop && (
                              <div className="tile-row-req-proceed">
                                <span className="tile-label-req-proceed">Crop:</span>
                                <span className="tile-value-req-proceed">{request.crop}</span>
                              </div>
                            )}
                            {request.mission_type && (
                              <div className="tile-row-req-proceed">
                                <span className="tile-label-req-proceed">Mission:</span>
                                <span className="tile-value-req-proceed">{request.mission_type}</span>
                              </div>
                            )}
                            {request.total_extent !== null && (
                              <div className="tile-row-req-proceed">
                                <span className="tile-label-req-proceed">Total Extent:</span>
                                <span className="tile-value-req-proceed">{request.total_extent} Ha</span>
                              </div>
                            )}
                            {request.time && (
                              <div className="tile-row-req-proceed">
                                <span className="tile-label-req-proceed">Time:</span>
                                <span className="tile-value-req-proceed">{request.time}</span>
                              </div>
                            )}
                            <div className="tile-row-req-proceed">
                              <span className="tile-label-req-proceed">Requested Dates:</span>
                              <span className="tile-value-req-proceed">{formatDates(request.dates)}</span>
                            </div>
                            {request.date_planed && (
                              <div className="tile-row-req-proceed">
                                <span className="tile-label-req-proceed">Planned Date:</span>
                                <span className="tile-value-req-proceed">{request.date_planed}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side: Calendar */}
        <div className="calendar-column-req-proceed">
          <div className="calendar-actions-req-proceed">
            <div className="selected-date-req-proceed">
              <span className="selected-date-label-req-proceed">Selected Date:</span>
              <span className="selected-date-value-req-proceed">
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'No date selected'}
              </span>
            </div>
            <div className="action-buttons-req-proceed">
              <button 
                className="decline-btn-req-proceed" 
                onClick={handleDeclineClick}
                disabled={isSubmitting || !selectedRequestId}
              >
                {isSubmitting ? 'Processing...' : 'Decline'}
              </button>
              <button 
                className="create-plan-btn-req-proceed" 
                onClick={handleCreateClick}
                disabled={isSubmitting || !selectedDate || !selectedRequestId}
              >
                {isSubmitting ? 'Processing...' : 'Create'}
              </button>
            </div>
          </div>
          
          {plansLoading && (
            <div className="calendar-loading-overlay-req-proceed">
              <div className="calendar-loading-content-req-proceed">
                <Bars
                  height="40"
                  width="40"
                  color="#003057"
                  ariaLabel="bars-loading"
                  visible={true}
                />
                <span>Loading calendar data...</span>
              </div>
            </div>
          )}
          {renderCalendar()}
        </div>
      </div>

      {/* Create Confirmation Modal */}
      {showCreateConfirm && selectedRequest && (
        <div className="modal-backdrop-req-proceed" onClick={() => setShowCreateConfirm(false)}>
          <div className="modal-content-req-proceed" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title-req-proceed">Confirm Create Plan</h3>
            <p className="modal-message-req-proceed">
              Are you sure you want to create a plan for <strong>{getEstateName()}</strong> on{' '}
              <strong>{selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}</strong>?
            </p>
            <div className="modal-actions-req-proceed">
              <button 
                className="modal-cancel-btn-req-proceed" 
                onClick={() => setShowCreateConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="modal-confirm-btn-req-proceed" 
                onClick={handleCreatePlan}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {showDeclineConfirm && selectedRequest && (
        <div className="modal-backdrop-req-proceed" onClick={() => setShowDeclineConfirm(false)}>
          <div className="modal-content-req-proceed" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title-req-proceed">Confirm Decline Request</h3>
            <p className="modal-message-req-proceed">
              Are you sure you want to decline the request for <strong>{getEstateName()}</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions-req-proceed">
              <button 
                className="modal-cancel-btn-req-proceed" 
                onClick={() => setShowDeclineConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="modal-decline-btn-req-proceed" 
                onClick={handleDeclinePlan}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Declining...' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-backdrop-req-proceed" onClick={() => setShowSuccess(false)}>
          <div className="modal-content-req-proceed modal-success-req-proceed" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title-req-proceed">Success</h3>
            <p className="modal-message-req-proceed">{successMessage}</p>
            <div className="modal-actions-req-proceed">
              <button 
                className="modal-ok-btn-req-proceed" 
                onClick={() => setShowSuccess(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="modal-backdrop-req-proceed" onClick={() => setShowError(false)}>
          <div className="modal-content-req-proceed modal-error-req-proceed" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title-req-proceed">Error</h3>
            <p className="modal-message-req-proceed">{errorMessage}</p>
            <div className="modal-actions-req-proceed">
              <button 
                className="modal-ok-btn-req-proceed" 
                onClick={() => setShowError(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestProceed;

