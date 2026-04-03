import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Customized,
} from 'recharts';
import { Bars } from 'react-loader-spinner';
import createPilotReferenceLinesRenderer from './PilotReferenceLinesLayer';

const PILOT_MIN_HA = 7;
const PILOT_AVG_HA = 15;

function parseYmd(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatYmd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function eachDayInRange(fromStr, toStr) {
  const start = parseYmd(fromStr);
  const end = parseYmd(toStr);
  if (!start || !end || start > end) return [];
  const days = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(formatYmd(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

/**
 * Daily Planned vs Executed (Ha) for chart-breakdown — only mounted when basePath is internal dashboard.
 * Data is derived from filtered `plans` so it tracks region/estate/date filters.
 */
const BreakdownDailyPlannedVsExecutedChart = ({
  plans,
  missionType,
  dateFrom,
  dateTo,
  isLoading = false,
  isFetching = false,
}) => {
  const chartData = useMemo(() => {
    const byDay = new Map();
    for (const p of plans || []) {
      const d = p.picked_date;
      if (!d) continue;
      if (!byDay.has(d)) {
        byDay.set(d, {
          estateApprovedExtent: 0,
          executedExtent: 0,
          coveredSpraying: 0,
          coveredSpreading: 0,
          executedPlanCount: 0,
        });
      }
      const row = byDay.get(d);
      row.estateApprovedExtent += parseFloat(p.total_planned || 0);
      row.executedExtent += parseFloat(p.actual_sprayed_fields_extent || 0);
      const ts = parseFloat(p.total_sprayed || 0);
      if (missionType === 'spy') row.coveredSpraying += ts;
      else row.coveredSpreading += ts;
      if (ts > 0) row.executedPlanCount += 1;
    }

    const dayKeys = dateFrom && dateTo ? eachDayInRange(dateFrom, dateTo) : [...byDay.keys()].sort();

    return dayKeys.map((day) => {
      const agg = byDay.get(day) || {
        estateApprovedExtent: 0,
        executedExtent: 0,
        coveredSpraying: 0,
        coveredSpreading: 0,
        executedPlanCount: 0,
      };
      const approvedRemaining = Math.max(0, agg.estateApprovedExtent - agg.executedExtent);
      const pilotExtentMin = agg.executedPlanCount * PILOT_MIN_HA;
      const pilotExtentAvg = agg.executedPlanCount * PILOT_AVG_HA;
      const labelDate = parseYmd(day);
      const dayLabel = labelDate
        ? labelDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : day;
      return {
        day,
        dayLabel,
        estateApprovedExtent: round2(agg.estateApprovedExtent),
        executedExtent: round2(agg.executedExtent),
        approvedRemaining: round2(approvedRemaining),
        coveredSprayingExtent: round2(agg.coveredSpraying),
        coveredSpreadingExtent: round2(agg.coveredSpreading),
        executedPlanCount: agg.executedPlanCount,
        pilotExtentMin: round2(pilotExtentMin),
        pilotExtentAvg: round2(pilotExtentAvg),
      };
    });
  }, [plans, missionType, dateFrom, dateTo]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 5,
            padding: '10px 14px',
            fontSize: 13,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ margin: '0 0 8px', fontWeight: 700 }}>{d.dayLabel}</p>
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
            Total Covered:{' '}
            {parseFloat((d.coveredSprayingExtent || 0) + (d.coveredSpreadingExtent || 0)).toFixed(2)} Ha
          </p>
          <p style={{ margin: '4px 0', color: '#c2410c' }}>
            &nbsp;&nbsp;Covered Spraying: {parseFloat(d.coveredSprayingExtent || 0).toFixed(2)} Ha
          </p>
          <p style={{ margin: '4px 0', color: '#e8923b' }}>
            &nbsp;&nbsp;Covered Spreading: {parseFloat(d.coveredSpreadingExtent || 0).toFixed(2)} Ha
          </p>
          <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
          <p style={{ margin: '4px 0', color: '#dc2626', fontWeight: 600 }}>
            Minimum (deployed pilot×7Ha): {parseFloat(d.pilotExtentMin || 0).toFixed(2)} Ha (
            {d.executedPlanCount || 0} plans)
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
      <div className="card-class-breakdown breakdown-daily-pve-chart">
        <div className="card-header-class-breakdown">
          <h3 className="card-title-class-breakdown">Planned vs Executed (Ha) — Daily</h3>
        </div>
        <div className="card-body-class-breakdown">
          <div
            className="plantation-chart-loading plantation-chart-loading--initial plantation-chart-loading--daily"
            aria-busy="true"
          >
            <div className="plantation-chart-loading-shimmer" aria-hidden />
            <div className="plantation-chart-loading-inner">
              <Bars height="40" width="40" color="#3b82f6" />
              <span>Loading chart data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="card-class-breakdown">
        <div className="card-header-class-breakdown">
          <h3 className="card-title-class-breakdown">Planned vs Executed (Ha) — Daily</h3>
        </div>
        <div className="card-body-class-breakdown">
          <p style={{ color: '#64748b', margin: 0 }}>Set a valid date range to show the daily chart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-class-breakdown breakdown-daily-pve-chart">
      <div className="card-header-class-breakdown">
        <h3 className="card-title-class-breakdown">Planned vs Executed (Ha) — Daily</h3>
        <span className="cbd-plan-count-badge" style={{ fontWeight: 600 }}>
          Filtered plans
        </span>
      </div>
      <div className="card-body-class-breakdown" style={{ paddingTop: 8 }}>
        <div className="plantation-chart-container plantation-chart-container--loadable plantation-chart-container--daily">
          {isFetching && (
            <div className="plantation-chart-loading-overlay" aria-busy="true" aria-live="polite">
              <Bars height="36" width="36" color="#3b82f6" />
              <span>Updating chart...</span>
            </div>
          )}
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart
              data={chartData}
              margin={{ top: 12, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="dayLabel"
                stroke="#64748b"
                style={{ fontSize: 11 }}
                interval="preserveStartEnd"
                minTickGap={8}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: 11 }}
                label={{
                  value: 'Hectares (Ha)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#64748b', fontSize: 11 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={({ payload }) => (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '4px 20px',
                      justifyContent: 'center',
                      padding: '8px 0',
                      fontSize: 11,
                    }}
                  >
                    {payload &&
                      payload.map((entry, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              backgroundColor: entry.color,
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: '#555' }}>{entry.value}</span>
                        </div>
                      ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 12, height: 3, borderRadius: 1, backgroundColor: '#dc2626', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: '#555' }}>Minimum (deployed pilot×7Ha)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 12, height: 3, borderRadius: 1, backgroundColor: '#2563eb', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: '#555' }}>Average (deployed pilot×15Ha)</span>
                    </div>
                  </div>
                )}
              />
              <Bar
                dataKey="executedExtent"
                name="Executed Extent"
                fill="#15803d"
                stackId="approved"
              >
                {chartData.map((_, index) => (
                  <Cell key={`ex-${index}`} fill="#15803d" />
                ))}
              </Bar>
              <Bar
                dataKey="approvedRemaining"
                name="Estate Approved Extent"
                fill="#bbf7d0"
                stackId="approved"
              >
                {chartData.map((_, index) => (
                  <Cell key={`ap-${index}`} fill="#bbf7d0" />
                ))}
              </Bar>
              <Bar
                dataKey="coveredSprayingExtent"
                name="Covered Spraying Extent"
                fill="#c2410c"
                stackId="covered"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cs-${index}`} fill="#c2410c" />
                ))}
              </Bar>
              <Bar
                dataKey="coveredSpreadingExtent"
                name="Covered Spreading Extent"
                fill="#fdba74"
                stackId="covered"
              >
                {chartData.map((_, index) => (
                  <Cell key={`csp-${index}`} fill="#fdba74" />
                ))}
              </Bar>
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
        <p className="plantation-chart-description" style={{ margin: '10px 0 0', fontSize: 12, color: '#666' }}>
          Same metrics as the monthly chart, by plan date. Red line: minimum deployed pilot × 7 Ha; blue line:
          average deployed pilot × 15 Ha (per day with DJI-covered executed plans).
        </p>
      </div>
    </div>
  );
};

export default BreakdownDailyPlannedVsExecutedChart;
