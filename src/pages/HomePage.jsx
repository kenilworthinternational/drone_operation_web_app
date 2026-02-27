import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import LeftNavBar from '../components/LeftNavBar';
import { getUserData } from '../utils/authUtils';
import '../styles/home.css';

const HomePage = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const userData = getUserData();
  const isExternalUser = userData?.member_type === 'e';

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
      {!isExternalUser && (
        <LeftNavBar 
          showSidebar={showSidebar} 
          onClose={() => setShowSidebar(false)}
          onCollapseChange={() => {}}
        />
      )}
      <div 
        className="content-dashboard"
        style={{
          marginLeft: isExternalUser ? '0' : '280px',
          width: isExternalUser ? '100vw' : 'calc(100vw - 280px)',
          transition: 'margin-left 200ms ease, width 200ms ease'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default HomePage;
