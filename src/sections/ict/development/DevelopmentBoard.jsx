import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useCreateIctWorkItemMutation,
  useCreateIctQaBugReportMutation,
  useGetIctAssignableUsersQuery,
  useGetIctProjectsQuery,
  useGetIctQaBugReportsQuery,
  useGetIctSprintsQuery,
  useGetIctWorkItemHistoryQuery,
  useGetIctWorkItemsQuery,
  useQaApproveIctWorkItemMutation,
  useUpdateIctQaBugReportStatusMutation,
  useUpdateIctWorkItemStatusMutation,
} from '../../../api/services NodeJs/ictDevelopmentApi';
import { getUserData } from '../../../utils/authUtils';
import '../../../styles/ictDevelopment.css';

const STAGES = ['development', 'testing', 'release'];
const DEFAULT_QA_APPROVAL_NOTE = 'QA approved - no bugs found';

function toTitleCase(value) {
  if (!value) return '-';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
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
  if (primary?.user_name) {
    return primary.user_name;
  }
  if (item.assignee_name) {
    return item.assignee_name;
  }
  if ((item.assignees || []).length > 0) {
    return item.assignees.map((assignee) => assignee.user_name).join(', ');
  }
  return '-';
}

function getQaGateLabel(item) {
  if (!item?.workflow_stage) return '-';
  if (item.workflow_stage === 'testing') return 'QA Decision';
  if (item.workflow_stage === 'development') return 'Bug Reports';
  return '-';
}

function replaceLegacyUserIdsWithNames(reason, userNameById) {
  if (!reason) return reason;
  return String(reason).replace(/\buser\s+(\d+)\b/gi, (fullMatch, id) => {
    const key = String(id);
    const name = userNameById[key];
    if (!name) return fullMatch;
    return `user ${name}`;
  });
}

function isQaLikeRole(role) {
  const normalized = String(role || '').toLowerCase();
  return (
    normalized === 'mgr' ||
    normalized === 'manager' ||
    normalized === 'qa' ||
    normalized === 'tester' ||
    normalized === 'test' ||
    normalized === 'sqa' ||
    normalized === 'qae' ||
    normalized.includes('qa') ||
    normalized.includes('test')
  );
}

function isDevLikeRole(role) {
  const normalized = String(role || '').toLowerCase();
  return (
    normalized === 'mgr' ||
    normalized === 'manager' ||
    normalized === 'dev' ||
    normalized === 'developer' ||
    normalized.includes('dev')
  );
}

function isQaOnlyRole(role) {
  const normalized = String(role || '').toLowerCase();
  return normalized === 'qa' || normalized.includes('qa');
}

function isDevOnlyRole(role) {
  const normalized = String(role || '').toLowerCase();
  return normalized === 'dev' || normalized === 'developer' || normalized.includes('dev');
}

function isDevOrQaOnlyRole(role) {
  return isDevOnlyRole(role) || isQaOnlyRole(role);
}

