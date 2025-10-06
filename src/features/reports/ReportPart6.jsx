import React, { useState, useEffect, useRef } from "react";
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import { Bars } from 'react-loader-spinner';
import { noOfFlights } from '../../api/api';
import * as XLSX from 'xlsx';

const ReportPart6 = ({ dateRange }) => {
    const [scatterData, setScatterData] = useState({ recommended: [], pilot: [] });
    const [loading, setLoading] = useState(true);
    const [regions, setRegions] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState("All");
    const isMounted = useRef(false);
    const minChartWidth = Math.max(600, scatterData.recommended.length * 30);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await noOfFlights(dateRange.startDate, dateRange.endDate);
                console.log('API Response:', response);

                if (!response || typeof response !== 'object') {
                    throw new Error('Invalid API response');
                }

                // Extract unique regions from numeric entries, add "All"
                const valuesForRegions = Array.isArray(response) ? response : Object.keys(response)
                    .filter(k => !isNaN(k))
                    .map(k => response[k]);
                const uniqueRegions = ["All", ...new Set(valuesForRegions
                    .map(mission => mission.region)
                    .filter(region => typeof region === 'string' && region.trim() !== ""))];
                setRegions(uniqueRegions);

                const fieldMap = new Map();
                const pilotFlightData = [];
                const recommendedFlightData = [];

                const values = Array.isArray(response) ? response : Object.keys(response)
                    .filter(k => !isNaN(k))
                    .map(k => response[k]);

                if (selectedRegions === "All") {
                    values.forEach((mission) => {
                        const divisionsArr = mission.divisions || mission.diviions || mission.Divisions || [];
                        if (Array.isArray(divisionsArr)) {
                            divisionsArr.forEach((division) => {
                                const fieldsArr = division.fields || division.Fields || [];
                                if (Array.isArray(fieldsArr)) {
                                    fieldsArr.forEach((field) => {
                                        const fieldShort = field.field_short_name || field.field_short || field.field_name || field.field || 'Field';
                                        const areaVal = field.area || field.field_area || 0;
                                        const fieldKey = `${fieldShort} - ${areaVal}Ha`;
                                        if (!fieldMap.has(fieldKey)) {
                                            fieldMap.set(fieldKey, {
                                                field_short_name: fieldKey,
                                                no_of_flights_for_the_field: Number(field.no_of_flights_for_the_field || field.estimated_flights || 0)
                                            });
                                        }
                                        const pilotsArr = field.pilots || field.Pilots || [];
                                        if (Array.isArray(pilotsArr) && pilotsArr.length > 0) {
                                            pilotsArr.forEach((pilot) => {
                                                const pf = parseInt(pilot.pilot_flights || pilot.flights || 0);
                                                if (pf > 0) {
                                                    pilotFlightData.push({
                                                        field: field.field || field.field_name || fieldShort,
                                                        area: areaVal,
                                                        field_short_name: fieldKey,
                                                        pilot_flights: pf,
                                                        pilot_name: pilot.name || pilot.pilot_name || 'Pilot',
                                                        region: mission.region,
                                                        pilot_field_area: pilot.pilot_field_area || pilot.area || 0
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    values.forEach((mission) => {
                        const divisionsArr = (mission.region === selectedRegions) ? (mission.divisions || mission.diviions || mission.Divisions || []) : [];
                        if (Array.isArray(divisionsArr)) {
                            divisionsArr.forEach((division) => {
                                const fieldsArr = division.fields || division.Fields || [];
                                if (Array.isArray(fieldsArr)) {
                                    fieldsArr.forEach((field) => {
                                        const fieldShort = field.field_short_name || field.field_short || field.field_name || field.field || 'Field';
                                        const areaVal = field.area || field.field_area || 0;
                                        const fieldKey = `${fieldShort} - ${areaVal}Ha`;
                                        if (!fieldMap.has(fieldKey)) {
                                            fieldMap.set(fieldKey, {
                                                field_short_name: fieldKey,
                                                no_of_flights_for_the_field: Number(field.no_of_flights_for_the_field || field.estimated_flights || 0)
                                            });
                                        }
                                        const pilotsArr = field.pilots || field.Pilots || [];
                                        if (Array.isArray(pilotsArr) && pilotsArr.length > 0) {
                                            pilotsArr.forEach((pilot) => {
                                                const pf = parseInt(pilot.pilot_flights || pilot.flights || 0);
                                                if (pf > 0) {
                                                    pilotFlightData.push({
                                                        field: field.field || field.field_name || fieldShort,
                                                        area: areaVal,
                                                        field_short_name: fieldKey,
                                                        pilot_flights: pf,
                                                        pilot_name: pilot.name || pilot.pilot_name || 'Pilot',
                                                        region: mission.region,
                                                        pilot_field_area: pilot.pilot_field_area || pilot.area || 0
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }

                fieldMap.forEach((value) => {
                    recommendedFlightData.push({
                        field_short_name: value.field_short_name,
                        no_of_flights_for_the_field: value.no_of_flights_for_the_field
                    });
                });

                setScatterData({
                    recommended: recommendedFlightData,
                    pilot: pilotFlightData
                });

            } catch (error) {
                console.error('Error fetching data:', error);
                setScatterData({ recommended: [], pilot: [] });
                setRegions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange, selectedRegions]);

    const downloadExcel = () => {
        // Create a map for recommended flights by field name
        const recommendedMap = new Map();
        scatterData.recommended.forEach(item => {
            recommendedMap.set(item.field_short_name, item.no_of_flights_for_the_field);
        });

        // Create combined data array
        const excelData = scatterData.pilot.map(item => ({
            "Pilot Name": item.pilot_name || "N/A",
            "Region": item.region || "N/A",
            "Field": item.field || "N/A",
            "Field Extent": item.area || "N/A",
            "Pilot Field Area": item.pilot_field_area || "N/A",
            "Estimated Flights": recommendedMap.get(item.field_short_name) || "N/A",
            "Pilot Flights": item.pilot_flights || "N/A"
        }));

        // Create worksheet and workbook
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Flight Data");

        // Generate file name and download
        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const regionPart = selectedRegions && selectedRegions !== 'all' ? `${selectedRegions}_` : '';
        const fileName = `Number_of_Flights_${regionPart}${formatDate(dateRange.startDate)}_to_${formatDate(dateRange.endDate)}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            if (data.no_of_flights_for_the_field) {
                return (
                    <div className="bg-white p-2 border border-gray-300 rounded shadow">
                        <p><strong>Field:</strong> {data.field_short_name}</p>
                        <p><strong>Estimated Flights:</strong> {data.no_of_flights_for_the_field}</p>
                    </div>
                );
            } else if (data.pilot_flights) {
                return (
                    <div className="bg-white p-2 border border-gray-300 rounded shadow">
                        <p><strong>Field:</strong> {data.field_short_name}</p>
                        <p><strong>Pilot Flights:</strong> {data.pilot_flights}</p>
                        <p><strong>Pilot:</strong> {data.pilot_name}</p>
                        <p><strong>Pilot Field Area:</strong> {data.pilot_field_area}</p>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="w-[95%] h-[500px] relative" style={{ minHeight: '500px', padding: 0, margin: 0 }}>
            <h2 onClick={downloadExcel} style={{ cursor: 'pointer', textAlign: 'center', color: '#004B71' }}>Number of Flights</h2>
            <div className="mb-4 flex justify-center text-center items-center">
                <label className="mr-2 justify-center text-center items-center">Filter by Region: </label>
                {regions.length > 0 ? (
                    <select
                        value={selectedRegions}
                        onChange={(e) => setSelectedRegions(e.target.value)}
                        className="p-1 border rounded ml-2"
                    >
                        {regions.map((region, index) => (
                            <option key={index} value={region}>{region}</option>
                        ))}
                    </select>
                ) : (
                    <p className="ml-2">Loading regions...</p>
                )}
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-full absolute inset-0">
                    <Bars height="80" width="80" color="#4fa94d" />
                </div>
            ) : (
                <div className="w-full h-[400px] overflow-x-auto">
                    <div style={{ minWidth: "800px", height: "400px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 100, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="field_short_name"
                                    type="category"
                                    name="Field"
                                    allowDuplicatedCategory={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    interval={0}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    dataKey={(data) => Number(data.no_of_flights_for_the_field) || Number(data.pilot_flights) || 0}
                                    name="Number of Flights"
                                    label={{
                                        value: 'Number of Flights',
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: -10
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} />
                                <Scatter
                                    name="Estimated Flights"
                                    data={scatterData.recommended}
                                    dataKey="no_of_flights_for_the_field"
                                    fill="#00A700FF"
                                    shape="circle"
                                />
                                <Scatter
                                    name="Pilot Flights"
                                    data={scatterData.pilot}
                                    dataKey="pilot_flights"
                                    fill="#FF0000"
                                    shape="circle"
                                />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportPart6;