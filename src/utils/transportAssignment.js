import { formatVehicleOwnershipFromRecord } from './vehicleOwnership';

/** Sri Lanka calendar date YYYY-MM-DD for transport eligibility (today / tomorrow only). */
export function getColomboYmd(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
}

/** Format API / DB date values as YYYY-MM-DD in Asia/Colombo (avoids UTC off-by-one). */
export function formatApiDateYmd(value) {
  if (value == null || value === '') return '';
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '';
  }
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
}

export function addDaysToYmd(ymd, days) {
  const [y, m, d] = String(ymd).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function isTransportEligibleAssignmentDate(assignmentDateYmd) {
  if (!assignmentDateYmd) return false;
  // TESTING: today/tomorrow-only restriction disabled — restore block below after testing
  return true;
  // const today = getColomboYmd();
  // const tomorrow = addDaysToYmd(today, 1);
  // return assignmentDateYmd === today || assignmentDateYmd === tomorrow;
}

export function formatDriverArrivalTimeForInput(value) {
  if (!value) return '06:00';
  const s = String(value);
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  return '06:00';
}

/** Display HH:mm / HH:mm:ss as 12-hour time (pool tasks, transport arrival). */
export function formatTransportTimeDisplay(value) {
  if (value == null || value === '') return '—';
  const text = String(value).trim();
  if (!text) return '—';
  if (/am|pm/i.test(text)) return text;

  const hm = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hm) {
    let hours = Number(hm[1]);
    const minutes = hm[2];
    if (!Number.isFinite(hours) || hours < 0 || hours > 23) return text;
    const period = hours >= 12 ? 'PM' : 'AM';
    hours %= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${period}`;
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Colombo',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return text;
}

export function buildVehicleDisplayFromDriver(driver) {
  if (!driver) return '';
  const parts = [driver.vehicle_no, driver.vehicle_make, driver.vehicle_model].filter(Boolean);
  const vehicleText = parts.length ? parts.join(' · ') : '';
  const ownershipLabel = formatVehicleOwnershipFromRecord(driver);
  if (!vehicleText) return ownershipLabel;
  return `${vehicleText} · ${ownershipLabel}`;
}
