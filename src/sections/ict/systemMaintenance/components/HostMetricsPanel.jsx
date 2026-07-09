import React from 'react';

function badgeForPercent(usedPercent, warn = 85, bad = 95) {
  if (usedPercent == null) return 'sysmaint-badge--muted';
  if (usedPercent >= bad) return 'sysmaint-badge--bad';
  if (usedPercent >= warn) return 'sysmaint-badge--warn';
  return 'sysmaint-badge--ok';
}

function serviceBadge(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'running') return 'sysmaint-badge--ok';
  if (s === 'notfound') return 'sysmaint-badge--muted';
  return 'sysmaint-badge--bad';
}

const HostMetricsPanel = ({ host, errors }) => {
  if (!host) {
    const err = errors?.find((e) => e.section === 'host');
    return (
      <div className="sysmaint-panel">
        <h3 className="sysmaint-panel-title">Windows Server</h3>
        <p className="sysmaint-error">{err?.message || 'Host metrics unavailable on this environment.'}</p>
      </div>
    );
  }

  return (
    <div className="sysmaint-panel">
      <h3 className="sysmaint-panel-title">Windows Server</h3>
      <p className="sysmaint-panel-subtitle">
        {host.hostname} — {host.osVersion}
      </p>
      <div className="sysmaint-kpi-row">
        <div className="sysmaint-kpi">
          <span className="sysmaint-metric-label">CPU</span>
          <span className="sysmaint-metric-value">
            {host.cpuPercent != null ? `${host.cpuPercent}%` : '—'}
          </span>
        </div>
        <div className="sysmaint-kpi">
          <span className="sysmaint-metric-label">Memory used</span>
          <span className={`sysmaint-metric-value ${badgeForPercent(host.memory?.usedPercent, 80, 90)}`}>
            {host.memory?.usedPercent != null ? `${host.memory.usedPercent}%` : '—'}
          </span>
          <span className="sysmaint-hint">
            {host.memory?.freeMb} MB free / {host.memory?.totalMb} MB
          </span>
        </div>
        <div className="sysmaint-kpi">
          <span className="sysmaint-metric-label">Uptime</span>
          <span className="sysmaint-metric-value">
            {host.uptimeSeconds != null
              ? `${Math.floor(host.uptimeSeconds / 86400)}d ${Math.floor((host.uptimeSeconds % 86400) / 3600)}h`
              : '—'}
          </span>
        </div>
      </div>

      <h4 className="sysmaint-section-label">Disk usage</h4>
      <div className="sysmaint-disk-list">
        {(host.disks || []).map((disk) => (
          <div key={disk.drive} className="sysmaint-disk-item">
            <div className="sysmaint-disk-header">
              <span>{disk.drive}</span>
              <span className={`sysmaint-badge ${badgeForPercent(disk.usedPercent, 85, 95)}`}>
                {disk.usedPercent}% used
              </span>
            </div>
            <div className="sysmaint-progress">
              <div
                className="sysmaint-progress-fill"
                style={{ width: `${Math.min(disk.usedPercent || 0, 100)}%` }}
              />
            </div>
            <span className="sysmaint-hint">
              {disk.freeGb} GB free / {disk.totalGb} GB
            </span>
          </div>
        ))}
      </div>

      <h4 className="sysmaint-section-label">Services</h4>
      <div className="sysmaint-service-grid">
        {(host.services || []).map((svc) => (
          <div key={svc.name} className="sysmaint-service-item">
            <span>{svc.name}</span>
            <span className={`sysmaint-badge ${serviceBadge(svc.status)}`}>{svc.status}</span>
          </div>
        ))}
      </div>

      {(host.scheduledTasks || []).length > 0 && (
        <>
          <h4 className="sysmaint-section-label">Scheduled tasks</h4>
          <div className="sysmaint-task-list">
            {host.scheduledTasks.map((task) => (
              <div key={task.name} className="sysmaint-task-item">
                <strong>{task.name}</strong>
                <span className="sysmaint-hint">State: {task.state}</span>
                {task.lastRunTime && (
                  <span className="sysmaint-hint">Last run: {new Date(task.lastRunTime).toLocaleString()}</span>
                )}
                {task.nextRunTime && (
                  <span className="sysmaint-hint">Next: {new Date(task.nextRunTime).toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HostMetricsPanel;
