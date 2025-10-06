import React, { useState, useEffect } from 'react';
import { viewBrokers, updateBroker, updateBrokerStatus } from '../../api/api';
import { FaSearch, FaEdit, FaEye, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import '../../styles/brokerManagement.css';

const BrokerManagement = () => {
  const [brokers, setBrokers] = useState([]);
  const [filteredBrokers, setFilteredBrokers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchBrokers();
  }, []);

  useEffect(() => {
    filterBrokers();
  }, [brokers, searchTerm]);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (message && messageType === 'success') {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message, messageType]);

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      const response = await viewBrokers();
      if (response.status === 'true') {
        setBrokers(response.brokers || []);
      } else {
        setBrokers([]);
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
      setBrokers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBrokers = () => {
    if (!searchTerm.trim()) {
      setFilteredBrokers(brokers);
      return;
    }

    const filtered = brokers.filter(broker =>
      broker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.mobile?.includes(searchTerm) ||
      broker.broker_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBrokers(filtered);
  };

  const handleViewBroker = (broker) => {
    setSelectedBroker(broker);
    setShowViewModal(true);
  };

  const handleEditBroker = (broker) => {
    setEditFormData({
      id: broker.id,
      broker_code: broker.broker_code || '',
      name: broker.name || '',
      mobile: broker.mobile || '',
      address: broker.address || '',
      nic: broker.nic || '',
      bank: broker.bank || '',
      branch: broker.branch || '',
      account: broker.account || '',
      percentage: broker.percentage || '',
      joined_date: broker.joined_date || ''
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateBroker = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'mobile', 'address', 'nic', 'joined_date', 'bank', 'branch', 'account', 'percentage'];
    const missingFields = requiredFields.filter(field => {
      const value = editFormData[field];
      // Handle both string and number fields
      if (typeof value === 'string') {
        return !value.trim();
      } else if (typeof value === 'number') {
        return value === null || value === undefined || value === '';
      } else {
        return !value;
      }
    });
    
    if (missingFields.length > 0) {
      setMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setMessageType('error');
      return;
    }

    setIsUpdating(true);
    setMessage('');

    try {
      const response = await updateBroker(
        editFormData.id,
        editFormData.name,
        editFormData.mobile,
        editFormData.address,
        editFormData.nic,
        editFormData.bank,
        editFormData.branch,
        editFormData.account,
        editFormData.percentage,
        editFormData.joined_date
      );
      
      if (response.status === 'true') {
        setMessage('Broker updated successfully!');
        setMessageType('success');
        setShowEditModal(false);
        fetchBrokers(); // Refresh the list
      } else {
        setMessage('Failed to update broker. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error updating broker:', error);
      setMessage('Error updating broker. Please try again.');
      setMessageType('error');
    } finally {
      setIsUpdating(false);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedBroker(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFormData({});
    setMessage('');
    setMessageType('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const handleToggleStatus = async (broker) => {
    const newStatus = broker.activated === 1 ? 0 : 1;
    
    setIsUpdatingStatus(prev => ({ ...prev, [broker.id]: true }));
    
    try {
      const response = await updateBrokerStatus(broker.id, newStatus);
      
      if (response.status === 'true') {
        setMessage(`Broker ${newStatus === 1 ? 'activated' : 'deactivated'} successfully!`);
        setMessageType('success');
        fetchBrokers(); // Refresh the list
      } else {
        setMessage('Failed to update broker status. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error updating broker status:', error);
      setMessage('Error updating broker status. Please try again.');
      setMessageType('error');
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [broker.id]: false }));
    }
  };

  return (
    <div className="broker-management-bro-manage">
      <h3 className="broker-management-title-bro-manage">Broker Management</h3>
      
      {/* Search Section */}
      <div className="search-section-bro-manage">
        <div className="search-input-group-bro-manage">
          <input
            type="text"
            placeholder="Search by name, NIC, mobile, or broker code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-bro-manage"
          />
          <button className="search-btn-bro-manage">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message-bro-manage ${messageType}`}>
          {message}
        </div>
      )}

      {/* Brokers Table */}
      <div className="brokers-table-container-bro-manage">
        {loading ? (
          <div className="loading-bro-manage">Loading brokers...</div>
        ) : filteredBrokers.length === 0 ? (
          <div className="no-data-bro-manage">
            {searchTerm ? 'No brokers found matching your search.' : 'No brokers available.'}
          </div>
        ) : (
                     <table className="brokers-table-bro-manage">
             <thead>
               <tr>
                 <th>Name</th>
                 <th>Broker Code</th>
                 <th>Mobile</th>
                 <th>NIC</th>
                 <th>Percentage</th>
                 <th>Actions</th>
               </tr>
             </thead>
             <tbody>
               {filteredBrokers.map((broker) => (
                 <tr key={broker.id}>
                   <td>{broker.name || '-'}</td>
                   <td>{broker.broker_code || '-'}</td>
                   <td>{broker.mobile || '-'}</td>
                   <td>{broker.nic || '-'}</td>
                   <td>{broker.percentage ? `${broker.percentage}%` : '-'}</td>
                   <td className="actions-bro-manage">
                     <button
                       onClick={() => handleViewBroker(broker)}
                       className="action-btn-bro-manage view-bro-manage"
                       title="View Details"
                     >
                       <FaEye />
                     </button>
                     <button
                       onClick={() => handleEditBroker(broker)}
                       className="action-btn-bro-manage edit-bro-manage"
                       title="Edit Broker"
                     >
                       <FaEdit />
                     </button>
                     <button
                       onClick={() => handleToggleStatus(broker)}
                       disabled={isUpdatingStatus[broker.id]}
                       className={`action-btn-bro-manage toggle-bro-manage ${broker.activated === 1 ? 'active' : 'inactive'}`}
                       title={broker.activated === 1 ? 'Deactivate Broker' : 'Activate Broker'}
                     >
                       {isUpdatingStatus[broker.id] ? (
                         <div className="loading-spinner-bro-manage"></div>
                       ) : broker.activated === 1 ? (
                         <FaToggleOn />
                       ) : (
                         <FaToggleOff />
                       )}
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>

      {/* View Broker Modal */}
      {showViewModal && selectedBroker && (
        <div className="modal-overlay-bro-manage" onClick={closeViewModal}>
          <div className="modal-content-bro-manage" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bro-manage">
              <h4>Broker Details</h4>
              <button 
                className="close-btn-bro-manage"
                onClick={closeViewModal}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body-bro-manage">
              <div className="detail-grid-bro-manage">
                <div className="detail-item-bro-manage">
                  <label>Broker Code:</label>
                  <span>{selectedBroker.broker_code || '-'}</span>
                </div>
                <div className="detail-item-bro-manage">
                  <label>Name:</label>
                  <span>{selectedBroker.name || '-'}</span>
                </div>
                <div className="detail-item-bro-manage">
                  <label>NIC:</label>
                  <span>{selectedBroker.nic || '-'}</span>
                </div>
                <div className="detail-item-bro-manage">
                  <label>Mobile:</label>
                  <span>{selectedBroker.mobile || '-'}</span>
                </div>
                <div className="detail-item-bro-manage">
                  <label>Joined Date:</label>
                  <span>{formatDate(selectedBroker.joined_date)}</span>
                </div>
                <div className="detail-item-bro-manage">
                  <label>Percentage:</label>
                  <span>{selectedBroker.percentage ? `${selectedBroker.percentage}%` : '-'}</span>
                </div>
                <div className="detail-item-bro-manage full-width-bro-manage">
                  <label>Address:</label>
                  <span>{selectedBroker.address || '-'}</span>
                </div>
                <div className="detail-item-bro-manage">
                  <label>Bank:</label>
                  <span>{selectedBroker.bank || '-'}</span>
                </div>
                <div className="detail-item-bro-manage">
                  <label>Branch:</label>
                  <span>{selectedBroker.branch || '-'}</span>
                </div>
                <div className="detail-item-bro-manage">
                  <label>Account Number:</label>
                  <span>{selectedBroker.account || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Broker Modal */}
      {showEditModal && (
        <div className="modal-overlay-bro-manage" onClick={closeEditModal}>
          <div className="modal-content-bro-manage edit-modal-bro-manage" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bro-manage">
              <h4>Edit Broker</h4>
              <button 
                className="close-btn-bro-manage"
                onClick={closeEditModal}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body-bro-manage">
              <form onSubmit={handleUpdateBroker} className="edit-form-bro-manage">
                <div className="form-row-bro-manage">
                  <div className="form-group-bro-manage">
                    <label>ID:</label>
                    <input
                      type="text"
                      value={editFormData.id || ''}
                      readOnly
                      className="readonly-field-bro-manage"
                    />
                  </div>
                  <div className="form-group-bro-manage">
                    <label>Broker Code:</label>
                    <input
                      type="text"
                      value={editFormData.broker_code || ''}
                      readOnly
                      className="readonly-field-bro-manage"
                    />
                  </div>
                </div>
                
                <div className="form-row-bro-manage">
                  <div className="form-group-bro-manage">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name || ''}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="form-group-bro-manage">
                    <label>NIC *</label>
                    <input
                      type="text"
                      name="nic"
                      value={editFormData.nic || ''}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row-bro-manage">
                  <div className="form-group-bro-manage">
                    <label>Mobile *</label>
                    <input
                      type="text"
                      name="mobile"
                      value={editFormData.mobile || ''}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="form-group-bro-manage">
                    <label>Joined Date *</label>
                    <input
                      type="date"
                      name="joined_date"
                      value={editFormData.joined_date || ''}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row-bro-manage">
                  <div className="form-group-bro-manage full-width-bro-manage">
                    <label>Address *</label>
                    <textarea
                      name="address"
                      value={editFormData.address || ''}
                      onChange={handleEditInputChange}
                      required
                      rows="2"
                    />
                  </div>
                </div>
                
                <div className="form-row-bro-manage">
                  <div className="form-group-bro-manage">
                    <label>Bank *</label>
                    <input
                      type="text"
                      name="bank"
                      value={editFormData.bank || ''}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="form-group-bro-manage">
                    <label>Branch *</label>
                    <input
                      type="text"
                      name="branch"
                      value={editFormData.branch || ''}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row-bro-manage">
                  <div className="form-group-bro-manage">
                    <label>Account Number *</label>
                    <input
                      type="text"
                      name="account"
                      value={editFormData.account || ''}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="form-group-bro-manage">
                    <label>Percentage *</label>
                    <input
                      type="number"
                      name="percentage"
                      value={editFormData.percentage || ''}
                      onChange={handleEditInputChange}
                      required
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="form-actions-bro-manage">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="submit-btn-bro-manage update-bro-manage"
                  >
                    {isUpdating ? 'Updating...' : 'Update Broker'}
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

export default BrokerManagement;
