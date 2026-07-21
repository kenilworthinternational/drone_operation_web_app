import React, { useMemo, useState } from 'react';
import { Bars } from 'react-loader-spinner';
import {
  useLazyGetKpiTaskKanbanQuery,
  useSaveKpiTaskMutation,
} from '../../../api/services NodeJs/employeeKpiApi';
import { useGetAllEmployeeRegistrationsQuery } from '../../../api/services NodeJs/jdManagementApi';
import { useGetWingsQuery } from '../../../api/services NodeJs/jdManagementApi';
import EmployeeKpiTaskDrawer from './EmployeeKpiTaskDrawer';

const EMPTY_LIST = [];
const KANBAN_COLUMNS = [
  { key: 'pending', label: 'Pending' },
  { key: 'started', label: 'Started' },
  { key: 'completed', label: 'Completed' },
];

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const CYCLE_LABELS = {
  month: 'Month',
  quarter: 'Quarter',
  two_quarters: '2 Quarters',
  three_quarters: '3 Quarters',
  year: 'Year',
};

function pad2(n) {
  return String(n).padStart(2, '0');
}

function todayYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDueLabel(task) {
  if (!task?.due_date) return '';
  if (task.is_overdue) return `${Math.abs(task.days_remaining)}d overdue`;
  if (task.days_remaining === 0) return 'Due today';
  if (task.days_remaining != null) return `${task.days_remaining}d left`;
  return task.due_date;
}

