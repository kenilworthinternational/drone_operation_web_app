import React, { useMemo, useState } from 'react';
import {
  useGetKpiDefinitionsQuery,
  useGetKpiSourceMetricsQuery,
  useSaveKpiDefinitionMutation,
} from '../../../api/services NodeJs/employeeKpiApi';

function emptyDraft() {
  return {
    code: '',
    name: '',
    description: '',
    category: 'Attendance',
    source_metric: 'attendance_rate',
    weight: '1',
    target_value: '95',
    higher_is_better: '1',
    penalty_per_incident: '10',
    sort_order: '0',
    activated: '1',
  };
}

const CATEGORY_OPTIONS = ['Attendance', 'Leave', 'Development', 'Conduct'];

export default function KpiDefinitionsPanel({ onMessage }) {
  const [editRow, setEditRow] = useState(null);
  const [draft, setDraft] = useState(null);

  const { data: rows = [], refetch, isLoading } = useGetKpiDefinitionsQuery({ include_inactive: true });
  const { data: sourceMetrics = [] } = useGetKpiSourceMetricsQuery();
  const [saveDefinition, { isLoading: saving }] = useSaveKpiDefinitionMutation();

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (Number(a.sort_order) - Number(b.sort_order)) || (Number(a.id) - Number(b.id))),
    [rows],
  );

  const notify = (type, text) => onMessage?.({ type, text });

  const openAdd = () => {
    setEditRow(null);
    setDraft(emptyDraft());
  };

  const openEdit = (row) => {
    setEditRow(row);
    setDraft({
      code: row.code || '',
      name: row.name || '',
      description: row.description || '',
      category: row.category || 'Attendance',
      source_metric: row.source_metric || 'attendance_rate',
      weight: String(row.weight ?? 1),
      target_value: String(row.target_value ?? 95),
      higher_is_better: String(Number(row.higher_is_better) === 0 ? 0 : 1),
      penalty_per_incident: String(row.penalty_per_incident ?? 10),
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
    const code = String(draft.code || '').trim();
    const name = String(draft.name || '').trim();
    if (!code || !name) {
      notify('error', 'Code and name are required.');
      return;
    }
    const body = {
      id: editRow?.id,
      code,
      name,
      description: String(draft.description || '').trim() || null,
      category: draft.category || null,
      source_metric: draft.source_metric,
      weight: Number(draft.weight) || 1,
      target_value: Number(draft.target_value) || 95,
      higher_is_better: Number(draft.higher_is_better) === 0 ? 0 : 1,
      penalty_per_incident: draft.source_metric === 'conduct' ? Number(draft.penalty_per_incident) || 10 : null,
      sort_order: Number(draft.sort_order) || 0,
      activated: Number(draft.activated) === 0 ? 0 : 1,
    };
    try {
      await saveDefinition(body).unwrap();
      notify('success', editRow?.id ? 'KPI definition updated.' : 'KPI definition added.');
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
          <h3>KPI Definitions</h3>
          <p className="vehicle-master-note-master-data">
            Configure auto-computed employee KPI metrics, weights, and targets.
          </p>
        </div>
        <button type="button" className="btn-submit-master-data master-data-chemicals-add-btn-master-data" onClick={openAdd}>
          Add KPI
        </button>
      </div>

      <div className="vehicle-table-wrap-master-data" style={{ marginTop: 12 }}>
        <table className="vehicle-table-master-data">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Source</th>
              <th>Weight</th>
              <th>Target</th>
              <th>Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7}>Loading…</td></tr>
            ) : sortedRows.length === 0 ? (
              <tr><td colSpan={7}>No KPI definitions yet.</td></tr>
            ) : (
              sortedRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.source_metric}</td>
                  <td>{row.weight}</td>
                  <td>{row.target_value}</td>
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
            <h3>{editRow?.id ? 'Edit KPI Definition' : 'Add KPI Definition'}</h3>
            <div className="master-edit-grid-2col-master-data">
              <div className="master-edit-field-master-data">
                <label htmlFor="kpi-code">Code</label>
                <input id="kpi-code" className="master-edit-input-master-data" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} disabled={Boolean(editRow?.id)} />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="kpi-name">Name</label>
                <input id="kpi-name" className="master-edit-input-master-data" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="kpi-category">Category</label>
                <select id="kpi-category" className="master-edit-input-master-data" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="kpi-source">Source metric</label>
                <select id="kpi-source" className="master-edit-input-master-data" value={draft.source_metric} onChange={(e) => setDraft({ ...draft, source_metric: e.target.value })}>
                  {sourceMetrics.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="kpi-weight">Weight</label>
                <input id="kpi-weight" className="master-edit-input-master-data" value={draft.weight} onChange={(e) => setDraft({ ...draft, weight: e.target.value })} />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="kpi-target">Target value</label>
                <input id="kpi-target" className="master-edit-input-master-data" value={draft.target_value} onChange={(e) => setDraft({ ...draft, target_value: e.target.value })} />
              </div>
              {draft.source_metric === 'conduct' && (
                <div className="master-edit-field-master-data">
                  <label htmlFor="kpi-penalty">Penalty per incident</label>
                  <input id="kpi-penalty" className="master-edit-input-master-data" value={draft.penalty_per_incident} onChange={(e) => setDraft({ ...draft, penalty_per_incident: e.target.value })} />
                </div>
              )}
              <div className="master-edit-field-master-data">
                <label htmlFor="kpi-sort">Sort order</label>
                <input id="kpi-sort" className="master-edit-input-master-data" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })} />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="kpi-active">Active</label>
                <select id="kpi-active" className="master-edit-input-master-data" value={draft.activated} onChange={(e) => setDraft({ ...draft, activated: e.target.value })}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
              <div className="master-edit-field-master-data master-edit-field-span2-master-data">
                <label htmlFor="kpi-desc">Description</label>
                <textarea id="kpi-desc" className="master-edit-input-master-data" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} />
              </div>
            </div>
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
