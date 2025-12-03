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

export const teamEquipmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =====================================================
    // EQUIPMENT QUERIES
    // =====================================================
    
    // Remote Controls
    getRemoteControls: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/equipment/remote-controls',
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

    getRemoteControl: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/equipment/remote-controls/${id}`,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'RemoteControls', id }],
    }),

    // Batteries
    getBatteries: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/equipment/batteries',
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

    getBattery: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/equipment/batteries/${id}`,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'Batteries', id }],
    }),

    // Generators
    getGenerators: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/equipment/generators',
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

    getGenerator: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/equipment/generators/${id}`,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'Generators', id }],
    }),

    // Drones
    getDrones: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/equipment/drones',
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

    getDrone: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/equipment/drones/${id}`,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'Drones', id }],
    }),

    // =====================================================
    // TEAM EQUIPMENT ASSIGNMENT
    // =====================================================

    // Assign Remote Control
    assignRemoteControl: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/team-equipment/remote-controls/assign',
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

    // Remove Remote Control
    removeRemoteControl: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/team-equipment/remote-controls/remove',
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

    // Get Team Remote Controls
    getTeamRemoteControls: builder.query({
      queryFn: async (teamId) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/team-equipment/teams/${teamId}/remote-controls`,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, teamId) => [{ type: 'Teams', id: teamId }],
    }),

    // Assign Battery
    assignBattery: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/team-equipment/batteries/assign',
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

    // Remove Battery
    removeBattery: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/team-equipment/batteries/remove',
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

    // Get Team Batteries
    getTeamBatteries: builder.query({
      queryFn: async ({ teamId, type = null }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/team-equipment/teams/${teamId}/batteries${type ? `?type=${type}` : ''}`,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, { teamId }) => [{ type: 'Teams', id: teamId }],
    }),

    // Assign Generator
    assignGenerator: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/team-equipment/generators/assign',
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

    // Remove Generator
    removeGenerator: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/team-equipment/generators/remove',
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

    // Get Team Generators
    getTeamGenerators: builder.query({
      queryFn: async (teamId) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/team-equipment/teams/${teamId}/generators`,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, teamId) => [{ type: 'Teams', id: teamId }],
    }),

    // Assign Drone
    assignDrone: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/team-equipment/drones/assign',
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

    // Remove Drone
    removeDrone: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/team-equipment/drones/remove',
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

    // Get Team Drones
    getTeamDrones: builder.query({
      queryFn: async (teamId) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/team-equipment/teams/${teamId}/drones`,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, teamId) => [{ type: 'Teams', id: teamId }],
    }),

    // Get All Team Equipment
    getTeamEquipment: builder.query({
      queryFn: async (teamId) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/team-equipment/teams/${teamId}/equipment`,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, teamId) => [{ type: 'Teams', id: teamId }],
    }),

    // Get Pilots with Teams
    getPilotsWithTeams: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/team-equipment/pilots-with-teams',
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Pilots', 'Teams'],
    }),

    // =====================================================
    // TEMPORARY ALLOCATIONS
    // =====================================================

    // Create Temporary Remote Control Allocation
    createTempRemoteControl: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/temp-allocation/remote-controls',
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

    // Create Temporary Battery Allocation
    createTempBattery: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/temp-allocation/batteries',
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

    // Create Temporary Generator Allocation
    createTempGenerator: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/temp-allocation/generators',
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

    // Create Temporary Drone Allocation
    createTempDrone: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/temp-allocation/drones',
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

    // Get Temporary Allocations by Date
    getTempAllocationsByDate: builder.query({
      queryFn: async (date) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/temp-allocation/date/${date}`,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, date) => [{ type: 'Teams', id: `temp-${date}` }],
    }),

    // Get Temporary Allocations by Team
    getTempAllocationsByTeam: builder.query({
      queryFn: async ({ teamId, date = null }) => {
        const url = `/api/temp-allocation/teams/${teamId}${date ? `?date=${date}` : ''}`;
        const result = await nodeBackendBaseQuery(
          {
            url,
            method: 'GET',
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, { teamId }) => [{ type: 'Teams', id: teamId }],
    }),

    // Cancel Temporary Allocation
    cancelTempAllocation: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/temp-allocation/cancel',
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
  // Equipment Queries
  useGetRemoteControlsQuery,
  useGetRemoteControlQuery,
  useGetBatteriesQuery,
  useGetBatteryQuery,
  useGetGeneratorsQuery,
  useGetGeneratorQuery,
  useGetDronesQuery,
  useGetDroneQuery,
  // Team Equipment Mutations
  useAssignRemoteControlMutation,
  useRemoveRemoteControlMutation,
  useGetTeamRemoteControlsQuery,
  useAssignBatteryMutation,
  useRemoveBatteryMutation,
  useGetTeamBatteriesQuery,
  useAssignGeneratorMutation,
  useRemoveGeneratorMutation,
  useGetTeamGeneratorsQuery,
  useAssignDroneMutation,
  useRemoveDroneMutation,
  useGetTeamDronesQuery,
  useGetTeamEquipmentQuery,
  useGetPilotsWithTeamsQuery,
  // Temporary Allocations
  useCreateTempRemoteControlMutation,
  useCreateTempBatteryMutation,
  useCreateTempGeneratorMutation,
  useCreateTempDroneMutation,
  useGetTempAllocationsByDateQuery,
  useGetTempAllocationsByTeamQuery,
  useCancelTempAllocationMutation,
} = teamEquipmentApi;

