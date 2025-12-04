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

export const pilotAssignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =====================================================
    // GET PLANS FOR DATE
    // =====================================================
    getPilotAssignmentPlans: builder.query({
      queryFn: async (date) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/plans',
            method: 'POST',
            body: { date },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PilotAssignmentPlans'],
    }),

    // =====================================================
    // GET MISSIONS FOR DATE
    // =====================================================
    getPilotAssignmentMissions: builder.query({
      queryFn: async (date) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/missions',
            method: 'POST',
            body: { date },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PilotAssignmentMissions'],
    }),

    // =====================================================
    // GET PILOTS WITH TEAMS
    // =====================================================
    getPilotAssignmentPilots: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/pilots',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PilotAssignmentPilots'],
    }),

    // =====================================================
    // GET DRONE FOR TEAM
    // =====================================================
    getPilotAssignmentDrone: builder.query({
      queryFn: async ({ team_id, date }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/drone',
            method: 'POST',
            body: { team_id, date },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PilotAssignmentDrone'],
    }),

    // =====================================================
    // CREATE ASSIGNMENT
    // =====================================================
    createPilotAssignment: builder.mutation({
      queryFn: async (assignmentData) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/create',
            method: 'POST',
            body: assignmentData,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['PilotAssignmentPlans', 'PilotAssignmentMissions'],
    }),

    // =====================================================
    // GET ASSIGNMENT BY ID
    // =====================================================
    getPilotAssignmentById: builder.query({
      queryFn: async (assignment_id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/get',
            method: 'POST',
            body: { assignment_id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, assignment_id) => [{ type: 'PilotAssignment', id: assignment_id }],
    }),

    // =====================================================
    // GET ALL TEAMS WITH PILOTS AND DRONES
    // =====================================================
    getAllTeams: builder.query({
      queryFn: async (date) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/teams',
            method: 'POST',
            body: { date },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PilotAssignmentTeams'],
    }),
  }),
});

export const {
  useGetPilotAssignmentPlansQuery,
  useGetPilotAssignmentMissionsQuery,
  useGetPilotAssignmentPilotsQuery,
  useGetPilotAssignmentDroneQuery,
  useCreatePilotAssignmentMutation,
  useGetPilotAssignmentByIdQuery,
  useGetAllTeamsQuery,
} = pilotAssignmentApi;

