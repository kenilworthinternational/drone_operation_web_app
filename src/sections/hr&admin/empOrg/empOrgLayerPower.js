/** Power bounds per management layer (mirrors emp_management_layers min_power / max_power). */

export function getLayerPowerBounds(layer) {
  if (!layer) return null;
  const min = Number(layer.min_power);
  const max = Number(layer.max_power);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min, max };
}

export function findLayerById(layers, id) {
  if (!id) return null;
  return layers.find((l) => Number(l.id) === Number(id)) || null;
}

export function findSeniorLayer(layers) {
  return layers.find((l) => l.layer_code === 'senior') || null;
}

export function clampPowerToLayer(power, layer) {
  const bounds = getLayerPowerBounds(layer);
  if (!bounds) return Number(power) || 0;
  const n = Number(power);
  if (!Number.isFinite(n)) return bounds.min;
  return Math.min(bounds.max, Math.max(bounds.min, n));
}

export function isPowerInLayerRange(power, layer) {
  const bounds = getLayerPowerBounds(layer);
  if (!bounds) return true;
  const n = Number(power);
  return Number.isFinite(n) && n >= bounds.min && n <= bounds.max;
}

export function layerPowerHint(layer) {
  const bounds = getLayerPowerBounds(layer);
  if (!bounds) return '';
  return `Allowed power: ${bounds.min}–${bounds.max}`;
}
