import React, { useEffect, useMemo, useState } from 'react';
import { FaClipboardList, FaPlane, FaCar, FaBolt, FaBatteryFull, FaGamepad } from 'react-icons/fa';
import '../../../styles/assetsRegistration.css';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchInsuranceTypes,
  selectInsuranceTypes,
  selectLoading,
  selectActiveTab,
} from '../../../store/slices/assetsSlice';
import { useGetWingsQuery, useGetBatteryTypesQuery } from '../../../api/services/assetsApi';

const parsePurchasePrice = (value) => {
  if (value === undefined || value === null) return null;
  const cleaned = typeof value === 'string' ? value.trim() : value;
  if (cleaned === '') return null;
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed)) return null;
  return Number(parsed.toFixed(2));
};

const parseWingId = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : String(parsed);
};

const FIELD_LABELS = {
  wing_id: 'wing',
};

const formatFieldLabel = (fieldName) => {
  if (!fieldName) return '';
  return FIELD_LABELS[fieldName] || fieldName.replace(/_/g, ' ');
};

const equipmentInitialState = {
  tag: '',
  serial: '',
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
  wing_id: '',
};

const batteryInitialState = {
  ...equipmentInitialState,
  type: ''
};

const vehicleInitialState = {
  ownership: '',
  chassis_no: '',
  engine_no: '',
  vehicle_no: '',
  make: '',
  model: '',
  purchase_price: '',
  insurance_expire_date: '',
  revenue_license_expire_date: '',
  initial_mileage: '',
  operational_status: 'y',
  activated: '1',
  wing_id: '',
};

