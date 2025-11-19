import React, { useState } from 'react';
import '../../styles/jdManagement.css';

const JDManagement = () => {
  const [designations, setDesignations] = useState([
    {
      id: 1,
      name: 'Ass. Manager - ICT',
      active: true,
      jobDescription: [
        { id: 1, task: 'Manage ICT infrastructure and systems', active: true },
        { id: 2, task: 'Coordinate with vendors and service providers', active: true },
        { id: 3, task: 'Ensure system security and data protection', active: true },
      ]
    },
    {
      id: 2,
      name: 'EXC. Drone Pilot',
      active: true,
      jobDescription: [
        { id: 1, task: 'Operate drones for agricultural spraying', active: true },
        { id: 2, task: 'Perform pre-flight and post-flight inspections', active: true },
        { id: 3, task: 'Maintain flight logs and documentation', active: true },
      ]
    },
    {
      id: 3,
      name: 'EXC. Finance',
      active: true,
      jobDescription: [
        { id: 1, task: 'Manage financial records and reports', active: true },
        { id: 2, task: 'Process invoices and payments', active: true },
        { id: 3, task: 'Coordinate with accounting department', active: true },
      ]
    },
  ]);

  const [selectedDesignation, setSelectedDesignation] = useState(designations[0] || null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [jobFormData, setJobFormData] = useState({ name: '', active: true });
  const [descriptionFormData, setDescriptionFormData] = useState({ task: '', active: true });
  const [editingTaskId, setEditingTaskId] = useState(null);

  const handleDesignationSelect = (designation) => {
    setSelectedDesignation(designation);
    setEditingTaskId(null);
  };

  const handleAddJob = () => {
    setJobFormData({ name: '', active: true });
    setIsEditMode(false);
    setShowJobModal(true);
  };

  const handleEditJob = () => {
    if (selectedDesignation) {
      setJobFormData({ name: selectedDesignation.name, active: selectedDesignation.active });
      setIsEditMode(true);
      setShowJobModal(true);
    }
  };

  const handleSaveJob = () => {
    if (!jobFormData.name.trim()) {
      alert('Please enter a job designation name');
      return;
    }

    if (isEditMode && selectedDesignation) {
      // Update existing job
      setDesignations(prev => 
        prev.map(job => 
          job.id === selectedDesignation.id 
            ? { ...job, name: jobFormData.name, active: jobFormData.active }
            : job
        )
      );
      setSelectedDesignation(prev => ({ ...prev, name: jobFormData.name, active: jobFormData.active }));
    } else {
      // Add new job
      const newJob = {
        id: Date.now(),
        name: jobFormData.name,
        active: jobFormData.active,
        jobDescription: []
      };
      setDesignations(prev => [...prev, newJob]);
      setSelectedDesignation(newJob);
    }
    setShowJobModal(false);
    setJobFormData({ name: '', active: true });
  };

  const handleAddDescription = () => {
    setDescriptionFormData({ task: '', active: true });
    setEditingTaskId(null);
    setShowDescriptionModal(true);
  };

  const handleEditDescription = (task) => {
    setDescriptionFormData({ task: task.task, active: task.active });
    setEditingTaskId(task.id);
    setShowDescriptionModal(true);
  };

  const handleSaveDescription = () => {
    if (!descriptionFormData.task.trim()) {
      alert('Please enter a task description');
      return;
    }

    if (!selectedDesignation) {
      alert('Please select a job designation first');
      return;
    }

    if (editingTaskId) {
      // Update existing task
      const updatedDesignations = designations.map(designation => {
        if (designation.id === selectedDesignation.id) {
          return {
            ...designation,
            jobDescription: designation.jobDescription.map(task =>
              task.id === editingTaskId
                ? { ...task, task: descriptionFormData.task, active: descriptionFormData.active }
                : task
            )
          };
        }
        return designation;
      });
      setDesignations(updatedDesignations);
      setSelectedDesignation(updatedDesignations.find(d => d.id === selectedDesignation.id));
    } else {
      // Add new task
      const newTask = {
        id: Date.now(),
        task: descriptionFormData.task,
        active: descriptionFormData.active
      };
      const updatedDesignations = designations.map(designation => {
        if (designation.id === selectedDesignation.id) {
          return {
            ...designation,
            jobDescription: [...designation.jobDescription, newTask]
          };
        }
        return designation;
      });
      setDesignations(updatedDesignations);
      setSelectedDesignation(updatedDesignations.find(d => d.id === selectedDesignation.id));
    }

    setShowDescriptionModal(false);
    setDescriptionFormData({ task: '', active: true });
    setEditingTaskId(null);
  };

  const handleToggleJobActive = (jobId) => {
    setDesignations(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, active: !job.active } : job
      )
    );
    if (selectedDesignation && selectedDesignation.id === jobId) {
      setSelectedDesignation(prev => ({ ...prev, active: !prev.active }));
    }
  };

  const handleToggleTaskActive = (taskId) => {
    const updatedDesignations = designations.map(designation => {
      if (designation.id === selectedDesignation.id) {
        return {
          ...designation,
          jobDescription: designation.jobDescription.map(task =>
            task.id === taskId ? { ...task, active: !task.active } : task
          )
        };
      }
      return designation;
    });
    setDesignations(updatedDesignations);
    setSelectedDesignation(updatedDesignations.find(d => d.id === selectedDesignation.id));
  };

  const activeDesignations = designations.filter(d => d.active);
  const activeTasks = selectedDesignation 
    ? selectedDesignation.jobDescription.filter(t => t.active)
    : [];

  return (
    <div className="jd-management-container-jd-mgmt">
      <h1 className="jd-management-title-jd-mgmt">JD Management</h1>
      
      <div className="jd-management-content-jd-mgmt">
        {/* Left Panel - Registered Designations */}
        <div className="jd-left-panel-jd-mgmt">
          <div className="jd-panel-header-jd-mgmt">
            <h2 className="jd-panel-title-jd-mgmt">Registered Designations</h2>
            <button 
              className="jd-add-button-jd-mgmt"
              onClick={handleAddJob}
              title="Add New Job"
            >
              +
            </button>
          </div>
          
          <div className="jd-designations-list-jd-mgmt">
            {designations.length === 0 ? (
              <div className="jd-empty-state-jd-mgmt">
                No designations found. Click + to add one.
              </div>
            ) : (
              designations.map(designation => (
                <div
                  key={designation.id}
                  className={`jd-designation-item-jd-mgmt ${
                    selectedDesignation?.id === designation.id ? 'active-jd-mgmt' : ''
                  } ${!designation.active ? 'inactive-jd-mgmt' : ''}`}
                  onClick={() => handleDesignationSelect(designation)}
                >
                  <div className="jd-designation-content-jd-mgmt">
                    <span className="jd-designation-name-jd-mgmt">{designation.name}</span>
                    <span className={`jd-status-badge-jd-mgmt ${designation.active ? 'active-badge-jd-mgmt' : 'inactive-badge-jd-mgmt'}`}>
                      {designation.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    className="jd-toggle-button-jd-mgmt"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleJobActive(designation.id);
                    }}
                    title={designation.active ? 'Deactivate' : 'Activate'}
                  >
                    {designation.active ? '✓' : '○'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="jd-divider-jd-mgmt"></div>

        {/* Right Panel - Job Description Details */}
        <div className="jd-right-panel-jd-mgmt">
          {selectedDesignation ? (
            <>
              <div className="jd-details-header-jd-mgmt">
                <h2 className="jd-selected-designation-jd-mgmt">{selectedDesignation.name}</h2>
                <button
                  className="jd-edit-job-button-jd-mgmt"
                  onClick={handleEditJob}
                >
                  Edit Job
                </button>
              </div>

              <div className="jd-description-section-jd-mgmt">
                <div className="jd-description-header-jd-mgmt">
                  <h3 className="jd-description-title-jd-mgmt">Job Description</h3>
                  <button
                    className="jd-add-task-button-jd-mgmt"
                    onClick={handleAddDescription}
                  >
                    + Add Task
                  </button>
                </div>

                {selectedDesignation.jobDescription.length === 0 ? (
                  <div className="jd-empty-tasks-jd-mgmt">
                    No tasks defined. Click "+ Add Task" to add job description tasks.
                  </div>
                ) : (
                  <div className="jd-tasks-list-jd-mgmt">
                    {selectedDesignation.jobDescription.map((task, index) => (
                      <div
                        key={task.id}
                        className={`jd-task-item-jd-mgmt ${!task.active ? 'inactive-task-jd-mgmt' : ''}`}
                      >
                        <div className="jd-task-content-jd-mgmt">
                          <span className="jd-task-number-jd-mgmt">{index + 1}.</span>
                          <span className="jd-task-text-jd-mgmt">{task.task}</span>
                          <span className={`jd-task-status-jd-mgmt ${task.active ? 'active-task-badge-jd-mgmt' : 'inactive-task-badge-jd-mgmt'}`}>
                            {task.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="jd-task-actions-jd-mgmt">
                          <button
                            className="jd-edit-task-button-jd-mgmt"
                            onClick={() => handleEditDescription(task)}
                            title="Edit Task"
                          >
                            ✎
                          </button>
                          <button
                            className="jd-toggle-task-button-jd-mgmt"
                            onClick={() => handleToggleTaskActive(task.id)}
                            title={task.active ? 'Deactivate' : 'Activate'}
                          >
                            {task.active ? '✓' : '○'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="jd-no-selection-jd-mgmt">
              <p>Select a designation from the left panel to view job description details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Job Modal */}
      {showJobModal && (
        <div className="jd-modal-overlay-jd-mgmt" onClick={() => setShowJobModal(false)}>
          <div className="jd-modal-content-jd-mgmt" onClick={(e) => e.stopPropagation()}>
            <div className="jd-modal-header-jd-mgmt">
              <h2>{isEditMode ? 'Edit Job Designation' : 'Add New Job Designation'}</h2>
              <button className="jd-modal-close-jd-mgmt" onClick={() => setShowJobModal(false)}>×</button>
            </div>
            <div className="jd-modal-body-jd-mgmt">
              <div className="jd-form-group-jd-mgmt">
                <label>Designation Name:</label>
                <input
                  type="text"
                  value={jobFormData.name}
                  onChange={(e) => setJobFormData({ ...jobFormData, name: e.target.value })}
                  placeholder="Enter job designation name"
                  autoFocus
                />
              </div>
              <div className="jd-form-group-jd-mgmt">
                <label className="jd-checkbox-label-jd-mgmt">
                  <input
                    type="checkbox"
                    checked={jobFormData.active}
                    onChange={(e) => setJobFormData({ ...jobFormData, active: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            <div className="jd-modal-footer-jd-mgmt">
              <button className="jd-btn-cancel-jd-mgmt" onClick={() => setShowJobModal(false)}>
                Cancel
              </button>
              <button className="jd-btn-save-jd-mgmt" onClick={handleSaveJob}>
                {isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Description Modal */}
      {showDescriptionModal && (
        <div className="jd-modal-overlay-jd-mgmt" onClick={() => setShowDescriptionModal(false)}>
          <div className="jd-modal-content-jd-mgmt" onClick={(e) => e.stopPropagation()}>
            <div className="jd-modal-header-jd-mgmt">
              <h2>{editingTaskId ? 'Edit Task' : 'Add New Task'}</h2>
              <button className="jd-modal-close-jd-mgmt" onClick={() => setShowDescriptionModal(false)}>×</button>
            </div>
            <div className="jd-modal-body-jd-mgmt">
              <div className="jd-form-group-jd-mgmt">
                <label>Task Description:</label>
                <textarea
                  value={descriptionFormData.task}
                  onChange={(e) => setDescriptionFormData({ ...descriptionFormData, task: e.target.value })}
                  placeholder="Enter task description"
                  rows="4"
                  autoFocus
                />
              </div>
              <div className="jd-form-group-jd-mgmt">
                <label className="jd-checkbox-label-jd-mgmt">
                  <input
                    type="checkbox"
                    checked={descriptionFormData.active}
                    onChange={(e) => setDescriptionFormData({ ...descriptionFormData, active: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            <div className="jd-modal-footer-jd-mgmt">
              <button className="jd-btn-cancel-jd-mgmt" onClick={() => setShowDescriptionModal(false)}>
                Cancel
              </button>
              <button className="jd-btn-save-jd-mgmt" onClick={handleSaveDescription}>
                {editingTaskId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JDManagement;

