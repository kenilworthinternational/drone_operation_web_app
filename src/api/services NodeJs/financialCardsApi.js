import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const financialCardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users
    getUsers: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/users',
              method: 'POST',
              body: {},
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const users = result.data?.data || result.data || [];
          return { data: users };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FinancialCards'],
    }),

    // Get all banks
    getBanks: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/banks',
              method: 'POST',
              body: {},
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const banks = result.data?.data || result.data || [];
          return { data: banks };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FinancialCards'],
    }),

    // Get all finance categories
    getFinanceCategories: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/categories',
              method: 'POST',
              body: {},
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const categories = result.data?.data || result.data || [];
          return { data: categories };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FinancialCards'],
    }),

    // Get all cards
    getCards: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/cards/get-all',
              method: 'POST',
              body: {},
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const cards = result.data?.data || result.data || [];
          return { data: cards };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FinancialCards'],
    }),

    // Get card by ID
    getCardById: builder.query({
      queryFn: async (id) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/cards/get-by-id',
              method: 'POST',
              body: { id },
            },
            {},
            {}
          );
          return result;
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FinancialCards'],
    }),

    // Create card
    createCard: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/financial-cards/cards/create',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['FinancialCards'],
    }),

    // Update card
    updateCard: builder.mutation({
      queryFn: async ({ id, ...data }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/financial-cards/cards/${id}`,
            method: 'PUT',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['FinancialCards'],
    }),

    // Delete/Deactivate card
    deleteCard: builder.mutation({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/financial-cards/cards/${id}`,
            method: 'DELETE',
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['FinancialCards'],
    }),

    // Get card transactions
    getCardTransactions: builder.query({
      queryFn: async (cardId) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/cards/transactions',
              method: 'POST',
              body: { card: cardId },
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const transactions = result.data?.data || result.data || [];
          return { data: transactions };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FinancialCardTransactions'],
    }),

    // Get all transactions
    getTransactions: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/transactions/get',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const transactions = result.data?.data || result.data || [];
          return { data: transactions };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FinancialCardTransactions'],
    }),

    // Create transaction
    createTransaction: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/financial-cards/transactions',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['FinancialCardTransactions', 'FinancialCards'],
    }),

    // Verify security code and get decrypted card
    verifySecurityCodeAndGetCard: builder.mutation({
      queryFn: async (data) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/cards/verify-security',
              method: 'POST',
              body: data,
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          return { data: result.data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['FinancialCards'],
    }),

    // Get transactions for approval
    getTransactionsForApproval: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/transactions/for-approval',
              method: 'POST',
              body: {},
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const transactions = result.data?.data || result.data || [];
          return { data: transactions };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FinancialCards', 'Transactions'],
    }),

    // Approve or reject transaction
    approveTransaction: builder.mutation({
      queryFn: async (body) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/transactions/approve',
              method: 'POST',
              body,
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          return { data: result.data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['FinancialCards', 'Transactions'],
    }),

    // Get pending settlements
    getPendingSettlements: builder.query({
      queryFn: async (body = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/transactions/pending-settlements',
              method: 'POST',
              body,
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const settlements = result.data?.data || result.data || [];
          return { data: settlements };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['FinancialCards', 'Transactions'],
    }),

    // Settle transactions
    settleTransaction: builder.mutation({
      queryFn: async (body) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/financial-cards/transactions/settle',
              method: 'POST',
              body,
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          return { data: result.data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['FinancialCards', 'Transactions'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetBanksQuery,
  useGetFinanceCategoriesQuery,
  useGetCardsQuery,
  useGetCardByIdQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useGetCardTransactionsQuery,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useVerifySecurityCodeAndGetCardMutation,
  useGetTransactionsForApprovalQuery,
  useApproveTransactionMutation,
  useGetPendingSettlementsQuery,
  useSettleTransactionMutation,
} = financialCardsApi;

