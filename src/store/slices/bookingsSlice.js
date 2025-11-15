import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../../api/services/allEndpoints';

// Async thunks for dropdown data using RTK Query
export const fetchBookingDropdownData = createAsyncThunk(
  'bookings/fetchDropdownData',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const [sectorsRes, cropsRes, missionsRes, timeRes, ascRes, brokersRes, groupsRes] = await Promise.all([
        dispatch(baseApi.endpoints.getSectors.initiate()).then(r => r.data),
        dispatch(baseApi.endpoints.getCropTypes.initiate()).then(r => r.data),
        dispatch(baseApi.endpoints.getMissionTypes.initiate()).then(r => r.data),
        dispatch(baseApi.endpoints.getTimeSlots.initiate()).then(r => r.data),
        dispatch(baseApi.endpoints.getASCs.initiate()).then(r => r.data),
        dispatch(baseApi.endpoints.getBrokers.initiate()).then(r => r.data),
        dispatch(baseApi.endpoints.getGroups.initiate()).then(r => r.data),
      ]);

      let processedAsc = [];
      if (ascRes && ascRes.ascs && Array.isArray(ascRes.ascs)) {
        processedAsc = ascRes.ascs.map(asc => ({
          id: asc.id,
          asc_id: asc.asc_id,
          code: asc.asc_code,
          name: asc.asc_name,
          gnds: asc.gnds || []
        }));
      } else if (Array.isArray(ascRes)) {
        processedAsc = ascRes.map(asc => ({
          id: asc.id,
          asc_id: asc.asc_id,
          code: asc.asc_code,
          name: asc.asc_name,
          gnds: asc.gnds || []
        }));
      } else if (ascRes && ascRes.data) {
        processedAsc = Array.isArray(ascRes.data)
          ? ascRes.data.map(asc => ({
            id: asc.id,
            asc_id: asc.asc_id,
            code: asc.asc_code,
            name: asc.asc_name,
            gnds: asc.gnds || []
          }))
          : [];
      }

      return {
        sectors: sectorsRes?.data || sectorsRes || [],
        crops: Array.isArray(cropsRes) ? cropsRes : [],
        missions: Array.isArray(missionsRes) ? missionsRes : [],
        timePicks: Array.isArray(timeRes) ? timeRes : [],
        ascs: processedAsc,
        brokers: Array.isArray(brokersRes) ? brokersRes : (brokersRes?.data || []),
        groups: Array.isArray(groupsRes) ? groupsRes : [],
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch booking dropdown data');
    }
  }
);

// Fetch bookings by date range using RTK Query
export const fetchBookingsByDateRange = createAsyncThunk(
  'bookings/fetchByDateRange',
  async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getASCBookingsByDateRange.initiate({ startDate, endDate }));
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch bookings');
    }
  }
);

// Fetch estates using RTK Query
export const fetchEstates = createAsyncThunk(
  'bookings/fetchEstates',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getAllEstates.initiate());
      const response = result.data;
      return Array.isArray(response) ? response : (response?.data || []);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch estates');
    }
  }
);

// Fetch divisions for an estate using RTK Query
export const fetchDivisions = createAsyncThunk(
  'bookings/fetchDivisions',
  async (estateId, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getDivisionsByEstate.initiate(estateId));
      const response = result.data;
      return Array.isArray(response) ? response : (response?.data || []);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch divisions');
    }
  }
);

// Fetch plans by date range using RTK Query
export const fetchPlansByDateRange = createAsyncThunk(
  'bookings/fetchPlansByDateRange',
  async ({ estateId, startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getPlansByDateRange.initiate({ startDate, endDate }));
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch plans');
    }
  }
);

