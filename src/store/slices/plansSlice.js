import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../../api/services/allEndpoints';

// Async thunks using RTK Query
export const fetchPlansByDate = createAsyncThunk(
  'plans/fetchPlansByDate',
  async (date, { dispatch, rejectWithValue }) => {
    try {
      const formattedDate = typeof date === 'string' ? date : date.toLocaleDateString('en-CA');
      const result = await dispatch(baseApi.endpoints.getPlansByDate.initiate(formattedDate));
      const response = result.data;
      if (response && Array.isArray(response)) {
        return { date: formattedDate, plans: response };
      }
      return rejectWithValue('Invalid response format for plans');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch plans');
    }
  }
);

export const fetchPlanById = createAsyncThunk(
  'plans/fetchPlanById',
  async (planId, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getPlanById.initiate(planId));
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch plan');
    }
  }
);

export const createPlan = createAsyncThunk(
  'plans/createPlan',
  async (planData, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.createPlan.initiate(planData));
      const response = result.data;
      if (response?.status === 'true') {
        return response;
      }
      return rejectWithValue(response?.message || 'Failed to create plan');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create plan');
    }
  }
);

export const updatePlan = createAsyncThunk(
  'plans/updatePlan',
  async (planData, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.updatePlan.initiate(planData));
      const response = result.data;
      if (response?.status === 'true') {
        return response;
      }
      return rejectWithValue(response?.message || 'Failed to update plan');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update plan');
    }
  }
);

const plansSlice = createSlice({
  name: 'plans',
  initialState: {
    plansByDate: {}, // Keyed by date
    plansById: {}, // Keyed by planId
    selectedPlan: null,
    selectedDate: null,
    loading: {
      plansByDate: false,
      planById: false,
      createPlan: false,
      updatePlan: false,
    },
    error: null,
  },
  reducers: {
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    clearPlans: (state) => {
      state.plansByDate = {};
      state.plansById = {};
      state.selectedPlan = null;
    },
    clearPlansByDate: (state) => {
      state.plansByDate = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans by Date
      .addCase(fetchPlansByDate.pending, (state) => {
        state.loading.plansByDate = true;
        state.error = null;
      })
      .addCase(fetchPlansByDate.fulfilled, (state, action) => {
        state.loading.plansByDate = false;
        state.plansByDate[action.payload.date] = action.payload.plans;
      })
      .addCase(fetchPlansByDate.rejected, (state, action) => {
        state.loading.plansByDate = false;
        state.error = action.payload;
      })
      // Fetch Plan by ID
      .addCase(fetchPlanById.pending, (state) => {
        state.loading.planById = true;
        state.error = null;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.loading.planById = false;
        state.plansById[action.meta.arg] = action.payload;
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.loading.planById = false;
        state.error = action.payload;
      })
      // Create Plan
      .addCase(createPlan.pending, (state) => {
        state.loading.createPlan = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.loading.createPlan = false;
        // Optionally update plansByDate if the plan has a date
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.loading.createPlan = false;
        state.error = action.payload;
      })
      // Update Plan
      .addCase(updatePlan.pending, (state) => {
        state.loading.updatePlan = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.loading.updatePlan = false;
        // Optionally update plansById if the plan ID is known
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.loading.updatePlan = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedPlan,
  setSelectedDate,
  clearPlans,
  clearPlansByDate,
  clearError,
} = plansSlice.actions;

// Selectors
const EMPTY_PLAN_LIST = [];

export const selectPlansByDate = (state, date) => {
  const formattedDate = typeof date === 'string' ? date : date.toLocaleDateString('en-CA');
  return state.plans.plansByDate[formattedDate] ?? EMPTY_PLAN_LIST;
};
export const selectPlanById = (state, planId) => state.plans.plansById[planId] || null;
export const selectSelectedPlan = (state) => state.plans.selectedPlan;
export const selectSelectedDate = (state) => state.plans.selectedDate;

export default plansSlice.reducer;

