import { baseApi } from '../baseApi';

export const summaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Summary by group
    getSummaryByGroup: builder.query({
      query: ({ groupId, startDate, endDate }) => ({
        url: 'get_plan_resource_allocation_details_by_group_and_date_range',
        method: 'POST',
        body: { group: groupId, start_date: startDate, end_date: endDate },
      }),
      providesTags: (result, error, { groupId }) => [{ type: 'Plans', id: `group-${groupId}` }],
    }),

    // Summary by plantation
    getSummaryByPlantation: builder.query({
      query: ({ plantationId, startDate, endDate }) => ({
        url: 'get_plan_resource_allocation_details_by_plantation_and_date_range',
        method: 'POST',
        body: { plantation: plantationId, start_date: startDate, end_date: endDate },
      }),
      providesTags: (result, error, { plantationId }) => [{ type: 'Plans', id: `plantation-${plantationId}` }],
    }),

    // Summary by region
    getSummaryByRegion: builder.query({
      query: ({ regionId, startDate, endDate }) => ({
        url: 'get_plan_resource_allocation_details_by_region_and_date_range',
        method: 'POST',
        body: { region: regionId, start_date: startDate, end_date: endDate },
      }),
      providesTags: (result, error, { regionId }) => [{ type: 'Plans', id: `region-${regionId}` }],
    }),

    // Summary by estate
    getSummaryByEstate: builder.query({
      query: ({ estateId, startDate, endDate }) => ({
        url: 'get_plan_resource_allocation_details_by_estate_and_date_range',
        method: 'POST',
        body: { estate: estateId, start_date: startDate, end_date: endDate },
      }),
      providesTags: (result, error, { estateId }) => [{ type: 'Plans', id: `estate-${estateId}` }],
    }),

    // Get all plans summary
    getAllPlansSummary: builder.query({
      query: () => ({
        url: 'find_plan_by_all',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Plans'],
    }),

    // Get all plans by date range
    getAllPlansByDateRange: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'find_plan_by_all_date_range',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Plans'],
    }),

    // Get plans by group
    getPlansByGroup: builder.query({
      query: (groupId) => ({
        url: 'find_plan_by_group',
        method: 'POST',
        body: { group: groupId },
      }),
      providesTags: (result, error, groupId) => [{ type: 'Plans', id: `group-all-${groupId}` }],
    }),

    // Get plans by group and date range
    getPlansByGroupDateRange: builder.query({
      query: ({ groupId, startDate, endDate }) => ({
        url: 'find_plan_by_group_date_range',
        method: 'POST',
        body: { group: groupId, start_date: startDate, end_date: endDate },
      }),
      providesTags: (result, error, { groupId }) => [{ type: 'Plans', id: `group-range-${groupId}` }],
    }),

    // Get plans by plantation
    getPlansByPlantation: builder.query({
      query: (plantationId) => ({
        url: 'find_plan_by_plantation',
        method: 'POST',
        body: { plantation: plantationId },
      }),
      providesTags: (result, error, plantationId) => [{ type: 'Plans', id: `plantation-all-${plantationId}` }],
    }),

    // Get plans by plantation and date range
    getPlansByPlantationDateRange: builder.query({
      query: ({ plantationId, startDate, endDate }) => ({
        url: 'find_plan_by_plantation_date_range',
        method: 'POST',
        body: { plantation: plantationId, start_date: startDate, end_date: endDate },
      }),
      providesTags: (result, error, { plantationId }) => [{ type: 'Plans', id: `plantation-range-${plantationId}` }],
    }),

    // Get plans by region
    getPlansByRegion: builder.query({
      query: (regionId) => ({
        url: 'find_plan_by_region',
        method: 'POST',
        body: { region: regionId },
      }),
      providesTags: (result, error, regionId) => [{ type: 'Plans', id: `region-all-${regionId}` }],
    }),

    // Get plans by region and date range
    getPlansByRegionDateRange: builder.query({
      query: ({ regionId, startDate, endDate }) => ({
        url: 'find_plan_by_region_date_range',
        method: 'POST',
        body: { region: regionId, start_date: startDate, end_date: endDate },
      }),
      providesTags: (result, error, { regionId }) => [{ type: 'Plans', id: `region-range-${regionId}` }],
    }),

    // Get plans by estate
    getPlansByEstate: builder.query({
      query: (estateId) => ({
        url: 'find_plan_by_estate',
        method: 'POST',
        body: { estate: estateId },
      }),
      providesTags: (result, error, estateId) => [{ type: 'Plans', id: `estate-all-${estateId}` }],
    }),

    // Get plans by estate and date range with field
    getPlansByEstateDateRangeWithField: builder.query({
      query: ({ estateId, startDate, endDate }) => ({
        url: 'find_plan_by_estate_date_range_with_field',
        method: 'POST',
        body: { estate: estateId, start_date: startDate, end_date: endDate },
      }),
      providesTags: (result, error, { estateId }) => [{ type: 'Plans', id: `estate-range-${estateId}` }],
    }),

    // Submit resource allocation
    submitResourceAllocation: builder.mutation({
      query: (data) => ({
        url: 'plan_resource_allocations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, data) => [
        { type: 'PlanDetails', id: `resources-${data.plan}` },
        'Plans'
      ],
    }),

    // Submit mission resource allocation (non-plantation)
    submitMissionResourceAllocation: builder.mutation({
      query: (data) => ({
        url: 'mission_resource_allocations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Missions'],
    }),
  }),
});

export const {
  useGetSummaryByGroupQuery,
  useGetSummaryByPlantationQuery,
  useGetSummaryByRegionQuery,
  useGetSummaryByEstateQuery,
  useGetAllPlansSummaryQuery,
  useGetAllPlansByDateRangeQuery,
  useGetPlansByGroupQuery,
  useGetPlansByGroupDateRangeQuery,
  useGetPlansByPlantationQuery,
  useGetPlansByPlantationDateRangeQuery,
  useGetPlansByRegionQuery,
  useGetPlansByRegionDateRangeQuery,
  useGetPlansByEstateQuery,
  useGetPlansByEstateDateRangeWithFieldQuery,
  useSubmitResourceAllocationMutation,
  useSubmitMissionResourceAllocationMutation,
} = summaryApi;

