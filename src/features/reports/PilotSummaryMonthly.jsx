import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaDownload } from "react-icons/fa";
import { pilotsEarnedByRevenueDateRange } from '../../api/api';
import '../../styles/pilotSummaryMonthly.css';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="pilot-summary-custom-date-input" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="pilot-summary-date-picker-input" />
    <FaCalendarAlt className="pilot-summary-calendar-icon" />
  </div>
));

const PilotSummaryMonthly = () => {
  // Set default dates
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Fetch pilot revenue data
  const fetchPilotRevenueData = async (start, end) => {
    if (!start || !end) return;
    
    setLoading(true);
    setError('');
    
    try {
      const startDateStr = start.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const endDateStr = end.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      const response = await pilotsEarnedByRevenueDateRange(startDateStr, endDateStr);
      
      if (response && response.status === true && response.payments) {
        setReportData(response.payments);
      } else {
        setReportData([]);
        setError('No data found for the selected date range');
      }
    } catch (err) {
      console.error('Error fetching pilot revenue data:', err);
      setError('Failed to fetch pilot revenue data');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle date changes
  const handleStartDateChange = (date) => {
    setStartDate(date);
    fetchPilotRevenueData(date, endDate);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    fetchPilotRevenueData(startDate, date);
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

  // Process data for summary display
  const processSummaryData = () => {
    if (!reportData || reportData.length === 0) return { pilots: [], grandTotals: {} };

    // Aggregate data by pilot
    const pilotMap = new Map();

    reportData.forEach(dayData => {
      if (dayData.payments && dayData.payments.length > 0) {
        dayData.payments.forEach(payment => {
          const pilotId = payment.pilot_id;
          
          if (!pilotMap.has(pilotId)) {
            pilotMap.set(pilotId, {
              pilot_id: pilotId,
              pilot_name: payment.pilot,
              total_assigned: 0,
              total_covered: 0,
              total_revenue: 0,
              downtime_approvals: 0
            });
          }
          
          const pilot = pilotMap.get(pilotId);
          pilot.total_assigned += parseFloat(payment.assigned) || 0;
          pilot.total_covered += parseFloat(payment.covered) || 0;
          pilot.total_revenue += parseFloat(payment.total_revenue) || 0;
          
          // Count downtime approvals (downtime_approval = 1)
          if (payment.downtime_approval === 1) {
            pilot.downtime_approvals += 1;
          }
        });
      }
    });

    const pilots = Array.from(pilotMap.values()).sort((a, b) => a.pilot_name.localeCompare(b.pilot_name));
    
    // Calculate grand totals
    const grandTotals = pilots.reduce((totals, pilot) => {
      totals.total_assigned += pilot.total_assigned;
      totals.total_covered += pilot.total_covered;
      totals.total_revenue += pilot.total_revenue;
      totals.downtime_approvals += pilot.downtime_approvals;
      return totals;
    }, {
      total_assigned: 0,
      total_covered: 0,
      total_revenue: 0,
      downtime_approvals: 0
    });

    return { pilots, grandTotals };
  };

  // Download Excel
  const downloadExcel = () => {
    const { pilots, grandTotals } = processSummaryData();
    
    if (pilots.length === 0) {
      alert('No data available to download');
      return;
    }

    const startDateStr = startDate.toLocaleDateString('en-CA');
    const endDateStr = endDate.toLocaleDateString('en-CA');
    
    // Excel headers
    const headers = [
      'Pilot Name',
      'Total Assigned (HA)',
      'Total Covered (HA)',
      'Downtime Approvals',
      'Total Revenue',
      'Average'
    ];
    
    // Convert data to Excel format
    const excelData = pilots.map(pilot => {
      const average = pilot.total_covered / 24;
      return [
        pilot.pilot_name,
        pilot.total_assigned.toFixed(2),
        pilot.total_covered.toFixed(2),
        pilot.downtime_approvals,
        pilot.total_revenue.toFixed(2),
        average.toFixed(2)
      ];
    });

    // Combine headers and data
    const csvContent = [headers, ...excelData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Pilot_Summary_Monthly_${startDateStr}_to_${endDateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initial data fetch
  useEffect(() => {
    fetchPilotRevenueData(startDate, endDate);
  }, []);

  const { pilots, grandTotals } = processSummaryData();

  return (
    <div className="pilot-summary-monthly-container">
      {/* Sticky Header Section */}
      <div className="pilot-summary-sticky-header">
        {/* Controls */}
        <div className="pilot-summary-controls-section">
          <div className="pilot-summary-date-controls">
            <div className="pilot-summary-date-picker">
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
            <div className="pilot-summary-date-picker">
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
          {!loading && !error && pilots.length > 0 && (
            <button
              className="pilot-summary-download-btn"
              onClick={downloadExcel}
              title="Download report as Excel"
            >
              <FaDownload /> Excel
            </button>
          )}
        </div>

        {/* Main Banner */}
        <div className="pilot-summary-main-banner">
          PILOT SUMMARY MONTHLY
        </div>
      </div>

      {loading && (
        <div className="pilot-summary-loading">
          <div className="pilot-summary-spinner"></div>
          <p>Loading pilot summary data...</p>
        </div>
      )}

      {error && (
        <div className="pilot-summary-error">
          <div className="pilot-summary-error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && pilots.length > 0 && (
        <div className="pilot-summary-table-container">
          <div className="pilot-summary-table-wrapper">
            <table className="pilot-summary-table">
              <thead>
                {/* First header row: Date range */}
                <tr className="pilot-summary-header-row-1">
                  <th className="pilot-summary-header-cell pilot-summary-empty-corner-1"></th>
                  <th className="pilot-summary-header-cell pilot-summary-date-range-header" colSpan={5}>
                    {formatDateRangeHeader()}
                  </th>
                </tr>
                {/* Second header row: Column headers */}
                <tr className="pilot-summary-header-row-2">
                  <th className="pilot-summary-header-cell pilot-summary-pilot-header">PILOT</th>
                  <th className="pilot-summary-header-cell pilot-summary-data-header">TOTAL ASSIGNED</th>
                  <th className="pilot-summary-header-cell pilot-summary-data-header">TOTAL COVERED</th>
                  <th className="pilot-summary-header-cell pilot-summary-data-header">DOWNTIME APPROVALS</th>
                  <th className="pilot-summary-header-cell pilot-summary-data-header pilot-summary-revenue-header">TOTAL REVENUE</th>
                  <th className="pilot-summary-header-cell pilot-summary-data-header">AVERAGE ( COVERED / 24)</th>
                </tr>
              </thead>
              <tbody>
                {pilots.map((pilot, pilotIndex) => {
                  // Calculate average (Total Covered ÷ 24 working days)
                  const average = pilot.total_covered / 24;
                  
                  return (
                    <tr key={pilot.pilot_id} className={pilotIndex % 2 === 0 ? 'pilot-summary-even-row' : 'pilot-summary-odd-row'}>
                      <td className="pilot-summary-pilot-cell">
                        {pilot.pilot_name}
                      </td>
                      <td className="pilot-summary-data-cell">
                        {pilot.total_assigned.toFixed(2)}
                      </td>
                      <td className="pilot-summary-data-cell">
                        {pilot.total_covered.toFixed(2)}
                      </td>
                      <td className="pilot-summary-data-cell">
                        {pilot.downtime_approvals}
                      </td>
                      <td className="pilot-summary-data-cell pilot-summary-revenue-cell">
                        {formatCurrency(pilot.total_revenue)}
                      </td>
                      <td className="pilot-summary-data-cell">
                        {average.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && pilots.length === 0 && (
        <div className="pilot-summary-no-data">
          <div className="pilot-summary-no-data-icon">📊</div>
          <p>No pilot summary data available for the selected date range</p>
        </div>
      )}
    </div>
  );
};

export default PilotSummaryMonthly;
