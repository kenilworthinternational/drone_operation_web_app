import React, { useState } from 'react';
import EmployeeProfileHero from './EmployeeProfileHero';
import {
  TAB_GROUPS,
  DEFAULT_GROUP,
  DEFAULT_TAB,
  findGroupForTab,
} from './tabConfig';
import { renderEmployeeProfileTab } from './employeeProfileTabContent';

export default function EmployeeProfileTabbedView({ employeeId, readOnly = false }) {
  const [activeGroup, setActiveGroup] = useState(DEFAULT_GROUP);
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);

  const currentGroup = TAB_GROUPS.find((g) => g.key === activeGroup) || TAB_GROUPS[0];

  const handleSelectGroup = (groupKey) => {
    setActiveGroup(groupKey);
    const group = TAB_GROUPS.find((g) => g.key === groupKey);
    if (group && !group.tabs.some((t) => t.key === activeTab)) {
      setActiveTab(group.tabs[0].key);
    }
  };

  const handleSelectTab = (tabKey) => {
    setActiveTab(tabKey);
    setActiveGroup(findGroupForTab(tabKey));
  };

  return (
    <div className={`ep-main-profile${readOnly ? ' ep-profile-readonly' : ''}`}>
      <EmployeeProfileHero employeeId={employeeId} readOnly={readOnly} key={`hero-${employeeId}`} />

      {readOnly && (
        <p className="ep-readonly-banner">View-only profile — browse tabs to see full employee details.</p>
      )}

      <nav className="ep-tab-groups" aria-label="Profile sections">
        {TAB_GROUPS.map((group) => (
          <button
            key={group.key}
            type="button"
            className={`ep-tab-group-pill ${activeGroup === group.key ? 'ep-tab-group-pill--active' : ''}`}
            onClick={() => handleSelectGroup(group.key)}
          >
            {group.label}
          </button>
        ))}
      </nav>

      <div className="epd-tabs ep-sub-tabs">
        {currentGroup.tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`epd-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleSelectTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="epd-content">
        {renderEmployeeProfileTab(activeTab, employeeId, { readOnly })}
      </div>
    </div>
  );
}
