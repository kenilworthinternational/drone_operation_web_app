import React, { useEffect, useState } from 'react';
import { baseApi } from '../../api/services/allEndpoints';
import { useAppDispatch } from '../../store/hooks';
import '../../styles/proceedPlan.css';

const NonpTeamAllocationBottom = ({ onTeamUpdate, pilotPlanCounts = {}, dronePlanCounts = {}, planDetails = {}, selectedDate, teams: propTeams = [], missionGroups = [], missions = [] }) => {
  const dispatch = useAppDispatch();
  const [teams, setTeams] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragType, setDragType] = useState(null);
  const [dragOverTeamId, setDragOverTeamId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showWarningTooltip, setShowWarningTooltip] = useState(null);
  const [showPlanCountTooltip, setShowPlanCountTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const [showPoolPopup, setShowPoolPopup] = useState(false);
  const [poolData, setPoolData] = useState({ members: [], drones: [] });
  const [selectedPilots, setSelectedPilots] = useState([]);
  const [selectedDrones, setSelectedDrones] = useState([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolError, setPoolError] = useState('');
  const [poolSuccess, setPoolSuccess] = useState('');

  const [activeTab, setActiveTab] = useState('teams');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const result = await dispatch(baseApi.endpoints.getTeamDataNonPlantation.initiate());
    const response = result.data;
    let teamsData = [];
    if (response && Array.isArray(response)) {
      teamsData = response;
    } else if (response && response.data) {
      teamsData = response.data;
    } else {
      setTeams([]);
      return;
    }
    const sortedTeams = [...teamsData].sort((a, b) => {
      const teamAId = Number(a.team_id);
      const teamBId = Number(b.team_id);
      if (teamAId === 2 || teamAId === 3) return 1;
      if (teamBId === 2 || teamBId === 3) return -1;
      return teamAId - teamBId;
    });
    setTeams(sortedTeams);
  };

  const handlePoolPopupOpen = async () => {
    setPoolLoading(true);
    setPoolError('');
    setPoolSuccess('');
    setSelectedPilots([]);
    setSelectedDrones([]);
    try {
      const result = await dispatch(baseApi.endpoints.getNonPlantationPilotsWithoutTeam.initiate());
      const response = result.data;
      if (response && (response.members || response.drones)) {
        setPoolData({
          members: response.members || [],
          drones: response.drones || []
        });
        setShowPoolPopup(true);
      } else {
        setPoolError('No available pilots or drones found');
      }
    } catch (error) {
      setPoolError('Failed to load available resources');
    } finally {
      setPoolLoading(false);
    }
  };

  const handlePilotSelection = (pilotId) => {
    setSelectedPilots(prev => prev.includes(pilotId) ? prev.filter(id => id !== pilotId) : [...prev, pilotId]);
  };

  const handleDroneSelection = (droneId) => {
    setSelectedDrones(prev => prev.includes(droneId) ? prev.filter(id => id !== droneId) : [...prev, droneId]);
  };

  const handleSaveToPool = async () => {
    if (selectedPilots.length === 0 && selectedDrones.length === 0) {
      setPoolError('Please select at least one pilot or drone');
      return;
    }
    setPoolLoading(true);
    setPoolError('');
    setPoolSuccess('');
    try {
      const submissionData = {
        pilots: selectedPilots.map(pilotId => {
          const pilot = poolData.members.find(m => m.id === pilotId);
          return [pilotId.toString(), pilot.name];
        }),
        drones: selectedDrones.map(droneId => {
          const drone = poolData.drones.find(d => d.id === droneId);
          return [droneId.toString(), drone.tag];
        }),
        team_id: "1"
      };
      const result = await dispatch(baseApi.endpoints.addDroneOrPilotToPoolNonPlantation.initiate(submissionData));
      const response = result.data;
      if (response && response.status === "true") {
        setPoolSuccess(`Successfully added ${response.pilots_count || 0} pilots and ${response.drones_count || 0} drones to pool`);
        setShowPoolPopup(false);
        await fetchTeams();
        if (onTeamUpdate) onTeamUpdate();
        setTimeout(() => setPoolSuccess(''), 3000);
      } else {
        setPoolError('Failed to add resources to pool');
      }
    } catch (error) {
      setPoolError('Failed to add resources to pool');
    } finally {
      setPoolLoading(false);
    }
  };

  const getPilotPlanCount = (pilotId) => {
    const pilotInfo = pilotPlanCounts[Number(pilotId)];
    return pilotInfo ? pilotInfo.count : 0;
  };
  
  const getDronePlanCount = (droneId) => {
    const droneInfo = dronePlanCounts[Number(droneId)];
    return droneInfo ? droneInfo.count : 0;
  };
  
  const getPilotPlanDetails = (pilotId) => {
    const pilotInfo = pilotPlanCounts[Number(pilotId)];
    return pilotInfo ? pilotInfo.plans : [];
  };
  
  const getDronePlanDetails = (droneId) => {
    const droneInfo = dronePlanCounts[Number(droneId)];
    return droneInfo ? droneInfo.plans : [];
  };

  const checkTeamRequirements = (team) => {
    const teamId = Number(team.team_id);
    if (teamId >= 1 && teamId <= 9) {
      return { hasPilots: true, hasDrones: true, hasTeamLead: true, isValid: true };
    }
    const hasPilots = Array.isArray(team.pilots) && team.pilots.length > 0;
    const hasDrones = Array.isArray(team.drones) && team.drones.length > 0;
    const hasTeamLead = hasPilots && team.pilots.some(pilot => pilot[2] === 1);
    return { hasPilots, hasDrones, hasTeamLead, isValid: hasPilots && hasDrones && hasTeamLead };
  };

  const validateTeamRequirements = (fromTeamId, toTeamId, type) => {
    const fromTeam = teams.find(team => team.team_id === fromTeamId);
    const toTeam = teams.find(team => team.team_id === toTeamId);
    if (!fromTeam || !toTeam) {
      setErrorMessage('Invalid team selection. Please try again.');
      return false;
    }
    // const isPoolTeam = Number(toTeamId) === 1;
    // if (!isPoolTeam) {
    //   if (type === 'pilot' && toTeam.pilots.length >= 5) {
    //     setErrorMessage('Destination team already has maximum number of pilots (5).');
    //     return false;
    //   } else if (type === 'drone' && toTeam.drones.length >= 3) {
    //     setErrorMessage('Destination team already has maximum number of drones (3).');
    //     return false;
    //   }
    // }
    return true;
  };

  const handleDragStart = (item, type, fromTeamId) => {
    setErrorMessage('');
    setSuccessMessage('');
    setDraggedItem({ ...item, fromTeamId });
    setDragType(type);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragType(null);
    setDragOverTeamId(null);
  };

  const handleDragEnter = (teamId) => setDragOverTeamId(teamId);
  const handleDragLeave = () => setDragOverTeamId(null);

  const handleContextMenu = (e, item, type, fromTeamId) => {
    e.preventDefault();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, item, type, fromTeamId });
  };

  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, item: null, type: null, fromTeamId: null });

  const handleContextMenuTeamSelect = async (toTeamId) => {
    if (!contextMenu.item || !contextMenu.type || contextMenu.fromTeamId === toTeamId) {
      setContextMenu({ show: false, x: 0, y: 0, item: null, type: null, fromTeamId: null });
      return;
    }
    if (!validateTeamRequirements(contextMenu.fromTeamId, toTeamId, contextMenu.type)) {
      setContextMenu({ show: false, x: 0, y: 0, item: null, type: null, fromTeamId: null });
      return;
    }
    try {
      if (contextMenu.type === 'pilot') {
        await dispatch(baseApi.endpoints.updateTeamPilotNonPlantation.initiate({
          pilots: [[contextMenu.item[0], contextMenu.item[1]]],
          team_from: String(contextMenu.fromTeamId),
          team_to: String(toTeamId)
        }));
      } else if (contextMenu.type === 'drone') {
        await dispatch(baseApi.endpoints.updateTeamDroneNonPlantation.initiate({
          drones: [[contextMenu.item[0], contextMenu.item[1]]],
          team_from: String(contextMenu.fromTeamId),
          team_to: String(toTeamId)
        }));
      }
      await fetchTeams();
      if (onTeamUpdate) onTeamUpdate();
      setErrorMessage('');
      setSuccessMessage('');
    } catch (error) {
      await fetchTeams();
      if (onTeamUpdate) onTeamUpdate();
      setErrorMessage('');
      setSuccessMessage(`${contextMenu.type === 'pilot' ? 'Pilot' : 'Drone'} moved successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setContextMenu({ show: false, x: 0, y: 0, item: null, type: null, fromTeamId: null });
  };

  const handleClickOutside = () => {
    setContextMenu({ show: false, x: 0, y: 0, item: null, type: null, fromTeamId: null });
    setShowPlanCountTooltip(null);
  };

  const handleDrop = async (toTeamId) => {
    if (!draggedItem || !dragType || draggedItem.fromTeamId === toTeamId) {
      handleDragEnd();
      return;
    }
    if (!validateTeamRequirements(draggedItem.fromTeamId, toTeamId, dragType)) {
      handleDragEnd();
      return;
    }
    try {
      if (dragType === 'pilot') {
        await dispatch(baseApi.endpoints.updateTeamPilotNonPlantation.initiate({
          pilots: [[draggedItem[0], draggedItem[1]]],
          team_from: String(draggedItem.fromTeamId),
          team_to: String(toTeamId)
        }));
      } else if (dragType === 'drone') {
        await dispatch(baseApi.endpoints.updateTeamDroneNonPlantation.initiate({
          drones: [[draggedItem[0], draggedItem[1]]],
          team_from: String(draggedItem.fromTeamId),
          team_to: String(toTeamId)
        }));
      }
      await fetchTeams();
      if (onTeamUpdate) onTeamUpdate();
      setErrorMessage('');
      setSuccessMessage('');
    } catch (error) {
      await fetchTeams();
      if (onTeamUpdate) onTeamUpdate();
      setErrorMessage('');
      setSuccessMessage(`${dragType === 'pilot' ? 'Pilot' : 'Drone'} moved successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    handleDragEnd();
  };

  return (
    <div className="team-allocation-bottom" onClick={handleClickOutside}>
      {errorMessage && (<div className="error-message">{errorMessage}</div>)}
      {successMessage && (<div className="success-message">{successMessage}</div>)}
      <div className="tabs">
        <button className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => setActiveTab('teams')}>
          <span className="tab-icon">👥</span> Team Management
        </button>
        <button className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>
          <span className="tab-icon">📦</span> Mission Groups
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'teams' && (
          <div className="teams-container">
            {teams.map(team => {
              const requirements = checkTeamRequirements(team);
              const isPool = Number(team.team_id) === 1;
              return (
                <div key={team.team_id} className={`team-card ${!requirements.isValid ? 'team-card-invalid' : ''} ${isPool ? 'pool-team-card' : ''}`}>
                  {team.team_name && (
                    <div className={`team-name-badge team-badge-${team.team_id} ${isPool ? 'pool-team-badge' : ''}`} style={{ position: 'relative' }}>
                      {team.team_name}
                      {isPool && (
                        <button className="pool-add-button" onClick={handlePoolPopupOpen} title="Add pilots/drones to pool">
                          <span className="plus-icon-pool">+</span>
                        </button>
                      )}
                      {!requirements.isValid && (
                        <div className="team-warning-icon" onClick={() => setShowWarningTooltip(showWarningTooltip === team.team_id ? null : team.team_id)} onMouseEnter={() => setShowWarningTooltip(team.team_id)} onMouseLeave={() => setShowWarningTooltip(null)}>
                          ⚠️
                          {showWarningTooltip === team.team_id && (
                            <div className="team-warning-tooltip">
                              <div className="tooltip-header">
                                <span className="tooltip-icon">⚠️</span>
                                <strong>Missing Requirements</strong>
                              </div>
                              <div className="tooltip-content">
                                <ul>
                                  {!requirements.hasPilots && <li>At least 1 pilot required</li>}
                                  {!requirements.hasDrones && <li>At least 1 drone required</li>}
                                  {!requirements.hasTeamLead && <li>At least 1 team lead required</li>}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="team-section">
                    <h4>Pilots ({team.pilots.length})</h4>
                    <div className="pilot-list">
                      {team.pilots.map((pilot, idx) => {
                        const pilotId = pilot[0];
                        const pilotName = pilot[1];
                        const pilotImage = pilot[3];
                        const isTeamLead = pilot[2] === 1;
                        const planCount = getPilotPlanCount(pilotId);
                        const planDetails = getPilotPlanDetails(pilotId);
                        const hasMultiplePlans = planCount > 0;
                        
                        return (
                          <div
                            key={pilot[0] + '-' + idx}
                            className={'pilot-card' + (isTeamLead ? ' team-lead-bg' : '') + (draggedItem && dragType === 'pilot' && draggedItem[0] === pilot[0] ? ' dragging' : '') + (hasMultiplePlans ? ' has-multiple-plans' : '')}
                            draggable={true}
                            onDragStart={() => handleDragStart(pilot, 'pilot', team.team_id)}
                            onDragEnd={handleDragEnd}
                            onContextMenu={(e) => handleContextMenu(e, pilot, 'pilot', team.team_id)}

                            onMouseEnter={(e) => {
                              if (hasMultiplePlans) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const tooltipWidth = 280; // max-width from CSS
                                const screenWidth = window.innerWidth;
                                
                                // Check if tooltip would go off-screen to the right
                                let x = rect.right + 15;
                                if (x + tooltipWidth > screenWidth) {
                                  x = rect.left - tooltipWidth - 15; // Position to the left
                                }
                                
                                setTooltipPosition({
                                  x: Math.max(10, x), // Ensure it doesn't go off-screen to the left
                                  y: rect.top + rect.height / 2
                                });
                                setShowPlanCountTooltip(`pilot_${pilotId}`);
                              }
                            }}
                            onMouseLeave={() => setShowPlanCountTooltip(null)}
                          >
                            <img
                              src={pilotImage || '/public/assets/images/no-data.png'}
                              alt={pilotName}
                              className="pilot-img"
                              onError={(e) => { e.target.src = '/public/assets/images/no-data.png'; }}
                            />
                            <span>
                              {pilotName}
                              {isTeamLead && <span className="team-lead-crown">👑</span>}
                              {hasMultiplePlans && <span className="plan-count-badge">{planCount}</span>}
                            </span>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="team-section">
                    <h4>Drones ({team.drones.length})</h4>
                    <div className="drone-list">
                      {team.drones.map((drone, idx) => {
                        const droneId = drone[0];
                        const droneTag = drone[1];
                        const planCount = getDronePlanCount(droneId);
                        const planDetails = getDronePlanDetails(droneId);
                        const hasMultiplePlans = planCount > 0;
                        
                        return (
                          <div
                            key={drone[0] + '-' + idx}
                            className={'drone-card' + (draggedItem && dragType === 'drone' && draggedItem[0] === drone[0] ? ' dragging' : '') + (hasMultiplePlans ? ' has-multiple-plans' : '')}
                            draggable={true}
                            onDragStart={() => handleDragStart(drone, 'drone', team.team_id)}
                            onDragEnd={handleDragEnd}
                            onContextMenu={(e) => handleContextMenu(e, drone, 'drone', team.team_id)}

                            onMouseEnter={(e) => {
                              if (hasMultiplePlans) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const tooltipWidth = 280; // max-width from CSS
                                const screenWidth = window.innerWidth;
                                
                                // Check if tooltip would go off-screen to the right
                                let x = rect.right + 15;
                                if (x + tooltipWidth > screenWidth) {
                                  x = rect.left - tooltipWidth - 15; // Position to the left
                                }
                                
                                setTooltipPosition({
                                  x: Math.max(10, x), // Ensure it doesn't go off-screen to the left
                                  y: rect.top + rect.height / 2
                                });
                                setShowPlanCountTooltip(`drone_${droneId}`);
                              }
                            }}
                            onMouseLeave={() => setShowPlanCountTooltip(null)}
                          >
                            <span className="drone-icon">🛩️</span>
                            <span>
                              {droneTag}
                              {hasMultiplePlans && <span className="plan-count-badge">{planCount}</span>}
                            </span>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div
                    className={'drop-zone' + (dragOverTeamId === team.team_id ? ' drag-over' : '')}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(team.team_id)}
                    onDragEnter={() => handleDragEnter(team.team_id)}
                    onDragLeave={handleDragLeave}
                  >
                    <span>Drop here to move pilot/drone to this team</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="mission-groups-section">
            <div className="mission-groups-header">
              <h3>Mission Groups for {selectedDate ? selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</h3>
            </div>
            {missionGroups.length === 0 ? (
              <div className="no-groups-message">
                <div className="no-groups-icon">📦</div>
                <div className="no-groups-text">No mission groups assigned for {selectedDate ? selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</div>
              </div>
            ) : (
              <div className="mission-groups-grid">
                {missionGroups.map(group => {
                  const team = teams.find(t => Number(t.team_id) === Number(group.team));
                  const teamName = team ? team.team_name : `Team ${group.team}`;
                  
                  return (
                    <div key={group.id} className="mission-group-card">
                      <div className="group-header">
                        <h4>Group {group.id}</h4>
                        <span className="group-missions-count">{group.missions.length} mission{group.missions.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="group-details">
                        <div className="group-assignment">
                          <div className="assignment-item">
                            <strong>Team:</strong> {teamName}
                          </div>
                          <div className="assignment-item">
                            <strong>Pilot ID:</strong> {group.pilot}
                          </div>
                          <div className="assignment-item">
                            <strong>Drone ID:</strong> {group.drone}
                          </div>
                        </div>
                        <div className="group-missions-list">
                          <strong>Missions:</strong>
                          <div className="missions-container">
                            {group.missions.map(missionId => {
                              const mission = missions.find(m => m.id === missionId);
                              return mission ? (
                                <div key={missionId} className="group-mission-item">
                                  <span className="mission-name">{mission.group}</span>
                                  <span className="mission-id">ID: {missionId}</span>
                                </div>
                              ) : (
                                <div key={missionId} className="group-mission-item">
                                  <span className="mission-name">Unknown Mission</span>
                                  <span className="mission-id">ID: {missionId}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showPoolPopup && (
        <div className="pool-popup-overlay">
          <div className="pool-popup-container">
            <div className="pool-popup-header">
              <div className="pool-popup-header-content">
                <div className="pool-popup-icon">➕</div>
                <div>
                  <h3 className="pool-popup-title">Add to Team Pool</h3>
                  <p className="pool-popup-subtitle">Select pilots and drones to add to the pool</p>
                </div>
              </div>
              <button className="pool-popup-close" onClick={() => setShowPoolPopup(false)}>×</button>
            </div>
            <div className="pool-popup-content">
              {poolLoading && (<div className="loader-container"><div>Loading available resources...</div></div>)}
              {poolError && (
                <div className="restriction-warning-section">
                  <div className="restriction-warning-icon">⚠️</div>
                  <div>
                    <span className="restriction-warning-title">Error</span>
                    <p className="restriction-warning-text">{poolError}</p>
                  </div>
                </div>
              )}
              {poolSuccess && (
                <div className="restriction-action-section">
                  <div className="restriction-action-content">
                    <div className="restriction-action-icon">✓</div>
                    <div>
                      <span className="restriction-action-title">Success</span>
                      <p className="restriction-action-text">{poolSuccess}</p>
                    </div>
                  </div>
                </div>
              )}
              {!poolLoading && (
                <>
                  <div className="pool-section">
                    <h4 className="pool-section-title">Available Pilots ({poolData.members.length})</h4>
                    <div className="pool-section-container">
                      {poolData.members.length > 0 ? (
                        <div className="pool-grid">
                          {poolData.members.map((member, index) => (
                            <div key={member.id || index} className={`pool-item-card ${selectedPilots.includes(member.id) ? 'selected' : ''}`} onClick={() => handlePilotSelection(member.id)}>
                              <div className="pool-item-content">
                                <div className="pool-item-name">{member.name || `Pilot ${index + 1}`}</div>
                                <div className="pool-item-details">
                                  <span className={`pool-item-badge ${member.job_role === 'dp' ? 'pool-item-badge-pilot' : 'pool-item-badge-lead'}`}>
                                    {member.job_role === 'dp' ? 'Pilot' : 'Team Lead'}
                                  </span>
                                  <span>•</span>
                                  <span>{member.mobile || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pool-empty-message">No available pilots</div>
                      )}
                    </div>
                  </div>
                  <div className="pool-section">
                    <h4 className="pool-section-title">Available Drones ({poolData.drones.length})</h4>
                    <div className="pool-section-container">
                      {poolData.drones.length > 0 ? (
                        <div className="pool-grid">
                          {poolData.drones.map((drone, index) => (
                            <div key={drone.id || index} className={`pool-item-card ${selectedDrones.includes(drone.id) ? 'selected' : ''}`} onClick={() => handleDroneSelection(drone.id)}>
                              <div className="pool-item-content">
                                <div className="pool-item-name"><span style={{ fontSize: '14px' }}>🛩️</span>{drone.tag || `Drone ${index + 1}`}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pool-empty-message">No available drones</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="pool-popup-footer">
              <div className="pool-footer-buttons">
                <button onClick={() => setShowPoolPopup(false)} className="pool-cancel-button">Cancel</button>
                <button onClick={handleSaveToPool} disabled={poolLoading || (selectedPilots.length === 0 && selectedDrones.length === 0)} className="pool-save-button">
                  {poolLoading ? 'Saving...' : 'Save to Pool'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPlanCountTooltip && (
        <div 
          className="plan-count-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateY(-50%)',
            zIndex: 10000
          }}
        >
          <div className="tooltip-header">
            <span className="tooltip-icon">📅</span>
            <strong>
              {showPlanCountTooltip.startsWith('pilot_') 
                ? `${pilotPlanCounts[showPlanCountTooltip.replace('pilot_', '')]?.pilotName || 'Pilot'} - ${pilotPlanCounts[showPlanCountTooltip.replace('pilot_', '')]?.count || 0} plan(s)`
                : `${dronePlanCounts[showPlanCountTooltip.replace('drone_', '')]?.droneTag || 'Drone'} - ${dronePlanCounts[showPlanCountTooltip.replace('drone_', '')]?.count || 0} plan(s)`
              }
            </strong>
          </div>
          <div className="tooltip-content">
            <ul>
              {(showPlanCountTooltip.startsWith('pilot_') 
                ? pilotPlanCounts[showPlanCountTooltip.replace('pilot_', '')]?.plans || []
                : dronePlanCounts[showPlanCountTooltip.replace('drone_', '')]?.plans || []
              ).map((plan, planIdx) => {
                const pid = plan.planId || plan.id || plan.mission_id;
                const detail = planDetails && pid ? planDetails[pid] : null;
                const farmerFromDetails = detail && (detail.farmer_name || detail.farmerName || detail.farmer);
                const areaFromPlan = plan.land_extent || plan.area;
                const areaFromDetails = detail && (detail.land_extent || detail.area);
                const name = (plan.farmerName || plan.farmer_name || plan.farmer || farmerFromDetails || plan.planName || `Plan ${planIdx + 1}`);
                const area = areaFromPlan != null ? areaFromPlan : (areaFromDetails != null ? areaFromDetails : undefined);
                const areaText = area !== undefined && area !== null && area !== '' ? ` (${area} Ha)` : '';
                return (
                  <li key={planIdx}>{`${name}${areaText}`}</li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {contextMenu.show && (
        <div className="context-menu" style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 1000 }} onClick={(e) => e.stopPropagation()}>
          <div className="context-menu-header">
            <span>Move {contextMenu.type === 'pilot' ? 'Pilot' : 'Drone'} to:</span>
          </div>
          <div className="context-menu-teams">
            {teams.map(team => {
              const isCurrentTeam = team.team_id === contextMenu.fromTeamId;
              const isPool = Number(team.team_id) === 1;
              return (
                <div key={team.team_id} className={`context-menu-team ${isCurrentTeam ? 'context-menu-team-current' : ''} ${isPool ? 'context-menu-team-pool' : ''}`} onClick={() => handleContextMenuTeamSelect(team.team_id)}>
                  <span className="context-menu-team-name">{team.team_name || `Team ${team.team_id}`}</span>
                  {isCurrentTeam && (<span className="context-menu-team-current-label">(Current)</span>)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NonpTeamAllocationBottom;


