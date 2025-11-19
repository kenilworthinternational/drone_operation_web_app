import React, { useState } from 'react';
import '../../styles/employeeRegistration.css';

const EmployeeRegistration = () => {
  const [activeTab, setActiveTab] = useState('employee');
  const [formData, setFormData] = useState({
    // Employee Details
    employeeName: '',
    preferredName: '',
    nic: '',
    drivingLicense: '',
    drivingLicenseType: '',
    race: '',
    religion: '',
    gender: '',
    dob: '',
    permanentAddress: '',
    temporaryAddress: '',
    telephoneHome: '',
    mobileNumber: '',
    emailAddress: '',
    educationCertificates: '',
    serviceLetters: '',
    
    // Family Details
    maritalStatus: '',
    spouseName: '',
    noOfChildren: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    
    // Security Details
    divisionalSecretariats: '',
    asc: '',
    policeStation: '',
    district: '',
    policeRecord: '',
    ascRecord: '',
    
    // Job Details
    empNo: '',
    employeeType: '',
    employeeJobRole: '',
    appointmentDate: '',
    department: '',
    jobRoleLayer: '',
    workStatus: '',
    permanentDate: '',
    workLocation: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    const tabs = ['employee', 'family', 'security', 'job'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const tabs = ['employee', 'family', 'security', 'job'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Form submitted:', formData);
    // Add API call here
  };

  return (
    <div className="employee-registration-container-emp-reg">
      <h1 className="registration-title-emp-reg">Employee Registration</h1>
      
      {/* Tab Navigation */}
      <div className="registration-tabs-emp-reg">
        <button
          type="button"
          className={`registration-tab-emp-reg ${activeTab === 'employee' ? 'active' : ''}`}
          onClick={() => setActiveTab('employee')}
        >
          Employee Details
        </button>
        <button
          type="button"
          className={`registration-tab-emp-reg ${activeTab === 'family' ? 'active' : ''}`}
          onClick={() => setActiveTab('family')}
        >
          Family Details
        </button>
        <button
          type="button"
          className={`registration-tab-emp-reg ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security Details
        </button>
        <button
          type="button"
          className={`registration-tab-emp-reg ${activeTab === 'job' ? 'active' : ''}`}
          onClick={() => setActiveTab('job')}
        >
          Job Details
        </button>
      </div>

      {/* Form Content */}
      <div className="registration-form-content-emp-reg">
        {/* Employee Details Tab */}
        {activeTab === 'employee' && (
          <div className="form-section-emp-reg">
            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Employee Name:</label>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>Preferred Name:</label>
                <input
                  type="text"
                  name="preferredName"
                  value={formData.preferredName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>NIC:</label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>Driving License:</label>
                <input
                  type="text"
                  name="drivingLicense"
                  value={formData.drivingLicense}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Driving License Type:</label>
                <select
                  name="drivingLicenseType"
                  value={formData.drivingLicenseType}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select --</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="form-group-emp-reg">
                <label>Race:</label>
                <select
                  name="race"
                  value={formData.race}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select --</option>
                  <option value="Sinhalese">Sinhalese</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Burgher">Burgher</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Religion:</label>
                <select
                  name="religion"
                  value={formData.religion}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select --</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Christian">Christian</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group-emp-reg">
                <label>Gender:</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>DOB:</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                {/* Empty placeholder for 2-column layout */}
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg full-width">
                <label>Permanent Address:</label>
                <textarea
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg full-width">
                <label>Temporary Address:</label>
                <textarea
                  name="temporaryAddress"
                  value={formData.temporaryAddress}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Telephone - Home:</label>
                <input
                  type="tel"
                  name="telephoneHome"
                  value={formData.telephoneHome}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>Mobile Number:</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Email Address:</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                {/* Empty placeholder for 2-column layout */}
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Education Certificates:</label>
                <input
                  type="text"
                  name="educationCertificates"
                  value={formData.educationCertificates}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>Service Letters:</label>
                <input
                  type="text"
                  name="serviceLetters"
                  value={formData.serviceLetters}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Family Details Tab */}
        {activeTab === 'family' && (
          <div className="form-section-emp-reg">
            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Marital Status:</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select --</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div className="form-group-emp-reg">
                <label>Spouse's Name:</label>
                <input
                  type="text"
                  name="spouseName"
                  value={formData.spouseName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>No of Children:</label>
                <input
                  type="number"
                  name="noOfChildren"
                  value={formData.noOfChildren}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group-emp-reg">
                <label>Emergency Contact Name:</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Emergency Contact Relationship:</label>
                <select
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select --</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group-emp-reg">
                <label>Emergency Contact Number:</label>
                <input
                  type="tel"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Details Tab */}
        {activeTab === 'security' && (
          <div className="form-section-emp-reg">
            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Divisional Secretariats:</label>
                <input
                  type="text"
                  name="divisionalSecretariats"
                  value={formData.divisionalSecretariats}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>ASC:</label>
                <input
                  type="text"
                  name="asc"
                  value={formData.asc}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Police Station:</label>
                <input
                  type="text"
                  name="policeStation"
                  value={formData.policeStation}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>District:</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Police Record:</label>
                <input
                  type="text"
                  name="policeRecord"
                  value={formData.policeRecord}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>ASC Record:</label>
                <input
                  type="text"
                  name="ascRecord"
                  value={formData.ascRecord}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Job Details Tab */}
        {activeTab === 'job' && (
          <div className="form-section-emp-reg">
            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>EMP NO:</label>
                <input
                  type="text"
                  name="empNo"
                  value={formData.empNo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>Employee Type:</label>
                <select
                  name="employeeType"
                  value={formData.employeeType}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select --</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Employee Job Role:</label>
                <input
                  type="text"
                  name="employeeJobRole"
                  value={formData.employeeJobRole}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>Appointment Date:</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Department:</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                {/* Empty placeholder for 2-column layout */}
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Job Role Layer:</label>
                <input
                  type="text"
                  name="jobRoleLayer"
                  value={formData.jobRoleLayer}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>Work Status:</label>
                <select
                  name="workStatus"
                  value={formData.workStatus}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select --</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="form-row-emp-reg">
              <div className="form-group-emp-reg">
                <label>Permanent Date:</label>
                <input
                  type="date"
                  name="permanentDate"
                  value={formData.permanentDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-emp-reg">
                <label>Work Location:</label>
                <input
                  type="text"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="registration-buttons-emp-reg">
        {activeTab !== 'employee' && (
          <button
            type="button"
            className="btn-back-emp-reg"
            onClick={handleBack}
          >
            Back
          </button>
        )}
        {activeTab !== 'job' ? (
          <button
            type="button"
            className="btn-next-emp-reg"
            onClick={handleNext}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="btn-submit-emp-reg"
            onClick={handleSubmit}
          >
            Forward to Payroll
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeRegistration;

