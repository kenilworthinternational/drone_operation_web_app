const SELECT = 'select';
const DATE = 'date';

/** Shared DB columns — labels/visibility vary by qualification type. */
export const EDUCATION_FIELD_DEFS = {
  qualification_type: {
    name: 'qualification_type',
    label: 'Qualification Type',
    type: SELECT,
    masterCategory: 'qualification_type',
  },
  course_name: { name: 'course_name', label: 'Degree / Course Name' },
  institution: { name: 'institution', label: 'Institution' },
  field_of_study: { name: 'field_of_study', label: 'Field of Study' },
  start_date: { name: 'start_date', label: 'Start Date', type: DATE },
  completion_date: { name: 'completion_date', label: 'Completion Date', type: DATE },
  grade: { name: 'grade', label: 'Grade / Class / GPA' },
  al_subject_results: { name: 'al_subject_results', label: 'A/L subject results', type: 'al_subjects' },
  ol_subject_results: { name: 'ol_subject_results', label: 'O/L subject results', type: 'ol_subjects' },
};

const DEGREE_MASTERS = {
  course_name: 'education_course',
  institution: 'education_institution',
  field_of_study: 'education_field_of_study',
};

/** Stream dropdown only — subject results use AlSubjectResultsEditor. */
const AL_STREAM_ONLY = {
  course_name: 'education_stream',
};

/**
 * Per qualification type: which fields to show, labels, and hr_master_options categories.
 * Values are stored in employee_education; dropdowns come from hr_master_options.
 */
export const EDUCATION_QUALIFICATION_CONFIG = {
  'Primary Education': {
    fields: ['qualification_type', 'institution', 'start_date', 'completion_date', 'grade'],
    labels: {
      institution: 'School',
      start_date: 'Year started',
      completion_date: 'Year completed',
      grade: 'Final grade / class',
    },
  },
  'Ordinary Level (O/L)': {
    fields: ['qualification_type', 'institution', 'ol_subject_results', 'completion_date'],
    labels: {
      institution: 'School',
      ol_subject_results: 'Subject results',
      completion_date: 'Exam year',
    },
  },
  'Advanced Level (A/L)': {
    fields: ['qualification_type', 'institution', 'course_name', 'al_subject_results', 'completion_date'],
    labels: {
      institution: 'School',
      course_name: 'Stream',
      al_subject_results: 'Subject results',
      completion_date: 'Exam year',
    },
    masterCategories: AL_STREAM_ONLY,
  },
  Certificate: {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'Certificate programme',
      institution: 'Training provider / Institute',
      field_of_study: 'Specialization',
      grade: 'Grade / Class',
    },
    masterCategories: DEGREE_MASTERS,
  },
  Diploma: {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'Diploma programme',
      institution: 'Institution',
      field_of_study: 'Field of study',
      grade: 'Grade / Class',
    },
    masterCategories: DEGREE_MASTERS,
  },
  'Higher Diploma': {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'Higher diploma programme',
      institution: 'Institution',
      field_of_study: 'Field of study',
      grade: 'Grade / Class',
    },
    masterCategories: DEGREE_MASTERS,
  },
  "Bachelor's Degree": {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'Degree programme',
      institution: 'University / Institution',
      field_of_study: 'Major / Field of study',
      grade: 'GPA / Class',
    },
    masterCategories: DEGREE_MASTERS,
  },
  'Postgraduate Diploma': {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'Postgraduate programme',
      institution: 'University / Institution',
      field_of_study: 'Specialization',
      grade: 'GPA / Class',
    },
    masterCategories: DEGREE_MASTERS,
  },
  "Master's Degree": {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'Master\'s programme',
      institution: 'University / Institution',
      field_of_study: 'Specialization',
      grade: 'GPA / Class',
    },
    masterCategories: DEGREE_MASTERS,
  },
  'Doctorate (PhD)': {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'Doctorate programme',
      institution: 'University / Institution',
      field_of_study: 'Research area',
      grade: 'Outcome / Grade',
    },
    masterCategories: DEGREE_MASTERS,
  },
  'NVQ Qualification': {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'NVQ level / trade',
      institution: 'Training centre',
      field_of_study: 'Competency area',
      grade: 'NVQ level achieved',
    },
    masterCategories: DEGREE_MASTERS,
  },
  'Professional Certificate': {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'completion_date', 'grade'],
    labels: {
      course_name: 'Certificate name',
      institution: 'Issuing body',
      field_of_study: 'Specialization',
      completion_date: 'Date awarded',
      grade: 'Grade / Level',
    },
    masterCategories: DEGREE_MASTERS,
  },
  'Professional Membership': {
    fields: ['qualification_type', 'course_name', 'institution', 'completion_date', 'grade'],
    labels: {
      course_name: 'Membership designation',
      institution: 'Professional body',
      completion_date: 'Date awarded',
      grade: 'Membership grade / level',
    },
    masterCategories: {
      course_name: 'education_course',
      institution: 'education_institution',
    },
  },
  'Chartered Qualification': {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'completion_date', 'grade'],
    labels: {
      course_name: 'Chartered title',
      institution: 'Chartering body',
      field_of_study: 'Specialization',
      completion_date: 'Date awarded',
      grade: 'Grade / Level',
    },
    masterCategories: DEGREE_MASTERS,
  },
  Apprenticeship: {
    fields: ['qualification_type', 'course_name', 'institution', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'Trade / apprenticeship',
      institution: 'Employer / Training provider',
      grade: 'Outcome / Certification',
    },
    masterCategories: {
      course_name: 'education_course',
      institution: 'education_institution',
    },
  },
  'Military Qualification': {
    fields: ['qualification_type', 'course_name', 'institution', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'Qualification / course',
      institution: 'Establishment / Unit',
      grade: 'Rank / Outcome',
    },
    masterCategories: {
      course_name: 'education_course',
      institution: 'education_institution',
    },
  },
  Other: {
    fields: ['qualification_type', 'course_name', 'institution', 'field_of_study', 'start_date', 'completion_date', 'grade'],
    labels: {
      course_name: 'Qualification name',
      institution: 'Institution / Provider',
      field_of_study: 'Field of study',
      grade: 'Grade / Result',
    },
    masterCategories: DEGREE_MASTERS,
  },
};

