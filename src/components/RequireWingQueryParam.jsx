import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  WING_HUB_PATH,
  hasWingQuery,
  requiresWingQuery,
  resolveLegacyHomePath,
} from '../config/wingRouteGuard';

/**
 * Redirects legacy /home/* URLs without ?wing= back to the wing hub.
 */
export default function RequireWingQueryParam({ children }) {
  const location = useLocation();
  const { pathname, search } = location;

  const legacyPath = resolveLegacyHomePath(pathname);
  if (legacyPath) {
    return <Navigate to={{ pathname: legacyPath, search }} replace />;
  }

  if (!requiresWingQuery(pathname, search)) {
    return children;
  }

  if (hasWingQuery(search)) {
    return children;
  }

  return <Navigate to={WING_HUB_PATH} replace state={{ wingRequiredRedirect: true }} />;
}
