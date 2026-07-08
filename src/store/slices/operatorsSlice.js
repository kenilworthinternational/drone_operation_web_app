import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../../api/services/allEndpoints';

function formatLocalDateYmd(date) {
  if (date == null) return '';
  if (typeof date === 'string') return date.slice(0, 10);
  return date.toLocaleDateString('en-CA');
}

function parsePhpNumericList(response) {
  if (!response || response.status !== 'true') return [];
  return Object.keys(response)
    .filter((key) => key !== 'status' && key !== 'count' && !Number.isNaN(Number(key)))
    .map((key) => response[key]);
}

// Async thunks using RTK Query
export const fetchOperators = createAsyncThunk(
  'operators/fetchOperators',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getOperators.initiate());
      const response = result.data;
      if (response && response.status === 'true') {
        return response.data || [];
      } else if (Array.isArray(response)) {
        return response;
      }
      return rejectWithValue('Invalid response format for operators');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch operators');
    }
  }
);

export const assignOperatorToPlan = createAsyncThunk(
  'operators/assignOperatorToPlan',
  async ({ planId, operatorId }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.assignOperatorToPlan.initiate({ planId, operatorId }));
      const response = result.data;
      if (response?.status === 'true') {
        return { planId, operatorId, response };
      }
      return rejectWithValue(response?.message || 'Failed to assign operator');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to assign operator');
    }
  }
);

export const fetchPlanOperatorsByDateRange = createAsyncThunk(
  'operators/fetchPlanOperatorsByDateRange',
  async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      const formattedStart = formatLocalDateYmd(startDate);
      const formattedEnd = formatLocalDateYmd(endDate);
      const result = await dispatch(
        baseApi.endpoints.getPlanOperatorsByDateRange.initiate(
          { startDate: formattedStart, endDate: formattedEnd },
          { subscribe: false }
        )
      );
      if (result.error) {
        return rejectWithValue(
          result.error.data?.message || result.error.error || 'Failed to fetch plan operators'
        );
      }
      return { startDate: formattedStart, endDate: formattedEnd, data: result.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch plan operators');
    }
  }
);

export const fetchAssignedOperator = createAsyncThunk(
  'operators/fetchAssignedOperator',
  async (planId, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getAssignedOperator.initiate(planId));
      return { planId, operator: result.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch assigned operator');
    }
  }
);

const operatorsSlice = createSlice({
  name: 'operators',
  initialState: {
    operators: [],
    assignedOperators: {}, // Keyed by planId
    planOperatorsByDateRange: {}, // Keyed by date range string
    selectedOperator: null,
    loading: {
      operators: false,
      assignOperator: false,
      planOperators: false,
      assignedOperator: false,
    },
    error: null,
  },
  reducers: {
    setSelectedOperator: (state, action) => {
      state.selectedOperator = action.payload;
    },
    clearOperators: (state) => {
      state.operators = [];
      state.selectedOperator = null;
      state.assignedOperators = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Operators
      .addCase(fetchOperators.pending, (state) => {
        state.loading.operators = true;
        state.error = null;
      })
      .addCase(fetchOperators.fulfilled, (state, action) => {
        state.loading.operators = false;
        state.operators = action.payload;
      })
      .addCase(fetchOperators.rejected, (state, action) => {
        state.loading.operators = false;
        state.error = action.payload;
      })
      // Assign Operator to Plan
      .addCase(assignOperatorToPlan.pending, (state) => {
        state.loading.assignOperator = true;
        state.error = null;
      })
      .addCase(assignOperatorToPlan.fulfilled, (state, action) => {
        state.loading.assignOperator = false;
        state.assignedOperators[action.payload.planId] = action.payload.operatorId;
      })
      .addCase(assignOperatorToPlan.rejected, (state, action) => {
        state.loading.assignOperator = false;
        state.error = action.payload;
      })
      // Fetch Plan Operators by Date Range
      .addCase(fetchPlanOperatorsByDateRange.pending, (state) => {
        state.loading.planOperators = true;
        state.error = null;
      })
      .addCase(fetchPlanOperatorsByDateRange.fulfilled, (state, action) => {
        state.loading.planOperators = false;
        const key = `${action.payload.startDate}_${action.payload.endDate}`;
        state.planOperatorsByDateRange[key] = action.payload.data;
      })
      .addCase(fetchPlanOperatorsByDateRange.rejected, (state, action) => {
        state.loading.planOperators = false;
        state.error = action.payload;
      })
      // Fetch Assigned Operator
      .addCase(fetchAssignedOperator.pending, (state) => {
        state.loading.assignedOperator = true;
        state.error = null;
      })
      .addCase(fetchAssignedOperator.fulfilled, (state, action) => {
        state.loading.assignedOperator = false;
        state.assignedOperators[action.payload.planId] = action.payload.operator;
      })
      .addCase(fetchAssignedOperator.rejected, (state, action) => {
        state.loading.assignedOperator = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedOperator, clearOperators, clearError } = operatorsSlice.actions;

// Selectors
export const selectOperators = (state) => state.operators.operators;
export const selectSelectedOperator = (state) => state.operators.selectedOperator;
export const selectAssignedOperatorByPlan = (state, planId) =>
  state.operators.assignedOperators[planId] || null;
export const selectPlanOperatorsByDateRange = (state, startDate, endDate) => {
  const formattedStart = formatLocalDateYmd(startDate);
  const formattedEnd = formatLocalDateYmd(endDate);
  const key = `${formattedStart}_${formattedEnd}`;
  return state.operators.planOperatorsByDateRange[key] || null;
};

export { formatLocalDateYmd, parsePhpNumericList };

export default operatorsSlice.reducer;

