import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  useGetUserLevelsQuery,
  useGetUserMemberTypesQuery,
  useGetUserJobRolesQuery,
  useGetUserJobDescriptionsQuery,
  useFindDescriptionsByTaskTextQuery,
  useCreateUserJobRoleMutation,
  useUpdateUserJobRoleMutation,
  useDeleteUserJobRoleMutation,
  useCreateUserJobDescriptionMutation,
  useCreateMultipleUserJobDescriptionsMutation,
  useUpdateUserJobDescriptionMutation,
  useDeleteUserJobDescriptionMutation,
  useUpdateTaskOrdersMutation,
} from '../../api/services NodeJs/jdManagementApi';
import '../../styles/jdManagement.css';

const JDManagement = () => {
  // API Queries
  const { data: userLevelsData, isLoading: loadingLevels } = useGetUserLevelsQuery();
  const { data: userMemberTypesData, isLoading: loadingMemberTypes } = useGetUserMemberTypesQuery();
  const { data: jobRolesData, isLoading: loadingJobRoles, refetch: refetchJobRoles } = useGetUserJobRolesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: jobDescriptionsData, refetch: refetchJobDescriptions } = useGetUserJobDescriptionsQuery();

  // Mutations
  const [createJobRole, { isLoading: creatingJobRole }] = useCreateUserJobRoleMutation();
  const [updateJobRole, { isLoading: updatingJobRole }] = useUpdateUserJobRoleMutation();
  const [deleteJobRole, { isLoading: deletingJobRole }] = useDeleteUserJobRoleMutation();
  const [createJobDescription, { isLoading: creatingDescription }] = useCreateUserJobDescriptionMutation();
  const [createMultipleJobDescriptions, { isLoading: creatingMultipleDescriptions }] = useCreateMultipleUserJobDescriptionsMutation();
  const [updateJobDescription, { isLoading: updatingDescription }] = useUpdateUserJobDescriptionMutation();
  const [deleteJobDescription, { isLoading: deletingDescription }] = useDeleteUserJobDescriptionMutation();
  const [updateTaskOrders, { isLoading: updatingTaskOrders }] = useUpdateTaskOrdersMutation();

  // Get current user ID
  const getCurrentUserId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return userData?.id || null;
    } catch (error) {
      return null;
    }
  };

  // State
  const [jobRoles, setJobRoles] = useState([]);
  const [selectedJobRole, setSelectedJobRole] = useState(null);
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    designation: '',
    jdCode: '',
    userLevelId: '',
    userMemberTypeId: '',
    status: 1,
  });
  const [descriptionFormData, setDescriptionFormData] = useState({
    taskDescription: '',
    status: 1,
    selectedJobRoleIds: [], // For multiple designations
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jdCodeError, setJdCodeError] = useState(''); // For JD Code duplicate validation
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [designationSearch, setDesignationSearch] = useState('');
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);
  const [memberTypeFilter, setMemberTypeFilter] = useState('all'); // 'all', 'internal', 'external'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [userLevelFilter, setUserLevelFilter] = useState('all'); // 'all' or userLevelId

  // Get data from API responses
  const userLevels = userLevelsData?.data || [];
  const userMemberTypes = userMemberTypesData?.data || [];
  const allJobRoles = jobRolesData?.data || [];
  const allJobDescriptions = jobDescriptionsData?.data || [];

  // Use refs to track previous values and prevent infinite loops
  const prevJobRolesHashRef = useRef('');
  const prevJobDescriptionsHashRef = useRef('');
  const prevSelectedJobRoleIdRef = useRef(null);

  // Update job roles when data changes
  useEffect(() => {
    // Create a hash of job roles data to detect changes
    const jobRolesHash = allJobRoles.length > 0
      ? `${allJobRoles.length}-${allJobRoles.map(r => `${r.id}-${r.designation}-${r.status}`).join(',')}`
      : '';
    
    if (jobRolesHash && prevJobRolesHashRef.current !== jobRolesHash) {
      setJobRoles(allJobRoles);
      prevJobRolesHashRef.current = jobRolesHash;
      
      // Update selected job role if it exists in the new data
      if (selectedJobRole) {
        const updatedRole = allJobRoles.find(r => r.id === selectedJobRole.id);
        if (updatedRole) {
          setSelectedJobRole(updatedRole);
        }
      } else if (allJobRoles.length > 0) {
        setSelectedJobRole(allJobRoles[0]);
      }
    }
  }, [allJobRoles, selectedJobRole]);

  // Update job descriptions when selected job role or descriptions change
  useEffect(() => {
    const currentJobRoleId = selectedJobRole?.id;
    // Create a hash of the descriptions data to detect actual changes
    const descriptionsHash = allJobDescriptions 
      ? `${allJobDescriptions.length}-${allJobDescriptions.map(d => d.id).join(',')}`
      : '';
    const descriptionsChanged = prevJobDescriptionsHashRef.current !== descriptionsHash;
    const jobRoleChanged = prevSelectedJobRoleIdRef.current !== currentJobRoleId;

    if (descriptionsChanged || jobRoleChanged) {
      if (currentJobRoleId && allJobDescriptions) {
        const descriptions = allJobDescriptions
          .filter(desc => desc.jobRoleId === currentJobRoleId)
          .sort((a, b) => {
            // First sort by status (active first, then inactive)
            if (a.status !== b.status) {
              return b.status - a.status; // 1 (active) comes before 0 (inactive)
            }
            // Then sort by taskOrder within each status group
            return a.taskOrder - b.taskOrder;
          });
        setJobDescriptions(descriptions);
      } else {
        setJobDescriptions([]);
      }
      prevJobDescriptionsHashRef.current = descriptionsHash;
      prevSelectedJobRoleIdRef.current = currentJobRoleId;
    }
  }, [selectedJobRole?.id, allJobDescriptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDesignationDropdown && !event.target.closest('.jd-multi-select-container-jd-mgmt')) {
        setShowDesignationDropdown(false);
      }
    };

    if (showDesignationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDesignationDropdown]);

  // Handle job role selection
  const handleJobRoleSelect = (jobRole) => {
    setSelectedJobRole(jobRole);
    setEditingTaskId(null);
    
    // Move selected item to the first position in the list
    setJobRoles(prevRoles => {
      const filteredRoles = [...prevRoles];
      const selectedIndex = filteredRoles.findIndex(r => r.id === jobRole.id);
      
      if (selectedIndex > 0) {
        // Remove the selected item from its current position
        const [selectedItem] = filteredRoles.splice(selectedIndex, 1);
        // Add it to the beginning
        filteredRoles.unshift(selectedItem);
        return filteredRoles;
      }
      
      return filteredRoles;
    });
  };

  // Handle add job role
  const handleAddJob = () => {
    setJobFormData({
      designation: '',
      jdCode: '',
      userLevelId: '',
      userMemberTypeId: '',
      status: 1,
    });
    setIsEditMode(false);
    setShowJobModal(true);
    setError('');
    setJdCodeError('');
  };

  // Handle edit job role
  const handleEditJob = () => {
    if (selectedJobRole) {
      setJobFormData({
        designation: selectedJobRole.designation || '',
        jdCode: selectedJobRole.jdCode || '',
        userLevelId: selectedJobRole.userLevelId || '',
        userMemberTypeId: selectedJobRole.userMemberTypeId || '',
        status: selectedJobRole.status || 1,
      });
      setIsEditMode(true);
      setShowJobModal(true);
      setError('');
      setJdCodeError('');
    }
  };

  // Check if JD Code already exists
  const checkJdCodeDuplicate = (jdCode) => {
    if (!jdCode || !jdCode.trim()) {
      setJdCodeError('');
      return false;
    }

    const trimmedCode = jdCode.trim().toLowerCase();
    
    // Check if JD Code already exists (case-insensitive)
    const existingRole = allJobRoles.find(role => 
      role.jdCode && role.jdCode.toLowerCase() === trimmedCode
    );

    // If editing, exclude the current role from the check
    if (isEditMode && selectedJobRole && existingRole) {
      if (existingRole.id === selectedJobRole.id) {
        setJdCodeError('');
        return false;
      }
    }

    if (existingRole) {
      setJdCodeError(`JD Code "${jdCode}" already exists. Please use a different code.`);
      return true;
    }

    setJdCodeError('');
    return false;
  };

  // Handle JD Code input change
  const handleJdCodeChange = (e) => {
    const newJdCode = e.target.value;
    setJobFormData({ ...jobFormData, jdCode: newJdCode });
    
    // Check for duplicate in real-time
    if (newJdCode.trim()) {
      checkJdCodeDuplicate(newJdCode);
    } else {
      setJdCodeError('');
    }
  };

  // Handle save job role
  const handleSaveJob = async () => {
    if (!jobFormData.designation.trim()) {
      setError('Please enter a job designation name');
      return;
    }

    if (!jobFormData.jdCode.trim()) {
      setError('Please enter a JD Code');
      return;
    }

    // Check for duplicate JD Code before submitting
    if (checkJdCodeDuplicate(jobFormData.jdCode)) {
      setError('JD Code already exists. Please use a different code.');
      return;
    }

    setLoading(true);
    setError('');
    setJdCodeError('');

    try {
      const userId = getCurrentUserId();
      const data = {
        ...jobFormData,
        userLevelId: jobFormData.userLevelId ? parseInt(jobFormData.userLevelId) : null,
        userMemberTypeId: jobFormData.userMemberTypeId ? parseInt(jobFormData.userMemberTypeId) : null,
        createdBy: isEditMode ? undefined : userId,
        updatedBy: isEditMode ? userId : undefined,
      };

      if (isEditMode && selectedJobRole) {
        await updateJobRole({ id: selectedJobRole.id, ...data }).unwrap();
      } else {
        await createJobRole(data).unwrap();
      }

      // Refetch job roles to get updated data
      const result = await refetchJobRoles();
      
      // Force immediate update of jobRoles state and selectedJobRole
      if (result?.data?.data) {
        const updatedRoles = result.data.data;
        setJobRoles(updatedRoles);
        
        // Update selected role immediately if editing
        if (isEditMode && selectedJobRole) {
          const updatedRole = updatedRoles.find(r => r.id === selectedJobRole.id);
          if (updatedRole) {
            setSelectedJobRole(updatedRole);
          }
        } else if (!isEditMode && updatedRoles.length > 0) {
          // If creating new, select the newly created role
          const newRole = updatedRoles[updatedRoles.length - 1];
          setSelectedJobRole(newRole);
        }
        
        // Update the hash ref to prevent duplicate updates
        const jobRolesHash = updatedRoles.length > 0
          ? `${updatedRoles.length}-${updatedRoles.map(r => `${r.id}-${r.designation}-${r.status}`).join(',')}`
          : '';
        prevJobRolesHashRef.current = jobRolesHash;
      }

      setShowJobModal(false);
      setJobFormData({
        designation: '',
        jdCode: '',
        userLevelId: '',
        userMemberTypeId: '',
        status: 1,
      });
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to save job role');
    } finally {
      setLoading(false);
    }
  };

  // Handle add description
  const handleAddDescription = () => {
    setDescriptionFormData({
      taskDescription: '',
      status: 1,
      selectedJobRoleIds: selectedJobRole ? [selectedJobRole.id] : [],
    });
    setEditingTaskId(null);
    setShowDescriptionModal(true);
    setError('');
    setDesignationSearch('');
    setShowDesignationDropdown(false);
  };

  // Handle edit description
  const handleEditDescription = (task) => {
    setDescriptionFormData({
      taskDescription: task.taskDescription || '',
      status: task.status || 1,
      selectedJobRoleIds: [task.jobRoleId],
    });
    setEditingTaskId(task.id);
    setShowDescriptionModal(true);
    setError('');
    setDesignationSearch('');
    setShowDesignationDropdown(false);
  };

  // Handle save description
  const handleSaveDescription = async () => {
    if (!descriptionFormData.taskDescription.trim()) {
      setError('Please enter a task description');
      return;
    }

    if (descriptionFormData.selectedJobRoleIds.length === 0) {
      setError('Please select at least one designation');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userId = getCurrentUserId();

      if (editingTaskId) {
        // Update existing task
        await updateJobDescription({
          id: editingTaskId,
          taskDescription: descriptionFormData.taskDescription,
          status: descriptionFormData.status,
          updatedBy: userId,
        }).unwrap();
        
        // Immediately update local state for the edited task
        setJobDescriptions(prevDescriptions => 
          prevDescriptions.map(desc => 
            desc.id === editingTaskId
              ? {
                  ...desc,
                  taskDescription: descriptionFormData.taskDescription,
                  status: descriptionFormData.status,
                }
              : desc
          )
        );
      } else {
        // Create new task(s) - support multiple designations
        let newTaskIds = [];
        
        if (descriptionFormData.selectedJobRoleIds.length === 1) {
          // Single designation
          const result = await createJobDescription({
            jobRoleId: descriptionFormData.selectedJobRoleIds[0],
            taskDescription: descriptionFormData.taskDescription,
            status: descriptionFormData.status,
            createdBy: userId,
          }).unwrap();
          
          if (result?.data?.id) {
            newTaskIds.push(result.data.id);
          }
        } else {
          // Multiple designations
          const result = await createMultipleJobDescriptions({
            jobRoleIds: descriptionFormData.selectedJobRoleIds,
            taskDescription: descriptionFormData.taskDescription,
            status: descriptionFormData.status,
            createdBy: userId,
          }).unwrap();
          
          if (result?.data && Array.isArray(result.data)) {
            newTaskIds = result.data.map(task => task.id).filter(Boolean);
          }
        }
        
        // If the new task is for the currently selected job role, add it to the list immediately
        if (selectedJobRole && descriptionFormData.selectedJobRoleIds.includes(selectedJobRole.id)) {
          // Refetch to get the complete task data with taskOrder
          const result = await refetchJobDescriptions();
          if (result?.data?.data) {
            const updatedDescriptions = result.data.data
              .filter(desc => desc.jobRoleId === selectedJobRole.id)
              .sort((a, b) => a.taskOrder - b.taskOrder);
            setJobDescriptions(updatedDescriptions);
            
            // Update hash to prevent duplicate updates
            const descriptionsHash = updatedDescriptions.length > 0
              ? `${updatedDescriptions.length}-${updatedDescriptions.map(d => d.id).join(',')}`
              : '';
            prevJobDescriptionsHashRef.current = descriptionsHash;
          }
        }
      }

      // Refetch to ensure all data is in sync
      const result = await refetchJobDescriptions();
      
      // Force update if we didn't already update above
      if (!editingTaskId && result?.data?.data && selectedJobRole) {
        const updatedDescriptions = result.data.data
          .filter(desc => desc.jobRoleId === selectedJobRole.id)
          .sort((a, b) => a.taskOrder - b.taskOrder);
        setJobDescriptions(updatedDescriptions);
        
        // Update hash
        const descriptionsHash = updatedDescriptions.length > 0
          ? `${updatedDescriptions.length}-${updatedDescriptions.map(d => d.id).join(',')}`
          : '';
        prevJobDescriptionsHashRef.current = descriptionsHash;
      }
      
      setShowDescriptionModal(false);
      setDescriptionFormData({
        taskDescription: '',
        status: 1,
        selectedJobRoleIds: [],
      });
      setEditingTaskId(null);
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle job role status
  const handleToggleJobRoleStatus = async (jobRoleId, currentStatus) => {
    try {
      const userId = getCurrentUserId();
      const newStatus = currentStatus === 1 ? 0 : 1;
      
      // Update local state immediately
      setJobRoles(prevRoles => 
        prevRoles.map(role => 
          role.id === jobRoleId 
            ? { ...role, status: newStatus }
            : role
        )
      );
      
      // Update selected job role if it's the one being toggled
      if (selectedJobRole?.id === jobRoleId) {
        setSelectedJobRole(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      // Update API
      await updateJobRole({
        id: jobRoleId,
        status: newStatus,
        updatedBy: userId,
      }).unwrap();
      
      // Refetch to ensure sync
      await refetchJobRoles();
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to update status');
      // Revert on error by refetching
      await refetchJobRoles();
    }
  };

  // Handle drag start
  const handleDragStart = (e, task, index) => {
    setDraggedTask({ task, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Handle drop
  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedTask || draggedTask.index === dropIndex) {
      setDraggedTask(null);
      return;
    }

    const newTasks = [...jobDescriptions];
    const [removed] = newTasks.splice(draggedTask.index, 1);
    newTasks.splice(dropIndex, 0, removed);

    // Update task orders
    const taskOrders = newTasks.map((task, index) => ({
      id: task.id,
      taskOrder: index + 1,
    }));

    try {
      setLoading(true);
      await updateTaskOrders({
        jobRoleId: selectedJobRole.id,
        taskOrders,
      }).unwrap();
      
      // Update local state
      setJobDescriptions(newTasks.map((task, index) => ({
        ...task,
        taskOrder: index + 1,
      })));
      
      // Refetch to ensure sync
      refetchJobDescriptions();
    } catch (error) {
      console.error('Error updating task orders:', error);
      setError('Failed to update task order. Please try again.');
    } finally {
      setLoading(false);
      setDraggedTask(null);
    }
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverIndex(null);
  };

  // Handle toggle description status
  const handleToggleDescriptionStatus = async (descriptionId, currentStatus) => {
    try {
      const userId = getCurrentUserId();
      const newStatus = currentStatus === 1 ? 0 : 1;
      
      // Update local state immediately
      setJobDescriptions(prevDescriptions => {
        const updated = prevDescriptions.map(desc => 
          desc.id === descriptionId 
            ? { ...desc, status: newStatus }
            : desc
        );
        // Re-sort after status change (active first, then inactive)
        return updated.sort((a, b) => {
          if (a.status !== b.status) {
            return b.status - a.status; // 1 (active) comes before 0 (inactive)
          }
          return a.taskOrder - b.taskOrder;
        });
      });
      
      // Also update allJobDescriptions in the cache by refetching
      // But first update the local state for immediate feedback
      const result = await updateJobDescription({
        id: descriptionId,
        status: newStatus,
        updatedBy: userId,
      }).unwrap();
      
      // Refetch to ensure sync with backend
      await refetchJobDescriptions();
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to update status');
      // Revert on error by refetching
      await refetchJobDescriptions();
    }
  };

  // Handle delete description
  const handleDeleteDescription = async (descriptionId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await deleteJobDescription(descriptionId).unwrap();
      await refetchJobDescriptions();
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to delete task');
    }
  };

  // Filter job roles based on member type, status, and user level
  const filteredJobRoles = useMemo(() => {
    let filtered = jobRoles;
    
    // Filter by member type
    if (memberTypeFilter !== 'all') {
      filtered = filtered.filter(role => {
        const memberTypeName = role.memberTypeName?.toLowerCase() || '';
        if (memberTypeFilter === 'internal') {
          return memberTypeName === 'internal';
        } else if (memberTypeFilter === 'external') {
          return memberTypeName === 'external';
        }
        return true;
      });
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(role => {
        if (statusFilter === 'active') {
          return role.status === 1;
        } else if (statusFilter === 'inactive') {
          return role.status === 0;
        }
        return true;
      });
    }
    
    // Filter by user level
    if (userLevelFilter !== 'all') {
      filtered = filtered.filter(role => {
        return role.userLevelId === parseInt(userLevelFilter);
      });
    }
    
    return filtered;
  }, [jobRoles, memberTypeFilter, statusFilter, userLevelFilter]);

  const activeJobRoles = jobRoles.filter(role => role.status === 1);
  const activeDescriptions = jobDescriptions.filter(desc => desc.status === 1);

  if (loadingJobRoles || loadingLevels || loadingMemberTypes) {
    return (
      <div className="jd-management-container-jd-mgmt">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="jd-management-container-jd-mgmt">
      {error && (
        <div className="jd-error-message-jd-mgmt" style={{ 
          padding: '10px', 
          margin: '10px', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="jd-top-filter-bar-jd-mgmt">
        <div className="jd-filter-group-jd-mgmt">
          <div className="jd-filter-label-jd-mgmt">Member Type:</div>
          <div className="jd-filter-buttons-jd-mgmt">
            <button
              className={`jd-filter-button-jd-mgmt ${memberTypeFilter === 'all' ? 'active-jd-mgmt' : ''}`}
              onClick={() => setMemberTypeFilter('all')}
              title="Show All"
            >
              All
            </button>
            <button
              className={`jd-filter-button-jd-mgmt ${memberTypeFilter === 'internal' ? 'active-jd-mgmt' : ''}`}
              onClick={() => setMemberTypeFilter('internal')}
              title="Show Internal Only"
            >
              Internal
            </button>
            <button
              className={`jd-filter-button-jd-mgmt ${memberTypeFilter === 'external' ? 'active-jd-mgmt' : ''}`}
              onClick={() => setMemberTypeFilter('external')}
              title="Show External Only"
            >
              External
            </button>
          </div>
        </div>
        <div className="jd-filter-group-jd-mgmt">
          <div className="jd-filter-label-jd-mgmt">Status:</div>
          <div className="jd-filter-buttons-jd-mgmt">
            <button
              className={`jd-filter-button-jd-mgmt ${statusFilter === 'all' ? 'active-jd-mgmt' : ''}`}
              onClick={() => setStatusFilter('all')}
              title="Show All"
            >
              All
            </button>
            <button
              className={`jd-filter-button-jd-mgmt ${statusFilter === 'active' ? 'active-jd-mgmt' : ''}`}
              onClick={() => setStatusFilter('active')}
              title="Show Active Only"
            >
              Active
            </button>
            <button
              className={`jd-filter-button-jd-mgmt ${statusFilter === 'inactive' ? 'active-jd-mgmt' : ''}`}
              onClick={() => setStatusFilter('inactive')}
              title="Show Inactive Only"
            >
              Inactive
            </button>
          </div>
        </div>
        <div className="jd-filter-group-jd-mgmt">
          <div className="jd-filter-label-jd-mgmt">User Level:</div>
          <select
            className="jd-filter-select-jd-mgmt"
            value={userLevelFilter}
            onChange={(e) => setUserLevelFilter(e.target.value)}
            title="Filter by User Level"
          >
            <option value="all">All</option>
            {userLevels.map(level => (
              <option key={level.id} value={level.id}>
                {level.userLevel}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="jd-management-content-jd-mgmt">
        {/* Left Panel - Registered Designations */}
        <div className="jd-left-panel-jd-mgmt">
          <div className="jd-panel-header-jd-mgmt">
            <h2 className="jd-panel-title-jd-mgmt">Registered Designations</h2>
            <button 
              className="jd-add-button-jd-mgmt"
              onClick={handleAddJob}
              title="Add New Job"
            >
              +
            </button>
          </div>
          
          <div className="jd-designations-list-jd-mgmt">
            {filteredJobRoles.length === 0 ? (
              <div className="jd-empty-state-jd-mgmt">
                {jobRoles.length === 0 
                  ? 'No designations found. Click + to add one.'
                  : `No ${memberTypeFilter === 'all' ? '' : memberTypeFilter} designations found.`
                }
              </div>
            ) : (
              filteredJobRoles.map(jobRole => (
                <div
                  key={jobRole.id}
                  className={`jd-designation-item-jd-mgmt ${
                    selectedJobRole?.id === jobRole.id ? 'active-jd-mgmt' : ''
                  } ${jobRole.status === 1 ? 'status-active-jd-mgmt' : 'status-inactive-jd-mgmt'}`}
                  onClick={() => handleJobRoleSelect(jobRole)}
                >
                  <div className="jd-designation-content-jd-mgmt">
                    <span className="jd-designation-name-jd-mgmt">{jobRole.designation}</span>
                    {jobRole.memberTypeName && (
                      <span className="jd-member-type-jd-mgmt">
                        {jobRole.memberTypeName}
                      </span>
                    )}
                  </div>
                  <button
                    className="jd-toggle-button-jd-mgmt"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleJobRoleStatus(jobRole.id, jobRole.status);
                    }}
                    title={jobRole.status === 1 ? 'Deactivate' : 'Activate'}
                  >
                    {jobRole.status === 1 ? '✓' : '○'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="jd-divider-jd-mgmt"></div>

        {/* Right Panel - Job Description Details */}
        <div className="jd-right-panel-jd-mgmt">
          {selectedJobRole ? (
            <>
              <div className="jd-details-header-jd-mgmt">
                <div>
                  <h2 className="jd-selected-designation-jd-mgmt">{selectedJobRole.designation}</h2>
                  {selectedJobRole.userLevelName && (
                    <p style={{ margin: '5px 0', color: '#004B71', fontSize: '14px', fontWeight: '600' }}>
                      {selectedJobRole.userLevelName} - {selectedJobRole.memberTypeName}
                    </p>
                  )}
                </div>
                <button
                  className="jd-edit-job-button-jd-mgmt"
                  onClick={handleEditJob}
                >
                  Edit Designation
                </button>
              </div>

              <div className="jd-description-section-jd-mgmt">
                <div className="jd-description-header-jd-mgmt">
                  <h3 className="jd-description-title-jd-mgmt">Job Description</h3>
                  <button
                    className="jd-add-task-button-jd-mgmt"
                    onClick={handleAddDescription}
                  >
                    + Add Task
                  </button>
                </div>

                {jobDescriptions.length === 0 ? (
                  <div className="jd-empty-tasks-jd-mgmt">
                    No tasks defined. Click "+ Add Task" to add job description tasks.
                  </div>
                ) : (
                  <div className="jd-tasks-list-jd-mgmt">
                    {jobDescriptions.map((task, index) => {
                      // Find other designations with the same task
                      const sharedDesignations = allJobDescriptions
                        .filter(desc => 
                          desc.taskDescription === task.taskDescription && 
                          desc.id !== task.id &&
                          desc.status === 1
                        )
                        .map(desc => {
                          const role = jobRoles.find(r => r.id === desc.jobRoleId);
                          return role ? role.designation : null;
                        })
                        .filter(Boolean);

                      // Calculate task number - only count active tasks for numbering
                      const activeTasksCount = jobDescriptions.filter(t => t.status === 1).length;
                      const taskNumber = task.status === 1 
                        ? index + 1 
                        : activeTasksCount + (index - activeTasksCount + 1);

                      return (
                        <div
                          key={task.id}
                          draggable={task.status === 1}
                          onDragStart={task.status === 1 ? (e) => handleDragStart(e, task, index) : undefined}
                          onDragOver={task.status === 1 ? (e) => handleDragOver(e, index) : undefined}
                          onDragLeave={task.status === 1 ? handleDragLeave : undefined}
                          onDrop={task.status === 1 ? (e) => handleDrop(e, index) : undefined}
                          onDragEnd={task.status === 1 ? handleDragEnd : undefined}
                          className={`jd-task-item-jd-mgmt ${task.status === 0 ? 'inactive-task-jd-mgmt' : ''} ${
                            dragOverIndex === index ? 'drag-over-jd-mgmt' : ''
                          } ${draggedTask?.index === index ? 'dragging-jd-mgmt' : ''}`}
                          style={{ cursor: task.status === 1 ? 'move' : 'default' }}
                        >
                          <div className="jd-task-content-jd-mgmt">
                            {task.status === 1 && (
                              <span className="jd-drag-handle-jd-mgmt" title="Drag to reorder">☰</span>
                            )}
                            <span className="jd-task-number-jd-mgmt">{taskNumber}.</span>
                            <div style={{ flex: 1 }}>
                              <span className="jd-task-text-jd-mgmt">{task.taskDescription}</span>
                              {sharedDesignations.length > 0 && task.status === 1 && (
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#666', 
                                  marginTop: '5px',
                                  fontStyle: 'italic'
                                }}>
                                  Also used in: {sharedDesignations.join(', ')}
                                </div>
                              )}
                            </div>
                            {task.status === 1 && (
                              <span className={`jd-task-status-jd-mgmt ${task.status === 1 ? 'active-task-badge-jd-mgmt' : 'inactive-task-badge-jd-mgmt'}`}>
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="jd-task-actions-jd-mgmt">
                            {task.status === 1 ? (
                              <>
                                <button
                                  className="jd-edit-task-button-jd-mgmt"
                                  onClick={() => handleEditDescription(task)}
                                  title="Edit Task"
                                >
                                  ✎
                                </button>
                                <button
                                  className="jd-toggle-task-button-jd-mgmt"
                                  onClick={() => handleToggleDescriptionStatus(task.id, task.status)}
                                  title="Deactivate"
                                >
                                  ✓
                                </button>
                              </>
                            ) : (
                              <button
                                className="jd-toggle-task-button-jd-mgmt"
                                onClick={() => handleToggleDescriptionStatus(task.id, task.status)}
                                title="Activate"
                              >
                                ○
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="jd-no-selection-jd-mgmt">
              <p>Select a designation from the left panel to view job description details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Job Modal */}
      {showJobModal && (
        <div className="jd-modal-overlay-jd-mgmt" onClick={() => setShowJobModal(false)}>
          <div className="jd-modal-content-jd-mgmt" onClick={(e) => e.stopPropagation()}>
            <div className="jd-modal-header-jd-mgmt">
              <h2>{isEditMode ? 'Edit Job Designation' : 'Add New Job Designation'}</h2>
              <button className="jd-modal-close-jd-mgmt" onClick={() => setShowJobModal(false)}>×</button>
            </div>
            <div className="jd-modal-body-jd-mgmt">
              {error && (
                <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
                  {error}
                </div>
              )}
              <div className="jd-form-group-jd-mgmt">
                <label>Designation Name: *</label>
                <input
                  type="text"
                  value={jobFormData.designation}
                  onChange={(e) => setJobFormData({ ...jobFormData, designation: e.target.value })}
                  placeholder="Enter job designation name"
                  autoFocus
                />
              </div>
              <div className="jd-form-group-jd-mgmt">
                <label>JD Code: *</label>
                <input
                  type="text"
                  value={jobFormData.jdCode}
                  onChange={handleJdCodeChange}
                  placeholder="Enter JD code (e.g., md, ceo, fo)"
                  style={{
                    borderColor: jdCodeError ? '#dc3545' : undefined,
                    backgroundColor: jdCodeError ? '#fff5f5' : undefined
                  }}
                />
                {jdCodeError && (
                  <div style={{ 
                    color: '#dc3545', 
                    fontSize: '12px', 
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>⚠</span>
                    <span>{jdCodeError}</span>
                  </div>
                )}
              </div>
              <div className="jd-form-group-jd-mgmt">
                <label>User Level:</label>
                <select
                  value={jobFormData.userLevelId}
                  onChange={(e) => setJobFormData({ ...jobFormData, userLevelId: e.target.value })}
                >
                  <option value="">Select User Level</option>
                  {userLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.userLevel}
                    </option>
                  ))}
                </select>
              </div>
              <div className="jd-form-group-jd-mgmt">
                <label>Member Type:</label>
                <select
                  value={jobFormData.userMemberTypeId}
                  onChange={(e) => setJobFormData({ ...jobFormData, userMemberTypeId: e.target.value })}
                >
                  <option value="">Select Member Type</option>
                  {userMemberTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.memberType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="jd-form-group-jd-mgmt">
                <label className="jd-checkbox-label-jd-mgmt">
                  <input
                    type="checkbox"
                    checked={jobFormData.status === 1}
                    onChange={(e) => setJobFormData({ ...jobFormData, status: e.target.checked ? 1 : 0 })}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            <div className="jd-modal-footer-jd-mgmt">
              <button className="jd-btn-cancel-jd-mgmt" onClick={() => setShowJobModal(false)}>
                Cancel
              </button>
              <button 
                className="jd-btn-save-jd-mgmt" 
                onClick={handleSaveJob}
                disabled={loading || creatingJobRole || updatingJobRole || !!jdCodeError}
                style={{
                  opacity: jdCodeError ? 0.6 : 1,
                  cursor: jdCodeError ? 'not-allowed' : 'pointer'
                }}
              >
                {loading || creatingJobRole || updatingJobRole ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Description Modal */}
      {showDescriptionModal && (
        <div className="jd-modal-overlay-jd-mgmt" onClick={() => setShowDescriptionModal(false)}>
          <div className="jd-modal-content-jd-mgmt" onClick={(e) => e.stopPropagation()}>
            <div className="jd-modal-header-jd-mgmt">
              <h2>{editingTaskId ? 'Edit Task' : 'Add New Task'}</h2>
              <button className="jd-modal-close-jd-mgmt" onClick={() => setShowDescriptionModal(false)}>×</button>
            </div>
            <div className="jd-modal-body-jd-mgmt">
              {error && (
                <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
                  {error}
                </div>
              )}
              {!editingTaskId && (
                <div className="jd-form-group-jd-mgmt">
                  <label>Select Designation(s): *</label>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    You can select multiple designations to add the same task to all of them
                  </p>
                  
                  {/* Selected Designations Display */}
                  {descriptionFormData.selectedJobRoleIds.length > 0 && (
                    <div className="jd-selected-designations-jd-mgmt">
                      {descriptionFormData.selectedJobRoleIds.map(roleId => {
                        const role = jobRoles.find(r => r.id === roleId);
                        if (!role) return null;
                        return (
                          <span key={roleId} className="jd-selected-tag-jd-mgmt">
                            {role.designation} ({role.jdCode})
                            <button
                              type="button"
                              className="jd-remove-tag-jd-mgmt"
                              onClick={() => {
                                setDescriptionFormData({
                                  ...descriptionFormData,
                                  selectedJobRoleIds: descriptionFormData.selectedJobRoleIds.filter(id => id !== roleId)
                                });
                              }}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Multi-Select Dropdown */}
                  <div className="jd-multi-select-container-jd-mgmt">
                    <div 
                      className="jd-multi-select-input-jd-mgmt"
                      onClick={() => setShowDesignationDropdown(!showDesignationDropdown)}
                    >
                      <input
                        type="text"
                        placeholder="Search and select designations..."
                        value={designationSearch}
                        onChange={(e) => {
                          setDesignationSearch(e.target.value);
                          setShowDesignationDropdown(true);
                        }}
                        onFocus={() => setShowDesignationDropdown(true)}
                        className="jd-search-input-jd-mgmt"
                      />
                      <span className="jd-dropdown-arrow-jd-mgmt">▼</span>
                    </div>
                    
                    {showDesignationDropdown && (
                      <div className="jd-multi-select-dropdown-jd-mgmt">
                        {jobRoles
                          .filter(role => role.status === 1)
                          .filter(role => 
                            role.designation.toLowerCase().includes(designationSearch.toLowerCase()) ||
                            role.jdCode.toLowerCase().includes(designationSearch.toLowerCase())
                          )
                          .map(role => {
                            const isSelected = descriptionFormData.selectedJobRoleIds.includes(role.id);
                            return (
                              <div
                                key={role.id}
                                className={`jd-multi-select-option-jd-mgmt ${isSelected ? 'selected-jd-mgmt' : ''}`}
                                onClick={() => {
                                  if (isSelected) {
                                    setDescriptionFormData({
                                      ...descriptionFormData,
                                      selectedJobRoleIds: descriptionFormData.selectedJobRoleIds.filter(id => id !== role.id)
                                    });
                                  } else {
                                    setDescriptionFormData({
                                      ...descriptionFormData,
                                      selectedJobRoleIds: [...descriptionFormData.selectedJobRoleIds, role.id]
                                    });
                                  }
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="jd-checkbox-jd-mgmt"
                                />
                                <span className="jd-option-text-jd-mgmt">
                                  <strong>{role.designation}</strong>
                                  <span className="jd-option-code-jd-mgmt">({role.jdCode})</span>
                                </span>
                              </div>
                            );
                          })}
                        {jobRoles.filter(role => 
                          role.status === 1 &&
                          (role.designation.toLowerCase().includes(designationSearch.toLowerCase()) ||
                           role.jdCode.toLowerCase().includes(designationSearch.toLowerCase()))
                        ).length === 0 && (
                          <div className="jd-no-results-jd-mgmt">No designations found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="jd-form-group-jd-mgmt">
                <label>Task Description: *</label>
                <textarea
                  value={descriptionFormData.taskDescription}
                  onChange={(e) => setDescriptionFormData({ ...descriptionFormData, taskDescription: e.target.value })}
                  placeholder="Enter task description"
                  rows="4"
                  autoFocus={editingTaskId}
                />
              </div>
              <div className="jd-form-group-jd-mgmt">
                <label className="jd-checkbox-label-jd-mgmt">
                  <input
                    type="checkbox"
                    checked={descriptionFormData.status === 1}
                    onChange={(e) => setDescriptionFormData({ ...descriptionFormData, status: e.target.checked ? 1 : 0 })}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            <div className="jd-modal-footer-jd-mgmt">
              <button className="jd-btn-cancel-jd-mgmt" onClick={() => setShowDescriptionModal(false)}>
                Cancel
              </button>
              <button 
                className="jd-btn-save-jd-mgmt" 
                onClick={handleSaveDescription}
                disabled={loading || creatingDescription || updatingDescription || creatingMultipleDescriptions}
              >
                {loading || creatingDescription || updatingDescription || creatingMultipleDescriptions 
                  ? 'Saving...' 
                  : (editingTaskId ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JDManagement;
