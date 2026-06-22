# DSMS Web — API & Resource Usage Report

Generated: 2026-06-22T12:17:43.740Z

> Read-only audit. No code was changed.

## Summary

| Metric | Count |
|--------|------:|
| RTK endpoints defined | 690 |
| RTK endpoints **used** in UI | 571 |
| RTK endpoints **unused** (defined only in api/) | 119 |
| PHP-backed endpoints (used / unused) | 119 / 31 |
| Node-backed endpoints (used / unused) | 452 / 88 |
| Direct `fetch()` / template URL calls | 55 |

## Base URL locations

| Backend | Dev | Prod | Config |
|---------|-----|------|--------|
| **PHP** | https://drone-admin-test.kenilworthinternational.com/api/ | https://drone-admin.kenilworthinternational.com/api/ | `src/config/config.js (API_BASE_URL)` |
| **Node** | https://dsms-web-api-dev.kenilworthinternational.com | https://dsms-web-api.kenilworthinternational.com | `src/api/services NodeJs/nodeBackendConfig.js (getNodeBackendUrl)` |

---

## Used APIs

### `addBroker` (php, mutation)
- **URL:** `add_broker` · **POST**
- **Defined in:** `src/api/services/financeApi.js`
- **Used in:** `src/sections/finance/brokers/BrokerRegistration.jsx`

### `addDroneOrPilotToPool` (php, mutation)
- **URL:** `add_team_pilot_drone` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/misc/teamAllocationBottom.jsx`, `src/features/nonp/nonpTeamAllocationBottom.jsx`

### `addDroneOrPilotToPoolNonPlantation` (php, mutation)
- **URL:** `add_non_plantaion_team_pilot_drone` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/nonp/nonpTeamAllocationBottom.jsx`

### `addFarmer` (php, mutation)
- **URL:** `add_farmer` · **POST**
- **Defined in:** `src/api/services/farmersApi.js`
- **Used in:** `src/sections/management/bookings/AscBookings.jsx`

### `addPilotRevenue` (php, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services/financeApi.js`
- **Used in:** `src/store/slices/financeSlice.js`

### `addTeamToPlan` (php, mutation)
- **URL:** `add_team_to_plan` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/misc/teamAllocation.jsx`, `src/store/slices/teamsSlice.js`

### `applyEmployeeAssignment` (node, mutation)
- **URL:** `/api/employee-assignment/apply` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeAssignment.jsx`

### `approveFieldUnblockRequest` (node, mutation)
- **URL:** `/api/field-unblock-requests/${id}/approve` · **POST**
- **Defined in:** `src/api/services NodeJs/fieldUnblockRequestsApi.js`
- **Used in:** `src/sections/opsroom/field-unblock/FieldUnblockRequestQueue.jsx`

### `approveFuelGeneratorVoucher` (node, mutation)
- **URL:** `${BASE}/${id}/approve` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelGeneratorVoucherApi.js`
- **Used in:** `src/sections/strategic/StrategicFinanceApprovals.jsx`

### `approveFuelTransportVoucher` (node, mutation)
- **URL:** `/api/fuel-transport-vouchers/${id}/approve` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelTransportVoucherApi.js`
- **Used in:** `src/sections/strategic/StrategicFinanceApprovals.jsx`

### `approvePlanActivateRequest` (node, mutation)
- **URL:** `/api/plan-activate-requests/${id}/approve` · **POST**
- **Defined in:** `src/api/services NodeJs/planActivateRequestsApi.js`
- **Used in:** `src/sections/management/plans/PlanActivateRequestQueue.jsx`

### `approvePlantationMonthlyPlanRequest` (node, mutation)
- **URL:** `/api/plantation-monthly-plan-requests/${id}/approve` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/requests/MonthlyRequestProceed.jsx`

### `approvePlantationPlanRequest` (node, mutation)
- **URL:** `/api/plantation-plan-requests/${id}/approve` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/plantation-plan-requests/PlantationPlanRequestQueue.jsx`, `src/sections/opsroom/requests/RequestProceed.jsx`

### `approvePlantationPlanRescheduleRequest` (node, mutation)
- **URL:** `/api/plantation-plan-reschedule-requests/${id}/approve` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/requests/RequestProceed.jsx`

### `approveTransaction` (node, mutation)
- **URL:** `/api/financial-cards/transactions/approve` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financeApprovals/FinanceApprovals.jsx`

### `approveVehicleDate` (node, mutation)
- **URL:** `/api/vehicle-rent/approve/${id}` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/hr&admin/vehicleRentApprovals/VehicleRentApprovals.jsx`

### `assignFleetBattery` (node, mutation)
- **URL:** `/api/fleet-equipment/assign/battery` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `assignFleetDrone` (node, mutation)
- **URL:** `/api/fleet-equipment/assign/drone` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `assignFleetGenerator` (node, mutation)
- **URL:** `/api/fleet-equipment/assign/generator` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `assignFleetRemoteControl` (node, mutation)
- **URL:** `/api/fleet-equipment/assign/remote-control` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `assignOperatorToPlan` (php, mutation)
- **URL:** `assign_plan_to_operator` · **POST**
- **Defined in:** `src/api/services/operatorsApi.js`
- **Used in:** `src/store/slices/operatorsSlice.js`

### `assignPilotTransportDetails` (node, mutation)
- **URL:** `/api/pilot-assignment/transport/assign` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/pilot-assigment/PilotAssignment.jsx`, `src/sections/opsroom/pilot-assigment/TransportArrangePage.jsx`, `src/sections/transport/TransportHrDashboard.jsx`

### `assignPoolVehicleTask` (node, mutation)
- **URL:** `/api/pool-vehicle-tasks/requests/${id}/assign` · **POST**
- **Defined in:** `src/api/services NodeJs/poolVehicleTaskApi.js`
- **Used in:** `src/sections/transport/PoolVehicleTasksPanel.jsx`

### `bulkApprovePlantationMonthlyPlanRequests` (node, mutation)
- **URL:** `/api/plantation-monthly-plan-requests/bulk-approve` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/management/bookings/AcceptMonthlyPlansBoard.jsx`

### `bulkRejectPlantationMonthlyPlanRequests` (node, mutation)
- **URL:** `/api/plantation-monthly-plan-requests/bulk-reject` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/management/bookings/AcceptMonthlyPlansBoard.jsx`

### `bulkUpdateCategoryPermissions` (node, mutation)
- **URL:** `/api/feature-permissions/bulk-update` · **POST**
- **Defined in:** `src/api/services NodeJs/featurePermissionsApi.js`
- **Used in:** `src/sections/ict/authentication/AuthControls.jsx`

### `cancelTask` (node, mutation)
- **URL:** `/api/day-end-process/cancel-task` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `changeAssignmentPilot` (node, mutation)
- **URL:** `/api/emergency-moving/change-assignment-pilot` · **POST**
- **Defined in:** `src/api/services NodeJs/emergencyMovingApi.js`
- **Used in:** `src/sections/opsroom/emergency/EmergencyMoving.jsx`

### `changePlanStatus` (php, mutation)
- **URL:** `plan_change_status` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/features/calendar/CalenderWidget.jsx`

### `clearOpsCancel` (node, mutation)
- **URL:** `/api/day-end-process/clear-ops-cancel` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `createAdHocNotification` (node, mutation)
- **URL:** `/api/notifications/ad-hoc` · **POST**
- **Defined in:** `src/api/services NodeJs/notificationsApi.js`
- **Used in:** `src/sections/opsroom/requests/RequestProceed.jsx`

### `createAppVersion` (node, mutation)
- **URL:** `/api/app-versions/create` · **POST**
- **Defined in:** `src/api/services NodeJs/appVersionsApi.js`
- **Used in:** `src/sections/ict/appVersions/AppVersionManagement.jsx`

### `createBattery` (node, mutation)
- **URL:** `/api/stock-assets/create_battery` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`

### `createBookingPlan` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/bookingCreationApi.js`
- **Used in:** `src/sections/management/bookings/NewServices.jsx`

### `createCard` (node, mutation)
- **URL:** `/api/financial-cards/cards/create` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `createCentralStoreRequest` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/CentralStores.jsx`

### `createChemical` (node, mutation)
- **URL:** `/api/chemicals` · **POST**
- **Defined in:** `src/api/services NodeJs/chemicalsApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `createDrone` (node, mutation)
- **URL:** `/api/stock-assets/create_drone` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`

### `createEmployeeRegistration` (node, mutation)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`

### `createFleetTeam` (node, mutation)
- **URL:** `/api/fleet-equipment/create-team` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `createFuelGeneratorVoucher` (node, mutation)
- **URL:** `${BASE}/create` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelGeneratorVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `createFuelTransportVoucher` (node, mutation)
- **URL:** `/api/fuel-transport-vouchers/create` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelTransportVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `createGenerator` (node, mutation)
- **URL:** `/api/stock-assets/create_generator` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`

### `createGrn` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `createGroupAssignedMissions` (php, mutation)
- **URL:** `create_group_assigned_missions` · **POST**
- **Defined in:** `src/api/services/groupAssignmentsApi.js`
- **Used in:** `src/features/nonp/nonpTeamAllocation.jsx`

### `createHrMasterOption` (node, mutation)
- **URL:** `/api/hr-master-options` · **POST**
- **Defined in:** `src/api/services NodeJs/hrMasterOptionsApi.js`
- **Used in:** `src/sections/ict/masterData/HrMasterOptionsPanel.jsx`

### `createIctProject` (node, mutation)
- **URL:** `/api/ict-development/projects/create` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/SprintPlanning.jsx`

### `createIctQaBugReport` (node, mutation)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevelopmentBoard.jsx`

### `createIctSprint` (node, mutation)
- **URL:** `/api/ict-development/sprints/create` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/SprintPlanning.jsx`

### `createIctWorkItem` (node, mutation)
- **URL:** `/api/ict-development/work-items/create` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevelopmentBoard.jsx`, `src/sections/ict/development/ExtraWorkQueue.jsx`

### `createInventoryItem` (node, mutation)
- **URL:** `/api/stock-assets/inventory-items/create` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`

### `createMainCategory` (node, mutation)
- **URL:** `/api/stock-assets/main-categories/create` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`

### `createMaintenance` (node, mutation)
- **URL:** `/api/maintenance/create` · **POST**
- **Defined in:** `src/api/services NodeJs/maintenanceApi.js`
- **Used in:** `src/sections/administration/Maintenance.jsx`

### `createMaintenanceFromIncident` (node, mutation)
- **URL:** `/api/maintenance/from-incident/${incidentId}` · **POST**
- **Defined in:** `src/api/services NodeJs/maintenanceApi.js`
- **Used in:** `src/sections/administration/accident-reports/hooks/useIncidentReportsPage.js`

### `createMappingDivision` (node, mutation)
- **URL:** `/api/mapping-hierarchy/divisions/create` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `createMappingEstate` (node, mutation)
- **URL:** `/api/mapping-hierarchy/estates/create` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `createMappingField` (node, mutation)
- **URL:** `/api/mapping-hierarchy/fields/create` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `createMappingGroup` (node, mutation)
- **URL:** `/api/mapping-hierarchy/groups/create` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `createMappingPlantation` (node, mutation)
- **URL:** `/api/mapping-hierarchy/plantations/create` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `createMappingRegion` (node, mutation)
- **URL:** `/api/mapping-hierarchy/regions/create` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `createMission` (php, mutation)
- **URL:** `create_mission` · **POST**
- **Defined in:** `src/api/services/bookingsApi.js`
- **Used in:** `src/sections/management/bookings/AscBookings.jsx`

### `createMultipleUserJobDescriptions` (node, mutation)
- **URL:** `/api/user-job-descriptions/bulk` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/JDManagement.jsx`

### `createPilotAssignment` (node, mutation)
- **URL:** `/api/pilot-assignment/create` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/pilot-assigment/PilotAssignment.jsx`

### `createPlan` (php, mutation)
- **URL:** `create_plan` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/features/calendar/CalenderWidget.jsx`, `src/features/misc/UpdateServices.jsx`, `src/store/slices/bookingsSlice.js`, `src/store/slices/plansSlice.js`

### `createPlanApprovalNotification` (node, mutation)
- **URL:** `/api/notifications/plan-approval` · **POST**
- **Defined in:** `src/api/services NodeJs/notificationsApi.js`
- **Used in:** `src/sections/opsroom/requests/RequestProceed.jsx`

### `createPlantationInvoice` (node, mutation)
- **URL:** `/api/plantation-invoices` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationInvoiceApi.js`
- **Used in:** `src/sections/finance/reports/CreatePlantationInvoiceModal.jsx`

### `createPlantationPlanRequest` (node, mutation)
- **URL:** `/api/plantation-plan-requests` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/plantation/plantationDashboard/components/PlantationCalendar.jsx`

### `createPoolVehicleRequest` (node, mutation)
- **URL:** `/api/pool-vehicle-tasks/request` · **POST**
- **Defined in:** `src/api/services NodeJs/poolVehicleTaskApi.js`
- **Used in:** `src/sections/transport/PoolVehicleTasksPanel.jsx`

### `createProcurementRequest` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `createPurchaseOrder` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `createRemoteControl` (node, mutation)
- **URL:** `/api/stock-assets/create_remote_control` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`

### `createRescheduleNotification` (node, mutation)
- **URL:** `/api/notifications/reschedule` · **POST**
- **Defined in:** `src/api/services NodeJs/notificationsApi.js`
- **Used in:** `src/sections/opsroom/requests/RequestProceed.jsx`

### `createRfq` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `createSubCategory` (node, mutation)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`

### `createSubSubCategory` (node, mutation)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`

### `createSupplier` (node, mutation)
- **URL:** `/api/stock-assets/suppliers/create` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/SupplierRegistration.jsx`

### `createSupplierQuotation` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `createTempFleetAllocation` (node, mutation)
- **URL:** `/api/fleet-equipment/temp/create` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `createTimeOfDay` (node, mutation)
- **URL:** `/api/time-of-days` · **POST**
- **Defined in:** `src/api/services NodeJs/timeOfDaysApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `createTransaction` (node, mutation)
- **URL:** `/api/financial-cards/transactions` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `createUser` (node, mutation)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/ict/users/Users.jsx`

### `createUserJobDescription` (node, mutation)
- **URL:** `/api/user-job-descriptions/create` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/JDManagement.jsx`

### `createUserJobRole` (node, mutation)
- **URL:** `/api/user-job-roles/create` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/JDManagement.jsx`

### `createVehicle` (node, mutation)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`

### `createWorkSummaryPdfDocument` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/financeWorkSummaryBillingApi.js`
- **Used in:** `src/sections/finance/reports/EstateSprayedAreaReport.jsx`

### `deactivateBookingPlan` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/bookingCreationApi.js`
- **Used in:** `src/sections/management/bookings/BookingsCalender.jsx`

### `decideFuelApproval` (node, mutation)
- **URL:** `/api/fuel-approvals/decide` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelApprovalsApi.js`
- **Used in:** `src/sections/hr&admin/fuelApprovals/FuelApprovals.jsx`

### `decideGeneratorFuelApproval` (node, mutation)
- **URL:** `/api/generator-fuel-approvals/decide` · **POST**
- **Defined in:** `src/api/services NodeJs/generatorFuelApprovalsApi.js`
- **Used in:** `src/sections/hr&admin/fuelApprovals/GeneratorFuelApprovals.jsx`

### `decideVehicleAppMaintenanceRequest` (node, mutation)
- **URL:** `/api/vehicle-app/admin/maintenance-requests/${id}/decision` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `declineAccidentReport` (node, mutation)
- **URL:** `/api/accident-reports/${id}/decline` · **POST**
- **Defined in:** `src/api/services NodeJs/accidentReportsApi.js`
- **Used in:** `src/sections/administration/accident-reports/hooks/useIncidentReportsPage.js`

### `declineFieldUnblockRequest` (node, mutation)
- **URL:** `/api/field-unblock-requests/${id}/decline` · **POST**
- **Defined in:** `src/api/services NodeJs/fieldUnblockRequestsApi.js`
- **Used in:** `src/sections/opsroom/field-unblock/FieldUnblockRequestQueue.jsx`

### `declineFuelGeneratorVoucher` (node, mutation)
- **URL:** `${BASE}/${id}/decline` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelGeneratorVoucherApi.js`
- **Used in:** `src/sections/strategic/StrategicFinanceApprovals.jsx`

### `declineFuelGeneratorVoucherByFinance` (node, mutation)
- **URL:** `${BASE}/finance-decline` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelGeneratorVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `declineFuelTransportVoucher` (node, mutation)
- **URL:** `/api/fuel-transport-vouchers/${id}/decline` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelTransportVoucherApi.js`
- **Used in:** `src/sections/strategic/StrategicFinanceApprovals.jsx`

### `declineFuelTransportVoucherByFinance` (node, mutation)
- **URL:** `/api/fuel-transport-vouchers/finance-decline` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelTransportVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `declinePlanActivateRequest` (node, mutation)
- **URL:** `/api/plan-activate-requests/${id}/decline` · **POST**
- **Defined in:** `src/api/services NodeJs/planActivateRequestsApi.js`
- **Used in:** `src/sections/management/plans/PlanActivateRequestQueue.jsx`

### `declinePlantationMonthlyPlanRequest` (node, mutation)
- **URL:** `/api/plantation-monthly-plan-requests/${id}/decline` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/requests/MonthlyRequestProceed.jsx`

### `declinePlantationPlanRequest` (node, mutation)
- **URL:** `/api/plantation-plan-requests/${id}/decline` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/plantation-plan-requests/PlantationPlanRequestQueue.jsx`, `src/sections/opsroom/requests/RequestProceed.jsx`

### `declinePlantationPlanRescheduleRequest` (node, mutation)
- **URL:** `/api/plantation-plan-reschedule-requests/${id}/decline` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/requests/RequestProceed.jsx`

