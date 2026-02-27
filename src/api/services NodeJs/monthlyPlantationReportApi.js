import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const monthlyPlantationReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get plantations list for the selector
    getReportPlantations: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/monthly-plantation-report/plantations', method: 'POST', body: {} },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),

    // Get the monthly plantation report
    getMonthlyPlantationReport: builder.query({
      queryFn: async ({ plantationIds, months, missionType }) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/monthly-plantation-report/report',
              method: 'POST',
              body: { plantationIds, months, missionType },
            },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || { plantations: [], months: [] } };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),
  }),
});

export const {
  useGetReportPlantationsQuery,
  useLazyGetMonthlyPlantationReportQuery,
} = monthlyPlantationReportApi;
