import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    // Date filters
    startDate: '',
    endDate: '',
    selectedDate: null,
    
    // Filter states
    selectedFlag: '',
    selectedType: '',
    selectedMissionType: null,
    selectedCropType: null,
    
    // Modal states
    modals: {
      imageViewer: false,
      confirmation: false,
      // Add more modal states as needed
    },
    
    // UI states
    expandedPlans: {}, // Keyed by planId
    selectedImage: null,
    imageRotation: 0,
    downloadStatus: null,
    
    // Calendar view states
    calendarView: 'corporate', // 'corporate', 'management', 'opsroom'
    
    // Loading states for UI operations
    loading: {
      download: false,
      image: false,
    },
  },
  reducers: {
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedFlag: (state, action) => {
      state.selectedFlag = action.payload;
    },
    setSelectedType: (state, action) => {
      state.selectedType = action.payload;
    },
    setSelectedMissionType: (state, action) => {
      state.selectedMissionType = action.payload;
    },
    setSelectedCropType: (state, action) => {
      state.selectedCropType = action.payload;
    },
    setCalendarView: (state, action) => {
      state.calendarView = action.payload;
    },
    togglePlanExpansion: (state, action) => {
      const planId = action.payload;
      state.expandedPlans[planId] = !state.expandedPlans[planId];
    },
    setPlanExpanded: (state, action) => {
      const { planId, expanded } = action.payload;
      state.expandedPlans[planId] = expanded;
    },
    setSelectedImage: (state, action) => {
      state.selectedImage = action.payload;
    },
    setImageRotation: (state, action) => {
      state.imageRotation = action.payload;
    },
    rotateImage: (state) => {
      state.imageRotation = (state.imageRotation + 90) % 360;
    },
    setDownloadStatus: (state, action) => {
      state.downloadStatus = action.payload;
    },
    openModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = true;
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = false;
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    resetFilters: (state) => {
      state.startDate = '';
      state.endDate = '';
      state.selectedFlag = '';
      state.selectedType = '';
      state.selectedMissionType = null;
      state.selectedCropType = null;
    },
    resetUI: (state) => {
      state.expandedPlans = {};
      state.selectedImage = null;
      state.imageRotation = 0;
      state.downloadStatus = null;
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
  },
});

export const {
  setStartDate,
  setEndDate,
  setSelectedDate,
  setSelectedFlag,
  setSelectedType,
  setSelectedMissionType,
  setSelectedCropType,
  setCalendarView,
  togglePlanExpansion,
  setPlanExpanded,
  setSelectedImage,
  setImageRotation,
  rotateImage,
  setDownloadStatus,
  openModal,
  closeModal,
  setLoading,
  resetFilters,
  resetUI,
} = uiSlice.actions;

// Selectors
export const selectStartDate = (state) => state.ui.startDate;
export const selectEndDate = (state) => state.ui.endDate;
export const selectSelectedDate = (state) => state.ui.selectedDate;
export const selectSelectedFlag = (state) => state.ui.selectedFlag;
export const selectSelectedType = (state) => state.ui.selectedType;
export const selectCalendarView = (state) => state.ui.calendarView;
export const selectIsPlanExpanded = (state, planId) => state.ui.expandedPlans[planId] || false;
export const selectSelectedImage = (state) => state.ui.selectedImage;
export const selectImageRotation = (state) => state.ui.imageRotation;
export const selectModalOpen = (state, modalName) => state.ui.modals[modalName] || false;

export default uiSlice.reducer;

