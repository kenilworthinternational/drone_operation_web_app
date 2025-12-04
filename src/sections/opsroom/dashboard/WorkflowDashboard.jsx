import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import '../../../styles/workflowDashboard-com.css';

const WorkflowDashboard = () => {
  const dispatch = useAppDispatch();
  const [dateRange, setDateRange] = useState('2025.03.03 - 2025.03.07');
  const [selectedAction, setSelectedAction] = useState('Spray');
  const navigate = useNavigate();

  // Use React Query to fetch counts with intelligent caching and deduplication
  const { data: counts, isLoading } = useQuery({
    queryKey: ['workflowDashboard', 'counts'],
    queryFn: async () => {
      // Fetch all three counts in parallel (faster than sequential)
      const [adhocResult, rescheduleResult, nonpResult] = await Promise.all([
        dispatch(baseApi.endpoints.getPendingAdHocRequests.initiate()),
        dispatch(baseApi.endpoints.getPendingRescheduleRequestsByManager.initiate()),
        dispatch(baseApi.endpoints.getPendingNonPlantationMissions.initiate()),
      ]);
      const adhocData = adhocResult.data;
      const rescheduleData = rescheduleResult.data;
      const nonpData = nonpResult.data;

      // Process and return the counts
      return {
        adhoc: adhocData?.status === 'true' ? (adhocData.request_count || 0) : 0,
        reschedule: rescheduleData?.requests?.length || 0,
        nonp: nonpData?.status === 'true' 
          ? (nonpData.count || (nonpData['0']?.length || 0)) 
          : 0,
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

  // Extract counts with fallback to 0
  const adhocCount = counts?.adhoc || 0;
  const rescheduleCount = counts?.reschedule || 0;
  const nonpCount = counts?.nonp || 0;

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
          <h2 className="section-title-action-com">Action Needed</h2>
          
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
            
            <div className="action-card-com">
              <span className="action-title-com">Plantation Manager Approval Queue</span>
              <span className="action-plans-com">Plans 08 »</span>
            </div>
            
            <div className="action-card-com" onClick={() => navigate('/home/pilotAssignment')} style={{ cursor: 'pointer' }}>
              <span className="action-title-com">Pilot Assignment</span>
              <span className="action-plans-com">Plans 10 »</span>
            </div>
            
            <div className="action-card-com">
              <span className="action-title-com">Pending Payment Queue</span>
              <span className="action-plans-com">Plans 25 »</span>
            </div>
            
            <div className="action-card-com">
              <span className="action-title-com">Pending Drone Unlocking Queue</span>
              <span className="action-plans-com">Plans 25 »</span>
            </div>
            
            <div className="action-card-com">
              <span className="action-title-com">Plans Pending for Day End Process</span>
              <span className="action-plans-com">Plans 25 »</span>
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

          <button className="calendar-btn-com" onClick={() => navigate('/home/opsroomPlanCalendar')}>
            <span className="calendar-btn-icon-com">📅</span>
            View Plan Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboard;



