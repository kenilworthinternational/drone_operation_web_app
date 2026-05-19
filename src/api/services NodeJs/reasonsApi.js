import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const reasonsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMissionPartialReasons: builder.query({
      queryFn: async ({ include_inactive = true } = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/reasons/mission-partial/list',
            method: 'POST',
            body: { include_inactive },
          },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['Reasons'],
    }),

    saveMissionPartialReason: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/reasons/mission-partial/save',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Reasons', 'MissionPartialReasons'],
    }),

    getNotSprayingRecens: builder.query({
      queryFn: async ({ include_inactive = true } = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/reasons/not-spraying/list',
            method: 'POST',
            body: { include_inactive },
          },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['Reasons'],
    }),

    saveNotSprayingRecen: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/reasons/not-spraying/save',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Reasons'],
    }),

    getDeactivateReasons: builder.query({
      queryFn: async ({ include_inactive = true } = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/reasons/deactivate/list',
            method: 'POST',
            body: { include_inactive },
          },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['Reasons'],
    }),

    saveDeactivateReason: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/reasons/deactivate/save',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Reasons'],
    }),
  }),
});

export const {
  useGetMissionPartialReasonsQuery,
  useSaveMissionPartialReasonMutation,
  useGetNotSprayingRecensQuery,
  useSaveNotSprayingRecenMutation,
  useGetDeactivateReasonsQuery,
  useSaveDeactivateReasonMutation,
} = reasonsApi;

