import React, { useState, useRef, useEffect } from 'react';

const SearchableBrokerDropdown = ({ 
    value, 
    onChange, 
    options, 
    isLoading, 
    error, 
    placeholder = "Pick a Broker",
    disabled = false 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(broker => {
        const searchLower = searchTerm.toLowerCase();
        return (
            broker.id.toString().includes(searchLower) ||
            broker.broker_code.toLowerCase().includes(searchLower) ||
            broker.nic.toLowerCase().includes(searchLower) ||
            broker.name.toLowerCase().includes(searchLower)
        );
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get selected broker name for display
    const selectedBroker = options.find(broker => broker.id.toString() === value);

    const handleSelect = (broker) => {
        onChange(broker.id.toString());
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setSearchTerm("");
            }
        }
    };

    return (
        <div className="floating-label-input" ref={dropdownRef}>
            <div 
                className={`input-floating dropdown-container ${isOpen ? 'active' : ''}`}
                onClick={handleToggle}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
                <div className="dropdown-display">
                    {selectedBroker ? (
                        <div className="broker-option">
                            <div className="broker-name">{selectedBroker.name}</div>
                            <div className="broker-details">{selectedBroker.nic}-{selectedBroker.broker_code}</div>
                        </div>
                    ) : (
                        <span className="placeholder">{placeholder}</span>
                    )}
                </div>
                <svg 
                    className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} 
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12"
                >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
            </div>
            
            {isOpen && !disabled && (
                <div className="dropdown-menu">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by ID, code, NIC, or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            autoFocus
                        />
                    </div>
                    <div className="options-container">
                        {isLoading ? (
                            <div className="option-item disabled">Loading brokers...</div>
                        ) : error ? (
                            <div className="option-item disabled">Error loading brokers: {error}</div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="option-item disabled">No brokers found</div>
                        ) : (
                            filteredOptions.map(broker => (
                                <div 
                                    key={broker.id} 
                                    className="option-item broker-option"
                                    onClick={() => handleSelect(broker)}
                                >
                                    <div className="broker-name">{broker.name}</div>
                                    <div className="broker-details">{broker.nic}-{broker.broker_code}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            
            <label className="label-floating">
                Pick a Broker
            </label>
        </div>
    );
};

export default SearchableBrokerDropdown; 