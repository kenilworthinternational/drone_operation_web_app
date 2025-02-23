import React from "react";
import "../css/ProfileWidget.css";
import { FaPlus } from "react-icons/fa";

const ProfileWidget = ({ id, profilePic, name, mobile, onAdd }) => {
  return (
    <div className="profile-widget">
      <div className="profile-left">
        <img src={profilePic} alt="Profile" className="profile-pic" />
        <div className="profile-details">
          <p style={{textAlign: "left"}}><strong>Name:</strong> {name}</p>
          <p style={{textAlign: "left"}}><strong>Mobile:</strong> {mobile}</p>
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

export default ProfileWidget;
