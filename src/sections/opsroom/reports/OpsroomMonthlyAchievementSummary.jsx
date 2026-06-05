import React, { useMemo, useRef, useState } from 'react';
import { Bars } from 'react-loader-spinner';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLazyGetOpsroomMonthlyAchievementSummaryQuery } from '../../../api/services NodeJs/opsroomPerformanceSummaryApi';
import { useGetReportPlantationsQuery } from '../../../api/services NodeJs/monthlyPlantationReportApi';
import '../../../styles/opsroomPerformanceSummary.css';

const MISSION_OPTIONS = [
  { value: 'spy', label: 'Spray' },
  { value: 'spd', label: 'Spread' },
  { value: 'all', label: 'All' },
];

const missionLabel = (code) => MISSION_OPTIONS.find((o) => o.value === code)?.label ?? 'Spray';

const COLUMNS = [
  { key: 'month_display', label: 'Month' },
  { key: 'operational_target_ha', label: 'Operational target (Ha)' },
  { key: 'total_extent_assigned_ha', label: 'Extent assigned (Ha)' },
  { key: 'total_extent_attended_ha', label: 'Extent attended (Ha)' },
  { key: 'total_extent_completed_ops_ha', label: 'Extent completed (Ha) (ops)' },
  { key: 'total_extent_completed_pilot_ha', label: 'Extent completed (Ha) (pilot)' },
  { key: 'pct_achievement_ops', label: 'Achievement against monthly target (ops) %' },
  { key: 'pct_achievement_pilot', label: 'Achievement against monthly target (pilot) %' },
];

const PCT_KEYS = new Set(['pct_achievement_ops', 'pct_achievement_pilot']);

