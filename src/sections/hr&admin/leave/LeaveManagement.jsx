import React, { useState } from 'react';
import {
  useDecideHrLeaveRequestMutation,
  useGetHrHolidayCalendarQuery,
  useGetHrApprovalsInboxQuery,
  useGetHrLeaveTypesAllQuery,
  useSaveHrHolidayMarkMutation,
} from '../../../api/services NodeJs/hrLeaveApi';
import {
  useGetAllEmployeeRegistrationsQuery,
  useUpdateEmployeeRegistrationMutation,
} from '../../../api/services NodeJs/jdManagementApi';
import '../../../styles/leavemanagement.css';

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('approvals');
  const [holidayMonth, setHolidayMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const { data: inboxResponse, refetch: refetchInbox } = useGetHrApprovalsInboxQuery({});
  const { data: leaveTypesResponse } = useGetHrLeaveTypesAllQuery();
  const { data: holidayResponse, refetch: refetchHolidays } = useGetHrHolidayCalendarQuery({ yearMonth: holidayMonth });
  const { data: allEmployeesResponse, refetch: refetchEmployees } = useGetAllEmployeeRegistrationsQuery();
  const [decideLeaveRequest, { isLoading: deciding }] = useDecideHrLeaveRequestMutation();
  const [saveHrHolidayMark, { isLoading: savingHoliday }] = useSaveHrHolidayMarkMutation();
  const [updateEmployeeRegistration, { isLoading: updatingEmployee }] = useUpdateEmployeeRegistrationMutation();
  const [message, setMessage] = useState('');
  const [savingEmployeeId, setSavingEmployeeId] = useState(null);
  const [editedAccessByEmployee, setEditedAccessByEmployee] = useState({});

  const inbox = inboxResponse?.data || [];
  const leaveTypes = leaveTypesResponse?.data || [];
  const allEmployees = Array.isArray(allEmployeesResponse)
    ? allEmployeesResponse
    : Array.isArray(allEmployeesResponse?.data)
      ? allEmployeesResponse.data
      : Array.isArray(allEmployeesResponse?.data?.data)
        ? allEmployeesResponse.data.data
        : [];
  const holidayRows = Array.isArray(holidayResponse?.data) ? holidayResponse.data : [];
  const holidayByDate = holidayRows.reduce((acc, row) => {
    const key = String(row?.holiday_date || '');
    if (key) acc[key] = String(row?.holiday_type || '').toLowerCase();
    return acc;
  }, {});

  const buildMonthDays = (yearMonthValue) => {
    const [yearText, monthText] = String(yearMonthValue || '').split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    if (!Number.isFinite(year) || !Number.isFinite(month)) return [];
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const days = [];
    for (let day = 1; day <= end.getDate(); day += 1) {
      const date = new Date(year, month - 1, day);
      days.push({
        dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        dayNumber: day,
        weekDay: date.getDay(),
      });
    }
    const leading = start.getDay();
    return [...Array.from({ length: leading }, (_, idx) => ({ empty: true, key: `lead-${idx}` })), ...days];
  };
  const holidayCalendarCells = buildMonthDays(holidayMonth);
  const formatStatus = (value) => {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return 'Unknown';
    if (text === 'pending_l1') return 'Pending L1';
    if (text === 'pending_l2') return 'Pending L2';
    return text.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusBadgeClass = (value) => {
    const text = String(value || '').trim().toLowerCase();
    if (text === 'approved') return 'approved-leavemgt';
    if (text === 'rejected') return 'rejected-leavemgt';
    return 'pending-leavemgt';
  };
  const onDecision = async (requestId, action) => {
    try {
      await decideLeaveRequest({ requestId, action }).unwrap();
      setMessage(`Request ${action}d`);
      refetchInbox();
    } catch (error) {
      setMessage(error?.data?.message || `Failed to ${action}`);
    }
  };

  const onToggleLeaveTypeAccess = (employeeId, leaveCode) => {
    setEditedAccessByEmployee((prev) => {
      const existingRaw =
        prev[employeeId] !== undefined
          ? prev[employeeId]
          : String(allEmployees.find((item) => String(item.id) === String(employeeId))?.leaveTypeAccess || '');
      const existingSet = new Set(
        existingRaw
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      );
      if (existingSet.has(leaveCode)) existingSet.delete(leaveCode);
      else existingSet.add(leaveCode);
      return {
        ...prev,
        [employeeId]: Array.from(existingSet).join(','),
      };
    });
  };

  const onSaveLeaveTypeAccess = async (employee) => {
    try {
      setSavingEmployeeId(employee.id);
      const leaveTypeAccessRaw =
        editedAccessByEmployee[employee.id] !== undefined
          ? editedAccessByEmployee[employee.id]
          : String(employee.leaveTypeAccess || '');
      const visibleCodes = new Set(leaveTypes.map((type) => String(type.code || '').trim()).filter(Boolean));
      const existingCodes = String(employee.leaveTypeAccess || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const selectedCodes = leaveTypeAccessRaw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const hiddenExistingCodes = existingCodes.filter((code) => !visibleCodes.has(code));
      const finalCodes = Array.from(new Set([...selectedCodes, ...hiddenExistingCodes]));
      const leaveTypeAccess = finalCodes.join(',');
      await updateEmployeeRegistration({
        id: employee.id,
        leaveTypeAccess,
      }).unwrap();
      setMessage(`Updated leave types for ${employee.employeeName || employee.empNo || employee.id}`);
      refetchEmployees();
    } catch (error) {
      setMessage(error?.data?.message || 'Failed to update employee leave types');
    } finally {
      setSavingEmployeeId(null);
    }
  };

  const onToggleHolidayMark = async (dateKey) => {
    const currentType = holidayByDate[dateKey] || '';
    const nextType = currentType === '' ? 'mercantile' : currentType === 'mercantile' ? 'poya' : '';
    try {
      await saveHrHolidayMark({
        holidayDate: dateKey,
        holidayType: nextType || null,
      }).unwrap();
      refetchHolidays();
      setMessage(nextType ? `Marked ${dateKey} as ${nextType}` : `Removed holiday mark for ${dateKey}`);
    } catch (error) {
      setMessage(error?.data?.message || 'Failed to save holiday mark');
    }
  };

  return (
    <div className="leave-page-leavemgt">
      <div className="leave-tabs-leavemgt">
        <button
          type="button"
          className={`leave-tab-btn-leavemgt ${activeTab === 'approvals' ? 'active-leavemgt' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          Approvals
        </button>
        <button
          type="button"
          className={`leave-tab-btn-leavemgt ${activeTab === 'data_handling' ? 'active-leavemgt' : ''}`}
          onClick={() => setActiveTab('data_handling')}
        >
          Data Handling
        </button>
        <button
          type="button"
          className={`leave-tab-btn-leavemgt ${activeTab === 'holiday_marking' ? 'active-leavemgt' : ''}`}
          onClick={() => setActiveTab('holiday_marking')}
        >
          Holiday Marking
        </button>
      </div>

      {activeTab === 'approvals' ? (
        <div className="leave-grid-leavemgt">
          <div className="leave-card-leavemgt leave-span-2-leavemgt">
            <div className="leave-card-header-leavemgt">
              <h3>Approvals Inbox</h3>
              <span className="leave-muted-leavemgt">{inbox.length} requests</span>
            </div>
            <div className="leave-list-leavemgt">
              {inbox.length === 0 && <div className="leave-empty-leavemgt">No pending approvals.</div>}
              {inbox.map((request) => (
                <div key={request.id} className="leave-item-leavemgt leave-item-approval-leavemgt">
                  <div className="leave-item-top-leavemgt">
                    <div>
                      <strong>{request.employeeName}</strong>
                      <div className="leave-subtext-leavemgt">{request.leaveTypeName}</div>
                    </div>
                    <span className={`leave-status-badge-leavemgt ${getStatusBadgeClass(request.current_status)}`}>
                      {formatStatus(request.current_status)}
                    </span>
                  </div>
                  <div className="leave-item-meta-leavemgt">
                    {request.start_date} to {request.end_date}
                  </div>
                  <div className="leave-row-leavemgt leave-actions-leavemgt">
                    <button className="leave-btn-leavemgt leave-btn-approve-leavemgt" type="button" disabled={deciding} onClick={() => onDecision(request.id, 'approve')}>Approve</button>
                    <button className="leave-btn-leavemgt leave-btn-reject-leavemgt" type="button" disabled={deciding} onClick={() => onDecision(request.id, 'reject')}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'data_handling' ? (
        <div className="leave-grid-leavemgt">
          <div className="leave-card-leavemgt leave-span-2-leavemgt">
            <div className="leave-card-header-leavemgt">
              <h3>Data Handling</h3>
              <span className="leave-muted-leavemgt">Assign leave types per employee</span>
            </div>
            <div className="leave-list-leavemgt">
              {allEmployees.length === 0 && <div className="leave-empty-leavemgt">No employees found.</div>}
              {allEmployees.map((employee) => {
                const effectiveAccess =
                  editedAccessByEmployee[employee.id] !== undefined
                    ? editedAccessByEmployee[employee.id]
                    : String(employee.leaveTypeAccess || '');
                const selectedCodes = new Set(
                  effectiveAccess
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean)
                );
                const selectedTypeNames = leaveTypes
                  .filter((type) => selectedCodes.has(String(type.code || '').trim()))
                  .map((type) => type.name)
                  .filter(Boolean);
                const currentAccessText = selectedTypeNames.length > 0
                  ? selectedTypeNames.join(', ')
                  : 'All requestable types';
                return (
                  <div key={employee.id} className="leave-item-leavemgt leave-item-data-leavemgt">
                    <div className="leave-item-top-leavemgt">
                      <div className="leave-employee-meta-leavemgt">
                        <strong>{employee.employeeName || employee.preferredName || employee.empNo || `Employee ${employee.id}`}</strong>
                        <div className="leave-subtext-leavemgt">Emp No: {employee.empNo || '-'}</div>
                      </div>
                      <div className="leave-current-access-center-leavemgt" title={currentAccessText}>
                        {currentAccessText}
                      </div>
                      <div className="leave-top-actions-leavemgt">
                        <button
                          className="leave-btn-leavemgt leave-btn-approve-leavemgt"
                          type="button"
                          disabled={updatingEmployee && String(savingEmployeeId) === String(employee.id)}
                          onClick={() => onSaveLeaveTypeAccess(employee)}
                        >
                          {updatingEmployee && String(savingEmployeeId) === String(employee.id) ? 'Saving...' : 'Save Access'}
                        </button>
                      </div>
                    </div>
                    <div className="leave-access-grid-leavemgt">
                      {leaveTypes
                        .filter((type) => Number(type?.employee_requestable ?? type?.employeeRequestable ?? 1) === 1 && String(type?.code || '') !== 'bulk_leave')
                        .map((type) => (
                          <label key={`${employee.id}-${type.code}`} className="leave-checkbox-chip-leavemgt">
                            <input
                              type="checkbox"
                              checked={selectedCodes.has(type.code)}
                              onChange={() => onToggleLeaveTypeAccess(employee.id, type.code)}
                            />
                            {type.name}
                          </label>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="leave-grid-leavemgt">
          <div className="leave-card-leavemgt leave-span-2-leavemgt">
            <div className="leave-card-header-leavemgt">
              <h3>Mark Holidays</h3>
              <span className="leave-muted-leavemgt">Click date to cycle: None -> Mercantile -> Poya</span>
            </div>
            <div className="leave-holiday-toolbar-leavemgt">
              <input
                type="month"
                value={holidayMonth}
                onChange={(e) => setHolidayMonth(e.target.value)}
                className="leave-month-input-leavemgt"
              />
              <div className="leave-holiday-legend-leavemgt">
                <span className="holiday-dot-leavemgt mercantile-leavemgt" /> Mercantile
                <span className="holiday-dot-leavemgt poya-leavemgt" /> Poya
              </div>
            </div>
            <div className="leave-holiday-weekdays-leavemgt">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="leave-holiday-weekday-leavemgt">{day}</div>
              ))}
            </div>
            <div className="leave-holiday-grid-leavemgt">
              {holidayCalendarCells.map((cell) => {
                if (cell.empty) {
                  return <div key={cell.key} className="leave-holiday-cell-leavemgt empty-leavemgt" />;
                }
                const type = holidayByDate[cell.dateKey] || '';
                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    className={`leave-holiday-cell-leavemgt ${type ? `${type}-leavemgt` : 'normal-leavemgt'}`}
                    onClick={() => onToggleHolidayMark(cell.dateKey)}
                    disabled={savingHoliday}
                    title={type ? `${cell.dateKey} - ${type}` : `${cell.dateKey} - no holiday`}
                  >
                    <span>{cell.dayNumber}</span>
                    {type ? <small>{type === 'mercantile' ? 'Mercantile' : 'Poya'}</small> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {message ? (
        <div className={`leave-message-leavemgt ${message.toLowerCase().includes('failed') ? 'error-leavemgt' : 'success-leavemgt'}`}>
          {message}
        </div>
      ) : null}
    </div>
  );
};

export default LeaveManagement;
