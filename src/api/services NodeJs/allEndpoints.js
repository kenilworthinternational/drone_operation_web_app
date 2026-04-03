/**
 * Node.js Backend API Services
 * 
 * This file imports and exports all Node.js backend API endpoints.
 * These APIs use a custom base query that points to the Node.js backend server.
 */

import { baseApi } from '../baseApi';

// Import and inject Node.js backend service endpoints
import './stockAssetsApi';
import './centralProcurementApi';
import './fleetEquipmentApi';
import './pilotAssignmentApi';
import './accidentReportsApi';
import './jdManagementApi';
import './plantationDashboardApi';
import './fieldSizeAdjustmentsApi';
import './mappingHierarchyApi';
import './fieldHistoryApi';
import './vehicleAppApi';

// Export the complete API
export { baseApi };

// Re-export all hooks from Node.js backend services
export * from './stockAssetsApi';
export * from './centralProcurementApi';
export * from './fleetEquipmentApi';
export * from './pilotAssignmentApi';
export * from './accidentReportsApi';
export * from './jdManagementApi';
export * from './plantationDashboardApi';
export * from './fieldSizeAdjustmentsApi';
export * from './mappingHierarchyApi';
export * from './fieldHistoryApi';
export * from './vehicleAppApi';

/**
 * Node.js Backend Services:
 * - Stock Assets Management (Suppliers, Categories, Inventory Items)
 * - Fleet Equipment Management (Remote Controls, Batteries, Generators, Drones)
 * - Temporary Equipment Allocations
 * - Accident Reports Management
 * 
 * Usage:
 * import { useGetSuppliersQuery, useGetFleetRemoteControlsQuery, useGetFleetPilotsWithTeamsQuery, useGetAccidentReportsQuery } from '../api/services NodeJs/allEndpoints';
 */

