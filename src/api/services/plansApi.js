import { baseApi } from '../baseApi';

export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get plans by date
    getPlansByDate: builder.query({
      query: (date) => ({
        url: 'find_plans_by_date',
        method: 'POST',
        body: { date },
      }),
      providesTags: (result, error, date) => [{ type: 'Plans', id: date }],
    }),

    // Get plans by date range
    getPlansByDateRange: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'find_plans_by_date_range',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Plans'],
    }),

    // Get plan by ID
    getPlanById: builder.query({
      query: (planId) => ({
        url: 'find_plan',
        method: 'POST',
        body: { plan: planId },
      }),
      providesTags: (result, error, planId) => [{ type: 'PlanDetails', id: planId }],
    }),

    // Get plan summary
    getPlanSummary: builder.query({
      query: (planId) => ({
        url: 'find_plan_summary',
        method: 'POST',
        body: { plan: planId },
      }),
      providesTags: (result, error, planId) => [{ type: 'PlanDetails', id: `summary-${planId}` }],
    }),

    // Get plan resource allocation
    getPlanResourceAllocation: builder.query({
      query: (planId) => ({
        url: 'get_plan_resource_allocation_details',
        method: 'POST',
        body: { id: planId },
      }),
      providesTags: (result, error, planId) => [{ type: 'PlanDetails', id: `resources-${planId}` }],
    }),

    // Create plan
    createPlan: builder.mutation({
      query: (planData) => ({
        url: 'create_plan',
        method: 'POST',
        body: planData,
      }),
      invalidatesTags: ['Plans', 'Calendar'],
    }),

    // Update plan
    updatePlan: builder.mutation({
      query: (planData) => ({
        url: 'update_plan',
        method: 'POST',
        body: planData,
      }),
      invalidatesTags: (result, error, { plan }) => [
        'Plans',
        { type: 'PlanDetails', id: plan },
        'Calendar'
      ],
    }),

    // Delete plan
    deletePlan: builder.mutation({
      query: (planId) => ({
        url: 'delete_plan',
        method: 'POST',
        body: { plan: planId },
      }),
      invalidatesTags: ['Plans', 'Calendar'],
    }),

    // Deactivate/Change plan status
    changePlanStatus: builder.mutation({
      query: ({ planId, status }) => ({
        url: 'plan_change_status',
        method: 'POST',
        body: { plan: planId, status },
      }),
      invalidatesTags: (result, error, { planId }) => [
        'Plans',
        { type: 'PlanDetails', id: planId }
      ],
    }),

    // Update plan date
    updatePlanDate: builder.mutation({
      query: ({ planId, date }) => ({
        url: 'update_plan_date_by_plan_id',
        method: 'POST',
        body: { id: planId, date },
      }),
      invalidatesTags: (result, error, { planId }) => [
        'Plans',
        { type: 'PlanDetails', id: planId },
        'Calendar'
      ],
    }),

    // Update drone for plan
    updateDroneToPlan: builder.mutation({
      query: ({ planId, droneId }) => ({
        url: 'change_drone_to_plan',
        method: 'POST',
        body: { plan: planId, drone: droneId },
      }),
      invalidatesTags: (result, error, { planId }) => [
        { type: 'PlanDetails', id: planId },
        'Plans'
      ],
    }),

    // Update pilot for plan
    updatePilotToPlan: builder.mutation({
      query: ({ planId, pilotId }) => ({
        url: 'change_pilot_to_plan',
        method: 'POST',
        body: { plan: planId, pilot: pilotId },
      }),
      invalidatesTags: (result, error, { planId }) => [
        { type: 'PlanDetails', id: planId },
        'Plans'
      ],
    }),

    // Get plans for update
    getPlansForUpdate: builder.query({
      query: (data) => ({
        url: 'display_for_update_plan',
        method: 'POST',
        body: data,
      }),
      providesTags: ['Plans'],
    }),

    // Get plans for reschedule
    getPlansForReschedule: builder.query({
      query: (data) => ({
        url: 'display_for_reschedulr_plan',
        method: 'POST',
        body: data,
      }),
      providesTags: ['Plans'],
    }),

    // Get calendar data
    getCalendarData: builder.query({
      query: ({ estateId, cropType, missionType, startDate, endDate, location }) => ({
        url: 'find_plans_by_estate_and_crop_and_mission_type_date_range',
        method: 'POST',
        body: {
          estate: estateId,
          crop_type: cropType,
          mission_type: missionType,
          start_date: startDate,
          end_date: endDate,
        },
      }),
      providesTags: ['Calendar'],
      transformResponse: (response, meta, arg) => {
        // Apply filtering logic based on location
        if (arg.location === "new_plan") {
          const filtered = Object.keys(response)
            .filter((key) => !isNaN(key))
            .reduce((acc, key) => {
              if (response[key].flag !== "ap") {
                acc[key] = response[key];
              }
              return acc;
            }, {});
          filtered.status = response.status;
          filtered.count = Object.keys(filtered).length - 2;
          return filtered;
        }
        return response;
      },
    }),

    // Operations approval
    updateOpsApproval: builder.mutation({
      query: ({ plan, status }) => ({
        url: 'update_d_ops_approval_for_plan',
        method: 'POST',
        body: { plan, status },
      }),
      invalidatesTags: (result, error, { plan }) => [
        { type: 'PlanDetails', id: plan },
        'Plans'
      ],
    }),
  }),
});

export const {
  useGetPlansByDateQuery,
  useGetPlansByDateRangeQuery,
  useGetPlanByIdQuery,
  useGetPlanSummaryQuery,
  useGetPlanResourceAllocationQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useChangePlanStatusMutation,
  useUpdatePlanDateMutation,
  useUpdateDroneToPlanMutation,
  useUpdatePilotToPlanMutation,
  useGetPlansForUpdateQuery,
  useGetPlansForRescheduleQuery,
  useGetCalendarDataQuery,
  useUpdateOpsApprovalMutation,
} = plansApi;

