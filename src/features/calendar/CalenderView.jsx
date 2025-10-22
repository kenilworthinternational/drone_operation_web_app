import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import '../../styles/calenderview.css';
import CalenderWidget from './CalenderWidget';
import CustomDropdown from '../../components/CustomDropdown';
import { FaArrowCircleDown, FaArrowCircleUp, FaUndo } from "react-icons/fa";
import { Bars } from "react-loader-spinner";
import {
  groupGetter,
  groupPlantation,
  groupRegion,
  groupEstate,
  getSummaryDataGroupAllDateRange,
  getSummaryDataPlantationAllDateRange,
  getSummaryDataRegionAllDateRange,
  getSummaryDataEstateAllDateRange,
  getSummaryDataAllDateRange
} from '../../api/api';

const CalenderView = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Determine which section this calendar is for
  const getCalendarSection = () => {
    if (currentPath.includes('/corporate')) return 'corporate';
    if (currentPath.includes('/management')) return 'management';
    if (currentPath.includes('/opsroom')) return 'opsroom';
    return 'default';
  };
  
  const calendarSection = getCalendarSection();
  const [state, setState] = useState({
    dropdownOptions: [],
    plantationOptions: [],
    regionOptions: [],
    estateOptions: [],
    calendarData: [],
    selectedGroup: null,
    selectedPlantation: null,
    selectedRegion: null,
    selectedEstate: null,
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isTopExpanded, setIsTopExpanded] = useState(true);
  const userData = JSON.parse(localStorage.getItem('userData'));
  const [isLoading, setIsLoading] = useState({
    plantation: false,
    region: false,
    estate: false,
  });

  // Helper function to determine user restrictions
  const getUserRestrictions = () => {
    const restrictions = {
      hasGroupRestriction: userData?.group && userData.group !== 0,
      hasPlantationRestriction: userData?.plantation && userData.plantation !== 0,
      hasRegionRestriction: userData?.region && userData.region !== 0,
      hasEstateRestriction: userData?.estate && userData.estate !== 0,
    };
    return restrictions;
  };

  // Helper function to get start and end dates of current month
  const getMonthDateRange = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const restrictions = getUserRestrictions();
        
        // Always fetch groups first
        const [groups] = await Promise.all([groupGetter()]);
        
        // Set initial state based on user restrictions
        let initialState = {
          dropdownOptions: Array.isArray(groups) ? groups : [],
          selectedGroup: restrictions.hasGroupRestriction ? userData.group : null,
          selectedPlantation: restrictions.hasPlantationRestriction ? userData.plantation : null,
          selectedRegion: restrictions.hasRegionRestriction ? userData.region : null,
          selectedEstate: restrictions.hasEstateRestriction ? userData.estate : null,
        };

        setState(prev => ({
          ...prev,
          ...initialState
        }));

        // Fetch cascade data based on restrictions
        await fetchCascadeData(restrictions);

        // Fetch calendar data based on the highest restriction level
        await fetchInitialCalendarData(restrictions);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Helper function to fetch cascade data based on user restrictions
  const fetchCascadeData = async (restrictions) => {
    try {
      // If group is restricted, fetch plantations for that group
      if (restrictions.hasGroupRestriction) {
        setIsLoading(prev => ({ ...prev, plantation: true }));
        const plantations = await groupPlantation(userData.group);
        setState(prev => ({ ...prev, plantationOptions: Array.isArray(plantations) ? plantations : [] }));
        setIsLoading(prev => ({ ...prev, plantation: false }));
      }

      // If plantation is restricted, fetch regions for that plantation
      if (restrictions.hasPlantationRestriction) {
        setIsLoading(prev => ({ ...prev, region: true }));
        const regions = await groupRegion(userData.plantation);
        setState(prev => ({ ...prev, regionOptions: Array.isArray(regions) ? regions : [] }));
        setIsLoading(prev => ({ ...prev, region: false }));
      }

      // If region is restricted, fetch estates for that region
      if (restrictions.hasRegionRestriction) {
        setIsLoading(prev => ({ ...prev, estate: true }));
        const estates = await groupEstate(userData.region);
        setState(prev => ({ ...prev, estateOptions: Array.isArray(estates) ? estates : [] }));
        setIsLoading(prev => ({ ...prev, estate: false }));
      }
    } catch (error) {
      console.error('Error fetching cascade data:', error);
    }
  };

  // Helper function to fetch initial calendar data
  const fetchInitialCalendarData = async (restrictions) => {
    try {
      // Determine which level to fetch data for based on restrictions
      if (restrictions.hasEstateRestriction) {
        await fetchCalendarDataForMonth('selectedEstate', userData.estate);
      } else if (restrictions.hasRegionRestriction) {
        await fetchCalendarDataForMonth('selectedRegion', userData.region);
      } else if (restrictions.hasPlantationRestriction) {
        await fetchCalendarDataForMonth('selectedPlantation', userData.plantation);
      } else if (restrictions.hasGroupRestriction) {
        await fetchCalendarDataForMonth('selectedGroup', userData.group);
      } else {
        await fetchCalendarDataForMonth('all', null);
      }
    } catch (error) {
      console.error('Error fetching initial calendar data:', error);
    }
  };

  const fetchCalendarDataForMonth = async (type, id) => {
    const { startDate, endDate } = getMonthDateRange(currentMonth);

    let fetchFunc;
    switch (type) {
      case 'all':
        fetchFunc = getSummaryDataAllDateRange;
        break;
      case 'selectedGroup':
        fetchFunc = getSummaryDataGroupAllDateRange;
        break;
      case 'selectedPlantation':
        fetchFunc = getSummaryDataPlantationAllDateRange;
        break;
      case 'selectedRegion':
        fetchFunc = getSummaryDataRegionAllDateRange;
        break;
      case 'selectedEstate':
        fetchFunc = getSummaryDataEstateAllDateRange;
        break;
      default:
        return;
    }

    try {
      let data;
      if (type === 'all') {
        data = await fetchFunc(startDate, endDate);
      } else {
        data = await fetchFunc(id, startDate, endDate);
      }

      if (data?.status === "true") {
        const formattedData = Object.values(data).filter(item => typeof item === "object");
        setState(prev => ({ ...prev, calendarData: formattedData }));
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    }
  };

  // Helper function to get the current effective selection
  const getCurrentEffectiveSelection = () => {
    const restrictions = getUserRestrictions();
    
    // Return the highest priority selection (estate > region > plantation > group)
    if (restrictions.hasEstateRestriction || state.selectedEstate) {
      return {
        type: 'selectedEstate',
        id: state.selectedEstate || userData.estate
      };
    } else if (restrictions.hasRegionRestriction || state.selectedRegion) {
      return {
        type: 'selectedRegion',
        id: state.selectedRegion || userData.region
      };
    } else if (restrictions.hasPlantationRestriction || state.selectedPlantation) {
      return {
        type: 'selectedPlantation',
        id: state.selectedPlantation || userData.plantation
      };
    } else if (restrictions.hasGroupRestriction || state.selectedGroup) {
      return {
        type: 'selectedGroup',
        id: state.selectedGroup || userData.group
      };
    } else {
      return {
        type: 'all',
        id: null
      };
    }
  };

  useEffect(() => {
    const refetchDataForNewMonth = async () => {
      const currentSelection = getCurrentEffectiveSelection();
      await fetchCalendarDataForMonth(currentSelection.type, currentSelection.id);
    };

    refetchDataForNewMonth();
  }, [currentMonth, state.selectedGroup, state.selectedPlantation, state.selectedRegion, state.selectedEstate]);

  const toggleTopSection = () => {
    setIsTopExpanded(!isTopExpanded);
  };

  const handleDropdownSelect = async (type, id, fetchFunc, nextOptionsKey) => {
    const restrictions = getUserRestrictions();
    
    if (id === null) {
      // Only allow reset if no restrictions apply
      if (!restrictions.hasGroupRestriction && !restrictions.hasPlantationRestriction && 
          !restrictions.hasRegionRestriction && !restrictions.hasEstateRestriction) {
        setState(prev => ({
          ...prev,
          selectedGroup: null,
          selectedPlantation: null,
          selectedRegion: null,
          selectedEstate: null,
          plantationOptions: [],
          regionOptions: [],
          estateOptions: [],
        }));
        await fetchCalendarDataForMonth('all', null);
      }
      return;
    }

    setState(prev => {
      let updatedState = { ...prev, [type]: id, calendarData: [] };

      if (type === 'selectedGroup') {
        // Only reset downstream if they don't have restrictions
        updatedState = {
          ...updatedState,
          selectedPlantation: restrictions.hasPlantationRestriction ? userData.plantation : null,
          selectedRegion: restrictions.hasRegionRestriction ? userData.region : null,
          selectedEstate: restrictions.hasEstateRestriction ? userData.estate : null,
          plantationOptions: [],
          regionOptions: [],
          estateOptions: []
        };
      } else if (type === 'selectedPlantation') {
        updatedState = {
          ...updatedState,
          selectedRegion: restrictions.hasRegionRestriction ? userData.region : null,
          selectedEstate: restrictions.hasEstateRestriction ? userData.estate : null,
          regionOptions: [],
          estateOptions: []
        };
      } else if (type === 'selectedRegion') {
        updatedState = { 
          ...updatedState, 
          selectedEstate: restrictions.hasEstateRestriction ? userData.estate : null, 
          estateOptions: [] 
        };
      }

      return updatedState;
    });

    if (fetchFunc) {
      const loadingKey = nextOptionsKey.replace('Options', '').toLowerCase();
      try {
        setIsLoading(prev => ({ ...prev, [loadingKey]: true }));
        const options = await fetchFunc(id);
        setState(prev => ({ ...prev, [nextOptionsKey]: Array.isArray(options) ? options : [] }));
      } catch (error) {
        console.error(`Error fetching ${nextOptionsKey}:`, error);
      } finally {
        setIsLoading(prev => ({ ...prev, [loadingKey]: false }));
      }
    }

    await fetchCalendarDataForMonth(type, id);
  };

  const handleReset = async () => {
    const restrictions = getUserRestrictions();
    
    // Only allow reset if no restrictions apply
    if (!restrictions.hasGroupRestriction && !restrictions.hasPlantationRestriction && 
        !restrictions.hasRegionRestriction && !restrictions.hasEstateRestriction) {
      setState(prev => ({
        ...prev,
        selectedGroup: null,
        selectedPlantation: null,
        selectedRegion: null,
        selectedEstate: null,
        plantationOptions: [],
        regionOptions: [],
        estateOptions: [],
      }));
      await fetchCalendarDataForMonth('all', null);
    }
  };

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
  };

  // Check if dropdown should be disabled based on user restrictions
  const isDropdownDisabled = (type) => {
    const restrictions = getUserRestrictions();
    switch (type) {
      case 'group':
        return restrictions.hasGroupRestriction;
      case 'plantation':
        return restrictions.hasPlantationRestriction;
      case 'region':
        return restrictions.hasRegionRestriction;
      case 'estate':
        return restrictions.hasEstateRestriction;
      default:
        return false;
    }
  };

  // Check if reset button should be disabled
  const isResetDisabled = () => {
    const restrictions = getUserRestrictions();
    return restrictions.hasGroupRestriction || restrictions.hasPlantationRestriction || 
           restrictions.hasRegionRestriction || restrictions.hasEstateRestriction;
  };

  // Get display name for restricted dropdowns
  const getRestrictedDisplayName = (type) => {
    switch (type) {
      case 'group':
        return userData?.group_name || `Group ${userData?.group}`;
      case 'plantation':
        return userData?.plantation_name || `Plantation ${userData?.plantation}`;
      case 'region':
        return userData?.region_name || `Region ${userData?.region}`;
      case 'estate':
        return userData?.estate_name || `Estate ${userData?.estate}`;
      default:
        return '';
    }
  };

  return (
    <div className="calendar-view-main">
      <div className="top-section-header">
          <div className="top-section-controls">
            <button
              className="toggle-button"
              onClick={toggleTopSection}
              aria-label={isTopExpanded ? "Collapse controls" : "Expand controls"}
            >
              {isTopExpanded ? <FaArrowCircleUp /> : <FaArrowCircleDown />}
            </button>
            <button
              className="reset-button"
              onClick={handleReset}
              disabled={isResetDisabled()}
              aria-label="Reset all selections"
              style={{ opacity: isResetDisabled() ? 0.5 : 1 }}
            >
              <FaUndo />
            </button>
          </div>
        </div>
      <div className="top-section">
        
        <div className={`top-section-content ${isTopExpanded ? 'expanded' : 'collapsed'}`}>
          <div className="dropdown-section">
            <div className="dropdown-group">
              <label>Select Group</label>
              {isDropdownDisabled('group') ? (
                <div className="restricted-display">
                  <span className="restricted-value">{getRestrictedDisplayName('group')}</span>
                  <span className="restricted-label">🔒</span>
                </div>
              ) : (
                <CustomDropdown
                  options={state.dropdownOptions}
                  onSelect={(val) => handleDropdownSelect('selectedGroup', val, groupPlantation, 'plantationOptions')}
                  selectedValue={state.selectedGroup}
                  disabled={false}
                />
              )}
            </div>
            <div className="dropdown-group">
              <label>Select Plantation</label>
              {isDropdownDisabled('plantation') ? (
                <div className="restricted-display">
                  <span className="restricted-value">{getRestrictedDisplayName('plantation')}</span>
                  <span className="restricted-label">🔒</span>
                </div>
              ) : (
                <CustomDropdown
                  options={state.plantationOptions.map(({ id, plantation }) => ({ id, group: plantation }))}
                  onSelect={(val) => handleDropdownSelect('selectedPlantation', val, groupRegion, 'regionOptions')}
                  selectedValue={state.selectedPlantation}
                  isLoading={isLoading.plantation}
                  disabled={false}
                />
              )}
            </div>
            <div className="dropdown-group">
              <label>Select Region</label>
              {isDropdownDisabled('region') ? (
                <div className="restricted-display">
                  <span className="restricted-value">{getRestrictedDisplayName('region')}</span>
                  <span className="restricted-label">🔒</span>
                </div>
              ) : (
                <CustomDropdown
                  options={state.regionOptions.map(({ id, region }) => ({ id, group: region }))}
                  onSelect={(val) => handleDropdownSelect('selectedRegion', val, groupEstate, 'estateOptions')}
                  selectedValue={state.selectedRegion}
                  isLoading={isLoading.region}
                  disabled={false}
                />
              )}
            </div>
            <div className="dropdown-group">
              <label>Select Estate</label>
              {isDropdownDisabled('estate') ? (
                <div className="restricted-display">
                  <span className="restricted-value">{getRestrictedDisplayName('estate')}</span>
                  <span className="restricted-label">🔒</span>
                </div>
              ) : (
                <CustomDropdown
                  options={state.estateOptions.map(({ id, estate }) => ({ id, group: estate }))}
                  onSelect={(val) => {
                    setState(prev => ({ ...prev, selectedEstate: val }));
                    fetchCalendarDataForMonth('selectedEstate', val);
                  }}
                  selectedValue={state.selectedEstate}
                  isLoading={isLoading.estate}
                  disabled={false}
                />
              )}
            </div>
          </div>
          <div className="calendar-navigation">
            <button
              className="nav-button"
              onClick={() => handleMonthChange(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))}
              aria-label="Previous year"
            >
              &lt;&lt;
            </button>
            <span className="nav-label">{currentMonth.getFullYear()}</span>
            <button
              className="nav-button"
              onClick={() => handleMonthChange(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))}
              aria-label="Next year"
            >
              &gt;&gt;
            </button>
            <button
              className="nav-button"
              onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              aria-label="Previous month"
            >
              &lt;
            </button>
            <span className="nav-label">{currentMonth.toLocaleString('default', { month: 'long' })}</span>
            <button
              className="nav-button"
              onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              aria-label="Next month"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      <div className="bottom-section">
        <div className="calendar-section">
          <h2>Calendar View</h2>
          <div className="calendar-container">
            {state.calendarData.length === 0 && !isLoading.plantation && !isLoading.region && !isLoading.estate ? (
              <div className="no-data">No data available for the selected filters.</div>
            ) : (
              <CalenderWidget 
                tasksData={state.calendarData} 
                currentMonth={currentMonth} 
                calendarSection={calendarSection}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalenderView;