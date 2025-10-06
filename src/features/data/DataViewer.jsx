import React, { useState } from 'react';
import '../../styles/dataviewer.css';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import ReportPart1 from '../../features/reports/ReportPart1';
import ReportPart2 from '../../features/reports/ReportPart2';
import ReportPart3 from '../../features/reports/ReportPart3';
import ReportPart4 from '../../features/reports/ReportPart4';
import ReportPart5 from '../../features/reports/ReportPart5';
import ReportPart6 from '../../features/reports/ReportPart6';
import ReportPart7 from '../../features/reports/ReportPart7';
import { enCA } from 'date-fns/locale';
import { format } from 'date-fns';

const DataViewer = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

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
    { id: 1, title: 'Analytics Dashboard', component: <ReportPart1 dateRange={formattedDateRange} /> },
    { id: 2, title: 'Activity Metrics', component: <ReportPart2 dateRange={formattedDateRange} /> },
    { id: 3, title: 'Pilot Performance', component: <ReportPart5 dateRange={formattedDateRange} /> },
    { id: 5, title: 'Team Lead Statistics', component: <ReportPart4 dateRange={formattedDateRange} /> },
    { id: 4, title: 'Pilot Performance', component: <ReportPart3 dateRange={formattedDateRange} /> },
    { id: 6, title: 'Pilot Performance', component: <ReportPart7 dateRange={formattedDateRange} /> },
    // { id: 6, title: 'Field Statistics', component: <ReportPart6 dateRange={formattedDateRange} /> },
  ];

  return (
    <div className="container-dataviewer">
      <div className="date-range-selector-plans">
        {showPicker && (
          <div className="date-set-dataview">
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
        <div className="button-dataview-date">
          <button
            className="toggle-picker-button"
            onClick={() => setShowPicker((prev) => !prev)}
          >
            {showPicker 
              ? 'Close Calendar' 
              : formatDateDisplay(dateRange[0].startDate, dateRange[0].endDate)
            }
          </button>
        </div>
      </div>

      <div className="grid-container-dataviewer">
        {parts.map((part) => (
          <div key={part.id} className="grid-item-dataviewer">
            {part.id <= 6 ? (
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
      
        <div>
<ReportPart6 dateRange={formattedDateRange} />
        </div>
        
    </div>
  );
};

export default DataViewer;