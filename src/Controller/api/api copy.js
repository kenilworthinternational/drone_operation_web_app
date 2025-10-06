// import axios from "axios";

// const API_BASE_URL = "https://drone-admin-test.kenilworthinternational.com/api/";


// // Helper function to get token
// const getToken = () => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));
//   return storedUser?.token || null;
// };

// // Helper function to get auth headers
// const getAuthHeaders = () => {
//   const token = getToken();
//   return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
// };

// // Generic error handler for API calls
// const handleApiError = (error, context) => {
//   console.error(`Error fetching ${context}:`, error.response ? error.response.data : error.message);
//   return [];
// };

// export const verifyUser = async (phoneNumber) => {
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}check_mobile_no_availability_all`, 
//       { mobile_no: phoneNumber }, // Send phone number in the request body
//       {
//         headers: {
//           "Content-Type": "application/json" // Set headers for JSON request
//         }
//       }
//     );

//      // Print the response data
//     return response.data; // Return the actual data
//   } catch (error) {
//     console.error("Error fetching user verification:", error.response ? error.response.data : error.message);
//     return { success: false, message: "Verification failed" };
//   }
// };


// export const loginUser = async (phoneNumber) => {
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}login`, 
//       { mobile_no: phoneNumber },
//       {
//         headers: {
//           "Content-Type": "application/json"
//         }
//       }
//     );

//      // Print the response data
//     return response.data; // Return the actual data
//   } catch (error) {
//     console.error("Error fetching user Logged in:", error.response ? error.response.data : error.message);
//     return { success: false, message: "Login failed" };
//   }
// };

// export const groupGetter = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_groups`, 
//       {},
//       headers
//     );

//      // Log the response
//     return response.data; // Assuming this is an array of groups
//   } catch (error) {
//     console.error("Error fetching Get Group:", error.response ? error.response.data : error.message);
//     return []; // Return an empty array on error
//   }
// };
// export const groupPlantation = async (groupId) => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return [];
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_plantation`, 
//       {"group":groupId},
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`
//         }
//       }
//     );

    
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching Get Plantation:", error.response ? error.response.data : error.message);
//     return [];
//   }
// };

// export const groupRegion = async (plantationID) => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return [];
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_region`, 
//       {"plantation":plantationID},
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`
//         }
//       }
//     );

    
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching Get Region:", error.response ? error.response.data : error.message);
//     return [];
//   }
// };


// export const groupEstate = async (regionID) => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return [];
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_estate`, 
//       {"region":regionID},
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`
//         }
//       }
//     );

    
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching Get Region:", error.response ? error.response.data : error.message);
//     return [];
//   }
// };



// export const divisionStateList = async (estateID) => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return [];
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_division_field_by_estate`, 
//       {"estate":estateID},
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`
//         }
//       }
//     );

    
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching Get Division:", error.response ? error.response.data : error.message);
//     return [];
//   }
// };


// export const missionType = async () => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {

//     console.error("No token found. User is not logged in.", storedUser.token);
//     return [];
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}mission_type`,
//       {},
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`
//         }
//       }
//     );

//     console.log("API missiontype:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching Get missiontype:", error.response ? error.response.data : error.message);
//     return [];
//   }
// };

// export const cropType = async () => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {

//     console.error("No token found. User is not logged in.", storedUser.token);
//     return [];
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_crop_type`,
//       {},
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`
//         }
//       }
//     );

//     console.log("API display_crop_type:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching Get display_crop_type:", error.response ? error.response.data : error.message);
//     return [];
//   }
// };


// export const submitPlan = async (submissionData) => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return { success: false, message: "User not logged in." };
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_plan`,
//       submissionData, // Send the JSON data
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

    
//     return response.data;
//   } catch (error) {
//     console.error("Error submitting plan:", error.response ? error.response.data : error.message);
//     return { success: false, message: "Submission failed" }; // Return a failure message
//   }
// };

// export const getPlansUsingDate = async (date) => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return { success: false, message: "User not logged in." };
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plans_by_date`,
//       {"date":date}, // Send the JSON data
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

    
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding plan:", error.response ? error.response.data : error.message);
//     return { success: false, message: "Submission failed" }; // Return a failure message
//   }
// };



// export const findPlanByID = async (id) => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return { success: false, message: "User not logged in." };
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan`,
//       {"plan":id}, // Send the JSON data
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     console.log("$#################$####$###", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding plan:", error.response ? error.response.data : error.message);
//     return { success: false, message: "Submission failed" }; // Return a failure message
//   }
// };

// export const getPilotsDetails = async () => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return { success: false, message: "User not logged in." };
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}team_lead_and_pilot_list`,
//       {}, // Send the JSON data
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

    
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Pilots:", error.response ? error.response.data : error.message);
//     return { success: false, message: "Pilot Details Catching Failed" }; // Return a failure message
//   }
// };
// export const getDronesDetails = async () => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return { success: false, message: "User not logged in." };
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}drone_list`,
//       {}, // Send the JSON data
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

    
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Drone:", error.response ? error.response.data : error.message);
//     return { success: false, message: "Drone Details Catching Failed" }; // Return a failure message
//   }
// };
// export const getUpdateMissionDetails = async (data) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}display_for_update_plan`,
//       data,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
    
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getRescheduleMissionDetails = async (data) => {
//   console.log(data);
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}display_for_reschedulr_plan`,
//       data,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
    
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };


// export const submitAlocation = async (submissionData) => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return { success: false, message: "User not logged in." };
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}plan_resource_allocations`,
//       submissionData,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     // Adjusting the success check based on the API response message
//     return { 
//       success: response.data.message === 'Plan details saved successfully', 
//       message: response.data.message 
//     };
//   } catch (error) {
//     console.error("Error submitting resources allocation:", error.response ? error.response.data : error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };

