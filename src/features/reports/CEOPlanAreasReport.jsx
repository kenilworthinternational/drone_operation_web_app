import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList
} from 'recharts';
import '../../styles/reportpart1.css';
import { getChartAllDataGroup, getChartGroupDataGroup, getChartPlantationDataGroup, getChartRegionDataGroup } from '../../api/api';
import { Bars } from 'react-loader-spinner';
const ReportPartCEO1 = ({ dateRange }) => {
  const [groupData, setGroupData] = useState([]);
  const [plantationData, setPlantationData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [estateData, setEstateData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPlantation, setSelectedPlantation] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loadingPlantation, setLoadingPlantation] = useState(false);
  const [loadingRegion, setLoadingRegion] = useState(false);
  const [loadingEstate, setLoadingEstate] = useState(false);
  const [error, setError] = useState(null);
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userGroupId = userData.group;

  const processData = (data, type) => {
    return data.map(item => {
      let fieldArea, totalPlan;
      if (type === 'All') {
        fieldArea = item.field_area_pilot_ha;
        totalPlan = item.total_plan_ha;
      } else if (type === 'Spread') {
        fieldArea = item.field_area_pilot_spd_ha;
        totalPlan = item.total_plan_ha_spd;
      } else if (type === 'Spray') {
        fieldArea = item.field_area_pilot_spy_ha;
        totalPlan = item.total_plan_ha_spy;
      }
      return {
        ...item,
        fieldArea: fieldArea || 0,
        totalPlan: totalPlan || 0,
        remaining_ha: Math.max(0, (totalPlan || 0) - (fieldArea || 0))
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
          <p style={{ color: '#ed8936' }}>
            Field Area Pilot: {Number(data.fieldArea).toFixed(2)} Ha
          </p>
        </div>
      );
    }
    return null;
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
      const response = await getChartAllDataGroup(payload);
      if (response.status === "true" && response.groups) {
        if (response.groups.length === 0) {
          setError('No group data available for the selected date range');
        } else {
          // Filter groups to only include the user's group
          const filteredGroups = response.groups.filter(group => group.group_id === userGroupId);
          if (filteredGroups.length === 0) {
            setError('No data available for your group');
          } else {
            setGroupData(filteredGroups);
            // Automatically select the user's group
            setSelectedGroup({
              id: filteredGroups[0].group_id,
              name: filteredGroups[0].group_name
            });
            // Fetch plantation data for the user's group
            fetchPlantationData(filteredGroups[0].group_id);
          }
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
  }, [dateRange.startDate, dateRange.endDate, userGroupId]);

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
      const response = await getChartGroupDataGroup(payload);
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
      const response = await getChartPlantationDataGroup(payload);
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
      const response = await getChartRegionDataGroup(payload);
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
      setSelectedGroup({ id: data.group_id, name: data.group_name });
      setPlantationData([]);
      setRegionData([]);
      setEstateData([]);
      setSelectedPlantation(null);
      setSelectedRegion(null);
      fetchPlantationData(data.group_id);
    }
  };

  const handlePlantationBarClick = (data) => {
    if (data && data.plantation_id) {
      setSelectedPlantation({ id: data.plantation_id, name: data.plantation_name });
      setRegionData([]);
      setEstateData([]);
      setSelectedRegion(null);
      fetchRegionData(data.plantation_id);
    }
  };

  const handleRegionBarClick = (data) => {
    if (data && data.region_id) {
      setSelectedRegion({ id: data.region_id, name: data.region_name });
      setEstateData([]);
      fetchEstateData(data.region_id);
    }
  };

  // Handle navigation back
  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setSelectedPlantation(null);
    setSelectedRegion(null);
    setPlantationData([]);
    setRegionData([]);
    setEstateData([]);
  };

  const handleBackToPlantations = () => {
    setSelectedPlantation(null);
    setSelectedRegion(null);
    setRegionData([]);
    setEstateData([]);
  };

  const handleBackToRegions = () => {
    setSelectedRegion(null);
    setEstateData([]);
  };

  // Fetch group data on mount and date range change
  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  // Reset selections when date range changes
  useEffect(() => {
    setSelectedGroup(null);
    setSelectedPlantation(null);
    setSelectedRegion(null);
    setPlantationData([]);
    setRegionData([]);
    setEstateData([]);
  }, [dateRange.startDate, dateRange.endDate]);

  if (loading) return <div className="report-part1 loading"><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Bars
                    height="80"
                    width="80"
                    color="#004B71"
                    ariaLabel="bars-loading"
                    visible={true}
                />
            </div></div>;
  if (error) return <div className="report-part1 error">{error}</div>;

  return (
    <div className="report-part1">
      <div className="type-selector">
        <label htmlFor="type-select">Select Type: </label>
        <select
          id="type-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
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
            <h2 className="chart-title">
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
                  tick={{ fill: '#4a5568', fontSize: 14 }}
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
                  name="Field Area Pilot (Ha)"
                  fill="#ed8936"
                  stackId="a"
                  barSize={40}
                />
                <Bar
                  dataKey="remaining_ha"
                  name="Remaining Plan Area (Ha)"
                  fill="#2c5282"
                  stackId="a"
                  barSize={40}
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
            <h2 className="chart-title">
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
                  tick={{ fill: '#4a5568', fontSize: 14 }}
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
                  name="Field Area Pilot (Ha)"
                  fill="#ed8936"
                  stackId="a"
                  barSize={40}
                />
                <Bar
                  dataKey="remaining_ha"
                  name="Remaining Plan Area (Ha)"
                  fill="#2c5282"
                  stackId="a"
                  barSize={40}
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
            <h2 className="chart-title">
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
                  tick={{ fill: '#4a5568', fontSize: 14 }}
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
                  name="Field Area Pilot (Ha)"
                  fill="#ed8936"
                  stackId="a"
                  barSize={40}
                />
                <Bar
                  dataKey="remaining_ha"
                  name="Remaining Plan Area (Ha)"
                  fill="#2c5282"
                  stackId="a"
                  barSize={40}
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
          <h2 className="chart-title">Group Plan Areas ({selectedType})</h2>
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
                  tick={{ fill: '#4a5568', fontSize: 14 }}
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
                  name="Field Area Pilot (Ha)"
                  fill="#ed8936"
                  stackId="a"
                  barSize={40}
                />
                <Bar
                  dataKey="remaining_ha"
                  name="Remaining Plan Area (Ha)"
                  fill="#2c5282"
                  stackId="a"
                  barSize={40}
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

export default ReportPartCEO1;