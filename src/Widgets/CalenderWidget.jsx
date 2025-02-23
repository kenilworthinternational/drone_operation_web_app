import React, { useEffect, useState } from 'react';
import '../css/calendarwidget.css';

const tasksData = {
  // Sample data for demonstration
  '2025-02-21': [
    { id: 1, name: 'Task 1', color: 'red', details: 'Details for Task 1' },
    { id: 2, name: 'Task 2', color: 'yellow', details: 'Details for Task 2' },
  ],
  '2025-02-22': [
    { id: 3, name: 'Task 3', color: 'green', details: 'Details for Task 3' },
  ],
};

const CalendarWidget = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const handleTaskClick = (details) => {
    alert(details);
  };

  const renderTasks = (date) => {
    const tasks = tasksData[date] || [];
    return tasks.map((task) => (
      <div
        key={task.id}
        className={`task-container ${task.color}`}
        onClick={() => handleTaskClick(task.details)}
      >
        <div className="task-icon" style={{ backgroundColor: task.color }} />
        <span>{task.name}</span>
      </div>
    ));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const calendar = [];

    // Fill in the empty cells before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      calendar.push(<div key={`empty-${i}`} className="date-cell" />);
    }

    // Fill in the actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      calendar.push(
        <div key={date} className="date-cell">
          <div className="date">{i}</div>
          <div className="tasks">{renderTasks(date)}</div>
        </div>
      );
    }

    return calendar;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>Previous</button>
        <h3>{currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}</h3>
        <button onClick={handleNextMonth}>Next</button>
      </div>
      {renderCalendar()}
    </div>
  );
};

export default CalendarWidget;
