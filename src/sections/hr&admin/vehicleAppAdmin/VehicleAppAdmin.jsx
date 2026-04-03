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
} from '../../../api/services/assetsApi';
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

  const [saveVehicleCategory] = useSaveVehicleAppVehicleCategoryMutation();
  const [saveMaintenanceCategory] = useSaveVehicleAppMaintenanceCategoryMutation();
  const [saveMaintenanceDescription] = useSaveVehicleAppMaintenanceDescriptionMutation();
  const [decideMaintenance] = useDecideVehicleAppMaintenanceRequestMutation();
  const [saveFuelCategory] = useSaveFuelCategoryMutation();

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

  const pendingMaintenance = useMemo(
    () => (maintenanceRequests || []).filter((r) => r.approval === 'p'),
    [maintenanceRequests]
  );

  const handleQuickSave = async (action) => {
    try {
      await action();
      alert('Saved successfully');
    } catch (error) {
      alert(error?.data?.message || error?.message || 'Save failed');
    }
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
                  {editingVehicleCategoryId === c.id ? (
                    <>
                      <input
                        value={editingVehicleCategoryValue}
                        onChange={(e) => setEditingVehicleCategoryValue(e.target.value)}
                        className="master-edit-input"
                      />
                      <div className="master-actions">
                        <button
                          className="action-btn approve"
                          onClick={() => handleQuickSave(async () => {
                            await saveVehicleCategory({
                              id: c.id,
                              category: editingVehicleCategoryValue,
                              activated: c.activated ?? 1,
                            }).unwrap();
                            setEditingVehicleCategoryId(null);
                            setEditingVehicleCategoryValue('');
                          })}
                        >
                          Save
                        </button>
                        <button
                          className="action-btn neutral"
                          onClick={() => {
                            setEditingVehicleCategoryId(null);
                            setEditingVehicleCategoryValue('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="master-label">{c.category}</span>
                      <div className="master-actions">
                        <button
                          className="action-btn neutral"
                          onClick={() => {
                            setEditingVehicleCategoryId(c.id);
                            setEditingVehicleCategoryValue(c.category || '');
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
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
                  {editingMaintenanceCategoryId === c.id ? (
                    <>
                      <input
                        value={editingMaintenanceCategoryValue}
                        onChange={(e) => setEditingMaintenanceCategoryValue(e.target.value)}
                        className="master-edit-input"
                      />
                      <div className="master-actions">
                        <button
                          className="action-btn approve"
                          onClick={() => handleQuickSave(async () => {
                            await saveMaintenanceCategory({
                              id: c.id,
                              category: editingMaintenanceCategoryValue,
                              activated: c.activated ?? 1,
                            }).unwrap();
                            setEditingMaintenanceCategoryId(null);
                            setEditingMaintenanceCategoryValue('');
                          })}
                        >
                          Save
                        </button>
                        <button
                          className="action-btn neutral"
                          onClick={() => {
                            setEditingMaintenanceCategoryId(null);
                            setEditingMaintenanceCategoryValue('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="master-label">{c.category}</span>
                      <div className="master-actions">
                        <button
                          className="action-btn neutral"
                          onClick={() => {
                            setEditingMaintenanceCategoryId(c.id);
                            setEditingMaintenanceCategoryValue(c.category || '');
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
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
                  {editingFuelId === c.id ? (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <input
                          value={editingFuelName}
                          onChange={(e) => setEditingFuelName(e.target.value)}
                          className="master-edit-input"
                          placeholder="Fuel type name"
                        />
                        <input
                          type="number"
                          value={editingFuelPrice}
                          onChange={(e) => setEditingFuelPrice(e.target.value)}
                          className="master-edit-input"
                          placeholder="Unit price (LKR/L)"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="master-actions">
                        <button
                          className="action-btn approve"
                          onClick={() => handleQuickSave(async () => {
                            await saveFuelCategory({
                              id: c.id,
                              category: editingFuelName,
                              unit_price: editingFuelPrice || null,
                              activated: c.activated ?? 1,
                            }).unwrap();
                            setEditingFuelId(null);
                            setEditingFuelName('');
                            setEditingFuelPrice('');
                            refetchFuelCategories();
                          })}
                        >
                          Save
                        </button>
                        <button
                          className="action-btn neutral"
                          onClick={() => { setEditingFuelId(null); setEditingFuelName(''); setEditingFuelPrice(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ flex: 1 }}>
                        <span className="master-label">{c.category}</span>
                        {c.unit_price != null && (
                          <span style={{ marginLeft: 8, fontSize: '0.82em', color: '#555' }}>
                            LKR {Number(c.unit_price).toFixed(2)}/L
                          </span>
                        )}
                      </div>
                      <div className="master-actions">
                        <button
                          className="action-btn neutral"
                          onClick={() => {
                            setEditingFuelId(c.id);
                            setEditingFuelName(c.category || '');
                            setEditingFuelPrice(c.unit_price != null ? String(c.unit_price) : '');
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
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
                  {editingMaintenanceDescriptionId === c.id ? (
                    <>
                      <input
                        value={editingMaintenanceDescriptionValue}
                        onChange={(e) => setEditingMaintenanceDescriptionValue(e.target.value)}
                        className="master-edit-input"
                      />
                      <div className="master-actions">
                        <button
                          className="action-btn approve"
                          onClick={() => handleQuickSave(async () => {
                            await saveMaintenanceDescription({
                              id: c.id,
                              description: editingMaintenanceDescriptionValue,
                              activated: c.activated ?? 1,
                            }).unwrap();
                            setEditingMaintenanceDescriptionId(null);
                            setEditingMaintenanceDescriptionValue('');
                          })}
                        >
                          Save
                        </button>
                        <button
                          className="action-btn neutral"
                          onClick={() => {
                            setEditingMaintenanceDescriptionId(null);
                            setEditingMaintenanceDescriptionValue('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="master-label">{c.description}</span>
                      <div className="master-actions">
                        <button
                          className="action-btn neutral"
                          onClick={() => {
                            setEditingMaintenanceDescriptionId(c.id);
                            setEditingMaintenanceDescriptionValue(c.description || '');
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
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
    </div>
  );
};

export default VehicleAppAdmin;

