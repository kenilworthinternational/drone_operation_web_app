import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  useGetAccidentReportsQuery,
  useGetAccidentReportByIdQuery,
  useGetPilotsQuery,
  useDeclineAccidentReportMutation,
} from '../../../../api/services NodeJs/accidentReportsApi';
import {
  useCreateMaintenanceFromIncidentMutation,
  useGetTechniciansQuery,
} from '../../../../api/services NodeJs/maintenanceApi';
import { downloadResource, getResourceUrl } from '../utils/media';

const EMPTY_FILTERS = {
  start_date: '',
  end_date: '',
  pilot: '',
  equipment_type: '',
  device_serial: '',
};

const EMPTY_ACTION_FORM = {
  decline_reason: '',
  technician_id: '',
  description: '',
  scheduled_date: '',
};

function getCurrentUserId() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  return userData?.id || null;
}

export function useIncidentReportsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageRotation, setImageRotation] = useState(0);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionForm, setActionForm] = useState(EMPTY_ACTION_FORM);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const cleanFilters = useMemo(() => {
    const cleaned = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key]) cleaned[key] = filters[key];
    });
    return cleaned;
  }, [filters]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => String(value || '').trim() !== '').length,
    [filters]
  );
  const hasActiveFilters = activeFilterCount > 0;

  const { data: reportsData, isLoading, error, refetch } = useGetAccidentReportsQuery(cleanFilters);
  const { data: pilotsData } = useGetPilotsQuery();
  const { data: reportDetail, isLoading: detailLoading } = useGetAccidentReportByIdQuery(selectedReport?.id, {
    skip: !showDetailsModal || !selectedReport?.id,
  });
  const [declineReport] = useDeclineAccidentReportMutation();
  const [createMaintenance] = useCreateMaintenanceFromIncidentMutation();
  const { data: techniciansData } = useGetTechniciansQuery();

  const reports = Array.isArray(reportsData) ? reportsData : reportsData ? [reportsData] : [];
  const pilots = Array.isArray(pilotsData) ? pilotsData : pilotsData ? [pilotsData] : [];
  const technicians = Array.isArray(techniciansData) ? techniciansData : techniciansData ? [techniciansData] : [];
  const detailView = reportDetail || selectedReport;

  useEffect(() => {
    if (!message || messageType !== 'success') return undefined;
    const timer = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [message, messageType]);

  const filteredReports = useMemo(() => {
    if (!reports.length) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter((report) => {
      if (!report) return false;
      return (
        String(report.id || '').includes(term) ||
        (report.pilot_name && String(report.pilot_name).toLowerCase().includes(term)) ||
        (report.device_serial && String(report.device_serial).toLowerCase().includes(term)) ||
        (report.estate_name && String(report.estate_name).toLowerCase().includes(term)) ||
        (report.equipment_type_name && String(report.equipment_type_name).toLowerCase().includes(term)) ||
        (report.incident_type_name && String(report.incident_type_name).toLowerCase().includes(term))
      );
    });
  }, [reports, searchTerm]);

  const openDetails = useCallback((report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  }, []);

  const closeDetails = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedReport(null);
  }, []);

  const openAction = useCallback((report, type) => {
    setSelectedReport(report);
    setActionType(type);
    setActionForm(EMPTY_ACTION_FORM);
    setShowActionModal(true);
  }, []);

  const closeAction = useCallback(() => {
    setShowActionModal(false);
    setSelectedReport(null);
    setActionType(null);
    setActionForm(EMPTY_ACTION_FORM);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const handleDownload = useCallback((url, filename, resourceType) => {
    try {
      downloadResource(url, filename, resourceType);
    } catch {
      try {
        window.open(getResourceUrl(url, resourceType), '_blank');
      } catch {
        setMessage('Could not download this file. Try right-click and Save As.');
        setMessageType('warning');
      }
    }
  }, []);

  const openImageViewer = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
    setImageRotation(0);
  }, []);

  const closeImageViewer = useCallback(() => {
    setSelectedImage(null);
    setImageRotation(0);
  }, []);

  const rotateImage = useCallback((direction) => {
    setImageRotation((prev) => (direction === 'left' ? prev - 90 : prev + 90));
  }, []);

  const submitAction = useCallback(
    async (event) => {
      event.preventDefault();
      if (!selectedReport) return;

      try {
        const userId = getCurrentUserId();
        if (!userId) {
          setMessage('Please sign in again to continue.');
          setMessageType('warning');
          return;
        }

        if (actionType === 'decline') {
          if (!actionForm.decline_reason.trim()) {
            setMessage('Please enter a decline reason.');
            setMessageType('warning');
            return;
          }
          await declineReport({
            id: selectedReport.id,
            decline_reason: actionForm.decline_reason,
            action_by: userId,
          }).unwrap();
          setMessage('Incident report declined.');
          setMessageType('success');
        } else if (actionType === 'repair') {
          if (!actionForm.technician_id || !actionForm.description.trim() || !actionForm.scheduled_date) {
            setMessage('Technician, description, and scheduled date are required.');
            setMessageType('warning');
            return;
          }
          await createMaintenance({
            incidentId: selectedReport.id,
            created_by: userId,
            technician_id: parseInt(actionForm.technician_id, 10),
            description: actionForm.description,
            scheduled_date: actionForm.scheduled_date,
          }).unwrap();
          setMessage('Maintenance record created from incident.');
          setMessageType('success');
        }

        closeAction();
        refetch();
      } catch (err) {
        setMessage(err?.data?.message || err?.message || 'Could not complete this action.');
        setMessageType('warning');
      }
    },
    [actionForm, actionType, closeAction, createMaintenance, declineReport, refetch, selectedReport]
  );

  return {
    filters,
    hasActiveFilters,
    activeFilterCount,
    searchTerm,
    setSearchTerm,
    pilots,
    technicians,
    reports,
    filteredReports,
    isLoading,
    error,
    message,
    messageType,
    detailView,
    detailLoading,
    showDetailsModal,
    showActionModal,
    selectedReport,
    actionType,
    actionForm,
    setActionForm,
    selectedImage,
    imageRotation,
    handleFilterChange,
    clearFilters,
    openDetails,
    closeDetails,
    openAction,
    closeAction,
    submitAction,
    handleDownload,
    openImageViewer,
    closeImageViewer,
    rotateImage,
  };
}
