import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useAppDispatch } from "../store/hooks";
import { baseApi } from "../api/services/allEndpoints";
import '../styles/plantationestateselectwidget.css';

const PlantationEstateSelectWidget = ({ onSelectionChange }) => {
    const dispatch = useAppDispatch();
    const [plantations, setPlantations] = useState([]);
    const [selectedPlantation, setSelectedPlantation] = useState(null);
    const [estates, setEstates] = useState([]);
    const [selectedEstates, setSelectedEstates] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Add useEffect to handle selection changes
    useEffect(() => {
        console.log('Selected estates changed:', selectedEstates);
        onSelectionChange(selectedEstates);
    }, [selectedEstates, onSelectionChange]);

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
                    setSelectedEstates([]); // This will trigger the selection useEffect
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

    return (
        <div className="plantation-estate-widget">
            <label htmlFor="plantation-search">Select Plantation:</label>
            <div className="input-container">
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
                        className="clear-button" 
                        onClick={handleClearSelection}
                        aria-label="Clear selection"
                    >
                        ×
                    </button>
                )}
            </div>

            {loading && <div className="loading-message">Loading...</div>}
            {error && <div className="error-message">{error}</div>}

            {dropdownOpen && (
                <div 
                    className="dropdown-list"
                    role="listbox"
                    aria-labelledby="plantation-search"
                >
                    {filteredPlantations.length === 0 ? (
                        <div className="no-results">No matching plantations found</div>
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

            {estates.length > 0 && (
                <div className="checkbox-group" role="group" aria-labelledby="estate-selection">
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
                    
                    <div className="estates-list">
                        {estates.map((estate) => (
                            <div key={estate.id} className="estate-item">
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
    );
};

PlantationEstateSelectWidget.propTypes = {
    onSelectionChange: PropTypes.func.isRequired
};

export default PlantationEstateSelectWidget;