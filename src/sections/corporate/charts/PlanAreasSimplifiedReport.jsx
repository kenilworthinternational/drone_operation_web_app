import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList
} from 'recharts';
import '../../../styles/reportpart1.css';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchChartAllDataGroup,
  fetchChartGroupDataGroup,
  fetchChartPlantationDataGroup,
  fetchChartRegionDataGroup,
  selectReportFilter,
  setReportFilter,
} from '../../../store/slices/reportsSlice';
import { Bars } from 'react-loader-spinner';
import * as XLSX from 'xlsx';

const ReportPart1 = ({ dateRange }) => {
  const dispatch = useAppDispatch();
  
  const [groupData, setGroupData] = useState([]);
  const [plantationData, setPlantationData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [estateData, setEstateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlantation, setLoadingPlantation] = useState(false);
  const [loadingRegion, setLoadingRegion] = useState(false);
  const [loadingEstate, setLoadingEstate] = useState(false);
  const [error, setError] = useState(null);
  
  // Get filters from Redux
  const selectedGroup = useAppSelector((state) => selectReportFilter(state, 'selectedGroup'));
  const selectedPlantation = useAppSelector((state) => selectReportFilter(state, 'selectedPlantation'));
  const selectedRegion = useAppSelector((state) => selectReportFilter(state, 'selectedRegion'));
  const selectedType = useAppSelector((state) => selectReportFilter(state, 'selectedType'));

  // Wrap long labels into up to two lines with ellipsis
  const wrapLabel = useCallback((text, maxCharsPerLine = 12, maxLines = 2) => {
    const words = String(text || '').split(' ');
    const lines = [];
    let current = '';
    words.forEach((w) => {
      const next = current ? `${current} ${w}` : w;
      if (next.length > maxCharsPerLine) {
        if (current) lines.push(current);
        current = w;
      } else {
        current = next;
      }
    });
    if (current) lines.push(current);
    let truncated = false;
    if (lines.length > maxLines) {
      truncated = true;
      lines.length = maxLines;
    }
    if (truncated) {
      const lastIdx = lines.length - 1;
      if (lastIdx >= 0) lines[lastIdx] = `${lines[lastIdx].slice(0, maxCharsPerLine - 1)}…`;
    }
    return lines;
  }, []);

  const CustomizedAxisTick = (props) => {
    const { x, y, payload } = props;
    const lines = wrapLabel(payload?.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={16} textAnchor="middle" fill="#4a5568" fontSize={14}>
          {lines.map((line, idx) => (
            <tspan key={idx} x={0} dy={idx === 0 ? 0 : 14}>{line}</tspan>
          ))}
        </text>
      </g>
    );
  };

  // Helper function to process data based on selected type
  const processData = (data, type) => {
    return data.map(item => {
      let fieldArea, totalPlan, canceledByTeamLead;
      if (type === 'All') {
        fieldArea = item.field_area_ops_room;
        totalPlan = (item.total_plan_ha || 0) - (item.cancel_fields_in_plans_by_manager_ha || 0);
        canceledByTeamLead = item.cancel_fields_in_plans_by_team_lead_ha;
      } else if (type === 'Spread') {
        fieldArea = item.spd_field_area_ops_room;
        totalPlan = (item.total_plan_ha_spd || 0) - (item.cancel_fields_in_plans_by_manager_spd_ha || 0);
        canceledByTeamLead = item.cancel_fields_in_plans_by_team_lead_spd_ha;
      } else if (type === 'Spray') {
        fieldArea = item.spy_field_area_ops_room;
        totalPlan = (item.total_plan_ha_spy || 0) - (item.cancel_fields_in_plans_by_manager_spy_ha || 0);
        canceledByTeamLead = item.cancel_fields_in_plans_by_team_lead_spy_ha;
      }
      return {
        ...item,
        fieldArea: fieldArea || 0,
        totalPlan: totalPlan || 0,
        canceledByTeamLead: canceledByTeamLead || 0,
        remaining_ha: Math.max(0, (totalPlan || 0) - (fieldArea || 0) - (canceledByTeamLead || 0))
      };
    }).filter(item => item.totalPlan > 0);
  };

  // Memoized processed data
  const processedGroupData = useMemo(() => processData(groupData, selectedType), [groupData, selectedType]);
  const processedPlantationData = useMemo(() => processData(plantationData, selectedType), [plantationData, selectedType]);
  const processedRegionData = useMemo(() => processData(regionData, selectedType), [regionData, selectedType]);
  const processedEstateData = useMemo(() => processData(estateData, selectedType), [estateData, selectedType]);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          <p className="label"><strong>{label}</strong></p>
          <p style={{ fontWeight: 'bold' }}>
            Total Plan Area: {Number(data.totalPlan).toFixed(2)} Ha
          </p>
          <p style={{ color: '#2c5282' }}>
            Remaining Plan Area: {Number(data.remaining_ha).toFixed(2)} Ha
          </p>
          <p style={{ color: '#48bb78' }}>
            Field Area Completed: {Number(data.fieldArea).toFixed(2)} Ha
          </p>
          <p style={{ color: '#f56565' }}>
            Team Lead Canceled: {Number(data.canceledByTeamLead).toFixed(2)} Ha
          </p>
        </div>
      );
    }
    return null;
  };

  // Function to handle Excel download
  const handleExportToExcel = (data, viewName) => {
    if (!data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    // Prepare data for Excel
    const exportData = data.map(item => ({
      Name: item.group_name || item.plantation_name || item.region_name || item.estate_name,
      'Total Plan Area (Ha)': item.totalPlan ? Number(item.totalPlan).toFixed(2) : 0,
      'Field Area Completed (Ha)': item.fieldArea ? Number(item.fieldArea).toFixed(2) : 0,
      'Team Lead Canceled (Ha)': item.canceledByTeamLead ? Number(item.canceledByTeamLead).toFixed(2) : 0,
      'Remaining Plan Area (Ha)': item.remaining_ha ? Number(item.remaining_ha).toFixed(2) : 0,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${viewName} Stats`);

    // Generate Excel file and trigger download
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    XLSX.writeFile(workbook, `${viewName}_Plan_Areas_${selectedType}_${formatDate(dateRange.startDate)}_to_${formatDate(dateRange.endDate)}.xlsx`);
  };

  // Fetch group data
  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      };
      const result = await dispatch(fetchChartAllDataGroup({ payload, reportName: 'planAreasSimplifiedReport' }));
      if (!fetchChartAllDataGroup.fulfilled.match(result)) {
        throw new Error('Failed to fetch group data');
      }
      const response = result.payload.data;
      if (response.status === "true" && response.groups) {
        if (response.groups.length === 0) {
          setError('No group data available for the selected date range');
        } else {
          setGroupData(response.groups);
        }
      } else {
        setError('No group data available for the selected date range');
      }
    } catch (err) {
      setError('Failed to fetch group data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // Fetch plantation data
  const fetchPlantationData = useCallback(async (groupId) => {
    try {
      setLoadingPlantation(true);
      setError(null);
      const payload = {
        group_id: groupId,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      };
      const result = await dispatch(fetchChartGroupDataGroup({ payload, reportName: 'planAreasSimplifiedReport' }));
      if (!fetchChartGroupDataGroup.fulfilled.match(result)) {
        throw new Error('Failed to fetch plantation data');
      }
      const response = result.payload.data;
      if (response.status === "true" && response.plantation) {
        if (response.plantation.length === 0) {
          setError('No plantation data available for the selected date range');
        } else {
          setPlantationData(response.plantation);
        }
      } else {
        setError('No plantation data available for the selected date range');
      }
    } catch (err) {
      setError('Failed to fetch plantation data');
      console.error('API Error:', err);
    } finally {
      setLoadingPlantation(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // Fetch region data
  const fetchRegionData = useCallback(async (plantationId) => {
    try {
      setLoadingRegion(true);
      setError(null);
      const payload = {
        plantation_id: plantationId,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      };
      const result = await dispatch(fetchChartPlantationDataGroup({ payload, reportName: 'planAreasSimplifiedReport' }));
      if (!fetchChartPlantationDataGroup.fulfilled.match(result)) {
        throw new Error('Failed to fetch region data');
      }
      const response = result.payload.data;
      if (response.status === "true" && response.region) {
        if (response.region.length === 0) {
          setError('No region data available for the selected date range');
        } else {
          setRegionData(response.region);
        }
      } else {
        setError('No region data available for the selected date range');
      }
    } catch (err) {
      setError('Failed to fetch region data');
      console.error('API Error:', err);
    } finally {
      setLoadingRegion(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // Fetch estate data
  const fetchEstateData = useCallback(async (regionId) => {
    try {
      setLoadingEstate(true);
      setError(null);
      const payload = {
        region_id: regionId,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      };
      const result = await dispatch(fetchChartRegionDataGroup({ payload, reportName: 'planAreasSimplifiedReport' }));
      if (!fetchChartRegionDataGroup.fulfilled.match(result)) {
        throw new Error('Failed to fetch estate data');
      }
      const response = result.payload.data;
      if (response.status === "true" && response.estate) {
        if (response.estate.length === 0) {
          setError('No estate data available for the selected date range');
        } else {
          setEstateData(response.estate);
        }
      } else {
        setError('No estate data available for the selected date range');
      }
    } catch (err) {
      setError('Failed to fetch estate data');
      console.error('API Error:', err);
    } finally {
      setLoadingEstate(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // Handle bar clicks
  const handleGroupBarClick = (data) => {
    if (data && data.group_id) {
      dispatch(setReportFilter({ filterName: 'selectedGroup', value: { id: data.group_id, name: data.group_name } }));
      setPlantationData([]);
      setRegionData([]);
      setEstateData([]);
      dispatch(setReportFilter({ filterName: 'selectedPlantation', value: null }));
      dispatch(setReportFilter({ filterName: 'selectedRegion', value: null }));
      fetchPlantationData(data.group_id);
    }
  };

  const handlePlantationBarClick = (data) => {
    if (data && data.plantation_id) {
      dispatch(setReportFilter({ filterName: 'selectedPlantation', value: { id: data.plantation_id, name: data.plantation_name } }));
      setRegionData([]);
      setEstateData([]);
      dispatch(setReportFilter({ filterName: 'selectedRegion', value: null }));
      fetchRegionData(data.plantation_id);
    }
  };

  const handleRegionBarClick = (data) => {
    if (data && data.region_id) {
      dispatch(setReportFilter({ filterName: 'selectedRegion', value: { id: data.region_id, name: data.region_name } }));
      setEstateData([]);
      fetchEstateData(data.region_id);
    }
  };

  // Handle navigation back
  const handleBackToGroups = () => {
    dispatch(setReportFilter({ filterName: 'selectedGroup', value: null }));
    dispatch(setReportFilter({ filterName: 'selectedPlantation', value: null }));
    dispatch(setReportFilter({ filterName: 'selectedRegion', value: null }));
    setPlantationData([]);
    setRegionData([]);
    setEstateData([]);
  };

  const handleBackToPlantations = () => {
    dispatch(setReportFilter({ filterName: 'selectedPlantation', value: null }));
    dispatch(setReportFilter({ filterName: 'selectedRegion', value: null }));
    setRegionData([]);
    setEstateData([]);
  };

  const handleBackToRegions = () => {
    dispatch(setReportFilter({ filterName: 'selectedRegion', value: null }));
    setEstateData([]);
  };

  // Fetch group data on mount and date range change
  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  // Reset selections when date range changes
  useEffect(() => {
    dispatch(setReportFilter({ filterName: 'selectedGroup', value: null }));
    dispatch(setReportFilter({ filterName: 'selectedPlantation', value: null }));
    dispatch(setReportFilter({ filterName: 'selectedRegion', value: null }));
    setPlantationData([]);
    setRegionData([]);
    setEstateData([]);
  }, [dateRange.startDate, dateRange.endDate, dispatch]);

  if (loading) return (
    <div className="report-part1 loading">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Bars
          height="80"
          width="80"
          color="#004B71"
          ariaLabel="bars-loading"
          visible={true}
        />
      </div>
    </div>
  );
  if (error) return <div className="report-part1 error">{error}</div>;

  return (
    <div className="report-part1">
      <div className="type-selector">
        <label htmlFor="type-select">Select Type: </label>
        <select
          id="type-select"
          value={selectedType}
          onChange={(e) => dispatch(setReportFilter({ filterName: 'selectedType', value: e.target.value }))}
        >
          <option value="All">All</option>
          <option value="Spread">Spread</option>
          <option value="Spray">Spray</option>
        </select>
      </div>
      {selectedRegion ? (
        // Estate View
        <div className="chart-container">
          <div className="chart-header">
            <button className="back-button" onClick={handleBackToRegions}>
              ← Back to Regions
            </button>
            <h2 
              className="chart-title"
              style={{ cursor: 'pointer' }}
              onClick={() => handleExportToExcel(processedEstateData, 'Estate')}
              title="Click to download as Excel"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleExportToExcel(processedEstateData, 'Estate')}
            >
              Estate Plan Areas for {selectedRegion.name} ({selectedType})
            </h2>
          </div>
          {loadingEstate ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <Bars
                height="80"
                width="80"
                color="#4180B9"
                ariaLabel="bars-loading"
                visible={true}
              />
            </div>
          ) : processedEstateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={processedEstateData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="estate_name"
                  label={{ value: 'Estates', position: 'insideBottom', offset: -10, fill: '#4a5568' }}
                  interval={0}
                  tickMargin={10}
                  height={60}
                  tick={<CustomizedAxisTick />}
                />
                <YAxis
                  label={{ angle: -90, position: 'insideLeft', fill: '#4a5568' }}
                  tick={{ fill: '#4a5568', fontSize: 14 }}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="fieldArea"
                  name="Field Area Completed (Ha)"
                  fill="#48bb78"
                  stackId="a"
                  barSize={30}
                />
                <Bar
                  dataKey="canceledByTeamLead"
                  name="Team Lead Canceled (Ha)"
                  fill="#f56565"
                  stackId="a"
                  barSize={30}
                />
                <Bar
                  dataKey="remaining_ha"
                  name="Remaining Plan Area (Ha)"
                  fill="#2c5282"
                  stackId="a"
                  barSize={30}
                >
                  <LabelList
                    dataKey="totalPlan"
                    position="top"
                    formatter={(value) => `${Number(value).toFixed(2)} ha`}
                    style={{ fill: '#4a5568', fontSize: 14, fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No estate data available</div>
          )}
        </div>
      ) : selectedPlantation ? (
        // Region View
        <div className="chart-container">
          <div className="chart-header">
            <button className="back-button" onClick={handleBackToPlantations}>
              ← Back to Plantations
            </button>
            <h2 
              className="chart-title"
              style={{ cursor: 'pointer' }}
              onClick={() => handleExportToExcel(processedRegionData, 'Region')}
              title="Click to download as Excel"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleExportToExcel(processedRegionData, 'Region')}
            >
              Region Plan Areas for {selectedPlantation.name} ({selectedType})
            </h2>
          </div>
          {loadingRegion ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <Bars
                height="80"
                width="80"
                color="#4180B9"
                ariaLabel="bars-loading"
                visible={true}
              />
            </div>
          ) : processedRegionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={processedRegionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    handleRegionBarClick(data.activePayload[0].payload);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="region_name"
                  label={{ value: 'Regions', position: 'insideBottom', offset: -10, fill: '#4a5568' }}
                  interval={0}
                  tickMargin={10}
                  height={60}
                  tick={<CustomizedAxisTick />}
                />
                <YAxis
                  label={{ angle: -90, position: 'insideLeft', fill: '#4a5568' }}
                  tick={{ fill: '#4a5568', fontSize: 14 }}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="fieldArea"
                  name="Field Area Completed (Ha)"
                  fill="#48bb78"
                  stackId="a"
                  barSize={30}
                />
                <Bar
                  dataKey="canceledByTeamLead"
                  name="Team Lead Canceled (Ha)"
                  fill="#f56565"
                  stackId="a"
                  barSize={30}
                />
                <Bar
                  dataKey="remaining_ha"
                  name="Remaining Plan Area (Ha)"
                  fill="#2c5282"
                  stackId="a"
                  barSize={30}
                >
                  <LabelList
                    dataKey="totalPlan"
                    position="top"
                    formatter={(value) => `${Number(value).toFixed(2)} ha`}
                    style={{ fill: '#4a5568', fontSize: 14, fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No region data available</div>
          )}
        </div>
      ) : selectedGroup ? (
        // Plantation View
        <div className="chart-container">
          <div className="chart-header">
            <button className="back-button" onClick={handleBackToGroups}>
              ← Back to Groups
            </button>
            <h2 
              className="chart-title"
              style={{ cursor: 'pointer' }}
              onClick={() => handleExportToExcel(processedPlantationData, 'Plantation')}
              title="Click to download as Excel"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleExportToExcel(processedPlantationData, 'Plantation')}
            >
              Plantation Plan Areas for {selectedGroup.name} ({selectedType})
            </h2>
          </div>
          {loadingPlantation ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <Bars
                height="80"
                width="80"
                color="#4180B9"
                ariaLabel="bars-loading"
                visible={true}
              />
            </div>
          ) : processedPlantationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={processedPlantationData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    handlePlantationBarClick(data.activePayload[0].payload);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="plantation_name"
                  label={{ value: 'Plantations', position: 'insideBottom', offset: -10, fill: '#4a5568' }}
                  interval={0}
                  tickMargin={10}
                  height={60}
                  tick={<CustomizedAxisTick />}
                />
                <YAxis
                  label={{ angle: -90, position: 'insideLeft', fill: '#4a5568' }}
                  tick={{ fill: '#4a5568', fontSize: 14 }}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="fieldArea"
                  name="Field Area Completed (Ha)"
                  fill="#48bb78"
                  stackId="a"
                  barSize={30}
                />
                <Bar
                  dataKey="canceledByTeamLead"
                  name="Team Lead Canceled (Ha)"
                  fill="#f56565"
                  stackId="a"
                  barSize={30}
                />
                <Bar
                  dataKey="remaining_ha"
                  name="Remaining Plan Area (Ha)"
                  fill="#2c5282"
                  stackId="a"
                  barSize={30}
                >
                  <LabelList
                    dataKey="totalPlan"
                    position="top"
                    formatter={(value) => `${Number(value).toFixed(2)} ha`}
                    style={{ fill: '#4a5568', fontSize: 14, fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No plantation data available</div>
          )}
        </div>
      ) : (
        // Group View
        <div className="chart-container">
          <h2 
            className="chart-title"
            style={{ cursor: 'pointer' }}
            onClick={() => handleExportToExcel(processedGroupData, 'Group')}
            title="Click to download as Excel"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleExportToExcel(processedGroupData, 'Group')}
          >
            Group Plan Areas ({selectedType})
          </h2>
          {processedGroupData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={processedGroupData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    handleGroupBarClick(data.activePayload[0].payload);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="group_name"
                  label={{ value: 'Groups', position: 'insideBottom', offset: -10, fill: '#4a5568' }}
                  interval={0}
                  tickMargin={10}
                  height={60}
                  tick={<CustomizedAxisTick />}
                />
                <YAxis
                  label={{ angle: -90, position: 'insideLeft', fill: '#4a5568' }}
                  tick={{ fill: '#4a5568', fontSize: 14 }}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ paddingBottom: 50 }}  // Adds space below legend
                />
                <Bar
                  dataKey="fieldArea"
                  name="Field Area Completed (Ha)"
                  fill="#48bb78"
                  stackId="a"
                  barSize={30}
                />
                <Bar
                  dataKey="canceledByTeamLead"
                  name="Team Lead Canceled (Ha)"
                  fill="#f56565"
                  stackId="a"
                  barSize={30}
                />
                <Bar
                  dataKey="remaining_ha"
                  name="Remaining Plan Area (Ha)"
                  fill="#2c5282"
                  stackId="a"
                  barSize={30}
                >
                  <LabelList
                    dataKey="totalPlan"
                    position="top"
                    formatter={(value) => `${Number(value).toFixed(2)} ha`}
                    style={{ fill: '#4a5568', fontSize: 14, fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No group data available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportPart1;