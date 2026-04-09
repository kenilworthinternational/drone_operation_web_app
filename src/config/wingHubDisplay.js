/**
 * Display metadata for wing hub cards (matches navbar category titles in navbarCategories.js).
 * Keys must match `title` strings exactly.
 */
export const WING_HUB_META = {
  'Strategic Planning and Monitoring wing': {
    abbr: 'SPMW',
    label: 'Strategic Planning & Monitoring Wing',
    color: '#1e3a5f',
  },
  'Field Operations Wing': {
    abbr: 'FOW',
    label: 'Field Operations Wing',
    color: '#0f766e',
  },
  'Operation Digitalization & Digital Monitoring & Evaluation Wing': {
    abbr: 'ODDME',
    label: 'Operation Digitalization & Digital Monitoring & Evaluation Wing',
    color: '#4b5563',
  },
  Finance: {
    abbr: 'FMW',
    label: 'Finance Management Wing',
    color: '#c67a2e',
  },
  'ICT Wing': {
    abbr: 'ICTW',
    label: 'Information Communication & Technology Wing',
    color: '#3b82c4',
  },
  'Human Resource Management': {
    abbr: 'HRMW',
    label: 'Human Resource Management Wing',
    color: '#6b4c8a',
  },
  'Administration Wing': {
    abbr: 'AW',
    label: 'Administration Wing',
    color: '#111827',
  },
  'Geo Spatial Management': {
    abbr: 'GSTW',
    label: 'GEO Spatial Technology Wing',
    color: '#5a2622',
  },
};

/**
 * Resolve ?wing= query value to hub meta (for theming nav to match the wing card color).
 * @param {string|null|undefined} wingParam - Raw search param (still encoded)
 * @returns {{ title: string, abbr: string, label: string, color: string } | null}
 */
export function resolveWingNavTheme(wingParam) {
  if (wingParam == null || wingParam === '') return null;
  let title;
  try {
    title = decodeURIComponent(wingParam);
  } catch {
    return null;
  }
  const normalized = title === 'Management' ? 'Field Operations Wing' : title;
  const meta = WING_HUB_META[normalized];
  if (!meta?.color) return null;
  return { title: normalized, ...meta };
}
