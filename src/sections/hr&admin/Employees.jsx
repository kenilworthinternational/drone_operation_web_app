import React, { useState, useEffect } from 'react';
import '../../styles/employees.css';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'John Doe',
      preferredName: 'John',
      nic: '123456789V',
      empNo: 'EMP001',
      email: 'john.doe@example.com',
      mobile: '+94 77 123 4567',
      department: 'Operations',
      jobRole: 'Pilot',
      workStatus: 'Active',
      appointmentDate: '2020-01-15',
      permanentDate: '2021-01-15',
      workLocation: 'Head Office',
      employeeType: 'Permanent',
      dob: '1990-05-20',
      gender: 'Male',
      race: 'Sinhalese',
      religion: 'Buddhist',
      maritalStatus: 'Married',
      spouseName: 'Jane Doe',
      noOfChildren: 2,
      emergencyContactName: 'Jane Doe',
      emergencyContactRelationship: 'Spouse',
      emergencyContactNumber: '+94 77 123 4568',
      permanentAddress: '123 Main Street, Colombo 05',
      temporaryAddress: '123 Main Street, Colombo 05',
      telephoneHome: '+94 11 234 5678',
      drivingLicense: 'DL123456',
      drivingLicenseType: 'B',
      divisionalSecretariats: 'Colombo',
      asc: 'ASC001',
      policeStation: 'Colombo',
      district: 'Colombo',
      policeRecord: 'Clear',
      ascRecord: 'Clear',
      educationCertificates: 'BSc in Engineering',
      serviceLetters: 'Available',
      jobRoleLayer: 'Level 3'
    },
    {
      id: 2,
      name: 'Sarah Smith',
      preferredName: 'Sarah',
      nic: '987654321V',
      empNo: 'EMP002',
      email: 'sarah.smith@example.com',
      mobile: '+94 77 987 6543',
      department: 'Management',
      jobRole: 'Manager',
      workStatus: 'Active',
      appointmentDate: '2019-06-10',
      permanentDate: '2020-06-10',
      workLocation: 'Head Office',
      employeeType: 'Permanent',
      dob: '1988-03-15',
      gender: 'Female',
      race: 'Tamil',
      religion: 'Hindu',
      maritalStatus: 'Single',
      spouseName: '',
      noOfChildren: 0,
      emergencyContactName: 'Robert Smith',
      emergencyContactRelationship: 'Parent',
      emergencyContactNumber: '+94 77 987 6544',
      permanentAddress: '456 Park Avenue, Kandy',
      temporaryAddress: '456 Park Avenue, Kandy',
      telephoneHome: '+94 81 234 5678',
      drivingLicense: 'DL987654',
      drivingLicenseType: 'A',
      divisionalSecretariats: 'Kandy',
      asc: 'ASC002',
      policeStation: 'Kandy',
      district: 'Kandy',
      policeRecord: 'Clear',
      ascRecord: 'Clear',
      educationCertificates: 'MBA',
      serviceLetters: 'Available',
      jobRoleLayer: 'Level 5'
    }
  ]);
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const handleSearch = () => {
    // Search is handled by useEffect
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleEdit = () => {
    setEditFormData({ ...selectedEmployee });
    setShowEditModal(true);
    setShowDetailModal(false);
  };

  const handleAssign = (employee) => {
    // Handle assign functionality
    alert(`Assign functionality for ${employee.name}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = () => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === editFormData.id ? editFormData : emp
      )
    );
    setShowEditModal(false);
    setSelectedEmployee(null);
    alert('Employee data updated successfully!');
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setSelectedEmployee(null);
    setEditFormData({});
  };

  return (
    <div className="employees-container-emp-list">
      <div className="employees-header-emp-list">
        <h1 className="employees-title-emp-list">Employees</h1>
        <div className="search-container-emp-list">
          <input
            type="text"
            className="search-input-emp-list"
            placeholder="Search by Name, NIC, or Employee Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="search-button-emp-list"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      <div className="employees-table-container-emp-list">
        <table className="employees-table-emp-list">
          <thead>
            <tr>
              <th>Employee Number</th>
              <th>Name</th>
              <th>NIC</th>
              <th>Department</th>
              <th>Job Role</th>
              <th>Work Status</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data-emp-list">
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map(employee => (
                <tr 
                  key={employee.id}
                  className="employee-row-emp-list"
                >
                  <td onClick={() => handleEmployeeClick(employee)}>{employee.empNo}</td>
                  <td onClick={() => handleEmployeeClick(employee)}>{employee.name}</td>
                  <td onClick={() => handleEmployeeClick(employee)}>{employee.nic}</td>
                  <td onClick={() => handleEmployeeClick(employee)}>{employee.department}</td>
                  <td onClick={() => handleEmployeeClick(employee)}>{employee.jobRole}</td>
                  <td onClick={() => handleEmployeeClick(employee)}>
                    <span className={`status-badge-emp-list status-${employee.workStatus.toLowerCase()}-emp-list`}>
                      {employee.workStatus}
                    </span>
                  </td>
                  <td onClick={() => handleEmployeeClick(employee)}>{employee.email}</td>
                  <td onClick={() => handleEmployeeClick(employee)}>{employee.mobile}</td>
                  <td>
                    <button
                      className="btn-assign-row-emp-list"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssign(employee);
                      }}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Employee Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <div className="modal-overlay-emp-list" onClick={handleCloseModal}>
          <div className="modal-content-emp-list" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-emp-list">
              <h2>Employee Details</h2>
              <button className="modal-close-emp-list" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body-emp-list">
              <div className="employee-detail-section-emp-list">
                <h3>Basic Information</h3>
                <div className="detail-grid-emp-list">
                  <div className="detail-item-emp-list">
                    <label>Employee Number:</label>
                    <span>{selectedEmployee.empNo}</span>
                  </div>
                  <div className="detail-item-emp-list">
                    <label>Name:</label>
                    <span>{selectedEmployee.name}</span>
                  </div>
                  <div className="detail-item-emp-list">
                    <label>Preferred Name:</label>
                    <span>{selectedEmployee.preferredName}</span>
                  </div>
                  <div className="detail-item-emp-list">
                    <label>NIC:</label>
                    <span>{selectedEmployee.nic}</span>
                  </div>
                  <div className="detail-item-emp-list">
                    <label>Email:</label>
                    <span>{selectedEmployee.email}</span>
                  </div>
                  <div className="detail-item-emp-list">
                    <label>Mobile:</label>
                    <span>{selectedEmployee.mobile}</span>
                  </div>
                  <div className="detail-item-emp-list">
                    <label>Department:</label>
                    <span>{selectedEmployee.department}</span>
                  </div>
                  <div className="detail-item-emp-list">
                    <label>Job Role:</label>
                    <span>{selectedEmployee.jobRole}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer-emp-list">
              <button className="btn-edit-emp-list" onClick={handleEdit}>
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay-emp-list" onClick={handleCloseModal}>
          <div className="modal-content-emp-list edit-modal-emp-list" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-emp-list">
              <h2>Edit Employee</h2>
              <button className="modal-close-emp-list" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body-emp-list">
              <div className="edit-form-emp-list">
                {/* Employee Details Section */}
                <div className="edit-section-emp-list">
                  <h3>Employee Details</h3>
                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Employee Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>Preferred Name:</label>
                      <input
                        type="text"
                        name="preferredName"
                        value={editFormData.preferredName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>NIC:</label>
                      <input
                        type="text"
                        name="nic"
                        value={editFormData.nic || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>Driving License:</label>
                      <input
                        type="text"
                        name="drivingLicense"
                        value={editFormData.drivingLicense || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Driving License Type:</label>
                      <select
                        name="drivingLicenseType"
                        value={editFormData.drivingLicenseType || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Select --</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div className="form-group-emp-list">
                      <label>Race:</label>
                      <select
                        name="race"
                        value={editFormData.race || ''}
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

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Religion:</label>
                      <select
                        name="religion"
                        value={editFormData.religion || ''}
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
                    <div className="form-group-emp-list">
                      <label>Gender:</label>
                      <select
                        name="gender"
                        value={editFormData.gender || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Select --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>DOB:</label>
                      <input
                        type="date"
                        name="dob"
                        value={editFormData.dob || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      {/* Empty placeholder for 2-column layout */}
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list full-width-emp-list">
                      <label>Permanent Address:</label>
                      <textarea
                        name="permanentAddress"
                        value={editFormData.permanentAddress || ''}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list full-width-emp-list">
                      <label>Temporary Address:</label>
                      <textarea
                        name="temporaryAddress"
                        value={editFormData.temporaryAddress || ''}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Telephone - Home:</label>
                      <input
                        type="tel"
                        name="telephoneHome"
                        value={editFormData.telephoneHome || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>Mobile Number:</label>
                      <input
                        type="tel"
                        name="mobile"
                        value={editFormData.mobile || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Email Address:</label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      {/* Empty placeholder for 2-column layout */}
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Education Certificates:</label>
                      <input
                        type="text"
                        name="educationCertificates"
                        value={editFormData.educationCertificates || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>Service Letters:</label>
                      <input
                        type="text"
                        name="serviceLetters"
                        value={editFormData.serviceLetters || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Family Details Section */}
                <div className="edit-section-emp-list">
                  <h3>Family Details</h3>
                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Marital Status:</label>
                      <select
                        name="maritalStatus"
                        value={editFormData.maritalStatus || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Select --</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    <div className="form-group-emp-list">
                      <label>Spouse's Name:</label>
                      <input
                        type="text"
                        name="spouseName"
                        value={editFormData.spouseName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>No of Children:</label>
                      <input
                        type="number"
                        name="noOfChildren"
                        value={editFormData.noOfChildren || ''}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>Emergency Contact Name:</label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={editFormData.emergencyContactName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Emergency Contact Relationship:</label>
                      <select
                        name="emergencyContactRelationship"
                        value={editFormData.emergencyContactRelationship || ''}
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
                    <div className="form-group-emp-list">
                      <label>Emergency Contact Number:</label>
                      <input
                        type="tel"
                        name="emergencyContactNumber"
                        value={editFormData.emergencyContactNumber || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Security Details Section */}
                <div className="edit-section-emp-list">
                  <h3>Security Details</h3>
                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Divisional Secretariats:</label>
                      <input
                        type="text"
                        name="divisionalSecretariats"
                        value={editFormData.divisionalSecretariats || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>ASC:</label>
                      <input
                        type="text"
                        name="asc"
                        value={editFormData.asc || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Police Station:</label>
                      <input
                        type="text"
                        name="policeStation"
                        value={editFormData.policeStation || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>District:</label>
                      <input
                        type="text"
                        name="district"
                        value={editFormData.district || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Police Record:</label>
                      <input
                        type="text"
                        name="policeRecord"
                        value={editFormData.policeRecord || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>ASC Record:</label>
                      <input
                        type="text"
                        name="ascRecord"
                        value={editFormData.ascRecord || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Job Details Section */}
                <div className="edit-section-emp-list">
                  <h3>Job Details</h3>
                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>EMP NO:</label>
                      <input
                        type="text"
                        name="empNo"
                        value={editFormData.empNo || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>Employee Type:</label>
                      <select
                        name="employeeType"
                        value={editFormData.employeeType || ''}
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

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Employee Job Role:</label>
                      <input
                        type="text"
                        name="jobRole"
                        value={editFormData.jobRole || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>Appointment Date:</label>
                      <input
                        type="date"
                        name="appointmentDate"
                        value={editFormData.appointmentDate || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Department:</label>
                      <input
                        type="text"
                        name="department"
                        value={editFormData.department || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      {/* Empty placeholder for 2-column layout */}
                    </div>
                  </div>

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Job Role Layer:</label>
                      <input
                        type="text"
                        name="jobRoleLayer"
                        value={editFormData.jobRoleLayer || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>Work Status:</label>
                      <select
                        name="workStatus"
                        value={editFormData.workStatus || ''}
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

                  <div className="form-row-emp-list">
                    <div className="form-group-emp-list">
                      <label>Permanent Date:</label>
                      <input
                        type="date"
                        name="permanentDate"
                        value={editFormData.permanentDate || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group-emp-list">
                      <label>Work Location:</label>
                      <input
                        type="text"
                        name="workLocation"
                        value={editFormData.workLocation || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer-emp-list">
              <button className="btn-cancel-emp-list" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="btn-save-emp-list" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

