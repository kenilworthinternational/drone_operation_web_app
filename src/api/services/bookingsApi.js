import { baseApi } from '../baseApi';

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get ASC bookings by date range
    getASCBookingsByDateRange: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'search_mission_by_requested_date_range',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['ASCBookings'],
    }),

    // Get missions by planned date (ASC)
    getMissionsByPlannedDate: builder.query({
      query: (date) => ({
        url: 'search_mission_by_planed_date',
        method: 'POST',
        body: { date },
      }),
      providesTags: (result, error, date) => [{ type: 'ASCBookings', id: date }],
    }),

    // Create mission (ASC booking)
    createMission: builder.mutation({
      query: (missionData) => ({
        url: 'create_mission',
        method: 'POST',
        body: missionData,
      }),
      invalidatesTags: ['ASCBookings', 'Missions', 'Calendar'],
    }),

    // Update mission planned date
    updateMissionPlannedDate: builder.mutation({
      query: ({ id, datePlaned, paymentType }) => ({
        url: 'update_mission_planned_date_by_id',
        method: 'POST',
        body: {
          id,
          date_planed: datePlaned,
          ...(paymentType ? { payment_type: paymentType } : {})
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MissionDetails', id },
        'ASCBookings',
        'Calendar'
      ],
    }),

    // Update mission details
    updateMission: builder.mutation({
      query: (missionData) => ({
        url: 'update_mission_by_id',
        method: 'POST',
        body: missionData,
      }),
      invalidatesTags: (result, error, data) => [
        { type: 'MissionDetails', id: data.id },
        'ASCBookings'
      ],
    }),

    // Update mission status
    updateMissionStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: 'update_mission_status_by_id',
        method: 'POST',
        body: { id, status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MissionDetails', id },
        'ASCBookings'
      ],
    }),

    // Set ASC for mission
    setASCForMission: builder.mutation({
      query: (payload) => ({
        url: 'update_mission_asc_by_id',
        method: 'POST',
        body: typeof payload === 'object' && payload !== null
          ? {
              id: payload.id,
              asc: payload.asc,
              ...(payload.gnd !== undefined ? { gnd: payload.gnd } : {})
            }
          : payload,
      }),
      invalidatesTags: (result, error, payload) => [
        { type: 'MissionDetails', id: typeof payload === 'object' ? payload.id : payload },
        'ASCBookings'
      ],
    }),
  }),
});

export const {
  useGetASCBookingsByDateRangeQuery,
  useGetMissionsByPlannedDateQuery,
  useCreateMissionMutation,
  useUpdateMissionPlannedDateMutation,
  useUpdateMissionMutation,
  useUpdateMissionStatusMutation,
  useSetASCForMissionMutation,
} = bookingsApi;
