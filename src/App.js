import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WingHubHome from './pages/WingHubHome';
import CombHubPage from './pages/CombHubPage';
import UpdateServices from './features/misc/UpdateServices';
import CreateBookings from './sections/management/bookings/CreateBookings';
import Dashboard from './features/dashboard/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProceedPlan from './features/misc/ProceedPlan';
import TeamAllocation from './features/misc/teamAllocation';
import NonpTeamAllocation from './features/nonp/nonpTeamAllocation';
import SummeryView from './features/misc/SummeryView';
import CalenderView from './features/calendar/CalenderView';
import DeactivatePlan from './features/misc/DeactivatePlan';
import ModernReportSection from './components/ModernReportSection';
import DayEndProcess from './sections/opsroom/dayend/DayEndProcess';
import Earnings from './sections/finance/PilotEarnings/Earnings';
import DayEndProcessAsc from './sections/opsroom/dayend/DayEndProcessAsc';
// import ManagerRescheduler from './features/misc/ManagerRescheduler';
import Missions from './features/misc/Missions';
import BookingList from './sections/management/bookings/BookingList';
// import ProceedPlanAscNonp from './features/misc/ProceedPlanAscNonp';
import MDDashboard from './features/dashboard/MDDashboard';
import FieldHistory from './sections/management/ops/FieldHistory';
import DataViewer from './sections/corporate/chartView/DataViewer';
import FinancialCards from './sections/finance/financialCards/FinancialCards';
import FinanceApprovals from './sections/finance/financeApprovals/FinanceApprovals';
import VehicleRent from './sections/finance/vehicleRent/VehicleRent';
import VehicleRentApprovals from './sections/hr&admin/vehicleRentApprovals/VehicleRentApprovals';
import DriverAdvanceApprovals from './sections/hr&admin/driverAdvanceApprovals/DriverAdvanceApprovals';
import DriverAdvanceFinance from './sections/finance/driverAdvance/DriverAdvanceFinance';
import DriverLeaveDatesHr from './sections/hr&admin/driverLeaveDates/DriverLeaveDatesHr';
import TransportHrDashboard from './sections/transport/TransportHrDashboard';
import TransportFinanceDashboard from './sections/transport/TransportFinanceDashboard';
import CEODataViewer from './features/dashboard/CEODataViewer';
import OpsAssign from './sections/opsroom/operators/OpsAssign';
import ReportReview from './sections/corporate/charts/TaskReviewManagement';
import Brokers from './sections/finance/brokers/Brokers';
import WorkflowDashboard from './sections/opsroom/dashboard/WorkflowDashboard';
import MonitoringDashboard from './sections/opsroom/monitoring/MonitoringDashboard';
import PlanCalendar from './sections/opsroom/calendar/PlanCalendar';
import RequestsQueueMain from './sections/opsroom/requests/RequestsQueueMain';
import RequestProceed from './sections/opsroom/requests/RequestProceed';
import PlansWithWeather from './sections/opsroom/plans/PlansWithWeather';
import PilotAssignment from './sections/opsroom/pilot-assigment/PilotAssignment';
import TransportArrangePage from './sections/opsroom/pilot-assigment/TransportArrangePage';
import TodayPlans from './sections/opsroom/today-plans/TodayPlans';
import EmergencyMoving from './sections/opsroom/emergency/EmergencyMoving';
import FieldSizeAdjustments from './sections/opsroom/fieldSizeAdjustments/FieldSizeAdjustments';
import EmployeeRegistration from './sections/hr&admin/EmployeeRegistration';
import Employees from './sections/hr&admin/Employees';
import JDManagement from './sections/hr&admin/JDManagement';
import EmployeeAssignment from './sections/hr&admin/EmployeeAssignment';
import MonthlyRoaster from './sections/hr&admin/roaster/MonthlyRoaster';
import RoasterPlanning from './sections/hr&admin/roaster/RoasterPlanning';
import ResourceAllocation from './sections/fleet/resource-allocation/ResourceAllocation';
import AccidentReports from './sections/fleet/accident-reports/AccidentReports';
import Maintenance from './sections/fleet/maintenance/Maintenance';
import FleetUpdate from './sections/fleet/fleet-update/FleetUpdate';
import DjiMapUpload from './sections/opsroom/dji/DjiMapUpload';
import ManagerApprovalQueue from './sections/opsroom/manager-approval/ManagerApprovalQueue';
import PlantationPlanRequestQueue from './sections/opsroom/plantation-plan-requests/PlantationPlanRequestQueue';
import PendingPaymentQueue from './sections/opsroom/pending-payment/PendingPaymentQueue';
import DroneUnlockingQueue from './sections/opsroom/drone-unlocking/DroneUnlockingQueue';
import Users from './sections/ict/users/Users';
import AuthControls from './sections/ict/authentication/AuthControls';
import AppVersionManagement from './sections/ict/appVersions/AppVersionManagement';
import LogsReportPage from './sections/ict/logsReport/LogsReportPage';
import SprintPlanning from './sections/ict/development/SprintPlanning';
import DevelopmentBoard from './sections/ict/development/DevelopmentBoard';
import ExtraWorkQueue from './sections/ict/development/ExtraWorkQueue';
import MetricsDashboard from './sections/ict/development/MetricsDashboard';
import IctDevCenter from './sections/ict/development/DevCenter';
import SupplierRegistration from './sections/stock-assets/SupplierRegistration';
import InventoryItemsRegistration from './sections/stock-assets/InventoryItemsRegistration';
import ProcurementProcess from './sections/stock-assets/ProcurementProcess';
import CentralStores from './sections/stock-assets/CentralStores';
import AssetTransfer from './sections/stock-assets/AssetTransfer';
import AssetRequest from './sections/stock-assets/AssetRequest';
import VehicleAppAdmin from './sections/hr&admin/vehicleAppAdmin/VehicleAppAdmin';
import PlantationDashboard from './sections/plantation/plantationDashboard/PlantationDashboard';
import PlantationChartsPage from './sections/plantation/plantationDashboard/pages/PlantationChartsPage';
import PlantationCalendarPage from './sections/plantation/plantationDashboard/pages/PlantationCalendarPage';
import PlantationUpcomingPage from './sections/plantation/plantationDashboard/pages/PlantationUpcomingPage';
import PlantationReportsPage from './sections/plantation/plantationDashboard/pages/PlantationReportsPage';
import ChartBreakdownPage from './sections/plantation/plantationDashboard/pages/ChartBreakdownPage';
import GlobalChartBreakdownPage from './sections/corporate/charts/GlobalChartBreakdownPage';
import MappingUpdatePage from './sections/geo-spatial/mapping/MappingUpdatePage';

