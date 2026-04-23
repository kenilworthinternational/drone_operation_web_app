import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const hrLeaveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHrLeaveTypes: builder.query({
      queryFn: async () =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/types', method: 'POST', body: {} }, {}, {}),
      providesTags: ['HrLeave'],
    }),
    getHrLeaveTypesAll: builder.query({
      queryFn: async () =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/types', method: 'POST', body: { includeAll: 1 } }, {}, {}),
      providesTags: ['HrLeave'],
    }),
    getHrDashboard: builder.query({
      queryFn: async (body = {}) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/dashboard', method: 'POST', body }, {}, {}),
      providesTags: ['HrLeave', 'HrAttendance'],
    }),
    getHrMyLeaveRequests: builder.query({
      queryFn: async (body = {}) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/my-requests', method: 'POST', body }, {}, {}),
      providesTags: ['HrLeave'],
    }),
    createHrLeaveRequest: builder.mutation({
      queryFn: async (body) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/request', method: 'POST', body }, {}, {}),
      invalidatesTags: ['HrLeave'],
    }),
    getHrApprovalsInbox: builder.query({
      queryFn: async (body = {}) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/approvals/inbox', method: 'POST', body }, {}, {}),
      providesTags: ['HrLeave'],
    }),
    decideHrLeaveRequest: builder.mutation({
      queryFn: async (body) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/approvals/decide', method: 'POST', body }, {}, {}),
      invalidatesTags: ['HrLeave'],
    }),
    markHrAttendance: builder.mutation({
      queryFn: async (body) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/attendance/mark', method: 'POST', body }, {}, {}),
      invalidatesTags: ['HrAttendance'],
    }),
    getHrAttendanceLog: builder.query({
      queryFn: async (body = {}) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/attendance/log', method: 'POST', body }, {}, {}),
      providesTags: ['HrAttendance'],
    }),
    saveHrRosterPlan: builder.mutation({
      queryFn: async (body) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/roster/save', method: 'POST', body }, {}, {}),
      invalidatesTags: ['HrRoster'],
    }),
    getHrRosterPlan: builder.query({
      queryFn: async (body = {}) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/roster/view', method: 'POST', body }, {}, {}),
      providesTags: ['HrRoster'],
    }),
    getHrHolidayCalendar: builder.query({
      queryFn: async (body = {}) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/holidays/list', method: 'POST', body }, {}, {}),
      providesTags: ['HrHoliday'],
    }),
    saveHrHolidayMark: builder.mutation({
      queryFn: async (body) =>
        nodeBackendBaseQuery({ url: '/api/hr-leave/holidays/save', method: 'POST', body }, {}, {}),
      invalidatesTags: ['HrHoliday'],
    }),
  }),
});

export const {
  useGetHrLeaveTypesQuery,
  useGetHrLeaveTypesAllQuery,
  useGetHrDashboardQuery,
  useGetHrMyLeaveRequestsQuery,
  useCreateHrLeaveRequestMutation,
  useGetHrApprovalsInboxQuery,
  useDecideHrLeaveRequestMutation,
  useMarkHrAttendanceMutation,
  useGetHrAttendanceLogQuery,
  useSaveHrRosterPlanMutation,
  useGetHrRosterPlanQuery,
  useGetHrHolidayCalendarQuery,
  useSaveHrHolidayMarkMutation,
} = hrLeaveApi;
