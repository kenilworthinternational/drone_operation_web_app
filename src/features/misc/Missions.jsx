import React, { useState } from 'react';
import { Checkbox } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/missions.css';
import ForestIcon from '@mui/icons-material/Forest';
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';
import YardIcon from '@mui/icons-material/Yard';
import YardOutlinedIcon from '@mui/icons-material/YardOutlined';
import FactoryIcon from '@mui/icons-material/Factory';
import FactoryOutlinedIcon from '@mui/icons-material/FactoryOutlined';
import PlantationEstateSelectWidget from '../../components/PlantationEstateSelectWidget';
import PilotMappingDetails from '../pilots/PilotMappingDetails';

const Missions = () => {
    const today = new Date();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState([today, new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)]);
    const [selectedFilter, setSelectedFilter] = useState('plantation');
    const [selectedEstateIds, setSelectedEstateIds] = useState([]);
    console.log('Selected Estate IDs in Missions:', selectedEstateIds);
    // Date formatting function
    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (dates) => {
        setSelectedDates(dates);
        if (dates[0] && dates[1]) {
            setIsCalendarOpen(false);
        }
    };

    return (
        <div className="missions-container">
            <div className="missions-up-part">
                <div className="calendar-section">
                    {/* Select Date Text at the Top */}
                    <p className="select-date-text-missions" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                        Select Date
                    </p>

                    {/* Display Date Range */}
                    <p className="date-range" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                        {selectedDates[0].toLocaleDateString()} - {selectedDates[1]?.toLocaleDateString()}
                    </p>

                    {/* Calendar Picker */}
                    <div className="datepicker-container">
                        {isCalendarOpen && (
                            <DatePicker
                                selected={selectedDates[0]}
                                onChange={handleDateChange}
                                startDate={selectedDates[0]}
                                endDate={selectedDates[1]}
                                className="react-datepicker-mission"
                                selectsRange
                                inline
                            />
                        )}
                    </div>
                </div>
                <div
                    className={`filter-section ${selectedFilter === 'plantation' ? 'checked' : ''}`}
                    onClick={() => setSelectedFilter('plantation')}
                >
                    <Checkbox
                        value="plantation"
                        checked={selectedFilter === 'plantation'}
                        icon={<YardOutlinedIcon />}
                        checkedIcon={<YardIcon />}
                        sx={{
                            transform: 'scale(1.5)', // For larger checkbox size
                            color: '#004B71', // Icon color when unchecked
                            '&.Mui-checked': {
                                color: '#FFFFFF', // Icon color when checked
                            },
                        }}
                    />
                    PLANTATION
                </div>
                <div
                    className={`filter-section ${selectedFilter === 'nonPlantation' ? 'checked' : ''}`}
                    onClick={() => setSelectedFilter('nonPlantation')}
                >
                    <Checkbox
                        value="nonPlantation"
                        checked={selectedFilter === 'nonPlantation'}
                        icon={<ForestOutlinedIcon />}
                        checkedIcon={<ForestIcon />}
                        sx={{
                            transform: 'scale(1.5)',
                            color: '#004B71',
                            '&.Mui-checked': {
                                color: '#FFFFFF',
                            },
                        }}
                    />
                    NON-PLANTATION
                </div>

                <div
                    className={`filter-section ${selectedFilter === 'enterprises' ? 'checked' : ''}`}
                    onClick={() => setSelectedFilter('enterprises')}
                >
                    <Checkbox
                        value="enterprises"
                        checked={selectedFilter === 'enterprises'}
                        icon={<FactoryOutlinedIcon />}
                        checkedIcon={<FactoryIcon />}
                        sx={{
                            transform: 'scale(1.5)',
                            color: '#004B71',
                            '&.Mui-checked': {
                                color: '#FFFFFF',
                            },
                        }}
                    />
                    ENTERPRISES
                </div>

            </div>

            <div className="missions-down-part">
                {selectedFilter === 'plantation' && (
                    <>
                        <div className="left-missions plantation">
                            <PlantationEstateSelectWidget
                                onSelectionChange={setSelectedEstateIds} // Pass state updater
                            />
                        </div>
                        <div className="right-missions plantation">
                            <PilotMappingDetails
                                key={`${selectedEstateIds.join()}-${selectedDates[0]}-${selectedDates[1]}`} // Force remount on change
                                estateIds={selectedEstateIds}
                                startDate={formatDate(selectedDates[0])}
                                endDate={formatDate(selectedDates[1])}
                            />
                        </div>
                    </>
                )}

                {selectedFilter === 'nonPlantation' && (
                    <>
                        <div className="left-missions nonPlantation">
                            <p>Non Plantation Missions Content</p>
                        </div>
                        <div className="right-missions nonPlantation">
                            <p>Non Plantation Content</p>
                        </div>
                    </>
                )}

                {selectedFilter === 'enterprises' && (
                    <>
                        <div className="left-missions enterprises">
                            <p>Enterprises Content</p>
                        </div>
                        <div className="right-missions enterprises">
                            <p>Enterprises Content</p>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default Missions;