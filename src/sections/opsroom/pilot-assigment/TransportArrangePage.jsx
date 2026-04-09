import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bars } from 'react-loader-spinner';
import {
  useGetTransportArrangementListQuery,
  useGetPilotTransportOptionsQuery,
  useEstimatePilotTransportDistanceMutation,
  useAssignPilotTransportDetailsMutation,
} from '../../../api/services NodeJs/allEndpoints';
import { useGetMyPermissionsQuery } from '../../../api/services NodeJs/featurePermissionsApi';
import { FEATURE_CODES } from '../../../utils/featurePermissions';
import { isInternalDeveloper } from '../../../utils/authUtils';
import '../../../styles/pilotAssignment-pilotsassign.css';

/**
 * Full-page list of today/tomorrow transport assignments; "Arrange" opens a single modal for driver/vehicle/time.
 */
const TransportArrangePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userId = userData?.id || null;
  const isDeveloper = isInternalDeveloper(userData);
  const { data: featurePermissionsData = {} } = useGetMyPermissionsQuery(undefined, {
    skip: !userId,
  });

  const checkFeatureAccess = (featureCode) => {
    if (isDeveloper) return true;
    if (!featurePermissionsData || typeof featurePermissionsData !== 'object') return false;
    if (featurePermissionsData.features && featurePermissionsData.features[featureCode] === true) {
      return true;
    }
    const categories = featurePermissionsData.categories || featurePermissionsData;
    for (const category in categories) {
      if (category === 'paths' || category === 'features') continue;
      const categoryData = categories[category];
      if (Array.isArray(categoryData) && categoryData.includes(featureCode)) {
        return true;
      }
    }
    return false;
  };

  const hasArrangeTransportFeature = checkFeatureAccess(FEATURE_CODES.PILOT_ASSIGNMENT_ARRANGE_TRANSPORT);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [transportDetailAssignmentId, setTransportDetailAssignmentId] = useState('');
  const [transportDetailYearMonth, setTransportDetailYearMonth] = useState('');
  const [transportEditable, setTransportEditable] = useState(true);
  const [transportForm, setTransportForm] = useState({
    driver_id: '',
    vehicle_id: '',
    driver_arrival_time: '06:00',
  });
  const [transportEstimate, setTransportEstimate] = useState(null);
  const transportRecommendedAppliedRef = useRef(false);

  const { data: transportArrangementListData, isLoading: loadingTransportArrangementList } =
    useGetTransportArrangementListQuery(undefined, { skip: !hasArrangeTransportFeature });
  const { data: transportOptionsData, isLoading: loadingTransportOptions } = useGetPilotTransportOptionsQuery(
    {
      assignment_id: transportDetailAssignmentId || null,
      yearMonth: transportDetailYearMonth || undefined,
      plan_ids: [],
    },
    { skip: !showDetailModal || !transportDetailAssignmentId || !hasArrangeTransportFeature }
  );
  const [estimateTransportDistance, { isLoading: estimatingTransport }] = useEstimatePilotTransportDistanceMutation();
  const [assignTransportDetails, { isLoading: savingTransport }] = useAssignPilotTransportDetailsMutation();

  const transportOptions = transportOptionsData?.data || null;
  const transportDrivers = transportOptions?.drivers || [];
  const transportEstates = transportOptions?.estates || [];
  const hasTransportEstates = transportEstates.length > 0;
  const transportArrangementRows = transportArrangementListData?.data || [];
  const transportArrangementToday = transportArrangementRows.filter((r) => r.day_label === 'today');
  const transportArrangementTomorrow = transportArrangementRows.filter((r) => r.day_label === 'tomorrow');

  const recommendedDriverId = useMemo(() => {
    if (!transportOptions?.recommended_driver_id) return '';
    return String(transportOptions.recommended_driver_id);
  }, [transportOptions]);

  const selectedTransportDriver = useMemo(() => {
    if (!transportForm.driver_id) return null;
    return transportDrivers.find((d) => String(d.id) === String(transportForm.driver_id)) || null;
  }, [transportForm.driver_id, transportDrivers]);

  const selectedVehicleDisplay = useMemo(() => {
    if (!selectedTransportDriver) return '';
    const parts = [
      selectedTransportDriver.vehicle_no,
      selectedTransportDriver.vehicle_make,
      selectedTransportDriver.vehicle_model,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : '';
  }, [selectedTransportDriver]);

  useEffect(() => {
    if (!showDetailModal) {
      transportRecommendedAppliedRef.current = false;
      return;
    }
    if (loadingTransportOptions || !transportOptions || transportRecommendedAppliedRef.current) return;
    const rid = transportOptions.recommended_driver_id;
    if (!rid) return;
    const driver = transportDrivers.find((d) => String(d.id) === String(rid));
    if (!driver?.vehicle_id) return;
    setTransportForm((prev) => {
      if (prev.driver_id) return prev;
      return {
        ...prev,
        driver_id: String(rid),
        vehicle_id: String(driver.vehicle_id),
      };
    });
    transportRecommendedAppliedRef.current = true;
  }, [showDetailModal, loadingTransportOptions, transportOptions, transportDrivers]);

  const formatDriverArrivalTimeForInput = (value) => {
    if (!value) return '06:00';
    const s = String(value);
    if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
    if (/^\d{2}:\d{2}$/.test(s)) return s;
    return '06:00';
  };

  const openTransportDetail = (row) => {
    transportRecommendedAppliedRef.current = false;
    setTransportEstimate(null);
    setTransportDetailAssignmentId(row.assignment_id);
    setTransportDetailYearMonth(row.assignment_day ? row.assignment_day.slice(0, 7) : '');
    setTransportEditable(!!row.editable_transport);
    setTransportForm({
      driver_id: row.driver_id != null ? String(row.driver_id) : '',
      vehicle_id: row.vehicle_id != null ? String(row.vehicle_id) : '',
      driver_arrival_time: formatDriverArrivalTimeForInput(row.driver_arrival_time),
    });
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setTransportDetailAssignmentId('');
    setTransportDetailYearMonth('');
    setTransportEstimate(null);
    transportRecommendedAppliedRef.current = false;
  };

  const updateTransportField = (field, value) => {
    setTransportForm((prev) => {
      if (field === 'driver_id') {
        const driver = transportDrivers.find((d) => String(d.id) === String(value));
        return {
          ...prev,
          driver_id: value,
          vehicle_id: driver?.vehicle_id != null ? String(driver.vehicle_id) : '',
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const onEstimateTransport = async () => {
    if (!transportDetailAssignmentId) {
      alert('Assignment id is required.');
      return;
    }
    if (!transportEditable) {
      alert('This assignment cannot be edited.');
      return;
    }
    if (!transportForm.driver_id) {
      alert('Select a driver first.');
      return;
    }
    try {
      const result = await estimateTransportDistance({
        assignment_id: transportDetailAssignmentId,
        driver_id: Number(transportForm.driver_id),
        end_lat: null,
        end_lng: null,
      }).unwrap();
      setTransportEstimate(result?.data || null);
    } catch (error) {
      const message = error?.data?.message || error?.message || 'Failed to estimate transport distance.';
      alert(message);
    }
  };

  const onSaveTransport = async () => {
    if (!transportDetailAssignmentId) {
      alert('Assignment id is required.');
      return;
    }
    if (!transportEditable) {
      alert('This assignment cannot be edited.');
      return;
    }
    if (!transportForm.driver_id || !transportForm.vehicle_id || !transportForm.driver_arrival_time) {
      alert('Driver, linked vehicle, and arrival time are required. Drivers without an assigned vehicle are not listed.');
      return;
    }
    if (!hasTransportEstates) {
      alert('Cannot save driver/vehicle because Assignment Estates is empty.');
      return;
    }
    try {
      await assignTransportDetails({
        assignment_id: transportDetailAssignmentId,
        driver_id: Number(transportForm.driver_id),
        vehicle_id: Number(transportForm.vehicle_id),
        driver_arrival_time: transportForm.driver_arrival_time,
      }).unwrap();
      alert('Transport details saved successfully.');
      closeDetailModal();
    } catch (error) {
      const message = error?.data?.message || error?.message || 'Failed to save transport details.';
      alert(message);
    }
  };

  const goBackToPilotAssignment = () => {
    navigate({ pathname: '/home/pilotAssignment', search: location.search });
  };

  return (
    <div className="pilot-assignment-container-pilotsassign pilot-assignment-transport-page-wrap-pilotsassign">
      <div className="pilot-assignment-header-pilotsassign">
        <button type="button" className="pilot-assignment-back-btn-pilotsassign" onClick={goBackToPilotAssignment}>
          <svg className="pilot-assignment-back-icon-pilotsassign" viewBox="0 0 24 24" width="25" height="25">
            <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <h1 className="pilot-assignment-title-pilotsassign">Arrange transport</h1>
        <div className="pilot-assignment-header-actions-pilotsassign" />
      </div>

      {!hasArrangeTransportFeature ? (
        <div className="pilot-assignment-access-denied-pilotsassign">
          <p>
            Arrange transport is not enabled for your role. An administrator can turn it on under{' '}
            <strong>ICT → Auth Controls → Features</strong> (OpsRoom).
          </p>
        </div>
      ) : null}

      {hasArrangeTransportFeature ? (
      <p className="pilot-assignment-transport-list-intro-pilotsassign" style={{ marginBottom: '16px' }}>
        Today and tomorrow pilot assignments. Choose <strong>Arrange</strong> or <strong>View</strong> to open driver and vehicle
        in a popup.
      </p>
      ) : null}

      {hasArrangeTransportFeature && loadingTransportArrangementList ? (
        <div className="pilot-assignment-teams-loading-pilotsassign">
          <Bars height="32" width="32" color="#003057" ariaLabel="bars-loading" visible />
          <span>Loading assignments...</span>
        </div>
      ) : null}
      {hasArrangeTransportFeature && !loadingTransportArrangementList ? (
        <>
          <div className="pilot-assignment-transport-list-section-pilotsassign">
            <div className="pilot-assignment-transport-subtitle-pilotsassign">Today</div>
            {transportArrangementToday.length === 0 ? (
              <div className="pilot-assignment-teams-empty-pilotsassign">No assignments for today.</div>
            ) : (
              transportArrangementToday.map((row) => (
                <div key={row.assignment_id} className="pilot-assignment-transport-list-card-pilotsassign">
                  <div className="pilot-assignment-transport-list-card-main-pilotsassign">
                    <div>
                      <strong>{row.team_name}</strong>
                      <span className="pilot-assignment-transport-list-meta-pilotsassign"> · {row.pilot_names}</span>
                    </div>
                    <div className="pilot-assignment-transport-list-estates-pilotsassign">{row.estate_summary}</div>
                    <div className="pilot-assignment-transport-list-current-pilotsassign">
                      {row.driver_id
                        ? `Driver: ${row.transport_driver_name || row.driver_id} · Vehicle: ${row.transport_vehicle_no || '—'} · Arrival: ${row.driver_arrival_time || '—'}`
                        : 'No driver / vehicle assigned yet.'}
                    </div>
                    {row.lock_reason === 'driver_started_day' ? (
                      <div className="pilot-assignment-transport-hint-pilotsassign">
                        Driver started the day in the transport app — transport cannot be changed.
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="pilot-assignment-transport-list-arrange-btn-pilotsassign"
                    onClick={() => openTransportDetail(row)}
                  >
                    {row.editable_transport ? 'Arrange' : 'View'}
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="pilot-assignment-transport-list-section-pilotsassign">
            <div className="pilot-assignment-transport-subtitle-pilotsassign">Tomorrow</div>
            {transportArrangementTomorrow.length === 0 ? (
              <div className="pilot-assignment-teams-empty-pilotsassign">No assignments for tomorrow.</div>
            ) : (
              transportArrangementTomorrow.map((row) => (
                <div key={row.assignment_id} className="pilot-assignment-transport-list-card-pilotsassign">
                  <div className="pilot-assignment-transport-list-card-main-pilotsassign">
                    <div>
                      <strong>{row.team_name}</strong>
                      <span className="pilot-assignment-transport-list-meta-pilotsassign"> · {row.pilot_names}</span>
                    </div>
                    <div className="pilot-assignment-transport-list-estates-pilotsassign">{row.estate_summary}</div>
                    <div className="pilot-assignment-transport-list-current-pilotsassign">
                      {row.driver_id
                        ? `Driver: ${row.transport_driver_name || row.driver_id} · Vehicle: ${row.transport_vehicle_no || '—'} · Arrival: ${row.driver_arrival_time || '—'}`
                        : 'No driver / vehicle assigned yet.'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="pilot-assignment-transport-list-arrange-btn-pilotsassign"
                    onClick={() => openTransportDetail(row)}
                  >
                    {row.editable_transport ? 'Arrange' : 'View'}
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : null}

      {hasArrangeTransportFeature && showDetailModal && (
        <div className="pilot-assignment-teams-modal-overlay-pilotsassign" onClick={closeDetailModal}>
          <div className="pilot-assignment-transport-modal-pilotsassign" onClick={(e) => e.stopPropagation()}>
            <div className="pilot-assignment-teams-modal-header-pilotsassign">
              <span className="pilot-assignment-transport-back-spacer-pilotsassign" />
              <h2 className="pilot-assignment-teams-modal-title-pilotsassign">Driver &amp; vehicle</h2>
              <button type="button" className="pilot-assignment-teams-modal-close-pilotsassign" onClick={closeDetailModal}>
                ×
              </button>
            </div>

            <div className="pilot-assignment-transport-body-pilotsassign">
              {loadingTransportOptions ? (
                <div className="pilot-assignment-teams-loading-pilotsassign">
                  <Bars height="32" width="32" color="#003057" ariaLabel="bars-loading" visible />
                  <span>Loading transport options...</span>
                </div>
              ) : (
                <>
                  <div className="pilot-assignment-transport-list-meta-pilotsassign" style={{ marginBottom: '10px' }}>
                    <strong>{transportDetailAssignmentId}</strong>
                  </div>
                  {!transportEditable ? (
                    <div className="pilot-assignment-transport-hint-pilotsassign" style={{ marginBottom: '12px' }}>
                      View only: this assignment cannot be edited (driver started the day in the transport app, or date is outside
                      today/tomorrow).
                    </div>
                  ) : null}
                  <div className="pilot-assignment-transport-grid-pilotsassign">
                    {!transportDrivers.length && !loadingTransportOptions ? (
                      <div className="pilot-assignment-transport-hint-pilotsassign" style={{ gridColumn: '1 / -1' }}>
                        No drivers with a linked vehicle are available. Link each driver to a vehicle in fleet / transport settings
                        first.
                      </div>
                    ) : null}
                    <div className="pilot-assignment-transport-field-pilotsassign">
                      <label>Driver (Monthly KM)</label>
                      <select
                        className="pilot-assignment-pilot-select-pilotsassign"
                        value={transportForm.driver_id}
                        onChange={(e) => updateTransportField('driver_id', e.target.value)}
                        disabled={!transportEditable}
                      >
                        <option value="">-- Select Driver --</option>
                        {transportDrivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.driver_name} ({Number(driver.month_km || 0).toFixed(1)} km)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pilot-assignment-transport-field-pilotsassign">
                      <label>Vehicle (from driver)</label>
                      <input
                        type="text"
                        className="pilot-assignment-pilot-select-pilotsassign"
                        readOnly
                        value={transportForm.driver_id ? (selectedVehicleDisplay || '—') : '—'}
                        title="Vehicle is assigned to the selected driver in the fleet"
                      />
                    </div>

                    <div className="pilot-assignment-transport-field-pilotsassign">
                      <label>Driver Arrival Time</label>
                      <input
                        type="time"
                        className="pilot-assignment-date-input-pilotsassign"
                        value={transportForm.driver_arrival_time}
                        onChange={(e) => updateTransportField('driver_arrival_time', e.target.value)}
                        disabled={!transportEditable}
                      />
                    </div>
                  </div>

                  {recommendedDriverId && transportEditable ? (
                    <div className="pilot-assignment-transport-hint-pilotsassign">
                      Recommended fairness driver:{' '}
                      {transportDrivers.find((driver) => String(driver.id) === recommendedDriverId)?.driver_name || '-'} (lowest
                      monthly KM)
                    </div>
                  ) : null}

                  <div className="pilot-assignment-transport-estates-pilotsassign">
                    <div className="pilot-assignment-transport-subtitle-pilotsassign">Assignment Estates</div>
                    {(transportEstates || []).length ? (
                      <ul className="pilot-assignment-transport-estate-list-pilotsassign">
                        {transportEstates.map((estate) => (
                          <li key={estate.id}>{estate.estate_name || estate.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>No estates found for this assignment.</span>
                    )}
                  </div>

                  <div className="pilot-assignment-transport-actions-pilotsassign">
                    <button
                      type="button"
                      className="pilot-assignment-teams-btn-pilotsassign"
                      onClick={onEstimateTransport}
                      disabled={estimatingTransport || !transportForm.driver_id || !transportEditable}
                    >
                      {estimatingTransport ? 'Estimating...' : 'Estimate Distance'}
                    </button>
                    <button
                      type="button"
                      className="pilot-assignment-deploy-btn-pilotsassign"
                      onClick={onSaveTransport}
                      disabled={savingTransport || !hasTransportEstates || !transportEditable}
                    >
                      {savingTransport ? 'Saving...' : 'Save Driver & Vehicle'}
                    </button>
                  </div>

                  {transportEstimate ? (
                    <div className="pilot-assignment-transport-result-pilotsassign">
                      <div>
                        <strong>Total Estimated KM:</strong> {Number(transportEstimate.total_estimated_km || 0).toFixed(3)}
                      </div>
                      <div className="pilot-assignment-transport-subtitle-pilotsassign">Leg Breakdown</div>
                      <ul className="pilot-assignment-transport-estate-list-pilotsassign">
                        {(transportEstimate.leg_breakdown || []).map((leg) => (
                          <li key={leg.leg_no}>
                            {leg.from} -&gt; {leg.to}: {Number(leg.distance_km || 0).toFixed(3)} km
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportArrangePage;
