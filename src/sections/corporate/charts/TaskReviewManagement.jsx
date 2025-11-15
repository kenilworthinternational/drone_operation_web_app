import React, { useState, useEffect } from 'react';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchTaskReviewReport,
  selectReportData,
  selectReportLoading,
  selectReportFilter,
  setReportFilter,
} from '../../../store/slices/reportsSlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../styles/reviewreport.css';

const ReportReview = () => {
  const dispatch = useAppDispatch();
  
  // Get current month's first date and today
  const getCurrentMonthFirstDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const [reports, setReports] = useState([]);
  const [fromDate, setFromDate] = useState(getCurrentMonthFirstDate());
  const [toDate, setToDate] = useState(new Date());
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewType, setReviewType] = useState(''); // 'manager' or 'director'
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData')) || {};

  // Get from Redux
  const fromDateStr = fromDate.toLocaleDateString('en-CA');
  const toDateStr = toDate.toLocaleDateString('en-CA');
  const cachedData = useAppSelector((state) =>
    selectReportData(state, 'taskReviewReport', fromDateStr, toDateStr)
  );
  const loading = useAppSelector((state) =>
    selectReportLoading(state, 'taskReviewReport', fromDateStr, toDateStr)
  );
  const filterManagerReview = useAppSelector((state) => selectReportFilter(state, 'filterManagerReview'));
  const filterDirectorOps = useAppSelector((state) => selectReportFilter(state, 'filterDirectorOps'));

  useEffect(() => {
    const fetchReports = async () => {
      if (!fromDate || !toDate) {
        setReports([]);
        return;
      }

      // Check if we have cached data
      if (cachedData && cachedData.flags) {
        applyFiltersToReports(cachedData.flags);
        return;
      }

      // Fetch from API via Redux
      try {
        const result = await dispatch(fetchTaskReviewReport({
          startDate: fromDateStr,
          endDate: toDateStr
        }));
        
        if (fetchTaskReviewReport.fulfilled.match(result)) {
          const response = result.payload.data;
          if (response && response.flags) {
            applyFiltersToReports(response.flags);
          } else {
            setReports([]);
          }
        } else {
          toast.error('Failed to fetch reports');
          setReports([]);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to fetch reports');
        setReports([]);
      }
    };

    const applyFiltersToReports = (flags) => {
      let filteredReports = flags;
      
      // Filter by manager review status
      if (filterManagerReview !== 'all') {
        filteredReports = filteredReports.filter(report => {
          if (filterManagerReview === 'pending') return !report.review_text;
          if (filterManagerReview === 'reviewed') return report.review_text;
          return true;
        });
      }
      
      // Filter by director ops status
      if (filterDirectorOps !== 'all') {
        filteredReports = filteredReports.filter(report => {
          if (filterDirectorOps === 'pending') return report.status === 'p';
          if (filterDirectorOps === 'approved') return report.status === 'a';
          if (filterDirectorOps === 'rejected') return report.status === 'r';
          return true;
        });
      }
      
      // Sort to show pending reports first
      filteredReports.sort((a, b) => {
        if (a.status === 'p' && b.status !== 'p') return -1;
        if (a.status !== 'p' && b.status === 'p') return 1;
        return 0;
      });
      
      setReports(filteredReports);
    };

    fetchReports();
  }, [fromDate, toDate, filterManagerReview, filterDirectorOps, cachedData, dispatch, fromDateStr, toDateStr]);

  const handleReviewSubmit = async () => {
    if (!selectedReport || !reviewText.trim()) return;
    
    setSubmitting(true);
    try {
      let response;
      
      if (reviewType === 'manager') {
        const result = await dispatch(
          baseApi.endpoints.updateReviewByReviewBoard.initiate({
            taskId: selectedReport.task_id,
            review: reviewText
          })
        );
        response = result.data;
      } else if (reviewType === 'director') {
        const result = await dispatch(
          baseApi.endpoints.updateReviewByDirectorOps.initiate({
            taskId: selectedReport.task_id,
            status: selectedReport.status,
            review: reviewText
          })
        );
        response = result.data;
      }
      
      if (response && response.status === 'true') {
        toast.success('Review submitted successfully');
        setShowReviewModal(false);
        setReviewText('');
        setSelectedReport(null);
        // Trigger a re-fetch by updating date (same values will refetch from API if needed)
        setFromDate(new Date(fromDate));
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewModal = (report, type) => {
    setSelectedReport(report);
    setReviewType(type);
    setReviewText(type === 'manager' ? (report.review_text || '') : (report.dops_text || ''));
    setShowReviewModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'p': { text: 'Pending', color: '#ffb347', bgColor: '#fff3cd' },
      'a': { text: 'Approved', color: '#2fc653', bgColor: '#d4edda' },
      'r': { text: 'Rejected', color: '#ff4d4f', bgColor: '#f8d7da' }
    };
    
    const config = statusConfig[status] || { text: status, color: '#888', bgColor: '#f8f9fa' };
    
    return (
      <span style={{
        background: config.bgColor,
        color: config.color,
        padding: '8px 16px',
        borderRadius: 20,
        fontSize: 14,
        fontWeight: 700,
        border: `2px solid ${config.color}`,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: '100px',
        textAlign: 'center',
        display: 'inline-block'
      }}>
        {config.text}
      </span>
    );
  };

  const canReview = (report, type) => {
    if (type === 'manager') {
      return !report.review_text; // Can review if no manager review yet
    } else if (type === 'director') {
      return report.review_text && report.status === 'p'; // Can review if manager reviewed and status is pending
    }
    return false;
  };

  const downloadExcel = () => {
    if (reports.length === 0) {
      toast.warning('No data to export');
      return;
    }

    // Prepare data for Excel
    const excelData = reports.map(report => ({
      'Task ID': report.task_id,
      'Date': report.date,
      'Estate': report.estate,
      'Plan ID': report.plan_id,
      'Pilot': report.pilot,
      'Operator': report.operator,
      'Description': report.reason_text,
      'Reasons': report.reasons ? report.reasons.map(r => r.reason).join(', ') : '',
      'Manager Review': report.review_text || 'No review yet',
      'Director Review': report.dops_text || 'No review yet',
      'Status': report.status === 'p' ? 'Pending' : report.status === 'a' ? 'Approved' : 'Rejected'
    }));

    // Create CSV content
    const headers = Object.keys(excelData[0]);
    const csvContent = [
      headers.join(','),
      ...excelData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_reviews_${fromDate.toLocaleDateString('en-CA')}_to_${toDate.toLocaleDateString('en-CA')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Excel file downloaded successfully');
  };

  return (
    <div className="report-review-container">
      <div className="report-review-header">
        <div className="header-top">
          <h2 className="report-review-headerh2">Review Reports</h2>
          <button 
            className="excel-download-btn"
            onClick={downloadExcel}
            disabled={loading || reports.length === 0}
          >
            📊Excel Report
          </button>
        </div>
        <div className="filters-row">
          <div className="status-filters">
            <div className="date-picker-group">
              <label>From Date:</label>
              <DatePicker
                selected={fromDate}
                onChange={date => setFromDate(date)}
                dateFormat="yyyy-MM-dd"
                className="date-picker"
                popperPlacement="bottom-start"
              />
            </div>
            <div className="date-picker-group">
              <label>To Date:</label>
              <DatePicker
                selected={toDate}
                onChange={date => setToDate(date)}
                dateFormat="yyyy-MM-dd"
                className="date-picker"
                popperPlacement="bottom-start"
              />
            </div>
          </div>
          <div className="status-filters">
            <div className="filter-group">
              <label>Manager Review:</label>
              <select 
                value={filterManagerReview} 
                onChange={e => dispatch(setReportFilter({ filterName: 'filterManagerReview', value: e.target.value }))}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Director Ops:</label>
              <select 
                value={filterDirectorOps} 
                onChange={e => dispatch(setReportFilter({ filterName: 'filterDirectorOps', value: e.target.value }))}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="reports-list">
        {loading ? (
          <div className="loading">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="no-reports">No reports found for the selected criteria.</div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="report-card">
              {/* First Row: Date-Estate-Plan ID (left) | Status (right) */}
              <div className="report-row report-row-header">
                <div className="report-row-left">
                  <span className="report-field">
                    <strong>Date:</strong> {report.date}
                  </span>
                  <span className="report-field">
                    <strong>Estate:</strong> {report.estate}
                  </span>
                  <span className="report-field">
                    <strong>Plan ID:</strong> {report.plan_id}
                  </span>
                  <span className="report-field">
                    <strong>Task ID:</strong> {report.task_id}
                  </span>
                  
                </div>
                <div className="report-row-right">
                  {getStatusBadge(report.status)}
                </div>
              </div>

              {/* Second Row: Pilot, Operator */}
              <div className="report-row">
                <div className="report-row-left">
                  <span className="report-field">
                    <strong>Pilot:</strong> {report.pilot}
                  </span>
                  <span className="report-field">
                    <strong>Operator:</strong> {report.operator}
                  </span>
                </div>
              </div>

              {/* Third Row: Reasons (left) | Description (right) */}
              <div className="report-row">
                <div className="report-row-left">
                  <div className="report-section">
                    <h4>Reasons:</h4>
                    <div className="reasons-list">
                      {report.reasons && report.reasons.map(reason => (
                        <span key={reason.reason_id} className="reason-tag">
                          {reason.reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="report-row-right">
                  <div className="report-section">
                    <h4>Explanation:</h4>
                    <p>{report.reason_text}</p>
                  </div>
                </div>
              </div>

              {/* Horizontal Line */}
              <hr className="report-divider" />

              {/* Fourth Row: Manager Review (left) | Director Review (right) */}
              <div className="report-row">
                <div className="report-row-left">
                  <div className="report-section">
                    <h4>Manager Review:</h4>
                    {report.review_text ? (
                      <p>{report.review_text}</p>
                    ) : (
                      <p className="no-review">No review yet</p>
                    )}
                  </div>
                </div>
                <div className="report-row-right">
                  <div className="report-section">
                    <h4>Director Review:</h4>
                    {report.dops_text ? (
                      <p>{report.dops_text}</p>
                    ) : (
                      <p className="no-review">No review yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="report-actions">
                {canReview(report, 'manager') && (
                  <button 
                    className="review-btn manager"
                    onClick={() => openReviewModal(report, 'manager')}
                  >
                    Manager Review
                  </button>
                )}
                
                {canReview(report, 'director') && (
                  <button 
                    className="review-btn director"
                    onClick={() => openReviewModal(report, 'director')}
                  >
                    Director Ops Review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{reviewType === 'manager' ? 'Manager Review' : 'Director Ops Review'}</h3>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="review-info">
                <p><strong>Task ID:</strong> {selectedReport.task_id}</p>
                <p><strong>Estate:</strong> {selectedReport.estate}</p>
                <p><strong>Date:</strong> {selectedReport.date}</p>
              </div>
              
              <div className="review-form">
                <label>Review:</label>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={4}
                  placeholder={`Enter your ${reviewType === 'manager' ? 'manager' : 'director ops'} review...`}
                  className="review-textarea"
                />
              </div>
              
              {reviewType === 'director' && (
                <div className="status-selection">
                  <label>Status:</label>
                  <select 
                    value={selectedReport.status} 
                    onChange={e => setSelectedReport({...selectedReport, status: e.target.value})}
                    className="status-select"
                  >
                    <option value="p">Pending</option>
                    <option value="a">Approved</option>
                    <option value="r">Rejected</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={handleReviewSubmit}
                disabled={submitting || !reviewText.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportReview; 