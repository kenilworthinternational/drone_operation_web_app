export const VEHICLE_POOL_CATEGORY_OPTIONS = [
  { value: 'p', label: 'Pool' },
  { value: 'a', label: 'Assign' },
];

export function formatVehiclePoolCategory(value) {
  if (value === 'a') return 'Assign';
  if (value === 'p') return 'Pool';
  return '-';
}

export function normalizeVehiclePoolCategory(value, defaultValue = 'p') {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'a' || raw === 'assign') return 'a';
  if (raw === 'p' || raw === 'pool') return 'p';
  return defaultValue;
}
