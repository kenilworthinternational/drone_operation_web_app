import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bars } from 'react-loader-spinner';
import {
  useGetPilotAssignmentPlansQuery,
  useGetPilotAssignmentMissionsQuery,
  useGetPilotAssignmentPilotsQuery,
  useGetPilotAssignmentDroneQuery,
  useCreatePilotAssignmentMutation,
  useGetAllTeamsQuery,
} from '../../../api/services NodeJs/allEndpoints';
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
  const { data: teamsData, isLoading: loadingTeams } = useGetAllTeamsQuery(selectedDate, {
    skip: !selectedDate || !showTeamsModal || !hasResourceQueueFeature,
  });

  const plans = plansData?.data || [];
  const missions = missionsData?.data || [];
  const pilots = pilotsData?.data || [];

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
      alert('Please select date and pilot');
      return;
    }

    // Allow deploying even with no selections - this will remove assignments
    // if (selectedPlans.length === 0 && selectedMissions.length === 0) {
    //   alert('Please select at least one plan or mission');
    //   return;
    // }

    if (!droneInfo || !droneInfo.drone_id) {
      alert('No drone available for this team. Please assign a drone to the team first.');
      return;
    }

    // Filter selectedPlans to only include plans that belong to the current selected team
    // Exclude plans assigned to other teams (gray checkboxes)
    const validPlanIds = selectedPlans.filter(planId => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return false;
      
      // Include if: not assigned OR assigned to current selected team
      const isAssigned = plan.is_assigned === 1 || plan.is_assigned === true;
      const teamMatches = plan.assigned_team_id && parseInt(plan.assigned_team_id) === parseInt(selectedTeamId);
      
      return !isAssigned || teamMatches;
    });

    // Filter selectedMissions to only include missions that belong to the current selected team
    // Exclude missions assigned to other teams (gray checkboxes)
    const validMissionIds = selectedMissions.filter(missionId => {
      const mission = missions.find(m => m.id === missionId);
      if (!mission) return false;
      
      // Include if: not assigned OR assigned to current selected team
      const isAssigned = mission.is_assigned === 1 || mission.is_assigned === true;
      const teamMatches = mission.assigned_team_id && parseInt(mission.assigned_team_id) === parseInt(selectedTeamId);
      
      return !isAssigned || teamMatches;
    });

    try {
      const assignmentData = {
        team_id: selectedTeamId,
        assignment_date: selectedDate,
        plan_ids: validPlanIds, // Use filtered plans (only blue checkboxes)
        mission_ids: validMissionIds, // Use filtered missions (only blue checkboxes)
        drone_id: droneInfo.drone_id,
        drone_tag: droneInfo.drone_tag,
        is_temp_drone: droneInfo.is_temp ? 1 : 0,
        temp_allocation_id: droneInfo.temp_allocation_id || null,
        assigned_by: userData.id || null,
        notes: null
      };

      const result = await createAssignment(assignmentData).unwrap();

      if (result.status) {
        alert(`Assignment ${result.data.assignment_id} created successfully!`);
        
        // Refetch data to show updated assignments
        // Note: Don't reset selections here - let useEffect sync them with assigned items after refetch
        await refetchPlans();
        await refetchMissions();
        
        // The useEffect hooks will automatically sync selectedPlans and selectedMissions
        // with the newly assigned items after the data is refetched
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      console.error('Error details:', error?.data);
      const errorMessage = error?.data?.error || error?.data?.message || 'Failed to create assignment. Please try again.';
      alert(`Error: ${errorMessage}\n\nPlease check:\n1. Have you run the MySQL queries to create the assignments table?\n2. Check the backend console for detailed error logs.`);
    }
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
          {hasArrangeTransportFeature && (
            <button
              type="button"
              className="pilot-assignment-transport-btn-pilotsassign"
              onClick={() =>
                navigate({ pathname: '/home/pilotAssignment/transport-arrange', search: location.search })
              }
              title="Open today and tomorrow assignments (new page); Arrange opens a popup"
            >
              Arrange Transport
            </button>
          )}
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

      {/* Top Control Bar */}
      {hasResourceQueueFeature ? (
      <div className="pilot-assignment-controls-bar-pilotsassign">
        <div className="pilot-assignment-control-group-pilotsassign">
          <label className="pilot-assignment-control-label-pilotsassign">Select Date :</label>
          <input 
            type="date" 
            className="pilot-assignment-date-input-pilotsassign"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              // Don't clear selections here - let useEffect handle pre-checking assigned plans
              // setSelectedPlans([]);
              // setSelectedMissions([]);
            }}
          />
        </div>
        
        <div className="pilot-assignment-control-group-pilotsassign">
          <label className="pilot-assignment-control-label-pilotsassign">Select Pilot :</label>
          <select 
            className="pilot-assignment-pilot-select-pilotsassign"
            value={selectedPilot}
            onChange={(e) => handlePilotChange(e.target.value)}
            disabled={loadingPilots}
          >
            <option value="">-- Select Pilot --</option>
            {pilots.map(pilot => (
              <option key={pilot.pilot_id} value={pilot.pilot_id}>
                {pilot.pilot_name} - {pilot.team_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="pilot-assignment-control-group-pilotsassign">
          <label className="pilot-assignment-control-label-pilotsassign">Assignment ID :</label>
          <input 
            type="text" 
            className="pilot-assignment-assignment-id-pilotsassign"
            value={assignmentId}
            readOnly
            placeholder="Auto-generated"
          />
        </div>
        
        <button 
          className="pilot-assignment-deploy-btn-pilotsassign"
          onClick={handleDeploy}
          disabled={!selectedDate || !selectedPilot || creatingAssignment}
        >
          {creatingAssignment ? 'Deploying...' : 'Deploy'}
        </button>
      </div>
      ) : null}

      {/* Drone Info Display */}
      {hasResourceQueueFeature && droneInfo && (
        <div className="pilot-assignment-drone-info-pilotsassign">
          {/* New format: permanent_drone and temp_drone */}
          {droneInfo.permanent_drone && (
            <>
              <span className="pilot-assignment-drone-label-pilotsassign">Permanent Drone:</span>
              <span className="pilot-assignment-drone-value-pilotsassign">
                {droneInfo.permanent_drone.drone_tag || droneInfo.permanent_drone.serial}
              </span>
            </>
          )}
          {droneInfo.temp_drone && (
            <>
              {droneInfo.permanent_drone && (
                <span className="pilot-assignment-drone-separator-pilotsassign"> | </span>
              )}
              <span className="pilot-assignment-drone-label-pilotsassign">Temp Drone:</span>
              <span className="pilot-assignment-drone-value-pilotsassign pilot-assignment-drone-temp-pilotsassign">
                {droneInfo.temp_drone.drone_tag || droneInfo.temp_drone.serial}
              </span>
            </>
          )}
          {/* Backward compatibility: old format with just drone_tag */}
          {!droneInfo.permanent_drone && !droneInfo.temp_drone && droneInfo.drone_tag && (
            <>
              <span className="pilot-assignment-drone-label-pilotsassign">Assigned Drone:</span>
              <span className={`pilot-assignment-drone-value-pilotsassign ${droneInfo.is_temp ? 'pilot-assignment-drone-temp-pilotsassign' : ''}`}>
                {droneInfo.drone_tag || droneInfo.serial}
              </span>
            </>
          )}
        </div>
      )}

      {/* Main Content - Plans and Missions Section */}
      {hasResourceQueueFeature ? (
      <div className="pilot-assignment-content-pilotsassign">
        {/* Plans Section */}
        <div className="pilot-assignment-section-pilotsassign">
          <h2 className="pilot-assignment-section-title-pilotsassign">Plans</h2>
          
          {loadingPlans ? (
            <div className="pilot-assignment-loading-pilotsassign">
              <Bars height="30" width="30" color="#003057" ariaLabel="bars-loading" visible={true} />
              <span>Loading plans...</span>
            </div>
          ) : (
            <div className="pilot-assignment-plans-grid-pilotsassign">
              {plans.length === 0 ? (
                <div className="pilot-assignment-empty-pilotsassign">No plans available for this date</div>
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
                            {plan.plan_display_name || plan.estate_name || (plan.id ? `Plan ${plan.id}` : 'Plan')}
                          </span>
                          {(plan.is_assigned === 1 || plan.is_assigned === true) && plan.assigned_pilot_name && (
                            <span className="pilot-assignment-plan-pilot-pilotsassign">Assigned: {plan.assigned_pilot_name}</span>
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

        {/* Missions Section */}
        <div className="pilot-assignment-section-pilotsassign">
          <h2 className="pilot-assignment-section-title-pilotsassign">Missions</h2>
          
          {loadingMissions ? (
            <div className="pilot-assignment-loading-pilotsassign">
              <Bars height="30" width="30" color="#003057" ariaLabel="bars-loading" visible={true} />
              <span>Loading missions...</span>
            </div>
          ) : (
            <div className="pilot-assignment-plans-grid-pilotsassign">
              {missions.length === 0 ? (
                <div className="pilot-assignment-empty-pilotsassign">No missions available for this date</div>
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
                          {mission.is_assigned === 1 && mission.assigned_pilot_name && (
                            <span className="pilot-assignment-plan-pilot-pilotsassign">Assigned: {mission.assigned_pilot_name}</span>
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
    </div>
  );
};

export default PilotAssignment;
