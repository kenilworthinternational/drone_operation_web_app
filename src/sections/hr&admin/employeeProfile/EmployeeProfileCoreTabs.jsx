import React, { useEffect, useMemo, useState } from 'react';
import {
  useUpdateEmployeeRegistrationMutation,
  useCreateEmployeeRegistrationMutation,
  useGetUserJobRolesQuery,
  useGetUserLevelsQuery,
  useGetWingsQuery,
  useGetWorkLocationsQuery,
  useGetDrivingLicenseTypesQuery,
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetDSCSQuery,
  useGetASCSQuery,
  useGetAllEmployeeRegistrationsQuery,
} from '../../../api/services NodeJs/jdManagementApi';
import {
  appendFormFields,
  applyNicDerived,
  isValidNic,
  sanitizeNicInput,
  sanitizePhone9,
  splitDate,
} from './employeeProfileUtils';
import { parseNic } from '../../../utils/nic';
import { calculateAge } from '../../../utils/nic';
import { useEmployee } from './useEmployee';
import FamilyDependentsSection from './FamilyDependentsSection';
import DrivingLicenseTypeMultiSelect from './DrivingLicenseTypeMultiSelect';
import MasterSelect from './MasterSelect';

function SaveBanner({ message }) {
  if (!message?.text) return null;
  return (
    <p className={`epd-schedule-message epd-schedule-message--${message.type}`}>{message.text}</p>
  );
}

function FieldGrid({ children }) {
  return <div className="epd-form-grid">{children}</div>;
}

function Field({ label, children, hint }) {
  return (
    <div className="epd-field">
      <label>{label}</label>
      {children}
      {hint ? <span className="epd-field-hint">{hint}</span> : null}
    </div>
  );
}

