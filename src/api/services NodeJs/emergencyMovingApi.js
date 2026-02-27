import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const emergencyMovingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get plans with fields for a specific date
    getPlansWithFields: builder.query({
      queryFn: async (date) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/emergency-moving/plans-with-fields',
              method: 'POST',
              body: { date },
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const plans = result.data?.data || result.data || [];
          return { data: plans };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['EmergencyMoving'],
    }),

    // Swap field to another plan
    swapFieldToPlan: builder.mutation({
      queryFn: async ({ field_task_id, target_plan_id, date }) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/emergency-moving/swap-field',
              method: 'POST',
              body: { field_task_id, target_plan_id, date },
            },
            {},
            {}
          );
          return result;
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['EmergencyMoving'],
      // Force refetch of plans after swap
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          // Invalidate and refetch plans with fields
          dispatch(emergencyMovingApi.util.invalidateTags(['EmergencyMoving']));
        } catch (error) {
          console.error('Error in swapFieldToPlan mutation:', error);
        }
      },
    }),

    // Get assignments with plans and missions for a specific date
    getAssignmentsWithPlansAndMissions: builder.query({
      queryFn: async (date) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/emergency-moving/assignments',
              method: 'POST',
              body: { date },
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const assignments = result.data?.data || result.data || [];
          return { data: assignments };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['EmergencyMoving'],
    }),

    // Get list of all active drones
    getAllDrones: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/emergency-moving/drones',
              method: 'POST',
              body: {},
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const drones = result.data?.data || result.data || [];
          return { data: drones };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['EmergencyMoving'],
    }),

    // Update assignment's pilot and drone
    updateAssignmentPilotAndDrone: builder.mutation({
      queryFn: async ({ assignment_id, pilot_id, drone_id }) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/emergency-moving/update-assignment-pilot-drone',
              method: 'POST',
              body: { assignment_id, pilot_id, drone_id },
            },
            {},
            {}
          );
          return result;
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['EmergencyMoving'],
      // Force refetch of assignments after update
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          // Invalidate and refetch assignments
          dispatch(emergencyMovingApi.util.invalidateTags(['EmergencyMoving']));
        } catch (error) {
          console.error('Error in updateAssignmentPilotAndDrone mutation:', error);
        }
      },
    }),
    changeAssignmentPilot: builder.mutation({
      queryFn: async ({ assignment_id, pilot_id, drone_id }) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/emergency-moving/change-assignment-pilot',
              method: 'POST',
              body: { assignment_id, pilot_id, drone_id },
            },
            {},
            {}
          );
          return result;
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['EmergencyMoving'],
      // Force refetch of assignments after change
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          // Invalidate and refetch assignments
          dispatch(emergencyMovingApi.util.invalidateTags(['EmergencyMoving']));
        } catch (error) {
          console.error('Error in changeAssignmentPilot mutation:', error);
        }
      },
    }),
  }),
});

// Export hooks
export const {
  useGetPlansWithFieldsQuery,
  useSwapFieldToPlanMutation,
  useGetAssignmentsWithPlansAndMissionsQuery,
  useGetAllDronesQuery,
  useUpdateAssignmentPilotAndDroneMutation,
  useChangeAssignmentPilotMutation,
} = emergencyMovingApi;

