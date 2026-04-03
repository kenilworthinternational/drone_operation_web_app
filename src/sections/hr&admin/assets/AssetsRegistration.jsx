import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import { useGetWingsQuery, useGetBatteryTypesQuery, useGetVehicleDriversQuery, useGetVehicleCategoriesQuery, useGetFuelCategoriesQuery } from '../../../api/services/assetsApi';

const parsePurchasePrice = (value) => {
  if (value === undefined || value === null) return null;
  const cleaned = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
  if (cleaned === '') return null;
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed)) return null;
  return Number(parsed.toFixed(2));
};

const sanitizeDecimalInput = (value) => {
  const input = String(value ?? '');
  const withoutCommas = input.replace(/,/g, '');
  const numeric = withoutCommas.replace(/[^\d.]/g, '');
  const firstDotIndex = numeric.indexOf('.');
  if (firstDotIndex === -1) {
    return numeric;
  }
  const integerPart = numeric.slice(0, firstDotIndex);
  const decimalPart = numeric.slice(firstDotIndex + 1).replace(/\./g, '');
  return `${integerPart}.${decimalPart}`;
};

const formatCurrencyInput = (value) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  const sanitized = sanitizeDecimalInput(value);
  if (!sanitized) {
    return '';
  }
  const [integerPartRaw, decimalPart] = sanitized.split('.');
  const integerPart = integerPartRaw || '0';
  const formattedInteger = Number.parseInt(integerPart, 10).toLocaleString('en-US');
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

const parseWingId = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : String(parsed);
};

// Prevent number input from changing when scrolling
const handleNumberInputWheel = (e) => {
  e.target.blur();
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
  // Driver information (vehicle_drivers table ID)
  driver: '',
  copy_of_registration_document: '',
  // Vehicle details
  vehicle_category: '',
  fuel_category: '',
  avg_fuel_consumption: '',
  tank_capacity_ltr: '',
  vehicle_revenue_license_image: '',
  smoke_test_image: '',
  insurance_image: '',
  // Service fields (already exist in table)
  last_serviced_meter: '',
  next_serviced: '',
  wheel_alignment_meter: '',
  next_wheel_alignment_meter: '',
  // Rented vehicle fields
  no_of_km_for_month: '',
  working_days: '',
  monthly_rate: '',
  rate_per_km: '',
  starting_date: '',
  end_date: '',
};

