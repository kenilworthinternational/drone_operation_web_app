import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import {
  useGetDroneUnlockingQueueQuery,
  useUpdatePlanDroneUnlockMutation,
  useUpdateMissionDroneUnlockMutation,
} from '../../../api/services NodeJs/pilotAssignmentApi';
import '../../../styles/droneUnlockingQueue.css';

const DroneUnlockingQueue = () => {
  const navigate = useNavigate();
  const { data: queueData, isLoading: loading, error: queryError, refetch } = useGetDroneUnlockingQueueQuery();
  const [updatePlanUnlock, { isLoading: updatingPlan }] = useUpdatePlanDroneUnlockMutation();
  const [updateMissionUnlock, { isLoading: updatingMission }] = useUpdateMissionDroneUnlockMutation();
  const [error, setError] = useState('');

  // Extract plans and missions from response
  const plans = queueData?.data?.plans || [];
  const missions = queueData?.data?.missions || [];
  const allItems = [...plans, ...missions];
  
  // Calculate enabled items (meeting requirements)
  const enabledPlans = plans.filter(plan => plan.isEnabled);
  const enabledMissions = missions.filter(mission => mission.isEnabled);
  const enabledTotal = enabledPlans.length + enabledMissions.length;

  useEffect(() => {
    if (queryError) {
      setError('Failed to load drone unlocking queue');
    } else {
      setError('');
    }
  }, [queryError]);

  const handleToggleLock = async (item) => {
    try {
      const isUnlocked = item.drone_unlock === 1;
      const newStatus = !isUnlocked;

      if (item.type === 'plan') {
        await updatePlanUnlock({
          planId: item.id,
          unlockStatus: newStatus,
        }).unwrap();
      } else {
        await updateMissionUnlock({
          missionId: item.id,
          unlockStatus: newStatus,
        }).unwrap();
      }

      toast.success(`Drone ${newStatus ? 'unlocked' : 'locked'} successfully`);
      refetch();
    } catch (error) {
      console.error('Error toggling lock:', error);
      
      // Extract error message from response
      const errorMessage = error?.data?.message || 
                          error?.data?.error || 
                          error?.message || 
                          `Failed to ${item.drone_unlock === 1 ? 'lock' : 'unlock'} drone`;
      
      // Show specific error message
      if (errorMessage.includes('pre-check list') || errorMessage.includes('Pilot must complete')) {
        toast.error(errorMessage, {
          autoClose: 5000, // Show for 5 seconds
          style: { 
            backgroundColor: '#ff6b6b',
            color: '#fff',
            fontSize: '14px'
          }
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="drone-unlocking-queue-container-unlockqueue">
      <div className="drone-unlocking-queue-header-unlockqueue">
        <button
          className="back-btn-drone-unlocking-unlockqueue"
          onClick={() => navigate('/home/workflowDashboard')}
        >
          ←
        </button>
        <h1>Pending Drone Unlocking Queue</h1>
        <div className="queue-info-drone-unlocking-unlockqueue">
          <span>Plans: {enabledPlans.length}/{plans.length}</span>
          <span>Missions: {enabledMissions.length}/{missions.length}</span>
          <span>Total: {enabledTotal}/{allItems.length}</span>
        </div>
      </div>

      <div className="drone-unlocking-queue-content-unlockqueue">
        {loading ? (
          <div className="loading-container-drone-unlocking-unlockqueue">
            <Bars
              height="50"
              width="50"
              color="#004B71"
              ariaLabel="loading"
            />
            <p>Loading queue...</p>
          </div>
        ) : error ? (
          <div className="error-container-drone-unlocking-unlockqueue">
            <p>{error}</p>
          </div>
        ) : allItems.length === 0 ? (
          <div className="empty-container-drone-unlocking-unlockqueue">
            <p>No plans or missions for today.</p>
          </div>
        ) : (
          <div className="items-table-wrapper-unlockqueue">
            <table className="items-table-unlockqueue">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allItems.map((item) => {
                  const isUnlocked = item.drone_unlock === 1;
                  const isUpdating = updatingPlan || updatingMission;
                  const preCheckCompleted = item.pre_check_list === 1;
                  // Disable unlock button if: not enabled, updating, or trying to unlock without pre-check
                  const buttonDisabled = !item.isEnabled || isUpdating || (!isUnlocked && !preCheckCompleted);

                  return (
                    <tr key={`${item.type}-${item.id}`} className="table-row-unlockqueue">
                      <td className="table-cell-id-unlockqueue">
                        {item.type === 'plan' ? `Plan #${item.id}` : `Mission #${item.id}`}
                      </td>
                      <td className="table-cell-type-unlockqueue">
                        <span className={`type-badge-unlockqueue ${item.type}`}>
                          {item.type === 'plan' ? 'Plan' : 'Mission'}
                        </span>
                      </td>
                      <td className="table-cell-name-unlockqueue">
                        {item.type === 'plan' 
                          ? (item.estate_name || 'N/A')
                          : (item.farmer_name || 'N/A')
                        }
                      </td>
                      <td className="table-cell-status-unlockqueue">
                        {item.type === 'plan' ? (
                          <div className="status-details-unlockqueue">
                            <span className={`status-badge-small-unlockqueue ${item.manager_approval === 1 ? 'approved' : 'pending'}`}>
                              {item.manager_approval === 1 ? 'Approved' : 'Pending'}
                            </span>
                            <span className={`status-badge-small-unlockqueue ${item.team_assigned === 1 ? 'assigned' : 'not-assigned'}`}>
                              {item.team_assigned === 1 ? 'Assigned' : 'Not Assigned'}
                            </span>
                            <span className={`status-badge-small-unlockqueue ${item.pre_check_list === 1 ? 'pre-check-complete' : 'pre-check-pending'}`}>
                              {item.pre_check_list === 1 ? 'Pre Check' : 'No Pre Check'}
                            </span>
                          </div>
                        ) : (
                          <div className="status-details-unlockqueue">
                            <span className={`status-badge-small-unlockqueue ${item.payments === 1 ? 'paid' : 'pending'}`}>
                              {item.payments === 1 ? 'Paid' : 'Pending'}
                            </span>
                            <span className={`status-badge-small-unlockqueue ${item.team_assigned === 1 ? 'assigned' : 'not-assigned'}`}>
                              {item.team_assigned === 1 ? 'Assigned' : 'Not Assigned'}
                            </span>
                            <span className={`status-badge-small-unlockqueue ${item.pre_check_list === 1 ? 'pre-check-complete' : 'pre-check-pending'}`}>
                              {item.pre_check_list === 1 ? 'Pre Check' : 'No Pre Check'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="table-cell-current-status-unlockqueue">
                        <span className={`status-badge-drone-unlocking-unlockqueue ${isUnlocked ? 'unlocked' : 'locked'}`}>
                          {isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </td>
                      <td className="table-cell-action-unlockqueue">
                        <button
                          className={`lock-unlock-btn-unlockqueue ${isUnlocked ? 'unlocked' : 'locked'} ${buttonDisabled ? 'disabled' : ''}`}
                          onClick={() => handleToggleLock(item)}
                          disabled={buttonDisabled}
                          title={
                            !item.isEnabled 
                              ? 'Requirements not met (Manager approval/Team assignment or Payment/Team assignment)'
                              : !preCheckCompleted && !isUnlocked
                                ? 'Cannot unlock: Pilot must complete pre-check list first'
                              : isUnlocked 
                                ? 'Click to lock the drone'
                                : 'Click to unlock the drone'
                          }
                        >
                          {isUnlocked ? '🔓 Lock' : '🔒 Unlock'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DroneUnlockingQueue;

