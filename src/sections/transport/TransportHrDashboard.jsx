import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Bars } from 'react-loader-spinner';
import { FaCalendarAlt, FaCarSide, FaCheckCircle, FaDownload, FaMoneyBillWave, FaTools, FaChartLine } from 'react-icons/fa';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  useGetVehicleAppDriversQuery,
  useGetVehicleAppMaintenanceRequestsQuery,
  useGetVehicleAppVehiclesQuery,
  useHrDecideVehicleMaintenanceRequestMutation,
} from '../../api/services NodeJs/vehicleAppApi';
import {
  useGetAdvanceRequestsForHrQuery,
  useGetLeaveDaysForHrQuery,
  useGetPendingApprovalsQuery,
  useLazyGetLeaveDaysForHrByMonthQuery,
  useGetDailyKmSummaryForHrQuery,
} from '../../api/services NodeJs/vehicleRentApi';
import DriverAdvanceApprovals from '../hr&admin/driverAdvanceApprovals/DriverAdvanceApprovals';
import DriverLeaveDatesHr from '../hr&admin/driverLeaveDates/DriverLeaveDatesHr';
import VehicleRentApprovals from '../hr&admin/vehicleRentApprovals/VehicleRentApprovals';
import AssetsRegistration from '../hr&admin/assets/AssetsRegistration';
import Users from '../ict/users/Users';
import { useGetHrTransportEstimatesQuery } from '../../api/services NodeJs/allEndpoints';
import '../../styles/transportHrDashboard.css';

function getTodayInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return {
    today: `${year}-${month}-${day}`,
    monthKey: `${year}-${month}`,
  };
}

