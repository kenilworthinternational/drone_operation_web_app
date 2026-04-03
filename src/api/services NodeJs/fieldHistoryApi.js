import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const fieldHistoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFieldHistoryEstates: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/field-history/estates', method: 'GET' },
          {},
          {}
        );
        return result;
      },
      providesTags: ['FieldHistoryEstates'],
    }),

    getFieldHistoryFieldsByEstate: builder.query({
      queryFn: async (estateId) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/field-history/fields-by-estate',
            method: 'POST',
            body: { estateId },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, estateId) => [{ type: 'FieldHistoryFields', id: estateId }],
    }),

    getFieldHistoryData: builder.query({
      queryFn: async ({ fieldId, months }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/field-history/data',
            method: 'POST',
            body: { fieldId, months: months || [] },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, { fieldId }) => [{ type: 'FieldHistoryData', id: fieldId }],
    }),
  }),
});

export const {
  useGetFieldHistoryEstatesQuery,
  useGetFieldHistoryFieldsByEstateQuery,
  useGetFieldHistoryDataQuery,
} = fieldHistoryApi;
