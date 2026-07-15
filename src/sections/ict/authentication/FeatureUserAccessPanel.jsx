import React, { useEffect, useMemo, useState } from 'react';
import {
  useGetFeatureEligibleUsersQuery,
  useGetUserFeaturePermissionsQuery,
  useUpsertUserFeaturePermissionMutation,
  useUpdateFeatureDefinitionMutation,
} from '../../../api/services NodeJs/featurePermissionsApi';

/**
 * Parent navbar path selector (no label) — used in feature card header.
 */
export const FeatureParentPathSelect = ({ feature, pathOptions = [], updating, className = '' }) => {
  const featureCode = feature.feature_code;
  const [localPath, setLocalPath] = useState(feature.path || '');
  const [updateDefinition, { isLoading: savingPath }] = useUpdateFeatureDefinitionMutation();

  useEffect(() => {
    setLocalPath(feature.path || '');
  }, [feature.path, feature.feature_code]);

  const handlePathSave = async (pathValue) => {
    setLocalPath(pathValue);
    try {
      await updateDefinition({
        featureCode,
        path: pathValue || null,
      }).unwrap();
    } catch (e) {
      console.error(e);
      alert(e?.data?.error || e?.message || 'Failed to update parent path');
      setLocalPath(feature.path || '');
    }
  };

  const busy = updating || savingPath;

  return (
    <select
      id={`feat-path-${featureCode}`}
      className={`auth-controls-feature-path-select ${className}`.trim()}
      value={localPath || ''}
      disabled={busy}
      aria-label="Parent navbar path"
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => handlePathSave(e.target.value)}
    >
      <option value="">Select navbar path…</option>
      {pathOptions.map((opt) => (
        <option key={opt.path} value={opt.path} title={`${opt.label} (${opt.path})`}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

/**
 * Per-feature panel: eligible-user grants (parent path is set in card header).
 */
const FeatureUserAccessPanel = ({ feature, updating }) => {
  const featureCode = feature.feature_code;
  const [userSearch, setUserSearch] = useState('');
  const [grantMap, setGrantMap] = useState({});
  const effectivePath = String(feature.path || '').trim();
  const hasParentPath = Boolean(effectivePath);

  const {
    data: eligibleData,
    isLoading: loadingEligible,
    isFetching: fetchingEligible,
  } = useGetFeatureEligibleUsersQuery(featureCode, { skip: !featureCode || !hasParentPath });

  const {
    data: userGrants = [],
    isLoading: loadingGrants,
  } = useGetUserFeaturePermissionsQuery(featureCode, { skip: !featureCode || !hasParentPath });

  const [upsertUserFeature, { isLoading: savingGrant }] = useUpsertUserFeaturePermissionMutation();

  useEffect(() => {
    const next = {};
    (userGrants || []).forEach((row) => {
      next[row.user_id] = Number(row.is_active) === 1;
    });
    setGrantMap(next);
  }, [userGrants]);

  const eligibleUsers = eligibleData?.users || [];
  const emptyMessage = eligibleData?.message || null;

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return eligibleUsers;
    return eligibleUsers.filter(
      (u) =>
        String(u.name || '').toLowerCase().includes(term) ||
        String(u.job_role || '').toLowerCase().includes(term) ||
        String(u.job_role_name || '').toLowerCase().includes(term)
    );
  }, [eligibleUsers, userSearch]);

  const handleUserToggle = async (userId) => {
    const current = Boolean(grantMap[userId]);
    const next = !current;
    setGrantMap((prev) => ({ ...prev, [userId]: next }));
    try {
      await upsertUserFeature({
        feature_code: featureCode,
        user_id: userId,
        is_active: next ? 1 : 0,
      }).unwrap();
    } catch (e) {
      console.error(e);
      setGrantMap((prev) => ({ ...prev, [userId]: current }));
      alert(e?.data?.error || e?.message || 'Failed to update user feature access');
    }
  };

  const busy = updating || savingGrant || loadingEligible || fetchingEligible || loadingGrants;

  return (
    <div className="auth-controls-feature-user-panel">
      {!hasParentPath ? (
        <p className="auth-controls-feature-hint">
          Select a parent navbar path above. Only users whose roles can open that path will be listed.
        </p>
      ) : (
        <>
          <div className="auth-controls-feature-users-toolbar">
            <input
              type="search"
              placeholder="Filter users…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="auth-controls-search-input"
            />
            <span className="auth-controls-feature-user-count">
              {filteredUsers.length} eligible user{filteredUsers.length === 1 ? '' : 's'}
            </span>
          </div>
          {emptyMessage && filteredUsers.length === 0 && (
            <p className="auth-controls-feature-hint">{emptyMessage}</p>
          )}
          {(loadingEligible || loadingGrants) && (
            <p className="auth-controls-feature-hint">Loading users…</p>
          )}
          {!loadingEligible && !loadingGrants && filteredUsers.length > 0 && (
            <ul className="auth-controls-feature-user-list">
              {filteredUsers.map((user) => (
                <li key={user.id}>
                  <label className="auth-controls-feature-user-item">
                    <input
                      type="checkbox"
                      checked={Boolean(grantMap[user.id])}
                      disabled={busy}
                      onChange={() => handleUserToggle(user.id)}
                    />
                    <span className="auth-controls-feature-user-name">{user.name || `User #${user.id}`}</span>
                    <span className="auth-controls-feature-user-role">
                      {user.job_role_name || user.job_role || '—'}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default FeatureUserAccessPanel;
