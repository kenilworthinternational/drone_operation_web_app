import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/resourceAllocation.css';
import {
  useGetRemoteControlsQuery,
  useGetBatteriesQuery,
  useGetGeneratorsQuery,
  useGetDronesQuery,
  useGetPilotsWithTeamsQuery,
  useGetTeamEquipmentQuery,
  useGetTempAllocationsByDateQuery,
  useAssignRemoteControlMutation,
  useAssignBatteryMutation,
  useAssignGeneratorMutation,
  useAssignDroneMutation,
  useCreateTempRemoteControlMutation,
  useCreateTempBatteryMutation,
  useCreateTempGeneratorMutation,
  useCreateTempDroneMutation,
} from '../../api/services NodeJs/allEndpoints';
import { useGetBatteryTypesQuery } from '../../api/services/allEndpoints';

const ResourceAllocation = () => {
  const [activeTab, setActiveTab] = useState('availability');
  const [allocationDate, setAllocationDate] = useState('');
  const [selectedPilot, setSelectedPilot] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isTempAllocation, setIsTempAllocation] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState({});
  const [availabilityStatusFilter, setAvailabilityStatusFilter] = useState('all');
  const [availabilityCategoryFilter, setAvailabilityCategoryFilter] = useState('all');
  const [selectedBatteryType, setSelectedBatteryType] = useState(null);

  // Fetch equipment data
  const { data: remoteControlsData, isLoading: loadingRC } = useGetRemoteControlsQuery({ available: availabilityStatusFilter === 'not_assigned' ? 'true' : undefined });
  const { data: batteriesData, isLoading: loadingBatteries } = useGetBatteriesQuery({ 
    available: availabilityStatusFilter === 'not_assigned' ? 'true' : undefined,
    type: selectedBatteryType || undefined,
  });
  const { data: generatorsData, isLoading: loadingGenerators } = useGetGeneratorsQuery({ available: availabilityStatusFilter === 'not_assigned' ? 'true' : undefined });
  const { data: dronesData, isLoading: loadingDrones } = useGetDronesQuery({ available: availabilityStatusFilter === 'not_assigned' ? 'true' : undefined });
  const { data: pilotsData, isLoading: loadingPilots } = useGetPilotsWithTeamsQuery();
  const { data: batteryTypesData } = useGetBatteryTypesQuery();

  // Get team equipment if pilot/team is selected
  const { data: teamEquipmentData } = useGetTeamEquipmentQuery(selectedTeamId, { skip: !selectedTeamId });
  
  // Get temporary allocations if date is selected
  const { data: tempAllocationsData } = useGetTempAllocationsByDateQuery(allocationDate, { skip: !allocationDate || !isTempAllocation });

  // Mutations
  const [assignRemoteControl] = useAssignRemoteControlMutation();
  const [assignBattery] = useAssignBatteryMutation();
  const [assignGenerator] = useAssignGeneratorMutation();
  const [assignDrone] = useAssignDroneMutation();
  const [createTempRemoteControl] = useCreateTempRemoteControlMutation();
  const [createTempBattery] = useCreateTempBatteryMutation();
  const [createTempGenerator] = useCreateTempGeneratorMutation();
  const [createTempDrone] = useCreateTempDroneMutation();

  // Extract data from API responses
  const remoteControls = remoteControlsData?.data || [];
  const batteries = batteriesData?.data || [];
  const generators = generatorsData?.data || [];
  const drones = dronesData?.data || [];
  const pilots = pilotsData?.data || [];
  const batteryTypes = batteryTypesData?.data || [];
  const teamEquipment = teamEquipmentData?.data || {};
  const tempAllocations = tempAllocationsData?.data || {};

  // Group batteries by type
  const batteriesByType = useMemo(() => {
    const grouped = {};
    batteries.forEach(battery => {
      const typeName = battery.battery_type_name || 'Unknown';
      if (!grouped[typeName]) {
        grouped[typeName] = [];
      }
      grouped[typeName].push(battery);
    });
    return grouped;
  }, [batteries]);

  // Build availability categories from real data
  const availabilityCategories = useMemo(() => {
    const categories = [];

    // Drones
    if (drones.length > 0 || availabilityStatusFilter === 'all') {
      categories.push({
        title: 'Drones & Attachments',
        items: [{
          label: 'Drone',
          fullWidth: true,
          serials: drones.map(drone => ({
            id: drone.id,
            code: drone.serial || drone.tag || `DR-${drone.id}`,
            status: drone.is_assigned ? 'Assigned' : 'Not Assigned',
            note: drone.is_assigned ? (drone.assigned_team_name ? `Assigned to ${drone.assigned_team_name}` : 'Assigned') : 'Ready',
            team: drone.assigned_team_name,
          })),
        }],
      });
    }

    // Remote Controls
    if (remoteControls.length > 0 || availabilityStatusFilter === 'all') {
      categories.push({
        title: 'Remote Controllers & Cables',
        items: [{
          label: 'Remote Controller (RC)',
          fullWidth: false,
          serials: remoteControls.map(rc => ({
            id: rc.id,
            code: rc.serial || rc.tag || `RC-${rc.id}`,
            status: rc.is_assigned ? 'Assigned' : 'Not Assigned',
            note: rc.is_assigned ? (rc.assigned_team_name ? `Assigned to ${rc.assigned_team_name}` : 'Assigned') : 'Ready',
            team: rc.assigned_team_name,
          })),
        }],
      });
    }

    // Batteries (grouped by type)
    const batteryItems = Object.keys(batteriesByType).map(typeName => ({
      label: typeName,
      fullWidth: false,
      serials: batteriesByType[typeName].map(battery => ({
        id: battery.id,
        code: battery.serial || battery.tag || `BAT-${battery.id}`,
        status: battery.is_assigned ? 'Assigned' : 'Not Assigned',
        note: battery.is_assigned ? (battery.assigned_team_name ? `Assigned to ${battery.assigned_team_name}` : 'Assigned') : 'Ready',
        team: battery.assigned_team_name,
      })),
    }));

    if (batteryItems.length > 0 || availabilityStatusFilter === 'all') {
      categories.push({
        title: 'Batteries',
        items: batteryItems,
      });
    }

    // Generators
    if (generators.length > 0 || availabilityStatusFilter === 'all') {
      categories.push({
        title: 'Other Equipment',
        items: [{
          label: 'Generator',
          fullWidth: false,
          serials: generators.map(gen => ({
            id: gen.id,
            code: gen.serial || gen.tag || `GEN-${gen.id}`,
            status: gen.is_assigned ? 'Assigned' : 'Not Assigned',
            note: gen.is_assigned ? (gen.assigned_team_name ? `Assigned to ${gen.assigned_team_name}` : 'Assigned') : 'Ready',
            team: gen.assigned_team_name,
          })),
        }],
      });
    }

    return categories;
  }, [drones, remoteControls, batteriesByType, generators, availabilityStatusFilter]);

  // Filter availability data
  const filteredAvailabilityData = useMemo(() => {
    return availabilityCategories
      .map((category) => {
        const filteredItems = category.items
          .map((item) => {
            const filteredSerials = item.serials.filter((serial) => {
              if (availabilityStatusFilter === 'all') return true;
              if (availabilityStatusFilter === 'assigned') {
                return serial.status === 'Assigned';
              }
              return serial.status === 'Not Assigned';
            });
            return { ...item, serials: filteredSerials };
          })
          .filter((item) => item.serials.length > 0);

        if (filteredItems.length === 0) return null;
        return { ...category, items: filteredItems };
      })
      .filter(
        (category) =>
          category &&
          (availabilityCategoryFilter === 'all' || category.title === availabilityCategoryFilter)
      );
  }, [availabilityCategories, availabilityStatusFilter, availabilityCategoryFilter]);

  const categoryOptions = ['all', ...availabilityCategories.map((cat) => cat.title)];

  // Handle pilot selection
  useEffect(() => {
    if (selectedPilot) {
      const pilot = pilots.find(p => p.id === parseInt(selectedPilot));
      if (pilot && pilot.team_id) {
        setSelectedTeamId(pilot.team_id);
      } else {
        setSelectedTeamId('');
      }
    } else {
      setSelectedTeamId('');
    }
  }, [selectedPilot, pilots]);

  // Get available equipment options for allocation
  const getAvailableEquipment = (equipmentType, batteryType = null) => {
    switch (equipmentType) {
      case 'Remote Controller (RC)':
        return remoteControls.filter(rc => !rc.is_assigned).map(rc => ({
          value: rc.id,
          label: `${rc.serial || rc.tag || `RC-${rc.id}`} (${rc.make || ''} ${rc.model || ''})`.trim(),
        }));
      case 'Drone Battery':
      case 'RC Battery':
      case 'DRTK Battery':
        const typeId = batteryTypes.find(bt => bt.type === equipmentType.replace(' Battery', ''))?.id;
        return batteries
          .filter(b => !b.is_assigned && (!typeId || b.type === typeId))
          .map(b => ({
            value: b.id,
            label: `${b.serial || b.tag || `BAT-${b.id}`} (${b.battery_type_name || ''})`.trim(),
          }));
      case 'Generator':
        return generators.filter(g => !g.is_assigned).map(g => ({
          value: g.id,
          label: `${g.serial || g.tag || `GEN-${g.id}`} (${g.make || ''} ${g.model || ''})`.trim(),
        }));
      case 'Drone':
        return drones.filter(d => !d.is_assigned).map(d => ({
          value: d.id,
          label: `${d.serial || d.tag || `DR-${d.id}`} (${d.make || ''} ${d.model || ''})`.trim(),
        }));
      default:
        return [];
    }
  };

  // Handle allocation
  const handleAllocate = async () => {
    if (!selectedTeamId || !selectedPilot) {
      alert('Please select a pilot first');
      return;
    }

    try {
      const allocations = [];
      
      // Process each selected equipment
      for (const [assetName, equipmentIds] of Object.entries(selectedSerials)) {
        if (!equipmentIds || equipmentIds.length === 0) continue;

        const ids = Array.isArray(equipmentIds) ? equipmentIds.filter(id => id) : [equipmentIds].filter(id => id);
        
        for (const equipmentId of ids) {
          if (!equipmentId) continue;

          const allocationData = {
            team_id: selectedTeamId,
            assigned_by: null, // Will be set by backend from token
          };

          if (isTempAllocation && allocationDate) {
            allocationData.allocation_date = allocationDate;
          }

          if (assetName.includes('Remote Controller') || assetName.includes('RC')) {
            allocationData.remote_control_id = equipmentId;
            if (isTempAllocation) {
              await createTempRemoteControl(allocationData).unwrap();
            } else {
              await assignRemoteControl(allocationData).unwrap();
            }
          } else if (assetName.includes('Battery')) {
            allocationData.battery_id = equipmentId;
            if (isTempAllocation) {
              await createTempBattery(allocationData).unwrap();
            } else {
              await assignBattery(allocationData).unwrap();
            }
          } else if (assetName.includes('Generator')) {
            allocationData.generator_id = equipmentId;
            if (isTempAllocation) {
              await createTempGenerator(allocationData).unwrap();
            } else {
              await assignGenerator(allocationData).unwrap();
            }
          } else if (assetName.includes('Drone')) {
            allocationData.drone_id = equipmentId;
            if (isTempAllocation) {
              await createTempDrone(allocationData).unwrap();
            } else {
              await assignDrone(allocationData).unwrap();
            }
          }
        }
      }

      alert('Equipment allocated successfully!');
      // Reset form
      setSelectedSerials({});
      setSelectedPilot('');
      setAllocationDate('');
      setIsTempAllocation(false);
    } catch (error) {
      console.error('Error allocating equipment:', error);
      alert('Failed to allocate equipment. Please try again.');
    }
  };

  // Equipment list for allocation tab
  const allocationEquipmentList = [
    'Drone',
    'Remote Controller (RC)',
    'Drone Battery',
    'RC Battery',
    'DRTK Battery',
    'Generator',
  ];

  const handleSerialChange = (asset, index, value) => {
    setSelectedSerials((prev) => {
      const currentValues = prev[asset] ? [...prev[asset]] : [''];
      currentValues[index] = value;
      return {
        ...prev,
        [asset]: currentValues,
      };
    });
  };

  const handleAddSerial = (asset) => {
    setSelectedSerials((prev) => {
      const currentValues = prev[asset] ? [...prev[asset]] : [''];
      return {
        ...prev,
        [asset]: [...currentValues, ''],
      };
    });
  };

  const getSerialValues = (asset, isBattery) => {
    if (selectedSerials[asset]) {
      const values = selectedSerials[asset];
      return isBattery ? values : [values[0]];
    }
    return [''];
  };

  const isBatteryAsset = (asset) => asset.toLowerCase().includes('battery');

  const handleRemoveSerial = (asset, index) => {
    setSelectedSerials((prev) => {
      const currentValues = prev[asset] ? [...prev[asset]] : [''];
      if (currentValues.length === 1) {
        return prev;
      }
      currentValues.splice(index, 1);
      return {
        ...prev,
        [asset]: currentValues,
      };
    });
  };

  const isLoading = loadingRC || loadingBatteries || loadingGenerators || loadingDrones || loadingPilots;

  return (
    <div className="page-fleet">
      <div className="resource-tabs-container-fleet">
        {[
          { key: 'availability', label: 'Availability' },
          { key: 'allocation', label: 'Allocation' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`resource-tab-fleet ${activeTab === tab.key ? 'resource-tab-active-fleet' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            aria-pressed={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'availability' ? (
        <div className="availability-panel-fleet">
          <div className="availability-filters-toolbar">
            <div className="availability-status-filter">
              {[
                { key: 'all', label: 'All' },
                { key: 'not_assigned', label: 'Not Assigned' },
                { key: 'assigned', label: 'Assigned' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`availability-status-chip ${
                    availabilityStatusFilter === option.key ? 'active' : ''
                  }`}
                  onClick={() => setAvailabilityStatusFilter(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="availability-category-filter">
              <label htmlFor="availability-category">Category</label>
              <div className="filter-input-wrapper-fleet filter-select-wrapper-fleet">
                <select
                  id="availability-category"
                  className="filter-select-fleet"
                  value={availabilityCategoryFilter}
                  onChange={(e) => setAvailabilityCategoryFilter(e.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'all' ? 'All Categories' : option}
                    </option>
                  ))}
                </select>
                <span className="filter-select-icon-fleet" aria-hidden="true">
                  ˅
                </span>
              </div>
            </div>
            {availabilityCategoryFilter === 'Batteries' && (
              <div className="availability-category-filter">
                <label htmlFor="battery-type-filter">Battery Type</label>
                <div className="filter-input-wrapper-fleet filter-select-wrapper-fleet">
                  <select
                    id="battery-type-filter"
                    className="filter-select-fleet"
                    value={selectedBatteryType || ''}
                    onChange={(e) => setSelectedBatteryType(e.target.value || null)}
                  >
                    <option value="">All Types</option>
                    {batteryTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading equipment data...</div>
          ) : (
            <div className="availability-categories-fleet">
              {filteredAvailabilityData.map((category) => (
                <section
                  key={category?.title}
                  className="availability-category-fleet"
                >
                  <header className="availability-category-header">
                    <h3>{category?.title}</h3>
                  </header>
                  <div className="availability-category-content">
                    {category?.items?.map((item) => (
                      <div
                        key={item.label}
                        className={`availability-item-fleet${item.fullWidth ? ' single-column' : ''}`}
                      >
                        <div className="availability-item-header">
                          <div>
                            <p className="availability-item-label">{item.label}</p>
                          </div>
                        </div>
                        <div className="availability-serial-box">
                          <div className="availability-serial-title">Available Serial Numbers</div>
                          <div className="availability-serial-list">
                            {item.serials.map((serial) => (
                              <div key={`${item.label}-${serial.id}`} className="availability-serial-row">
                                <span className="availability-serial-code">{serial.code}</span>
                                <span className={`availability-status ${serial.status === 'Not Assigned' ? 'status-not-assigned' : 'status-assigned'}`}>
                                  {serial.status}
                                  {serial.team && ` - ${serial.team}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="allocation-container-fleet">
          <div className="allocation-filters-fleet">
            <div className="filter-field-fleet">
              <label className="filter-label-fleet" htmlFor="allocation-pilot">
                Select Pilot
              </label>
              <div className="filter-input-wrapper-fleet filter-select-wrapper-fleet">
                <select
                  id="allocation-pilot"
                  className="filter-select-fleet"
                  value={selectedPilot}
                  onChange={(e) => setSelectedPilot(e.target.value)}
                >
                  <option value="">-- Select a pilot --</option>
                  {pilots.map((pilot) => (
                    <option key={pilot.id} value={pilot.id}>
                      {pilot.name} {pilot.team_name ? `- ${pilot.team_name}` : '(No Team)'}
                    </option>
                  ))}
                </select>
                <span className="filter-select-icon-fleet" aria-hidden="true">
                  ˅
                </span>
              </div>
            </div>

            <div className={`filter-field-fleet ${isTempAllocation ? '' : 'date-disabled-fleet'}`}>
              <label className="filter-label-fleet" htmlFor="allocation-date">
                Select Date
              </label>
              <div className="filter-input-wrapper-fleet">
                <input
                  id="allocation-date"
                  type="date"
                  className="filter-input-fleet"
                  value={allocationDate}
                  disabled={!isTempAllocation}
                  onChange={(e) => setAllocationDate(e.target.value)}
                />
                <span className="filter-icon-fleet" aria-hidden="true">
                  📅
                </span>
              </div>
            </div>

            <div className="temp-actions-fleet">
              <div className={`temp-toggle-fleet ${isTempAllocation ? 'temp-toggle-active-fleet' : ''}`}>
                <label className="temp-toggle-label-fleet">
                  <input
                    type="checkbox"
                    checked={isTempAllocation}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setIsTempAllocation(enabled);
                      if (!enabled) {
                        setAllocationDate('');
                      }
                    }}
                  />
                  <span className="temp-toggle-text-fleet">
                    Temp Allocation
                    <span className="temp-toggle-hint-fleet">Enable for temporary use</span>
                  </span>
                </label>
              </div>
              <button 
                className="allocate-btn-fleet allocate-inline-btn-fleet"
                onClick={handleAllocate}
                disabled={!selectedPilot || (isTempAllocation && !allocationDate)}
              >
                Allocate
              </button>
            </div>
          </div>

          <div className="allocation-controls-fleet">
            <div className="allocation-grid-fleet">
              {allocationEquipmentList.map((asset, idx) => {
                const availableOptions = getAvailableEquipment(asset);
                return (
                  <div key={idx} className={`allocation-row-fleet ${isBatteryAsset(asset) ? 'battery-row-fleet' : ''}`}>
                    <div className="allocation-header-fleet">
                      <label className="allocation-label-fleet">{asset}</label>
                    </div>
                    {isBatteryAsset(asset) && (
                      <button
                        type="button"
                        className="add-serial-btn-fleet add-serial-btn-floating-fleet"
                        onClick={() => handleAddSerial(asset)}
                        aria-label="Add battery part"
                      >
                        +
                      </button>
                    )}
                    <div className={`allocation-inputs-fleet ${isBatteryAsset(asset) ? 'battery-inputs-fleet' : ''}`}>
                      {getSerialValues(asset, isBatteryAsset(asset)).map((value, serialIdx) => (
                        <div key={`${asset}-serial-${serialIdx}`} className="serial-select-wrapper-fleet">
                          {isBatteryAsset(asset) && (
                            <span className="serial-chip-fleet">{`Part ${String(serialIdx + 1).padStart(2, '0')}`}</span>
                          )}
                          <select
                            className="serial-select-fleet"
                            value={value}
                            onChange={(e) => handleSerialChange(asset, serialIdx, e.target.value)}
                            disabled={!selectedPilot}
                          >
                            <option value="">Select {asset}</option>
                            {availableOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {isBatteryAsset(asset) && serialIdx > 0 && (
                            <button
                              type="button"
                              className="remove-serial-btn-fleet"
                              onClick={() => handleRemoveSerial(asset, serialIdx)}
                              aria-label={`Remove part ${serialIdx + 1}`}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocation;
