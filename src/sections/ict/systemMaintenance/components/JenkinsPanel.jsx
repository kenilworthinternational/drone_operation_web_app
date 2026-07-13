import React from 'react';

function badgeForStatus(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'success') return 'sysmaint-badge--ok';
  if (s === 'running' || s === 'unstable') return 'sysmaint-badge--warn';
  if (s === 'failed' || s === 'aborted') return 'sysmaint-badge--bad';
  return 'sysmaint-badge--muted';
}

function formatWhen(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function jobUpdatedLabel(job) {
  if (job.building && job.startedAt) {
    return `Started ${formatWhen(job.startedAt)}`;
  }
  if (job.finishedAt) {
    return `Updated ${formatWhen(job.finishedAt)}`;
  }
  if (job.startedAt) {
    return `Started ${formatWhen(job.startedAt)}`;
  }
  return null;
}

const JenkinsPanel = ({ jenkins, errors }) => {
  const notConfigured = !jenkins?.enabled;
  const err = jenkins?.error || errors?.find((e) => e.section === 'jenkins')?.message;

  return (
    <div className="sysmaint-panel ictg-jenkins-panel">
      <h3 className="sysmaint-panel-title">Jenkins</h3>
      {jenkins?.url && (
        <p className="sysmaint-panel-subtitle">
          <a href={jenkins.url} target="_blank" rel="noreferrer">{jenkins.url}</a>
        </p>
      )}
      {jenkins?.lastUpdatedAt ? (
        <p className="sysmaint-hint sysmaint-jenkins-last-updated">
          Latest pipeline activity: {formatWhen(jenkins.lastUpdatedAt)}
        </p>
      ) : null}
      {notConfigured && (
        <p className="sysmaint-hint">
          Jenkins integration is not configured. Set
          {' '}<code>SYSTEM_MAINTENANCE_JENKINS_URL</code>{' '}
          and optional Jenkins auth variables in API env.
        </p>
      )}
      {err && <p className="sysmaint-error">{err}</p>}
      {!notConfigured && !err && (jenkins?.jobs || []).length === 0 && (
        <p className="sysmaint-hint">No Jenkins jobs configured.</p>
      )}
      <div className="sysmaint-jenkins-list ictg-jenkins-list">
        {(jenkins?.jobs || []).map((job) => {
          const updatedLabel = jobUpdatedLabel(job);
          return (
            <div className="sysmaint-jenkins-item ictg-jenkins-item" key={job.name}>
              <div className="sysmaint-jenkins-item-main">
                <div className="sysmaint-jenkins-item-title">
                  <strong>{job.name}</strong>
                  {job.number != null && <span className="sysmaint-hint">#{job.number}</span>}
                </div>
                {updatedLabel ? (
                  <span className="sysmaint-jenkins-item-time">{updatedLabel}</span>
                ) : null}
                {job.error ? <span className="sysmaint-error">{job.error}</span> : null}
              </div>
              <span className={`sysmaint-badge ictg-chip ${badgeForStatus(job.status)}`}>{job.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JenkinsPanel;
