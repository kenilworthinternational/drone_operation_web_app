import React, { useState } from 'react';
import {
  useGetHrHolidayCalendarQuery,
  useGetHrLeaveTypesAllQuery,
  useSaveHrHolidayMarkMutation,
} from '../../../api/services NodeJs/hrLeaveApi';
import {
  useGetAllEmployeeRegistrationsQuery,
  useUpdateEmployeeRegistrationMutation,
} from '../../../api/services NodeJs/jdManagementApi';
import '../../../styles/leavemanagement.css';

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('data_handling');
  const [holidayMonth, setHolidayMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const { data: leaveTypesResponse } = useGetHrLeaveTypesAllQuery();
  const { data: holidayResponse, refetch: refetchHolidays } = useGetHrHolidayCalendarQuery({ yearMonth: holidayMonth });
  const { data: allEmployeesResponse, refetch: refetchEmployees } = useGetAllEmployeeRegistrationsQuery();
  const [saveHrHolidayMark, { isLoading: savingHoliday }] = useSaveHrHolidayMarkMutation();
  const [updateEmployeeRegistration, { isLoading: updatingEmployee }] = useUpdateEmployeeRegistrationMutation();
  const [message, setMessage] = useState('');
  const [savingEmployeeId, setSavingEmployeeId] = useState(null);
  const [editedAccessByEmployee, setEditedAccessByEmployee] = useState({});
  const [editedFlexByEmployee, setEditedFlexByEmployee] = useState({});
  const [flexSearchText, setFlexSearchText] = useState('');
  const [flexStatusFilter, setFlexStatusFilter] = useState('all');

  const leaveTypes = leaveTypesResponse?.data || [];
  const allEmployees = Array.isArray(allEmployeesResponse)
    ? allEmployeesResponse
    : Array.isArray(allEmployeesResponse?.data)
      ? allEmployeesResponse.data
      : Array.isArray(allEmployeesResponse?.data?.data)
        ? allEmployeesResponse.data.data
        : [];
  const holidayRows = Array.isArray(holidayResponse?.data) ? holidayResponse.data : [];
  const holidayMetaByDate = holidayRows.reduce((acc, row) => {
    const key = String(row?.holiday_date || '').slice(0, 10);
    if (!key) return acc;
    const t = String(row?.holiday_type || '').toLowerCase();
    if (t === 'mercantile' || t === 'poya') {
      acc[key] = {
        type: t,
        description: row.description != null ? String(row.description).trim() : '',
      };
    }
    return acc;
  }, {});
  const [holidayModal, setHolidayModal] = useState(null);

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
  const normalizeCsvCodes = (value) =>
    Array.from(
      new Set(
        String(value || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      )
    )
      .sort()
      .join(',');
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

  const getEffectiveFlex = (employee) => {
    const overridden = editedFlexByEmployee[employee.id];
    if (overridden) return overridden;
    return {
      enabled:
        Number(employee.flexHoursEnabled ?? employee.flex_hours_enabled ?? 0) === 1 ||
        employee.flexHoursEnabled === true,
      minutes: Number(employee.flexHoursMinutes ?? employee.flex_hours_minutes ?? 0) || 0,
    };
  };

  const onFlexEnabledChange = (employee, checked) => {
    const current = getEffectiveFlex(employee);
    setEditedFlexByEmployee((prev) => ({
      ...prev,
      [employee.id]: {
        ...current,
        enabled: checked,
      },
    }));
  };

  const onFlexMinutesChange = (employee, value) => {
    const current = getEffectiveFlex(employee);
    const nextMinutes = value === '' ? 0 : Math.max(0, Number(value || 0));
    setEditedFlexByEmployee((prev) => ({
      ...prev,
      [employee.id]: {
        ...current,
        minutes: Number.isFinite(nextMinutes) ? nextMinutes : 0,
      },
    }));
  };

  const onSaveFlexHours = async (employee) => {
    try {
      setSavingEmployeeId(employee.id);
      const effective = getEffectiveFlex(employee);
      await updateEmployeeRegistration({
        id: employee.id,
        flexHoursEnabled: effective.enabled ? 1 : 0,
        flexHoursMinutes: effective.enabled ? Number(effective.minutes || 0) : 0,
      }).unwrap();
      setMessage(`Updated flex hours for ${employee.employeeName || employee.empNo || employee.id}`);
      refetchEmployees();
    } catch (error) {
      setMessage(error?.data?.message || 'Failed to update flex hours');
    } finally {
      setSavingEmployeeId(null);
    }
  };

  const filteredFlexEmployees = allEmployees.filter((employee) => {
    const effective = getEffectiveFlex(employee);
    const statusOk =
      flexStatusFilter === 'all' ||
      (flexStatusFilter === 'enabled' && effective.enabled) ||
      (flexStatusFilter === 'disabled' && !effective.enabled);
    if (!statusOk) return false;
    const needle = String(flexSearchText || '').trim().toLowerCase();
    if (!needle) return true;
    const name = String(employee.employeeName || employee.preferredName || '').toLowerCase();
    const empNo = String(employee.empNo || '').toLowerCase();
    return name.includes(needle) || empNo.includes(needle);
  });

  const openHolidayEditor = (dateKey) => {
    const existing = holidayMetaByDate[dateKey];
    setHolidayModal({
      dateKey,
      holidayType: existing?.type || '',
      description: existing?.description || '',
    });
  };

  const saveHolidayModal = async () => {
    if (!holidayModal) return;
    try {
      await saveHrHolidayMark({
        holidayDate: holidayModal.dateKey,
        holidayType: holidayModal.holidayType || null,
        description:
          holidayModal.holidayType && String(holidayModal.description || '').trim()
            ? String(holidayModal.description).trim()
            : null,
      }).unwrap();
      setHolidayModal(null);
      refetchHolidays();
      setMessage(
        holidayModal.holidayType
          ? `Saved holiday for ${holidayModal.dateKey}`
          : `Removed holiday for ${holidayModal.dateKey}`
      );
    } catch (error) {
      setMessage(error?.data?.message || 'Failed to save holiday');
    }
  };

  return (
    <div className="leave-page-leavemgt">
      <div className="leave-tabs-leavemgt">
        <button
          type="button"
          className={`leave-tab-btn-leavemgt ${activeTab === 'data_handling' ? 'active-leavemgt' : ''}`}
          onClick={() => setActiveTab('data_handling')}
        >
          Employee Leave Availability
        </button>
        <button
          type="button"
          className={`leave-tab-btn-leavemgt ${activeTab === 'holiday_marking' ? 'active-leavemgt' : ''}`}
          onClick={() => setActiveTab('holiday_marking')}
        >
          Holiday Marking
        </button>
        <button
          type="button"
          className={`leave-tab-btn-leavemgt ${activeTab === 'flex_hours' ? 'active-leavemgt' : ''}`}
          onClick={() => setActiveTab('flex_hours')}
        >
          Employee Flex Hours
        </button>
      </div>

      {activeTab === 'data_handling' ? (
        <div className="leave-grid-leavemgt">
          <div className="leave-card-leavemgt leave-span-2-leavemgt">
            <div className="leave-card-header-leavemgt">
              <h3>Employee Leave Availability</h3>
              <span className="leave-muted-leavemgt">Assign leave types per employee</span>
            </div>
            <div className="leave-list-leavemgt">
              {allEmployees.length === 0 && <div className="leave-empty-leavemgt">No employees found.</div>}
              {allEmployees.map((employee) => {
                const effectiveAccess =
                  editedAccessByEmployee[employee.id] !== undefined
                    ? editedAccessByEmployee[employee.id]
                    : String(employee.leaveTypeAccess || '');
                const hasAccessChanges =
                  normalizeCsvCodes(effectiveAccess) !== normalizeCsvCodes(employee.leaveTypeAccess || '');
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
                          disabled={!hasAccessChanges || (updatingEmployee && String(savingEmployeeId) === String(employee.id))}
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
      ) : activeTab === 'holiday_marking' ? (
        <div className="leave-grid-leavemgt">
          <div className="leave-card-leavemgt leave-span-2-leavemgt">
            <div className="leave-card-header-leavemgt">
              <h3>Mark Holidays</h3>
              <span className="leave-muted-leavemgt">Click a date to set type and holiday name</span>
            </div>
            <div className="leave-holiday-toolbar-leavemgt">
              <input
                type="month"
                value={holidayMonth}
                onChange={(e) => setHolidayMonth(e.target.value)}
                className="leave-month-input-leavemgt"
              />
              <div className="leave-holiday-legend-leavemgt">
                <span className="holiday-dot-leavemgt mercantile-leavemgt" /> Statutory holidays
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
                const meta = holidayMetaByDate[cell.dateKey];
                const type = meta?.type || '';
                const desc = meta?.description || '';
                const labelShort =
                  desc || (type === 'mercantile' ? 'Statutory' : type === 'poya' ? 'Poya' : '');
                const titleFull = type
                  ? `${cell.dateKey} — ${type === 'mercantile' ? 'Statutory holiday' : 'Poya holiday'}${desc ? ` — ${desc}` : ''}`
                  : `${cell.dateKey} — no holiday`;
                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    className={`leave-holiday-cell-leavemgt ${type ? `${type}-leavemgt` : 'normal-leavemgt'}`}
                    onClick={() => openHolidayEditor(cell.dateKey)}
                    disabled={savingHoliday}
                    title={titleFull}
                  >
                    <span>{cell.dayNumber}</span>
                    {type ? <small className="leave-holiday-cell-label-leavemgt">{labelShort}</small> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="leave-grid-leavemgt">
          <div className="leave-card-leavemgt leave-span-2-leavemgt">
            <div className="leave-card-header-leavemgt">
              <h3>Employee Flex Hours</h3>
              <span className="leave-muted-leavemgt">Enable and maintain flex-hours minutes per employee</span>
            </div>
            <div className="leave-flex-filter-row-leavemgt">
              <input
                type="search"
                className="leave-input-leavemgt leave-flex-search-input-leavemgt"
                placeholder="Search by employee name or emp no"
                value={flexSearchText}
                onChange={(e) => setFlexSearchText(e.target.value)}
              />
              <select
                className="leave-input-leavemgt leave-flex-status-select-leavemgt"
                value={flexStatusFilter}
                onChange={(e) => setFlexStatusFilter(e.target.value)}
              >
                <option value="all">All employees</option>
                <option value="enabled">Flex enabled</option>
                <option value="disabled">Flex disabled</option>
              </select>
            </div>
            <div className="leave-list-leavemgt">
              {filteredFlexEmployees.length === 0 && <div className="leave-empty-leavemgt">No employees found.</div>}
              {filteredFlexEmployees.map((employee) => {
                const effective = getEffectiveFlex(employee);
                const isSaving = updatingEmployee && String(savingEmployeeId) === String(employee.id);
                return (
                  <div key={employee.id} className="leave-item-leavemgt leave-item-data-leavemgt leave-item-flex-leavemgt">
                    <div className="leave-item-top-leavemgt leave-item-top-flex-leavemgt">
                      <div className="leave-employee-meta-leavemgt">
                        <strong>{employee.employeeName || employee.preferredName || employee.empNo || `Employee ${employee.id}`}</strong>
                        <div className="leave-subtext-leavemgt">Emp No: {employee.empNo || '-'}</div>
                      </div>
                      <div className="leave-flex-controls-leavemgt">
                        <label className="leave-checkbox-chip-leavemgt">
                          <input
                            type="checkbox"
                            checked={effective.enabled}
                            onChange={(e) => onFlexEnabledChange(employee, e.target.checked)}
                          />
                          Flex hours enabled
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="leave-input-leavemgt leave-flex-minutes-input-leavemgt"
                          value={effective.enabled ? (effective.minutes > 0 ? String(effective.minutes) : '') : ''}
                          disabled={!effective.enabled}
                          placeholder="Enter minutes"
                          onChange={(e) => onFlexMinutesChange(employee, e.target.value)}
                        />
                        <span className="leave-subtext-leavemgt leave-flex-unit-leavemgt">minutes</span>
                      </div>
                      <div className="leave-top-actions-leavemgt">
                        <button
                          className="leave-btn-leavemgt leave-btn-approve-leavemgt"
                          type="button"
                          disabled={isSaving}
                          onClick={() => onSaveFlexHours(employee)}
                        >
                          {isSaving ? 'Saving...' : 'Save Flex'}
                        </button>
                      </div>
                    </div>
                  </div>
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

      {holidayModal ? (
        <div
          className="leave-holiday-modal-overlay-leavemgt"
          role="presentation"
          onClick={() => setHolidayModal(null)}
        >
          <div
            className="leave-holiday-modal-leavemgt"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-holiday-modal-title-leavemgt"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="leave-holiday-modal-title-leavemgt" className="leave-holiday-modal-title-leavemgt">
              Holiday — {holidayModal.dateKey}
            </h4>
            <label className="leave-holiday-modal-label-leavemgt" htmlFor="holiday-type-select-leavemgt">Type</label>
            <select
              id="holiday-type-select-leavemgt"
              className="leave-holiday-modal-select-leavemgt"
              value={holidayModal.holidayType}
              onChange={(e) => setHolidayModal((prev) => ({ ...prev, holidayType: e.target.value }))}
            >
              <option value="">None (remove mark)</option>
              <option value="mercantile">Statutory holiday</option>
              <option value="poya">Poya holiday</option>
            </select>
            <label className="leave-holiday-modal-label-leavemgt" htmlFor="holiday-desc-input-leavemgt">
              Holiday name / description
            </label>
            <input
              id="holiday-desc-input-leavemgt"
              type="text"
              className="leave-holiday-modal-input-leavemgt"
              placeholder="Shown on calendar and roster hover"
              value={holidayModal.description}
              disabled={!holidayModal.holidayType}
              onChange={(e) => setHolidayModal((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="leave-holiday-modal-actions-leavemgt">
              <button
                type="button"
                className="leave-btn-leavemgt leave-btn-approve-leavemgt"
                disabled={savingHoliday}
                onClick={saveHolidayModal}
              >
                {savingHoliday ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="leave-btn-leavemgt leave-btn-secondary-leavemgt"
                onClick={() => setHolidayModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LeaveManagement;
