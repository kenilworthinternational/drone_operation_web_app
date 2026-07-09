import React, { useState } from 'react';
import { FaDatabase, FaPlay } from 'react-icons/fa';

function backupAgeBadge(lastBackupAt) {
  if (!lastBackupAt) return 'sysmaint-badge--bad';
  const hours = (Date.now() - new Date(lastBackupAt).getTime()) / (1000 * 60 * 60);
  if (hours > 36) return 'sysmaint-badge--bad';
  if (hours > 24) return 'sysmaint-badge--warn';
  return 'sysmaint-badge--ok';
}

const BackupPanel = ({
  mysql,
  backup,
  onTriggerBackup,
  isTriggering,
  onPollStatus,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');

  const handleTrigger = async () => {
    const result = await onTriggerBackup(confirmAction);
    if (result?.ok) {
      setShowConfirm(false);
      setConfirmAction('');
      if (onPollStatus) onPollStatus();
    }
  };

  return (
    <div className="sysmaint-panel">
      <h3 className="sysmaint-panel-title">MySQL &amp; Backups</h3>

      <div className="sysmaint-mysql-row">
        <FaDatabase />
        <div>
          <span className="sysmaint-metric-label">Database</span>
          <span className={`sysmaint-badge ${mysql?.ok ? 'sysmaint-badge--ok' : 'sysmaint-badge--bad'}`}>
            {mysql?.ok ? 'Connected' : 'Unavailable'}
          </span>
          {mysql?.database && (
            <p className="sysmaint-hint">
              {mysql.database} @ {mysql.host}
              {mysql.threadsConnected != null ? ` — ${mysql.threadsConnected} connections` : ''}
            </p>
          )}
          {mysql?.error && <p className="sysmaint-error">{mysql.error}</p>}
        </div>
      </div>

      <h4 className="sysmaint-section-label">Latest backup</h4>
      <div className="sysmaint-backup-summary">
        <span className={`sysmaint-badge ${backupAgeBadge(backup?.lastBackupAt)}`}>
          {backup?.lastBackupAt
            ? new Date(backup.lastBackupAt).toLocaleString()
            : 'No backup found'}
        </span>
        {backup?.lastBackupFile && (
          <p className="sysmaint-hint">
            {backup.lastBackupFile} ({backup.lastBackupSizeMb} MB)
          </p>
        )}
        {backup?.retentionDays != null && (
          <p className="sysmaint-hint">Retention: {backup.retentionDays} days</p>
        )}
        {backup?.inProgress && (
          <p className="sysmaint-hint sysmaint-hint--warn">Backup in progress…</p>
        )}
        {backup?.error && <p className="sysmaint-error">{backup.error}</p>}
      </div>

      {(backup?.lastLogLines || []).length > 0 && (
        <>
          <h4 className="sysmaint-section-label">Backup log (today)</h4>
          <pre className="sysmaint-log-pre sysmaint-log-pre--compact">
            {backup.lastLogLines.join('\n')}
          </pre>
        </>
      )}

      <div className="sysmaint-backup-actions">
        {!showConfirm ? (
          <button
            type="button"
            className="sysmaint-btn-primary"
            disabled={backup?.inProgress || isTriggering}
            onClick={() => setShowConfirm(true)}
            title={backup?.inProgress ? 'A backup is already running. Wait for completion.' : ''}
          >
            <FaPlay /> Run backup now
          </button>
        ) : (
          <div className="sysmaint-inline-confirm">
            <p className="sysmaint-hint">Type <strong>RUN_BACKUP</strong> to start a manual database backup.</p>
            <input
              type="text"
              className="sysmaint-input"
              value={confirmAction}
              onChange={(e) => setConfirmAction(e.target.value)}
              placeholder="RUN_BACKUP"
            />
            <div className="sysmaint-inline-confirm-actions">
              <button type="button" className="sysmaint-btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="sysmaint-btn-primary"
                disabled={confirmAction !== 'RUN_BACKUP' || isTriggering}
                onClick={handleTrigger}
              >
                {isTriggering ? 'Starting…' : 'Confirm backup'}
              </button>
            </div>
          </div>
        )}
      </div>
      {backup?.inProgress && (
        <p className="sysmaint-hint sysmaint-hint--warn">
          Manual trigger is disabled while a backup is already in progress.
        </p>
      )}
    </div>
  );
};

export default BackupPanel;