### `deleteBookingPlan` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/bookingCreationApi.js`
- **Used in:** `src/sections/management/bookings/BookingsCalender.jsx`

### `deleteCard` (node, mutation)
- **URL:** `/api/financial-cards/cards/${id}` · **DELETE**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `deleteDjiImage` (node, mutation)
- **URL:** `/api/dji-images/${id}` · **DELETE**
- **Defined in:** `src/api/services NodeJs/djiImagesApi.js`
- **Used in:** `src/sections/opsroom/dji/DjiMapUpload.jsx`

### `deleteEmployeeDocument` (node, mutation)
- **URL:** `/api/employee-documents/delete` · **POST**
- **Defined in:** `src/api/services NodeJs/employeeProfileApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeProfileDetails.jsx`

### `deleteEmployeeProfileSection` (node, mutation)
- **URL:** `/api/employee-profile/${section}/delete` · **POST**
- **Defined in:** `src/api/services NodeJs/employeeProfileApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeProfileDetails.jsx`, `src/sections/hr&admin/employeeProfile/FamilyDependentsSection.jsx`, `src/sections/hr&admin/employeeProfile/ProfileRecordWithFileSection.jsx`

### `deleteHrLeaveAdminEntitlement` (node, mutation)
- **URL:** `/api/hr-leave/admin/entitlements/delete` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeaveEntitlementPanel.jsx`

### `deleteUserJobDescription` (node, mutation)
- **URL:** `/api/user-job-descriptions/delete` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/JDManagement.jsx`

### `deleteUserJobRole` (node, mutation)
- **URL:** `/api/user-job-roles/delete` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/JDManagement.jsx`

### `finalizeQuotation` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `financeDecideVehicleMaintenanceRequest` (node, mutation)
- **URL:** `/api/vehicle-app/admin/maintenance-requests/${id}/finance-decision` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/finance/maintenance/MaintenanceFinance.jsx`

### `findDescriptionsByTaskText` (node, query)
- **URL:** `/api/user-job-descriptions/search/by-text` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/JDManagement.jsx`

### `forwardToPayroll` (node, mutation)
- **URL:** `/api/employee-registration/forward-to-payroll` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeProfileDetails.jsx`

### `getAccidentReportById` (node, query)
- **URL:** `/api/accident-reports/${id}` · **GET**
- **Defined in:** `src/api/services NodeJs/accidentReportsApi.js`
- **Used in:** `src/sections/administration/accident-reports/hooks/useIncidentReportsPage.js`

### `getAccidentReports` (node, query)
- **URL:** `/api/accident-reports` · **POST**
- **Defined in:** `src/api/services NodeJs/accidentReportsApi.js`
- **Used in:** `src/sections/administration/accident-reports/hooks/useIncidentReportsPage.js`

### `getAdvanceRequestsForFinance` (node, query)
- **URL:** `/api/vehicle-rent/advance-requests/finance-queue` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/finance/driverAdvance/DriverAdvanceFinance.jsx`, `src/sections/transport/TransportFinanceDashboard.jsx`

### `getAdvanceRequestsForHr` (node, query)
- **URL:** `/api/vehicle-rent/advance-requests/hr-queue` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/hr&admin/driverAdvanceApprovals/DriverAdvanceApprovals.jsx`, `src/sections/transport/TransportHrDashboard.jsx`

### `getAllDjiImages` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/djiImagesApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`, `src/sections/opsroom/dji/DjiMapUpload.jsx`

### `getAllDrones` (node, query)
- **URL:** `/api/emergency-moving/drones` · **POST**
- **Defined in:** `src/api/services NodeJs/emergencyMovingApi.js`
- **Used in:** `src/sections/opsroom/emergency/EmergencyMoving.jsx`

### `getAllEmployeeRegistrations` (node, query)
- **URL:** `/api/employee-registration/list` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeAssignment.jsx`, `src/sections/hr&admin/EmployeeProfileDetails.jsx`, `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`, `src/sections/hr&admin/leave/LeaveManagement.jsx`, `src/sections/hr&admin/roaster/RoasterPlanning.jsx`, `src/sections/ict/masterData/MasterData.jsx`, `src/sections/ict/users/Users.jsx`

### `getAllEstates` (php, query)
- **URL:** `display_all_estates` · **POST**
- **Defined in:** `src/api/services/estatesApi.js`
- **Used in:** `src/sections/opsroom/dji/DjiMapUpload.jsx`, `src/sections/plantation/plantationDashboard/PlantationDashboard.jsx`, `src/sections/plantation/plantationDashboard/pages/ChartBreakdownPage.jsx`, `src/store/slices/bookingsSlice.js`, `src/store/slices/estatesSlice.js`

### `getAllPlansByDateRange` (php, query)
- **URL:** `find_plan_by_all_date_range` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`

### `getAllPlantations` (php, query)
- **URL:** `display_all_plantation` · **POST**
- **Defined in:** `src/api/services/estatesApi.js`
- **Used in:** `src/components/PlantationEstateSelectWidget.jsx`, `src/sections/opsroom/reports/OperationsReportPlanWise.jsx`, `src/sections/plantation/plantationDashboard/PlantationDashboard.jsx`

### `getAllTeams` (node, query)
- **URL:** `/api/pilot-assignment/teams` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/pilot-assigment/PilotAssignment.jsx`

### `getAllUsers` (node, query)
- **URL:** `/api/users/list` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/ict/users/Users.jsx`

### `getApprovalCountReport` (php, query)
- **URL:** `pilots_subtask_and_aprroval_count` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/store/slices/reportsSlice.js`

### `getApprovedForFinance` (node, query)
- **URL:** `/api/vehicle-rent/approved-for-finance` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/finance/vehicleRent/VehicleRent.jsx`, `src/sections/transport/TransportFinanceDashboard.jsx`

### `getApprovedProcureQueue` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getAppVersions` (node, query)
- **URL:** `/api/app-versions/list` · **POST**
- **Defined in:** `src/api/services NodeJs/appVersionsApi.js`
- **Used in:** `src/sections/ict/appVersions/AppVersionManagement.jsx`

### `getASCBookingsByDateRange` (php, query)
- **URL:** `search_mission_by_requested_date_range` · **POST**
- **Defined in:** `src/api/services/bookingsApi.js`
- **Used in:** `src/store/slices/bookingsSlice.js`

### `getASCs` (php, query)
- **URL:** `display_asc` · **POST**
- **Defined in:** `src/api/services/dropdownsApi.js`
- **Used in:** `src/sections/management/bookings/AscBookings.jsx`, `src/store/slices/bookingsSlice.js`

### `getASCS` (node, query)
- **URL:** `/api/ascs` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`

### `getAssignedOperator` (php, query)
- **URL:** `find_plan_operator` · **POST**
- **Defined in:** `src/api/services/operatorsApi.js`
- **Used in:** `src/store/slices/operatorsSlice.js`

### `getAssignmentsWithPlansAndMissions` (node, query)
- **URL:** `/api/emergency-moving/assignments` · **POST**
- **Defined in:** `src/api/services NodeJs/emergencyMovingApi.js`
- **Used in:** `src/sections/opsroom/emergency/EmergencyMoving.jsx`

### `getBanks` (node, query)
- **URL:** `/api/financial-cards/banks` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `getBatteryTypes` (node, query)
- **URL:** `/api/view_battery_type` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`, `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/Assets.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`

### `getBookingCreationAllPlansByDateRange` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/bookingCreationApi.js`
- **Used in:** `src/sections/management/bookings/NewServices.jsx`

### `getBookingCreationCropTypes` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/bookingCreationApi.js`
- **Used in:** `src/sections/management/bookings/NewServices.jsx`, `src/sections/opsroom/plantation-plan-requests/PlantationPlanRequestQueue.jsx`, `src/sections/opsroom/requests/RequestProceed.jsx`, `src/sections/opsroom/requests/RequestsQueueMain.jsx`

### `getBookingCreationDivisionsByEstate` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/bookingCreationApi.js`
- **Used in:** `src/sections/management/bookings/NewServices.jsx`

### `getBookingCreationEstates` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/bookingCreationApi.js`
- **Used in:** `src/sections/management/bookings/NewServices.jsx`

### `getBookingCreationMissionTypes` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/bookingCreationApi.js`
- **Used in:** `src/sections/management/bookings/NewServices.jsx`, `src/sections/opsroom/plantation-plan-requests/PlantationPlanRequestQueue.jsx`, `src/sections/opsroom/requests/RequestProceed.jsx`, `src/sections/opsroom/requests/RequestsQueueMain.jsx`

### `getBookingCreationPlansByDate` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/bookingCreationApi.js`
- **Used in:** `src/sections/management/bookings/NewServices.jsx`

### `getBookingCreationPlansByDateRange` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/bookingCreationApi.js`
- **Used in:** `src/sections/management/bookings/NewServices.jsx`

### `getBrokers` (php, query)
- **URL:** `view_brokers` · **POST**
- **Defined in:** `src/api/services/financeApi.js`
- **Used in:** `src/sections/management/bookings/AscBookings.jsx`, `src/store/slices/bookingsSlice.js`, `src/store/slices/financeSlice.js`

### `getCalendarPlans` (node, query)
- **URL:** `/api/plantation-dashboard/calendar-plans` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/plantation-plan-requests/PlantationPlanRequestQueue.jsx`, `src/sections/plantation/plantationDashboard/components/PlantationCalendar.jsx`

### `getCanceledFieldsByDateRange` (php, query)
- **URL:** `canceled_fields_by_date_range` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/opsroom/reports/CanceledByPilots.jsx`

### `getCancelledFieldsByTeamLead` (php, query)
- **URL:** `canceled_fields_by_date_range_with_cancel_reason` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/opsroom/reports/CancelledFieldsByTeamLead.jsx`

### `getCancelReasons` (node, query)
- **URL:** `/api/day-end-process/cancel-reasons` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `getCards` (node, query)
- **URL:** `/api/financial-cards/cards/get-all` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `getCardTransactions` (node, query)
- **URL:** `/api/financial-cards/cards/transactions` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `getCentralStoreRequest` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/CentralStores.jsx`

### `getCentralStoreRequestQueue` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/CentralStores.jsx`

### `getChartAllDataGroup` (php, query)
- **URL:** `for_all_by_date` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/components/BarChartWidget2.jsx`, `src/store/slices/reportsSlice.js`

### `getChartBreakdown` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/plantation/plantationDashboard/components/PlannedVsSprayedChart.jsx`, `src/sections/plantation/plantationDashboard/components/PlannedVsTeaRevenueChart.jsx`

### `getChartEstateData` (php, query)
- **URL:** `for_estate_by_date` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/components/BarChartWidget2.jsx`

### `getChartGroupData` (php, query)
- **URL:** `for_group_by_date` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/components/BarChartWidget2.jsx`, `src/store/slices/reportsSlice.js`

### `getChartPlantationData` (php, query)
- **URL:** `for_plantation_by_date` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/components/BarChartWidget2.jsx`, `src/store/slices/reportsSlice.js`

### `getChartRegionData` (php, query)
- **URL:** `for_region_by_date` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/components/BarChartWidget2.jsx`, `src/store/slices/reportsSlice.js`

### `getChemicals` (node, query)
- **URL:** `/api/chemicals${q}` · **GET**
- **Defined in:** `src/api/services NodeJs/chemicalsApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `getChemicalTypes` (php, query)
- **URL:** `chemical_type` · **POST**
- **Defined in:** `src/api/services/dropdownsApi.js`
- **Used in:** `src/sections/management/bookings/AscBookings.jsx`, `src/sections/management/bookings/BookingList.jsx`

### `getCompletedMissionReports` (node, query)
- **URL:** `/api/plantation-dashboard/completed-mission-reports` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/plantation/plantationDashboard/PlantationDashboard.jsx`, `src/sections/plantation/plantationDashboard/components/CompletedMissionReports.jsx`

### `getCropTypes` (php, query)
- **URL:** `display_crop_type` · **POST**
- **Defined in:** `src/api/services/dropdownsApi.js`
- **Used in:** `src/features/misc/UpdateServices.jsx`, `src/sections/management/bookings/AscBookings.jsx`, `src/sections/opsroom/requests/MonthlyRequestProceed.jsx`, `src/sections/plantation/plantationDashboard/components/PlantationCalendar.jsx`, `src/sections/plantation/plantationDashboard/pages/PlantationCalendarPage.jsx`, `src/store/slices/bookingsSlice.js`

### `getCurrentGroupAssignedMissions` (php, query)
- **URL:** `display_groups_by_day` · **POST**
- **Defined in:** `src/api/services/groupAssignmentsApi.js`
- **Used in:** `src/features/nonp/nonpTeamAllocation.jsx`

### `getDailyKmSummaryForHr` (node, query)
- **URL:** `/api/vehicle-rent/daily-km-summary/hr` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/transport/TransportHrDashboard.jsx`

### `getDailyVerificationQueue` (node, query)
- **URL:** `/api/vehicle-rent/daily-verification-queue` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/hr&admin/vehicleRentApprovals/VehicleRentApprovals.jsx`

### `getDashboardSummary` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/plantation/plantationDashboard/PlantationDashboard.jsx`

### `getDayEndFlagReasons` (node, query)
- **URL:** `/api/day-end-process/flag-reasons` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `getDayEndPlanSummary` (node, query)
- **URL:** `/api/day-end-process/plan-summary` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `getDayEndTaskFlag` (node, query)
- **URL:** `/api/day-end-process/task-flag` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `getDayEndTasksByPlanAndField` (node, query)
- **URL:** `/api/day-end-process/tasks-by-plan-and-field` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `getDayOverview` (node, query)
- **URL:** `/api/day-end-process/day-overview` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `getDeactivatedPlansReport` (node, query)
- **URL:** `/api/finance-report/deactivated-plans` · **POST**
- **Defined in:** `src/api/services NodeJs/financeReportApi.js`
- **Used in:** `src/sections/corporate/reports/DeactivatedPlansReport.jsx`

### `getDeactivateReasons` (node, query)
- **URL:** `/api/reasons/deactivate/list` · **POST**
- **Defined in:** `src/api/services NodeJs/reasonsApi.js`
- **Used in:** `src/features/misc/DeactivatePlan.jsx`, `src/sections/corporate/reports/DeactivatedPlansReport.jsx`, `src/sections/ict/masterData/MasterData.jsx`, `src/sections/management/bookings/BookingsCalender.jsx`

### `getDefaultPaymentValues` (php, query)
- **URL:** `default_values` · **POST**
- **Defined in:** `src/api/services/financeApi.js`
- **Used in:** `src/store/slices/financeSlice.js`

### `getDepartmentHeadcount` (node, query)
- **URL:** `/api/organization/department-headcount` · **POST**
- **Defined in:** `src/api/services NodeJs/employeeProfileApi.js`
- **Used in:** `src/sections/hr&admin/OrganizationStructure.jsx`

### `getDistricts` (node, query)
- **URL:** `/api/districts` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`

### `getDivisionsByEstate` (php, query)
- **URL:** `display_division_field_by_estate` · **POST**
- **Defined in:** `src/api/services/estatesApi.js`
- **Used in:** `src/features/calendar/CalenderWidget.jsx`, `src/features/misc/UpdateServices.jsx`, `src/sections/opsroom/dji/DjiMapUpload.jsx`, `src/store/slices/bookingsSlice.js`, `src/store/slices/estatesSlice.js`

### `getDriverFuelCards` (node, query)
- **URL:** `/api/users/fuel-cards` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/transport/TransportHrDashboard.jsx`

### `getDrivingLicenseTypes` (node, query)
- **URL:** `/api/driving-license-types` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`

### `getDrones` (node, query)
- **URL:** `/api/stock-assets/view_drone` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/features/misc/ProceedPlan.jsx`, `src/features/misc/teamAllocationBottom.jsx`

### `getDronesList` (php, query)
- **URL:** `drone_list` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/misc/ProceedPlan.jsx`, `src/features/misc/teamAllocationBottom.jsx`

### `getDroneUnlockingQueue` (node, query)
- **URL:** `/api/pilot-assignment/drone-unlocking-queue` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`, `src/sections/opsroom/drone-unlocking/DroneUnlockingQueue.jsx`

### `getDSCS` (node, query)
- **URL:** `/api/dscs` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`

### `getEmployeeAssignmentHistory` (node, query)
- **URL:** `/api/employee-assignment/history` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeAssignment.jsx`

### `getEmployeeAssignmentQueues` (node, query)
- **URL:** `/api/employee-assignment/queues` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeAssignment.jsx`

### `getEmployeeRegistrationById` (node, query)
- **URL:** `/api/employee-registration/view` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/employeeProfile/useEmployee.js`

### `getEstateDetails` (php, query)
- **URL:** `estate_profile` · **POST**
- **Defined in:** `src/api/services/estatesApi.js`
- **Used in:** `src/features/calendar/CalenderWidget.jsx`, `src/sections/opsroom/manager-approval/ManagerApprovalQueue.jsx`, `src/sections/plantation/plantationDashboard/components/PlantationCalendar.jsx`, `src/store/slices/estatesSlice.js`

### `getEstatePlanBreakdown` (node, query)
- **URL:** `/api/plantation-dashboard/chart/breakdown/estate-plans` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/plantation/plantationDashboard/pages/ChartBreakdownPage.jsx`

### `getEstates` (node, query)
- **URL:** `/api/estates` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/components/PlantationEstateSelectWidget.jsx`, `src/features/calendar/CalenderView.jsx`, `src/features/misc/SummeryView.jsx`, `src/features/misc/UpdateServices.jsx`, `src/sections/ict/users/Users.jsx`, `src/sections/opsroom/reports/OperationsReportPlanWise.jsx`

### `getEstatesByPlantation` (php, query)
- **URL:** `display_estate_by_plantation` · **POST**
- **Defined in:** `src/api/services/estatesApi.js`
- **Used in:** `src/components/PlantationEstateSelectWidget.jsx`, `src/sections/opsroom/reports/OperationsReportPlanWise.jsx`

