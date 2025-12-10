import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import { FaSync } from 'react-icons/fa';
import {
  useGetMissionsPendingPaymentQuery,
  useGetDroneUnlockingQueueQuery,
  useGetResourceAssignmentCountQuery,
} from '../../../api/services NodeJs/pilotAssignmentApi';
import { useGetPlansPendingDayEndCountQuery } from '../../../api/services NodeJs/dayEndProcessApi';
import { useGetTodayDjiImagesCountQuery } from '../../../api/services NodeJs/djiImagesApi';
import '../../../styles/workflowDashboard-com.css';

const WorkflowDashboard = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState('2025.03.03 - 2025.03.07');
  const [selectedAction, setSelectedAction] = useState('Spray');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const routerLocation = useLocation();

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
      // Fetch all four counts in parallel (faster than sequential)
      const [adhocResult, rescheduleResult, nonpResult, plansResult] = await Promise.all([
        dispatch(baseApi.endpoints.getPendingAdHocRequests.initiate()),
        dispatch(baseApi.endpoints.getPendingRescheduleRequestsByManager.initiate()),
        dispatch(baseApi.endpoints.getPendingNonPlantationMissions.initiate()),
        dispatch(baseApi.endpoints.getPlansByDate.initiate(tomorrowDate)),
      ]);
      const adhocData = adhocResult.data;
      const rescheduleData = rescheduleResult.data;
      const nonpData = nonpResult.data;
      const plansData = plansResult.data;

      // Filter plans for manager approval: activated=1 AND manager_approval=0
      let managerApprovalCount = 0;
      
      // Handle different response structures
      let plansArray = [];
      if (plansData && Array.isArray(plansData)) {
        plansArray = plansData;
      } else if (plansData && typeof plansData === 'object' && plansData.status === 'true') {
        // If it's an object with status and numeric keys
        plansArray = Object.keys(plansData)
          .filter(key => !isNaN(key) && key !== 'status' && key !== 'count')
          .map(key => plansData[key]);
      } else if (plansData && typeof plansData === 'object') {
        // Try to extract plans from object
        plansArray = Object.keys(plansData)
          .filter(key => !isNaN(key))
          .map(key => plansData[key]);
      }
      
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

      // Process and return the counts
      return {
        adhoc: adhocData?.status === 'true' ? (adhocData.request_count || 0) : 0,
        reschedule: rescheduleData?.requests?.length || 0,
        nonp: nonpData?.status === 'true' 
          ? (nonpData.count || (nonpData['0']?.length || 0)) 
          : 0,
        managerApproval: managerApprovalCount,
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
  const nonpCount = counts?.nonp || 0;
  const managerApprovalCount = counts?.managerApproval || 0;

  return (
    <div className="workflow-dashboard-com">
      {/* Header Section */}
      <div className="dashboard-header-com">
        <div className="header-content-com">
          <h1 className="dashboard-title-com">Workflow Dashboard</h1>
          
          <div className="header-controls-com">
            <div className="date-range-selector-com">
              <label className="date-label-com">Select Date / Date Range:</label>
              <input 
                type="text" 
                className="date-input-com"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="2025.03.03 - 2025.03.07"
              />
              <span className="calendar-icon-com">📅</span>
            </div>

            <div className="revenue-box-com">
              <div className="revenue-total-com">
                <div className="revenue-header-com">Total Revenue:</div>
                <div className="revenue-details-com">
                  <span>Hectares: 1100</span>
                  <span>LKR 150,000</span>
                </div>
              </div>
              <div className="revenue-breakdown-com">
                <div className="breakdown-item-com">
                  <span className="breakdown-label-com">Plantation:</span>
                  <span>Hectares: 550</span>
                  <span>LKR 75,000</span>
                </div>
                <div className="breakdown-item-com">
                  <span className="breakdown-label-com">Non-Plantation:</span>
                  <span>Hectares: 550</span>
                  <span>LKR 75,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content-com">
        {/* Left Section - Resource Availability */}
        <div className="resource-section-com">
          <h2 className="section-title-com">Resource Availability</h2>
          
          {/* Drone Details Card */}
          <div className="resource-card-com">
            <div className="resource-card-header-com">
              <span className="resource-title-com">Drone Details: 30</span>
            </div>
            <div className="resource-card-body-com">
              <div className="resource-categories-grid-com">
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Working Drones</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">10</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">8</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Not Working Drones</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">8</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pilot Details Card */}
          <div className="resource-card-com">
            <div className="resource-card-header-com">
              <span className="resource-title-com">Pilot Details: 60</span>
            </div>
            <div className="resource-card-body-com">
              <div className="resource-categories-grid-com">
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Working Pilots</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">10</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">15</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Not Working Pilots</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">3</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">2</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Training Pilots</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">3</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generator Details Card */}
          <div className="resource-card-com">
            <div className="resource-card-header-com">
              <span className="resource-title-com">Generator Details: 30</span>
            </div>
            <div className="resource-card-body-com">
              <div className="resource-categories-grid-com">
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Genny's at Work</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">15</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">10</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Genny's Not Working</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">3</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* R/C Details Card */}
          <div className="resource-card-com">
            <div className="resource-card-header-com">
              <span className="resource-title-com">R/C Details: 30</span>
            </div>
            <div className="resource-card-body-com">
              <div className="resource-categories-grid-com">
                <div className="resource-category-com">
                  <div className="resource-category-title-com">R/C at Work</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">15</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">10</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-com">
                  <div className="resource-category-title-com">R/C Not Working</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">3</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Battery Details Card */}
          <div className="resource-card-com">
            <div className="resource-card-header-com">
              <span className="resource-title-com">Battery Details: 30</span>
            </div>
            <div className="resource-card-body-com">
              <div className="resource-categories-grid-com">
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Battery at Work</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">15</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">10</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Battery Not Working</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">3</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Details Card */}
          <div className="resource-card-com">
            <div className="resource-card-header-com">
              <span className="resource-title-com">Vehicle Details: 10</span>
            </div>
            <div className="resource-card-body-com">
              <div className="resource-categories-grid-com">
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Vehicle's at Work</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">6</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">3</span>
                    </div>
                  </div>
                </div>
                <div className="resource-category-com">
                  <div className="resource-category-title-com">Maintenance</div>
                  <div className="resource-sub-items-com">
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Plantation</span>
                      <span className="sub-item-value-com">1</span>
                    </div>
                    <div className="resource-sub-item-com">
                      <span className="sub-item-label-com">Non Plantation</span>
                      <span className="sub-item-value-com">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Action Needed */}
        <div className="action-section-com">
          <div className="action-section-header-com">
            <h2 className="section-title-action-com">Action Needed</h2>
            <button 
              className="refresh-button-action-com"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              title="Refresh all counts"
            >
              <FaSync className={isRefreshing ? 'refresh-icon-spinning-com' : 'refresh-icon-com'} />
            </button>
          </div>
          
          <div className="action-queue-com">
            {/* Queue Box - Single Red Box with 3 Items */}
            <div className="queue-box-card-com">
              <div className="queue-box-card-header-com">
                <span className="queue-box-card-title-com">Queue</span>
              </div>
              <div className="queue-box-card-items-com">
                <div className="queue-box-card-item-com" onClick={() => navigate('/home/requestsQueue')} style={{ cursor: 'pointer' }}>
                  <span className="queue-box-card-item-title-com">Add-hoc Plans</span>
                  <span className="queue-box-card-item-count-com">Plans {adhocCount} »</span>
                </div>
                
                <div className="queue-box-card-item-com" onClick={() => navigate('/home/requestsQueue')} style={{ cursor: 'pointer' }}>
                  <span className="queue-box-card-item-title-com">Reschedule Request Plans</span>
                  <span className="queue-box-card-item-count-com">Plans {rescheduleCount} »</span>
                </div>
                
                <div className="queue-box-card-item-com" onClick={() => navigate('/home/requestsQueue')} style={{ cursor: 'pointer' }}>
                  <span className="queue-box-card-item-title-com">NP Request Plans</span>
                  <span className="queue-box-card-item-count-com">Plans {nonpCount} »</span>
                </div>
              </div>
            </div>
            
            <div className="action-card-com" onClick={() => navigate('/home/managerApprovalQueue')} style={{ cursor: 'pointer' }}>
              <span className="action-title-com">Plantation Manager Approval Queue</span>
              <span className="action-plans-com">Plans {managerApprovalCount} »</span>
            </div>
            
            <div className="action-card-com" onClick={() => navigate('/home/pilotAssignment')} style={{ cursor: 'pointer' }}>
              <span className="action-title-com">Resource Assignment Queue</span>
              <span className="action-plans-com">Items {resourceAssignmentCount} »</span>
            </div>
            
            <div className="action-card-com" onClick={() => navigate('/home/pendingPaymentQueue')} style={{ cursor: 'pointer' }}>
              <span className="action-title-com">Pending Payment Queue</span>
              <span className="action-plans-com">Missions {pendingPaymentCount} »</span>
            </div>
            
            <div className="action-card-com" onClick={() => navigate('/home/droneUnlockingQueue')} style={{ cursor: 'pointer' }}>
              <span className="action-title-com">Pending Drone Unlocking Queue</span>
              <span className="action-plans-com">Items {droneUnlockingCount} »</span>
            </div>
            
            <div className="action-card-com" onClick={() => navigate('/home/dayEndProcess')} style={{ cursor: 'pointer' }}>
              <span className="action-title-com">Plans Pending for Day End Process</span>
              <span className="action-plans-com">Plans {dayEndProcessCount} »</span>
            </div>
            
            <div className="action-card-com" onClick={() => navigate('/home/djiMapUpload')} style={{ cursor: 'pointer' }}>
              <span className="action-title-com">DJI Map Upload</span>
              <span className="action-plans-com">Maps {djiImagesCount} »</span>
            </div>
          </div>
        </div>

        {/* Right Section - Future Business In-Hand */}
        <div className="future-business-section-com">
          <div className="future-header-com">
            <h2 className="section-title-com">Future Business In-Hand:</h2>
          </div>
          <div className="future-actions-row-com">
            <span className="future-date-display-com">{dateRange}</span>
            <button 
              className={`action-btn-com ${selectedAction === 'Spray' ? 'active-com' : ''}`}
              onClick={() => setSelectedAction('Spray')}
            >
              Spray
            </button>
            <button 
              className={`action-btn-com ${selectedAction === 'Spread' ? 'active-com' : ''}`}
              onClick={() => setSelectedAction('Spread')}
            >
              Spread
            </button>
          </div>

          <div className="business-table-container-com">
            <table className="business-table-com">
              <thead>
                <tr>
                  <th className="table-header-com">Sector</th>
                  <th className="table-header-com">Plantation (LKR)</th>
                  <th className="table-header-com">Non-Plantation (LKR)</th>
                  <th className="table-header-com">Hectares</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell-com">Sector11</td>
                  <td className="table-cell-com"></td>
                  <td className="table-cell-com"></td>
                  <td className="table-cell-com"></td>
                </tr>
                <tr>
                  <td className="table-cell-com">Sector12</td>
                  <td className="table-cell-com"></td>
                  <td className="table-cell-com"></td>
                  <td className="table-cell-com"></td>
                </tr>
                <tr>
                  <td className="table-cell-com">Sector13</td>
                  <td className="table-cell-com"></td>
                  <td className="table-cell-com"></td>
                  <td className="table-cell-com"></td>
                </tr>
                <tr>
                  <td className="table-cell-com">Sector14</td>
                  <td className="table-cell-com"></td>
                  <td className="table-cell-com"></td>
                  <td className="table-cell-com"></td>
                </tr>
                <tr className="total-row-com">
                  <td className="table-cell-com">Total</td>
                  <td className="table-cell-com"></td>
                  <td className="table-cell-com"></td>
                  <td className="table-cell-com"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="calendar-buttons-container-com">
            <button className="calendar-btn-com" onClick={() => navigate('/home/opsroomPlanCalendar')}>
              <span className="calendar-btn-icon-com">📅</span>
              View Plan Calendar
            </button>
            <button className="calendar-btn-com today-plans-btn-com" onClick={() => navigate('/home/todayPlans')}>
              <span className="calendar-btn-icon-com">📋</span>
              View Today Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboard;



