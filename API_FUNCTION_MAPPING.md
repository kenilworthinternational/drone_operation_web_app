# API Function to RTK Query Endpoint Mapping

## Complete Mapping Reference

### Authentication
```javascript
verifyUser() → baseApi.endpoints.verifyUser.initiate()
loginUser() → baseApi.endpoints.loginUser.initiate()
sendOTP() → baseApi.endpoints.sendOTP.initiate()
```

### Estates & Geography
```javascript
groupGetter() → baseApi.endpoints.getGroups.initiate()
groupPlantation(id) → baseApi.endpoints.getPlantationsByGroup.initiate(id)
groupRegion(id) → baseApi.endpoints.getRegionsByPlantation.initiate(id)
groupEstate(id) → baseApi.endpoints.getEstatesByRegion.initiate(id)
displayEstate() → baseApi.endpoints.getAllEstates.initiate()
displayPlantation() → baseApi.endpoints.getAllPlantations.initiate()
estateListAcPlant(id) → baseApi.endpoints.getEstatesByPlantation.initiate(id)
estateListDetails(id) → baseApi.endpoints.getEstateDetails.initiate(id)
divisionStateList(id) → baseApi.endpoints.getDivisionsByEstate.initiate(id)
fieldDetails(id) → baseApi.endpoints.getFieldDetails.initiate(id)
```

### Plans
```javascript
getPlansUsingDate(date) → baseApi.endpoints.getPlansByDate.initiate(date)
getPlansUsingDateRange({start, end}) → baseApi.endpoints.getPlansByDateRange.initiate({startDate, endDate})
findPlanByID(id) → baseApi.endpoints.getPlanById.initiate(id)
findPlanSummary(id) → baseApi.endpoints.getPlanSummary.initiate(id)
submitPlan(data) → baseApi.endpoints.createPlan.initiate(data)
submitUpdatePlan(data) → baseApi.endpoints.updatePlan.initiate(data)
deletePlan(id) → baseApi.endpoints.deletePlan.initiate(id)
deactivatePlan(id, status) → baseApi.endpoints.changePlanStatus.initiate({planId: id, status})
updateDate(id, date) → baseApi.endpoints.updatePlanDate.initiate({planId: id, date})
updateDronePlan(planId, droneId) → baseApi.endpoints.updateDroneToPlan.initiate({planId, droneId})
updatePilotToPlan(planId, pilotId) → baseApi.endpoints.updatePilotToPlan.initiate({planId, pilotId})
getUpdateMissionDetails(data) → baseApi.endpoints.getPlansForUpdate.initiate(data)
getRescheduleMissionDetails(data) → baseApi.endpoints.getPlansForReschedule.initiate(data)
getPlanResorcesAllocation(id) → baseApi.endpoints.getPlanResourceAllocation.initiate(id)
```

### Teams
```javascript
getPilotsDetails() → baseApi.endpoints.getPilotsAndDrones.initiate()
displayTeamData() → baseApi.endpoints.getTeamData.initiate()
displayTeamDataNonp() → baseApi.endpoints.getTeamDataNonPlantation.initiate()
getDronesDetails() → baseApi.endpoints.getDronesList.initiate()
PilotDetaisPlan(id) → baseApi.endpoints.getPilotDetailsForPlan.initiate(id)
addTeamToPlan(data) → baseApi.endpoints.addTeamToPlan.initiate(data)
addTeamToPlanNonp(planId, teamId) → baseApi.endpoints.addTeamToMission.initiate({planId, teamId})
teamPlannedData(data) → baseApi.endpoints.getTeamPlannedData.initiate(data)
```

