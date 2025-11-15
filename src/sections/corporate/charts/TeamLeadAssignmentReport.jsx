import React, { useState, useEffect, useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, LabelList
} from 'recharts';
import { Bars } from 'react-loader-spinner';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTeamLeadReport, selectReportData, selectReportLoading, selectReportError } from '../../../store/slices/reportsSlice';
import * as XLSX from 'xlsx';

const ReportPart4 = ({ dateRange }) => {
    const dispatch = useAppDispatch();
    const [teamLeadData, setTeamLeadData] = useState([]);

    // Get cached data from Redux
    const cachedData = useAppSelector((state) => 
        dateRange.startDate && dateRange.endDate
            ? selectReportData(state, 'teamLeadReport', dateRange.startDate, dateRange.endDate)
            : null
    );
    const loading = useAppSelector((state) =>
        dateRange.startDate && dateRange.endDate
            ? selectReportLoading(state, 'teamLeadReport', dateRange.startDate, dateRange.endDate)
            : false
    );
    const error = useAppSelector((state) =>
        dateRange.startDate && dateRange.endDate
            ? selectReportError(state, 'teamLeadReport', dateRange.startDate, dateRange.endDate)
            : null
    );

    useEffect(() => {
        const fetchData = async () => {
            // Check if dateRange is empty or invalid
            if (!dateRange.startDate || !dateRange.endDate) {
                setTeamLeadData([]);
                return;
            }

            // Check if we have cached data
            if (cachedData) {
                processResponseData(cachedData);
                return;
            }

            // Fetch from API via Redux
            try {
                const result = await dispatch(fetchTeamLeadReport({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                }));

                if (fetchTeamLeadReport.fulfilled.match(result)) {
                    processResponseData(result.payload.data);
                } else {
                    setTeamLeadData([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setTeamLeadData([]);
            }
        };

        const processResponseData = (response) => {

            // Transform and aggregate team lead data
            const teamLeadMap = new Map();
            if (response && response.team_lead) {
                response.team_lead.forEach(lead => {
                    if (lead.plans) {
                        lead.plans.forEach(plan => {
                            // Only process plans where manager_approval === 1 and activated === 1
                            if (plan.manager_approval === 1 && plan.activated === 1) {
                                const planArea = Number(plan.area || 0);
                                const notAssigned = Number(plan.not_assigned || 0);
                                const assigned = Number(plan.assigned_fields_to_pilots || 0);
                                const teamLeadName = lead.name || 'Unknown';
                                const firstName = teamLeadName.split(' ')[0]; // Extract first name
                                if (!teamLeadMap.has(teamLeadName)) {
                                    teamLeadMap.set(teamLeadName, {
                                        firstName,
                                        fullName: teamLeadName,
                                        totalArea: 0,
                                        totalAssigned: 0,
                                        totalUnassigned: 0
                                    });
                                }
                                const current = teamLeadMap.get(teamLeadName);
                                current.totalArea += planArea;
                                current.totalAssigned += assigned;
                                current.totalUnassigned += notAssigned;
                            }
                        });
                    }
                });
            }

            // Convert map to array and calculate unassigned and percentage
            const transformed = Array.from(teamLeadMap.entries()).map(([teamLeadName, data]) => {
                const totalArea = Number(data.totalArea.toFixed(2));
                const totalAssigned = Number(data.totalAssigned.toFixed(2));
                const unassigned = Number((data.totalUnassigned || 0).toFixed(2));
                const percentage = totalArea > 0 ? Math.round((totalAssigned / totalArea) * 100) : 0;
                return {
                    teamLeadName: data.firstName, // Use first name for X-axis
                    teamLeadFullName: data.fullName, // Full name for tooltip
                    totalArea,
                    totalAssigned,
                    unassigned,
                    percentage
                };
            }).filter(lead => lead.totalArea > 0); // Exclude team leads with no assigned area

            setTeamLeadData(transformed);
        };

        fetchData();
    }, [dateRange, cachedData, dispatch]);

    // Function to handle Excel download
    const handleExportToExcel = () => {
        if (teamLeadData.length === 0) {
            alert('No data available to export');
            return;
        }

        // Prepare data for Excel
        const exportData = teamLeadData.map(item => ({
            'Team Lead': item.teamLeadFullName,
            'Total Area (ha)': item.totalArea ? item.totalArea.toFixed(2) : 0,
            'Assigned (ha)': item.totalAssigned ? item.totalAssigned.toFixed(2) : 0,
            'Unassigned (ha)': item.unassigned ? item.unassigned.toFixed(2) : 0,
            'Percentage (%)': item.percentage ? item.percentage.toFixed(2) : 0,
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Team Lead Stats');
        // Helper to format date as YYYY-MM-DD
        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        XLSX.writeFile(workbook, `Team_Lead_Assigned_Stats_${formatDate(dateRange.startDate)}_to_${formatDate(dateRange.endDate)}.xlsx`);
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
            {teamLeadData.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <p>No data available for the selected date range.</p>
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
                            Team Lead Assigned Stats
                        </h2>
                    </div>
                    <BarChart
                        data={teamLeadData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="teamLeadName"
                            angle={-65}
                            textAnchor="end"
                            interval={0}
                            height={60}
                        />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(label, payload) => {
                                return payload[0]?.payload?.teamLeadFullName || label;
                            }}
                            formatter={(value, name) => {
                                const formattedValue = value.toFixed(2);
                                if (name === 'totalArea') return [formattedValue, 'Total Area (ha)'];
                                if (name === 'totalAssigned') return [formattedValue, 'Assigned (ha)'];
                                if (name === 'unassigned') return [formattedValue, 'Unassigned (ha)'];
                                return [formattedValue, name];
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="totalAssigned"
                            stackId="a"
                            fill="#00A023"
                            name="Assigned (ha)"
                            barSize={20}
                        />
                        {/* Canceled series removed */}
                        <Bar
                            dataKey="unassigned"
                            stackId="a"
                            fill="#004B71"
                            name="Unassigned (ha)"
                            barSize={20}
                        >
                            <LabelList
                                dataKey="percentage"
                                position="top"
                                formatter={(value) => `${value}%`}
                                style={{ fill: '#000', fontSize: '12px' }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default ReportPart4;