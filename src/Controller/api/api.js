import axios from "axios";

const API_BASE_URL = "https://drone-admin.kenilworthinternational.com/api/";

export const verifyUser = async (phoneNumber) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}check_mobile_no_availability_all`, 
      { mobile_no: phoneNumber }, // Send phone number in the request body
      {
        headers: {
          "Content-Type": "application/json" // Set headers for JSON request
        }
      }
    );

    console.log("API Response:", response.data); // Print the response data
    return response.data; // Return the actual data
  } catch (error) {
    console.error("Error fetching user verification:", error.response ? error.response.data : error.message);
    return { success: false, message: "Verification failed" };
  }
};


export const loginUser = async (phoneNumber) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}login`, 
      { mobile_no: phoneNumber },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("API Response:", response.data); // Print the response data
    return response.data; // Return the actual data
  } catch (error) {
    console.error("Error fetching user Logged in:", error.response ? error.response.data : error.message);
    return { success: false, message: "Login failed" };
  }
};

export const groupGetter = async () => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {
    console.error("No token found. User is not logged in.");
    return [];
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}display_groups`, 
      {},
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`
        }
      }
    );

    console.log("API Response:", response.data); // Log the response
    return response.data; // Assuming this is an array of groups
  } catch (error) {
    console.error("Error fetching Get Group:", error.response ? error.response.data : error.message);
    return []; // Return an empty array on error
  }
};
export const groupPlantation = async (groupId) => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {
    console.error("No token found. User is not logged in.");
    return [];
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}display_plantation`, 
      {"group":groupId},
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`
        }
      }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Get Plantation:", error.response ? error.response.data : error.message);
    return [];
  }
};

export const groupRegion = async (plantationID) => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {
    console.error("No token found. User is not logged in.");
    return [];
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}display_region`, 
      {"plantation":plantationID},
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`
        }
      }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Get Region:", error.response ? error.response.data : error.message);
    return [];
  }
};


export const groupEstate = async (regionID) => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {
    console.error("No token found. User is not logged in.");
    return [];
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}display_estate`, 
      {"region":regionID},
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`
        }
      }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Get Region:", error.response ? error.response.data : error.message);
    return [];
  }
};



export const divisionStateList = async (estateID) => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {
    console.error("No token found. User is not logged in.");
    return [];
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}display_division_field_by_estate`, 
      {"estate":estateID},
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`
        }
      }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Get Division:", error.response ? error.response.data : error.message);
    return [];
  }
};


export const missionType = async () => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {

    console.error("No token found. User is not logged in.", storedUser.token);
    return [];
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}mission_type`,
      {},
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`
        }
      }
    );

    console.log("API missiontype:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Get missiontype:", error.response ? error.response.data : error.message);
    return [];
  }
};

export const cropType = async () => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {

    console.error("No token found. User is not logged in.", storedUser.token);
    return [];
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}display_crop_type`,
      {},
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`
        }
      }
    );

    console.log("API display_crop_type:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Get display_crop_type:", error.response ? error.response.data : error.message);
    return [];
  }
};


export const submitPlan = async (submissionData) => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {
    console.error("No token found. User is not logged in.");
    return { success: false, message: "User not logged in." };
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}create_plan`,
      submissionData, // Send the JSON data
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting plan:", error.response ? error.response.data : error.message);
    return { success: false, message: "Submission failed" }; // Return a failure message
  }
};

export const getPlansUsingDate = async (date) => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {
    console.error("No token found. User is not logged in.");
    return { success: false, message: "User not logged in." };
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}find_plans_by_date`,
      {"date":date}, // Send the JSON data
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error Finding plan:", error.response ? error.response.data : error.message);
    return { success: false, message: "Submission failed" }; // Return a failure message
  }
};


