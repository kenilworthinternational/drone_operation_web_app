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
  }),
});

export const {
  useUpdateOpsTaskStatusMutation,
  useGetPlansPendingDayEndCountQuery,
  useGetPlanCompletionStatsQuery,
  useGetPlansWithCompletionStatsQuery,
} = dayEndProcessApi;

