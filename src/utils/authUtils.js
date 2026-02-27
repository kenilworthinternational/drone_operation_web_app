/**
 * Authentication and Authorization Utilities
 * 
 * This file contains reusable functions for checking user permissions,
 * category visibility, and allowed paths based on user authentication levels.
 */
import navbarCategories from '../config/navbarCategories';

/**
 * Get category visibility based on user data and permissions
 * @param {Object} userData - User data object from localStorage
 * @param {Object} permissions - Permissions object (can be from Redux state or backend API)
 * @param {Array} categories - Array of category objects with title property
 * @returns {Object} Object mapping category titles to boolean visibility
 */
export const getCategoryVisibility = (userData, permissions, categories) => {
  const memberType = userData?.member_type || '';
  const userLevel = userData?.user_level || '';
  const jobRole = userData?.job_role || '';

  // Use the provided categories array to determine available category titles
  const categoryTitles = categories.map((c) => c.title);

  // ONLY Developers (internal with user_level = 'i' AND job_role = 'dev') get everything automatically
  // All other users must have permissions set in Access Control Management
  if (memberType === 'i' && userLevel === 'i' && jobRole === 'dev') {
    return categoryTitles.reduce((acc, title) => {
      acc[title] = true;
      return acc;
    }, {});
  }

  // For all other users (including internal non-developers), use backend permissions only
  // Backend format: permissions[category] = true/false (boolean)
  // If no permissions object or category not found, default to false (no access)
  return categoryTitles.reduce((acc, title) => {
    // Check if permissions exist and category is explicitly granted
    if (permissions && permissions.hasOwnProperty(title)) {
      acc[title] = permissions[title] === true;
    } else {
      // No permission set = no access (default deny)
      acc[title] = false;
    }
    return acc;
  }, {});
};

/**
 * Get allowed paths based on category visibility and path-level permissions
 * @param {Object} visibility - Object mapping category titles to boolean visibility
 * @param {Object} pathPermissions - Object mapping paths to boolean permissions (from backend)
 * @param {Object} userData - User data object (optional, for developer check)
 * @returns {Array} Array of allowed path strings
 */
export const getAllowedPaths = (visibility = {}, pathPermissions = {}, userData = null) => {
  // Build allCategoryPaths dynamically from shared navbarCategories config
  const allCategoryPaths = {};
  const allDevPaths = ['/home/create'];
  navbarCategories.forEach(cat => {
    const paths = [];
    (cat.children || []).forEach(child => {
      if (child.path) {
        paths.push(child.path);
        allDevPaths.push(child.path);
      }
      if (child.subItems) {
        child.subItems.forEach(sub => {
          if (sub.path) {
            paths.push(sub.path);
            allDevPaths.push(sub.path);
          }
        });
      }
    });
    allCategoryPaths[cat.title] = paths;
  });

  // If user is a developer, return all paths automatically
  if (userData && userData.member_type === 'i' && userData.user_level === 'i' && userData.job_role === 'dev') {
    return allDevPaths;
  }

  const allowedPaths = [];

  // Top-level paths (accessible to all)
  allowedPaths.push('/home/create');

  // Check all paths - if path has explicit permission set to true, allow it
  // This allows paths to be accessible regardless of category visibility
  // Path-level permissions take precedence over category-level permissions
  Object.values(allCategoryPaths).flat().forEach(path => {
    if (pathPermissions[path] === true) {
      allowedPaths.push(path);
    }
  });

  return allowedPaths;
};

/**
 * Check if user has access to a specific path
 * @param {string} path - Path to check
 * @param {Object} userData - User data object from localStorage
 * @param {Object} permissions - Permissions object from Redux state or backend
 * @param {Array} categories - Array of category objects with title property
 * @param {Object} pathPermissions - Object mapping paths to boolean permissions (from backend)
 * @returns {boolean} True if user has access to the path
 */
export const hasPathAccess = (path, userData, permissions, categories, pathPermissions = {}) => {
  const visibility = getCategoryVisibility(userData, permissions, categories);
  const allowedPaths = getAllowedPaths(visibility, pathPermissions, userData);
  return allowedPaths.includes(path);
};

/**
 * Check if user is an internal developer/admin
 * @param {Object} userData - User data object from localStorage
 * @returns {boolean} True if user is internal developer/admin
 */
export const isInternalDeveloper = (userData) => {
  return userData?.member_type === 'i' && userData?.user_level === 'i' && userData?.job_role === 'dev';
};

/**
 * Check if user is an internal member
 * @param {Object} userData - User data object from localStorage
 * @returns {boolean} True if user is internal member
 */
export const isInternalMember = (userData) => {
  return userData?.member_type === 'i';
};

/**
 * Get user data from localStorage
 * @returns {Object} User data object or empty object
 */
export const getUserData = () => {
  try {
    const userDataStr = localStorage.getItem('userData');
    return userDataStr ? JSON.parse(userDataStr) : {};
  } catch (error) {
    console.error('Error parsing userData from localStorage:', error);
    return {};
  }
};

/**
 * Get navbar color based on user type
 * @param {Object} userData - User data object from localStorage
 * @returns {string} Navbar color string
 */
export const getNavbarColor = (userData) => {
  const userType = userData?.member_type_name || '';

  switch (userType) {
    case 'Internal User':
      return 'darkblue';
    case 'manager':
      return 'green';
    case 'pilot':
      return 'blue';
    default:
      return 'green';
  }
};

