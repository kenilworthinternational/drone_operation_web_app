import React, { useEffect, useState } from 'react';
import {
  useLazyGetKpiTaskDetailQuery,
  useSaveKpiTaskMutation,
  useUpdateKpiTaskStatusMutation,
  useDeleteKpiTaskMutation,
} from '../../../api/services NodeJs/employeeKpiApi';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'started', label: 'Started' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const CYCLE_OPTIONS = ['month', 'quarter', 'two_quarters', 'three_quarters', 'year'];

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function EmployeeKpiTaskDrawer({ taskId, onClose }) {
  const [fetchDetail, { data, isFetching, error }] = useLazyGetKpiTaskDetailQuery();
  const [saveTask, { isLoading: saving }] = useSaveKpiTaskMutation();
  const [updateStatus, { isLoading: statusSaving }] = useUpdateKpiTaskStatusMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteKpiTaskMutation();

  const [editForm, setEditForm] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (taskId) fetchDetail({ taskId });
  }, [taskId, fetchDetail]);

  const task = data?.task;
  const subtasks = data?.subtasks || [];
  const history = data?.history || [];
  const isParent = task && !task.parent_id;

  useEffect(() => {
    if (task) {
      setEditForm({
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        cycle_type: task.cycle_type || 'month',
        assigned_date: task.assigned_date || '',
        weight: task.weight ?? 1,
        status: task.status || 'pending',
      });
    }
  }, [task]);

  const reload = () => fetchDetail({ taskId });

  const handleSave = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await saveTask({
        id: editForm.id,
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        priority: editForm.priority,
        cycle_type: editForm.cycle_type,
        assigned_date: editForm.assigned_date,
        weight: Number(editForm.weight) || 1,
      }).unwrap();
      reload();
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Failed to save task.');
    }
  };

  const handleStatusChange = async (status) => {
    setActionError('');
    try {
      await updateStatus({ taskId, status }).unwrap();
      reload();
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Failed to update status.');
    }
  };

  const handleSubtaskStatus = async (subId, status) => {
    setActionError('');
    try {
      await updateStatus({ taskId: subId, status }).unwrap();
      reload();
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Failed to update subtask.');
    }
  };

  const handleAddSubtask = async () => {
    const title = newSubtaskTitle.trim();
    if (!title || !task) return;
    setActionError('');
    try {
      await saveTask({
        parent_id: task.id,
        employee_id: task.employee_id,
        title,
      }).unwrap();
      setNewSubtaskTitle('');
      reload();
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Failed to add subtask.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task and its subtasks?')) return;
    setActionError('');
    try {
      await deleteTask({ taskId }).unwrap();
      onClose();
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Failed to delete task.');
    }
  };

  return (
    <div className="employee-kpi-drawer-overlay" onClick={onClose}>
      <div className="employee-kpi-drawer employee-kpi-task-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="employee-kpi-drawer-header">
          <div>
            <h2>{task?.title || 'Task detail'}</h2>
            <p>
              {task?.employee_name || ''}
              {task?.emp_no ? ` · ${task.emp_no}` : ''}
              {task?.due_date ? ` · Due ${task.due_date}` : ''}
            </p>
          </div>
          <button type="button" className="employee-kpi-drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="employee-kpi-drawer-body">
          {isFetching ? (
            <div className="employee-kpi-loading">Loading task…</div>
          ) : error ? (
            <div className="employee-kpi-error">
              {error?.data?.message || error?.message || 'Failed to load task.'}
            </div>
          ) : task && editForm ? (
            <>
              <div className="employee-kpi-task-timeline">
                <div><strong>Assigned:</strong> {task.assigned_date || '—'}</div>
                <div><strong>Started:</strong> {formatDateTime(task.started_at)}</div>
                <div><strong>Completed:</strong> {formatDateTime(task.completed_at)}</div>
                {task.days_to_complete != null ? (
                  <div><strong>Days to complete:</strong> {task.days_to_complete}</div>
                ) : null}
              </div>

              <label className="employee-kpi-inline-label">
                Status
                <select
                  value={editForm.status}
                  disabled={statusSaving}
                  onChange={(e) => {
                    const next = e.target.value;
                    setEditForm((f) => ({ ...f, status: next }));
                    handleStatusChange(next);
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>

              <form onSubmit={handleSave} className="employee-kpi-task-edit-form">
                <label>
                  Title
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </label>
                {isParent ? (
                  <div className="employee-kpi-form-row">
                    <label>
                      Priority
                      <select
                        value={editForm.priority}
                        onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Cycle
                      <select
                        value={editForm.cycle_type}
                        onChange={(e) => setEditForm((f) => ({ ...f, cycle_type: e.target.value }))}
                      >
                        {CYCLE_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Assigned date
                      <input
                        type="date"
                        value={editForm.assigned_date || ''}
                        onChange={(e) => setEditForm((f) => ({ ...f, assigned_date: e.target.value }))}
                      />
                    </label>
                    <label>
                      Weight
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={editForm.weight}
                        onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))}
                      />
                    </label>
                  </div>
                ) : null}
                <button type="submit" className="employee-kpi-btn employee-kpi-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </form>

              {isParent ? (
                <div className="employee-kpi-subtask-list">
                  <h3>Subtasks</h3>
                  {subtasks.length === 0 ? (
                    <p className="employee-kpi-muted">No subtasks yet.</p>
                  ) : (
                    subtasks.map((sub) => (
                      <div key={sub.id} className="employee-kpi-subtask-item">
                        <div>
                          <div className="employee-kpi-subtask-title">{sub.title}</div>
                          <div className="employee-kpi-muted">{sub.status}</div>
                        </div>
                        <select
                          value={sub.status}
                          onChange={(e) => handleSubtaskStatus(sub.id, e.target.value)}
                          disabled={statusSaving}
                        >
                          {STATUS_OPTIONS.filter((s) => s.value !== 'blocked').map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}
                  <div className="employee-kpi-subtask-add">
                    <input
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="New subtask title"
                    />
                    <button type="button" className="employee-kpi-btn employee-kpi-btn-secondary" onClick={handleAddSubtask}>
                      Add
                    </button>
                  </div>
                </div>
              ) : null}

              {history.length ? (
                <div className="employee-kpi-task-history">
                  <h3>History</h3>
                  {history.map((h) => (
                    <div key={h.id} className="employee-kpi-history-row">
                      <span>{formatDateTime(h.created_at)}</span>
                      <span>{h.from_status || '—'} → {h.to_status}</span>
                      {h.note ? <span className="employee-kpi-muted">{h.note}</span> : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {actionError ? <div className="employee-kpi-error">{actionError}</div> : null}

              {isParent ? (
                <button
                  type="button"
                  className="employee-kpi-btn employee-kpi-btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ marginTop: 16 }}
                >
                  {deleting ? 'Deleting…' : 'Delete task'}
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
