import { baseApi } from '../baseApi';

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get pilot revenue by date
    getPilotRevenueByDate: builder.query({
      query: (date) => ({
        url: 'pilot_daily_covered_area',
        method: 'POST',
        body: { date },
      }),
      providesTags: (result, error, date) => [{ type: 'PilotRevenue', id: date }],
    }),

    // Get saved pilot revenue by date
    getSavedPilotRevenueByDate: builder.query({
      query: (date) => ({
        url: 'get_pilot_daily_payment_by_date',
        method: 'POST',
        body: { date },
      }),
      providesTags: (result, error, date) => [{ type: 'PilotRevenue', id: `saved-${date}` }],
    }),

    // Get default payment values
    getDefaultPaymentValues: builder.query({
      query: (date) => ({
        url: 'default_values',
        method: 'POST',
        body: { date },
      }),
      providesTags: ['DefaultValues'],
    }),

    // Add/Update pilot revenue
    addPilotRevenue: builder.mutation({
      query: ({
        pilot, date, assigned, covered, cancel,
        covered_revenue, downtime_reason, downtime_approval,
        downtime_payment, total_revenue, verified
      }) => ({
        url: 'pilot_daily_payment',
        method: 'POST',
        body: {
          pilot, date, assigned, covered, cancel,
          covered_revenue, downtime_reason, downtime_approval,
          downtime_payment, total_revenue, verified
        },
      }),
      invalidatesTags: (result, error, { date }) => [
        { type: 'PilotRevenue', id: date },
        { type: 'PilotRevenue', id: `saved-${date}` }
      ],
    }),

    // Get all brokers
    getBrokers: builder.query({
      query: () => ({
        url: 'view_brokers',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Brokers'],
    }),

    // Search broker by ID
    searchBrokerById: builder.query({
      query: (id) => ({
        url: 'search_broker_by_id',
        method: 'POST',
        body: { id },
      }),
      providesTags: (result, error, id) => [{ type: 'Brokers', id }],
    }),

    // Search broker by NIC
    searchBrokerByNIC: builder.query({
      query: (nic) => ({
        url: 'search_broker_by_nic',
        method: 'POST',
        body: { nic },
      }),
      providesTags: ['Brokers'],
    }),

    // Add broker
    addBroker: builder.mutation({
      query: ({ name, mobile, address, nic, bank, branch, account, percentage, joined_date }) => ({
        url: 'add_broker',
        method: 'POST',
        body: { name, mobile, address, nic, bank, branch, account, percentage, joined_date },
      }),
      invalidatesTags: ['Brokers'],
    }),

    // Update broker
    updateBroker: builder.mutation({
      query: ({ id, name, mobile, address, nic, bank, branch, account, percentage, joined_date }) => ({
        url: 'update_broker',
        method: 'POST',
        body: { id, name, mobile, address, nic, bank, branch, account, percentage, joined_date },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Brokers', id }, 'Brokers'],
    }),

    // Update broker status
    updateBrokerStatus: builder.mutation({
      query: ({ id, activated }) => ({
        url: 'update_broker_status',
        method: 'POST',
        body: { id, activated },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Brokers', id }, 'Brokers'],
    }),
  }),
});

export const {
  useGetPilotRevenueByDateQuery,
  useGetSavedPilotRevenueByDateQuery,
  useGetDefaultPaymentValuesQuery,
  useAddPilotRevenueMutation,
  useGetBrokersQuery,
  useSearchBrokerByIdQuery,
  useSearchBrokerByNICQuery,
  useAddBrokerMutation,
  useUpdateBrokerMutation,
  useUpdateBrokerStatusMutation,
} = financeApi;

