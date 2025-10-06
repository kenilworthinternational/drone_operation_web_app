import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../../styles/fieldhistory.css';
import { displayEstate, divisionStateList, fieldDetails } from '../../api/api';

const FieldHistory = () => {
  const [estates, setEstates] = useState([]);
  const [selectedEstate, setSelectedEstate] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [fieldHistory, setFieldHistory] = useState([]);
  const [expandedPlans, setExpandedPlans] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedFlag, setSelectedFlag] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [rotation, setRotation] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState(null);

  // Set default date range to current month
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setStartDate(firstDay.toLocaleDateString('en-CA'));
    setEndDate(lastDay.toLocaleDateString('en-CA'));
  }, []);

  // Fetch estates on component mount
  useEffect(() => {
    const fetchEstates = async () => {
      try {
        const response = await displayEstate();
        if (Array.isArray(response)) {
          setEstates(response);
          const defaultEstate = response.find(estate => estate.id === 48);
          if (defaultEstate) {
            setSelectedEstate({ value: defaultEstate.id.toString(), label: defaultEstate.estate });
          }
        } else {
          console.error('Invalid response format for estates:', response);
          setEstates([]);
        }
      } catch (error) {
        console.error('Error fetching estates:', error);
        setEstates([]);
      }
    };
    fetchEstates();
  }, []);

  // Fetch divisions and fields when estate is selected
  useEffect(() => {
    if (selectedEstate) {
      const fetchDivisions = async () => {
        try {
          const response = await divisionStateList(selectedEstate.value);
          let divisions = [];
          let minimumPlanSize = 0;
          let maximumPlanSize = 0;
          if (response && typeof response === 'object') {
            minimumPlanSize = response.minimum_plan_size || 0;
            maximumPlanSize = response.maximum_plan_size || 0;
            divisions = Object.keys(response)
              .filter(key => !isNaN(key))
              .map(key => response[key]);
          }
          if (Array.isArray(divisions)) {
            setDivisions(divisions);
            // You can store minimumPlanSize/maximumPlanSize in state if needed
          } else {
            console.error('Invalid response format for divisions:', response);
            setDivisions([]);
          }
        } catch (error) {
          console.error('Error fetching divisions:', error);
          setDivisions([]);
        }
      };
      fetchDivisions();
    } else {
      setDivisions([]);
    }
    setSelectedField(null);
  }, [selectedEstate]);

  // Fetch field history when field is selected
  useEffect(() => {
    if (selectedField) {
      const fetchFieldHistory = async () => {
        try {
          const response = await fieldDetails(selectedField.value);
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
    setExpandedPlans({});
    setSelectedFlag('');
    setSelectedType('');
  }, [selectedField]);

  // Handle estate selection
  const handleEstateChange = (selectedOption) => {
    setSelectedEstate(selectedOption);
  };

  // Handle field selection
  const handleFieldChange = (selectedOption) => {
    setSelectedField(selectedOption);
  };

  // Handle flag selection
  const handleFlagChange = (event) => {
    setSelectedFlag(event.target.value);
  };

  // Handle type selection
  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  // Toggle plan expansion
  const togglePlan = (planId) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  // Open full-screen image
  const openImage = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Close full-screen image
  const closeImage = () => {
    setSelectedImage(null);
  };
  // Rotate image left
  const rotateLeft = (e) => {
    e.stopPropagation();
    setRotation(prev => (prev - 90) % 360);
  };

  // Rotate image right
  const rotateRight = (e) => {
    e.stopPropagation();
    setRotation(prev => (prev + 90) % 360);
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
      case 'np': return 'New Plan';
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
    <div className="field_history">
      {/* Top Section: 15vh */}
      <div className="field_history_top">
        <div className="field_history_top1">
          <div className="dropdown_container">
            <label htmlFor="estate-select" className="dropdown_label">
              Select Estate
            </label>
            <Select
              id="estate-select"
              value={selectedEstate}
              onChange={handleEstateChange}
              options={estateOptions}
              isSearchable={true}
              placeholder="Type to search estates..."
              className="react_select_container"
              classNamePrefix="react_select"
              isDisabled={!estates.length}
            />
          </div>
          <div className="dropdown_container">
            <label htmlFor="field-select" className="dropdown_label">
              Select Field
            </label>
            <Select
              id="field-select"
              value={selectedField}
              onChange={handleFieldChange}
              options={fieldOptions}
              isSearchable={true}
              placeholder="Type to search fields..."
              className="react_select_container"
              classNamePrefix="react_select"
              isDisabled={!divisions.length}
            />
          </div>
          {fieldHistory.length > 0 && (
            <div className="filter_container">
              <div className="filter_item">
                <label htmlFor="start-date" className="dropdown_label">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="dropdown_select"
                />
              </div>
              <div className="filter_item">
                <label htmlFor="end-date" className="dropdown_label">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="dropdown_select"
                />
              </div>
              <div className="filter_item">
                <label htmlFor="flag-select" className="dropdown_label">
                  Plan Type
                </label>
                <select
                  id="flag-select"
                  value={selectedFlag}
                  onChange={handleFlagChange}
                  className="dropdown_select"
                >
                  <option value="">All Plans</option>
                  <option value="np">New Plan</option>
                  <option value="ap">Adhoc Plan</option>
                  <option value="rp">Reschedule Plan</option>
                </select>
              </div>
              <div className="filter_item">
                <label htmlFor="type-select" className="dropdown_label">
                  Spray/Spread
                </label>
                <select
                  id="type-select"
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="dropdown_select"
                >
                  <option value="">All Types</option>
                  <option value="spy">Spray</option>
                  <option value="spd">Spread</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="field_history_top2_parent">
        <div className="field_history_top2">
          {fieldHistory.length > 0 && (
            <div className="data_summary_field_history">
              <div className="summary-row">
                <span className="summary-label">Total Plans: </span>
                <span className="summary-value">{filteredPlans.length}</span>
              </div>

              <div className="summary-row">
                <div className="summary-group">
                  <span className="summary-tag spy">Spray(spy):</span>
                  <span className="summary-value">{filteredPlans.filter(plan => plan.type === 'spy').length}</span>
                </div>
                <div className="summary-group">
                  <span className="summary-tag spd">Spread(spd):</span>
                  <span className="summary-value">{filteredPlans.filter(plan => plan.type === 'spd').length}</span>
                </div>
              </div>

              <div className="summary-row">
                <div className="summary-group">
                  <span className="summary-label">Spray Area:</span>
                  <span className="summary-value">
                    {filteredPlans.filter(plan => plan.type === 'spy').reduce((sum, plan) => sum + plan.area, 0).toFixed(2)} ha
                  </span>
                </div>
                <div className="summary-group">
                  <span className="summary-label">Spread Area:</span>
                  <span className="summary-value">
                    {filteredPlans.filter(plan => plan.type === 'spd').reduce((sum, plan) => sum + plan.area, 0).toFixed(2)} ha
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      {/* Bottom Section: 85vh, Scrollable */}
      <div className="field_history_bottom">
        {filteredPlans.length > 0 ? (
          filteredPlans.map(plan => (
            <div key={plan.plan_id} className="plan_container">
              <div className="plan_header" onClick={() => togglePlan(plan.plan_id)}>
                <span>({plan.plan_id}) {plan.estate_text} - {plan.area} Ha</span>
                <span>{plan.date} - {getFlagText(plan.flag)} ({getTypeText(plan.type)})</span>
                <span></span>
                <span className="toggle_arrow">{expandedPlans[plan.plan_id] ? '▲' : '▼'}</span>
              </div>
              {expandedPlans[plan.plan_id] && (
                <div className="plan_details">
                  <div className="details_grid">
                    <div className="details_grid-left">
                      <div className="detail_label">Type: {getTypeText(plan.type)}</div>
                      <div className="detail_label">Crop: {plan.crop_text}</div>
                      <div className="detail_label">Estate: {plan.estate_text}</div>
                      <div className="detail_label">Director OPS Approval: {plan.plan_completed === 1 ? 'Approved' : 'Not Approved'}</div>
                    </div>
                    <div className="details_grid-right">
                      <div className="detail_label">Team Assigned: {plan.plan_team_assigned === 1 ? 'Assigned By Ops Room' : 'Not Assigned'}</div>
                      <div className="detail_label">Manager Approval: {plan.plan_manager_approval === 1 ? 'Approved' : 'Not Approved'}</div>
                      <div className="detail_label">Team Lead Status: {plan.field_activated === 1 ? 'Approved' : 'Canceled'}</div>
                      <div className="detail_label">Field Status: {getStatusText(plan.field_status)}</div>
                      {plan.field_status === 'r' && plan.field_status_reason_text && (
                        <>
                          <div className="detail_label">Rejection Reason:</div>
                          <div className="detail_value">{plan.field_status_reason_text}</div>
                        </>
                      )}
                    </div>
                  </div>
                  {Array.isArray(plan.tasks) && plan.tasks.length > 0 && (
                    <div className="tasks_container">
                      <h4>Tasks</h4>
                      {plan.tasks.map(task => (
                        <div key={task.task_id} className="task_item">
                          <div className="details_grid">
                            <div className="details_grid-left">
                              <div className="detail_label">Task ID: {task.task_id}</div>
                              <div className="detail_label">Team Lead: {task.team_lead}</div>
                              <div className="detail_label">Battery Count: {task.battary_count}</div>
                              <div className="detail_label">Field Area: {task.fieldArea} ha</div>
                              <div className="detail_label">Obstacle Area: {task.obstacleArea} ha</div>
                              <div className="detail_label">Margin Area: {task.marginArea} ha</div>
                            </div>
                            <div className="details_grid-right">
                              <div className="detail_label">Pilot Name: {task.pilot}</div>
                              <div className="detail_label">Sprayed Area: {task.sprayedArea} ha</div>
                              <div className="detail_label">Sprayed Liters: {task.sprayedLiters} L</div>
                              <div className="detail_label">Remaining Field Area: {task.remainingFieldArea} ha</div>
                              <div className="detail_label">Remaining Liters: {task.remainingLiters} L</div>
                              <div className="detail_label">Drone : {task.drone} L</div>
                            </div>
                            {task.image && (
                              <div className="details_grid-image">
                                <div className="detail_value">
                                  <img
                                    src={task.image}
                                    alt="Task"
                                    className="thumbnail_image"
                                    onClick={() => openImage(task.image || '/assets/images/no-plan-found.png')}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          {Array.isArray(task.sub_task) && task.sub_task.length > 0 && (
                            <div className="subtasks_container">
                              <h5>Subtasks</h5>
                              {task.sub_task.map(subtask => (
                                <div key={subtask.sub_task_id} className="subtask_item">
                                  <div className="details_grid">
                                    <div className="details_grid-left">
                                      <div className="detail_label">Subtask ID: {subtask.sub_task_id}</div>
                                      <div className="detail_label">Field Area: {subtask.fieldArea} ha</div>
                                      <div className="detail_label">Obstacle Area: {subtask.obstacleArea} ha</div>
                                      <div className="detail_label">Margin Area: {subtask.marginArea} ha</div>
                                      <div className="detail_label">Sprayed Area: {subtask.sprayedArea} ha</div>
                                    </div>
                                    <div className="details_grid-right">
                                      <div className="detail_label">Sprayed Liters: {subtask.sprayedLiters} L</div>
                                      <div className="detail_label">Remaining Field Area: {subtask.remainingFieldArea} ha</div>
                                      <div className="detail_label">Remaining Liters: {subtask.remainingLiters} L</div>
                                      <div className="detail_label">
                                        Team Lead Status: {
                                          subtask.team_lead_status === 'a' ? 'Approved' :
                                            subtask.team_lead_status === 'p' ? 'Pending' :
                                              subtask.team_lead_status === 'r' ? 'Rejected' :
                                                subtask.team_lead_status
                                        }
                                      </div>
                                      <div className="detail_label">Ops Room Status: {getStatusText(subtask.ops_room_status)}</div>
                                    </div>
                                    {subtask.image && (
                                      <div className="details_grid-image">
                                        <div className="detail_value">
                                          <img
                                            src={subtask.image}
                                            alt="Subtask"
                                            className="thumbnail_image"
                                            onClick={() => openImage(subtask.image || '/assets/images/no-plan-found.png')}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="placeholder_content">
            {selectedField ? 'No history available for this field' : 'Select a field to view details'}
          </div>
        )}
      </div>
      {/* Full-screen image modal */}
      {selectedImage && (
        <div className="image_modal" onClick={closeImage}>
          <div className="image_modal_content_wrapper" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Full-screen"
              className="image_modal_content"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <div className="image_modal_controls">
              <button className="image_modal_btn rotate_left" onClick={rotateLeft}>
                <i className="fas fa-undo"></i>
              </button>
              <button className="image_modal_btn rotate_right" onClick={rotateRight}>
                <i className="fas fa-redo"></i>
              </button>
              {/* <button className="image_modal_btn download_btn" onClick={downloadImage}>
                <i className="fas fa-download"></i>
              </button> */}
              <button className="image_modal_close" onClick={closeImage}>
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