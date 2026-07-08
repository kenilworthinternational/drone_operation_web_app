export const AL_QUALIFICATION_TYPE = 'Advanced Level (A/L)';

export const AL_RESULT_GRADES = ['A', 'B', 'C', 'S', 'F'];

export const AL_MAJOR_SUBJECT_COUNT = 3;

export const AL_MAJOR_SUBJECT_OTHER = '__other__';

/** @deprecated use AL_MAJOR_SUBJECT_OTHER */
export const AL_THIRD_SUBJECT_OTHER = AL_MAJOR_SUBJECT_OTHER;

/** Common A/L main subjects — user can pick Other and type freely. */
export const AL_MAJOR_SUBJECT_OPTIONS = [
  { value: 'Combined Mathematics', label: 'Combined Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'Agricultural Science', label: 'Agricultural Science' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Business Studies', label: 'Business Studies' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'ICT', label: 'ICT' },
  { value: 'Engineering Technology', label: 'Engineering Technology' },
  { value: 'Bio Systems Technology', label: 'Bio Systems Technology' },
  { value: 'Science for Technology', label: 'Science for Technology' },
  { value: 'Geography', label: 'Geography' },
  { value: 'History', label: 'History' },
  { value: 'Logic & Scientific Method', label: 'Logic & Scientific Method' },
  { value: AL_MAJOR_SUBJECT_OTHER, label: 'Other (type subject name)' },
];

export const AL_MAJOR_SUBJECT_FALLBACK_OPTIONS = AL_MAJOR_SUBJECT_OPTIONS.filter(
  (item) => item.value !== AL_MAJOR_SUBJECT_OTHER,
);

/** @deprecated use AL_MAJOR_SUBJECT_OPTIONS */
export const AL_THIRD_SUBJECT_OPTIONS = AL_MAJOR_SUBJECT_OPTIONS;

export function emptyMajorSubject() {
  return { subjectKey: '', subjectOther: '', grade: '' };
}

export function emptyAlSubjectResults() {
  return {
    english: '',
    generalTest: '',
    majorSubjects: Array.from({ length: AL_MAJOR_SUBJECT_COUNT }, () => emptyMajorSubject()),
  };
}

export function isAlQualificationType(type) {
  return String(type || '').trim() === AL_QUALIFICATION_TYPE;
}

function majorSubjectLabel(entry) {
  if (!entry) return '';
  if (entry.subjectKey === AL_MAJOR_SUBJECT_OTHER) {
    return String(entry.subjectOther || '').trim();
  }
  return String(entry.subjectKey || '').trim();
}

function normalizeMajorSubjects(raw) {
  const base = emptyAlSubjectResults().majorSubjects;
  if (!Array.isArray(raw)) return base;

  return base.map((empty, index) => {
    const item = raw[index] || {};
    return {
      subjectKey: String(item.subjectKey || '').trim(),
      subjectOther: String(item.subjectOther || '').trim(),
      grade: String(item.grade || '').trim(),
    };
  });
}

/** Parse stored row → editor state (JSON in field_of_study, or legacy plain text / single third subject). */
export function parseAlSubjectResults(row) {
  const empty = emptyAlSubjectResults();
  if (!row) return empty;

  const raw = row.field_of_study;
  if (raw && String(raw).trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.majorSubjects)) {
        return {
          english: parsed.english || '',
          generalTest: parsed.generalTest || '',
          majorSubjects: normalizeMajorSubjects(parsed.majorSubjects),
        };
      }

      // Legacy single third-subject JSON
      if (parsed.thirdSubjectKey || parsed.thirdGrade || parsed.thirdSubjectOther) {
        const legacy = emptyMajorSubject();
        legacy.subjectKey = parsed.thirdSubjectKey || '';
        legacy.subjectOther = parsed.thirdSubjectOther || '';
        legacy.grade = parsed.thirdGrade || '';
        empty.majorSubjects[0] = legacy;
        empty.english = parsed.english || '';
        empty.generalTest = parsed.generalTest || '';
        return empty;
      }
    } catch {
      /* fall through */
    }
  }

  if (raw && String(raw).trim()) {
    empty.majorSubjects[0] = {
      subjectKey: AL_MAJOR_SUBJECT_OTHER,
      subjectOther: String(raw).trim(),
      grade: '',
    };
  }

  return empty;
}

export function formatAlResultLine(subject, grade) {
  const name = String(subject || '').trim();
  const g = String(grade || '').trim();
  if (!name && !g) return '';
  if (!g) return name;
  if (!name) return g;
  return `${name} ${g}`;
}

/** Human-readable summary for table / grade column. */
export function formatAlSubjectResultsSummary(data) {
  if (!data) return '';
  const parts = [];
  const eng = formatAlResultLine('English', data.english);
  const gt = formatAlResultLine('General Test', data.generalTest);
  if (eng) parts.push(eng);
  if (gt) parts.push(gt);

  (data.majorSubjects || []).forEach((entry) => {
    const line = formatAlResultLine(majorSubjectLabel(entry), entry?.grade);
    if (line) parts.push(line);
  });

  return parts.join(' · ');
}

/** Persist editor state into employee_education columns. */
export function serializeAlSubjectResults(alData) {
  const payload = {
    english: String(alData.english || '').trim(),
    generalTest: String(alData.generalTest || '').trim(),
    majorSubjects: normalizeMajorSubjects(alData.majorSubjects).map((entry) => ({
      subjectKey: String(entry.subjectKey || '').trim(),
      subjectOther: String(entry.subjectOther || '').trim(),
      grade: String(entry.grade || '').trim(),
    })),
  };

  return {
    field_of_study: JSON.stringify(payload),
    grade: formatAlSubjectResultsSummary(payload) || null,
  };
}

export function validateAlSubjectResults(alData) {
  const majors = normalizeMajorSubjects(alData?.majorSubjects);
  const hasMajor = majors.some((entry) => majorSubjectLabel(entry) || entry.grade);
  const hasAny = alData?.english || alData?.generalTest || hasMajor;

  if (!hasAny) {
    return 'Enter at least one A/L result (English, General Test, or a major subject).';
  }

  for (let i = 0; i < majors.length; i += 1) {
    const entry = majors[i];
    const name = majorSubjectLabel(entry);
    const slot = i + 1;

    if (entry.subjectKey === AL_MAJOR_SUBJECT_OTHER && entry.grade && !name) {
      return `Type the major subject ${slot} name when using Other.`;
    }
    if (name && !entry.grade) {
      return `Select a result grade for major subject ${slot}.`;
    }
    if (entry.grade && !name) {
      return `Select or type the major subject ${slot} name.`;
    }
  }

  return null;
}