// export const submitUpdatePlan = async (submissionUpdateData) => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return { success: false, message: "User not logged in." };
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_plan`,
//       submissionUpdateData,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

    

//     // Ensure the response is properly checked
//     if (response.data && response.data.status === "true") {
//       return {
//         success: true,
//         message: "Update successful",
//         id: response.data.id ?? null
//       };
//     } else {
//       return {
//         success: false,
//         message: "Update failed"
//       };
//     }
//   } catch (error) {
//     console.error("Error submitting plan update:", error.response ? error.response.data : error.message);
//     return { success: false, message: "Plan update failed due to an error" };
//   }
// };
// export const submitRescheduledPlan = async (submissionRescheduleData) => {
//   const storedUser = JSON.parse(localStorage.getItem('userData'));

//   if (!storedUser || !storedUser.token) {
    
//     return { success: false, message: "User not logged in." };
//   }

//   try {
//     const response = await axios.post(
//       // `${API_BASE_URL}create_adhoc_plan`,
//       `${API_BASE_URL}create_plan`,
//       submissionRescheduleData,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

    

//     // Ensure the response is properly checked
//     if (response.data && response.data.status === "true") {
//       return {
//         success: true,
//         message: "Update successful",
//         id: response.data.id ?? null
//       };
//     } else {
//       return {
//         success: false,
//         message: "Update failed"
//       };
//     }
//   } catch (error) {
//     console.error("Error submitting plan update:", error.response ? error.response.data : error.message);
//     return { success: false, message: "Plan update failed due to an error" };
//   }
// };


// export const getSummaryDataGroup = async (id, start_date, end_date) => {
//   console.log("sended data", id, start_date, end_date)
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}get_plan_resource_allocation_details_by_group_and_date_range`,
//       {
//         "group":id,
//         "start_date":start_date,
//         "end_date":end_date
//       }
//       ,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
    
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataPlantation = async (id, start_date, end_date) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}get_plan_resource_allocation_details_by_plantation_and_date_range`,
//       {
//         "plantation":id,
//         "start_date":start_date,
//         "end_date":end_date
//       },
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
    
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataRegion = async (id, start_date, end_date) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}get_plan_resource_allocation_details_by_region_and_date_range`,
//       {
//         "region":id,
//         "start_date":start_date,
//         "end_date":end_date
//       },
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
    
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const getSummaryDataEstate = async (id, start_date, end_date) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}get_plan_resource_allocation_details_by_estate_and_date_range`,
//       {
//         "estate":id,
//         "start_date":start_date,
//         "end_date":end_date
//       },
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };



// export const getSummaryDataGroupAll = async (id) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_group`,
//       {
//         "group":id
//       }
//       ,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataPlantationAll = async (id) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_plantation`,
//       {
//         "plantation":id,
//       },
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
    
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataRegionAll = async (id) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_region`,
//       {
//         "region":id,
//       },
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const getSummaryDataEstateAll = async (id) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_estate`,
//       {
//         "estate":id
//       },
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getUpdatedCalander = async (data, location) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
//       return { success: false, message: "User not logged in." };
//     }

//     const response = await axios.post(
//       `${API_BASE_URL}find_plans_by_estate_and_crop_and_mission_type_date_range`,
//       data,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("API Response:", response.data);

//     let filteredData = response.data;

//     // If location is "new_plan", filter out items with flag === "ap"
//     if (location === "new_plan") {
//       filteredData = Object.keys(response.data)
//         .filter((key) => !isNaN(key)) // Filtering only numbered keys (actual objects)
//         .reduce((acc, key) => {
//           if (response.data[key].flag !== "ap") {
//             acc[key] = response.data[key];
//           }
//           return acc;
//         }, {});

//       // Preserve the status and count in the response
//       filteredData.status = response.data.status;
//       filteredData.count = Object.keys(filteredData).length - 2; // Subtracting status & count
//     }

//     return filteredData;
//   } catch (error) {
//     console.error(
//       "Error Finding Update Mission:",
//       error.response?.data || error.message
//     );
//     return null;
//   }
// };


// export const getChartAllDataGroup = async (data) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}for_all_by_date`,
//       data,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const getChartGroupDataGroup = async (data) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}for_group_by_date`,
//       data,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const getChartPlantationDataGroup = async (data) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}for_plantation_by_date`,
//       data,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const getChartRegionDataGroup = async (data) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}for_region_by_date`,
//       data,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const getChartEstateDataGroup = async (data) => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('userData'));
//     if (!storedUser || !storedUser.token) {
      
//       return { success: false, message: "User not logged in." };
//     }
  
//     const response = await axios.post(
//       `${API_BASE_URL}for_estate_by_date`,
//       data,
//       {
//         headers: {
//           "Authorization": `Bearer ${storedUser.token}`,
//           "Content-Type": "application/json"
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getPlanResorcesAllocation = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}get_plan_resource_allocation_details`,
//       { id: data },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };