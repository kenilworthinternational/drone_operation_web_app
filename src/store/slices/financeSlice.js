import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../../api/services/allEndpoints';

// Fetch pilot revenue for a specific date using RTK Query
export const fetchPilotRevenue = createAsyncThunk(
  'finance/fetchPilotRevenue',
  async (date, { dispatch, rejectWithValue }) => {
    try {
      const formattedDate = date.toLocaleDateString('en-CA');
      const result = await dispatch(baseApi.endpoints.getPilotRevenueByDate.initiate(formattedDate));
      return { date: formattedDate, data: result.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pilot revenue');
    }
  }
);

// Fetch default payment values using RTK Query
export const fetchDefaultValues = createAsyncThunk(
  'finance/fetchDefaultValues',
  async (date, { dispatch, rejectWithValue }) => {
    try {
      const formattedDate = date.toLocaleDateString('en-CA');
      const result = await dispatch(baseApi.endpoints.getDefaultPaymentValues.initiate(formattedDate));
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch default values');
    }
  }
);

// Fetch downtime reasons using RTK Query
export const fetchDowntimeReasons = createAsyncThunk(
  'finance/fetchDowntimeReasons',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getPartialCompleteReasons.initiate('c'));
      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch downtime reasons');
    }
  }
);

// Fetch brokers using RTK Query
export const fetchBrokers = createAsyncThunk(
  'finance/fetchBrokers',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getBrokers.initiate());
      const response = result.data;
      if (response.status === 'true') {
        return response.brokers || [];
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch brokers');
    }
  }
);

// Update broker using RTK Query
export const updateBrokerThunk = createAsyncThunk(
  'finance/updateBroker',
  async (brokerData, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.updateBroker.initiate(brokerData));
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update broker');
    }
  }
);

// Update broker status using RTK Query
export const updateBrokerStatusThunk = createAsyncThunk(
  'finance/updateBrokerStatus',
  async ({ brokerId, status }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.updateBrokerStatus.initiate({ id: brokerId, activated: status }));
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update broker status');
    }
  }
);

// Add pilot revenue using RTK Query
export const addPilotRevenueThunk = createAsyncThunk(
  'finance/addPilotRevenue',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.addPilotRevenue.initiate(data));
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add pilot revenue');
    }
  }
);

const financeSlice = createSlice({
  name: 'finance',
  initialState: {
    // Pilot earnings
    pilotRevenue: {},
    defaultValues: null,
    downtimeReasons: [],
    
    // Brokers
    brokers: [],
    searchTerm: '',
    
    loading: {
      pilotRevenue: false,
      defaultValues: false,
      downtimeReasons: false,
      brokers: false,
      updating: false,
    },
    error: null,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPilotRevenue: (state) => {
      state.pilotRevenue = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pilot revenue
      .addCase(fetchPilotRevenue.pending, (state) => {
        state.loading.pilotRevenue = true;
        state.error = null;
      })
      .addCase(fetchPilotRevenue.fulfilled, (state, action) => {
        state.loading.pilotRevenue = false;
        const { date, data } = action.payload;
        state.pilotRevenue[date] = data;
      })
      .addCase(fetchPilotRevenue.rejected, (state, action) => {
        state.loading.pilotRevenue = false;
        state.error = action.payload;
      })
      // Fetch default values
      .addCase(fetchDefaultValues.pending, (state) => {
        state.loading.defaultValues = true;
        state.error = null;
      })
      .addCase(fetchDefaultValues.fulfilled, (state, action) => {
        state.loading.defaultValues = false;
        state.defaultValues = action.payload;
      })
      .addCase(fetchDefaultValues.rejected, (state, action) => {
        state.loading.defaultValues = false;
        state.error = action.payload;
      })
      // Fetch downtime reasons
      .addCase(fetchDowntimeReasons.pending, (state) => {
        state.loading.downtimeReasons = true;
        state.error = null;
      })
      .addCase(fetchDowntimeReasons.fulfilled, (state, action) => {
        state.loading.downtimeReasons = false;
        state.downtimeReasons = action.payload;
      })
      .addCase(fetchDowntimeReasons.rejected, (state, action) => {
        state.loading.downtimeReasons = false;
        state.error = action.payload;
      })
      // Fetch brokers
      .addCase(fetchBrokers.pending, (state) => {
        state.loading.brokers = true;
        state.error = null;
      })
      .addCase(fetchBrokers.fulfilled, (state, action) => {
        state.loading.brokers = false;
        state.brokers = action.payload;
      })
      .addCase(fetchBrokers.rejected, (state, action) => {
        state.loading.brokers = false;
        state.error = action.payload;
      })
      // Update broker
      .addCase(updateBrokerThunk.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateBrokerThunk.fulfilled, (state) => {
        state.loading.updating = false;
      })
      .addCase(updateBrokerThunk.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload;
      })
      // Update broker status
      .addCase(updateBrokerStatusThunk.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateBrokerStatusThunk.fulfilled, (state) => {
        state.loading.updating = false;
      })
      .addCase(updateBrokerStatusThunk.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload;
      })
      // Add pilot revenue
      .addCase(addPilotRevenueThunk.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(addPilotRevenueThunk.fulfilled, (state) => {
        state.loading.updating = false;
      })
      .addCase(addPilotRevenueThunk.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchTerm,
  clearError,
  clearPilotRevenue,
} = financeSlice.actions;

// Selectors
export const selectPilotRevenue = (state, date) => state.finance.pilotRevenue[date] || null;
export const selectDefaultValues = (state) => state.finance.defaultValues;
export const selectDowntimeReasons = (state) => state.finance.downtimeReasons;
export const selectBrokers = (state) => state.finance.brokers;
export const selectSearchTerm = (state) => state.finance.searchTerm;
export const selectLoading = (state) => state.finance.loading;
export const selectError = (state) => state.finance.error;

export default financeSlice.reducer;

