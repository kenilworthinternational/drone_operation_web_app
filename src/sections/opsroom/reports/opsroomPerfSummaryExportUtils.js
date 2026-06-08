import { jsPDF } from 'jspdf';

const PCT_KEYS = new Set(['pct_achievement_monthly', 'pct_achievement_ops', 'pct_achievement_pilot']);

export const formatExportCell = (key, value) => {
  if (PCT_KEYS.has(key)) return `${value ?? 0}%`;
  if (key === 'mission_type' && typeof value === 'string') {
    const map = { spy: 'Spray', spd: 'Spread', all: 'All' };
    return map[value] || value;
  }
  return value ?? '';
};

export const buildDailyTotalRow = (columns, totals) =>
  columns.map((c) => {
    if (c.key === 'date_display') return 'Total';
    if (c.key === 'pct_achievement_monthly') return `${totals.pct_achievement_monthly ?? 0}%`;
    if (c.key === 'active_pilots') return totals.active_pilots_max ?? '';
    if (c.key === 'active_drones') return totals.active_drones_max ?? '';
    return totals[c.key] ?? '';
  });

export const buildPilotTotalRow = (columns, totals) =>
  columns.map((c) => {
    if (c.key === 'date_display') return 'Total';
    if (c.key === 'pct_achievement_monthly') return `${totals.pct_achievement_monthly ?? 0}%`;
    if (c.key === 'pilot_name' || c.key === 'mission_type' || c.key === 'year_month') return '';
    return totals[c.key] ?? '';
  });

export const buildMonthlyTotalRow = (columns, totals) =>
  columns.map((c) => {
    if (c.key === 'month_display') return 'Year total';
    if (PCT_KEYS.has(c.key)) return `${totals[c.key] ?? 0}%`;
    return totals[c.key] ?? '';
  });

/** Relative widths by column type (not header text length). */
const PDF_COLUMN_WEIGHTS = {
  pilot_name: 1.7,
  mission_type: 0.9,
  year_month: 1,
  month_display: 1,
  date_display: 0.95,
  daily_operational_target_ha: 1.05,
  operational_target_ha: 1.05,
  total_extent_assigned_ha: 1.05,
  total_extent_attended_ha: 1.05,
  total_extent_completed_ops_ha: 1.05,
  total_extent_completed_pilot_ha: 1.05,
  pct_achievement_monthly: 0.9,
  pct_achievement_ops: 0.95,
  pct_achievement_pilot: 0.95,
  active_pilots: 0.85,
  active_drones: 0.85,
};

/** Use the same column labels as the on-screen table. */
export const getPdfHeadRow = (exportColumns) => exportColumns.map((c) => c.label);

/** A4 landscape — matches standard print page size for wide tables. */
export const createPerfSummaryPdfDoc = () =>
  new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

const PDF_A4_LANDSCAPE_WIDTH_MM = 297;
const PDF_MAX_FONT_BOOST = 4;

/** Fewer selected columns → slightly larger fonts (up to +4px). */
const getPdfFontSizes = (columnCount, baseBody = 7, baseHead = 6) => {
  const boost = Math.min(PDF_MAX_FONT_BOOST, Math.max(0, 9 - columnCount));
  return {
    body: baseBody + boost,
    head: baseHead + boost,
  };
};

export const getPdfAutoTableOptions = (exportColumns, extra = {}) => {
  const marginLeft = extra.margin?.left ?? 14;
  const marginRight = extra.margin?.right ?? 14;
  const tableWidth = PDF_A4_LANDSCAPE_WIDTH_MM - marginLeft - marginRight;
  const weights = exportColumns.map((c) => PDF_COLUMN_WEIGHTS[c.key] ?? 1.05);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const columnStyles = {};
  const baseBodyFont = extra.styles?.fontSize ?? 7;
  const baseHeadFont = extra.headStyles?.fontSize ?? 6;
  const { body: bodyFontSize, head: headFontSize } = getPdfFontSizes(
    exportColumns.length,
    baseBodyFont,
    baseHeadFont,
  );

  exportColumns.forEach((col, idx) => {
    columnStyles[idx] = {
      cellWidth: (weights[idx] / totalWeight) * tableWidth,
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
    };
  });

  const base = {
    tableWidth,
    columnStyles,
    styles: {
      fontSize: bodyFontSize,
      overflow: 'linebreak',
      cellPadding: 1.5,
      valign: 'middle',
      halign: 'center',
    },
    headStyles: {
      fillColor: [0, 75, 113],
      textColor: 255,
      fontSize: headFontSize,
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2,
    },
    bodyStyles: {
      valign: 'middle',
      halign: 'center',
    },
    footStyles: {
      fillColor: [219, 234, 254],
      textColor: 20,
      fontStyle: 'bold',
      valign: 'middle',
      halign: 'center',
    },
    margin: { left: marginLeft, right: marginRight },
  };

  return {
    ...extra,
    ...base,
    columnStyles,
    tableWidth,
    styles: { ...extra.styles, ...base.styles },
    headStyles: { ...extra.headStyles, ...base.headStyles },
    bodyStyles: { ...extra.bodyStyles, ...base.bodyStyles },
    footStyles: { ...extra.footStyles, ...base.footStyles },
    margin: { ...extra.margin, ...base.margin },
  };
};
