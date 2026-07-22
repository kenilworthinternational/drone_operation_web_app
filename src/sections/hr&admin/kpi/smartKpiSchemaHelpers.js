let nextSmartKpiFieldId = 1;

export function newFieldId() {
  nextSmartKpiFieldId += 1;
  return `skf-${nextSmartKpiFieldId}`;
}

export function slugifyFieldKey(label, fallback = 'field') {
  const base = String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  return base || fallback;
}

export function uniqueKey(base, usedKeys) {
  const used = usedKeys instanceof Set ? usedKeys : new Set(usedKeys);
  let key = base;
  let n = 2;
  while (used.has(key)) {
    key = `${base}_${n}`;
    n += 1;
  }
  return key;
}

export function buildGoalFieldKey(label, existingKeys = []) {
  const slug = slugifyFieldKey(label, 'goal_field');
  return uniqueKey(slug, existingKeys);
}

export function buildResultFieldKey({ label, linkedGoalKey, existingKeys = [], preferSameAsGoal = false }) {
  const used = new Set(existingKeys);
  if (linkedGoalKey) {
    if (preferSameAsGoal && !used.has(linkedGoalKey)) {
      return linkedGoalKey;
    }
    const base = `${linkedGoalKey}_result`;
    return uniqueKey(base, used);
  }
  return uniqueKey(slugifyFieldKey(label, 'result_field'), used);
}

export function createGoalField(label = '', existingKeys = []) {
  const key = buildGoalFieldKey(label, existingKeys);
  return {
    _id: newFieldId(),
    key,
    label,
    inputType: 'text',
    required: false,
    keyAuto: true,
  };
}

export function createPairedResultField(goalField, existingResultFields = []) {
  const existingKeys = existingResultFields.map((f) => f.key);
  const linkedGoalKey = goalField.key;
  const sameKeyTaken = existingKeys.includes(linkedGoalKey);
  const key = buildResultFieldKey({
    label: goalField.label,
    linkedGoalKey,
    existingKeys,
    preferSameAsGoal: !sameKeyTaken,
  });
  const numericTypes = new Set(['number', 'percentage', 'duration_minutes']);
  let inputType = 'number';
  if (goalField.inputType === 'textarea') inputType = 'textarea';
  else if (goalField.inputType === 'text') inputType = 'text';
  else if (!numericTypes.has(goalField.inputType)) inputType = 'number';

  return {
    _id: newFieldId(),
    key,
    linkedGoalKey,
    label: goalField.label ? `${goalField.label} (result)` : '',
    inputType,
    required: false,
    keyAuto: true,
  };
}

export function createStandaloneResultField(label = '', existingKeys = []) {
  const key = buildResultFieldKey({ label, linkedGoalKey: null, existingKeys });
  return {
    _id: newFieldId(),
    key,
    linkedGoalKey: null,
    label,
    inputType: 'number',
    required: false,
    keyAuto: true,
  };
}

export function normalizeFieldSchema(fields, { inferLinkedGoalKey = false, goalKeys = [] } = {}) {
  return (Array.isArray(fields) ? fields : []).map((field, index) => {
    const normalized = {
      ...field,
      _id: field._id || `skf-loaded-${index}-${field.key || 'field'}`,
      keyAuto: field.keyAuto === true,
    };
    if (inferLinkedGoalKey && normalized.linkedGoalKey == null && goalKeys.includes(normalized.key)) {
      normalized.linkedGoalKey = normalized.key;
    }
    return normalized;
  });
}

export function normalizeTemplateSchemas(goalFields, resultFields) {
  const goals = normalizeFieldSchema(goalFields).map((f) => ({ ...f, keyAuto: false }));
  const goalKeys = goals.map((g) => g.key);
  const goalKeySet = new Set(goalKeys);
  let results = normalizeFieldSchema(resultFields, { inferLinkedGoalKey: true, goalKeys })
    .filter((f) => f.linkedGoalKey && goalKeySet.has(f.linkedGoalKey))
    .map((f) => ({
      ...f,
      keyAuto: f.keyAuto === true,
    }));

  for (const goal of goals) {
    const hasLinked = results.some((r) => r.linkedGoalKey === goal.key);
    if (!hasLinked) {
      results = [...results, createPairedResultField(goal, results)];
    }
  }

  return { goalFields: goals, resultFields: results };
}

export function collectTemplateSchemaErrors(goalFields, resultFields) {
  const goals = Array.isArray(goalFields) ? goalFields : [];
  const results = Array.isArray(resultFields) ? resultFields : [];
  const errors = [];

  if (!goals.length) {
    errors.push('Add at least one goal field.');
    return errors;
  }

  for (const result of results) {
    if (!result.linkedGoalKey) {
      errors.push('All result fields must be linked to a goal field.');
      break;
    }
  }

  for (const goal of goals) {
    const linkedCount = results.filter((r) => r.linkedGoalKey === goal.key).length;
    if (linkedCount === 0) {
      errors.push(`Goal "${goal.label || goal.key}" must have at least one linked result field.`);
    }
  }

  return errors;
}

export function sanitizeResultFieldsForSave(resultFields, goalFields) {
  const goalKeys = new Set((goalFields || []).map((g) => g.key));
  return (resultFields || []).filter((r) => r.linkedGoalKey && goalKeys.has(r.linkedGoalKey));
}

export function stripFieldSchemaIds(fields) {
  return (Array.isArray(fields) ? fields : []).map(({ _id, keyAuto, ...field }) => field);
}

export function syncGoalFieldPatch(field, patch, siblingKeys) {
  const next = { ...field, ...patch };
  if (patch.label != null) {
    next.key = buildGoalFieldKey(patch.label, siblingKeys);
    next.keyAuto = true;
  }
  return next;
}

export function syncResultFieldLink(field, linkedGoalKey, goalFields, siblingResultFields, index) {
  const otherKeys = siblingResultFields.filter((_, i) => i !== index).map((f) => f.key);
  const goal = goalFields.find((g) => g.key === linkedGoalKey);
  const preferSame = linkedGoalKey && !otherKeys.includes(linkedGoalKey);
  const key = linkedGoalKey
    ? buildResultFieldKey({
      label: field.label || goal?.label,
      linkedGoalKey,
      existingKeys: otherKeys,
      preferSameAsGoal: preferSame,
    })
    : buildResultFieldKey({ label: field.label, linkedGoalKey: null, existingKeys: otherKeys });

  return {
    ...field,
    linkedGoalKey: linkedGoalKey || null,
    key,
    keyAuto: true,
  };
}

export function removeResultsForGoalKey(resultFields, goalKey) {
  return resultFields.filter((f) => f.linkedGoalKey !== goalKey && f.key !== goalKey);
}

export function emptyTemplateDraft(dimensionCode = 'specific') {
  const goal = createGoalField('', []);
  const result = createPairedResultField(goal, []);
  return {
    dimension_code: dimensionCode,
    title: '',
    guidance_text: '',
    goal_field_schema: [goal],
    result_field_schema: [result],
    scoring_mode: 'auto_percent',
    higher_is_better: '1',
    weight: '1',
    sort_order: '0',
    activated: '1',
  };
}
