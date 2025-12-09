import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTodayPlansAndMissionsQuery } from '../../../api/services NodeJs/pilotAssignmentApi';
import { Bars } from 'react-loader-spinner';
import '../../../styles/todayPlans-com.css';

const TodayPlans = () => {
  const navigate = useNavigate();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const { data, isLoading, error, refetch } = useGetTodayPlansAndMissionsQuery(today);

  if (isLoading) {
    return (
      <div className="today-plans-container-com">
        <div className="today-plans-loading-com">
          <Bars height="50" width="50" color="#003057" ariaLabel="bars-loading" visible={true} />
          <span>Loading today's plans and missions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="today-plans-container-com">
        <div className="today-plans-error-com">
          <p>Error loading data. Please try again.</p>
          <button onClick={() => refetch()} className="retry-btn-com">Retry</button>
        </div>
      </div>
    );
  }

  const plansData = data?.data || {};
  const plans = plansData.plans || [];
  const missions = plansData.missions || [];
  const summary = plansData.summary || {};

  return (
    <div className="today-plans-container-com">
      {/* Header */}
      <div className="today-plans-header-com">
        <button 
          className="today-plans-back-btn-com" 
          onClick={() => navigate(-1)}
          title="Go back"
        >
          <span className="back-btn-icon-com">←</span>
        </button>
        <h1 className="today-plans-title-com">Today's Plantations & Non Plantation</h1>
        <div className="today-plans-date-com">
          <span className="date-label-com">Date:</span>
          <span className="date-value-com">{today}</span>
        </div>
      </div>

      {/* Summary Card */}
      <div className="today-plans-summary-com">
        <div className="summary-card-com">
          <div className="summary-row-com">
            <div className="summary-item-com">
              <div className="summary-title-value-com">
                <span className="summary-card-title-com">Total Plantations</span>
                <span className="summary-card-value-com">{summary.total_plans || 0}</span>
              </div>
            </div>
            <div className="summary-item-com">
              <div className="summary-title-value-com">
                <span className="summary-card-title-com">Total Non Plantation</span>
                <span className="summary-card-value-com">{summary.total_missions || 0}</span>
              </div>
            </div>
          </div>
          <div className="summary-row-com">
            <div className="summary-item-com">
              <div className="summary-card-details-com">
                <span className="assigned-count-com">Assigned: {summary.assigned_plans || 0}</span>
                <span className="unassigned-count-com">Unassigned: {summary.unassigned_plans || 0}</span>
              </div>
            </div>
            <div className="summary-item-com">
              <div className="summary-card-details-com">
                <span className="assigned-count-com">Assigned: {summary.assigned_missions || 0}</span>
                <span className="unassigned-count-com">Unassigned: {summary.unassigned_missions || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Plans and Missions Section */}
      <div className="today-plans-section-com">
        <h2 className="section-title-com">Today's Assignments</h2>
        {(plans.length === 0 && missions.length === 0) ? (
          <div className="empty-state-com">No assignments scheduled for today</div>
        ) : (
          <div className="items-grid-com">
            {/* Plantations (Plans) */}
            {plans.map((plan) => (
              <div 
                key={`plan-${plan.id}`} 
                className={`item-card-com ${plan.is_assigned === 1 ? 'assigned-com' : 'unassigned-com'}`}
              >
                {/* Row 1: Plan Type and Assigned Status */}
                <div className="item-row-1-com">
                  <span className="item-type-badge-com item-type-plantation-com">Plantation</span>
                  <span className={`status-badge-com ${plan.is_assigned === 1 ? 'assigned-badge-com' : 'unassigned-badge-com'}`}>
                    {plan.is_assigned === 1 ? 'Assigned' : 'Unassigned'}
                  </span>
                </div>
                
                
                {/* Row 3: Estate, Extent, and Manager Approval */}
                <div className="item-row-3-com">
                  <div className="item-info-column-com">
                    <div className="item-info-item-com">
                      <span className="info-label-com">Estate:</span>
                      <span className="info-value-com">{plan.estate_name || 'N/A'}</span>
                    </div>
                    <div className="item-info-item-com">
                      <span className="info-label-com">Extent:</span>
                      <span className="info-value-com">{plan.totalExtent || 0} ha</span>
                    </div>
                  </div>
                  {plan.manager_approval !== undefined && (
                    <span className={`approval-badge-com ${plan.manager_approval === 1 ? 'approved-badge-com' : 'pending-badge-com'}`}>
                      {plan.manager_approval === 1 ? 'Approved' : 'Pending'}
                    </span>
                  )}
                </div>

                {/* Resource Allocation */}
                {plan.is_assigned === 1 && plan.has_resources ? (
                  <div className="item-resources-com">
                    {plan.pilots && plan.pilots.length > 0 && plan.pilots.map((pilot, idx) => (
                      <div key={idx} className="resource-badge-com">
                        <span className="resource-icon-com">✈️</span>
                        <div className="resource-pilot-info-com">
                          <span className="resource-pilot-name-com">{pilot.name}</span>
                          {pilot.mobile_no && pilot.mobile_no.trim() !== '' && (
                            <span className="resource-pilot-mobile-com">{pilot.mobile_no}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {plan.drone && (
                      <div className="resource-badge-com">
                        <span className="resource-icon-com">🚁</span>
                        <div className="resource-drone-info-com">
                          <span className="resource-drone-tag-com">{plan.drone.drone_tag || plan.drone.serial || 'N/A'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="item-resources-com">
                    <span className="no-resources-text-com">No resources allocated</span>
                  </div>
                )}
              </div>
            ))}

            {/* Non Plantation (Missions) */}
            {missions.map((mission) => (
              <div 
                key={`mission-${mission.id}`} 
                className={`item-card-com ${mission.is_assigned === 1 ? 'assigned-com' : 'unassigned-com'}`}
              >
                {/* Row 1: Plan Type and Assigned Status */}
                <div className="item-row-1-com">
                  <span className="item-type-badge-com item-type-nonplantation-com">Non Plantation</span>
                  <span className={`status-badge-com ${mission.is_assigned === 1 ? 'assigned-badge-com' : 'unassigned-badge-com'}`}>
                    {mission.is_assigned === 1 ? 'Assigned' : 'Unassigned'}
                  </span>
                </div>
                
                {/* Row 2: Farmer, GND, Extent, and Payment Status */}
                <div className="item-row-3-com">
                  <div className="item-info-column-com">
                    <div className="item-info-item-com">
                      <span className="info-label-com">Farmer:</span>
                      <span className="info-value-com">{mission.farmer_name || 'N/A'}</span>
                    </div>
                    {mission.gnd_name || mission.gnd ? (
                      <div className="item-info-item-com">
                        <span className="info-label-com">GND:</span>
                        <span className="info-value-com">{mission.gnd_name || mission.gnd || 'N/A'}</span>
                      </div>
                    ) : null}
                    <div className="item-info-item-com">
                      <span className="info-label-com">Extent:</span>
                      <span className="info-value-com">{mission.total_land_extent || 0} ha</span>
                    </div>
                  </div>
                  {mission.payments !== undefined && (
                    <span className={`payment-badge-com ${mission.payments === 1 ? 'paid-badge-com' : 'unpaid-badge-com'}`}>
                      {mission.payments === 1 ? 'Paid' : 'Not Paid'}
                    </span>
                  )}
                </div>

                {/* Resource Allocation */}
                {mission.is_assigned === 1 && mission.has_resources ? (
                  <div className="item-resources-com">
                    {mission.pilots && mission.pilots.length > 0 && mission.pilots.map((pilot, idx) => (
                      <div key={idx} className="resource-badge-com">
                        <span className="resource-icon-com">✈️</span>
                        <div className="resource-pilot-info-com">
                          <span className="resource-pilot-name-com">{pilot.name}</span>
                          {pilot.mobile_no && pilot.mobile_no.trim() !== '' && (
                            <span className="resource-pilot-mobile-com">{pilot.mobile_no}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {mission.drone && (
                      <div className="resource-badge-com">
                        <span className="resource-icon-com">🚁</span>
                        <div className="resource-drone-info-com">
                          <span className="resource-drone-tag-com">{mission.drone.drone_tag || mission.drone.serial || 'N/A'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="item-resources-com">
                    <span className="no-resources-text-com">No resources allocated</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayPlans;

