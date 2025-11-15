import { baseApi } from '../baseApi';

export const operatorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all operators
    getOperators: builder.query({
      query: () => ({
        url: 'get_operator',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Operators'],
    }),

    // Assign operator to plan
    assignOperatorToPlan: builder.mutation({
      query: ({ planId, operatorId }) => ({
        url: 'assign_plan_to_operator',
        method: 'POST',
        body: { plan: planId, operator: operatorId },
      }),
      invalidatesTags: (result, error, { planId }) => [
        { type: 'PlanDetails', id: planId },
        'Operators',
        'Plans'
      ],
    }),

    // Get assigned operator for plan
    getAssignedOperator: builder.query({
      query: (planId) => ({
        url: 'find_plan_operator',
        method: 'POST',
        body: { plan: planId },
      }),
      providesTags: (result, error, planId) => [{ type: 'PlanDetails', id: `operator-${planId}` }],
    }),

    // Get plan operators by date range
    getPlanOperatorsByDateRange: builder.query({
      query: ({ startDate, endDate }) => ({
        url: 'find_plan_operator_date_range',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate },
      }),
      providesTags: ['Operators'],
    }),
  }),
});

export const {
  useGetOperatorsQuery,
  useAssignOperatorToPlanMutation,
  useGetAssignedOperatorQuery,
  useGetPlanOperatorsByDateRangeQuery,
} = operatorsApi;

