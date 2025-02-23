import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import '../css/proceedPlan.css'; // Import custom CSS
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDropdown from '../Widgets/CustomDropdown';
import ProfileWidget from '../Widgets/pilotDetails';
import ManageWidget from '../Widgets/managePilot';
import { FaCalendarAlt } from "react-icons/fa";
import { getPlansUsingDate, getPilotsDetails, getDronesDetails, submitAlocation } from '../Controller/api/api';
import ManageDronesWidget from '../Widgets/ManageDrone';
import DroneWidget from '../Widgets/DroneDetails';



const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input" onClick={onClick} ref={ref}>
    <input type="text" value={value} readOnly className="date-picker-input" />
    <FaCalendarAlt className="calendar-icon" />
  </div>
));

const ProceedPlan = () => {
  const [teamLeads, setTeamLeads] = useState([]);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [selectedDrones, setSelectedDrones] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [pilots, setPilots] = useState([]);
  const [missions, setMissions] = useState([]);
  const [selectedPilots, setSelectedPilots] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const today = new Date();


  useEffect(() => {
    const fetchPilots = async () => {
      const response = await getPilotsDetails();
      if (response.status === "true") {
        const pilotArray = Object.keys(response)
          .filter(key => !isNaN(key))
          .map(key => response[key]);
        setPilots(pilotArray);
      } else {
        console.warn("No pilots found.");
        setPilots([]);
      }
    };
    const fetchDrones = async () => {
      const response = await getDronesDetails();

      console.log("API Response:", response); // Debugging the full response

      if (response && Array.isArray(response)) {
        const formattedDrones = response.map(drone => ({
          id: drone.id,
          tag: drone.drone_tag
        }));

        setAvailableDrones(formattedDrones);

        // Debugging mapped drone data
        console.log("Formatted Drones:", formattedDrones);
      } else {
        console.warn("No drones found.");
        setAvailableDrones([]);
      }
    };

    fetchDrones();
    fetchPilots();
  }, []);


  const handleLeaderStatusChange = (pilotId) => {
    setSelectedPilots((prevPilots) => {
      const pilotIndex = prevPilots.findIndex(pilot => pilot.id === pilotId);
      if (pilotIndex !== -1) {
        const updatedPilot = {
          ...prevPilots[pilotIndex],
          isLeader: !prevPilots[pilotIndex].isLeader // Toggle leader status
        };
        return [
          ...prevPilots.slice(0, pilotIndex),
          updatedPilot,
          ...prevPilots.slice(pilotIndex + 1),
        ];
      }
      return prevPilots;
    });
  };


  const handleAddDrone = (drone) => {
    console.log("Adding drone:", drone); // Log the drone being added
    if (!selectedDrones.some(d => d.id === drone.id)) {
      setSelectedDrones([...selectedDrones, drone]);
      setAvailableDrones(availableDrones.filter(d => d.id !== drone.id));
    }
  };

  const handleRemoveDrone = (drone) => {
    setSelectedDrones(selectedDrones.filter(d => d.id !== drone.id));
    setAvailableDrones([...availableDrones, drone]);
  };


  const handleAddPilot = (pilot) => {
    setSelectedPilots([...selectedPilots, pilot]);
    setPilots(pilots.filter(p => p.nic !== pilot.nic)); // Keep only unselected pilots
    console.log("Nic ", pilot.nic)
  };

  const handleRemovePilot = (pilot) => {
    setPilots([...pilots, pilot]);
    setSelectedPilots(selectedPilots.filter(p => p.id !== pilot.id)); // Corrected filter condition
  };


  const handleDateChange = async (date) => {
    setMissions(null);
    setSelectedDate(date);
    console.log("Picked Date:", date);

    if (date) {
      // Format the date to 'YYYY-MM-DD' using toLocaleDateString to avoid UTC issues
      const formattedDate = date.toLocaleDateString('en-CA'); // e.g., '2025-03-18'
      console.log("Formatted Date Sent to API:", formattedDate);

      const response = await getPlansUsingDate(formattedDate);
      console.log("API Response:", response);

      // Check if the response contains valid data
      if (response.status === "true" && Object.keys(response).length > 2) {
        // Extract only mission data (numeric keys)
        const missionArray = Object.keys(response)
          .filter(key => !isNaN(key)) // Only numeric keys (0, 1, 2, etc.)
          .map(key => response[key]); // Convert to an array of objects

        console.log("Extracted Mission Array:", missionArray);

        // Map data into dropdown options
        const missionOptions = missionArray.map(plan => ({
          id: plan.id,
          group: `${plan.estate} - ${plan.area} Ha`,
          estateId: plan.estate_id
        }));
        console.log("Missions Estate catch", missionOptions);

        setMissions(missionOptions);
      } else {
        console.warn("No missions found for the selected date.");
        setMissions([]); // Set to an empty array if no data
      }
    }
  };

  const handleMissionSelect = (selectedMission) => {
    setSelectedMission(selectedMission);
    console.log("Selected mission ",selectedMission);
  };


  const isSubmitDisabled = !selectedDate || !selectedMission || selectedPilots.length === 0 || !selectedPilots.some(p => p.isLeader) || selectedDrones.length === 0;

  const handleSubmit = async () => {
    console.log("Selected Mission:", selectedMission);
  
    const selectedMissionDetails = {
      selectedMission: {
        estateId: selectedMission.estateId,
        date: selectedDate ? selectedDate.toLocaleDateString('en-CA') : null,
        id: selectedMission.id,
        estate: selectedMission && typeof selectedMission.group === 'string' ? selectedMission.group.split(" - ")[0] : null,
        area: selectedMission && typeof selectedMission.group === 'string' ? parseFloat(selectedMission.group.split(" - ")[1].replace(" Ha", "")) : null,
      },
      selectedPilots: selectedPilots.map(p => ({
        id: p.id,
        name: p.name,
        isLeader: p.isLeader || false,
      })),
      selectedDrones: selectedDrones.map(d => ({
        id: d.id,
        tag: d.tag,
      })),
    };
  
    console.log("Submitting Data:", JSON.stringify(selectedMissionDetails, null, 2));
  
    try {
      const response = await submitAlocation(selectedMissionDetails);
      if (response.success) {
        console.log("Resources allocation successful:", response.message);
        window.location.reload();
        alert("Allocation submitted successfully!");
      } else {
        console.error("Submission failed:", response.message);
        alert("Submission failed: " + response.message);
      }
    } catch (error) {
      console.error("Error submitting allocation:", error);
      alert("An error occurred while submitting.");
    }
  };
  
  
  return (
    <div className="plan-proceed">
      <div className="text-area-proceed">
        <div className="date-area-proceed">
          <label htmlFor="date-name-proceed">Plan Date : </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange} // Update function to handle date change
            dateFormat="yyyy/MM/dd"
            placeholderText="Select a date"
            minDate={today}
            customInput={<CustomDateInput />}
          />
        </div>
        <div className="mission-select">
          <label htmlFor="mission-select-name">Select Mission</label>
          <CustomDropdown
            options={missions}
            onSelect={handleMissionSelect}
            selectedValue={selectedMission}
          />
        </div>
        <div className="submit-resources">
          <button onClick={handleSubmit} className="submit-button" disabled={isSubmitDisabled}>Deploy Resources</button>
        </div>


      </div>
      <div className="tab-container">
        <Tabs selectedIndex={activeTabIndex} onSelect={(index) => setActiveTabIndex(index)} className={"class-tab"}>
          <TabList>
            <Tab>Team</Tab>
            <Tab>Drones</Tab>
          </TabList>

          <TabPanel>
            <div className="team-select">
              <div className="selected-item">
                {selectedPilots.length > 0 ? (
                  selectedPilots.map((pilot, index) => (
                    <ManageWidget
                      key={index}
                      id={pilot.id}
                      profilePic={pilot.image}
                      name={pilot.name}
                      mobile={pilot.mobile_no}
                      nic={pilot.nic}
                      isLeader={pilot.isLeader || false}
                      onMakeLeader={handleLeaderStatusChange}
                      onDelete={() => handleRemovePilot(pilot)}
                    />
                  ))
                ) : (
                  <p>No pilots selected.</p>
                )}
              </div>
              <div className="not-selected">
                {pilots.length > 0 ? (
                  pilots.map((pilot, index) => (
                    <ProfileWidget
                      key={index}
                      id={pilot.id}
                      profilePic={pilot.image}
                      name={pilot.name}
                      mobile={pilot.mobile_no}
                      onAdd={() => handleAddPilot(pilot)}
                    />
                  ))
                ) : (
                  <p>No pilots available.</p>
                )}
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="drone-select">
              <div className="selected-drone">
                <ManageDronesWidget drones={selectedDrones} onRemove={handleRemoveDrone} />

              </div>
              <div className="not-selected-drone">
                {availableDrones.map((drone) => (
                  <DroneWidget
                    key={drone.id}
                    drone={drone} // Pass the entire drone object
                    onAdd={() => handleAddDrone(drone)}
                  />

                ))}
              </div>
            </div>
          </TabPanel>
        </Tabs>
        
      </div>
    </div>
  );
};

export default ProceedPlan;
