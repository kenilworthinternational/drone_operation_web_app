import { baseApi } from '../baseApi';

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get pilot plans and subtasks
    getPilotPlansAndSubtasks: builder.query({
      query: ({ startDate, endDate, estates }) => ({
        url: 'pilots_plans_tasks_by_date_range_and_estates',
        method: 'POST',
        body: { start_date: startDate, end_date: endDate, estates },
      }),
      providesTags: ['PilotPerformance'],
    }),

    // Get submission data for task
    getSubmissionData: builder.query({
      query: (taskId) => ({
        url: 'display_pilot_field_sub_task',
        method: 'POST',
        body: { task: taskId },
      }),
      providesTags: (result, error, taskId) => [{ type: 'PlanDetails', id: `submission-${taskId}` }],
    }),
  }),
});

export const {
  useGetPilotPlansAndSubtasksQuery,
  useGetSubmissionDataQuery,
} = tasksApi;
