// /**
//  * ⚠️ DEPRECATED API LAYER ⚠️
//  * 
//  * This file is being maintained for backward compatibility only.
//  * 
//  * NEW COMPONENTS SHOULD USE: RTK Query API services in src/api/services/
//  * 
//  * Migration Guide:
//  * - Instead of importing from this file, import hooks from '../api'
//  * - RTK Query provides automatic caching, loading states, and refetching
//  * - See src/api/index.js for examples and available hooks
//  * 
//  * This file will be removed in a future version once all components are migrated.
//  */

// import axios from "axios";
// import { API_BASE_URL, IS_DEVELOPMENT } from '../config/config';
// import { logger } from '../utils/logger';

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
// // Generic error handler for API calls (currently unused but kept for future use)
// // const handleApiError = (error, context) => {
// //   logger.error(`Error fetching ${context}:`, error.response ? error.response.data : error.message);
// //   return [];
// // };

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

//     // Print the response data
//     return response.data; // Return the actual data
//   } catch (error) {
//     logger.error("Error fetching user verification:", error.response ? error.response.data : error.message);
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

//     // Print the response data
//     return response.data; // Return the actual data
//   } catch (error) {
//     logger.error("Error fetching user Logged in:", error.response ? error.response.data : error.message);
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

//     // Log the response
//     return response.data; // Assuming this is an array of groups
//   } catch (error) {
//     logger.error("Error fetching Get Group:", error.response ? error.response.data : error.message);
//     return []; // Return an empty array on error
//   }
// };
// export const groupPlantation = async (groupId) => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_plantation`,
//       { group: groupId },
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Plantation:", error.response?.data || error.message);
//     return [];
//   }
// };

// export const groupRegion = async (plantationID) => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_region`,
//       { plantation: plantationID },
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Region:", error.response?.data || error.message);
//     return [];
//   }
// };

// export const groupEstate = async (regionID) => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_estate`,
//       { region: regionID },
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Estate:", error.response?.data || error.message);
//     return [];
//   }
// };

// export const displayPlantation = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_all_plantation`,
//       {},
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Estate:", error.response?.data || error.message);
//     return [];
//   }
// };
// export const displayEstate = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_all_estates`,
//       {},
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Estate:", error.response?.data || error.message);
//     return [];
//   }
// };

// export const displayOperators = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}get_operator`,
//       {},
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Estate:", error.response?.data || error.message);
//     return [];
//   }
// };
// export const assignOperator = async (planID, operatorID) => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}assign_plan_to_operator`,
//       { plan: planID, operator: operatorID },
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Region:", error.response?.data || error.message);
//     return [];
//   }
// };

// export const planOperatorsDateRange = async (start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_operator_date_range`,
//       { start_date: start_date, end_date: end_date },
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Region:", error.response?.data || error.message);
//     return [];
//   }
// };
// export const assignedOperator = async (planID) => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_operator`,
//       { plan: planID },
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Region:", error.response?.data || error.message);
//     return [];
//   }
// };

// export const estateListAcPlant = async (plantationID) => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_estate_by_plantation`,
//       { plantation: plantationID },
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Region:", error.response?.data || error.message);
//     return [];
//   }
// };

// export const estateListDetails = async (estateID) => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}estate_profile`,
//       { estate: estateID },
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Estate Details:", error.response?.data || error.message);
//     return [];
//   }
// };


// export const divisionStateList = async (estateID) => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_division_field_by_estate`,
//       { estate: estateID },
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Division:", error.response?.data || error.message);
//     return [];
//   }
// };
// export const chemicalTypeList = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) {
//     logger.error("No token found. User is not logged in.");
//     return [];
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}chemical_type`,
//       {},
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching mission types:", error.response?.data || error.message);
//     return [];
//   }
// };


// export const missionType = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) {
//     logger.error("No token found. User is not logged in.");
//     return [];
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}mission_type`,
//       {},
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching mission types:", error.response?.data || error.message);
//     return [];
//   }
// };

// export const cropType = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) {
//     logger.error("No token found. User is not logged in.");
//     return [];
//   }

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_crop_type`,
//       {},
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching crop types:", error.response?.data || error.message);
//     return [];
//   }
// };

// export const submitPlan = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_plan`,
//       submissionData,
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
//     logger.error("Error submitting plan:", error.response?.data || error.message);
//     return { success: false, message: "Submission failed" };
//   }
// };

// export const getPlansUsingDate = async (date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plans_by_date`,
//       { date },
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
//     logger.error("Error fetching plans by date:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plans" };
//   }
// };

// export const getPlansUsingDateNonp = async (date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}search_mission_by_requested_date`,
//       { date },
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
//     logger.error("Error fetching plans by date:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plans" };
//   }
// };
// export const getPlansUsingDateRange = async (start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plans_by_date_range`,
//       { start_date, end_date },
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
//     logger.error("Error fetching plans by date:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plans" };
//   }
// };

