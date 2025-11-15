import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars } from 'react-loader-spinner';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import '../../../styles/requestsQueue.css';

const RequestsQueueMain = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [adhocLoading, setAdhocLoading] = useState(false);
  const [adhocData, setAdhocData] = useState(null);
  const [adhocError, setAdhocError] = useState('');
  
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleData, setRescheduleData] = useState(null);
  const [rescheduleError, setRescheduleError] = useState('');
  
  const [nonpLoading, setNonpLoading] = useState(false);
  const [nonpData, setNonpData] = useState(null);
  const [nonpError, setNonpError] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const fetchAdhocData = async () => {
      setAdhocLoading(true);
      setAdhocError('');
      try {
        const result = await dispatch(baseApi.endpoints.getPendingAdHocRequests.initiate());
        const data = result.data;
        if (data && data.status === 'true') {
          setAdhocData(data);
        } else {
          setAdhocData({ requests: [], request_count: 0 });
        }
      } catch (e) {
        setAdhocError('Failed to load ad-hoc requests');
        setAdhocData({ requests: [], request_count: 0 });
      } finally {
        setAdhocLoading(false);
      }
    };

    const fetchRescheduleData = async () => {
      setRescheduleLoading(true);
      setRescheduleError('');
      try {
        const result = await dispatch(baseApi.endpoints.getPendingRescheduleRequestsByManager.initiate());
        const data = result.data;
        if (data && data.requests) {
          setRescheduleData(data);
        } else {
          setRescheduleData({ requests: [] });
        }
      } catch (e) {
        setRescheduleError('Failed to load reschedule requests');
        setRescheduleData({ requests: [] });
      } finally {
        setRescheduleLoading(false);
      }
    };

    const fetchNonpData = async () => {
      setNonpLoading(true);
      setNonpError('');
      try {
        const result = await dispatch(baseApi.endpoints.getPendingNonPlantationMissions.initiate());
        const data = result.data;
        if (data && data.status === 'true') {
          // Handle the response structure: { status: "true", count: 1, "0": [...] }
          const requests = data['0'] || [];
          setNonpData({ requests, count: data.count || requests.length });
        } else {
          setNonpData({ requests: [], count: 0 });
        }
      } catch (e) {
        setNonpError('Failed to load non-plantation requests');
        setNonpData({ requests: [], count: 0 });
      } finally {
        setNonpLoading(false);
      }
    };

    fetchAdhocData();
    fetchRescheduleData();
    fetchNonpData();
  }, []);

  const formatDates = (datesString) => {
    if (!datesString) return 'N/A';
    return datesString.split(',').map(d => d.trim()).join(', ');
  };

  return (
    <div className="wrapper-req-queue">
      <div className="header-req-queue">
        <button 
          className="back-btn-req-queue" 
          onClick={() => {
            if (isNavigating) return;
            setIsNavigating(true);
            navigate('/home/workflowDashboard');
          }} 
          disabled={isNavigating}
          aria-label="Back"
        >
          {isNavigating ? (
            <Bars height="16" width="16" color="#004b71" ariaLabel="bars-loading" visible={true} />
          ) : (
            <svg className="back-icon-req-queue" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          )}
        </button>
        <div className="center-header-req-queue">
          <div className="heading-req-queue">Requests Queue</div>
        </div>
      </div>

      <div className="columns-container-req-queue">
        {/* Column 1: Plantation Add-hoc Request Queue */}
        <div className="column-req-queue">
          <div className="column-header-req-queue">
            <h2 className="column-title-req-queue">Plantation Add-hoc Request Queue</h2>
            <span className="column-count-req-queue">
              Plans {adhocData?.request_count || 0} »
            </span>
          </div>
          
          <div className="requests-list-req-queue">
            {adhocLoading && (
              <div className="loading-req-queue">
                <Bars height="30" width="30" color="#003057" ariaLabel="bars-loading" visible={true} />
                <span>Loading...</span>
              </div>
            )}
            {adhocError && <div className="error-req-queue">{adhocError}</div>}
            {!adhocLoading && !adhocError && (
              <>
                {(!adhocData?.requests || adhocData.requests.length === 0) ? (
                  <div className="empty-req-queue">No pending requests</div>
                ) : (
                  adhocData.requests.map((request) => (
                    <div 
                      key={request.request_id} 
                      className="request-tile-req-queue"
                      onClick={() => navigate('/home/requestProceed', { state: { requestId: request.request_id } })}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="tile-header-req-queue">
                        <span className="tile-id-req-queue">Request #{request.request_id}</span>
                        <span className="tile-status-req-queue">
                          {request.status === 'p' ? 'Pending' : request.status}
                        </span>
                      </div>
                      <div className="tile-body-req-queue">
                        <div className="tile-row-req-queue">
                          <span className="tile-label-req-queue">Estate:</span>
                          <span className="tile-value-req-queue">{request.estate || 'N/A'}</span>
                        </div>
                        {request.crop && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Crop:</span>
                            <span className="tile-value-req-queue">{request.crop}</span>
                          </div>
                        )}
                        {request.mission_type && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Mission:</span>
                            <span className="tile-value-req-queue">{request.mission_type}</span>
                          </div>
                        )}
                        {request.total_extent !== null && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Total Extent:</span>
                            <span className="tile-value-req-queue">{request.total_extent} Ha</span>
                          </div>
                        )}
                        {request.time && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Time:</span>
                            <span className="tile-value-req-queue">{request.time}</span>
                          </div>
                        )}
                        <div className="tile-row-req-queue">
                          <span className="tile-label-req-queue">Requested Dates:</span>
                          <span className="tile-value-req-queue">{formatDates(request.dates)}</span>
                        </div>
                        {request.date_planed && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Planned Date:</span>
                            <span className="tile-value-req-queue">{request.date_planed}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Column 2: Plantation Reschedule Request Queue */}
        <div className="column-req-queue">
          <div className="column-header-req-queue">
            <h2 className="column-title-req-queue">Plantation Reschedule Request Queue</h2>
            <span className="column-count-req-queue">
              Plans {rescheduleData?.requests?.length || 0} »
            </span>
          </div>
          
          <div className="requests-list-req-queue">
            {rescheduleLoading && (
              <div className="loading-req-queue">
                <Bars height="30" width="30" color="#003057" ariaLabel="bars-loading" visible={true} />
                <span>Loading...</span>
              </div>
            )}
            {rescheduleError && <div className="error-req-queue">{rescheduleError}</div>}
            {!rescheduleLoading && !rescheduleError && (
              <>
                {(!rescheduleData?.requests || rescheduleData.requests.length === 0) ? (
                  <div className="empty-req-queue">No pending requests</div>
                ) : (
                  rescheduleData.requests.map((request, idx) => (
                    <div 
                      key={`${request.plan}-${request.date}-${idx}`} 
                      className="request-tile-req-queue"
                      onClick={() => {
                        const requestIdentifier = request.request_id ?? request.plan;
                        navigate('/home/requestProceed', { 
                          state: { 
                            requestId: requestIdentifier, 
                            requestType: 'reschedule',
                            requestData: request
                          } 
                        });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="tile-header-req-queue">
                        <span className="tile-id-req-queue">Plan #{request.plan}</span>
                        <span className="tile-status-req-queue">
                          {request.status === 'p' ? 'Pending' : request.status}
                        </span>
                      </div>
                      <div className="tile-body-req-queue">
                        <div className="tile-row-req-queue">
                          <span className="tile-label-req-queue">Estate:</span>
                          <span className="tile-value-req-queue">{request.estate || 'N/A'}</span>
                        </div>
                        <div className="tile-row-req-queue">
                          <span className="tile-label-req-queue">Original Date:</span>
                          <span className="tile-value-req-queue">{request.plan_date ||'N/A'}</span>
                        </div>
                        {request.reason && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Reason:</span>
                            <span className="tile-value-req-queue">{request.reason}</span>
                          </div>
                        )}
                        <div className="tile-row-req-queue">
                          <span className="tile-label-req-queue">Requested Dates:</span>
                          <span className="tile-value-req-queue">{formatDates(request.requested_dates)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Column 3: Non-Plantation Plan Request Queue */}
        <div className="column-req-queue">
          <div className="column-header-req-queue">
            <h2 className="column-title-req-queue">Non-Plantation Plan Request Queue</h2>
            <span className="column-count-req-queue">
              Plans {nonpData?.count || 0} »
            </span>
          </div>
          
          <div className="requests-list-req-queue">
            {nonpLoading && (
              <div className="loading-req-queue">
                <Bars height="30" width="30" color="#003057" ariaLabel="bars-loading" visible={true} />
                <span>Loading...</span>
              </div>
            )}
            {nonpError && <div className="error-req-queue">{nonpError}</div>}
            {!nonpLoading && !nonpError && (
              <>
                {(!nonpData?.requests || nonpData.requests.length === 0) ? (
                  <div className="empty-req-queue">No pending requests</div>
                ) : (
                  nonpData.requests.map((request, idx) => (
                    <div key={`${request.mission_id}-${idx}`} className="request-tile-req-queue">
                      <div className="tile-header-req-queue">
                        <span className="tile-id-req-queue">Mission #{request.mission_id}</span>
                        <span className="tile-status-req-queue">
                          {request.status === 'p' ? 'Pending' : request.status_text || request.status}
                        </span>
                      </div>
                      <div className="tile-body-req-queue">
                        <div className="tile-row-req-queue">
                          <span className="tile-label-req-queue">Farmer:</span>
                          <span className="tile-value-req-queue">{request.farmer_name || 'N/A'}</span>
                        </div>
                        <div className="tile-row-req-queue">
                          <span className="tile-label-req-queue">NIC:</span>
                          <span className="tile-value-req-queue">{request.farmer_nic || 'N/A'}</span>
                        </div>
                        {request.farmer_telephone && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Phone:</span>
                            <span className="tile-value-req-queue">{request.farmer_telephone}</span>
                          </div>
                        )}
                        {request.land_name && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Land:</span>
                            <span className="tile-value-req-queue">{request.land_name}</span>
                          </div>
                        )}
                        {request.land_extent && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Land Extent:</span>
                            <span className="tile-value-req-queue">{request.land_extent} Ha</span>
                          </div>
                        )}
                        {request.crop_type_name && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Crop:</span>
                            <span className="tile-value-req-queue">{request.crop_type_name}</span>
                          </div>
                        )}
                        {request.mission_type && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Mission:</span>
                            <span className="tile-value-req-queue">{request.mission_type === 'spr' ? 'Spray' : request.mission_type}</span>
                          </div>
                        )}
                        {request.chemical_name && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Chemical:</span>
                            <span className="tile-value-req-queue">{request.chemical_name}</span>
                          </div>
                        )}
                        {request.sector_name && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Sector:</span>
                            <span className="tile-value-req-queue">{request.sector_name}</span>
                          </div>
                        )}
                        {request.asc_name && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">ASC:</span>
                            <span className="tile-value-req-queue">{request.asc_name}</span>
                          </div>
                        )}
                        {request.gnd && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">GND:</span>
                            <span className="tile-value-req-queue">{request.gnd}</span>
                          </div>
                        )}
                        <div className="tile-row-req-queue">
                          <span className="tile-label-req-queue">Date Requested:</span>
                          <span className="tile-value-req-queue">{request.date_requested || 'N/A'}</span>
                        </div>
                        {request.date_planed && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Date Planned:</span>
                            <span className="tile-value-req-queue">{request.date_planed}</span>
                          </div>
                        )}
                        {request.payment_type && (
                          <div className="tile-row-req-queue">
                            <span className="tile-label-req-queue">Payment Type:</span>
                            <span className="tile-value-req-queue">{request.payment_type === 'p' ? 'Pending' : request.payment_type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsQueueMain;

