import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../../styles/employeeKpi.css';
import '../../../styles/smartKpiMasterData.css';
import {
  useGetSmartKpiDimensionsQuery,
  useGetSmartKpiFieldTypesQuery,
  useGetSmartKpiTemplatesQuery,
  useSaveSmartKpiTemplateMutation,
} from '../../../api/services NodeJs/employeeKpiApi';
import {
  useGetEmpDepartmentsQuery,
  useGetEmpSubDivisionsQuery,
  useGetEmpJobRolesQuery,
  useGetEmpChiefJobRolesQuery,
} from '../../../api/services NodeJs/empOrgStructureApi';
import SmartKpiFieldRenderer, { emptyTemplateDraft, normalizeTemplateSchemas, stripFieldSchemaIds, collectTemplateSchemaErrors, sanitizeResultFieldsForSave } from '../../hr&admin/kpi/SmartKpiFieldRenderer';
import SmartKpiSchemaEditor from '../../hr&admin/kpi/SmartKpiSchemaEditor';
import {
  filterActiveEmpDepartments,
  filterEmpJobRolesForDepartment,
  formatEmpDepartmentOption,
  formatEmpJobRoleOption,
} from '../../hr&admin/kpi/smartKpiOrgHelpers';

const SCORING_MODES = [
  { value: 'auto_percent', label: 'Auto % of target' },
  { value: 'auto_threshold', label: 'Auto threshold' },
  { value: 'manual_rating', label: 'Manual rating (1-5)' },
  { value: 'pass_fail', label: 'Pass / Fail' },
];

const SCORING_MODE_LABELS = SCORING_MODES.reduce((acc, mode) => {
  acc[mode.value] = mode.label;
  return acc;
}, {});

const FALLBACK_DIMENSIONS = [
  { code: 'specific', name: 'Specific', letter: 'S' },
  { code: 'measurable', name: 'Measurable', letter: 'M' },
  { code: 'achievable', name: 'Achievable', letter: 'A' },
  { code: 'relevant', name: 'Relevant', letter: 'R' },
  { code: 'time_bound', name: 'Time-bound', letter: 'T' },
];

const DIMENSION_ORDER = ['specific', 'measurable', 'achievable', 'relevant', 'time_bound'];

