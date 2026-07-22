import React from 'react';

import {

  createGoalField,

  emptyTemplateDraft,

  normalizeFieldSchema,

  normalizeTemplateSchemas,

  stripFieldSchemaIds,

  collectTemplateSchemaErrors,

  sanitizeResultFieldsForSave,

} from './smartKpiSchemaHelpers';

import {

  FALLBACK_SMART_KPI_FIELD_TYPES,

  fieldTypeValueKind,

  resolveFieldTypeMeta,

  toInputTypeOptions,

} from './smartKpiFieldTypeUtils';



export {

  createGoalField,

  createPairedResultField,

  emptyTemplateDraft,

  normalizeFieldSchema,

  normalizeTemplateSchemas,

  stripFieldSchemaIds,

  collectTemplateSchemaErrors,

  sanitizeResultFieldsForSave,

} from './smartKpiSchemaHelpers';



export {

  FALLBACK_SMART_KPI_FIELD_TYPES,

  toInputTypeOptions,

  resolveFieldTypeMeta,

  fieldTypeValueKind,

} from './smartKpiFieldTypeUtils';



/** @deprecated Use toInputTypeOptions(fieldTypes) from API-backed master data */

export const INPUT_TYPES = toInputTypeOptions(FALLBACK_SMART_KPI_FIELD_TYPES);



export function emptyFieldDef() {

  return createGoalField('', []);

}



function MultiMetricField({ field, values, onChange, readOnly }) {

  const rows = Array.isArray(values) ? values : (field.metrics || []).map((m) => ({ key: m.key, label: m.label, value: '' }));



  const updateRow = (index, value) => {

    if (readOnly) return;

    const next = rows.map((row, i) => (i === index ? { ...row, value } : row));

    onChange(next);

  };



  return (

    <div className="smart-kpi-multi-metric">

      {rows.map((row, index) => (

        <label key={row.key || index} className="smart-kpi-field-inline">

          <span>{row.label || row.key}</span>

          <input

            type="number"

            value={row.value ?? ''}

            onChange={(e) => updateRow(index, e.target.value)}

            disabled={readOnly}

          />

        </label>

      ))}

    </div>

  );

}



export default function SmartKpiFieldRenderer({

  schema = [],

  values = {},

  onChange,

  readOnly = false,

  mode = 'goal',

  fieldTypes,

}) {

  if (!schema.length) {

    return <span className="employee-kpi-muted">No fields configured</span>;

  }



  const handleChange = (key, value) => {

    if (readOnly || !onChange) return;

    onChange({ ...values, [key]: value });

  };



  return (

    <div className="smart-kpi-field-stack">

      {schema.map((field) => {

        const val = values?.[field.key];

        const typeMeta = resolveFieldTypeMeta(field.inputType, fieldTypes);

        const valueKind = typeMeta.value_kind || fieldTypeValueKind(field.inputType, fieldTypes);



        if (valueKind === 'multi_metric') {

          return (

            <div key={field.key} className="smart-kpi-field-block">

              {field.label ? <div className="smart-kpi-field-label">{field.label}</div> : null}

              <MultiMetricField

                field={field}

                values={val}

                onChange={(next) => handleChange(field.key, next)}

                readOnly={readOnly}

              />

            </div>

          );

        }

        if (valueKind === 'textarea') {

          return (

            <label key={field.key} className="smart-kpi-field-block">

              <span className="smart-kpi-field-label">{field.label}</span>

              <textarea

                rows={3}

                value={val ?? ''}

                onChange={(e) => handleChange(field.key, e.target.value)}

                disabled={readOnly}

                placeholder={field.placeholder || ''}

              />

            </label>

          );

        }

        const inputType = valueKind === 'number' ? 'number' : 'text';

        const suffix = typeMeta.unit_suffix || field.unit || '';

        return (

          <label key={field.key} className="smart-kpi-field-block">

            <span className="smart-kpi-field-label">

              {field.label}

              {suffix ? ` (${suffix})` : ''}

            </span>

            <input

              type={inputType}

              value={val ?? ''}

              onChange={(e) => handleChange(field.key, e.target.value)}

              disabled={readOnly}

              placeholder={field.placeholder || ''}

            />

          </label>

        );

      })}

      {mode === 'result' && readOnly && !Object.keys(values || {}).length ? (

        <span className="employee-kpi-muted">Pending</span>

      ) : null}

    </div>

  );

}


