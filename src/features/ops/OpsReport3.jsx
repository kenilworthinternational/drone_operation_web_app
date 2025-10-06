import React, { useState, useEffect } from "react";
import '../../styles/ops3.css';
import { leadReport } from '../../api/api';
import DatePicker from 'react-datepicker';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Bars } from "react-loader-spinner";
import { FiRefreshCw, FiDownload, FiPrinter } from "react-icons/fi";

const OpsReport3 = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([firstDayOfMonth, today]);
  const [processedData, setProcessedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedPercentageSort, setAssignedPercentageSort] = useState('default');
  const [selectedLeader, setSelectedLeader] = useState('All');
  const [leaderList, setLeaderList] = useState([]);

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
    if (dates[0] && dates[1]) {
      setIsCalendarOpen(false);
    }
  };

  useEffect(() => {
    if (processedData.length > 0) {
      const leaders = [...new Set(processedData.map(item => item.teamLeadName))];
      setLeaderList(['All', ...leaders]);
    }
  }, [processedData]);

  useEffect(() => {
    if (selectedDates[0] && selectedDates[1]) {
      fetchData();
    }
  }, [selectedDates]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const startDate = selectedDates[0].toLocaleDateString('en-CA');
      const endDate = selectedDates[1].toLocaleDateString('en-CA');
      const response = await leadReport(startDate, endDate);
      console.log('API Response:', JSON.stringify(response, null, 2));
      const transformedData = response.team_lead.flatMap(lead =>
        lead.plans
          .filter(plan => 
            plan.area != null && 
            plan.not_assigned != null && 
            plan.sprayedArea != null && 
            plan.canceled != null && 
            plan.activated === 1 // Only include plans where activated is 1
          )
          .map(plan => {
            const area = Number(plan.area) || 0;
            const notAssigned = Number(plan.not_assigned) || 0;
            const sprayedArea = Number(plan.sprayedArea) || 0;
            const assigned = area - notAssigned;
            const result = {
              date: plan.date || 'N/A',
              teamLeadName: lead.name || 'Unknown',
              planId: plan.plan_id || 'N/A',
              estate: plan.estate || 'N/A',
              area: area,
              assigned: assigned,
              sprayedArea: sprayedArea,
              notAssigned: notAssigned,
              tlCanceled: Number(plan.canceled) || 0,
              assignedPercentage: area > 0 ? (assigned / area) * 100 : 0,
              pilots: plan.pilots || [],
            };
            console.log('Transformed Plan:', result);
            return result;
          })
      );
      console.log('Transformed Data:', transformedData);
      const sortedData = transformedData.sort(
        (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
      );

      setProcessedData(sortedData);
      setFilteredData(sortedData);
      console.log('Processed Data:', sortedData);
      console.log('Filtered Data:', sortedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const handleSortToggle = () => {
    setAssignedPercentageSort(prev => {
      if (prev === 'default') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'default';
    });
  };

  const handleFilter = (data = processedData) => {
    let filtered = [...data];
    if (selectedLeader !== 'All') {
      filtered = filtered.filter(item => item.teamLeadName === selectedLeader);
    }

    if (assignedPercentageSort === 'default') {
      filtered.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    } else {
      filtered.sort((a, b) => {
        const aPercent = isNaN(a.assignedPercentage) ? 0 : Number(a.assignedPercentage);
        const bPercent = isNaN(b.assignedPercentage) ? 0 : Number(b.assignedPercentage);
        return assignedPercentageSort === 'asc' ? aPercent - bPercent : bPercent - aPercent;
      });
    }

    console.log('Filtered Data after handleFilter:', filtered);
    setFilteredData(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [assignedPercentageSort, selectedLeader, processedData]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredData.map(item => {
        console.log('Exporting Item:', item);
        return {
          Date: item.date || 'N/A',
          'TeamLead Name': item.teamLeadName || 'N/A',
          'Plan ID': item.planId || 'N/A',
          Estate: item.estate || 'N/A',
          'Area (Ha)': isNaN(item.area) ? '0.00' : Number(item.area).toFixed(2),
          Assigned: isNaN(item.assigned) ? '0.00' : Number(item.assigned).toFixed(2),
          'Assigned %': isNaN(item.assignedPercentage) ? '0.00' : Number(item.assignedPercentage).toFixed(2),
          'Completed(Ha)': isNaN(item.sprayedArea) ? '0.00' : Number(item.sprayedArea).toFixed(2),
          'Not Assigned(Ha)': isNaN(item.notAssigned) ? '0.00' : Number(item.notAssigned).toFixed(2),
          'TL Canceled': item.tlCanceled ?? 'N/A',
        };
      })
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    XLSX.writeFile(wb, `TeamLead_Report_${selectedLeader}_${formatDate(selectedDates[0])}_to_${formatDate(selectedDates[1])}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    doc.autoTable({
      head: [['Date', 'TeamLead Name', 'Plan ID', 'Estate', 'Area (Ha)', 'Assigned', 'Assigned %', 'Completed', 'Not Assigned', 'TL Canceled']],
      body: filteredData.map(item => {
        console.log('Exporting Item to PDF:', item);
        return [
          item.date || 'N/A',
          item.teamLeadName || 'N/A',
          item.planId || 'N/A',
          item.estate || 'N/A',
          isNaN(item.area) ? '0.00' : Number(item.area).toFixed(2),
          isNaN(item.assigned) ? '0.00' : Number(item.assigned).toFixed(2),
          `${isNaN(item.assignedPercentage) ? '0.00' : Number(item.assignedPercentage).toFixed(2)}%`,
          isNaN(item.sprayedArea) ? '0.00' : Number(item.sprayedArea).toFixed(2),
          isNaN(item.notAssigned) ? '0.00' : Number(item.notAssigned).toFixed(2),
          item.tlCanceled ?? 'N/A',
        ];
      }),
    });
    doc.save(`TeamLead_Report_${selectedLeader}_${formatDate(selectedDates[0])}_to_${formatDate(selectedDates[1])}.pdf`);
  };

  return (
    <div className="ops-report-container3">
      <div className="top-ops-part3">
        <div className="daterangepicker-ops3">
          <div className="date-range-report">
            <p className="select-date-text text-ops" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
              Select Date
            </p>
            <p className="date-range" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
              {selectedDates[0]?.toLocaleDateString() || 'N/A'} - {selectedDates[1]?.toLocaleDateString() || 'N/A'}
            </p>
          </div>

          {isCalendarOpen && (
            <div className="react-date-picker-ops">
              <DatePicker
                selected={selectedDates[0]}
                onChange={handleDateChange}
                startDate={selectedDates[0]}
                endDate={selectedDates[1]}
                selectsRange
                inline
              />
            </div>
          )}
          <div className="leader-filter">
            <select
              value={selectedLeader}
              onChange={(e) => setSelectedLeader(e.target.value)}
              className="filter-dropdown"
            >
              {leaderList.map((leader, index) => (
                <option key={index} value={leader}>
                  {leader}
                </option>
              ))}
            </select>
          </div>
          <div style={{display:"flex", flexDirection:"row"}}>
            <button
              onClick={exportToExcel}
              className="flex items-center bg-green-500 text-white"
            >
              <FiDownload className="mr-2" />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center bg-red-600 text-white"
            >
              <FiPrinter className="mr-2" />
              PDF
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Bars
              height="80"
              width="80"
              color="#4180B9"
              ariaLabel="bars-loading"
              visible={true}
            />
          </div>
        ) : filteredData.length === 0 ? (
          <div>No data available for the selected date range or leader.</div>
        ) : (
          <div className="report-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>TeamLead Name</th>
                  <th>Plan ID</th>
                  <th>Estate</th>
                  <th>Area (Ha)</th>
                  <th>Assigned(Ha)</th>
                  <th onClick={handleSortToggle} className="sortable-header">
                    Assigned %
                    {assignedPercentageSort === 'default' && ' (default)'}
                    {assignedPercentageSort === 'asc' && ' (ascending)↑'}
                    {assignedPercentageSort === 'desc' && ' (descending)↓'}
                  </th>
                  <th>Completed(Ha)</th>
                  <th>Not Assigned(Ha)</th>
                  <th>TL Canceled(Ha)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  console.log('Rendering Item:', item);
                  return (
                    <tr key={index}>
                      <td>{item.date && item.date !== 'N/A' ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A'}</td>
                      <td>{item.teamLeadName || 'N/A'}</td>
                      <td>{item.planId || 'N/A'}</td>
                      <td>{item.estate || 'N/A'}</td>
                      <td>{isNaN(item.area) ? '0.00' : Number(item.area).toFixed(2)}</td>
                      <td>{isNaN(item.assigned) ? '0.00' : Number(item.assigned).toFixed(2)}</td>
                      <td>{isNaN(item.assignedPercentage) ? '0.00' : Number(item.assignedPercentage).toFixed(2)}%</td>
                      <td>{isNaN(item.sprayedArea) ? '0.00' : Number(item.sprayedArea).toFixed(2)}</td>
                      <td>{isNaN(item.notAssigned) ? '0.00' : Number(item.notAssigned).toFixed(2)}</td>
                      <td>{item.tlCanceled ?? 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpsReport3;