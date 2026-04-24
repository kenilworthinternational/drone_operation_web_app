import React, { useEffect, useMemo, useState } from 'react';
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
  useGetWorkLocationsQuery,
  useSaveWorkLocationMutation,
  useGetVehicleCategoriesQuery as useGetMasterVehicleCategoriesQuery,
  useSaveVehicleCategoryMutation as useSaveMasterVehicleCategoryMutation,
  useGetVehicleMakesQuery as useGetMasterVehicleMakesQuery,
  useSaveVehicleMakeMutation as useSaveMasterVehicleMakeMutation,
  useGetVehicleModelsQuery as useGetMasterVehicleModelsQuery,
  useSaveVehicleModelMutation as useSaveMasterVehicleModelMutation,
} from '../../../api/services NodeJs/jdManagementApi';
import '../../../styles/masterdata.css';

const TAB_CONFIG = {
  full: ['overview', 'masters', 'vehicles', 'maintenance'],
  operations: ['overview', 'vehicles', 'maintenance'],
  masters: ['masters'],
};

const MasterData = ({ mode = 'full' }) => {
  const tabs = TAB_CONFIG[mode] || TAB_CONFIG.full;
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [yearMonth] = useState('');
  const [selectedMasterModule, setSelectedMasterModule] = useState('vehicleMaster');

  const { data: summary = {} } = useGetVehicleAppSummaryQuery(yearMonth);
  const { data: vehicles = [] } = useGetVehicleAppVehiclesQuery();
  const { data: drivers = [] } = useGetVehicleAppDriversQuery();
  const { data: vehicleCategories = [] } = useGetVehicleAppVehicleCategoriesQuery();
  const { data: maintenanceCategories = [] } = useGetVehicleAppMaintenanceCategoriesQuery();
  const { data: maintenanceDescriptions = [] } = useGetVehicleAppMaintenanceDescriptionsQuery();
  const { data: maintenanceRequests = [] } = useGetVehicleAppMaintenanceRequestsQuery(yearMonth);
  const { data: fuelCategories = [], refetch: refetchFuelCategories } = useGetFuelCategoriesQuery();
  const { data: wingsData, refetch: refetchWings } = useGetWingsQuery();
  const { data: legacyWingsData } = useGetLegacyWingsQuery();
  const { data: employeesData } = useGetAllEmployeeRegistrationsQuery();
  const { data: workLocationsData, refetch: refetchWorkLocations } = useGetWorkLocationsQuery();
  const { data: masterVehicleCategoriesData = [], refetch: refetchMasterVehicleCategories } = useGetMasterVehicleCategoriesQuery();
  const { data: masterVehicleMakesData = [], refetch: refetchMasterVehicleMakes } = useGetMasterVehicleMakesQuery();
  const { data: masterVehicleModelsData = [], refetch: refetchMasterVehicleModels } = useGetMasterVehicleModelsQuery();
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
  const workLocations = useMemo(() => {
    if (!workLocationsData) return [];
    if (Array.isArray(workLocationsData)) return workLocationsData;
    if (Array.isArray(workLocationsData?.data)) return workLocationsData.data;
    return [];
  }, [workLocationsData]);

  const [saveVehicleCategory] = useSaveVehicleAppVehicleCategoryMutation();
  const [saveMaintenanceCategory] = useSaveVehicleAppMaintenanceCategoryMutation();
  const [saveMaintenanceDescription] = useSaveVehicleAppMaintenanceDescriptionMutation();
  const [decideMaintenance] = useDecideVehicleAppMaintenanceRequestMutation();
  const [saveFuelCategory] = useSaveFuelCategoryMutation();
  const [saveWing] = useSaveWingMutation();
  const [saveWorkLocation] = useSaveWorkLocationMutation();
  const [saveMasterVehicleCategory] = useSaveMasterVehicleCategoryMutation();
  const [saveMasterVehicleMake] = useSaveMasterVehicleMakeMutation();
  const [saveMasterVehicleModel] = useSaveMasterVehicleModelMutation();

  const [newMaintenanceCategory, setNewMaintenanceCategory] = useState('');
  const [newMaintenanceDescription, setNewMaintenanceDescription] = useState('');

  const [newFuelCategory, setNewFuelCategory] = useState('');
  const [newFuelUnitPrice, setNewFuelUnitPrice] = useState('');
  const [newWingName, setNewWingName] = useState('');
  const [newWingCode, setNewWingCode] = useState('');
  const [newWingHod, setNewWingHod] = useState('');
  const [newWorkLocationName, setNewWorkLocationName] = useState('');
  const [newWorkLocationCode, setNewWorkLocationCode] = useState('');
  const [newWorkLocationMapLink, setNewWorkLocationMapLink] = useState('');
  const [addModal, setAddModal] = useState(null);
  const [addDraft, setAddDraft] = useState({});
  const [editModal, setEditModal] = useState(null);
  const [modalDraft, setModalDraft] = useState({});
  const [quickMessage, setQuickMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!quickMessage.text) return undefined;
    const timer = setTimeout(() => {
      setQuickMessage({ type: '', text: '' });
    }, 3000);
    return () => clearTimeout(timer);
  }, [quickMessage]);

  const masterVehicleCategories = useMemo(
    () => (Array.isArray(masterVehicleCategoriesData) ? masterVehicleCategoriesData : []),
    [masterVehicleCategoriesData]
  );
  const masterVehicleMakes = useMemo(
    () => (Array.isArray(masterVehicleMakesData) ? masterVehicleMakesData : []),
    [masterVehicleMakesData]
  );
  const masterVehicleModels = useMemo(
    () => (Array.isArray(masterVehicleModelsData) ? masterVehicleModelsData : []),
    [masterVehicleModelsData]
  );
  const addModalModelMakes = useMemo(
    () => masterVehicleMakes.filter((m) => (
      !addDraft?.vehicle_category_id || String(m.vehicle_category_id) === String(addDraft.vehicle_category_id)
    )),
    [masterVehicleMakes, addDraft?.vehicle_category_id]
  );
  const modalVehicleModelMakes = useMemo(
    () => masterVehicleMakes.filter((m) => (
      !modalDraft?.vehicle_category_id || String(m.vehicle_category_id) === String(modalDraft.vehicle_category_id)
    )),
    [masterVehicleMakes, modalDraft?.vehicle_category_id]
  );

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

  const refreshVehicleMasters = async () => {
    await Promise.all([
      refetchMasterVehicleCategories(),
      refetchMasterVehicleMakes(),
      refetchMasterVehicleModels(),
    ]);
  };

  const openEditModal = (type, item) => {
    setEditModal({ type, item });
    if (type === 'vehicleCategory') setModalDraft({ category: item.category || '' });
    if (type === 'vehicleMake') setModalDraft({ make: item.make || '', vehicle_category_id: String(item.vehicle_category_id || '') });
    if (type === 'vehicleModel') {
      const selectedMake = masterVehicleMakes.find((m) => String(m.id) === String(item.vehicle_make_id || ''));
      setModalDraft({
        model: item.model || '',
        vehicle_make_id: String(item.vehicle_make_id || ''),
        vehicle_category_id: selectedMake ? String(selectedMake.vehicle_category_id) : '',
      });
    }
    if (type === 'maintenanceCategory') setModalDraft({ category: item.category || '' });
    if (type === 'maintenanceDescription') setModalDraft({ description: item.description || '' });
    if (type === 'fuel') setModalDraft({ category: item.category || '', unit_price: item.unit_price != null ? String(item.unit_price) : '' });
    if (type === 'wing') setModalDraft({ wing: item.wing || '', wingsCode: item.wingsCode || '', hod: item.hod ? String(item.hod) : '' });
    if (type === 'workLocation') {
      setModalDraft({
        locationName: item.locationName || '',
        locationCode: item.locationCode || '',
        map_link: item.map_link || '',
      });
    }
  };

  const openAddModal = (type) => {
    setAddModal(type);
    if (type === 'vehicleCategory') setAddDraft({ category: '' });
    if (type === 'vehicleMake') setAddDraft({ vehicle_category_id: '', make: '' });
    if (type === 'vehicleModel') setAddDraft({ vehicle_category_id: '', vehicle_make_id: '', model: '' });
  };

  const closeAddModal = () => {
    setAddModal(null);
    setAddDraft({});
  };

  const closeEditModal = () => {
    setEditModal(null);
    setModalDraft({});
  };

  const saveAddModal = async () => {
    if (!addModal) return;
    await handleQuickSave(async () => {
      if (addModal === 'vehicleCategory') {
        await saveMasterVehicleCategory({ category: addDraft.category, activated: 1 }).unwrap();
        await refreshVehicleMasters();
      } else if (addModal === 'vehicleMake') {
        await saveMasterVehicleMake({
          vehicle_category_id: addDraft.vehicle_category_id,
          make: addDraft.make,
          activated: 1,
        }).unwrap();
        await refreshVehicleMasters();
      } else if (addModal === 'vehicleModel') {
        await saveMasterVehicleModel({
          vehicle_make_id: addDraft.vehicle_make_id,
          model: addDraft.model,
          activated: 1,
        }).unwrap();
        await refreshVehicleMasters();
      }
      closeAddModal();
    });
  };

  const saveEditModal = async () => {
    if (!editModal?.item?.id) return;
    await handleQuickSave(async () => {
      if (editModal.type === 'vehicleCategory') {
        await saveMasterVehicleCategory({ id: editModal.item.id, category: modalDraft.category, activated: editModal.item.activated ?? 1 }).unwrap();
        await refreshVehicleMasters();
      } else if (editModal.type === 'vehicleMake') {
        await saveMasterVehicleMake({
          id: editModal.item.id,
          vehicle_category_id: modalDraft.vehicle_category_id,
          make: modalDraft.make,
          activated: editModal.item.activated ?? 1,
        }).unwrap();
        await refreshVehicleMasters();
      } else if (editModal.type === 'vehicleModel') {
        await saveMasterVehicleModel({
          id: editModal.item.id,
          vehicle_make_id: modalDraft.vehicle_make_id,
          model: modalDraft.model,
          activated: editModal.item.activated ?? 1,
        }).unwrap();
        await refreshVehicleMasters();
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
        refetchWings();
      } else if (editModal.type === 'workLocation') {
        await saveWorkLocation({
          id: editModal.item.id,
          locationName: modalDraft.locationName,
          locationCode: modalDraft.locationCode,
          map_link: modalDraft.map_link || null,
          activated: editModal.item.activated ?? 1,
        }).unwrap();
        refetchWorkLocations();
      }
      closeEditModal();
    });
  };

  return (
    <div className="vehicle-admin-page-master-data">
      <div className="vehicle-admin-header-master-data">
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
            className="action-btn-master-data neutral-master-data"
            onClick={() => setQuickMessage({ type: '', text: '' })}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {tabs.length > 1 && (
        <div className="vehicle-admin-tabs-master-data">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'active-master-data' : ''}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="vehicle-admin-grid-master-data">
          <div className="vehicle-admin-card-master-data stat-card-master-data">
            <h3>Vehicle Day Summary</h3>
            <div className="metric-list-master-data">
              <div className="metric-row-master-data"><span>Total</span><strong>{summary?.daily?.total_records || 0}</strong></div>
              <div className="metric-row-master-data"><span>Approved</span><strong>{summary?.daily?.approved_records || 0}</strong></div>
              <div className="metric-row-master-data"><span>Pending</span><strong>{summary?.daily?.pending_records || 0}</strong></div>
              <div className="metric-row-master-data"><span>Declined</span><strong>{summary?.daily?.declined_records || 0}</strong></div>
            </div>
          </div>
          <div className="vehicle-admin-card-master-data stat-card-master-data">
            <h3>Maintenance Summary</h3>
            <div className="metric-list-master-data">
              <div className="metric-row-master-data"><span>Total</span><strong>{summary?.maintenance?.total_requests || 0}</strong></div>
              <div className="metric-row-master-data"><span>Approved</span><strong>{summary?.maintenance?.approved_requests || 0}</strong></div>
              <div className="metric-row-master-data"><span>Pending</span><strong>{summary?.maintenance?.pending_requests || 0}</strong></div>
              <div className="metric-row-master-data"><span>Declined</span><strong>{summary?.maintenance?.declined_requests || 0}</strong></div>
            </div>
          </div>
          <div className="vehicle-admin-card-master-data stat-card-master-data">
            <h3>Active Records</h3>
            <div className="metric-list-master-data">
              <div className="metric-row-master-data"><span>Vehicles</span><strong>{vehicles.length}</strong></div>
              <div className="metric-row-master-data"><span>Drivers</span><strong>{drivers.length}</strong></div>
              <div className="metric-row-master-data"><span>Vehicle Categories</span><strong>{vehicleCategories.length}</strong></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'masters' && (
        <div className="masters-layout-master-data">
          <div className="masters-picker-master-data">
            {[
              { key: 'vehicleMaster', label: 'Vehicle Master (Category/Make/Model)' },
              { key: 'fuelTypes', label: 'Fuel Types' },
              { key: 'wings', label: 'Wings' },
              { key: 'workLocations', label: 'Work Locations' },
              { key: 'maintenanceCategories', label: 'Maintenance Categories' },
              { key: 'maintenanceDescriptions', label: 'Maintenance Descriptions' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className={`masters-picker-item-master-data ${selectedMasterModule === item.key ? 'active-master-data' : ''}`}
                onClick={() => setSelectedMasterModule(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="masters-workspace-master-data">
            {selectedMasterModule === 'vehicleMaster' && (
              <div className="vehicle-admin-card-master-data">
                <h3>Vehicle Master Data</h3>
                <p className="vehicle-master-note-master-data">Manage category, make and model in one place with clear hierarchy.</p>
                <div className="vehicle-master-forms-master-data">
                  <div className="vehicle-master-form-card-master-data">
                    <h4>Category</h4>
                    <button className="btn-submit-master-data" onClick={() => openAddModal('vehicleCategory')}>Add Category</button>
                  </div>
                  <div className="vehicle-master-form-card-master-data">
                    <h4>Make</h4>
                    <button className="btn-submit-master-data" onClick={() => openAddModal('vehicleMake')}>Add Make</button>
                  </div>
                  <div className="vehicle-master-form-card-master-data">
                    <h4>Model</h4>
                    <button className="btn-submit-master-data" onClick={() => openAddModal('vehicleModel')}>Add Model</button>
                  </div>
                </div>
                <div className="master-list-master-data vehicle-master-tree-master-data vehicle-master-tree-board-master-data">
                  {masterVehicleCategories.map((c) => (
                    <div key={c.id} className="master-row-master-data vehicle-tree-category-master-data">
                      <div className="vehicle-tree-row-master-data">
                        <span className="master-label-master-data">{c.category}</span>
                        <button className="master-edit-btn-master-data" onClick={() => openEditModal('vehicleCategory', c)}>Edit Category</button>
                      </div>
                      {(masterVehicleMakes.filter((m) => String(m.vehicle_category_id) === String(c.id))).map((m) => (
                        <div key={m.id} className="vehicle-tree-make-wrap-master-data">
                          <div className="vehicle-tree-row-master-data">
                            <span className="master-label-master-data master-label-make-master-data">{m.make}</span>
                            <button className="master-edit-btn-master-data" onClick={() => openEditModal('vehicleMake', m)}>Edit Make</button>
                          </div>
                          {(masterVehicleModels.filter((mo) => String(mo.vehicle_make_id) === String(m.id))).map((mo) => (
                            <div key={mo.id} className="vehicle-tree-row-master-data vehicle-tree-model-row-master-data">
                              <span className="master-label-master-data master-label-model-master-data">{mo.model}</span>
                              <button className="master-edit-btn-master-data" onClick={() => openEditModal('vehicleModel', mo)}>Edit Model</button>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMasterModule === 'fuelTypes' && (
              <div className="vehicle-admin-card-master-data">
                <h3>Fuel Types</h3>
                <div className="inline-form-master-data" style={{ flexWrap: 'wrap', gap: '6px' }}>
                  <input value={newFuelCategory} onChange={(e) => setNewFuelCategory(e.target.value)} placeholder="Fuel type name" style={{ flex: '1 1 120px' }} />
                  <input type="number" value={newFuelUnitPrice} onChange={(e) => setNewFuelUnitPrice(e.target.value)} placeholder="Unit price (LKR/L)" min="0" step="0.01" style={{ flex: '1 1 120px' }} />
                  <button onClick={() => handleQuickSave(async () => {
                    await saveFuelCategory({ category: newFuelCategory, unit_price: newFuelUnitPrice || null, activated: 1 }).unwrap();
                    setNewFuelCategory('');
                    setNewFuelUnitPrice('');
                    refetchFuelCategories();
                  })}>Add</button>
                </div>
                <div className="master-list-master-data">
                  {fuelCategories.map((c) => (
                    <div key={c.id} className="master-row-master-data">
                      <div style={{ flex: 1 }}>
                        <span className="master-label-master-data">{c.category}</span>
                        <span style={{ marginLeft: 8, fontSize: '0.82em', color: '#555' }}>
                          {c.unit_price != null && c.unit_price !== '' ? `Current: LKR ${Number(c.unit_price).toFixed(2)}/L` : 'Current: Not set'}
                        </span>
                      </div>
                      <div className="master-actions-master-data">
                        <button className="action-btn-master-data neutral-master-data" onClick={() => openEditModal('fuel', c)}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMasterModule === 'wings' && (
              <div className="vehicle-admin-card-master-data">
                <h3>Wings</h3>
                <div className="inline-form-master-data" style={{ flexWrap: 'wrap', gap: '6px' }}>
                  <input value={newWingName} onChange={(e) => setNewWingName(e.target.value)} placeholder="Wing name" style={{ flex: '1 1 140px' }} />
                  <input value={newWingCode} onChange={(e) => setNewWingCode(e.target.value)} placeholder="Wing code" style={{ flex: '1 1 120px' }} />
                  <select value={newWingHod} onChange={(e) => setNewWingHod(e.target.value)} style={{ flex: '1 1 180px' }}>
                    <option value="">HOD (Employee ID)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.id} - {emp.employeeName || emp.preferredName || emp.empNo || 'Employee'}</option>
                    ))}
                  </select>
                  <button onClick={() => handleQuickSave(async () => {
                    await saveWing({ wing: newWingName, wingsCode: newWingCode, hod: newWingHod || null, activated: 1 }).unwrap();
                    setNewWingName(''); setNewWingCode(''); setNewWingHod('');
                  })}>Add</button>
                </div>
                <div className="master-list-master-data">
                  {wings.map((w) => {
                    const hodEmployee = employees.find((emp) => String(emp.id) === String(w.hod || ''));
                    const hodLabel = hodEmployee
                      ? `${hodEmployee.employeeName || hodEmployee.preferredName || hodEmployee.empNo || 'Employee'} (${hodEmployee.id})`
                      : (w.hod || '-');
                    return (
                      <div key={w.id} className="master-row-master-data">
                        <div style={{ flex: 1 }}>
                          <span className="master-label-master-data">{w.wing}</span>
                          <span style={{ marginLeft: 8, fontSize: '0.82em', color: '#555' }}>[{w.wingsCode || '-'}] HOD: {hodLabel}</span>
                        </div>
                        <div className="master-actions-master-data">
                          <button className="action-btn-master-data neutral-master-data" onClick={() => openEditModal('wing', w)}>Edit</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedMasterModule === 'workLocations' && (
              <div className="vehicle-admin-card-master-data">
                <h3>Work Locations</h3>
                <div className="inline-form-master-data" style={{ flexWrap: 'wrap', gap: '6px' }}>
                  <input value={newWorkLocationName} onChange={(e) => setNewWorkLocationName(e.target.value)} placeholder="Location name" style={{ flex: '1 1 140px' }} />
                  <input value={newWorkLocationCode} onChange={(e) => setNewWorkLocationCode(e.target.value)} placeholder="Location code" style={{ flex: '1 1 120px' }} />
                  <input value={newWorkLocationMapLink} onChange={(e) => setNewWorkLocationMapLink(e.target.value)} placeholder="Google map link" style={{ flex: '1 1 220px' }} />
                  <button onClick={() => handleQuickSave(async () => {
                    await saveWorkLocation({ locationName: newWorkLocationName, locationCode: newWorkLocationCode, map_link: newWorkLocationMapLink || null, activated: 1 }).unwrap();
                    setNewWorkLocationName(''); setNewWorkLocationCode(''); setNewWorkLocationMapLink('');
                  })}>Add</button>
                </div>
                <div className="master-list-master-data">
                  {workLocations.map((w) => (
                    <div key={w.id} className="master-row-master-data">
                      <div style={{ flex: 1 }}>
                        <span className="master-label-master-data">{w.locationName}</span>
                        <span style={{ marginLeft: 8, fontSize: '0.82em', color: '#555' }}>[{w.locationCode || '-'}] {w.latitude && w.longitude ? `${w.latitude}, ${w.longitude}` : 'No geo set'}</span>
                      </div>
                      <div className="master-actions-master-data">
                        <button className="action-btn-master-data neutral-master-data" onClick={() => openEditModal('workLocation', w)}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMasterModule === 'maintenanceCategories' && (
              <div className="vehicle-admin-card-master-data">
                <h3>Maintenance Categories</h3>
                <div className="inline-form-master-data">
                  <input value={newMaintenanceCategory} onChange={(e) => setNewMaintenanceCategory(e.target.value)} placeholder="New maintenance category" />
                  <button onClick={() => handleQuickSave(async () => {
                    await saveMaintenanceCategory({ category: newMaintenanceCategory, activated: 1 }).unwrap();
                    setNewMaintenanceCategory('');
                  })}>Add</button>
                </div>
                <div className="master-list-master-data">
                  {maintenanceCategories.map((c) => (
                    <div key={c.id} className="master-row-master-data">
                      <span className="master-label-master-data">{c.category}</span>
                      <div className="master-actions-master-data">
                        <button className="action-btn-master-data neutral-master-data" onClick={() => openEditModal('maintenanceCategory', c)}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMasterModule === 'maintenanceDescriptions' && (
              <div className="vehicle-admin-card-master-data">
                <h3>Maintenance Descriptions</h3>
                <div className="inline-form-master-data">
                  <input value={newMaintenanceDescription} onChange={(e) => setNewMaintenanceDescription(e.target.value)} placeholder="New description" />
                  <button onClick={() => handleQuickSave(async () => {
                    await saveMaintenanceDescription({ description: newMaintenanceDescription, activated: 1 }).unwrap();
                    setNewMaintenanceDescription('');
                  })}>Add</button>
                </div>
                <div className="master-list-master-data">
                  {maintenanceDescriptions.map((c) => (
                    <div key={c.id} className="master-row-master-data">
                      <span className="master-label-master-data">{c.description}</span>
                      <div className="master-actions-master-data">
                        <button className="action-btn-master-data neutral-master-data" onClick={() => openEditModal('maintenanceDescription', c)}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="vehicle-admin-card-master-data">
          <h3>Vehicle Registry</h3>
          <p className="vehicle-admin-note-master-data">Vehicle creation and assignment are maintained in Fleet Update.</p>

          <div className="vehicle-table-wrap-master-data">
            <table className="vehicle-table-master-data">
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
                      <span className={v.activated === 1 ? 'status-chip-master-data active-master-data' : 'status-chip-master-data inactive-master-data'}>
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
        <div className="vehicle-admin-card-master-data">
          <h3>Pending Maintenance Approvals ({pendingMaintenance.length})</h3>
          <div className="vehicle-table-wrap-master-data">
            <table className="vehicle-table-master-data">
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
                        <div className="actions-master-data">
                          <button className="action-btn-master-data approve-master-data" onClick={() => handleQuickSave(async () => decideMaintenance({ id: m.id, approval: 'a' }).unwrap())}>Approve</button>
                          <button className="action-btn-master-data danger-master-data" onClick={() => handleQuickSave(async () => decideMaintenance({ id: m.id, approval: 'd' }).unwrap())}>Decline</button>
                        </div>
                      ) : (
                        <span className={m.approval === 'a' ? 'status-chip-master-data approved-master-data' : 'status-chip-master-data declined-master-data'}>
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
        <div className="update-popup-overlay-master-data">
          <div className="update-popup-card-master-data">
            <h3>Edit {editModal.type}</h3>
            {editModal.type === 'vehicleCategory' && (
              <input
                className="master-edit-input-master-data"
                value={modalDraft.category || ''}
                onChange={(e) => setModalDraft((p) => ({ ...p, category: e.target.value }))}
                placeholder="Category"
              />
            )}
            {editModal.type === 'maintenanceCategory' && (
              <input
                className="master-edit-input-master-data"
                value={modalDraft.category || ''}
                onChange={(e) => setModalDraft((p) => ({ ...p, category: e.target.value }))}
                placeholder="Category"
              />
            )}
            {editModal.type === 'vehicleMake' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  className="master-edit-input-master-data"
                  value={modalDraft.vehicle_category_id || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, vehicle_category_id: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {masterVehicleCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.category}</option>
                  ))}
                </select>
                <input
                  className="master-edit-input-master-data"
                  value={modalDraft.make || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, make: e.target.value }))}
                  placeholder="Make"
                />
              </div>
            )}
            {editModal.type === 'vehicleModel' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  className="master-edit-input-master-data"
                  value={modalDraft.vehicle_category_id || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, vehicle_category_id: e.target.value, vehicle_make_id: '' }))}
                >
                  <option value="">Select category</option>
                  {masterVehicleCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.category}</option>
                  ))}
                </select>
                <select
                  className="master-edit-input-master-data"
                  value={modalDraft.vehicle_make_id || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, vehicle_make_id: e.target.value }))}
                >
                  <option value="">Select make</option>
                  {modalVehicleModelMakes.map((m) => (
                    <option key={m.id} value={m.id}>{m.make}</option>
                  ))}
                </select>
                <input
                  className="master-edit-input-master-data"
                  value={modalDraft.model || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, model: e.target.value }))}
                  placeholder="Model"
                />
              </div>
            )}
            {editModal.type === 'maintenanceDescription' && (
              <input
                className="master-edit-input-master-data"
                value={modalDraft.description || ''}
                onChange={(e) => setModalDraft((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description"
              />
            )}
            {editModal.type === 'fuel' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="master-edit-input-master-data"
                  value={modalDraft.category || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Fuel type name"
                />
                <input
                  type="number"
                  className="master-edit-input-master-data"
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
                  className="master-edit-input-master-data"
                  value={modalDraft.wing || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, wing: e.target.value }))}
                  placeholder="Wing name"
                />
                <input
                  className="master-edit-input-master-data"
                  value={modalDraft.wingsCode || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, wingsCode: e.target.value }))}
                  placeholder="Wing code"
                />
                <select
                  className="master-edit-input-master-data"
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
            {editModal.type === 'workLocation' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="master-edit-input-master-data"
                  value={modalDraft.locationName || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, locationName: e.target.value }))}
                  placeholder="Location name"
                />
                <input
                  className="master-edit-input-master-data"
                  value={modalDraft.locationCode || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, locationCode: e.target.value }))}
                  placeholder="Location code"
                />
                <input
                  className="master-edit-input-master-data"
                  value={modalDraft.map_link || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, map_link: e.target.value }))}
                  placeholder="Google map link"
                />
              </div>
            )}
            <div className="update-popup-actions-master-data">
              <button className="btn-search-master-data" onClick={closeEditModal}>Cancel</button>
              <button className="btn-submit-master-data" onClick={saveEditModal}>Save</button>
            </div>
          </div>
        </div>
      )}
      {addModal && (
        <div className="update-popup-overlay-master-data">
          <div className="update-popup-card-master-data">
            <h3>
              {addModal === 'vehicleCategory' ? 'Add Category' : addModal === 'vehicleMake' ? 'Add Make' : 'Add Model'}
            </h3>
            {addModal === 'vehicleCategory' && (
              <input
                className="master-edit-input-master-data"
                value={addDraft.category || ''}
                onChange={(e) => setAddDraft((p) => ({ ...p, category: e.target.value }))}
                placeholder="Category"
              />
            )}
            {addModal === 'vehicleMake' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  className="master-edit-input-master-data"
                  value={addDraft.vehicle_category_id || ''}
                  onChange={(e) => setAddDraft((p) => ({ ...p, vehicle_category_id: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {masterVehicleCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.category}</option>
                  ))}
                </select>
                <input
                  className="master-edit-input-master-data"
                  value={addDraft.make || ''}
                  onChange={(e) => setAddDraft((p) => ({ ...p, make: e.target.value }))}
                  placeholder="Make"
                />
              </div>
            )}
            {addModal === 'vehicleModel' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  className="master-edit-input-master-data"
                  value={addDraft.vehicle_category_id || ''}
                  onChange={(e) => setAddDraft((p) => ({ ...p, vehicle_category_id: e.target.value, vehicle_make_id: '' }))}
                >
                  <option value="">Select category</option>
                  {masterVehicleCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.category}</option>
                  ))}
                </select>
                <select
                  className="master-edit-input-master-data"
                  value={addDraft.vehicle_make_id || ''}
                  onChange={(e) => setAddDraft((p) => ({ ...p, vehicle_make_id: e.target.value }))}
                >
                  <option value="">Select make</option>
                  {addModalModelMakes.map((m) => (
                    <option key={m.id} value={m.id}>{m.make}</option>
                  ))}
                </select>
                <input
                  className="master-edit-input-master-data"
                  value={addDraft.model || ''}
                  onChange={(e) => setAddDraft((p) => ({ ...p, model: e.target.value }))}
                  placeholder="Model"
                />
              </div>
            )}
            <div className="update-popup-actions-master-data">
              <button className="btn-search-master-data" onClick={closeAddModal}>Cancel</button>
              <button className="btn-submit-master-data" onClick={saveAddModal}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
