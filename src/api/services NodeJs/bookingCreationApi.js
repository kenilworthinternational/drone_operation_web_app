import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

const base = '/api/booking-creation';

async function nodePost(url, body = {}) {
  return nodeBackendBaseQuery({ url, method: 'POST', body }, {}, {});
}

function mapCalendarTasks(response) {
  if (response?.status !== 'true') return [];
  return Object.keys(response)
    .filter((key) => !Number.isNaN(Number(key)))
    .map((key) => response[key])
    .map((task) => ({
      id: task.id,
      date: task.date,
      estate: task.estate,
      estate_id: task.estate_id,
      area: parseFloat(task.area) || 0,
      flag: task.flag,
      mission_id: task.mission_id,
      completed: task.completed,
      team_assigned: task.team_assigned,
      activated: task.activated,
      manager_approval: task.manager_approval,
      pilots_assigned: task.pilots_assigned,
      can_delete: task.can_delete,
      delete_block_reason: task.delete_block_reason,
    }));
}

export const bookingCreationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookingCreationEstates: builder.query({
      queryFn: async () => {
        const result = await nodePost(`${base}/estates/all`);
        if (result.error) return result;
        return { data: result.data || [] };
      },
      providesTags: ['Estates'],
    }),

    getBookingCreationGroups: builder.query({
      queryFn: async () => {
        const result = await nodePost(`${base}/lookups/groups`);
        if (result.error) return result;
        return { data: result.data || [] };
      },
      providesTags: ['Groups'],
    }),

    getBookingCreationMissionTypes: builder.query({
      queryFn: async () => {
        const result = await nodePost(`${base}/lookups/mission-types`);
        if (result.error) return result;
        return { data: result.data || [] };
      },
      providesTags: ['MissionTypes'],
    }),

    getBookingCreationCropTypes: builder.query({
      queryFn: async () => {
        const result = await nodePost(`${base}/lookups/crop-types`);
        if (result.error) return result;
        return { data: result.data || [] };
      },
      providesTags: ['Crops'],
    }),

    getBookingCreationDivisionsByEstate: builder.query({
      queryFn: async (estateId) => {
        const result = await nodePost(`${base}/estates/${estateId}/divisions-fields`, {
          estate: estateId,
        });
        if (result.error) return result;
        return { data: result.data || {} };
      },
      providesTags: (result, error, estateId) => [{ type: 'Divisions', id: estateId }],
    }),

    getBookingCreationPlansByDate: builder.query({
      queryFn: async (date) => {
        const result = await nodePost(`${base}/plans/by-date`, { date });
        return result;
      },
      providesTags: (result, error, date) => [{ type: 'Plans', id: date }],
    }),

    getBookingCreationPlansByDateRange: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await nodePost(`${base}/plans/by-date-range`, {
          start_date: startDate,
          end_date: endDate,
        });
        return result;
      },
      providesTags: ['Plans'],
    }),

    getBookingCreationAllPlansByDateRange: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await nodePost(`${base}/plans/by-date-range/all`, {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: mapCalendarTasks(result.data) };
      },
      providesTags: ['Calendar'],
    }),

    createBookingPlan: builder.mutation({
      queryFn: async (planData) => {
        const result = await nodePost(`${base}/plans`, planData);
        return result;
      },
      // Calendar list is refreshed explicitly with preferCacheValue: false after batch creates
      invalidatesTags: ['Plans'],
    }),

    deleteBookingPlan: builder.mutation({
      queryFn: async (planId) => {
        const result = await nodePost(`${base}/plans/delete`, { plan: planId });
        return result;
      },
      invalidatesTags: ['Plans', 'Calendar'],
    }),

    deactivateBookingPlan: builder.mutation({
      queryFn: async ({ plan_id, deactivate_reason_id }) => {
        const result = await nodePost(`${base}/plans/deactivate`, {
          plan_id,
          deactivate_reason_id,
        });
        return result;
      },
      invalidatesTags: ['Plans', 'Calendar'],
    }),
  }),
});

export const {
  useGetBookingCreationEstatesQuery,
  useLazyGetBookingCreationEstatesQuery,
  useGetBookingCreationGroupsQuery,
  useGetBookingCreationMissionTypesQuery,
  useGetBookingCreationCropTypesQuery,
  useGetBookingCreationDivisionsByEstateQuery,
  useLazyGetBookingCreationDivisionsByEstateQuery,
  useLazyGetBookingCreationPlansByDateQuery,
  useLazyGetBookingCreationPlansByDateRangeQuery,
  useLazyGetBookingCreationAllPlansByDateRangeQuery,
  useCreateBookingPlanMutation,
  useDeleteBookingPlanMutation,
  useDeactivateBookingPlanMutation,
} = bookingCreationApi;
