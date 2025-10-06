import React, { useState } from 'react';
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PieChartWidget = ({ dropdownValues, currentDate }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  console.log('Dropdown values:', dropdownValues, 'Current date:', currentDate);
  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
    setSelectedSection(null); // Reset selection when exiting fullscreen
  };

  console.log('Dropdown values:', dropdownValues, 'Current date:', currentDate);

  // Sample data
  const sampleData = [
    { name: 'OnGoing', value: 40 },
    { name: 'Manager No Approved', value: 20 },
    { name: 'Partial Incomplete', value: 25 },
    { name: 'Not Completed', value: 15 },
  ];

  // Define colors
  const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28'];

  // Breakdown reasons for "Partial Incomplete" and "Not Completed"
  const breakdownData = {
    "Partial Incomplete": [
      { reason: "Mission Canceled, Leaves to be plucked", count: 3 },
      { reason: "Mission Canceled, Due to No Agrochemical", count: 4 },
      { reason: "Mission Canceled, Due to Adverse Weather", count: 5 },
      { reason: "Mission on Hold, Due to Lack of Agrochemicals", count: 6 },
      { reason: "Mission on Hold, Due to Adverse Weather", count: 7 },
    ],
    "Not Completed": [
      { reason: "Task Not Assigned", count: 5 },
      { reason: "Equipment Failure", count: 4 },
      { reason: "Worker Shortage", count: 6 },
    ],
  };

  return (
    <div
      style={{
        position: isFullScreen ? 'fixed' : 'relative',
        top: isFullScreen ? '50%' : 'auto',
        left: isFullScreen ? '50%' : 'auto',
        transform: isFullScreen ? 'translate(-50%, -50%)' : 'none',
        width: isFullScreen ? '90vw' : '100%',
        height: isFullScreen ? '90vh' : 300,
        zIndex: isFullScreen ? 1000 : 'auto',
        backgroundColor: isFullScreen ? 'white' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: isFullScreen ? '20px' : '10px',
        boxShadow: isFullScreen ? '0 0 10px rgba(0, 0, 0, 0.5)' : 'none',
      }}
    >
      {/* Fullscreen Button */}
      <button
        onClick={toggleFullScreen}
        style={{
          backgroundColor: '#004B71',
          borderRadius: '5px',
          color: 'white',
          padding: '8px 12px',
          cursor: 'pointer',
          position: 'absolute',
          right: 20,
          top: 20,
          zIndex: 1100,
          fontSize: '14px',
        }}
      >
        {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>

      {/* Chart Container */}
      <ResponsiveContainer width={isFullScreen ? '80%' : '100%'} height={isFullScreen ? '80%' : '100%'}>
        <PieChart>
          <Pie
            data={sampleData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={isFullScreen ? 250 : 80}
            label
            onClick={(entry) => {
              if (isFullScreen && (entry.name === "Partial Incomplete" || entry.name === "Not Completed")) {
                setSelectedSection(entry.name);
              }
            }}
          >
            {sampleData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>

      {/* Breakdown Details Panel (only in fullscreen mode) */}
      {isFullScreen && selectedSection && breakdownData[selectedSection] && (
        <div className="details-panel" style={{ marginTop: '20px', textAlign: 'left' }}>
          <h3>{selectedSection} Breakdown</h3>
          <ul>
            {breakdownData[selectedSection].map((item, index) => (
              <li key={index}>
                {item.reason} - <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PieChartWidget;
