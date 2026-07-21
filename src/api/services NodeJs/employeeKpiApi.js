import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const employeeKpiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getKpiDefinitions: builder.query({
      queryFn: async ({ include_inactive = true } = {}) => {
        const q = include_inactive ? '?include_inactive=1' : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/kpi/definitions${q}`, method: 'GET' },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['KpiDefinitions'],
    }),

    saveKpiDefinition: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/definitions/save', method: 'POST', body },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['KpiDefinitions', 'KpiLeaderboard'],
    }),

    getKpiRatingBands: builder.query({
      queryFn: async ({ include_inactive = true } = {}) => {
        const q = include_inactive ? '?include_inactive=1' : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/kpi/rating-bands${q}`, method: 'GET' },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['KpiRatingBands'],
    }),

    saveKpiRatingBand: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/rating-bands/save', method: 'POST', body },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['KpiRatingBands', 'KpiLeaderboard'],
    }),

    getKpiSourceMetrics: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/source-metrics', method: 'GET' },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
    }),

    getKpiLeaderboard: builder.query({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/leaderboard', method: 'POST', body: body || {} },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
      providesTags: ['KpiLeaderboard'],
    }),

    getKpiEmployeeDetail: builder.query({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/employee-detail', method: 'POST', body: body || {} },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
      providesTags: ['KpiLeaderboard'],
    }),

    recomputeKpiSnapshots: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/recompute', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['KpiLeaderboard'],
    }),

    getKpiTaskKanban: builder.query({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/tasks/kanban', method: 'POST', body: body || {} },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
      providesTags: ['KpiTasks'],
    }),

    getKpiTaskDetail: builder.query({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/tasks/detail', method: 'POST', body: body || {} },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
      providesTags: ['KpiTasks'],
    }),

    saveKpiTask: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/tasks/save', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['KpiTasks', 'KpiLeaderboard'],
    }),

    updateKpiTaskStatus: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/tasks/status', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['KpiTasks', 'KpiLeaderboard'],
    }),

    deleteKpiTask: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/tasks/delete', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['KpiTasks', 'KpiLeaderboard'],
    }),
  }),
});

export const {
  useGetKpiDefinitionsQuery,
  useSaveKpiDefinitionMutation,
  useGetKpiRatingBandsQuery,
  useSaveKpiRatingBandMutation,
  useGetKpiSourceMetricsQuery,
  useGetKpiLeaderboardQuery,
  useLazyGetKpiLeaderboardQuery,
  useGetKpiEmployeeDetailQuery,
  useLazyGetKpiEmployeeDetailQuery,
  useRecomputeKpiSnapshotsMutation,
  useGetKpiTaskKanbanQuery,
  useLazyGetKpiTaskKanbanQuery,
  useGetKpiTaskDetailQuery,
  useLazyGetKpiTaskDetailQuery,
  useSaveKpiTaskMutation,
  useUpdateKpiTaskStatusMutation,
  useDeleteKpiTaskMutation,
} = employeeKpiApi;
