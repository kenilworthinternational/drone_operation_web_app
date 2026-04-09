import { getUserData, isInternalDeveloper } from './authUtils';

/**
 * Feature Permission Utilities
 * Functions to check if a user has access to specific features
 */

/**
 * Get user's feature permissions from backend
 * @param {Object} userData - User data object from localStorage
 * @returns {Promise<Object>} Object mapping feature codes to boolean access
 */
export async function getUserFeaturePermissions(userData) {
  try {
    // Import dynamically to avoid circular dependencies
    const { featurePermissionsApi } = await import('../api/services NodeJs/featurePermissionsApi');
    const { getMyPermissions } = featurePermissionsApi.endpoints;
    
    // Get permissions from backend
    const result = await getMyPermissions.initiate().unwrap();
    
    // Convert to feature code mapping
    const permissions = {};
    if (result && typeof result === 'object') {
      // Backend returns permissions grouped by category
      // We need to check if user has access to specific features
      // For now, we'll use a simplified approach and check via API
      return result;
    }
    
    return permissions;
  } catch (error) {
    console.error('Error fetching user feature permissions:', error);
    return {};
  }
}

/**
 * Check if user has access to a specific feature
 * @param {string} featureCode - Feature code (e.g., 'FEAT_WORKFLOW_QUICK_EMERGENCY_MOVING')
 * @param {Object} userData - User data object from localStorage
 * @param {Object} featurePermissions - Optional cached permissions object
 * @returns {Promise<boolean>} True if user has access
 */
export async function hasFeatureAccess(featureCode, userData = null, featurePermissions = null) {
  // Get user data if not provided
  if (!userData) {
    userData = getUserData();
  }

  // Developers (internal + job_role dev): same rule as navbar — all feature flags allowed
  if (isInternalDeveloper(userData)) {
    return true;
  }

  // Non-internal members don't have access by default
  if (userData?.member_type !== 'i') {
    return false;
  }

  // Get permissions if not provided
  if (!featurePermissions) {
    featurePermissions = await getUserFeaturePermissions(userData);
  }

  // Check if feature is in permissions
  // Backend returns permissions grouped by category with feature codes
  // We need to check if the feature code exists in any category
  if (featurePermissions && typeof featurePermissions === 'object') {
    // Check all categories for the feature code
    for (const category in featurePermissions) {
      if (Array.isArray(featurePermissions[category])) {
        if (featurePermissions[category].includes(featureCode)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Check multiple feature permissions at once
 * @param {Array<string>} featureCodes - Array of feature codes
 * @param {Object} userData - User data object from localStorage
 * @returns {Promise<Object>} Object mapping feature codes to boolean access
 */
export async function checkMultipleFeatures(featureCodes, userData = null) {
  if (!userData) {
    userData = getUserData();
  }

  const permissions = await getUserFeaturePermissions(userData);
  const results = {};

  for (const featureCode of featureCodes) {
    results[featureCode] = await hasFeatureAccess(featureCode, userData, permissions);
  }

  return results;
}

/**
 * Feature codes constants
 */
export const FEATURE_CODES = {
  /** Kept for DB / Auth Controls compatibility; workflow dashboard no longer reads this flag (date/revenue UI removed). */
  WORKFLOW_DASHBOARD_CONTROLS: 'FEAT_WORKFLOW_DASHBOARD_CONTROLS',
  /** Quick access: Emergency Moving (workflow dashboard shortcut) */
  WORKFLOW_QUICK_EMERGENCY_MOVING: 'FEAT_WORKFLOW_QUICK_EMERGENCY_MOVING',
  /** Quick access: Field size adjustments (workflow dashboard shortcut) */
  WORKFLOW_QUICK_FIELD_SIZE_ADJUSTMENTS: 'FEAT_WORKFLOW_QUICK_FIELD_SIZE_ADJUSTMENTS',
  /** Day end process: show Dir-Ops approval checkbox (still only editable by DOPS role when enabled) */
  DAY_END_DIR_OPS_APPROVAL: 'FEAT_DAY_END_DIR_OPS_APPROVAL',
  /** Pilot assignment: resource assignment queue (plans/missions, deploy, teams modal) */
  PILOT_ASSIGNMENT_RESOURCE_QUEUE: 'FEAT_PILOT_ASSIGNMENT_RESOURCE_QUEUE',
  /** Pilot assignment: Arrange transport page and header button */
  PILOT_ASSIGNMENT_ARRANGE_TRANSPORT: 'FEAT_PILOT_ASSIGNMENT_ARRANGE_TRANSPORT',
};

