import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchEstates,
  fetchDivisions,
  fetchFieldDetails,
  setSelectedEstate,
  selectEstates,
  selectSelectedEstate,
  selectDivisionsByEstate,
} from '../../../store/slices/estatesSlice';
import {
  setStartDate,
  setEndDate,
  setSelectedFlag,
  setSelectedType,
  togglePlanExpansion,
  setSelectedImage,
  rotateImage,
  resetUI,
  selectStartDate,
  selectEndDate,
  selectSelectedFlag,
  selectSelectedType,
  selectIsPlanExpanded,
  selectSelectedImage,
  selectImageRotation,
} from '../../../store/slices/uiSlice';
import '../../../styles/fieldhistory.css';
import { baseApi } from '../../../api/services/allEndpoints';

const FieldHistory = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const estates = useAppSelector(selectEstates);
  const selectedEstate = useAppSelector(selectSelectedEstate);
  const startDate = useAppSelector(selectStartDate);
  const endDate = useAppSelector(selectEndDate);
  const selectedFlag = useAppSelector(selectSelectedFlag);
  const selectedType = useAppSelector(selectSelectedType);
  const expandedPlans = useAppSelector((state) => state.ui.expandedPlans);
  const selectedImage = useAppSelector(selectSelectedImage);
  const rotation = useAppSelector(selectImageRotation);
  
  // Local state
  const [selectedField, setSelectedField] = useState(null);
  const [fieldHistory, setFieldHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Get divisions for selected estate
  const divisions = useAppSelector((state) =>
    selectedEstate ? selectDivisionsByEstate(state, selectedEstate.value) : []
  );

  // Set default date range to current month
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    dispatch(setStartDate(firstDay.toLocaleDateString('en-CA')));
    dispatch(setEndDate(lastDay.toLocaleDateString('en-CA')));
  }, [dispatch]);

  // Fetch estates on component mount
  useEffect(() => {
    dispatch(fetchEstates()).then((result) => {
      if (fetchEstates.fulfilled.match(result)) {
        const estatesData = result.payload;
        const defaultEstate = estatesData.find(estate => estate.id === 48);
        if (defaultEstate) {
          dispatch(setSelectedEstate({
            value: defaultEstate.id.toString(),
            label: defaultEstate.estate
          }));
        }
      }
    });
  }, [dispatch]);

  // Fetch divisions when estate is selected
  useEffect(() => {
    if (selectedEstate) {
      dispatch(fetchDivisions(selectedEstate.value));
    }
    setSelectedField(null);
  }, [selectedEstate, dispatch]);

  // Fetch field history when field is selected
  useEffect(() => {
    if (selectedField) {
      setLoading(true);
      const fetchFieldHistory = async () => {
        try {
          const result = await dispatch(
            baseApi.endpoints.getFieldDetails.initiate(selectedField.value)
          );
          const response = result.data || {};
          if (response.status === 'true' && Array.isArray(response.plans)) {
            const plans = response.plans.flat();
            setFieldHistory(plans);
          } else {
            setFieldHistory([]);
          }
        } catch (error) {
          console.error('Error fetching field history:', error);
          setFieldHistory([]);
        } finally {
          setLoading(false);
        }
      };
      fetchFieldHistory();
    } else {
      setFieldHistory([]);
    }
    // Clear all expanded plans when field changes
    dispatch(resetUI());
  }, [selectedField, dispatch]);

  // Filter plans by date range, flag, and type
  const filteredPlans = fieldHistory.filter(plan => {
    const planDate = new Date(plan.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const dateInRange = (!start || planDate >= start) && (!end || planDate <= end);
    const flagMatch = !selectedFlag || plan.flag === selectedFlag;
    const typeMatch = !selectedType || plan.type === selectedType;
    return dateInRange && flagMatch && typeMatch;
  });

  // Format options for react-select
  const estateOptions = estates.map(estate => ({
    value: estate.id.toString(),
    label: estate.estate
  }));

  const fieldOptions = divisions.flatMap(division =>
    Array.isArray(division?.fields) ? division.fields.map(field => ({
      value: field.field_id,
      label: `${field.field_name} (${division.division_name})`
    })) : []
  );

  // Helper functions
  const getFlagText = (flag) => {
    const flags = { 'np': 'Revolving Plan', 'ap': 'Adhoc Plan', 'rp': 'Reschedule Plan' };
    return flags[flag] || flag;
  };

  const getTypeText = (type) => {
    const types = { 'spy': 'Spray', 'spd': 'Spread' };
    return types[type] || type;
  };

  const getStatusText = (status) => {
    const statuses = { 'p': 'Pending', 'x': 'Rejected', 'c': 'Completed', 'r': 'Rejected' };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'p': '#f59e0b',
      'x': '#ef4444',
      'c': '#10b981',
      'r': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Handlers
  const handleEstateChange = (selectedOption) => {
    dispatch(setSelectedEstate(selectedOption));
  };

  const handleFieldChange = (selectedOption) => {
    setSelectedField(selectedOption);
  };

  const togglePlan = (planId) => {
    // Ensure planId is converted to string for consistency
    const planIdStr = String(planId);
    dispatch(togglePlanExpansion(planIdStr));
  };

  const openImage = (imageUrl) => {
    dispatch(setSelectedImage(imageUrl));
  };

  const closeImage = () => {
    dispatch(setSelectedImage(null));
  };

  const rotateLeft = (e) => {
    e.stopPropagation();
    dispatch(rotateImage());
    dispatch(rotateImage());
    dispatch(rotateImage());
  };

  const rotateRight = (e) => {
    e.stopPropagation();
    dispatch(rotateImage());
  };

  const downloadImage = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `field_image_${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary stats
  const sprayPlans = filteredPlans.filter(plan => plan.type === 'spy').length;
  const spreadPlans = filteredPlans.filter(plan => plan.type === 'spd').length;
  const totalPlans = filteredPlans.length;

  return (
    <div className="field-history-container-fieldhistory">
      {/* Header */}
      <div className="field-history-header-fieldhistory">
        <button 
          className="field-history-back-btn-fieldhistory" 
          onClick={() => navigate('/home/workflowDashboard')}
          title="Back to Dashboard"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="field-history-header-content-fieldhistory">
          <h1>Field History</h1>
          <p>View and track field operation history</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="field-history-content-fieldhistory">
        {/* Selection Section */}
        <div className="field-history-selection-fieldhistory">
          <div className="field-history-select-group-fieldhistory">
            <label className="field-history-label-fieldhistory">
              <i className="fas fa-building"></i>
              Estate
            </label>
            <Select
              value={selectedEstate}
              onChange={handleEstateChange}
              options={estateOptions}
              isSearchable={true}
              placeholder="Select estate..."
              className="field-history-select-fieldhistory"
              classNamePrefix="field-history-select"
              isDisabled={!estates.length}
            />
          </div>

          <div className="field-history-select-group-fieldhistory">
            <label className="field-history-label-fieldhistory">
              <i className="fas fa-map-marked-alt"></i>
              Field
            </label>
            <Select
              value={selectedField}
              onChange={handleFieldChange}
              options={fieldOptions}
              isSearchable={true}
              placeholder="Select field..."
              className="field-history-select-fieldhistory"
              classNamePrefix="field-history-select"
              isDisabled={!divisions.length}
            />
          </div>
        </div>

        {/* Filters */}
        {fieldHistory.length > 0 && (
          <div className="field-history-filters-fieldhistory">
            <div className="field-history-filter-group-fieldhistory">
              <label className="field-history-label-fieldhistory">
                <i className="fas fa-calendar"></i>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => dispatch(setStartDate(e.target.value))}
                className="field-history-input-fieldhistory"
              />
            </div>
            <div className="field-history-filter-group-fieldhistory">
              <label className="field-history-label-fieldhistory">
                <i className="fas fa-calendar"></i>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => dispatch(setEndDate(e.target.value))}
                className="field-history-input-fieldhistory"
              />
            </div>
            <div className="field-history-filter-group-fieldhistory">
              <label className="field-history-label-fieldhistory">
                <i className="fas fa-tag"></i>
                Plan Type
              </label>
              <select
                value={selectedFlag}
                onChange={(e) => dispatch(setSelectedFlag(e.target.value))}
                className="field-history-input-fieldhistory"
              >
                <option value="">All Plans</option>
                <option value="np">Revolving Plan</option>
                <option value="ap">Adhoc Plan</option>
                <option value="rp">Reschedule Plan</option>
              </select>
            </div>
            <div className="field-history-filter-group-fieldhistory">
              <label className="field-history-label-fieldhistory">
                <i className="fas fa-seedling"></i>
                Operation Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => dispatch(setSelectedType(e.target.value))}
                className="field-history-input-fieldhistory"
              >
                <option value="">All Types</option>
                <option value="spy">Spray</option>
                <option value="spd">Spread</option>
              </select>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {fieldHistory.length > 0 && (
          <div className="field-history-summary-fieldhistory">
            <div className="field-history-summary-card-fieldhistory">
              <div className="field-history-summary-icon-fieldhistory field-history-summary-icon-total-fieldhistory">
                <i className="fas fa-list"></i>
              </div>
              <div className="field-history-summary-content-fieldhistory">
                <div className="field-history-summary-value-fieldhistory">{totalPlans}</div>
                <div className="field-history-summary-label-fieldhistory">Total Plans</div>
              </div>
            </div>
            <div className="field-history-summary-card-fieldhistory">
              <div className="field-history-summary-icon-fieldhistory field-history-summary-icon-spray-fieldhistory">
                <i className="fas fa-spray-can"></i>
              </div>
              <div className="field-history-summary-content-fieldhistory">
                <div className="field-history-summary-value-fieldhistory">{sprayPlans}</div>
                <div className="field-history-summary-label-fieldhistory">Spray Plans</div>
              </div>
            </div>
            <div className="field-history-summary-card-fieldhistory">
              <div className="field-history-summary-icon-fieldhistory field-history-summary-icon-spread-fieldhistory">
                <i className="fas fa-seedling"></i>
              </div>
              <div className="field-history-summary-content-fieldhistory">
                <div className="field-history-summary-value-fieldhistory">{spreadPlans}</div>
                <div className="field-history-summary-label-fieldhistory">Spread Plans</div>
              </div>
            </div>
          </div>
        )}

        {/* Plans List */}
        <div className="field-history-plans-fieldhistory">
          {loading ? (
            <div className="field-history-loading-fieldhistory">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading field history...</p>
            </div>
          ) : filteredPlans.length > 0 ? (
            <div className="field-history-plans-list-fieldhistory">
              {filteredPlans.map(plan => (
                <div key={plan.plan_id} className="field-history-plan-fieldhistory">
                  <div 
                    className="field-history-plan-header-fieldhistory" 
                    onClick={() => togglePlan(plan.plan_id)}
                  >
                    <div className="field-history-plan-info-fieldhistory">
                      <div className="field-history-plan-id-fieldhistory">Plan #{plan.plan_id}</div>
                      <div className="field-history-plan-title-fieldhistory">
                        {plan.estate_text} - {plan.area} Ha
                      </div>
                      <div className="field-history-plan-meta-fieldhistory">
                        <span className="field-history-plan-date-fieldhistory">
                          <i className="fas fa-calendar"></i> {plan.date}
                        </span>
                        <span className={`field-history-plan-badge-fieldhistory field-history-plan-badge-${plan.flag}-fieldhistory`}>
                          {getFlagText(plan.flag)}
                        </span>
                        <span className={`field-history-plan-badge-fieldhistory field-history-plan-badge-${plan.type}-fieldhistory`}>
                          {getTypeText(plan.type)}
                        </span>
                      </div>
                    </div>
                    <div className="field-history-plan-toggle-fieldhistory">
                      <i className={`fas fa-chevron-${expandedPlans[String(plan.plan_id)] ? 'up' : 'down'}`}></i>
                    </div>
                  </div>
                  
                  {expandedPlans[String(plan.plan_id)] && (
                    <div className="field-history-plan-details-fieldhistory">
                      {/* Plan Details */}
                      <div className="field-history-detail-section-fieldhistory">
                        <h3><i className="fas fa-info-circle"></i> Plan Details</h3>
                        <div className="field-history-detail-grid-fieldhistory">
                          <div className="field-history-detail-item-fieldhistory">
                            <span className="field-history-detail-label-fieldhistory">Type:</span>
                            <span className="field-history-detail-value-fieldhistory">{getTypeText(plan.type)}</span>
                          </div>
                          <div className="field-history-detail-item-fieldhistory">
                            <span className="field-history-detail-label-fieldhistory">Crop:</span>
                            <span className="field-history-detail-value-fieldhistory">{plan.crop_text}</span>
                          </div>
                          <div className="field-history-detail-item-fieldhistory">
                            <span className="field-history-detail-label-fieldhistory">Estate:</span>
                            <span className="field-history-detail-value-fieldhistory">{plan.estate_text}</span>
                          </div>
                          <div className="field-history-detail-item-fieldhistory">
                            <span className="field-history-detail-label-fieldhistory">Area:</span>
                            <span className="field-history-detail-value-fieldhistory">{plan.area} Ha</span>
                          </div>
                          <div className="field-history-detail-item-fieldhistory">
                            <span className="field-history-detail-label-fieldhistory">Team Assigned:</span>
                            <span 
                              className="field-history-status-badge-fieldhistory"
                              style={{ backgroundColor: plan.plan_team_assigned === 1 ? '#10b981' : '#f59e0b' }}
                            >
                              {plan.plan_team_assigned === 1 ? 'Assigned' : 'Not Assigned'}
                            </span>
                          </div>
                          <div className="field-history-detail-item-fieldhistory">
                            <span className="field-history-detail-label-fieldhistory">Manager Approval:</span>
                            <span 
                              className="field-history-status-badge-fieldhistory"
                              style={{ backgroundColor: plan.plan_manager_approval === 1 ? '#10b981' : '#f59e0b' }}
                            >
                              {plan.plan_manager_approval === 1 ? 'Approved' : 'Not Approved'}
                            </span>
                          </div>
                          <div className="field-history-detail-item-fieldhistory">
                            <span className="field-history-detail-label-fieldhistory">Status:</span>
                            <span 
                              className="field-history-status-badge-fieldhistory"
                              style={{ backgroundColor: getStatusColor(plan.field_status) }}
                            >
                              {getStatusText(plan.field_status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {plan.field_status === 'r' && plan.field_status_reason_text && (
                        <div className="field-history-rejection-fieldhistory">
                          <h3><i className="fas fa-exclamation-triangle"></i> Rejection Reason</h3>
                          <p>{plan.field_status_reason_text}</p>
                        </div>
                      )}

                      {/* Tasks */}
                      {Array.isArray(plan.tasks) && plan.tasks.length > 0 && (
                        <div className="field-history-tasks-fieldhistory">
                          <h3><i className="fas fa-tasks"></i> Tasks ({plan.tasks.length})</h3>
                          <div className="field-history-tasks-list-fieldhistory">
                            {plan.tasks.map(task => (
                              <div key={task.task_id} className="field-history-task-fieldhistory">
                                <div className="field-history-task-header-fieldhistory">
                                  <div className="field-history-task-id-fieldhistory">Task #{task.task_id}</div>
                                  <div className="field-history-task-pilot-fieldhistory">
                                    <i className="fas fa-user"></i> {task.pilot}
                                  </div>
                                </div>
                                
                                <div className="field-history-task-content-fieldhistory">
                                  <div className="field-history-task-details-fieldhistory">
                                    <div className="field-history-detail-grid-fieldhistory">
                                      <div className="field-history-detail-item-fieldhistory">
                                        <span className="field-history-detail-label-fieldhistory">Battery Count:</span>
                                        <span className="field-history-detail-value-fieldhistory">{task.battary_count}</span>
                                      </div>
                                      <div className="field-history-detail-item-fieldhistory">
                                        <span className="field-history-detail-label-fieldhistory">Drone:</span>
                                        <span className="field-history-detail-value-fieldhistory">{task.drone}</span>
                                      </div>
                                      <div className="field-history-detail-item-fieldhistory">
                                        <span className="field-history-detail-label-fieldhistory">Field Area:</span>
                                        <span className="field-history-detail-value-fieldhistory">{task.fieldArea} ha</span>
                                      </div>
                                      <div className="field-history-detail-item-fieldhistory">
                                        <span className="field-history-detail-label-fieldhistory">Sprayed Area:</span>
                                        <span className="field-history-detail-value-fieldhistory">{task.sprayedArea} ha</span>
                                      </div>
                                      <div className="field-history-detail-item-fieldhistory">
                                        <span className="field-history-detail-label-fieldhistory">Remaining Area:</span>
                                        <span className="field-history-detail-value-fieldhistory">{task.remainingFieldArea} ha</span>
                                      </div>
                                      <div className="field-history-detail-item-fieldhistory">
                                        <span className="field-history-detail-label-fieldhistory">Sprayed Liters:</span>
                                        <span className="field-history-detail-value-fieldhistory">{task.sprayedLiters} L</span>
                                      </div>
                                      <div className="field-history-detail-item-fieldhistory">
                                        <span className="field-history-detail-label-fieldhistory">Remaining Liters:</span>
                                        <span className="field-history-detail-value-fieldhistory">{task.remainingLiters} L</span>
                                      </div>
                                      <div className="field-history-detail-item-fieldhistory">
                                        <span className="field-history-detail-label-fieldhistory">Status:</span>
                                        <span 
                                          className="field-history-status-badge-fieldhistory"
                                          style={{ backgroundColor: getStatusColor(task.field_status) }}
                                        >
                                          {getStatusText(task.field_status)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {task.image && (
                                    <div className="field-history-task-image-fieldhistory">
                                      <img
                                        src={task.image}
                                        alt="Task"
                                        className="field-history-image-thumbnail-fieldhistory"
                                        onClick={() => openImage(task.image)}
                                        title="Click to view full size"
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Subtasks */}
                                {Array.isArray(task.sub_task) && task.sub_task.length > 0 && (
                                  <div className="field-history-subtasks-fieldhistory">
                                    <h4><i className="fas fa-list-ul"></i> Subtasks ({task.sub_task.length})</h4>
                                    <div className="field-history-subtasks-list-fieldhistory">
                                      {task.sub_task.map(subtask => (
                                        <div key={subtask.sub_task_id} className="field-history-subtask-fieldhistory">
                                          <div className="field-history-subtask-header-fieldhistory">
                                            <div className="field-history-subtask-id-fieldhistory">Subtask #{subtask.sub_task_id}</div>
                                            <span 
                                              className="field-history-status-badge-fieldhistory"
                                              style={{ 
                                                backgroundColor: subtask.team_lead_status === 'a' ? '#10b981' : 
                                                               subtask.team_lead_status === 'p' ? '#f59e0b' : '#ef4444'
                                              }}
                                            >
                                              {subtask.team_lead_status === 'a' ? 'Approved' :
                                               subtask.team_lead_status === 'p' ? 'Pending' :
                                               subtask.team_lead_status === 'r' ? 'Rejected' : subtask.team_lead_status}
                                            </span>
                                          </div>
                                          
                                          <div className="field-history-subtask-content-fieldhistory">
                                            <div className="field-history-detail-grid-fieldhistory">
                                              <div className="field-history-detail-item-fieldhistory">
                                                <span className="field-history-detail-label-fieldhistory">Field:</span>
                                                <span className="field-history-detail-value-fieldhistory">{subtask.fieldArea} ha</span>
                                              </div>
                                              <div className="field-history-detail-item-fieldhistory">
                                                <span className="field-history-detail-label-fieldhistory">Sprayed:</span>
                                                <span className="field-history-detail-value-fieldhistory">{subtask.sprayedArea} ha</span>
                                              </div>
                                              <div className="field-history-detail-item-fieldhistory">
                                                <span className="field-history-detail-label-fieldhistory">Remaining:</span>
                                                <span className="field-history-detail-value-fieldhistory">{subtask.remainingFieldArea} ha</span>
                                              </div>
                                              <div className="field-history-detail-item-fieldhistory">
                                                <span className="field-history-detail-label-fieldhistory">Sprayed Liters:</span>
                                                <span className="field-history-detail-value-fieldhistory">{subtask.sprayedLiters} L</span>
                                              </div>
                                              <div className="field-history-detail-item-fieldhistory">
                                                <span className="field-history-detail-label-fieldhistory">Remaining Liters:</span>
                                                <span className="field-history-detail-value-fieldhistory">{subtask.remainingLiters} L</span>
                                              </div>
                                            </div>
                                            
                                            {subtask.image && (
                                              <div className="field-history-subtask-image-fieldhistory">
                                                <img
                                                  src={subtask.image}
                                                  alt="Subtask"
                                                  className="field-history-image-thumbnail-fieldhistory"
                                                  onClick={() => openImage(subtask.image)}
                                                  title="Click to view full size"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="field-history-empty-fieldhistory">
              <i className="fas fa-inbox"></i>
              <h3>No Data Found</h3>
              <p>{selectedField ? 'No history available for this field' : 'Please select a field to view history'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="field-history-modal-fieldhistory" onClick={closeImage}>
          <div className="field-history-modal-content-fieldhistory" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Full view"
              className="field-history-modal-image-fieldhistory"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <div className="field-history-modal-controls-fieldhistory">
              <button 
                className="field-history-modal-btn-fieldhistory" 
                onClick={rotateLeft}
                title="Rotate Left"
              >
                <i className="fas fa-undo"></i>
              </button>
              <button 
                className="field-history-modal-btn-fieldhistory" 
                onClick={rotateRight}
                title="Rotate Right"
              >
                <i className="fas fa-redo"></i>
              </button>
              <button 
                className="field-history-modal-btn-fieldhistory" 
                onClick={downloadImage}
                title="Download"
              >
                <i className="fas fa-download"></i>
              </button>
              <button 
                className="field-history-modal-close-fieldhistory" 
                onClick={closeImage}
                title="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldHistory;
