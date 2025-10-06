import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaChartBar,
  FaPlusCircle,
  FaCheckCircle,
  FaCogs,
  FaUsers,
  FaEye,
  FaCalendarAlt,
  FaTrash,
  FaPauseCircle,
  FaFileAlt,
  FaClock,
  FaHistory,
  FaCalendarPlus,
  FaSignOutAlt,
  FaSitemap,
  FaFlag,
  FaHandshake,
  FaChevronDown,
  FaChevronRight,
  FaBuilding,
  FaUserTie,
  FaProjectDiagram,
  FaMoneyBillWave,
  FaBoxes,
  FaTools,
} from 'react-icons/fa';
import '../styles/css-navbar.css';
import { pendingRequestReschedule } from '../api/api';

const categories = [
  {
    title: 'Corporate',
    icon: FaBuilding,
    children: [
      { path: '/home/dataViewer', label: 'Infographics', icon: FaChartBar },
      { path: '/home/dashboard', label: 'Dashboard', icon: FaHome },
      { path: '/home/calenderView', label: 'Mission Calendar', icon: FaCalendarAlt },
    ],
  },
  {
    title: 'Management',
    icon: FaUserTie,
    children: [
      { path: '/home/createBookings', label: 'New Bookings', icon: FaPlusCircle },
      { path: '/home/bookingList', label: 'Nonp Booking', icon: FaFileAlt },
      { path: '/home/missions', label: 'Completed Missions', icon: FaCheckCircle },
      { path: '/home/teamAllocation', label: 'Plantation Team Allocation', icon: FaUsers },
      { path: '/home/nonpTeamAllocation', label: 'NONP Team Allocation', icon: FaUsers },
      { path: '/home/proceedPlan', label: 'Edit Team Allocation', icon: FaCogs },
      { path: '/home/calenderView', label: 'Mission Calendar', icon: FaCalendarAlt },
      { path: '/home/deletePlan', label: 'Delete Plan', icon: FaTrash },
      { path: '/home/deactivatePlan', label: 'Deactive Plan', icon: FaPauseCircle },
      { path: '/home/reportReview', label: 'Review Reports', icon: FaFlag },
      { path: '/home/opsAsign', label: 'Ops Assignment', icon: FaSitemap },
      { path: '/home/reports/plantation', label: 'Reports', icon: FaFileAlt },
    ],
  },
  {
    title: 'OpsRoom',
    icon: FaProjectDiagram,
    children: [
      { path: '/home/missions', label: 'Completed Missions', icon: FaCheckCircle },
      { path: '/home/summeryView', label: 'Allocated Resources', icon: FaEye },
      { path: '/home/calenderView', label: 'Mission Calendar', icon: FaCalendarAlt },
      { path: '/home/dayEndProcess', label: 'Day End Process', icon: FaClock },
      { path: '/home/fieldHistory', label: 'Field History', icon: FaHistory },
      { path: '/home/managerRescheduler', label: 'Manager Request', icon: FaCalendarPlus, showPendingCount: true },
      { path: '/home/reports/ops', label: 'Reports', icon: FaFileAlt },
    ],
  },
  {
    title: 'Finance',
    icon: FaMoneyBillWave,
    children: [
      { path: '/home/brokers', label: 'Brokers', icon: FaHandshake },
      { path: '/home/reports/finance', label: 'Reports', icon: FaFileAlt },
    ],
  },
  {
    title: 'Inventory',
    icon: FaBoxes,
    children: [],
  },
  {
    title: 'Workshop',
    icon: FaTools,
    children: [],
  },
];

