import React, { useMemo, useState } from 'react';
import {
  useListEmployeeProfileSectionQuery,
  useSaveEmployeeProfileSectionMutation,
  useDeleteEmployeeProfileSectionMutation,
  useUploadEmployeeProfileSectionFileMutation,
} from '../../../api/services NodeJs/employeeProfileApi';

import MasterSelect from './MasterSelect';

const SELECT = 'select';
const DATE = 'date';
const NUMBER = 'number';
const TEXTAREA = 'textarea';

function emptyRow(def) {
  const row = {};
  def.fields.forEach((f) => { row[f.name] = ''; });
  return row;
}

function FieldInput({ field, value, onChange }) {
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
  if (field.type === SELECT) {
    return (
      <select {...common}>
        <option value="">-- Select --</option>
        {(field.options || []).map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return <option key={val} value={val}>{label}</option>;
        })}
      </select>
    );
  }
  if (field.type === TEXTAREA) {
    return <textarea rows={2} {...common} />;
  }
  return <input type={field.type === DATE ? 'date' : field.type === NUMBER ? 'number' : 'text'} {...common} />;
}

export default function ProfileRecordWithFileSection({
  section,
  def,
  employeeId,
  fileField,
  intro,
  readOnly = false,
}) {
  const { data, isLoading, refetch } = useListEmployeeProfileSectionQuery({ section, employeeId });
  const [saveSection, { isLoading: saving }] = useSaveEmployeeProfileSectionMutation();
  const [deleteSection] = useDeleteEmployeeProfileSectionMutation();
  const [uploadFile, { isLoading: uploading }] = useUploadEmployeeProfileSectionFileMutation();

  const [draft, setDraft] = useState(() => emptyRow(def));
  const [editingId, setEditingId] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [message, setMessage] = useState(null);

  const rows = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
  const fileUrlKey = `${fileField.column}_url`;

  const handleChange = (name, value) => setDraft((p) => ({ ...p, [name]: value }));

  const resetDraft = () => {
    setDraft(emptyRow(def));
    setEditingId(null);
    setPendingFile(null);
  };

  const startEdit = (row) => {
    const next = {};
    def.fields.forEach((f) => {
      let v = row[f.name];
      if (f.type === DATE && v) v = String(v).split('T')[0];
      next[f.name] = v ?? '';
    });
    setDraft(next);
    setEditingId(row.id);
    setPendingFile(null);
  };

  const handleSave = async () => {
    setMessage(null);
    try {
      const body = { section, employeeId, ...draft };
      if (editingId) body.id = editingId;
      const result = await saveSection(body).unwrap();
      const recordId = editingId || result?.data?.id;
      if (pendingFile && recordId) {
        await uploadFile({ section, employeeId, id: recordId, file: pendingFile }).unwrap();
      }
      resetDraft();
      refetch();
      setMessage({ type: 'success', text: editingId ? 'Record updated.' : 'Record added.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save.' });
    }
  };

  const handleDelete = async (id) => {
    setMessage(null);
    try {
      await deleteSection({ section, id }).unwrap();
      if (editingId === id) resetDraft();
      refetch();
      setMessage({ type: 'success', text: 'Record removed.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete.' });
    }
  };

  const handleRowFileUpload = async (rowId, file) => {
    if (!file) return;
    setMessage(null);
    try {
      await uploadFile({ section, employeeId, id: rowId, file }).unwrap();
      refetch();
      setMessage({ type: 'success', text: 'Document uploaded.' });
    } catch {
      setMessage({ type: 'error', text: 'Upload failed.' });
    }
  };

  return (
    <div className="epd-section">
      {intro && !readOnly ? <p className="epd-section-intro">{intro}</p> : null}
      {!readOnly && message?.text ? (
        <p className={`epd-schedule-message epd-schedule-message--${message.type}`}>{message.text}</p>
      ) : null}

      {!readOnly && (
        <>
          <div className="epd-form-grid">
            {def.fields.map((f) => (
              <div className="epd-field" key={f.name}>
                <label>{f.label}</label>
                <FieldInput field={f} value={draft[f.name]} onChange={handleChange} />
                {f.hint ? <span className="epd-field-hint">{f.hint}</span> : null}
              </div>
            ))}
            <div className="epd-field">
              <label>{fileField.label}</label>
              <input
                type="file"
                accept={fileField.accept}
                onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
              />
              {pendingFile ? (
                <span className="epd-field-hint">{pendingFile.name} — saves with record</span>
              ) : (
                <span className="epd-field-hint">PDF or image, one file per record</span>
              )}
            </div>
          </div>

          <div className="epd-actions">
            <button type="button" className="epd-btn epd-btn-primary" onClick={handleSave} disabled={saving || uploading}>
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
          <p className="epd-empty">No records yet.</p>
        ) : (
          <table className="epd-table">
            <thead>
              <tr>
                {def.fields.map((f) => <th key={f.name}>{f.label}</th>)}
                <th>{fileField.label}</th>
                {!readOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const fileUrl = row[fileUrlKey];
                const inputId = `row-file-${section}-${row.id}`;
                return (
                  <tr key={row.id}>
                    {def.fields.map((f) => {
                      let v = row[f.name];
                      if (f.type === DATE && v) v = String(v).split('T')[0];
                      return <td key={f.name}>{v || '-'}</td>;
                    })}
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
                            accept={fileField.accept}
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
