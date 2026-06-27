import React from 'react';
import {
  AL_RESULT_GRADES,
  AL_THIRD_SUBJECT_OPTIONS,
  AL_THIRD_SUBJECT_OTHER,
} from './alSubjectResults';

function GradeSelect({ id, value, onChange, disabled }) {
  return (
    <select
      id={id}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="ep-al-grade-select"
    >
      <option value="">— Result —</option>
      {AL_RESULT_GRADES.map((g) => (
        <option key={g} value={g}>{g}</option>
      ))}
    </select>
  );
}

export default function AlSubjectResultsEditor({ value, onChange, readOnly = false }) {
  const data = value || {};
  const set = (key, val) => onChange({ ...data, [key]: val });

  const thirdIsOther = data.thirdSubjectKey === AL_THIRD_SUBJECT_OTHER;

  if (readOnly) {
    return (
      <div className="ep-al-subjects ep-al-subjects--readonly">
        <div className="ep-al-subject-row">
          <span className="ep-al-subject-label">English</span>
          <span className="ep-al-subject-value">{data.english || '—'}</span>
        </div>
        <div className="ep-al-subject-row">
          <span className="ep-al-subject-label">General Test</span>
          <span className="ep-al-subject-value">{data.generalTest || '—'}</span>
        </div>
        <div className="ep-al-subject-row">
          <span className="ep-al-subject-label">Third subject</span>
          <span className="ep-al-subject-value">
            {thirdIsOther ? (data.thirdSubjectOther || '—') : (data.thirdSubjectKey || '—')}
            {data.thirdGrade ? ` (${data.thirdGrade})` : ''}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-al-subjects">
      <p className="ep-al-subjects-intro">
        Enter each result separately — English and General Test are fixed; pick or type the third main subject.
      </p>

      <div className="ep-al-subject-row">
        <label className="ep-al-subject-label" htmlFor="al-english">English</label>
        <GradeSelect
          id="al-english"
          value={data.english}
          onChange={(v) => set('english', v)}
        />
      </div>

      <div className="ep-al-subject-row">
        <label className="ep-al-subject-label" htmlFor="al-gt">General Test</label>
        <GradeSelect
          id="al-gt"
          value={data.generalTest}
          onChange={(v) => set('generalTest', v)}
        />
      </div>

      <div className="ep-al-subject-row ep-al-subject-row--third">
        <label className="ep-al-subject-label" htmlFor="al-third">Third subject</label>
        <div className="ep-al-third-fields">
          <select
            id="al-third"
            value={data.thirdSubjectKey || ''}
            onChange={(e) => {
              const key = e.target.value;
              onChange({
                ...data,
                thirdSubjectKey: key,
                thirdSubjectOther: key === AL_THIRD_SUBJECT_OTHER ? data.thirdSubjectOther : '',
              });
            }}
            className="ep-al-third-select"
          >
            <option value="">— Select subject —</option>
            {AL_THIRD_SUBJECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {thirdIsOther && (
            <input
              type="text"
              placeholder="Type subject name (e.g. Combined Maths)"
              value={data.thirdSubjectOther || ''}
              onChange={(e) => set('thirdSubjectOther', e.target.value)}
              className="ep-al-third-other"
            />
          )}
          <GradeSelect
            id="al-third-grade"
            value={data.thirdGrade}
            onChange={(v) => set('thirdGrade', v)}
            disabled={!data.thirdSubjectKey}
          />
        </div>
      </div>
    </div>
  );
}
