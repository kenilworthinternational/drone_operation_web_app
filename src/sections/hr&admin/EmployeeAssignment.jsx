import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import '../../styles/employeeAssignment.css';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="ea-custom-date-input-ea" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="ea-date-picker-input-ea" />
    <FaCalendarAlt className="ea-calendar-icon-ea" />
  </div>
));

const EmployeeAssignment = () => {
  const [showAssigned, setShowAssigned] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    employeeName: '',
    employeeDesignation: '',
    currentServingDivision: '',
    reportingOfficer: '',
    assignedDivision: '',
    workLocation: '',
    jobDescription: '',
    assignmentDate: new Date(),
  });

  // Mock data - will be replaced with API calls later
  const nonAssignedEmployees = [
    { id: 1, name: 'Employee 01', designation: 'EXC. Drone Pilot', hasDivision: false },
    { id: 2, name: 'Employee 02', designation: 'Ass. Manager - ICT', hasDivision: true, currentDivision: 'Operations' },
    { id: 3, name: 'Employee 03', designation: 'EXC. Finance', hasDivision: false },
    { id: 4, name: 'Employee 04', designation: 'Senior Pilot', hasDivision: true, currentDivision: 'Management' },
  ];

  const assignedEmployees = [
    { id: 5, name: 'Employee 05', designation: 'Manager', assignedDivision: 'Finance' },
    { id: 6, name: 'Employee 06', designation: 'Pilot', assignedDivision: 'Operations' },
  ];

  // Mock designations with job descriptions
  const designations = [
    {
      name: 'EXC. Drone Pilot',
      description: [
        'Operate drones for agricultural spraying',
        'Perform pre-flight and post-flight inspections',
        'Maintain flight logs and documentation',
        'Ensure compliance with safety regulations',
      ]
    },
    {
      name: 'Ass. Manager - ICT',
      description: [
        'Manage ICT infrastructure and systems',
        'Coordinate with vendors and service providers',
        'Ensure system security and data protection',
        'Provide technical support to staff',
      ]
    },
    {
      name: 'EXC. Finance',
      description: [
        'Manage financial records and reports',
        'Process invoices and payments',
        'Coordinate with accounting department',
        'Prepare budget forecasts',
      ]
    },
    {
      name: 'Senior Pilot',
      description: [
        'Lead drone operations team',
        'Train junior pilots',
        'Coordinate flight schedules',
        'Manage equipment maintenance',
      ]
    },
    {
      name: 'Manager',
      description: [
        'Oversee department operations',
        'Manage team performance',
        'Coordinate with other departments',
        'Report to senior management',
      ]
    },
    {
      name: 'Pilot',
      description: [
        'Operate drones for field missions',
        'Follow safety protocols',
        'Maintain equipment',
        'Complete mission reports',
      ]
    },
  ];

  const divisions = ['Operations', 'Management', 'Finance', 'ICT', 'HR', 'Corporate'];
  const reportingOfficers = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Sarah Williams'];
  const workLocations = ['Head Office', 'Field Office 1', 'Field Office 2', 'Regional Office'];

  const employeesToShow = showAssigned ? assignedEmployees : nonAssignedEmployees;

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    const designation = designations.find(d => d.name === employee.designation);
    setAssignmentData({
      employeeName: employee.name,
      employeeDesignation: employee.designation,
      currentServingDivision: employee.hasDivision ? employee.currentDivision : '',
      reportingOfficer: '',
      assignedDivision: '',
      workLocation: '',
      jobDescription: designation ? designation.description.join('\n') : '',
      assignmentDate: new Date(),
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-populate job description when designation changes
    if (name === 'employeeDesignation') {
      const designation = designations.find(d => d.name === value);
      if (designation) {
        setAssignmentData(prev => ({
          ...prev,
          employeeDesignation: value,
          jobDescription: designation.description.join('\n')
        }));
      }
    }
  };

  const handleDateChange = (date) => {
    setAssignmentData(prev => ({
      ...prev,
      assignmentDate: date
    }));
  };

  const handleAssign = () => {
    if (!assignmentData.employeeName || !assignmentData.assignedDivision) {
      alert('Please fill in all required fields');
      return;
    }
    console.log('Assignment data:', assignmentData);
    alert('Assignment functionality will be implemented with API');
  };

  const handlePrint = () => {
    if (!assignmentData.employeeName) {
      alert('Please select an employee first');
      return;
    }
    console.log('Print assignment letter for:', assignmentData);
    alert('Print functionality will be implemented with API');
  };

  const selectedDesignation = designations.find(d => d.name === assignmentData.employeeDesignation);

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
              {showAssigned ? 'Assigned Employee Queue' : 'Non-Assigned Employee Queue'}
            </h2>
            <div className="ea-toggle-container-ea">
              <button
                className={`ea-toggle-btn-ea ${!showAssigned ? 'active-ea' : ''}`}
                onClick={() => setShowAssigned(false)}
              >
                Not Assigned
              </button>
              <button
                className={`ea-toggle-btn-ea ${showAssigned ? 'active-ea' : ''}`}
                onClick={() => setShowAssigned(true)}
              >
                Assigned
              </button>
            </div>
          </div>

          <div className="ea-employees-list-ea">
            {employeesToShow.length === 0 ? (
              <div className="ea-empty-state-ea">
                No {showAssigned ? 'assigned' : 'non-assigned'} employees found.
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
                    <span className="ea-employee-name-ea">{employee.name}</span>
                    <span className="ea-employee-designation-ea">{employee.designation}</span>
                    {showAssigned && employee.assignedDivision && (
                      <span className="ea-assigned-division-ea">{employee.assignedDivision}</span>
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

            {/* Current Division Header (if employee has division) */}
            {assignmentData.currentServingDivision && (
              <div className="ea-current-division-header-ea">
                <span className="ea-current-division-label-ea">Current Serving Division:</span>
                <span className="ea-current-division-value-ea">{assignmentData.currentServingDivision}</span>
              </div>
            )}

            <div className="ea-form-content-ea">
              {/* Employee Info Display */}
              {assignmentData.employeeName ? (
                <div className="ea-employee-info-display-ea">
                  <span className="ea-info-value-ea">{assignmentData.employeeName}</span>
                  <span className="ea-info-designation-ea">
                    {assignmentData.employeeDesignation || 'Not Assigned'}
                  </span>
                </div>
              ) : (
                <div className="ea-no-selection-ea">
                  <p>Select an employee from the left panel to view details</p>
                </div>
              )}

              {/* Designation Selection (only if employee selected but no designation) */}
              {assignmentData.employeeName && !assignmentData.employeeDesignation && (
                <div className="ea-form-row-ea">
                  <div className="ea-form-group-ea">
                    <label>Assign Designation:</label>
                    <div className="ea-select-wrapper-ea">
                      <select
                        name="employeeDesignation"
                        value={assignmentData.employeeDesignation}
                        onChange={handleInputChange}
                        className="ea-select-ea"
                      >
                        <option value="">-- Select Designation --</option>
                        {designations.map((designation, index) => (
                          <option key={index} value={designation.name}>
                            {designation.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Description - Auto-populated and displayed near designation */}
              {selectedDesignation && (
                <div className="ea-job-description-section-ea">
                  <label>Job Description:</label>
                  <div className="ea-description-box-ea">
                    {selectedDesignation.description.map((task, index) => (
                      <div key={index} className="ea-description-item-ea">
                        <span className="ea-task-number-ea">{index + 1}.</span>
                        <span className="ea-task-text-ea">{task}</span>
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
                      name="reportingOfficer"
                      value={assignmentData.reportingOfficer}
                      onChange={handleInputChange}
                      className="ea-select-ea"
                    >
                      <option value="">-- Select Reporting Officer --</option>
                      {reportingOfficers.map((officer, index) => (
                        <option key={index} value={officer}>
                          {officer}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="ea-form-row-ea">
                <div className="ea-form-group-ea">
                  <label>Assigned/Transfer Division:</label>
                  <div className="ea-select-wrapper-ea">
                    <select
                      name="assignedDivision"
                      value={assignmentData.assignedDivision}
                      onChange={handleInputChange}
                      className="ea-select-ea"
                    >
                      <option value="">-- Select Division --</option>
                      {divisions.map((division, index) => (
                        <option key={index} value={division}>
                          {division}
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
                      name="workLocation"
                      value={assignmentData.workLocation}
                      onChange={handleInputChange}
                      className="ea-select-ea"
                    >
                      <option value="">-- Select Work Location --</option>
                      {workLocations.map((location, index) => (
                        <option key={index} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="ea-form-row-ea">
                <div className="ea-form-group-ea">
                  <label>Assignment Date:</label>
                  <DatePicker
                    selected={assignmentData.assignmentDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy/MM/dd"
                    customInput={<CustomDateInput />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="ea-action-buttons-ea">
        <button className="ea-btn-assign-ea" onClick={handleAssign}>
          Assign
        </button>
        <button className="ea-btn-print-ea" onClick={handlePrint}>
          Print Assignment Letter
        </button>
      </div>
    </div>
  );
};

export default EmployeeAssignment;

