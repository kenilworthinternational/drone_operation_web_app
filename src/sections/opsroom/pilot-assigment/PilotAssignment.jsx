import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/pilotAssignment-pilotsassign.css';

const PilotAssignment = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPilot, setSelectedPilot] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [selectedPlans, setSelectedPlans] = useState([]);

  // Sample pilots data
  const pilots = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' },
    { id: 4, name: 'Sarah Williams' },
  ];

  // Sample plans data
  const plans = [
    { id: 1, planId: 'Plan ID 01', status: 'pending', isIncomplete: false },
    { id: 2, planId: 'Plan ID 02', status: 'pending', isIncomplete: false },
    { id: 3, planId: 'Incomplete Plan', status: 'incomplete', isIncomplete: true },
    { id: 4, planId: 'Plan 04', status: 'pending', isIncomplete: false },
  ];

  // Auto-generate assignment ID when date or pilot changes
  useEffect(() => {
    if (selectedDate && selectedPilot) {
      const dateStr = selectedDate.replace(/-/g, '');
      const pilotNum = selectedPilot.padStart(3, '0');
      setAssignmentId(`ASSIGN-${dateStr}-${pilotNum}`);
    } else {
      setAssignmentId('');
    }
  }, [selectedDate, selectedPilot]);

  const handlePlanToggle = (planId) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const handleDeploy = () => {
    if (!selectedDate || !selectedPilot || selectedPlans.length === 0) {
      alert('Please select date, pilot, and at least one plan');
      return;
    }
    
    console.log('Deploying assignment:', {
      date: selectedDate,
      pilot: selectedPilot,
      assignmentId,
      plans: selectedPlans
    });
    
    // TODO: Implement deployment logic
    alert(`Assignment ${assignmentId} deployed successfully!`);
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
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        
        <div className="pilot-assignment-control-group-pilotsassign">
          <label className="pilot-assignment-control-label-pilotsassign">Select Pilot :</label>
          <select 
            className="pilot-assignment-pilot-select-pilotsassign"
            value={selectedPilot}
            onChange={(e) => setSelectedPilot(e.target.value)}
          >
            <option value="">-- Select Pilot --</option>
            {pilots.map(pilot => (
              <option key={pilot.id} value={pilot.id}>
                {pilot.name}
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
          disabled={!selectedDate || !selectedPilot || selectedPlans.length === 0}
        >
          Deploy
        </button>
      </div>

      {/* Main Content - Plans Section */}
      <div className="pilot-assignment-content-pilotsassign">
        
        <div className="pilot-assignment-plans-grid-pilotsassign">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              className={`pilot-assignment-plan-card-pilotsassign ${plan.isIncomplete ? 'pilot-assignment-plan-incomplete-pilotsassign' : ''} ${selectedPlans.includes(plan.id) ? 'pilot-assignment-plan-selected-pilotsassign' : ''}`}
              onClick={() => handlePlanToggle(plan.id)}
            >
              <div className="pilot-assignment-plan-content-pilotsassign">
                <span className="pilot-assignment-plan-id-pilotsassign">{plan.planId}</span>
                <div className="pilot-assignment-checkbox-wrapper-pilotsassign">
                  <input
                    type="checkbox"
                    className="pilot-assignment-checkbox-pilotsassign"
                    checked={selectedPlans.includes(plan.id)}
                    onChange={() => handlePlanToggle(plan.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PilotAssignment;
