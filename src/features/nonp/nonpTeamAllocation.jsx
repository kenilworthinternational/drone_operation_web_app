import React, { useState, useEffect } from 'react';
import '../../styles/proceedPlan.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from "react-icons/fa";
import { baseApi } from '../../api/services/allEndpoints';
import { useAppDispatch } from '../../store/hooks';
import NonpTeamAllocationBottom from './nonpTeamAllocationBottom';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input" ref={ref} onClick={onClick}>
    <input 
      type="text" 
      value={value} 
      readOnly 
      className="date-picker-input" 
    />
    <FaCalendarAlt className="calendar-icon" />
  </div>
));

const getDisplayName = (obj) => {
  if (!obj || typeof obj !== 'object') return 'Unknown';
  
  // For nonp missions, use farmer_name and land_extent
  if (obj.farmer_name) {
    const landExtent = obj.land_extent || obj.total_land_extent;
    if (landExtent !== undefined && landExtent !== null && landExtent > 0) {
      return `${obj.farmer_name} - ${landExtent} Ha`;
    } else {
      return `${obj.farmer_name} - N/A Ha`;
    }
  }
  
  // Fallback for other types
  if (obj.estate && (obj.area !== undefined && obj.area !== null)) {
    return `${obj.estate} - ${obj.area} Ha`;
  }
  
  return `ID ${obj.id || obj.mission_id || 'N/A'}`;
};

