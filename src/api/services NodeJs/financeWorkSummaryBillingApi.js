import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

const base = '/api/finance-work-summary';

async function nodePost(url, body = {}) {
  return nodeBackendBaseQuery({ url, method: 'POST', body }, {}, {});
}

async function nodeGet(url) {
  return nodeBackendBaseQuery({ url, method: 'GET' }, {}, {});
}

export const financeWorkSummaryBillingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkSummaryBillingDraft: builder.query({
      queryFn: async (body) => {
        const result = await nodePost(`${base}/draft`, body);
        if (result.error) return result;
        return { data: result.data?.data || result.data };
      },
      providesTags: ['FinanceWorkSummary'],
    }),

    saveWorkSummaryBillingDraft: builder.mutation({
      queryFn: async (body) => {
        const result = await nodePost(`${base}/draft/save`, body);
        if (result.error) return result;
        return { data: result.data?.data || result.data };
      },
      invalidatesTags: ['FinanceWorkSummary'],
    }),

    createWorkSummaryPdfDocument: builder.mutation({
      queryFn: async (body) => {
        const result = await nodePost(`${base}/documents/pdf`, body);
        if (result.error) return result;
        return { data: result.data?.data || result.data };
      },
      invalidatesTags: ['FinanceWorkSummary'],
    }),

    listWorkSummaryDocuments: builder.query({
      queryFn: async ({ plantation_id, doc_type, limit } = {}) => {
        const qs = new URLSearchParams();
        if (plantation_id) qs.set('plantation_id', plantation_id);
        if (doc_type) qs.set('doc_type', doc_type);
        if (limit) qs.set('limit', limit);
        const result = await nodeGet(`${base}/documents/history?${qs.toString()}`);
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['FinanceWorkSummary'],
    }),

    getWorkSummaryDocument: builder.query({
      queryFn: async (documentId) => {
        const result = await nodeGet(`${base}/documents/${documentId}`);
        if (result.error) return result;
        return { data: result.data?.data || result.data };
      },
    }),
  }),
});

export const {
  useLazyGetWorkSummaryBillingDraftQuery,
  useSaveWorkSummaryBillingDraftMutation,
  useCreateWorkSummaryPdfDocumentMutation,
  useListWorkSummaryDocumentsQuery,
  useLazyGetWorkSummaryDocumentQuery,
} = financeWorkSummaryBillingApi;
