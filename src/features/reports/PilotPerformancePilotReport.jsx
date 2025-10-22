import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Bars } from 'react-loader-spinner';
import { fetchPilotPerformance2, clearPilotsData2 } from '../../store/pilotPerformanceSlice2';
import * as XLSX from 'xlsx';

const ReportPart7 = ({ dateRange }) => {
  const dispatch = useDispatch();
  const { pilotsData, loading, error } = useSelector(state => state.pilotPerformance2);

  useEffect(() => {
    // Check if dateRange is empty or invalid
    if (!dateRange.startDate || !dateRange.endDate) {
      dispatch(clearPilotsData2());
      return;
    }

    // Dispatch the async thunk to fetch data
    dispatch(fetchPilotPerformance2({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }));
  }, [dateRange, dispatch]);

  // Function to handle Excel download
  const handleExportToExcel = () => {
    if (pilotsData.length === 0) {
      alert('No data available to export');
      return;
    }

    // Prepare data for Excel
    const exportData = pilotsData.map(item => ({
      'Pilot Name': item.pilotNameFullName || item.pilotName,
      'Total Assigned (ha)': item.totalAssigned ? item.totalAssigned.toFixed(2) : 0,
      'Completed (ha)': item.completed ? item.completed.toFixed(2) : 0,
      'Cancelled (ha)': item.cancelled ? item.cancelled.toFixed(2) : 0,
      'Incompleted (ha)': item.remaining ? item.remaining.toFixed(2) : 0,
      'Percentage (%)': item.percentage ? item.percentage.toFixed(2) : 0,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pilot Performance');

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Generate Excel file and trigger download with improved name
    const fileName = `Pilot_Performance_Report_${formatDate(dateRange.startDate)}_to_${formatDate(dateRange.endDate)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Bars
          height="80"
          width="80"
          color="#004B71"
          ariaLabel="bars-loading"
          visible={true}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
      {pilotsData.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <p>{error ? `Error: ${error}` : 'No data available for the selected date range.'}</p>
        </div>
      ) : (
        <ResponsiveContainer>
          <div className="h2" style={{ display: 'flex', justifyContent: 'center' }}>
            <h2 
              style={{ color: '#004B71', cursor: 'pointer' }} 
              onClick={handleExportToExcel}
              title="Click to download as Excel"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleExportToExcel()}
            >
              Pilot Performance Stats Pilot
            </h2>
          </div>
          <BarChart
            data={pilotsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="pilotName"
              angle={-65}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label, payload) => {
                return payload[0]?.payload?.pilotNameFullName || label;
              }}
              formatter={(value, name) => {
                const formattedValue = value.toFixed(2);
                if (name === 'totalAssigned') return [formattedValue, 'Total Assigned (ha)'];
                if (name === 'completed') return [formattedValue, 'Completed (ha)'];
                if (name === 'cancelled') return [formattedValue, 'Cancelled (ha)'];
                if (name === 'remaining') return [formattedValue, 'Incompleted (ha)'];
                return [formattedValue, name];
              }}
            />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#00A023" name="Completed (ha)" barSize={20} />
            <Bar dataKey="cancelled" stackId="a" fill="#FF0000" name="Cancelled (ha)" barSize={20} />
            <Bar dataKey="remaining" stackId="a" fill="#004B71" name="Incompleted (ha)" barSize={20}>
              <LabelList
                dataKey="percentage"
                position="top"
                formatter={value => `${value}%`}
                style={{ fill: '#000', fontSize: '12px' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ReportPart7;