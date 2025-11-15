import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../api/services/allEndpoints';

// Async thunk to fetch pilot performance data using RTK Query
export const fetchPilotPerformance = createAsyncThunk(
  'pilotPerformance/fetchPilotPerformance',
  async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getPilotPerformance.initiate({ startDate, endDate }));
      const response = result.data;
      // Transform and filter pilot data
      const transformed = response.pilots
        .map(pilot => {
          const totalAssigned = pilot.plans
            .filter(plan => plan.activated === 1 && plan.manager_approval === 1)
            .reduce((sum, plan) => {
              return sum + plan.fields.reduce((fieldSum, field) => {
                return fieldSum + (Number(field.field_area) || 0);
              }, 0);
            }, 0);
          const totalCompleted = pilot.plans
            .filter(plan => plan.activated === 1 && plan.manager_approval === 1)
            .reduce((sum, plan) => {
              return sum + plan.fields.reduce((fieldSum, field) => {
                // Sum dji_field_area from all tasks in the field
                let completedArea = 0;
                if (Array.isArray(field.task) && field.task.length > 0) {
                  completedArea = field.task.reduce((tSum, t) => {
                    // Use dji_field_area from each task, fallback to 0 if null
                    return tSum + (Number(t.dji_field_area) || 0);
                  }, 0);
                }
                return fieldSum + completedArea;
              }, 0);
            }, 0);
            const totalCancelled = pilot.plans
            .filter(plan => plan.activated === 1 && plan.manager_approval === 1)
            .reduce((sum, plan) => {
              return sum + plan.fields.reduce((fieldSum, field) => {
                // Check if field is cancelled based only on field.task_status
                const isFieldCancelled = field.task_status === 'x';

                // Only count cancelled fields
                if (isFieldCancelled) {
                  return fieldSum + (Number(field.field_area) || 0);
                }
                return fieldSum;
              }, 0);
            }, 0);
          const firstName = pilot.pilot_name ? pilot.pilot_name.split(' ')[0] : 'Unknown';
          const fullName = pilot.pilot_name || 'Unknown';
          const assigned2 = Number(totalAssigned.toFixed(2));
          const completed = Number(totalCompleted.toFixed(2));
          const cancelled = Number(totalCancelled.toFixed(2));
          const assigned = assigned2-cancelled;
          const remaining = Number(Math.max(0, assigned - completed).toFixed(2));
          console.log("assigned, completed, cancelled",assigned, completed, cancelled);
          const percentage = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
          return {
            pilotName: firstName,
            pilotNameFullName: fullName,
            totalAssigned: assigned,
            completed: completed,
            remaining: remaining,
            percentage: percentage,
          };
        })
        .filter(pilot => pilot.totalAssigned > 0); // Exclude pilots with no assigned work
      return transformed;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create slice
const pilotPerformanceSlice = createSlice({
  name: 'pilotPerformance',
  initialState: {
    pilotsData: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPilotsData: state => {
      state.pilotsData = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPilotPerformance.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPilotPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.pilotsData = action.payload;
      })
      .addCase(fetchPilotPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.pilotsData = [];
      });
  },
});

export const { clearPilotsData } = pilotPerformanceSlice.actions;
export default pilotPerformanceSlice.reducer;