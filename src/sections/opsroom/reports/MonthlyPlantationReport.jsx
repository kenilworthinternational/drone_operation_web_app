import React, { useState, useMemo } from 'react';
import { Bars } from 'react-loader-spinner';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  useGetReportPlantationsQuery,
  useLazyGetMonthlyPlantationReportQuery,
} from '../../../api/services NodeJs/monthlyPlantationReportApi';
import '../../../styles/monthlyPlantationReport.css';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatMonth = (ym) => {
  const [y, m] = ym.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
};

const MonthlyPlantationReport = () => {
  const { data: plantations = [], isLoading: loadingPlantations } = useGetReportPlantationsQuery();
  const [triggerReport, { data: reportData, isFetching: loadingReport }] = useLazyGetMonthlyPlantationReportQuery();

  const [selectedPlantations, setSelectedPlantations] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);

  // Generate last 12 months for the month picker
  const monthOptions = useMemo(() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      opts.push({ value: ym, label: formatMonth(ym) });
    }
    return opts;
  }, []);

  const togglePlantation = (id) => {
    setSelectedPlantations((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleMonth = (ym) => {
    setSelectedMonths((prev) =>
      prev.includes(ym) ? prev.filter((m) => m !== ym) : [...prev, ym]
    );
  };

  const selectAllPlantations = () => {
    if (selectedPlantations.length === plantations.length) {
      setSelectedPlantations([]);
    } else {
      setSelectedPlantations(plantations.map((p) => p.id));
    }
  };

  const handleGenerate = () => {
    if (selectedPlantations.length === 0 || selectedMonths.length === 0) return;
    triggerReport({ plantationIds: selectedPlantations, months: selectedMonths, missionType: 'spy' });
  };

  const sortedMonths = useMemo(() => {
    return reportData?.months || [...selectedMonths].sort();
  }, [reportData, selectedMonths]);

  // Compute totals
  const totals = useMemo(() => {
    if (!reportData?.plantations) return {};
    const t = {};
    sortedMonths.forEach((m) => {
      t[m] = { planned: 0, assigned: 0, covered: 0 };
    });
    reportData.plantations.forEach((pl) =>
      pl.regions.forEach((rg) =>
        rg.estates.forEach((est) =>
          sortedMonths.forEach((m) => {
            const md = est.months[m] || { planned: 0, assigned: 0, covered: 0 };
            t[m].planned += md.planned;
            t[m].assigned += md.assigned;
            t[m].covered += md.covered;
          })
        )
      )
    );
    return t;
  }, [reportData, sortedMonths]);

  // ─── Excel Download (matching the screenshot layout exactly) ───
  const downloadExcel = () => {
    if (!reportData?.plantations) return;

    const colCount = 3 + sortedMonths.length * 3; // Plantation, Region, Estate + 3 per month

    // ── Row 1: Month header row (merged across 3 cols each) ──
    const row1 = ['PLANTATION', 'REGION', 'ESTATE'];
    sortedMonths.forEach((m) => {
      row1.push(formatMonth(m).toUpperCase(), '', '');
    });

    // ── Row 2: Sub-headers ──
    const row2 = ['', '', ''];
    sortedMonths.forEach(() => {
      row2.push('PLANNED', 'ASSIGNED', 'COVERED');
    });

    // ── Data rows ──
    // Build flat list with plantation/region info for merging
    const dataRows = [];
    const mergeRanges = [];
    let currentRow = 2; // 0-indexed: row1=0, row2=1, data starts at 2

    // Month header merges (row 0)
    sortedMonths.forEach((_, i) => {
      const startCol = 3 + i * 3;
      mergeRanges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 2 } });
    });
    // Merge row 0 "PLANTATION" with row 1 (spans 2 rows)
    mergeRanges.push({ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }); // PLANTATION
    mergeRanges.push({ s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }); // REGION
    mergeRanges.push({ s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }); // ESTATE

    reportData.plantations.forEach((pl) => {
      const plStartRow = currentRow;
      const plTotalEstates = pl.regions.reduce((s, r) => s + r.estates.length, 0);

      pl.regions.forEach((rg) => {
        const rgStartRow = currentRow;

        rg.estates.forEach((est) => {
          const row = [pl.plantation_name, rg.region_name, est.estate_name];
          sortedMonths.forEach((m) => {
            const md = est.months[m] || { planned: 0, assigned: 0, covered: 0 };
            row.push(md.planned, md.assigned, md.covered);
          });
          dataRows.push(row);
          currentRow++;
        });

        // Merge region cells
        if (rg.estates.length > 1) {
          mergeRanges.push({ s: { r: rgStartRow, c: 1 }, e: { r: rgStartRow + rg.estates.length - 1, c: 1 } });
        }
      });

      // Merge plantation cells
      if (plTotalEstates > 1) {
        mergeRanges.push({ s: { r: plStartRow, c: 0 }, e: { r: plStartRow + plTotalEstates - 1, c: 0 } });
      }
    });

    // ── Total row ──
    const totalRowData = ['', 'Total', ''];
    sortedMonths.forEach((m) => {
      totalRowData.push(
        parseFloat((totals[m]?.planned || 0).toFixed(2)),
        parseFloat((totals[m]?.assigned || 0).toFixed(2)),
        parseFloat((totals[m]?.covered || 0).toFixed(2))
      );
    });
    dataRows.push(totalRowData);

    // ── Build worksheet from array of arrays ──
    const aoa = [row1, row2, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges'] = mergeRanges;

    // Column widths
    const colWidths = [{ wch: 25 }, { wch: 20 }, { wch: 20 }];
    sortedMonths.forEach(() => {
      colWidths.push({ wch: 12 }, { wch: 12 }, { wch: 12 });
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');
    XLSX.writeFile(wb, `Monthly_Plantation_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ─── PDF Download (matching screenshot layout) ───
  const downloadPDF = () => {
    if (!reportData?.plantations) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Monthly Plantation Report', 14, 15);
    doc.setFontSize(9);
    doc.text(`Months: ${sortedMonths.map(formatMonth).join(', ')}`, 14, 22);

    const colCount = 3 + sortedMonths.length * 3;

    // ── Header row 1: month names merged across 3 cols ──
    const headRow1 = [
      { content: 'PLANTATION', rowSpan: 2, styles: { fillColor: [30, 58, 95], halign: 'center', valign: 'middle', fontStyle: 'bold' } },
      { content: 'REGION', rowSpan: 2, styles: { fillColor: [30, 58, 95], halign: 'center', valign: 'middle', fontStyle: 'bold' } },
      { content: 'ESTATE', rowSpan: 2, styles: { fillColor: [30, 58, 95], halign: 'center', valign: 'middle', fontStyle: 'bold' } },
    ];
    sortedMonths.forEach((m) => {
      headRow1.push({
        content: formatMonth(m).toUpperCase(),
        colSpan: 3,
        styles: { fillColor: [26, 110, 78], halign: 'center', fontStyle: 'bold' },
      });
    });

    // ── Header row 2: sub-headers ──
    const headRow2 = [];
    sortedMonths.forEach(() => {
      headRow2.push(
        { content: 'PLANNED', styles: { fillColor: [37, 99, 235], halign: 'center', fontStyle: 'bold', fontSize: 6 } },
        { content: 'ASSIGNED', styles: { fillColor: [217, 119, 6], halign: 'center', fontStyle: 'bold', fontSize: 6 } },
        { content: 'COVERED', styles: { fillColor: [22, 163, 74], halign: 'center', fontStyle: 'bold', fontSize: 6 } }
      );
    });

    // ── Data rows with merged plantation/region cells ──
    const body = [];
    reportData.plantations.forEach((pl) => {
      const plTotalEstates = pl.regions.reduce((s, r) => s + r.estates.length, 0);
      let plFirst = true;

      pl.regions.forEach((rg) => {
        let rgFirst = true;

        rg.estates.forEach((est) => {
          const row = [];

          // Plantation cell (merged)
          if (plFirst) {
            row.push({
              content: pl.plantation_name,
              rowSpan: plTotalEstates,
              styles: { fontStyle: 'bold', fillColor: [240, 247, 255], valign: 'middle' },
            });
            plFirst = false;
          }

          // Region cell (merged)
          if (rgFirst) {
            row.push({
              content: rg.region_name,
              rowSpan: rg.estates.length,
              styles: { fontStyle: 'bold', fillColor: [248, 250, 252], valign: 'middle' },
            });
            rgFirst = false;
          }

          // Estate
          row.push(est.estate_name);

          // Month data
          sortedMonths.forEach((m) => {
            const md = est.months[m] || { planned: 0, assigned: 0, covered: 0 };
            row.push(
              { content: md.planned.toFixed(2), styles: { halign: 'right' } },
              { content: md.assigned.toFixed(2), styles: { halign: 'right' } },
              { content: md.covered.toFixed(2), styles: { halign: 'right', textColor: [22, 163, 74] } }
            );
          });

          body.push(row);
        });
      });
    });

    // ── Total row ──
    const totalRowCells = [
      { content: 'Total', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: [254, 249, 195], textColor: [146, 64, 14] } },
    ];
    sortedMonths.forEach((m) => {
      const baseStyle = { halign: 'right', fontStyle: 'bold', fillColor: [254, 249, 195], textColor: [146, 64, 14] };
      totalRowCells.push(
        { content: (totals[m]?.planned || 0).toFixed(2), styles: baseStyle },
        { content: (totals[m]?.assigned || 0).toFixed(2), styles: baseStyle },
        { content: (totals[m]?.covered || 0).toFixed(2), styles: baseStyle }
      );
    });
    body.push(totalRowCells);

    autoTable(doc, {
      head: [headRow1, headRow2],
      body,
      startY: 28,
      styles: { fontSize: 7, cellPadding: 2, lineColor: [209, 213, 219], lineWidth: 0.1 },
      headStyles: { textColor: 255, fontSize: 7 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: (() => {
        const cs = { 0: { cellWidth: 35 }, 1: { cellWidth: 25 }, 2: { cellWidth: 25 } };
        for (let i = 3; i < colCount; i++) { cs[i] = { cellWidth: 18 }; }
        return cs;
      })(),
      tableWidth: 'auto',
    });

    doc.save(`Monthly_Plantation_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="mpr-container">
      {/* ─── Filter Cards ─── */}
      <div className="mpr-filters-grid">

        {/* Plantation Card */}
        <div className="mpr-card">
          <div className="mpr-card-header">
            <div className="mpr-card-icon mpr-icon-green">
              <span>🌿</span>
            </div>
            <div>
              <h3 className="mpr-card-title">Plantations</h3>
              <span className="mpr-card-count">{selectedPlantations.length} of {plantations.length} selected</span>
            </div>
            <button className="mpr-select-all-btn" onClick={selectAllPlantations}>
              {selectedPlantations.length === plantations.length && plantations.length > 0 ? 'Clear All' : 'Select All'}
            </button>
          </div>
          <div className="mpr-card-body">
            {loadingPlantations ? (
              <span className="mpr-loading-text">Loading plantations...</span>
            ) : (
              <div className="mpr-chip-box">
                {plantations.map((p) => (
                  <button
                    key={p.id}
                    className={`mpr-chip ${selectedPlantations.includes(p.id) ? 'mpr-chip-active' : ''}`}
                    onClick={() => togglePlantation(p.id)}
                  >
                    {selectedPlantations.includes(p.id) && <span className="mpr-chip-check">✓</span>}
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Month Card */}
        <div className="mpr-card">
          <div className="mpr-card-header">
            <div className="mpr-card-icon mpr-icon-blue">
              <span>📅</span>
            </div>
            <div>
              <h3 className="mpr-card-title">Months</h3>
              <span className="mpr-card-count">{selectedMonths.length} month{selectedMonths.length !== 1 ? 's' : ''} selected</span>
            </div>
          </div>
          <div className="mpr-card-body">
            <div className="mpr-chip-box">
              {monthOptions.map((m) => (
                <button
                  key={m.value}
                  className={`mpr-chip mpr-chip-month ${selectedMonths.includes(m.value) ? 'mpr-chip-month-active' : ''}`}
                  onClick={() => toggleMonth(m.value)}
                >
                  {selectedMonths.includes(m.value) && <span className="mpr-chip-check">✓</span>}
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Action Bar ─── */}
      <div className="mpr-action-bar">
        <div className="mpr-action-left">
          <button
            className="mpr-btn mpr-btn-primary"
            onClick={handleGenerate}
            disabled={selectedPlantations.length === 0 || selectedMonths.length === 0 || loadingReport}
          >
            {loadingReport ? (
              <><span className="mpr-spinner"></span> Generating...</>
            ) : (
              <><span className="mpr-btn-icon">▶</span> Generate Report</>
            )}
          </button>
          {selectedPlantations.length === 0 || selectedMonths.length === 0 ? (
            <span className="mpr-action-hint">Select at least one plantation and one month</span>
          ) : null}
        </div>
        <div className="mpr-action-right">
          <button className="mpr-btn mpr-btn-excel" onClick={downloadExcel} disabled={!reportData?.plantations?.length}>
            <FiDownload /> Excel
          </button>
          <button className="mpr-btn mpr-btn-pdf" onClick={downloadPDF} disabled={!reportData?.plantations?.length}>
            <FiPrinter /> PDF
          </button>
        </div>
      </div>

      {/* ─── Report Table ─── */}
      {loadingReport ? (
        <div className="mpr-loading">
          <Bars color="#004B71" height={60} width={60} />
          <p className="mpr-loading-label">Generating report...</p>
        </div>
      ) : reportData?.plantations?.length > 0 ? (
        <div className="mpr-table-wrapper">
          <table className="mpr-table">
            <thead>
              <tr>
                <th rowSpan={2} className="mpr-th-fixed">Plantation</th>
                <th rowSpan={2} className="mpr-th-fixed">Region</th>
                <th rowSpan={2} className="mpr-th-fixed">Estate</th>
                {sortedMonths.map((m) => (
                  <th key={m} colSpan={3} className="mpr-th-month">
                    {formatMonth(m).toUpperCase()}
                  </th>
                ))}
              </tr>
              <tr>
                {sortedMonths.map((m) => (
                  <React.Fragment key={m}>
                    <th className="mpr-th-sub mpr-th-planned">Planned</th>
                    <th className="mpr-th-sub mpr-th-assigned">Assigned</th>
                    <th className="mpr-th-sub mpr-th-covered">Covered</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.plantations.map((pl) =>
                pl.regions.map((rg, rgIdx) =>
                  rg.estates.map((est, estIdx) => (
                    <tr key={`${pl.plantation_id}-${rg.region_id}-${est.estate_id}`}>
                      {rgIdx === 0 && estIdx === 0 && (
                        <td
                          rowSpan={pl.regions.reduce((s, r) => s + r.estates.length, 0)}
                          className="mpr-td-plantation"
                        >
                          {pl.plantation_name}
                        </td>
                      )}
                      {estIdx === 0 && (
                        <td rowSpan={rg.estates.length} className="mpr-td-region">
                          {rg.region_name}
                        </td>
                      )}
                      <td className="mpr-td-estate">{est.estate_name}</td>
                      {sortedMonths.map((m) => {
                        const md = est.months[m] || { planned: 0, assigned: 0, covered: 0 };
                        return (
                          <React.Fragment key={m}>
                            <td className="mpr-td-num">{md.planned.toFixed(2)}</td>
                            <td className="mpr-td-num mpr-td-assigned">{md.assigned.toFixed(2)}</td>
                            <td className="mpr-td-num mpr-td-covered">{md.covered.toFixed(2)}</td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))
                )
              )}
              <tr className="mpr-total-row">
                <td colSpan={3} className="mpr-td-total-label">Total</td>
                {sortedMonths.map((m) => (
                  <React.Fragment key={m}>
                    <td className="mpr-td-num mpr-td-total">{(totals[m]?.planned || 0).toFixed(2)}</td>
                    <td className="mpr-td-num mpr-td-total">{(totals[m]?.assigned || 0).toFixed(2)}</td>
                    <td className="mpr-td-num mpr-td-total">{(totals[m]?.covered || 0).toFixed(2)}</td>
                  </React.Fragment>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : reportData ? (
        <div className="mpr-empty-state">
          <div className="mpr-empty-icon">📊</div>
          <h3>No Data Found</h3>
          <p>No data available for the selected plantations and months.</p>
        </div>
      ) : (
        <div className="mpr-empty-state">
          <div className="mpr-empty-icon">🔍</div>
          <h3>Ready to Generate</h3>
          <p>Select plantations and months above, then click <strong>Generate Report</strong> to view data.</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyPlantationReport;
