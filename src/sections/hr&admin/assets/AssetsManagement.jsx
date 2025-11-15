import React, { useState } from 'react';
import { FaClipboardList, FaExchangeAlt } from 'react-icons/fa';
import '../../../styles/assetsManagement.css';
import AssetsRegistry from './AssetsRegistry';
import AssetsTransfer from './AssetsTransfer';

const AssetsManagement = () => {
  // Main tab state (Registry, Transfer)
  const [mainTab, setMainTab] = useState('registry');

  return (
    <div className="assets-management-container">
      {/* Main Tab Navigation */}
      <div className="main-tabs-container">
        <button
          type="button"
          className={`main-tab ${mainTab === 'registry' ? 'active' : ''}`}
          onClick={() => setMainTab('registry')}
        >
          <FaClipboardList className="main-tab-icon" />
          <span>Assets Registry</span>
        </button>
        <button
          type="button"
          className={`main-tab ${mainTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setMainTab('transfer')}
        >
          <FaExchangeAlt className="main-tab-icon" />
          <span>Assets Transfer</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="main-tab-content">
        {mainTab === 'registry' && (
          <div className="registry-section">
            <AssetsRegistry />
          </div>
        )}
        {mainTab === 'transfer' && (
          <div className="transfer-section">
            <AssetsTransfer />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsManagement;

