import { baseApi } from '../baseApi';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Node.js Backend Base URL Configuration
const getNodeBackendUrl = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'https://dsms-web-api-dev.kenilworthinternational.com';
  }
  
  if (hostname.includes('dev') || hostname.includes('kenilworthinternational.com')) {
    return 'https://dsms-web-api-dev.kenilworthinternational.com';
  }
  
  if (hostname.includes('test')) {
    return 'https://dsms-api-test.kenilworth.international.com';
  }
  
  return 'https://dsms-api.kenilworth.international.com';
};

// Helper function to get token
const getToken = () => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));
  return storedUser?.token || null;
};

// Custom base query for Node.js backend
const nodeBackendBaseQuery = fetchBaseQuery({
  baseUrl: getNodeBackendUrl(),
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const fleetEquipmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =====================================================
    // EQUIPMENT QUERIES
    // =====================================================
    
    // Get remote controls
    getFleetRemoteControls: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/remote-controls',
            method: 'POST',
            body: filters,
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['RemoteControls'],
    }),

    // Get batteries
    getFleetBatteries: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/batteries',
            method: 'POST',
            body: filters,
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Batteries'],
    }),

    // Get generators
    getFleetGenerators: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/generators',
            method: 'POST',
            body: filters,
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Generators'],
    }),

    // Get drones
    getFleetDrones: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/drones',
            method: 'POST',
            body: filters,
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Drones'],
    }),

    // =====================================================
    // TEAM EQUIPMENT ASSIGNMENTS
    // =====================================================

    // Assign remote control
    assignFleetRemoteControl: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/assign/remote-control',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['RemoteControls', 'Teams'],
    }),

    // Remove remote control
    removeFleetRemoteControl: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/remove/remote-control',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['RemoteControls', 'Teams'],
    }),

    // Assign battery
    assignFleetBattery: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/assign/battery',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Batteries', 'Teams'],
    }),

    // Remove battery
    removeFleetBattery: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/remove/battery',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Batteries', 'Teams'],
    }),

    // Assign generator
    assignFleetGenerator: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/assign/generator',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Generators', 'Teams'],
    }),

    // Remove generator
    removeFleetGenerator: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/remove/generator',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Generators', 'Teams'],
    }),

    // Assign drone
    assignFleetDrone: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/assign/drone',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Drones', 'Teams'],
    }),

    // Remove drone
    removeFleetDrone: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/remove/drone',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Drones', 'Teams'],
    }),

    // Get pilots with teams
    getFleetPilotsWithTeams: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/pilots-with-teams',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Pilots', 'Teams'],
    }),

    // Create team with pilot
    createFleetTeam: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/create-team',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Pilots', 'Teams'],
    }),

    // Get team equipment
    getFleetTeamEquipment: builder.query({
      queryFn: async (teamId) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/fleet-equipment/team/${teamId}/equipment`,
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, teamId) => [{ type: 'Teams', id: teamId }],
    }),

    // =====================================================
    // TEMPORARY ALLOCATIONS
    // =====================================================

    // Create temp remote control
    createTempFleetRemoteControl: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/temp/remote-control',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['RemoteControls', 'Teams'],
    }),

    // Create temp battery
    createTempFleetBattery: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/temp/battery',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Batteries', 'Teams'],
    }),

    // Create temp generator
    createTempFleetGenerator: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/temp/generator',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Generators', 'Teams'],
    }),

    // Create temp drone
    createTempFleetDrone: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/temp/drone',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Drones', 'Teams'],
    }),

    // Get temp allocations by date
    getTempFleetAllocationsByDate: builder.query({
      queryFn: async (date) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/fleet-equipment/temp/date/${date}`,
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, date) => [{ type: 'Teams', id: `temp-${date}` }],
    }),

    // Cancel temp allocation
    cancelTempFleetAllocation: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/fleet-equipment/temp/cancel',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Teams', 'RemoteControls', 'Batteries', 'Generators', 'Drones'],
    }),
  }),
});

export const {
  // Equipment queries
  useGetFleetRemoteControlsQuery,
  useGetFleetBatteriesQuery,
  useGetFleetGeneratorsQuery,
  useGetFleetDronesQuery,
  // Team assignments
  useAssignFleetRemoteControlMutation,
  useRemoveFleetRemoteControlMutation,
  useAssignFleetBatteryMutation,
  useRemoveFleetBatteryMutation,
  useAssignFleetGeneratorMutation,
  useRemoveFleetGeneratorMutation,
  useAssignFleetDroneMutation,
  useRemoveFleetDroneMutation,
  useGetFleetPilotsWithTeamsQuery,
  useCreateFleetTeamMutation,
  useGetFleetTeamEquipmentQuery,
  // Temporary allocations
  useCreateTempFleetRemoteControlMutation,
  useCreateTempFleetBatteryMutation,
  useCreateTempFleetGeneratorMutation,
  useCreateTempFleetDroneMutation,
  useGetTempFleetAllocationsByDateQuery,
  useCancelTempFleetAllocationMutation,
} = fleetEquipmentApi;

