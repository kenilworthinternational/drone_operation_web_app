/**
 * HR org structure helpers for SMART KPI (emp_departments / emp_job_roles — not wings).
 */

export function filterActiveEmpDepartments(departments) {
  return [...(departments || [])]
    .filter((d) => Number(d.activated) !== 0)
    .sort((a, b) => String(a.department_name || a.dept_code || '').localeCompare(String(b.department_name || b.dept_code || '')));
}

export function filterEmpJobRolesForDepartment(jobRoles, chiefRoles, deptId) {
  if (!deptId) return [];
  const deptNum = Number(deptId);
  const chiefDeptMap = new Map();
  (chiefRoles || []).forEach((r) => {
    chiefDeptMap.set(Number(r.id), new Set((r.dept_ids || []).map(Number)));
  });
  const merged = [...(jobRoles || [])];
  const seen = new Set(merged.map((r) => Number(r.id)));
  (chiefRoles || []).forEach((r) => {
    if (!seen.has(Number(r.id))) merged.push(r);
  });
  return merged
    .filter((r) => {
      if (Number(r.activated) !== 1) return false;
      if (Number(r.chief) === 1) {
        return chiefDeptMap.get(Number(r.id))?.has(deptNum);
      }
      return (r.dept_ids || []).includes(deptNum);
    })
    .sort((a, b) => String(a.job_role || a.jr_code || '').localeCompare(String(b.job_role || b.jr_code || '')));
}

export function formatEmpDepartmentOption(dept) {
  const code = dept?.dept_code ? String(dept.dept_code).toUpperCase() : '';
  const name = dept?.department_name || dept?.dept_code || `Department #${dept?.id}`;
  return code ? `${code} — ${name}` : name;
}

export function formatEmpJobRoleOption(role) {
  const label = role?.job_role || role?.jr_code || `Role #${role?.id}`;
  return Number(role?.chief) === 1 ? `${label} (chief)` : label;
}
