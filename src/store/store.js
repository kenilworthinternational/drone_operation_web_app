import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import estatesReducer from './slices/estatesSlice';
import teamsReducer from './slices/teamsSlice';
import plansReducer from './slices/plansSlice';
import uiReducer from './slices/uiSlice';
import operatorsReducer from './slices/operatorsSlice';
import bookingsReducer from './slices/bookingsSlice';
import reportsReducer from './slices/reportsSlice';
import assetsReducer from './slices/assetsSlice';
import financeReducer from './slices/financeSlice';
import pilotPerformanceReducer from '../components/pilotPerformanceSlice';
import pilotPerformanceReducer2 from '../components/pilotPerformanceSlice2';
import permissionsReducer from './slices/permissionsSlice';
import { baseApi } from '../api/services/allEndpoints';

export const store = configureStore({
  reducer: {
    // RTK Query API reducer
    [baseApi.reducerPath]: baseApi.reducer,
    // Regular Redux slices
    auth: authReducer,
    estates: estatesReducer,
    teams: teamsReducer,
    plans: plansReducer,
    ui: uiReducer,
    operators: operatorsReducer,
    bookings: bookingsReducer,
    reports: reportsReducer,
    assets: assetsReducer,
    finance: financeReducer,
    pilotPerformance: pilotPerformanceReducer,
    pilotPerformance2: pilotPerformanceReducer2,
    permissions: permissionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['ui/setSelectedImage'],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.date',
          'payload.image',
          'meta.baseQueryMeta',
          'meta.arg',
        ],
        // Ignore these paths in the state
        ignoredPaths: ['ui.selectedImage', 'ui.selectedDate'],
      },
    }).concat(baseApi.middleware),
});

