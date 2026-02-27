import React, { useState, useMemo } from 'react';
import {
  useGetAppVersionsQuery,
  useCreateAppVersionMutation,
  useUpdateAppVersionMutation,
  useDeleteAppVersionMutation,
} from '../../../api/services NodeJs/appVersionsApi';
import './appVersionManagement.css';

const PLATFORM_OPTIONS = [
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
  { value: 'both', label: 'Both' },
];

const emptyForm = {
  app_id: '',
  app_name: '',
  platform: 'android',
  min_version: '',
  latest_version: '',
  store_url: '',
  force_update: 1,
  update_message: '',
  is_active: 1,
  maintenance: 0,
  maintenance_message: '',
};

export default function AppVersionManagement() {
  const { data: versions = [], isLoading, refetch } = useGetAppVersionsQuery();
  const [createAppVersion, { isLoading: creating }] = useCreateAppVersionMutation();
  const [updateAppVersion, { isLoading: updating }] = useUpdateAppVersionMutation();
  const [deleteAppVersion, { isLoading: deleting }] = useDeleteAppVersionMutation();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return versions;
    const q = search.toLowerCase();
    return versions.filter(
      (v) =>
        v.app_name?.toLowerCase().includes(q) ||
        v.app_id?.toLowerCase().includes(q) ||
        v.min_version?.toLowerCase().includes(q) ||
        v.latest_version?.toLowerCase().includes(q)
    );
  }, [versions, search]);

  const flash = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      app_id: row.app_id || '',
      app_name: row.app_name || '',
      platform: row.platform || 'android',
      min_version: row.min_version || '',
      latest_version: row.latest_version || '',
      store_url: row.store_url || '',
      force_update: row.force_update ?? 1,
      update_message: row.update_message || '',
      is_active: row.is_active ?? 1,
      maintenance: row.maintenance ?? 0,
      maintenance_message: row.maintenance_message || '',
    });
    setShowModal(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAppVersion({ id: editingId, ...form }).unwrap();
        flash('App version updated successfully.');
      } else {
        await createAppVersion(form).unwrap();
        flash('App version created successfully.');
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      flash(err?.data?.message || 'Operation failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppVersion(id).unwrap();
      flash('App version deleted successfully.');
      setShowDeleteConfirm(null);
      refetch();
    } catch (err) {
      flash(err?.data?.message || 'Delete failed.', 'error');
    }
  };

  const getPlatformBadge = (platform) => {
    const map = { android: 'badge-android', ios: 'badge-ios', both: 'badge-both' };
    return <span className={`avm-badge ${map[platform] || 'badge-both'}`}>{platform}</span>;
  };

  return (
    <div className="avm-container">
      {/* Header */}
      <div className="avm-header">
        <div className="avm-header-left">
          <h1 className="avm-title">App Version Management</h1>
          <p className="avm-subtitle">Manage minimum required versions for all Kenilworth apps</p>
        </div>
        <button className="avm-btn avm-btn-primary" onClick={openCreate}>
          + Add New App
        </button>
      </div>

      {/* Flash Messages */}
      {successMsg && <div className="avm-flash avm-flash-success">{successMsg}</div>}
      {errorMsg && <div className="avm-flash avm-flash-error">{errorMsg}</div>}

      {/* Search */}
      <div className="avm-search-bar">
        <input
          type="text"
          placeholder="Search by app name, ID, or version..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="avm-search-input"
        />
        <span className="avm-search-count">{filtered.length} app{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="avm-loading">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="avm-empty">
          <p>No app versions found.</p>
        </div>
      ) : (
        <div className="avm-table-wrap">
          <table className="avm-table">
            <thead>
              <tr>
                <th>App Name</th>
                <th>App ID</th>
                <th>Platform</th>
                <th>Min Version</th>
                <th>Latest Version</th>
                <th>Force Update</th>
                <th>Maintenance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="avm-cell-name">{row.app_name}</td>
                  <td className="avm-cell-id">{row.app_id}</td>
                  <td>{getPlatformBadge(row.platform)}</td>
                  <td><span className="avm-version">{row.min_version}</span></td>
                  <td><span className="avm-version">{row.latest_version}</span></td>
                  <td>
                    <span className={`avm-badge ${row.force_update ? 'badge-force' : 'badge-soft'}`}>
                      {row.force_update ? 'Force' : 'Soft'}
                    </span>
                  </td>
                  <td>
                    <span className={`avm-badge ${row.maintenance ? 'badge-maintenance' : 'badge-normal'}`}>
                      {row.maintenance ? '🔧 On' : 'Off'}
                    </span>
                  </td>
                  <td>
                    <span className={`avm-badge ${row.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {row.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="avm-actions">
                      <button className="avm-btn avm-btn-edit" onClick={() => openEdit(row)} title="Edit">
                        ✏️
                      </button>
                      <button
                        className="avm-btn avm-btn-delete"
                        onClick={() => setShowDeleteConfirm(row)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Store URL preview */}
      {filtered.length > 0 && (
        <div className="avm-info-note">
          <strong>Tip:</strong> When you increase <em>min_version</em> above a user's installed version, the mobile app will
          freeze on the splash screen and prompt them to update via the Play Store / App Store link.
        </div>
      )}

      {/* ─── Create / Edit Modal ─── */}
      {showModal && (
        <div className="avm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="avm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="avm-modal-header">
              <h2>{editingId ? 'Edit App Version' : 'Add New App'}</h2>
              <button className="avm-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="avm-form">
              <div className="avm-form-grid">
                <div className="avm-field">
                  <label>App Name *</label>
                  <input
                    type="text"
                    value={form.app_name}
                    onChange={(e) => handleChange('app_name', e.target.value)}
                    placeholder="e.g. DSMS Plantation"
                    required
                  />
                </div>
                <div className="avm-field">
                  <label>App ID (Package Name) *</label>
                  <input
                    type="text"
                    value={form.app_id}
                    onChange={(e) => handleChange('app_id', e.target.value)}
                    placeholder="e.g. com.kenilworthinternational.dsms_plantation"
                    required
                  />
                </div>
                <div className="avm-field">
                  <label>Platform</label>
                  <select value={form.platform} onChange={(e) => handleChange('platform', e.target.value)}>
                    {PLATFORM_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="avm-field">
                  <label>Min Version *</label>
                  <input
                    type="text"
                    value={form.min_version}
                    onChange={(e) => handleChange('min_version', e.target.value)}
                    placeholder="e.g. 1.3.5"
                    required
                  />
                </div>
                <div className="avm-field">
                  <label>Latest Version *</label>
                  <input
                    type="text"
                    value={form.latest_version}
                    onChange={(e) => handleChange('latest_version', e.target.value)}
                    placeholder="e.g. 1.3.5"
                    required
                  />
                </div>
                <div className="avm-field">
                  <label>Store URL</label>
                  <input
                    type="url"
                    value={form.store_url}
                    onChange={(e) => handleChange('store_url', e.target.value)}
                    placeholder="https://play.google.com/store/apps/details?id=..."
                  />
                </div>
                <div className="avm-field avm-field-full">
                  <label>Update Message</label>
                  <textarea
                    value={form.update_message}
                    onChange={(e) => handleChange('update_message', e.target.value)}
                    placeholder="Custom message shown to users when an update is required..."
                    rows={3}
                  />
                </div>
                <div className="avm-field avm-field-toggle">
                  <label>Force Update</label>
                  <label className="avm-toggle">
                    <input
                      type="checkbox"
                      checked={!!form.force_update}
                      onChange={(e) => handleChange('force_update', e.target.checked ? 1 : 0)}
                    />
                    <span className="avm-toggle-slider" />
                    <span className="avm-toggle-label">{form.force_update ? 'Yes — block app' : 'No — soft prompt'}</span>
                  </label>
                </div>
                <div className="avm-field avm-field-toggle">
                  <label>Active</label>
                  <label className="avm-toggle">
                    <input
                      type="checkbox"
                      checked={!!form.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked ? 1 : 0)}
                    />
                    <span className="avm-toggle-slider" />
                    <span className="avm-toggle-label">{form.is_active ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>

                {/* ── Maintenance Section ── */}
                <div className="avm-field-full avm-section-divider">
                  <span className="avm-section-label">🔧 Maintenance Mode</span>
                </div>
                <div className="avm-field avm-field-toggle">
                  <label>Maintenance</label>
                  <label className="avm-toggle">
                    <input
                      type="checkbox"
                      checked={!!form.maintenance}
                      onChange={(e) => handleChange('maintenance', e.target.checked ? 1 : 0)}
                    />
                    <span className="avm-toggle-slider avm-toggle-slider-orange" />
                    <span className="avm-toggle-label">
                      {form.maintenance ? '🔧 ON — app blocked for all users' : 'OFF — normal operation'}
                    </span>
                  </label>
                </div>
                <div className="avm-field">
                  <label>Maintenance Message</label>
                  <textarea
                    value={form.maintenance_message}
                    onChange={(e) => handleChange('maintenance_message', e.target.value)}
                    placeholder="e.g. We are performing scheduled maintenance. Please try again in 30 minutes."
                    rows={2}
                  />
                </div>
              </div>
              <div className="avm-form-actions">
                <button type="button" className="avm-btn avm-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="avm-btn avm-btn-primary" disabled={creating || updating}>
                  {creating || updating ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {showDeleteConfirm && (
        <div className="avm-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="avm-modal avm-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="avm-modal-header avm-modal-header-danger">
              <h2>Delete App Version</h2>
              <button className="avm-modal-close" onClick={() => setShowDeleteConfirm(null)}>×</button>
            </div>
            <div className="avm-delete-body">
              <p>Are you sure you want to delete <strong>{showDeleteConfirm.app_name}</strong>?</p>
              <p className="avm-delete-sub">App ID: <code>{showDeleteConfirm.app_id}</code></p>
              <p className="avm-delete-warn">This action cannot be undone.</p>
            </div>
            <div className="avm-form-actions">
              <button className="avm-btn avm-btn-cancel" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="avm-btn avm-btn-danger"
                onClick={() => handleDelete(showDeleteConfirm.id)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
