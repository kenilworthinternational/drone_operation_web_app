import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import '../styles/summarywidget.css';

const SummaryWidget = ({ date, estate, hectares, selectedDrones, selectedPilots, teamLeaders, plansData = {} }) => {
  const [expanded, setExpanded] = useState(false);

  // Helper functions for plan display
  const getFlagDisplayText = (flag) => {
    switch (flag) {
      case 'ap':
        return 'AddHoc';
      case 'np':
        return 'Rev.Plan';
      case 'rp':
        return 'Resh.Plan';
      default:
        return flag;
    }
  };

  const getFlagDisplayColor = (flag) => {
    switch (flag) {
      case 'ap':
        return '#ff6b35'; // Orange for AddHoc
      case 'np':
        return '#28a745'; // Green for Rev.Plan
      case 'rp':
        return '#007bff'; // Blue for Resh.Plan
      default:
        return '#6c757d';
    }
  };

  // Get plans for a specific team
  const getPlansForTeam = (teamId) => {
    return plansData[teamId] || [];
  };

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
          {/* Plans Section - Display plans for the date */}
          {Object.keys(plansData).length > 0 && (
            <div className="plans-section">
              <h4>📅 Plans for {date}</h4>
              <div className="plans-grid">
                {Object.keys(plansData).map(teamId => {
                  const teamPlans = getPlansForTeam(teamId);
                  if (teamPlans.length === 0) return null;
                  
                  return (
                    <div key={teamId} className="plan-team-card">
                      <div className="plan-team-header">
                        <span className="plan-team-name">Team {teamId}</span>
                        <span className="plan-count">({teamPlans.length})</span>
                      </div>
                      <div className="plan-list">
                        {teamPlans.map((plan, index) => (
                          <div key={plan.id} className="plan-item">
                            <div className="plan-header">
                              <div className="plan-estate">
                                {plan.estate} - {plan.area} Ha
                              </div>
                              <div 
                                className="plan-flag"
                                style={{ backgroundColor: getFlagDisplayColor(plan.flag) }}
                              >
                                {getFlagDisplayText(plan.flag)}
                              </div>
                            </div>
                            <div className="plan-details">
                              <div className="plan-id">Plan ID: {plan.id}</div>
                              {plan.team_lead && (
                                <div className="plan-team-lead">Team Lead: {plan.team_lead}</div>
                              )}
                              {plan.pilots && plan.pilots.length > 0 && (
                                <div className="plan-pilots">
                                  <strong>Pilots:</strong> {plan.pilots.map(p => p.pilot).join(', ')}
                                </div>
                              )}
                              {plan.drones && plan.drones.length > 0 && (
                                <div className="plan-drones">
                                  <strong>Drones:</strong> {plan.drones.map(d => d.tag).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Row 1: All Pilots & Team Leader */}
          <div className="team-info-row">
            <div className="team-members">
              {/* Display Team Leaders */}
              {teamLeaders.length > 0 && teamLeaders.map((leader, index) => (
                <div key={index} className="team-member leader-highlight">
                  <img src={leader.image} alt="Lead Profile" className="profile-pic leader-pic" />
                  <div className="name-mobile">
                    <span>{leader.name} (Leader)</span>
                    <span>{leader.mobile_no}</span>
                  </div>
                </div>
              ))}

              {/* Display All Pilots */}
              {selectedPilots.map((pilot, index) => (
                <div key={index} className="team-member">
                  <img src={pilot.image} alt="Profile" className="profile-pic" />
                  <div className="name-mobile">
                    <span>{pilot.name}</span>
                    <span>{pilot.mobile_no}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Drones */}
          <div className="drone-row">
            {selectedDrones.length > 0 ? (
              selectedDrones.map((drone, index) => (
                <span key={index} className="drone-set-box">
                  <img src="/assets/svg/drone.svg" alt="Drone" className="drone-svg" />
                  {drone.tag}
                </span>
              ))
            ) : (
              <span>No Drones Available</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryWidget;
