import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  useGetPlansWithFieldsQuery, 
  useSwapFieldToPlanMutation,
  useGetAssignmentsWithPlansAndMissionsQuery,
  useGetAllDronesQuery,
  useUpdateAssignmentPilotAndDroneMutation,
  useChangeAssignmentPilotMutation
} from '../../../api/services NodeJs/emergencyMovingApi';
import { useGetPilotAssignmentPilotsQuery } from '../../../api/services NodeJs/pilotAssignmentApi';
import { FaExchangeAlt, FaTimes, FaArrowLeft, FaEye, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../styles/emergencyMoving.css';

const CustomDateInputEmergency = React.forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input-emergency" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="date-picker-input-emergency" />
    <FaCalendarAlt className="calendar-icon-emergency" />
  </div>
));

const EmergencyMoving = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('swapping');
  const [selectedFieldForSwap, setSelectedFieldForSwap] = useState(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  // Convert Date to string format for API
  const formatDateForAPI = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dateStringForAPI = formatDateForAPI(selectedDate);

  // Fetch plans with fields for selected date (for swapping tab)
  const { data: plansData, isLoading, refetch } = useGetPlansWithFieldsQuery(dateStringForAPI);
  const [swapField] = useSwapFieldToPlanMutation();

  // Fetch assignments with plans and missions (for full plan changing tab)
  const { data: assignmentsData, isLoading: isLoadingAssignments, refetch: refetchAssignments } = 
    useGetAssignmentsWithPlansAndMissionsQuery(dateStringForAPI);
  
  // Fetch pilots and drones
  const { data: pilotsResponse } = useGetPilotAssignmentPilotsQuery();
  const { data: dronesData } = useGetAllDronesQuery();
  const [updateAssignmentPilotAndDrone] = useUpdateAssignmentPilotAndDroneMutation();
  const [changeAssignmentPilot] = useChangeAssignmentPilotMutation();

  const plans = plansData || [];
  const assignments = assignmentsData || [];
  const pilots = pilotsResponse?.data || [];
  const drones = dronesData || [];
  
  // State for Full Plan Changing
  const [viewPlansModalOpen, setViewPlansModalOpen] = useState(false);
  const [selectedAssignmentForView, setSelectedAssignmentForView] = useState(null);
  const [updatingAssignments, setUpdatingAssignments] = useState(new Set());

  // Handle swap field
  const handleSwapField = async (targetPlanId) => {
    if (!selectedFieldForSwap) return;

    try {
      const result = await swapField({
        field_task_id: selectedFieldForSwap.id,
        target_plan_id: targetPlanId,
        date: selectedDate
      }).unwrap();

      if (result.success) {
        alert('Field swapped successfully!');
        setSwapModalOpen(false);
        setSelectedFieldForSwap(null);
        // Force refetch to update the count
        await refetch();
      }
    } catch (error) {
      console.error('Error swapping field:', error);
      alert(`Failed to swap field: ${error?.data?.error || error?.message || 'Unknown error'}`);
    }
  };

  // Get available plans for swap (exclude current plan and only show same estate)
  const getAvailablePlansForSwap = () => {
    if (!selectedFieldForSwap) return [];
    const currentPlanId = String(selectedFieldForSwap.plan);
    
    // Find the current plan to get its estate
    const currentPlan = plans.find(plan => String(plan.id) === currentPlanId);
    if (!currentPlan) return [];
    
    const currentEstateId = currentPlan.estateId;
    
    // Filter: same estate, different plan
    return plans.filter(plan => 
      String(plan.id) !== currentPlanId && 
      plan.estateId === currentEstateId
    );
  };

  return (
    <div className="emergency-moving-container-emergency">
      <div className="emergency-moving-header-emergency">
        <div className="header-left-section-emergency">
          <button 
            className="back-button-emergency"
            onClick={() => navigate({ pathname: '/home/workflowDashboard', search: routerLocation.search })}
            title="Back to Workflow Dashboard"
          >
            <FaArrowLeft />
          </button>
          <h1>Emergency Moving</h1>
        </div>
        <div className="date-picker-container-emergency">
          <label className="date-picker-label-emergency">Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
            }}
            dateFormat="yyyy/MM/dd"
            placeholderText="Select a date"
            customInput={<CustomDateInputEmergency />}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="emergency-moving-tabs-emergency">
        <button
          className={`tab-button-emergency ${activeTab === 'swapping' ? 'active-emergency' : ''}`}
          onClick={() => setActiveTab('swapping')}
        >
          Swapping Fields with Plans
        </button>
        <button
          className={`tab-button-emergency ${activeTab === 'full' ? 'active-emergency' : ''}`}
          onClick={() => setActiveTab('full')}
        >
          Full Plan Changing
        </button>
        <button
          className={`tab-button-emergency ${activeTab === 'partial' ? 'active-emergency' : ''}`}
          onClick={() => setActiveTab('partial')}
          disabled
        >
          Partially Complete
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content-emergency">
        {activeTab === 'swapping' && (
          <div className="swapping-content-emergency">
            {isLoading ? (
              <div className="loading-message-emergency">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="no-data-message-emergency">No plans found for selected date</div>
            ) : (
              <div className="plans-grid-emergency">
                {plans.map((plan) => (
                  <div key={plan.id} className="plan-card-emergency">
                    <div className="plan-header-emergency">
                      <div className="plan-title-section-emergency">
                        <h3>{plan.display_name || `Plan ${plan.id}`}</h3>
                        <span className="plan-id-badge-emergency">Plan #{plan.id}</span>
                      </div>
                      <span className="plan-fields-count-emergency">
                        {plan.active_fields_count !== undefined ? plan.active_fields_count : (plan.fields?.length || 0)} field(s)
                      </span>
                    </div>
                    <div className="plan-fields-list-emergency">
                      {plan.fields && plan.fields.length > 0 ? (
                        plan.fields.map((field) => (
                          <div key={field.id} className="field-item-emergency">
                            <div className="field-info-emergency">
                              <div className="field-name-row-emergency">
                                <span className="field-name-emergency">{field.field_short_name || field.field || 'Unknown Field'}</span>
                                {field.field_area && (
                                  <span className="field-area-emergency">{field.field_area} Ha</span>
                                )}
                              </div>
                              <div className="field-details-row-emergency">
                                {field.pilot_name && (
                                  <span className="field-pilot-emergency">{field.pilot_name}</span>
                                )}
                                {field.drone_tag && (
                                  <span className="field-drone-emergency">{field.drone_tag}</span>
                                )}
                              </div>
                            </div>
                            <button
                              className="swap-button-emergency"
                              onClick={() => {
                                setSelectedFieldForSwap(field);
                                setSwapModalOpen(true);
                              }}
                              title="Swap this field to another plan"
                            >
                              <FaExchangeAlt />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="no-fields-message-emergency">No fields assigned</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'full' && (
          <div className="full-plan-changing-content-emergency">
            {isLoadingAssignments ? (
              <div className="loading-message-emergency">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="no-data-message-emergency">No assignments found for selected date</div>
            ) : (() => {
              // Filter assignments to only show those with at least one plan or mission
              const assignmentsWithPlansOrMissions = assignments.filter(assignment => {
                const hasPlans = (assignment.plan_count > 0) || (assignment.plans && assignment.plans.length > 0);
                const hasMissions = (assignment.mission_count > 0) || (assignment.missions && assignment.missions.length > 0);
                return hasPlans || hasMissions;
              });
              
              if (assignmentsWithPlansOrMissions.length === 0) {
                return <div className="no-data-message-emergency">No assignments with plans or missions found for selected date</div>;
              }
              
              return (
                <div className="assignments-grid-emergency">
                  {assignmentsWithPlansOrMissions.map((assignment) => (
                  <div key={assignment.id} className="assignment-card-emergency">
                    <div className="assignment-header-emergency">
                      <div className="assignment-title-section-emergency">
                        <h3>{assignment.assignment_id || `Assignment ${assignment.id}`}</h3>
                        <span className="assignment-team-emergency">{assignment.team_name || 'No Team'}</span>
                      </div>
                      <div className="assignment-counts-emergency">
                        {assignment.plan_count > 0 && (
                          <span className="count-badge-emergency">{assignment.plan_count} Plan(s)</span>
                        )}
                        {assignment.mission_count > 0 && (
                          <span className="count-badge-emergency">{assignment.mission_count} Mission(s)</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Current Pilot and Drone Display */}
                    <div className="assignment-pilot-drone-section-emergency">
                      <div className="current-assignment-emergency">
                        <div className="assignment-item-emergency">
                          <label className="assignment-label-emergency">Current Pilot:</label>
                          <div className="assignment-value-emergency">
                            {assignment.pilot_name ? (
                              <span className="pilot-name-emergency">{assignment.pilot_name}</span>
                            ) : (
                              <span className="no-assignment-emergency">Not assigned</span>
                            )}
                          </div>
                        </div>
                        <div className="assignment-item-emergency">
                          <label className="assignment-label-emergency">Current Drone:</label>
                          <div className="assignment-value-emergency">
                            {assignment.drone_tag ? (
                              <span className="drone-tag-emergency">{assignment.drone_tag}</span>
                            ) : (
                              <span className="no-assignment-emergency">Not assigned</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Edit Pilot and Drone */}
                      <div className="edit-assignment-emergency">
                        <div className="edit-field-emergency">
                          <label className="edit-label-emergency">Select Pilot:</label>
                          <select
                            value={assignment.pilot_id || ''}
                            onChange={async (e) => {
                              const newPilotId = e.target.value;
                              const currentDroneId = assignment.drone_id;
                              
                              if (!newPilotId || !currentDroneId) {
                                alert('Please select both pilot and drone');
                                e.target.value = assignment.pilot_id || '';
                                return;
                              }
                              
                              // Check if pilot is actually changing
                              if (parseInt(newPilotId) === assignment.pilot_id) {
                                // Pilot not changed, just reset
                                e.target.value = assignment.pilot_id || '';
                                return;
                              }
                              
                              setUpdatingAssignments(prev => new Set(prev).add(assignment.id));
                              try {
                                // Use changeAssignmentPilot to create new assignment or merge into existing
                                const result = await changeAssignmentPilot({
                                  assignment_id: assignment.id,
                                  pilot_id: parseInt(newPilotId),
                                  drone_id: currentDroneId
                                }).unwrap();
                                
                                if (result.success) {
                                  // Use the message from backend (handles both merge and new assignment cases)
                                  alert(result.message || 'Pilot changed successfully.');
                                  await refetchAssignments();
                                }
                              } catch (error) {
                                console.error('Error changing pilot:', error);
                                const errorMessage = error?.data?.error || error?.data?.message || error?.message || 'Unknown error';
                                alert(`Failed to change pilot: ${errorMessage}`);
                                // Reset dropdown on error
                                e.target.value = assignment.pilot_id || '';
                              } finally {
                                setUpdatingAssignments(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(assignment.id);
                                  return newSet;
                                });
                              }
                            }}
                            className="select-input-emergency"
                            disabled={updatingAssignments.has(assignment.id)}
                          >
                            <option value="">-- Select Pilot --</option>
                            {pilots.map((pilot) => (
                              <option key={pilot.pilot_id} value={pilot.pilot_id}>
                                {pilot.pilot_name} - {pilot.team_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="edit-field-emergency">
                          <label className="edit-label-emergency">Select Drone:</label>
                          <select
                            value={assignment.drone_id || ''}
                            onChange={async (e) => {
                              const newDroneId = e.target.value;
                              const currentPilotId = assignment.pilot_id;
                              
                              if (!currentPilotId || !newDroneId) {
                                alert('Please select both pilot and drone');
                                e.target.value = assignment.drone_id || '';
                                return;
                              }
                              
                              setUpdatingAssignments(prev => new Set(prev).add(assignment.id));
                              try {
                                const result = await updateAssignmentPilotAndDrone({
                                  assignment_id: assignment.id,
                                  pilot_id: currentPilotId,
                                  drone_id: parseInt(newDroneId)
                                }).unwrap();
                                
                                if (result.success) {
                                  await refetchAssignments();
                                }
                              } catch (error) {
                                console.error('Error updating assignment:', error);
                                alert(`Failed to update: ${error?.data?.error || error?.message || 'Unknown error'}`);
                                // Reset dropdown on error
                                e.target.value = assignment.drone_id || '';
                              } finally {
                                setUpdatingAssignments(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(assignment.id);
                                  return newSet;
                                });
                              }
                            }}
                            className="select-input-emergency"
                            disabled={updatingAssignments.has(assignment.id)}
                          >
                            <option value="">-- Select Drone --</option>
                            {drones.map((drone) => (
                              <option key={drone.id} value={drone.id}>
                                {drone.tag || drone.serial || `Drone ${drone.id}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="edit-actions-emergency">
                          {/* Only show View button if assignment has plans with active fields (activated = 1 in field_pilot_and_drones) */}
                          {assignment.plans && assignment.plans.some(plan => 
                            plan.fields && plan.fields.length > 0 && 
                            plan.fields.some(field => {
                              // Check if field has activated = 1 in field_pilot_and_drones table
                              // Backend filters by activated = 1, but verify explicitly
                              const activated = field.activated;
                              return activated === 1 || activated === '1' || activated === true;
                            })
                          ) && (
                            <button
                              className="view-button-emergency"
                              onClick={() => {
                                setSelectedAssignmentForView(assignment);
                                setViewPlansModalOpen(true);
                              }}
                            >
                              <FaEye /> View
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'partial' && (
          <div className="coming-soon-emergency">Coming Soon: Partially Complete</div>
        )}
      </div>

      {/* Swap Modal */}
      {swapModalOpen && selectedFieldForSwap && (
        <div className="modal-overlay-emergency" onClick={() => setSwapModalOpen(false)}>
          <div className="modal-content-emergency" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-emergency">
              <h3>Swap Field to Another Plan</h3>
              <button
                className="modal-close-button-emergency"
                onClick={() => {
                  setSwapModalOpen(false);
                  setSelectedFieldForSwap(null);
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body-emergency">
              <div className="selected-field-info-emergency">
                <p><strong>Current Field:</strong> {selectedFieldForSwap.field_short_name || selectedFieldForSwap.field || 'Unknown'}</p>
                <p><strong>Current Plan:</strong> {
                  plans.find(p => String(p.id) === String(selectedFieldForSwap.plan))?.display_name || 
                  `Plan ${selectedFieldForSwap.plan}`
                }</p>
              </div>
              <div className="available-plans-list-emergency">
                <h4>Select Target Plan:</h4>
                {getAvailablePlansForSwap().length === 0 ? (
                  <p className="no-plans-message-emergency">No other plans available for this date</p>
                ) : (
                  <div className="plans-select-list-emergency">
                    {getAvailablePlansForSwap().map((plan) => (
                      <div
                        key={plan.id}
                        className="plan-select-item-emergency"
                        onClick={() => handleSwapField(plan.id)}
                      >
                        <div className="plan-select-info-emergency">
                          <div className="plan-select-title-row-emergency">
                            <strong>{plan.display_name || `Plan ${plan.id}`}</strong>
                            <span className="plan-select-id-emergency">Plan #{plan.id}</span>
                          </div>
                          <span>{plan.active_fields_count !== undefined ? plan.active_fields_count : (plan.fields?.length || 0)} field(s)</span>
                        </div>
                        <button className="select-plan-button-emergency">Select</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Plans Modal */}
      {viewPlansModalOpen && selectedAssignmentForView && (
        <div className="modal-overlay-emergency" onClick={() => setViewPlansModalOpen(false)}>
          <div className="modal-content-emergency view-plans-modal-emergency" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-emergency">
              <h3>Plans - {selectedAssignmentForView.assignment_id || `Assignment ${selectedAssignmentForView.id}`}</h3>
              <button
                className="modal-close-button-emergency"
                onClick={() => {
                  setViewPlansModalOpen(false);
                  setSelectedAssignmentForView(null);
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body-emergency">
              {selectedAssignmentForView.plans && selectedAssignmentForView.plans.length > 0 ? (
                <div className="view-plans-list-emergency">
                  {selectedAssignmentForView.plans.map((plan) => (
                    <div key={plan.id} className="view-plan-item-emergency">
                      <div className="view-plan-header-emergency">
                        <strong>{plan.display_name || `Plan ${plan.id}`}</strong>
                        <span className="plan-id-badge-emergency">Plan #{plan.id}</span>
                      </div>
                      {plan.fields && plan.fields.length > 0 && (
                        <div className="view-plan-fields-emergency">
                          {plan.fields
                            .filter(field => {
                              // Only show fields with activated = 1 in field_pilot_and_drones
                              const activated = field.activated;
                              return activated === 1 || activated === '1' || activated === true;
                            })
                            .map((field) => (
                            <div key={field.id} className="view-field-item-emergency">
                              <span className="field-name-emergency">{field.field_short_name || field.field || 'Unknown Field'}</span>
                              {field.field_area && (
                                <span className="field-area-emergency">{field.field_area} Ha</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-plans-message-emergency">No plans in this assignment</div>
              )}
              
              {selectedAssignmentForView.missions && selectedAssignmentForView.missions.length > 0 && (
                <div className="view-missions-section-emergency">
                  <div className="section-header-emergency">Missions:</div>
                  {selectedAssignmentForView.missions.map((mission) => (
                    <div key={mission.id} className="view-mission-item-emergency">
                      <strong>{mission.display_name || `Mission ${mission.id}`}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyMoving;

