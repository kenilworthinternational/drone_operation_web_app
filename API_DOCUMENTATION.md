# API Documentation DSMS Kenilworth International, Last Update 2025/09/09 Sandun Madhubhashana

## Overview
This document provides comprehensive documentation for the Drone Operations Management API. The API is built using Axios and follows RESTful principles with POST requests for most endpoints.

**Base URL:** `https://drone-admin-test.kenilworthinternational.com/api/`

## Authentication
All endpoints (except login and verification) require Bearer token authentication. The token is retrieved from localStorage and included in the Authorization header.

```javascript
Authorization: Bearer <token>
```

## Helper Functions

### `getToken()`
Retrieves the authentication token from localStorage.

### `getAuthHeaders()`
Returns headers object with Authorization token for authenticated requests.

### `handleApiError(error, context)`
Generic error handler for API calls that logs errors and returns empty array on failure.

---

## Authentication Endpoints

### 1. Verify User
**Function:** `verifyUser(phoneNumber)`
**HTTP Method:** POST
**URL:** `/check_mobile_no_availability_all`
**Description:** Verifies if a mobile number is available for registration.

**Parameters:**
- `mobile_no` (string, required): Phone number to verify

**Request Example:**
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

**Errors:**
- 400: Invalid mobile number format
- 409: Mobile number already exists

---

### 2. Login User
**Function:** `loginUser(phoneNumber)`
**HTTP Method:** POST
**URL:** `/login`
**Description:** Authenticates user with mobile number and returns access token.

**Parameters:**
- `mobile_no` (string, required): Phone number for login

**Request Example:**
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

**Errors:**
- 401: Invalid credentials
- 404: User not found

---

## Organizational Structure Endpoints

### 3. Get Groups
**Function:** `groupGetter()`
**HTTP Method:** POST
**URL:** `/display_groups`
**Description:** Retrieves all available groups.

**Parameters:** None

**Response:**
```json
[
  {
    "id": 1,
    "name": "Group A",
    "description": "Primary group"
  }
]
```

---

### 4. Get Plantations by Group
**Function:** `groupPlantation(groupId)`
**HTTP Method:** POST
**URL:** `/display_plantation`
**Description:** Retrieves plantations associated with a specific group.

**Parameters:**
- `group` (number, required): Group ID

**Request Example:**
```json
{
  "group": 1
}
```

---

### 5. Get Regions by Plantation
**Function:** `groupRegion(plantationID)`
**HTTP Method:** POST
**URL:** `/display_region`
**Description:** Retrieves regions within a specific plantation.

**Parameters:**
- `plantation` (number, required): Plantation ID

---

### 6. Get Estates by Region
**Function:** `groupEstate(regionID)`
**HTTP Method:** POST
**URL:** `/display_estate`
**Description:** Retrieves estates within a specific region.

**Parameters:**
- `region` (number, required): Region ID

---

### 7. Display All Plantations
**Function:** `displayPlantation()`
**HTTP Method:** POST
**URL:** `/display_all_plantation`
**Description:** Retrieves all plantations regardless of group.

---

### 8. Display All Estates
**Function:** `displayEstate()`
**HTTP Method:** POST
**URL:** `/display_all_estates`
**Description:** Retrieves all estates.

---

### 9. Get Estates by Plantation
**Function:** `estateListAcPlant(plantationID)`
**HTTP Method:** POST
**URL:** `/display_estate_by_plantation`
**Description:** Retrieves estates associated with a specific plantation.

**Parameters:**
- `plantation` (number, required): Plantation ID

---

### 10. Get Estate Details
**Function:** `estateListDetails(estateID)`
**HTTP Method:** POST
**URL:** `/estate_profile`
**Description:** Retrieves detailed information about a specific estate.

**Parameters:**
- `estate` (number, required): Estate ID

---

### 11. Get Division Fields by Estate
**Function:** `divisionStateList(estateID)`
**HTTP Method:** POST
**URL:** `/display_division_field_by_estate`
**Description:** Retrieves division fields within a specific estate.

**Parameters:**
- `estate` (number, required): Estate ID

---

## Resource Management Endpoints

### 12. Get Operators
**Function:** `displayOperators()`
**HTTP Method:** POST
**URL:** `/get_operator`
**Description:** Retrieves all available operators.

---

### 13. Assign Operator to Plan
**Function:** `assignOperator(planID, operatorID)`
**HTTP Method:** POST
**URL:** `/assign_plan_to_operator`
**Description:** Assigns an operator to a specific plan.

