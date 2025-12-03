import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/resourceAllocation.css';
import {
  useGetFleetRemoteControlsQuery,
  useGetFleetBatteriesQuery,
  useGetFleetGeneratorsQuery,
  useGetFleetDronesQuery,
  useGetFleetPilotsWithTeamsQuery,
  useCreateFleetTeamMutation,
  useGetFleetTeamEquipmentQuery,
  useGetTempFleetAllocationsByDateQuery,
  useAssignFleetRemoteControlMutation,
  useAssignFleetBatteryMutation,
  useAssignFleetGeneratorMutation,
  useAssignFleetDroneMutation,
  useCreateTempFleetRemoteControlMutation,
  useCreateTempFleetBatteryMutation,
  useCreateTempFleetGeneratorMutation,
  useCreateTempFleetDroneMutation,
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
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  // Fetch equipment data
  const { data: remoteControlsData, isLoading: loadingRC } = useGetFleetRemoteControlsQuery({ 
    available: availabilityStatusFilter === 'not_assigned' ? 'true' : undefined 
  });
  const { data: batteriesData, isLoading: loadingBatteries } = useGetFleetBatteriesQuery({ 
    available: availabilityStatusFilter === 'not_assigned' ? 'true' : undefined,
    type: selectedBatteryType || undefined,
  });
  const { data: generatorsData, isLoading: loadingGenerators } = useGetFleetGeneratorsQuery({ 
    available: availabilityStatusFilter === 'not_assigned' ? 'true' : undefined 
  });
  const { data: dronesData, isLoading: loadingDrones } = useGetFleetDronesQuery({ 
    available: availabilityStatusFilter === 'not_assigned' ? 'true' : undefined 
  });
  const { data: pilotsData, isLoading: loadingPilots, refetch: refetchPilots } = useGetFleetPilotsWithTeamsQuery();
  const [createTeam] = useCreateFleetTeamMutation();
  const { data: batteryTypesData } = useGetBatteryTypesQuery();

  // Get team equipment if pilot/team is selected
  const { data: teamEquipmentData } = useGetFleetTeamEquipmentQuery(selectedTeamId, { skip: !selectedTeamId });
  
  // Get temporary allocations if date is selected
  const { data: tempAllocationsData } = useGetTempFleetAllocationsByDateQuery(allocationDate, { 
    skip: !allocationDate || !isTempAllocation 
  });

  // Mutations
  const [assignRemoteControl] = useAssignFleetRemoteControlMutation();
  const [assignBattery] = useAssignFleetBatteryMutation();
  const [assignGenerator] = useAssignFleetGeneratorMutation();
  const [assignDrone] = useAssignFleetDroneMutation();
  const [createTempRemoteControl] = useCreateTempFleetRemoteControlMutation();
  const [createTempBattery] = useCreateTempFleetBatteryMutation();
  const [createTempGenerator] = useCreateTempFleetGeneratorMutation();
  const [createTempDrone] = useCreateTempFleetDroneMutation();

  // Extract data from API responses
  const remoteControls = remoteControlsData?.data || [];
  const batteries = batteriesData?.data || [];
  const generators = generatorsData?.data || [];
  const drones = dronesData?.data || [];
  const pilots = pilotsData?.data || [];
  const batteryTypes = batteryTypesData?.data || [];

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
        title: 'Drones',
        items: [{
          label: 'Drone',
          fullWidth: true,
          serials: drones.map(drone => ({
            id: drone.id,
            tag: drone.tag || `TAG-${drone.id}`,
            serial: drone.serial || '',
            code: drone.tag || drone.serial || `DR-${drone.id}`,
            status: drone.is_assigned ? 'Assigned' : 'Not Assigned',
            note: drone.is_assigned 
              ? (drone.assigned_pilot_names ? `Assigned - ${drone.assigned_pilot_names}` : (drone.assigned_team_name ? `Assigned - ${drone.assigned_team_name}` : 'Assigned'))
              : 'Ready',
            team: drone.assigned_team_name,
            pilot: drone.assigned_pilot_names,
          })),
        }],
      });
    }

    // Remote Controls
    if (remoteControls.length > 0 || availabilityStatusFilter === 'all') {
      categories.push({
        title: 'Remote Controllers',
        items: [{
          label: 'Remote Controller (RC)',
          fullWidth: false,
          serials: remoteControls.map(rc => ({
            id: rc.id,
            tag: rc.tag || `TAG-${rc.id}`,
            serial: rc.serial || '',
            code: rc.tag || rc.serial || `RC-${rc.id}`,
            status: rc.is_assigned ? 'Assigned' : 'Not Assigned',
            note: rc.is_assigned 
              ? (rc.assigned_pilot_names ? `Assigned - ${rc.assigned_pilot_names}` : (rc.assigned_team_name ? `Assigned - ${rc.assigned_team_name}` : 'Assigned'))
              : 'Ready',
            team: rc.assigned_team_name,
            pilot: rc.assigned_pilot_names,
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
        tag: battery.tag || `TAG-${battery.id}`,
        serial: battery.serial || '',
        code: battery.tag || battery.serial || `BAT-${battery.id}`,
        status: battery.is_assigned ? 'Assigned' : 'Not Assigned',
        note: battery.is_assigned 
          ? (battery.assigned_pilot_names ? `Assigned - ${battery.assigned_pilot_names}` : (battery.assigned_team_name ? `Assigned - ${battery.assigned_team_name}` : 'Assigned'))
          : 'Ready',
        team: battery.assigned_team_name,
        pilot: battery.assigned_pilot_names,
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
        title: 'Generators',
        items: [{
          label: 'Generator',
          fullWidth: false,
          serials: generators.map(gen => ({
            id: gen.id,
            tag: gen.tag || `TAG-${gen.id}`,
            serial: gen.serial || '',
            code: gen.tag || gen.serial || `GEN-${gen.id}`,
            status: gen.is_assigned ? 'Assigned' : 'Not Assigned',
            note: gen.is_assigned 
              ? (gen.assigned_pilot_names ? `Assigned - ${gen.assigned_pilot_names}` : (gen.assigned_team_name ? `Assigned - ${gen.assigned_team_name}` : 'Assigned'))
              : 'Ready',
            team: gen.assigned_team_name,
            pilot: gen.assigned_pilot_names,
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
        setShowCreateTeamModal(false);
      } else {
        setSelectedTeamId('');
        setSelectedSerials({});
        // Show modal if pilot has no team
        if (pilot) {
          setShowCreateTeamModal(true);
        }
      }
    } else {
      setSelectedTeamId('');
      setSelectedSerials({});
      setShowCreateTeamModal(false);
    }
  }, [selectedPilot, pilots]);

  // Handle team creation
  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !selectedPilot) {
      alert('Please enter a team name');
      return;
    }

    try {
      const result = await createTeam({
        team_name: newTeamName.trim(),
        pilot_id: parseInt(selectedPilot),
      }).unwrap();

      if (result.status) {
        alert('Team created successfully!');
        setShowCreateTeamModal(false);
        setNewTeamName('');
        // Refetch pilots to get updated team info
        await refetchPilots();
        // The useEffect will automatically set the team_id when pilots are refetched
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert(error?.data?.message || 'Failed to create team. Please try again.');
    }
  };

  // Store permanent allocations separately
  const [permanentAllocations, setPermanentAllocations] = useState({});

  // Pre-populate dropdowns with team's current equipment (only for permanent allocation)
  useEffect(() => {
    if (teamEquipmentData?.data && selectedTeamId && !isTempAllocation) {
      const equipment = teamEquipmentData.data;
      const newSelectedSerials = {};
      const permanent = {};

      // Pre-populate Drone
      if (equipment.drones && equipment.drones.length > 0) {
        newSelectedSerials['Drone'] = [equipment.drones[0].equipment_id];
        permanent['Drone'] = equipment.drones.map(d => d.equipment_id);
      }

      // Pre-populate Remote Controller
      if (equipment.remote_controls && equipment.remote_controls.length > 0) {
        newSelectedSerials['Remote Controller (RC)'] = [equipment.remote_controls[0].equipment_id];
        permanent['Remote Controller (RC)'] = equipment.remote_controls.map(rc => rc.equipment_id);
      }

      // Pre-populate Generator
      if (equipment.generators && equipment.generators.length > 0) {
        newSelectedSerials['Generator'] = [equipment.generators[0].equipment_id];
        permanent['Generator'] = equipment.generators.map(g => g.equipment_id);
      }

      // Pre-populate Batteries by type
      if (equipment.batteries && equipment.batteries.length > 0) {
        const droneBatteries = [];
        const rcBatteries = [];
        const drtkBatteries = [];

        equipment.batteries.forEach(battery => {
          const typeName = battery.battery_type_name || '';
          if (typeName === 'Drone Battery') {
            droneBatteries.push(battery.equipment_id);
          } else if (typeName === 'RC Battery') {
            rcBatteries.push(battery.equipment_id);
          } else if (typeName === 'DRTK Battery') {
            drtkBatteries.push(battery.equipment_id);
          }
        });

        if (droneBatteries.length > 0) {
          newSelectedSerials['Drone Battery'] = droneBatteries;
          permanent['Drone Battery'] = droneBatteries;
        }
        if (rcBatteries.length > 0) {
          newSelectedSerials['RC Battery'] = rcBatteries;
          permanent['RC Battery'] = rcBatteries;
        }
        if (drtkBatteries.length > 0) {
          newSelectedSerials['DRTK Battery'] = drtkBatteries;
          permanent['DRTK Battery'] = drtkBatteries;
        }
      }

      setSelectedSerials(newSelectedSerials);
      setPermanentAllocations(permanent);
    } else if (!selectedTeamId || isTempAllocation) {
      // Clear selections when switching to temp allocation or no team selected
      if (isTempAllocation) {
        setSelectedSerials({});
      } else {
        setSelectedSerials({});
        setPermanentAllocations({});
      }
    }
  }, [teamEquipmentData, selectedTeamId, isTempAllocation]);

  // Get available equipment options for allocation
  const getAvailableEquipment = (equipmentType) => {
    // For temp allocation, exclude permanently allocated equipment
    const permanentIds = isTempAllocation ? (permanentAllocations[equipmentType] || []) : [];
    
    const isCurrentTeam = (equipment) => {
      return equipment.assigned_team_id === parseInt(selectedTeamId);
    };

    const isPermanentlyAllocated = (equipmentId) => {
      return permanentIds.includes(equipmentId);
    };

    switch (equipmentType) {
      case 'Remote Controller (RC)':
        return remoteControls
          .filter(rc => {
            if (isTempAllocation) {
              // For temp: only show unassigned equipment (exclude permanent allocations)
              return !rc.is_assigned && !isPermanentlyAllocated(rc.id);
            } else {
              // For permanent: show unassigned OR currently assigned to this team
              return !rc.is_assigned || isCurrentTeam(rc);
            }
          })
          .map(rc => ({
            value: rc.id,
            label: `${rc.serial || rc.tag || `RC-${rc.id}`} - ${rc.make || ''} ${rc.model || ''}`.trim(),
          }));
      case 'Drone Battery':
        const droneType = batteryTypes.find(bt => bt.type === 'Drone Battery');
        return batteries
          .filter(b => {
            if (b.type !== droneType?.id) return false;
            if (isTempAllocation) {
              return !b.is_assigned && !isPermanentlyAllocated(b.id);
            } else {
              return !b.is_assigned || isCurrentTeam(b);
            }
          })
          .map(b => ({
            value: b.id,
            label: `${b.serial || b.tag || `BAT-${b.id}`}`.trim(),
          }));
      case 'RC Battery':
        const rcType = batteryTypes.find(bt => bt.type === 'RC Battery');
        return batteries
          .filter(b => {
            if (b.type !== rcType?.id) return false;
            if (isTempAllocation) {
              return !b.is_assigned && !isPermanentlyAllocated(b.id);
            } else {
              return !b.is_assigned || isCurrentTeam(b);
            }
          })
          .map(b => ({
            value: b.id,
            label: `${b.serial || b.tag || `BAT-${b.id}`}`.trim(),
          }));
      case 'DRTK Battery':
        const drtkType = batteryTypes.find(bt => bt.type === 'DRTK Battery');
        return batteries
          .filter(b => {
            if (b.type !== drtkType?.id) return false;
            if (isTempAllocation) {
              return !b.is_assigned && !isPermanentlyAllocated(b.id);
            } else {
              return !b.is_assigned || isCurrentTeam(b);
            }
          })
          .map(b => ({
            value: b.id,
            label: `${b.serial || b.tag || `BAT-${b.id}`}`.trim(),
          }));
      case 'Generator':
        return generators
          .filter(g => {
            if (isTempAllocation) {
              return !g.is_assigned && !isPermanentlyAllocated(g.id);
            } else {
              return !g.is_assigned || isCurrentTeam(g);
            }
          })
          .map(g => ({
            value: g.id,
            label: `${g.serial || g.tag || `GEN-${g.id}`} - ${g.make || ''} ${g.model || ''}`.trim(),
          }));
      case 'Drone':
        return drones
          .filter(d => {
            if (isTempAllocation) {
              return !d.is_assigned && !isPermanentlyAllocated(d.id);
            } else {
              return !d.is_assigned || isCurrentTeam(d);
            }
          })
          .map(d => ({
            value: d.id,
            label: `${d.serial || d.tag || `DR-${d.id}`} - ${d.make || ''} ${d.model || ''}`.trim(),
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

    if (isTempAllocation && !allocationDate) {
      alert('Please select a date for temporary allocation');
      return;
    }

    try {
      // Process each selected equipment
      for (const [assetName, equipmentIds] of Object.entries(selectedSerials)) {
        if (!equipmentIds || equipmentIds.length === 0) continue;

        const ids = Array.isArray(equipmentIds) ? equipmentIds.filter(id => id) : [equipmentIds].filter(id => id);
        
        for (const equipmentId of ids) {
          if (!equipmentId) continue;

          const allocationData = {
            team_id: selectedTeamId,
          };

          if (isTempAllocation) {
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
      setSelectedTeamId('');
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
                  <span className="filter-select-icon-fleet" aria-hidden="true">
                    ˅
                  </span>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading equipment data...</div>
          ) : (
            <div className="availability-categories-fleet">
              {filteredAvailabilityData.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No equipment found matching your filters.
                </div>
              ) : (
                filteredAvailabilityData.map((category) => (
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
                              {item.serials.length === 0 ? (
                                <div style={{ padding: '1rem', color: '#999', textAlign: 'center' }}>
                                  No items available
                                </div>
                              ) : (
                                item.serials.map((serial) => (
                                  <div key={`${item.label}-${serial.id}`} className="availability-serial-row">
                                    <div className="availability-serial-code-wrapper">
                                      <span className="availability-serial-code">{serial.tag || serial.code}</span>
                                      {serial.serial && (
                                        <span className="availability-serial-number">{serial.serial}</span>
                                      )}
                                    </div>
                                    <span className={`availability-status ${serial.status === 'Not Assigned' ? 'status-not-assigned' : 'status-assigned'}`}>
                                      {serial.note || serial.status}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="allocation-container-fleet">
          {/* Create Team Modal */}
          {showCreateTeamModal && (
            <div className="create-team-modal-overlay-fleet" onClick={() => setShowCreateTeamModal(false)}>
              <div className="create-team-modal-fleet" onClick={(e) => e.stopPropagation()}>
                <div className="create-team-modal-header-fleet">
                  <h3>Create Equipment Group</h3>
                  <button 
                    className="create-team-modal-close-fleet"
                    onClick={() => {
                      setShowCreateTeamModal(false);
                      setSelectedPilot('');
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="create-team-modal-body-fleet">
                  <p className="create-team-modal-info-fleet">
                    The selected pilot doesn't have a team. Please create an equipment group (team) to allocate resources.
                  </p>
                  <div className="create-team-modal-field-fleet">
                    <label htmlFor="team-name-input" className="create-team-modal-label-fleet">
                      Equipment Group Name *
                    </label>
                    <input
                      id="team-name-input"
                      type="text"
                      className="create-team-modal-input-fleet"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Enter equipment group name"
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateTeam();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="create-team-modal-footer-fleet">
                  <button
                    className="create-team-modal-cancel-fleet"
                    onClick={() => {
                      setShowCreateTeamModal(false);
                      setSelectedPilot('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="create-team-modal-create-fleet"
                    onClick={handleCreateTeam}
                    disabled={!newTeamName.trim()}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hide allocation section if pilot has no team */}
          {!selectedTeamId && !showCreateTeamModal ? (
            <div className="no-team-message-fleet">
              <p>Please select a pilot with a team to allocate equipment.</p>
            </div>
          ) : (
            <>
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
                      {pilot.name}{pilot.team_name ? ` - ${pilot.team_name}` : ' (No Team)'}
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
            {isTempAllocation && Object.keys(permanentAllocations).length > 0 && (
              <div className="permanent-allocations-section-fleet">
                <div className="permanent-allocations-header-fleet">
                  <h4>Current Permanent Allocations</h4>
                  <span className="permanent-allocations-note-fleet">(These will remain unchanged)</span>
                </div>
                <div className="permanent-allocations-grid-fleet">
                  {allocationEquipmentList.map((asset, idx) => {
                    const permanentItems = permanentAllocations[asset] || [];
                    if (permanentItems.length === 0) return null;
                    
                    return (
                      <div key={`permanent-${idx}-${asset}`} className="permanent-allocation-item-fleet">
                        <label className="permanent-allocation-label-fleet">{asset}:</label>
                        <div className="permanent-allocation-values-fleet">
                          {permanentItems.map((itemId, itemIdx) => {
                            const equipment = 
                              asset === 'Drone' ? drones.find(d => d.id === itemId) :
                              asset === 'Remote Controller (RC)' ? remoteControls.find(rc => rc.id === itemId) :
                              asset === 'Generator' ? generators.find(g => g.id === itemId) :
                              batteries.find(b => b.id === itemId);
                            
                            const displayName = equipment 
                              ? `${equipment.serial || equipment.tag || `ID-${itemId}`}`
                              : `ID-${itemId}`;
                            
                            return (
                              <span key={`perm-${asset}-${itemIdx}`} className="permanent-allocation-badge-fleet">
                                {displayName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className={`allocation-section-fleet ${isTempAllocation ? 'temp-allocation-section-fleet' : ''}`}>
              {isTempAllocation && (
                <div className="temp-allocation-header-fleet">
                  <h4>Add Temporary Equipment</h4>
                  <span className="temp-allocation-note-fleet">Select additional equipment for temporary use</span>
                </div>
              )}
              <div className="allocation-grid-fleet">
                {allocationEquipmentList.map((asset, idx) => {
                  const availableOptions = getAvailableEquipment(asset);
                  return (
                    <div key={`equipment-${idx}-${asset}`} className={`allocation-row-fleet ${isBatteryAsset(asset) ? 'battery-row-fleet' : ''}`}>
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
                                <option key={`${asset}-${serialIdx}-${option.value}`} value={option.value}>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceAllocation;
