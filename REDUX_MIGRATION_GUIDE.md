# Redux Migration Guide for Sections Folder

This document outlines the Redux migration status and patterns for components in the `src/sections` folder.

## ✅ Completed Migrations

### Core Infrastructure
- ✅ Redux Store Setup (`src/store/store.js`)
- ✅ Auth Slice (`src/store/slices/authSlice.js`)
- ✅ Estates Slice (`src/store/slices/estatesSlice.js`)
- ✅ Teams Slice (`src/store/slices/teamsSlice.js`)
- ✅ Plans Slice (`src/store/slices/plansSlice.js`)
- ✅ UI Slice (`src/store/slices/uiSlice.js`)
- ✅ Operators Slice (`src/store/slices/operatorsSlice.js`)
- ✅ Bookings Slice (`src/store/slices/bookingsSlice.js`)

### Migrated Components
1. ✅ **Login** (`src/pages/Login.jsx`) - Full Redux auth migration
2. ✅ **App.js** - ProtectedRoute uses Redux auth
3. ✅ **FieldHistory** (`src/sections/management/ops/FieldHistory.jsx`) - Estates, divisions, UI state
4. ✅ **OpsAssign** (`src/sections/opsroom/operators/OpsAssign.jsx`) - Operators, plans

## 📋 Migration Patterns

### Pattern 1: Using Redux for Shared Data

**Before:**
```javascript
const [estates, setEstates] = useState([]);
useEffect(() => {
  const fetchEstates = async () => {
    const response = await displayEstate();
    setEstates(response);
  };
  fetchEstates();
}, []);
```

**After:**
```javascript
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchEstates, selectEstates } from '../../../store/slices/estatesSlice';

const dispatch = useAppDispatch();
const estates = useAppSelector(selectEstates);

useEffect(() => {
  dispatch(fetchEstates());
}, [dispatch]);
```

### Pattern 2: Using Redux for UI State

**Before:**
```javascript
const [startDate, setStartDate] = useState('');
const [selectedFlag, setSelectedFlag] = useState('');
```

**After:**
```javascript
import { setStartDate, setSelectedFlag, selectStartDate, selectSelectedFlag } from '../../../store/slices/uiSlice';

const startDate = useAppSelector(selectStartDate);
const selectedFlag = useAppSelector(selectSelectedFlag);

// To update:
dispatch(setStartDate(newDate));
dispatch(setSelectedFlag(newFlag));
```

### Pattern 3: Using Redux for Async Operations

**Before:**
```javascript
const handleAssign = async () => {
  setLoading(true);
  try {
    const response = await assignOperator(planId, operatorId);
    if (response.status === 'true') {
      // Update local state
    }
  } finally {
    setLoading(false);
  }
};
```

**After:**
```javascript
import { assignOperatorToPlan } from '../../../store/slices/operatorsSlice';

const handleAssign = async () => {
  const result = await dispatch(assignOperatorToPlan({ planId, operatorId }));
  if (assignOperatorToPlan.fulfilled.match(result)) {
    // Success handling
  }
};
```

## 🔄 Components to Migrate

### High Priority (Frequently Used)

#### Management/Bookings
- [ ] **BookingList.jsx** - Use `bookingsSlice` for dropdown data
- [ ] **NewServices.jsx** - Use `estatesSlice` for estates/divisions
- [ ] **CreateBookings.jsx** - Wrapper, already uses NewServices
- [ ] **AscBookings.jsx** - Similar to CreateBookings
- [ ] **BookingsCalender.jsx** - Use `plansSlice` and `uiSlice`

#### Opsroom
- [ ] **DayEndProcess.jsx** - Use `plansSlice` for plans data
- [ ] **DayEndProcessAsc.jsx** - Similar to DayEndProcess
- [ ] **WorkflowDashboard.jsx** - Can use Redux for counts (or keep React Query)
- [ ] **PlanCalendar.jsx** - Use `plansSlice` and `uiSlice`
- [ ] **RequestsQueueMain.jsx** - Use Redux for request state
- [ ] **RequestProceed.jsx** - Use Redux for request processing

#### Finance
- [ ] **Earnings.jsx** - Use Redux for pilot data and filters
- [ ] **Brokers.jsx** - Use `bookingsSlice` for brokers data
- [ ] **BrokerManagement.jsx** - Use `bookingsSlice`
- [ ] **BrokerRegistration.jsx** - Use `bookingsSlice`

