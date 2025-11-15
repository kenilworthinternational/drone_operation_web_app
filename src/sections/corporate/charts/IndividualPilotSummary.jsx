import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaDownload, FaUser } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchPilotRevenueReport,
  selectReportData,
  selectReportLoading,
  selectReportFilter,
  setReportFilter,
} from '../../../store/slices/reportsSlice';
import '../../../styles/individualPilotSummary.css';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="individual-pilot-custom-date-input" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="individual-pilot-date-picker-input" />
    <FaCalendarAlt className="individual-pilot-calendar-icon" />
  </div>
));

const IndividualPilotSummary = () => {
  const dispatch = useAppDispatch();
  
  // Set default dates
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [reportData, setReportData] = useState([]);
  const [error, setError] = useState('');
  
  // Get from Redux
  const startDateStr = startDate.toLocaleDateString('en-CA');
  const endDateStr = endDate.toLocaleDateString('en-CA');
  const cachedData = useAppSelector((state) =>
    selectReportData(state, 'pilotRevenueReport', startDateStr, endDateStr)
  );
  const loading = useAppSelector((state) =>
    selectReportLoading(state, 'pilotRevenueReport', startDateStr, endDateStr)
  );
  const selectedPilot = useAppSelector((state) => selectReportFilter(state, 'selectedPilot'));

  // Format currency with commas
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Handle date changes
  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  // Format date range for header
  const formatDateRangeHeader = () => {
    if (!startDate || !endDate) return '';
    
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const startYear = startDate.getFullYear();
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const endYear = endDate.getFullYear();
    
    // If same month and year, show "AUG-2025"
    if (startMonth === endMonth && startYear === endYear) {
      return `${startMonth}-${startYear}`;
    }
    
    // If same year but different months, show "AUG-OCT 2025"
    if (startYear === endYear) {
      return `${startMonth}-${endMonth} ${startYear}`;
    }
    
    // If different years, show "AUG 2025 - OCT 2026"
    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  };

  // Get unique pilots from data
  const getUniquePilots = () => {
    const pilotMap = new Map();
    reportData.forEach(dayData => {
      if (dayData.payments && dayData.payments.length > 0) {
        dayData.payments.forEach(payment => {
          if (!pilotMap.has(payment.pilot_id)) {
            pilotMap.set(payment.pilot_id, {
              pilot_id: payment.pilot_id,
              pilot_name: payment.pilot
            });
          }
        });
      }
    });
    return Array.from(pilotMap.values()).sort((a, b) => a.pilot_name.localeCompare(b.pilot_name));
  };

  // Process data for selected pilot
  const processPilotData = () => {
    if (!selectedPilot || !reportData || reportData.length === 0) {
      return { pilotData: [], days: [], totals: {} };
    }

    const pilotId = parseInt(selectedPilot);
    const pilotData = [];
    const days = [];
    const totals = {
      total_assigned: 0,
      total_covered: 0,
      total_cancel: 0,
      total_covered_revenue: 0,
      total_downtime_payment: 0,
      total_revenue: 0,
      downtime_reasons: []
    };

    reportData.forEach(dayData => {
      if (dayData.payments && dayData.payments.length > 0) {
        const pilotPayments = dayData.payments.filter(payment => payment.pilot_id === pilotId);
        if (pilotPayments.length > 0) {
          days.push(dayData.date);
          
          // Sum all payments for this pilot on this day
          const dayTotals = pilotPayments.reduce((acc, payment) => {
            acc.assigned += parseFloat(payment.assigned) || 0;
            acc.covered += parseFloat(payment.covered) || 0;
            acc.cancel += parseFloat(payment.cancel) || 0;
            acc.covered_revenue += parseFloat(payment.covered_revenue) || 0;
            acc.downtime_payment += parseFloat(payment.downtime_payment) || 0;
            acc.total_revenue += parseFloat(payment.total_revenue) || 0;
            
            // Collect downtime reasons
            if (payment.downtime_approval === 1 && payment.downtime_reason) {
              acc.downtime_reasons.push(payment.downtime_reason);
            }
            
            return acc;
          }, {
            assigned: 0,
            covered: 0,
            cancel: 0,
            covered_revenue: 0,
            downtime_payment: 0,
            total_revenue: 0,
            downtime_reasons: []
          });

          pilotData.push({
            date: dayData.date,
            ...dayTotals
          });

          // Add to grand totals
          totals.total_assigned += dayTotals.assigned;
          totals.total_covered += dayTotals.covered;
          totals.total_cancel += dayTotals.cancel;
          totals.total_covered_revenue += dayTotals.covered_revenue;
          totals.total_downtime_payment += dayTotals.downtime_payment;
          totals.total_revenue += dayTotals.total_revenue;
          totals.downtime_reasons.push(...dayTotals.downtime_reasons);
        }
      }
    });

    return { pilotData, days, totals };
  };

  // Download Excel
  const downloadExcel = () => {
    if (!selectedPilot || pilotData.length === 0) return;

    const pilots = getUniquePilots();
    const selectedPilotName = pilots.find(p => p.pilot_id.toString() === selectedPilot)?.pilot_name || 'Unknown Pilot';
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const headers = [
      'Date',
      'Assigned (HA)',
      'Covered (HA)',
      'Cancel (HA)',
      'Covered Revenue',
      'Downtime Payment',
      'Total Revenue',
      'Downtime Reasons'
    ];
    
    const csvContent = [
      headers.join(','),
      ...pilotData.map(day => [
        day.date,
        day.assigned.toFixed(2),
        day.covered.toFixed(2),
        day.cancel.toFixed(2),
        day.covered_revenue.toFixed(2),
        day.downtime_payment.toFixed(2),
        day.total_revenue.toFixed(2),
        day.downtime_reasons.join('; ') || ''
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Individual_Pilot_Summary_${selectedPilotName}_${startDateStr}_to_${endDateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data fetch is handled in the main useEffect above

  const { pilotData, days, totals } = processPilotData();
  const pilots = getUniquePilots();

  return (
    <div className="individual-pilot-summary-container">
      {/* Sticky Header Section */}
      <div className="individual-pilot-sticky-header">
        {/* Controls */}
        <div className="individual-pilot-controls-section">
          <div className="individual-pilot-controls-left">
            <div className="individual-pilot-date-controls">
              <div className="individual-pilot-date-picker">
                <label htmlFor="start-date">Start Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  dateFormat="yyyy/MM/dd"
                  placeholderText="Select start date"
                  customInput={<CustomDateInput />}
                  maxDate={endDate}
                />
              </div>
              <div className="individual-pilot-date-picker">
                <label htmlFor="end-date">End Date:</label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  dateFormat="yyyy/MM/dd"
                  placeholderText="Select end date"
                  customInput={<CustomDateInput />}
                  maxDate={new Date()}
                  minDate={startDate}
                />
              </div>
            </div>
            
            <div className="individual-pilot-dropdown">
              <label htmlFor="pilot-select">Select Pilot:</label>
              <div className="individual-pilot-select-wrapper">
                <FaUser className="individual-pilot-user-icon" />
                <select
                  id="pilot-select"
                  value={selectedPilot}
                  onChange={(e) => dispatch(setReportFilter({ filterName: 'selectedPilot', value: e.target.value }))}
                  className="individual-pilot-select"
                >
                  <option value="">Choose a pilot...</option>
                  {pilots.map(pilot => (
                    <option key={pilot.pilot_id} value={pilot.pilot_id}>
                      {pilot.pilot_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {!loading && !error && selectedPilot && pilotData.length > 0 && (
            <button
              className="individual-pilot-download-btn"
              onClick={downloadExcel}
              title="Download report as Excel"
            >
              <FaDownload /> Excel
            </button>
          )}
        </div>

        {/* Main Banner */}
        <div className="individual-pilot-main-banner">
          INDIVIDUAL PILOT SUMMARY
        </div>
      </div>

      {loading && (
        <div className="individual-pilot-loading">
          <div className="individual-pilot-spinner"></div>
          <p>Loading pilot data...</p>
        </div>
      )}

      {error && (
        <div className="individual-pilot-error">
          <div className="individual-pilot-error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && !selectedPilot && (
        <div className="individual-pilot-no-pilot">
          <div className="individual-pilot-no-pilot-icon">👤</div>
          <h3>Select a Pilot</h3>
          <p>Please select a pilot from the dropdown above to view their individual summary.</p>
        </div>
      )}

      {!loading && !error && selectedPilot && pilotData.length === 0 && (
        <div className="individual-pilot-no-data">
          <div className="individual-pilot-no-data-icon">📊</div>
          <h3>No Data Available</h3>
          <p>No data found for the selected pilot in the specified date range.</p>
        </div>
      )}

      {!loading && !error && selectedPilot && pilotData.length > 0 && (
        <div className="individual-pilot-grid-container">
          <div className="individual-pilot-grid-wrapper">
            <table className="individual-pilot-table">
              <thead>
                {/* First header row: Date range */}
                <tr className="individual-pilot-header-row-1">
                  <th className="individual-pilot-header-cell individual-pilot-empty-corner-1"></th>
                  <th className="individual-pilot-header-cell individual-pilot-date-range-header" colSpan={7}>
                    {formatDateRangeHeader()}
                  </th>
                </tr>
                {/* Second header row: Column headers */}
                <tr className="individual-pilot-header-row-2">
                  <th className="individual-pilot-header-cell individual-pilot-date-header">DATE</th>
                  <th className="individual-pilot-header-cell individual-pilot-data-header">ASSIGNED (HA)</th>
                  <th className="individual-pilot-header-cell individual-pilot-data-header">COVERED (HA)</th>
                  <th className="individual-pilot-header-cell individual-pilot-data-header">CANCEL (HA)</th>
                  <th className="individual-pilot-header-cell individual-pilot-data-header">COVERED REVENUE</th>
                  <th className="individual-pilot-header-cell individual-pilot-data-header">DOWNTIME PAYMENT</th>
                  <th className="individual-pilot-header-cell individual-pilot-data-header individual-pilot-revenue-header">TOTAL REVENUE</th>
                  <th className="individual-pilot-header-cell individual-pilot-data-header">DOWNTIME REASONS</th>
                </tr>
              </thead>
              <tbody>
                {pilotData.map((day, dayIndex) => (
                  <tr key={day.date} className={dayIndex % 2 === 0 ? 'individual-pilot-even-row' : 'individual-pilot-odd-row'}>
                    <td className="individual-pilot-date-cell">{day.date}</td>
                    <td className="individual-pilot-data-cell">{day.assigned.toFixed(2)}</td>
                    <td className="individual-pilot-data-cell">{day.covered.toFixed(2)}</td>
                    <td className="individual-pilot-data-cell">{day.cancel.toFixed(2)}</td>
                    <td className="individual-pilot-data-cell">{formatCurrency(day.covered_revenue)}</td>
                    <td className="individual-pilot-data-cell">{formatCurrency(day.downtime_payment)}</td>
                    <td className="individual-pilot-data-cell individual-pilot-revenue-cell">
                      {formatCurrency(day.total_revenue)}
                    </td>
                    <td className="individual-pilot-data-cell">{day.downtime_reasons.join('; ') || ''}</td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="individual-pilot-totals-row">
                  <td className="individual-pilot-totals-cell">TOTAL</td>
                  <td className="individual-pilot-totals-data-cell">{totals.total_assigned.toFixed(2)}</td>
                  <td className="individual-pilot-totals-data-cell">{totals.total_covered.toFixed(2)}</td>
                  <td className="individual-pilot-totals-data-cell">{totals.total_cancel.toFixed(2)}</td>
                  <td className="individual-pilot-totals-data-cell">{formatCurrency(totals.total_covered_revenue)}</td>
                  <td className="individual-pilot-totals-data-cell">{formatCurrency(totals.total_downtime_payment)}</td>
                  <td className="individual-pilot-totals-data-cell individual-pilot-grand-total">
                    {formatCurrency(totals.total_revenue)}
                  </td>
                  <td className="individual-pilot-totals-data-cell">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualPilotSummary;