function getTemplateUi(variant = 'ict') {
  if (variant === 'hrm') {
    return {
      panel: 'smart-kpi-hrm-panel',
      head: 'smart-kpi-hrm-head',
      headText: 'smart-kpi-hrm-head-text',
      headNote: 'smart-kpi-hrm-head-note',
      addBtn: 'employee-kpi-btn employee-kpi-btn-primary',
      filters: 'employee-kpi-toolbar smart-kpi-hrm-filters',
      input: 'smart-kpi-hrm-input',
      tabsBar: 'smart-kpi-hrm-tabs-bar',
      tabsLabel: 'smart-kpi-hrm-tabs-label',
      tabs: 'smart-kpi-hrm-tabs',
      tab: 'smart-kpi-hrm-tab',
      tabAll: 'smart-kpi-hrm-tab-all',
      tableWrap: 'employee-kpi-table-wrap smart-kpi-hrm-table-wrap',
      table: 'employee-kpi-table',
      typeChip: 'smart-kpi-hrm-type-chip',
      editBtn: 'employee-kpi-btn employee-kpi-btn-secondary',
      schemaBtn: 'employee-kpi-btn employee-kpi-btn-secondary',
      popupOverlay: 'smart-kpi-hrm-popup-overlay',
      popupCard: 'smart-kpi-hrm-popup-card',
      popupHead: 'smart-kpi-hrm-popup-head',
      popupClose: 'smart-kpi-hrm-popup-close',
      popupSub: 'smart-kpi-hrm-popup-sub',
      formGrid: 'smart-kpi-hrm-form-grid',
      formField: 'smart-kpi-hrm-field',
      formFieldSpan2: 'smart-kpi-hrm-field-span2',
      previewCard: 'smart-kpi-preview-card',
      popupActions: 'smart-kpi-hrm-popup-actions',
      popupCancel: 'employee-kpi-btn employee-kpi-btn-secondary',
      popupSave: 'employee-kpi-btn employee-kpi-btn-primary',
    };
  }
  return {
    panel: 'vehicle-admin-card-master-data smart-kpi-md-panel',
    head: 'master-data-chemicals-head-master-data',
    headText: 'master-data-chemicals-head-text-master-data',
    headNote: 'vehicle-master-note-master-data',
    addBtn: 'btn-submit-master-data master-data-chemicals-add-btn-master-data',
    filters: 'smart-kpi-md-filters',
    input: 'master-edit-input-master-data',
    tabsBar: 'smart-kpi-md-tabs-bar',
    tabsLabel: 'smart-kpi-md-tabs-label',
    tabs: 'smart-kpi-md-tabs',
    tab: 'smart-kpi-md-tab',
    tabAll: 'smart-kpi-md-tab-all',
    tableWrap: 'vehicle-table-wrap-master-data smart-kpi-md-table-wrap',
    table: 'vehicle-table-master-data',
    typeChip: 'smart-kpi-md-type-chip',
    editBtn: 'action-btn-master-data neutral-master-data',
    schemaBtn: 'smart-kpi-md-btn-secondary',
    popupOverlay: 'smart-kpi-md-popup-overlay',
    popupCard: 'smart-kpi-md-popup-card',
    popupHead: 'smart-kpi-md-popup-head',
    popupClose: 'smart-kpi-md-popup-close',
    popupSub: 'smart-kpi-md-popup-sub',
    formGrid: 'master-edit-grid-2col-master-data smart-kpi-md-popup-form',
    formField: 'master-edit-field-master-data',
    formFieldSpan2: 'master-edit-field-span2-master-data',
    previewCard: 'smart-kpi-md-preview-card',
    popupActions: 'smart-kpi-md-popup-actions',
    popupCancel: 'btn-cancel-master-data',
    popupSave: 'btn-submit-master-data',
  };
}

