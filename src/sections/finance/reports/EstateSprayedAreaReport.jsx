import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import '../../../styles/finance.css';
import { useLazyGetFieldWiseFinanceReportQuery } from '../../../api/services NodeJs/financeReportApi';
import { useLazyGetPlantationsListQuery, useLazyGetEstatesListQuery } from '../../../api/services NodeJs/plantationDashboardApi';
import {
    useLazyGetWorkSummaryBillingDraftQuery,
    useSaveWorkSummaryBillingDraftMutation,
    useCreateWorkSummaryPdfDocumentMutation,
} from '../../../api/services NodeJs/financeWorkSummaryBillingApi';
import DatePicker from 'react-datepicker';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Bars } from "react-loader-spinner";
import { FiRefreshCw, FiDownload, FiPrinter, FiFileText } from "react-icons/fi";
import CreatePlantationInvoiceModal from './CreatePlantationInvoiceModal';
import PlantationInvoicePrint from './PlantationInvoicePrint';
import {
    buildWorkSummaryPdfDocument,
    buildPdfSnapshotLines,
    getWorkSummaryPdfFileName,
} from './workSummaryPdfExport';

/** Same 2dp rounding as the table; avoids false "issue" rows when floats differ only below display precision. */
const hasFinanceExtentIssue = (row) => {
    if (!row) return false;
    const land = Number((Number(row.landExtent) || 0).toFixed(2));
    const completed = Number((Number(row.fieldExtent) || 0).toFixed(2));
    return land < completed;
};

const rowBillingKey = (row) => `${row.planId}:${row.fieldId}`;

const isBillingIncluded = (row, inclusionMap) => {
    if (!row?.hasChargeableReason) return true;
    return inclusionMap[rowBillingKey(row)] !== false;
};

const resolveBillingExtent = (row, inclusionMap) => {
    if (row.hasChargeableReason) {
        return isBillingIncluded(row, inclusionMap) ? (Number(row.landExtent) || 0) : 0;
    }
    return Number(row.fieldExtent) || 0;
};

const rowHasReasonText = (row) => {
    const text = String(row?.comNarration || '').trim();
    return text !== '' && text !== '-';
};

const extractListData = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
    const numericKeys = Object.keys(payload).filter((k) => !isNaN(Number(k)));
    if (numericKeys.length > 0) {
        return numericKeys
            .sort((a, b) => Number(a) - Number(b))
            .map((k) => payload[k])
            .filter(Boolean);
    }
    return [];
};

