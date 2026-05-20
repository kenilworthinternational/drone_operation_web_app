import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

function extractRows(body) {
  if (Array.isArray(body)) return body;
  if (body?.data && Array.isArray(body.data)) return body.data;
  return [];
}

export const planActivateRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlanActivatePendingCount: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/plan-activate-requests/pending-count', method: 'GET' },
          {},
          {}
        );
        if (result.error) return result;
        return { data: { count: Number(result.data?.data?.count ?? 0) } };
      },
      providesTags: ['PlanActivateRequests'],
    }),

    getPlanActivateRequestsList: builder.query({
      queryFn: async ({ status = 'p' } = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/plan-activate-requests?status=${encodeURIComponent(status)}`,
            method: 'GET',
          },
          {},
          {}
        );
        if (result.error) return result;
        return { data: extractRows(result.data) };
      },
      providesTags: ['PlanActivateRequests'],
    }),

    getPlanActivateStatusByPlans: builder.query({
      queryFn: async ({ planIds = [] } = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plan-activate-requests/status-by-plans',
            method: 'POST',
            body: { plan_ids: planIds },
          },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || {} };
      },
      providesTags: ['PlanActivateRequests'],
    }),

    submitPlanActivateRequest: builder.mutation({
      queryFn: async ({ planId, requestMessage }) => {
        return nodeBackendBaseQuery(
          {
            url: '/api/plan-activate-requests/submit',
            method: 'POST',
            body: {
              plan_id: planId,
              request_message: requestMessage || '',
            },
          },
          {},
          {}
        );
      },
      invalidatesTags: ['PlanActivateRequests', 'Plans'],
    }),

    approvePlanActivateRequest: builder.mutation({
      queryFn: async ({ id, reviewNote }) => {
        return nodeBackendBaseQuery(
          {
            url: `/api/plan-activate-requests/${id}/approve`,
            method: 'POST',
            body: { reviewNote: reviewNote || '' },
          },
          {},
          {}
        );
      },
      invalidatesTags: ['PlanActivateRequests', 'Plans'],
    }),

    declinePlanActivateRequest: builder.mutation({
      queryFn: async ({ id, reviewNote }) => {
        return nodeBackendBaseQuery(
          {
            url: `/api/plan-activate-requests/${id}/decline`,
            method: 'POST',
            body: { reviewNote: reviewNote || '' },
          },
          {},
          {}
        );
      },
      invalidatesTags: ['PlanActivateRequests', 'Plans'],
    }),
  }),
});

export const {
  useGetPlanActivatePendingCountQuery,
  useGetPlanActivateRequestsListQuery,
  useLazyGetPlanActivateStatusByPlansQuery,
  useSubmitPlanActivateRequestMutation,
  useApprovePlanActivateRequestMutation,
  useDeclinePlanActivateRequestMutation,
} = planActivateRequestsApi;
