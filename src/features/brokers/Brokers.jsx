import React, { useState } from 'react';
import { FaUserPlus, FaUsersCog } from 'react-icons/fa';
import BrokerRegistration from './BrokerRegistration';
import BrokerManagement from './BrokerManagement';
import '../../styles/brokers.css';

const Brokers = () => {
  const [activeTab, setActiveTab] = useState('registration');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="brokers-container">
      {/* Tab Navigation */}
      <div className="brokers-tabs">
        <div 
          className={`broker-tab ${activeTab === 'registration' ? 'active' : ''}`}
          onClick={() => handleTabChange('registration')}
        >
          <FaUserPlus className="tab-icon" />
          <span className="tab-text">Broker Registration</span>
        </div>
        
        <div 
          className={`broker-tab ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => handleTabChange('management')}
        >
          <FaUsersCog className="tab-icon" />
          <span className="tab-text">Broker Management</span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="brokers-content">
        {activeTab === 'registration' && (
          <div className="tab-panel">
            <BrokerRegistration />
          </div>
        )}
        
        {activeTab === 'management' && (
          <div className="tab-panel">
            <BrokerManagement />
          </div>
        )}
      </div>
    </div>
  );
};

export default Brokers;


