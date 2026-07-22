import { fieldTypeValueKind } from './smartKpiFieldTypeUtils';

function isFilledScalar(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return Number.isFinite(value);
  return String(value).trim() !== '';
}

function isFilledFieldValue(value, valueKind) {
  if (valueKind === 'multi_metric') {
    const rows = Array.isArray(value) ? value : [];
    if (!rows.length) return false;
    return rows.every((row) => isFilledScalar(row?.value));
  }
  return isFilledScalar(value);
}

export function collectGoalValidationErrors(items, fieldTypes = []) {
  const errors = [];
  for (const item of items || []) {
    const itemLabel = item.title || item.dimension_name || 'KPI item';

    if (!String(item.description_text || '').trim()) {
      errors.push(`${itemLabel}: Description is required.`);
    }

    for (const field of item.goal_field_schema || []) {
      if (!field.required) continue;
      const valueKind = fieldTypeValueKind(field.inputType, fieldTypes);
      const value = item.goal_values?.[field.key];
      if (!isFilledFieldValue(value, valueKind)) {
        errors.push(`${itemLabel}: ${field.label || field.key} is required.`);
      }
    }
  }
  return errors;
}

export function collectResultValidationErrors(items, fieldTypes = []) {
  const errors = [];
  for (const item of items || []) {
    const itemLabel = item.title || item.dimension_name || 'KPI item';

    for (const field of item.result_field_schema || []) {
      const valueKind = fieldTypeValueKind(field.inputType, fieldTypes);
      const value = item.result_values?.[field.key];
      if (!isFilledFieldValue(value, valueKind)) {
        errors.push(`${itemLabel}: ${field.label || field.key} (result) is required.`);
      }
    }
  }
  return errors;
}

export function canLockGoals(items, fieldTypes = []) {
  return collectGoalValidationErrors(items, fieldTypes).length === 0;
}

export function canSubmitResults(items, fieldTypes = []) {
  return collectResultValidationErrors(items, fieldTypes).length === 0;
}