// export const getPlansAscUsingDate = async (date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}search_mission_by_planed_date`,
//       { date },
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
//     logger.error("Error fetching plans by date:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plans" };
//   }
// };
// export const findPlanByID = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan`,
//       { plan: id },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log("Plan details response:", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching plan by ID:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plan" };
//   }
// };

// export const getPilotsDetails = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}team_lead_and_pilot_list`,
//       {},
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
//     logger.error("Error fetching pilots:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch pilot details" };
//   }
// };

// export const getAscPilotsDetails = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}asc_team_lead_and_pilot_list`,
//       {},
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
//     logger.error("Error fetching pilots:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch pilot details" };
//   }
// };
// export const getSectors = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_sectors`,
//       {},
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
//     logger.error("Error fetching pilots:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch pilot details" };
//   }
// };
// export const getStages = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_growth_level`,
//       {},
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
//     logger.error("Error fetching pilots:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch pilot details" };
//   }
// };

// export const getTimePick = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}time_of_the_day`,
//       {},
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
//     logger.error("Error fetching pilots:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch pilot details" };
//   }
// };

// export const getDronesDetails = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}drone_list`,
//       {},
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
//     logger.error("Error fetching Drone Details:", error.response?.data || error.message);
//     return { success: false, message: "Drone Details Catching Failed" };
//   }
// };

// export const getDronesAndPilotsDetails = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_pilots_and_drons_in_teams`,
//       {},
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
//     logger.error("Error fetching Drone Details:", error.response?.data || error.message);
//     return { success: false, message: "Drone Details Catching Failed" };
//   }
// };
// export const updateDronePlan = async (plan_id, drone_id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   logger.log(plan_id, drone_id);
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}change_drone_to_plan`,
//       { plan: plan_id, drone: drone_id },
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
//     logger.error("Error updating drone plan:", error.response?.data || error.message);
//     return { 
//       success: false, 
//       message: error.response?.data?.message || "Failed to update drone plan",
//       error: error.response?.data || error.message
//     };
//   }
// };
// export const updatePilotToPlan = async (plan_id, pilot_id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}change_pilot_to_plan`,
//       { plan: plan_id, pilot: pilot_id },
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
//     logger.error("Error updating drone plan:", error.response?.data || error.message);
//     return { 
//       success: false, 
//       message: error.response?.data?.message || "Failed to update drone plan",
//       error: error.response?.data || error.message
//     };
//   }
// };

// export const getUpdateMissionDetails = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_for_update_plan`,
//       data,
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
//     logger.error("Error fetching Update Mission Details:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getRescheduleMissionDetails = async (data) => {
//   logger.log(data);
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_for_reschedulr_plan`,
//       data,
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
//     logger.error("Error fetching Reschedule Mission Details:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const addFarmer = async (farmerData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}add_farmer`,
//       farmerData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log("came here3", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };
// export const updateFarmer = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_farmer

// `,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return {
//       success: response.data.message === 'Plan details saved successfully',
//       message: response.data.message
//     };
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };


// export const submitDataAscBooking = async (submissionData) => {
//   logger.log(submissionData);
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_mission`,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
    
//     logger.log("API Response:", response.data);
    
//     // Handle the actual response format: {"status": "true", "id": 1}
//     if (response.data && (response.data.status === "true" || response.data.status === true)) {
//       return {
//         success: true,
//         message: response.data.message || "Mission created successfully",
//         id: response.data.id
//       };
//     }
    
//     // Fallback to the old format check
//     if (response.data && response.data.message === 'Plan details saved successfully') {
//       return {
//         success: true,
//         message: response.data.message
//       };
//     }
    
//     // If we get here, the response doesn't match expected formats
//     return {
//       success: false,
//       message: response.data.message || "Unknown response format"
//     };
//   } catch (error) {
//     logger.error("Error submitting mission:", error.response?.data || error.message);
//     return { success: false, message: "Mission creation failed" };
//   }
// };



// export const submitAlocation = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}plan_resource_allocations`,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return {
//       success: response.data.message === 'Plan details saved successfully',
//       message: response.data.message
//     };
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };
// export const submitAlocationNonp = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}mission_resource_allocations`,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return {
//       success: response.data.message === 'Plan details saved successfully',
//       message: response.data.message
//     };
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };
// export const usedChemicals = async (start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}chemical_used_by_estates`,
//       {
//         start_date: start_date,
//         end_date: end_date
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     // Return the full payload so callers can access chemical_usage directly
//     return response.data;
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };


// export const displayTeamData = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_all_team_pilot_drone`,
//       {}, // empty POST body
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
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };

// export const displayTeamDataNonp = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_all_non_plantaion_team_pilot_drone`,
//       {}, // empty POST body
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
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };


