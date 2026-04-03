import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import UpcomingPlans from '../components/UpcomingPlans';
import '../../../../styles/plantationDashboard.css';

const PlantationUpcomingPage = ({ basePath = '/home/plantation-dashboard' } = {}) => {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState('Spray');

  const missionType = selectedAction === 'Spray' ? 'spy' : 'spd';

  return (
    <div className="plantation-dashboard-container">
      <div className="plantation-page-header">
        <button className="plantation-back-btn" onClick={() => navigate(basePath)}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="plantation-page-title">Upcoming Plans</h1>
      </div>

      <div className="plantation-page-content">
        {/* Spray/Spread Selector */}
        <div className="plantation-action-section">
          <div className="plantation-actions-row">
            <span className="plantation-charts-control-label">Mission Type:</span>
            <button 
              className={`plantation-action-btn ${selectedAction === 'Spray' ? 'active' : ''}`}
              onClick={() => setSelectedAction('Spray')}
            >
              Spray
            </button>
            <button 
              className={`plantation-action-btn ${selectedAction === 'Spread' ? 'active' : ''}`}
              onClick={() => setSelectedAction('Spread')}
            >
              Spread
            </button>
          </div>
        </div>

        <UpcomingPlans missionType={missionType} />
      </div>
    </div>
  );
};

export default PlantationUpcomingPage;
