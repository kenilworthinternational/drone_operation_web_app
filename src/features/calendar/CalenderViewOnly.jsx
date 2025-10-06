import React, { useEffect, useState } from "react";
import '../../styles/calenderview.css';
import CalenderWidgetViewonly from './CalenderWidgetViewOnly';
import CustomDropdown from '../../components/CustomDropdown';
import BarChartWidget2 from '../../components/BarChartWidget2';
import PieChartWidget from '../../components/PieChartWidget';
import { Tabs, Tab } from '@mui/material';
import EventIcon from '@mui/icons-material/Event'; // Calendar icon
import InsertChartIcon from '@mui/icons-material/InsertChart'; // Chart icon

import {
  groupGetter,
  groupPlantation,
  groupRegion,
  groupEstate,
  getSummaryDataGroupAll,
  getSummaryDataPlantationAll,
  getSummaryDataRegionAll,
  getSummaryDataEstateAll
} from '../../api/api';

const CalenderViewOnly = () => {
  const [state, setState] = useState({
    dropdownOptions: [],
    plantationOptions: [],
    regionOptions: [],
    estateOptions: [],
    calendarData: [],
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("calendar"); // Track active tab (calendar or chart)

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

  const fetchCalendarData = async (type, id) => {
    let fetchFunc;
    switch (type) {
      case 'selectedGroup':
        fetchFunc = getSummaryDataGroupAll;
        break;
      case 'selectedPlantation':
        fetchFunc = getSummaryDataPlantationAll;
        break;
      case 'selectedRegion':
        fetchFunc = getSummaryDataRegionAll;
        break;
      case 'selectedEstate':
        fetchFunc = getSummaryDataEstateAll;
        break;
      default:
        return;
    }

    try {
      const data = await fetchFunc(id);
      if (data && data.status === "true") {
        const formattedData = Object.values(data).filter(item => typeof item === "object");
        console.log("Formatted calendarData:", formattedData);
        setState(prev => ({
          ...prev,
          calendarData: formattedData,
        }));
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    }
  };

  const handleDropdownSelect = async (type, id, fetchFunc, nextOptionsKey) => {
    setState(prev => {
      let updatedState = { ...prev, [type]: id, calendarData: [] };

      if (type === 'selectedGroup') {
        updatedState = {
          ...updatedState,
          selectedPlantation: null,
          selectedRegion: null,
          selectedEstate: null,
          plantationOptions: [],
          regionOptions: [],
          estateOptions: []
        };
      } else if (type === 'selectedPlantation') {
        updatedState = {
          ...updatedState,
          selectedRegion: null,
          selectedEstate: null,
          regionOptions: [],
          estateOptions: []
        };
      } else if (type === 'selectedRegion') {
        updatedState = { ...updatedState, selectedEstate: null, estateOptions: [] };
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

    await fetchCalendarData(type, id);
  };

  return (
    <div className="calender-view-main">
      {/* Always Visible Selection Section */}
      <div className="calender-part">
        <div className="top-section">
          <div className="sec1">
            <div className="summery-group-select">
              <label>Select Group</label>
              <CustomDropdown
                options={state.dropdownOptions}
                onSelect={(val) => handleDropdownSelect('selectedGroup', val, groupPlantation, 'plantationOptions')}
                selectedValue={state.selectedGroup}
              />
            </div>
            <div className="summery-group-select">
              <label>Select Plantations</label>
              <CustomDropdown
                options={state.plantationOptions.map(({ id, plantation }) => ({ id, group: plantation }))}
                onSelect={(val) => handleDropdownSelect('selectedPlantation', val, groupRegion, 'regionOptions')}
                selectedValue={state.selectedPlantation}
              />
            </div>
          </div>
          <div className="sec2">
            <div className="summery-group-select">
              <label>Select Region</label>
              <CustomDropdown
                options={state.regionOptions.map(({ id, region }) => ({ id, group: region }))}
                onSelect={(val) => handleDropdownSelect('selectedRegion', val, groupEstate, 'estateOptions')}
                selectedValue={state.selectedRegion}
              />
            </div>
            <div className="summery-group-select">
              <label>Select Estate</label>
              <CustomDropdown
                options={state.estateOptions.map(({ id, estate }) => ({ id, group: estate }))}
                onSelect={(val) => {
                  setState(prev => ({ ...prev, selectedEstate: val }));
                  fetchCalendarData('selectedEstate', val);
                }}
                selectedValue={state.selectedEstate}
              />
            </div>
            
          </div>
          <div className="calendar-header">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))}
          >
            &lt;&lt;
          </button>
          <span>{currentMonth.getFullYear()}</span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))}
          >
            &gt;&gt;
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          >
            &lt;
          </button>
          <span>{currentMonth.toLocaleString('default', { month: 'long' })}</span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          >
            &gt;
          </button>

          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)} // Update activeTab state on tab change
            aria-label="icon position tabs example"
          >
            <Tab icon={<EventIcon />} label="Calendar View" value="calendar" />
            <Tab icon={<InsertChartIcon />} label="Chart View" value="chart" />
          </Tabs>
        </div>
        </div>
      </div>

      <div className="bottom-section">
        {/* Navigation header */}
        

        {/* Conditionally render based on active tab */}
        {activeTab === "calendar" && (
          <div className="calender-section">
            <h2>Our CalendarView</h2>
            <div className="calendar-container">
              <CalenderWidgetViewonly tasksData={state.calendarData} currentMonth={currentMonth} />
            </div>
          </div>
        )}

        {activeTab === "chart" && (
          <div className="chart-section">
            <div className="top-charts">
              <div className="total-chart">
                {/* Bar chart widget */}
                <BarChartWidget2
                  dropdownValues={{
                    selectedGroup: state.selectedGroup,
                    selectedPlantation: state.selectedPlantation,
                    selectedRegion: state.selectedRegion,
                    selectedEstate: state.selectedEstate,
                  }}
                  currentDate={currentMonth}
                />
              </div>
              <div className="planned-chart">
                {/* Pie chart widget */}
                <PieChartWidget
                  dropdownValues={{
                    selectedGroup: state.selectedGroup,
                    selectedPlantation: state.selectedPlantation,
                    selectedRegion: state.selectedRegion,
                    selectedEstate: state.selectedEstate,
                  }}
                  currentDate={currentMonth}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalenderViewOnly;
