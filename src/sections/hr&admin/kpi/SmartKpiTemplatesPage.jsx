import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SmartKpiTemplatesPanel from '../../ict/masterData/SmartKpiTemplatesPanel';
import '../../../styles/employeeKpi.css';

function buildEmployeeKpiUrl(wing) {
  const base = '/home/attendance/employee-kpi';
  return wing ? `${base}?wing=${encodeURIComponent(wing)}` : base;
}

export default function SmartKpiTemplatesPage() {
  const [searchParams] = useSearchParams();
  const wingLabel = searchParams.get('wing') || '';
  const [message, setMessage] = useState(null);

  return (
    <div className="employee-kpi-container">
      <div className="employee-kpi-header">
        <Link className="smart-kpi-hrm-back-link" to={buildEmployeeKpiUrl(wingLabel)}>
          ← Back to Employee KPI
        </Link>
        <h1>SMART KPI Templates</h1>
        <p>Configure department and role-specific SMART KPI templates (Specific, Measurable, Achievable, Relevant, Time-bound).</p>
        {wingLabel ? <span className="employee-kpi-wing-badge">{wingLabel}</span> : null}
      </div>

      {message ? (
        <div className={message.type === 'error' ? 'employee-kpi-error smart-kpi-hrm-flash' : 'smart-kpi-success-msg smart-kpi-hrm-flash'}>
          {message.text}
        </div>
      ) : null}

      <SmartKpiTemplatesPanel variant="hrm" showHeader={false} onMessage={setMessage} />
    </div>
  );
}
