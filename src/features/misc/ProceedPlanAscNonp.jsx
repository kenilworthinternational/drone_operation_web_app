// import React, { useState, useEffect } from 'react';
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
// import '../../styles/proceedPlan.css'; // Import custom CSS
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import CustomDropdownAsc from '../../components/CustomDropdownAsc';
// import ProfileWidgetAsc from '../pilots/pilotDetailsAsc';
// import ManageWidgetAsc from '../pilots/managePilotAsc';
// import { FaCalendarAlt } from "react-icons/fa";
// import { getPlansAscUsingDate, getAscPilotsDetails, getDronesDetails, submitAscAlocation, getAscPlanResorcesAllocation, setAscCalenderDate } from '../../api/api';
// import ManageDronesWidgetAsc from '../drones/ManageDroneAsc';
// import DroneWidgetAsc from '../drones/DroneDetailsAsc';
// import { Bars } from 'react-loader-spinner';

// const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
//   <div className="custom-date-input" ref={ref} onClick={onClick}>
//     <input type="text" value={value} readOnly className="date-picker-input" />
//     <FaCalendarAlt className="calendar-icon" />
//   </div>
// ));

// const ProceedPlanAscNonp = () => {
//   const today = new Date();
//   const dayAfterTomorrow = new Date();
//   dayAfterTomorrow.setDate(today.getDate() + 2);
//   const [availableDrones, setAvailableDrones] = useState([]);
//   const [selectedDrones, setSelectedDrones] = useState([]);
//   const [activeTabIndex, setActiveTabIndex] = useState(0);
//   const [selectedDate, setSelectedDate] = useState(dayAfterTomorrow);
//   const [pilots, setPilots] = useState([]);
//   const [missions, setMissions] = useState([]);
//   const [selectedPilots, setSelectedPilots] = useState([]);
//   const [selectedMission, setSelectedMission] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [calendarDates, setCalendarDates] = useState([]);
//   useEffect(() => {
//     const fetchPilots = async () => {
//       const response = await getAscPilotsDetails();
//       if (response.status === "true") {
//         const pilotArray = Object.keys(response)
//           .filter(key => !isNaN(key))
//           .map(key => response[key]);
//         setPilots(pilotArray);
//       } else {
//         setPilots([]);
//       }
//     };

//     const fetchDrones = async () => {
//       const response = await getDronesDetails();
//       if (response && Array.isArray(response)) {
//         setAvailableDrones(response.map(drone => ({ id: drone.id, tag: drone.drone_tag })));
//       } else {
//         setAvailableDrones([]);
//       }
//     };

//     fetchPilots();
//     fetchDrones();
//   }, [selectedDate, selectedMission]);


//   const handleLeaderStatusChange = (pilotId) => {
//     setSelectedPilots((prevPilots) => {
//       return prevPilots.map((pilot) => ({
//         ...pilot,
//         isLeader: pilot.id === pilotId, // Set only the clicked pilot as leader, remove leader from others
//       }));
//     });
//   };
//   const fetchCalendarData = async (month, year) => {
//     try {
//       console.log(month,year)
//       const response = await setAscCalenderDate(month, year);
//       if (response.status === "true") {
//         const datesArray = Object.values(response)
//           .filter(item => item.date && item.count !== undefined)
//           .map(item => {
//             const [y, m, d] = item.date.split('-');
//             return {
//               date: `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`,
//               count: item.count
//             };
//           });
//         setCalendarDates(datesArray);
//       } else {
//         setCalendarDates([]);
//       }
//     } catch (error) {
//       console.error("Error fetching calendar data:", error);
//       setCalendarDates([]);
//     }
//   };
//   const handleMonthChange = (date) => {
//     const month = date.getMonth() + 1;
//     const year = date.getFullYear();
//     fetchCalendarData(month, year);
//   };
//   useEffect(() => {
//     const initialDate = selectedDate || new Date();
//     const month = initialDate.getMonth() + 1;
//     const year = initialDate.getFullYear();
//     fetchCalendarData(month, year);
//   }, []);
//   const getDayClassName = (date) => {
//     const dateStr = date.toLocaleDateString('en-CA');
//     const calendarDate = calendarDates.find(d => d.date === dateStr);
//     return calendarDate && calendarDate.count > 0 ? 'highlighted-date' : '';
//   };
//   const handleAddDrone = (drone) => {
//     setSelectedDrones((prevSelected) => {
//       if (prevSelected.some((d) => d.id === drone.id)) return prevSelected; // Prevent duplicates
//       return [...prevSelected, drone];
//     });

