import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

const postQuery = async (url, body = {}) => nodeBackendBaseQuery(
  {
    url,
    method: 'POST',
    body,
  },
  {},
  {}
);

export const centralProcurementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockWings: builder.query({
      queryFn: async () => {
        const result = await postQuery('/api/stock-assets/wings', {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),
    getStockSectors: builder.query({
      queryFn: async () => {
        const result = await postQuery('/api/stock-assets/sectors', {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),

    // Central stores
    getCentralStoreRequests: builder.query({
      queryFn: async (filters = {}) => {
        const result = await postQuery('/api/stock-assets/central-stores/requests', filters);
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),
    getCentralStoreRequestQueue: builder.query({
      queryFn: async (filters = {}) => {
        const result = await postQuery('/api/stock-assets/central-stores/request-queue', filters);
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),
    getCentralStoreRequest: builder.query({
      queryFn: async (id) => {
        const result = await postQuery('/api/stock-assets/central-stores/requests/view', { id });
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
    }),
    createCentralStoreRequest: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/central-stores/requests/create', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
    issueCentralStoreItems: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/central-stores/requests/issue', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
    sendRequestToNeedToProcure: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/central-stores/requests/send-to-procure', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
    getNeedToProcureQueue: builder.query({
      queryFn: async (filters = {}) => {
        const result = await postQuery('/api/stock-assets/central-stores/need-to-procure', filters);
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),

    // Procurement
    getProcurementRequests: builder.query({
      queryFn: async (filters = {}) => {
        const result = await postQuery('/api/stock-assets/procurement/requests', filters);
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),
    getProcurementRequest: builder.query({
      queryFn: async (id) => {
        const result = await postQuery('/api/stock-assets/procurement/requests/view', { id });
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
    }),
    createProcurementRequest: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/procurement/requests/create', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
    updateProcurementRequestStatus: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/procurement/requests/update-status', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
    getApprovedProcureQueue: builder.query({
      queryFn: async (filters = {}) => {
        const result = await postQuery('/api/stock-assets/procurement/approved-queue', filters);
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),

    // RFQ and quotations
    getRfqs: builder.query({
      queryFn: async (filters = {}) => {
        const result = await postQuery('/api/stock-assets/procurement/rfqs', filters);
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),
    createRfq: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/procurement/rfqs/create', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
    getPendingQuotationsQueue: builder.query({
      queryFn: async (filters = {}) => {
        const result = await postQuery('/api/stock-assets/procurement/pending-quotations', filters);
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),
    getSupplierQuotations: builder.query({
      queryFn: async (filters = {}) => {
        const result = await postQuery('/api/stock-assets/procurement/quotations', filters);
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),
    createSupplierQuotation: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/procurement/quotations/create', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
    saveQuotationEvaluation: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/procurement/quotations/evaluate', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
    saveTechnicalEvaluation: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/procurement/quotations/technical-evaluate', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
    finalizeQuotation: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/procurement/quotations/finalize', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),

    // PO + GRN
    getPurchaseOrders: builder.query({
      queryFn: async (filters = {}) => {
        const result = await postQuery('/api/stock-assets/procurement/purchase-orders', filters);
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),
    getPurchaseOrder: builder.query({
      queryFn: async (id) => {
        const result = await postQuery('/api/stock-assets/procurement/purchase-orders/view', { id });
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
    }),
    createPurchaseOrder: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/procurement/purchase-orders/create', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
    getGrns: builder.query({
      queryFn: async (filters = {}) => {
        const result = await postQuery('/api/stock-assets/procurement/grns', filters);
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
    }),
    getGrn: builder.query({
      queryFn: async (id) => {
        const result = await postQuery('/api/stock-assets/procurement/grns/view', { id });
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
    }),
    createGrn: builder.mutation({
      queryFn: async (payload) => {
        const result = await postQuery('/api/stock-assets/procurement/grns/create', payload);
        return result.error ? { error: result.error } : { data: result.data?.data || null };
      },
    }),
  }),
});

export const {
  useGetStockWingsQuery,
  useGetStockSectorsQuery,
  useGetCentralStoreRequestsQuery,
  useGetCentralStoreRequestQueueQuery,
  useGetCentralStoreRequestQuery,
  useCreateCentralStoreRequestMutation,
  useIssueCentralStoreItemsMutation,
  useSendRequestToNeedToProcureMutation,
  useGetNeedToProcureQueueQuery,
  useGetProcurementRequestsQuery,
  useGetProcurementRequestQuery,
  useCreateProcurementRequestMutation,
  useUpdateProcurementRequestStatusMutation,
  useGetApprovedProcureQueueQuery,
  useGetRfqsQuery,
  useCreateRfqMutation,
  useGetPendingQuotationsQueueQuery,
  useGetSupplierQuotationsQuery,
  useCreateSupplierQuotationMutation,
  useSaveQuotationEvaluationMutation,
  useSaveTechnicalEvaluationMutation,
  useFinalizeQuotationMutation,
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useGetGrnsQuery,
  useGetGrnQuery,
  useCreateGrnMutation,
} = centralProcurementApi;
