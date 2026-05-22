import React, { useState, useMemo, Fragment } from 'react';
import { FaEye, FaFilter, FaTimes, FaImage, FaVideo, FaMicrophone, FaDownload, FaUndoAlt, FaRedoAlt, FaExpand, FaCog, FaBan, FaWrench } from 'react-icons/fa';
import {
  useGetAccidentReportsQuery,
  useGetAccidentReportByIdQuery,
  useGetPilotsQuery,
  useDeclineAccidentReportMutation,
} from '../../api/services NodeJs/accidentReportsApi';
import {
  useCreateMaintenanceFromIncidentMutation,
  useGetTechniciansQuery,
} from '../../api/services NodeJs/maintenanceApi';
import '../../styles/accidentReports.css';

const AccidentReports = () => {
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    pilot: '',
    type: '',
    estate: '',
    equipment_type: '',
    device_serial: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageRotation, setImageRotation] = useState(0);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'decline' or 'repair'
  const [actionForm, setActionForm] = useState({ decline_reason: '', technician_id: '', description: '', scheduled_date: '' });

  // Mutations
  const [declineReport] = useDeclineAccidentReportMutation();
  const [createMaintenance] = useCreateMaintenanceFromIncidentMutation();
  const { data: techniciansData } = useGetTechniciansQuery();
  
  const technicians = Array.isArray(techniciansData) ? techniciansData : (techniciansData ? [techniciansData] : []);
  
  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData?.id || null;
  };

  // Clean filters - remove empty strings
  const cleanFilters = useMemo(() => {
    const cleaned = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        cleaned[key] = filters[key];
      }
    });
    return cleaned;
  }, [filters]);

  // Fetch data
  const { data: reportsData, isLoading, error, refetch } = useGetAccidentReportsQuery(cleanFilters);
  const { data: pilotsData } = useGetPilotsQuery();

  // Ensure reports is always an array
  const reports = Array.isArray(reportsData) ? reportsData : (reportsData ? [reportsData] : []);
  const pilots = Array.isArray(pilotsData) ? pilotsData : (pilotsData ? [pilotsData] : []);

  // Filter reports based on search
  const [searchTerm, setSearchTerm] = useState('');
  const filteredReports = useMemo(() => {
    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      return [];
    }
    if (!searchTerm || searchTerm.trim() === '') {
      return reports;
    }
    const term = searchTerm.toLowerCase().trim();
    return reports.filter(report => {
      if (!report) return false;
      return (
        (report.pilot_name && String(report.pilot_name).toLowerCase().includes(term)) ||
        (report.device_serial && String(report.device_serial).toLowerCase().includes(term)) ||
        (report.estate_name && String(report.estate_name).toLowerCase().includes(term)) ||
        (report.equipment_type_name && String(report.equipment_type_name).toLowerCase().includes(term)) ||
        (report.plan_mission_label && String(report.plan_mission_label).toLowerCase().includes(term))
      );
    });
  }, [reports, searchTerm]);


  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedReport(null);
  };

  const handleActionClick = (report, type) => {
    setSelectedReport(report);
    setActionType(type);
    setActionForm({
      decline_reason: '',
      technician_id: '',
      description: '',
      scheduled_date: '',
    });
    setShowActionModal(true);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedReport(null);
    setActionType(null);
    setActionForm({ decline_reason: '', technician_id: '', description: '', scheduled_date: '' });
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        alert('User ID not found. Please login again.');
        return;
      }

      if (actionType === 'decline') {
        if (!actionForm.decline_reason.trim()) {
          alert('Please enter a decline reason');
          return;
        }
        await declineReport({
          id: selectedReport.id,
          decline_reason: actionForm.decline_reason,
          action_by: userId,
        }).unwrap();
        alert('Accident report declined successfully');
      } else if (actionType === 'repair') {
        if (!actionForm.technician_id || !actionForm.description.trim() || !actionForm.scheduled_date) {
          alert('Please fill all required fields (Technician, Description, Scheduled Date)');
          return;
        }
        await createMaintenance({
          incidentId: selectedReport.id,
          created_by: userId,
          technician_id: parseInt(actionForm.technician_id),
          description: actionForm.description,
          scheduled_date: actionForm.scheduled_date,
        }).unwrap();
        alert('Maintenance record created successfully');
      }
      handleCloseActionModal();
      refetch();
    } catch (error) {
      alert('Failed to process action: ' + (error.message || 'Unknown error'));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      pilot: '',
      type: '',
      estate: '',
      equipment_type: '',
      device_serial: '',
    });
  };

  const handleDownload = (url, filename) => {
    try {
      const fullUrl = getResourceUrl(url);
      // Create a temporary anchor element and trigger download
      // This approach bypasses CORS restrictions for downloads
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = filename || 'download';
      link.target = '_blank'; // Open in new tab as fallback
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new window
      try {
        window.open(getResourceUrl(url), '_blank');
      } catch (e) {
        alert('Failed to download file. Please try right-clicking and selecting "Save As"');
      }
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageRotation(0);
  };

  const handleCloseImageViewer = () => {
    setSelectedImage(null);
    setImageRotation(0);
  };

  const handleRotateImage = (direction) => {
    setImageRotation(prev => direction === 'left' ? prev - 90 : prev + 90);
  };

  const getResourceUrl = (url) => {
    if (!url) return null;
    // Backend now sends full URLs, so return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Fallback: if somehow we get a relative URL, prepend the base URL
    const baseUrl = 'https://drone-admin.kenilworthinternational.com/storage';
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}/${cleanUrl}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (typeof dateString === 'string') {
        if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
          return dateString.split('T')[0];
        }
        // Try to parse as date
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }
      return String(dateString);
    } catch (e) {
      // Date formatting error - silently return string
      return String(dateString);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  if (isLoading) {
    return (
      <div className="accidentreports-loading-container">
        <p>Loading accident reports...</p>
      </div>
    );
  }

  return (
    <div className="accidentreports-container">
      <div className="accidentreports-header">
        <h1 className="accidentreports-title">Accident Reports</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="accidentreports-filter-button"
        >
          <FaFilter /> Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="accidentreports-filters-panel">
          <div className="accidentreports-filters-header">
            <h3 className="accidentreports-filters-title">Filters</h3>
            <button onClick={clearFilters} className="accidentreports-clear-button">
              Clear All
            </button>
          </div>
          <div className="accidentreports-filters-grid">
            <div className="accidentreports-filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="accidentreports-filter-input"
              />
            </div>
            <div className="accidentreports-filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="accidentreports-filter-input"
              />
            </div>
            <div className="accidentreports-filter-group">
              <label>Pilot</label>
              <select
                value={filters.pilot}
                onChange={(e) => handleFilterChange('pilot', e.target.value)}
                className="accidentreports-filter-select"
              >
                <option value="">All Pilots</option>
                {pilots.map(pilot => (
                  <option key={pilot.id} value={pilot.id}>{pilot.name}</option>
                ))}
              </select>
            </div>
            <div className="accidentreports-filter-group">
              <label>Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="accidentreports-filter-select"
              >
                <option value="">All Types</option>
                <option value="p">Plan</option>
                <option value="m">Mission</option>
              </select>
            </div>
            <div className="accidentreports-filter-group">
              <label>Device Serial</label>
              <input
                type="text"
                value={filters.device_serial}
                onChange={(e) => handleFilterChange('device_serial', e.target.value)}
                placeholder="Search by serial"
                className="accidentreports-filter-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="accidentreports-search-bar">
        <input
          type="text"
          placeholder="Search by pilot, device serial, estate, equipment type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="accidentreports-search-input"
        />
      </div>

      {/* Status Info - Always Visible */}
      <div className="accidentreports-status-info">
        <strong>Status:</strong> {isLoading ? 'Loading...' : `Found ${filteredReports?.length || 0} report(s) out of ${reports.length} total`}
      </div>

      {/* Reports Table */}
      <div className="accidentreports-table-wrapper">
        <table className="accidentreports-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Pilot</th>
              <th>Type</th>
              <th>Plan/Mission</th>
              <th>Estate</th>
              <th>Equipment</th>
              <th>Device Serial</th>
              <th>Media</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="11" className="accidentreports-loading-cell">
                  <strong>Loading accident reports...</strong>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="11" className="accidentreports-error-cell">
                  <strong>Error loading reports:</strong> {error.message || 'Unknown error'}
                </td>
              </tr>
            ) : Array.isArray(filteredReports) && filteredReports.length > 0 ? (
              filteredReports.map((report, index) => {
                if (!report || !report.id) {
                  return null;
                }
                return (
                  <tr key={`report-${report.id}-${index}`}>
                    <td>{report.id}</td>
                    <td>{formatDate(report.date)}</td>
                    <td>{formatTime(report.time)}</td>
                    <td>{report.pilot_name || 'N/A'}</td>
                    <td>
                      {report.type === 'p' ? 'Plan' : report.type === 'm' ? 'Mission' : 'N/A'}
                    </td>
                    <td>{report.plan_mission_label || 'N/A'}</td>
                    <td>{report.estate_name || 'N/A'}</td>
                    <td>{report.equipment_type_name || 'N/A'}</td>
                    <td>{report.device_serial || 'N/A'}</td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(report)}
                        className="accidentreports-view-button"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                    <td>
                      {!report.action ? (
                        <div className="accidentreports-action-dropdown">
                          <button
                            className="accidentreports-action-button"
                            onClick={() => handleActionClick(report, 'decline')}
                            title="Decline"
                          >
                            <FaBan /> Decline
                          </button>
                          <button
                            className="accidentreports-action-button"
                            onClick={() => handleActionClick(report, 'repair')}
                            title="Repair"
                          >
                            <FaWrench /> Repair
                          </button>
                        </div>
                      ) : report.action === 'd' ? (
                        <span className="accidentreports-action-badge declined">
                          <FaBan /> Declined
                        </span>
                      ) : report.action === 'r' ? (
                        <span className="accidentreports-action-badge repair">
                          <FaWrench /> Repair
                          {report.maintenance_id && <span className="maintenance-id">#{report.maintenance_id}</span>}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="accidentreports-empty-cell">
                  <strong>No accident reports found</strong> {reports.length > 0 ? `(Total: ${reports.length}, Filtered: ${filteredReports?.length || 0})` : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="accidentreports-modal-overlay">
          <div className="accidentreports-modal-content">
            <div className="accidentreports-modal-header">
              <h2>Accident Report Details</h2>
              <button onClick={handleCloseDetails} className="accidentreports-modal-close">
                <FaTimes />
              </button>
            </div>

            <div className="accidentreports-modal-details-grid">
              <div>
                <strong>ID:</strong> {selectedReport.id}
              </div>
              <div>
                <strong>Date:</strong> {formatDate(selectedReport.date)}
              </div>
              <div>
                <strong>Time:</strong> {formatTime(selectedReport.time)}
              </div>
              <div>
                <strong>Pilot:</strong> {selectedReport.pilot_name || 'N/A'}
              </div>
              <div>
                <strong>Type:</strong> {selectedReport.type === 'p' ? 'Plan' : selectedReport.type === 'm' ? 'Mission' : 'N/A'}
              </div>
              <div>
                <strong>Plan/Mission:</strong> {selectedReport.plan_mission_label || 'N/A'}
              </div>
              <div>
                <strong>Estate:</strong> {selectedReport.estate_name || 'N/A'}
              </div>
              <div>
                <strong>Task:</strong> {selectedReport.task_id ? `Task #${selectedReport.task_id}` : 'N/A'}
              </div>
              <div>
                <strong>Equipment Type:</strong> {selectedReport.equipment_type_name || 'N/A'}
              </div>
              <div>
                <strong>Device Serial:</strong> {selectedReport.device_serial || 'N/A'}
              </div>
            </div>

            {/* Media Section */}
            <div className="accidentreports-modal-media-section">
              <h3>Media Files</h3>
              <div className="accidentreports-media-three-column">
                {/* Column 1 - Image 1 */}
                <div className="accidentreports-media-column">
                  {selectedReport.image_1_url && (
                    <div className="accidentreports-modal-media-item">
                      <div className="accidentreports-media-label">
                        <FaImage style={{ marginRight: '6px', color: '#007bff', fontSize: '14px' }} />
                        <strong>Image 1</strong>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(selectedReport.image_1_url, selectedReport.image_1 || 'image-1.jpg');
                          }}
                          className="accidentreports-download-btn"
                          title="Download Image 1"
                        >
                          <FaDownload />
                        </button>
                      </div>
                      <div className="accidentreports-image-wrapper" onClick={() => handleImageClick(selectedReport.image_1_url)} style={{ cursor: 'pointer' }}>
                        <img 
                          src={getResourceUrl(selectedReport.image_1_url)} 
                          alt="Accident Image 1"
                          className="accidentreports-modal-image"
                          onError={(e) => {
                            if (e.target && e.target.parentElement) {
                              const errorDiv = e.target.parentElement.querySelector('.accidentreports-image-error');
                              if (errorDiv) {
                                e.target.style.display = 'none';
                                errorDiv.style.display = 'flex';
                              }
                            }
                          }}
                        />
                        <div className="accidentreports-image-overlay">
                          <FaExpand style={{ color: 'white', fontSize: '20px' }} />
                        </div>
                        <div className="accidentreports-image-error" style={{ display: 'none' }}>
                          <FaImage style={{ fontSize: '32px', color: '#ccc', marginBottom: '5px' }} />
                          <p>Failed to load</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2 - Image 2 */}
                <div className="accidentreports-media-column">
                  {selectedReport.image_2_url && (
                    <div className="accidentreports-modal-media-item">
                      <div className="accidentreports-media-label">
                        <FaImage style={{ marginRight: '6px', color: '#007bff', fontSize: '14px' }} />
                        <strong>Image 2</strong>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(selectedReport.image_2_url, selectedReport.image_2 || 'image-2.jpg');
                          }}
                          className="accidentreports-download-btn"
                          title="Download Image 2"
                        >
                          <FaDownload />
                        </button>
                      </div>
                      <div className="accidentreports-image-wrapper" onClick={() => handleImageClick(selectedReport.image_2_url)} style={{ cursor: 'pointer' }}>
                        <img 
                          src={getResourceUrl(selectedReport.image_2_url)} 
                          alt="Accident Image 2"
                          className="accidentreports-modal-image"
                          onError={(e) => {
                            if (e.target && e.target.parentElement) {
                              const errorDiv = e.target.parentElement.querySelector('.accidentreports-image-error');
                              if (errorDiv) {
                                e.target.style.display = 'none';
                                errorDiv.style.display = 'flex';
                              }
                            }
                          }}
                        />
                        <div className="accidentreports-image-overlay">
                          <FaExpand style={{ color: 'white', fontSize: '20px' }} />
                        </div>
                        <div className="accidentreports-image-error" style={{ display: 'none' }}>
                          <FaImage style={{ fontSize: '32px', color: '#ccc', marginBottom: '5px' }} />
                          <p>Failed to load</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 3 - Voice Notes */}
                <div className="accidentreports-media-column">
                  {selectedReport.voice_note_1_url && (
                    <div className="accidentreports-modal-media-item accidentreports-audio-item">
                      <div className="accidentreports-media-label">
                        <FaMicrophone style={{ marginRight: '6px', color: '#28a745', fontSize: '14px' }} />
                        <strong>Voice Note 1</strong>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(selectedReport.voice_note_1_url, selectedReport.voice_note_1 || 'voice-note-1.m4a');
                          }}
                          className="accidentreports-download-btn"
                          title="Download Voice Note 1"
                        >
                          <FaDownload />
                        </button>
                      </div>
                      <div className="accidentreports-audio-wrapper">
                        <audio 
                          controls 
                          className="accidentreports-modal-audio"
                          onError={(e) => {
                            if (e.target && e.target.parentElement) {
                              const errorDiv = e.target.parentElement.querySelector('.accidentreports-audio-error');
                              if (errorDiv) {
                                e.target.style.display = 'none';
                                errorDiv.style.display = 'flex';
                              }
                            }
                          }}
                        >
                          <source src={getResourceUrl(selectedReport.voice_note_1_url)} type="audio/mpeg" />
                          <source src={getResourceUrl(selectedReport.voice_note_1_url)} type="audio/mp4" />
                          <source src={getResourceUrl(selectedReport.voice_note_1_url)} type="audio/m4a" />
                        </audio>
                        <div className="accidentreports-audio-error" style={{ display: 'none' }}>
                          <FaMicrophone style={{ fontSize: '32px', color: '#ccc', marginBottom: '5px' }} />
                          <p>Failed to load</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedReport.voice_note_2_url && (
                    <div className="accidentreports-modal-media-item accidentreports-audio-item">
                      <div className="accidentreports-media-label">
                        <FaMicrophone style={{ marginRight: '6px', color: '#28a745', fontSize: '14px' }} />
                        <strong>Voice Note 2</strong>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(selectedReport.voice_note_2_url, selectedReport.voice_note_2 || 'voice-note-2.m4a');
                          }}
                          className="accidentreports-download-btn"
                          title="Download Voice Note 2"
                        >
                          <FaDownload />
                        </button>
                      </div>
                      <div className="accidentreports-audio-wrapper">
                        <audio 
                          controls 
                          className="accidentreports-modal-audio"
                          onError={(e) => {
                            if (e.target && e.target.parentElement) {
                              const errorDiv = e.target.parentElement.querySelector('.accidentreports-audio-error');
                              if (errorDiv) {
                                e.target.style.display = 'none';
                                errorDiv.style.display = 'flex';
                              }
                            }
                          }}
                        >
                          <source src={getResourceUrl(selectedReport.voice_note_2_url)} type="audio/mpeg" />
                          <source src={getResourceUrl(selectedReport.voice_note_2_url)} type="audio/mp4" />
                          <source src={getResourceUrl(selectedReport.voice_note_2_url)} type="audio/m4a" />
                        </audio>
                        <div className="accidentreports-audio-error" style={{ display: 'none' }}>
                          <FaMicrophone style={{ fontSize: '32px', color: '#ccc', marginBottom: '5px' }} />
                          <p>Failed to load</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Video - Full Width Row */}
              {selectedReport.video_1_url && (
                <div className="accidentreports-video-full-width">
                  <div className="accidentreports-modal-media-item accidentreports-video-item">
                    <div className="accidentreports-media-label">
                      <FaVideo style={{ marginRight: '6px', color: '#dc3545', fontSize: '14px' }} />
                      <strong>Video</strong>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(selectedReport.video_1_url, selectedReport.video_1 || 'video.mp4');
                        }}
                        className="accidentreports-download-btn"
                        title="Download Video"
                      >
                        <FaDownload />
                      </button>
                    </div>
                    <div className="accidentreports-video-wrapper">
                      <video 
                        controls 
                        className="accidentreports-modal-video"
                        onError={(e) => {
                          if (e.target && e.target.parentElement) {
                            const errorDiv = e.target.parentElement.querySelector('.accidentreports-video-error');
                            if (errorDiv) {
                              e.target.style.display = 'none';
                              errorDiv.style.display = 'flex';
                            }
                          }
                        }}
                      >
                        <source src={getResourceUrl(selectedReport.video_1_url)} type="video/mp4" />
                        <source src={getResourceUrl(selectedReport.video_1_url)} type="video/webm" />
                      </video>
                      <div className="accidentreports-video-error" style={{ display: 'none' }}>
                        <FaVideo style={{ fontSize: '32px', color: '#ccc', marginBottom: '5px' }} />
                        <p>Failed to load</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="accidentreports-image-viewer-overlay" onClick={handleCloseImageViewer}>
          <div className="accidentreports-image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="accidentreports-image-viewer-header">
              <div className="accidentreports-image-viewer-controls">
                <button
                  onClick={() => handleRotateImage('left')}
                  className="accidentreports-image-viewer-btn"
                  title="Rotate Left"
                >
                  <FaUndoAlt />
                </button>
                <button
                  onClick={() => handleRotateImage('right')}
                  className="accidentreports-image-viewer-btn"
                  title="Rotate Right"
                >
                  <FaRedoAlt />
                </button>
                <button
                  onClick={() => handleDownload(selectedImage, `image-${Date.now()}.jpg`)}
                  className="accidentreports-image-viewer-btn"
                  title="Download"
                >
                  <FaDownload />
                </button>
              </div>
              <button
                onClick={handleCloseImageViewer}
                className="accidentreports-image-viewer-close"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="accidentreports-image-viewer-image-container">
              <img
                src={getResourceUrl(selectedImage)}
                alt="Full size view"
                className="accidentreports-image-viewer-image"
                style={{ transform: `rotate(${imageRotation}deg)` }}
              />
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedReport && (
        <div className="accidentreports-modal-overlay">
          <div className="accidentreports-modal-content">
            <div className="accidentreports-modal-header">
              <h2>{actionType === 'decline' ? 'Decline Accident Report' : 'Create Maintenance from Incident'}</h2>
              <button onClick={handleCloseActionModal} className="accidentreports-modal-close">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleActionSubmit} className="accidentreports-action-form">
              {actionType === 'decline' ? (
                <>
                  <div className="accidentreports-form-group">
                    <label>Decline Reason *</label>
                    <textarea
                      value={actionForm.decline_reason}
                      onChange={(e) => setActionForm(prev => ({ ...prev, decline_reason: e.target.value }))}
                      required
                      className="accidentreports-form-textarea"
                      rows="4"
                      placeholder="Enter reason for declining this incident"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="accidentreports-form-group">
                    <label>Technician *</label>
                    <select
                      value={actionForm.technician_id}
                      onChange={(e) => setActionForm(prev => ({ ...prev, technician_id: e.target.value }))}
                      required
                      className="accidentreports-form-select"
                    >
                      <option value="">Select Technician</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="accidentreports-form-group">
                    <label>Description *</label>
                    <textarea
                      value={actionForm.description}
                      onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                      className="accidentreports-form-textarea"
                      rows="4"
                      placeholder="Enter description/guide for technician"
                    />
                  </div>
                  <div className="accidentreports-form-group">
                    <label>Scheduled Date *</label>
                    <input
                      type="date"
                      value={actionForm.scheduled_date}
                      onChange={(e) => setActionForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      required
                      className="accidentreports-form-input"
                    />
                  </div>
                </>
              )}
              <div className="accidentreports-form-actions">
                <button type="button" onClick={handleCloseActionModal} className="accidentreports-button-secondary">
                  Cancel
                </button>
                <button type="submit" className="accidentreports-button-primary">
                  {actionType === 'decline' ? 'Decline Report' : 'Create Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccidentReports;