export default function EmployeeKpiTaskKanban() {
  const [employeeId, setEmployeeId] = useState('');
  const [wingCode, setWingCode] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    employee_id: '',
    title: '',
    description: '',
    priority: 'medium',
    cycle_type: 'month',
    assigned_date: todayYmd(),
    subtasks: [''],
  });
  const [createError, setCreateError] = useState('');

  const kanbanBody = useMemo(
    () => ({
      employeeId: employeeId ? Number(employeeId) : undefined,
      wingCode: wingCode || undefined,
    }),
    [employeeId, wingCode],
  );

  const [fetchKanban, { data: kanban, isFetching, error }] = useLazyGetKpiTaskKanbanQuery();
  const [saveTask, { isLoading: saving }] = useSaveKpiTaskMutation();

  const { data: employeesRaw } = useGetAllEmployeeRegistrationsQuery();
  const { data: wingsRaw } = useGetWingsQuery();

  const employees = useMemo(() => {
    const list = Array.isArray(employeesRaw) ? employeesRaw : employeesRaw?.data || EMPTY_LIST;
    return [...list]
      .filter((e) => Number(e.activated) !== 0)
      .sort((a, b) => String(a.employeeName || '').localeCompare(String(b.employeeName || '')));
  }, [employeesRaw]);

  const wings = wingsRaw?.wings || wingsRaw?.data?.wings || wingsRaw?.data || EMPTY_LIST;

  React.useEffect(() => {
    fetchKanban(kanbanBody);
  }, [fetchKanban, kanbanBody]);

  const columns = kanban?.columns || {};

  const openCreate = () => {
    setCreateForm({
      employee_id: employeeId || '',
      title: '',
      description: '',
      priority: 'medium',
      cycle_type: 'month',
      assigned_date: todayYmd(),
      subtasks: [''],
    });
    setCreateError('');
    setCreateOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!createForm.employee_id || !createForm.title.trim()) {
      setCreateError('Employee and title are required.');
      return;
    }
    try {
      const subtasks = (createForm.subtasks || [])
        .map((s) => String(s || '').trim())
        .filter(Boolean)
        .map((title) => ({ title }));
      await saveTask({
        employee_id: Number(createForm.employee_id),
        title: createForm.title.trim(),
        description: createForm.description.trim() || null,
        priority: createForm.priority,
        cycle_type: createForm.cycle_type,
        assigned_date: createForm.assigned_date,
        subtasks,
      }).unwrap();
      setCreateOpen(false);
      fetchKanban(kanbanBody);
    } catch (err) {
      setCreateError(err?.data?.message || err?.message || 'Failed to create task.');
    }
  };

  const onDrawerClose = () => {
    setSelectedTaskId(null);
    fetchKanban(kanbanBody);
  };

  return (
    <div className="employee-kpi-tasks-wrap">
      <div className="employee-kpi-toolbar employee-kpi-tasks-toolbar">
        <label>
          Employee
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">All employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employeeName || emp.empNo} {emp.empNo ? `(${emp.empNo})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Wing
          <select value={wingCode} onChange={(e) => setWingCode(e.target.value)}>
            <option value="">All wings</option>
            {wings.map((w) => (
              <option key={w.id || w.wingsCode} value={w.wingsCode || w.code}>
                {w.wing || w.wingsCode}
              </option>
            ))}
          </select>
        </label>
        <div className="employee-kpi-toolbar-actions">
          <button type="button" className="employee-kpi-btn employee-kpi-btn-secondary" onClick={() => fetchKanban(kanbanBody)}>
            Refresh
          </button>
          <button type="button" className="employee-kpi-btn employee-kpi-btn-primary" onClick={openCreate}>
            + New Task
          </button>
        </div>
      </div>

      {error ? (
        <div className="employee-kpi-error">
          {error?.data?.message || error?.message || 'Failed to load tasks.'}
        </div>
      ) : null}

      {isFetching ? (
        <div className="employee-kpi-loading">
          <Bars height={40} width={40} color="#004b71" />
        </div>
      ) : (
        <div className="employee-kpi-kanban">
          {KANBAN_COLUMNS.map((col) => (
            <div key={col.key} className="employee-kpi-kanban-column">
              <div className="employee-kpi-kanban-column-header">
                <span>{col.label}</span>
                <span className="employee-kpi-kanban-count">{(columns[col.key] || []).length}</span>
              </div>
              <div className="employee-kpi-kanban-cards">
                {(columns[col.key] || []).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className={`employee-kpi-task-card priority-${task.priority}${task.is_overdue ? ' overdue' : ''}`}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="employee-kpi-task-card-title">{task.title}</div>
                    <div className="employee-kpi-task-card-meta">
                      {task.employee_name}
                      {task.emp_no ? ` · ${task.emp_no}` : ''}
                    </div>
                    <div className="employee-kpi-task-card-row">
                      <span className={`employee-kpi-priority-chip priority-${task.priority}`}>
                        {PRIORITY_LABELS[task.priority] || task.priority}
                      </span>
                      <span className={task.is_overdue ? 'employee-kpi-due overdue' : 'employee-kpi-due'}>
                        {formatDueLabel(task)}
                      </span>
                    </div>
                    {task.total_subtasks > 0 ? (
                      <div className="employee-kpi-subtask-progress">
                        <div
                          className="employee-kpi-subtask-progress-bar"
                          style={{ width: `${task.progress_percent || 0}%` }}
                        />
                        <span>{task.completed_subtasks}/{task.total_subtasks} subtasks</span>
                      </div>
                    ) : null}
                    {task.status === 'completed' && task.on_time != null ? (
                      <div className="employee-kpi-task-card-foot">
                        {task.on_time ? 'On time ✓' : 'Late completion'}
                        {task.days_to_complete != null ? ` · ${task.days_to_complete}d` : ''}
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTaskId ? (
        <EmployeeKpiTaskDrawer taskId={selectedTaskId} onClose={onDrawerClose} />
      ) : null}

      {createOpen ? (
        <div className="employee-kpi-drawer-overlay" onClick={() => setCreateOpen(false)}>
          <div className="employee-kpi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="employee-kpi-drawer-header">
              <div>
                <h2>New KPI Task</h2>
                <p>Assign a parent task with optional subtasks.</p>
              </div>
              <button type="button" className="employee-kpi-drawer-close" onClick={() => setCreateOpen(false)}>×</button>
            </div>
            <form className="employee-kpi-modal-body" onSubmit={handleCreate}>
              <label>
                Employee
                <select
                  required
                  value={createForm.employee_id}
                  onChange={(e) => setCreateForm((f) => ({ ...f, employee_id: e.target.value }))}
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeName || emp.empNo}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Title
                <input
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Task title"
                />
              </label>
              <label>
                Description
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional details"
                />
              </label>
              <div className="employee-kpi-form-row">
                <label>
                  Priority
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm((f) => ({ ...f, priority: e.target.value }))}
                  >
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Cycle
                  <select
                    value={createForm.cycle_type}
                    onChange={(e) => setCreateForm((f) => ({ ...f, cycle_type: e.target.value }))}
                  >
                    {Object.entries(CYCLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Assigned date
                  <input
                    type="date"
                    value={createForm.assigned_date}
                    onChange={(e) => setCreateForm((f) => ({ ...f, assigned_date: e.target.value }))}
                  />
                </label>
              </div>
              <div className="employee-kpi-subtask-editor">
                <div className="employee-kpi-subtask-editor-head">
                  <span>Subtasks (optional)</span>
                  <button
                    type="button"
                    className="employee-kpi-btn employee-kpi-btn-secondary"
                    onClick={() => setCreateForm((f) => ({ ...f, subtasks: [...f.subtasks, ''] }))}
                  >
                    + Add
                  </button>
                </div>
                {createForm.subtasks.map((sub, idx) => (
                  <input
                    key={`sub-${idx}`}
                    value={sub}
                    onChange={(e) => {
                      const next = [...createForm.subtasks];
                      next[idx] = e.target.value;
                      setCreateForm((f) => ({ ...f, subtasks: next }));
                    }}
                    placeholder={`Subtask ${idx + 1}`}
                  />
                ))}
              </div>
              {createError ? <div className="employee-kpi-error">{createError}</div> : null}
              <div className="employee-kpi-modal-actions">
                <button type="button" className="employee-kpi-btn employee-kpi-btn-secondary" onClick={() => setCreateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="employee-kpi-btn employee-kpi-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
