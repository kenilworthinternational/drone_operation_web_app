import React, { useCallback, useEffect, useState } from 'react';
import { FaSync, FaServer, FaExclamationTriangle } from 'react-icons/fa';
import { Bars } from 'react-loader-spinner';
import {
  useGetSystemMaintenanceOverviewQuery,
  useGetSystemMaintenanceBackupStatusQuery,
  useLazyGetSystemMaintenancePm2LogsQuery,
  useRestartPm2ProcessMutation,
  useTriggerSystemBackupMutation,
} from '../../../api/services NodeJs/systemMaintenanceApi';
import Pm2ProcessCard from './components/Pm2ProcessCard';
import HostMetricsPanel from './components/HostMetricsPanel';
import BackupPanel from './components/BackupPanel';
import LogTailModal from './components/LogTailModal';
import '../../../styles/systemMaintenancePage.css';

function formatCollectedAt(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const SystemMaintenancePage = () => {
  const {
    data: overview,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSystemMaintenanceOverviewQuery(undefined, {
    pollingInterval: 30000,
  });

  const { refetch: refetchBackupStatus } = useGetSystemMaintenanceBackupStatusQuery(undefined, {
    skip: true,
  });

  const [fetchLogs, { data: logData, isFetching: logsLoading, error: logsError }] =
    useLazyGetSystemMaintenancePm2LogsQuery();
  const [restartPm2, { isLoading: isRestarting }] = useRestartPm2ProcessMutation();
  const [triggerBackup, { isLoading: isTriggering }] = useTriggerSystemBackupMutation();

  const [logAppName, setLogAppName] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [backupPolling, setBackupPolling] = useState(false);

  const isDisabled = error?.status === 503 || error?.status === 403;
  const capabilities = overview?.capabilities;

  const handleViewLogs = useCallback((appName) => {
    setLogAppName(appName);
    fetchLogs({ appName, lines: 100 });
  }, [fetchLogs]);

  const handleRestart = useCallback(async (appName, confirmName, onDone) => {
    try {
      const result = await restartPm2({ appName, confirmName }).unwrap();
      const warning = result?.data?.warning;
      setActionMessage(
        warning || `Restarted ${appName} successfully.`
      );
      refetch();
      onDone();
    } catch (err) {
      setActionMessage(err?.data?.message || err?.message || 'Restart failed.');
    }
  }, [restartPm2, refetch]);

  const handleTriggerBackup = useCallback(async (confirmAction) => {
    try {
      await triggerBackup({ confirmAction }).unwrap();
      setActionMessage('Database backup started. Status will update when complete.');
      setBackupPolling(true);
    } catch (err) {
      setActionMessage(err?.data?.message || err?.message || 'Failed to start backup.');
    }
  }, [triggerBackup]);

  useEffect(() => {
    if (!backupPolling) return undefined;
    const id = setInterval(() => {
      refetch();
      refetchBackupStatus();
    }, 10000);
    const stop = setTimeout(() => setBackupPolling(false), 5 * 60 * 1000);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, [backupPolling, refetch, refetchBackupStatus]);

  if (isLoading) {
    return (
      <div className="page-sysmaint">
        <div className="sysmaint-loading sysmaint-loading--page">
          <Bars height={40} width={40} color="#1a73e8" />
          <span>Loading system maintenance…</span>
        </div>
      </div>
    );
  }

  if (isDisabled) {
    const msg =
      error?.status === 403
        ? 'You do not have permission to view System Maintenance.'
        : 'System Maintenance is only available on the DSMS Windows server environment (enable SYSTEM_MAINTENANCE_ENABLED on the API).';
    return (
      <div className="page-sysmaint">
        <div className="sysmaint-unavailable">
          <FaExclamationTriangle />
          <h2>System Maintenance unavailable</h2>
          <p>{msg}</p>
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="page-sysmaint">
        <div className="sysmaint-unavailable">
          <FaExclamationTriangle />
          <h2>Failed to load System Maintenance</h2>
          <p>{error?.data?.message || error?.message || 'Unknown error'}</p>
          <button type="button" className="sysmaint-btn-secondary" onClick={() => refetch()}>
            <FaSync /> Retry
          </button>
        </div>
      </div>
    );
  }

  const pm2Processes = overview?.pm2 || [];
  const recentActions = overview?.recentActions || [];
  const sectionErrors = overview?.errors || [];

  return (
    <div className="page-sysmaint">
      <header className="sysmaint-header">
        <div>
          <h1 className="sysmaint-title">
            <FaServer /> System Maintenance
          </h1>
          <p className="sysmaint-subtitle">
            PM2 processes, Windows server health, MySQL backups, and ICT operations.
          </p>
        </div>
        <div className="sysmaint-header-actions">
          <span className="sysmaint-updated">
            Last updated: {formatCollectedAt(overview?.collectedAt)}
            {isFetching && ' (refreshing…)'}
          </span>
          <button type="button" className="sysmaint-btn-secondary" onClick={() => refetch()}>
            <FaSync /> Refresh
          </button>
        </div>
      </header>

      {actionMessage && (
        <div className="sysmaint-toast" role="status">
          {actionMessage}
          <button type="button" onClick={() => setActionMessage(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {overview?.apiSelf && (
        <div className="sysmaint-api-self">
          <span>
            This API: <strong>{overview.apiSelf.pm2AppName || 'standalone'}</strong>
          </span>
          <span>{overview.apiSelf.environment}</span>
          <span>Uptime {overview.apiSelf.uptime?.formatted}</span>
          <span>RSS {overview.apiSelf.memory?.rssMb} MB</span>
        </div>
      )}

      {sectionErrors.length > 0 && (
        <div className="sysmaint-warnings">
          {sectionErrors.map((e) => (
            <p key={e.section}>
              <strong>{e.section}:</strong> {e.message}
            </p>
          ))}
        </div>
      )}

      <section className="sysmaint-section">
        <h2 className="sysmaint-section-title">PM2 Processes</h2>
        {pm2Processes.length === 0 ? (
          <p className="sysmaint-hint">No allowlisted PM2 processes found. Check SYSTEM_MAINTENANCE_PM2_APPS on the server.</p>
        ) : (
          <div className="sysmaint-pm2-grid">
            {pm2Processes.map((proc) => (
              <Pm2ProcessCard
                key={proc.name}
                process={proc}
                onViewLogs={handleViewLogs}
                onRestart={handleRestart}
                isRestarting={isRestarting}
              />
            ))}
          </div>
        )}
      </section>

      <div className="sysmaint-split">
        <HostMetricsPanel host={overview?.host} errors={sectionErrors} />
        <BackupPanel
          mysql={overview?.mysql}
          backup={overview?.backup}
          onTriggerBackup={handleTriggerBackup}
          isTriggering={isTriggering}
          onPollStatus={() => refetch()}
        />
      </div>

      <section className="sysmaint-section">
        <h2 className="sysmaint-section-title">Recent actions</h2>
        {recentActions.length === 0 ? (
          <p className="sysmaint-hint">No maintenance actions recorded yet today.</p>
        ) : (
          <div className="sysmaint-table-wrap">
            <table className="sysmaint-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {recentActions.map((row, idx) => (
                  <tr key={`${row.timestamp}-${idx}`}>
                    <td>{row.timestamp}</td>
                    <td>{row.userName || row.userId}</td>
                    <td>{row.action}</td>
                    <td>{row.target}</td>
                    <td>{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {capabilities && !capabilities.enabled && (
        <p className="sysmaint-hint">Maintenance capabilities are disabled in API configuration.</p>
      )}

      {logAppName && (
        <LogTailModal
          appName={logAppName}
          onClose={() => setLogAppName(null)}
          onFetch={fetchLogs}
          isLoading={logsLoading}
          content={logData?.content}
          error={logsError?.data?.message || logsError?.message}
        />
      )}
    </div>
  );
};

export default SystemMaintenancePage;
