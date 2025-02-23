import React, { useState, useEffect } from 'react';
import "../css/CustomDropdown.css";


const CustomDropdown = ({ options, onSelect, selectedValue }) => {
  const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility
  const [selectedOption, setSelectedOption] = useState(selectedValue); // State to keep track of selected option

  useEffect(() => {
    setSelectedOption(selectedValue); // Update the selected option when selectedValue changes
  }, [selectedValue]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen); // Toggle dropdown visibility
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option); // Update the selected option
    onSelect(option); // Pass the selected option back to the parent
    setIsOpen(false); // Close the dropdown
  };

  return (
    <div className="custom-dropdown">
      <div className="selected" onClick={toggleDropdown}>
        <div className="selected-label">
          {selectedOption ? selectedOption.group : "Select an option"} {/* Display selected option or placeholder */}
        </div>
        <img
          src={isOpen ? '../assets/svg/up-arrow.svg' : '../assets/svg/down-arrow.svg'} // Use different icons for up and down
          alt="Dropdown icon"
          className="dropdown-icon"
        />
      </div>
      {isOpen && (
        <div className="options">
          {options.map(option => (
            <div
              key={option.id}
              className="option"
              onClick={() => handleOptionSelect(option)}
            >
              {option.group} {/* Display the group name */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
