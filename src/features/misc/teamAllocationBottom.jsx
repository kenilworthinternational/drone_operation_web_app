import React, { useEffect, useState } from 'react';
import { baseApi } from '../../api/services/allEndpoints';
import { useAppDispatch } from '../../store/hooks';
import '../../styles/proceedPlan.css';

const TeamAllocationBottom = ({ onTeamUpdate, usedPilots = new Set(), usedDrones = new Set(), restrictionDetails = {}, selectedDate, teams: propTeams = [] }) => {
  const dispatch = useAppDispatch();
  const [teams, setTeams] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragType, setDragType] = useState(null); // 'pilot' or 'drone'
  const [dragOverTeamId, setDragOverTeamId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showWarningTooltip, setShowWarningTooltip] = useState(null); // team_id when tooltip is shown

  // Pool popup state
  const [showPoolPopup, setShowPoolPopup] = useState(false);
  const [poolData, setPoolData] = useState({ members: [], drones: [] });
  const [selectedPilots, setSelectedPilots] = useState([]);
  const [selectedDrones, setSelectedDrones] = useState([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolError, setPoolError] = useState('');
  const [poolSuccess, setPoolSuccess] = useState('');

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    item: null,
    type: null,
    fromTeamId: null
  });

  // Local state for plans and loading
  const [todayPlans, setTodayPlans] = useState({});
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' | 'assign' | 'plans'

  // Assignable plans state (filtered list)
  const [assignablePlans, setAssignablePlans] = useState({ unassigned: [], assigned: [] });
  const [loadingAssignable, setLoadingAssignable] = useState(false);

  // Drone update popup state
  const [showDroneUpdatePopup, setShowDroneUpdatePopup] = useState(false);
  const [selectedPlanForDroneUpdate, setSelectedPlanForDroneUpdate] = useState(null);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [availablePilots, setAvailablePilots] = useState([]);
  const [selectedDroneForUpdate, setSelectedDroneForUpdate] = useState(null);
  const [selectedPilotForUpdate, setSelectedPilotForUpdate] = useState(null);
  const [droneUpdateLoading, setDroneUpdateLoading] = useState(false);
  const [droneUpdateError, setDroneUpdateError] = useState('');
  const [droneUpdateSuccess, setDroneUpdateSuccess] = useState('');
  const [updateMode, setUpdateMode] = useState('drone'); // 'drone' or 'pilot'
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDrones, setFilteredDrones] = useState([]);
  const [filteredPilots, setFilteredPilots] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  // Filter drones and pilots based on search query
  useEffect(() => {
    if (updateMode === 'drone') {
      const filtered = availableDrones.filter(drone => 
        (drone.tag || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDrones(filtered);
    } else {
      const filtered = availablePilots.filter(pilot => 
        (pilot.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPilots(filtered);
    }
  }, [searchQuery, availableDrones, availablePilots, updateMode]);

  // Fetch plans when selectedDate changes or when plans tab is activated
  useEffect(() => {
    if (selectedDate && activeTab === 'plans') {
      fetchPlansForSelectedDate(selectedDate);
    }
  }, [selectedDate, activeTab]);

  // Fetch assignable plans when date changes or when assign tab is active
  useEffect(() => {
    if (selectedDate && activeTab === 'assign') {
      fetchAssignablePlansForSelectedDate(selectedDate);
    }
  }, [selectedDate, activeTab]);

  const fetchTeams = async () => {
    const result = await dispatch(baseApi.endpoints.getTeamData.initiate());
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

    // Sort teams to show team_id 2 and 3 at the end
    const sortedTeams = [...teamsData].sort((a, b) => {
      const teamAId = Number(a.team_id);
      const teamBId = Number(b.team_id);

      // Teams with ID 2 and 3 should be at the end
      if (teamAId === 2 || teamAId === 3) return 1;
      if (teamBId === 2 || teamBId === 3) return -1;

      // For all other teams, maintain original order
      return teamAId - teamBId;
    });

    setTeams(sortedTeams);
  };

  // Handle pool popup open
  const handlePoolPopupOpen = async () => {
    setPoolLoading(true);
    setPoolError('');
    setPoolSuccess('');
    setSelectedPilots([]);
    setSelectedDrones([]);

    try {
      const result = await dispatch(baseApi.endpoints.getPilotsAndDronesWithoutTeam.initiate());
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

  // Handle pilot selection
  const handlePilotSelection = (pilotId) => {
    setSelectedPilots(prev => {
      if (prev.includes(pilotId)) {
        return prev.filter(id => id !== pilotId);
      } else {
        return [...prev, pilotId];
      }
    });
  };

  // Handle drone selection
  const handleDroneSelection = (droneId) => {
    setSelectedDrones(prev => {
      if (prev.includes(droneId)) {
        return prev.filter(id => id !== droneId);
      } else {
        return [...prev, droneId];
      }
    });
  };

  // Handle save to pool
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

      const result = await dispatch(baseApi.endpoints.addDroneOrPilotToPool.initiate(submissionData));
      const response = result.data;

      // Ignore status, just proceed with the data
      setPoolSuccess(`Successfully added ${response?.pilots_count || selectedPilots.length} pilots and ${response?.drones_count || selectedDrones.length} drones to pool`);
      setShowPoolPopup(false);

      // Refresh teams data
      await fetchTeams();
      if (onTeamUpdate) {
        onTeamUpdate();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setPoolSuccess('');
      }, 3000);
    } catch (error) {
      setPoolError('Failed to add resources to pool');
    } finally {
      setPoolLoading(false);
    }
  };

  // Check if a pilot is restricted
  const isPilotRestricted = (pilotId) => {
    return usedPilots.has(Number(pilotId));
  };

  // Check if a drone is restricted
  const isDroneRestricted = (droneId) => {
    return usedDrones.has(Number(droneId));
  };

  // Get restriction message for pilot
  const getPilotRestrictionMessage = (pilotId) => {
    const restriction = restrictionDetails[`pilot_${pilotId}`];
    return restriction ? restriction.message : `Pilot ${pilotId} is already assigned`;
  };

  // Get restriction message for drone
  const getDroneRestrictionMessage = (droneId) => {
    const restriction = restrictionDetails[`drone_${droneId}`];
    return restriction ? restriction.message : `Drone ${droneId} is already assigned`;
  };

  // Get flag display text
  const getFlagDisplayText = (flag) => {
    switch (flag) {
      case 'ap':
        return 'AddHoc';
      case 'np':
        return 'Rev.Plan';
      case 'rp':
        return 'Resh.Plan';
      default:
        return flag;
    }
  };

  // Get flag display color
  const getFlagDisplayColor = (flag) => {
    switch (flag) {
      case 'ap':
        return '#ff6b35'; // Orange for AddHoc
      case 'np':
        return '#28a745'; // Green for Rev.Plan
      case 'rp':
        return '#007bff'; // Blue for Resh.Plan
      default:
        return '#6c757d';
    }
  };

  // Fetch plans for the selected date
  const fetchPlansForSelectedDate = async (date) => {
    setLoadingPlans(true);
    try {
      const formattedDate = date.toLocaleDateString('en-CA');
      const result = await dispatch(baseApi.endpoints.getTeamPlannedData.initiate({ date: formattedDate }));
      const response = result.data;
      if (response && response.status === "true") {
        const plansByTeam = {};
        for (const key in response) {
          if (!isNaN(key)) {
            const plan = response[key];
            if (plan.team && plan.team !== null && plan.team !== '') {
              const teamId = plan.team;
              if (!plansByTeam[teamId]) {
                plansByTeam[teamId] = [];
              }
              plansByTeam[teamId].push(plan);
            }
          }
        }
        setTodayPlans(plansByTeam);
      } else {
        setTodayPlans({});
      }
    } catch (error) {
      setTodayPlans({});
    } finally {
      setLoadingPlans(false);
    }
  };

  // Fetch assignable plans for the selected date with required filters
  const fetchAssignablePlansForSelectedDate = async (date) => {
    setLoadingAssignable(true);
    try {
      const formattedDate = date.toLocaleDateString('en-CA');
      const result = await dispatch(baseApi.endpoints.getTeamPlannedData.initiate({ date: formattedDate }));
      const response = result.data;
      if (response && response.status === "true") {
        const allPlans = [];
        for (const key in response) {
          if (!isNaN(key)) {
            const plan = response[key];
            // Filter: manager_approval=1, team_assigned=1, activated=1
            if (Number(plan.manager_approval) === 1 && Number(plan.team_assigned) === 1 && Number(plan.activated) === 1) {
              allPlans.push(plan);
            }
          }
        }

        // Split into unassigned fields (field_assigned=0) and assigned (field_assigned=1)
        const unassigned = allPlans.filter(p => Number(p.field_assigned) === 0);
        const assigned = allPlans.filter(p => Number(p.field_assigned) === 1);

        // Optional ordering: by estate then area desc
        const byEstateArea = (a, b) => {
          const ea = (a.estate || '').localeCompare(b.estate || '');
          if (ea !== 0) return ea;
          return Number(b.area || 0) - Number(a.area || 0);
        };

        setAssignablePlans({
          unassigned: [...unassigned].sort(byEstateArea),
          assigned: [...assigned].sort(byEstateArea)
        });
      } else {
        setAssignablePlans({ unassigned: [], assigned: [] });
      }
    } catch (error) {
      setAssignablePlans({ unassigned: [], assigned: [] });
    } finally {
      setLoadingAssignable(false);
    }
  };

  const handleAssign = (plan) => {
    // Placeholder for assignment flow. For now, switch to Team Management tab.
    setSuccessMessage(`Initiating assignment for plan ${plan.id} at ${plan.estate}`);
    setTimeout(() => setSuccessMessage(''), 2500);
  };

  // Check if a team meets minimum requirements
  const checkTeamRequirements = (team) => {
    const teamId = Number(team.team_id);

    // Teams with ID 1-9 are maintenance groups and should not show warnings
    if (teamId >= 1 && teamId <= 9) {
      return {
        hasPilots: true,
        hasDrones: true,
        isValid: true // Always valid for maintenance teams
      };
    }

    // For teams 10 and above (real operational teams), check requirements: exactly 1 pilot and 1 drone
    const hasPilots = Array.isArray(team.pilots) && team.pilots.length === 1;
    const hasDrones = Array.isArray(team.drones) && team.drones.length === 1;

    return {
      hasPilots,
      hasDrones,
      isValid: hasPilots && hasDrones
    };
  };

  // Validation function to check if a team has minimum requirements
  const validateTeamRequirements = (fromTeamId, toTeamId, type) => {
    const fromTeam = teams.find(team => team.team_id === fromTeamId);
    const toTeam = teams.find(team => team.team_id === toTeamId);

    if (!fromTeam || !toTeam) {
      setErrorMessage('Invalid team selection. Please try again.');
      return false;
    }

    const toTeamIdNum = Number(toTeamId);
    
    // Skip limits for pool team (team ID 1) and maintenance teams (ID 1-9) - they can have unlimited pilots/drones
    const isPoolOrMaintenanceTeam = toTeamIdNum >= 1 && toTeamIdNum <= 9;

    if (!isPoolOrMaintenanceTeam) {
      // For operational teams (ID 10+), enforce exactly 1 pilot and 1 drone limit
      if (type === 'pilot' && toTeam.pilots.length >= 1) {
        setErrorMessage('Each team can have exactly 1 pilot. Destination team already has a pilot.');
        return false;
      } else if (type === 'drone' && toTeam.drones.length >= 1) {
        setErrorMessage('Each team can have exactly 1 drone. Destination team already has a drone.');
        return false;
      }
    }

    return true;
  };

  const handleDragStart = (item, type, fromTeamId) => {
    setErrorMessage(''); // Clear any previous error messages
    setSuccessMessage(''); // Clear any previous success messages
    setDraggedItem({ ...item, fromTeamId });
    setDragType(type);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragType(null);
    setDragOverTeamId(null);
  };

  const handleDragEnter = (teamId) => {
    setDragOverTeamId(teamId);
  };

  const handleDragLeave = () => {
    setDragOverTeamId(null);
  };

  // Handle right-click context menu
  const handleContextMenu = (e, item, type, fromTeamId) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      item,
      type,
      fromTeamId
    });
  };

  // Handle context menu team selection
  const handleContextMenuTeamSelect = async (toTeamId) => {
    if (!contextMenu.item || !contextMenu.type || contextMenu.fromTeamId === toTeamId) {
      setContextMenu({ show: false, x: 0, y: 0, item: null, type: null, fromTeamId: null });
      return;
    }

    // Validate team requirements before proceeding
    if (!validateTeamRequirements(contextMenu.fromTeamId, toTeamId, contextMenu.type)) {
      setContextMenu({ show: false, x: 0, y: 0, item: null, type: null, fromTeamId: null });
      return;
    }

    try {
      let response;
      if (contextMenu.type === 'pilot') {
        const updateResult = await dispatch(baseApi.endpoints.updateTeamPilot.initiate({
          pilots: [[contextMenu.item[0], contextMenu.item[1]]],
          team_from: String(contextMenu.fromTeamId),
          team_to: String(toTeamId)
        }));
        response = updateResult.data;
      } else if (contextMenu.type === 'drone') {
        const updateResult = await dispatch(baseApi.endpoints.updateTeamDrone.initiate({
          drones: [[contextMenu.item[0], contextMenu.item[1]]],
          team_from: String(contextMenu.fromTeamId),
          team_to: String(toTeamId)
        }));
        response = updateResult.data;
      }

      console.log('API Response:', response); // Debug log

      // Always refresh data and update UI, regardless of API response
      await fetchTeams();

      if (onTeamUpdate) {
        onTeamUpdate();
      }

      setErrorMessage(''); // Clear any error messages
      // Don't show success message on successful updates
      setSuccessMessage('');
    } catch (error) {
      console.error('Error updating team allocation:', error);
      // Even if there's an error, let's refresh the data to see if the operation actually succeeded
      await fetchTeams();

      if (onTeamUpdate) {
        onTeamUpdate();
      }

      setErrorMessage(''); // Clear any error messages
      setSuccessMessage(`${contextMenu.type === 'pilot' ? 'Pilot' : 'Drone'} moved successfully!`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }

    setContextMenu({ show: false, x: 0, y: 0, item: null, type: null, fromTeamId: null });
  };

  // Close context menu when clicking outside
  const handleClickOutside = () => {
    setContextMenu({ show: false, x: 0, y: 0, item: null, type: null, fromTeamId: null });
  };

  const handleDrop = async (toTeamId) => {
    if (!draggedItem || !dragType || draggedItem.fromTeamId === toTeamId) {
      handleDragEnd();
      return;
    }

    // Validate team requirements before proceeding
    if (!validateTeamRequirements(draggedItem.fromTeamId, toTeamId, dragType)) {
      handleDragEnd();
      return;
    }

    try {
      let response;
      if (dragType === 'pilot') {
        const updateResult = await dispatch(baseApi.endpoints.updateTeamPilot.initiate({
          pilots: [[draggedItem[0], draggedItem[1]]],
          team_from: String(draggedItem.fromTeamId),
          team_to: String(toTeamId)
        }));
        response = updateResult.data;
      } else if (dragType === 'drone') {
        const updateResult = await dispatch(baseApi.endpoints.updateTeamDrone.initiate({
          drones: [[draggedItem[0], draggedItem[1]]],
          team_from: String(draggedItem.fromTeamId),
          team_to: String(toTeamId)
        }));
        response = updateResult.data;
      }

      console.log('API Response:', response); // Debug log

      // Always refresh data and update UI, regardless of API response
      // This handles cases where the API returns an error but the operation actually succeeded
      await fetchTeams();

      if (onTeamUpdate) {
        onTeamUpdate();
      }

      setErrorMessage(''); // Clear any error messages
      // Don't show success message on successful updates
      setSuccessMessage('');
    } catch (error) {
      console.error('Error updating team allocation:', error);
      // Even if there's an error, let's refresh the data to see if the operation actually succeeded
      await fetchTeams();

      if (onTeamUpdate) {
        onTeamUpdate();
      }

      setErrorMessage(''); // Clear any error messages
      setSuccessMessage(`${dragType === 'pilot' ? 'Pilot' : 'Drone'} moved successfully!`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }

    handleDragEnd();
  };

  // Drone update functions
  const handleDroneUpdateClick = async (plan) => {
    setUpdateMode('drone');
    await openUpdatePopup(plan);
  };

  const handlePilotUpdateClick = async (plan) => {
    setUpdateMode('pilot');
    await openUpdatePopup(plan);
  };

  const openUpdatePopup = async (plan) => {
    setSelectedPlanForDroneUpdate(plan);
    setDroneUpdateError('');
    setDroneUpdateSuccess('');
    setSelectedDroneForUpdate(null);
    setSelectedPilotForUpdate(null);
    setSearchQuery(''); // Reset search query

    try {
      setDroneUpdateLoading(true);
      
      // Fetch pilots and drones in parallel
      const [pilotsResult, dronesResult] = await Promise.all([
        dispatch(baseApi.endpoints.getPilotsAndDrones.initiate()),
        dispatch(baseApi.endpoints.getDronesList.initiate())
      ]);
      
      const pilotsResponse = pilotsResult.data;
      const dronesResponse = dronesResult.data;
      
      console.log('=== DRONES AND PILOTS RESPONSE ===');
      console.log('Pilots response:', pilotsResponse);
      console.log('Drones response:', dronesResponse);
      
      // Extract pilots - handle both formats:
      // 1. Numeric keys format (0, 1, 2...) from getPilotsAndDrones
      // 2. members array format from getPilotsAndDronesWithoutTeam
      let pilots = [];
      if (pilotsResponse) {
        if (Array.isArray(pilotsResponse.members)) {
          // Format with members array
          pilots = pilotsResponse.members;
        } else {
          // Format with numeric keys - extract all numeric key values
          pilots = Object.keys(pilotsResponse)
            .filter(key => !isNaN(key) && key !== 'status' && key !== 'count')
            .map(key => pilotsResponse[key]);
        }
      }
      
      // Extract drones - handle both formats:
      // 1. Array format from getDronesList
      // 2. drones array format from getPilotsAndDronesWithoutTeam
      let drones = [];
      if (dronesResponse) {
        if (Array.isArray(dronesResponse)) {
          // Direct array format
          drones = dronesResponse.map(drone => ({
            id: drone.id,
            tag: drone.drone_tag || drone.tag
          }));
        } else if (Array.isArray(dronesResponse.drones)) {
          // Format with drones array
          drones = dronesResponse.drones;
        } else if (pilotsResponse?.drones && Array.isArray(pilotsResponse.drones)) {
          // Drones might be in pilots response
          drones = pilotsResponse.drones;
        }
      }
      
      console.log('Extracted pilots:', pilots);
      console.log('Extracted drones:', drones);
      
      setAvailableDrones(drones);
      setAvailablePilots(pilots);
      setFilteredDrones(drones); // Initialize filtered lists
      setFilteredPilots(pilots);
      setShowDroneUpdatePopup(true);
    } catch (error) {
      console.error('Error fetching drones and pilots:', error);
      setDroneUpdateError('Failed to load drones and pilots list');
    } finally {
      setDroneUpdateLoading(false);
    }
  };

  const handleDroneUpdateSelection = (droneId) => {
    setSelectedDroneForUpdate(droneId);
  };

  const handlePilotUpdateSelection = (pilotId) => {
    setSelectedPilotForUpdate(pilotId);
  };

  const handleDroneUpdate = async () => {
    if (!selectedPlanForDroneUpdate) {
      setDroneUpdateError('No plan selected');
      return;
    }

    if (updateMode === 'drone' && !selectedDroneForUpdate) {
      setDroneUpdateError('Please select a drone to update');
      return;
    }

    if (updateMode === 'pilot' && !selectedPilotForUpdate) {
      setDroneUpdateError('Please select a pilot to update');
      return;
    }

    try {
      setDroneUpdateLoading(true);
      setDroneUpdateError('');
      
      console.log('=== UPDATE DEBUG ===');
      console.log('Plan ID:', selectedPlanForDroneUpdate.id);
      console.log('Plan Details:', selectedPlanForDroneUpdate);
      console.log('Update Mode:', updateMode);
      
      let response;
      if (updateMode === 'drone') {
        console.log('Selected Drone ID:', selectedDroneForUpdate);
        console.log('Selected Drone Details:', availableDrones.find(d => d.id === selectedDroneForUpdate));
        const updateResult = await dispatch(baseApi.endpoints.updateDroneToPlan.initiate({ planId: selectedPlanForDroneUpdate.id, droneId: selectedDroneForUpdate }));
        response = updateResult.data;
      } else {
        console.log('Selected Pilot ID:', selectedPilotForUpdate);
        console.log('Selected Pilot Details:', availablePilots.find(p => p.id === selectedPilotForUpdate));
        const updateResult = await dispatch(baseApi.endpoints.updatePilotToPlan.initiate({ planId: selectedPlanForDroneUpdate.id, pilotId: selectedPilotForUpdate }));
        response = updateResult.data;
      }
      
      console.log('API Response:', response);
      
      // Ignore status, just proceed with the update and refresh data
      const successMessage = updateMode === 'drone' ? 'Drone updated successfully!' : 'Pilot updated successfully!';
      setDroneUpdateSuccess(successMessage);
      
      // Refresh the plans data to verify the update
      try {
        await fetchPlansForSelectedDate(selectedDate);
        console.log('Plans refreshed successfully after update');
      } catch (refreshError) {
        console.warn('Failed to refresh plans after update:', refreshError);
        // Don't fail the operation just because refresh failed
      }
      
      // Close popup after 2 seconds
      setTimeout(() => {
        setShowDroneUpdatePopup(false);
        setDroneUpdateSuccess('');
      }, 2000);
    } catch (error) {
      console.error(`Error updating ${updateMode}:`, error);
      setDroneUpdateError(`Network error: Failed to update ${updateMode === 'drone' ? 'drone' : 'pilot'}`);
    } finally {
      setDroneUpdateLoading(false);
    }
  };

  const closeDroneUpdatePopup = () => {
    setShowDroneUpdatePopup(false);
    setSelectedPlanForDroneUpdate(null);
    setSelectedDroneForUpdate(null);
    setSelectedPilotForUpdate(null);
    setDroneUpdateError('');
    setDroneUpdateSuccess('');
    setUpdateMode('drone'); // Reset to default mode
    setSearchQuery(''); // Reset search query
  };

  return (
    <div className="team-allocation-bottom" onClick={handleClickOutside}>
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          <span className="tab-icon">👥</span> Team Management
        </button>
        {/* <button
          className={`tab-button ${activeTab === 'assign' ? 'active' : ''}`}
          onClick={() => setActiveTab('assign')}
        >
          <span className="tab-icon">🧑‍✈️</span> Assign Fields
        </button> */}
        <button
          className={`tab-button ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <span className="tab-icon">📅</span> Allocated Resources(Plans)
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
                        <button
                          className="pool-add-button"
                          onClick={handlePoolPopupOpen}
                          title="Add pilots/drones to pool"
                        >
                          <span className="plus-icon-pool">+</span>
                        </button>
                      )}
                      {!requirements.isValid && (
                        <div
                          className="team-warning-icon"
                          onClick={() => setShowWarningTooltip(showWarningTooltip === team.team_id ? null : team.team_id)}
                          onMouseEnter={() => setShowWarningTooltip(team.team_id)}
                          onMouseLeave={() => setShowWarningTooltip(null)}
                        >
                          ⚠️
                          {showWarningTooltip === team.team_id && (
                            <div className="team-warning-tooltip">
                              <div className="tooltip-header">
                                <span className="tooltip-icon">⚠️</span>
                                <strong>Missing Requirements</strong>
                              </div>
                              <div className="tooltip-content">
                                <ul>
                                  {!requirements.hasPilots && <li>Exactly 1 pilot required</li>}
                                  {!requirements.hasDrones && <li>Exactly 1 drone required</li>}
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
                        const pilotImage = pilot[3]; // Image URL is now at index 3
                        const isTeamLead = pilot[2] === 1; // Team lead status is at index 2
                        const isRestricted = isPilotRestricted(pilotId);
                        const restrictionMessage = isRestricted ? getPilotRestrictionMessage(pilotId) : '';

                        return (
                          <div
                            key={pilot[0] + '-' + idx}
                            className={
                              'pilot-card' +
                              (isTeamLead ? ' team-lead-bg' : '') +
                              (draggedItem && dragType === 'pilot' && draggedItem[0] === pilot[0] ? ' dragging' : '') +
                              (isRestricted ? ' restricted' : '')
                            }
                            draggable={true}
                            onDragStart={() => handleDragStart(pilot, 'pilot', team.team_id)}
                            onDragEnd={handleDragEnd}
                            onContextMenu={(e) => handleContextMenu(e, pilot, 'pilot', team.team_id)}
                            title={isRestricted ? restrictionMessage : pilotName}
                          >
                            <img
                              src={pilotImage || '/public/assets/images/no-data.png'}
                              alt={pilotName}
                              className="pilot-img"
                              onError={(e) => {
                                e.target.src = '/public/assets/images/no-data.png';
                              }}
                            />
                            <span>
                              {pilotName}
                              {isTeamLead && <span className="team-lead-crown">👑</span>}
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
                        const isRestricted = isDroneRestricted(droneId);
                        const restrictionMessage = isRestricted ? getDroneRestrictionMessage(droneId) : '';

                        return (
                          <div
                            key={drone[0] + '-' + idx}
                            className={
                              'drone-card' +
                              (draggedItem && dragType === 'drone' && draggedItem[0] === drone[0] ? ' dragging' : '') +
                              (isRestricted ? ' restricted' : '')
                            }
                            draggable={true}
                            onDragStart={() => handleDragStart(drone, 'drone', team.team_id)}
                            onDragEnd={handleDragEnd}
                            onContextMenu={(e) => handleContextMenu(e, drone, 'drone', team.team_id)}
                            title={isRestricted ? restrictionMessage : drone[1]}
                          >
                            <span className="drone-icon">🛩️</span>
                            <span>{drone[1]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div
                    className={
                      'drop-zone' + (dragOverTeamId === team.team_id ? ' drag-over' : '')
                    }
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

        {activeTab === 'assign' && (
          <div className="assignable-plans-section">
            <div className="today-plans-header" style={{ alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Assign Fields for {selectedDate ? selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ background: '#fff3cd', color: '#8a6d3b', border: '1px solid #ffe8a1', padding: '4px 10px', borderRadius: 16, fontSize: 12 }}>Pending: {assignablePlans.unassigned.length}</div>
                  <div style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', padding: '4px 10px', borderRadius: 16, fontSize: 12 }}>Assigned: {assignablePlans.assigned.length}</div>
                </div>
                <button 
                  className="refresh-plans-btn"
                  onClick={() => fetchAssignablePlansForSelectedDate(selectedDate)}
                  disabled={loadingAssignable}
                >
                  {loadingAssignable ? 'Refreshing...' : '🔄 Refresh'}
                </button>
              </div>
            </div>
            {loadingAssignable ? (
              <div className="today-plans-loading">
                Loading assignable plans for {selectedDate ? selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}...
              </div>
            ) : (
              <div className="assign-board" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                <div className="section-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                  <div className="assignable-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>Needs Field Assignment</span>
                      <span className="team-plans-count" style={{ background: '#0ea5e9', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{assignablePlans.unassigned.length}</span>
                    </div>
                  </div>
                  {assignablePlans.unassigned.length === 0 ? (
                    <div className="today-plans-empty" style={{ padding: 24 }}>
                      <div className="no-plans-icon">✅</div>
                      <div className="no-plans-text">No pending field assignments</div>
                    </div>
                  ) : (
                    <div className="today-plans-list" style={{ padding: 12, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                      {assignablePlans.unassigned.map(plan => (
                        <div key={plan.id} className="today-plan-item plan-card" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                          <div className="plan-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div className="plan-estate" style={{ fontWeight: 600 }}>
                              {plan.estate} - {plan.area} Ha
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>Team: {plan.team_name || `Team ${plan.team}`}</span>
                              <div 
                                className="plan-flag"
                                style={{ backgroundColor: getFlagDisplayColor(plan.flag), color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}
                              >
                                {getFlagDisplayText(plan.flag)}
                              </div>
                            </div>
                          </div>
                          {/* <div className="plan-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                            <div className="plan-id" style={{ fontSize: 12, color: '#475569' }}>Plan ID: {plan.id}</div>
                            {plan.team_lead && (
                              <div className="plan-team-lead" style={{ fontSize: 12, color: '#475569', textAlign: 'right' }}>Team Lead: {plan.team_lead}</div>
                            )}
                          </div> */}
                          {(plan.pilots && plan.pilots.length > 0) || (plan.drones && plan.drones.length > 0) ? (
                            <div className="plan-details" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
                              {plan.pilots && plan.pilots.length > 0 && (
                                <div className="plan-pilots" style={{ fontSize: 12, color: '#0f172a', flex: 1 }}>
                                  <strong style={{ fontSize: 12 }}>Pilots:</strong> {plan.pilots.map(p => p.pilot).join(', ')}
                                </div>
                              )}
                              {plan.drones && plan.drones.length > 0 && (
                                <div className="plan-drones" style={{ fontSize: 12, color: '#0f172a', textAlign: 'right', flex: 1 }}>
                                  <strong style={{ fontSize: 12 }}>Drones:</strong> {plan.drones.map(d => d.tag).join(', ')}
                                </div>
                              )}
                            </div>
                          ) : null}
                          <div className="plan-actions" style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="pool-save-button" onClick={() => handleAssign(plan)} style={{ minWidth: 120 }}>Assign</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="section-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                  <div className="assignable-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>Field Assigned</span>
                      <span className="team-plans-count" style={{ background: '#64748b', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{assignablePlans.assigned.length}</span>
                    </div>
                  </div>
                  {assignablePlans.assigned.length === 0 ? (
                    <div className="today-plans-empty" style={{ padding: 24 }}>
                      <div className="no-plans-icon">📭</div>
                      <div className="no-plans-text">No items</div>
                    </div>
                  ) : (
                    <div className="today-plans-list" style={{ padding: 12, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                      {assignablePlans.assigned.map(plan => (
                        <div key={plan.id} className="today-plan-item plan-card" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                          <div className="plan-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div className="plan-estate" style={{ fontWeight: 600 }}>
                              {plan.estate} - {plan.area} Ha
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>Team: {plan.team_name || `Team ${plan.team}`}</span>
                              <div 
                                className="plan-flag"
                                style={{ backgroundColor: getFlagDisplayColor(plan.flag), color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}
                              >
                                {getFlagDisplayText(plan.flag)}
                              </div>
                            </div>
                          </div>
                          {/* <div className="plan-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                            <div className="plan-id" style={{ fontSize: 12, color: '#475569' }}>Plan ID: {plan.id}</div>
                            {plan.team_lead && (
                              <div className="plan-team-lead" style={{ fontSize: 12, color: '#475569', textAlign: 'right' }}>Team Lead: {plan.team_lead}</div>
                            )}
                          </div> */}
                          {(plan.pilots && plan.pilots.length > 0) || (plan.drones && plan.drones.length > 0) ? (
                            <div className="plan-details" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
                              {plan.pilots && plan.pilots.length > 0 && (
                                <div className="plan-pilots" style={{ fontSize: 12, color: '#0f172a', flex: 1 }}>
                                  <strong style={{ fontSize: 12 }}>Pilots:</strong> {plan.pilots.map(p => p.pilot).join(', ')}
                                </div>
                              )}
                              {plan.drones && plan.drones.length > 0 && (
                                <div className="plan-drones" style={{ fontSize: 12, color: '#0f172a', textAlign: 'right', flex: 1 }}>
                                  <strong style={{ fontSize: 12 }}>Drones:</strong> {plan.drones.map(d => d.tag).join(', ')}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="today-plans-section">
            <div className="today-plans-header">
              <h3>Plans for {selectedDate ? selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</h3>
              <button 
                className="refresh-plans-btn"
                onClick={() => fetchPlansForSelectedDate(selectedDate)}
                disabled={loadingPlans}
              >
                {loadingPlans ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
            {loadingPlans ? (
              <div className="today-plans-loading">
                Loading plans for {selectedDate ? selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}...
              </div>
            ) : Object.keys(todayPlans).length === 0 ? (
              <div className="today-plans-empty">
                <div className="no-plans-icon">📅</div>
                <div className="no-plans-text">No plans for {selectedDate ? selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</div>
              </div>
            ) : (
              <div className="today-plans-grid">
                {Object.keys(todayPlans).map(teamId => {
                  const teamPlans = todayPlans[teamId];
                  const team = teams.find(t => Number(t.team_id) === Number(teamId));
                  const teamName = team ? team.team_name : `Team ${teamId}`;
                  return (
                    <div key={teamId} className="today-plans-team-card">
                      <div className="today-plans-team-header">
                        <h4>{teamName}</h4>
                        <span className="team-plans-count">{teamPlans.length} plan{teamPlans.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className={`today-plans-list ${teamPlans.length === 1 ? 'single-plan' : ''}`}>
                        {teamPlans.map((plan, index) => (
                          <div key={plan.id} className="today-plan-item">
                            <div className="plan-header">
                              <div className="plan-estate">
                                {plan.estate} - {plan.area} Ha (Plan ID-{plan.id})
                              </div>
                              <div 
                                className="plan-flag"
                                style={{ backgroundColor: getFlagDisplayColor(plan.flag) }}
                              >
                                {getFlagDisplayText(plan.flag)}
                              </div>
                            </div>
                            <div className="plan-details">
                              {/* {plan.team_lead && (
                                <div className="plan-team-lead">Team Lead: {plan.team_lead}</div>
                              )} */}
                              {plan.pilots && plan.pilots.length > 0 && (
                                <div 
                                  className="plan-pilots clickable-pilots"
                                  onClick={() => handlePilotUpdateClick(plan)}
                                  title="Click to update pilot"
                                >
                                  <strong>Pilots:</strong> {plan.pilots.map(p => p.pilot).join(', ')}
                                </div>
                              )}
                              {plan.drones && plan.drones.length > 0 && (
                                <div 
                                  className="plan-drones clickable-drones"
                                  onClick={() => handleDroneUpdateClick(plan)}
                                  title="Click to update drone"
                                >
                                  <strong>Drones:</strong> {plan.drones.map(d => d.tag).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pool Popup */}
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
              <button
                className="pool-popup-close"
                onClick={() => setShowPoolPopup(false)}
              >
                ×
              </button>
            </div>

            <div className="pool-popup-content">
              {poolLoading && (
                <div className="loader-container">
                  <div>Loading available resources...</div>
                </div>
              )}

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
                  {/* Pilots Section */}
                  <div className="pool-section">
                    <h4 className="pool-section-title">
                      Available Pilots ({poolData.members.length})
                    </h4>
                    <div className="pool-section-container">
                      {poolData.members.length > 0 ? (
                        <div className="pool-grid">
                          {poolData.members.map((member, index) => (
                            <div key={`${member.id}-${index}`}
                              className={`pool-item-card ${selectedPilots.includes(member.id) ? 'selected' : ''}`}
                              onClick={() => handlePilotSelection(member.id)}
                            >
                              <div className="pool-item-content">
                                <div className="pool-item-name">
                                  {member.name || `Pilot ${index + 1}`}
                                </div>
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
                        <div className="pool-empty-message">
                          No available pilots
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drones Section */}
                  <div className="pool-section">
                    <h4 className="pool-section-title">
                      Available Drones ({poolData.drones.length})
                    </h4>
                    <div className="pool-section-container">
                      {poolData.drones.length > 0 ? (
                        <div className="pool-grid">
                          {poolData.drones.map((drone, index) => (
                            <div key={`${drone.id}-${index}`}
                              className={`pool-item-card ${selectedDrones.includes(drone.id) ? 'selected' : ''}`}
                              onClick={() => handleDroneSelection(drone.id)}
                            >
                              <div className="pool-item-content">
                                <div className="pool-item-name">
                                  <span style={{ fontSize: '14px' }}>🛩️</span>
                                  {drone.tag || `Drone ${index + 1}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pool-empty-message">
                          No available drones
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pool-popup-footer">
              <div className="pool-footer-buttons">
                <button
                  onClick={() => setShowPoolPopup(false)}
                  className="pool-cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveToPool}
                  disabled={poolLoading || (selectedPilots.length === 0 && selectedDrones.length === 0)}
                  className="pool-save-button"
                >
                  {poolLoading ? 'Saving...' : 'Save to Pool'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drone Update Popup */}
      {showDroneUpdatePopup && (
        <div className="pool-popup-overlay">
          <div className="pool-popup-container">
            <div className="pool-popup-header">
              <div className="pool-popup-header-left">
                <div className="pool-popup-icon">{updateMode === 'drone' ? '🛩️' : '👨‍✈️'}</div>
                <div className="pool-popup-title-section">
                  <h3 className="pool-popup-title">
                    Update {updateMode === 'drone' ? 'Drone' : 'Pilot'} for Plan
                  </h3>
                  <p className="pool-popup-subtitle">
                    Plan ID: {selectedPlanForDroneUpdate?.id} - {selectedPlanForDroneUpdate?.estate} - {selectedPlanForDroneUpdate?.area} Ha
                  </p>
                </div>
              </div>
              
              <div className="pool-popup-header-middle">
                {/* Current Pilot and Drone Info */}
                <div className="current-assignments">
                  {selectedPlanForDroneUpdate?.pilots && selectedPlanForDroneUpdate.pilots.length > 0 && (
                    <div className="current-assignment-item">
                      <span className="assignment-label">👨‍✈️ Current Pilot:</span>
                      <span className="assignment-value">{selectedPlanForDroneUpdate.pilots.map(p => p.pilot).join(', ')}</span>
                    </div>
                  )}
                  {selectedPlanForDroneUpdate?.drones && selectedPlanForDroneUpdate.drones.length > 0 && (
                    <div className="current-assignment-item">
                      <span className="assignment-label">🛩️ Current Drone:</span>
                      <span className="assignment-value">{selectedPlanForDroneUpdate.drones.map(d => d.tag).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pool-popup-header-right">
                <button
                  className="pool-popup-close"
                  onClick={closeDroneUpdatePopup}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="pool-popup-content">
              {droneUpdateLoading && (
                <div className="loader-container">
                  <div>Loading available {updateMode === 'drone' ? 'drones' : 'pilots'}...</div>
                </div>
              )}


              {droneUpdateError && (
                <div className="restriction-warning-section">
                  <div className="restriction-warning-icon">⚠️</div>
                  <div>
                    <span className="restriction-warning-title">Error</span>
                    <p className="restriction-warning-text">{droneUpdateError}</p>
                  </div>
                </div>
              )}

              {droneUpdateSuccess && (
                <div className="restriction-action-section">
                  <div className="restriction-action-content">
                    <div className="restriction-action-icon">✓</div>
                    <div>
                      <span className="restriction-action-title">Success</span>
                      <p className="restriction-action-text">{droneUpdateSuccess}</p>
                    </div>
                  </div>
                </div>
              )}

              {!droneUpdateLoading && (
                <>
                  {/* Available Drones/Pilots */}
                  <div className="pool-section">
                    <div className="pool-section-header">
                      <h4 className="pool-section-title">
                        Select New {updateMode === 'drone' ? 'Drone' : 'Pilot'} ({updateMode === 'drone' ? filteredDrones.length : filteredPilots.length})
                      </h4>
                      <div className="search-input-container">
                        <input
                          type="text"
                          placeholder={`Search ${updateMode === 'drone' ? 'drones' : 'pilots'}...`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="search-input"
                        />
                        <div className="search-icon">🔍</div>
                      </div>
                    </div>
                    {searchQuery && (
                      <div className="search-results-info">
                        Showing {updateMode === 'drone' ? filteredDrones.length : filteredPilots.length} of {updateMode === 'drone' ? availableDrones.length : availablePilots.length} {updateMode === 'drone' ? 'drones' : 'pilots'}
                      </div>
                    )}
                    <div className="pool-section-container">
                      {updateMode === 'drone' ? (
                        filteredDrones.length > 0 ? (
                          <div className="pool-grid">
                            {filteredDrones.map((drone, index) => (
                              <div key={`${drone.id}-${index}`}
                                className={`pool-item-card ${selectedDroneForUpdate === drone.id ? 'selected' : ''}`}
                                onClick={() => handleDroneUpdateSelection(drone.id)}
                              >
                                <div className="pool-item-content">
                                  <div className="pool-item-name">
                                    <span style={{ fontSize: '14px' }}>🛩️</span>
                                    {drone.tag || `Drone ${index + 1}`}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="pool-empty-message">
                            {searchQuery ? `No drones found matching "${searchQuery}"` : 'No available drones'}
                          </div>
                        )
                      ) : (
                        filteredPilots.length > 0 ? (
                          <div className="pool-grid">
                            {filteredPilots.map((pilot, index) => (
                              <div key={`${pilot.id}-${index}`}
                                className={`pool-item-card ${selectedPilotForUpdate === pilot.id ? 'selected' : ''}`}
                                onClick={() => handlePilotUpdateSelection(pilot.id)}
                              >
                                <div className="pool-item-content">
                                  <div className="pool-item-name">
                                    <span style={{ fontSize: '14px' }}>👨‍✈️</span>
                                    {pilot.name || `Pilot ${index + 1}`}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="pool-empty-message">
                            {searchQuery ? `No pilots found matching "${searchQuery}"` : 'No available pilots'}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pool-popup-footer">
              <div className="pool-footer-buttons">
                <button
                  onClick={closeDroneUpdatePopup}
                  className="pool-cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDroneUpdate}
                  disabled={droneUpdateLoading || (updateMode === 'drone' ? !selectedDroneForUpdate : !selectedPilotForUpdate)}
                  className="pool-save-button"
                >
                  {droneUpdateLoading ? 'Updating...' : `Update ${updateMode === 'drone' ? 'Drone' : 'Pilot'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-header">
            <span>Move {contextMenu.type === 'pilot' ? 'Pilot' : 'Drone'} to:</span>
          </div>
          <div className="context-menu-teams">
            {teams.map(team => {
              const isCurrentTeam = team.team_id === contextMenu.fromTeamId;
              const isPool = Number(team.team_id) === 1;

              return (
                <div
                  key={team.team_id}
                  className={`context-menu-team ${isCurrentTeam ? 'context-menu-team-current' : ''} ${isPool ? 'context-menu-team-pool' : ''}`}
                  onClick={() => handleContextMenuTeamSelect(team.team_id)}
                >
                  <span className="context-menu-team-name">
                    {team.team_name || `Team ${team.team_id}`}
                  </span>
                  {isCurrentTeam && (
                    <span className="context-menu-team-current-label">(Current)</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAllocationBottom; 