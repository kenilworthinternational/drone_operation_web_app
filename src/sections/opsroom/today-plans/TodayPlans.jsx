import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTodayPlansAndMissionsQuery } from '../../../api/services NodeJs/pilotAssignmentApi';
import { Bars } from 'react-loader-spinner';
import '../../../styles/todayPlans-com.css';

function getTodayYYYYMMDD() {
  return new Date().toISOString().split('T')[0];
}

/** Derive current status label for a field row */
function getFieldStatus(f) {
  const finalStatus = (f.final_status || '').toLowerCase();
  const remaining = f.remainingOptions != null && f.remainingOptions !== 0;
  if (finalStatus === 'x') return { label: 'Cancelled', className: 'field-status-cancelled-com' };
  if (finalStatus === 'c') {
    if (!remaining) return { label: 'Completed', className: 'field-status-completed-com' };
    return { label: 'Partial completed', reason: f.remaining_reason || '', className: 'field-status-partial-com' };
  }
  return { label: 'In progress', className: 'field-status-inprogress-com' };
}

const TodayPlans = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getTodayYYYYMMDD);
  const { data, isLoading, error, refetch } = useGetTodayPlansAndMissionsQuery(selectedDate);

  if (isLoading) {
    return (
      <div className="today-plans-container-com">
        <div className="today-plans-loading-com">
          <Bars height="50" width="50" color="#003057" ariaLabel="bars-loading" visible={true} />
          <span>Loading plans and missions for {selectedDate}...</span>
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
          <label htmlFor="today-plans-date-picker-com" className="date-label-com">Date:</label>
          <input
            id="today-plans-date-picker-com"
            type="date"
            className="today-plans-date-picker-com date-value-com"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayYYYYMMDD()}
            title="Select date to view plans"
          />
        </div>
      </div>

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

      <div className="today-plans-section-com">
        <h2 className="section-title-com">Today's Assignments</h2>
        {(plans.length === 0 && missions.length === 0) ? (
          <div className="empty-state-com">No assignments scheduled for today</div>
        ) : (
          <div className="today-plans-list-com">
            {/* Plans: one per row, with optional field-by-field details when manager approved */}
            {plans.map((plan) => (
              <div
                key={`plan-${plan.id}`}
                className={`today-plan-row-com item-card-com ${plan.is_assigned === 1 ? 'assigned-com' : 'unassigned-com'}`}
              >
                <div className="item-row-1-com">
                  <span className="item-type-badge-com item-type-plantation-com">Plantation</span>
                  {plan.manager_approval !== undefined && (
                    <span className={`approval-badge-com ${plan.manager_approval === 1 ? 'approved-badge-com' : 'pending-badge-com'}`}>
                      {plan.manager_approval === 1 ? 'Approved' : 'Pending'}
                    </span>
                  )}
                  <span className={`status-badge-com ${plan.is_assigned === 1 ? 'assigned-badge-com' : 'unassigned-badge-com'}`}>
                    {plan.is_assigned === 1 ? 'Assigned' : 'Unassigned'}
                  </span>
                </div>
                <div className="item-row-main-com">
                  <div className="item-row-left-com">
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
                  </div>
                  <div className="item-row-pilot-com">
                    {plan.is_assigned === 1 && plan.pilots && plan.pilots.length > 0 ? (
                      plan.pilots.map((pilot, idx) => (
                        <div key={idx} className="resource-badge-com resource-badge-inline-com">
                          <span className="resource-icon-com">✈️</span>
                          <div className="resource-pilot-info-com">
                            <span className="resource-pilot-name-com">{pilot.name}</span>
                            {pilot.mobile_no && pilot.mobile_no.trim() !== '' && (
                              <span className="resource-pilot-mobile-com">{pilot.mobile_no}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="no-resources-text-com">—</span>
                    )}
                  </div>
                  <div className="item-row-drone-com">
                    {plan.is_assigned === 1 && plan.drone ? (
                      <div className="resource-badge-com resource-badge-inline-com">
                        <span className="resource-icon-com">🚁</span>
                        <div className="resource-drone-info-com">
                          <span className="resource-drone-tag-com">{plan.drone.drone_tag || plan.drone.serial || 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="no-resources-text-com">No resources allocated</span>
                    )}
                  </div>
                </div>

                {/* Field-by-field details when manager approved and fields exist */}
                {plan.manager_approval === 1 && plan.fields && plan.fields.length > 0 && (
                  <div className="today-plans-fields-wrap-com">
                    <h3 className="today-plans-fields-title-com">Fields</h3>
                    <div className="today-plans-fields-list-com">
                      {plan.fields.map((f, idx) => {
                        const statusInfo = getFieldStatus(f);
                        return (
                          <div key={f.id != null ? f.id : idx} className="today-plan-field-card-com">
                            <div className="today-plan-field-header-com">
                              <span className="today-plan-field-name-com">
                              {f.field_name || f.field || `Field ${idx + 1}`}
                              {Number.isInteger(f.field_id) && <span className="today-plan-field-id-com"> (ID: {f.field_id})</span>}
                            </span>
                              <span className={`today-plan-field-status-badge-com ${statusInfo.className}`}>
                                {statusInfo.label}
                                {statusInfo.reason != null && statusInfo.reason !== '' && (
                                  <span className="today-plan-field-reason-com"> — {statusInfo.reason}</span>
                                )}
                              </span>
                            </div>
                            <div className="today-plan-field-details-com">
                              <div className="today-plan-field-detail-row-com">
                                <span className="field-detail-label-com">Pre-check:</span>
                                <span className="field-detail-value-com">{f.pre_check_list === 1 ? 'Done' : 'Not yet'}</span>
                              </div>
                              <div className="today-plan-field-detail-row-com">
                                <span className="field-detail-label-com">Start time:</span>
                                <span className="field-detail-value-com">{f.start_time != null && f.start_time !== '' ? String(f.start_time) : '—'}</span>
                              </div>
                              <div className="today-plan-field-detail-row-com">
                                <span className="field-detail-label-com">Water received:</span>
                                <span className="field-detail-value-com">
                                  {f.water_received === 1 ? 'Yes' : 'No'}
                                  {f.water_received === 1 && (f.water_received_time || f.water_latitude || f.water_longitude) && (
                                    <span className="field-detail-sub-com">
                                      {f.water_received_time && ` ${String(f.water_received_time)}`}
                                      {(f.water_latitude || f.water_longitude) && ` @ ${[f.water_latitude, f.water_longitude].filter(Boolean).join(', ')}`}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="today-plan-field-detail-row-com">
                                <span className="field-detail-label-com">Chemical received:</span>
                                <span className="field-detail-value-com">
                                  {f.chemical_received === 1 ? 'Yes' : 'No'}
                                  {f.chemical_received === 1 && (f.chemical_received_time || f.chemical_latitude || f.chemical_longitude) && (
                                    <span className="field-detail-sub-com">
                                      {f.chemical_received_time && ` ${String(f.chemical_received_time)}`}
                                      {(f.chemical_latitude || f.chemical_longitude) && ` @ ${[f.chemical_latitude, f.chemical_longitude].filter(Boolean).join(', ')}`}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Missions: one per row (no field details) */}
            {missions.map((mission) => (
              <div
                key={`mission-${mission.id}`}
                className={`today-plan-row-com item-card-com ${mission.is_assigned === 1 ? 'assigned-com' : 'unassigned-com'}`}
              >
                <div className="item-row-1-com">
                  <span className="item-type-badge-com item-type-nonplantation-com">Non Plantation</span>
                  <span className={`status-badge-com ${mission.is_assigned === 1 ? 'assigned-badge-com' : 'unassigned-badge-com'}`}>
                    {mission.is_assigned === 1 ? 'Assigned' : 'Unassigned'}
                  </span>
                </div>
                <div className="item-row-main-com">
                  <div className="item-row-left-com">
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
                  <div className="item-row-pilot-com">
                    {mission.is_assigned === 1 && mission.pilots && mission.pilots.length > 0 ? (
                      mission.pilots.map((pilot, idx) => (
                        <div key={idx} className="resource-badge-com resource-badge-inline-com">
                          <span className="resource-icon-com">✈️</span>
                          <div className="resource-pilot-info-com">
                            <span className="resource-pilot-name-com">{pilot.name}</span>
                            {pilot.mobile_no && pilot.mobile_no.trim() !== '' && (
                              <span className="resource-pilot-mobile-com">{pilot.mobile_no}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="no-resources-text-com">—</span>
                    )}
                  </div>
                  <div className="item-row-drone-com">
                    {mission.is_assigned === 1 && mission.drone ? (
                      <div className="resource-badge-com resource-badge-inline-com">
                        <span className="resource-icon-com">🚁</span>
                        <div className="resource-drone-info-com">
                          <span className="resource-drone-tag-com">{mission.drone.drone_tag || mission.drone.serial || 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="no-resources-text-com">No resources allocated</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayPlans;
