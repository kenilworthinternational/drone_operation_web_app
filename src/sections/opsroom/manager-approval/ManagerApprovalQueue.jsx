import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Bars } from 'react-loader-spinner';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import { useGetEstateDetailsQuery } from '../../../api/services/estatesApi';
import { FaPhone, FaTimes } from 'react-icons/fa';
import '../../../styles/managerApprovalQueue.css';

const ManagerApprovalQueue = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showContactPopup, setShowContactPopup] = useState(false);

  // Get tomorrow's date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError('');
      try {
        const tomorrowDate = getTomorrowDate();
        const result = await dispatch(baseApi.endpoints.getPlansByDate.initiate(tomorrowDate));
        const data = result.data;
        
        // Handle different response structures
        let plansArray = [];
        
        if (data && Array.isArray(data)) {
          // If it's already an array
          plansArray = data;
        } else if (data && typeof data === 'object' && data.status === 'true') {
          // If it's an object with status and numeric keys (e.g., "0", "1", "2")
          plansArray = Object.keys(data)
            .filter(key => !isNaN(key) && key !== 'status' && key !== 'count')
            .map(key => data[key]);
        } else if (data && typeof data === 'object') {
          // Try to extract plans from object
          plansArray = Object.keys(data)
            .filter(key => !isNaN(key))
            .map(key => data[key]);
        }
        
        // Filter plans: activated=1 AND manager_approval=0
        // Handle both string and number comparisons
        const filteredPlans = plansArray.filter(plan => {
          const activated = Number(plan.activated) === 1 || plan.activated === '1';
          const managerApproval = Number(plan.manager_approval) === 0 || 
                                  plan.manager_approval === '0' || 
                                  plan.manager_approval === null ||
                                  plan.manager_approval === undefined;
          return activated && managerApproval;
        });
        
        setPlans(filteredPlans);
      } catch (e) {
        console.error('Error fetching plans:', e);
        setError('Failed to load plans');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const handleContactClick = (plan) => {
    setSelectedPlan(plan);
    setShowContactPopup(true);
  };

  const closeContactPopup = () => {
    setShowContactPopup(false);
    setSelectedPlan(null);
  };

  return (
    <div className="manager-approval-queue-container-managerqueue">
      <div className="manager-approval-queue-header-managerqueue">
        <button 
          className="back-btn-manager-approval-managerqueue" 
          onClick={() => navigate('/home/workflowDashboard')}
        >
          ← Back
        </button>
        <h1>Plantation Manager Approval Queue</h1>
        <div className="queue-info-manager-approval-managerqueue">
          <span>Date: {formatDate(getTomorrowDate())}</span>
          <span>Total Plans: {plans.length}</span>
        </div>
      </div>

      <div className="manager-approval-queue-content-managerqueue">
        {loading ? (
          <div className="loading-container-manager-approval-managerqueue">
            <Bars
              height="50"
              width="50"
              color="#004B71"
              ariaLabel="loading"
            />
            <p>Loading plans...</p>
          </div>
        ) : error ? (
          <div className="error-container-manager-approval-managerqueue">
            <p>{error}</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="empty-container-manager-approval-managerqueue">
            <p>No plans pending manager approval for tomorrow.</p>
          </div>
        ) : (
          <div className="plans-grid-managerqueue">
            {plans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onContactClick={handleContactClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contact Popup */}
      {showContactPopup && selectedPlan && (
        <ContactPopup 
          plan={selectedPlan}
          onClose={closeContactPopup}
        />
      )}
    </div>
  );
};

// Plan Card Component
const PlanCard = ({ plan, onContactClick }) => {
  const estateId = plan.estateId || plan.estate_id || plan.estate;
  const { data: estateData, isLoading: loadingEstate } = useGetEstateDetailsQuery(estateId, {
    skip: !estateId
  });

  // Get first manager
  const firstManager = estateData?.manager && estateData.manager.length > 0 
    ? estateData.manager[0] 
    : null;

  // Get other managers (if more than one) and other personals
  const otherManagers = estateData?.manager && estateData.manager.length > 1 
    ? estateData.manager.slice(1) 
    : [];
  const otherPersonals = estateData?.other_personals || [];

  return (
    <div className="plan-card-managerqueue">
      <div className="plan-card-header-managerqueue">
        <div className="plan-id-managerqueue">Plan #{plan.id}</div>
        <span className="status-badge-manager-approval-managerqueue pending">
          Pending Approval
        </span>
      </div>
      <div className="plan-card-body-managerqueue">
        <div className="plan-estate-managerqueue">
          <strong>{plan.estate_name || plan.estate || 'N/A'}</strong>
        </div>
        {firstManager && (
          <div className="plan-manager-managerqueue">
            <span className="manager-label-managerqueue">Manager:</span>
            <span className="manager-name-managerqueue">{firstManager.name}</span>
            <span className="manager-mobile-managerqueue">{firstManager.mobile}</span>
          </div>
        )}
        {!firstManager && loadingEstate && (
          <div className="plan-manager-loading-managerqueue">Loading...</div>
        )}
        {!firstManager && !loadingEstate && (
          <div className="plan-manager-managerqueue">
            <span className="manager-label-managerqueue">Manager:</span>
            <span className="manager-name-managerqueue">N/A</span>
          </div>
        )}
      </div>
      <div className="plan-card-footer-managerqueue">
        <button 
          className="contact-btn-managerqueue"
          onClick={() => onContactClick(plan)}
          disabled={loadingEstate}
        >
          <FaPhone /> Contact
        </button>
      </div>
    </div>
  );
};

// Contact Popup Component
const ContactPopup = ({ plan, onClose }) => {
  const estateId = plan.estateId || plan.estate_id || plan.estate;
  const { data: estateData, isLoading: loadingEstate } = useGetEstateDetailsQuery(estateId, {
    skip: !estateId
  });

  // Get all managers
  const managers = estateData?.manager || [];
  const otherPersonals = estateData?.other_personals || [];

  return (
    createPortal(
      <div className="contact-popup-overlay-managerqueue" onClick={onClose}>
        <div className="contact-popup-content-managerqueue" onClick={(e) => e.stopPropagation()}>
          <div className="contact-popup-header-managerqueue">
            <h2>Contact Information</h2>
            <button className="contact-popup-close-managerqueue" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          <div className="contact-popup-body-managerqueue">
            <div className="contact-estate-info-managerqueue">
              <strong>{plan.estate_name || plan.estate || 'N/A'}</strong>
              <span>Plan #{plan.id}</span>
            </div>
            
            {loadingEstate ? (
              <div className="contact-loading-managerqueue">Loading contacts...</div>
            ) : (
              <>
                {managers.length > 0 && (
                  <div className="contact-section-managerqueue">
                    <h3>Managers</h3>
                    {managers.map((manager, index) => (
                      <div key={index} className="contact-item-managerqueue">
                        <div className="contact-name-managerqueue">
                          <strong>{manager.name}</strong>
                          <span className="contact-appointment-managerqueue">{manager.appointment}</span>
                        </div>
                        <div className="contact-mobile-managerqueue">
                          <FaPhone /> {manager.mobile}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {otherPersonals.length > 0 && (
                  <div className="contact-section-managerqueue">
                    <h3>Other Contacts</h3>
                    {otherPersonals.map((person, index) => (
                      <div key={index} className="contact-item-managerqueue">
                        <div className="contact-name-managerqueue">
                          <strong>{person.name}</strong>
                          <span className="contact-appointment-managerqueue">{person.appointment}</span>
                        </div>
                        <div className="contact-mobile-managerqueue">
                          <FaPhone /> {person.mobile}
                        </div>
                        {person.divisions && person.divisions.length > 0 && (
                          <div className="contact-divisions-managerqueue">
                            Divisions: {person.divisions.map(d => d.division).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {managers.length === 0 && otherPersonals.length === 0 && (
                  <div className="contact-empty-managerqueue">No contact information available</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>,
      document.body
    )
  );
};

export default ManagerApprovalQueue;

