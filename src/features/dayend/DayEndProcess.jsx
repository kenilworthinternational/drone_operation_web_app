import React, { useState, useEffect } from 'react';
import '../../styles/dayendprocess.css';
import { FaCalendarAlt, FaRegArrowAltCircleRight, FaArrowCircleDown, FaArrowCircleUp, FaCheck, FaTimes, FaMinus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bars } from 'react-loader-spinner';
import { 
  getPlansUsingDate, 
  findPlanSummary, 
  displayTaskPlanAndField, 
  subTaskApproveorDecline, 
  submitDJIRecord, 
  displayRejectReason, 
  subTaskLogDetails, 
  opsApproval,
  getReportReasons,
  reportTask,
  viewTaskReport
} from '../../api/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="date-picker-input" />
    <FaCalendarAlt className="calendar-icon" />
  </div>
));

const DayEndProcess = () => {
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
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [currentField, setCurrentField] = useState(null);
  const [currentRejectingSubtask, setCurrentRejectingSubtask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [djiData, setDjiData] = useState({
    dji_image: null,
    dji_field_area: '',
    dji_spraying_area: '',
    dji_spraying_litres: '',
    dji_flying_duration: '',
    dji_no_of_flights: '',
  });
  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [showRejectionPopup, setShowRejectionPopup] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState('');
  // State for image modal
  const [selectedImage, setSelectedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  // Add state for crop image
  const [cropImage, setCropImage] = useState(null);
  const [cropImagePreview, setCropImagePreview] = useState("");
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReasons, setReportReasons] = useState([]);
  const [selectedReportReasons, setSelectedReportReasons] = useState([]);
  const [reportDescription, setReportDescription] = useState('');
  const [existingReportData, setExistingReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [multiSelectOpen, setMultiSelectOpen] = useState(false);

  // Helper function to update report data after submission
  const updateReportDataAfterSubmission = async (taskId) => {
    try {
      const reportRes = await viewTaskReport(taskId);
      if (reportRes && reportRes.flags && reportRes.flags.length > 0) {
        setExistingReportData(reportRes.flags[0]);
      }
    } catch (e) {
      console.error('Error fetching updated report data:', e);
    }
  };


  const handleContainerClick = (missionId) => {
    setSelectedMissionId(missionId); // Update selected mission ID
    handleMissionClick(missionId); // Call original handler
  };

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
    setSelectedMissionId(null);
    setExpandedDivisions([]);
    setExpandedFields([]);
    setFieldTasks({});
    setLoadingFields({});
    setLoadingMissions(true);
    try {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('en-CA');
      const response = await getPlansUsingDate(formattedDate);
      if (response.status === 'true' && Object.keys(response).length > 2) {
        const missionArray = Object.keys(response)
          .filter((key) => !isNaN(key))
          .map((key) => response[key]);
        
        // Filter plans based on user role
        let filteredMissionArray = missionArray;
        if (userData.job_role === 'ops' && userData.member_type === 'i' && userData.user_level === 'd') {
          // For ops users with specific criteria, only show their assigned plans
          filteredMissionArray = missionArray.filter(plan => plan.operator === userData.id);
        }
        
        const missionOptions = filteredMissionArray.map((plan) => ({
          id: plan.id,
          group: `${plan.estate}(${(plan.estate_id)}) - ${plan.area} Ha`,
          completed: plan.completed,
          activated: plan.activated,
          team_assigned: plan.team_assigned,
          operator_name: plan.operator_name,
          total_sub_task: plan.total_sub_task,
          total_sub_task_ops_room_approved_subs: plan.total_sub_task_ops_room_approved_subs,
          total_sub_task_ops_room_pending_subs: plan.total_sub_task_ops_room_pending_subs,
          total_sub_task_ops_room_rejected_subs: plan.total_sub_task_ops_room_rejected_subs,
        }));
        setMissions(missionOptions);
      } else {
        setMissions([]);
      }
    } catch (error) {
      toast.error('Failed to load missions. Please try again.');
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
      console.error('Error fetching mission details:', error);
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

  const handleTaskApproveClick = async (fieldId, taskData) => {
    try {
      // Find the correct field from the mission data
      let fieldInfo = null;
      if (selectedMission && selectedMission.divisions) {
        for (const division of selectedMission.divisions) {
          const field = division.checkedFields?.find(f => f.field_id === fieldId);
          if (field) {
            fieldInfo = field;
            break;
          }
        }
      }
      
      const freshData = await displayTaskPlanAndField(selectedMission.id, fieldId);
      const freshTask = freshData.tasks?.find((t) => t.task_id === taskData.task_id) || taskData;
      setCurrentTask({ ...freshTask, field_id: fieldId });
      setCurrentField(fieldInfo);
      setDjiData({
        dji_image: freshTask.dji_image || null,
        dji_field_area: freshTask.dji_field_area || '',
        dji_spraying_area: freshTask.dji_spraying_area || '',
        dji_spraying_litres: freshTask.dji_spraying_litres || '',
        dji_flying_duration: freshTask.dji_flying_duration || '',
        dji_no_of_flights: freshTask.dji_no_of_flights || '',
      });
      // Reset crop image states when opening a new task
      setCropImage(null);
      setCropImagePreview("");
      // Reset file inputs
      const cropImageInput = document.getElementById('crop-image-upload');
      const djiImageInput = document.getElementById('dji-image-upload');
      if (cropImageInput) cropImageInput.value = '';
      if (djiImageInput) djiImageInput.value = '';
      
      // Fetch existing report data to show button color immediately
      try {
        const reportRes = await viewTaskReport(freshTask.task_id);
        if (reportRes && reportRes.flags && reportRes.flags.length > 0) {
          const flag = reportRes.flags[0];
          setExistingReportData(flag);
        } else {
          setExistingReportData(null);
        }
      } catch (reportError) {
        console.error('Error fetching report data:', reportError);
        setExistingReportData(null);
      }
      
      setShowTaskPopup(true);
    } catch (error) {
      console.error('Error refreshing task data:', error);
      toast.error('Failed to load latest task data');
    }
  };

  const handleSubtaskPopupClose = () => {
    setShowSubtaskPopup(false);
    setSubtasks([]);
    setCurrentSubtaskIndex(0);
  };

  const handleTaskPopupClose = () => {
    setShowTaskPopup(false);
    setCurrentField(null);
    setCurrentTask(null);
    // Reset crop image states when closing the task popup
    setCropImage(null);
    setCropImagePreview("");
    // Reset file inputs
    const cropImageInput = document.getElementById('crop-image-upload');
    const djiImageInput = document.getElementById('dji-image-upload');
    if (cropImageInput) cropImageInput.value = '';
    if (djiImageInput) djiImageInput.value = '';
    // Reset existing report data when closing the task popup
    setExistingReportData(null);
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

  const StatusToggle = ({ status, onChange }) => {
    const getPosition = () => {
      if (status === 'a') return 'right';
      if (status === 'r') return 'left';
      return 'center';
    };

    const handleClick = async (newStatus) => {
      if (newStatus === 'r') {
        try {
          const reasonsResponse = await displayRejectReason();
          if (Array.isArray(reasonsResponse)) {
            setRejectionReasons(reasonsResponse);
            setCurrentRejectingSubtask(subtasks[currentSubtaskIndex]);
            setShowRejectionPopup(true);
          } else {
            console.warn('Unexpected response format:', reasonsResponse);
            toast.error('Invalid rejection reasons format');
          }
        } catch (error) {
          console.error('Rejection reasons fetch error:', error);
          toast.error('Failed to load rejection reasons');
        }
      }
      onChange(newStatus);
    };

    return (
      <div className="tri-state-toggle">
        <div className={`slider ${getPosition()}`} />
        <div className="toggle-options">
          <div
            className={`option left ${status === 'r' ? 'active' : ''}`}
            onClick={() => handleClick('r')}
          >
            <FaTimes className="icon" />
          </div>
          <div className="option center">
            <FaMinus className="icon" />
          </div>
          <div
            className={`option right ${status === 'a' ? 'active' : ''}`}
            onClick={() => handleClick('a')}
          >
            <FaCheck className="icon" />
          </div>
        </div>
      </div>
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDjiData((prev) => ({ ...prev, dji_image: file }));
    }
  };

  // Add handler for crop image upload
  const handleCropImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCropImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCropImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const formatNumber = (value, decimals = 2) => {
        const num = Number(String(value).replace(/,/g, ''));
        return isNaN(num) ? 0 : num.toFixed(decimals);
      };
      formData.append('task_id', currentTask.task_id);
      formData.append('dji_field_area', formatNumber(djiData.dji_field_area));
      formData.append('dji_spraying_area', formatNumber(djiData.dji_spraying_area));
      formData.append('dji_spraying_litres', formatNumber(djiData.dji_spraying_litres));
      formData.append('dji_flying_duration', formatNumber(djiData.dji_flying_duration));
      formData.append('dji_no_of_flights', formatNumber(djiData.dji_no_of_flights));
      if (djiData.dji_image instanceof File) {
        formData.append('image', djiData.dji_image);
      }
      // Only append crop image if a file is selected and is a File instance
      if (cropImage && cropImage instanceof File) {
        formData.append('image_crop', cropImage);
      }
      const response = await submitDJIRecord(formData);
      if (response.success) {
        toast.success('DJI data submitted successfully!');
        try {
          const updatedData = await displayTaskPlanAndField(selectedMission.id, currentTask.field_id);
          const previousTasks = fieldTasks[currentTask.field_id]?.tasks || [];
          const updatedTasks = updatedData.tasks?.map((task) => {
            const previousTask = previousTasks.find((t) => t.task_id === task.task_id);
            return {
              ...task,
              expanded: previousTask ? previousTask.expanded : false,
              task_image: task.task_image ? `${task.task_image}?${Date.now()}` : null,
              dji_image: task.dji_image ? `${task.dji_image}?${Date.now()}` : null,
            };
          }) || [];
          setFieldTasks((prev) => ({
            ...prev,
            [currentTask.field_id]: {
              tasks: updatedTasks,
              field_id: currentTask.field_id,
            },
          }));
        } catch (error) {
          console.error('Error refetching task data:', error);
        }
        handleTaskPopupClose();
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during submission.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RejectionReasonPopup = ({ currentSubtask, onClose, onSubmit }) => {
    if (!currentSubtask) {
      console.error('No subtask provided to RejectionReasonPopup');
      return null;
    }
    return (
      <div className="rejection-popup-overlay" onClick={onClose}>
        <div className="rejection-popup-content" onClick={(e) => e.stopPropagation()}>
          <h3>Select Rejection Reason</h3>
          <select
            value={selectedReason?.id || ''}
            onChange={(e) => setSelectedReason(rejectionReasons.find((r) => r.id == e.target.value))}
          >
            <option value="">Select a reason</option>
            {rejectionReasons.map((reason) => (
              <option key={reason.id} value={reason.id}>{reason.reason}</option>
            ))}
          </select>
          {selectedReason?.id === 1 && (
            <textarea
              placeholder="Enter custom reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
          <button
            onClick={async () => {
              if (!selectedReason) {
                toast.error('Please select a reason');
                return;
              }
              if (selectedReason.id === 1 && !customReason.trim()) {
                toast.error('Please enter a custom reason');
                return;
              }
              const result = await subTaskLogDetails(
                currentSubtask.sub_task_id,
                'r',
                selectedReason.id,
                selectedReason.id === 1 ? customReason : selectedReason.reason
              );
              if (result.success) {
                onSubmit({
                  ...currentSubtask,
                  sub_task_reject_reason_text: selectedReason.id === 1 ? customReason : selectedReason.reason,
                  sub_task_rejected_person_name: userData.name,
                  sub_task_reject_ops_room: 'r',
                });
                onClose();
              } else {
                toast.error(result.message);
              }
            }}
          >
            Submit Reason
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (showReportPopup && currentTask) {
      setReportLoading(true);
      setReportReasons([]);
      setSelectedReportReasons([]);
      setReportDescription('');
      setExistingReportData(null);
      Promise.all([
        getReportReasons(),
        viewTaskReport(currentTask.task_id)
      ]).then(([reasonsRes, reportRes]) => {
        if (reasonsRes && Array.isArray(reasonsRes)) {
          setReportReasons(reasonsRes);
          console.log('Fetched report reasons:', reasonsRes); // <-- Add this line
        }
        if (reportRes && reportRes.flags && reportRes.flags.length > 0) {
          const flag = reportRes.flags[0];
          setExistingReportData(flag);
          setReportDescription(flag.reason_text || '');
          setSelectedReportReasons(
            (flag.reasons || []).map(r => String(r.reason_id))
          );
        }
      }).finally(() => setReportLoading(false));
    } else if (!showReportPopup) {
      setReportReasons([]);
      setSelectedReportReasons([]);
      setReportDescription('');
      // Only reset existingReportData if task popup is also closed
      if (!showTaskPopup) {
        setExistingReportData(null);
      }
      setReportLoading(false);
      setReportSubmitting(false);
    }
    // eslint-disable-next-line
  }, [showReportPopup, currentTask, showTaskPopup]);

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
            [...missions]
              .sort((a, b) => {
                // Missions with activated === 0 go to the end
                if (a.activated === 0 && b.activated !== 0) return 1;
                if (a.activated !== 0 && b.activated === 0) return -1;
                // Missions with team_assigned === 0 go before activated === 0 but after others
                if (a.team_assigned !== 0 && b.team_assigned === 0) return -1;
                if (a.team_assigned === 0 && b.team_assigned !== 0) return 1;
                // Missions with pending subs (total_sub_task_ops_room_pending_subs !== 0) go first
                if (a.total_sub_task_ops_room_pending_subs !== 0 && b.total_sub_task_ops_room_pending_subs === 0) return -1;
                if (a.total_sub_task_ops_room_pending_subs === 0 && b.total_sub_task_ops_room_pending_subs !== 0) return 1;

                // Missions with rejected subs (total_sub_task_ops_room_rejected_subs !== 0) go next
                if (a.total_sub_task_ops_room_rejected_subs !== 0 && b.total_sub_task_ops_room_rejected_subs === 0) return -1;
                if (a.total_sub_task_ops_room_rejected_subs === 0 && b.total_sub_task_ops_room_rejected_subs !== 0) return 1;

                // For the rest, maintain original order or sort by another criterion (e.g., id)
                return a.id - b.id;
              })
              .map((mission) => (
                <div
                  key={mission.id}
                  className={`dayendprocess-mission-container ${mission.activated === 0
                    ? 'mission-canceled-byops'
                    : mission.team_assigned === 0
                      ? 'team-not-assigned'
                      : mission.completed === 1
                        ? 'completed-mission'
                        : 'incomplete-mission'
                    } ${selectedMissionId === mission.id ? 'clicked-one' : ''}`}
                  onClick={() => handleContainerClick(mission.id)}
                >
                  <div className="mission-container-left">
                    <p><strong>Estate:</strong> {mission.group} - ({mission.id})</p>
                    <p><strong>Ops: </strong>{mission.operator_name && mission.operator_name.trim() !== '' ? mission.operator_name : 'Not Assigned'}</p>
                    <p className="mission-status-opsdayend">
                      <span className="status-label-opsdayend">Ops Room:</span>
                      <span className="status-group-opsdayend">
                        <span className="status-badge-opsdayend approved-opsdayend">✓ {mission.total_sub_task_ops_room_approved_subs}</span>
                        <span className="status-badge-opsdayend pending-opsdayend">⏳ {mission.total_sub_task_ops_room_pending_subs}</span>
                        <span className="status-badge-opsdayend rejected-opsdayend">✗ {mission.total_sub_task_ops_room_rejected_subs}</span>
                      </span>
                    </p>
                    <div className="completion-checkbox" onClick={(e) => e.stopPropagation()}>
                      <label className="dir-opstext">
                        Dir-Ops Approval
                        <input
                          type="checkbox"
                          checked={mission.completed === 1}
                          disabled={userData.job_role !== 'dops' || mission.activated === 0 || mission.team_assigned === 0}
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
                    {mission.activated === 0 && (
                      <div className="deactivate_alert">Deactivated Plan</div>
                    )}
                    {mission.team_assigned === 0 && (
                      <div className="deactivate_alert">Team Not Assigned</div>
                    )}
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
                              <div key={`task-${task.task_id}-${taskIndex}`} className="task-details-dayend">
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
                                        <p>Field Area: {parseFloat(task.task_fieldArea || 0).toFixed(2)} Ha</p>
                                        <p>Sprayed Area: {parseFloat(task.task_sprayedArea || 0).toFixed(2)}</p>
                                        <p>Obstacle Area: {parseFloat(task.task_obstacleArea || 0).toFixed(2)}</p>
                                      </div>
                                      <div className="task-text">
                                        <p>Margin Area: {parseFloat(task.task_marginArea || 0).toFixed(2)}</p>
                                        <p>Liters Used: {parseFloat(task.task_sprayedLiters || 0).toFixed(2)}</p>
                                        <p>Status: {task.task_status_text}</p>
                                        <p>Pilot: {task.pilot}</p>
                                        <p>Drone: {task.drone_tag}</p>
                                      </div>
                                      <div className="task-image-container">
                                        <img
                                          src={task.task_image || '/assets/images/no-plan-found.png'}
                                          alt="Field task"
                                          className="task-image"
                                          onClick={() => openImage(task.task_image)}
                                        />
                                      </div>
                                    </div>
                                    <div className="button-set-dayend">
                                      <button
                                        className="confirm-button-dayend"
                                        onClick={() => handleTaskApproveClick(field.field_id, task)}
                                      >
                                        Task
                                      </button>
                                      <button
                                        className="confirm-button-dayend"
                                        onClick={() => handleApproveClick(task.sub_tasks || [])}
                                        style={{
                                          backgroundColor:
                                            task.sub_tasks?.filter((sub) => sub.sub_task_reject_ops_room !== 'p').length === task.sub_tasks?.length
                                              ? '#4DAA00FF'
                                              : task.sub_tasks?.filter((sub) => sub.sub_task_reject_ops_room !== 'p').length === 0
                                                ? '#AD4000FF'
                                                : '#004B71',
                                          color: 'white',
                                        }}
                                      >
                                        SubTasks (
                                        {task.sub_tasks?.filter((sub) => sub.sub_task_reject_ops_room !== 'p').length || 0}/
                                        {task.sub_tasks?.length || 0})
                                      </button>
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
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="placeholder-text">Select a mission to view details</div>
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
                <button className="image_modal_close" onClick={closeImage}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Subtask popup */}
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
                  <span><strong>Approval :</strong></span>
                  <StatusToggle
                    status={subtasks[currentSubtaskIndex].sub_task_reject_ops_room}
                    onChange={async (newStatus) => {
                      try {
                        const currentSubtask = subtasks[currentSubtaskIndex];
                        const updatedSubtasks = [...subtasks];
                        updatedSubtasks[currentSubtaskIndex].sub_task_reject_ops_room = newStatus;
                        setSubtasks(updatedSubtasks);
                        const result = await subTaskApproveorDecline(
                          currentSubtask.sub_task_id,
                          newStatus
                        );
                        if (newStatus === 'a') {
                          try {
                            const logResult = await subTaskLogDetails(
                              currentSubtask.sub_task_id,
                              'a',
                              0,
                              'Approved'
                            );
                            if (!logResult.success) {
                              throw new Error('Approval logging failed');
                            }
                            updatedSubtasks[currentSubtaskIndex] = {
                              ...currentSubtask,
                              sub_task_reject_reason_text: 'Approved',
                              sub_task_rejected_person_name: userData.name,
                              sub_task_reject_ops_room: newStatus,
                            };
                            setSubtasks(updatedSubtasks);
                          } catch (error) {
                            console.error('Approval logging error:', error);
                            setSubtasks([...subtasks]);
                            toast.error('Approval logging failed');
                          }
                        }
                        if (!result?.success) {
                          setSubtasks([...subtasks]);
                          toast.error(`Update failed: ${result?.message || 'Unknown error'}`);
                        }
                      } catch (error) {
                        console.error('Update error:', error);
                        setSubtasks([...subtasks]);
                        toast.error(`Update failed: ${error.message || 'Unknown error'}`);
                      }
                    }}
                  />
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
                    <p><strong>Field Area:</strong> {subtasks[currentSubtaskIndex].sub_task_fieldArea} Ha</p>
                    <p><strong>Liters Used:</strong> {subtasks[currentSubtaskIndex].sub_task_sprayedLiters}</p>
                    <p><strong>Status:</strong> {subtasks[currentSubtaskIndex].sub_task_status_text}</p>
                  </div>
                  <div className="subtask-detail-column">
                    <p><strong>Obstacle Area:</strong> {subtasks[currentSubtaskIndex].sub_task_obstacleArea} Ha</p>
                    <p><strong>Sprayed Area:</strong> {subtasks[currentSubtaskIndex].sub_task_sprayedArea} Ha</p>
                    <p><strong>Margin Area:</strong> {subtasks[currentSubtaskIndex].sub_task_marginArea} Ha</p>
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
        {/* Rejection popup */}
        {showRejectionPopup && (
          <RejectionReasonPopup
            currentSubtask={currentRejectingSubtask}
            onClose={() => {
              setShowRejectionPopup(false);
              setSelectedReason(null);
              setCustomReason('');
            }}
            onSubmit={(updatedSubtask) => {
              const updatedSubtasks = subtasks.map((st) =>
                st.sub_task_id === updatedSubtask.sub_task_id
                  ? {
                    ...st,
                    sub_task_reject_reason_text: updatedSubtask.sub_task_reject_reason_text,
                    sub_task_rejected_person_name: updatedSubtask.sub_task_rejected_person_name,
                    sub_task_reject_ops_room: 'r',
                  }
                  : st
              );
              setSubtasks(updatedSubtasks);
            }}
          />
        )}
        {showTaskPopup && currentTask && (
          <div className="task-popup-overlay" onClick={handleTaskPopupClose}>
            <div className="task-popup-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={handleTaskPopupClose}>✖</button>
              <div className="task-popup-header">
                <div className="task-popup-header-top">
                <h3>{currentField?.field_name || 'Unknown Field'} - TaskID: {currentTask.task_id} | Field Area: {currentField?.field_area || currentTask.task_fieldArea || 'N/A'} Ha</h3>
                <button
                  className="submit-button2"
                  style={{
                    background: existingReportData
                      ? existingReportData.status === 'a'
                        ? '#2fc653'
                        : existingReportData.status === 'r'
                        ? '#ff4d4f'
                        : existingReportData.status === 'p'
                        ? '#948F62FF'
                        : '#004B71'
                      : '#004B71',
                    color: '#fff',
                    border: existingReportData ? '1.5px solid #888' : undefined,
                  }}
                  onClick={() => setShowReportPopup(true)}
                >
                  Report
                </button>
                </div>
                
                
                <div className="task-top-line">
                  <span className="status-badge">Status: {currentTask.task_status_text}</span>
                  <span>Drone: {currentTask.drone_tag}</span>
                  <span>Pilot: {currentTask.pilot}</span>
                  <span>Mobile: {currentTask.mobile_no}</span>
                </div>
              </div>
              <div className="task-popup-body">
              <div className="image-card image-card-full">
                    <h4>Task Image</h4>
                    <img
                      src={currentTask.task_image || '/assets/images/no-plan-found.png'}
                      alt="Task"
                      className="popup-image"
                      onClick={() => openImage(currentTask.task_image)}
                    />
                  </div>
                <div className="data-row">
                  
                  <div className="image-card2">
                    <h4>DJI Image</h4>
                    <img
                      src={
                        djiData.dji_image
                          ? (typeof djiData.dji_image === 'string'
                              ? djiData.dji_image
                              : URL.createObjectURL(djiData.dji_image))
                          : '/assets/images/no-plan-found.png'
                      }
                      alt="DJI"
                      className="popup-image"
                      onClick={() =>
                        openImage(
                          typeof djiData.dji_image === 'string'
                            ? djiData.dji_image
                            : URL.createObjectURL(djiData.dji_image)
                        )
                      }
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="dji-image-upload"
                      style={{ marginTop: 8 }}
                    />
                  </div>
                  <div className="image-card2">
                    <h4>Crop Image</h4>
                    <img
                      src={
                        cropImagePreview ||
                        currentTask.image_crop ||
                        '/assets/images/no-plan-found.png'
                      }
                      alt="Crop"
                      className="popup-image"
                      onClick={() =>
                        openImage(
                          cropImagePreview ||
                          currentTask.image_crop ||
                          '/assets/images/no-plan-found.png'
                        )
                      }
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCropImageUpload}
                      id="crop-image-upload"
                      style={{ marginTop: 8 }}
                    />
                  </div>
                </div>
                <div className="data-grid">
                  <div className="data-row">
                    <div className="data-item">
                      <label>Pilot Field Area (Ha):</label>
                      <input
                        type="number"
                        value={currentTask.task_fieldArea}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="data-item">
                      <label>DJI Field Area (Ha):</label>
                      <input
                        type="number"
                        value={djiData.dji_field_area}
                        onChange={(e) =>
                          setDjiData((prev) => ({
                            ...prev,
                            dji_field_area: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="data-row">
                    <div className="data-item">
                      <label>Pilot Sprayed Area (Ha):</label>
                      <input
                        type="number"
                        value={currentTask.task_sprayedArea}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="data-item">
                      <label>DJI Spraying Area (Ha):</label>
                      <input
                        type="number"
                        value={djiData.dji_spraying_area}
                        onChange={(e) =>
                          setDjiData((prev) => ({
                            ...prev,
                            dji_spraying_area: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="data-row">
                    <div className="data-item">
                      <label>Pilot Sprayed Liters:</label>
                      <input
                        type="number"
                        value={currentTask.task_sprayedLiters}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="data-item">
                      <label>DJI Sprayed Liters:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={djiData.dji_spraying_litres}
                        onChange={(e) =>
                          setDjiData((prev) => ({
                            ...prev,
                            dji_spraying_litres: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="data-row">
                    <div className="data-item">
                      <label>DJI Flying Duration (mins):</label>
                      <input
                        type="number"
                        value={djiData.dji_flying_duration}
                        onChange={(e) =>
                          setDjiData((prev) => ({
                            ...prev,
                            dji_flying_duration: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="data-item">
                      <label>DJI No of Flights:</label>
                      <input
                        type="number"
                        value={djiData.dji_no_of_flights}
                        onChange={(e) =>
                          setDjiData((prev) => ({
                            ...prev,
                            dji_no_of_flights: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="data-row">
                    <div className="data-item">
                      <button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={
                          isSubmitting ||
                          !djiData.dji_flying_duration ||
                          !djiData.dji_no_of_flights ||
                          !djiData.dji_field_area ||
                          !djiData.dji_spraying_litres ||
                          !djiData.dji_spraying_area
                        }
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit DJI Data'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {showReportPopup && currentTask && (
          <div className="task-popup-overlay" onClick={() => setShowReportPopup(false)}>
            <div className="task-popup-content" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
              <button className="close-button" onClick={() => setShowReportPopup(false)}>✖</button>
              <h3>Report Task - ID: {currentTask.task_id}</h3>
              {reportLoading ? (
                <div style={{ textAlign: 'center', margin: '32px 0' }}>Loading...</div>
              ) : (
                <>
                  {existingReportData ? (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 600 }}>Explanation:</label>
                        <textarea
                          value={reportDescription}
                          onChange={e => setReportDescription(e.target.value)}
                          rows={3}
                          style={{ width: '100%', resize: 'vertical', marginTop: 4 }}
                          placeholder="Describe the issue..."
                        />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 600 }}>Select Reason(s):</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, maxWidth: 320 }}>
                          {reportReasons.map((r) => {
                            const selected = selectedReportReasons.includes(String(r.id));
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => {
                                  setSelectedReportReasons(prev =>
                                    selected ? prev.filter(id => id !== String(r.id)) : [...prev, String(r.id)]
                                  );
                                }}
                                style={{
                                  padding: '6px 16px',
                                  borderRadius: 16,
                                  border: selected ? '1.5px solid #2fc653' : '1px solid #ccc',
                                  background: selected ? '#eaffea' : '#fff',
                                  color: '#222',
                                  fontWeight: 500,
                                  fontSize: 15,
                                  cursor: 'pointer',
                                  outline: 'none',
                                  transition: 'background 0.15s, border 0.15s',
                                  boxShadow: selected ? '0 1px 4px #2fc65322' : 'none',
                                  minWidth: 80,
                                }}
                              >
                                {r.reason}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        className="submit-button"
                        style={{ width: '100%' }}
                        onClick={async () => {
                          setReportSubmitting(true);
                          try {
                            const res = await reportTask(
                              currentTask.task_id,
                              reportDescription,
                              selectedReportReasons
                            );
                            if (res && res.status === 'true') {
                              toast.success('Report submitted successfully');
                              await updateReportDataAfterSubmission(currentTask.task_id);
                              setShowReportPopup(false);
                            } else {
                              toast.error('Failed to submit report');
                            }
                          } catch (err) {
                            toast.error('Error submitting report');
                          } finally {
                            setReportSubmitting(false);
                          }
                        }}
                        disabled={
                          reportSubmitting ||
                          !reportDescription.trim() ||
                          selectedReportReasons.length === 0
                        }
                      >
                        {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 600 }}>Select Reason(s):</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, maxWidth: 320 }}>
                          {reportReasons.map((r) => {
                            const selected = selectedReportReasons.includes(String(r.id));
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => {
                                  setSelectedReportReasons(prev =>
                                    selected ? prev.filter(id => id !== String(r.id)) : [...prev, String(r.id)]
                                  );
                                }}
                                style={{
                                  padding: '6px 16px',
                                  borderRadius: 16,
                                  border: selected ? '1.5px solid #2fc653' : '1px solid #ccc',
                                  background: selected ? '#eaffea' : '#fff',
                                  color: '#222',
                                  fontWeight: 500,
                                  fontSize: 15,
                                  cursor: 'pointer',
                                  outline: 'none',
                                  transition: 'background 0.15s, border 0.15s',
                                  boxShadow: selected ? '0 1px 4px #2fc65322' : 'none',
                                  minWidth: 80,
                                }}
                              >
                                {r.reason}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 600 }}>Explanation:</label>
                        <textarea
                          value={reportDescription}
                          onChange={e => setReportDescription(e.target.value)}
                          rows={3}
                          style={{ width: '100%', resize: 'vertical', marginTop: 4 }}
                          placeholder="Describe the issue..."
                        />
                      </div>
                      <button
                        className="submit-button"
                        style={{ width: '100%' }}
                        onClick={async () => {
                          setReportSubmitting(true);
                          try {
                            const res = await reportTask(
                              currentTask.task_id,
                              reportDescription,
                              selectedReportReasons
                            );
                            if (res && res.status === 'true') {
                              toast.success('Report submitted successfully');
                              await updateReportDataAfterSubmission(currentTask.task_id);
                              setShowReportPopup(false);
                            } else {
                              toast.error('Failed to submit report');
                            }
                          } catch (err) {
                            toast.error('Error submitting report');
                          } finally {
                            setReportSubmitting(false);
                          }
                        }}
                        disabled={
                          reportSubmitting ||
                          !reportDescription.trim() ||
                          selectedReportReasons.length === 0
                        }
                      >
                        {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default DayEndProcess;