import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { forceLogoutFromApi } from '../../utils/sessionUtils';
import { getNodeBackendUrl, getToken } from './nodeBackendUrl';

export { getNodeBackendUrl, getToken } from './nodeBackendUrl';

const rawNodeBackendBaseQuery = fetchBaseQuery({
  baseUrl: getNodeBackendUrl(),
  fetchFn: (input, init) =>
    fetch(input, {
      ...init,
      cache: 'no-store',
    }),
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const nodeBackendBaseQuery = async (args, api, extraOptions) => {
  const result = await rawNodeBackendBaseQuery(args, api, extraOptions);
  if (result.error) {
    forceLogoutFromApi(api, result.error);
  }
  return result;
};
