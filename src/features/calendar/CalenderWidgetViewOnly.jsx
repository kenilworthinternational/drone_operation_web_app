import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Don't forget to include the CSS file!
import '../../styles/calendarwidget.css';
import { Bars } from 'react-loader-spinner';
import { getUpdateMissionDetails, divisionStateList, submitUpdatePlan, submitRescheduledPlan, getRescheduleMissionDetails, findPlanByID } from '../../api/api';
import { VscDebugRestart } from "react-icons/vsc";

const CalendarWidgetViewonly = ({ tasksData = [], currentMonth }) => {
  const [state, setState] = useState({
    divisionOptions: [],
    selectedFields: new Set(),
    totalExtent: 0,
    selectedEstate: null,
    selectedMissionType: null,
    selectedCropType: null,
    selectedDate: null
  });
  const rescheduleMap = new Map();
  tasksData.forEach(task => {
    if (task.mission_id !== 0) {
      rescheduleMap.set(task.id, task.mission_id); // Key: rescheduled plan ID, Value: original plan ID
    }
  });
  // Step 2: Process tasks and determine their rescheduling status
  const groupedTasks = tasksData.reduce((acc, task) => {
    const { id, date, estate, area, flag, mission_id } = task;

    const rescheduledFromId = rescheduleMap.get(id); // If exists, this task was rescheduled from another task
    const rescheduledToId = [...rescheduleMap.entries()]
      .find(([rescheduledId, originalId]) => originalId === id)?.[0]; // If exists, this task was rescheduled into another plan

    let taskName = `${estate} - ${area} Ha, ${flag}, ${mission_id}, ${id}`;
    const rpPng = '../assets/images/rp.png';
    const apPng = '../assets/images/ap.png';
    const npPng = '../assets/images/np.png';

    let taskImage = null;

    if (flag === "ap") {
      if (rescheduledToId && mission_id !== 0) {
        taskName = `⌚${estate} - ${area} Ha`;
        taskImage = rpPng; // Image for rescheduled from
      }
      else if (rescheduledToId && mission_id === 0) {
        taskName = `⌚${estate} - ${area} Ha`;
        taskImage = apPng; // Image for rescheduled from
      }
      else if (rescheduledFromId) {
        taskName = `${estate} - ${area} Ha`;
        taskImage = rpPng; // Image for rescheduled from
      } else {
        taskName = `${estate} - ${area} Ha`;
        taskImage = apPng; // Image for rescheduled from
      }
    } else if (flag === "np") {
      if (rescheduledToId) {
        taskName = `⌚ ${estate} - ${area} Ha`;
        taskImage = npPng;
      }
      else {
        taskName = `${estate} - ${area} Ha`;
        taskImage = npPng; // Image for rescheduled from
      }
    }


    console.log(taskName); // Debugging output


    let color = '#BEBEBE'; // Default Gray
    if (task.date < new Date().toLocaleDateString('en-CA') && task.completed === 0) color = '#FF0000'; // Red (past & incomplete)
    else if (task.team_assigned === 0) color = '#FF7300'; // Orange
    else if (task.activated === 0) color = '#BEBEBE'; // Gray
    else if (task.manager_approval === 0) color = '#FFE656'; // Yellow
    else if (task.completed === 1) color = '#1EFF00'; // Green (completed)
    else color = '#0245FFFF'; // Blue (all approvals done)

    if (!acc[date]) acc[date] = [];
    acc[date].push({ ...task, name: taskName, icon: taskImage, color });

    return acc;
  }, {});

  const renderTasks = (date) => {
    const tasks = groupedTasks[date] || [];

    return tasks.map((task) => (
      <div key={task.id} className="task-container" >
         <div className="task-icon" style={{ backgroundColor: task.color }} />
        <span className="task-name">{task.name}</span>
       
      </div>

    ));
  };


  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let startDay = firstDay.getDay();
    if (startDay === 0) startDay = 6;
    else startDay -= 1;

    return (
      <>
        <div className="narrations"><div className="task-icon" style={{ backgroundColor: "#1EFF00" }} />
          <span>Task is Completed</span>
          <div className="task-icon" style={{ backgroundColor: "#FFE656" }} />
          <span>In Manager Approvals to Implement</span>
          <div className="task-icon" style={{ backgroundColor: "#FF7300" }} />
          <span>In Resources Implement.</span>
          <div className="task-icon" style={{ backgroundColor: "#FF0000" }} />
          <span>Overdue and Incomplete.</span>
          <div className="task-icon" style={{ backgroundColor: "#BEBEBE" }} />
          <span>Not Activated.</span>

        </div>

        <div className="days-header">
          {dayNames.map((day) => (
            <div key={day} className="day-name">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {[...Array(startDay)].map((_, i) => (
            <div key={`empty-${i}`} className="date-cell empty" />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
            return (
              <div key={date} className="date-cell">
                <div className="date">{i + 1}</div>
                <div className="tasks">{renderTasks(date)}</div>
              </div>
            );
          })}
        </div>
      </>
    );
  };


  return (
    <div className="calendar">
      {renderCalendar()}
    </div>
  );
};

export default CalendarWidgetViewonly;
