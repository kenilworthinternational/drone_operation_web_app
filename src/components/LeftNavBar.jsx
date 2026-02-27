import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaCloudSunRain,
} from 'react-icons/fa';
import navbarCategories from '../config/navbarCategories';
import '../styles/css-navbar.css';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { baseApi } from '../api/services/allEndpoints';
import { logout } from '../store/slices/authSlice';
import { useQueryClient } from '@tanstack/react-query';
import {
  getCategoryVisibility,
  getAllowedPaths,
  getUserData,
  getNavbarColor
} from '../utils/authUtils';
import { useGetMyPermissionsQuery } from '../api/services NodeJs/featurePermissionsApi';

const categories = navbarCategories;

const LeftNavBar = ({ showSidebar = false, onClose = () => { }, onCollapseChange = () => { } }) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  // Removed Redux permissions - now using only backend permissions from Access Control Management
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(localStorage.getItem('activeLink') || '/home/create');
  const [pendingCount, setPendingCount] = useState(0);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(() => {
    return JSON.parse(localStorage.getItem('leftnav_expanded') || 'null') || {
      Corporate: true,
      'Planning and Monitoring': true,
      Management: true,
      OpsRoom: true,
      Finance: true,
      Inventory: true,
      Workshop: true,
      'Fleet Management': true,
      'Stock and Assets Management': true,
      'HR and Admin': true,
      'ICT - System Admin': true,
    };
  });
  const [expandedSubItems, setExpandedSubItems] = useState(() => {
    return JSON.parse(localStorage.getItem('leftnav_expanded_subitems') || 'null') || {
      'Finance Approvals': true,
    };
  });

  const userData = getUserData();
  const userType = userData.member_type_name || '';

  // Fetch permissions from backend API
  const { data: backendPermissions = {}, isLoading: loadingPermissions } = useGetMyPermissionsQuery(undefined, {
    skip: !userData?.id,
  });

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
  // Ensure HTTPS is used for logo URLs
  const url = 'https://drone-admin.kenilworthinternational.com/storage/image/logo/';
  const userGroupId = userData.group;
  if (userGroupId !== 0) {
    companyLogo = `${url}${userGroupId}.png`;
  } else {
    companyLogo = `${url}000.png`;
  }

  navbarColor = getNavbarColor(userData);

  useEffect(() => {
    setActiveLink(location.pathname);
    localStorage.setItem('activeLink', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('leftnav_expanded', JSON.stringify(expandedCategories));
  }, [expandedCategories]);

  useEffect(() => {
    localStorage.setItem('leftnav_expanded_subitems', JSON.stringify(expandedSubItems));
  }, [expandedSubItems]);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    // Clear RTK Query cache before logout
    dispatch(baseApi.util.resetApiState());
    // Clear React Query cache
    queryClient.clear();
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

  // Process backend permissions from Access Control Management
  // Backend returns: { categories: { category: [featureCodes] }, paths: { path: true/false } }
  // Or old format: { category: [featureCodes] } for backward compatibility
  const backendCategoryPermissions = useMemo(() => {
    if (!backendPermissions || Object.keys(backendPermissions).length === 0) {
      return {};
    }

    // Handle new format: { categories: {...}, paths: {...} }
    let categoriesData = {};
    if (backendPermissions.categories) {
      categoriesData = backendPermissions.categories;
    } else {
      // Handle old format: { category: [featureCodes] } - categories are at root level
      categoriesData = backendPermissions;
    }

    // Convert backend format to boolean format for getCategoryVisibility
    // If category array has items, user has access
    const categoryPerms = {};
    Object.keys(categoriesData).forEach(category => {
      // Skip 'paths' key if it exists at root level
      if (category === 'paths') return;

      const featureCodes = categoriesData[category];
      categoryPerms[category] = Array.isArray(featureCodes) && featureCodes.length > 0;
    });
    return categoryPerms;
  }, [backendPermissions]);

  // Extract path-level permissions from backend response
  const backendPathPermissions = useMemo(() => {
    if (!backendPermissions || Object.keys(backendPermissions).length === 0) {
      return {};
    }

    // Handle new format: { categories: {...}, paths: {...} }
    if (backendPermissions.paths) {
      return backendPermissions.paths;
    }

    // Old format doesn't have separate paths, return empty
    return {};
  }, [backendPermissions]);

  // Use ONLY backend permissions - no Redux fallback
  // Only developers get all access automatically
  const categoryVisibility = getCategoryVisibility(userData, backendCategoryPermissions, categories);
  const allowedPaths = getAllowedPaths(categoryVisibility, backendPathPermissions, userData);

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
          const visibleChildren = category.children.filter((child) => {
            if (child.subItems && child.subItems.length > 0) {
              return child.subItems.some((sub) => allowedPaths.includes(sub.path));
            }
            return allowedPaths.includes(child.path);
          });

          // Default to expanded only if category has visible children, otherwise collapsed
          const defaultExpanded = visibleChildren.length > 0;
          const isExpanded = expandedCategories[category.title] ?? defaultExpanded;
          const toggleCategory = () =>
            setExpandedCategories((prev) => ({ ...prev, [category.title]: !isExpanded }));

          // Show category if:
          // 1. Category is developer-only and user is a developer, OR
          // 2. Category has visibility (navbar permission), OR
          // 3. Any child path has permission (path-level permission)
          // This allows categories to show even without category-level permissions
          const isDeveloper = userData?.member_type === 'i' && userData?.user_level === 'i' && userData?.job_role === 'dev';
          const isDeveloperOnlyCategory = category.developerOnly === true;

          // If category is developer-only, only show to developers
          if (isDeveloperOnlyCategory && !isDeveloper) {
            return null;
          }

          const hasCategoryVisibility = categoryVisibility[category.title] === true;
          const hasAnyPathPermission = visibleChildren.length > 0;

          // Don't render category if no visible children and no category visibility
          if (!hasCategoryVisibility && !hasAnyPathPermission) {
            return null;
          }

          return (
            <li key={category.title} className="nav-category">
              {category.path && category.children.length === 0 ? (
                // If category has a direct path and no children, make it a link
                <Link
                  to={category.path}
                  className={`nav-category-btn ${activeLink === category.path || activeLink.startsWith(category.path + '/') ? 'active' : ''}`}
                  title={category.title}
                >
                  {category.icon && <category.icon className="nav-category-icon" />}
                  <span className="nav-category-text">{category.title}</span>
                </Link>
              ) : (
                // Otherwise, make it a collapsible button
                <button
                  className={`nav-category-btn ${isExpanded ? 'expanded' : 'collapsed'}`}
                  onClick={toggleCategory}
                  title={category.title}
                  aria-expanded={isExpanded}
                >
                  {category.icon && <category.icon className="nav-category-icon" />}
                  <span className="nav-category-text">{category.title}</span>
                  {/* Always show chevron for categories without direct path, even if no children */}
                  <span className={`nav-category-chevron ${isExpanded ? 'open' : ''}`} aria-hidden="true">
                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                </button>
              )}

              {isExpanded && visibleChildren.length > 0 && (
                <ul className="nav-sublist">
                  {visibleChildren.map((item) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    if (hasSubItems) {
                      const visibleSubItems = item.subItems.filter((sub) => allowedPaths.includes(sub.path));
                      if (visibleSubItems.length === 0) {
                        return null;
                      }
                      const isSubExpanded = expandedSubItems[item.label] ?? true;
                      const toggleSubItem = (e) => {
                        e.stopPropagation();
                        setExpandedSubItems((prev) => ({ ...prev, [item.label]: !isSubExpanded }));
                      };
                      const isSubActive = visibleSubItems.some(
                        (sub) =>
                          activeLink === sub.path ||
                          activeLink.startsWith(sub.path + '/')
                      ) || (item.path && (activeLink === item.path || activeLink.startsWith(item.path + '/')));
                      return (
                        <li key={`${item.label}`} className={`nav-item nav-subgroup ${isSubActive ? 'active' : ''}`}>
                          <div className="nav-subgroup-header">
                            {item.path ? (
                              <Link
                                to={item.path}
                                className="nav-subgroup-link"
                                title={item.label}
                                onClick={() => {
                                  // Auto-expand when navigating to parent item
                                  if (!isSubExpanded) {
                                    setExpandedSubItems((prev) => ({ ...prev, [item.label]: true }));
                                  }
                                }}
                              >
                                <item.icon className="nav-icon" />
                                <span className="nav-text">{item.label}</span>
                              </Link>
                            ) : (
                              <>
                                <item.icon className="nav-icon" />
                                <span className="nav-text">{item.label}</span>
                              </>
                            )}
                            <button
                              className="nav-subgroup-toggle"
                              onClick={toggleSubItem}
                              title={`${isSubExpanded ? 'Collapse' : 'Expand'} ${item.label}`}
                              aria-expanded={isSubExpanded}
                              aria-label={`${isSubExpanded ? 'Collapse' : 'Expand'} ${item.label}`}
                            >
                              <span className={`nav-subgroup-chevron ${isSubExpanded ? 'open' : ''}`} aria-hidden="true">
                                {isSubExpanded ? <FaChevronDown /> : <FaChevronRight />}
                              </span>
                            </button>
                          </div>
                          {isSubExpanded && (
                            <ul className="nav-subgroup-list">
                              {visibleSubItems.map((subItem) => {
                                const isActive =
                                  activeLink === subItem.path ||
                                  activeLink.startsWith(subItem.path + '/');
                                return (
                                  <li key={subItem.path} className="nav-item">
                                    <Link
                                      to={subItem.path}
                                      className={`nav-link ${isActive ? 'active' : ''}`}
                                      title={subItem.label}
                                    >
                                      <subItem.icon className="nav-icon" />
                                      <span className="nav-text">{subItem.label}</span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    }
                    const activeAliases = {
                      '/home/workflowDashboard': ['/home/opsroomPlanCalendar', '/home/requestsQueue', '/home/requestProceed', '/home/dayEndProcess', '/home/todayPlans', '/home/emergencyMoving', '/home/fieldHistory', '/home/reports/ops', '/home/fieldSizeAdjustments', '/home/opsAsign'],
                      '/home/monitoringDashboard': [],
                      '/home/dataViewer': ['/home/dataViewer/chart-breakdown'],
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
                    )
                  })}
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