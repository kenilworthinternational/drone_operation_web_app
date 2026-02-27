import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const logsReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLogCategories: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/logs-report/categories', method: 'POST', body: {} },
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

    getLogFiles: builder.query({
      queryFn: async (category) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/logs-report/files', method: 'POST', body: { category } },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: { files: result.data?.data || [], label: result.data?.label || '' } };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),

    getLogData: builder.query({
      queryFn: async ({ category, date }) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/logs-report/data', method: 'POST', body: { category, date } },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || { headers: [], rows: [], totalRows: 0 } };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),
  }),
});

export const {
  useGetLogCategoriesQuery,
  useLazyGetLogFilesQuery,
  useLazyGetLogDataQuery,
} = logsReportApi;
