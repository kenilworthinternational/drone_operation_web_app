import React, { useState, useRef, useEffect } from 'react';

const SearchableAscDropdown = ({ 
    value, 
    onChange, 
    options, 
    isLoading, 
    error, 
    placeholder = "Select ASC Center",
    disabled = false 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.asc_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.asc_id.toString().includes(searchTerm)
    );

    // Get selected option display text
    const getSelectedText = () => {
        if (!value) return placeholder;
        const selected = options.find(option => option.asc_id === parseInt(value));
        return selected ? `${selected.asc_name} (${selected.asc_id})` : placeholder;
    };

    // Handle option selection
    const handleOptionSelect = (option) => {
        onChange(option.asc_id.toString());
        setIsOpen(false);
        setSearchTerm('');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        // Only add listener when dropdown is open
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Close dropdown when disabled
    useEffect(() => {
        if (disabled) {
            setIsOpen(false);
            setSearchTerm('');
        }
    }, [disabled]);

        return (
        <div className="floating-label-input">
            <div 
                ref={dropdownRef}
                className={`dropdown-container ${isOpen ? 'active' : ''}`}
                style={{
                    border: '1px solid #ccc',
                    borderRadius: '10px',
                    padding: '12px 10px 10px 10px',
                    backgroundColor: 'white',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1,
                    position: 'relative'
                }}
            >
                <div 
                    className="dropdown-display"
                    onClick={() => {
                        if (!disabled) {
                            setIsOpen(!isOpen);
                        }
                    }}
                    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                >
                    {isLoading ? (
                        <span className="placeholder">Loading ASC Centers...</span>
                    ) : error ? (
                        <span className="placeholder">Error: {error}</span>
                    ) : (
                        <span style={{ color: value ? '#333' : '#999' }}>
                            {getSelectedText()}
                        </span>
                    )}
                </div>
                <div 
                    className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}
                    onClick={() => {
                        if (!disabled) {
                            setIsOpen(!isOpen);
                        }
                    }}
                    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                </div>

                {isOpen && !disabled && (
                    <div className="dropdown-menu">
                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search ASC Centers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="options-container">
                            {filteredOptions.length === 0 ? (
                                <div className="option-item disabled">
                                    {searchTerm ? 'No ASC Centers found' : 'No ASC Centers available'}
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <div
                                        key={option.asc_id}
                                        className="option-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOptionSelect(option);
                                        }}
                                    >
                                        <div className="asc-option">
                                            <div className="asc-name">{option.asc_name}</div>
                                            <div className="asc-details">ID: {option.asc_id} • GNDs: {option.gnds?.length || 0}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <label className="label-floating">
                Select ASC Center
                <span className="red-star"> *</span>
            </label>
        </div>
    );
};

export default SearchableAscDropdown;
