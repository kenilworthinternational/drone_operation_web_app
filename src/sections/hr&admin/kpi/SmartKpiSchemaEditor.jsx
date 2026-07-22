import React from 'react';
import { toInputTypeOptions } from './smartKpiFieldTypeUtils';
import {
  createGoalField,
  createPairedResultField,
  removeResultsForGoalKey,
  syncGoalFieldPatch,
  syncResultFieldLink,
} from './smartKpiSchemaHelpers';

const GOAL_COLUMNS = ['Key', 'Label', 'Type', 'Req.', ''];
const RESULT_COLUMNS = ['Linked goal', 'Key', 'Label', 'Type', 'Req.', ''];

function SchemaSectionHead({ title, hint, actions }) {
  return (
    <div className="smart-kpi-schema-head">
      <div className="smart-kpi-schema-head-main">
        <strong>{title}</strong>
        {hint ? <span className="smart-kpi-schema-hint">{hint}</span> : null}
      </div>
      {actions ? <div className="smart-kpi-schema-head-actions">{actions}</div> : null}
    </div>
  );
}

function SchemaColumnHead({ columns, variant }) {
  return (
    <div className={`smart-kpi-schema-columns smart-kpi-schema-columns--${variant}`} aria-hidden="true">
      {columns.map((label) => (
        <span key={label || 'actions'} className="smart-kpi-schema-col-label">{label}</span>
      ))}
    </div>
  );
}

