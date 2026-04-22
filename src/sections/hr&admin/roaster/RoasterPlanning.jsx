import React, { useMemo, useState } from 'react';
import '../../../styles/roasterPlanning.css';
import { useGetHrRosterPlanQuery, useSaveHrRosterPlanMutation } from '../../../api/services NodeJs/hrLeaveApi';
import { useGetAllEmployeeRegistrationsQuery } from '../../../api/services NodeJs/jdManagementApi';

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

const RoasterPlanning = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editableRows, setEditableRows] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  const [localRoster, setLocalRoster] = useState([]);
  const { data: employeeResponse } = useGetAllEmployeeRegistrationsQuery();
  const employeesRaw = employeeResponse?.data || employeeResponse?.employees || [];
  const { data: rosterResponse, refetch } = useGetHrRosterPlanQuery({ monthKey: selectedMonth });
  const [saveRosterPlan, { isLoading: savingRoster }] = useSaveHrRosterPlanMutation();

  const monthDays = useMemo(() => getMonthDays(selectedMonth), [selectedMonth]);
  const dayGridStyle = useMemo(() => ({}), []);
  const rosterEntries = rosterResponse?.data?.entries || rosterResponse?.entries || [];

  const rosterFromServer = useMemo(() => {
    const byEmployee = {};
    rosterEntries.forEach((entry) => {
      const id = Number(entry.employee_id);
      if (!byEmployee[id]) {
        byEmployee[id] = {
          id,
          name: entry.employeeName || `Employee ${id}`,
          role: entry.employeeJobRoleName || '-',
          leaveDays: [],
          attendance: { attended: [], absent: [] },
        };
      }
      if (Number(entry.leave_planned) === 1) {
        byEmployee[id].leaveDays.push(entry.work_date);
      }
    });

    const normalized = (employeesRaw || []).map((emp) => {
      const id = Number(emp.id);
      if (byEmployee[id]) return byEmployee[id];
      return {
        id,
        name: emp.employeeName || emp.name || `Employee ${id}`,
        role: emp.employeeJobRoleName || emp.designation || '-',
        leaveDays: [],
        attendance: { attended: [], absent: [] },
      };
    });

    return normalized;
  }, [employeesRaw, rosterEntries]);

  const roster = localRoster.length ? localRoster : rosterFromServer;

  const toggleRowEdit = (employeeId) => {
    setEditableRows((prev) => ({ ...prev, [employeeId]: !prev[employeeId] }));
  };

  const handleDayClick = (employeeId, dateString) => {
    if (!editableRows[employeeId]) return;

    const nextRoster = roster.map((emp) => {
      if (emp.id !== employeeId) return emp;
      const hasDay = emp.leaveDays.includes(dateString);
      return {
        ...emp,
        leaveDays: hasDay ? emp.leaveDays.filter((day) => day !== dateString) : [...emp.leaveDays, dateString],
      };
    });
    setSaveStatus('Unsaved changes');
    setLocalRoster(nextRoster);
  };

  const saveChanges = async () => {
    try {
      const entries = [];
      roster.forEach((emp) => {
        monthDays.forEach((day) => {
          entries.push({
            employeeId: emp.id,
            workDate: day.dateString,
            shiftCode: null,
            shiftLabel: null,
            leavePlanned: emp.leaveDays.includes(day.dateString),
          });
        });
      });
      await saveRosterPlan({ monthKey: selectedMonth, entries }).unwrap();
      setSaveStatus('Roster saved');
      setLocalRoster([]);
      refetch();
    } catch (error) {
      setSaveStatus(error?.data?.message || 'Failed to save roster');
    }
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
              setLocalRoster([]);
            }}
          />
        </div>
        <button type="button" className="roaster-primary-btn" onClick={saveChanges} disabled={savingRoster}>
          {savingRoster ? 'Saving...' : 'Save Roster'}
        </button>
        {saveStatus ? <p>{saveStatus}</p> : null}
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

