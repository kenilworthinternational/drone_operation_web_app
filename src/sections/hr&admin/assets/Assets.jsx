import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaBoxes,
  FaSearch,
  FaEdit,
  FaEye,
  FaPlane,
  FaCar,
  FaBolt,
  FaBatteryFull,
  FaGamepad,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import '../../../styles/assets.css';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useGetWingsQuery } from '../../../api/services/assetsApi';
import {
  fetchInsuranceTypes,
  fetchAssets as fetchAssetsThunk,
  updateAsset as updateAssetThunk,
  setActiveTab as setActiveTabAction,
  setSearchTerm as setSearchTermAction,
  setStatusFilter as setStatusFilterAction,
  setSelectedAsset as setSelectedAssetAction,
  clearSelectedAsset,
  selectActiveTab,
  selectCurrentAssets,
  selectAssets,
  selectInsuranceTypes,
  selectSearchTerm,
  selectStatusFilter,
  selectSelectedAsset,
  selectSelectedAssetType,
  selectLoading,
  selectError,
} from '../../../store/slices/assetsSlice';

const TAB_ORDER = ['drones', 'vehicles', 'generators', 'batteries', 'remoteControls'];

const TAB_CONFIG = {
  drones: {
    label: 'Drones',
    icon: FaPlane,
    responseKeys: ['drones']
  },
  vehicles: {
    label: 'Vehicles',
    icon: FaCar,
    responseKeys: ['vehicles']
  },
  generators: {
    label: 'Generators',
    icon: FaBolt,
    responseKeys: ['generators']
  },
  batteries: {
    label: 'Batteries',
    icon: FaBatteryFull,
    responseKeys: ['battery', 'batteries']
  },
  remoteControls: {
    label: 'Remote Controls',
    icon: FaGamepad,
    responseKeys: ['remote_controls', 'remote_control', 'remotes']
  }
};

const DEFAULT_WING_NAME = 'Not Available';