function DevelopmentBoard() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [dueMonth, setDueMonth] = useState(getCurrentMonthValue());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [historyTaskId, setHistoryTaskId] = useState(null);
  const [qaTask, setQaTask] = useState(null);
  const [showQaApproveModal, setShowQaApproveModal] = useState(false);
  const [qaApproveNote, setQaApproveNote] = useState(DEFAULT_QA_APPROVAL_NOTE);
  const [bugAction, setBugAction] = useState(null);
  const [bugActionNote, setBugActionNote] = useState('');

  const { data: projects = [] } = useGetIctProjectsQuery();
  const { data: sprints = [] } = useGetIctSprintsQuery(projectId ? { project_id: Number(projectId) } : {});
  const { data: users = [] } = useGetIctAssignableUsersQuery();

  const workItemFilter = useMemo(() => {
    const payload = {};
    const dateRange = getMonthDateRange(dueMonth);
    if (projectId) payload.project_id = Number(projectId);
    if (sprintId) payload.sprint_id = Number(sprintId);
    if (stageFilter) payload.workflow_stage = stageFilter;
    if (dateRange.from) payload.due_date_from = dateRange.from;
    if (dateRange.to) payload.due_date_to = dateRange.to;
    return payload;
  }, [projectId, sprintId, stageFilter, dueMonth]);

  const { data: workItems = [], isLoading, refetch } = useGetIctWorkItemsQuery(workItemFilter);
  const {
    data: historyData = { current: null, history: [] },
    isFetching: loadingHistory,
  } = useGetIctWorkItemHistoryQuery(
    { id: historyTaskId },
    { skip: !historyTaskId }
  );
  const [createWorkItem, { isLoading: creating }] = useCreateIctWorkItemMutation();
  const [updateStatus] = useUpdateIctWorkItemStatusMutation();
  const [createQaBugReport, { isLoading: creatingQaReport }] = useCreateIctQaBugReportMutation();
  const [updateQaBugReportStatus] = useUpdateIctQaBugReportStatusMutation();
  const [qaApproveIctWorkItem, { isLoading: approvingQa }] = useQaApproveIctWorkItemMutation();
  const { data: qaBugReports = [], refetch: refetchQaBugReports } = useGetIctQaBugReportsQuery(
    qaTask ? { work_item_id: qaTask.id } : { work_item_id: null },
    { skip: !qaTask?.id }
  );

  const [form, setForm] = useState({
    title: '',
    description: '',
    item_type: 'task',
    priority: 'medium',
    workflow_stage: 'development',
    workflow_status: 'todo',
    due_date: '',
    assigneeIds: [],
  });
  const [qaBugForm, setQaBugForm] = useState({
    developer_user_id: '',
    bug_title: '',
    bug_description: '',
    expected_result: '',
    actual_result: '',
    severity: 'major',
    priority: 'high',
    bug_image: null,
  });

  const canCreate = projectId && sprintId && form.title;
  const currentUser = getUserData();
  const currentRole = currentUser?.job_role || '';
  const isQaUser = isQaLikeRole(currentRole);
  const isDevUser = isDevLikeRole(currentRole);
  const createTaskAssignableUsers = useMemo(
    () => users.filter((user) => isDevOrQaOnlyRole(user.job_role)),
    [users]
  );
  const createTaskAssignableIdSet = useMemo(
    () => new Set(createTaskAssignableUsers.map((user) => String(user.id))),
    [createTaskAssignableUsers]
  );
  const developerUsers = useMemo(
    () => users.filter((user) => isDevLikeRole(user.job_role)),
    [users]
  );
  const userNameById = useMemo(
    () => users.reduce((acc, user) => {
      acc[String(user.id)] = user.name;
      return acc;
    }, {}),
    [users]
  );

  const tasksByStage = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      acc[stage] = workItems.filter((item) => item.workflow_stage === stage);
      return acc;
    }, {});
  }, [workItems]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canCreate) return;

    const validAssigneeIds = form.assigneeIds.filter((id) => createTaskAssignableIdSet.has(String(id)));
    const assignees = validAssigneeIds.map((id, index) => ({
      user_id: Number(id),
      responsibility_role: isQaOnlyRole(
        createTaskAssignableUsers.find((user) => String(user.id) === String(id))?.job_role
      ) ? 'qa' : 'developer',
      is_primary: index === 0,
    }));

    await createWorkItem({
      project_id: Number(projectId),
      sprint_id: Number(sprintId),
      title: form.title,
      description: form.description || null,
      item_type: form.item_type,
      priority: form.priority,
      workflow_stage: form.workflow_stage,
      workflow_status: form.workflow_status,
      work_mode: 'sprint',
      due_date: form.due_date || null,
      assignees,
    }).unwrap();

    setForm({
      title: '',
      description: '',
      item_type: 'task',
      priority: 'medium',
      workflow_stage: 'development',
      workflow_status: 'todo',
      due_date: '',
      assigneeIds: [],
    });
    refetch();
    setShowTaskModal(false);
  };

  const handleStatusChange = async (item, nextStatus) => {
    await updateStatus({
      id: item.id,
      workflow_stage: item.workflow_stage,
      workflow_status: nextStatus,
      change_reason: 'Updated from ICT board',
    }).unwrap();
    refetch();
  };

  const handleStageChange = async (item, nextStage) => {
    await updateStatus({
      id: item.id,
      workflow_stage: nextStage,
      workflow_status: item.workflow_status,
      change_reason: 'Stage transition from ICT board',
    }).unwrap();
    refetch();
  };

  const openQaModal = (item) => {
    const defaultDeveloper = (item.assignees || []).find((assignee) => assignee.responsibility_role === 'developer');
    setQaTask(item);
    setQaBugForm({
      developer_user_id: defaultDeveloper?.user_id ? String(defaultDeveloper.user_id) : '',
      bug_title: '',
      bug_description: '',
      expected_result: '',
      actual_result: '',
      severity: 'major',
      priority: 'high',
      bug_image: null,
    });
  };

  const closeQaModal = () => {
    setQaTask(null);
    setShowQaApproveModal(false);
    setQaApproveNote(DEFAULT_QA_APPROVAL_NOTE);
  };

  const submitQaBugReport = async (e) => {
    e.preventDefault();
    if (!qaTask?.id || !qaBugForm.bug_title || !qaBugForm.bug_description) {
      return;
    }
    const formData = new FormData();
    formData.append('work_item_id', String(qaTask.id));
    if (qaBugForm.developer_user_id) {
      formData.append('developer_user_id', qaBugForm.developer_user_id);
    }
    formData.append('bug_title', qaBugForm.bug_title);
    formData.append('bug_description', qaBugForm.bug_description);
    formData.append('expected_result', qaBugForm.expected_result || '');
    formData.append('actual_result', qaBugForm.actual_result || '');
    formData.append('severity', qaBugForm.severity);
    formData.append('priority', qaBugForm.priority);
    if (qaBugForm.bug_image) {
      formData.append('bug_image', qaBugForm.bug_image);
    }

    await createQaBugReport(formData).unwrap();
    setQaBugForm({
      developer_user_id: '',
      bug_title: '',
      bug_description: '',
      expected_result: '',
      actual_result: '',
      severity: 'major',
      priority: 'high',
      bug_image: null,
    });
    refetchQaBugReports();
    refetch();
  };

  const handleQaApprove = async () => {
    if (!qaTask?.id) return;
    setQaApproveNote(DEFAULT_QA_APPROVAL_NOTE);
    setShowQaApproveModal(true);
  };

  const closeQaApproveModal = () => {
    if (approvingQa) return;
    setShowQaApproveModal(false);
    setQaApproveNote(DEFAULT_QA_APPROVAL_NOTE);
  };

  const submitQaApprove = async (e) => {
    e.preventDefault();
    if (!qaTask?.id) return;
    const note = qaApproveNote?.trim() || DEFAULT_QA_APPROVAL_NOTE;
    await qaApproveIctWorkItem({
      work_item_id: qaTask.id,
      note,
    }).unwrap();
    refetch();
    closeQaModal();
  };

  const openBugActionModal = (report, actionType) => {
    setBugAction({ report, actionType });
    if (actionType === 'fixed') {
      setBugActionNote('Bug fixed and ready for QA retest');
    } else if (actionType === 'closed') {
      setBugActionNote('Verified fix');
    } else {
      setBugActionNote('Issue still exists');
    }
  };

  const closeBugActionModal = () => {
    setBugAction(null);
    setBugActionNote('');
  };

  const submitBugAction = async (e) => {
    e.preventDefault();
    if (!bugAction?.report?.id) return;

    const reportId = bugAction.report.id;
    if (bugAction.actionType === 'fixed') {
      await updateQaBugReportStatus({
        id: reportId,
        report_status: 'fixed',
        developer_fix_note: bugActionNote || 'Bug fixed',
      }).unwrap();
    } else if (bugAction.actionType === 'closed') {
      await updateQaBugReportStatus({
        id: reportId,
        report_status: 'closed',
        qa_verify_note: bugActionNote || 'Verified',
      }).unwrap();
    } else {
      await updateQaBugReportStatus({
        id: reportId,
        report_status: 'reopened',
        qa_verify_note: bugActionNote || 'Reopened',
      }).unwrap();
    }

    refetchQaBugReports();
    refetch();
    closeBugActionModal();
  };

  const handleMarkFixed = async (report) => {
    openBugActionModal(report, 'fixed');
  };

  const handleQaClose = async (report) => {
    openBugActionModal(report, 'closed');
  };

  const handleQaReopen = async (report) => {
    openBugActionModal(report, 'reopened');
  };

  const getBugActionTitle = () => {
    if (!bugAction) return '';
    if (bugAction.actionType === 'fixed') return 'Developer Update: Mark Bug Fixed';
    if (bugAction.actionType === 'closed') return 'QA Update: Close Bug';
    return 'QA Update: Reopen Bug';
  };

  const getBugActionLabel = () => {
    if (!bugAction) return '';
    if (bugAction.actionType === 'fixed') return 'Developer Fix Note';
    if (bugAction.actionType === 'closed') return 'QA Verification Note';
    return 'QA Reopen Note';
  };

  const getBugActionButton = () => {
    if (!bugAction) return '';
    if (bugAction.actionType === 'fixed') return 'Mark Fixed';
    if (bugAction.actionType === 'closed') return 'Close Bug';
    return 'Reopen Bug';
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
          <h2 className="ict-dev-page-title">Development Board</h2>
          <p className="ict-dev-page-subtitle">Track SDLC stages, QA decisions, and task ownership in one board.</p>
        </div>
        <div className="ict-dev-page-actions" />
      </div>

      <div className="ict-dev-card ict-dev-section">
        <h3 className="ict-dev-section-title">Filters</h3>
        <div className="ict-dev-grid-4">
          <select
            className="ict-dev-select"
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setSprintId('');
            }}
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_code} - {project.project_name}
              </option>
            ))}
          </select>
          <select className="ict-dev-select" value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
            <option value="">All sprints</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.sprint_name}
              </option>
            ))}
          </select>
          <select className="ict-dev-select" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option value="">All stages</option>
            <option value="development">Development</option>
            <option value="testing">Testing</option>
            <option value="release">Release</option>
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
          <button className="ict-dev-btn" type="button" onClick={() => setShowTaskModal(true)} disabled={!projectId || !sprintId}>
            Create Task
          </button>
        </div>
      </div>

      <div className="ict-dev-card ict-dev-section">
        <h3 className="ict-dev-section-title">Stage Board</h3>
        <div className="ict-dev-board-columns">
          {STAGES.map((stage) => (
            <div className="ict-dev-board-column" key={stage}>
              <div className="ict-dev-board-column-title">
                {toTitleCase(stage)} ({tasksByStage[stage].length})
              </div>
              {tasksByStage[stage].length === 0 && <div className="ict-dev-meta">No tasks</div>}
              {tasksByStage[stage].map((item) => (
                <div className="ict-dev-task-card" key={item.id}>
                  <p className="ict-dev-task-title">{item.work_key} - {item.title}</p>
                  <div className="ict-dev-meta ict-dev-mb-md">
                    {item.sprint_name || (item.work_mode === 'extra' ? 'Extra work' : '—')} | {toTitleCase(item.workflow_status)}
                  </div>
                  <div className="ict-dev-meta">ETA: {formatDate(item.due_date)}</div>
                  <div className="ict-dev-meta">
                    Responsible: {getPrimaryResponsibleName(item)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="ict-dev-card ict-dev-section">
        <h3 className="ict-dev-section-title">Tasks</h3>
        {isLoading && <p className="ict-dev-loading-state">Loading...</p>}
        {!isLoading && workItems.length === 0 && <p className="ict-dev-empty-state">No tasks found.</p>}
        {workItems.length > 0 && (
          <div className="ict-dev-table-wrap">
            <table className="ict-dev-table">
              <thead>
              <tr>
                <th>Key</th>
                <th>Title</th>
                <th className="ict-dev-col-select">Stage</th>
                <th className="ict-dev-col-select">Status</th>
                <th>Estimated End Date</th>
                <th>Sprint</th>
                <th>Responsible</th>
                <th className="ict-dev-col-actions">Journey</th>
                <th className="ict-dev-col-actions">QA Gate</th>
              </tr>
              </thead>
              <tbody>
              {workItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.work_key}</td>
                  <td>{item.title}</td>
                  <td className="ict-dev-col-select">
                    <select className="ict-dev-select ict-dev-select-compact" value={item.workflow_stage} onChange={(e) => handleStageChange(item, e.target.value)}>
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                      <option value="release">Release</option>
                    </select>
                  </td>
                  <td className="ict-dev-col-select">
                    <select className="ict-dev-select ict-dev-select-compact" value={item.workflow_status} onChange={(e) => handleStatusChange(item, e.target.value)}>
                      <option value="todo">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Completed</option>
                      <option value="blocked">Blocked</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{formatDate(item.due_date)}</td>
                  <td>{item.sprint_name || (item.work_mode === 'extra' ? 'Extra work' : '—')}</td>
                  <td>{getPrimaryResponsibleName(item)}</td>
                  <td className="ict-dev-col-actions">
                    <button
                      className="ict-dev-btn-secondary ict-dev-btn-compact"
                      type="button"
                      onClick={() => setHistoryTaskId(item.id)}
                    >
                      View History
                    </button>
                  </td>
                  <td className="ict-dev-col-actions">
                    {(item.workflow_stage === 'testing' || item.workflow_stage === 'development') ? (
                      <button
                        className="ict-dev-btn-secondary ict-dev-btn-compact"
                        type="button"
                        onClick={() => openQaModal(item)}
                      >
                        {getQaGateLabel(item)}
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showTaskModal && (
        <div className="ict-dev-modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="ict-dev-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ict-dev-modal-header ict-dev-modal-header-clean">
              <div>
                <h3 className="ict-dev-modal-title">Create Task</h3>
                <p className="ict-dev-modal-subtitle">Add sprint or extra task with owner and ETA.</p>
              </div>
              <button className="ict-dev-modal-close" onClick={() => setShowTaskModal(false)} type="button">×</button>
            </div>
            <form onSubmit={onSubmit}>
              <div className="ict-dev-modal-body">
                <div className="ict-dev-grid-3">
                  <div>
                    <label className="ict-dev-label" htmlFor="task-title">Task Title</label>
                    <input
                      id="task-title"
                      className="ict-dev-input"
                      placeholder="Task title"
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="item-type">Type</label>
                    <select id="item-type" className="ict-dev-select" value={form.item_type} onChange={(e) => setForm((prev) => ({ ...prev, item_type: e.target.value }))}>
                      <option value="task">Task</option>
                      <option value="feature">Feature</option>
                      <option value="bug">Bug</option>
                      <option value="improvement">Improvement</option>
                      <option value="hotfix">Hotfix</option>
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="priority">Priority</label>
                    <select id="priority" className="ict-dev-select" value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="stage">Stage</label>
                    <select id="stage" className="ict-dev-select" value={form.workflow_stage} onChange={(e) => setForm((prev) => ({ ...prev, workflow_stage: e.target.value }))}>
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                      <option value="release">Release</option>
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="status">Status</label>
                    <select id="status" className="ict-dev-select" value={form.workflow_status} onChange={(e) => setForm((prev) => ({ ...prev, workflow_status: e.target.value }))}>
                      <option value="todo">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="task_due_date">Estimated End Date</label>
                    <input
                      id="task_due_date"
                      className="ict-dev-input"
                      type="date"
                      value={form.due_date}
                      onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="assignees">Responsible Persons (multi-select)</label>
                    <select
                      id="assignees"
                      className="ict-dev-select"
                      multiple
                      value={form.assigneeIds}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                        setForm((prev) => ({ ...prev, assigneeIds: selected }));
                      }}
                    >
                    {createTaskAssignableUsers.map((user) => (
                        <option key={user.id} value={String(user.id)}>
                          {user.name} ({user.job_role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <textarea
                  className="ict-dev-textarea ict-dev-mt-md"
                  rows={3}
                  placeholder="Task description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="ict-dev-modal-footer">
                <button className="ict-dev-btn" disabled={!canCreate || creating} type="submit">
                  {creating ? 'Saving...' : 'Add Task'}
                </button>
                <button className="ict-dev-btn-secondary" type="button" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyTaskId && (
        <div className="ict-dev-modal-overlay" onClick={() => setHistoryTaskId(null)}>
          <div className="ict-dev-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ict-dev-modal-header ict-dev-modal-header-clean">
              <h3 className="ict-dev-modal-title">Task Journey History</h3>
              <button className="ict-dev-modal-close" onClick={() => setHistoryTaskId(null)} type="button">×</button>
            </div>

            {loadingHistory && <p className="ict-dev-loading-state">Loading history...</p>}

            {!loadingHistory && historyData?.current && (
              <>
                <div className="ict-dev-card ict-dev-mb-md">
                  <div className="ict-dev-meta">Current Position</div>
                  <h4 className="ict-dev-mt-sm">
                    {historyData.current.work_key} - {historyData.current.title}
                  </h4>
                  <div className="ict-dev-actions">
                    <span className={`ict-dev-chip ict-dev-chip-stage-${historyData.current.workflow_stage}`}>
                      {toTitleCase(historyData.current.workflow_stage)}
                    </span>
                    <span className={`ict-dev-chip ${historyData.current.workflow_status === 'done' ? 'ict-dev-chip-status-done' : 'ict-dev-chip-status-pending'}`}>
                      {toTitleCase(historyData.current.workflow_status)}
                    </span>
                  </div>
                </div>

                <div className="ict-dev-history-list">
                  {(historyData.history || []).length === 0 && <p className="ict-dev-empty-state">No history found.</p>}
                  {(historyData.history || []).map((entry) => {
                    const fromStage = entry.from_stage ? toTitleCase(entry.from_stage) : 'Created';
                    const toStage = entry.to_stage ? toTitleCase(entry.to_stage) : '-';
                    const fromStatus = entry.from_status ? toTitleCase(entry.from_status) : 'Initial';
                    const toStatus = entry.to_status ? toTitleCase(entry.to_status) : '-';
                    return (
                      <div className="ict-dev-history-item" key={entry.id}>
                        <div className="ict-dev-history-dot" />
                        <div className="ict-dev-history-content">
                          <div className="ict-dev-history-title">
                            Stage: <strong>{fromStage}</strong> {'->'} <strong>{toStage}</strong>
                          </div>
                          <div className="ict-dev-history-meta">
                            Status: {fromStatus} {'->'} {toStatus}
                          </div>
                          <div className="ict-dev-history-meta">
                            By: {entry.changed_by_name || 'System'} | At: {formatDateTime(entry.created_at)}
                          </div>
                          {entry.change_reason && (
                            <div className="ict-dev-history-meta">
                              Reason: {replaceLegacyUserIdsWithNames(entry.change_reason, userNameById)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {qaTask && (
        <div className="ict-dev-modal-overlay" onClick={closeQaModal}>
          <div className="ict-dev-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ict-dev-modal-header ict-dev-modal-header-clean">
              <h3 className="ict-dev-modal-title">
                {qaTask.workflow_stage === 'testing' ? 'QA Decision' : 'QA Bug Reports'} - {qaTask.work_key}
              </h3>
              <button className="ict-dev-modal-close" onClick={closeQaModal} type="button">×</button>
            </div>

            <div className="ict-dev-card ict-dev-mb-md">
              <div className="ict-dev-meta">Current task</div>
              <h4 className="ict-dev-mt-sm">{qaTask.title}</h4>
              <div className="ict-dev-actions">
                <span className="ict-dev-chip ict-dev-chip-stage-testing">Testing</span>
                <span className={`ict-dev-chip ${qaTask.workflow_status === 'done' ? 'ict-dev-chip-status-done' : 'ict-dev-chip-status-pending'}`}>
                  {toTitleCase(qaTask.workflow_status)}
                </span>
              </div>
            </div>

            {isQaUser && (
              <div className="ict-dev-card ict-dev-mb-md">
                <h4 className="ict-dev-section-title">QA Approve (No Bugs)</h4>
                <p className="ict-dev-meta">Move task directly to Release when testing passed.</p>
                <button className="ict-dev-btn" type="button" onClick={handleQaApprove}>
                  Approve and Move to Release
                </button>
              </div>
            )}

            {isQaUser && (
              <form className="ict-dev-card ict-dev-mb-md" onSubmit={submitQaBugReport}>
                <h4 className="ict-dev-section-title">Send Back to Developer with QA Bug Report</h4>
                <div className="ict-dev-grid-2">
                  <div>
                    <label className="ict-dev-label" htmlFor="qa_bug_developer">Assign Developer</label>
                    <select
                      id="qa_bug_developer"
                      className="ict-dev-select"
                      value={qaBugForm.developer_user_id}
                      onChange={(e) => setQaBugForm((prev) => ({ ...prev, developer_user_id: e.target.value }))}
                    >
                      <option value="">Auto assign developer</option>
                      {developerUsers.map((user) => (
                        <option key={user.id} value={String(user.id)}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="qa_bug_title">Bug Title</label>
                    <input
                      id="qa_bug_title"
                      className="ict-dev-input"
                      value={qaBugForm.bug_title}
                      onChange={(e) => setQaBugForm((prev) => ({ ...prev, bug_title: e.target.value }))}
                      placeholder="Login timeout issue"
                    />
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="qa_bug_severity">Severity</label>
                    <select
                      id="qa_bug_severity"
                      className="ict-dev-select"
                      value={qaBugForm.severity}
                      onChange={(e) => setQaBugForm((prev) => ({ ...prev, severity: e.target.value }))}
                    >
                      <option value="critical">Critical</option>
                      <option value="major">Major</option>
                      <option value="minor">Minor</option>
                      <option value="trivial">Trivial</option>
                    </select>
                  </div>
                </div>
                <div className="ict-dev-grid-2 ict-dev-mt-sm">
                  <div>
                    <label className="ict-dev-label" htmlFor="qa_bug_priority">Priority</label>
                    <select
                      id="qa_bug_priority"
                      className="ict-dev-select"
                      value={qaBugForm.priority}
                      onChange={(e) => setQaBugForm((prev) => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="ict-dev-label" htmlFor="qa_expected_result">Expected Result</label>
                    <input
                      id="qa_expected_result"
                      className="ict-dev-input"
                      value={qaBugForm.expected_result}
                      onChange={(e) => setQaBugForm((prev) => ({ ...prev, expected_result: e.target.value }))}
                      placeholder="User stays logged in for 30 minutes"
                    />
                  </div>
                </div>
                <div className="ict-dev-mt-sm">
                  <label className="ict-dev-label" htmlFor="qa_actual_result">Actual Result</label>
                  <input
                    id="qa_actual_result"
                    className="ict-dev-input"
                    value={qaBugForm.actual_result}
                    onChange={(e) => setQaBugForm((prev) => ({ ...prev, actual_result: e.target.value }))}
                    placeholder="Session expires in 5 minutes"
                  />
                </div>
                <div className="ict-dev-mt-sm">
                  <label className="ict-dev-label" htmlFor="qa_bug_description">Proper QA Bug Report</label>
                  <textarea
                    id="qa_bug_description"
                    className="ict-dev-textarea"
                    rows={4}
                    value={qaBugForm.bug_description}
                    onChange={(e) => setQaBugForm((prev) => ({ ...prev, bug_description: e.target.value }))}
                    placeholder="Steps to reproduce, expected behavior, actual behavior, evidence."
                  />
                </div>
                <div className="ict-dev-mt-sm">
                  <label className="ict-dev-label" htmlFor="qa_bug_image">QA Evidence Image (Optional)</label>
                  <input
                    id="qa_bug_image"
                    className="ict-dev-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setQaBugForm((prev) => ({ ...prev, bug_image: file }));
                    }}
                  />
                  {qaBugForm.bug_image && (
                    <div className="ict-dev-meta ict-dev-mt-sm">
                      Selected: {qaBugForm.bug_image.name}
                    </div>
                  )}
                </div>
                <div className="ict-dev-actions ict-dev-mt-md">
                  <button
                    className="ict-dev-btn"
                    type="submit"
                    disabled={creatingQaReport || !qaBugForm.bug_title || !qaBugForm.bug_description}
                  >
                    {creatingQaReport ? 'Submitting...' : 'Submit Bug Report and Return to Development'}
                  </button>
                </div>
              </form>
            )}

            <div className="ict-dev-card">
              <h4 className="ict-dev-section-title">QA Bug Reports</h4>
              {qaBugReports.length === 0 && <p className="ict-dev-meta">No QA bug reports.</p>}
              {qaBugReports.length > 0 && (
                <div className="ict-dev-table-wrap">
                  <table className="ict-dev-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>QA</th>
                        <th>Developer</th>
                        <th>Fix Note</th>
                        <th>QA Verify Note</th>
                        <th>Evidence</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qaBugReports.map((report) => (
                        <tr key={report.id}>
                          <td>
                            <div>{report.bug_title}</div>
                            <div className="ict-dev-meta">{report.bug_description}</div>
                          </td>
                          <td>{report.severity}</td>
                          <td>{toTitleCase(report.report_status)}</td>
                          <td>{report.qa_user_name || '-'}</td>
                          <td>{report.developer_user_name || '-'}</td>
                          <td>{report.developer_fix_note || '-'}</td>
                          <td>{report.qa_verify_note || '-'}</td>
                          <td>
                            {report.qa_bug_image_url ? (
                              <a
                                href={report.qa_bug_image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="ict-dev-link"
                              >
                                View Image
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            <div className="ict-dev-actions">
                              {isDevUser && (report.report_status === 'reported' || report.report_status === 'reopened') && (
                                <button className="ict-dev-btn-secondary" type="button" onClick={() => handleMarkFixed(report)}>
                                  Mark Fixed
                                </button>
                              )}
                              {isQaUser && report.report_status === 'fixed' && (
                                <>
                                  <button className="ict-dev-btn-secondary" type="button" onClick={() => handleQaClose(report)}>
                                    Close
                                  </button>
                                  <button className="ict-dev-btn-secondary" type="button" onClick={() => handleQaReopen(report)}>
                                    Reopen
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showQaApproveModal && qaTask && (
        <div className="ict-dev-modal-overlay" onClick={closeQaApproveModal}>
          <div className="ict-dev-modal ict-dev-modal-compact" onClick={(e) => e.stopPropagation()}>
            <div className="ict-dev-modal-header-clean">
              <h3 className="ict-dev-modal-title">QA Approval Note</h3>
              <p className="ict-dev-modal-subtitle">
                Add an optional note before moving this task to Release.
              </p>
            </div>
            <form className="ict-dev-modal-body" onSubmit={submitQaApprove}>
              <label className="ict-dev-label" htmlFor="qa_approval_note">Approval Note (Optional)</label>
              <textarea
                id="qa_approval_note"
                className="ict-dev-textarea"
                rows={4}
                value={qaApproveNote}
                onChange={(e) => setQaApproveNote(e.target.value)}
                placeholder={DEFAULT_QA_APPROVAL_NOTE}
              />
              <div className="ict-dev-modal-footer">
                <button className="ict-dev-btn" type="submit" disabled={approvingQa}>
                  {approvingQa ? 'Approving...' : 'Approve and Move to Release'}
                </button>
                <button
                  className="ict-dev-btn-secondary"
                  type="button"
                  onClick={closeQaApproveModal}
                  disabled={approvingQa}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bugAction && (
        <div className="ict-dev-modal-overlay" onClick={closeBugActionModal}>
          <div className="ict-dev-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ict-dev-modal-header ict-dev-modal-header-clean">
              <h3 className="ict-dev-modal-title">{getBugActionTitle()}</h3>
              <button className="ict-dev-modal-close" onClick={closeBugActionModal} type="button">×</button>
            </div>
            <div className="ict-dev-card ict-dev-mb-md">
              <div className="ict-dev-meta">Bug Report</div>
              <div className="ict-dev-text-strong">{bugAction.report.bug_title}</div>
              <div className="ict-dev-meta">{bugAction.report.bug_description}</div>
            </div>
            <form onSubmit={submitBugAction}>
              <label className="ict-dev-label" htmlFor="bug_action_note">{getBugActionLabel()}</label>
              <textarea
                id="bug_action_note"
                className="ict-dev-textarea"
                rows={4}
                value={bugActionNote}
                onChange={(e) => setBugActionNote(e.target.value)}
                placeholder="Add detailed note"
              />
              <div className="ict-dev-actions ict-dev-mt-md">
                <button className="ict-dev-btn" type="submit">{getBugActionButton()}</button>
                <button className="ict-dev-btn-secondary" type="button" onClick={closeBugActionModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevelopmentBoard;
