import React, { useEffect, useMemo, useState } from 'react';
import {
  useUpdateEmployeeRegistrationMutation,
} from '../../../api/services NodeJs/jdManagementApi';
import {
  useListEmployeeProfileSectionQuery,
  useSaveEmployeeProfileSectionMutation,
  useDeleteEmployeeProfileSectionMutation,
} from '../../../api/services NodeJs/employeeProfileApi';
import { appendFormFields, sanitizePhone9, splitDate } from './employeeProfileUtils';
import { useEmployee } from './useEmployee';
import MasterSelect from './MasterSelect';
import { useHrMasterOptions } from './useHrMasterOptions';

const CHILD_RELATIONSHIPS = ['Son', 'Daughter'];

function relationshipsForMaritalStatus(allRelationships, maritalStatus) {
  if (maritalStatus === 'Single') {
    return allRelationships.filter((r) => r !== 'Spouse');
  }
  return allRelationships;
}

function allowsSpouse(maritalStatus) {
  return maritalStatus !== 'Single';
}

function ageFromDob(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? String(age) : '';
}

function emptyDependent() {
  return {
    relationship: '',
    name: '',
    dob: '',
    age: '',
    occupation: '',
    employer: '',
    school: '',
  };
}

function SaveBanner({ message }) {
  if (!message?.text) return null;
  return (
    <p className={`epd-schedule-message epd-schedule-message--${message.type}`}>{message.text}</p>
  );
}

