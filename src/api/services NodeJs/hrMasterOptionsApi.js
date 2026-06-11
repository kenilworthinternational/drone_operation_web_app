import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const hrMasterOptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHrMasterOptionsGrouped: builder.query({
      queryFn: async ({ include_inactive = false } = {}) => {
        const q = include_inactive ? '?include_inactive=1' : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/hr-master-options/grouped${q}`, method: 'GET' },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || {} };
      },
      providesTags: ['HrMasterOptions'],
    }),

    getHrMasterOptions: builder.query({
      queryFn: async ({ category, include_inactive = true } = {}) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (include_inactive) params.set('include_inactive', '1');
        const q = params.toString() ? `?${params.toString()}` : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/hr-master-options${q}`, method: 'GET' },
          {},
          {},
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['HrMasterOptions'],
    }),

    createHrMasterOption: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/hr-master-options', method: 'POST', body },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['HrMasterOptions'],
    }),

    updateHrMasterOption: builder.mutation({
      queryFn: async ({ id, ...body }) => {
        const result = await nodeBackendBaseQuery(
          { url: `/api/hr-master-options/${id}`, method: 'PUT', body },
          {},
          {},
        );
        return result;
      },
      invalidatesTags: ['HrMasterOptions'],
    }),
  }),
});

export const {
  useGetHrMasterOptionsGroupedQuery,
  useGetHrMasterOptionsQuery,
  useCreateHrMasterOptionMutation,
  useUpdateHrMasterOptionMutation,
} = hrMasterOptionsApi;
