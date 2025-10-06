import React, { useState, useEffect } from 'react';
import '../../styles/manageraddhoc.css';
import { adHocPlanRequest, adHocPlanView, updateAdHocPlanRequest } from '../../api/api';
import { Bars } from 'react-loader-spinner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';

const ManagerAdHocRequest = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [filteredHistoryRequests, setFilteredHistoryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // History filters state
  const [historyStartDate, setHistoryStartDate] = useState(null);
  const [historyEndDate, setHistoryEndDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEstate, setSelectedEstate] = useState('all');
  const [availableEstates, setAvailableEstates] = useState([]);

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await adHocPlanRequest();
      
      if (response && response.requests) {
        // Filter only pending requests (status: "p")
        const pending = response.requests.filter(req => req.status === 'p');
        setPendingRequests(pending);
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError(err.message);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize default dates (current month 1st to today)
  const initializeDefaultDates = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setHistoryStartDate(firstDayOfMonth);
    setHistoryEndDate(today);
    
    return {
      startDate: firstDayOfMonth.toLocaleDateString('en-CA'),
      endDate: today.toLocaleDateString('en-CA')
    };
  };

  // Fetch all requests for history
  const fetchHistoryRequests = async (startDate = null, endDate = null) => {
    try {
      setLoading(true);
      
      // Use provided dates or initialize defaults
      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          startDate: startDate,
          endDate: endDate
        };
      } else {
        dateRange = initializeDefaultDates();
      }
      
      const response = await adHocPlanView(dateRange.startDate, dateRange.endDate);
      
      if (response && response.requests) {
        setHistoryRequests(response.requests);
        
        // Extract unique estates for filter dropdown
        const estates = [...new Set(response.requests.map(req => req.estate))].filter(Boolean);
        setAvailableEstates(estates);
        
        // Apply initial filtering
        applyFilters(response.requests);
      } else {
        setHistoryRequests([]);
        setFilteredHistoryRequests([]);
        setAvailableEstates([]);
      }
    } catch (err) {
      console.error('Error fetching history requests:', err);
      setError(err.message);
      setHistoryRequests([]);
      setFilteredHistoryRequests([]);
      setAvailableEstates([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to history requests
  const applyFilters = (requests = historyRequests) => {
    let filtered = [...requests];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(req => req.status === selectedStatus);
    }

    // Filter by estate
    if (selectedEstate !== 'all') {
      filtered = filtered.filter(req => req.estate === selectedEstate);
    }

    setFilteredHistoryRequests(filtered);
  };

  // Handle date range change
  const handleDateRangeChange = async (startDate, endDate) => {
    if (startDate && endDate) {
      setHistoryStartDate(startDate);
      setHistoryEndDate(endDate);
      
      const formattedStartDate = startDate.toLocaleDateString('en-CA');
      const formattedEndDate = endDate.toLocaleDateString('en-CA');
      
      await fetchHistoryRequests(formattedStartDate, formattedEndDate);
    }
  };

  // Handle filter changes
  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
  };

  const handleEstateFilterChange = (estate) => {
    setSelectedEstate(estate);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedStatus('all');
    setSelectedEstate('all');
    applyFilters(historyRequests);
  };

  // Excel download function
  const downloadExcel = () => {
    if (filteredHistoryRequests.length === 0) {
      alert('No data to download');
      return;
    }

    // Prepare data for Excel
    const excelData = filteredHistoryRequests.map((request, index) => ({
      'S.No': index + 1,
      'Request ID': request.request_id,
      'Estate': request.estate,
      'Mission Type': request.mission_type,
      'Crop': request.crop,
      'Total Extent (ha)': request.total_extent,
      'Time Slot': request.time,
      'Date From': formatDate(request.date_from),
      'Date To': formatDate(request.date_to),
      'Planned Date': formatDate(request.date_planed) || 'Not set',
      'Status': getStatusText(request.status),
      'Fields': request.fields.map(f => `${f.field} (${f.area}ha)`).join(', '),
      'Chemicals': request.chemicals.map(c => `${c.chemical || 'Chemical ' + c.chemical_id}: ${c.quantity}kg`).join(', ')
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 8 },   // S.No
      { wch: 12 },  // Request ID
      { wch: 15 },  // Estate
      { wch: 15 },  // Mission Type
      { wch: 10 },  // Crop
      { wch: 15 },  // Total Extent
      { wch: 18 },  // Time Slot
      { wch: 12 },  // Date From
      { wch: 12 },  // Date To
      { wch: 12 },  // Planned Date
      { wch: 10 },  // Status
      { wch: 50 },  // Fields
      { wch: 40 }   // Chemicals
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'AdHoc Requests');

    // Generate filename with current date
    const now = new Date();
    const filename = `AdHoc_Requests_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingRequests();
    } else {
      fetchHistoryRequests();
    }
  }, [activeTab]);

  // Apply filters when filter values change
  useEffect(() => {
    if (activeTab === 'history' && historyRequests.length > 0) {
      applyFilters();
    }
  }, [selectedStatus, selectedEstate, historyRequests, activeTab]);

  // Handle approve button click
  const handleApprove = (request) => {
    setSelectedRequest(request);
    setSelectedDate(null);
    setShowApprovalModal(true);
  };

  // Handle decline button click
  const handleDecline = async (request) => {
    if (!window.confirm(`Are you sure you want to decline the request for ${request.estate}?`)) {
      return;
    }

    try {
      setLoading(true);
      await updateAdHocPlanRequest(request.request_id, '', 'r');
      
      // Refresh the pending requests
      await fetchPendingRequests();
      alert('Request declined successfully!');
    } catch (err) {
      console.error('Error declining request:', err);
      alert(`Error declining request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle approval confirmation
  const handleApprovalConfirm = async () => {
    if (!selectedDate) {
      alert('Please select a planned date');
      return;
    }

    try {
      setModalLoading(true);
      const formattedDate = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      await updateAdHocPlanRequest(selectedRequest.request_id, formattedDate, 'a');
      
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setSelectedDate(null);
      
      // Refresh the pending requests
      await fetchPendingRequests();
      alert('Request approved successfully!');
    } catch (err) {
      console.error('Error approving request:', err);
      alert(`Error approving request: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'null') return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'p': return 'status-pending';
      case 'a': return 'status-approved';
      case 'r': return 'status-declined';
      default: return 'status-pending';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'p': return 'Pending';
      case 'a': return 'Approved';
      case 'r': return 'Declined';
      default: return 'Unknown';
    }
  };

  // Render request card
  const renderRequestCard = (request, showActions = false) => (
    <div key={request.request_id} className="adhoc-request-card">
      <div className="adhoc-request-header">
        <div className="adhoc-estate-info">
          <h3>{request.crop} {request.mission_type} Mission in {request.estate} ({request.total_extent}ha)</h3> 
        </div>
        <div className={`adhoc-status-badge ${getStatusBadgeClass(request.status)}`}>
          {getStatusText(request.status)}
        </div>
      </div>

      <div className="adhoc-date-range">
        <div className="date-info-adhoc">
          <span className="date-label-adhoc">Requested Date Range by Manager</span>
          <span className="date-value-adhoc">
            {formatDate(request.date_from)} - {formatDate(request.date_to)}
          </span>
        </div>
        {request.date_planed && (
          <div className="date-info-adhoc">
            <span className="date-label-adhoc">Planned Date</span>
            <span className="date-value-adhoc">{formatDate(request.date_planed)}</span>
          </div>
        )}
        <div className="time-info">
          {request.time}
        </div>
      </div>

      <div className="adhoc-fields-section">
        <h4 className="adhoc-fields-section-title">
          Fields 
          <span className="total-extent-adhoc">{request.total_extent} ha</span>
        </h4>
        <div className="adhoc-fields-grid">
          {request.fields.map(field => (
            <div key={field.field_id} className="adhoc-field-item">
              <span className="field-name">{field.field}</span>
              <span className="field-area">{field.area} ha</span>
            </div>
          ))}
        </div>
      </div>

      {request.chemicals && request.chemicals.length > 0 && (
        <div className="adhoc-chemicals-section">
          <h4>Chemicals</h4>
          <div className="adhoc-chemicals-grid">
            {request.chemicals.map(chemical => (
              <div key={chemical.chemical_id} className="adhoc-chemical-item">
                <span className="chemical-name">{chemical.chemical || `Chemical ${chemical.chemical_id}`}</span>
                <span className="chemical-quantity">{chemical.quantity} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showActions && request.status === 'p' && (
        <div className="adhoc-actions">
          <button 
            className="btn btn-approve" 
            onClick={() => handleApprove(request)}
          >
            Approve
          </button>
          <button 
            className="btn btn-decline" 
            onClick={() => handleDecline(request)}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );

  if (loading && !showApprovalModal) {
    return (
      <div className="loader-container">
        <Bars color="#00BFFF" height={80} width={80} />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="manager-rescheduler-container">
      <h2 className="title-rescheduler">AdHoc Request by Manager</h2>
      <div className="tabs-addhoc">
        <button
          className={`tab-addhoc ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Requested AdHoc ({pendingRequests.length})
        </button>
        <button
          className={`tab-addhoc ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Requested AdHoc History
        </button>
      </div>

      <div className="tab-content-reschedule-manager">
        {activeTab === 'pending' ? (
          <div className="requests-list">
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => renderRequestCard(request, true))
            ) : (
              <div className="empty-state">
                <h3>No Pending AdHoc Requests</h3>
                <p>All AdHoc requests have been processed.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rescheduled-list">
            {/* Filter Controls */}
            <div className="history-filter-controls">
              <div className="filter-row">
                {/* Date Range Filter */}
                <div className="date-range-filter-group">
                  <label>Date Range:</label>
                  <div className="date-range-inputs">
                    <DatePicker
                      selected={historyStartDate}
                      onChange={(date) => {
                        setHistoryStartDate(date);
                        if (date && historyEndDate) {
                          handleDateRangeChange(date, historyEndDate);
                        }
                      }}
                      selectsStart
                      startDate={historyStartDate}
                      endDate={historyEndDate}
                      placeholderText="Start Date"
                      className="date-picker-small"
                      dateFormat="yyyy-MM-dd"
                    />
                    <span className="date-separator">to</span>
                    <DatePicker
                      selected={historyEndDate}
                      onChange={(date) => {
                        setHistoryEndDate(date);
                        if (historyStartDate && date) {
                          handleDateRangeChange(historyStartDate, date);
                        }
                      }}
                      selectsEnd
                      startDate={historyStartDate}
                      endDate={historyEndDate}
                      minDate={historyStartDate}
                      placeholderText="End Date"
                      className="date-picker-small"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="filter-group">
                  <label>Status:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="p">Pending</option>
                    <option value="a">Approved</option>
                    <option value="r">Rejected</option>
                  </select>
                </div>

                {/* Estate Filter */}
                <div className="filter-group">
                  <label>Estate:</label>
                  <select
                    value={selectedEstate}
                    onChange={(e) => handleEstateFilterChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Estates</option>
                    {availableEstates.map(estate => (
                      <option key={estate} value={estate}>
                        {estate}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button
                  className="btn-clear-filters"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
                <button
                  className="btn-download-excel"
                  onClick={downloadExcel}
                  disabled={filteredHistoryRequests.length === 0}
                >
                  📊 Download Excel ({filteredHistoryRequests.length} records)
                </button>
              </div>
            </div>

            {/* Results */}
            {filteredHistoryRequests.length > 0 ? (
              <div className="history-results">
                <div className="results-info">
                  Showing {filteredHistoryRequests.length} of {historyRequests.length} requests
                </div>
                {filteredHistoryRequests.map(request => renderRequestCard(request, false))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No AdHoc Request History Found</h3>
                <p>
                  {historyRequests.length === 0
                    ? "No AdHoc requests found for the selected date range."
                    : "No requests match the selected filters. Try adjusting your filters."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="modal-overlay">
          <div className="approval-modal">
            <div className="modal-header">
              <h3>Approve AdHoc Request</h3>
              <p>Estate: {selectedRequest?.estate}</p>
              <p>Date Range: {formatDate(selectedRequest?.date_from)} - {formatDate(selectedRequest?.date_to)}</p>
            </div>
            
            <div className="date-picker-section">
              <label htmlFor="planned-date">Select Planned Date:</label>
              <DatePicker
                id="planned-date"
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={new Date(selectedRequest?.date_from)}
                maxDate={new Date(selectedRequest?.date_to)}
                className="date-picker"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select a date"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedRequest(null);
                  setSelectedDate(null);
                }}
                disabled={modalLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleApprovalConfirm}
                disabled={modalLoading || !selectedDate}
              >
                {modalLoading ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAdHocRequest;
