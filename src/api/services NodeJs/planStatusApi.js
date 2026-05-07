import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const planStatusApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlanStatusByDate: builder.query({
      queryFn: async ({ date }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plan-status/by-date',
            method: 'POST',
            body: { date },
          },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['Plans'],
    }),
    updatePlanStatusNode: builder.mutation({
      queryFn: async ({ plan_id, activated, deactivate_reason_id = null }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plan-status/update',
            method: 'POST',
            body: { plan_id, activated, deactivate_reason_id },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Plans'],
    }),
  }),
});

export const {
  useLazyGetPlanStatusByDateQuery,
  useUpdatePlanStatusNodeMutation,
} = planStatusApi;

