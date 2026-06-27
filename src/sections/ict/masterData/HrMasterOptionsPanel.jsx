import React, { useMemo, useState } from 'react';
import {
  useGetHrMasterOptionsQuery,
  useCreateHrMasterOptionMutation,
  useUpdateHrMasterOptionMutation,
} from '../../../api/services NodeJs/hrMasterOptionsApi';
import {
  HR_MASTER_CATEGORY_HINTS,
  groupHrMasterCategories,
  hrMasterCategoryLabel,
} from '../../../config/hrMasterCategories';

function emptyDraft(category) {
  return {
    category: category || 'title',
    label: '',
    option_value: '',
    sort_order: '0',
    activated: '1',
  };
}

export default function HrMasterOptionsPanel({ onMessage }) {
  const [selectedCategory, setSelectedCategory] = useState('title');
  const [editRow, setEditRow] = useState(null);
  const [draft, setDraft] = useState(null);

  const { data: rows = [], refetch, isLoading } = useGetHrMasterOptionsQuery({
    category: selectedCategory,
    include_inactive: true,
  });
  const [createOption, { isLoading: creating }] = useCreateHrMasterOptionMutation();
  const [updateOption, { isLoading: updating }] = useUpdateHrMasterOptionMutation();

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id)),
    [rows],
  );

  const groupedCategories = useMemo(() => groupHrMasterCategories(), []);

  const categoryHint = HR_MASTER_CATEGORY_HINTS[selectedCategory];

  const notify = (type, text) => onMessage?.({ type, text });

  const openAdd = () => {
    setEditRow(null);
    setDraft(emptyDraft(selectedCategory));
  };

  const openEdit = (row) => {
    setEditRow(row);
    setDraft({
      category: row.category,
      label: row.label || '',
      option_value: row.option_value || '',
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
    const optionValue = String(draft.option_value || '').trim() || label;
    if (!label) {
      notify('error', 'Label is required.');
      return;
    }
    if (!optionValue) {
      notify('error', 'Stored value is required.');
      return;
    }
    const body = {
      category: draft.category || selectedCategory,
      label,
      option_value: optionValue,
      sort_order: parseInt(draft.sort_order, 10) || 0,
      activated: parseInt(draft.activated, 10) === 0 ? 0 : 1,
    };
    try {
      if (editRow?.id) {
        await updateOption({ id: editRow.id, ...body }).unwrap();
        notify('success', 'Option updated.');
      } else {
        await createOption(body).unwrap();
        notify('success', 'Option added.');
      }
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
          <h3>HR Master Options</h3>
          <p className="vehicle-master-note-master-data">
            Dropdown values for Employee Profile — including education (A/L stream, schools, programmes) and
            employment history (industry).
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="master-edit-input-master-data"
          >
            {groupedCategories.map(({ group, categories }) => (
              <optgroup key={group} label={group}>
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="button"
            className="btn-submit-master-data master-data-chemicals-add-btn-master-data"
            onClick={openAdd}
          >
            Add option
          </button>
        </div>
      </div>

      <p className="vehicle-master-note-master-data" style={{ marginTop: 8 }}>
        Category: <strong>{hrMasterCategoryLabel(selectedCategory)}</strong>
        {categoryHint ? (
          <>
            {' '}
            — {categoryHint}
          </>
        ) : null}
      </p>

      <div className="vehicle-table-wrap-master-data" style={{ marginTop: 12 }}>
        <table className="vehicle-table-master-data">
          <thead>
            <tr>
              <th>ID</th>
              <th>Label</th>
              <th>Stored value</th>
              <th>Sort</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}>Loading…</td></tr>
            ) : sortedRows.length === 0 ? (
              <tr><td colSpan={6}>No options yet. Add one above.</td></tr>
            ) : (
              sortedRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.label}</td>
                  <td>{row.option_value}</td>
                  <td>{row.sort_order}</td>
                  <td>
                    <span
                      className={
                        Number(row.activated) === 1
                          ? 'status-chip-master-data active-master-data'
                          : 'status-chip-master-data inactive-master-data'
                      }
                    >
                      {Number(row.activated) === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="action-btn-master-data neutral-master-data"
                      onClick={() => openEdit(row)}
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

      {draft && (
        <div className="update-popup-overlay-master-data">
          <div className="update-popup-card-master-data update-popup-card-wide-master-data">
            <h3>{editRow ? 'Edit HR option' : 'Add HR option'}</h3>
            <div className="master-edit-grid-2col-master-data">
              <div className="master-edit-field-master-data master-edit-field-span2-master-data">
                <label htmlFor="hr-master-cat">Category</label>
                <select
                  id="hr-master-cat"
                  className="master-edit-input-master-data"
                  value={draft.category}
                  onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                  disabled={!!editRow}
                >
                  {groupedCategories.map(({ group, categories }) => (
                    <optgroup key={group} label={group}>
                      {categories.map((cat) => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="master-edit-field-master-data master-edit-field-span2-master-data">
                <label htmlFor="hr-master-label">Label (shown in dropdown)</label>
                <input
                  id="hr-master-label"
                  className="master-edit-input-master-data"
                  value={draft.label}
                  onChange={(e) => {
                    const nextLabel = e.target.value;
                    setDraft((p) => ({
                      ...p,
                      label: nextLabel,
                      option_value: !p.option_value || p.option_value === p.label ? nextLabel : p.option_value,
                    }));
                  }}
                  autoComplete="off"
                />
              </div>
              <div className="master-edit-field-master-data master-edit-field-span2-master-data">
                <label htmlFor="hr-master-value">Stored value (saved to employee record)</label>
                <input
                  id="hr-master-value"
                  className="master-edit-input-master-data"
                  value={draft.option_value}
                  onChange={(e) => setDraft((p) => ({ ...p, option_value: e.target.value }))}
                  placeholder="Usually same as label"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="hr-master-sort">Sort order</label>
                <input
                  id="hr-master-sort"
                  type="number"
                  className="master-edit-input-master-data"
                  value={draft.sort_order}
                  onChange={(e) => setDraft((p) => ({ ...p, sort_order: e.target.value }))}
                />
              </div>
              <div className="master-edit-field-master-data">
                <label htmlFor="hr-master-status">Status</label>
                <select
                  id="hr-master-status"
                  className="master-edit-input-master-data"
                  value={draft.activated}
                  onChange={(e) => setDraft((p) => ({ ...p, activated: e.target.value }))}
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                type="button"
                className="btn-submit-master-data"
                onClick={save}
                disabled={creating || updating}
              >
                {creating || updating ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="action-btn-master-data neutral-master-data" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