const DEFAULT_CONFIG = EDUCATION_QUALIFICATION_CONFIG.Other;

export function getEducationFieldsForType(qualificationType) {
  const key = String(qualificationType || '').trim();
  const config = EDUCATION_QUALIFICATION_CONFIG[key] || DEFAULT_CONFIG;
  return config.fields.map((name) => {
    const base = EDUCATION_FIELD_DEFS[name];
    if (!base) return null;
    const masterCategory = config.masterCategories?.[name] || base.masterCategory;
    const isSpecialSubjects = base.type === 'al_subjects' || base.type === 'ol_subjects';
    return {
      ...base,
      label: config.labels?.[name] || base.label,
      hint: config.hints?.[name] || base.hint,
      masterCategory: isSpecialSubjects ? undefined : masterCategory,
      type: isSpecialSubjects ? base.type : (masterCategory ? SELECT : base.type),
    };
  }).filter(Boolean);
}

/** Table columns — one consistent set for mixed qualification types. */
export const EDUCATION_TABLE_COLUMNS = [
  { name: 'qualification_type', label: 'Qualification Type' },
  { name: 'institution', label: 'School / Institution' },
  { name: 'course_name', label: 'Programme / Stream' },
  { name: 'field_of_study', label: 'Subject / Field' },
  { name: 'completion_date', label: 'Completed / Exam year', type: DATE },
  { name: 'grade', label: 'Grade / Results' },
];

export function isEducationFieldVisible(qualificationType, fieldName) {
  if (fieldName === 'qualification_type') return true;
  if (fieldName === 'al_subject_results' || fieldName === 'ol_subject_results') return false;
  const type = String(qualificationType || '').trim();
  if (type === 'Advanced Level (A/L)' && (fieldName === 'field_of_study' || fieldName === 'grade')) {
    return true;
  }
  if (type === 'Ordinary Level (O/L)' && (fieldName === 'field_of_study' || fieldName === 'grade')) {
    return true;
  }
  const fields = getEducationFieldsForType(qualificationType);
  return fields.some((f) => f.name === fieldName);
}
