import React, { useState, useEffect, useMemo } from 'react';
import { 
  useGetUserMemberTypesQuery, 
  useGetUserJobRolesQuery, 
  useGetUserLevelsQuery,
  useSearchEmployeeQuery,
  useCreateUserMutation,
  useGetGroupsQuery,
  useGetPlantationsQuery,
  useGetRegionsQuery,
  useGetEstatesQuery,
} from '../../../api/services NodeJs/jdManagementApi';
import '../../../styles/userRegistration.css';

const Users = () => {
  // Fetch dropdown data
  const { data: userMemberTypesData } = useGetUserMemberTypesQuery();
  const userMemberTypes = userMemberTypesData?.data || [];

  const { data: userJobRolesData } = useGetUserJobRolesQuery();
  const userJobRoles = userJobRolesData?.data || [];

  const { data: userLevelsData } = useGetUserLevelsQuery();
  const userLevels = userLevelsData?.data || [];

  // External user fields
  const { data: groupsData } = useGetGroupsQuery();
  // Handle both wrapped and direct array responses
  const groups = Array.isArray(groupsData?.data) ? groupsData.data : (Array.isArray(groupsData) ? groupsData : []);

  const { data: plantationsData } = useGetPlantationsQuery();
  const plantations = Array.isArray(plantationsData?.data) ? plantationsData.data : (Array.isArray(plantationsData) ? plantationsData : []);

  const { data: regionsData } = useGetRegionsQuery();
  const regions = Array.isArray(regionsData?.data) ? regionsData.data : (Array.isArray(regionsData) ? regionsData : []);

  const { data: estatesData } = useGetEstatesQuery();
  const estates = Array.isArray(estatesData?.data) ? estatesData.data : (Array.isArray(estatesData) ? estatesData : []);

  // Debug logs
  console.log('Groups Data:', groupsData);
  console.log('Groups:', groups);
  console.log('Plantations Data:', plantationsData);
  console.log('Plantations:', plantations);
  console.log('Regions Data:', regionsData);
  console.log('Regions:', regions);
  console.log('Estates Data:', estatesData);
  console.log('Estates:', estates);

  // Mutations
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  // State
  const [userType, setUserType] = useState(''); // 'i' for internal, 'e' for external
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSearchingEmployee, setIsSearchingEmployee] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nic: '',
    mobile_no: '',
    password: '',
    confirmPassword: '',
    member_type: '',
    job_role: '',
    user_level: 'g',
    employeeId: null, // Link to employees table
    sect_command: '0',
    activated: '1',
    image: null, // Profile picture file
    // External user fields
    group: '',
    plantation: '',
    region: '',
    estate: '',
    // Driver fields (only if job_role='dri')
    driver_license_no: '',
    driver_license_front_image: null,
    driver_license_back_image: null,
  });

  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search employee query (only when userType is 'i' and searchTerm is provided)
  const { data: employeeSearchResult, isLoading: searchingEmployee } = useSearchEmployeeQuery(
    { searchTerm: employeeSearchTerm },
    { skip: !employeeSearchTerm || userType !== 'i' || !isSearchingEmployee }
  );

  // Auto-fill form when employee is found
  useEffect(() => {
    if (employeeSearchResult?.status && employeeSearchResult?.data && isSearchingEmployee) {
      const employee = employeeSearchResult.data;
      setSelectedEmployee(employee);
      
      // employee.employeeJobRole and employee.jobRoleLayer are now codes, not IDs
      // Use the codes directly from employee data
      const jobRoleCode = employee.employeeJobRole || '';
      const userLevelCode = employee.jobRoleLayer || 'g';
      
      // Auto-fill form with employee data
      setFormData(prev => ({
        ...prev,
        name: employee.employeeName || employee.preferredName || '',
        email: employee.companyEmailAddress || employee.emailAddress || '',
        nic: employee.nic || '',
        mobile_no: employee.mobileNumber || '',
        employeeId: employee.id,
        // Map job details from employee - use codes directly (they're already codes now)
        job_role: jobRoleCode, // employee.employeeJobRole is now jdCode
        user_level: userLevelCode, // employee.jobRoleLayer is now levelCode
        member_type: employee.employeeType || 'i', // employee.employeeType is already a code (e.g., 'i')
      }));
      
      setIsSearchingEmployee(false);
      setSubmitMessage({ 
        type: 'success', 
        text: 'Employee data loaded successfully. Job details have been auto-filled. Please review and complete remaining fields.' 
      });
    } else if (employeeSearchResult?.status === false && isSearchingEmployee) {
      setSubmitMessage({ 
        type: 'error', 
        text: 'Employee not found. Please check the NIC or Employee Number.' 
      });
      setIsSearchingEmployee(false);
    }
  }, [employeeSearchResult, isSearchingEmployee, userJobRoles, userLevels]);

  const handleUserTypeChange = (e) => {
    const newUserType = e.target.value;
    setUserType(newUserType);
    setFormData(prev => ({
      ...prev,
      member_type: newUserType,
      employeeId: null, // Reset employee link when changing type
      // Clear job details if switching from internal to external
      ...(newUserType === 'e' && {
        job_role: '',
        user_level: 'g',
        group: '',
        plantation: '',
        region: '',
        estate: '',
      }),
      // Clear external fields if switching to internal
      ...(newUserType === 'i' && {
        group: '',
        plantation: '',
        region: '',
        estate: '',
      })
    }));
    setSelectedEmployee(null);
    setEmployeeSearchTerm('');
    setSubmitMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    // Handle file inputs
    if (e.target.type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files && files.length > 0 ? files[0] : null,
      }));
      return;
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value || '',
      };
      
      // Handle cascading dropdowns for external user fields - AUTO-POPULATE PARENT FIELDS
      if (name === 'estate' && value) {
        // When estate is selected, auto-populate group, plantation, and region
        const selectedEstate = estates.find(e => e.id === parseInt(value));
        if (selectedEstate) {
          if (selectedEstate.group) newData.group = String(selectedEstate.group);
          if (selectedEstate.plantation) newData.plantation = String(selectedEstate.plantation);
          if (selectedEstate.region) newData.region = String(selectedEstate.region);
        }
      } else if (name === 'region' && value) {
        // When region is selected, auto-populate group and plantation
        const selectedRegion = regions.find(r => r.id === parseInt(value));
        if (selectedRegion) {
          if (selectedRegion.group) newData.group = String(selectedRegion.group);
          if (selectedRegion.plantation) newData.plantation = String(selectedRegion.plantation);
        }
        // Reset estate when region changes
        newData.estate = '';
      } else if (name === 'plantation' && value) {
        // When plantation is selected, auto-populate group
        const selectedPlantation = plantations.find(p => p.id === parseInt(value));
        if (selectedPlantation && selectedPlantation.group) {
          newData.group = String(selectedPlantation.group);
        }
        // Reset dependent fields when plantation changes
        newData.region = '';
        newData.estate = '';
      } else if (name === 'group') {
        // Reset dependent fields when group changes
        newData.plantation = '';
        newData.region = '';
        newData.estate = '';
      }
      
      return newData;
    });
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
    }));
  };

  const handleSearchEmployee = async () => {
    if (!employeeSearchTerm.trim()) {
      setSubmitMessage({ type: 'error', text: 'Please enter NIC or Employee Number' });
      return;
    }
    setIsSearchingEmployee(true);
    setSubmitMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: '', text: '' });
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.nic || !formData.mobile_no) {
      setSubmitMessage({ type: 'error', text: 'Name, NIC, and Mobile Number are required' });
      setIsSubmitting(false);
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setSubmitMessage({ type: 'error', text: 'Passwords do not match' });
      setIsSubmitting(false);
      return;
    }

    if (!userType) {
      setSubmitMessage({ type: 'error', text: 'Please select user type (Internal/External)' });
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare submission data (exclude confirmPassword)
      const { confirmPassword, image, ...submissionData } = formData;
      
      // Only include external user fields if user is external
      if (userType !== 'e') {
        delete submissionData.group;
        delete submissionData.plantation;
        delete submissionData.region;
        delete submissionData.estate;
      } else {
        // Convert empty strings to null for external fields
        if (!submissionData.group) submissionData.group = null;
        if (!submissionData.plantation) submissionData.plantation = null;
        if (!submissionData.region) submissionData.region = null;
        if (!submissionData.estate) submissionData.estate = null;
      }
      
      // If image is present, use FormData, otherwise use JSON
      let dataToSend;
      if (image) {
        const formDataToSend = new FormData();
        
        // Append all form fields
        Object.keys(submissionData).forEach(key => {
          const value = submissionData[key];
          if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'object' && !(value instanceof File)) {
              formDataToSend.append(key, JSON.stringify(value));
            } else {
              formDataToSend.append(key, value);
            }
          }
        });
        
        // Append image file
        formDataToSend.append('image', image);
        
        dataToSend = formDataToSend;
      } else {
        dataToSend = submissionData;
      }
      
      const result = await createUser(dataToSend).unwrap();

      if (result.status) {
        setSubmitMessage({ 
          type: 'success', 
          text: result.message || 'User registered successfully!' 
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          nic: '',
          mobile_no: '',
          password: '',
          confirmPassword: '',
          member_type: '',
          job_role: '',
          user_level: 'g',
          employeeId: null,
          sect_command: '0',
          activated: '1',
          image: null,
          group: '',
          plantation: '',
          region: '',
          estate: '',
          driver_license_no: '',
          driver_license_front_image: null,
          driver_license_back_image: null,
        });
        setUserType('');
        setSelectedEmployee(null);
        setEmployeeSearchTerm('');
      }
    } catch (error) {
      setSubmitMessage({ 
        type: 'error', 
        text: error?.data?.message || error?.message || 'Failed to register user' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-registration-container">
      <h1 className="registration-title">ICT · System Admin · User Registration</h1>

      <div className="registration-form-content">
        <form onSubmit={handleSubmit}>
          {/* User Type Selection */}
          <div className="form-section">
            <h2 className="section-title">User Type</h2>
            <div className="form-row">
              <div className="form-group full-width">
                <label>User Type: <span style={{ color: 'red' }}>*</span></label>
                <select
                  name="userType"
                  value={userType}
                  onChange={handleUserTypeChange}
                  required
                >
                  <option value="">-- Select User Type --</option>
                  {userMemberTypes.map((type) => (
                    <option key={type.id} value={type.typeCode}>
                      {type.memberType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employee Search (only for Internal users) */}
            {userType === 'i' && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Search Employee (NIC or Employee Number):</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      placeholder="Enter NIC or Employee Number (e.g., EMP001)"
                      style={{ flex: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchEmployee();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSearchEmployee}
                      disabled={searchingEmployee || !employeeSearchTerm.trim()}
                      className="btn-search"
                    >
                      {searchingEmployee ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                  {selectedEmployee && (
                    <div className="employee-info-box">
                      <p><strong>Employee Found:</strong> {selectedEmployee.employeeName} ({selectedEmployee.empNo})</p>
                      <p>Data has been auto-filled below. Please complete remaining fields.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="form-section">
            <h2 className="section-title">User Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name: <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>NIC: <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter NIC number"
                  disabled={!!selectedEmployee}
                  style={selectedEmployee ? { backgroundColor: '#f5f5f5' } : {}}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number: <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter mobile number"
                  disabled={!!selectedEmployee}
                  style={selectedEmployee ? { backgroundColor: '#f5f5f5' } : {}}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password (optional)"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Profile Picture:</label>
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleInputChange}
                />
                {formData.image && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      backgroundColor: '#f0f4f8',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}>
                      <span style={{ flex: 1, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formData.image.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          marginLeft: '8px',
                          padding: '2px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="form-section">
            <h2 className="section-title">Job Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Job Role:</label>
                <select
                  name="job_role"
                  value={formData.job_role}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select --</option>
                  {userJobRoles
                    .filter(role => role.status === 1)
                    .map((role) => (
                      <option key={role.id} value={role.jdCode || role.id}>
                        {role.designation}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>User Level:</label>
                <select
                  name="user_level"
                  value={formData.user_level}
                  onChange={handleInputChange}
                >
                  <option value="g">Guest User</option>
                  {userLevels.map((level) => (
                    <option key={level.id} value={level.levelCode || level.id}>
                      {level.userLevel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status:</label>
                <select
                  name="activated"
                  value={formData.activated}
                  onChange={handleInputChange}
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Driver Information (only if job_role='dri') */}
          {formData.job_role === 'dri' && (
            <div className="form-section">
              <h2 className="section-title">Driver Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Driver License No:</label>
                  <input
                    type="text"
                    name="driver_license_no"
                    value={formData.driver_license_no}
                    onChange={handleInputChange}
                    placeholder="Enter driver license number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Driver License Front Image:</label>
                  <input
                    type="file"
                    name="driver_license_front_image"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setFormData(prev => ({ ...prev, driver_license_front_image: file || null }));
                    }}
                  />
                  {formData.driver_license_front_image && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Selected: {formData.driver_license_front_image.name}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Driver License Back Image:</label>
                  <input
                    type="file"
                    name="driver_license_back_image"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setFormData(prev => ({ ...prev, driver_license_back_image: file || null }));
                    }}
                  />
                  {formData.driver_license_back_image && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Selected: {formData.driver_license_back_image.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* External User Fields (Group, Plantation, Region, Estate) */}
          {userType === 'e' && (
            <div className="form-section">
              <h2 className="section-title">Plantation Details</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Group:</label>
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Group --</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.group}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Plantation:</label>
                  <select
                    name="plantation"
                    value={formData.plantation}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Plantation --</option>
                    {plantations
                      .filter(p => !formData.group || p.group === parseInt(formData.group))
                      .map((plantation) => (
                        <option key={plantation.id} value={plantation.id}>
                          {plantation.plantation}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Region:</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Region --</option>
                    {regions
                      .filter(r => {
                        if (formData.group && r.group !== parseInt(formData.group)) return false;
                        if (formData.plantation && r.plantation !== parseInt(formData.plantation)) return false;
                        return true;
                      })
                      .map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.region}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estate:</label>
                  <select
                    name="estate"
                    value={formData.estate}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Estate --</option>
                    {estates
                      .filter(e => {
                        // Filter by group if selected
                        if (formData.group && e.group !== parseInt(formData.group)) return false;
                        // Filter by plantation if selected
                        if (formData.plantation && e.plantation !== parseInt(formData.plantation)) return false;
                        // Filter by region if selected
                        if (formData.region && e.region !== parseInt(formData.region)) return false;
                        return true;
                      })
                      .map((estate) => (
                        <option key={estate.id} value={estate.id}>
                          {estate.estate}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-buttons">
            <button
              type="submit"
              disabled={isSubmitting || isCreating}
              className="btn-submit"
            >
              {isSubmitting || isCreating ? 'Registering...' : 'Register User'}
            </button>
          </div>

          {/* Message Display */}
          {submitMessage.text && (
            <div className={`message ${submitMessage.type}`}>
              {submitMessage.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Users;
