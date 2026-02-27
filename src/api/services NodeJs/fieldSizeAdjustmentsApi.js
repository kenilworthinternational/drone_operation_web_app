import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

const API = '/api/field-size-adjustments';

export const fieldSizeAdjustmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchFields: builder.query({
      queryFn: async ({ q, limit = 20 }) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: `${API}/search-fields?q=${encodeURIComponent(q || '')}&limit=${limit || 20}` },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          const data = result.data?.data ?? result.data ?? [];
          return { data };
        } catch (err) {
          return { error: { status: 'FETCH_ERROR', error: err.message } };
        }
      },
      providesTags: ['FieldSizeAdjustments'],
    }),

    getFieldById: builder.query({
      queryFn: async (fieldId) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: `${API}/fields/${encodeURIComponent(fieldId)}` },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          const data = result.data?.data ?? result.data;
          return { data };
        } catch (err) {
          return { error: { status: 'FETCH_ERROR', error: err.message } };
        }
      },
      providesTags: (result, error, fieldId) => [{ type: 'FieldSizeAdjustments', id: `field-${fieldId}` }],
    }),

    updateFieldArea: builder.mutation({
      queryFn: async ({ fieldId, area }) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: `${API}/fields/update-area`, method: 'POST', body: { fieldId, area } },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          const body = result.data;
          if (body && body.status === false) {
            return { error: { status: 'CUSTOM_ERROR', data: body, error: body.message || 'Update failed' } };
          }
          return { data: body || { status: true, message: 'Field area updated' } };
        } catch (err) {
          return { error: { status: 'FETCH_ERROR', error: err.message } };
        }
      },
      invalidatesTags: (result, error, { fieldId }) => [
        'FieldSizeAdjustments',
        { type: 'FieldSizeAdjustments', id: `field-${fieldId}` },
      ],
    }),

    getPlanDivisionFieldsByFieldId: builder.query({
      queryFn: async (fieldId) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: `${API}/plan-division-fields/${encodeURIComponent(fieldId)}` },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          const data = result.data?.data ?? result.data ?? [];
          return { data };
        } catch (err) {
          return { error: { status: 'FETCH_ERROR', error: err.message } };
        }
      },
      providesTags: (result, error, fieldId) => [{ type: 'FieldSizeAdjustments', id: `pdf-${fieldId}` }],
    }),

    updatePlanDivisionFieldArea: builder.mutation({
      queryFn: async ({ id, field_area, fieldId }) => {
        try {
          const result = await nodeBackendBaseQuery(
            { url: `${API}/plan-division-fields/update-area`, method: 'POST', body: { id, field_area } },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data };
        } catch (err) {
          return { error: { status: 'FETCH_ERROR', error: err.message } };
        }
      },
      invalidatesTags: (result, error, { fieldId }) => [
        'FieldSizeAdjustments',
        ...(fieldId ? [{ type: 'FieldSizeAdjustments', id: `pdf-${fieldId}` }] : []),
      ],
    }),
  }),
});

export const {
  useLazySearchFieldsQuery,
  useGetFieldByIdQuery,
  useLazyGetFieldByIdQuery,
  useUpdateFieldAreaMutation,
  useGetPlanDivisionFieldsByFieldIdQuery,
  useLazyGetPlanDivisionFieldsByFieldIdQuery,
  useUpdatePlanDivisionFieldAreaMutation,
} = fieldSizeAdjustmentsApi;
