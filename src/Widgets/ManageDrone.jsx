import React, { useState } from "react";
import { FaTrash, FaChevronDown } from "react-icons/fa";
import "../css/ManageDronesWidget.css"; // Ensure the correct path

const ManageDronesWidget = ({ drones = [], onRemove }) => {
  const [expandedDroneIndex, setExpandedDroneIndex] = useState(null);

  const toggleDroneDetails = (index) => {
    setExpandedDroneIndex(expandedDroneIndex === index ? null : index);
  };

  return (
    <div className="manage-drones-widget">
      {Array.isArray(drones) && drones.length > 0 ? (
        drones.map((drone, index) => (
          <div key={drone.id || index} className="drone-item">
            <div className="drone-header" onClick={() => toggleDroneDetails(index)}>
              {/* <FaChevronDown className={`dropdown-icon ${expandedDroneIndex === index ? 'expanded' : ''}`} /> */}
              <span className="drone-name">
                {drone?.tag ? drone.tag : "Unknown Drone"} {/* Use .tag instead of .drone_tag */}
              </span>

              <button
                className="remove-btn-drone"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(drone);
                }}
              >
                <FaTrash className="trash-icon" /> Remove
              </button>
            </div>
            {/* {expandedDroneIndex === index && (
              <div className="drone-details">
                <p>Details about {drone.drone_tag}</p>
                <p>Type: Fixed Wing</p>
                <p>Battery: 1000 mAh</p>
                <p>Status: Active</p>
              </div>
            )} */}
          </div>
        ))
      ) : (
        <p className="no-drones">No drones selected.</p>
      )}
    </div>
  );
};

export default ManageDronesWidget;
