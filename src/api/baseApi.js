import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/config';
import { logger } from '../utils/logger';

// Helper function to get token
const getToken = () => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));
  return storedUser?.token || null;
};

// Base query with auth headers
const FORM_DATA_ENDPOINTS = ['submitDJIRecord'];

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { endpoint }) => {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!FORM_DATA_ENDPOINTS.includes(endpoint)) {
      headers.set('Content-Type', 'application/json');
    } else {
      headers.delete('Content-Type');
    }

    return headers;
  },
});

// Base query with error handling and logging
const baseQueryWithLogging = async (args, api, extraOptions) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  
  if (result.error) {
    logger.error('API Error:', {
      endpoint: typeof args === 'string' ? args : args.url,
      status: result.error.status,
      data: result.error.data
    });
  }
  
  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithLogging,
  tagTypes: [
    // Authentication
    'Auth',
    // Estates & Geography
    'Groups', 'Plantations', 'Regions', 'Estates', 'Divisions', 'Fields',
    // Plans & Missions
    'Plans', 'Missions', 'PlanDetails', 'MissionDetails',
    // Teams & Resources
    'Teams', 'Pilots', 'Drones', 'Operators',
    // Bookings
    'Bookings', 'ASCBookings', 'Farmers',
    // Reports
    'Reports', 'ChartData', 'TaskReports', 'PilotPerformance',
    // Assets
    'Assets', 'Vehicles', 'Generators', 'Batteries', 'RemoteControls', 'Insurance',
    // Stock and Assets Management
    'Suppliers', 'MainCategories', 'SubCategories', 'InventoryItems',
    // Finance
    'Brokers', 'PilotRevenue', 'DefaultValues',
    // Dropdowns
    'Sectors', 'Crops', 'MissionTypes', 'TimeSlots', 'ChemicalTypes', 'Stages',
    // Others
    'Calendar', 'Reasons', 'ASC'
  ],
  endpoints: () => ({}),
});

export default baseApi;

