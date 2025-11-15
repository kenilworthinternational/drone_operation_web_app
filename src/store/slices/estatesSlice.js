import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../../api/services/allEndpoints';

// Async thunks using RTK Query
export const fetchEstates = createAsyncThunk(
  'estates/fetchEstates',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        baseApi.endpoints.getAllEstates.initiate()
      );
      const response = result.data;
      if (Array.isArray(response)) {
        return response;
      }
      return rejectWithValue('Invalid response format for estates');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch estates');
    }
  }
);

export const fetchDivisions = createAsyncThunk(
  'estates/fetchDivisions',
  async (estateID, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        baseApi.endpoints.getDivisionsByEstate.initiate(estateID)
      );
      const response = result.data;
      if (response && typeof response === 'object') {
        const divisions = Object.keys(response)
          .filter(key => !isNaN(key))
          .map(key => response[key]);
        return {
          estateID,
          divisions: Array.isArray(divisions) ? divisions : [],
          minimumPlanSize: response.minimum_plan_size || 0,
          maximumPlanSize: response.maximum_plan_size || 0,
        };
      }
      return rejectWithValue('Invalid response format for divisions');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch divisions');
    }
  }
);

export const fetchFieldDetails = createAsyncThunk(
  'estates/fetchFieldDetails',
  async (fieldId, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        baseApi.endpoints.getFieldDetails.initiate(fieldId)
      );
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch field details');
    }
  }
);

export const fetchEstateDetails = createAsyncThunk(
  'estates/fetchEstateDetails',
  async (estateID, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        baseApi.endpoints.getEstateDetails.initiate(estateID)
      );
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch estate details');
    }
  }
);

const estatesSlice = createSlice({
  name: 'estates',
  initialState: {
    estates: [],
    selectedEstate: null,
    divisions: {},
    selectedDivision: null,
    fieldDetails: {},
    estateDetails: {},
    loading: {
      estates: false,
      divisions: false,
      fieldDetails: false,
      estateDetails: false,
    },
    error: null,
  },
  reducers: {
    setSelectedEstate: (state, action) => {
      state.selectedEstate = action.payload;
      // Clear divisions when estate changes
      if (state.selectedEstate?.value !== action.payload?.value) {
        state.divisions = {};
        state.selectedDivision = null;
      }
    },
    setSelectedDivision: (state, action) => {
      state.selectedDivision = action.payload;
    },
    clearEstates: (state) => {
      state.estates = [];
      state.selectedEstate = null;
      state.divisions = {};
      state.selectedDivision = null;
    },
    clearDivisions: (state) => {
      state.divisions = {};
      state.selectedDivision = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Estates
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
      // Fetch Divisions
      .addCase(fetchDivisions.pending, (state) => {
        state.loading.divisions = true;
        state.error = null;
      })
      .addCase(fetchDivisions.fulfilled, (state, action) => {
        state.loading.divisions = false;
        state.divisions[action.payload.estateID] = {
          divisions: action.payload.divisions,
          planSizeLimits: {
            minimum: action.payload.minimumPlanSize,
            maximum: action.payload.maximumPlanSize,
          },
        };
      })
      .addCase(fetchDivisions.rejected, (state, action) => {
        state.loading.divisions = false;
        state.error = action.payload;
      })
      // Fetch Field Details
      .addCase(fetchFieldDetails.pending, (state) => {
        state.loading.fieldDetails = true;
        state.error = null;
      })
      .addCase(fetchFieldDetails.fulfilled, (state, action) => {
        state.loading.fieldDetails = false;
        state.fieldDetails[action.meta.arg] = action.payload;
      })
      .addCase(fetchFieldDetails.rejected, (state, action) => {
        state.loading.fieldDetails = false;
        state.error = action.payload;
      })
      // Fetch Estate Details
      .addCase(fetchEstateDetails.pending, (state) => {
        state.loading.estateDetails = true;
        state.error = null;
      })
      .addCase(fetchEstateDetails.fulfilled, (state, action) => {
        state.loading.estateDetails = false;
        state.estateDetails[action.meta.arg] = action.payload;
      })
      .addCase(fetchEstateDetails.rejected, (state, action) => {
        state.loading.estateDetails = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedEstate,
  setSelectedDivision,
  clearEstates,
  clearDivisions,
  clearError,
} = estatesSlice.actions;

// Selectors
const EMPTY_DIVISIONS = [];
const DEFAULT_PLAN_SIZE_LIMITS = Object.freeze({ minimum: 0, maximum: 0 });

export const selectEstates = (state) => state.estates.estates;
export const selectSelectedEstate = (state) => state.estates.selectedEstate;
export const selectDivisionsByEstate = (state, estateID) =>
  state.estates.divisions[estateID]?.divisions ?? EMPTY_DIVISIONS;
export const selectPlanSizeLimits = (state, estateID) =>
  state.estates.divisions[estateID]?.planSizeLimits ?? DEFAULT_PLAN_SIZE_LIMITS;

export default estatesSlice.reducer;

