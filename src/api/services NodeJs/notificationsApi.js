import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get notifications for current user
    getNotifications: builder.query({
      queryFn: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.displayed !== undefined) {
          params.append('displayed', filters.displayed ? '1' : '0');
        }
        if (filters.activated !== undefined) {
          params.append('activated', filters.activated ? '1' : '0');
        }
        if (filters.limit) {
          params.append('limit', filters.limit.toString());
        }

        const url = `/api/notifications${params.toString() ? `?${params.toString()}` : ''}`;
        const result = await nodeBackendBaseQuery(
          { url, method: 'GET' },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Notifications'],
    }),

    // Create ad-hoc request notification
    createAdHocNotification: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/notifications/ad-hoc',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Notifications'],
    }),

    // Create reschedule request notification
    createRescheduleNotification: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/notifications/reschedule',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Notifications'],
    }),

    // Mark notification as displayed
    markNotificationAsDisplayed: builder.mutation({
      queryFn: async (notificationId) => {
        const result = await nodeBackendBaseQuery(
          {
            url: `/api/notifications/${notificationId}/mark-displayed`,
            method: 'POST',
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Notifications'],
    }),

    // Mark multiple notifications as displayed
    markMultipleNotificationsAsDisplayed: builder.mutation({
      queryFn: async (notificationIds) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/notifications/mark-displayed',
            method: 'POST',
            body: { notification_ids: notificationIds },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Notifications'],
    }),

    // Get unread notification count
    getUnreadCount: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/notifications/unread-count', method: 'GET' },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Notifications'],
    }),

    // Log notification action
    logNotificationAction: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/notifications/log-action',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
    }),

    // Create plan approval notification
    createPlanApprovalNotification: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/notifications/plan-approval',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useCreateAdHocNotificationMutation,
  useCreateRescheduleNotificationMutation,
  useCreatePlanApprovalNotificationMutation,
  useMarkNotificationAsDisplayedMutation,
  useMarkMultipleNotificationsAsDisplayedMutation,
  useLogNotificationActionMutation,
} = notificationsApi;

