import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const dayEndProcessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Update ops_task_status after DJI submission
    updateOpsTaskStatus: builder.mutation({
      queryFn: async ({ taskId, status }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/day-end-process/update-ops-task-status',
            method: 'POST',
            body: { taskId, status },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['DayEndProcess'],
    }),

    // Get plans pending day end process count
    getPlansPendingDayEndCount: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/day-end-process/plans-pending-count',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['DayEndProcessCount'],
    }),

    // Get plan completion statistics
    getPlanCompletionStats: builder.query({
      queryFn: async ({ planId }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/day-end-process/plan-completion-stats',
            method: 'POST',
            body: { planId },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, { planId }) => [{ type: 'PlanCompletionStats', id: planId }],
    }),

    // Get plans with completion statistics for a date
    getPlansWithCompletionStats: builder.query({
      queryFn: async ({ date }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/day-end-process/plans-completion-stats',
            method: 'POST',
            body: { date },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlansCompletionStats'],
    }),
    // Get cancel reasons (mission_partial_reasons)
    getCancelReasons: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/day-end-process/cancel-reasons', method: 'POST', body: {} },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['CancelReasons'],
    }),

    // Get cancel status for tasks in a plan (com_naration data)
    getTasksCancelStatus: builder.query({
      queryFn: async ({ planId }) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/day-end-process/tasks-cancel-status', method: 'POST', body: { planId } },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || {} };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: (result, error, { planId }) => [{ type: 'TaskCancelStatus', id: planId }],
    }),

    // Cancel a task (set com_naration)
    cancelTask: builder.mutation({
      queryFn: async ({ taskId, reasonId }) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/day-end-process/cancel-task', method: 'POST', body: { taskId, reasonId } },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || null };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error, { taskId }) => ['DayEndProcess', 'TaskCancelStatus'],
    }),

    // Reset pilot cancel - Reset pilot canceled task to pending
    resetPilotCancel: builder.mutation({
      queryFn: async ({ taskId }) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/day-end-process/reset-pilot-cancel', method: 'POST', body: { taskId } },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || null };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error, { taskId }) => ['DayEndProcess', 'TaskCancelStatus'],
    }),

    // Get ops room canceled tasks by date range (report)
    getOpsRoomCanceledByDateRange: builder.query({
      queryFn: async ({ startDate, endDate, reasonFlag }) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/day-end-process/ops-room-canceled-by-date-range',
              method: 'POST',
              body: { startDate, endDate, reasonFlag: reasonFlag || undefined },
            },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['OpsRoomCanceledReport'],
    }),
  }),
});

export const {
  useUpdateOpsTaskStatusMutation,
  useGetPlansPendingDayEndCountQuery,
  useGetPlanCompletionStatsQuery,
  useGetPlansWithCompletionStatsQuery,
  useGetCancelReasonsQuery,
  useGetTasksCancelStatusQuery,
  useCancelTaskMutation,
  useResetPilotCancelMutation,
  useGetOpsRoomCanceledByDateRangeQuery,
} = dayEndProcessApi;

