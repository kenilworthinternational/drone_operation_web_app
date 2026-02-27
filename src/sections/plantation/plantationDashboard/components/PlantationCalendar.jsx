import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch } from '../../../../store/hooks';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, getDay } from 'date-fns';
import { useGetCalendarPlansQuery } from '../../../../api/services NodeJs/plantationDashboardApi';
import { baseApi } from '../../../../api/services/allEndpoints';
import { Bars } from 'react-loader-spinner';

const PlantationCalendar = ({ currentMonth, setCurrentMonth, missionType }) => {
  const dispatch = useAppDispatch();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [estateInfo, setEstateInfo] = useState(null);
  const [pilotInfo, setPilotInfo] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [estateLoading, setEstateLoading] = useState(false);
  const [pilotLoading, setPilotLoading] = useState(false);
  const [planError, setPlanError] = useState('');
  const [estateError, setEstateError] = useState('');
  const [pilotError, setPilotError] = useState('');
  const [showPilotModal, setShowPilotModal] = useState(false);
  
  const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  
  const { data, isLoading, error, refetch } = useGetCalendarPlansQuery({
    yearMonth,
    missionType
  });

  const plans = data?.data || [];

  // Group plans by date
  const plansByDate = useMemo(() => {
    const grouped = {};
    plans.forEach(plan => {
      const dateKey = format(new Date(plan.pickedDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(plan);
    });
    return grouped;
  }, [plans]);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ 
      start: startOfMonth(currentMonth), 
      end: endOfMonth(currentMonth) 
    });
  }, [currentMonth]);

  const goPrevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };

  const goNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Refetch when month changes
  useEffect(() => {
    refetch();
  }, [yearMonth, missionType, refetch]);

      // Fetch plan details when a plan is selected
      useEffect(() => {
        let cancelled = false;
        const loadPlanDetails = async () => {
          if (!selectedPlan?.id) {
            setPlanDetails(null);
            return;
          }
          setPlanLoading(true);
          setPlanError('');
          try {
            const result = await dispatch(baseApi.endpoints.getPlanById.initiate(selectedPlan.id));
            const data = result.data;
            if (!cancelled) {
              // Normalize API response
              let normalized = null;
              if (data && (data.status === 'true' || data.status === true)) {
                const firstKey = Object.keys(data).find((k) => !isNaN(k));
                if (firstKey !== undefined) {
                  normalized = data[firstKey];
                }
              } else {
                normalized = data;
              }
              
              // Log the structure for debugging
              console.log('[Plantation Calendar] Plan Details Response:', normalized);
              console.log('[Plantation Calendar] Divisions:', normalized?.diviions || normalized?.divisions);
              
              setPlanDetails(normalized || null);
            }
          } catch (e) {
            console.error('[Plantation Calendar] Error loading plan details:', e);
            if (!cancelled) setPlanError('Failed to load plan details');
          } finally {
            if (!cancelled) setPlanLoading(false);
          }
        };
        loadPlanDetails();
        return () => { cancelled = true; };
      }, [selectedPlan, dispatch]);

  // Fetch estate details when plan is selected
  useEffect(() => {
    let cancelled = false;
    const loadEstate = async () => {
      if (!selectedPlan?.estateId) {
        setEstateInfo(null);
        return;
      }
      setEstateLoading(true);
      setEstateError('');
      try {
        const result = await dispatch(baseApi.endpoints.getEstateDetails.initiate(selectedPlan.estateId));
        const details = result.data;
        if (!cancelled) setEstateInfo(details || null);
      } catch (e) {
        if (!cancelled) setEstateError('Failed to load estate contacts');
      } finally {
        if (!cancelled) setEstateLoading(false);
      }
    };
    loadEstate();
    return () => { cancelled = true; };
  }, [selectedPlan, dispatch]);

  const openPilotModal = async () => {
    if (!selectedPlan) return;
    setShowPilotModal(true);
    setPilotLoading(true);
    setPilotError('');
    setPilotInfo(null);
    try {
      const result = await dispatch(baseApi.endpoints.getPilotDetailsForPlan.initiate(selectedPlan.id));
      const res = result.data;
      let normalized = null;
      if (res && (res.status === 'true' || res.status === true)) {
        const firstKey = Object.keys(res).find((k) => !isNaN(k));
        if (firstKey !== undefined) {
          normalized = res[firstKey];
        }
      }
      setPilotInfo(normalized || res || null);
    } catch (e) {
      setPilotError('Failed to load pilot and equipment details');
    } finally {
      setPilotLoading(false);
    }
  };

  // Map mission type codes to display names
  const getMissionTypeDisplayName = (missionTypeCode) => {
    if (missionTypeCode === 'spy') return 'Spray';
    if (missionTypeCode === 'spd') return 'Spread';
    return missionTypeCode || 'N/A';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="plantation-calendar-section">
      <div className="plantation-calendar-header">
        <button className="plantation-calendar-nav-btn" onClick={goPrevMonth}>
          ◀ Previous
        </button>
        <h2 className="plantation-calendar-month-title">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button className="plantation-calendar-nav-btn" onClick={goNextMonth}>
          Next ▶
        </button>
      </div>

      {isLoading && (
        <div className="plantation-calendar-loading">
          <Bars height="40" width="40" color="#2d8659" />
          <span>Loading calendar data...</span>
        </div>
      )}

      {error && (
        <div className="plantation-calendar-error">
          Error loading calendar data. Please try again.
        </div>
      )}

      {!isLoading && !error && (
        <div className="plantation-calendar-grid">
          {/* Weekday headers */}
          {weekDays.map(day => (
            <div key={day} className="plantation-calendar-weekday">
              {day}
            </div>
          ))}

          {/* Leading blanks */}
          {Array.from({ length: getDay(startOfMonth(currentMonth)) }).map((_, i) => (
            <div key={`blank-${i}`} className="plantation-calendar-day-blank" />
          ))}

          {/* Days */}
          {daysInMonth.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayPlans = plansByDate[dateKey] || [];
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div 
                key={dateKey} 
                className={`plantation-calendar-day ${isToday ? 'today' : ''}`}
              >
                <div className="plantation-calendar-day-header">
                  <span className="plantation-calendar-day-number">
                    {format(day, 'd')}
                  </span>
                  {dayPlans.length > 0 && (
                    <span className="plantation-calendar-plan-count">
                      ({dayPlans.length} {dayPlans.length === 1 ? 'plan' : 'plans'})
                    </span>
                  )}
                </div>
                {dayPlans.length > 0 && (
                  <div className="plantation-calendar-day-plans">
                    {dayPlans.map(plan => (
                      <div 
                        key={plan.id} 
                        className="plantation-calendar-plan-item"
                        title={`${plan.estate_name || 'Estate'} - Plan ${plan.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlan(plan);
                        }}
                      >
                        {plan.estate_name || `Plan ${plan.id}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="plantation-plan-modal-overlay" onClick={() => setSelectedPlan(null)}>
          <div className="plantation-plan-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="plantation-plan-modal-header">
              <div className="plantation-plan-modal-title-group">
                <div className="plantation-plan-modal-title">Plan #{selectedPlan.id}</div>
                <div className="plantation-plan-modal-subtitle">
                  {format(new Date(selectedPlan.pickedDate), 'yyyy-MM-dd')} · {selectedPlan.estate_name || 'Estate'}
                </div>
              </div>
              <button className="plantation-plan-modal-close" onClick={() => setSelectedPlan(null)} aria-label="Close">
                ×
              </button>
            </div>

            <div className="plantation-plan-modal-body">
              {planLoading && (
                <div className="plantation-plan-modal-loading">
                  <Bars height="30" width="30" color="#2d8659" />
                  <span>Loading plan details...</span>
                </div>
              )}

              {planError && (
                <div className="plantation-plan-modal-error">{planError}</div>
              )}

              {!planLoading && !planError && planDetails && (
                <>
                  {/* Contacts Card */}
                  <div className="plantation-plan-contacts-card">
                    <div className="plantation-plan-contacts-header">
                      <span className="plantation-plan-contacts-title">Contacts</span>
                    </div>
                    <div className="plantation-plan-contacts-body">
                      {estateLoading && <div className="plantation-plan-contacts-loading">Loading contacts...</div>}
                      {estateError && <div className="plantation-plan-contacts-error">{estateError}</div>}
                      {!estateLoading && !estateError && (
                        <>
                          {(() => {
                            const mgrs = Array.isArray(estateInfo?.manager) ? estateInfo.manager : [];
                            const primary = mgrs.length > 0 ? mgrs[0] : null;
                            if (primary) {
                              return (
                                <div className="plantation-plan-contact-primary">
                                  <div className="plantation-plan-contact-role">{primary.appointment || 'Manager'}</div>
                                  <div className="plantation-plan-contact-name">{primary.name || 'N/A'}</div>
                                  <a className="plantation-plan-contact-phone" href={`tel:${primary.mobile || ''}`}>
                                    {primary.mobile || 'N/A'}
                                  </a>
                                </div>
                              );
                            }
                            if (estateInfo?.telephone) {
                              return (
                                <div className="plantation-plan-contact-primary">
                                  <div className="plantation-plan-contact-role">Estate</div>
                                  <div className="plantation-plan-contact-name">{estateInfo?.estate_name || selectedPlan.estate_name}</div>
                                  <a className="plantation-plan-contact-phone" href={`tel:${estateInfo.telephone}`}>
                                    {estateInfo.telephone}
                                  </a>
                                </div>
                              );
                            }
                            return <div className="plantation-plan-contacts-empty">No contact details available.</div>;
                          })()}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Summary Row */}
                  <div className="plantation-plan-summary-row">
                    <span className="plantation-plan-badge">
                      {getMissionTypeDisplayName(planDetails.mission_type_name || planDetails.missionTypeId)}
                    </span>
                    <span className="plantation-plan-badge">
                      Area: {parseFloat(planDetails.area || planDetails.totalExtent || 0).toFixed(2)} Ha
                    </span>
                    {planDetails.manager_approval ? (
                      <span className="plantation-plan-badge-success">Manager Approved</span>
                    ) : (
                      <span className="plantation-plan-badge-warn">Pending Approval</span>
                    )}
                    {planDetails.team_assigned === 1 ? (
                      <span className="plantation-plan-badge-success">Team Assigned</span>
                    ) : (
                      <span className="plantation-plan-badge-warn">Team Not Assigned</span>
                    )}
                    {planDetails.team_assigned === 1 && (
                      <button className="plantation-plan-pilot-btn" onClick={openPilotModal}>
                        View Pilot and Equipment Details
                      </button>
                    )}
                  </div>

                  {/* Divisions and Fields List */}
                  {(() => {
                    // Handle different response structures: diviions, divisions, or checkedFields
                    let divisions = planDetails.diviions || planDetails.divisions || [];
                    
                    // If divisions structure has checkedFields (from CalenderWidget pattern)
                    if (divisions.length > 0 && divisions[0]?.checkedFields) {
                      divisions = divisions.map(div => ({
                        id: div.divisionId || div.id,
                        division: div.divisionName || div.division,
                        fields: (div.checkedFields || []).map(f => ({
                          id: f.field_id || f.id,
                          field: f.field_name || f.field,
                          field_short_name: f.field_short_name || f.field_name || f.field,
                          area: f.field_area || f.area,
                          activated: f.activated
                        }))
                      }));
                    }
                    
                    // If no divisions but we have fields directly
                    if (divisions.length === 0 && planDetails.fields) {
                      divisions = [{
                        id: 'all',
                        division: 'All Fields',
                        fields: planDetails.fields
                      }];
                    }

                    if (divisions.length > 0) {
                      return (
                        <div className="plantation-plan-divisions-list">
                          {divisions.map((div, divIndex) => {
                            const totalArea = (div.fields || []).reduce((sum, f) => {
                              const area = Number(f.area || f.field_area || 0);
                              return sum + (f.activated !== 0 ? area : 0);
                            }, 0);
                            const activeFields = (div.fields || []).filter(f => f.activated !== 0);
                            
                            return (
                              <div key={div.id || divIndex} className="plantation-plan-division-card">
                                <div className="plantation-plan-division-header">
                                  <span className="plantation-plan-division-title">
                                    {div.division || div.divisionName || 'Division'} - {totalArea.toFixed(2)} Ha
                                  </span>
                                  <span className="plantation-plan-division-count">
                                    {activeFields.length} {activeFields.length === 1 ? 'field' : 'fields'}
                                  </span>
                                </div>
                                {activeFields.length > 0 ? (
                                  <div className="plantation-plan-fields-grid">
                                    {activeFields.map((f, fieldIndex) => {
                                      const fieldArea = parseFloat(f.area || f.field_area || 0).toFixed(2);
                                      const fieldName = f.field_short_name || f.field_name || f.field || `Field ${f.id || fieldIndex}`;
                                      
                                      return (
                                        <div
                                          key={f.id || f.field_id || fieldIndex}
                                          className={`plantation-plan-field-tile plantation-plan-field-active`}
                                          title={f.field_name || f.field || fieldName}
                                        >
                                          <div className="plantation-plan-field-tile-name">
                                            {fieldName}
                                          </div>
                                          <div className="plantation-plan-field-tile-area">{fieldArea} Ha</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="plantation-plan-no-fields">No active fields in this division.</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    
                    // Fallback: Show message if no divisions/fields found
                    return (
                      <div className="plantation-plan-no-divisions">
                        <p>No field details available for this plan.</p>
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                          Plan ID: {selectedPlan.id}
                        </p>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            <div className="plantation-plan-modal-footer">
              <button className="plantation-plan-modal-close-btn" onClick={() => setSelectedPlan(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pilot Details Modal */}
      {showPilotModal && selectedPlan && (
        <div className="plantation-plan-modal-overlay" onClick={() => setShowPilotModal(false)}>
          <div className="plantation-plan-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="plantation-plan-modal-header">
              <div className="plantation-plan-modal-title-group">
                <div className="plantation-plan-modal-title">Pilot and Equipment Details</div>
                <div className="plantation-plan-modal-subtitle">
                  Plan #{selectedPlan.id} · {selectedPlan.estate_name}
                </div>
              </div>
              <button className="plantation-plan-modal-close" onClick={() => setShowPilotModal(false)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="plantation-plan-modal-body">
              {pilotLoading && <div className="plantation-plan-contacts-loading">Loading...</div>}
              {pilotError && <div className="plantation-plan-contacts-error">{pilotError}</div>}
              {!pilotLoading && !pilotError && pilotInfo && (
                <div className="plantation-plan-pilot-wrap">
                  {pilotInfo.team_lead && (
                    <div className="plantation-plan-pilot-section">
                      <div className="plantation-plan-contacts-section-title">Team Lead</div>
                      <div className="plantation-plan-contact-row">
                        <div className="plantation-plan-contact-row-left">
                          <div className="plantation-plan-contact-row-name">{pilotInfo.team_lead}</div>
                          <div className="plantation-plan-contact-row-role">Team Lead</div>
                        </div>
                        {pilotInfo.team_lead_mobile && (
                          <a className="plantation-plan-contact-row-phone" href={`tel:${pilotInfo.team_lead_mobile}`}>
                            {pilotInfo.team_lead_mobile}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {Array.isArray(pilotInfo.pilots) && pilotInfo.pilots.length > 0 && (
                    <div className="plantation-plan-pilot-section">
                      <div className="plantation-plan-contacts-section-title">Pilots</div>
                      <div className="plantation-plan-contacts-list">
                        {pilotInfo.pilots.map((p) => (
                          <div key={p.pilot_id} className="plantation-plan-contact-row">
                            <div className="plantation-plan-contact-row-left">
                              <div className="plantation-plan-contact-row-name">{p.pilot}</div>
                              <div className="plantation-plan-contact-row-role">
                                {p.is_leader === 1 ? 'Leader' : 'Pilot'}
                              </div>
                            </div>
                            {p.mobile && (
                              <a className="plantation-plan-contact-row-phone" href={`tel:${p.mobile}`}>
                                {p.mobile}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(pilotInfo.equipment) && pilotInfo.equipment.length > 0 && (
                    <div className="plantation-plan-pilot-section">
                      <div className="plantation-plan-contacts-section-title">Equipment</div>
                      <div className="plantation-plan-contacts-list">
                        {pilotInfo.equipment.map((eq) => (
                          <div key={eq.equipment_id} className="plantation-plan-contact-row">
                            <div className="plantation-plan-contact-row-left">
                              <div className="plantation-plan-contact-row-name">{eq.equipment_name || eq.equipment}</div>
                              <div className="plantation-plan-contact-row-role">
                                {eq.equipment_type || 'Equipment'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!pilotInfo.team_lead && (!Array.isArray(pilotInfo.pilots) || pilotInfo.pilots.length === 0)) && (
                    <div className="plantation-plan-contacts-empty">No pilot or equipment details available.</div>
                  )}
                </div>
              )}
            </div>
            <div className="plantation-plan-modal-footer">
              <button className="plantation-plan-modal-close-btn" onClick={() => setShowPilotModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantationCalendar;