**Parameters:**
- `plan` (number, required): Plan ID
- `operator` (number, required): Operator ID

**Request Example:**
```json
{
  "plan": 1,
  "operator": 5
}
```

---

### 14. Get Plan Operators by Date Range
**Function:** `planOperatorsDateRange(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/find_plan_operator_date_range`
**Description:** Retrieves plan operators within a specific date range.

**Parameters:**
- `start_date` (string, required): Start date (YYYY-MM-DD)
- `end_date` (string, required): End date (YYYY-MM-DD)

---

### 15. Get Assigned Operator
**Function:** `assignedOperator(planID)`
**HTTP Method:** POST
**URL:** `/find_plan_operator`
**Description:** Retrieves the operator assigned to a specific plan.

**Parameters:**
- `plan` (number, required): Plan ID

---

## Chemical and Mission Type Endpoints

### 16. Get Chemical Types
**Function:** `chemicalTypeList()`
**HTTP Method:** POST
**URL:** `/chemical_type`
**Description:** Retrieves all available chemical types.

---

### 17. Get Mission Types
**Function:** `missionType()`
**HTTP Method:** POST
**URL:** `/mission_type`
**Description:** Retrieves all available mission types.

---

### 18. Get Crop Types
**Function:** `cropType()`
**HTTP Method:** POST
**URL:** `/display_crop_type`
**Description:** Retrieves all available crop types.

---

## Plan Management Endpoints

### 19. Submit Plan
**Function:** `submitPlan(submissionData)`
**HTTP Method:** POST
**URL:** `/create_plan`
**Description:** Creates a new plan with the provided data.

**Parameters:**
- `submissionData` (object, required): Plan data object

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

### 20. Get Plans by Date
**Function:** `getPlansUsingDate(date)`
**HTTP Method:** POST
**URL:** `/find_plans_by_date`
**Description:** Retrieves plans for a specific date.

**Parameters:**
- `date` (string, required): Date in YYYY-MM-DD format

---

### 21. Get Plans by Date Range
**Function:** `getPlansUsingDateRange(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/find_plans_by_date_range`
**Description:** Retrieves plans within a specific date range.

**Parameters:**
- `start_date` (string, required): Start date (YYYY-MM-DD)
- `end_date` (string, required): End date (YYYY-MM-DD)

---

### 22. Find Plan by ID
**Function:** `findPlanByID(id)`
**HTTP Method:** POST
**URL:** `/find_plan`
**Description:** Retrieves detailed information about a specific plan.

**Parameters:**
- `plan` (number, required): Plan ID

---

### 23. Update Plan
**Function:** `submitUpdatePlan(submissionUpdateData)`
**HTTP Method:** POST
**URL:** `/update_plan`
**Description:** Updates an existing plan.

**Parameters:**
- `submissionUpdateData` (object, required): Updated plan data

**Response:**
```json
{
  "status": "true",
  "id": 123,
  "message": "Plan updated successfully"
}
```

---

### 24. Delete Plan
**Function:** `deletePlan(id)`
**HTTP Method:** POST
**URL:** `/delete_plan`
**Description:** Deletes a specific plan.

**Parameters:**
- `plan` (number, required): Plan ID

---

### 25. Deactivate Plan
**Function:** `deactivatePlan(id, status)`
**HTTP Method:** POST
**URL:** `/plan_change_status`
**Description:** Changes the status of a plan (activate/deactivate).

**Parameters:**
- `plan` (number, required): Plan ID
- `status` (string, required): New status

---

## Pilot and Drone Management Endpoints

### 26. Get Pilots Details
**Function:** `getPilotsDetails()`
**HTTP Method:** POST
**URL:** `/team_lead_and_pilot_list`
**Description:** Retrieves all team leads and pilots.

---

### 27. Get ASC Pilots Details
**Function:** `getAscPilotsDetails()`
**HTTP Method:** POST
**URL:** `/asc_team_lead_and_pilot_list`
**Description:** Retrieves ASC (Agricultural Service Center) team leads and pilots.

---

### 28. Get Drones Details
**Function:** `getDronesDetails()`
**HTTP Method:** POST
**URL:** `/drone_list`
**Description:** Retrieves all available drones.

---

### 29. Get Sectors
**Function:** `getSectors()`
**HTTP Method:** POST
**URL:** `/display_sectors`
**Description:** Retrieves all sectors.

---

### 30. Get Stages
**Function:** `getStages()`
**HTTP Method:** POST
**URL:** `/display_growth_level`
**Description:** Retrieves all growth stages.

