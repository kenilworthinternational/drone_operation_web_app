import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../../api/services/allEndpoints';

// Specific report thunks using RTK Query
export const fetchTeamLeadReport = createAsyncThunk(
  'reports/fetchTeamLeadReport',
  async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getTeamLeadReport.initiate({ startDate, endDate }));
      return { reportName: 'teamLeadReport', data: result.data, startDate, endDate };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch team lead report');
    }
  }
);

export const fetchApprovalCountReport = createAsyncThunk(
  'reports/fetchApprovalCountReport',
  async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getApprovalCountReport.initiate({ startDate, endDate }));
      return { reportName: 'approvalCountReport', data: result.data, startDate, endDate };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch approval count report');
    }
  }
);

export const fetchFlightNumbersReport = createAsyncThunk(
  'reports/fetchFlightNumbersReport',
  async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getFlightNumbersReport.initiate({ startDate, endDate }));
      return { reportName: 'flightNumbersReport', data: result.data, startDate, endDate };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch flight numbers report');
    }
  }
);

export const fetchPilotRevenueReport = createAsyncThunk(
  'reports/fetchPilotRevenueReport',
  async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getPilotRevenueByDateRange.initiate({ startDate, endDate }));
      return { reportName: 'pilotRevenueReport', data: result.data, startDate, endDate };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pilot revenue report');
    }
  }
);

export const fetchTaskReviewReport = createAsyncThunk(
  'reports/fetchTaskReviewReport',
  async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getTaskReviewReport.initiate({ startDate, endDate }));
      return { reportName: 'taskReviewReport', data: result.data, startDate, endDate };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch task review report');
    }
  }
);

export const fetchChartAllDataGroup = createAsyncThunk(
  'reports/fetchChartAllDataGroup',
  async ({ payload, reportName }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getChartAllDataGroup.initiate(payload));
      return { reportName, data: result.data, payload };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch chart all data group');
    }
  }
);

export const fetchChartGroupDataGroup = createAsyncThunk(
  'reports/fetchChartGroupDataGroup',
  async ({ payload, reportName }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getChartGroupData.initiate(payload));
      return { reportName, data: result.data, payload };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch chart group data');
    }
  }
);

export const fetchChartPlantationDataGroup = createAsyncThunk(
  'reports/fetchChartPlantationDataGroup',
  async ({ payload, reportName }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getChartPlantationData.initiate(payload));
      return { reportName, data: result.data, payload };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch chart plantation data');
    }
  }
);

