import React, { useState, useEffect } from 'react';
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
  
  // Local state (component-specific)
  const [selectedField, setSelectedField] = useState(null);
  const [fieldHistory, setFieldHistory] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState(null);
  
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

  // Fetch divisions and fields when estate is selected
  useEffect(() => {
    if (selectedEstate) {
      dispatch(fetchDivisions(selectedEstate.value));
    }
    setSelectedField(null);
  }, [selectedEstate, dispatch]);

  // Fetch field history when field is selected
  useEffect(() => {
    if (selectedField) {
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
            console.error('Invalid response format for field history:', response);
            setFieldHistory([]);
          }
        } catch (error) {
          console.error('Error fetching field history:', error);
          setFieldHistory([]);
        }
      };
      fetchFieldHistory();
    } else {
      setFieldHistory([]);
    }
    // Clear expanded plans when field changes - reset all expanded plans
    Object.keys(expandedPlans).forEach(planId => {
      if (expandedPlans[planId]) {
        dispatch(togglePlanExpansion(planId));
      }
    });
  }, [selectedField, dispatch, expandedPlans]);

  // Handle estate selection
  const handleEstateChange = (selectedOption) => {
    dispatch(setSelectedEstate(selectedOption));
  };

  // Handle field selection
  const handleFieldChange = (selectedOption) => {
    setSelectedField(selectedOption);
  };

  // Handle flag selection
  const handleFlagChange = (event) => {
    dispatch(setSelectedFlag(event.target.value));
  };

  // Handle type selection
  const handleTypeChange = (event) => {
    dispatch(setSelectedType(event.target.value));
  };


  // Toggle plan expansion
  const togglePlan = (planId) => {
    dispatch(togglePlanExpansion(planId));
  };

  // Open full-screen image
  const openImage = (imageUrl) => {
    dispatch(setSelectedImage(imageUrl));
  };

  // Close full-screen image
  const closeImage = () => {
    dispatch(setSelectedImage(null));
  };
  // Rotate image left
  const rotateLeft = (e) => {
    e.stopPropagation();
    // Rotate left means subtract 90, rotate 3 times right = 270 = -90
    dispatch(rotateImage());
    dispatch(rotateImage());
    dispatch(rotateImage());
  };

  // Rotate image right
  const rotateRight = (e) => {
    e.stopPropagation();
    dispatch(rotateImage());
  };

  // Download image
  const downloadImage = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `field_image_${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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

  // Format estate options for react-select
  const estateOptions = estates.map(estate => ({
    value: estate.id.toString(),
    label: estate.estate
  }));

  // Format field options for react-select
  const fieldOptions = divisions.flatMap(division =>
    Array.isArray(division?.fields) ? division.fields.map(field => ({
      value: field.field_id,
      label: `${field.field_name} (${division.division_name})`
    })) : []
  );

  // Translate flag, type, and status fields
  const getFlagText = (flag) => {
    switch (flag) {
      case 'np': return 'Revolving Plan';
      case 'ap': return 'Adhoc Plan';
      case 'rp': return 'Reschedule Plan';
      default: return flag;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'spy': return 'Spray';
      case 'spd': return 'Spread';
      default: return type;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'p': return 'Pending';
      case 'x': return 'Rejected';
      case 'c': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="field-history-container-fieldhistory">
      {/* Header Section */}
      <div className="field-history-header-fieldhistory">
        <div className="field-history-title-fieldhistory">
          <h1>Field History</h1>
          <p>Track and analyze field operations history</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="field-history-controls-fieldhistory">
        <div className="field-history-controls-grid-fieldhistory">
          {/* Estate Selection */}
          <div className="field-history-control-group-fieldhistory">
            <label className="field-history-control-label-fieldhistory">
              <i className="fas fa-building"></i>
              Select Estate
            </label>
            <Select
              value={selectedEstate}
              onChange={handleEstateChange}
              options={estateOptions}
              isSearchable={true}
              placeholder="Search estates..."
              className="field-history-select-fieldhistory"
              classNamePrefix="field-history-select"
              isDisabled={!estates.length}
            />
          </div>

          {/* Field Selection */}
          <div className="field-history-control-group-fieldhistory">
            <label className="field-history-control-label-fieldhistory">
              <i className="fas fa-map-marked-alt"></i>
              Select Field
            </label>
            <Select
              value={selectedField}
              onChange={handleFieldChange}
              options={fieldOptions}
              isSearchable={true}
              placeholder="Search fields..."
              className="field-history-select-fieldhistory"
              classNamePrefix="field-history-select"
              isDisabled={!divisions.length}
            />
          </div>
        </div>

        {/* Filters Section */}
        {fieldHistory.length > 0 && (
          <div className="field-history-filters-fieldhistory">
            <div className="field-history-filters-header-fieldhistory">
              <h3><i className="fas fa-filter"></i> Filters</h3>
            </div>
            <div className="field-history-filters-grid-fieldhistory">
              <div className="field-history-filter-group-fieldhistory">
                <label className="field-history-filter-label-fieldhistory">
                  <i className="fas fa-calendar-alt"></i>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => dispatch(setStartDate(e.target.value))}
                  className="field-history-date-input-fieldhistory"
                />
              </div>
              <div className="field-history-filter-group-fieldhistory">
                <label className="field-history-filter-label-fieldhistory">
                  <i className="fas fa-calendar-alt"></i>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => dispatch(setEndDate(e.target.value))}
                  className="field-history-date-input-fieldhistory"
                />
              </div>
              <div className="field-history-filter-group-fieldhistory">
                <label className="field-history-filter-label-fieldhistory">
                  <i className="fas fa-tag"></i>
                  Plan Type
                </label>
                <select
                  value={selectedFlag}
                  onChange={handleFlagChange}
                  className="field-history-select-input-fieldhistory"
                >
                  <option value="">All Plans</option>
                  <option value="np">Revolving Plan</option>
                  <option value="ap">Adhoc Plan</option>
                  <option value="rp">Reschedule Plan</option>
                </select>
              </div>
              <div className="field-history-filter-group-fieldhistory">
                <label className="field-history-filter-label-fieldhistory">
                  <i className="fas fa-seedling"></i>
                  Operation Type
                </label>
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="field-history-select-input-fieldhistory"
                >
                  <option value="">All Types</option>
                  <option value="spy">Spray</option>
                  <option value="spd">Spread</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Summary Section */}
      {fieldHistory.length > 0 && (
        <div className="field-history-summary-fieldhistory">
          
          <div className="field-history-summary-cards-fieldhistory">
            <div className="field-history-summary-card-fieldhistory field-history-summary-card-spray-fieldhistory">
              <div className="field-history-summary-card-icon-fieldhistory">
                <i className="fas fa-spray-can"></i>
              </div>
              <div className="field-history-summary-card-content-fieldhistory">
                <div className="field-history-summary-card-value-fieldhistory">
                  {filteredPlans.filter(plan => plan.type === 'spy').length}
                </div>
                <div className="field-history-summary-card-label-fieldhistory">Spray Plans</div>
              </div>
            </div>
            
            <div className="field-history-summary-card-fieldhistory field-history-summary-card-spread-fieldhistory">
              <div className="field-history-summary-card-icon-fieldhistory">
                <i className="fas fa-seedling"></i>
              </div>
              <div className="field-history-summary-card-content-fieldhistory">
                <div className="field-history-summary-card-value-fieldhistory">
                  {filteredPlans.filter(plan => plan.type === 'spd').length}
                </div>
                <div className="field-history-summary-card-label-fieldhistory">Spread Plans</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Section */}
      <div className="field-history-plans-fieldhistory">
        {filteredPlans.length > 0 ? (
          <div className="field-history-plans-grid-fieldhistory">
            {filteredPlans.map(plan => (
              <div key={plan.plan_id} className="field-history-plan-card-fieldhistory">
                <div 
                  className="field-history-plan-header-fieldhistory" 
                  onClick={() => togglePlan(plan.plan_id)}
                >
                  <div className="field-history-plan-header-left-fieldhistory">
                    <div className="field-history-plan-id-fieldhistory">#{plan.plan_id}</div>
                    <div className="field-history-plan-title-fieldhistory">
                      {plan.estate_text} - {plan.area} Ha
                    </div>
                  </div>
                  <div className="field-history-plan-header-right-fieldhistory">
                    <div className="field-history-plan-date-fieldhistory">{plan.date}</div>
                    <div className="field-history-plan-badges-fieldhistory">
                      <span className={`field-history-plan-badge-fieldhistory field-history-plan-badge-${plan.flag}-fieldhistory`}>
                        {getFlagText(plan.flag)}
                      </span>
                      <span className={`field-history-plan-badge-fieldhistory field-history-plan-badge-${plan.type}-fieldhistory`}>
                        {getTypeText(plan.type)}
                      </span>
                    </div>
                    <div className="field-history-plan-toggle-fieldhistory">
                      <i className={`fas fa-chevron-${expandedPlans[plan.plan_id] ? 'up' : 'down'}`}></i>
                    </div>
                  </div>
                </div>
                
                {expandedPlans[plan.plan_id] && (
                  <div className="field-history-plan-details-fieldhistory">
                    <div className="field-history-plan-info-fieldhistory">
                      <div className="field-history-plan-info-grid-fieldhistory">
                        <div className="field-history-plan-info-section-fieldhistory">
                          <h4><i className="fas fa-info-circle"></i> Plan Details</h4>
                          <div className="field-history-plan-info-item-fieldhistory">
                            <span className="field-history-plan-info-label-fieldhistory">Type:</span>
                            <span className="field-history-plan-info-value-fieldhistory">{getTypeText(plan.type)}</span>
                          </div>
                          <div className="field-history-plan-info-item-fieldhistory">
                            <span className="field-history-plan-info-label-fieldhistory">Crop:</span>
                            <span className="field-history-plan-info-value-fieldhistory">{plan.crop_text}</span>
                          </div>
                          <div className="field-history-plan-info-item-fieldhistory">
                            <span className="field-history-plan-info-label-fieldhistory">Estate:</span>
                            <span className="field-history-plan-info-value-fieldhistory">{plan.estate_text}</span>
                          </div>
                        </div>
                        
                        <div className="field-history-plan-info-section-fieldhistory">
                          <h4><i className="fas fa-check-circle"></i> Approvals</h4>
                          <div className="field-history-plan-info-item-fieldhistory">
                            <span className="field-history-plan-info-label-fieldhistory">Team Assigned:</span>
                            <span className={`field-history-plan-status-fieldhistory ${plan.plan_team_assigned === 1 ? 'field-history-plan-status-approved-fieldhistory' : 'field-history-plan-status-pending-fieldhistory'}`}>
                              {plan.plan_team_assigned === 1 ? 'Assigned' : 'Not Assigned'}
                            </span>
                          </div>
                          <div className="field-history-plan-info-item-fieldhistory">
                            <span className="field-history-plan-info-label-fieldhistory">Manager:</span>
                            <span className={`field-history-plan-status-fieldhistory ${plan.plan_manager_approval === 1 ? 'field-history-plan-status-approved-fieldhistory' : 'field-history-plan-status-pending-fieldhistory'}`}>
                              {plan.plan_manager_approval === 1 ? 'Approved' : 'Not Approved'}
                            </span>
                          </div>
                          <div className="field-history-plan-info-item-fieldhistory">
                            <span className="field-history-plan-info-label-fieldhistory">Field Status:</span>
                            <span className={`field-history-plan-status-fieldhistory field-history-plan-status-${plan.field_status}-fieldhistory`}>
                              {getStatusText(plan.field_status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {plan.field_status === 'r' && plan.field_status_reason_text && (
                        <div className="field-history-plan-rejection-fieldhistory">
                          <h4><i className="fas fa-exclamation-triangle"></i> Rejection Reason</h4>
                          <p>{plan.field_status_reason_text}</p>
                        </div>
                      )}
                    </div>

                    {/* Tasks Section */}
                    {Array.isArray(plan.tasks) && plan.tasks.length > 0 && (
                      <div className="field-history-tasks-fieldhistory">
                        <h4><i className="fas fa-tasks"></i> Tasks ({plan.tasks.length})</h4>
                        <div className="field-history-tasks-grid-fieldhistory">
                          {plan.tasks.map(task => (
                            <div key={task.task_id} className="field-history-task-card-fieldhistory">
                              <div className="field-history-task-header-fieldhistory">
                                <div className="field-history-task-id-fieldhistory">Task #{task.task_id}</div>
                                <div className="field-history-task-pilot-fieldhistory">
                                  <i className="fas fa-user"></i> {task.pilot}
                                </div>
                              </div>
                              
                              <div className="field-history-task-content-fieldhistory">
                                <div className="field-history-task-info-fieldhistory">
                                  <div className="field-history-task-info-grid-fieldhistory">
                                    <div className="field-history-task-info-item-fieldhistory">
                                      <span className="field-history-task-info-label-fieldhistory">Battery Count:</span>
                                      <span className="field-history-task-info-value-fieldhistory">{task.battary_count}</span>
                                    </div>
                                    <div className="field-history-task-info-item-fieldhistory">
                                      <span className="field-history-task-info-label-fieldhistory">Drone:</span>
                                      <span className="field-history-task-info-value-fieldhistory">{task.drone}</span>
                                    </div>
                                    <div className="field-history-task-info-item-fieldhistory">
                                      <span className="field-history-task-info-label-fieldhistory">Field Area:</span>
                                      <span className="field-history-task-info-value-fieldhistory">{task.fieldArea} ha</span>
                                    </div>
                                    <div className="field-history-task-info-item-fieldhistory">
                                      <span className="field-history-task-info-label-fieldhistory">Sprayed Area:</span>
                                      <span className="field-history-task-info-value-fieldhistory">{task.sprayedArea} ha</span>
                                    </div>
                                    <div className="field-history-task-info-item-fieldhistory">
                                      <span className="field-history-task-info-label-fieldhistory">Remaining:</span>
                                      <span className="field-history-task-info-value-fieldhistory">{task.remainingFieldArea} ha</span>
                                    </div>
                                    <div className="field-history-task-info-item-fieldhistory">
                                      <span className="field-history-task-info-label-fieldhistory">Sprayed Liters:</span>
                                      <span className="field-history-task-info-value-fieldhistory">{task.sprayedLiters} L</span>
                                    </div>
                                    <div className="field-history-task-info-item-fieldhistory">
                                      <span className="field-history-task-info-label-fieldhistory">Remaining Liters:</span>
                                      <span className="field-history-task-info-value-fieldhistory">{task.remainingLiters} L</span>
                                    </div>
                                    <div className="field-history-task-info-item-fieldhistory">
                                      <span className="field-history-task-info-label-fieldhistory">Field Status:</span>
                                      <span className={`field-history-task-status-fieldhistory field-history-task-status-${task.field_status}-fieldhistory`}>
                                        {getStatusText(task.field_status)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {task.image && (
                                  <div className="field-history-task-image-fieldhistory">
                                    <img
                                      src={task.image}
                                      alt="Task Image"
                                      className="field-history-task-thumbnail-fieldhistory"
                                      onClick={() => openImage(task.image || '/assets/images/no-plan-found.png')}
                                      title="Click to view full size"
                                    />
                                    <div className="field-history-task-image-label-fieldhistory">
                                      <i className="fas fa-expand"></i> Click to expand
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Subtasks */}
                              {Array.isArray(task.sub_task) && task.sub_task.length > 0 && (
                                <div className="field-history-subtasks-fieldhistory">
                                  <h5><i className="fas fa-list-ul"></i> Subtasks ({task.sub_task.length})</h5>
                                  <div className="field-history-subtasks-grid-fieldhistory">
                                    {task.sub_task.map(subtask => (
                                      <div key={subtask.sub_task_id} className="field-history-subtask-card-fieldhistory">
                                        <div className="field-history-subtask-header-fieldhistory">
                                          <div className="field-history-subtask-id-fieldhistory">Subtask #{subtask.sub_task_id}</div>
                                          <div className="field-history-subtask-status-fieldhistory">
                                            <span className={`field-history-subtask-status-badge-fieldhistory field-history-subtask-status-${subtask.team_lead_status}-fieldhistory`}>
                                              {subtask.team_lead_status === 'a' ? 'Approved' :
                                                subtask.team_lead_status === 'p' ? 'Pending' :
                                                  subtask.team_lead_status === 'r' ? 'Rejected' :
                                                    subtask.team_lead_status}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <div className="field-history-subtask-content-fieldhistory">
                                          <div className="field-history-subtask-data-fieldhistory">
                                            <div className="field-history-subtask-data-item-fieldhistory">
                                              <span className="field-history-subtask-data-label-fieldhistory">Field:</span>
                                              <span className="field-history-subtask-data-value-fieldhistory">{subtask.fieldArea} ha</span>
                                            </div>
                                            <div className="field-history-subtask-data-item-fieldhistory">
                                              <span className="field-history-subtask-data-label-fieldhistory">Sprayed:</span>
                                              <span className="field-history-subtask-data-value-fieldhistory">{subtask.sprayedArea} ha</span>
                                            </div>
                                            <div className="field-history-subtask-data-item-fieldhistory">
                                              <span className="field-history-subtask-data-label-fieldhistory">Remaining:</span>
                                              <span className="field-history-subtask-data-value-fieldhistory">{subtask.remainingFieldArea} ha</span>
                                            </div>
                                            <div className="field-history-subtask-data-item-fieldhistory">
                                              <span className="field-history-subtask-data-label-fieldhistory">Sprayed:</span>
                                              <span className="field-history-subtask-data-value-fieldhistory">{subtask.sprayedLiters} L</span>
                                            </div>
                                            <div className="field-history-subtask-data-item-fieldhistory">
                                              <span className="field-history-subtask-data-label-fieldhistory">Remaining:</span>
                                              <span className="field-history-subtask-data-value-fieldhistory">{subtask.remainingLiters} L</span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {subtask.image && (
                                          <div className="field-history-subtask-image-fieldhistory">
                                            <img
                                              src={subtask.image}
                                              alt="Subtask Image"
                                              className="field-history-subtask-thumbnail-fieldhistory"
                                              onClick={() => openImage(subtask.image || '/assets/images/no-plan-found.png')}
                                              title="Click to view full size"
                                            />
                                            <div className="field-history-subtask-image-label-fieldhistory">
                                              <i className="fas fa-expand"></i> Click to expand
                                            </div>
                                          </div>
                                        )}
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
            <div className="field-history-empty-icon-fieldhistory">
              <i className="fas fa-search"></i>
            </div>
            <h3>No Data Found</h3>
            <p>{selectedField ? 'No history available for this field' : 'Select a field to view details'}</p>
          </div>
        )}
      </div>

      {/* Full-screen image modal */}
      {selectedImage && (
        <div className="field-history-image-modal-fieldhistory" onClick={closeImage}>
          <div className="field-history-image-modal-content-fieldhistory" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Full-screen"
              className="field-history-image-modal-img-fieldhistory"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <div className="field-history-image-modal-controls-fieldhistory">
              <button className="field-history-image-modal-btn-fieldhistory field-history-image-modal-rotate-left-fieldhistory" onClick={rotateLeft}>
                <i className="fas fa-undo"></i>
              </button>
              <button className="field-history-image-modal-btn-fieldhistory field-history-image-modal-rotate-right-fieldhistory" onClick={rotateRight}>
                <i className="fas fa-redo"></i>
              </button>
              <button className="field-history-image-modal-btn-fieldhistory field-history-image-modal-download-fieldhistory" onClick={downloadImage}>
                <i className="fas fa-download"></i>
              </button>
              <button className="field-history-image-modal-close-fieldhistory" onClick={closeImage}>
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