//     setAvailableDrones((prevDrones) => {
//       return prevDrones.filter((d) => d.id !== drone.id); // Remove the drone from available list
//     });
//   };

//   const handleRemoveDrone = (drone) => {
//     setSelectedDrones((prevSelected) => prevSelected.filter((d) => d.id !== drone.id));

//     setAvailableDrones((prevDrones) => {
//       if (prevDrones.some((d) => d.id === drone.id)) return prevDrones; // Prevent duplicates
//       return [...prevDrones, drone];
//     });
//   };

//   const handleAddPilot = (pilot) => {
//     setSelectedPilots((prevSelected) => [...prevSelected, pilot]);
//     setPilots((prevPilots) => prevPilots.filter((p) => p.id !== pilot.id));
//     console.log("pilot ", pilot)
//   };

//   const handleRemovePilot = (pilot) => {
//     setSelectedPilots((prevSelected) => prevSelected.filter((p) => p.id !== pilot.id));

//     setPilots((prevPilots) => {
//       // Only add the pilot back if it's not already in the list
//       return prevPilots.some((p) => p.id === pilot.id) ? prevPilots : [...prevPilots, pilot];
//     });
//   };


//   const handleDateChange = async (date) => {
//     setSelectedMission(null);
//     setMissions(null);
//     setSelectedPilots([]); // Reset selected pilots
//     setSelectedDrones([]); // Reset selected drones
//     try {
//       setMissions(null);
//       setSelectedDate(date);
//       console.log("Picked Date:", date);

//       if (!date) return;

//       // Format the date to 'YYYY-MM-DD' using toLocaleDateString to avoid UTC issues
//       const formattedDate = date.toLocaleDateString('en-CA'); // e.g., '2025-03-18'
//       console.log("Formatted Date Sent to API:", formattedDate);

//       const response = await getPlansAscUsingDate(formattedDate);
//       console.log("API Response:", response);

//       // Validate response structure
//       if (!response || typeof response !== 'object') {
//         console.error("Invalid response format.", response);
//         setMissions([]);
//         return;
//       }

//       if (response.status === "true" && Object.keys(response).length > 2) {
//         // Extract only mission data (numeric keys)
//         const missionArray = Object.keys(response)
//           .filter(key => !isNaN(key)) // Only numeric keys (0, 1, 2, etc.)
//           .map(key => response[key]); // Convert to an array of objects

//         console.log("Extracted Mission Array:", missionArray);

//         // Map data into dropdown options
//         const missionOptions = missionArray.map(plan => ({
//           id: plan.id,
//           group: `${plan.asc_name} - ${plan.area} Ha`,
//           asc:plan.asc,
//         }));
//         console.log("Missions Estate Processed:", missionOptions);

//         setMissions(missionOptions);
//       } else {
//         console.warn("No missions found for the selected date.");
//         setMissions([]); // Set to an empty array if no data
//       }
//     } catch (error) {
//       console.error("Error in handleDateChange:", error);
//       setMissions([]);
//     }
//   };

//   const handleMissionSelect = async (mission) => {
//     setSelectedMission(null);

