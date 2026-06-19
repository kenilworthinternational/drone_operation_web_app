import React, { useMemo } from 'react';
import { Bars } from 'react-loader-spinner';
import { buildVehicleDisplayFromDriver } from '../../../utils/transportAssignment';
import { formatVehicleOwnershipFromRecord } from '../../../utils/vehicleOwnership';

/**
 * Shared driver / vehicle / arrival fields for resource assignment and arrange-transport modal.
 */
export default function TransportAssignmentFields({
  assignmentIdLabel = null,
  editable = true,
  loading = false,
  transportOptions = null,
  form,
  onFieldChange,
  transportEstimate = null,
  estimatingTransport = false,
  onEstimate,
  showSaveButton = false,
  savingTransport = false,
  onSave,
  saveLabel = 'Save Driver & Vehicle',
  showEstimateButton = false,
  viewOnlyHint = null,
  poolVehiclesOnly = false,
}) {
  const transportDrivers = transportOptions?.drivers || [];
  const transportEstates = transportOptions?.estates || [];
  const hasTransportEstates = transportEstates.length > 0;

  const recommendedDriverId = useMemo(() => {
    if (!transportOptions?.recommended_driver_id) return '';
    return String(transportOptions.recommended_driver_id);
  }, [transportOptions]);

  const selectedVehicleDisplay = useMemo(
    () =>
      buildVehicleDisplayFromDriver(
        transportDrivers.find((d) => String(d.id) === String(form?.driver_id))
      ),
    [form?.driver_id, transportDrivers]
  );

  if (loading) {
    return (
      <div className="pilot-assignment-teams-loading-pilotsassign">
        <Bars height="32" width="32" color="#003057" ariaLabel="bars-loading" visible />
        <span>Loading transport options...</span>
      </div>
    );
  }

  return (
    <>
      {assignmentIdLabel ? (
        <div className="pilot-assignment-transport-list-meta-pilotsassign" style={{ marginBottom: '10px' }}>
          <strong>{assignmentIdLabel}</strong>
        </div>
      ) : null}
      {viewOnlyHint ? (
        <div className="pilot-assignment-transport-hint-pilotsassign" style={{ marginBottom: '12px' }}>
          {viewOnlyHint}
        </div>
      ) : null}
      {poolVehiclesOnly && editable ? (
        <div className="pilot-assignment-transport-hint-pilotsassign" style={{ marginBottom: '12px' }}>
          Only pool vehicles are listed. Ownership label (KWIL / Rented) is shown for each option.
        </div>
      ) : null}
      <div className="pilot-assignment-transport-grid-pilotsassign">
        {!transportDrivers.length ? (
          <div className="pilot-assignment-transport-hint-pilotsassign" style={{ gridColumn: '1 / -1' }}>
            {poolVehiclesOnly
              ? 'No drivers with a linked pool vehicle are available. Link each driver to a pool vehicle in fleet settings first.'
              : 'No drivers with a linked vehicle are available. Link each driver to a vehicle in fleet / transport settings first.'}
          </div>
        ) : null}
        <div className="pilot-assignment-transport-field-pilotsassign">
          <label>Driver (Monthly KM)</label>
          <select
            className="pilot-assignment-pilot-select-pilotsassign"
            value={form.driver_id}
            onChange={(e) => onFieldChange('driver_id', e.target.value)}
            disabled={!editable}
          >
            <option value="">-- Select Driver --</option>
            {transportDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.driver_name} ({Number(driver.month_km || 0).toFixed(1)} km) ·{' '}
                {formatVehicleOwnershipFromRecord(driver)}
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
            value={form.driver_id ? selectedVehicleDisplay || '—' : '—'}
            title="Vehicle is assigned to the selected driver in the fleet"
          />
        </div>
        <div className="pilot-assignment-transport-field-pilotsassign">
          <label>Driver Arrival Time</label>
          <input
            type="time"
            className="pilot-assignment-date-input-pilotsassign"
            value={form.driver_arrival_time}
            onChange={(e) => onFieldChange('driver_arrival_time', e.target.value)}
            disabled={!editable}
          />
        </div>
      </div>
      {recommendedDriverId && editable ? (
        <div className="pilot-assignment-transport-hint-pilotsassign">
          Recommended fairness driver:{' '}
          {transportDrivers.find((driver) => String(driver.id) === recommendedDriverId)?.driver_name || '-'} (lowest
          monthly KM)
        </div>
      ) : null}
      <div className="pilot-assignment-transport-estates-pilotsassign">
        <div className="pilot-assignment-transport-subtitle-pilotsassign">Assignment Estates</div>
        {transportEstates.length ? (
          <ul className="pilot-assignment-transport-estate-list-pilotsassign">
            {transportEstates.map((estate) => (
              <li key={estate.id}>{estate.estate_name || estate.name}</li>
            ))}
          </ul>
        ) : (
          <span>Select at least one plantation plan to load estates.</span>
        )}
      </div>
      {(showEstimateButton || showSaveButton) && (
        <div className="pilot-assignment-transport-actions-pilotsassign">
          {showEstimateButton && onEstimate ? (
            <button
              type="button"
              className="pilot-assignment-teams-btn-pilotsassign"
              onClick={onEstimate}
              disabled={estimatingTransport || !form.driver_id || !editable}
            >
              {estimatingTransport ? 'Estimating...' : 'Estimate Distance'}
            </button>
          ) : null}
          {showSaveButton && onSave ? (
            <button
              type="button"
              className="pilot-assignment-deploy-btn-pilotsassign"
              onClick={onSave}
              disabled={savingTransport || !hasTransportEstates || !editable}
            >
              {savingTransport ? 'Saving...' : saveLabel}
            </button>
          ) : null}
        </div>
      )}
      {showEstimateButton && transportEstimate ? (
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
  );
}
