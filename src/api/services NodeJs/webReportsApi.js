import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

/**
 * Node-backed replacements for the legacy PHP report endpoints.
 * Endpoint (and hook) names match the old `reportsApi.js` so report/chart
 * components and reportsSlice keep working after the PHP -> Node migration.
 * Team-lead report endpoints were intentionally dropped.
 */

const post = (url, body) =>
  nodeBackendBaseQuery({ url, method: 'POST', body }, {}, {});

export const webReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Hierarchy chart drill-down (Plan Areas / Covered Areas) ───
    getChartAllDataGroup: builder.query({
      queryFn: async (payload) => {
        const result = await post('/api/web-reports/chart/all', {
          start_date: payload?.start_date,
          end_date: payload?.end_date,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['ChartData'],
    }),
    getChartGroupData: builder.query({
      queryFn: async (payload) => {
        const result = await post('/api/web-reports/chart/group', {
          group_id: payload?.group_id,
          start_date: payload?.start_date,
          end_date: payload?.end_date,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['ChartData'],
    }),
    getChartPlantationData: builder.query({
      queryFn: async (payload) => {
        const result = await post('/api/web-reports/chart/plantation', {
          plantation_id: payload?.plantation_id,
          start_date: payload?.start_date,
          end_date: payload?.end_date,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['ChartData'],
    }),
    getChartRegionData: builder.query({
      queryFn: async (payload) => {
        const result = await post('/api/web-reports/chart/region', {
          region_id: payload?.region_id,
          start_date: payload?.start_date,
          end_date: payload?.end_date,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['ChartData'],
    }),

    // ─── Finance / plantation ───
    getPlantationCoveredArea: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/plantation-covered-area', {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['Reports'],
    }),
    getUsedChemicals: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/chemicals-usage', {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['Reports'],
    }),
    // Operations report (plan wise) — legacy sprayed_area_by_date_range_and_estate shape
    getFinanceReport: builder.query({
      queryFn: async ({ startDate, endDate, estates }) => {
        const result = await post('/api/web-reports/operations-plan-wise', {
          start_date: startDate,
          end_date: endDate,
          estates,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['Reports'],
    }),

    // ─── Ops room / pilot ───
    getPilotPerformance: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/pilot-performance', {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['PilotPerformance'],
    }),
    getPilotTeamSprayArea: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/pilot-spray-by-date', {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['Reports'],
    }),
    getApprovalCountReport: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/pilot-approval-summary', {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['Reports'],
    }),
    getFlightNumbersReport: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/flight-numbers', {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['Reports'],
    }),
    getIncompleteSubtasks: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/incomplete-subtasks', {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['Reports'],
    }),
    getCanceledFieldsByDateRange: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/canceled-by-pilots', {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['Reports'],
    }),
    getPilotFeedbacks: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/pilot-feedbacks', {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['Reports'],
    }),
    getPilotRevenueByDateRange: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/pilot-revenue', {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['PilotRevenue'],
    }),

    // ─── Task review workflow ───
    getTaskReviewReport: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await post('/api/web-reports/task-review/search', {
          from_date: startDate,
          to_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['TaskReports'],
    }),
    updateReviewByReviewBoard: builder.mutation({
      queryFn: async ({ taskId, review }) => {
        const result = await post('/api/web-reports/task-review/review-board', {
          task: taskId,
          review,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      invalidatesTags: ['TaskReports'],
    }),
    updateReviewByDirectorOps: builder.mutation({
      queryFn: async ({ taskId, status, review }) => {
        const result = await post('/api/web-reports/task-review/director-ops', {
          task: taskId,
          status,
          review,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      invalidatesTags: ['TaskReports'],
    }),
  }),
});

export const {
  useGetChartAllDataGroupQuery,
  useGetChartGroupDataQuery,
  useGetChartPlantationDataQuery,
  useGetChartRegionDataQuery,
  useGetPlantationCoveredAreaQuery,
  useGetUsedChemicalsQuery,
  useGetFinanceReportQuery,
  useGetPilotPerformanceQuery,
  useGetPilotTeamSprayAreaQuery,
  useGetApprovalCountReportQuery,
  useGetFlightNumbersReportQuery,
  useGetIncompleteSubtasksQuery,
  useGetCanceledFieldsByDateRangeQuery,
  useGetPilotFeedbacksQuery,
  useGetPilotRevenueByDateRangeQuery,
  useGetTaskReviewReportQuery,
  useUpdateReviewByReviewBoardMutation,
  useUpdateReviewByDirectorOpsMutation,
} = webReportsApi;
