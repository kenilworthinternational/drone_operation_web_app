import React, { useState } from 'react';
import '../../styles/modernreport.css';
import { FaChartLine, FaChartBar, FaChartPie, FaFileInvoiceDollar, FaPlane, FaUsers, FaTasks, FaCalendarCheck, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaComments, FaSeedling } from 'react-icons/fa';

// Import your report components
import Finance from '../finance/Finance';
import Finance2 from '../finance/Finance2';
import Finance3 from '../finance/Finance3';
import OpsReport1 from '../ops/OpsReport1';
import OpsReport1_1 from '../ops/OpsReport1.1';
import OpsReport4_1 from '../ops/OpsReport4.1';
import OpsReport2 from '../ops/OpsReport2';
import OpsReport3 from '../ops/OpsReport3';
import OpsReport4 from '../ops/OpsReport4';
import OpsReport5 from '../ops/OpsReport5';
import OpsReport6 from '../ops/OpsReport6';
import OpsReport7 from '../ops/OpsReport7';
import OpsReport8 from '../ops/OpsReport8';
import OpsReport9 from '../ops/OpsReport9';
import OpsReport10 from '../ops/OpsReport10';
import OpsReport11 from '../ops/OpsReport11';
import ChemicalsReport from '../plantation/ChemicalsReport';
import PilotRevenueDaily from './PilotRevenueDaily';
import PilotSummaryMonthly from './PilotSummaryMonthly';
import IndividualPilotSummary from './IndividualPilotSummary';

// Placeholder component for reports under development
const ComingSoonReport = ({ reportName }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '400px',
    textAlign: 'center',
    padding: '40px'
  }}>
    <div style={{ 
      fontSize: '48px', 
      marginBottom: '20px',
      opacity: 0.6
    }}>
      🚧
    </div>
    <h3 style={{ 
      color: '#666', 
      marginBottom: '10px',
      fontSize: '24px'
    }}>
      {reportName}
    </h3>
    <p style={{ 
      color: '#888', 
      fontSize: '16px',
      maxWidth: '400px',
      lineHeight: '1.5'
    }}>
      This report is currently under development. The API integration will be completed soon.
    </p>
  </div>
);

