import React, { useEffect, useState } from "react";
import SummaryWidget from "../Widgets/SummaryWidget";
import "../css/summeryview.css";
import { groupGetter, groupPlantation, groupRegion, groupEstate } from '../Controller/api/api';
import CustomDropdown from '../Widgets/CustomDropdown';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { getSummaryDataGroup, getSummaryDataPlantation, getSummaryDataRegion, getSummaryDataEstate } from "../Controller/api/api";

const SummeryView = () => {
  const [state, setState] = useState({
    dropdownOptions: [],
    plantationOptions: [],
    regionOptions: [],
    estateOptions: [],
    startDate: new Date(),
    endDate: new Date(),
    selectedGroup: null,
    selectedPlantation: null,
    selectedRegion: null,
    selectedEstate: null,
    summaryData: [],
    hasSearched: false,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [groups] = await Promise.all([groupGetter()]);
        setState(prev => ({
          ...prev,
          dropdownOptions: Array.isArray(groups) ? groups : [],
        }));
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const handleDropdownSelect = async (type, id, fetchFunc, nextOptionsKey) => {
    setState(prev => {
      let updatedState = { ...prev, [type]: id, summaryData: [], hasSearched: false };

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
  const handleSearch = async () => {
    const { selectedGroup, selectedPlantation, selectedRegion, selectedEstate, startDate, endDate } = state;

    const formattedStartDate = startDate.toLocaleDateString('en-CA');
    const formattedEndDate = endDate.toLocaleDateString('en-CA');

    let fetchedData = [];

    const groupId = selectedGroup ? selectedGroup.id : null;
    const plantationId = selectedPlantation ? selectedPlantation.id : null;
    const regionId = selectedRegion ? selectedRegion.id : null;
    const estateId = selectedEstate ? selectedEstate.id : null;

    if (groupId && !selectedPlantation) {
      fetchedData = await getSummaryDataGroup(groupId, formattedStartDate, formattedEndDate);
    } else if (selectedPlantation && !selectedRegion) {
      fetchedData = await getSummaryDataPlantation(plantationId, formattedStartDate, formattedEndDate);
    } else if (selectedRegion && !selectedEstate) {
      fetchedData = await getSummaryDataRegion(regionId, formattedStartDate, formattedEndDate);
    } else if (selectedEstate) {
      fetchedData = await getSummaryDataEstate(estateId, formattedStartDate, formattedEndDate);
    }

    console.log("Fetched Data", fetchedData);  // Ensure the structure is as expected

    setState(prev => ({
      ...prev,
      summaryData: Array.isArray(fetchedData) ? fetchedData : [],
      hasSearched: true,  // Ensure it's an array
    }));
  };

  const formatData = (data) => {
    if (!data || data.length === 0) {
      return [];
    }

    return data.map(item => {
      const formattedTeams = item.selectedPilots?.map((pilot, index) => {
        // Find the corresponding drone by index (assuming they align in order)
        const drone = item.selectedDrones?.[index];

        return {
          id: pilot.id,
          name: pilot.name,
          mobile_no: pilot.mobile_no,
          image: pilot.image,
          droneTag: drone ? drone.tag : 'N/A',  // If no drone, show 'N/A'
          leadProfilePic: pilot.isLeader ? pilot.image : '',  // Only set for leader
          leadPhone: pilot.isLeader ? pilot.mobile_no : ''  // Only set for leader
        };
      }) || [];

      return {
        date: item.selectedMission?.date || '',
        estate: item.selectedMission?.estate || '',
        hectares: item.selectedMission?.area || 0,
        teams: formattedTeams
      };
    });
  };



  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="custom-date-input" onClick={onClick} ref={ref}>
      <input
        type="text"
        value={value}
        readOnly
        className="date-picker-input"
        onClick={onClick} // Ensure input can trigger the DatePicker
      />
      <FaCalendarAlt className="calendar-icon" />
    </div>
  ));

  const renderNoPlansMessage = () => {
    const { selectedGroup, selectedPlantation, selectedRegion, selectedEstate, startDate, endDate, hasSearched } = state;
  
    if (!hasSearched) return null; // Show message only after search
  
    const formattedStartDate = startDate.toLocaleDateString('en-CA');
    const formattedEndDate = endDate.toLocaleDateString('en-CA');
    let message = 'No data available';
    if (selectedGroup && !selectedPlantation) message = `No Plans Available for ${selectedGroup.group} Group from ${formattedStartDate} to ${formattedEndDate}`;
    else if (selectedPlantation && !selectedRegion) message = `No Plans Available for ${selectedPlantation.group} from ${formattedStartDate} to ${formattedEndDate}`;
    else if (selectedRegion && !selectedEstate) message = `No Plans Available for ${selectedRegion.group} Region from ${formattedStartDate} to ${formattedEndDate}`;
    else if (selectedEstate) message = `No Plans Available for ${selectedEstate.group} Estate from ${formattedStartDate} to ${formattedEndDate}`;
  
    return (
      <div className="no-plans-container">
        <img src="/assets/images/no-data.png" alt="No Data" className="no-plans-image" />
        <span className="no-plans-message">{message}</span>
      </div>
    );
    
  };
  

  return (
    <div className="summery-view">
      <div className="summery-up">
        <div className="sec1">
          <div className="summery-group-select">
            <label>Select Group</label>
            <CustomDropdown options={state.dropdownOptions} onSelect={(val) => handleDropdownSelect('selectedGroup', val, groupPlantation, 'plantationOptions')} selectedValue={state.selectedGroup} />
          </div>
          <div className="summery-group-select">
            <label>Select Plantation</label>
            <CustomDropdown options={state.plantationOptions.map(({ id, plantation }) => ({ id, group: plantation }))} onSelect={(val) => handleDropdownSelect('selectedPlantation', val, groupRegion, 'regionOptions')} selectedValue={state.selectedPlantation} />
          </div>
        </div>
        <div className="sec2">
          <div className="summery-group-select">
            <label>Select Region</label>
            <CustomDropdown options={state.regionOptions.map(({ id, region }) => ({ id, group: region }))} onSelect={(val) => handleDropdownSelect('selectedRegion', val, groupEstate, 'estateOptions')} selectedValue={state.selectedRegion} />
          </div>
          <div className="summery-group-select">
            <label>Select Estate</label>
            <CustomDropdown options={state.estateOptions.map(({ id, estate }) => ({ id, group: estate }))} onSelect={(val) => setState(prev => ({ ...prev, selectedEstate: val }))} selectedValue={state.selectedEstate} />
          </div>
        </div>
        <div className="sec3">
          {/* Date Range Picker */}
          <div className="date-range-picker-summery">
            <label>Select Date Range</label>
            <div className="date-picker-summery">
              <DatePicker
                selected={state.startDate}
                onChange={date => setState(prev => ({ ...prev, startDate: date }))}
                selectsStart
                startDate={state.startDate}
                endDate={state.endDate}
                placeholderText="Start Date"
                dateFormat="yyyy/MM/dd"
                customInput={<CustomDateInput />}
              />
              <span className="to-date">to</span>
              <DatePicker
                selected={state.endDate}
                onChange={date => setState(prev => ({ ...prev, endDate: date }))}
                selectsEnd
                startDate={state.startDate}
                endDate={state.endDate}
                minDate={state.startDate}
                placeholderText="End Date"
                dateFormat="yyyy/MM/dd"
                customInput={<CustomDateInput />}
              />
            </div>
          </div>
          <button
            className={`search-btn ${!state.selectedGroup ? "disabled" : ""}`}
            onClick={handleSearch}
            disabled={!state.selectedGroup}
          >
            Search
          </button>


        </div>
      </div>

      <div className="summery-down">
        <div className="summary-widget-container">
          {state.summaryData.length > 0 ? (
            formatData(state.summaryData).map((data, index) => (
              <SummaryWidget
                key={index}
                date={data.date}
                estate={data.estate}
                hectares={data.hectares}
                teams={data.teams}
              />
            ))
          ) : (
            <div>{renderNoPlansMessage()}</div>  // Handle the case where there's no data
          )}
        </div>
      </div>


    </div>
  );
};

export default SummeryView;
