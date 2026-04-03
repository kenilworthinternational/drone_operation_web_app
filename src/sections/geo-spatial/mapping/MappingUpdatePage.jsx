import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMapMarkedAlt, FaPlus, FaEdit, FaSave, FaTimes, FaToggleOn, FaToggleOff,
  FaSearch, FaChevronRight, FaChevronDown, FaLayerGroup, FaSeedling,
  FaGlobeAmericas, FaBuilding, FaProjectDiagram, FaLeaf, FaCheckCircle,
  FaTimesCircle, FaSpinner, FaInbox, FaCubes, FaFileExcel
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import '../../../styles/mappingUpdatePage.css';
import {
  useGetMappingGroupsQuery,
  useGetMappingPlantationsByGroupQuery,
  useGetMappingRegionsByPlantationQuery,
  useGetMappingEstatesByRegionQuery,
  useGetMappingDivisionsByEstateQuery,
  useGetMappingFieldsByDivisionQuery,
  useGetMappingMissionPartialReasonsQuery,
  useCreateMappingGroupMutation,
  useCreateMappingPlantationMutation,
  useCreateMappingRegionMutation,
  useCreateMappingEstateMutation,
  useCreateMappingDivisionMutation,
  useCreateMappingFieldMutation,
  useUpdateMappingFieldMutation,
  useToggleMappingGroupActivationMutation,
  useToggleMappingPlantationActivationMutation,
  useToggleMappingRegionActivationMutation,
  useToggleMappingEstateActivationMutation,
  useSetMappingEstateFinalizedMutation,
  useToggleMappingDivisionActivationMutation,
  useToggleMappingFieldActivationMutation,
  useLazyGetMappingAllFieldsReportQuery,
} from '../../../api/services NodeJs/mappingHierarchyApi';

const HIERARCHY_LEVELS = [
  { key: 'group', label: 'Group', icon: FaLayerGroup, nameField: 'group' },
  { key: 'plantation', label: 'Plantation', icon: FaSeedling, nameField: 'plantation' },
  { key: 'region', label: 'Region', icon: FaGlobeAmericas, nameField: 'region' },
  { key: 'estate', label: 'Estate', icon: FaBuilding, nameField: 'estate' },
  { key: 'division', label: 'Division', icon: FaProjectDiagram, nameField: 'division' },
];

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="loading-map-update">
    <FaSpinner className="spinner-icon-map-update" />
    <span>{text}</span>
  </div>
);

const EmptyState = ({ icon: Icon = FaInbox, title, description }) => (
  <div className="empty-state-map-update">
    <Icon className="empty-icon-map-update" />
    <p className="empty-title-map-update">{title}</p>
    {description && <p className="empty-desc-map-update">{description}</p>}
  </div>
);

const StatusBadge = ({ active, label }) => (
  <span className={`badge-map-update ${active ? 'badge-active-map-update' : 'badge-inactive-map-update'}`}>
    {active ? <FaCheckCircle /> : <FaTimesCircle />}
    {label || (active ? 'Active' : 'Inactive')}
  </span>
);

const YesNoBadge = ({ value, reason }) => (
  <span className={`yn-badge-map-update ${value ? 'yn-yes-map-update' : 'yn-no-map-update'}`}>
    {value ? 'Yes' : 'No'}
    {!value && reason && (
      <span className="yn-tooltip-map-update">{reason}</span>
    )}
  </span>
);

