import React, { useState } from 'react';
import { FaClipboardList, FaUsers } from 'react-icons/fa';
import '../../styles/supplierRegistration.css';
import SuppliersList from './SuppliersList';
import { useCreateSupplierMutation } from '../../api/services NodeJs/stockAssetsApi';

const SupplierRegistration = () => {
  const [activeTab, setActiveTab] = useState('registration');
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const [formData, setFormData] = useState({
    supplier_code: '',
    supplier_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    created_by: userData.id || null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.supplier_code || !formData.supplier_name || !formData.contact_person || !formData.phone) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    try {
      const result = await createSupplier(formData).unwrap();
      if (result.status) {
        setMessage('Supplier registered successfully');
        setMessageType('success');
        // Clear form
        setFormData({
          supplier_code: '',
          supplier_name: '',
          contact_person: '',
          email: '',
          phone: '',
          address: '',
          status: 'active',
          created_by: userData.id || null,
        });
      }
    } catch (error) {
      setMessage(error?.data?.message || 'Failed to register supplier');
      setMessageType('error');
    }
  };

  return (
    <div className="supplier-management-container">
      {/* Main Tab Navigation */}
      <div className="main-tabs-container-supplier-management">
        <button
          type="button"
          className={`main-tab-supplier-management ${activeTab === 'registration' ? 'active' : ''}`}
          onClick={() => setActiveTab('registration')}
        >
          <FaClipboardList className="main-tab-icon-supplier-management" />
          <span>Registration</span>
        </button>
        <button
          type="button"
          className={`main-tab-supplier-management ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          <FaUsers className="main-tab-icon-supplier-management" />
          <span>Suppliers</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="main-tab-content-supplier-management">
        {activeTab === 'registration' && (
          <div className="registration-section-supplier-management">
            <div className="supplier-registration-header">
              <h1 className="heading-supplier-registration">Supplier Registration</h1>
            </div>

            <div className="supplier-registration-content">
              {message && (
                <div className={`message-supplier-management ${messageType}`}>
                  {message}
                </div>
              )}
              <form className="form-supplier-registration" onSubmit={handleSubmit}>
                <div className="form-group-supplier-registration">
                  <label className="label-supplier-registration" htmlFor="supplier_code">
                    Supplier Code <span className="required-supplier-registration">*</span>
                  </label>
                  <input
                    type="text"
                    id="supplier_code"
                    name="supplier_code"
                    className="input-supplier-registration"
                    value={formData.supplier_code}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-supplier-registration">
                  <label className="label-supplier-registration" htmlFor="supplier_name">
                    Supplier Name <span className="required-supplier-registration">*</span>
                  </label>
                  <input
                    type="text"
                    id="supplier_name"
                    name="supplier_name"
                    className="input-supplier-registration"
                    value={formData.supplier_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-supplier-registration">
                  <label className="label-supplier-registration" htmlFor="contact_person">
                    Contact Person <span className="required-supplier-registration">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact_person"
                    name="contact_person"
                    className="input-supplier-registration"
                    value={formData.contact_person}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-supplier-registration">
                  <label className="label-supplier-registration" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="input-supplier-registration"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group-supplier-registration">
                  <label className="label-supplier-registration" htmlFor="phone">
                    Phone <span className="required-supplier-registration">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="input-supplier-registration"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-supplier-registration">
                  <label className="label-supplier-registration" htmlFor="address">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    className="textarea-supplier-registration"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="form-group-supplier-registration">
                  <label className="label-supplier-registration" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="select-supplier-registration"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-actions-supplier-registration">
                  <button type="submit" className="btn-submit-supplier-registration" disabled={isCreating}>
                    {isCreating ? 'Registering...' : 'Register Supplier'}
                  </button>
                  <button type="button" className="btn-cancel-supplier-registration" onClick={() => setFormData({
                    supplier_code: '',
                    supplier_name: '',
                    contact_person: '',
                    email: '',
                    phone: '',
                    address: '',
                    status: 'active',
                  })}>
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="suppliers-section-supplier-management">
            <SuppliersList />
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierRegistration;
