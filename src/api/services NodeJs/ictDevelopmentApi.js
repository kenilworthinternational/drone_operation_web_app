import { baseApi } from '../baseApi';
import { getNodeBackendUrl, getToken, nodeBackendBaseQuery } from './nodeBackendConfig';

function extractPayload(result, fallback) {
  return result.data?.data ?? result.data ?? fallback;
}

export const ictDevelopmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIctProjects: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/projects/list', method: 'POST', body: {} },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, []) };
      },
      providesTags: ['IctProjects'],
    }),

    createIctProject: builder.mutation({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/projects/create', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, null) };
      },
      invalidatesTags: ['IctProjects'],
    }),

    updateIctProject: builder.mutation({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/projects/update', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, null) };
      },
      invalidatesTags: ['IctProjects'],
    }),

    getIctSprints: builder.query({
      queryFn: async (payload = {}) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/sprints/list', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, []) };
      },
      providesTags: ['IctSprints'],
    }),

    createIctSprint: builder.mutation({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/sprints/create', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, null) };
      },
      invalidatesTags: ['IctSprints'],
    }),

    getIctAssignableUsers: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/users/assignable', method: 'POST', body: {} },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, []) };
      },
      providesTags: ['IctAssignableUsers'],
    }),

    getIctWorkItems: builder.query({
      queryFn: async (payload = {}) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/work-items/list', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, []) };
      },
      providesTags: ['IctWorkItems'],
    }),

    createIctWorkItem: builder.mutation({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/work-items/create', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, null) };
      },
      invalidatesTags: ['IctWorkItems', 'IctMetrics'],
    }),

    updateIctWorkItemStatus: builder.mutation({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/work-items/update-status', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, null) };
      },
      invalidatesTags: ['IctWorkItems', 'IctMetrics'],
    }),

    assignIctWorkItemUsers: builder.mutation({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/work-items/assign', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, null) };
      },
      invalidatesTags: ['IctWorkItems'],
    }),

    getIctWorkItemHistory: builder.query({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/work-items/history', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, { current: null, history: [] }) };
      },
      providesTags: ['IctWorkItems'],
    }),

    createIctQaBugReport: builder.mutation({
      queryFn: async (payload) => {
        if (payload instanceof FormData) {
          try {
            const token = getToken();
            const response = await fetch(`${getNodeBackendUrl()}/api/ict-development/work-items/qa-bugs/create`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: payload,
            });
            const json = await response.json();
            if (!response.ok) {
              return {
                error: {
                  status: response.status,
                  data: json,
                },
              };
            }
            return { data: json?.data ?? json };
          } catch (error) {
            return { error: { status: 'FETCH_ERROR', data: { message: error.message } } };
          }
        }

        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/work-items/qa-bugs/create', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, null) };
      },
      invalidatesTags: ['IctWorkItems'],
    }),

    getIctQaBugReports: builder.query({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/work-items/qa-bugs/list', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, []) };
      },
      providesTags: ['IctWorkItems'],
    }),

    updateIctQaBugReportStatus: builder.mutation({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/work-items/qa-bugs/update-status', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, null) };
      },
      invalidatesTags: ['IctWorkItems'],
    }),

    qaApproveIctWorkItem: builder.mutation({
      queryFn: async (payload) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/work-items/qa-approve', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, null) };
      },
      invalidatesTags: ['IctWorkItems'],
    }),

    getIctMetricsSummary: builder.query({
      queryFn: async (payload = {}) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/ict-development/metrics/summary', method: 'POST', body: payload },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: extractPayload(result, {}) };
      },
      providesTags: ['IctMetrics'],
    }),
  }),
});

export const {
  useGetIctProjectsQuery,
  useCreateIctProjectMutation,
  useUpdateIctProjectMutation,
  useGetIctSprintsQuery,
  useCreateIctSprintMutation,
  useGetIctAssignableUsersQuery,
  useGetIctWorkItemsQuery,
  useCreateIctWorkItemMutation,
  useUpdateIctWorkItemStatusMutation,
  useAssignIctWorkItemUsersMutation,
  useGetIctWorkItemHistoryQuery,
  useCreateIctQaBugReportMutation,
  useGetIctQaBugReportsQuery,
  useUpdateIctQaBugReportStatusMutation,
  useQaApproveIctWorkItemMutation,
  useGetIctMetricsSummaryQuery,
} = ictDevelopmentApi;
