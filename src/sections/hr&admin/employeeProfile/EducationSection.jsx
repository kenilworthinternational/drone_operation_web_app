import React, { useMemo, useState } from 'react';
import {
  useListEmployeeProfileSectionQuery,
  useSaveEmployeeProfileSectionMutation,
  useDeleteEmployeeProfileSectionMutation,
  useUploadEmployeeProfileSectionFileMutation,
} from '../../../api/services NodeJs/employeeProfileApi';
import MasterSelect from './MasterSelect';
import AlSubjectResultsEditor from './AlSubjectResultsEditor';
import {
  emptyAlSubjectResults,
  formatAlSubjectResultsSummary,
  isAlQualificationType,
  parseAlSubjectResults,
  serializeAlSubjectResults,
  validateAlSubjectResults,
} from './alSubjectResults';
import {
  EDUCATION_FIELD_DEFS,
  EDUCATION_TABLE_COLUMNS,
  getEducationFieldsForType,
  isEducationFieldVisible,
} from './educationQualificationFields';

const DATE = 'date';

function emptyEducationRow() {
  const row = {};
  Object.keys(EDUCATION_FIELD_DEFS).forEach((key) => {
    row[EDUCATION_FIELD_DEFS[key].name] = '';
  });
  row._alSubjects = emptyAlSubjectResults();
  return row;
}

function FieldInput({ field, value, onChange, alSubjects, onAlSubjectsChange, readOnly }) {
  if (field.type === 'al_subjects') {
    return (
      <AlSubjectResultsEditor
        value={alSubjects}
        onChange={onAlSubjectsChange}
        readOnly={readOnly}
      />
    );
  }

  const common = { value: value ?? '', onChange: (e) => onChange(field.name, e.target.value) };
  if (field.masterCategory) {
    return (
      <MasterSelect
        category={field.masterCategory}
        value={value}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    );
  }
  return <input type={field.type === DATE ? 'date' : 'text'} {...common} />;
}