export function PersonalTab({ employeeId }) {
  const { employee, refetch } = useEmployee(employeeId);
  const [updateEmployee, { isLoading: saving }] = useUpdateEmployeeRegistrationMutation();
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({});

  const { data: licenseTypesData } = useGetDrivingLicenseTypesQuery();
  const licenseTypes = licenseTypesData?.data || [];

  useEffect(() => {
    if (!employee) return;
    let licenseTypeArray = [];
    if (employee.drivingLicenseType) {
      const raw = employee.drivingLicenseType;
      if (Array.isArray(raw)) {
        licenseTypeArray = raw.map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id));
      } else if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            licenseTypeArray = parsed.map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id));
          } else {
            licenseTypeArray = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((id) => !Number.isNaN(id));
          }
        } catch {
          licenseTypeArray = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((id) => !Number.isNaN(id));
        }
      }
    }
    const nic = employee.nic || '';
    let dob = splitDate(employee.dob);
    let gender = employee.gender || '';
    let age = employee.age != null ? String(employee.age) : '';
    if (nic) {
      const derived = applyNicDerived({ dob, gender, age }, nic);
      dob = derived.dob || dob;
      gender = derived.gender || gender;
      age = derived.age || age;
    }
    setForm({
      title: employee.title || '',
      employeeName: employee.employeeName || '',
      nameWithInitials: employee.nameWithInitials || '',
      preferredName: employee.preferredName || '',
      nic,
      taxIdentificationNo: employee.taxIdentificationNo || '',
      nationality: employee.nationality || 'Sri Lankan',
      bloodGroup: employee.bloodGroup || '',
      passportNo: employee.passportNo || '',
      race: employee.race || '',
      religion: employee.religion || '',
      gender,
      dob,
      age,
      permanentAddress: employee.permanentAddress || '',
      temporaryAddress: employee.temporaryAddress || '',
      telephoneHome: employee.telephoneHome || '',
      mobileNumber: employee.mobileNumber || '',
      companyMobileNo: employee.companyMobileNo || '',
      emailAddress: employee.emailAddress || '',
      personalEmail: employee.personalEmail || '',
      companyEmailAddress: employee.companyEmailAddress || '',
      drivingLicense: employee.drivingLicense || '',
      drivingLicenseType: licenseTypeArray,
    });
  }, [employee]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let next = { ...prev, [name]: value };
      if (name === 'nic') {
        next.nic = sanitizeNicInput(value);
        next = applyNicDerived(next, next.nic);
      }
      if (name === 'dob') {
        if (value) {
          const computed = calculateAge(value);
          if (computed != null) next.age = String(computed);
        } else {
          next = applyNicDerived(next, next.nic);
        }
      }
      if (name === 'mobileNumber' || name === 'telephoneHome') {
        next[name] = sanitizePhone9(value);
      }
      if (name === 'drivingLicense' && value === 'No') {
        next.drivingLicenseType = [];
      }
      return next;
    });
  };

  const onSave = async () => {
    setMessage(null);
    if (!isValidNic(form.nic)) {
      setMessage({ type: 'error', text: 'Invalid NIC format.' });
      return;
    }
    const fd = new FormData();
    fd.append('id', String(employeeId));
    appendFormFields(fd, form);
    try {
      await updateEmployee(fd).unwrap();
      setMessage({ type: 'success', text: 'Personal details saved.' });
      refetch();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to save.' });
    }
  };

  if (!employee) return <p className="epd-empty">Loading…</p>;

  return (
    <div className="epd-section">
      <p className="epd-section-intro">Identity, contact, and personal attributes. NIC auto-fills date of birth, gender, and age.</p>
      <FieldGrid>
        <Field label="Title">
          <MasterSelect category="title" name="title" value={form.title} onChange={onChange} />
        </Field>
        <Field label="Employee name (as per NIC)">
          <input name="employeeName" value={form.employeeName} onChange={onChange} />
        </Field>
        <Field label="Name with initials">
          <input name="nameWithInitials" value={form.nameWithInitials} onChange={onChange} />
        </Field>
        <Field label="Preferred name">
          <input name="preferredName" value={form.preferredName} onChange={onChange} />
        </Field>
        <Field label="NIC">
          <input name="nic" value={form.nic} onChange={onChange} maxLength={12} placeholder="12 digits or 9 digits + V/X" />
        </Field>
        <Field label="Tax identification no.">
          <input name="taxIdentificationNo" value={form.taxIdentificationNo} onChange={onChange} />
        </Field>
        <Field label="Nationality">
          <select name="nationality" value={form.nationality} onChange={onChange}>
            <option value="Sri Lankan">Sri Lankan</option>
            <option value="Other">Other</option>
          </select>
        </Field>
        <Field label="Blood group">
          <MasterSelect category="blood_group" name="bloodGroup" value={form.bloodGroup} onChange={onChange} />
        </Field>
        <Field label="Passport no.">
          <input name="passportNo" value={form.passportNo} onChange={onChange} />
        </Field>
        <Field label="Race">
          <MasterSelect category="race" name="race" value={form.race} onChange={onChange} />
        </Field>
        <Field label="Religion">
          <MasterSelect category="religion" name="religion" value={form.religion} onChange={onChange} />
        </Field>
        <Field label="Gender">
          <MasterSelect category="gender" name="gender" value={form.gender} onChange={onChange} />
        </Field>
        <Field label="Date of birth">
          <input type="date" name="dob" value={form.dob} onChange={onChange} />
        </Field>
        <Field label="Age" hint="Auto from NIC or DOB">
          <input value={form.age ? `${form.age} years` : ''} readOnly style={{ background: '#f5f5f5' }} />
        </Field>
        <Field label="Permanent address">
          <textarea name="permanentAddress" rows={2} value={form.permanentAddress} onChange={onChange} />
        </Field>
        <Field label="Current address">
          <textarea name="temporaryAddress" rows={2} value={form.temporaryAddress} onChange={onChange} />
        </Field>
        <Field label="Telephone (home)">
          <input name="telephoneHome" value={form.telephoneHome} onChange={onChange} maxLength={9} />
        </Field>
        <Field label="Mobile number">
          <input name="mobileNumber" value={form.mobileNumber} onChange={onChange} maxLength={9} />
        </Field>
        <Field label="Company mobile">
          <input name="companyMobileNo" value={form.companyMobileNo} onChange={onChange} />
        </Field>
        <Field label="Email">
          <input type="email" name="emailAddress" value={form.emailAddress} onChange={onChange} />
        </Field>
        <Field label="Personal email">
          <input type="email" name="personalEmail" value={form.personalEmail} onChange={onChange} />
        </Field>
        <Field label="Company email">
          <input type="email" name="companyEmailAddress" value={form.companyEmailAddress} onChange={onChange} />
        </Field>
        <Field label="Driving license">
          <MasterSelect category="driving_license" name="drivingLicense" value={form.drivingLicense} onChange={onChange} />
        </Field>
        <Field label="License type(s)">
          <DrivingLicenseTypeMultiSelect
            value={form.drivingLicenseType}
            onChange={(ids) => setForm((p) => ({ ...p, drivingLicenseType: ids }))}
            licenseTypes={licenseTypes}
            disabled={form.drivingLicense === 'No'}
          />
        </Field>
      </FieldGrid>
      <SaveBanner message={message} />
      <div className="epd-actions">
        <button type="button" className="epd-btn epd-btn-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save personal details'}
        </button>
      </div>
    </div>
  );
}