#### HR & Admin
- [ ] **Assets.jsx** - Create `assetsSlice` or use existing patterns
- [ ] **AssetsRegistration.jsx** - Use assets slice

### Medium Priority (Reports)

#### Corporate Charts
All report components can benefit from:
- Using `uiSlice` for date filters
- Using `estatesSlice` for estate/division filters
- Caching report data in Redux

- [ ] **CEOPlanAreasReport.jsx**
- [ ] **CEOCoveredAreasReport.jsx**
- [ ] **CEOUpcomingPlansReport.jsx**
- [ ] **CoveredAreasReport.jsx**
- [ ] **PilotSummaryReport.jsx**
- [ ] **PilotPerformanceOpsReport.jsx**
- [ ] **PilotPerformancePilotReport.jsx**
- [ ] **TaskReviewManagement.jsx**
- [ ] And other report components...

#### Opsroom Reports
- [ ] **PilotPerformanceByDateOpsRoom.jsx**
- [ ] **PilotPerformanceByDatePilot.jsx**
- [ ] **PilotSummaryOpsRoomData.jsx**
- [ ] **PilotSummaryPilotData.jsx**
- [ ] **OperationsReportLeaderWise.jsx**
- [ ] **OperationsReportPlanWise.jsx**
- [ ] And other report components...

## 🛠️ Migration Steps for Each Component

1. **Identify State to Migrate**
   - Shared data (estates, operators, teams) → Redux slices
   - UI state (filters, dates, modals) → `uiSlice`
   - Component-specific state → Keep as `useState`

2. **Import Redux Hooks and Actions**
   ```javascript
   import { useAppDispatch, useAppSelector } from '../../../store/hooks';
   import { fetchEstates, selectEstates } from '../../../store/slices/estatesSlice';
   ```

3. **Replace useState with useAppSelector**
   ```javascript
   // Before
   const [estates, setEstates] = useState([]);
   
   // After
   const estates = useAppSelector(selectEstates);
   ```

4. **Replace API Calls with Redux Thunks**
   ```javascript
   // Before
   const fetchData = async () => {
     const response = await apiCall();
     setData(response);
   };
   
   // After
   useEffect(() => {
     dispatch(fetchDataThunk());
   }, [dispatch]);
   ```

5. **Update Event Handlers**
   ```javascript
   // Before
   const handleChange = (value) => {
     setSelectedValue(value);
   };
   
   // After
   const handleChange = (value) => {
     dispatch(setSelectedValue(value));
   };
   ```

6. **Test the Component**
   - Verify data loads correctly
   - Check that state updates work
   - Ensure no console errors

## 📝 Notes

- **Keep React Query** for components that benefit from automatic refetching and caching (like WorkflowDashboard)
- **Keep Local State** for component-specific UI state (modals, form inputs, temporary values)
- **Use Redux** for data shared across multiple components
- **Use Redux** for complex state logic that benefits from centralized management

## 🚀 Quick Migration Template

```javascript
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchEstates,
  selectEstates,
  selectSelectedEstate,
  setSelectedEstate,
} from '../../../store/slices/estatesSlice';
import {
  setStartDate,
  setEndDate,
  selectStartDate,
  selectEndDate,
} from '../../../store/slices/uiSlice';

const YourComponent = () => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const estates = useAppSelector(selectEstates);
  const selectedEstate = useAppSelector(selectSelectedEstate);
  const startDate = useAppSelector(selectStartDate);
  const endDate = useAppSelector(selectEndDate);
  
  // Local component state (UI-specific)
  const [localState, setLocalState] = useState('');
  
  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchEstates());
  }, [dispatch]);
  
  // Handle changes
  const handleEstateChange = (estate) => {
    dispatch(setSelectedEstate(estate));
  };
  
  return (
    // Your JSX
  );
};

export default YourComponent;
```

## ✅ Benefits Achieved

1. **Centralized State** - No more prop drilling
2. **Shared Data** - Estates, divisions, operators loaded once, used everywhere
3. **Better Performance** - Selective subscriptions prevent unnecessary re-renders
4. **Easier Debugging** - Redux DevTools shows all state changes
5. **Predictable Updates** - Single source of truth for application state

