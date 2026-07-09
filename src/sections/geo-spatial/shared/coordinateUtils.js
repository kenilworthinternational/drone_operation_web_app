export function parseOptionalCoordinateInput(raw, min, max) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) return NaN;
  return n;
}

export function validateCoordinates(latitudeRaw, longitudeRaw) {
  const lat = parseOptionalCoordinateInput(latitudeRaw, -90, 90);
  if (Number.isNaN(lat)) return 'Enter a valid latitude between -90 and 90';
  const lon = parseOptionalCoordinateInput(longitudeRaw, -180, 180);
  if (Number.isNaN(lon)) return 'Enter a valid longitude between -180 and 180';
  return null;
}

export function hasCoordinates(entity) {
  const lat = entity?.latitude;
  const lon = entity?.longitude;
  return !(lat === null || lat === undefined || lat === '' || lon === null || lon === undefined || lon === '');
}
