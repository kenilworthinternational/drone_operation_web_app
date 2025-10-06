import React, { useState } from "react";
import { FaTrash, FaChevronDown } from "react-icons/fa";
import '../../styles/ManageDronesWidget.css';

const ManageDronesWidget = ({ drones = [], onRemove }) => {
  const [expandedDroneIndex, setExpandedDroneIndex] = useState(null);

  const toggleDroneDetails = (index) => {
    setExpandedDroneIndex((prevIndex) => (prevIndex === index ? null : index)); // ✅ Functional state update
  };

  // ✅ Remove duplicate drones by ID
  const uniqueDrones = [...new Map(drones.map((drone) => [drone.id, drone])).values()];

  return (
    <div className="manage-drones-widget">
      {uniqueDrones.length > 0 ? (
        uniqueDrones.map((drone, index) => (
          <div key={`${drone.id}-${index}`} className="drone-item"> {/* ✅ Unique key */}
            <div className="drone-header" onClick={() => toggleDroneDetails(index)}>
              <span className="drone-name">
                {drone?.tag ? drone.tag : "Unknown Drone"}
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
          </div>
        ))
      ) : (
        <p className="no-drones">No drones selected.</p>
      )}
    </div>
  );
};

export default ManageDronesWidget;