### `getEstatesByRegion` (php, query)
- **URL:** `display_estate` · **POST**
- **Defined in:** `src/api/services/estatesApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`, `src/features/misc/SummeryView.jsx`, `src/features/misc/UpdateServices.jsx`

### `getEstatesList` (node, query)
- **URL:** `(queryFn / dynamic)` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/corporate/chartView/DataViewer.jsx`, `src/sections/corporate/charts/GlobalChartBreakdownPage.jsx`, `src/sections/finance/reports/EstateSprayedAreaReport.jsx`

### `getFarmerByNIC` (php, query)
- **URL:** `farmer_by_nic` · **POST**
- **Defined in:** `src/api/services/farmersApi.js`
- **Used in:** `src/sections/management/bookings/AscBookings.jsx`

### `getFeatureDefinitions` (node, query)
- **URL:** `/api/feature-permissions/definitions?${queryParams}` · **GET**
- **Defined in:** `src/api/services NodeJs/featurePermissionsApi.js`
- **Used in:** `src/sections/ict/authentication/AuthControls.jsx`

### `getFeaturePermissions` (node, query)
- **URL:** `/api/feature-permissions?${queryParams}` · **GET**
- **Defined in:** `src/api/services NodeJs/featurePermissionsApi.js`
- **Used in:** `src/sections/ict/authentication/AuthControls.jsx`

### `getFieldById` (node, query)
- **URL:** `${API}/fields/${encodeURIComponent(fieldId)}`
- **Defined in:** `src/api/services NodeJs/fieldSizeAdjustmentsApi.js`
- **Used in:** `src/sections/opsroom/fieldSizeAdjustments/FieldSizeAdjustments.jsx`

### `getFieldDetails` (php, query)
- **URL:** `details_by_field` · **POST**
- **Defined in:** `src/api/services/estatesApi.js`
- **Used in:** `src/store/slices/estatesSlice.js`

### `getFieldHistoryData` (node, query)
- **URL:** `/api/field-history/data` · **POST**
- **Defined in:** `src/api/services NodeJs/fieldHistoryApi.js`
- **Used in:** `src/sections/management/ops/FieldHistory.jsx`

### `getFieldHistoryEstates` (node, query)
- **URL:** `/api/field-history/estates` · **GET**
- **Defined in:** `src/api/services NodeJs/fieldHistoryApi.js`
- **Used in:** `src/sections/management/ops/FieldHistory.jsx`

### `getFieldHistoryFieldsByEstate` (node, query)
- **URL:** `/api/field-history/fields-by-estate` · **POST**
- **Defined in:** `src/api/services NodeJs/fieldHistoryApi.js`
- **Used in:** `src/sections/management/ops/FieldHistory.jsx`

### `getFieldsNotApprovedByTeamLead` (php, query)
- **URL:** `plan_field_not_approved_team_lead` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/opsroom/reports/IncompleteFieldsLeaderWise.jsx`

### `getFieldUnblockPendingCount` (node, query)
- **URL:** `/api/field-unblock-requests/pending-count` · **GET**
- **Defined in:** `src/api/services NodeJs/fieldUnblockRequestsApi.js`
- **Used in:** `src/components/LeftNavBar.jsx`

### `getFieldUnblockRequestsList` (node, query)
- **URL:** `/api/field-unblock-requests?status=${encodeURIComponent(status)}` · **GET**
- **Defined in:** `src/api/services NodeJs/fieldUnblockRequestsApi.js`
- **Used in:** `src/sections/opsroom/field-unblock/FieldUnblockRequestQueue.jsx`

### `getFieldWiseFinanceReport` (node, query)
- **URL:** `/api/finance-report/field-wise` · **POST**
- **Defined in:** `src/api/services NodeJs/financeReportApi.js`
- **Used in:** `src/sections/finance/reports/EstateSprayedAreaReport.jsx`

### `getFinanceCategories` (node, query)
- **URL:** `/api/financial-cards/categories` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `getFinanceCategoriesMaster` (node, query)
- **URL:** `/api/jd-management/finance-categories` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `getFinanceReport` (php, query)
- **URL:** `sprayed_area_by_date_range_and_estate` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/opsroom/reports/OperationsReportPlanWise.jsx`

### `getFinanceSubCategories` (node, query)
- **URL:** `/api/jd-management/finance-sub-categories` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `getFinanceSubCategoriesMaster` (node, query)
- **URL:** `/api/jd-management/finance-sub-categories` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `getFleetBatteries` (node, query)
- **URL:** `/api/fleet-equipment/batteries` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `getFleetDrones` (node, query)
- **URL:** `/api/fleet-equipment/drones` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `getFleetGenerators` (node, query)
- **URL:** `/api/fleet-equipment/generators` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `getFleetPilotsWithTeams` (node, query)
- **URL:** `/api/fleet-equipment/pilots-with-teams` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `getFleetRemoteControls` (node, query)
- **URL:** `/api/fleet-equipment/remote-controls` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `getFleetTeamEquipment` (node, query)
- **URL:** `/api/fleet-equipment/team/${teamId}/equipment` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `getFleetTeamLeads` (node, query)
- **URL:** `/api/fleet-equipment/team-leads` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `getFlightNumbersReport` (php, query)
- **URL:** `plan_field_no_of_flights` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/corporate/charts/ReportTemplate.jsx`, `src/store/slices/reportsSlice.js`

### `getFuelApprovalsHistory` (node, query)
- **URL:** `/api/fuel-approvals/history` · **GET**
- **Defined in:** `src/api/services NodeJs/fuelApprovalsApi.js`
- **Used in:** `src/sections/hr&admin/fuelApprovals/FuelApprovals.jsx`