// Submit new plan using RTK Query
export const submitNewPlan = createAsyncThunk(
  'bookings/submitNewPlan',
  async (planData, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.createPlan.initiate(planData));
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit plan');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    dropdownData: {
      sectors: [],
      crops: [],
      missions: [],
      timePicks: [],
      ascs: [],
      brokers: [],
      groups: [],
    },
    bookings: [],
    estates: [],
    divisions: [],
    plans: [],
    selectedBooking: null,
    selectedEstate: null,
    loading: {
      dropdownData: false,
      bookings: false,
      estates: false,
      divisions: false,
      plans: false,
      submitting: false,
    },
    error: null,
  },
  reducers: {
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    setSelectedEstate: (state, action) => {
      state.selectedEstate = action.payload;
    },
    clearSelectedEstate: (state) => {
      state.selectedEstate = null;
    },
    clearBookings: (state) => {
      state.bookings = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingDropdownData.pending, (state) => {
        state.loading.dropdownData = true;
        state.error = null;
      })
      .addCase(fetchBookingDropdownData.fulfilled, (state, action) => {
        state.loading.dropdownData = false;
        state.dropdownData = action.payload;
      })
      .addCase(fetchBookingDropdownData.rejected, (state, action) => {
        state.loading.dropdownData = false;
        state.error = action.payload;
      })
      // Fetch bookings by date range
      .addCase(fetchBookingsByDateRange.pending, (state) => {
        state.loading.bookings = true;
        state.error = null;
      })
      .addCase(fetchBookingsByDateRange.fulfilled, (state, action) => {
        state.loading.bookings = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookingsByDateRange.rejected, (state, action) => {
        state.loading.bookings = false;
        state.error = action.payload;
      })
      // Fetch estates
      .addCase(fetchEstates.pending, (state) => {
        state.loading.estates = true;
        state.error = null;
      })
      .addCase(fetchEstates.fulfilled, (state, action) => {
        state.loading.estates = false;
        state.estates = action.payload;
      })
      .addCase(fetchEstates.rejected, (state, action) => {
        state.loading.estates = false;
        state.error = action.payload;
      })
      // Fetch divisions
      .addCase(fetchDivisions.pending, (state) => {
        state.loading.divisions = true;
        state.error = null;
      })
      .addCase(fetchDivisions.fulfilled, (state, action) => {
        state.loading.divisions = false;
        state.divisions = action.payload;
      })
      .addCase(fetchDivisions.rejected, (state, action) => {
        state.loading.divisions = false;
        state.error = action.payload;
      })
      // Fetch plans by date range
      .addCase(fetchPlansByDateRange.pending, (state) => {
        state.loading.plans = true;
        state.error = null;
      })
      .addCase(fetchPlansByDateRange.fulfilled, (state, action) => {
        state.loading.plans = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlansByDateRange.rejected, (state, action) => {
        state.loading.plans = false;
        state.error = action.payload;
      })
      // Submit new plan
      .addCase(submitNewPlan.pending, (state) => {
        state.loading.submitting = true;
        state.error = null;
      })
      .addCase(submitNewPlan.fulfilled, (state) => {
        state.loading.submitting = false;
      })
      .addCase(submitNewPlan.rejected, (state, action) => {
        state.loading.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSelectedBooking, 
  clearSelectedBooking, 
  setSelectedEstate, 
  clearSelectedEstate, 
  clearBookings, 
  clearError 
} = bookingsSlice.actions;

// Selectors
export const selectBookingDropdownData = (state) => state.bookings.dropdownData;
export const selectSelectedBooking = (state) => state.bookings.selectedBooking;
export const selectSectors = (state) => state.bookings.dropdownData.sectors;
export const selectCrops = (state) => state.bookings.dropdownData.crops;
export const selectMissions = (state) => state.bookings.dropdownData.missions;
export const selectTimePicks = (state) => state.bookings.dropdownData.timePicks;
export const selectAscs = (state) => state.bookings.dropdownData.ascs;
export const selectBrokersDropdown = (state) => state.bookings.dropdownData.brokers;
export const selectGroups = (state) => state.bookings.dropdownData.groups;
export const selectBookings = (state) => state.bookings.bookings;
export const selectEstates = (state) => state.bookings.estates;
export const selectDivisions = (state) => state.bookings.divisions;
export const selectPlans = (state) => state.bookings.plans;
export const selectSelectedEstate = (state) => state.bookings.selectedEstate;
export const selectBookingLoading = (state) => state.bookings.loading;
export const selectBookingError = (state) => state.bookings.error;

export default bookingsSlice.reducer;

