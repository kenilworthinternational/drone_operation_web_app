import React, { useState } from 'react';
import {
  useGetOrgChartQuery,
  useGetDepartmentHeadcountQuery,
  useGetVacancyReportQuery,
} from '../../api/services NodeJs/employeeProfileApi';
import '../../styles/organizationStructure.css';

function OrgNode({ node }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <li className="org-node">
      <div className="org-card">
        <div className="org-card-head">
          {hasChildren && (
            <button className="org-toggle" onClick={() => setOpen((p) => !p)}>{open ? '-' : '+'}</button>
          )}
          <span className="org-name">{node.name}</span>
        </div>
        <div className="org-meta">
          {node.designation || node.jobCategory || '-'}
          {node.departmentName ? ` | ${node.departmentName}` : ''}
        </div>
      </div>
      {hasChildren && open && (
        <ul className="org-children">
          {node.children.map((child) => <OrgNode key={child.id} node={child} />)}
        </ul>
      )}
    </li>
  );
}

const OrganizationStructure = () => {
  const [view, setView] = useState('chart');
  const { data: chartData, isLoading: loadingChart } = useGetOrgChartQuery();
  const { data: headcountData, isLoading: loadingHeadcount } = useGetDepartmentHeadcountQuery();
  const { data: vacancyData, isLoading: loadingVacancy } = useGetVacancyReportQuery();

  const roots = chartData?.data?.roots || [];
  const headcount = headcountData?.data || [];
  const vacancies = vacancyData?.data || [];

  return (
    <div className="org-container">
      <h2 className="org-title">Organization Structure & Reports</h2>

      <div className="org-tabs">
        <button className={`org-tab ${view === 'chart' ? 'active' : ''}`} onClick={() => setView('chart')}>Org Chart</button>
        <button className={`org-tab ${view === 'headcount' ? 'active' : ''}`} onClick={() => setView('headcount')}>Department Headcount</button>
        <button className={`org-tab ${view === 'vacancy' ? 'active' : ''}`} onClick={() => setView('vacancy')}>Vacancy Report</button>
      </div>

      {view === 'chart' && (
        <div className="org-chart-wrap">
          {loadingChart ? <p>Loading...</p> : roots.length === 0 ? (
            <p className="org-empty">No organization data available.</p>
          ) : (
            <ul className="org-root">
              {roots.map((node) => <OrgNode key={node.id} node={node} />)}
            </ul>
          )}
        </div>
      )}

      {view === 'headcount' && (
        <div className="org-table-wrap">
          {loadingHeadcount ? <p>Loading...</p> : (
            <table className="org-table">
              <thead>
                <tr><th>Department</th><th>Code</th><th>HOD</th><th>Headcount</th></tr>
              </thead>
              <tbody>
                {headcount.map((d) => (
                  <tr key={d.departmentCode || d.wingId}>
                    <td>{d.departmentName || '-'}</td>
                    <td>{d.departmentCode || '-'}</td>
                    <td>{d.hodName || '-'}</td>
                    <td>{d.headcount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {view === 'vacancy' && (
        <div className="org-table-wrap">
          {loadingVacancy ? <p>Loading...</p> : vacancies.length === 0 ? (
            <p className="org-empty">No vacancies / unstaffed departments.</p>
          ) : (
            <table className="org-table">
              <thead>
                <tr><th>Department</th><th>Headcount</th><th>Missing HOD</th><th>Empty</th></tr>
              </thead>
              <tbody>
                {vacancies.map((d) => (
                  <tr key={d.departmentCode || d.departmentName}>
                    <td>{d.departmentName || '-'}</td>
                    <td>{d.headcount}</td>
                    <td>{d.missingHod ? 'Yes' : 'No'}</td>
                    <td>{d.emptyDepartment ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationStructure;
