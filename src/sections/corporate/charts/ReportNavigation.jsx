import React, { useState } from 'react';
import '../../../styles/reportsection.css';
import { FaChevronCircleDown, FaChevronCircleUp } from 'react-icons/fa';
import EstateSprayedAreaReport from '../../finance/reports/EstateSprayedAreaReport';
import PlantationCoveredAreaReport from '../../finance/reports/PlantationCoveredAreaReport';
import DailyCoveredAreaSummary from '../../finance/reports/DailyCoveredAreaSummary';
import PilotPerformancePilotData from '../../opsroom/reports/PilotPerformancePilotData';
import PilotPerformanceOpsRoomData from '../../opsroom/reports/PilotPerformanceOpsRoomData';
import PilotSummaryOpsRoomData from '../../opsroom/reports/PilotSummaryOpsRoomData';
import OperationsReportPlanWise from '../../opsroom/reports/OperationsReportPlanWise';
import OperationsReportLeaderWise from '../../opsroom/reports/OperationsReportLeaderWise';
import PilotSummaryPilotData from '../../opsroom/reports/PilotSummaryPilotData';
import IncompleteFieldsLeaderWise from '../../opsroom/reports/IncompleteFieldsLeaderWise';
import IncompleteOpsRoomRejected from '../../opsroom/reports/IncompleteOpsRoomRejected';
import CanceledByPilots from '../../opsroom/reports/CanceledByPilots';
import CancelledFieldsByTeamLead from '../../opsroom/reports/CancelledFieldsByTeamLead';
import PilotPerformanceByDateOpsRoom from '../../opsroom/reports/PilotPerformanceByDateOpsRoom';
import PilotPerformanceByDatePilot from '../../opsroom/reports/PilotPerformanceByDatePilot';
import PilotFeedbacks from '../../opsroom/reports/PilotFeedbacks';
import ChemicalsReport from '../../../features/plantation/ChemicalsReport';


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
              {expandedItems.finance === 'field' && <EstateSprayedAreaReport />}
            </div>

            <div className="finance-item">
              <div className="finance-item-header" onClick={() => toggleSubItem('finance', 'plantation')}>
                <h3>Date Wise Report by Plantation</h3>
                {expandedItems.finance === 'plantation' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.finance === 'plantation' && <PlantationCoveredAreaReport />}
            </div>
            <div className="finance-item">
              <div className="finance-item-header" onClick={() => toggleSubItem('finance', 'plantation2')}>
                <h3>Plantation Wise Report by Date</h3>
                {expandedItems.finance === 'plantation2' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.finance === 'plantation2' && <DailyCoveredAreaSummary />}
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
              {expandedItems.ops === 'pilot' && <PilotPerformancePilotData />}
            </div>
            
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilot_1')}>
                <h3>Pilot Performance Report (OpsRoom data)</h3>
                {expandedItems.ops === 'pilot_1' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilot_1' && <PilotPerformanceOpsRoomData />}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilotSum')}>
                <h3>Pilot Performance Summary Report (Pilot data)</h3>
                {expandedItems.ops === 'pilotSum' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilotSum' && <PilotSummaryPilotData />}
            </div>
            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilotSum_1')}>
                <h3>Pilot Performance Summary Report (OpsRoom data)</h3>
                {expandedItems.ops === 'pilotSum_1' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilotSum_1' && <PilotSummaryOpsRoomData />}
            </div>

            <div className="ops-item">
              <div className="ops-item-header" onClick={() => toggleSubItem('ops', 'pilot_performance__pilot')}>
                <h3>Pilot Performance by Date (Pilot Data)</h3>
                {expandedItems.ops === 'pilot_performance__pilot' ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
              </div>
              {expandedItems.ops === 'pilot_performance__pilot' && (
                <div className="ops-sub-content">
                  <PilotPerformanceByDatePilot />
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
                  <PilotPerformanceByDateOpsRoom />
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
                  {expandedItems.ops === 'analytics' && <OperationsReportPlanWise />}
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
                  {expandedItems.ops === 'leaders' && <OperationsReportLeaderWise />}
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
                  {expandedItems.ops === 'leaders_approve' && <IncompleteFieldsLeaderWise />}
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
                  {expandedItems.ops === 'incomplete_subtasks' && <IncompleteOpsRoomRejected />}
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
                  {expandedItems.ops === 'canceled_pilot' && <CanceledByPilots />}
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
                  {expandedItems.ops === 'canceled_teamlead' && <CancelledFieldsByTeamLead />}
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
                  {expandedItems.ops === 'pilot_feedbacks' && <PilotFeedbacks />}
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