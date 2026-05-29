import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import Vehicles from './vehicles/Vehicles';
import VehiclesRegistration from './vehicles/VehiclesRegistration';
import '../../styles/transportVehicleManagement.css';

/**
 * Vehicle registry: list/view/edit (Vehicles) and registration (VehiclesRegistration).
 * Used from Transport HR — vehicle list and registration (Administration wing).
 */
export default function VehicleManagement({ onBack, onVehiclesChanged }) {
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (showAddForm) return undefined;
    const root = document.querySelector('.content-dashboard');
    root?.classList.add('content-dashboard--vehicle-mgmt');
    return () => root?.classList.remove('content-dashboard--vehicle-mgmt');
  }, [showAddForm]);

  const closeAddModal = () => setShowAddForm(false);

  return (
    <>
      <div className="vehicle-mgmt-shell">
        <header className="vehicle-mgmt-header vehicle-mgmt-header-row">
          <div className="vehicle-mgmt-header-start">
            {onBack ? (
              <button type="button" className="vehicle-mgmt-back-btn" onClick={onBack}>
                ← T. O. D.
              </button>
            ) : null}
          </div>
          <div className="vehicle-mgmt-intro">
            <h3 className="vehicle-mgmt-title">Vehicle Management</h3>
            <p className="vehicle-mgmt-hint">
              Click a vehicle row to open its profile. Use filters to find KWIL or rented vehicles.
            </p>
          </div>
          <div className="vehicle-mgmt-header-end">
            <button
              type="button"
              className="vehicle-mgmt-add-btn"
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
            >
              <FaPlus aria-hidden />
              <span>Add</span>
            </button>
          </div>
        </header>
        <div className="vehicle-mgmt-body">
          <Vehicles embeddedInVehicleManagement />
        </div>
      </div>

      {showAddForm ? (
        <div
          className="vehicle-register-modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
        >
          <div
            className="vehicle-register-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-register-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vehicle-register-modal-header">
              <h3 id="vehicle-register-modal-title">Register new vehicle</h3>
              <button
                type="button"
                className="vehicle-register-modal-close"
                onClick={closeAddModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="vehicle-register-modal-body">
              <VehiclesRegistration
                profileLayout
                compactHeader
                onVehicleRegisteredSuccess={() => {
                  onVehiclesChanged?.();
                  closeAddModal();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
