import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useGetIctMetricsSummaryQuery,
  useGetIctProjectsQuery,
  useGetIctSprintsQuery,
} from '../../../api/services NodeJs/ictDevelopmentApi';
import '../../../styles/ictDevelopment.css';

function getCurrentMonthValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getMonthDateRange(monthValue) {
  if (!/^\d{4}-\d{2}$/.test(String(monthValue || ''))) {
    return { from: '', to: '' };
  }
  const [yearRaw, monthRaw] = String(monthValue).split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!year || !month) {
    return { from: '', to: '' };
  }
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${yearRaw}-${monthRaw}-01`,
    to: `${yearRaw}-${monthRaw}-${String(lastDay).padStart(2, '0')}`,
  };
}

function MetricCard({ title, value }) {
  return (
    <div className="ict-dev-card">
      <div className="ict-dev-kpi-title">{title}</div>
      <div className="ict-dev-kpi-value">{value}</div>
    </div>
  );
}

function MetricsDashboard() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [dueMonth, setDueMonth] = useState(getCurrentMonthValue());
  const { data: projects = [] } = useGetIctProjectsQuery();
  const { data: sprints = [] } = useGetIctSprintsQuery(projectId ? { project_id: Number(projectId) } : {});

  const payload = useMemo(() => {
    const query = {};
    const dateRange = getMonthDateRange(dueMonth);
    if (projectId) query.project_id = Number(projectId);
    if (sprintId) query.sprint_id = Number(sprintId);
    if (dateRange.from) query.due_date_from = dateRange.from;
    if (dateRange.to) query.due_date_to = dateRange.to;
    return query;
  }, [projectId, sprintId, dueMonth]);

  const { data: summary = {}, isLoading } = useGetIctMetricsSummaryQuery(payload);
  const totals = summary.totals || {};
  const byStage = summary.by_stage || [];
  const byStatus = summary.by_status || [];

  return (
    <div className="ict-dev-page ict-dev-stack">
      <div className="ict-dev-page-header ict-dev-page-header-balanced">
        <div className="ict-dev-page-actions">
          <button className="ict-dev-btn-secondary" type="button" onClick={() => navigate({ pathname: '/home/ict/development/dev-center', search: routerLocation.search })}>
            Back to Dev Center
          </button>
        </div>
        <div className="ict-dev-page-center">
          <h2 className="ict-dev-page-title">Metrics Dashboard</h2>
          <p className="ict-dev-page-subtitle">Track sprint and extra-work execution with consistent SDLC insights.</p>
        </div>
        <div className="ict-dev-page-actions" />
      </div>

      <div className="ict-dev-card ict-dev-section">
        <h3 className="ict-dev-section-title">Filters</h3>
        <div className="ict-dev-grid-3">
          <select className="ict-dev-select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_code} - {project.project_name}
              </option>
            ))}
          </select>
          <select className="ict-dev-select" value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
            <option value="">All sprints</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.sprint_name}
              </option>
            ))}
          </select>
          <input
            className="ict-dev-input"
            type="month"
            value={dueMonth}
            onChange={(e) => setDueMonth(e.target.value)}
            aria-label="Estimated end date range month"
            title="Estimated end date range month"
          />
        </div>
      </div>

      {isLoading && <p className="ict-dev-loading-state">Loading metrics...</p>}

      {!isLoading && (
        <>
          <div className="ict-dev-kpi-grid">
            <MetricCard title="Total Items" value={totals.total_items || 0} />
            <MetricCard title="Completed" value={totals.completed_items || 0} />
            <MetricCard title="Pending" value={totals.pending_items || 0} />
            <MetricCard title="Sprint Work" value={totals.sprint_items || 0} />
            <MetricCard title="Extra Work" value={totals.extra_items || 0} />
          </div>

          <div className="ict-dev-grid-2">
            <div className="ict-dev-card">
              <h3 className="ict-dev-section-title">By SDLC Stage</h3>
              {byStage.length === 0 && <p className="ict-dev-empty-state">No data.</p>}
              {byStage.length > 0 && (
                <ul>
                  {byStage.map((row) => (
                    <li key={row.workflow_stage}>
                      <span className={`ict-dev-chip ict-dev-chip-stage-${row.workflow_stage}`}>{row.workflow_stage}</span> {row.count}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="ict-dev-card">
              <h3 className="ict-dev-section-title">By Status</h3>
              {byStatus.length === 0 && <p className="ict-dev-empty-state">No data.</p>}
              {byStatus.length > 0 && (
                <ul>
                  {byStatus.map((row) => (
                    <li key={row.workflow_status}>
                      <span className={`ict-dev-chip ${row.workflow_status === 'done' ? 'ict-dev-chip-status-done' : 'ict-dev-chip-status-pending'}`}>
                        {row.workflow_status}
                      </span> {row.count}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MetricsDashboard;
