import React, { useState, useEffect } from "react";
import DatePicker from 'react-datepicker';
import { Bars } from 'react-loader-spinner';
import '../../styles/ops5.css';
import 'react-datepicker/dist/react-datepicker.css';
import { fieldNotApprovedTeamLead } from '../../api/api';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { FiRefreshCw, FiDownload, FiPrinter } from "react-icons/fi";

const OpsReport5 = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });
  
  const [endDate, setEndDate] = useState(new Date());
  const [teamLeadFilter, setTeamLeadFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [teamLeadOptions, setTeamLeadOptions] = useState([]);

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toLocaleDateString('en-CA');
  };

  // Format date for display (DD-MM-YYYY)
  const formatDisplayDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };
  
  const formatDateObject = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fieldNotApprovedTeamLead(
        formatDate(startDate),
        formatDate(endDate)
      );

      // Handle API response safely
      let plans = [];
      
      if (response?.plans?.plans) {
        // If plans.plans is an array, use it directly
        if (Array.isArray(response.plans.plans)) {
          plans = response.plans.plans;
        } 
        // If plans.plans is a single object, wrap it in an array
        else if (typeof response.plans.plans === 'object') {
          plans = [response.plans.plans];
        }
      }

      // Calculate total area for each plan by summing field areas
      const plansWithCalculatedArea = plans.map(plan => {
        const totalArea = plan.fields.reduce((sum, field) => sum + parseFloat(field.area), 0);
        return { ...plan, calculatedArea: totalArea.toFixed(2) };
      });

      setData(plansWithCalculatedArea);

      // Extract unique team lead names
      const leads = [...new Set(plans.map(plan => plan.team_lead_name))];
      setTeamLeadOptions(leads);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setTeamLeadOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Filter data based on selected team lead
  const filteredData = teamLeadFilter
    ? data.filter(plan => plan.team_lead_name === teamLeadFilter)
    : data;

  // Download Excel function
  const downloadExcel = () => {
    const worksheetData = filteredData.map(plan => ({
      Date: formatDisplayDate(plan.date),
      "Team Lead Name": plan.team_lead_name,
      "Plan ID": plan.plan_id,
      Plantation: plan.plantation,
      "Estate (Extent)": `${plan.estate} (${plan.extent})`,
      Fields: plan.fields.map(f => `${f.short_name}(${f.area})`).join(", "),
      "Total Area": plan.calculatedArea
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const teamLeadPart = teamLeadFilter && teamLeadFilter !== '' ? `${teamLeadFilter}_` : '';
    XLSX.writeFile(workbook, `TeamLead_Field_Approval_Report_${teamLeadPart}${formatDate(startDate)}_to_${formatDate(endDate)}.xlsx`);
  };

  // Download PDF function
  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = "Field Approval Report";
    const teamLeadPart = teamLeadFilter && teamLeadFilter !== '' ? `${teamLeadFilter}_` : '';
    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const dateRange = `${formatDateObject(startDate)} to ${formatDateObject(endDate)}`;
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(dateRange, 14, 22);

    // Prepare table data
    const tableData = filteredData.map(plan => [
      formatDisplayDate(plan.date),
      plan.team_lead_name,
      plan.plan_id,
      plan.plantation,
      `${plan.estate} (${plan.extent})`,
      plan.fields.map(f => `${f.short_name}(${f.area})`).join(", "),
      plan.calculatedArea
    ]);

    // Add table
    autoTable(doc, {
      head: [['Date', 'Team Lead', 'Plan ID', 'Plantation', 'Estate (Extent)', 'Fields', 'Total Area']],
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
        lineWidth: 0.2
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // gray-50
      }
    });

    doc.save(`TeamLead_Field_Approval_Report_${teamLeadPart}${formatDate(startDate)}_to_${formatDate(endDate)}.pdf`);
  };

  return (
    <div className="ops-container5">
      {/* Top Section (15%) */}
      <div className="ops5-section">
        <div className="ops5-section-next">
          <div className="ops5-top">
            <div className="">
              <label className="">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                dateFormat="dd-MM-yyyy"
                className="react-datepicker__input-container"
                disabled={loading}
              />
            </div>

            <div className="">
              <label className="">End Date</label>
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

            <div className="">
              <label className="">Team Lead</label>
              <select
                value={teamLeadFilter}
                onChange={e => setTeamLeadFilter(e.target.value)}
              >
                <option value="">All Team Leads</option>
                {teamLeadOptions.map((lead, index) => (
                  <option key={index} value={lead}>{lead}</option>
                ))}
              </select>
            </div>
            {/* <button
              onClick={fetchData}
              className="flex items-center bg-blue-500 text-white"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button> */}
            <div className="">
            <button
              onClick={downloadExcel}
              className="flex items-center bg-green-500 text-white"
            >
              <FiDownload className="mr-2" />
              Excel
            </button>
            </div>
            <button
              onClick={downloadPDF}
              className="flex items-center bg-red-600 text-white"
            >
              <FiPrinter className="mr-2" />
              PDF
            </button>
          </div>

          <div className="button-ops5">
            
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
              className="flex items-center bg-blue-500 text-white"
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
                  <th>Team Lead</th>
                  <th>Plan ID</th>
                  <th>Estate (Extent(Ha))</th>
                  <th>Fields</th>
                  <th>Total Area(Ha)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(plan => (
                  <tr key={plan.plan_id}>
                    <td>{formatDisplayDate(plan.date)}</td>
                    <td>{plan.team_lead_name}</td>
                    <td>#{plan.plan_id}</td>
                    <td>
                      <span className="font-medium">{plan.estate}</span>
                      <span className="text-gray-500 ml-1">({plan.extent})</span>
                    </td>
                    <td className="max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {plan.fields?.map(field => (
                          <span
                            key={field.field_id}
                            className="px-2 py-1 bg-gray-100 rounded text-xs border border-gray-300"
                          >
                            {field.name}({field.area})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{plan.calculatedArea}</td>
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

export default OpsReport5;