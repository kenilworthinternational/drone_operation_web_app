import { baseApi } from '../baseApi';

export const groupAssignmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get current group assigned missions by date
    getCurrentGroupAssignedMissions: builder.query({
      query: (dateData) => ({
        url: 'display_groups_by_day',
        method: 'POST',
        body: dateData,
      }),
      providesTags: ['Plans'],
    }),

    // Create group assigned missions (non-plantation)
    createGroupAssignedMissions: builder.mutation({
      query: (data) => ({
        url: 'create_group_assigned_missions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Plans'],
    }),

    // Update group assigned missions
    updateGroupAssignedMissions: builder.mutation({
      query: (data) => ({
        url: 'update_group_assigned_to_missions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Plans'],
    }),

    // Remove group from missions
    removeGroupFromMissions: builder.mutation({
      query: (data) => ({
        url: 'remove_group_from_missions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Plans'],
    }),
  }),
});

export const {
  useGetCurrentGroupAssignedMissionsQuery,
  useCreateGroupAssignedMissionsMutation,
  useUpdateGroupAssignedMissionsMutation,
  useRemoveGroupFromMissionsMutation,
} = groupAssignmentsApi;

