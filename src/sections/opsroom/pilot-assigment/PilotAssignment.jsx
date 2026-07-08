import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bars } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  useGetPilotAssignmentPlansQuery,
  useGetPilotAssignmentMissionsQuery,
  useGetPilotAssignmentPilotsQuery,
  useGetPilotAssignmentDroneQuery,
  useCreatePilotAssignmentMutation,
  useGetPilotTransportOptionsQuery,
  useAssignPilotTransportDetailsMutation,
  useGetAllTeamsQuery,
} from '../../../api/services NodeJs/allEndpoints';
import TransportAssignmentFields from './TransportAssignmentFields';
import { formatDriverArrivalTimeForInput } from '../../../utils/transportAssignment';
import { useGetMyPermissionsQuery } from '../../../api/services NodeJs/featurePermissionsApi';
import { FEATURE_CODES } from '../../../utils/featurePermissions';
import { isInternalDeveloper } from '../../../utils/authUtils';
import '../../../styles/pilotAssignment-pilotsassign.css';

const PilotAssignment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Set default date to tomorrow
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };
  const [selectedDate, setSelectedDate] = useState(getTomorrowDate());
  const [selectedPilot, setSelectedPilot] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedMissions, setSelectedMissions] = useState([]);
  const [droneInfo, setDroneInfo] = useState(null);
  const [showTeamsModal, setShowTeamsModal] = useState(false);

  // Get user data for assigned_by
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userId = userData?.id || null;
  const isDeveloper = isInternalDeveloper(userData);
  const { data: featurePermissionsData = {} } = useGetMyPermissionsQuery(undefined, {
    skip: !userId,
  });

  const checkFeatureAccess = (featureCode) => {
    if (isDeveloper) return true;
    if (!featurePermissionsData || typeof featurePermissionsData !== 'object') return false;
    if (featurePermissionsData.features && featurePermissionsData.features[featureCode] === true) {
      return true;
    }
    const categories = featurePermissionsData.categories || featurePermissionsData;
    for (const category in categories) {
      if (category === 'paths' || category === 'features') continue;
      const categoryData = categories[category];
      if (Array.isArray(categoryData) && categoryData.includes(featureCode)) {
        return true;
      }
    }
    return false;
  };

  const hasResourceQueueFeature = checkFeatureAccess(FEATURE_CODES.PILOT_ASSIGNMENT_RESOURCE_QUEUE);
  const hasArrangeTransportFeature = checkFeatureAccess(FEATURE_CODES.PILOT_ASSIGNMENT_ARRANGE_TRANSPORT);

  // Fetch data
  const { data: plansData, isLoading: loadingPlans, refetch: refetchPlans } = useGetPilotAssignmentPlansQuery(selectedDate, {
    skip: !selectedDate || !hasResourceQueueFeature,
  });
  const { data: missionsData, isLoading: loadingMissions, refetch: refetchMissions } = useGetPilotAssignmentMissionsQuery(selectedDate, {
    skip: !selectedDate || !hasResourceQueueFeature,
  });
  const { data: pilotsData, isLoading: loadingPilots, refetch: refetchPilots } = useGetPilotAssignmentPilotsQuery(undefined, {
    skip: !hasResourceQueueFeature,
  });
  const { data: droneData, isLoading: loadingDrone, refetch: refetchDrone } = useGetPilotAssignmentDroneQuery(
    { team_id: selectedTeamId, date: selectedDate },
    { skip: !selectedTeamId || !selectedDate || !hasResourceQueueFeature }
  );
  const [createAssignment, { isLoading: creatingAssignment }] = useCreatePilotAssignmentMutation();
  const [assignTransportDetails, { isLoading: savingTransport }] = useAssignPilotTransportDetailsMutation();
  const [deployStep, setDeployStep] = useState(null);
  const [transportForm, setTransportForm] = useState({
    driver_id: '',
    vehicle_id: '',
    driver_arrival_time: '06:00',
  });
  const transportRecommendedAppliedRef = useRef(false);
  const { data: teamsData, isLoading: loadingTeams } = useGetAllTeamsQuery(selectedDate, {
    skip: !selectedDate || !showTeamsModal || !hasResourceQueueFeature,
  });

  const plans = plansData?.data || [];
  const missions = missionsData?.data || [];
  const pilots = pilotsData?.data || [];

  const filterValidPlanIds = (planIds) =>
    planIds.filter((planId) => {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return false;
      const isAssigned = plan.is_assigned === 1 || plan.is_assigned === true;
      const teamMatches =
        plan.assigned_team_id && parseInt(plan.assigned_team_id, 10) === parseInt(selectedTeamId, 10);
      return !isAssigned || teamMatches;
    });

  const filterValidMissionIds = (missionIds) =>
    missionIds.filter((missionId) => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return false;
      const isAssigned = mission.is_assigned === 1 || mission.is_assigned === true;
      const teamMatches =
        mission.assigned_team_id &&
        parseInt(mission.assigned_team_id, 10) === parseInt(selectedTeamId, 10);
      return !isAssigned || teamMatches;
    });

  const validPlanIdsForDeploy = useMemo(
    () => filterValidPlanIds(selectedPlans),
    [selectedPlans, plans, selectedTeamId]
  );

  const validMissionIdsForDeploy = useMemo(
    () => filterValidMissionIds(selectedMissions),
    [selectedMissions, missions, selectedTeamId]
  );

  const isRemovalDeploy =
    validPlanIdsForDeploy.length === 0 && validMissionIdsForDeploy.length === 0;
  const requiresTransportOnDeploy =
    hasArrangeTransportFeature && validPlanIdsForDeploy.length > 0;
  const isDeploying = creatingAssignment || savingTransport;

  const { data: transportOptionsData, isLoading: loadingTransportOptions } = useGetPilotTransportOptionsQuery(
    {
      assignment_id: assignmentId || null,
      yearMonth: selectedDate ? selectedDate.slice(0, 7) : undefined,
      plan_ids: validPlanIdsForDeploy,
      pool_vehicles_only: true,
    },
    {
      skip: !requiresTransportOnDeploy || !selectedDate,
    }
  );
  const transportOptions = transportOptionsData?.data || null;
  const transportDrivers = transportOptions?.drivers || [];
  const transportEstates = transportOptions?.estates || [];
  const hasTransportEstates = transportEstates.length > 0;

  const taskSelectionSummary = useMemo(() => {
    const p = validPlanIdsForDeploy.length;
    const m = validMissionIdsForDeploy.length;
    if (p === 0 && m === 0) {
      return 'No tasks selected — Deploy will clear this team’s assignment for this date (if one exists).';
    }
    const parts = [];
    if (p) parts.push(`${p} plantation`);
    if (m) parts.push(`${m} non-plantation`);
    return `${parts.join(' · ')} selected for this deploy.`;
  }, [validPlanIdsForDeploy.length, validMissionIdsForDeploy.length]);

  // Refetch all data when component mounts or when navigating to this route
  useEffect(() => {
    if (!hasResourceQueueFeature) return;
    // Refetch all queries to ensure fresh data when navigating to this page
    if (selectedDate) {
      refetchPlans();
      refetchMissions();
    }
    refetchPilots();
    if (selectedTeamId && selectedDate) {
      refetchDrone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, hasResourceQueueFeature]); // Refetch when route pathname changes (including on mount)

  // Update drone info when drone data changes
  useEffect(() => {
    if (droneData?.data) {
      setDroneInfo(droneData.data);
    } else {
      setDroneInfo(null);
    }
  }, [droneData]);

  // Auto-generate assignment ID when date or pilot changes
  useEffect(() => {
    if (selectedDate && selectedPilot && selectedTeamId) {
      const dateStr = selectedDate.replace(/-/g, '');
      const teamNum = String(selectedTeamId).padStart(3, '0');
      setAssignmentId(`ASSIGN-${dateStr}-${teamNum}`);
    } else {
      setAssignmentId('');
    }
  }, [selectedDate, selectedPilot, selectedTeamId]);

  // Update team ID when pilot changes
  useEffect(() => {
    if (selectedPilot) {
      const pilot = pilots.find(p => p.pilot_id === parseInt(selectedPilot));
      if (pilot) {
        setSelectedTeamId(pilot.team_id);
      }
    } else {
      setSelectedTeamId('');
      setDroneInfo(null);
    }
  }, [selectedPilot, pilots]);

  useEffect(() => {
    if (!requiresTransportOnDeploy) {
      transportRecommendedAppliedRef.current = false;
      return;
    }
    if (loadingTransportOptions || !transportOptions) return;

    const saved = transportOptions.saved_transport;
    if (saved?.driver_id && !transportRecommendedAppliedRef.current) {
      const driver = transportDrivers.find((d) => String(d.id) === String(saved.driver_id));
      setTransportForm({
        driver_id: String(saved.driver_id),
        vehicle_id:
          saved.vehicle_id != null
            ? String(saved.vehicle_id)
            : driver?.vehicle_id != null
              ? String(driver.vehicle_id)
              : '',
        driver_arrival_time: formatDriverArrivalTimeForInput(saved.driver_arrival_time),
      });
      transportRecommendedAppliedRef.current = true;
      return;
    }

    const rid = transportOptions.recommended_driver_id;
    if (!rid || transportRecommendedAppliedRef.current) return;
    const driver = transportDrivers.find((d) => String(d.id) === String(rid));
    if (!driver?.vehicle_id) return;
    setTransportForm((prev) => {
      if (prev.driver_id) return prev;
      return {
        ...prev,
        driver_id: String(rid),
        vehicle_id: String(driver.vehicle_id),
      };
    });
    transportRecommendedAppliedRef.current = true;
  }, [
    requiresTransportOnDeploy,
    loadingTransportOptions,
    transportOptions,
    transportDrivers,
  ]);

  useEffect(() => {
    transportRecommendedAppliedRef.current = false;
  }, [selectedDate, selectedTeamId, validPlanIdsForDeploy.join(',')]);

  const updateTransportField = (field, value) => {
    setTransportForm((prev) => {
      if (field === 'driver_id') {
        const driver = transportDrivers.find((d) => String(d.id) === String(value));
        return {
          ...prev,
          driver_id: value,
          vehicle_id: driver?.vehicle_id != null ? String(driver.vehicle_id) : '',
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Compute assigned plan IDs based on current plans and team
  const assignedPlanIds = useMemo(() => {
    if (plans.length > 0 && selectedTeamId) {
      return plans
        .filter(plan => {
          const isAssigned = plan.is_assigned === 1 || plan.is_assigned === true;
          const teamMatches = plan.assigned_team_id && parseInt(plan.assigned_team_id) === parseInt(selectedTeamId);
          return isAssigned && teamMatches;
        })
        .map(plan => plan.id);
    }
    return [];
  }, [plans, selectedTeamId]);

  // Compute assigned mission IDs based on current missions and team
  const assignedMissionIds = useMemo(() => {
    if (missions.length > 0 && selectedTeamId) {
      return missions
        .filter(mission => {
          const isAssigned = mission.is_assigned === 1 || mission.is_assigned === true;
          const teamMatches = mission.assigned_team_id && parseInt(mission.assigned_team_id) === parseInt(selectedTeamId);
          return isAssigned && teamMatches;
        })
        .map(mission => mission.id);
    }
    return [];
  }, [missions, selectedTeamId]);

  // Track previous team/date to detect when to reset selections
  const prevTeamAndDate = useRef({ teamId: null, date: null });
  // Track when plans/missions data changes to sync selections after deployment
  const prevPlansLength = useRef(0);
  const prevMissionsLength = useRef(0);

  // Initialize selected plans with already assigned items
  // This runs when team/date changes OR when plans data is refetched after deployment
  useEffect(() => {
    const teamChanged = prevTeamAndDate.current.teamId !== selectedTeamId;
    const dateChanged = prevTeamAndDate.current.date !== selectedDate;
    const plansDataChanged = plans.length !== prevPlansLength.current;
    
    if (teamChanged || dateChanged) {
      // Team or date changed - reset and sync
      // Only include plans assigned to the current selected team (blue checkboxes)
      if (selectedTeamId && assignedPlanIds.length > 0) {
        setSelectedPlans(assignedPlanIds);
      } else if (!selectedTeamId) {
        setSelectedPlans([]);
      }
      prevTeamAndDate.current = { teamId: selectedTeamId, date: selectedDate };
      prevPlansLength.current = plans.length;
    } else if (plansDataChanged && selectedTeamId) {
      // Plans data was refetched (e.g., after deployment) - sync selections with assigned items
      // Filter out any plans that don't belong to current team (remove gray checkboxes)
      setSelectedPlans(prevSelectedPlans => {
        const validPlans = prevSelectedPlans.filter(planId => {
          const plan = plans.find(p => p.id === planId);
          if (!plan) return false;
          const isAssigned = plan.is_assigned === 1 || plan.is_assigned === true;
          const teamMatches = plan.assigned_team_id && parseInt(plan.assigned_team_id) === parseInt(selectedTeamId);
          return !isAssigned || teamMatches;
        });
        
        if (assignedPlanIds.length > 0) {
          // Merge assigned plans with valid existing selections
          const mergedPlans = [...new Set([...assignedPlanIds, ...validPlans])];
          return mergedPlans;
        } else {
          // If no assigned plans, use only valid selections
          return validPlans;
        }
      });
      prevPlansLength.current = plans.length;
    }
  }, [selectedTeamId, selectedDate, assignedPlanIds, plans.length, plans]);

  // Initialize selected missions with already assigned items
  // This runs when team/date changes OR when missions data is refetched after deployment
  useEffect(() => {
    const teamChanged = prevTeamAndDate.current.teamId !== selectedTeamId;
    const dateChanged = prevTeamAndDate.current.date !== selectedDate;
    const missionsDataChanged = missions.length !== prevMissionsLength.current;
    
    if (teamChanged || dateChanged) {
      // Team or date changed - reset and sync
      // Only include missions assigned to the current selected team (blue checkboxes)
      if (selectedTeamId && assignedMissionIds.length > 0) {
        setSelectedMissions(assignedMissionIds);
      } else if (!selectedTeamId) {
        setSelectedMissions([]);
      }
      prevMissionsLength.current = missions.length;
    } else if (missionsDataChanged && selectedTeamId) {
      // Missions data was refetched (e.g., after deployment) - sync selections with assigned items
      // Filter out any missions that don't belong to current team (remove gray checkboxes)
      setSelectedMissions(prevSelectedMissions => {
        const validMissions = prevSelectedMissions.filter(missionId => {
          const mission = missions.find(m => m.id === missionId);
          if (!mission) return false;
          const isAssigned = mission.is_assigned === 1 || mission.is_assigned === true;
          const teamMatches = mission.assigned_team_id && parseInt(mission.assigned_team_id) === parseInt(selectedTeamId);
          return !isAssigned || teamMatches;
        });
        
        if (assignedMissionIds.length > 0) {
          // Merge assigned missions with valid existing selections
          const mergedMissions = [...new Set([...assignedMissionIds, ...validMissions])];
          return mergedMissions;
        } else {
          // If no assigned missions, use only valid selections
          return validMissions;
        }
      });
      prevMissionsLength.current = missions.length;
    }
  }, [selectedTeamId, selectedDate, assignedMissionIds, missions.length, missions]);

  const handlePilotChange = (pilotId) => {
    setSelectedPilot(pilotId);
    // Don't clear selections here - let useEffect handle pre-checking assigned plans
    // setSelectedPlans([]);
    // setSelectedMissions([]);
  };

  const handlePlanToggle = (planId) => {
    // Find the plan to check if it can be edited
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    // Only allow toggling if plan can be edited (not assigned to another team)
    const canEdit = !plan.is_assigned || (plan.assigned_team_id && parseInt(plan.assigned_team_id) === parseInt(selectedTeamId));
    if (!canEdit) {
      // Prevent toggling plans assigned to other teams (gray checkboxes)
      return;
    }
    
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const handleMissionToggle = (missionId) => {
    // Find the mission to check if it can be edited
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;
    
    // Only allow toggling if mission can be edited (not assigned to another team)
    const canEdit = !mission.is_assigned || (mission.assigned_team_id && parseInt(mission.assigned_team_id) === parseInt(selectedTeamId));
    if (!canEdit) {
      // Prevent toggling missions assigned to other teams (gray checkboxes)
      return;
    }
    
    setSelectedMissions(prev => 
      prev.includes(missionId) 
        ? prev.filter(id => id !== missionId)
        : [...prev, missionId]
    );
  };

  const handleDeploy = async () => {
    if (!selectedDate || !selectedPilot || !selectedTeamId) {
      toast.warning('Please select date and pilot.');
      return;
    }

    if (!droneInfo || !droneInfo.drone_id) {
      toast.warning('No drone available for this team. Assign a drone before deploying.');
      return;
    }

    const validPlanIds = filterValidPlanIds(selectedPlans);
    const validMissionIds = filterValidMissionIds(selectedMissions);
    const needsTransport = hasArrangeTransportFeature && validPlanIds.length > 0;

    if (needsTransport) {
      if (!transportForm.driver_id || !transportForm.vehicle_id || !transportForm.driver_arrival_time) {
        toast.warning('Driver, linked vehicle, and arrival time are required when deploying with plantation plans.');
        return;
      }
      if (!hasTransportEstates) {
        toast.warning('Assignment estates are missing. Select plantation plans with estates before deploying.');
        return;
      }
    }

    const assignmentData = {
      team_id: selectedTeamId,
      assignment_date: selectedDate,
      plan_ids: validPlanIds,
      mission_ids: validMissionIds,
      drone_id: droneInfo.drone_id,
      drone_tag: droneInfo.drone_tag,
      is_temp_drone: droneInfo.is_temp ? 1 : 0,
      temp_allocation_id: droneInfo.temp_allocation_id || null,
      assigned_by: userData.id || null,
      notes: null,
    };

    let savedAssignmentId = null;
    let deployPhase = 'assignment';
    try {
      setDeployStep('assignment');
      const result = await createAssignment(assignmentData).unwrap();
      if (!result?.status) {
        throw new Error(result?.message || 'Failed to create assignment');
      }
      savedAssignmentId = result.data?.assignment_id || assignmentId;

      if (needsTransport && savedAssignmentId) {
        deployPhase = 'transport';
        setDeployStep('transport');
        await assignTransportDetails({
          assignment_id: savedAssignmentId,
          driver_id: Number(transportForm.driver_id),
          vehicle_id: Number(transportForm.vehicle_id),
          driver_arrival_time: transportForm.driver_arrival_time,
          pool_vehicles_only: true,
        }).unwrap();
        toast.success(`Assignment ${savedAssignmentId} saved with driver and vehicle.`);
      } else {
        toast.success(`Assignment ${savedAssignmentId} saved successfully.`);
      }
      await refetchPlans();
      await refetchMissions();
    } catch (error) {
      console.error('Error deploying assignment:', error);
      const errorMessage =
        error?.data?.error || error?.data?.message || 'Failed to deploy. Please try again.';
      if (deployPhase === 'transport') {
        toast.error(
          savedAssignmentId
            ? `Assignment ${savedAssignmentId} saved, but vehicle assignment failed: ${errorMessage}`
            : `Vehicle assignment failed: ${errorMessage}`
        );
      } else {
        toast.error(`Deploy failed: ${errorMessage}`);
      }
    } finally {
      setDeployStep(null);
    }
  };

  const deployButtonLabel = () => {
    if (deployStep === 'assignment') return 'Saving pilot & drone...';
    if (deployStep === 'transport') return 'Assigning vehicle...';
    if (isDeploying) return 'Deploying...';
    return 'Deploy';
  };

  return (
    <div className="pilot-assignment-container-pilotsassign">
      {/* Header Section */}
      <div className="pilot-assignment-header-pilotsassign">
        <button 
          className="pilot-assignment-back-btn-pilotsassign"
          onClick={() => navigate({ pathname: '/home/workflowDashboard', search: location.search })}
        >
          <svg className="pilot-assignment-back-icon-pilotsassign" viewBox="0 0 24 24" width="25" height="25">
            <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        
        <h1 className="pilot-assignment-title-pilotsassign">Resource Assignment Queue</h1>
        
        <div className="pilot-assignment-header-actions-pilotsassign">
          {hasResourceQueueFeature && (
            <button
              className="pilot-assignment-teams-btn-pilotsassign"
              onClick={() => setShowTeamsModal(true)}
            >
              Teams
            </button>
          )}
        </div>
      </div>

      {!hasResourceQueueFeature ? (
        <div className="pilot-assignment-access-denied-pilotsassign">
          <p>
            Resource assignment is not enabled for your role. An administrator can turn it on under{' '}
            <strong>ICT → Auth Controls → Features</strong> (OpsRoom).
          </p>
        </div>
      ) : null}

      {hasResourceQueueFeature ? (
      <div className="pilot-assignment-workflow-wrap-pilotsassign">

        <section className="pilot-assignment-step-card-pilotsassign" aria-labelledby="pa-step1-title">
          <div className="pilot-assignment-step-card-head-pilotsassign">
            <span className="pilot-assignment-step-num-pilotsassign" aria-hidden="true">1</span>
            <div>
              <h2 id="pa-step1-title" className="pilot-assignment-step-heading-pilotsassign">
                Date, pilot &amp; assignment ID
              </h2>
            </div>
          </div>
          <div className="pilot-assignment-step-card-body-pilotsassign">
          <div className="pilot-assignment-fields-grid-pilotsassign">
            <div className="pilot-assignment-field-stack-pilotsassign">
              <label className="pilot-assignment-field-label-pilotsassign" htmlFor="pa-date-input">
                Assignment date
              </label>
              <input
                id="pa-date-input"
                type="date"
                className="pilot-assignment-date-input-pilotsassign"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="pilot-assignment-field-stack-pilotsassign">
              <label className="pilot-assignment-field-label-pilotsassign" htmlFor="pa-pilot-select">
                Pilot &amp; team
              </label>
              <select
                id="pa-pilot-select"
                className="pilot-assignment-pilot-select-pilotsassign"
                value={selectedPilot}
                onChange={(e) => handlePilotChange(e.target.value)}
                disabled={loadingPilots}
              >
                <option value="">Choose a pilot…</option>
                {pilots.map((pilot) => (
                  <option key={pilot.pilot_id} value={pilot.pilot_id}>
                    {pilot.pilot_name} — {pilot.team_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="pilot-assignment-field-stack-pilotsassign">
              <label className="pilot-assignment-field-label-pilotsassign" htmlFor="pa-assignment-id">
                Assignment ID <span className="pilot-assignment-field-muted-pilotsassign">(read-only)</span>
              </label>
              <input
                id="pa-assignment-id"
                type="text"
                className="pilot-assignment-assignment-id-pilotsassign"
                value={assignmentId}
                readOnly
                placeholder="Select date and pilot"
              />
            </div>
          </div>
          </div>
        </section>

        <div className="pilot-assignment-drone-inline-pilotsassign" role="status">
          <span className="pilot-assignment-drone-inline-prefix-pilotsassign">Drone</span>
          {droneInfo && (droneInfo.permanent_drone || droneInfo.temp_drone || droneInfo.drone_tag) ? (
            <span className="pilot-assignment-drone-inline-values-pilotsassign">
              {droneInfo.permanent_drone && (
                <>
                  Permanent{' '}
                  <strong className="pilot-assignment-drone-inline-strong-pilotsassign">
                    {droneInfo.permanent_drone.drone_tag || droneInfo.permanent_drone.serial}
                  </strong>
                </>
              )}
              {droneInfo.temp_drone && (
                <>
                  {droneInfo.permanent_drone ? <span className="pilot-assignment-drone-inline-sep-pilotsassign"> · </span> : null}
                  Temp{' '}
                  <strong className="pilot-assignment-drone-inline-strong-pilotsassign pilot-assignment-drone-inline-temp-pilotsassign">
                    {droneInfo.temp_drone.drone_tag || droneInfo.temp_drone.serial}
                  </strong>
                </>
              )}
              {!droneInfo.permanent_drone && !droneInfo.temp_drone && droneInfo.drone_tag && (
                <>
                  {droneInfo.is_temp ? (
                    <>
                      Temp{' '}
                      <strong className="pilot-assignment-drone-inline-strong-pilotsassign pilot-assignment-drone-inline-temp-pilotsassign">
                        {droneInfo.drone_tag || droneInfo.serial}
                      </strong>
                    </>
                  ) : (
                    <>
                      Assigned{' '}
                      <strong className="pilot-assignment-drone-inline-strong-pilotsassign">
                        {droneInfo.drone_tag || droneInfo.serial}
                      </strong>
                    </>
                  )}
                </>
              )}
            </span>
          ) : (
            <span className="pilot-assignment-drone-inline-muted-pilotsassign">
              {selectedPilot
                ? 'None linked for this date — assign a drone to the team before deploying.'
                : 'Select a pilot above.'}
            </span>
          )}
        </div>

        <section className="pilot-assignment-step-card-pilotsassign" aria-labelledby="pa-step-tasks-title">
          <div className="pilot-assignment-step-card-head-pilotsassign">
            <span className="pilot-assignment-step-num-pilotsassign" aria-hidden="true">2</span>
            <div>
              <h2 id="pa-step-tasks-title" className="pilot-assignment-step-heading-pilotsassign">
                Select Plans for Assignment
              </h2>
              <p className="pilot-assignment-step-lead-pilotsassign">{taskSelectionSummary}</p>
            </div>
          </div>

          <div className="pilot-assignment-tasks-split-pilotsassign">
            <div className="pilot-assignment-task-column-pilotsassign">
              <h3 className="pilot-assignment-task-column-heading-pilotsassign">Plantation</h3>
          
          {loadingPlans ? (
            <div className="pilot-assignment-loading-pilotsassign">
              <Bars height="30" width="30" color="#003057" ariaLabel="bars-loading" visible={true} />
              <span>Loading plans...</span>
            </div>
          ) : (
            <div className="pilot-assignment-plans-grid-pilotsassign pilot-assignment-plans-grid-compact-pilotsassign">
              {plans.length === 0 ? (
                <div className="pilot-assignment-empty-pilotsassign">No plantation tasks for this date</div>
              ) : (
                plans.map(plan => {
                  // Check if selected team matches assigned team (for editing)
                  const canEdit = !plan.is_assigned || (plan.assigned_team_id && parseInt(plan.assigned_team_id) === parseInt(selectedTeamId));
                  
                  return (
                    <div 
                      key={plan.id} 
                      className={`pilot-assignment-plan-card-pilotsassign ${
                        plan.is_assigned ? 'pilot-assignment-plan-assigned-pilotsassign' : ''
                      } ${selectedPlans.includes(plan.id) ? 'pilot-assignment-plan-selected-pilotsassign' : ''}`}
                      onClick={() => canEdit && handlePlanToggle(plan.id)}
                      style={{ cursor: canEdit ? 'pointer' : 'not-allowed' }}
                    >
                      <div className="pilot-assignment-plan-content-pilotsassign">
                        <div className="pilot-assignment-plan-info-pilotsassign">
                          <span className="pilot-assignment-plan-id-pilotsassign">
                            {plan.estate_name || (plan.id ? `Plan ${plan.id}` : 'Plan')}
                          </span>
                          <span className="pilot-assignment-plan-ha-pilotsassign">
                            {Number(plan.plan_active_ha ?? 0).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}{' '}
                            ha
                            {plan.plan_active_fields_count != null
                              ? ` · ${Number(plan.plan_active_fields_count)} field${
                                  Number(plan.plan_active_fields_count) === 1 ? '' : 's'
                                }`
                              : ''}
                          </span>
                          {(plan.is_assigned === 1 || plan.is_assigned === true) && plan.assigned_pilot_name && (
                            <span className="pilot-assignment-plan-pilot-pilotsassign">Assigned: {plan.assigned_pilot_name}</span>
                          )}
                          {(plan.is_assigned === 1 || plan.is_assigned === true) &&
                            plan.assigned_vehicle_no != null &&
                            String(plan.assigned_vehicle_no).trim() !== '' && (
                            <span className="pilot-assignment-plan-vehicle-pilotsassign">
                              Vehicle: {String(plan.assigned_vehicle_no).trim()}
                            </span>
                          )}
                        </div>
                        <div className="pilot-assignment-checkbox-wrapper-pilotsassign">
                          <input
                            type="checkbox"
                            className="pilot-assignment-checkbox-pilotsassign"
                            checked={canEdit && selectedPlans.includes(plan.id)}
                            onChange={() => canEdit && handlePlanToggle(plan.id)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={!canEdit}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
            </div>

            <div className="pilot-assignment-task-column-pilotsassign">
              <h3 className="pilot-assignment-task-column-heading-pilotsassign">Non-plantation</h3>


          {loadingMissions ? (
            <div className="pilot-assignment-loading-pilotsassign">
              <Bars height="30" width="30" color="#003057" ariaLabel="bars-loading" visible={true} />
              <span>Loading missions...</span>
            </div>
          ) : (
            <div className="pilot-assignment-plans-grid-pilotsassign pilot-assignment-plans-grid-compact-pilotsassign">
              {missions.length === 0 ? (
                <div className="pilot-assignment-empty-pilotsassign">No non-plantation tasks for this date</div>
              ) : (
                missions.map(mission => {
                  // Check if selected team matches assigned team (for editing)
                  const canEdit = !mission.is_assigned || (mission.assigned_team_id && parseInt(mission.assigned_team_id) === parseInt(selectedTeamId));
                  
                  return (
                    <div 
                      key={mission.id} 
                      className={`pilot-assignment-plan-card-pilotsassign ${
                        mission.is_assigned ? 'pilot-assignment-plan-assigned-pilotsassign' : ''
                      } ${selectedMissions.includes(mission.id) ? 'pilot-assignment-plan-selected-pilotsassign' : ''}`}
                      onClick={() => canEdit && handleMissionToggle(mission.id)}
                      style={{ cursor: canEdit ? 'pointer' : 'not-allowed' }}
                    >
                      <div className="pilot-assignment-plan-content-pilotsassign">
                        <div className="pilot-assignment-plan-info-pilotsassign">
                          <span className="pilot-assignment-plan-id-pilotsassign">
                            {mission.mission_display_name || 
                              (mission.farmer_name 
                                ? `${mission.farmer_name}${mission.gnd_name && mission.gnd_name !== '0' && mission.gnd_name !== 0 ? ` - ${mission.gnd_name}` : mission.gnd && mission.gnd !== '0' && mission.gnd !== 0 && mission.gnd !== '' ? ` - ${mission.gnd}` : ''}`
                                : (mission.id ? `Mission ${mission.id}` : 'Mission'))
                            }
                          </span>
                          {(mission.is_assigned === 1 || mission.is_assigned === true) && mission.assigned_pilot_name && (
                            <span className="pilot-assignment-plan-pilot-pilotsassign">Assigned: {mission.assigned_pilot_name}</span>
                          )}
                          {(mission.is_assigned === 1 || mission.is_assigned === true) &&
                            mission.assigned_vehicle_no != null &&
                            String(mission.assigned_vehicle_no).trim() !== '' && (
                            <span className="pilot-assignment-plan-vehicle-pilotsassign">
                              Vehicle: {String(mission.assigned_vehicle_no).trim()}
                            </span>
                          )}
                        </div>
                        <div className="pilot-assignment-checkbox-wrapper-pilotsassign">
                          <input
                            type="checkbox"
                            className="pilot-assignment-checkbox-pilotsassign"
                            checked={canEdit && selectedMissions.includes(mission.id)}
                            onChange={() => canEdit && handleMissionToggle(mission.id)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={!canEdit}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
            </div>
          </div>
        </section>

        {hasArrangeTransportFeature ? (
          <section className="pilot-assignment-step-card-pilotsassign" aria-labelledby="pa-step-transport-title">
            <div className="pilot-assignment-step-card-head-pilotsassign">
              <span className="pilot-assignment-step-num-pilotsassign" aria-hidden="true">3</span>
              <div>
                <h2 id="pa-step-transport-title" className="pilot-assignment-step-heading-pilotsassign">
                  Driver &amp; vehicle
                </h2>
                <p className="pilot-assignment-step-lead-pilotsassign">
                  Required when you deploy with plantation plans: pick driver and arrival time. Deploy saves
                  assignment first, then transport.
                </p>
              </div>
            </div>
            <div className="pilot-assignment-step-card-body-pilotsassign">
              {!requiresTransportOnDeploy ? (
                <p className="pilot-assignment-transport-hint-pilotsassign">
                  Select at least one plantation plan to arrange driver and vehicle here, or assign later from
                  Transport HR → Assign Vehicle.
                </p>
              ) : (
                <TransportAssignmentFields
                  editable
                  loading={loadingTransportOptions}
                  transportOptions={transportOptions}
                  form={transportForm}
                  onFieldChange={updateTransportField}
                  poolVehiclesOnly
                />
              )}
            </div>
          </section>
        ) : null}

        <div className="pilot-assignment-deploy-bar-pilotsassign">
          <div className="pilot-assignment-deploy-bar-copy-pilotsassign">
            <span className="pilot-assignment-deploy-bar-title-pilotsassign">Ready to save?</span>
            <p className="pilot-assignment-deploy-bar-hint-pilotsassign">
              {isRemovalDeploy
                ? 'Deploy removes this team’s assignment for the selected date when allowed.'
                : requiresTransportOnDeploy
                  ? 'Deploy saves pilot, drone, and plans first, then driver and vehicle in one flow.'
                  : 'Deploy saves plantation and non-plantation selections to this team and date.'}
            </p>
          </div>
          <button
            type="button"
            className="pilot-assignment-deploy-btn-pilotsassign pilot-assignment-deploy-btn-main-pilotsassign"
            onClick={handleDeploy}
            disabled={
              !selectedDate ||
              !selectedPilot ||
              isDeploying ||
              (requiresTransportOnDeploy &&
                (!transportForm.driver_id ||
                  !transportForm.vehicle_id ||
                  !transportForm.driver_arrival_time ||
                  !hasTransportEstates))
            }
          >
            {deployButtonLabel()}
          </button>
        </div>
      </div>
      ) : null}

      {/* Teams Modal */}
      {hasResourceQueueFeature && showTeamsModal && (
        <div className="pilot-assignment-teams-modal-overlay-pilotsassign" onClick={() => setShowTeamsModal(false)}>
          <div className="pilot-assignment-teams-modal-pilotsassign" onClick={(e) => e.stopPropagation()}>
            <div className="pilot-assignment-teams-modal-header-pilotsassign">
              <h2 className="pilot-assignment-teams-modal-title-pilotsassign">Teams Overview</h2>
              <button 
                className="pilot-assignment-teams-modal-close-pilotsassign"
                onClick={() => setShowTeamsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="pilot-assignment-teams-modal-content-pilotsassign">
              {loadingTeams ? (
                <div className="pilot-assignment-teams-loading-pilotsassign">
                  <Bars height="40" width="40" color="#003057" ariaLabel="bars-loading" visible={true} />
                  <span>Loading teams...</span>
                </div>
              ) : teamsData?.data && teamsData.data.length > 0 ? (
                <div className="pilot-assignment-teams-grid-pilotsassign">
                  {teamsData.data.map((team) => (
                    <div key={`team-${team.team_id}`} className="pilot-assignment-team-card-pilotsassign">
                      <div className="pilot-assignment-team-header-pilotsassign">
                        <h3 className="pilot-assignment-team-name-pilotsassign">{team.team_name}</h3>
                      </div>
                      
                      <div className="pilot-assignment-team-content-pilotsassign">
                        {/* Pilots Section */}
                        <div className="pilot-assignment-team-section-pilotsassign">
                          <h4 className="pilot-assignment-team-section-title-pilotsassign">Pilots</h4>
                          {team.pilots && team.pilots.length > 0 ? (
                            <div className="pilot-assignment-team-items-pilotsassign">
                              {team.pilots.map((pilot) => (
                                <div key={`team-${team.team_id}-pilot-${pilot.id}`} className="pilot-assignment-team-item-pilotsassign">
                                  <span className="pilot-assignment-team-item-icon-pilotsassign">👤</span>
                                  <span className="pilot-assignment-team-item-text-pilotsassign">{pilot.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="pilot-assignment-team-empty-pilotsassign">No pilots assigned</div>
                          )}
                        </div>

                        {/* Permanent Drones Section */}
                        <div className="pilot-assignment-team-section-pilotsassign">
                          <h4 className="pilot-assignment-team-section-title-pilotsassign">Permanent Drones</h4>
                          {team.permanent_drones && team.permanent_drones.length > 0 ? (
                            <div className="pilot-assignment-team-items-pilotsassign">
                              {team.permanent_drones.map((drone, index) => (
                                <div key={`team-${team.team_id}-permanent-drone-${drone.drone_id}-${index}`} className="pilot-assignment-team-item-pilotsassign">
                                  <span className="pilot-assignment-team-item-icon-pilotsassign">🚁</span>
                                  <span className="pilot-assignment-team-item-text-pilotsassign">
                                    {drone.drone_tag || drone.serial}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="pilot-assignment-team-empty-pilotsassign">No permanent drones</div>
                          )}
                        </div>

                        {/* Temp Drones Section */}
                        {team.temp_drones && team.temp_drones.length > 0 && (
                          <div className="pilot-assignment-team-section-pilotsassign">
                            <h4 className="pilot-assignment-team-section-title-pilotsassign pilot-assignment-team-temp-title-pilotsassign">
                              Temporary Drones ({selectedDate})
                            </h4>
                            <div className="pilot-assignment-team-items-pilotsassign">
                              {team.temp_drones.map((drone, index) => (
                                <div key={`team-${team.team_id}-temp-drone-${drone.drone_id}-${index}`} className="pilot-assignment-team-item-pilotsassign pilot-assignment-team-temp-item-pilotsassign">
                                  <span className="pilot-assignment-team-item-icon-pilotsassign">🚁</span>
                                  <span className="pilot-assignment-team-item-text-pilotsassign">
                                    {drone.drone_tag || drone.serial}
                                  </span>
                                  <span className="pilot-assignment-team-temp-badge-pilotsassign">Temp</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pilot-assignment-teams-empty-pilotsassign">No teams available</div>
              )}
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={4500} closeOnClick draggable pauseOnHover />
    </div>
  );
};

export default PilotAssignment;
