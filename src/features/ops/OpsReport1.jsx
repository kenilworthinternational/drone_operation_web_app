import React, { useState, useEffect } from "react";
import DatePicker from 'react-datepicker';
import '../../styles/ops.css';
import 'react-datepicker/dist/react-datepicker.css';
import { pilotsPerfomances } from '../../api/api';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Bars } from "react-loader-spinner";
import { FiRefreshCw, FiDownload, FiPrinter } from "react-icons/fi";

const OpsReport1 = () => {
    const today = new Date();    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);
    const [pilotsData, setPilotsData] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        pilotNames: [],
        groups: [],
        plantations: [],
        regions: [],
        estates: []
    });
    const [filters, setFilters] = useState({
        pilotName: '',
        group: '',
        plantation: '',
        region: '',
        estate: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setNoData(false);
            try {
                const response = await pilotsPerfomances(
                    startDate.toLocaleDateString('en-CA'),
                    endDate.toLocaleDateString('en-CA')
                );

                const transformed = [];
                const options = {
                    pilotNames: new Set(),
                    groups: new Set(),
                    plantations: new Set(),
                    regions: new Set(),
                    estates: new Set()
                };

                response.pilots.forEach(pilot => {
                    options.pilotNames.add(pilot.pilot_name);
                    pilot.plans.forEach(plan => {
                        options.groups.add(plan.group);
                        options.plantations.add(plan.plantation);
                        options.regions.add(plan.region);
                        options.estates.add(plan.estate);

                        plan.fields.forEach(field => {
                            const fieldArea = Number(field.field_area);
                            if (isNaN(fieldArea)) return;

                            // Use completed_area_by_pilot_for_field instead of dji_field_area
                            let completedArea = Number(field.completed_area_by_pilot_for_field) || 0;

                            transformed.push({
                                date: plan.date,
                                pilotName: pilot.pilot_name,
                                group: plan.group,
                                plantation: plan.plantation,
                                region: plan.region,
                                estate: plan.estate,
                                fieldName: field.field_name,
                                fieldArea: fieldArea,
                                completedArea: completedArea,
                                taskStatus: field.task_status
                            });
                        });
                    });
                });

                setPilotsData(transformed);
                setFilterOptions({
                    pilotNames: [...options.pilotNames],
                    groups: [...options.groups],
                    plantations: [...options.plantations],
                    regions: [...options.regions],
                    estates: [...options.estates]
                });

                setNoData(transformed.length === 0);
            } catch (error) {
                console.error('Error fetching data:', error);
                setNoData(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const filteredData = pilotsData.filter(item => {
        return (
            (!filters.pilotName || item.pilotName === filters.pilotName) &&
            (!filters.group || item.group === filters.group) &&
            (!filters.plantation || item.plantation === filters.plantation) &&
            (!filters.region || item.region === filters.region) &&
            (!filters.estate || item.estate === filters.estate) &&
            item.fieldArea > 0 // Hide rows where assigned area is 0
        );
    });

    const totals = filteredData.reduce(
        (acc, item) => {
            acc.fieldArea += item.fieldArea;
            acc.completedArea += item.completedArea;
            return acc;
        },
        { fieldArea: 0, completedArea: 0 }
    );

    const getStatusText = (status) => {
        switch (status) {
            case 'c':
                return 'Completed';
            case 'mp':
                return 'Mission Postponed';
            case 'pc':
                return 'Partially Completed';
            case 'co':
                return 'Completed';
            case 'x':
                return 'Canceled';
            case 'p':
                return 'Pending';
            default:
                return 'Unknown';
        }
    };

    // Helper to format date as YYYY-MM-DD (move above both exportToExcel and exportToPDF)
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper to get filter label for filename
    const getFilterLabel = () => {
        // If pilot is filtered, always show pilot
        if (filters.pilotName) {
            return filters.pilotName.replace(/\s+/g, '_');
        }
        // If estate is filtered, show estate
        if (filters.estate) {
            return filters.estate.replace(/\s+/g, '_');
        }
        // If region is filtered, show region
        if (filters.region) {
            return filters.region.replace(/\s+/g, '_');
        }
        // If plantation is filtered, show plantation
        if (filters.plantation) {
            return filters.plantation.replace(/\s+/g, '_');
        }
        // If group is filtered, show group
        if (filters.group) {
            return filters.group.replace(/\s+/g, '_');
        }
        // Default
        return 'All_Pilots';
    };

    const exportToExcel = () => {
        const headers = [
            'Date', 'Pilot', 'Group', 'Plantation',
            'Region', 'Estate', 'Field Name',
            'Assigned (ha)', 'Completed (ha)', 'Status'
        ];

        const dataRows = filteredData.map(item => [
            item.date,
            item.pilotName,
            item.group,
            item.plantation,
            item.region,
            item.estate,
            item.fieldName,
            item.fieldArea.toFixed(2),
            item.completedArea.toFixed(2),
            getStatusText(item.taskStatus)
        ]);

        dataRows.push([
            'Total',
            '',
            '',
            '',
            '',
            '',
            '',
            totals.fieldArea.toFixed(2),
            totals.completedArea.toFixed(2),
            ''
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pilot Performance");
        const filterLabel = getFilterLabel();
        XLSX.writeFile(workbook, `Pilot_Performance_${filterLabel}_${formatDate(startDate)}_to_${formatDate(endDate)}.xlsx`);
    };

    const exportToPDF = () => {
        if (filteredData.length === 0) return;

        const doc = new jsPDF();
        const logo = new Image();
        logo.src = '../../assets/images/kenilowrthlogoDark.png';

        doc.addImage(logo, 'PNG', 10, 10, 30, 30);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Kenilworth International Lanka Pvt Ltd", 60, 25);
        doc.text("7B , 1/1 D.W Rupasinghe Mawatha, Nugegoda", 60, 30);

        const bodyData = filteredData.map(item => [
            item.date,
            item.pilotName,
            item.group,
            item.plantation,
            item.region,
            item.estate,
            item.fieldName,
            item.fieldArea.toFixed(2),
            item.completedArea.toFixed(2),
            getStatusText(item.taskStatus)
        ]);

        bodyData.push([
            'Total',
            '',
            '',
            '',
            '',
            '',
            '',
            totals.fieldArea.toFixed(2),
            totals.completedArea.toFixed(2),
            ''
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Date', 'Pilot', 'Group', 'Plantation', 'Region', 'Estate', 'Field', 'Assigned (ha)', 'Completed (ha)', 'Status']],
            body: bodyData,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });

        const filterLabel = getFilterLabel();
        doc.save(`Pilot_Performance_${filterLabel}_${formatDate(startDate)}_to_${formatDate(endDate)}.pdf`);
    };

    return (
        <div className="ops-container">
            <div className="date-filters">
                <div>
                    <label>Start Date: </label>
                    <DatePicker
                        selected={startDate}
                        onChange={date => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label>End Date: </label>
                    <DatePicker
                        selected={endDate}
                        onChange={date => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        disabled={isLoading}
                    />
                </div>
                <div className="export-buttons">
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

            <div className="filter-controls">
                <select onChange={(e) => handleFilterChange('pilotName', e.target.value)} disabled={isLoading}>
                    <option value="">All Pilots</option>
                    {filterOptions.pilotNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>

                <select onChange={(e) => handleFilterChange('group', e.target.value)} disabled={isLoading}>
                    <option value="">All Groups</option>
                    {filterOptions.groups.map(group => (
                        <option key={group} value={group}>{group}</option>
                    ))}
                </select>

                <select onChange={(e) => handleFilterChange('plantation', e.target.value)} disabled={isLoading}>
                    <option value="">All Plantations</option>
                    {filterOptions.plantations.map(plantation => (
                        <option key={plantation} value={plantation}>{plantation}</option>
                    ))}
                </select>

                <select onChange={(e) => handleFilterChange('region', e.target.value)} disabled={isLoading}>
                    <option value="">All Regions</option>
                    {filterOptions.regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                    ))}
                </select>

                <select onChange={(e) => handleFilterChange('estate', e.target.value)} disabled={isLoading}>
                    <option value="">All Estates</option>
                    {filterOptions.estates.map(estate => (
                        <option key={estate} value={estate}>{estate}</option>
                    ))}
                </select>
            </div>

            <div className="performance-table">
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
                ) : noData ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#ff0000' }}>
                        No data available for the selected date range and filters.
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Pilot</th>
                                <th>Group</th>
                                <th>Plantation</th>
                                <th>Region</th>
                                <th>Estate</th>
                                <th>Field Name</th>
                                <th>Assigned Area (ha)</th>
                                <th>Completed Area (ha)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.date}</td>
                                    <td>{item.pilotName}</td>
                                    <td>{item.group}</td>
                                    <td>{item.plantation}</td>
                                    <td>{item.region}</td>
                                    <td>{item.estate}</td>
                                    <td>{item.fieldName}</td>
                                    <td>{item.fieldArea.toFixed(2)}</td>
                                    <td>{item.completedArea.toFixed(2)}</td>
                                    <td>{getStatusText(item.taskStatus)}</td>
                                </tr>
                            ))}

                            {filteredData.length > 0 && (
                                <tr style={{ fontWeight: 'bold' }}>
                                    <td colSpan="7" style={{ textAlign: 'center' }}>Total</td>
                                    <td>{totals.fieldArea.toFixed(2)}</td>
                                    <td>{totals.completedArea.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            )}

                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center' }}>
                                        No data found for the selected filters and date range
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OpsReport1;