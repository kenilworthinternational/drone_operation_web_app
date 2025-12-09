import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import '../../../styles/dayendprocess.css';
import { FaCalendarAlt, FaRegArrowAltCircleRight, FaArrowCircleDown, FaArrowCircleUp, FaCheck, FaTimes, FaMinus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bars } from 'react-loader-spinner';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGetUnlinkedDjiImagesQuery, useGetAllDjiImagesQuery, useLinkDjiImageToTaskMutation } from '../../../api/services NodeJs/djiImagesApi';
import { useUpdateOpsTaskStatusMutation, useGetPlansWithCompletionStatsQuery } from '../../../api/services NodeJs/dayEndProcessApi';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input" ref={ref} onClick={onClick}>
    <input type="text" value={value} readOnly className="date-picker-input" />
    <FaCalendarAlt className="calendar-icon" />
  </div>
));

const DayEndProcess = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [expandedDivisions, setExpandedDivisions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [loadingMissionDetails, setLoadingMissionDetails] = useState(false);
  const [fieldTasks, setFieldTasks] = useState({});
  const [loadingFields, setLoadingFields] = useState({});
  const [expandedFields, setExpandedFields] = useState([]);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [currentField, setCurrentField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [djiData, setDjiData] = useState({
    dji_image_id: null, // Changed from dji_image file to dji_image_id
    dji_field_area: '',
    dji_spraying_area: '',
    dji_spraying_litres: '',
    dji_flying_duration: '',
    dji_no_of_flights: '',
  });
  
  // Get all DJI images for selected date (to show both linked and unlinked)
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const { data: allDjiImagesData } = useGetAllDjiImagesQuery({ date: selectedDateStr });
  const allDjiImages = allDjiImagesData?.data || [];
  
  // Separate linked and unlinked images
  const unlinkedDjiImages = allDjiImages.filter(img => !img.linked_task || img.linked_task === 0);
  const linkedDjiImages = allDjiImages.filter(img => img.linked_task && img.linked_task !== 0);
  
  // Link DJI image mutation
  const [linkDjiImage] = useLinkDjiImageToTaskMutation();
  
  // Update ops_task_status mutation
  const [updateOpsTaskStatus] = useUpdateOpsTaskStatusMutation();
  // State for image modal
  const [selectedImage, setSelectedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  // Add state for crop image
  const [cropImage, setCropImage] = useState(null);
  const [cropImagePreview, setCropImagePreview] = useState("");
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReasons, setReportReasons] = useState([]);
  const [selectedReportReasons, setSelectedReportReasons] = useState([]);
  const [reportDescription, setReportDescription] = useState('');
  const [existingReportData, setExistingReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Helper function to update report data after submission
  const updateReportDataAfterSubmission = async (taskId) => {
    try {
      const reportResult = await dispatch(
        baseApi.endpoints.getTaskReport.initiate(taskId)
      );
      const reportRes = reportResult.data;
      if (reportRes && reportRes.flags && reportRes.flags.length > 0) {
        setExistingReportData(reportRes.flags[0]);
      }
    } catch (e) {
      console.error('Error fetching updated report data:', e);
    }
  };


  const handleContainerClick = (missionId) => {
    setSelectedMissionId(missionId); // Update selected mission ID
    handleMissionClick(missionId); // Call original handler
  };

  // Image modal handlers
  const openImage = (imageSrc) => {
    setSelectedImage(imageSrc || '/assets/images/no-plan-found.png');
    setRotation(0);
  };

  const closeImage = () => {
    setSelectedImage(null);
    setRotation(0);
  };

  const rotateLeft = (e) => {
    e.stopPropagation();
    setRotation((prev) => (prev - 90) % 360);
  };

  const rotateRight = (e) => {
    e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const downloadImage = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `field_image_${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case 'Pending': return '#E4E4E4FF';
      case 'Complete': return '#DAFFDBFF';
      case 'Cancel': return '#FFDEDEFF';
      default: return '#0080C0FF';
    }
  };

  const handleDateChange = async (date) => {
    setMissions([]);
    setSelectedMission(null);
    setSelectedMissionId(null);
    setExpandedDivisions([]);
    setExpandedFields([]);
    setFieldTasks({});
    setLoadingFields({});
    setLoadingMissions(true);
    try {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('en-CA');
      
      // Fetch both plantation and non-plantation plans to get all plans for the date
      let plantationResponse = { status: 'false', count: 0 };
      let nonPlantationResponse = { status: 'false', count: 0 };

      const plantationResult = await dispatch(
        baseApi.endpoints.getPlansByDate.initiate(formattedDate)
      );
      if (plantationResult.error) {
        console.error('Error fetching plantation plans:', plantationResult.error);
      } else if (plantationResult.data) {
        plantationResponse = plantationResult.data;
      }

      const nonPlantationResult = await dispatch(
        baseApi.endpoints.getMissionsByRequestedDate.initiate(formattedDate)
      );
      if (nonPlantationResult.error) {
        console.error('Error fetching non-plantation plans:', nonPlantationResult.error);
      } else if (nonPlantationResult.data) {
        nonPlantationResponse = nonPlantationResult.data;
      }
      
      // Combine both responses
      let allPlans = [];
      
      // Process plantation plans
      if (plantationResponse.status === 'true' && Object.keys(plantationResponse).length > 2) {
        const plantationArray = Object.keys(plantationResponse)
          .filter((key) => !isNaN(key))
          .map((key) => plantationResponse[key]);
        allPlans = [...allPlans, ...plantationArray];
      }
      
      // Process non-plantation plans
      if (nonPlantationResponse.status === 'true' && Object.keys(nonPlantationResponse).length > 2) {
        const nonPlantationArray = Object.keys(nonPlantationResponse)
          .filter((key) => !isNaN(key))
          .map((key) => nonPlantationResponse[key]);
        allPlans = [...allPlans, ...nonPlantationArray];
      }
      
      if (allPlans.length > 0) {
        // Filter plans based on user role
        let filteredMissionArray = allPlans;
        if (userData.job_role === 'ops' && userData.member_type === 'i' && userData.user_level === 'd') {
          // For ops users with specific criteria, only show their assigned plans
          filteredMissionArray = allPlans.filter(plan => plan.operator === userData.id);
        }
        
        // Fetch completion stats for all plans
        let completionStatsMap = {};
        try {
          // Get Node.js backend URL based on environment
          const hostname = window.location.hostname;
          let backendUrl = 'https://dsms-web-api-dev.kenilworthinternational.com';
          if (hostname.includes('test')) {
            backendUrl = 'https://dsms-api-test.kenilworth.international.com';
          } else if (!hostname.includes('dev') && !hostname.includes('localhost')) {
            backendUrl = 'https://dsms-api.kenilworth.international.com';
          }
          
          const token = userData.token;
          const response = await fetch(`${backendUrl}/api/day-end-process/plans-completion-stats`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ date: formattedDate }),
          });
          const result = await response.json();
          if (result.status === true && result.data) {
            result.data.forEach(stat => {
              completionStatsMap[stat.planId] = stat;
            });
          }
        } catch (error) {
          console.error('Error fetching completion stats:', error);
          // Continue without stats if fetch fails
        }
        
        const missionOptions = filteredMissionArray.map((plan) => {
          const stats = completionStatsMap[plan.id] || { 
            totalFields: 0, 
            completedFields: 0, 
            pendingFields: 0, 
            completionPercentage: 0 
          };
          
          return {
            id: plan.id,
            group: `${plan.estate}(${(plan.estate_id)}) - ${plan.area} Ha`,
            completed: plan.completed,
            activated: plan.activated,
            team_assigned: plan.team_assigned,
            operator_name: plan.operator_name,
            total_sub_task: plan.total_sub_task,
            total_sub_task_ops_room_approved_subs: plan.total_sub_task_ops_room_approved_subs,
            total_sub_task_ops_room_pending_subs: plan.total_sub_task_ops_room_pending_subs,
            total_sub_task_ops_room_rejected_subs: plan.total_sub_task_ops_room_rejected_subs,
            completionStats: stats,
          };
        });
        
        setMissions(missionOptions);
      } else {
        setMissions([]);
      }
    } catch (error) {
      toast.error('Failed to load missions. Please try again.');
      console.error(error);
      setMissions([]);
    } finally {
      setLoadingMissions(false);
    }
  };

  const handleMissionClick = async (missionId) => {
    setLoadingMissionDetails(true);
    try {
      // Clear all field-related state when switching missions to prevent stale data
      setFieldTasks({});
      setLoadingFields({});
      setExpandedDivisions([]);
      setExpandedFields([]);
      
      const summaryResult = await dispatch(
        baseApi.endpoints.getPlanSummary.initiate(missionId)
      );
      const response = summaryResult.data;
      if (response) {
        setSelectedMission({ ...response, id: missionId });
      } else {
        setSelectedMission(null);
      }
    } catch (error) {
      console.error('Error fetching mission details:', error);
    } finally {
      setLoadingMissionDetails(false);
    }
  };

  const toggleTaskExpansion = (fieldId, taskIndex) => {
    setFieldTasks((prev) => {
      if (!prev[fieldId] || !prev[fieldId].tasks) return prev;
      return {
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          tasks: prev[fieldId].tasks.map((task, idx) =>
            idx === taskIndex ? { ...task, expanded: !task.expanded } : task
          ),
        },
      };
    });
  };

  const toggleDivision = (divisionId) => {
    setExpandedDivisions((prev) =>
      prev.includes(divisionId)
        ? prev.filter((id) => id !== divisionId)
        : [...prev, divisionId]
    );
  };

  const handleFieldClick = async (fieldId) => {
    if (!selectedMission || !selectedMission.id) {
      console.warn('No mission selected');
      return;
    }

    setExpandedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
    
    // Always fetch fresh data when clicking a field to ensure we have correct data for current mission
    // This prevents showing stale data from previous missions with same field IDs
    const existingFieldData = fieldTasks[fieldId];
    const shouldFetch = !existingFieldData || existingFieldData.mission_id !== selectedMission.id;
    
    if (shouldFetch) {
      setLoadingFields((prev) => ({ ...prev, [fieldId]: true }));
      try {
        const taskResult = await dispatch(
          baseApi.endpoints.getTasksByPlanAndField.initiate(
            {
              planId: selectedMission.id,
              fieldId,
            },
            { forceRefetch: true }
          )
        );
        const response = taskResult.data || {};
        if (response.tasks && response.tasks.length > 0) {
          setFieldTasks((prev) => ({
            ...prev,
            [fieldId]: {
              tasks: response.tasks.map((task) => ({
                ...task,
                task_image: task.task_image ? `${task.task_image}?${Date.now()}` : null,
                dji_image: task.dji_image ? `${task.dji_image}?${Date.now()}` : null,
              })),
              field_id: fieldId,
              mission_id: selectedMission.id, // Store mission ID to verify data belongs to current mission
            },
          }));
        } else {
          setFieldTasks((prev) => ({
            ...prev,
            [fieldId]: { 
              tasks: [], 
              field_id: fieldId,
              mission_id: selectedMission.id, // Store mission ID even for empty tasks
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching field tasks:', error);
      } finally {
        setLoadingFields((prev) => ({ ...prev, [fieldId]: false }));
      }
    }
  };

  const calculateTotalExtent = () => {
    if (!selectedMission?.divisions) {
      console.warn('No divisions found in mission, returning 0');
      return 0;
    }
    const total = selectedMission.divisions.reduce((total, division) => {
      const divisionTotal = division.checkedFields.reduce((sum, field) => {
        const fieldArea = parseFloat(field.field_area) || 0;
        return sum + fieldArea;
      }, 0);
      return total + divisionTotal;
    }, 0);
    return total.toFixed(2);
  };

  useEffect(() => {
    handleDateChange(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTaskApproveClick = async (fieldId, taskData) => {
    try {
      // Find the correct field from the mission data
      let fieldInfo = null;
      if (selectedMission && selectedMission.divisions) {
        for (const division of selectedMission.divisions) {
          const field = division.checkedFields?.find(f => f.field_id === fieldId);
          if (field) {
            fieldInfo = field;
            break;
          }
        }
      }
      
        const taskResult = await dispatch(
          baseApi.endpoints.getTasksByPlanAndField.initiate(
            {
              planId: selectedMission.id,
              fieldId,
            },
            { forceRefetch: true }
          )
        );
      const freshData = taskResult.data || {};
      const freshTask = freshData.tasks?.find((t) => t.task_id === taskData.task_id) || taskData;
      setCurrentTask({ ...freshTask, field_id: fieldId });
      setCurrentField(fieldInfo);
      setDjiData({
        dji_image_id: null, // Will be selected from dropdown (only unlinked images available)
        dji_field_area: freshTask.dji_field_area || '',
        dji_spraying_area: freshTask.dji_spraying_area || '',
        dji_spraying_litres: freshTask.dji_spraying_litres || '',
        dji_flying_duration: freshTask.dji_flying_duration || '',
        dji_no_of_flights: freshTask.dji_no_of_flights || '',
      });
      // Reset crop image states when opening a new task
      setCropImage(null);
      setCropImagePreview("");
      // Reset file inputs
      const cropImageInput = document.getElementById('crop-image-upload');
      if (cropImageInput) cropImageInput.value = '';
      
      // Fetch existing report data to show button color immediately
      try {
        const reportResult = await dispatch(
          baseApi.endpoints.getTaskReport.initiate(freshTask.task_id)
        );
        const reportRes = reportResult.data;
        if (reportRes && reportRes.flags && reportRes.flags.length > 0) {
          const flag = reportRes.flags[0];
          setExistingReportData(flag);
        } else {
          setExistingReportData(null);
        }
      } catch (reportError) {
        console.error('Error fetching report data:', reportError);
        setExistingReportData(null);
      }
      
      setShowTaskPopup(true);
    } catch (error) {
      console.error('Error refreshing task data:', error);
      toast.error('Failed to load latest task data');
    }
  };

  const handleTaskPopupClose = () => {
    setShowTaskPopup(false);
    setCurrentField(null);
    setCurrentTask(null);
    // Reset crop image states when closing the task popup
    setCropImage(null);
    setCropImagePreview("");
    // Reset file inputs
    const cropImageInput = document.getElementById('crop-image-upload');
    if (cropImageInput) cropImageInput.value = '';
    // Reset DJI image selection
    setDjiData((prev) => ({ ...prev, dji_image_id: null }));
    // Reset existing report data when closing the task popup
    setExistingReportData(null);
  };

  const StatusToggle = ({ status, onChange }) => {
    const getPosition = () => {
      if (status === 'a') return 'right';
      if (status === 'r') return 'left';
      return 'center';
    };

    const handleClick = (newStatus) => {
      onChange(newStatus);
    };

    return (
      <div className="tri-state-toggle">
        <div className={`slider ${getPosition()}`} />
        <div className="toggle-options">
          <div
            className={`option left ${status === 'r' ? 'active' : ''}`}
            onClick={() => handleClick('r')}
          >
            <FaTimes className="icon" />
          </div>
          <div className="option center">
            <FaMinus className="icon" />
          </div>
          <div
            className={`option right ${status === 'a' ? 'active' : ''}`}
            onClick={() => handleClick('a')}
          >
            <FaCheck className="icon" />
          </div>
        </div>
      </div>
    );
  };

  // Get image URL for selected DJI image
  const getDjiImageUrl = () => {
    // If a DJI image is selected from dropdown
    if (djiData.dji_image_id) {
      const selectedImage = allDjiImages.find(img => img.id === parseInt(djiData.dji_image_id));
      if (selectedImage) {
        const baseUrl = 'https://dsms-web-api-dev.kenilworthinternational.com';
        return `${baseUrl}/api/dji-images/file/${selectedImage.image_filename}`;
      }
    }
    // If task already has a linked DJI image (from old system)
    if (currentTask?.dji_image) {
      return currentTask.dji_image;
    }
    return null;
  };
  
  // Fetch DJI image file as Blob for upload to old API
  const fetchDjiImageFile = async (imageId) => {
    try {
      const selectedImage = allDjiImages.find(img => img.id === parseInt(imageId));
      if (!selectedImage) return null;
      
      const baseUrl = 'https://dsms-web-api-dev.kenilworthinternational.com';
      const imageUrl = `${baseUrl}/api/dji-images/file/${selectedImage.image_filename}`;
      
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const token = userData.token;
      
      const response = await fetch(imageUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      // Create a File object from the blob with the original filename
      const file = new File([blob], selectedImage.image_filename, { type: blob.type });
      return file;
    } catch (error) {
      console.error('Error fetching DJI image file:', error);
      return null;
    }
  };

  // Add handler for crop image upload
  const handleCropImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCropImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCropImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const formatNumber = (value, decimals = 2) => {
        const num = Number(String(value).replace(/,/g, ''));
        return isNaN(num) ? 0 : num.toFixed(decimals);
      };
      formData.append('task_id', currentTask.task_id);
      formData.append('dji_field_area', formatNumber(djiData.dji_field_area));
      formData.append('dji_spraying_area', formatNumber(djiData.dji_spraying_area));
      formData.append('dji_spraying_litres', formatNumber(djiData.dji_spraying_litres));
      formData.append('dji_flying_duration', formatNumber(djiData.dji_flying_duration));
      formData.append('dji_no_of_flights', formatNumber(djiData.dji_no_of_flights));
      
      // Fetch and upload DJI image file to old API if image is selected
      if (djiData.dji_image_id) {
        const imageFile = await fetchDjiImageFile(djiData.dji_image_id);
        if (imageFile) {
          formData.append('image', imageFile);
        } else {
          toast.warning('Selected DJI image could not be loaded. Proceeding without image.');
        }
      }
      
      // Only append crop image if a file is selected and is a File instance
      if (cropImage && cropImage instanceof File) {
        formData.append('image_crop', cropImage);
      }
      
      const submitResult = await dispatch(baseApi.endpoints.submitDJIRecord.initiate(formData));
      const response = submitResult.data;
      if (response?.success || response?.status === 'true') {
        // Update ops_task_status to 's' (success) in field_pilot_and_drones
        try {
          await updateOpsTaskStatus({
            taskId: currentTask.task_id,
            status: 's'
          }).unwrap();
          
          // Refresh completion stats for the plan
          if (selectedMission && selectedMission.id) {
            const hostname = window.location.hostname;
            let backendUrl = 'https://dsms-web-api-dev.kenilworthinternational.com';
            if (hostname.includes('test')) {
              backendUrl = 'https://dsms-api-test.kenilworth.international.com';
            } else if (!hostname.includes('dev') && !hostname.includes('localhost')) {
              backendUrl = 'https://dsms-api.kenilworth.international.com';
            }
            
            const formattedDate = selectedDate.toLocaleDateString('en-CA');
            const statsResponse = await fetch(`${backendUrl}/api/day-end-process/plans-completion-stats`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.token}`,
              },
              body: JSON.stringify({ date: formattedDate }),
            });
            const statsResult = await statsResponse.json();
            if (statsResult.status === true && statsResult.data) {
              const updatedStats = statsResult.data.find(stat => stat.planId === selectedMission.id);
              if (updatedStats) {
                setMissions(prevMissions => 
                  prevMissions.map(mission => 
                    mission.id === selectedMission.id 
                      ? { ...mission, completionStats: updatedStats }
                      : mission
                  )
                );
              }
            }
          }
        } catch (updateError) {
          console.error('Error updating ops_task_status:', updateError);
          // Don't fail the whole submission if this update fails
        }
        
        // Link DJI image to task after successful submission to old API
        if (djiData.dji_image_id) {
          try {
            await linkDjiImage({
              imageId: parseInt(djiData.dji_image_id),
              taskId: currentTask.task_id
            }).unwrap();
          } catch (linkError) {
            console.error('Error linking DJI image:', linkError);
            // Don't fail the whole submission if linking fails
            toast.warning('DJI data submitted, but failed to link image. Please link manually.');
          }
        }
        toast.success('DJI data submitted successfully!');
        try {
          const updatedResult = await dispatch(
            baseApi.endpoints.getTasksByPlanAndField.initiate(
              {
                planId: selectedMission.id,
                fieldId: currentTask.field_id,
              },
              { forceRefetch: true }
            )
          );
          const updatedData = updatedResult.data || {};
          const previousTasks = fieldTasks[currentTask.field_id]?.tasks || [];
          const updatedTasks = updatedData.tasks?.map((task) => {
            const previousTask = previousTasks.find((t) => t.task_id === task.task_id);
            return {
              ...task,
              expanded: previousTask ? previousTask.expanded : false,
              task_image: task.task_image ? `${task.task_image}?${Date.now()}` : null,
              dji_image: task.dji_image ? `${task.dji_image}?${Date.now()}` : null,
            };
          }) || [];
          setFieldTasks((prev) => ({
            ...prev,
            [currentTask.field_id]: {
              tasks: updatedTasks,
              field_id: currentTask.field_id,
            },
          }));
        } catch (error) {
          console.error('Error refetching task data:', error);
        }
        handleTaskPopupClose();
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during submission.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    if (showReportPopup && currentTask) {
      setReportLoading(true);
      setReportReasons([]);
      setSelectedReportReasons([]);
      setReportDescription('');
      setExistingReportData(null);

      const loadReportData = async () => {
        try {
          const [reasonsResult, reportResult] = await Promise.all([
            dispatch(baseApi.endpoints.getFlagReasons.initiate()),
            dispatch(baseApi.endpoints.getTaskReport.initiate(currentTask.task_id)),
          ]);

          const reasonsRes = reasonsResult.data;
          const reportRes = reportResult.data;

          if (Array.isArray(reasonsRes)) {
            setReportReasons(reasonsRes);
            console.log('Fetched report reasons:', reasonsRes);
          }
          if (reportRes && reportRes.flags && reportRes.flags.length > 0) {
            const flag = reportRes.flags[0];
            setExistingReportData(flag);
            setReportDescription(flag.reason_text || '');
            setSelectedReportReasons(
              (flag.reasons || []).map((r) => String(r.reason_id))
            );
          }
        } catch (error) {
          console.error('Error fetching report data:', error);
        } finally {
          setReportLoading(false);
        }
      };

      loadReportData();
    } else if (!showReportPopup) {
      setReportReasons([]);
      setSelectedReportReasons([]);
      setReportDescription('');
      // Only reset existingReportData if task popup is also closed
      if (!showTaskPopup) {
        setExistingReportData(null);
      }
      setReportLoading(false);
      setReportSubmitting(false);
    }
    // eslint-disable-next-line
  }, [showReportPopup, currentTask, showTaskPopup]);

  return (
    <div className="dayendprocess">
      <div className="dayendprocess-header">
        <button 
          className="dayendprocess-back-btn" 
          onClick={() => navigate('/home/workflowDashboard')}
          title="Go back to Workflow Dashboard"
        >
          <span className="back-btn-icon-dayend">←</span>
        </button>
        <h1 className="dayendprocess-title">Day End Process</h1>
        <div className="date-area-dayendprocess-header">
          <label>Plan Date: </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy/MM/dd"
            customInput={<CustomDateInput />}
          />
        </div>
      </div>
      <div className="dayendprocess-content">
        <div className="left-dayend">
        <div className="dayendprocess-missions-list">
          {loadingMissions ? (
            <Bars height="50" width="50" color="#004B71" ariaLabel="loading" />
          ) : (
            [...missions]
              .sort((a, b) => {
                // Missions with activated === 0 go to the end
                if (a.activated === 0 && b.activated !== 0) return 1;
                if (a.activated !== 0 && b.activated === 0) return -1;
                // Missions with team_assigned === 0 go before activated === 0 but after others
                if (a.team_assigned !== 0 && b.team_assigned === 0) return -1;
                if (a.team_assigned === 0 && b.team_assigned !== 0) return 1;
                // Missions with pending subs (total_sub_task_ops_room_pending_subs !== 0) go first
                if (a.total_sub_task_ops_room_pending_subs !== 0 && b.total_sub_task_ops_room_pending_subs === 0) return -1;
                if (a.total_sub_task_ops_room_pending_subs === 0 && b.total_sub_task_ops_room_pending_subs !== 0) return 1;

                // Missions with rejected subs (total_sub_task_ops_room_rejected_subs !== 0) go next
                if (a.total_sub_task_ops_room_rejected_subs !== 0 && b.total_sub_task_ops_room_rejected_subs === 0) return -1;
                if (a.total_sub_task_ops_room_rejected_subs === 0 && b.total_sub_task_ops_room_rejected_subs !== 0) return 1;

                // For the rest, maintain original order or sort by another criterion (e.g., id)
                return a.id - b.id;
              })
              .map((mission) => (
                <div
                  key={mission.id}
                  className={`dayendprocess-mission-container ${mission.activated === 0
                    ? 'mission-canceled-byops'
                    : mission.team_assigned === 0
                      ? 'team-not-assigned'
                      : mission.completed === 1
                        ? 'completed-mission'
                        : 'incomplete-mission'
                    } ${selectedMissionId === mission.id ? 'clicked-one' : ''}`}
                  onClick={() => handleContainerClick(mission.id)}
                >
                  <div className="mission-container-left">
                    <p><strong>{mission.group} - ({mission.id})</strong> </p>
                    <p><strong>Ops Assignment: </strong>{mission.operator_name && mission.operator_name.trim() !== '' ? mission.operator_name : 'Not Assigned'}</p>
                    {mission.completionStats && mission.completionStats.totalFields > 0 && (
                      <div className="ops-completion-stats-dayend">
                        <span className="ops-completion-label-dayend">OPS Completed - {mission.completionStats.completionPercentage}%</span>
                        <span className="ops-completion-detail-dayend">
                          ({mission.completionStats.completedFields}/{mission.completionStats.totalFields})
                        </span>
                      </div>
                    )}
                    <div className="completion-checkbox" onClick={(e) => e.stopPropagation()}>
                      <label className="dir-opstext">
                        Dir-Ops Approval
                        <input
                          type="checkbox"
                          checked={mission.completed === 1}
                          disabled={userData.job_role !== 'dops' || mission.activated === 0 || mission.team_assigned === 0}
                          onChange={async (e) => {
                            if (userData.job_role !== 'dops') {
                              toast.error("You don't have permission to modify approvals");
                              return;
                            }
                            const newStatus = e.target.checked ? 1 : 0;
                            try {
                              const updatedMissions = missions.map((m) =>
                                m.id === mission.id ? { ...m, completed: newStatus } : m
                              );
                              setMissions(updatedMissions);
                              const approvalResult = await dispatch(
                                baseApi.endpoints.updateOpsApproval.initiate({
                                  plan: mission.id,
                                  status: newStatus,
                                })
                              );
                              const response = approvalResult.data || {};
                              if (response.status === 'true' || response.success === true) {
                                toast.success('Status updated successfully');
                                await handleDateChange(selectedDate);
                              } else {
                                setMissions(missions);
                                toast.error(response.message || 'Update failed');
                              }
                            } catch (error) {
                              console.error('Update error:', error);
                              setMissions(missions);
                              toast.error('Failed to update status');
                            }
                          }}
                        />
                      </label>
                    </div>
                    {mission.activated === 0 && (
                      <div className="deactivate_alert">Deactivated Plan</div>
                    )}
                    {mission.team_assigned === 0 && (
                      <div className="deactivate_alert">Team Not Assigned</div>
                    )}
                  </div>
                  <div className="mission-container-right">
                    <FaRegArrowAltCircleRight />
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      <div className="right-dayend">
        {loadingMissionDetails && (
          <Bars height="50" width="50" color="#004B71" ariaLabel="loading" />
        )}
        {(!loadingMissionDetails && selectedMission) ? (
          <div className="mission-details-container">
            <h3>
              {selectedMission?.estateName ?? 'Unknown Estate'} - {calculateTotalExtent()} Ha
            </h3>
            {selectedMission.divisions && selectedMission.divisions.length > 0 ? (
              selectedMission.divisions.map((division) => (
              <div key={division.divisionId} className="division-container">
                <div
                  className="division-header"
                  onClick={() => toggleDivision(division.divisionId)}
                >
                  <span>{division.divisionName}</span>
                  <span className="division-total-dayend">
                    {division.checkedFields
                      .reduce((sum, field) => sum + (parseFloat(field.field_area) || 0), 0)
                      .toFixed(2)} Ha
                    {expandedDivisions.includes(division.divisionId) ? (
                      <FaArrowCircleUp className="toggle-icon" />
                    ) : (
                      <FaArrowCircleDown className="toggle-icon" />
                    )}
                  </span>
                </div>
                {expandedDivisions.includes(division.divisionId) && (
                  <div className="fields-list">
                    {division.checkedFields.map((field) => (
                      <div
                        key={field.field_id}
                        className={`field-item ${field.field_pilots?.status === 'false' ? 'field-pilot-warning' : ''}`}
                      >
                        <div
                          className="field-header"
                          onClick={() => handleFieldClick(field.field_id)}
                        >
                          <span>
                            <span
                              style={{
                                color: field.activated ? '#4CAF50' : '#f44336',
                                fontSize: '25px',
                              }}
                              title={field.activated ? 'Active Field' : 'Inactive Field'}
                            >
                              ●
                            </span>
                            {field.field_name} - ({field.field_id})
                          </span>
                          <span>
                            {field.field_pilots?.status === 'false' && (
                              <span className="warning-badge">⚠️ No Pilot Assigned</span>
                            )}
                            {field.field_area} Ha
                            {loadingFields[field.field_id] ? (
                              <Bars height="20" width="20" color="#004B71" />
                            ) : expandedFields.includes(field.field_id) ? (
                              <FaArrowCircleUp className="toggle-icon" />
                            ) : (
                              <FaArrowCircleDown className="toggle-icon" />
                            )}
                          </span>
                        </div>
                        {expandedFields.includes(field.field_id) && (
                          <div className="field-tasks-container">
                            {(fieldTasks[field.field_id]?.tasks || []).map((task, taskIndex) => (
                              <div key={`task-${task.task_id}-${taskIndex}`} className="task-details-dayend">
                                <div
                                  className="task-header"
                                  style={{
                                    backgroundColor: getStatusBackground(task.task_status_text),
                                    transition: 'all 0.3s ease',
                                  }}
                                  onClick={() => toggleTaskExpansion(field.field_id, taskIndex)}
                                >
                                  <h4>Task {taskIndex + 1} : {task.drone_tag} - {task.pilot}</h4>
                                  {task.expanded ? <FaArrowCircleUp /> : <FaArrowCircleDown />}
                                </div>
                                {task.expanded && (
                                  <div className="tasks-all">
                                    <div className="task-content">
                                      <div className="task-content-left">
                                        <div className="task-text">
                                          <p>Task ID: {task.task_id}</p>
                                          <p>Field Area: {parseFloat(task.task_fieldArea || 0).toFixed(2)} Ha</p>
                                          <p>Sprayed Area: {parseFloat(task.task_sprayedArea || 0).toFixed(2)}</p>
                                          <p>Obstacle Area: {parseFloat(task.task_obstacleArea || 0).toFixed(2)}</p>
                                        </div>
                                        <div className="task-text">
                                          <p>Margin Area: {parseFloat(task.task_marginArea || 0).toFixed(2)}</p>
                                          <p>Liters Used: {parseFloat(task.task_sprayedLiters || 0).toFixed(2)}</p>
                                          <p>Status: {task.task_status_text}</p>
                                          <p>Pilot: {task.pilot}</p>
                                          <p>Drone: {task.drone_tag}</p>
                                        </div>
                                      </div>
                                      <div className="task-image-container">
                                        <img
                                          src={task.task_image || '/assets/images/no-plan-found.png'}
                                          alt="Field task"
                                          className="task-image"
                                          onClick={() => openImage(task.task_image)}
                                        />
                                      </div>
                                    </div>
                                    <div className="button-set-dayend">
                                      <button
                                        className="confirm-button-dayend"
                                        onClick={() => handleTaskApproveClick(field.field_id, task)}
                                      >
                                        Task
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
            ) : (
              <div className="placeholder-text">Select a mission to view details</div>
            )}
          </div>
        ) : null}
      </div>
      {/* Full-screen image modal - Using Portal to render outside component hierarchy */}
        {selectedImage && createPortal(
          <div className="image_modal" onClick={closeImage}>
            <div className="image_modal_content_wrapper" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage}
                alt="Full-screen"
                className="image_modal_content"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
              <div className="image_modal_controls">
                <button className="image_modal_btn rotate_left" onClick={rotateLeft} title="Rotate Left">
                  ↺
                </button>
                <button className="image_modal_btn rotate_right" onClick={rotateRight} title="Rotate Right">
                  ↻
                </button>
                <button className="image_modal_btn download-btn" onClick={downloadImage} title="Download">
                  ⬇
                </button>
                <button className="image_modal_close" onClick={closeImage} title="Close">
                  ✕
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
        {showTaskPopup && currentTask && (
          <div className="task-popup-overlay" onClick={handleTaskPopupClose}>
            <div className="task-popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="task-popup-header">
                <div className="task-popup-header-top">
                  <h3>{currentField?.field_name || 'Unknown Field'} - TaskID: {currentTask.task_id} | {currentField?.field_area || currentTask.task_fieldArea || 'N/A'} Ha</h3>
                  <button
                    className="submit-button2"
                    style={{
                      background: existingReportData
                        ? existingReportData.status === 'a'
                          ? '#2fc653'
                          : existingReportData.status === 'r'
                          ? '#ff4d4f'
                          : existingReportData.status === 'p'
                          ? '#948F62FF'
                          : '#004B71'
                        : '#004B71',
                      color: '#fff',
                      border: existingReportData ? '1.5px solid #888' : undefined,
                    }}
                    onClick={() => setShowReportPopup(true)}
                  >
                    Report
                  </button>
                  <button className="close-button" onClick={handleTaskPopupClose}>✖</button>
                </div>
                <div className="task-top-line">
                  <span className="status-badge">Status: {currentTask.task_status_text}</span>
                  <span>Drone: {currentTask.drone_tag}</span>
                  <span>Pilot: {currentTask.pilot}</span>
                  <span>Mobile: {currentTask.mobile_no}</span>
                </div>
              </div>
              <div className="task-popup-body">
                <div className="task-images-section">
                  <div className="image-card-full">
                    <h4>Task Image</h4>
                    <img
                      src={currentTask.task_image || '/assets/images/no-plan-found.png'}
                      alt="Task"
                      className="popup-image"
                      onClick={() => openImage(currentTask.task_image)}
                    />
                  </div>
                  <div className="image-cards-row">
                    <div className="image-card2">
                      <h4>DJI Image</h4>
                      <img
                        src={getDjiImageUrl() || '/assets/images/no-plan-found.png'}
                        alt="DJI"
                        className="popup-image"
                        onClick={() => {
                          const url = getDjiImageUrl();
                          if (url) openImage(url);
                        }}
                      />
                      <select
                        value={djiData.dji_image_id || ''}
                        onChange={(e) => {
                          // Only allow selection of unlinked images
                          const selectedValue = e.target.value;
                          if (selectedValue && !unlinkedDjiImages.find(img => img.id.toString() === selectedValue)) {
                            return; // Prevent selection of linked images
                          }
                          setDjiData((prev) => ({
                            ...prev,
                            dji_image_id: selectedValue || null,
                          }));
                        }}
                        className="dji-image-select"
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginTop: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                        }}
                      >
                        <option value="">Select DJI Image</option>
                        {/* Show unlinked images (selectable) */}
                        {unlinkedDjiImages.map((image) => (
                          <option key={image.id} value={image.id}>
                            {image.auto_generated_id} {image.is_plantation === 1 ? `(${image.estate_name} - ${image.field_name})` : `(NIC: ${image.nic})`}
                          </option>
                        ))}
                        {/* Show linked images (disabled, not selectable) */}
                        {linkedDjiImages.length > 0 && (
                          <optgroup label="Already Used (Not Available)">
                            {linkedDjiImages.map((image) => (
                              <option key={image.id} value={image.id} disabled style={{ color: '#999', fontStyle: 'italic' }}>
                                {image.auto_generated_id} {image.is_plantation === 1 ? `(${image.estate_name} - ${image.field_name})` : `(NIC: ${image.nic})`} - Used
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                    <div className="image-card2">
                      <h4>Crop Image</h4>
                      <img
                        src={
                          cropImagePreview ||
                          currentTask.image_crop ||
                          '/assets/images/no-plan-found.png'
                        }
                        alt="Crop"
                        className="popup-image"
                        onClick={() =>
                          openImage(
                            cropImagePreview ||
                            currentTask.image_crop ||
                            '/assets/images/no-plan-found.png'
                          )
                        }
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCropImageUpload}
                        id="crop-image-upload"
                        className="image-upload-input"
                      />
                    </div>
                  </div>
                </div>
                <div className="data-grid">
                  <div className="data-row">
                    <div className="data-item">
                      <label>Pilot Field Area (Ha):</label>
                      <input
                        type="number"
                        value={currentTask.task_fieldArea}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="data-item">
                      <label>DJI Field Area (Ha):</label>
                      <input
                        type="number"
                        value={djiData.dji_field_area}
                        onChange={(e) =>
                          setDjiData((prev) => ({
                            ...prev,
                            dji_field_area: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="data-row">
                    <div className="data-item">
                      <label>Pilot Sprayed Area (Ha):</label>
                      <input
                        type="number"
                        value={currentTask.task_sprayedArea}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="data-item">
                      <label>DJI Spraying Area (Ha):</label>
                      <input
                        type="number"
                        value={djiData.dji_spraying_area}
                        onChange={(e) =>
                          setDjiData((prev) => ({
                            ...prev,
                            dji_spraying_area: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="data-row">
                    <div className="data-item">
                      <label>Pilot Sprayed Liters:</label>
                      <input
                        type="number"
                        value={currentTask.task_sprayedLiters}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="data-item">
                      <label>DJI Sprayed Liters:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={djiData.dji_spraying_litres}
                        onChange={(e) =>
                          setDjiData((prev) => ({
                            ...prev,
                            dji_spraying_litres: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="data-row">
                    <div className="data-item">
                      <label>DJI Flying Duration (mins):</label>
                      <input
                        type="number"
                        value={djiData.dji_flying_duration}
                        onChange={(e) =>
                          setDjiData((prev) => ({
                            ...prev,
                            dji_flying_duration: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="data-item">
                      <label>DJI No of Flights:</label>
                      <input
                        type="number"
                        value={djiData.dji_no_of_flights}
                        onChange={(e) =>
                          setDjiData((prev) => ({
                            ...prev,
                            dji_no_of_flights: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="data-row submit-row">
                    <button
                      className="submit-button"
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting ||
                        !djiData.dji_flying_duration ||
                        !djiData.dji_no_of_flights ||
                        !djiData.dji_field_area ||
                        !djiData.dji_spraying_litres ||
                        !djiData.dji_spraying_area
                      }
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit DJI Data'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {showReportPopup && currentTask && (
          <div className="task-popup-overlay" onClick={() => setShowReportPopup(false)}>
            <div className="task-popup-content" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
              <button className="close-button" onClick={() => setShowReportPopup(false)}>✖</button>
              <h3>Report Task - ID: {currentTask.task_id}</h3>
              {reportLoading ? (
                <div style={{ textAlign: 'center', margin: '32px 0' }}>Loading...</div>
              ) : (
                <>
                  {existingReportData ? (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 600 }}>Explanation:</label>
                        <textarea
                          value={reportDescription}
                          onChange={e => setReportDescription(e.target.value)}
                          rows={3}
                          style={{ width: '100%', resize: 'vertical', marginTop: 4 }}
                          placeholder="Describe the issue..."
                        />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 600 }}>Select Reason(s):</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, maxWidth: 320 }}>
                          {reportReasons.map((r) => {
                            const selected = selectedReportReasons.includes(String(r.id));
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => {
                                  setSelectedReportReasons(prev =>
                                    selected ? prev.filter(id => id !== String(r.id)) : [...prev, String(r.id)]
                                  );
                                }}
                                style={{
                                  padding: '6px 16px',
                                  borderRadius: 16,
                                  border: selected ? '1.5px solid #2fc653' : '1px solid #ccc',
                                  background: selected ? '#eaffea' : '#fff',
                                  color: '#222',
                                  fontWeight: 500,
                                  fontSize: 15,
                                  cursor: 'pointer',
                                  outline: 'none',
                                  transition: 'background 0.15s, border 0.15s',
                                  boxShadow: selected ? '0 1px 4px #2fc65322' : 'none',
                                  minWidth: 80,
                                }}
                              >
                                {r.reason}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        className="submit-button"
                        style={{ width: '100%' }}
                        onClick={async () => {
                          setReportSubmitting(true);
                          try {
                            const reportResult = await dispatch(
                              baseApi.endpoints.reportTask.initiate({
                                taskId: currentTask.task_id,
                                reason: reportDescription,
                                reasonList: selectedReportReasons,
                              })
                            );
                            const res = reportResult.data;
                            if (res && res.status === 'true') {
                              toast.success('Report submitted successfully');
                              await updateReportDataAfterSubmission(currentTask.task_id);
                              setShowReportPopup(false);
                            } else {
                              toast.error('Failed to submit report');
                            }
                          } catch (err) {
                            toast.error('Error submitting report');
                          } finally {
                            setReportSubmitting(false);
                          }
                        }}
                        disabled={
                          reportSubmitting ||
                          !reportDescription.trim() ||
                          selectedReportReasons.length === 0
                        }
                      >
                        {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 600 }}>Select Reason(s):</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, maxWidth: 320 }}>
                          {reportReasons.map((r) => {
                            const selected = selectedReportReasons.includes(String(r.id));
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => {
                                  setSelectedReportReasons(prev =>
                                    selected ? prev.filter(id => id !== String(r.id)) : [...prev, String(r.id)]
                                  );
                                }}
                                style={{
                                  padding: '6px 16px',
                                  borderRadius: 16,
                                  border: selected ? '1.5px solid #2fc653' : '1px solid #ccc',
                                  background: selected ? '#eaffea' : '#fff',
                                  color: '#222',
                                  fontWeight: 500,
                                  fontSize: 15,
                                  cursor: 'pointer',
                                  outline: 'none',
                                  transition: 'background 0.15s, border 0.15s',
                                  boxShadow: selected ? '0 1px 4px #2fc65322' : 'none',
                                  minWidth: 80,
                                }}
                              >
                                {r.reason}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 600 }}>Explanation:</label>
                        <textarea
                          value={reportDescription}
                          onChange={e => setReportDescription(e.target.value)}
                          rows={3}
                          style={{ width: '100%', resize: 'vertical', marginTop: 4 }}
                          placeholder="Describe the issue..."
                        />
                      </div>
                      <button
                        className="submit-button"
                        style={{ width: '100%' }}
                        onClick={async () => {
                          setReportSubmitting(true);
                          try {
                            const reportResult = await dispatch(
                              baseApi.endpoints.reportTask.initiate({
                                taskId: currentTask.task_id,
                                reason: reportDescription,
                                reasonList: selectedReportReasons,
                              })
                            );
                            const res = reportResult.data;
                            if (res && res.status === 'true') {
                              toast.success('Report submitted successfully');
                              await updateReportDataAfterSubmission(currentTask.task_id);
                              setShowReportPopup(false);
                            } else {
                              toast.error('Failed to submit report');
                            }
                          } catch (err) {
                            toast.error('Error submitting report');
                          } finally {
                            setReportSubmitting(false);
                          }
                        }}
                        disabled={
                          reportSubmitting ||
                          !reportDescription.trim() ||
                          selectedReportReasons.length === 0
                        }
                      >
                        {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayEndProcess;