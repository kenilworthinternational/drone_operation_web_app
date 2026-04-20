import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns';
import { Bars } from 'react-loader-spinner';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import '../../../styles/planCalendar.css';

const PLAN_TYPE_META = [
  { key: 'np', label: 'Revolving' },
  { key: 'ap', label: 'AddHoc' },
  { key: 'rp', label: 'Rescheduled' },
];

const PLAN_STATUS_META = [
  { key: 'not_activated', label: 'Not Activated', color: '#BEBEBE' },
  { key: 'active', label: 'Active', color: '#60a5fa' },
  { key: 'manager_approved', label: 'Manager Approved', color: '#f97316' },
  { key: 'team_assigned', label: 'Team Assigned', color: '#eab308' },
  { key: 'completed', label: 'Completed', color: '#22c55e' },
];

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
  const [selectedTypes, setSelectedTypes] = useState(new Set(PLAN_TYPE_META.map((item) => item.key)));
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(PLAN_STATUS_META.map((item) => item.key)));
  const [showHierarchyFilter, setShowHierarchyFilter] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedPlantation, setSelectedPlantation] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedEstate, setSelectedEstate] = useState('');
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

  const allPlansForMonth = useMemo(() => Object.values(plansByDate).flat(), [plansByDate]);

  const getPlanStatusKey = (plan) => {
    const activated = Number(plan.activated) === 1;
    const managerApproved = Number(plan.manager_approval) === 1;
    const teamAssigned = Number(plan.team_assigned) === 1;
    const completed = Number(plan.completed) === 1;

    if (!activated) return 'not_activated';
    if (activated && managerApproved && teamAssigned && completed) return 'completed';
    if (activated && managerApproved && teamAssigned) return 'team_assigned';
    if (activated && managerApproved) return 'manager_approved';
    return 'active';
  };

  const getPlanStatusColor = (plan) => {
    const key = getPlanStatusKey(plan);
    return PLAN_STATUS_META.find((s) => s.key === key)?.color || '#60a5fa';
  };

  const hierarchyData = useMemo(() => {
    const groupsMap = new Map();
    const plantationsMap = new Map();
    const regionsMap = new Map();
    const estatesMap = new Map();

    allPlansForMonth.forEach((plan) => {
      const groupId = String(plan.group_id ?? plan.groupId ?? plan.group ?? '');
      const groupName = String(plan.group ?? plan.group_name ?? groupId);
      const plantationId = String(plan.plantation_id ?? plan.plantationId ?? plan.plantation ?? '');
      const plantationName = String(plan.plantation ?? plan.plantation_name ?? plantationId);
      const regionId = String(plan.region_id ?? plan.regionId ?? plan.region ?? '');
      const regionName = String(plan.region ?? plan.region_name ?? regionId);
      const estateId = String(plan.estate_id ?? plan.estateId ?? plan.estate ?? '');
      const estateName = String(plan.estate ?? plan.estate_name ?? estateId);

      if (!groupId || !plantationId || !regionId || !estateId) return;

      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, { id: groupId, name: groupName });
      }
      if (!plantationsMap.has(plantationId)) {
        plantationsMap.set(plantationId, { id: plantationId, name: plantationName, groupId });
      }
      if (!regionsMap.has(regionId)) {
        regionsMap.set(regionId, { id: regionId, name: regionName, plantationId, groupId });
      }
      if (!estatesMap.has(estateId)) {
        estatesMap.set(estateId, { id: estateId, name: estateName, regionId, plantationId, groupId });
      }
    });

    const sortByName = (a, b) => a.name.localeCompare(b.name);

    return {
      groups: Array.from(groupsMap.values()).sort(sortByName),
      plantations: Array.from(plantationsMap.values()).sort(sortByName),
      regions: Array.from(regionsMap.values()).sort(sortByName),
      estates: Array.from(estatesMap.values()).sort(sortByName),
    };
  }, [allPlansForMonth]);

  const plantationOptions = useMemo(() => {
    if (!selectedGroup) return hierarchyData.plantations;
    return hierarchyData.plantations.filter((item) => item.groupId === selectedGroup);
  }, [hierarchyData.plantations, selectedGroup]);

  const regionOptions = useMemo(() => {
    if (selectedPlantation) {
      return hierarchyData.regions.filter((item) => item.plantationId === selectedPlantation);
    }
    if (selectedGroup) {
      return hierarchyData.regions.filter((item) => item.groupId === selectedGroup);
    }
    return hierarchyData.regions;
  }, [hierarchyData.regions, selectedGroup, selectedPlantation]);

  const estateOptions = useMemo(() => {
    if (selectedRegion) {
      return hierarchyData.estates.filter((item) => item.regionId === selectedRegion);
    }
    if (selectedPlantation) {
      return hierarchyData.estates.filter((item) => item.plantationId === selectedPlantation);
    }
    if (selectedGroup) {
      return hierarchyData.estates.filter((item) => item.groupId === selectedGroup);
    }
    return hierarchyData.estates;
  }, [hierarchyData.estates, selectedGroup, selectedPlantation, selectedRegion]);

  const filteredPlansByDate = useMemo(() => {
    const grouped = {};
    Object.entries(plansByDate).forEach(([date, plans]) => {
      const matched = plans.filter((plan) => {
        const typeMatch = selectedTypes.has(plan.flag);
        const statusMatch = selectedStatuses.has(getPlanStatusKey(plan));
        const groupId = String(plan.group_id ?? plan.groupId ?? plan.group ?? '');
        const plantationId = String(plan.plantation_id ?? plan.plantationId ?? plan.plantation ?? '');
        const regionId = String(plan.region_id ?? plan.regionId ?? plan.region ?? '');
        const estateId = String(plan.estate_id ?? plan.estateId ?? plan.estate ?? '');

        const hierarchyMatch =
          (!selectedGroup || groupId === selectedGroup) &&
          (!selectedPlantation || plantationId === selectedPlantation) &&
          (!selectedRegion || regionId === selectedRegion) &&
          (!selectedEstate || estateId === selectedEstate);

        return typeMatch && statusMatch && hierarchyMatch;
      });
      if (matched.length > 0) {
        grouped[date] = matched;
      }
    });
    return grouped;
  }, [plansByDate, selectedTypes, selectedStatuses, selectedGroup, selectedPlantation, selectedRegion, selectedEstate]);

  const toggleType = (key) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleStatus = (key) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
    setSelectedPlantation('');
    setSelectedRegion('');
    setSelectedEstate('');
  };

  const handlePlantationChange = (value) => {
    setSelectedPlantation(value);
    setSelectedRegion('');
    setSelectedEstate('');
    if (!value) return;
    const selected = hierarchyData.plantations.find((item) => item.id === value);
    if (selected) {
      setSelectedGroup(selected.groupId);
    }
  };

  const handleRegionChange = (value) => {
    setSelectedRegion(value);
    setSelectedEstate('');
    if (!value) return;
    const selected = hierarchyData.regions.find((item) => item.id === value);
    if (selected) {
      setSelectedPlantation(selected.plantationId);
      setSelectedGroup(selected.groupId);
    }
  };

  const handleEstateChange = (value) => {
    setSelectedEstate(value);
    if (!value) return;
    const selected = hierarchyData.estates.find((item) => item.id === value);
    if (selected) {
      setSelectedRegion(selected.regionId);
      setSelectedPlantation(selected.plantationId);
      setSelectedGroup(selected.groupId);
    }
  };

  const clearHierarchyFilters = () => {
    setSelectedGroup('');
    setSelectedPlantation('');
    setSelectedRegion('');
    setSelectedEstate('');
  };

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

      <div className="top-filters-booking-calendar">
        <div className="top-filter-group-booking-calendar">
          <span className="legend-label-booking-calendar">Type:</span>
          {PLAN_TYPE_META.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`legend-chip-booking-calendar ${item.key === 'np' ? 'legend-chip-revolving' : item.key === 'ap' ? 'legend-chip-adhoc' : 'legend-chip-rescheduled'} ${selectedTypes.has(item.key) ? 'legend-chip-selected-booking-calendar' : 'legend-chip-unselected-booking-calendar'}`}
              onClick={() => toggleType(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="top-filter-group-booking-calendar">
          <span className="legend-label-booking-calendar">Status:</span>
          {PLAN_STATUS_META.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`legend-dot-item top-filter-status-booking-calendar ${selectedStatuses.has(item.key) ? 'legend-dot-selected-booking-calendar' : 'legend-dot-unselected-booking-calendar'}`}
              onClick={() => toggleStatus(item.key)}
            >
              <span className="legend-dot" style={{ background: item.color }} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="hierarchy-filter-wrap-booking-calendar">
        <button
          type="button"
          className={`hierarchy-filter-btn-booking-calendar ${showHierarchyFilter ? 'hierarchy-filter-btn-open-booking-calendar' : ''}`}
          onClick={() => setShowHierarchyFilter((v) => !v)}
          aria-expanded={showHierarchyFilter}
          aria-label="Open hierarchy filters"
        >
          <span className="hierarchy-filter-icon-booking-calendar">⚲</span>
          <span>Filter Options</span>
        </button>
        {(selectedGroup || selectedPlantation || selectedRegion || selectedEstate) && (
          <button type="button" className="hierarchy-clear-btn-booking-calendar" onClick={clearHierarchyFilters}>
            Clear
          </button>
        )}
      </div>
      </div>

      

      {showHierarchyFilter && (
        <div className="hierarchy-filter-popup-booking-calendar">
          <div className="hierarchy-filter-grid-booking-calendar">
            <label className="hierarchy-filter-field-booking-calendar">
              <span>Group</span>
              <select value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)}>
                <option value="">All Groups</option>
                {hierarchyData.groups.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="hierarchy-filter-field-booking-calendar">
              <span>Plantation</span>
              <select value={selectedPlantation} onChange={(e) => handlePlantationChange(e.target.value)}>
                <option value="">All Plantations</option>
                {plantationOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="hierarchy-filter-field-booking-calendar">
              <span>Region</span>
              <select value={selectedRegion} onChange={(e) => handleRegionChange(e.target.value)}>
                <option value="">All Regions</option>
                {regionOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="hierarchy-filter-field-booking-calendar">
              <span>Estate</span>
              <select value={selectedEstate} onChange={(e) => handleEstateChange(e.target.value)}>
                <option value="">All Estates</option>
                {estateOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

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
          const flagOrder = { np: 0, ap: 1, rp: 2 };
          const items = (filteredPlansByDate[key] || []).slice().sort((a, b) => {
            const aActive = Number(a.activated) === 1 ? 0 : 1;
            const bActive = Number(b.activated) === 1 ? 0 : 1;
            if (aActive !== bActive) return aActive - bActive;
            return (flagOrder[a.flag] ?? 3) - (flagOrder[b.flag] ?? 3);
          });
          const count = items.length;
          return (
            <div key={key} className="cell-booking-calendar">
              <div className="cell-header-booking-calendar">
                <span className="daynum-booking-calendar">{format(day, 'd')}</span>
                {count > 0 && <span className="count-booking-calendar">{count}</span>}
              </div>
              <div className="items-booking-calendar">
                {items.map((p) => {
                  const planTypeClass =
                    p.flag === 'ap' ? 'item-type-adhoc' :
                    p.flag === 'rp' ? 'item-type-rescheduled' :
                    'item-type-revolving';

                  const statusColor = getPlanStatusColor(p);

                  return (
                    <div
                      key={p.id}
                      className={`item-booking-calendar ${planTypeClass}`}
                      title={`${p.estate} - #${p.id}`}
                      onClick={() => setSelectedPlan(p)}
                    >
                      <span className="item-status-dot" style={{ background: statusColor }} />
                      <span className="item-text-booking-calendar">{p.estate} · {p.id}</span>
                    </div>
                  );
                })}
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


