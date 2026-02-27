import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

const MonthRangePicker = ({ startMonth, endMonth, onChange, maxMonths = 6 }) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentYear, setCurrentYear] = useState(startMonth.getFullYear());
  const [currentEndYear, setCurrentEndYear] = useState(endMonth.getFullYear());
  const [startPickerPosition, setStartPickerPosition] = useState({ top: 0, left: 0 });
  const [endPickerPosition, setEndPickerPosition] = useState({ top: 0, left: 0 });
  const startButtonRef = useRef(null);
  const endButtonRef = useRef(null);
  const startPickerRef = useRef(null);
  const endPickerRef = useRef(null);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const updateStartPickerPosition = useCallback(() => {
    if (startButtonRef.current) {
      const rect = startButtonRef.current.getBoundingClientRect();
      setStartPickerPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
  }, []);

  const updateEndPickerPosition = useCallback(() => {
    if (endButtonRef.current) {
      const rect = endButtonRef.current.getBoundingClientRect();
      setEndPickerPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startButtonRef.current && !startButtonRef.current.contains(event.target) &&
          startPickerRef.current && !startPickerRef.current.contains(event.target)) {
        setShowStartPicker(false);
      }
      if (endButtonRef.current && !endButtonRef.current.contains(event.target) &&
          endPickerRef.current && !endPickerRef.current.contains(event.target)) {
        setShowEndPicker(false);
      }
    };

    const handleScroll = () => {
      if (showStartPicker) {
        updateStartPickerPosition();
      }
      if (showEndPicker) {
        updateEndPickerPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showStartPicker, showEndPicker, updateStartPickerPosition, updateEndPickerPosition]);

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleStartMonthSelect = (monthIndex) => {
    const newStart = new Date(currentYear, monthIndex, 1);
    const today = new Date();
    const maxEnd = new Date(newStart.getFullYear(), newStart.getMonth() + maxMonths - 1, 0);
    const actualMaxEnd = maxEnd > today ? today : maxEnd;
    
    let newEnd = endMonth;
    if (endMonth > actualMaxEnd) {
      newEnd = actualMaxEnd;
    }
    if (newStart > newEnd) {
      newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + maxMonths - 1, 0);
      if (newEnd > today) newEnd = today;
    }
    
    onChange({ start: newStart, end: newEnd });
    setShowStartPicker(false);
  };

  const handleEndMonthSelect = (monthIndex) => {
    const newEnd = new Date(currentEndYear, monthIndex + 1, 0); // Last day of selected month
    const today = new Date();
    const actualNewEnd = newEnd > today ? today : newEnd;
    const minStart = new Date(actualNewEnd.getFullYear(), actualNewEnd.getMonth() - maxMonths + 1, 1);
    
    let newStart = startMonth;
    // Ensure start is not after end
    if (newStart > actualNewEnd) {
      newStart = minStart;
    }
    // Ensure range doesn't exceed maxMonths
    const maxStart = new Date(actualNewEnd.getFullYear(), actualNewEnd.getMonth() - maxMonths + 1, 1);
    if (newStart < maxStart) {
      newStart = maxStart;
    }
    
    onChange({ start: newStart, end: actualNewEnd });
    setShowEndPicker(false);
  };

  const handleQuickSelect = (type) => {
    const today = new Date();
    let newStart, newEnd;

    switch (type) {
      case 'last6':
        newStart = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        newEnd = today;
        break;
      case 'last3':
        newStart = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        newEnd = today;
        break;
      case 'thisMonth':
        newStart = new Date(today.getFullYear(), today.getMonth(), 1);
        newEnd = today;
        break;
      case 'lastMonth':
        newStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        newEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    onChange({ start: newStart, end: newEnd });
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  const calculateMonths = () => {
    const start = startMonth;
    const end = endMonth;
    let months = 0;
    const current = new Date(start);
    while (current <= end) {
      months++;
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  return (
    <div className="plantation-month-range-picker">
      <div className="plantation-month-range-display">
        <div className="plantation-month-range-input-wrapper">
          <button
            type="button"
            ref={startButtonRef}
            className="plantation-month-range-btn"
            onClick={() => {
              if (!showStartPicker) {
                updateStartPickerPosition();
              }
              setShowStartPicker(!showStartPicker);
              setShowEndPicker(false);
              setCurrentYear(startMonth.getFullYear());
            }}
          >
            <FaCalendarAlt className="plantation-month-icon" />
            <span>{formatMonth(startMonth)}</span>
          </button>
          {showStartPicker && (
            <div 
              className="plantation-month-picker-dropdown plantation-month-picker-dropdown-fixed" 
              ref={startPickerRef}
              style={{
                top: `${startPickerPosition.top}px`,
                left: `${startPickerPosition.left}px`
              }}
            >
              <div className="plantation-month-picker-header">
                <button
                  type="button"
                  className="plantation-month-picker-nav"
                  onClick={() => setCurrentYear(currentYear - 1)}
                >
                  <FaChevronLeft />
                </button>
                <span className="plantation-month-picker-year">{currentYear}</span>
                <button
                  type="button"
                  className="plantation-month-picker-nav"
                  onClick={() => setCurrentYear(currentYear + 1)}
                  disabled={currentYear >= new Date().getFullYear()}
                >
                  <FaChevronRight />
                </button>
              </div>
              <div className="plantation-month-picker-grid">
                {months.map((month, index) => {
                  const isSelected = startMonth.getFullYear() === currentYear && startMonth.getMonth() === index;
                  const isDisabled = new Date(currentYear, index, 1) > new Date();
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`plantation-month-picker-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && handleStartMonthSelect(index)}
                      disabled={isDisabled}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
              <div className="plantation-month-picker-quick-actions">
                <button type="button" onClick={() => handleQuickSelect('last6')}>Last 6 Months</button>
                <button type="button" onClick={() => handleQuickSelect('last3')}>Last 3 Months</button>
                <button type="button" onClick={() => handleQuickSelect('thisMonth')}>This Month</button>
              </div>
            </div>
          )}
        </div>

        <span className="plantation-month-range-separator">to</span>

        <div className="plantation-month-range-input-wrapper">
          <button
            type="button"
            ref={endButtonRef}
            className="plantation-month-range-btn"
            onClick={() => {
              if (!showEndPicker) {
                updateEndPickerPosition();
              }
              setShowEndPicker(!showEndPicker);
              setShowStartPicker(false);
              setCurrentEndYear(endMonth.getFullYear());
            }}
          >
            <FaCalendarAlt className="plantation-month-icon" />
            <span>{formatMonth(endMonth)}</span>
          </button>
          {showEndPicker && (
            <div 
              className="plantation-month-picker-dropdown plantation-month-picker-dropdown-fixed" 
              ref={endPickerRef}
              style={{
                top: `${endPickerPosition.top}px`,
                left: `${endPickerPosition.left}px`
              }}
            >
              <div className="plantation-month-picker-header">
                <button
                  type="button"
                  className="plantation-month-picker-nav"
                  onClick={() => setCurrentEndYear(currentEndYear - 1)}
                >
                  <FaChevronLeft />
                </button>
                <span className="plantation-month-picker-year">{currentEndYear}</span>
                <button
                  type="button"
                  className="plantation-month-picker-nav"
                  onClick={() => setCurrentEndYear(currentEndYear + 1)}
                  disabled={currentEndYear >= new Date().getFullYear()}
                >
                  <FaChevronRight />
                </button>
              </div>
              <div className="plantation-month-picker-grid">
                {months.map((month, index) => {
                  const monthDate = new Date(currentEndYear, index + 1, 0); // Last day of month
                  const isSelected = endMonth.getFullYear() === currentEndYear && endMonth.getMonth() === index;
                  const today = new Date();
                  const isDisabled = monthDate > today || 
                                   new Date(currentEndYear, index, 1) < startMonth;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`plantation-month-picker-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && handleEndMonthSelect(index)}
                      disabled={isDisabled}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
              <div className="plantation-month-picker-quick-actions">
                <button type="button" onClick={() => handleQuickSelect('thisMonth')}>This Month</button>
                <button type="button" onClick={() => handleQuickSelect('lastMonth')}>Last Month</button>
              </div>
            </div>
          )}
        </div>

        <span className="plantation-month-range-info">
          ({calculateMonths()} {calculateMonths() === 1 ? 'month' : 'months'})
        </span>
      </div>
    </div>
  );
};

export default MonthRangePicker;
