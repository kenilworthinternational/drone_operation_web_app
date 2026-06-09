import { getNodeBackendUrl } from '../api/services NodeJs/nodeBackendConfig';
import { ensureHttps } from './urlUtils';

/**
 * Public URL paths for uploaded resources (mirrors dsms_backend_dev shared/config/resourceLocations.js).
 */
export const RESOURCE_URL_PATHS = {
  ACCIDENT_IMAGE: '/uploads/images/accident_image',
  ACCIDENT_VIDEO: '/uploads/images/accident_image',
  ACCIDENT_VOICE: '/uploads/images/accident_voice',
  USER_PROFILE_IMAGE: '/uploads/images/user',
  DJI_SCREEN_IMAGE: '/uploads/images/screen/dji',
  WAYPOINT_IMAGE: '/uploads/images/screen/waypoint',
  PILOT_IMAGE: '/uploads/images/screen/task',
  GROUP_LOGO_IMAGE: '/uploads/images/logo',
  VEHICLE_DAY: '/uploads/vehicle_day',
};

function normalizeBackendBaseUrl() {
  return String(getNodeBackendUrl() || '').replace(/\/$/, '');
}

function basename(filename) {
  const value = String(filename || '').trim();
  if (!value) return '';
  return value.split(/[/\\]/).pop();
}

/**
 * Build a full resource URL from type + filename.
 * @param {string} resourceType - Key from RESOURCE_URL_PATHS
 * @param {string} filename
 * @returns {string|null}
 */
export function getResourceUrl(resourceType, filename) {
  const path = RESOURCE_URL_PATHS[resourceType];
  const safeFilename = basename(filename);
  if (!path || !safeFilename) return null;
  return `${normalizeBackendBaseUrl()}${path}/${safeFilename}`;
}

/** Base URL for group logo images, e.g. .../uploads/images/logo/ */
export function getGroupLogoBaseUrl() {
  return `${normalizeBackendBaseUrl()}${RESOURCE_URL_PATHS.GROUP_LOGO_IMAGE}/`;
}

/**
 * Resolve API media values: full URLs pass through; filenames/relative paths map to Node storage.
 * @param {string} value
 * @param {string} resourceType
 * @returns {string|null}
 */
export function resolveMediaUrl(value, resourceType = 'ACCIDENT_IMAGE') {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return ensureHttps(trimmed);
  }
  const withoutLeadingSlash = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  if (withoutLeadingSlash.includes('/')) {
    return ensureHttps(`${normalizeBackendBaseUrl()}/${withoutLeadingSlash}`);
  }
  return getResourceUrl(resourceType, trimmed);
}