const AssetsRegistration = ({
  singleMode = false,
  selectedType = null,
  compactHeader = false,
  onVehicleRegisteredSuccess,
}) => {
  const dispatch = useAppDispatch();
  
  // Get activeTab from Redux (set by AssetsRegistry) or default to 'drones'
  const reduxActiveTab = useAppSelector(selectActiveTab);
  const initialTab = singleMode && selectedType ? selectedType : (reduxActiveTab || 'drones');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Refs for file inputs to clear them after successful submission
  const registrationDocRef = useRef(null);
  const revenueLicenseRef = useRef(null);
  const smokeTestRef = useRef(null);
  const insuranceRef = useRef(null);
  
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

  const {
    data: vehicleDriversResponse,
    isLoading: vehicleDriversLoading,
    isError: vehicleDriversError,
  } = useGetVehicleDriversQuery();

  const {
    data: vehicleCategoriesResponse,
    isLoading: vehicleCategoriesLoading,
  } = useGetVehicleCategoriesQuery();

  const {
    data: fuelCategoriesResponse,
    isLoading: fuelCategoriesLoading,
  } = useGetFuelCategoriesQuery();

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

  // Filter vehicle drivers based on ownership type
  const internalDrivers = useMemo(() => {
    if (!vehicleDriversResponse) return [];
    let drivers = [];
    if (Array.isArray(vehicleDriversResponse)) {
      drivers = vehicleDriversResponse;
    } else if (Array.isArray(vehicleDriversResponse?.drivers)) {
      drivers = vehicleDriversResponse.drivers;
    } else if (Array.isArray(vehicleDriversResponse?.data)) {
      drivers = vehicleDriversResponse.data;
    }
    // For own vehicles: member_type = 'i' (internal)
    return drivers.filter(driver => driver.member_type === 'i' && driver.activated === 1);
  }, [vehicleDriversResponse]);

  const externalDrivers = useMemo(() => {
    if (!vehicleDriversResponse) return [];
    let drivers = [];
    if (Array.isArray(vehicleDriversResponse)) {
      drivers = vehicleDriversResponse;
    } else if (Array.isArray(vehicleDriversResponse?.drivers)) {
      drivers = vehicleDriversResponse.drivers;
    } else if (Array.isArray(vehicleDriversResponse?.data)) {
      drivers = vehicleDriversResponse.data;
    }
    // For rented vehicles: member_type = 'e' (external) AND job_role = 'dri' (driver)
    return drivers.filter(driver => driver.member_type === 'e' && driver.job_role === 'dri' && driver.activated === 1);
  }, [vehicleDriversResponse]);

  const vehicleCategories = useMemo(() => {
    if (!vehicleCategoriesResponse) return [];
    // RTK Query returns the data directly from queryFn
    if (Array.isArray(vehicleCategoriesResponse)) return vehicleCategoriesResponse;
    // Fallback for nested structures
    if (Array.isArray(vehicleCategoriesResponse?.data)) return vehicleCategoriesResponse.data;
    return [];
  }, [vehicleCategoriesResponse]);

  const fuelCategories = useMemo(() => {
    if (!fuelCategoriesResponse) return [];
    // RTK Query returns the data directly from queryFn
    if (Array.isArray(fuelCategoriesResponse)) return fuelCategoriesResponse;
    // Fallback for nested structures
    if (Array.isArray(fuelCategoriesResponse?.data)) return fuelCategoriesResponse.data;
    return [];
  }, [fuelCategoriesResponse]);

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
  const currencyFields = new Set(['purchase_price', 'monthly_rate', 'rate_per_km']);
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
      const normalizedValue = currencyFields.has(name) ? sanitizeDecimalInput(value) : value;
      const updated = {
        ...prev,
        [name]: normalizedValue
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
      case 'vehicles': {
        const fields = ['ownership', 'chassis_no', 'engine_no', 'vehicle_no', 'make', 'model', 'purchase_price', 'insurance_expire_date', 'revenue_license_expire_date', 'initial_mileage', 'operational_status', 'activated', 'wing_id'];
        return fields;
      }
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
        // Clear file inputs
        if (registrationDocRef.current) registrationDocRef.current.value = '';
        if (revenueLicenseRef.current) revenueLicenseRef.current.value = '';
        if (smokeTestRef.current) smokeTestRef.current.value = '';
        if (insuranceRef.current) insuranceRef.current.value = '';
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
        // Create FormData for file uploads
        const formDataToSend = new FormData();
        
        // Add all non-file fields
        formDataToSend.append('ownership', formData.ownership.trim());
        formDataToSend.append('chassis_no', formData.chassis_no.trim());
        formDataToSend.append('engine_no', formData.engine_no.trim());
        formDataToSend.append('vehicle_no', formData.vehicle_no.trim());
        formDataToSend.append('make', formData.make.trim());
        formDataToSend.append('model', formData.model.trim());
        formDataToSend.append('purchase_price', normalizedPurchasePrice);
        if (formData.insurance_expire_date) {
          formDataToSend.append('insurance_expire_date', formatDate(formData.insurance_expire_date));
        }
        if (formData.revenue_license_expire_date) {
          formDataToSend.append('revenue_license_expire_date', formatDate(formData.revenue_license_expire_date));
        }
        formDataToSend.append('initial_mileage', formData.initial_mileage ? parseFloat(formData.initial_mileage) : 0);
        formDataToSend.append('operational_status', formData.operational_status);
        formDataToSend.append('activated', formData.activated);
        formDataToSend.append('wing', wingId);
        
        // Driver information
        if (formData.driver) {
          formDataToSend.append('driver', formData.driver);
        }
        if (formData.driver_license_no) {
          formDataToSend.append('driver_license_no', formData.driver_license_no.trim());
        }
        
        // Vehicle details
        if (formData.vehicle_category) {
          formDataToSend.append('vehicle_category', parseInt(formData.vehicle_category, 10));
        }
        if (formData.fuel_category) {
          formDataToSend.append('fuel_category', parseInt(formData.fuel_category, 10));
        }
        if (formData.avg_fuel_consumption) {
          formDataToSend.append('avg_fuel_consumption', parseFloat(formData.avg_fuel_consumption));
        }
        if (formData.tank_capacity_ltr) {
          formDataToSend.append('tank_capacity_ltr', parseFloat(formData.tank_capacity_ltr));
        }
        
        // Service fields
        if (formData.last_serviced_meter) {
          formDataToSend.append('last_serviced_meter', parseFloat(formData.last_serviced_meter));
        }
        if (formData.next_serviced) {
          formDataToSend.append('next_serviced', parseFloat(formData.next_serviced));
        }
        if (formData.wheel_alignment_meter) {
          formDataToSend.append('wheel_alignment_meter', parseFloat(formData.wheel_alignment_meter));
        }
        if (formData.next_wheel_alignment_meter) {
          formDataToSend.append('next_wheel_alignment_meter', parseFloat(formData.next_wheel_alignment_meter));
        }
        
        // Rented vehicle fields (only if rented)
        if (formData.ownership === 'r') {
          if (formData.no_of_km_for_month) {
            formDataToSend.append('no_of_km_for_month', parseInt(formData.no_of_km_for_month, 10));
          }
          if (formData.working_days) {
            formDataToSend.append('working_days', parseInt(formData.working_days, 10));
          }
          if (formData.monthly_rate) {
            formDataToSend.append('monthly_rate', parseFloat(formData.monthly_rate));
          }
          if (formData.rate_per_km) {
            formDataToSend.append('rate_per_km', parseFloat(formData.rate_per_km));
          }
          if (formData.starting_date) {
            formDataToSend.append('starting_date', formatDate(formData.starting_date));
          }
          if (formData.end_date) {
            formDataToSend.append('end_date', formatDate(formData.end_date));
          }
        }
        
        // Add files (only if they are File objects)
        if (formData.copy_of_registration_document instanceof File) {
          formDataToSend.append('copy_of_registration_document', formData.copy_of_registration_document);
        }
        if (formData.vehicle_revenue_license_image instanceof File) {
          formDataToSend.append('vehicle_revenue_license_image', formData.vehicle_revenue_license_image);
        }
        if (formData.smoke_test_image instanceof File) {
          formDataToSend.append('smoke_test_image', formData.smoke_test_image);
        }
        if (formData.insurance_image instanceof File) {
          formDataToSend.append('insurance_image', formData.insurance_image);
        }

        const result = await dispatch(
          baseApi.endpoints.createVehicle.initiate(formDataToSend)
        );
        if (result.error) {
          const errData = result.error?.data;
          throw new Error(errData?.message || result.error?.error || 'Failed to register vehicle. Please try again.');
        }
        const response = result.data;
        const isSuccess = response?.status === true || response?.status === 'true';

        if (!isSuccess) {
          throw new Error(response?.message || 'Failed to register vehicle. Please try again.');
        }

        setMessage('Vehicle registered successfully!');
        setMessageType('success');
        resetForm(tab);
        onVehicleRegisteredSuccess?.();
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
            type="text"
            inputMode="decimal"
            id="drone_purchase_price"
            name="purchase_price"
            value={formatCurrencyInput(droneFormData.purchase_price)}
            onChange={(e) => handleInputChange(e, 'drones')}
            onWheel={handleNumberInputWheel}
            placeholder="Enter purchase price"
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
            onWheel={handleNumberInputWheel}
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
            onWheel={handleNumberInputWheel}
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
            type="text"
            inputMode="decimal"
            onWheel={handleNumberInputWheel}
            id="vehicle_purchase_price"
            name="purchase_price"
            value={formatCurrencyInput(vehicleFormData.purchase_price)}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter purchase price"
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
            onWheel={handleNumberInputWheel}
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

      {/* Driver Information Section */}
      <div className="form-section-divider-assets-reg">
        <h4>Driver Information</h4>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="driver">Driver</label>
          <select
            id="driver"
            name="driver"
            value={vehicleFormData.driver}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            disabled={vehicleDriversLoading}
          >
            <option value="">
              {vehicleDriversLoading 
                ? 'Loading drivers...' 
                : (vehicleFormData.ownership === 'o' && internalDrivers.length === 0) || (vehicleFormData.ownership === 'r' && externalDrivers.length === 0)
                  ? 'No drivers available'
                  : 'Select driver'}
            </option>
            {vehicleFormData.ownership === 'o' ? (
              // Own Vehicle - Show Internal Drivers (member_type = 'i')
              internalDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.user_name} {driver.user_nic ? `(${driver.user_nic})` : ''}
                </option>
              ))
            ) : (
              // Rented Vehicle - Show External Drivers (member_type = 'e' AND job_role = 'dri')
              externalDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.user_name} {driver.user_nic ? `(${driver.user_nic})` : ''}
                </option>
              ))
            )}
          </select>
          <small className="form-field-helper-assets-reg">
            Driver license images are reused from User Registration driver profile.
          </small>
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="vehicle_category">Vehicle Category</label>
          <select
            id="vehicle_category"
            name="vehicle_category"
            value={vehicleFormData.vehicle_category}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            disabled={vehicleCategoriesLoading}
          >
            <option value="">{vehicleCategoriesLoading ? 'Loading...' : 'Select vehicle category'}</option>
            {vehicleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="fuel_category">Fuel Category</label>
          <select
            id="fuel_category"
            name="fuel_category"
            value={vehicleFormData.fuel_category}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            disabled={fuelCategoriesLoading}
          >
            <option value="">{fuelCategoriesLoading ? 'Loading...' : 'Select fuel category'}</option>
            {fuelCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="avg_fuel_consumption">Avg Fuel Consumption (km/L)</label>
          <input
            type="number"
            onWheel={handleNumberInputWheel}
            id="avg_fuel_consumption"
            name="avg_fuel_consumption"
            value={vehicleFormData.avg_fuel_consumption}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter average fuel consumption"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="tank_capacity_ltr">Tank Capacity (L)</label>
          <input
            type="number"
            onWheel={handleNumberInputWheel}
            id="tank_capacity_ltr"
            name="tank_capacity_ltr"
            value={vehicleFormData.tank_capacity_ltr}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter fuel tank capacity in litres"
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="last_serviced_meter">Last Serviced Meter (km)</label>
          <input
            type="number"
            onWheel={handleNumberInputWheel}
            id="last_serviced_meter"
            name="last_serviced_meter"
            value={vehicleFormData.last_serviced_meter}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter last serviced meter reading"
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="next_serviced">Next Service (km)</label>
          <input
            type="number"
            onWheel={handleNumberInputWheel}
            id="next_serviced"
            name="next_serviced"
            value={vehicleFormData.next_serviced}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter next service mileage"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="wheel_alignment_meter">Wheel Alignment Meter (km)</label>
          <input
            type="number"
            onWheel={handleNumberInputWheel}
            id="wheel_alignment_meter"
            name="wheel_alignment_meter"
            value={vehicleFormData.wheel_alignment_meter}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter wheel alignment meter reading"
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="next_wheel_alignment_meter">Next Wheel Alignment (km)</label>
          <input
            type="number"
            onWheel={handleNumberInputWheel}
            id="next_wheel_alignment_meter"
            name="next_wheel_alignment_meter"
            value={vehicleFormData.next_wheel_alignment_meter}
            onChange={(e) => handleInputChange(e, 'vehicles')}
            placeholder="Enter next wheel alignment mileage"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Document Uploads Section */}
      <div className="form-section-divider-assets-reg">
        <h4>Documents & Images</h4>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="copy_of_registration_document">Copy of Registration Document</label>
          <input
            ref={registrationDocRef}
            type="file"
            id="copy_of_registration_document"
            name="copy_of_registration_document"
            accept="image/*,.pdf"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setVehicleFormData(prev => ({ ...prev, copy_of_registration_document: file }));
              }
            }}
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="vehicle_revenue_license_image">Vehicle Revenue License Image</label>
          <input
            ref={revenueLicenseRef}
            type="file"
            id="vehicle_revenue_license_image"
            name="vehicle_revenue_license_image"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setVehicleFormData(prev => ({ ...prev, vehicle_revenue_license_image: file }));
              }
            }}
          />
        </div>
      </div>

      <div className="form-row-assets-reg">
        <div className="form-group-assets-reg">
          <label htmlFor="smoke_test_image">Smoke Test Image</label>
          <input
            ref={smokeTestRef}
            type="file"
            id="smoke_test_image"
            name="smoke_test_image"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setVehicleFormData(prev => ({ ...prev, smoke_test_image: file }));
              }
            }}
          />
        </div>
        <div className="form-group-assets-reg">
          <label htmlFor="insurance_image">Insurance Image</label>
          <input
            ref={insuranceRef}
            type="file"
            id="insurance_image"
            name="insurance_image"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setVehicleFormData(prev => ({ ...prev, insurance_image: file }));
              }
            }}
          />
        </div>
      </div>

      {/* Rented Vehicle Fields */}
      {vehicleFormData.ownership === 'r' && (
        <>
          <div className="form-section-divider-assets-reg">
            <h4>Rental Information</h4>
          </div>

          <div className="form-row-assets-reg">
            <div className="form-group-assets-reg">
              <label htmlFor="no_of_km_for_month">No of KM for Month</label>
              <input
                type="number"
            onWheel={handleNumberInputWheel}
                id="no_of_km_for_month"
                name="no_of_km_for_month"
                value={vehicleFormData.no_of_km_for_month}
                onChange={(e) => handleInputChange(e, 'vehicles')}
                placeholder="Enter number of KM for month"
                min="0"
              />
            </div>
            <div className="form-group-assets-reg">
              <label htmlFor="working_days">Working Days</label>
              <input
                type="number"
            onWheel={handleNumberInputWheel}
                id="working_days"
                name="working_days"
                value={vehicleFormData.working_days}
                onChange={(e) => handleInputChange(e, 'vehicles')}
                placeholder="Enter working days"
                min="0"
              />
            </div>
          </div>

          <div className="form-row-assets-reg">
            <div className="form-group-assets-reg">
              <label htmlFor="monthly_rate">Monthly Rate (LKR)</label>
              <input
                type="text"
                inputMode="decimal"
            onWheel={handleNumberInputWheel}
                id="monthly_rate"
                name="monthly_rate"
                value={formatCurrencyInput(vehicleFormData.monthly_rate)}
                onChange={(e) => handleInputChange(e, 'vehicles')}
                placeholder="Enter monthly rate"
              />
            </div>
            <div className="form-group-assets-reg">
              <label htmlFor="rate_per_km">Rate (Per KM) (LKR)</label>
              <input
                type="text"
                inputMode="decimal"
            onWheel={handleNumberInputWheel}
                id="rate_per_km"
                name="rate_per_km"
                value={formatCurrencyInput(vehicleFormData.rate_per_km)}
                onChange={(e) => handleInputChange(e, 'vehicles')}
                placeholder="Enter rate per KM"
              />
            </div>
          </div>

          <div className="form-row-assets-reg">
            <div className="form-group-assets-reg">
              <label htmlFor="starting_date">Starting Date</label>
              <input
                type="date"
                id="starting_date"
                name="starting_date"
                value={vehicleFormData.starting_date}
                onChange={(e) => handleInputChange(e, 'vehicles')}
              />
            </div>
            <div className="form-group-assets-reg">
              <label htmlFor="end_date">End Date</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={vehicleFormData.end_date}
                onChange={(e) => handleInputChange(e, 'vehicles')}
              />
            </div>
          </div>
        </>
      )}

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
            type="text"
            inputMode="decimal"
            onWheel={handleNumberInputWheel}
            id="generator_purchase_price"
            name="purchase_price"
            value={formatCurrencyInput(generatorFormData.purchase_price)}
            onChange={(e) => handleInputChange(e, 'generators')}
            placeholder="Enter purchase price"
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
            onWheel={handleNumberInputWheel}
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
            onWheel={handleNumberInputWheel}
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
            type="text"
            inputMode="decimal"
            onWheel={handleNumberInputWheel}
            id="battery_purchase_price"
            name="purchase_price"
            value={formatCurrencyInput(batteryFormData.purchase_price)}
            onChange={(e) => handleInputChange(e, 'batteries')}
            placeholder="Enter purchase price"
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
            onWheel={handleNumberInputWheel}
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
            onWheel={handleNumberInputWheel}
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
            type="text"
            inputMode="decimal"
            onWheel={handleNumberInputWheel}
            id="remote_purchase_price"
            name="purchase_price"
            value={formatCurrencyInput(remoteControlFormData.purchase_price)}
            onChange={(e) => handleInputChange(e, 'remoteControls')}
            placeholder="Enter purchase price"
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
            onWheel={handleNumberInputWheel}
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
            onWheel={handleNumberInputWheel}
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
      {!compactHeader && (
        <div className="assets-registration-header-assets-reg">
          <FaClipboardList className="header-icon-assets-reg" />
          <h2>Assets Registration</h2>
        </div>
      )}

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