const NonpTeamAllocation = () => {
  const today = new Date();
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(today.getDate() + 2);
  const [selectedDate, setSelectedDate] = useState(dayAfterTomorrow);
  const [missions, setMissions] = useState([]);
  const [selectedMissions, setSelectedMissions] = useState([]);
  const [missionGroups, setMissionGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [selectedMissionsForGroup, setSelectedMissionsForGroup] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [assignedTeamId, setAssignedTeamId] = useState("");
  const [selectedPilot, setSelectedPilot] = useState("");
  const [selectedDrone, setSelectedDrone] = useState("");
  const [deployStatus, setDeployStatus] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [pilotPlanCounts, setPilotPlanCounts] = useState({});
  const [dronePlanCounts, setDronePlanCounts] = useState({});
  const [planDetails, setPlanDetails] = useState({});
  const dispatch = useAppDispatch();

  const fetchTeams = async () => {
    setLoadingTeams(true);
    const result = await dispatch(baseApi.endpoints.getTeamDataNonPlantation.initiate());
    const response = result.data;
    if (response && Array.isArray(response)) {
      setTeams(response);
    } else if (response && response.data) {
      setTeams(response.data);
    } else {
      setTeams([]);
    }
    setLoadingTeams(false);
  };

  const fetchGroupAssignments = async (date) => {
    if (!date) return;
    const formattedDate = date.toLocaleDateString('en-CA');
      const result = await dispatch(baseApi.endpoints.getCurrentGroupAssignedMissions.initiate({ date: formattedDate }));
      const response = result.data;
    if (response && response.status === "true" && response.groups) {
      setMissionGroups(response.groups);
    } else {
      setMissionGroups([]);
    }
  };

  const getPlanCounts = async (date) => {
    if (!date) return { pilotPlanCounts: {}, dronePlanCounts: {}, planDetails: {} };
    const formattedDate = date.toLocaleDateString('en-CA');
      const result = await dispatch(baseApi.endpoints.getTeamPlannedDataNonPlantation.initiate({ date: formattedDate }));
      const response = result.data;
    // Also fetch missions for the same date to enrich with farmer details
    let missionLookup = {};
    try {
      const missionsResult = await dispatch(baseApi.endpoints.getPlansByDate.initiate(formattedDate));
      const missionsResp = missionsResult.data;
      if (missionsResp && missionsResp.status === "true" && missionsResp["0"] && Array.isArray(missionsResp["0"])) {
        missionsResp["0"].forEach(m => {
          const id = m.mission_id || m.id;
          if (!id) return;
          missionLookup[id] = {
            farmer_name: m.farmer_name || m.farmerName || m.farmer || '',
            land_extent: m.land_extent,
            area: m.area,
            estate: m.estate
          };
        });
      }
    } catch (_) {}
    if (!response || response.status !== "true") return { pilotPlanCounts: {}, dronePlanCounts: {}, planDetails: {} };

    const pilotCounts = {};
    const droneCounts = {};
    const details = {};

    for (const key in response) {
      if (!isNaN(key)) {
        const plan = response[key];
        const planInfo = {
          planId: plan.id || plan.mission_id,
          planName: getDisplayName(plan),
          teamName: plan.team_name,
          farmerName: (plan.farmer_name || (missionLookup[(plan.id || plan.mission_id)] && missionLookup[(plan.id || plan.mission_id)].farmer_name)) || ''
        };
        // populate details map for downstream fallback
        const source = missionLookup[planInfo.planId] || plan;
        details[planInfo.planId] = source;
        
        if (plan.pilots && Array.isArray(plan.pilots)) {
          plan.pilots.forEach(pilot => {
            const pilotId = Number(pilot.pilot_id);
            const pilotName = pilot.pilot;
            
            if (!pilotCounts[pilotId]) {
              pilotCounts[pilotId] = {
                count: 0,
                plans: [],
                pilotName: pilotName
              };
            }
            pilotCounts[pilotId].count += 1;
            pilotCounts[pilotId].plans.push(planInfo);
          });
        }
        
        if (plan.drones && Array.isArray(plan.drones)) {
          plan.drones.forEach(drone => {
            const droneId = Number(drone.id);
            const droneTag = drone.tag;
            
            if (!droneCounts[droneId]) {
              droneCounts[droneId] = {
                count: 0,
                plans: [],
                droneTag: droneTag
              };
            }
            droneCounts[droneId].count += 1;
            droneCounts[droneId].plans.push(planInfo);
          });
        }
      }
    }
    return { pilotPlanCounts: pilotCounts, dronePlanCounts: droneCounts, planDetails: details };
  };

  const getTeamPlanCounts = (team) => {
    const teamPlanInfo = {
      pilots: [],
      drones: []
    };
    
    // Get plan count info for pilots in this team
    if (team.pilots && Array.isArray(team.pilots)) {
      team.pilots.forEach(pilot => {
        const pilotId = Number(pilot[0]);
        const pilotName = pilot[1];
        const planCount = pilotPlanCounts[pilotId]?.count || 0;
        const plans = pilotPlanCounts[pilotId]?.plans || [];
        
        teamPlanInfo.pilots.push({
          pilotId,
          pilotName,
          planCount,
          plans
        });
      });
    }
    
    // Get plan count info for drones in this team
    if (team.drones && Array.isArray(team.drones)) {
      team.drones.forEach(drone => {
        const droneId = Number(drone[0]);
        const droneTag = drone[1];
        const planCount = dronePlanCounts[droneId]?.count || 0;
        const plans = dronePlanCounts[droneId]?.plans || [];
        
        teamPlanInfo.drones.push({
          droneId,
          droneTag,
          planCount,
          plans
        });
      });
    }
    
    return teamPlanInfo;
  };

  const handleDateChange = async (date) => {
    setSelectedMissions([]);
    setSelectedGroup(null);
    setMissions(null);
    setAssignedTeamId("");
    setSelectedTeamId("");
    setSelectedPilot("");
    setSelectedDrone("");
    setDeployStatus(null);
    setSelectedDate(date);
    if (!date) return;

    const formattedDate = date.toLocaleDateString('en-CA');
    const result = await dispatch(baseApi.endpoints.getPlansByDate.initiate(formattedDate));
    const response = result.data;
    if (response && response.status === "true" && response["0"] && Array.isArray(response["0"])) {
      const missionArray = response["0"];
      const missionOptions = missionArray.map(mission => ({
        id: mission.mission_id,
        group: getDisplayName(mission),
        activated: mission.farmer_activated,
        team_assigned: mission.team_assigned || 0,
      }));
      setMissions(missionOptions);
    } else {
      setMissions([]);
    }

    await fetchTeams();
    await fetchGroupAssignments(date);
    const planCounts = await getPlanCounts(date);
    setPilotPlanCounts(planCounts.pilotPlanCounts);
    setDronePlanCounts(planCounts.dronePlanCounts);
    setPlanDetails(planCounts.planDetails);
  };

  const handleMissionToggle = (mission) => {
    setSelectedMissions(prev => {
      const isSelected = prev.some(m => m.id === mission.id);
      if (isSelected) {
        return prev.filter(m => m.id !== mission.id);
      } else {
        return [...prev, mission];
      }
    });
    setDeployStatus(null);
  };

  const handleSelectAllMissions = () => {
    if (selectedMissions.length === missions.length) {
      setSelectedMissions([]);
    } else {
      setSelectedMissions([...missions]);
    }
    setDeployStatus(null);
  };

  const handleTeamSelect = (teamId) => {
    if (!teamId) {
      setSelectedTeamId("");
      setDeployStatus(null);
      return;
    }
    setSelectedTeamId(teamId);
    setDeployStatus(null);
  };

  const handleDeployResources = async () => {
    if (!selectedMissions.length || !selectedTeamId || !selectedPilot || !selectedDrone) return;
    setDeployStatus("loading");
    
    const missionIds = selectedMissions.map(m => m.id.toString());
    const submissionData = {
      date: selectedDate.toLocaleDateString('en-CA'),
      team: selectedTeamId,
      pilot: selectedPilot,
      drone: selectedDrone,
      missions: missionIds
    };
    
    console.log('Deploying group missions:', submissionData);
    const result = await dispatch(baseApi.endpoints.createGroupAssignedMissions.initiate(submissionData));
    const response = result.data;
    if (response && (response.status === "true" || response.status === true || response.success === true)) {
      console.log('Successfully deployed group missions');
      setDeployStatus("success");
      setAssignedTeamId(selectedTeamId);
      setSelectedMissions([]);
      setSelectedPilot("");
      setSelectedDrone("");
      
      // Update missions to show they are assigned
      setMissions(prev => prev.map(m => 
        selectedMissions.some(sm => sm.id === m.id) 
          ? { ...m, team_assigned: 1 }
          : m
      ));
      
      if (selectedDate) {
        await fetchGroupAssignments(selectedDate);
        const planCounts = await getPlanCounts(selectedDate);
        setPilotPlanCounts(planCounts.pilotPlanCounts);
        setDronePlanCounts(planCounts.dronePlanCounts);
        setPlanDetails(planCounts.planDetails);
      }
    } else {
      console.error('Failed to deploy group missions:', response);
      setDeployStatus("error");
    }
  };

  const handleAddMissionsToGroup = async () => {
    if (!selectedMissionsForGroup.length || !selectedGroup) return;
    
    const missionIds = selectedMissionsForGroup.map(m => m.id.toString());
    const result = await dispatch(baseApi.endpoints.updateGroupAssignedMissions.initiate({ group: selectedGroup.id, missions: missionIds }));
    const response = result.data;
    
    if (response && (response.status === "true" || response.status === true || response.success === true)) {
      console.log('Successfully added missions to group');
      setSelectedMissionsForGroup([]);
      setSelectedGroup(null);
      await fetchGroupAssignments(selectedDate);
    } else {
      console.error('Failed to add missions to group:', response);
    }
  };

  const handleRemoveMissionsFromGroup = async () => {
    if (!selectedMissionsForGroup.length) return;
    
    const missionIds = selectedMissionsForGroup.map(m => m.id.toString());
    console.log('Removing missions from groups:', missionIds);
    
    try {
      const result = await dispatch(baseApi.endpoints.removeGroupFromMissions.initiate({ missions: missionIds }));
      const response = result.data;
      console.log('Remove response:', response);
      
      if (response && (response.status === "true" || response.status === true || response.success === true)) {
        console.log('Successfully removed missions from groups');
        setSelectedMissionsForGroup([]);
        await fetchGroupAssignments(selectedDate);
        // Also refresh missions to update their assignment status
        if (selectedDate) {
          const formattedDate = selectedDate.toLocaleDateString('en-CA');
          const result = await dispatch(baseApi.endpoints.getPlansByDate.initiate(formattedDate));
    const response = result.data;
          if (response && response.status === "true" && response["0"] && Array.isArray(response["0"])) {
            const missionArray = response["0"];
            const missionOptions = missionArray.map(mission => ({
              id: mission.mission_id,
              group: getDisplayName(mission),
              activated: mission.farmer_activated,
              team_assigned: mission.team_assigned || 0,
            }));
            setMissions(missionOptions);
          }
        }
      } else {
        console.error('Failed to remove missions:', response);
      }
    } catch (error) {
      console.error('Error removing missions:', error);
    }
  };

  const handleTeamUpdate = async () => {
    await fetchTeams();
    if (selectedDate) {
      const planCounts = await getPlanCounts(selectedDate);
      setPilotPlanCounts(planCounts.pilotPlanCounts);
      setDronePlanCounts(planCounts.dronePlanCounts);
      setPlanDetails(planCounts.planDetails);
    }
    if (selectedTeamId) {
      const currentTeam = teams.find(team => Number(team.team_id) === Number(selectedTeamId));
      const teamId = Number(selectedTeamId);
      if (teamId >= 1 && teamId <= 9) {
        setSelectedTeamId("");
        setAssignedTeamId("");
        setDeployStatus(null);
        return;
      }
      if (!currentTeam) {
        setSelectedTeamId("");
        setAssignedTeamId("");
        setDeployStatus(null);
      } else {
        const hasValidRequirements = Array.isArray(currentTeam.pilots) && currentTeam.pilots.length > 0 &&
          Array.isArray(currentTeam.drones) && currentTeam.drones.length > 0;
        const hasTeamLead = currentTeam.pilots && Array.isArray(currentTeam.pilots) && currentTeam.pilots.some(pilot => pilot[2] === 1);
        if (!hasValidRequirements || !hasTeamLead) {
          setSelectedTeamId("");
          setAssignedTeamId("");
          setDeployStatus(null);
        }
      }
    }
  };

  useEffect(() => {
    fetchTeams();
    handleDateChange(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (assignedTeamId && !selectedTeamId) {
      setSelectedTeamId(assignedTeamId);
    }
  }, [assignedTeamId, selectedTeamId]);

  return (
    <div className="plan-proceed">
      <div className="top-controls-row">
        <div className="top-control">
          <label htmlFor="date-name-proceed" className="form-label">Plan Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy/MM/dd"
            placeholderText="Select a date"
            customInput={<CustomDateInput />}
          />
        </div>
        <div className="top-control" style={{ flex: '1 1 0' }}>
          <label htmlFor="mission-select-name" className="form-label">Select Missions</label>
          <div className="mission-selection-container">
            {missions && missions.length > 0 && (
              <div className="mission-selection-header">
                <label className="select-all-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedMissions.length === missions.length}
                    onChange={handleSelectAllMissions}
                  />
                  Select All ({missions.length} missions)
                </label>
              </div>
            )}
            <div className="mission-list">
              {missions && missions.length > 0 ? (
                missions.map(mission => (
                  <div 
                    key={mission.id} 
                    className={`mission-item ${selectedMissions.some(m => m.id === mission.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`mission-${mission.id}`}
                      checked={selectedMissions.some(m => m.id === mission.id)}
                      onChange={() => handleMissionToggle(mission)}
                    />
                    <label 
                      htmlFor={`mission-${mission.id}`}
                      className={mission.team_assigned ? 'assigned' : ''}
                    >
                      {mission.group}
                      {mission.team_assigned && (
                        <span className="mission-assigned-badge">
                          ASSIGNED
                        </span>
                      )}
                    </label>
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  padding: '20px',
                  fontStyle: 'italic'
                }}>
                  No missions available for selected date
                </div>
              )}
            </div>
            {selectedMissions.length > 0 && (
              <div className="selected-missions-summary">
                {selectedMissions.length} mission{selectedMissions.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </div>
        
        {/* Group Management Section */}
        {selectedDate && missions && missions.length > 0 && (
          <div className="top-control group-management-main" style={{ flex: '1 1 0' }}>
            <label className="form-label group-management-label">
              <span className="label-icon">📦</span>
              Mission Group Management
            </label>
            <div className="group-management-container">
              <div className="group-management-header">
                <button 
                  className="group-management-toggle-btn"
                  onClick={() => setShowGroupManagement(!showGroupManagement)}
                >
                  <span className="toggle-icon">{showGroupManagement ? '▼' : '▶'}</span>
                  {showGroupManagement ? 'Hide' : 'Show'} Group Management
                </button>
              </div>
              
              {showGroupManagement && (
                <div className="group-management-content">
                  {/* Current Groups Display */}
                  <div className="current-groups-section">
                    <div className="section-header">
                      <h4>
                        <span className="section-icon">📋</span>
                        Current Groups for {selectedDate.toLocaleDateString('en-US')}
                      </h4>
                      <span className="groups-count">{missionGroups.length} group{missionGroups.length !== 1 ? 's' : ''}</span>
                    </div>
                    {missionGroups.length > 0 ? (
                      <div className="groups-list">
                        {missionGroups.map(group => (
                          <div key={group.id} className="group-item">
                            <div className="group-header">
                              <div className="group-title">
                                <span className="group-id">Group {group.id}</span>
                                <span className="group-status">Active</span>
                              </div>
                              <span className="group-missions-count">
                                {group.missions.length} mission{group.missions.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="group-assignment-info">
                              <div className="assignment-row">
                                <span className="assignment-label">Team:</span>
                                <span className="assignment-value">{group.team}</span>
                              </div>
                              <div className="assignment-row">
                                <span className="assignment-label">Pilot:</span>
                                <span className="assignment-value">{group.pilot}</span>
                              </div>
                              <div className="assignment-row">
                                <span className="assignment-label">Drone:</span>
                                <span className="assignment-value">{group.drone}</span>
                              </div>
                            </div>
                            <div className="group-missions">
                              {group.missions.map(missionId => {
                                const mission = missions.find(m => m.id === missionId);
                                return mission ? (
                                  <span key={missionId} className="mission-tag">
                                    {mission.group}
                                  </span>
                                ) : (
                                  <span key={missionId} className="mission-tag unknown">
                                    Mission {missionId}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-groups-message">
                        <div className="no-groups-icon">📦</div>
                        <div className="no-groups-text">No groups assigned for this date</div>
                        <div className="no-groups-subtext">Create a new group by selecting missions and assigning them to a team</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Mission Selection for Group Operations */}
                  <div className="mission-group-operations">
                    <div className="section-header">
                      <h4>
                        <span className="section-icon">⚙️</span>
                        Group Operations
                      </h4>
                      <span className="selected-count">{selectedMissionsForGroup.length} selected</span>
                    </div>
                    <div className="mission-selection-for-group">
                      {missions.map(mission => (
                        <div 
                          key={mission.id} 
                          className={`mission-item-for-group ${selectedMissionsForGroup.some(m => m.id === mission.id) ? 'selected' : ''} ${mission.team_assigned ? 'assigned' : ''}`}
                        >
                          <input
                            type="checkbox"
                            id={`group-mission-${mission.id}`}
                            checked={selectedMissionsForGroup.some(m => m.id === mission.id)}
                            onChange={() => {
                              setSelectedMissionsForGroup(prev => {
                                const isSelected = prev.some(m => m.id === mission.id);
                                if (isSelected) {
                                  return prev.filter(m => m.id !== mission.id);
                                } else {
                                  return [...prev, mission];
                                }
                              });
                            }}
                          />
                          <label 
                            htmlFor={`group-mission-${mission.id}`}
                            className="mission-label"
                          >
                            <span className="mission-name">{mission.group}</span>
                            {mission.team_assigned && (
                              <span className="mission-assigned-badge">ASSIGNED</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    {selectedMissionsForGroup.length > 0 && (
                      <div className="group-operation-buttons">
                        <button 
                          className="add-to-group-btn"
                          onClick={handleAddMissionsToGroup}
                          disabled={!selectedGroup}
                          title={!selectedGroup ? "Select a group first" : "Add selected missions to group"}
                        >
                          <span className="btn-icon">➕</span>
                          Add to Group {selectedGroup ? selectedGroup.id : ''}
                        </button>
                        <button 
                          className="remove-from-group-btn"
                          onClick={handleRemoveMissionsFromGroup}
                          title="Remove selected missions from their current groups"
                        >
                          <span className="btn-icon">➖</span>
                          Remove from Groups
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {selectedDate && selectedMissions.length > 0 && (
          <>
            <div className="top-control">
              <label htmlFor="team-select" className="form-label">Select Team</label>
              <select
                id="team-select"
                value={selectedTeamId || ''}
                onChange={e => handleTeamSelect(e.target.value)}
                disabled={loadingTeams}
                className={`form-control ${assignedTeamId ? "team-dropdown-assigned" : ""}`}
              >
                <option value="">-- Select a team --</option>
                {teams
                  .filter(team => {
                    const teamId = Number(team.team_id);
                    if (teamId >= 1 && teamId <= 9) {
                      return false;
                    }
                    if (assignedTeamId && Number(assignedTeamId) === teamId) {
                      return true;
                    }
                    const hasBasicRequirements = teamId >= 10 &&
                      Array.isArray(team.pilots) && team.pilots.length > 0 &&
                      Array.isArray(team.drones) && team.drones.length > 0;
                    const hasTeamLead = team.pilots && Array.isArray(team.pilots) && 
                      team.pilots.some(pilot => pilot[2] === 1);
                    return hasBasicRequirements && hasTeamLead;
                  })
                  .map(team => {
                    const teamPlanInfo = getTeamPlanCounts(team);
                    
                    // Get unique plan IDs for this team by combining all plans from pilots and drones
                    const uniquePlanIds = new Set();
                    teamPlanInfo.pilots.forEach(pilot => {
                      pilot.plans.forEach(plan => uniquePlanIds.add(plan.planId));
                    });
                    teamPlanInfo.drones.forEach(drone => {
                      drone.plans.forEach(plan => uniquePlanIds.add(plan.planId));
                    });
                    
                    return (
                      <option 
                        key={team.team_id} 
                        value={team.team_id}
                      >
                        {team.team_name || `Team ${team.team_id}`}
                        
                      </option>
                    );
                  })}
              </select>
            </div>
            
            {selectedTeamId && (
              <>
                <div className="top-control">
                  <label htmlFor="pilot-select" className="form-label">Select Pilot</label>
                  <select
                    id="pilot-select"
                    value={selectedPilot || ''}
                    onChange={e => setSelectedPilot(e.target.value)}
                    className="form-control"
                  >
                    <option value="">-- Select a pilot --</option>
                    {(() => {
                      const selectedTeam = teams.find(t => Number(t.team_id) === Number(selectedTeamId));
                      return selectedTeam && selectedTeam.pilots ? selectedTeam.pilots.map(pilot => (
                        <option key={pilot[0]} value={pilot[0]}>
                          {pilot[1]} {pilot[2] === 1 ? '(Team Lead)' : ''}
                        </option>
                      )) : [];
                    })()}
                  </select>
                </div>
                
                <div className="top-control">
                  <label htmlFor="drone-select" className="form-label">Select Drone</label>
                  <select
                    id="drone-select"
                    value={selectedDrone || ''}
                    onChange={e => setSelectedDrone(e.target.value)}
                    className="form-control"
                  >
                    <option value="">-- Select a drone --</option>
                    {(() => {
                      const selectedTeam = teams.find(t => Number(t.team_id) === Number(selectedTeamId));
                      return selectedTeam && selectedTeam.drones ? selectedTeam.drones.map(drone => (
                        <option key={drone[0]} value={drone[0]}>
                          {drone[1]}
                        </option>
                      )) : [];
                    })()}
                  </select>
                </div>
              </>
            )}
            
            <div className="top-control">
              <label style={{ visibility: 'hidden' }}>Deploy</label>
              {selectedTeamId && selectedPilot && selectedDrone && (
                <button
                  className="deploy-btn"
                  onClick={handleDeployResources}
                  disabled={deployStatus === "loading"}
                >
                  {deployStatus === "loading" ? "Deploying..." : `Deploy Group (${selectedMissions.length} missions)`}
                </button>
              )}

              {deployStatus === "success" && (
                <span className="status-message status-success">
                  ✓ Group assigned successfully!
                </span>
              )}
              {deployStatus === "error" && (
                <span className="status-message status-error">
                  ✗ Failed to assign group.
                </span>
              )}
            </div>
          </>
        )}
      </div>



      <div className="team-allocation-bottom-wrapper">
        <NonpTeamAllocationBottom 
          onTeamUpdate={handleTeamUpdate}
          pilotPlanCounts={pilotPlanCounts}
          dronePlanCounts={dronePlanCounts}
          planDetails={planDetails}
          selectedDate={selectedDate}
          teams={teams}
          missionGroups={missionGroups}
          selectedMissions={selectedMissions}
          missions={missions}
        />
      </div>
    </div>
  );
};

export default NonpTeamAllocation;


