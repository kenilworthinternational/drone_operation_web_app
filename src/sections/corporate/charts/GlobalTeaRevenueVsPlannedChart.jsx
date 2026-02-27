import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useGetGlobalPlannedVsTeaRevenueChartQuery } from '../../../api/services NodeJs/plantationDashboardApi';
import { Bars } from 'react-loader-spinner';

const GlobalTeaRevenueVsPlannedChart = ({ startMonth, endMonth, months, plantationId, regionId, estateId }) => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetGlobalPlannedVsTeaRevenueChartQuery({
    missionType: 'spy',
    months: months || 6,
    startMonth,
    endMonth,
    plantationId: plantationId || undefined,
    regionId: regionId || undefined,
    estateId: estateId || undefined,
  });

  const chartData = data?.data || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 5, padding: '10px 14px', fontSize: 13 }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700 }}>{d.monthName}</p>
          {payload.map((entry, i) => {
            let extra = '';
            if (entry.dataKey === 'plannedSprayingExtent' && d.sprayPlanCount != null) {
              extra = ` (${d.sprayPlanCount} plans × 15 Ha)`;
            } else if (entry.dataKey === 'plannedSpreadingExtent' && d.spreadPlanCount != null) {
              extra = ` (${d.spreadPlanCount} plans × 15 Ha)`;
            }
            return (
              <p key={i} style={{ margin: '3px 0', color: entry.color }}>
                {entry.name}: {parseFloat(entry.value).toFixed(2)} Ha{extra}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="chart-card-dataviewer-inner">
        <h3 className="chart-title-dataviewer">Tea Revenue Extent vs Planned (Ha)</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, gap: 10 }}>
          <Bars height="40" width="40" color="#3b82f6" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card-dataviewer-inner">
        <h3 className="chart-title-dataviewer">Tea Revenue Extent vs Planned (Ha)</h3>
        <div style={{ color: '#b91c1c', padding: 20, textAlign: 'center' }}>Error loading chart data.</div>
      </div>
    );
  }

  return (
    <div className="chart-card-dataviewer-inner">
      <h3 className="chart-title-dataviewer">Tea Revenue Extent vs Planned (Ha) — All</h3>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          onClick={(data) => {
            if (data && data.activePayload && data.activePayload.length > 0) {
              const clickedData = data.activePayload[0].payload;
              const clickedMetric = data.activePayload[0].dataKey;
              navigate('/home/dataViewer/chart-breakdown', {
                state: {
                  chartType: 'planned-vs-tea-revenue',
                  missionType: 'spy',
                  month: clickedData.month,
                  monthName: clickedData.monthName,
                  chartData: clickedData,
                  startMonth: startMonth || null,
                  endMonth: endMonth || null,
                  plantationId: plantationId || null,
                  regionId: regionId || null,
                  estateId: estateId || null,
                  expandedMetric: clickedMetric === 'teaRevenueExtent' ? 'teaRevenue' :
                                  clickedMetric === 'plannedExtent' ? 'planned' : null
                }
              });
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="monthName" stroke="#64748b" style={{ fontSize: '11px' }} />
          <YAxis stroke="#64748b" style={{ fontSize: '11px' }} label={{ value: 'Hectares (Ha)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 11 } }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="teaRevenueExtent" name="Tea Revenue Extent" fill="#3b82f6" style={{ cursor: 'pointer' }} />
          <Bar dataKey="plannedSprayingExtent" name="Planned Spraying Extent" fill="#8b5cf6" style={{ cursor: 'pointer' }} />
          <Bar dataKey="plannedSpreadingExtent" name="Planned Spreading Extent" fill="#06b6d4" style={{ cursor: 'pointer' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GlobalTeaRevenueVsPlannedChart;