function GoalFieldsEditor({ fields, resultFields, onChangeGoals, onChangeResults, ui, inputTypes }) {
  const list = Array.isArray(fields) ? fields : [];

  const updateGoal = (index, patch) => {
    const prev = list[index];
    const siblingKeys = list.filter((_, i) => i !== index).map((f) => f.key);
    const nextGoal = syncGoalFieldPatch(prev, patch, siblingKeys);
    const nextGoals = list.map((f, i) => (i === index ? nextGoal : f));

    let nextResults = resultFields;
    if (patch.label != null && prev.key !== nextGoal.key) {
      nextResults = resultFields.map((r) => {
        if (r.linkedGoalKey === prev.key || (r.linkedGoalKey == null && r.key === prev.key)) {
          return syncResultFieldLink(
            { ...r, label: r.label === `${prev.label} (result)` ? `${nextGoal.label} (result)` : r.label },
            nextGoal.key,
            nextGoals,
            resultFields,
            resultFields.indexOf(r),
          );
        }
        return r;
      });
    }

    onChangeGoals(nextGoals);
    if (nextResults !== resultFields) onChangeResults(nextResults);
  };

  const addGoal = () => {
    const nextGoal = createGoalField('', list.map((f) => f.key));
    const nextResult = createPairedResultField(nextGoal, resultFields);
    onChangeGoals([...list, nextGoal]);
    onChangeResults([...resultFields, nextResult]);
  };

  const removeGoal = (index) => {
    const removed = list[index];
    onChangeGoals(list.filter((_, i) => i !== index));
    onChangeResults(removeResultsForGoalKey(resultFields, removed.key));
  };

  return (
    <div className="smart-kpi-schema-editor">
      <SchemaSectionHead
        title="Goal fields"
        hint="Each goal field automatically creates a linked result field"
        actions={(
          <button type="button" className={ui.schemaBtn} onClick={addGoal}>+ Goal field</button>
        )}
      />
      {list.length === 0 ? (
        <p className="smart-kpi-schema-empty">No goal fields yet. Add one to define targets and its linked result field.</p>
      ) : (
        <div className="smart-kpi-schema-table">
          <SchemaColumnHead columns={GOAL_COLUMNS} variant="goal" />
          {list.map((field, index) => (
            <div key={field._id || index} className="smart-kpi-schema-row smart-kpi-schema-row--goal">
              <span className="smart-kpi-key-badge" title={`Storage key: ${field.key}`}>{field.key}</span>
              <input
                className={ui.input}
                placeholder="e.g. Target units"
                value={field.label || ''}
                onChange={(e) => updateGoal(index, { label: e.target.value })}
              />
              <select
                className={ui.input}
                value={field.inputType || 'text'}
                onChange={(e) => updateGoal(index, { inputType: e.target.value })}
              >
                {inputTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <label className="smart-kpi-check smart-kpi-check--center">
                <input
                  type="checkbox"
                  checked={field.required !== false}
                  onChange={(e) => updateGoal(index, { required: e.target.checked })}
                />
                <span className="smart-kpi-check-text">Yes</span>
              </label>
              <button
                type="button"
                className={`${ui.schemaBtn} smart-kpi-schema-remove`}
                onClick={() => removeGoal(index)}
                title="Remove goal field and its linked results"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultFieldsEditor({ fields, goalFields, onChange, ui, inputTypes }) {
  const list = Array.isArray(fields) ? fields : [];
  const goalOptions = (goalFields || []).map((g) => ({ value: g.key, label: g.label || g.key }));

  const updateResult = (index, patch) => {
    onChange(list.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const updateLink = (index, linkedGoalKey) => {
    if (!linkedGoalKey) return;
    const nextField = syncResultFieldLink(list[index], linkedGoalKey, goalFields, list, index);
    onChange(list.map((f, i) => (i === index ? nextField : f)));
  };

  const addLinkedResult = () => {
    const goal = goalFields[goalFields.length - 1];
    if (!goal) return;
    onChange([...list, createPairedResultField(goal, list)]);
  };

  const canRemoveResult = (field) => {
    if (!field.linkedGoalKey) return true;
    const linkedCount = list.filter((r) => r.linkedGoalKey === field.linkedGoalKey).length;
    return linkedCount > 1;
  };

  const removeResult = (index) => {
    const field = list[index];
    if (!canRemoveResult(field)) return;
    onChange(list.filter((_, i) => i !== index));
  };

  return (
    <div className="smart-kpi-schema-editor">
      <SchemaSectionHead
        title="Result fields"
        hint="Linked to goal fields only — add a goal first, then add extra linked results if needed"
        actions={(
          <button
            type="button"
            className={ui.schemaBtn}
            onClick={addLinkedResult}
            disabled={!goalFields.length}
            title={goalFields.length ? 'Add another result linked to a goal' : 'Add a goal field first'}
          >
            + Linked result
          </button>
        )}
      />
      {!goalFields.length ? (
        <p className="smart-kpi-schema-empty">Add a goal field first. Result fields are created automatically and must stay linked to goals.</p>
      ) : list.length === 0 ? (
        <p className="smart-kpi-schema-empty">No result fields yet. They are created when you add a goal field.</p>
      ) : (
        <div className="smart-kpi-schema-table">
          <SchemaColumnHead columns={RESULT_COLUMNS} variant="result" />
          {list.map((field, index) => (
            <div key={field._id || index} className="smart-kpi-schema-row smart-kpi-schema-row--result">
              <select
                className={`${ui.input} smart-kpi-schema-link-select`}
                value={field.linkedGoalKey || goalOptions[0]?.value || ''}
                onChange={(e) => updateLink(index, e.target.value)}
                title={field.linkedGoalKey ? `Linked to ${field.linkedGoalKey}` : 'Linked goal'}
              >
                {goalOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="smart-kpi-key-badge" title={`Storage key: ${field.key}`}>{field.key}</span>
              <input
                className={ui.input}
                placeholder="e.g. Actual units"
                value={field.label || ''}
                onChange={(e) => updateResult(index, { label: e.target.value })}
              />
              <select
                className={ui.input}
                value={field.inputType || 'number'}
                onChange={(e) => updateResult(index, { inputType: e.target.value })}
              >
                {inputTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <label className="smart-kpi-check smart-kpi-check--center">
                <input
                  type="checkbox"
                  checked={field.required !== false}
                  onChange={(e) => updateResult(index, { required: e.target.checked })}
                />
                <span className="smart-kpi-check-text">Yes</span>
              </label>
              <button
                type="button"
                className={`${ui.schemaBtn} smart-kpi-schema-remove`}
                onClick={() => removeResult(index)}
                disabled={!canRemoveResult(field)}
                title={canRemoveResult(field) ? 'Remove result field' : 'Each goal must keep at least one linked result field'}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SmartKpiSchemaEditor({
  goalFields,
  resultFields,
  onChangeGoals,
  onChangeResults,
  ui,
  fieldTypes,
}) {
  const inputTypes = toInputTypeOptions(fieldTypes);

  return (
    <div className="smart-kpi-schema-editor-wrap">
      <GoalFieldsEditor
        fields={goalFields}
        resultFields={resultFields}
        onChangeGoals={onChangeGoals}
        onChangeResults={onChangeResults}
        ui={ui}
        inputTypes={inputTypes}
      />
      <ResultFieldsEditor
        fields={resultFields}
        goalFields={goalFields}
        onChange={onChangeResults}
        ui={ui}
        inputTypes={inputTypes}
      />
    </div>
  );
}
