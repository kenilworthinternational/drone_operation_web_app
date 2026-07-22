import React, { useMemo, useState, useEffect } from 'react';
import {
  useGetSmartKpiScopeStatusQuery,
  useApplySmartKpiTemplateMutation,
  useRemoveSmartKpiTemplateMutation,
} from '../../../api/services NodeJs/employeeKpiApi';

const DIMENSION_LABELS = {
  specific: 'S · Specific',
  measurable: 'M · Measurable',
  achievable: 'A · Achievable',
  relevant: 'R · Relevant',
  time_bound: 'T · Time-bound',
};

function formatDimension(code) {
  return DIMENSION_LABELS[code] || code;
}

function formatScope(row) {
  const parts = [
    row.sub_division_name || 'All sub-divisions',
    row.job_role || 'All roles',
  ];
  return parts.join(' · ');
}

function statusLabel(row) {
  const total = row.employees_in_scope || 0;
  const applied = row.applied_count || 0;
  if (row.application_status === 'full') return `Applied (${applied}/${total})`;
  if (row.application_status === 'partial') return `Partial (${applied}/${total})`;
  return 'Not applied';
}

function statusClass(status) {
  if (status === 'full') return 'smart-kpi-scope-status smart-kpi-scope-status--full';
  if (status === 'partial') return 'smart-kpi-scope-status smart-kpi-scope-status--partial';
  return 'smart-kpi-scope-status smart-kpi-scope-status--none';
}

function applicationStatusFromCount(appliedCount, employeesInScope) {
  if (!employeesInScope || appliedCount <= 0) return 'none';
  if (appliedCount >= employeesInScope) return 'full';
  return 'partial';
}

function patchTemplateRow(appliedCount, employeesInScope) {
  const count = Number(appliedCount || 0);
  return {
    applied_count: count,
    employees_in_scope: employeesInScope,
    application_status: applicationStatusFromCount(count, employeesInScope),
    is_applied: count > 0,
  };
}

