/** Sri Lanka calendar date YYYY-MM-DD for transport eligibility (today / tomorrow only). */
export function getColomboYmd(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
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

export function buildVehicleDisplayFromDriver(driver) {
  if (!driver) return '';
  const parts = [driver.vehicle_no, driver.vehicle_make, driver.vehicle_model].filter(Boolean);
  return parts.length ? parts.join(' · ') : '';
}
