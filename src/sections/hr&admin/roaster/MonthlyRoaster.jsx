import React, { useMemo, useState } from 'react';
import '../../../styles/monthlyRoaster.css';
import { useGetHrRosterPlanQuery } from '../../../api/services NodeJs/hrLeaveApi';

const estates = ['All Estates', 'Pedro', 'Bogawantalawa', 'Kenilworth'];
const departments = ['Operations', 'Pilots', 'Ground Crew', 'Office Staff'];

const statusBadgeClass = {
  'On Track': 'status-on-track',
  Attention: 'status-attention',
  Critical: 'status-critical',
};

const MonthlyRoaster = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEstate, setSelectedEstate] = useState('All Estates');
  const [selectedDepartment, setSelectedDepartment] = useState('Operations');
  const { data: rosterResponse, refetch, isFetching } = useGetHrRosterPlanQuery({ monthKey: selectedMonth });
  const entries = rosterResponse?.data?.entries || rosterResponse?.entries || [];
  const monthlyRosterData = useMemo(() => {
    return entries.map((entry) => {
      const dateObj = new Date(entry.work_date);
      const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const attendance = entry.leave_planned ? 0 : 1;
      return {
        date: entry.work_date,
        day,
        shift: entry.shift_label || '-',
        lead: entry.employeeName || '-',
        estate: selectedEstate === 'All Estates' ? '-' : selectedEstate,
        department: selectedDepartment,
        headCount: 1,
        attendance,
        status: entry.leave_planned ? 'Attention' : 'On Track',
      };
    });
  }, [entries, selectedDepartment, selectedEstate]);

  const filteredRoster = useMemo(() => {
    return monthlyRosterData.filter((entry) => {
      const estateMatch = selectedEstate === 'All Estates' || entry.estate === selectedEstate;
      const deptMatch = entry.department === selectedDepartment;
      return estateMatch && deptMatch;
    });
  }, [selectedEstate, selectedDepartment]);

  const summaryCards = [
    { label: 'Total Planned Headcount', value: filteredRoster.reduce((sum, row) => sum + row.headCount, 0) },
    { label: 'Actual Attendance', value: filteredRoster.reduce((sum, row) => sum + row.attendance, 0) },
    {
      label: 'Attendance %',
      value: filteredRoster.length
        ? `${Math.round(
            (filteredRoster.reduce((sum, row) => sum + row.attendance, 0) /
              filteredRoster.reduce((sum, row) => sum + row.headCount, 0)) *
              100
          )}%`
        : '0%',
    },
  ];

  return (
    <div className="roaster-page">
      <header className="roaster-header">
        <div>
          <p className="roaster-eyebrow">HR & Admin • Attendance Management</p>
          <h1>Monthly Roaster Overview</h1>
          <p className="roaster-subtitle">Track attendance compliance across estates and departments.</p>
        </div>
        <button type="button" className="roaster-outline-btn">
          Export Summary
        </button>
      </header>

      <section className="roaster-filters">
        <div className="filter-field">
          <label htmlFor="filter-month">Month</label>
          <input
            id="filter-month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="filter-field">
          <label htmlFor="filter-estate">Estate</label>
          <select id="filter-estate" value={selectedEstate} onChange={(e) => setSelectedEstate(e.target.value)}>
            {estates.map((estate) => (
              <option key={estate} value={estate}>
                {estate}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="filter-department">Department</label>
          <select
            id="filter-department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="roaster-primary-btn" onClick={refetch}>
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      <section className="roaster-summary">
        {summaryCards.map((card) => (
          <article key={card.label} className="summary-card">
            <p className="summary-label">{card.label}</p>
            <p className="summary-value">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="roaster-table-wrapper">
        <header className="roaster-table-header">
          <div>
            <h2>Planned Shifts</h2>
            <p>Detailed attendance coverage for {selectedMonth}</p>
          </div>
          <div className="status-legend">
            <span className="legend-bullet on-track" />
            <span>On Track</span>
            <span className="legend-bullet attention" />
            <span>Attention</span>
            <span className="legend-bullet critical" />
            <span>Critical</span>
          </div>
        </header>
        <div className="roaster-table-scroll">
          <table className="roaster-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Lead</th>
                <th>Estate</th>
                <th>Headcount</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.map((row) => (
                <tr key={`${row.date}-${row.shift}`}>
                  <td>
                    <span className="date-text">{row.date}</span>
                    <span className="date-subtext">{row.day}</span>
                  </td>
                  <td>{row.shift}</td>
                  <td>{row.lead}</td>
                  <td>{row.estate}</td>
                  <td>{row.headCount}</td>
                  <td>{row.attendance}</td>
                  <td>
                    <span className={`status-pill ${statusBadgeClass[row.status]}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MonthlyRoaster;

