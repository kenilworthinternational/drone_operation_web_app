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
  }),
});

export const {
  useLazyGetFieldWiseFinanceReportQuery,
  useLazyGetManagementPlanExecutionReportQuery,
} = financeReportApi;

