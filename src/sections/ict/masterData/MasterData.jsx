import React, { useEffect, useMemo, useState } from 'react';
import {
  useGetVehicleAppSummaryQuery,
  useGetVehicleAppVehiclesQuery,
  useGetVehicleAppDriversQuery,
  useGetVehicleAppVehicleCategoriesQuery,
  useSaveVehicleAppVehicleCategoryMutation,
  useGetVehicleAppMaintenanceCategoriesQuery,
  useSaveVehicleAppMaintenanceCategoryMutation,
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
import {
  useGetSecurityCodeListQuery,
  useResetSecurityCodeMutation,
} from '../../../api/services NodeJs/financialCardsApi';
import {
  useGetMissionPartialReasonsQuery,
  useSaveMissionPartialReasonMutation,
  useGetNotSprayingRecensQuery,
  useSaveNotSprayingRecenMutation,
  useGetDeactivateReasonsQuery,
  useSaveDeactivateReasonMutation,
} from '../../../api/services NodeJs/reasonsApi';
import { useSendMessageMutation } from '../../../api/services/authApi';
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
  const [activeReasonsTab, setActiveReasonsTab] = useState('pilotOps');
  const [reasonSearch, setReasonSearch] = useState('');
  const [reasonFlagFilter, setReasonFlagFilter] = useState('all');

  const { data: summary = {} } = useGetVehicleAppSummaryQuery(yearMonth);
  const { data: vehicles = [] } = useGetVehicleAppVehiclesQuery();
  const { data: drivers = [] } = useGetVehicleAppDriversQuery();
  const { data: vehicleCategories = [] } = useGetVehicleAppVehicleCategoriesQuery();
  const { data: maintenanceCategories = [] } = useGetVehicleAppMaintenanceCategoriesQuery();
  const { data: maintenanceRequests = [] } = useGetVehicleAppMaintenanceRequestsQuery(yearMonth);
  const { data: fuelCategories = [], refetch: refetchFuelCategories } = useGetFuelCategoriesQuery();
  const { data: wingsData, refetch: refetchWings } = useGetWingsQuery();
  const { data: legacyWingsData } = useGetLegacyWingsQuery();
  const { data: employeesData } = useGetAllEmployeeRegistrationsQuery();
  const { data: workLocationsData, refetch: refetchWorkLocations } = useGetWorkLocationsQuery();
  const { data: masterVehicleCategoriesData = [], refetch: refetchMasterVehicleCategories } = useGetMasterVehicleCategoriesQuery();
  const { data: masterVehicleMakesData = [], refetch: refetchMasterVehicleMakes } = useGetMasterVehicleMakesQuery();
  const { data: masterVehicleModelsData = [], refetch: refetchMasterVehicleModels } = useGetMasterVehicleModelsQuery();
  const { data: missionPartialReasons = [] } = useGetMissionPartialReasonsQuery({ include_inactive: true });
  const { data: notSprayingRecens = [] } = useGetNotSprayingRecensQuery({ include_inactive: true });
  const { data: deactivateReasons = [] } = useGetDeactivateReasonsQuery({ include_inactive: true });
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
  const [decideMaintenance] = useDecideVehicleAppMaintenanceRequestMutation();
  const [saveFuelCategory] = useSaveFuelCategoryMutation();
  const [saveWing] = useSaveWingMutation();
  const [saveWorkLocation] = useSaveWorkLocationMutation();
  const [saveMasterVehicleCategory] = useSaveMasterVehicleCategoryMutation();
  const [saveMasterVehicleMake] = useSaveMasterVehicleMakeMutation();
  const [saveMasterVehicleModel] = useSaveMasterVehicleModelMutation();
  const { data: securityCodeItems = [], refetch: refetchSecurityCodeItems } = useGetSecurityCodeListQuery();
  const [resetSecurityCode, { isLoading: resettingFinanceSecurity }] = useResetSecurityCodeMutation();
  const [sendMessage] = useSendMessageMutation();
  const [saveMissionPartialReason] = useSaveMissionPartialReasonMutation();
  const [saveNotSprayingRecen] = useSaveNotSprayingRecenMutation();
  const [saveDeactivateReason] = useSaveDeactivateReasonMutation();

  const [newMaintenanceCategory, setNewMaintenanceCategory] = useState('');

  const [newFuelCategory, setNewFuelCategory] = useState('');
  const [newFuelUnitPrice, setNewFuelUnitPrice] = useState('');
  const [newWingName, setNewWingName] = useState('');
  const [newWingCode, setNewWingCode] = useState('');
  const [newWingHod, setNewWingHod] = useState('');
  const [newWorkLocationName, setNewWorkLocationName] = useState('');
  const [newWorkLocationCode, setNewWorkLocationCode] = useState('');
  const [newWorkLocationMapLink, setNewWorkLocationMapLink] = useState('');
  const [reasonAddModalType, setReasonAddModalType] = useState(null);
  const [reasonAddDraft, setReasonAddDraft] = useState({});
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
  useEffect(() => {
    setReasonFlagFilter('all');
    setReasonSearch('');
  }, [activeReasonsTab]);

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
  const filteredPilotOpsReasons = useMemo(() => {
    const q = reasonSearch.trim().toLowerCase();
    return (missionPartialReasons || []).filter((row) => {
      const matchSearch = !q || String(row.reason || '').toLowerCase().includes(q);
      const matchFlag = reasonFlagFilter === 'all' || String(row.flag || '') === reasonFlagFilter;
      return matchSearch && matchFlag;
    });
  }, [missionPartialReasons, reasonSearch, reasonFlagFilter]);
  const filteredManagerReasons = useMemo(() => {
    const q = reasonSearch.trim().toLowerCase();
    return (notSprayingRecens || []).filter((row) => {
      const matchSearch = !q || String(row.recen || '').toLowerCase().includes(q);
      const matchFlag = reasonFlagFilter === 'all' || String(row.flag || '') === reasonFlagFilter;
      return matchSearch && matchFlag;
    });
  }, [notSprayingRecens, reasonSearch, reasonFlagFilter]);
  const filteredDeactivateReasons = useMemo(() => {
    const q = reasonSearch.trim().toLowerCase();
    return (deactivateReasons || []).filter((row) => (
      !q || String(row.reason || '').toLowerCase().includes(q)
    ));
  }, [deactivateReasons, reasonSearch]);

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
    if (type === 'fuel') setModalDraft({ category: item.category || '', unit_price: item.unit_price != null ? String(item.unit_price) : '' });
    if (type === 'wing') setModalDraft({ wing: item.wing || '', wingsCode: item.wingsCode || '', hod: item.hod ? String(item.hod) : '' });
    if (type === 'workLocation') {
      setModalDraft({
        locationName: item.locationName || '',
        locationCode: item.locationCode || '',
        map_link: item.map_link || '',
      });
    }
    if (type === 'missionPartialReason') setModalDraft({ reason: item.reason || '', flag: item.flag || 'c', chargeble: String(Number(item.chargeble) === 1 ? 1 : 0) });
    if (type === 'notSprayingRecen') setModalDraft({ recen: item.recen || '', flag: item.flag || 'c' });
    if (type === 'deactivateReason') setModalDraft({ reason: item.reason || '' });
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

  const openReasonAddModal = (type) => {
    setReasonAddModalType(type);
    if (type === 'missionPartialReason') setReasonAddDraft({ reason: '', flag: 'c', chargeble: '0' });
    if (type === 'notSprayingRecen') setReasonAddDraft({ recen: '', flag: 'c' });
    if (type === 'deactivateReason') setReasonAddDraft({ reason: '' });
  };

  const closeReasonAddModal = () => {
    setReasonAddModalType(null);
    setReasonAddDraft({});
  };

  const saveReasonAddModal = async () => {
    if (!reasonAddModalType) return;
    await handleQuickSave(async () => {
      if (reasonAddModalType === 'missionPartialReason') {
        await saveMissionPartialReason({
          reason: reasonAddDraft.reason,
          flag: reasonAddDraft.flag,
          chargeble: Number(reasonAddDraft.chargeble) === 1 ? 1 : 0,
          activated: 1,
        }).unwrap();
      } else if (reasonAddModalType === 'notSprayingRecen') {
        await saveNotSprayingRecen({
          recen: reasonAddDraft.recen,
          flag: reasonAddDraft.flag,
          activated: 1,
        }).unwrap();
      } else if (reasonAddModalType === 'deactivateReason') {
        await saveDeactivateReason({
          reason: reasonAddDraft.reason,
          activated: 1,
        }).unwrap();
      }
      closeReasonAddModal();
    });
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
      } else if (editModal.type === 'missionPartialReason') {
        await saveMissionPartialReason({
          id: editModal.item.id,
          reason: modalDraft.reason,
          flag: modalDraft.flag,
          chargeble: Number(modalDraft.chargeble) === 1 ? 1 : 0,
          activated: editModal.item.activated ?? 1,
        }).unwrap();
      } else if (editModal.type === 'notSprayingRecen') {
        await saveNotSprayingRecen({
          id: editModal.item.id,
          recen: modalDraft.recen,
          flag: modalDraft.flag,
          activated: editModal.item.activated ?? 1,
        }).unwrap();
      } else if (editModal.type === 'deactivateReason') {
        await saveDeactivateReason({
          id: editModal.item.id,
          reason: modalDraft.reason,
          activated: editModal.item.activated ?? 1,
        }).unwrap();
      }
      closeEditModal();
    });
  };

  return (
    <div
      className={`vehicle-admin-page-master-data ${mode === 'masters' ? 'vehicle-admin-page-master-data--split-scroll' : ''}`}
    >
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
          className="master-data-flash-banner-master-data"
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
              { key: 'reasons', label: 'Reasons' },
              { key: 'securityCodes', label: 'Security Codes' },
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

            {selectedMasterModule === 'reasons' && (
              <div className="vehicle-admin-card-master-data">
                <h3>Reasons</h3>
                <div className="vehicle-admin-tabs-master-data" style={{ marginTop: 0 }}>
                  <button
                    type="button"
                    className={activeReasonsTab === 'pilotOps' ? 'active-master-data' : ''}
                    onClick={() => setActiveReasonsTab('pilotOps')}
                  >
                    Pilot/OpsRoom Reasons
                  </button>
                  <button
                    type="button"
                    className={activeReasonsTab === 'manager' ? 'active-master-data' : ''}
                    onClick={() => setActiveReasonsTab('manager')}
                  >
                    Manager Reasons
                  </button>
                  <button
                    type="button"
                    className={activeReasonsTab === 'deactivate' ? 'active-master-data' : ''}
                    onClick={() => setActiveReasonsTab('deactivate')}
                  >
                    Deactivate Reasons
                  </button>
                </div>

                {activeReasonsTab === 'pilotOps' && (
                  <>
                    <div className="inline-form-master-data reasons-toolbar-master-data">
                      <div className="reasons-toolbar-left-master-data">
                        <input
                          className="reasons-search-master-data"
                          value={reasonSearch}
                          onChange={(e) => setReasonSearch(e.target.value)}
                          placeholder="Search reason"
                        />
                        <select
                          className="reasons-filter-master-data"
                          value={reasonFlagFilter}
                          onChange={(e) => setReasonFlagFilter(e.target.value)}
                        >
                          <option value="all">All Flags</option>
                          <option value="h">Partially (h)</option>
                          <option value="c">Cancel (c)</option>
                        </select>
                      </div>
                      <button type="button" className="btn-submit-master-data reasons-add-btn-master-data" onClick={() => openReasonAddModal('missionPartialReason')}>
                        Add Pilot/OpsRoom Reason
                      </button>
                    </div>

                    <div className="master-list-master-data">
                      {filteredPilotOpsReasons.map((row) => (
                        <div key={row.id} className="master-row-master-data">
                          <div style={{ flex: 1 }}>
                            <span className="master-label-master-data">{row.reason}</span>
                            <span style={{ marginLeft: 8, fontSize: '0.82em', color: '#555' }}>
                              Flag: {row.flag === 'h' ? 'Partially (h)' : 'Cancel (c)'}
                            </span>
                            <span style={{ marginLeft: 8, fontSize: '0.82em', color: '#555' }}>
                              Chargeble: {Number(row.chargeble) === 1 ? 'Yes' : 'No'}
                            </span>
                            <div style={{ marginTop: 4, fontSize: '0.82em', color: '#555' }}>
                              Added By: {row.added_by_name || row.added_by || '-'} | Updated By:{' '}
                              {row.updated_by_name || row.updated_by || '-'}
                            </div>
                          </div>
                          <div className="master-actions-master-data" style={{ flexWrap: 'wrap' }}>
                            <span
                              className={
                                Number(row.activated) === 1
                                  ? 'status-chip-master-data active-master-data'
                                  : 'status-chip-master-data inactive-master-data'
                              }
                            >
                              {Number(row.activated) === 1 ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              type="button"
                              className="action-btn-master-data neutral-master-data"
                              onClick={() => openEditModal('missionPartialReason', row)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn-master-data"
                              style={{ background: Number(row.activated) === 1 ? '#dc2626' : '#16a34a' }}
                              onClick={() =>
                                handleQuickSave(async () => {
                                  await saveMissionPartialReason({
                                    id: row.id,
                                    reason: row.reason,
                                    flag: row.flag,
                                    chargeble: Number(row.chargeble) === 1 ? 1 : 0,
                                    activated: Number(row.activated) === 1 ? 0 : 1,
                                  }).unwrap();
                                })
                              }
                            >
                              {Number(row.activated) === 1 ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeReasonsTab === 'manager' && (
                  <>
                    <div className="inline-form-master-data reasons-toolbar-master-data">
                      <div className="reasons-toolbar-left-master-data">
                        <input
                          className="reasons-search-master-data"
                          value={reasonSearch}
                          onChange={(e) => setReasonSearch(e.target.value)}
                          placeholder="Search reason"
                        />
                        <select
                          className="reasons-filter-master-data"
                          value={reasonFlagFilter}
                          onChange={(e) => setReasonFlagFilter(e.target.value)}
                        >
                          <option value="all">All Flags</option>
                          <option value="c">Cancel (c)</option>
                          <option value="r">Reschedule (r)</option>
                          <option value="rm">Remove (rm)</option>
                        </select>
                      </div>
                      <button type="button" className="btn-submit-master-data reasons-add-btn-master-data" onClick={() => openReasonAddModal('notSprayingRecen')}>
                        Add Manager Reason
                      </button>
                    </div>

                    <div className="master-list-master-data">
                      {filteredManagerReasons.map((row) => (
                        <div key={row.id} className="master-row-master-data">
                          <div style={{ flex: 1 }}>
                            <span className="master-label-master-data">{row.recen}</span>
                            <span style={{ marginLeft: 8, fontSize: '0.82em', color: '#555' }}>
                              Flag:{' '}
                              {row.flag === 'r'
                                ? 'Reschedule (r)'
                                : row.flag === 'rm'
                                  ? 'Remove (rm)'
                                  : 'Cancel (c)'}
                            </span>
                            <div style={{ marginTop: 4, fontSize: '0.82em', color: '#555' }}>
                              Added By: {row.added_by_name || row.added_by || '-'} | Updated By:{' '}
                              {row.updated_by_name || row.updated_by || '-'}
                            </div>
                          </div>
                          <div className="master-actions-master-data" style={{ flexWrap: 'wrap' }}>
                            <span
                              className={
                                Number(row.activated) === 1
                                  ? 'status-chip-master-data active-master-data'
                                  : 'status-chip-master-data inactive-master-data'
                              }
                            >
                              {Number(row.activated) === 1 ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              type="button"
                              className="action-btn-master-data neutral-master-data"
                              onClick={() => openEditModal('notSprayingRecen', row)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn-master-data"
                              style={{ background: Number(row.activated) === 1 ? '#dc2626' : '#16a34a' }}
                              onClick={() =>
                                handleQuickSave(async () => {
                                  await saveNotSprayingRecen({
                                    id: row.id,
                                    recen: row.recen,
                                    flag: row.flag,
                                    activated: Number(row.activated) === 1 ? 0 : 1,
                                  }).unwrap();
                                })
                              }
                            >
                              {Number(row.activated) === 1 ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeReasonsTab === 'deactivate' && (
                  <>
                    <div className="inline-form-master-data reasons-toolbar-master-data">
                      <div className="reasons-toolbar-left-master-data">
                        <input
                          className="reasons-search-master-data"
                          value={reasonSearch}
                          onChange={(e) => setReasonSearch(e.target.value)}
                          placeholder="Search reason"
                        />
                      </div>
                      <button type="button" className="btn-submit-master-data reasons-add-btn-master-data" onClick={() => openReasonAddModal('deactivateReason')}>
                        Add Deactivate Reason
                      </button>
                    </div>

                    <div className="master-list-master-data">
                      {filteredDeactivateReasons.map((row) => (
                        <div key={row.id} className="master-row-master-data">
                          <div style={{ flex: 1 }}>
                            <span className="master-label-master-data">{row.reason}</span>
                            <div style={{ marginTop: 4, fontSize: '0.82em', color: '#555' }}>
                              Added By: {row.added_by_name || row.added_by || '-'} | Updated By:{' '}
                              {row.updated_by_name || row.updated_by || '-'}
                            </div>
                          </div>
                          <div className="master-actions-master-data" style={{ flexWrap: 'wrap' }}>
                            <span
                              className={
                                Number(row.activated) === 1
                                  ? 'status-chip-master-data active-master-data'
                                  : 'status-chip-master-data inactive-master-data'
                              }
                            >
                              {Number(row.activated) === 1 ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              type="button"
                              className="action-btn-master-data neutral-master-data"
                              onClick={() => openEditModal('deactivateReason', row)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn-master-data"
                              style={{ background: Number(row.activated) === 1 ? '#dc2626' : '#16a34a' }}
                              onClick={() =>
                                handleQuickSave(async () => {
                                  await saveDeactivateReason({
                                    id: row.id,
                                    reason: row.reason,
                                    activated: Number(row.activated) === 1 ? 0 : 1,
                                  }).unwrap();
                                })
                              }
                            >
                              {Number(row.activated) === 1 ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedMasterModule === 'securityCodes' && (
              <div className="vehicle-admin-card-master-data">
                <h3>Security Codes</h3>
                <p className="vehicle-admin-note-master-data">
                  Current code is hidden for security. Any existing security code item can be reset to a new auto-generated 4-digit value.
                </p>
                <div className="master-list-master-data">
                  {securityCodeItems.length === 0 ? (
                    <div className="master-row-master-data">
                      <span style={{ color: '#666' }}>No security code items found.</span>
                    </div>
                  ) : securityCodeItems.map((item) => (
                    <div key={item.id} className="master-row-master-data">
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <span className="master-label-master-data">
                          {item.section || '-'} / {item.sec_tag || '-'}
                        </span>
                        <div style={{ marginTop: 4, fontSize: '0.82em', color: '#555' }}>
                          Code: {item.current_code || 'Not set'} | Last Changed By:{' '}
                          {item.last_changed_by_name
                            ? `${item.last_changed_by_name}${item.last_changed_by_mobile_masked ? ` (${item.last_changed_by_mobile_masked})` : ''}`
                            : 'Not available'}
                          {' '}| Last Changed At:{' '}
                          {item.last_changed_at ? new Date(item.last_changed_at).toLocaleString() : 'Not available'}
                        </div>
                      </div>
                      <button
                        className="btn-submit-master-data"
                        disabled={resettingFinanceSecurity}
                        onClick={async () => {
                          try {
                            const payload = await resetSecurityCode({ id: item.id }).unwrap();
                            const smsMobile = String(payload?.mobile_no || '').trim();
                            const otp = String(payload?.otp_code || '').trim();
                            if (!smsMobile || !otp) {
                              throw new Error('Unable to send OTP. Missing mobile number or generated code.');
                            }
                            const codeLabel = `${item.section || '-'} / ${item.sec_tag || '-'}`;
                            await sendMessage({
                              mobile_no: smsMobile,
                              content: `Your DSMS security code for ${codeLabel} is: ${otp}. Do not share this code with anyone.`,
                            }).unwrap();
                            await refetchSecurityCodeItems();
                            setQuickMessage({
                              type: 'success',
                              text: `Security code reset for ${item.section || '-'} / ${item.sec_tag || '-'} and message sent to ${payload?.changed_by_mobile_masked || 'your mobile'}.`,
                            });
                          } catch (error) {
                            setQuickMessage({
                              type: 'error',
                              text: error?.data?.message || error?.message || 'Security code reset failed',
                            });
                          }
                        }}
                      >
                        {resettingFinanceSecurity ? 'Resetting...' : 'Reset & Send OTP'}
                      </button>
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
            {editModal.type === 'missionPartialReason' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="master-edit-input-master-data"
                  value={modalDraft.reason || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="Reason"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Reason Type</label>
                    <select
                      className="master-edit-input-master-data"
                      value={modalDraft.flag || 'c'}
                      onChange={(e) => setModalDraft((p) => ({ ...p, flag: e.target.value }))}
                    >
                      <option value="c">Cancel (c)</option>
                      <option value="h">Partially Completed (h)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Chargeable?</label>
                    <select
                      className="master-edit-input-master-data"
                      value={modalDraft.chargeble || '0'}
                      onChange={(e) => setModalDraft((p) => ({ ...p, chargeble: e.target.value }))}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {editModal.type === 'notSprayingRecen' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="master-edit-input-master-data"
                  value={modalDraft.recen || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, recen: e.target.value }))}
                  placeholder="Reason"
                />
                <select
                  className="master-edit-input-master-data"
                  value={modalDraft.flag || 'c'}
                  onChange={(e) => setModalDraft((p) => ({ ...p, flag: e.target.value }))}
                >
                  <option value="c">Cancel (c)</option>
                  <option value="r">Reschedule (r)</option>
                  <option value="rm">Remove (rm)</option>
                </select>
              </div>
            )}
            {editModal.type === 'deactivateReason' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="master-edit-input-master-data"
                  value={modalDraft.reason || ''}
                  onChange={(e) => setModalDraft((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="Deactivate reason"
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
      {reasonAddModalType && (
        <div className="update-popup-overlay-master-data">
          <div className="update-popup-card-master-data">
            <h3>
              {reasonAddModalType === 'missionPartialReason'
                ? 'Add Pilot/OpsRoom Reason'
                : reasonAddModalType === 'notSprayingRecen'
                  ? 'Add Manager Reason'
                  : 'Add Deactivate Reason'}
            </h3>
            {reasonAddModalType === 'missionPartialReason' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="master-edit-input-master-data"
                  value={reasonAddDraft.reason || ''}
                  onChange={(e) => setReasonAddDraft((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="Reason text"
                />
                <select
                  className="master-edit-input-master-data"
                  value={reasonAddDraft.flag || 'c'}
                  onChange={(e) => setReasonAddDraft((p) => ({ ...p, flag: e.target.value }))}
                >
                  <option value="c">Cancel (c)</option>
                  <option value="h">Partially Completed (h)</option>
                </select>
                <select
                  className="master-edit-input-master-data"
                  value={reasonAddDraft.chargeble || '0'}
                  onChange={(e) => setReasonAddDraft((p) => ({ ...p, chargeble: e.target.value }))}
                >
                  <option value="0">Chargeable: No</option>
                  <option value="1">Chargeable: Yes</option>
                </select>
              </div>
            )}
            {reasonAddModalType === 'notSprayingRecen' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="master-edit-input-master-data"
                  value={reasonAddDraft.recen || ''}
                  onChange={(e) => setReasonAddDraft((p) => ({ ...p, recen: e.target.value }))}
                  placeholder="Reason text"
                />
                <select
                  className="master-edit-input-master-data"
                  value={reasonAddDraft.flag || 'c'}
                  onChange={(e) => setReasonAddDraft((p) => ({ ...p, flag: e.target.value }))}
                >
                  <option value="c">Cancel (c)</option>
                  <option value="r">Reschedule (r)</option>
                  <option value="rm">Remove (rm)</option>
                </select>
              </div>
            )}
            {reasonAddModalType === 'deactivateReason' && (
              <input
                className="master-edit-input-master-data"
                value={reasonAddDraft.reason || ''}
                onChange={(e) => setReasonAddDraft((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Deactivate reason"
              />
            )}
            <div className="update-popup-actions-master-data">
              <button className="btn-search-master-data" onClick={closeReasonAddModal}>Cancel</button>
              <button className="btn-submit-master-data" onClick={saveReasonAddModal}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