const menuAccessRules = {
  Developers: {
    condition: (userData) => userData.member_type === 'i' && userData.user_level === 'i',
    allowedPaths: [
      '/home/dashboard',
      '/home/dataViewer',
      '/home/createBookings',
      '/home/bookingList',
      '/home/missions',
      '/home/proceedPlan',
      '/home/summeryView',
      '/home/calenderView',
      '/home/deletePlan',
      '/home/deactivatePlan',
      '/home/reportSection',
      '/home/reports/finance',
      '/home/reports/ops',
      '/home/reports/plantation',
      '/home/reportReview',
      '/home/brokers',
      '/home/dayEndProcess',
      '/home/fieldHistory',
      '/home/managerRescheduler',
      '/home/teamAllocation',
      '/home/nonpTeamAllocation',
      '/home/opsAsign',
    ],
  },

  Management: {
    condition: (userData) =>
      userData.member_type === 'i' &&
      userData.user_level === 'm' &&
      ['ceo', 'md', 'mgr', 'dops'].includes(userData.job_role),
    allowedPaths: [
      '/home/dashboard',
      '/home/dataViewer',
      '/home/createBookings',
      '/home/missions',
      '/home/proceedPlan',
      '/home/calenderView',
      '/home/deletePlan',
      '/home/deactivatePlan',
      '/home/reportSection',
      '/home/reports/finance',
      '/home/reports/ops',
      '/home/reports/plantation',
      '/home/reportReview',
      '/home/dayEndProcess',
      '/home/fieldHistory',
      '/home/managerRescheduler',
      '/home/teamAllocation',
      // '/home/nonpTeamAllocation',
      '/home/opsAsign',
    ],
  },
  OPSRoom: {
    condition: (userData) =>
      userData.member_type === 'i' && userData.user_level === 'd' && userData.job_role === 'ops',
    allowedPaths: [
      '/home/dashboard',
      '/home/dataViewer',
      '/home/createBookings',
      '/home/missions',
      '/home/proceedPlan',
      '/home/calenderView',
      '/home/deactivatePlan',
      '/home/reportSection',
      '/home/reports/ops',
      '/home/dayEndProcess',
      '/home/fieldHistory',
      '/home/managerRescheduler',
      '/home/teamAllocation',
      // '/home/nonpTeamAllocation',
    ],
  },
  Plantations: {
    condition: (userData) =>
      userData.member_type === 'e' &&
      userData.user_level === 'm' &&
      ['ceo', 'mgr'].includes(userData.job_role),
    allowedPaths: [
      '/home/calenderView',
    ],
  },
  SectorManager: {
    condition: (userData) =>
      userData.member_type === 'i' && userData.user_level === 'm' && userData.job_role === 'sc',
    allowedPaths: [
      '/home/dataViewer',
      '/home/calenderView',
      '/home/reportSection',
      '/home/reports/plantation',
      '/home/fieldHistory',
    ],
  },
};

const getAllowedPaths = (userData) => {
  for (const role in menuAccessRules) {
    if (menuAccessRules[role].condition(userData)) {
      return menuAccessRules[role].allowedPaths;
    }
  }
  return [];
};