export function EmploymentTab({ employeeId }) {
  const { employee, refetch } = useEmployee(employeeId);
  const [updateEmployee, { isLoading: saving }] = useUpdateEmployeeRegistrationMutation();
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({});

  const { data: jobRolesData } = useGetUserJobRolesQuery();
  const { data: levelsData } = useGetUserLevelsQuery();
  const { data: wingsData } = useGetWingsQuery();
  const { data: locationsData } = useGetWorkLocationsQuery();
  const { data: employeesData } = useGetAllEmployeeRegistrationsQuery();

  const jobRoles = jobRolesData?.data || [];
  const levels = levelsData?.data || [];
  const wings = useMemo(() => {
    const w = wingsData?.data || wingsData?.wings || wingsData;
    return Array.isArray(w) ? w : [];
  }, [wingsData]);
  const workLocations = useMemo(() => {
    const w = locationsData?.data || locationsData;
    return Array.isArray(w) ? w : [];
  }, [locationsData]);
  const employees = useMemo(() => {
    const e = employeesData?.data || employeesData;
    return Array.isArray(e) ? e : [];
  }, [employeesData]);

  useEffect(() => {
    if (!employee) return;
    setForm({
      companyName: employee.companyName || '',
      shiftType: employee.shiftType || '',
      memberTypeFlag: employee.memberTypeFlag || '',
      employmentCategory: employee.employmentCategory || '',
      jobCategory: employee.jobCategory || '',
      designation: employee.designation || '',
      employmentType: employee.employmentType || '',
      contractType: employee.contractType || '',
      contractStartDate: splitDate(employee.contractStartDate),
      contractEndDate: splitDate(employee.contractEndDate),
      probationPeriod: employee.probationPeriod || '',
      probationEndDate: splitDate(employee.probationEndDate),
      retirementDate: splitDate(employee.retirementDate),
      employeeStatus: employee.employeeStatus || '',
      biometricId: employee.biometricId || '',
      employeeType: employee.employeeType || 'i',
      employeeJobRole: jobRoles.find((r) => r.jdCode === employee.employeeJobRole)?.id || '',
      jobRoleLayer: levels.find((l) => l.levelCode === employee.jobRoleLayer)?.id || '',
      department: wings.find((w) => w.wingsCode === employee.department)?.id || '',
      workLocation: workLocations.find((wl) => wl.locationCode === employee.workLocation)?.id || '',
      reportingOfficer: employee.reportofficer ? String(employee.reportofficer) : '',
      joinedDate: splitDate(employee.joinedDate),
      appointmentDate: splitDate(employee.appointmentDate),
      permanentDate: splitDate(employee.permanentDate),
      workStatus: employee.workStatus || '',
      bulkLeaveAvailable: employee.bulkLeaveAvailable != null ? String(employee.bulkLeaveAvailable) : '0',
      flexHoursEnabled: employee.flexHoursEnabled != null ? String(employee.flexHoursEnabled) : '0',
      flexHoursMinutes: employee.flexHoursMinutes != null ? String(employee.flexHoursMinutes) : '0',
    });
  }, [employee, jobRoles, levels, wings, workLocations]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'flexHoursEnabled' && value !== '1') next.flexHoursMinutes = '0';
      return next;
    });
  };

  const onSave = async () => {
    setMessage(null);
    const fd = new FormData();
    fd.append('id', String(employeeId));
    appendFormFields(fd, form);
    try {
      await updateEmployee(fd).unwrap();
      setMessage({ type: 'success', text: 'Employment details saved.' });
      refetch();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to save.' });
    }
  };

  if (!employee) return <p className="epd-empty">Loading…</p>;

  return (
    <div className="epd-section">
      <p className="epd-section-intro">Job role, department, contract, and attendance settings — saved once here only.</p>
      <FieldGrid>
        <Field label="EMP no.">
          <input value={employee.empNo || ''} readOnly style={{ background: '#f5f5f5' }} />
        </Field>
        <Field label="Company">
          <MasterSelect category="company_name" name="companyName" value={form.companyName} onChange={onChange} />
        </Field>
        <Field label="Department">
          <select name="department" value={form.department} onChange={onChange}>
            <option value="">-- Select --</option>
            {wings.map((w) => <option key={w.id} value={w.id}>{w.wing}</option>)}
          </select>
        </Field>
        <Field label="Designation (current role)">
          <input name="designation" value={form.designation} onChange={onChange} />
        </Field>
        <Field label="Job role">
          <select name="employeeJobRole" value={form.employeeJobRole} onChange={onChange}>
            <option value="">-- Select --</option>
            {jobRoles.filter((r) => r.status === 1).map((r) => (
              <option key={r.id} value={r.id}>{r.designation}</option>
            ))}
          </select>
        </Field>
        <Field label="User level">
          <select name="jobRoleLayer" value={form.jobRoleLayer} onChange={onChange}>
            <option value="">-- Select --</option>
            {levels.map((l) => <option key={l.id} value={l.id}>{l.userLevel}</option>)}
          </select>
        </Field>
        <Field label="Reporting officer">
          <select name="reportingOfficer" value={form.reportingOfficer} onChange={onChange}>
            <option value="">-- Select --</option>
            {employees.filter((e) => String(e.id) !== String(employeeId)).map((e) => (
              <option key={e.id} value={e.id}>{e.employeeName || e.empNo}</option>
            ))}
          </select>
        </Field>
        <Field label="Work location">
          <select name="workLocation" value={form.workLocation} onChange={onChange}>
            <option value="">-- Select --</option>
            {workLocations.map((wl) => <option key={wl.id} value={wl.id}>{wl.locationName}</option>)}
          </select>
        </Field>
        <Field label="Shift type">
          <MasterSelect category="shift_type" name="shiftType" value={form.shiftType} onChange={onChange} />
        </Field>
        <Field label="Member type">
          <MasterSelect category="member_type" name="memberTypeFlag" value={form.memberTypeFlag} onChange={onChange} />
        </Field>
        <Field label="Employment category">
          <MasterSelect category="employment_category" name="employmentCategory" value={form.employmentCategory} onChange={onChange} />
        </Field>
        <Field label="Job category">
          <MasterSelect category="job_category" name="jobCategory" value={form.jobCategory} onChange={onChange} />
        </Field>
        <Field label="Employment type">
          <MasterSelect category="employment_type" name="employmentType" value={form.employmentType} onChange={onChange} />
        </Field>
        <Field label="Contract type">
          <MasterSelect category="contract_type" name="contractType" value={form.contractType} onChange={onChange} />
        </Field>
        <Field label="Joined date">
          <input type="date" name="joinedDate" value={form.joinedDate} onChange={onChange} />
        </Field>
        <Field label="Appointment date">
          <input type="date" name="appointmentDate" value={form.appointmentDate} onChange={onChange} />
        </Field>
        <Field label="Contract start">
          <input type="date" name="contractStartDate" value={form.contractStartDate} onChange={onChange} />
        </Field>
        <Field label="Contract end">
          <input type="date" name="contractEndDate" value={form.contractEndDate} onChange={onChange} />
        </Field>
        <Field label="Probation period">
          <MasterSelect category="probation_period" name="probationPeriod" value={form.probationPeriod} onChange={onChange} />
        </Field>
        <Field label="Probation end">
          <input type="date" name="probationEndDate" value={form.probationEndDate} onChange={onChange} />
        </Field>
        <Field label="Retirement date">
          <input type="date" name="retirementDate" value={form.retirementDate} onChange={onChange} />
        </Field>
        <Field label="Employee status">
          <MasterSelect category="employee_status" name="employeeStatus" value={form.employeeStatus} onChange={onChange} />
        </Field>
        <Field label="Work status">
          <MasterSelect category="work_status" name="workStatus" value={form.workStatus} onChange={onChange} />
        </Field>
        <Field label="Biometric ID">
          <input name="biometricId" value={form.biometricId} onChange={onChange} />
        </Field>
        <Field label="Bulk leave">
          <select name="bulkLeaveAvailable" value={form.bulkLeaveAvailable} onChange={onChange}>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </Field>
        <Field label="Flex hours">
          <select name="flexHoursEnabled" value={form.flexHoursEnabled} onChange={onChange}>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </Field>
        <Field label="Flex minutes">
          <input type="number" name="flexHoursMinutes" value={form.flexHoursMinutes} onChange={onChange} disabled={form.flexHoursEnabled !== '1'} />
        </Field>
        <Field label="Permanent date">
          <input type="date" name="permanentDate" value={form.permanentDate} onChange={onChange} />
        </Field>
      </FieldGrid>
      <SaveBanner message={message} />
      <div className="epd-actions">
        <button type="button" className="epd-btn epd-btn-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save employment details'}
        </button>
      </div>
    </div>
  );
}

