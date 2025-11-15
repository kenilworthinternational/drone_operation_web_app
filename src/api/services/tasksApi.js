import { baseApi } from '../baseApi';

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get tasks by plan and field
    getTasksByPlanAndField: builder.query({
      query: ({ planId, fieldId }) => ({
        url: 'display_tasks_by_plan_and_field',
        method: 'POST',
        body: { plan: planId, field: fieldId },
      }),
      providesTags: (result, error, { planId, fieldId }) => [
        { type: 'PlanDetails', id: `tasks-${planId}-${fieldId}` }
      ],
    }),

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

    // Update subtask approval (ops room)
    updateSubtaskApproval: builder.mutation({
      query: ({ subtask, status }) => ({
        url: 'update_ops_room_approval_for_sub_task',
        method: 'POST',
        body: { subtask, status },
      }),
      invalidatesTags: (result, error, { subtask }) => [
        { type: 'PlanDetails', id: `submission-${subtask}` },
        'PilotPerformance'
      ],
    }),

    // Log subtask status
    logSubtaskStatus: builder.mutation({
      query: ({ subtask, status, reasonId, reasonText }) => ({
        url: 'sub_tasks_status_log',
        method: 'POST',
        body: {
          subtask,
          status,
          reason: reasonId,
          reason_text: reasonText
        },
      }),
      invalidatesTags: (result, error, { subtask }) => [
        { type: 'PlanDetails', id: `submission-${subtask}` }
      ],
    }),

    // Submit DJI record
    submitDJIRecord: builder.mutation({
      query: (formData) => ({
        url: 'submit_dji_record_by_task',
        method: 'POST',
        body: formData,
        formData: true, // Special handling for multipart
      }),
      invalidatesTags: ['PilotPerformance', 'Plans'],
    }),

    // Report/Flag a task
    reportTask: builder.mutation({
      query: ({ taskId, reason, reasonList }) => ({
        url: 'flag_task_by_id',
        method: 'POST',
        body: { task_id: taskId, reason, reason_list: reasonList },
      }),
      invalidatesTags: ['TaskReports'],
    }),

    // View task report
    getTaskReport: builder.query({
      query: (taskId) => ({
        url: 'search_task_flag_by_task_id',
        method: 'POST',
        body: { task: taskId },
      }),
      providesTags: (result, error, taskId) => [{ type: 'TaskReports', id: taskId }],
    }),
  }),
});

export const {
  useGetTasksByPlanAndFieldQuery,
  useGetPilotPlansAndSubtasksQuery,
  useGetSubmissionDataQuery,
  useUpdateSubtaskApprovalMutation,
  useLogSubtaskStatusMutation,
  useSubmitDJIRecordMutation,
  useReportTaskMutation,
  useGetTaskReportQuery,
} = tasksApi;

