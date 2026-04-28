import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const fuelApprovalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPendingFuelApprovals: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/fuel-approvals/pending', method: 'GET' },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          const rows = result.data?.data || result.data || [];
          return { data: rows };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FuelApprovals'],
    }),

    getFuelApprovalsHistory: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/fuel-approvals/history', method: 'GET' },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          const rows = result.data?.data || result.data || [];
          return { data: rows };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FuelApprovals'],
    }),

    decideFuelApproval: builder.mutation({
      queryFn: async (body) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/fuel-approvals/decide', method: 'POST', body },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['FuelApprovals', 'FinancialCards', 'FinancialCardTransactions'],
    }),
  }),
});

export const {
  useGetPendingFuelApprovalsQuery,
  useGetFuelApprovalsHistoryQuery,
  useDecideFuelApprovalMutation,
} = fuelApprovalsApi;
