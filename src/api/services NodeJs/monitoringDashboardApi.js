import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const monitoringDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =====================================================
    // GET MONITORING DASHBOARD DATA
    // Returns aggregated real-time data for all dashboard cards
    // =====================================================
    getMonitoringDashboardData: builder.query({
      queryFn: async (date) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/monitoring-dashboard/data',
            method: 'POST',
            body: { date: date || undefined },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['MonitoringDashboard'],
    }),
  }),
});

export const {
  useGetMonitoringDashboardDataQuery,
} = monitoringDashboardApi;
