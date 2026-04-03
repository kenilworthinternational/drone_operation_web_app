import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useCreateIctProjectMutation,
  useCreateIctSprintMutation,
  useGetIctAssignableUsersQuery,
  useGetIctProjectsQuery,
  useGetIctSprintsQuery,
  useUpdateIctProjectMutation,
} from '../../../api/services NodeJs/ictDevelopmentApi';
import '../../../styles/ictDevelopment.css';

function toDateInputValue(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
  const formatted = toDateInputValue(value);
  return formatted || '-';
}

function SprintPlanning() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { data: projects = [], isLoading: loadingProjects } = useGetIctProjectsQuery();
  const { data: users = [] } = useGetIctAssignableUsersQuery();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const { data: sprints = [], isLoading: loadingSprints, refetch } = useGetIctSprintsQuery(
    selectedProjectId ? { project_id: Number(selectedProjectId) } : {},
  );
  const [createProject, { isLoading: creatingProject }] = useCreateIctProjectMutation();
  const [updateProject, { isLoading: updatingProject }] = useUpdateIctProjectMutation();
  const [createSprint, { isLoading: creatingSprint }] = useCreateIctSprintMutation();

  const [projectForm, setProjectForm] = useState({
    project_code: '',
    project_name: '',
    description: '',
    owner_user_id: '',
    start_date: '',
    target_end_date: '',
    status: 'active',
  });
  const [form, setForm] = useState({
    sprint_name: '',
    sprint_goal: '',
    start_date: '',
    end_date: '',
    planned_working_days: 10,
    capacity_points: '',
  });

  const canCreateProject = useMemo(() => {
    return projectForm.project_code && projectForm.project_name;
  }, [projectForm.project_code, projectForm.project_name]);

  const canCreate = useMemo(() => {
    return selectedProjectId && form.sprint_name && form.start_date && form.end_date;
  }, [selectedProjectId, form.sprint_name, form.start_date, form.end_date]);

  const resetProjectForm = () => {
    setProjectForm({
      project_code: '',
      project_name: '',
      description: '',
      owner_user_id: '',
      start_date: '',
      target_end_date: '',
      status: 'active',
    });
    setEditingProjectId(null);
  };

  const openCreateProjectModal = () => {
    resetProjectForm();
    setShowProjectModal(true);
  };

  const closeProjectModal = () => {
    resetProjectForm();
    setShowProjectModal(false);
  };

  const openCreateSprintModal = () => {
    setShowSprintModal(true);
  };

  const closeSprintModal = () => {
    setShowSprintModal(false);
  };

  const handleCreateOrUpdateProject = async (e) => {
    e.preventDefault();
    if (!canCreateProject) return;

    const payload = {
      project_code: projectForm.project_code,
      project_name: projectForm.project_name,
      description: projectForm.description || null,
      owner_user_id: projectForm.owner_user_id ? Number(projectForm.owner_user_id) : null,
      start_date: projectForm.start_date || null,
      target_end_date: projectForm.target_end_date || null,
      status: projectForm.status,
    };

    if (editingProjectId) {
      await updateProject({ id: editingProjectId, ...payload }).unwrap();
    } else {
      await createProject(payload).unwrap();
    }

    resetProjectForm();
    setShowProjectModal(false);
  };

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);
    setProjectForm({
      project_code: project.project_code || '',
      project_name: project.project_name || '',
      description: project.description || '',
      owner_user_id: project.owner_user_id ? String(project.owner_user_id) : '',
      start_date: toDateInputValue(project.start_date),
      target_end_date: toDateInputValue(project.target_end_date),
      status: project.status || 'active',
    });
    setShowProjectModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canCreate) return;

    await createSprint({
      project_id: Number(selectedProjectId),
      sprint_name: form.sprint_name,
      sprint_goal: form.sprint_goal || null,
      start_date: form.start_date,
      end_date: form.end_date,
      planned_working_days: Number(form.planned_working_days || 10),
      capacity_points: form.capacity_points ? Number(form.capacity_points) : null,
    }).unwrap();

    setForm({
      sprint_name: '',
      sprint_goal: '',
      start_date: '',
      end_date: '',
      planned_working_days: 10,
      capacity_points: '',
    });
    refetch();
    closeSprintModal();
  };

  return (
    <div className="ict-dev-page ict-dev-stack">
      <div className="ict-dev-page-header ict-dev-page-header-balanced">
        <div className="ict-dev-page-actions">
          <button className="ict-dev-btn-secondary" type="button" onClick={() => navigate({ pathname: '/home/ict/development/dev-center', search: routerLocation.search })}>
            Back to Dev Center
          </button>
        </div>
        <div className="ict-dev-page-center">
          <h2 className="ict-dev-page-title">Sprint Planning</h2>
          <p className="ict-dev-page-subtitle">Plan projects and sprints with clear ownership and timeline visibility.</p>
        </div>
        <div className="ict-dev-page-actions">
          <button className="ict-dev-btn" type="button" onClick={openCreateProjectModal}>Create Project</button>
        </div>
      </div>

      <div className="ict-dev-card ict-dev-section">
        <h3 className="ict-dev-section-title">Project List</h3>
        {loadingProjects && <p className="ict-dev-loading-state">Loading projects...</p>}
        {!loadingProjects && projects.length === 0 && <p className="ict-dev-empty-state">No projects found.</p>}
        {!loadingProjects && projects.length > 0 && (
          <div className="ict-dev-table-wrap">
            <table className="ict-dev-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.project_code}</td>
                    <td>{project.project_name}</td>
                    <td>{project.owner_name || '-'}</td>
                    <td>
                      <span className={`ict-dev-chip ${project.status === 'completed' ? 'ict-dev-chip-status-done' : 'ict-dev-chip-status-pending'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <button className="ict-dev-btn-secondary" type="button" onClick={() => handleEditProject(project)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ict-dev-card">
        <label className="ict-dev-label" htmlFor="project-select">Project</label>
        <div className="ict-dev-picker-row">
          <select
            id="project-select"
            className="ict-dev-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_code} - {project.project_name}
              </option>
            ))}
          </select>
          <button
            className="ict-dev-btn ict-dev-btn-success"
            type="button"
            onClick={openCreateSprintModal}
            disabled={!selectedProjectId}
          >
            Create Sprint
          </button>
        </div>
      </div>

      <div className="ict-dev-card ict-dev-section">
        <h3 className="ict-dev-section-title">Sprints</h3>
        {(loadingProjects || loadingSprints) && <p className="ict-dev-loading-state">Loading...</p>}
        {!loadingProjects && !loadingSprints && sprints.length === 0 && <p className="ict-dev-empty-state">No sprints found.</p>}
        {sprints.length > 0 && (
          <div className="ict-dev-table-wrap">
            <table className="ict-dev-table">
              <thead>
              <tr>
                <th>Sprint</th>
                <th>Goal</th>
                <th>Start</th>
                <th>End</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
              </thead>
              <tbody>
              {sprints.map((sprint) => (
                <tr key={sprint.id}>
                  <td>{sprint.sprint_name}</td>
                  <td>{sprint.sprint_goal || '-'}</td>
                  <td>{formatDisplayDate(sprint.start_date)}</td>
                  <td>{formatDisplayDate(sprint.end_date)}</td>
                  <td>{sprint.planned_working_days}</td>
                  <td>
                    <span className={`ict-dev-chip ${sprint.status === 'closed' ? 'ict-dev-chip-status-done' : 'ict-dev-chip-status-pending'}`}>
                      {sprint.status}
                    </span>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showProjectModal && (
        <div className="ict-dev-modal-overlay" onClick={closeProjectModal}>
          <div className="ict-dev-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ict-dev-modal-header ict-dev-modal-header-clean">
              <div>
                <h3 className="ict-dev-modal-title">{editingProjectId ? 'Edit Project' : 'Create Project'}</h3>
                <p className="ict-dev-modal-subtitle">Manage project details, ownership, and timeline.</p>
              </div>
              <button className="ict-dev-modal-close" onClick={closeProjectModal} type="button">×</button>
            </div>
            <form onSubmit={handleCreateOrUpdateProject}>
              <div className="ict-dev-modal-body">
                <div className="ict-dev-grid-3">
                  <div>
                    <label className="ict-dev-label" htmlFor="project_code">Project Code</label>
                    <input
                      id="project_code"
                      className="ict-dev-input"
                      placeholder="ICT-WEB"
                      value={projectForm.project_code}
                      onChange={(e) => setProjectForm((prev) => ({ ...prev, project_code: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="project_name">Project Name</label>
                    <input
                      id="project_name"
                      className="ict-dev-input"
                      placeholder="ICT Web Platform"
                      value={projectForm.project_name}
                      onChange={(e) => setProjectForm((prev) => ({ ...prev, project_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="project_status">Status</label>
                    <select
                      id="project_status"
                      className="ict-dev-select"
                      value={projectForm.status}
                      onChange={(e) => setProjectForm((prev) => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="project_owner">Project Owner</label>
                    <select
                      id="project_owner"
                      className="ict-dev-select"
                      value={projectForm.owner_user_id}
                      onChange={(e) => setProjectForm((prev) => ({ ...prev, owner_user_id: e.target.value }))}
                    >
                      <option value="">No owner</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.job_role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="project_start_date">Start Date</label>
                    <input
                      id="project_start_date"
                      className="ict-dev-input"
                      type="date"
                      value={projectForm.start_date}
                      onChange={(e) => setProjectForm((prev) => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="project_end_date">Target End Date</label>
                    <input
                      id="project_end_date"
                      className="ict-dev-input"
                      type="date"
                      value={projectForm.target_end_date}
                      onChange={(e) => setProjectForm((prev) => ({ ...prev, target_end_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="ict-dev-mt-md">
                  <label className="ict-dev-label" htmlFor="project_desc">Description</label>
                  <textarea
                    id="project_desc"
                    className="ict-dev-textarea"
                    rows={3}
                    placeholder="Project description"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="ict-dev-modal-footer">
                <button
                  className="ict-dev-btn"
                  disabled={!canCreateProject || creatingProject || updatingProject}
                  type="submit"
                >
                  {editingProjectId
                    ? (updatingProject ? 'Updating...' : 'Update Project')
                    : (creatingProject ? 'Creating...' : 'Create Project')}
                </button>
                <button className="ict-dev-btn-secondary" type="button" onClick={closeProjectModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSprintModal && (
        <div className="ict-dev-modal-overlay" onClick={closeSprintModal}>
          <div className="ict-dev-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ict-dev-modal-header ict-dev-modal-header-clean">
              <div>
                <h3 className="ict-dev-modal-title">Create Sprint</h3>
                <p className="ict-dev-modal-subtitle">Set sprint timeline, goal, and delivery capacity.</p>
              </div>
              <button className="ict-dev-modal-close" onClick={closeSprintModal} type="button">×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="ict-dev-modal-body">
                <div className="ict-dev-grid-2">
                  <div>
                    <label className="ict-dev-label" htmlFor="sprint_name">Sprint Name</label>
                    <input
                      id="sprint_name"
                      className="ict-dev-input"
                      placeholder="Sprint 01"
                      value={form.sprint_name}
                      onChange={(e) => setForm((prev) => ({ ...prev, sprint_name: e.target.value }))}
                    />
                  </div>
                  <div>
                  <label className="ict-dev-label" htmlFor="capacity_points">
                    Capacity Points
                    <span
                      className="ict-dev-help-tooltip"
                      tabIndex={0}
                      aria-label="Capacity points calculation help"
                    >
                      ?
                      <span className="ict-dev-help-tooltip-content">
                        Capacity Points = (Team members x working days x focus factor x points/day per person).
                        Example: 3 members x 10 days x 0.7 focus x 3 points/day = 63 points.
                      </span>
                    </span>
                  </label>
                    <input
                      id="capacity_points"
                      className="ict-dev-input"
                      placeholder="60"
                      type="number"
                      value={form.capacity_points}
                      onChange={(e) => setForm((prev) => ({ ...prev, capacity_points: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="start_date">Start Date</label>
                    <input
                      id="start_date"
                      className="ict-dev-input"
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="end_date">End Date</label>
                    <input
                      id="end_date"
                      className="ict-dev-input"
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="working_days">Planned Working Days</label>
                    <input
                      id="working_days"
                      className="ict-dev-input"
                      type="number"
                      min="1"
                      value={form.planned_working_days}
                      onChange={(e) => setForm((prev) => ({ ...prev, planned_working_days: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="sprint_goal">Sprint Goal</label>
                    <input
                      id="sprint_goal"
                      className="ict-dev-input"
                      placeholder="High-level sprint objective"
                      value={form.sprint_goal}
                      onChange={(e) => setForm((prev) => ({ ...prev, sprint_goal: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="ict-dev-modal-footer">
                <button className="ict-dev-btn" disabled={!canCreate || creatingSprint} type="submit">
                  {creatingSprint ? 'Creating...' : 'Create Sprint'}
                </button>
                <button className="ict-dev-btn-secondary" type="button" onClick={closeSprintModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SprintPlanning;
