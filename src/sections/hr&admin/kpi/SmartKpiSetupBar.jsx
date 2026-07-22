import React, { useMemo } from 'react';
import {
  useGetEmpDepartmentsQuery,
  useGetEmpSubDivisionsQuery,
  useGetEmpJobRolesQuery,
  useGetEmpChiefJobRolesQuery,
} from '../../../api/services NodeJs/empOrgStructureApi';
import {
  filterActiveEmpDepartments,
  filterEmpJobRolesForDepartment,
  formatEmpDepartmentOption,
  formatEmpJobRoleOption,
} from './smartKpiOrgHelpers';
import {
  buildPeriodOptions,
  defaultPeriodKey,
  periodLabel,
} from './kpiPeriodHelpers';

const PERIOD_TYPE_OPTIONS = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

export default function SmartKpiSetupBar({ filters, onChange }) {
  const { data: departmentsRaw = [] } = useGetEmpDepartmentsQuery();
  const { data: subDivisionsRaw = [] } = useGetEmpSubDivisionsQuery(
    filters.empDepartmentId ? { dept_id: Number(filters.empDepartmentId) } : undefined,
    { skip: !filters.empDepartmentId },
  );
  const { data: jobRolesRaw = [] } = useGetEmpJobRolesQuery();
  const { data: chiefRolesRaw = [] } = useGetEmpChiefJobRolesQuery();

  const departments = useMemo(
    () => filterActiveEmpDepartments(departmentsRaw),
    [departmentsRaw],
  );
  const subDivisions = useMemo(() => [...(subDivisionsRaw || [])], [subDivisionsRaw]);
  const jobRoles = useMemo(
    () => filterEmpJobRolesForDepartment(jobRolesRaw, chiefRolesRaw, filters.empDepartmentId),
    [jobRolesRaw, chiefRolesRaw, filters.empDepartmentId],
  );

  const periodOptions = useMemo(
    () => buildPeriodOptions(filters.periodType),
    [filters.periodType],
  );

  const set = (patch) => onChange({ ...filters, ...patch });

  const handlePeriodTypeChange = (nextType) => {
    set({ periodType: nextType, periodKey: defaultPeriodKey(nextType) });
  };

  return (
    <div className="smart-kpi-setup-bar">
      <div className="employee-kpi-toolbar">
        <label>
          Period type
          <select value={filters.periodType} onChange={(e) => handlePeriodTypeChange(e.target.value)}>
            {PERIOD_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label>
          Period
          <select value={filters.periodKey} onChange={(e) => set({ periodKey: e.target.value })}>
            {periodOptions.map((opt) => (
              <option key={opt} value={opt}>{periodLabel(filters.periodType, opt)}</option>
            ))}
          </select>
        </label>
        <label>
          Department
          <select
            value={filters.empDepartmentId}
            onChange={(e) => set({ empDepartmentId: e.target.value, empSubDivisionId: '', empJobRoleId: '' })}
          >
            <option value="">-- Select --</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{formatEmpDepartmentOption(d)}</option>
            ))}
          </select>
        </label>
        <label>
          Sub-division
          <select
            value={filters.empSubDivisionId}
            onChange={(e) => set({ empSubDivisionId: e.target.value })}
            disabled={!filters.empDepartmentId}
          >
            <option value="">All</option>
            {subDivisions.map((s) => (
              <option key={s.id} value={s.id}>{s.sub_division_name}</option>
            ))}
          </select>
        </label>
        <label>
          Job Role
          <select
            value={filters.empJobRoleId}
            onChange={(e) => set({ empJobRoleId: e.target.value })}
            disabled={!filters.empDepartmentId}
          >
            <option value="">{filters.empDepartmentId ? 'All roles in department' : 'Select department first'}</option>
            {jobRoles.map((r) => (
              <option key={r.id} value={r.id}>{formatEmpJobRoleOption(r)}</option>
            ))}
          </select>
        </label>
        <label>
          Search
          <input
            value={filters.search || ''}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Name or emp no"
          />
        </label>
      </div>
    </div>
  );
}

export { defaultPeriodKey };
