import React, { useState, useMemo } from 'react';
import '../../../styles/dataviewer.css';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import ReportPart1 from '../charts/PlanAreasSimplifiedReport';
import ReportPart2 from '../charts/CoveredAreasReport';
import ReportPart3 from '../charts/PilotPerformanceOpsReport';
import ReportPart4 from '../charts/TeamLeadAssignmentReport';
import ReportPart5 from '../charts/PilotSummaryReport';
import ReportPart6 from '../charts/FlightNumbersReport';
import ReportPart7 from '../charts/PilotPerformancePilotReport';
import GlobalTeaRevenueVsPlannedChart from '../charts/GlobalTeaRevenueVsPlannedChart';
import GlobalPlannedVsExecutedChart from '../charts/GlobalPlannedVsExecutedChart';
import { useGetPlantationsListQuery, useGetEstatesListQuery } from '../../../api/services NodeJs/plantationDashboardApi';
import { enCA } from 'date-fns/locale';
import { format, subMonths } from 'date-fns';

const DataViewer = ({ basePath = '/home/dataViewer', variant = 'external' } = {}) => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const [showPicker, setShowPicker] = useState(false);

  const now = new Date();
  const [globalStartMonth, setGlobalStartMonth] = useState(format(subMonths(now, 5), 'yyyy-MM'));
  const [globalEndMonth, setGlobalEndMonth] = useState(format(now, 'yyyy-MM'));

  const globalMonthCount = useMemo(() => {
    const [sy, sm] = globalStartMonth.split('-').map(Number);
    const [ey, em] = globalEndMonth.split('-').map(Number);
    return (ey - sy) * 12 + (em - sm) + 1;
  }, [globalStartMonth, globalEndMonth]);

  const [selectedPlantation, setSelectedPlantation] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedEstate, setSelectedEstate] = useState('');

  const { data: plantationsData } = useGetPlantationsListQuery();
  const { data: estatesData } = useGetEstatesListQuery(selectedPlantation || undefined);

  const plantations = useMemo(() => plantationsData?.data || [], [plantationsData]);
  const estates = useMemo(() => estatesData?.data || [], [estatesData]);
  const regions = useMemo(() => {
    const regionMap = new Map();
    estates.forEach((estate) => {
      const regionId = estate.region;
      if (!regionId) return;
      if (!regionMap.has(String(regionId))) {
        regionMap.set(String(regionId), {
          id: String(regionId),
          name: estate.region_name || `Region ${regionId}`,
        });
      }
    });
    return Array.from(regionMap.values());
  }, [estates]);

  const filteredEstates = useMemo(() => {
    if (!selectedRegion) return estates;
    return estates.filter((estate) => String(estate.region) === String(selectedRegion));
  }, [estates, selectedRegion]);

  const handlePlantationChange = (e) => {
    setSelectedPlantation(e.target.value);
    setSelectedRegion('');
    setSelectedEstate('');
  };

  const globalFilterLabel = useMemo(() => {
    if (selectedEstate) {
      const est = filteredEstates.find(e => String(e.id) === String(selectedEstate));
      return est ? est.estate : 'Selected Estate';
    }
    if (selectedRegion) {
      const reg = regions.find((r) => String(r.id) === String(selectedRegion));
      return reg ? reg.name : 'Selected Region';
    }
    if (selectedPlantation) {
      const pl = plantations.find(p => String(p.id) === String(selectedPlantation));
      return pl ? pl.plantation : 'Selected Plantation';
    }
    return 'All Estates';
  }, [selectedPlantation, selectedRegion, selectedEstate, plantations, filteredEstates, regions]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const formattedDateRange = {
    startDate: dateRange[0].startDate.toLocaleDateString('en-CA'),
    endDate: dateRange[0].endDate.toLocaleDateString('en-CA'),
  };

  // Format date for display (e.g., "Jun 1 - Jun 7, 2023")
  const formatDateDisplay = (start, end) => {
    const startFormat = format(start, 'MMM d');
    let endFormat = format(end, 'MMM d');
    
    // Add year if dates are in different years
    if (start.getFullYear() !== end.getFullYear()) {
      endFormat += `, ${end.getFullYear()}`;
    }
    
    // Add year to end if same year but different month
    if (start.getMonth() !== end.getMonth() && start.getFullYear() === end.getFullYear()) {
      endFormat += `, ${end.getFullYear()}`;
    }
    
    // Add year to both if same year and same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startFormat} - ${endFormat}, ${end.getFullYear()}`;
    }
    
    return `${startFormat} - ${endFormat}`;
  };

  const parts = [
    { id: 1, title: 'Plan Areas', component: <ReportPart1 dateRange={formattedDateRange} /> },
    { id: 2, title: 'Covered Areas', component: <ReportPart2 dateRange={formattedDateRange} /> },
    { id: 3, title: 'Pilot Summary', component: <ReportPart5 dateRange={formattedDateRange} /> },
    { id: 4, title: 'Team Lead Assignment', component: <ReportPart4 dateRange={formattedDateRange} /> },
    { id: 5, title: 'Pilot Performance (Ops)', component: <ReportPart3 dateRange={formattedDateRange} /> },
    { id: 6, title: 'Pilot Performance (Pilot)', component: <ReportPart7 dateRange={formattedDateRange} /> },
  ];

  return (
    <div className="container-dataviewer">
      {/* Plantation Overview Section */}
      <div className="global-charts-section-dataviewer">
        <div className="global-charts-header-dataviewer">
          <h2 className="global-charts-title-dataviewer">Plantation Overview — {globalFilterLabel}</h2>
          <div className="global-charts-controls-dataviewer">
            <div className="global-charts-filters-dataviewer">
              <select
                value={selectedPlantation}
                onChange={handlePlantationChange}
                className="global-filter-select-dataviewer"
                data-testid="filter-plantation"
              >
                <option value="">All Plantations</option>
                {plantations.map((p) => (
                  <option key={p.id} value={p.id}>{p.plantation}</option>
                ))}
              </select>
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedEstate('');
                }}
                className="global-filter-select-dataviewer"
                data-testid="filter-region"
              >
                <option value="">All Regions</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <select
                value={selectedEstate}
                onChange={(e) => setSelectedEstate(e.target.value)}
                className="global-filter-select-dataviewer"
                data-testid="filter-estate"
              >
                <option value="">All Estates</option>
                {filteredEstates.map((e) => (
                  <option key={e.id} value={e.id}>{e.estate}</option>
                ))}
              </select>
            </div>
            <div className="global-charts-month-picker-dataviewer">
              <label>From</label>
              <input
                type="month"
                value={globalStartMonth}
                onChange={(e) => setGlobalStartMonth(e.target.value)}
                max={globalEndMonth}
                className="month-input-dataviewer"
                data-testid="month-start"
              />
              <label>To</label>
              <input
                type="month"
                value={globalEndMonth}
                onChange={(e) => setGlobalEndMonth(e.target.value)}
                min={globalStartMonth}
                className="month-input-dataviewer"
                data-testid="month-end"
              />
            </div>
          </div>
        </div>
        <div className="grid-container-dataviewer" data-testid="global-charts-grid">
          <div className="grid-item-dataviewer" data-testid="chart-tea-revenue">
            <div className="chart-card">
              <GlobalTeaRevenueVsPlannedChart
                startMonth={globalStartMonth}
                endMonth={globalEndMonth}
                months={globalMonthCount}
                plantationId={selectedPlantation}
                regionId={selectedRegion}
                estateId={selectedEstate}
                basePath={basePath}
              />
            </div>
          </div>
          <div className="grid-item-dataviewer" data-testid="chart-planned-vs-executed">
            <div className="chart-card">
              <GlobalPlannedVsExecutedChart
                startMonth={globalStartMonth}
                endMonth={globalEndMonth}
                months={globalMonthCount}
                plantationId={selectedPlantation}
                regionId={selectedRegion}
                estateId={selectedEstate}
                basePath={basePath}
              />
            </div>
          </div>
        </div>
      </div>

      {variant !== 'internal' && (
        <>
          {/* Date Picker Section */}
          <div className="dataviewer-header">
            <h2 className="global-charts-title-dataviewer">Operational Reports</h2>
            <button
              className="toggle-picker-button"
              onClick={() => setShowPicker((prev) => !prev)}
            >
              {showPicker
                ? '✕ Close Calendar'
                : `📅 ${formatDateDisplay(dateRange[0].startDate, dateRange[0].endDate)}`
              }
            </button>
          </div>
          {showPicker && (
            <div className="date-set-dataview">
              <DateRangePicker
                onChange={handleSelect}
                ranges={dateRange}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={2}
                direction="horizontal"
                locale={enCA}
              />
            </div>
          )}

          {/* Main Charts Grid - 2 per row */}
          <div className="grid-container-dataviewer">
            {parts.map((part) => (
              <div key={part.id} className="grid-item-dataviewer">
                <div className="chart-card">
                  {React.cloneElement(part.component, { dateRange: formattedDateRange })}
                </div>
              </div>
            ))}
          </div>

          {/* Number of Flights - Full Width at Bottom */}
          <div className="flight-numbers-container">
            <div className="chart-card">
              <ReportPart6 dateRange={formattedDateRange} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DataViewer;