export function FamilyTab({ employeeId }) {
  return <FamilyDependentsSection employeeId={employeeId} />;
}

export function SecurityTab({ employeeId }) {
  const { employee, refetch } = useEmployee(employeeId);
  const [updateEmployee, { isLoading: saving }] = useUpdateEmployeeRegistrationMutation();
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({});

  const { data: provincesData } = useGetProvincesQuery();
  const { data: districtsData } = useGetDistrictsQuery();
  const { data: dscsData } = useGetDSCSQuery();
  const provinces = provincesData?.data || provincesData || [];
  const districts = districtsData?.data || districtsData || [];
  const dscs = dscsData?.data || dscsData || [];

  const { data: ascsData } = useGetASCSQuery(
    { districtId: form.district || undefined, dscsId: form.divisionalSecretariats || undefined },
    { skip: !form.district && !form.divisionalSecretariats },
  );
  const ascs = ascsData?.data || ascsData || [];

  useEffect(() => {
    if (!employee) return;
    setForm({
      province: employee.province || '',
      district: employee.district || '',
      divisionalSecretariats: employee.divisionalSecretariats || '',
      asc: employee.ascsId || '',
      policeStation: employee.policeStation || '',
    });
  }, [employee]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'province') {
        next.district = '';
        next.divisionalSecretariats = '';
        next.asc = '';
      }
      if (name === 'district') {
        next.divisionalSecretariats = '';
        next.asc = '';
      }
      if (name === 'divisionalSecretariats') next.asc = '';
      return next;
    });
  };

  const onSave = async () => {
    const fd = new FormData();
    fd.append('id', String(employeeId));
    appendFormFields(fd, { ...form, asc: form.asc });
    try {
      await updateEmployee(fd).unwrap();
      setMessage({ type: 'success', text: 'Security details saved.' });
      refetch();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to save.' });
    }
  };

  if (!employee) return null;

  return (
    <div className="epd-section">
      <p className="epd-section-intro">Administrative / clearance location details. Upload police and GN reports under Documents.</p>
      <FieldGrid>
        <Field label="Province">
          <select name="province" value={form.province} onChange={onChange}>
            <option value="">-- Select --</option>
            {(Array.isArray(provinces) ? provinces : []).map((p) => (
              <option key={p.id} value={p.id}>{p.province}</option>
            ))}
          </select>
        </Field>
        <Field label="District">
          <select name="district" value={form.district} onChange={onChange}>
            <option value="">-- Select --</option>
            {(Array.isArray(districts) ? districts : []).map((d) => (
              <option key={d.id} value={d.id}>{d.district}</option>
            ))}
          </select>
        </Field>
        <Field label="Divisional secretariat">
          <select name="divisionalSecretariats" value={form.divisionalSecretariats} onChange={onChange}>
            <option value="">-- Select --</option>
            {(Array.isArray(dscs) ? dscs : []).map((d) => (
              <option key={d.id} value={d.id}>{d.dse}</option>
            ))}
          </select>
        </Field>
        <Field label="ASC">
          <select name="asc" value={form.asc} onChange={onChange}>
            <option value="">-- Select --</option>
            {(Array.isArray(ascs) ? ascs : []).map((a) => (
              <option key={a.id} value={a.id}>{a.ascs}</option>
            ))}
          </select>
        </Field>
        <Field label="Police station">
          <input name="policeStation" value={form.policeStation} onChange={onChange} />
        </Field>
      </FieldGrid>
      <SaveBanner message={message} />
      <div className="epd-actions">
        <button type="button" className="epd-btn epd-btn-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save security details'}
        </button>
      </div>
    </div>
  );
}

