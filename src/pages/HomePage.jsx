import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import LeftNavBar from '../components/LeftNavBar';
import '../styles/home.css';

const HomePage = () => {
  const [showSidebar, setShowSidebar] = useState(false);

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
      <TopNavBar onMenuClick={() => setShowSidebar(true)} />
      <LeftNavBar 
        showSidebar={showSidebar} 
        onClose={() => setShowSidebar(false)}
        onCollapseChange={() => {}}
      />
      <div 
        className="content-dashboard"
        style={{
          marginLeft: '280px',
          width: 'calc(100vw - 280px)',
          transition: 'margin-left 200ms ease, width 200ms ease'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default HomePage;
