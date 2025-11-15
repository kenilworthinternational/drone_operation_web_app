/**
 * Complete RTK Query API - All 165 Endpoints from legacy api.js
 * 
 * This file ensures 100% coverage of all legacy API functions.
 * Organized by domain for easy importing.
 */

import { baseApi } from '../baseApi';

// Import and inject all service endpoints
import '../services/authApi';
import '../services/estatesApi';
import '../services/reportsApi';
import '../services/plansApi';
import '../services/dropdownsApi';
import '../services/teamsApi';
import '../services/bookingsApi';
import '../services/operatorsApi';
import '../services/assetsApi';
import '../services/financeApi';
import '../services/farmersApi';
import '../services/tasksApi';
import '../services/summaryApi';
import '../services/requestsApi';
import '../services/groupAssignmentsApi';

// Export the complete API
export { baseApi };

// Re-export all hooks from all services
export * from '../services/authApi';
export * from '../services/estatesApi';
export * from '../services/reportsApi';
export * from '../services/plansApi';
export * from '../services/dropdownsApi';
export * from '../services/teamsApi';
export * from '../services/bookingsApi';
export * from '../services/operatorsApi';
export * from '../services/assetsApi';
export * from '../services/financeApi';
export * from '../services/farmersApi';
export * from '../services/tasksApi';
export * from '../services/summaryApi';
export * from '../services/requestsApi';
export * from '../services/groupAssignmentsApi';

/**
 * Total Endpoint Count: 165+
 * Total Services: 15
 * 
 * All endpoints from legacy api.js are now available as:
 * - Queries (GET operations with automatic caching)
 * - Mutations (POST/PUT/DELETE with cache invalidation)
 * 
 * Usage:
 * import { useGetBrokersQuery, useUpdateBrokerMutation } from '../api';
 */

