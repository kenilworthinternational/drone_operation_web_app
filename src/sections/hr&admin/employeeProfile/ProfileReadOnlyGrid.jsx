import React from 'react';

function displayValue(value) {
  if (value === undefined || value === null || value === '') return '—';
  return String(value);
}

export default function ProfileReadOnlyGrid({ items = [] }) {
  return (
    <div className="ep-readonly-grid">
      {items.map(({ label, value }) => (
        <div className="ep-readonly-item" key={label}>
          <span className="ep-readonly-label">{label}</span>
          <span className="ep-readonly-value">{displayValue(value)}</span>
        </div>
      ))}
    </div>
  );
}
