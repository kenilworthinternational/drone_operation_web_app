import React, { useReducer, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bars } from 'react-loader-spinner';
import { VscDebugRestart } from 'react-icons/vsc';
import { FiPhone, FiMail } from 'react-icons/fi';
import {
  getUpdateMissionDetails,
  divisionStateList,
  submitUpdatePlan,
  submitPlan,
  getRescheduleMissionDetails,
  findPlanByID,
  updateDate,
  estateListDetails,
  PilotDetaisPlan,
  deactivatePlan,
} from '../../api/api';
import '../../styles/calendarwidget.css';

// State reducer for managing complex state
const initialState = {
  mode: 'view', // 'view', 'update', 'reschedule'
  divisionOptions: [],
  selectedFields: new Set(),
  totalExtent: 0,
  selectedEstate: null,
  selectedMissionType: null,
  selectedCropType: null,
  selectedDate: null,
  originalSelectedFields: new Set(),
  minimumPlanSize: 0, // <-- add
  maximumPlanSize: 0, // <-- add
};

const userData = JSON.parse(localStorage.getItem('userData'));
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_MISSION_DETAILS':
      return {
        ...state,
        divisionOptions: action.payload.divisionOptions,
        selectedFields: action.payload.selectedFields,
        totalExtent: action.payload.totalExtent,
        selectedEstate: action.payload.selectedEstate,
        selectedMissionType: action.payload.selectedMissionType,
        selectedCropType: action.payload.selectedCropType,
        selectedDate: action.payload.selectedDate,
        originalSelectedFields: action.payload.originalSelectedFields || state.originalSelectedFields,
        minimumPlanSize: action.payload.minimumPlanSize ?? 0,
        maximumPlanSize: action.payload.maximumPlanSize ?? 0,
      };
    case 'TOGGLE_FIELD':
      const updatedSelectedFields = new Set(state.selectedFields);
      if (updatedSelectedFields.has(action.payload)) {
        updatedSelectedFields.delete(action.payload);
      } else {
        updatedSelectedFields.add(action.payload);
      }
      
      // Calculate updated total extent and division totals based on selected fields
      const updatedTotalExtent = state.divisionOptions.reduce((total, division) => {
        const divisionTotal = (division.fields || []).reduce(
          (sum, field) => {
            // Only add to total if field is selected
            if (updatedSelectedFields.has(field.field_id)) {
              return sum + field.field_area;
            }
            return sum;
          },
          0
        );
        
        // Update the division's total
        division.divisionTotal = parseFloat(divisionTotal.toFixed(2));
        
        return total + divisionTotal;
      }, 0);
      
      return {
        ...state,
        selectedFields: updatedSelectedFields,
        totalExtent: parseFloat(updatedTotalExtent.toFixed(2)),
        divisionOptions: [...state.divisionOptions], // Force re-render with updated division totals
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const CalendarWidget = ({ tasksData = [], currentMonth, onTaskUpdate, calendarSection = 'default' }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRescheduledDate, setSelectedRescheduledDate] = useState(null);
  const [estateDetails, setEstateDetails] = useState(null);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [contactPopupData, setContactPopupData] = useState(null);
  const [showPilotDetailsPopup, setShowPilotDetailsPopup] = useState(false);
  const [pilotDetailsData, setPilotDetailsData] = useState(null);
  const [pilotDetailsLoading, setPilotDetailsLoading] = useState(false);

  // Add ref to track scroll position
  const popupContentRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Save scroll position when in update mode
  useEffect(() => {
    if (state.mode === 'update' && popupContentRef.current) {
      const saveScrollPosition = () => {
        scrollPositionRef.current = popupContentRef.current.scrollTop;
      };

      const restoreScrollPosition = () => {
        if (popupContentRef.current && scrollPositionRef.current > 0) {
          popupContentRef.current.scrollTop = scrollPositionRef.current;
        }
      };

      // Save scroll position before any potential re-render
      saveScrollPosition();

      // Restore scroll position after re-render
      const timeoutId = setTimeout(restoreScrollPosition, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [state.selectedFields, state.mode]);

  // Enhanced checkbox change handler to preserve scroll position
  const handleCheckboxChange = (fieldId) => {
    // Save current scroll position before the change
    if (popupContentRef.current) {
      scrollPositionRef.current = popupContentRef.current.scrollTop;
    }

    // Dispatch the action
    dispatch({ type: 'TOGGLE_FIELD', payload: fieldId });

    // Restore scroll position after the state update
    setTimeout(() => {
      if (popupContentRef.current && scrollPositionRef.current > 0) {
        popupContentRef.current.scrollTop = scrollPositionRef.current;
      }
    }, 0);
  };

  // Fetch selected fields when a task is clicked (for view mode)
  useEffect(() => {
    if (selectedTask) {
      fetchMissionDetails(selectedTask, 'view');
      fetchEstateDetails(selectedTask.estate_id);
    }
  }, [selectedTask]);

  // Function to fetch estate details
  const fetchEstateDetails = async (estateId) => {
    try {
      console.log('Fetching estate details for estateId:', estateId);
      const response = await estateListDetails(estateId);
      console.log('Estate details response:', response);
      setEstateDetails(response);
    } catch (error) {
      console.error('Error fetching estate details:', error);
      setEstateDetails(null);
    }
  };

  // Function to fetch pilot details
  const fetchPilotDetails = async (taskId) => {
    try {
      setPilotDetailsLoading(true);
      console.log('Fetching pilot details for taskId:', taskId);
      const response = await PilotDetaisPlan(taskId);
      console.log('Pilot details response:', response);
      setPilotDetailsData(response);
    } catch (error) {
      console.error('Error fetching pilot details:', error);
      setPilotDetailsData(null);
    } finally {
      setPilotDetailsLoading(false);
    }
  };

  // Process tasks and create reschedule map
  const rescheduleMap = new Map();
  tasksData.forEach((task) => {
    if (task.mission_id !== 0) {
      rescheduleMap.set(task.id, task.mission_id);
    }
  });

  const groupedTasks = tasksData.reduce((acc, task) => {
    const { id, date, estate, area, flag, mission_id, completed, team_assigned, activated, manager_approval, pilots_assigned } = task;
    const rescheduledFromId = rescheduleMap.get(id);
    const rescheduledToId = [...rescheduleMap.entries()].find(([, originalId]) => originalId === id)?.[0];

    // Store estate and area separately for multi-line display
    let taskEstate = estate;
    let taskArea = `${area} Ha`;
    let taskBackgroundColor = null;
    const flagColors = {
      rp: '#cdd3ff', // Rescheduled plan
      ap: '#eed7a1', // Active plan
      np: '#e3ffd7', // New plan
    };

    if (flag === 'ap') {
      taskBackgroundColor = rescheduledToId || rescheduledFromId ? flagColors.rp : flagColors.ap;
      if (rescheduledToId) taskEstate = `⌚ ${taskEstate}`;
    } else if (flag === 'np') {
      taskBackgroundColor = rescheduledToId ? flagColors.np : flagColors.np;
      if (rescheduledToId) taskEstate = `⌚ ${taskEstate}`;
    }

    let statusColor = '#BEBEBE'; // Default Gray
    if (activated === 0) statusColor = '#BEBEBE';
    else if (completed === 1) statusColor = '#1EFF00';
    else if (manager_approval === 0) statusColor = '#FFE656';
    else if (team_assigned === 0) statusColor = '#FF7300';
    else if (pilots_assigned === 0) statusColor = '#000000FF';
    else if (date < new Date().toLocaleDateString('en-CA') && completed === 0 && pilots_assigned === 1) statusColor = '#00CCFFFF';
    else statusColor = '#0245FFFF';

    if (!acc[date]) acc[date] = [];
    acc[date].push({ ...task, estate: taskEstate, area: taskArea, backgroundColor: taskBackgroundColor, statusColor });
    return acc;
  }, {});

  // Fetch mission details
  const fetchMissionDetails = async (task, mode) => {
    try {
      setLoading(true);
      setError(null);
      
      let divisions = [];
      let selectedFieldIds = new Set();
      let totalExtent = 0;
      let minimumPlanSize = 0;
      let maximumPlanSize = 0;

      if (mode === 'view') {
        // Use findPlanByID for view mode to get the complete plan structure with field status
        const planResponse = await findPlanByID(task.id);
        
        if (planResponse && planResponse.divisions) {
          divisions = planResponse.divisions.map(division => ({
            division_id: division.divisionId,
            division_name: division.divisionName,
            fields: division.checkedFields.map(field => ({
              field_id: field.field_id,
              field_name: field.field_name,
              field_area: field.field_area,
              activated: field.activated,
              recen_if_no_text: field.recen_if_no_text || '',
              status: field.status,
              status_text: field.status_text,
              manager_approval: field.manager_approval,
              pilots_allocated: field.pilots_allocated,
              field_chemicals: field.field_chemicals,
              field_pilots: field.field_pilots,
              field_drones: field.field_drones
            }))
          }));

          // Calculate totals and selected fields for view mode
          divisions.forEach(division => {
            division.divisionTotal = 0;
            division.fields.forEach(field => {
              if (field.activated === 1) {
                selectedFieldIds.add(field.field_id);
                division.divisionTotal += field.field_area;
                totalExtent += field.field_area;
              }
              // Don't add activated: 0 fields to the total
            });
            division.divisionTotal = parseFloat(division.divisionTotal.toFixed(2));
          });

          totalExtent = parseFloat(totalExtent.toFixed(2));
          minimumPlanSize = planResponse.minimumPlanSize || 0;
          maximumPlanSize = planResponse.maximumPlanSize || 0;
        }
      } else {
        // Use original approach for update and reschedule modes
        const payload = { id: task.id };
        const updateMissionResponse = mode === 'update' 
          ? await getUpdateMissionDetails(payload)
          : await getRescheduleMissionDetails(payload);

        selectedFieldIds = new Set((updateMissionResponse?.divisions ?? []).flatMap(
          (division) => division.checkedFields?.map((field) => field.field_id) ?? []
        ));
        
        const divisionsResponse = await divisionStateList(task.estate_id);

        if (divisionsResponse && typeof divisionsResponse === 'object') {
          minimumPlanSize = divisionsResponse.minimum_plan_size || 0;
          maximumPlanSize = divisionsResponse.maximum_plan_size || 0;
          divisions = Object.keys(divisionsResponse)
            .filter(key => !isNaN(key))
            .map(key => divisionsResponse[key]);
        }
        
        if (Array.isArray(divisions)) {
          totalExtent = divisions.reduce((total, division) => {
            const divisionTotal =
              division.fields?.reduce(
                (sum, field) => (selectedFieldIds.has(field.field_id) ? sum + field.field_area : sum),
                0
              ) || 0;
            division.divisionTotal = parseFloat(divisionTotal.toFixed(2));
            return total + divisionTotal;
          }, 0);
          
          // For update mode, we need to show all fields that are available for selection
          // The selectedFieldIds already contains the fields that should be selected
        }
      }

      // Fetch estate details including manager and other contacts
      const estateDetailsResponse = await estateListDetails(task.estate_id);
      if (estateDetailsResponse) {
        setEstateDetails(estateDetailsResponse);
      }

      dispatch({
        type: 'SET_MISSION_DETAILS',
        payload: {
          divisionOptions: divisions,
          selectedFields: selectedFieldIds,
          totalExtent: totalExtent !== 0 ? parseFloat(totalExtent.toFixed(2)) : state.totalExtent,
          selectedEstate: task.estate_id,
          selectedMissionType: task.mission_type,
          selectedCropType: task.crop_type,
          selectedDate: task.date,
          originalSelectedFields: mode === 'reschedule' ? selectedFieldIds : state.originalSelectedFields,
          minimumPlanSize,
          maximumPlanSize,
        },
      });
      dispatch({ type: 'SET_MODE', payload: mode });
    } catch (error) {
      setError('Error fetching mission details');
      console.error('Error fetching mission details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sub-components
  const RescheduleTooltip = ({ taskId, missionId, backgroundColor }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [pickedDate, setPickedDate] = useState(null);

    const handleMouseEnter = async () => {
      setIsHovered(true);
      try {
        const response = await findPlanByID(missionId);
        setPickedDate(response?.pickedDate || 'Not available');
      } catch (error) {
        console.error('Error:', error);
        setPickedDate('Error');
      }
    };

    return (
      <div
        className="icon-wrapper"
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="task-flag-indicator" style={{ backgroundColor }} />
        {missionId !== 0 && isHovered && (
          <div className="tooltip">
            {pickedDate || 'Loading...'}
          </div>
        )}
      </div>
    );
  };

  const ViewDivisionView = ({ divisionName, fields, divisionTotal, selectedFieldsSet }) => {
    // Show all fields to display activated status
    const allFields = fields || [];
    const activeFields = allFields.filter((field) => field.activated === 1);
    const inactiveFields = allFields.filter((field) => field.activated === 0);
    
    return (
      <div className="division-view">
        <h3 className="division-header">{divisionName} - {divisionTotal} Ha</h3>
        <div className="fields-grid">
          {allFields.length > 0 ? (
            <>
              {/* Active Fields */}
              {activeFields.map((field) => (
                <div key={field.field_id} className="field-item field-active">
                  <span>{field.field_name} - {field.field_area} Ha</span>
                </div>
              ))}
              
              {/* Inactive Fields */}
              {inactiveFields.map((field) => (
                <div 
                  key={field.field_id} 
                  className="field-item field-inactive"
                  title={field.recen_if_no_text || 'Field is not activated'}
                >
                  <span>{field.field_name} - {field.field_area} Ha</span>
                  {field.recen_if_no_text && (
                    <div className="field-reason">{field.recen_if_no_text}</div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <p>No fields available.</p>
          )}
        </div>
      </div>
    );
  };

  const UpdateDivisionView = ({ divisionName, fields, handleCheckboxChange, divisionTotal, selectedFieldsSet }) => {
    // For update mode, show all fields that are available for selection
    // If fields don't have 'activated' property (from original API), show all fields as selectable
    const allFields = fields || [];
    const hasActivatedProperty = allFields.length > 0 && 'activated' in allFields[0];
    
    if (hasActivatedProperty) {
      // If we have activated property (from findPlanByID), filter accordingly
      const activeFields = allFields.filter((field) => field.activated === 1) || [];
      const inactiveFields = allFields.filter((field) => field.activated === 0) || [];
      
      return (
        <div className="division-view">
          <h3 className="division-header">{divisionName} - {divisionTotal} Ha</h3>
          <div className="fields-grid">
            {/* Active Fields - can be selected */}
            {activeFields.map((field) => (
              <div key={field.field_id} className="field-item field-active">
                <input
                  type="checkbox"
                  checked={selectedFieldsSet.has(field.field_id)}
                  onChange={() => handleCheckboxChange(field.field_id)}
                  aria-label={`Select ${field.field_name}`}
                />
                <label>{field.field_name} - {field.field_area} Ha</label>
              </div>
            ))}
            
            {/* Inactive Fields - cannot be selected */}
            {inactiveFields.map((field) => (
              <div 
                key={field.field_id} 
                className="field-item field-inactive"
                title={field.recen_if_no_text || 'Field is not activated'}
              >
                <input
                  type="checkbox"
                  checked={false}
                  disabled={true}
                  aria-label={`${field.field_name} is not available for selection`}
                />
                <label className="disabled-label">{field.field_name} - {field.field_area} Ha</label>
                {field.recen_if_no_text && (
                  <div className="field-reason">{field.recen_if_no_text}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // If no activated property (from original API), show all fields as selectable
      return (
        <div className="division-view">
          <h3 className="division-header">{divisionName} - {divisionTotal} Ha</h3>
          <div className="fields-grid">
            {allFields.map((field) => (
              <div key={field.field_id} className="field-item">
                <input
                  type="checkbox"
                  checked={selectedFieldsSet.has(field.field_id)}
                  onChange={() => handleCheckboxChange(field.field_id)}
                  aria-label={`Select ${field.field_name}`}
                />
                <label>{field.field_name} - {field.field_area} Ha</label>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const RescheduleDivisionView = ({ divisionName, fields, handleCheckboxChange, divisionTotal, selectedFieldsSet }) => {
    const filteredFields = fields?.filter((field) => selectedFieldsSet.has(field.field_id)) || [];
    return (
      <div className="division-view">
        <h3 className="division-header">{divisionName} - {divisionTotal} Ha</h3>
        <div className="fields-grid">
          {filteredFields.map((field) => (
            <div key={field.field_id} className="field-item">
              <input
                type="checkbox"
                checked={true}
                onChange={() => handleCheckboxChange(field.field_id)}
                aria-label={`Select ${field.field_name}`}
              />
              <label>{field.field_name} - {field.field_area} Ha</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRescheduleDatePicker = () => (
    <div className="reschedule-date-picker">
      <label>Pick a new date for reschedule:</label>
      <DatePicker
        selected={selectedRescheduledDate}
        onChange={(date) => setSelectedRescheduledDate(date)}
        minDate={new Date()}
        dateFormat="yyyy-MM-dd"
        className="date-picker-input"
        placeholderText="Select a date"
      />
    </div>
  );

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    dispatch({ type: 'RESET' });
    setSelectedRescheduledDate(null);
  };

  const handleClosePopup = () => {
    setSelectedTask(null);
    setEstateDetails(null);
    setShowContactPopup(false);
    setContactPopupData(null);
    dispatch({ type: 'RESET' });
  };

  const handleContactClick = (contactData) => {
    setContactPopupData(contactData);
    setShowContactPopup(true);
  };

  const handleViewAllContacts = () => {
    setContactPopupData(null); // Clear any previous contact data
    setShowContactPopup(true);
  };

  const handleCloseContactPopup = () => {
    setShowContactPopup(false);
    setContactPopupData(null);
  };

  const handlePilotDetailsClick = async () => {
    if (selectedTask && selectedTask.id) {
      try {
        await fetchPilotDetails(selectedTask.id);
        setShowPilotDetailsPopup(true);
      } catch (error) {
        console.error('Error fetching pilot details:', error);
        // You could add a toast notification here if needed
      }
    }
  };

  const handleClosePilotDetailsPopup = () => {
    setShowPilotDetailsPopup(false);
    setPilotDetailsData(null);
  };

  const handleUpdateClick = () => {
    if (selectedTask) {
      fetchMissionDetails(selectedTask, 'update');
    }
  };

  const handleRescheduleClick = () => {
    if (state.mode === 'reschedule') {
      // When switching back to view mode, refetch the data using findPlanByID
      fetchMissionDetails(selectedTask, 'view');
      setSelectedRescheduledDate(null);
    } else if (selectedTask) {
      fetchMissionDetails(selectedTask, 'reschedule');
    }
  };

  const handleConfirm = async () => {
    if (loading || state.selectedFields.size === 0) {
      alert('Please select at least one field.');
      return;
    }
    setLoading(true);
    const divisionsWithFields = state.divisionOptions
      .map((division) => {
        const checkedFields = division.fields
          .filter((field) => state.selectedFields.has(field.field_id))
          .map((field) => ({
            field_id: field.field_id,
            field_name: field.field_name,
            field_area: field.field_area,
          }));
        return checkedFields.length > 0 ? { divisionId: division.division_id, checkedFields } : null;
      })
      .filter(Boolean);

    if (!divisionsWithFields.length) {
      console.log('No fields selected.');
      setLoading(false);
      return;
    }

    const missionData = {
      missionId: selectedTask.id,
      estateId: state.selectedEstate,
      missionTypeId: state.selectedMissionType,
      cropTypeId: state.selectedCropType,
      totalExtent: state.totalExtent.toFixed(2),
      pickedDate: state.selectedDate,
      divisions: divisionsWithFields,
    };

    try {
      const result = await submitUpdatePlan(missionData);
      if (result.success) {
        alert('Update successful!');
        // Refresh the task data to show updated values in calendar
        if (selectedTask && onTaskUpdate) {
          const updatedTask = { ...selectedTask, area: state.totalExtent };
          onTaskUpdate(updatedTask);
        } else {
          // If no callback provided, reload the page to refresh calendar data
          window.location.reload();
        }
      } else {
        alert(`Update failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Update Error:', error);
      alert('An error occurred while updating.');
    } finally {
      setLoading(false);
      handleClosePopup();
    }
  };

  const handleRescheduleConfirm = async () => {
    if (!selectedRescheduledDate || loading || state.selectedFields.size === 0) {
      alert(selectedRescheduledDate ? 'Please select at least one field.' : 'Please select a new date.');
      return;
    }

    setLoading(true);
    const currentFields = Array.from(state.selectedFields);
    const originalFields = Array.from(state.originalSelectedFields);
    // const fieldsUnchanged =
    //   currentFields.length === originalFields.length && currentFields.every((field) => originalFields.includes(field));

    // if (fieldsUnchanged) {
    //   try {
    //     const result = await updateDate(selectedTask.id, selectedRescheduledDate.toLocaleDateString('en-CA'));
    //     alert(result?.success ? 'Date updated successfully!' : result?.message || 'Date update failed');
    //   } catch (error) {
    //     console.error('Date Update Error:', error);
    //     alert('An error occurred while updating date.');
    //   } finally {
    //     setLoading(false);
    //     handleClosePopup();
    //   }
    //   return;
    // }

    const divisionsWithFields = state.divisionOptions
      .map((division) => {
        const checkedFields = division.fields
          .filter((field) => state.selectedFields.has(field.field_id))
          .map((field) => ({
            field_id: field.field_id,
            field_name: field.field_name,
            field_area: field.field_area,
          }));
        return checkedFields.length > 0 ? { divisionId: division.division_id, checkedFields } : null;
      })
      .filter(Boolean);

    const submissionRescheduleData = {
      flag: 'ap',
      missionId: selectedTask.id,
      groupId: selectedTask.group_id,
      plantationId: selectedTask.plantation_id,
      regionId: selectedTask.region_id,
      estateId: state.selectedEstate,
      missionTypeId: state.selectedMissionType,
      cropTypeId: state.selectedCropType,
      totalExtent: state.totalExtent.toFixed(2),
      pickedDate: selectedRescheduledDate.toLocaleDateString('en-CA'),
      divisions: divisionsWithFields,
    };

    try {
      const result = await submitPlan(submissionRescheduleData);
      
      if (result.status === "true") {
        
        try {
          const response = await deactivatePlan(selectedTask.id, 0);
          if (response?.status === 'true') {
            alert('Plan Rescheduled and Previous Plan Deactivated successfully!');
          } else {
            alert(response?.message || 'Failed to update plan status');
          }

        } catch (error) {
          console.error("Update error:", error);
          alert('An error occurred while Deactivating the previous plan status');
        }
      } else {
        alert(`Reschedule failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Reschedule Error:', error);
      alert('An error occurred while rescheduling.');
    } finally {
      setLoading(false);
      handleClosePopup();
    }
  };

  const renderTasks = (date) => {
    const tasks = groupedTasks[date] || [];
    return tasks.map((task) => (
      <div key={task.id} className="task-container-calender" onClick={() => handleTaskClick(task)}>
        <div className="task-icon" style={{ backgroundColor: task.statusColor }} />
        <div className="task-name" style={{ backgroundColor: task.backgroundColor }}>
          <div className="task-estate">{task.estate}</div>
          <div className="task-area">{task.area}</div>
        </div>
      </div>
    ));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    return (
      <>
        <div className="calendar-sticky-header">
        <div className="narrations">
          <div className="narration-group">
            {[
              { color: '#e3ffd7', text: 'Monthly Revolving Plan', isPlanType: true },
              { color: '#eed7a1', text: 'AddHoc Plan', isPlanType: true },
              { color: '#cdd3ff', text: 'Rescheduled Plan', isPlanType: true },
            ].map(({ color, text, isPlanType }) => (
              <div key={color} className={`${isPlanType ? 'narration-plan-type' : ''}`}>
                <span style={{ backgroundColor: color, padding: '8px' }}>{text}</span>
              </div>
            ))}
          </div>
          <div className="narration-group">
            {[
              { color: '#BEBEBE', text: 'Not Activated' },
              { color: '#FF0000', text: 'Overdue and Incomplete' },
              { color: '#FFE656', text: 'In Manager Approvals' },
              { color: '#FF7300', text: 'In Resources Implement' },
              { color: '#000000FF', text: 'Pilots Not Assigned' },
              { color: '#00CCFFFF', text: 'Patially Complete' },
              { color: '#1EFF00', text: 'Task is Completed' },
            ].map(({ color, text }) => (
              <div key={color} className="narration-item-cal">
                <div className="task-icon" style={{ backgroundColor: color }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="days-header">
          {dayNames.map((day) => (
            <div key={day} className="day-name">{day}</div>
          ))}
        </div>
        </div>
        <div className="calendar-grid">
          {[...Array(startDay)].map((_, i) => (
            <div key={`empty-${i}`} className="date-cell empty" />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
            const taskCount = groupedTasks[date]?.length || 0;
            return (
              <div key={date} className="date-cell">
                <div>
                  <span className="date-calender">{i + 1}</span>
                  <span className="task-count-calender">{taskCount > 0 ? ` (${taskCount})` : ''}</span>
                </div>
                <div className="tasks">{renderTasks(date)}</div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Contact Popup Component
  const ContactPopup = ({ contactData, onClose }) => {
    if (!contactData) return null;

    return (
      <div className="contact-popup-overlay" onClick={onClose}>
        <div className="contact-popup-content" onClick={(e) => e.stopPropagation()}>
          <button className="contact-popup-close-btn" onClick={onClose} aria-label="Close contact popup">✖</button>
          <div className="contact-popup-header">
            <h3>{contactData.appointment}</h3>
          </div>
          <div className="contact-popup-body">
            <div className="contact-info">
              <p><strong>Name:</strong> {contactData.name}</p>
              <p><strong>Mobile:</strong> {contactData.mobile}</p>
              {contactData.email && <p><strong>Email:</strong> {contactData.email}</p>}
            </div>
            <div className="contact-actions">
              <a href={`tel:${contactData.mobile}`} className="contact-action-btn phone-btn">
                <FiPhone /> Call
              </a>
              {contactData.email && (
                <a href={`mailto:${contactData.email}`} className="contact-action-btn email-btn">
                  <FiMail /> Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PilotDetailsPopup = ({ pilotData, onClose, loading }) => {
    if (!pilotData && !loading) return null;

    return (
      <div className="contact-popup-overlay" onClick={onClose}>
        <div className="contact-popup-content" onClick={(e) => e.stopPropagation()}>
          <button className="contact-popup-close-btn" onClick={onClose} aria-label="Close pilot details popup">✖</button>
          <div className="contact-popup-header">
            <h3>Pilot & Drone Details</h3>
          </div>
          <div className="contact-popup-body">
            {loading ? (
              <div className="loading-container">
                <Bars height="40" width="80" color="#004B71" />
              </div>
            ) : pilotData && pilotData["0"] ? (
              <div className="pilot-details-info">
                <div className="team-info">
                  <h4>Team Information</h4>
                  <p><strong>Team:</strong> {pilotData["0"].team_name || 'N/A'} (ID: {pilotData["0"].team || 'N/A'})</p>
                  <p><strong>Team Lead:</strong> {pilotData["0"].team_lead || 'N/A'}</p>
                  <p><strong>Team Lead Mobile:</strong> {pilotData["0"].team_lead_mobile || 'N/A'}</p>
                  <p><strong>Area:</strong> {pilotData["0"].area || 'N/A'} Ha</p>
                  <p><strong>Estate:</strong> {pilotData["0"].estate || 'N/A'}</p>
                  <p><strong>Date:</strong> {pilotData["0"].date || 'N/A'}</p>
                </div>
                
                <div className="pilots-section">
                  <h4>Pilots ({pilotData["0"].pilots?.length || 0})</h4>
                  {pilotData["0"].pilots && pilotData["0"].pilots.length > 0 ? (
                    pilotData["0"].pilots.map((pilot, index) => (
                      <div key={index} className="pilot-item">
                        <div className="pilot-info">
                          <p><strong>Name:</strong> {pilot.pilot || 'N/A'}</p>
                          <p><strong>Mobile:</strong> {pilot.mobile || 'N/A'}</p>
                          <p><strong>Role:</strong> {pilot.is_leader === 1 ? 'Team Lead' : 'Pilot'}</p>
                        </div>
                        <div className="pilot-actions">
                          <a href={`tel:${pilot.mobile}`} className="contact-action-btn phone-btn">
                            <FiPhone /> Call
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No pilots assigned to this task.</p>
                  )}
                </div>

                <div className="drones-section">
                  <h4>Drones ({pilotData["0"].drones?.length || 0})</h4>
                  {pilotData["0"].drones && pilotData["0"].drones.length > 0 ? (
                    pilotData["0"].drones.map((drone, index) => (
                      <div key={index} className="drone-item">
                        <p><strong>Drone ID:</strong> {drone.id || 'N/A'}</p>
                        <p><strong>Tag:</strong> {drone.tag || 'N/A'}</p>
                      </div>
                    ))
                  ) : (
                    <p>No drones assigned to this task.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-data">
                <p>No pilot details available for this task.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar">
      {renderCalendar()}
      {selectedTask && (
        <div className="popup-overlay">
          <div className="popup-content-calender" ref={popupContentRef}>
            <button className="popup-close-btn" onClick={handleClosePopup} aria-label="Close popup">✖</button>
            <div className="popup-header">
              {/* Debug info */}
              {console.log('estateDetails in popup:', estateDetails)}



              <p className="location">
                <strong>{selectedTask.group} - {selectedTask.plantation} - {selectedTask.region} Region - {selectedTask.estate} Estate (ID:{selectedTask.id})</strong>
              </p>

              <div className="popup-header-actions">


                {(userData?.member_type !== 'e' || ['ops', 'mgr', 'md', 'dops'].includes(userData?.job_role)) && calendarSection !== 'opsroom' && (
                  <button
                    className="reschedule-btn"
                    onClick={handleRescheduleClick}
                    disabled={loading}
                    aria-label={state.mode === 'reschedule' ? 'Back to view' : 'Re-schedule task'}
                  >
                    <VscDebugRestart /> {state.mode === 'reschedule' ? 'Back to View' : 'Re-Schedule'}
                  </button>
                )}
              </div>
            </div>
            <div className="task-details">
              {/* Manager Contact Section */}
              {estateDetails && estateDetails.manager && estateDetails.manager.length > 0 && (
                <div className="manager-contact-section">
                  <div className="manager-contact-info">
                    <span className="manager-title">Estate Manager</span>

                    <div className="manager-mobile-display">
                      <div className="manager-name">👨‍💼{estateDetails.manager[0].name}</div>
                      <span className="phone-icon">📞</span>
                      <span className="mobile-number">{estateDetails.manager[0].mobile}</span>
                    </div>
                  </div>
                  {estateDetails && estateDetails.other_personals && estateDetails.other_personals.length > 0 && (
                    <div className="manager-contacts-action">
                      <button
                        className="view-contacts-btn"
                        onClick={handleViewAllContacts}
                        title="View all contacts"
                      >
                        <span className="btn-icon">📞</span>
                        <span className="btn-text">View All Contacts</span>
                        <span className="contacts-count">({estateDetails.other_personals.length})</span>
                      </button>
                    </div>
                  )}

                  <div className="pilot-contacts-action">
                    <button
                      className="view-pilot-details-btn"
                      onClick={handlePilotDetailsClick}
                      title="View pilot and drone details"
                      disabled={pilotDetailsLoading}
                    >
                      <span className="btn-icon">🚁</span>
                      <span className="btn-text">View Pilot & Drone Details</span>
                      {pilotDetailsLoading && <Bars height="15" width="30" color="#fff" />}
                    </button>
                  </div>

                </div>
              )}

              {/* Task Information Section */}
              <div className="task-info-section">
                <div className="row">
                  <p><strong>Area:</strong> {selectedTask.area}</p>
                  <p><strong>Crop:</strong> {selectedTask.crop_type_name}</p>
                  <p><strong>Mission Type:</strong> {selectedTask.mission_type_name}</p>
                </div>
                <div className="row">
                  <p><strong>Manager Approval:</strong> {selectedTask.manager_approval === 1 ? 'Approved' : 'Not Approved'}</p>
                  <p><strong>Team Assigned:</strong> {selectedTask.team_assigned === 1 ? 'Assigned' : 'Not Assigned'}</p>
                  <p><strong>Completed:</strong> {selectedTask.completed === 1 ? 'Completed' : 'Not Completed'}</p>
                </div>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            {loading ? (
              <div className="loading-container">
                <Bars height="40" width="80" color="#004B71" />
              </div>
            ) : (
              <>
                {state.mode === 'view' && (
                  <div className="division-container-calender">
                    {state.divisionOptions
                      .filter((division) => division.divisionTotal > 0)
                      .map((division) => (
                        <ViewDivisionView
                          key={division.division_id}
                          divisionName={division.division_name}
                          fields={division.fields}
                          divisionTotal={division.divisionTotal}
                          selectedFieldsSet={state.selectedFields}
                        />
                      ))}
                  </div>
                )}
                {state.mode === 'update' && (
                  <div className="division-container-calender">
                    <h2 className="section-header">Update Fields</h2>
                    {state.divisionOptions.map((division) => (
                      <UpdateDivisionView
                        key={division.division_id}
                        divisionName={division.division_name}
                        fields={division.fields}
                        handleCheckboxChange={(fieldId) => handleCheckboxChange(fieldId)}
                        divisionTotal={division.divisionTotal}
                        selectedFieldsSet={state.selectedFields}
                      />
                    ))}
                  </div>
                )}
                {state.mode === 'reschedule' && (
                  <div className="division-container-calender">
                    <h2 className="section-header">Reschedule Fields</h2>
                    {renderRescheduleDatePicker()}
                    {state.divisionOptions
                      .filter((division) => division.divisionTotal > 0)
                      .map((division) => (
                        <RescheduleDivisionView
                          key={division.division_id}
                          divisionName={division.division_name}
                          fields={division.fields}
                          handleCheckboxChange={(fieldId) => handleCheckboxChange(fieldId)}
                          divisionTotal={division.divisionTotal}
                          selectedFieldsSet={state.selectedFields}
                        />
                      ))}
                  </div>
                )}
              </>
            )}
            <div className="action-buttons">
              {(userData?.member_type !== 'e' || ['ops', 'mgr', 'md', 'dops'].includes(userData?.job_role)) && calendarSection !== 'opsroom' && state.mode === 'view' && (
                <button className="update-btn" onClick={handleUpdateClick} disabled={loading} aria-label="Update task">
                  {loading ? <Bars height="20" width="50" color="#fff" /> : 'Update'}
                </button>
              )}
              {state.mode === 'update' && (
                <button
                  className="confirm-btn"
                  onClick={handleConfirm}
                  disabled={loading || state.selectedFields.size === 0}
                  aria-label="Confirm update"
                >
                  {loading ? <Bars height="20" width="50" color="#fff" /> : 'Confirm Update'}
                </button>
              )}
              {(userData?.member_type !== 'e' || ['ops', 'mgr', 'md', 'dops'].includes(userData?.job_role)) && calendarSection !== 'opsroom' && state.mode === 'reschedule' && (
                <button
                  className="confirm-btn"
                  onClick={handleRescheduleConfirm}
                  disabled={loading || state.selectedFields.size === 0 || !selectedRescheduledDate}
                  aria-label="Confirm reschedule"
                >
                  {loading ? <Bars height="20" width="50" color="#fff" /> : 'Confirm Reschedule'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Popup */}
      {showContactPopup && contactPopupData && (
        <ContactPopup
          contactData={contactPopupData}
          onClose={handleCloseContactPopup}
        />
      )}

      {/* Contacts List Popup */}
      {showContactPopup && !contactPopupData && estateDetails && estateDetails.other_personals && estateDetails.other_personals.length > 0 && (
        <div className="contacts-popup-overlay" onClick={handleCloseContactPopup}>
          <div className="contacts-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="contacts-popup-header">
              <h3>Other Contacts</h3>
              <button className="contacts-popup-close" onClick={handleCloseContactPopup}>✖</button>
            </div>
            <div className="contacts-popup-body">
              {estateDetails.other_personals.map((contact, index) => (
                <div key={index} className="contact-item" onClick={() => handleContactClick(contact)}>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-appointment">{contact.appointment}</div>
                    <div className="contact-mobile">{contact.mobile}</div>
                  </div>
                  <div className="contact-actions">
                    <a href={`tel:${contact.mobile}`} className="contact-action-btn phone-btn" onClick={(e) => e.stopPropagation()}>
                      <FiPhone />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pilot Details Popup */}
      {showPilotDetailsPopup && (
        <PilotDetailsPopup
          pilotData={pilotDetailsData}
          onClose={handleClosePilotDetailsPopup}
          loading={pilotDetailsLoading}
        />
      )}
    </div>
  );
};

CalendarWidget.propTypes = {
  tasksData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      estate: PropTypes.string.isRequired,
      area: PropTypes.number.isRequired,
      flag: PropTypes.string.isRequired,
      mission_id: PropTypes.number.isRequired,
      completed: PropTypes.number.isRequired,
      team_assigned: PropTypes.number.isRequired,
      activated: PropTypes.number.isRequired,
      manager_approval: PropTypes.number.isRequired,
      pilots_assigned: PropTypes.number.isRequired,
      group: PropTypes.string,
      plantation: PropTypes.string,
      region: PropTypes.string,
      estate_id: PropTypes.number,
      mission_type: PropTypes.number,
      crop_type: PropTypes.number,
      crop_type_name: PropTypes.string,
      mission_type_name: PropTypes.string,
    })
  ),
  currentMonth: PropTypes.instanceOf(Date).isRequired,
  onTaskUpdate: PropTypes.func,
  calendarSection: PropTypes.string,
};

export default CalendarWidget;