const EstateSprayedAreaReport = ({ onInvoicePreview }) => {
    const [triggerFieldWiseFinanceReport] = useLazyGetFieldWiseFinanceReportQuery();
    const [triggerPlantationsList] = useLazyGetPlantationsListQuery();
    const [triggerEstatesList] = useLazyGetEstatesListQuery();
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
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [localPreviewInvoice, setLocalPreviewInvoice] = useState(null);
    const [billingInclusion, setBillingInclusion] = useState({});
    const saveDraftTimerRef = useRef(null);

    const [fetchBillingDraft] = useLazyGetWorkSummaryBillingDraftQuery();
    const [saveBillingDraft] = useSaveWorkSummaryBillingDraftMutation();
    const [createPdfDocument] = useCreateWorkSummaryPdfDocumentMutation();

    const showInvoicePreview = (inv) => {
        if (onInvoicePreview) {
            onInvoicePreview(inv);
        } else {
            setLocalPreviewInvoice(inv);
        }
    };

    const getBillingContext = useCallback(() => {
        if (!selectedPlantation || !selectedDates[0] || !selectedDates[1]) return null;
        return {
            plantation_id: selectedPlantation,
            start_date: selectedDates[0].toLocaleDateString('en-CA'),
            end_date: selectedDates[1].toLocaleDateString('en-CA'),
            estates: selectedEstates,
            mission_filter: selectedMissionType,
        };
    }, [selectedPlantation, selectedDates, selectedEstates, selectedMissionType]);

    const buildDraftLines = useCallback((rows, inclusionMap) => {
        return (rows || [])
            .filter((r) => r.hasChargeableReason)
            .map((r) => {
                const key = rowBillingKey(r);
                return {
                    plan_id: r.planId,
                    field_id: r.fieldId,
                    estate_id: r.estateId,
                    field_name: r.fieldName,
                    pilot_names: r.pilotNames,
                    plan_date: r.date ? String(r.date).slice(0, 10) : null,
                    mission_type: r.missionType,
                    field_ha: r.landExtent,
                    completed_ha: r.fieldExtent,
                    covered_percent: r.coveredPercent,
                    billing_ha_default: r.landExtent,
                    reason_text: r.comNarration,
                    has_chargeable_reason: 1,
                    is_included: inclusionMap[key] !== false,
                };
            });
    }, []);

    const persistBillingDraft = useCallback(async (inclusionMap) => {
        const ctx = getBillingContext();
        if (!ctx || !reportData.length) return;
        try {
            await saveBillingDraft({
                ...ctx,
                lines: buildDraftLines(reportData, inclusionMap),
            }).unwrap();
        } catch (e) {
            console.error('Failed to save billing draft', e);
        }
    }, [getBillingContext, reportData, buildDraftLines, saveBillingDraft]);

    const schedulePersistBillingDraft = useCallback((inclusionMap) => {
        if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
        saveDraftTimerRef.current = setTimeout(() => {
            persistBillingDraft(inclusionMap);
        }, 400);
    }, [persistBillingDraft]);

    const getFilteredRows = () => {
        const rows = Array.isArray(reportData) ? reportData : [];
        return rows
            .filter(row => {
                const missionMatch = selectedMissionType === 'all' || row.missionType === selectedMissionType;
                const shouldShowByExtent =
                    row.fieldExtent > 0 || row.hasChargeableReason || rowHasReasonText(row);
                return missionMatch && shouldShowByExtent;
            })
            .map((row) => ({
                ...row,
                billingExtent: resolveBillingExtent(row, billingInclusion),
                billingIncluded: isBillingIncluded(row, billingInclusion),
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const toggleBillingInclusion = (row) => {
        if (!row?.hasChargeableReason) return;
        const key = rowBillingKey(row);
        setBillingInclusion((prev) => {
            const currentlyIncluded = prev[key] !== false;
            const next = { ...prev, [key]: !currentlyIncluded };
            schedulePersistBillingDraft(next);
            return next;
        });
    };

    const openInvoiceModal = async () => {
        const inclusionMap = {};
        getFilteredRows().forEach((r) => {
            if (r.hasChargeableReason) {
                inclusionMap[rowBillingKey(r)] = r.billingIncluded;
            }
        });
        await persistBillingDraft(inclusionMap);
        setShowInvoiceModal(true);
    };

    useEffect(() => {
        const fetchPlantations = async () => {
            try {
                setLoading(true);
                const result = await triggerPlantationsList(undefined, true);
                const data = extractListData(result?.data);
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
                    const result = await triggerEstatesList(selectedPlantation, true);
                    const data = extractListData(result?.data);
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
    }, [selectedPlantation, triggerEstatesList]); // This effect runs when selectedPlantation changes


    // Add this useEffect for fetching financial reports
    useEffect(() => {
        const fetchReportData = async () => {
            if (selectedPlantation && selectedEstates.length > 0 && selectedDates[0] && selectedDates[1]) {
                try {
                    setLoading(true);
                    const startDate = selectedDates[0].toLocaleDateString('en-CA');
                    const endDate = selectedDates[1].toLocaleDateString('en-CA');

                    const result = await triggerFieldWiseFinanceReport(
                        {
                            start_date: startDate,
                            end_date: endDate,
                            estates: selectedEstates
                        },
                        true
                    );
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
                            (estate.plans || []).forEach(plan => {
                                (plan.fields || []).forEach(field => {
                                    // Sum dji_field_area from all tasks in the field
                                    let djiFieldArea = 0;
                                    if (Array.isArray(field.task) && field.task.length > 0) {
                                        djiFieldArea = field.task.reduce((sum, t) => sum + (Number(t.dji_field_area) || 0), 0);
                                    }
                                    const comNarration = Array.from(
                                        new Set(
                                            (Array.isArray(field.task) ? field.task : [])
                                                .map((t) => t?.com_naration_reason)
                                                .filter((v) => v && String(v).trim() !== '')
                                        )
                                    ).join(', ');
                                    const hasChargeableReason = (Array.isArray(field.task) ? field.task : [])
                                        .some((t) => Number(t?.com_naration_chargeble) === 1);
                                    const landExtent = Number(field.field_extent) || 0;
                                    const coveredPercent = landExtent > 0
                                        ? (djiFieldArea / landExtent) * 100
                                        : 0;
                                    // Remove the filter: if (djiFieldArea > 0)
                                    processedData.push({
                                        planId: Number(plan.plan_id) || 0,
                                        fieldId: Number(field.field_id) || 0,
                                        estateId: Number(estate.estate_id) || 0,
                                        date: plan.plan_date,
                                        fieldName: field.field_short_name || field.field_name || '',
                                        pilotNames: field.pilot_names?.map(p => p.pilot_name).join(', ') || '',
                                        landExtent,
                                        fieldExtent: djiFieldArea,
                                        missionType: plan.mission_type_name,
                                        comNarration,
                                        hasChargeableReason,
                                        coveredPercent
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
                        setBillingInclusion({});
                    } else {
                        // If response is not an object or is null/undefined, clear the data
                        setReportData([]);
                        setBillingInclusion({});
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

    useEffect(() => {
        const loadDraft = async () => {
            const ctx = getBillingContext();
            if (!ctx || !reportData.length) return;
            try {
                const result = await fetchBillingDraft(ctx);
                if (result.data?.inclusions && typeof result.data.inclusions === 'object') {
                    setBillingInclusion(result.data.inclusions);
                }
            } catch (e) {
                console.error('Failed to load billing draft', e);
            }
        };
        loadDraft();
    }, [reportData, getBillingContext, fetchBillingDraft]);


    const handlePlantationChange = (event) => {
        setSearchTerm(event.target.value);
        setDropdownOpen(true);
    };

    const handlePlantationSelect = (id) => {
        const selected = (Array.isArray(plantations) ? plantations : []).find(p => p.id === id);
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
        const list = Array.isArray(estates) ? estates : [];
        setSelectedEstates(prev =>
            prev.length === list.length
                ? []
                : list.map(estate => estate.id)
        );
    };

    const filteredPlantations = (Array.isArray(plantations) ? plantations : []).filter(p =>
        p.plantation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const safeEstates = Array.isArray(estates) ? estates : [];
    const handleDateChange = (dates) => {
        setSelectedDates(dates);
        if (dates[0] && dates[1]) {
            setIsCalendarOpen(false);
        }
    };

    const exportToExcel = () => {
        if (!Array.isArray(reportData) || reportData.length === 0) return;

        // Filter out rows with fieldExtent <= 0, sort by date ascending
        const filteredData = getFilteredRows();

        if (filteredData.length === 0) return;

        // Calculate totals
        const totalLandExtent = filteredData.reduce((sum, row) => sum + row.landExtent, 0).toFixed(2);
        const totalFieldExtent = filteredData.reduce((sum, row) => sum + row.fieldExtent, 0).toFixed(2);
        const totalBillingExtent = filteredData.reduce((sum, row) => sum + (Number(row.billingExtent) || 0), 0).toFixed(2);

        const formattedData = filteredData.map((row) => ({
            Plan: `${row.planId}-${row.missionType}`,
            Date: row.date ? new Date(row.date).toLocaleDateString() : "Invalid Date",
            "Field Name": row.fieldName,
            "Field(Ha)": row.landExtent.toFixed(2),
            "Completed(Ha)": row.fieldExtent.toFixed(2),
            "Covered %": `${(Number(row.coveredPercent) || 0).toFixed(2)}%`,
            "Billing(Ha)": (Number(row.billingExtent) || 0).toFixed(2),
            "Reason": row.comNarration || '-',
        }));

        // Add totals as the last row
        formattedData.push({
            Plan: "Total",
            Date: "",
            "Field Name": "",
            "Field(Ha)": totalLandExtent,
            "Completed(Ha)": totalFieldExtent,
            "Covered %": "",
            "Billing(Ha)": totalBillingExtent,
            "Reason": "",
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
        const excelEstateNames = (Array.isArray(estates) ? estates : [])
            .filter(e => selectedEstates.includes(e.id))
            .map(e => e.estate.replace(/\s+/g, '_'))
            .join('_') || 'All_Estates';
        XLSX.writeFile(wb, `Finance_Report_${excelEstateNames}_${formatDate(selectedDates[0])}_to_${formatDate(selectedDates[1])}_${selectedMissionType}.xlsx`);
    };

    const exportPdf = async () => {
        const filteredData = getFilteredRows();

        if (filteredData.length === 0) return;

        const selectedPlantationData = (Array.isArray(plantations) ? plantations : []).find(
            (p) => p.id === selectedPlantation
        );
        const plantation = selectedPlantationData ? selectedPlantationData.plantation : 'N/A';
        const selectedEstateNames = (Array.isArray(estates) ? estates : [])
            .filter((estate) => selectedEstates.includes(estate.id))
            .map((estate) => estate.estate)
            .join(', ');

        let savedPdfId = null;
        const ctx = getBillingContext();
        if (ctx) {
            try {
                await persistBillingDraft(billingInclusion);
                const docMeta = await createPdfDocument({
                    ...ctx,
                    plantation_name: plantation,
                    estate_names: selectedEstateNames,
                    pdf_lines: buildPdfSnapshotLines(filteredData),
                }).unwrap();
                savedPdfId = docMeta?.pdf_id ?? null;
                if (savedPdfId) {
                    toast.info(`Work summary PDF record #${savedPdfId} saved`);
                }
            } catch (e) {
                toast.warn('PDF will download, but billing history was not saved');
                console.error(e);
            }
        }

        const doc = buildWorkSummaryPdfDocument({
            plantation,
            estateNames: selectedEstateNames,
            periodStart: selectedDates[0],
            rows: filteredData,
        });

        const formatDateForPdf = (date) => {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };
        const pdfEstateNames = (Array.isArray(estates) ? estates : [])
            .filter((e) => selectedEstates.includes(e.id))
            .map((e) => e.estate.replace(/\s+/g, '_'))
            .join('_') || 'All_Estates';
        const fallbackName = `Finance_Report_${pdfEstateNames}_${formatDateForPdf(selectedDates[0])}_to_${formatDateForPdf(selectedDates[1])}_${selectedMissionType}.pdf`;
        doc.save(savedPdfId ? getWorkSummaryPdfFileName(savedPdfId) : fallbackName);
    };

    const exportIssuesPdf = () => {
        const filteredData = getFilteredRows();
        const issueRows = filteredData.filter(hasFinanceExtentIssue);
        if (issueRows.length === 0) return;

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 15;

        const logo = new Image();
        logo.src = '../../assets/images/kenilowrthlogoDark.png';
        doc.addImage(logo, 'PNG', 10, 10, 30, 30);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.text("Kenilworth International Lanka Pvt Ltd", pageWidth / 2, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text("7B , D.W Rupasinghe Mawatha, Nugegoda", pageWidth / 2, 30, { align: 'center' });

        const selectedPlantationData = (Array.isArray(plantations) ? plantations : []).find(p => p.id === selectedPlantation);
        const plantation = selectedPlantationData ? selectedPlantationData.plantation : "N/A";
        const selectedEstateNames = (Array.isArray(estates) ? estates : [])
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
        doc.text(`Field Wise Financial Report - Issues Only`, pageWidth / 2, currentY, { align: 'center' });

        const tableData = issueRows.map((row, index) => [
            `${row.planId}-${row.missionType}\n${row.date ? new Date(row.date).toLocaleDateString() : "Invalid Date"}`,
            row.fieldName,
            row.landExtent.toFixed(2),
            row.fieldExtent.toFixed(2),
            `${(Number(row.coveredPercent) || 0).toFixed(2)}%`,
            (Number(row.billingExtent) || 0).toFixed(2),
            row.comNarration || '-'
        ]);

        const totalLandExtent = issueRows.reduce((sum, row) => sum + row.landExtent, 0).toFixed(2);
        const totalFieldExtent = issueRows.reduce((sum, row) => sum + row.fieldExtent, 0).toFixed(2);
        const totalBillingExtent = issueRows.reduce((sum, row) => sum + (Number(row.billingExtent) || 0), 0).toFixed(2);
        tableData.push([
            'Total',
            '',
            totalLandExtent,
            totalFieldExtent,
            '',
            totalBillingExtent,
            ''
        ]);

        autoTable(doc, {
            head: [["Plan / Date", "Field Name", "Field(Ha)", "Completed(Ha)", "Covered %", "Billing(Ha)", "Reason"]],
            body: tableData,
            startY: currentY + 5,
            margin: { top: 20, bottom: 50 },
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 28 },
                1: { cellWidth: 24 },
                2: { cellWidth: 16, halign: 'right' },
                3: { cellWidth: 20, halign: 'right' },
                4: { cellWidth: 16, halign: 'right' },
                5: { cellWidth: 16, halign: 'right' },
                6: { cellWidth: 66 },
            },
            headStyles: {
                fillColor: [185, 28, 28],
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

        const tableEndY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : currentY + 10;
        let footerStartY = tableEndY + 12;
        if (footerStartY + 40 > pageHeight - 10) {
            doc.addPage();
            footerStartY = 20;
        }
        doc.setFontSize(9);
        doc.text(
            "These rows have Field Extent less than Completed Extent. Please contact Ops room.",
            pageWidth / 2,
            footerStartY,
            { align: 'center' }
        );
        doc.setLineWidth(0.5);
        doc.line(15, footerStartY + 2, pageWidth - 15, footerStartY + 2);

        const sigY = footerStartY + 16;
        doc.text("Signature:", 16, sigY);
        doc.text("Name:", 16, sigY + 10);
        const rightColX = pageWidth - 90;
        doc.text("Stamp:", rightColX, sigY);
        doc.text("Date:", rightColX, sigY + 10);

        const pdfEstateNames = (Array.isArray(estates) ? estates : [])
            .filter(e => selectedEstates.includes(e.id))
            .map(e => e.estate.replace(/\s+/g, '_'))
            .join('_') || 'All_Estates';
        doc.save(`Finance_Report_Issues_${pdfEstateNames}_${formatDate(selectedDates[0])}_to_${formatDate(selectedDates[1])}_${selectedMissionType}.pdf`);
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

    const filteredRows = getFilteredRows();
    const groupedRows = filteredRows.reduce((acc, row) => {
        const key = `${row.planId}__${row.date}__${row.missionType}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
    }, {});
    const issueRows = filteredRows.filter(hasFinanceExtentIssue);
    const hasIssues = issueRows.length > 0;
    const canCreateInvoice =
        selectedPlantation &&
        selectedEstates.length > 0 &&
        selectedDates[0] &&
        selectedDates[1] &&
        filteredRows.length > 0 &&
        !hasIssues;

    const formatDateParam = (d) => d?.toLocaleDateString?.('en-CA') || '';

    return (
        <div className="finance">
            <div className="top-finance-part">
                <div className="finance-filters-row">
                    <div className="finance-left-column">
                        <div className="plantationpicker-finance">
                            <label htmlFor="finance-plantation-search">Select Plantation:</label>
                            <div className="finance-input-container">
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
                                        ×
                                    </button>
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
                        </div>
                        <div className="mission-filter-container">
                            <label htmlFor="mission-type-filter">Mission Type:</label>
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
                    </div>
                    <div className="finance-right-column">
                        <div className="daterangepicker-finance">
                            <p className="select-date-text text-finance" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                                Select Date
                            </p>
                            <p className="date-range" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                                {selectedDates[0].toLocaleDateString()} - {selectedDates[1]?.toLocaleDateString()}
                            </p>
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
                        <div className="download-buttons">
                            {filteredRows.length > 0 && (
                                <button
                                    onClick={hasIssues ? undefined : exportToExcel}
                                    disabled={filteredRows.length === 0 || hasIssues}
                                    className="flex items-center bg-green-500 text-white"
                                    title={hasIssues ? 'Cannot download Excel while there are issue rows' : 'Download Excel'}
                                >
                                    <FiDownload className="mr-2" />
                                    Excel
                                </button>
                            )}
                            {filteredRows.length > 0 && (
                                <button
                                    onClick={hasIssues ? undefined : exportPdf}
                                    disabled={filteredRows.length === 0 || hasIssues}
                                    className="flex items-center bg-red-600 text-white"
                                    title={hasIssues ? 'Cannot download work summary while there are issue rows' : 'Download work summary'}
                                >
                                    <FiPrinter className="mr-2" />
                                    Work Summary
                                </button>
                            )}
                            {filteredRows.length > 0 && hasIssues && (
                                <button
                                    onClick={exportIssuesPdf}
                                    className="flex items-center bg-amber-600 text-white"
                                    title="Download issues-only PDF and contact Ops room"
                                >
                                    <FiPrinter className="mr-2" />
                                    Issues PDF
                                </button>
                            )}
                            {canCreateInvoice && (
                                <button
                                    type="button"
                                    onClick={openInvoiceModal}
                                    className="finance-btn-invoice flex items-center"
                                    title="Create tax invoice from billing Ha"
                                >
                                    <FiFileText className="mr-2" />
                                    Create Invoice
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {hasIssues && (
                <div className="finance-issues-warning">
                    These rows have Field Extent less than Completed Extent. Please download the issues-only PDF and contact Ops room.
                </div>
            )}


            {selectedDates[0] && selectedDates[1] && selectedPlantation && (
                <div className="bottom-finance-part">
                    <div className="bottom-finance-part-left">

                        {safeEstates.length > 0 && (
                            <div className="finance-checkbox-group" role="group" aria-labelledby="estate-selection">
                                <div className="select-all-container">
                                    <input
                                        type="checkbox"
                                        id="select-all"
                                        checked={selectedEstates.length === safeEstates.length}
                                        onChange={handleSelectAll}
                                        aria-label={selectedEstates.length === safeEstates.length ?
                                            "Unselect all estates" : "Select all estates"}
                                    />
                                    <label htmlFor="select-all">Select All</label>
                                </div>

                                <div className="finance-estates-list">
                                    {safeEstates.map((estate) => (
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
                            filteredRows.length > 0 ? (
                                <div className="finance-table-container">
                                    <table className="finance-report-table">
                                        <thead>
                                            <tr>
                                                <th>Plan</th>
                                                <th>Field Name</th>
                                                <th>Pilot Name</th>
                                                <th>Field(Ha)</th>
                                                <th>Completed(Ha)</th>
                                                <th>Covered %</th>
                                                <th>Billing(Ha)</th>
                                                <th>Bill</th>
                                                <th>Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(groupedRows).flatMap(([key, rows]) => {
                                                const firstRow = rows[0];
                                                const safeDate = firstRow?.date ? new Date(firstRow.date) : null;

                                                return rows.map((row, idx) => {
                                                    const isIssue = hasFinanceExtentIssue(row);
                                                    return (
                                                        <tr key={`${key}-${idx}`}>
                                                            {idx === 0 && (
                                                                <td rowSpan={rows.length}>
                                                                    <div><strong>{`${row.planId}-${row.missionType}`}</strong></div>
                                                                    <div>
                                                                        {safeDate && !isNaN(safeDate)
                                                                            ? safeDate.toLocaleDateString()
                                                                            : 'Invalid Date'}
                                                                    </div>
                                                                </td>
                                                            )}
                                                            <td>{row.fieldName}</td>
                                                            <td>{row.pilotNames}</td>
                                                            <td className={isIssue ? 'finance-issue-cell' : ''}>
                                                                {(row.landExtent || 0).toFixed(2)}
                                                            </td>
                                                            <td className={isIssue ? 'finance-issue-cell' : ''}>
                                                                {(row.fieldExtent || 0).toFixed(2)}
                                                            </td>
                                                            <td>
                                                                {(Number(row.coveredPercent) || 0).toFixed(2)}%
                                                            </td>
                                                            <td className={row.hasChargeableReason && !row.billingIncluded ? 'finance-billing-excluded-cell' : ''}>
                                                                {(row.billingExtent || 0).toFixed(2)}
                                                            </td>
                                                            <td>
                                                                {row.hasChargeableReason ? (
                                                                    <label className="finance-bill-toggle" title={row.billingIncluded ? 'Included in billing — click to exclude' : 'Excluded from billing — click to include'}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={row.billingIncluded}
                                                                            onChange={() => toggleBillingInclusion(row)}
                                                                        />
                                                                        <span>{row.billingIncluded ? 'Yes' : 'No'}</span>
                                                                    </label>
                                                                ) : (
                                                                    '—'
                                                                )}
                                                            </td>
                                                            <td>{row.comNarration || '-'}</td>
                                                        </tr>
                                                    );
                                                });
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3"><strong>Total</strong></td>
                                                <td>
                                                    <strong>
                                                        {filteredRows
                                                            .reduce((sum, row) => sum + row.landExtent, 0)
                                                            .toFixed(2)}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {filteredRows
                                                            .reduce((sum, row) => sum + row.fieldExtent, 0)
                                                            .toFixed(2)}
                                                    </strong>
                                                </td>
                                                <td></td>
                                                <td>
                                                    <strong>
                                                        {filteredRows
                                                            .reduce((sum, row) => sum + (Number(row.billingExtent) || 0), 0)
                                                            .toFixed(2)}
                                                    </strong>
                                                </td>
                                                <td></td>
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



            {!onInvoicePreview && localPreviewInvoice ? (
                <PlantationInvoicePrint
                    invoice={localPreviewInvoice}
                    variant="preview"
                    onClose={() => setLocalPreviewInvoice(null)}
                />
            ) : null}

            <CreatePlantationInvoiceModal
                open={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                onCreated={(inv) => {
                    setShowInvoiceModal(false);
                    showInvoicePreview(inv);
                }}
                plantationId={selectedPlantation}
                plantationName={
                    plantations.find((p) => p.id === selectedPlantation)?.plantation || ''
                }
                estateIds={selectedEstates}
                startDate={formatDateParam(selectedDates[0])}
                endDate={formatDateParam(selectedDates[1])}
                missionFilter={selectedMissionType}
            />
        </div>
    );
};

export default EstateSprayedAreaReport;

