/**
 * Node backend origin only — no imports from store/session/api to avoid circular deps.
 * @returns {string} Empty string on localhost (same-origin /api proxy), else full API host.
 */
export function getNodeBackendUrl() {
  const env = process.env.REACT_APP_ENV;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalDevServer = hostname === 'localhost' || hostname === '127.0.0.1';

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

  if (env === 'production') {
    return 'https://dsms-web-api.kenilworthinternational.com';
  }
  return 'https://dsms-web-api-dev.kenilworthinternational.com';
}

/** @returns {string|null} */
export function getToken() {
  try {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    const storedUser = JSON.parse(userData);
    return storedUser?.token || null;
  } catch {
    return null;
  }
}
