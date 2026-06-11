import React, { useEffect, useMemo, useState } from 'react';
import {
  useGetOrgChartQuery,
  useGetDepartmentHeadcountQuery,
  useGetVacancyReportQuery,
} from '../../api/services NodeJs/employeeProfileApi';
import '../../styles/organizationStructure.css';
import OrgChartTree from './employeeProfile/OrgChartTree';

function filterTree(nodes, query) {
  if (!query.trim()) return nodes;
  const q = query.trim().toLowerCase();

  function walk(node) {
    const children = (node.children || []).map(walk).filter(Boolean);
    const selfMatch =
      node.name?.toLowerCase().includes(q)
      || node.designation?.toLowerCase().includes(q)
      || node.jobCategory?.toLowerCase().includes(q)
      || node.departmentName?.toLowerCase().includes(q)
      || String(node.empNo || '').toLowerCase().includes(q);

    if (selfMatch || children.length) {
      return { ...node, children: children.length ? children : (selfMatch ? node.children || [] : []) };
    }
    return null;
  }

  return nodes.map(walk).filter(Boolean);
}

function countNodes(nodes) {
  let n = 0;
  const walk = (list) => {
    list.forEach((node) => {
      n += 1;
      if (node.children?.length) walk(node.children);
    });
  };
  walk(nodes);
  return n;
}

const OrganizationStructure = () => {
  const [view, setView] = useState('chart');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const root = document.querySelector('.content-dashboard');
    root?.classList.add('content-dashboard--organization-structure');
    return () => root?.classList.remove('content-dashboard--organization-structure');
  }, []);

  const { data: chartData, isLoading: loadingChart } = useGetOrgChartQuery();
  const { data: headcountData, isLoading: loadingHeadcount } = useGetDepartmentHeadcountQuery();
  const { data: vacancyData, isLoading: loadingVacancy } = useGetVacancyReportQuery();

  const roots = chartData?.data?.roots || [];
  const totalEmployees = chartData?.data?.totalEmployees ?? 0;
  const headcount = headcountData?.data || [];
  const vacancies = vacancyData?.data || [];

  const filteredRoots = useMemo(() => filterTree(roots, search), [roots, search]);
  const visibleCount = useMemo(() => countNodes(filteredRoots), [filteredRoots]);

  const totalDepartments = headcount.length;
  const staffedDepartments = headcount.filter((d) => d.headcount > 0).length;

  return (
    <div className="org-shell">
      <header className="org-page-header">
        <div>
          <h2 className="org-title">Organization Structure</h2>
          <p className="org-subtitle">
            Reporting hierarchy, department headcount, and staffing gaps across wings.
          </p>
        </div>
      </header>

      <div className="org-stats">
        <div className="org-stat-card">
          <span className="org-stat-label">Total employees</span>
          <strong className="org-stat-value">{totalEmployees}</strong>
        </div>
        <div className="org-stat-card">
          <span className="org-stat-label">Departments</span>
          <strong className="org-stat-value">{totalDepartments}</strong>
          <span className="org-stat-hint">{staffedDepartments} with staff</span>
        </div>
        <div className="org-stat-card org-stat-card--accent">
          <span className="org-stat-label">Open gaps</span>
          <strong className="org-stat-value">{vacancies.length}</strong>
          <span className="org-stat-hint">Missing HOD or empty dept.</span>
        </div>
      </div>

      <div className="org-panel">
        <div className="org-tabs">
          <button type="button" className={`org-tab ${view === 'chart' ? 'active' : ''}`} onClick={() => setView('chart')}>
            Org chart
          </button>
          <button type="button" className={`org-tab ${view === 'headcount' ? 'active' : ''}`} onClick={() => setView('headcount')}>
            Department headcount
          </button>
          <button type="button" className={`org-tab ${view === 'vacancy' ? 'active' : ''}`} onClick={() => setView('vacancy')}>
            Vacancy report
          </button>
        </div>

        {view === 'chart' && (
          <div className="org-chart-section">
            <div className="org-toolbar">
              <input
                type="search"
                className="org-search"
                placeholder="Search name, EMP no, department, role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="org-chart-meta">
              Showing {visibleCount} employee{visibleCount === 1 ? '' : 's'}
              {search.trim() ? ` matching “${search.trim()}”` : ' in hierarchy'}
            </p>
            <div className="org-chart-wrap org-chart-wrap--tree">
              {loadingChart ? (
                <p className="org-loading">Loading organization chart…</p>
              ) : filteredRoots.length === 0 ? (
                <p className="org-empty">
                  {roots.length === 0
                    ? 'No organization data available. Assign reporting officers on employee profiles.'
                    : 'No employees match your search.'}
                </p>
              ) : (
                <OrgChartTree roots={filteredRoots} />
              )}
            </div>
          </div>
        )}

        {view === 'headcount' && (
          <div className="org-table-section">
            {loadingHeadcount ? (
              <p className="org-loading">Loading headcount…</p>
            ) : headcount.length === 0 ? (
              <p className="org-empty">No department data available.</p>
            ) : (
              <div className="org-table-wrap">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Code</th>
                      <th>Head of department</th>
                      <th className="org-th-num">Headcount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headcount.map((d) => (
                      <tr key={d.departmentCode || d.wingId} className={d.headcount === 0 ? 'org-row-warn' : ''}>
                        <td><strong>{d.departmentName || '—'}</strong></td>
                        <td><code className="org-code">{d.departmentCode || '—'}</code></td>
                        <td>{d.hodName || <span className="org-muted">Not assigned</span>}</td>
                        <td className="org-td-num">
                          <span className={`org-count-pill ${d.headcount === 0 ? 'org-count-pill--zero' : ''}`}>
                            {d.headcount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {view === 'vacancy' && (
          <div className="org-table-section">
            {loadingVacancy ? (
              <p className="org-loading">Loading vacancy report…</p>
            ) : vacancies.length === 0 ? (
              <p className="org-empty org-empty--ok">All departments have an HOD and at least one employee.</p>
            ) : (
              <div className="org-table-wrap">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th className="org-th-num">Headcount</th>
                      <th>Missing HOD</th>
                      <th>Empty department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacancies.map((d) => (
                      <tr key={d.departmentCode || d.departmentName}>
                        <td><strong>{d.departmentName || '—'}</strong></td>
                        <td className="org-td-num">{d.headcount}</td>
                        <td>
                          <span className={`org-yesno ${d.missingHod ? 'org-yesno--yes' : 'org-yesno--no'}`}>
                            {d.missingHod ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <span className={`org-yesno ${d.emptyDepartment ? 'org-yesno--yes' : 'org-yesno--no'}`}>
                            {d.emptyDepartment ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationStructure;
