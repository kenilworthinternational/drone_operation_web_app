import { logout } from '../store/slices/authSlice';

let forceLogoutInProgress = false;

export function clearAuthSessionStorage() {
  localStorage.removeItem('userData');
  localStorage.removeItem('token');
  localStorage.removeItem('activeLink');
  localStorage.removeItem('leftnav_expanded');
  localStorage.removeItem('leftnav_expanded_subitems');
}

function resolveLogoutReason(error) {
  const payload = error?.data || {};
  const message = String(payload?.message || payload?.error || '').toLowerCase();
  if (payload?.code === 'ACCOUNT_DEACTIVATED' || message.includes('deactivat')) {
    return 'deactivated';
  }
  return 'session_expired';
}

/**
 * Clear client session and send the user to login after a 401 from an authenticated API call.
 */
export function forceLogoutFromApi(api, error) {
  if (forceLogoutInProgress || Number(error?.status) !== 401) return false;

  const hadSession = !!(localStorage.getItem('userData') || localStorage.getItem('token'));
  if (!hadSession) return false;

  forceLogoutInProgress = true;
  const reason = resolveLogoutReason(error);
  clearAuthSessionStorage();

  try {
    api?.dispatch?.(logout());
  } catch (_) {
    // ignore dispatch issues during hard redirect
  }

  sessionStorage.setItem('logoutReason', reason);
  window.location.replace(`/#/login?reason=${encodeURIComponent(reason)}`);
  return true;
}

export function consumeLogoutReason() {
  const reason = sessionStorage.getItem('logoutReason');
  if (reason) sessionStorage.removeItem('logoutReason');
  return reason;
}

export function logoutReasonMessage(reason) {
  if (reason === 'deactivated') {
    return 'Your account has been deactivated. Please contact administration.';
  }
  if (reason === 'session_expired') {
    return 'Your session has expired. Please sign in again.';
  }
  return '';
}
