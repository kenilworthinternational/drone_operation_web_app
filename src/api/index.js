/**
 * RTK Query API Services
 * 
 * This is the new modern API layer using RTK Query.
 * Benefits:
 * - Automatic caching and cache invalidation
 * - Built-in loading and error states
 * - Optimistic updates
 * - Automatic refetching
 * - Request deduplication
 * - TypeScript-ready
 */

// Base API
export { baseApi } from './baseApi';

// API Services - Import all hooks
export * from './services/authApi';
export * from './services/estatesApi';
export * from './services/reportsApi';
export * from './services/plansApi';
export * from './services/dropdownsApi';
export * from './services/teamsApi';
export * from './services/bookingsApi';
export * from './services/operatorsApi';
export * from './services/assetsApi';
export * from './services/financeApi';
export * from './services/farmersApi';
export * from './services/tasksApi';
export * from './services/summaryApi';
export * from './services/requestsApi';
export * from './services/groupAssignmentsApi';

/**
 * Legacy API Functions (Deprecated)
 * 
 * The old api.js functions are still available for backward compatibility.
 * Gradually migrate components to use the new RTK Query hooks above.
 * 
 * Example Migration:
 * 
 * OLD WAY (api.js):
 * ```javascript
 * import { getTeamLeadReport } from '../api/api';
 * 
 * const fetchData = async () => {
 *   setLoading(true);
 *   const result = await getTeamLeadReport(startDate, endDate);
 *   setData(result);
 *   setLoading(false);
 * };
 * ```
 * 
 * NEW WAY (RTK Query):
 * ```javascript
 * import { useGetTeamLeadReportQuery } from '../api';
 * 
 * const { data, isLoading, error } = useGetTeamLeadReportQuery({
 *   startDate,
 *   endDate
 * });
 * // Data is automatically cached, refetched, and managed!
 * ```
 */

