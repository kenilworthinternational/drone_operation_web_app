import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getPlansUsingDate, displayOperators, assignOperator, planOperatorsDateRange } from '../../api/api';
import { Bars } from "react-loader-spinner";
import { FiCheckCircle, FiUser, FiUserX, FiCalendar, FiMapPin, FiPhone, FiDownload } from "react-icons/fi";
import * as XLSX from 'xlsx';
import '../../styles/opsAssign.css';

const OpsAsign = () => {
  const [activeTab, setActiveTab] = useState('assign');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Set default date range: first day of current month to today
  const getFirstDayOfMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  };
  
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(new Date());
  
  const [plans, setPlans] = useState([]);
  const [assignedPlans, setAssignedPlans] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [filterType, setFilterType] = useState('assigned'); // 'assigned' or 'unassigned' or 'all'

  // Operator name filter state
  const [operatorNameFilter, setOperatorNameFilter] = useState('all');

  // Get unique operator names for filter dropdown
  const operatorNameOptions = Array.from(
    new Set(assignedPlans.filter(p => p.operator).map(p => p.operator))
  );

  // Load operators on component mount
  useEffect(() => {
    loadOperators();
    // Trigger default search for assigned plans
    handleDateRangeChange();
    // Automatically load data for today's date
    handleDateChange(new Date());
  }, []);

  // Auto-search when dates change
  useEffect(() => {
    if (activeTab === 'assigned') {
      handleDateRangeChange();
    }
  }, [startDate, endDate, activeTab]);

  // Load assigned plans data when switching to assigned tab for the first time
  useEffect(() => {
    if (activeTab === 'assigned' && assignedPlans.length === 0) {
      handleDateRangeChange();
    }
  }, [activeTab]);

  const loadOperators = async () => {
    try {
      const response = await displayOperators();
      if (response && response.status === 'true') {
        setOperators(response.data || []);
      } else if (Array.isArray(response)) {
        setOperators(response);
      } else {
        setOperators([]);
      }
    } catch (error) {
      console.error('Error loading operators:', error);
      setOperators([]);
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setLoading(true);
    setError(null);
    
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await getPlansUsingDate({ date: formattedDate });
      
      if (response.status === 'true') {
        const plansArray = Object.keys(response)
          .filter(key => key !== 'status' && key !== 'count')
          .map(key => response[key]);
        setPlans(plansArray);
      } else {
        setPlans([]);
      }
    } catch (error) {
      setError('Failed to load plans for the selected date');
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = async () => {
    setAssignedLoading(true);
    setError(null);
    
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const response = await planOperatorsDateRange(formattedStartDate, formattedEndDate);
      
      // Handle different response formats
      if (response && response.status === 'true') {
        // If response has operator property
        if (response.operator) {
          setAssignedPlans(response.operator);
        } 
        // If response is an array directly
        else if (Array.isArray(response)) {
          setAssignedPlans(response);
        }
        // If response is an object with data property
        else if (response.data) {
          setAssignedPlans(response.data);
        }
        // If response is an object but no specific structure, try to find plans
        else {
          const plans = Object.values(response).filter(item => 
            item && typeof item === 'object' && (item.plan_id || item.estate_name)
          );
          setAssignedPlans(plans.length > 0 ? plans : []);
        }
      } else if (Array.isArray(response)) {
        // Direct array response
        setAssignedPlans(response);
      } else {
        setAssignedPlans([]);
      }
    } catch (error) {
      setError('Failed to load assigned plans for the selected date range');
      console.error('Error fetching assigned plans:', error);
      setAssignedPlans([]);
    } finally {
      setAssignedLoading(false);
    }
  };

  const handleOperatorChange = async (planId, operatorId) => {
    try {
      const response = await assignOperator(planId, operatorId);
      
      if (response && response.status === 'true') {
        setSuccessMessage('Operator assigned successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Immediately update the local state to reflect the change
        setPlans(prevPlans => 
          prevPlans.map(plan => 
            plan.id === planId 
              ? { ...plan, operator: operatorId, operator_name: operators.find(op => op.id == operatorId)?.name || '' }
              : plan
          )
        );
      } else {
        setError('Failed to assign operator');
      }
    } catch (error) {
      setError('Failed to assign operator');
      console.error('Error assigning operator:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to download Excel file
  const downloadExcel = () => {
    // Get the filtered plans data
    const filteredPlansData = getFilteredPlans();
    
    // Flatten the filtered data into a single array
    const allFilteredPlans = [];
    Object.entries(filteredPlansData).forEach(([key, operatorData]) => {
      if (operatorData.plans && Array.isArray(operatorData.plans)) {
        allFilteredPlans.push(...operatorData.plans);
      }
    });

    if (allFilteredPlans.length === 0) {
      alert('No data available to export');
      return;
    }

    // Prepare data for Excel export
    const exportData = allFilteredPlans.map(plan => ({
      'Plan ID': plan.plan_id,
      'Planned Date': plan.date ? formatDate(plan.date) : 'N/A',
      'Estate': plan.estate_name,
      'Area (ha)': plan.area,
      'Operator': plan.operator || 'Unassigned',
      'Operator Mobile': plan.mobile || 'N/A',
      'Assigned Time': plan.operator_date_time ? formatDateTime(plan.operator_date_time) : 'N/A',
      'Status': plan.operator_id && plan.operator ? 'Assigned' : 'Unassigned'
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assigned_Plans');

    // Generate filename with date range and filter info
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Add filter information to filename
    const filterInfo = [];
    if (filterType !== 'all') {
      filterInfo.push(filterType);
    }
    if (operatorNameFilter !== 'all') {
      filterInfo.push(operatorNameFilter.replace(/\s+/g, '_'));
    }
    const filterSuffix = filterInfo.length > 0 ? `_${filterInfo.join('_')}` : '';
    
    const fileName = `Assigned_Plans_${formatDate(startDate)}_to_${formatDate(endDate)}${filterSuffix}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Group assigned plans by operator
  const groupedPlans = assignedPlans.reduce((acc, plan) => {
    if (plan.operator_id && plan.operator_id !== 0 && plan.operator) {
      if (!acc[plan.operator_id]) {
        acc[plan.operator_id] = {
          operator: plan.operator,
          mobile: plan.mobile,
          plans: []
        };
      }
      acc[plan.operator_id].plans.push(plan);
    }
    return acc;
  }, {});

  // Group unassigned plans
  const unassignedPlans = assignedPlans.filter(plan => !plan.operator_id || plan.operator_id === 0 || !plan.operator);

  // Filter plans based on selected filter and operator name
  const getFilteredPlans = () => {
    // Ensure assignedPlans is always an array
    const plans = Array.isArray(assignedPlans) ? assignedPlans : [];
    
    let filtered = plans;
    if (filterType === 'assigned') {
      filtered = plans.filter(plan => plan.operator_id && plan.operator_id !== 0 && plan.operator);
    } else if (filterType === 'unassigned') {
      filtered = plans.filter(plan => !plan.operator_id || plan.operator_id === 0 || !plan.operator);
    }
    if (operatorNameFilter !== 'all') {
      filtered = filtered.filter(plan => plan.operator === operatorNameFilter);
    }
    // Group assigned
    const grouped = filtered.reduce((acc, plan) => {
      if (plan.operator_id && plan.operator_id !== 0 && plan.operator) {
        if (!acc[plan.operator_id]) {
          acc[plan.operator_id] = {
            operator: plan.operator,
            mobile: plan.mobile,
            plans: []
          };
        }
        acc[plan.operator_id].plans.push(plan);
      }
      return acc;
    }, {});
    // Group unassigned
    const unassigned = filtered.filter(plan => !plan.operator_id || plan.operator_id === 0 || !plan.operator);
    if (filterType === 'assigned') return grouped;
    if (filterType === 'unassigned') return { unassigned: { operator: 'Unassigned Plans', mobile: '', plans: unassigned } };
    return {
      ...grouped,
      unassigned: { operator: 'Unassigned Plans', mobile: '', plans: unassigned }
    };
  };

  const filteredPlans = getFilteredPlans();

  return (
    <div className="ops-assign-container">
      {/* Tabs */}
      <div className="ops-assign-tabs">
        <button
          className={`ops-assign-tab ${activeTab === 'assign' ? 'active' : ''}`}
          onClick={() => setActiveTab('assign')}
        >
          Assign OPS
        </button>
        <button
          className={`ops-assign-tab ${activeTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned OPS
        </button>
      </div>

      <div className="ops-assign-content">
        {activeTab === 'assign' && (
          <>
            {/* Date Picker */}
            <div className="date-picker-section-assign">
              <label className="date-range-label">Select Date:</label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                className="date-picker-input"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="success-message">
                <FiCheckCircle className="success-icon" />
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="loading-container">
                <Bars
                  height="40"
                  width="40"
                  color="#4180B9"
                  ariaLabel="loading"
                />
              </div>
            )}

            {/* Plans Grid */}
            {!loading && plans.length > 0 && (
              <div className="plans-assign-section">
                <div className="plans-grid">
                  {plans
                    .sort((a, b) => {
                      // First: Active plans with no operator (unassigned)
                      if (a.activated === 1 && !a.operator && b.activated === 1 && b.operator) return -1;
                      if (b.activated === 1 && !b.operator && a.activated === 1 && a.operator) return 1;
                      
                      // Second: Active plans with operators (assigned)
                      if (a.activated === 1 && a.operator && b.activated === 0) return -1;
                      if (b.activated === 1 && b.operator && a.activated === 0) return 1;
                      
                      // Last: Inactive plans
                      if (a.activated === 0 && b.activated === 1) return 1;
                      if (b.activated === 0 && a.activated === 1) return -1;
                      
                      return 0;
                    })
                    .map((plan) => (
                      <div key={plan.id} className={`plan-card ${plan.activated === 0 ? 'inactive' : ''} ${plan.activated === 1 && !plan.operator ? 'unassigned' : ''} ${plan.activated === 1 && plan.operator ? 'assigned' : ''}`}>
                        <div className="plan-header">
                          <span className="plan-estate">{plan.estate} - {plan.area} ha</span>
                          <span className="plan-id">#{plan.id}</span>
                        </div>
                        
                        <div className="plan-body">
                          <div className="plan-details">
                            <div className="plan-detail">
                              <span className="plan-detail-label">🔴Date:</span>
                              <span className="plan-detail-value">{formatDate(plan.date)}</span>
                            </div>
                            <div className="plan-detail">
                              <span className="plan-detail-label">🔴Status:</span>
                              <span className={`status-badge-assign ${plan.activated === 1 ? 'active' : 'inactive'}`}>
                                {plan.activated === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="plan-detail">
                              <span className="plan-detail-label">🔴Manager Approval:</span>
                              <span className="plan-detail-value">{plan.manager_approval === 1 ? 'Approved' : 'Pending'}</span>
                            </div>
                            <div className="plan-detail">
                              <span className="plan-detail-label">🔴Team Assigned:</span>
                              <span className="plan-detail-value">{plan.team_assigned === 1 ? 'Yes' : 'No'}</span>
                            </div>
                          </div>

                          <div className="operator-section">
                            <label className="operator-label">Assign Operator: 🔽</label>
                            <select
                              className="operator-select"
                              value={plan.operator || ''}
                              onChange={(e) => handleOperatorChange(plan.id, e.target.value)}
                              disabled={plan.activated === 0}
                            >
                              <option value="">Select Operator</option>
                              {operators.map((operator) => (
                                <option key={operator.id} value={operator.id}>
                                  {operator.name}
                                </option>
                              ))}
                            </select>
                            
                            {plan.operator_name && (
                              <div className={`operator-status ${plan.operator ? 'assigned' : 'unassigned'}`}>
                                {plan.operator ? <FiUser className="operator-status-icon" /> : <FiUserX className="operator-status-icon" />}
                                {plan.operator_name || 'No operator assigned'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && plans.length === 0 && (
              <div className="empty-state">
                <h3>No Plans Found</h3>
                <p>No plans are available for the selected date.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'assigned' && (
          <>
            {/* Date Range Picker */}
            <div className="date-picker-section-assign">
              <div className="date-range-bar">
                <span className="date-range-label">Date Range -</span>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="date-picker-input"
                  dateFormat="yyyy-MM-dd"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  className="date-picker-input"
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              
              <div className="filter-group-assigned">
                  <select 
                    className="filter-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="assigned">Assigned Only</option>
                    <option value="unassigned">Unassigned Only</option>
                    <option value="all">All Plans</option>
                  </select>
                  <select
                    className="filter-select"
                    value={operatorNameFilter}
                    onChange={e => setOperatorNameFilter(e.target.value)}
                  >
                    <option value="all">All Operators</option>
                    {operatorNameOptions.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <button 
                    className="download-excel-btn"
                    onClick={downloadExcel}
                    disabled={Object.keys(filteredPlans).length === 0}
                  >
                    <FiDownload className="download-icon" />
                    Download Excel
                  </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Loading State */}
            {assignedLoading && (
              <div className="loading-container">
                <Bars
                  height="40"
                  width="40"
                  color="#4180B9"
                  ariaLabel="loading"
                />
              </div>
            )}

            {/* Assigned Plans Table */}
            {!assignedLoading && Object.keys(filteredPlans).length > 0 && (
              <div className="assigned-plans-section">
                <div className="assigned-plans-table">
                  {Object.entries(filteredPlans).map(([key, operatorData]) => (
                    <div key={key} className="operator-group">
                      <div className="operator-header">
                        <div className="operator-info">
                          <FiUser className="operator-icon" />
                          <div className="operator-details">
                            <h3 className="operator-name">{operatorData.operator}</h3>
                            <p className="operator-mobile">
                              <FiPhone className="mobile-icon" />
                              {operatorData.mobile}
                            </p>
                          </div>
                        </div>
                        <div className="operator-stats">
                          <span className="plan-count">{operatorData.plans.length} Plans</span>
                        </div>
                      </div>
                      
                      <div className="plans-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Plan ID</th>
                              <th>Planned Date</th>
                              <th>Estate</th>
                              <th>Area (ha)</th>
                              <th>Assigned Time</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {operatorData.plans.map((plan) => (
                              <tr key={plan.plan_id}>
                                <td className="plan-id-cell">#{plan.plan_id}</td>
                                <td className="planned-date-cell">
                                  {plan.date ? formatDate(plan.date) : 'N/A'}
                                </td>
                                <td className="estate-cell">
                                  <FiMapPin className="estate-icon" />
                                  {plan.estate_name}
                                </td>
                                <td className="area-cell">{plan.area}</td>
                                <td className="assigned-time-cell">
                                  {plan.operator_date_time ? formatDateTime(plan.operator_date_time) : 'N/A'}
                                </td>
                                <td className="status-cell">
                                  <span className={`status-badge-assign ${plan.operator_id && plan.operator ? 'active' : 'inactive'}`}>
                                    {plan.operator_id && plan.operator ? 'Assigned' : 'Unassigned'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State for Assigned Plans */}
            {!assignedLoading && Object.keys(filteredPlans).length === 0 && (
              <div className="empty-state">
                <h3>No Assigned Plans Found</h3>
                <p>No plans are assigned to operators for the selected date range.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OpsAsign; 