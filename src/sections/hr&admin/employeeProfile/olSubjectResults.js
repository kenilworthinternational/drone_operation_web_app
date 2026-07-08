export const OL_QUALIFICATION_TYPE = 'Ordinary Level (O/L)';

export const OL_GRADE_OPTIONS = ['A', 'B', 'C', 'S', 'W', 'F'];

export const OL_CORE_SUBJECT_DEFAULTS = [
  'First Language',
  'English',
  'Mathematics',
  'Science',
  'History',
  'Religion',
];

export const OL_CATEGORY_1_DEFAULTS = [
  'Business & Accounting Studies',
  'Geography',
  'Civic Education',
  'Entrepreneurship Studies',
  'Second Language (Sinhala)',
  'Second Language (Tamil)',
  'Pali',
  'Sanskrit',
  'French',
  'German',
  'Hindi',
  'Japanese',
  'Arabic',
  'Korean',
  'Chinese',
  'Russian',
];

export const OL_CATEGORY_2_DEFAULTS = [
  'Music (Oriental)',
  'Music (Western)',
  'Music (Carnatic)',
  'Art',
  'Dancing (Oriental)',
  'Dancing (Bharata)',
  'Appreciation of English Literary Texts',
  'Appreciation of Sinhala Literary Texts',
  'Appreciation of Tamil Literary Texts',
  'Appreciation of Arabic Literary Texts',
  'Drama and Theatre (Sinhala)',
  'Drama and Theatre (Tamil)',
  'Drama and Theatre (English)',
];

export const OL_CATEGORY_3_DEFAULTS = [
  'Information & Communication Technology',
  'Agriculture & Food Technology',
  'Aquatic Bioresources Technology',
  'Art & Crafts',
  'Home Economics',
  'Health & Physical Education',
  'Communication & Media Studies',
  'Design & Construction Technology',
  'Design & Mechanical Technology',
  'Design & Electronic Technology',
  'Electronic Writing & Shorthand (Sinhala)',
  'Electronic Writing & Shorthand (Tamil)',
  'Electronic Writing & Shorthand (English)',
];

export const OL_CATEGORY_KEYS = ['category1', 'category2', 'category3'];

export function emptyOlSubjectResults() {
  return {
    core: OL_CORE_SUBJECT_DEFAULTS.map((subject) => ({ subject, grade: '' })),
    category1: { subject: '', grade: '' },
    category2: { subject: '', grade: '' },
    category3: { subject: '', grade: '' },
  };
}

export function isOlQualificationType(type) {
  return String(type || '').trim() === OL_QUALIFICATION_TYPE;
}

function normalizeCore(rawCore) {
  const base = emptyOlSubjectResults().core;
  if (!Array.isArray(rawCore)) return base;
  return base.map((item, index) => {
    const row = rawCore[index] || {};
    return {
      subject: item.subject,
      grade: String(row.grade || '').trim(),
    };
  });
}

function normalizeCategoryEntry(entry) {
  const item = entry || {};
  return {
    subject: String(item.subject || '').trim(),
    grade: String(item.grade || '').trim(),
  };
}

export function parseOlSubjectResults(row) {
  const empty = emptyOlSubjectResults();
  if (!row) return empty;

  const raw = row.field_of_study;
  if (raw && String(raw).trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      return {
        core: normalizeCore(parsed.core),
        category1: normalizeCategoryEntry(parsed.category1),
        category2: normalizeCategoryEntry(parsed.category2),
        category3: normalizeCategoryEntry(parsed.category3),
      };
    } catch {
      return empty;
    }
  }

  return empty;
}

function formatLine(subject, grade) {
  const s = String(subject || '').trim();
  const g = String(grade || '').trim();
  if (!s && !g) return '';
  if (!g) return s;
  if (!s) return g;
  return `${s} ${g}`;
}

export function formatOlSubjectResultsSummary(data) {
  if (!data) return '';
  const parts = [];
  (data.core || []).forEach((item) => {
    const line = formatLine(item.subject, item.grade);
    if (line) parts.push(line);
  });
  OL_CATEGORY_KEYS.forEach((key) => {
    const item = data[key];
    const line = formatLine(item?.subject, item?.grade);
    if (line) parts.push(line);
  });
  return parts.join(' · ');
}

export function serializeOlSubjectResults(data) {
  const payload = {
    core: normalizeCore(data?.core),
    category1: normalizeCategoryEntry(data?.category1),
    category2: normalizeCategoryEntry(data?.category2),
    category3: normalizeCategoryEntry(data?.category3),
  };
  return {
    field_of_study: JSON.stringify(payload),
    grade: formatOlSubjectResultsSummary(payload) || null,
  };
}

export function validateOlSubjectResults(data) {
  const normalized = {
    core: normalizeCore(data?.core),
    category1: normalizeCategoryEntry(data?.category1),
    category2: normalizeCategoryEntry(data?.category2),
    category3: normalizeCategoryEntry(data?.category3),
  };

  const hasAnyCore = normalized.core.some((item) => item.grade);
  const hasAnyCategory = OL_CATEGORY_KEYS.some((key) => normalized[key].subject || normalized[key].grade);
  if (!hasAnyCore && !hasAnyCategory) {
    return 'Enter at least one O/L subject result.';
  }

  for (const key of OL_CATEGORY_KEYS) {
    const entry = normalized[key];
    if (entry.subject && !entry.grade) return `Select a grade for ${key.replace('category', 'Category ')}.`;
    if (entry.grade && !entry.subject) return `Select a subject for ${key.replace('category', 'Category ')}.`;
  }
  return null;
}