const LeftNavBar = ({ showSidebar = false, onClose = () => {}, onCollapseChange = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(localStorage.getItem('activeLink') || '/home/dashboard');
  const [pendingCount, setPendingCount] = useState(0);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('leftnav_collapsed') === '1');
  const [expandedCategories, setExpandedCategories] = useState(() => {
    return JSON.parse(localStorage.getItem('leftnav_expanded') || 'null') || {
      Corporate: true,
      Management: true,
      OpsRoom: true,
      Finance: true,
      Inventory: true,
      Workshop: true,
    };
  });

  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userType = userData.member_type_name || '';

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await pendingRequestReschedule();
        const data = Array.isArray(response) ? response : [];
        const pending = data.filter((request) => request.status === 'p');
        setPendingCount(pending.length);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        setPendingCount(0);
      }
    };
    fetchPendingCount();
  }, []);

  let companyLogo = '';
  let navbarColor = '';
  const url = 'https://drone-admin.kenilworthinternational.com/storage/image/logo/';
  const userGroupId = userData.group;
  if (userGroupId !== 0) {
    companyLogo = `${url}${userGroupId}.png`;
  } else {
    companyLogo = `${url}000.png`;
  }

  switch (userType) {
    case 'Internal User':
      navbarColor = 'darkblue';
      break;
    case 'manager':
      navbarColor = 'green';
      break;
    case 'pilot':
      navbarColor = 'blue';
      break;
    default:
      navbarColor = 'green';
  }

  useEffect(() => {
    setActiveLink(location.pathname);
    localStorage.setItem('activeLink', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('leftnav_collapsed', isCollapsed ? '1' : '0');
    onCollapseChange(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  useEffect(() => {
    localStorage.setItem('leftnav_expanded', JSON.stringify(expandedCategories));
  }, [expandedCategories]);

  const toggleCollapse = () => {
    console.log('Toggle collapse clicked, current state:', isCollapsed);
    setIsCollapsed(prev => {
      const newState = !prev;
      console.log('New collapsed state:', newState);
      return newState;
    });
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('activeLink');
    navigate('/login');
    setShowLogoutDialog(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const allowedPaths = getAllowedPaths(userData);

  return (
         <div
       className={`left-nav ${navbarColor} ${showSidebar ? 'show' : 'hide'} ${isCollapsed ? 'collapsed' : ''}`}
     >
             <div className="logo">
         {!isCollapsed && (
           <img src={companyLogo} alt="Logo" />
         )}
         {showSidebar && !isCollapsed && (
           <button className="close-btn" onClick={onClose} aria-label="Close menu">×</button>
         )}
         <button
           className="collapse-btn"
           onClick={toggleCollapse}
           aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
           title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
         >
           {isCollapsed ? '»' : '«'}
         </button>
       </div>
      <ul className="nav-list">
        {categories.map((category) => {
          const isExpanded = expandedCategories[category.title] ?? true;
          const toggleCategory = () =>
            setExpandedCategories((prev) => ({ ...prev, [category.title]: !isExpanded }));

          const visibleChildren = category.children.filter((child) => allowedPaths.includes(child.path));

          return (
            <li key={category.title} className="nav-category">
              <button
                className={`nav-category-btn ${isExpanded ? 'expanded' : 'collapsed'}`}
                onClick={toggleCategory}
                title={category.title}
                aria-expanded={isExpanded}
              >
                {!isCollapsed && (
                  <>
                    {category.icon && <category.icon className="nav-category-icon" />}
                    <span className="nav-category-text">{category.title}</span>
                  </>
                )}
                {isCollapsed && <span className="nav-category-text-collapsed">{category.title}</span>}
                <span className={`nav-category-chevron ${isExpanded ? 'open' : ''}`} aria-hidden="true">
                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </button>

              {isExpanded && visibleChildren.length > 0 && (
                <ul className="nav-sublist">
                  {visibleChildren.map((item) => (
                    <li key={item.path} className="nav-item">
                      <Link
                        to={item.path}
                        className={`nav-link ${activeLink === item.path ? 'active' : ''}`}
                        title={item.label}
                      >
                        <item.icon className="nav-icon" />
                        {!isCollapsed && (
                          <>
                            <span className="nav-text">{item.label}</span>
                            {item.showPendingCount && pendingCount > 0 && (
                              <span className="pending-count">{pendingCount}</span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
         <li className="nav-item">
           <button
             onClick={handleLogoutClick}
             className={`logout-btn ${activeLink === '/logout' ? 'active' : ''}`}
             title="Logout"
           >
             <FaSignOutAlt className="nav-icon" />
             {!isCollapsed && <span className="nav-text">Logout</span>}
           </button>
         </li>
       </ul>

      {showLogoutDialog && (
        <div className="logout-dialog-overlay">
          <div className="logout-dialog">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="dialog-buttons">
              <button onClick={handleCancelLogout} className="cancel-btn">Cancel</button>
              <button onClick={handleConfirmLogout} className="confirm-btn">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftNavBar;