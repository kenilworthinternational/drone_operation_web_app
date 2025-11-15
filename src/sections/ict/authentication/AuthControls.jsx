import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { PERMISSIONS_STORAGE_KEY, togglePermission } from '../../../store/slices/permissionsSlice';
import '../../../styles/authControls.css';

const AuthControls = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.permissions.categories);
  const roles = useAppSelector((state) => state.permissions.roles);

  const roleList = useMemo(() => roles.map((role) => role.toLowerCase()), [roles]);
  const roleLabels = useMemo(
    () =>
      roleList.reduce((acc, role) => {
        const labelMap = {
          ceo: 'CEO',
          md: 'MD',
          mgr: 'MGR',
          ops: 'OPS',
          dops: 'DOPS',
          fd: 'FD',
          io: 'IO',
          wt: 'WT',
        };
        acc[role] = labelMap[role] || role.toUpperCase();
        return acc;
      }, {}),
    [roleList]
  );

  const legendItems = useMemo(
    () => [
      { code: 'CEO', description: 'Chief Executive Officer' },
      { code: 'MD', description: 'Managing Director' },
      { code: 'MGR', description: 'Manager' },
      { code: 'OPS', description: 'Operations Team' },
      { code: 'DOPS', description: 'Director Operations' },
      { code: 'FD', description: 'Finance Department' },
      { code: 'IO', description: 'Inventory Officer' },
      { code: 'WT', description: 'Workshop Team' },
    ],
    []
  );
  const categoryEntries = useMemo(
    () => Object.entries(categories).sort(([a], [b]) => a.localeCompare(b)),
    [categories]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(
      PERMISSIONS_STORAGE_KEY,
      JSON.stringify({
        categories,
        roles: roleList,
      })
    );
  }, [categories, roleList]);

  const handleToggle = (category, role) => {
    dispatch(togglePermission({ category, role }));
  };

  return (
    <div className="auth-controls-page">
      <header className="auth-controls-header">
        <div>
          <h1>Navigation Bar Controls</h1>
          <p>Toggle which job roles can access each primary section of the platform.</p>
        </div>
      </header>

      <div className="auth-controls-legend">
        <h2>Role Legend</h2>
        <ul>
          {legendItems.map(({ code, description }) => (
            <li key={code}>
              <span className="legend-code">{code}</span>
              <span className="legend-description">{description}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="auth-controls-table-wrapper">
        <table className="auth-controls-table">
          <thead>
            <tr>
              <th scope="col">Application Section</th>
              {roleList.map((role) => (
                <th key={role} scope="col">
                  {roleLabels[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryEntries.map(([category, allowedRoles]) => (
              <tr key={category}>
                <th scope="row">{category}</th>
                {roleList.map((role) => {
                  const isChecked = (allowedRoles || []).includes(role);
                  return (
                    <td key={`${category}-${role}`}>
                      <label className="auth-controls-checkbox">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(category, role)}
                        />
                        <span className="visually-hidden">
                          {role} access to {category}
                        </span>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthControls;
