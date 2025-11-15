import { baseApi } from '../baseApi';

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Team lead assignment report
    getTeamLeadReport: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'team_lead_performance_by_date_range',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Reports'],
    }),

    // Approval count report
    getApprovalCountReport: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'pilots_subtask_and_aprroval_count',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Reports'],
    }),

    // Flight numbers report
    getFlightNumbersReport: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'plan_field_no_of_flights',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Reports'],
    }),

    // Pilot revenue by date range
    getPilotRevenueByDateRange: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'get_pilot_daily_payment_by_date_range',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['PilotRevenue'],
    }),

    // Task review report by date range
    getTaskReviewReport: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'search_task_flag_by_date_range',
        method: 'POST',
        body: { from_date: startDate, to_date: endDate },
      }),
      providesTags: ['TaskReports'],
    }),

    // Chart data - All groups
    getChartAllDataGroup: builder.query({
      query: (payload) => ({
        url: 'for_all_by_date',
        method: 'POST',
        body: payload,
      }),
      providesTags: ['ChartData'],
    }),

    // Chart data - Group level
    getChartGroupData: builder.query({
      query: (payload) => ({
        url: 'for_group_by_date',
        method: 'POST',
        body: payload,
      }),
      providesTags: ['ChartData'],
    }),

    // Chart data - Plantation level
    getChartPlantationData: builder.query({
      query: (payload) => ({
        url: 'for_plantation_by_date',
        method: 'POST',
        body: payload,
      }),
      providesTags: ['ChartData'],
    }),

    // Chart data - Region level
    getChartRegionData: builder.query({
      query: (payload) => ({
        url: 'for_region_by_date',
        method: 'POST',
        body: payload,
      }),
      providesTags: ['ChartData'],
    }),

    // Chart data - Estate level
    getChartEstateData: builder.query({
      query: (payload) => ({
        url: 'for_estate_by_date',
        method: 'POST',
        body: payload,
      }),
      providesTags: ['ChartData'],
    }),

    // Finance report - Sprayed area
    getFinanceReport: builder.query({
      query: ({ startDate, endDate, estates }) => ({
        url: 'sprayed_area_by_date_range_and_estate',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate, estates },
      }),
      providesTags: ['Reports'],
    }),

    // Finance report 2 - Plantation covered area
    getPlantationCoveredArea: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'plantation_covered_area_by_date',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Reports'],
    }),

    // Pilot performance reports
    getPilotPerformance: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'pilot_performance_plantation',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['PilotPerformance'],
    }),

    // Fields not approved by team lead
    getFieldsNotApprovedByTeamLead: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'plan_field_not_approved_team_lead',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Reports'],
    }),

    // Incomplete subtasks
    getIncompleteSubtasks: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'not_complete_task_list_for_report',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Reports'],
    }),

    // Canceled fields by date range
    getCanceledFieldsByDateRange: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'canceled_fields_by_date_range',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Reports'],
    }),

    // Cancelled fields by team lead with reasons
    getCancelledFieldsByTeamLead: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'canceled_fields_by_date_range_with_cancel_reason',
        method: 'POST',
        body: {
          start_date: startDate,
          end_date: endDate,
          group: 0,
          plantation: 0,
          region: 0,
          estate: 0
        },
      }),
      providesTags: ['Reports'],
    }),

    // Pilot feedbacks
    getPilotFeedbacks: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'display_daily_feedback_by_date_range',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Reports'],
    }),

    // Pilot team spray area
    getPilotTeamSprayArea: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'pilot_team_date_spray_area',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Reports'],
    }),

    // Used chemicals by estates
    getUsedChemicals: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'chemical_used_by_estates',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Reports'],
    }),

    // Update review for flag by review board
    updateReviewByReviewBoard: builder.mutation({
      query: ({ taskId, review }) => ({
        url: 'update_review_for_flag_by_review_board',
        method: 'POST',
        body: { task: taskId, review },
      }),
      invalidatesTags: ['TaskReports'],
    }),

    // Update review for flag by director ops
    updateReviewByDirectorOps: builder.mutation({
      query: ({ taskId, status, review }) => ({
        url: 'update_review_for_flag_dops',
        method: 'POST',
        body: { task: taskId, status, review },
      }),
      invalidatesTags: ['TaskReports'],
    }),
  }),
});

export const {
  useGetTeamLeadReportQuery,
  useGetApprovalCountReportQuery,
  useGetFlightNumbersReportQuery,
  useGetPilotRevenueByDateRangeQuery,
  useGetTaskReviewReportQuery,
  useGetChartAllDataGroupQuery,
  useGetChartGroupDataQuery,
  useGetChartPlantationDataQuery,
  useGetChartRegionDataQuery,
  useGetChartEstateDataQuery,
  useGetFinanceReportQuery,
  useGetPlantationCoveredAreaQuery,
  useGetPilotPerformanceQuery,
  useGetFieldsNotApprovedByTeamLeadQuery,
  useGetIncompleteSubtasksQuery,
  useGetCanceledFieldsByDateRangeQuery,
  useGetCancelledFieldsByTeamLeadQuery,
  useGetPilotFeedbacksQuery,
  useGetPilotTeamSprayAreaQuery,
  useGetUsedChemicalsQuery,
  useUpdateReviewByReviewBoardMutation,
  useUpdateReviewByDirectorOpsMutation,
} = reportsApi;

