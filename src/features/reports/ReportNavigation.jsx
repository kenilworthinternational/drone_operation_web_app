import React, { useState } from 'react';
import '../../styles/reportsection.css';
import { FaChevronCircleDown, FaChevronCircleUp } from 'react-icons/fa';
import Finance2 from '../finance/Finance2';
import Finance3 from '../finance/Finance3';
import Finance from '../finance/Finance';
import OpsReport1 from '../../features/ops/OpsReport1';
import OpsReport1_1 from '../../features/ops/OpsReport1.1';
import OpsReport4_1 from '../../features/ops/OpsReport4.1';
import OpsReport2 from '../../features/ops/OpsReport2';
import OpsReport3 from '../../features/ops/OpsReport3';
import OpsReport4 from '../../features/ops/OpsReport4';
import OpsReport5 from '../../features/ops/OpsReport5';
import OpsReport6 from '../../features/ops/OpsReport6';
import OpsReport7 from '../../features/ops/OpsReport7';
import OpsReport8 from '../../features/ops/OpsReport8';
import OpsReport9 from '../../features/ops/OpsReport9';
import OpsReport10 from '../../features/ops/OpsReport10';
import OpsReport11 from '../../features/ops/OpsReport11';
import ChemicalsReport from '../plantation/ChemicalsReport';


