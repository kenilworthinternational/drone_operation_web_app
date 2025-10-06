import React from "react";
import '../../styles/ProfileWidget.css';
import { FaPlus } from "react-icons/fa";

const ProfileWidgetAsc = ({ id, profilePic, name, mobile, onAdd, position }) => {
  let jobRole = "";
  

  // Assign job role based on position
  if (position === "dp" || position === "adp") {
    jobRole = "Drone Pilot"
  } else if (position === "tl" || position === "atl" ) {
    jobRole = "Team Leader"
  }
  return (
    <div className="profile-widget">
      <div className="profile-left">
        <img src={profilePic} alt="Profile" className="profile-pic" />
        <div className="profile-details">
          <p style={{textAlign: "left"}}><strong>Name:</strong> {name}</p>
          <p style={{textAlign: "left"}}><strong>Mobile:</strong> {mobile}</p>
          <p style={{textAlign: "left"}}><strong>Position:</strong> {jobRole}</p>
        </div>
      </div>

      <div className="profile-right">
        <button className="add-btn" onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaPlus className="plus-icon" /> Add
        </button>
      </div>
    </div>
  );
};

export default ProfileWidgetAsc;
