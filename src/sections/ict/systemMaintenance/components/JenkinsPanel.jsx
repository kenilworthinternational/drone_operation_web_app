import React from 'react';

function badgeForStatus(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'success') return 'sysmaint-badge--ok';
  if (s === 'running' || s === 'unstable') return 'sysmaint-badge--warn';
  if (s === 'failed' || s === 'aborted') return 'sysmaint-badge--bad';
  return 'sysmaint-badge--muted';
}

const JenkinsPanel = ({ jenkins, errors }) => {
  const notConfigured = !jenkins?.enabled;
  const err = jenkins?.error || errors?.find((e) => e.section === 'jenkins')?.message;

  return (
    <div className="sysmaint-panel">
      <h3 className="sysmaint-panel-title">Jenkins</h3>
      {jenkins?.url && (
        <p className="sysmaint-panel-subtitle">
          <a href={jenkins.url} target="_blank" rel="noreferrer">{jenkins.url}</a>
        </p>
      )}
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
      <div className="sysmaint-jenkins-list">
        {(jenkins?.jobs || []).map((job) => (
          <div className="sysmaint-jenkins-item" key={job.name}>
            <div>
              <strong>{job.name}</strong>
              {job.number != null && <span className="sysmaint-hint">#{job.number}</span>}
            </div>
            <span className={`sysmaint-badge ${badgeForStatus(job.status)}`}>{job.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JenkinsPanel;