const ReportSection = ({ section }) => {
  const [expandedSection, setExpandedSection] = useState(section || null);
  const [expandedItems, setExpandedItems] = useState({
    finance: null,
    ops: null,
    plantation: null,
    admin: null
  });

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
    // Reset items when collapsing section
    setExpandedItems(prev => ({ ...prev, [section]: null }));
  };

  const toggleSubItem = (section, item) => {
    setExpandedItems(prev => ({
      ...prev,
      [section]: prev[section] === item ? null : item
    }));
  };

  const showFinance = !section || section === 'finance';
  const showOps = !section || section === 'ops';
  const showPlantation = !section || section === 'plantation';

  return (
    <div className="reportsection">
      {/* Finance Section */}
      {showFinance && (
      <div className={`finance-section ${expandedSection === 'finance' ? 'has-expanded' : ''}`}>
        <div className="top-bar finance-top" onClick={() => toggleSection('finance')}>
          <h2>Finance</h2>
          {expandedSection === 'finance' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
        </div>

        {expandedSection === 'finance' && (
          <div className="finance-content">
            <div className="finance-item">
              <div className="finance-item-header" onClick={() => toggleSubItem('finance', 'field')}>
                <h3>Field Wise Report</h3>
                {expandedItems.finance === 'field' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.finance === 'field' && <Finance />}
            </div>

            <div className="finance-item">
              <div className="finance-item-header" onClick={() => toggleSubItem('finance', 'plantation')}>
                <h3>Date Wise Report by Plantation</h3>
                {expandedItems.finance === 'plantation' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.finance === 'plantation' && <Finance2 />}
            </div>
            <div className="finance-item">
              <div className="finance-item-header" onClick={() => toggleSubItem('finance', 'plantation2')}>
                <h3>Plantation Wise Report by Date</h3>
                {expandedItems.finance === 'plantation2' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.finance === 'plantation2' && <Finance3 />}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Ops Section */}
      {showOps && (
      <div className={`ops-section ${expandedSection === 'ops' ? 'has-expanded' : ''}`}>
        <div className="top-bar ops-top" onClick={() => toggleSection('ops')}>
          <h2>OPS</h2>
          {expandedSection === 'ops' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
        </div>

        {expandedSection === 'ops' && (
          <div className="ops-content">

            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilot')}>
                <h3>Pilot Performance Report (Pilot Data)</h3>
                {expandedItems.ops === 'pilot' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilot' && <OpsReport1 />}
            </div>
            
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilot_1')}>
                <h3>Pilot Performance Report (OpsRoom data)</h3>
                {expandedItems.ops === 'pilot_1' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilot_1' && <OpsReport1_1 />}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilotSum')}>
                <h3>Pilot Performance Summary Report (Pilot data)</h3>
                {expandedItems.ops === 'pilotSum' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilotSum' && <OpsReport4 />}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilotSum_1')}>
                <h3>Pilot Performance Summary Report (OpsRoom data)</h3>
                {expandedItems.ops === 'pilotSum_1' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilotSum_1' && <OpsReport4_1 />}
            </div>

            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilot_performance__pilot')}>
                <h3>Pilot Performance by Date (Pilot Data)</h3>
                {expandedItems.ops === 'pilot_performance__pilot' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilot_performance__pilot' && (
                <div className="ops-sub-content">
                  <OpsReport10 />
                </div>
              )}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilot_performance__opsroom')}>
                <h3>Pilot Performance by Date(OpsRoom Data)</h3>
                {expandedItems.ops === 'pilot_performance__opsroom' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilot_performance__opsroom' && (
                <div className="ops-sub-content">
                  <OpsReport9 />
                </div>
              )}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'analytics')}>
                <h3>Operations Report (Plan wise)</h3>
                {expandedItems.ops === 'analytics' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'analytics' && (
                <div className="ops-sub-content">
                  {expandedItems.ops === 'analytics' && <OpsReport2 />}
                </div>
              )}
            </div>

            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'leaders')}>
                <h3>Operations Report (Leader wise)</h3>
                {expandedItems.ops === 'leaders' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'leaders' && (
                <div className="ops-sub-content">
                  {expandedItems.ops === 'leaders' && <OpsReport3 />}
                </div>
              )}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'leaders_approve')}>
                <h3>Incomplete Fields (Leader wise)</h3>
                {expandedItems.ops === 'leaders_approve' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'leaders_approve' && (
                <div className="ops-sub-content">
                  {expandedItems.ops === 'leaders_approve' && <OpsReport5 />}
                </div>
              )}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'incomplete_subtasks')}>
                <h3>Incomplete Ops Room Rejected (Pilot wise)</h3>
                {expandedItems.ops === 'incomplete_subtasks' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'incomplete_subtasks' && (
                <div className="ops-sub-content">
                  {expandedItems.ops === 'incomplete_subtasks' && <OpsReport6 />}
                </div>
              )}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'canceled_pilot')}>
                <h3>Canceled by Pilots</h3>
                {expandedItems.ops === 'canceled_pilot' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'canceled_pilot' && (
                <div className="ops-sub-content">
                  {expandedItems.ops === 'canceled_pilot' && <OpsReport7 />}
                </div>
              )}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'canceled_teamlead')}>
                <h3>Cancelled Fields by Team Lead</h3>
                {expandedItems.ops === 'canceled_teamlead' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'canceled_teamlead' && (
                <div className="ops-sub-content">
                  {expandedItems.ops === 'canceled_teamlead' && <OpsReport8 />}
                </div>
              )}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilot_feedbacks')}>
                <h3>Pilot Feedbacks</h3>
                {expandedItems.ops === 'pilot_feedbacks' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilot_feedbacks' && (
                <div className="ops-sub-content">
                  {expandedItems.ops === 'pilot_feedbacks' && <OpsReport11 />}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Plantation Section */}
      {showPlantation && (
      <div className="plantation-section">
        <div className="top-bar plantation-top" onClick={() => toggleSection('plantation')}>
          <h2>Plantation</h2>
          {expandedSection === 'plantation' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
        </div>

        {expandedSection === 'plantation' && (
          <div className="plantation-content">
            <div className="plantation-item">
              <div className="plantation-item-header" onClick={() => toggleSubItem('plantation', 'chemicals')}>
                <h3>Chemicals Reports</h3>
                {expandedItems.plantation === 'chemicals' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.plantation === 'chemicals' && (
                <div className="plantation-sub-content">
                  <ChemicalsReport />
                </div>
              )}
            </div>
            {/* 
            <div className="plantation-item">
              <div className="plantation-item-header" onClick={() => toggleSubItem('plantation', 'soil')}>
                <h3>Soil Health</h3>
                {expandedItems.plantation === 'soil' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.plantation === 'soil' && (
                <div className="plantation-sub-content">
                  <p>Soil quality metrics...</p>
                </div>
              )}
            </div> */}
          </div>
        )}
      </div>
      )}

      {/* Admin Section */}
      {/* <div className="admin-section">
        <div className="top-bar admin-top" onClick={() => toggleSection('admin')}>
          <h2>Admin</h2>
          {expandedSection === 'admin' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
        </div>
        
        {expandedSection === 'admin' && (
          <div className="admin-content">
            <div className="admin-item">
              <div className="admin-item-header" onClick={() => toggleSubItem('admin', 'users')}>
                <h3>User Management</h3>
                {expandedItems.admin === 'users' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.admin === 'users' && (
                <div className="admin-sub-content">
                  <p>User accounts and permissions...</p>
                </div>
              )}
            </div>

            <div className="admin-item">
              <div className="admin-item-header" onClick={() => toggleSubItem('admin', 'system')}>
                <h3>System Settings</h3>
                {expandedItems.admin === 'system' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.admin === 'system' && (
                <div className="admin-sub-content">
                  <p>System configuration...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default ReportSection;