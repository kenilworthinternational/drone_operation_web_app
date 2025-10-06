import React, { useState } from 'react';
import '../../styles/managerrescheduler.css';
import ManagerPlanReschedule from './ManagerPlanReschedule';
import ManagerAdHocRequest from './ManagerAdHocRequest';

const ManagerRescheduler = () => {
  const [activeTab, setActiveTab] = useState('planReschedule');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'planReschedule':
        return <ManagerPlanReschedule />;
      case 'adHocRequest':
        return <ManagerAdHocRequest />;
      default:
        return <ManagerPlanReschedule />;
    }
  };

  return (
    <div className="manager-rescheduler-container">
      {/* Main Tabs */}
      <div className="tabs-planrescheduler">
        <button
          className={`tab-planrescheduler ${activeTab === 'planReschedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('planReschedule')}
        >
          Plan Reschedule
        </button>
        <button
          className={`tab-planrescheduler ${activeTab === 'adHocRequest' ? 'active' : ''}`}
          onClick={() => setActiveTab('adHocRequest')}
        >
          AddHoc Request
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default ManagerRescheduler;