---

### 31. Get Time Pick
**Function:** `getTimePick()`
**HTTP Method:** POST
**URL:** `/time_of_the_day`
**Description:** Retrieves available time slots for the day.

---

## Team Management Endpoints

### 32. Display Team Data
**Function:** `displayTeamData()`
**HTTP Method:** POST
**URL:** `/display_all_team_pilot_drone`
**Description:** Retrieves all team, pilot, and drone combinations.

---

### 33. Display Team Data Non-Plantation
**Function:** `displayTeamDataNonp()`
**HTTP Method:** POST
**URL:** `/display_all_non_plantaion_team_pilot_drone`
**Description:** Retrieves non-plantation team, pilot, and drone combinations.

---

### 34. Add Drone/Pilot to Pool
**Function:** `addDroneorPilotToPool(submissionData)`
**HTTP Method:** POST
**URL:** `/add_team_pilot_drone`
**Description:** Adds a drone or pilot to the team pool.

**Parameters:**
- `submissionData` (object, required): Team assignment data

---

### 35. Update Team Pilot
**Function:** `updateTeamPilot(submissionData)`
**HTTP Method:** POST
**URL:** `/update_team_pilot`
**Description:** Updates pilot information in a team.

---

### 36. Update Team Drone
**Function:** `updateTeamDrone(submissionData)`
**HTTP Method:** POST
**URL:** `/update_team_drone`
**Description:** Updates drone information in a team.

---

### 37. Add Team to Plan
**Function:** `addTeamToPlan(submissionData)`
**HTTP Method:** POST
**URL:** `/add_team_to_plan`
**Description:** Assigns a team to a specific plan.

---

### 38. Add Team to Mission (Non-Plantation)
**Function:** `addTeamToPlanNonp(plan_id, team_id)`
**HTTP Method:** POST
**URL:** `/add_team_to_mission`
**Description:** Assigns a team to a non-plantation mission.

**Parameters:**
- `plan_id` (number, required): Plan ID
- `team_id` (number, required): Team ID

---

## Resource Allocation Endpoints

### 39. Submit Resource Allocation
**Function:** `submitAlocation(submissionData)`
**HTTP Method:** POST
**URL:** `/plan_resource_allocations`
**Description:** Allocates resources to a plan.

---

### 40. Submit Resource Allocation Non-Plantation
**Function:** `submitAlocationNonp(submissionData)`
**HTTP Method:** POST
**URL:** `/mission_resource_allocations`
**Description:** Allocates resources to a non-plantation mission.

---

### 41. Get Plan Resource Allocation
**Function:** `getPlanResorcesAllocation(data)`
**HTTP Method:** POST
**URL:** `/get_plan_resource_allocation_details`
**Description:** Retrieves resource allocation details for a plan.

**Parameters:**
- `id` (number, required): Plan ID

---

## Reporting Endpoints

### 42. Get Summary Data by Group
**Function:** `getSummaryDataGroup(id, start_date, end_date)`
**HTTP Method:** POST
**URL:** `/get_plan_resource_allocation_details_by_group_and_date_range`
**Description:** Retrieves summary data for a group within a date range.

**Parameters:**
- `group` (number, required): Group ID
- `start_date` (string, required): Start date
- `end_date` (string, required): End date

---

### 43. Get Summary Data by Plantation
**Function:** `getSummaryDataPlantation(id, start_date, end_date)`
**HTTP Method:** POST
**URL:** `/get_plan_resource_allocation_details_by_plantation_and_date_range`
**Description:** Retrieves summary data for a plantation within a date range.

---

### 44. Get Summary Data by Region
**Function:** `getSummaryDataRegion(id, start_date, end_date)`
**HTTP Method:** POST
**URL:** `/get_plan_resource_allocation_details_by_region_and_date_range`
**Description:** Retrieves summary data for a region within a date range.

---

### 45. Get Summary Data by Estate
**Function:** `getSummaryDataEstate(id, start_date, end_date)`
**HTTP Method:** POST
**URL:** `/get_plan_resource_allocation_details_by_estate_and_date_range`
**Description:** Retrieves summary data for an estate within a date range.

---

### 46. Finance Report
**Function:** `financeReport(start_date, end_date, estates)`
**HTTP Method:** POST
**URL:** `/sprayed_area_by_date_range_and_estate`
**Description:** Generates finance report for sprayed areas by date range and estates.

**Parameters:**
- `start_date` (string, required): Start date
- `end_date` (string, required): End date
- `estates` (array, required): Array of estate IDs

