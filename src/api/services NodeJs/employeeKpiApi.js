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

    getSmartKpiDimensions: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/dimensions', method: 'GET' },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
    }),

    getSmartKpiFieldTypes: builder.query({
      queryFn: async ({ include_inactive = false } = {}) => {
        const q = include_inactive ? '?include_inactive=1' : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/kpi/smart/field-types${q}`, method: 'GET' },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['SmartKpiFieldTypes'],
    }),

    saveSmartKpiFieldType: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/field-types/save', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['SmartKpiFieldTypes'],
    }),

    getSmartKpiTemplates: builder.query({
      queryFn: async (params = {}) => {
        const qs = new URLSearchParams();
        if (params.emp_department_id) qs.set('emp_department_id', params.emp_department_id);
        if (params.emp_sub_division_id) qs.set('emp_sub_division_id', params.emp_sub_division_id);
        if (params.emp_job_role_id) qs.set('emp_job_role_id', params.emp_job_role_id);
        if (params.include_inactive) qs.set('include_inactive', '1');
        const q = qs.toString() ? `?${qs.toString()}` : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/kpi/smart/templates${q}`, method: 'GET' },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['SmartKpiTemplates'],
    }),

    saveSmartKpiTemplate: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/templates/save', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['SmartKpiTemplates'],
    }),

    bulkApplySmartKpi: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/reviews/bulk-apply', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['SmartKpiReviews', 'SmartKpiScopeStatus'],
    }),

    getSmartKpiScopeStatus: builder.query({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/templates/scope-status', method: 'POST', body: body || {} },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
      providesTags: ['SmartKpiScopeStatus'],
    }),

    applySmartKpiTemplate: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/templates/apply', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['SmartKpiReviews', 'SmartKpiScopeStatus'],
    }),

    removeSmartKpiTemplate: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/templates/remove', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['SmartKpiReviews', 'SmartKpiScopeStatus'],
    }),

    getSmartKpiReviewList: builder.query({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/reviews/list', method: 'POST', body: body || {} },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['SmartKpiReviews'],
    }),

    getSmartKpiReviewDetail: builder.query({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/reviews/detail', method: 'POST', body: body || {} },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
      providesTags: ['SmartKpiReviews'],
    }),

    saveSmartKpiGoals: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/reviews/save-goals', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['SmartKpiReviews'],
    }),

    saveSmartKpiResults: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/reviews/save-results', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['SmartKpiReviews'],
    }),

    smartKpiWorkflow: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/kpi/smart/reviews/workflow', method: 'POST', body: body || {} },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['SmartKpiReviews'],
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
  useGetSmartKpiDimensionsQuery,
  useGetSmartKpiFieldTypesQuery,
  useSaveSmartKpiFieldTypeMutation,
  useGetSmartKpiTemplatesQuery,
  useSaveSmartKpiTemplateMutation,
  useBulkApplySmartKpiMutation,
  useGetSmartKpiScopeStatusQuery,
  useApplySmartKpiTemplateMutation,
  useRemoveSmartKpiTemplateMutation,
  useGetSmartKpiReviewListQuery,
  useGetSmartKpiReviewDetailQuery,
  useLazyGetSmartKpiReviewDetailQuery,
  useSaveSmartKpiGoalsMutation,
  useSaveSmartKpiResultsMutation,
  useSmartKpiWorkflowMutation,
} = employeeKpiApi;
