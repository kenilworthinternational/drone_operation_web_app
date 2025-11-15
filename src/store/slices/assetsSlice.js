import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../../api/services/allEndpoints';

// Fetch insurance types using RTK Query
export const fetchInsuranceTypes = createAsyncThunk(
  'assets/fetchInsuranceTypes',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getInsuranceTypes.initiate());
      const response = result.data;
      const isSuccess = response?.status === true || response?.status === 'true';
      if (isSuccess) {
        return Array.isArray(response?.types) ? response.types : [];
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch insurance types');
    }
  }
);

// Fetch assets by type using RTK Query
export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (assetType, { dispatch, rejectWithValue }) => {
    try {
      let endpoint;
      let responseKeys;

      switch (assetType) {
        case 'drones':
          endpoint = 'getDrones';
          responseKeys = ['drones'];
          break;
        case 'vehicles':
          endpoint = 'getVehicles';
          responseKeys = ['vehicles'];
          break;
        case 'generators':
          endpoint = 'getGenerators';
          responseKeys = ['generators'];
          break;
        case 'batteries':
          endpoint = 'getBatteries';
          responseKeys = ['battery', 'batteries'];
          break;
        case 'remoteControls':
          endpoint = 'getRemoteControls';
          responseKeys = ['remote_controls', 'remote_control', 'remotes'];
          break;
        default:
          return rejectWithValue('Invalid asset type');
      }

      const result = await dispatch(baseApi.endpoints[endpoint].initiate());
      const response = result.data;
      const isSuccess = response?.status === true || response?.status === 'true';

      if (!isSuccess) {
        return rejectWithValue(response?.message || 'Failed to load assets');
      }

      // Find data in response
      let list = [];
      for (const key of responseKeys) {
        if (Array.isArray(response?.[key])) {
          list = response[key];
          break;
        }
      }

      return { assetType, assets: list };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch assets');
    }
  }
);

// Update asset using RTK Query
export const updateAsset = createAsyncThunk(
  'assets/updateAsset',
  async ({ assetType, data }, { dispatch, rejectWithValue }) => {
    try {
      let endpoint;

      switch (assetType) {
        case 'drones':
          endpoint = 'updateDrone';
          break;
        case 'vehicles':
          endpoint = 'updateVehicle';
          break;
        case 'generators':
          endpoint = 'updateGenerator';
          break;
        case 'batteries':
          endpoint = 'updateBattery';
          break;
        case 'remoteControls':
          endpoint = 'updateRemoteControl';
          break;
        default:
          return rejectWithValue('Invalid asset type');
      }

      const result = await dispatch(baseApi.endpoints[endpoint].initiate(data));
      const response = result.data;
      const isSuccess = response?.status === true || response?.status === 'true';

      if (!isSuccess) {
        return rejectWithValue(response?.message || 'Failed to update asset');
      }

      return { assetType, message: response.message };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update asset');
    }
  }
);

const assetsSlice = createSlice({
  name: 'assets',
  initialState: {
    // Asset data by type
    assetsByType: {
      drones: [],
      vehicles: [],
      generators: [],
      batteries: [],
      remoteControls: [],
    },
    insuranceTypes: [],
    activeTab: 'drones',
    searchTerm: '',
    statusFilter: 'all',
    selectedAsset: null,
    selectedAssetType: 'drones',
    loading: {
      assets: false,
      insurance: false,
      updating: false,
    },
    error: null,
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      state.searchTerm = '';
      state.statusFilter = 'all';
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setSelectedAsset: (state, action) => {
      state.selectedAsset = action.payload.asset;
      state.selectedAssetType = action.payload.assetType;
    },
    clearSelectedAsset: (state) => {
      state.selectedAsset = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch insurance types
      .addCase(fetchInsuranceTypes.pending, (state) => {
        state.loading.insurance = true;
        state.error = null;
      })
      .addCase(fetchInsuranceTypes.fulfilled, (state, action) => {
        state.loading.insurance = false;
        state.insuranceTypes = action.payload;
      })
      .addCase(fetchInsuranceTypes.rejected, (state, action) => {
        state.loading.insurance = false;
        state.error = action.payload;
      })
      // Fetch assets
      .addCase(fetchAssets.pending, (state) => {
        state.loading.assets = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading.assets = false;
        const { assetType, assets } = action.payload;
        state.assetsByType[assetType] = assets;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading.assets = false;
        state.error = action.payload;
      })
      // Update asset
      .addCase(updateAsset.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateAsset.fulfilled, (state) => {
        state.loading.updating = false;
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload;
      });
  },
});

export const {
  setActiveTab,
  setSearchTerm,
  setStatusFilter,
  setSelectedAsset,
  clearSelectedAsset,
  clearError,
} = assetsSlice.actions;

// Selectors
export const selectActiveTab = (state) => state.assets.activeTab;
const EMPTY_ASSET_LIST = [];

export const selectAssets = (state, assetType) =>
  state.assets.assetsByType[assetType] ?? EMPTY_ASSET_LIST;
export const selectCurrentAssets = (state) =>
  state.assets.assetsByType[state.assets.activeTab] ?? EMPTY_ASSET_LIST;
export const selectInsuranceTypes = (state) => state.assets.insuranceTypes;
export const selectSearchTerm = (state) => state.assets.searchTerm;
export const selectStatusFilter = (state) => state.assets.statusFilter;
export const selectSelectedAsset = (state) => state.assets.selectedAsset;
export const selectSelectedAssetType = (state) => state.assets.selectedAssetType;
export const selectLoading = (state) => state.assets.loading;
export const selectError = (state) => state.assets.error;

export default assetsSlice.reducer;

