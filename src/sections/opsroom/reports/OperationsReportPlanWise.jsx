import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import '../../../styles/ops2.css';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import DatePicker from 'react-datepicker';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Bars } from "react-loader-spinner";
import { FiDownload, FiPrinter } from "react-icons/fi";
const OperationsReportPlanWise = () => {
    const dispatch = useAppDispatch();
    const [plantations, setPlantations] = useState([]);
    const [selectedPlantation, setSelectedPlantation] = useState(null);
    const [estates, setEstates] = useState([]);
    const [selectedEstates, setSelectedEstates] = useState([]);
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState([firstDayOfMonth, today]);
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        const fetchPlantations = async () => {
            try {
                setLoading(true);
                const result = await dispatch(baseApi.endpoints.getAllPlantations.initiate());
                const data = result.data;
                setPlantations(data);
                setError(null);
            } catch (err) {
                setError("Failed to load plantations");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlantations();
    }, []);

    useEffect(() => {
        const fetchEstates = async () => {
            if (selectedPlantation) {
                try {
                    setLoading(true);
                    const result = await dispatch(baseApi.endpoints.getEstatesByPlantation.initiate(selectedPlantation));
                    const data = result.data;
                    setEstates(data);
                    setSelectedEstates([]);
                    setError(null);
                } catch (err) {
                    setError("Failed to load estates");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchEstates();
    }, [selectedPlantation]);

    useEffect(() => {
        const fetchReportData = async () => {
            if (selectedPlantation && selectedEstates.length > 0 && selectedDates[0] && selectedDates[1]) {
                try {
                    setLoading(true);
                    const startDate = selectedDates[0].toLocaleDateString('en-CA');
                    const endDate = selectedDates[1].toLocaleDateString('en-CA');
                    const estateIds = selectedEstates.map(id => Number(id));

                    const result = await dispatch(baseApi.endpoints.getFinanceReport.initiate({
                        startDate,
                        endDate,
                        estates: estateIds
                    }));
                    const response = result.data;
                    const processedData = [];
                    const planMap = new Map();

                    const allEstates = Object.values(response)
                        .filter(item => item.estate_id);

                    allEstates.forEach(estate => {
                        estate.plans.forEach(plan => {
                            const planKey = `${estate.estate_id}-${plan.plan_id}-${plan.plan_date}`;

                            if (!planMap.has(planKey)) {
                                planMap.set(planKey, {
                                    date: plan.plan_date,
                                    planId: plan.plan_id,
                                    estateId: estate.estate_id,
                                    estateName: estate.estate,
                                    planType: plan.plan_type.toUpperCase(),
                                    totalHa: plan.planned_ha,
                                    completed: 0,
                                    managerCanceled: 0,
                                    teamLeadCanceled: 0,
                                    rescheduledHa: plan.total_rechedule_extent
                                });
                            }
                            const planEntry = planMap.get(planKey);

                            plan.fields.forEach(field => {
                                if (field.manager_status === 0) {
                                    planEntry.managerCanceled += field.field_extent;
                                } else {
                                    // Sum dji_field_area from all tasks in the field
                                    let completed = 0;
                                    if (Array.isArray(field.task) && field.task.length > 0) {
                                        completed = field.task.reduce((sum, t) => sum + (Number(t.dji_field_area) || 0), 0);
                                    }
                                    planEntry.completed += completed;

                                    // Only add to teamLeadCanceled if status_team_lead === 'x'
                                    if (field.status_team_lead === 'x') {
                                        planEntry.teamLeadCanceled += field.field_extent;
                                    }
                                }
                            });
                        });
                    });

                    planMap.forEach(plan => {
                        // Calculate incomplete for each plan
                        const incomplete = plan.totalHa - (plan.rescheduledHa + plan.completed + plan.managerCanceled);
                        console.log("incomplete","ID", plan.planId , incomplete,"totalHa", plan.totalHa, "rescheduledHa", plan.rescheduledHa, "completed", plan.completed, "managerCanceled", plan.managerCanceled);
                        processedData.push({
                            ...plan,
                            estateName: plan.estateName,
                            planDetails: `${plan.totalHa.toFixed(2)} Ha (${plan.planType})`,
                            incomplete: incomplete
                        });
                    });

                    setReportData(processedData);
                } catch (err) {
                    setError("Failed to load report data");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchReportData();
    }, [selectedEstates, selectedDates, selectedPlantation]);

    const calculateTotals = () => {
        const totals = {
            totalHa: 0,
            rescheduledHa: 0,
            completed: 0,
            managerCanceled: 0,
            teamLeadCanceled: 0,
            incomplete: 0
        };

        reportData.forEach(row => {
            totals.totalHa += row.totalHa;
            totals.rescheduledHa += row.rescheduledHa;
            totals.completed += row.completed;
            totals.managerCanceled += row.managerCanceled;
            totals.teamLeadCanceled += row.teamLeadCanceled;
            totals.incomplete += row.incomplete;
        });

        return totals;
    };

    const totals = calculateTotals();

    const handlePlantationChange = (event) => {
        setSearchTerm(event.target.value);
        setDropdownOpen(true);
    };

    const handlePlantationSelect = (id) => {
        const selected = plantations.find(p => p.id === id);
        if (!selected) return;

        setSelectedPlantation(id);
        setSearchTerm(selected.plantation);
        setDropdownOpen(false);
    };

    const handleClearSelection = () => {
        setSelectedPlantation(null);
        setSearchTerm("");
        setEstates([]);
        setSelectedEstates([]);
    };

    const handleCheckboxChange = (estateId) => {
        setSelectedEstates(prev =>
            prev.includes(estateId)
                ? prev.filter(id => id !== estateId)
                : [...prev, estateId]
        );
    };

    const handleSelectAll = () => {
        setSelectedEstates(prev =>
            prev.length === estates.length
                ? []
                : estates.map(estate => estate.id)
        );
    };

    const filteredPlantations = plantations.filter(p =>
        p.plantation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDateChange = (dates) => {
        setSelectedDates(dates);
        if (dates[0] && dates[1]) {
            setIsCalendarOpen(false);
        }
    };

    const exportToExcel = () => {
        const headers = [
            'Date',
            'Plan ID',
            'Estate',
            'Total (Plan Type)',
            'Rescheduled (Ha)',
            'Completed Area (Ha)',
            'Manager Canceled (Ha)',
            'Team Lead Canceled (Ha)',
            'Incomplete (Ha)'
        ];

        const dataRows = reportData.map(row => ({
            Date: row.date,
            'Plan ID': row.planId,
            Estate: row.estateName,
            'Total (Plan Type)': row.planDetails,
            'Rescheduled (Ha)': typeof row.rescheduledHa === 'number' ? row.rescheduledHa.toFixed(2) : '0.00',
            'Completed Area (Ha)': typeof row.completed === 'number' ? row.completed.toFixed(2) : '0.00',
            'Manager Canceled (Ha)': typeof row.managerCanceled === 'number' ? row.managerCanceled.toFixed(2) : '0.00',
            'Team Lead Canceled (Ha)': typeof row.teamLeadCanceled === 'number' ? row.teamLeadCanceled.toFixed(2) : '0.00',
            'Incomplete (Ha)': typeof row.incomplete === 'number' ? row.incomplete.toFixed(2) : '0.00'
        }));

        dataRows.push({
            Date: 'Total',
            'Plan ID': '',
            Estate: '',
            'Total (Plan Type)': typeof totals.totalHa === 'number' ? totals.totalHa.toFixed(2) : '0.00',
            'Rescheduled (Ha)': typeof totals.rescheduledHa === 'number' ? totals.rescheduledHa.toFixed(2) : '0.00',
            'Completed Area (Ha)': typeof totals.completed === 'number' ? totals.completed.toFixed(2) : '0.00',
            'Manager Canceled (Ha)': typeof totals.managerCanceled === 'number' ? totals.managerCanceled.toFixed(2) : '0.00',
            'Team Lead Canceled (Ha)': typeof totals.teamLeadCanceled === 'number' ? totals.teamLeadCanceled.toFixed(2) : '0.00',
            'Incomplete (Ha)': typeof totals.incomplete === 'number' ? totals.incomplete.toFixed(2) : '0.00'
        });

        const worksheet = XLSX.utils.json_to_sheet(dataRows, { header: headers });
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
        // Get selected estate names from estates array
        const selectedEstateNames = estates
            .filter(e => selectedEstates.includes(e.id))
            .map(e => e.estate.replace(/\s+/g, '_'))
            .join('_') || 'All_Estates';
        XLSX.writeFile(workbook, `Operations_Report_Plan_Wise_${selectedEstateNames}_${formatDate(selectedDates[0])}_to_${formatDate(selectedDates[1])}.xlsx`);
    };

    const exportPdf = () => {
        const doc = new jsPDF();
        const totals = calculateTotals();

        doc.setFontSize(16);
        doc.text("Operations Report (Plan wise)", 14, 15);
        doc.setFontSize(10);

        const body = reportData.map(row => [
            row.date,
            row.planId,
            row.estateName,
            row.planDetails,
            typeof row.rescheduledHa === 'number' ? row.rescheduledHa.toFixed(2) : '0.00',
            typeof row.completed === 'number' ? row.completed.toFixed(2) : '0.00',
            typeof row.managerCanceled === 'number' ? row.managerCanceled.toFixed(2) : '0.00',
            typeof row.teamLeadCanceled === 'number' ? row.teamLeadCanceled.toFixed(2) : '0.00',
            typeof row.incomplete === 'number' ? row.incomplete.toFixed(2) : '0.00'
        ]);

        body.push([
            'Total',
            '',
            '',
            typeof totals.totalHa === 'number' ? totals.totalHa.toFixed(2) : '0.00',
            typeof totals.rescheduledHa === 'number' ? totals.rescheduledHa.toFixed(2) : '0.00',
            typeof totals.completed === 'number' ? totals.completed.toFixed(2) : '0.00',
            typeof totals.managerCanceled === 'number' ? totals.managerCanceled.toFixed(2) : '0.00',
            typeof totals.teamLeadCanceled === 'number' ? totals.teamLeadCanceled.toFixed(2) : '0.00',
            typeof totals.incomplete === 'number' ? totals.incomplete.toFixed(2) : '0.00'
        ]);

        autoTable(doc, {
            startY: 25,
            head: [
                ['Date', 'Plan ID', 'Estate', 'Ha (Plan Type)', 'Rescheduled', 'Completed', 'Manager', 'Team Lead', 'Incomplete']
            ],
            body: body,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 1.5,
                halign: 'center'
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'left' },
                1: { cellWidth: 20, halign: 'left' },
                2: { cellWidth: 30 },
                3: { cellWidth: 25 },
                4: { cellWidth: 25 },
                5: { cellWidth: 25 },
                6: { cellWidth: 25 },
                7: { cellWidth: 25 },
                8: { cellWidth: 25 }
            },
            didParseCell: (data) => {
                if (data.row.index === body.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
            willDrawCell: (data) => {
                if (data.row.index === body.length - 1) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                }
            }
        });

        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.width - 25,
                doc.internal.pageSize.height - 5
            );
        }

        // Helper to format date as YYYY-MM-DD (reuse above or define here if needed)
        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        // Get selected estate names from estates array
        const selectedEstateNames = estates
            .filter(e => selectedEstates.includes(e.id))
            .map(e => e.estate.replace(/\s+/g, '_'))
            .join('_') || 'All_Estates';
        doc.save(`Operations_Report_Plan_Wise_${selectedEstateNames}_${formatDate(selectedDates[0])}_to_${formatDate(selectedDates[1])}.pdf`);
    };

    // Collect incomplete fields for a separate table
    const incompleteFields = [];
    reportData.forEach(plan => {
        // You may want to check plan fields here, but since reportData is flattened, you may need to keep a reference to fields in processedData if you want more details.
        // For now, this is a placeholder for how you might collect incomplete fields if you keep them in processedData.
    });

    return (
        <div className="ops">
            <div className="top-ops-part">
                <div className="plantationpicker-ops">
                    <label htmlFor="ops-plantation-search">Select Plantation:</label>
                    <input
                        id="plantation-search"
                        type="text"
                        value={searchTerm}
                        onChange={handlePlantationChange}
                        placeholder="Type to search plantation..."
                        onFocus={() => setDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                        className="search-input"
                        aria-expanded={dropdownOpen}
                        aria-haspopup="listbox"
                    />
                    {searchTerm && (
                        <button
                            className="ops-clear-button"
                            onClick={handleClearSelection}
                            aria-label="Clear selection"
                        >
                            x
                        </button>
                    )}
                </div>

                <div className="daterangepicker-ops">
                    <p className="select-date-text text-ops" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                        Select Date
                    </p>
                    <p className="date-range" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                        {selectedDates[0].toLocaleDateString()} - {selectedDates[1]?.toLocaleDateString()}
                    </p>
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
                </div>
                {dropdownOpen && (
                    <div
                        className="ops-dropdown-list"
                        role="listbox"
                        aria-labelledby="plantation-search"
                    >
                        {filteredPlantations.length === 0 ? (
                            <div className="ops-no-results">No matching plantations found</div>
                        ) : (
                            filteredPlantations.map((p) => (
                                <div
                                    key={p.id}
                                    role="option"
                                    aria-selected={selectedPlantation === p.id}
                                    onClick={() => handlePlantationSelect(p.id)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="dropdown-item"
                                >
                                    {p.plantation}
                                </div>
                            ))
                        )}
                    </div>
                )}
                <button
                    onClick={exportToExcel}
                    className="flex items-center bg-green-500 text-white"
                >
                    <FiDownload className="mr-2" />
                    Excel
                </button>
                <button
                    onClick={exportPdf}
                    className="flex items-center bg-red-600 text-white"
                >
                    <FiPrinter className="mr-2" />
                    PDF
                </button>
            </div>
            {selectedDates[0] && selectedDates[1] && selectedPlantation && (
                <div className="bottom-ops-part">
                    <div className="bottom-ops-part-left">
                        {estates.length > 0 && (
                            <div className="ops-checkbox-group" role="group" aria-labelledby="estate-selection">
                                <div className="select-all-container">
                                    <input
                                        type="checkbox"
                                        id="select-all"
                                        checked={selectedEstates.length === estates.length}
                                        onChange={handleSelectAll}
                                        aria-label={selectedEstates.length === estates.length ?
                                            "Unselect all estates" : "Select all estates"}
                                    />
                                    <label htmlFor="select-all">Select All</label>
                                </div>

                                <div className="ops-estates-list">
                                    {estates.map((estate) => (
                                        <div key={estate.id} className="estate-item-ops2">
                                            <input
                                                type="checkbox"
                                                id={`estate-${estate.id}`}
                                                checked={selectedEstates.includes(estate.id)}
                                                onChange={() => handleCheckboxChange(estate.id)}
                                            />
                                            <label htmlFor={`estate-${estate.id}`}>
                                                {estate.estate}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bottom-ops-part-right">
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                <Bars
                                    height="80"
                                    width="80"
                                    color="#4180B9"
                                    ariaLabel="bars-loading"
                                    visible={true}
                                />
                            </div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : (
                            <div className="report-container">
                                {reportData.length > 0 ? (
                                    <>
                                        <div className="table-container">
                                            <table className="report-table">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Plan ID</th>
                                                        <th>Estate (AP/NP/RP)</th>
                                                        <th>Total Ha (Plan Type)</th>
                                                        <th>Rescheduled (Ha)</th>
                                                        <th>Completed (Ha)</th>
                                                        <th>Manager Canceled (Ha)</th>
                                                        <th>Team Lead Canceled (Ha)</th>
                                                        <th>Incomplete (Ha)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.map((row, index) => (
                                                        <tr key={index}>
                                                            <td>{row.date}</td>
                                                            <td>{row.planId}</td>
                                                            <td>{row.estateName}</td>
                                                            <td>{row.planDetails}</td>
                                                            <td>{typeof row.rescheduledHa === 'number' ? row.rescheduledHa.toFixed(2) : '0.00'}</td>
                                                            <td>{typeof row.completed === 'number' ? row.completed.toFixed(2) : '0.00'}</td>
                                                            <td>{typeof row.managerCanceled === 'number' ? row.managerCanceled.toFixed(2) : '0.00'}</td>
                                                            <td>{typeof row.teamLeadCanceled === 'number' ? row.teamLeadCanceled.toFixed(2) : '0.00'}</td>
                                                            <td>{typeof row.incomplete === 'number' ? row.incomplete.toFixed(2) : '0.00'}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="total-row">
                                                        <td colSpan="3">Total</td>
                                                        <td>{typeof totals.totalHa === 'number' ? totals.totalHa.toFixed(2) : '0.00'}</td>
                                                        <td>{typeof totals.rescheduledHa === 'number' ? totals.rescheduledHa.toFixed(2) : '0.00'}</td>
                                                        <td>{typeof totals.completed === 'number' ? totals.completed.toFixed(2) : '0.00'}</td>
                                                        <td>{typeof totals.managerCanceled === 'number' ? totals.managerCanceled.toFixed(2) : '0.00'}</td>
                                                        <td>{typeof totals.teamLeadCanceled === 'number' ? totals.teamLeadCanceled.toFixed(2) : '0.00'}</td>
                                                        <td>{typeof totals.incomplete === 'number' ? totals.incomplete.toFixed(2) : '0.00'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#ff0000' }}>
                                        No data available for the selected date range and filters.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperationsReportPlanWise;
