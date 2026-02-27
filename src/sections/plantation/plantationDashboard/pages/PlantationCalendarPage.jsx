import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import PlantationCalendar from '../components/PlantationCalendar';
import SingleMonthPicker from '../components/SingleMonthPicker';
import '../../../../styles/plantationDashboard.css';

const PlantationCalendarPage = () => {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState('Spray');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const missionType = selectedAction === 'Spray' ? 'spy' : 'spd';

  return (
    <div className="plantation-dashboard-container">
      <div className="plantation-page-header">
        <button className="plantation-back-btn" onClick={() => navigate('/home/plantation-dashboard')}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="plantation-page-title">Calendar</h1>
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

        <PlantationCalendar 
          missionType={missionType}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
        />
      </div>
    </div>
  );
};

export default PlantationCalendarPage;
