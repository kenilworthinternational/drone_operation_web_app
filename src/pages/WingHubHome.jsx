import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../store/hooks';
import { baseApi } from '../api/services/allEndpoints';
import { logout } from '../store/slices/authSlice';
import { useNavbarPermissions } from '../hooks/useNavbarPermissions';
import { WING_HUB_META } from '../config/wingHubDisplay';
import { OD_WING_OPERATION_DIGITALIZATION_TITLE } from '../config/odWingShell';
import { isInternalDeveloper } from '../utils/authUtils';
import '../styles/wingHub.css';
import TargetCursor from '../components/TargetCursor';

const LOGO_SRC = `${process.env.PUBLIC_URL}/assets/images/kenilowrth-white.png`;
const BEE_SRC = `${process.env.PUBLIC_URL}/assets/images/bee.png`;
const LOGOUT_ICON_SRC = `${process.env.PUBLIC_URL}/assets/images/logout.png`;

/** Same rules as LeftNavBar: which navbar rows under this wing resolve to at least one allowed path. */
function getVisibleNavChildren(category, allowedPaths) {
  return category.children.filter((child) => {
    if (child.subItems && child.subItems.length > 0) {
      return child.subItems.some((sub) => allowedPaths.includes(sub.path));
    }
    return allowedPaths.includes(child.path);
  });
}

/**
 * Post-login landing: wing tiles (main nav categories). Click opens Forecast with ?wing=…
 * (except Operation Digitalization wing → Workflow Dashboard with OD shell, no left nav).
 */
const WingHubHome = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { categories, categoryVisibility, allowedPaths, userData, loadingPermissions } = useNavbarPermissions();

  const handleConfirmLogout = () => {
    dispatch(baseApi.util.resetApiState());
    queryClient.clear();
    dispatch(logout());
    localStorage.removeItem('activeLink');
    localStorage.removeItem('leftnav_expanded');
    navigate('/login');
    setShowLogoutDialog(false);
  };

  const isDeveloper = isInternalDeveloper(userData);
  const visibleWings = useMemo(() => {
    // Show all wing tiles on /home. Only hide developer-only entries for non-developers.
    return categories.filter((category) => !(category.developerOnly === true && !isDeveloper));
  }, [categories, isDeveloper]);

  const orderedWings = useMemo(() => {
    return [...visibleWings].sort((a, b) => {
      const aVisibleChildren = getVisibleNavChildren(a, allowedPaths);
      const bVisibleChildren = getVisibleNavChildren(b, allowedPaths);
      const aHasCategoryVisibility = categoryVisibility[a.title] === true;
      const bHasCategoryVisibility = categoryVisibility[b.title] === true;
      const aLocked = !isDeveloper && !aHasCategoryVisibility && aVisibleChildren.length === 0;
      const bLocked = !isDeveloper && !bHasCategoryVisibility && bVisibleChildren.length === 0;
      if (aLocked === bLocked) return 0;
      return aLocked ? 1 : -1;
    });
  }, [visibleWings, allowedPaths, categoryVisibility, isDeveloper]);

  const handleWingClick = (title) => {
    const q = encodeURIComponent(title);
    if (title === OD_WING_OPERATION_DIGITALIZATION_TITLE) {
      navigate(`/home/workflowDashboard?wing=${q}`);
      return;
    }
    navigate(`/home/create?wing=${q}`);
  };

  return (
    <div className="wing-hub">
      <TargetCursor spinDuration={2} hideDefaultCursor parallaxOn hoverDuration={0.2} />
      <header className="wing-hub-header">
        <div className="wing-hub-header-inner">
          <img className="wing-hub-brand-logo" src={LOGO_SRC} alt="Kenilworth International" />
          <div className="wing-hub-header-actions">
            <button
              type="button"
              className="wing-hub-comb-card wing-hub-comb-card--action cursor-target"
              onClick={() => navigate('/home/monitoringDashboard?comb=1')}
            >
              <img className="wing-hub-bee" src={BEE_SRC} alt="" />
              <div className="wing-hub-comb-text">
                <span className="wing-hub-comb-title">COMB</span>
                <span className="wing-hub-comb-sub">Central Operations Management Base</span>
              </div>
            </button>
            <button
              type="button"
              className="wing-hub-logout-btn cursor-target"
              onClick={() => setShowLogoutDialog(true)}
              title="Logout"
              aria-label="Logout"
            >
              <img src={LOGOUT_ICON_SRC} alt="" width={28} height={28} />
            </button>
          </div>
        </div>
      </header>

      {showLogoutDialog && (
        <div className="wing-hub-logout-overlay" role="presentation">
          <div className="wing-hub-logout-dialog" role="dialog" aria-modal="true" aria-labelledby="wing-hub-logout-title">
            <h3 id="wing-hub-logout-title">Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="wing-hub-logout-dialog-buttons">
              <button type="button" onClick={() => setShowLogoutDialog(false)} className="wing-hub-logout-cancel">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmLogout} className="wing-hub-logout-confirm">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="wing-hub-body">
        {loadingPermissions ? (
          <p className="wing-hub-loading">Loading access…</p>
        ) : visibleWings.length === 0 ? (
          <p className="wing-hub-empty">No wings available for your account.</p>
        ) : (
          <>
            <div className="wing-hub-grid">
              {orderedWings.map((cat) => {
                const WingIcon = cat.icon;
                const meta = WING_HUB_META[cat.title] || {
                  abbr: cat.title.slice(0, 4).toUpperCase(),
                  label: cat.title,
                  color: '#334155',
                };
                const visibleNavChildren = getVisibleNavChildren(cat, allowedPaths);
                const hasCategoryVisibility = categoryVisibility[cat.title] === true;
                const isNavLocked = !isDeveloper && !hasCategoryVisibility && visibleNavChildren.length === 0;
                const cardClassName = [
                  'wing-hub-card',
                  !isNavLocked ? 'cursor-target' : '',
                  isNavLocked ? 'wing-hub-card--no-nav-access' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <div key={cat.title} className="wing-hub-card-wrap">
                    {isNavLocked ? (
                      <div
                        className={cardClassName}
                        style={{ background: meta.color }}
                        role="group"
                        aria-label={`${meta.label}: no navigation access`}
                        title="No navigation items assigned for this wing"
                      >
                        <span className="wing-hub-card-icon" aria-hidden>
                          {WingIcon ? <WingIcon /> : null}
                        </span>
                        <span className="wing-hub-card-text">
                          <span className="wing-hub-card-label">{meta.label}</span>
                          <span className="wing-hub-card-abbr">({meta.abbr})</span>
                        </span>
                        <span className="wing-hub-card-no-access-bar">No navigation access</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={cardClassName}
                        style={{ background: meta.color }}
                        onClick={() => handleWingClick(cat.title)}
                      >
                        <span className="wing-hub-card-icon" aria-hidden>
                          {WingIcon ? <WingIcon /> : null}
                        </span>
                        <span className="wing-hub-card-text">
                          <span className="wing-hub-card-label">{meta.label}</span>
                          <span className="wing-hub-card-abbr">({meta.abbr})</span>
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WingHubHome;
