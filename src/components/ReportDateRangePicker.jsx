import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/reportDateRangePicker.css';

/**
 * Single-input date range picker (one calendar, start + end selection).
 * Used across #/home/reports/* and related report screens.
 */
const ReportDateRangePicker = ({
  label = 'Date range',
  startDate,
  endDate,
  onChange,
  disabled = false,
  className = '',
  inputClassName = 'report-date-range-input',
  wrapperClassName = '',
  dateFormat = 'dd-MM-yyyy',
  maxDate = new Date(),
  minDate = null,
  placeholderText = 'Select date range',
  popperPlacement = 'bottom-start',
  showLabel = true,
  shouldCloseOnSelect = false,
  readOnly = false,
  calendarClassName = '',
  popperClassName = '',
  openToDate = null,
}) => {
  const handleChange = (dates) => {
    const [start, end] = dates ?? [];
    if (start == null && end == null) return;
    onChange?.(start, end ?? null);
  };

  return (
    <div className={`report-date-range ${className}`.trim()}>
      {showLabel && label ? (
        <label className="report-date-range-label">{label}</label>
      ) : null}
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={handleChange}
        disabled={disabled}
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        className={inputClassName}
        wrapperClassName={wrapperClassName || undefined}
        maxDate={maxDate}
        minDate={minDate ?? undefined}
        openToDate={openToDate ?? startDate ?? undefined}
        isClearable={false}
        shouldCloseOnSelect={shouldCloseOnSelect}
        readOnly={readOnly}
        calendarClassName={calendarClassName || undefined}
        popperClassName={popperClassName || undefined}
        popperPlacement={popperPlacement}
      />
    </div>
  );
};

export default ReportDateRangePicker;
