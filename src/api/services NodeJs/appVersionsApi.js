import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const appVersionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all app versions
    getAppVersions: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/app-versions/list', method: 'POST', body: {} },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['AppVersions'],
    }),

    // Create app version
    createAppVersion: builder.mutation({
      queryFn: async (data) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/app-versions/create', method: 'POST', body: data },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || null };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['AppVersions'],
    }),

    // Update app version
    updateAppVersion: builder.mutation({
      queryFn: async (data) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/app-versions/update', method: 'POST', body: data },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || null };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['AppVersions'],
    }),

    // Delete app version
    deleteAppVersion: builder.mutation({
      queryFn: async (id) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: '/api/app-versions/delete', method: 'POST', body: { id } },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: { success: true } };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['AppVersions'],
    }),
  }),
});

export const {
  useGetAppVersionsQuery,
  useCreateAppVersionMutation,
  useUpdateAppVersionMutation,
  useDeleteAppVersionMutation,
} = appVersionsApi;
