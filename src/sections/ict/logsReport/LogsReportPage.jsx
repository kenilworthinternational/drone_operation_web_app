import React, { useState, useMemo, useCallback } from 'react';
import {
  useGetLogCategoriesQuery,
  useLazyGetLogFilesQuery,
  useLazyGetLogDataQuery,
} from '../../../api/services NodeJs/logsReportApi';
import { nodeBackendBaseQuery } from '../../../api/services NodeJs/nodeBackendConfig';
import * as XLSX from 'xlsx';
import {
  FaFileAlt,
  FaSync,
  FaChevronRight,
  FaArrowLeft,
  FaDownload,
  FaEye,
  FaCalendarAlt,
  FaDatabase,
  FaFolder,
  FaSearch,
  FaFileExcel,
  FaClipboardList,
  FaUnlockAlt,
  FaUserShield,
  FaUserCheck,
  FaSun,
  FaCamera,
  FaCheckCircle,
  FaMoneyBillWave,
  FaBell,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaRuler,
  FaCog,
  FaMapMarkedAlt,
  FaExclamationTriangle,
  FaMoneyCheckAlt,
} from 'react-icons/fa';
import '../../../styles/logsReportPage.css';

const CATEGORY_ICONS = {
  'mapping-logs': { icon: FaMapMarkedAlt, color: 'blue-logs-report' },
  'drone-unlock': { icon: FaUnlockAlt, color: 'purple-logs-report' },
  'resource-assignment': { icon: FaUserShield, color: 'green-logs-report' },
  'pilot-assignment': { icon: FaUserCheck, color: 'teal-logs-report' },
  'day-end-process': { icon: FaSun, color: 'orange-logs-report' },
  'dji-image-upload': { icon: FaCamera, color: 'indigo-logs-report' },
  'manager-approval': { icon: FaCheckCircle, color: 'green-logs-report' },
  'payment-queue': { icon: FaMoneyCheckAlt, color: 'orange-logs-report' },
  'emergencyresourcesallocations': { icon: FaExclamationTriangle, color: 'red-logs-report' },
  'notifications': { icon: FaBell, color: 'purple-logs-report' },
  'financial-cards': { icon: FaCreditCard, color: 'blue-logs-report' },
  'finance-approvals': { icon: FaFileInvoiceDollar, color: 'green-logs-report' },
  'field-size-adjustments': { icon: FaRuler, color: 'teal-logs-report' },
  'general': { icon: FaCog, color: 'indigo-logs-report' },
};

function getActionBadgeClass(action) {
  if (!action) return 'action-default-logs-report';
  const a = action.toUpperCase();
  if (a.includes('CREATE') || a.includes('CREATED') || a.includes('UPLOADED')) return 'action-create-logs-report';
  if (a.includes('UPDATE') || a.includes('UPDATED') || a.includes('LINKED')) return 'action-update-logs-report';
  if (a.includes('DELETE') || a.includes('DELETED') || a.includes('REJECTED')) return 'action-delete-logs-report';
  if (a.includes('TOGGLE') || a.includes('LOCKED') || a.includes('UNLOCKED') || a.includes('APPROVED')) return 'action-toggle-logs-report';
  return 'action-default-logs-report';
}