export const fetchChartRegionDataGroup = createAsyncThunk(
  'reports/fetchChartRegionDataGroup',
  async ({ payload, reportName }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getChartRegionData.initiate(payload));
      return { reportName, data: result.data, payload };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch chart region data');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    // Report data keyed by report name and date range
    reportData: {},
    // Filters for reports
    filters: {
      selectedPilot: 'all',
      selectedType: 'All',
      selectedGroup: null,
      selectedPlantation: null,
      selectedRegion: null,
      selectedRegions: 'All', // For FlightNumbersReport
      filterManagerReview: 'all',
      filterDirectorOps: 'all',
    },
    // Loading states keyed by report name
    loading: {},
    // Errors keyed by report name
    errors: {},
  },
  reducers: {
    setReportFilter: (state, action) => {
      const { filterName, value } = action.payload;
      state.filters[filterName] = value;
    },
    clearReportFilter: (state, action) => {
      const filterName = action.payload;
      if (state.filters[filterName] !== undefined) {
        // Reset to default based on filter name
        if (filterName === 'selectedPilot') state.filters[filterName] = 'all';
        else if (filterName === 'selectedType') state.filters[filterName] = 'All';
        else if (filterName === 'filterManagerReview' || filterName === 'filterDirectorOps') {
          state.filters[filterName] = 'all';
        } else {
          state.filters[filterName] = null;
        }
      }
    },
    clearAllFilters: (state) => {
      state.filters = {
        selectedPilot: 'all',
        selectedType: 'All',
        selectedGroup: null,
        selectedPlantation: null,
        selectedRegion: null,
        selectedRegions: 'All',
        filterManagerReview: 'all',
        filterDirectorOps: 'all',
      };
    },
    clearReportData: (state, action) => {
      const reportName = action.payload;
      if (reportName) {
        // Clear specific report
        Object.keys(state.reportData).forEach(key => {
          if (key.startsWith(`${reportName}_`)) {
            delete state.reportData[key];
          }
        });
      } else {
        // Clear all reports
        state.reportData = {};
      }
    },
    clearError: (state, action) => {
      const reportName = action.payload;
      if (reportName) {
        delete state.errors[reportName];
      } else {
        state.errors = {};
      }
    },
  },
  extraReducers: (builder) => {
    // Team Lead Report
    builder
      .addCase(fetchTeamLeadReport.pending, (state, action) => {
        const { startDate, endDate } = action.meta.arg;
        const key = `teamLeadReport_${startDate}_${endDate}`;
        state.loading[key] = true;
        state.errors[key] = null;
      })
      .addCase(fetchTeamLeadReport.fulfilled, (state, action) => {
        const { reportName, data, startDate, endDate } = action.payload;
        const key = `${reportName}_${startDate}_${endDate}`;
        state.reportData[key] = data;
        state.loading[key] = false;
        state.errors[key] = null;
      })
      .addCase(fetchTeamLeadReport.rejected, (state, action) => {
        const { startDate, endDate } = action.meta.arg;
        const key = `teamLeadReport_${startDate}_${endDate}`;
        state.loading[key] = false;
        state.errors[key] = action.payload;
      })
      // Approval Count Report
      .addCase(fetchApprovalCountReport.pending, (state, action) => {
        const { startDate, endDate } = action.meta.arg;
        const key = `approvalCountReport_${startDate}_${endDate}`;
        state.loading[key] = true;
        state.errors[key] = null;
      })
      .addCase(fetchApprovalCountReport.fulfilled, (state, action) => {
        const { reportName, data, startDate, endDate } = action.payload;
        const key = `${reportName}_${startDate}_${endDate}`;
        state.reportData[key] = data;
        state.loading[key] = false;
        state.errors[key] = null;
      })
      .addCase(fetchApprovalCountReport.rejected, (state, action) => {
        const { startDate, endDate } = action.meta.arg;
        const key = `approvalCountReport_${startDate}_${endDate}`;
        state.loading[key] = false;
        state.errors[key] = action.payload;
      })
      // Flight Numbers Report
      .addCase(fetchFlightNumbersReport.pending, (state, action) => {
        const { startDate, endDate } = action.meta.arg;
        const key = `flightNumbersReport_${startDate}_${endDate}`;
        state.loading[key] = true;
        state.errors[key] = null;
      })
      .addCase(fetchFlightNumbersReport.fulfilled, (state, action) => {
        const { reportName, data, startDate, endDate } = action.payload;
        const key = `${reportName}_${startDate}_${endDate}`;
        state.reportData[key] = data;
        state.loading[key] = false;
        state.errors[key] = null;
      })
      .addCase(fetchFlightNumbersReport.rejected, (state, action) => {
        const { startDate, endDate } = action.meta.arg;
        const key = `flightNumbersReport_${startDate}_${endDate}`;
        state.loading[key] = false;
        state.errors[key] = action.payload;
      })
      // Pilot Revenue Report
      .addCase(fetchPilotRevenueReport.pending, (state, action) => {
        const { startDate, endDate } = action.meta.arg;
        const key = `pilotRevenueReport_${startDate}_${endDate}`;
        state.loading[key] = true;
        state.errors[key] = null;
      })
      .addCase(fetchPilotRevenueReport.fulfilled, (state, action) => {
        const { reportName, data, startDate, endDate } = action.payload;
        const key = `${reportName}_${startDate}_${endDate}`;
        state.reportData[key] = data;
        state.loading[key] = false;
        state.errors[key] = null;
      })
      .addCase(fetchPilotRevenueReport.rejected, (state, action) => {
        const { startDate, endDate } = action.meta.arg;
        const key = `pilotRevenueReport_${startDate}_${endDate}`;
        state.loading[key] = false;
        state.errors[key] = action.payload;
      })
      // Task Review Report
      .addCase(fetchTaskReviewReport.pending, (state, action) => {
        const { startDate, endDate } = action.meta.arg;
        const key = `taskReviewReport_${startDate}_${endDate}`;
        state.loading[key] = true;
        state.errors[key] = null;
      })
      .addCase(fetchTaskReviewReport.fulfilled, (state, action) => {
        const { reportName, data, startDate, endDate } = action.payload;
        const key = `${reportName}_${startDate}_${endDate}`;
        state.reportData[key] = data;
        state.loading[key] = false;
        state.errors[key] = null;
      })
      .addCase(fetchTaskReviewReport.rejected, (state, action) => {
        const { startDate, endDate } = action.meta.arg;
        const key = `taskReviewReport_${startDate}_${endDate}`;
        state.loading[key] = false;
        state.errors[key] = action.payload;
      })
      // Chart Data Group Reports (for CoveredAreas, PlanAreas, etc.)
      .addCase(fetchChartAllDataGroup.pending, (state, action) => {
        const { reportName, payload } = action.meta.arg;
        const key = `${reportName}_allData_${JSON.stringify(payload)}`;
        state.loading[key] = true;
        state.errors[key] = null;
      })
      .addCase(fetchChartAllDataGroup.fulfilled, (state, action) => {
        const { reportName, data, payload } = action.payload;
        const key = `${reportName}_allData_${JSON.stringify(payload)}`;
        state.reportData[key] = data;
        state.loading[key] = false;
        state.errors[key] = null;
      })
      .addCase(fetchChartAllDataGroup.rejected, (state, action) => {
        const { reportName, payload } = action.meta.arg;
        const key = `${reportName}_allData_${JSON.stringify(payload)}`;
        state.loading[key] = false;
        state.errors[key] = action.payload;
      })
      .addCase(fetchChartGroupDataGroup.pending, (state, action) => {
        const { reportName, payload } = action.meta.arg;
        const key = `${reportName}_groupData_${JSON.stringify(payload)}`;
        state.loading[key] = true;
        state.errors[key] = null;
      })
      .addCase(fetchChartGroupDataGroup.fulfilled, (state, action) => {
        const { reportName, data, payload } = action.payload;
        const key = `${reportName}_groupData_${JSON.stringify(payload)}`;
        state.reportData[key] = data;
        state.loading[key] = false;
        state.errors[key] = null;
      })
      .addCase(fetchChartGroupDataGroup.rejected, (state, action) => {
        const { reportName, payload } = action.meta.arg;
        const key = `${reportName}_groupData_${JSON.stringify(payload)}`;
        state.loading[key] = false;
        state.errors[key] = action.payload;
      })
      .addCase(fetchChartPlantationDataGroup.pending, (state, action) => {
        const { reportName, payload } = action.meta.arg;
        const key = `${reportName}_plantationData_${JSON.stringify(payload)}`;
        state.loading[key] = true;
        state.errors[key] = null;
      })
      .addCase(fetchChartPlantationDataGroup.fulfilled, (state, action) => {
        const { reportName, data, payload } = action.payload;
        const key = `${reportName}_plantationData_${JSON.stringify(payload)}`;
        state.reportData[key] = data;
        state.loading[key] = false;
        state.errors[key] = null;
      })
      .addCase(fetchChartPlantationDataGroup.rejected, (state, action) => {
        const { reportName, payload } = action.meta.arg;
        const key = `${reportName}_plantationData_${JSON.stringify(payload)}`;
        state.loading[key] = false;
        state.errors[key] = action.payload;
      })
      .addCase(fetchChartRegionDataGroup.pending, (state, action) => {
        const { reportName, payload } = action.meta.arg;
        const key = `${reportName}_regionData_${JSON.stringify(payload)}`;
        state.loading[key] = true;
        state.errors[key] = null;
      })
      .addCase(fetchChartRegionDataGroup.fulfilled, (state, action) => {
        const { reportName, data, payload } = action.payload;
        const key = `${reportName}_regionData_${JSON.stringify(payload)}`;
        state.reportData[key] = data;
        state.loading[key] = false;
        state.errors[key] = null;
      })
      .addCase(fetchChartRegionDataGroup.rejected, (state, action) => {
        const { reportName, payload } = action.meta.arg;
        const key = `${reportName}_regionData_${JSON.stringify(payload)}`;
        state.loading[key] = false;
        state.errors[key] = action.payload;
      });
  },
});

export const {
  setReportFilter,
  clearReportFilter,
  clearAllFilters,
  clearReportData,
  clearError,
} = reportsSlice.actions;

// Selectors
export const selectReportData = (state, reportName, startDate, endDate) => {
  const key = `${reportName}_${startDate}_${endDate}`;
  return state.reports.reportData[key] || null;
};

export const selectReportFilters = (state) => state.reports.filters;
export const selectReportFilter = (state, filterName) => state.reports.filters[filterName];
export const selectReportLoading = (state, reportName, startDate, endDate) => {
  const key = `${reportName}_${startDate}_${endDate}`;
  return state.reports.loading[key] || false;
};
export const selectReportError = (state, reportName, startDate, endDate) => {
  const key = `${reportName}_${startDate}_${endDate}`;
  return state.reports.errors[key] || null;
};

export default reportsSlice.reducer;

