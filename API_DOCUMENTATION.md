# API Documentation DSMS Kenilworth International
**Last Updated:** 2025/01/15  
**Author:** Sandun Madhubhashana

## Overview
This document provides comprehensive documentation for the Drone Operations Management System (DSMS) API. The system has been fully migrated to **Redux Toolkit Query (RTK Query)** architecture, replacing the legacy Axios-based implementation.

**Base URLs:**
- **Development:** `https://drone-admin-test.kenilworthinternational.com/api/`
- **Production:** `https://drone-admin.kenilworthinternational.com/api/`

The base URL is automatically selected based on the environment configuration in `src/config/config.js`.

## Authentication
All endpoints (except login and verification) require Bearer token authentication. The token is automatically retrieved from localStorage (`userData.token`) and included in the Authorization header by RTK Query's base query configuration.

```javascript
Authorization: Bearer <token>
```

---

## RTK Query Architecture

### Entry Points
- **Base API:** `import { baseApi } from '../api/baseApi';`
- **All Endpoints:** `import { baseApi } from '../api/services/allEndpoints';`
- **Service-specific hooks:** `import { useGetAllEstatesQuery } from '../api/services/estatesApi';`

### Service Organization (`src/api/services/`)
The API is organized into domain-specific service files:

1. **`authApi.js`** – Authentication, login, OTP, verification
2. **`estatesApi.js`** – Groups, plantations, regions, estates, divisions, fields
3. **`plansApi.js`** – Plan CRUD, calendar, resource allocation, operations approval
4. **`teamsApi.js`** – Team composition, pilots, drones, ASC assignments
5. **`bookingsApi.js`** – Mission creation, ASC scheduling, farmer data
6. **`operatorsApi.js`** – Operator directory and assignments
7. **`assetsApi.js`** – Drones, vehicles, generators, batteries, insurance
8. **`financeApi.js`** – Broker management, pilot earnings, revenue reports
9. **`reportsApi.js`** – Corporate/ops analytical reports, chart data
10. **`summaryApi.js`** – Aggregated coverage, calendar summaries
11. **`requestsApi.js`** – Ad-hoc, reschedule, non-plantation requests
12. **`groupAssignmentsApi.js`** – Group↔mission mapping
13. **`tasksApi.js`** – Sub-task approvals, logs, DJI uploads, flags
14. **`dropdownsApi.js`** – Mission metadata lists (crops, chemicals, stages, reasons)
15. **`farmersApi.js`** – Farmer lookup and persistence

### Usage Patterns

#### Component-level Hooks (Recommended)
```javascript
import { useGetAllEstatesQuery } from '../api/services/estatesApi';

function MyComponent() {
  const { data, isLoading, error, refetch } = useGetAllEstatesQuery();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render data */}</div>;
}
```

#### Manual Dispatch (for Thunks/Actions)
```javascript
import { baseApi } from '../api/baseApi';
import { useAppDispatch } from '../store/hooks';

const dispatch = useAppDispatch();
const result = await dispatch(baseApi.endpoints.getAllEstates.initiate());
const data = result.data;
```

#### Mutations (Create/Update/Delete)
```javascript
import { useCreatePlanMutation } from '../api/services/plansApi';

function CreatePlanForm() {
  const [createPlan, { isLoading, error }] = useCreatePlanMutation();
  
  const handleSubmit = async (formData) => {
    try {
      const result = await createPlan(formData).unwrap();
      console.log('Plan created:', result);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### Lazy Queries (Trigger on Demand)
```javascript
import { useLazyGetFarmerByNICQuery } from '../api/services/farmersApi';

