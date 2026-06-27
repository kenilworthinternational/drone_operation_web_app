/** HR master option values for `driving_license` category */
export const DRIVING_LICENSE_NO = 'No';
export const DRIVING_LICENSE_LIGHT = 'Light';
export const DRIVING_LICENSE_HEAVY = 'Heavy';

export function isDrivingLicenseTypesEnabled(drivingLicense) {
  const value = String(drivingLicense || '').trim();
  return value === DRIVING_LICENSE_LIGHT || value === DRIVING_LICENSE_HEAVY;
}

/** Map a license code row to Light or Heavy (Sri Lanka classes). */
export function classifyLicenseRow(license) {
  const code = String(license?.licenseCode || '').trim().toUpperCase();
  const desc = String(license?.licenseType || '').toLowerCase();
  if (
    ['C', 'C1', 'CE', 'G', 'G1'].includes(code)
    || desc.includes('heavy')
    || desc.includes('goods')
    || desc.includes('truck')
    || desc.includes('lorry')
    || desc.includes('bus')
  ) {
    return DRIVING_LICENSE_HEAVY;
  }
  return DRIVING_LICENSE_LIGHT;
}

export function filterLicenseTypesByCategory(licenseTypes, drivingLicense) {
  if (!isDrivingLicenseTypesEnabled(drivingLicense)) return [];
  if (drivingLicense === DRIVING_LICENSE_HEAVY) {
    return licenseTypes || [];
  }
  return (licenseTypes || []).filter((row) => classifyLicenseRow(row) === DRIVING_LICENSE_LIGHT);
}

export function pruneLicenseTypeIds(ids, licenseTypes, drivingLicense) {
  if (!isDrivingLicenseTypesEnabled(drivingLicense)) return [];
  const allowed = new Set(
    filterLicenseTypesByCategory(licenseTypes, drivingLicense).map((row) => Number(row.id)),
  );
  return (ids || [])
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id) && allowed.has(id));
}

export function inferDrivingLicenseFromTypes(ids, licenseTypes) {
  const selected = (licenseTypes || []).filter((row) =>
    (ids || []).some((id) => Number(id) === Number(row.id)),
  );
  if (!selected.length) return '';
  if (selected.some((row) => classifyLicenseRow(row) === DRIVING_LICENSE_HEAVY)) {
    return DRIVING_LICENSE_HEAVY;
  }
  return DRIVING_LICENSE_LIGHT;
}

export function drivingLicenseTypesDisabledHint(drivingLicense) {
  const value = String(drivingLicense || '').trim();
  if (value === DRIVING_LICENSE_NO) return 'Not applicable (no driving license)';
  if (!value) return 'Select driving license first';
  return 'Select license codes…';
}

export function licenseTypesFilterHint(drivingLicense) {
  const value = String(drivingLicense || '').trim();
  if (value === DRIVING_LICENSE_LIGHT) return 'Light vehicle class codes only';
  if (value === DRIVING_LICENSE_HEAVY) return 'All license classes available';
  return undefined;
}