const ModernReportSection = ({ category = null }) => {
  // If category prop is provided, use it and disable category switching
  // If category is null or 'management', show all categories (Corporate/Management view with tabs)
  const isCorporateView = category === null || category === 'management';
  const [activeCategory, setActiveCategory] = useState(category === 'management' ? 'management' : (category || 'management'));
  const [selectedReport, setSelectedReport] = useState(null);

  // Use the prop category if provided, otherwise use state
  const currentCategoryKey = category === 'management' ? activeCategory : (category || activeCategory);

  // Define report categories and their metrics
  const reportCategories = {
    management: {
      title: 'Management Reports',
      color: '#4472c4',
      reports: [
        {
          id: 'finance_field',
          name: 'Field Wise Report',
          description: 'Financial analysis by field',
          icon: FaChartBar,
          component: Finance,
          metrics: { label: 'Fields', value: 'All' }
        },
        {
          id: 'finance_plantation_date',
          name: 'Date Wise Report by Plantation',
          description: 'Financial breakdown by plantation over time',
          icon: FaCalendarCheck,
          component: Finance2,
          metrics: { label: 'Plantations', value: 'All' }
        },
        {
          id: 'finance_plantation',
          name: 'Plantation Wise Report by Date',
          description: 'Compare plantations by date',
          icon: FaFileInvoiceDollar,
          component: Finance3,
          metrics: { label: 'Reports', value: 'All' }
        }
      ]
    },
    ops: {
      title: 'Operations Room Reports',
      color: '#28a745',
      reports: [
        {
          id: 'pilot_performance_pilot',
          name: 'Pilot Performance (Pilot Data)',
          description: 'Detailed pilot performance metrics',
          icon: FaPlane,
          component: OpsReport1,
          metrics: { label: 'Pilots', value: 'All' }
        },
        {
          id: 'pilot_performance_ops',
          name: 'Pilot Performance (OpsRoom Data)',
          description: 'OpsRoom verified performance data',
          icon: FaChartLine,
          component: OpsReport1_1,
          metrics: { label: 'Pilots', value: 'All' }
        },
        {
          id: 'pilot_summary_pilot',
          name: 'Pilot Summary (Pilot Data)',
          description: 'Summary of pilot activities',
          icon: FaUsers,
          component: OpsReport4,
          metrics: { label: 'Summary', value: 'All' }
        },
        {
          id: 'pilot_summary_ops',
          name: 'Pilot Summary (OpsRoom Data)',
          description: 'OpsRoom summary report',
          icon: FaChartPie,
          component: OpsReport4_1,
          metrics: { label: 'Summary', value: 'All' }
        },
        {
          id: 'pilot_date_pilot',
          name: 'Pilot Performance by Date (Pilot)',
          description: 'Daily pilot performance tracking',
          icon: FaCalendarCheck,
          component: OpsReport10,
          metrics: { label: 'Daily', value: 'All' }
        },
        {
          id: 'pilot_date_ops',
          name: 'Pilot Performance by Date (OpsRoom)',
          description: 'Daily OpsRoom performance data',
          icon: FaCalendarCheck,
          component: OpsReport9,
          metrics: { label: 'Daily', value: 'All' }
        },
        {
          id: 'ops_plan',
          name: 'Operations Report (Plan wise)',
          description: 'Analysis by operational plans',
          icon: FaTasks,
          component: OpsReport2,
          metrics: { label: 'Plans', value: 'All' }
        },
        {
          id: 'ops_leader',
          name: 'Operations Report (Leader wise)',
          description: 'Team leader performance analysis',
          icon: FaUsers,
          component: OpsReport3,
          metrics: { label: 'Leaders', value: 'All' }
        },
        // {
        //   id: 'incomplete_leader',
        //   name: 'Incomplete Fields (Leader wise)',
        //   description: 'Track incomplete tasks by leader',
        //   icon: FaExclamationTriangle,
        //   component: OpsReport5,
        //   metrics: { label: 'Incomplete', value: 'Track' }
        // },
        {
          id: 'incomplete_pilot',
          name: 'Incomplete Ops Room Rejected',
          description: 'Pilot rejected incomplete tasks',
          icon: FaTimesCircle,
          component: OpsReport6,
          metrics: { label: 'Rejected', value: 'Track' }
        },
        {
          id: 'canceled_pilot',
          name: 'Canceled by Pilots',
          description: 'Tasks canceled by pilot decision',
          icon: FaTimesCircle,
          component: OpsReport7,
          metrics: { label: 'Canceled', value: 'Track' }
        },
        {
          id: 'canceled_leader',
          name: 'Cancelled Fields by Team Lead',
          description: 'Team lead cancellations',
          icon: FaTimesCircle,
          component: OpsReport8,
          metrics: { label: 'Canceled', value: 'Track' }
        },
        {
          id: 'pilot_feedback',
          name: 'Pilot Feedbacks',
          description: 'Pilot feedback and comments',
          icon: FaComments,
          component: OpsReport11,
          metrics: { label: 'Feedbacks', value: 'All' }
        }
      ]
    },
    finance: {
      title: 'Finance Reports',
      color: '#ffc107',
      reports: [
        {
          id: 'finance_field_detailed',
          name: 'Field Wise Financial Report',
          description: 'Detailed field financial analysis',
          icon: FaFileInvoiceDollar,
          component: Finance,
          metrics: { label: 'Fields', value: 'All' }
        },
        {
          id: 'finance_date_plantation',
          name: 'Date Wise by Plantation',
          description: 'Financial timeline by plantation',
          icon: FaChartLine,
          component: Finance2,
          metrics: { label: 'Timeline', value: 'All' }
        },
        {
          id: 'finance_plantation_date',
          name: 'Plantation Wise by Date',
          description: 'Plantation financial comparison',
          icon: FaChartBar,
          component: Finance3,
          metrics: { label: 'Plantations', value: 'All' }
        },
        {
          id: 'pilot_revenue_daily',
          name: 'Pilot Revenue Daily',
          description: 'Daily pilot earnings and revenue tracking',
          icon: FaChartLine,
          component: PilotRevenueDaily,
          metrics: { label: 'Daily', value: 'Revenue' }
        },
        {
          id: 'pilot_summary_monthly',
          name: 'Pilot Summary Monthly',
          description: 'Monthly pilot performance summary',
          icon: FaChartBar,
          component: PilotSummaryMonthly,
          metrics: { label: 'Monthly', value: 'Summary' }
        },
        {
          id: 'individual_pilot_summary',
          name: 'Individual Pilot Summary',
          description: 'Individual pilot detailed earnings report',
          icon: FaUsers,
          component: IndividualPilotSummary,
          metrics: { label: 'Individual', value: 'Details' }
        }
      ]
    },
    plantation: {
      title: 'Plantation Reports',
      color: '#17a2b8',
      reports: [
        {
          id: 'chemicals',
          name: 'Chemicals Report',
          description: 'Chemical usage and analysis',
          icon: FaSeedling,
          component: ChemicalsReport,
          metrics: { label: 'Chemicals', value: 'All' }
        }
      ]
    }
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
  };

  const handleBackToReports = () => {
    setSelectedReport(null);
  };

  const currentCategory = reportCategories[currentCategoryKey];

  return (
    <div className="modern-report-container">
      {/* Category Tabs - Only show in Corporate view */}
      {!selectedReport && isCorporateView && (
        <div className="report-category-tabs">
          <button
            className={`category-tab ${activeCategory === 'management' ? 'active' : ''}`}
            onClick={() => setActiveCategory('management')}
          >
            Management Reports
          </button>
          <button
            className={`category-tab ${activeCategory === 'ops' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ops')}
          >
            Operations Room
          </button>
          <button
            className={`category-tab ${activeCategory === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveCategory('finance')}
          >
            Finance
          </button>
          <button
            className={`category-tab ${activeCategory === 'plantation' ? 'active' : ''}`}
            onClick={() => setActiveCategory('plantation')}
          >
            Plantation
          </button>
        </div>
      )}

      {/* Report Selection Grid */}
      {!selectedReport && (
        <div className="report-selection-section">
          <div className="report-section-header">
            <h2>{currentCategory.title}</h2>
            <p>Select a report to view detailed analytics</p>
          </div>

          <div className="report-cards-grid">
            {currentCategory.reports.map((report) => {
              const IconComponent = report.icon;
              return (
                <div
                  key={report.id}
                  className="report-card"
                  onClick={() => handleReportSelect(report)}
                  style={{ borderTopColor: currentCategory.color }}
                >
                  <div className="report-card-icon" style={{ backgroundColor: `${currentCategory.color}15`, color: currentCategory.color }}>
                    <IconComponent />
                  </div>
                  <div className="report-card-content">
                    <h3>{report.name}</h3>
                    <p>{report.description}</p>
                    <div className="report-card-metrics">
                      <span className="metric-label">{report.metrics.label}:</span>
                      <span className="metric-value">{report.metrics.value}</span>
                    </div>
                  </div>
                  <div className="report-card-arrow">→</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Report Display */}
      {selectedReport && (
        <div className="report-display-section">
          <div className="report-display-header">
            <button className="back-button" onClick={handleBackToReports}>
              ← Back to Reports
            </button>
            <div className="report-display-title">
              <h2>{selectedReport.name}</h2>
              <p>{selectedReport.description}</p>
            </div>
          </div>
          <div className="report-display-content">
            {selectedReport.component ? (
              <selectedReport.component />
            ) : (
              <ComingSoonReport reportName={selectedReport.name} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernReportSection;