const MappingUpdatePage = () => {
  const navigate = useNavigate();

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPlantation, setSelectedPlantation] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedEstate, setSelectedEstate] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);

  const [fields, setFields] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newItem, setNewItem] = useState({});
  const [activeCreateLevel, setActiveCreateLevel] = useState(null);
  const [estateContextMenu, setEstateContextMenu] = useState(null);
  const [estateMenuPosition, setEstateMenuPosition] = useState({ left: 0, top: 0 });
  const estateMenuRef = useRef(null);

  const [expandedLevels, setExpandedLevels] = useState({ group: true });

  const { data: groupsResponse = [], isLoading: groupsLoading } = useGetMappingGroupsQuery();
  const { data: plantationsResponse = [], isLoading: plantationsLoading } = useGetMappingPlantationsByGroupQuery(selectedGroup, { skip: !selectedGroup });
  const { data: regionsResponse = [], isLoading: regionsLoading } = useGetMappingRegionsByPlantationQuery(selectedPlantation, { skip: !selectedPlantation });
  const { data: estatesResponse = [], isLoading: estatesLoading } = useGetMappingEstatesByRegionQuery(selectedRegion, { skip: !selectedRegion });
  const { data: divisionsResponse = [], isLoading: divisionsLoading } = useGetMappingDivisionsByEstateQuery(selectedEstate, { skip: !selectedEstate });
  const { data: fieldsResponse = [], isLoading: fieldsLoading, refetch: refetchFields } = useGetMappingFieldsByDivisionQuery(selectedDivision, { skip: !selectedDivision });
  const { data: missionReasonsResponse = [] } = useGetMappingMissionPartialReasonsQuery();

  const groups = groupsResponse?.data || [];
  const plantations = plantationsResponse?.data || [];
  const regions = regionsResponse?.data || [];
  const estates = estatesResponse?.data || [];
  const divisions = divisionsResponse?.data || [];
  const fieldsData = fieldsResponse?.data || [];
  const missionReasons = missionReasonsResponse?.data || [];

  const [createGroup] = useCreateMappingGroupMutation();
  const [createPlantation] = useCreateMappingPlantationMutation();
  const [createRegion] = useCreateMappingRegionMutation();
  const [createEstate] = useCreateMappingEstateMutation();
  const [createDivision] = useCreateMappingDivisionMutation();
  const [createField] = useCreateMappingFieldMutation();
  const [updateField] = useUpdateMappingFieldMutation();
  const [toggleFieldActivation] = useToggleMappingFieldActivationMutation();
  const [setEstateFinalized] = useSetMappingEstateFinalizedMutation();
  const [toggleGroupActivation] = useToggleMappingGroupActivationMutation();
  const [togglePlantationActivation] = useToggleMappingPlantationActivationMutation();
  const [toggleRegionActivation] = useToggleMappingRegionActivationMutation();
  const [toggleEstateActivation] = useToggleMappingEstateActivationMutation();
  const [toggleDivisionActivation] = useToggleMappingDivisionActivationMutation();
  const [triggerAllFieldsReport, { isFetching: allFieldsLoading }] = useLazyGetMappingAllFieldsReportQuery();

  useEffect(() => {
    if (selectedDivision) {
      setFields(fieldsData || []);
    } else {
      setFields([]);
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDivision && fieldsData) {
      setFields(fieldsData);
    }
  }, [fieldsData]);

  const selectedNames = useMemo(() => {
    const names = {};
    if (selectedGroup) names.group = groups.find(g => g.id === selectedGroup)?.group;
    if (selectedPlantation) names.plantation = plantations.find(p => p.id === selectedPlantation)?.plantation;
    if (selectedRegion) names.region = regions.find(r => r.id === selectedRegion)?.region;
    if (selectedEstate) names.estate = estates.find(e => e.id === selectedEstate)?.estate;
    if (selectedDivision) names.division = divisions.find(d => d.id === selectedDivision)?.division;
    return names;
  }, [selectedGroup, selectedPlantation, selectedRegion, selectedEstate, selectedDivision, groups, plantations, regions, estates, divisions]);

  const breadcrumbs = useMemo(() => {
    const crumbs = [];
    HIERARCHY_LEVELS.forEach(level => {
      if (selectedNames[level.key]) {
        crumbs.push({ key: level.key, label: level.label, value: selectedNames[level.key], icon: level.icon });
      }
    });
    return crumbs;
  }, [selectedNames]);

  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedPlantation(null);
    setSelectedRegion(null);
    setSelectedEstate(null);
    setSelectedDivision(null);
    setExpandedLevels(prev => ({ ...prev, plantation: true }));
  };

  const handlePlantationSelect = (plantationId) => {
    setSelectedPlantation(plantationId);
    setSelectedRegion(null);
    setSelectedEstate(null);
    setSelectedDivision(null);
    setExpandedLevels(prev => ({ ...prev, region: true }));
  };

  const handleRegionSelect = (regionId) => {
    setSelectedRegion(regionId);
    setSelectedEstate(null);
    setSelectedDivision(null);
    setExpandedLevels(prev => ({ ...prev, estate: true }));
  };

  const handleEstateSelect = (estateId) => {
    setSelectedEstate(estateId);
    setSelectedDivision(null);
    setExpandedLevels(prev => ({ ...prev, division: true }));
  };

  const handleDivisionSelect = (divisionId) => {
    setSelectedDivision(divisionId);
  };

  const selectHandlers = {
    group: handleGroupSelect,
    plantation: handlePlantationSelect,
    region: handleRegionSelect,
    estate: handleEstateSelect,
    division: handleDivisionSelect,
  };

  const handleCreate = async (level) => {
    try {
      let result;
      const createData = { ...newItem };

      if (level === 'plantation') createData.group = selectedGroup;
      if (level === 'region') {
        createData.group = selectedGroup;
        createData.plantation = selectedPlantation;
      }
      if (level === 'estate') {
        createData.group = selectedGroup;
        createData.plantation = selectedPlantation;
        createData.region = selectedRegion;
      }
      if (level === 'division') {
        createData.group = selectedGroup;
        createData.plantation = selectedPlantation;
        createData.region = selectedRegion;
        createData.estate = selectedEstate;
      }
      if (level === 'field') {
        createData.group = selectedGroup;
        createData.plantation = selectedPlantation;
        createData.region = selectedRegion;
        createData.estate = selectedEstate;
        createData.division = selectedDivision;
      }

      switch (level) {
        case 'group':
          result = await createGroup(createData).unwrap();
          break;
        case 'plantation':
          result = await createPlantation(createData).unwrap();
          break;
        case 'region':
          result = await createRegion(createData).unwrap();
          break;
        case 'estate':
          result = await createEstate(createData).unwrap();
          break;
        case 'division':
          result = await createDivision(createData).unwrap();
          break;
        case 'field':
          result = await createField(createData).unwrap();
          refetchFields();
          break;
      }

      if (result.status) {
        toast.success(`${level.charAt(0).toUpperCase() + level.slice(1)} created successfully`);
        setNewItem({});
        setActiveCreateLevel(null);
      } else {
        toast.error(result.message || `Failed to create ${level}`);
      }
    } catch (error) {
      toast.error(`Failed to create ${level}: ${error.message}`);
    }
  };

  const handleFieldEdit = (field) => {
    setEditingField({ ...field });
  };

  const handleFieldSave = async () => {
    try {
      const dataToSave = { ...editingField };
      if (dataToSave.can_spread === 1) dataToSave.can_spread_text = null;
      if (dataToSave.can_spray === 1) dataToSave.can_spray_text = null;
      const result = await updateField(dataToSave).unwrap();
      if (result.status) {
        toast.success('Field updated successfully');
        setEditingField(null);
        refetchFields();
      } else {
        toast.error(result.message || 'Failed to update field');
      }
    } catch (error) {
      toast.error(`Failed to update field: ${error.message}`);
    }
  };

  const handleToggleFieldActivation = async (fieldId) => {
    try {
      const result = await toggleFieldActivation(fieldId).unwrap();
      if (result.status) {
        toast.success(result.message || 'Field status updated successfully');
        refetchFields();
      } else {
        toast.error(result.message || 'Failed to update field status');
      }
    } catch (error) {
      toast.error(`Failed to update field status: ${error.message}`);
    }
  };

  const handleToggleGroupActivation = async (groupId) => {
    try {
      const result = await toggleGroupActivation(groupId).unwrap();
      if (result.status) {
        toast.success(result.message || 'Group status updated successfully');
      } else {
        toast.error(result.message || 'Failed to update group status');
      }
    } catch (error) {
      toast.error(`Failed to update group status: ${error.message}`);
    }
  };

  const handleTogglePlantationActivation = async (plantationId) => {
    try {
      const result = await togglePlantationActivation(plantationId).unwrap();
      if (result.status) {
        toast.success(result.message || 'Plantation status updated successfully');
      } else {
        toast.error(result.message || 'Failed to update plantation status');
      }
    } catch (error) {
      toast.error(`Failed to update plantation status: ${error.message}`);
    }
  };

  const handleToggleRegionActivation = async (regionId) => {
    try {
      const result = await toggleRegionActivation(regionId).unwrap();
      if (result.status) {
        toast.success(result.message || 'Region status updated successfully');
      } else {
        toast.error(result.message || 'Failed to update region status');
      }
    } catch (error) {
      toast.error(`Failed to update region status: ${error.message}`);
    }
  };

  const handleToggleEstateActivation = async (estateId) => {
    try {
      const result = await toggleEstateActivation(estateId).unwrap();
      if (result.status) {
        toast.success(result.message || 'Estate status updated successfully');
      } else {
        toast.error(result.message || 'Failed to update estate status');
      }
    } catch (error) {
      toast.error(`Failed to update estate status: ${error.message}`);
    }
  };

  const handleToggleDivisionActivation = async (divisionId) => {
    try {
      const result = await toggleDivisionActivation(divisionId).unwrap();
      if (result.status) {
        toast.success(result.message || 'Division status updated successfully');
      } else {
        toast.error(result.message || 'Failed to update division status');
      }
    } catch (error) {
      toast.error(`Failed to update division status: ${error.message}`);
    }
  };

  const toggleHandlers = {
    group: handleToggleGroupActivation,
    plantation: handleTogglePlantationActivation,
    region: handleToggleRegionActivation,
    estate: handleToggleEstateActivation,
    division: handleToggleDivisionActivation,
  };

  const filteredFields = fields.filter(field =>
    field.field?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.short_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLevel = (levelKey) => {
    setExpandedLevels(prev => ({ ...prev, [levelKey]: !prev[levelKey] }));
  };

  const getLevelData = (key) => {
    const map = { group: groups, plantation: plantations, region: regions, estate: estates, division: divisions };
    return map[key] || [];
  };

  const getLevelLoading = (key) => {
    const map = { group: groupsLoading, plantation: plantationsLoading, region: regionsLoading, estate: estatesLoading, division: divisionsLoading };
    return map[key] || false;
  };

  const getSelectedId = (key) => {
    const map = { group: selectedGroup, plantation: selectedPlantation, region: selectedRegion, estate: selectedEstate, division: selectedDivision };
    return map[key];
  };

  const isLevelVisible = (key) => {
    const prereqs = { group: true, plantation: !!selectedGroup, region: !!selectedPlantation, estate: !!selectedRegion, division: !!selectedEstate };
    return prereqs[key];
  };

  const getStepNumber = (key) => {
    const idx = HIERARCHY_LEVELS.findIndex(l => l.key === key);
    return idx + 1;
  };

  const closeModal = () => {
    setActiveCreateLevel(null);
    setNewItem({});
    setEditingField(null);
    setEstateContextMenu(null);
  };

  const handleSetEstateFinalized = async (estateId, finalized) => {
    try {
      const result = await setEstateFinalized({ id: estateId, finalized }).unwrap();
      if (result?.status) {
        toast.success(result.message || (finalized ? 'Estate set as finalized' : 'Estate set as not finalized'));
      } else {
        toast.error(result?.message || 'Failed to update finalized status');
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to update finalized status');
    }
    setEstateContextMenu(null);
  };

  useLayoutEffect(() => {
    if (!estateContextMenu || !estateMenuRef.current) return;
    const rect = estateMenuRef.current.getBoundingClientRect();
    const padding = 8;
    let left = estateContextMenu.x;
    let top = estateContextMenu.y;
    if (left + rect.width + padding > window.innerWidth) left = window.innerWidth - rect.width - padding;
    if (top + rect.height + padding > window.innerHeight) top = window.innerHeight - rect.height - padding;
    if (left < padding) left = padding;
    if (top < padding) top = padding;
    setEstateMenuPosition({ left, top });
  }, [estateContextMenu]);

  useEffect(() => {
    if (!estateContextMenu) return;
    const close = () => setEstateContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [estateContextMenu]);

  const handleDownloadExcel = () => {
    if (!filteredFields.length) return;

    const data = filteredFields.map(field => ({
      'Field Name': field.field || '',
      'Short Name': field.short_name || '',
      'Area': field.area || '',
      'Status': field.activated ? 'Active' : 'Inactive',
      'Can Spread': field.can_spread ? 'Yes' : 'No',
      'Spread Reason': field.can_spread === 0 && field.can_spread_text
        ? missionReasons.find(r => r.id == field.can_spread_text)?.reason || ''
        : '',
      'Can Spray': field.can_spray ? 'Yes' : 'No',
      'Spray Reason': field.can_spray === 0 && field.can_spray_text
        ? missionReasons.find(r => r.id == field.can_spray_text)?.reason || ''
        : '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const colWidths = [
      { wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 10 },
      { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 20 },
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    const divisionName = selectedNames.division || 'Fields';
    XLSX.utils.book_append_sheet(wb, ws, divisionName.substring(0, 31));
    XLSX.writeFile(wb, `${divisionName}_fields.xlsx`);
    toast.success('Fields data downloaded successfully');
  };

  const handleDownloadAllFieldsReport = async () => {
    try {
      const result = await triggerAllFieldsReport().unwrap();
      const allFields = result?.data || [];
      if (!allFields.length) {
        toast.warning('No fields data available');
        return;
      }

      const data = allFields.map(field => ({
        'Group': field.group_name || '',
        'Plantation': field.plantation_name || '',
        'Region': field.region_name || '',
        'Estate': field.estate_name || '',
        'Division': field.division_name || '',
        'Field Name': field.field || '',
        'Short Name': field.short_name || '',
        'Area': field.area || '',
        'Status': field.activated ? 'Active' : 'Inactive',
        'Can Spread': field.can_spread ? 'Yes' : 'No',
        'Spread Reason': field.spread_reason_name || '',
        'Can Spray': field.can_spray ? 'Yes' : 'No',
        'Spray Reason': field.spray_reason_name || '',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [
        { wch: 20 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 20 },
        { wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 10 },
        { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 22 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'All Fields');
      XLSX.writeFile(wb, `All_Fields_Report.xlsx`);
      toast.success('All fields report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download all fields report');
    }
  };

  const renderHierarchyLevel = (levelConfig, index) => {
    const { key, label, icon: Icon, nameField } = levelConfig;

    if (!isLevelVisible(key)) return null;

    const data = getLevelData(key);
    const loading = getLevelLoading(key);
    const selectedId = getSelectedId(key);
    const expanded = expandedLevels[key] !== false;
    const stepNum = getStepNumber(key);
    const isCompleted = !!selectedId;

    return (
      <div key={key} className={`level-map-update ${isCompleted ? 'level-completed-map-update' : ''}`}>
        <div
          role="button"
          tabIndex={0}
          className={`level-header-map-update ${expanded ? 'level-header-expanded-map-update' : ''}`}
          onClick={() => toggleLevel(key)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleLevel(key); } }}
        >
          <div className="level-header-left-map-update">
            <span className={`step-num-map-update ${isCompleted ? 'step-num-done-map-update' : ''}`}>
              {isCompleted ? <FaCheckCircle /> : stepNum}
            </span>
            <Icon className="level-icon-map-update" />
            <span className="level-label-map-update">{label}s</span>
          </div>
          <div className="level-header-right-map-update">
            {isCompleted && (
              <span className="level-selected-name-map-update">{selectedNames[key]}</span>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveCreateLevel(key); setNewItem({}); }}
              className="btn-icon-add-map-update"
              title={`Add ${label}`}
            >
              <FaPlus />
            </button>
            {expanded ? <FaChevronDown className="level-chevron-map-update" /> : <FaChevronRight className="level-chevron-map-update" />}
          </div>
        </div>

        {expanded && (
          <div className="level-body-map-update">
            {loading ? (
              <LoadingSpinner text={`Loading ${label.toLowerCase()}s...`} />
            ) : data.length === 0 ? (
              <EmptyState icon={Icon} title={`No ${label.toLowerCase()}s found`} description={`Click + to create a new ${label.toLowerCase()}`} />
            ) : (
              <div className="item-list-map-update">
                {data.map(item => (
                  <div
                    key={item.id}
                    className={`item-map-update ${selectedId === item.id ? 'item-selected-map-update' : ''} ${!item.activated ? 'item-disabled-map-update' : ''} ${key === 'estate' ? (item.finalized === 1 ? 'item-estate-finalized-map-update' : 'item-estate-not-finalized-map-update') : ''}`}
                    onClick={() => selectHandlers[key](item.id)}
                    onContextMenu={key === 'estate' ? (e) => { e.preventDefault(); const x = e.clientX; const y = e.clientY; setEstateMenuPosition({ left: x, top: y }); setEstateContextMenu({ x, y, estateId: item.id, isFinalized: item.finalized === 1 }); } : undefined}
                  >
                    <div className="item-content-map-update">
                      <span className="item-name-map-update">{item[nameField]}</span>
                      {!item.activated && <span className="item-inactive-tag-map-update">Inactive</span>}
                    </div>
                    <div className="item-actions-map-update">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleHandlers[key](item.id); }}
                        className={`btn-toggle-map-update ${item.activated ? 'btn-toggle-on-map-update' : 'btn-toggle-off-map-update'}`}
                        title={item.activated ? 'Deactivate' : 'Activate'}
                      >
                        {item.activated ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-map-update">
      {/* Estate context menu: right-click to set Finalized / Not Finalized */}
      {estateContextMenu && (
        <>
          <div
            className="estate-context-menu-backdrop-map-update"
            onClick={() => setEstateContextMenu(null)}
            aria-hidden
          />
          <div
            ref={estateMenuRef}
            className="estate-context-menu-map-update"
            style={{ left: estateMenuPosition.left, top: estateMenuPosition.top }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="estate-context-menu-title-map-update">Finalized status</div>
            {estateContextMenu.isFinalized ? (
              <button type="button" className="estate-context-menu-item-map-update" onClick={() => handleSetEstateFinalized(estateContextMenu.estateId, 0)}>
                Set as Not Finalized
              </button>
            ) : (
              <button type="button" className="estate-context-menu-item-map-update" onClick={() => handleSetEstateFinalized(estateContextMenu.estateId, 1)}>
                Set as Finalized
              </button>
            )}
          </div>
        </>
      )}
      {/* Header */}
      <div className="header-map-update">
        <div className="header-top-map-update">
          <div className="header-title-group-map-update">
            <FaMapMarkedAlt className="header-icon-map-update" />
            <div>
              <h1 className="header-title-map-update">Mapping Hierarchy</h1>
              <p className="header-subtitle-map-update">Manage geographic structure and field configurations</p>
            </div>
          </div>
          <button
            onClick={handleDownloadAllFieldsReport}
            className="btn-all-report-map-update"
            disabled={allFieldsLoading}
          >
            <FaFileExcel /> {allFieldsLoading ? 'Downloading...' : 'All Fields Report'}
          </button>
        </div>

        {breadcrumbs.length > 0 && (
          <div className="breadcrumb-map-update">
            <FaCubes className="breadcrumb-root-icon-map-update" />
            {breadcrumbs.map((crumb, idx) => {
              const Icon = crumb.icon;
              return (
                <React.Fragment key={crumb.key}>
                  <FaChevronRight className="breadcrumb-sep-map-update" />
                  <span className={`breadcrumb-item-map-update ${idx === breadcrumbs.length - 1 ? 'breadcrumb-item-active-map-update' : ''}`}>
                    <Icon className="breadcrumb-item-icon-map-update" />
                    {crumb.value}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="layout-map-update">
        {/* Left: Hierarchy Panel */}
        <aside className="sidebar-map-update">
          <div className="sidebar-card-map-update">
            <div className="sidebar-title-map-update">
              <FaLayerGroup />
              <span>Geographic Hierarchy</span>
            </div>
            <div className="levels-map-update">
              {HIERARCHY_LEVELS.map((level, idx) => renderHierarchyLevel(level, idx))}
            </div>
          </div>
        </aside>

        {/* Right: Fields Panel */}
        <main className="main-map-update">
          <div className="fields-card-map-update">
            <div className="fields-card-header-map-update">
              <div className="fields-card-title-row-map-update">
                <div className="fields-card-title-group-map-update">
                  <FaLeaf className="fields-card-icon-map-update" />
                  <h2 className="fields-card-title-map-update">Fields Management</h2>
                  {selectedDivision && (
                    <span className="fields-card-count-map-update">{filteredFields.length} field{filteredFields.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                {selectedDivision && (
                  <div className="fields-card-actions-map-update">
                    <button
                      onClick={handleDownloadExcel}
                      className="btn-excel-map-update"
                      title="Download Excel"
                    >
                      <FaFileExcel /> Export
                    </button>
                    <button
                      onClick={() => { setActiveCreateLevel('field'); setNewItem({}); }}
                      className="btn-primary-sm-map-update"
                      title="Create Field"
                    >
                      <FaPlus /> Add Field
                    </button>
                  </div>
                )}
              </div>

              {selectedDivision && (
                <div className="search-map-update">
                  <FaSearch className="search-icon-map-update" />
                  <input
                    type="text"
                    className="search-input-map-update"
                    placeholder="Search by field name or short name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="search-clear-map-update" onClick={() => setSearchTerm('')}>
                      <FaTimes />
                    </button>
                  )}
                </div>
              )}
            </div>

            {!selectedDivision ? (
              <EmptyState
                icon={FaProjectDiagram}
                title="No division selected"
                description="Navigate the hierarchy on the left and select a division to view and manage its fields."
              />
            ) : (
              <div className="table-wrapper-map-update">
                {fieldsLoading ? (
                  <LoadingSpinner text="Loading fields..." />
                ) : filteredFields.length === 0 ? (
                  <EmptyState
                    icon={FaLeaf}
                    title={searchTerm ? 'No matching fields' : 'No fields yet'}
                    description={searchTerm ? 'Try a different search term.' : 'Click "Add Field" to create the first field in this division.'}
                  />
                ) : (
                  <table className="table-map-update">
                    <thead>
                      <tr>
                        <th>Field Name</th>
                        <th>Short Name</th>
                        <th>Area</th>
                        <th>Status</th>
                        <th>Spread</th>
                        <th>Spray</th>
                        <th className="th-actions-map-update">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFields.map(field => (
                        <tr key={field.id}>
                          <td><span className="cell-text-bold-map-update">{field.field}</span></td>
                          <td><span className="cell-text-map-update">{field.short_name}</span></td>
                          <td><span className="cell-text-map-update">{field.area}</span></td>
                          <td><StatusBadge active={field.activated} /></td>
                          <td>
                            <YesNoBadge
                              value={field.can_spread}
                              reason={field.can_spread === 0 && field.can_spread_text ? missionReasons.find(r => r.id == field.can_spread_text)?.reason : null}
                            />
                          </td>
                          <td>
                            <YesNoBadge
                              value={field.can_spray}
                              reason={field.can_spray === 0 && field.can_spray_text ? missionReasons.find(r => r.id == field.can_spray_text)?.reason : null}
                            />
                          </td>
                          <td>
                            <div className="table-actions-map-update">
                              <button onClick={() => handleFieldEdit(field)} className="btn-icon-edit-map-update" title="Edit">
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleToggleFieldActivation(field.id)}
                                className={`btn-toggle-table-map-update ${field.activated ? 'btn-toggle-on-map-update' : 'btn-toggle-off-map-update'}`}
                                title={field.activated ? 'Deactivate' : 'Activate'}
                              >
                                {field.activated ? <FaToggleOn /> : <FaToggleOff />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ===== CREATE MODAL ===== */}
      {activeCreateLevel && (
        <div className="modal-overlay-map-update" onClick={closeModal}>
          <div className="modal-map-update" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-map-update">
              <h3 className="modal-title-map-update">
                <FaPlus className="modal-title-icon-map-update" />
                Create New {activeCreateLevel.charAt(0).toUpperCase() + activeCreateLevel.slice(1)}
              </h3>
              <button onClick={closeModal} className="modal-close-map-update">
                <FaTimes />
              </button>
            </div>
            <div className="modal-body-map-update">
              <div className="form-group-map-update">
                <label className="label-map-update">{activeCreateLevel.charAt(0).toUpperCase() + activeCreateLevel.slice(1)} Name</label>
                <input
                  type="text"
                  className="input-map-update"
                  placeholder={`Enter ${activeCreateLevel} name`}
                  value={newItem[activeCreateLevel] || ''}
                  onChange={(e) => setNewItem({ ...newItem, [activeCreateLevel]: e.target.value })}
                  autoFocus
                />
              </div>
              {activeCreateLevel === 'field' && (
                <>
                  <div className="form-group-map-update">
                    <label className="label-map-update">Short Name</label>
                    <input
                      type="text"
                      className="input-map-update"
                      placeholder="Enter short name"
                      value={newItem.short_name || ''}
                      onChange={(e) => setNewItem({ ...newItem, short_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group-map-update">
                    <label className="label-map-update">Area</label>
                    <input
                      type="number"
                      className="input-map-update"
                      placeholder="Enter area"
                      value={newItem.area || ''}
                      onChange={(e) => setNewItem({ ...newItem, area: parseFloat(e.target.value) })}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer-map-update">
              <button onClick={closeModal} className="btn-ghost-map-update">Cancel</button>
              <button onClick={() => handleCreate(activeCreateLevel)} className="btn-primary-map-update">
                <FaSave /> Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT FIELD MODAL ===== */}
      {editingField && (
        <div className="modal-overlay-map-update" onClick={closeModal}>
          <div className="modal-map-update modal-wide-map-update" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-map-update">
              <h3 className="modal-title-map-update">
                <FaEdit className="modal-title-icon-map-update" />
                Edit Field - {editingField.field}
              </h3>
              <button onClick={closeModal} className="modal-close-map-update">
                <FaTimes />
              </button>
            </div>
            <div className="modal-body-map-update">
              <div className="modal-form-grid-map-update">
                <div className="form-group-map-update">
                  <label className="label-map-update">Field Name</label>
                  <input
                    type="text"
                    className="input-map-update"
                    value={editingField.field || ''}
                    onChange={(e) => setEditingField({ ...editingField, field: e.target.value })}
                  />
                </div>
                <div className="form-group-map-update">
                  <label className="label-map-update">Short Name</label>
                  <input
                    type="text"
                    className="input-map-update"
                    value={editingField.short_name || ''}
                    onChange={(e) => setEditingField({ ...editingField, short_name: e.target.value })}
                  />
                </div>
                <div className="form-group-map-update">
                  <label className="label-map-update">Area</label>
                  <input
                    type="number"
                    className="input-map-update"
                    value={editingField.area || ''}
                    onChange={(e) => setEditingField({ ...editingField, area: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="modal-form-grid-map-update">
                <div className="form-group-map-update">
                  <label className="label-map-update">Can Spread</label>
                  <select
                    className="input-map-update"
                    value={editingField.can_spread || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setEditingField({ ...editingField, can_spread: val, can_spread_text: val === 1 ? null : editingField.can_spread_text });
                    }}
                  >
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                <div className="form-group-map-update">
                  <label className="label-map-update">Spread Reason</label>
                  <select
                    className="input-map-update"
                    value={editingField.can_spread === 1 ? '' : (editingField.can_spread_text || '')}
                    onChange={(e) => setEditingField({ ...editingField, can_spread_text: e.target.value || null })}
                    disabled={editingField.can_spread === 1}
                  >
                    <option value="">Select Reason</option>
                    {missionReasons.map(reason => (
                      <option key={reason.id} value={reason.id}>{reason.reason}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group-map-update">
                  <label className="label-map-update">Can Spray</label>
                  <select
                    className="input-map-update"
                    value={editingField.can_spray || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setEditingField({ ...editingField, can_spray: val, can_spray_text: val === 1 ? null : editingField.can_spray_text });
                    }}
                  >
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                <div className="form-group-map-update">
                  <label className="label-map-update">Spray Reason</label>
                  <select
                    className="input-map-update"
                    value={editingField.can_spray === 1 ? '' : (editingField.can_spray_text || '')}
                    onChange={(e) => setEditingField({ ...editingField, can_spray_text: e.target.value || null })}
                    disabled={editingField.can_spray === 1}
                  >
                    <option value="">Select Reason</option>
                    {missionReasons.map(reason => (
                      <option key={reason.id} value={reason.id}>{reason.reason}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer-map-update">
              <button onClick={closeModal} className="btn-ghost-map-update">Cancel</button>
              <button onClick={handleFieldSave} className="btn-primary-map-update">
                <FaSave /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MappingUpdatePage;
