export const FALLBACK_SMART_KPI_FIELD_TYPES = [
  { code: 'text', label: 'Text', value_kind: 'text', unit_suffix: null, sort_order: 10, is_system: 1, activated: 1 },
  { code: 'textarea', label: 'Text area', value_kind: 'textarea', unit_suffix: null, sort_order: 20, is_system: 1, activated: 1 },
  { code: 'number', label: 'Number', value_kind: 'number', unit_suffix: null, sort_order: 30, is_system: 1, activated: 1 },
  { code: 'percentage', label: 'Percentage', value_kind: 'number', unit_suffix: '%', sort_order: 40, is_system: 1, activated: 1 },
  { code: 'duration_minutes', label: 'Duration (minutes)', value_kind: 'number', unit_suffix: 'min', sort_order: 50, is_system: 1, activated: 1 },
  { code: 'multi_metric', label: 'Multiple metrics', value_kind: 'multi_metric', unit_suffix: null, sort_order: 60, is_system: 1, activated: 1 },
];

export const SMART_KPI_VALUE_KINDS = [
  { value: 'text', label: 'Text (single line)' },
  { value: 'textarea', label: 'Text area' },
  { value: 'number', label: 'Number (used in auto scoring)' },
  { value: 'multi_metric', label: 'Multiple metrics' },
];

export function normalizeSmartKpiFieldTypes(rows) {
  const list = Array.isArray(rows) && rows.length ? rows : FALLBACK_SMART_KPI_FIELD_TYPES;
  return [...list]
    .filter((row) => Number(row.activated) !== 0)
    .sort((a, b) => (Number(a.sort_order) - Number(b.sort_order)) || String(a.code).localeCompare(String(b.code)));
}

export function toInputTypeOptions(fieldTypes) {
  return normalizeSmartKpiFieldTypes(fieldTypes).map((row) => ({
    value: row.code,
    label: row.label || row.code,
  }));
}

export function resolveFieldTypeMeta(code, fieldTypes) {
  const list = Array.isArray(fieldTypes) && fieldTypes.length ? fieldTypes : FALLBACK_SMART_KPI_FIELD_TYPES;
  const row = list.find((item) => item.code === code);
  if (row) return row;
  const fallback = FALLBACK_SMART_KPI_FIELD_TYPES.find((item) => item.code === code);
  if (fallback) return fallback;
  return { code: code || 'text', label: code || 'Text', value_kind: 'text', unit_suffix: null };
}

export function fieldTypeValueKind(code, fieldTypes) {
  return resolveFieldTypeMeta(code, fieldTypes).value_kind || 'text';
}

export function slugifyFieldTypeCode(label) {
  return String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
}
