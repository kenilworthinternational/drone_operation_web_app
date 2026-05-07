import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/deactivateplan.css';
import DatePicker from 'react-datepicker';
import CustomDropdown from '../../components/CustomDropdown';
import { Bars } from 'react-loader-spinner';
import { FaCalendarAlt } from "react-icons/fa";
import {
  useLazyGetPlanStatusByDateQuery,
  useUpdatePlanStatusNodeMutation,
} from '../../api/services NodeJs/planStatusApi';
import { useGetDeactivateReasonsQuery } from '../../api/services NodeJs/reasonsApi';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="date-picker-input" />
    <FaCalendarAlt className="calendar-icon" />
  </div>
));

const DeactivatePlan = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [selectedDeactivateReason, setSelectedDeactivateReason] = useState(null);
  const [updatingPlanId, setUpdatingPlanId] = useState(null);

  const [loadPlansByDate, { data: plans = [], isFetching: loadingPlans }] = useLazyGetPlanStatusByDateQuery();
  const [updatePlanStatusNode] = useUpdatePlanStatusNodeMutation();
  const { data: deactivateReasons = [] } = useGetDeactivateReasonsQuery({ include_inactive: false });

  const deactivateReasonOptions = useMemo(
    () =>
      (deactivateReasons || [])
        .filter((row) => Number(row.id) !== 1)
        .map((row) => ({ id: row.id, group: row.reason })),
    [deactivateReasons]
  );

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-CA');
    loadPlansByDate({ date: formattedDate });
  }, [loadPlansByDate]);

  const summary = useMemo(() => {
    const list = plans || [];
    const active = list.filter((p) => Number(p.activated) === 1).length;
    const inactive = list.length - active;
    return { total: list.length, active, inactive };
  }, [plans]);

  const handleDateChange = async (date) => {
    setShowReasonPopup(false);
    setPendingPlan(null);
    setSelectedDeactivateReason(null);
    setSelectedDate(date);
    try {
      if (!date) return;
      const formattedDate = date.toLocaleDateString('en-CA');
      await loadPlansByDate({ date: formattedDate }).unwrap();
    } catch (error) {
      console.error("Error in handleDateChange:", error);
      alert(error?.data?.message || error?.message || 'Failed to load plans');
    }
  };

  const refreshCurrentDate = async () => {
    if (!selectedDate) return;
    const formattedDate = selectedDate.toLocaleDateString('en-CA');
    await loadPlansByDate({ date: formattedDate });
  };

  const handleActivatePlan = async (plan) => {
    setUpdatingPlanId(plan.id);
    try {
      await updatePlanStatusNode({ plan_id: plan.id, activated: 1 }).unwrap();
      await refreshCurrentDate();
    } catch (error) {
      alert(error?.data?.message || error?.message || 'Failed to activate plan');
    } finally {
      setUpdatingPlanId(null);
    }
  };

  const askDeactivateReason = (plan) => {
    setPendingPlan(plan);
    setSelectedDeactivateReason(
      plan?.deactivate_reason_id
        ? { id: plan.deactivate_reason_id, group: plan.deactivate_reason || 'Selected reason' }
        : null
    );
    setShowReasonPopup(true);
  };

  const confirmDeactivatePlan = async () => {
    if (!pendingPlan) return;
    if (!selectedDeactivateReason?.id) {
      alert('Please select a deactivate reason');
      return;
    }
    setUpdatingPlanId(pendingPlan.id);
    try {
      await updatePlanStatusNode({
        plan_id: pendingPlan.id,
        activated: 0,
        deactivate_reason_id: selectedDeactivateReason.id,
      }).unwrap();
      setShowReasonPopup(false);
      setPendingPlan(null);
      setSelectedDeactivateReason(null);
      await refreshCurrentDate();
    } catch (error) {
      alert(error?.data?.message || error?.message || 'Failed to deactivate plan');
    } finally {
      setUpdatingPlanId(null);
    }
  };

  return (
    <div className="delete-plan">
      <div className="deactivate-shell">
        <div className="deactivate-header">
          <div>
            <h2>Deactivate Plan Management</h2>
            <p>Choose a date, review plans, and toggle active/inactive status with reason tracking.</p>
          </div>
          <div className="deactivate-date-card">
            <label htmlFor="date-name-delete">Plan Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy/MM/dd"
              placeholderText="Select a date"
              customInput={<CustomDateInput />}
            />
          </div>
        </div>

        <div className="deactivate-summary">
          <div className="deactivate-summary-item">
            <span>Total Plans</span>
            <strong>{summary.total}</strong>
          </div>
          <div className="deactivate-summary-item">
            <span>Active</span>
            <strong>{summary.active}</strong>
          </div>
          <div className="deactivate-summary-item">
            <span>Inactive</span>
            <strong>{summary.inactive}</strong>
          </div>
        </div>

        <div className="deactivate-list-wrap">
          <div className="deactivate-list-title">Plans</div>

          {loadingPlans ? (
            <div className="submit-resources">
              <Bars height="30" width="70" color="#004B71" ariaLabel="bars-loading" visible />
            </div>
          ) : (plans || []).length === 0 ? (
            <div className="deactivate-empty-state">
              <span>No plans found for selected date.</span>
            </div>
          ) : (
            <div className="deactivate-plan-list">
              {(plans || []).map((plan) => {
                const isActive = Number(plan.activated) === 1;
                const isBusy = updatingPlanId === plan.id;
                return (
                  <div key={plan.id} className="deactivate-plan-row">
                    <div className="deactivate-plan-main">
                      <div className="deactivate-plan-line1">
                        <span className="deactivate-plan-id">#{plan.id}</span>
                        <span className="deactivate-plan-name">{plan.estate || '-'} ({plan.area || 0} Ha)</span>
                      </div>
                      <div className="deactivate-plan-line2">
                        <span className={`deactivate-status-chip ${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                        {!isActive ? (
                          <span className="deactivate-plan-reason">Reason: {plan.deactivate_reason || '-'}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="deactivate-toggle-block">
                      <label className="deactivate-switch">
                        <input
                          type="checkbox"
                          checked={isActive}
                          disabled={isBusy}
                          onChange={(e) => {
                            if (e.target.checked) handleActivatePlan(plan);
                            else askDeactivateReason(plan);
                          }}
                        />
                        <span className="deactivate-slider" />
                      </label>
                      <span className="deactivate-toggle-label">{isBusy ? 'Updating...' : (isActive ? 'Active' : 'Inactive')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showReasonPopup && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Deactivate Plan</h3>
            <p>Select a reason before deactivating this plan.</p>
            <div className="deactivate-modal-plan">
              Plan #{pendingPlan?.id} - {pendingPlan?.estate || '-'}
            </div>
            <div style={{ marginTop: 12 }}>
              <CustomDropdown
                options={deactivateReasonOptions}
                onSelect={(option) => setSelectedDeactivateReason(option)}
                selectedValue={selectedDeactivateReason}
              />
            </div>
            <div className="modal-actions">
              <button
                className="confirm-button"
                onClick={confirmDeactivatePlan}
                disabled={updatingPlanId === pendingPlan?.id}
              >
                {updatingPlanId === pendingPlan?.id ? 'Updating...' : 'Deactivate'}
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setShowReasonPopup(false);
                  setPendingPlan(null);
                  setSelectedDeactivateReason(null);
                }}
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