function ScopeTemplateTable({ rows, scopeBody, busyTemplateId, onApply, onRemove, isRefreshing }) {
  if (!rows.length) {
    return (
      <div className="employee-kpi-empty smart-kpi-scope-empty">
        No SMART KPI templates configured for this scope.
      </div>
    );
  }

  return (
    <div className={`employee-kpi-table-wrap smart-kpi-scope-table-wrap${isRefreshing ? ' smart-kpi-scope-table-wrap--refreshing' : ''}`}>
      <table className="employee-kpi-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Scope</th>
            <th>Weight</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const busy = busyTemplateId === row.id;
            const isFull = row.application_status === 'full';
            const isNone = row.application_status === 'none';
            return (
              <tr key={row.id}>
                <td><span className="smart-kpi-hrm-type-chip">{formatDimension(row.dimension_code)}</span></td>
                <td>{row.title}</td>
                <td>{formatScope(row)}</td>
                <td>{row.weight}</td>
                <td><span className={statusClass(row.application_status)}>{statusLabel(row)}</span></td>
                <td className="smart-kpi-scope-actions">
                  <button
                    type="button"
                    className="employee-kpi-btn employee-kpi-btn-primary"
                    disabled={busy || isFull}
                    onClick={() => onApply(row.id, scopeBody)}
                  >
                    {busy ? '…' : 'Apply'}
                  </button>
                  <button
                    type="button"
                    className="employee-kpi-btn employee-kpi-btn-secondary"
                    disabled={busy || isNone}
                    onClick={() => onRemove(row.id, scopeBody)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function SmartKpiTemplateScopePanel({ filters }) {
  const [scopeView, setScopeView] = useState('department');
  const [busyTemplateId, setBusyTemplateId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [rowPatches, setRowPatches] = useState({});

  const scopeBody = useMemo(() => ({
    periodType: filters.periodType,
    periodKey: filters.periodKey,
    empDepartmentId: filters.empDepartmentId ? Number(filters.empDepartmentId) : undefined,
    empSubDivisionId: filters.empSubDivisionId ? Number(filters.empSubDivisionId) : undefined,
    empJobRoleId: filters.empJobRoleId ? Number(filters.empJobRoleId) : undefined,
  }), [filters]);

  const { data: scopeStatus, isLoading, isFetching } = useGetSmartKpiScopeStatusQuery(scopeBody, {
    skip: !filters.empDepartmentId,
  });

  const [applyTemplate] = useApplySmartKpiTemplateMutation();
  const [removeTemplate] = useRemoveSmartKpiTemplateMutation();

  const employeesInScope = scopeStatus?.employees_in_scope ?? 0;

  const departmentRows = useMemo(() => {
    const rows = scopeStatus?.department_templates || [];
    return rows.map((row) => (rowPatches[row.id] ? { ...row, ...rowPatches[row.id] } : row));
  }, [scopeStatus?.department_templates, rowPatches]);

  const roleRows = useMemo(() => {
    const rows = scopeStatus?.role_templates || [];
    return rows.map((row) => (rowPatches[row.id] ? { ...row, ...rowPatches[row.id] } : row));
  }, [scopeStatus?.role_templates, rowPatches]);

  useEffect(() => {
    setRowPatches({});
  }, [scopeStatus, filters.periodType, filters.periodKey, filters.empDepartmentId, filters.empSubDivisionId, filters.empJobRoleId]);

  const handleApply = async (templateId, body) => {
    setActionMessage(null);
    setBusyTemplateId(templateId);
    try {
      const result = await applyTemplate({ ...body, templateId }).unwrap();
      const data = result?.data || result;
      const applied = Number(data.applied || 0);
      setRowPatches((prev) => ({
        ...prev,
        [templateId]: patchTemplateRow(applied, employeesInScope),
      }));
      setActionMessage({
        type: 'success',
        text: `Applied to ${applied} employee(s), skipped ${data.skipped || 0}.`,
      });
    } catch (err) {
      setActionMessage({ type: 'error', text: err?.data?.message || 'Apply failed.' });
    } finally {
      setBusyTemplateId(null);
    }
  };

  const handleRemove = async (templateId, body) => {
    setActionMessage(null);
    setBusyTemplateId(templateId);
    try {
      const result = await removeTemplate({ ...body, templateId }).unwrap();
      const data = result?.data || result;
      setRowPatches((prev) => ({
        ...prev,
        [templateId]: patchTemplateRow(0, employeesInScope),
      }));
      setActionMessage({
        type: 'success',
        text: `Removed from ${data.removed || 0} employee(s), skipped ${data.skipped || 0}.`,
      });
    } catch (err) {
      setActionMessage({ type: 'error', text: err?.data?.message || 'Remove failed.' });
    } finally {
      setBusyTemplateId(null);
    }
  };

  if (!filters.empDepartmentId) {
    return (
      <div className="smart-kpi-scope-panel">
        <div className="employee-kpi-empty">Select a department to view SMART KPI templates for this scope.</div>
      </div>
    );
  }

  return (
    <div className="smart-kpi-scope-panel">
      <div className="smart-kpi-scope-head">
        <div>
          <h3>Current SMART KPIs for this scope</h3>
          <p className="smart-kpi-scope-sub">
            {employeesInScope} employee{employeesInScope === 1 ? '' : 's'} in scope
            {' · '}
            {filters.periodKey} ({filters.periodType})
          </p>
        </div>
        <div className="smart-kpi-scope-view-tabs">
          <button
            type="button"
            className={`smart-kpi-scope-view-tab${scopeView === 'department' ? ' active' : ''}`}
            onClick={() => setScopeView('department')}
          >
            Department (all)
          </button>
          <button
            type="button"
            className={`smart-kpi-scope-view-tab${scopeView === 'role' ? ' active' : ''}`}
            onClick={() => setScopeView('role')}
          >
            Job role KPIs
          </button>
        </div>
      </div>

      {actionMessage ? (
        <div className={actionMessage.type === 'error' ? 'employee-kpi-error' : 'smart-kpi-success-msg'}>
          {actionMessage.text}
        </div>
      ) : null}

      {isLoading && !scopeStatus ? (
        <div className="employee-kpi-loading">Loading template status…</div>
      ) : scopeView === 'department' ? (
        <ScopeTemplateTable
          rows={departmentRows}
          scopeBody={scopeBody}
          busyTemplateId={busyTemplateId}
          onApply={handleApply}
          onRemove={handleRemove}
          isRefreshing={isFetching && !!scopeStatus}
        />
      ) : !filters.empJobRoleId ? (
        <div className="employee-kpi-empty">
          Select a job role above to view and manage role-specific SMART KPI templates.
        </div>
      ) : (
        <ScopeTemplateTable
          rows={roleRows}
          scopeBody={scopeBody}
          busyTemplateId={busyTemplateId}
          onApply={handleApply}
          onRemove={handleRemove}
          isRefreshing={isFetching && !!scopeStatus}
        />
      )}
    </div>
  );
}
