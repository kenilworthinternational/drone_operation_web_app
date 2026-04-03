import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import PlannedVsTeaRevenueChart from '../components/PlannedVsTeaRevenueChart';
import PlannedVsSprayedChart from '../components/PlannedVsSprayedChart';
import MonthRangePicker from '../components/MonthRangePicker';
import '../../../../styles/plantationDashboard.css';

const PlantationChartsPage = ({ basePath = '/home/plantation-dashboard' } = {}) => {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState('Spray');
  const [chartMonthRange, setChartMonthRange] = useState(() => {
    const today = new Date();
    const startMonth = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    return {
      start: startMonth,
      end: today
    };
  });

  const missionType = selectedAction === 'Spray' ? 'spy' : 'spd';

  const chartMonths = useMemo(() => {
    const start = chartMonthRange.start;
    const end = chartMonthRange.end;
    const months = [];
    const current = new Date(start);
    while (current <= end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months.length;
  }, [chartMonthRange]);

  return (
    <div className="plantation-dashboard-container">
      <div className="plantation-page-header">
        <button className="plantation-back-btn" onClick={() => navigate(basePath)}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="plantation-page-title">Charts</h1>
      </div>

      <div className="plantation-page-content">
        {/* Combined Spray/Spread and Month Range Selector */}
        <div className="plantation-charts-controls-section">
          <div className="plantation-charts-controls-row">
            <div className="plantation-charts-control-group">
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
            
            <div className="plantation-charts-control-group">
              <span className="plantation-charts-control-label">Month Range:</span>
              <MonthRangePicker
                startMonth={chartMonthRange.start}
                endMonth={chartMonthRange.end}
                onChange={setChartMonthRange}
                maxMonths={6}
              />
            </div>
          </div>
        </div>
        
        <div className="plantation-charts-section">
          <PlannedVsTeaRevenueChart 
            missionType={missionType} 
            months={chartMonths}
            startMonth={`${chartMonthRange.start.getFullYear()}-${String(chartMonthRange.start.getMonth() + 1).padStart(2, '0')}`}
            endMonth={`${chartMonthRange.end.getFullYear()}-${String(chartMonthRange.end.getMonth() + 1).padStart(2, '0')}`}
            basePath={basePath}
          />
          <PlannedVsSprayedChart 
            missionType={missionType} 
            months={chartMonths}
            startMonth={`${chartMonthRange.start.getFullYear()}-${String(chartMonthRange.start.getMonth() + 1).padStart(2, '0')}`}
            endMonth={`${chartMonthRange.end.getFullYear()}-${String(chartMonthRange.end.getMonth() + 1).padStart(2, '0')}`}
            basePath={basePath}
          />
        </div>
      </div>
    </div>
  );
};

export default PlantationChartsPage;
