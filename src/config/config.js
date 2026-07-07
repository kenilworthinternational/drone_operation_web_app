// Environment configuration
// Priority: REACT_APP_ENV > NODE_ENV > hostname check
// Note: react-scripts start always sets NODE_ENV=development, so we prioritize REACT_APP_ENV
const getEnvironment = () => {
  // If REACT_APP_ENV is explicitly set, use it
  if (process.env.REACT_APP_ENV === 'production') {
    return 'production';
  }
  if (process.env.REACT_APP_ENV === 'development') {
    return 'development';
  }
  
  // Fallback to NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }
  
  // Default: check hostname (localhost = development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  
  // Default to production if nothing matches
  return 'production';
};

const currentEnv = getEnvironment();
const isDevelopment = currentEnv === 'development';

// API Configuration — legacy PHP removed; webapp uses Node `/api/` (see baseApi.js + legacyPhpCompat)
export const API_CONFIG = {
  development: '/api/',
  production: '/api/',
};

function isLocalDevServer() {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}

// Deprecated: kept for any stray imports; always Node proxy path
export const API_BASE_URL = isLocalDevServer() ? '/api/' : '/api/';

// Export environment flag for use in other files
export const IS_DEVELOPMENT = isDevelopment;
export const IS_PRODUCTION = !isDevelopment;