const LEGACY_DOC_SLOTS = [
  { key: 'birthCertificate', label: 'Birth certificate' },
  { key: 'healthReport', label: 'Health / medical report' },
  { key: 'policeReport', label: 'Police report' },
  { key: 'gndCertificate', label: 'GN certificate' },
  { key: 'marriedCertificate', label: 'Marriage certificate' },
];

export function LegacyFilesSection({ employeeId }) {
  const { employee, refetch } = useEmployee(employeeId);
  const [updateEmployee, { isLoading: saving }] = useUpdateEmployeeRegistrationMutation();
  const [message, setMessage] = useState(null);

  const handleUpload = async (fieldKey, files) => {
    if (!files?.length) return;
    const fd = new FormData();
    fd.append('id', String(employeeId));
    fd.append(fieldKey, files[0]);
    try {
      await updateEmployee(fd).unwrap();
      setMessage({ type: 'success', text: 'File uploaded.' });
      refetch();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Upload failed.' });
    }
  };

  const urlFor = (fieldKey) => {
    const val = employee?.[fieldKey];
    if (!val) return null;
    if (typeof val === 'string' && val.startsWith('http')) return val;
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.includes(',')) return val.split(',').map((s) => s.trim());
    return val;
  };

  return (
    <div className="epd-section">
      <h4 className="ep-subsection-title">Registration documents</h4>
      <p className="epd-section-intro">
        HR registration documents. Education certificates and service letters are managed under Qualifications — not here.
      </p>
      <SaveBanner message={message} />
      <div className="ep-doc-gallery">
        {LEGACY_DOC_SLOTS.map((slot) => {
          const existing = urlFor(slot.key);
          const inputId = `legacy-doc-${slot.key}`;
          return (
            <div key={slot.key} className="ep-doc-card">
              <span className="ep-doc-label">{slot.label}</span>
              <div className="ep-doc-preview">
                {existing ? (
                  Array.isArray(existing) ? (
                    <span>{existing.length} file(s) on record</span>
                  ) : (
                    <a href={existing} target="_blank" rel="noreferrer">View file</a>
                  )
                ) : (
                  <span className="epd-empty">No file</span>
                )}
              </div>
              <input
                id={inputId}
                type="file"
                className="ep-doc-file-input"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple={slot.multiple}
                disabled={saving}
                onChange={(e) => {
                  handleUpload(slot.key, e.target.files);
                  e.target.value = '';
                }}
              />
              <label htmlFor={inputId} className="epd-btn epd-btn-sm">{existing ? 'Replace' : 'Upload'}</label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AddEmployeeModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ employeeName: '', nic: '', mobileNumber: '' });
  const [message, setMessage] = useState(null);
  const [createEmployee, { isLoading: creating }] = useCreateEmployeeRegistrationMutation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!form.employeeName?.trim() || !form.nic?.trim() || !form.mobileNumber?.trim()) {
      setMessage({ type: 'error', text: 'Name, NIC, and mobile are required.' });
      return;
    }
    if (!isValidNic(form.nic)) {
      setMessage({ type: 'error', text: 'Invalid NIC format.' });
      return;
    }
    const fd = new FormData();
    fd.append('employeeName', form.employeeName.trim());
    fd.append('nic', form.nic.trim().toUpperCase());
    fd.append('mobileNumber', sanitizePhone9(form.mobileNumber));
    fd.append('employeeType', 'i');
    const parsed = parseNic(form.nic);
    if (parsed.valid) {
      fd.append('dob', parsed.dob);
      fd.append('gender', parsed.gender);
    }
    try {
      const result = await createEmployee(fd).unwrap();
      if (result?.status && result?.data) {
        onCreated(result.data);
      } else {
        setMessage({ type: 'error', text: result?.message || 'Create failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Create failed.' });
    }
  };

  return (
    <div className="epd-modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="epd-modal-card ep-add-modal" role="dialog" aria-modal="true">
        <div className="epd-modal-header">
          <h3>Add new employee</h3>
          <button type="button" className="epd-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form className="epd-modal-body" onSubmit={onSubmit}>
          <p className="epd-section-intro">Create with minimum details, then complete the full profile in the tabs.</p>
          <FieldGrid>
            <Field label="Employee name">
              <input value={form.employeeName} onChange={(e) => setForm((p) => ({ ...p, employeeName: e.target.value }))} required />
            </Field>
            <Field label="NIC">
              <input
                value={form.nic}
                onChange={(e) => {
                  const nic = sanitizeNicInput(e.target.value);
                  setForm((p) => applyNicDerived({ ...p, nic }, nic));
                }}
                maxLength={12}
                placeholder="12 digits or 9 digits + V/X"
                required
              />
            </Field>
            {form.dob ? (
              <Field label="Date of birth (from NIC)">
                <input value={form.dob} readOnly style={{ background: '#f5f5f5' }} />
              </Field>
            ) : null}
            <Field label="Mobile (9 digits)">
              <input
                value={form.mobileNumber}
                onChange={(e) => setForm((p) => ({ ...p, mobileNumber: sanitizePhone9(e.target.value) }))}
                maxLength={9}
                required
              />
            </Field>
          </FieldGrid>
          <SaveBanner message={message} />
          <div className="epd-actions">
            <button type="button" className="epd-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="epd-btn epd-btn-primary" disabled={creating}>
              {creating ? 'Creating…' : 'Create & open profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
