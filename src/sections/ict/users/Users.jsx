import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  useGetUserMemberTypesQuery, 
  useGetUserJobRolesQuery, 
  useGetUserLevelsQuery,
  useSearchEmployeeQuery,
  useCreateUserMutation,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useGetGroupsQuery,
  useGetPlantationsQuery,
  useGetRegionsQuery,
  useGetEstatesQuery,
  useGetDriverFuelCardsQuery,
} from '../../../api/services NodeJs/jdManagementApi';
import { useGetWingsQuery } from '../../../api/services/assetsApi';
import '../../../styles/userRegistration.css';

const DRIVER_JOB_ROLE_CODE = 'dri';

const Users = ({ embeddedTransportDriver = false, onEmbeddedRegisterSuccess } = {}) => {
  const rootRef = useRef(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
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
  const { data: wingsResponse } = useGetWingsQuery();
  const wings = useMemo(() => {
    if (!wingsResponse) return [];
    if (Array.isArray(wingsResponse)) return wingsResponse;
    if (Array.isArray(wingsResponse?.wings)) return wingsResponse.wings;
    if (Array.isArray(wingsResponse?.data)) return wingsResponse.data;
    return [];
  }, [wingsResponse]);
  const { data: fuelCardsData = [] } = useGetDriverFuelCardsQuery({ user_id: selectedUserId || null });

  // Mutations
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const { data: allUsersData, isLoading: loadingUsers, refetch: refetchUsers } = useGetAllUsersQuery();

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
    fuel_card_id: '',
  });

  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('register');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [selectedUserImageUrl, setSelectedUserImageUrl] = useState('');
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    nic: '',
    mobile_no: '',
    password: '',
    confirmPassword: '',
    member_type: '',
    job_role: '',
    user_level: 'g',
    activated: '1',
    image: null,
    group: '',
    plantation: '',
    region: '',
    estate: '',
    fuel_card_id: '',
  });

  // Search employee query (only when userType is 'i' and searchTerm is provided)
  const { data: employeeSearchResult, isLoading: searchingEmployee } = useSearchEmployeeQuery(
    { searchTerm: employeeSearchTerm },
    { skip: !employeeSearchTerm || userType !== 'i' || !isSearchingEmployee }
  );

  useEffect(() => {
    if (!embeddedTransportDriver) return;
    setFormData((prev) =>
      prev.job_role === DRIVER_JOB_ROLE_CODE ? prev : { ...prev, job_role: DRIVER_JOB_ROLE_CODE }
    );
  }, [embeddedTransportDriver]);

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
        mobile_no: normalizeMobileNo(employee.mobileNumber || ''),
        employeeId: employee.id,
        // Map job details from employee - use codes directly (they're already codes now)
        job_role: embeddedTransportDriver ? DRIVER_JOB_ROLE_CODE : jobRoleCode,
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

  const allUsers = useMemo(() => allUsersData?.data || [], [allUsersData]);
  const filteredUsers = useMemo(() => {
    const q = userSearchTerm.trim().toLowerCase();
    return allUsers.filter((u) => {
      const matchesSearch = !q || (
        String(u?.name || '').toLowerCase().includes(q) ||
        String(u?.nic || '').toLowerCase().includes(q) ||
        String(u?.mobile_no || '').toLowerCase().includes(q) ||
        String(u?.email || '').toLowerCase().includes(q) ||
        String(u?.job_role || '').toLowerCase().includes(q)
      );
      const matchesType = !userTypeFilter || String(u?.member_type || '') === userTypeFilter;
      const matchesRole = !userRoleFilter || String(u?.job_role || '') === userRoleFilter;
      return matchesSearch && matchesType && matchesRole;
    });
  }, [allUsers, userSearchTerm, userTypeFilter, userRoleFilter]);

  const memberTypeLabelMap = useMemo(() => {
    const map = {};
    userMemberTypes.forEach((item) => {
      const code = String(item?.typeCode || '').trim();
      const label = String(item?.memberType || '').trim();
      if (code) map[code] = label || code;
    });
    return map;
  }, [userMemberTypes]);

  const jobRoleLabelMap = useMemo(() => {
    const map = {};
    userJobRoles.forEach((item) => {
      const code = String(item?.jdCode || item?.id || '').trim();
      const label = String(item?.designation || '').trim();
      if (code) map[code] = label || code;
    });
    return map;
  }, [userJobRoles]);

  const plantationLabelMap = useMemo(() => {
    const map = {};
    plantations.forEach((item) => {
      if (item?.id != null) {
        map[String(item.id)] = item.plantation || String(item.id);
      }
    });
    return map;
  }, [plantations]);

  const estateLabelMap = useMemo(() => {
    const map = {};
    estates.forEach((item) => {
      if (item?.id != null) {
        map[String(item.id)] = item.estate || String(item.id);
      }
    });
    return map;
  }, [estates]);

  const wingLabelMap = useMemo(() => {
    const map = {};
    wings.forEach((item) => {
      if (item?.id != null) {
        map[String(item.id)] = item.wing || String(item.id);
      }
    });
    return map;
  }, [wings]);

  const normalizeMobileNo = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    const withoutLeadingZero = digits.startsWith('0') ? digits.slice(1) : digits;
    return withoutLeadingZero.slice(0, 9);
  };

  const generateEightLetterPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let generated = '';
    for (let i = 0; i < 8; i += 1) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return generated;
  };

  const handleGenerateRegisterPassword = () => {
    const generated = generateEightLetterPassword();
    setFormData((prev) => ({
      ...prev,
      password: generated,
      confirmPassword: generated,
    }));
  };

  const handleGenerateEditPassword = () => {
    const generated = generateEightLetterPassword();
    setEditFormData((prev) => ({
      ...prev,
      password: generated,
      confirmPassword: generated,
    }));
  };

  useEffect(() => {
    if (!rootRef.current) return;
    const nodes = rootRef.current.querySelectorAll('[class]');
    nodes.forEach((node) => {
      const current = (node.getAttribute('class') || '').split(' ').filter(Boolean);
      const withSuffix = current.map((className) =>
        className.endsWith('-user-maintain') ? className : `${className}-user-maintain`
      );
      const merged = [...new Set([...current, ...withSuffix])];
      node.setAttribute('class', merged.join(' '));
    });
  }, [activeTab, selectedUserId, showUpdatePopup, showEditPopup, filteredUsers.length]);

  useEffect(() => {
    if (editFormData.image instanceof File) {
      const previewUrl = URL.createObjectURL(editFormData.image);
      setEditImagePreviewUrl(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
    setEditImagePreviewUrl('');
    return undefined;
  }, [editFormData.image]);

  const startEditUser = (user) => {
    setSelectedUserId(user?.id || null);
    setEditMessage({ type: '', text: '' });
    setEditFormData({
      name: user?.name || '',
      email: user?.email || '',
      nic: user?.nic || '',
      mobile_no: normalizeMobileNo(user?.mobile_no || ''),
      password: '',
      confirmPassword: '',
      member_type: user?.member_type || '',
      job_role: user?.job_role || '',
      user_level: user?.user_level || 'g',
      activated: String(user?.activated ?? '1'),
      image: null,
      group: user?.group ? String(user.group) : '',
      plantation: user?.plantation ? String(user.plantation) : '',
      region: user?.region ? String(user.region) : '',
      estate: user?.estate ? String(user.estate) : '',
      fuel_card_id: user?.card_id ? String(user.card_id) : '',
    });
    setSelectedUserImageUrl(user?.image || '');
    setShowEditPopup(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, files } = e.target;

    if (e.target.type === 'file') {
      setEditFormData((prev) => ({
        ...prev,
        [name]: files && files.length > 0 ? files[0] : null,
      }));
      return;
    }

    setEditFormData((prev) => {
      const next = {
        ...prev,
        [name]: name === 'mobile_no' ? normalizeMobileNo(value) : (value || ''),
      };

      if (name === 'member_type' && value !== 'e') {
        next.group = '';
        next.plantation = '';
        next.region = '';
        next.estate = '';
      }

      if (name === 'job_role' && value !== 'dri') {
        next.fuel_card_id = '';
      }

      if (name === 'estate' && value) {
        const selectedEstate = estates.find((item) => item.id === parseInt(value));
        if (selectedEstate) {
          if (selectedEstate.group) next.group = String(selectedEstate.group);
          if (selectedEstate.plantation) next.plantation = String(selectedEstate.plantation);
          if (selectedEstate.region) next.region = String(selectedEstate.region);
        }
      } else if (name === 'region' && value) {
        const selectedRegion = regions.find((item) => item.id === parseInt(value));
        if (selectedRegion) {
          if (selectedRegion.group) next.group = String(selectedRegion.group);
          if (selectedRegion.plantation) next.plantation = String(selectedRegion.plantation);
        }
        next.estate = '';
      } else if (name === 'plantation' && value) {
        const selectedPlantation = plantations.find((item) => item.id === parseInt(value));
        if (selectedPlantation?.group) {
          next.group = String(selectedPlantation.group);
        }
        next.region = '';
        next.estate = '';
      } else if (name === 'group') {
        next.plantation = '';
        next.region = '';
        next.estate = '';
      }

      return next;
    });
  };

  const buildUpdatePayload = () => {
    const { confirmPassword, image, ...base } = editFormData;
    const payload = {
      id: selectedUserId,
      ...base,
    };

    if (!payload.password) delete payload.password;
    if (payload.member_type !== 'e') {
      payload.group = null;
      payload.plantation = null;
      payload.region = null;
      payload.estate = null;
    }
    // Normalize fuel card field for backend compatibility.
    payload.card_id = payload.fuel_card_id || null;
    delete payload.fuel_card_id;
    if (payload.job_role !== 'dri') {
      payload.card_id = null;
    }

    if (image instanceof File) {
      const formDataToSend = new FormData();
      Object.entries(payload).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          formDataToSend.append(key, val == null ? '' : val);
        }
      });
      formDataToSend.append('image', image);
      return formDataToSend;
    }

    return payload;
  };

  const submitUserUpdate = async () => {
    try {
      const result = await updateUser(buildUpdatePayload()).unwrap();
      setEditMessage({
        type: 'success',
        text: result?.message || 'User updated successfully.',
      });
      setShowEditPopup(false);
      setShowUpdatePopup(false);
      refetchUsers();
    } catch (error) {
      setEditMessage({
        type: 'error',
        text: error?.data?.message || error?.message || 'Failed to update user.',
      });
      setShowUpdatePopup(false);
    }
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    setEditMessage({ type: '', text: '' });

    if (!selectedUserId) {
      setEditMessage({ type: 'error', text: 'Please select a user to update.' });
      return;
    }
    if (!editFormData.name || !editFormData.nic || !editFormData.mobile_no) {
      setEditMessage({ type: 'error', text: 'Name, NIC and mobile number are required.' });
      return;
    }
    if (editFormData.mobile_no.length !== 9) {
      setEditMessage({ type: 'error', text: 'Mobile number must be 9 digits without leading 0 (e.g., 771234567).' });
      return;
    }
    if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
      setEditMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setShowUpdatePopup(true);
  };

  const handleUserTypeChange = (e) => {
    const newUserType = e.target.value;
    setUserType(newUserType);
    setFormData(prev => ({
      ...prev,
      member_type: newUserType,
      employeeId: null, // Reset employee link when changing type
      // Clear job details if switching from internal to external
      ...(newUserType === 'e' && {
        job_role: embeddedTransportDriver ? DRIVER_JOB_ROLE_CODE : '',
        user_level: 'g',
        group: '',
        plantation: '',
        region: '',
        estate: '',
        fuel_card_id: '',
      }),
      // Clear external fields if switching to internal
      ...(newUserType === 'i' && {
        group: '',
        plantation: '',
        region: '',
        estate: '',
        fuel_card_id: '',
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
        [name]: name === 'mobile_no' ? normalizeMobileNo(value) : (value || ''),
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
    if (formData.mobile_no.length !== 9) {
      setSubmitMessage({ type: 'error', text: 'Mobile number must be 9 digits without leading 0 (e.g., 771234567).' });
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
      if (embeddedTransportDriver) {
        submissionData.job_role = DRIVER_JOB_ROLE_CODE;
      }

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
      
      if (submissionData.job_role !== 'dri') {
        delete submissionData.driver_license_no;
        delete submissionData.driver_license_front_image;
        delete submissionData.driver_license_back_image;
        delete submissionData.fuel_card_id;
        submissionData.card_id = null;
      } else if (!submissionData.fuel_card_id) {
        submissionData.card_id = null;
      } else {
        submissionData.card_id = submissionData.fuel_card_id;
      }
      delete submissionData.fuel_card_id;

      // Use FormData when any file is attached
      let dataToSend;
      const hasFileUpload =
        image ||
        submissionData.driver_license_front_image instanceof File ||
        submissionData.driver_license_back_image instanceof File;
      if (hasFileUpload) {
        const formDataToSend = new FormData();
        
        // Append all form fields
        Object.keys(submissionData).forEach(key => {
          const value = submissionData[key];
          if (value !== null && value !== undefined && value !== '') {
            if (value instanceof File) {
              formDataToSend.append(key, value);
            } else if (typeof value === 'object') {
              formDataToSend.append(key, JSON.stringify(value));
            } else {
              formDataToSend.append(key, value);
            }
          }
        });
        
        if (image instanceof File) {
          formDataToSend.append('image', image);
        }
        
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
          job_role: embeddedTransportDriver ? DRIVER_JOB_ROLE_CODE : '',
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
          fuel_card_id: '',
        });
        if (!embeddedTransportDriver) {
          setUserType('');
        }
        setSelectedEmployee(null);
        setEmployeeSearchTerm('');
        if (embeddedTransportDriver) {
          onEmbeddedRegisterSuccess?.();
        }
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

  const handleDownloadFilteredUsersExcel = () => {
    if (!filteredUsers.length) {
      setSubmitMessage({ type: 'error', text: 'No users available for export.' });
      return;
    }

    const excelData = filteredUsers.map((user) => ({
      ID: user.id || '',
      Name: user.name || '',
      NIC: user.nic || '',
      Mobile: user.mobile_no || '',
      Email: user.email || '',
      Type: memberTypeLabelMap[String(user.member_type || '').trim()] || user.member_type || '',
      Role: jobRoleLabelMap[String(user.job_role || '').trim()] || user.job_role || '',
      Status: String(user.activated) === '1' ? 'Active' : 'Inactive',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    const now = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Users_Filtered_${now}.xlsx`);
  };

  const normalizedTypeFilter = String(userTypeFilter || '').trim().toLowerCase();
  const showExternalColumns = normalizedTypeFilter === 'e' || normalizedTypeFilter === 'external';
  const showInternalColumns = normalizedTypeFilter === 'i' || normalizedTypeFilter === 'internal';
  const usersTableColSpan = 9 + (showExternalColumns ? 2 : 0) + (showInternalColumns ? 1 : 0);

  return (
    <div
      className={`user-registration-container${embeddedTransportDriver ? ' user-registration-embedded-transport-hr' : ''}`}
      ref={rootRef}
    >
      {!embeddedTransportDriver && (
        <div className="users-top-tabs">
          <button
            type="button"
            className={`users-top-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Registration
          </button>
          <button
            type="button"
            className={`users-top-tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            View / Update Users
          </button>
        </div>
      )}

      {(embeddedTransportDriver || activeTab === 'register') && <div className="registration-form-content">
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
                  maxLength={9}
                  inputMode="numeric"
                  required
                  placeholder="Example: 771234567"
                  disabled={!!selectedEmployee}
                  style={selectedEmployee ? { backgroundColor: '#f5f5f5' } : {}}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="password-label-row">
                  <label>Password:</label>
                  <button
                    type="button"
                    className="password-inline-action"
                    onClick={handleGenerateRegisterPassword}
                  >
                    Auto generate
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password (optional)"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="password-visibility-btn"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    title={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password:</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="password-visibility-btn"
                    onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                    title={showRegisterConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterConfirmPassword ? '🙈' : '👁'}
                  </button>
                </div>
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
                {embeddedTransportDriver ? (
                  <input
                    type="text"
                    readOnly
                    value={jobRoleLabelMap[DRIVER_JOB_ROLE_CODE] || 'Driver'}
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                ) : (
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
                )}
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
          {(formData.job_role === 'dri' || embeddedTransportDriver) && (
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
                <div className="form-group">
                  <label>Fuel Card:</label>
                  <select
                    name="fuel_card_id"
                    value={formData.fuel_card_id}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Fuel Card --</option>
                    {fuelCardsData.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.label || card.card_no_masked || `Card #${card.id}`}
                      </option>
                    ))}
                  </select>
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
      </div>}

      {!embeddedTransportDriver && activeTab === 'manage' && <div className="registration-form-content user-management-content">
        <div className="users-manage-header-row">
          <h2 className="section-title">View / Update Users</h2>
          <div className="users-manage-right-controls">
            <div className="users-filter-group">
              <label>Type</label>
              <select value={userTypeFilter} onChange={(e) => setUserTypeFilter(e.target.value)}>
                <option value="">All</option>
                <option value="i">Internal</option>
                <option value="e">External</option>
              </select>
            </div>
            <div className="users-filter-group">
              <label>Role</label>
              <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                <option value="">All</option>
                {userJobRoles
                  .filter((role) => role.status === 1)
                  .map((role) => (
                    <option key={role.id} value={role.jdCode || role.id}>
                      {role.designation}
                    </option>
                  ))}
              </select>
            </div>
            <button
              type="button"
              className="btn-search users-download-excel-btn"
              onClick={handleDownloadFilteredUsersExcel}
            >
              Download Excel
            </button>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group full-width">
            <label>Search Users</label>
            <input
              type="text"
              placeholder="Search by name, NIC, mobile, email or role"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Profile</th>
                <th>Name</th>
                <th>NIC</th>
                <th>Mobile</th>
                <th>Type</th>
                {showInternalColumns && <th>Wing</th>}
                {showExternalColumns && <th>Plantation</th>}
                {showExternalColumns && <th>Estate</th>}
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan={usersTableColSpan}>Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={usersTableColSpan}>No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={selectedUserId === user.id ? 'selected-row' : ''}>
                    <td>{user.id}</td>
                    <td>
                      {user?.image ? (
                        <img src={user.image} alt={user.name || 'User'} className="user-avatar-thumb" />
                      ) : (
                        <div className="user-avatar-placeholder">N/A</div>
                      )}
                    </td>
                    <td>{user.name || '-'}</td>
                    <td>{user.nic || '-'}</td>
                    <td>{user.mobile_no || '-'}</td>
                    <td>{memberTypeLabelMap[String(user.member_type || '').trim()] || user.member_type || '-'}</td>
                    {showInternalColumns && (
                      <td>{wingLabelMap[String(user.sect_command || user.wing || '')] || user.wing_name || user.sect_command || '-'}</td>
                    )}
                    {showExternalColumns && (
                      <td>{plantationLabelMap[String(user.plantation || '')] || user.plantation || '-'}</td>
                    )}
                    {showExternalColumns && (
                      <td>{estateLabelMap[String(user.estate || '')] || user.estate || '-'}</td>
                    )}
                    <td>{jobRoleLabelMap[String(user.job_role || '').trim()] || user.job_role || '-'}</td>
                    <td>{String(user.activated) === '1' ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-search"
                        onClick={() => startEditUser(user)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showEditPopup && selectedUserId && (
          <div className="update-popup-overlay edit-user-popup-overlay">
            <div className="update-popup-card edit-user-popup-card">
              <div className="edit-user-popup-header">
                <h3 className="section-title">Edit User #{selectedUserId}</h3>
                <button
                  type="button"
                  className="btn-search"
                  onClick={() => {
                    setShowEditPopup(false);
                    setShowUpdatePopup(false);
                    setEditMessage({ type: '', text: '' });
                    setSelectedUserImageUrl('');
                  }}
                  disabled={isUpdating}
                >
                  Close
                </button>
              </div>
              <form onSubmit={handleUpdateUserSubmit} className="edit-user-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" value={editFormData.name} onChange={handleEditInputChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={editFormData.email} onChange={handleEditInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>NIC</label>
                <input name="nic" value={editFormData.nic} onChange={handleEditInputChange} required />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  name="mobile_no"
                  value={editFormData.mobile_no}
                  onChange={handleEditInputChange}
                  maxLength={9}
                  inputMode="numeric"
                  required
                  placeholder="Example: 771234567"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <div className="password-label-row">
                  <label>Password (optional)</label>
                  <button
                    type="button"
                    className="password-inline-action"
                    onClick={handleGenerateEditPassword}
                  >
                    Auto generate
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    name="password"
                    type={showEditPassword ? 'text' : 'password'}
                    value={editFormData.password}
                    onChange={handleEditInputChange}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="password-visibility-btn"
                    onClick={() => setShowEditPassword((prev) => !prev)}
                    title={showEditPassword ? 'Hide password' : 'Show password'}
                  >
                    {showEditPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    name="confirmPassword"
                    type={showEditConfirmPassword ? 'text' : 'password'}
                    value={editFormData.confirmPassword}
                    onChange={handleEditInputChange}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="password-visibility-btn"
                    onClick={() => setShowEditConfirmPassword((prev) => !prev)}
                    title={showEditConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showEditConfirmPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>User Type</label>
                <select name="member_type" value={editFormData.member_type} onChange={handleEditInputChange}>
                  <option value="">-- Select --</option>
                  {userMemberTypes.map((type) => (
                    <option key={type.id} value={type.typeCode}>
                      {type.memberType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Job Role</label>
                <select name="job_role" value={editFormData.job_role} onChange={handleEditInputChange}>
                  <option value="">-- Select --</option>
                  {userJobRoles.filter((role) => role.status === 1).map((role) => (
                    <option key={role.id} value={role.jdCode || role.id}>
                      {role.designation}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>User Level</label>
                <select name="user_level" value={editFormData.user_level} onChange={handleEditInputChange}>
                  <option value="g">Guest User</option>
                  {userLevels.map((level) => (
                    <option key={level.id} value={level.levelCode || level.id}>
                      {level.userLevel}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="activated" value={editFormData.activated} onChange={handleEditInputChange}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Profile Picture (optional)</label>
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleEditInputChange}
                />
                <div className="edit-user-image-preview-row">
                  {editImagePreviewUrl ? (
                    <div className="edit-user-image-preview-block">
                      <span>New Image Preview</span>
                      <img src={editImagePreviewUrl} alt="New profile preview" className="edit-user-image-preview" />
                    </div>
                  ) : null}
                  {selectedUserImageUrl ? (
                    <div className="edit-user-image-preview-block">
                      <span>Current Profile Picture</span>
                      <img src={selectedUserImageUrl} alt="Current profile" className="edit-user-image-preview" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {editFormData.job_role === 'dri' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Fuel Card</label>
                  <select name="fuel_card_id" value={editFormData.fuel_card_id} onChange={handleEditInputChange}>
                    <option value="">-- Select Fuel Card --</option>
                    {fuelCardsData.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.label || card.card_no_masked || `Card #${card.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {editFormData.member_type === 'e' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Group</label>
                    <select name="group" value={editFormData.group} onChange={handleEditInputChange}>
                      <option value="">-- Select Group --</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.group}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Plantation</label>
                    <select name="plantation" value={editFormData.plantation} onChange={handleEditInputChange}>
                      <option value="">-- Select Plantation --</option>
                      {plantations
                        .filter((p) => !editFormData.group || p.group === parseInt(editFormData.group))
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
                    <label>Region</label>
                    <select name="region" value={editFormData.region} onChange={handleEditInputChange}>
                      <option value="">-- Select Region --</option>
                      {regions
                        .filter((r) => {
                          if (editFormData.group && r.group !== parseInt(editFormData.group)) return false;
                          if (editFormData.plantation && r.plantation !== parseInt(editFormData.plantation)) return false;
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
                    <label>Estate</label>
                    <select name="estate" value={editFormData.estate} onChange={handleEditInputChange}>
                      <option value="">-- Select Estate --</option>
                      {estates
                        .filter((estate) => {
                          if (editFormData.group && estate.group !== parseInt(editFormData.group)) return false;
                          if (editFormData.plantation && estate.plantation !== parseInt(editFormData.plantation)) return false;
                          if (editFormData.region && estate.region !== parseInt(editFormData.region)) return false;
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
              </>
            )}

            <div className="form-buttons">
              <button
                type="submit"
                className="btn-submit"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update User'}
              </button>
            </div>

            {editMessage.text && (
              <div className={`message ${editMessage.type}`}>
                {editMessage.text}
              </div>
            )}
              </form>
            </div>
          </div>
        )}
      </div>}

      {showUpdatePopup && (
        <div className="update-popup-overlay">
          <div className="update-popup-card">
            <h3>Confirm Update</h3>
            <p>Are you sure you want to update this user?</p>
            <div className="update-popup-actions">
              <button
                type="button"
                className="btn-search"
                onClick={() => setShowUpdatePopup(false)}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={submitUserUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Yes, Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
