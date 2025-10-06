import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import LeftNavBar from '../components/LeftNavBar';
import '../styles/home.css';

const HomePage = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  // Listen for sidebar collapse state changes
  React.useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem('leftnav_collapsed') === '1';
      setIsSidebarCollapsed(collapsed);
    };

    // Check initial state
    handleStorageChange();

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events if needed
    window.addEventListener('leftnav-collapsed-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('leftnav-collapsed-changed', handleStorageChange);
    };
  }, []);

  return (
    <div>
      <TopNavBar onMenuClick={() => setShowSidebar(true)} />
      <LeftNavBar 
        showSidebar={showSidebar} 
        onClose={() => setShowSidebar(false)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      <div 
        className="content-dashboard"
        style={{
          marginLeft: isSidebarCollapsed ? '64px' : '280px',
          width: `calc(100vw - ${isSidebarCollapsed ? 64 : 280}px)`,
          transition: 'margin-left 200ms ease, width 200ms ease'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default HomePage;