// export const displayPilotandDroneWithoutTeam = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}pilots_and_drones_without_team`,
//       {}, // empty POST body
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
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };


// export const displayPilotandDroneWithoutTeamNonp = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}non_plantaion_pilots_and_drones_without_team`,
//       {}, // empty POST body
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
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };


// export const addDroneorPilotToPool = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}add_team_pilot_drone`,
//       submissionData,
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
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };


// export const addDroneorPilotToPoolNonp = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}add_non_plantaion_team_pilot_drone`,
//       submissionData,
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
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };

// export const updateTeamPilot = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_team_pilot`,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
    
//     // Return the full response data for more flexible handling
//     return {
//       success: true, // Assume success if no error was thrown
//       message: response.data.message || 'Pilot updated successfully',
//       data: response.data
//     };
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { 
//       success: false, 
//       message: error.response?.data?.message || "Resources allocation failed",
//       error: error.response?.data || error.message
//     };
//   }
// };


// export const updateTeamPilotNonp = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_non_plantaion_team_pilot`,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
    
//     // Return the full response data for more flexible handling
//     return {
//       success: true, // Assume success if no error was thrown
//       message: response.data.message || 'Pilot updated successfully',
//       data: response.data
//     };
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { 
//       success: false, 
//       message: error.response?.data?.message || "Resources allocation failed",
//       error: error.response?.data || error.message
//     };
//   }
// };


// export const updateTeamDrone = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_team_drone`,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
    
//     // Return the full response data for more flexible handling
//     return {
//       success: true, // Assume success if no error was thrown
//       message: response.data.message || 'Drone updated successfully',
//       data: response.data
//     };
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { 
//       success: false, 
//       message: error.response?.data?.message || "Resources allocation failed",
//       error: error.response?.data || error.message
//     };
//   }
// };


// export const updateTeamDroneNonp = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_non_plantaion_team_drone`,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
    
//     // Return the full response data for more flexible handling
//     return {
//       success: true, // Assume success if no error was thrown
//       message: response.data.message || 'Drone updated successfully',
//       data: response.data
//     };
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { 
//       success: false, 
//       message: error.response?.data?.message || "Resources allocation failed",
//       error: error.response?.data || error.message
//     };
//   }
// };


// export const addTeamToPlan = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}add_team_to_plan`,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return response.data; // <-- Return the actual API response
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };


// export const addTeamToPlanNonp = async (plan_id, team_id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}add_team_to_mission`,
//       {
//         plan_id: plan_id,
//         team_id: team_id
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return response.data; // <-- Return the actual API response
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };



// export const teamPlannedData = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}plan_team_drone_by_date`,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return response.data; // <-- Return the actual API response
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };

// export const teamPlannedDataNonp = async (submissionData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}plan_non_plantaion_team_drone_by_date`,
//       submissionData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return response.data; // <-- Return the actual API response
//   } catch (error) {
//     logger.error("Error submitting resources allocation:", error.response?.data || error.message);
//     return { success: false, message: "Resources allocation failed" };
//   }
// };



// export const submitUpdatePlan = async (submissionUpdateData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_plan`,
//       submissionUpdateData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     if (response.data?.status === "true") {
//       return {
//         success: true,
//         message: "Update successful",
//         id: response.data.id ?? null
//       };
//     }
//     return { success: false, message: "Update failed" };
//   } catch (error) {
//     logger.error("Error submitting plan update:", error.response?.data || error.message);
//     return { success: false, message: "Plan update failed due to an error" };
//   }
// };

// export const submitRescheduledPlan = async (submissionRescheduleData) => {
//   logger.log("##########", submissionRescheduleData);
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_plan`,
//       submissionRescheduleData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     if (response.data?.status === "true") {
//       return {
//         success: true,
//         message: "Update successful",
//         id: response.data.id ?? null
//       };
//     }
//     return { success: false, message: "Update failed" };
//   } catch (error) {
//     logger.error("Error submitting rescheduled plan:", error.response?.data || error.message);
//     return { success: false, message: "Plan update failed due to an error" };
//   }
// };

// export const submitManagerRequestRescheduledPlan = async (submissionManagerRequestRescheduleData) => {
//   logger.log("##########", submissionManagerRequestRescheduleData);
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_plan`,
//       submissionManagerRequestRescheduleData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     if (response.data?.status === "true") {
//       return {
//         success: true,
//         message: "Update successful",
//         id: response.data.id ?? null
//       };
//     }
//     return { success: false, message: "Update failed" };
//   } catch (error) {
//     logger.error("Error submitting rescheduled plan:", error.response?.data || error.message);
//     return { success: false, message: "Plan update failed due to an error" };
//   }
// };
// export const changeManagerStatus = async (changeManagerStatusData) => {
//   logger.log("##########", changeManagerStatusData);
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_request_reschedule_date_by_manager`,
//       changeManagerStatusData,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     if (response.data?.status === "true") {
//       return {
//         success: true,
//         message: "Update successful",
//         id: response.data.id ?? null
//       };
//     }
//     return { success: false, message: "Update failed" };
//   } catch (error) {
//     logger.error("Error submitting rescheduled plan:", error.response?.data || error.message);
//     return { success: false, message: "Plan update failed due to an error" };
//   }
// };
// export const getSummaryDataGroup = async (id, start_date, end_date) => {
//   logger.log("sended data", id, start_date, end_date);
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}get_plan_resource_allocation_details_by_group_and_date_range`,
//       { group: id, start_date, end_date },
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
//     logger.error("Error fetching Group Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataPlantation = async (id, start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}get_plan_resource_allocation_details_by_plantation_and_date_range`,
//       { plantation: id, start_date, end_date },
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
//     logger.error("Error fetching Plantation Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataRegion = async (id, start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}get_plan_resource_allocation_details_by_region_and_date_range`,
//       { region: id, start_date, end_date },
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
//     logger.error("Error fetching Region Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataEstate = async (id, start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}get_plan_resource_allocation_details_by_estate_and_date_range`,
//       { estate: id, start_date, end_date },
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
//     logger.error("Error fetching Estate Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };


// export const updateDate = async (currentId, date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_plan_date_by_plan_id`,
//       {
//         "id":currentId,
//         "date":date
//       },
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
//     logger.error("Error fetching Group All Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataAll = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_all`,
//       {},
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
//     logger.error("Error fetching Group All Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const getSummaryDataAllDateRange = async (start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_all_date_range`,
//       { start_date: start_date, end_date: end_date },
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
//     logger.error("Error fetching Group All Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const getSummaryDataGroupAll = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_group`,
//       { group: id },
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
//     logger.error("Error fetching Group All Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataGroupAllDateRange = async (id, start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_group_date_range
// `,
//       { group: id, start_date: start_date, end_date: end_date },
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
//     logger.error("Error fetching Group All Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataPlantationAll = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_plantation`,
//       { plantation: id },
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
//     logger.error("Error fetching Plantation All Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataPlantationAllDateRange = async (id, start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_plantation_date_range`,
//       { plantation: id, start_date: start_date, end_date: end_date },
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
//     logger.error("Error fetching Plantation All Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataRegionAll = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_region`,
//       { region: id },
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
//     logger.error("Error fetching Region Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataRegionAllDateRange = async (id, start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_region_date_range`,
//       { region: id, start_date: start_date, end_date: end_date },
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
//     logger.error("Error fetching Region Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataEstateAll = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_estate`,
//       { estate: id },
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
//     logger.error("Error fetching Estate Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getSummaryDataEstateAllDateRange = async (id, start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_by_estate_date_range_with_field`,
//       { estate: id, start_date: start_date, end_date: end_date  },
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
//     logger.error("Error fetching Estate Summary Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getUpdatedCalander = async (data, location) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plans_by_estate_and_crop_and_mission_type_date_range`,
//       data,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     let filteredData = response.data;
//     logger.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$",location, filteredData)
//     // Original filtering logic remains unchanged
//     if (location === "new_plan") {
//       filteredData = Object.keys(response.data)
//         .filter((key) => !isNaN(key))
//         .reduce((acc, key) => {
//           if (response.data[key].flag !== "ap") {
//             acc[key] = response.data[key];
//           }
//           return acc;
//         }, {});

//       filteredData.status = response.data.status;
//       filteredData.count = Object.keys(filteredData).length - 2;
//     }

//     return filteredData;
//   } catch (error) {
//     logger.error("Error fetching Calendar Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getChartAllDataGroup = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}for_all_by_date`,
//       data,
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
//     logger.error("Error fetching All Chart Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getChartGroupDataGroup = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}for_group_by_date`,
//       data,
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
//     logger.error("Error fetching Group Chart Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getChartPlantationDataGroup = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}for_plantation_by_date`,
//       data,
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
//     logger.error("Error fetching Plantation Chart Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getChartRegionDataGroup = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}for_region_by_date`,
//       data,
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
//     logger.error("Error fetching Region Chart Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getChartEstateDataGroup = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}for_estate_by_date`,
//       data,
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
//     logger.error("Error fetching Estate Chart Data:", error.response?.data || error.message);
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getPlanResorcesAllocationNonp = async (data, date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   logger.log(data, date);
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_mission_resource_allocations_by_id`,
//       {
//         asc: data,
//         date: date
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const pilotPlanandSubTaskList = async (startDate, endDate, formattedEstates) => {
//   logger.log("test", startDate, endDate, formattedEstates);
//   if (IS_DEVELOPMENT) console.assert(Array.isArray(formattedEstates), "formattedEstates should be an array");
//   const headers = getAuthHeaders();
//   if (!headers) return {
//     success: false,
//     message: "User not logged in.",
//     status: 401
//   };
//   logger.log("printing", {
//     start_date: startDate,
//     end_date: endDate,
//     estates: formattedEstates, // Must be an array
//   },)
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}pilots_plans_tasks_by_date_range_and_estates`,
//       {
//         start_date: startDate,
//         end_date: endDate,
//         estates: formattedEstates, // Must be an array
//       },
//       {
//         headers: {
//           ...headers.headers, // Ensure this includes Authorization
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     logger.log("response", response);
//     return { success: true, data: response.data, status: response.status };
//   } catch (error) {
//     logger.error("API Request Error:", {
//       message: error.message,
//       status: error.response?.status,
//       data: error.response?.data
//     });

//     return {
//       success: false,
//       message: error.response?.data?.message || "Request failed",
//       status: error.response?.status || 500,
//       data: null
//     };
//   }
// };

// export const getSubmissionData = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_pilot_field_sub_task`,
//       { task: id },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const deletePlan = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}delete_plan`,
//       { plan: id },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const deactivatePlan = async (id, status) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   logger.log("deactivatePlan", id, status);
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}plan_change_status`,
//       { plan: id, status:status },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const financeReport = async (start_date, end_date, estates) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}sprayed_area_by_date_range_and_estate`,
//       {
//         start_date: start_date,
//         end_date: end_date,
//         estates: estates
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const financeReport2 = async (start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}plantation_covered_area_by_date`,
//       {
//         start_date: start_date,
//         end_date: end_date,
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const leadReport = async (start_date, end_date) => {
//     const headers = getAuthHeaders();
//     if (!headers) return { success: false, message: "User not logged in." };

//     try {
//         const response = await axios.post(
//             `${API_BASE_URL}team_lead_performance_by_date_range`,
//             {
//                 start_date: start_date,
//                 end_date: end_date,
//             },
//             {
//                 headers: {
//                     ...headers.headers,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );
//         return response.data;
//     } catch (error) {
//         logger.error("Error Fetching Lead Report:", error.response?.data || error.message);
//         return null;
//     }
// };
// export const noOfFlights = async (start_date, end_date) => {
//     const headers = getAuthHeaders();
//     if (!headers) return { success: false, message: "User not logged in." };

//     try {
//         const response = await axios.post(
//             `${API_BASE_URL}plan_field_no_of_flights`,
//             {
//                 start_date: start_date,
//                 end_date: end_date,
//             },
//             {
//                 headers: {
//                     ...headers.headers,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );
//         return response.data;
//     } catch (error) {
//         logger.error("Error Fetching Lead Report:", error.response?.data || error.message);
//         return null;
//     }
// };
// export const ApprovalCount = async (start_date, end_date) => {
//     const headers = getAuthHeaders();
//     if (!headers) return { success: false, message: "User not logged in." };

//     try {
//         const response = await axios.post(
//             `${API_BASE_URL}pilots_subtask_and_aprroval_count`,
//             {
//                 start_date: start_date,
//                 end_date: end_date,
//             },
//             {
//                 headers: {
//                     ...headers.headers,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );
//         return response.data;
//     } catch (error) {
//         logger.error("Error Fetching Lead Report:", error.response?.data || error.message);
//         return null;
//     }
// };
// export const findPlanSummary = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_plan_summary`,
//       { plan: id },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const displayTaskPlanAndField = async (id, fieldid) => {
//   logger.log("id", id, "fieldid", fieldid);
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_tasks_by_plan_and_field`,
//       { "plan": id, "field": fieldid },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     // console.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const subTaskApproveorDecline = async (subtask, status) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_ops_room_approval_for_sub_task`,
//       { subtask, status },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     // Handle API response format
//     return {
//       success: response.data.status === "true",
//       message: response.data.message || "Update successful",
//       data: response.data
//     };

//   } catch (error) {
//     logger.error("Error updating subtask:", error.response?.data || error.message);
//     return {
//       success: false,
//       message: error.response?.data?.message || error.message || "Network error"
//     };
//   }
// };
// export const subTaskLogDetails = async (subtask, status, reasonId, reasonText) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   logger.log("######", subtask,
//     status,
//     reasonId,
//     reasonText)
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}sub_tasks_status_log`,
//       {
//         "subtask":subtask,
//         "status":status,
//         "reason":reasonId, // Correct key name
//         "reason_text":reasonText // Correct key name
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     return {
//       success: response.data.status === "true",
//       message: response.data.message || "Update successful",
//       data: response.data
//     };

//   } catch (error) {
//     logger.error("Error updating subtask:", error.response?.data || error.message);
//     return {
//       success: false,
//       message: error.response?.data?.message || error.message || "Network error"
//     };
//   }
// };
// export const submitDJIRecord = async (formData) => {
//   const token = getToken();
//   if (!token) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}submit_dji_record_by_task`,
//       formData,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data", // Changed to multipart
//         },
//       }
//     );
//     logger.log(response);
//     return {
//       success: response.data.status === "true",
//       message: response.data.message || "Update successful",
//       data: response.data
//     };

