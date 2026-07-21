import React, { useMemo, useState } from 'react';
import {
  useGetKpiRatingBandsQuery,
  useSaveKpiRatingBandMutation,
} from '../../../api/services NodeJs/employeeKpiApi';

function emptyDraft() {
  return {
    label: '',
    min_score: '0',
    max_score: '100',
    color_hex: '#64748b',
    sort_order: '0',
    activated: '1',
  };
}

export default function KpiRatingBandsPanel({ onMessage }) {
  const [editRow, setEditRow] = useState(null);
  const [draft, setDraft] = useState(null);

  const { data: rows = [], refetch, isLoading } = useGetKpiRatingBandsQuery({ include_inactive: true });
  const [saveBand, { isLoading: saving }] = useSaveKpiRatingBandMutation();

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
      label: row.label || '',
      min_score: String(row.min_score ?? 0),
      max_score: String(row.max_score ?? 100),
      color_hex: row.color_hex || '#64748b',
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
    if (!label) {
      notify('error', 'Label is required.');
      return;
    }
    const body = {
      id: editRow?.id,
      label,
      min_score: Number(draft.min_score),
      max_score: Number(draft.max_score),
      color_hex: draft.color_hex || '#64748b',
      sort_order: Number(draft.sort_order) || 0,
      activated: Number(draft.activated) === 0 ? 0 : 1,
    };
    try {
      await saveBand(body).unwrap();
      notify('success', editRow?.id ? 'Rating band updated.' : 'Rating band added.');
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
          <h3>KPI Rating Bands</h3>
          <p className="vehicle-master-note-master-data">
            Map composite score ranges to performance labels and colors.
          </p>
        </div>
        <button type="button" className="btn-submit-master-data master-data-chemicals-add-btn-master-data" onClick={openAdd}>
          Add Band
        </button>
      </div>

      <div className="vehicle-table-wrap-master-data" style={{ marginTop: 12 }}>
        <table className="vehicle-table-master-data">
          <thead>
            <tr>
              <th>Label</th>
              <th>Min</th>
              <th>Max</th>
              <th>Color</th>
              <th>Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}>Loading…</td></tr>
            ) : sortedRows.length === 0 ? (
              <tr><td colSpan={6}>No rating bands yet.</td></tr>
            ) : (
              sortedRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="kpi-band-dot" style={{ backgroundColor: row.color_hex || '#64748b' }} />
                    {row.label}
                  </td>
                  <td>{row.min_score}</td>
                  <td>{row.max_score}</td>
                  <td>{row.color_hex}</td>
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
            <h3>{editRow?.id ? 'Edit Rating Band' : 'Add Rating Band'}</h3>
            <div className="master-edit-grid-2col-master-data">
              <div className="master-edit-field-master-data master-edit-field-span2-master-data">
                <label htmlFor="band-label">Label</label>
                <input id="band-label" className="master-edit-input-master-data" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="band-min">Min score</label>
                <input id="band-min" className="master-edit-input-master-data" value={draft.min_score} onChange={(e) => setDraft({ ...draft, min_score: e.target.value })} />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="band-max">Max score</label>
                <input id="band-max" className="master-edit-input-master-data" value={draft.max_score} onChange={(e) => setDraft({ ...draft, max_score: e.target.value })} />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="band-color">Color</label>
                <input id="band-color" type="color" className="master-edit-input-master-data" value={draft.color_hex} onChange={(e) => setDraft({ ...draft, color_hex: e.target.value })} />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="band-sort">Sort order</label>
                <input id="band-sort" className="master-edit-input-master-data" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })} />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="band-active">Active</label>
                <select id="band-active" className="master-edit-input-master-data" value={draft.activated} onChange={(e) => setDraft({ ...draft, activated: e.target.value })}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
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
