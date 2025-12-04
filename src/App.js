import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UpdateServices from './features/misc/UpdateServices';
import CreateBookings from './sections/management/bookings/CreateBookings';
import Dashboard from './features/dashboard/Dashboard';
import Login from './pages/Login';
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
import CEODataViewer from './features/dashboard/CEODataViewer';
import OpsAssign from './sections/opsroom/operators/OpsAssign';
import ReportReview from './sections/corporate/charts/TaskReviewManagement';
import Brokers from './sections/finance/brokers/Brokers';
import WorkflowDashboard from './sections/opsroom/dashboard/WorkflowDashboard';
import PlanCalendar from './sections/opsroom/calendar/PlanCalendar';
import RequestsQueueMain from './sections/opsroom/requests/RequestsQueueMain';
import RequestProceed from './sections/opsroom/requests/RequestProceed';
import PlansWithWeather from './sections/opsroom/plans/PlansWithWeather';
import PilotAssignment from './sections/opsroom/pilot-assigment/PilotAssignment';
import EmployeeRegistration from './sections/hr&admin/EmployeeRegistration';
import Employees from './sections/hr&admin/Employees';
import JDManagement from './sections/hr&admin/JDManagement';
import EmployeeAssignment from './sections/hr&admin/EmployeeAssignment';
import MonthlyRoaster from './sections/hr&admin/roaster/MonthlyRoaster';
import RoasterPlanning from './sections/hr&admin/roaster/RoasterPlanning';
import ResourceAllocation from './sections/fleet/ResourceAllocation';
import Users from './sections/ict/users/Users';
import AuthControls from './sections/ict/authentication/AuthControls';
import SupplierRegistration from './sections/stock-assets/SupplierRegistration';
import InventoryItemsRegistration from './sections/stock-assets/InventoryItemsRegistration';
import ProcurementProcess from './sections/stock-assets/ProcurementProcess';
import CentralStores from './sections/stock-assets/CentralStores';
import AssetTransfer from './sections/stock-assets/AssetTransfer';
import AssetRequest from './sections/stock-assets/AssetRequest';

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
                <Navigate to="/home/create" replace />
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
            path="stock-assets/procurement-process"
            element={
              <ProtectedRoute>
                <ProcurementProcess />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock-assets/central-stores"
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
