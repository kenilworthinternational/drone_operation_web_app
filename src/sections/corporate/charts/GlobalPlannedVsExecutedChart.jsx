import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Customized,
} from 'recharts';
import { useGetGlobalTeaRevenueVsSprayedChartQuery } from '../../../api/services NodeJs/plantationDashboardApi';
import createPilotReferenceLinesRenderer from '../../plantation/plantationDashboard/components/PilotReferenceLinesLayer';
import { Bars } from 'react-loader-spinner';

const GlobalPlannedVsExecutedChart = ({ startMonth, endMonth, months, plantationId, regionId, estateId, basePath = '/home/dataViewer' }) => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetGlobalTeaRevenueVsSprayedChartQuery({
    missionType: 'spy',
    months: months || 6,
    startMonth,
    endMonth,
    plantationId: plantationId || undefined,
    regionId: regionId || undefined,
    estateId: estateId || undefined,
  });

  const PILOT_MIN_HA = 7;
  const PILOT_AVG_HA = 15;
  const chartData = (data?.data || []).map((row) => {
    const executedPlanCount = parseInt(row?.executedPlanCount, 10) || 0;
    let pilotExtentMin = executedPlanCount * PILOT_MIN_HA;
    let pilotExtentAvg = executedPlanCount * PILOT_AVG_HA;
    const rawMin = parseFloat(row?.pilotExtentMin);
    const rawAvg = parseFloat(row?.pilotExtentAvg);
    if (Number.isFinite(rawMin)) pilotExtentMin = rawMin;
    if (Number.isFinite(rawAvg)) pilotExtentAvg = rawAvg;
    return { ...row, pilotExtentMin, pilotExtentAvg };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 5, padding: '10px 14px', fontSize: 13, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700 }}>{d.monthName}</p>
          <p style={{ margin: '4px 0', color: '#15803d', fontWeight: 600 }}>
            Estate Approved Extent: {parseFloat(d.estateApprovedExtent || 0).toFixed(2)} Ha
          </p>
          <p style={{ margin: '4px 0', color: '#15803d' }}>
            &nbsp;&nbsp;↳ Executed Extent: {parseFloat(d.executedExtent || 0).toFixed(2)} Ha
          </p>
          <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: 12 }}>
            &nbsp;&nbsp;&nbsp;&nbsp;Remaining: {parseFloat(d.approvedRemaining || 0).toFixed(2)} Ha
          </p>
          <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
          <p style={{ margin: '4px 0', fontWeight: 600 }}>
            Total Covered: {parseFloat((d.coveredSprayingExtent || 0) + (d.coveredSpreadingExtent || 0)).toFixed(2)} Ha
          </p>
          <p style={{ margin: '4px 0', color: '#c2410c' }}>
            &nbsp;&nbsp;Covered Spraying: {parseFloat(d.coveredSprayingExtent || 0).toFixed(2)} Ha
          </p>
          <p style={{ margin: '4px 0', color: '#e8923b' }}>
            &nbsp;&nbsp;Covered Spreading: {parseFloat(d.coveredSpreadingExtent || 0).toFixed(2)} Ha
          </p>
          <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
          <p style={{ margin: '4px 0', color: '#dc2626', fontWeight: 600 }}>
            Minimum (deployed pilot×7Ha): {parseFloat(d.pilotExtentMin || 0).toFixed(2)} Ha ({d.executedPlanCount || 0} plans)
          </p>
          <p style={{ margin: '4px 0', color: '#2563eb', fontWeight: 600 }}>
            Average (deployed pilot×15Ha): {parseFloat(d.pilotExtentAvg || 0).toFixed(2)} Ha
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="chart-card-dataviewer-inner">
        <h3 className="chart-title-dataviewer">Planned vs Executed (Ha)</h3>
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
        <h3 className="chart-title-dataviewer">Planned vs Executed (Ha)</h3>
        <div style={{ color: '#b91c1c', padding: 20, textAlign: 'center' }}>Error loading chart data.</div>
      </div>
    );
  }

  return (
    <div className="chart-card-dataviewer-inner">
      <h3 className="chart-title-dataviewer">Planned vs Executed (Ha) — All</h3>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          onClick={(data) => {
            if (data && data.activePayload && data.activePayload.length > 0) {
              const clickedData = data.activePayload[0].payload;
              navigate(`${basePath}/chart-breakdown`, {
                state: {
                  chartType: 'tea-revenue-vs-sprayed',
                  missionType: 'spy',
                  month: clickedData.month,
                  monthName: clickedData.monthName,
                  chartData: clickedData,
                  startMonth: startMonth || null,
                  endMonth: endMonth || null,
                  plantationId: plantationId || null,
                  regionId: regionId || null,
                  estateId: estateId || null,
                  expandedMetric: 'planned'
                }
              });
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="monthName" stroke="#64748b" style={{ fontSize: '11px' }} />
          <YAxis stroke="#64748b" style={{ fontSize: '11px' }} label={{ value: 'Hectares (Ha)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 11 } }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={({ payload }) => (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', justifyContent: 'center', padding: '6px 0', fontSize: 11 }}>
                {payload && payload.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: entry.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: '#555' }}>{entry.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 12, height: 3, borderRadius: 1, backgroundColor: '#dc2626', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ color: '#555' }}>Minimum (deployed pilot×7Ha)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 12, height: 3, borderRadius: 1, backgroundColor: '#2563eb', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ color: '#555' }}>Average (deployed pilot×15Ha)</span>
                </div>
              </div>
            )}
          />
          <Bar dataKey="executedExtent" name="Executed Extent" fill="#15803d" stackId="approved" style={{ cursor: 'pointer' }} />
          <Bar dataKey="approvedRemaining" name="Estate Approved Extent" fill="#bbf7d0" stackId="approved" style={{ cursor: 'pointer' }} />
          <Bar dataKey="coveredSprayingExtent" name="Covered Spraying Extent" fill="#c2410c" stackId="covered" style={{ cursor: 'pointer' }} />
          <Bar dataKey="coveredSpreadingExtent" name="Covered Spreading Extent" fill="#fdba74" stackId="covered" style={{ cursor: 'pointer' }} />
          <Customized
            component={createPilotReferenceLinesRenderer({
              chartData,
              minKey: 'pilotExtentMin',
              maxKey: 'pilotExtentAvg',
            })}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GlobalPlannedVsExecutedChart;
