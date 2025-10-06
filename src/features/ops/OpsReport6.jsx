import React, { useState, useEffect } from "react";
import DatePicker from 'react-datepicker';
import { Bars } from 'react-loader-spinner';
import '../../styles/ops6.css';
import 'react-datepicker/dist/react-datepicker.css';
import { incompleteSubtasks } from '../../api/api';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { FiRefreshCw, FiDownload, FiPrinter } from "react-icons/fi";

const OpsReport6 = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [pilotFilter, setPilotFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pilotOptions, setPilotOptions] = useState([]);

  // Format date to YYYY-MM-DD for API
  const formatDate = (date) => {
    return date.toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD
  };

  // Format date for display (DD-MM-YYYY)
  const formatDisplayDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await incompleteSubtasks(
        formatDate(startDate),
        formatDate(endDate)
      );

      // Handle API response safely
      const tasks = response?.tasks || [];

      // Calculate total area for each task by summing sub-task field areas
      const tasksWithTotalArea = tasks.map(task => {
        const totalArea = task.sub_tasks.reduce((sum, subTask) => sum + parseFloat(subTask.field_area), 0);
        return { ...task, totalArea: totalArea.toFixed(2) };
      });

      setData(tasksWithTotalArea);

      // Extract unique pilot names
      const pilots = [...new Set(tasks.map(task => task.pilot_name))];
      setPilotOptions(pilots);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setPilotOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Filter data based on selected pilot
  const filteredData = pilotFilter
    ? data.filter(task => task.pilot_name === pilotFilter)
    : data;

  // Download Excel function
  const downloadExcel = () => {
    const worksheetData = filteredData.map(task => ({
      Date: formatDisplayDate(task.plan_date),
      "Plan ID/Task ID": `${task.plan_id}/${task.task_id}`,
      Estate: task.estate_name,
      Field: task.field,
      "Field Area": task.field_area,
      "Pilot Name": task.pilot_name,
      "Drone Tag": task.drone_tag,
      "Sub Tasks": task.sub_tasks.map(st => `${st.id}(${st.field_area})`).join(", "),
      "Total Area": task.totalArea
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pilot_Performance");
    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const pilotPart = pilotFilter ? `${pilotFilter.replace(/\s+/g, '_')}_` : 'All_Pilots_';
    XLSX.writeFile(workbook, `Incomplete_Ops_Room_Rejected_${pilotPart}${formatDate(startDate)}_to_${formatDate(endDate)}.xlsx`);
  };

  // Download PDF function
  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = "Pilot Performance Report";
    const dateRange = `${formatDisplayDate(formatDate(startDate))} to ${formatDisplayDate(formatDate(endDate))}`;
    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const pilotPart = pilotFilter ? `${pilotFilter.replace(/\s+/g, '_')}_` : 'All_Pilots_';
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(dateRange, 14, 22);

    // Prepare table data
    const tableData = filteredData.map(task => [
      formatDisplayDate(task.plan_date),
      `${task.plan_id}/${task.task_id}`,
      task.estate_name,
      task.field,
      task.field_area,
      task.pilot_name,
      task.drone_tag,
      task.sub_tasks.map(st => `${st.id}(${st.field_area})`).join(", "),
      task.totalArea
    ]);

    // Add table
    autoTable(doc, {
      head: [['Date', 'Plan ID/Task ID', 'Estate', 'Field', 'Field Area', 'Pilot Name', 'Drone Tag', 'Sub Tasks', 'Total Area']],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [209, 213, 219], // gray-300
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [22, 160, 133], // teal-600
        textColor: 255, // white
        fontStyle: 'bold',
        lineWidth: 0.2,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // gray-50
      },
      columnStyles: {
        7: { cellWidth: 40 } // Wider column for Sub Tasks
      }
    });

    doc.save(`Incomplete_Ops_Room_Rejected_${pilotPart}${formatDate(startDate)}_to_${formatDate(endDate)}.pdf`);
  };

  return (
    <div className="ops-container6">
      {/* Top Section (15%) */}
      <div className="ops6-section">
        <div className="ops6-section-next">
          <div className="ops6-top">
            <div>
              <label>Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                dateFormat="dd-MM-yyyy"
                className="react-datepicker__input-container"
                disabled={loading}
              />
            </div>
            <div>
              <label>End Date</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                minDate={startDate}
                dateFormat="dd-MM-yyyy"
                className="react-datepicker__input-container"
                disabled={loading}
              />
            </div>
            <div className="align-items">
              <label>Pilot </label>
              <select
                value={pilotFilter}
                onChange={e => setPilotFilter(e.target.value)}
              >
                <option value="">All Pilots</option>
                {pilotOptions.map((pilot, index) => (
                  <option key={index} value={pilot}>{pilot}</option>
                ))}
              </select>
            </div>
            <div className="align-items">
              <button
                onClick={downloadExcel}
                className="flex items-center bg-green-500 text-white m-0"
              >
                <FiDownload className="mr-2" />
                Excel
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center bg-red-600 text-white m-0"
              >
                <FiPrinter className="mr-2" />
                PDF
              </button>
            </div>
          </div>
          {/* <button
              onClick={fetchData}
              className="flex items-center bg-blue-500 text-white"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button> */}

        </div>
      </div>
      {/* Bottom Section (85%) */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Bars color="#004B71" height={80} width={80} />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-lg">No data available for the selected criteria</p>
            <button
              onClick={fetchData}
              className="mt-4 flex items-center bg-blue-500 text-white"
            >
              <FiRefreshCw className="mr-2" />
              Refresh Data
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plan ID/Task ID</th>
                  <th>Estate</th>
                  <th>Field</th>
                  <th>Field Area(Ha)</th>
                  <th>Pilot Name</th>
                  <th>Drone Tag</th>
                  <th>Sub Task ID(Ha)</th>
                  <th>Total Area(Ha)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(task => (
                  <tr key={task.task_id}>
                    <td>{formatDisplayDate(task.plan_date)}</td>
                    <td>{`${task.plan_id}/${task.task_id}`}</td>
                    <td>{task.estate_name}</td>
                    <td>{task.field}</td>
                    <td>{task.field_area}</td>
                    <td>{task.pilot_name}</td>
                    <td>{task.drone_tag}</td>
                    <td className="max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {task.sub_tasks?.map(subTask => (
                          <span
                            key={subTask.id}
                            className="px-2 py-1 bg-gray-100 rounded text-xs border border-gray-300"
                          >
                            {subTask.id}({subTask.field_area})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{task.totalArea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpsReport6;