import React, { useEffect, useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDropdown from '../../components/CustomDropdown';
import DivisionView from '../../components/DivisionView';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Bars } from 'react-loader-spinner';
import { getPlansUsingDateRange, getPlansUsingDate, getUpdatedCalander, groupGetter, divisionStateList, missionType, cropType, submitPlan, displayEstate } from '../../api/api';
import '../../styles/updateservices.css';
import axios from 'axios';
const NewServices = () => {
  const [state, setState] = useState({
    dropdownOptions: [],
    plantationOptions: [],
    regionOptions: [],
    estateOptions: [],
    missionTypes: [],
    cropTypes: [],
    divisionOptions: [],
    selectedDate: "",
    selectedMissionType: null,
    selectedCropType: null,
    monthStartDate: "",
    monthEndDate: "",
    selectedFields: new Set(),
    totalExtent: 0,
    loading: true,
    isAdHocPlan: false,
    update: false,
    missionId: "",
    isSubmitting: false,
    estates: [],          // Store list of estates
    selectedEstate: null, // Store selected estate object
    selectedGroup: null,
    selectedPlantation: null,
    selectedRegion: null,
    searchTerm: '',
    filteredEstates: [],
    isDropdownOpen: false,
    originalSelectedFields: new Set(), // Track original fields before Ad-Hoc
    originalTotalExtent: 0, // Track original extent before Ad-Hoc
    totalAreaForDay: 0,
    planCountForDay: 0,
    totalPlannedExtentForMonth: 0,
    totalPlannedCountForMonth: 0,
    minimumPlanSize: 0, // <-- Add min plan size
    maximumPlanSize: 0, // <-- Add max plan size
  });
  const [fetchedDates, setFetchedDates] = useState([]);
  const [fetchedFields, setFetchedFields] = useState([]);
  const [calendarData, setCalendarData] = useState([]); // Store detailed calendar data

  const handleAdHocChange = (e) => {
    const isChecked = e.target.checked;

    // If Add-Hoc Plan is checked, clear all fields and set total extent to 0
    if (isChecked) {
      setState((prevState) => ({
        ...prevState,
        isAdHocPlan: true,
        selectedFields: new Set(),  // Clear selected fields
        totalExtent: 0,  // Reset total extent to 0
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        isAdHocPlan: false,
        selectedFields: new Set(),  // Clear selected fields
        totalExtent: 0,
      }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.estate-search-container')) {
        setState(prev => ({ ...prev, isDropdownOpen: false }));
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchEstates = async () => {
      try {
        const response = await displayEstate();
        setState(prev => ({
          ...prev,
          estates: response || [],
          filteredEstates: response || [], // Initialize filteredEstates with all estates
          loading: false
        }));
      } catch (error) {
        console.error("Error fetching estates:", error);
        setState(prev => ({
          ...prev,
          estates: [],
          filteredEstates: [], // Also reset filteredEstates on error
          loading: false
        }));
      }
    };

    fetchEstates();
  }, []);

  const today = new Date();
  const fetchTotalAreaForDate = async (date) => {
    if (date) {
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const response = await getPlansUsingDate(formattedDate);
        if (response?.status === "true") {
          // Sum the 'area' from all plans
          const planCount = response.count || 0;
          const totalArea = Object.keys(response)
            .filter(key => !isNaN(key))
            .reduce((sum, key) => sum + (parseFloat(response[key].area) || 0), 0);
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


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [groups, missions, crops] = await Promise.all([groupGetter(), missionType(), cropType()]);
        setState(prev => ({
          ...prev,
          dropdownOptions: Array.isArray(groups) ? groups : [],
          missionTypes: Array.isArray(missions) ? missions : [],
          cropTypes: Array.isArray(crops) ? crops : [],
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const fetchMissionDetails = useCallback(async () => {
    const { selectedEstate } = state;

    if (selectedEstate) {
      try {
        const divisionsResponse = await divisionStateList(selectedEstate.id);
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
  }, [state.selectedEstate, state.selectedDate, state.selectedMissionType, state.selectedCropType]);

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


  const fetchUpdatedCalendar = useCallback(async (startDate, endDate) => {
    const { selectedEstate, selectedMissionType, selectedCropType, isAdHocPlan } = state;
    console.log("came here");
    if (selectedEstate && selectedMissionType && selectedCropType) {
      try {
        const payload = {
          estateId: selectedEstate.id,
          cropId: selectedCropType.id,
          missionTypeId: selectedMissionType.id,
          startDate,
          endDate,
        };

        // Conditionally include the "new_plan" parameter based on isAdHocPlan
        const response = await getUpdatedCalander(payload, isAdHocPlan ? "" : "new_plan");

        if (response?.status === "true") {
          // Extract detailed calendar data
          const extractedData = Object.keys(response)
            .filter(key => !isNaN(key)) // Filter numeric keys
            .map(key => ({
              id: response[key].id,
              date: response[key].date,
              fieldIds: response[key].fields.flat().map(field => field.id),
            }));

          // Update calendar data
          setCalendarData(extractedData);

          // Extract dates and fields for existing logic
          const extractedDates = extractedData.map(data => data.date);
          const extractedFields = extractedData.flatMap(data => data.fieldIds);

          // Update existing state
          setFetchedDates(extractedDates);
          setFetchedFields(extractedFields);
        } else {
          setCalendarData([]);
          setFetchedDates([]);
          setFetchedFields([]);
        }
      } catch (error) {
        console.error("Error fetching update mission details:", error);
        alert("An error occurred while fetching the calendar data. Please try again.");
      }
    } else {
      alert("Please select Estate, Crop Type, and Mission Type first.");
    }
  }, [state.selectedEstate, state.selectedMissionType, state.selectedCropType, state.isAdHocPlan]);


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


  const handleSubmit = async () => {
    // Prevent double submission
    if (state.isSubmitting) return;

    // Destructure state values
    const {
      selectedEstate,
      selectedMissionType,
      selectedCropType,
      selectedDate,
      divisionOptions,
      selectedFields,
      totalExtent,
      isAdHocPlan
    } = state;

    // Validate required fields first
    if (!selectedEstate || !selectedMissionType || !selectedCropType || !selectedDate) {
      alert("All fields are required. Please fill in all fields.");
      return;
    }

    // Validate field selection
    if (selectedFields.size === 0) {
      alert("Please select at least one field before submitting.");
      return;
    }

    // Check for restricted fields based on mission type
    const selectedMissionLabel = (selectedMissionType?.group || selectedMissionType?.id || '').toString().toLowerCase();
    const isSpray = selectedMissionLabel.includes('spray');
    const isSpread = selectedMissionLabel.includes('spread');
    
    // Only check restrictions based on the selected mission type
    let restrictedSelections = [];
    
    if (isSpray) {
      // Only check can_spray when mission type is spray
      restrictedSelections = divisionOptions.flatMap(div =>
        (div.fields || []).filter(f => selectedFields.has(f.field_id)).filter(f =>
          Number(f.can_spray) === 0
        ).map(f => ({
          division: div.division_name,
          field: f.field_name,
          reason: f.can_spray_text || 'Cannot spray'
        }))
      );
    } else if (isSpread) {
      // Only check can_spread when mission type is spread
      restrictedSelections = divisionOptions.flatMap(div =>
        (div.fields || []).filter(f => selectedFields.has(f.field_id)).filter(f =>
          Number(f.can_spread) === 0
        ).map(f => ({
          division: div.division_name,
          field: f.field_name,
          reason: f.can_spread_text || 'Cannot spread'
        }))
      );
    }

    if (restrictedSelections.length > 0) {
      const msg = 'Some selected fields are restricted for this mission type:\n\n' +
        restrictedSelections.map(r => `- ${r.division}: ${r.field} (${r.reason})`).join('\n') +
        '\n\nDo you still want to proceed?';
      const confirmed = window.confirm(msg);
      if (!confirmed) {
        return; // Abort submission
      }
    }

    // Start submission process
    setState(prev => ({ ...prev, isSubmitting: true }));

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
      const result = await submitPlan(submissionData);
      if (result.status === "true") {
        alert("Submission successful!");
        // Reset form inputs but keep DivisionView data
        setState(prev => ({
          ...prev,
          selectedMissionType: null,
          selectedCropType: null,
          selectedDate: null,
          selectedFields: new Set(),
          totalExtent: 0,
          isSubmitting: false
          // Note: divisionOptions, selectedEstate, selectedGroup, selectedPlantation, selectedRegion are kept
          // so the DivisionView remains visible with the updated data
        }));
        
        // Refresh the calendar data to update field availability for newly added fields
        if (state.selectedEstate && state.selectedCropType && state.selectedMissionType) {
          const currentDate = new Date();
          const startdate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
          const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
          await fetchUpdatedCalendar(startdate, endDate);
        }
      } else {
        alert(`Submission failed: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error('Submission Error:', error);
      alert("An error occurred while submitting. Please try again.");
    } finally {
      // Ensure loading state is reset in all cases
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };


  const dayClassName = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (fetchedDates.includes(formattedDate)) {
      return "disabled-date"; // Apply class to disable the date
    }
    return "";
  };
  const fetchMonthlyPlanData = async (startDate, endDate) => {
    if (startDate && endDate) {
      try {
        const response = await getPlansUsingDateRange(startDate, endDate);
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

    await fetchUpdatedCalendar(monthStartDate, monthEndDate);
    await fetchMonthlyPlanData(monthStartDate, monthEndDate);
    await fetchTotalAreaForDate(state.selectedDate);
  };


  useEffect(() => {
    if (state.selectedEstate || state.selectedCropType || state.selectedMissionType) {
      setState(prev => ({
        ...prev,
        selectedDate: null // Reset to null first
      }));

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          selectedDate: new Date() // Set it to today's date after a short delay
        }));
      }, 100);
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

      // Fetch calendar based on the current filters
      await fetchUpdatedCalendar(startdate, endDate);

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

  if (state.loading) {
    return <div>Loading...</div>;
  }
  const handleEstateChange = (estateOrEvent) => {
    let estate;

    // Handle both event object and direct estate object
    if (estateOrEvent && estateOrEvent.target) {
      // It's an event
      const estateId = parseInt(estateOrEvent.target.value);
      estate = state.estates.find(e => e.id === estateId);
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
  // Button enable/disable logic
  const isPlanSizeValid = state.isAdHocPlan || (
    state.totalExtent >= state.minimumPlanSize &&
    (state.maximumPlanSize === 0 || state.totalExtent <= state.maximumPlanSize)
  );
  return (
    <div className="services">
      <div className="services-container">
        <div className="form-side">

          {/* Estate Search Dropdown */}
          <div className="estate-search-container">
            <label>Search Estate:</label>
            <div className="estate-search-wrapper">
              <input
                type="text"
                placeholder="Type to search estates..."
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
                  // Special case: show all estates when "0" is entered
                  if (searchValue.toLowerCase() === '0') {
                    setState(prev => ({
                      ...prev,
                      filteredEstates: prev.estates
                    }));
                  } else {
                    // Normal filtering for other cases
                    const filtered = state.estates.filter(estate => // Changed prev.estates to state.estates
                      estate.estate.toLowerCase().includes(searchValue.toLowerCase())
                    );
                    setState(prev => ({
                      ...prev,
                      filteredEstates: filtered
                    }));
                  }
                }}
                onFocus={() => setState(prev => ({ ...prev, isDropdownOpen: true }))}
              />
              <div className="estate-dropdown-indicator">▼</div>

              {state.isDropdownOpen && (
                <div className="estate-suggestions-list">
                  {state.filteredEstates.map(estate => (
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
                  {state.filteredEstates.length === 0 && (
                    <div className="no-estates-found">No matching estates found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Selected Estate Display */}
          {state.selectedEstate && (
            <div className="selected-estate-info">
              <div className="estate-info-item">
                <span className="info-label">Selected Estate:</span>
                <span className="info-value">{state.selectedEstate.estate}</span>
              </div>
              <div className="estate-info-item">
                <span className="info-label">Region:</span>
                <span className="info-value">{state.selectedEstate.region_name}</span>
              </div>
              <div className="estate-info-item">
                <span className="info-label">Plantation:</span>
                <span className="info-value">{state.selectedEstate.plantation_name}</span>
              </div>
            </div>
          )}
          <div className="mission-type">
            <label htmlFor="mission-select">Select Crop Type</label>
            <CustomDropdown options={state.cropTypes.map(({ id, crop }) => ({ id, group: crop }))} onSelect={(val) => setState(prev => ({ ...prev, selectedCropType: val }))} selectedValue={state.selectedCropType} />
          </div>
          <div className="mission-type">
            <label htmlFor="mission-select">Select Mission Type</label>
            <CustomDropdown options={state.missionTypes.map(({ mission_type_code, mission_type_name }) => ({ id: mission_type_code, group: mission_type_name }))} onSelect={(val) => setState(prev => ({ ...prev, selectedMissionType: val }))} selectedValue={state.selectedMissionType} />
          </div>
          <div className="total-extent">
            <label>Total Planned Extent for Month</label>
            <h5 className="total-ha">{state.totalPlannedExtentForMonth.toFixed(2)} ha</h5>
          </div>
          <div className="total-extent">
            <label>Total Planned Count for Month</label>
            <h5 className="total-ha">{state.totalPlannedCountForMonth}</h5>
          </div>
          <div className="total-extent-2">
            <label>Planned Area for Selected Date</label>
            <h5 className="total-ha">{state.totalAreaForDay.toFixed(2)} ha</h5>
          </div>
          <div className="total-extent-2">
            <label>Plan Count for Selected Date </label>
            <h5 className="total-ha">{state.planCountForDay} plan{state.planCountForDay !== 1 ? 's' : ''}</h5>
          </div>
          <div className="total-extent">
            <label>Total Extent for this Plan</label>
            <h5 className="total-ha" id='total-value'>{state.totalExtent.toFixed(2)} ha</h5>
          </div>
          <div className="date-area">
            {state.selectedCropType && state.selectedMissionType ? (
              <DatePicker
                selected={state.selectedDate || null}
                onChange={(date) => setState(prev => ({ ...prev, selectedDate: date }))}
                onMonthChange={handleMonthOrYearChange}
                onYearChange={handleMonthOrYearChange}
                dateFormat="yyyy/MM/dd"
                placeholderText="Select a date"
                className="date-picker"
                inline
              // dayClassName={state.isAdHocPlan ? undefined : dayClassName}  // Apply dayClassName only when not Ad-Hoc
              // minDate={state.isAdHocPlan ? undefined : today}
              />
            ) : (
              <p className="date-placeholder">Select atleast One Field, Crop Type, and Mission Type to Enable the Calendar.</p>
            )}
          </div>

          <div className="add-hoc-container">
            <label htmlFor="add-hoc-checkbox">Add-Hoc Plan</label>
            <input
              type="checkbox"
              id="add-hoc-checkbox"
              checked={state.isAdHocPlan || false}  // Ensure it's always true or false
              onChange={handleAdHocChange}  // Toggle Ad-Hoc Plan
            />
          </div>
          {state.isAdHocPlan && <span className="add-hoc-text">Enable Ad-Hoc Mission Scheduling.</span>}


          {/* Show min/max message below button if disabled for plan size and not Ad-Hoc */}
          {(!state.isAdHocPlan && !isPlanSizeValid && state.selectedEstate) && (
            <div style={{ fontSize: '0.85em', color: '#FF0000', marginTop: 4, marginBottom: 16, textAlign: 'center', marginLeft: '10px', marginRight: '10px', }}>
              Revolving Plan for {state.selectedEstate.estate} Estate Should be {state.minimumPlanSize}-{state.maximumPlanSize} ha
            </div>
          )}
          <div
            className={`button-class ${(state.isSubmitting || !isPlanSizeValid) ? 'disabled' : ''}`}
            onClick={(!state.isSubmitting && isPlanSizeValid) ? handleSubmit : undefined}
            style={{ pointerEvents: (!state.isSubmitting && isPlanSizeValid) ? 'auto' : 'none', opacity: (!state.isSubmitting && isPlanSizeValid) ? 1 : 0.5 }}
          >
            <div className="button-container">
              <div className="button-background" />
              <div className="button-text">
                {state.isSubmitting ? (
                  <Bars
                    height="20"
                    width="50"
                    color="#ffffff"
                    ariaLabel="bars-loading"
                    visible={true}
                  />
                ) : (
                  "Create a Mission"
                )}
              </div>
            </div>
          </div>

        </div>
        <div className="right-side">
          <div className="division-side">
            {state.divisionOptions.map((division) => (
              <DivisionView
                key={`${division.division_id}-${state.isAdHocPlan}`} // Updated key
                divisionName={division.division_name}
                fields={division.fields}
                handleCheckboxChange={handleFieldCheckboxChange}
                fetchedFields={fetchedFields}
                selectedFields={state.selectedFields}
                showAddHoc={state.isAdHocPlan}
                calendarData={calendarData} // New prop
                selectedDate={state.selectedDate} // New prop
                selectedMissionType={state.selectedMissionType} // New prop
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewServices;
