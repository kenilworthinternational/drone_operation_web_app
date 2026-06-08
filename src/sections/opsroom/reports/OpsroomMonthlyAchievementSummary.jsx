import React, { useMemo, useRef, useState } from 'react';
import { Bars } from 'react-loader-spinner';
import { FiRefreshCw } from 'react-icons/fi';
import OpsroomPerfSummaryExportControls from './OpsroomPerfSummaryExportControls';
import {
  buildMonthlyTotalRow,
  createPerfSummaryPdfDoc,
  formatExportCell,
  getPdfAutoTableOptions,
  getPdfHeadRow,
} from './opsroomPerfSummaryExportUtils';
import * as XLSX from 'xlsx';
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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const monthsForYear = (year) =>
  Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);

const formatMonthChipLabel = (ym) => {
  const [, m] = ym.split('-');
  return MONTH_NAMES[parseInt(m, 10) - 1] || ym;
};

const formatMonthRangeLabel = (monthList) => {
  if (!monthList?.length) return '';
  if (monthList.length === 1) return formatMonthChipLabel(monthList[0]);
  const sorted = [...monthList].sort();
  return `${formatMonthChipLabel(sorted[0])} – ${formatMonthChipLabel(sorted[sorted.length - 1])}`;
};

const COLUMNS = [
  { key: 'month_display', label: 'Month' },
  { key: 'operational_target_ha', label: 'Operational target (Ha)' },
  { key: 'total_extent_assigned_ha', label: 'Extent assigned (Ha)' },
  { key: 'total_extent_attended_ha', label: 'Extent attended (Ha)' },
  { key: 'total_extent_completed_ops_ha', label: 'Extent completed (Ha) (ops)' },
  { key: 'total_extent_completed_pilot_ha', label: 'Extent completed (Ha) (pilot)' },
  { key: 'pct_achievement_ops', label: 'Achievement vs target (ops) %' },
  { key: 'pct_achievement_pilot', label: 'Achievement vs target (pilot) %' },
];

const OpsroomMonthlyAchievementSummary = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonths, setSelectedMonths] = useState(() => monthsForYear(currentYear));
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

  const monthOptions = useMemo(
    () =>
      monthsForYear(selectedYear).map((ym) => ({
        value: ym,
        label: formatMonthChipLabel(ym),
      })),
    [selectedYear],
  );

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
    setSelectedMonths(monthsForYear(selectedYear));
  };

  const clearAllMonths = () => {
    setSelectedMonths([]);
  };

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
    if (selectedMonths.length === 0) return;
    trigger({
      year: selectedYear,
      months: [...selectedMonths].sort(),
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

  React.useEffect(() => {
    setSelectedMonths(monthsForYear(selectedYear));
  }, [selectedYear]);

  const rows = report?.rows || [];
  const totals = report?.totals || {};
  const title = report?.year
    ? `Monthly Achievement Data — ${report.year}${report.months?.length && report.months.length < 12 ? ` (${formatMonthRangeLabel(report.months)})` : ''}`
    : 'Monthly Achievement Data';
  const totalRowLabel =
    report?.months?.length && report.months.length < 12 ? 'Total' : 'Year total';

  const formatCell = (key, value) => formatExportCell(key, value);

  const exportExcel = (exportColumns) => {
    if (!rows.length || !exportColumns.length) return;
    const header = exportColumns.map((c) => c.label);
    const body = rows.map((r) => exportColumns.map((c) => formatCell(c.key, r[c.key])));
    const totalRow = buildMonthlyTotalRow(exportColumns, totals, totalRowLabel);
    const ws = XLSX.utils.aoa_to_sheet([header, ...body, totalRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Achievement');
    XLSX.writeFile(wb, `Monthly_Achievement_${selectedYear}.xlsx`);
  };

  const exportPdf = (exportColumns) => {
    if (!rows.length || !exportColumns.length) return;
    const doc = createPerfSummaryPdfDoc();
    doc.setFontSize(12);
    doc.text(title, 14, 14);
    doc.setFontSize(8);
    doc.text(
      `Months: ${formatMonthRangeLabel(report?.months)} · Period target: ${report?.year_operational_target_ha ?? 0} Ha (${report?.year_plan_count ?? 0} plans × ${report?.ha_per_plan ?? 15} Ha) · Mission: ${missionLabel(report?.mission_type ?? missionType)}`,
      14,
      20,
    );
    autoTable(doc, {
      startY: 24,
      head: [getPdfHeadRow(exportColumns)],
      body: rows.map((r) =>
        exportColumns.map((c) => String(formatCell(c.key, r[c.key]) ?? '')),
      ),
      foot: [buildMonthlyTotalRow(exportColumns, totals, totalRowLabel).map((v) => String(v ?? ''))],
      ...getPdfAutoTableOptions(exportColumns),
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
            <div className="ops-perf-summary__field" style={{ marginBottom: 12 }}>
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
            <div className="ops-perf-summary__panel-head">
              <label>Months (select one or more)</label>
              <div className="ops-perf-summary__panel-actions">
                <button
                  type="button"
                  className="ops-perf-summary__link-btn"
                  onClick={selectAllMonths}
                  disabled={isFetching}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="ops-perf-summary__link-btn"
                  onClick={clearAllMonths}
                  disabled={isFetching || selectedMonths.length === 0}
                >
                  Clear all
                </button>
              </div>
            </div>
            <div className="ops-perf-summary__chip-panel">
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
            disabled={isFetching || selectedPlantations.length === 0 || selectedMonths.length === 0}
          >
            <FiRefreshCw /> Generate
          </button>
          <OpsroomPerfSummaryExportControls
            columns={COLUMNS}
            exportDisabled={!rows.length || isFetching}
            onExportExcel={exportExcel}
            onExportPdf={exportPdf}
          />
        </div>
      </div>

      {error && (
        <p className="ops-perf-summary__error">Failed to load report. Check API connection and try again.</p>
      )}

      {selectedPlantations.length === 0 && !loadingPlantations && (
        <p className="ops-perf-summary__error">Select at least one plantation, then click Generate.</p>
      )}

      {selectedMonths.length === 0 && (
        <p className="ops-perf-summary__error">Select at least one month for the chosen year, then click Generate.</p>
      )}

      {report && !isFetching && (
        <p className="ops-perf-summary__meta">
          Year: <strong>{report.year}</strong>.
          Months: <strong>{formatMonthRangeLabel(report.months)}</strong>.
          Mission: <strong>{missionLabel(report.mission_type ?? missionType)}</strong>.
          Period target: <strong>{report.year_operational_target_ha} Ha</strong> ({report.year_plan_count} plans × {report.ha_per_plan} Ha).
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
                      {c.key === 'month_display' ? totalRowLabel : formatCell(c.key, totals[c.key])}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ) : (
        <p className="ops-perf-summary__meta" style={{ padding: 16 }}>
          Select plantations, year, and months, then click <strong>Generate</strong> to load the report.
        </p>
      )}
    </div>
  );
};

export default OpsroomMonthlyAchievementSummary;
