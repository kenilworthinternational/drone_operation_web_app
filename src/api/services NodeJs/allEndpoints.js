/**
 * Node.js Backend API Services
 * 
 * This file imports and exports all Node.js backend API endpoints.
 * These APIs use a custom base query that points to the Node.js backend server.
 */

import { baseApi } from '../baseApi';

// Import and inject Node.js backend service endpoints
import './stockAssetsApi';
import './teamEquipmentApi';

// Export the complete API
export { baseApi };

// Re-export all hooks from Node.js backend services
export * from './stockAssetsApi';
export * from './teamEquipmentApi';

/**
 * Node.js Backend Services:
 * - Stock Assets Management (Suppliers, Categories, Inventory Items)
 * - Team Equipment Management (Remote Controls, Batteries, Generators, Drones)
 * - Temporary Allocations
 * 
 * Usage:
 * import { useGetSuppliersQuery, useGetRemoteControlsQuery, useGetPilotsWithTeamsQuery } from '../api/services NodeJs/allEndpoints';
 */

