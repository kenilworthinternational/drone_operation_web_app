import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const DEPT_COLORS = [
  '#004b71', '#2563eb', '#0d9488', '#7c3aed', '#0891b2',
  '#059669', '#6366f1', '#0284c7', '#64748b', '#475569',
];

function shortLabel(name, code, max = 14) {
  const text = code || name || '—';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function ChartCard({ title, hint, children, empty, emptyText }) {
  return (
    <div className="org-viz-card">
      <div className="org-viz-card-head">
        <h4 className="org-viz-card-title">{title}</h4>
        {hint ? <span className="org-viz-card-hint">{hint}</span> : null}
      </div>
      {empty ? (
        <p className="org-viz-empty">{emptyText}</p>
      ) : (
        children
      )}
    </div>
  );
}

function HeadcountTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="org-viz-tooltip">
      <strong>{row?.fullName || row?.name}</strong>
      <span>{row?.count ?? 0} employee{(row?.count ?? 0) === 1 ? '' : 's'}</span>
    </div>
  );
}

function VacancyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="org-viz-tooltip">
      <strong>{row?.fullLabel || label}</strong>
      <span>Current: {row?.currentCount ?? 0}</span>
      <span>Max: {row?.maxLimit ?? 0}</span>
      <span>Open: {row?.vacancies ?? 0}</span>
    </div>
  );
}

export function HeadcountReportViz({ rows = [] }) {
  const chartRows = useMemo(
    () => rows.map((d) => ({
      code: d.departmentCode || '—',
      name: shortLabel(d.departmentName, d.departmentCode),
      fullName: d.departmentName || d.departmentCode || '—',
      count: Number(d.headcount || 0),
    })),
    [rows],
  );

  const pieRows = useMemo(
    () => chartRows.filter((r) => r.count > 0),
    [chartRows],
  );

  const total = useMemo(
    () => chartRows.reduce((s, r) => s + r.count, 0),
    [chartRows],
  );

  return (
    <div className="org-viz-grid">
      <ChartCard
        title="Employees by department"
        hint={`${total} total`}
        empty={chartRows.length === 0}
        emptyText="No department data."
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartRows} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-28} textAnchor="end" height={56} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} width={36} />
            <Tooltip content={<HeadcountTooltip />} cursor={{ fill: 'rgba(0, 75, 113, 0.06)' }} />
            <Bar dataKey="count" name="Headcount" fill="#004b71" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Headcount distribution"
        hint={pieRows.length ? `${pieRows.length} dept${pieRows.length === 1 ? '' : 's'} with staff` : 'No staff assigned'}
        empty={pieRows.length === 0}
        emptyText="No employees assigned to departments yet."
      >
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieRows}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
            >
              {pieRows.map((entry, i) => (
                <Cell key={entry.code} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<HeadcountTooltip />} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              formatter={(value, entry) => (
                <span className="org-viz-legend-text">{entry?.payload?.name || value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

export function VacancyReportViz({ rows = [] }) {
  const roleRows = useMemo(
    () => rows
      .map((v) => ({
        name: shortLabel(v.jobRole, v.jrCode, 12),
        fullLabel: `${v.departmentName || '—'} · ${v.jobRole || '—'}`,
        currentCount: Number(v.currentCount || 0),
        maxLimit: Number(v.maxLimit || 0),
        vacancies: Number(v.vacancies || 0),
        deptCode: v.departmentCode || '',
      }))
      .sort((a, b) => b.vacancies - a.vacancies)
      .slice(0, 12),
    [rows],
  );

  const deptRows = useMemo(() => {
    const map = new Map();
    rows.forEach((v) => {
      const key = v.departmentCode || v.departmentName || 'other';
      const label = shortLabel(v.departmentName, v.departmentCode);
      if (!map.has(key)) {
        map.set(key, { name: label, fullName: v.departmentName, open: 0, filled: 0 });
      }
      const row = map.get(key);
      row.open += Number(v.vacancies || 0);
      row.filled += Number(v.currentCount || 0);
    });
    return Array.from(map.values()).sort((a, b) => b.open - a.open);
  }, [rows]);

  const totalOpen = useMemo(
    () => rows.reduce((s, r) => s + Number(r.vacancies || 0), 0),
    [rows],
  );

  return (
    <div className="org-viz-grid">
      <ChartCard
        title="Open vacancies by role"
        hint={`${totalOpen} open slot${totalOpen === 1 ? '' : 's'}`}
        empty={roleRows.length === 0}
        emptyText="No open vacancies (or max limits not configured)."
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={roleRows} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-32} textAnchor="end" height={64} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} width={32} />
            <Tooltip content={<VacancyTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="currentCount" name="Current" stackId="a" fill="#004b71" maxBarSize={40} />
            <Bar dataKey="vacancies" name="Open" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Vacancies by department"
        hint="Open slots per wing"
        empty={deptRows.length === 0}
        emptyText="No vacancy data by department."
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={deptRows} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(value, name) => [value, name === 'open' ? 'Open vacancies' : 'Current staff']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="filled" name="Current staff" fill="#94a3b8" radius={[0, 0, 0, 0]} maxBarSize={22} />
            <Bar dataKey="open" name="Open vacancies" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
