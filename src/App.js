import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './View/HomePage';
import Services from './View/Services';
import Dashboard from './View/Dashboard';
import Login from './View/Login';
import ProceedPlan from './View/ProceedPlan';
import SummeryView from './View/SummeryView';
import CalenderView from './View/CalenderView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* HomePage is the layout, Dashboard and Services load inside it */}
        <Route path="/home" element={<HomePage />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="services" element={<Services />} />
          <Route path="proceedPlan" element={<ProceedPlan />} />
          <Route path="summeryView" element={<SummeryView />} />
          <Route path="calenderView" element={<CalenderView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
