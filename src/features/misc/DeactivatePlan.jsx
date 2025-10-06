import React, { useState, useEffect } from 'react';
import '../../styles/deactivateplan.css';
import { getPlansUsingDate, deactivatePlan } from '../../api/api';
import DatePicker from 'react-datepicker';
import CustomDropdown from '../../components/CustomDropdown';
import { Bars } from 'react-loader-spinner';
import { FaCalendarAlt } from "react-icons/fa";

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="date-picker-input" />
    <FaCalendarAlt className="calendar-icon" />
  </div>
));

const DeactivatePlan = () => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [selectedDate, setSelectedDate] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleDateChange = async (date) => {
    setSelectedMission(null);
    setSelectedStatus(null); // <-- Add this line to clear status on date change
    setMissions(null);
    try {
      setSelectedDate(date);
      if (!date) return;

      const formattedDate = date.toLocaleDateString('en-CA');
      const response = await getPlansUsingDate(formattedDate);

      if (response?.status === "true" && Object.keys(response).length > 2) {
        const missionArray = Object.keys(response)
          .filter(key => !isNaN(key))
          .map(key => response[key]);

        const missionOptions = missionArray.map(plan => ({
          id: plan.id,
          group: `${plan.estate} - ${plan.area} Ha`,
          estateId: Number(plan.estate_id),
          activated: plan.activated // <-- Add this line
        }));

        setMissions(missionOptions);
      } else {
        setMissions([]);
      }
    } catch (error) {
      console.error("Error in handleDateChange:", error);
      setMissions([]);
    }
  };

  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
    setSelectedStatus(mission.activated);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status.id);
  };

  const handleActivateDeactivate = async () => {
    setIsSubmitting(true);
    try {
      const response = await deactivatePlan(selectedMission.id, selectedStatus);
      
      if (response?.status === 'true') {
        if (selectedDate) handleDateChange(selectedDate);
        alert('Plan status updated successfully!');
      } else {
        alert(response?.message || 'Failed to update plan status');
      }
    } catch (error) {
      console.error("Update error:", error);
      alert('An error occurred while updating the plan status');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setSelectedMission(null);
      setSelectedStatus(null);
    }
  };

  return (
    <div className="delete-plan">
      <div className="text-area-delete">
        <div className="date-area-delete">
          <label htmlFor="date-name-delete">Plan Date : </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy/MM/dd"
            placeholderText="Select a date"
            customInput={<CustomDateInput />}
          />
        </div>
        <div className="mission-select-delete">
          <label htmlFor="mission-select-name-delete">Select Mission</label>
          <CustomDropdown
            options={missions || []}
            onSelect={handleMissionSelect}
            selectedValue={selectedMission}
          />
        </div>
        {/* Show current status of selected mission */}
        <div style={{ marginBottom: '10px', fontWeight: 'bold', minHeight: '24px' }}>
          {selectedMission
            ? `Current Status: ${selectedMission.activated === 1 ? 'Active' : 'Inactive'}`
            : 'Current Status: —'}
        </div>
        <div className="status-select-delete">
          <label htmlFor="status-select-name-delete">Select Status</label>
          <CustomDropdown
            options={[
              { id: 1, group: 'Active' },
              { id: 0, group: 'Inactive' }
            ]}
            onSelect={handleStatusChange}
            selectedValue={
              selectedStatus !== null 
                ? { 
                    id: selectedStatus, 
                    group: selectedStatus === 1 ? 'Active' : 'Inactive' 
                  } 
                : null
            }
            disabled={!selectedMission}
          />
        </div>
        <div className="submit-resources">
          <button
            onClick={() => {
              if (!selectedMission) {
                alert("Please select a mission to update");
                return;
              }
              setShowWarning(true);
            }}
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="loader-container">
                <Bars
                  height="20"
                  width="50"
                  color="#ffffff"
                  ariaLabel="bars-loading"
                  visible={true}
                />
              </div>
            ) : (
              "Update Status"
            )}
          </button>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>⚠️ ⚠️ ⚠️ WARNING ⚠️ ⚠️ ⚠️</h3>
            <p>Changing plan status will affect relevant mission processing.</p>
            <div className="modal-actions">
              <button 
                className="confirm-button" 
                onClick={() => {
                  setShowWarning(false);
                  setShowConfirmation(true);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm Status Change</h3>
            <p>Are you absolutely sure you want to change the status of this plan?</p>
            <div className="modal-actions">
              <button 
                className="confirm-button" 
                onClick={handleActivateDeactivate}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Confirm'}
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeactivatePlan;