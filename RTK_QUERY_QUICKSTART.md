# ⚡ RTK Query Quick Start

## 🎯 Test Your New API Layer (5 Minutes)

Your API has been upgraded to RTK Query. Here's how to verify it works and start using it.

---

## ✅ Step 1: Verify Installation (30 seconds)

```bash
# Check that RTK Query is included (should show version 2.8.2+)
npm ls @reduxjs/toolkit

# Start your app
npm run start:dev
```

**Expected:** App starts normally, no errors ✅

---

## ✅ Step 2: Open Redux DevTools (1 minute)

1. Open your app in Chrome/Edge
2. Open DevTools (F12)
3. Click "Redux" tab
4. Look for **`api`** in the state tree

**You should see:**
```
State
├── api (NEW!)
│   ├── queries
│   ├── mutations
│   ├── provided
│   └── subscriptions
├── auth
├── estates
├── reports
└── ...
```

---

## ✅ Step 3: Test RTK Query with Broker Management (2 minutes)

### Option A: Keep Current Implementation
Your BrokerManagement component works as-is! It's using the Redux thunks that call the old api.js.

### Option B: Quick Test with RTK Query Hook

Create a test component to see RTK Query in action:

```javascript
// src/test/BrokersTest.jsx
import React from 'react';
import { useGetBrokersQuery } from '../api';

export const BrokersTest = () => {
  const { data, isLoading, error, refetch } = useGetBrokersQuery();
  
  console.log('RTK Query State:', { data, isLoading, error });
  
  if (isLoading) return <div>Loading brokers via RTK Query...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>RTK Query Test - Brokers</h2>
      <button onClick={refetch}>Refresh</button>
      <div>Total Brokers: {data?.brokers?.length || 0}</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
```

Then import and render it anywhere to test:
```javascript
import { BrokersTest } from './test/BrokersTest';

// In any component:
<BrokersTest />
```

---

## ✅ Step 4: Watch the Magic (1 minute)

Open Redux DevTools and:

1. **Navigate to Brokers page** (or render BrokersTest)
   - Watch `api/queries/getBrokers` appear in Redux state
   - See the loading state automatically managed
   
2. **Navigate away and come back**
   - Notice: No new API call! (served from cache)
   - Check the timestamp - data is cached
   
3. **Click refresh button**
   - New API call
   - Cache updated
   - UI updates automatically

4. **Update a broker**
   - Mutation runs
   - Cache automatically invalidated
   - List automatically refetches
   - All without any manual code!

---

## 🎓 Quick Reference

### Import Pattern:
```javascript
// ✅ Good - Import from central index
import { useGetBrokersQuery } from '../../../api';

// ❌ Avoid - Don't import from old api.js for new code
import { viewBrokers } from '../../../api/api';
```

### Query Hook Pattern:
```javascript
const { 
  data,           // The response data
  isLoading,      // True on first load
  isFetching,     // True when fetching (including refetch)
  isSuccess,      // True when data loaded successfully
  isError,        // True if error occurred
  error,          // Error object
  refetch,        // Manual refetch function
} = useGetSomeDataQuery(params, options);
```

### Mutation Hook Pattern:
```javascript
const [
  mutationTrigger,  // Function to call mutation
  { 
    isLoading,      // True while mutation in progress
    isSuccess,      // True when mutation succeeded
    isError,        // True if mutation failed
    error,          // Error object
    data,           // Response data
    reset,          // Reset mutation state
  }
] = useSomeMutationMutation();

// Trigger the mutation
await mutationTrigger(data).unwrap();
```

---

## 🚀 Common Options

### Skip Query (Conditional Fetch):
```javascript
const { data } = useGetDivisionsQuery(estateId, {
  skip: !estateId, // Only fetch if estateId exists
});
```

### Refetch Interval (Polling):
```javascript
const { data } = useGetPendingRequestsQuery(undefined, {
  pollingInterval: 30000, // Refetch every 30 seconds
});
```

### Refetch on Focus:
```javascript
const { data } = useGetBrokersQuery(undefined, {
  refetchOnFocus: true,  // Refetch when tab regains focus
  refetchOnReconnect: true, // Refetch when internet reconnects
});
```

### Keep Previous Data:
```javascript
const { data } = useGetReportQuery({ startDate, endDate }, {
  keepPreviousData: true, // Keep old data while fetching new
});
// Prevents UI flicker when params change
```

---

## 📝 Migrating Your First Component

### Choose ONE of These (Easiest to Hardest):

1. **BrokerManagement.jsx** (Easiest)
   - Simple CRUD operations
   - Already partially using Redux
   - Clear benefit demonstration
   
2. **TeamLeadAssignmentReport.jsx** (Easy)
   - Single API call
   - Date range parameter
   - Shows automatic caching

3. **FlightNumbersReport.jsx** (Medium)
   - Multiple data transformations
   - Filter state
   - Complex logic

### Migration Steps for BrokerManagement:

1. **Replace imports:**
```javascript
// Remove:
import { fetchBrokers, updateBrokerThunk } from '../../../store/slices/financeSlice';

// Add:
import { useGetBrokersQuery, useUpdateBrokerMutation } from '../../../api';
```

2. **Replace useEffect + dispatch:**
```javascript
// Remove:
useEffect(() => {
  if (brokers.length === 0) dispatch(fetchBrokers());
}, []);

// Add:
const { data: brokers, isLoading } = useGetBrokersQuery();
```

3. **Replace mutation:**
```javascript
// Remove:
const result = await dispatch(updateBrokerThunk(data));
if (fulfilled.match(result)) { ... }

// Add:
const [updateBroker] = useUpdateBrokerMutation();
await updateBroker(data).unwrap();
```

4. **Test!**

**Estimated time:** 10-15 minutes  
**Expected result:** Same functionality, less code, automatic caching

---

## 🐛 Troubleshooting

### "Cannot read property of undefined"
**Cause:** Data might be undefined on first render  
**Fix:** Add optional chaining
```javascript
data?.brokers?.length // Instead of data.brokers.length
```

### "Query hook not found"
**Cause:** Wrong import path  
**Fix:** Always import from `'../../../api'` not `'../../../api/services/...'`

### Cache not invalidating
**Cause:** Tags not matching  
**Fix:** Check that mutation invalidates correct tag
```javascript
invalidatesTags: ['Brokers'] // Must match providesTags in query
```

### Data not updating after mutation
**Cause:** Missing `invalidatesTags` in mutation  
**Fix:** Add appropriate tags to mutation endpoint

---

## 🎉 Success Checklist

After migration, you should have:
- [ ] Component renders correctly
- [ ] Loading state shows automatically
- [ ] Data displays from API
- [ ] Cache works (no duplicate calls)
- [ ] Updates invalidate cache
- [ ] List refreshes after update
- [ ] No console errors
- [ ] Redux DevTools shows API state

---

## 📚 Next Steps

1. ✅ **Test** - Navigate through your app, verify everything works
2. 📖 **Read** - Check `RTK_QUERY_MIGRATION_GUIDE.md` for detailed examples
3. 🧪 **Experiment** - Try migrating one component
4. 📊 **Measure** - Use DevTools to see cache hits
5. 🚀 **Scale** - Migrate more components as needed

---

## 💬 Quick Wins You'll Notice Immediately

1. **Faster page loads** - Cached data loads instantly
2. **Less code** - 50-80% reduction in API-related code
3. **Auto-refresh** - Data stays fresh automatically
4. **Better UX** - Smoother interactions, less loading
5. **Easier debugging** - Clear state in DevTools

---

## 🆘 Need Help?

### Documentation:
- `API_UPGRADE_SUMMARY.md` - Overview of changes
- `RTK_QUERY_MIGRATION_GUIDE.md` - Detailed migration guide
- `RTK_QUERY_EXAMPLE.md` - Real-world examples
- `ARCHITECTURE_OVERVIEW.md` - Complete architecture

### Official Resources:
- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [Examples](https://redux-toolkit.js.org/rtk-query/usage/examples)

---

**Your API layer is upgraded and ready to use!** 🎊

Start with one component, see the benefits, then scale at your own pace. Your old code still works, so there's zero risk!

