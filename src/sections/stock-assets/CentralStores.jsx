import React, { useEffect, useState } from 'react';
import { FaPlane, FaCar, FaBolt, FaBatteryFull, FaGamepad, FaPlus, FaEye } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAssets, selectAssets, selectLoading, setActiveTab } from '../../store/slices/assetsSlice';
import '../../styles/assetsRegistry.css';
import AssetsRegistration from '../hr&admin/assets/AssetsRegistration';
import Assets from '../hr&admin/assets/Assets';

const ASSET_TYPES = [
  { key: 'drones', label: 'Drones', icon: FaPlane },
  { key: 'vehicles', label: 'Vehicles', icon: FaCar },
  { key: 'generators', label: 'Generators', icon: FaBolt },
  { key: 'batteries', label: 'Batteries', icon: FaBatteryFull },
  { key: 'remoteControls', label: 'Remote Controls', icon: FaGamepad },
];

const CentralStores = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewUpdate, setShowViewUpdate] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Pagination logic
  const totalPages = Math.ceil(ASSET_TYPES.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssetTypes = ASSET_TYPES.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = (assetType) => {
    setSelectedAssetType(assetType);
    dispatch(setActiveTab(assetType));
    setShowAddForm(true);
    setShowViewUpdate(false);
  };

  const handleViewUpdate = (assetType) => {
    setSelectedAssetType(assetType);
    dispatch(setActiveTab(assetType));
    setShowViewUpdate(true);
    setShowAddForm(false);
  };

  const handleCloseForms = () => {
    setShowAddForm(false);
    setShowViewUpdate(false);
    setSelectedAssetType(null);
  };

  if (showAddForm && selectedAssetType) {
    return (
      <div className="assets-registry-container">
        <div className="assets-registry-header">
          <button className="back-button" onClick={handleCloseForms}>
            ← Back to Registry
          </button>
          <h3>Add {ASSET_TYPES.find((t) => t.key === selectedAssetType)?.label}</h3>
        </div>
        <AssetsRegistration singleMode={true} selectedType={selectedAssetType} />
      </div>
    );
  }

  if (showViewUpdate && selectedAssetType) {
    return (
      <div className="assets-registry-container">
        <div className="assets-registry-header">
          <button className="back-button" onClick={handleCloseForms}>
            ← Back to Registry
          </button>
          <h3>View and Update {ASSET_TYPES.find((t) => t.key === selectedAssetType)?.label}</h3>
        </div>
        <Assets singleMode={true} selectedType={selectedAssetType} />
      </div>
    );
  }

  return (
    <div className="assets-registry-container">
      <div className="assets-registry-grid">
        {currentAssetTypes.map((assetType) => {
          const Icon = assetType.icon;
          const count = assetCounts[assetType.key] || 0;
          const isLoading = loading.assets;

          return (
            <div key={assetType.key} className="asset-card">
              <div className="asset-card-header">
                <div className="asset-icon-wrapper">
                  <Icon className="asset-icon" />
                </div>
                <div className="asset-info">
                  <h3 className="asset-name">{assetType.label}</h3>
                  <div className="asset-count">
                    <span className="count-label">Count:</span>
                    <span className="count-value">{isLoading ? '...' : count}</span>
                  </div>
                </div>
              </div>
              <div className="asset-card-actions">
                <button
                  className="action-button add-button"
                  onClick={() => handleAdd(assetType.key)}
                >
                  <FaPlus className="button-icon" />
                  Add
                </button>
                <button
                  className="action-button view-button"
                  onClick={() => handleViewUpdate(assetType.key)}
                >
                  <FaEye className="button-icon" />
                  View/Update
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="assets-registry-pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt; previous
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            next &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default CentralStores;