---

### 47. Lead Report
**Function:** `leadReport(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/team_lead_performance_by_date_range`
**Description:** Generates team lead performance report for a date range.

---

### 48. Number of Flights Report
**Function:** `noOfFlights(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/plan_field_no_of_flights`
**Description:** Retrieves number of flights for plans within a date range.

---

### 49. Approval Count Report
**Function:** `ApprovalCount(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/pilots_subtask_and_aprroval_count`
**Description:** Retrieves pilot subtask and approval counts for a date range.

---

## Mission Management Endpoints

### 50. Submit ASC Booking Data
**Function:** `submitDataAscBooking(submissionData)`
**HTTP Method:** POST
**URL:** `/create_mission`
**Description:** Creates a new ASC (Agricultural Service Center) mission.

**Response:**
```json
{
  "status": "true",
  "id": 456,
  "message": "Mission created successfully"
}
```

---

### 51. Get ASC Pilots
**Function:** `getAscPilots()`
**HTTP Method:** POST
**URL:** `/asc_team_lead_and_pilot_list`
**Description:** Retrieves ASC pilots and team leads.

---

### 52. Set ASC Team Lead
**Function:** `setAscTeamLead(dataSet)`
**HTTP Method:** POST
**URL:** `/update_mission_team_lead_by_id`
**Description:** Updates the team lead for an ASC mission.

---

### 53. Set ASC for Mission
**Function:** `setAscForMission(idOrPayload, ascIfAny)`
**HTTP Method:** POST
**URL:** `/update_mission_asc_by_id`
**Description:** Sets ASC for a specific mission.

**Parameters:**
- `id` (number, required): Mission ID
- `asc` (number, required): ASC ID
- `gnd` (number, optional): Ground ID

---

### 54. Set ASC Plan Status
**Function:** `setStatusAscPlan(id, status)`
**HTTP Method:** POST
**URL:** `/update_mission_status_by_id`
**Description:** Updates the status of an ASC plan.

---

### 55. Display ASC
**Function:** `displayAsc()`
**HTTP Method:** POST
**URL:** `/display_asc`
**Description:** Retrieves all ASC information.

---

## Task Management Endpoints

### 56. Get Submission Data
**Function:** `getSubmissionData(id)`
**HTTP Method:** POST
**URL:** `/display_pilot_field_sub_task`
**Description:** Retrieves pilot field subtask data.

**Parameters:**
- `task` (number, required): Task ID

---

### 57. Display Tasks by Plan and Field
**Function:** `displayTaskPlanAndField(id, fieldid)`
**HTTP Method:** POST
**URL:** `/display_tasks_by_plan_and_field`
**Description:** Retrieves tasks for a specific plan and field.

**Parameters:**
- `plan` (number, required): Plan ID
- `field` (number, required): Field ID

---

### 58. Sub Task Approve or Decline
**Function:** `subTaskApproveorDecline(subtask, status)`
**HTTP Method:** POST
**URL:** `/update_ops_room_approval_for_sub_task`
**Description:** Approves or declines a subtask.

**Parameters:**
- `subtask` (number, required): Subtask ID
- `status` (string, required): Approval status

**Response:**
```json
{
  "status": "true",
  "message": "Update successful"
}
```

---

### 59. Sub Task Log Details
**Function:** `subTaskLogDetails(subtask, status, reasonId, reasonText)`
**HTTP Method:** POST
**URL:** `/sub_tasks_status_log`
**Description:** Logs details for subtask status changes.

**Parameters:**
- `subtask` (number, required): Subtask ID
- `status` (string, required): Status
- `reason` (number, required): Reason ID
- `reason_text` (string, required): Reason description

---

## File Upload Endpoints

### 60. Submit DJI Record
**Function:** `submitDJIRecord(formData)`
**HTTP Method:** POST
**URL:** `/submit_dji_record_by_task`
**Description:** Uploads DJI flight records for a task.

**Parameters:**
- `formData` (FormData, required): File upload data

**Content-Type:** `multipart/form-data`

---

## Farmer Management Endpoints

### 61. Add Farmer
**Function:** `addFarmer(farmerData)`
**HTTP Method:** POST
**URL:** `/add_farmer`
**Description:** Adds a new farmer to the system.

**Parameters:**
- `farmerData` (object, required): Farmer information

---

### 62. Update Farmer
**Function:** `updateFarmer(submissionData)`
**HTTP Method:** POST
**URL:** `/update_farmer`
**Description:** Updates farmer information.

