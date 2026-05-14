import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const timeOfDaysApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTimeOfDays: builder.query({
      queryFn: async ({ include_inactive = true } = {}) => {
        const q = include_inactive ? '?include_inactive=1' : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/time-of-days${q}`, method: 'GET' },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['TimeOfDays'],
    }),

    createTimeOfDay: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/time-of-days', method: 'POST', body },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['TimeOfDays'],
    }),

    updateTimeOfDay: builder.mutation({
      queryFn: async ({ id, ...body }) => {
        const result = await nodeBackendBaseQuery(
          { url: `/api/time-of-days/${id}`, method: 'PUT', body },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['TimeOfDays'],
    }),
  }),
});

export const {
  useGetTimeOfDaysQuery,
  useCreateTimeOfDayMutation,
  useUpdateTimeOfDayMutation,
} = timeOfDaysApi;
