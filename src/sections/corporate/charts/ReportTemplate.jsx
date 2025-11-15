import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, LabelList
} from 'recharts';
import { Bars } from 'react-loader-spinner';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import * as XLSX from 'xlsx';

const Template = ({ dateRange }) => {
    const [teamLeadData, setTeamLeadData] = useState([]);
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const fetchData = async () => {
            // Check if dateRange is empty or invalid
            if (!dateRange.startDate || !dateRange.endDate) {
                setTeamLeadData([]); // Clear data if date range is empty
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await dispatch(
                    baseApi.endpoints.getFlightNumbersReport.initiate({
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate,
                    })
                ).unwrap();
                setTeamLeadData(Array.isArray(response) ? response : (response?.data || []));

            } catch (error) {
                console.error('Error fetching data:', error);
                setTeamLeadData([]); // Clear data on error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange, dispatch]);


    return (
        <div style={{ width: '100%', height: 400 }}>

        </div>
    );
};

export default Template;