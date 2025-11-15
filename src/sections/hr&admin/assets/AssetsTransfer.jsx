import React, { useEffect, useState } from 'react';
import { FaPlane, FaCar, FaBolt, FaBatteryFull, FaGamepad, FaExchangeAlt, FaArrowLeft } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAssets, selectAssets } from '../../../store/slices/assetsSlice';
import { baseApi } from '../../../api/services/allEndpoints';
import '../../../styles/assetsTransfer.css';

const ASSET_TYPES = [
  { key: 'drones', label: 'Drones', icon: FaPlane },
  { key: 'vehicles', label: 'Vehicles', icon: FaCar },
  { key: 'generators', label: 'Generators', icon: FaBolt },
  { key: 'batteries', label: 'Batteries', icon: FaBatteryFull },
  { key: 'remoteControls', label: 'Remote Controls', icon: FaGamepad },
];

const AssetsTransfer = () => {
  const dispatch = useAppDispatch();
  const [selectedAssetType, setSelectedAssetType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedSectorId, setSelectedSectorId] = useState(null);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [updating, setUpdating] = useState(false);
  const itemsPerPage = 12;

  // Get asset counts from Redux
  const drones = useAppSelector((state) => selectAssets(state, 'drones'));
  const vehicles = useAppSelector((state) => selectAssets(state, 'vehicles'));
  const generators = useAppSelector((state) => selectAssets(state, 'generators'));
  const batteries = useAppSelector((state) => selectAssets(state, 'batteries'));
  const remoteControls = useAppSelector((state) => selectAssets(state, 'remoteControls'));

  const assetCounts = {
    drones: drones.length,
    vehicles: vehicles.length,
    generators: generators.length,
    batteries: batteries.length,
    remoteControls: remoteControls.length,
  };

  // Fetch counts for all asset types
  useEffect(() => {
    ASSET_TYPES.forEach((type) => {
      dispatch(fetchAssets(type.key));
    });
  }, [dispatch]);

  // Fetch assets when an asset type is selected
  useEffect(() => {
    if (selectedAssetType) {
      dispatch(fetchAssets(selectedAssetType));
    }
  }, [selectedAssetType, dispatch]);

  // Get current assets based on selected type
  const getCurrentAssets = () => {
    switch (selectedAssetType) {
      case 'drones':
        return drones;
      case 'vehicles':
        return vehicles;
      case 'generators':
        return generators;
      case 'batteries':
        return batteries;
      case 'remoteControls':
        return remoteControls;
      default:
        return [];
    }
  };

  const handleTransfer = (assetType) => {
    setSelectedAssetType(assetType);
    setCurrentPage(1);
  };

  const handleBackToRegistry = () => {
    setSelectedAssetType(null);
    setCurrentPage(1);
  };

  const handleSectorClick = async (asset) => {
    setSelectedAsset(asset);
    setLoadingSectors(true);
    setShowSectorModal(true);
    try {
      const result = await dispatch(baseApi.endpoints.getSectors.initiate()).unwrap();
      // Handle different response structures: direct array or wrapped in data property
      let sectorsData = [];
      if (Array.isArray(result)) {
        sectorsData = result;
      } else if (result?.data && Array.isArray(result.data)) {
        sectorsData = result.data;
      } else if (result?.sectors && Array.isArray(result.sectors)) {
        sectorsData = result.sectors;
      }
      setSectors(sectorsData);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      setSectors([]);
    } finally {
      setLoadingSectors(false);
    }
  };

  const handleSectorSelect = (sectorId) => {
    setSelectedSectorId(sectorId);
  };

  const handleSaveSector = async () => {
    if (!selectedAsset || !selectedSectorId) return;

    setUpdating(true);
    try {
      let mutation;
      switch (selectedAssetType) {
        case 'drones':
          mutation = baseApi.endpoints.updateAssetsSectorDrone;
          break;
        case 'vehicles':
          mutation = baseApi.endpoints.updateAssetsSectorVehicle;
          break;
        case 'generators':
          mutation = baseApi.endpoints.updateAssetsSectorGenerator;
          break;
        case 'remoteControls':
          mutation = baseApi.endpoints.updateAssetsSectorRemoteControl;
          break;
        case 'batteries':
          mutation = baseApi.endpoints.updateAssetsSectorBattery;
          break;
        default:
          return;
      }

      const result = await dispatch(
        mutation.initiate({
          id: selectedAsset.id,
          sector_id: selectedSectorId,
        })
      ).unwrap();

      if (result?.status === true) {
        // Refresh assets
        dispatch(fetchAssets(selectedAssetType));
        setShowSectorModal(false);
        setSelectedAsset(null);
        setSelectedSectorId(null);
      }
    } catch (error) {
      console.error('Error updating sector:', error);
      alert('Failed to update sector. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formatSectorDisplay = (asset) => {
    const sector = asset?.sector ?? asset?.sector_name ?? asset?.sectorName ?? asset?.sector_title ?? '';
    return sector || 'Not Available';
  };

  const renderTableHeader = () => {
    if (selectedAssetType === 'vehicles') {
      return (
        <tr>
          <th>Vehicle No</th>
          <th>Make</th>
          <th>Model</th>
          <th>Sector</th>
        </tr>
      );
    }
    return (
      <tr>
        <th>Tag</th>
        <th>Model</th>
        <th>Make</th>
        <th>Sector</th>
      </tr>
    );
  };

  const renderTableRow = (asset) => {
    if (selectedAssetType === 'vehicles') {
      return (
        <tr key={asset.id}>
          <td>{asset.vehicle_no || asset.vehicleNo || '-'}</td>
          <td>{asset.make || '-'}</td>
          <td>{asset.model || '-'}</td>
          <td>
            <button
              type="button"
              className="sector-button"
              onClick={() => handleSectorClick(asset)}
            >
              {formatSectorDisplay(asset)}
            </button>
          </td>
        </tr>
      );
    }
    return (
      <tr key={asset.id}>
        <td>{asset.tag || asset.equipment_tag || '-'}</td>
        <td>{asset.model || '-'}</td>
        <td>{asset.make || '-'}</td>
        <td>
          <button
            type="button"
            className="sector-button"
            onClick={() => handleSectorClick(asset)}
          >
            {formatSectorDisplay(asset)}
          </button>
        </td>
      </tr>
    );
  };

  // Pagination logic for cards
  const totalPages = Math.ceil(ASSET_TYPES.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedTypes = ASSET_TYPES.slice(startIndex, startIndex + itemsPerPage);

  // If showing list view
  if (selectedAssetType) {
    const assets = getCurrentAssets();
    const assetTypeLabel = ASSET_TYPES.find((t) => t.key === selectedAssetType)?.label;

    return (
      <div className="assets-transfer-container">
        <div className="assets-transfer-header">
          <button type="button" className="back-button" onClick={handleBackToRegistry}>
            <FaArrowLeft /> Back to Registry
          </button>
          <h3>Transfer {assetTypeLabel}</h3>
        </div>

        <div className="assets-transfer-table-container">
          <table className="assets-transfer-table">
            <thead>{renderTableHeader()}</thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    No {assetTypeLabel.toLowerCase()} found
                  </td>
                </tr>
              ) : (
                assets.map((asset) => renderTableRow(asset))
              )}
            </tbody>
          </table>
        </div>

        {/* Sector Selection Modal */}
        {showSectorModal && (
          <div className="sector-modal-overlay" onClick={() => setShowSectorModal(false)}>
            <div className="sector-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sector-modal-header">
                <h3>Select Sector</h3>
                <button
                  type="button"
                  className="close-button"
                  onClick={() => setShowSectorModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="sector-modal-content">
                {loadingSectors ? (
                  <div className="loading">Loading sectors...</div>
                ) : (
                  <div className="sector-list">
                    {sectors.map((sector) => (
                      <button
                        key={sector.id}
                        type="button"
                        className={`sector-option ${selectedSectorId === sector.id ? 'selected' : ''}`}
                        onClick={() => handleSectorSelect(sector.id)}
                      >
                        {sector.sector}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="sector-modal-footer">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowSectorModal(false);
                    setSelectedSectorId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="save-button"
                  onClick={handleSaveSector}
                  disabled={!selectedSectorId || updating}
                >
                  {updating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Card view
  return (
    <div className="assets-transfer-container">
      <div className="assets-transfer-grid">
        {displayedTypes.map((type) => {
          const Icon = type.icon;
          const count = assetCounts[type.key] || 0;

          return (
            <div key={type.key} className="asset-transfer-card">
              <div className="asset-icon-wrapper">
                <Icon className="asset-icon" />
              </div>
              <div className="asset-info">
                <div className="asset-name">{type.label}</div>
                <div className="asset-count">Count: {count}</div>
              </div>
              <div className="transfer-button-container">
                <button
                  type="button"
                  className="transfer-button"
                  onClick={() => handleTransfer(type.key)}
                >
                  <FaExchangeAlt className="transfer-icon" />
                  Transfer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="pagination-button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="pagination-button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AssetsTransfer;

