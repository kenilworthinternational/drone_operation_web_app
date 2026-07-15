import React, { useCallback, useMemo, useState } from 'react';
import {
  useGetUserJobRolesQuery,
  useCreateUserJobRoleMutation,
  useUpdateUserJobRoleMutation,
  useGetUserLevelsQuery,
  useSaveUserLevelMutation,
  useGetUserMemberTypesQuery,
  useSaveUserMemberTypeMutation,
} from '../../../api/services NodeJs/jdManagementApi';

function getCurrentUserId() {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData?.id || null;
  } catch {
    return null;
  }
}

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function errorMessage(err, fallback) {
  return err?.data?.message || err?.data?.error || err?.message || fallback;
}

const EMPTY_ROLE = {
  designation: '',
  jdCode: '',
  userLevelId: '',
  userMemberTypeId: '',
  status: 1,
};

const EMPTY_LEVEL = {
  userLevel: '',
  levelCode: '',
};

const EMPTY_MEMBER = {
  memberType: '',
  typeCode: '',
};

const SystemRolesPanel = ({ searchTerm = '' }) => {
  const userId = getCurrentUserId();
  const [section, setSection] = useState('job-roles'); // job-roles | levels | member-types
  const [modal, setModal] = useState(null); // { type, mode, draft }
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const {
    data: rolesPayload,
    isLoading: loadingRoles,
    isFetching: fetchingRoles,
    refetch: refetchRoles,
  } = useGetUserJobRolesQuery();
  const {
    data: levelsPayload,
    isLoading: loadingLevels,
    isFetching: fetchingLevels,
    refetch: refetchLevels,
  } = useGetUserLevelsQuery();
  const {
    data: membersPayload,
    isLoading: loadingMembers,
    isFetching: fetchingMembers,
    refetch: refetchMembers,
  } = useGetUserMemberTypesQuery();

  const [createRole] = useCreateUserJobRoleMutation();
  const [updateRole] = useUpdateUserJobRoleMutation();
  const [saveLevel] = useSaveUserLevelMutation();
  const [saveMember] = useSaveUserMemberTypeMutation();

  const roles = useMemo(() => unwrapList(rolesPayload), [rolesPayload]);
  const levels = useMemo(() => unwrapList(levelsPayload), [levelsPayload]);
  const members = useMemo(() => unwrapList(membersPayload), [membersPayload]);

  const term = String(searchTerm || '').trim().toLowerCase();

  const filteredRoles = useMemo(() => {
    if (!term) return roles;
    return roles.filter((r) =>
      [r.designation, r.jdCode, r.userLevelName, r.memberTypeName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [roles, term]);

  const filteredLevels = useMemo(() => {
    if (!term) return levels;
    return levels.filter((l) =>
      [l.userLevel, l.levelCode]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [levels, term]);

  const filteredMembers = useMemo(() => {
    if (!term) return members;
    return members.filter((m) =>
      [m.memberType, m.typeCode]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [members, term]);

  const openCreate = (type) => {
    setFormError('');
    if (type === 'job-role') {
      setModal({ type, mode: 'create', draft: { ...EMPTY_ROLE } });
    } else if (type === 'level') {
      setModal({ type, mode: 'create', draft: { ...EMPTY_LEVEL } });
    } else {
      setModal({ type, mode: 'create', draft: { ...EMPTY_MEMBER } });
    }
  };

  const openEdit = (type, row) => {
    setFormError('');
    if (type === 'job-role') {
      setModal({
        type,
        mode: 'edit',
        draft: {
          id: row.id,
          designation: row.designation || '',
          jdCode: row.jdCode || '',
          userLevelId: row.userLevelId ?? '',
          userMemberTypeId: row.userMemberTypeId ?? '',
          status: Number(row.status) === 0 ? 0 : 1,
        },
      });
    } else if (type === 'level') {
      setModal({
        type,
        mode: 'edit',
        draft: {
          id: row.id,
          userLevel: row.userLevel || '',
          levelCode: row.levelCode || '',
        },
      });
    } else {
      setModal({
        type,
        mode: 'edit',
        draft: {
          id: row.id,
          memberType: row.memberType || '',
          typeCode: row.typeCode || '',
        },
      });
    }
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setFormError('');
  };

  const updateDraft = (patch) => {
    setModal((prev) => (prev ? { ...prev, draft: { ...prev.draft, ...patch } } : prev));
  };

  const refreshAll = useCallback(() => {
    refetchRoles();
    refetchLevels();
    refetchMembers();
  }, [refetchRoles, refetchLevels, refetchMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modal) return;
    setFormError('');
    setSaving(true);
    try {
      if (modal.type === 'job-role') {
        const designation = String(modal.draft.designation || '').trim();
        const jdCode = String(modal.draft.jdCode || '').trim();
        if (!designation || !jdCode) {
          setFormError('Designation and JD code are required.');
          setSaving(false);
          return;
        }
        const payload = {
          designation,
          jdCode,
          userLevelId: modal.draft.userLevelId === '' ? null : Number(modal.draft.userLevelId),
          userMemberTypeId:
            modal.draft.userMemberTypeId === '' ? null : Number(modal.draft.userMemberTypeId),
          status: Number(modal.draft.status) === 0 ? 0 : 1,
        };
        if (modal.mode === 'create') {
          await createRole({ ...payload, createdBy: userId }).unwrap();
        } else {
          await updateRole({ id: modal.draft.id, ...payload, updatedBy: userId }).unwrap();
        }
      } else if (modal.type === 'level') {
        const userLevel = String(modal.draft.userLevel || '').trim();
        if (!userLevel) {
          setFormError('User level name is required.');
          setSaving(false);
          return;
        }
        const payload = {
          id: modal.mode === 'edit' ? modal.draft.id : undefined,
          userLevel,
          levelCode: String(modal.draft.levelCode || '').trim() || null,
          createdBy: modal.mode === 'create' ? userId : undefined,
          updatedBy: modal.mode === 'edit' ? userId : undefined,
        };
        await saveLevel(payload).unwrap();
      } else {
        const memberType = String(modal.draft.memberType || '').trim();
        if (!memberType) {
          setFormError('Member type name is required.');
          setSaving(false);
          return;
        }
        const payload = {
          id: modal.mode === 'edit' ? modal.draft.id : undefined,
          memberType,
          typeCode: String(modal.draft.typeCode || '').trim() || null,
          createdBy: modal.mode === 'create' ? userId : undefined,
          updatedBy: modal.mode === 'edit' ? userId : undefined,
        };
        await saveMember(payload).unwrap();
      }
      setModal(null);
      refreshAll();
    } catch (err) {
      setFormError(errorMessage(err, 'Save failed.'));
    } finally {
      setSaving(false);
    }
  };

  const busy =
    loadingRoles ||
    loadingLevels ||
    loadingMembers ||
    fetchingRoles ||
    fetchingLevels ||
    fetchingMembers;

  return (
    <div className="auth-controls-system-roles">
      <div className="auth-controls-system-roles-toolbar">
        <div className="auth-controls-system-roles-sections">
          <button
            type="button"
            className={`auth-controls-tab ${section === 'job-roles' ? 'active' : ''}`}
            onClick={() => setSection('job-roles')}
          >
            Job roles
          </button>
          <button
            type="button"
            className={`auth-controls-tab ${section === 'levels' ? 'active' : ''}`}
            onClick={() => setSection('levels')}
          >
            User levels
          </button>
          <button
            type="button"
            className={`auth-controls-tab ${section === 'member-types' ? 'active' : ''}`}
            onClick={() => setSection('member-types')}
          >
            Member types
          </button>
        </div>
        <div className="auth-controls-system-roles-actions">
          <button type="button" className="auth-controls-sync-btn" onClick={refreshAll} disabled={busy}>
            {busy ? 'Refreshing…' : 'Refresh'}
          </button>
          {section === 'job-roles' && (
            <button type="button" className="auth-controls-system-roles-add" onClick={() => openCreate('job-role')}>
              Add job role
            </button>
          )}
          {section === 'levels' && (
            <button type="button" className="auth-controls-system-roles-add" onClick={() => openCreate('level')}>
              Add user level
            </button>
          )}
          {section === 'member-types' && (
            <button type="button" className="auth-controls-system-roles-add" onClick={() => openCreate('member')}>
              Add member type
            </button>
          )}
        </div>
      </div>

      {section === 'job-roles' && (
        <div className="auth-controls-table-wrapper auth-controls-system-roles-table-wrap">
          <table className="auth-controls-table auth-controls-system-roles-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Designation</th>
                <th>JD code</th>
                <th>User level</th>
                <th>Member type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingRoles ? (
                <tr>
                  <td colSpan={7}>Loading job roles…</td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={7}>No job roles found.</td>
                </tr>
              ) : (
                filteredRoles.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.designation}</td>
                    <td>
                      <span className="legend-code">{row.jdCode}</span>
                    </td>
                    <td>{row.userLevelName || '—'}</td>
                    <td>{row.memberTypeName || '—'}</td>
                    <td>
                      <span
                        className={`auth-controls-system-roles-status ${
                          Number(row.status) === 1 ? 'is-active' : 'is-inactive'
                        }`}
                      >
                        {Number(row.status) === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="auth-controls-system-roles-edit"
                        onClick={() => openEdit('job-role', row)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {section === 'levels' && (
        <div className="auth-controls-table-wrapper auth-controls-system-roles-table-wrap">
          <table className="auth-controls-table auth-controls-system-roles-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User level</th>
                <th>Level code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingLevels ? (
                <tr>
                  <td colSpan={4}>Loading user levels…</td>
                </tr>
              ) : filteredLevels.length === 0 ? (
                <tr>
                  <td colSpan={4}>No user levels found.</td>
                </tr>
              ) : (
                filteredLevels.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.userLevel}</td>
                    <td>
                      <span className="legend-code">{row.levelCode || '—'}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="auth-controls-system-roles-edit"
                        onClick={() => openEdit('level', row)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {section === 'member-types' && (
        <div className="auth-controls-table-wrapper auth-controls-system-roles-table-wrap">
          <table className="auth-controls-table auth-controls-system-roles-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member type</th>
                <th>Type code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingMembers ? (
                <tr>
                  <td colSpan={4}>Loading member types…</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4}>No member types found.</td>
                </tr>
              ) : (
                filteredMembers.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.memberType}</td>
                    <td>
                      <span className="legend-code">{row.typeCode || '—'}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="auth-controls-system-roles-edit"
                        onClick={() => openEdit('member', row)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="auth-controls-sync-overlay" role="dialog" aria-modal="true">
          <div className="auth-controls-sync-modal auth-controls-system-roles-modal">
            <div className="auth-controls-sync-modal-header">
              <h2>
                {modal.mode === 'create' ? 'Add' : 'Update'}{' '}
                {modal.type === 'job-role'
                  ? 'job role'
                  : modal.type === 'level'
                    ? 'user level'
                    : 'member type'}
              </h2>
              <button
                type="button"
                className="auth-controls-sync-modal-close"
                onClick={closeModal}
                aria-label="Close"
                disabled={saving}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="auth-controls-sync-modal-body auth-controls-system-roles-form">
                {modal.type === 'job-role' && (
                  <>
                    <label>
                      Designation
                      <input
                        type="text"
                        value={modal.draft.designation}
                        onChange={(e) => updateDraft({ designation: e.target.value })}
                        required
                        autoFocus
                      />
                    </label>
                    <label>
                      JD code
                      <input
                        type="text"
                        value={modal.draft.jdCode}
                        onChange={(e) => updateDraft({ jdCode: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      User level
                      <select
                        value={modal.draft.userLevelId === null || modal.draft.userLevelId === undefined
                          ? ''
                          : String(modal.draft.userLevelId)}
                        onChange={(e) => updateDraft({ userLevelId: e.target.value })}
                      >
                        <option value="">— None —</option>
                        {levels.map((lvl) => (
                          <option key={lvl.id} value={String(lvl.id)}>
                            {lvl.userLevel}
                            {lvl.levelCode ? ` (${lvl.levelCode})` : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Member type
                      <select
                        value={
                          modal.draft.userMemberTypeId === null ||
                          modal.draft.userMemberTypeId === undefined
                            ? ''
                            : String(modal.draft.userMemberTypeId)
                        }
                        onChange={(e) => updateDraft({ userMemberTypeId: e.target.value })}
                      >
                        <option value="">— None —</option>
                        {members.map((m) => (
                          <option key={m.id} value={String(m.id)}>
                            {m.memberType}
                            {m.typeCode ? ` (${m.typeCode})` : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Status
                      <select
                        value={String(modal.draft.status)}
                        onChange={(e) => updateDraft({ status: Number(e.target.value) })}
                      >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </label>
                  </>
                )}

                {modal.type === 'level' && (
                  <>
                    <label>
                      User level name
                      <input
                        type="text"
                        value={modal.draft.userLevel}
                        onChange={(e) => updateDraft({ userLevel: e.target.value })}
                        required
                        autoFocus
                      />
                    </label>
                    <label>
                      Level code
                      <input
                        type="text"
                        value={modal.draft.levelCode}
                        onChange={(e) => updateDraft({ levelCode: e.target.value })}
                        placeholder="e.g. m, d, i"
                      />
                    </label>
                  </>
                )}

                {modal.type === 'member' && (
                  <>
                    <label>
                      Member type name
                      <input
                        type="text"
                        value={modal.draft.memberType}
                        onChange={(e) => updateDraft({ memberType: e.target.value })}
                        required
                        autoFocus
                      />
                    </label>
                    <label>
                      Type code
                      <input
                        type="text"
                        value={modal.draft.typeCode}
                        onChange={(e) => updateDraft({ typeCode: e.target.value })}
                        placeholder="e.g. i, e"
                      />
                    </label>
                  </>
                )}

                {formError ? <p className="auth-controls-system-roles-error">{formError}</p> : null}
              </div>
              <div className="auth-controls-sync-modal-footer auth-controls-system-roles-footer">
                <button
                  type="button"
                  className="auth-controls-system-roles-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="auth-controls-sync-modal-ok" disabled={saving}>
                  {saving ? 'Saving…' : modal.mode === 'create' ? 'Add' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemRolesPanel;
