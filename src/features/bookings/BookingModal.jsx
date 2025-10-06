import React from 'react';
import { FaTimes } from 'react-icons/fa';

const BookingModal = ({ isOpen, onClose, booking, mode, editableData, setEditableData, onUpdate, updating, sectorOptions, cropOptions, missionOptions, timeOptions, chemicalOptions, brokerOptions }) => {
  if (!isOpen || !booking) return null;

  const renderEditableField = (
    displayField,
    editField,
    label,
    isDropdown = false,
    options = [],
    isCheckbox = false
  ) => {
    const safeOptions = Array.isArray(options) ? options : [];

    if (mode === 'edit') {
      return (
        <div className="edit-field-group">
          {isDropdown ? (
            <select
              value={editableData[editField]}
              onChange={(e) => setEditableData(prev => ({ ...prev, [editField]: e.target.value }))}
              className="edit-input"
            >
              <option value="">Select {label}</option>
              {safeOptions.map(option => {
                let labelText;
                switch (editField) {
                  case 'sector_id': labelText = option.sector; break;
                  case 'crop_type': labelText = option.crop; break;
                  case 'mission_type': labelText = option.mission_type_name; break;
                  case 'chemical_id': labelText = option.chemical; break;
                  case 'pick_time': labelText = option.time_of_day; break;
                  case 'broker_id': labelText = `${option.name} - ${option.nic}-${option.broker_code}`; break;
                  default: labelText = '';
                }
                return (
                  <option key={option.id} value={option.id}>
                    {labelText}
                  </option>
                );
              })}
            </select>
          ) : isCheckbox ? (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editableData[editField]}
                onChange={(e) =>
                  setEditableData(prev => ({ ...prev, [editField]: e.target.checked }))
                }
              />
              {label}
            </label>
          ) : (
            <input
              type="text"
              value={editableData[editField] || ''}
              onChange={(e) => setEditableData(prev => ({ ...prev, [editField]: e.target.value }))}
              className="edit-input"
              placeholder={label}
            />
          )}
        </div>
      );
    }

    let displayValue = booking[displayField];
    if (displayField === 'chemical_provided') {
      displayValue = displayValue === 1 ? 'Yes' : 'No';
    } else if (displayField === 'broker_name') {
      displayValue = booking.broker_name ? `${booking.broker_name} - ${booking.broker_code}` : 'No broker assigned';
    }
    return <span className="field-value">{displayValue}</span>;
  };

  return (
    <div className="modal-overlay-bookinglist" onClick={onClose}>
      <div className="modal-content-bookinglist" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'edit' ? 'Edit Booking' : 'Booking Details'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="info-grid">
              <div className="info-item-bookinglist">
                <label>Booking ID:</label>
                <span>#{booking.missionId}</span>
              </div>
              <div className="info-item-bookinglist">
                <label>Farmer Name:</label>
                <span>{booking.farmerName}</span>
              </div>
              <div className="info-item-bookinglist">
                <label>NIC:</label>
                <span>{booking.nic}</span>
              </div>
              <div className="info-item-bookinglist">
                <label>Mobile:</label>
                <span>{booking.mobile}</span>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="section-title">Mission Details</h3>
            <div className="info-grid">
              <div className="info-item-bookinglist">
                <label>Crop Type:</label>
                {renderEditableField('cropName', 'crop_type', 'Crop Name', true, cropOptions)}
              </div>
              <div className="info-item-bookinglist">
                <label>Land Extent:</label>
                {renderEditableField('landExtent', 'land_extent', 'Land Extent')}
              </div>
              <div className="info-item-bookinglist">
                <label>Mission Type:</label>
                {renderEditableField('missionType', 'mission_type', 'Mission Type', true,
                  missionOptions.map(m => ({
                    id: m.mission_type_code,
                    mission_type_name: m.mission_type_name
                  }))
                )}
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="section-title">Chemical & Timing</h3>
            <div className="info-grid">
              <div className="info-item-bookinglist">
                <label>Agrochemical:</label>
                {renderEditableField(
                  'agrochemical',
                  'chemical_id',
                  'Agrochemical',
                  true,
                  chemicalOptions
                )}
              </div>
              <div className="info-item-bookinglist">
                <label>Units Needed:</label>
                {renderEditableField('neededUnits', 'units', 'Needed Units')}
              </div>
              <div className="info-item-bookinglist">
                <label>Pick Time:</label>
                {renderEditableField(
                  'pickTimeText',
                  'pick_time',
                  'Pick Time',
                  true,
                  timeOptions
                )}
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="section-title">Location & Broker</h3>
            <div className="info-grid special-layout">
              <div className="info-item-bookinglist land-address-item">
                <label>Land Address:</label>
                {renderEditableField('landAddress', 'land_address', 'Land Address')}
              </div>
              <div className="info-item-bookinglist">
                <label>Needed Water:</label>
                {renderEditableField('needed_water', 'needed_water', 'Needed Water')}
              </div>
              <div className="info-item-bookinglist broker-item">
                <label>Broker:</label>
                {renderEditableField(
                  'broker_name', 
                  'broker_id', 
                  'Broker', 
                  true, 
                  brokerOptions
                )}
              </div>
            </div>
          </div>
          <div className="info-item-bookinglist chemical-provided-item">
              <label>Chemical Provided:</label>
              {renderEditableField(
                'chemical_provided',
                'chemical_provided',
                'Chemical Provided',
                false,
                [],
                true
              )}
            </div>
          <div className="modal-section">
            <h3 className="section-title">Planning</h3>
            <div className="info-grid special-layout">
              <div className="info-item-bookinglist">
                <label>Requested Date:</label>
                <span>{booking.date}</span>
              </div>
              <div className="info-item-bookinglist">
                <label>Planned Date:</label>
                <span>{booking.pickedDate || 'Not set'}</span>
              </div>
            </div>
            
          </div>
        </div>

        <div className="modal-footer">
          {mode === 'edit' && (
            <button
              className="modal-btn primary"
              onClick={() => onUpdate(booking.missionId)}
              disabled={updating}
            >
              Save Changes
            </button>
          )}
          <button className="modal-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
