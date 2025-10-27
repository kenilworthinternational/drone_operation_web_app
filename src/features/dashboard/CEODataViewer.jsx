import React, { useState } from 'react';
import '../../styles/ceodataviewer.css';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import ReportPartCEO2 from '../../features/reports/CEOCoveredAreasReport';
import ReportPartCEO1 from '../../features/reports/CEOPlanAreasReport';
import ReportPartCEOBottom from '../../features/reports/CEOUpcomingPlansReport';
import { enCA } from 'date-fns/locale';
import { format } from 'date-fns';

const CEODataViewer = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [state, setState] = useState({
    dropdownOptions: [],
    plantationOptions: [],
    regionOptions: [],
    estateOptions: [],
  });
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const formattedDateRange = {
    startDate: dateRange[0].startDate.toLocaleDateString('en-CA'),
    endDate: dateRange[0].endDate.toLocaleDateString('en-CA'),
  };

  // Format date for display (e.g., "Jun 1 - Jun 7, 2023")
  const formatDateDisplay = (start, end) => {
    const startFormat = format(start, 'MMM d');
    let endFormat = format(end, 'MMM d');

    // Add year if dates are in different years
    if (start.getFullYear() !== end.getFullYear()) {
      endFormat += `, ${end.getFullYear()}`;
    }

    // Add year to end if same year but different month
    if (start.getMonth() !== end.getMonth() && start.getFullYear() === end.getFullYear()) {
      endFormat += `, ${end.getFullYear()}`;
    }

    // Add year to both if same year and same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startFormat} - ${endFormat}, ${end.getFullYear()}`;
    }

    return `${startFormat} - ${endFormat}`;
  };

  const parts = [
    { id: 1, title: 'Analytics Dashboard', component: <ReportPartCEO1 dateRange={formattedDateRange} /> },
    { id: 2, title: 'Activity Metrics', component: <ReportPartCEO2 dateRange={formattedDateRange} /> },
  ];

  return (
    <div className="container-dataviewerceo">
      <div className="date-range-selector-plansceo">
        {showPicker && (
          <div className="date-set-dataviewceo">
            <DateRangePicker
              onChange={handleSelect}
              ranges={dateRange}
              showSelectionPreview={true}
              moveRangeOnFirstSelection={false}
              months={2}
              direction="horizontal"
              locale={enCA}
            />
          </div>
        )}
        <div className="button-dataview-dateceo">
          <button
            className="toggle-picker-buttonceo"
            onClick={() => setShowPicker((prev) => !prev)}
          >
            {showPicker
              ? 'Close Calendar'
              : formatDateDisplay(dateRange[0].startDate, dateRange[0].endDate)
            }
          </button>
        </div>
      </div>

      <div className="grid-container-dataviewerceo">
        {parts.map((part) => (
          <div key={part.id} className="grid-item-dataviewerceo">
            {part.id <= 3 ? (
              React.cloneElement(part.component, { dateRange: formattedDateRange })
            ) : (
              <>
                <h3>{part.title}</h3>
                <p>{part.content}</p>
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="calender-data-ceoceo">
        <ReportPartCEOBottom dateRange={dateRange[0]} />
      </div>
    </div>
  );
};

export default CEODataViewer;