//   } catch (error) {
//     logger.error("Error submitting DJI record:", error.response?.data || error.message);
//     return {
//       success: false,
//       message: error.response?.data?.message || error.message || "Network error"
//     };
//   }
// };

// export const pendingRequestReschedule = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}find_all_pending_request_reschedule`,
//       {},
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     // console.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const fieldDetails = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}details_by_field`,
//       {field:id},
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     // console.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const displayRejectReason = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_reject_reasons `,
//       {},
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log("$$$$$$$$$$$$$$$$$$$$$$$", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };


// export const farmerDetailsAscBooking = async (nic) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}farmer_by_nic`,
//       {
//         nic: nic
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     // console.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const dateRangAscBookings = async (startDate, endDate) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}search_mission_by_requested_date_range`,
//       {
//         start_date: startDate,
//         end_date: endDate
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };
// export const updateDatePlannedAscBooking = async (id, datePlaned, paymentType) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   logger.log(id, datePlaned);
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_mission_planned_date_by_id`,
//       {
//         id: id, // Match expected parameter name
//         date_planed: datePlaned, // Match expected parameter name
//         ...(paymentType ? { payment_type: paymentType } : {})
//       },
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
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };
// export const updateMissionPlannedAsc = async (dataSet) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   logger.log(dataSet);
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_mission_by_id`,
//       dataSet,
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
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export const setAscTeamLead = async (dataSet) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_mission_team_lead_by_id`,
//       dataSet,
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
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };


// export const displayAsc = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_asc`,
//       {},
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     logger.log("test", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };
// export const PilotDetaisPlan = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}plan_team_drone_by_plan_id`,
//       {
//         plan_id: id
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     logger.log("test", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };
// export const setAscForMission = async (idOrPayload, ascIfAny) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     // Support both legacy signature (id, asc) and new payload { id, asc, gnd }
//     let payload;
//     if (typeof idOrPayload === 'object' && idOrPayload !== null) {
//       payload = {
//         id: idOrPayload.id,
//         asc: idOrPayload.asc,
//         ...(idOrPayload.gnd !== undefined ? { gnd: idOrPayload.gnd } : {})
//       };
//     } else {
//       payload = {
//         id: idOrPayload,
//         asc: ascIfAny
//       };
//     }
//     const response = await axios.post(
//       `${API_BASE_URL}update_mission_asc_by_id`,
//       payload,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     logger.log("test", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export const setAscCalenderDate = async (month, year) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}mission_count_by_date_for_month`,
//       {
//         year: year,
//         month: month
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data)
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export const pilotsPerfomances = async (startDate, endDate) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}pilot_performance_plantation`,
//       {
//         start_date: startDate,
//         end_date: endDate
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data)
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };
// export const fieldNotApprovedTeamLead = async (startDate, endDate) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}plan_field_not_approved_team_lead`,
//       {
//         start_date: startDate,
//         end_date: endDate
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data)
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export const incompleteSubtasks = async (startDate, endDate) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}not_complete_task_list_for_report`,
//       {
//         start_date: startDate,
//         end_date: endDate
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data)
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };
// export const canceledFieldsByDateRange = async (startDate, endDate) => {
//   const headers = getAuthHeaders();
//   logger.log(startDate, endDate)
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}canceled_fields_by_date_range`,
//       {
//         start_date: startDate,
//         end_date: endDate
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data)
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };
// export const opsApproval = async (plan, status) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_d_ops_approval_for_plan`,
//       {
//         plan: plan,
//         status: status
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log(response.data)
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };
// export const getReportReasons = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return [];

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}flag_reasons`,
//       {},
//       headers
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching Estate:", error.response?.data || error.message);
//     return [];
//   }
// };


// export const reportTask = async (taskId, reason, reasonList) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}flag_task_by_id`,
//       {
//         "task_id":taskId,
//         "reason":reason,
//         "reason_list":reasonList
//       },
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
//     logger.error("Error fetching Group Chart Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const viewTaskReport = async (taskId) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}search_task_flag_by_task_id`,
//       {task: taskId},
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
//     logger.error("Error fetching Group Chart Data:", error.response?.data || error.message);
//     return null;
//   }
// };


