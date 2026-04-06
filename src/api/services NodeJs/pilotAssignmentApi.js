import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

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
    // GET MISSIONS PENDING PAYMENT
    // =====================================================
    getMissionsPendingPayment: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/missions-pending-payment',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PilotAssignmentMissions'],
    }),

    // =====================================================
    // GET RESOURCE ASSIGNMENT COUNT
    // =====================================================
    getResourceAssignmentCount: builder.query({
      queryFn: async (date) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/resource-assignment-count',
            method: 'POST',
            body: { date },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['ResourceAssignmentCount'],
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

    // =====================================================
    // GET TODAY'S PLANS AND MISSIONS WITH RESOURCE ALLOCATION
    // =====================================================
    getTodayPlansAndMissions: builder.query({
      queryFn: async (date) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/today',
            method: 'POST',
            body: { date },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['TodayPlansAndMissions'],
    }),

    // =====================================================
    // DRONE UNLOCKING QUEUE
    // =====================================================
    getDroneUnlockingQueue: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/drone-unlocking-queue',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['DroneUnlockingQueue'],
    }),

    // Update plan drone unlock status
    updatePlanDroneUnlock: builder.mutation({
      queryFn: async ({ planId, unlockStatus }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/pilot-assignment/drone-unlock/plan/${planId}`,
            method: 'PUT',
            body: { unlockStatus },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['DroneUnlockingQueue'],
    }),

    // Update mission drone unlock status
    updateMissionDroneUnlock: builder.mutation({
      queryFn: async ({ missionId, unlockStatus }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/pilot-assignment/drone-unlock/mission/${missionId}`,
            method: 'PUT',
            body: { unlockStatus },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['DroneUnlockingQueue'],
    }),

    getTransportArrangementList: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/transport/arrangement-list',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['TransportArrangementList'],
    }),

    getPilotTransportOptions: builder.query({
      queryFn: async ({ assignment_id, yearMonth, plan_ids = [] }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/transport/options',
            method: 'POST',
            body: { assignment_id, yearMonth, plan_ids },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PilotTransportOptions'],
    }),

    estimatePilotTransportDistance: builder.mutation({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/transport/estimate',
            method: 'POST',
            body: payload,
          },
          {},
          {}
        );
        return result;
      },
    }),

    assignPilotTransportDetails: builder.mutation({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/transport/assign',
            method: 'POST',
            body: payload,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['PilotAssignmentPlans', 'PilotAssignmentMissions', 'PilotTransportOptions', 'TransportArrangementList'],
    }),

    getHrTransportEstimates: builder.query({
      queryFn: async ({ assignment_date }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/pilot-assignment/transport/hr-estimates',
            method: 'POST',
            body: { assignment_date },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PilotTransportEstimates'],
    }),
  }),
});

export const {
  useGetPilotAssignmentPlansQuery,
  useGetPilotAssignmentMissionsQuery,
  useGetMissionsPendingPaymentQuery,
  useGetResourceAssignmentCountQuery,
  useGetPilotAssignmentPilotsQuery,
  useGetPilotAssignmentDroneQuery,
  useCreatePilotAssignmentMutation,
  useGetPilotAssignmentByIdQuery,
  useGetAllTeamsQuery,
  useGetTodayPlansAndMissionsQuery,
  useGetDroneUnlockingQueueQuery,
  useUpdatePlanDroneUnlockMutation,
  useUpdateMissionDroneUnlockMutation,
  useGetTransportArrangementListQuery,
  useGetPilotTransportOptionsQuery,
  useEstimatePilotTransportDistanceMutation,
  useAssignPilotTransportDetailsMutation,
  useGetHrTransportEstimatesQuery,
} = pilotAssignmentApi;

