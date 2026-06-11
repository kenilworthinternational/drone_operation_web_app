import { parseNic } from '../../../utils/nic';

export function splitDate(value) {
  if (!value) return '';
  return String(value).split('T')[0];
}

export function employeeRecord(data) {
  return data?.data || data || null;
}

export function appendFormFields(formData, fields, values) {
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value === '' ? '' : String(value));
    }
  });
}

export function sanitizeNicInput(value) {
  const upper = String(value || '').toUpperCase().replace(/[^0-9VX]/g, '');
  if (upper.length <= 9) return upper.replace(/[VX]/g, '');
  if (upper.length === 10 && /^\d{9}[VX]$/.test(upper)) return upper;
  if (/^\d{9}[VX]/.test(upper)) return upper.slice(0, 10);
  return upper.replace(/[VX]/g, '').slice(0, 12);
}

export function applyNicDerived(values, nic) {
  const parsed = parseNic(nic);
  if (!parsed.valid) return values;
  const next = { ...values };
  next.dob = parsed.dob;
  next.gender = parsed.gender;
  next.age = parsed.age != null ? String(parsed.age) : '';
  return next;
}

export function isValidNic(nic) {
  const value = String(nic || '').trim().toUpperCase();
  return /^\d{12}$/.test(value) || /^\d{9}[VX]$/.test(value);
}

export function employeeInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export function getEmployeePhotoUrl(employee) {
  if (!employee) return null;
  if (employee.employeePhotoUrl) return employee.employeePhotoUrl;
  const photo = employee.employeePhoto;
  if (typeof photo === 'string' && photo.startsWith('http')) return photo;
  return null;
}

export function sanitizePhone9(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 9);
  return digits.startsWith('0') ? digits.slice(1) : digits;
}
