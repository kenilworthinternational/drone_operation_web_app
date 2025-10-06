import React, { useEffect, useState, useRef } from 'react';
import '../styles/CustomDropdown.css';

const CustomDropdown = ({ options = [], onSelect, selectedValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(selectedValue);
  const dropdownRef = useRef(null);

  // Update selectedOption when selectedValue changes
  useEffect(() => {
    setSelectedOption(selectedValue);
  }, [selectedValue]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
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
      const spaceAbove = dropdownRect.top;

      return spaceBelow < 200 ? 'top' : 'bottom'; // Adjust '200' based on your dropdown height
    }
    return 'bottom';
  };

  const dropdownPosition = getDropdownPosition();

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="selected" onClick={toggleDropdown}>
        <div className="selected-label">
          {selectedOption ? selectedOption.group : "Select an option"}
        </div>
        <img
          src={isOpen ? '../assets/svg/up-arrow.svg' : '../assets/svg/down-arrow.svg'}
          alt="Dropdown icon"
          className={`dropdown-icon ${isOpen ? 'arrow up' : 'arrow down'}`}
        />
      </div>
      {isOpen && (
        <div className={`options ${dropdownPosition}`}>
          {options.length > 0 ? (
            options.map(option => (
              <div
                key={option.id}
                className="option"
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
