import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from "react-icons/fa";
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchPilotRevenue,
  fetchDefaultValues,
  fetchDowntimeReasons,
  addPilotRevenueThunk,
  selectPilotRevenue,
  selectDefaultValues,
  selectDowntimeReasons,
  selectLoading,
} from '../../../store/slices/financeSlice';
import '../../../styles/earings.css';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="pilotearning-custom-date-input" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="pilotearning-date-picker-input" />
    <FaCalendarAlt className="pilotearning-calendar-icon" />
  </div>
));

const Earnings = () => {
  const dispatch = useAppDispatch();
  
  // Set default date to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const [selectedDate, setSelectedDate] = useState(yesterday);
  const [pilotData, setPilotData] = useState([]);
  const [selectedPilot, setSelectedPilot] = useState(null);
  const [showPilotDetails, setShowPilotDetails] = useState(false);
  const [downtimeApprovals, setDowntimeApprovals] = useState({}); // 0=Pending, 1=Approved, 2=Declined
  const [savedPilotData, setSavedPilotData] = useState({});
  const [buttonStates, setButtonStates] = useState({});
  const [selectedDowntimeReasons, setSelectedDowntimeReasons] = useState({});
  const [showReasonPopup, setShowReasonPopup] = useState({});
  const [pendingApproval, setPendingApproval] = useState({}); // Track pilots waiting for reason selection
  const [savingPilots, setSavingPilots] = useState({}); // Track which pilots are being saved
  const [error, setError] = useState('');
  
  // Get from Redux
  const formattedDate = selectedDate.toLocaleDateString('en-CA');
  const cachedPilotRevenue = useAppSelector((state) => selectPilotRevenue(state, formattedDate));
  const defaultVals = useAppSelector(selectDefaultValues);
  const downtimeReasons = useAppSelector(selectDowntimeReasons);
  const loading = useAppSelector(selectLoading);

  // Format number with commas for display
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate pilot statistics
  const calculatePilotStats = (pilot) => {
    // Return zero values if defaultVals is not loaded yet
    if (!defaultVals.amount_per_ha_day || !defaultVals.minimum_ha_per_day || !defaultVals.amount_if_stoped) {
      return {
        assigned: "0.00",
        canceled: "0.00",
        pilotCovered: "0.00",
        opsRoomCovered: "0.00",
        coveredRevenue: "0.00",
        downtimePayment: "0.00",
        dailyEarning: "0.00",
        isDowntimeApproved: false
      };
    }

    const tasks = pilot["0"] || [];
    
    let assigned = 0;
    let canceled = 0;
    let pilotCovered = 0;
    let opsRoomCovered = 0;
    
    tasks.forEach(task => {
      // Assigned = sum of all field_area
      assigned += parseFloat(task.field_area) || 0;
      
      // Canceled = sum of field_area where status is "x"
      if (task.status === "x") {
        canceled += parseFloat(task.field_area) || 0;
      }
      
      // Pilot Covered = sum of pilot_field_area
      pilotCovered += parseFloat(task.pilot_field_area) || 0;
      
      // OpsRoom Covered = sum of dji_field_area
      opsRoomCovered += parseFloat(task.dji_field_area) || 0;
    });
    
    // Calculate Covered Revenue: (OpsRoom Covered - minimum_ha_per_day) * amount_per_ha_day
    // Only if OpsRoom Covered > minimum_ha_per_day, otherwise 0
    const amountPerHa = parseFloat(defaultVals.amount_per_ha_day);
    const minimumHaPerDay = parseFloat(defaultVals.minimum_ha_per_day);
    const coveredRevenue = opsRoomCovered > minimumHaPerDay 
      ? (opsRoomCovered - minimumHaPerDay) * amountPerHa 
      : 0;
    
    // Calculate Downtime Payment based on approval status
    const approvalStatus = downtimeApprovals[pilot.pilot_id] || 0; // 0=Pending, 1=Approved, 2=Declined
    const amountIfStopped = parseFloat(defaultVals.amount_if_stoped);
    const downtimePayment = approvalStatus === 1 ? amountIfStopped : 0; // Only approved gets payment
    
    // Calculate Daily Earning = max(Covered Revenue, Downtime Payment)
    const dailyEarning = Math.max(coveredRevenue, downtimePayment);
    
    return {
      assigned: assigned.toFixed(2),
      canceled: canceled.toFixed(2),
      pilotCovered: pilotCovered.toFixed(2),
      opsRoomCovered: opsRoomCovered.toFixed(2),
      coveredRevenue: coveredRevenue.toFixed(2),
      downtimePayment: downtimePayment.toFixed(2),
      dailyEarning: dailyEarning.toFixed(2),
      isDowntimeApproved: approvalStatus === 1 // true only if approved
    };
  };

  // Fetch default values and downtime reasons on mount
  useEffect(() => {
    if (!defaultVals) {
      dispatch(fetchDefaultValues(selectedDate));
    }
    if (downtimeReasons.length === 0) {
      dispatch(fetchDowntimeReasons());
    }
  }, [dispatch, defaultVals, downtimeReasons.length, selectedDate]);

  // Fetch pilot revenue data - moved to useEffect above

  // Fetch saved pilot earnings data
  const fetchSavedPilotData = async (date) => {
    if (!date) return;
    
    try {
      const formattedDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const result = await dispatch(baseApi.endpoints.getSavedPilotRevenueByDate.initiate(formattedDate));
      const response = result.data;
      
      if (response && response.status === "true" && response.payments) {
        const savedData = {};
        const buttonStates = {};
        const newDowntimeApprovals = {};
        const newSelectedReasons = {};
        
        response.payments.forEach(payment => {
          savedData[payment.pilot_id] = payment;
          
          // Set downtime approval status (0=Pending, 1=Approved, 2=Declined)
          newDowntimeApprovals[payment.pilot_id] = payment.downtime_approval || 0;
          
          // Set reason if approved (status = 1)
          if (payment.downtime_approval === 1 && payment.downtime_reason) {
            newSelectedReasons[payment.pilot_id] = payment.downtime_reason;
          }
          
          // Determine button state based on verification status
          if (payment.verified === 0) {
            buttonStates[payment.pilot_id] = 'save';
          } else {
            buttonStates[payment.pilot_id] = 'completed';
          }
        });
        
        setSavedPilotData(savedData);
        setButtonStates(buttonStates);
        setDowntimeApprovals(prev => ({ ...prev, ...newDowntimeApprovals }));
        setSelectedDowntimeReasons(prev => ({ ...prev, ...newSelectedReasons }));
      } else {
        // Clear all states when no data or false status
        setSavedPilotData({});
        setButtonStates({});
        setDowntimeApprovals({});
        setSelectedDowntimeReasons({});
        setPendingApproval({});
      }
    } catch (err) {
      console.error('Error fetching saved pilot data:', err);
      setSavedPilotData({});
      setButtonStates({});
      setDowntimeApprovals({});
      setSelectedDowntimeReasons({});
      setPendingApproval({});
    }
  };

  // Compare current data with saved data
  const comparePilotData = (pilot, stats) => {
    const savedData = savedPilotData[pilot.pilot_id];
    if (!savedData) return { isMatch: true, differences: [] };
    
    const differences = [];
    
    if (parseFloat(stats.assigned) !== parseFloat(savedData.assigned)) {
      differences.push({ field: 'assigned', current: stats.assigned, saved: savedData.assigned });
    }
    if (parseFloat(stats.opsRoomCovered) !== parseFloat(savedData.covered)) {
      differences.push({ field: 'covered', current: stats.opsRoomCovered, saved: savedData.covered });
    }
    if (parseFloat(stats.canceled) !== parseFloat(savedData.cancel)) {
      differences.push({ field: 'cancel', current: stats.canceled, saved: savedData.cancel });
    }
    if (parseFloat(stats.coveredRevenue) !== parseFloat(savedData.covered_revenue)) {
      differences.push({ field: 'covered_revenue', current: stats.coveredRevenue, saved: savedData.covered_revenue });
    }
    if (parseFloat(stats.downtimePayment) !== parseFloat(savedData.downtime_payment)) {
      differences.push({ field: 'downtime_payment', current: stats.downtimePayment, saved: savedData.downtime_payment });
    }
    if (parseFloat(stats.dailyEarning) !== parseFloat(savedData.total_revenue)) {
      differences.push({ field: 'total_revenue', current: stats.dailyEarning, saved: savedData.total_revenue });
    }

    // Compare downtime approval status
    const savedDowntimeApproval = savedData.downtime_approval || 0;
    const currentApprovalStatus = downtimeApprovals[pilot.pilot_id] || 0;
    if (savedDowntimeApproval !== currentApprovalStatus) {
      const statusText = { 0: 'Pending', 1: 'Approved', 2: 'Declined' };
      differences.push({ 
        field: 'downtime_approval', 
        current: statusText[currentApprovalStatus], 
        saved: statusText[savedDowntimeApproval] 
      });
    }

    // Compare downtime reason (only if both are approved)
    if (currentApprovalStatus === 1 && savedDowntimeApproval === 1) {
      const currentReason = selectedDowntimeReasons[pilot.pilot_id] || '';
      const savedReason = savedData.downtime_reason || '';
      if (currentReason !== savedReason) {
        differences.push({ field: 'downtime_reason', current: currentReason, saved: savedReason });
      }
    }
    
    return { isMatch: differences.length === 0, differences };
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    // Clear all previous data when date changes
    setPilotData([]);
    setError('');
    setSelectedPilot(null);
    setShowPilotDetails(false);
    setSavedPilotData({});
    setButtonStates({});
    setDowntimeApprovals({});
    setSelectedDowntimeReasons({});
    setShowReasonPopup({});
    setPendingApproval({});
    setSavingPilots({});
    
    // Fetch new data for the selected date
    fetchDefaultValues(date);
    fetchPilotRevenue(date);
    fetchSavedPilotData(date);
  };

  // Handle pilot name click
  const handlePilotClick = (pilot) => {
    setSelectedPilot(pilot);
    setShowPilotDetails(true);
  };

  // Close pilot details modal
  const closePilotDetails = () => {
    setShowPilotDetails(false);
    setSelectedPilot(null);
  };

  // Handle downtime approval toggle - show popup with 3 options
  const handleDowntimeApprovalToggle = (pilotId) => {
    setShowReasonPopup(prev => ({
      ...prev,
      [pilotId]: true
    }));
  };

  // Handle status selection from popup
  const handleStatusSelect = (pilotId, status) => {
    // If approved, keep popup open for reason selection (don't change status yet)
    if (status === 1) {
      // Mark as pending approval - waiting for reason selection
      setPendingApproval(prev => ({
        ...prev,
        [pilotId]: true
      }));
      // Popup stays open for reason selection - status will be set after reason selection
    } else {
      // If not approved, set status and close popup
      setDowntimeApprovals(prev => ({
        ...prev,
        [pilotId]: status
      }));
      setSelectedDowntimeReasons(prev => ({
        ...prev,
        [pilotId]: null
      }));
      setPendingApproval(prev => ({
        ...prev,
        [pilotId]: false
      }));
      setShowReasonPopup(prev => ({
        ...prev,
        [pilotId]: false
      }));
    }
  };

  // Handle reason selection
  const handleReasonSelect = (pilotId, reason) => {
    setSelectedDowntimeReasons(prev => ({
      ...prev,
      [pilotId]: reason
    }));
    
    // Now set status to Approved after reason is selected
    setDowntimeApprovals(prev => ({
      ...prev,
      [pilotId]: 1 // Set to Approved
    }));
    
    // Clear pending approval
    setPendingApproval(prev => ({
      ...prev,
      [pilotId]: false
    }));
    
    setShowReasonPopup(prev => ({
      ...prev,
      [pilotId]: false
    }));
  };

  // Close reason popup
  const closeReasonPopup = (pilotId) => {
    setShowReasonPopup(prev => ({
      ...prev,
      [pilotId]: false
    }));
    // Clear pending approval if popup is closed without selecting reason
    setPendingApproval(prev => ({
      ...prev,
      [pilotId]: false
    }));
  };

  // Handle save pilot data
  const handleSavePilotData = async (pilot, stats) => {
    // Set loading state for this pilot
    setSavingPilots(prev => ({
      ...prev,
      [pilot.pilot_id]: true
    }));

    try {
      const formattedDate = selectedDate.toLocaleDateString('en-CA');
      
      const result = await dispatch(addPilotRevenueThunk({
        pilot_id: pilot.pilot_id,
        date: formattedDate,
        assigned: parseFloat(stats.assigned),
        covered: parseFloat(stats.opsRoomCovered),
        cancel: parseFloat(stats.canceled),
        covered_revenue: parseFloat(stats.coveredRevenue),
        downtime_reason: selectedDowntimeReasons[pilot.pilot_id] || '',
        downtime_approval: downtimeApprovals[pilot.pilot_id] || 0,
        downtime_payment: parseFloat(stats.downtimePayment),
        total_revenue: parseFloat(stats.dailyEarning),
        verified: 1
      }));
      
      const response = result.payload;
      
      if (response && response.status === "true") {
        // Refresh saved data
        await fetchSavedPilotData(selectedDate);
      }
    } catch (error) {
      console.error('Error saving pilot data:', error);
    } finally {
      // Clear loading state
      setSavingPilots(prev => ({
        ...prev,
        [pilot.pilot_id]: false
      }));
    }
  };

  // Download pilot records as CSV
  const downloadPilotRecords = (pilot) => {
    if (!pilot["0"] || pilot["0"].length === 0) {
      alert('No records to download');
      return;
    }

    const tasks = pilot["0"];
    const dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // CSV headers
    const headers = [
      'Task ID',
      'Field ID', 
      'Field Name',
      'Field Area',
      'Status',
      'Reason',
      'Pilot Field Area',
      'DJI Field Area'
    ];

    // Convert data to CSV format
    const csvData = tasks.map(task => [
      task.task_id || '',
      task.field_id || '',
      task.field_name || '',
      parseFloat(task.field_area).toFixed(2),
      task.status === 'c' ? 'Completed' : 
      task.status === 'x' ? 'Cancelled' : 
      task.status === 'p' ? 'Pending' : 
      task.status === 'co' ? 'Completed' : task.status,
      task.reason || '',
      parseFloat(task.pilot_field_area).toFixed(2),
      parseFloat(task.dji_field_area).toFixed(2)
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${pilot.pilot_name}_FieldRecords_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all pilot earnings data as Excel
  const downloadEarningsExcel = () => {
    if (!pilotData || pilotData.length === 0) {
      alert('No data available to download');
      return;
    }

    const dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // Excel headers
    const headers = [
      'Pilot Name',
      'Assigned (HA)',
      'OpsRoom Covered (HA)',
      'Pilot Covered (HA)',
      'Canceled (HA)',
      'Covered Revenue',
      'Downtime Pay Approval',
      'Downtime Payment',
      'Daily Earning'
    ];

    // Convert pilot data to Excel format
    const excelData = pilotData
      .map(pilot => {
        const stats = calculatePilotStats(pilot);
        return [
          pilot.pilot_name,
          stats.assigned,
          stats.opsRoomCovered,
          stats.pilotCovered,
          stats.canceled,
          stats.coveredRevenue,
          stats.isDowntimeApproved ? 'TRUE' : 'FALSE',
          stats.downtimePayment,
          stats.dailyEarning
        ];
      })
      .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1])); // Sort by OpsRoom Covered

    // Combine headers and data
    const csvContent = [headers, ...excelData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Pilot_Earnings_Report_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initial data fetch for saved pilot data
  useEffect(() => {
    fetchSavedPilotData(selectedDate);
  }, [selectedDate]);


  return (
    <div className="pilotearning-earnings-container">
      <div className="pilotearning-earnings-header">
        <h2 className='pilotearning-earnings-header-h2'>Pilot Earnings Report - {selectedDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</h2>
        <div className="pilotearning-date-picker-container">
          <label htmlFor="earnings-date-picker">Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy/MM/dd"
            placeholderText="Select a date"
            customInput={<CustomDateInput />}
            maxDate={new Date()} // Prevent future dates
          />
          {!loading && !error && pilotData.length > 0 && (
            <button
              className="pilotearning-excel-download-btn"
              onClick={downloadEarningsExcel}
              title="Download earnings data as Excel"
            >
              📊 Excel
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="pilotearning-loading-container">
          <div className="pilotearning-loading-spinner"></div>
          <p>Loading pilot earnings data...</p>
        </div>
      )}

      {error && (
        <div className="pilotearning-error-container">
          <div className="pilotearning-error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}


      {!loading && !error && pilotData.length > 0 && (
        <div className="pilotearning-earnings-table-container">
          <div className="pilotearning-table-wrapper">
            <table className="pilotearning-excel-table">
              <thead className="pilotearning-table-header">
                <tr>
                  <th className="pilotearning-header-cell pilotearning-name-col">Name</th>
                  <th className="pilotearning-header-cell pilotearning-number-col">Assigned</th>
                  <th className="pilotearning-header-cell pilotearning-number-col">OpsRoom Covered</th>
                  <th className="pilotearning-header-cell pilotearning-number-col">Pilot Covered</th>
                  <th className="pilotearning-header-cell pilotearning-number-col">Canceled</th>
                  <th className="pilotearning-header-cell pilotearning-number-col">Covered Revenue</th>
                  <th className="pilotearning-header-cell pilotearning-center-col">Downtime Pay Approval</th>
                  <th className="pilotearning-header-cell pilotearning-number-col">Downtime Payment</th>
                  <th className="pilotearning-header-cell pilotearning-number-col">Daily Earning</th>
                  <th className="pilotearning-header-cell pilotearning-center-col">Save</th>
                </tr>
              </thead>
              <tbody className="pilotearning-table-body">
                {pilotData
                  .map(pilot => {
                    const stats = calculatePilotStats(pilot);
                    return { pilot, stats };
                  })
                  .sort((a, b) => parseFloat(b.stats.opsRoomCovered) - parseFloat(a.stats.opsRoomCovered))
                  .map(({ pilot, stats }, index) => {
                    const hasTasks = pilot["0"] && pilot["0"].length > 0;
                    const comparison = comparePilotData(pilot, stats);
                    const buttonState = buttonStates[pilot.pilot_id] || 'save';
                    const isDataMismatch = !comparison.isMatch && savedPilotData[pilot.pilot_id];
                    
                    // Determine final button state
                    let finalButtonState = buttonState;
                    if (buttonState === 'completed' && !comparison.isMatch) {
                      finalButtonState = 'update';
                    }
                    
                    return (
                      <tr 
                        key={pilot.pilot_id} 
                        className={`pilotearning-table-row ${index % 2 === 0 ? 'pilotearning-even-row' : 'pilotearning-odd-row'} ${isDataMismatch ? 'pilotearning-data-mismatch' : ''}`}
                      >
                        <td className="pilotearning-table-cell pilotearning-name-col">
                          <span 
                            className="pilotearning-pilot-name-link"
                            onClick={() => handlePilotClick(pilot)}
                            title="Click to view detailed field records"
                          >
                            {pilot.pilot_name}
                          </span>
                        </td>
                        <td className={`pilotearning-table-cell pilotearning-number-col ${comparison.differences.find(d => d.field === 'assigned') ? 'pilotearning-data-tooltip' : ''}`}
                            data-tooltip={comparison.differences.find(d => d.field === 'assigned') ? `Saved: ${comparison.differences.find(d => d.field === 'assigned').saved}` : ''}>
                          {stats.assigned}
                        </td>
                        <td className={`pilotearning-table-cell pilotearning-number-col ${comparison.differences.find(d => d.field === 'covered') ? 'pilotearning-data-tooltip' : ''}`}
                            data-tooltip={comparison.differences.find(d => d.field === 'covered') ? `Saved: ${comparison.differences.find(d => d.field === 'covered').saved}` : ''}>
                          {stats.opsRoomCovered}
                        </td>
                        <td className="pilotearning-table-cell pilotearning-number-col">
                          {stats.pilotCovered}
                        </td>
                        <td className={`pilotearning-table-cell pilotearning-number-col ${comparison.differences.find(d => d.field === 'cancel') ? 'pilotearning-data-tooltip' : ''}`}
                            data-tooltip={comparison.differences.find(d => d.field === 'cancel') ? `Saved: ${comparison.differences.find(d => d.field === 'cancel').saved}` : ''}>
                          {stats.canceled}
                        </td>
                        <td className={`pilotearning-table-cell pilotearning-number-col ${comparison.differences.find(d => d.field === 'covered_revenue') ? 'pilotearning-data-tooltip' : ''}`}
                            data-tooltip={comparison.differences.find(d => d.field === 'covered_revenue') ? `Saved: ${comparison.differences.find(d => d.field === 'covered_revenue').saved}` : ''}>
                          {formatCurrency(stats.coveredRevenue)}
                        </td>
                        <td className={`pilotearning-table-cell pilotearning-center-col ${comparison.differences.find(d => d.field === 'downtime_approval') ? 'pilotearning-data-tooltip' : ''}`}
                            data-tooltip={comparison.differences.find(d => d.field === 'downtime_approval') ? `Saved: ${comparison.differences.find(d => d.field === 'downtime_approval').saved}` : ''}>
                          <div className="pilotearning-downtime-container">
                            <button
                              className={`pilotearning-downtime-toggle pilotearning-downtime-toggle-${downtimeApprovals[pilot.pilot_id] || 0}`}
                              onClick={() => handleDowntimeApprovalToggle(pilot.pilot_id)}
                              title="Click to select status: Pending, Approved, or Declined"
                            >
                              {(() => {
                                const status = downtimeApprovals[pilot.pilot_id] || 0;
                                return status === 0 ? 'Pending' : status === 1 ? 'Approved' : 'Declined';
                              })()}
                            </button>
                            {downtimeApprovals[pilot.pilot_id] === 1 && selectedDowntimeReasons[pilot.pilot_id] && (
                              <span 
                                className={`pilotearning-warning-icon ${comparison.differences.find(d => d.field === 'downtime_reason') ? 'pilotearning-data-tooltip' : ''}`}
                                title={comparison.differences.find(d => d.field === 'downtime_reason') ? `Saved: ${comparison.differences.find(d => d.field === 'downtime_reason').saved}` : selectedDowntimeReasons[pilot.pilot_id]}
                                data-tooltip={comparison.differences.find(d => d.field === 'downtime_reason') ? `Saved: ${comparison.differences.find(d => d.field === 'downtime_reason').saved}` : ''}
                              >
                                ⚠️
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`pilotearning-table-cell pilotearning-number-col ${comparison.differences.find(d => d.field === 'downtime_payment') ? 'pilotearning-data-tooltip' : ''}`}
                            data-tooltip={comparison.differences.find(d => d.field === 'downtime_payment') ? `Saved: ${comparison.differences.find(d => d.field === 'downtime_payment').saved}` : ''}>
                          {formatCurrency(stats.downtimePayment)}
                        </td>
                        <td className={`pilotearning-table-cell pilotearning-number-col pilotearning-total-revenue ${comparison.differences.find(d => d.field === 'total_revenue') ? 'pilotearning-data-tooltip' : ''}`}
                            data-tooltip={comparison.differences.find(d => d.field === 'total_revenue') ? `Saved: ${comparison.differences.find(d => d.field === 'total_revenue').saved}` : ''}>
                          {formatCurrency(stats.dailyEarning)}
                        </td>
                        <td className="pilotearning-table-cell pilotearning-center-col">
                          <button
                            className={`pilotearning-save-button pilotearning-save-button-${finalButtonState} ${(() => {
                              const downtimeStatus = downtimeApprovals[pilot.pilot_id] || 0;
                              const isPending = downtimeStatus === 0;
                              const isCompleted = finalButtonState === 'completed';
                              const isSaving = savingPilots[pilot.pilot_id];
                              
                              // Disable if completed OR if downtime is pending OR if currently saving
                              if (isCompleted || isPending || isSaving) {
                                return 'pilotearning-save-button-disabled';
                              }
                              return '';
                            })()}`}
                            onClick={() => {
                              const downtimeStatus = downtimeApprovals[pilot.pilot_id] || 0;
                              const isPending = downtimeStatus === 0;
                              const isCompleted = finalButtonState === 'completed';
                              const isSaving = savingPilots[pilot.pilot_id];
                              
                              // Only allow click if not completed, not pending, and not currently saving
                              if (!isCompleted && !isPending && !isSaving) {
                                handleSavePilotData(pilot, stats);
                              }
                            }}
                            disabled={(() => {
                              const downtimeStatus = downtimeApprovals[pilot.pilot_id] || 0;
                              const isPending = downtimeStatus === 0;
                              const isCompleted = finalButtonState === 'completed';
                              const isSaving = savingPilots[pilot.pilot_id];
                              
                              return isCompleted || isPending || isSaving;
                            })()}
                            title={
                              (() => {
                                const downtimeStatus = downtimeApprovals[pilot.pilot_id] || 0;
                                const isPending = downtimeStatus === 0;
                                const isCompleted = finalButtonState === 'completed';
                                const isSaving = savingPilots[pilot.pilot_id];
                                
                                if (isCompleted) {
                                  return 'Data already saved and verified - Cannot modify';
                                }
                                if (isPending) {
                                  return 'Cannot save - Downtime payment approval is pending';
                                }
                                if (isSaving) {
                                  return 'Saving data...';
                                }
                                return finalButtonState === 'save' ? 'Save pilot earnings data' : 'Update pilot earnings data';
                              })()
                            }
                          >
                            {(() => {
                              const isSaving = savingPilots[pilot.pilot_id];
                              if (isSaving) {
                                return (
                                  <>
                                    <span className="pilotearning-loading-spinner-small"></span>
                                    Saving...
                                  </>
                                );
                              }
                              return finalButtonState === 'save' ? 'Proceed' :
                                     finalButtonState === 'completed' ? 'Completed' :
                                     'Update';
                            })()}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && pilotData.length === 0 && (
        <div className="pilotearning-no-data-container">
          <div className="pilotearning-no-data-icon">📊</div>
          <p>No pilot data available for the selected date</p>
        </div>
      )}

      {/* Pilot Details Modal */}
      {showPilotDetails && selectedPilot && (
        <div className="pilotearning-modal-overlay" onClick={closePilotDetails}>
          <div className="pilotearning-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="pilotearning-modal-header">
              <div className="pilotearning-modal-header-content">
                <div className="pilotearning-modal-title-section">
                  <h3>Field Records - {selectedPilot.pilot_name}</h3>
                  <p>Date: {selectedDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div className="pilotearning-modal-actions">
                  <button 
                    className="pilotearning-download-btn"
                    onClick={() => downloadPilotRecords(selectedPilot)}
                    title="Download field records as CSV"
                  >
                    📥 Download
                  </button>
                  <button className="pilotearning-modal-close" onClick={closePilotDetails}>×</button>
                </div>
              </div>
            </div>
            
            <div className="pilotearning-modal-content">
              {selectedPilot["0"] && selectedPilot["0"].length > 0 ? (
                <div className="pilotearning-details-table-container">
                  <table className="pilotearning-details-table">
                    <thead>
                      <tr>
                        <th>Task ID</th>
                        <th>Field ID</th>
                        <th>Field Name</th>
                        <th>Field Area</th>
                        <th>Status</th>
                        <th>Reason</th>
                        <th>Pilot Field Area</th>
                        <th>DJI Field Area</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPilot["0"].map((task, index) => (
                        <tr key={task.task_id || index} className={index % 2 === 0 ? 'pilotearning-even-row' : 'pilotearning-odd-row'}>
                          <td>{task.task_id}</td>
                          <td>{task.field_id}</td>
                          <td className="pilotearning-field-name">{task.field_name}</td>
                          <td className="pilotearning-number-cell">{parseFloat(task.field_area).toFixed(2)}</td>
                          <td className={`pilotearning-status-cell pilotearning-status-${task.status}`}>
                            {task.status === 'c' ? 'Completed' : 
                             task.status === 'x' ? 'Cancelled' : 
                             task.status === 'p' ? 'Pending' : 
                             task.status === 'co' ? 'Completed' : task.status}
                          </td>
                          <td className="pilotearning-reason-cell">{task.reason || '-'}</td>
                          <td className="pilotearning-number-cell">{parseFloat(task.pilot_field_area).toFixed(2)}</td>
                          <td className="pilotearning-number-cell">{parseFloat(task.dji_field_area).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="pilotearning-no-tasks">
                  <p>No field records found for this pilot on the selected date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Downtime Reason Selection Popup */}
      {Object.keys(showReasonPopup).map(pilotId => 
        showReasonPopup[pilotId] && (
          <div key={pilotId} className="pilotearning-reason-popup-overlay" onClick={() => closeReasonPopup(pilotId)}>
            <div className="pilotearning-reason-popup" onClick={(e) => e.stopPropagation()}>
              <div className="pilotearning-reason-popup-header">
                <h3>
                  {pendingApproval[pilotId] ? 'Select Downtime Reason' : 'Select Status'}
                </h3>
                <button className="pilotearning-reason-popup-close" onClick={() => closeReasonPopup(pilotId)}>×</button>
              </div>
              <div className="pilotearning-reason-popup-content">
                {pendingApproval[pilotId] ? (
                  // Pending approval: Show reason list
                  <div className="pilotearning-reason-list">
                    {downtimeReasons.map(reason => (
                      <button
                        key={reason.id}
                        className="pilotearning-reason-item"
                        onClick={() => handleReasonSelect(pilotId, reason.reason)}
                      >
                        {reason.reason}
                      </button>
                    ))}
                  </div>
                ) : (
                  // Show 3 status options
                  <div className="pilotearning-status-buttons">
                    <button
                      className="pilotearning-status-btn pilotearning-pending-btn"
                      onClick={() => handleStatusSelect(pilotId, 0)}
                    >
                      ⏳ Pending
                    </button>
                    <button
                      className="pilotearning-status-btn pilotearning-approve-btn"
                      onClick={() => handleStatusSelect(pilotId, 1)}
                    >
                      ✅ Approved
                    </button>
                    <button
                      className="pilotearning-status-btn pilotearning-decline-btn"
                      onClick={() => handleStatusSelect(pilotId, 2)}
                    >
                      ❌ Declined
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Earnings;