---

### 63. Get Farmer Details by NIC
**Function:** `farmerDetailsAscBooking(nic)`
**HTTP Method:** POST
**URL:** `/farmer_by_nic`
**Description:** Retrieves farmer details by NIC number.

**Parameters:**
- `nic` (string, required): National Identity Card number

---

## Calendar and Scheduling Endpoints

### 64. Get Updated Calendar
**Function:** `getUpdatedCalander(data, location)`
**HTTP Method:** POST
**URL:** `/find_plans_by_estate_and_crop_and_mission_type_date_range`
**Description:** Retrieves calendar data filtered by estate, crop, and mission type.

**Parameters:**
- `data` (object, required): Filter criteria
- `location` (string, required): Location context

---

### 65. Set ASC Calendar Date
**Function:** `setAscCalenderDate(month, year)`
**HTTP Method:** POST
**URL:** `/mission_count_by_date_for_month`
**Description:** Retrieves mission count for a specific month and year.

**Parameters:**
- `year` (number, required): Year
- `month` (number, required): Month

---

## Chart Data Endpoints

### 66. Get Chart All Data Group
**Function:** `getChartAllDataGroup(data)`
**HTTP Method:** POST
**URL:** `/for_all_by_date`
**Description:** Retrieves chart data for all groups by date.

---

### 67. Get Chart Group Data
**Function:** `getChartGroupDataGroup(data)`
**HTTP Method:** POST
**URL:** `/for_group_by_date`
**Description:** Retrieves chart data for a specific group by date.

---

### 68. Get Chart Plantation Data
**Function:** `getChartPlantationDataGroup(data)`
**HTTP Method:** POST
**URL:** `/for_plantation_by_date`
**Description:** Retrieves chart data for a plantation by date.

---

### 69. Get Chart Region Data
**Function:** `getChartRegionDataGroup(data)`
**HTTP Method:** POST
**URL:** `/for_region_by_date`
**Description:** Retrieves chart data for a region by date.

---

### 70. Get Chart Estate Data
**Function:** `getChartEstateDataGroup(data)`
**HTTP Method:** POST
**URL:** `/for_estate_by_date`
**Description:** Retrieves chart data for an estate by date.

---

## Broker Management Endpoints

### 71. Add Broker
**Function:** `addBroker(name, mobile, address, nic, bank, branch, account, percentage, joined_date)`
**HTTP Method:** POST
**URL:** `/add_broker`
**Description:** Adds a new broker to the system.

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

### 72. Update Broker
**Function:** `updateBroker(id, name, mobile, address, nic, bank, branch, account, percentage, joined_date)`
**HTTP Method:** POST
**URL:** `/update_broker`
**Description:** Updates broker information.

---

### 73. Search Broker by ID
**Function:** `searchBrokerById(id)`
**HTTP Method:** POST
**URL:** `/search_broker_by_id`
**Description:** Retrieves broker information by ID.

---

### 74. Search Broker by NIC
**Function:** `searchBrokerByNIC(nic)`
**HTTP Method:** POST
**URL:** `/search_broker_by_nic`
**Description:** Retrieves broker information by NIC.

---

### 75. View Brokers
**Function:** `viewBrokers()`
**HTTP Method:** POST
**URL:** `/view_brokers`
**Description:** Retrieves all brokers.

---

### 76. Update Broker Status
**Function:** `updateBrokerStatus(id, activated)`
**HTTP Method:** POST
**URL:** `/update_broker_status`
**Description:** Updates broker activation status.

---

## Ad Hoc Plan Management Endpoints

### 77. Ad Hoc Plan View
**Function:** `adHocPlanView(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/display_adhoc_plan_request_by_manager_app`
**Description:** Retrieves ad hoc plan requests within a date range.

---

### 78. Ad Hoc Plan Request
**Function:** `adHocPlanRequest()`
**HTTP Method:** POST
**URL:** `/display_adhoc_plan_request_by_manager_app_pending`
**Description:** Retrieves pending ad hoc plan requests.

---

### 79. Update Ad Hoc Plan Request
**Function:** `updateAdHocPlanRequest(request_id, date_planned, status)`
**HTTP Method:** POST
**URL:** `/update_status_adhoc_plan_request_by_manager_app`
**Description:** Updates ad hoc plan request status.

---

## Performance and Analytics Endpoints

### 80. Pilots Performance
**Function:** `pilotsPerfomances(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/pilot_performance_plantation`
**Description:** Retrieves pilot performance data for plantations.

