import React, { useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import {
  useApplyEmployeeAssignmentMutation,
  useGetAllEmployeeRegistrationsQuery,
  useGetEmployeeAssignmentHistoryQuery,
  useGetEmployeeAssignmentQueuesQuery,
  useGetUserJobDescriptionsQuery,
  useGetUserJobRolesQuery,
  useGetWingsQuery,
  useGetWorkLocationsQuery
} from '../../api/services NodeJs/jdManagementApi';
import '../../styles/employeeAssignment.css';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="ea-custom-date-input-ea" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="ea-date-picker-input-ea" />
    <FaCalendarAlt className="ea-calendar-icon-ea" />
  </div>
));

const EmployeeAssignment = () => {
  const [queueFilter, setQueueFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    eventType: 'assignment',
    toJobRoleId: '',
    toDepartmentId: '',
    toWorkLocationId: '',
    toReportingOfficerId: '',
    effectiveDate: new Date(),
    reason: '',
    referenceNo: '',
  });

  const { data: queueResponse, isLoading: loadingQueues, refetch: refetchQueues } = useGetEmployeeAssignmentQueuesQuery();
  const { data: employeeListData } = useGetAllEmployeeRegistrationsQuery();
  const { data: wingsData } = useGetWingsQuery();
  const { data: workLocationsData } = useGetWorkLocationsQuery();
  const { data: userJobRolesData } = useGetUserJobRolesQuery();
  const { data: userJobDescriptionsData } = useGetUserJobDescriptionsQuery();
  const { data: historyResponse, isLoading: loadingHistory, refetch: refetchHistory } = useGetEmployeeAssignmentHistoryQuery(
    { employeeId: selectedEmployee?.id },
    { skip: !selectedEmployee?.id }
  );
  const [applyEmployeeAssignment, { isLoading: isApplying }] = useApplyEmployeeAssignmentMutation();

  const queues = queueResponse?.data || {};
  const assignedEmployees = queues.assignedEmployees || [];
  const nonAssignedEmployees = queues.nonAssignedEmployees || [];
  const employeesToShow = useMemo(() => {
    if (queueFilter === 'assigned') return assignedEmployees;
    if (queueFilter === 'all') return [...assignedEmployees, ...nonAssignedEmployees];
    return nonAssignedEmployees;
  }, [queueFilter, assignedEmployees, nonAssignedEmployees]);

  const allEmployees = employeeListData?.data || [];
  const wings = useMemo(() => {
    if (!wingsData) return [];
    if (Array.isArray(wingsData)) return wingsData;
    if (wingsData.data && Array.isArray(wingsData.data)) return wingsData.data;
    if (wingsData.wings && Array.isArray(wingsData.wings)) return wingsData.wings;
    return [];
  }, [wingsData]);
  const workLocations = useMemo(() => {
    if (!workLocationsData) return [];
    if (Array.isArray(workLocationsData)) return workLocationsData;
    if (workLocationsData.data && Array.isArray(workLocationsData.data)) return workLocationsData.data;
    return [];
  }, [workLocationsData]);
  const userJobRoles = userJobRolesData?.data || [];
  const userJobDescriptions = userJobDescriptionsData?.data || [];
  const historyItems = historyResponse?.data || [];

  const handleEmployeeSelect = (employee) => {
    const fullEmployee = allEmployees.find((emp) => String(emp.id) === String(employee.id)) || {};
    const mergedEmployee = { ...employee, ...fullEmployee };
    setSelectedEmployee(mergedEmployee);

    const selectedRole = userJobRoles.find(
      (role) =>
        role.jdCode === mergedEmployee.employeeJobRole ||
        role.designation === mergedEmployee.employeeJobRoleName ||
        role.designation === mergedEmployee.designation
    );
    const wingId =
      wings.find((wing) => wing.wingsCode === mergedEmployee.department)?.id ||
      wings.find((wing) => wing.wing === mergedEmployee.departmentName)?.id ||
      '';
    const locationId =
      workLocations.find((location) => location.locationCode === mergedEmployee.workLocation)?.id ||
      workLocations.find((location) => location.locationName === mergedEmployee.workLocationName)?.id ||
      '';

    setAssignmentData({
      eventType: 'assignment',
      toJobRoleId: selectedRole?.id || '',
      toDepartmentId: wingId,
      toWorkLocationId: locationId,
      toReportingOfficerId: mergedEmployee.reportofficer || '',
      effectiveDate: new Date(),
      reason: '',
      referenceNo: '',
    });
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setAssignmentData(prev => ({
      ...prev,
      effectiveDate: date
    }));
  };

  const handleAssign = async () => {
    if (!selectedEmployee?.id) {
      setMessage({ type: 'error', text: 'Please select an employee first.' });
      return;
    }

    try {
      const payload = {
        employeeId: selectedEmployee.id,
        eventType: assignmentData.eventType,
        effectiveDate: assignmentData.effectiveDate?.toISOString?.().split('T')[0] || '',
        toDepartmentId: assignmentData.toDepartmentId || null,
        toWorkLocationId: assignmentData.toWorkLocationId || null,
        toJobRoleId: assignmentData.toJobRoleId || null,
        toReportingOfficerId: assignmentData.toReportingOfficerId || null,
        reason: assignmentData.reason || null,
        referenceNo: assignmentData.referenceNo || null
      };

      const result = await applyEmployeeAssignment(payload).unwrap();
      setMessage({ type: 'success', text: result?.message || 'Assignment updated successfully.' });
      await refetchQueues();
      await refetchHistory();
    } catch (error) {
      setMessage({ type: 'error', text: error?.data?.message || 'Failed to update assignment.' });
    }
  };

  const handlePrint = () => {
    if (!selectedEmployee?.id) {
      setMessage({ type: 'error', text: 'Please select an employee first.' });
      return;
    }
    window.print();
  };

  const formatHistoryDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return String(dateValue);
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateValue);
    }
  };

  const openAssignmentLetter = (historyItem) => {
    setSelectedHistoryItem(historyItem);
    setShowLetterModal(true);
  };

  const closeAssignmentLetter = () => {
    setShowLetterModal(false);
    setSelectedHistoryItem(null);
  };

  const printLetterFromModal = () => {
    if (!selectedHistoryItem || !selectedEmployee) return;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const letterHtml = `
      <html>
        <head>
          <title>Assignment Letter</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; color: #111; }
            h2 { margin: 0 0 20px; }
            .meta { margin: 10px 0; }
            .section { margin-top: 18px; }
          </style>
        </head>
        <body>
          <h2>Employee Assignment Letter</h2>
          <div class="meta"><strong>Employee:</strong> ${selectedEmployee.employeeName || selectedEmployee.name || 'N/A'}</div>
          <div class="meta"><strong>Event Type:</strong> ${selectedHistoryItem.event_type || 'N/A'}</div>
          <div class="meta"><strong>Effective Date:</strong> ${formatHistoryDate(selectedHistoryItem.effective_date)}</div>
          <div class="meta"><strong>Department:</strong> ${selectedHistoryItem.from_department_code || '-'} to ${selectedHistoryItem.to_department_code || '-'}</div>
          <div class="meta"><strong>Work Location:</strong> ${selectedHistoryItem.from_work_location_code || '-'} to ${selectedHistoryItem.to_work_location_code || '-'}</div>
          <div class="meta"><strong>Job Role:</strong> ${selectedHistoryItem.from_job_role_code || '-'} to ${selectedHistoryItem.to_job_role_code || '-'}</div>
          <div class="meta"><strong>Reference No:</strong> ${selectedHistoryItem.reference_no || 'N/A'}</div>
          <div class="section"><strong>Reason:</strong></div>
          <div>${selectedHistoryItem.reason || 'No reason provided.'}</div>
        </body>
      </html>
    `;

    printWindow.document.write(letterHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const selectedDesignation = useMemo(() => {
    if (!assignmentData.toJobRoleId) return null;
    return userJobRoles.find((role) => String(role.id) === String(assignmentData.toJobRoleId)) || null;
  }, [assignmentData.toJobRoleId, userJobRoles]);

  const selectedRoleDescriptions = useMemo(() => {
    if (!selectedDesignation) return [];
    return userJobDescriptions
      .filter((item) => String(item.jobRoleId) === String(selectedDesignation.id) && Number(item.status) === 1)
      .sort((a, b) => Number(a.taskOrder || 0) - Number(b.taskOrder || 0));
  }, [selectedDesignation, userJobDescriptions]);

  const reportingOfficerOptions = useMemo(() => {
    return allEmployees
      .filter((emp) => String(emp.id) !== String(selectedEmployee?.id))
      .map((emp) => ({
        value: emp.id,
        label: `${emp.id} - ${emp.employeeName || emp.preferredName || emp.empNo || 'Employee'}`
      }));
  }, [allEmployees, selectedEmployee?.id]);

  return (
    <div className="employee-assignment-container-ea">
      <div className="ea-header-ea">
        <h1 className="ea-title-ea">Employee Assignment</h1>
      </div>

      <div className="ea-content-ea">
        {/* Left Panel - Employee Queue */}
        <div className="ea-left-panel-ea">
          <div className="ea-panel-header-ea">
            <h2 className="ea-panel-title-ea">
              {queueFilter === 'assigned'
                ? 'Assigned Employee Queue'
                : queueFilter === 'all'
                  ? 'All Employees Queue'
                  : 'Non-Assigned Employee Queue'}
            </h2>
            <div className="ea-toggle-container-ea">
              <button
                className={`ea-toggle-btn-ea ${queueFilter === 'all' ? 'active-ea' : ''}`}
                onClick={() => setQueueFilter('all')}
              >
                All
              </button>
              <button
                className={`ea-toggle-btn-ea ${queueFilter === 'assigned' ? 'active-ea' : ''}`}
                onClick={() => setQueueFilter('assigned')}
              >
                Assigned
              </button>
              <button
                className={`ea-toggle-btn-ea ${queueFilter === 'not_assigned' ? 'active-ea' : ''}`}
                onClick={() => setQueueFilter('not_assigned')}
              >
                Not Assigned
              </button>
            </div>
          </div>

          <div className="ea-employees-list-ea">
            {loadingQueues && <div className="ea-empty-state-ea">Loading employee queue...</div>}
            {employeesToShow.length === 0 ? (
              <div className="ea-empty-state-ea">
                {queueFilter === 'all'
                  ? 'No employees found.'
                  : `No ${queueFilter === 'assigned' ? 'assigned' : 'non-assigned'} employees found.`}
              </div>
            ) : (
              employeesToShow.map(employee => (
                <div
                  key={employee.id}
                  className={`ea-employee-item-ea ${
                    selectedEmployee?.id === employee.id ? 'active-ea' : ''
                  }`}
                  onClick={() => handleEmployeeSelect(employee)}
                >
                  <div className="ea-employee-info-ea">
                    <span className="ea-employee-name-ea">{employee.employeeName || employee.name || 'N/A'}</span>
                    <span className="ea-employee-designation-ea">{employee.designation || employee.employeeJobRoleName || 'No Role'}</span>
                    {queueFilter !== 'not_assigned' && (employee.departmentName || employee.currentDivision) && (
                      <span className="ea-assigned-division-ea">{employee.departmentName || employee.currentDivision}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="ea-divider-ea"></div>

        {/* Right Panel - Assignment Form */}
        <div className="ea-right-panel-ea">
          <div className="ea-form-container-ea">
            <h2 className="ea-form-title-ea">Employee Assignment</h2>

            {selectedEmployee && (
              <div className="ea-current-division-header-ea">
                <span className="ea-current-division-label-ea">Current Serving Division:</span>
                <span className="ea-current-division-value-ea">
                  {selectedEmployee.departmentName || selectedEmployee.departmentCode || 'N/A'}
                </span>
                <span className="ea-current-division-label-ea">| Designation:</span>
                <span className="ea-current-division-value-ea">
                  {selectedEmployee.employeeJobRoleName || selectedEmployee.designation || 'N/A'}
                </span>
                <span className="ea-current-division-label-ea">| Reporting Officer:</span>
                <span className="ea-current-division-value-ea">
                  {reportingOfficerOptions.find((opt) => String(opt.value) === String(selectedEmployee.reportofficer))?.label ||
                    (selectedEmployee.reportofficer ? String(selectedEmployee.reportofficer) : 'N/A')}
                </span>
                <span className="ea-current-division-label-ea">| Work Location:</span>
                <span className="ea-current-division-value-ea">
                  {selectedEmployee.workLocationName || selectedEmployee.workLocationCode || 'N/A'}
                </span>
              </div>
            )}

            <div className="ea-form-content-ea">
              {selectedEmployee ? (
                <div className="ea-employee-info-display-ea">
                  <span className="ea-info-value-ea">{selectedEmployee.employeeName || selectedEmployee.name}</span>
                  <span className="ea-info-designation-ea">
                    {selectedEmployee.designation || selectedEmployee.employeeJobRoleName || 'Not Assigned'}
                  </span>
                </div>
              ) : (
                <div className="ea-no-selection-ea">
                  <p>Select an employee from the left panel to view details</p>
                </div>
              )}

              {selectedEmployee && (
                <div className="ea-form-row-ea">
                  <div className="ea-form-group-ea">
                    <label>Event Type:</label>
                    <div className="ea-select-wrapper-ea">
                      <select
                        name="eventType"
                        value={assignmentData.eventType}
                        onChange={handleInputChange}
                        className="ea-select-ea"
                      >
                        <option value="assignment">Assignment</option>
                        <option value="transfer">Transfer</option>
                        <option value="promotion">Promotion</option>
                        <option value="demotion">Demotion</option>
                        <option value="acting_assignment">Acting Assignment</option>
                        <option value="reversion">Reversion</option>
                      </select>
                    </div>
                  </div>
                  <div className="ea-form-group-ea">
                    <label>Designation:</label>
                    <div className="ea-select-wrapper-ea">
                      <select
                        name="toJobRoleId"
                        value={assignmentData.toJobRoleId}
                        onChange={handleInputChange}
                        className="ea-select-ea"
                      >
                        <option value="">-- Select Designation --</option>
                        {userJobRoles.filter((role) => Number(role.status) === 1).map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.designation}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedRoleDescriptions.length > 0 && (
                <div className="ea-job-description-section-ea">
                  <label>Job Description:</label>
                  <div className="ea-description-box-ea">
                    {selectedRoleDescriptions.map((task, index) => (
                      <div key={index} className="ea-description-item-ea">
                        <span className="ea-task-number-ea">{index + 1}.</span>
                        <span className="ea-task-text-ea">{task.taskDescription}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="ea-form-row-ea">
                <div className="ea-form-group-ea">
                  <label>Reporting Officer:</label>
                  <div className="ea-select-wrapper-ea">
                    <select
                      name="toReportingOfficerId"
                      value={assignmentData.toReportingOfficerId}
                      onChange={handleInputChange}
                      className="ea-select-ea"
                    >
                      <option value="">-- Select Reporting Officer --</option>
                      {reportingOfficerOptions.map((officer) => (
                        <option key={officer.value} value={officer.value}>
                          {officer.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="ea-form-group-ea">
                  <label>Assigned/Transfer Division:</label>
                  <div className="ea-select-wrapper-ea">
                    <select
                      name="toDepartmentId"
                      value={assignmentData.toDepartmentId}
                      onChange={handleInputChange}
                      className="ea-select-ea"
                    >
                      <option value="">-- Select Division --</option>
                      {wings.map((wing) => (
                        <option key={wing.id} value={wing.id}>
                          {wing.wing}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="ea-form-row-ea">
                <div className="ea-form-group-ea">
                  <label>Work Location:</label>
                  <div className="ea-select-wrapper-ea">
                    <select
                      name="toWorkLocationId"
                      value={assignmentData.toWorkLocationId}
                      onChange={handleInputChange}
                      className="ea-select-ea"
                    >
                      <option value="">-- Select Work Location --</option>
                      {workLocations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.locationName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="ea-form-group-ea">
                  <label>Assignment Date:</label>
                  <DatePicker
                    selected={assignmentData.effectiveDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy/MM/dd"
                    customInput={<CustomDateInput />}
                  />
                </div>
              </div>

              <div className="ea-form-row-ea">
                <div className="ea-form-group-ea">
                  <label>Reason:</label>
                  <textarea
                    name="reason"
                    value={assignmentData.reason}
                    onChange={handleInputChange}
                    className="ea-select-ea"
                    rows={3}
                  />
                </div>
                <div className="ea-form-group-ea">
                  <label>Reference No:</label>
                  <input
                    type="text"
                    name="referenceNo"
                    value={assignmentData.referenceNo}
                    onChange={handleInputChange}
                    className="ea-select-ea"
                  />
                </div>
              </div>

              {message.text && (
                <div className="ea-form-row-ea">
                  <div className="ea-form-group-ea">
                    <span style={{ color: message.type === 'error' ? '#b00020' : '#0f766e' }}>{message.text}</span>
                  </div>
                </div>
              )}

              <div className="ea-form-row-ea">
                <div className="ea-form-group-ea">
                  <label>Assignment History:</label>
                  <div className="ea-description-box-ea">
                    {loadingHistory && <div className="ea-description-item-ea">Loading history...</div>}
                    {!loadingHistory && historyItems.length === 0 && (
                      <div className="ea-description-item-ea">No history records available.</div>
                    )}
                    {!loadingHistory && historyItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="ea-description-item-ea ea-history-item-button-ea"
                        onClick={() => openAssignmentLetter(item)}
                        title="View assignment letter"
                      >
                        <span className="ea-task-number-ea">{item.event_type}</span>
                        <span className="ea-task-text-ea">
                          {formatHistoryDate(item.effective_date)} | {item.from_department_code || '-'} to {item.to_department_code || '-'} | {item.reason || 'No reason'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ea-action-buttons-ea ea-action-buttons-inline-ea">
                <button className="ea-btn-assign-ea" onClick={handleAssign} disabled={isApplying}>
                  {isApplying ? 'Saving...' : 'Assign'}
                </button>
                <button className="ea-btn-print-ea" onClick={handlePrint}>
                  Print Assignment Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLetterModal && selectedHistoryItem && (
        <div className="ea-letter-modal-overlay-ea" onClick={closeAssignmentLetter}>
          <div className="ea-letter-modal-content-ea" onClick={(e) => e.stopPropagation()}>
            <div className="ea-letter-modal-header-ea">
              <h3>Assignment Letter</h3>
              <button type="button" className="ea-letter-close-btn-ea" onClick={closeAssignmentLetter}>
                ×
              </button>
            </div>

            <div className="ea-letter-modal-body-ea">
              <p><strong>Employee:</strong> {selectedEmployee?.employeeName || selectedEmployee?.name || 'N/A'}</p>
              <p><strong>Event Type:</strong> {selectedHistoryItem.event_type || 'N/A'}</p>
              <p><strong>Effective Date:</strong> {formatHistoryDate(selectedHistoryItem.effective_date)}</p>
              <p><strong>Department:</strong> {selectedHistoryItem.from_department_code || '-'} to {selectedHistoryItem.to_department_code || '-'}</p>
              <p><strong>Work Location:</strong> {selectedHistoryItem.from_work_location_code || '-'} to {selectedHistoryItem.to_work_location_code || '-'}</p>
              <p><strong>Job Role:</strong> {selectedHistoryItem.from_job_role_code || '-'} to {selectedHistoryItem.to_job_role_code || '-'}</p>
              <p><strong>Reference No:</strong> {selectedHistoryItem.reference_no || 'N/A'}</p>
              <p><strong>Reason:</strong> {selectedHistoryItem.reason || 'No reason provided.'}</p>
            </div>

            <div className="ea-letter-modal-actions-ea">
              <button type="button" className="ea-btn-print-ea" onClick={printLetterFromModal}>
                Print Assignment Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAssignment;