export default function FamilyDependentsSection({ employeeId, readOnly = false }) {
  const { getLabels } = useHrMasterOptions();
  const dependentRelationships = getLabels('dependent_relationship');
  const emergencyRelationships = getLabels('emergency_relationship');
  const { employee, refetch: refetchEmployee } = useEmployee(employeeId);
  const { data, isLoading, refetch } = useListEmployeeProfileSectionQuery(
    { section: 'dependents', employeeId },
    { skip: !employeeId },
  );
  const [saveSection, { isLoading: savingDep }] = useSaveEmployeeProfileSectionMutation();
  const [deleteSection] = useDeleteEmployeeProfileSectionMutation();
  const [updateEmployee, { isLoading: savingMeta }] = useUpdateEmployeeRegistrationMutation();

  const [draft, setDraft] = useState(emptyDependent);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [meta, setMeta] = useState({
    maritalStatus: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
  });

  const rows = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const spouse = useMemo(
    () => rows.find((r) => r.relationship === 'Spouse' || Number(r.is_spouse) === 1),
    [rows],
  );
  const childCount = useMemo(
    () => rows.filter((r) => CHILD_RELATIONSHIPS.includes(r.relationship)).length,
    [rows],
  );
  const isSingle = meta.maritalStatus === 'Single';
  const relationshipOptions = useMemo(
    () => relationshipsForMaritalStatus(dependentRelationships, meta.maritalStatus),
    [dependentRelationships, meta.maritalStatus],
  );

  useEffect(() => {
    if (!employee) return;
    setMeta({
      maritalStatus: employee.maritalStatus || '',
      emergencyContactName: employee.emergencyContactName || '',
      emergencyContactRelationship: employee.emergencyContactRelationship || '',
      emergencyContactNumber: employee.emergencyContactNumber || '',
    });
  }, [employee]);

  const syncEmployeeSummary = async (dependentRows, maritalStatus) => {
    const sp = allowsSpouse(maritalStatus)
      ? dependentRows.find((r) => r.relationship === 'Spouse' || Number(r.is_spouse) === 1)
      : null;
    const children = dependentRows.filter((r) => CHILD_RELATIONSHIPS.includes(r.relationship)).length;
    const fd = new FormData();
    fd.append('id', String(employeeId));
    if (maritalStatus !== undefined) fd.append('maritalStatus', maritalStatus || '');
    fd.append('spouseName', sp?.name || '');
    fd.append('noOfChildren', String(children));
    await updateEmployee(fd).unwrap().catch(() => {});
    refetchEmployee();
  };

  const onMetaChange = (e) => {
    const { name, value } = e.target;
    setMeta((prev) => {
      const next = {
        ...prev,
        [name]: name === 'emergencyContactNumber' ? sanitizePhone9(value) : value,
      };
      if (name === 'maritalStatus' && value === 'Single' && draft.relationship === 'Spouse') {
        setDraft((d) => ({ ...d, relationship: '' }));
      }
      return next;
    });
  };

  const onDraftChange = (name, value) => {
    setDraft((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'dob') next.age = ageFromDob(value);
      return next;
    });
  };

  const resetDraft = () => {
    setDraft(emptyDependent());
    setEditingId(null);
  };

  const startEdit = (row) => {
    setDraft({
      relationship: row.relationship || '',
      name: row.name || '',
      dob: splitDate(row.dob),
      age: row.age != null ? String(row.age) : ageFromDob(row.dob),
      occupation: row.occupation || '',
      employer: row.employer || '',
      school: row.school || '',
    });
    setEditingId(row.id);
  };

  const handleSaveDependent = async () => {
    setMessage(null);
    if (!draft.relationship?.trim() || !draft.name?.trim()) {
      setMessage({ type: 'error', text: 'Relationship and name are required.' });
      return;
    }
    if (draft.relationship === 'Spouse') {
      if (!allowsSpouse(meta.maritalStatus)) {
        setMessage({ type: 'error', text: 'Spouse cannot be added when marital status is Single.' });
        return;
      }
      const existingSpouse = rows.find(
        (r) => (r.relationship === 'Spouse' || Number(r.is_spouse) === 1) && r.id !== editingId,
      );
      if (existingSpouse) {
        setMessage({ type: 'error', text: 'Only one spouse record is allowed. Edit the existing spouse row.' });
        return;
      }
    }

    const body = {
      section: 'dependents',
      employeeId,
      ...draft,
      age: draft.age ? parseInt(draft.age, 10) : null,
      is_spouse: draft.relationship === 'Spouse' ? 1 : 0,
    };
    if (editingId) body.id = editingId;

    try {
      await saveSection(body).unwrap();
      const refreshed = await refetch();
      const updatedRows = Array.isArray(refreshed?.data?.data) ? refreshed.data.data : rows;
      let marital = meta.maritalStatus;
      if (draft.relationship === 'Spouse' && !marital) marital = 'Married';
      await syncEmployeeSummary(updatedRows, marital);
      if (draft.relationship === 'Spouse' && marital !== meta.maritalStatus) {
        setMeta((p) => ({ ...p, maritalStatus: marital }));
      }
      resetDraft();
      setMessage({ type: 'success', text: editingId ? 'Family member updated.' : 'Family member added.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save family member.' });
    }
  };

  const handleDelete = async (id) => {
    setMessage(null);
    try {
      await deleteSection({ section: 'dependents', id }).unwrap();
      const refreshed = await refetch();
      const updatedRows = Array.isArray(refreshed?.data?.data) ? refreshed.data.data : [];
      await syncEmployeeSummary(updatedRows, meta.maritalStatus);
      if (editingId === id) resetDraft();
      setMessage({ type: 'success', text: 'Family member removed.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete.' });
    }
  };

  const handleSaveMeta = async () => {
    setMessage(null);
    const fd = new FormData();
    fd.append('id', String(employeeId));
    appendFormFields(fd, meta);
    fd.append('spouseName', isSingle ? '' : (spouse?.name || ''));
    fd.append('noOfChildren', String(childCount));
    try {
      await updateEmployee(fd).unwrap();
      refetchEmployee();
      if (isSingle && spouse) {
        setMessage({
          type: 'success',
          text: 'Saved. Remove any spouse record from the family list if marital status is Single.',
        });
      } else {
        setMessage({ type: 'success', text: 'Marital status and emergency contact saved.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save.' });
    }
  };

  return (
    <div className={`epd-section${readOnly ? ' ep-tab-readonly' : ''}`}>
      {!readOnly && (
        <p className="epd-section-intro">
          Select marital status first. Add each family member once — children, parents, siblings, and spouse only when not Single.
        </p>
      )}

      <h4 className="ep-subsection-title">Marital status</h4>
      {readOnly ? (
        <div className="ep-readonly-grid ep-readonly-grid--inline">
          <div className="ep-readonly-item">
            <span className="ep-readonly-label">Marital status</span>
            <span className="ep-readonly-value">{meta.maritalStatus || '—'}</span>
          </div>
        </div>
      ) : (
      <div className="epd-form-grid ep-marital-row">
        <div className="epd-field">
          <label>Marital status</label>
          <MasterSelect category="marital_status" name="maritalStatus" value={meta.maritalStatus} onChange={onMetaChange} />
        </div>
      </div>
      )}

      <div className="ep-family-summary">
        {!isSingle && (
          <span><strong>Spouse:</strong> {spouse?.name || '—'}</span>
        )}
        <span><strong>Children:</strong> {childCount}</span>
        <span><strong>Total family members:</strong> {rows.length}</span>
      </div>

      <h4 className="ep-subsection-title">Family members</h4>
      {!readOnly && (
      <div className="epd-form-grid">
        <div className="epd-field">
          <label>Relationship</label>
          <select
            value={draft.relationship}
            onChange={(e) => onDraftChange('relationship', e.target.value)}
          >
            <option value="">-- Select --</option>
            {relationshipOptions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="epd-field">
          <label>Name</label>
          <input value={draft.name} onChange={(e) => onDraftChange('name', e.target.value)} />
        </div>
        <div className="epd-field">
          <label>Date of birth</label>
          <input type="date" value={draft.dob} onChange={(e) => onDraftChange('dob', e.target.value)} />
        </div>
        <div className="epd-field">
          <label>Age</label>
          <input value={draft.age ? `${draft.age} years` : ''} readOnly style={{ background: '#f5f5f5' }} />
        </div>
        <div className="epd-field">
          <label>Occupation</label>
          <input value={draft.occupation} onChange={(e) => onDraftChange('occupation', e.target.value)} />
        </div>
        <div className="epd-field">
          <label>Employer</label>
          <input value={draft.employer} onChange={(e) => onDraftChange('employer', e.target.value)} />
        </div>
        <div className="epd-field">
          <label>School</label>
          <input value={draft.school} onChange={(e) => onDraftChange('school', e.target.value)} />
        </div>
      </div>
      )}
      {!readOnly && (
      <div className="epd-actions">
        <button
          type="button"
          className="epd-btn epd-btn-primary"
          onClick={handleSaveDependent}
          disabled={savingDep}
        >
          {editingId ? 'Update member' : 'Add member'}
        </button>
        {editingId && (
          <button type="button" className="epd-btn" onClick={resetDraft}>Cancel</button>
        )}
      </div>
      )}

      <div className="epd-table-wrap">
        {isLoading ? (
          <p>Loading…</p>
        ) : rows.length === 0 ? (
          <p className="epd-empty">
            {isSingle
              ? 'No family members added yet. Add parents, siblings, or other dependents.'
              : 'No family members added yet. Add spouse, children, or other dependents.'}
          </p>
        ) : (
          <table className="epd-table">
            <thead>
              <tr>
                <th>Relationship</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Age</th>
                <th>Occupation</th>
                <th>Employer</th>
                <th>School</th>
                {!readOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.relationship || '-'}</td>
                  <td>{row.name || '-'}</td>
                  <td>{row.dob ? splitDate(row.dob) : '-'}</td>
                  <td>{row.age ?? ageFromDob(row.dob) ?? '-'}</td>
                  <td>{row.occupation || '-'}</td>
                  <td>{row.employer || '-'}</td>
                  <td>{row.school || '-'}</td>
                  {!readOnly && (
                  <td className="epd-row-actions">
                    <button type="button" className="epd-btn epd-btn-sm" onClick={() => startEdit(row)}>Edit</button>
                    <button type="button" className="epd-btn epd-btn-sm epd-btn-danger" onClick={() => handleDelete(row.id)}>Delete</button>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <hr className="ep-section-divider" />
      <h4 className="ep-subsection-title">Emergency contact</h4>
      {!readOnly && (
        <p className="epd-section-intro">Emergency contact is separate from family members listed above.</p>
      )}
      {readOnly ? (
        <div className="ep-readonly-grid">
          <div className="ep-readonly-item">
            <span className="ep-readonly-label">Emergency contact name</span>
            <span className="ep-readonly-value">{meta.emergencyContactName || '—'}</span>
          </div>
          <div className="ep-readonly-item">
            <span className="ep-readonly-label">Emergency relationship</span>
            <span className="ep-readonly-value">{meta.emergencyContactRelationship || '—'}</span>
          </div>
          <div className="ep-readonly-item">
            <span className="ep-readonly-label">Emergency contact number</span>
            <span className="ep-readonly-value">{meta.emergencyContactNumber || '—'}</span>
          </div>
        </div>
      ) : (
      <>
      <div className="epd-form-grid">
        <div className="epd-field">
          <label>Emergency contact name</label>
          <input name="emergencyContactName" value={meta.emergencyContactName} onChange={onMetaChange} />
        </div>
        <div className="epd-field">
          <label>Emergency relationship</label>
          <MasterSelect
            category="emergency_relationship"
            name="emergencyContactRelationship"
            value={meta.emergencyContactRelationship}
            onChange={onMetaChange}
          />
        </div>
        <div className="epd-field">
          <label>Emergency contact number</label>
          <input name="emergencyContactNumber" value={meta.emergencyContactNumber} onChange={onMetaChange} maxLength={9} />
        </div>
      </div>
      <SaveBanner message={message} />
      <div className="epd-actions">
        <button type="button" className="epd-btn epd-btn-primary" onClick={handleSaveMeta} disabled={savingMeta}>
          {savingMeta ? 'Saving…' : 'Save status & emergency contact'}
        </button>
      </div>
      </>
      )}
    </div>
  );
}
