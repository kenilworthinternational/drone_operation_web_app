import React, { useState } from 'react';
import '../../styles/resourceAllocation.css';

const sampleAssets = [
  'Drone with spraying system',
  'Drone Battery',
  'Remote Controller (RC)',
  'RC Charging Dock',
  'RC Charging / cable',
  'Generator',
  'Charging station',
  'Spreading system',
  'DRTK',
  'DRTK Battery',
  'DRTK Charging Dock',
];

const pilotOptions = [
  { value: '', label: 'Select issued pilot' },
  { value: 'pilot-01', label: 'Pilot 01 — Jane K.' },
  { value: 'pilot-02', label: 'Pilot 02 — Anil P.' },
  { value: 'pilot-03', label: 'Pilot 03 — Sameera D.' },
];

const serialNumbers = ['Select Serial Number', 'SN-001', 'SN-002', 'SN-003', 'SN-004'];

const availabilityCategories = [
  {
    title: 'Drones & Attachments',
    items: [
      {
        label: 'Drone with spraying system',
        fullWidth: true,
        serials: [
          { code: 'DR-SP-001', status: 'Not Assigned', note: 'Ready' },
          { code: 'DR-SP-002', status: 'Not Assigned', note: 'Ready' },
          { code: 'DR-SP-003', status: 'Assigned', note: 'Assigned until 25/11/2025' },
          { code: 'DR-SP-004', status: 'Not Assigned', note: 'Ready' },
        ],
      },
      {
        label: 'Spreading system',
        fullWidth: true,
        serials: [
          { code: 'SP-ATT-001', status: 'Not Assigned', note: 'Ready' },
          { code: 'SP-ATT-002', status: 'Assigned', note: 'Assigned until 26/11/2025' },
          { code: 'SP-ATT-003', status: 'Not Assigned', note: 'Ready' },
        ],
      },
    ],
  },
  {
    title: 'Remote Controllers & Cables',
    items: [
      {
        label: 'Remote Controller (RC)',
        fullWidth: false,
        serials: [
          { code: 'RC-001', status: 'Not Assigned', note: 'Ready' },
          { code: 'RC-004', status: 'Assigned', note: 'Assigned until 23/11/2025' },
        ],
      },
      {
        label: 'RC Charging / cable',
        fullWidth: false,
        serials: [
          { code: 'RC-CAB-001', status: 'Not Assigned', note: 'Ready' },
          { code: 'RC-CAB-002', status: 'Not Assigned', note: 'Ready' },
          { code: 'RC-CAB-003', status: 'Assigned', note: 'Assigned until 21/11/2025' },
        ],
      },
    ],
  },
  {
    title: 'Batteries',
    items: [
      {
        label: 'Drone Battery',
        fullWidth: false,
        serials: [
          { code: 'DB-001', status: 'Not Assigned', note: 'Ready' },
          { code: 'DB-002', status: 'Not Assigned', note: 'Ready' },
          { code: 'DB-003', status: 'Assigned', note: 'Assigned' },
        ],
      },
      {
        label: 'DRTK Battery',
        fullWidth: false,
        serials: [
          { code: 'DRTK-B-001', status: 'Not Assigned', note: 'Ready' },
          { code: 'DRTK-B-002', status: 'Assigned', note: 'Assigned until 28/11/2025' },
        ],
      },
    ],
  },
  {
    title: 'Charging Docks & Stations',
    items: [
      {
        label: 'RC Charging Dock',
        fullWidth: false,
        serials: [
          { code: 'RC-DOCK-01', status: 'Not Assigned', note: 'Ready' },
          { code: 'RC-DOCK-02', status: 'Not Assigned', note: 'Ready' },
        ],
      },
      {
        label: 'Charging station',
        fullWidth: false,
        serials: [
          { code: 'CH-ST-01', status: 'Assigned', note: 'Assigned until 19/11/2025' },
          { code: 'CH-ST-02', status: 'Not Assigned', note: 'Ready' },
        ],
      },
      {
        label: 'DRTK Charging Dock',
        fullWidth: false,
        serials: [
          { code: 'DRTK-DOCK-01', status: 'Not Assigned', note: 'Ready' },
          { code: 'DRTK-DOCK-02', status: 'Assigned', note: 'Assigned' },
        ],
      },
    ],
  },
  {
    title: 'Other Equipment',
    items: [
      {
        label: 'Generator',
        fullWidth: false,
        serials: [
          { code: 'GEN-01', status: 'Not Assigned', note: 'Ready' },
          { code: 'GEN-02', status: 'Assigned', note: 'Assigned' },
        ],
      },
      {
        label: 'DRTK',
        fullWidth: false,
        serials: [
          { code: 'DRTK-01', status: 'Not Assigned', note: 'Ready' },
          { code: 'DRTK-02', status: 'Assigned', note: 'Assigned until 20/11/2025' },
        ],
      },
    ],
  },
];

const categoryOptions = ['all', ...availabilityCategories.map((cat) => cat.title)];

const ResourceAllocation = () => {
  const [activeTab, setActiveTab] = useState('availability'); // 'availability' | 'allocation'
  const [allocationDate, setAllocationDate] = useState('');
  const [selectedPilot, setSelectedPilot] = useState('');
  const [isTempAllocation, setIsTempAllocation] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState({});
  const [availabilityStatusFilter, setAvailabilityStatusFilter] = useState('all'); // all | assigned | not_assigned
  const [availabilityCategoryFilter, setAvailabilityCategoryFilter] = useState('all');

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

  const filteredAvailabilityData = availabilityCategories
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
          </div>

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
                            <div key={`${item.label}-${serial.code}`} className="availability-serial-row">
                              <span className="availability-serial-code">{serial.code}</span>
                              <span className={`availability-status ${serial.status === 'Not Assigned' ? 'status-not-assigned' : 'status-assigned'}`}>
                                {serial.status}
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
                  {pilotOptions.map((pilot) => (
                    <option key={pilot.value || 'placeholder'} value={pilot.value} disabled={pilot.value === ''}>
                      {pilot.label}
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
              <button className="allocate-btn-fleet allocate-inline-btn-fleet">Allocate</button>
            </div>
          </div>

          <div className="allocation-controls-fleet">
            <div className="allocation-grid-fleet">
              {sampleAssets.map((asset, idx) => (
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
                          >
                            {serialNumbers.map((serial) => (
                              <option
                                key={`${asset}-${serial}-${serialIdx}`}
                                value={serial === 'Select Serial Number' ? '' : serial}
                                disabled={serial === 'Select Serial Number'}
                              >
                                {serial}
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
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocation;
