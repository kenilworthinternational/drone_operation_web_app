import React from 'react';
import { useEmployee } from './useEmployee';
import EmployeePhotoUpload from './EmployeePhotoUpload';

function statusTone(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return 'active';
  if (s === 'resigned' || s === 'terminated' || s === 'retired') return 'inactive';
  if (s === 'suspended') return 'warning';
  return 'neutral';
}

export default function EmployeeProfileHero({ employeeId }) {
  const { employee, isLoading, refetch } = useEmployee(employeeId);

  if (isLoading || !employee) {
    return (
      <div className="ep-hero ep-hero--loading">
        <p>Loading profile…</p>
      </div>
    );
  }

  const title = employee.employeeName || employee.preferredName || `Employee ${employeeId}`;
  const status = employee.employeeStatus || employee.workStatus || '—';
  const tone = statusTone(status);

  return (
    <div className="ep-hero">
      <div className="ep-hero-main">
        <div className="ep-hero-text">
          <div className="ep-hero-title-row">
            <h2 className="ep-hero-title">{title}</h2>
            <span className={`ep-status-pill ep-status-pill--${tone}`}>{status}</span>
          </div>
          <p className="ep-hero-subtitle">
            {employee.empNo || '—'}
            {employee.departmentName ? ` · ${employee.departmentName}` : ''}
            {(employee.designation || employee.employeeJobRoleName)
              ? ` · ${employee.designation || employee.employeeJobRoleName}`
              : ''}
          </p>
          <div className="ep-hero-metrics">
            <span><strong>NIC:</strong> {employee.nic || '—'}</span>
            <span><strong>Mobile:</strong> {employee.mobileNumber || '—'}</span>
            {employee.emailAddress ? (
              <span><strong>Email:</strong> {employee.emailAddress}</span>
            ) : null}
          </div>
        </div>
      </div>
      <EmployeePhotoUpload
        employeeId={employeeId}
        employee={employee}
        onUploaded={refetch}
        size="hero"
      />
    </div>
  );
}
