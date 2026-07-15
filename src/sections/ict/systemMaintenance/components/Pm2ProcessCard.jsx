import React, { useState } from 'react';
import { FaRedo, FaFileAlt } from 'react-icons/fa';

function statusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'online') return 'sysmaint-badge--ok';
  if (s === 'stopping' || s === 'launching') return 'sysmaint-badge--warn';
  return 'sysmaint-badge--bad';
}

const Pm2ProcessCard = ({
  process,
  onViewLogs,
  onRestart,
  isRestarting,
  canViewLogs = false,
  canRestart = false,
}) => {
  const [showRestart, setShowRestart] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const handleRestart = () => {
    onRestart(process.name, confirmName, () => {
      setShowRestart(false);
      setConfirmName('');
    });
  };

  const showActions = canViewLogs || canRestart;

  return (
    <div className={`sysmaint-pm2-card ictg-pm2-card ${process.isCurrentProcess ? 'sysmaint-pm2-card--current' : ''}`}>
      <div className="sysmaint-pm2-card-header ictg-pm2-header">
        <h4>{process.name}</h4>
        <span className={`sysmaint-badge ictg-chip ${statusClass(process.status)}`}>{process.status}</span>
      </div>
      {process.isCurrentProcess && (
        <p className="sysmaint-hint sysmaint-hint--warn">
          This API instance is serving your current session. Restart from here is supported; the dashboard will reconnect shortly.
        </p>
      )}
      <div className="sysmaint-pm2-metrics ictg-pm2-metrics">
        <div>
          <span className="sysmaint-metric-label">Uptime</span>
          <span className="sysmaint-metric-value">{process.uptimeFormatted}</span>
        </div>
        <div>
          <span className="sysmaint-metric-label">CPU</span>
          <span className="sysmaint-metric-value">{process.cpu}%</span>
        </div>
        <div>
          <span className="sysmaint-metric-label">Memory</span>
          <span className="sysmaint-metric-value">{process.memoryMb} MB</span>
        </div>
        <div>
          <span className="sysmaint-metric-label">Restarts</span>
          <span className="sysmaint-metric-value">{process.restartTime}</span>
        </div>
      </div>
      {process.nodeEnv && (
        <p className="sysmaint-hint">NODE_ENV: {process.nodeEnv}</p>
      )}
      {showActions ? (
        <div className="sysmaint-pm2-actions ictg-pm2-actions">
          {canViewLogs ? (
            <button type="button" className="sysmaint-btn-secondary" onClick={() => onViewLogs(process.name)}>
              <FaFileAlt /> Logs
            </button>
          ) : null}
          {canRestart ? (
            <button type="button" className="sysmaint-btn-danger" onClick={() => setShowRestart(true)}>
              <FaRedo /> Restart
            </button>
          ) : null}
        </div>
      ) : null}

      {showRestart && canRestart && (
        <div className="sysmaint-inline-confirm">
          <p className="sysmaint-hint sysmaint-hint--warn">
            Type <strong>{process.name}</strong> to confirm restart.
          </p>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={process.name}
            className="sysmaint-input"
          />
          <div className="sysmaint-inline-confirm-actions">
            <button type="button" className="sysmaint-btn-secondary" onClick={() => setShowRestart(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="sysmaint-btn-danger"
              disabled={confirmName !== process.name || isRestarting}
              onClick={handleRestart}
            >
              {isRestarting ? 'Restarting…' : 'Confirm restart'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pm2ProcessCard;