### Bookings/Missions
```javascript
dateRangAscBookings(start, end) → baseApi.endpoints.getASCBookingsByDateRange.initiate({startDate, endDate})
submitDataAscBooking(data) → baseApi.endpoints.createMission.initiate(data)
updateDatePlannedAscBooking(id, date, payment) → baseApi.endpoints.updateMissionPlannedDate.initiate({id, datePlaned: date, paymentType: payment})
updateMissionPlannedAsc(data) → baseApi.endpoints.updateMission.initiate(data)
setAscForMission(data) → baseApi.endpoints.setASCForMission.initiate(data)
setStatusAscPlan(id, status) → baseApi.endpoints.updateMissionStatus.initiate({id, status})
getPlansAscUsingDate(date) → baseApi.endpoints.getMissionsByPlannedDate.initiate(date)
```

### Reports
```javascript
leadReport(start, end) → baseApi.endpoints.getTeamLeadReport.initiate({startDate, endDate})
noOfFlights(start, end) → baseApi.endpoints.getFlightNumbersReport.initiate({startDate, endDate})
ApprovalCount(start, end) → baseApi.endpoints.getApprovalCountReport.initiate({startDate, endDate})
pilotsPerfomances(start, end) → baseApi.endpoints.getPilotPerformance.initiate({startDate, endDate})
fieldNotApprovedTeamLead(start, end) → baseApi.endpoints.getFieldsNotApprovedByTeamLead.initiate({startDate, endDate})
incompleteSubtasks(start, end) → baseApi.endpoints.getIncompleteSubtasks.initiate({startDate, endDate})
canceledFieldsByDateRange(start, end) → baseApi.endpoints.getCanceledFieldsByDateRange.initiate({startDate, endDate})
cancelledFieldsbyTeamLead(start, end) → baseApi.endpoints.getCancelledFieldsByTeamLead.initiate({startDate, endDate})
pilotFeedbacks(start, end) → baseApi.endpoints.getPilotFeedbacks.initiate({startDate, endDate})
pilotTeamSprayArea(start, end) → baseApi.endpoints.getPilotTeamSprayArea.initiate({startDate, endDate})
usedChemicals(start, end) → baseApi.endpoints.getUsedChemicals.initiate({startDate, endDate})
financeReport(start, end, estates) → baseApi.endpoints.getFinanceReport.initiate({startDate, endDate, estates})
financeReport2(start, end) → baseApi.endpoints.getPlantationCoveredArea.initiate({startDate, endDate})
```

### Dropdowns
```javascript
getSectors() → baseApi.endpoints.getSectors.initiate()
cropType() → baseApi.endpoints.getCropTypes.initiate()
missionType() → baseApi.endpoints.getMissionTypes.initiate()
getTimePick() → baseApi.endpoints.getTimeSlots.initiate()
chemicalTypeList() → baseApi.endpoints.getChemicalTypes.initiate()
getStages() → baseApi.endpoints.getStages.initiate()
displayAsc() → baseApi.endpoints.getASCs.initiate()
```

### Operators
```javascript
displayOperators() → baseApi.endpoints.getOperators.initiate()
assignOperator(planId, opId) → baseApi.endpoints.assignOperatorToPlan.initiate({planId, operatorId})
planOperatorsDateRange(start, end) → baseApi.endpoints.getPlanOperatorsByDateRange.initiate({startDate, endDate})
```

### Summary Data
```javascript
getSummaryDataGroup(id, start, end) → baseApi.endpoints.getSummaryByGroup.initiate({groupId: id, startDate, endDate})
getSummaryDataPlantation(id, start, end) → baseApi.endpoints.getSummaryByPlantation.initiate({plantationId: id, startDate, endDate})
getSummaryDataRegion(id, start, end) → baseApi.endpoints.getSummaryByRegion.initiate({regionId: id, startDate, endDate})
getSummaryDataEstate(id, start, end) → baseApi.endpoints.getSummaryByEstate.initiate({estateId: id, startDate, endDate})
getSummaryDataAllDateRange(start, end) → baseApi.endpoints.getAllPlansByDateRange.initiate({startDate, endDate})
getSummaryDataGroupAllDateRange(id, start, end) → baseApi.endpoints.getPlansByGroupDateRange.initiate({groupId: id, startDate, endDate})
getSummaryDataPlantationAllDateRange(id, start, end) → baseApi.endpoints.getPlansByPlantationDateRange.initiate({plantationId: id, startDate, endDate})
getSummaryDataRegionAllDateRange(id, start, end) → baseApi.endpoints.getPlansByRegionDateRange.initiate({regionId: id, startDate, endDate})
getSummaryDataEstateAllDateRange(id, start, end) → baseApi.endpoints.getPlansByEstateDateRangeWithField.initiate({estateId: id, startDate, endDate})
getUpdatedCalander(data, location) → baseApi.endpoints.getCalendarData.initiate({...data, location})
```