function FarmerLookup() {
  const [getFarmer, { data, isLoading }] = useLazyGetFarmerByNICQuery();
  
  const handleSearch = (nic) => {
    getFarmer(nic);
  };
  
  return <div>{/* Search form */}</div>;
}
```

---

## API Endpoints by Service

### Authentication (`authApi.js`)

#### Verify User
**Endpoint:** `verifyUser`  
**Type:** Mutation  
**Hook:** `useVerifyUserMutation`  
**URL:** `/check_mobile_no_availability_all`  
**Method:** POST

**Parameters:**
- `phoneNumber` (string, required): Mobile number to verify

**Request:**
```json
{
  "mobile_no": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mobile number is available"
}
```

---

#### Login User
**Endpoint:** `loginUser`  
**Type:** Mutation  
**Hook:** `useLoginUserMutation`  
**URL:** `/login`  
**Method:** POST

**Parameters:**
- `phoneNumber` (string, required): Mobile number for login

**Request:**
```json
{
  "mobile_no": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "mobile_no": "+1234567890"
  }
}
```

---

#### Send OTP
**Endpoint:** `sendOTP`  
**Type:** Mutation  
**Hook:** `useSendOTPMutation`  
**URL:** `/send_sms_with_custom_body`  
**Method:** POST

**Parameters:**
- `mobile_no` (string, required): Mobile number
- `otp` (string, required): OTP code

---

### Estates & Geography (`estatesApi.js`)

#### Get All Groups
**Endpoint:** `getGroups`  
**Type:** Query  
**Hook:** `useGetGroupsQuery`  
**URL:** `/display_groups`  
**Method:** POST

**Parameters:** None

---

#### Get Plantations by Group
**Endpoint:** `getPlantationsByGroup`  
**Type:** Query  
**Hook:** `useGetPlantationsByGroupQuery`  
**URL:** `/display_plantation`  
**Method:** POST

**Parameters:**
- `groupId` (number, required): Group ID

**Request:**
```json
{
  "group": 1
}
```

---

#### Get Regions by Plantation
**Endpoint:** `getRegionsByPlantation`  
**Type:** Query  
**Hook:** `useGetRegionsByPlantationQuery`  
**URL:** `/display_region`  
**Method:** POST

**Parameters:**
- `plantationId` (number, required): Plantation ID

---

#### Get Estates by Region
**Endpoint:** `getEstatesByRegion`  
**Type:** Query  
**Hook:** `useGetEstatesByRegionQuery`  
**URL:** `/display_estate`  
**Method:** POST

**Parameters:**
- `regionId` (number, required): Region ID

---

#### Get All Plantations
**Endpoint:** `getAllPlantations`  
**Type:** Query  
**Hook:** `useGetAllPlantationsQuery`  
**URL:** `/display_all_plantation`  
**Method:** POST

---

#### Get All Estates
**Endpoint:** `getAllEstates`  
**Type:** Query  
**Hook:** `useGetAllEstatesQuery`  
**URL:** `/display_all_estates`  
**Method:** POST

---

#### Get Estates by Plantation
**Endpoint:** `getEstatesByPlantation`  
**Type:** Query  
**Hook:** `useGetEstatesByPlantationQuery`  
**URL:** `/display_estate_by_plantation`  
**Method:** POST

**Parameters:**
- `plantationId` (number, required): Plantation ID

---

#### Get Estate Details
**Endpoint:** `getEstateDetails`  
**Type:** Query  
**Hook:** `useGetEstateDetailsQuery`  
**URL:** `/estate_profile`  
**Method:** POST

**Parameters:**
- `estateId` (number, required): Estate ID

---

#### Get Divisions by Estate
**Endpoint:** `getDivisionsByEstate`  
**Type:** Query  
**Hook:** `useGetDivisionsByEstateQuery`  
**URL:** `/display_division_field_by_estate`  
**Method:** POST

**Parameters:**
- `estateId` (number, required): Estate ID

---

#### Get Field Details
**Endpoint:** `getFieldDetails`  
**Type:** Query  
**Hook:** `useGetFieldDetailsQuery`  
**URL:** `/details_by_field`  
**Method:** POST

**Parameters:**
- `fieldId` (number, required): Field ID

---

### Plans (`plansApi.js`)

#### Get Plans by Date
**Endpoint:** `getPlansByDate`  
**Type:** Query  
**Hook:** `useGetPlansByDateQuery`  
**URL:** `/find_plans_by_date`  
**Method:** POST

**Parameters:**
- `date` (string, required): Date in YYYY-MM-DD format

---

#### Get Plans by Date Range
**Endpoint:** `getPlansByDateRange`  
**Type:** Query  
**Hook:** `useGetPlansByDateRangeQuery`  
**URL:** `/find_plans_by_date_range`  
**Method:** POST

**Parameters:**
- `startDate` (string, required): Start date (YYYY-MM-DD)
- `endDate` (string, required): End date (YYYY-MM-DD)

---

#### Get Plan by ID
**Endpoint:** `getPlanById`  
**Type:** Query  
**Hook:** `useGetPlanByIdQuery`  
**URL:** `/find_plan`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Plan ID

---

#### Get Plan Summary
**Endpoint:** `getPlanSummary`  
**Type:** Query  
**Hook:** `useGetPlanSummaryQuery`  
**URL:** `/find_plan_summary`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Plan ID

---

#### Get Plan Resource Allocation
**Endpoint:** `getPlanResourceAllocation`  
**Type:** Query  
**Hook:** `useGetPlanResourceAllocationQuery`  
**URL:** `/get_plan_resource_allocation_details`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Plan ID

---

#### Create Plan
**Endpoint:** `createPlan`  
**Type:** Mutation  
**Hook:** `useCreatePlanMutation`  
**URL:** `/create_plan`  
**Method:** POST

**Request Example:**
```json
{
  "estate": 1,
  "mission_type": 2,
  "crop_type": 3,
  "planned_date": "2024-01-15",
  "chemical_type": 1,
  "area": 100.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Plan created successfully",
  "id": 123
}
```

---

#### Update Plan
**Endpoint:** `updatePlan`  
**Type:** Mutation  
**Hook:** `useUpdatePlanMutation`  
**URL:** `/update_plan`  
**Method:** POST

**Parameters:**
- `planData` (object, required): Updated plan data (must include `plan` ID)

---

#### Delete Plan
**Endpoint:** `deletePlan`  
**Type:** Mutation  
**Hook:** `useDeletePlanMutation`  
**URL:** `/delete_plan`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Plan ID

---

#### Change Plan Status
**Endpoint:** `changePlanStatus`  
**Type:** Mutation  
**Hook:** `useChangePlanStatusMutation`  
**URL:** `/plan_change_status`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Plan ID
- `status` (string, required): New status

---

#### Update Plan Date
**Endpoint:** `updatePlanDate`  
**Type:** Mutation  
**Hook:** `useUpdatePlanDateMutation`  
**URL:** `/update_plan_date_by_plan_id`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Plan ID
- `date` (string, required): New date (YYYY-MM-DD)

---

#### Update Drone to Plan
**Endpoint:** `updateDroneToPlan`  
**Type:** Mutation  
**Hook:** `useUpdateDroneToPlanMutation`  
**URL:** `/change_drone_to_plan`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Plan ID
- `droneId` (number, required): Drone ID

---

#### Update Pilot to Plan
**Endpoint:** `updatePilotToPlan`  
**Type:** Mutation  
**Hook:** `useUpdatePilotToPlanMutation`  
**URL:** `/change_pilot_to_plan`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Plan ID
- `pilotId` (number, required): Pilot ID

---

#### Get Calendar Data
**Endpoint:** `getCalendarData`  
**Type:** Query  
**Hook:** `useGetCalendarDataQuery`  
**URL:** `/find_plans_by_estate_and_crop_and_mission_type_date_range`  
**Method:** POST

**Parameters:**
- `estateId` (number, optional): Estate ID
- `cropType` (number, optional): Crop type ID
- `missionType` (number, optional): Mission type ID
- `startDate` (string, required): Start date
- `endDate` (string, required): End date
- `location` (string, optional): Location context (e.g., "new_plan")

---

#### Update Operations Approval
**Endpoint:** `updateOpsApproval`  
**Type:** Mutation  
**Hook:** `useUpdateOpsApprovalMutation`  
**URL:** `/update_d_ops_approval_for_plan`  
**Method:** POST

**Parameters:**
- `plan` (number, required): Plan ID
- `status` (string, required): Approval status

---

### Teams (`teamsApi.js`)

#### Get Pilots and Drones
**Endpoint:** `getPilotsAndDrones`  
**Type:** Query  
**Hook:** `useGetPilotsAndDronesQuery`  
**URL:** `/team_lead_and_pilot_list`  
**Method:** POST

---

#### Get ASC Pilots and Drones
**Endpoint:** `getASCPilotsAndDrones`  
**Type:** Query  
**Hook:** `useGetASCPilotsAndDronesQuery`  
**URL:** `/asc_team_lead_and_pilot_list`  
**Method:** POST

---

#### Get Drones List
**Endpoint:** `getDronesList`  
**Type:** Query  
**Hook:** `useGetDronesListQuery`  
**URL:** `/drone_list`  
**Method:** POST

---

#### Get Team Data
**Endpoint:** `getTeamData`  
**Type:** Query  
**Hook:** `useGetTeamDataQuery`  
**URL:** `/display_all_team_pilot_drone`  
**Method:** POST

---

#### Get Team Data (Non-Plantation)
**Endpoint:** `getTeamDataNonPlantation`  
**Type:** Query  
**Hook:** `useGetTeamDataNonPlantationQuery`  
**URL:** `/display_all_non_plantaion_team_pilot_drone`  
**Method:** POST

---

#### Add Team to Plan
**Endpoint:** `addTeamToPlan`  
**Type:** Mutation  
**Hook:** `useAddTeamToPlanMutation`  
**URL:** `/add_team_to_plan`  
**Method:** POST

**Parameters:**
- `plan_id` or `plan` (number, required): Plan ID
- `team_id` or `team` (number, required): Team ID

---

#### Add Team to Mission
**Endpoint:** `addTeamToMission`  
**Type:** Mutation  
**Hook:** `useAddTeamToMissionMutation`  
**URL:** `/add_team_to_mission`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Mission/Plan ID
- `teamId` (number, required): Team ID

---

#### Add Drone or Pilot to Pool
**Endpoint:** `addDroneOrPilotToPool`  
**Type:** Mutation  
**Hook:** `useAddDroneOrPilotToPoolMutation`  
**URL:** `/add_team_pilot_drone`  
**Method:** POST

---

#### Update Team Pilot
**Endpoint:** `updateTeamPilot`  
**Type:** Mutation  
**Hook:** `useUpdateTeamPilotMutation`  
**URL:** `/update_team_pilot`  
**Method:** POST

---

#### Update Team Drone
**Endpoint:** `updateTeamDrone`  
**Type:** Mutation  
**Hook:** `useUpdateTeamDroneMutation`  
**URL:** `/update_team_drone`  
**Method:** POST

---

### Bookings/Missions (`bookingsApi.js`)

#### Get ASC Bookings by Date Range
**Endpoint:** `getASCBookingsByDateRange`  
**Type:** Query  
**Hook:** `useGetASCBookingsByDateRangeQuery`  
**URL:** `/search_mission_by_requested_date_range`  
**Method:** POST

**Parameters:**
- `startDate` (string, required): Start date
- `endDate` (string, required): End date

---

#### Get Missions by Planned Date
**Endpoint:** `getMissionsByPlannedDate`  
**Type:** Query  
**Hook:** `useGetMissionsByPlannedDateQuery`  
**URL:** `/search_mission_by_planed_date`  
**Method:** POST

**Parameters:**
- `date` (string, required): Planned date

---

#### Create Mission
**Endpoint:** `createMission`  
**Type:** Mutation  
**Hook:** `useCreateMissionMutation`  
**URL:** `/create_mission`  
**Method:** POST

**Response:**
```json
{
  "status": "true",
  "id": 456,
  "message": "Mission created successfully"
}
```

---

#### Update Mission Planned Date
**Endpoint:** `updateMissionPlannedDate`  
**Type:** Mutation  
**Hook:** `useUpdateMissionPlannedDateMutation`  
**URL:** `/update_mission_planned_date_by_id`  
**Method:** POST

**Parameters:**
- `id` (number, required): Mission ID
- `datePlaned` (string, required): New planned date
- `paymentType` (string, optional): Payment type

---

#### Update Mission
**Endpoint:** `updateMission`  
**Type:** Mutation  
**Hook:** `useUpdateMissionMutation`  
**URL:** `/update_mission_by_id`  
**Method:** POST

---

#### Update Mission Status
**Endpoint:** `updateMissionStatus`  
**Type:** Mutation  
**Hook:** `useUpdateMissionStatusMutation`  
**URL:** `/update_mission_status_by_id`  
**Method:** POST

**Parameters:**
- `id` (number, required): Mission ID
- `status` (string, required): New status

---

#### Set ASC for Mission
**Endpoint:** `setASCForMission`  
**Type:** Mutation  
**Hook:** `useSetASCForMissionMutation`  
**URL:** `/update_mission_asc_by_id`  
**Method:** POST

**Parameters:**
- `id` (number, required): Mission ID
- `asc` (number, required): ASC ID
- `gnd` (number, optional): Ground ID

---

#### Get ASC Calendar Data
**Endpoint:** `getASCCalendarData`  
**Type:** Query  
**Hook:** `useGetASCCalendarDataQuery`  
**URL:** `/mission_count_by_date_for_month`  
**Method:** POST

**Parameters:**
- `month` (number, required): Month (1-12)
- `year` (number, required): Year

---

### Operators (`operatorsApi.js`)

#### Get Operators
**Endpoint:** `getOperators`  
**Type:** Query  
**Hook:** `useGetOperatorsQuery`  
**URL:** `/get_operator`  
**Method:** POST

---

#### Assign Operator to Plan
**Endpoint:** `assignOperatorToPlan`  
**Type:** Mutation  
**Hook:** `useAssignOperatorToPlanMutation`  
**URL:** `/assign_plan_to_operator`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Plan ID
- `operatorId` (number, required): Operator ID

---

#### Get Plan Operators by Date Range
**Endpoint:** `getPlanOperatorsByDateRange`  
**Type:** Query  
**Hook:** `useGetPlanOperatorsByDateRangeQuery`  
**URL:** `/find_plan_operator_date_range`  
**Method:** POST

**Parameters:**
- `startDate` (string, required): Start date
- `endDate` (string, required): End date

---

### Tasks (`tasksApi.js`)

#### Get Tasks by Plan and Field
**Endpoint:** `getTasksByPlanAndField`  
**Type:** Query  
**Hook:** `useGetTasksByPlanAndFieldQuery`  
**URL:** `/display_tasks_by_plan_and_field`  
**Method:** POST

**Parameters:**
- `planId` (number, required): Plan ID
- `fieldId` (number, required): Field ID

---

#### Get Submission Data
**Endpoint:** `getSubmissionData`  
**Type:** Query  
**Hook:** `useGetSubmissionDataQuery`  
**URL:** `/display_pilot_field_sub_task`  
**Method:** POST

**Parameters:**
- `taskId` (number, required): Task ID

---

#### Update Subtask Approval
**Endpoint:** `updateSubtaskApproval`  
**Type:** Mutation  
**Hook:** `useUpdateSubtaskApprovalMutation`  
**URL:** `/update_ops_room_approval_for_sub_task`  
**Method:** POST

**Parameters:**
- `subtask` (number, required): Subtask ID
- `status` (string, required): Approval status

---

#### Log Subtask Status
**Endpoint:** `logSubtaskStatus`  
**Type:** Mutation  
**Hook:** `useLogSubtaskStatusMutation`  
**URL:** `/sub_tasks_status_log`  
**Method:** POST

**Parameters:**
- `subtask` (number, required): Subtask ID
- `status` (string, required): Status
- `reasonId` (number, required): Reason ID
- `reasonText` (string, required): Reason description

---

#### Submit DJI Record
**Endpoint:** `submitDJIRecord`  
**Type:** Mutation  
**Hook:** `useSubmitDJIRecordMutation`  
**URL:** `/submit_dji_record_by_task`  
**Method:** POST

**Content-Type:** `multipart/form-data`

**Parameters:**
- `formData` (FormData, required): File upload data

---

#### Report Task
**Endpoint:** `reportTask`  
**Type:** Mutation  
**Hook:** `useReportTaskMutation`  
**URL:** `/flag_task_by_id`  
**Method:** POST

**Parameters:**
- `taskId` (number, required): Task ID
- `reason` (number, required): Reason ID
- `reasonList` (array, optional): Additional reason list

---

### Farmers (`farmersApi.js`)

#### Get Farmer by NIC
**Endpoint:** `getFarmerByNIC`  
**Type:** Query  
**Hook:** `useGetFarmerByNICQuery`, `useLazyGetFarmerByNICQuery`  
**URL:** `/farmer_by_nic`  
**Method:** POST

**Parameters:**
- `nic` (string, required): National Identity Card number

---

#### Add Farmer
**Endpoint:** `addFarmer`  
**Type:** Mutation  
**Hook:** `useAddFarmerMutation`  
**URL:** `/add_farmer`  
**Method:** POST

---

#### Update Farmer
**Endpoint:** `updateFarmer`  
**Type:** Mutation  
**Hook:** `useUpdateFarmerMutation`  
**URL:** `/update_farmer`  
**Method:** POST

---

### Finance (`financeApi.js`)

#### Get Pilot Revenue by Date
**Endpoint:** `getPilotRevenueByDate`  
**Type:** Query  
**Hook:** `useGetPilotRevenueByDateQuery`  
**URL:** `/pilot_daily_covered_area`  
**Method:** POST

**Parameters:**
- `date` (string, required): Date (YYYY-MM-DD)

---

#### Get Saved Pilot Revenue by Date
**Endpoint:** `getSavedPilotRevenueByDate`  
**Type:** Query  
**Hook:** `useGetSavedPilotRevenueByDateQuery`  
**URL:** `/get_pilot_daily_payment_by_date`  
**Method:** POST

---

#### Add/Update Pilot Revenue
**Endpoint:** `addPilotRevenue`  
**Type:** Mutation  
**Hook:** `useAddPilotRevenueMutation`  
**URL:** `/pilot_daily_payment`  
**Method:** POST

**Parameters:**
- `pilot` (number, required): Pilot ID
- `date` (string, required): Date
- `assigned` (number): Assigned area
- `covered` (number): Covered area
- `cancel` (number): Cancelled area
- `covered_revenue` (number): Covered revenue
- `downtime_reason` (number): Downtime reason ID
- `downtime_approval` (string): Downtime approval status
- `downtime_payment` (number): Downtime payment
- `total_revenue` (number): Total revenue
- `verified` (boolean): Verification status

---

#### Get Brokers
**Endpoint:** `getBrokers`  
**Type:** Query  
**Hook:** `useGetBrokersQuery`  
**URL:** `/view_brokers`  
**Method:** POST

---

#### Add Broker
**Endpoint:** `addBroker`  
**Type:** Mutation  
**Hook:** `useAddBrokerMutation`  
**URL:** `/add_broker`  
**Method:** POST

**Parameters:**
- `name` (string, required): Broker name
- `mobile` (string, required): Mobile number
- `address` (string, required): Address
- `nic` (string, required): NIC number
- `bank` (string, required): Bank name
- `branch` (string, required): Branch name
- `account` (string, required): Account number
- `percentage` (number, required): Commission percentage
- `joined_date` (string, required): Join date

---

#### Update Broker
**Endpoint:** `updateBroker`  
**Type:** Mutation  
**Hook:** `useUpdateBrokerMutation`  
**URL:** `/update_broker`  
**Method:** POST

---

#### Search Broker by NIC
**Endpoint:** `searchBrokerByNIC`  
**Type:** Query  
**Hook:** `useSearchBrokerByNICQuery`  
**URL:** `/search_broker_by_nic`  
**Method:** POST

---

### Reports (`reportsApi.js`)

#### Get Team Lead Report
**Endpoint:** `getTeamLeadReport`  
**Type:** Query  
**Hook:** `useGetTeamLeadReportQuery`  
**URL:** `/team_lead_performance_by_date_range`  
**Method:** POST

**Parameters:**
- `startDate` (string, required): Start date
- `endDate` (string, required): End date

---

#### Get Flight Numbers Report
**Endpoint:** `getFlightNumbersReport`  
**Type:** Query  
**Hook:** `useGetFlightNumbersReportQuery`  
**URL:** `/plan_field_no_of_flights`  
**Method:** POST

---

#### Get Approval Count Report
**Endpoint:** `getApprovalCountReport`  
**Type:** Query  
**Hook:** `useGetApprovalCountReportQuery`  
**URL:** `/pilots_subtask_and_aprroval_count`  
**Method:** POST

---

#### Get Pilot Performance
**Endpoint:** `getPilotPerformance`  
**Type:** Query  
**Hook:** `useGetPilotPerformanceQuery`  
**URL:** `/pilot_performance_plantation`  
**Method:** POST

---

#### Get Finance Report
**Endpoint:** `getFinanceReport`  
**Type:** Query  
**Hook:** `useGetFinanceReportQuery`  
**URL:** `/sprayed_area_by_date_range_and_estate`  
**Method:** POST

**Parameters:**
- `startDate` (string, required): Start date
- `endDate` (string, required): End date
- `estates` (array, required): Array of estate IDs

---

#### Get Chart Data (All Groups)
**Endpoint:** `getChartAllDataGroup`  
**Type:** Query  
**Hook:** `useGetChartAllDataGroupQuery`  
**URL:** `/for_all_by_date`  
**Method:** POST

---

#### Get Chart Data (Group)
**Endpoint:** `getChartGroupData`  
**Type:** Query  
**Hook:** `useGetChartGroupDataQuery`  
**URL:** `/for_group_by_date`  
**Method:** POST

---

#### Get Chart Data (Plantation)
**Endpoint:** `getChartPlantationData`  
**Type:** Query  
**Hook:** `useGetChartPlantationDataQuery`  
**URL:** `/for_plantation_by_date`  
**Method:** POST

---

#### Get Chart Data (Region)
**Endpoint:** `getChartRegionData`  
**Type:** Query  
**Hook:** `useGetChartRegionDataQuery`  
**URL:** `/for_region_by_date`  
**Method:** POST

---

#### Get Chart Data (Estate)
**Endpoint:** `getChartEstateData`  
**Type:** Query  
**Hook:** `useGetChartEstateDataQuery`  
**URL:** `/for_estate_by_date`  
**Method:** POST

---

### Dropdowns (`dropdownsApi.js`)

#### Get Sectors
**Endpoint:** `getSectors`  
**Type:** Query  
**Hook:** `useGetSectorsQuery`  
**URL:** `/display_sectors`  
**Method:** POST

---

#### Get Mission Types
**Endpoint:** `getMissionTypes`  
**Type:** Query  
**Hook:** `useGetMissionTypesQuery`  
**URL:** `/mission_type`  
**Method:** POST

---

#### Get Crop Types
**Endpoint:** `getCropTypes`  
**Type:** Query  
**Hook:** `useGetCropTypesQuery`  
**URL:** `/display_crop_type`  
**Method:** POST

---

#### Get Time Slots
**Endpoint:** `getTimeSlots`  
**Type:** Query  
**Hook:** `useGetTimeSlotsQuery`  
**URL:** `/time_of_the_day`  
**Method:** POST

---

#### Get Chemical Types
**Endpoint:** `getChemicalTypes`  
**Type:** Query  
**Hook:** `useGetChemicalTypesQuery`  
**URL:** `/chemical_type`  
**Method:** POST

---

#### Get Stages
**Endpoint:** `getStages`  
**Type:** Query  
**Hook:** `useGetStagesQuery`  
**URL:** `/display_growth_level`  
**Method:** POST

---

#### Get ASCs
**Endpoint:** `getASCs`  
**Type:** Query  
**Hook:** `useGetASCsQuery`  
**URL:** `/display_asc`  
**Method:** POST

---

#### Get Reject Reasons
**Endpoint:** `getRejectReasons`  
**Type:** Query  
**Hook:** `useGetRejectReasonsQuery`  
**URL:** `/display_reject_reasons`  
**Method:** POST

---

#### Get Flag Reasons
**Endpoint:** `getFlagReasons`  
**Type:** Query  
**Hook:** `useGetFlagReasonsQuery`  
**URL:** `/flag_reasons`  
**Method:** POST

---

#### Get Partial Complete Reasons
**Endpoint:** `getPartialCompleteReasons`  
**Type:** Query  
**Hook:** `useGetPartialCompleteReasonsQuery`  
**URL:** `/display_partial_complete_reasons`  
**Method:** POST

**Parameters:**
- `flag` (string, optional): Flag type (default: 'c')

---

### Summary (`summaryApi.js`)

#### Get Summary by Group
**Endpoint:** `getSummaryByGroup`  
**Type:** Query  
**Hook:** `useGetSummaryByGroupQuery`  
**URL:** `/get_plan_resource_allocation_details_by_group_and_date_range`  
**Method:** POST

**Parameters:**
- `groupId` (number, required): Group ID
- `startDate` (string, required): Start date
- `endDate` (string, required): End date

---

#### Get Summary by Plantation
**Endpoint:** `getSummaryByPlantation`  
**Type:** Query  
**Hook:** `useGetSummaryByPlantationQuery`  
**URL:** `/get_plan_resource_allocation_details_by_plantation_and_date_range`  
**Method:** POST

---

#### Get Summary by Region
**Endpoint:** `getSummaryByRegion`  
**Type:** Query  
**Hook:** `useGetSummaryByRegionQuery`  
**URL:** `/get_plan_resource_allocation_details_by_region_and_date_range`  
**Method:** POST

---

#### Get Summary by Estate
**Endpoint:** `getSummaryByEstate`  
**Type:** Query  
**Hook:** `useGetSummaryByEstateQuery`  
**URL:** `/get_plan_resource_allocation_details_by_estate_and_date_range`  
**Method:** POST

---

### Requests (`requestsApi.js`)

#### Get Pending Ad Hoc Requests
**Endpoint:** `getPendingAdHocRequests`  
**Type:** Query  
**Hook:** `useGetPendingAdHocRequestsQuery`  
**URL:** `/display_adhoc_plan_request_by_manager_app_pending`  
**Method:** POST

---

#### Get Pending Reschedule Requests
**Endpoint:** `getPendingRescheduleRequests`  
**Type:** Query  
**Hook:** `useGetPendingRescheduleRequestsQuery`  
**URL:** `/find_all_pending_request_reschedule`  
**Method:** POST

---

#### Update Ad Hoc Request
**Endpoint:** `updateAdHocRequest`  
**Type:** Mutation  
**Hook:** `useUpdateAdHocRequestMutation`  
**URL:** `/update_status_adhoc_plan_request_by_manager_app`  
**Method:** POST

**Parameters:**
- `requestId` (number, required): Request ID
- `datePlanned` (string, required): Planned date
- `status` (string, required): Status

---

#### Update Reschedule Request
**Endpoint:** `updateRescheduleRequest`  
**Type:** Mutation  
**Hook:** `useUpdateRescheduleRequestMutation`  
**URL:** `/update_request_reschedule_date_by_manager`  
**Method:** POST

---

### Assets (`assetsApi.js`)

The assets API includes endpoints for managing drones, vehicles, generators, batteries, remote controls, and insurance. Refer to `src/api/services/assetsApi.js` for complete endpoint documentation.

---

### Group Assignments (`groupAssignmentsApi.js`)

The group assignments API manages group-to-mission mappings. Refer to `src/api/services/groupAssignmentsApi.js` for complete endpoint documentation.

---

## RTK Query Features

### Automatic Caching
RTK Query automatically caches query results. Use `refetch()` to manually refresh data:

```javascript
const { data, refetch } = useGetAllEstatesQuery();
// Later...
refetch();
```

### Tag-based Cache Invalidation
Mutations automatically invalidate related cache tags:

```javascript
// This mutation invalidates 'Plans' and 'Calendar' tags
const [createPlan] = useCreatePlanMutation();
```

### Polling
Automatically refetch data at intervals:

```javascript
const { data } = useGetAllEstatesQuery(undefined, {
  pollingInterval: 5000, // Refetch every 5 seconds
});
```

### Conditional Queries
Skip queries based on conditions:

```javascript
const { data } = useGetEstateDetailsQuery(estateId, {
  skip: !estateId, // Skip if estateId is falsy
});
```

---

## Error Handling

RTK Query provides built-in error handling:

```javascript
const { data, error, isLoading, isError } = useGetAllEstatesQuery();

