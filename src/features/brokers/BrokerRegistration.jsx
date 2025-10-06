import React, { useState, useEffect } from 'react';
import { addBroker, searchBrokerByNIC } from '../../api/api';
import { FaUserPlus } from 'react-icons/fa';
import '../../styles/brokerRegistration.css';

const BrokerRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Auto-clear error messages after 10 seconds
  useEffect(() => {
    if (message && messageType === 'error') {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [message, messageType]);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    nic: '',
    joined_date: '',
    bank: '',
    branch: '',
    account: '',
    percentage: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'mobile', 'address', 'nic', 'joined_date', 'bank', 'branch', 'account', 'percentage'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // First check if broker already exists with this NIC
      const existingBroker = await searchBrokerByNIC(formData.nic);
      
      if (existingBroker.status === 'true') {
        setMessage('A broker with this NIC already exists. Please use a different NIC or contact the administrator.');
        setMessageType('error');
        return;
      }

      // If broker doesn't exist, proceed with registration
      await addBroker(
        formData.name,
        formData.mobile,
        formData.address,
        formData.nic,
        formData.bank,
        formData.branch,
        formData.account,
        formData.percentage,
        formData.joined_date
      );
      
      setMessage('Broker registered successfully!');
      setMessageType('success');
      
      // Clear form after successful registration
      setFormData({
        name: '',
        mobile: '',
        address: '',
        nic: '',
        joined_date: '',
        bank: '',
        branch: '',
        account: '',
        percentage: ''
      });
    } catch (error) {
      console.error('Error saving broker:', error);
      setMessage('Error saving broker. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="broker-registration">
      <h3>Broker Registration</h3>
      
      {/* Message Display */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="broker-form">
        {/* Broker Details Section */}
        <div className="form-section">
          <h4>Broker Details</h4>
          <div className="form-row">
            <div className="form-group-broker">
              <label>NIC *</label>
              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group-broker">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group-broker">
              <label>Mobile *</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group-broker">
              <label>Joined Date *</label>
              <input
                type="date"
                name="joined_date"
                value={formData.joined_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group-broker full-width">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows="2"
              />
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="form-section">
          <h4>Bank Details</h4>
          <div className="form-row">
            <div className="form-group-broker">
              <label>Bank *</label>
              <input
                type="text"
                name="bank"
                value={formData.bank}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group-broker">
              <label>Branch *</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group-broker">
              <label>Account Number *</label>
              <input
                type="text"
                name="account"
                value={formData.account}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group-broker">
              <label>Brokerage Percentage *</label>
              <input
                type="number"
                name="percentage"
                value={formData.percentage}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isLoading}
            className="submit-btn register"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                <FaUserPlus /> Register Broker
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrokerRegistration;
