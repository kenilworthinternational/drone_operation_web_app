import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { forceLogoutFromApi } from '../../utils/sessionUtils';

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
  const env = process.env.REACT_APP_ENV;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalDevServer = hostname === 'localhost' || hostname === '127.0.0.1';

    // Same-origin /api via src/setupProxy.js (no cross-origin CORS on localhost)
    if (isLocalDevServer) {
      return '';
    }

    if (env === 'production') {
      return 'https://dsms-web-api.kenilworthinternational.com';
    }
    if (env === 'development' || hostname.includes('dev')) {
      return 'https://dsms-web-api-dev.kenilworthinternational.com';
    }
    if (hostname.includes('test')) {
      return 'https://dsms-api-test.kenilworth.international.com';
    }
    return 'https://dsms-web-api.kenilworthinternational.com';
  }

  // Build / SSR (no window)
  if (env === 'production') {
    return 'https://dsms-web-api.kenilworthinternational.com';
  }
  return 'https://dsms-web-api-dev.kenilworthinternational.com';
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
const rawNodeBackendBaseQuery = fetchBaseQuery({
  baseUrl: getNodeBackendUrl(),
  /**
   * Avoid browser HTTP cache returning 304 with an empty body — RTK then has no JSON `data`
   * and list endpoints (e.g. plantation-plan-requests) appear empty while pending-count still works.
   * Do not add Cache-Control / Pragma *request* headers: dev API CORS Allow-Headers may omit them
   * and the preflight will fail. `cache: 'no-store'` avoids 304 without extra headers.
   */
  fetchFn: (input, init) =>
    fetch(input, {
      ...init,
      cache: 'no-store',
    }),
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const nodeBackendBaseQuery = async (args, api, extraOptions) => {
  const result = await rawNodeBackendBaseQuery(args, api, extraOptions);
  if (result.error) {
    forceLogoutFromApi(api, result.error);
  }
  return result;
};
