import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import * as XLSX from 'xlsx-js-style';
import { FiDownload } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../styles/planExecutionReport.css';
import { useLazyGetManagementPlanExecutionReportQuery } from '../../../api/services NodeJs/financeReportApi';

const toYmd = (date) => date.toLocaleDateString('en-CA');
const toDisplay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
};
const splitReasonLines = (value) =>
  String(value || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

const PlanExecutionReasonReport = () => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [pilotFilter, setPilotFilter] = useState('');
  const [estateFilter, setEstateFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [trigger, { data = [], isFetching }] = useLazyGetManagementPlanExecutionReportQuery();

  useEffect(() => {
    trigger({ start_date: toYmd(startDate), end_date: toYmd(endDate) }, true);
  }, [startDate, endDate, trigger]);

  const filteredPlans = useMemo(
    () =>
      (data || []).filter((p) => (
        (!pilotFilter || (p.pilot || '').includes(pilotFilter))
        && (!estateFilter || p.estate === estateFilter)
        && (!planFilter || String(p.plan_id) === String(planFilter))
      )),
    [data, pilotFilter, estateFilter, planFilter]
  );

  const pilotOptions = useMemo(() => [...new Set((data || []).map((p) => p.pilot).filter(Boolean))], [data]);
  const estateOptions = useMemo(() => [...new Set((data || []).map((p) => p.estate).filter(Boolean))], [data]);
  const planOptions = useMemo(() => [...new Set((data || []).map((p) => p.plan_id).filter(Boolean))], [data]);

  const exportExcel = () => {
    const headers = ['Date', 'Pilot', 'PlanID', 'Estate', 'Field Name', 'Field Size (Ha)', 'Completed (Ha)(Ops)', 'Completed (Ha)(Pilot)', 'Covered %', 'Billing Extent', 'If Canceled/Deactivated - Reasons'];
    const aoa = [headers];
    const merges = [];
    let currentRow = 1;

    filteredPlans.forEach((plan) => {
      const fields = Array.isArray(plan.fields) ? plan.fields : [];
      let totalField = 0;
      let totalCompletedOps = 0;
      let totalCompletedPilot = 0;
      let totalBilling = 0;
      fields.forEach((f) => {
        totalField += Number(f.field_size) || 0;
        totalCompletedOps += Number(f.completed) || 0;
        totalCompletedPilot += Number(f.completed_pilot) || 0;
        totalBilling += Number(f.billing_extent) || 0;
      });

      const startRow = currentRow;
      (fields.length > 0 ? fields : [{}]).forEach((f, idx) => {
        aoa.push([
          idx === 0 ? toDisplay(plan.date) : '',
          idx === 0 ? (plan.pilot || '') : '',
          idx === 0 ? plan.plan_id : '',
          idx === 0 ? (plan.estate || '') : '',
          f.field_name || '',
          (Number(f.field_size) || 0).toFixed(2),
          (Number(f.completed) || 0).toFixed(2),
          (Number(f.completed_pilot) || 0).toFixed(2),
          `${(Number(f.covered) || 0).toFixed(2)}%`,
          (Number(f.billing_extent) || 0).toFixed(2),
          splitReasonLines(f.reasons).join('\n'),
        ]);
        currentRow += 1;
      });

      const endRow = currentRow - 1;
      if (endRow > startRow) {
        [0, 1, 2, 3].forEach((c) => {
          merges.push({ s: { r: startRow, c }, e: { r: endRow, c } });
        });
      }

      aoa.push([
        '',
        '',
        `Plan ${plan.plan_id} Total`,
        '',
        '',
        totalField.toFixed(2),
        totalCompletedOps.toFixed(2),
        totalCompletedPilot.toFixed(2),
        totalField > 0 ? `${((totalCompletedOps / totalField) * 100).toFixed(2)}%` : '0.00%',
        totalBilling.toFixed(2),
        '',
      ]);
      currentRow += 1;
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges'] = merges;
    ws['!cols'] = [
      { wch: 14 }, { wch: 24 }, { wch: 12 }, { wch: 20 }, { wch: 24 },
      { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 40 },
    ];

    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    };
    const centerStyle = {
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    };
    const leftWrapStyle = {
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    };

    // Header row styling
    headers.forEach((_, c) => {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[cellAddr]) ws[cellAddr].s = headerStyle;
    });

    // Data cells styling (center merged columns, wrap reasons)
    for (let r = 1; r < aoa.length; r += 1) {
      for (let c = 0; c < headers.length; c += 1) {
        const cellAddr = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellAddr]) continue;
        if ([0, 1, 2, 3, 5, 6, 7, 8, 9].includes(c)) {
          ws[cellAddr].s = centerStyle;
        } else if (c === 10) {
          ws[cellAddr].s = leftWrapStyle;
        }
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PlanExecution');
    XLSX.writeFile(wb, `Management_Plan_Execution_${toYmd(startDate)}_to_${toYmd(endDate)}.xlsx`);
  };

  return (
    <div className="plan-excu-container">
      <div className="plan-excu-filters">
        <div className="plan-excu-filters-inner">
          <div className="plan-excu-top">
            <div>
              <label>Start Date</label>
              <DatePicker selected={startDate} onChange={(d) => setStartDate(d)} dateFormat="dd-MM-yyyy" />
            </div>
            <div>
              <label>End Date</label>
              <DatePicker selected={endDate} onChange={(d) => setEndDate(d)} minDate={startDate} dateFormat="dd-MM-yyyy" />
            </div>
            <div className="plan-excu-align">
              <select value={pilotFilter} onChange={(e) => setPilotFilter(e.target.value)}>
                <option value="">All Pilots</option>
                {pilotOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="plan-excu-align">
              <select value={estateFilter} onChange={(e) => setEstateFilter(e.target.value)}>
                <option value="">All Estates</option>
                {estateOptions.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="plan-excu-align">
              <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
                <option value="">All Plans</option>
                {planOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="plan-excu-align">
              <button onClick={exportExcel} className="flex items-center bg-green-500 text-white m-0">
                <FiDownload className="mr-2" /> Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="plan-excu-table-wrap">
        {isFetching ? <div style={{ padding: 16 }}>Loading...</div> : (
          <table className="plan-excu-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pilot</th>
                <th>PlanID</th>
                <th>Estate</th>
                <th>Field Name</th>
                <th>Field Size (Ha)</th>
                <th>Completed (Ha)(Ops)</th>
                <th>Completed (Ha)(Pilot)</th>
                <th>Covered %</th>
                <th>Billing Extent</th>
                <th>If Canceled/Deactivated - Reasons</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => {
                const fields = Array.isArray(plan.fields) ? plan.fields : [];
                let totalField = 0;
                let totalCompletedOps = 0;
                let totalCompletedPilot = 0;
                let totalBilling = 0;
                fields.forEach((f) => {
                  totalField += Number(f.field_size) || 0;
                  totalCompletedOps += Number(f.completed) || 0;
                  totalCompletedPilot += Number(f.completed_pilot) || 0;
                  totalBilling += Number(f.billing_extent) || 0;
                });
                return (
                  <React.Fragment key={plan.plan_id}>
                    {fields.map((f, idx) => (
                      <tr key={`${plan.plan_id}-${idx}`}>
                        {idx === 0 && <td rowSpan={fields.length}>{toDisplay(plan.date)}</td>}
                        {idx === 0 && <td rowSpan={fields.length}>{plan.pilot || ''}</td>}
                        {idx === 0 && <td rowSpan={fields.length}>{plan.plan_id}</td>}
                        {idx === 0 && <td rowSpan={fields.length}>{plan.estate || ''}</td>}
                        <td>{f.field_name || ''}</td>
                        <td>{(Number(f.field_size) || 0).toFixed(2)}</td>
                        <td>{(Number(f.completed) || 0).toFixed(2)}</td>
                        <td>{(Number(f.completed_pilot) || 0).toFixed(2)}</td>
                        <td>{(Number(f.covered) || 0).toFixed(2)}%</td>
                        <td>{(Number(f.billing_extent) || 0).toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {splitReasonLines(f.reasons).length > 0
                              ? splitReasonLines(f.reasons).map((line, lineIdx) => (
                                <div key={lineIdx}>{line}</div>
                              ))
                              : <div></div>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={5}>{`Plan ${plan.plan_id} Total`}</td>
                      <td>{totalField.toFixed(2)}</td>
                      <td>{totalCompletedOps.toFixed(2)}</td>
                      <td>{totalCompletedPilot.toFixed(2)}</td>
                      <td>{totalField > 0 ? `${((totalCompletedOps / totalField) * 100).toFixed(2)}%` : '0.00%'}</td>
                      <td>{totalBilling.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </React.Fragment>
                );
              })}
              {filteredPlans.length === 0 && (
                <tr><td colSpan={11} style={{ textAlign: 'center' }}>No data available</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PlanExecutionReasonReport;

