import React, { useMemo, useState } from 'react';
import {
  useListHrLeaveAdminEntitlementsQuery,
  useListHrLeaveAdminTypesQuery,
  useSaveHrLeaveAdminEntitlementMutation,
  useDeleteHrLeaveAdminEntitlementMutation,
} from '../../../api/services NodeJs/hrLeaveApi';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const MONTH_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function emptyDraft(leaveTypeCode = '') {
  return {
    id: '',
    leave_type_code: leaveTypeCode,
    rule_label: '',
    service_year_offset: '',
    join_month_from: '',
    join_month_to: '',
    accrual_mode: 'fixed_days',
    entitlement_days: '',
    sort_order: '0',
    activated: '1',
  };
}

function serviceYearLabel(value) {
  if (value === null || value === undefined || value === '') return 'From 3rd year onwards';
  if (Number(value) === 0) return 'First year after joining';
  if (Number(value) === 1) return 'Second calendar year';
  return String(value);
}

function accrualLabel(mode) {
  return mode === 'bi_monthly_floor' ? 'Gradual (every 2 months)' : 'Fixed number of days';
}

function daysLabel(row) {
  if (row.accrual_mode === 'bi_monthly_floor') {
    return '1 day per 2 months worked';
  }
  if (row.entitlement_days === null || row.entitlement_days === undefined || row.entitlement_days === '') {
    return '—';
  }
  const n = Number(row.entitlement_days);
  return Number.isFinite(n) ? `${n} day${n === 1 ? '' : 's'}` : row.entitlement_days;
}

function joinMonthsLabel(from, to) {
  if (from == null || to == null || from === '' || to === '') return 'Any month';
  const f = Number(from);
  const t = Number(to);
  if (!Number.isFinite(f) || !Number.isFinite(t)) return 'Any month';
  const fromName = MONTH_SHORT[f] || f;
  const toName = MONTH_SHORT[t] || t;
  return f === t ? fromName : `${fromName} – ${toName}`;
}