function toDateOnly(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Last N calendar months (current month first), for filter dropdown */
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

function monthLabelFromYearMonth(ym) {
  const [y, m] = String(ym || '').split('-').map(Number);
  if (!y || !m) return String(ym || '');
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getHrStatusInfo(row) {
  const status = String(row?.hr_approval || row?.approval || 'p').toLowerCase();
  if (status === 'a') return { label: 'HR Approved', bg: '#dcfce7', color: '#166534' };
  if (status === 'd') return { label: 'HR Declined', bg: '#fee2e2', color: '#991b1b' };
  return { label: 'HR Pending', bg: '#fef3c7', color: '#92400e' };
}

const MODULE_META = [
  { key: 'availableToday', title: 'Available Today', icon: FaCheckCircle },
  { key: 'rentApprovals', title: 'Vehicle Rent Approvals', icon: FaCarSide },
  { key: 'advanceApprovals', title: 'Driver Advance Approvals', icon: FaMoneyBillWave },
  { key: 'maintenanceApprovals', title: 'Maintenance Approvals', icon: FaTools },
  { key: 'leaveDates', title: 'Driver Leave Dates', icon: FaCalendarAlt },
  { key: 'vehicleAdminVehicles', title: 'Vehicle Admin - Vehicles', icon: FaTools },
  { key: 'vehicleAdminMaintenance', title: 'Vehicle Admin - Maintenance', icon: FaTools },
];
const SUMMARY_DETAIL_KEYS = new Set(['availableToday', 'rentApprovals', 'advanceApprovals', 'maintenanceApprovals', 'leaveDates']);

function TransportHrDashboard() {
  const [detailModule, setDetailModule] = useState(null);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [leaveHistoryOpen, setLeaveHistoryOpen] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [leaveMonthFilter, setLeaveMonthFilter] = useState('');
  const [chartMonth, setChartMonth] = useState('');
  const [chartVehicleNo, setChartVehicleNo] = useState('');
  const [chartViewMode, setChartViewMode] = useState('combined');
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState('all');
  const [maintenanceVehicleFilter, setMaintenanceVehicleFilter] = useState('all');
  const [maintenanceSearch, setMaintenanceSearch] = useState('');
  const [hrDecisionModal, setHrDecisionModal] = useState({
    open: false,
    row: null,
    approval: 'a',
    declineReason: '',
    error: '',
  });
  const [hrDecisionNotice, setHrDecisionNotice] = useState({
    open: false,
    title: '',
    message: '',
    tone: 'success',
  });
  const [fetchLeaveByMonth, leaveByMonthResult] = useLazyGetLeaveDaysForHrByMonthQuery();
  const rollingMonthOptions = useMemo(() => getRollingMonthOptions(24), []);
  const { today, monthKey } = useMemo(() => getTodayInfo(), []);
  const { data: vehicles = [], isLoading: loadingVehicles, refetch: refetchVehicles } = useGetVehicleAppVehiclesQuery();
  const { refetch: refetchDrivers } = useGetVehicleAppDriversQuery();
  const { data: maintenanceRequests = [], isLoading: loadingMaintenance } = useGetVehicleAppMaintenanceRequestsQuery(monthKey);
  const [hrDecideMaintenance, { isLoading: savingHrDecision }] = useHrDecideVehicleMaintenanceRequestMutation();
  const { data: leaveRows = [], isLoading: loadingLeaves } = useGetLeaveDaysForHrQuery({ yearMonth: monthKey });
  const { data: rentRows = [], isLoading: loadingRent } = useGetPendingApprovalsQuery({ yearMonth: monthKey, status: 'all' });
  const { data: advanceRows = [], isLoading: loadingAdvance } = useGetAdvanceRequestsForHrQuery({ yearMonth: monthKey, status: 'all' });
  const effectiveChartMonth = chartMonth || monthKey;
  const {
    data: kmChartRows = [],
    isLoading: loadingKmChart,
  } = useGetDailyKmSummaryForHrQuery({
    yearMonth: effectiveChartMonth,
    vehicle_no: chartVehicleNo || undefined,
  });
  const {
    data: kmVehicleChartRows = [],
    isLoading: loadingKmVehicleChart,
  } = useGetDailyKmSummaryForHrQuery({
    yearMonth: effectiveChartMonth,
    vehicle_no: chartVehicleNo || undefined,
    split_by_vehicle: 1,
  });
  const { data: hrTransportEstimatePayload } = useGetHrTransportEstimatesQuery(
    { assignment_date: today },
    { skip: !today }
  );
  const isPrimaryLoading = loadingVehicles || loadingMaintenance || loadingLeaves || loadingRent || loadingAdvance;
  const hrTransportEstimates = hrTransportEstimatePayload?.data || [];

  const availableVehicles = useMemo(() => {
    const todaysLeaves = (leaveRows || []).filter((row) => toDateOnly(row.leave_date) === today);
    const leaveVehicleSet = new Set(
      todaysLeaves
        .map((row) => String(row.vehicle_no || '').trim().toLowerCase())
        .filter(Boolean)
    );
    const leaveDriverSet = new Set(
      todaysLeaves
        .map((row) => String(row.requested_by_name || '').trim().toLowerCase())
        .filter(Boolean)
    );

    return (vehicles || []).filter((vehicle) => {
      const isActive = Number(vehicle.activated) === 1;
      const vehicleNo = String(vehicle.vehicle_no || '').trim();
      const driverName = String(vehicle.assigned_driver_name || '').trim();
      if (!isActive || !vehicleNo || !driverName) return false;
      if (leaveVehicleSet.has(vehicleNo.toLowerCase())) return false;
      if (leaveDriverSet.has(driverName.toLowerCase())) return false;
      return true;
    });
  }, [vehicles, leaveRows, today]);

  const rentStats = useMemo(() => {
    const approved = (rentRows || []).filter((r) => String(r?.approval) === 'a').length;
    const declined = (rentRows || []).filter((r) => String(r?.approval) === 'd').length;
    const pending = (rentRows || []).filter((r) => String(r?.approval) !== 'a' && String(r?.approval) !== 'd').length;
    return { pending, approved, declined };
  }, [rentRows]);

  const advanceStats = useMemo(() => {
    const approved = (advanceRows || []).filter((r) => String(r?.approval) === 'a').length;
    const declined = (advanceRows || []).filter((r) => String(r?.approval) === 'd').length;
    const pending = (advanceRows || []).filter((r) => String(r?.approval) !== 'a' && String(r?.approval) !== 'd').length;
    return { pending, approved, declined };
  }, [advanceRows]);
  const maintenanceStats = useMemo(() => {
    const approved = (maintenanceRequests || []).filter((r) => String(r?.hr_approval || r?.approval || 'p') === 'a').length;
    const declined = (maintenanceRequests || []).filter((r) => String(r?.hr_approval || r?.approval || 'p') === 'd').length;
    const pending = (maintenanceRequests || []).filter((r) => String(r?.hr_approval || r?.approval || 'p') === 'p').length;
    return { pending, approved, declined };
  }, [maintenanceRequests]);

  const leaveTodayCount = useMemo(
    () => (leaveRows || []).filter((row) => toDateOnly(row?.leave_date) === today).length,
    [leaveRows, today]
  );
  const recentLeaves = useMemo(
    () =>
      [...(leaveRows || [])]
        .sort((a, b) => String(b?.leave_date || '').localeCompare(String(a?.leave_date || '')))
        .slice(0, 4),
    [leaveRows]
  );

  const leaveHistoryPayload = leaveByMonthResult.data || { months: [] };
  const leaveHistoryMonths = leaveHistoryPayload.months || [];
  const loadingLeaveByMonth = leaveByMonthResult.isFetching;
  const leaveHistoryError = leaveByMonthResult.isError;

  const displayedLeaveMonths = useMemo(() => {
    if (!leaveMonthFilter) {
      return leaveHistoryMonths;
    }
    const found = leaveHistoryMonths.find((m) => m.yearMonth === leaveMonthFilter);
    if (found) {
      return [found];
    }
    return [
      {
        yearMonth: leaveMonthFilter,
        label: monthLabelFromYearMonth(leaveMonthFilter),
        count: 0,
        rows: [],
      },
    ];
  }, [leaveHistoryMonths, leaveMonthFilter]);

  useEffect(() => {
    if (leaveHistoryOpen) {
      setLeaveMonthFilter('');
    }
  }, [leaveHistoryOpen]);

  useEffect(() => {
    if (!initialLoadComplete && !isPrimaryLoading) {
      setInitialLoadComplete(true);
    }
  }, [initialLoadComplete, isPrimaryLoading]);

  const openLeaveHistoryModal = () => {
    setLeaveHistoryOpen(true);
    fetchLeaveByMonth({ monthsBack: 24 });
  };

  const downloadLeaveHistoryExcel = () => {
    const flat = [];
    displayedLeaveMonths.forEach((m) => {
      (m.rows || []).forEach((row) => {
        flat.push({
          'Year-Month': m.yearMonth,
          'Month': m.label,
          'Leave date': toDateOnly(row.leave_date),
          Driver: row.requested_by_name || '',
          'Vehicle no': row.vehicle_no || '',
          Reason: row.reason || '',
          'Record ID': row.id,
        });
      });
    });
    if (!flat.length) {
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(flat);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave requests');
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Driver_leave_requests_${stamp}.xlsx`);
  };
  const pendingMaintenanceCount = useMemo(
    () => (maintenanceRequests || []).filter((row) => String(row?.hr_approval || row?.approval || 'p') === 'p').length,
    [maintenanceRequests]
  );
  const activeVehiclesCount = useMemo(
    () => (vehicles || []).filter((row) => Number(row?.activated) === 1).length,
    [vehicles]
  );
  const inactiveVehiclesCount = useMemo(
    () => (vehicles || []).filter((row) => Number(row?.activated) !== 1).length,
    [vehicles]
  );
  const assignedVehicleCount = useMemo(
    () => (vehicles || []).filter((row) => String(row?.assigned_driver_name || '').trim().length > 0).length,
    [vehicles]
  );
  const currentMonthMaintenanceCount = useMemo(
    () => (maintenanceRequests || []).length,
    [maintenanceRequests]
  );
  const latestPendingMaintenance = useMemo(
    () =>
      [...(maintenanceRequests || [])]
        .filter((row) => String(row?.hr_approval || row?.approval || 'p') === 'p')
        .sort((a, b) => String(b?.date || '').localeCompare(String(a?.date || '')))[0] || null,
    [maintenanceRequests]
  );
  const maintenancePreviewRows = useMemo(
    () =>
      [...(maintenanceRequests || [])]
        .filter((row) => String(row?.hr_approval || row?.approval || 'p') === 'p')
        .slice(0, 5),
    [maintenanceRequests]
  );
  const maintenanceVehicleOptions = useMemo(
    () => [...new Set((maintenanceRequests || []).map((r) => String(r?.vehicle_no || r?.vehicle || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [maintenanceRequests]
  );
  const filteredMaintenanceRequests = useMemo(() => {
    const q = String(maintenanceSearch || '').trim().toLowerCase();
    return (maintenanceRequests || []).filter((row) => {
      const status = String(row?.hr_approval || row?.approval || 'p');
      if (maintenanceStatusFilter !== 'all' && status !== maintenanceStatusFilter) return false;
      const vehicleText = String(row?.vehicle_no || row?.vehicle || '').trim();
      if (maintenanceVehicleFilter !== 'all' && vehicleText !== maintenanceVehicleFilter) return false;
      if (!q) return true;
      const driverText = String(row?.driver_name || row?.driver || '').toLowerCase();
      const categoryText = String(row?.category_name || row?.category || '').toLowerCase();
      const requestIdText = String(row?.id || '').toLowerCase();
      return (
        vehicleText.toLowerCase().includes(q)
        || driverText.includes(q)
        || categoryText.includes(q)
        || requestIdText.includes(q)
      );
    });
  }, [maintenanceRequests, maintenanceSearch, maintenanceStatusFilter, maintenanceVehicleFilter]);
  const openHrDecisionModal = (row, approval) => {
    setHrDecisionModal({
      open: true,
      row,
      approval,
      declineReason: '',
      error: '',
    });
  };
  const closeHrDecisionModal = () => {
    setHrDecisionModal({
      open: false,
      row: null,
      approval: 'a',
      declineReason: '',
      error: '',
    });
  };
  const submitHrDecision = async () => {
    const row = hrDecisionModal.row;
    if (!row?.id) return;
    const approval = hrDecisionModal.approval;
    const declineReason = String(hrDecisionModal.declineReason || '').trim();
    if (approval === 'd' && !declineReason) {
      setHrDecisionModal((prev) => ({ ...prev, error: 'Decline reason is required.' }));
      return;
    }
    try {
      await hrDecideMaintenance({
        id: row.id,
        approval,
        decline_reason: approval === 'd' ? declineReason : null,
      }).unwrap();
      closeHrDecisionModal();
      setHrDecisionNotice({
        open: true,
        title: 'Success',
        message: `Maintenance request #${row.id} ${approval === 'a' ? 'approved' : 'declined'} successfully.`,
        tone: 'success',
      });
    } catch (error) {
      setHrDecisionModal((prev) => ({
        ...prev,
        error: error?.data?.message || error?.message || 'Failed to update HR decision.',
      }));
    }
  };
  const chartVehicleOptions = useMemo(
    () =>
      [...new Set((vehicles || []).map((row) => String(row?.vehicle_no || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [vehicles]
  );
  const chartData = useMemo(
    () =>
      (kmChartRows || []).map((row) => ({
        ...row,
        dayLabel: String(row.day || '').replace(/^0/, '') || String(row.date || '').slice(8, 10),
      })),
    [kmChartRows]
  );
  const chartVehicleSeriesRows = useMemo(
    () =>
      (kmVehicleChartRows || []).map((row) => ({
        ...row,
        vehicle_no: String(row.vehicle_no || 'Unknown'),
        dayLabel: String(row.day || '').replace(/^0/, '') || String(row.date || '').slice(8, 10),
      })),
    [kmVehicleChartRows]
  );
  const chartVehicleSeriesKeys = useMemo(
    () => [...new Set(chartVehicleSeriesRows.map((row) => String(row.vehicle_no || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [chartVehicleSeriesRows]
  );
  const chartDataSeparate = useMemo(() => {
    const byDate = new Map();
    chartVehicleSeriesRows.forEach((row) => {
      const dateKey = toDateOnly(row.date);
      if (!dateKey) return;
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, {
          date: dateKey,
          dayLabel: String(row.dayLabel || '').replace(/^0/, '') || dateKey.slice(8, 10),
        });
      }
      byDate.get(dateKey)[row.vehicle_no] = Number(row.total_km || 0);
    });
    return [...byDate.values()].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  }, [chartVehicleSeriesRows]);
  const isAllVehiclesView = !chartVehicleNo;
  const shouldShowSeparateChart = isAllVehiclesView && chartViewMode === 'separate';
  const isChartLoading = shouldShowSeparateChart ? loadingKmVehicleChart : loadingKmChart;
  const chartTotals = useMemo(() => {
    const totalKm = chartData.reduce((sum, row) => sum + Number(row.total_km || 0), 0);
    const activeDays = chartData.filter((row) => Number(row.total_km || 0) > 0).length;
    const peak = chartData.reduce(
      (acc, row) => (Number(row.total_km || 0) > Number(acc.total_km || 0) ? row : acc),
      { total_km: 0, date: '' }
    );
    return {
      totalKm: Number(totalKm.toFixed(1)),
      activeDays,
      peakKm: Number(Number(peak.total_km || 0).toFixed(1)),
      peakDate: toDateOnly(peak.date) || '',
    };
  }, [chartData]);
  useEffect(() => {
    if (!isAllVehiclesView && chartViewMode === 'separate') {
      setChartViewMode('combined');
    }
  }, [chartViewMode, isAllVehiclesView]);

  const getSeriesColor = (index) => {
    const palette = [
      '#004B71', '#0A9396', '#3A86FF', '#8338EC', '#2A9D8F',
      '#FF006E', '#E76F51', '#4361EE', '#5E60CE', '#2B9348',
    ];
    return palette[index % palette.length];
  };
  const downloadKmChartExcel = () => {
    if (!chartVehicleSeriesRows.length) return;
    const rows = chartVehicleSeriesRows.map((row) => ({
      Date: toDateOnly(row.date),
      Day: row.dayLabel || String(toDateOnly(row.date) || '').slice(8, 10),
      Vehicle: row.vehicle_no || chartVehicleNo || 'Unknown',
      'Vehicle KM': Number(row.total_km || 0).toFixed(1),
      'Active Vehicles (Date)': Number(row.vehicle_count || 0),
      Month: monthLabelFromYearMonth(effectiveChartMonth),
      Filter: chartVehicleNo || 'All Vehicles',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily KM by Vehicle');
    const suffix = chartVehicleNo ? `_${chartVehicleNo}` : '_all-vehicles';
    XLSX.writeFile(workbook, `Transport_Daily_KM_${effectiveChartMonth}${suffix}.xlsx`);
  };

  const renderDetailsContent = () => {
    if (detailModule === 'availableToday') {
      return (
        <div className="details-table-wrap-transport-hr">
          <table className="details-table-transport-hr">
            <thead>
              <tr>
                <th>Vehicle No</th>
                <th>Driver</th>
                <th>Category</th>
                <th>Make / Model</th>
              </tr>
            </thead>
            <tbody>
              {availableVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.vehicle_no}</td>
                  <td>{vehicle.assigned_driver_name}</td>
                  <td>{vehicle.vehicle_category_name || '-'}</td>
                  <td>{vehicle.make || '-'} / {vehicle.model || '-'}</td>
                </tr>
              ))}
              {!availableVehicles.length ? (
                <tr>
                  <td colSpan={4}>No available vehicle-driver pairs for today.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      );
    }
    if (detailModule === 'rentApprovals') return <VehicleRentApprovals embedded />;
    if (detailModule === 'advanceApprovals') return <DriverAdvanceApprovals embedded />;
    if (detailModule === 'leaveDates') return <DriverLeaveDatesHr embedded />;
    if (detailModule === 'vehicleAdminVehicles') {
      return (
        <div className="details-table-wrap-transport-hr">
          <table className="details-table-transport-hr">
            <thead>
              <tr>
                <th>Vehicle No</th>
                <th>Driver</th>
                <th>Category</th>
                <th>Make / Model</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((row) => (
                <tr key={row.id}>
                  <td>{row.vehicle_no || '-'}</td>
                  <td>{row.assigned_driver_name || '-'}</td>
                  <td>{row.vehicle_category_name || '-'}</td>
                  <td>{row.make || '-'} / {row.model || '-'}</td>
                  <td>{Number(row.activated) === 1 ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
              {!vehicles.length ? (
                <tr>
                  <td colSpan={5}>No vehicle records found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      );
    }
    if (detailModule === 'vehicleAdminMaintenance' || detailModule === 'maintenanceApprovals') {
      return (
        <div className="details-table-wrap-transport-hr">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 600 }}>Status</span>
              <select value={maintenanceStatusFilter} onChange={(e) => setMaintenanceStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="p">Pending</option>
                <option value="a">Approved</option>
                <option value="d">Declined</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 600 }}>Vehicle</span>
              <select value={maintenanceVehicleFilter} onChange={(e) => setMaintenanceVehicleFilter(e.target.value)}>
                <option value="all">All</option>
                {maintenanceVehicleOptions.map((vehicleNo) => (
                  <option key={vehicleNo} value={vehicleNo}>{vehicleNo}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 4, minWidth: 220 }}>
              <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 600 }}>Search</span>
              <input
                type="text"
                value={maintenanceSearch}
                onChange={(e) => setMaintenanceSearch(e.target.value)}
                placeholder="Request ID / Vehicle / Driver / Category"
              />
            </label>
          </div>
          <table className="details-table-transport-hr">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaintenanceRequests.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{toDateOnly(row.date)}</td>
                  <td>{row.vehicle_no || row.vehicle || '-'}</td>
                  <td>{row.driver_name || row.driver || '-'}</td>
                  <td>{row.category_name || row.category || '-'}</td>
                  <td>
                    {(() => {
                      const statusInfo = getHrStatusInfo(row);
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: statusInfo.bg,
                            color: statusInfo.color,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td>
                    {String(row?.hr_approval || row?.approval || 'p') === 'p' ? (
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          type="button"
                          className="action-btn-outline-transport-hr"
                          disabled={savingHrDecision}
                          onClick={() => openHrDecisionModal(row, 'a')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="action-btn-secondary-transport-hr"
                          disabled={savingHrDecision}
                          onClick={() => openHrDecisionModal(row, 'd')}
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#6b7280', fontSize: 12 }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredMaintenanceRequests.length ? (
                <tr>
                  <td colSpan={7}>No maintenance requests for selected filters.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  const showInitialLoading = !initialLoadComplete && isPrimaryLoading;
  const activeDetailMeta = MODULE_META.find((item) => item.key === detailModule) || null;
  const showStandaloneDetail = detailModule && SUMMARY_DETAIL_KEYS.has(detailModule);

  if (showInitialLoading) {
    return (
      <div className="dashboard-shell-transport-hr">
        <div className="dashboard-loading-overlay-transport-hr" role="status" aria-live="polite">
          <div className="dashboard-loading-content-transport-hr">
            <Bars color="#004B71" height={60} width={80} />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showStandaloneDetail) {
    const ActiveIcon = activeDetailMeta?.icon || FaTools;
    return (
      <div className="dashboard-shell-transport-hr">
        <div className="standalone-details-card-transport-hr">
          <div className="standalone-details-header-transport-hr">
            <div className="standalone-details-title-transport-hr">
              <button className="action-btn-secondary-transport-hr standalone-back-btn-transport-hr" type="button" onClick={() => setDetailModule(null)}>
                Back
              </button>
              <ActiveIcon />
              <strong>{activeDetailMeta?.title || 'Details'}</strong>
            </div>
          </div>
          <div className="standalone-details-body-transport-hr">{renderDetailsContent()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell-transport-hr">
      <div className="dashboard-header-card-transport-hr">
        <div className="dashboard-header-row-transport-hr">
          <div className="dashboard-header-text-transport-hr">
            <h3 className="dashboard-title-transport-hr">Transport HR Operations Dashboard</h3>
            <p className="dashboard-subtitle-transport-hr">
              Professional command center for approvals, leave planning, and daily distance intelligence.
            </p>
          </div>
          <div className="dashboard-header-actions-transport-hr">
            <button type="button" className="action-btn-outline-transport-hr" onClick={() => setAddDriverOpen(true)}>
              Add Driver
            </button>
            <button type="button" className="action-btn-outline-transport-hr" onClick={() => setAddVehicleOpen(true)}>
              Add Vehicle
            </button>
          </div>
        </div>
      </div>

      <div className="km-chart-card-transport-hr">
        <div className="km-chart-head-transport-hr">
          <div className="km-chart-title-wrap-transport-hr">
            <FaChartLine />
            <div>
              <h4>Daily KM Overview</h4>
              <p>
                {monthLabelFromYearMonth(effectiveChartMonth)}
                {chartVehicleNo ? ` • ${chartVehicleNo}` : ' • All vehicles'}
                {!chartVehicleNo ? ` • ${chartViewMode === 'separate' ? 'All separate' : 'All in one'}` : ''}
              </p>
            </div>
          </div>
          <div className="km-chart-filters-transport-hr">
            <label>
              Month
              <select value={chartMonth} onChange={(e) => setChartMonth(e.target.value)}>
                <option value="">Current ({monthLabelFromYearMonth(monthKey)})</option>
                {rollingMonthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label>
              Vehicle
              <select value={chartVehicleNo} onChange={(e) => setChartVehicleNo(e.target.value)}>
                <option value="">All Vehicles</option>
                {chartVehicleOptions.map((vehicleNo) => (
                  <option key={vehicleNo} value={vehicleNo}>{vehicleNo}</option>
                ))}
              </select>
            </label>
            <label>
              Display
              <select
                value={chartViewMode}
                onChange={(e) => setChartViewMode(e.target.value)}
                disabled={!isAllVehiclesView}
                title={isAllVehiclesView ? 'Choose how all-vehicle data should display' : 'Display mode is for All Vehicles only'}
              >
                <option value="combined">All in One</option>
                <option value="separate">All Separate</option>
              </select>
            </label>
            <button
              type="button"
              className="action-btn-outline-transport-hr km-chart-download-btn-transport-hr"
              onClick={downloadKmChartExcel}
              disabled={loadingKmVehicleChart || !chartVehicleSeriesRows.length}
              title="Download vehicle-wise daily KM data to Excel"
            >
              <FaDownload size={13} style={{ marginRight: 6 }} />
              Download Excel
            </button>
          </div>
        </div>
        <div className="km-chart-stats-transport-hr">
          <div>
            <strong>{loadingKmChart ? '-' : chartTotals.totalKm}</strong>
            <span>Total KM</span>
          </div>
          <div>
            <strong>{loadingKmChart ? '-' : chartTotals.activeDays}</strong>
            <span>Active Days</span>
          </div>
          <div>
            <strong>{loadingKmChart ? '-' : chartTotals.peakKm}</strong>
            <span>Peak Day KM</span>
          </div>
          <div>
            <strong>{loadingKmChart ? '-' : (toDateOnly(chartTotals.peakDate) || '-')}</strong>
            <span>Peak Date</span>
          </div>
        </div>
        <div className="km-chart-canvas-transport-hr">
          {isChartLoading ? (
            <div className="km-chart-loading-transport-hr">
              <Bars color="#004B71" height={42} width={62} />
              <p>Loading daily KM data...</p>
            </div>
          ) : shouldShowSeparateChart ? (
            chartDataSeparate.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartDataSeparate} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7e3ec" />
                  <XAxis dataKey="dayLabel" tick={{ fontSize: 12, fill: '#4b5d6b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#4b5d6b' }} />
                  <Tooltip
                    formatter={(value, name) => [`${Number(value || 0).toFixed(1)} km`, String(name || 'Vehicle')]}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload;
                      return row?.date ? `Date: ${toDateOnly(row.date)}` : '';
                    }}
                  />
                  <Legend />
                  {chartVehicleSeriesKeys.map((vehicleNo, idx) => (
                    <Line
                      key={vehicleNo}
                      type="monotone"
                      dataKey={vehicleNo}
                      name={vehicleNo}
                      stroke={getSeriesColor(idx)}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="km-chart-empty-transport-hr">No KM records found for the selected period.</div>
            )
          ) : chartData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="kmAreaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004B71" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#004B71" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7e3ec" />
                <XAxis dataKey="dayLabel" tick={{ fontSize: 12, fill: '#4b5d6b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#4b5d6b' }} />
                <Tooltip
                  formatter={(value) => [`${Number(value || 0).toFixed(1)} km`, 'Total KM']}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload;
                    return row?.date ? `Date: ${toDateOnly(row.date)}` : '';
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="total_km" name="KM per Day" stroke="#004B71" fill="url(#kmAreaColor)" strokeWidth={2.2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="km-chart-empty-transport-hr">No KM records found for the selected period.</div>
          )}
        </div>
      </div>

      <div className="summary-grid-transport-hr">
        <div
          className="summary-card-transport-hr summary-card-clickable-transport-hr"
          role="button"
          tabIndex={0}
          onClick={() => setDetailModule('availableToday')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setDetailModule('availableToday');
            }
          }}
        >
          <div className="summary-head-transport-hr">
            <FaCheckCircle color="#0f766e" />
            <strong>Available Today</strong>
          </div>
          <div className="summary-value-transport-hr">{loadingVehicles || loadingLeaves ? '-' : availableVehicles.length}</div>
          <div className="summary-caption-transport-hr">Vehicle-driver pairs available now</div>
        </div>

        <div
          className="summary-card-transport-hr summary-card-clickable-transport-hr"
          role="button"
          tabIndex={0}
          onClick={() => setDetailModule('maintenanceApprovals')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setDetailModule('maintenanceApprovals');
            }
          }}
        >
          <div className="summary-head-transport-hr">
            <FaTools color="#0f766e" />
            <strong>Maintenance Approvals</strong>
          </div>
          <div className="metric-chip-row-transport-hr">
            <span className="metric-chip-transport-hr">Pending: {loadingMaintenance ? '-' : maintenanceStats.pending}</span>
            <span className="metric-chip-transport-hr">Approved: {loadingMaintenance ? '-' : maintenanceStats.approved}</span>
            <span className="metric-chip-transport-hr">Declined: {loadingMaintenance ? '-' : maintenanceStats.declined}</span>
          </div>
        </div>

        <div
          className="summary-card-transport-hr summary-card-clickable-transport-hr"
          role="button"
          tabIndex={0}
          onClick={() => setDetailModule('rentApprovals')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setDetailModule('rentApprovals');
            }
          }}
        >
          <div className="summary-head-transport-hr">
            <FaCarSide color="#1d4ed8" />
            <strong>Rent Approvals</strong>
          </div>
          <div className="metric-chip-row-transport-hr">
            <span className="metric-chip-transport-hr">Pending: {loadingRent ? '-' : rentStats.pending}</span>
            <span className="metric-chip-transport-hr">Approved: {loadingRent ? '-' : rentStats.approved}</span>
            <span className="metric-chip-transport-hr">Declined: {loadingRent ? '-' : rentStats.declined}</span>
          </div>
        </div>

        <div
          className="summary-card-transport-hr summary-card-clickable-transport-hr"
          role="button"
          tabIndex={0}
          onClick={() => setDetailModule('advanceApprovals')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setDetailModule('advanceApprovals');
            }
          }}
        >
          <div className="summary-head-transport-hr">
            <FaMoneyBillWave color="#0f766e" />
            <strong>Advance Approvals</strong>
          </div>
          <div className="metric-chip-row-transport-hr">
            <span className="metric-chip-transport-hr">Pending: {loadingAdvance ? '-' : advanceStats.pending}</span>
            <span className="metric-chip-transport-hr">Approved: {loadingAdvance ? '-' : advanceStats.approved}</span>
            <span className="metric-chip-transport-hr">Declined: {loadingAdvance ? '-' : advanceStats.declined}</span>
          </div>
        </div>

        <div
          className="summary-card-transport-hr summary-card-clickable-transport-hr"
          role="button"
          tabIndex={0}
          onClick={() => setDetailModule('leaveDates')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setDetailModule('leaveDates');
            }
          }}
        >
          <div className="summary-head-transport-hr">
            <FaCalendarAlt color="#7c3aed" />
            <strong>Driver Leave Dates</strong>
          </div>
          <div className="metric-chip-row-transport-hr">
            <span className="metric-chip-transport-hr">Today on leave: {loadingLeaves ? '-' : leaveTodayCount}</span>
            <span className="metric-chip-transport-hr">This month: {loadingLeaves ? '-' : leaveRows.length}</span>
          </div>
        </div>

      </div>

      <div className="vehicle-admin-panel-transport-hr">
        <div className="vehicle-admin-head-transport-hr">
          <div className="vehicle-admin-title-wrap-transport-hr">
            <FaTools color="#334155" />
            <h3 className="vehicle-admin-title-transport-hr">Vehicle Admin Overview</h3>
          </div>
        </div>

        <div className="vehicle-admin-stats-grid-transport-hr">
          <button
            type="button"
            className="vehicle-admin-stat-card-transport-hr vehicle-admin-stat-card-clickable-transport-hr"
            onClick={() => setDetailModule('vehicleAdminVehicles')}
          >
            <div className="vehicle-admin-stat-label-row-transport-hr">
              <FaCarSide size={12} />
              <div className="vehicle-admin-stat-label-transport-hr">Total Vehicles</div>
            </div>
            <div className="vehicle-admin-stat-value-transport-hr">{loadingVehicles ? '-' : vehicles.length}</div>
            <div className="vehicle-admin-stat-sub-transport-hr">
              <div className="vehicle-admin-stat-sub-row-transport-hr">
                <span>Active</span>
                <strong>{loadingVehicles ? '-' : activeVehiclesCount}</strong>
              </div>
              <div className="vehicle-admin-stat-sub-row-transport-hr">
                <span>Inactive</span>
                <strong>{loadingVehicles ? '-' : inactiveVehiclesCount}</strong>
              </div>
              <div className="vehicle-admin-stat-sub-row-transport-hr">
                <span>Assigned</span>
                <strong>{loadingVehicles ? '-' : assignedVehicleCount}</strong>
              </div>
            </div>
          </button>
          <button
            type="button"
            className="vehicle-admin-stat-card-transport-hr vehicle-admin-stat-card-clickable-transport-hr"
            onClick={() => setDetailModule('vehicleAdminMaintenance')}
          >
            <div className="vehicle-admin-stat-label-row-transport-hr">
              <FaTools size={12} />
              <div className="vehicle-admin-stat-label-transport-hr">Pending Maintenance</div>
            </div>
            <div className="vehicle-admin-stat-value-transport-hr">{loadingMaintenance ? '-' : pendingMaintenanceCount}</div>
            <div className="vehicle-admin-stat-sub-transport-hr">
              <div className="vehicle-admin-stat-sub-row-transport-hr">
                <span>This month</span>
                <strong>{loadingMaintenance ? '-' : currentMonthMaintenanceCount}</strong>
              </div>
              <div className="vehicle-admin-stat-sub-row-transport-hr">
                <span>Latest pending</span>
                <strong>{loadingMaintenance ? '-' : latestPendingMaintenance?.date ? String(latestPendingMaintenance.date) : 'None'}</strong>
              </div>
            </div>
          </button>
          <button
            type="button"
            className="vehicle-admin-stat-card-transport-hr vehicle-admin-stat-card-clickable-transport-hr"
            onClick={() => setDetailModule('availableToday')}
          >
            <div className="vehicle-admin-stat-label-row-transport-hr">
              <FaCheckCircle size={12} />
              <div className="vehicle-admin-stat-label-transport-hr">Available Pairs Today</div>
            </div>
            <ul className="vehicle-admin-stat-list-transport-hr">
              {(availableVehicles || []).slice(0, 4).map((row) => (
                <li key={row.id}>{row.vehicle_no} - {row.assigned_driver_name}</li>
              ))}
              {!availableVehicles.length ? <li>No active pair available.</li> : null}
            </ul>
          </button>
          <div
            className="vehicle-admin-stat-card-transport-hr vehicle-admin-stat-card-clickable-transport-hr"
            role="button"
            tabIndex={0}
            onClick={() => setDetailModule('leaveDates')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setDetailModule('leaveDates');
              }
            }}
          >
            <div className="vehicle-admin-stat-card-head-row-transport-hr">
              <div className="vehicle-admin-stat-label-row-transport-hr">
                <FaCalendarAlt size={12} />
                <div className="vehicle-admin-stat-label-transport-hr">Recent Leave Requests</div>
              </div>
              <button
                type="button"
                className="highlight-view-more-transport-hr"
                onClick={(e) => {
                  e.stopPropagation();
                  openLeaveHistoryModal();
                }}
              >
                View more
              </button>
            </div>
            <ul className="vehicle-admin-stat-list-transport-hr">
              {recentLeaves.slice(0, 4).map((row) => (
                <li key={row.id || `${row.requested_by_name}-${row.leave_date}`}>
                  {toDateOnly(row.leave_date)} - {row.requested_by_name || '-'}
                </li>
              ))}
              {!recentLeaves.length ? <li>No leave requests this month.</li> : null}
            </ul>
          </div>
        </div>

      </div>

      {addVehicleOpen && (
        <div
          role="presentation"
          className="quick-add-overlay-transport-hr"
          onClick={() => setAddVehicleOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transport-hr-add-vehicle-title"
            className="quick-add-modal-transport-hr"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-add-modal-toolbar-transport-hr">
              <h3 id="transport-hr-add-vehicle-title" className="quick-add-modal-title-transport-hr">
                Add Vehicle
              </h3>
              <button
                type="button"
                className="action-btn-secondary-transport-hr"
                onClick={() => setAddVehicleOpen(false)}
              >
                Close
              </button>
            </div>
            <p className="quick-add-modal-hint-transport-hr">
              Same registration form as Fleet Update (vehicles). Driver assignment is optional.
            </p>
            <div className="quick-add-modal-body-transport-hr">
              <AssetsRegistration
                singleMode
                selectedType="vehicles"
                compactHeader
                onVehicleRegisteredSuccess={() => {
                  refetchVehicles();
                  window.setTimeout(() => setAddVehicleOpen(false), 1200);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {hrDecisionModal.open && (
        <div
          role="presentation"
          className="quick-add-overlay-transport-hr"
          onClick={savingHrDecision ? undefined : closeHrDecisionModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transport-hr-maintenance-decision-title"
            className="quick-add-modal-transport-hr"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-add-modal-toolbar-transport-hr">
              <h3 id="transport-hr-maintenance-decision-title" className="quick-add-modal-title-transport-hr">
                Confirm {hrDecisionModal.approval === 'a' ? 'Approval' : 'Decline'}
              </h3>
              <button
                type="button"
                className="action-btn-secondary-transport-hr"
                onClick={closeHrDecisionModal}
                disabled={savingHrDecision}
              >
                Close
              </button>
            </div>
            <div className="quick-add-modal-body-transport-hr">
              <p className="quick-add-modal-hint-transport-hr" style={{ marginTop: 0 }}>
                Request #{hrDecisionModal.row?.id} • Vehicle {hrDecisionModal.row?.vehicle_no || '-'} • Driver {hrDecisionModal.row?.driver_name || '-'}
              </p>
              {hrDecisionModal.approval === 'd' ? (
                <div style={{ display: 'grid', gap: 6 }}>
                  <label htmlFor="transport-hr-decline-reason" style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
                    Decline Reason
                  </label>
                  <textarea
                    id="transport-hr-decline-reason"
                    rows={4}
                    value={hrDecisionModal.declineReason}
                    onChange={(e) => setHrDecisionModal((prev) => ({ ...prev, declineReason: e.target.value, error: '' }))}
                    placeholder="Enter reason for declining this request"
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 13,
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              ) : (
                <p style={{ margin: 0, color: '#334155', fontSize: 14 }}>
                  Are you sure you want to approve this maintenance request?
                </p>
              )}
              {hrDecisionModal.error ? (
                <p style={{ margin: '10px 0 0', color: '#b91c1c', fontSize: 13, fontWeight: 600 }}>
                  {hrDecisionModal.error}
                </p>
              ) : null}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                <button
                  type="button"
                  className="action-btn-secondary-transport-hr"
                  onClick={closeHrDecisionModal}
                  disabled={savingHrDecision}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="action-btn-outline-transport-hr"
                  onClick={submitHrDecision}
                  disabled={savingHrDecision}
                >
                  {savingHrDecision ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hrDecisionNotice.open && (
        <div
          role="presentation"
          className="quick-add-overlay-transport-hr"
          onClick={() => setHrDecisionNotice({ open: false, title: '', message: '', tone: 'success' })}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="quick-add-modal-transport-hr"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-add-modal-toolbar-transport-hr">
              <h3 className="quick-add-modal-title-transport-hr">{hrDecisionNotice.title}</h3>
            </div>
            <div className="quick-add-modal-body-transport-hr">
              <p
                style={{
                  marginTop: 0,
                  color: hrDecisionNotice.tone === 'error' ? '#b91c1c' : '#14532d',
                  fontWeight: 600,
                }}
              >
                {hrDecisionNotice.message}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="action-btn-outline-transport-hr"
                  onClick={() => setHrDecisionNotice({ open: false, title: '', message: '', tone: 'success' })}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {addDriverOpen && (
        <div
          role="presentation"
          className="quick-add-overlay-transport-hr"
          onClick={() => setAddDriverOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transport-hr-add-driver-title"
            className="quick-add-modal-transport-hr quick-add-modal-transport-hr--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-add-modal-toolbar-transport-hr">
              <h3 id="transport-hr-add-driver-title" className="quick-add-modal-title-transport-hr">
                Add Driver
              </h3>
              <button
                type="button"
                className="action-btn-secondary-transport-hr"
                onClick={() => setAddDriverOpen(false)}
              >
                Close
              </button>
            </div>
            <p className="quick-add-modal-hint-transport-hr">
              Same flow as ICT User Registration. Job role is fixed to Driver.
            </p>
            <div className="quick-add-modal-body-transport-hr">
              <Users
                embeddedTransportDriver
                onEmbeddedRegisterSuccess={() => {
                  refetchDrivers();
                  window.setTimeout(() => setAddDriverOpen(false), 1200);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {leaveHistoryOpen && (
        <div
          role="presentation"
          className="quick-add-overlay-transport-hr"
          onClick={() => setLeaveHistoryOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transport-hr-leave-history-title"
            className="quick-add-modal-transport-hr leave-history-modal-transport-hr"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-add-modal-toolbar-transport-hr leave-history-toolbar-transport-hr">
              <h3 id="transport-hr-leave-history-title" className="quick-add-modal-title-transport-hr">
                Driver leave requests — by month
              </h3>
              <div className="leave-history-toolbar-actions-transport-hr">
                <button
                  type="button"
                  className="action-btn-outline-transport-hr leave-history-excel-transport-hr"
                  onClick={downloadLeaveHistoryExcel}
                  disabled={
                    loadingLeaveByMonth ||
                    !displayedLeaveMonths.some((m) => (m.rows || []).length > 0)
                  }
                  title="Download rows currently shown (respects month filter) as Excel"
                >
                  <FaDownload size={14} style={{ marginRight: 6 }} />
                  Download Excel
                </button>
                <button
                  type="button"
                  className="action-btn-secondary-transport-hr"
                  onClick={() => setLeaveHistoryOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <p className="quick-add-modal-hint-transport-hr">
              Last 24 months of active leave records, grouped by calendar month (newest first).
              {leaveHistoryPayload.totalRows != null && !loadingLeaveByMonth
                ? ` ${leaveHistoryPayload.totalRows} total record(s) loaded.`
                : ''}
            </p>
            <div className="leave-history-filter-row-transport-hr">
              <label htmlFor="transport-hr-leave-month-filter" className="leave-history-filter-label-transport-hr">
                Month
              </label>
              <select
                id="transport-hr-leave-month-filter"
                className="leave-history-month-select-transport-hr"
                value={leaveMonthFilter}
                onChange={(e) => setLeaveMonthFilter(e.target.value)}
                disabled={loadingLeaveByMonth || leaveHistoryError}
              >
                <option value="">All months</option>
                {rollingMonthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="quick-add-modal-body-transport-hr leave-history-body-transport-hr">
              {leaveHistoryError ? (
                <p className="leave-history-empty-transport-hr">
                  Could not load leave history. Please try again.
                </p>
              ) : loadingLeaveByMonth ? (
                <p className="leave-history-loading-transport-hr">Loading leave history…</p>
              ) : !leaveHistoryMonths.length && !leaveMonthFilter ? (
                <p className="leave-history-empty-transport-hr">No leave records in this period.</p>
              ) : (
                displayedLeaveMonths.map((monthGroup) => (
                  <section key={monthGroup.yearMonth} className="leave-history-month-block-transport-hr">
                    <div className="leave-history-month-title-transport-hr">
                      {monthGroup.label}
                      <span className="leave-history-month-count-transport-hr">{monthGroup.count} day(s)</span>
                    </div>
                    <div className="leave-history-table-wrap-transport-hr">
                      <table className="leave-history-table-transport-hr">
                        <thead>
                          <tr>
                            <th>Leave date</th>
                            <th>Driver</th>
                            <th>Vehicle</th>
                            <th>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(monthGroup.rows || []).length ? (
                            (monthGroup.rows || []).map((row) => (
                              <tr key={row.id}>
                                <td>{toDateOnly(row.leave_date)}</td>
                                <td>{row.requested_by_name || '—'}</td>
                                <td>{row.vehicle_no || '—'}</td>
                                <td>{row.reason || '—'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="leave-history-table-empty-cell-transport-hr">
                                No leave records for this month.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-card-transport-hr">
        <div className="card-header-transport-hr">
          <strong>Transport Estimated KM (Today)</strong>
        </div>
        <div className="details-table-wrap-transport-hr">
          <table className="details-table-transport-hr">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Estimated KM</th>
                <th>Route Summary</th>
              </tr>
            </thead>
            <tbody>
              {hrTransportEstimates.map((row) => {
                const estimate = row.estimate || null;
                const routeSummary = Array.isArray(estimate?.route_points)
                  ? estimate.route_points.map((point) => point.label).join(' -> ')
                  : '-';
                return (
                  <tr key={row.assignment_id}>
                    <td>{row.assignment_id || '-'}</td>
                    <td>{estimate?.driver_name || row.driver_id || '-'}</td>
                    <td>{row.vehicle_id || '-'}</td>
                    <td>{estimate ? Number(estimate.total_estimated_km || 0).toFixed(3) : '-'}</td>
                    <td title={routeSummary}>{routeSummary}</td>
                  </tr>
                );
              })}
              {!hrTransportEstimates.length ? (
                <tr>
                  <td colSpan={5}>No assigned transport estimates for today.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {detailModule && !SUMMARY_DETAIL_KEYS.has(detailModule) && (
        <div
          role="presentation"
          onClick={() => setDetailModule(null)}
          className="details-overlay-transport-hr"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="details-modal-transport-hr"
          >
            <div className="details-header-transport-hr">
              <div className="details-header-title-transport-hr">
                {MODULE_META.map((item) => {
                  if (item.key !== detailModule) return null;
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={item.key}>
                      <Icon />
                      <strong>{item.title}</strong>
                    </React.Fragment>
                  );
                })}
              </div>
              <button className="action-btn-secondary-transport-hr" type="button" onClick={() => setDetailModule(null)}>Close</button>
            </div>
            {renderDetailsContent()}
          </div>
        </div>
      )}
    </div>
  );
}

export default TransportHrDashboard;
