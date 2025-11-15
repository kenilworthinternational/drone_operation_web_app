import React, { useState, useEffect } from 'react';
import '../../styles/proceedPlan.css'; // Import custom CSS
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDropdown from '../../components/CustomDropdown';
import { FaCalendarAlt } from "react-icons/fa";
import { useAppDispatch } from '../../store/hooks';
import { baseApi } from '../../api/services/allEndpoints';
import TeamAllocationBottom from './teamAllocationBottom';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="date-picker-input" />
    <FaCalendarAlt className="calendar-icon" />
  </div>
));

const TeamAllocation = () => {
  const dispatch = useAppDispatch();
  const today = new Date();
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(today.getDate() + 2);
  const [selectedDate, setSelectedDate] = useState(dayAfterTomorrow);
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [assignedTeamId, setAssignedTeamId] = useState("");
  const [deployStatus, setDeployStatus] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [restrictedTeams, setRestrictedTeams] = useState(new Set());
  const [usedPilots, setUsedPilots] = useState(new Set());
  const [usedDrones, setUsedDrones] = useState(new Set());
  const [restrictionDetails, setRestrictionDetails] = useState({});
  const [showRestrictionError, setShowRestrictionError] = useState(false);
  const [restrictionErrorMessage, setRestrictionErrorMessage] = useState('');
  const [isTeamRestricted, setIsTeamRestricted] = useState(false);
  


  // Fetch teams for dropdown and bottom part
  const fetchTeams = async () => {
    setLoadingTeams(true);
    const result = await dispatch(baseApi.endpoints.getTeamData.initiate());
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





  // Fetch assigned team for the selected plan/date
  const fetchAssignedTeam = async (date, planId) => {
    if (!date || !planId) return;
    const formattedDate = date.toLocaleDateString('en-CA');
    const result = await dispatch(baseApi.endpoints.getTeamPlannedData.initiate({ date: formattedDate }));
    const response = result.data;
    if (response && response.status === "true") {
      // Find the plan in the response
      for (const key in response) {
        if (!isNaN(key) && String(response[key].id) === String(planId)) {
          setAssignedTeamId(response[key].team);
          setSelectedTeamId(response[key].team);
          return;
        }
      }
    }
    setAssignedTeamId("");
    setSelectedTeamId("");
  };

  // Get restricted teams based on existing plans for the selected date
  const getRestrictedTeams = async (date) => {
    if (!date) return { restrictedTeams: new Set(), usedPilots: new Set(), usedDrones: new Set(), restrictionDetails: {} };
    
    const formattedDate = date.toLocaleDateString('en-CA');
    const result = await dispatch(baseApi.endpoints.getTeamPlannedData.initiate({ date: formattedDate }));
    const response = result.data;
    
    if (!response || response.status !== "true") return { restrictedTeams: new Set(), usedPilots: new Set(), usedDrones: new Set(), restrictionDetails: {} };
    
    const restrictedTeams = new Set();
    const usedPilots = new Set();
    const usedDrones = new Set();
    const restrictionDetails = {};
    
    // Collect all used pilots and drones from existing plans
    // IMPORTANT: We ignore "ap" plans when calculating restrictions
    for (const key in response) {
      if (!isNaN(key)) {
        const plan = response[key];
        
        // Skip "ap" plans entirely when calculating restrictions
        if (plan.flag === "ap") {
          continue;
        }
        
        // Add team to restricted if it's already assigned
        if (plan.team && plan.team !== null && plan.team !== '') {
          const teamId = Number(plan.team);
          restrictedTeams.add(teamId);
          restrictionDetails[`team_${teamId}`] = {
            type: 'team_assigned',
            planId: plan.id,
            planName: `${plan.estate} - ${plan.area} Ha`,
            message: `Team ${plan.team_name} is already assigned to Plan ID ${plan.id} (${plan.estate} - ${plan.area} Ha)`
          };
        }
        
        // Collect used pilots with plan details (only from "np" plans)
        if (plan.pilots && Array.isArray(plan.pilots)) {
          plan.pilots.forEach(pilot => {
            const pilotId = Number(pilot.pilot_id);
            usedPilots.add(pilotId);
            restrictionDetails[`pilot_${pilotId}`] = {
              type: 'pilot_used',
              pilotId: pilotId,
              pilotName: pilot.pilot,
              planId: plan.id,
              planName: `${plan.estate} - ${plan.area} Ha`,
              message: `Pilot ${pilot.pilot} (ID: ${pilotId}) is already assigned to Plan ID ${plan.id} (${plan.estate} - ${plan.area} Ha)`
            };
          });
        }
        
        // Collect used drones with plan details (only from "np" plans)
        if (plan.drones && Array.isArray(plan.drones)) {
          plan.drones.forEach(drone => {
            const droneId = Number(drone.id);
            usedDrones.add(droneId);
            restrictionDetails[`drone_${droneId}`] = {
              type: 'drone_used',
              droneId: droneId,
              droneTag: drone.tag,
              planId: plan.id,
              planName: `${plan.estate} - ${plan.area} Ha`,
              message: `Drone ${drone.tag} (ID: ${droneId}) is already assigned to Plan ID ${plan.id} (${plan.estate} - ${plan.area} Ha)`
            };
          });
        }
      }
    }
    
    return { restrictedTeams, usedPilots, usedDrones, restrictionDetails };
  };

  // Check if a team has any restrictions
  const checkTeamRestrictions = (team) => {
    const teamId = Number(team.team_id);
    
    // Check if team is already assigned
    if (restrictedTeams.has(teamId)) {
      const teamRestriction = restrictionDetails[`team_${teamId}`];
      return {
        isRestricted: true,
        restrictions: [teamRestriction?.message || `Team ${teamId} is already assigned to another plan`]
      };
    }
    
    const restrictions = [];
    
    // Check if any pilot in the team is already used
    if (team.pilots && Array.isArray(team.pilots)) {
      team.pilots.forEach(pilot => {
        const pilotId = Number(pilot[0]);
        const pilotName = pilot[1];
        if (usedPilots.has(pilotId)) {
          const pilotRestriction = restrictionDetails[`pilot_${pilotId}`];
          if (pilotRestriction) {
            restrictions.push(pilotRestriction.message);
          } else {
            restrictions.push(`Pilot ${pilotName} (ID: ${pilotId}) is already assigned to another plan`);
          }
        }
      });
    }
    
    // Check if any drone in the team is already used
    if (team.drones && Array.isArray(team.drones)) {
      team.drones.forEach(drone => {
        const droneId = Number(drone[0]);
        const droneTag = drone[1];
        if (usedDrones.has(droneId)) {
          const droneRestriction = restrictionDetails[`drone_${droneId}`];
          if (droneRestriction) {
            restrictions.push(droneRestriction.message);
          } else {
            restrictions.push(`Drone ${droneTag} (ID: ${droneId}) is already assigned to another plan`);
          }
        }
      });
    }

    // Also check if any pilot or drone in this team is used in other teams (current UI state)
    if (teams && Array.isArray(teams)) {
      teams.forEach(otherTeam => {
        if (Number(otherTeam.team_id) !== teamId) {
          // Check if any pilot from this team is in another team
          if (team.pilots && Array.isArray(team.pilots)) {
            team.pilots.forEach(pilot => {
              const pilotId = Number(pilot[0]);
              const pilotName = pilot[1];
              if (otherTeam.pilots && Array.isArray(otherTeam.pilots)) {
                const isPilotInOtherTeam = otherTeam.pilots.some(otherPilot => 
                  Number(otherPilot[0]) === pilotId
                );
                if (isPilotInOtherTeam) {
                  restrictions.push(`Pilot ${pilotName} (ID: ${pilotId}) is already assigned to Team ${otherTeam.team_id}`);
                }
              }
            });
          }
          
          // Check if any drone from this team is in another team
          if (team.drones && Array.isArray(team.drones)) {
            team.drones.forEach(drone => {
              const droneId = Number(drone[0]);
              const droneTag = drone[1];
              if (otherTeam.drones && Array.isArray(otherTeam.drones)) {
                const isDroneInOtherTeam = otherTeam.drones.some(otherDrone => 
                  Number(otherDrone[0]) === droneId
                );
                if (isDroneInOtherTeam) {
                  restrictions.push(`Drone ${droneTag} (ID: ${droneId}) is already assigned to Team ${otherTeam.team_id}`);
                }
              }
            });
          }
        }
      });
    }

    return {
      isRestricted: restrictions.length > 0,
      restrictions: restrictions
    };
  };

  // Handle date change
  const handleDateChange = async (date) => {
    setSelectedMission(null);
    setMissions(null);
    setAssignedTeamId("");
    setSelectedTeamId("");
    setDeployStatus(null);
    setSelectedDate(date);
    setShowRestrictionError(false);
    setIsTeamRestricted(false);
    if (!date) return;
    
    const formattedDate = date.toLocaleDateString('en-CA');
    const result = await dispatch(baseApi.endpoints.getPlansByDate.initiate(formattedDate));
    const response = result.data;
    if (response && response.status === "true" && Object.keys(response).length > 2) {
      const missionArray = Object.keys(response)
        .filter(key => !isNaN(key))
        .map(key => response[key]);
      const missionOptions = missionArray.map(plan => ({
        id: plan.id,
        group: `${plan.estate} - ${plan.area} Ha`,
        estateId: Number(plan.estate_id),
        activated: plan.activated,
        team_assigned: plan.team_assigned,
        flag: plan.flag // Include the flag property
      }));
      setMissions(missionOptions);
    } else {
      setMissions([]);
    }
    
    // Fetch teams and restrictions
    await fetchTeams();
    const restrictions = await getRestrictedTeams(date);
    setRestrictedTeams(restrictions.restrictedTeams);
    setUsedPilots(restrictions.usedPilots);
    setUsedDrones(restrictions.usedDrones);
    setRestrictionDetails(restrictions.restrictionDetails);
    
    // Fetch plans for the selected date
    // await fetchPlansForSelectedDate();
  };

  // Handle plan selection
  const handleMissionSelect = async (mission) => {
    setSelectedMission(mission);
    setDeployStatus(null);
    setShowRestrictionError(false);
    setIsTeamRestricted(false);
    if (mission) {
      await fetchAssignedTeam(selectedDate, mission.id);
    } else {
      setAssignedTeamId("");
      setSelectedTeamId("");
    }
  };

  // Handle team selection from dropdown
  const handleTeamSelect = (teamId) => {
    if (!teamId) {
      setSelectedTeamId("");
      setDeployStatus(null);
      setShowRestrictionError(false);
      setIsTeamRestricted(false);
      return;
    }

    // Set the selected team regardless of restrictions
    setSelectedTeamId(teamId);
    setDeployStatus(null);

    // Check if the selected team has any restrictions
    // Convert teamId to number for comparison since team_id might be a number
    const teamIdNum = Number(teamId);
    const selectedTeam = teams.find(team => Number(team.team_id) === teamIdNum);
    
    if (!selectedTeam) {
      return;
    }

    const restrictionCheck = checkTeamRestrictions(selectedTeam);
    
    // For "ap" plans, ignore restrictions and allow deployment
    if (selectedMission && selectedMission.flag === "ap") {
      setShowRestrictionError(false);
      setIsTeamRestricted(false);
    } else {
      // For non-"ap" plans, check restrictions normally
      if (restrictionCheck.isRestricted) {
        // Show restriction warning but allow selection
        const message = restrictionCheck.restrictions.join('\n\n');
        setRestrictionErrorMessage(message);
        setShowRestrictionError(true);
        setIsTeamRestricted(true);
      } else {
        // Team is available
        setShowRestrictionError(false);
        setIsTeamRestricted(false);
      }
    }
  };

  // Handle deploy resources button click
  const handleDeployResources = async () => {
    if (!selectedMission || !selectedTeamId) {
      return;
    }
    
    // For "ap" plans, allow deployment even with restrictions
    // For other plans, check if team is restricted
    if (selectedMission.flag !== "ap" && isTeamRestricted) {
      return;
    }
    setDeployStatus("loading");
    const result = await dispatch(baseApi.endpoints.addTeamToPlan.initiate({ plan: String(selectedMission.id), team: String(selectedTeamId) }));
    const response = result.data;
    if (response && (response.status === "true" || response.status === true)) {
      setDeployStatus("success");
      setAssignedTeamId(selectedTeamId);
      
      // Update the selected mission's team_assigned status to show green background immediately
      if (selectedMission) {
        const updatedMission = {
          ...selectedMission,
          team_assigned: 1
        };
        setSelectedMission(updatedMission);
        
        // Also update the missions array so the dropdown shows correct status
        setMissions(prevMissions => 
          prevMissions.map(mission => 
            mission.id === selectedMission.id 
              ? { ...mission, team_assigned: 1 }
              : mission
          )
        );
      }
      
      // Refresh restrictions after successful deployment
      if (selectedDate) {
        const restrictions = await getRestrictedTeams(selectedDate);
        setRestrictedTeams(restrictions.restrictedTeams);
        setUsedPilots(restrictions.usedPilots);
        setUsedDrones(restrictions.usedDrones);
        setRestrictionDetails(restrictions.restrictionDetails);
      }
      
      // Refresh selected date's plans
      // await fetchPlansForSelectedDate();
    } else {
      setDeployStatus("error");
    }
  };

  // Callback function to handle team updates from bottom component
  const handleTeamUpdate = async () => {
    // Refresh teams data
    await fetchTeams();
    
    // Refresh restrictions
    if (selectedDate) {
      const restrictions = await getRestrictedTeams(selectedDate);
      setRestrictedTeams(restrictions.restrictedTeams);
      setUsedPilots(restrictions.usedPilots);
      setUsedDrones(restrictions.usedDrones);
      setRestrictionDetails(restrictions.restrictionDetails);
    }
    
    // If there's a currently selected team, check if it still exists and has valid requirements
    if (selectedTeamId) {
      const currentTeam = teams.find(team => Number(team.team_id) === Number(selectedTeamId));
      const teamId = Number(selectedTeamId);
      
      // Teams 1-9 are maintenance groups and should not be selected for missions
      if (teamId >= 1 && teamId <= 9) {
        // Clear selection if a maintenance team was somehow selected
        setSelectedTeamId("");
        setAssignedTeamId("");
        setDeployStatus(null);
        setShowRestrictionError(false);
        setIsTeamRestricted(false);
        return;
      }
      
      if (!currentTeam) {
        // Team no longer exists, clear selection
        setSelectedTeamId("");
        setAssignedTeamId("");
        setDeployStatus(null);
        setShowRestrictionError(false);
        setIsTeamRestricted(false);
      } else {
        // For teams 10+ (real operational teams), check requirements: exactly 1 pilot and 1 drone
        const hasValidRequirements = Array.isArray(currentTeam.pilots) && currentTeam.pilots.length === 1 &&
          Array.isArray(currentTeam.drones) && currentTeam.drones.length === 1;
        
        if (!hasValidRequirements) {
          // Team no longer meets requirements, clear selection
          setSelectedTeamId("");
          setAssignedTeamId("");
          setDeployStatus(null);
          setShowRestrictionError(false);
          setIsTeamRestricted(false);
        } else {
          // Re-check restrictions for the currently selected team
          const restrictionCheck = checkTeamRestrictions(currentTeam);
          if (restrictionCheck.isRestricted) {
            setRestrictionErrorMessage(restrictionCheck.restrictions.join('\n\n'));
            setShowRestrictionError(false); // Don't show popup automatically during updates
            setIsTeamRestricted(true);
          } else {
            setShowRestrictionError(false);
            setIsTeamRestricted(false);
          }
        }
      }
    }
  };

  // Fetch initial teams and missions on mount
  useEffect(() => {
    fetchTeams();
    // fetchPlansForSelectedDate();
    // Automatically call getPlansUsingDate with the initial date (day after tomorrow)
    handleDateChange(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronize selectedTeamId with assignedTeamId when it changes
  // Only do this when no team is currently selected (to avoid overriding user selection)
  useEffect(() => {
    if (assignedTeamId && !selectedTeamId) {
      setSelectedTeamId(assignedTeamId);
    }
  }, [assignedTeamId, selectedTeamId]);

  return (
    <div className="plan-proceed">
      <div className="top-controls-row">
        <div className="top-control">
          <label htmlFor="date-name-proceed">Plan Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy/MM/dd"
            placeholderText="Select a date"
            customInput={<CustomDateInput />}
          />
        </div>
        <div className="top-control" style={{ flex: '2 1 0' }}>
          <label htmlFor="mission-select-name">Select Mission</label>
          <div
            className={
              selectedMission
                ? (selectedMission.team_assigned ? "mission-dropdown-assigned" : "mission-dropdown-unassigned")
                : ""
            }
            style={{ borderRadius: 8, minWidth: '275px' }}
          >
            <CustomDropdown
              options={missions || []}
              onSelect={handleMissionSelect}
              selectedValue={selectedMission}
            />
          </div>
        </div>
        {selectedDate && selectedMission && (
          <>
            <div className="top-control">
              <label htmlFor="team-select">Select Team</label>
              <select
                id="team-select"
                value={selectedTeamId || ''}
                onChange={e => handleTeamSelect(e.target.value)}
                disabled={loadingTeams}
                className={
                  assignedTeamId ? "team-dropdown-assigned" : 
                  isTeamRestricted ? "team-dropdown-restricted" : ""
                }
              >
                <option value="">-- Select a team --</option>
                {teams
                  .filter(team => {
                    const teamId = Number(team.team_id);
                    
                    // Teams with ID 1-9 are maintenance groups and should NOT appear in dropdown
                    if (teamId >= 1 && teamId <= 9) {
                      return false; // Exclude maintenance teams from dropdown
                    }
                    
                    // If this team is already assigned to the selected mission, include it regardless of requirements
                    if (assignedTeamId && Number(assignedTeamId) === teamId) {
                      return true;
                    }
                    
                    // For "ap" plans, be more permissive with team requirements
                    if (selectedMission && selectedMission.flag === "ap") {
                      // For approved plans, include teams 10+ with at least 1 pilot and 1 drone
                      const hasMinRequirements = teamId >= 10 &&
                        Array.isArray(team.pilots) && team.pilots.length > 0 &&
                        Array.isArray(team.drones) && team.drones.length > 0;
                      return hasMinRequirements;
                    }
                    
                    // For teams 10 and above (real operational teams), check requirements: exactly 1 pilot and 1 drone
                    const hasValidRequirements = teamId >= 10 &&
                      Array.isArray(team.pilots) && team.pilots.length === 1 &&
                      Array.isArray(team.drones) && team.drones.length === 1;
                    
                    return hasValidRequirements;
                  })
                  .map(team => {
                    // Check if team has restrictions
                    const restrictionCheck = checkTeamRestrictions(team);
                    const isRestricted = restrictionCheck.isRestricted;
                    
                    return (
                      <option 
                        key={team.team_id} 
                        value={team.team_id}
                        className={isRestricted ? 'restricted-option' : ''}
                      >
                        {team.team_name || `Team ${team.team_id}`}
                        {isRestricted ? ' ⚠️ (Restricted)' : ''}
                      </option>
                    );
                  })}
              </select>
            </div>
            <div className="top-control">
              <label style={{ visibility: 'hidden' }}>Deploy</label>
              {selectedTeamId && (
                <button
                  className={`deploy-btn ${isTeamRestricted && selectedMission.flag !== "ap" ? 'deploy-btn-restricted' : ''}`}
                  onClick={handleDeployResources}
                  disabled={deployStatus === "loading" || (isTeamRestricted && selectedMission.flag !== "ap")}
                  style={{
                    opacity: (isTeamRestricted && selectedMission.flag !== "ap") ? 0.5 : 1,
                    cursor: (isTeamRestricted && selectedMission.flag !== "ap") ? 'not-allowed' : 'pointer',
                    backgroundColor: (isTeamRestricted && selectedMission.flag !== "ap") ? '#ccc' : '#004B71',
                    color: (isTeamRestricted && selectedMission.flag !== "ap") ? '#999' : '#fff',
                    borderColor: (isTeamRestricted && selectedMission.flag !== "ap") ? '#ccc' : '#004B71',
                    pointerEvents: (isTeamRestricted && selectedMission.flag !== "ap") ? 'none' : 'auto'
                  }}
                >
                  {deployStatus === "loading" ? "Deploying..." : "Deploy Resources"}
                </button>
              )}

              {deployStatus === "success" && (
                <span style={{ color: 'green', marginLeft: 10 }}>Team assigned successfully!</span>
              )}
              {deployStatus === "error" && (
                <span style={{ color: 'red', marginLeft: 10 }}>Failed to assign team.</span>
              )}
              {isTeamRestricted && selectedMission.flag !== "ap" && (
                <span style={{ color: 'orange', marginLeft: 10 }}>⚠️ Team has conflicts - Deploy disabled</span>
              )}
              {selectedMission && selectedMission.flag === "ap" && (
                <span style={{ color: '#28a745', marginLeft: 10 }}>✓ AddHoc Plan - Despite conflicts</span>
              )}
            </div>
          </>
        )}
      </div>

      
      {/* Modern Restriction Warning Popup */}
      {showRestrictionError && (
        <div className="restriction-popup-overlay">
          <div className="restriction-popup-container">
            {/* Header */}
            <div className="restriction-popup-header">
              <div className="restriction-popup-header-content">
                <div className="restriction-popup-icon">
                  ⚠️
                </div>
                <div>
                  <h3 className="restriction-popup-title">
                    Team Selection Warning
                  </h3>
                  <p className="restriction-popup-subtitle">
                    Conflicts detected with existing plans
                  </p>
                </div>
              </div>
              <button
                className="restriction-popup-close"
                onClick={() => setShowRestrictionError(false)}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="restriction-popup-content">
              {/* Warning Message */}
              <div className="restriction-warning-section">
                <div className="restriction-warning-icon">
                  ⚠️
                </div>
                <div>
                  <strong className="restriction-warning-title">
                    Deployment Blocked
                  </strong>
                  <p className="restriction-warning-text">
                    The selected team cannot be deployed due to conflicts with existing assignments.
                  </p>
                </div>
              </div>

              {/* Conflict Details */}
              <div className="restriction-details-section">
                <div className="restriction-details-header">
                  <div className="restriction-details-indicator"></div>
                  Conflict Details
                </div>
                
                <div className="restriction-details-content">
                  {restrictionErrorMessage ? (
                    restrictionErrorMessage.split('\n\n').map((message, index) => (
                      <div key={index} className="restriction-detail-item">
                        <div className="restriction-detail-bullet">
                          •
                        </div>
                        <div className="restriction-detail-text">
                          {message}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="restriction-detail-empty">
                      No specific conflict details available
                    </div>
                  )}
                </div>
              </div>

              {/* Action Note */}
              <div className="restriction-action-section">
                <div className="restriction-action-content">
                  <div className="restriction-action-icon">
                    i
                  </div>
                  <div>
                    <strong className="restriction-action-title">
                      Next Steps
                    </strong>
                    <span className="restriction-action-text">
                      The Deploy button will remain disabled until these conflicts are resolved.
                    </span>
                  </div>
                </div>
              </div>


            </div>

            {/* Footer */}
            <div className="restriction-popup-footer">
              <button
                className="restriction-popup-button"
                onClick={() => setShowRestrictionError(false)}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="team-allocation-bottom-wrapper">
        <TeamAllocationBottom 
          onTeamUpdate={handleTeamUpdate} 
          usedPilots={usedPilots}
          usedDrones={usedDrones}
          restrictionDetails={restrictionDetails}
          selectedDate={selectedDate} // Pass only the selected date
          teams={teams}
        />
      </div>
      
    </div>
  );
};

export default TeamAllocation;