import { useAppSelector } from './store/hooks';

// ProtectedRoute component to check authentication
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? children : <Navigate to="/login" />;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Wrap protected routes with ProtectedRoute */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ProtectedRoute>
                <WingHubHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="comb"
            element={
              <ProtectedRoute>
                <CombHubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dataViewer"
            element={
              <ProtectedRoute>
                <DataViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="dataViewer/chart-breakdown"
            element={
              <ProtectedRoute>
                <GlobalChartBreakdownPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="ceoDataViewer"
            element={
              <ProtectedRoute>
                <CEODataViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="mDDashboard"
            element={
              <ProtectedRoute>
                <MDDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="createBookings"
            element={
              <ProtectedRoute>
                <CreateBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="create"
            element={
              <ProtectedRoute>
                <PlansWithWeather />
              </ProtectedRoute>
            }
          />
          <Route
            path="updateservices"
            element={
              <ProtectedRoute>
                <UpdateServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="missions"
            element={
              <ProtectedRoute>
                <Missions />
              </ProtectedRoute>
            }
          />
          <Route
            path="proceedPlan"
            element={
              <ProtectedRoute>
                <ProceedPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="teamAllocation"
            element={
              <ProtectedRoute>
                <TeamAllocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="nonpTeamAllocation"
            element={
              <ProtectedRoute>
                <NonpTeamAllocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="summeryView"
            element={
              <ProtectedRoute>
                <SummeryView />
              </ProtectedRoute>
            }
          />
          <Route
            path="calenderView"
            element={
              <ProtectedRoute>
                <Navigate to="/home/calenderView/corporate" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="calenderView/corporate"
            element={
              <ProtectedRoute>
                <CalenderView />
              </ProtectedRoute>
            }
          />
          <Route
            path="geo-spatial/mapping-update"
            element={
              <ProtectedRoute>
                <MappingUpdatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="calenderView/management"
            element={
              <ProtectedRoute>
                <CalenderView />
              </ProtectedRoute>
            }
          />
          <Route
            path="calenderView/opsroom"
            element={
              <ProtectedRoute>
                <CalenderView />
              </ProtectedRoute>
            }
          />
          <Route
            path="deactivatePlan"
            element={
              <ProtectedRoute>
                <DeactivatePlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="reportSection"
            element={
              <ProtectedRoute>
                <ModernReportSection category={null} />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/corporate"
            element={
              <ProtectedRoute>
                <ModernReportSection category={null} />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/management"
            element={
              <ProtectedRoute>
                <ModernReportSection category="management" />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/finance"
            element={
              <ProtectedRoute>
                <ModernReportSection category="finance" />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/ops"
            element={
              <ProtectedRoute>
                <ModernReportSection category="ops" />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/plantation"
            element={
              <ProtectedRoute>
                <ModernReportSection category="plantation" />
              </ProtectedRoute>
            }
          />
          <Route
            path="dayEndProcess"
            element={
              <ProtectedRoute>
                <DayEndProcess />
              </ProtectedRoute>
            }
          />
          <Route
            path="dayEndProcessAsc"
            element={
              <ProtectedRoute>
                <DayEndProcessAsc />
              </ProtectedRoute>
            }
          />
          <Route
            path="fieldHistory"
            element={
              <ProtectedRoute>
                <FieldHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="fieldSizeAdjustments"
            element={
              <ProtectedRoute>
                <FieldSizeAdjustments />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="managerRescheduler"
            element={
              <ProtectedRoute>
                <ManagerRescheduler />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="bookingList"
            element={
              <ProtectedRoute>
                <BookingList />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="proceedPlanAsc"
            element={
              <ProtectedRoute>
                <ProceedPlanAscNonp />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="opsAsign"
            element={
              <ProtectedRoute>
                <OpsAssign />
              </ProtectedRoute>
            }
          />
          <Route
            path="reportReview"
            element={
              <ProtectedRoute>
                <ReportReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="earnings"
            element={
              <ProtectedRoute>
                <Earnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="brokers"
            element={
              <ProtectedRoute>
                <Brokers />
              </ProtectedRoute>
            }
          />
          <Route
            path="financial-cards"
            element={
              <ProtectedRoute>
                <FinancialCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance-approvals"
            element={
              <ProtectedRoute>
                <FinanceApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="vehicle-rent"
            element={
              <ProtectedRoute>
                <VehicleRent />
              </ProtectedRoute>
            }
          />
          <Route
            path="vehicle-rent-approvals"
            element={
              <ProtectedRoute>
                <VehicleRentApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="driver-advance-approvals"
            element={
              <ProtectedRoute>
                <DriverAdvanceApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="driver-leave-dates"
            element={
              <ProtectedRoute>
                <DriverLeaveDatesHr />
              </ProtectedRoute>
            }
          />
          <Route
            path="driver-advance-finance"
            element={
              <ProtectedRoute>
                <DriverAdvanceFinance />
              </ProtectedRoute>
            }
          />
          <Route
            path="transport/hr"
            element={
              <ProtectedRoute>
                <TransportHrDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="transport/finance"
            element={
              <ProtectedRoute>
                <TransportFinanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="monitoringDashboard"
            element={
              <ProtectedRoute>
                <MonitoringDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="workflowDashboard"
            element={
              <ProtectedRoute>
                <WorkflowDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="opsroomPlanCalendar"
            element={
              <ProtectedRoute>
                <PlanCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="requestsQueue"
            element={
              <ProtectedRoute>
                <RequestsQueueMain />
              </ProtectedRoute>
            }
          />
          <Route
            path="pilotAssignment"
            element={
              <ProtectedRoute>
                <PilotAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="pilotAssignment/transport-arrange"
            element={
              <ProtectedRoute>
                <TransportArrangePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="djiMapUpload"
            element={
              <ProtectedRoute>
                <DjiMapUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="managerApprovalQueue"
            element={
              <ProtectedRoute>
                <ManagerApprovalQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="plantationPlanRequestQueue"
            element={
              <ProtectedRoute>
                <PlantationPlanRequestQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="pendingPaymentQueue"
            element={
              <ProtectedRoute>
                <PendingPaymentQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="droneUnlockingQueue"
            element={
              <ProtectedRoute>
                <DroneUnlockingQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="todayPlans"
            element={
              <ProtectedRoute>
                <TodayPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="emergencyMoving"
            element={
              <ProtectedRoute>
                <EmergencyMoving />
              </ProtectedRoute>
            }
          />
          <Route
            path="requestProceed"
            element={
              <ProtectedRoute>
                <RequestProceed />
              </ProtectedRoute>
            }
          />
          <Route
            path="employeeRegistration"
            element={
              <ProtectedRoute>
                <EmployeeRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="jdManagement"
            element={
              <ProtectedRoute>
                <JDManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="employeeAssignment"
            element={
              <ProtectedRoute>
                <EmployeeAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="attendance/monthly-roaster"
            element={
              <ProtectedRoute>
                <MonthlyRoaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="attendance/roaster-planning"
            element={
              <ProtectedRoute>
                <RoasterPlanning />
              </ProtectedRoute>
            }
          />
          <Route
            path="fleet"
            element={
              <ProtectedRoute>
                <ResourceAllocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="accident-reports"
            element={
              <ProtectedRoute>
                <AccidentReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="maintenance"
            element={
              <ProtectedRoute>
                <Maintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="fleet-update"
            element={
              <ProtectedRoute>
                <FleetUpdate />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/system-admin/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/system-admin/auth-controls"
            element={
              <ProtectedRoute>
                <AuthControls />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/system-admin/app-versions"
            element={
              <ProtectedRoute>
                <AppVersionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/system-admin/logs-report"
            element={
              <ProtectedRoute>
                <LogsReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/system-admin/master-data-update"
            element={
              <ProtectedRoute>
                <VehicleAppAdmin mode="masters" />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/development"
            element={
              <ProtectedRoute>
                <Navigate to="/home/ict/development/dev-center" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/development/dev-center"
            element={
              <ProtectedRoute>
                <IctDevCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/development/workflow-dashboard"
            element={
              <ProtectedRoute>
                <Navigate to="/home/ict/development/dev-center" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/development/sprints"
            element={
              <ProtectedRoute>
                <SprintPlanning />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/development/board"
            element={
              <ProtectedRoute>
                <DevelopmentBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/development/extra-work"
            element={
              <ProtectedRoute>
                <ExtraWorkQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="ict/development/metrics"
            element={
              <ProtectedRoute>
                <MetricsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="hr-admin/vehicle-app-admin"
            element={
              <ProtectedRoute>
                <VehicleAppAdmin mode="operations" />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock-assets/supplier-registration"
            element={
              <ProtectedRoute>
                <SupplierRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock-assets/inventory-items-registration"
            element={
              <ProtectedRoute>
                <InventoryItemsRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock-assets/procurement-process/*"
            element={
              <ProtectedRoute>
                <ProcurementProcess />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock-assets/central-stores/*"
            element={
              <ProtectedRoute>
                <CentralStores />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock-assets/asset-transfer"
            element={
              <ProtectedRoute>
                <AssetTransfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock-assets/asset-request"
            element={
              <ProtectedRoute>
                <AssetRequest />
              </ProtectedRoute>
            }
          />
          {/* Internal Plantation Dashboard */}
          <Route
            path="dashboard/charts"
            element={
              <ProtectedRoute>
                <PlantationChartsPage basePath="/home/dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/calendar"
            element={
              <ProtectedRoute>
                <PlantationCalendarPage basePath="/home/dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/upcoming"
            element={
              <ProtectedRoute>
                <PlantationUpcomingPage basePath="/home/dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/reports"
            element={
              <ProtectedRoute>
                <PlantationReportsPage basePath="/home/dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/chart-breakdown"
            element={
              <ProtectedRoute>
                <ChartBreakdownPage basePath="/home/dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="plantation-dashboard"
            element={
              <ProtectedRoute>
                <PlantationDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="plantation-dashboard/charts"
            element={
              <ProtectedRoute>
                <PlantationChartsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="plantation-dashboard/calendar"
            element={
              <ProtectedRoute>
                <PlantationCalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="plantation-dashboard/upcoming"
            element={
              <ProtectedRoute>
                <PlantationUpcomingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="plantation-dashboard/reports"
            element={
              <ProtectedRoute>
                <PlantationReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="plantation-dashboard/chart-breakdown"
            element={
              <ProtectedRoute>
                <ChartBreakdownPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