//     setSelectedPilots([]); // Reset selected pilots
//     setSelectedDrones([]); // Reset selected drones
//     setSelectedMission(mission);
//     console.log("Selected Mission:", mission);
//     const formattedDate = selectedDate.toLocaleDateString('en-CA');
//     try {
//       const response = await getAscPlanResorcesAllocation(mission.asc, formattedDate);
//       if (response && response.status === "true") {
//         const newSelectedPilots = response.selectedPilots || [];
//         const newSelectedDrones = response.selectedDrones || []; 

//         // Set selected pilots and drones
//         setSelectedPilots(newSelectedPilots);
//         setSelectedDrones(newSelectedDrones);

//         // Filter out selected pilots
//         setPilots((prevPilots) =>
//           prevPilots.filter(
//             (pilot) => !newSelectedPilots.some((selected) => selected.id === pilot.id)
//           )
//         );

//         // Filter out selected drones correctly by comparing the drone IDs
//         setAvailableDrones((prevDrones) =>
//           prevDrones.filter(
//             (drone) => !newSelectedDrones.some((selected) => selected.id === drone.id)
//           )
//         );

//       }
//     } catch (error) {
//       console.error("Error fetching resources allocation:", error);
//       setSelectedPilots([]);
//       setSelectedDrones([]);
//     }
//   };



//   const isSubmitDisabled = !selectedDate || !selectedMission || selectedPilots.length === 0 || selectedDrones.length === 0;

//   const handleSubmit = async () => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);
//     const selectedMissionDetails = {
//       selectedMission: {
//         date: selectedDate ? selectedDate.toLocaleDateString('en-CA') : null,
//         id: selectedMission.id,
//         asc: selectedMission.asc,
//       },
//       selectedPilots: selectedPilots.map(p => ({
//         id: p.id,
//         name: p.name,
//       })),
//       selectedDrones: selectedDrones.map(d => ({
//         id: d.id,
//         tag: d.tag,
//       })),
//     };
//     console.log("Submitting Data:", JSON.stringify(selectedMissionDetails, null, 2));
//     try {
//       const response = await submitAscAlocation(selectedMissionDetails);
//       if (response.success) {
//         console.log("Resources allocation successful:", response.message);
//         window.location.reload();
//         alert("Allocation submitted successfully!");
//         setIsSubmitting(false);
//       } else {
//         console.error("Submission failed:", response.message);
//         alert("Submission failed: " + response.message);
//         setIsSubmitting(false);
//       }
//     } catch (error) {
//       console.error("Error submitting allocation:", error);
//       alert("An error occurred while submitting.");
//       setIsSubmitting(false);
//     }
//   };
//   useEffect(() => {
//     const fetchInitialMissions = async () => {
//       await handleDateChange(selectedDate);
//     };


//     fetchInitialMissions();
//   }, []); // Runs only once on mount


//   return (
//     <div className="plan-proceed">
//       <div className="text-area-proceed">
//         <div className="date-area-proceed">
//           <label htmlFor="date-name-proceed">Plan Date : </label>
//           <DatePicker
//             selected={selectedDate}
//             onChange={handleDateChange} // Update function to handle date change
//             dateFormat="yyyy/MM/dd"
//             onMonthChange={handleMonthChange}
//             placeholderText="Select a date"
//             // minDate={today}
//             customInput={<CustomDateInput />}
//             dayClassName={getDayClassName}
//           />
//         </div>
//         <div className="mission-select">
//           <label htmlFor="mission-select-name">Select Mission</label>
//           <CustomDropdownAsc
//             options={missions || []}
//             onSelect={handleMissionSelect}
//             selectedValue={selectedMission}
//           />
//         </div>
//         <div className="submit-resources">
//           <button
//             onClick={handleSubmit}
//             className="submit-button"
//             disabled={isSubmitDisabled || isSubmitting}
//           >
//             {isSubmitting ? (
//               <div className="loader-container">
//                 <Bars
//                   height="20"
//                   width="50"
//                   color="#ffffff"
//                   ariaLabel="bars-loading"
//                   visible={true}
//                 />
//               </div>
//             ) : (
//               "Deploy Resources"
//             )}
//           </button>
//         </div>

