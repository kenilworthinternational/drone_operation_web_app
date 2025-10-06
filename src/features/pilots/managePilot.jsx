import React from "react";
import '../../styles/ProfileWidget.css';
import { FaTrash } from "react-icons/fa";

const ManageWidget = ({ id, profilePic, name, mobile, nic, onMakeLeader, onDelete, isLeader, position }) => {
  console.log("data", id, profilePic, name, mobile, nic, onMakeLeader, onDelete, isLeader, position);
  let jobRole = "";

  // Assign job role based on position
  if (position === "dp") {
    jobRole = "Drone Pilot"
  } else if (position === "tl") {
    jobRole = "Team Leader"
  }

  // Function to handle leader toggle
  const handleLeaderToggle = () => {
    onMakeLeader(id); // Call the parent function to toggle leader status
  };

  return (
    <div className="profile-widget">
      <div className="profile-left">
        <img src={profilePic} alt="Profile" className="profile-pic" />
        <div className="profile-details">
          <p style={{ textAlign: "left" }}><strong>Name:</strong> {name}</p>
          <p style={{ textAlign: "left" }}><strong>Mobile:</strong> {mobile}</p>
          <p style={{ textAlign: "left" }}><strong>Position:</strong> {jobRole}</p>
        </div>
      </div>

      <div className="profile-right">
        {position === "tl" && (
          <label className="leader-checkbox">
            Make Leader
            <input
              type="checkbox"
              checked={isLeader}
              onChange={handleLeaderToggle}
              disabled={isLeader} // Disable unchecking the only leader
            />
          </label>
        )}
        <button className="delete-btn" onClick={onDelete} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaTrash className="trash-icon" /> Delete
        </button>
      </div>
    </div>
  );
};


export default ManageWidget;
