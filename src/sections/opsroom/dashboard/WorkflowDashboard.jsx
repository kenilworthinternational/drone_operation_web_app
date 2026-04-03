import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { FaSync, FaBell, FaTimes, FaCheck, FaCheckCircle, FaCircle, FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';
import {
  useGetMissionsPendingPaymentQuery,
  useGetDroneUnlockingQueueQuery,
  useGetResourceAssignmentCountQuery,
} from '../../../api/services NodeJs/pilotAssignmentApi';
import { useGetPlansPendingDayEndCountQuery } from '../../../api/services NodeJs/dayEndProcessApi';
import { useGetTodayDjiImagesCountQuery } from '../../../api/services NodeJs/djiImagesApi';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsDisplayedMutation,
  useLogNotificationActionMutation,
} from '../../../api/services NodeJs/notificationsApi';
import {
  getCategoryVisibility,
  getUserData,
  isInternalDeveloper,
} from '../../../utils/authUtils';
import {
  useGetMyPermissionsQuery,
} from '../../../api/services NodeJs/featurePermissionsApi';
import { FEATURE_CODES } from '../../../utils/featurePermissions';
import '../../../styles/workflowDashboard-com.css';

const WorkflowDashboard = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState('2025.03.03 - 2025.03.07');
  const [selectedAction, setSelectedAction] = useState('Spray');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const go = (pathname) => navigate({ pathname, search: routerLocation.search });

  // Get user data and permissions
  const userData = getUserData();
  const permissions = useAppSelector((state) => state.permissions?.categories);
  
  // Define categories for visibility check (same as LeftNavBar)
  const categories = [
    { title: 'OpsRoom' },
    { title: 'Field Operations Wing' },
    { title: 'Strategic Planning and Monitoring wing' },
    { title: 'Operation Digitalization & Digital Monitoring & Evaluation Wing' },
    { title: 'Finance' },
    { title: 'ICT Wing' },
    { title: 'Inventory' },
    { title: 'Workshop' },
    { title: 'Human Resource Management' },
    { title: 'Administration Wing' },
  ];
  
  const categoryVisibility = getCategoryVisibility(userData, permissions, categories);
  const isOpsRoomUser = categoryVisibility.OpsRoom;
  const isDeveloper = isInternalDeveloper(userData);
  
  // Get user ID to track user changes
  const userId = userData?.id || null;

  // Get feature permissions from backend
  const { data: featurePermissionsData = {} } = useGetMyPermissionsQuery(undefined, {
    skip: !userId,
  });

  // Check feature permissions
  // Backend returns permissions as: { categories: {...}, paths: {...}, features: {...} }
  // Features are returned as: { featureCode: true/false }
  const checkFeatureAccess = (featureCode) => {
    if (isDeveloper) return true;
    if (!featurePermissionsData || typeof featurePermissionsData !== 'object') return false;
    
    // Check features object first (new format)
    if (featurePermissionsData.features && featurePermissionsData.features[featureCode] === true) {
      return true;
    }
    
    // Also check categories for backward compatibility (old format)
    const categories = featurePermissionsData.categories || featurePermissionsData;
    for (const category in categories) {
      if (category === 'paths' || category === 'features') continue; // Skip these keys
      const categoryData = categories[category];
      if (Array.isArray(categoryData) && categoryData.includes(featureCode)) {
        return true;
      }
    }
    return false;
  };

  const hasNotificationsFeature = checkFeatureAccess(FEATURE_CODES.WORKFLOW_NOTIFICATIONS);
  const hasDashboardControlsFeature = checkFeatureAccess(FEATURE_CODES.WORKFLOW_DASHBOARD_CONTROLS);
  
  // Fetch notifications for users with notifications feature access
  const { data: unreadCountData, refetch: refetchUnreadCount } = useGetUnreadCountQuery(undefined, {
    skip: !hasNotificationsFeature,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const unreadCount = unreadCountData?.data?.count || 0;
  
  // Fetch all notifications (both read and unread) - get enough to ensure we have unread ones
  // We'll sort and filter on the frontend to show unread first, then latest 3
  const { data: allNotificationsData, refetch: refetchAllNotifications } = useGetNotificationsQuery(
    {}, // No filters - get all notifications (read and unread)
    { skip: !hasNotificationsFeature }
  );
  
  // For the modal, fetch all notifications separately
  const { data: modalNotificationsData, refetch: refetchModalNotifications } = useGetNotificationsQuery(
    {}, // No filters - get all notifications (read and unread)
    { skip: !showNotificationsModal || !hasNotificationsFeature }
  );
  
  // Refetch notifications when user changes (userId changes) or when unreadCount changes
  useEffect(() => {
    if (hasNotificationsFeature && userId) {
      refetchUnreadCount();
      refetchAllNotifications();
      if (showNotificationsModal) {
        refetchModalNotifications();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, unreadCount, hasNotificationsFeature]); // Refetch when user ID or unread count changes
  
  const [markAsRead] = useMarkNotificationAsDisplayedMutation();
  const [logNotificationAction] = useLogNotificationActionMutation();
  
  // Helper function to parse date and time for sorting
  const parseDateTime = (notification) => {
    const date = notification.date ? (notification.date.includes('T') ? notification.date.split('T')[0] : notification.date) : '';
    const time = notification.time || '00:00:00';
    return `${date} ${time}`;
  };
  
  // Sort all notifications: unread first, then by time (latest first), then take top 3
  const allNotificationsRaw = allNotificationsData?.data || [];
  const sortedAllNotifications = [...allNotificationsRaw].sort((a, b) => {
    // First, prioritize unread (displayed === 0) over read (displayed === 1)
    const aDisplayed = a.displayed === 0 || a.displayed === '0' ? 0 : 1;
    const bDisplayed = b.displayed === 0 || b.displayed === '0' ? 0 : 1;
    
    if (aDisplayed !== bDisplayed) {
      return aDisplayed - bDisplayed; // 0 (unread) comes before 1 (read)
    }
    
    // If both have same read status, sort by time (latest first)
    const datetimeA = parseDateTime(a);
    const datetimeB = parseDateTime(b);
    
    return datetimeB.localeCompare(datetimeA);
  });
  
  // Take top 3 notifications (unread first, then latest)
  const recentNotifications = sortedAllNotifications.slice(0, 3);
  
  // For modal: sort all notifications with unread first, then by time (latest first)
  const modalNotificationsRaw = modalNotificationsData?.data || [];
  const allNotifications = [...modalNotificationsRaw].sort((a, b) => {
    // First, prioritize unread (displayed === 0) over read (displayed === 1)
    const aDisplayed = a.displayed === 0 || a.displayed === '0' ? 0 : 1;
    const bDisplayed = b.displayed === 0 || b.displayed === '0' ? 0 : 1;
    
    if (aDisplayed !== bDisplayed) {
      return aDisplayed - bDisplayed; // 0 (unread) comes before 1 (read)
    }
    
    // If both have same read status, sort by time (latest first)
    const datetimeA = parseDateTime(a);
    const datetimeB = parseDateTime(b);
    
    return datetimeB.localeCompare(datetimeA);
  });
  
  // Format notification date and time
  const formatNotificationDateTime = (date, time) => {
    if (!date) return '';
    
    // If date is in ISO format (2025-12-18T18:30:00.000Z), extract just the date part
    let formattedDate = date;
    if (date.includes('T')) {
      formattedDate = date.split('T')[0];
    }
    
    // Combine date and time
    return time ? `${formattedDate} ${time}` : formattedDate;
  };
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap();
      if (isOpsRoomUser) {
        // Refetch unread count and all notifications
        await refetchUnreadCount();
        refetchAllNotifications();
        // Refetch modal notifications if modal is open
        if (showNotificationsModal) {
          refetchModalNotifications();
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleShowAll = async () => {
    // Log the "Show All" action
    try {
      await logNotificationAction({
        action: 'show_all',
        additionalData: {
          unreadCount: unreadCount,
          totalNotifications: allNotifications.length
        }
      }).unwrap();
    } catch (error) {
      console.error('Error logging show all action:', error);
      // Don't block the action if logging fails
    }
    
    setShowNotificationsModal(true);
    // The query will automatically fetch when skip becomes false
  };

  // Get tomorrow's date for manager approval queue
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Get today's date for resource assignment queue
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Use React Query to fetch counts with intelligent caching and deduplication
  const { data: counts, isLoading, refetch: refetchCounts } = useQuery({
    queryKey: ['workflowDashboard', 'counts'],
    queryFn: async () => {
      const tomorrowDate = getTomorrowDate();
      const todayDate = getTodayDate();
      // Fetch all counts in parallel (faster than sequential)
      const [adhocResult, rescheduleResult, plansResult, todayPlansResult] = await Promise.all([
        dispatch(baseApi.endpoints.getPendingAdHocRequests.initiate()),
        dispatch(baseApi.endpoints.getPendingRescheduleRequestsByManager.initiate()),
        dispatch(baseApi.endpoints.getPlansByDate.initiate(tomorrowDate)),
        dispatch(baseApi.endpoints.getPlansByDate.initiate(todayDate)),
      ]);
      const adhocData = adhocResult.data;
      const rescheduleData = rescheduleResult.data;
      const plansData = plansResult.data;
      const todayPlansData = todayPlansResult.data;

      const parsePlansArray = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object' && data.status === 'true') {
          return Object.keys(data)
            .filter(key => !isNaN(key) && key !== 'status' && key !== 'count')
            .map(key => data[key]);
        }
        if (typeof data === 'object') {
          return Object.keys(data)
            .filter(key => !isNaN(key))
            .map(key => data[key]);
        }
        return [];
      };

      // Filter plans for manager approval: activated=1 AND manager_approval=0
      const plansArray = parsePlansArray(plansData);
      let managerApprovalCount = 0;
      
      if (plansArray.length > 0) {
        managerApprovalCount = plansArray.filter(plan => {
          const activated = Number(plan.activated) === 1 || plan.activated === '1';
          const managerApproval = Number(plan.manager_approval) === 0 || 
                                  plan.manager_approval === '0' || 
                                  plan.manager_approval === null ||
                                  plan.manager_approval === undefined;
          return activated && managerApproval;
        }).length;
      }

      // Count today's active plans with no operator assigned
      const todayPlansArray = parsePlansArray(todayPlansData);
      let opsAssignPendingCount = 0;
      if (todayPlansArray.length > 0) {
        opsAssignPendingCount = todayPlansArray.filter(plan => {
          const activated = Number(plan.activated) === 1 || plan.activated === '1';
          const noOperator = !plan.operator;
          return activated && noOperator;
        }).length;
      }

      // Process and return the counts
      return {
        adhoc: adhocData?.status === 'true' ? (adhocData.request_count || 0) : 0,
        reschedule: rescheduleData?.requests?.length || 0,
        managerApproval: managerApprovalCount,
        opsAssignPending: opsAssignPendingCount,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    gcTime: 2 * 60 * 1000, // 2 minutes - keep in cache for 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes (max refresh interval)
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    refetchOnMount: false, // Don't refetch on component remount if data is fresh
    retry: 2, // Retry 2 times on failure (helps with 429 errors)
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s (helps with rate limiting)
      return Math.min(1000 * 2 ** attemptIndex, 10000);
    },
  });

  // Get pending payment missions count
  const { data: pendingPaymentData, refetch: refetchPendingPayment } = useGetMissionsPendingPaymentQuery();
  const pendingPaymentCount = pendingPaymentData?.data?.length || 0;

  // Get drone unlocking queue count
  const { data: droneUnlockingData, refetch: refetchDroneUnlocking } = useGetDroneUnlockingQueueQuery();
  const droneUnlockingCount = (droneUnlockingData?.data?.plans?.length || 0) + 
                              (droneUnlockingData?.data?.missions?.length || 0);

  // Get plans pending day end process count
  const { data: dayEndProcessData, refetch: refetchDayEndProcess } = useGetPlansPendingDayEndCountQuery();
  const dayEndProcessCount = dayEndProcessData?.data?.count || 0;

  // Get DJI images uploaded today count
  const { data: djiImagesCountData, refetch: refetchDjiImages } = useGetTodayDjiImagesCountQuery();
  const djiImagesCount = djiImagesCountData?.data?.count || 0;

  // Get resource assignment count for tomorrow
  const tomorrowDate = getTomorrowDate();
  const { data: resourceAssignmentData, refetch: refetchResourceAssignment } = useGetResourceAssignmentCountQuery(tomorrowDate);
  const resourceAssignmentCount = resourceAssignmentData?.data?.total || 0;

  // Refresh all counts handler
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      // Refetch all queries in parallel
      await Promise.all([
        refetchCounts(), // Use refetch function instead of invalidateQueries
        refetchPendingPayment(),
        refetchDroneUnlocking(),
        refetchDayEndProcess(),
        refetchDjiImages(),
        refetchResourceAssignment(),
      ]);
    } catch (error) {
      console.error('Error refreshing counts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh all counts when component mounts or when navigating back to this page
  useEffect(() => {
    // Refetch all queries when the component mounts or when location changes to this page
    const refreshAllData = async () => {
      try {
        await Promise.all([
          refetchCounts(),
          refetchPendingPayment(),
          refetchDroneUnlocking(),
          refetchDayEndProcess(),
          refetchDjiImages(),
          refetchResourceAssignment(),
        ]);
      } catch (error) {
        console.error('Error auto-refreshing counts:', error);
      }
    };

    // Only refresh if we're on the workflow dashboard route
    if (routerLocation.pathname === '/home/workflowDashboard') {
      refreshAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerLocation.pathname]); // Refresh when route changes to this page

  // Extract counts with fallback to 0
  const adhocCount = counts?.adhoc || 0;
  const rescheduleCount = counts?.reschedule || 0;
  const managerApprovalCount = counts?.managerApproval || 0;
  const opsAssignCount = counts?.opsAssignPending || 0;

  return (
    <div className="workflow-dashboard-workflowDashboard">
      {/* Header Section */}
      <div className="dashboard-header-workflowDashboard">
        <div className="header-content-workflowDashboard">
          <div className="header-controls-workflowDashboard">
            {/* Show notifications for users with notifications feature access */}
            {hasNotificationsFeature && (
              <div className="notifications-section-workflowDashboard">
                <div className="notifications-header-workflowDashboard">
                  <div className="notifications-title-workflowDashboard">
                    <FaBell className="notifications-icon-workflowDashboard" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="unread-badge-workflowDashboard">{unreadCount}</span>
                    )}
                  </div>
                  <button
                    className="show-all-btn-workflowDashboard"
                    onClick={handleShowAll}
                  >
                    View All
                  </button>
                </div>
                
                {recentNotifications.length > 0 ? (
                  <div className="notifications-content-workflowDashboard">
                    <div className="notifications-list-workflowDashboard">
                      {recentNotifications.map((notification) => {
                        const isRead = notification.displayed === 1;
                        return (
                          <div key={notification.id} className="notification-item-workflowDashboard">
                            <div className="notification-text-workflowDashboard">
                              <p className="notification-description-workflowDashboard">{notification.description}</p>
                              <span className="notification-date-workflowDashboard">
                                {formatNotificationDateTime(notification.date, notification.time)}
                              </span>
                            </div>
                            {isRead ? (
                              <div className="notification-read-indicator-workflowDashboard" title="Already read">
                                <FaEnvelopeOpen className="read-icon-workflowDashboard" />
                              </div>
                            ) : (
                              <button
                                className="notification-read-btn-workflowDashboard"
                                onClick={() => handleMarkAsRead(notification.id)}
                                title="Mark as read"
                              >
                                <FaEnvelope className="unread-icon-workflowDashboard" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="no-notifications-workflowDashboard">
                    <p>No unread notifications</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Show dashboard controls (date range selector and revenue box) for users with dashboard controls feature access */}
            {hasDashboardControlsFeature && (
              <>
                <div className="date-range-selector-workflowDashboard">
                  <label className="date-label-workflowDashboard">Select Date / Date Range:</label>
                  <input 
                    type="text" 
                    className="date-input-workflowDashboard"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    placeholder="2025.03.03 - 2025.03.07"
                  />
                  <span className="calendar-icon-workflowDashboard">📅</span>
                </div>

                <div className="revenue-box-workflowDashboard">
                  <div className="revenue-total-workflowDashboard">
                    <div className="revenue-header-workflowDashboard">Total Revenue:</div>
                    <div className="revenue-details-workflowDashboard">
                      <span>Hectares: 1100</span>
                      <span>LKR 150,000</span>
                    </div>
                  </div>
                  <div className="revenue-breakdown-workflowDashboard">
                    <div className="breakdown-item-workflowDashboard">
                      <span className="breakdown-label-workflowDashboard">Plantation:</span>
                      <span>Hectares: 550</span>
                      <span>LKR 75,000</span>
                    </div>
                    <div className="breakdown-item-workflowDashboard">
                      <span className="breakdown-label-workflowDashboard">Non-Plantation:</span>
                      <span>Hectares: 550</span>
                      <span>LKR 75,000</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="notifications-modal-overlay-workflowDashboard" onClick={() => setShowNotificationsModal(false)}>
          <div className="notifications-modal-workflowDashboard" onClick={(e) => e.stopPropagation()}>
            <div className="notifications-modal-header-workflowDashboard">
              <h2>All Notifications</h2>
              <button
                className="notifications-modal-close-workflowDashboard"
                onClick={() => setShowNotificationsModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="notifications-modal-body-workflowDashboard">
              {allNotifications.length > 0 ? (
                <div className="notifications-modal-list-workflowDashboard">
                  {allNotifications.map((notification) => (
                    <div key={notification.id} className="notification-modal-item-workflowDashboard">
                      <div className="notification-modal-content-workflowDashboard">
                        <p className="notification-modal-description-workflowDashboard">{notification.description}</p>
                        <div className="notification-modal-meta-workflowDashboard">
                          <span className="notification-modal-date-workflowDashboard">
                            {formatNotificationDateTime(notification.date, notification.time)}
                          </span>
                        </div>
                      </div>
                      {notification.displayed === 0 ? (
                        <button
                          className="notification-modal-read-btn-workflowDashboard"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <FaEnvelope className="unread-icon-modal-workflowDashboard" /> Mark as Read
                        </button>
                      ) : (
                        <div className="notification-modal-read-indicator-workflowDashboard" title="Already read">
                          <FaEnvelopeOpen className="read-icon-modal-workflowDashboard" /> Read
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-notifications-modal-workflowDashboard">
                  <p>No notifications found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content-workflowDashboard">
        {/* Left Section - Resource Availability */}
        <div className="resource-section-workflowDashboard">
          <div className="resource-card-workflowDashboard">
            <div className="resource-card-header-workflowDashboard">
              <span className="resource-title-workflowDashboard">Drone Details: 30</span>
            </div>
            <div className="resource-card-body-workflowDashboard">
              <div className="resource-categories-grid-workflowDashboard">
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Working Drones</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">10</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">8</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Not Working Drones</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">8</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pilot Details Card */}
          <div className="resource-card-workflowDashboard">
            <div className="resource-card-header-workflowDashboard">
              <span className="resource-title-workflowDashboard">Pilot Details: 60</span>
            </div>
            <div className="resource-card-body-workflowDashboard">
              <div className="resource-categories-grid-workflowDashboard">
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Working Pilots</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">10</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">15</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Not Working Pilots</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">3</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">2</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Training Pilots</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">3</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generator Details Card */}
          <div className="resource-card-workflowDashboard">
            <div className="resource-card-header-workflowDashboard">
              <span className="resource-title-workflowDashboard">Generator Details: 30</span>
            </div>
            <div className="resource-card-body-workflowDashboard">
              <div className="resource-categories-grid-workflowDashboard">
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Genny's at Work</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">15</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">10</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Genny's Not Working</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">3</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* R/C Details Card */}
          <div className="resource-card-workflowDashboard">
            <div className="resource-card-header-workflowDashboard">
              <span className="resource-title-workflowDashboard">R/C Details: 30</span>
            </div>
            <div className="resource-card-body-workflowDashboard">
              <div className="resource-categories-grid-workflowDashboard">
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">R/C at Work</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">15</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">10</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">R/C Not Working</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">3</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Battery Details Card */}
          <div className="resource-card-workflowDashboard">
            <div className="resource-card-header-workflowDashboard">
              <span className="resource-title-workflowDashboard">Battery Details: 30</span>
            </div>
            <div className="resource-card-body-workflowDashboard">
              <div className="resource-categories-grid-workflowDashboard">
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Battery at Work</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">15</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">10</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Battery Not Working</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">3</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Details Card */}
          <div className="resource-card-workflowDashboard">
            <div className="resource-card-header-workflowDashboard">
              <span className="resource-title-workflowDashboard">Vehicle Details: 10</span>
            </div>
            <div className="resource-card-body-workflowDashboard">
              <div className="resource-categories-grid-workflowDashboard">
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Vehicle's at Work</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">6</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">3</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-workflowDashboard">
                  <div className="resource-category-title-workflowDashboard">Maintenance</div>
                  <div className="resource-sub-items-workflowDashboard">
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Plantation</span>
                      <span className="sub-item-value-workflowDashboard">1</span>
                    </div>
                    <div className="resource-sub-item-workflowDashboard">
                      <span className="sub-item-label-workflowDashboard">Non Plantation</span>
                      <span className="sub-item-value-workflowDashboard">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Action Needed */}
        <div className="action-section-workflowDashboard">
          <div className="action-section-header-workflowDashboard">
            <h2 className="section-title-action-workflowDashboard">Action Needed</h2>
            <button 
              className="refresh-button-action-workflowDashboard"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              title="Refresh all counts"
            >
              <FaSync className={isRefreshing ? 'refresh-icon-spinning-workflowDashboard' : 'refresh-icon-workflowDashboard'} />
            </button>
          </div>
          
          <div className="action-queue-workflowDashboard">
            {/* Queue Box - Single Red Box with 3 Items */}
            <div className="queue-box-card-workflowDashboard">
              <div className="queue-box-card-header-workflowDashboard">
                <span className="queue-box-card-title-workflowDashboard">Queue</span>
              </div>
              <div className="queue-box-card-items-workflowDashboard">
                <div className="queue-box-card-item-workflowDashboard" onClick={() => go('/home/requestsQueue')} style={{ cursor: 'pointer' }}>
                  <span className="queue-box-card-item-title-workflowDashboard">Add-hoc Plans</span>
                  <span className="queue-box-card-item-count-workflowDashboard">Plans {adhocCount} »</span>
                </div>
                
                <div className="queue-box-card-item-workflowDashboard" onClick={() => go('/home/requestsQueue')} style={{ cursor: 'pointer' }}>
                  <span className="queue-box-card-item-title-workflowDashboard">Reschedule Request Plans</span>
                  <span className="queue-box-card-item-count-workflowDashboard">Plans {rescheduleCount} »</span>
                </div>
              </div>
            </div>
            
            <div className="action-card-workflowDashboard" onClick={() => go('/home/managerApprovalQueue')} style={{ cursor: 'pointer' }}>
              <span className="action-title-workflowDashboard">Plantation Manager Approval Queue</span>
              <span className="action-plans-workflowDashboard">Plans {managerApprovalCount} »</span>
            </div>
            
            <div className="action-card-workflowDashboard" onClick={() => go('/home/pilotAssignment')} style={{ cursor: 'pointer' }}>
              <span className="action-title-workflowDashboard">Resource Assignment Queue</span>
              <span className="action-plans-workflowDashboard">Items {resourceAssignmentCount} »</span>
            </div>
            
            <div className="action-card-workflowDashboard" onClick={() => go('/home/pendingPaymentQueue')} style={{ cursor: 'pointer' }}>
              <span className="action-title-workflowDashboard">Pending Payment Queue</span>
              <span className="action-plans-workflowDashboard">Missions {pendingPaymentCount} »</span>
            </div>
            
            <div className="action-card-workflowDashboard" onClick={() => go('/home/droneUnlockingQueue')} style={{ cursor: 'pointer' }}>
              <span className="action-title-workflowDashboard">Pending Drone Unlocking Queue</span>
              <span className="action-plans-workflowDashboard">Items {droneUnlockingCount} »</span>
            </div>
            
            <div className="action-card-workflowDashboard" onClick={() => go('/home/opsAsign')} style={{ cursor: 'pointer' }}>
              <span className="action-title-workflowDashboard">Ops Assignment</span>
              <span className="action-plans-workflowDashboard">Items {opsAssignCount} »</span>
            </div>
            
            <div className="action-card-workflowDashboard" onClick={() => go('/home/dayEndProcess')} style={{ cursor: 'pointer' }}>
              <span className="action-title-workflowDashboard">Plans Pending for Day End Process</span>
              <span className="action-plans-workflowDashboard">Plans {dayEndProcessCount} »</span>
            </div>
            
            <div className="action-card-workflowDashboard" onClick={() => go('/home/djiMapUpload')} style={{ cursor: 'pointer' }}>
              <span className="action-title-workflowDashboard">DJI Map Upload</span>
              <span className="action-plans-workflowDashboard">Maps {djiImagesCount} »</span>
            </div>
          </div>
        </div>

        {/* Right Section - Future Business In-Hand */}
        <div className="future-business-section-workflowDashboard">
          <div className="future-actions-row-workflowDashboard">
            <span className="future-date-display-workflowDashboard">{dateRange}</span>
            <button 
              className={`action-btn-workflowDashboard ${selectedAction === 'Spray' ? 'active-workflowDashboard' : ''}`}
              onClick={() => setSelectedAction('Spray')}
            >
              Spray
            </button>
            <button 
              className={`action-btn-workflowDashboard ${selectedAction === 'Spread' ? 'active-workflowDashboard' : ''}`}
              onClick={() => setSelectedAction('Spread')}
            >
              Spread
            </button>
          </div>

          <div className="business-table-container-workflowDashboard">
            <table className="business-table-workflowDashboard">
              <thead>
                <tr>
                  <th className="table-header-workflowDashboard">Sector</th>
                  <th className="table-header-workflowDashboard">Plantation (LKR)</th>
                  <th className="table-header-workflowDashboard">Non-Plantation (LKR)</th>
                  <th className="table-header-workflowDashboard">Hectares</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell-workflowDashboard">Sector11</td>
                  <td className="table-cell-workflowDashboard"></td>
                  <td className="table-cell-workflowDashboard"></td>
                  <td className="table-cell-workflowDashboard"></td>
                </tr>
                <tr>
                  <td className="table-cell-workflowDashboard">Sector12</td>
                  <td className="table-cell-workflowDashboard"></td>
                  <td className="table-cell-workflowDashboard"></td>
                  <td className="table-cell-workflowDashboard"></td>
                </tr>
                <tr>
                  <td className="table-cell-workflowDashboard">Sector13</td>
                  <td className="table-cell-workflowDashboard"></td>
                  <td className="table-cell-workflowDashboard"></td>
                  <td className="table-cell-workflowDashboard"></td>
                </tr>
                <tr>
                  <td className="table-cell-workflowDashboard">Sector14</td>
                  <td className="table-cell-workflowDashboard"></td>
                  <td className="table-cell-workflowDashboard"></td>
                  <td className="table-cell-workflowDashboard"></td>
                </tr>
                <tr className="total-row-workflowDashboard">
                  <td className="table-cell-workflowDashboard">Total</td>
                  <td className="table-cell-workflowDashboard"></td>
                  <td className="table-cell-workflowDashboard"></td>
                  <td className="table-cell-workflowDashboard"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="calendar-buttons-container-workflowDashboard">
            <button className="calendar-btn-workflowDashboard" onClick={() => go('/home/opsroomPlanCalendar')}>
              <span className="calendar-btn-icon-workflowDashboard">📅</span>
              View Plan Calendar
            </button>
            <button className="calendar-btn-workflowDashboard today-plans-btn-workflowDashboard" onClick={() => go('/home/todayPlans')}>
              <span className="calendar-btn-icon-workflowDashboard">📋</span>
              View Today Plans
            </button>
            <button className="calendar-btn-workflowDashboard emergency-moving-btn-workflowDashboard" onClick={() => go('/home/emergencyMoving')}>
              <span className="calendar-btn-icon-workflowDashboard">🔄</span>
              Emergency Moving
            </button>
            <button className="calendar-btn-workflowDashboard" onClick={() => go('/home/fieldHistory')}>
              <span className="calendar-btn-icon-workflowDashboard">📜</span>
              Field History
            </button>
            <button className="calendar-btn-workflowDashboard" onClick={() => go('/home/reports/ops')}>
              <span className="calendar-btn-icon-workflowDashboard">📊</span>
              Reports
            </button>
            <button className="calendar-btn-workflowDashboard" onClick={() => go('/home/fieldSizeAdjustments')}>
              <span className="calendar-btn-icon-workflowDashboard">📐</span>
              Field Size Adjustments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboard;



