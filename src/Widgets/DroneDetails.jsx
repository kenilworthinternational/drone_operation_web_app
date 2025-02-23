import React, { useState, useEffect } from "react";
import { FaPlus, FaChevronDown } from "react-icons/fa";
import "../css/DroneWidget.css"; // Ensure correct path

const DroneWidget = ({ drone, onAdd }) => {
  const [showOptions, setShowOptions] = useState(false);

  // Debugging: Log drone data and detect potential issues
  useEffect(() => {
    if (!drone) {
      console.error("🚨 Error: drone prop is undefined in DroneWidget!");
    } else if (!drone.tag) {
      console.error("🚨 Error: Missing 'drone_tag' in drone object!", drone);
    } else {
      console.log("✅ Drone data received in DroneWidget:", drone);
    }
  }, [drone]);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <div className={`drone-box ${showOptions ? "expanded" : ""}`} onClick={toggleOptions}>
      <div className="drone-header">
        {/* Optionally display the chevron icon */}
        {/* <FaChevronDown className="dropdown-icon" /> */}
        <span className="drone-id">
          {drone?.tag || "Unknown Drone"} {/* Display drone tag */}
        </span>
        <button
          className="add-btn-drone" style={{ marginLeft: "15px" }}
          onClick={(e) => {
            e.stopPropagation();
            onAdd(drone);
          }}
        >
          <FaPlus className="plus-icon" style={{ marginLeft: "15px" }} /> Add
        </button>
      </div>

      {/* Additional options can be displayed conditionally if needed */}
      {/* {showOptions && (
        <div className="options-container">
          <label>Spraying</label>
          <label>Spreading</label>
          <label>Batteries</label>
          <label>Bla Bla Bla</label>
        </div>
      )} */}
    </div>
  );
};

export default DroneWidget;
