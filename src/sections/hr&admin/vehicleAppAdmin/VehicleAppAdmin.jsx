import React, { useMemo, useState } from 'react';
import {
  useGetVehicleAppSummaryQuery,
  useGetVehicleAppVehiclesQuery,
  useGetVehicleAppDriversQuery,
  useGetVehicleAppVehicleCategoriesQuery,
  useSaveVehicleAppVehicleCategoryMutation,
  useGetVehicleAppMaintenanceCategoriesQuery,
  useSaveVehicleAppMaintenanceCategoryMutation,
  useGetVehicleAppMaintenanceDescriptionsQuery,
  useSaveVehicleAppMaintenanceDescriptionMutation,
  useGetVehicleAppMaintenanceRequestsQuery,
  useDecideVehicleAppMaintenanceRequestMutation,
} from '../../../api/services NodeJs/vehicleAppApi';
import {
  useGetFuelCategoriesQuery,
  useSaveFuelCategoryMutation,
  useGetWingsQuery as useGetLegacyWingsQuery,
} from '../../../api/services/assetsApi';
import {
  useGetWingsQuery,
  useSaveWingMutation,
  useGetAllEmployeeRegistrationsQuery,
} from '../../../api/services NodeJs/jdManagementApi';
import '../../../styles/vehicleAppAdmin.css';

const TAB_CONFIG = {
  full: ['overview', 'masters', 'vehicles', 'maintenance'],
  operations: ['overview', 'vehicles', 'maintenance'],
  masters: ['masters'],
};

