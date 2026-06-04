import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const opsroomPerformanceSummaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOpsroomDailyPerformanceSummary: builder.query({
      queryFn: async ({
        months,
        missionType = 'spy',
        completedPlansOnly = false,
        plantationIds = null,
      }) => {
        try {
          const monthList = Array.isArray(months) ? months : [];
          const body = {
            months: monthList,
            mission_type: missionType,
            completed_plans_only: completedPlansOnly,
          };
          if (Array.isArray(plantationIds) && plantationIds.length > 0) {
            body.plantation_ids = plantationIds;
          }
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/opsroom-performance-summary/daily-performance-summary',
              method: 'POST',
              body,
            },
            {},
            {},
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || null };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),
    getOpsroomPilotDailyPerformanceSummary: builder.query({
      queryFn: async ({
        months,
        missionType = 'spy',
        completedPlansOnly = false,
        plantationIds = null,
        pilotId = null,
      }) => {
        try {
          const monthList = Array.isArray(months) ? months : [];
          const body = {
            months: monthList,
            mission_type: missionType,
            completed_plans_only: completedPlansOnly,
          };
          if (Array.isArray(plantationIds) && plantationIds.length > 0) {
            body.plantation_ids = plantationIds;
          }
          if (pilotId) body.pilot_id = pilotId;
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/opsroom-performance-summary/pilot-daily-performance-summary',
              method: 'POST',
              body,
            },
            {},
            {},
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data || null };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),
    getOpsroomReportPilots: builder.query({
      queryFn: async ({
        months,
        missionType = 'spy',
        completedPlansOnly = false,
        plantationIds = null,
      }) => {
        try {
          const monthList = Array.isArray(months) ? months : [];
          const body = {
            months: monthList,
            mission_type: missionType,
            completed_plans_only: completedPlansOnly,
          };
          if (Array.isArray(plantationIds) && plantationIds.length > 0) {
            body.plantation_ids = plantationIds;
          }
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/opsroom-performance-summary/report-pilots',
              method: 'POST',
              body,
            },
            {},
            {},
          );
          if (result.error) return { error: result.error };
          return { data: result.data?.data?.pilots || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),
  }),
});

export const {
  useLazyGetOpsroomDailyPerformanceSummaryQuery,
  useLazyGetOpsroomPilotDailyPerformanceSummaryQuery,
  useLazyGetOpsroomReportPilotsQuery,
} = opsroomPerformanceSummaryApi;