if (isError) {
  // Handle error
  console.error('Error:', error);
  // error.status - HTTP status code
  // error.data - Error response data
}
```

---

## Legacy Reference

> **Note:** The following section documents the legacy Axios-based API functions. These are kept for reference only. All new code should use RTK Query endpoints as documented above. For migration mapping, see `API_FUNCTION_MAPPING.md`.

### Legacy Function Mapping

The legacy `src/api/api.js` file contained Axios-based functions. These have been fully replaced by RTK Query endpoints. The HTTP contract (URLs, methods, request/response formats) remains the same, but the implementation now uses RTK Query.

**Key Differences:**
- Legacy: Direct Axios calls with manual error handling
- RTK Query: Automatic caching, error handling, loading states, and cache invalidation

**Migration Guide:**
1. Replace legacy function imports with RTK Query hooks
2. Use hooks in components for automatic re-rendering
3. Use `dispatch(baseApi.endpoints.*.initiate())` in thunks/actions
4. Leverage automatic cache invalidation instead of manual refetching

---

## Additional Resources

- **RTK Query Documentation:** https://redux-toolkit.js.org/rtk-query/overview
- **API Function Mapping:** See `API_FUNCTION_MAPPING.md` for legacy function to RTK Query endpoint mapping
- **Service Files:** All service files are located in `src/api/services/`

---

## Support

For questions or issues regarding the API:
- Check the service file for the specific endpoint
- Review `API_FUNCTION_MAPPING.md` for migration help
- Consult RTK Query documentation for advanced usage patterns
