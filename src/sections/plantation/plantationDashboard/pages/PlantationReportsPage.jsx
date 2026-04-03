import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import CompletedMissionReports from '../components/CompletedMissionReports';
import SingleMonthPicker from '../components/SingleMonthPicker';
import '../../../../styles/plantationDashboard.css';

const PlantationReportsPage = ({ basePath = '/home/plantation-dashboard' } = {}) => {
  const completedPlansOnly =
    basePath === '/home/plantation-dashboard' || basePath.startsWith('/home/plantation-dashboard/');
  const navigate = useNavigate();
  const [reportsMonth, setReportsMonth] = useState(new Date());

  const reportsDateRange = useMemo(() => {
    const start = new Date(reportsMonth.getFullYear(), reportsMonth.getMonth(), 1);
    const end = new Date(reportsMonth.getFullYear(), reportsMonth.getMonth() + 1, 0);
    return {
      start: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
      end: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
    };
  }, [reportsMonth]);

  return (
    <div className="plantation-dashboard-container">
      <div className="plantation-page-header">
        <button className="plantation-back-btn" onClick={() => navigate(basePath)}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="plantation-page-title">Completed Reports</h1>
      </div>

      <div className="plantation-page-content">
        {/* Month Selector */}
        <div className="plantation-action-section">
          <div className="plantation-actions-row">
            <span className="plantation-charts-control-label">Month:</span>
            <SingleMonthPicker
              selectedMonth={reportsMonth}
              onChange={setReportsMonth}
            />
          </div>
        </div>

        <CompletedMissionReports
          startDate={reportsDateRange.start}
          endDate={reportsDateRange.end}
          completedPlansOnly={completedPlansOnly}
        />
      </div>
    </div>
  );
};

export default PlantationReportsPage;
