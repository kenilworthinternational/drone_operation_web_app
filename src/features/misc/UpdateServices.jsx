import React, { useEffect, useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDropdown from '../../components/CustomDropdown';
import DivisionView from '../../components/DivisionView';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import UpdateDivisionView from '../../components/UpdateDivisionView';
import { getUpdatedCalander, groupGetter, groupPlantation, groupRegion, groupEstate, divisionStateList, missionType, cropType, submitPlan, getUpdateMissionDetails, submitUpdatePlan } from '../../api/api';
import '../../styles/updateservices.css';

const UpdateServices = () => {
  const [state, setState] = useState({
    dropdownOptions: [],
    plantationOptions: [],
    regionOptions: [],
    estateOptions: [],
    loading: false,
    missionTypes: [],
    cropTypes: [],
    divisionOptions: [],
    highlightedDates: [],
    formattedhighlightedDates: [],
    selectedDate: null,
    selectedGroup: null,
    selectedPlantation: null,
    selectedRegion: null,
    selectedEstate: null,
    selectedMissionType: null,
    selectedCropType: null,
    selectedFields: new Set(),
    monthStartDate: "",
    monthEndDate: "",
    totalExtent: 0,
    loading: true,
    update: false,
    missionId: ""
  });
  const [loading, setLoading] = useState(false);
  const today = new Date();
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
  const fetchDataOrProcessData = async () => {
    // Simulate async operation (e.g., fetching data)
    return new Promise((resolve) => setTimeout(resolve, 2000));
  };

  const fetchMissionDetails = useCallback(async () => {
    const { selectedEstate, selectedDate, selectedMissionType, selectedCropType } = state;

    // Initialize selectedFieldIds as empty to handle the first click
    let selectedFieldIds = [];

    // // If selectedEstate is available, fetch divisions first
    // if (selectedEstate) {
    //   try {
    //     // Fetch divisions first after estate selection
    //     const divisions = await divisionStateList(selectedEstate.id);
    //     if (Array.isArray(divisions)) {
    //       // If divisions are available, set them in state
    //       setState(prev => ({
    //         ...prev,
    //         divisionOptions: divisions,
    //       }));
    //     }
    //   } catch (error) {
    //     console.error('Error fetching divisions:', error);
    //   }
    // }

    // Now check if other required fields are selected and fetch mission details
    if (selectedEstate && selectedDate && selectedMissionType && selectedCropType) {
      try {
        const payload = {
          estateId: selectedEstate.id,
          pickedDate: selectedDate.toLocaleDateString('en-CA'),
          missionTypeId: selectedMissionType.id,
          cropTypeId: selectedCropType.id
        };

        console.log("Fetching mission details with payload:", payload);

        const updateMissionResponse = await getUpdateMissionDetails(payload);
        selectedFieldIds = (updateMissionResponse?.divisions ?? [])
          .flatMap(division => division.checkedFields?.map(field => field.field_id) ?? []);

        console.log("Selected fields from API:", updateMissionResponse);

        // Set the update state based on response status
        setState(prev => ({
          ...prev,
          update: updateMissionResponse.status !== "false",
          missionId: updateMissionResponse?.id,
          selectedFields: selectedFieldIds, // Update selected fields here
        }));

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
        if (Array.isArray(divisions)) {
          const updatedSelectedFields = new Set(selectedFieldIds);

          const updatedTotalExtent = divisions.reduce((total, division) => {
            const divisionTotal = division.fields
              ?.filter(field => updatedSelectedFields.has(field.field_id))
              .reduce((sum, field) => sum + field.field_area, 0) || 0;

            console.log(`Division ${division.division_name} total: ${divisionTotal}`);
            return total + divisionTotal;
          }, 0);

          console.log("Final calculated total extent:", updatedTotalExtent);

          setState(prev => ({
            ...prev,
            divisionOptions: divisions,
            selectedFields: updatedSelectedFields.length > 0 ? new Set(updatedSelectedFields) : prev.selectedFields,
            totalExtent: updatedTotalExtent !== 0 ? parseFloat(updatedTotalExtent.toFixed(2)) : prev.totalExtent,
            showUpdateDivisionView: updateMissionResponse?.status !== "false"
            // You can store minimumPlanSize/maximumPlanSize in state if needed
          }));
        }
      } catch (error) {
        console.error('Error fetching update mission details:', error);
      }
    }
  }, [state.selectedEstate, state.selectedDate, state.selectedMissionType, state.selectedCropType]);


  const fetchAllDataCalender = useCallback(async (startDate, endDate) => {
    const { selectedEstate, selectedMissionType, selectedCropType } = state;

    if (selectedEstate && selectedMissionType && selectedCropType) {
      try {
        const payload = {
          estateId: selectedEstate.id,
          cropId: selectedCropType.id,
          missionTypeId: selectedMissionType.id,
          startDate,
          endDate,
        };

        console.log("Fetching mission details with payload:", payload);

        const updateMissionResponse = await getUpdatedCalander(payload);
        console.log(`Current Data for ${startDate}-${endDate}:`, updateMissionResponse);

        if (updateMissionResponse.status === "false") {
          const allDatesInRange = [];
          let currentDate = new Date(startDate);
          const lastDate = new Date(endDate);

          while (currentDate <= lastDate) {
            allDatesInRange.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          setState(prev => ({
            ...prev,
            highlightedDates: [],
            formattedhighlightedDates: allDatesInRange,
          }));
        } else {
          const fetchedDates = Object.values(updateMissionResponse)
            .filter(item => item?.date)
            .map(item => new Date(item.date));

          const firstDay = new Date(startDate);
          const lastDay = new Date(endDate);
          let allDates = [];
          let currentDate = new Date(firstDay);

          while (currentDate <= lastDay) {
            allDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          const missingDates = allDates.filter(date =>
            !fetchedDates.some(highlighted => highlighted.toDateString() === date.toDateString())
          );

          setState(prev => ({
            ...prev,
            highlightedDates: fetchedDates,
            formattedhighlightedDates: missingDates,
          }));
        }

        setState(prev => ({
          ...prev,
          update: updateMissionResponse.status !== "false",
          missionId: updateMissionResponse?.id,
        }));
      } catch (error) {
        console.error('Error fetching update mission details:', error);
      }
    }
  }, [state.selectedEstate, state.selectedMissionType, state.selectedCropType]);

  const handleMonthChange = async (date) => {
    const monthStartDate = format(startOfMonth(date), 'yyyy-MM-dd');
    const monthEndDate = format(endOfMonth(date), 'yyyy-MM-dd');
    setState(prev => ({ ...prev, monthStartDate, monthEndDate }));
    await fetchAllDataCalender(monthStartDate, monthEndDate);
  };

  const handleYearChange = async (date) => {
    const monthStartDate = format(startOfMonth(date), 'yyyy-MM-dd');
    const monthEndDate = format(endOfMonth(date), 'yyyy-MM-dd');
    setState(prev => ({ ...prev, monthStartDate, monthEndDate }));
    await fetchAllDataCalender(monthStartDate, monthEndDate);
  };

  const handleFieldCheckboxChange = (fieldId, fieldArea, isChecked) => {
    console.log(`Checkbox changed: fieldId=${fieldId}, fieldArea=${fieldArea}, isChecked=${isChecked}`);

    setState((prev) => {
      const updatedSelectedFields = new Set(prev.selectedFields);
      let updatedTotalExtent = prev.totalExtent;

      if (isChecked) {
        updatedSelectedFields.add(fieldId);
        updatedTotalExtent += fieldArea;
        console.log(`updatedTotalExtent =${updatedTotalExtent} fieldArea =${fieldArea} `)
      } else {
        updatedSelectedFields.delete(fieldId);
        updatedTotalExtent -= fieldArea;
      }

      updatedTotalExtent = parseFloat(updatedTotalExtent.toFixed(2));

      return {
        ...prev,
        selectedFields: updatedSelectedFields,
        totalExtent: updatedTotalExtent
      };
    });
  };


  const buttonVersions = () => {
    return state.update ? (
      <div className="button-class" onClick={handleUpdate}>
        <div className="button-container">
          <div className="button-background" />
          <div className="button-text">Update a Mission</div>
        </div>
      </div>
    ) : (
      <div className="button-class" onClick={handleSubmit}>
        <div className="button-container">
          <div className="button-background" />
          <div className="button-text">Create a Mission</div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchMissionDetails();
  }, [fetchMissionDetails]);

  useEffect(() => {
    const fetchData = async () => {
      const { selectedEstate, selectedMissionType, selectedCropType } = state;
      const currentDate = new Date();
      const startdate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toLocaleDateString('en-CA');
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toLocaleDateString('en-CA');

      // Ensure that all required fields are selected before fetching
      if (selectedEstate && selectedMissionType && selectedCropType) {
        await fetchAllDataCalender(startdate, endDate); // Fetch data with current date range
      }
    };

    fetchData(); // This will run every time any of the dependencies change
  }, [
    state.selectedEstate,
    state.selectedMissionType,
    state.selectedCropType,
    state.selectedGroup,
    state.selectedPlantation,
    state.selectedRegion,
    state.selectedDate
  ]);


  const handleDropdownSelect = async (type, id, fetchFunc, nextOptionsKey) => {
    setState(prev => {
      let updatedState = { ...prev, [type]: id };

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
    const { selectedGroup, selectedPlantation, selectedRegion, selectedEstate, selectedMissionType, selectedCropType, selectedDate, divisionOptions, selectedFields, totalExtent } = state;
    if (!selectedGroup || !selectedPlantation || !selectedRegion || !selectedEstate || !selectedMissionType || !selectedCropType || !selectedDate) {
      alert("All fields are required. Please fill in all fields.");
      return;
    }

    const submissionData = {
      groupId: selectedGroup?.id ?? null,
      plantationId: selectedPlantation?.id ?? null,
      regionId: selectedRegion?.id ?? null,
      estateId: selectedEstate?.id ?? null,
      missionTypeId: selectedMissionType?.id ?? null,
      cropTypeId: selectedCropType?.id ?? null,
      totalExtent: totalExtent.toFixed(2),
      pickedDate: selectedDate.toLocaleDateString('en-CA'),
      divisions: divisionOptions.map(division => ({
        divisionId: division.division_id,
        checkedFields: division.fields?.filter(field => selectedFields.has(field.field_id)).map(({ field_id, field_name, field_area }) => ({ field_id, field_name, field_area })) || []
      })).filter(division => division.checkedFields.length > 0)
    };

    if (submissionData.divisions.length === 0) {
      alert("Please select at least one field before submitting.");
      return;
    }

    try {
      const result = await submitPlan(submissionData);
      if (result.status === "true") {
        alert("Submission successful!");
        setState({
          ...state,
          selectedGroup: null,
          selectedPlantation: null,
          selectedRegion: null,
          selectedEstate: null,
          selectedMissionType: null,
          selectedCropType: null,
          totalExtent: 0,
          selectedDate: null,
          divisionOptions: [],
          selectedFields: new Set()
        });
      } else {
        alert("Submission failed: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error('Submission Error:', error);
      alert("An error occurred while submitting. Please try again.");
    }
  };

  const handleUpdate = async () => {
    const { selectedEstate, selectedMissionType, selectedCropType, selectedDate, divisionOptions, selectedFields, totalExtent, missionId } = state;

    if (!selectedEstate || !selectedMissionType || !selectedCropType || !selectedDate) {
      alert("All fields are required. Please fill in all fields.");
      return;
    }

    const submissionData = {
      missionId,
      estateId: selectedEstate?.id ?? null,
      missionTypeId: selectedMissionType?.id ?? null,
      cropTypeId: selectedCropType?.id ?? null,
      totalExtent: totalExtent.toFixed(2),
      pickedDate: selectedDate.toLocaleDateString('en-CA'),
      divisions: divisionOptions.map(division => ({
        divisionId: division.division_id,
        checkedFields: division.fields?.filter(field => selectedFields.has(field.field_id)).map(({ field_id, field_name, field_area }) => ({ field_id, field_name, field_area })) || []
      })).filter(division => division.checkedFields.length > 0)
    };

    if (submissionData.divisions.length === 0) {
      alert("Please select at least one field before updating.");
      return;
    }

    try {
      const result = await submitUpdatePlan(submissionData);
      if (result.success) {
        alert("Update successful!");
        setState({
          ...state,
          selectedGroup: null,
          selectedPlantation: null,
          selectedRegion: null,
          selectedEstate: null,
          selectedMissionType: null,
          selectedCropType: null,
          totalExtent: 0,
          selectedDate: null,
          divisionOptions: [],
          selectedFields: new Set(),
        });
      } else {
        alert("Update failed: " + result.message);
      }
    } catch (error) {
      console.error('Update Error:', error);
      alert("An error occurred while updating. Please try again.");
    }
  };
  const dayClassName = (date) => {
    const formattedDate = date.toDateString();

    // Check if loading is true and apply a loading class to the day
    if (state.loading) {
      return "react-datepicker__day--loading"; // Add this class when loading
    }

    if (state.highlightedDates.some(d => d.toDateString() === formattedDate)) {
      return "react-datepicker__day--highlighted"; // Highlighted dates (enabled)
    }

    if (state.formattedhighlightedDates.some(d => d.toDateString() === formattedDate)) {
      return "react-datepicker__day--highlighted disabled"; // Formatted dates (disabled)
    }

    return ""; // Default class
  };

  useEffect(() => {
    if (state.selectedDate) {
      const fetchData = async () => {
        try {
          await fetchAllDataCalender(state.monthStartDate, state.monthEndDate);
        } catch (error) {
          console.error("Error fetching calendar data:", error);
        }
      };

      fetchData(); // This will be called whenever selectedDate changes
    }
  }, [state.selectedDate, state.monthStartDate, state.monthEndDate]); // Dependencies for when the date changes

  if (state.loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="services">
      <div className="services-container">
        <div className="form-side">

          <div className="group-select">
            <label>Select Group</label>
            <CustomDropdown options={state.dropdownOptions} onSelect={(val) => handleDropdownSelect('selectedGroup', val, groupPlantation, 'plantationOptions')} selectedValue={state.selectedGroup} />
          </div>
          <div className="group-select">
            <label>Select Plantation</label>
            <CustomDropdown options={state.plantationOptions.map(({ id, plantation }) => ({ id, group: plantation }))} onSelect={(val) => handleDropdownSelect('selectedPlantation', val, groupRegion, 'regionOptions')} selectedValue={state.selectedPlantation} />
          </div>
          <div className="group-select">
            <label>Select Region</label>
            <CustomDropdown options={state.regionOptions.map(({ id, region }) => ({ id, group: region }))} onSelect={(val) => handleDropdownSelect('selectedRegion', val, groupEstate, 'estateOptions')} selectedValue={state.selectedRegion} />
          </div>
          <div className="group-select">
            <label>Select Estate</label>
            <CustomDropdown options={state.estateOptions.map(({ id, estate }) => ({ id, group: estate }))} onSelect={(val) => setState(prev => ({ ...prev, selectedEstate: val }))} selectedValue={state.selectedEstate} />
          </div>


          <div className="mission-type">
            <label htmlFor="mission-select">Select Crop Type</label>
            <CustomDropdown options={state.cropTypes.map(({ id, crop }) => ({ id, group: crop }))} onSelect={(val) => setState(prev => ({ ...prev, selectedCropType: val }))} selectedValue={state.selectedCropType} />
          </div>
          <div className="mission-type">
            <label htmlFor="mission-select">Select Mission Type</label>
            <CustomDropdown options={state.missionTypes.map(({ mission_type_code, mission_type_name }) => ({ id: mission_type_code, group: mission_type_name }))} onSelect={(val) => setState(prev => ({ ...prev, selectedMissionType: val }))} selectedValue={state.selectedMissionType} />
          </div>
          <div className="total-extent">
            <label>Total Planned Extent for the Day</label>
            <h5 className="total-ha" id='total-value'>{state.totalExtent.toFixed(2)} ha</h5>
          </div>
          <div className="date-area">
            <DatePicker
              selected={state.selectedDate}
              onChange={async (date) => {
                if (loading) return; // Prevent multiple clicks while loading
                setLoading(true); // Set loading to true

                setState(prev => ({
                  ...prev,
                  selectedDate: date,
                }));

                // Simulate data fetching
                await fetchDataOrProcessData();

                setLoading(false); // Set loading to false when done
              }}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
              dateFormat="yyyy/MM/dd"
              placeholderText="Select a date"
              className="date-picker"
              minDate={today}
              inline
              disabled={
                loading ||
                !state.selectedGroup ||
                !state.selectedPlantation ||
                !state.selectedRegion ||
                !state.selectedEstate ||
                !state.selectedMissionType ||
                !state.selectedCropType
              }
              dayClassName={dayClassName} // Add day className with loading logic

            />

          </div>


          {buttonVersions()}
        </div>
        <div className="right-side">
          <div className="division-side">
          {state.divisionOptions.map((division) => (
            <UpdateDivisionView
              key={division.division_id}
              divisionName={division.division_name}
              fields={division.fields}
              handleCheckboxChange={handleFieldCheckboxChange}
              estateId={state.selectedEstate?.id}
              missionTypeId={state.selectedMissionType?.id}
              cropTypeId={state.selectedCropType?.id}
              pickedDate={state.selectedDate}
            />
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateServices;
