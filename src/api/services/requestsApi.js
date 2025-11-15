import { baseApi } from '../baseApi';

export const requestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get pending reschedule requests
    getPendingRescheduleRequests: builder.query({
      query: () => ({
        url: 'find_all_pending_request_reschedule',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Plans'],
    }),

    // Get all ad-hoc plan requests (pending)
    getPendingAdHocRequests: builder.query({
      query: () => ({
        url: 'display_adhoc_plan_request_by_manager_app_pending',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Plans'],
    }),

    // Get ad-hoc plan requests by date range
    getAdHocRequestsByDateRange: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'display_adhoc_plan_request_by_manager_app',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Plans'],
    }),

    // Get pending reschedule requests by manager
    getPendingRescheduleRequestsByManager: builder.query({
      query: () => ({
        url: 'display_reschedule_date_for_plan_by_manager_pending',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Plans'],
    }),

    // Get all reschedule requests by manager
    getAllRescheduleRequestsByManager: builder.query({
      query: () => ({
        url: 'display_reschedule_date_for_plan_by_manager',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Plans'],
    }),

    // Get pending non-plantation missions
    getPendingNonPlantationMissions: builder.query({
      query: () => ({
        url: 'search_pending_mission',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Missions'],
    }),

    // Update ad-hoc plan request
    updateAdHocRequest: builder.mutation({
      query: ({ requestId, datePlanned, status }) => ({
        url: 'update_status_adhoc_plan_request_by_manager_app',
        method: 'POST',
        body: {
          request_id: requestId,
          date_planed: datePlanned,
          status
        },
      }),
      invalidatesTags: ['Plans', 'Calendar'],
    }),

    // Update reschedule request
    updateRescheduleRequest: builder.mutation({
      query: ({ requestId, datePlanned, status }) => ({
        url: 'update_reschedule_date_status_for_plan_by_manager',
        method: 'POST',
        body: {
          request_id: requestId,
          date: datePlanned,
          status
        },
      }),
      invalidatesTags: ['Plans', 'Calendar'],
    }),

    // Submit rescheduled plan
    submitRescheduledPlan: builder.mutation({
      query: (planData) => ({
        url: 'create_plan',
        method: 'POST',
        body: planData,
      }),
      invalidatesTags: ['Plans', 'Calendar'],
    }),

    // Submit manager reschedule request
    submitManagerRescheduleRequest: builder.mutation({
      query: (planData) => ({
        url: 'create_plan',
        method: 'POST',
        body: planData,
      }),
      invalidatesTags: ['Plans', 'Calendar'],
    }),

    // Change manager status for request
    changeManagerRequestStatus: builder.mutation({
      query: (data) => ({
        url: 'update_request_reschedule_date_by_manager',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Plans'],
    }),
  }),
});

export const {
  useGetPendingRescheduleRequestsQuery,
  useGetPendingAdHocRequestsQuery,
  useGetAdHocRequestsByDateRangeQuery,
  useGetPendingRescheduleRequestsByManagerQuery,
  useGetAllRescheduleRequestsByManagerQuery,
  useGetPendingNonPlantationMissionsQuery,
  useUpdateAdHocRequestMutation,
  useUpdateRescheduleRequestMutation,
  useSubmitRescheduledPlanMutation,
  useSubmitManagerRescheduleRequestMutation,
  useChangeManagerRequestStatusMutation,
} = requestsApi;

