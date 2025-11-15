import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../../api/services/allEndpoints';
import { logger } from '../../utils/logger';

// Load initial state from localStorage
// Note: We load user data and token for API calls, but don't auto-authenticate
// User must go through login flow to set isAuthenticated to true
const loadInitialState = () => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return {
        user: parsed,
        token: parsed.token || localStorage.getItem('token') || null,
        isAuthenticated: !!(parsed.token || localStorage.getItem('token')),
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    logger.error('Error loading auth state from localStorage:', error);
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

// Async thunks using RTK Query
export const verifyUserThunk = createAsyncThunk(
  'auth/verifyUser',
  async (phoneNumber, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        baseApi.endpoints.verifyUser.initiate(phoneNumber)
      );
      if (result.data?.status === 'true') {
        return { phoneNumber, verified: true };
      }
      return rejectWithValue('Not a verified user.');
    } catch (error) {
      return rejectWithValue(error.message || 'Verification failed');
    }
  }
);

export const sendOTPThunk = createAsyncThunk(
  'auth/sendOTP',
  async ({ phoneNumber, otpCode }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        baseApi.endpoints.sendOTP.initiate({ mobile_no: phoneNumber, otp: otpCode })
      );
      if (result.data?.status === 'true') {
        return { success: true };
      }
      return rejectWithValue('Failed to send OTP');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send OTP');
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (phoneNumber, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        baseApi.endpoints.loginUser.initiate(phoneNumber)
      );
      const response = result.data;
      if (response?.login_status === true && response?.token) {
        // Store in localStorage
        localStorage.setItem('userData', JSON.stringify(response));
        localStorage.setItem('token', response.token);
        return response;
      }
      return rejectWithValue('Login failed. Invalid credentials.');
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setOTP: (state, action) => {
      state.otp = action.payload;
    },
    clearOTP: (state) => {
      state.otp = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify User
      .addCase(verifyUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.phoneNumber = action.payload.phoneNumber;
      })
      .addCase(verifyUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send OTP
      .addCase(sendOTPThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTPThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOTPThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login User
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setOTP, clearOTP } = authSlice.actions;
export default authSlice.reducer;

