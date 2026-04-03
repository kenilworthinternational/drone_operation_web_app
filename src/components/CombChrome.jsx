import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/combHub.css';
import { FaArrowLeft } from 'react-icons/fa';

const COMB_SEARCH = '?comb=1';

const TABS = [
  { path: '/home/monitoringDashboard', label: 'Monitoring' },
  { path: '/home/dataViewer', label: 'Data Viewer' },
  { path: '/home/dashboard', label: 'Dashboard' },
];

function tabActive(pathname, tabPath) {
  return pathname === tabPath || pathname.startsWith(`${tabPath}/`);
}

/**
 * COMB shell: back to wing hub + three tabs. Shown when ?comb=1 on Data Viewer / Dashboard / Monitoring routes.
 */
const CombChrome = () => {
  const { pathname } = useLocation();

  return (
    <header className="comb-chrome">
      <Link to="/home" className="comb-chrome-back" title="Back to hub">
        <FaArrowLeft aria-hidden />
        <span>Back to hub</span>
      </Link>
      <nav className="comb-chrome-tabs" aria-label="COMB sections">
        {TABS.map((tab) => {
          const active = tabActive(pathname, tab.path);
          return (
            <Link
              key={tab.path}
              to={{ pathname: tab.path, search: COMB_SEARCH }}
              className={`comb-chrome-tab ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};

export default CombChrome;
