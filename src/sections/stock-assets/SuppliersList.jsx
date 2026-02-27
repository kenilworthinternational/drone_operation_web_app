import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaEdit, FaEye, FaTimes } from 'react-icons/fa';
import '../../styles/supplierRegistration.css';
import {
  useGetSuppliersQuery,
  useUpdateSupplierMutation,
  useGetMainCategoriesQuery,
  useGetSubCategoriesQuery,
  useGetSubSubCategoriesQuery,
} from '../../api/services NodeJs/stockAssetsApi';

const SuppliersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [editSelectedMainCategory, setEditSelectedMainCategory] = useState('');
  const [editSelectedSubCategory, setEditSelectedSubCategory] = useState('');

  const { data: suppliersResponse, isLoading, error, refetch } = useGetSuppliersQuery({});
  const [updateSupplier] = useUpdateSupplierMutation();

  const { data: mainCategoriesResponse } = useGetMainCategoriesQuery({});
  const { data: editSubCategoriesResponse } = useGetSubCategoriesQuery(
    editSelectedMainCategory ? { main_category_id: editSelectedMainCategory } : {},
    { skip: !editSelectedMainCategory }
  );
  const { data: editSubSubCategoriesResponse } = useGetSubSubCategoriesQuery(
    editSelectedSubCategory ? { sub_category_id: editSelectedSubCategory } : {},
    { skip: !editSelectedSubCategory }
  );

  const mainCategories = Array.isArray(mainCategoriesResponse)
    ? mainCategoriesResponse
    : (mainCategoriesResponse?.data ? (Array.isArray(mainCategoriesResponse.data) ? mainCategoriesResponse.data : []) : []);
  const editSubCategories = Array.isArray(editSubCategoriesResponse)
    ? editSubCategoriesResponse
    : (editSubCategoriesResponse?.data ? (Array.isArray(editSubCategoriesResponse.data) ? editSubCategoriesResponse.data : []) : []);
  const editSubSubCategories = Array.isArray(editSubSubCategoriesResponse)
    ? editSubSubCategoriesResponse
    : (editSubSubCategoriesResponse?.data ? (Array.isArray(editSubSubCategoriesResponse.data) ? editSubSubCategoriesResponse.data : []) : []);

  const suppliers = useMemo(() => {
    if (!suppliersResponse) return [];
    if (Array.isArray(suppliersResponse)) return suppliersResponse;
    if (suppliersResponse.data && Array.isArray(suppliersResponse.data)) return suppliersResponse.data;
    if (suppliersResponse.data?.data && Array.isArray(suppliersResponse.data.data)) return suppliersResponse.data.data;
    return [];
  }, [suppliersResponse]);

  useEffect(() => {
    if (message && messageType === 'success') {
      const timer = setTimeout(() => { setMessage(''); setMessageType(''); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, messageType]);

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return suppliers;
    return suppliers.filter((supplier) =>
      supplier.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplier_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm) ||
      supplier.main_category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.sub_category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditFormData({
      id: supplier.id,
      supplier_code: supplier.supplier_code || '',
      supplier_name: supplier.supplier_name || '',
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      main_category_id: supplier.main_category_id || '',
      sub_category_id: supplier.sub_category_id || '',
      sub_sub_category_id: supplier.sub_sub_category_id || '',
      status: supplier.status || 'active',
    });
    setEditSelectedMainCategory(supplier.main_category_id || '');
    setEditSelectedSubCategory(supplier.sub_category_id || '');
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    if (!editFormData.supplier_name || !editFormData.contact_person || !editFormData.phone) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }
    setMessage('');
    try {
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const updateData = {
        ...editFormData,
        main_category_id: editFormData.main_category_id || null,
        sub_category_id: editFormData.sub_category_id || null,
        sub_sub_category_id: editFormData.sub_sub_category_id || null,
        updated_by: userData.id || null,
      };
      const result = await updateSupplier(updateData).unwrap();
      if (result.status) {
        setMessage('Supplier updated successfully');
        setMessageType('success');
        setShowEditModal(false);
        refetch();
      }
    } catch (error) {
      setMessage(error?.data?.message || error?.message || 'Failed to update supplier');
      setMessageType('error');
    }
  };

  const handleCloseModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedSupplier(null);
    setEditFormData({});
    setEditSelectedMainCategory('');
    setEditSelectedSubCategory('');
  };

  return (
    <div className="suppliers-list-container-supplier-management">
      <div className="suppliers-list-header-supplier-management">
        <h1 className="heading-suppliers-list-supplier-management">Suppliers</h1>
      </div>

      <div className="search-section-supplier-management">
        <div className="search-input-group-supplier-management">
          <input
            type="text"
            className="search-input-supplier-management"
            placeholder="Search by name, code, contact person, email, phone, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="button" className="search-btn-supplier-management">
            <FaSearch />
          </button>
        </div>
      </div>

      {message && (
        <div className={`message-supplier-management ${messageType}`}>{message}</div>
      )}
      {error && (
        <div className="message-supplier-management error">
          {error?.data?.message || 'Failed to load suppliers. Please try again.'}
        </div>
      )}

      <div className="suppliers-table-container-supplier-management">
        {isLoading ? (
          <div className="loading-supplier-management">Loading suppliers...</div>
        ) : error ? (
          <div className="no-data-supplier-management">Error loading suppliers. Please refresh the page.</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="no-data-supplier-management">
            {searchTerm ? 'No suppliers found matching your search.' : 'No suppliers found.'}
          </div>
        ) : (
          <table className="suppliers-table-supplier-management">
            <thead>
              <tr>
                <th>Supplier Code</th>
                <th>Supplier Name</th>
                <th>Main Category</th>
                <th>Sub Category</th>
                <th>Sub-Sub Category</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.supplier_code || '-'}</td>
                  <td>{supplier.supplier_name || '-'}</td>
                  <td>{supplier.main_category_name || '-'}</td>
                  <td>{supplier.sub_category_name || '-'}</td>
                  <td>{supplier.sub_sub_category_name || '-'}</td>
                  <td>{supplier.contact_person || '-'}</td>
                  <td>{supplier.phone || '-'}</td>
                  <td>
                    <span className={`status-badge-supplier-management ${supplier.status === 'active' ? 'status-active-supplier-management' : 'status-inactive-supplier-management'}`}>
                      {supplier.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-supplier-management">
                    <button
                      onClick={() => handleViewSupplier(supplier)}
                      className="action-btn-supplier-management view-supplier-management"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditSupplier(supplier)}
                      className="action-btn-supplier-management edit-supplier-management"
                      title="Edit Supplier"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Supplier Modal */}
      {showViewModal && selectedSupplier && (
        <div className="modal-overlay-supplier-management" onClick={handleCloseModals}>
          <div className="modal-content-supplier-management" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-supplier-management">
              <h2>Supplier Details</h2>
              <button type="button" className="close-btn-supplier-management" onClick={handleCloseModals}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body-supplier-management">
              <div className="detail-row-supplier-management">
                <span className="detail-label-supplier-management">Supplier Code:</span>
                <span className="detail-value-supplier-management">{selectedSupplier.supplier_code || '-'}</span>
              </div>
              <div className="detail-row-supplier-management">
                <span className="detail-label-supplier-management">Supplier Name:</span>
                <span className="detail-value-supplier-management">{selectedSupplier.supplier_name || '-'}</span>
              </div>
              <div className="detail-row-supplier-management">
                <span className="detail-label-supplier-management">Main Category:</span>
                <span className="detail-value-supplier-management">{selectedSupplier.main_category_name || '-'}</span>
              </div>
              <div className="detail-row-supplier-management">
                <span className="detail-label-supplier-management">Sub Category:</span>
                <span className="detail-value-supplier-management">{selectedSupplier.sub_category_name || '-'}</span>
              </div>
              <div className="detail-row-supplier-management">
                <span className="detail-label-supplier-management">Sub-Sub Category:</span>
                <span className="detail-value-supplier-management">{selectedSupplier.sub_sub_category_name || '-'}</span>
              </div>
              <div className="detail-row-supplier-management">
                <span className="detail-label-supplier-management">Contact Person:</span>
                <span className="detail-value-supplier-management">{selectedSupplier.contact_person || '-'}</span>
              </div>
              <div className="detail-row-supplier-management">
                <span className="detail-label-supplier-management">Email:</span>
                <span className="detail-value-supplier-management">{selectedSupplier.email || '-'}</span>
              </div>
              <div className="detail-row-supplier-management">
                <span className="detail-label-supplier-management">Phone:</span>
                <span className="detail-value-supplier-management">{selectedSupplier.phone || '-'}</span>
              </div>
              <div className="detail-row-supplier-management">
                <span className="detail-label-supplier-management">Address:</span>
                <span className="detail-value-supplier-management">{selectedSupplier.address || '-'}</span>
              </div>
              <div className="detail-row-supplier-management">
                <span className="detail-label-supplier-management">Status:</span>
                <span className={`detail-value-supplier-management status-badge-supplier-management ${selectedSupplier.status === 'active' ? 'status-active-supplier-management' : 'status-inactive-supplier-management'}`}>
                  {selectedSupplier.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="modal-footer-supplier-management">
              <button
                type="button"
                className="btn-edit-modal-supplier-management"
                onClick={() => { handleCloseModals(); handleEditSupplier(selectedSupplier); }}
              >
                Edit
              </button>
              <button type="button" className="btn-close-modal-supplier-management" onClick={handleCloseModals}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && (
        <div className="modal-overlay-supplier-management" onClick={handleCloseModals}>
          <div className="modal-content-supplier-management" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-supplier-management">
              <h2>Edit Supplier</h2>
              <button type="button" className="close-btn-supplier-management" onClick={handleCloseModals}>
                <FaTimes />
              </button>
            </div>
            <form className="modal-body-supplier-management" onSubmit={handleUpdateSupplier}>
              <div className="form-group-supplier-registration">
                <label className="label-supplier-registration" htmlFor="edit_supplier_code">Supplier Code</label>
                <input
                  type="text"
                  id="edit_supplier_code"
                  name="supplier_code"
                  className="input-supplier-registration"
                  value={editFormData.supplier_code || ''}
                  readOnly
                />
              </div>

              <div className="form-group-supplier-registration">
                <label className="label-supplier-registration" htmlFor="edit_supplier_name">
                  Supplier Name <span className="required-supplier-registration">*</span>
                </label>
                <input
                  type="text"
                  id="edit_supplier_name"
                  name="supplier_name"
                  className="input-supplier-registration"
                  value={editFormData.supplier_name || ''}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-group-supplier-registration">
                <label className="label-supplier-registration" htmlFor="edit_contact_person">
                  Contact Person <span className="required-supplier-registration">*</span>
                </label>
                <input
                  type="text"
                  id="edit_contact_person"
                  name="contact_person"
                  className="input-supplier-registration"
                  value={editFormData.contact_person || ''}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-group-supplier-registration">
                <label className="label-supplier-registration" htmlFor="edit_email">Email</label>
                <input
                  type="email"
                  id="edit_email"
                  name="email"
                  className="input-supplier-registration"
                  value={editFormData.email || ''}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="form-group-supplier-registration">
                <label className="label-supplier-registration" htmlFor="edit_phone">
                  Phone <span className="required-supplier-registration">*</span>
                </label>
                <input
                  type="tel"
                  id="edit_phone"
                  name="phone"
                  className="input-supplier-registration"
                  value={editFormData.phone || ''}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-group-supplier-registration">
                <label className="label-supplier-registration" htmlFor="edit_address">Address</label>
                <textarea
                  id="edit_address"
                  name="address"
                  className="textarea-supplier-registration"
                  value={editFormData.address || ''}
                  onChange={handleEditInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group-supplier-registration">
                <label className="label-supplier-registration" htmlFor="edit_main_category_id">
                  Main Category <span style={{ fontSize: '11px', color: '#999', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <select
                  id="edit_main_category_id"
                  className="select-supplier-registration"
                  value={editFormData.main_category_id || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditFormData((prev) => ({ ...prev, main_category_id: val, sub_category_id: '', sub_sub_category_id: '' }));
                    setEditSelectedMainCategory(val);
                    setEditSelectedSubCategory('');
                  }}
                >
                  <option value="">Select Main Category</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-supplier-registration">
                <label className="label-supplier-registration" htmlFor="edit_sub_category_id">
                  Sub Category <span style={{ fontSize: '11px', color: '#999', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <select
                  id="edit_sub_category_id"
                  className="select-supplier-registration"
                  value={editFormData.sub_category_id || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditFormData((prev) => ({ ...prev, sub_category_id: val, sub_sub_category_id: '' }));
                    setEditSelectedSubCategory(val);
                  }}
                  disabled={!editFormData.main_category_id}
                >
                  <option value="">Select Sub Category</option>
                  {editSubCategories
                    .filter((sub) => sub.main_category_id === parseInt(editFormData.main_category_id))
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.sub_category_name}</option>
                    ))}
                </select>
              </div>

              <div className="form-group-supplier-registration">
                <label className="label-supplier-registration" htmlFor="edit_sub_sub_category_id">
                  Sub-Sub Category <span style={{ fontSize: '11px', color: '#999', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <select
                  id="edit_sub_sub_category_id"
                  className="select-supplier-registration"
                  value={editFormData.sub_sub_category_id || ''}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, sub_sub_category_id: e.target.value }))}
                  disabled={!editFormData.sub_category_id}
                >
                  <option value="">Select Sub-Sub Category</option>
                  {editSubSubCategories
                    .filter((ssc) => ssc.sub_category_id === parseInt(editFormData.sub_category_id))
                    .map((ssc) => (
                      <option key={ssc.id} value={ssc.id}>{ssc.sub_sub_category_name}</option>
                    ))}
                </select>
              </div>

              <div className="form-group-supplier-registration">
                <label className="label-supplier-registration" htmlFor="edit_status">Status</label>
                <select
                  id="edit_status"
                  name="status"
                  className="select-supplier-registration"
                  value={editFormData.status || 'active'}
                  onChange={handleEditInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-footer-supplier-management">
                <button type="submit" className="btn-submit-supplier-registration">Update Supplier</button>
                <button type="button" className="btn-cancel-supplier-registration" onClick={handleCloseModals}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersList;
