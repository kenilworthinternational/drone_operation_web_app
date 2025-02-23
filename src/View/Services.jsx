import React, { useEffect, useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDropdown from '../Widgets/CustomDropdown';
import DivisionView from '../Widgets/DivisionView';
import UpdateDivisionView from '../Widgets/UpdateDivisionView';
import { groupGetter, groupPlantation, groupRegion, groupEstate, divisionStateList, missionType, cropType, submitPlan, getUpdateMissionDetails } from '../Controller/api/api';
import "../css/services.css";

const Services = () => {
  const [state, setState] = useState({
    dropdownOptions: [],
    plantationOptions: [],
    regionOptions: [],
    estateOptions: [],
    missionTypes: [],
    cropTypes: [],
    divisionOptions: [],
    selectedDate: null,
    selectedGroup: null,
    selectedPlantation: null,
    selectedRegion: null,
    selectedEstate: null,
    selectedMissionType: null,
    selectedCropType: null,
    selectedFields: new Set(),
    totalExtent: 0,
    loading: true,
    update: false,
    missionId: ""
  });

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

  const fetchMissionDetails = useCallback(async () => {
    const { selectedEstate, selectedDate, selectedMissionType, selectedCropType } = state;
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
        const selectedFieldIds = (updateMissionResponse?.divisions ?? [])
          .flatMap(division => division.checkedFields?.map(field => field.field_id) ?? []);

        console.log("Selected fields from API:", updateMissionResponse);
        setState(prev => ({
          ...prev,
          update: updateMissionResponse.status !== "false",
          missionId: updateMissionResponse?.id,
        }));

        const divisions = await divisionStateList(selectedEstate.id);

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
            selectedFields: updatedSelectedFields,
            totalExtent: parseFloat(updatedTotalExtent.toFixed(2)),
            showUpdateDivisionView: updateMissionResponse?.status !== "false"
          }));
        }
      } catch (error) {
        console.error('Error fetching update mission details:', error);
      }
    }
  }, [state.selectedEstate, state.selectedDate, state.selectedMissionType, state.selectedCropType]);
  
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

  const renderDivisions = () => {
    return state.divisionOptions.map(division => {
      return state.showUpdateDivisionView ? (
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
      ) : (
        <DivisionView
          key={division.division_id}
          divisionName={division.division_name}
          fields={division.fields}
          handleCheckboxChange={handleFieldCheckboxChange}
        />
      );
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
    const { selectedGroup, selectedPlantation, selectedRegion, selectedEstate, selectedMissionType, selectedCropType, selectedDate, divisionOptions, selectedFields, totalExtent, missionId } = state;
    if (!selectedGroup || !selectedPlantation || !selectedRegion || !selectedEstate || !selectedMissionType || !selectedCropType || !selectedDate) {
      alert("All fields are required. Please fill in all fields.");
      return;
    }

    const submissionData = {
      missionId: missionId,
      estateId: selectedEstate?.id ?? null,
      missionTypeId: selectedMissionType?.id ?? null,
      cropTypeId: selectedCropType?.id ?? null,
      totalExtent: totalExtent.toFixed(2),
      divisions: divisionOptions.map(division => ({
        divisionId: division.division_id,
        checkedFields: division.fields?.filter(field => selectedFields.has(field.field_id)).map(({ field_id, field_name, field_area }) => ({ field_id, field_name, field_area })) || []
      })).filter(division => division.checkedFields.length > 0)
    };

    if (submissionData.divisions.length === 0) {
      alert("Please select at least one field before submitting.");
      return;
    }

    console.log("Data", JSON.stringify(submissionData, null, 2));
  };

  if (state.loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="services">
      <div className="services-container">
        <div className="form-side">
          <div className="date-area">
            <label htmlFor="date-name">Execution Date:</label>
            <DatePicker
              selected={state.selectedDate}
              onChange={(date) => setState(prev => ({ ...prev, selectedDate: date }))}
              dateFormat="yyyy/MM/dd"
              placeholderText="Select a date"
              className="date-picker"
              minDate={today}
            />
          </div>
          <div className="mission-type">
            <label htmlFor="mission-select">Select Crop Type</label>
            <CustomDropdown options={state.cropTypes.map(({ id, crop }) => ({ id, group: crop }))} onSelect={(val) => setState(prev => ({ ...prev, selectedCropType: val }))} selectedValue={state.selectedCropType} />
          </div>
          <div className="mission-type">
            <label htmlFor="mission-select">Select Mission Type</label>
            <CustomDropdown options={state.missionTypes.map(({ mission_type_code, mission_type_name }) => ({ id: mission_type_code, group: mission_type_name }))} onSelect={(val) => setState(prev => ({ ...prev, selectedMissionType: val }))} selectedValue={state.selectedMissionType} />
          </div>
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
          <div className="total-extent">
            <label>Total Planned Extent for the Day</label>
            <h5 className="total-ha" id='total-value'>{state.totalExtent.toFixed(2)} ha</h5>
          </div>
          {buttonVersions()}
        </div>
        <div className="right-side">
          <div className="division-side">
            {renderDivisions()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
