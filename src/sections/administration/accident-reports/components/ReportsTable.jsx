import React from 'react';
import { FaEye, FaBan, FaWrench } from 'react-icons/fa';
import { formatDate, formatTime, getEquipmentLabel } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import MediaIndicators from './MediaIndicators';

export default function ReportsTable({
  reports,
  isLoading,
  error,
  totalCount,
  onView,
  onDecline,
  onRepair,
}) {
  return (
    <div className="accidentreports-table-wrapper">
      <table className="accidentreports-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Pilot</th>
            <th>Estate</th>
            <th>Incident type</th>
            <th>Equipment</th>
            <th>Serial</th>
            <th>Attachments</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="11" className="accidentreports-loading-cell">
                Loading incident reports…
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="11" className="accidentreports-error-cell">
                Unable to load reports. Refresh the page and try again.
              </td>
            </tr>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <tr key={report.id}>
                <td>#{report.id}</td>
                <td>{formatDate(report.date)}</td>
                <td>{formatTime(report.time)}</td>
                <td>{report.pilot_name || 'N/A'}</td>
                <td>{report.estate_name || 'N/A'}</td>
                <td>{report.incident_type_name || 'N/A'}</td>
                <td className="accidentreports-cell-wrap">{getEquipmentLabel(report)}</td>
                <td>{report.device_serial || 'N/A'}</td>
                <td>
                  <MediaIndicators report={report} />
                </td>
                <td>
                  <StatusBadge report={report} />
                </td>
                <td>
                  <div className="accidentreports-row-actions">
                    <button
                      type="button"
                      onClick={() => onView(report)}
                      className="accidentreports-view-button"
                      title="View details"
                    >
                      <FaEye />
                    </button>
                    {!report.action ? (
                      <>
                        <button
                          type="button"
                          className="accidentreports-action-button accidentreports-action-button--decline"
                          onClick={() => onDecline(report)}
                          title="Decline"
                        >
                          <FaBan />
                        </button>
                        <button
                          type="button"
                          className="accidentreports-action-button accidentreports-action-button--repair"
                          onClick={() => onRepair(report)}
                          title="Send for repair"
                        >
                          <FaWrench />
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="accidentreports-empty-cell">
                No incident reports found
                {totalCount > 0 ? ` (${totalCount} hidden by search/filters)` : ''}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
