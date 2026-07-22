import React from 'react';

const STATUS_LABELS = {
  draft: 'Draft',
  goals_set: 'Goals set',
  active: 'Active',
  results_pending: 'Results pending',
  under_review: 'Under review',
  closed: 'Closed',
};

export default function SmartKpiReviewList({ rows, isLoading, isRefreshing = false, onOpen }) {
  if (isLoading) {
    return <div className="employee-kpi-loading">Loading SMART KPI reviews…</div>;
  }
  if (!rows.length) {
    return (
      <div className="employee-kpi-empty">
        No employee SMART KPI reviews yet for this period. Apply templates above to create employee sheets.
      </div>
    );
  }

  return (
    <div className={`employee-kpi-table-wrap smart-kpi-reviews-table-wrap${isRefreshing ? ' smart-kpi-reviews-table-wrap--refreshing' : ''}`}>
      <table className="employee-kpi-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Role</th>
            <th>Period</th>
            <th>Status</th>
            <th>Score</th>
            <th>Band</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.review_id}>
              <td>
                <div>{row.employee_name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{row.emp_no}</div>
              </td>
              <td>{row.department_name || '—'}</td>
              <td>{row.job_role || row.designation_title || '—'}</td>
              <td>{row.period_type} · {row.period_key}</td>
              <td>
                <span className={`smart-kpi-status-chip status-${row.status}`}>
                  {STATUS_LABELS[row.status] || row.status}
                </span>
              </td>
              <td className="employee-kpi-score">{row.composite_score ?? '—'}</td>
              <td>{row.rating_label || '—'}</td>
              <td>
                <button
                  type="button"
                  className="employee-kpi-btn employee-kpi-btn-secondary"
                  onClick={() => onOpen(row.review_id)}
                >
                  Open sheet
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
