import React, { useEffect, useState, useCallback, useMemo } from 'react';
import CustomDropdown from '../../../components/CustomDropdown';
import BookingsCalender from './BookingsCalender';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Bars } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  useGetBookingCreationEstatesQuery,
  useGetBookingCreationMissionTypesQuery,
  useGetBookingCreationCropTypesQuery,
  useLazyGetBookingCreationDivisionsByEstateQuery,
  useLazyGetBookingCreationPlansByDateQuery,
  useLazyGetBookingCreationPlansByDateRangeQuery,
  useLazyGetBookingCreationAllPlansByDateRangeQuery,
  useCreateBookingPlanMutation,
} from '../../../api/services NodeJs/bookingCreationApi';
import '../../../styles/updateservices.css';

const EMPTY_LIST = [];

const NewServices = () => {
  const [state, setState] = useState({
    plantationOptions: [],
    regionOptions: [],
    estateOptions: [],
    divisionOptions: [],
    selectedDate: null,
    selectedMissionType: null,
    selectedCropType: null,
    monthStartDate: "",
    monthEndDate: "",
    selectedFields: new Set(),
    totalExtent: 0,
    isAdHocPlan: false, // Default to false
    update: false,
    missionId: "",
    isSubmitting: false,
    selectedEstate: null, // Store selected estate object
    selectedGroup: null,
    selectedPlantation: null,
    selectedRegion: null,
    searchTerm: '',
    isDropdownOpen: false,
    originalSelectedFields: new Set(), // Track original fields before Ad-Hoc
    originalTotalExtent: 0, // Track original extent before Ad-Hoc
    totalAreaForDay: 0,
    planCountForDay: 0,
    totalPlannedExtentForMonth: 0,
    totalPlannedCountForMonth: 0,
    minimumPlanSize: 0, // <-- Add min plan size
    maximumPlanSize: 0, // <-- Add max plan size
    planCount: 1, // Number of plans to create
    showPlanPopup: false, // Control popup visibility
    popupDate: null, // Store date selected from calendar
    submittingDate: null, // Track which date is being submitted
  });
  const [calendarTasks, setCalendarTasks] = useState([]); // Store calendar tasks for display
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month for calendar
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [restrictedFieldConfirm, setRestrictedFieldConfirm] = useState(null);
  const { data: estatesData, isLoading: estatesLoading } = useGetBookingCreationEstatesQuery();
  const { data: missionTypesData } = useGetBookingCreationMissionTypesQuery();
  const { data: cropTypesData } = useGetBookingCreationCropTypesQuery();

  const estates = estatesData ?? EMPTY_LIST;
  const missionTypes = missionTypesData ?? EMPTY_LIST;
  const cropTypes = cropTypesData ?? EMPTY_LIST;

  const filteredEstates = useMemo(() => {
    const term = (state.searchTerm || '').trim();
    if (!term || term.toLowerCase() === '0') return estates;
    return estates.filter((estate) =>
      estate.estate.toLowerCase().includes(term.toLowerCase())
    );
  }, [estates, state.searchTerm]);
  const [fetchDivisionsByEstate] = useLazyGetBookingCreationDivisionsByEstateQuery();
  const [fetchPlansByDate] = useLazyGetBookingCreationPlansByDateQuery();
  const [fetchPlansByDateRange] = useLazyGetBookingCreationPlansByDateRangeQuery();
  const [fetchAllPlansByDateRange] = useLazyGetBookingCreationAllPlansByDateRangeQuery();
  const [createBookingPlan] = useCreateBookingPlanMutation();

  const mapCalendarTasksFromResponse = (response) => {
    if (response?.status !== 'true') return [];
    return Object.keys(response)
      .filter((key) => !isNaN(key))
      .map((key) => response[key])
      .map((task) => ({
        id: task.id,
        date: task.date,
        estate: task.estate,
        estate_id: task.estate_id,
        area: parseFloat(task.area) || 0,
        flag: task.flag,
        mission_id: task.mission_id,
        completed: task.completed,
        team_assigned: task.team_assigned,
        activated: task.activated,
        manager_approval: task.manager_approval,
        pilots_assigned: task.pilots_assigned,
        can_delete: task.can_delete,
        delete_block_reason: task.delete_block_reason,
      }));
  };

  const buildCalendarTaskFromCreate = (planId, submissionData, estate) => ({
    id: planId,
    date: submissionData.pickedDate,
    estate: estate.estate,
    estate_id: estate.id,
    area: parseFloat(submissionData.totalExtent) || 0,
    flag: submissionData.flag,
    mission_id: 0,
    completed: 0,
    team_assigned: 0,
    activated: 1,
    manager_approval: 0,
    pilots_assigned: 0,
    can_delete: true,
    delete_block_reason: null,
  });

  const refreshCalendarForMonth = useCallback(async (month = currentMonth) => {
    const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(month), 'yyyy-MM-dd');
    // preferCacheValue: false — after create, cache may only have the first plan until refetch
    const summaryResult = await fetchAllPlansByDateRange({ startDate, endDate }, false);
    if (summaryResult.data) {
      setCalendarTasks(summaryResult.data);
    }
  }, [currentMonth, fetchAllPlansByDateRange]);

  // Handle date click from calendar
  const handleDateClick = (date) => {
    // Check if estate, crop type, and mission type are selected
    if (!state.selectedEstate || !state.selectedCropType || !state.selectedMissionType) {
      toast.error("Please select Estate, Crop Type, and Mission Type first.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Set the selected date and show popup
    setState(prev => ({
      ...prev,
      selectedDate: date,
      popupDate: date,
      showPlanPopup: true,
      planCount: 1 // Reset to default when opening popup
    }));

    // Fetch data for the selected date
    fetchTotalAreaForDate(date);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.estate-search-container-controls')) {
        setState(prev => ({ ...prev, isDropdownOpen: false }));
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch calendar data for current month
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setCalendarLoading(true);
        await refreshCalendarForMonth(currentMonth);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
        setCalendarTasks([]);
      } finally {
        setCalendarLoading(false);
      }
    };

    fetchCalendarData();

    const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    fetchMonthlyPlanData(startDate, endDate);
  }, [currentMonth, refreshCalendarForMonth]);

  const today = new Date();
  const fetchTotalAreaForDate = async (date) => {
    if (date) {
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const plansResult = await fetchPlansByDate(formattedDate, false);
        const response = plansResult.data;
        if (response?.status === "true") {
          const activatedPlans = mapCalendarTasksFromResponse(response)
            .filter(plan => plan.activated === 1);
          
          // Count only activated plans
          const planCount = activatedPlans.length;
          const totalArea = activatedPlans.reduce((sum, plan) => sum + (parseFloat(plan.area) || 0), 0);
          
          setState(prev => ({
            ...prev,
            totalAreaForDay: parseFloat(totalArea.toFixed(2)),
            planCountForDay: planCount,
          }));
        } else {
          setState(prev => ({
            ...prev,
            totalAreaForDay: 0,
            planCountForDay: 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching plans for date:", error);
        setState(prev => ({
          ...prev,
          totalAreaForDay: 0,
          planCountForDay: 0,
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        totalAreaForDay: 0,
        planCountForDay: 0,
      }));
    }
  };

  // Modified useEffect to use the new function
  useEffect(() => {
    fetchTotalAreaForDate(state.selectedDate);
  }, [state.selectedDate, state.monthStartDate, state.monthEndDate]);


  const fetchMissionDetails = useCallback(async () => {
    const { selectedEstate } = state;

    if (selectedEstate) {
      try {
        const divisionsResult = await fetchDivisionsByEstate(selectedEstate.id);
        const divisionsResponse = divisionsResult.data;
        let divisions = [];
        let minimumPlanSize = 0;
        let maximumPlanSize = 0;
        if (divisionsResponse && typeof divisionsResponse === 'object') {
          minimumPlanSize = divisionsResponse.minimum_plan_size || 0;
          maximumPlanSize = divisionsResponse.maximum_plan_size || 0;
          divisions = Object.keys(divisionsResponse)
            .filter(key => !isNaN(key))
            .map(key => divisionsResponse[key]);
        }
        setState(prev => ({
          ...prev,
          divisionOptions: divisions,
          minimumPlanSize,
          maximumPlanSize,
        }));
      } catch (error) {
        console.error('Error fetching divisions:', error);
      }
    }
  }, [state.selectedEstate, fetchDivisionsByEstate]);

  const handleFieldCheckboxChange = (fieldId, fieldArea, isChecked) => {
    setState((prev) => {
      const updatedSelectedFields = new Set(prev.selectedFields);
      let updatedTotalExtent = prev.totalExtent;
      // No alert or blocking logic here, just update as before
      if (isChecked) {
        updatedSelectedFields.add(fieldId);
        updatedTotalExtent += fieldArea;
      } else {
        updatedSelectedFields.delete(fieldId);
        updatedTotalExtent -= fieldArea;
      }
      updatedTotalExtent = parseFloat(updatedTotalExtent.toFixed(2));
      return {
        ...prev,
        selectedFields: updatedSelectedFields,
        totalExtent: updatedTotalExtent,
      };
    });
  };




  const handleDropdownSelect = async (type, id, fetchFunc, nextOptionsKey) => {
    setState(prev => {
      let updatedState = { ...prev, [type]: id };

      // Clear the fields and extent when a dropdown is changed
      updatedState.selectedFields = new Set();
      updatedState.totalExtent = 0;

      if (type === 'selectedGroup') {
        updatedState = { ...updatedState, selectedPlantation: null, selectedRegion: null, selectedEstate: null };
      } else if (type === 'selectedPlantation') {
        updatedState = { ...updatedState, selectedRegion: null, selectedEstate: null };
      } else if (type === 'selectedRegion') {
        updatedState = { ...updatedState, selectedEstate: null };
      }

      return updatedState;
    });

    if (fetchFunc) {
      try {
        const options = await fetchFunc(id);
        setState(prev => ({ ...prev, [nextOptionsKey]: Array.isArray(options) ? options : [] }));
      } catch (error) {
        console.error(`Error fetching ${nextOptionsKey}:`, error);
      }
    }
  };


  const executePlanCreate = async () => {
    if (state.isSubmitting) return;

    const {
      selectedEstate,
      selectedMissionType,
      selectedCropType,
      selectedDate,
      divisionOptions,
      selectedFields,
      totalExtent,
      isAdHocPlan,
      planCount,
    } = state;

    // Start submission process
    setState(prev => ({ 
      ...prev, 
      isSubmitting: true,
      submittingDate: selectedDate // Track which date is being submitted
    }));

    // Prepare submission data
    const submissionData = {
      flag: isAdHocPlan ? "ap" : "np",
      missionId: 0,
      estateId: selectedEstate.id,
      groupId: selectedEstate.group,
      regionId: selectedEstate.region,
      plantationId: selectedEstate.plantation,
      missionTypeId: selectedMissionType.id,
      cropTypeId: selectedCropType.id,
      totalExtent: totalExtent.toFixed(2),
      pickedDate: format(selectedDate, "yyyy-MM-dd"),  // Use consistent date formatting
      divisions: divisionOptions
        .map((division) => ({
          divisionId: division.division_id,
          checkedFields: division.fields
            ?.filter((field) => selectedFields.has(field.field_id))
            .map(({ field_id, field_name, field_area }) => ({
              field_id,
              field_name,
              field_area,
            })) || [],
        }))
        .filter((division) => division.checkedFields.length > 0),
    };
    console.log("selected", submissionData);
    try {
      let successCount = 0;
      let failedCount = 0;

      // Submit plan multiple times based on planCount
      for (let i = 0; i < planCount; i++) {
        try {
          const createResult = await createBookingPlan(submissionData);
          const result = createResult.data;
          if (result?.status === "true") {
            successCount++;
            const planId = result.id ?? result.plan_id;
            if (planId) {
              const newTask = buildCalendarTaskFromCreate(planId, submissionData, selectedEstate);
              setCalendarTasks((prev) => {
                if (prev.some((t) => Number(t.id) === Number(planId))) return prev;
                return [...prev, newTask];
              });
              setState((prev) => ({
                ...prev,
                planCountForDay: prev.planCountForDay + 1,
                totalAreaForDay: parseFloat(
                  (prev.totalAreaForDay + (parseFloat(submissionData.totalExtent) || 0)).toFixed(2)
                ),
              }));
            }
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Error submitting plan ${i + 1}:`, error);
          failedCount++;
        }
      }

      if (successCount > 0) {
        // Reset form inputs but keep DivisionView data, crop type, and mission type
        setState(prev => ({
          ...prev,
          selectedDate: null,
          selectedFields: new Set(),
          totalExtent: 0,
          planCount: 1, // Reset to default
          isSubmitting: false,
          showPlanPopup: false,
          popupDate: null,
          submittingDate: null // Clear submitting date
          // Note: divisionOptions, selectedEstate, selectedGroup, selectedPlantation, selectedRegion, 
          // selectedCropType, selectedMissionType are kept so they don't need to be reselected
        }));
        
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        await refreshCalendarForMonth(currentMonth);
        await fetchMonthlyPlanData(startDate, endDate);
        if (selectedDate) {
          await fetchTotalAreaForDate(selectedDate);
        }

        // Show error only if there were failures
        if (failedCount > 0) {
          toast.error(`${failedCount} plan(s) failed to submit. Please try again.`, {
            position: "top-center",
            autoClose: 5000,
          });
        }
      } else if (failedCount === planCount) {
        toast.error(`All ${planCount} plan(s) failed to submit. Please try again.`, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Submission Error:', error);
      toast.error("An error occurred while submitting. Please try again.", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      // Ensure loading state is reset in all cases
      setState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        submittingDate: null // Clear submitting date
      }));
    }
  };

  const handleSubmit = async () => {
    if (state.isSubmitting) return;

    const {
      selectedEstate,
      selectedMissionType,
      selectedCropType,
      selectedDate,
      divisionOptions,
      selectedFields,
    } = state;

    if (!selectedEstate || !selectedMissionType || !selectedCropType || !selectedDate) {
      toast.error('All fields are required. Please fill in all fields.', {
        position: 'top-center',
        autoClose: 3000,
      });
      return;
    }

    const selectedMissionLabel = (selectedMissionType?.group || selectedMissionType?.id || '')
      .toString()
      .toLowerCase();
    const isSpray = selectedMissionLabel.includes('spray');
    const isSpread = selectedMissionLabel.includes('spread');

    let restrictedSelections = [];

    if (isSpray) {
      restrictedSelections = divisionOptions.flatMap((div) =>
        (div.fields || [])
          .filter((f) => selectedFields.has(f.field_id))
          .filter((f) => Number(f.can_spread) === 0)
          .map((f) => ({
            division: div.division_name,
            field: f.field_name,
            reason: f.can_spread_text,
          }))
      );
    } else if (isSpread) {
      restrictedSelections = divisionOptions.flatMap((div) =>
        (div.fields || [])
          .filter((f) => selectedFields.has(f.field_id))
          .filter((f) => Number(f.can_spray) === 0)
          .map((f) => ({
            division: div.division_name,
            field: f.field_name,
            reason: f.can_spray_text,
          }))
      );
    }

    if (restrictedSelections.length > 0) {
      setRestrictedFieldConfirm(restrictedSelections);
      return;
    }

    await executePlanCreate();
  };


  const dayClassName = (date) => {
    return "";
  };
  const fetchMonthlyPlanData = async (startDate, endDate) => {
    if (startDate && endDate) {
      try {
        const plansRangeResult = await fetchPlansByDateRange({ startDate, endDate }, false);
        const response = plansRangeResult.data;
        console.log('fetchMonthlyPlanData response:', response); // Debug log
        if (response?.status === "true") {
          const totalHa = parseFloat(response.total_ha) || 0;
          const count = parseInt(response.count) || 0;
          setState(prev => {
            console.log('Updating state with total_ha:', totalHa, 'count:', count); // Debug log
            return {
              ...prev,
              totalPlannedExtentForMonth: totalHa,
              totalPlannedCountForMonth: count,
            };
          });
        } else {
          console.warn('fetchMonthlyPlanData: Invalid response status', response);
          setState(prev => ({
            ...prev,
            totalPlannedExtentForMonth: 0,
            totalPlannedCountForMonth: 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching monthly plan data:", error);
        setState(prev => ({
          ...prev,
          totalPlannedExtentForMonth: 0,
          totalPlannedCountForMonth: 0,
        }));
      }
    } else {
      console.warn('fetchMonthlyPlanData: Missing startDate or endDate');
      setState(prev => ({
        ...prev,
        totalPlannedExtentForMonth: 0,
        totalPlannedCountForMonth: 0,
      }));
    }
  };
  // Update the useEffect for initial mount
  useEffect(() => {
    const currentDate = new Date();
    const startdate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    setState(prev => ({
      ...prev,
      monthStartDate: startdate,
      monthEndDate: endDate,
    }));

    fetchMonthlyPlanData(startdate, endDate);
  }, []);

  // 2. Update the useEffect to call the function correctly
  useEffect(() => {
    if (state.monthStartDate && state.monthEndDate) {
      fetchMonthlyPlanData(state.monthStartDate, state.monthEndDate);
    }
  }, [state.monthStartDate, state.monthEndDate]);


  // Update handleMonthOrYearChange to ensure data is fetched
  const handleMonthOrYearChange = async (date) => {
    const monthStartDate = format(startOfMonth(date), 'yyyy-MM-dd');
    const monthEndDate = format(endOfMonth(date), 'yyyy-MM-dd');
    setState(prev => ({
      ...prev,
      monthStartDate,
      monthEndDate,
    }));

    await fetchMonthlyPlanData(monthStartDate, monthEndDate);
    await fetchTotalAreaForDate(state.selectedDate);
  };


  useEffect(() => {
    if (state.selectedEstate || state.selectedCropType || state.selectedMissionType) {
      setState(prev => ({
        ...prev,
        selectedDate: null // Reset to null first
      }));
    }
  }, [state.selectedEstate, state.selectedCropType, state.selectedMissionType]);



  // inside NewServices component
  useEffect(() => {
    const fetchData = async () => {
      const currentDate = new Date();
      const startdate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      setState(prev => ({
        ...prev,
        monthStartDate: startdate,
        monthEndDate: endDate,
      }));

      // Fetch monthly plan data immediately
      await fetchMonthlyPlanData(startdate, endDate);
    };

    if (state.selectedEstate && state.selectedMissionType && state.selectedCropType) {
      fetchData();
    }
  }, [state.selectedEstate, state.selectedMissionType, state.selectedCropType, state.isAdHocPlan]);


  useEffect(() => {
    fetchMissionDetails();
  }, [fetchMissionDetails]);

  if (estatesLoading) {
    return <div>Loading...</div>;
  }
  const handleEstateChange = (estateOrEvent) => {
    let estate;

    // Handle both event object and direct estate object
    if (estateOrEvent && estateOrEvent.target) {
      // It's an event
      const estateId = parseInt(estateOrEvent.target.value);
      estate = estates.find(e => e.id === estateId);
    } else {
      // It's an estate object
      estate = estateOrEvent;
    }

    setState(prev => ({
      ...prev,
      selectedEstate: estate,
      selectedGroup: estate ? {
        id: estate.group,
        name: estate.group_name
      } : null,
      selectedPlantation: estate ? {
        id: estate.plantation,
        name: estate.plantation_name
      } : null,
      selectedRegion: estate ? {
        id: estate.region,
        name: estate.region_name
      } : null,
      divisionOptions: [],
      selectedFields: new Set(),
      totalExtent: 0
    }));
  };
  return (
    <div className={`services ${state.isSubmitting ? 'submitting-cursor' : ''}`}>
      <div className="services-container-new">
        {/* Top Section - Form Controls */}
        <div className="form-section-top">
          <div className="form-controls-row">
            {/* Estate Search Dropdown */}
            <div className="estate-search-container-controls">
              <label htmlFor="estate-search-input">Search Estate:</label>
              <div className="estate-search-wrapper">
                <input
                  id="estate-search-input"
                  className="estate-search-input"
                  type="text"
                  placeholder="Type to search estates..."
                  autoComplete="off"
                  value={state.searchTerm || ''}
                  onChange={(e) => {
                    const searchValue = e.target.value;
                    setState(prev => ({
                      ...prev,
                      searchTerm: searchValue,
                      isDropdownOpen: true
                    }));
                    // If the search is cleared, also clear the selected estate
                    if (!searchValue) {
                      setState(prev => ({
                        ...prev,
                        selectedEstate: null,
                        selectedGroup: null,
                        selectedPlantation: null,
                        selectedRegion: null,
                        divisionOptions: [],
                        selectedFields: new Set(),
                        totalExtent: 0
                      }));
                    }
                  }}
                  onFocus={() => setState(prev => ({ ...prev, isDropdownOpen: true }))}
                />
                <div className="estate-dropdown-indicator">▼</div>

                {state.isDropdownOpen && (
                  <div className="estate-suggestions-list">
                    {filteredEstates.map(estate => (
                      <div
                        key={estate.id}
                        className="estate-suggestion-item"
                        onClick={() => {
                          setState(prev => ({
                            ...prev,
                            selectedEstate: estate,
                            searchTerm: estate.estate,
                            isDropdownOpen: false
                          }));
                          handleEstateChange(estate);
                        }}
                      >
                        {estate.estate}
                        <span className="estate-details">
                          {estate.region_name} | {estate.plantation_name}
                        </span>
                      </div>
                    ))}
                    {filteredEstates.length === 0 && (
                      <div className="no-estates-found">No matching estates found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Crop Type */}
            <div className="mission-type-controls">
              <label htmlFor="crop-select">Select Crop Type</label>
              <CustomDropdown 
                options={cropTypes.map(({ id, crop }) => ({ id, group: crop }))} 
                onSelect={(val) => setState(prev => ({ ...prev, selectedCropType: val }))} 
                selectedValue={state.selectedCropType} 
              />
            </div>

            {/* Mission Type */}
            <div className="mission-type-controls">
              <label htmlFor="mission-select">Select Mission Type</label>
              <CustomDropdown 
                options={missionTypes.map(({ mission_type_code, mission_type_name }) => ({ id: mission_type_code, group: mission_type_name }))} 
                onSelect={(val) => setState(prev => ({ ...prev, selectedMissionType: val }))} 
                selectedValue={state.selectedMissionType} 
              />
            </div>

            {/* Stats Column - Last Column */}
            <div className="stats-column-controls">
              <div className="stat-item-controls">
                <label>Total Planned Count</label>
                <h5 className="stat-value-controls">{state.totalPlannedCountForMonth}</h5>
              </div>
              <div className="stat-item-controls">
                <label>Month Average Extent :</label>
                <h5 className="stat-value-controls">{state.totalPlannedCountForMonth*15} Ha</h5>
              </div>
            </div>
            
          </div>
        </div>

        {/* Bottom Section - Calendar */}
        <div className="calendar-section-bottom">
          <BookingsCalender 
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            tasksData={calendarTasks}
            calendarLoading={calendarLoading}
            onDateClick={handleDateClick}
            selectedDate={state.selectedDate}
            submittingDate={state.submittingDate}
            onCalendarChange={() => refreshCalendarForMonth(currentMonth)}
          />
        </div>

        {/* Plan Creation Popup */}
        {state.showPlanPopup && (
          <div className="plan-popup-overlay" onClick={() => setState(prev => ({ ...prev, showPlanPopup: false }))}>
            <div className="plan-popup-container" onClick={(e) => e.stopPropagation()}>
              <div className="plan-popup-header">
                <h3>Create a Plan for {state.popupDate ? format(state.popupDate, 'yyyy-MM-dd') : ''}</h3>
                <button 
                  className="plan-popup-close"
                  onClick={() => setState(prev => ({ ...prev, showPlanPopup: false }))}
                >
                  ×
                </button>
              </div>
              <div className="plan-popup-content">
                <div className="plan-popup-date-info">
                  <label>Plan Count for Selected Date</label>
                  <span className="plan-popup-date-value">{state.planCountForDay} plan{state.planCountForDay !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="plan-count-selector-popup">
                  <label htmlFor="plan-count-popup">How Many Plans?</label>
                  <div className="plan-count-controls-popup">
                    <button 
                      className="plan-count-btn-popup"
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        planCount: Math.max(1, prev.planCount - 1) 
                      }))}
                      disabled={state.planCount <= 1}
                    >
                      -
                    </button>
                    <span className="plan-count-label-popup">{state.planCount}</span>
                    <button 
                      className="plan-count-btn-popup"
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        planCount: prev.planCount + 1 
                      }))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="plan-popup-footer">
                <button 
                  className="plan-popup-create-btn"
                  onClick={() => {
                    handleSubmit();
                    setState(prev => ({ ...prev, showPlanPopup: false }));
                  }}
                  disabled={state.isSubmitting}
                >
                  {state.isSubmitting ? (
                    <Bars
                      height="20"
                      width="50"
                      color="#ffffff"
                      ariaLabel="bars-loading"
                      visible={true}
                    />
                  ) : (
                    "Create Plan"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {restrictedFieldConfirm && (
          <div className="plan-popup-overlay" onClick={() => setRestrictedFieldConfirm(null)}>
            <div className="plan-popup-container" onClick={(e) => e.stopPropagation()}>
              <div className="plan-popup-header">
                <h3>Restricted fields</h3>
                <button
                  type="button"
                  className="plan-popup-close"
                  onClick={() => setRestrictedFieldConfirm(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="plan-popup-content">
                <p className="plan-popup-message">
                  Some selected fields are restricted for this mission type. Proceed anyway?
                </p>
                <ul className="plan-popup-warning-list">
                  {restrictedFieldConfirm.map((r, idx) => (
                    <li key={idx}>
                      {r.division}: {r.field}
                      {r.reason ? ` (${r.reason})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="plan-popup-footer">
                <div className="plan-popup-actions">
                  <button
                    type="button"
                    className="plan-popup-cancel-btn"
                    onClick={() => setRestrictedFieldConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="plan-popup-create-btn"
                    onClick={async () => {
                      setRestrictedFieldConfirm(null);
                      await executePlanCreate();
                    }}
                    disabled={state.isSubmitting}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
};

export default NewServices;
