import React, { useEffect, useState, useRef } from 'react';
import '../styles/CustomDropdown.css';
import { Bars } from 'react-loader-spinner';

const CustomDropdown = ({
  options = [],
  onSelect,
  selectedValue,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);

  // Update selectedOption when selectedValue changes
  useEffect(() => {
    setSelectedOption(selectedValue);
  }, [selectedValue]);

  const toggleDropdown = () => {
    if (!isLoading) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };

  const getDropdownPosition = () => {
    const dropdown = dropdownRef.current;
    if (dropdown) {
      const dropdownRect = dropdown.getBoundingClientRect();
      const spaceBelow = window.innerHeight - dropdownRect.bottom;

      return spaceBelow < 200 ? 'top' : 'bottom'; // Adjust '200' based on your dropdown height
    }
    return 'bottom';
  };

  const dropdownPosition = getDropdownPosition();

  // Show all options, including those with activated === 0
  const filteredOptions = options;

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="selected" onClick={toggleDropdown} disabled={isLoading}>
        {isLoading ? (
          <div className="loading-state">
            <Bars
              height={20}
              width={20}
              color="#000000"
              ariaLabel="loading-indicator"
            />
          </div>
        ) : (
          <div className="selected-label">
            {selectedOption?.group || 'Select an option'}
          </div>
        )}
        <img
          src={isOpen ? '../assets/svg/up-arrow.svg' : '../assets/svg/down-arrow.svg'}
          alt="Dropdown icon"
          className={`dropdown-icon ${isOpen ? 'arrow up' : 'arrow down'}`}
        />
      </div>
      {isOpen && !isLoading && (
        <div className={`options ${dropdownPosition}`}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className={`option ${
                  option.team_assigned === 0
                    ? 'team-not-assigned'
                    : option.team_assigned === 1
                    ? 'team-assigned'
                    : ''
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                {option.group}
              </div>
            ))
          ) : (
            <div className="no-options">No Plans Available</div> // Fallback message
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;