---

### 81. Field Not Approved by Team Lead
**Function:** `fieldNotApprovedTeamLead(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/plan_field_not_approved_team_lead`
**Description:** Retrieves fields not approved by team leads.

---

### 82. Incomplete Subtasks
**Function:** `incompleteSubtasks(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/not_complete_task_list_for_report`
**Description:** Retrieves incomplete tasks for reporting.

---

### 83. Canceled Fields by Date Range
**Function:** `canceledFieldsByDateRange(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/canceled_fields_by_date_range`
**Description:** Retrieves canceled fields within a date range.

---

### 84. Pilot Team Spray Area
**Function:** `pilotTeamSprayArea(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/pilot_team_date_spray_area`
**Description:** Retrieves spray area data by pilot team and date.

---

## Task Reporting Endpoints

### 85. Get Report Reasons
**Function:** `getReportReasons()`
**HTTP Method:** POST
**URL:** `/flag_reasons`
**Description:** Retrieves available flag/report reasons.

---

### 86. Report Task
**Function:** `reportTask(taskId, reason, reasonList)`
**HTTP Method:** POST
**URL:** `/flag_task_by_id`
**Description:** Reports a task with specific reasons.

**Parameters:**
- `task_id` (number, required): Task ID
- `reason` (string, required): Reason for reporting
- `reason_list` (array, required): List of reasons

---

### 87. View Task Report
**Function:** `viewTaskReport(taskId)`
**HTTP Method:** POST
**URL:** `/search_task_flag_by_task_id`
**Description:** Retrieves task report details by task ID.

---

### 88. View Task Report by Date Range
**Function:** `viewTaskReportByDateRange(fromDate, toDate)`
**HTTP Method:** POST
**URL:** `/search_task_flag_by_date_range`
**Description:** Retrieves task reports within a date range.

---

### 89. Update Review for Flag by Review Board
**Function:** `updateReviewForFlagByReviewBoard(taskId, review)`
**HTTP Method:** POST
**URL:** `/update_review_for_flag_by_review_board`
**Description:** Updates review for flagged task by review board.

---

### 90. Update Review for Flag by Director Ops
**Function:** `updateReviewForFlagByDirectorOps(taskId, status, review)`
**HTTP Method:** POST
**URL:** `/update_review_for_flag_dops`
**Description:** Updates review for flagged task by director of operations.

---

## Chemical Usage Endpoints

### 91. Used Chemicals
**Function:** `usedChemicals(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/chemical_used_by_estates`
**Description:** Retrieves chemical usage data by estates within a date range.

**Parameters:**
- `start_date` (string, required): Start date
- `end_date` (string, required): End date

**Response:**
```json
{
  "chemical_usage": [
    {
      "estate_id": 1,
      "estate_name": "Estate A",
      "chemical_type": "Herbicide",
      "quantity_used": 50.5,
      "date": "2024-01-15"
    }
  ]
}
```

---

## Field Management Endpoints

### 92. Field Details
**Function:** `fieldDetails(id)`
**HTTP Method:** POST
**URL:** `/details_by_field`
**Description:** Retrieves detailed information about a specific field.

**Parameters:**
- `field` (number, required): Field ID

---

### 93. Display Reject Reasons
**Function:** `displayRejectReason()`
**HTTP Method:** POST
**URL:** `/display_reject_reasons`
**Description:** Retrieves available rejection reasons.

---

## Mission Booking Endpoints

### 94. Date Range ASC Bookings
**Function:** `dateRangAscBookings(startDate, endDate)`
**HTTP Method:** POST
**URL:** `/search_mission_by_requested_date_range`
**Description:** Retrieves ASC bookings within a date range.

---

### 95. Update Date Planned ASC Booking
**Function:** `updateDatePlannedAscBooking(id, datePlaned, paymentType)`
**HTTP Method:** POST
**URL:** `/update_mission_planned_date_by_id`
**Description:** Updates planned date for ASC booking.

**Parameters:**
- `id` (number, required): Mission ID
- `date_planed` (string, required): New planned date
- `payment_type` (string, optional): Payment type

---

### 96. Update Mission Planned ASC
**Function:** `updateMissionPlannedAsc(dataSet)`
**HTTP Method:** POST
**URL:** `/update_mission_by_id`
**Description:** Updates ASC mission details.

---

## Reschedule Management Endpoints

### 97. Pending Request Reschedule
**Function:** `pendingRequestReschedule()`
**HTTP Method:** POST
**URL:** `/find_all_pending_request_reschedule`
**Description:** Retrieves all pending reschedule requests.

