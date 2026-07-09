import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const systemMaintenanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemMaintenanceOverview: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/system-maintenance/overview', method: 'POST', body: {} },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data ?? result.data };
      },
      providesTags: ['SystemMaintenance'],
      keepUnusedDataFor: 60,
    }),

    getSystemMaintenanceBackupStatus: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/system-maintenance/backup/status', method: 'POST', body: {} },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data ?? result.data };
      },
      providesTags: ['SystemMaintenance'],
    }),

    getSystemMaintenancePm2Logs: builder.query({
      queryFn: async ({ appName, lines = 100 }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/system-maintenance/pm2/logs',
            method: 'POST',
            body: { appName, lines },
          },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data?.data ?? result.data };
      },
    }),

    restartPm2Process: builder.mutation({
      queryFn: async ({ appName, confirmName }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/system-maintenance/pm2/restart',
            method: 'POST',
            body: { appName, confirmName },
          },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data };
      },
      invalidatesTags: ['SystemMaintenance'],
    }),

    triggerSystemBackup: builder.mutation({
      queryFn: async ({ confirmAction }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/system-maintenance/backup/trigger',
            method: 'POST',
            body: { confirmAction },
          },
          {},
          {}
        );
        if (result.error) return { error: result.error };
        return { data: result.data };
      },
      invalidatesTags: ['SystemMaintenance'],
    }),
  }),
});

export const {
  useGetSystemMaintenanceOverviewQuery,
  useGetSystemMaintenanceBackupStatusQuery,
  useLazyGetSystemMaintenancePm2LogsQuery,
  useRestartPm2ProcessMutation,
  useTriggerSystemBackupMutation,
} = systemMaintenanceApi;