// export const viewTaskReportByDateRange = async (fromDate, toDate) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}search_task_flag_by_date_range`,
//       {
//         "from_date":fromDate,
//         "to_date":toDate
//       },
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
//     logger.error("Error fetching Group Chart Data:", error.response?.data || error.message);
//     return null;
//   }
// };


// export const updateReviewForFlagByReviewBoard = async (taskId, review) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_review_for_flag_by_review_board`,
//       {
//         "task":taskId,
//         "review":review
//       },
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
//     logger.error("Error fetching Group Chart Data:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const updateReviewForFlagByDirectorOps = async (taskId, status, review) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_review_for_flag_dops`,
//       {
//         "task":taskId,
//         "status":status,
//         "review":review
//       },
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
//     logger.error("Error fetching Group Chart Data:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const addBroker = async (name, mobile, address, nic, bank, branch, account, percentage, joined_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}add_broker`,
//       {
//         name:name,
//         mobile:mobile,
//         address:address,
//         nic:nic,
//         bank:bank,
//         branch:branch,
//         account:account,
//         percentage:percentage,
//         joined_date:joined_date
//       }      ,
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log("Plan details response:", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching plan by ID:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plan" };
//   }
// };



// export const updateBroker = async (id, name, mobile, address, nic, bank, branch, account, percentage, joined_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_broker`,
//       {
//         id:id,
//         name:name,
//         mobile:mobile,
//         address:address,
//         nic:nic,
//         bank:bank,
//         branch:branch,
//         account:account,
//         percentage:percentage,
//         joined_date:joined_date
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log("Plan details response:", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching plan by ID:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plan" };
//   }
// };

// export const searchBrokerById = async (id) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}search_broker_by_id`,
//       {
//         id:id,
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log("Plan details response:", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching plan by ID:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plan" };
//   }
// };
// export const searchBrokerByNIC = async (nic) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}search_broker_by_nic`,
//       {
//         nic:nic,
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log("Plan details response:", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching plan by ID:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plan" };
//   }
// };

// export const viewBrokers = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}view_brokers`,
//       {},
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log("Plan details response:", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching plan by ID:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plan" };
//   }
// };

// export const updateBrokerStatus = async ( id, activated) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };

//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_broker_status`,
//       {
//         id:id,
//         activated:activated
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     logger.log("Plan details response:", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching plan by ID:", error.response?.data || error.message);
//     return { success: false, message: "Failed to fetch plan" };
//   }
// };


// export const adHocPlanView = async (start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_adhoc_plan_request_by_manager_app`,
//       {
//         start_date: start_date,
//         end_date: end_date
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };


// export const adHocPlanRequestPending = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_adhoc_plan_request_by_manager_app_pending`,
//       {},
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const rescheduleRequestRequestManagerPending = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_reschedule_date_for_plan_by_manager_pending`,
//       {},
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const rescheduleRequestRequestManagerAll = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_reschedule_date_for_plan_by_manager`,
//       {},
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const updateAdHocPlanRequest = async (request_id, date_planned, status) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   logger.log(request_id, date_planned, status)
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_status_adhoc_plan_request_by_manager_app`,
//       {
//         request_id: request_id,
//         date_planed: date_planned,
//         status: status
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     // Return error details for better error handling
//     return {
//       status: 'false',
//       success: false,
//       message: error.response?.data?.message || error.response?.data?.exception || 'Failed to update request',
//       error: error.response?.data || error.message
//     };
//   }
// };

// export const updateReschedulePlanRequest = async (request_id, date_planned, status) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   logger.log(request_id, date_planned, status)
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_reschedule_date_status_for_plan_by_manager`,
//       {
//         request_id: request_id,
//         date: date_planned,
//         status: status
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     // Return error details for better error handling
//     return {
//       status: 'false',
//       success: false,
//       message: error.response?.data?.message || error.response?.data?.exception || 'Failed to update request',
//       error: error.response?.data || error.message
//     };
//   }
// };



// export const nonPlantationPlanRequestPending = async (request_id, date_planned, status) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   logger.log(request_id, date_planned, status)
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}search_pending_mission`,
//       {
//         request_id: request_id,
//         date_planed: date_planned,
//         status: status
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const getNonPlantationPlanRequestPending = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}search_pending_mission`,
//       {},
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
//     logger.error("Error fetching pending non-plantation requests:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const setStatusAscPlan = async (id, status) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   logger.log(id, status);
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_mission_status_by_id`,
//       {
//         id: id,
//         status: status
//       },
//       {
//         ...headers,
//         headers: {
//           ...headers.headers,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     logger.log(response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Error fetching missions:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export const pilotFeedbacks = async (start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_daily_feedback_by_date_range`,
//       {
//         start_date: start_date,
//         end_date: end_date,
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const cancelledFieldsbyTeamLead = async (start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}canceled_fields_by_date_range_with_cancel_reason`,
//       {
//         start_date: start_date,
//         end_date: end_date,
//         group: 0,
//         plantation: 0,
//         region: 0,
//         estate: 0
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };
// export const pilotTeamSprayArea = async (start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}pilot_team_date_spray_area`,
//       {
//         start_date: start_date,
//         end_date: end_date
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const pilotRevenue = async (date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}pilot_daily_covered_area`,
//       {
//         date: date,
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const defaultValues = async (date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}default_values`,
//       {
//         date: date,
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const addPilotRevenue = async (pilot,date,assigned,covered,cancel,covered_revenue,downtime_reason,downtime_approval,downtime_payment,total_revenue,verified) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}pilot_daily_payment`,
//       {
//         pilot:pilot,
//         date:date,
//         assigned:assigned,
//         covered:covered,
//         cancel:cancel,
//         covered_revenue:covered_revenue,
//         downtime_reason:downtime_reason,
//         downtime_approval:downtime_approval,
//         downtime_payment:downtime_payment,
//         total_revenue:total_revenue,
//         verified:verified
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };



// export const pilotsEarnedByRevenue = async (date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}get_pilot_daily_payment_by_date`,
//       {
//         date:date,
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };



// export const pilotsEarnedByRevenueDateRange = async (start_date, end_date) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}get_pilot_daily_payment_by_date_range`,
//       {
//         start_date:start_date,
//         end_date:end_date,
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };



// export const pilotCanceledReasons = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_partial_complete_reasons`,
//       {
//         flag: "c",
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };



