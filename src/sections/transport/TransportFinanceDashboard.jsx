import React, { useEffect, useMemo, useState } from 'react';
import { CircularProgress } from '@mui/material';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  useGetAdvanceRequestsForFinanceQuery,
  useGetApprovedForFinanceQuery,
} from '../../api/services NodeJs/vehicleRentApi';
import { useGetVehicleAppMaintenanceRequestsQuery } from '../../api/services NodeJs/vehicleAppApi';
import VehicleRent from '../finance/vehicleRent/VehicleRent';
import DriverAdvanceFinance from '../finance/driverAdvance/DriverAdvanceFinance';
import MaintenanceFinance from '../finance/maintenance/MaintenanceFinance';
import '../../styles/transportFinanceDashboard.css';

function getRollingMonthOptions(monthsBack = 24) {
  const now = new Date();
  const out = [];
  for (let i = 0; i < monthsBack; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    out.push({ value, label });
  }
  return out;
}

function toMoney(value) {
  return Number(value || 0).toFixed(2);
}

function TransportFinanceDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [activeSection, setActiveSection] = useState('');

  const monthOptions = useMemo(() => getRollingMonthOptions(24), []);
  const selectedMonthLabel = monthOptions.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  const { data: rentRows = [], isLoading: rentLoading } = useGetApprovedForFinanceQuery({ yearMonth: selectedMonth });
  const { data: advanceRows = [], isLoading: advanceLoading } = useGetAdvanceRequestsForFinanceQuery({ yearMonth: selectedMonth });
  const { data: maintenanceRows = [], isLoading: maintenanceLoading } = useGetVehicleAppMaintenanceRequestsQuery(selectedMonth);

  const kpi = useMemo(() => {
    const rentPendingApproval = rentRows.filter((r) => String(r.finance_approval || 'p') === 'p').length;
    const rentApprovedNotPaid = rentRows.filter(
      (r) => String(r.finance_approval || 'p') === 'a' && Number(r.finance_paid) !== 1
    ).length;
    const rentPaidCount = rentRows.filter((r) => Number(r.finance_paid) === 1).length;

    const advPendingApproval = advanceRows.filter((r) => String(r.finance_approval || 'p') === 'p').length;
    const advApprovedNotPaid = advanceRows.filter(
      (r) => String(r.finance_approval || 'p') === 'a' && Number(r.finance_paid) !== 1
    ).length;
    const advPaidCount = advanceRows.filter((r) => Number(r.finance_paid) === 1).length;

    const rentPaidAmount = rentRows.reduce((sum, row) => (
      Number(row.finance_paid) === 1 ? sum + Number(row.net_monthly_rent ?? row.monthly_rent ?? 0) : sum
    ), 0);
    const advancePaidAmount = advanceRows.reduce((sum, row) => (
      Number(row.finance_paid) === 1 ? sum + Number(row.amount || 0) : sum
    ), 0);

    const maintenancePendingFinance = maintenanceRows.filter(
      (r) => String(r.hr_approval || r.approval || 'p') === 'a' && String(r.finance_approval || 'p') === 'p'
    ).length;
    const maintenanceApprovedNotPaid = maintenanceRows.filter(
      (r) => String(r.finance_approval || 'p') === 'a' && Number(r.finance_paid || 0) !== 1
    ).length;
    const maintenancePaidCount = maintenanceRows.filter((r) => Number(r.finance_paid || 0) === 1).length;

    return {
      rentPendingApproval,
      rentApprovedNotPaid,
      rentPaidCount,
      advPendingApproval,
      advApprovedNotPaid,
      advPaidCount,
      maintenancePendingFinance,
      maintenanceApprovedNotPaid,
      maintenancePaidCount,
      totalPaidAmount: rentPaidAmount + advancePaidAmount,
      rentPaidAmount,
      advancePaidAmount,
    };
  }, [rentRows, advanceRows, maintenanceRows]);

  const rentByVehicleChart = useMemo(() => {
    const map = new Map();
    rentRows.forEach((row) => {
      const isPaid = Number(row.finance_paid) === 1;
      if (!isPaid) return;
      const key = String(row.vehicle_no || row.vehicle || 'Unknown').trim() || 'Unknown';
      const current = map.get(key) || 0;
      map.set(key, current + Number(row.net_monthly_rent ?? row.monthly_rent ?? 0));
    });
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [rentRows]);

  const advanceByDriverChart = useMemo(() => {
    const map = new Map();
    advanceRows.forEach((row) => {
      if (Number(row.finance_paid) !== 1) return;
      const key = String(row.requested_by_name || row.driver_name || 'Unknown').trim() || 'Unknown';
      const current = map.get(key) || 0;
      map.set(key, current + Number(row.amount || 0));
    });
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [advanceRows]);

  const loading = rentLoading || advanceLoading || maintenanceLoading;

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7388/ingest/2847869f-00fd-4bf5-84a4-26f0333f83f0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6fcd8b'},body:JSON.stringify({sessionId:'6fcd8b',runId:'pre-fix-1',hypothesisId:'H1',location:'TransportFinanceDashboard.jsx:loading+maintenanceRows',message:'Finance dashboard maintenance dataset snapshot',data:{selectedMonth,maintenanceLoading,maintenanceRowsCount:Array.isArray(maintenanceRows)?maintenanceRows.length:-1,maintenancePendingFinance:kpi.maintenancePendingFinance,activeSection},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [selectedMonth, maintenanceLoading, maintenanceRows, kpi.maintenancePendingFinance, activeSection]);

  const sectionCards = [
    {
      key: 'vehicleSummary',
      title: 'Vehicle Summary',
      caption: 'View month-wise vehicle finance summary details.',
    },
    {
      key: 'monthlyRecords',
      title: 'Monthly Records (Approvals)',
      caption: 'Open finance approval and mark paid records.',
      stats: [
        { label: 'Pending', value: kpi.rentPendingApproval, tone: 'pending' },
        { label: 'Approved, Not Paid', value: kpi.rentApprovedNotPaid, tone: 'approvedNotPaid' },
        { label: 'Paid', value: kpi.rentPaidCount, tone: 'paid' },
      ],
    },
    {
      key: 'driverAdvance',
      title: 'Driver Advance Finance',
      caption: 'Manage advance finance approval and payment proof.',
      stats: [
        { label: 'Pending', value: kpi.advPendingApproval, tone: 'pending' },
        { label: 'Approved, Not Paid', value: kpi.advApprovedNotPaid, tone: 'approvedNotPaid' },
        { label: 'Paid', value: kpi.advPaidCount, tone: 'paid' },
      ],
    },
    {
      key: 'maintenanceFinance',
      title: 'Maintenance Finance',
      caption: 'Finance approval and payment proof flow for maintenance.',
      stats: [
        { label: 'Pending Finance', value: kpi.maintenancePendingFinance, tone: 'pending' },
        { label: 'Approved, Not Paid', value: kpi.maintenanceApprovedNotPaid, tone: 'approvedNotPaid' },
        { label: 'Paid', value: kpi.maintenancePaidCount, tone: 'paid' },
      ],
    },
  ];

  const renderActiveSection = () => {
    if (activeSection === 'vehicleSummary') {
      return (
        <VehicleRent
          embedded
          externalMonth={selectedMonth}
          forcedTab={0}
          lockTab
          onMonthChange={setSelectedMonth}
        />
      );
    }
    if (activeSection === 'monthlyRecords') {
      return (
        <VehicleRent
          embedded
          externalMonth={selectedMonth}
          forcedTab={1}
          lockTab
          onMonthChange={setSelectedMonth}
        />
      );
    }
    if (activeSection === 'driverAdvance') {
      return <DriverAdvanceFinance embedded externalMonth={selectedMonth} onMonthChange={setSelectedMonth} />;
    }
    if (activeSection === 'maintenanceFinance') {
      return (
        <MaintenanceFinance
          embedded
          externalMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          prefetchedRows={maintenanceRows}
          prefetchedLoading={maintenanceLoading}
        />
      );
    }
    return null;
  };

  return (
    <div className="transport-finance-shell">
      <div className="transport-finance-head">
        <div>
          <h2>Transport Finance Dashboard</h2>
          <p>Redesigned finance operations with payment visibility and pending approvals.</p>
        </div>
        <label className="transport-finance-month-filter">
          Month
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="transport-finance-loading">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="transport-finance-kpi-grid">
            <div className="transport-finance-kpi-card">
              <span>Total Paid (Month)</span>
              <strong>LKR {toMoney(kpi.totalPaidAmount)}</strong>
              <p>Rent: LKR {toMoney(kpi.rentPaidAmount)} | Advance: LKR {toMoney(kpi.advancePaidAmount)}</p>
            </div>
            <div className="transport-finance-kpi-card">
              <span>Pending Finance Approvals</span>
              <strong>{kpi.rentPendingApproval + kpi.advPendingApproval}</strong>
              <p>Rent: {kpi.rentPendingApproval} | Advance: {kpi.advPendingApproval}</p>
            </div>
            <div className="transport-finance-kpi-card">
              <span>Approved, Not Paid</span>
              <strong>{kpi.rentApprovedNotPaid + kpi.advApprovedNotPaid}</strong>
              <p>Rent: {kpi.rentApprovedNotPaid} | Advance: {kpi.advApprovedNotPaid}</p>
            </div>
            <div className="transport-finance-kpi-card">
              <span>Paid Records</span>
              <strong>{kpi.rentPaidCount + kpi.advPaidCount}</strong>
              <p>Rent: {kpi.rentPaidCount} | Advance: {kpi.advPaidCount}</p>
            </div>
          </div>

          <div className="transport-finance-chart-grid">
            <div className="transport-finance-chart-card">
              <div className="transport-finance-chart-head">
                <h4>How Much Paid per Vehicle</h4>
                <span>{selectedMonthLabel}</span>
              </div>
              {rentByVehicleChart.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={rentByVehicleChart} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dce7f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`LKR ${toMoney(value)}`, 'Paid amount']} />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      name="Paid Amount (LKR)"
                      fill="#004B71"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={58}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="transport-finance-chart-empty">No paid rent records for this month.</div>
              )}
            </div>

            <div className="transport-finance-chart-card">
              <div className="transport-finance-chart-head">
                <h4>How Much Paid per Driver (Advance)</h4>
                <span>{selectedMonthLabel}</span>
              </div>
              {advanceByDriverChart.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={advanceByDriverChart} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dce7f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`LKR ${toMoney(value)}`, 'Paid amount']} />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      name="Paid Amount (LKR)"
                      fill="#0f766e"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={58}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="transport-finance-chart-empty">No paid advance records for this month.</div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="transport-finance-module-grid">
        {sectionCards.map((card) => (
          <button
            key={card.key}
            type="button"
            className="transport-finance-module-card"
            onClick={() => setActiveSection(card.key)}
          >
            <strong>{card.title}</strong>
            <span>{card.caption}</span>
            {card.stats ? (
              <div className="transport-finance-module-stats">
                {card.stats.map((stat) => (
                  <div key={`${card.key}-${stat.label}`} className={`transport-finance-module-stat ${stat.tone}`}>
                    <small>{stat.label}</small>
                    <b>{stat.value}</b>
                  </div>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {activeSection ? (
        <div
          className="transport-finance-overlay"
          role="presentation"
          onClick={() => setActiveSection('')}
        >
          <div
            className="transport-finance-overlay-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="transport-finance-section-toolbar">
              <button
                type="button"
                className="transport-finance-back-btn"
                onClick={() => setActiveSection('')}
              >
                Back
              </button>
              <strong>
                {sectionCards.find((s) => s.key === activeSection)?.title || 'Finance Section'}
              </strong>
            </div>
            <div className="transport-finance-section-wrap">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default TransportFinanceDashboard;
