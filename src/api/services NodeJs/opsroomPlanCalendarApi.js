import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

const base = '/api/opsroom-plan-calendar';

async function nodePost(url, body = {}) {
  return nodeBackendBaseQuery({ url, method: 'POST', body }, {}, {});
}

export const opsroomPlanCalendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOpsroomPlansByDateRange: builder.query({
      queryFn: async ({ startDate, endDate }) => {
        const result = await nodePost(`${base}/plans/by-date-range`, {
          start_date: startDate,
          end_date: endDate,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: ['Plans', 'Calendar'],
    }),

    getOpsroomEstateProfile: builder.query({
      queryFn: async (estateId) => {
        const result = await nodePost(`${base}/estate-profile`, {
          estate: estateId,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: (result, error, estateId) => [{ type: 'Estates', id: estateId }],
    }),

    getOpsroomPlanTeamDrone: builder.query({
      queryFn: async (planId) => {
        const result = await nodePost(`${base}/plan-team-drone`, {
          plan_id: planId,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: (result, error, planId) => [{ type: 'PlanDetails', id: `pilot-${planId}` }],
    }),

    getOpsroomEstateDivisionsFields: builder.query({
      queryFn: async (estateId) => {
        const result = await nodePost(`${base}/estate-divisions-fields`, {
          estate: estateId,
        });
        if (result.error) return result;
        return { data: result.data };
      },
      providesTags: (result, error, estateId) => [{ type: 'Divisions', id: `estate-all-${estateId}` }],
    }),
  }),
});

export const {
  useGetOpsroomPlansByDateRangeQuery,
  useLazyGetOpsroomPlansByDateRangeQuery,
  useGetOpsroomEstateProfileQuery,
  useLazyGetOpsroomEstateProfileQuery,
  useGetOpsroomPlanTeamDroneQuery,
  useLazyGetOpsroomPlanTeamDroneQuery,
  useGetOpsroomEstateDivisionsFieldsQuery,
  useLazyGetOpsroomEstateDivisionsFieldsQuery,
} = opsroomPlanCalendarApi;
