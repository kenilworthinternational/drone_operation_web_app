import React from "react";
import "../css/ProfileWidget.css";
import { FaTrash } from "react-icons/fa";

const ManageWidget = ({ id, profilePic, name, mobile, nic, onMakeLeader, onDelete, isLeader }) => {
  
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
        </div>
      </div>

      <div className="profile-right">
        <label className="leader-checkbox">
          Make Leader 
          <input
            type="checkbox"
            checked={isLeader} // Use the isLeader prop directly
            onChange={handleLeaderToggle} // Call the handleLeaderToggle function
          />
        </label>
        <button className="delete-btn" onClick={onDelete} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaTrash className="trash-icon" /> Delete
        </button>
      </div>
    </div>
  );
};

export default ManageWidget;
