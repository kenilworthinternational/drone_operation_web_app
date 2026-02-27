import { baseApi } from '../baseApi';
import { getNodeBackendUrl } from './nodeBackendConfig';

export const publicRegistrationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegistrationOptions: builder.query({
      queryFn: async () => {
        try {
          const baseUrl = getNodeBackendUrl();
          const response = await fetch(`${baseUrl}/api/public/registration-options`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await response.json();
          if (!response.ok || !data.status) {
            return { error: { status: response.status, data: data.message || 'Failed to fetch options' } };
          }
          return { data: data.data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),
  }),
});

export const { useGetRegistrationOptionsQuery } = publicRegistrationApi;
