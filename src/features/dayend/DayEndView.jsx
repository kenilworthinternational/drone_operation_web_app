import React, { useState, useEffect } from 'react';
import '../../styles/dayendprocess.css';
import { FaCalendarAlt, FaRegArrowAltCircleRight, FaArrowCircleDown, FaArrowCircleUp, FaUndo, FaRedo, FaDownload, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bars } from 'react-loader-spinner';
import { getPlansUsingDate, findPlanSummary, displayTaskPlanAndField, opsApproval } from '../../api/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="date-picker-input" />
    <FaCalendarAlt className="calendar-icon" />
  </div>
));

const DayEndView = () => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [expandedDivisions, setExpandedDivisions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [loadingMissionDetails, setLoadingMissionDetails] = useState(false);
  const [fieldTasks, setFieldTasks] = useState({});
  const [loadingFields, setLoadingFields] = useState({});
  const [expandedFields, setExpandedFields] = useState([]);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showSubtaskPopup, setShowSubtaskPopup] = useState(false);
  const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(0);
  const [subtasks, setSubtasks] = useState([]);
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  // Image modal states
  const [selectedImage, setSelectedImage] = useState(null);
  const [rotation, setRotation] = useState(0);

  // Image modal handlers
  const openImage = (imageSrc) => {
    setSelectedImage(imageSrc || '/assets/images/no-plan-found.png');
    setRotation(0);
  };

  const closeImage = () => {
    setSelectedImage(null);
    setRotation(0);
  };

  const rotateLeft = (e) => {
    e.stopPropagation();
    setRotation((prev) => (prev - 90) % 360);
  };

  const rotateRight = (e) => {
    e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
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

  const getStatusBackground = (status) => {
    switch (status) {
      case 'Pending': return '#E4E4E4FF';
      case 'Complete': return '#DAFFDBFF';
      case 'Cancel': return '#FFDEDEFF';
      default: return '#0080C0FF';
    }
  };

  const handleDateChange = async (date) => {
    setMissions([]);
    setSelectedMission(null);
    setLoadingMissions(true);
    try {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('en-CA');
      const response = await getPlansUsingDate(formattedDate);
      if (response.status === 'true' && Object.keys(response).length > 2) {
        const missionArray = Object.keys(response)
          .filter((key) => !isNaN(key))
          .map((key) => response[key]);
        const missionOptions = missionArray.map((plan) => ({
          id: plan.id,
          group: `${plan.estate} - ${plan.area} Ha`,
          estateId: Number(plan.estate_id),
          completed: plan.completed,
        }));
        setMissions(missionOptions);
      } else {
        setMissions([]);
      }
    } catch (error) {
      toast.error('Failed to load tasks. Please try again.');
      console.error(error);
      setMissions([]);
    } finally {
      setLoadingMissions(false);
    }
  };

  const handleMissionClick = async (missionId) => {
    setLoadingMissionDetails(true);
    try {
      const response = await findPlanSummary(missionId);
      setSelectedMission({ ...response, id: missionId });
      setExpandedDivisions([]);
      setExpandedFields([]);
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoadingMissionDetails(false);
    }
  };

  const toggleTaskExpansion = (fieldId, taskIndex) => {
    setFieldTasks((prev) => {
      if (!prev[fieldId] || !prev[fieldId].tasks) return prev;
      return {
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          tasks: prev[fieldId].tasks.map((task, idx) =>
            idx === taskIndex ? { ...task, expanded: !task.expanded } : task
          ),
        },
      };
    });
  };

  const toggleDivision = (divisionId) => {
    setExpandedDivisions((prev) =>
      prev.includes(divisionId)
        ? prev.filter((id) => id !== divisionId)
        : [...prev, divisionId]
    );
  };

  const handleFieldClick = async (fieldId) => {
    setExpandedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
    if (!fieldTasks[fieldId]) {
      setLoadingFields((prev) => ({ ...prev, [fieldId]: true }));
      try {
        const response = await displayTaskPlanAndField(selectedMission.id, fieldId);
        if (response.tasks && response.tasks.length > 0) {
          setFieldTasks((prev) => ({
            ...prev,
            [fieldId]: {
              tasks: response.tasks.map((task) => ({
                ...task,
                task_image: task.task_image ? `${task.task_image}?${Date.now()}` : null,
                dji_image: task.dji_image ? `${task.dji_image}?${Date.now()}` : null,
              })),
              field_id: fieldId,
            },
          }));
        } else {
          setFieldTasks((prev) => ({
            ...prev,
            [fieldId]: { tasks: [], field_id: fieldId },
          }));
        }
      } catch (error) {
        console.error('Error fetching field tasks:', error);
      } finally {
        setLoadingFields((prev) => ({ ...prev, [fieldId]: false }));
      }
    }
  };

  const calculateTotalExtent = () => {
    if (!selectedMission?.divisions) {
      console.warn('No divisions found in mission, returning 0');
      return 0;
    }
    const total = selectedMission.divisions.reduce((total, division) => {
      const divisionTotal = division.checkedFields.reduce((sum, field) => {
        const fieldArea = parseFloat(field.field_area) || 0;
        return sum + fieldArea;
      }, 0);
      return total + divisionTotal;
    }, 0);
    return total.toFixed(2);
  };

  useEffect(() => {
    handleDateChange(selectedDate);
  }, []);

  const handleApproveClick = (subTasks) => {
    if (subTasks && subTasks.length > 0) {
      setSubtasks(subTasks);
      setCurrentSubtaskIndex(0);
      setShowSubtaskPopup(true);
    }
  };

  const handleSubtaskPopupClose = () => {
    setShowSubtaskPopup(false);
    setSubtasks([]);
    setCurrentSubtaskIndex(0);
  };

  const handleNextSubtask = () => {
    if (currentSubtaskIndex < subtasks.length - 1) {
      setCurrentSubtaskIndex((prev) => prev + 1);
    }
  };

  const handlePreviousSubtask = () => {
    if (currentSubtaskIndex > 0) {
      setCurrentSubtaskIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="dayendprocess">
      <div className="left-dayend">
        <div className="date-area-dayendprocess">
          <label>Plan Date: </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy/MM/dd"
            customInput={<CustomDateInput />}
          />
        </div>
        <div className="dayendprocess-missions-list">
          {loadingMissions ? (
            <Bars height="50" width="50" color="#004B71" ariaLabel="loading" />
          ) : (
            missions.map((mission) => (
              <div
                key={mission.id}
                className={`dayendprocess-mission-container ${mission.completed ? 'completed-mission' : 'incomplete-mission'}`}
                onClick={() => handleMissionClick(mission.id)}
              >
                <div className="mission-container-left">
                  <p><strong>Estate:</strong> {mission.group}</p>
                  <p><strong>Estate ID:</strong> {mission.estateId} - <strong>Plan ID:</strong> {mission.id}</p>
                  <div className="completion-checkbox" onClick={(e) => e.stopPropagation()}>
                    <label>
                      Dir-Ops Approvals
                      <input
                        type="checkbox"
                        checked={mission.completed === 1}
                        disabled={userData.job_role !== 'dops'}
                        onChange={async (e) => {
                          if (userData.job_role !== 'dops') {
                            toast.error("You don't have permission to modify approvals");
                            return;
                          }
                          const newStatus = e.target.checked ? 1 : 0;
                          try {
                            const updatedMissions = missions.map((m) =>
                              m.id === mission.id ? { ...m, completed: newStatus } : m
                            );
                            setMissions(updatedMissions);
                            const response = await opsApproval(mission.id, newStatus);
                            if (response.status === 'true') {
                              toast.success('Status updated successfully');
                              await handleDateChange(selectedDate);
                            } else {
                              setMissions(missions);
                              toast.error(response.message || 'Update failed');
                            }
                          } catch (error) {
                            console.error('Update error:', error);
                            setMissions(missions);
                            toast.error('Failed to update status');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="mission-container-right">
                  <FaRegArrowAltCircleRight />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="right-dayend">
        {loadingMissionDetails ? (
          <Bars height="50" width="50" color="#004B71" ariaLabel="loading" />
        ) : selectedMission ? (
          <div className="mission-details-container">
            <h3>
              {selectedMission?.estateName ?? 'Unknown Estate'} - {calculateTotalExtent()} Ha
            </h3>
            {selectedMission.divisions.map((division) => (
              <div key={division.divisionId} className="division-container">
                <div
                  className="division-header"
                  onClick={() => toggleDivision(division.divisionId)}
                >
                  <span>{division.divisionName}</span>
                  <span className="division-total-dayend">
                    {division.checkedFields
                      .reduce((sum, field) => sum + (parseFloat(field.field_area) || 0), 0)
                      .toFixed(2)} Ha
                    {expandedDivisions.includes(division.divisionId) ? (
                      <FaArrowCircleUp className="toggle-icon" />
                    ) : (
                      <FaArrowCircleDown className="toggle-icon" />
                    )}
                  </span>
                </div>
                {expandedDivisions.includes(division.divisionId) && (
                  <div className="fields-list">
                    {division.checkedFields.map((field) => (
                      <div
                        key={field.field_id}
                        className={`field-item ${field.field_pilots?.status === 'false' ? 'field-pilot-warning' : ''}`}
                      >
                        <div
                          className="field-header"
                          onClick={() => handleFieldClick(field.field_id)}
                        >
                          <span>
                            <span
                              style={{
                                color: field.activated ? '#4CAF50' : '#f44336',
                                fontSize: '25px',
                              }}
                              title={field.activated ? 'Active Field' : 'Inactive Field'}
                            >
                              ●
                            </span>
                            {field.field_name} - ({field.field_id})
                          </span>
                          <span>
                            {field.field_pilots?.status === 'false' && (
                              <span className="warning-badge">⚠️ No Pilot Assigned</span>
                            )}
                            {field.field_area} Ha
                            {loadingFields[field.field_id] ? (
                              <Bars height="20" width="20" color="#004B71" />
                            ) : expandedFields.includes(field.field_id) ? (
                              <FaArrowCircleUp className="toggle-icon" />
                            ) : (
                              <FaArrowCircleDown className="toggle-icon" />
                            )}
                          </span>
                        </div>
                        {expandedFields.includes(field.field_id) && (
                          <div className="field-tasks-container">
                            {(fieldTasks[field.field_id]?.tasks || []).map((task, taskIndex) => (
                              <div key={`task-${task.task_id}`} className="task-details-dayend">
                                <div
                                  className="task-header"
                                  style={{
                                    backgroundColor: getStatusBackground(task.task_status_text),
                                    transition: 'all 0.3s ease',
                                  }}
                                  onClick={() => toggleTaskExpansion(field.field_id, taskIndex)}
                                >
                                  <h4>Task {taskIndex + 1} : {task.drone_tag} - {task.pilot}</h4>
                                  {task.expanded ? <FaArrowCircleUp /> : <FaArrowCircleDown />}
                                </div>
                                {task.expanded && (
                                  <div className="tasks-all">
                                    <div className="task-content">
                                      <div className="task-text">
                                        <p>Task ID: {task.task_id}</p>
                                        <p>
                                          Field Area: {parseFloat(task.task_fieldArea || 0).toFixed(2)} Ha
                                          {task.dji_field_area && ` | DJI: ${parseFloat(task.dji_field_area || 0).toFixed(2)} Ha`}
                                        </p>
                                        <p>
                                          Sprayed Area: {parseFloat(task.task_sprayedArea || 0).toFixed(2)} Ha
                                          {task.dji_spraying_area && ` | DJI: ${parseFloat(task.dji_spraying_area || 0).toFixed(2)} Ha`}
                                        </p>
                                        <p>Obstacle Area: {parseFloat(task.task_obstacleArea || 0).toFixed(2)}</p>
                                        <p>DJI Flying Duration: {parseFloat(task.dji_flying_duration || 0).toFixed(2)}</p>
                                      </div>
                                      <div className="task-text">
                                        <p>Margin Area: {parseFloat(task.task_marginArea || 0).toFixed(2)}</p>
                                        <p>
                                          Liters Used: {parseFloat(task.task_sprayedLiters || 0).toFixed(2)}
                                          {task.dji_spraying_litres && ` | DJI: ${parseFloat(task.dji_spraying_litres || 0).toFixed(2)}`}
                                        </p>
                                        <p>Status: {task.task_status_text}</p>
                                        <p>Drone: {task.drone_tag}</p>
                                      </div>
                                      <div className="task-image-container">
                                        <div className="image-with-label">
                                          <p className="image-label">Pilot Image</p>
                                          <img
                                            src={task.task_image || '/assets/images/no-plan-found.png'}
                                            alt="Pilot Image"
                                            className="task-image"
                                            onClick={() => openImage(task.task_image)}
                                          />
                                        </div>
                                        <div className="image-with-label">
                                          <p className="image-label">DJI Image</p>
                                          <img
                                            src={task.dji_image || '/assets/images/no-plan-found.png'}
                                            alt="DJI Image"
                                            className="task-image"
                                            onClick={() => openImage(task.dji_image)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="button-set-dayend">
                                      <button
                                        className="confirm-button-dayend"
                                        onClick={() => handleApproveClick(task.sub_tasks || [])}
                                        style={{
                                          backgroundColor:
                                            task.sub_tasks?.filter((sub) => sub.sub_task_reject_ops_room !== 'p').length ===
                                            task.sub_tasks?.length
                                              ? '#4DAA00FF'
                                              : task.sub_tasks?.filter((sub) => sub.sub_task_reject_ops_room !== 'p').length === 0
                                              ? '#AD4000FF'
                                              : '#004B71',
                                          color: 'white',
                                        }}
                                      >
                                        SubTasks ({task.sub_tasks?.filter((sub) => sub.sub_task_reject_ops_room !== 'p').length || 0}/
                                        {task.sub_tasks?.length || 0})
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {showSubtaskPopup && subtasks.length > 0 && (
                          <div className="subtask-popup-overlay" onClick={handleSubtaskPopupClose}>
                            <div className="subtask-popup-content" onClick={(e) => e.stopPropagation()}>
                              <button className="close-button" onClick={handleSubtaskPopupClose}>✖</button>
                              <div className="subtask-image-container">
                                <img
                                  src={subtasks[currentSubtaskIndex].sub_task_image || '/assets/images/no-plan-found.png'}
                                  alt="Subtask"
                                  className="subtask-popup-image"
                                  onClick={() => openImage(subtasks[currentSubtaskIndex].sub_task_image)}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/assets/images/no-plan-found.png';
                                  }}
                                />
                              </div>
                              <div className="subtask-details">
                                <div className="dayend-topapproval">
                                  <span><strong>OPS Room Approval:</strong></span>
                                  <span
                                    style={{
                                      color:
                                        subtasks[currentSubtaskIndex].sub_task_reject_ops_room === 'r'
                                          ? 'red'
                                          : subtasks[currentSubtaskIndex].sub_task_reject_ops_room === 'a'
                                          ? 'green'
                                          : subtasks[currentSubtaskIndex].sub_task_reject_ops_room === 'p'
                                          ? 'darkgray'
                                          : 'black',
                                    }}
                                  >
                                    {subtasks[currentSubtaskIndex].sub_task_reject_ops_room === 'r'
                                      ? 'Rejected'
                                      : subtasks[currentSubtaskIndex].sub_task_reject_ops_room === 'a'
                                      ? 'Approved'
                                      : subtasks[currentSubtaskIndex].sub_task_reject_ops_room === 'p'
                                      ? 'Pending'
                                      : 'Unknown'}
                                  </span>
                                </div>
                                <div className="subtask-status-details">
                                  {subtasks[currentSubtaskIndex].sub_task_reject_ops_room === 'r' && (
                                    <div className="rejection-info">
                                      <p><strong>Reason:</strong> {subtasks[currentSubtaskIndex].sub_task_reject_reason_text}</p>
                                      <p><strong>By:</strong> {subtasks[currentSubtaskIndex].sub_task_rejected_person_name}</p>
                                    </div>
                                  )}
                                  {subtasks[currentSubtaskIndex].sub_task_reject_ops_room === 'a' && (
                                    <div className="approval-info">
                                      <p><strong>Approval:</strong> {subtasks[currentSubtaskIndex].sub_task_reject_reason_text || 'Approved'}</p>
                                      <p><strong>By:</strong> {subtasks[currentSubtaskIndex].sub_task_rejected_person_name}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="subtask-detail-columns">
                                  <div className="subtask-detail-column">
                                    <p><strong>Subtask ID:</strong> {subtasks[currentSubtaskIndex].sub_task_id}</p>
                                    <p><strong>Sprayed Area:</strong> {subtasks[currentSubtaskIndex].sub_task_sprayedArea} Ha</p>
                                    <p><strong>Liters Used:</strong> {subtasks[currentSubtaskIndex].sub_task_sprayedLiters}</p>
                                    <p><strong>Status:</strong> {subtasks[currentSubtaskIndex].sub_task_status_text}</p>
                                  </div>
                                  <div className="subtask-detail-column">
                                    <p><strong>Obstacle Area:</strong> {subtasks[currentSubtaskIndex].sub_task_obstacleArea}</p>
                                    <p><strong>Margin Area:</strong> {subtasks[currentSubtaskIndex].sub_task_marginArea}</p>
                                    <p
                                      style={{
                                        color:
                                          subtasks[currentSubtaskIndex].sub_task_reject_team_lead === 'r'
                                            ? 'red'
                                            : subtasks[currentSubtaskIndex].sub_task_reject_team_lead === 'a'
                                            ? 'green'
                                            : subtasks[currentSubtaskIndex].sub_task_reject_team_lead === 'p'
                                            ? 'darkgray'
                                            : 'black',
                                      }}
                                    >
                                      <strong>Team Lead Approval:</strong>{' '}
                                      {subtasks[currentSubtaskIndex].sub_task_reject_team_lead === 'r'
                                        ? 'Rejected'
                                        : subtasks[currentSubtaskIndex].sub_task_reject_team_lead === 'a'
                                        ? 'Approved'
                                        : subtasks[currentSubtaskIndex].sub_task_reject_team_lead === 'p'
                                        ? 'Pending'
                                        : 'Unknown'}
                                    </p>
                                  </div>
                                </div>
                                <h4>Subtask {currentSubtaskIndex + 1} of {subtasks.length}</h4>
                              </div>
                              <div className="subtask-navigation">
                                {currentSubtaskIndex > 0 && (
                                  <button className="nav-button prev-button" onClick={handlePreviousSubtask}>
                                    Previous
                                  </button>
                                )}
                                {currentSubtaskIndex < subtasks.length - 1 ? (
                                  <button className="nav-button next-button" onClick={handleNextSubtask}>
                                    Next
                                  </button>
                                ) : (
                                  <button className="nav-button finish-button" onClick={handleSubtaskPopupClose}>
                                    Finish Review
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="placeholder-text">Select a mission to view details</div>
        )}
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
                  <FaUndo />
                </button>
                <button className="image_modal_btn rotate_right" onClick={rotateRight}>
                  <FaRedo />
                </button>
                <button className="image_modal_close" onClick={closeImage}>
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayEndView;