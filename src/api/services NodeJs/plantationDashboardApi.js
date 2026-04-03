import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const plantationDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get calendar plans for a specific month
    getCalendarPlans: builder.query({
      queryFn: async ({ yearMonth, missionType }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/calendar-plans',
            method: 'POST',
            body: { yearMonth, missionType },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationCalendarPlans'],
    }),

    // Get upcoming plans (after today)
    getUpcomingPlans: builder.query({
      queryFn: async ({ missionType }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/upcoming-plans',
            method: 'POST',
            body: { missionType },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationUpcomingPlans'],
    }),

    // Get Planned vs Tea Revenue Extent chart data
    getPlannedVsTeaRevenueChart: builder.query({
      queryFn: async ({ missionType, months, startMonth, endMonth }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/chart/planned-vs-tea-revenue',
            method: 'POST',
            body: { missionType, months, startMonth, endMonth },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationCharts'],
    }),

    // Get Tea Revenue vs Sprayed chart data
    getTeaRevenueVsSprayedChart: builder.query({
      queryFn: async ({ missionType, months, startMonth, endMonth, completedPlansOnly = true }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/chart/tea-revenue-vs-sprayed',
            method: 'POST',
            body: { missionType, months, startMonth, endMonth, completedPlansOnly },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationCharts'],
    }),

    // Get completed mission reports
    getCompletedMissionReports: builder.query({
      queryFn: async ({ startDate, endDate, missionType, completedPlansOnly = true }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/completed-mission-reports',
            method: 'POST',
            body: { startDate, endDate, missionType, completedPlansOnly },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationMissionReports'],
    }),

    // Get chart breakdown for drill-down
    getChartBreakdown: builder.query({
      queryFn: async ({
        chartType,
        missionType,
        yearMonth,
        breakdownLevel,
        filterPlantationId,
        filterRegionId,
        completedPlansOnly = true,
      }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/chart/breakdown',
            method: 'POST',
            body: {
              chartType,
              missionType,
              yearMonth,
              breakdownLevel,
              filterPlantationId,
              filterRegionId,
              completedPlansOnly,
            },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationCharts'],
    }),

    // Get spray/spread fields breakdown for an estate (drill-down from estate card)
    getEstateFieldsBreakdown: builder.query({
      queryFn: async ({ estateId, yearMonth, missionType, completedPlansOnly = true }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/chart/breakdown/estate-fields',
            method: 'POST',
            body: { estateId, yearMonth, missionType, completedPlansOnly },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationCharts'],
    }),

    // Get estate-plan accordion breakdown (estate → plan → fields with map)
    getEstatePlanBreakdown: builder.query({
      queryFn: async ({ yearMonth, missionType, chartType, completedPlansOnly = true }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/chart/breakdown/estate-plans',
            method: 'POST',
            body: { yearMonth, missionType, chartType, completedPlansOnly },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationCharts'],
    }),

    // Get dashboard summary (6 metric cards for main page)
    getDashboardSummary: builder.query({
      queryFn: async ({ yearMonth, missionType, completedPlansOnly = true, planCountPickedDate }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/dashboard-summary',
            method: 'POST',
            body: { yearMonth, missionType, completedPlansOnly, ...(planCountPickedDate ? { planCountPickedDate } : {}) },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationDashboardSummary'],
    }),

    // Global chart data (no user hierarchy filter - for corporate DataViewer)
    getGlobalPlannedVsTeaRevenueChart: builder.query({
      queryFn: async ({ missionType, months, startMonth, endMonth, plantationId, regionId, estateId }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/chart/global/planned-vs-tea-revenue',
            method: 'POST',
            body: { missionType, months, startMonth, endMonth, plantationId, regionId, estateId },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationCharts'],
    }),

    getGlobalTeaRevenueVsSprayedChart: builder.query({
      queryFn: async ({ missionType, months, startMonth, endMonth, plantationId, regionId, estateId }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/chart/global/tea-revenue-vs-sprayed',
            method: 'POST',
            body: { missionType, months, startMonth, endMonth, plantationId, regionId, estateId },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationCharts'],
    }),

    getGlobalEstatePlanBreakdown: builder.query({
      queryFn: async ({ yearMonth, missionType, chartType, plantationId, regionId, estateId }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/chart/global/breakdown/estate-plans',
            method: 'POST',
            body: { yearMonth, missionType, chartType, plantationId, regionId, estateId },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationCharts'],
    }),

    // Get one-month export (summary + field-wise) for Excel on Chart Details
    getMonthExport: builder.query({
      queryFn: async ({ yearMonth, missionType, chartType, completedPlansOnly = true }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantation-dashboard/chart/export-month',
            method: 'POST',
            body: { yearMonth, missionType, chartType, completedPlansOnly },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['PlantationCharts'],
    }),

    getPlantationsList: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/plantation-dashboard/plantations', method: 'GET' },
          {},
          {}
        );
        return result;
      },
      keepUnusedDataFor: 300,
    }),

    getEstatesList: builder.query({
      queryFn: async (plantationId) => {
        const url = plantationId
          ? `/api/plantation-dashboard/estates?plantationId=${plantationId}`
          : '/api/plantation-dashboard/estates';
        const result = await nodeBackendBaseQuery(
          { url, method: 'GET' },
          {},
          {}
        );
        return result;
      },
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetCalendarPlansQuery,
  useGetUpcomingPlansQuery,
  useGetPlannedVsTeaRevenueChartQuery,
  useGetTeaRevenueVsSprayedChartQuery,
  useGetCompletedMissionReportsQuery,
  useGetChartBreakdownQuery,
  useGetEstateFieldsBreakdownQuery,
  useGetEstatePlanBreakdownQuery,
  useGetDashboardSummaryQuery,
  useGetMonthExportQuery,
  useLazyGetMonthExportQuery,
  useGetGlobalPlannedVsTeaRevenueChartQuery,
  useGetGlobalTeaRevenueVsSprayedChartQuery,
  useGetGlobalEstatePlanBreakdownQuery,
  useGetPlantationsListQuery,
  useGetEstatesListQuery,
} = plantationDashboardApi;