export default function LeaveEntitlementPanel({ onMessage }) {
  const [filterType, setFilterType] = useState('');
  const { data: typesResponse } = useListHrLeaveAdminTypesQuery({ includeInactive: 1 });
  const { data: response, isLoading, refetch } = useListHrLeaveAdminEntitlementsQuery({
    leave_type_code: filterType || undefined,
    includeInactive: 1,
  });
  const [saveRule, { isLoading: saving }] = useSaveHrLeaveAdminEntitlementMutation();
  const [deleteRule, { isLoading: deleting }] = useDeleteHrLeaveAdminEntitlementMutation();
  const [editRow, setEditRow] = useState(null);
  const [draft, setDraft] = useState(null);

  const typeOptions = typesResponse?.data || [];
  const rows = useMemo(() => response?.data || [], [response]);

  const notify = (text, isError = false) => onMessage?.(text, isError);

  const openAdd = () => {
    setEditRow(null);
    setDraft(emptyDraft(filterType || (typeOptions[0]?.code || '')));
  };

  const openEdit = (row) => {
    setEditRow(row);
    setDraft({
      id: String(row.id || ''),
      leave_type_code: row.leave_type_code || '',
      rule_label: row.rule_label || '',
      service_year_offset: row.service_year_offset === null || row.service_year_offset === undefined ? '' : String(row.service_year_offset),
      join_month_from: row.join_month_from ?? '',
      join_month_to: row.join_month_to ?? '',
      accrual_mode: row.accrual_mode || 'fixed_days',
      entitlement_days: row.entitlement_days ?? '',
      sort_order: String(row.sort_order ?? 0),
      activated: String(Number(row.activated ?? 1) === 1 ? 1 : 0),
    });
  };

  const closeModal = () => {
    setEditRow(null);
    setDraft(null);
  };

  const onSave = async () => {
    if (!draft) return;
    if (!String(draft.rule_label || '').trim()) {
      notify('Rule name is required.', true);
      return;
    }
    try {
      await saveRule({
        id: draft.id ? parseInt(draft.id, 10) : undefined,
        leave_type_code: draft.leave_type_code,
        rule_label: draft.rule_label.trim(),
        service_year_offset: draft.service_year_offset === '' ? null : parseInt(draft.service_year_offset, 10),
        join_month_from: draft.join_month_from === '' ? null : parseInt(draft.join_month_from, 10),
        join_month_to: draft.join_month_to === '' ? null : parseInt(draft.join_month_to, 10),
        accrual_mode: draft.accrual_mode,
        entitlement_days: draft.accrual_mode === 'bi_monthly_floor' || draft.entitlement_days === '' ? null : Number(draft.entitlement_days),
        sort_order: parseInt(draft.sort_order, 10) || 0,
        activated: editRow ? (Number(editRow.activated ?? 1) === 1 ? 1 : 0) : 1,
      }).unwrap();
      notify(editRow ? 'Entitlement rule updated.' : 'Entitlement rule added.');
      closeModal();
      refetch();
    } catch (err) {
      notify(err?.data?.message || 'Failed to save entitlement rule.', true);
    }
  };

  const onToggleStatus = async (row) => {
    const isActive = Number(row.activated ?? 1) === 1;
    try {
      if (isActive) {
        await deleteRule({ id: row.id }).unwrap();
        notify('Entitlement rule deactivated.');
      } else {
        await saveRule({
          id: row.id,
          leave_type_code: row.leave_type_code,
          rule_label: row.rule_label,
          service_year_offset: row.service_year_offset,
          join_month_from: row.join_month_from,
          join_month_to: row.join_month_to,
          accrual_mode: row.accrual_mode,
          entitlement_days: row.entitlement_days,
          sort_order: row.sort_order ?? 0,
          activated: 1,
        }).unwrap();
        notify('Entitlement rule activated.');
      }
      refetch();
    } catch (err) {
      notify(err?.data?.message || 'Failed to update rule status.', true);
    }
  };

  const showJoinMonths = draft?.service_year_offset === '1';

  return (
    <div className="leave-grid-leavemgt">
      <div className="leave-card-leavemgt leave-span-2-leavemgt">
        <div className="leave-card-header-leavemgt leave-admin-header-leavemgt">
          <div>
            <h3>Entitlement Rules</h3>
            <span className="leave-muted-leavemgt">How many leave days employees earn each year based on when they joined</span>
          </div>
          <div className="leave-admin-toolbar-leavemgt">
            <select
              className="leave-input-leavemgt"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All leave types</option>
              {typeOptions.map((type) => (
                <option key={type.code} value={type.code}>{type.name}</option>
              ))}
            </select>
            <button type="button" className="leave-btn-leavemgt leave-btn-approve-leavemgt" onClick={openAdd}>
              Add rule
            </button>
          </div>
        </div>
        <div className="leave-admin-table-wrap-leavemgt">
          <table className="leave-admin-table-leavemgt">
            <thead>
              <tr>
                <th>Leave type</th>
                <th>Rule name</th>
                <th>When it applies</th>
                <th>Join month range</th>
                <th>How days are calculated</th>
                <th>Leave days</th>
                <th>Display order</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8}>Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8}>No entitlement rules found.</td></tr>
              ) : (
                rows.map((row) => {
                  const isActive = Number(row.activated ?? 1) === 1;
                  return (
                    <tr key={row.id}>
                      <td>{row.leave_type_name || row.leave_type_code}</td>
                      <td>{row.rule_label}</td>
                      <td>{serviceYearLabel(row.service_year_offset)}</td>
                      <td>{joinMonthsLabel(row.join_month_from, row.join_month_to)}</td>
                      <td>{accrualLabel(row.accrual_mode)}</td>
                      <td>{daysLabel(row)}</td>
                      <td>{row.sort_order ?? 0}</td>
                      <td className="leave-admin-actions-leavemgt">
                        <button type="button" className="leave-btn-leavemgt leave-btn-secondary-leavemgt" onClick={() => openEdit(row)}>Edit</button>
                        <button
                          type="button"
                          className={`leave-btn-leavemgt leave-status-toggle-leavemgt ${isActive ? 'active-leavemgt' : 'inactive-leavemgt'}`}
                          disabled={saving || deleting}
                          onClick={() => onToggleStatus(row)}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {draft ? (
        <div className="leave-holiday-modal-overlay-leavemgt" role="presentation" onClick={closeModal}>
          <div
            className="leave-holiday-modal-leavemgt leave-admin-modal-leavemgt leave-admin-modal-wide-leavemgt"
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>{editRow ? 'Edit entitlement rule' : 'Add entitlement rule'}</h4>
            <p className="leave-muted-leavemgt leave-policy-modal-hint-leavemgt">
              Define how many leave days an employee gets for a leave type, based on their years of service and join date.
            </p>

            <div className="leave-admin-form-grid-leavemgt leave-admin-form-grid-2-leavemgt">
              <div className="leave-admin-form-span-2-leavemgt">
                <label className="leave-holiday-modal-label-leavemgt">Leave type</label>
                <select
                  className="leave-holiday-modal-select-leavemgt"
                  value={draft.leave_type_code}
                  onChange={(e) => setDraft((p) => ({ ...p, leave_type_code: e.target.value }))}
                >
                  {typeOptions.map((type) => (
                    <option key={type.code} value={type.code}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="leave-admin-form-span-2-leavemgt">
                <label className="leave-holiday-modal-label-leavemgt">Rule name</label>
                <input
                  className="leave-holiday-modal-input-leavemgt"
                  value={draft.rule_label}
                  onChange={(e) => setDraft((p) => ({ ...p, rule_label: e.target.value }))}
                  placeholder="e.g. Second year — joined January to March"
                />
              </div>
              <div>
                <label className="leave-holiday-modal-label-leavemgt">When this rule applies</label>
                <select
                  className="leave-holiday-modal-select-leavemgt"
                  value={draft.service_year_offset}
                  onChange={(e) => setDraft((p) => ({
                    ...p,
                    service_year_offset: e.target.value,
                    join_month_from: e.target.value === '1' ? p.join_month_from : '',
                    join_month_to: e.target.value === '1' ? p.join_month_to : '',
                  }))}
                >
                  <option value="">From 3rd year onwards</option>
                  <option value="0">First year after joining</option>
                  <option value="1">Second calendar year</option>
                </select>
              </div>
              <div>
                <label className="leave-holiday-modal-label-leavemgt">How leave days are calculated</label>
                <select
                  className="leave-holiday-modal-select-leavemgt"
                  value={draft.accrual_mode}
                  onChange={(e) => setDraft((p) => ({ ...p, accrual_mode: e.target.value }))}
                >
                  <option value="fixed_days">Fixed number of days per year</option>
                  <option value="bi_monthly_floor">Gradual — 1 day for every 2 months worked</option>
                </select>
              </div>
              {showJoinMonths ? (
                <>
                  <div>
                    <label className="leave-holiday-modal-label-leavemgt">Join month — from</label>
                    <select
                      className="leave-holiday-modal-select-leavemgt"
                      value={draft.join_month_from}
                      onChange={(e) => setDraft((p) => ({ ...p, join_month_from: e.target.value }))}
                    >
                      <option value="">Any month</option>
                      {MONTHS.map((month) => (
                        <option key={month.value} value={String(month.value)}>{month.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="leave-holiday-modal-label-leavemgt">Join month — to</label>
                    <select
                      className="leave-holiday-modal-select-leavemgt"
                      value={draft.join_month_to}
                      onChange={(e) => setDraft((p) => ({ ...p, join_month_to: e.target.value }))}
                    >
                      <option value="">Any month</option>
                      {MONTHS.map((month) => (
                        <option key={month.value} value={String(month.value)}>{month.label}</option>
                      ))}
                    </select>
                    <p className="leave-muted-leavemgt leave-policy-field-help-leavemgt">
                      Used for second-year rules that depend on which quarter the employee joined (e.g. Jan–Mar = 14 days).
                    </p>
                  </div>
                </>
              ) : null}
              {draft.accrual_mode === 'fixed_days' ? (
                <div>
                  <label className="leave-holiday-modal-label-leavemgt">Number of leave days</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="leave-holiday-modal-input-leavemgt"
                    value={draft.entitlement_days}
                    onChange={(e) => setDraft((p) => ({ ...p, entitlement_days: e.target.value }))}
                    placeholder="e.g. 14"
                  />
                </div>
              ) : (
                <div>
                  <label className="leave-holiday-modal-label-leavemgt">Number of leave days</label>
                  <input
                    className="leave-holiday-modal-input-leavemgt"
                    value="1 day per 2 months worked"
                    disabled
                  />
                  <p className="leave-muted-leavemgt leave-policy-field-help-leavemgt">
                    Days build up automatically based on months employed in the join year.
                  </p>
                </div>
              )}
              <div>
                <label className="leave-holiday-modal-label-leavemgt">Display order</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="leave-holiday-modal-input-leavemgt"
                  value={draft.sort_order}
                  onChange={(e) => setDraft((p) => ({ ...p, sort_order: e.target.value }))}
                  placeholder="Lower numbers appear first"
                />
              </div>
            </div>

            <div className="leave-holiday-modal-actions-leavemgt">
              <button type="button" className="leave-btn-leavemgt leave-btn-approve-leavemgt" disabled={saving} onClick={onSave}>
                {saving ? 'Saving…' : 'Save rule'}
              </button>
              <button type="button" className="leave-btn-leavemgt leave-btn-secondary-leavemgt" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