const parsePurchasePrice = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const cleaned = typeof value === 'string' ? value.trim() : value;
  if (cleaned === '') {
    return null;
  }
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return Number(parsed.toFixed(2));
};

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === '') {
    return 'Not Available';
  }
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return 'Not Available';
  }
  return `LKR ${parsed.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const resolveWingValue = (asset) =>
  asset?.wing ??
  asset?.wing_name ??
  asset?.wingName ??
  asset?.wing_title ??
  asset?.sector ??
  asset?.sector_name ??
  asset?.sectorName ??
  asset?.sector_title ??
  '';

const extractWingId = (asset) => {
  const candidates = [asset?.wing_id, asset?.wingId, asset?.wingID, asset?.sector_id, asset?.sectorId];
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null || candidate === '') {
      continue;
    }
    const parsed = Number.parseInt(candidate, 10);
    if (!Number.isNaN(parsed)) {
      return String(parsed);
    }
  }
  return '';
};

const parseWingId = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : String(parsed);
};

const INITIAL_FORM_STATE = {
  id: '',
  tag: '',
  serial: '',
  type: '',
  make: '',
  model: '',
  purchase_price: '',
  manufacture_year: '',
  depreciation_period: '',
  have_insurance: '0',
  insurance_type: '',
  warranty_period: '',
  operational_status: 'y',
  activated: '1',
  wing_id: ''
};

const formatDateForInput = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
};

const formatDateForApi = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  if (/^\d{4}$/.test(value)) {
    return `${value}-01-01`;
  }
  if (value.includes('-')) {
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
};

const formatActivated = (value) => {
  const normalized = typeof value === 'number' ? value : parseInt(value ?? 0, 10);
  return normalized === 1 ? 'Active' : 'Inactive';
};

const formatOperationalStatus = (value) => (value === 'y' ? 'Operational' : 'Not Operational');

const resolveInsuranceName = (insuranceOptions, id) => {
  if (!id) return '-';
  const option = insuranceOptions.find((item) => String(item.id) === String(id));
  return option ? option.type : String(id);
};

const singularLabel = (label) => (label.endsWith('s') ? label.slice(0, -1) : label);

const formatOwnership = (value) => {
  if (value === 'o') return 'Own Vehicle';
  if (value === 'r') return 'Rented Vehicle';
  return value || '-';
};

const Assets = ({ singleMode = false, selectedType = null }) => {
  const dispatch = useAppDispatch();
  
  // Get from Redux
  const reduxActiveTab = useAppSelector(selectActiveTab);
  // In single mode, use selectedType; otherwise use Redux activeTab
  const activeTab = singleMode && selectedType ? selectedType : reduxActiveTab;
  const assets = useAppSelector((state) => 
    singleMode && selectedType 
      ? selectAssets(state, selectedType) 
      : selectCurrentAssets(state)
  );
  const insuranceOptions = useAppSelector(selectInsuranceTypes);
  const searchTerm = useAppSelector(selectSearchTerm);
  const statusFilter = useAppSelector(selectStatusFilter);
  const selectedAsset = useAppSelector(selectSelectedAsset);
  const selectedAssetType = useAppSelector(selectSelectedAssetType);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  
  // Local state for UI
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const {
    data: wingsResponse,
    isLoading: wingsLoading,
    isError: wingsError,
    error: wingsErrorDetails,
  } = useGetWingsQuery();

  const wings = useMemo(() => {
    if (!wingsResponse) return [];
    if (Array.isArray(wingsResponse)) return wingsResponse;
    if (Array.isArray(wingsResponse?.data)) return wingsResponse.data;
    if (Array.isArray(wingsResponse?.wings)) return wingsResponse.wings;
    return [];
  }, [wingsResponse]);

  const wingIdToName = useMemo(() => {
    const map = new Map();
    wings.forEach((wing) => {
      if (wing?.id != null) {
        map.set(String(wing.id), wing.wing || '');
      }
    });
    return map;
  }, [wings]);

  const wingNameToId = useMemo(() => {
    const map = new Map();
    wings.forEach((wing) => {
      if (wing?.wing) {
        map.set(wing.wing.toLowerCase(), String(wing.id));
      }
    });
    return map;
  }, [wings]);

  const resolveWingNameById = useCallback(
    (id) => {
      if (id === undefined || id === null || id === '') {
        return '';
      }
      return wingIdToName.get(String(id)) || '';
    },
    [wingIdToName]
  );

  const formatWingDisplay = useCallback(
    (asset) => {
      const wingText = resolveWingValue(asset);
      const trimmedWingText = wingText ? wingText.trim() : '';
      const isNumericWingText = trimmedWingText ? /^\d+$/.test(trimmedWingText) : false;
      if (trimmedWingText && !isNumericWingText) {
        return wingText;
      }
      const candidateId = extractWingId(asset) || (isNumericWingText ? trimmedWingText : '');
      if (candidateId) {
        const resolved = resolveWingNameById(candidateId);
        if (resolved) {
          return resolved;
        }
      }
      return trimmedWingText || DEFAULT_WING_NAME;
    },
    [resolveWingNameById]
  );

  const wingsErrorMessage = useMemo(() => {
    if (!wingsError) return '';
    if (typeof wingsErrorDetails === 'string') return wingsErrorDetails;
    if (wingsErrorDetails?.data?.message) return wingsErrorDetails.data.message;
    if (wingsErrorDetails?.error) return wingsErrorDetails.error;
    if (wingsErrorDetails?.message) return wingsErrorDetails.message;
    return 'Unable to load wings.';
  }, [wingsError, wingsErrorDetails]);

  useEffect(() => {
    if (!notification.message) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [notification.message]);

  const maxVisibleTabs = 4;
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);

  const tabs = useMemo(
    () =>
      TAB_ORDER.map((key) => ({
        key,
        ...TAB_CONFIG[key]
      })),
    []
  );

  const visibleTabs = useMemo(
    () => tabs.slice(visibleStartIndex, visibleStartIndex + maxVisibleTabs),
    [tabs, visibleStartIndex]
  );

  const maxStartIndex = Math.max(0, tabs.length - maxVisibleTabs);
  const showPrevTabs = visibleStartIndex > 0;
  const showNextTabs = visibleStartIndex < maxStartIndex;

  const currentTabConfig = TAB_CONFIG[activeTab];
  const isBatteryTab = activeTab === 'batteries';
  const isVehicleTab = activeTab === 'vehicles';
  const isSelectedBattery = selectedAssetType === 'batteries';
  const isSelectedVehicle = selectedAssetType === 'vehicles';

  const mapAssetToForm = useCallback((asset) => {
    const extractedWingId = extractWingId(asset);
    let wingId = extractedWingId;
    if (!wingId) {
      const wingText = resolveWingValue(asset);
      const matchedId = wingText ? wingNameToId.get(wingText.toLowerCase()) : null;
      if (matchedId) {
        wingId = matchedId;
      }
    }

    return {
      id: asset?.id ?? '',
      tag: asset?.tag ?? '',
      serial: asset?.serial ?? '',
      type: asset?.type ?? '',
      ownership: asset?.ownership ?? '',
      chassis_no: asset?.chassis_no ?? '',
      engine_no: asset?.engine_no ?? '',
      vehicle_no: asset?.vehicle_no ?? '',
      make: asset?.make ?? '',
      model: asset?.model ?? '',
      purchase_price: asset?.purchase_price != null ? String(asset.purchase_price) : '',
      manufacture_year: formatDateForInput(asset?.manufacture_year),
      depreciation_period: asset?.depreciation_period != null ? String(asset.depreciation_period) : '',
      have_insurance: asset?.have_insurance != null ? String(asset.have_insurance) : '0',
      insurance_type: asset?.insurance_type_id != null
        ? String(asset.insurance_type_id)
        : asset?.insurance_type != null
          ? String(asset.insurance_type)
          : '',
      warranty_period: asset?.warranty_period != null ? String(asset.warranty_period) : '',
      operational_status: asset?.operational_status ?? 'y',
      activated: asset?.activated != null ? String(asset.activated) : '1',
      insurance_expire_date: formatDateForInput(asset?.insurance_expire_date),
      revenue_license_expire_date: formatDateForInput(asset?.revenue_license_expire_date),
      initial_mileage: asset?.initial_mileage != null ? String(asset.initial_mileage) : '',
      wing_id: wingId || ''
    };
  }, [wingNameToId]);

  // Fetch insurance types on mount
  useEffect(() => {
    if (insuranceOptions.length === 0 && !loading.insurance) {
      dispatch(fetchInsuranceTypes());
    }
  }, [dispatch, insuranceOptions.length, loading.insurance]);

  // Fetch assets when tab changes (only if not in single mode or when selectedType changes)
  useEffect(() => {
    if (singleMode && selectedType) {
      dispatch(fetchAssetsThunk(selectedType));
    } else if (!singleMode) {
      dispatch(fetchAssetsThunk(activeTab));
    }
  }, [activeTab, selectedType, singleMode, dispatch]);

  const filteredAssets = useMemo(() => {
    let filtered = [...assets];

    if (statusFilter === 'active') {
      filtered = filtered.filter((asset) => (asset?.activated ?? 0) === 1 || String(asset?.activated) === '1');
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((asset) => (asset?.activated ?? 0) === 0 || String(asset?.activated) === '0');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((asset) => [
        asset?.tag,
        asset?.serial,
        asset?.type,
        asset?.make,
        asset?.model,
        asset?.vehicle_no,
        asset?.ownership,
        asset?.chassis_no,
        asset?.engine_no,
        asset?.purchase_price,
        formatWingDisplay(asset)
      ].some((field) => (field ?? '').toString().toLowerCase().includes(term)));
    }

    return filtered;
  }, [assets, statusFilter, searchTerm]);

  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab) return;
    dispatch(setActiveTabAction(tabKey));
    const targetIndex = TAB_ORDER.indexOf(tabKey);
    if (targetIndex !== -1) {
      if (targetIndex < visibleStartIndex) {
        setVisibleStartIndex(targetIndex);
      } else if (targetIndex >= visibleStartIndex + maxVisibleTabs) {
        const newStart = targetIndex - maxVisibleTabs + 1;
        setVisibleStartIndex(newStart < 0 ? 0 : newStart);
      }
    }
  };

  const handleViewAsset = (asset, tabKey) => {
    dispatch(setSelectedAssetAction({ asset, assetType: tabKey }));
    setShowViewModal(true);
  };

  const handleEditAsset = (asset, tabKey) => {
    dispatch(setSelectedAssetAction({ asset, assetType: tabKey }));
    setFormData(mapAssetToForm(asset));
    setShowEditModal(true);
  };

  const resetFormState = () => {
    setFormData(INITIAL_FORM_STATE);
    dispatch(clearSelectedAsset());
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    resetFormState();
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    dispatch(clearSelectedAsset());
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value
      };

      if (name === 'have_insurance' && value !== '1') {
        updated.insurance_type = '';
      }

      return updated;
    });
  };

  const renderWingSelectField = () => (
    <div className="form-group-assets">
      <label htmlFor="wing_id">
        Wing <span className="required-indicator-assets">*</span>
      </label>
      <select
        id="wing_id"
        name="wing_id"
        value={formData.wing_id || ''}
        onChange={handleFormChange}
        required
        disabled={wingsLoading || wings.length === 0}
      >
        <option value="">
          {wingsLoading ? 'Loading wings...' : wings.length === 0 ? 'No wings available' : 'Select a wing'}
        </option>
        {wings.map((wing) => (
          <option key={wing.id} value={wing.id}>
            {wing.wing}
          </option>
        ))}
      </select>
      {wingsError && <small className="form-helper-text-assets error">{wingsErrorMessage}</small>}
    </div>
  );

  const validateForm = () => {
    let requiredFields = ['tag', 'serial', 'purchase_price', 'wing_id'];

    if (selectedAssetType === 'vehicles') {
      requiredFields = [
        'ownership',
        'vehicle_no',
        'make',
        'model',
        'chassis_no',
        'engine_no',
        'purchase_price',
        'insurance_expire_date',
        'revenue_license_expire_date',
        'initial_mileage',
        'operational_status',
        'activated',
        'wing_id'
      ];
    } else {
      if (formData.have_insurance === '1') {
        requiredFields.push('insurance_type');
      }
      if (selectedAssetType === 'batteries') {
        requiredFields.push('type');
      }
    }

    const missing = requiredFields.filter((field) => !formData[field] || !formData[field].toString().trim());
    if (missing.length > 0) {
      const readable = missing.map((field) => (field === 'wing_id' ? 'wing' : field));
      return `Please fill in all required fields: ${readable.join(', ')}`;
    }

    const normalizedPrice = parsePurchasePrice(formData.purchase_price);
    if (normalizedPrice === null) {
      return 'Purchase price must be a valid number.';
    }

    return '';
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    if (!selectedAsset) {
      return;
    }

    const validationMessage = validateForm();
    if (validationMessage) {
      setNotification({ type: 'error', message: validationMessage });
      return;
    }

    const normalizedPrice = parsePurchasePrice(formData.purchase_price);
    if (normalizedPrice === null) {
      setNotification({ type: 'error', message: 'Purchase price must be a valid number.' });
      return;
    }

    const wingId = parseWingId(formData.wing_id);
    if (wingId === null) {
      setNotification({ type: 'error', message: 'Please select a wing.' });
      return;
    }

    try {
      let payload;

      switch (selectedAssetType) {
        case 'generators':
        case 'remoteControls':
        case 'drones': {
          payload = {
            id: formData.id,
            tag: formData.tag.trim(),
            serial: formData.serial.trim(),
            make: formData.make.trim(),
            model: formData.model.trim(),
            manufacture_year: formatDateForApi(formData.manufacture_year),
            depreciation_period: formData.depreciation_period ? String(formData.depreciation_period).trim() : '',
            have_insurance: formData.have_insurance,
            insurance_type: formData.have_insurance === '1' ? formData.insurance_type : '',
            warranty_period: formData.warranty_period ? String(formData.warranty_period).trim() : '',
            operational_status: formData.operational_status,
            activated: formData.activated,
            purchase_price: normalizedPrice,
            wing: wingId
          };
          break;
        }
        case 'batteries': {
          payload = {
            id: formData.id,
            tag: formData.tag.trim(),
            serial: formData.serial.trim(),
            type: formData.type.trim(),
            make: formData.make.trim(),
            model: formData.model.trim(),
            manufacture_year: formatDateForApi(formData.manufacture_year),
            depreciation_period: formData.depreciation_period ? String(formData.depreciation_period).trim() : '',
            have_insurance: formData.have_insurance,
            insurance_type: formData.have_insurance === '1' ? formData.insurance_type : '',
            warranty_period: formData.warranty_period ? String(formData.warranty_period).trim() : '',
            operational_status: formData.operational_status,
            activated: formData.activated,
            purchase_price: normalizedPrice,
            wing: wingId
          };
          break;
        }
        case 'vehicles': {
          payload = {
            id: formData.id,
            ownership: formData.ownership.trim(),
            chassis_no: formData.chassis_no.trim(),
            engine_no: formData.engine_no.trim(),
            vehicle_no: formData.vehicle_no.trim(),
            make: formData.make.trim(),
            model: formData.model.trim(),
            insurance_expire_date: formatDateForApi(formData.insurance_expire_date),
            revenue_license_expire_date: formatDateForApi(formData.revenue_license_expire_date),
            initial_mileage: formData.initial_mileage ? String(formData.initial_mileage).trim() : '',
            operational_status: formData.operational_status,
            activated: formData.activated,
            purchase_price: normalizedPrice,
            wing: wingId
          };
          break;
        }
        default:
          setNotification({ type: 'error', message: 'Unsupported asset type' });
          return;
      }

      // Dispatch Redux update action
      const result = await dispatch(updateAssetThunk({ assetType: selectedAssetType, data: payload }));

      if (updateAssetThunk.fulfilled.match(result)) {
        setNotification({
          type: 'success',
          message: `${singularLabel(TAB_CONFIG[selectedAssetType].label)} updated successfully.`
        });
        setShowEditModal(false);
        resetFormState();
        // Refresh assets
        dispatch(fetchAssetsThunk(activeTab));
      } else {
        throw new Error(result.payload || `Failed to update ${singularLabel(TAB_CONFIG[selectedAssetType].label).toLowerCase()}.`);
      }
    } catch (apiError) {
      setNotification({
        type: 'error',
        message: apiError?.message || 'Update failed. Please try again.'
      });
    }
  };

  const renderTableHeader = () => {
    if (activeTab === 'batteries') {
      return (
        <tr>
          <th>Tag</th>
          <th>Serial</th>
          <th>Type</th>
          <th>Make</th>
          <th>Model</th>
          <th>Purchase Price</th>
          <th>Wing</th>
          <th>Insurance</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      );
    }

    if (activeTab === 'vehicles') {
      return (
        <tr>
          <th>Ownership</th>
          <th>Vehicle No</th>
          <th>Make</th>
          <th>Model</th>
          <th>Purchase Price</th>
          <th>Wing</th>
          <th>Insurance Expiry</th>
          <th>Revenue License Expiry</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      );
    }

    if (activeTab === 'generators') {
      return (
        <tr>
          <th>Tag</th>
          <th>Serial</th>
          <th>Make</th>
          <th>Model</th>
          <th>Purchase Price</th>
          <th>Wing</th>
          <th>Insurance</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      );
    }

    return (
      <tr>
        <th>Tag</th>
        <th>Serial</th>
        <th>Make</th>
        <th>Model</th>
        <th>Purchase Price</th>
        <th>Wing</th>
        <th>Insurance</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    );
  };

  const renderTableRow = (asset) => {
    if (activeTab === 'vehicles') {
      const purchasePriceDisplay = formatCurrency(asset?.purchase_price);
      const wingDisplay = formatWingDisplay(asset);

      return (
        <tr key={asset?.id ?? asset?.vehicle_no}>
          <td>{formatOwnership(asset?.ownership)}</td>
          <td>{asset?.vehicle_no || '-'}</td>
          <td>{asset?.make || '-'}</td>
          <td>{asset?.model || '-'}</td>
          <td>{purchasePriceDisplay}</td>
          <td>{wingDisplay}</td>
          <td>{formatDateForInput(asset?.insurance_expire_date) || '-'}</td>
          <td>{formatDateForInput(asset?.revenue_license_expire_date) || '-'}</td>
          <td>
            <span className={`status-badge-assets ${asset?.operational_status === 'y' ? 'status-badge-active-assets' : 'status-badge-inactive-assets'}`}>
              {formatOperationalStatus(asset?.operational_status)}
            </span>
          </td>
          <td>
            <div className="action-buttons-assets">
              <button
                className="view-btn-assets"
                onClick={() => handleViewAsset(asset, activeTab)}
                title="View Details"
              >
                <FaEye />
              </button>
              <button
                className="edit-btn-assets"
                onClick={() => handleEditAsset(asset, activeTab)}
                title="Edit Asset"
              >
                <FaEdit />
              </button>
            </div>
          </td>
        </tr>
      );
    }

    const insuranceDisplay = asset?.have_insurance === 1 || String(asset?.have_insurance) === '1'
      ? resolveInsuranceName(insuranceOptions, asset?.insurance_type_id || asset?.insurance_type)
      : 'No';
    const purchasePriceDisplay = formatCurrency(asset?.purchase_price);
    const wingDisplay = formatWingDisplay(asset);

    return (
      <tr key={asset?.id ?? asset?.tag}>
        <td>{asset?.tag || '-'}</td>
        <td>{asset?.serial || '-'}</td>
        {isBatteryTab && <td>{asset?.type || '-'}</td>}
        <td>{asset?.make || '-'}</td>
        <td>{asset?.model || '-'}</td>
        <td>{purchasePriceDisplay}</td>
        <td>{wingDisplay}</td>
        <td>{insuranceDisplay}</td>
        <td>
          <span className={`status-badge-assets ${asset?.operational_status === 'y' ? 'status-badge-active-assets' : 'status-badge-inactive-assets'}`}>
            {formatOperationalStatus(asset?.operational_status)}
          </span>
        </td>
        <td>
          <div className="action-buttons-assets">
            <button
              className="view-btn-assets"
              onClick={() => handleViewAsset(asset, activeTab)}
              title="View Details"
            >
              <FaEye />
            </button>
            <button
              className="edit-btn-assets"
              onClick={() => handleEditAsset(asset, activeTab)}
              title="Edit Asset"
            >
              <FaEdit />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderDetailRows = () => {
    if (!selectedAsset) return null;

    const rows =
      selectedAssetType === 'vehicles'
        ? [
            { label: 'Ownership', value: formatOwnership(selectedAsset.ownership) },
            { label: 'Vehicle Number', value: selectedAsset.vehicle_no },
            { label: 'Make', value: selectedAsset.make },
            { label: 'Model', value: selectedAsset.model },
            { label: 'Purchase Price', value: formatCurrency(selectedAsset.purchase_price) },
            { label: 'Wing', value: formatWingDisplay(selectedAsset) },
            { label: 'Insurance Expiry', value: formatDateForInput(selectedAsset.insurance_expire_date) },
            { label: 'Revenue License Expiry', value: formatDateForInput(selectedAsset.revenue_license_expire_date) },
            { label: 'Operational Status', value: formatOperationalStatus(selectedAsset.operational_status) }
          ]
        : [
            { label: 'Tag', value: selectedAsset.tag },
            { label: 'Serial', value: selectedAsset.serial },
            ...(selectedAssetType === 'batteries'
              ? [{ label: 'Type', value: selectedAsset.type }]
              : []),
            { label: 'Make', value: selectedAsset.make },
            { label: 'Model', value: selectedAsset.model },
            { label: 'Purchase Price', value: formatCurrency(selectedAsset.purchase_price) },
            { label: 'Wing', value: formatWingDisplay(selectedAsset) },
            { label: 'Depreciation Period', value: selectedAsset.depreciation_period },
            {
              label: 'Insurance',
              value:
                selectedAsset?.have_insurance === 1 || String(selectedAsset?.have_insurance) === '1'
                  ? resolveInsuranceName(insuranceOptions, selectedAsset?.insurance_type_id || selectedAsset?.insurance_type)
                  : 'No'
            },
            { label: 'Warranty Period', value: selectedAsset.warranty_period },
            { label: 'Operational Status', value: formatOperationalStatus(selectedAsset.operational_status) }
          ];

    return rows.map((row) => (
      <div key={row.label} className="detail-row-assets">
        <span className="detail-label-assets">{row.label}:</span>
        <span className="detail-value-assets">{row.value ?? '-'}</span>
      </div>
    ));
  };

  return (
    <div className="assets-container-assets">
      {/* Header (hidden in single mode) */}
      {!singleMode && (
        <div className="assets-header-assets">
          <FaBoxes className="header-icon-assets" />
          <h2>Assets</h2>
        </div>
      )}

      {/* Tab Navigation (hidden in single mode) */}
      {!singleMode && (
        <div className="assets-tabs-assets">
          <button
            type="button"
            className="tab-scroll-button-assets"
            onClick={() => setVisibleStartIndex((prev) => (prev - 1 < 0 ? 0 : prev - 1))}
            disabled={!showPrevTabs}
            aria-label="Previous tabs"
          >
            <FaChevronLeft />
          </button>
          <div className="tabs-wrapper-assets">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`asset-tab-assets ${isActive ? 'active-assets' : ''}`}
                  onClick={() => handleTabChange(tab.key)}
                >
                  <Icon className="tab-icon-assets" />
                  <span className="tab-text-assets">{tab.label}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="tab-scroll-button-assets"
            onClick={() => setVisibleStartIndex((prev) => (prev + 1 > maxStartIndex ? maxStartIndex : prev + 1))}
            disabled={!showNextTabs}
            aria-label="Next tabs"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {notification.message && (
        <div className={`assets-notification-assets ${notification.type === 'error' ? 'error' : 'success'}`}>
          {notification.message}
        </div>
      )}

      <div className="assets-toolbar-assets">
        <div className="search-container-assets">
          <FaSearch className="search-icon-assets" />
          <input
            type="text"
            placeholder="Search by tag, serial, make, model, wing, or price..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTermAction(e.target.value))}
            className="search-input-assets"
          />
        </div>
        <div className="filter-container-assets">
          <select
            value={statusFilter}
            onChange={(e) => dispatch(setStatusFilterAction(e.target.value))}
            className="filter-select-assets"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="assets-table-container-assets">
        {loading.assets ? (
          <div className="loading-assets">Loading {currentTabConfig?.label.toLowerCase()}...</div>
        ) : error ? (
          <div className="no-data-assets">
            <p>{error}</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="no-data-assets">
            <FaBoxes className="no-data-icon-assets" />
            <p>No {currentTabConfig?.label.toLowerCase()} found</p>
          </div>
        ) : (
          <table className="assets-table-assets">
            <thead>{renderTableHeader()}</thead>
            <tbody>{filteredAssets.map((asset) => renderTableRow(asset))}</tbody>
          </table>
        )}
      </div>

      {showViewModal && selectedAsset && (
        <div className="modal-overlay-assets" onClick={closeViewModal}>
          <div className="modal-content-assets" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-assets">
              <h3>{singularLabel(TAB_CONFIG[selectedAssetType].label)} Details</h3>
              <button className="close-btn-assets" onClick={closeViewModal}>
                ×
              </button>
            </div>
            <div className="modal-body-assets">{renderDetailRows()}</div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay-assets" onClick={closeEditModal}>
          <div className="modal-content-assets" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-assets">
              <h3>Edit {singularLabel(TAB_CONFIG[selectedAssetType].label)}</h3>
              <button className="close-btn-assets" onClick={closeEditModal}>
                ×
              </button>
            </div>
            <div className="modal-body-assets">
              <form onSubmit={handleUpdateSubmit} className="assets-form-assets">
                {isSelectedVehicle ? (
                  <>
                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="ownership">Ownership <span className="required-indicator-assets">*</span></label>
                        <select
                          id="ownership"
                          name="ownership"
                          value={formData.ownership}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="">Select ownership</option>
                          <option value="o">Own Vehicle</option>
                          <option value="r">Rented Vehicle</option>
                        </select>
                      </div>
                      <div className="form-group-assets">
                        <label htmlFor="vehicle_no">Vehicle Number <span className="required-indicator-assets">*</span></label>
                        <input
                          type="text"
                          id="vehicle_no"
                          name="vehicle_no"
                          value={formData.vehicle_no}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="make">Make <span className="required-indicator-assets">*</span></label>
                        <input
                          type="text"
                          id="make"
                          name="make"
                          value={formData.make}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div className="form-group-assets">
                        <label htmlFor="model">Model <span className="required-indicator-assets">*</span></label>
                        <input
                          type="text"
                          id="model"
                          name="model"
                          value={formData.model}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="chassis_no">Chassis Number <span className="required-indicator-assets">*</span></label>
                        <input
                          type="text"
                          id="chassis_no"
                          name="chassis_no"
                          value={formData.chassis_no}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div className="form-group-assets">
                        <label htmlFor="engine_no">Engine Number <span className="required-indicator-assets">*</span></label>
                        <input
                          type="text"
                          id="engine_no"
                          name="engine_no"
                          value={formData.engine_no}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="insurance_expire_date">Insurance Expiry Date <span className="required-indicator-assets">*</span></label>
                        <input
                          type="date"
                          id="insurance_expire_date"
                          name="insurance_expire_date"
                          value={formData.insurance_expire_date}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div className="form-group-assets">
                        <label htmlFor="revenue_license_expire_date">Revenue License Expiry Date <span className="required-indicator-assets">*</span></label>
                        <input
                          type="date"
                          id="revenue_license_expire_date"
                          name="revenue_license_expire_date"
                          value={formData.revenue_license_expire_date}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="initial_mileage">Initial Mileage (km) <span className="required-indicator-assets">*</span></label>
                        <input
                          type="number"
                          id="initial_mileage"
                          name="initial_mileage"
                          value={formData.initial_mileage}
                          onChange={handleFormChange}
                          min="0"
                          required
                        />
                      </div>
                      <div className="form-group-assets">
                        <label htmlFor="operational_status">Operational Status <span className="required-indicator-assets">*</span></label>
                        <select
                          id="operational_status"
                          name="operational_status"
                          value={formData.operational_status}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="y">Operational</option>
                          <option value="n">Not Operational</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="activated">Activation Status <span className="required-indicator-assets">*</span></label>
                        <select
                          id="activated"
                          name="activated"
                          value={formData.activated}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="purchase_price">Purchase Price (LKR) <span className="required-indicator-assets">*</span></label>
                        <input
                          type="number"
                          id="purchase_price"
                          name="purchase_price"
                          value={formData.purchase_price}
                          onChange={handleFormChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      {renderWingSelectField()}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="tag">Tag <span className="required-indicator-assets">*</span></label>
                        <input
                          type="text"
                          id="tag"
                          name="tag"
                          value={formData.tag}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div className="form-group-assets">
                        <label htmlFor="serial">Serial <span className="required-indicator-assets">*</span></label>
                        <input
                          type="text"
                          id="serial"
                          name="serial"
                          value={formData.serial}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>

                    {selectedAssetType === 'batteries' && (
                      <div className="form-row-assets">
                        <div className="form-group-assets">
                          <label htmlFor="type">Type <span className="required-indicator-assets">*</span></label>
                          <input
                            type="text"
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="make">Make</label>
                        <input
                          type="text"
                          id="make"
                          name="make"
                          value={formData.make}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-group-assets">
                        <label htmlFor="model">Model</label>
                        <input
                          type="text"
                          id="model"
                          name="model"
                          value={formData.model}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="purchase_price">Purchase Price (LKR) <span className="required-indicator-assets">*</span></label>
                        <input
                          type="number"
                          id="purchase_price"
                          name="purchase_price"
                          value={formData.purchase_price}
                          onChange={handleFormChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      {renderWingSelectField()}
                    </div>

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="manufacture_year">Manufacture Date</label>
                        <input
                          type="date"
                          id="manufacture_year"
                          name="manufacture_year"
                          value={formData.manufacture_year}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-group-assets">
                        <label htmlFor="depreciation_period">Depreciation Period (years)</label>
                        <input
                          type="number"
                          id="depreciation_period"
                          name="depreciation_period"
                          value={formData.depreciation_period}
                          onChange={handleFormChange}
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="warranty_period">Warranty Period (years)</label>
                        <input
                          type="number"
                          id="warranty_period"
                          name="warranty_period"
                          value={formData.warranty_period}
                          onChange={handleFormChange}
                          min="0"
                          step="1"
                        />
                      </div>
                      <div className="form-group-assets">
                        <label htmlFor="have_insurance">Have Insurance?</label>
                        <select
                          id="have_insurance"
                          name="have_insurance"
                          value={formData.have_insurance}
                          onChange={handleFormChange}
                        >
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>
                      </div>
                    </div>

                    {formData.have_insurance === '1' && (
                      <div className="form-row-assets">
                        <div className="form-group-assets full-width-assets">
                          <label htmlFor="insurance_type">Insurance Type <span className="required-indicator-assets">*</span></label>
                          <select
                            id="insurance_type"
                            name="insurance_type"
                            value={formData.insurance_type}
                            onChange={handleFormChange}
                            disabled={loading.insurance || insuranceOptions.length === 0}
                            required
                          >
                            <option value="">{loading.insurance ? 'Loading insurance types...' : 'Select insurance type'}</option>
                            {!loading.insurance && insuranceOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="form-row-assets">
                      <div className="form-group-assets">
                        <label htmlFor="operational_status">Operational Status</label>
                        <select
                          id="operational_status"
                          name="operational_status"
                          value={formData.operational_status}
                          onChange={handleFormChange}
                        >
                          <option value="y">Operational</option>
                          <option value="n">Not Operational</option>
                        </select>
                      </div>
                      <div className="form-group-assets">
                        <label htmlFor="activated">Activation Status</label>
                        <select
                          id="activated"
                          name="activated"
                          value={formData.activated}
                          onChange={handleFormChange}
                        >
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="form-actions-assets">
                  <button type="submit" className="submit-btn-assets" disabled={loading.updating}>
                    {loading.updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="reset-btn-assets" onClick={closeEditModal} disabled={loading.updating}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;

