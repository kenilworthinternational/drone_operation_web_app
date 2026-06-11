/**
 * Sri Lanka NIC parsing utilities (mirrors backend shared/utils/nicUtils.js).
 * Supports old (9 digits + V/X) and new (12-digit) formats.
 */

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function dayOfYearToDate(year, dayOfYear) {
  if (!Number.isFinite(year) || !Number.isFinite(dayOfYear)) return null;
  const maxDays = isLeapYear(year) ? 366 : 365;
  if (dayOfYear < 1 || dayOfYear > maxDays) return null;
  const date = new Date(Date.UTC(year, 0, 1));
  date.setUTCDate(date.getUTCDate() + (dayOfYear - 1));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 && age < 130 ? age : null;
}

/**
 * @param {string} rawNic
 * @returns {{ valid: boolean, format: 'old'|'new'|null, dob: string|null, gender: string|null, age: number|null }}
 */
export function parseNic(rawNic) {
  const empty = { valid: false, format: null, dob: null, gender: null, age: null };
  if (!rawNic) return empty;

  const nic = String(rawNic).trim().toUpperCase();
  let year = null;
  let dayOfYear = null;
  let format = null;

  if (/^\d{9}[VX]$/.test(nic)) {
    format = 'old';
    year = 1900 + parseInt(nic.substring(0, 2), 10);
    dayOfYear = parseInt(nic.substring(2, 5), 10);
  } else if (/^\d{12}$/.test(nic)) {
    format = 'new';
    year = parseInt(nic.substring(0, 4), 10);
    dayOfYear = parseInt(nic.substring(4, 7), 10);
  } else {
    return empty;
  }

  let gender = 'Male';
  if (dayOfYear > 500) {
    gender = 'Female';
    dayOfYear -= 500;
  }

  const dob = dayOfYearToDate(year, dayOfYear);
  if (!dob) return { valid: false, format, dob: null, gender, age: null };

  return { valid: true, format, dob, gender, age: calculateAge(dob) };
}