const OpsroomMonthlyAchievementSummary = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedPlantations, setSelectedPlantations] = useState([]);
  const [missionType, setMissionType] = useState('all');
  const { data: plantations = [], isLoading: loadingPlantations } = useGetReportPlantationsQuery();
  const [trigger, { data: report, isFetching, error }] = useLazyGetOpsroomMonthlyAchievementSummaryQuery();

  const yearOptions = useMemo(() => {
    const opts = [];
    for (let y = currentYear; y >= currentYear - 10; y -= 1) {
      opts.push({ value: y, label: String(y) });
    }
    return opts;
  }, [currentYear]);

  const togglePlantation = (id) => {
    setSelectedPlantations((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((p) => p !== id);
        return next.length > 0 ? next : prev;
      }
      return [...prev, id];
    });
  };

  const selectAllPlantations = () => {
    setSelectedPlantations(plantations.map((p) => p.id));
  };

  const clearAllPlantations = () => {
    setSelectedPlantations([]);
  };

  const plantationsInitialized = useRef(false);

  const loadReport = () => {
    trigger({
      year: selectedYear,
      missionType,
      completedPlansOnly: false,
      plantationIds: selectedPlantations.length > 0 ? selectedPlantations : undefined,
    });
  };

  React.useEffect(() => {
    if (plantations.length > 0 && !plantationsInitialized.current) {
      setSelectedPlantations(plantations.map((p) => p.id));
      plantationsInitialized.current = true;
    }
  }, [plantations]);

  const rows = report?.rows || [];
  const totals = report?.totals || {};
  const title = report?.year ? `Monthly Achievement Data — ${report.year}` : 'Monthly Achievement Data';

  const formatCell = (key, value) => (PCT_KEYS.has(key) ? `${value}%` : value);

  const exportExcel = () => {
    if (!rows.length) return;
    const header = COLUMNS.map((c) => c.label);
    const body = rows.map((r) => COLUMNS.map((c) => formatCell(c.key, r[c.key])));
    const totalRow = COLUMNS.map((c) => {
      if (c.key === 'month_display') return 'Year total';
      return formatCell(c.key, totals[c.key] ?? '');
    });
    const ws = XLSX.utils.aoa_to_sheet([header, ...body, totalRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Achievement');
    XLSX.writeFile(wb, `Monthly_Achievement_${selectedYear}.xlsx`);
  };

  const exportPdf = () => {
    if (!rows.length) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(12);
    doc.text(title, 14, 14);
    doc.setFontSize(8);
    doc.text(
      `Year target: ${report?.year_operational_target_ha ?? 0} Ha (${report?.year_plan_count ?? 0} plans × ${report?.ha_per_plan ?? 15} Ha) · Mission: ${missionLabel(report?.mission_type ?? missionType)}`,
      14,
      20,
    );
    autoTable(doc, {
      startY: 24,
      head: [COLUMNS.map((c) => c.label)],
      body: rows.map((r) => COLUMNS.map((c) => String(formatCell(c.key, r[c.key]) ?? ''))),
      foot: [COLUMNS.map((c) => {
        if (c.key === 'month_display') return 'Year total';
        return String(formatCell(c.key, totals[c.key] ?? ''));
      })],
      styles: { fontSize: 7 },
      headStyles: { fillColor: [0, 75, 113] },
    });
    doc.save(`Monthly_Achievement_${selectedYear}.pdf`);
  };

  return (
    <div className="ops-perf-summary">
      <div className="ops-perf-summary__toolbar">
        <div className="ops-perf-summary__filters-row">
          <div className="ops-perf-summary__panel ops-perf-summary__panel--left">
            <div className="ops-perf-summary__panel-head">
              <label>Plantations (select one or more)</label>
              <div className="ops-perf-summary__panel-actions">
                <button
                  type="button"
                  className="ops-perf-summary__link-btn"
                  onClick={selectAllPlantations}
                  disabled={loadingPlantations || plantations.length === 0}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="ops-perf-summary__link-btn"
                  onClick={clearAllPlantations}
                  disabled={loadingPlantations || selectedPlantations.length === 0}
                >
                  Clear all
                </button>
              </div>
            </div>
            <div className="ops-perf-summary__chip-panel">
              {loadingPlantations ? (
                <span className="ops-perf-summary__hint-inline">Loading plantations…</span>
              ) : (
                plantations.map((pl) => {
                  const on = selectedPlantations.includes(pl.id);
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      className={`ops-perf-summary__chip${on ? ' ops-perf-summary__chip--on' : ''}`}
                      onClick={() => togglePlantation(pl.id)}
                      disabled={isFetching}
                    >
                      {pl.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="ops-perf-summary__panel ops-perf-summary__panel--right">
            <div className="ops-perf-summary__panel-head">
              <label htmlFor="ops-monthly-year">Year</label>
            </div>
            <div className="ops-perf-summary__actions-row" style={{ marginTop: 8 }}>
              <div className="ops-perf-summary__field">
                <select
                  id="ops-monthly-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  disabled={isFetching}
                >
                  {yearOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="ops-perf-summary__actions-row">
          <div className="ops-perf-summary__field">
            <label htmlFor="ops-monthly-mission">Mission</label>
            <select
              id="ops-monthly-mission"
              value={missionType}
              onChange={(e) => setMissionType(e.target.value)}
              disabled={isFetching}
            >
              {MISSION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="ops-perf-summary__btn ops-perf-summary__btn--primary"
            onClick={loadReport}
            disabled={isFetching || selectedPlantations.length === 0}
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
      </div>

      {error && (
        <p className="ops-perf-summary__error">Failed to load report. Check API connection and try again.</p>
      )}

      {selectedPlantations.length === 0 && !loadingPlantations && (
        <p className="ops-perf-summary__error">Select at least one plantation, then click Generate.</p>
      )}

      {report && !isFetching && (
        <p className="ops-perf-summary__meta">
          Year: <strong>{report.year}</strong>.
          Mission: <strong>{missionLabel(report.mission_type ?? missionType)}</strong>.
          Year target: <strong>{report.year_operational_target_ha} Ha</strong> ({report.year_plan_count} plans × {report.ha_per_plan} Ha).
          Assigned = pilot-assigned field Ha; Attended = field Ha when DJI started; Completed (ops) = DJI field area;
          Completed (pilot) = pilot sub-task field area.
        </p>
      )}

      {isFetching ? (
        <div className="ops-perf-summary__loading">
          <Bars height="48" width="48" color="#004B71" visible />
          <span>Loading…</span>
        </div>
      ) : report ? (
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
                <tr key={row.year_month}>
                  {COLUMNS.map((c) => (
                    <td key={c.key}>{formatCell(c.key, row[c.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr>
                  {COLUMNS.map((c) => (
                    <td key={c.key}>
                      {c.key === 'month_display' ? 'Year total' : formatCell(c.key, totals[c.key])}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ) : (
        <p className="ops-perf-summary__meta" style={{ padding: 16 }}>
          Select plantations and year, then click <strong>Generate</strong> to load the report.
        </p>
      )}
    </div>
  );
};

export default OpsroomMonthlyAchievementSummary;
