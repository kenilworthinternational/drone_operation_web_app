import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const plantationInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoiceOrganizations: builder.query({
      queryFn: async ({ includeInactive } = {}) => {
        const qs = includeInactive ? '?include_inactive=1' : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/plantation-invoices/organizations${qs}`, method: 'GET' },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['PlantationInvoices'],
    }),
    saveInvoiceOrganization: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/plantation-invoices/organizations/save', method: 'POST', body },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['PlantationInvoices'],
    }),
    getInvoiceTaxTypes: builder.query({
      queryFn: async ({ includeInactive } = {}) => {
        const qs = includeInactive ? '?include_inactive=1' : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/plantation-invoices/tax-types${qs}`, method: 'GET' },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['PlantationInvoices'],
    }),
    saveInvoiceTaxType: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/plantation-invoices/tax-types/save', method: 'POST', body },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['PlantationInvoices'],
    }),
    getInvoiceMonthlyFuelPrice: builder.query({
      queryFn: async ({ billing_month, period_end } = {}) => {
        const qs = new URLSearchParams();
        if (billing_month) qs.set('billing_month', String(billing_month));
        if (period_end) qs.set('period_end', String(period_end));
        const suffix = qs.toString() ? `?${qs.toString()}` : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/plantation-invoices/fuel-price${suffix}`, method: 'GET' },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
    }),
    saveInvoiceMonthlyFuelPrice: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/plantation-invoices/fuel-price/save', method: 'POST', body },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
    }),
    getPlantationInvoiceDraft: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/plantation-invoices/draft', method: 'POST', body },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
    }),
    createPlantationInvoice: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/plantation-invoices', method: 'POST', body },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['PlantationInvoices'],
    }),
    listPlantationInvoices: builder.query({
      queryFn: async ({ plantation_id, limit } = {}) => {
        const qs = new URLSearchParams();
        if (plantation_id) qs.set('plantation_id', String(plantation_id));
        if (limit) qs.set('limit', String(limit));
        const suffix = qs.toString() ? `?${qs.toString()}` : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/plantation-invoices${suffix}`, method: 'GET' },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['PlantationInvoices'],
    }),
    getPlantationInvoiceById: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          { url: `/api/plantation-invoices/${id}`, method: 'GET' },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || null };
      },
      providesTags: ['PlantationInvoices'],
    }),
  }),
});

export const {
  useGetInvoiceOrganizationsQuery,
  useSaveInvoiceOrganizationMutation,
  useGetInvoiceTaxTypesQuery,
  useSaveInvoiceTaxTypeMutation,
  useLazyGetInvoiceMonthlyFuelPriceQuery,
  useSaveInvoiceMonthlyFuelPriceMutation,
  useGetPlantationInvoiceDraftMutation,
  useCreatePlantationInvoiceMutation,
  useListPlantationInvoicesQuery,
  useLazyGetPlantationInvoiceByIdQuery,
} = plantationInvoiceApi;
