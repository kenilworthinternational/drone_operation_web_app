import React, { useState } from 'react';
import '../../styles/managerrescheduler.css';
import ManagerPlanReschedule from './ManagerPlanReschedule';
import ManagerAdHocRequest from './ManagerAdHocRequest';

const ManagerRescheduler = () => {
  const [activeSection, setActiveSection] = useState('planReschedule');

  const renderContent = () => {
    switch (activeSection) {
      case 'planReschedule':
        return <ManagerPlanReschedule />;
      case 'adHocRequest':
        return <ManagerAdHocRequest />;
      default:
        return <ManagerPlanReschedule />;
    }
  };

  return (
    <div className="manager-rescheduler-modern-container">
      
      <div className="section-selector-container">
        <div 
          className={`section-card ${activeSection === 'planReschedule' ? 'active' : ''}`}
          onClick={() => setActiveSection('planReschedule')}
        >
          <div className="section-card-icon">📅</div>
          <div className="section-card-content">
            <h3 className="section-card-title">Plan Reschedule</h3>
            <p className="section-card-description">Manage reschedule requests from field managers</p>
          </div>
          <div className="section-card-indicator">
            <span className={`indicator-dot ${activeSection === 'planReschedule' ? 'active' : ''}`}></span>
          </div>
        </div>

        <div 
          className={`section-card ${activeSection === 'adHocRequest' ? 'active' : ''}`}
          onClick={() => setActiveSection('adHocRequest')}
        >
          <div className="section-card-icon">🚀</div>
          <div className="section-card-content">
            <h3 className="section-card-title">AdHoc Requests</h3>
            <p className="section-card-description">Review and approve ad-hoc mission requests</p>
          </div>
          <div className="section-card-indicator">
            <span className={`indicator-dot ${activeSection === 'adHocRequest' ? 'active' : ''}`}></span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="manager-content-wrapper">
        {renderContent()}
      </div>
    </div>
  );
};

export default ManagerRescheduler;