//       </div>
//       <div className="tab-container">
//         <Tabs selectedIndex={activeTabIndex} onSelect={(index) => setActiveTabIndex(index)} className={"class-tab"}>
//           <TabList>
//             <Tab>Team</Tab>
//             <Tab>Drones</Tab>
//           </TabList>

//           <TabPanel>
//             <div className="team-select">
//               <div className="selected-item">
//                 {selectedPilots.length > 0 ? (
//                   selectedPilots.map((pilot, index) => (
//                     <ManageWidgetAsc
//                       key={index}
//                       id={pilot.id}
//                       profilePic={pilot.image}
//                       name={pilot.name}
//                       mobile={pilot.mobile_no}
//                       nic={pilot.nic}
//                       isLeader={pilot.isLeader || false}
//                       onMakeLeader={handleLeaderStatusChange}
//                       onDelete={() => handleRemovePilot(pilot)}
//                       position={pilot.job_role}
//                     />
//                   ))
//                 ) : (
//                   <p>No pilots selected.</p>
//                 )}
//               </div>
//               <div className="not-selected">
//                 <div className="search-box" style={{ margin: '10px 0', padding: '0 10px' }}>
//                   <input
//                     type="text"
//                     placeholder="Search pilots by name..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     style={{
//                       width: '100%',
//                       padding: '8px',
//                       borderRadius: '4px',
//                       border: '1px solid #ddd'
//                     }}
//                   />
//                 </div>
//                 {pilots.length > 0 ? (
//                   pilots
//                     .filter(pilot =>
//                       !selectedPilots.some(selected => selected.id === pilot.id) &&
//                       pilot.name.toLowerCase().includes(searchQuery.toLowerCase())
//                     )
//                     .map((pilot, index) => (
//                       <ProfileWidgetAsc
//                         key={index}
//                         id={pilot.id}
//                         profilePic={pilot.image}
//                         name={pilot.name}
//                         mobile={pilot.mobile_no}
//                         onAdd={() => handleAddPilot(pilot)}
//                         position={pilot.job_role}
//                       />
//                     ))
//                 ) : (
//                   <p>No pilots available.</p>
//                 )}

//                 {/* Show message when no results found */}
//                 {pilots.length > 0 &&
//                   pilots.filter(pilot =>
//                     !selectedPilots.some(selected => selected.id === pilot.id) &&
//                     pilot.name.toLowerCase().includes(searchQuery.toLowerCase())
//                   ).length === 0 && (
//                     <p>No pilots found matching "{searchQuery}"</p>
//                   )}
//               </div>
//             </div>
//           </TabPanel>
//           <TabPanel>
//             <div className="drone-select">
//               <div className="selected-drone">
//                 <ManageDronesWidgetAsc drones={selectedDrones} onRemove={handleRemoveDrone} />

//               </div>
//               <div className="not-selected-drone">
//                 <div className="search-container">
//                   <input
//                     type="text"
//                     placeholder="Search drones by tag..."
//                     className="search-input"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>

//                 {availableDrones
//                   .filter((drone) => {
//                     const isSelected = selectedDrones.some(selected => selected.id === drone.id);
//                     const matchesSearch = drone.tag?.toLowerCase().includes(searchTerm.toLowerCase());
//                     return !isSelected && matchesSearch;
//                   })
//                   .map((drone) => (
//                     <DroneWidgetAsc
//                       key={drone.id}
//                       drone={drone}
//                       onAdd={() => handleAddDrone(drone)}
//                       selectedDrones={selectedDrones}
//                     />
//                   ))}
//               </div>
//             </div>
//           </TabPanel>
//         </Tabs>

//       </div>
//     </div>
//   );
// };

// export default ProceedPlanAscNonp;
