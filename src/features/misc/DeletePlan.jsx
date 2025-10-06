import React, { useState, useEffect } from 'react';
import '../../styles/deleteplan.css';
import { getPlansUsingDate, deletePlan } from '../../api/api';
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

const DeletePlan = () => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [selectedDate, setSelectedDate] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDateChange = async (date) => {
    setSelectedMission(null);
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
          estateId: Number(plan.estate_id)
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
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await deletePlan(selectedMission.id);
      
      if (response?.status === 'true') {
        // Refresh the plans list
        if (selectedDate) handleDateChange(selectedDate);
        alert('Plan deleted successfully!');
        window.location.reload();
      } else {
        alert(response?.message || 'Failed to delete plan');
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert('An error occurred while deleting the plan');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setSelectedMission(null);
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
        <div className="submit-resources">
          <button
            onClick={() => {
              if (!selectedMission) {
                alert("Please select a mission to delete");
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
              "Delete Plan"
            )}
          </button>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>⚠️ ⚠️ ⚠️ WARNING ⚠️ ⚠️ ⚠️</h3>
            <p>Deleting This Plan is Permanent and Cannot be Undone. It will Remove All Relevant Data According to That Plan. Do You Want to Proceed?</p>
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
            <h3>Confirm Deletion</h3>
            <p>Are you absolutely sure you want to delete this plan?</p>
            <div className="modal-actions">
              <button 
                className="confirm-button" 
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Confirm'}
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

export default DeletePlan;