### `getFuelCategories` (node, query)
- **URL:** `/api/jd-management/fuel-categories` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/Assets.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getFuelGeneratorVoucherById` (node, query)
- **URL:** `${BASE}/${id}` · **GET**
- **Defined in:** `src/api/services NodeJs/fuelGeneratorVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`, `src/sections/strategic/StrategicFinanceApprovals.jsx`

### `getFuelGeneratorVoucherHistory` (node, query)
- **URL:** `${BASE}/history${qs ?` · **GET**
- **Defined in:** `src/api/services NodeJs/fuelGeneratorVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`, `src/sections/strategic/StrategicFinanceApprovals.jsx`

### `getFuelTransportVoucherById` (node, query)
- **URL:** `/api/fuel-transport-vouchers/${id}` · **GET**
- **Defined in:** `src/api/services NodeJs/fuelTransportVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`, `src/sections/strategic/StrategicFinanceApprovals.jsx`

### `getFuelTransportVoucherHistory` (node, query)
- **URL:** `/api/fuel-transport-vouchers/history${qs ?` · **GET**
- **Defined in:** `src/api/services NodeJs/fuelTransportVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`, `src/sections/strategic/StrategicFinanceApprovals.jsx`

### `getGeneratorFuelApprovalsHistory` (node, query)
- **URL:** `/api/generator-fuel-approvals/history` · **GET**
- **Defined in:** `src/api/services NodeJs/generatorFuelApprovalsApi.js`
- **Used in:** `src/sections/hr&admin/fuelApprovals/GeneratorFuelApprovals.jsx`

### `getGlobalEstatePlanBreakdown` (node, query)
- **URL:** `/api/plantation-dashboard/chart/global/breakdown/estate-plans` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/corporate/charts/GlobalChartBreakdownPage.jsx`

### `getGlobalPlannedVsTeaRevenueChart` (node, query)
- **URL:** `/api/plantation-dashboard/chart/global/planned-vs-tea-revenue` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/corporate/charts/GlobalTeaRevenueVsPlannedChart.jsx`

### `getGlobalTeaRevenueVsSprayedChart` (node, query)
- **URL:** `/api/plantation-dashboard/chart/global/tea-revenue-vs-sprayed` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/corporate/charts/GlobalPlannedVsExecutedChart.jsx`

### `getGrn` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getGrns` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getGroupedPermissions` (node, query)
- **URL:** `/api/feature-permissions/grouped` · **GET**
- **Defined in:** `src/api/services NodeJs/featurePermissionsApi.js`
- **Used in:** `src/sections/ict/authentication/AuthControls.jsx`

### `getGroups` (php, query)
- **URL:** `display_groups` · **POST**
- **Defined in:** `src/api/services/estatesApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`, `src/features/misc/SummeryView.jsx`, `src/features/misc/UpdateServices.jsx`, `src/sections/ict/users/Users.jsx`, `src/sections/plantation/plantationDashboard/PlantationDashboard.jsx`, `src/store/slices/bookingsSlice.js`

### `getGroups` (node, query)
- **URL:** `/api/groups` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`, `src/features/misc/SummeryView.jsx`, `src/features/misc/UpdateServices.jsx`, `src/sections/ict/users/Users.jsx`, `src/sections/plantation/plantationDashboard/PlantationDashboard.jsx`, `src/store/slices/bookingsSlice.js`

### `getHrHolidayCalendar` (node, query)
- **URL:** `/api/hr-leave/holidays/list` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeaveManagement.jsx`

### `getHrLeaveTypesAll` (node, query)
- **URL:** `/api/hr-leave/types` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeaveManagement.jsx`

### `getHrMasterOptions` (node, query)
- **URL:** `/api/hr-master-options${q}` · **GET**
- **Defined in:** `src/api/services NodeJs/hrMasterOptionsApi.js`
- **Used in:** `src/sections/ict/masterData/HrMasterOptionsPanel.jsx`

### `getHrMasterOptionsGrouped` (node, query)
- **URL:** `/api/hr-master-options/grouped${q}` · **GET**
- **Defined in:** `src/api/services NodeJs/hrMasterOptionsApi.js`
- **Used in:** `src/sections/hr&admin/employeeProfile/useHrMasterOptions.js`

### `getHrRosterPlan` (node, query)
- **URL:** `/api/hr-leave/roster/view` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/roaster/MonthlyRoaster.jsx`, `src/sections/hr&admin/roaster/RoasterPlanning.jsx`

### `getHrTransportEstimates` (node, query)
- **URL:** `/api/pilot-assignment/transport/hr-estimates` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/transport/TransportHrDashboard.jsx`

### `getIctAssignableUsers` (node, query)
- **URL:** `/api/ict-development/users/assignable` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevelopmentBoard.jsx`, `src/sections/ict/development/ExtraWorkQueue.jsx`, `src/sections/ict/development/SprintPlanning.jsx`

### `getIctMetricsSummary` (node, query)
- **URL:** `/api/ict-development/metrics/summary` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevCenter.jsx`, `src/sections/ict/development/MetricsDashboard.jsx`

### `getIctProjects` (node, query)
- **URL:** `/api/ict-development/projects/list` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevCenter.jsx`, `src/sections/ict/development/DevelopmentBoard.jsx`, `src/sections/ict/development/ExtraWorkQueue.jsx`, `src/sections/ict/development/MetricsDashboard.jsx`, `src/sections/ict/development/SprintPlanning.jsx`

### `getIctQaBugReports` (node, query)
- **URL:** `/api/ict-development/work-items/qa-bugs/list` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevelopmentBoard.jsx`

### `getIctSprints` (node, query)
- **URL:** `/api/ict-development/sprints/list` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevCenter.jsx`, `src/sections/ict/development/DevelopmentBoard.jsx`, `src/sections/ict/development/MetricsDashboard.jsx`, `src/sections/ict/development/SprintPlanning.jsx`

### `getIctWorkItemHistory` (node, query)
- **URL:** `/api/ict-development/work-items/history` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevelopmentBoard.jsx`

### `getIctWorkItems` (node, query)
- **URL:** `/api/ict-development/work-items/list` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevCenter.jsx`, `src/sections/ict/development/DevelopmentBoard.jsx`, `src/sections/ict/development/ExtraWorkQueue.jsx`

### `getIncompleteSubtasks` (php, query)
- **URL:** `not_complete_task_list_for_report` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/opsroom/reports/IncompleteOpsRoomRejected.jsx`

### `getInsuranceTypes` (node, query)
- **URL:** `/api/view_insurance_type` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/store/slices/assetsSlice.js`

### `getInventoryItems` (node, query)
- **URL:** `/api/stock-assets/inventory-items` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/CentralStores.jsx`, `src/sections/stock-assets/InventoryItemsRegistration.jsx`, `src/sections/stock-assets/ProcurementProcess.jsx`

### `getInvoiceOrganizations` (node, query)
- **URL:** `/api/plantation-invoices/organizations${qs}` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationInvoiceApi.js`
- **Used in:** `src/sections/finance/reports/CreatePlantationInvoiceModal.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getInvoiceTaxTypes` (node, query)
- **URL:** `/api/plantation-invoices/tax-types${qs}` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationInvoiceApi.js`
- **Used in:** `src/sections/finance/reports/CreatePlantationInvoiceModal.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getJobRoles` (node, query)
- **URL:** `/api/feature-permissions/job-roles` · **GET**
- **Defined in:** `src/api/services NodeJs/featurePermissionsApi.js`
- **Used in:** `src/sections/ict/authentication/AuthControls.jsx`

### `getLastEmpNo` (node, query)
- **URL:** `/api/employee-registration/last-emp-no` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`

### `getLastItemCode` (node, query)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`

### `getLastMainCategoryCode` (node, query)
- **URL:** `/api/stock-assets/main-categories/last-code` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`

### `getLastSubCategoryCode` (node, query)
- **URL:** `/api/stock-assets/sub-categories/last-code` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`

### `getLastSubSubCategoryCode` (node, query)
- **URL:** `/api/stock-assets/sub-sub-categories/last-code` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`

### `getLastSupplierCode` (node, query)
- **URL:** `/api/stock-assets/suppliers/last-code` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/SupplierRegistration.jsx`

### `getLeaveDaysForHr` (node, query)
- **URL:** `/api/vehicle-rent/leave-days/hr-list` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/hr&admin/driverLeaveDates/DriverLeaveDatesHr.jsx`, `src/sections/transport/TransportHrDashboard.jsx`

### `getLeaveDaysForHrByMonth` (node, query)
- **URL:** `/api/vehicle-rent/leave-days/hr-list-by-month` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/transport/TransportHrDashboard.jsx`

### `getLogCategories` (node, query)
- **URL:** `/api/logs-report/categories` · **POST**
- **Defined in:** `src/api/services NodeJs/logsReportApi.js`
- **Used in:** `src/sections/ict/logsReport/LogsReportPage.jsx`

### `getLogData` (node, query)
- **URL:** `/api/logs-report/data` · **POST**
- **Defined in:** `src/api/services NodeJs/logsReportApi.js`
- **Used in:** `src/sections/ict/logsReport/LogsReportPage.jsx`

### `getLogFiles` (node, query)
- **URL:** `/api/logs-report/files` · **POST**
- **Defined in:** `src/api/services NodeJs/logsReportApi.js`
- **Used in:** `src/sections/ict/logsReport/LogsReportPage.jsx`

### `getMainCategories` (node, query)
- **URL:** `/api/stock-assets/main-categories` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`, `src/sections/stock-assets/SupplierRegistration.jsx`, `src/sections/stock-assets/SuppliersList.jsx`

### `getMaintenance` (node, query)
- **URL:** `/api/maintenance` · **POST**
- **Defined in:** `src/api/services NodeJs/maintenanceApi.js`
- **Used in:** `src/sections/administration/Maintenance.jsx`

### `getManagementPlanExecutionReport` (node, query)
- **URL:** `/api/finance-report/management-plan-execution` · **POST**
- **Defined in:** `src/api/services NodeJs/financeReportApi.js`
- **Used in:** `src/sections/management/reports/PlanExecutionReasonReport.jsx`

### `getManagerApprovedCanceledReport` (node, query)
- **URL:** `/api/finance-report/manager-approved-canceled` · **POST**
- **Defined in:** `src/api/services NodeJs/financeReportApi.js`
- **Used in:** `src/sections/corporate/reports/ManagerApprovedCanceledReport.jsx`

### `getMappingAllFieldsReport` (node, query)
- **URL:** `/api/mapping-hierarchy/fields/all-report` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `getMappingDivisionsByEstate` (node, query)
- **URL:** `/api/mapping-hierarchy/divisions/by-estate` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `getMappingEstatesByRegion` (node, query)
- **URL:** `/api/mapping-hierarchy/estates/by-region` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `getMappingFieldsByDivision` (node, query)
- **URL:** `/api/mapping-hierarchy/fields/by-division` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `getMappingGroups` (node, query)
- **URL:** `/api/mapping-hierarchy/groups` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `getMappingMissionPartialReasons` (node, query)
- **URL:** `/api/mapping-hierarchy/mission-partial-reasons` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `getMappingPlantations` (node, query)
- **URL:** `/api/mapping-hierarchy/plantations` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/strategic/corporateCustomers/CorporateCustomers.jsx`

### `getMappingPlantationsByGroup` (node, query)
- **URL:** `/api/mapping-hierarchy/plantations/by-group` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `getMappingRegionsByPlantation` (node, query)
- **URL:** `/api/mapping-hierarchy/regions/by-plantation` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `getMissionPartialReasons` (node, query)
- **URL:** `/api/reasons/mission-partial/list` · **POST**
- **Defined in:** `src/api/services NodeJs/reasonsApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getMissionsByPlannedDate` (php, query)
- **URL:** `search_mission_by_planed_date` · **POST**
- **Defined in:** `src/api/services/bookingsApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcessAsc.jsx`

### `getMissionsPendingPayment` (node, query)
- **URL:** `/api/pilot-assignment/missions-pending-payment` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`, `src/sections/opsroom/pending-payment/PendingPaymentQueue.jsx`

### `getMissionTypes` (php, query)
- **URL:** `mission_type` · **POST**
- **Defined in:** `src/api/services/dropdownsApi.js`
- **Used in:** `src/features/misc/UpdateServices.jsx`, `src/sections/management/bookings/AscBookings.jsx`, `src/sections/opsroom/requests/MonthlyRequestProceed.jsx`, `src/sections/plantation/plantationDashboard/components/PlantationCalendar.jsx`, `src/sections/plantation/plantationDashboard/pages/PlantationCalendarPage.jsx`, `src/store/slices/bookingsSlice.js`

### `getMonitoringDashboardData` (node, query)
- **URL:** `/api/monitoring-dashboard/data` · **POST**
- **Defined in:** `src/api/services NodeJs/monitoringDashboardApi.js`
- **Used in:** `src/sections/opsroom/monitoring/MonitoringDashboard.jsx`

### `getMonthlyPlantationReport` (node, query)
- **URL:** `/api/monthly-plantation-report/report` · **POST**
- **Defined in:** `src/api/services NodeJs/monthlyPlantationReportApi.js`
- **Used in:** `src/sections/opsroom/reports/MonthlyPlantationReport.jsx`

### `getMonthlySummaryByVehicle` (node, query)
- **URL:** `/api/vehicle-rent/monthly-summary` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/finance/vehicleRent/VehicleRent.jsx`

### `getMyPermissions` (node, query)
- **URL:** `/api/feature-permissions/my-permissions` · **GET**
- **Defined in:** `src/api/services NodeJs/featurePermissionsApi.js`
- **Used in:** `src/hooks/useNavbarPermissions.js`, `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`, `src/sections/opsroom/dayend/DayEndProcess.jsx`, `src/sections/opsroom/pilot-assigment/PilotAssignment.jsx`, `src/sections/opsroom/pilot-assigment/TransportArrangePage.jsx`, `src/utils/featurePermissions.js`

### `getNeedToProcureQueue` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/CentralStores.jsx`, `src/sections/stock-assets/ProcurementProcess.jsx`

### `getNonPlantationPilotsWithoutTeam` (php, query)
- **URL:** `non_plantaion_pilots_and_drones_without_team` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/nonp/nonpTeamAllocationBottom.jsx`

### `getNotifications` (node, query)
- **URL:** `(queryFn / dynamic)` · **GET**
- **Defined in:** `src/api/services NodeJs/notificationsApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`

### `getNotSprayingRecens` (node, query)
- **URL:** `/api/reasons/not-spraying/list` · **POST**
- **Defined in:** `src/api/services NodeJs/reasonsApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `getOperators` (php, query)
- **URL:** `get_operator` · **POST**
- **Defined in:** `src/api/services/operatorsApi.js`
- **Used in:** `src/store/slices/operatorsSlice.js`

### `getOpsRoomCanceledByDateRange` (node, query)
- **URL:** `/api/day-end-process/ops-room-canceled-by-date-range` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/reports/CanceledByOpsRoom.jsx`

### `getOpsroomDailyPerformanceSummary` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/opsroomPerformanceSummaryApi.js`
- **Used in:** `src/sections/opsroom/reports/OpsroomDailyPerformanceSummary.jsx`

### `getOpsroomEstateDivisionsFields` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/opsroomPlanCalendarApi.js`
- **Used in:** `src/sections/opsroom/calendar/PlanCalendar.jsx`

### `getOpsroomEstateProfile` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/opsroomPlanCalendarApi.js`
- **Used in:** `src/sections/opsroom/calendar/PlanCalendar.jsx`

### `getOpsroomMonthlyAchievementSummary` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/opsroomPerformanceSummaryApi.js`
- **Used in:** `src/sections/opsroom/reports/OpsroomMonthlyAchievementSummary.jsx`

### `getOpsroomPilotDailyPerformanceSummary` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/opsroomPerformanceSummaryApi.js`
- **Used in:** `src/sections/opsroom/reports/OpsroomPilotDailyPerformanceSummary.jsx`

### `getOpsroomPlansByDateRange` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/opsroomPlanCalendarApi.js`
- **Used in:** `src/sections/opsroom/calendar/PlanCalendar.jsx`, `src/sections/opsroom/requests/RequestProceed.jsx`

### `getOpsroomPlanTeamDrone` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/opsroomPlanCalendarApi.js`
- **Used in:** `src/sections/opsroom/calendar/PlanCalendar.jsx`

### `getOrgChart` (node, query)
- **URL:** `/api/organization/chart` · **POST**
- **Defined in:** `src/api/services NodeJs/employeeProfileApi.js`
- **Used in:** `src/sections/hr&admin/OrganizationStructure.jsx`

### `getOwnVehicles` (node, query)
- **URL:** `/api/financial-cards/own-vehicles` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `getPartialCompleteReasons` (php, query)
- **URL:** `display_partial_complete_reasons` · **POST**
- **Defined in:** `src/api/services/dropdownsApi.js`
- **Used in:** `src/store/slices/financeSlice.js`

### `getPendingAdHocRequests` (php, query)
- **URL:** `display_adhoc_plan_request_by_manager_app_pending` · **POST**
- **Defined in:** `src/api/services/requestsApi.js`
- **Used in:** `src/sections/opsroom/monitoring/MonitoringDashboard.jsx`

### `getPendingApprovals` (node, query)
- **URL:** `/api/vehicle-rent/pending-approvals` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/hr&admin/vehicleRentApprovals/VehicleRentApprovals.jsx`, `src/sections/transport/TransportHrDashboard.jsx`

### `getPendingFuelApprovals` (node, query)
- **URL:** `/api/fuel-approvals/pending` · **GET**
- **Defined in:** `src/api/services NodeJs/fuelApprovalsApi.js`
- **Used in:** `src/sections/hr&admin/fuelApprovals/FuelApprovals.jsx`, `src/sections/transport/TransportHrDashboard.jsx`

### `getPendingFuelGeneratorVouchers` (node, query)
- **URL:** `${BASE}/pending` · **GET**
- **Defined in:** `src/api/services NodeJs/fuelGeneratorVoucherApi.js`
- **Used in:** `src/sections/strategic/StrategicFinanceApprovals.jsx`

### `getPendingFuelTransportVouchers` (node, query)
- **URL:** `/api/fuel-transport-vouchers/pending` · **GET**
- **Defined in:** `src/api/services NodeJs/fuelTransportVoucherApi.js`
- **Used in:** `src/sections/strategic/StrategicFinanceApprovals.jsx`

### `getPendingGeneratorFuelApprovals` (node, query)
- **URL:** `/api/generator-fuel-approvals/pending` · **GET**
- **Defined in:** `src/api/services NodeJs/generatorFuelApprovalsApi.js`
- **Used in:** `src/sections/hr&admin/fuelApprovals/GeneratorFuelApprovals.jsx`

### `getPendingNonPlantationMissions` (php, query)
- **URL:** `search_pending_mission` · **POST**
- **Defined in:** `src/api/services/requestsApi.js`
- **Used in:** `src/sections/opsroom/requests/RequestsQueueMain.jsx`

### `getPendingQuotationsQueue` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getPendingRescheduleRequests` (php, query)
- **URL:** `find_all_pending_request_reschedule` · **POST**
- **Defined in:** `src/api/services/requestsApi.js`
- **Used in:** `src/components/LeftNavBar.jsx`

### `getPendingRescheduleRequestsByManager` (php, query)
- **URL:** `display_reschedule_date_for_plan_by_manager_pending` · **POST**
- **Defined in:** `src/api/services/requestsApi.js`
- **Used in:** `src/sections/opsroom/monitoring/MonitoringDashboard.jsx`

### `getPendingSettlements` (node, query)
- **URL:** `/api/financial-cards/transactions/pending-settlements` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `getPilotAssignmentDrone` (node, query)
- **URL:** `/api/pilot-assignment/drone` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/pilot-assigment/PilotAssignment.jsx`

### `getPilotAssignmentMissions` (node, query)
- **URL:** `/api/pilot-assignment/missions` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/pilot-assigment/PilotAssignment.jsx`

### `getPilotAssignmentPilots` (node, query)
- **URL:** `/api/pilot-assignment/pilots` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/emergency/EmergencyMoving.jsx`, `src/sections/opsroom/pilot-assigment/PilotAssignment.jsx`

### `getPilotAssignmentPlans` (node, query)
- **URL:** `/api/pilot-assignment/plans` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/pilot-assigment/PilotAssignment.jsx`

### `getPilotDetailsForPlan` (php, query)
- **URL:** `plan_team_drone_by_plan_id` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/calendar/CalenderWidget.jsx`, `src/sections/plantation/plantationDashboard/components/PlantationCalendar.jsx`

### `getPilotFeedbacks` (php, query)
- **URL:** `display_daily_feedback_by_date_range` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/opsroom/reports/PilotFeedbacks.jsx`

### `getPilotPerformance` (php, query)
- **URL:** `pilot_performance_plantation` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/components/pilotPerformanceSlice.jsx`, `src/components/pilotPerformanceSlice2.jsx`, `src/sections/opsroom/reports/PilotPerformanceOpsRoomData.jsx`, `src/sections/opsroom/reports/PilotPerformancePilotData.jsx`, `src/sections/opsroom/reports/PilotSummaryOpsRoomData.jsx`, `src/sections/opsroom/reports/PilotSummaryPilotData.jsx`

### `getPilotPlansAndSubtasks` (php, query)
- **URL:** `pilots_plans_tasks_by_date_range_and_estates` · **POST**
- **Defined in:** `src/api/services/tasksApi.js`
- **Used in:** `src/features/pilots/PilotMappingDetails.jsx`

### `getPilotRevenueByDate` (php, query)
- **URL:** `pilot_daily_covered_area` · **POST**
- **Defined in:** `src/api/services/financeApi.js`
- **Used in:** `src/store/slices/financeSlice.js`, `src/store/slices/reportsSlice.js`

### `getPilotRevenueByDateRange` (php, query)
- **URL:** `get_pilot_daily_payment_by_date_range` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/store/slices/reportsSlice.js`

### `getPilots` (node, query)
- **URL:** `/api/pilot-assignment/pilots` · **POST**
- **Defined in:** `src/api/services NodeJs/accidentReportsApi.js`
- **Used in:** `src/features/misc/ProceedPlan.jsx`, `src/features/misc/teamAllocationBottom.jsx`, `src/sections/administration/accident-reports/hooks/useIncidentReportsPage.js`

### `getPilotsAndDrones` (php, query)
- **URL:** `team_lead_and_pilot_list` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/misc/ProceedPlan.jsx`, `src/features/misc/teamAllocationBottom.jsx`

### `getPilotsAndDronesWithoutTeam` (php, query)
- **URL:** `pilots_and_drones_without_team` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/misc/teamAllocationBottom.jsx`

### `getPilotTeamSprayArea` (php, query)
- **URL:** `pilot_team_date_spray_area` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/opsroom/reports/PilotPerformanceByDateOpsRoom.jsx`, `src/sections/opsroom/reports/PilotPerformanceByDatePilot.jsx`

### `getPilotTransportOptions` (node, query)
- **URL:** `/api/pilot-assignment/transport/options` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/pilot-assigment/PilotAssignment.jsx`, `src/sections/opsroom/pilot-assigment/TransportArrangePage.jsx`, `src/sections/transport/TransportHrDashboard.jsx`

### `getPlanActivatePendingCount` (node, query)
- **URL:** `/api/plan-activate-requests/pending-count` · **GET**
- **Defined in:** `src/api/services NodeJs/planActivateRequestsApi.js`
- **Used in:** `src/components/LeftNavBar.jsx`, `src/sections/management/plans/PlanActivateRequestsPage.jsx`

### `getPlanActivateRequestsList` (node, query)
- **URL:** `/api/plan-activate-requests?status=${encodeURIComponent(status)}` · **GET**
- **Defined in:** `src/api/services NodeJs/planActivateRequestsApi.js`
- **Used in:** `src/sections/management/plans/PlanActivateRequestQueue.jsx`

### `getPlanActivateStatusByPlans` (node, query)
- **URL:** `/api/plan-activate-requests/status-by-plans` · **POST**
- **Defined in:** `src/api/services NodeJs/planActivateRequestsApi.js`
- **Used in:** `src/sections/opsroom/calendar/PlanCalendar.jsx`

### `getPlanById` (php, query)
- **URL:** `find_plan` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/features/calendar/CalenderWidget.jsx`, `src/sections/plantation/plantationDashboard/components/PlantationCalendar.jsx`, `src/store/slices/plansSlice.js`

### `getPlanDivisionFieldsByFieldId` (node, query)
- **URL:** `${API}/plan-division-fields/${encodeURIComponent(fieldId)}`
- **Defined in:** `src/api/services NodeJs/fieldSizeAdjustmentsApi.js`
- **Used in:** `src/sections/opsroom/fieldSizeAdjustments/FieldSizeAdjustments.jsx`

### `getPlannedVsTeaRevenueChart` (node, query)
- **URL:** `/api/plantation-dashboard/chart/planned-vs-tea-revenue` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/plantation/plantationDashboard/components/PlannedVsTeaRevenueChart.jsx`

### `getPlanOperatorsByDateRange` (php, query)
- **URL:** `find_plan_operator_date_range` · **POST**
- **Defined in:** `src/api/services/operatorsApi.js`
- **Used in:** `src/store/slices/operatorsSlice.js`

### `getPlanResourceAllocation` (php, query)
- **URL:** `get_plan_resource_allocation_details` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/features/misc/ProceedPlan.jsx`

### `getPlansByDate` (php, query)
- **URL:** `find_plans_by_date` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/features/misc/ProceedPlan.jsx`, `src/features/misc/teamAllocation.jsx`, `src/features/nonp/nonpTeamAllocation.jsx`, `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`, `src/sections/opsroom/manager-approval/ManagerApprovalQueue.jsx`, `src/sections/opsroom/operators/OpsAssign.jsx`, `src/sections/opsroom/plans/PlansWithWeather.jsx`, `src/store/slices/bookingsSlice.js`, `src/store/slices/plansSlice.js`

### `getPlansByDateRange` (php, query)
- **URL:** `find_plans_by_date_range` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/store/slices/bookingsSlice.js`

### `getPlansByEstate` (php, query)
- **URL:** `find_plan_by_estate` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`

### `getPlansByEstateDateRangeWithField` (php, query)
- **URL:** `find_plan_by_estate_date_range_with_field` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`

### `getPlansByGroup` (php, query)
- **URL:** `find_plan_by_group` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`

### `getPlansByGroupDateRange` (php, query)
- **URL:** `find_plan_by_group_date_range` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`

### `getPlansByPlantation` (php, query)
- **URL:** `find_plan_by_plantation` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`

### `getPlansByPlantationDateRange` (php, query)
- **URL:** `find_plan_by_plantation_date_range` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`

### `getPlansByRegion` (php, query)
- **URL:** `find_plan_by_region` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`

### `getPlansByRegionDateRange` (php, query)
- **URL:** `find_plan_by_region_date_range` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`

### `getPlansForReschedule` (php, query)
- **URL:** `display_for_reschedulr_plan` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/features/calendar/CalenderWidget.jsx`

### `getPlansForUpdate` (php, query)
- **URL:** `display_for_update_plan` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/features/calendar/CalenderWidget.jsx`, `src/features/misc/UpdateServices.jsx`

### `getPlansPendingDayEndCount` (node, query)
- **URL:** `/api/day-end-process/plans-pending-count` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`

### `getPlanStatusByDate` (node, query)
- **URL:** `/api/plan-status/by-date` · **POST**
- **Defined in:** `src/api/services NodeJs/planStatusApi.js`
- **Used in:** `src/features/misc/DeactivatePlan.jsx`

### `getPlansWithFields` (node, query)
- **URL:** `/api/emergency-moving/plans-with-fields` · **POST**
- **Defined in:** `src/api/services NodeJs/emergencyMovingApi.js`
- **Used in:** `src/sections/opsroom/emergency/EmergencyMoving.jsx`

### `getPlantationCoveredArea` (php, query)
- **URL:** `plantation_covered_area_by_date` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/finance/reports/DailyCoveredAreaSummary.jsx`, `src/sections/finance/reports/PlantationCoveredAreaReport.jsx`

### `getPlantationInvoiceById` (node, query)
- **URL:** `/api/plantation-invoices/${id}` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationInvoiceApi.js`
- **Used in:** `src/sections/finance/reports/CreatePlantationInvoiceModal.jsx`, `src/sections/finance/reports/PlantationInvoiceHistory.jsx`

### `getPlantationInvoiceDraft` (node, mutation)
- **URL:** `/api/plantation-invoices/draft` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationInvoiceApi.js`
- **Used in:** `src/sections/finance/reports/CreatePlantationInvoiceModal.jsx`

### `getPlantationMonthlyPlanAcceptBoard` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/management/bookings/AcceptMonthlyPlansBoard.jsx`

### `getPlantationMonthlyPlanRequestById` (node, query)
- **URL:** `/api/plantation-monthly-plan-requests/${id}` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/requests/MonthlyRequestProceed.jsx`

### `getPlantationMonthlyPlanRequestCalendarContext` (node, query)
- **URL:** `/api/plantation-monthly-plan-requests/${id}/calendar-context` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/requests/MonthlyRequestProceed.jsx`

### `getPlantationMonthlyPlanRequestsList` (node, query)
- **URL:** `/api/plantation-monthly-plan-requests?${q.toString()}` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/requests/RequestsQueueMain.jsx`

### `getPlantationPlanRequestMonthStats` (node, query)
- **URL:** `/api/plantation-plan-requests/month-stats?${q.toString()}` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/plantation/plantationDashboard/components/PlantationCalendar.jsx`, `src/sections/plantation/plantationDashboard/pages/PlantationCalendarPage.jsx`

### `getPlantationPlanRequestsEstateMonth` (node, query)
- **URL:** `/api/plantation-plan-requests/estate-month?${q.toString()}` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/plantation/plantationDashboard/pages/PlantationCalendarPage.jsx`

### `getPlantationPlanRequestsList` (node, query)
- **URL:** `/api/plantation-plan-requests?${q.toString()}` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/plantation-plan-requests/PlantationPlanRequestQueue.jsx`, `src/sections/opsroom/requests/RequestProceed.jsx`, `src/sections/opsroom/requests/RequestsQueueMain.jsx`

### `getPlantationPlanRequestsPendingCount` (node, query)
- **URL:** `/api/plantation-plan-requests/pending-count` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`

### `getPlantationPlanRescheduleRequestsList` (node, query)
- **URL:** `/api/plantation-plan-reschedule-requests?${q.toString()}` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/requests/RequestProceed.jsx`, `src/sections/opsroom/requests/RequestsQueueMain.jsx`

### `getPlantationPlanRescheduleRequestsPendingCount` (node, query)
- **URL:** `/api/plantation-plan-reschedule-requests/pending-count` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`

### `getPlantations` (node, query)
- **URL:** `/api/plantations` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`, `src/features/misc/SummeryView.jsx`, `src/features/misc/UpdateServices.jsx`, `src/sections/ict/users/Users.jsx`

### `getPlantationsByGroup` (php, query)
- **URL:** `display_plantation` · **POST**
- **Defined in:** `src/api/services/estatesApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`, `src/features/misc/SummeryView.jsx`, `src/features/misc/UpdateServices.jsx`

### `getPlantationsList` (node, query)
- **URL:** `/api/plantation-dashboard/plantations` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/corporate/chartView/DataViewer.jsx`, `src/sections/corporate/charts/GlobalChartBreakdownPage.jsx`, `src/sections/finance/reports/EstateSprayedAreaReport.jsx`, `src/sections/finance/reports/PlantationInvoiceHistory.jsx`, `src/sections/finance/reports/WorkSummaryPdfHistory.jsx`

### `getPoolPassengerUsers` (node, query)
- **URL:** `/api/pool-vehicle-tasks/passenger-users` · **GET**
- **Defined in:** `src/api/services NodeJs/poolVehicleTaskApi.js`
- **Used in:** `src/sections/transport/PoolVehicleTasksPanel.jsx`

### `getPoolRequestCategories` (node, query)
- **URL:** `/api/pool-vehicle-tasks/categories${q}` · **GET**
- **Defined in:** `src/api/services NodeJs/poolVehicleTaskApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`, `src/sections/transport/PoolVehicleTasksPanel.jsx`

### `getPoolVehiclesForAssignment` (node, query)
- **URL:** `/api/pool-vehicle-tasks/pool-vehicles` · **GET**
- **Defined in:** `src/api/services NodeJs/poolVehicleTaskApi.js`
- **Used in:** `src/sections/transport/PoolVehicleTasksPanel.jsx`

### `getPoolVehicleTasks` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/poolVehicleTaskApi.js`
- **Used in:** `src/sections/transport/PoolVehicleTasksPanel.jsx`

### `getProcurementRequest` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getProcurementRequests` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getProvinces` (node, query)
- **URL:** `/api/provinces` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`

### `getPurchaseOrder` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getPurchaseOrders` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getQuotation` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getRegions` (node, query)
- **URL:** `/api/regions` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`, `src/features/misc/SummeryView.jsx`, `src/features/misc/UpdateServices.jsx`, `src/sections/ict/users/Users.jsx`

### `getRegionsByPlantation` (php, query)
- **URL:** `display_region` · **POST**
- **Defined in:** `src/api/services/estatesApi.js`
- **Used in:** `src/features/calendar/CalenderView.jsx`, `src/features/misc/SummeryView.jsx`, `src/features/misc/UpdateServices.jsx`

### `getRegistrationOptions` (node, query)
- **URL:** `${baseUrl}/api/public/registration-options` · **GET**
- **Defined in:** `src/api/services NodeJs/publicRegistrationApi.js`
- **Used in:** `src/pages/Register.jsx`

### `getReportPlantations` (node, query)
- **URL:** `/api/monthly-plantation-report/plantations` · **POST**
- **Defined in:** `src/api/services NodeJs/monthlyPlantationReportApi.js`
- **Used in:** `src/sections/opsroom/reports/MonthlyPlantationReport.jsx`, `src/sections/opsroom/reports/OpsroomDailyPerformanceSummary.jsx`, `src/sections/opsroom/reports/OpsroomMonthlyAchievementSummary.jsx`, `src/sections/opsroom/reports/OpsroomPilotDailyPerformanceSummary.jsx`

### `getResourceAssignmentCount` (node, query)
- **URL:** `/api/pilot-assignment/resource-assignment-count` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`

### `getRfqs` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getSavedPilotRevenueByDate` (php, query)
- **URL:** `get_pilot_daily_payment_by_date` · **POST**
- **Defined in:** `src/api/services/financeApi.js`
- **Used in:** `src/sections/finance/PilotEarnings/Earnings.jsx`

### `getSectors` (php, query)
- **URL:** `display_sectors` · **POST**
- **Defined in:** `src/api/services/dropdownsApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`, `src/sections/management/bookings/AscBookings.jsx`, `src/store/slices/bookingsSlice.js`

### `getSecurityCodeList` (node, query)
- **URL:** `/api/financial-cards/security-code/list` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `getStages` (php, query)
- **URL:** `display_growth_level` · **POST**
- **Defined in:** `src/api/services/dropdownsApi.js`
- **Used in:** `src/sections/management/bookings/AscBookings.jsx`

### `getStockSectors` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/CentralStores.jsx`

### `getStockWings` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/CentralStores.jsx`

### `getStrategicFuelVoucherPendingCount` (node, query)
- **URL:** `/api/fuel-transport-vouchers/pending` · **GET**
- **Defined in:** `src/api/services NodeJs/strategicFinanceApprovalsApi.js`
- **Used in:** `src/components/LeftNavBar.jsx`

### `getSubCategories` (node, query)
- **URL:** `/api/stock-assets/sub-categories` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`, `src/sections/stock-assets/SupplierRegistration.jsx`, `src/sections/stock-assets/SuppliersList.jsx`

### `getSubmissionData` (php, query)
- **URL:** `display_pilot_field_sub_task` · **POST**
- **Defined in:** `src/api/services/tasksApi.js`
- **Used in:** `src/features/pilots/PilotMappingDetails.jsx`

### `getSubSubCategories` (node, query)
- **URL:** `/api/stock-assets/sub-sub-categories` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`, `src/sections/stock-assets/SupplierRegistration.jsx`, `src/sections/stock-assets/SuppliersList.jsx`

### `getSummaryByEstate` (php, query)
- **URL:** `get_plan_resource_allocation_details_by_estate_and_date_range` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/misc/SummeryView.jsx`

### `getSummaryByGroup` (php, query)
- **URL:** `get_plan_resource_allocation_details_by_group_and_date_range` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/misc/SummeryView.jsx`

### `getSummaryByPlantation` (php, query)
- **URL:** `get_plan_resource_allocation_details_by_plantation_and_date_range` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/misc/SummeryView.jsx`

### `getSummaryByRegion` (php, query)
- **URL:** `get_plan_resource_allocation_details_by_region_and_date_range` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/misc/SummeryView.jsx`

### `getSupplierQuotations` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `getSuppliers` (node, query)
- **URL:** `/api/stock-assets/suppliers` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`, `src/sections/stock-assets/SuppliersList.jsx`

### `getTaskReviewReport` (php, query)
- **URL:** `search_task_flag_by_date_range` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/store/slices/reportsSlice.js`

### `getTasksCancelStatus` (node, query)
- **URL:** `/api/day-end-process/tasks-cancel-status` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `getTeamData` (php, query)
- **URL:** `display_all_team_pilot_drone` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/misc/teamAllocation.jsx`, `src/features/misc/teamAllocationBottom.jsx`, `src/features/nonp/nonpTeamAllocation.jsx`, `src/features/nonp/nonpTeamAllocationBottom.jsx`, `src/store/slices/teamsSlice.js`

### `getTeamDataNonPlantation` (php, query)
- **URL:** `display_all_non_plantaion_team_pilot_drone` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/nonp/nonpTeamAllocation.jsx`, `src/features/nonp/nonpTeamAllocationBottom.jsx`

### `getTeamLeadReport` (php, query)
- **URL:** `team_lead_performance_by_date_range` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/opsroom/reports/OperationsReportLeaderWise.jsx`, `src/store/slices/reportsSlice.js`

### `getTeamPlannedData` (php, query)
- **URL:** `plan_team_drone_by_date` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/misc/SummeryView.jsx`, `src/features/misc/teamAllocation.jsx`, `src/features/misc/teamAllocationBottom.jsx`, `src/features/nonp/nonpTeamAllocation.jsx`, `src/store/slices/teamsSlice.js`

### `getTeamPlannedDataNonPlantation` (php, query)
- **URL:** `plan_non_plantaion_team_drone_by_date` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/nonp/nonpTeamAllocation.jsx`

### `getTeaRevenueVsSprayedChart` (node, query)
- **URL:** `/api/plantation-dashboard/chart/tea-revenue-vs-sprayed` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/plantation/plantationDashboard/components/PlannedVsSprayedChart.jsx`

### `getTechnicians` (node, query)
- **URL:** `/api/maintenance/technicians` · **GET**
- **Defined in:** `src/api/services NodeJs/maintenanceApi.js`
- **Used in:** `src/sections/administration/Maintenance.jsx`, `src/sections/administration/accident-reports/hooks/useIncidentReportsPage.js`

### `getTempFleetAllocationsByDate` (node, query)
- **URL:** `/api/fleet-equipment/temp/date/${date}${teamId ?` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `getTempFleetAllocationsByMonth` (node, query)
- **URL:** `/api/fleet-equipment/temp/month` · **POST**
- **Defined in:** `src/api/services NodeJs/fleetEquipmentApi.js`
- **Used in:** `src/sections/administration/ResourceAllocation.jsx`

### `getTimeOfDays` (node, query)
- **URL:** `/api/time-of-days${q}` · **GET**
- **Defined in:** `src/api/services NodeJs/timeOfDaysApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `getTimeSlots` (php, query)
- **URL:** `time_of_the_day` · **POST**
- **Defined in:** `src/api/services/dropdownsApi.js`
- **Used in:** `src/sections/management/bookings/AscBookings.jsx`, `src/store/slices/bookingsSlice.js`

### `getTodayDjiImagesCount` (node, query)
- **URL:** `/api/dji-images/today-count` · **POST**
- **Defined in:** `src/api/services NodeJs/djiImagesApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`

### `getTodayPlansAndMissions` (node, query)
- **URL:** `/api/pilot-assignment/today` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/today-plans/TodayPlans.jsx`

### `getTransactions` (node, query)
- **URL:** `/api/financial-cards/transactions/get` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financeApprovals/FinanceApprovals.jsx`, `src/sections/finance/financialCards/FinancialCards.jsx`

### `getTransactionsForApproval` (node, query)
- **URL:** `/api/financial-cards/transactions/for-approval` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financeApprovals/FinanceApprovals.jsx`

### `getTransportArrangementList` (node, query)
- **URL:** `/api/pilot-assignment/transport/arrangement-list` · **POST**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/pilot-assigment/TransportArrangePage.jsx`, `src/sections/transport/TransportHrDashboard.jsx`

### `getUnreadCount` (node, query)
- **URL:** `/api/notifications/unread-count` · **GET**
- **Defined in:** `src/api/services NodeJs/notificationsApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`

### `getUpcomingPlans` (node, query)
- **URL:** `/api/plantation-dashboard/upcoming-plans` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationDashboardApi.js`
- **Used in:** `src/sections/plantation/plantationDashboard/components/UpcomingPlans.jsx`

### `getUsedChemicals` (php, query)
- **URL:** `chemical_used_by_estates` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/features/plantation/ChemicalsReport.jsx`

### `getUserJobDescriptions` (node, query)
- **URL:** `/api/user-job-descriptions` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeAssignment.jsx`, `src/sections/hr&admin/JDManagement.jsx`

### `getUserJobRoles` (node, query)
- **URL:** `/api/user-job-roles` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/pages/WingHubHome.jsx`, `src/sections/hr&admin/EmployeeAssignment.jsx`, `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/JDManagement.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`, `src/sections/ict/users/Users.jsx`, `src/sections/plantation/plantationDashboard/PlantationDashboard.jsx`

### `getUserLevels` (node, query)
- **URL:** `/api/user-levels` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/JDManagement.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`, `src/sections/ict/users/Users.jsx`

### `getUserMemberTypes` (node, query)
- **URL:** `/api/user-member-types` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/JDManagement.jsx`, `src/sections/ict/users/Users.jsx`

### `getUsers` (node, query)
- **URL:** `/api/financial-cards/users` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `getVacancyReport` (node, query)
- **URL:** `/api/organization/vacancy` · **POST**
- **Defined in:** `src/api/services NodeJs/employeeProfileApi.js`
- **Used in:** `src/sections/hr&admin/OrganizationStructure.jsx`

### `getVehicleAppDrivers` (node, query)
- **URL:** `/api/vehicle-app/admin/drivers` · **GET**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`, `src/sections/transport/TransportHrDashboard.jsx`

### `getVehicleAppMaintenanceCategories` (node, query)
- **URL:** `/api/vehicle-app/admin/maintenance-categories` · **GET**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `getVehicleAppMaintenanceRequests` (node, query)
- **URL:** `/api/vehicle-app/admin/maintenance-requests${query}` · **GET**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/finance/maintenance/MaintenanceFinance.jsx`, `src/sections/ict/masterData/MasterData.jsx`, `src/sections/transport/TransportFinanceDashboard.jsx`, `src/sections/transport/TransportHrDashboard.jsx`

### `getVehicleAppSummary` (node, query)
- **URL:** `/api/vehicle-app/admin/summary${query}` · **GET**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `getVehicleAppVehicleCategories` (node, query)
- **URL:** `/api/vehicle-app/admin/vehicle-categories` · **GET**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `getVehicleAppVehicles` (node, query)
- **URL:** `/api/vehicle-app/admin/vehicles` · **GET**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`, `src/sections/transport/TransportHrDashboard.jsx`

### `getVehicleCategories` (node, query)
- **URL:** `/api/jd-management/vehicle-categories` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/components/VehicleMasterSelectFields.jsx`, `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/hr&admin/assets/Assets.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getVehicleCategories` (node, query)
- **URL:** `/api/jd-management/vehicle-categories` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/components/VehicleMasterSelectFields.jsx`, `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/hr&admin/assets/Assets.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getVehicleDrivers` (node, query)
- **URL:** `/api/vehicle-drivers/list` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/Assets.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`

### `getVehicleMakes` (node, query)
- **URL:** `/api/jd-management/vehicle-makes` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/components/VehicleMasterSelectFields.jsx`, `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getVehicleMakes` (node, query)
- **URL:** `/api/jd-management/vehicle-makes` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/components/VehicleMasterSelectFields.jsx`, `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getVehicleModels` (node, query)
- **URL:** `/api/jd-management/vehicle-models` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/components/VehicleMasterSelectFields.jsx`, `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getVehicleModels` (node, query)
- **URL:** `/api/jd-management/vehicle-models` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/components/VehicleMasterSelectFields.jsx`, `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getVehicleProfile` (node, query)
- **URL:** `/api/stock-assets/vehicle_profile` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/vehicle-profile/VehicleProfile.jsx`

### `getVehicleRentDailyDetails` (node, query)
- **URL:** `/api/vehicle-rent/daily-details` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/hr&admin/vehicleRentApprovals/VehicleRentApprovals.jsx`

### `getWings` (node, query)
- **URL:** `/api/view_wing` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/EmployeeAssignment.jsx`, `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/assets/Assets.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`, `src/sections/hr&admin/assets/AssetsTransfer.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`, `src/sections/ict/masterData/MasterData.jsx`, `src/sections/ict/users/Users.jsx`, `src/sections/stock-assets/AssetTransfer.jsx`, `src/sections/transport/PoolVehicleTasksPanel.jsx`

### `getWings` (node, query)
- **URL:** `/api/jd-management/wings` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/administration/vehicles/Vehicles.jsx`, `src/sections/administration/vehicles/VehiclesRegistration.jsx`, `src/sections/hr&admin/EmployeeAssignment.jsx`, `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/assets/Assets.jsx`, `src/sections/hr&admin/assets/AssetsRegistration.jsx`, `src/sections/hr&admin/assets/AssetsTransfer.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`, `src/sections/ict/masterData/MasterData.jsx`, `src/sections/ict/users/Users.jsx`, `src/sections/stock-assets/AssetTransfer.jsx`, `src/sections/transport/PoolVehicleTasksPanel.jsx`

### `getWorkLocations` (node, query)
- **URL:** `/api/work-locations` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeAssignment.jsx`, `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `getWorkSummaryDocument` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/financeWorkSummaryBillingApi.js`
- **Used in:** `src/sections/finance/reports/WorkSummaryPdfHistory.jsx`

### `hrApproveAdvanceRequest` (node, mutation)
- **URL:** `/api/vehicle-rent/advance-requests/hr-approve/${id}` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/hr&admin/driverAdvanceApprovals/DriverAdvanceApprovals.jsx`

### `hrDecideLeaveDay` (node, mutation)
- **URL:** `/api/vehicle-rent/leave-days/hr-decide/${id}` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/hr&admin/driverLeaveDates/DriverLeaveDatesHr.jsx`

### `hrDecidePoolVehicleTask` (node, mutation)
- **URL:** `/api/pool-vehicle-tasks/requests/${id}/hr-decision` · **POST**
- **Defined in:** `src/api/services NodeJs/poolVehicleTaskApi.js`
- **Used in:** `src/sections/transport/PoolVehicleTasksPanel.jsx`

### `hrDecideVehicleMaintenanceRequest` (node, mutation)
- **URL:** `/api/vehicle-app/admin/maintenance-requests/${id}/hr-decision` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/transport/TransportHrDashboard.jsx`

### `issueCentralStoreItems` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/CentralStores.jsx`

### `listEmployeeDocuments` (node, query)
- **URL:** `/api/employee-documents/list` · **POST**
- **Defined in:** `src/api/services NodeJs/employeeProfileApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeProfileDetails.jsx`

### `listEmployeeProfileSection` (node, query)
- **URL:** `/api/employee-profile/${section}/list` · **POST**
- **Defined in:** `src/api/services NodeJs/employeeProfileApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeProfileDetails.jsx`, `src/sections/hr&admin/employeeProfile/FamilyDependentsSection.jsx`, `src/sections/hr&admin/employeeProfile/ProfileRecordWithFileSection.jsx`

### `listHrLeaveAdminEntitlements` (node, query)
- **URL:** `/api/hr-leave/admin/entitlements/list` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeaveEntitlementPanel.jsx`

### `listHrLeaveAdminPolicies` (node, query)
- **URL:** `/api/hr-leave/admin/policies/list` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeavePoliciesPanel.jsx`

### `listHrLeaveAdminTypes` (node, query)
- **URL:** `/api/hr-leave/admin/types/list` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeaveEntitlementPanel.jsx`, `src/sections/hr&admin/leave/LeaveTypesPanel.jsx`

### `listPlantationInvoices` (node, query)
- **URL:** `/api/plantation-invoices${suffix}` · **GET**
- **Defined in:** `src/api/services NodeJs/plantationInvoiceApi.js`
- **Used in:** `src/sections/finance/reports/PlantationInvoiceHistory.jsx`

### `listWorkSummaryDocuments` (node, query)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/financeWorkSummaryBillingApi.js`
- **Used in:** `src/sections/finance/reports/WorkSummaryPdfHistory.jsx`

### `logNotificationAction` (node, mutation)
- **URL:** `/api/notifications/log-action` · **POST**
- **Defined in:** `src/api/services NodeJs/notificationsApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`

### `markNotificationAsDisplayed` (node, mutation)
- **URL:** `/api/notifications/${notificationId}/mark-displayed` · **POST**
- **Defined in:** `src/api/services NodeJs/notificationsApi.js`
- **Used in:** `src/sections/opsroom/dashboard/WorkflowDashboard.jsx`

### `markVehicleMaintenancePaid` (node, mutation)
- **URL:** `/api/vehicle-app/admin/maintenance-requests/${id}/mark-paid` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/finance/maintenance/MaintenanceFinance.jsx`

### `qaApproveIctWorkItem` (node, mutation)
- **URL:** `/api/ict-development/work-items/qa-approve` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevelopmentBoard.jsx`

### `recordFuelGeneratorPhysicalApproval` (node, mutation)
- **URL:** `${BASE}/${id}/physical-approval` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelGeneratorVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `recordFuelTransportPhysicalApproval` (node, mutation)
- **URL:** `/api/fuel-transport-vouchers/${id}/physical-approval` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelTransportVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `rejectVehicleDayRecord` (node, mutation)
- **URL:** `/api/vehicle-rent/reject-day/${id}` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/hr&admin/vehicleRentApprovals/VehicleRentApprovals.jsx`

### `removeGroupFromMissions` (php, mutation)
- **URL:** `remove_group_from_missions` · **POST**
- **Defined in:** `src/api/services/groupAssignmentsApi.js`
- **Used in:** `src/features/nonp/nonpTeamAllocation.jsx`

### `resetPilotCancel` (node, mutation)
- **URL:** `/api/day-end-process/reset-pilot-cancel` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `resetSecurityCode` (node, mutation)
- **URL:** `/api/financial-cards/security-code/reset` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveDeactivateReason` (node, mutation)
- **URL:** `/api/reasons/deactivate/save` · **POST**
- **Defined in:** `src/api/services NodeJs/reasonsApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveEmployeeProfileSection` (node, mutation)
- **URL:** `/api/employee-profile/${section}/save` · **POST**
- **Defined in:** `src/api/services NodeJs/employeeProfileApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeProfileDetails.jsx`, `src/sections/hr&admin/employeeProfile/FamilyDependentsSection.jsx`, `src/sections/hr&admin/employeeProfile/ProfileRecordWithFileSection.jsx`

### `saveFinanceCategoryMaster` (node, mutation)
- **URL:** `/api/jd-management/finance-categories/save` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveFinanceSubCategoryMaster` (node, mutation)
- **URL:** `/api/jd-management/finance-sub-categories/save` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveFuelCategory` (node, mutation)
- **URL:** `/api/jd-management/fuel-categories/save` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveHrHolidayMark` (node, mutation)
- **URL:** `/api/hr-leave/holidays/save` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeaveManagement.jsx`

### `saveHrLeaveAdminEntitlement` (node, mutation)
- **URL:** `/api/hr-leave/admin/entitlements/save` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeaveEntitlementPanel.jsx`

### `saveHrLeaveAdminPolicy` (node, mutation)
- **URL:** `/api/hr-leave/admin/policies/save` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeavePoliciesPanel.jsx`

### `saveHrLeaveAdminType` (node, mutation)
- **URL:** `/api/hr-leave/admin/types/save` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeaveTypesPanel.jsx`

### `saveHrRosterPlan` (node, mutation)
- **URL:** `/api/hr-leave/roster/save` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/roaster/RoasterPlanning.jsx`

### `saveInvoiceMonthlyFuelPrice` (node, mutation)
- **URL:** `/api/plantation-invoices/fuel-price/save` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationInvoiceApi.js`
- **Used in:** `src/sections/finance/reports/CreatePlantationInvoiceModal.jsx`

### `saveInvoiceOrganization` (node, mutation)
- **URL:** `/api/plantation-invoices/organizations/save` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationInvoiceApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveInvoiceTaxType` (node, mutation)
- **URL:** `/api/plantation-invoices/tax-types/save` · **POST**
- **Defined in:** `src/api/services NodeJs/plantationInvoiceApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveMissionPartialReason` (node, mutation)
- **URL:** `/api/reasons/mission-partial/save` · **POST**
- **Defined in:** `src/api/services NodeJs/reasonsApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `saveNotSprayingRecen` (node, mutation)
- **URL:** `/api/reasons/not-spraying/save` · **POST**
- **Defined in:** `src/api/services NodeJs/reasonsApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `savePoolRequestCategory` (node, mutation)
- **URL:** `/api/pool-vehicle-tasks/categories` · **POST**
- **Defined in:** `src/api/services NodeJs/poolVehicleTaskApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveQuotationEvaluation` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `saveTechnicalEvaluation` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `saveVehicleAppMaintenanceCategory` (node, mutation)
- **URL:** `/api/vehicle-app/admin/maintenance-categories` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveVehicleAppVehicle` (node, mutation)
- **URL:** `/api/vehicle-app/admin/vehicles` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/transport/TransportHrDashboard.jsx`

### `saveVehicleAppVehicleCategory` (node, mutation)
- **URL:** `/api/vehicle-app/admin/vehicle-categories` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleAppApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveVehicleCategory` (node, mutation)
- **URL:** `/api/jd-management/vehicle-categories/save` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/components/VehicleMasterSelectFields.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `saveVehicleMake` (node, mutation)
- **URL:** `/api/jd-management/vehicle-makes/save` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/components/VehicleMasterSelectFields.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `saveVehicleModel` (node, mutation)
- **URL:** `/api/jd-management/vehicle-models/save` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/components/VehicleMasterSelectFields.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `saveWing` (node, mutation)
- **URL:** `/api/jd-management/wings/save` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveWorkLocation` (node, mutation)
- **URL:** `/api/jd-management/work-locations/save` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `saveWorkSummaryBillingDraft` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/financeWorkSummaryBillingApi.js`
- **Used in:** `src/sections/finance/reports/EstateSprayedAreaReport.jsx`

### `searchBrokerByNIC` (php, query)
- **URL:** `search_broker_by_nic` · **POST**
- **Defined in:** `src/api/services/financeApi.js`
- **Used in:** `src/sections/finance/brokers/BrokerRegistration.jsx`

### `searchFields` (node, query)
- **URL:** `${API}/search-fields?q=${encodeURIComponent(q || '')}&limit=${limit || 20}`
- **Defined in:** `src/api/services NodeJs/fieldSizeAdjustmentsApi.js`
- **Used in:** `src/sections/opsroom/fieldSizeAdjustments/FieldSizeAdjustments.jsx`

### `sendMessage` (node, mutation)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services/authApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`, `src/sections/ict/masterData/MasterData.jsx`

### `sendRequestToNeedToProcure` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/CentralStores.jsx`

### `setASCForMission` (php, mutation)
- **URL:** `update_mission_asc_by_id` · **POST**
- **Defined in:** `src/api/services/bookingsApi.js`
- **Used in:** `src/sections/management/bookings/BookingList.jsx`

### `setHrLeaveAdminTypeStatus` (node, mutation)
- **URL:** `/api/hr-leave/admin/types/status` · **POST**
- **Defined in:** `src/api/services NodeJs/hrLeaveApi.js`
- **Used in:** `src/sections/hr&admin/leave/LeaveTypesPanel.jsx`

### `setMappingEstateFinalized` (node, mutation)
- **URL:** `/api/mapping-hierarchy/estates/set-finalized` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `setMappingEstatePlanSizes` (node, mutation)
- **URL:** `/api/mapping-hierarchy/estates/set-plan-sizes` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `settleFuelGeneratorVoucher` (node, mutation)
- **URL:** `${BASE}/${id}/settle` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelGeneratorVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `settleFuelTransportVoucher` (node, mutation)
- **URL:** `/api/fuel-transport-vouchers/${id}/settle` · **POST**
- **Defined in:** `src/api/services NodeJs/fuelTransportVoucherApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `settleTransaction` (node, mutation)
- **URL:** `/api/financial-cards/transactions/settle` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `submitDayEndDjiRecord` (node, mutation)
- **URL:** `/api/day-end-process/submit-dji-record` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `submitDayEndTaskFlag` (node, mutation)
- **URL:** `/api/day-end-process/submit-task-flag` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `submitPlanActivateRequest` (node, mutation)
- **URL:** `/api/plan-activate-requests/submit` · **POST**
- **Defined in:** `src/api/services NodeJs/planActivateRequestsApi.js`
- **Used in:** `src/sections/opsroom/calendar/PlanCalendar.jsx`

### `submitResourceAllocation` (php, mutation)
- **URL:** `plan_resource_allocations` · **POST**
- **Defined in:** `src/api/services/summaryApi.js`
- **Used in:** `src/features/misc/ProceedPlan.jsx`

### `swapFieldToPlan` (node, mutation)
- **URL:** `/api/emergency-moving/swap-field` · **POST**
- **Defined in:** `src/api/services NodeJs/emergencyMovingApi.js`
- **Used in:** `src/sections/opsroom/emergency/EmergencyMoving.jsx`

### `syncNavbarPaths` (node, mutation)
- **URL:** `/api/feature-permissions/sync-navbar-paths` · **POST**
- **Defined in:** `src/api/services NodeJs/featurePermissionsApi.js`
- **Used in:** `src/sections/ict/authentication/AuthControls.jsx`

### `toggleMappingDivisionActivation` (node, mutation)
- **URL:** `/api/mapping-hierarchy/divisions/toggle-activation` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `toggleMappingEstateActivation` (node, mutation)
- **URL:** `/api/mapping-hierarchy/estates/toggle-activation` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `toggleMappingFieldActivation` (node, mutation)
- **URL:** `/api/mapping-hierarchy/fields/toggle-activation` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `toggleMappingGroupActivation` (node, mutation)
- **URL:** `/api/mapping-hierarchy/groups/toggle-activation` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `toggleMappingPlantationActivation` (node, mutation)
- **URL:** `/api/mapping-hierarchy/plantations/toggle-activation` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `toggleMappingRegionActivation` (node, mutation)
- **URL:** `/api/mapping-hierarchy/regions/toggle-activation` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `updateAdvanceFinanceStatus` (node, mutation)
- **URL:** `/api/vehicle-rent/advance-requests/finance-update/${id}` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/finance/driverAdvance/DriverAdvanceFinance.jsx`

### `updateAppVersion` (node, mutation)
- **URL:** `/api/app-versions/update` · **POST**
- **Defined in:** `src/api/services NodeJs/appVersionsApi.js`
- **Used in:** `src/sections/ict/appVersions/AppVersionManagement.jsx`

### `updateAssetsSectorBattery` (php, mutation)
- **URL:** `update_assets_sector_battery` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/hr&admin/assets/AssetsTransfer.jsx`, `src/sections/stock-assets/AssetTransfer.jsx`

### `updateAssetsSectorDrone` (php, mutation)
- **URL:** `update_assets_sector_drone` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/hr&admin/assets/AssetsTransfer.jsx`, `src/sections/stock-assets/AssetTransfer.jsx`

### `updateAssetsSectorGenerator` (php, mutation)
- **URL:** `update_assets_sector_generator` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/hr&admin/assets/AssetsTransfer.jsx`, `src/sections/stock-assets/AssetTransfer.jsx`

### `updateAssetsSectorRemoteControl` (php, mutation)
- **URL:** `update_assets_sector_remote_control` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/hr&admin/assets/AssetsTransfer.jsx`, `src/sections/stock-assets/AssetTransfer.jsx`

### `updateAssetsSectorVehicle` (php, mutation)
- **URL:** `update_assets_sector_vehicle` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/hr&admin/assets/AssetsTransfer.jsx`, `src/sections/stock-assets/AssetTransfer.jsx`

### `updateAssignmentPilotAndDrone` (node, mutation)
- **URL:** `/api/emergency-moving/update-assignment-pilot-drone` · **POST**
- **Defined in:** `src/api/services NodeJs/emergencyMovingApi.js`
- **Used in:** `src/sections/opsroom/emergency/EmergencyMoving.jsx`

### `updateBroker` (php, mutation)
- **URL:** `update_broker` · **POST**
- **Defined in:** `src/api/services/financeApi.js`
- **Used in:** `src/store/slices/financeSlice.js`

### `updateBrokerStatus` (php, mutation)
- **URL:** `update_broker_status` · **POST**
- **Defined in:** `src/api/services/financeApi.js`
- **Used in:** `src/store/slices/financeSlice.js`

### `updateCard` (node, mutation)
- **URL:** `/api/financial-cards/cards/${id}` · **PUT**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `updateChemical` (node, mutation)
- **URL:** `/api/chemicals/${id}` · **PUT**
- **Defined in:** `src/api/services NodeJs/chemicalsApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `updateDayEndOpsApproval` (node, mutation)
- **URL:** `/api/day-end-process/update-ops-approval` · **POST**
- **Defined in:** `src/api/services NodeJs/dayEndProcessApi.js`
- **Used in:** `src/sections/opsroom/dayend/DayEndProcess.jsx`

### `updateDjiImage` (node, mutation)
- **URL:** `/api/dji-images/${id}` · **PUT**
- **Defined in:** `src/api/services NodeJs/djiImagesApi.js`
- **Used in:** `src/sections/opsroom/dji/DjiMapUpload.jsx`

### `updateDrone` (node, mutation)
- **URL:** `/api/stock-assets/update_drone` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/features/misc/teamAllocationBottom.jsx`

### `updateDroneToPlan` (php, mutation)
- **URL:** `change_drone_to_plan` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/features/misc/teamAllocationBottom.jsx`

### `updateEmployeeRegistration` (node, mutation)
- **URL:** `${baseUrl}/api/employee-registration/update` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeRegistration.jsx`, `src/sections/hr&admin/Employees.jsx`, `src/sections/hr&admin/employeeProfile/EmployeePhotoUpload.jsx`, `src/sections/hr&admin/employeeProfile/EmployeeProfileCoreTabs.jsx`, `src/sections/hr&admin/employeeProfile/FamilyDependentsSection.jsx`, `src/sections/hr&admin/leave/LeaveManagement.jsx`

### `updateFarmer` (php, mutation)
- **URL:** `update_farmer` · **POST**
- **Defined in:** `src/api/services/farmersApi.js`
- **Used in:** `src/sections/management/bookings/AscBookings.jsx`

### `updateFieldArea` (node, mutation)
- **URL:** `${API}/fields/update-area` · **POST**
- **Defined in:** `src/api/services NodeJs/fieldSizeAdjustmentsApi.js`
- **Used in:** `src/sections/opsroom/fieldSizeAdjustments/FieldSizeAdjustments.jsx`

### `updateFinanceStatus` (node, mutation)
- **URL:** `/api/vehicle-rent/finance-update/${id}` · **POST**
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/finance/vehicleRent/VehicleRent.jsx`

### `updateGroupAssignedMissions` (php, mutation)
- **URL:** `update_group_assigned_to_missions` · **POST**
- **Defined in:** `src/api/services/groupAssignmentsApi.js`
- **Used in:** `src/features/nonp/nonpTeamAllocation.jsx`

### `updateHrMasterOption` (node, mutation)
- **URL:** `/api/hr-master-options/${id}` · **PUT**
- **Defined in:** `src/api/services NodeJs/hrMasterOptionsApi.js`
- **Used in:** `src/sections/ict/masterData/HrMasterOptionsPanel.jsx`

### `updateIctProject` (node, mutation)
- **URL:** `/api/ict-development/projects/update` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/SprintPlanning.jsx`

### `updateIctQaBugReportStatus` (node, mutation)
- **URL:** `/api/ict-development/work-items/qa-bugs/update-status` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevelopmentBoard.jsx`

### `updateIctWorkItemStatus` (node, mutation)
- **URL:** `/api/ict-development/work-items/update-status` · **POST**
- **Defined in:** `src/api/services NodeJs/ictDevelopmentApi.js`
- **Used in:** `src/sections/ict/development/DevelopmentBoard.jsx`, `src/sections/ict/development/ExtraWorkQueue.jsx`

### `updateInventoryItem` (node, mutation)
- **URL:** `/api/stock-assets/inventory-items/update` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/InventoryItemsRegistration.jsx`

### `updateMaintenanceStatus` (node, mutation)
- **URL:** `/api/maintenance/${id}/status` · **PATCH**
- **Defined in:** `src/api/services NodeJs/maintenanceApi.js`
- **Used in:** `src/sections/administration/Maintenance.jsx`

### `updateMappingField` (node, mutation)
- **URL:** `/api/mapping-hierarchy/fields/update` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/geo-spatial/mapping/MappingUpdatePage.jsx`

### `updateMappingPlantation` (node, mutation)
- **URL:** `/api/mapping-hierarchy/plantations/update` · **POST**
- **Defined in:** `src/api/services NodeJs/mappingHierarchyApi.js`
- **Used in:** `src/sections/strategic/corporateCustomers/CorporateCustomers.jsx`

### `updateMission` (php, mutation)
- **URL:** `update_mission_by_id` · **POST**
- **Defined in:** `src/api/services/bookingsApi.js`
- **Used in:** `src/sections/management/bookings/BookingList.jsx`

### `updateMissionDroneUnlock` (node, mutation)
- **URL:** `/api/pilot-assignment/drone-unlock/mission/${missionId}` · **PUT**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/drone-unlocking/DroneUnlockingQueue.jsx`

### `updateMissionPlannedDate` (php, mutation)
- **URL:** `update_mission_planned_date_by_id` · **POST**
- **Defined in:** `src/api/services/bookingsApi.js`
- **Used in:** `src/sections/management/bookings/BookingList.jsx`

### `updateMissionStatus` (php, mutation)
- **URL:** `update_mission_status_by_id` · **POST**
- **Defined in:** `src/api/services/bookingsApi.js`
- **Used in:** `src/sections/management/bookings/BookingList.jsx`

### `updatePilotToPlan` (php, mutation)
- **URL:** `change_pilot_to_plan` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/features/misc/teamAllocationBottom.jsx`

### `updatePlan` (php, mutation)
- **URL:** `update_plan` · **POST**
- **Defined in:** `src/api/services/plansApi.js`
- **Used in:** `src/features/calendar/CalenderWidget.jsx`, `src/features/misc/UpdateServices.jsx`, `src/store/slices/plansSlice.js`

### `updatePlanDivisionFieldArea` (node, mutation)
- **URL:** `${API}/plan-division-fields/update-area` · **POST**
- **Defined in:** `src/api/services NodeJs/fieldSizeAdjustmentsApi.js`
- **Used in:** `src/sections/opsroom/fieldSizeAdjustments/FieldSizeAdjustments.jsx`

### `updatePlanDroneUnlock` (node, mutation)
- **URL:** `/api/pilot-assignment/drone-unlock/plan/${planId}` · **PUT**
- **Defined in:** `src/api/services NodeJs/pilotAssignmentApi.js`
- **Used in:** `src/sections/opsroom/drone-unlocking/DroneUnlockingQueue.jsx`

### `updatePlanFieldBill` (node, mutation)
- **URL:** `/api/finance-report/plan-field-bill` · **POST**
- **Defined in:** `src/api/services NodeJs/financeReportApi.js`
- **Used in:** `src/sections/finance/reports/EstateSprayedAreaReport.jsx`

### `updatePlanStatusNode` (node, mutation)
- **URL:** `/api/plan-status/update` · **POST**
- **Defined in:** `src/api/services NodeJs/planStatusApi.js`
- **Used in:** `src/features/misc/DeactivatePlan.jsx`

### `updateProcurementRequestStatus` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/centralProcurementApi.js`
- **Used in:** `src/sections/stock-assets/ProcurementProcess.jsx`

### `updateReviewByDirectorOps` (php, mutation)
- **URL:** `update_review_for_flag_dops` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/corporate/charts/TaskReviewManagement.jsx`

### `updateReviewByReviewBoard` (php, mutation)
- **URL:** `update_review_for_flag_by_review_board` · **POST**
- **Defined in:** `src/api/services/reportsApi.js`
- **Used in:** `src/sections/corporate/charts/TaskReviewManagement.jsx`

### `updateSupplier` (node, mutation)
- **URL:** `/api/stock-assets/suppliers/update` · **POST**
- **Defined in:** `src/api/services NodeJs/stockAssetsApi.js`
- **Used in:** `src/sections/stock-assets/SuppliersList.jsx`

### `updateTaskOrders` (node, mutation)
- **URL:** `/api/user-job-descriptions/update-orders` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/JDManagement.jsx`

### `updateTeamDrone` (php, mutation)
- **URL:** `update_team_drone` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/misc/teamAllocationBottom.jsx`, `src/features/nonp/nonpTeamAllocationBottom.jsx`

### `updateTeamDroneNonPlantation` (php, mutation)
- **URL:** `update_non_plantaion_team_drone` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/nonp/nonpTeamAllocationBottom.jsx`

### `updateTeamPilot` (php, mutation)
- **URL:** `update_team_pilot` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/misc/teamAllocationBottom.jsx`, `src/features/nonp/nonpTeamAllocationBottom.jsx`

### `updateTeamPilotNonPlantation` (php, mutation)
- **URL:** `update_non_plantaion_team_pilot` · **POST**
- **Defined in:** `src/api/services/teamsApi.js`
- **Used in:** `src/features/nonp/nonpTeamAllocationBottom.jsx`

### `updateTimeOfDay` (node, mutation)
- **URL:** `/api/time-of-days/${id}` · **PUT**
- **Defined in:** `src/api/services NodeJs/timeOfDaysApi.js`
- **Used in:** `src/sections/ict/masterData/MasterData.jsx`

### `updateUser` (node, mutation)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/ict/users/Users.jsx`

### `updateUserJobDescription` (node, mutation)
- **URL:** `/api/user-job-descriptions/update` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/JDManagement.jsx`

### `updateUserJobRole` (node, mutation)
- **URL:** `/api/user-job-roles/update` · **POST**
- **Defined in:** `src/api/services NodeJs/jdManagementApi.js`
- **Used in:** `src/sections/hr&admin/JDManagement.jsx`

### `updateVehicle` (node, mutation)
- **URL:** `${baseUrl}/api/stock-assets/update_vehicle` · **POST**
- **Defined in:** `src/api/services/assetsApi.js`
- **Used in:** `src/sections/administration/vehicle-profile/VehicleProfile.jsx`

### `uploadDjiImage` (node, mutation)
- **URL:** `${getNodeBackendUrl()}/api/dji-images/upload` · **POST**
- **Defined in:** `src/api/services NodeJs/djiImagesApi.js`
- **Used in:** `src/sections/opsroom/dji/DjiMapUpload.jsx`

### `uploadEmployeeDocument` (node, mutation)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services NodeJs/employeeProfileApi.js`
- **Used in:** `src/sections/hr&admin/EmployeeProfileDetails.jsx`

### `uploadEmployeeProfileSectionFile` (node, mutation)
- **URL:** `(queryFn / dynamic)` · **POST**
- **Defined in:** `src/api/services NodeJs/employeeProfileApi.js`
- **Used in:** `src/sections/hr&admin/employeeProfile/ProfileRecordWithFileSection.jsx`

### `upsertFeaturePermission` (node, mutation)
- **URL:** `/api/feature-permissions` · **POST**
- **Defined in:** `src/api/services NodeJs/featurePermissionsApi.js`
- **Used in:** `src/sections/ict/authentication/AuthControls.jsx`

### `verifySecurityCodeAndGetCard` (node, mutation)
- **URL:** `/api/financial-cards/cards/verify-security` · **POST**
- **Defined in:** `src/api/services NodeJs/financialCardsApi.js`
- **Used in:** `src/sections/finance/financialCards/FinancialCards.jsx`

### `verifyVehicleDayRecord` (node, mutation)
- **URL:** `(queryFn / dynamic)`
- **Defined in:** `src/api/services NodeJs/vehicleRentApi.js`
- **Used in:** `src/sections/hr&admin/vehicleRentApprovals/VehicleRentApprovals.jsx`

---

## Unused APIs (defined in RTK, not referenced in src outside api/)

| Endpoint | Backend | Kind | URL | Service file |
|----------|---------|------|-----|--------------|
| `addTeamToMission` | php | mutation | `add_team_to_mission` | `src/api/services/teamsApi.js` |
| `assignIctWorkItemUsers` | node | mutation | `/api/ict-development/work-items/assign` | `src/api/services NodeJs/ictDevelopmentApi.js` |
| `cancelTempFleetAllocation` | node | mutation | `/api/fleet-equipment/temp/cancel` | `src/api/services NodeJs/fleetEquipmentApi.js` |
| `changeManagerRequestStatus` | php | mutation | `update_request_reschedule_date_by_manager` | `src/api/services/requestsApi.js` |
| `createAccidentReport` | node | mutation | `/api/accident-reports/create` | `src/api/services NodeJs/accidentReportsApi.js` |
| `createHrLeaveRequest` | node | mutation | `/api/hr-leave/request` | `src/api/services NodeJs/hrLeaveApi.js` |
| `decideHrLeaveRequest` | node | mutation | `/api/hr-leave/approvals/decide` | `src/api/services NodeJs/hrLeaveApi.js` |
| `deleteAccidentReport` | node | mutation | `/api/accident-reports/${id}` | `src/api/services NodeJs/accidentReportsApi.js` |
| `deleteAppVersion` | node | mutation | `/api/app-versions/delete` | `src/api/services NodeJs/appVersionsApi.js` |
| `deleteFeaturePermission` | node | mutation | `/api/feature-permissions/${id}` | `src/api/services NodeJs/featurePermissionsApi.js` |
| `deleteMaintenance` | node | mutation | `/api/maintenance/${id}` | `src/api/services NodeJs/maintenanceApi.js` |
| `deleteMappingDivision` | node | mutation | `/api/mapping-hierarchy/divisions/delete` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `deleteMappingEstate` | node | mutation | `/api/mapping-hierarchy/estates/delete` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `deleteMappingField` | node | mutation | `/api/mapping-hierarchy/fields/delete` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `deleteMappingGroup` | node | mutation | `/api/mapping-hierarchy/groups/delete` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `deleteMappingPlantation` | node | mutation | `/api/mapping-hierarchy/plantations/delete` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `deleteMappingRegion` | node | mutation | `/api/mapping-hierarchy/regions/delete` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `deletePlan` | php | mutation | `delete_plan` | `src/api/services/plansApi.js` |
| `deleteUser` | node | mutation | `/api/users/delete` | `src/api/services NodeJs/jdManagementApi.js` |
| `deployPilotAssignmentWithTransport` | node | mutation | `/api/pilot-assignment/deploy-with-transport` | `src/api/services NodeJs/pilotAssignmentApi.js` |
| `estimatePilotTransportDistance` | node | mutation | `/api/pilot-assignment/transport/estimate` | `src/api/services NodeJs/pilotAssignmentApi.js` |
| `getAdHocRequestsByDateRange` | php | query | `display_adhoc_plan_request_by_manager_app` | `src/api/services/requestsApi.js` |
| `getAllPlansSummary` | php | query | `find_plan_by_all` | `src/api/services/summaryApi.js` |
| `getAllRescheduleRequestsByManager` | php | query | `display_reschedule_date_for_plan_by_manager` | `src/api/services/requestsApi.js` |
| `getASCCalendarData` | php | query | `mission_count_by_date_for_month` | `src/api/services/bookingsApi.js` |
| `getASCPilotsAndDrones` | php | query | `asc_team_lead_and_pilot_list` | `src/api/services/teamsApi.js` |
| `getBatteries` | node | query | `/api/stock-assets/view_battery` | `src/api/services/assetsApi.js` |
| `getBookingCreationGroups` | node | query | `-` | `src/api/services NodeJs/bookingCreationApi.js` |
| `getCardById` | node | query | `/api/financial-cards/cards/get-by-id` | `src/api/services NodeJs/financialCardsApi.js` |
| `getCentralStoreRequests` | node | query | `-` | `src/api/services NodeJs/centralProcurementApi.js` |
| `getDjiImageById` | node | query | `/api/dji-images/${id}` | `src/api/services NodeJs/djiImagesApi.js` |
| `getEstateFieldsBreakdown` | node | query | `/api/plantation-dashboard/chart/breakdown/estate-fields` | `src/api/services NodeJs/plantationDashboardApi.js` |
| `getFlagReasons` | php | query | `flag_reasons` | `src/api/services/dropdownsApi.js` |
| `getGenerators` | node | query | `/api/stock-assets/view_generator` | `src/api/services/assetsApi.js` |
| `getHrApprovalsInbox` | node | query | `/api/hr-leave/approvals/inbox` | `src/api/services NodeJs/hrLeaveApi.js` |
| `getHrAttendanceLog` | node | query | `/api/hr-leave/attendance/log` | `src/api/services NodeJs/hrLeaveApi.js` |
| `getHrDashboard` | node | query | `/api/hr-leave/dashboard` | `src/api/services NodeJs/hrLeaveApi.js` |
| `getHrLeaveTypes` | node | query | `/api/hr-leave/types` | `src/api/services NodeJs/hrLeaveApi.js` |
| `getHrMyLeaveRequests` | node | query | `/api/hr-leave/my-requests` | `src/api/services NodeJs/hrLeaveApi.js` |
| `getInventoryItem` | node | query | `/api/stock-assets/inventory-items/view` | `src/api/services NodeJs/stockAssetsApi.js` |
| `getInvoiceMonthlyFuelPrice` | node | query | `/api/plantation-invoices/fuel-price${suffix}` | `src/api/services NodeJs/plantationInvoiceApi.js` |
| `getMainCategory` | node | query | `/api/stock-assets/main-categories/view` | `src/api/services NodeJs/stockAssetsApi.js` |
| `getMaintenanceById` | node | query | `/api/maintenance/${id}` | `src/api/services NodeJs/maintenanceApi.js` |
| `getMappingDivisions` | node | query | `/api/mapping-hierarchy/divisions` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `getMappingEstates` | node | query | `/api/mapping-hierarchy/estates` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `getMappingFields` | node | query | `/api/mapping-hierarchy/fields` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `getMappingFieldsByDivisionAll` | node | query | `/api/mapping-hierarchy/fields/by-division` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `getMappingGroup` | node | query | `/api/mapping-hierarchy/groups/view` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `getMappingMissionPartialReason` | node | query | `/api/mapping-hierarchy/mission-partial-reasons/view` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `getMappingPlantation` | node | query | `/api/mapping-hierarchy/plantations/view` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `getMappingRegions` | node | query | `/api/mapping-hierarchy/regions` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `getMissionResourceAllocations` | php | query | `display_mission_resource_allocations_by_id` | `src/api/services/bookingsApi.js` |
| `getMissionsByRequestedDate` | php | query | `search_mission_by_requested_date` | `src/api/services/bookingsApi.js` |
| `getMonthExport` | node | query | `/api/plantation-dashboard/chart/export-month` | `src/api/services NodeJs/plantationDashboardApi.js` |
| `getOpsroomReportPilots` | node | query | `-` | `src/api/services NodeJs/opsroomPerformanceSummaryApi.js` |
| `getPilotAssignmentById` | node | query | `/api/pilot-assignment/get` | `src/api/services NodeJs/pilotAssignmentApi.js` |
| `getPilotsAndDronesInTeams` | php | query | `display_pilots_and_drons_in_teams` | `src/api/services/teamsApi.js` |
| `getPlanCompletionStats` | node | query | `/api/day-end-process/plan-completion-stats` | `src/api/services NodeJs/dayEndProcessApi.js` |
| `getPlanSummary` | php | query | `find_plan_summary` | `src/api/services/plansApi.js` |
| `getPlansWithCompletionStats` | node | query | `/api/day-end-process/plans-completion-stats` | `src/api/services NodeJs/dayEndProcessApi.js` |
| `getPlantationMonthlyPlanRequestsPendingCount` | node | query | `/api/plantation-monthly-plan-requests/pending-count` | `src/api/services NodeJs/plantationDashboardApi.js` |
| `getPlantationPlanRequestOpsCalendarPlans` | node | query | `-` | `src/api/services NodeJs/plantationDashboardApi.js` |
| `getRejectReasons` | php | query | `display_reject_reasons` | `src/api/services/dropdownsApi.js` |
| `getRemoteControls` | node | query | `/api/stock-assets/view_remote_control` | `src/api/services/assetsApi.js` |
| `getReportingChain` | node | query | `/api/organization/reporting-chain` | `src/api/services NodeJs/employeeProfileApi.js` |
| `getSharedDesignationsForTask` | node | query | `/api/user-job-descriptions/shared-designations` | `src/api/services NodeJs/jdManagementApi.js` |
| `getSubCategory` | node | query | `/api/stock-assets/sub-categories/view` | `src/api/services NodeJs/stockAssetsApi.js` |
| `getSubSubCategory` | node | query | `/api/stock-assets/sub-sub-categories/view` | `src/api/services NodeJs/stockAssetsApi.js` |
| `getSupplier` | node | query | `/api/stock-assets/suppliers/view` | `src/api/services NodeJs/stockAssetsApi.js` |
| `getTaskReport` | php | query | `search_task_flag_by_task_id` | `src/api/services/tasksApi.js` |
| `getTasksByPlanAndField` | php | query | `display_tasks_by_plan_and_field` | `src/api/services/tasksApi.js` |
| `getUnlinkedDjiImages` | node | query | `/api/dji-images/unlinked/${date}` | `src/api/services NodeJs/djiImagesApi.js` |
| `getUsedVehicles` | node | query | `/api/vehicle-rent/used-vehicles` | `src/api/services NodeJs/vehicleRentApi.js` |
| `getUserById` | node | query | `/api/users/view` | `src/api/services NodeJs/jdManagementApi.js` |
| `getUserJobDescriptionById` | node | query | `/api/user-job-descriptions/view` | `src/api/services NodeJs/jdManagementApi.js` |
| `getUserJobRoleById` | node | query | `/api/user-job-roles/view` | `src/api/services NodeJs/jdManagementApi.js` |
| `getUserJobRoleWithDescriptions` | node | query | `/api/user-job-roles/descriptions` | `src/api/services NodeJs/jdManagementApi.js` |
| `getVehicles` | node | query | `/api/stock-assets/view_vehicle` | `src/api/services/assetsApi.js` |
| `getWorkSummaryBillingDraft` | node | query | `-` | `src/api/services NodeJs/financeWorkSummaryBillingApi.js` |
| `linkDjiImageToTask` | node | mutation | `/api/dji-images/link` | `src/api/services NodeJs/djiImagesApi.js` |
| `loginUser` | php | mutation | `login` | `src/api/services/authApi.js` |
| `logSubtaskStatus` | php | mutation | `sub_tasks_status_log` | `src/api/services/tasksApi.js` |
| `markHrAttendance` | node | mutation | `/api/hr-leave/attendance/mark` | `src/api/services NodeJs/hrLeaveApi.js` |
| `markMultipleNotificationsAsDisplayed` | node | mutation | `/api/notifications/mark-displayed` | `src/api/services NodeJs/notificationsApi.js` |
| `markPlantationPlanRequestApproved` | node | mutation | `/api/plantation-plan-requests/${id}/mark-approved` | `src/api/services NodeJs/plantationDashboardApi.js` |
| `removeFleetBattery` | node | mutation | `/api/fleet-equipment/remove/battery` | `src/api/services NodeJs/fleetEquipmentApi.js` |
| `removeFleetDrone` | node | mutation | `/api/fleet-equipment/remove/drone` | `src/api/services NodeJs/fleetEquipmentApi.js` |
| `removeFleetGenerator` | node | mutation | `/api/fleet-equipment/remove/generator` | `src/api/services NodeJs/fleetEquipmentApi.js` |
| `removeFleetRemoteControl` | node | mutation | `/api/fleet-equipment/remove/remote-control` | `src/api/services NodeJs/fleetEquipmentApi.js` |
| `reportTask` | php | mutation | `flag_task_by_id` | `src/api/services/tasksApi.js` |
| `searchBrokerById` | php | query | `search_broker_by_id` | `src/api/services/financeApi.js` |
| `searchEmployee` | node | query | `/api/users/search-employee` | `src/api/services NodeJs/jdManagementApi.js` |
| `searchMappingFields` | node | query | `/api/mapping-hierarchy/fields/search` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `sendOTP` | php | mutation | `send_sms_with_custom_body` | `src/api/services/authApi.js` |
| `setASCTeamLead` | php | mutation | `update_mission_team_lead_by_id` | `src/api/services/bookingsApi.js` |
| `settleApprovedTransactions` | node | mutation | `/api/financial-cards/settle` | `src/api/services NodeJs/financialCardsApi.js` |
| `submitDJIRecord` | php | mutation | `submit_dji_record_by_task` | `src/api/services/tasksApi.js` |
| `submitManagerRescheduleRequest` | php | mutation | `create_plan` | `src/api/services/requestsApi.js` |
| `submitMissionResourceAllocation` | php | mutation | `mission_resource_allocations` | `src/api/services/summaryApi.js` |
| `submitRescheduledPlan` | php | mutation | `create_plan` | `src/api/services/requestsApi.js` |
| `updateAccidentReport` | node | mutation | `/api/accident-reports/${id}` | `src/api/services NodeJs/accidentReportsApi.js` |
| `updateAdHocRequest` | php | mutation | `update_status_adhoc_plan_request_by_manager_app` | `src/api/services/requestsApi.js` |
| `updateBattery` | node | mutation | `/api/stock-assets/update_battery` | `src/api/services/assetsApi.js` |
| `updateGenerator` | node | mutation | `/api/stock-assets/update_generator` | `src/api/services/assetsApi.js` |
| `updateMainCategory` | node | mutation | `/api/stock-assets/main-categories/update` | `src/api/services NodeJs/stockAssetsApi.js` |
| `updateMaintenance` | node | mutation | `/api/maintenance/${id}` | `src/api/services NodeJs/maintenanceApi.js` |
| `updateMappingDivision` | node | mutation | `/api/mapping-hierarchy/divisions/update` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `updateMappingEstate` | node | mutation | `/api/mapping-hierarchy/estates/update` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `updateMappingGroup` | node | mutation | `/api/mapping-hierarchy/groups/update` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `updateMappingRegion` | node | mutation | `/api/mapping-hierarchy/regions/update` | `src/api/services NodeJs/mappingHierarchyApi.js` |
| `updateOpsApproval` | php | mutation | `update_d_ops_approval_for_plan` | `src/api/services/plansApi.js` |
| `updateOpsTaskStatus` | node | mutation | `/api/day-end-process/update-ops-task-status` | `src/api/services NodeJs/dayEndProcessApi.js` |
| `updatePlanDate` | php | mutation | `update_plan_date_by_plan_id` | `src/api/services/plansApi.js` |
| `updateRemoteControl` | node | mutation | `/api/stock-assets/update_remote_control` | `src/api/services/assetsApi.js` |
| `updateRescheduleRequest` | php | mutation | `update_reschedule_date_status_for_plan_by_manager` | `src/api/services/requestsApi.js` |
| `updateSubCategory` | node | mutation | `${baseUrl}/api/stock-assets/sub-categories/update` | `src/api/services NodeJs/stockAssetsApi.js` |
| `updateSubSubCategory` | node | mutation | `${baseUrl}/api/stock-assets/sub-sub-categories/update` | `src/api/services NodeJs/stockAssetsApi.js` |
| `updateSubtaskApproval` | php | mutation | `update_ops_room_approval_for_sub_task` | `src/api/services/tasksApi.js` |
| `verifyUser` | node | mutation | `check_mobile_no_availability_all` | `src/api/services/authApi.js` |

---

## Direct fetch / non-RTK API calls

| URL pattern | File |
|-------------|------|
| `${baseUrl}/api/stock-assets/create_vehicle` | `src/api/services/assetsApi.js` |
| `${baseUrl}/api/stock-assets/update_vehicle` | `src/api/services/assetsApi.js` |
| `${baseUrl}/api/stock-assets/create_vehicle` | `src/api/services/assetsApi.js` |
| `${baseUrl}/api/stock-assets/update_vehicle` | `src/api/services/assetsApi.js` |
| `${getNodeBackendUrl()}/api/public/send-otp-textware` | `src/api/services/authApi.js` |
| `${getNodeBackendUrl()}/api/public/send-otp-textware` | `src/api/services/authApi.js` |
| `/api/public/send-otp-textware` | `src/api/services/authApi.js` |
| `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json&countryCode=${countryCode}` | `src/api/services/weatherApi.js` |
| `https://api.open-meteo.com/v1/forecast?${params.toString()}` | `src/api/services/weatherApi.js` |
| `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json&countryCode=${countryCode}` | `src/api/services/weatherApi.js` |
| `https://api.open-meteo.com/v1/forecast?${params.toString()}` | `src/api/services/weatherApi.js` |
| `${baseUrl}${url}` | `src/api/services NodeJs/centralProcurementApi.js` |
| `${baseUrl}${url}` | `src/api/services NodeJs/centralProcurementApi.js` |
| `${getNodeBackendUrl()}/api/dji-images/upload` | `src/api/services NodeJs/djiImagesApi.js` |
| `${getNodeBackendUrl()}/api/dji-images/upload` | `src/api/services NodeJs/djiImagesApi.js` |
| `/api/dji-images/upload` | `src/api/services NodeJs/djiImagesApi.js` |
| `${getNodeBackendUrl()}/api/employee-profile/${section}/upload-file` | `src/api/services NodeJs/employeeProfileApi.js` |
| `${getNodeBackendUrl()}/api/employee-documents/upload` | `src/api/services NodeJs/employeeProfileApi.js` |
| `${getNodeBackendUrl()}/api/employee-profile/${section}/upload-file` | `src/api/services NodeJs/employeeProfileApi.js` |
| `${getNodeBackendUrl()}/api/employee-documents/upload` | `src/api/services NodeJs/employeeProfileApi.js` |
| `/api/employee-profile/${section}/upload-file` | `src/api/services NodeJs/employeeProfileApi.js` |
| `/api/employee-documents/upload` | `src/api/services NodeJs/employeeProfileApi.js` |
| `${getNodeBackendUrl()}/api/ict-development/work-items/qa-bugs/create` | `src/api/services NodeJs/ictDevelopmentApi.js` |
| `${getNodeBackendUrl()}/api/ict-development/work-items/qa-bugs/create` | `src/api/services NodeJs/ictDevelopmentApi.js` |
| `/api/ict-development/work-items/qa-bugs/create` | `src/api/services NodeJs/ictDevelopmentApi.js` |
| `${baseUrl}/api/employee-registration/create` | `src/api/services NodeJs/jdManagementApi.js` |
| `${baseUrl}/api/employee-registration/update` | `src/api/services NodeJs/jdManagementApi.js` |
| `${baseUrl}/api/users/create` | `src/api/services NodeJs/jdManagementApi.js` |
| `${baseUrl}/api/users/update` | `src/api/services NodeJs/jdManagementApi.js` |
| `${baseUrl}/api/employee-registration/create` | `src/api/services NodeJs/jdManagementApi.js` |
| `${baseUrl}/api/employee-registration/update` | `src/api/services NodeJs/jdManagementApi.js` |
| `${baseUrl}/api/users/create` | `src/api/services NodeJs/jdManagementApi.js` |
| `${baseUrl}/api/users/update` | `src/api/services NodeJs/jdManagementApi.js` |
| `${baseUrl}/api/public/registration-options` | `src/api/services NodeJs/publicRegistrationApi.js` |
| `${baseUrl}/api/public/registration-options` | `src/api/services NodeJs/publicRegistrationApi.js` |
| `${baseUrl}/api/stock-assets/sub-categories/create` | `src/api/services NodeJs/stockAssetsApi.js` |
| `${baseUrl}/api/stock-assets/sub-categories/update` | `src/api/services NodeJs/stockAssetsApi.js` |
| `${baseUrl}/api/stock-assets/sub-sub-categories/create` | `src/api/services NodeJs/stockAssetsApi.js` |
| `${baseUrl}/api/stock-assets/sub-sub-categories/update` | `src/api/services NodeJs/stockAssetsApi.js` |
| `${baseUrl}/api/stock-assets/sub-categories/create` | `src/api/services NodeJs/stockAssetsApi.js` |
| `${baseUrl}/api/stock-assets/sub-categories/update` | `src/api/services NodeJs/stockAssetsApi.js` |
| `${baseUrl}/api/stock-assets/sub-sub-categories/create` | `src/api/services NodeJs/stockAssetsApi.js` |
| `${baseUrl}/api/stock-assets/sub-sub-categories/update` | `src/api/services NodeJs/stockAssetsApi.js` |
| `${API_BASE_URL}create_user` | `src/pages/Register.jsx` |
| `${API_BASE_URL}create_user` | `src/pages/Register.jsx` |
| `/api/uploads/documents/quotations/${encodeURIComponent(quotationForm.existing_scanned_document)}` | `src/sections/stock-assets/ProcurementProcess.jsx` |
| `/api/uploads/documents/quotations/${encodeURIComponent(q.scanned_document)}` | `src/sections/stock-assets/ProcurementProcess.jsx` |
| `/api/uploads/documents/quotations/${encodeURIComponent(finalizedQuotationForPo.scanned_document)}` | `src/sections/stock-assets/ProcurementProcess.jsx` |
| `/api/uploads/documents/quotations/${encodeURIComponent(finalizedQuotationForPo.scanned_document)}` | `src/sections/stock-assets/ProcurementProcess.jsx` |
| `/api/uploads/documents/quotations/${encodeURIComponent(finalizedQuotationForPo.scanned_document)}` | `src/sections/stock-assets/ProcurementProcess.jsx` |
| `${AUTH_PUBLIC_BASE}/request-otp` | `src/store/slices/authSlice.js` |
| `${AUTH_PUBLIC_BASE}/verify-otp` | `src/store/slices/authSlice.js` |
| `${AUTH_PUBLIC_BASE}/request-otp` | `src/store/slices/authSlice.js` |
| `${AUTH_PUBLIC_BASE}/verify-otp` | `src/store/slices/authSlice.js` |
| `/api/public/login` | `src/store/slices/authSlice.js` |

---

## Resource locations

### Configured in `src/utils/resourceUrls.js` (used by `getResourceUrl`)

| Type | Path |
|------|------|
| `ACCIDENT_IMAGE` | `/uploads/images/accident_image` |
| `ACCIDENT_VIDEO` | `/uploads/images/accident_image` |
| `ACCIDENT_VOICE` | `/uploads/images/accident_voice` |
| `USER_PROFILE_IMAGE` | `/uploads/images/user` |
| `DJI_SCREEN_IMAGE` | `/uploads/images/screen/dji` |
| `WAYPOINT_IMAGE` | `/uploads/images/screen/waypoint` |
| `PILOT_IMAGE` | `/uploads/images/screen/task` |
| `GROUP_LOGO_IMAGE` | `/uploads/images/logo` |
| `VEHICLE_DAY` | `/uploads/vehicle_day` |

### Backend `resourceLocations.js` — referenced in web via `getResourceUrl` / `resolveMediaUrl`

- **`DJI_SCREEN_IMAGE`** → `/uploads/images/screen/dji` — `src/sections/opsroom/dayend/DayEndProcess.jsx`
- **`VEHICLE_DAY`** → `/uploads/vehicle_day` — `src/sections/finance/vehicleRent/VehicleRent.jsx`

### Backend resource types **not** referenced in web (no `getResourceUrl('TYPE')` usage)

- `ACCIDENT_IMAGE` → `/uploads/images/accident_image`
- `ACCIDENT_VIDEO` → `/uploads/images/accident_image`
- `ACCIDENT_VOICE` → `/uploads/images/accident_voice`
- `EMPLOYEE_BIRTH_CERTIFICATE` → `/documents/employees/birth_certificate`
- `EMPLOYEE_DOCUMENT` → `/documents/employees/documents`
- `EMPLOYEE_EDUCATION_CERTIFICATES` → `/documents/employees/education_certificates`
- `EMPLOYEE_GND_CERTIFICATE` → `/documents/employees/gnd_certificate`
- `EMPLOYEE_HEALTH_REPORT` → `/documents/employees/health_report`
- `EMPLOYEE_MARRIED_CERTIFICATE` → `/documents/employees/married_certificate`
- `EMPLOYEE_PHOTO` → `/documents/employees/photos`
- `EMPLOYEE_POLICE_REPORT` → `/documents/employees/police_report`
- `EMPLOYEE_SERVICE_LETTERS` → `/documents/employees/service_letters`
- `GROUP_LOGO_IMAGE` → `/uploads/images/logo`
- `LEAVE_ATTACHMENT` → `/documents/leave_attachments`
- `MAINTENANCE_REQUEST_IMAGE` → `/uploads/maintenance_requests`
- `PILOT_IMAGE` → `/uploads/images/screen/task`
- `QA_BUG_REPORT_IMAGE` → `/uploads/qa_bug_reports`
- `QUOTATION_DOCUMENT` → `/uploads/documents/quotations`
- `SUB_CATEGORY_IMAGE` → `/sub_categories`
- `SUB_SUB_CATEGORY_IMAGE` → `/sub_sub_categories`
- `TRANSACTION_IMAGE` → `/uploads/transactions`
- `USER_PROFILE_IMAGE` → `/uploads/images/user`
- `VEHICLE_DRIVER_LICENSE_BACK` → `/documents/vehicles/driver_license_back`
- `VEHICLE_DRIVER_LICENSE_FRONT` → `/documents/vehicles/driver_license_front`
- `VEHICLE_IMAGE` → `/documents/vehicles/vehicle_image`
- `VEHICLE_INSURANCE` → `/documents/vehicles/insurance`
- `VEHICLE_REGISTRATION_DOCUMENT` → `/documents/vehicles/registration`
- `VEHICLE_REVENUE_LICENSE` → `/documents/vehicles/revenue_license`
- `VEHICLE_SMOKE_TEST` → `/documents/vehicles/smoke_test`
- `WAYPOINT_IMAGE` → `/uploads/images/screen/waypoint`

### Hardcoded `/uploads/` or `/documents/` paths in web (outside `resourceUrls.js`)

- `/uploads/employees/*` — `src/sections/hr&admin/EmployeeRegistration.jsx`
- `/uploads/images/accident_image` — `src/utils/resourceUrls.js`
- `/uploads/images/accident_voice` — `src/utils/resourceUrls.js`
- `/uploads/images/logo` — `src/utils/resourceUrls.js`
- `/uploads/images/screen/dji` — `src/utils/resourceUrls.js`
- `/uploads/images/screen/task` — `src/utils/resourceUrls.js`
- `/uploads/images/screen/waypoint` — `src/utils/resourceUrls.js`
- `/uploads/images/user` — `src/utils/resourceUrls.js`
- `/uploads/maintenance_requests/` — `src/sections/transport/TransportHrDashboard.jsx`
- `/uploads/maintenance_requests/*` — `src/sections/transport/TransportHrDashboard.jsx`
- `/uploads/transactions/*` — `src/sections/transport/TransportHrDashboard.jsx`
- `/uploads/vehicle_day` — `src/utils/resourceUrls.js`
- `/uploads/vehicle_day/` — `src/sections/transport/TransportHrDashboard.jsx`
- `/uploads/vehicle_day/*` — `src/sections/transport/TransportHrDashboard.jsx`

---

_Re-run: `node scripts/api-usage-report.js` (markdown to stdout) or `--json` for machine output._