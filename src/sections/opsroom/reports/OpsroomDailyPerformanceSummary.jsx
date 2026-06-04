import React, { useMemo, useState } from 'react';
import { Bars } from 'react-loader-spinner';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLazyGetOpsroomDailyPerformanceSummaryQuery } from '../../../api/services NodeJs/opsroomPerformanceSummaryApi';
import '../../../styles/opsroomPerformanceSummary.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatMonthLabel = (ym) => {
  const [y, m] = ym.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
};

const getCurrentYearMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const COLUMNS = [
  { key: 'date_display', label: 'Date' },
  { key: 'daily_operational_target_ha', label: 'Daily operational target (Ha)' },
  { key: 'total_extent_assigned_ha', label: 'Total extent assigned (Ha)' },
  { key: 'total_extent_attended_ha', label: 'Total extent attended (Ha)' },
  { key: 'total_extent_completed_ha', label: 'Total extent completed (Ha)' },
  { key: 'pct_achievement_monthly', label: 'Percentage achievement against monthly target %' },
  { key: 'active_pilots', label: 'Number of active pilots' },
  { key: 'active_drones', label: 'Number of active drones' },
];

const OpsroomDailyPerformanceSummary = () => {
  const [selectedMonths, setSelectedMonths] = useState([getCurrentYearMonth()]);
  const [missionType, setMissionType] = useState('spy');
  const [trigger, { data: report, isFetching, error }] = useLazyGetOpsroomDailyPerformanceSummaryQuery();

  const monthOptions = useMemo(() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      opts.push({ value: ym, label: formatMonthLabel(ym) });
    }
    return opts;
  }, []);

  const toggleMonth = (ym) => {
    setSelectedMonths((prev) => {
      if (prev.includes(ym)) {
        const next = prev.filter((m) => m !== ym);
        return next.length > 0 ? next : prev;
      }
      return [...prev, ym].sort();
    });
  };

  const selectAllMonths = () => {
    if (selectedMonths.length === monthOptions.length) {
      setSelectedMonths([getCurrentYearMonth()]);
    } else {
      setSelectedMonths(monthOptions.map((o) => o.value).sort());
    }
  };

  const loadReport = () => {
    if (selectedMonths.length === 0) return;
    trigger({ months: [...selectedMonths].sort(), missionType, completedPlansOnly: false });
  };

  React.useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = report?.rows || [];
  const totals = report?.totals || {};
  const sortedSelected = [...selectedMonths].sort();

  const title = useMemo(() => {
    if (report?.months?.length) {
      const labels = report.months.map(formatMonthLabel);
      if (labels.length === 1) return `Performance Summary of ${labels[0]}`;
      return `Performance Summary of ${labels[0]} – ${labels[labels.length - 1]}`;
    }
    return 'Performance Summary';
  }, [report]);

  const exportFileSuffix = sortedSelected.join('_') || 'report';

  const exportExcel = () => {
    if (!rows.length) return;
    const header = COLUMNS.map((c) => c.label);
    const body = rows.map((r) =>
      COLUMNS.map((c) => {
        const v = r[c.key];
        if (c.key === 'pct_achievement_monthly') return `${v}%`;
        return v;
      }),
    );
    const totalRow = COLUMNS.map((c) => {
      if (c.key === 'date_display') return 'Total';
      if (c.key === 'pct_achievement_monthly') return `${totals.pct_achievement_monthly ?? 0}%`;
      if (c.key === 'active_pilots') return totals.active_pilots_max ?? '';
      if (c.key === 'active_drones') return totals.active_drones_max ?? '';
      return totals[c.key] ?? '';
    });
    const ws = XLSX.utils.aoa_to_sheet([header, ...body, totalRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Performance Summary');
    XLSX.writeFile(wb, `Performance_Summary_${exportFileSuffix}.xlsx`);
  };

  const exportPdf = () => {
    if (!rows.length) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(12);
    doc.text(title, 14, 14);
    doc.setFontSize(8);
    doc.text(
      `Combined monthly target: ${report?.monthly_target_ha ?? 0} Ha (${report?.month_plan_count ?? 0} plans × ${report?.ha_per_plan ?? 15} Ha) · Mission: ${missionType === 'spy' ? 'Spray' : 'Spread'}`,
      14,
      20,
    );
    autoTable(doc, {
      startY: 24,
      head: [COLUMNS.map((c) => c.label)],
      body: rows.map((r) =>
        COLUMNS.map((c) => {
          const v = r[c.key];
          if (c.key === 'pct_achievement_monthly') return `${v}%`;
          return String(v ?? '');
        }),
      ),
      foot: [
        COLUMNS.map((c) => {
          if (c.key === 'date_display') return 'Total';
          if (c.key === 'pct_achievement_monthly') return `${totals.pct_achievement_monthly ?? 0}%`;
          if (c.key === 'active_pilots') return String(totals.active_pilots_max ?? '');
          if (c.key === 'active_drones') return String(totals.active_drones_max ?? '');
          return String(totals[c.key] ?? '');
        }),
      ],
      styles: { fontSize: 7 },
      headStyles: { fillColor: [0, 75, 113] },
    });
    doc.save(`Performance_Summary_${exportFileSuffix}.pdf`);
  };

  return (
    <div className="ops-perf-summary">
      <div className="ops-perf-summary__toolbar">
        <div className="ops-perf-summary__field ops-perf-summary__field--months">
          <div className="ops-perf-summary__months-head">
            <label>Months (select one or more)</label>
            <button type="button" className="ops-perf-summary__link-btn" onClick={selectAllMonths}>
              {selectedMonths.length === monthOptions.length ? 'Clear to current' : 'Select all'}
            </button>
          </div>
          <div className="ops-perf-summary__month-chips">
            {monthOptions.map((o) => {
              const on = selectedMonths.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  className={`ops-perf-summary__chip${on ? ' ops-perf-summary__chip--on' : ''}`}
                  onClick={() => toggleMonth(o.value)}
                  disabled={isFetching}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="ops-perf-summary__field">
          <label htmlFor="ops-perf-mission">Mission</label>
          <select
            id="ops-perf-mission"
            value={missionType}
            onChange={(e) => setMissionType(e.target.value)}
            disabled={isFetching}
          >
            <option value="spy">Spray</option>
            <option value="spd">Spread</option>
          </select>
        </div>
        <button
          type="button"
          className="ops-perf-summary__btn ops-perf-summary__btn--primary"
          onClick={loadReport}
          disabled={isFetching || selectedMonths.length === 0}
        >
          <FiRefreshCw /> Generate
        </button>
        <button type="button" className="ops-perf-summary__btn" onClick={exportExcel} disabled={!rows.length || isFetching}>
          <FiDownload /> Excel
        </button>
        <button type="button" className="ops-perf-summary__btn" onClick={exportPdf} disabled={!rows.length || isFetching}>
          <FiDownload /> PDF
        </button>
      </div>

      {error && (
        <p className="ops-perf-summary__error">Failed to load report. Check API connection and try again.</p>
      )}

      {report && (
        <p className="ops-perf-summary__meta">
          Selected: <strong>{report.months?.map(formatMonthLabel).join(', ')}</strong>.
          Combined target: <strong>{report.monthly_target_ha} Ha</strong> ({report.month_plan_count} plans × {report.ha_per_plan} Ha).
          % achievement resets within each calendar month (cumulative day-by-day).
        </p>
      )}

      {isFetching ? (
        <div className="ops-perf-summary__loading">
          <Bars height="48" width="48" color="#004B71" visible />
          <span>Loading…</span>
        </div>
      ) : (
        <div className="ops-perf-summary__table-wrap">
          <h2 className="ops-perf-summary__title">{title}</h2>
          <table className="ops-perf-summary__table">
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.year_month}-${row.date}`}>
                  {COLUMNS.map((c) => (
                    <td key={c.key}>
                      {c.key === 'pct_achievement_monthly' ? `${row[c.key]}%` : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{totals.daily_operational_target_ha}</td>
                  <td>{totals.total_extent_assigned_ha}</td>
                  <td>{totals.total_extent_attended_ha}</td>
                  <td>{totals.total_extent_completed_ha}</td>
                  <td>{totals.pct_achievement_monthly}%</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};

export default OpsroomDailyPerformanceSummary;