### Tasks
```javascript
displayTaskPlanAndField(planId, fieldId) → baseApi.endpoints.getTasksByPlanAndField.initiate({planId, fieldId})
pilotPlanandSubTaskList(start, end, estates) → baseApi.endpoints.getPilotPlansAndSubtasks.initiate({startDate, endDate, estates})
getSubmissionData(taskId) → baseApi.endpoints.getSubmissionData.initiate(taskId)
subTaskApproveorDecline(subtask, status) → baseApi.endpoints.updateSubtaskApproval.initiate({subtask, status})
subTaskLogDetails(subtask, status, reasonId, reasonText) → baseApi.endpoints.logSubtaskStatus.initiate({subtask, status, reasonId, reasonText})
reportTask(taskId, reason, reasonList) → baseApi.endpoints.reportTask.initiate({taskId, reason, reasonList})
viewTaskReport(taskId) → baseApi.endpoints.getTaskReport.initiate(taskId)
```

### Requests
```javascript
pendingRequestReschedule() → baseApi.endpoints.getPendingRescheduleRequests.initiate()
adHocPlanRequestPending() → baseApi.endpoints.getPendingAdHocRequests.initiate()
rescheduleRequestRequestManagerPending() → baseApi.endpoints.getPendingRescheduleRequestsByManager.initiate()
updateAdHocPlanRequest(reqId, date, status) → baseApi.endpoints.updateAdHocRequest.initiate({requestId: reqId, datePlanned: date, status})
updateReschedulePlanRequest(reqId, date, status) → baseApi.endpoints.updateRescheduleRequest.initiate({requestId: reqId, datePlanned: date, status})
```

### Finance
```javascript
pilotRevenue(date) → baseApi.endpoints.getPilotRevenueByDate.initiate(date)
pilotsEarnedByRevenue(date) → baseApi.endpoints.getSavedPilotRevenueByDate.initiate(date)
defaultValues(date) → baseApi.endpoints.getDefaultPaymentValues.initiate(date)
addPilotRevenue(...params) → baseApi.endpoints.addPilotRevenue.initiate({pilot, date, ...})
viewBrokers() → baseApi.endpoints.getBrokers.initiate()
addBroker(...params) → baseApi.endpoints.addBroker.initiate({name, mobile, ...})
updateBroker(...params) → baseApi.endpoints.updateBroker.initiate({id, name, ...})
searchBrokerByNIC(nic) → baseApi.endpoints.searchBrokerByNIC.initiate(nic)
```

### Farmers
```javascript
farmerDetailsAscBooking(nic) → baseApi.endpoints.getFarmerByNIC.initiate(nic)
addFarmer(data) → baseApi.endpoints.addFarmer.initiate(data)
updateFarmer(data) → baseApi.endpoints.updateFarmer.initiate(data)
```

### Reasons
```javascript
displayRejectReason() → baseApi.endpoints.getRejectReasons.initiate()
getReportReasons() → baseApi.endpoints.getFlagReasons.initiate()
pilotCanceledReasons() → baseApi.endpoints.getPartialCompleteReasons.initiate('c')
```

## Usage Pattern

```javascript
// OLD:
import { someApiFunction } from '../../../api/api';
const result = await someApiFunction(param1, param2);

// NEW:
import { baseApi } from '../../../api/baseApi';
import { useAppDispatch } from '../../../store/hooks';

const dispatch = useAppDispatch();
const result = await dispatch(baseApi.endpoints.someEndpoint.initiate({param1, param2}));
const data = result.data;
```

