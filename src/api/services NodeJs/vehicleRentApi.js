import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

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

    // Approve or decline a vehicle date
    approveVehicleDate: builder.mutation({
      queryFn: async ({ id, status, approvedBy }) => {
        try {
          // Map 'r' (rejected) to 'd' (declined) for backward compatibility
          const mappedStatus = status === 'r' ? 'd' : status;
          const result = await nodeBackendBaseQuery(
            {
              url: `/api/vehicle-rent/approve/${id}`,
              method: 'POST',
              body: { status: mappedStatus, approvedBy },
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
  }),
});

export const {
  useGetPendingApprovalsQuery,
  useApproveVehicleDateMutation,
  useGetApprovedForFinanceQuery,
  useGetMonthlySummaryByVehicleQuery,
  useGetUsedVehiclesQuery,
} = vehicleRentApi;
