import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pilotsPerfomances } from '../api/api';

// Async thunk to fetch pilot performance data
export const fetchPilotPerformance2 = createAsyncThunk(
  'pilotPerformance/fetchPilotPerformance2',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await pilotsPerfomances(startDate, endDate);
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
                // Check if field is cancelled based only on field.task_status
                const isFieldCancelled = field.task_status === 'x';

                // Only count completed fields (not cancelled)
                if (isFieldCancelled) return fieldSum;
                return fieldSum + (Number(field.completed_area_by_pilot_for_field) || 0);
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
          const assigned = Number(totalAssigned.toFixed(2));
          const completed = Number(totalCompleted.toFixed(2));
          const cancelled = Number(totalCancelled.toFixed(2));
          const remaining = Number(Math.max(0, assigned - completed - cancelled).toFixed(2));
          const percentage = assigned - cancelled > 0 ? Math.round((completed / (assigned-cancelled)) * 100) : 0;
          return {
            pilotName: firstName,
            pilotNameFullName: fullName,
            totalAssigned: assigned,
            completed: completed,
            cancelled: cancelled,
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
const pilotPerformanceSlice2 = createSlice({
  name: 'pilotPerformance2',
  initialState: {
    pilotsData: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPilotsData2: state => {
      state.pilotsData = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPilotPerformance2.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPilotPerformance2.fulfilled, (state, action) => {
        state.loading = false;
        state.pilotsData = action.payload;
      })
      .addCase(fetchPilotPerformance2.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.pilotsData = [];
      });
  },
});

export const { clearPilotsData2 } = pilotPerformanceSlice2.actions;
export default pilotPerformanceSlice2.reducer;