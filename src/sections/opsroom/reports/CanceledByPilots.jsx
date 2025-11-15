import React, { useState, useEffect } from "react";
import DatePicker from 'react-datepicker';
import { Bars } from 'react-loader-spinner';
import '../../../styles/ops6.css';
import 'react-datepicker/dist/react-datepicker.css';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { FiRefreshCw, FiDownload, FiPrinter } from "react-icons/fi";

const CanceledByPilots = () => {
  const dispatch = useAppDispatch();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [pilotFilter, setPilotFilter] = useState('');
  const [estateFilter, setEstateFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pilotOptions, setPilotOptions] = useState([]);
  const [estateOptions, setEstateOptions] = useState([]);
  const [reasonOptions, setReasonOptions] = useState([]);

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
      const result = await dispatch(baseApi.endpoints.getCanceledFieldsByDateRange.initiate({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      }));
      const response = result.data;

      // Handle API response safely
      const plans = response || [];
      
      // Flatten tasks for table display
      const flattenedData = plans.flatMap(plan => 
        plan.tasks.map(task => ({
          plan_id: plan.plan_id,
          date: plan.date,
          estate: plan.estate,
          estate_area: plan.area.toFixed(2),
          task_id: task.task_id,
          pilot: task.pilot,
          field: task.field,
          reason: task.reason
        }))
      );

      setData(flattenedData);

      // Extract unique pilot names
      const pilots = [...new Set(flattenedData.map(task => task.pilot))];
      setPilotOptions(pilots);

      // Extract unique estate names
      const estates = [...new Set(flattenedData.map(task => task.estate))];
      setEstateOptions(estates);

      // Extract unique reasons
      const reasons = [...new Set(flattenedData.map(task => task.reason))];
      setReasonOptions(reasons);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setPilotOptions([]);
      setEstateOptions([]);
      setReasonOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Filter data based on selected pilot, estate, and reason
  const filteredData = data.filter(task => 
    (!pilotFilter || task.pilot === pilotFilter) &&
    (!estateFilter || task.estate === estateFilter) &&
    (!reasonFilter || task.reason === reasonFilter)
  );

  // Download Excel function
  const downloadExcel = () => {
    const worksheetData = filteredData.map(task => ({
      "Plan ID": task.plan_id,
      Date: formatDisplayDate(task.date),
      "Estate (Area)": `${task.estate} (${task.estate_area})`,
      "Task ID": task.task_id,
      Pilot: task.pilot,
      Field: task.field,
      Reason: task.reason
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Canceled_Fields");
    // Helper to format date as YYYY-MM-DD for filename
    const formatDateForFilename = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const pilotPart = pilotFilter ? pilotFilter.replace(/\s+/g, '_') : 'All_Pilots';
    const estatePart = estateFilter ? estateFilter.replace(/\s+/g, '_') : 'All_Estates';
    const reasonPart = reasonFilter ? reasonFilter.replace(/\s+/g, '_') : 'All_Reasons';
    XLSX.writeFile(workbook, `Canceled_Fields_Report_${estatePart}_${reasonPart}_${pilotPart}_${formatDateForFilename(startDate)}_to_${formatDateForFilename(endDate)}.xlsx`);
  };

  // Download PDF function
  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = "Canceled Fields Report";
    // Helper to format date as YYYY-MM-DD for filename
    const formatDateForFilename = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const dateRange = `${formatDisplayDate(formatDate(startDate))} to ${formatDisplayDate(formatDate(endDate))}`;

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(dateRange, 14, 22);

    // Prepare table data
    const tableData = filteredData.map(task => [
      task.plan_id,
      formatDisplayDate(task.date),
      `${task.estate} (${task.estate_area})`,
      task.task_id,
      task.pilot,
      task.field,
      task.reason
    ]);

    // Add table
    autoTable(doc, {
      head: [['Plan ID', 'Date', 'Estate (Area)', 'Task ID', 'Pilot', 'Field', 'Reason']],
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
        6: { cellWidth: 40 } // Wider column for Reason
      }
    });

    const pilotPart = pilotFilter ? pilotFilter.replace(/\s+/g, '_') : 'All_Pilots';
    const estatePart = estateFilter ? estateFilter.replace(/\s+/g, '_') : 'All_Estates';
    const reasonPart = reasonFilter ? reasonFilter.replace(/\s+/g, '_') : 'All_Reasons';
    doc.save(`Canceled_Fields_Report_${estatePart}_${reasonPart}_${pilotPart}_${formatDateForFilename(startDate)}_to_${formatDateForFilename(endDate)}.pdf`);
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
              <select
                value={estateFilter}
                onChange={e => setEstateFilter(e.target.value)}
              >
                <option value="">All Estates</option>
                {estateOptions.map((estate, index) => (
                  <option key={index} value={estate}>{estate}</option>
                ))}
              </select>
            </div>
            <div className="align-items">
              <select
                value={reasonFilter}
                onChange={e => setReasonFilter(e.target.value)}
              >
                <option value="">All Reasons</option>
                {reasonOptions.map((reason, index) => (
                  <option key={index} value={reason}>{reason}</option>
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
                  <th>Plan ID</th>
                  <th>Date</th>
                  <th>Estate (Area)</th>
                  <th>Task ID</th>
                  <th>Pilot</th>
                  <th>Field</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(task => (
                  <tr key={task.task_id}>
                    <td>{task.plan_id}</td>
                    <td>{formatDisplayDate(task.date)}</td>
                    <td>{`${task.estate} (${task.estate_area})`}</td>
                    <td>{task.task_id}</td>
                    <td>{task.pilot}</td>
                    <td>{task.field}</td>
                    <td>{task.reason}</td>
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

export default CanceledByPilots;