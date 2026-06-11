import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery, getNodeBackendUrl, getToken } from './nodeBackendConfig';

/**
 * HR Employee Profile API (Phases 2-7).
 *
 * Generic child-record sections share three endpoints (list/save/delete)
 * driven by a `section` key. Documents use multipart upload, and the
 * organization endpoints power the org chart + HR reports.
 */
export const employeeProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Generic profile sections ----
    listEmployeeProfileSection: builder.query({
      queryFn: async ({ section, employeeId }) =>
        nodeBackendBaseQuery(
          { url: `/api/employee-profile/${section}/list`, method: 'POST', body: { employeeId } },
          {},
          {}
        ),
      providesTags: ['EmployeeProfile'],
    }),
    saveEmployeeProfileSection: builder.mutation({
      queryFn: async ({ section, ...body }) =>
        nodeBackendBaseQuery(
          { url: `/api/employee-profile/${section}/save`, method: 'POST', body },
          {},
          {}
        ),
      invalidatesTags: ['EmployeeProfile'],
    }),
    deleteEmployeeProfileSection: builder.mutation({
      queryFn: async ({ section, id }) =>
        nodeBackendBaseQuery(
          { url: `/api/employee-profile/${section}/delete`, method: 'POST', body: { id } },
          {},
          {}
        ),
      invalidatesTags: ['EmployeeProfile'],
    }),
    uploadEmployeeProfileSectionFile: builder.mutation({
      queryFn: async ({ section, employeeId, id, file }) => {
        try {
          const formData = new FormData();
          formData.append('employeeId', String(employeeId));
          formData.append('id', String(id));
          formData.append('file', file);
          const res = await fetch(`${getNodeBackendUrl()}/api/employee-profile/${section}/upload-file`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
          });
          const data = await res.json();
          if (!res.ok || data?.status === false) {
            return { error: { status: res.status, data } };
          }
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['EmployeeProfile'],
    }),

    // ---- Documents ----
    listEmployeeDocuments: builder.query({
      queryFn: async (employeeId) =>
        nodeBackendBaseQuery(
          { url: '/api/employee-documents/list', method: 'POST', body: { employeeId } },
          {},
          {}
        ),
      providesTags: ['EmployeeDocuments'],
    }),
    uploadEmployeeDocument: builder.mutation({
      // FormData multipart upload via direct fetch (RTK base query keeps JSON headers).
      queryFn: async (formData) => {
        try {
          const res = await fetch(`${getNodeBackendUrl()}/api/employee-documents/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
          });
          const data = await res.json();
          if (!res.ok || data?.status === false) {
            return { error: { status: res.status, data } };
          }
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['EmployeeDocuments'],
    }),
    deleteEmployeeDocument: builder.mutation({
      queryFn: async (id) =>
        nodeBackendBaseQuery({ url: '/api/employee-documents/delete', method: 'POST', body: { id } }, {}, {}),
      invalidatesTags: ['EmployeeDocuments'],
    }),

    // ---- Organization ----
    getOrgChart: builder.query({
      queryFn: async () =>
        nodeBackendBaseQuery({ url: '/api/organization/chart', method: 'POST', body: {} }, {}, {}),
      providesTags: ['Organization'],
    }),
    getDepartmentHeadcount: builder.query({
      queryFn: async () =>
        nodeBackendBaseQuery({ url: '/api/organization/department-headcount', method: 'POST', body: {} }, {}, {}),
      providesTags: ['Organization'],
    }),
    getVacancyReport: builder.query({
      queryFn: async () =>
        nodeBackendBaseQuery({ url: '/api/organization/vacancy', method: 'POST', body: {} }, {}, {}),
      providesTags: ['Organization'],
    }),
    getReportingChain: builder.query({
      queryFn: async (employeeId) =>
        nodeBackendBaseQuery({ url: '/api/organization/reporting-chain', method: 'POST', body: { employeeId } }, {}, {}),
      providesTags: ['Organization'],
    }),
  }),
});

export const {
  useListEmployeeProfileSectionQuery,
  useLazyListEmployeeProfileSectionQuery,
  useSaveEmployeeProfileSectionMutation,
  useDeleteEmployeeProfileSectionMutation,
  useUploadEmployeeProfileSectionFileMutation,
  useListEmployeeDocumentsQuery,
  useUploadEmployeeDocumentMutation,
  useDeleteEmployeeDocumentMutation,
  useGetOrgChartQuery,
  useGetDepartmentHeadcountQuery,
  useGetVacancyReportQuery,
  useGetReportingChainQuery,
} = employeeProfileApi;
