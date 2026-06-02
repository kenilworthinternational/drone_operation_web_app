import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const financeReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFieldWiseFinanceReport: builder.query({
      queryFn: async ({ start_date, end_date, estates }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/finance-report/field-wise',
            method: 'POST',
            body: { start_date, end_date, estates },
          },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data || {} };
      },
    }),
    getManagementPlanExecutionReport: builder.query({
      queryFn: async ({ start_date, end_date }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/finance-report/management-plan-execution',
            method: 'POST',
            body: { start_date, end_date },
          },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
    }),
    getDeactivatedPlansReport: builder.query({
      queryFn: async ({ start_date, end_date, plantation_id, estate_id, deactivate_reason_id }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/finance-report/deactivated-plans',
            method: 'POST',
            body: { start_date, end_date, plantation_id, estate_id, deactivate_reason_id },
          },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || { plans: [], total: 0 } };
      },
    }),
    getManagerApprovedCanceledReport: builder.query({
      queryFn: async ({ start_date, end_date, plantation_id, estate_id, status_filter, reason_id }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/finance-report/manager-approved-canceled',
            method: 'POST',
            body: { start_date, end_date, plantation_id, estate_id, status_filter, reason_id },
          },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || { lines: [], total: 0 } };
      },
    }),
  }),
});

export const {
  useLazyGetFieldWiseFinanceReportQuery,
  useLazyGetManagementPlanExecutionReportQuery,
  useLazyGetDeactivatedPlansReportQuery,
  useLazyGetManagerApprovedCanceledReportQuery,
} = financeReportApi;

