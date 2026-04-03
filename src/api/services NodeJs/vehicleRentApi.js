import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

function toLocalDateOnly(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const vehicleRentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get pending vehicle rent approvals for HR Admin
    getPendingApprovals: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/pending-approvals',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const approvals = result.data?.data || result.data || [];
          return { data: approvals };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),

    // Get day-by-day rent details for selected vehicle and month
    getVehicleRentDailyDetails: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/daily-details',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const details = result.data?.data || result.data || [];
          return { data: details };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),

    // Get day-level verification queue for HR
    getDailyVerificationQueue: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/daily-verification-queue',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const rows = result.data?.data || result.data || [];
          return { data: rows };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),

    // Verify a single day record (HR)
    verifyVehicleDayRecord: builder.mutation({
      queryFn: async ({
        id,
        verified,
        verifiedBy,
        not_verified_reason = null,
        start_meter,
        end_meter,
        verification_reason = null,
      }) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: `/api/vehicle-rent/verify-day/${id}`,
              method: 'POST',
              body: {
                verified,
                verifiedBy,
                not_verified_reason,
                start_meter,
                end_meter,
                verification_reason,
              },
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const updated = result.data?.data || result.data || null;
          return { data: updated };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['VehicleRent'],
    }),

    // Approve or decline a vehicle date
    approveVehicleDate: builder.mutation({
      queryFn: async ({ id, status, approvedBy, bill_note }) => {
        try {
          // Map 'r' (rejected) to 'd' (declined) for backward compatibility
          const mappedStatus = status === 'r' ? 'd' : status;
          const result = await nodeBackendBaseQuery(
            {
              url: `/api/vehicle-rent/approve/${id}`,
              method: 'POST',
              body: { status: mappedStatus, approvedBy, bill_note },
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const updated = result.data?.data || result.data || null;
          return { data: updated };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['VehicleRent'],
    }),

    // Get approved vehicle dates for Finance section
    getApprovedForFinance: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/approved-for-finance',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const approved = result.data?.data || result.data || [];
          return { data: approved };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),

    // Update finance approval / paid status
    updateFinanceStatus: builder.mutation({
      queryFn: async ({ id, ...body }) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: `/api/vehicle-rent/finance-update/${id}`,
              method: 'POST',
              body,
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const updated = result.data?.data || result.data || null;
          return { data: updated };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['VehicleRent'],
    }),

    // Get monthly summary by vehicle for Finance section
    getMonthlySummaryByVehicle: builder.query({
      queryFn: async ({ yearMonth }) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/monthly-summary',
              method: 'POST',
              body: { yearMonth },
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const summary = result.data?.data || result.data || [];
          return { data: summary };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),

    // Get all used vehicles
    getUsedVehicles: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/used-vehicles',
              method: 'POST',
              body: {},
            },
            {},
            {}
          );
          if (result.error) {
            return { error: result.error };
          }
          const vehicles = result.data?.data || result.data || [];
          return { data: vehicles };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),

    // HR queue - driver advance requests
    getAdvanceRequestsForHr: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/advance-requests/hr-queue',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || result.data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),

    // HR approve/decline - driver advance request
    hrApproveAdvanceRequest: builder.mutation({
      queryFn: async ({ id, status }) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: `/api/vehicle-rent/advance-requests/hr-approve/${id}`,
              method: 'POST',
              body: { status },
            },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || result.data || null };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['VehicleRent'],
    }),

    // Finance queue - driver advance requests
    getAdvanceRequestsForFinance: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/advance-requests/finance-queue',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || result.data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),

    // Finance update - driver advance request
    updateAdvanceFinanceStatus: builder.mutation({
      queryFn: async ({ id, ...body }) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: `/api/vehicle-rent/advance-requests/finance-update/${id}`,
              method: 'POST',
              body,
            },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || result.data || null };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['VehicleRent'],
    }),

    // HR list - driver leave dates
    getLeaveDaysForHr: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/leave-days/hr-list',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || result.data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),

    getLeaveDaysForHrByMonth: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/leave-days/hr-list-by-month',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || result.data || { months: [] } };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),

    getDailyKmSummaryForHr: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/vehicle-rent/daily-km-summary/hr',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          if (result.error) return { error: result.error };
          const rows = result.data?.data || result.data || [];
          const normalized = (rows || []).map((row) => ({
            date: toLocalDateOnly(row?.date),
            day: toLocalDateOnly(row?.date).slice(8, 10),
            vehicle_no: String(row?.vehicle_no || ''),
            total_km: Number(row?.total_km || 0),
            vehicle_count: Number(row?.vehicle_count || 0),
          }));
          return { data: normalized };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['VehicleRent'],
    }),
  }),
});

export const {
  useGetPendingApprovalsQuery,
  useLazyGetVehicleRentDailyDetailsQuery,
  useGetDailyVerificationQueueQuery,
  useVerifyVehicleDayRecordMutation,
  useApproveVehicleDateMutation,
  useGetApprovedForFinanceQuery,
  useUpdateFinanceStatusMutation,
  useGetMonthlySummaryByVehicleQuery,
  useGetUsedVehiclesQuery,
  useGetAdvanceRequestsForHrQuery,
  useHrApproveAdvanceRequestMutation,
  useGetAdvanceRequestsForFinanceQuery,
  useUpdateAdvanceFinanceStatusMutation,
  useGetLeaveDaysForHrQuery,
  useLazyGetLeaveDaysForHrByMonthQuery,
  useGetDailyKmSummaryForHrQuery,
} = vehicleRentApi;
