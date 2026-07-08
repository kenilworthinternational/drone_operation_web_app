import React from 'react';
import {
  AL_MAJOR_SUBJECT_COUNT,
  AL_MAJOR_SUBJECT_FALLBACK_OPTIONS,
  AL_MAJOR_SUBJECT_OTHER,
  AL_RESULT_GRADES,
} from './alSubjectResults';
import { useHrMasterOptions } from './useHrMasterOptions';

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

function majorSubjectDisplay(entry) {
  if (!entry) return '—';
  const isOther = entry.subjectKey === AL_MAJOR_SUBJECT_OTHER;
  const name = isOther ? (entry.subjectOther || '—') : (entry.subjectKey || '—');
  return entry.grade ? `${name} (${entry.grade})` : name;
}

function MajorSubjectRow({ index, entry, onChange, readOnly, options }) {
  const slot = index + 1;
  const isOther = entry?.subjectKey === AL_MAJOR_SUBJECT_OTHER;
  const label = `Major subject ${slot}`;

  if (readOnly) {
    return (
      <div className="ep-al-subject-row">
        <span className="ep-al-subject-label">{label}</span>
        <span className="ep-al-subject-value">{majorSubjectDisplay(entry)}</span>
      </div>
    );
  }

  const setEntry = (patch) => onChange({ ...entry, ...patch });

  return (
    <div className="ep-al-subject-row ep-al-subject-row--major">
      <label className="ep-al-subject-label" htmlFor={`al-major-${slot}`}>{label}</label>
      <div className="ep-al-major-fields">
        <select
          id={`al-major-${slot}`}
          value={entry?.subjectKey || ''}
          onChange={(e) => {
            const key = e.target.value;
            setEntry({
              subjectKey: key,
              subjectOther: key === AL_MAJOR_SUBJECT_OTHER ? (entry?.subjectOther || '') : '',
            });
          }}
          className="ep-al-major-select"
        >
          <option value="">— Select subject —</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
          <option value={AL_MAJOR_SUBJECT_OTHER}>Other (type subject name)</option>
        </select>
        {isOther && (
          <input
            type="text"
            placeholder="Type subject name"
            value={entry?.subjectOther || ''}
            onChange={(e) => setEntry({ subjectOther: e.target.value })}
            className="ep-al-major-other"
          />
        )}
        <GradeSelect
          id={`al-major-grade-${slot}`}
          value={entry?.grade}
          onChange={(v) => setEntry({ grade: v })}
          disabled={!entry?.subjectKey}
        />
      </div>
    </div>
  );
}

export default function AlSubjectResultsEditor({ value, onChange, readOnly = false }) {
  const data = value || {};
  const majorSubjects = Array.isArray(data.majorSubjects) ? data.majorSubjects : [];
  const { getOptions } = useHrMasterOptions();
  const masterOptions = getOptions('education_al_major_subject');
  const subjectOptions = masterOptions.length
    ? masterOptions
    : AL_MAJOR_SUBJECT_FALLBACK_OPTIONS;

  const set = (key, val) => onChange({ ...data, [key]: val });

  const setMajorSubject = (index, entry) => {
    const next = [...majorSubjects];
    while (next.length < AL_MAJOR_SUBJECT_COUNT) {
      next.push({ subjectKey: '', subjectOther: '', grade: '' });
    }
    next[index] = entry;
    onChange({ ...data, majorSubjects: next });
  };

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
        {majorSubjects.map((entry, index) => (
          <MajorSubjectRow
            key={`major-readonly-${index}`}
            index={index}
            entry={entry}
            readOnly
            options={subjectOptions}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="ep-al-subjects">
      <p className="ep-al-subjects-intro">
        Enter each result separately — English and General Test are fixed; add up to three major subjects with individual grades.
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

      {Array.from({ length: AL_MAJOR_SUBJECT_COUNT }, (_, index) => (
        <MajorSubjectRow
          key={`major-${index}`}
          index={index}
          entry={majorSubjects[index]}
          onChange={(entry) => setMajorSubject(index, entry)}
          options={subjectOptions}
        />
      ))}
    </div>
  );
}
