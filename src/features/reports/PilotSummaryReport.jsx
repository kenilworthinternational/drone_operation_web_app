import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, LabelList
} from 'recharts';
import { Bars } from 'react-loader-spinner';
import { ApprovalCount } from '../../api/api';
import * as XLSX from 'xlsx';

const ReportPart5 = ({ dateRange }) => {
    const [teamLeadData, setTeamLeadData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPilot, setSelectedPilot] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await ApprovalCount(
                    dateRange.startDate,
                    dateRange.endDate
                );
                setTeamLeadData(Array.isArray(response[0]) ? response[0] : []);
            } catch (error) {
                console.error('Error fetching approval count:', error);
                setTeamLeadData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dateRange]);

    // Prepare data for chart
    const chartData = selectedPilot === 'all' 
        ? Array.isArray(teamLeadData) && teamLeadData.length > 0 
            ? teamLeadData.reduce((acc, pilot) => ({
                'Plans': (acc['Plans'] || 0) + pilot.plan_count,
                'Tasks': (acc['Tasks'] || 0) + pilot.task_count,
                'Sub Tasks': (acc['Sub Tasks'] || 0) + pilot.sub_task_count,
                'Team Lead Approved': (acc['Team Lead Approved'] || 0) + pilot.sub_task_count_approved_team_lead,
                'Team Lead Rejected': (acc['Team Lead Rejected'] || 0) + pilot.sub_task_count_reject_team_lead,
                'Ops Room Approved': (acc['Ops Room Approved'] || 0) + pilot.sub_task_count_approved_ops_room,
                'Ops Room Rejected': (acc['Ops Room Rejected'] || 0) + pilot.sub_task_count_reject_ops_room,
            }), {})
            : {}
        : teamLeadData
            .filter(pilot => pilot.name === selectedPilot)
            .map(pilot => ({
                'Plans': pilot.plan_count,
                'Tasks': pilot.task_count,
                'Sub Tasks': pilot.sub_task_count,
                'Team Lead Approved': pilot.sub_task_count_approved_team_lead,
                'Team Lead Rejected': pilot.sub_task_count_reject_team_lead,
                'Ops Room Approved': pilot.sub_task_count_approved_ops_room,
                'Ops Room Rejected': pilot.sub_task_count_reject_ops_room,
            }))[0] || {};

    const chartDataArray = Object.keys(chartData).length > 0 ? [{
        name: selectedPilot === 'all' ? 'All Pilots' : selectedPilot,
        ...chartData
    }] : [];

    const pilotNames = ['all', ...new Set(
        Array.isArray(teamLeadData) ? teamLeadData.map(pilot => pilot.name) : []
    )];

    const handleExportToExcel = () => {
        if (chartDataArray.length === 0) {
            alert('No data available to export');
            return;
        }

        const exportData = chartDataArray.map(item => ({
            Pilot: item.name,
            Plans: item.Plans || 0,
            Tasks: item.Tasks || 0,
            'Sub Tasks': item['Sub Tasks'] || 0,
            'Team Lead Approved': item['Team Lead Approved'] || 0,
            'Team Lead Rejected': item['Team Lead Rejected'] || 0,
            'Ops Room Approved': item['Ops Room Approved'] || 0,
            'Ops Room Rejected': item['Ops Room Rejected'] || 0,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pilot Summary');
        // Helper to format date as YYYY-MM-DD
        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        XLSX.writeFile(workbook, `Pilot_Summary_${selectedPilot}_${formatDate(dateRange.startDate)}_to_${formatDate(dateRange.endDate)}.xlsx`);
    };

    return (
        <div style={{ textAlign: "center", width: '100%', minHeight: '400px', padding: '20px' }}>
            <h2 
                className="h2" 
                style={{ color: '#004B71', cursor: 'pointer' }} 
                onClick={handleExportToExcel}
                title="Click to download as Excel"
            >
                Pilot Summary
            </h2>
            <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px' }}>Pick a Pilot:</label>
                <select 
                    value={selectedPilot} 
                    onChange={(e) => setSelectedPilot(e.target.value)}
                    style={{ padding: '5px' }}
                >
                    {pilotNames.map(name => (
                        <option key={name} value={name}>
                            {name === 'all' ? 'All Pilots' : name}
                        </option>
                    ))}
                </select>
            </div>
            
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <Bars height="80" width="80" color="#4fa94d" />
                </div>
            ) : chartDataArray.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={chartDataArray}
                        margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                        barGap={15}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Plans" fill="#8884d8" barSize={20}>
                            <LabelList dataKey="Plans" position="top" />
                        </Bar>
                        <Bar dataKey="Tasks" fill="#82ca9d" barSize={20}>
                            <LabelList dataKey="Tasks" position="top" />
                        </Bar>
                        <Bar dataKey="Sub Tasks" fill="#ffc107" barSize={20}>
                            <LabelList dataKey="Sub Tasks" position="top" />
                        </Bar>
                        <Bar dataKey="Team Lead Approved" fill="#28a745" barSize={20}>
                            <LabelList dataKey="Team Lead Approved" position="top" />
                        </Bar>
                        <Bar dataKey="Team Lead Rejected" fill="#dc3545" barSize={20}>
                            <LabelList dataKey="Team Lead Rejected" position="top" />
                        </Bar>
                        <Bar dataKey="Ops Room Approved" fill="#17a2b8" barSize={20}>
                            <LabelList dataKey="Ops Room Approved" position="top" />
                        </Bar>
                        <Bar dataKey="Ops Room Rejected" fill="#6c757d" barSize={20}>
                            <LabelList dataKey="Ops Room Rejected" position="top" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <p>No data available</p>
                </div>
            )}
        </div>
    );
};

export default ReportPart5;