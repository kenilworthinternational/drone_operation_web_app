import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Bars } from 'react-loader-spinner';
import { useAppDispatch } from '../store/hooks';
import { baseApi } from '../api/services/allEndpoints';

const BarChartWidget = ({ dropdownValues, currentDate }) => {
  const dispatch = useAppDispatch();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // Loading state

  const { selectedEstate, selectedRegion, selectedPlantation, selectedGroup } = dropdownValues;

  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toLocaleDateString('en-CA');
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toLocaleDateString('en-CA');

  useEffect(() => {
    fetchChartData();
  }, [selectedEstate, selectedRegion, selectedPlantation, selectedGroup, startDate, endDate]);

  const fetchChartData = async () => {
    setIsLoading(true); // Start loading
    let response = null;
    const payload = { start_date: startDate, end_date: endDate };

    try {
      if (selectedEstate) {
        payload.estate_id = selectedEstate.id;
        const result = await dispatch(baseApi.endpoints.getChartEstateData.initiate(payload));
        response = result.data;
      } else if (selectedRegion) {
        payload.region_id = selectedRegion.id;
        const result = await dispatch(baseApi.endpoints.getChartRegionData.initiate(payload));
        response = result.data;
      } else if (selectedPlantation) {
        payload.plantation_id = selectedPlantation.id;
        const result = await dispatch(baseApi.endpoints.getChartPlantationData.initiate(payload));
        response = result.data;
      } else if (selectedGroup) {
        payload.group_id = selectedGroup.id;
        const result = await dispatch(baseApi.endpoints.getChartGroupData.initiate(payload));
        response = result.data;
      } else {
        const result = await dispatch(baseApi.endpoints.getChartAllDataGroup.initiate(payload));
        response = result.data;
      }

      if (response && response.status === "true") {
        setShowChart(true);
        const formattedData = Object.keys(response)
          .filter(key => typeof response[key] === 'object')
          .map(key => {
            const item = response[key];
            return {
              name: item.group_name || item.plantation_name || item.region_name || item.estate_name,
              Total: parseFloat(item.tatal_count_ha).toFixed(2),
              Planned: parseFloat(item.plan_count_ha).toFixed(2),
              NotPlanned: parseFloat(item.not_plan_ha).toFixed(2)
            };
          });
        setChartData(formattedData);
      } else {
        setShowChart(false);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setShowChart(false);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  const containerStyle = isFullScreen
    ? { position: 'fixed', top: '5%', left: '5%', width: '90%', height: '90%', zIndex: 12, background: 'white', padding: '10px' }
    : { position: 'relative', width: '100%', height: 300, padding: '10px' };

  return (
    <div style={containerStyle}>
      <button
        onClick={toggleFullScreen}
        style={{
          backgroundColor: '#004B71', borderRadius: '5px', color: 'white', padding: '5px 10px', cursor: 'pointer',
          position: 'absolute', right: 10, top: 10, zIndex: 11
        }}
      >
        {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Bars height="80" width="80" color="#004B71" ariaLabel="loading-indicator" />
        </div>
        
      ) : showChart ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend/>

            <Bar dataKey="Planned" fill="#0F7E00FF" name="Planned (Ha)" stackId="a" />
            <Bar dataKey="NotPlanned" fill="#FF0000FD" name="Not Planned (Ha)" stackId="a" />
            <Bar dataKey="Total" fill="#0097BDFF" name="Total (Ha)" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '16px', color: '#FF0000' }}>
          <img src="/assets/images/no-data.png" alt="No Data" className="no-plans-image" />
          <p>No Data Found</p>
        </div>
      )}
    </div>
  );
};

export default BarChartWidget;
