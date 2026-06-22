import React from 'react';

export default function PageHeader({ totalCount, filteredCount, activeFilterCount }) {
  return (
    <header className="accidentreports-page-header">
      <div className="accidentreports-page-header-text">
        <h1 className="accidentreports-title">Incident Reports</h1>
        <p className="accidentreports-subtitle">
          Review pilot-submitted incidents, attachments, and voice recordings.
        </p>
      </div>
      <div className="accidentreports-page-header-actions">
        <span className="accidentreports-count-badge">
          Showing {filteredCount} / {totalCount}
        </span>
        <span className={`accidentreports-filter-effect ${activeFilterCount ? 'active' : ''}`}>
          {activeFilterCount ? `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}` : 'No active filters'}
        </span>
      </div>
    </header>
  );
}