const VehicleAppAdmin = ({ mode = 'full' }) => {
  const tabs = TAB_CONFIG[mode] || TAB_CONFIG.full;
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [yearMonth] = useState('');

  const { data: summary = {} } = useGetVehicleAppSummaryQuery(yearMonth);
  const { data: vehicles = [] } = useGetVehicleAppVehiclesQuery();
  const { data: drivers = [] } = useGetVehicleAppDriversQuery();
  const { data: vehicleCategories = [] } = useGetVehicleAppVehicleCategoriesQuery();
  const { data: maintenanceCategories = [] } = useGetVehicleAppMaintenanceCategoriesQuery();
  const { data: maintenanceDescriptions = [] } = useGetVehicleAppMaintenanceDescriptionsQuery();
  const { data: maintenanceRequests = [] } = useGetVehicleAppMaintenanceRequestsQuery(yearMonth);
  const { data: fuelCategories = [], refetch: refetchFuelCategories } = useGetFuelCategoriesQuery();
  const { data: wingsData } = useGetWingsQuery();
  const { data: legacyWingsData } = useGetLegacyWingsQuery();
  const { data: employeesData } = useGetAllEmployeeRegistrationsQuery();
  const wings = useMemo(() => {
    const fromJd = Array.isArray(wingsData)
      ? wingsData
      : Array.isArray(wingsData?.data)
        ? wingsData.data
        : Array.isArray(wingsData?.wings)
          ? wingsData.wings
          : [];
    if (fromJd.length > 0) return fromJd;

    const fromLegacy = Array.isArray(legacyWingsData)
      ? legacyWingsData
      : Array.isArray(legacyWingsData?.wings)
        ? legacyWingsData.wings
        : Array.isArray(legacyWingsData?.data)
          ? legacyWingsData.data
          : [];
    if (fromLegacy.length > 0) return fromLegacy;

    return [];
  }, [wingsData, legacyWingsData]);
  const employees = useMemo(() => {
    if (!employeesData) return [];
    if (Array.isArray(employeesData)) return employeesData;
    if (Array.isArray(employeesData?.data)) return employeesData.data;
    return [];
  }, [employeesData]);

  const [saveVehicleCategory] = useSaveVehicleAppVehicleCategoryMutation();
  const [saveMaintenanceCategory] = useSaveVehicleAppMaintenanceCategoryMutation();
  const [saveMaintenanceDescription] = useSaveVehicleAppMaintenanceDescriptionMutation();
  const [decideMaintenance] = useDecideVehicleAppMaintenanceRequestMutation();
  const [saveFuelCategory] = useSaveFuelCategoryMutation();
  const [saveWing] = useSaveWingMutation();

  const [newVehicleCategory, setNewVehicleCategory] = useState('');
  const [newMaintenanceCategory, setNewMaintenanceCategory] = useState('');
  const [newMaintenanceDescription, setNewMaintenanceDescription] = useState('');
  const [editingVehicleCategoryId, setEditingVehicleCategoryId] = useState(null);
  const [editingVehicleCategoryValue, setEditingVehicleCategoryValue] = useState('');
  const [editingMaintenanceCategoryId, setEditingMaintenanceCategoryId] = useState(null);
  const [editingMaintenanceCategoryValue, setEditingMaintenanceCategoryValue] = useState('');
  const [editingMaintenanceDescriptionId, setEditingMaintenanceDescriptionId] = useState(null);
  const [editingMaintenanceDescriptionValue, setEditingMaintenanceDescriptionValue] = useState('');

  const [newFuelCategory, setNewFuelCategory] = useState('');
  const [newFuelUnitPrice, setNewFuelUnitPrice] = useState('');
  const [editingFuelId, setEditingFuelId] = useState(null);
  const [editingFuelName, setEditingFuelName] = useState('');
  const [editingFuelPrice, setEditingFuelPrice] = useState('');
  const [newWingName, setNewWingName] = useState('');
  const [newWingCode, setNewWingCode] = useState('');
  const [newWingHod, setNewWingHod] = useState('');
  const [editingWingId, setEditingWingId] = useState(null);
  const [editingWingName, setEditingWingName] = useState('');
  const [editingWingCode, setEditingWingCode] = useState('');
  const [editingWingHod, setEditingWingHod] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [modalDraft, setModalDraft] = useState({});
  const [quickMessage, setQuickMessage] = useState({ type: '', text: '' });

  const pendingMaintenance = useMemo(
    () => (maintenanceRequests || []).filter((r) => r.approval === 'p'),
    [maintenanceRequests]
  );

  const handleQuickSave = async (action) => {
    try {
      await action();
      setQuickMessage({ type: 'success', text: 'Saved successfully.' });
    } catch (error) {
      setQuickMessage({
        type: 'error',
        text: error?.data?.message || error?.message || 'Save failed',
      });
    }
  };

  const openEditModal = (type, item) => {
    setEditModal({ type, item });
    if (type === 'vehicleCategory') setModalDraft({ category: item.category || '' });
    if (type === 'maintenanceCategory') setModalDraft({ category: item.category || '' });
    if (type === 'maintenanceDescription') setModalDraft({ description: item.description || '' });
    if (type === 'fuel') setModalDraft({ category: item.category || '', unit_price: item.unit_price != null ? String(item.unit_price) : '' });
    if (type === 'wing') setModalDraft({ wing: item.wing || '', wingsCode: item.wingsCode || '', hod: item.hod ? String(item.hod) : '' });
  };

  const closeEditModal = () => {
    setEditModal(null);
    setModalDraft({});
  };

  const saveEditModal = async () => {
    if (!editModal?.item?.id) return;
    await handleQuickSave(async () => {
      if (editModal.type === 'vehicleCategory') {
        await saveVehicleCategory({ id: editModal.item.id, category: modalDraft.category, activated: editModal.item.activated ?? 1 }).unwrap();
      } else if (editModal.type === 'maintenanceCategory') {
        await saveMaintenanceCategory({ id: editModal.item.id, category: modalDraft.category, activated: editModal.item.activated ?? 1 }).unwrap();
      } else if (editModal.type === 'maintenanceDescription') {
        await saveMaintenanceDescription({ id: editModal.item.id, description: modalDraft.description, activated: editModal.item.activated ?? 1 }).unwrap();
      } else if (editModal.type === 'fuel') {
        await saveFuelCategory({
          id: editModal.item.id,
          category: modalDraft.category,
          unit_price: modalDraft.unit_price || null,
          activated: editModal.item.activated ?? 1,
        }).unwrap();
        refetchFuelCategories();
      } else if (editModal.type === 'wing') {
        await saveWing({
          id: editModal.item.id,
          wing: modalDraft.wing,
          wingsCode: modalDraft.wingsCode,
          hod: modalDraft.hod || null,
          activated: editModal.item.activated ?? 1,
        }).unwrap();
      }
      closeEditModal();
    });
  };

  return (
    <div className="vehicle-admin-page">
      <div className="vehicle-admin-header">
        <div>
          <h1>{mode === 'masters' ? 'Master Data Update' : 'Vehicle App Administration'}</h1>
          <p>
            {mode === 'masters'
              ? 'Manage master data. This section starts with vehicle app masters and can be extended.'
              : 'Manage vehicle requests and monthly operations.'}
          </p>
        </div>
      </div>
      {quickMessage.text ? (
        <div
          style={{
            marginBottom: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: quickMessage.type === 'success' ? '#e6f7ee' : '#fdecec',
            color: quickMessage.type === 'success' ? '#116149' : '#8a1f1f',
            border: `1px solid ${quickMessage.type === 'success' ? '#b9e4cf' : '#f6c2c2'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span>{quickMessage.text}</span>
          <button
            type="button"
            className="action-btn neutral"
            onClick={() => setQuickMessage({ type: '', text: '' })}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {tabs.length > 1 && (
        <div className="vehicle-admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'active' : ''}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="vehicle-admin-grid">
          <div className="vehicle-admin-card stat-card">
            <h3>Vehicle Day Summary</h3>
            <div className="metric-list">
              <div className="metric-row"><span>Total</span><strong>{summary?.daily?.total_records || 0}</strong></div>
              <div className="metric-row"><span>Approved</span><strong>{summary?.daily?.approved_records || 0}</strong></div>
              <div className="metric-row"><span>Pending</span><strong>{summary?.daily?.pending_records || 0}</strong></div>
              <div className="metric-row"><span>Declined</span><strong>{summary?.daily?.declined_records || 0}</strong></div>
            </div>
          </div>
          <div className="vehicle-admin-card stat-card">
            <h3>Maintenance Summary</h3>
            <div className="metric-list">
              <div className="metric-row"><span>Total</span><strong>{summary?.maintenance?.total_requests || 0}</strong></div>
              <div className="metric-row"><span>Approved</span><strong>{summary?.maintenance?.approved_requests || 0}</strong></div>
              <div className="metric-row"><span>Pending</span><strong>{summary?.maintenance?.pending_requests || 0}</strong></div>
              <div className="metric-row"><span>Declined</span><strong>{summary?.maintenance?.declined_requests || 0}</strong></div>
            </div>
          </div>
          <div className="vehicle-admin-card stat-card">
            <h3>Active Records</h3>
            <div className="metric-list">
              <div className="metric-row"><span>Vehicles</span><strong>{vehicles.length}</strong></div>
              <div className="metric-row"><span>Drivers</span><strong>{drivers.length}</strong></div>
              <div className="metric-row"><span>Vehicle Categories</span><strong>{vehicleCategories.length}</strong></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'masters' && (
        <div className="vehicle-admin-grid three" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          <div className="vehicle-admin-card">
            <h3>Vehicle Categories</h3>
            <div className="inline-form">
              <input value={newVehicleCategory} onChange={(e) => setNewVehicleCategory(e.target.value)} placeholder="New category" />
              <button onClick={() => handleQuickSave(async () => {
                await saveVehicleCategory({ category: newVehicleCategory, activated: 1 }).unwrap();
                setNewVehicleCategory('');
              })}>Add</button>
            </div>
            <div className="master-list">
              {vehicleCategories.map((c) => (
                <div key={c.id} className="master-row">
                  <>
                    <span className="master-label">{c.category}</span>
                    <div className="master-actions">
                      <button className="action-btn neutral" onClick={() => openEditModal('vehicleCategory', c)}>
                        Edit
                      </button>
                    </div>
                  </>
                </div>
              ))}
            </div>
          </div>
          <div className="vehicle-admin-card">
            <h3>Maintenance Categories</h3>
            <div className="inline-form">
              <input value={newMaintenanceCategory} onChange={(e) => setNewMaintenanceCategory(e.target.value)} placeholder="New maintenance category" />
              <button onClick={() => handleQuickSave(async () => {
                await saveMaintenanceCategory({ category: newMaintenanceCategory, activated: 1 }).unwrap();
                setNewMaintenanceCategory('');
              })}>Add</button>
            </div>
            <div className="master-list">
              {maintenanceCategories.map((c) => (
                <div key={c.id} className="master-row">
                  <>
                    <span className="master-label">{c.category}</span>
                    <div className="master-actions">
                      <button className="action-btn neutral" onClick={() => openEditModal('maintenanceCategory', c)}>
                        Edit
                      </button>
                    </div>
                  </>
                </div>
              ))}
            </div>
          </div>
          <div className="vehicle-admin-card">
            <h3>Wings</h3>
            <div className="inline-form" style={{ flexWrap: 'wrap', gap: '6px' }}>
              <input
                value={newWingName}
                onChange={(e) => setNewWingName(e.target.value)}
                placeholder="Wing name"
                style={{ flex: '1 1 140px' }}
              />
              <input
                value={newWingCode}
                onChange={(e) => setNewWingCode(e.target.value)}
                placeholder="Wing code"
                style={{ flex: '1 1 120px' }}
              />
              <select
                value={newWingHod}
                onChange={(e) => setNewWingHod(e.target.value)}
                style={{ flex: '1 1 180px' }}
              >
                <option value="">HOD (Employee ID)</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.id} - {emp.employeeName || emp.preferredName || emp.empNo || 'Employee'}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleQuickSave(async () => {
                  await saveWing({
                    wing: newWingName,
                    wingsCode: newWingCode,
                    hod: newWingHod || null,
                    activated: 1,
                  }).unwrap();
                  setNewWingName('');
                  setNewWingCode('');
                  setNewWingHod('');
                })}
              >
                Add
              </button>
            </div>
            <div className="master-list">
              {wings.map((w) => (
                <div key={w.id} className="master-row">
                  {(() => {
                    const hodEmployee = employees.find((emp) => String(emp.id) === String(w.hod || ''));
                    const hodLabel = hodEmployee
                      ? `${hodEmployee.employeeName || hodEmployee.preferredName || hodEmployee.empNo || 'Employee'} (${hodEmployee.id})`
                      : (w.hod || '-');
                    return (
                  <>
                    <div style={{ flex: 1 }}>
                      <span className="master-label">{w.wing}</span>
                      <span style={{ marginLeft: 8, fontSize: '0.82em', color: '#555' }}>
                        [{w.wingsCode || '-'}] HOD: {hodLabel}
                      </span>
                    </div>
                    <div className="master-actions">
                      <button className="action-btn neutral" onClick={() => openEditModal('wing', w)}>
                        Edit
                      </button>
                    </div>
                  </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>

          <div className="vehicle-admin-card">
            <h3>Fuel Types</h3>
            <div className="inline-form" style={{ flexWrap: 'wrap', gap: '6px' }}>
              <input
                value={newFuelCategory}
                onChange={(e) => setNewFuelCategory(e.target.value)}
                placeholder="Fuel type name"
                style={{ flex: '1 1 120px' }}
              />
              <input
                type="number"
                value={newFuelUnitPrice}
                onChange={(e) => setNewFuelUnitPrice(e.target.value)}
                placeholder="Unit price (LKR/L)"
                min="0"
                step="0.01"
                style={{ flex: '1 1 120px' }}
              />
              <button onClick={() => handleQuickSave(async () => {
                await saveFuelCategory({ category: newFuelCategory, unit_price: newFuelUnitPrice || null, activated: 1 }).unwrap();
                setNewFuelCategory('');
                setNewFuelUnitPrice('');
                refetchFuelCategories();
              })}>Add</button>
            </div>
            <div className="master-list">
              {fuelCategories.map((c) => (
                <div key={c.id} className="master-row">
                  <>
                    <div style={{ flex: 1 }}>
                      <span className="master-label">{c.category}</span>
                      <span style={{ marginLeft: 8, fontSize: '0.82em', color: '#555' }}>
                        {c.unit_price != null && c.unit_price !== ''
                          ? `Current: LKR ${Number(c.unit_price).toFixed(2)}/L`
                          : 'Current: Not set'}
                      </span>
                    </div>
                    <div className="master-actions">
                      <button className="action-btn neutral" onClick={() => openEditModal('fuel', c)}>
                        Edit
                      </button>
                    </div>
                  </>
                </div>
              ))}
            </div>
          </div>

          <div className="vehicle-admin-card">
            <h3>Maintenance Descriptions</h3>
            <div className="inline-form">
              <input value={newMaintenanceDescription} onChange={(e) => setNewMaintenanceDescription(e.target.value)} placeholder="New description" />
              <button onClick={() => handleQuickSave(async () => {
                await saveMaintenanceDescription({ description: newMaintenanceDescription, activated: 1 }).unwrap();
                setNewMaintenanceDescription('');
              })}>Add</button>
            </div>
            <div className="master-list">
              {maintenanceDescriptions.map((c) => (
                <div key={c.id} className="master-row">
                  <>
                    <span className="master-label">{c.description}</span>
                    <div className="master-actions">
                      <button className="action-btn neutral" onClick={() => openEditModal('maintenanceDescription', c)}>
                        Edit
                      </button>
                    </div>
                  </>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="vehicle-admin-card">
          <h3>Vehicle Registry</h3>
          <p className="vehicle-admin-note">Vehicle creation and assignment are maintained in Fleet Update.</p>

          <div className="vehicle-table-wrap">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>ID</th><th>Vehicle No</th><th>Make/Model</th><th>Driver</th><th>Fuel Card</th><th>Category</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.vehicle_no}</td>
                    <td>{v.make || '-'} / {v.model || '-'}</td>
                    <td>{v.assigned_driver_name || '-'}</td>
                    <td>{v.linked_card_no_masked || '-'}</td>
                    <td>{v.vehicle_category_name || '-'}</td>
                    <td>
                      <span className={v.activated === 1 ? 'status-chip active' : 'status-chip inactive'}>
                        {v.activated === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="vehicle-admin-card">
          <h3>Pending Maintenance Approvals ({pendingMaintenance.length})</h3>
          <div className="vehicle-table-wrap">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>ID</th><th>Date</th><th>Vehicle</th><th>Driver</th><th>Category</th><th>Description</th><th>Approval</th>
                </tr>
              </thead>
              <tbody>
                {(pendingMaintenance.length ? pendingMaintenance : maintenanceRequests).map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.date}</td>
                    <td>{m.vehicle_no || m.vehicle}</td>
                    <td>{m.driver_name || m.driver}</td>
                    <td>{m.category_name || m.category}</td>
                    <td>{m.description_name || m.description}</td>
                    <td>
                      {m.approval === 'p' ? (
                        <div className="actions">
                          <button className="action-btn approve" onClick={() => handleQuickSave(async () => decideMaintenance({ id: m.id, approval: 'a' }).unwrap())}>Approve</button>
                          <button className="action-btn danger" onClick={() => handleQuickSave(async () => decideMaintenance({ id: m.id, approval: 'd' }).unwrap())}>Decline</button>
                        </div>
                      ) : (
                        <span className={m.approval === 'a' ? 'status-chip approved' : 'status-chip declined'}>
                          {m.approval === 'a' ? 'Approved' : 'Declined'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editModal && (
        <div className="update-popup-overlay">
          <div className="update-popup-card">
            <h3>Edit {editModal.type}</h3>
            {editModal.type === 'vehicleCategory' && (
              <input
                className="master-edit-input"
                value={modalDraft.category || ''}
                onChange={(e) => setModalDraft((p) => ({ ...p, category: e.target.value }))}
                placeholder="Category"
              />
            )}
            {editModal.type === 'maintenanceCategory' && (
              <input
                className="master-edit-input"
                value={modalDraft.category || ''}
                onChange={(e) => setModalDraft((p) => ({ ...p, category: e.target.value }))}
                placeholder="Category"
              />
            )}
            {editModal.type === 'maintenanceDescription' && (
              <input
                className="master-edit-input"
                value={modalDraft.description || ''}
                onChange={(e) => setModalDraft((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description"
              />
            )}
            {editModal.type === 'fuel' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="master-edit-input"
                  value={modalDraft.category || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Fuel type name"
                />
                <input
                  type="number"
                  className="master-edit-input"
                  value={modalDraft.unit_price || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, unit_price: e.target.value }))}
                  placeholder="Unit price (LKR/L)"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
            {editModal.type === 'wing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="master-edit-input"
                  value={modalDraft.wing || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, wing: e.target.value }))}
                  placeholder="Wing name"
                />
                <input
                  className="master-edit-input"
                  value={modalDraft.wingsCode || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, wingsCode: e.target.value }))}
                  placeholder="Wing code"
                />
                <select
                  className="master-edit-input"
                  value={modalDraft.hod || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, hod: e.target.value }))}
                >
                  <option value="">HOD (Employee ID)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.id} - {emp.employeeName || emp.preferredName || emp.empNo || 'Employee'}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="update-popup-actions">
              <button className="btn-search" onClick={closeEditModal}>Cancel</button>
              <button className="btn-submit" onClick={saveEditModal}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleAppAdmin;

