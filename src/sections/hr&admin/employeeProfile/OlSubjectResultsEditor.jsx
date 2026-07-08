import React from 'react';
import { useHrMasterOptions } from './useHrMasterOptions';
import {
  OL_CATEGORY_1_DEFAULTS,
  OL_CATEGORY_2_DEFAULTS,
  OL_CATEGORY_3_DEFAULTS,
  OL_CATEGORY_KEYS,
  OL_CORE_SUBJECT_DEFAULTS,
  OL_GRADE_OPTIONS,
} from './olSubjectResults';

function GradeSelect({ value, onChange, disabled }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="ep-al-grade-select">
      <option value="">— Result —</option>
      {OL_GRADE_OPTIONS.map((g) => (
        <option key={g} value={g}>{g}</option>
      ))}
    </select>
  );
}

function categoryLabel(key) {
  return key === 'category1' ? 'Category I' : key === 'category2' ? 'Category II' : 'Category III';
}

export default function OlSubjectResultsEditor({ value, onChange, readOnly = false }) {
  const data = value || {};
  const { getOptions } = useHrMasterOptions();

  const coreOptions = getOptions('education_ol_core_subject');
  const category1Options = getOptions('education_ol_category_1');
  const category2Options = getOptions('education_ol_category_2');
  const category3Options = getOptions('education_ol_category_3');

  const fallbackToOptions = (items) => items.map((s) => ({ value: s, label: s }));
  const coreList = coreOptions.length ? coreOptions : fallbackToOptions(OL_CORE_SUBJECT_DEFAULTS);
  const cat1List = category1Options.length ? category1Options : fallbackToOptions(OL_CATEGORY_1_DEFAULTS);
  const cat2List = category2Options.length ? category2Options : fallbackToOptions(OL_CATEGORY_2_DEFAULTS);
  const cat3List = category3Options.length ? category3Options : fallbackToOptions(OL_CATEGORY_3_DEFAULTS);

  const core = Array.isArray(data.core)
    ? data.core
    : OL_CORE_SUBJECT_DEFAULTS.map((subject) => ({ subject, grade: '' }));

  const setCoreGrade = (idx, grade) => {
    const next = [...core];
    next[idx] = { ...next[idx], grade };
    onChange({ ...data, core: next });
  };

  const setCategory = (key, patch) => {
    onChange({ ...data, [key]: { ...(data[key] || {}), ...patch } });
  };

  const categoryOptions = {
    category1: cat1List,
    category2: cat2List,
    category3: cat3List,
  };

  if (readOnly) {
    return (
      <div className="ep-al-subjects ep-al-subjects--readonly">
        {core.map((item) => (
          <div key={item.subject} className="ep-al-subject-row">
            <span className="ep-al-subject-label">{item.subject}</span>
            <span className="ep-al-subject-value">{item.grade || '—'}</span>
          </div>
        ))}
        {OL_CATEGORY_KEYS.map((key) => (
          <div key={key} className="ep-al-subject-row">
            <span className="ep-al-subject-label">{categoryLabel(key)}</span>
            <span className="ep-al-subject-value">
              {data[key]?.subject ? `${data[key].subject}${data[key]?.grade ? ` (${data[key].grade})` : ''}` : '—'}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ep-al-subjects">
      <p className="ep-al-subjects-intro">
        Core 6 subjects are fixed. Select one subject each from Category I, II, and III.
      </p>

      {core.map((item, idx) => (
        <div key={item.subject} className="ep-al-subject-row">
          <label className="ep-al-subject-label">{item.subject}</label>
          <GradeSelect value={item.grade} onChange={(v) => setCoreGrade(idx, v)} />
        </div>
      ))}

      {OL_CATEGORY_KEYS.map((key) => (
        <div key={key} className="ep-al-subject-row ep-al-subject-row--major">
          <label className="ep-al-subject-label">{categoryLabel(key)}</label>
          <div className="ep-al-major-fields">
            <select
              className="ep-al-major-select"
              value={data[key]?.subject || ''}
              onChange={(e) => setCategory(key, { subject: e.target.value })}
            >
              <option value="">— Select subject —</option>
              {categoryOptions[key].map((opt) => (
                <option key={`${key}-${opt.value}`} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <GradeSelect
              value={data[key]?.grade || ''}
              onChange={(v) => setCategory(key, { grade: v })}
              disabled={!data[key]?.subject}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
