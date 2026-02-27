import React from 'react';
import { format } from 'date-fns';
import { useGetCompletedMissionReportsQuery } from '../../../../api/services NodeJs/plantationDashboardApi';
import { Bars } from 'react-loader-spinner';

const CompletedMissionReports = ({ startDate, endDate, missionType }) => {
  const { data, isLoading, isFetching, error } = useGetCompletedMissionReportsQuery({
    startDate,
    endDate,
    missionType
  });

  const allReports = data?.data || [];
  
  // Filter out reports where Completed Area (Ha) = 0
  const reports = allReports.filter(report => {
    const completedArea = parseFloat(report.completed_area || 0);
    return completedArea > 0;
  });

  // Map mission type codes to display names
  const getMissionTypeDisplayName = (missionTypeCode) => {
    if (missionTypeCode === 'spy') return 'Spray';
    if (missionTypeCode === 'spd') return 'Spread';
    return missionTypeCode || 'N/A';
  };

  if (isLoading) {
    return (
      <div className="plantation-reports-section">
        <h2 className="plantation-section-title">Completed Mission Reports (Estate Wise)</h2>
        <div className="plantation-loading">
          <Bars height="40" width="40" color="#2d8659" />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plantation-reports-section">
        <h2 className="plantation-section-title">Completed Mission Reports (Estate Wise)</h2>
        <div className="plantation-error">
          Error loading reports. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="plantation-reports-section plantation-reports-section-relative">
      <h2 className="plantation-section-title">Completed Mission Reports (Estate Wise)</h2>

      {/* Loading overlay when month changes (refetching) */}
      {isFetching && (
        <div className="plantation-reports-loading-overlay">
          <div className="plantation-reports-loading-overlay-content">
            <Bars height="48" width="48" color="#2d8659" />
            <span>Loading reports...</span>
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="plantation-no-data">
          <p>No completed mission reports found for the selected date range.</p>
        </div>
      ) : (
        <div className="plantation-reports-table-container">
          <table className="plantation-reports-table">
            <thead>
              <tr>
                <th className="plantation-table-header">Date</th>
                <th className="plantation-table-header">Estate</th>
                <th className="plantation-table-header">Mission Type</th>
                <th className="plantation-table-header" style={{ width: '140px', textAlign: 'center' }}>Planned Extent (Ha)</th>
                <th className="plantation-table-header" style={{ width: '140px', textAlign: 'center' }}>Executed Extent (Ha)</th>
                <th className="plantation-table-header" style={{ width: '140px', textAlign: 'center' }}>Covered Area (Ha)</th>
                <th className="plantation-table-header" style={{ width: '140px', textAlign: 'center' }}>Completion %</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => {
                const completionPercent = (report.actual_sprayed_fields_extent || 0) > 0
                  ? ((report.completed_area || 0) / (report.actual_sprayed_fields_extent || 0) * 100).toFixed(1)
                  : '0.0';

                return (
                  <tr key={index} className="plantation-table-row">
                    <td className="plantation-table-cell">
                      {format(new Date(report.date), 'yyyy-MM-dd')}
                    </td>
                    <td className="plantation-table-cell">
                      {report.estate_name || `Estate ${report.estate_id}`}
                    </td>
                    <td className="plantation-table-cell">
                      {getMissionTypeDisplayName(report.mission_type_name)}
                    </td>
                    <td className="plantation-table-cell" style={{ width: '140px', textAlign: 'center' }}>
                      {parseFloat(report.planned_extent || 0).toFixed(2)}
                    </td>
                    <td className="plantation-table-cell" style={{ width: '140px', color: '#10b981', textAlign: 'center' }}>
                      {parseFloat(report.actual_sprayed_fields_extent || 0).toFixed(2)}
                    </td>
                    <td className="plantation-table-cell" style={{ width: '140px', textAlign: 'center' }}>
                      {parseFloat(report.completed_area || 0).toFixed(2)}
                    </td>
                    <td className="plantation-table-cell" style={{ width: '140px', textAlign: 'center' }}>
                      <span className={`plantation-completion-badge ${parseFloat(completionPercent) >= 100 ? 'complete' : parseFloat(completionPercent) >= 80 ? 'good' : 'low'}`}>
                        {completionPercent}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompletedMissionReports;
