import React, { useState, useEffect } from "react";
import { FaPlus, FaChevronDown } from "react-icons/fa";
import '../../styles/DroneWidget.css';

const DroneWidget = ({ drone, onAdd, selectedDrones }) => {
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

  // Check if the drone is already selected
  const isDroneSelected = selectedDrones.some((d) => d.id === drone.id);

  return (
    <div
      className={`drone-box ${showOptions ? "expanded" : ""}`}
      onClick={toggleOptions}
    >
      <div className="drone-header">
        <FaChevronDown
          className="dropdown-icon"
          style={{
            transform: showOptions ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
        <span className="drone-id">
          {drone?.tag || "Unknown Drone"} {/* Display drone tag */}
        </span>
        <button
          className="add-btn-drone"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the click event from triggering on the parent div
            if (!isDroneSelected) {
              onAdd(drone); // Call the onAdd function passed as a prop
            }
          }}
          disabled={isDroneSelected} // Disable the button if drone is already selected
        >
          <FaPlus className="plus-icon" style={{ marginLeft: "15px" }} /> Add
        </button>
      </div>

      {showOptions && (
        <div className="options-container">
          <label>Spraying</label>
          <label>Spreading</label>
          <label>Batteries</label>
          <label>Bla Bla Bla</label>
        </div>
      )}
    </div>
  );
};

export default DroneWidget;