// export const currentGroupAssignedMissionsByDate = async (dateData) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}display_groups_by_day`,
//       dateData,
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };



// export const removeGroupAssignedMissions = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}remove_group_from_missions`,
//       data,
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const updateGroupAssignedMissions = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_group_assigned_to_missions`,
//       data,
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const nonpGroupAssignedMissions = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_group_assigned_missions`,
//       data,
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const messageSenderAPI = async (mobile_no, content) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}send_sms_with_custom_body`,
//       {
//         mobile_no: mobile_no,
//         content: content
//       },
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const sendOTP = async (mobile_no, otp) => {
//   try {
//     const content = `Your OTP for Drone Services Management System login is: ${otp}. Please do not share this code with anyone.`;
//     const response = await axios.post(
//       `${API_BASE_URL}send_sms_with_custom_body`,
//       {
//         mobile_no: mobile_no,
//         content: content
//       },
//       {
//         headers: {
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     return response.data;
//   } catch (error) {
//     logger.error("Error sending OTP:", error.response?.data || error.message);
//     return { status: false, message: "Failed to send OTP" };
//   }
// };


     
// export const createDrone = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_drone`,
//       data,
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };     
// export const createGenerators = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_generator`,
//       data,
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };    

// export const createRemoteControl = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_remote_control`,
//       data,
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };



