import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../css/summarywidget.css";

const SummaryWidget = ({ date, estate, hectares, teams = [] }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="summary-widget">
      <div className="summary-header" onClick={() => setExpanded(!expanded)}>
        <span>Date: {date}</span>
        <span>Estate: {estate}</span>
        <span>Total Hectares: {hectares}</span>
        {expanded ? <FaChevronUp /> : <FaChevronDown />}
      </div>

      {expanded && (
        <div className="details-container">
          <div className="table-container">
            {teams.length > 0 ? (
              <>
                {/* Table Headers */}
                <div className="table-row table-header">
                  <div className="table-cell team-column" style={{ flex: 3 }}>Team</div>
                  <div className="table-cell drone-column" style={{ flex: 2 }}>Drone</div>
                  <div className="table-cell lead-column" style={{ flex: 3 }}>Team Lead</div>
                </div>
                {/* Table Rows */}
                {teams.map((team, index) => (
                  <div key={index} className="table-row">
                    {/* Team Column */}
                    <div className="table-cell team-column" style={{ flex: 3 }}>
                      <div className="team-member-set">
                        <img src={team.image} alt="Profile" className="profile-pic" />
                        <div className="name-mobile-team">
                          <span>{team.name}</span>
                          <span>{team.mobile_no}</span>
                        </div>
                      </div>
                    </div>
                    {/* Drone Column */}
                    <div className="table-cell drone-column" style={{ flex: 2 }}>
                      {team.droneTag !== 'N/A' ? team.droneTag : 'No Drone'}
                    </div>
                    {/* Team Lead Column */}
                    <div className="table-cell lead-column" style={{ flex: 3 }}>
                      {team.leadProfilePic && (
                        <>
                          <img src={team.leadProfilePic} alt="Lead Profile" className="profile-pic" />
                          <div className="name-section-summary">
                            <span>{team.name}</span>
                            <span>{team.leadPhone}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="no-data">No teams assigned.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryWidget;