export default function EducationSection({ employeeId, readOnly = false }) {
  const { data, isLoading, refetch } = useListEmployeeProfileSectionQuery(
    { section: 'education', employeeId },
    { skip: !employeeId },
  );
  const [saveSection, { isLoading: saving }] = useSaveEmployeeProfileSectionMutation();
  const [deleteSection] = useDeleteEmployeeProfileSectionMutation();
  const [uploadFile, { isLoading: uploading }] = useUploadEmployeeProfileSectionFileMutation();

  const [draft, setDraft] = useState(() => emptyEducationRow());
  const [editingId, setEditingId] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [message, setMessage] = useState(null);

  const rows = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
  const formFields = useMemo(
    () => getEducationFieldsForType(draft.qualification_type),
    [draft.qualification_type],
  );
  const isAlDraft = isAlQualificationType(draft.qualification_type);

  const handleChange = (name, value) => {
    setDraft((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'qualification_type' && value !== prev.qualification_type) {
        const visible = new Set(getEducationFieldsForType(value).map((f) => f.name));
        Object.keys(EDUCATION_FIELD_DEFS).forEach((key) => {
          const fieldName = EDUCATION_FIELD_DEFS[key].name;
          if (fieldName !== 'qualification_type' && !visible.has(fieldName)) {
            next[fieldName] = '';
          }
        });
        if (!isAlQualificationType(value)) {
          next._alSubjects = emptyAlSubjectResults();
        }
      }
      return next;
    });
  };

  const handleAlSubjectsChange = (alData) => {
    setDraft((prev) => ({ ...prev, _alSubjects: alData }));
  };

  const resetDraft = () => {
    setDraft(emptyEducationRow());
    setEditingId(null);
    setPendingFile(null);
  };

  const startEdit = (row) => {
    const next = emptyEducationRow();
    Object.keys(EDUCATION_FIELD_DEFS).forEach((key) => {
      const fieldName = EDUCATION_FIELD_DEFS[key].name;
      let v = row[fieldName];
      if (EDUCATION_FIELD_DEFS[key].type === DATE && v) v = String(v).split('T')[0];
      next[fieldName] = v ?? '';
    });
    next._alSubjects = isAlQualificationType(row.qualification_type)
      ? parseAlSubjectResults(row)
      : emptyAlSubjectResults();
    setDraft(next);
    setEditingId(row.id);
    setPendingFile(null);
  };

  const handleSave = async () => {
    setMessage(null);
    if (!draft.qualification_type?.trim()) {
      setMessage({ type: 'error', text: 'Select a qualification type first.' });
      return;
    }

    const body = {
      section: 'education',
      employeeId,
      qualification_type: draft.qualification_type,
      course_name: draft.course_name,
      institution: draft.institution,
      field_of_study: draft.field_of_study,
      start_date: draft.start_date,
      completion_date: draft.completion_date,
      grade: draft.grade,
    };

    if (isAlDraft) {
      const alError = validateAlSubjectResults(draft._alSubjects);
      if (alError) {
        setMessage({ type: 'error', text: alError });
        return;
      }
      const serialized = serializeAlSubjectResults(draft._alSubjects);
      body.field_of_study = serialized.field_of_study;
      body.grade = serialized.grade;
    }

    try {
      if (editingId) body.id = editingId;
      const result = await saveSection(body).unwrap();
      const recordId = editingId || result?.data?.id;
      if (pendingFile && recordId) {
        await uploadFile({ section: 'education', employeeId, id: recordId, file: pendingFile }).unwrap();
      }
      resetDraft();
      refetch();
      setMessage({ type: 'success', text: editingId ? 'Qualification updated.' : 'Qualification added.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save.' });
    }
  };

  const handleDelete = async (id) => {
    setMessage(null);
    try {
      await deleteSection({ section: 'education', id }).unwrap();
      if (editingId === id) resetDraft();
      refetch();
      setMessage({ type: 'success', text: 'Qualification removed.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete.' });
    }
  };

  const handleRowFileUpload = async (rowId, file) => {
    if (!file) return;
    setMessage(null);
    try {
      await uploadFile({ section: 'education', employeeId, id: rowId, file }).unwrap();
      refetch();
      setMessage({ type: 'success', text: 'Certificate uploaded.' });
    } catch {
      setMessage({ type: 'error', text: 'Upload failed.' });
    }
  };

  const formatCell = (row, col) => {
    if (!isEducationFieldVisible(row.qualification_type, col.name)) return '—';
    if (col.name === 'field_of_study' && isAlQualificationType(row.qualification_type)) {
      const summary = formatAlSubjectResultsSummary(parseAlSubjectResults(row));
      return summary || '—';
    }
    if (col.name === 'grade' && isAlQualificationType(row.qualification_type)) {
      return row.grade || formatAlSubjectResultsSummary(parseAlSubjectResults(row)) || '—';
    }
    let v = row[col.name];
    if (col.type === DATE && v) v = String(v).split('T')[0];
    return v || '—';
  };

  return (
    <div className="epd-section">
      {!readOnly && (
        <p className="epd-section-intro">
          Select qualification type first. School name is free text. A/L uses English, General Test, and a third
          subject with individual grades. Other qualification types may use
          {' '}
          <strong>Master Data Update → HR Master Options</strong>
          {' '}
          for stream / programme / institution.
        </p>
      )}
      {!readOnly && message?.text ? (
        <p className={`epd-schedule-message epd-schedule-message--${message.type}`}>{message.text}</p>
      ) : null}

      {!readOnly && (
        <>
          <div className="epd-form-grid">
            {formFields.map((f) => (
              <div
                className={`epd-field${f.type === 'al_subjects' ? ' epd-field--full' : ''}`}
                key={f.name}
              >
                <label>{f.label}</label>
                <FieldInput
                  field={f}
                  value={draft[f.name]}
                  onChange={handleChange}
                  alSubjects={draft._alSubjects}
                  onAlSubjectsChange={handleAlSubjectsChange}
                />
                {f.hint ? <span className="epd-field-hint">{f.hint}</span> : null}
              </div>
            ))}
            {draft.qualification_type && (
              <div className="epd-field">
                <label>Certificate / transcript</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
                />
                {pendingFile ? (
                  <span className="epd-field-hint">{pendingFile.name} — saves with record</span>
                ) : (
                  <span className="epd-field-hint">PDF or image, one file per record</span>
                )}
              </div>
            )}
          </div>

          <div className="epd-actions">
            <button
              type="button"
              className="epd-btn epd-btn-primary"
              onClick={handleSave}
              disabled={saving || uploading || !draft.qualification_type}
            >
              {saving || uploading ? 'Saving…' : (editingId ? 'Update' : 'Add')}
            </button>
            {editingId && (
              <button type="button" className="epd-btn" onClick={resetDraft}>Cancel</button>
            )}
          </div>
        </>
      )}

      <div className="epd-table-wrap">
        {isLoading ? (
          <p>Loading…</p>
        ) : rows.length === 0 ? (
          <p className="epd-empty">No qualifications recorded yet.</p>
        ) : (
          <table className="epd-table">
            <thead>
              <tr>
                {EDUCATION_TABLE_COLUMNS.map((col) => (
                  <th key={col.name}>{col.label}</th>
                ))}
                <th>Certificate</th>
                {!readOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const fileUrl = row.certificate_file_url;
                const inputId = `edu-file-${row.id}`;
                return (
                  <tr key={row.id}>
                    {EDUCATION_TABLE_COLUMNS.map((col) => (
                      <td key={col.name}>{formatCell(row, col)}</td>
                    ))}
                    <td className="ep-row-doc-cell">
                      {fileUrl ? (
                        <a href={fileUrl} target="_blank" rel="noreferrer">View</a>
                      ) : (
                        <span className="epd-empty">—</span>
                      )}
                      {!readOnly && (
                        <>
                          <input
                            id={inputId}
                            type="file"
                            className="ep-doc-file-input"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            disabled={uploading}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleRowFileUpload(row.id, f);
                              e.target.value = '';
                            }}
                          />
                          <label htmlFor={inputId} className="epd-btn epd-btn-sm">
                            {fileUrl ? 'Replace' : 'Upload'}
                          </label>
                        </>
                      )}
                    </td>
                    {!readOnly && (
                      <td className="epd-row-actions">
                        <button type="button" className="epd-btn epd-btn-sm" onClick={() => startEdit(row)}>Edit</button>
                        <button type="button" className="epd-btn epd-btn-sm epd-btn-danger" onClick={() => handleDelete(row.id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