const AssetsRegistration = ({ singleMode = false, selectedType = null }) => {
  const dispatch = useAppDispatch();
  
  // Get activeTab from Redux (set by AssetsRegistry) or default to 'drones'
  const reduxActiveTab = useAppSelector(selectActiveTab);
  const initialTab = singleMode && selectedType ? selectedType : (reduxActiveTab || 'drones');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Get from Redux
  const insuranceOptions = useAppSelector(selectInsuranceTypes);
  const loading = useAppSelector(selectLoading);
  const insuranceLoading = loading.insurance;
  const {
    data: wingsResponse,
    isLoading: wingsLoading,
    isError: wingsError,
    error: wingsErrorDetails,
  } = useGetWingsQuery();

  const {
    data: batteryTypesResponse,
    isLoading: batteryTypesLoading,
    isError: batteryTypesError,
  } = useGetBatteryTypesQuery();

  const wings = useMemo(() => {
    if (!wingsResponse) return [];
    if (Array.isArray(wingsResponse)) return wingsResponse;
    if (Array.isArray(wingsResponse?.data)) return wingsResponse.data;
    if (Array.isArray(wingsResponse?.wings)) return wingsResponse.wings;
    return [];
  }, [wingsResponse]);

  const batteryTypes = useMemo(() => {
    if (!batteryTypesResponse) return [];
    if (batteryTypesResponse?.status === 'true' || batteryTypesResponse?.status === true) {
      return batteryTypesResponse?.types || [];
    }
    if (Array.isArray(batteryTypesResponse)) return batteryTypesResponse;
    if (Array.isArray(batteryTypesResponse?.data)) return batteryTypesResponse.data;
    return [];
  }, [batteryTypesResponse]);

  const wingsErrorMessage = useMemo(() => {
    if (!wingsError) return '';
    if (typeof wingsErrorDetails === 'string') return wingsErrorDetails;
    if (wingsErrorDetails?.data?.message) return wingsErrorDetails.data.message;
    if (wingsErrorDetails?.message) return wingsErrorDetails.message;
    return 'Unable to load wings.';
  }, [wingsError, wingsErrorDetails]);

  // Sync with Redux activeTab when it changes (only if not in single mode)
  useEffect(() => {
    if (!singleMode && reduxActiveTab) {
      setActiveTab(reduxActiveTab);
    }
  }, [reduxActiveTab, singleMode]);

  // Set activeTab when selectedType changes in single mode
  useEffect(() => {
    if (singleMode && selectedType) {
      setActiveTab(selectedType);
    }
  }, [singleMode, selectedType]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [message]);

  const tabs = useMemo(() => ([
    { key: 'drones', label: 'Drones', icon: FaPlane },
    { key: 'vehicles', label: 'Vehicle', icon: FaCar },
    { key: 'generators', label: 'Generator', icon: FaBolt },
    { key: 'batteries', label: 'Battery', icon: FaBatteryFull },
    { key: 'remoteControls', label: 'Remote', icon: FaGamepad }
  ]), []);

  // Form fields for Drones
  const [droneFormData, setDroneFormData] = useState(() => ({ ...equipmentInitialState }));

  // Form fields for Vehicles
  const [vehicleFormData, setVehicleFormData] = useState(() => ({ ...vehicleInitialState }));

  // Form fields for Generators
  const [generatorFormData, setGeneratorFormData] = useState(() => ({ ...equipmentInitialState }));

  // Form fields for Batteries
  const [batteryFormData, setBatteryFormData] = useState(() => ({ ...batteryInitialState }));

  // Form fields for Remote Controls
  const [remoteControlFormData, setRemoteControlFormData] = useState(() => ({ ...equipmentInitialState }));

  const handleTabSelection = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    const setters = {
      drones: setDroneFormData,
      vehicles: setVehicleFormData,
      generators: setGeneratorFormData,
      batteries: setBatteryFormData,
      remoteControls: setRemoteControlFormData
    };
    const setter = setters[formType];
    if (!setter) return;
    setter(prev => {
      const updated = {
        ...prev,
        [name]: value
      };

      if (['drones', 'generators', 'batteries', 'remoteControls'].includes(formType) && name === 'have_insurance' && value !== '1') {
        updated.insurance_type = '';
      }

      return updated;
    });
  };

  const renderWingField = (formType, formData, fullWidth = false) => (
    <div className={`form-group-assets-reg ${fullWidth ? 'full-width-assets-reg' : ''}`}>
      <label htmlFor={`${formType}-wing_id`}>
        Wing <span className="required-assets-reg">*</span>
      </label>
      <select
        id={`${formType}-wing_id`}
        name="wing_id"
        value={formData.wing_id || ''}
        onChange={(e) => handleInputChange(e, formType)}
        disabled={wingsLoading || wings.length === 0}
        required
      >
        <option value="" disabled>
          {wingsLoading ? 'Loading wings...' : 'Select a wing'}
        </option>
        {wings.map((wing) => (
          <option key={wing.id} value={wing.id}>
            {wing.wing}
          </option>
        ))}
      </select>
      {wingsError && (
        <small className="form-field-helper-assets-reg error">
          {wingsErrorMessage}
        </small>
      )}
      {!wingsError && wingsLoading && (
        <small className="form-field-helper-assets-reg">Loading wings...</small>
      )}
    </div>
  );

  // Fetch insurance types on mount
  useEffect(() => {
    if (insuranceOptions.length === 0 && !insuranceLoading) {
      dispatch(fetchInsuranceTypes());
    }
  }, [dispatch, insuranceOptions.length, insuranceLoading]);

  const getRequiredFields = (tab, formData = {}) => {
    switch (tab) {
      case 'drones': {
        const fields = ['tag', 'serial', 'make', 'model', 'manufacture_year', 'depreciation_period', 'have_insurance', 'warranty_period', 'operational_status', 'activated', 'wing_id'];
        if (formData.have_insurance === '1') {
          fields.push('insurance_type');
        }
        fields.push('purchase_price');
        return fields;
      }
      case 'vehicles':
        return ['ownership', 'chassis_no', 'engine_no', 'vehicle_no', 'make', 'model', 'purchase_price', 'insurance_expire_date', 'revenue_license_expire_date', 'initial_mileage', 'operational_status', 'activated', 'wing_id'];
      case 'generators':
      case 'remoteControls': {
        const fields = ['tag', 'serial', 'make', 'model', 'manufacture_year', 'depreciation_period', 'have_insurance', 'warranty_period', 'operational_status', 'activated', 'wing_id'];
        if (formData.have_insurance === '1') {
          fields.push('insurance_type');
        }
        fields.push('purchase_price');
        return fields;
      }
      case 'batteries': {
        const fields = ['tag', 'serial', 'type', 'make', 'model', 'manufacture_year', 'depreciation_period', 'have_insurance', 'warranty_period', 'operational_status', 'activated', 'wing_id'];
        if (formData.have_insurance === '1') {
          fields.push('insurance_type');
        }
        fields.push('purchase_price');
        return fields;
      }
      default:
        return [];
    }
  };

  const resetForm = (tab) => {
    switch (tab) {
      case 'drones':
        setDroneFormData({ ...equipmentInitialState });
        break;
      case 'vehicles':
        setVehicleFormData({ ...vehicleInitialState });
        break;
      case 'generators':
        setGeneratorFormData({ ...equipmentInitialState });
        break;
      case 'batteries':
        setBatteryFormData({ ...batteryInitialState });
        break;
      case 'remoteControls':
        setRemoteControlFormData({ ...equipmentInitialState });
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e, tab) => {
    e.preventDefault();
    
    let formData;
    switch (tab) {
      case 'drones':
        formData = droneFormData;
        break;
      case 'vehicles':
        formData = vehicleFormData;
        break;
      case 'generators':
        formData = generatorFormData;
        break;
      case 'batteries':
        formData = batteryFormData;
        break;
      case 'remoteControls':
        formData = remoteControlFormData;
        break;
      default:
        return;
    }
    
    // Validate required fields
    const requiredFields = getRequiredFields(tab, formData);
    const missingFields = requiredFields.filter(field => !formData[field] || !formData[field].toString().trim());
    
    if (missingFields.length > 0) {
      const readableMissingFields = missingFields.map(formatFieldLabel);
      setMessage(`Please fill in all required fields: ${readableMissingFields.join(', ')}`);
      setMessageType('error');
      return;
    }

    const normalizedPurchasePrice = parsePurchasePrice(formData.purchase_price);
    if (normalizedPurchasePrice === null) {
      setMessage('Please enter a valid purchase price.');
      setMessageType('error');
      return;
    }

    const wingId = parseWingId(formData.wing_id);
    if (wingId === null) {
      setMessage('Please select a wing.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    // Helper function to format date to YYYY-MM-DD format
    const formatDate = (dateValue) => {
      if (!dateValue) return '';
      // If it's already in YYYY-MM-DD format, return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
      // If it's just a year (4 digits), convert to YYYY-MM-DD (using first day of year)
      if (/^\d{4}$/.test(dateValue)) return `${dateValue}-01-01`;
      // If it's a date string, ensure it's in YYYY-MM-DD format
      if (dateValue.includes('-')) {
        const parts = dateValue.split('-');
        if (parts.length === 3) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      }
      return dateValue;
    };

    try {
      if (tab === 'drones') {
        const payload = {
          tag: formData.tag.trim(),
          serial: formData.serial.trim(),
          make: formData.make.trim(),
          model: formData.model.trim(),
          manufacture_year: formatDate(formData.manufacture_year),
          depreciation_period: formData.depreciation_period,
          have_insurance: formData.have_insurance,
          insurance_type: formData.have_insurance === '1' ? formData.insurance_type : '0',
          warranty_period: formData.warranty_period,
          operational_status: formData.operational_status,
          activated: formData.activated,
          purchase_price: normalizedPurchasePrice,
          wing: wingId
        };

        const result = await dispatch(
          baseApi.endpoints.createDrone.initiate(payload)
        );
        const response = result.data;
        const isSuccess = response?.status === true || response?.status === 'true';

        if (!isSuccess) {
          throw new Error(response?.message || 'Failed to register drone. Please try again.');
        }

        setMessage('Drone registered successfully!');
        setMessageType('success');
        resetForm(tab);
      } else if (tab === 'vehicles') {
        const payload = {
          ownership: formData.ownership.trim(),
          chassis_no: formData.chassis_no.trim(),
          engine_no: formData.engine_no.trim(),
          vehicle_no: formData.vehicle_no.trim(),
          make: formData.make.trim(),
          model: formData.model.trim(),
          purchase_price: normalizedPurchasePrice,
          insurance_expire_date: formatDate(formData.insurance_expire_date),
          revenue_license_expire_date: formData.revenue_license_expire_date,
          initial_mileage: formData.initial_mileage,
          operational_status: formData.operational_status,
          activated: formData.activated,
          wing: wingId
        };

        const result = await dispatch(
          baseApi.endpoints.createVehicle.initiate(payload)
        );
        const response = result.data;
        const isSuccess = response?.status === true || response?.status === 'true';

        if (!isSuccess) {
          throw new Error(response?.message || 'Failed to register vehicle. Please try again.');
        }

        setMessage('Vehicle registered successfully!');
        setMessageType('success');
        resetForm(tab);
      } else if (tab === 'generators') {
        const payload = {
          tag: formData.tag.trim(),
          serial: formData.serial.trim(),
          make: formData.make.trim(),
          model: formData.model.trim(),
          manufacture_year: formatDate(formData.manufacture_year),
          depreciation_period: formData.depreciation_period,
          have_insurance: formData.have_insurance,
          insurance_type: formData.have_insurance === '1' ? formData.insurance_type : '0',
          warranty_period: formData.warranty_period,
          operational_status: formData.operational_status,
          activated: formData.activated,
          purchase_price: normalizedPurchasePrice,
          wing: wingId
        };

        const result = await dispatch(
          baseApi.endpoints.createGenerator.initiate(payload)
        );
        const response = result.data;
        const isSuccess = response?.status === true || response?.status === 'true';

        if (!isSuccess) {
          throw new Error(response?.message || 'Failed to register generator. Please try again.');
        }

        setMessage('Generator registered successfully!');
        setMessageType('success');
        resetForm(tab);
      } else if (tab === 'batteries') {
        const payload = {
          tag: formData.tag.trim(),
          serial: formData.serial.trim(),
          type: formData.type.trim(),
          make: formData.make.trim(),
          model: formData.model.trim(),
          manufacture_year: formatDate(formData.manufacture_year),
          depreciation_period: formData.depreciation_period,
          have_insurance: formData.have_insurance,
          insurance_type: formData.have_insurance === '1' ? formData.insurance_type : '0',
          warranty_period: formData.warranty_period,
          operational_status: formData.operational_status,
          activated: formData.activated,
          purchase_price: normalizedPurchasePrice,
          wing: wingId
        };

        const result = await dispatch(
          baseApi.endpoints.createBattery.initiate(payload)
        );
        const response = result.data;
        const isSuccess = response?.status === true || response?.status === 'true';

        if (!isSuccess) {
          throw new Error(response?.message || 'Failed to register battery. Please try again.');
        }

        setMessage('Battery registered successfully!');
        setMessageType('success');
        resetForm(tab);
      } else if (tab === 'remoteControls') {
        const payload = {
          tag: formData.tag.trim(),
          serial: formData.serial.trim(),
          make: formData.make.trim(),
          model: formData.model.trim(),
          manufacture_year: formatDate(formData.manufacture_year),
          depreciation_period: formData.depreciation_period,
          have_insurance: formData.have_insurance,
          insurance_type: formData.have_insurance === '1' ? formData.insurance_type : '0',
          warranty_period: formData.warranty_period,
          operational_status: formData.operational_status,
          activated: formData.activated,
          purchase_price: normalizedPurchasePrice,
          wing: wingId
        };

        const result = await dispatch(
          baseApi.endpoints.createRemoteControl.initiate(payload)
        );
        const response = result.data;
        const isSuccess = response?.status === true || response?.status === 'true';

        if (!isSuccess) {
          throw new Error(response?.message || 'Failed to register remote control. Please try again.');
        }

        setMessage('Remote control registered successfully!');
        setMessageType('success');
        resetForm(tab);
      }
    } catch (error) {
      setMessage(error.message || 'Failed to register asset. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDronesForm = () => (
    <form onSubmit={(e) => handleSubmit(e, 'drones')} className="assets-registration-form-assets-reg">
      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="tag">Tag <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="tag"
            name="tag"
            value={droneFormData.tag}
            onChange={(e) => handleInputChange(e, 'drones')}
            placeholder="Enter drone tag"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="serial">Serial Number <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="serial"
            name="serial"
            value={droneFormData.serial}
            onChange={(e) => handleInputChange(e, 'drones')}
            placeholder="Enter serial number"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="drone_purchase_price">Purchase Price (LKR) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="drone_purchase_price"
            name="purchase_price"
            value={droneFormData.purchase_price}
            onChange={(e) => handleInputChange(e, 'drones')}
            placeholder="Enter purchase price"
            min="0"
            step="0.01"
            required
          />
        </div>
        {renderWingField('drones', droneFormData)}
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="make">Make <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="make"
            name="make"
            value={droneFormData.make}
            onChange={(e) => handleInputChange(e, 'drones')}
            placeholder="Enter drone make"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="model">Model <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="model"
            name="model"
            value={droneFormData.model}
            onChange={(e) => handleInputChange(e, 'drones')}
            placeholder="Enter drone model"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="manufacture_year">Manufacture Date <span className="required-assets-reg">*</span></label>
          <input
            type="date"
            id="manufacture_year"
            name="manufacture_year"
            value={droneFormData.manufacture_year}
            onChange={(e) => handleInputChange(e, 'drones')}
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="depreciation_period">Depreciation Period (years) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="depreciation_period"
            name="depreciation_period"
            value={droneFormData.depreciation_period}
            onChange={(e) => handleInputChange(e, 'drones')}
            placeholder="Enter depreciation period"
            min="0"
            step="1"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="warranty_period">Warranty Period (years) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="warranty_period"
            name="warranty_period"
            value={droneFormData.warranty_period}
            onChange={(e) => handleInputChange(e, 'drones')}
            placeholder="Enter warranty period"
            min="0"
            step="1"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="have_insurance">Have Insurance? <span className="required-assets-reg">*</span></label>
          <select
            id="have_insurance"
            name="have_insurance"
            value={droneFormData.have_insurance}
            onChange={(e) => handleInputChange(e, 'drones')}
            required
          >
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
      </div>

      {droneFormData.have_insurance === '1' && (
        <div className="form-row-assets-reg">
          <div className="form-group-assets-reg full-width-assets-reg">
            <label htmlFor="insurance_type">Insurance Type <span className="required-assets-reg">*</span></label>
            <select
              id="insurance_type"
              name="insurance_type"
              value={droneFormData.insurance_type}
              onChange={(e) => handleInputChange(e, 'drones')}
              disabled={insuranceLoading || insuranceOptions.length === 0}
              required
            >
              <option value="">{insuranceLoading ? 'Loading insurance types...' : 'Select insurance type'}</option>
              {!insuranceLoading &&
                insuranceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.type}
                  </option>
                ))}
            </select>
            {!insuranceLoading && insuranceOptions.length === 0 && (
              <small style={{ color: '#d9534f' }}>No insurance types available.</small>
            )}
          </div>
        </div>
      )}

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="operational_status">Operational Status (Yes/No) <span className="required-assets-reg">*</span></label>
          <select
            id="operational_status"
            name="operational_status"
            value={droneFormData.operational_status}
            onChange={(e) => handleInputChange(e, 'drones')}
            required
          >
            <option value="y">Yes</option>
            <option value="n">No</option>
          </select>
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="activated">Activation Status <span className="required-assets-reg">*</span></label>
          <select
            id="activated"
            name="activated"
            value={droneFormData.activated}
            onChange={(e) => handleInputChange(e, 'drones')}
            required
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </div>

      <div className="form-actions-assets-reg">
        <button type="submit" className="submit-btn-assets-reg" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register Drone'}
        </button>
        <button type="button" className="reset-btn-assets-reg" onClick={() => resetForm('drones')} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );

  const renderVehiclesForm = () => (
    <form onSubmit={(e) => handleSubmit(e, 'vehicles')} className="assets-registration-form-assets-reg">
      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="ownership">Ownership <span className="required-assets-reg">*</span></label>
          <select
            id="ownership"
            name="ownership"
            value={vehicleFormData.ownership}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            required
          >
            <option value="">Select ownership type</option>
            <option value="o">Own Vehicle</option>
            <option value="r">Rented Vehicle</option>
          </select>
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="vehicle_no">Vehicle Number <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="vehicle_no"
            name="vehicle_no"
            value={vehicleFormData.vehicle_no}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter vehicle number"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="vehicle_purchase_price">Purchase Price (LKR) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="vehicle_purchase_price"
            name="purchase_price"
            value={vehicleFormData.purchase_price}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter purchase price"
            min="0"
            step="0.01"
            required
          />
        </div>
        {renderWingField('vehicles', vehicleFormData)}
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="make">Make <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="make"
            name="make"
            value={vehicleFormData.make}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter vehicle make"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="model">Model <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="model"
            name="model"
            value={vehicleFormData.model}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter vehicle model"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="chassis_no">Chassis Number <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="chassis_no"
            name="chassis_no"
            value={vehicleFormData.chassis_no}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter chassis number"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="engine_no">Engine Number <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="engine_no"
            name="engine_no"
            value={vehicleFormData.engine_no}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter engine number"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="insurance_expire_date">Insurance Expiry Date <span className="required-assets-reg">*</span></label>
          <input
            type="date"
            id="insurance_expire_date"
            name="insurance_expire_date"
            value={vehicleFormData.insurance_expire_date}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="revenue_license_expire_date">Revenue License Expiry Date <span className="required-assets-reg">*</span></label>
          <input
            type="date"
            id="revenue_license_expire_date"
            name="revenue_license_expire_date"
            value={vehicleFormData.revenue_license_expire_date}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="initial_mileage">Initial Mileage (km) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="initial_mileage"
            name="initial_mileage"
            value={vehicleFormData.initial_mileage}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter initial mileage"
            min="0"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="vehicle_operational_status">Operational Status (Yes/No) <span className="required-assets-reg">*</span></label>
          <select
            id="vehicle_operational_status"
            name="operational_status"
            value={vehicleFormData.operational_status}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            required
          >
            <option value="y">Yes</option>
            <option value="n">No</option>
          </select>
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg full-width-assets-reg">
          <label htmlFor="vehicle_activated">Activation Status <span className="required-assets-reg">*</span></label>
          <select
            id="vehicle_activated"
            name="activated"
            value={vehicleFormData.activated}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            required
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </div>

      <div className="form-actions-assets-reg">
        <button type="submit" className="submit-btn-assets-reg" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register Vehicle'}
        </button>
        <button type="button" className="reset-btn-assets-reg" onClick={() => resetForm('vehicles')} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );

  const renderGeneratorsForm = () => (
    <form onSubmit={(e) => handleSubmit(e, 'generators')} className="assets-registration-form-assets-reg">
      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="generator_tag">Tag <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="generator_tag"
            name="tag"
            value={generatorFormData.tag}
            onChange={(e) => handleInputChange(e, 'generators')}
            placeholder="Enter generator tag"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="generator_serial">Serial Number <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="generator_serial"
            name="serial"
            value={generatorFormData.serial}
            onChange={(e) => handleInputChange(e, 'generators')}
            placeholder="Enter serial number"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="generator_purchase_price">Purchase Price (LKR) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="generator_purchase_price"
            name="purchase_price"
            value={generatorFormData.purchase_price}
            onChange={(e) => handleInputChange(e, 'generators')}
            placeholder="Enter purchase price"
            min="0"
            step="0.01"
            required
          />
        </div>
        {renderWingField('generators', generatorFormData)}
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="generator_make">Make <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="generator_make"
            name="make"
            value={generatorFormData.make}
            onChange={(e) => handleInputChange(e, 'generators')}
            placeholder="Enter generator make"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="generator_model">Model <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="generator_model"
            name="model"
            value={generatorFormData.model}
            onChange={(e) => handleInputChange(e, 'generators')}
            placeholder="Enter generator model"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="generator_manufacture_year">Manufacture Date <span className="required-assets-reg">*</span></label>
          <input
            type="date"
            id="generator_manufacture_year"
            name="manufacture_year"
            value={generatorFormData.manufacture_year}
            onChange={(e) => handleInputChange(e, 'generators')}
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="generator_depreciation_period">Depreciation Period (years) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="generator_depreciation_period"
            name="depreciation_period"
            value={generatorFormData.depreciation_period}
            onChange={(e) => handleInputChange(e, 'generators')}
            placeholder="Enter depreciation period"
            min="0"
            step="1"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="generator_warranty_period">Warranty Period (years) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="generator_warranty_period"
            name="warranty_period"
            value={generatorFormData.warranty_period}
            onChange={(e) => handleInputChange(e, 'generators')}
            placeholder="Enter warranty period"
            min="0"
            step="1"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="generator_have_insurance">Have Insurance? <span className="required-assets-reg">*</span></label>
          <select
            id="generator_have_insurance"
            name="have_insurance"
            value={generatorFormData.have_insurance}
            onChange={(e) => handleInputChange(e, 'generators')}
            required
          >
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
      </div>

      {generatorFormData.have_insurance === '1' && (
        <div className="form-row-assets-reg">
          <div className="form-group-assets-reg full-width-assets-reg">
            <label htmlFor="generator_insurance_type">Insurance Type <span className="required-assets-reg">*</span></label>
            <select
              id="generator_insurance_type"
              name="insurance_type"
              value={generatorFormData.insurance_type}
              onChange={(e) => handleInputChange(e, 'generators')}
              disabled={insuranceLoading || insuranceOptions.length === 0}
              required
            >
              <option value="">{insuranceLoading ? 'Loading insurance types...' : 'Select insurance type'}</option>
              {!insuranceLoading &&
                insuranceOptions.map((option) => (
                  <option key={`generator-${option.id}`} value={option.id}>
                    {option.type}
                  </option>
                ))}
            </select>
            {!insuranceLoading && insuranceOptions.length === 0 && (
              <small style={{ color: '#d9534f' }}>No insurance types available.</small>
            )}
          </div>
        </div>
      )}

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="generator_operational_status">Operational Status (Yes/No) <span className="required-assets-reg">*</span></label>
          <select
            id="generator_operational_status"
            name="operational_status"
            value={generatorFormData.operational_status}
            onChange={(e) => handleInputChange(e, 'generators')}
            required
          >
            <option value="y">Yes</option>
            <option value="n">No</option>
          </select>
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="generator_activated">Activation Status <span className="required-assets-reg">*</span></label>
          <select
            id="generator_activated"
            name="activated"
            value={generatorFormData.activated}
            onChange={(e) => handleInputChange(e, 'generators')}
            required
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </div>

      <div className="form-actions-assets-reg">
        <button type="submit" className="submit-btn-assets-reg" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register Generator'}
        </button>
        <button type="button" className="reset-btn-assets-reg" onClick={() => resetForm('generators')} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );

  const renderBatteriesForm = () => (
    <form onSubmit={(e) => handleSubmit(e, 'batteries')} className="assets-registration-form-assets-reg">
      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="battery_tag">Tag <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="battery_tag"
            name="tag"
            value={batteryFormData.tag}
            onChange={(e) => handleInputChange(e, 'batteries')}
            placeholder="Enter battery tag"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="battery_serial">Serial Number <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="battery_serial"
            name="serial"
            value={batteryFormData.serial}
            onChange={(e) => handleInputChange(e, 'batteries')}
            placeholder="Enter serial number"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="battery_purchase_price">Purchase Price (LKR) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="battery_purchase_price"
            name="purchase_price"
            value={batteryFormData.purchase_price}
            onChange={(e) => handleInputChange(e, 'batteries')}
            placeholder="Enter purchase price"
            min="0"
            step="0.01"
            required
          />
        </div>
        {renderWingField('batteries', batteryFormData)}
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="battery_type">Type <span className="required-assets-reg">*</span></label>
          <select
            id="battery_type"
            name="type"
            value={batteryFormData.type}
            onChange={(e) => handleInputChange(e, 'batteries')}
            required
            disabled={batteryTypesLoading}
          >
            <option value="">Select Battery Type</option>
            {batteryTypes
              .filter((bt) => bt.activated === 1 || bt.activated === '1')
              .map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.type}
                </option>
              ))}
          </select>
          {batteryTypesError && (
            <span className="error-text-assets-reg" style={{ fontSize: '12px', color: '#d32f2f' }}>
              Failed to load battery types
            </span>
          )}
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="battery_make">Make <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="battery_make"
            name="make"
            value={batteryFormData.make}
            onChange={(e) => handleInputChange(e, 'batteries')}
            placeholder="Enter battery make"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="battery_model">Model <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="battery_model"
            name="model"
            value={batteryFormData.model}
            onChange={(e) => handleInputChange(e, 'batteries')}
            placeholder="Enter battery model"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="battery_manufacture_year">Manufacture Date <span className="required-assets-reg">*</span></label>
          <input
            type="date"
            id="battery_manufacture_year"
            name="manufacture_year"
            value={batteryFormData.manufacture_year}
            onChange={(e) => handleInputChange(e, 'batteries')}
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="battery_depreciation_period">Depreciation Period (years) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="battery_depreciation_period"
            name="depreciation_period"
            value={batteryFormData.depreciation_period}
            onChange={(e) => handleInputChange(e, 'batteries')}
            placeholder="Enter depreciation period"
            min="0"
            step="1"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="battery_warranty_period">Warranty Period (years) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="battery_warranty_period"
            name="warranty_period"
            value={batteryFormData.warranty_period}
            onChange={(e) => handleInputChange(e, 'batteries')}
            placeholder="Enter warranty period"
            min="0"
            step="1"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="battery_have_insurance">Have Insurance? <span className="required-assets-reg">*</span></label>
          <select
            id="battery_have_insurance"
            name="have_insurance"
            value={batteryFormData.have_insurance}
            onChange={(e) => handleInputChange(e, 'batteries')}
            required
          >
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
      </div>

      {batteryFormData.have_insurance === '1' && (
        <div className="form-row-assets-reg">
          <div className="form-group-assets-reg full-width-assets-reg">
            <label htmlFor="battery_insurance_type">Insurance Type <span className="required-assets-reg">*</span></label>
            <select
              id="battery_insurance_type"
              name="insurance_type"
              value={batteryFormData.insurance_type}
              onChange={(e) => handleInputChange(e, 'batteries')}
              disabled={insuranceLoading || insuranceOptions.length === 0}
              required
            >
              <option value="">{insuranceLoading ? 'Loading insurance types...' : 'Select insurance type'}</option>
              {!insuranceLoading &&
                insuranceOptions.map((option) => (
                  <option key={`battery-${option.id}`} value={option.id}>
                    {option.type}
                  </option>
                ))}
            </select>
            {!insuranceLoading && insuranceOptions.length === 0 && (
              <small style={{ color: '#d9534f' }}>No insurance types available.</small>
            )}
          </div>
        </div>
      )}

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="battery_operational_status">Operational Status (Yes/No) <span className="required-assets-reg">*</span></label>
          <select
            id="battery_operational_status"
            name="operational_status"
            value={batteryFormData.operational_status}
            onChange={(e) => handleInputChange(e, 'batteries')}
            required
          >
            <option value="y">Yes</option>
            <option value="n">No</option>
          </select>
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="battery_activated">Activation Status <span className="required-assets-reg">*</span></label>
          <select
            id="battery_activated"
            name="activated"
            value={batteryFormData.activated}
            onChange={(e) => handleInputChange(e, 'batteries')}
            required
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </div>

      <div className="form-actions-assets-reg">
        <button type="submit" className="submit-btn-assets-reg" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register Battery'}
        </button>
        <button type="button" className="reset-btn-assets-reg" onClick={() => resetForm('batteries')} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );

  const renderRemoteControlsForm = () => (
    <form onSubmit={(e) => handleSubmit(e, 'remoteControls')} className="assets-registration-form-assets-reg">
      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="remote_tag">Tag <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="remote_tag"
            name="tag"
            value={remoteControlFormData.tag}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            placeholder="Enter remote tag"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="remote_serial">Serial Number <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="remote_serial"
            name="serial"
            value={remoteControlFormData.serial}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            placeholder="Enter serial number"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="remote_purchase_price">Purchase Price (LKR) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="remote_purchase_price"
            name="purchase_price"
            value={remoteControlFormData.purchase_price}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            placeholder="Enter purchase price"
            min="0"
            step="0.01"
            required
          />
        </div>
        {renderWingField('remoteControls', remoteControlFormData)}
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="remote_make">Make <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="remote_make"
            name="make"
            value={remoteControlFormData.make}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            placeholder="Enter remote make"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="remote_model">Model <span className="required-assets-reg">*</span></label>
          <input
            type="text"
            id="remote_model"
            name="model"
            value={remoteControlFormData.model}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            placeholder="Enter remote model"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="remote_manufacture_year">Manufacture Date <span className="required-assets-reg">*</span></label>
          <input
            type="date"
            id="remote_manufacture_year"
            name="manufacture_year"
            value={remoteControlFormData.manufacture_year}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="remote_depreciation_period">Depreciation Period (years) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="remote_depreciation_period"
            name="depreciation_period"
            value={remoteControlFormData.depreciation_period}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            placeholder="Enter depreciation period"
            min="0"
            step="1"
            required
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="remote_warranty_period">Warranty Period (years) <span className="required-assets-reg">*</span></label>
          <input
            type="number"
            id="remote_warranty_period"
            name="warranty_period"
            value={remoteControlFormData.warranty_period}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            placeholder="Enter warranty period"
            min="0"
            step="1"
            required
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="remote_have_insurance">Have Insurance? <span className="required-assets-reg">*</span></label>
          <select
            id="remote_have_insurance"
            name="have_insurance"
            value={remoteControlFormData.have_insurance}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            required
          >
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
      </div>

      {remoteControlFormData.have_insurance === '1' && (
        <div className="form-row-assets-reg">
          <div className="form-group-assets-reg full-width-assets-reg">
            <label htmlFor="remote_insurance_type">Insurance Type <span className="required-assets-reg">*</span></label>
            <select
              id="remote_insurance_type"
              name="insurance_type"
              value={remoteControlFormData.insurance_type}
              onChange={(e) => handleInputChange(e, 'remoteControls')}
              disabled={insuranceLoading || insuranceOptions.length === 0}
              required
            >
              <option value="">{insuranceLoading ? 'Loading insurance types...' : 'Select insurance type'}</option>
              {!insuranceLoading &&
                insuranceOptions.map((option) => (
                  <option key={`remote-${option.id}`} value={option.id}>
                    {option.type}
                  </option>
                ))}
            </select>
            {!insuranceLoading && insuranceOptions.length === 0 && (
              <small style={{ color: '#d9534f' }}>No insurance types available.</small>
            )}
          </div>
        </div>
      )}

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="remote_operational_status">Operational Status (Yes/No) <span className="required-assets-reg">*</span></label>
          <select
            id="remote_operational_status"
            name="operational_status"
            value={remoteControlFormData.operational_status}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            required
          >
            <option value="y">Yes</option>
            <option value="n">No</option>
          </select>
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="remote_activated">Activation Status <span className="required-assets-reg">*</span></label>
          <select
            id="remote_activated"
            name="activated"
            value={remoteControlFormData.activated}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            required
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </div>

      <div className="form-actions-assets-reg">
        <button type="submit" className="submit-btn-assets-reg" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register Remote'}
        </button>
        <button type="button" className="reset-btn-assets-reg" onClick={() => resetForm('remoteControls')} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );

  return (
    <div className="assets-registration-container-assets-reg">
      <div className="assets-registration-header-assets-reg">
        <FaClipboardList className="header-icon-assets-reg" />
        <h2>Assets Registration</h2>
      </div>

      {/* Tab Navigation - Small tabs with max 5 per row (hidden in single mode) */}
      {!singleMode && (
        <div className="assets-tabs-assets-reg">
          <div className="tabs-wrapper-assets-reg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`asset-tab-assets-reg ${isActive ? 'active-assets-reg' : ''}`}
                  onClick={() => handleTabSelection(tab.key)}
                >
                  <Icon className="tab-icon-assets-reg" />
                  <span className="tab-text-assets-reg">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {message && (
        <div className={`message-assets-reg ${messageType}-assets-reg`}>
          {message}
        </div>
      )}

      {/* Tab Content */}
      <div className="assets-content-assets-reg">
        {activeTab === 'drones' && renderDronesForm()}
        {activeTab === 'vehicles' && renderVehiclesForm()}
        {activeTab === 'generators' && renderGeneratorsForm()}
        {activeTab === 'batteries' && renderBatteriesForm()}
        {activeTab === 'remoteControls' && renderRemoteControlsForm()}
      </div>
    </div>
  );
};

export default AssetsRegistration;

