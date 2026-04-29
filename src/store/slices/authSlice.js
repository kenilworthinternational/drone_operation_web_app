import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNodeBackendUrl } from '../../api/services NodeJs/nodeBackendConfig';
import { logger } from '../../utils/logger';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const AUTH_PUBLIC_BASE = `${getNodeBackendUrl()}/api/public/login`;

const parseApiMessage = (payload, fallback) =>
  payload?.message || payload?.error || fallback;

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
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const response = await fetch(`${AUTH_PUBLIC_BASE}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_no: phoneNumber }),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload?.status === true) {
        return {
          phoneNumber,
          verified: true,
          cooldown_seconds: Number(payload?.data?.cooldown_seconds || 60),
          expires_in_seconds: Number(payload?.data?.expires_in_seconds || 300),
        };
      }
      return rejectWithValue(parseApiMessage(payload, 'Failed to send OTP'));
    } catch (error) {
      return rejectWithValue(error.message || 'Verification failed');
    }
  }
);

export const sendOTPThunk = createAsyncThunk(
  'auth/sendOTP',
  async ({ phoneNumber }, { rejectWithValue }) => {
    const maxAttempts = 3;
    const endpoint = `${AUTH_PUBLIC_BASE}/request-otp`;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobile_no: phoneNumber,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (response.ok && payload?.status === true) {
          return {
            success: true,
            cooldown_seconds: Number(payload?.data?.cooldown_seconds || 60),
            expires_in_seconds: Number(payload?.data?.expires_in_seconds || 300),
          };
        }

        const statusCode = Number(response?.status || 0);
        const isRetryable = statusCode >= 500 || statusCode === 0;
        if (attempt < maxAttempts && isRetryable) {
          await sleep(attempt * 900);
          continue;
        }

        const apiMessage = parseApiMessage(payload, '');
        const fallback =
          statusCode >= 500
            ? 'OTP service is temporarily unavailable. Please try again in a few seconds.'
            : 'Failed to send OTP';
        return rejectWithValue(apiMessage || fallback);
      } catch (error) {
        if (attempt < maxAttempts) {
          await sleep(attempt * 900);
          continue;
        }
        const msg = error?.message || 'Failed to send OTP';
        return rejectWithValue(msg);
      }
    }
    return rejectWithValue('Failed to send OTP');
  }
);

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async ({ phoneNumber, otp }, { rejectWithValue }) => {
    try {
      const apiResponse = await fetch(`${AUTH_PUBLIC_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_no: phoneNumber, otp }),
      });
      const response = await apiResponse.json().catch(() => ({}));
      if (response?.login_status === true && response?.token) {
        // Store in localStorage
        localStorage.setItem('userData', JSON.stringify(response));
        localStorage.setItem('token', response.token);
        return response;
      }
      return rejectWithValue(parseApiMessage(response, 'Login failed. Invalid OTP.'));
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
      // Note: RTK Query cache clearing should be done in the component
      // using dispatch(baseApi.util.resetApiState()) before calling logout
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

