import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const vehicleAppApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicleAppSummary: builder.query({
      queryFn: async (yearMonth = '') => {
        const query = yearMonth ? `?yearMonth=${encodeURIComponent(yearMonth)}` : '';
        const result = await nodeBackendBaseQuery({ url: `/api/vehicle-app/admin/summary${query}`, method: 'GET' }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || {} };
      },
      providesTags: ['VehicleApp'],
    }),

    getVehicleAppVehicles: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery({ url: '/api/vehicle-app/admin/vehicles', method: 'GET' }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
      providesTags: ['VehicleApp'],
    }),

    saveVehicleAppVehicle: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery({ url: '/api/vehicle-app/admin/vehicles', method: 'POST', body }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['VehicleApp'],
    }),

    getVehicleAppDrivers: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery({ url: '/api/vehicle-app/admin/drivers', method: 'GET' }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
      providesTags: ['VehicleApp'],
    }),

    getVehicleAppVehicleCategories: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery({ url: '/api/vehicle-app/admin/vehicle-categories', method: 'GET' }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
      providesTags: ['VehicleApp'],
    }),

    saveVehicleAppVehicleCategory: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery({ url: '/api/vehicle-app/admin/vehicle-categories', method: 'POST', body }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['VehicleApp'],
    }),

    getVehicleAppMaintenanceCategories: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery({ url: '/api/vehicle-app/admin/maintenance-categories', method: 'GET' }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
      providesTags: ['VehicleApp'],
    }),

    saveVehicleAppMaintenanceCategory: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery({ url: '/api/vehicle-app/admin/maintenance-categories', method: 'POST', body }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['VehicleApp'],
    }),

    getVehicleAppMaintenanceDescriptions: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery({ url: '/api/vehicle-app/admin/maintenance-descriptions', method: 'GET' }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
      providesTags: ['VehicleApp'],
    }),

    saveVehicleAppMaintenanceDescription: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery({ url: '/api/vehicle-app/admin/maintenance-descriptions', method: 'POST', body }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['VehicleApp'],
    }),

    getVehicleAppMaintenanceRequests: builder.query({
      queryFn: async (yearMonth = '') => {
        const query = yearMonth ? `?yearMonth=${encodeURIComponent(yearMonth)}` : '';
        const result = await nodeBackendBaseQuery({ url: `/api/vehicle-app/admin/maintenance-requests${query}`, method: 'GET' }, {}, {});
        if (result.error) return { error: result.error };
        const normalized = (result.data?.data || []).map((row) => ({
          ...row,
          hr_approval: String(row?.hr_approval || row?.approval || 'p').toLowerCase(),
          finance_approval: String(row?.finance_approval || 'p').toLowerCase(),
          finance_paid: Number(row?.finance_paid || 0),
          payment_image_url: row?.payment_image_url || null,
        }));
        return { data: normalized };
      },
      providesTags: ['VehicleApp'],
    }),

    decideVehicleAppMaintenanceRequest: builder.mutation({
      queryFn: async ({ id, approval }) => {
        const result = await nodeBackendBaseQuery({ url: `/api/vehicle-app/admin/maintenance-requests/${id}/decision`, method: 'POST', body: { approval } }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['VehicleApp'],
    }),

    hrDecideVehicleMaintenanceRequest: builder.mutation({
      queryFn: async ({ id, approval, decline_reason = null }) => {
        const result = await nodeBackendBaseQuery({
          url: `/api/vehicle-app/admin/maintenance-requests/${id}/hr-decision`,
          method: 'POST',
          body: { approval, decline_reason },
        }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['VehicleApp'],
    }),

    financeDecideVehicleMaintenanceRequest: builder.mutation({
      queryFn: async ({ id, approval, decline_reason = null }) => {
        const result = await nodeBackendBaseQuery({
          url: `/api/vehicle-app/admin/maintenance-requests/${id}/finance-decision`,
          method: 'POST',
          body: { approval, decline_reason },
        }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['VehicleApp'],
    }),

    markVehicleMaintenancePaid: builder.mutation({
      queryFn: async ({ id, payment_image, payment_note = null }) => {
        const result = await nodeBackendBaseQuery({
          url: `/api/vehicle-app/admin/maintenance-requests/${id}/mark-paid`,
          method: 'POST',
          body: {
            finance_paid: 1,
            payment_image,
            payment_note,
          },
        }, {}, {});
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['VehicleApp'],
    }),
  }),
});

export const {
  useGetVehicleAppSummaryQuery,
  useGetVehicleAppVehiclesQuery,
  useSaveVehicleAppVehicleMutation,
  useGetVehicleAppDriversQuery,
  useGetVehicleAppVehicleCategoriesQuery,
  useSaveVehicleAppVehicleCategoryMutation,
  useGetVehicleAppMaintenanceCategoriesQuery,
  useSaveVehicleAppMaintenanceCategoryMutation,
  useGetVehicleAppMaintenanceDescriptionsQuery,
  useSaveVehicleAppMaintenanceDescriptionMutation,
  useGetVehicleAppMaintenanceRequestsQuery,
  useDecideVehicleAppMaintenanceRequestMutation,
  useHrDecideVehicleMaintenanceRequestMutation,
  useFinanceDecideVehicleMaintenanceRequestMutation,
  useMarkVehicleMaintenancePaidMutation,
} = vehicleAppApi;

