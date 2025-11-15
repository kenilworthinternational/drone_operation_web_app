import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import '../../../styles/finance.css';
import { useAppDispatch } from '../../../store/hooks';
import { baseApi } from '../../../api/services/allEndpoints';
import DatePicker from 'react-datepicker';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Bars } from "react-loader-spinner";
import { FiRefreshCw, FiDownload, FiPrinter } from "react-icons/fi";
const EstateSprayedAreaReport = () => {
    const dispatch = useAppDispatch();
    const [plantations, setPlantations] = useState([]);
    const [selectedPlantation, setSelectedPlantation] = useState(null);
    const [estates, setEstates] = useState([]);
    const [selectedEstates, setSelectedEstates] = useState([]);
    const today = new Date();
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState([firstDayOfMonth, today]);
    const [reportData, setReportData] = useState([]);
    const processedData = [];
    const [selectedMissionType, setSelectedMissionType] = useState('all');

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
                    setSelectedEstates([]); // Reset selected estates
                    setReportData([]); // Clear previous report data
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
    }, [selectedPlantation]); // This effect runs when selectedPlantation changes


    // Add this useEffect for fetching financial reports
    useEffect(() => {
        const fetchReportData = async () => {
            if (selectedPlantation && selectedEstates.length > 0 && selectedDates[0] && selectedDates[1]) {
                try {
                    setLoading(true);
                    const startDate = selectedDates[0].toLocaleDateString('en-CA');
                    const endDate = selectedDates[1].toLocaleDateString('en-CA');

                    const result = await dispatch(baseApi.endpoints.getFinanceReport.initiate({ startDate, endDate, estates: selectedEstates }));
                    const response = result.data;

                    if (response && typeof response === 'object') {
                        // Check if response has status field and it's false
                        if (response.status === false || response.status === "false") {
                            setReportData([]);
                            setError(null);
                            return;
                        }

                        // Convert response object to array and filter out non-estate entries (like 'total')
                        const estatesData = Object.values(response).filter(item => item.estate_id);

                        const processedData = [];

                        estatesData.forEach(estate => {
                            estate.plans.forEach(plan => {
                                plan.fields.forEach(field => {
                                    // Sum dji_field_area from all tasks in the field
                                    let djiFieldArea = 0;
                                    if (Array.isArray(field.task) && field.task.length > 0) {
                                        djiFieldArea = field.task.reduce((sum, t) => sum + (Number(t.dji_field_area) || 0), 0);
                                    }
                                    // Remove the filter: if (djiFieldArea > 0)
                                    processedData.push({
                                        date: plan.plan_date,
                                        fieldName: field.field_short_name || field.field_name,
                                        pilotNames: field.pilot_names?.map(p => p.pilot_name).join(', ') || 'N/A',
                                        landExtent: Number(field.field_extent) || 0,
                                        fieldExtent: djiFieldArea,
                                        missionType: plan.mission_type_name
                                    });
                                });
                            });
                        });

                        // Remove duplicates based on fieldName, date, and pilotNames
                        // const uniqueData = processedData.filter(
                        //     (row, index, self) =>
                        //         index ===
                        //         self.findIndex(
                        //             (t) => t.date === row.date && t.fieldName === row.fieldName && t.pilotNames === row.pilotNames
                        //         )
                        // );
                        //
                        // uniqueData.sort((a, b) => new Date(a.date) - new Date(b.date));
                        //
                        // setReportData(uniqueData);
                        setReportData(processedData);
                    } else {
                        // If response is not an object or is null/undefined, clear the data
                        setReportData([]);
                        setError(null);
                    }
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
        setSelectedEstates([]); // This will trigger the selection useEffect
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
        if (reportData.length === 0) return;

        // Filter out rows with fieldExtent <= 0
        const filteredData = reportData.filter(row => {
            const missionMatch = selectedMissionType === 'all' || row.missionType === selectedMissionType;
            return missionMatch && row.fieldExtent > 0;
        });

        if (filteredData.length === 0) return;

        // Calculate totals
        const totalLandExtent = filteredData.reduce((sum, row) => sum + row.landExtent, 0).toFixed(2);
        const totalFieldExtent = filteredData.reduce((sum, row) => sum + row.fieldExtent, 0).toFixed(2);

        const formattedData = filteredData.map((row, index) => ({
            No: index + 1,
            Date: row.date ? new Date(row.date).toLocaleDateString() : "Invalid Date",
            "Field Name": row.fieldName,
            "Pilot Name": row.pilotNames,
            "Field Extent": row.landExtent.toFixed(2),
            "Completed Extent": row.fieldExtent.toFixed(2),
            "Mission Type": row.missionType,
        }));

        // Add totals as the last row
        formattedData.push({
            No: "Total",
            Date: "",
            "Field Name": "",
            "Pilot Name": "",
            "Field Extent": totalLandExtent,
            "Completed Extent": totalFieldExtent,
            "Mission Type": "",
        });

        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Finance Report");
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
        const excelEstateNames = estates
            .filter(e => selectedEstates.includes(e.id))
            .map(e => e.estate.replace(/\s+/g, '_'))
            .join('_') || 'All_Estates';
        XLSX.writeFile(wb, `Finance_Report_${excelEstateNames}_${formatDate(selectedDates[0])}_to_${formatDate(selectedDates[1])}_${selectedMissionType}.xlsx`);
    };

    const exportPdf = () => {
        const filteredData = reportData.filter(row => {
            const missionMatch = selectedMissionType === 'all' || row.missionType === selectedMissionType;
            return missionMatch && row.fieldExtent > 0;
        });

        if (filteredData.length === 0) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 15;

        // Add Logo
        const logo = new Image();
        logo.src = '../../assets/images/kenilowrthlogoDark.png';
        doc.addImage(logo, 'PNG', 10, 10, 30, 30);

        // Company Info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.text("Kenilworth International Lanka Pvt Ltd", pageWidth / 2, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text("7B , 1/1 D.W Rupasinghe Mawatha, Nugegoda", pageWidth / 2, 30, { align: 'center' });

        // Plantation Info
        const selectedPlantationData = plantations.find(p => p.id === selectedPlantation);
        const plantation = selectedPlantationData ? selectedPlantationData.plantation : "N/A";
        const selectedEstateNames = estates
            .filter(estate => selectedEstates.includes(estate.id))
            .map(estate => estate.estate)
            .join(", ");
        const monthYear = new Date(selectedDates[0]).toLocaleString('default', { month: 'long' }) + " - " + new Date(selectedDates[0]).getFullYear();

        let currentY = 45;
        doc.text(`Plantation: ${plantation}`, marginX, currentY);
        currentY += 5;
        const estateText = `Estate: ${selectedEstateNames}`;
        const estateWrapped = doc.splitTextToSize(estateText, pageWidth - marginX * 2);
        doc.text(estateWrapped, marginX, currentY);
        currentY += estateWrapped.length * 5;
        doc.text(`Month: ${monthYear}`, marginX, currentY);
        currentY += 7;
        doc.text(`${monthYear} Work Summary`, pageWidth / 2, currentY, { align: 'center' });

        // Table Data with Totals Row
        const tableData = filteredData.map((row, index) => [
            index + 1,
            row.date ? new Date(row.date).toLocaleDateString() : "Invalid Date",
            row.fieldName,
            // row.pilotNames,
            row.landExtent.toFixed(2),
            row.fieldExtent.toFixed(2),
            row.missionType
        ]);

        // Add Totals Row
        const totalLandExtent = filteredData.reduce((sum, row) => sum + row.landExtent, 0).toFixed(2);
        const totalFieldExtent = filteredData.reduce((sum, row) => sum + row.fieldExtent, 0).toFixed(2);
        tableData.push([
            'Total',
            '',
            '',
            // '',
            totalLandExtent,
            totalFieldExtent,
            ''
        ]);

        autoTable(doc, {
            head: [["No", "Date", "Field Name", "Field Extent", "Completed Extent", "Mission Type"]],
            body: tableData,
            startY: currentY + 5,
            // Start at currentY on the first page, but keep a small top margin on subsequent pages
            margin: { top: 20, bottom: 50 },
            theme: 'grid',
            headStyles: {
                fillColor: [0, 75, 113],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            didParseCell: (hookData) => {
                if (hookData.section === 'body') {
                    const isLastRow = hookData.row.index === tableData.length - 1;
                    if (isLastRow) {
                        hookData.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        });

        // Draw footer ONCE after the table on the final page
        const tableEndY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : currentY + 10;
        let footerStartY = tableEndY + 12;
        if (footerStartY + 40 > pageHeight - 10) {
            doc.addPage();
            footerStartY = 20;
        }
        doc.setFontSize(9);
        // Info line
        doc.text(
            "This is a system-generated report. No signature required from KWIL. Contact : 071 617 1177",
            pageWidth / 2,
            footerStartY,
            { align: 'center' }
        );
        // Horizontal line
        doc.setLineWidth(0.5);
        doc.line(15, footerStartY + 2, pageWidth - 15, footerStartY + 2);
        // Approval sentence
        doc.text(
            "The above work summary is correct and approved for the payments",
            pageWidth - 100,
            footerStartY + 10,
            { align: 'right' }
        );
        // Signature fields
        const sigY = footerStartY + 20;
        doc.text("Signature:", 16, sigY);
        doc.text("Name:", 16, sigY + 10);
        const rightColX = pageWidth - 90;
        doc.text("Stamp:", rightColX, sigY);
        doc.text("Date:", rightColX, sigY + 10);

        // Get selected estate names from estates array for PDF
        const pdfEstateNames = estates
            .filter(e => selectedEstates.includes(e.id))
            .map(e => e.estate.replace(/\s+/g, '_'))
            .join('_') || 'All_Estates';
        doc.save(`Finance_Report_${pdfEstateNames}_${formatDate(selectedDates[0])}_to_${formatDate(selectedDates[1])}_${selectedMissionType}.pdf`);
    };

    // Helper to format date as YYYY-MM-DD (move above both exportToExcel and exportPdf)
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="finance">
            <div className="top-finance-part">
                <div className="plantationpicker-finance">
                    <label htmlFor="finance-plantation-search">Select Plantation:</label>
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
                            className="finance-clear-button"
                            onClick={handleClearSelection}
                            aria-label="Clear selection"
                        >
                            x
                        </button>
                    )}

                </div>
                <div className="mission-filter-container">
                    <label htmlFor="mission-type-filter">Mission Type: </label>
                    <select
                        id="mission-type-filter"
                        value={selectedMissionType}
                        onChange={(e) => setSelectedMissionType(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="Spray">Spray</option>
                        <option value="Spread">Spread</option>
                    </select>
                </div>
                <div className="daterangepicker-finance">
                    {/* Select Date Text at the Top */}
                    <p className="select-date-text text-finance" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                        Select Date
                    </p>

                    {/* Display Date Range */}
                    <p className="date-range" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                        {selectedDates[0].toLocaleDateString()} - {selectedDates[1]?.toLocaleDateString()}
                    </p>

                    {/* Calendar Picker */}
                    {isCalendarOpen && (
                        <div className="react-date-picker-finance">
                            <DatePicker
                                selected={selectedDates[0]}
                                onChange={handleDateChange}
                                startDate={selectedDates[0]}
                                endDate={selectedDates[1]}
                                selectsRange
                                inline
                                disabled={loading}
                            />
                        </div>
                    )}
                </div>

                {dropdownOpen && (
                    <div
                        className="finance-dropdown-list"
                        role="listbox"
                        aria-labelledby="plantation-search"
                    >
                        {filteredPlantations.length === 0 ? (
                            <div className="finance-no-results">No matching plantations found</div>
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
                <div className="download-buttons">
                    {reportData.length > 0 && (
                        <button
                            onClick={exportToExcel}
                            className="flex items-center bg-green-500 text-white"
                        >
                            <FiDownload className="mr-2" />
                            Excel
                        </button>
                    )}
                    {reportData.length > 0 && (
                        <button
                            onClick={exportPdf}
                            className="flex items-center bg-red-600 text-white"
                        >
                            <FiPrinter className="mr-2" />
                            PDF
                        </button>
                    )}
                </div>
            </div>


            {selectedDates[0] && selectedDates[1] && selectedPlantation && (
                <div className="bottom-finance-part">
                    <div className="bottom-finance-part-left">

                        {estates.length > 0 && (
                            <div className="finance-checkbox-group" role="group" aria-labelledby="estate-selection">
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

                                <div className="finance-estates-list">
                                    {estates.map((estate) => (
                                        <div key={estate.id} className="estate-item-fin">
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


                    <div className="bottom-finance-part-right">
                        {loading && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <Bars
                                height="80"
                                width="80"
                                color="#4180B9"
                                ariaLabel="bars-loading"
                                visible={true}
                            />
                        </div>}
                        {error && <div className="error-message">{error}</div>}

                        {!loading && !error && (
                            reportData.length > 0 ? (
                                <div className="finance-table-container">
                                    <table className="finance-report-table">
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Date</th>
                                                <th>Field Name</th>
                                                <th>Pilot Name</th>
                                                <th>Field Extent</th>
                                                <th>Completed Extent</th>
                                                <th>Mission Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData
                                                .filter(row => {
                                                    const missionMatch = selectedMissionType === 'all' || row.missionType === selectedMissionType;
                                                    return missionMatch && row.fieldExtent > 0;
                                                })
                                                .map((row, index) => {
                                                    const safeDate = row.date ? new Date(row.date) : null;
                                                    return (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                {safeDate && !isNaN(safeDate)
                                                                    ? safeDate.toLocaleDateString()
                                                                    : 'Invalid Date'}
                                                            </td>
                                                            <td>{row.fieldName}</td>
                                                            <td>{row.pilotNames}</td>
                                                            <td>{(row.landExtent || 0).toFixed(2)}</td>
                                                            <td>{(row.fieldExtent || 0).toFixed(2)}</td>
                                                            <td>{row.missionType}</td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="4"><strong>Total</strong></td>
                                                <td>
                                                    <strong>
                                                        {reportData
                                                            .filter(row => {
                                                                const missionMatch = selectedMissionType === 'all' || row.missionType === selectedMissionType;
                                                                return missionMatch && row.fieldExtent > 0;
                                                            })
                                                            .reduce((sum, row) => sum + row.landExtent, 0)
                                                            .toFixed(2)}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {reportData
                                                            .filter(row => {
                                                                const missionMatch = selectedMissionType === 'all' || row.missionType === selectedMissionType;
                                                                return missionMatch && row.fieldExtent > 0;
                                                            })
                                                            .reduce((sum, row) => sum + row.fieldExtent, 0)
                                                            .toFixed(2)}
                                                    </strong>
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>

                                    </table>
                                </div>
                            ) : (
                                <div className="no-data-message">
                                    No data available for selected criteria
                                </div>
                            )
                        )}

                    </div>

                </div>
            )}



        </div>
    );
};

export default EstateSprayedAreaReport;