// export const createBattery = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_battery`,
//       data,
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };


// export const createVehicle = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}create_vehicle`,
//       data,
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
//     logger.error("Error Finding Update Mission:", error.response?.data || error.message);
//     return null;
//   }
// };


// export const viewDrones = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}view_drone`,
//       {},
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
//     logger.error("Error viewing drones:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const updateDrone = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_drone`,
//       data,
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
//     logger.error("Error updating drone:", error.response?.data || error.message);
//     return { success: false, message: "Failed to update drone" };
//   }
// };

// export const viewGenerators = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}view_generator`,
//       {},
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
//     logger.error("Error viewing generators:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const updateGenerator = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_generator`,
//       data,
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
//     logger.error("Error updating generator:", error.response?.data || error.message);
//     return { success: false, message: "Failed to update generator" };
//   }
// };

// export const viewVehicles = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}view_vehicle`,
//       {},
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
//     logger.error("Error viewing vehicles:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const updateVehicle = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_vehicle`,
//       data,
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
//     logger.error("Error updating vehicle:", error.response?.data || error.message);
//     return { success: false, message: "Failed to update vehicle" };
//   }
// };

// export const viewRemoteControls = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}view_remote_control`,
//       {},
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
//     logger.error("Error viewing remote controls:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const updateRemoteControl = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_remote_control`,
//       data,
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
//     logger.error("Error updating remote control:", error.response?.data || error.message);
//     return { success: false, message: "Failed to update remote control" };
//   }
// };

// export const viewBatteries = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}view_battery`,
//       {},
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
//     logger.error("Error viewing batteries:", error.response?.data || error.message);
//     return null;
//   }
// };

// export const updateBattery = async (data) => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}update_battery`,
//       data,
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
//     logger.error("Error updating battery:", error.response?.data || error.message);
//     return { success: false, message: "Failed to update battery" };
//   }
// };


// export const insuranceType = async () => {
//   const headers = getAuthHeaders();
//   if (!headers) return { success: false, message: "User not logged in." };
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}view_insurance_type`,
//       {},
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
//     logger.error("Error fetching insurance types:", error.response?.data || error.message);
//     return null;
//   }
// };




