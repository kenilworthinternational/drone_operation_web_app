import React, { useMemo, useState } from 'react';
import {
  useGetSmartKpiFieldTypesQuery,
  useSaveSmartKpiFieldTypeMutation,
} from '../../../api/services NodeJs/employeeKpiApi';
import { SMART_KPI_VALUE_KINDS, slugifyFieldTypeCode } from '../../hr&admin/kpi/smartKpiFieldTypeUtils';

function emptyDraft() {
  return {
    code: '',
    label: '',
    value_kind: 'text',
    unit_suffix: '',
    sort_order: '100',
    activated: '1',
  };
}

export default function SmartKpiFieldTypesPanel({ onMessage }) {
  const [editRow, setEditRow] = useState(null);
  const [draft, setDraft] = useState(null);

  const { data: rows = [], refetch, isLoading } = useGetSmartKpiFieldTypesQuery({ include_inactive: true });
  const [saveType, { isLoading: saving }] = useSaveSmartKpiFieldTypeMutation();

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (Number(a.sort_order) - Number(b.sort_order)) || String(a.code).localeCompare(String(b.code))),
    [rows],
  );

  const notify = (type, text) => onMessage?.({ type, text });
  const isSystem = Number(editRow?.is_system) === 1;

  const openAdd = () => {
    setEditRow(null);
    setDraft(emptyDraft());
  };

  const openEdit = (row) => {
    setEditRow(row);
    setDraft({
      code: row.code || '',
      label: row.label || '',
      value_kind: row.value_kind || 'text',
      unit_suffix: row.unit_suffix || '',
      sort_order: String(row.sort_order ?? 0),
      activated: String(Number(row.activated) === 0 ? 0 : 1),
    });
  };

  const closeModal = () => {
    setEditRow(null);
    setDraft(null);
  };

  const save = async () => {
    if (!draft) return;
    const label = String(draft.label || '').trim();
    const code = slugifyFieldTypeCode(draft.code || label);
    if (!code) {
      notify('error', 'Code is required.');
      return;
    }
    if (!label) {
      notify('error', 'Label is required.');
      return;
    }
    try {
      await saveType({
        code: editRow?.code || code,
        existing_code: editRow?.code,
        label,
        value_kind: draft.value_kind,
        unit_suffix: String(draft.unit_suffix || '').trim() || null,
        sort_order: Number(draft.sort_order) || 0,
        activated: Number(draft.activated) === 0 ? 0 : 1,
      }).unwrap();
      notify('success', editRow?.code ? 'Field type updated.' : 'Field type added.');
      closeModal();
      refetch();
    } catch (err) {
      notify('error', err?.data?.message || 'Save failed.');
    }
  };

  return (
    <div className="vehicle-admin-card-master-data">
      <div className="master-data-chemicals-head-master-data">
        <div className="master-data-chemicals-head-text-master-data">
          <h3>SMART KPI Field Types</h3>
          <p className="vehicle-master-note-master-data">
            Manage input types used in SMART KPI goal and result fields. Built-in types can be renamed; custom types can be added.
          </p>
        </div>
        <button type="button" className="btn-submit-master-data master-data-chemicals-add-btn-master-data" onClick={openAdd}>
          Add Type
        </button>
      </div>

      <div className="vehicle-table-wrap-master-data" style={{ marginTop: 12 }}>
        <table className="vehicle-table-master-data">
          <thead>
            <tr>
              <th>Code</th>
              <th>Label</th>
              <th>Value kind</th>
              <th>Suffix</th>
              <th>Sort</th>
              <th>System</th>
              <th>Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8}>Loading…</td></tr>
            ) : sortedRows.length === 0 ? (
              <tr><td colSpan={8}>No field types yet. Run migration or add one.</td></tr>
            ) : (
              sortedRows.map((row) => (
                <tr key={row.code}>
                  <td><code>{row.code}</code></td>
                  <td>{row.label}</td>
                  <td>{row.value_kind}</td>
                  <td>{row.unit_suffix || '—'}</td>
                  <td>{row.sort_order}</td>
                  <td>{Number(row.is_system) === 1 ? 'Yes' : 'No'}</td>
                  <td>{Number(row.activated) === 1 ? 'Yes' : 'No'}</td>
                  <td>
                    <button type="button" className="action-btn-master-data neutral-master-data" onClick={() => openEdit(row)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {draft && (
        <div className="update-popup-overlay-master-data">
          <div className="update-popup-card-master-data update-popup-card-wide-master-data">
            <h3>{editRow?.code ? 'Edit Field Type' : 'Add Field Type'}</h3>
            <div className="master-edit-grid-2col-master-data">
              <div className="master-edit-field-master-data">
                <label htmlFor="skft-code">Code</label>
                <input
                  id="skft-code"
                  className="master-edit-input-master-data"
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                  disabled={!!editRow?.code && isSystem}
                  placeholder="e.g. currency_amount"
                />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="skft-label">Label</label>
                <input
                  id="skft-label"
                  className="master-edit-input-master-data"
                  value={draft.label}
                  onChange={(e) => setDraft({
                    ...draft,
                    label: e.target.value,
                    code: editRow?.code || draft.code || slugifyFieldTypeCode(e.target.value),
                  })}
                />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="skft-kind">Value kind</label>
                <select
                  id="skft-kind"
                  className="master-edit-input-master-data"
                  value={draft.value_kind}
                  onChange={(e) => setDraft({ ...draft, value_kind: e.target.value })}
                  disabled={isSystem}
                >
                  {SMART_KPI_VALUE_KINDS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="skft-suffix">Unit suffix (optional)</label>
                <input
                  id="skft-suffix"
                  className="master-edit-input-master-data"
                  value={draft.unit_suffix}
                  onChange={(e) => setDraft({ ...draft, unit_suffix: e.target.value })}
                  placeholder="e.g. % or min"
                />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="skft-sort">Sort order</label>
                <input
                  id="skft-sort"
                  className="master-edit-input-master-data"
                  value={draft.sort_order}
                  onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
                />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="skft-active">Active</label>
                <select
                  id="skft-active"
                  className="master-edit-input-master-data"
                  value={draft.activated}
                  onChange={(e) => setDraft({ ...draft, activated: e.target.value })}
                >
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
            </div>
            {isSystem ? (
              <p className="vehicle-master-note-master-data" style={{ marginTop: 8 }}>
                Built-in type: code and value kind are locked. You can change label, suffix, sort order, and active status.
              </p>
            ) : null}
            <div className="update-popup-actions-master-data">
              <button type="button" className="action-btn-master-data neutral-master-data" onClick={closeModal}>Cancel</button>
              <button type="button" className="btn-submit-master-data" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