---

### 98. Submit Rescheduled Plan
**Function:** `submitRescheduledPlan(submissionRescheduleData)`
**HTTP Method:** POST
**URL:** `/create_plan`
**Description:** Creates a rescheduled plan.

---

### 99. Submit Manager Request Rescheduled Plan
**Function:** `submitManagerRequestRescheduledPlan(submissionManagerRequestRescheduleData)`
**HTTP Method:** POST
**URL:** `/create_plan`
**Description:** Creates a manager-requested rescheduled plan.

---

### 100. Change Manager Status
**Function:** `changeManagerStatus(changeManagerStatusData)`
**HTTP Method:** POST
**URL:** `/update_request_reschedule_date_by_manager`
**Description:** Updates reschedule request status by manager.

---

## Operations Management Endpoints

### 101. Ops Approval
**Function:** `opsApproval(plan, status)`
**HTTP Method:** POST
**URL:** `/update_d_ops_approval_for_plan`
**Description:** Updates operations approval for a plan.

**Parameters:**
- `plan` (number, required): Plan ID
- `status` (string, required): Approval status

---

### 102. Update Date
**Function:** `updateDate(currentId, date)`
**HTTP Method:** POST
**URL:** `/update_plan_date_by_plan_id`
**Description:** Updates plan date by plan ID.

**Parameters:**
- `id` (number, required): Plan ID
- `date` (string, required): New date

---

## Summary Data Endpoints

### 103. Get Summary Data All
**Function:** `getSummaryDataAll(id)`
**HTTP Method:** POST
**URL:** `/find_plan_by_all`
**Description:** Retrieves summary data for all plans.

---

### 104. Get Summary Data All Date Range
**Function:** `getSummaryDataAllDateRange(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/find_plan_by_all_date_range`
**Description:** Retrieves summary data for all plans within a date range.

---

### 105. Get Summary Data Group All
**Function:** `getSummaryDataGroupAll(id)`
**HTTP Method:** POST
**URL:** `/find_plan_by_group`
**Description:** Retrieves summary data for all plans in a group.

---

### 106. Get Summary Data Group All Date Range
**Function:** `getSummaryDataGroupAllDateRange(id, start_date, end_date)`
**HTTP Method:** POST
**URL:** `/find_plan_by_group_date_range`
**Description:** Retrieves summary data for all plans in a group within a date range.

---

### 107. Get Summary Data Plantation All
**Function:** `getSummaryDataPlantationAll(id)`
**HTTP Method:** POST
**URL:** `/find_plan_by_plantation`
**Description:** Retrieves summary data for all plans in a plantation.

---

### 108. Get Summary Data Plantation All Date Range
**Function:** `getSummaryDataPlantationAllDateRange(id, start_date, end_date)`
**HTTP Method:** POST
**URL:** `/find_plan_by_plantation_date_range`
**Description:** Retrieves summary data for all plans in a plantation within a date range.

---

### 109. Get Summary Data Region All
**Function:** `getSummaryDataRegionAll(id)`
**HTTP Method:** POST
**URL:** `/find_plan_by_region`
**Description:** Retrieves summary data for all plans in a region.

---

### 110. Get Summary Data Region All Date Range
**Function:** `getSummaryDataRegionAllDateRange(id, start_date, end_date)`
**HTTP Method:** POST
**URL:** `/find_plan_by_region_date_range`
**Description:** Retrieves summary data for all plans in a region within a date range.

---

### 111. Get Summary Data Estate All
**Function:** `getSummaryDataEstateAll(id)`
**HTTP Method:** POST
**URL:** `/find_plan_by_estate`
**Description:** Retrieves summary data for all plans in an estate.

---

### 112. Get Summary Data Estate All Date Range
**Function:** `getSummaryDataEstateAllDateRange(id, start_date, end_date)`
**HTTP Method:** POST
**URL:** `/find_plan_by_estate_date_range_with_field`
**Description:** Retrieves summary data for all plans in an estate within a date range, including field details.

---

## Additional Utility Endpoints

### 113. Find Plan Summary
**Function:** `findPlanSummary(id)`
**HTTP Method:** POST
**URL:** `/find_plan_summary`
**Description:** Retrieves summary information for a specific plan.

---

### 114. Pilot Details Plan
**Function:** `PilotDetaisPlan(id)`
**HTTP Method:** POST
**URL:** `/plan_team_drone_by_plan_id`
**Description:** Retrieves pilot details for a specific plan.

