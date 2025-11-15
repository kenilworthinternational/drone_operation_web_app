import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../../api/services/allEndpoints';

// Async thunks using RTK Query
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.getTeamData.initiate());
      const response = result.data;
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && response.data) {
        return response.data;
      }
      return rejectWithValue('Invalid response format for teams');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch teams');
    }
  }
);

export const fetchTeamPlannedData = createAsyncThunk(
  'teams/fetchTeamPlannedData',
  async (date, { dispatch, rejectWithValue }) => {
    try {
      const formattedDate = typeof date === 'string' ? date : date.toLocaleDateString('en-CA');
      const result = await dispatch(baseApi.endpoints.getTeamPlannedData.initiate({ date: formattedDate }));
      const response = result.data;
      if (response && response.status === 'true') {
        return { date: formattedDate, data: response };
      }
      return rejectWithValue('Failed to fetch team planned data');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch team planned data');
    }
  }
);

export const assignTeamToPlan = createAsyncThunk(
  'teams/assignTeamToPlan',
  async ({ planId, teamId, date }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(baseApi.endpoints.addTeamToPlan.initiate({ plan: planId, team: teamId }));
      const response = result.data;
      if (response?.status === 'true') {
        return { planId, teamId, date, response };
      }
      return rejectWithValue(response?.message || 'Failed to assign team');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to assign team');
    }
  }
);

const teamsSlice = createSlice({
  name: 'teams',
  initialState: {
    teams: [],
    teamPlannedData: {}, // Keyed by date
    selectedTeam: null,
    assignedTeams: {}, // Keyed by planId
    loading: {
      teams: false,
      plannedData: false,
      assignTeam: false,
    },
    error: null,
  },
  reducers: {
    setSelectedTeam: (state, action) => {
      state.selectedTeam = action.payload;
    },
    setAssignedTeam: (state, action) => {
      const { planId, teamId } = action.payload;
      state.assignedTeams[planId] = teamId;
    },
    clearTeams: (state) => {
      state.teams = [];
      state.selectedTeam = null;
      state.assignedTeams = {};
    },
    clearTeamPlannedData: (state) => {
      state.teamPlannedData = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading.teams = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading.teams = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading.teams = false;
        state.error = action.payload;
      })
      // Fetch Team Planned Data
      .addCase(fetchTeamPlannedData.pending, (state) => {
        state.loading.plannedData = true;
        state.error = null;
      })
      .addCase(fetchTeamPlannedData.fulfilled, (state, action) => {
        state.loading.plannedData = false;
        state.teamPlannedData[action.payload.date] = action.payload.data;
      })
      .addCase(fetchTeamPlannedData.rejected, (state, action) => {
        state.loading.plannedData = false;
        state.error = action.payload;
      })
      // Assign Team to Plan
      .addCase(assignTeamToPlan.pending, (state) => {
        state.loading.assignTeam = true;
        state.error = null;
      })
      .addCase(assignTeamToPlan.fulfilled, (state, action) => {
        state.loading.assignTeam = false;
        state.assignedTeams[action.payload.planId] = action.payload.teamId;
      })
      .addCase(assignTeamToPlan.rejected, (state, action) => {
        state.loading.assignTeam = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedTeam,
  setAssignedTeam,
  clearTeams,
  clearTeamPlannedData,
  clearError,
} = teamsSlice.actions;

// Selectors
export const selectTeams = (state) => state.teams.teams;
export const selectSelectedTeam = (state) => state.teams.selectedTeam;
export const selectTeamPlannedDataByDate = (state, date) => {
  const formattedDate = typeof date === 'string' ? date : date.toLocaleDateString('en-CA');
  return state.teams.teamPlannedData[formattedDate] || null;
};
export const selectAssignedTeamByPlan = (state, planId) =>
  state.teams.assignedTeams[planId] || null;

export default teamsSlice.reducer;

