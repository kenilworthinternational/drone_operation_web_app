import React from 'react';
import '../css/calenderview.css';
import CalendarWidget from '../Widgets/CalenderWidget';
const CalenderView = () => {
  return (
    <div className="calender-view-main">
      <h2>Our CalenderView</h2>
      <CalendarWidget />
    </div>
  );
};

export default CalenderView;
