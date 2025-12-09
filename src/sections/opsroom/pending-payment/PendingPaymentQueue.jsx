import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars } from 'react-loader-spinner';
import { useGetMissionsPendingPaymentQuery } from '../../../api/services NodeJs/pilotAssignmentApi';
import { FaPhone } from 'react-icons/fa';
import '../../../styles/pendingPaymentQueue.css';

const PendingPaymentQueue = () => {
  const navigate = useNavigate();
  const { data: missionsData, isLoading: loading, error: queryError } = useGetMissionsPendingPaymentQuery();
  const [error, setError] = useState('');

  // Extract missions from response
  const missions = missionsData?.data || [];

  useEffect(() => {
    if (queryError) {
      setError('Failed to load missions');
    } else {
      setError('');
    }
  }, [queryError]);

  // Parse pilots string (format: "id:name:mobile|id:name:mobile")
  const parsePilots = (pilotsString) => {
    if (!pilotsString) return [];
    return pilotsString.split('|').map(pilot => {
      const [id, name, mobile] = pilot.split(':');
      return { id, name, mobile: mobile || 'N/A' };
    });
  };

  // Get first pilot (assigned pilot)
  const getAssignedPilot = (mission) => {
    const pilots = parsePilots(mission.pilots);
    return pilots.length > 0 ? pilots[0] : null;
  };

  return (
    <div className="pending-payment-queue-container-paymentqueue">
      <div className="pending-payment-queue-header-paymentqueue">
        <button 
          className="back-btn-pending-payment-paymentqueue" 
          onClick={() => navigate('/home/workflowDashboard')}
        >
          ←
        </button>
        <h1>Pending Payment Queue</h1>
        <div className="queue-info-pending-payment-paymentqueue">
          <span>Total Missions: {missions.length}</span>
        </div>
      </div>

      <div className="pending-payment-queue-content-paymentqueue">
        {loading ? (
          <div className="loading-container-pending-payment-paymentqueue">
            <Bars
              height="50"
              width="50"
              color="#004B71"
              ariaLabel="loading"
            />
            <p>Loading missions...</p>
          </div>
        ) : error ? (
          <div className="error-container-pending-payment-paymentqueue">
            <p>{error}</p>
          </div>
        ) : missions.length === 0 ? (
          <div className="empty-container-pending-payment-paymentqueue">
            <p>No missions pending payment.</p>
          </div>
        ) : (
          <div className="missions-grid-paymentqueue">
            {missions.map((mission) => {
              const assignedPilot = getAssignedPilot(mission);
              return (
                <div key={mission.id} className="mission-card-paymentqueue">
                  <div className="mission-card-header-paymentqueue">
                    <div className="mission-id-paymentqueue">Mission #{mission.id} - {mission.area || (mission.total_land_extent || 0)} ha</div>
                    <span className="status-badge-pending-payment-paymentqueue pending">
                      Pending Payment
                    </span>
                  </div>
                  <div className="mission-card-body-paymentqueue">
                    <div className="mission-farmer-pilot-row-paymentqueue">
                      <div className="mission-farmer-paymentqueue">
                        <div className="mission-label-paymentqueue">Farmer:</div>
                        <div className="mission-value-paymentqueue">
                          <strong>{mission.farmer_name || 'N/A'}</strong>
                        </div>
                        {mission.farmer_mobile && (
                          <div className="mission-contact-paymentqueue">
                            <FaPhone /> {mission.farmer_mobile}
                          </div>
                        )}
                      </div>

                      {assignedPilot && (
                        <div className="mission-pilot-paymentqueue">
                          <div className="mission-label-paymentqueue">Pilot:</div>
                          <div className="mission-value-paymentqueue">
                            <strong>{assignedPilot.name}</strong>
                          </div>
                          <div className="mission-contact-paymentqueue">
                            <FaPhone /> {assignedPilot.mobile}
                          </div>
                        </div>
                      )}

                      {!assignedPilot && (
                        <div className="mission-pilot-paymentqueue">
                          <div className="mission-label-paymentqueue">Pilot:</div>
                          <div className="mission-value-paymentqueue">Not Assigned</div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingPaymentQueue;

