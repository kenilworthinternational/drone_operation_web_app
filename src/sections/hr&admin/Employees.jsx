import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  useGetAllEmployeeRegistrationsQuery, 
  useGetEmployeeRegistrationByIdQuery,
  useUpdateEmployeeRegistrationMutation,
  useGetUserMemberTypesQuery,
  useGetUserJobRolesQuery,
  useGetUserLevelsQuery,
  useGetWingsQuery,
  useGetDrivingLicenseTypesQuery,
  useGetWorkLocationsQuery,
  useGetDSCSQuery,
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetASCSQuery,
} from '../../api/services NodeJs/jdManagementApi';
import '../../styles/employees.css';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch dropdown data (same as EmployeeRegistration)
  const { data: userMemberTypesData } = useGetUserMemberTypesQuery();
  const userMemberTypes = userMemberTypesData?.data || [];
  
  const { data: userJobRolesData, isLoading: loadingJobRoles } = useGetUserJobRolesQuery();
  const userJobRoles = userJobRolesData?.data || [];
  
  const { data: userLevelsData, isLoading: loadingLevels } = useGetUserLevelsQuery();
  const userLevels = userLevelsData?.data || [];
  
  const { data: wingsData, isLoading: loadingWings } = useGetWingsQuery();
  const wings = useMemo(() => {
    if (!wingsData) return [];
    if (Array.isArray(wingsData)) return wingsData;
    if (wingsData.data && Array.isArray(wingsData.data)) return wingsData.data;
    if (wingsData.wings && Array.isArray(wingsData.wings)) return wingsData.wings;
    return [];
  }, [wingsData]);
  
  const { data: drivingLicenseTypesData } = useGetDrivingLicenseTypesQuery();
  const drivingLicenseTypes = drivingLicenseTypesData?.data || [];
  
  const { data: workLocationsData } = useGetWorkLocationsQuery();
  const workLocations = useMemo(() => {
    if (!workLocationsData) return [];
    if (Array.isArray(workLocationsData)) return workLocationsData;
    if (workLocationsData.data && Array.isArray(workLocationsData.data)) return workLocationsData.data;
    return [];
  }, [workLocationsData]);
  
  const { data: provincesData } = useGetProvincesQuery();
  const provinces = useMemo(() => {
    if (!provincesData) return [];
    if (Array.isArray(provincesData)) return provincesData;
    if (provincesData.data && Array.isArray(provincesData.data)) return provincesData.data;
    return [];
  }, [provincesData]);
  
  const { data: districtsData } = useGetDistrictsQuery();
  const districts = useMemo(() => {
    if (!districtsData) return [];
    if (Array.isArray(districtsData)) return districtsData;
    if (districtsData.data && Array.isArray(districtsData.data)) return districtsData.data;
    return [];
  }, [districtsData]);
  
  const { data: dscsData } = useGetDSCSQuery();
  const dscs = useMemo(() => {
    if (!dscsData) return [];
    if (Array.isArray(dscsData)) return dscsData;
    if (dscsData.data && Array.isArray(dscsData.data)) return dscsData.data;
    return [];
  }, [dscsData]);
  
  const { data: ascsData } = useGetASCSQuery({
    districtId: formData.district || undefined,
    dscsId: formData.divisionalSecretariats || undefined,
  }, { skip: !formData.district && !formData.divisionalSecretariats });
  const ascs = useMemo(() => {
    if (!ascsData) return [];
    if (Array.isArray(ascsData)) return ascsData;
    if (ascsData.data && Array.isArray(ascsData.data)) return ascsData.data;
    return [];
  }, [ascsData]);
  
  const [updateEmployeeRegistration] = useUpdateEmployeeRegistrationMutation();

  // Fetch all employees
  const { data: employeesData, isLoading, error, refetch: refetchEmployees } = useGetAllEmployeeRegistrationsQuery();
  const employees = employeesData?.data || [];

      // Fetch selected employee details
  const { data: employeeDetailsData, refetch: refetchEmployeeDetails } = useGetEmployeeRegistrationByIdQuery(
    { id: selectedEmployeeId },
    { skip: !selectedEmployeeId }
  );
  const employeeDetails = employeeDetailsData?.data;

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) {
      return employees;
    }

    const searchLower = searchTerm.toLowerCase();
    return employees.filter(employee => {
      return (
        (employee.employeeName && employee.employeeName.toLowerCase().includes(searchLower)) ||
        (employee.empNo && employee.empNo.toLowerCase().includes(searchLower)) ||
        (employee.nic && employee.nic.toLowerCase().includes(searchLower)) ||
        (employee.emailAddress && employee.emailAddress.toLowerCase().includes(searchLower)) ||
        (employee.mobileNumber && employee.mobileNumber.includes(searchTerm)) ||
        (employee.employeeJobRoleName && employee.employeeJobRoleName.toLowerCase().includes(searchLower)) ||
        (employee.departmentName && employee.departmentName.toLowerCase().includes(searchLower))
      );
    });
  }, [employees, searchTerm]);

  // Initialize form data when employee details are loaded
  useEffect(() => {
    if (employeeDetails) {
      // Parse drivingLicenseType if it's a string
      let drivingLicenseTypeArray = [];
      if (employeeDetails.drivingLicenseType) {
        if (typeof employeeDetails.drivingLicenseType === 'string') {
          try {
            if (employeeDetails.drivingLicenseType.includes(',')) {
              drivingLicenseTypeArray = employeeDetails.drivingLicenseType.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            } else {
              const parsed = JSON.parse(employeeDetails.drivingLicenseType);
              if (Array.isArray(parsed)) {
                drivingLicenseTypeArray = parsed;
              }
            }
          } catch (e) {
            // If parsing fails, try as single value
            const singleId = parseInt(employeeDetails.drivingLicenseType);
            if (!isNaN(singleId)) {
              drivingLicenseTypeArray = [singleId];
            }
          }
        } else if (Array.isArray(employeeDetails.drivingLicenseType)) {
          drivingLicenseTypeArray = employeeDetails.drivingLicenseType;
        }
      }
      
      // Find IDs for dropdown fields that store codes or names
      const employeeJobRoleId = employeeDetails.employeeJobRole 
        ? userJobRoles.find(r => r.jdCode === employeeDetails.employeeJobRole)?.id || ''
        : '';
      const jobRoleLayerId = employeeDetails.jobRoleLayer
        ? userLevels.find(l => l.levelCode === employeeDetails.jobRoleLayer)?.id || ''
        : '';
      const departmentId = employeeDetails.department
        ? wings.find(w => w.wingsCode === employeeDetails.department)?.id || ''
        : '';
      const workLocationId = employeeDetails.workLocation
        ? workLocations.find(l => l.locationCode === employeeDetails.workLocation)?.id || ''
        : '';
      
      // Find province ID (if stored as name, find by name; if stored as ID, use as is)
      const provinceId = employeeDetails.province
        ? (provinces.find(p => p.id === employeeDetails.province || String(p.id) === String(employeeDetails.province))?.id ||
           provinces.find(p => p.province === employeeDetails.province)?.id ||
           employeeDetails.province)
        : '';
      
      // Find district ID (if stored as name, find by name; if stored as ID, use as is)
      const districtId = employeeDetails.district
        ? (districts.find(d => d.id === employeeDetails.district || String(d.id) === String(employeeDetails.district))?.id ||
           districts.find(d => d.district === employeeDetails.district)?.id ||
           employeeDetails.district)
        : '';
      
      // Find divisional secretariats ID (stored as ID)
      const divisionalSecretariatsId = employeeDetails.divisionalSecretariats || '';
      
      // Find ASC ID (stored in ascsId)
      const ascId = employeeDetails.ascsId || '';
      
      setFormData({
        employeeName: employeeDetails.employeeName || '',
        preferredName: employeeDetails.preferredName || '',
        nic: employeeDetails.nic || '',
        drivingLicense: employeeDetails.drivingLicense || '',
        drivingLicenseType: drivingLicenseTypeArray,
        race: employeeDetails.race || '',
        religion: employeeDetails.religion || '',
        gender: employeeDetails.gender || '',
        dob: employeeDetails.dob ? employeeDetails.dob.split('T')[0] : '',
        permanentAddress: employeeDetails.permanentAddress || '',
        temporaryAddress: employeeDetails.temporaryAddress || '',
        telephoneHome: employeeDetails.telephoneHome || '',
        mobileNumber: employeeDetails.mobileNumber || '',
        emailAddress: employeeDetails.emailAddress || '',
        companyEmailAddress: employeeDetails.companyEmailAddress || '',
        maritalStatus: employeeDetails.maritalStatus || '',
        spouseName: employeeDetails.spouseName || '',
        noOfChildren: employeeDetails.noOfChildren || '',
        emergencyContactName: employeeDetails.emergencyContactName || '',
        emergencyContactRelationship: employeeDetails.emergencyContactRelationship || '',
        emergencyContactNumber: employeeDetails.emergencyContactNumber || '',
        province: provinceId,
        district: districtId,
        divisionalSecretariats: divisionalSecretariatsId,
        asc: ascId,
        policeStation: employeeDetails.policeStation || '',
        employeeType: employeeDetails.employeeType || 'i',
        employeeJobRole: employeeJobRoleId,
        appointmentDate: employeeDetails.appointmentDate ? employeeDetails.appointmentDate.split('T')[0] : '',
        department: departmentId,
        jobRoleLayer: jobRoleLayerId,
        workStatus: employeeDetails.workStatus || '',
        permanentDate: employeeDetails.permanentDate ? employeeDetails.permanentDate.split('T')[0] : '',
        workLocation: workLocationId,
        educationCertificates: null,
        birthCertificate: null,
        healthReport: null,
        serviceLetters: null,
        marriedCertificate: null,
        policeReport: null,
        gndCertificate: null,
      });
    }
  }, [employeeDetails, isEditMode, userJobRoles, userLevels, wings, workLocations, provinces, districts]);

  const handleViewEmployee = (id) => {
    setSelectedEmployeeId(id);
    setShowViewModal(true);
    setIsEditMode(false);
  };

  const handleEditEmployee = () => {
    // Ensure form data is initialized before entering edit mode
    if (employeeDetails && Object.keys(formData).length === 0) {
      // Form data will be initialized by useEffect, wait a bit then enable edit mode
      setTimeout(() => {
        setIsEditMode(true);
      }, 200);
    } else {
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Form data will be reset by useEffect when isEditMode changes
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      if (name === 'educationCertificates' || name === 'serviceLetters') {
        setFormData(prev => ({
          ...prev,
          [name]: files && files.length > 0 ? files : null
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: files && files.length > 0 ? files[0] : null
        }));
      }
    } else {
      setFormData(prev => {
        const updates = { [name]: value || '' };
        
        // Handle cascading dropdowns
        if (name === 'province') {
          updates.district = '';
          updates.divisionalSecretariats = '';
          updates.asc = '';
        }
        if (name === 'district') {
          updates.divisionalSecretariats = '';
          updates.asc = '';
        }
        if (name === 'divisionalSecretariats') {
          updates.asc = '';
        }
        if (name === 'drivingLicense' && value === 'No') {
          updates.drivingLicenseType = [];
        }
        
        return { ...prev, ...updates };
      });
    }
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmployeeId) return;
    
    setIsSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', selectedEmployeeId);
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'drivingLicenseType') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (!['educationCertificates', 'birthCertificate', 'healthReport', 'serviceLetters', 'marriedCertificate', 'policeReport', 'gndCertificate'].includes(key)) {
          formDataToSend.append(key, formData[key] || '');
        }
      });
      
      // Add files
      if (formData.educationCertificates) {
        Array.from(formData.educationCertificates).forEach(file => {
          formDataToSend.append('educationCertificates', file);
        });
      }
      if (formData.birthCertificate) {
        formDataToSend.append('birthCertificate', formData.birthCertificate);
      }
      if (formData.healthReport) {
        formDataToSend.append('healthReport', formData.healthReport);
      }
      if (formData.serviceLetters) {
        Array.from(formData.serviceLetters).forEach(file => {
          formDataToSend.append('serviceLetters', file);
        });
      }
      if (formData.marriedCertificate) {
        formDataToSend.append('marriedCertificate', formData.marriedCertificate);
      }
      if (formData.policeReport) {
        formDataToSend.append('policeReport', formData.policeReport);
      }
      if (formData.gndCertificate) {
        formDataToSend.append('gndCertificate', formData.gndCertificate);
      }
      
      const result = await updateEmployeeRegistration(formDataToSend).unwrap();
      
      if (result.status) {
        alert('Employee updated successfully!');
        setIsEditMode(false);
        // Refetch employee details and list
        await refetchEmployeeDetails();
        await refetchEmployees();
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert(error?.data?.message || 'Failed to update employee. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedEmployeeId(null);
    setIsEditMode(false);
    setFormData({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

  // Get API base URL
  const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'https://dsms-web-api-dev.kenilworthinternational.com';
    }
    
    if (hostname.includes('dev')) {
      return 'https://dsms-web-api-dev.kenilworthinternational.com';
    }
    
    if (hostname.includes('test')) {
      return 'https://dsms-api-test.kenilworth.international.com';
    }
    
    return 'https://dsms-web-api.kenilworthinternational.com';
  };

  // Build document URL from filename or use URL if already provided
  const getDocumentUrl = (filename, documentType) => {
    if (!filename) return null;
    
    // If it's already a full URL, use it directly (backend should return full URLs)
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // Extract just the filename if path is provided
    let cleanFilename = filename.split('/').pop();
    
    // Map document types to folder names (matching backend upload structure)
    // Format: /documents/employees/{folder}/{filename}
    const folderMap = {
      educationCertificates: 'education_certificates',
      birthCertificate: 'birth_certificate',
      healthReport: 'health_report',
      serviceLetters: 'service_letters',
      marriedCertificate: 'married_certificate',
      policeReport: 'police_report',
      gndCertificate: 'gnd_certificate'
    };
    
    const folder = folderMap[documentType] || 'documents';
    const baseUrl = getApiBaseUrl();
    
    // Build URL with correct path structure
    // Format: https://dsms-web-api-dev.kenilworthinternational.com/documents/employees/{folder}/{filename}
    return `${baseUrl}/documents/employees/${folder}/${cleanFilename}`;
  };

  const getStatusBadge = (status) => {
    if (status === 'p') {
      return <span className="status-badge-emp-view status-pending-emp-view">Pending</span>;
    } else if (status === 'f') {
      return <span className="status-badge-emp-view status-forwarded-emp-view">Forwarded</span>;
    }
    return <span className="status-badge-emp-view">{status || 'N/A'}</span>;
  };

  // Helper to render field (view or edit mode)
  const renderField = (label, name, value, type = 'text', options = null, isTextarea = false) => {
    if (isEditMode) {
      if (type === 'select' && options) {
        return (
          <div className="detail-item-emp-view">
            <label>{label}:</label>
            <select
              name={name}
              value={formData[name] || ''}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            >
              <option value="">-- Select --</option>
              {options.map((option, index) => {
                const optionValue = option.value || option.id;
                const optionKey = optionValue !== undefined && optionValue !== null 
                  ? `${name}-${optionValue}` 
                  : `${name}-option-${index}`;
                return (
                  <option key={optionKey} value={optionValue || ''}>
                    {option.label || option.name || option.designation || option.wing || option.locationName || option.province || option.district || option.dscs || option.asc || option.userLevel}
                  </option>
                );
              })}
            </select>
          </div>
        );
      } else if (isTextarea) {
        return (
          <div className="detail-item-emp-view full-width-emp-view">
            <label>{label}:</label>
            <textarea
              name={name}
              value={formData[name] || ''}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '4px', minHeight: '80px' }}
            />
          </div>
        );
      } else {
        return (
          <div className="detail-item-emp-view">
            <label>{label}:</label>
            <input
              type={type}
              name={name}
              value={formData[name] || ''}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
        );
      }
    } else {
      // View mode - look up display name if options are provided
      let displayValue = value || 'N/A';
      if (type === 'select' && options && value && value !== 'N/A') {
        const selectedOption = options.find(opt => {
          const optValue = opt.value !== undefined ? opt.value : opt.id;
          // Compare both as strings and as numbers to handle type mismatches
          return optValue === value || 
                 String(optValue) === String(value) || 
                 String(optValue) === value ||
                 optValue === String(value);
        });
        if (selectedOption) {
          displayValue = selectedOption.label || selectedOption.name || selectedOption.designation || 
                        selectedOption.wing || selectedOption.locationName || selectedOption.province || 
                        selectedOption.district || selectedOption.dse || selectedOption.ascs || 
                        selectedOption.userLevel || value;
        }
      }
      return (
        <div className="detail-item-emp-view">
          <label>{label}:</label>
          <span>{displayValue}</span>
        </div>
      );
    }
  };

  return (
    <div className="employees-container-emp-view">
      {/* Search Bar */}
      <div className="employees-search-bar-emp-view">
        <div className="employees-search-wrapper-emp-view">
          <span className="employees-search-icon-emp-view">🔍</span>
          <input
            type="text"
            placeholder="Search by name, employee number, NIC, email, mobile, job role, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="employees-search-input-emp-view"
          />
          {searchTerm && (
            <button
              className="employees-search-clear-emp-view"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="employees-loading-emp-view">
          <p>Loading employees...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="employees-error-emp-view">
          <p>Error loading employees: {error?.data?.message || error?.message || 'Unknown error'}</p>
        </div>
      )}

      {/* Employees Table */}
      {!isLoading && !error && (
        <div className="employees-table-wrapper-emp-view">
          {filteredEmployees.length === 0 ? (
            <div className="employees-empty-state-emp-view">
              <div className="employees-empty-icon-emp-view">📋</div>
              <h3 className="employees-empty-title-emp-view">
                {searchTerm ? 'No employees found' : 'No employees registered yet'}
              </h3>
              <p className="employees-empty-message-emp-view">
                {searchTerm 
                  ? 'Try adjusting your search criteria to find employees.' 
                  : 'Start by registering new employees to see them here.'}
              </p>
            </div>
          ) : (
            <div className="employees-table-container-emp-view">
              <table className="employees-table-emp-view">
                <thead>
                  <tr>
                    <th>EMP NO</th>
                    <th>Name</th>
                    <th>NIC</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Job Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="employees-table-row-emp-view">
                      <td className="employees-table-cell-emp-view employees-empno-emp-view">
                        <span className="employees-cell-label-emp-view">EMP NO</span>
                        <span className="employees-cell-value-emp-view">{employee.empNo || 'N/A'}</span>
                      </td>
                      <td className="employees-table-cell-emp-view employees-name-emp-view">
                        <span className="employees-cell-label-emp-view">Name</span>
                        <span className="employees-cell-value-emp-view employees-name-value-emp-view">
                          {employee.employeeName || 'N/A'}
                        </span>
                      </td>
                      <td className="employees-table-cell-emp-view">
                        <span className="employees-cell-label-emp-view">NIC</span>
                        <span className="employees-cell-value-emp-view">{employee.nic || 'N/A'}</span>
                      </td>
                      <td className="employees-table-cell-emp-view">
                        <span className="employees-cell-label-emp-view">Mobile</span>
                        <span className="employees-cell-value-emp-view">{employee.mobileNumber || 'N/A'}</span>
                      </td>
                      <td className="employees-table-cell-emp-view employees-email-emp-view">
                        <span className="employees-cell-label-emp-view">Email</span>
                        <span className="employees-cell-value-emp-view">{employee.emailAddress || 'N/A'}</span>
                      </td>
                      <td className="employees-table-cell-emp-view">
                        <span className="employees-cell-label-emp-view">Job Role</span>
                        <span className="employees-cell-value-emp-view">{employee.employeeJobRoleName || 'N/A'}</span>
                      </td>
                      <td className="employees-table-cell-emp-view">
                        <span className="employees-cell-label-emp-view">Department</span>
                        <span className="employees-cell-value-emp-view">{employee.departmentName || 'N/A'}</span>
                      </td>
                      <td className="employees-table-cell-emp-view employees-status-cell-emp-view">
                        <span className="employees-cell-label-emp-view">Status</span>
                        <span className="employees-cell-value-emp-view">{getStatusBadge(employee.status)}</span>
                      </td>
                      <td className="employees-table-cell-emp-view employees-actions-cell-emp-view">
                        <span className="employees-cell-label-emp-view">Actions</span>
                        <button
                          className="btn-view-employee-emp-view"
                          onClick={() => handleViewEmployee(employee.id)}
                          title="View employee details"
                        >
                          <span className="btn-view-icon-emp-view">👁️</span>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && employeeDetails && (
        <div className="employee-modal-overlay-emp-view" onClick={handleCloseModal}>
          <div className="employee-modal-content-emp-view" onClick={(e) => e.stopPropagation()}>
            <div className="employee-modal-header-emp-view">
              <h2>{isEditMode ? 'Edit Employee' : 'Employee Details'}</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {!isEditMode && (
                  <button 
                    className="btn-view-employee-emp-view" 
                    onClick={handleEditEmployee}
                    style={{ 
                      marginRight: '10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                    title="Edit employee details"
                  >
                    ✏️ Edit
                  </button>
                )}
                <button className="employee-modal-close-emp-view" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
            </div>
            <div className="employee-modal-body-emp-view">
              <div className="employee-details-section-emp-view">
                <h3>Employee Information</h3>
                <div className="employee-details-grid-emp-view">
                  {isEditMode ? (
                    <>
                      <div className="detail-item-emp-view">
                        <label>Employee Number:</label>
                        <span>{employeeDetails.empNo || 'N/A'}</span>
                      </div>
                      {renderField('Full Name', 'employeeName', employeeDetails.employeeName)}
                      {renderField('Preferred Name', 'preferredName', employeeDetails.preferredName)}
                      {renderField('NIC', 'nic', employeeDetails.nic)}
                      {renderField('Date of Birth', 'dob', formatDate(employeeDetails.dob), 'date')}
                      {renderField('Gender', 'gender', employeeDetails.gender, 'select', [
                        { value: '', label: '-- Select --' },
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Other', label: 'Other' }
                      ])}
                      {renderField('Race', 'race', employeeDetails.race, 'select', [
                        { value: '', label: '-- Select --' },
                        { value: 'Sinhalese', label: 'Sinhalese' },
                        { value: 'Tamil', label: 'Tamil' },
                        { value: 'Muslim', label: 'Muslim' },
                        { value: 'Burgher', label: 'Burgher' },
                        { value: 'Other', label: 'Other' }
                      ])}
                      {renderField('Religion', 'religion', employeeDetails.religion, 'select', [
                        { value: '', label: '-- Select --' },
                        { value: 'Buddhist', label: 'Buddhist' },
                        { value: 'Hindu', label: 'Hindu' },
                        { value: 'Christian', label: 'Christian' },
                        { value: 'Muslim', label: 'Muslim' },
                        { value: 'Other', label: 'Other' }
                      ])}
                      {renderField('Driving License', 'drivingLicense', employeeDetails.drivingLicense, 'select', [
                        { value: '', label: '-- Select --' },
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                      ])}
                      {formData.drivingLicense === 'Yes' && (
                        <div className="detail-item-emp-view full-width-emp-view">
                          <label>Driving License Type:</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                            {drivingLicenseTypes.map((type) => (
                              <label key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                  type="checkbox"
                                  checked={(formData.drivingLicenseType || []).includes(type.id)}
                                  onChange={() => {
                                    const current = formData.drivingLicenseType || [];
                                    const updated = current.includes(type.id)
                                      ? current.filter(id => id !== type.id)
                                      : [...current, type.id];
                                    setFormData(prev => ({ ...prev, drivingLicenseType: updated }));
                                  }}
                                />
                                {type.type}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="detail-item-emp-view">
                        <label>Employee Number:</label>
                        <span>{employeeDetails.empNo || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Full Name:</label>
                        <span>{employeeDetails.employeeName || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Preferred Name:</label>
                        <span>{employeeDetails.preferredName || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>NIC:</label>
                        <span>{employeeDetails.nic || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Date of Birth:</label>
                        <span>{formatDate(employeeDetails.dob)}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Gender:</label>
                        <span>{employeeDetails.gender || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Race:</label>
                        <span>{employeeDetails.race || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Religion:</label>
                        <span>{employeeDetails.religion || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Driving License:</label>
                        <span>{employeeDetails.drivingLicense || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Driving License Type:</label>
                        <span>
                          {employeeDetails.drivingLicenseType 
                            ? (typeof employeeDetails.drivingLicenseType === 'string' 
                              ? employeeDetails.drivingLicenseType 
                              : JSON.stringify(employeeDetails.drivingLicenseType))
                            : 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="employee-details-section-emp-view">
                <h3>Contact Information</h3>
                <div className="employee-details-grid-emp-view">
                  {renderField('Mobile Number', 'mobileNumber', employeeDetails.mobileNumber)}
                  {renderField('Telephone (Home)', 'telephoneHome', employeeDetails.telephoneHome)}
                  {renderField('Email Address', 'emailAddress', employeeDetails.emailAddress, 'email')}
                  {renderField('Company Email', 'companyEmailAddress', employeeDetails.companyEmailAddress, 'email')}
                  {renderField('Permanent Address', 'permanentAddress', employeeDetails.permanentAddress, 'text', null, true)}
                  {renderField('Temporary Address', 'temporaryAddress', employeeDetails.temporaryAddress, 'text', null, true)}
                </div>
              </div>

              <div className="employee-details-section-emp-view">
                <h3>Family Details</h3>
                <div className="employee-details-grid-emp-view">
                  {renderField('Marital Status', 'maritalStatus', employeeDetails.maritalStatus, 'select', [
                    { value: '', label: '-- Select --' },
                    { value: 'Single', label: 'Single' },
                    { value: 'Married', label: 'Married' },
                    { value: 'Divorced', label: 'Divorced' },
                    { value: 'Widowed', label: 'Widowed' }
                  ])}
                  {renderField('Spouse Name', 'spouseName', employeeDetails.spouseName)}
                  {renderField('Number of Children', 'noOfChildren', employeeDetails.noOfChildren, 'number')}
                  {renderField('Emergency Contact Name', 'emergencyContactName', employeeDetails.emergencyContactName)}
                  {renderField('Emergency Contact Relationship', 'emergencyContactRelationship', employeeDetails.emergencyContactRelationship)}
                  {renderField('Emergency Contact Number', 'emergencyContactNumber', employeeDetails.emergencyContactNumber)}
                </div>
              </div>

              <div className="employee-details-section-emp-view">
                <h3>Security Details</h3>
                <div className="employee-details-grid-emp-view">
                  {renderField('Province', 'province', employeeDetails.province, 'select', provinces.map(p => ({ value: p.id, label: p.province })))}
                  {renderField('District', 'district', employeeDetails.district, 'select', districts.map(d => ({ value: d.id, label: d.district })))}
                  {renderField('Divisional Secretariats', 'divisionalSecretariats', employeeDetails.divisionalSecretariats, 'select', dscs.map(d => ({ value: d.id, label: d.dse })))}
                  {renderField('ASC', 'asc', employeeDetails.ascsId, 'select', ascs.map(a => ({ value: a.id, label: a.ascs })))}
                  {renderField('Police Station', 'policeStation', employeeDetails.policeStation)}
                </div>
              </div>

              <div className="employee-details-section-emp-view">
                <h3>Job Details</h3>
                <div className="employee-details-grid-emp-view">
                  {isEditMode ? (
                    <>
                      <div className="detail-item-emp-view">
                        <label>Employee Type:</label>
                        <span>{employeeDetails.employeeTypeName || employeeDetails.employeeType || 'N/A'}</span>
                      </div>
                      {renderField('Job Role', 'employeeJobRole', employeeDetails.employeeJobRoleName, 'select', userJobRoles.filter(r => r.status === 1).map(r => ({ value: r.id, label: r.designation })))}
                      {renderField('User Level', 'jobRoleLayer', employeeDetails.jobRoleLayerName, 'select', userLevels.map(l => ({ value: l.id, label: l.userLevel })))}
                      {renderField('Department', 'department', employeeDetails.departmentName, 'select', wings.map(w => ({ value: w.id, label: w.wing })))}
                      {renderField('Appointment Date', 'appointmentDate', formatDate(employeeDetails.appointmentDate), 'date')}
                      {renderField('Permanent Date', 'permanentDate', formatDate(employeeDetails.permanentDate), 'date')}
                      {renderField('Work Status', 'workStatus', employeeDetails.workStatus, 'select', [
                        { value: '', label: '-- Select --' },
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                        { value: 'On Leave', label: 'On Leave' },
                        { value: 'Suspended', label: 'Suspended' }
                      ])}
                      {renderField('Work Location', 'workLocation', employeeDetails.workLocationName, 'select', workLocations.map(l => ({ value: l.id, label: l.locationName })))}
                    </>
                  ) : (
                    <>
                      <div className="detail-item-emp-view">
                        <label>Employee Type:</label>
                        <span>{employeeDetails.employeeTypeName || employeeDetails.employeeType || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Job Role:</label>
                        <span>{employeeDetails.employeeJobRoleName || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>User Level:</label>
                        <span>{employeeDetails.jobRoleLayerName || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Department:</label>
                        <span>{employeeDetails.departmentName || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Appointment Date:</label>
                        <span>{formatDate(employeeDetails.appointmentDate)}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Permanent Date:</label>
                        <span>{formatDate(employeeDetails.permanentDate)}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Work Status:</label>
                        <span>{employeeDetails.workStatus || 'N/A'}</span>
                      </div>
                      <div className="detail-item-emp-view">
                        <label>Work Location:</label>
                        <span>{employeeDetails.workLocationName || 'N/A'}</span>
                      </div>
                    </>
                  )}
                  <div className="detail-item-emp-view">
                    <label>Status:</label>
                    <span>{getStatusBadge(employeeDetails.status)}</span>
                  </div>
                  <div className="detail-item-emp-view">
                    <label>Forwarded to Payroll:</label>
                    <span>{employeeDetails.forwardedToPayroll ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className="employee-details-section-emp-view">
                <h3>Documents</h3>
                <div className="employee-documents-emp-view">
                  {employeeDetails.educationCertificates && (
                    <div className="document-item-emp-view">
                      <label>Education Certificates:</label>
                      <div className="document-links-emp-view">
                        {(() => {
                          let filenames = [];
                          try {
                            if (Array.isArray(employeeDetails.educationCertificates)) {
                              filenames = employeeDetails.educationCertificates;
                            } else if (typeof employeeDetails.educationCertificates === 'string') {
                              if (employeeDetails.educationCertificates.startsWith('[')) {
                                filenames = JSON.parse(employeeDetails.educationCertificates);
                              } else {
                                filenames = [employeeDetails.educationCertificates];
                              }
                            }
                          } catch (e) {
                            console.error('Error parsing education certificates:', e);
                          }
                          return filenames.length > 0 ? filenames.map((filename, idx) => {
                            const docUrl = getDocumentUrl(filename, 'educationCertificates');
                            return docUrl ? (
                              <a key={idx} href={docUrl} target="_blank" rel="noopener noreferrer" className="document-link-emp-view">
                                Certificate {idx + 1}
                              </a>
                            ) : null;
                          }) : <span className="no-document-emp-view">No certificates</span>;
                        })()}
                      </div>
                    </div>
                  )}
                  {employeeDetails.birthCertificate && (() => {
                    const docUrl = getDocumentUrl(employeeDetails.birthCertificate, 'birthCertificate');
                    return (
                      <div className="document-item-emp-view">
                        <label>Birth Certificate:</label>
                        {docUrl ? (
                          <a href={docUrl} target="_blank" rel="noopener noreferrer" className="document-link-emp-view">
                            View Document
                          </a>
                        ) : (
                          <span className="no-document-emp-view">Document not available</span>
                        )}
                      </div>
                    );
                  })()}
                  {employeeDetails.healthReport && (() => {
                    const docUrl = getDocumentUrl(employeeDetails.healthReport, 'healthReport');
                    return (
                      <div className="document-item-emp-view">
                        <label>Health Report:</label>
                        {docUrl ? (
                          <a href={docUrl} target="_blank" rel="noopener noreferrer" className="document-link-emp-view">
                            View Document
                          </a>
                        ) : (
                          <span className="no-document-emp-view">Document not available</span>
                        )}
                      </div>
                    );
                  })()}
                  {employeeDetails.serviceLetters && (
                    <div className="document-item-emp-view">
                      <label>Service Letters:</label>
                      <div className="document-links-emp-view">
                        {(() => {
                          let filenames = [];
                          try {
                            if (Array.isArray(employeeDetails.serviceLetters)) {
                              filenames = employeeDetails.serviceLetters;
                            } else if (typeof employeeDetails.serviceLetters === 'string') {
                              if (employeeDetails.serviceLetters.startsWith('[')) {
                                filenames = JSON.parse(employeeDetails.serviceLetters);
                              } else {
                                filenames = [employeeDetails.serviceLetters];
                              }
                            }
                          } catch (e) {
                            console.error('Error parsing service letters:', e);
                          }
                          return filenames.length > 0 ? filenames.map((filename, idx) => {
                            const docUrl = getDocumentUrl(filename, 'serviceLetters');
                            return docUrl ? (
                              <a key={idx} href={docUrl} target="_blank" rel="noopener noreferrer" className="document-link-emp-view">
                                Letter {idx + 1}
                              </a>
                            ) : null;
                          }) : <span className="no-document-emp-view">No letters</span>;
                        })()}
                      </div>
                    </div>
                  )}
                  {employeeDetails.marriedCertificate && (() => {
                    const docUrl = getDocumentUrl(employeeDetails.marriedCertificate, 'marriedCertificate');
                    return (
                      <div className="document-item-emp-view">
                        <label>Married Certificate:</label>
                        {docUrl ? (
                          <a href={docUrl} target="_blank" rel="noopener noreferrer" className="document-link-emp-view">
                            View Document
                          </a>
                        ) : (
                          <span className="no-document-emp-view">Document not available</span>
                        )}
                      </div>
                    );
                  })()}
                  {employeeDetails.policeReport && (() => {
                    const docUrl = getDocumentUrl(employeeDetails.policeReport, 'policeReport');
                    return (
                      <div className="document-item-emp-view">
                        <label>Police Report:</label>
                        {docUrl ? (
                          <a href={docUrl} target="_blank" rel="noopener noreferrer" className="document-link-emp-view">
                            View Document
                          </a>
                        ) : (
                          <span className="no-document-emp-view">Document not available</span>
                        )}
                      </div>
                    );
                  })()}
                  {employeeDetails.gndCertificate && (() => {
                    const docUrl = getDocumentUrl(employeeDetails.gndCertificate, 'gndCertificate');
                    return (
                      <div className="document-item-emp-view">
                        <label>GND Certificate:</label>
                        {docUrl ? (
                          <a href={docUrl} target="_blank" rel="noopener noreferrer" className="document-link-emp-view">
                            View Document
                          </a>
                        ) : (
                          <span className="no-document-emp-view">Document not available</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="employee-modal-footer-emp-view">
              {isEditMode ? (
                <>
                  <button 
                    className="btn-close-modal-emp-view" 
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    style={{ marginRight: '10px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-view-employee-emp-view" 
                    onClick={handleSaveEmployee}
                    disabled={isSaving}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      opacity: isSaving ? 0.6 : 1
                    }}
                  >
                    {isSaving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </>
              ) : (
                <button className="btn-close-modal-emp-view" onClick={handleCloseModal}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