export const getPilotsDetails = async () => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {
    console.error("No token found. User is not logged in.");
    return { success: false, message: "User not logged in." };
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}team_lead_and_pilot_list`,
      {}, // Send the JSON data
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error Finding Pilots:", error.response ? error.response.data : error.message);
    return { success: false, message: "Pilot Details Catching Failed" }; // Return a failure message
  }
};
export const getDronesDetails = async () => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {
    console.error("No token found. User is not logged in.");
    return { success: false, message: "User not logged in." };
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}drone_list`,
      {}, // Send the JSON data
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error Finding Drone:", error.response ? error.response.data : error.message);
    return { success: false, message: "Drone Details Catching Failed" }; // Return a failure message
  }
};
export const getUpdateMissionDetails = async (data) => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (!storedUser || !storedUser.token) {
      console.error("No token found. User is not logged in.");
      return { success: false, message: "User not logged in." };
    }
  
    const response = await axios.post(
      `${API_BASE_URL}display_for_update_plan`,
      data,
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        },
      }
    );
    console.log("Output ",response.data);
    return response.data;
  } catch (error) {
    console.error("Error Finding Update Mission:", error.response?.data || error.message);
    return null;
  }
};



export const submitAlocation = async (submissionData) => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (!storedUser || !storedUser.token) {
    console.error("No token found. User is not logged in.");
    return { success: false, message: "User not logged in." };
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}plan_resource_allocations`,
      submissionData,
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("API Response:", response.data);

    // Adjusting the success check based on the API response message
    return { 
      success: response.data.message === 'Plan details saved successfully', 
      message: response.data.message 
    };
  } catch (error) {
    console.error("Error submitting resources allocation:", error.response ? error.response.data : error.message);
    return { success: false, message: "Resources allocation failed" };
  }
};


export const getSummaryDataGroup = async (id, start_date, end_date) => {
  console.log("sended data", id, start_date, end_date)
  try {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (!storedUser || !storedUser.token) {
      console.error("No token found. User is not logged in.");
      return { success: false, message: "User not logged in." };
    }
  
    const response = await axios.post(
      `${API_BASE_URL}get_plan_resource_allocation_details_by_group_and_date_range`,
      {
        "group":id,
        "start_date":start_date,
        "end_date":end_date
      }
      ,
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        },
      }
    );
    console.log("Output ",response.data);
    return response.data;
  } catch (error) {
    console.error("Error Finding Update Mission:", error.response?.data || error.message);
    return null;
  }
};

export const getSummaryDataPlantation = async (id, start_date, end_date) => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (!storedUser || !storedUser.token) {
      console.error("No token found. User is not logged in.");
      return { success: false, message: "User not logged in." };
    }
  
    const response = await axios.post(
      `${API_BASE_URL}get_plan_resource_allocation_details_by_plantation_and_date_range`,
      {
        "plantation":id,
        "start_date":start_date,
        "end_date":end_date
      },
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        },
      }
    );
    console.log("Output ",response.data);
    return response.data;
  } catch (error) {
    console.error("Error Finding Update Mission:", error.response?.data || error.message);
    return null;
  }
};

export const getSummaryDataRegion = async (id, start_date, end_date) => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (!storedUser || !storedUser.token) {
      console.error("No token found. User is not logged in.");
      return { success: false, message: "User not logged in." };
    }
  
    const response = await axios.post(
      `${API_BASE_URL}get_plan_resource_allocation_details_by_region_and_date_range`,
      {
        "region":id,
        "start_date":start_date,
        "end_date":end_date
      },
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        },
      }
    );
    console.log("Output ",response.data);
    return response.data;
  } catch (error) {
    console.error("Error Finding Update Mission:", error.response?.data || error.message);
    return null;
  }
};
export const getSummaryDataEstate = async (id, start_date, end_date) => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (!storedUser || !storedUser.token) {
      console.error("No token found. User is not logged in.");
      return { success: false, message: "User not logged in." };
    }
  
    const response = await axios.post(
      `${API_BASE_URL}get_plan_resource_allocation_details_by_estate_and_date_range`,
      {
        "estate":id,
        "start_date":start_date,
        "end_date":end_date
      },
      {
        headers: {
          "Authorization": `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        },
      }
    );
    console.log("Output ",response.data);
    return response.data;
  } catch (error) {
    console.error("Error Finding Update Mission:", error.response?.data || error.message);
    return null;
  }
};
