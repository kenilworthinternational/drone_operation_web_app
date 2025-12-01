/**
 * Node.js Backend API Services
 * 
 * This file imports and exports all Node.js backend API endpoints.
 * These APIs use a custom base query that points to the Node.js backend server.
 */

import { baseApi } from '../baseApi';

// Import and inject Node.js backend service endpoints
import './stockAssetsApi';

// Export the complete API
export { baseApi };

// Re-export all hooks from Node.js backend services
export * from './stockAssetsApi';

/**
 * Node.js Backend Services:
 * - Stock Assets Management (Suppliers)
 * 
 * Usage:
 * import { useGetSuppliersQuery, useCreateSupplierMutation } from '../api/services NodeJs/allEndpoints';
 */

