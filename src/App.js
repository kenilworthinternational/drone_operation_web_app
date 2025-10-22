import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UpdateServices from './features/misc/UpdateServices';
import CreateBookings from './features/bookings/CreateBookings';
import Dashboard from './features/dashboard/Dashboard';
import Login from './pages/Login';
import ProceedPlan from './features/misc/ProceedPlan';
import TeamAllocation from './features/misc/teamAllocation';
import NonpTeamAllocation from './features/nonp/nonpTeamAllocation';
import SummeryView from './features/misc/SummeryView';
import CalenderView from './features/calendar/CalenderView';
import CalenderViewOnly from './features/calendar/CalenderViewOnly';
import DeletePlan from './features/misc/DeletePlan';
import DeactivatePlan from './features/misc/DeactivatePlan';
import ReportSection from './features/reports/ReportNavigation';
import ModernReportSection from './features/reports/ModernReportSection';
import DayEndProcess from './features/dayend/DayEndProcess';
import Earnings from './features/dayend/Earnings';
import DayEndView from './features/dayend/DayEndView';
import DayEndProcessAsc from './features/dayend/DayEndProcessAsc';
import ManagerRescheduler from './features/misc/ManagerRescheduler';
import Missions from './features/misc/Missions';
import BookingList from './features/bookings/BookingList';
import ProceedPlanAscNonp from './features/misc/ProceedPlanAscNonp';
import MDDashboard from './features/dashboard/MDDashboard';
import FieldHistory from './features/misc/FieldHistory';
import DataViewer from './features/data/DataViewer';
import CEODataViewer from './features/dashboard/CEODataViewer';
import OpsAsign from './features/ops/OpsAsign';
import ReportReview from './features/reports/TaskReviewManagement';
import Brokers from './features/brokers/Brokers';

// ProtectedRoute component to check authentication
const ProtectedRoute = ({ children }) => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAuthenticated = userData && userData.login_status;

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
            path="calenderViewOnly"
            element={
              <ProtectedRoute>
                <CalenderViewOnly />
              </ProtectedRoute>
            }
          />
          <Route
            path="deletePlan"
            element={
              <ProtectedRoute>
                <DeletePlan />
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
            path="dayEndView"
            element={
              <ProtectedRoute>
                <DayEndView />
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
            path="managerRescheduler"
            element={
              <ProtectedRoute>
                <ManagerRescheduler />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookingList"
            element={
              <ProtectedRoute>
                <BookingList />
              </ProtectedRoute>
            }
          />
          <Route
            path="proceedPlanAsc"
            element={
              <ProtectedRoute>
                <ProceedPlanAscNonp />
              </ProtectedRoute>
            }
          />
          <Route
            path="opsAsign"
            element={
              <ProtectedRoute>
                <OpsAsign />
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;