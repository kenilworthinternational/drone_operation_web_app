import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Node.js Backend Base URL Configuration
 * Determines the backend URL based on environment variable (REACT_APP_ENV) or hostname
 * Priority: REACT_APP_ENV > hostname detection
 * 
 * When REACT_APP_ENV is set (via npm scripts), it takes precedence and hostname is ignored.
 * This allows testing production APIs locally with npm run start:prod
 * 
 * @returns {string} The backend API base URL
 */
export const getNodeBackendUrl = () => {
  // First, check environment variable (set by npm scripts)
  // This allows testing production APIs locally with npm run start:prod
  const env = process.env.REACT_APP_ENV;
  
  if (env === 'production') {
    const url = 'https://dsms-web-api.kenilworthinternational.com';
    console.log('[Node Backend Config] Using PRODUCTION API (from REACT_APP_ENV):', url);
    return url;
  }
  
  if (env === 'development') {
    const url = 'https://dsms-web-api-dev.kenilworthinternational.com';
    console.log('[Node Backend Config] Using DEVELOPMENT API (from REACT_APP_ENV):', url);
    return url;
  }
  
  // Fallback to hostname-based detection (only when REACT_APP_ENV is not set)
  // This is for deployed environments where env var might not be set
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Default to dev when running locally without explicit env
    const url = 'https://dsms-web-api-dev.kenilworthinternational.com';
    console.log('[Node Backend Config] Using DEVELOPMENT API (localhost fallback):', url);
    return url;
  }
  
  if (hostname.includes('dev')) {
    const url = 'https://dsms-web-api-dev.kenilworthinternational.com';
    console.log('[Node Backend Config] Using DEVELOPMENT API (hostname contains "dev"):', url);
    return url;
  }
  
  if (hostname.includes('test')) {
    const url = 'https://dsms-api-test.kenilworth.international.com';
    console.log('[Node Backend Config] Using TEST API (hostname contains "test"):', url);
    return url;
  }
  
  // Default to production for unknown hostnames
  const url = 'https://dsms-web-api.kenilworthinternational.com';
  console.log('[Node Backend Config] Using PRODUCTION API (default fallback):', url);
  return url;
};

/**
 * Helper function to get authentication token from localStorage
 * @returns {string|null} The user's authentication token or null if not found
 */
export const getToken = () => {
  try {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    const storedUser = JSON.parse(userData);
    return storedUser?.token || null;
  } catch (error) {
    console.error('Error parsing userData from localStorage:', error);
    return null;
  }
};

/**
 * Custom base query for Node.js backend
 * Configures fetchBaseQuery with the correct base URL and authentication headers
 */
export const nodeBackendBaseQuery = fetchBaseQuery({
  baseUrl: getNodeBackendUrl(),
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});