---

### 115. Get Update Mission Details
**Function:** `getUpdateMissionDetails(data)`
**HTTP Method:** POST
**URL:** `/display_for_update_plan`
**Description:** Retrieves mission details for plan updates.

---

### 116. Get Reschedule Mission Details
**Function:** `getRescheduleMissionDetails(data)`
**HTTP Method:** POST
**URL:** `/display_for_reschedulr_plan`
**Description:** Retrieves mission details for plan rescheduling.

---

### 117. Team Planned Data
**Function:** `teamPlannedData(submissionData)`
**HTTP Method:** POST
**URL:** `/plan_team_drone_by_date`
**Description:** Retrieves team planned data by date.

---

### 118. Team Planned Data Non-Plantation
**Function:** `teamPlannedDataNonp(submissionData)`
**HTTP Method:** POST
**URL:** `/plan_non_plantaion_team_drone_by_date`
**Description:** Retrieves non-plantation team planned data by date.

---

### 119. Pilot Plan and Sub Task List
**Function:** `pilotPlanandSubTaskList(startDate, endDate, formattedEstates)`
**HTTP Method:** POST
**URL:** `/pilots_plans_tasks_by_date_range_and_estates`
**Description:** Retrieves pilot plans and subtasks by date range and estates.

**Parameters:**
- `start_date` (string, required): Start date
- `end_date` (string, required): End date
- `estates` (array, required): Array of estate IDs

---

### 120. Display Pilot and Drone Without Team
**Function:** `displayPilotandDroneWithoutTeam()`
**HTTP Method:** POST
**URL:** `/pilots_and_drones_without_team`
**Description:** Retrieves pilots and drones not assigned to any team.

---

### 121. Display Pilot and Drone Without Team Non-Plantation
**Function:** `displayPilotandDroneWithoutTeamNonp()`
**HTTP Method:** POST
**URL:** `/non_plantaion_pilots_and_drones_without_team`
**Description:** Retrieves non-plantation pilots and drones not assigned to any team.

---

### 122. Update Team Pilot Non-Plantation
**Function:** `updateTeamPilotNonp(submissionData)`
**HTTP Method:** POST
**URL:** `/update_non_plantaion_team_pilot`
**Description:** Updates non-plantation team pilot information.

---

### 123. Update Team Drone Non-Plantation
**Function:** `updateTeamDroneNonp(submissionData)`
**HTTP Method:** POST
**URL:** `/update_non_plantaion_team_drone`
**Description:** Updates non-plantation team drone information.

---

### 124. Get Plan Resources Allocation Non-Plantation
**Function:** `getPlanResorcesAllocationNonp(data, date)`
**HTTP Method:** POST
**URL:** `/display_mission_resource_allocations_by_id`
**Description:** Retrieves non-plantation mission resource allocation details.

**Parameters:**
- `asc` (number, required): ASC ID
- `date` (string, required): Date

---

### 125. Cancelled Fields by Team Lead
**Function:** `cancelledFieldsbyTeamLead(start_date, end_date)`
**HTTP Method:** POST
**URL:** `/canceled_fields_by_date_range_with_cancel_reason`
**Description:** Retrieves cancelled fields by team lead with cancellation reasons.

**Parameters:**
- `start_date` (string, required): Start date
- `end_date` (string, required): End date
- `group` (number, optional): Group ID (default: 0)
- `plantation` (number, optional): Plantation ID (default: 0)
- `region` (number, optional): Region ID (default: 0)
- `estate` (number, optional): Estate ID (default: 0)

---

## Error Handling

All API functions include comprehensive error handling:

1. **Authentication Errors:** Functions return `{ success: false, message: "User not logged in." }` when no valid token is found.

2. **Network Errors:** Functions catch axios errors and return appropriate error messages.

3. **API Errors:** Functions handle API response errors and return structured error objects.

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Status Response
```json
{
  "status": "true",
  "message": "Operation successful",
  "id": 123
}
```

## Rate Limiting
No specific rate limiting is implemented in the client-side code. Rate limiting should be handled by the server.

## Dependencies
- **Axios:** HTTP client library for making API requests
- **localStorage:** For storing authentication tokens

## Notes
- All endpoints use POST method regardless of the operation type
- Authentication is required for all endpoints except login and verification
- Date parameters should be in YYYY-MM-DD format
- File uploads use multipart/form-data content type
- The API supports both plantation and non-plantation operations
- Error handling is consistent across all functions
- All functions return promises and can be used with async/await syntax
