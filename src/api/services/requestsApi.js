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

    // Get pending reschedule requests by manager
    getPendingRescheduleRequestsByManager: builder.query({
      query: () => ({
        url: 'display_reschedule_date_for_plan_by_manager_pending',
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
  }),
});

export const {
  useGetPendingRescheduleRequestsQuery,
  useGetPendingAdHocRequestsQuery,
  useGetPendingRescheduleRequestsByManagerQuery,
  useGetPendingNonPlantationMissionsQuery,
} = requestsApi;
