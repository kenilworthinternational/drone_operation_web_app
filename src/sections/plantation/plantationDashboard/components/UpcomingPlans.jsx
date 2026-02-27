import React from 'react';
import { format } from 'date-fns';
import { useGetUpcomingPlansQuery } from '../../../../api/services NodeJs/plantationDashboardApi';
import { Bars } from 'react-loader-spinner';

const UpcomingPlans = ({ missionType }) => {
  const { data, isLoading, error } = useGetUpcomingPlansQuery({ missionType });

  const plans = data?.data || [];

  // Map mission type to display name
  const getMissionTypeDisplayName = (missionTypeCode) => {
    if (missionTypeCode === 'spy' || missionTypeCode === 1 || missionTypeCode === '1') return 'Spray';
    if (missionTypeCode === 'spd' || missionTypeCode === 2 || missionTypeCode === '2') return 'Spread';
    // Fallback to missionType prop if available
    if (missionType === 'spy') return 'Spray';
    if (missionType === 'spd') return 'Spread';
    return missionTypeCode || 'N/A';
  };

  if (isLoading) {
    return (
      <div className="plantation-upcoming-section">
        <h2 className="plantation-section-title">Upcoming Plans (After Today)</h2>
        <div className="plantation-loading">
          <Bars height="40" width="40" color="#2d8659" />
          <span>Loading upcoming plans...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plantation-upcoming-section">
        <h2 className="plantation-section-title">Upcoming Plans (After Today)</h2>
        <div className="plantation-error">
          Error loading upcoming plans. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="plantation-upcoming-section">
      <h2 className="plantation-section-title">Upcoming Plans (After Today)</h2>
      
      {plans.length === 0 ? (
        <div className="plantation-no-data">
          <p>No upcoming plans found.</p>
        </div>
      ) : (
        <div className="plantation-plans-table-container">
          <table className="plantation-plans-table">
            <thead>
              <tr>
                <th className="plantation-table-header">Date</th>
                <th className="plantation-table-header">Estate</th>
                <th className="plantation-table-header">Mission Type</th>
                <th className="plantation-table-header">Planned Area (Ha)</th>
                <th className="plantation-table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} className="plantation-table-row">
                  <td className="plantation-table-cell">
                    {format(new Date(plan.pickedDate), 'yyyy-MM-dd')}
                  </td>
                  <td className="plantation-table-cell">
                    {plan.estate_name || `Estate ${plan.estateId}`}
                  </td>
                  <td className="plantation-table-cell">
                    {getMissionTypeDisplayName(plan.mission_type_name || missionType)}
                  </td>
                  <td className="plantation-table-cell">
                    {parseFloat(plan.total_planned_area || 0).toFixed(2)}
                  </td>
                  <td className="plantation-table-cell">
                    <span className={`plantation-status-badge ${plan.completed ? 'completed' : 'pending'}`}>
                      {plan.completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UpcomingPlans;
