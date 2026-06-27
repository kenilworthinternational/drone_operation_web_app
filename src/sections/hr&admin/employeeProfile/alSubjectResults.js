export const AL_QUALIFICATION_TYPE = 'Advanced Level (A/L)';

export const AL_RESULT_GRADES = ['A', 'B', 'C', 'S', 'F'];

export const AL_THIRD_SUBJECT_OTHER = '__other__';

/** Common A/L main subjects (third subject slot — user can pick Other and type freely). */
export const AL_THIRD_SUBJECT_OPTIONS = [
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
  { value: AL_THIRD_SUBJECT_OTHER, label: 'Other (type subject name)' },
];

export function emptyAlSubjectResults() {
  return {
    english: '',
    generalTest: '',
    thirdSubjectKey: '',
    thirdSubjectOther: '',
    thirdGrade: '',
  };
}

export function isAlQualificationType(type) {
  return String(type || '').trim() === AL_QUALIFICATION_TYPE;
}

function thirdSubjectLabel(data) {
  if (!data) return '';
  if (data.thirdSubjectKey === AL_THIRD_SUBJECT_OTHER) {
    return String(data.thirdSubjectOther || '').trim();
  }
  return String(data.thirdSubjectKey || '').trim();
}

/** Parse stored row → editor state (JSON in field_of_study, or legacy plain text). */
export function parseAlSubjectResults(row) {
  const empty = emptyAlSubjectResults();
  if (!row) return empty;

  const raw = row.field_of_study;
  if (raw && String(raw).trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      return {
        english: parsed.english || '',
        generalTest: parsed.generalTest || '',
        thirdSubjectKey: parsed.thirdSubjectKey || '',
        thirdSubjectOther: parsed.thirdSubjectOther || '',
        thirdGrade: parsed.thirdGrade || '',
      };
    } catch {
      /* fall through */
    }
  }

  if (raw && String(raw).trim()) {
    empty.thirdSubjectKey = AL_THIRD_SUBJECT_OTHER;
    empty.thirdSubjectOther = String(raw).trim();
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
  const third = formatAlResultLine(thirdSubjectLabel(data), data.thirdGrade);
  if (eng) parts.push(eng);
  if (gt) parts.push(gt);
  if (third) parts.push(third);
  return parts.join(' · ');
}

/** Persist editor state into employee_education columns. */
export function serializeAlSubjectResults(alData) {
  const payload = {
    english: String(alData.english || '').trim(),
    generalTest: String(alData.generalTest || '').trim(),
    thirdSubjectKey: String(alData.thirdSubjectKey || '').trim(),
    thirdSubjectOther: String(alData.thirdSubjectOther || '').trim(),
    thirdGrade: String(alData.thirdGrade || '').trim(),
  };

  return {
    field_of_study: JSON.stringify(payload),
    grade: formatAlSubjectResultsSummary(payload) || null,
  };
}

export function validateAlSubjectResults(alData) {
  const thirdName = thirdSubjectLabel(alData);
  const hasAny = alData.english || alData.generalTest || thirdName || alData.thirdGrade;
  if (!hasAny) {
    return 'Enter at least one A/L subject result (English, General Test, or third subject).';
  }
  if (alData.thirdSubjectKey === AL_THIRD_SUBJECT_OTHER && alData.thirdGrade && !thirdName) {
    return 'Type the third subject name when using Other.';
  }
  if (thirdName && !alData.thirdGrade) {
    return 'Select a result grade for the third subject.';
  }
  if (alData.thirdGrade && !thirdName) {
    return 'Select or type the third subject name.';
  }
  return null;
}
