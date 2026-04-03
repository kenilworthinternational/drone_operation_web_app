import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaArrowLeft,
  FaFileExcel,
  FaChevronDown,
  FaChevronRight,
  FaMapMarkedAlt,
  FaLeaf,
  FaCalendarAlt,
  FaHashtag,
  FaTimes,
  FaTimesCircle,
  FaSearchPlus,
  FaSearchMinus,
  FaExpand,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import {
  useGetEstatePlanBreakdownQuery,
} from '../../../../api/services NodeJs/plantationDashboardApi';
import BreakdownDailyPlannedVsExecutedChart from '../components/BreakdownDailyPlannedVsExecutedChart';
import { useGetAllEstatesQuery } from '../../../../api/services/estatesApi';
import { Bars } from 'react-loader-spinner';
import '../../../../styles/plantationDashboard.css';
import { appendShellParams } from '../../../../utils/shellSearchParams';

const ChartBreakdownPage = ({ basePath = '/home/plantation-dashboard' } = {}) => {
  const isInternalDashboard =
    basePath === '/home/dashboard' || basePath.startsWith('/home/dashboard/');
  const completedPlansOnly = !isInternalDashboard;
  const containerClassName = `container-class-breakdown${isInternalDashboard ? ' container-class-breakdown--internal' : ''}`;
  const navigate = useNavigate();
  const location = useLocation();

  /** Return to dashboard: drop month/chart; keep ?comb=1 and ?wing= so COMB shell / wing filter stay. */
  const backToDashboard = useCallback(() => {
    const next = new URLSearchParams();
    appendShellParams(next, location.search);
    const qs = next.toString();
    if (qs) {
      navigate({ pathname: basePath, search: `?${qs}` });
    } else {
      navigate(basePath);
    }
  }, [basePath, location.search, navigate]);

  // Parse URL parameters
  const queryParams = new URLSearchParams(location.search);
  const urlMonth = queryParams.get('month');
  const urlChart = queryParams.get('chart');

  // Get data from location state (passed from chart bar click) or use URL params
  const {
    chartType: stateChartType,
    missionType: stateMissionType,
    month: stateMonth,
    monthName: stateMonthName,
    chartData: selectedChartData,
  } = location.state || {};

  // Use URL params if available, otherwise use state params
  const chartType = urlChart || stateChartType || 'planned-vs-sprayed';
  const missionType = stateMissionType || 'spy';
  const month = urlMonth || stateMonth;
  const monthName = stateMonthName || (month ? new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '');

  // Helper: get last day of month (YYYY-MM)
  const getMonthEnd = (ym) => {
    const parts = ym.split('-').map(Number);
    const y = parts[0];
    const m = parts[1];
    const last = new Date(y, m, 0);
    return `${y}-${String(m).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
  };

  // Initialize date filters from selected month so we show "just that month"
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedEstate, setSelectedEstate] = useState('');
  const [dateFrom, setDateFrom] = useState(() => (month ? `${month}-01` : ''));
  const [dateTo, setDateTo] = useState(() => (month ? getMonthEnd(month) : ''));

  // Tea Revenue chart shows simplified view (no spray/completion/cancel data)
  const isTeaRevenueChart = chartType === 'planned-vs-tea-revenue';

  // Accordion state: which plans and fields are expanded
  const [expandedPlans, setExpandedPlans] = useState({});
  const [expandedFields, setExpandedFields] = useState({});

  // Map popup state
  const [mapPopup, setMapPopup] = useState(null); // { url, fieldName }

  const openMapPopup = (url, fieldName) => {
    setMapPopup({ url, fieldName });
  };

  const closeMapPopup = useCallback(() => {
    setMapPopup(null);
  }, []);

  // Close map popup on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeMapPopup();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeMapPopup]);

  const [isExporting, setIsExporting] = useState(false);

  const isFullyCancelledField = useCallback(
    (field) => Boolean(field?.is_cancelled) && String(field?.reason_flag || '') !== 'h',
    []
  );

  const getPlanCancelledExtent = useCallback((plan) => {
    const fields = Array.isArray(plan?.fields) ? plan.fields : [];
    return fields.reduce((fieldSum, field) => {
      if (!isFullyCancelledField(field)) return fieldSum;
      return fieldSum + parseFloat(field.planned_area || 0);
    }, 0);
  }, [isFullyCancelledField]);

  // Effective month for API: from date filter when set, otherwise from URL/state
  const effectiveMonth = dateFrom ? dateFrom.substring(0, 7) : month;
  const effectiveMonthName = effectiveMonth ? new Date(effectiveMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : (monthName || month);
  const monthStart = effectiveMonth ? `${effectiveMonth}-01` : '';
  const monthEnd = effectiveMonth ? getMonthEnd(effectiveMonth) : '';

  // Sync date filters when month from URL/state changes (e.g. user navigates to different month)
  useEffect(() => {
    if (month) {
      setDateFrom(`${month}-01`);
      setDateTo(getMonthEnd(month));
    }
  }, [month]);

  // Fetch estate-plan breakdown data — use effective month (from filter or URL)
  const {
    data: estatePlanData,
    isLoading: estatePlanLoading,
    isFetching: estatePlanFetching,
  } = useGetEstatePlanBreakdownQuery(
    {
      yearMonth: effectiveMonth,
      missionType: missionType || 'spy',
      chartType: chartType || 'planned-vs-tea-revenue',
      completedPlansOnly,
    },
    { skip: !effectiveMonth }
  );
  const { data: estatesMasterData } = useGetAllEstatesQuery();

  const estatesMaster = useMemo(() => {
    const data = Array.isArray(estatesMasterData?.data)
      ? estatesMasterData.data
      : (Array.isArray(estatesMasterData) ? estatesMasterData : []);
    return data;
  }, [estatesMasterData]);

  const estateById = useMemo(() => {
    const map = new Map();
    estatesMaster.forEach((estate) => {
      map.set(String(estate.id), estate);
    });
    return map;
  }, [estatesMaster]);

  const allPlans = useMemo(() => {
    const data = estatePlanData?.data || [];
    // Sort plans: date ascending (1-31), but 0% completion plans go last (only for sprayed chart)
    // Within each group, sort by date then estate then plan_id
    return [...data].sort((a, b) => {
      if (!isTeaRevenueChart) {
        const aHasSprayed = parseFloat(a.total_sprayed || 0) > 0;
        const bHasSprayed = parseFloat(b.total_sprayed || 0) > 0;

        // Non-zero completion first, zero completion last
        if (aHasSprayed && !bHasSprayed) return -1;
        if (!aHasSprayed && bHasSprayed) return 1;
      }

      // Within same group: sort by date ascending
      const dateCompare = (a.picked_date || '').localeCompare(b.picked_date || '');
      if (dateCompare !== 0) return dateCompare;

      // Then by estate name
      const estateCompare = (a.estate_name || '').localeCompare(b.estate_name || '');
      if (estateCompare !== 0) return estateCompare;

      return (a.plan_id || 0) - (b.plan_id || 0);
    });
  }, [estatePlanData, isTeaRevenueChart]);

  const availableRegions = useMemo(() => {
    const map = new Map();
    allPlans.forEach((plan) => {
      const estateMeta = estateById.get(String(plan.estate_id));
      const regionId = estateMeta?.region;
      if (!regionId || map.has(String(regionId))) return;
      map.set(String(regionId), {
        id: String(regionId),
        name: estateMeta?.region_name || `Region ${regionId}`,
      });
    });
    return Array.from(map.values());
  }, [allPlans, estateById]);

  const availableEstates = useMemo(() => {
    const map = new Map();
    allPlans.forEach((plan) => {
      const estateId = String(plan.estate_id || '');
      if (!estateId) return;
      const estateMeta = estateById.get(estateId);
      const estateRegion = estateMeta?.region ? String(estateMeta.region) : '';
      if (selectedRegion && estateRegion !== selectedRegion) return;
      if (!map.has(estateId)) {
        map.set(estateId, {
          id: estateId,
          name: plan.estate_name || estateMeta?.estate || `Estate ${estateId}`,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allPlans, estateById, selectedRegion]);

  const plans = useMemo(() => {
    return allPlans.filter((plan) => {
      const estateId = String(plan.estate_id || '');
      const estateMeta = estateById.get(estateId);
      const estateRegion = estateMeta?.region ? String(estateMeta.region) : '';
      const planDate = String(plan.picked_date || '');

      if (selectedEstate && estateId !== selectedEstate) return false;
      if (!selectedEstate && selectedRegion && estateRegion !== selectedRegion) return false;
      if (dateFrom && planDate < dateFrom) return false;
      if (dateTo && planDate > dateTo) return false;
      return true;
    });
  }, [allPlans, estateById, selectedRegion, selectedEstate, dateFrom, dateTo]);

  const summaryData = useMemo(() => {
    if (selectedChartData) return selectedChartData;
    const teaRevenueExtent = 0;
    const plannedExtent = plans.reduce((sum, plan) => sum + parseFloat(plan.total_planned || 0), 0);
    const actualSprayedFieldsExtent = plans.reduce(
      (sum, plan) => sum + parseFloat(plan.actual_sprayed_fields_extent || 0),
      0
    );
    const sprayedExtent = plans.reduce((sum, plan) => sum + parseFloat(plan.total_sprayed || 0), 0);
    const canceledExtent = plans.reduce((sum, plan) => {
      const fields = Array.isArray(plan.fields) ? plan.fields : [];
      return sum + fields.reduce((fieldSum, field) => {
        if (!isFullyCancelledField(field)) return fieldSum;
        return fieldSum + parseFloat(field.planned_area || 0);
      }, 0);
    }, 0);
    return {
      teaRevenueExtent,
      plannedExtent,
      actualSprayedFieldsExtent,
      sprayedExtent,
      canceledExtent,
      planningRate: 0,
      completionRate: (actualSprayedFieldsExtent - canceledExtent) > 0
        ? (sprayedExtent / (actualSprayedFieldsExtent - canceledExtent)) * 100
        : 0,
      sprayPlanCount: missionType === 'spy' ? plans.length : 0,
      spreadPlanCount: missionType === 'spd' ? plans.length : 0,
    };
  }, [selectedChartData, plans, missionType, isFullyCancelledField]);

  // Sort fields within a plan: completed (sprayed > 0) first, then 0-value last
  const getSortedFields = useCallback((fields) => {
    if (!fields || fields.length === 0) return [];
    return [...fields].sort((a, b) => {
      const aHasSprayed = parseFloat(a.total_sprayed || 0) > 0;
      const bHasSprayed = parseFloat(b.total_sprayed || 0) > 0;

      if (aHasSprayed && !bHasSprayed) return -1;
      if (!aHasSprayed && bHasSprayed) return 1;

      // Within same group, keep original order (by field name)
      return (a.field_name || '').localeCompare(b.field_name || '');
    });
  }, []);

  // Toggle plan accordion
  const togglePlan = (planId) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  // Toggle field accordion
  const toggleField = (planId, fieldId) => {
    const key = `${planId}-${fieldId}`;
    setExpandedFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Excel export — uses only on-screen data (selectedChartData + plans from accordion)
  const handleExportToExcel = () => {
    if (!effectiveMonth) {
      alert('No month selected');
      return;
    }
    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      const reportDate = effectiveMonth ? `${effectiveMonth}-01` : '';

      // Summary sheet: exactly what's shown in the metrics cards on screen
      const teaRevenueVal = parseFloat(summaryData?.teaRevenueExtent || 0);
      const plannedVal = parseFloat(summaryData?.plannedExtent || 0);
      const executedVal = parseFloat(summaryData?.actualSprayedFieldsExtent || 0);
      const coveredVal = parseFloat(summaryData?.sprayedExtent || 0);
      const canceledVal = parseFloat(summaryData?.canceledExtent || 0);
      const completionBase = Math.max(executedVal - canceledVal, 0);
      const completionRate = completionBase > 0
        ? ((coveredVal / completionBase) * 100).toFixed(1)
        : '0.0';
      const planningRate = teaRevenueVal > 0
        ? ((plannedVal / teaRevenueVal) * 100).toFixed(1)
        : '0.0';

      const summaryRows = isTeaRevenueChart
        ? [
            {
              Date: reportDate,
              'Tea Revenue Extent (Ha)': teaRevenueVal.toFixed(2),
              'Planned Extent (Ha)': plannedVal.toFixed(2),
              'Planning Rate (%)': planningRate,
            },
          ]
        : [
            {
              Date: reportDate,
              'Tea Revenue Extent (Ha)': teaRevenueVal.toFixed(2),
              'Planned Extent (Ha)': plannedVal.toFixed(2),
              'Executed Extent (Ha)': executedVal.toFixed(2),
              'Covered Area (Ha)': coveredVal.toFixed(2),
              'Canceled Extent (Ha)': canceledVal.toFixed(2),
              'Completion Rate (%)': completionRate,
              'Planning Rate (%)': planningRate,
            },
          ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Detail rows: exactly what's shown in the accordion on screen
      const detailRows = [];
      if (isTeaRevenueChart) {
        // Tea Revenue chart: plan list (Date, Estate, Plan ID) — matches UI
        if (plans && plans.length > 0) {
          plans.forEach((plan) => {
            detailRows.push({
              Date: plan.picked_date || reportDate,
              Estate: plan.estate_name || '',
              'Plan ID': plan.plan_id,
            });
          });
        }
      } else {
        // Planned vs Executed chart: plan → field rows — matches UI accordion
        if (plans && plans.length > 0) {
          plans.forEach((plan) => {
            (plan.fields || []).forEach((f) => {
              const planned = parseFloat(f.planned_area || 0);
              const sprayed = parseFloat(f.total_sprayed || 0);
              const completionPct = planned > 0
                ? ((sprayed / planned) * 100).toFixed(2)
                : '0.00';
              detailRows.push({
                Date: plan.picked_date || reportDate,
                'Plan ID': plan.plan_id,
                Estate: plan.estate_name || '',
                Field: f.field_name || '',
                'Planned (Ha)': planned.toFixed(2),
                'Covered Area (Ha)': sprayed.toFixed(2),
                'Completion (%)': completionPct,
                'Status': f.is_cancelled ? (f.reason_flag === 'h' ? 'Partially' : 'Cancelled') : 'Active',
                'Cancel Reason': f.is_cancelled && f.cancel_reason ? f.cancel_reason : '',
              });
            });
          });
        }
      }
      if (detailRows.length > 0) {
        const detailSheet = XLSX.utils.json_to_sheet(detailRows);
        XLSX.utils.book_append_sheet(workbook, detailSheet, isTeaRevenueChart ? 'Plans' : 'Fields');
      }

      const missionLabel =
        (missionType || 'spy') === 'spy' ? 'Spray' : 'Spread';
      const filename = `Chart_Details_${missionLabel}_${effectiveMonthName || effectiveMonth}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // No chart data passed via navigation or URL params
  if (!selectedChartData && !effectiveMonth) {
    return (
      <div className={containerClassName}>
        <div className="header-class-breakdown">
          <button
            className="back-btn-class-breakdown"
            onClick={backToDashboard}
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="title-class-breakdown">Chart Breakdown</h1>
        </div>
        <div className="content-class-breakdown">
          <p>No data available. Please select a chart bar to view details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {/* Header */}
      <div className="header-class-breakdown">
        <button
          className="back-btn-class-breakdown"
          onClick={backToDashboard}
        >
          <FaArrowLeft /> Back
        </button>
        <h1 className="title-class-breakdown">
          Chart Details - {effectiveMonthName || month}
        </h1>
      </div>

      <div className="content-class-breakdown">
        <div className="card-class-breakdown">
          <div className="card-header-class-breakdown">
            <h3 className="card-title-class-breakdown">
              Filters
            </h3>
          </div>
          <div className="card-body-class-breakdown">
            <div className="global-charts-filters-dataviewer">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                min={monthStart}
                max={monthEnd}
                className="global-filter-select-dataviewer"
                title="From date"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={monthStart}
                max={monthEnd}
                className="global-filter-select-dataviewer"
                title="To date"
              />
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedEstate('');
                }}
                className="global-filter-select-dataviewer"
              >
                <option value="">All Regions</option>
                {availableRegions.map((region) => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
              <select
                value={selectedEstate}
                onChange={(e) => setSelectedEstate(e.target.value)}
                className="global-filter-select-dataviewer"
              >
                <option value="">All Estates</option>
                {availableEstates.map((estate) => (
                  <option key={estate.id} value={estate.id}>{estate.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isInternalDashboard && !isTeaRevenueChart && (
          <BreakdownDailyPlannedVsExecutedChart
            plans={plans}
            missionType={missionType || 'spy'}
            dateFrom={dateFrom}
            dateTo={dateTo}
            isLoading={estatePlanLoading}
            isFetching={estatePlanFetching}
          />
        )}

        {/* Summary Metrics */}
        <div className="card-class-breakdown">
          <div className="card-header-class-breakdown">
            <h3 className="card-title-class-breakdown">
              Summary for {effectiveMonthName || month}
            </h3>
            <button
              type="button"
              className="plantation-chart-excel-btn"
              onClick={handleExportToExcel}
              disabled={isExporting}
              title="Export this month to Excel (Summary + Field-wise)"
            >
              {isExporting ? (
                <Bars height={18} width={18} color="#fff" />
              ) : (
                <FaFileExcel />
              )}
              <span>{isExporting ? 'Exporting...' : 'Excel'}</span>
            </button>
          </div>
          <div className="card-body-class-breakdown">
            <div className="metrics-grid-class-breakdown">
              {summaryData?.teaRevenueExtent !== undefined && (
                <div className="metric-card-class-breakdown">
                  <div className="metric-label-class-breakdown">
                    Tea Revenue Extent
                  </div>
                  <div className="metric-value-class-breakdown metric-info-class-breakdown">
                    {parseFloat(summaryData.teaRevenueExtent || 0).toFixed(
                      2
                    )}{' '}
                    Ha
                  </div>
                  <div className="metric-hint-class-breakdown">
                    Total Tea Revenue Extent
                  </div>
                </div>
              )}
              {summaryData?.plannedExtent !== undefined && (
                <div className="metric-card-class-breakdown">
                  <div className="metric-label-class-breakdown">
                    Planned Extent
                  </div>
                  <div className="metric-value-class-breakdown metric-primary-class-breakdown">
                    {parseFloat(summaryData.plannedExtent || 0).toFixed(2)}{' '}
                    Ha
                  </div>
                  <div className="metric-hint-class-breakdown">
                    Total Planned Extent for the month
                  </div>
                </div>
              )}
              {!isTeaRevenueChart && summaryData?.actualSprayedFieldsExtent !== undefined && (
                <div className="metric-card-class-breakdown">
                  <div className="metric-label-class-breakdown">
                    Executed Extent
                  </div>
                  <div className="metric-value-class-breakdown metric-success-class-breakdown">
                    {parseFloat(
                      summaryData.actualSprayedFieldsExtent || 0
                    ).toFixed(2)}{' '}
                    Ha
                  </div>
                  <div className="metric-hint-class-breakdown">
                    Executed Extent Summation
                  </div>
                </div>
              )}
              {!isTeaRevenueChart && summaryData?.sprayedExtent !== undefined && (
                <div className="metric-card-class-breakdown">
                  <div className="metric-label-class-breakdown">
                    Covered Area
                  </div>
                  <div className="metric-value-class-breakdown metric-info-class-breakdown">
                    {parseFloat(summaryData.sprayedExtent || 0).toFixed(2)}{' '}
                    Ha
                  </div>
                  <div className="metric-hint-class-breakdown">
                    Covered Area according to DJI
                  </div>
                </div>
              )}
              {!isTeaRevenueChart && summaryData?.canceledExtent > 0 && (
                <div className="metric-card-class-breakdown">
                  <div className="metric-label-class-breakdown">
                    Canceled Extent
                  </div>
                  <div className="metric-value-class-breakdown metric-danger-class-breakdown">
                    {parseFloat(summaryData.canceledExtent || 0).toFixed(
                      2
                    )}{' '}
                    Ha
                  </div>
                  <div className="metric-hint-class-breakdown">
                    See breakdown below
                  </div>
                </div>
              )}
              {!isTeaRevenueChart && summaryData?.actualSprayedFieldsExtent !== undefined &&
                summaryData?.sprayedExtent !== undefined && (
                  <div className="metric-card-class-breakdown">
                    <div className="metric-label-class-breakdown">
                      Completion Rate
                    </div>
                    <div className="metric-value-class-breakdown metric-secondary-class-breakdown">
                      {(summaryData.actualSprayedFieldsExtent - (summaryData.canceledExtent || 0)) > 0
                        ? (
                            (summaryData.sprayedExtent /
                              (summaryData.actualSprayedFieldsExtent - (summaryData.canceledExtent || 0))) *
                            100
                          ).toFixed(1)
                        : '0.0'}
                      %
                    </div>
                    <div className="metric-hint-class-breakdown">
                      Covered Area / (Executed Extent - Canceled Extent)
                    </div>
                  </div>
                )}
              {summaryData?.plannedExtent !== undefined &&
                summaryData?.teaRevenueExtent !== undefined && (
                  <div className="metric-card-class-breakdown">
                    <div className="metric-label-class-breakdown">
                      Planning Rate
                    </div>
                    <div className="metric-value-class-breakdown metric-secondary-class-breakdown">
                      {summaryData.teaRevenueExtent > 0
                        ? (
                            (summaryData.plannedExtent /
                              summaryData.teaRevenueExtent) *
                            100
                          ).toFixed(1)
                        : '0.0'}
                      %
                    </div>
                    <div className="metric-hint-class-breakdown">
                      Planned / Tea Revenue
                    </div>
                  </div>
                )}
              {summaryData?.sprayPlanCount !== undefined && (
                <div className="metric-card-class-breakdown">
                  <div className="metric-label-class-breakdown">
                    Spray Plans
                  </div>
                  <div className="metric-value-class-breakdown metric-primary-class-breakdown">
                    {summaryData.sprayPlanCount} ({(summaryData.sprayPlanCount * 15).toFixed(0)} Ha)
                  </div>
                  <div className="metric-hint-class-breakdown">
                    Planned spray plans (count x 15 Ha)
                  </div>
                </div>
              )}
              {summaryData?.spreadPlanCount !== undefined && (
                <div className="metric-card-class-breakdown">
                  <div className="metric-label-class-breakdown">
                    Spread Plans
                  </div>
                  <div className="metric-value-class-breakdown metric-secondary-class-breakdown">
                    {summaryData.spreadPlanCount} ({(summaryData.spreadPlanCount * 15).toFixed(0)} Ha)
                  </div>
                  <div className="metric-hint-class-breakdown">
                    Planned spread plans (count x 15 Ha)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estate Plans Accordion */}
        <div className="card-class-breakdown">
          <div className="card-header-class-breakdown">
            <h3 className="card-title-class-breakdown">
              Estate Plans - {effectiveMonthName || month}
            </h3>
            <span className="cbd-plan-count-badge">
              {plans.length} {plans.length === 1 ? 'Plan' : 'Plans'}
            </span>
          </div>
          <div className="card-body-class-breakdown" style={{ padding: 0 }}>
            {estatePlanLoading ? (
              <div className="cbd-accordion-loading">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="cbd-skeleton-row">
                    <div className="cbd-skeleton-bar" />
                  </div>
                ))}
              </div>
            ) : plans.length > 0 ? (
              <div className="cbd-accordion">
                {plans.map((plan) => {
                  const cancelledExtent = getPlanCancelledExtent(plan);
                  const nonCancelledTotal = Math.max(
                    parseFloat(plan.total_planned || 0) - cancelledExtent,
                    0
                  );
                  const pilotName =
                    plan.pilot_name ||
                    plan.pilotName ||
                    plan.assigned_pilot_name ||
                    plan.assignedPilotName ||
                    plan.pilot ||
                    'N/A';
                  const droneId =
                    plan.drone_id ||
                    plan.drone_tag ||
                    plan.droneTag ||
                    plan.droneId ||
                    plan.assigned_drone_id ||
                    plan.assignedDroneId ||
                    plan.drone_no ||
                    plan.droneNo ||
                    'N/A';
                  const completionBase = Math.max(
                    parseFloat(plan.actual_sprayed_fields_extent || 0) - cancelledExtent,
                    0
                  );
                  const isPlanExpanded = !!expandedPlans[plan.plan_id];
                  const completionRate = completionBase > 0
                      ? (
                          (plan.total_sprayed /
                            completionBase) *
                          100
                        ).toFixed(1)
                      : '0.0';

                  return (
                    <div
                      key={plan.plan_id}
                      className={`cbd-plan-item ${isPlanExpanded ? 'cbd-plan-item--expanded' : ''}`}
                    >
                      {/* Plan Row (Level 1) */}
                      <div
                        className="cbd-plan-header"
                        onClick={() => !isTeaRevenueChart && togglePlan(plan.plan_id)}
                        style={isTeaRevenueChart ? { cursor: 'default' } : {}}
                      >
                        {!isTeaRevenueChart && (
                          <div className="cbd-plan-chevron">
                            {isPlanExpanded ? (
                              <FaChevronDown />
                            ) : (
                              <FaChevronRight />
                            )}
                          </div>
                        )}
                        <div className="cbd-plan-info">
                          <span className="cbd-plan-estate">
                            <FaLeaf className="cbd-plan-icon" />
                            {plan.estate_name}
                          </span>
                          <span className="cbd-plan-meta">
                            <span className="cbd-plan-date">
                              <FaCalendarAlt className="cbd-plan-meta-icon" />
                              {formatDate(plan.picked_date)}
                            </span>
                            <span className="cbd-plan-id">
                              <FaHashtag className="cbd-plan-meta-icon" />
                              Plan {plan.plan_id}
                            </span>
                            {isInternalDashboard && (
                              <>
                                <span className="cbd-plan-id">
                                  Pilot: {pilotName}
                                </span>
                                <span className="cbd-plan-id">
                                  Drone ID: {droneId}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                        {!isTeaRevenueChart && (
                          <div className="cbd-plan-summary">
                            <span
                              className="cbd-plan-summary-item cbd-planned"
                              title="Total Planned Extent"
                            >
                              {plan.total_planned.toFixed(2)} Ha
                            </span>
                            <span
                              className="cbd-plan-summary-item cbd-info"
                              title="Executed Extent (Total Planned - Canceled)"
                            >{nonCancelledTotal.toFixed(2)} Ha
                            </span>
                            <span
                              className="cbd-plan-summary-item cbd-sprayed"
                              title="Completed Extent (Covered Area)"
                            >
                              {plan.total_sprayed.toFixed(2)} Ha
                            </span>
                            <span
                              className={`cbd-plan-summary-item cbd-rate ${
                                parseFloat(completionRate) >= 90
                                  ? 'cbd-rate--good'
                                  : parseFloat(completionRate) >= 50
                                  ? 'cbd-rate--mid'
                                  : 'cbd-rate--low'
                              }`}
                              title="Percentage (Completed Extent / Executed Extent)"
                            >
                              {completionRate}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Fields (Level 2) - shown when plan is expanded (only for Planned vs Executed chart) */}
                      {!isTeaRevenueChart && isPlanExpanded && (
                        <div className="cbd-fields-container">
                          {plan.fields && plan.fields.length > 0 ? (
                            getSortedFields(plan.fields).map((field) => {
                              const fieldKey = `${plan.plan_id}-${field.field_id}`;
                              const isFieldExpanded =
                                !!expandedFields[fieldKey];
                              const fieldCompletion =
                                field.planned_area > 0
                                  ? (
                                      (field.total_sprayed /
                                        field.planned_area) *
                                      100
                                    ).toFixed(1)
                                  : '0.0';

                              return (
                                <div
                                  key={fieldKey}
                                  className={`cbd-field-item ${isFieldExpanded ? 'cbd-field-item--expanded' : ''} ${field.is_cancelled ? (field.reason_flag === 'h' ? 'cbd-field-item--partial' : 'cbd-field-item--cancelled') : ''}`}
                                >
                                  {/* Field Row */}
                                  <div
                                    className={`cbd-field-header ${field.is_cancelled ? (field.reason_flag === 'h' ? 'cbd-field-header--partial' : 'cbd-field-header--cancelled') : ''}`}
                                    onClick={() =>
                                      toggleField(
                                        plan.plan_id,
                                        field.field_id
                                      )
                                    }
                                  >
                                    <div className="cbd-field-chevron">
                                      {isFieldExpanded ? (
                                        <FaChevronDown />
                                      ) : (
                                        <FaChevronRight />
                                      )}
                                    </div>
                                    <span className={`cbd-field-name ${field.is_cancelled ? (field.reason_flag === 'h' ? 'cbd-field-name--partial' : 'cbd-field-name--cancelled') : ''}`}>
                                      {field.field_name}
                                      {field.is_cancelled && (
                                        <span className={`cbd-cancelled-badge ${field.reason_flag === 'h' ? 'cbd-cancelled-badge--partial' : ''}`}>
                                          {field.reason_flag === 'h' ? 'Partially' : 'Cancelled'}
                                        </span>
                                      )}
                                    </span>
                                    <span className="cbd-field-area">
                                      {parseFloat(
                                        field.field_area || 0
                                      ).toFixed(2)}{' '}
                                      Ha
                                    </span>
                                  </div>

                                  {/* Field Details (Level 3) */}
                                  {isFieldExpanded && (
                                    <div className="cbd-field-details">
                                      <div className="cbd-field-metrics">
                                        <div className="cbd-field-metric">
                                          <span className="cbd-field-metric-label">
                                            Field Area
                                          </span>
                                          <span className="cbd-field-metric-value cbd-metric-primary">
                                            {parseFloat(
                                              field.field_area || 0
                                            ).toFixed(2)}{' '}
                                            Ha
                                          </span>
                                        </div>
                                        <div className="cbd-field-metric">
                                          <span className="cbd-field-metric-label">
                                            Planned
                                          </span>
                                          <span className="cbd-field-metric-value cbd-metric-info">
                                            {parseFloat(
                                              field.planned_area || 0
                                            ).toFixed(2)}{' '}
                                            Ha
                                          </span>
                                        </div>
                                        <div className="cbd-field-metric">
                                          <span className="cbd-field-metric-label">
                                            Covered Area
                                          </span>
                                          <span className="cbd-field-metric-value cbd-metric-success">
                                            {parseFloat(
                                              field.total_sprayed || 0
                                            ).toFixed(2)}{' '}
                                            Ha
                                          </span>
                                        </div>
                                        <div className="cbd-field-metric">
                                          <span className="cbd-field-metric-label">
                                            Completion
                                          </span>
                                          <span
                                            className={`cbd-field-metric-value ${
                                              parseFloat(fieldCompletion) >= 90
                                                ? 'cbd-metric-good'
                                                : parseFloat(fieldCompletion) >=
                                                  50
                                                ? 'cbd-metric-mid'
                                                : 'cbd-metric-low'
                                            }`}
                                          >
                                            {fieldCompletion}%
                                          </span>
                                        </div>
                                      </div>
                                      {/* Cancel reason */}
                                      {field.is_cancelled && (
                                        <div className={`cbd-field-cancel-info ${field.reason_flag === 'h' ? 'cbd-field-cancel-info--partial' : ''}`}>
                                          <FaTimesCircle className="cbd-cancel-icon" />
                                          <span>{field.reason_flag === 'h' ? 'Partially' : 'Cancelled'}{field.cancel_reason ? `: ${field.cancel_reason}` : ''}</span>
                                        </div>
                                      )}
                                      {/* Progress bar */}
                                      <div className={`cbd-field-progress ${field.is_cancelled ? (field.reason_flag === 'h' ? 'cbd-field-progress--partial' : 'cbd-field-progress--cancelled') : ''}`}>
                                        <div
                                          className={`cbd-field-progress-fill ${field.is_cancelled ? (field.reason_flag === 'h' ? 'cbd-field-progress-fill--partial' : 'cbd-field-progress-fill--cancelled') : ''}`}
                                          style={{
                                            width: `${Math.min(
                                              parseFloat(fieldCompletion),
                                              100
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                      {/* View Map button */}
                                      {field.view_map_url && (
                                        <button
                                          type="button"
                                          className="cbd-view-map-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openMapPopup(field.view_map_url, field.field_name);
                                          }}
                                        >
                                          <FaMapMarkedAlt /> View Map
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="cbd-no-fields">
                              No fields data for this plan
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-class-breakdown">
                No estate plans data for {effectiveMonthName || month}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Image Popup */}
      {mapPopup && (
        <MapImagePopup
          url={mapPopup.url}
          fieldName={mapPopup.fieldName}
          onClose={closeMapPopup}
        />
      )}
    </div>
  );
};

/* =====================================================
   MAP IMAGE POPUP COMPONENT
   ===================================================== */
const MapImagePopup = ({ url, fieldName, onClose }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="cbd-map-overlay" onClick={onClose}>
      <div className="cbd-map-popup" onClick={(e) => e.stopPropagation()}>
        {/* Popup Header */}
        <div className="cbd-map-popup-header">
          <div className="cbd-map-popup-title">
            <FaMapMarkedAlt />
            <span>{fieldName || 'Field Map'}</span>
          </div>
          <div className="cbd-map-popup-actions">
            <button
              className="cbd-map-zoom-btn"
              onClick={handleZoomOut}
              title="Zoom out"
              disabled={zoom <= 0.5}
            >
              <FaSearchMinus />
            </button>
            <span className="cbd-map-zoom-label">{Math.round(zoom * 100)}%</span>
            <button
              className="cbd-map-zoom-btn"
              onClick={handleZoomIn}
              title="Zoom in"
              disabled={zoom >= 3}
            >
              <FaSearchPlus />
            </button>
            <button
              className="cbd-map-zoom-btn"
              onClick={handleResetZoom}
              title="Reset zoom"
            >
              <FaExpand />
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="cbd-map-zoom-btn"
              title="Open in new tab"
            >
              <FaExternalLinkAlt />
            </a>
            <button className="cbd-map-close-btn" onClick={onClose} title="Close">
              <FaTimes />
            </button>
          </div>
        </div>
        {/* Popup Body */}
        <div className="cbd-map-popup-body">
          {!imgLoaded && !imgError && (
            <div className="cbd-map-loading">
              <div className="cbd-map-spinner" />
              <span>Loading map...</span>
            </div>
          )}
          {imgError && (
            <div className="cbd-map-error">
              <span>Failed to load map image</span>
              <a href={url} target="_blank" rel="noopener noreferrer" className="cbd-map-error-link">
                Open image URL directly
              </a>
            </div>
          )}
          <img
            src={url}
            alt={`Map - ${fieldName}`}
            className="cbd-map-image"
            style={{
              transform: `scale(${zoom})`,
              display: imgError ? 'none' : 'block',
              opacity: imgLoaded ? 1 : 0,
            }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartBreakdownPage;
