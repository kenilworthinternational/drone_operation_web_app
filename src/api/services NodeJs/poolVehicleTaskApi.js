import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const poolVehicleTaskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPoolRequestCategories: builder.query({
      queryFn: async (activeOnly = true) => {
        const q = activeOnly === false ? '?activeOnly=0' : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/pool-vehicle-tasks/categories${q}`, method: 'GET' },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
      providesTags: ['PoolVehicleTasks'],
    }),
    savePoolRequestCategory: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/pool-vehicle-tasks/categories', method: 'POST', body },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['PoolVehicleTasks'],
    }),
    getPoolVehicleTasks: builder.query({
      queryFn: async (params = {}) => {
        const sp = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v != null && v !== '') sp.set(k, String(v));
        });
        const qs = sp.toString();
        const result = await nodeBackendBaseQuery(
          { url: `/api/pool-vehicle-tasks/requests${qs ? `?${qs}` : ''}`, method: 'GET' },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
      providesTags: ['PoolVehicleTasks'],
    }),
    getPoolPassengerUsers: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/pool-vehicle-tasks/passenger-users', method: 'GET' },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
      providesTags: ['PoolVehicleTasks'],
    }),
    getPoolVehiclesForAssignment: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/pool-vehicle-tasks/pool-vehicles', method: 'GET' },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data || [] };
      },
      providesTags: ['PoolVehicleTasks'],
    }),
    createPoolVehicleRequest: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/pool-vehicle-tasks/request', method: 'POST', body },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['PoolVehicleTasks'],
    }),
    updatePoolVehicleRequest: builder.mutation({
      queryFn: async ({ id, ...body }) => {
        const result = await nodeBackendBaseQuery(
          { url: `/api/pool-vehicle-tasks/requests/${id}`, method: 'PUT', body },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['PoolVehicleTasks'],
    }),
    hrDecidePoolVehicleTask: builder.mutation({
      queryFn: async ({ id, ...body }) => {
        const result = await nodeBackendBaseQuery(
          { url: `/api/pool-vehicle-tasks/requests/${id}/hr-decision`, method: 'POST', body },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['PoolVehicleTasks'],
    }),
    assignPoolVehicleTask: builder.mutation({
      queryFn: async ({ id, ...body }) => {
        const result = await nodeBackendBaseQuery(
          { url: `/api/pool-vehicle-tasks/requests/${id}/assign`, method: 'POST', body },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data || null };
      },
      invalidatesTags: ['PoolVehicleTasks'],
    }),
  }),
});

export const {
  useGetPoolRequestCategoriesQuery,
  useSavePoolRequestCategoryMutation,
  useGetPoolVehicleTasksQuery,
  useGetPoolPassengerUsersQuery,
  useGetPoolVehiclesForAssignmentQuery,
  useCreatePoolVehicleRequestMutation,
  useUpdatePoolVehicleRequestMutation,
  useHrDecidePoolVehicleTaskMutation,
  useAssignPoolVehicleTaskMutation,
} = poolVehicleTaskApi;
