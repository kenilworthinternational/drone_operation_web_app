import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns';
import { Bars } from 'react-loader-spinner';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import '../../../styles/planCalendar.css';

const PlanCalendar = () => {
  const dispatch = useAppDispatch();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plansByDate, setPlansByDate] = useState({});
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [estateInfo, setEstateInfo] = useState(null);
  const [estateLoading, setEstateLoading] = useState(false);
  const [estateError, setEstateError] = useState('');
  const [showOtherContacts, setShowOtherContacts] = useState(false);
  const [showOtherContactsModal, setShowOtherContactsModal] = useState(false);
  const [showPilotModal, setShowPilotModal] = useState(false);
  const [pilotInfo, setPilotInfo] = useState(null);
  const [pilotLoading, setPilotLoading] = useState(false);
  const [pilotError, setPilotError] = useState('');
  const navigate = useNavigate();

  const monthRange = useMemo(() => {
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    return { start, end };
  }, [currentMonth]);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await dispatch(baseApi.endpoints.getAllPlansByDateRange.initiate({
          startDate: monthRange.start,
          endDate: monthRange.end
        }));
        const data = result.data;
        if (isCancelled) return;
        const grouped = {};
        if (data && (data.status === 'true' || data.status === true)) {
          Object.keys(data)
            .filter((k) => !isNaN(k))
            .forEach((k) => {
              const item = data[k];
              const dateKey = item.date;
              if (!grouped[dateKey]) grouped[dateKey] = [];
              grouped[dateKey].push(item);
            });
        }
        setPlansByDate(grouped);
      } catch (e) {
        if (!isCancelled) setError('Failed to load calendar data');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isCancelled = true;
    };
  }, [monthRange]);

  useEffect(() => {
    let cancelled = false;
    const loadEstate = async () => {
      if (!selectedPlan?.estate_id) {
        setEstateInfo(null);
        return;
      }
      setEstateLoading(true);
      setEstateError('');
      try {
        const result = await dispatch(baseApi.endpoints.getEstateDetails.initiate(selectedPlan.estate_id));
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
  }, [selectedPlan]);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  }, [currentMonth]);

  const goPrevMonth = () => setCurrentMonth((d) => addMonths(d, -1));
  const goNextMonth = () => setCurrentMonth((d) => addMonths(d, 1));

  const openPilotModal = async () => {
    if (!selectedPlan) return;
    setShowPilotModal(true);
    setPilotLoading(true);
    setPilotError('');
    setPilotInfo(null);
    try {
      const result = await dispatch(baseApi.endpoints.getPilotDetailsForPlan.initiate(selectedPlan.id));
      const res = result.data;
      // Normalize API response: pick first numeric key item if status true
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

  return (
    <div className="wrapper-booking-calendar">
      <div className="header-booking-calendar">
        <button className="back-btn-booking-calendar" onClick={() => navigate(-1)} aria-label="Back">
          <svg className="back-icon-booking-calendar" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <div className="center-header-booking-calendar">
          
          <div className="controls-booking-calendar">
          <div className="heading-booking-calendar">Plan Calendar</div>
            <button className="nav-btn-booking-calendar" onClick={goPrevMonth} aria-label="Previous month">◀</button>
            <div className="month-title-booking-calendar">{format(currentMonth, 'MMMM yyyy')}</div>
            <button className="nav-btn-booking-calendar" onClick={goNextMonth} aria-label="Next month">▶</button>
          </div>
        </div>
      </div>

      {(loading) && (
        <div className="loading-overlay-booking-calendar">
          <div className="loading-content-booking-calendar">
            <Bars height="40" width="40" color="#003057" ariaLabel="bars-loading" visible={true} />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {error && <div className="error-booking-calendar">{error}</div>}

      <div className="grid-booking-calendar">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="weekday-booking-calendar">{d}</div>
        ))}
        {/* leading blanks */}
        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
          <div key={`blank-${i}`} className="cell-blank-booking-calendar" />
        ))}

        {daysInMonth.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const items = (plansByDate[key] || []).filter((p) => p.activated === 1);
          const count = items.length;
          return (
            <div key={key} className="cell-booking-calendar">
              <div className="cell-header-booking-calendar">
                <span className="daynum-booking-calendar">{format(day, 'd')}</span>
                {count > 0 && <span className="count-booking-calendar">{count}</span>}
              </div>
              <div className="items-booking-calendar">
                {items.map((p) => (
                  <div key={p.id} className="item-booking-calendar" title={`${p.estate} - ${p.id}`} onClick={() => setSelectedPlan(p)}>
                    <span className="item-text-booking-calendar">{p.estate} · {p.id}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="modal-overlay-booking-calendar" onClick={() => setSelectedPlan(null)}>
          <div className="modal-booking-calendar" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-booking-calendar">
              <div className="modal-title-group-booking-calendar">
                <div className="modal-title-booking-calendar">Plan #{selectedPlan.id}</div>
                <div className="modal-subtitle-booking-calendar">
                  {selectedPlan.date} · {selectedPlan.group} · {selectedPlan.plantation} · {selectedPlan.estate}
                </div>
              </div>
              <button className="modal-close-booking-calendar" onClick={() => setSelectedPlan(null)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="modal-body-booking-calendar">
              <div className="contacts-card-booking-calendar">
                <div className="contacts-header-booking-calendar">
                  <span className="contacts-title-booking-calendar">Contacts</span>
                  <div className="contacts-actions-booking-calendar">
                    <button
                      className="contacts-btn-booking-calendar"
                      onClick={() => setShowOtherContactsModal(true)}
                      disabled={estateLoading || !estateInfo}
                    >
                      Other contacts
                    </button>
                  </div>
                </div>
                <div className="contacts-body-booking-calendar">
                  {estateLoading && <div className="contacts-loading-booking-calendar">Loading contacts...</div>}
                  {estateError && <div className="contacts-error-booking-calendar">{estateError}</div>}
                  {!estateLoading && !estateError && (
                    <>
                      {(() => {
                        const mgrs = Array.isArray(estateInfo?.manager) ? estateInfo.manager : [];
                        const primary = mgrs.length > 0 ? mgrs[0] : null;
                        if (primary) {
                          return (
                            <div className="contact-primary-booking-calendar">
                              <div className="contact-role-booking-calendar">{primary.appointment || 'Manager'}</div>
                              <div className="contact-name-booking-calendar">{primary.name || 'N/A'}</div>
                              <a className="contact-phone-booking-calendar" href={`tel:${primary.mobile || ''}`}>{primary.mobile || 'N/A'}</a>
                            </div>
                          );
                        }
                        if (estateInfo?.telephone) {
                          return (
                            <div className="contact-primary-booking-calendar">
                              <div className="contact-role-booking-calendar">Estate</div>
                              <div className="contact-name-booking-calendar">{estateInfo?.estate_name || selectedPlan.estate}</div>
                              <a className="contact-phone-booking-calendar" href={`tel:${estateInfo.telephone}`}>{estateInfo.telephone}</a>
                            </div>
                          );
                        }
                        return <div className="contacts-empty-booking-calendar">No contact details available.</div>;
                      })()}

                      {/* Other contacts moved to a dedicated modal for better UX */}
                    </>
                  )}
                </div>
              </div>
              <div className="summary-row-booking-calendar">
                <span className="badge-booking-calendar">{selectedPlan.mission_type_name}</span>
                <span className="badge-booking-calendar">Area: {selectedPlan.area} Ha</span>
                {selectedPlan.manager_approval ? <span className="badge-success-booking-calendar">Manager Approved</span> : <span className="badge-warn-booking-calendar">Pending Approval</span>}
                {selectedPlan.team_assigned === 1 ? (
                  <span className="badge-success-booking-calendar">Team Assigned</span>
                ) : (
                  <span className="badge-warn-booking-calendar">Team Not Assigned</span>
                )}
                {selectedPlan.team_assigned === 1 && (
                  <button className="pilot-btn-booking-calendar" onClick={openPilotModal}>View Pilot and Equipment Details</button>
                )}
              </div>

              <div className="divisions-list-booking-calendar">
                {(selectedPlan.diviions || []).map((div) => {
                  const totalArea = (div.fields || []).reduce((sum, f) => sum + (Number(f.area) || 0), 0);
                  return (
                    <div key={div.id} className="division-card-booking-calendar">
                      <div className="division-header-booking-calendar">
                        <span className="division-title-booking-calendar">{div.division} - {totalArea.toFixed(2)} Ha</span>
                        <span className="division-count-booking-calendar">{(div.fields || []).length} fields</span>
                      </div>
                      <div className="fields-grid-booking-calendar">
                        {(div.fields || []).map((f) => (
                          <div
                            key={f.id}
                            className={`field-tile-booking-calendar ${f.activated === 1 ? 'field-tile-active-booking-calendar' : 'field-tile-inactive-booking-calendar'}`}
                            title={f.field}
                          >
                            <div className="field-tile-name-booking-calendar">{f.field_short_name || f.field}</div>
                            <div className="field-tile-area-booking-calendar">{f.area} Ha</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer-booking-calendar">
              <button className="modal-close-btn-booking-calendar" onClick={() => setSelectedPlan(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showPilotModal && (
        <div className="modal-overlay-booking-calendar" onClick={() => setShowPilotModal(false)}>
          <div className="modal-booking-calendar" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-booking-calendar">
              <div className="modal-title-group-booking-calendar">
                <div className="modal-title-booking-calendar">Pilot and Equipment Details</div>
                <div className="modal-subtitle-booking-calendar">Plan #{selectedPlan?.id} · {selectedPlan?.estate}</div>
              </div>
              <button className="modal-close-booking-calendar" onClick={() => setShowPilotModal(false)} aria-label="Close">✕</button>
            </div>
            <div className="modal-body-booking-calendar">
              {pilotLoading && <div className="contacts-loading-booking-calendar">Loading...</div>}
              {pilotError && <div className="contacts-error-booking-calendar">{pilotError}</div>}
              {!pilotLoading && !pilotError && pilotInfo && (
                <div className="pilot-wrap-booking-calendar">
                  {pilotInfo.team_lead && (
                    <div className="pilot-section-booking-calendar">
                      <div className="contacts-section-title-booking-calendar">Team Lead</div>
                      <div className="contact-row-booking-calendar">
                        <div className="contact-row-left-booking-calendar">
                          <div className="contact-row-name-booking-calendar">{pilotInfo.team_lead}</div>
                          <div className="contact-row-role-booking-calendar">Team Lead</div>
                        </div>
                        {pilotInfo.team_lead_mobile && (
                          <a className="contact-row-phone-booking-calendar" href={`tel:${pilotInfo.team_lead_mobile}`}>{pilotInfo.team_lead_mobile}</a>
                        )}
                      </div>
                    </div>
                  )}

                  {Array.isArray(pilotInfo.pilots) && pilotInfo.pilots.length > 0 && (
                    <div className="pilot-section-booking-calendar">
                      <div className="contacts-section-title-booking-calendar">Pilots</div>
                      <div className="contacts-list-booking-calendar">
                        {pilotInfo.pilots.map((p) => (
                          <div key={p.pilot_id} className="contact-row-booking-calendar">
                            <div className="contact-row-left-booking-calendar">
                              <div className="contact-row-name-booking-calendar">{p.pilot}</div>
                              <div className="contact-row-role-booking-calendar">{p.is_leader === 1 ? 'Leader' : 'Pilot'}</div>
                            </div>
                            {p.mobile && (
                              <a className="contact-row-phone-booking-calendar" href={`tel:${p.mobile}`}>{p.mobile}</a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(pilotInfo.drones) && pilotInfo.drones.length > 0 && (
                    <div className="pilot-section-booking-calendar">
                      <div className="contacts-section-title-booking-calendar">Drones</div>
                      <div className="drone-tags-booking-calendar">
                        {pilotInfo.drones.map((d) => (
                          <span key={d.id} className="drone-tag-booking-calendar">{d.tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer-booking-calendar">
              <button className="modal-close-btn-booking-calendar" onClick={() => setShowPilotModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showOtherContactsModal && (
        <div className="modal-overlay-booking-calendar" onClick={() => setShowOtherContactsModal(false)}>
          <div className="modal-booking-calendar" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-booking-calendar">
              <div className="modal-title-group-booking-calendar">
                <div className="modal-title-booking-calendar">Other Contacts</div>
                <div className="modal-subtitle-booking-calendar">{selectedPlan?.estate}</div>
              </div>
              <button className="modal-close-booking-calendar" onClick={() => setShowOtherContactsModal(false)} aria-label="Close">✕</button>
            </div>
            <div className="modal-body-booking-calendar">
              {estateLoading && <div className="contacts-loading-booking-calendar">Loading contacts...</div>}
              {estateError && <div className="contacts-error-booking-calendar">{estateError}</div>}
              {!estateLoading && !estateError && (
                <div className="contacts-others-booking-calendar">
                  {Array.isArray(estateInfo?.manager) && estateInfo.manager.slice(1).length > 0 && (
                    <div className="contacts-section-booking-calendar">
                      <div className="contacts-section-title-booking-calendar">Other Managers</div>
                      <div className="contacts-list-booking-calendar">
                        {estateInfo.manager.slice(1).map((m, idx) => (
                          <div key={`mgr-${idx}`} className="contact-row-booking-calendar">
                            <div className="contact-row-left-booking-calendar">
                              <div className="contact-row-name-booking-calendar">{m.name}</div>
                              <div className="contact-row-role-booking-calendar">{m.appointment}</div>
                            </div>
                            <a className="contact-row-phone-booking-calendar" href={`tel:${m.mobile}`}>{m.mobile}</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(estateInfo?.other_personals) && estateInfo.other_personals.length > 0 && (
                    <div className="contacts-section-booking-calendar">
                      <div className="contacts-section-title-booking-calendar">Other Personals</div>
                      <div className="contacts-list-booking-calendar">
                        {estateInfo.other_personals.map((p, idx) => (
                          <div key={`pers-${idx}`} className="contact-row-booking-calendar">
                            <div className="contact-row-left-booking-calendar">
                              <div className="contact-row-name-booking-calendar">{p.name}</div>
                              <div className="contact-row-role-booking-calendar">{p.appointment}</div>
                              {Array.isArray(p.divisions) && p.divisions.length > 0 && (
                                <div className="contact-row-divisions-booking-calendar">
                                  {p.divisions.map((d) => d.division).join(', ')}
                                </div>
                              )}
                            </div>
                            <a className="contact-row-phone-booking-calendar" href={`tel:${p.mobile}`}>{p.mobile}</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer-booking-calendar">
              <button className="modal-close-btn-booking-calendar" onClick={() => setShowOtherContactsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCalendar;


