import React, { useState, useMemo } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import LeftNavBar from '../components/LeftNavBar';
import CombChrome from '../components/CombChrome';
import OdWingChrome from '../components/OdWingChrome';
import {
  OD_WING_OPERATION_DIGITALIZATION_TITLE,
  isOdWingWorkflowShellPath,
} from '../config/odWingShell';
import { getUserData } from '../utils/authUtils';
import '../styles/home.css';

const COMB_TAB_BASES = ['/home/monitoringDashboard', '/home/dataViewer', '/home/dashboard'];

const HomePage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showSidebar, setShowSidebar] = useState(false);
  const userData = getUserData();
  const isExternalUser = userData?.member_type === 'e';
  const isWingHubLanding = location.pathname === '/home';

  /** Internal dashboard chart drill-down: full width, no left nav (same route family as /home/dashboard). */
  const isDashboardChartBreakdownRoute =
    location.pathname === '/home/dashboard/chart-breakdown' ||
    location.pathname.startsWith('/home/dashboard/chart-breakdown/');

  const isCombShell = useMemo(() => {
    if (searchParams.get('comb') !== '1') return false;
    const { pathname } = location;
    return COMB_TAB_BASES.some((base) => pathname === base || pathname.startsWith(`${base}/`));
  }, [location.pathname, searchParams]);

  const showCombChrome = isCombShell;

  const isOdWingShell = useMemo(() => {
    if (searchParams.get('wing') !== OD_WING_OPERATION_DIGITALIZATION_TITLE) return false;
    return isOdWingWorkflowShellPath(location.pathname);
  }, [location.pathname, searchParams]);

  const showOdWingChrome = isOdWingShell;

  const fullWidthNoLeftNav =
    isWingHubLanding || showCombChrome || isDashboardChartBreakdownRoute || isOdWingShell;

  // Helper to detect mobile view
  const isMobile = () => window.innerWidth <= 768;

  // Listen for window resize to auto-close sidebar on desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (!isMobile()) setShowSidebar(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      {!isExternalUser && <TopNavBar onMenuClick={() => setShowSidebar(true)} />}
      {!isExternalUser && !fullWidthNoLeftNav && (
        <LeftNavBar 
          showSidebar={showSidebar} 
          onClose={() => setShowSidebar(false)}
          onCollapseChange={() => {}}
        />
      )}
      <div 
        className={`content-dashboard${isWingHubLanding ? ' content-dashboard--wing-hub' : ''}${showCombChrome || isDashboardChartBreakdownRoute || isOdWingShell ? ' content-dashboard--comb' : ''}`}
        style={{
          marginLeft: isExternalUser || fullWidthNoLeftNav ? '0' : '280px',
          width: isExternalUser || fullWidthNoLeftNav ? '100vw' : 'calc(100vw - 280px)',
          transition: 'margin-left 200ms ease, width 200ms ease'
        }}
      >
        {showCombChrome && <CombChrome />}
        {showOdWingChrome && <OdWingChrome />}
        <Outlet />
      </div>
    </div>
  );
};

export default HomePage;
