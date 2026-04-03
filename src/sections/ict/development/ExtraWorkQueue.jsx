import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useCreateIctWorkItemMutation,
  useGetIctAssignableUsersQuery,
  useGetIctProjectsQuery,
  useGetIctWorkItemsQuery,
  useUpdateIctWorkItemStatusMutation,
} from '../../../api/services NodeJs/ictDevelopmentApi';
import { getUserData } from '../../../utils/authUtils';
import '../../../styles/ictDevelopment.css';

function toTitleCase(value) {
  if (!value) return '-';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentMonthValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getMonthDateRange(monthValue) {
  if (!/^\d{4}-\d{2}$/.test(String(monthValue || ''))) {
    return { from: '', to: '' };
  }
  const [yearRaw, monthRaw] = String(monthValue).split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!year || !month) {
    return { from: '', to: '' };
  }
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${yearRaw}-${monthRaw}-01`,
    to: `${yearRaw}-${monthRaw}-${String(lastDay).padStart(2, '0')}`,
  };
}

function getPrimaryResponsibleName(item) {
  const primary = (item.assignees || []).find((assignee) => Number(assignee.is_primary) === 1);
  if (primary?.user_name) return primary.user_name;
  if ((item.assignees || []).length > 0) return item.assignees.map((assignee) => assignee.user_name).join(', ');
  return '-';
}

function isDeveloperRole(role) {
  const normalized = String(role || '').toLowerCase();
  return normalized === 'dev' || normalized === 'developer' || normalized.includes('dev');
}

function isQaRole(role) {
  const normalized = String(role || '').toLowerCase();
  return normalized === 'qa' || normalized.includes('qa');
}

function isDevOrQaRole(role) {
  return isDeveloperRole(role) || isQaRole(role);
}

function ExtraWorkQueue() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('');
  const [dueMonth, setDueMonth] = useState(getCurrentMonthValue());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    project_id: '',
    title: '',
    description: '',
    item_type: 'task',
    priority: 'high',
    workflow_stage: 'development',
    workflow_status: 'todo',
    due_date: '',
    assigneeIds: [],
  });

  const currentUser = getUserData();
  const isDevOrQaUser = isDevOrQaRole(currentUser?.job_role);

  const { data: projects = [] } = useGetIctProjectsQuery(undefined, { skip: !isDevOrQaUser });
  const { data: users = [] } = useGetIctAssignableUsersQuery(undefined, { skip: !isDevOrQaUser });
  const devQaUsers = useMemo(
    () => users.filter((user) => isDevOrQaRole(user.job_role)),
    [users]
  );
  const devQaUserIdSet = useMemo(
    () => new Set(devQaUsers.map((user) => String(user.id))),
    [devQaUsers]
  );
  const userRoleById = useMemo(
    () => devQaUsers.reduce((acc, user) => {
      acc[String(user.id)] = user.job_role;
      return acc;
    }, {}),
    [devQaUsers]
  );
  const payload = useMemo(() => {
    const query = { work_mode: 'extra' };
    const dateRange = getMonthDateRange(dueMonth);
    if (projectId) query.project_id = Number(projectId);
    if (status) query.workflow_status = status;
    if (dateRange.from) query.due_date_from = dateRange.from;
    if (dateRange.to) query.due_date_to = dateRange.to;
    return query;
  }, [projectId, status, dueMonth]);

  const { data: items = [], isLoading, refetch } = useGetIctWorkItemsQuery(payload, { skip: !isDevOrQaUser });
  const [createWorkItem, { isLoading: creating }] = useCreateIctWorkItemMutation();
  const [updateStatus] = useUpdateIctWorkItemStatusMutation();

  const hasValidAssignee = form.assigneeIds.some((id) => devQaUserIdSet.has(String(id)));
  const canCreate = Boolean(form.project_id && form.title && hasValidAssignee);

  const openCreateModal = () => {
    setForm({
      project_id: projectId || '',
      title: '',
      description: '',
      item_type: 'task',
      priority: 'high',
      workflow_stage: 'development',
      workflow_status: 'todo',
      due_date: '',
      assigneeIds: [],
    });
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateExtraWork = async (e) => {
    e.preventDefault();
    if (!canCreate) return;

    const validAssigneeIds = form.assigneeIds.filter((id) => devQaUserIdSet.has(String(id)));
    const assignees = validAssigneeIds.map((id, index) => ({
      user_id: Number(id),
      responsibility_role: isQaRole(userRoleById[String(id)]) ? 'qa' : 'developer',
      is_primary: index === 0,
    }));

    await createWorkItem({
      project_id: Number(form.project_id),
      sprint_id: null,
      title: form.title,
      description: form.description || null,
      item_type: form.item_type,
      priority: form.priority,
      workflow_stage: form.workflow_stage,
      workflow_status: form.workflow_status,
      due_date: form.due_date || null,
      work_mode: 'extra',
      assignees,
    }).unwrap();

    closeCreateModal();
    refetch();
  };

  const handleStatusChange = async (item, nextStatus) => {
    await updateStatus({
      id: item.id,
      workflow_stage: item.workflow_stage,
      workflow_status: nextStatus,
      change_reason: 'Updated from Extra Task queue',
    }).unwrap();
    refetch();
  };

  const handleStageChange = async (item, nextStage) => {
    await updateStatus({
      id: item.id,
      workflow_stage: nextStage,
      workflow_status: item.workflow_status,
      change_reason: 'Stage transition from Extra Task queue',
    }).unwrap();
    refetch();
  };

  if (!isDevOrQaUser) {
    return (
      <div className="ict-dev-page ict-dev-stack">
        <div className="ict-dev-card">
          <h3 className="ict-dev-section-title">Access Restricted</h3>
          <p className="ict-dev-meta">This page is available only for developer and QA users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ict-dev-page ict-dev-stack">
      <div className="ict-dev-page-header ict-dev-page-header-balanced">
        <div className="ict-dev-page-actions">
          <button className="ict-dev-btn-secondary" type="button" onClick={() => navigate({ pathname: '/home/ict/development/dev-center', search: routerLocation.search })}>
            Back to Dev Center
          </button>
        </div>
        <div className="ict-dev-page-center">
          <h2 className="ict-dev-page-title">Extra Task Queue</h2>
          <p className="ict-dev-page-subtitle">Manage urgent non-sprint work with clear ownership and delivery dates.</p>
        </div>
        <div className="ict-dev-page-actions" />
      </div>

      <div className="ict-dev-card ict-dev-section">
        <h3 className="ict-dev-section-title">Filters</h3>
        <div className="ict-dev-grid-3 ict-dev-grid-keep-row">
          <select className="ict-dev-select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_code} - {project.project_name}
              </option>
            ))}
          </select>
          <select className="ict-dev-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="todo">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Completed</option>
            <option value="blocked">Blocked</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            className="ict-dev-input"
            type="month"
            value={dueMonth}
            onChange={(e) => setDueMonth(e.target.value)}
            aria-label="Estimated end date range month"
            title="Estimated end date range month"
          />
        </div>
        <div className="ict-dev-actions ict-dev-mt-md">
          <button className="ict-dev-btn" type="button" onClick={openCreateModal}>
            Create Extra Task
          </button> 
        </div>
      </div>

      <div className="ict-dev-card ict-dev-section">
        <h3 className="ict-dev-section-title">Extra Task Items</h3>
        {isLoading && <p className="ict-dev-loading-state">Loading...</p>}
        {!isLoading && items.length === 0 && <p className="ict-dev-empty-state">No Extra Task items.</p>}
        {items.length > 0 && (
          <div className="ict-dev-table-wrap">
            <table className="ict-dev-table">
              <thead>
              <tr>
                <th>Key</th>
                <th>Title</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Estimated End Date</th>
                <th>Responsible</th>
              </tr>
              </thead>
              <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.work_key}</td>
                  <td>{item.title}</td>
                  <td>
                    <select
                      className="ict-dev-select ict-dev-select-compact"
                      value={item.workflow_stage}
                      onChange={(e) => handleStageChange(item, e.target.value)}
                    >
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                      <option value="release">Release</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="ict-dev-select ict-dev-select-compact"
                      value={item.workflow_status}
                      onChange={(e) => handleStatusChange(item, e.target.value)}
                    >
                      <option value="todo">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Completed</option>
                      <option value="blocked">Blocked</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{formatDate(item.due_date)}</td>
                  <td>{getPrimaryResponsibleName(item)}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="ict-dev-modal-overlay" onClick={closeCreateModal}>
          <div className="ict-dev-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ict-dev-modal-header ict-dev-modal-header-clean">
              <div>
                <h3 className="ict-dev-modal-title">Create Extra Task</h3>
                <p className="ict-dev-modal-subtitle">Capture urgent non-sprint work with clear ownership.</p>
              </div>
              <button className="ict-dev-modal-close" onClick={closeCreateModal} type="button">×</button>
            </div>
            <form onSubmit={handleCreateExtraWork}>
              <div className="ict-dev-modal-body">
                <div className="ict-dev-grid-3">
                  <div>
                    <label className="ict-dev-label" htmlFor="extra_project">Project</label>
                    <select
                      id="extra_project"
                      className="ict-dev-select"
                      value={form.project_id}
                      onChange={(e) => setForm((prev) => ({ ...prev, project_id: e.target.value }))}
                    >
                      <option value="">Select project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={String(project.id)}>
                          {project.project_code} - {project.project_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="extra_type">Type</label>
                    <select
                      id="extra_type"
                      className="ict-dev-select"
                      value={form.item_type}
                      onChange={(e) => setForm((prev) => ({ ...prev, item_type: e.target.value }))}
                    >
                      <option value="task">Task</option>
                      <option value="bug">Bug</option>
                      <option value="feature">Feature</option>
                      <option value="improvement">Improvement</option>
                      <option value="hotfix">Hotfix</option>
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="extra_priority">Priority</label>
                    <select
                      id="extra_priority"
                      className="ict-dev-select"
                      value={form.priority}
                      onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="extra_stage">Stage</label>
                    <select
                      id="extra_stage"
                      className="ict-dev-select"
                      value={form.workflow_stage}
                      onChange={(e) => setForm((prev) => ({ ...prev, workflow_stage: e.target.value }))}
                    >
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                      <option value="release">Release</option>
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="extra_status">Status</label>
                    <select
                      id="extra_status"
                      className="ict-dev-select"
                      value={form.workflow_status}
                      onChange={(e) => setForm((prev) => ({ ...prev, workflow_status: e.target.value }))}
                    >
                      <option value="todo">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Completed</option>
                      <option value="blocked">Blocked</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="extra_due_date">Estimated End Date</label>
                    <input
                      id="extra_due_date"
                      className="ict-dev-input"
                      type="date"
                      value={form.due_date}
                      onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="extra_assignees">Responsible Persons</label>
                    <select
                      id="extra_assignees"
                      className="ict-dev-select"
                      multiple
                      value={form.assigneeIds}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                        setForm((prev) => ({ ...prev, assigneeIds: selected }));
                      }}
                    >
                      {devQaUsers.map((user) => (
                        <option key={user.id} value={String(user.id)}>
                          {user.name} ({toTitleCase(user.job_role)})
                        </option>
                      ))}
                    </select>
                    {devQaUsers.length === 0 && (
                      <div className="ict-dev-meta ict-dev-mt-sm">No active developer or QA users found.</div>
                    )}
                  </div>
                </div>
                <div className="ict-dev-mt-md">
                  <label className="ict-dev-label" htmlFor="extra_title">Title</label>
                  <input
                    id="extra_title"
                    className="ict-dev-input"
                    placeholder="Production issue fix for payroll module"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="ict-dev-mt-sm">
                  <label className="ict-dev-label" htmlFor="extra_desc">Description</label>
                  <textarea
                    id="extra_desc"
                    className="ict-dev-textarea"
                    rows={3}
                    placeholder="Include scope, impact, and expected fix timeline."
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="ict-dev-modal-footer">
                <button className="ict-dev-btn" type="submit" disabled={!canCreate || creating}>
                  {creating ? 'Creating...' : 'Create Extra Task'}
                </button>
                <button className="ict-dev-btn-secondary" type="button" onClick={closeCreateModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExtraWorkQueue;
