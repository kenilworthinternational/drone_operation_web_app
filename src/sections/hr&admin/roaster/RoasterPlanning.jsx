import React, { useMemo, useState } from 'react';
import '../../../styles/roasterPlanning.css';

const initialEmployees = [
  {
    id: 1,
    name: 'Employee 01',
    role: 'Pilot',
    plannedLeaveDays: ['2025-11-05', '2025-11-06', '2025-11-07', '2025-11-18', '2025-11-19'],
    attendance: {
      attended: ['2025-11-01', '2025-11-02', '2025-11-03'],
      absent: ['2025-11-08'],
    },
  },
  {
    id: 2,
    name: 'Employee 02',
    role: 'Ground Crew',
    plannedLeaveDays: ['2025-11-12'],
    attendance: {
      attended: ['2025-11-04', '2025-11-05'],
      absent: [],
    },
  },
  {
    id: 3,
    name: 'Employee 03',
    role: 'Ops Support',
    plannedLeaveDays: ['2025-11-02', '2025-11-03', '2025-11-04'],
    attendance: {
      attended: ['2025-11-06', '2025-11-07'],
      absent: ['2025-11-10'],
    },
  },
];

const formatDate = (year, month, day) => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getMonthDays = (monthValue) => {
  const [year, month] = monthValue.split('-').map(Number);
  const totalDays = new Date(year, month, 0).getDate();
  return Array.from({ length: totalDays }, (_, idx) => {
    const day = idx + 1;
    const dateObj = new Date(year, month - 1, day);
    const weekday = dateObj.toLocaleString('en-US', { weekday: 'short' });
    return {
      label: String(day).padStart(2, '0'),
      weekday,
      dateString: formatDate(year, month, day),
      isWeekend: [0, 6].includes(dateObj.getDay()),
    };
  });
};

const expandRangeToDays = (start, end) => {
  const days = [];
  let current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    const iso = current.toISOString().slice(0, 10);
    days.push(iso);
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const prepareRoster = (data) =>
  data.map((emp) => ({
    id: emp.id,
    name: emp.name,
    role: emp.role,
    leaveDays: [...emp.plannedLeaveDays],
    attendance: {
      attended: emp.attendance?.attended ?? [],
      absent: emp.attendance?.absent ?? [],
    },
  }));

const RoasterPlanning = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-11');
  const [roster, setRoster] = useState(() => prepareRoster(initialEmployees));
  const [editableRows, setEditableRows] = useState(() =>
    Object.fromEntries(initialEmployees.map((emp) => [emp.id, false]))
  );

  const monthDays = useMemo(() => getMonthDays(selectedMonth), [selectedMonth]);
  const dayGridStyle = useMemo(() => ({}), []);

  const toggleRowEdit = (employeeId) => {
    setEditableRows((prev) => ({ ...prev, [employeeId]: !prev[employeeId] }));
  };

  const handleDayClick = (employeeId, dateString) => {
    if (!editableRows[employeeId]) return;

    setRoster((current) =>
      current.map((emp) => {
        if (emp.id !== employeeId) return emp;

        const hasDay = emp.leaveDays.includes(dateString);

        return {
          ...emp,
          leaveDays: hasDay
            ? emp.leaveDays.filter((day) => day !== dateString)
            : [...emp.leaveDays, dateString],
        };
      })
    );
  };

  return (
    <div className="roaster-planning-page">
      <section className="planning-controls-roaster">
        <div className="control-field-roaster">
          <label htmlFor="planning-month">Planning Month</label>
          <input
            id="planning-month"
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
            }}
          />
        </div>
      </section>

      <section className="planning-board-roaster">
        <div className="status-legend-roaster">
          <span className="legend-pill-roaster leave-pill-roaster">Leave Planned</span>
          <span className="legend-pill-roaster attended-pill-roaster">Attended</span>
          <span className="legend-pill-roaster absent-pill-roaster">Absent</span>
          <span className="legend-pill-roaster editing-pill-roaster">Editing Mode</span>
        </div>
        <div className="timeline-header-roaster">
          <div className="employee-col-roaster">Employee</div>
          <div className="days-row-roaster days-row-header-roaster" style={dayGridStyle}>
            {monthDays.map((day) => (
              <div key={day.dateString} className={`day-header-roaster ${day.isWeekend ? 'weekend' : ''}`}>
                <span>{day.label}</span>
                <small>{day.weekday}</small>
              </div>
            ))}
          </div>
        </div>

        {roster.map((employee) => (
          <div key={employee.id} className={`timeline-row-roaster ${editableRows[employee.id] ? 'timeline-row-editing-roaster' : ''}`}>
            <div className={`employee-col-roaster ${editableRows[employee.id] ? 'editing' : ''}`}>
              <div>
                <p className="employee-name-roaster">{employee.name}</p>
                <small>{employee.role}</small>
              </div>
              <button
                type="button"
                className={`row-edit-btn-roaster ${editableRows[employee.id] ? 'active' : ''}`}
                onClick={() => toggleRowEdit(employee.id)}
                aria-label={editableRows[employee.id] ? 'Save changes' : 'Enable editing'}
              >
                {editableRows[employee.id] ? '✔' : '✏️'}
              </button>
            </div>
            <div className="days-row-roaster" style={dayGridStyle}>
              {monthDays.map((day) => {
                const isLeave = employee.leaveDays.includes(day.dateString);
                const isAttended = employee.attendance.attended.includes(day.dateString);
                const isAbsent = employee.attendance.absent.includes(day.dateString);
                const locked = !editableRows[employee.id];
                return (
                  <button
                    type="button"
                    key={`${employee.id}-${day.dateString}`}
                    className={`day-cell-roaster ${day.isWeekend ? 'weekend' : ''} ${isAttended ? 'attended' : ''} ${isAbsent ? 'absent' : ''} ${
                      locked ? 'locked' : ''
                    } ${isLeave ? 'leave' : ''}`}
                    title={day.dateString}
                    onClick={() => handleDayClick(employee.id, day.dateString)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default RoasterPlanning;

