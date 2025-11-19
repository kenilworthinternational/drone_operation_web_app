import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaChartBar,
  FaPlusCircle,
  FaUsers,
  FaCalendarAlt,
  FaPauseCircle,
  FaFileAlt,
  FaClock,
  FaHistory,
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
  FaMoneyBill,
  FaBoxes,
  FaTools,
  FaUserShield,
  FaClipboardList,
  FaUserCog,
  FaKey,
  FaCloudSunRain,
} from 'react-icons/fa';
import '../styles/css-navbar.css';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { baseApi } from '../api/services/allEndpoints';
import { logout } from '../store/slices/authSlice';

const categories = [
  {
    title: 'Corporate',
    icon: FaBuilding,
    children: [
      { path: '/home/dataViewer', label: 'Infographics', icon: FaChartBar },
      { path: '/home/dashboard', label: 'Dashboard', icon: FaHome },
      { path: '/home/calenderView/corporate', label: 'Mission Calendar', icon: FaCalendarAlt },
      { path: '/home/reports/corporate', label: 'Reports', icon: FaFileAlt },
    ],
  },
  {
    title: 'Management',
    icon: FaUserTie,
    children: [
      { path: '/home/createBookings', label: 'Booking Creation', icon: FaPlusCircle },
      { path: '/home/bookingList', label: 'Nonp Booking', icon: FaFileAlt },
      // { path: '/home/missions', label: 'Completed Missions', icon: FaCheckCircle },
      { path: '/home/teamAllocation', label: 'Plantation Team Allocation', icon: FaUsers },
      { path: '/home/nonpTeamAllocation', label: 'NONP Team Allocation', icon: FaUsers },
      // { path: '/home/proceedPlan', label: 'Edit Team Allocation', icon: FaCogs },
      { path: '/home/reports/management', label: 'Reports', icon: FaFileAlt },
      { path: '/home/calenderView/management', label: 'Mission Calendar', icon: FaCalendarAlt },
      { path: '/home/earnings', label: 'Pilot Earnings', icon: FaMoneyBill },
      { path: '/home/reportReview', label: 'Review Reports', icon: FaFlag },
      { path: '/home/opsAsign', label: 'Ops Assignment', icon: FaSitemap },
      { path: '/home/deactivatePlan', label: 'Deactive Plan', icon: FaPauseCircle },
    ],
  },
  {
    title: 'OpsRoom',
    icon: FaProjectDiagram,
    children: [
      { path: '/home/workflowDashboard', label: 'Workflow Dashboard', icon: FaProjectDiagram },
      // { path: '/home/missions', label: 'Completed Missions', icon: FaCheckCircle },
      // { path: '/home/summeryView', label: 'Allocated Resources', icon: FaEye },
      { path: '/home/calenderView/opsroom', label: 'Mission Calendar', icon: FaCalendarAlt },
      { path: '/home/dayEndProcess', label: 'Day End Process', icon: FaClock },
      { path: '/home/fieldHistory', label: 'Field History', icon: FaHistory },
      // { path: '/home/managerRescheduler', label: 'Manager Request', icon: FaCalendarPlus, showPendingCount: true },
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
  // {
  //   title: 'ICT - System Admin',
  //   icon: FaUserCog,
  //   children: [
  //     { path: '/home/ict/system-admin/users', label: 'Users', icon: FaUsers },
  //     { path: '/home/ict/system-admin/auth-controls', label: 'Auth Controls', icon: FaKey },
  //   ],
  // },
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
  {
    title: 'HR and Admin',
    icon: FaUserShield,
    children: [
      { path: '/home/assetsManagement', label: 'Assets Management', icon: FaBoxes },
      { path: '/home/employeeRegistration', label: 'Employee Registration', icon: FaUserTie },
      { path: '/home/employees', label: 'Employees', icon: FaUsers },
      { path: '/home/jdManagement', label: 'JD Management', icon: FaClipboardList },
      { path: '/home/employeeAssignment', label: 'Employee Assignment', icon: FaUserTie },
    ],
  },
];

// Simplified category visibility based on job roles
const getCategoryVisibility = (userData, permissions) => {
  const jobRole = userData.job_role || '';
  const memberType = userData.member_type || '';
  const normalizedRole = String(jobRole).toLowerCase();
  const categories = Object.keys(permissions || {});

  // Developers get everything
  if (memberType === 'i' && userData.user_level === 'i') {
    return categories.reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {});
  }

  // Only internal members see the categories
  if (memberType !== 'i') {
    return categories.reduce((acc, category) => {
      acc[category] = false;
      return acc;
    }, {});
  }

  return categories.reduce((acc, category) => {
    const allowedRoles = permissions[category] || [];
    acc[category] = allowedRoles.includes(normalizedRole);
    return acc;
  }, {});
};

const getAllowedPaths = (visibility = {}) => {
  const allowedPaths = [];

  // Top-level paths (accessible to all)
  allowedPaths.push('/home/create');

  // Corporate paths
  if (visibility.Corporate) {
    allowedPaths.push(
      '/home/dataViewer',
      '/home/dashboard',
      '/home/calenderView/corporate',
      '/home/reports/corporate'
    );
  }

  // Management paths
  if (visibility.Management) {
    allowedPaths.push(
      '/home/createBookings',
      '/home/bookingList',
      '/home/missions',
      '/home/teamAllocation',
      '/home/nonpTeamAllocation',
      '/home/proceedPlan',
      '/home/reports/management',
      '/home/reports/ops',
      '/home/reports/finance',
      '/home/reports/plantation',
      '/home/calenderView/management',
      '/home/earnings',
      '/home/reportReview',
      '/home/opsAsign',
      '/home/deactivatePlan'
    );
  }

  // OpsRoom paths
  if (visibility.OpsRoom) {
    allowedPaths.push(
      '/home/workflowDashboard',
      '/home/missions',
      '/home/summeryView',
      '/home/calenderView/opsroom',
      '/home/dayEndProcess',
      '/home/fieldHistory',
      // '/home/managerRescheduler',
      '/home/reports/ops'
    );
  }

  // Finance paths
  if (visibility.Finance) {
    allowedPaths.push(
      '/home/brokers',
      '/home/reports/finance'
    );
  }

  // Inventory paths
  if (visibility.Inventory) {
    allowedPaths.push(
      // Add inventory paths here when ready
    );
  }

  // Workshop paths
  if (visibility.Workshop) {
    allowedPaths.push(
      // Add workshop paths here when ready
    );
  }

  // HR and Admin paths
  if (visibility['HR and Admin']) {
    allowedPaths.push(
      '/home/assetsManagement',
      '/home/employeeRegistration',
      '/home/employees',
      '/home/jdManagement',
      '/home/employeeAssignment'
    );
  }

  if (visibility['ICT - System Admin']) {
    allowedPaths.push(
      '/home/ict/system-admin/users',
      '/home/ict/system-admin/auth-controls'
    );
  }

  return allowedPaths;
};

const LeftNavBar = ({ showSidebar = false, onClose = () => {}, onCollapseChange = () => {} }) => {
  const dispatch = useAppDispatch();
  const permissions = useAppSelector((state) => state.permissions.categories);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(localStorage.getItem('activeLink') || '/home/create');
  const [pendingCount, setPendingCount] = useState(0);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(() => {
    return JSON.parse(localStorage.getItem('leftnav_expanded') || 'null') || {
      Corporate: true,
      Management: true,
      OpsRoom: true,
      Finance: true,
      Inventory: true,
      Workshop: true,
      'HR and Admin': true,
      'ICT - System Admin': true,
    };
  });

  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userType = userData.member_type_name || '';

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const result = await dispatch(baseApi.endpoints.getPendingRescheduleRequests.initiate());
      const response = result.data;
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
    localStorage.setItem('leftnav_expanded', JSON.stringify(expandedCategories));
  }, [expandedCategories]);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    // Dispatch logout action to clear Redux state
    dispatch(logout());
    // Clear additional localStorage items
    localStorage.removeItem('activeLink');
    localStorage.removeItem('leftnav_expanded');
    // Navigate to login page
    navigate('/login');
    setShowLogoutDialog(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const categoryVisibility = getCategoryVisibility(userData, permissions);
  const allowedPaths = getAllowedPaths(categoryVisibility);

  return (
         <div
      className={`left-nav ${navbarColor} ${showSidebar ? 'show' : 'hide'}`}
    >
            <div className="logo">
        <img src={companyLogo} alt="Logo" />
        {showSidebar && (
          <button className="close-btn" onClick={onClose} aria-label="Close menu">×</button>
        )}
      </div>
     <ul className="nav-list">
       {/* Top-level menu item - Forecast (accessible to all) */}
       <li className="nav-item">
         <Link
           to="/home/create"
           className={`nav-link ${activeLink === '/home/create' ? 'active' : ''}`}
           title="Forecast"
         >
           <FaCloudSunRain className="nav-icon" />
           <span className="nav-text">Forecast</span>
         </Link>
       </li>
       {categories.map((category) => {
         // Skip category if user doesn't have access
         if (!categoryVisibility[category.title]) {
           return null;
         }

         const isExpanded = expandedCategories[category.title] ?? true;
         const toggleCategory = () =>
           setExpandedCategories((prev) => ({ ...prev, [category.title]: !isExpanded }));

         const visibleChildren = category.children.filter((child) => allowedPaths.includes(child.path));

         // Don't render category if no visible children
         if (visibleChildren.length === 0) {
           return null;
         }

         return (
           <li key={category.title} className="nav-category">
              <button
                className={`nav-category-btn ${isExpanded ? 'expanded' : 'collapsed'}`}
                onClick={toggleCategory}
                title={category.title}
                aria-expanded={isExpanded}
              >
                {category.icon && <category.icon className="nav-category-icon" />}
                <span className="nav-category-text">{category.title}</span>
                <span className={`nav-category-chevron ${isExpanded ? 'open' : ''}`} aria-hidden="true">
                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </button>

              {isExpanded && visibleChildren.length > 0 && (
                <ul className="nav-sublist">
                  {visibleChildren.map((item) => {
                    const activeAliases = {
                      '/home/workflowDashboard': ['/home/opsroomPlanCalendar', '/home/requestsQueue', '/home/requestProceed'],
                    };
                    const aliases = activeAliases[item.path] || [];
                    const isActive = (
                      activeLink === item.path ||
                      activeLink.startsWith(item.path + '/') ||
                      aliases.includes(activeLink) ||
                      aliases.some((a) => activeLink.startsWith(a + '/'))
                    );
                    return (
                    <li key={item.path} className="nav-item">
                      <Link
                        to={item.path}
                        className={`nav-link ${isActive ? 'active' : ''}`}
                        title={item.label}
                      >
                        <item.icon className="nav-icon" />
                        <span className="nav-text">{item.label}</span>
                        {item.showPendingCount && pendingCount > 0 && (
                          <span className="pending-count">{pendingCount}</span>
                        )}
                      </Link>
                    </li>
                  )})}
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
             <span className="nav-text">Logout</span>
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