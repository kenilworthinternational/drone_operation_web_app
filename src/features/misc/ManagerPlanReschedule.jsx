import React, { useState, useEffect } from 'react';
import '../../styles/managerrescheduler.css';
import { pendingRequestReschedule, submitManagerRequestRescheduledPlan, changeManagerStatus } from '../../api/api';
import { Bars } from 'react-loader-spinner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ManagerPlanReschedule = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedDates, setSelectedDates] = useState({});
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [dateFilterType, setDateFilterType] = useState('original');
  const [selectedEstate, setSelectedEstate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [processingRequestId, setProcessingRequestId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await pendingRequestReschedule();
        const data = Array.isArray(response) ? response : [];

        // Convert date strings to Date objects
        const initialDates = {};
        data.forEach(request => {
          try {
            if (request.reschedule_request_id) {
              initialDates[request.reschedule_request_id] = new Date(request.plan_date + 'T00:00:00');
            }
          } catch (e) {
            console.error('Date conversion error:', e);
          }
        });

        setRequests(data);
        setSelectedDates(initialDates);

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const handleDateChange = (date, requestId) => {
    setSelectedDates(prev => ({
      ...prev,
      [requestId]: date
    }));
  };
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString; // Return raw string if conversion fails
    }
  };
  const pendingRequests = requests?.filter(request => request.status === 'p') || [];
  const rescheduledRequests = requests?.filter(request => request.status !== 'p') || [];

  if (loading) {
    return (
      <div className="loader-container">
        <Bars color="#00BFFF" height={80} width={80} />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  const handleApprove = async (request) => {
    const selectedDate = selectedDates[request.reschedule_request_id];
    // Validate selected date exists
    if (!selectedDate) {
      alert('Please select a date before approving');
      return;
    }

    // Create date objects with normalized time (midnight)
    const normalizeDate = (dateString) => {
      const d = new Date(dateString);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const fromDate = normalizeDate(request.from_date);
    const toDate = normalizeDate(request.last_date);
    const checkDate = normalizeDate(selectedDate);

    // Validate date range
    if (checkDate < fromDate || checkDate > toDate) {
      alert(`Selected date must be between ${request.from_date} and ${request.last_date}`);
      return;
    }
    
    setProcessingRequestId(request.reschedule_request_id);
    try {
      if (!request.fields?.length) {
        throw new Error('No fields found in this request');
      }

      // 🗂️ Group fields by division_id
      const divisionsMap = request.fields.reduce((acc, field) => {
        const divisionId = field.division_id;
        if (!divisionId) {
          throw new Error(`Field ${field.field_id} missing division information`);
        }

        if (!acc[divisionId]) acc[divisionId] = [];
        acc[divisionId].push(field);
        return acc;
      }, {});


      console.log("Divisions grouped by ID:", divisionsMap);

      // 🏗️ Build divisions array with correct keys
      const divisions = Object.entries(divisionsMap).map(([divisionId, fields]) => ({
        divisionId: Number(divisionId),
        checkedFields: fields.map(field => {
          const area = parseFloat(field.field_area);
          if (isNaN(area)) {
            throw new Error(`Invalid area for field ${field.field_id}`);
          }
          return {
            field_id: field.field_id,
            field_name: field.short_name,
            field_area: area
          };
        })
      }));


      console.log("Formatted divisions:", divisions);

      // 📐 Calculate total extent
      const totalExtent = divisions
        .flatMap(d => d.checkedFields) // ✅ Use the correct property name
        .reduce((sum, field) => sum + field.field_area, 0)
        .toFixed(2);

      // 📨 Final data to submit
      const submissionData = {
        flag: "ap",
        missionId: request.plan_id,
        groupId: request.group_id,
        plantationId: request.plantation_id,
        regionId: request.region_id,
        estateId: request.estate_id,
        missionTypeId: request.mission_type,
        cropTypeId: request.crop_type_id,
        totalExtent,
        pickedDate: selectedDate.toLocaleDateString('en-CA'),
        managerRequested: "1",
        divisions
      };

      console.log('📤 Submitting payload to API:', submissionData);

      // 🛰️ Submit to backend
      const response = await submitManagerRequestRescheduledPlan(submissionData);

      console.log('✅ Submission response:', response);

      if (!response?.id) {
        throw new Error('Invalid API response format');
      }

      // 🟢 Update manager status after approval
      await changeManagerStatus({
        reschedule_request_id: request.reschedule_request_id,
        fixed_date: submissionData.pickedDate,
        status: "a",
        new_plan: response.id
      });

      // 🔄 Update local state to reflect approval
      setRequests(prev =>
        prev.map(req =>
          req.reschedule_request_id === request.reschedule_request_id
            ? { ...req, status: 'a', fixed_date: submissionData.pickedDate }
            : req
        )
      );

    } catch (error) {
      console.error('❌ Approval failed:', error);
      alert(`Approval failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleDecline = async (request) => {
    if (!window.confirm('Are you sure you want to decline this request?')) return;

    setProcessingRequestId(request.reschedule_request_id);
    try {
      // 🟢 Update manager status for rejection
      await changeManagerStatus({
        reschedule_request_id: request.reschedule_request_id,
        fixed_date: "1111-11-11", // Default value for declined
        status: "r", // 'r' for rejected
        new_plan: 0 // Default value
      });

      // 🔄 Update local state
      setRequests(prev =>
        prev.map(req =>
          req.reschedule_request_id === request.reschedule_request_id
            ? { ...req, status: 'r' }
            : req
        )
      );

    } catch (error) {
      console.error('❌ Decline failed:', error);
      alert(`Decline failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const filteredRescheduled = rescheduledRequests.filter(request => {
    if (selectedStatus !== 'all' && request.status !== selectedStatus) return false;
    // Estate filter
    if (selectedEstate && request.estate_name !== selectedEstate) return false;

    // Date filter
    if (filterStartDate || filterEndDate) {
      const dateToCheck = dateFilterType === 'original'
        ? new Date(request.plan_date)
        : new Date(request.fixed_date);

      if (filterStartDate && dateToCheck < filterStartDate) return false;
      if (filterEndDate && dateToCheck > filterEndDate) return false;
    }

    return true;
  });


  return (
    <div className="manager-content-inner">
      <div className="tabs-planrescheduler1">
        <button
          className={`tab-planrescheduler1 ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Reschedule Requests ({pendingRequests.length})
        </button>
        <button
          className={`tab-planrescheduler1 ${activeTab === 'rescheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('rescheduled')}
        >
          Rescheduled 
        </button>
      </div>

      <div className="tab-content-reschedule-manager">
        {activeTab === 'pending' ? (
          <div className="requests-list">
            {pendingRequests.map(request => (
              <div key={request.reschedule_request_id} className="request-card">
                <div className="request-header">
                  <h3>{request.estate_name}</h3>
                  <span className="date-range-rescheduler">Planned Date : {request.plan_date}</span>
                  <div className="date-range-rescheduler">
                    <span>Reschedule Request Date Range :- </span>
                    {formatDate(request.from_date)} - {formatDate(request.last_date)}
                  </div>
                </div>

                <div className="fields-section">
                  <h4>Fields:</h4>
                  <div className="fields-grid">
                    {request.fields.map(field => (
                      <div key={field.field_id} className="field-item-rescheduler">
                        <span>{field.short_name} -</span>
                        <span>: {field.field_area} ha</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="reschedule-controls">
                  <span>Select Date</span>
                  <DatePicker
                    selected={selectedDates[request.reschedule_request_id]}
                    onChange={(date) => handleDateChange(date, request.reschedule_request_id)}
                    minDate={new Date(request.from_date + 'T00:00:00')}
                    maxDate={new Date(request.last_date + 'T23:59:59')}
                    className="date-picker"
                    dateFormat="yyyy-MM-dd"
                  />
                  <div className="button-group">
                    <button
                      className="btn approve"
                      onClick={() => handleApprove(request)}
                      disabled={processingRequestId === request.reschedule_request_id}
                    >
                      {processingRequestId === request.reschedule_request_id ? (
                        <>
                          <span className="btn-loading-spinner"></span>
                          Processing...
                        </>
                      ) : (
                        'Approve'
                      )}
                    </button>
                    <button
                      className="btn decline"
                      onClick={() => handleDecline(request)}
                      disabled={processingRequestId === request.reschedule_request_id}
                    >
                      {processingRequestId === request.reschedule_request_id ? 'Processing...' : 'Decline'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="empty-state">No pending reschedule requests</div>
            )}
          </div>
        ) : (
          <div className="rescheduled-list">
            <div className="filter-controls">
              <div className="status-filter">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="a">Approved</option>
                  <option value="r">Declined</option>
                </select>
              </div>

              <div className="estate-filter">
                <select
                  value={selectedEstate || ''}
                  onChange={(e) => setSelectedEstate(e.target.value || null)}
                >
                  <option value="">All Estates</option>
                  {Array.from(new Set(rescheduledRequests.map(request => request.estate_name)))
                    .filter(name => name) // Remove empty/null names
                    .map(estateName => (
                      <option key={estateName} value={estateName}>
                        {estateName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="date-filter-type">
                <select
                  value={dateFilterType}
                  onChange={(e) => setDateFilterType(e.target.value)}
                >
                  <option value="original">Previous Date</option>
                  <option value="rescheduled">Rescheduled Date</option>
                </select>
              </div>
              <div className="date-range-filter">
                <DatePicker
                  selected={filterStartDate}
                  onChange={date => setFilterStartDate(date)}
                  placeholderText="Start Date"
                  maxDate={filterEndDate}
                />
                <DatePicker
                  selected={filterEndDate}
                  onChange={date => setFilterEndDate(date)}
                  placeholderText="End Date"
                  minDate={filterStartDate}
                />
                <button
                  className="btn clear-filter"
                  onClick={() => {
                    setFilterStartDate(null);
                    setFilterEndDate(null);
                    setSelectedStatus('all');
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {filteredRescheduled.map(request => (
              <div key={request.reschedule_request_id} className="request-card">
                <div className="request-header">
                  <h3>{request.estate_name}</h3>
                  <div className={`status-badge-large ${request.status === 'a' ? 'status-approved-vibrant' : 'status-declined-vibrant'}`}>
                    {request.status === 'a' ? '✓ APPROVED' : '✗ DECLINED'}
                  </div>
                </div>
                <div className="history-date-range-compact">
                  <span className="history-date-item">
                    <span className="history-label">Previous:</span>
                    <span className="history-date">{formatDate(request.plan_date)}</span>
                  </span>
                  {request.fixed_date && (
                    <span className="history-date-item">
                      <span className="history-label">Rescheduled:</span>
                      <span className="history-date">
                        {request.fixed_date === '1111-11-11' ? 'Declined' : formatDate(request.fixed_date)}
                      </span>
                    </span>
                  )}
                </div>

                <div className="fields-section">
                  <h4>Fields:</h4>
                  <div className="fields-grid">
                    {request.fields.map(field => (
                      <div key={field.field_id} className="field-item-rescheduler">
                        <span>{field.short_name} -</span>
                        <span>: {field.field_area} ha</span>
                      </div>
                    ))}
                  </div>
                </div>


              </div>
            ))}

            {filteredRescheduled.length === 0 && (
              <div className="empty-state">
                {rescheduledRequests.length === 0
                  ? "No rescheduled requests found"
                  : "No requests found in selected date range"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPlanReschedule;
