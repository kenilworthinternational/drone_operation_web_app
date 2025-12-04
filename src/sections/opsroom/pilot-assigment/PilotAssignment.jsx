import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars } from 'react-loader-spinner';
import {
  useGetPilotAssignmentPlansQuery,
  useGetPilotAssignmentMissionsQuery,
  useGetPilotAssignmentPilotsQuery,
  useGetPilotAssignmentDroneQuery,
  useCreatePilotAssignmentMutation,
} from '../../../api/services NodeJs/allEndpoints';
import '../../../styles/pilotAssignment-pilotsassign.css';

const PilotAssignment = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPilot, setSelectedPilot] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedMissions, setSelectedMissions] = useState([]);
  const [droneInfo, setDroneInfo] = useState(null);

  // Get user data for assigned_by
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Fetch data
  const { data: plansData, isLoading: loadingPlans, refetch: refetchPlans } = useGetPilotAssignmentPlansQuery(selectedDate, { skip: !selectedDate });
  const { data: missionsData, isLoading: loadingMissions, refetch: refetchMissions } = useGetPilotAssignmentMissionsQuery(selectedDate, { skip: !selectedDate });
  const { data: pilotsData, isLoading: loadingPilots } = useGetPilotAssignmentPilotsQuery();
  const { data: droneData, isLoading: loadingDrone, refetch: refetchDrone } = useGetPilotAssignmentDroneQuery(
    { team_id: selectedTeamId, date: selectedDate },
    { skip: !selectedTeamId || !selectedDate }
  );
  const [createAssignment, { isLoading: creatingAssignment }] = useCreatePilotAssignmentMutation();

  const plans = plansData?.data || [];
  const missions = missionsData?.data || [];
  const pilots = pilotsData?.data || [];

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

  const handlePilotChange = (pilotId) => {
    setSelectedPilot(pilotId);
    setSelectedPlans([]);
    setSelectedMissions([]);
  };

  const handlePlanToggle = (planId) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const handleMissionToggle = (missionId) => {
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

    if (selectedPlans.length === 0 && selectedMissions.length === 0) {
      alert('Please select at least one plan or mission');
      return;
    }

    if (!droneInfo || !droneInfo.drone_id) {
      alert('No drone available for this team. Please assign a drone to the team first.');
      return;
    }

    try {
      const assignmentData = {
        team_id: selectedTeamId,
        assignment_date: selectedDate,
        plan_ids: selectedPlans,
        mission_ids: selectedMissions,
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
        
        // Reset selections
        setSelectedPlans([]);
        setSelectedMissions([]);
        
        // Refetch data to show updated assignments
        refetchPlans();
        refetchMissions();
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
          onClick={() => navigate('/home/workflowDashboard')}
        >
          <svg className="pilot-assignment-back-icon-pilotsassign" viewBox="0 0 24 24" width="25" height="25">
            <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        
        <h1 className="pilot-assignment-title-pilotsassign">Pilot Assignment</h1>
        
        <div className="pilot-assignment-header-spacer-pilotsassign"></div>
      </div>

      {/* Top Control Bar */}
      <div className="pilot-assignment-controls-bar-pilotsassign">
        <div className="pilot-assignment-control-group-pilotsassign">
          <label className="pilot-assignment-control-label-pilotsassign">Select Date :</label>
          <input 
            type="date" 
            className="pilot-assignment-date-input-pilotsassign"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedPlans([]);
              setSelectedMissions([]);
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
          disabled={!selectedDate || !selectedPilot || (selectedPlans.length === 0 && selectedMissions.length === 0) || creatingAssignment}
        >
          {creatingAssignment ? 'Deploying...' : 'Deploy'}
        </button>
      </div>

      {/* Drone Info Display */}
      {droneInfo && (
        <div className="pilot-assignment-drone-info-pilotsassign">
          <span className="pilot-assignment-drone-label-pilotsassign">Assigned Drone:</span>
          <span className="pilot-assignment-drone-value-pilotsassign">
            {droneInfo.drone_tag || droneInfo.serial}
          </span>
        </div>
      )}

      {/* Main Content - Plans and Missions Section */}
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
                plans.map(plan => (
                  <div 
                    key={plan.id} 
                    className={`pilot-assignment-plan-card-pilotsassign ${
                      plan.is_assigned ? 'pilot-assignment-plan-assigned-pilotsassign' : ''
                    } ${selectedPlans.includes(plan.id) ? 'pilot-assignment-plan-selected-pilotsassign' : ''}`}
                    onClick={() => !plan.is_assigned && handlePlanToggle(plan.id)}
                    style={{ cursor: plan.is_assigned ? 'not-allowed' : 'pointer' }}
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
                          checked={selectedPlans.includes(plan.id)}
                          onChange={() => !plan.is_assigned && handlePlanToggle(plan.id)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={plan.is_assigned}
                        />
                      </div>
                    </div>
                  </div>
                ))
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
                missions.map(mission => (
                  <div 
                    key={mission.id} 
                    className={`pilot-assignment-plan-card-pilotsassign ${
                      mission.is_assigned ? 'pilot-assignment-plan-assigned-pilotsassign' : ''
                    } ${selectedMissions.includes(mission.id) ? 'pilot-assignment-plan-selected-pilotsassign' : ''}`}
                    onClick={() => !mission.is_assigned && handleMissionToggle(mission.id)}
                    style={{ cursor: mission.is_assigned ? 'not-allowed' : 'pointer' }}
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
                          checked={selectedMissions.includes(mission.id)}
                          onChange={() => !mission.is_assigned && handleMissionToggle(mission.id)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={mission.is_assigned}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PilotAssignment;