export default function SmartKpiTemplatesPanel({ onMessage, variant = 'ict', showHeader = true }) {
  const ui = useMemo(() => getTemplateUi(variant), [variant]);
  const [deptId, setDeptId] = useState('');
  const [subDivId, setSubDivId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [draft, setDraft] = useState(null);
  const [activeDimension, setActiveDimension] = useState('all');

  const { data: dimensions = [] } = useGetSmartKpiDimensionsQuery();
  const { data: fieldTypes = [] } = useGetSmartKpiFieldTypesQuery();
  const { data: departmentsRaw = [] } = useGetEmpDepartmentsQuery();
  const { data: subDivisionsRaw = [] } = useGetEmpSubDivisionsQuery(deptId ? { dept_id: Number(deptId) } : undefined, { skip: !deptId });
  const { data: jobRolesRaw = [] } = useGetEmpJobRolesQuery();
  const { data: chiefRolesRaw = [] } = useGetEmpChiefJobRolesQuery();
  const { data: templates = [], refetch, isLoading } = useGetSmartKpiTemplatesQuery({
    emp_department_id: deptId || undefined,
    emp_sub_division_id: subDivId || undefined,
    emp_job_role_id: roleId || undefined,
    include_inactive: true,
  }, { skip: !deptId });
  const [saveTemplate, { isLoading: saving }] = useSaveSmartKpiTemplateMutation();

  const departments = useMemo(() => filterActiveEmpDepartments(departmentsRaw), [departmentsRaw]);
  const subDivisions = useMemo(() => [...(subDivisionsRaw || [])], [subDivisionsRaw]);
  const jobRoles = useMemo(
    () => filterEmpJobRolesForDepartment(jobRolesRaw, chiefRolesRaw, deptId),
    [jobRolesRaw, chiefRolesRaw, deptId],
  );

  const dimensionOptions = useMemo(
    () => (dimensions.length ? dimensions : FALLBACK_DIMENSIONS),
    [dimensions],
  );

  const dimensionTabs = useMemo(
    () => [{ code: 'all', name: 'All types', letter: 'All' }, ...dimensionOptions],
    [dimensionOptions],
  );

  const formatDimensionLabel = (code) => {
    const dim = dimensionOptions.find((d) => d.code === code);
    if (!dim) return code;
    return `${dim.letter || code[0]?.toUpperCase()} · ${dim.name}`;
  };

  const filteredTemplates = useMemo(() => {
    const list = activeDimension === 'all'
      ? [...templates]
      : templates.filter((t) => t.dimension_code === activeDimension);
    return list.sort((a, b) => {
      const dimA = DIMENSION_ORDER.indexOf(a.dimension_code);
      const dimB = DIMENSION_ORDER.indexOf(b.dimension_code);
      if (dimA !== dimB) return dimA - dimB;
      return (Number(a.sort_order) - Number(b.sort_order)) || (Number(a.id) - Number(b.id));
    });
  }, [templates, activeDimension]);

  const showAllTypes = activeDimension === 'all';

  const notify = (type, text) => onMessage?.({ type, text });

  const openAdd = () => {
    setEditRow(null);
    const defaultDimension = activeDimension === 'all'
      ? (dimensionOptions[0]?.code || 'specific')
      : activeDimension;
    setDraft(emptyTemplateDraft(defaultDimension));
  };

  const openEdit = (row) => {
    setEditRow(row);
    const normalized = normalizeTemplateSchemas(row.goal_field_schema, row.result_field_schema);
    setDraft({
      dimension_code: row.dimension_code,
      title: row.title || '',
      guidance_text: row.guidance_text || '',
      goal_field_schema: normalized.goalFields,
      result_field_schema: normalized.resultFields,
      scoring_mode: row.scoring_mode || 'auto_percent',
      higher_is_better: String(Number(row.higher_is_better) === 0 ? 0 : 1),
      weight: String(row.weight ?? 1),
      sort_order: String(row.sort_order ?? 0),
      activated: String(Number(row.activated) === 0 ? 0 : 1),
    });
  };

  const closeModal = () => {
    setEditRow(null);
    setDraft(null);
  };

  useEffect(() => {
    if (!draft) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [draft]);

  const save = async () => {
    if (!draft || !deptId) {
      notify('error', 'Select a department first.');
      return;
    }
    const title = String(draft.title || '').trim();
    if (!title) {
      notify('error', 'Title is required.');
      return;
    }
    const schemaErrors = collectTemplateSchemaErrors(draft.goal_field_schema, draft.result_field_schema);
    if (schemaErrors.length) {
      notify('error', schemaErrors[0]);
      return;
    }
    try {
      await saveTemplate({
        id: editRow?.id,
        emp_department_id: Number(deptId),
        emp_sub_division_id: subDivId ? Number(subDivId) : null,
        emp_job_role_id: roleId ? Number(roleId) : null,
        dimension_code: draft.dimension_code,
        title,
        guidance_text: draft.guidance_text || null,
        goal_field_schema: stripFieldSchemaIds(draft.goal_field_schema),
        result_field_schema: stripFieldSchemaIds(
          sanitizeResultFieldsForSave(draft.result_field_schema, draft.goal_field_schema),
        ),
        scoring_mode: draft.scoring_mode,
        higher_is_better: Number(draft.higher_is_better) === 0 ? 0 : 1,
        weight: Number(draft.weight) || 1,
        sort_order: Number(draft.sort_order) || 0,
        activated: Number(draft.activated) === 0 ? 0 : 1,
      }).unwrap();
      notify('success', editRow?.id ? 'Template updated.' : 'Template saved.');
      closeModal();
      refetch();
    } catch (err) {
      notify('error', err?.data?.message || 'Save failed.');
    }
  };

  const popup = draft ? createPortal(
    <div
      className={ui.popupOverlay}
      role="presentation"
      onClick={closeModal}
    >
      <div
        className={ui.popupCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby="smart-kpi-md-popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={ui.popupHead}>
          <div>
            <h3 id="smart-kpi-md-popup-title">{editRow?.id ? 'Edit SMART KPI' : 'Add SMART KPI'}</h3>
            <p className={ui.popupSub}>
              {formatDimensionLabel(draft.dimension_code)}
              {' · '}
              {departments.find((d) => String(d.id) === String(deptId))?.department_name || 'Department'}
            </p>
          </div>
          <button type="button" className={ui.popupClose} onClick={closeModal} aria-label="Close">×</button>
        </div>

        <div className={ui.formGrid}>
          <div className={ui.formField}>
            <label htmlFor="smart-kpi-dimension">Dimension</label>
            <select
              id="smart-kpi-dimension"
              className={ui.input}
              value={draft.dimension_code}
              onChange={(e) => setDraft({ ...draft, dimension_code: e.target.value })}
              disabled={!!editRow?.id}
            >
              {dimensionOptions.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className={ui.formField}>
            <label htmlFor="smart-kpi-title">Title</label>
            <input
              id="smart-kpi-title"
              className={ui.input}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div className={`${ui.formField} ${ui.formFieldSpan2}`}>
            <label htmlFor="smart-kpi-guidance">Guidance (description hint)</label>
            <textarea
              id="smart-kpi-guidance"
              className={ui.input}
              rows={2}
              value={draft.guidance_text}
              onChange={(e) => setDraft({ ...draft, guidance_text: e.target.value })}
            />
          </div>
          <div className={ui.formField}>
            <label htmlFor="smart-kpi-scoring">Scoring mode</label>
            <select
              id="smart-kpi-scoring"
              className={ui.input}
              value={draft.scoring_mode}
              onChange={(e) => setDraft({ ...draft, scoring_mode: e.target.value })}
            >
              {SCORING_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className={ui.formField}>
            <label htmlFor="smart-kpi-weight">Weight</label>
            <input
              id="smart-kpi-weight"
              className={ui.input}
              type="number"
              step="0.01"
              value={draft.weight}
              onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
            />
          </div>
          <div className={ui.formField}>
            <label htmlFor="smart-kpi-higher">Higher is better</label>
            <select
              id="smart-kpi-higher"
              className={ui.input}
              value={draft.higher_is_better}
              onChange={(e) => setDraft({ ...draft, higher_is_better: e.target.value })}
            >
              <option value="1">Yes</option>
              <option value="0">No (lower is better)</option>
            </select>
          </div>
          <div className={ui.formField}>
            <label htmlFor="smart-kpi-active">Active</label>
            <select
              id="smart-kpi-active"
              className={ui.input}
              value={draft.activated}
              onChange={(e) => setDraft({ ...draft, activated: e.target.value })}
            >
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
        </div>

        <SmartKpiSchemaEditor
          goalFields={draft.goal_field_schema}
          resultFields={draft.result_field_schema}
          onChangeGoals={(next) => setDraft({ ...draft, goal_field_schema: next })}
          onChangeResults={(next) => setDraft({ ...draft, result_field_schema: next })}
          ui={ui}
          fieldTypes={fieldTypes}
        />

        <div className={ui.previewCard}>
          <h4>Preview layout</h4>
          <table className="smart-kpi-sheet-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Goal</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{draft.dimension_code}</td>
                <td>{draft.guidance_text || '—'}</td>
                <td><SmartKpiFieldRenderer schema={draft.goal_field_schema} values={{}} readOnly fieldTypes={fieldTypes} /></td>
                <td><SmartKpiFieldRenderer schema={draft.result_field_schema} values={{}} readOnly mode="result" fieldTypes={fieldTypes} /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={ui.popupActions}>
          <button type="button" className={ui.popupCancel} onClick={closeModal}>Cancel</button>
          <button type="button" className={ui.popupSave} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save SMART KPI'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className={ui.panel}>
      {showHeader ? (
        <div className={ui.head}>
          <div className={ui.headText}>
            <h3>SMART KPI Templates</h3>
            <p className={ui.headNote}>
              Configure department and role-specific SMART KPI templates (Specific, Measurable, Achievable, Relevant, Time-bound).
            </p>
          </div>
          <button type="button" className={ui.addBtn} onClick={openAdd} disabled={!deptId}>
            Add SMART KPI
          </button>
        </div>
      ) : (
        <div className={ui.head}>
          <button type="button" className={ui.addBtn} onClick={openAdd} disabled={!deptId}>
            Add SMART KPI
          </button>
        </div>
      )}

      <div className={ui.filters}>
        <label>
          Department
          <select className={ui.input} value={deptId} onChange={(e) => { setDeptId(e.target.value); setSubDivId(''); setRoleId(''); }}>
            <option value="">-- Select --</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{formatEmpDepartmentOption(d)}</option>
            ))}
          </select>
        </label>
        <label>
          Sub-division
          <select className={ui.input} value={subDivId} onChange={(e) => setSubDivId(e.target.value)} disabled={!deptId}>
            <option value="">All / department default</option>
            {subDivisions.map((s) => (
              <option key={s.id} value={s.id}>{s.sub_division_name}</option>
            ))}
          </select>
        </label>
        <label>
          Job role
          <select className={ui.input} value={roleId} onChange={(e) => setRoleId(e.target.value)} disabled={!deptId}>
            <option value="">{deptId ? 'All roles in department' : 'Select department first'}</option>
            {jobRoles.map((r) => (
              <option key={r.id} value={r.id}>{formatEmpJobRoleOption(r)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className={ui.tabsBar}>
        <span className={ui.tabsLabel}>SMART dimension</span>
        <div className={ui.tabs} role="tablist" aria-label="SMART dimensions">
          {dimensionTabs.map((dim) => {
            const isActive = activeDimension === dim.code;
            return (
              <button
                key={dim.code}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${ui.tab}${dim.code === 'all' ? ` ${ui.tabAll}` : ''}${isActive ? ' active' : ''}`}
                onClick={() => setActiveDimension(dim.code)}
              >
                {dim.code === 'all' ? 'All types' : `${dim.letter} · ${dim.name}`}
              </button>
            );
          })}
        </div>
      </div>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              {showAllTypes && <th>Type</th>}
              <th>Title</th>
              <th>Scope</th>
              <th>Scoring</th>
              <th>Weight</th>
              <th>Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!deptId ? (
              <tr><td colSpan={showAllTypes ? 7 : 6}>Select a department to view templates.</td></tr>
            ) : isLoading ? (
              <tr><td colSpan={showAllTypes ? 7 : 6}>Loading…</td></tr>
            ) : filteredTemplates.length === 0 ? (
              <tr><td colSpan={showAllTypes ? 7 : 6}>
                {showAllTypes
                  ? 'No SMART KPI templates yet. Click Add SMART KPI.'
                  : 'No templates for this dimension. Click Add SMART KPI or switch to All types.'}
              </td></tr>
            ) : (
              filteredTemplates.map((row) => (
                <tr key={row.id}>
                  {showAllTypes && (
                    <td>
                      <span className={ui.typeChip}>{formatDimensionLabel(row.dimension_code)}</span>
                    </td>
                  )}
                  <td>{row.title}</td>
                  <td>
                    {row.department_name || '—'}
                    {' · '}
                    {row.sub_division_name || 'All sub-divisions'}
                    {' · '}
                    {row.job_role || 'All roles'}
                  </td>
                  <td>{SCORING_MODE_LABELS[row.scoring_mode] || row.scoring_mode || '—'}</td>
                  <td>{row.weight}</td>
                  <td>{Number(row.activated) === 1 ? 'Yes' : 'No'}</td>
                  <td>
                    <button type="button" className={ui.editBtn} onClick={() => openEdit(row)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {popup}
    </div>
  );
}
