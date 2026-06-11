/** HR dropdown categories managed in Master Data Update → HR Master Options */
export const HR_MASTER_CATEGORIES = [
  { key: 'title', label: 'Title', group: 'Personal' },
  { key: 'blood_group', label: 'Blood Group', group: 'Personal' },
  { key: 'race', label: 'Race', group: 'Personal' },
  { key: 'religion', label: 'Religion', group: 'Personal' },
  { key: 'gender', label: 'Gender', group: 'Personal' },
  { key: 'driving_license', label: 'Driving License', group: 'Personal' },
  { key: 'marital_status', label: 'Marital Status', group: 'Family' },
  { key: 'dependent_relationship', label: 'Dependent Relationship', group: 'Family' },
  { key: 'emergency_relationship', label: 'Emergency Contact Relationship', group: 'Family' },
  { key: 'company_name', label: 'Company', group: 'Employment' },
  { key: 'shift_type', label: 'Shift Type', group: 'Employment' },
  { key: 'member_type', label: 'Member Type', group: 'Employment' },
  { key: 'employment_category', label: 'Employment Category', group: 'Employment' },
  { key: 'job_category', label: 'Job Category', group: 'Employment' },
  { key: 'employment_type', label: 'Employment Type', group: 'Employment' },
  { key: 'contract_type', label: 'Contract Type', group: 'Employment' },
  { key: 'probation_period', label: 'Probation Period', group: 'Employment' },
  { key: 'employee_status', label: 'Employee Status', group: 'Employment' },
  { key: 'work_status', label: 'Work Status', group: 'Employment' },
  { key: 'qualification_type', label: 'Qualification Type', group: 'Qualifications' },
  { key: 'skill_category', label: 'Skill Category', group: 'Qualifications' },
  { key: 'asset_type', label: 'Asset Type', group: 'HR Admin' },
  { key: 'salary_method', label: 'Salary Method', group: 'HR Admin' },
  { key: 'attendance_method', label: 'Attendance Method', group: 'HR Admin' },
  { key: 'review_type', label: 'Performance Review Type', group: 'Lifecycle' },
  { key: 'disciplinary_action_type', label: 'Disciplinary Action Type', group: 'Lifecycle' },
  { key: 'exit_clearance_status', label: 'Exit Clearance Status', group: 'Lifecycle' },
  { key: 'exit_clearance_type', label: 'Exit Clearance Type', group: 'Lifecycle' },
  { key: 'exit_item_status', label: 'Exit Item Status', group: 'Lifecycle' },
];

export function hrMasterCategoryLabel(key) {
  return HR_MASTER_CATEGORIES.find((c) => c.key === key)?.label || key;
}