export default function LogsReportPage() {
  const { data: categories = [], isLoading: loadingCategories, refetch: refetchCategories } = useGetLogCategoriesQuery();

  const [triggerGetFiles, { data: filesData, isFetching: loadingFiles }] = useLazyGetLogFilesQuery();
  const [triggerGetData, { data: logData, isFetching: loadingData }] = useLazyGetLogDataQuery();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const files = filesData?.files || [];
  const filesLabel = filesData?.label || '';
  const logRows = logData?.rows || [];
  const logHeaders = logData?.headers || [];
  const totalRows = logData?.totalRows || 0;

  const activeCategories = useMemo(() => categories.filter(c => c.fileCount > 0), [categories]);
  const totalFiles = useMemo(() => categories.reduce((sum, c) => sum + c.fileCount, 0), [categories]);

  const handleCategoryClick = useCallback((cat) => {
    if (cat.fileCount === 0) return;
    setSelectedCategory(cat);
    setSelectedDate(null);
    setSearchTerm('');
    triggerGetFiles(cat.key);
  }, [triggerGetFiles]);

  const handleFileClick = useCallback((file) => {
    setSelectedDate(file.date);
    setSearchTerm('');
    triggerGetData({ category: selectedCategory.key, date: file.date });
  }, [selectedCategory, triggerGetData]);

  const handleBack = useCallback(() => {
    if (selectedDate) {
      setSelectedDate(null);
      setSearchTerm('');
    } else {
      setSelectedCategory(null);
      setSelectedDate(null);
      setSearchTerm('');
    }
  }, [selectedDate]);

  const handleDownloadCsv = useCallback(async (cat, date) => {
    try {
      const result = await nodeBackendBaseQuery(
        { url: '/api/logs-report/download', method: 'POST', body: { category: cat, date } },
        {},
        {}
      );
      if (result.data) {
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cat}-${date}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, []);

  const handleDownloadExcel = useCallback(() => {
    if (!logHeaders.length || !filteredRows.length) return;
    const wsData = [logHeaders, ...filteredRows.map(row => logHeaders.map(h => row[h] || ''))];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = logHeaders.map((h, i) => {
      let max = h.length;
      filteredRows.forEach(row => {
        const val = String(row[h] || '');
        if (val.length > max) max = val.length;
      });
      return { wch: Math.min(max + 2, 40) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    const sheetName = selectedCategory ? selectedCategory.label.substring(0, 31) : 'Log Data';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${selectedCategory?.key || 'logs'}-${selectedDate || 'data'}.xlsx`);
  }, [logHeaders, selectedCategory, selectedDate]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return logRows;
    const term = searchTerm.toLowerCase();
    return logRows.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(term))
    );
  }, [logRows, searchTerm]);

  const renderBreadcrumbs = () => (
    <div className="breadcrumb-logs-report">
      <span
        className={selectedCategory ? 'breadcrumb-link-logs-report' : 'breadcrumb-active-logs-report'}
        onClick={() => { setSelectedCategory(null); setSelectedDate(null); setSearchTerm(''); }}
      >
        Log Categories
      </span>
      {selectedCategory && (
        <>
          <FaChevronRight className="breadcrumb-sep-logs-report" />
          <span
            className={selectedDate ? 'breadcrumb-link-logs-report' : 'breadcrumb-active-logs-report'}
            onClick={() => { setSelectedDate(null); setSearchTerm(''); }}
          >
            {selectedCategory.label}
          </span>
        </>
      )}
      {selectedDate && (
        <>
          <FaChevronRight className="breadcrumb-sep-logs-report" />
          <span className="breadcrumb-active-logs-report">{selectedDate}</span>
        </>
      )}
    </div>
  );

  const renderCategories = () => {
    if (loadingCategories) {
      return (
        <div className="loading-logs-report">
          <div className="spinner-logs-report" />
          <span>Loading log categories...</span>
        </div>
      );
    }

    return (
      <>
        <div className="stats-bar-logs-report">
          <div className="stat-item-logs-report">
            <div className="stat-icon-logs-report stat-icon-blue-logs-report"><FaFolder /></div>
            <div>
              <div className="stat-value-logs-report">{categories.length}</div>
              <div className="stat-label-logs-report">Total Categories</div>
            </div>
          </div>
          <div className="stat-item-logs-report">
            <div className="stat-icon-logs-report stat-icon-green-logs-report"><FaDatabase /></div>
            <div>
              <div className="stat-value-logs-report">{activeCategories.length}</div>
              <div className="stat-label-logs-report">Active Categories</div>
            </div>
          </div>
          <div className="stat-item-logs-report">
            <div className="stat-icon-logs-report stat-icon-orange-logs-report"><FaFileAlt /></div>
            <div>
              <div className="stat-value-logs-report">{totalFiles}</div>
              <div className="stat-label-logs-report">Total Log Files</div>
            </div>
          </div>
        </div>

        <div className="categories-grid-logs-report">
          {categories.map(cat => {
            const iconConfig = CATEGORY_ICONS[cat.key] || { icon: FaFileAlt, color: 'blue-logs-report' };
            const IconComp = iconConfig.icon;
            const isEmpty = cat.fileCount === 0;

            return (
              <div
                key={cat.key}
                className={`category-card-logs-report ${isEmpty ? 'category-card-empty-logs-report' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="category-header-logs-report">
                  <div className={`category-icon-wrapper-logs-report ${iconConfig.color}`}>
                    <IconComp />
                  </div>
                  <span className={`category-badge-logs-report ${isEmpty ? 'category-badge-empty-logs-report' : 'category-badge-active-logs-report'}`}>
                    {isEmpty ? 'No logs' : `${cat.fileCount} file${cat.fileCount > 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className="category-name-logs-report">{cat.label}</div>
                <div className="category-meta-logs-report">
                  {cat.latestDate && (
                    <span className="category-meta-item-logs-report">
                      <FaCalendarAlt /> Latest: {cat.latestDate}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderFiles = () => {
    if (loadingFiles) {
      return (
        <div className="loading-logs-report">
          <div className="spinner-logs-report" />
          <span>Loading log files...</span>
        </div>
      );
    }

    return (
      <div className="files-section-logs-report">
        <div className="files-header-logs-report">
          <div className="files-title-logs-report">{filesLabel || selectedCategory?.label} - Log Files</div>
          <button className="btn-back-logs-report" onClick={handleBack}>
            <FaArrowLeft /> Back to Categories
          </button>
        </div>

        {files.length === 0 ? (
          <div className="empty-state-logs-report">
            <FaFileAlt className="empty-icon-logs-report" />
            <div className="empty-title-logs-report">No Log Files Found</div>
            <div className="empty-text-logs-report">No log files exist for this category yet.</div>
          </div>
        ) : (
          <div className="files-list-logs-report">
            {files.map(file => (
              <div
                key={file.filename}
                className={`file-row-logs-report ${selectedDate === file.date ? 'file-row-selected-logs-report' : ''}`}
              >
                <div className="file-info-logs-report" onClick={() => handleFileClick(file)}>
                  <div className="file-icon-logs-report"><FaFileAlt /></div>
                  <div className="file-details-logs-report">
                    <div className="file-date-logs-report">{file.date}</div>
                    <div className="file-size-logs-report">{file.sizeFormatted} &bull; {file.filename}</div>
                  </div>
                </div>
                <div className="file-actions-logs-report">
                  <button className="btn-view-logs-report" onClick={() => handleFileClick(file)}>
                    <FaEye /> View
                  </button>
                  <button className="btn-download-logs-report" onClick={() => handleDownloadCsv(selectedCategory.key, file.date)}>
                    <FaDownload /> CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDataTable = () => {
    if (loadingData) {
      return (
        <div className="loading-logs-report">
          <div className="spinner-logs-report" />
          <span>Loading log data...</span>
        </div>
      );
    }

    const actionColIdx = logHeaders.findIndex(h =>
      h.toLowerCase() === 'action' || h.toLowerCase() === 'action_type'
    );

    return (
      <div className="data-section-logs-report">
        <div className="data-header-logs-report">
          <div className="data-header-left-logs-report">
            <button className="btn-back-logs-report" onClick={handleBack}>
              <FaArrowLeft /> Back to Files
            </button>
            <div className="data-title-logs-report">{selectedCategory?.label} - {selectedDate}</div>
            <span className="data-count-logs-report">
              {filteredRows.length === totalRows
                ? `${totalRows} record${totalRows !== 1 ? 's' : ''}`
                : `${filteredRows.length} of ${totalRows}`}
            </span>
          </div>
          <div className="data-header-right-logs-report">
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#80868b', fontSize: 13 }} />
              <input
                className="search-input-logs-report"
                style={{ paddingLeft: 32 }}
                type="text"
                placeholder="Search in log data..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-download-excel-logs-report" onClick={handleDownloadExcel}>
              <FaFileExcel /> Excel Report
            </button>
            <button className="btn-download-logs-report" onClick={() => handleDownloadCsv(selectedCategory.key, selectedDate)}>
              <FaDownload /> CSV
            </button>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="empty-state-logs-report">
            <FaClipboardList className="empty-icon-logs-report" />
            <div className="empty-title-logs-report">
              {totalRows === 0 ? 'No Log Entries' : 'No Matching Results'}
            </div>
            <div className="empty-text-logs-report">
              {totalRows === 0 ? 'This log file has no data entries.' : 'Try adjusting your search term.'}
            </div>
          </div>
        ) : (
          <div className="table-wrapper-logs-report">
            <table className="table-logs-report">
              <thead>
                <tr>
                  <th>#</th>
                  {logHeaders.map(h => (
                    <th key={h}>{h.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td>{rowIdx + 1}</td>
                    {logHeaders.map((h, colIdx) => {
                      const val = row[h] || '';
                      if (colIdx === actionColIdx && val) {
                        return (
                          <td key={h}>
                            <span className={`action-badge-logs-report ${getActionBadgeClass(val)}`}>
                              {val}
                            </span>
                          </td>
                        );
                      }
                      return <td key={h} title={val}>{val}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-logs-report">
      <div className="header-logs-report">
        <div className="header-left-logs-report">
          <FaClipboardList className="header-icon-logs-report" />
          <div>
            <div className="header-title-logs-report">System Logs & Reports</div>
            <div className="header-subtitle-logs-report">View, search, and download system activity logs</div>
          </div>
        </div>
        <div className="header-right-logs-report">
          <button className="btn-refresh-logs-report" onClick={() => refetchCategories()}>
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {renderBreadcrumbs()}

      <div className="content-logs-report">
        {!selectedCategory && renderCategories()}
        {selectedCategory && !selectedDate && renderFiles()}
        {selectedCategory && selectedDate && renderDataTable()}
      </div>
    </div>
  );
}
