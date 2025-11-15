import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaDownload } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchPilotRevenueReport,
  selectReportData,
  selectReportLoading,
} from '../../../store/slices/reportsSlice';
import '../../../styles/pilotRevenueDaily.css';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="pilot-revenue-custom-date-input" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="pilot-revenue-date-picker-input" />
    <FaCalendarAlt className="pilot-revenue-calendar-icon" />
  </div>
));

const PilotRevenueDaily = () => {
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
  useEffect(() => {
    const fetchPilotRevenueData = async () => {
      if (!startDate || !endDate) return;
      
      setError('');
      
      // Check if we have cached data
      if (cachedData && cachedData.status === true && cachedData.payments) {
        setReportData(cachedData.payments);
        return;
      }
      
      // Fetch from API via Redux
      try {
        const result = await dispatch(fetchPilotRevenueReport({
          startDate: startDateStr,
          endDate: endDateStr
        }));
        
        if (fetchPilotRevenueReport.fulfilled.match(result)) {
          const response = result.payload.data;
          if (response && response.status === true && response.payments) {
            setReportData(response.payments);
          } else {
            setReportData([]);
            setError('No data found for the selected date range');
          }
        } else {
          setReportData([]);
          setError('Failed to fetch pilot revenue data');
        }
      } catch (err) {
        console.error('Error fetching pilot revenue data:', err);
        setError('Failed to fetch pilot revenue data');
        setReportData([]);
      }
    };
    
    fetchPilotRevenueData();
  }, [startDate, endDate, cachedData, dispatch, startDateStr, endDateStr]);

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

  // Process data for grid display
  const processDataForGrid = () => {
    if (!reportData || reportData.length === 0) return { pilots: [], days: [], gridData: {} };

    // Get all unique pilots
    const pilotMap = new Map();
    const days = [];

    reportData.forEach(dayData => {
      const date = dayData.date;
      days.push(date);
      
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

    const pilots = Array.from(pilotMap.values()).sort((a, b) => a.pilot_name.localeCompare(b.pilot_name));
    
    // Create grid data
    const gridData = {};
    pilots.forEach(pilot => {
      gridData[pilot.pilot_id] = {};
      days.forEach(day => {
        gridData[pilot.pilot_id][day] = 0;
      });
    });

    // Fill grid with actual data
    reportData.forEach(dayData => {
      const date = dayData.date;
      if (dayData.payments && dayData.payments.length > 0) {
        dayData.payments.forEach(payment => {
          if (gridData[payment.pilot_id] && gridData[payment.pilot_id][date] !== undefined) {
            gridData[payment.pilot_id][date] += parseFloat(payment.total_revenue) || 0;
          }
        });
      }
    });

    return { pilots, days, gridData };
  };

  // Download Excel
  const downloadExcel = () => {
    const { pilots, days, gridData } = processDataForGrid();
    
    if (pilots.length === 0 || days.length === 0) {
      alert('No data available to download');
      return;
    }

    const startDateStr = startDate.toLocaleDateString('en-CA');
    const endDateStr = endDate.toLocaleDateString('en-CA');
    
    // Excel headers
    const headers = ['Pilot Name', ...days, 'TOTAL'];
    
    // Convert data to Excel format
    const excelData = pilots.map(pilot => {
      const row = [pilot.pilot_name];
      days.forEach(day => {
        const revenue = gridData[pilot.pilot_id][day] || 0;
        row.push(revenue.toFixed(2));
      });
      // Add pilot total
      const pilotTotal = days.reduce((sum, day) => {
        return sum + (gridData[pilot.pilot_id][day] || 0);
      }, 0);
      row.push(pilotTotal.toFixed(2));
      return row;
    });
    
    // Add totals row
    const totalsRow = ['TOTAL'];
    days.forEach(day => {
      const dayTotal = pilots.reduce((sum, pilot) => {
        return sum + (gridData[pilot.pilot_id][day] || 0);
      }, 0);
      totalsRow.push(dayTotal.toFixed(2));
    });
    // Add grand total
    const grandTotal = pilots.reduce((grandTotal, pilot) => {
      return grandTotal + days.reduce((sum, day) => {
        return sum + (gridData[pilot.pilot_id][day] || 0);
      }, 0);
    }, 0);
    totalsRow.push(grandTotal.toFixed(2));
    excelData.push(totalsRow);

    // Combine headers and data
    const csvContent = [headers, ...excelData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Pilot_Revenue_Daily_${startDateStr}_to_${endDateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data fetch is handled in the main useEffect above

  const { pilots, days, gridData } = processDataForGrid();

  return (
    <div className="pilot-revenue-daily-container">
      {/* Sticky Header Section */}
      <div className="pilot-revenue-sticky-header">
        {/* Controls */}
        <div className="pilot-revenue-controls-section">
          <div className="pilot-revenue-date-controls">
            <div className="pilot-revenue-date-picker">
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
            <div className="pilot-revenue-date-picker">
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
              className="pilot-revenue-download-btn"
              onClick={downloadExcel}
              title="Download report as Excel"
            >
              <FaDownload /> Excel
            </button>
          )}
        </div>

        {/* Main Banner - Now positioned after controls */}
        <div className="pilot-revenue-main-banner">
          PILOT REVENUE
        </div>
      </div>

      {loading && (
        <div className="pilot-revenue-loading">
          <div className="pilot-revenue-spinner"></div>
          <p>Loading pilot revenue data...</p>
        </div>
      )}

      {error && (
        <div className="pilot-revenue-error">
          <div className="pilot-revenue-error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && pilots.length > 0 && (
        <div className="pilot-revenue-grid-container">
          <div className="pilot-revenue-grid-wrapper">
            <table className="pilot-revenue-grid-table">
              <thead>
                {/* First header row: Date range */}
                <tr className="pilot-revenue-header-row-1">
                  <th className="pilot-revenue-header-cell pilot-revenue-empty-corner-1"></th>
                  <th className="pilot-revenue-header-cell pilot-revenue-date-range-header" colSpan={days.length}>
                    {formatDateRangeHeader()}
                  </th>
                  <th className="pilot-revenue-header-cell pilot-revenue-empty-corner-2"></th>
                </tr>
                {/* Second header row: Column headers */}
                <tr className="pilot-revenue-header-row-2">
                  <th className="pilot-revenue-header-cell pilot-revenue-pilot-header">PILOT</th>
                  {days.map((day) => {
                    // Extract day number from date string (YYYY-MM-DD format)
                    const dayNumber = new Date(day).getDate();
                    return (
                      <th key={day} className="pilot-revenue-header-cell pilot-revenue-day-header">
                        {dayNumber}
                      </th>
                    );
                  })}
                  <th className="pilot-revenue-header-cell pilot-revenue-total-header">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {pilots.map((pilot, pilotIndex) => {
                  // Calculate total revenue for this pilot
                  const pilotTotal = days.reduce((sum, day) => {
                    return sum + (gridData[pilot.pilot_id][day] || 0);
                  }, 0);
                  
                  return (
                    <tr key={pilot.pilot_id} className={pilotIndex % 2 === 0 ? 'pilot-revenue-even-row' : 'pilot-revenue-odd-row'}>
                      <td className="pilot-revenue-pilot-cell">
                        {pilot.pilot_name}
                      </td>
                      {days.map(day => {
                        const revenue = gridData[pilot.pilot_id][day] || 0;
                        return (
                          <td key={day} className="pilot-revenue-data-cell">
                            {revenue > 0 ? formatCurrency(revenue) : ''}
                          </td>
                        );
                      })}
                      <td className="pilot-revenue-total-cell">
                        {formatCurrency(pilotTotal)}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr className="pilot-revenue-totals-row">
                  <td className="pilot-revenue-totals-cell">TOTAL</td>
                  {days.map(day => {
                    const dayTotal = pilots.reduce((sum, pilot) => {
                      return sum + (gridData[pilot.pilot_id][day] || 0);
                    }, 0);
                    return (
                      <td key={day} className="pilot-revenue-totals-data-cell">
                        {formatCurrency(dayTotal)}
                      </td>
                    );
                  })}
                  <td className="pilot-revenue-totals-data-cell pilot-revenue-grand-total">
                    {formatCurrency(
                      pilots.reduce((grandTotal, pilot) => {
                        return grandTotal + days.reduce((sum, day) => {
                          return sum + (gridData[pilot.pilot_id][day] || 0);
                        }, 0);
                      }, 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && pilots.length === 0 && (
        <div className="pilot-revenue-no-data">
          <div className="pilot-revenue-no-data-icon">📊</div>
          <p>No pilot revenue data available for the selected date range</p>
        </div>
      )}
    </div>
  );
};

export default PilotRevenueDaily;
