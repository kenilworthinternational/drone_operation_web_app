import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const opsroomPerformanceSummaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOpsroomDailyPerformanceSummary: builder.query({
      queryFn: async ({ months, missionType = 'spy', completedPlansOnly = false }) => {
        try {
          const monthList = Array.isArray(months) ? months : [];
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/opsroom-performance-summary/daily-performance-summary',
              method: 'POST',
              body: {
                months: monthList,
                mission_type: missionType,
                completed_plans_only: completedPlansOnly,
              },
            },
            {},
            {},
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || null };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),
  }),
});

export const { useLazyGetOpsroomDailyPerformanceSummaryQuery } = opsroomPerformanceSummaryApi;
