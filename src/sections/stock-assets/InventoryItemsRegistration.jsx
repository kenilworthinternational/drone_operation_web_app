import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaEdit, FaEye, FaTimes, FaPlus, FaClipboardList, FaList } from 'react-icons/fa';
import '../../styles/inventoryItemsRegistration.css';
import {
  useGetMainCategoriesQuery,
  useCreateMainCategoryMutation,
  useGetLastMainCategoryCodeQuery,
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useGetLastSubCategoryCodeQuery,
  useGetInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
} from '../../api/services NodeJs/stockAssetsApi';

const InventoryItemsRegistration = () => {
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const [activeTab, setActiveTab] = useState('registration');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  // Filter states for Registered Item List
  const [filterMainCategory, setFilterMainCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [filterItemCategory, setFilterItemCategory] = useState('');
  const [showMainCategoryModal, setShowMainCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Main Category Form
  const [mainCategoryForm, setMainCategoryForm] = useState({
    category_code: '',
    category_name: '',
    description: '',
    status: 'active',
  });

  // Sub Category Form
  const [subCategoryForm, setSubCategoryForm] = useState({
    sub_category_code: '',
    sub_category_name: '',
    main_category_id: '',
    description: '',
    status: 'active',
  });

  // Inventory Item Form
  const [itemForm, setItemForm] = useState({
    item_code: '',
    item_name: '',
    main_category_id: '',
    sub_category_id: '',
    unit: '',
    description: '',
    floor_stock: 0,
    minimum_floor_stock: 0,
    minimum_order_qty: 0,
    maximum_order_qty: 0,
    reordering_stock_level: 0,
    item_category: 'stock_item',
    current_stock: 0,
    status: 'active',
  });

  // API Hooks
  const { data: mainCategoriesResponse, refetch: refetchMainCategories } = useGetMainCategoriesQuery({});
  const { data: subCategoriesResponse, refetch: refetchSubCategories } = useGetSubCategoriesQuery(
    selectedMainCategory ? { main_category_id: selectedMainCategory } : {}
  );
  // Fetch all sub categories for filtering (when filterMainCategory is selected)
  const { data: allSubCategoriesResponse } = useGetSubCategoriesQuery(
    filterMainCategory ? { main_category_id: filterMainCategory } : {}
  );
  const { data: itemsResponse, isLoading, error, refetch: refetchItems } = useGetInventoryItemsQuery({});
  
  // Get last category codes
  const { data: lastMainCategoryCodeResponse, refetch: refetchLastMainCode } = useGetLastMainCategoryCodeQuery();
  const { data: lastSubCategoryCodeResponse, refetch: refetchLastSubCode } = useGetLastSubCategoryCodeQuery();
  const [createMainCategory] = useCreateMainCategoryMutation();
  const [createSubCategory] = useCreateSubCategoryMutation();
  const [createInventoryItem] = useCreateInventoryItemMutation();
  const [updateInventoryItem] = useUpdateInventoryItemMutation();

  const mainCategories = mainCategoriesResponse?.data || [];
  const subCategories = subCategoriesResponse?.data || [];
  const allSubCategories = allSubCategoriesResponse?.data || [];
  const items = itemsResponse?.data || [];

  // Filter items based on search term and filters
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply Main Category filter
    if (filterMainCategory) {
      filtered = filtered.filter((item) => item.main_category_id === parseInt(filterMainCategory));
    }

    // Apply Sub Category filter
    if (filterSubCategory) {
      filtered = filtered.filter((item) => item.sub_category_id === parseInt(filterSubCategory));
    }

    // Apply Item Category filter
    if (filterItemCategory) {
      filtered = filtered.filter((item) => item.item_category === filterItemCategory);
    }

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((item) =>
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.main_category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sub_category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [items, searchTerm, filterMainCategory, filterSubCategory, filterItemCategory]);

  // Auto-clear messages
  useEffect(() => {
    if (message && messageType === 'success') {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, messageType]);

  // Update sub categories when main category changes
  useEffect(() => {
    setSelectedSubCategory('');
    setItemForm((prev) => ({ ...prev, sub_category_id: '' }));
  }, [selectedMainCategory]);

  // Update sub category filter when main category filter changes
  useEffect(() => {
    setFilterSubCategory('');
  }, [filterMainCategory]);

  // Generate next category code
  const generateNextMainCategoryCode = (lastCode) => {
    if (!lastCode) return 'MAIN001';
    const match = lastCode.match(/^MAIN(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const nextNum = num + 1;
      return `MAIN${String(nextNum).padStart(3, '0')}`;
    }
    return 'MAIN001';
  };

  const generateNextSubCategoryCode = (lastCode) => {
    if (!lastCode) return 'SUB0001';
    const match = lastCode.match(/^SUB(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const nextNum = num + 1;
      return `SUB${String(nextNum).padStart(4, '0')}`;
    }
    return 'SUB0001';
  };

  // Handle Main Category Modal Open
  useEffect(() => {
    if (showMainCategoryModal) {
      refetchLastMainCode();
    }
  }, [showMainCategoryModal, refetchLastMainCode]);

  // Handle Sub Category Modal Open
  useEffect(() => {
    if (showSubCategoryModal) {
      refetchLastSubCode();
    }
  }, [showSubCategoryModal, refetchLastSubCode]);

  // Auto-fill estimated main category code
  useEffect(() => {
    if (showMainCategoryModal && lastMainCategoryCodeResponse?.data?.last_code !== undefined) {
      const lastCode = lastMainCategoryCodeResponse.data.last_code;
      const estimatedCode = generateNextMainCategoryCode(lastCode);
      setMainCategoryForm((prev) => ({
        ...prev,
        category_code: prev.category_code || estimatedCode,
      }));
    }
  }, [showMainCategoryModal, lastMainCategoryCodeResponse]);

  // Auto-fill estimated sub category code
  useEffect(() => {
    if (showSubCategoryModal && lastSubCategoryCodeResponse?.data?.last_code !== undefined) {
      const lastCode = lastSubCategoryCodeResponse.data.last_code;
      const estimatedCode = generateNextSubCategoryCode(lastCode);
      setSubCategoryForm((prev) => ({
        ...prev,
        sub_category_code: prev.sub_category_code || estimatedCode,
      }));
    }
  }, [showSubCategoryModal, lastSubCategoryCodeResponse]);

  // Handle Main Category Creation
  const handleCreateMainCategory = async (e) => {
    e.preventDefault();
    try {
      // Auto-generate code if not provided
      let categoryCode = mainCategoryForm.category_code;
      if (!categoryCode || categoryCode.trim() === '') {
        const lastCode = lastMainCategoryCodeResponse?.data?.last_code;
        categoryCode = generateNextMainCategoryCode(lastCode);
      }
      
      const result = await createMainCategory({
        ...mainCategoryForm,
        category_code: categoryCode,
        created_by: userData.id || null,
      }).unwrap();
      if (result.status) {
        setMessage('Main Category created successfully');
        setMessageType('success');
        setShowMainCategoryModal(false);
        setMainCategoryForm({
          category_code: '',
          category_name: '',
          description: '',
          status: 'active',
        });
        refetchMainCategories();
        refetchLastMainCode();
      }
    } catch (error) {
      setMessage(error?.data?.message || 'Failed to create main category');
      setMessageType('error');
    }
  };

  // Handle Sub Category Creation
  const handleCreateSubCategory = async (e) => {
    e.preventDefault();
    if (!subCategoryForm.main_category_id) {
      setMessage('Please select a main category first');
      setMessageType('error');
      return;
    }
    try {
      // Auto-generate code if not provided
      let subCategoryCode = subCategoryForm.sub_category_code;
      if (!subCategoryCode || subCategoryCode.trim() === '') {
        const lastCode = lastSubCategoryCodeResponse?.data?.last_code;
        subCategoryCode = generateNextSubCategoryCode(lastCode);
      }
      
      const result = await createSubCategory({
        ...subCategoryForm,
        sub_category_code: subCategoryCode,
        created_by: userData.id || null,
      }).unwrap();
      if (result.status) {
        setMessage('Sub Category created successfully');
        setMessageType('success');
        setShowSubCategoryModal(false);
        setSubCategoryForm({
          sub_category_code: '',
          sub_category_name: '',
          main_category_id: selectedMainCategory || '',
          description: '',
          status: 'active',
        });
        refetchSubCategories();
        refetchLastSubCode();
      }
    } catch (error) {
      setMessage(error?.data?.message || 'Failed to create sub category');
      setMessageType('error');
    }
  };

  // Handle Inventory Item Creation
  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!itemForm.main_category_id || !itemForm.sub_category_id) {
      setMessage('Please select both main category and sub category');
      setMessageType('error');
      return;
    }
    try {
      const result = await createInventoryItem({
        ...itemForm,
        created_by: userData.id || null,
      }).unwrap();
      if (result.status) {
        setMessage('Inventory Item created successfully');
        setMessageType('success');
        setItemForm({
          item_code: '',
          item_name: '',
          main_category_id: '',
          sub_category_id: '',
          unit: '',
          description: '',
          floor_stock: 0,
          minimum_floor_stock: 0,
          minimum_order_qty: 0,
          maximum_order_qty: 0,
          reordering_stock_level: 0,
          item_category: 'stock_item',
          current_stock: 0,
          status: 'active',
        });
        setSelectedMainCategory('');
        setSelectedSubCategory('');
        refetchItems();
      }
    } catch (error) {
      setMessage(error?.data?.message || 'Failed to create inventory item');
      setMessageType('error');
    }
  };

  // Handle Item Update
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const result = await updateInventoryItem({
        id: selectedItem.id,
        ...itemForm,
        updated_by: userData.id || null,
      }).unwrap();
      if (result.status) {
        setMessage('Inventory Item updated successfully');
        setMessageType('success');
        setShowEditModal(false);
        setSelectedItem(null);
        refetchItems();
      }
    } catch (error) {
      setMessage(error?.data?.message || 'Failed to update inventory item');
      setMessageType('error');
    }
  };


  // Handle View Item
  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  // Handle Edit Item
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setItemForm({
      item_code: item.item_code || '',
      item_name: item.item_name || '',
      main_category_id: item.main_category_id || '',
      sub_category_id: item.sub_category_id || '',
      unit: item.unit || '',
      description: item.description || '',
      floor_stock: item.floor_stock || 0,
      minimum_floor_stock: item.minimum_floor_stock || 0,
      minimum_order_qty: item.minimum_order_qty || 0,
      maximum_order_qty: item.maximum_order_qty || 0,
      reordering_stock_level: item.reordering_stock_level || 0,
      item_category: item.item_category || 'stock_item',
      current_stock: item.current_stock || 0,
      status: item.status || 'active',
    });
    setSelectedMainCategory(item.main_category_id || '');
    setSelectedSubCategory(item.sub_category_id || '');
    setShowEditModal(true);
  };

  return (
    <div className="inventory-items-registration-container">
      {/* Main Tab Navigation */}
      <div className="main-tabs-container-inventory-items">
        <button
          type="button"
          className={`main-tab-inventory-items ${activeTab === 'registration' ? 'active' : ''}`}
          onClick={() => setActiveTab('registration')}
        >
          <FaClipboardList className="main-tab-icon-inventory-items" />
          <span>Registration</span>
        </button>
        <button
          type="button"
          className={`main-tab-inventory-items ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          <FaList className="main-tab-icon-inventory-items" />
          <span>Registered Item List</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="main-tab-content-inventory-items">
        {message && (
          <div className={`message-inventory-items ${messageType}`}>
            {message}
          </div>
        )}

        {activeTab === 'registration' && (
          <div className="registration-section-inventory-items">
        <form className="form-inventory-items-registration" onSubmit={handleCreateItem}>
          <div className="form-row-inventory-items">
            <div className="form-group-inventory-items-registration">
              <label className="label-inventory-items-registration" htmlFor="main_category">
                Main Category <span className="required-inventory-items-registration">*</span>
              </label>
              <div className="input-with-button-inventory-items">
                <select
                  id="main_category"
                  className="select-inventory-items-registration"
                  value={itemForm.main_category_id}
                  onChange={(e) => {
                    setItemForm((prev) => ({ ...prev, main_category_id: e.target.value }));
                    setSelectedMainCategory(e.target.value);
                  }}
                  required
                >
                  <option value="">Select Main Category</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-add-category-inventory-items"
                  onClick={() => setShowMainCategoryModal(true)}
                  title="Add Main Category"
                >
                  <FaPlus /> Add Main Category
                </button>
              </div>
            </div>

            <div className="form-group-inventory-items-registration">
              <label className="label-inventory-items-registration" htmlFor="sub_category">
                Sub Category <span className="required-inventory-items-registration">*</span>
              </label>
              <div className="input-with-button-inventory-items">
                <select
                  id="sub_category"
                  className="select-inventory-items-registration"
                  value={itemForm.sub_category_id}
                  onChange={(e) => {
                    setItemForm((prev) => ({ ...prev, sub_category_id: e.target.value }));
                    setSelectedSubCategory(e.target.value);
                  }}
                  required
                  disabled={!itemForm.main_category_id}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories
                    .filter((sub) => sub.main_category_id === parseInt(itemForm.main_category_id))
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.sub_category_name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="btn-add-category-inventory-items"
                  onClick={() => {
                    setSubCategoryForm((prev) => ({
                      ...prev,
                      main_category_id: itemForm.main_category_id,
                    }));
                    setShowSubCategoryModal(true);
                  }}
                  title="Add Sub Category"
                  disabled={!itemForm.main_category_id}
                >
                  <FaPlus /> Add Sub Category
                </button>
              </div>
            </div>
          </div>

          <div className="form-group-inventory-items-registration">
            <label className="label-inventory-items-registration" htmlFor="item_name">
              Add Item <span className="required-inventory-items-registration">*</span>
            </label>
            <input
              type="text"
              id="item_name"
              className="input-inventory-items-registration"
              value={itemForm.item_name}
              onChange={(e) => setItemForm((prev) => ({ ...prev, item_name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group-inventory-items-registration">
            <label className="label-inventory-items-registration">Select Item Category</label>
            <div className="checkbox-group-inventory-items">
              <label className="checkbox-label-inventory-items">
                <input
                  type="radio"
                  name="item_category"
                  value="inventory_item"
                  checked={itemForm.item_category === 'inventory_item'}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, item_category: e.target.value }))}
                />
                <span>Inventory Item</span>
              </label>
              <label className="checkbox-label-inventory-items">
                <input
                  type="radio"
                  name="item_category"
                  value="stock_item"
                  checked={itemForm.item_category === 'stock_item'}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, item_category: e.target.value }))}
                />
                <span>Stock Item</span>
              </label>
            </div>
          </div>

          <div className="form-row-inventory-items">
            <div className="form-group-inventory-items-registration">
              <label className="label-inventory-items-registration" htmlFor="item_code">
                Item Code <span className="required-inventory-items-registration">*</span>
              </label>
              <input
                type="text"
                id="item_code"
                className="input-inventory-items-registration"
                value={itemForm.item_code}
                onChange={(e) => setItemForm((prev) => ({ ...prev, item_code: e.target.value }))}
                required
              />
            </div>

          <div className="form-group-inventory-items-registration">
            <label className="label-inventory-items-registration" htmlFor="unit">
              Unit
            </label>
            <select
              id="unit"
              className="select-inventory-items-registration"
              value={itemForm.unit}
              onChange={(e) => setItemForm((prev) => ({ ...prev, unit: e.target.value }))}
            >
              <option value="">Select Unit</option>
              <option value="pcs">PCS</option>
              <option value="l">Liters</option>
              <option value="kg">Kilograms</option>
              <option value="m">Meters</option>
            </select>
          </div>
          </div>

          <div className="form-group-inventory-items-registration">
            <label className="label-inventory-items-registration" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="textarea-inventory-items-registration"
              value={itemForm.description}
              onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
              style={{ height: '80px', minHeight: '80px' }}
            />
          </div>

          <div className="form-row-inventory-items">
            <div className="form-group-inventory-items-registration">
              <label className="label-inventory-items-registration" htmlFor="floor_stock">
                Floor Stock
              </label>
              <input
                type="number"
                id="floor_stock"
                className="input-inventory-items-registration"
                value={itemForm.floor_stock}
                onChange={(e) => setItemForm((prev) => ({ ...prev, floor_stock: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group-inventory-items-registration">
              <label className="label-inventory-items-registration" htmlFor="minimum_floor_stock">
                Minimum Floor Stock
              </label>
              <input
                type="number"
                id="minimum_floor_stock"
                className="input-inventory-items-registration"
                value={itemForm.minimum_floor_stock}
                onChange={(e) => setItemForm((prev) => ({ ...prev, minimum_floor_stock: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row-inventory-items">
            <div className="form-group-inventory-items-registration">
              <label className="label-inventory-items-registration" htmlFor="minimum_order_qty">
                Minimum Order Qty
              </label>
              <input
                type="number"
                id="minimum_order_qty"
                className="input-inventory-items-registration"
                value={itemForm.minimum_order_qty}
                onChange={(e) => setItemForm((prev) => ({ ...prev, minimum_order_qty: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group-inventory-items-registration">
              <label className="label-inventory-items-registration" htmlFor="maximum_order_qty">
                Maximum Order Qty
              </label>
              <input
                type="number"
                id="maximum_order_qty"
                className="input-inventory-items-registration"
                value={itemForm.maximum_order_qty}
                onChange={(e) => setItemForm((prev) => ({ ...prev, maximum_order_qty: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row-inventory-items">
            <div className="form-group-inventory-items-registration">
              <label className="label-inventory-items-registration" htmlFor="reordering_stock_level">
                Re-ordering Stock Level
              </label>
              <input
                type="number"
                id="reordering_stock_level"
                className="input-inventory-items-registration"
                value={itemForm.reordering_stock_level}
                onChange={(e) => setItemForm((prev) => ({ ...prev, reordering_stock_level: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group-inventory-items-registration">
              <label className="label-inventory-items-registration" htmlFor="current_stock">
                Current Stock
              </label>
              <input
                type="number"
                id="current_stock"
                className="input-inventory-items-registration"
                value={itemForm.current_stock}
                onChange={(e) => setItemForm((prev) => ({ ...prev, current_stock: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-actions-inventory-items-registration">
            <button type="submit" className="btn-submit-inventory-items-registration">
              Add Item
            </button>
            <button
              type="button"
              className="btn-cancel-inventory-items-registration"
              onClick={() => {
                setItemForm({
                  item_code: '',
                  item_name: '',
                  main_category_id: '',
                  sub_category_id: '',
                  unit: '',
                  description: '',
                  floor_stock: 0,
                  minimum_floor_stock: 0,
                  minimum_order_qty: 0,
                  maximum_order_qty: 0,
                  reordering_stock_level: 0,
                  item_category: 'stock_item',
                  current_stock: 0,
                  status: 'active',
                });
                setSelectedMainCategory('');
                setSelectedSubCategory('');
              }}
            >
              Clear
            </button>
          </div>
        </form>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="registered-items-section-inventory-items">
            <div className="section-header-inventory-items">
              <h2 className="section-title-inventory-items">Registered Item List</h2>
              <div className="filters-container-inventory-items">
                <div className="filter-group-inventory-items">
                  <label className="filter-label-inventory-items">Main Category:</label>
                  <select
                    className="filter-select-inventory-items"
                    value={filterMainCategory}
                    onChange={(e) => setFilterMainCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {mainCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group-inventory-items">
                  <label className="filter-label-inventory-items">Sub Category:</label>
                  <select
                    className="filter-select-inventory-items"
                    value={filterSubCategory}
                    onChange={(e) => setFilterSubCategory(e.target.value)}
                    disabled={!filterMainCategory}
                  >
                    <option value="">All Sub Categories</option>
                    {allSubCategories
                      .filter((sub) => sub.main_category_id === parseInt(filterMainCategory))
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.sub_category_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="filter-group-inventory-items">
                  <label className="filter-label-inventory-items">Item Category:</label>
                  <select
                    className="filter-select-inventory-items"
                    value={filterItemCategory}
                    onChange={(e) => setFilterItemCategory(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="inventory_item">Inventory Item</option>
                    <option value="stock_item">Stock Item</option>
                  </select>
                </div>
                <div className="search-container-inventory-items">
                  <label className="search-label-inventory-items">Search Item:</label>
                  <input
                    type="text"
                    className="search-input-inventory-items"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {(filterMainCategory || filterSubCategory || filterItemCategory || searchTerm) && (
                  <button
                    type="button"
                    className="btn-clear-filters-inventory-items"
                    onClick={() => {
                      setFilterMainCategory('');
                      setFilterSubCategory('');
                      setFilterItemCategory('');
                      setSearchTerm('');
                    }}
                    title="Clear All Filters"
                  >
                    <FaTimes /> Clear Filters
                  </button>
                )}
              </div>
            </div>

        {isLoading ? (
          <div className="loading-inventory-items">Loading items...</div>
        ) : error ? (
          <div className="error-inventory-items">Error loading items. Please refresh the page.</div>
        ) : filteredItems.length === 0 ? (
          <div className="no-data-inventory-items">
            {searchTerm ? 'No items found matching your search.' : 'No items found.'}
          </div>
        ) : (
          <table className="items-table-inventory-items">
            <thead>
              <tr>
                <th>ID</th>
                <th>Main Category</th>
                <th>Sub Category</th>
                <th>Item</th>
                <th>Item Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>#{String(item.id).padStart(3, '0')}</td>
                  <td>{item.main_category_name || '-'}</td>
                  <td>{item.sub_category_name || '-'}</td>
                  <td>{item.item_name || '-'}</td>
                  <td>
                    <span className={`item-category-badge-inventory-items ${item.item_category === 'stock_item' ? 'stock-item' : 'inventory-item'}`}>
                      {item.item_category === 'stock_item' ? 'Stock Item' : 'Inventory Item'}
                    </span>
                  </td>
                  <td className="actions-inventory-items">
                    <button
                      onClick={() => handleViewItem(item)}
                      className="action-btn-inventory-items view-inventory-items"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="action-btn-inventory-items edit-inventory-items"
                      title="Edit Item"
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
        )}
      </div>

      {/* Main Category Modal */}
      {showMainCategoryModal && (
        <div className="modal-overlay-inventory-items" onClick={() => setShowMainCategoryModal(false)}>
          <div className="modal-content-inventory-items" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-inventory-items">
              <h2>Add Main Category</h2>
              <button
                type="button"
                className="close-btn-inventory-items"
                onClick={() => setShowMainCategoryModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form className="modal-body-inventory-items" onSubmit={handleCreateMainCategory}>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration" htmlFor="main_category_code">
                  Category Code <span className="required-inventory-items-registration">*</span>
                  {lastMainCategoryCodeResponse?.data?.last_code && (
                    <span className="estimated-code-hint" style={{ fontSize: '12px', color: '#666', marginLeft: '8px', fontWeight: 'normal' }}>
                      (Last: {lastMainCategoryCodeResponse.data.last_code}, Estimated: {generateNextMainCategoryCode(lastMainCategoryCodeResponse.data.last_code)})
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  id="main_category_code"
                  className="input-inventory-items-registration"
                  value={mainCategoryForm.category_code}
                  onChange={(e) => setMainCategoryForm((prev) => ({ ...prev, category_code: e.target.value }))}
                  placeholder={lastMainCategoryCodeResponse?.data?.last_code ? generateNextMainCategoryCode(lastMainCategoryCodeResponse.data.last_code) : 'MAIN001'}
                  required
                />
              </div>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration" htmlFor="main_category_name">
                  Category Name <span className="required-inventory-items-registration">*</span>
                </label>
                <input
                  type="text"
                  id="main_category_name"
                  className="input-inventory-items-registration"
                  value={mainCategoryForm.category_name}
                  onChange={(e) => setMainCategoryForm((prev) => ({ ...prev, category_name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration" htmlFor="main_category_description">
                  Description
                </label>
                <textarea
                  id="main_category_description"
                  className="textarea-inventory-items-registration"
                  value={mainCategoryForm.description}
                  onChange={(e) => setMainCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                  style={{ height: '80px', minHeight: '80px' }}
                />
              </div>
              <div className="modal-footer-inventory-items">
                <button type="submit" className="btn-submit-inventory-items-registration">
                  Add Main Category
                </button>
                <button
                  type="button"
                  className="btn-cancel-inventory-items-registration"
                  onClick={() => setShowMainCategoryModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub Category Modal */}
      {showSubCategoryModal && (
        <div className="modal-overlay-inventory-items" onClick={() => setShowSubCategoryModal(false)}>
          <div className="modal-content-inventory-items" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-inventory-items">
              <h2>Add Sub Category</h2>
              <button
                type="button"
                className="close-btn-inventory-items"
                onClick={() => setShowSubCategoryModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form className="modal-body-inventory-items" onSubmit={handleCreateSubCategory}>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration" htmlFor="sub_category_main">
                  Main Category <span className="required-inventory-items-registration">*</span>
                </label>
                <select
                  id="sub_category_main"
                  className="select-inventory-items-registration"
                  value={subCategoryForm.main_category_id}
                  onChange={(e) => setSubCategoryForm((prev) => ({ ...prev, main_category_id: e.target.value }))}
                  required
                >
                  <option value="">Select Main Category</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration" htmlFor="sub_category_code">
                  Sub Category Code <span className="required-inventory-items-registration">*</span>
                  {lastSubCategoryCodeResponse?.data?.last_code && (
                    <span className="estimated-code-hint" style={{ fontSize: '12px', color: '#666', marginLeft: '8px', fontWeight: 'normal' }}>
                      (Last: {lastSubCategoryCodeResponse.data.last_code}, Estimated: {generateNextSubCategoryCode(lastSubCategoryCodeResponse.data.last_code)})
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  id="sub_category_code"
                  className="input-inventory-items-registration"
                  value={subCategoryForm.sub_category_code}
                  onChange={(e) => setSubCategoryForm((prev) => ({ ...prev, sub_category_code: e.target.value }))}
                  placeholder={lastSubCategoryCodeResponse?.data?.last_code ? generateNextSubCategoryCode(lastSubCategoryCodeResponse.data.last_code) : 'SUB0001'}
                  required
                />
              </div>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration" htmlFor="sub_category_name">
                  Sub Category Name <span className="required-inventory-items-registration">*</span>
                </label>
                <input
                  type="text"
                  id="sub_category_name"
                  className="input-inventory-items-registration"
                  value={subCategoryForm.sub_category_name}
                  onChange={(e) => setSubCategoryForm((prev) => ({ ...prev, sub_category_name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration" htmlFor="sub_category_description">
                  Description
                </label>
                <textarea
                  id="sub_category_description"
                  className="textarea-inventory-items-registration"
                  value={subCategoryForm.description}
                  onChange={(e) => setSubCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                  style={{ height: '80px', minHeight: '80px' }}
                />
              </div>
              <div className="modal-footer-inventory-items">
                <button type="submit" className="btn-submit-inventory-items-registration">
                  Add Sub Category
                </button>
                <button
                  type="button"
                  className="btn-cancel-inventory-items-registration"
                  onClick={() => setShowSubCategoryModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && selectedItem && (
        <div className="modal-overlay-inventory-items" onClick={() => setShowViewModal(false)}>
          <div className="modal-content-inventory-items large-modal-inventory-items" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-inventory-items">
              <h2>Item Details</h2>
              <button
                type="button"
                className="close-btn-inventory-items"
                onClick={() => setShowViewModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body-inventory-items">
              <div className="detail-grid-inventory-items">
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Item Code:</span>
                  <span className="detail-value-inventory-items">{selectedItem.item_code || '-'}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Item Name:</span>
                  <span className="detail-value-inventory-items">{selectedItem.item_name || '-'}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Main Category:</span>
                  <span className="detail-value-inventory-items">{selectedItem.main_category_name || '-'}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Sub Category:</span>
                  <span className="detail-value-inventory-items">{selectedItem.sub_category_name || '-'}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Item Category:</span>
                  <span className={`detail-value-inventory-items item-category-badge-inventory-items ${selectedItem.item_category === 'stock_item' ? 'stock-item' : 'inventory-item'}`}>
                    {selectedItem.item_category === 'stock_item' ? 'Stock Item' : 'Inventory Item'}
                  </span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Unit:</span>
                  <span className="detail-value-inventory-items">{selectedItem.unit || '-'}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Description:</span>
                  <span className="detail-value-inventory-items">{selectedItem.description || '-'}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Floor Stock:</span>
                  <span className="detail-value-inventory-items">{selectedItem.floor_stock || 0}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Minimum Floor Stock:</span>
                  <span className="detail-value-inventory-items">{selectedItem.minimum_floor_stock || 0}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Minimum Order Qty:</span>
                  <span className="detail-value-inventory-items">{selectedItem.minimum_order_qty || 0}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Maximum Order Qty:</span>
                  <span className="detail-value-inventory-items">{selectedItem.maximum_order_qty || 0}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Re-ordering Stock Level:</span>
                  <span className="detail-value-inventory-items">{selectedItem.reordering_stock_level || 0}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Current Stock:</span>
                  <span className="detail-value-inventory-items">{selectedItem.current_stock || 0}</span>
                </div>
                <div className="detail-row-inventory-items">
                  <span className="detail-label-inventory-items">Status:</span>
                  <span className={`detail-value-inventory-items status-badge-inventory-items ${selectedItem.status === 'active' ? 'status-active-inventory-items' : 'status-inactive-inventory-items'}`}>
                    {selectedItem.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer-inventory-items">
              <button
                type="button"
                className="btn-edit-modal-inventory-items"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditItem(selectedItem);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn-close-modal-inventory-items"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="modal-overlay-inventory-items" onClick={() => setShowEditModal(false)}>
          <div className="modal-content-inventory-items large-modal-inventory-items" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-inventory-items">
              <h2>Edit Item</h2>
              <button
                type="button"
                className="close-btn-inventory-items"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form className="modal-body-inventory-items" onSubmit={handleUpdateItem}>
              <div className="form-row-inventory-items">
                <div className="form-group-inventory-items-registration">
                  <label className="label-inventory-items-registration" htmlFor="edit_item_code">
                    Item Code
                  </label>
                  <input
                    type="text"
                    id="edit_item_code"
                    className="input-inventory-items-registration"
                    value={itemForm.item_code}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, item_code: e.target.value }))}
                    readOnly
                  />
                </div>
                <div className="form-group-inventory-items-registration">
                  <label className="label-inventory-items-registration" htmlFor="edit_unit">
                    Unit
                  </label>
                  <select
                    id="edit_unit"
                    className="select-inventory-items-registration"
                    value={itemForm.unit}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, unit: e.target.value }))}
                  >
                    <option value="">Select Unit</option>
                    <option value="pcs">PCS</option>
                    <option value="l">Liters</option>
                    <option value="kg">Kilograms</option>
                    <option value="m">Meters</option>
                  </select>
                </div>
              </div>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration" htmlFor="edit_item_name">
                  Item Name <span className="required-inventory-items-registration">*</span>
                </label>
                <input
                  type="text"
                  id="edit_item_name"
                  className="input-inventory-items-registration"
                  value={itemForm.item_name}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, item_name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-row-inventory-items">
                <div className="form-group-inventory-items-registration">
                  <label className="label-inventory-items-registration" htmlFor="edit_main_category">
                    Main Category <span className="required-inventory-items-registration">*</span>
                  </label>
                  <select
                    id="edit_main_category"
                    className="select-inventory-items-registration"
                    value={itemForm.main_category_id}
                    onChange={(e) => {
                      setItemForm((prev) => ({ ...prev, main_category_id: e.target.value, sub_category_id: '' }));
                      setSelectedMainCategory(e.target.value);
                    }}
                    required
                  >
                    <option value="">Select Main Category</option>
                    {mainCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group-inventory-items-registration">
                  <label className="label-inventory-items-registration" htmlFor="edit_sub_category">
                    Sub Category <span className="required-inventory-items-registration">*</span>
                  </label>
                  <select
                    id="edit_sub_category"
                    className="select-inventory-items-registration"
                    value={itemForm.sub_category_id}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, sub_category_id: e.target.value }))}
                    required
                    disabled={!itemForm.main_category_id}
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories
                      .filter((sub) => sub.main_category_id === parseInt(itemForm.main_category_id))
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.sub_category_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration">Item Category</label>
                <div className="checkbox-group-inventory-items">
                  <label className="checkbox-label-inventory-items">
                    <input
                      type="radio"
                      name="edit_item_category"
                      value="inventory_item"
                      checked={itemForm.item_category === 'inventory_item'}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, item_category: e.target.value }))}
                    />
                    <span>Inventory Item</span>
                  </label>
                  <label className="checkbox-label-inventory-items">
                    <input
                      type="radio"
                      name="edit_item_category"
                      value="stock_item"
                      checked={itemForm.item_category === 'stock_item'}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, item_category: e.target.value }))}
                    />
                    <span>Stock Item</span>
                  </label>
                </div>
              </div>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration" htmlFor="edit_description">
                  Description
                </label>
                <textarea
                  id="edit_description"
                  className="textarea-inventory-items-registration"
                  value={itemForm.description}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
                  style={{ height: '80px', minHeight: '80px' }}
                />
              </div>
              <div className="form-row-inventory-items">
                <div className="form-group-inventory-items-registration">
                  <label className="label-inventory-items-registration" htmlFor="edit_floor_stock">
                    Floor Stock
                  </label>
                  <input
                    type="number"
                    id="edit_floor_stock"
                    className="input-inventory-items-registration"
                    value={itemForm.floor_stock}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, floor_stock: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group-inventory-items-registration">
                  <label className="label-inventory-items-registration" htmlFor="edit_minimum_floor_stock">
                    Minimum Floor Stock
                  </label>
                  <input
                    type="number"
                    id="edit_minimum_floor_stock"
                    className="input-inventory-items-registration"
                    value={itemForm.minimum_floor_stock}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, minimum_floor_stock: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-row-inventory-items">
                <div className="form-group-inventory-items-registration">
                  <label className="label-inventory-items-registration" htmlFor="edit_minimum_order_qty">
                    Minimum Order Qty
                  </label>
                  <input
                    type="number"
                    id="edit_minimum_order_qty"
                    className="input-inventory-items-registration"
                    value={itemForm.minimum_order_qty}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, minimum_order_qty: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group-inventory-items-registration">
                  <label className="label-inventory-items-registration" htmlFor="edit_maximum_order_qty">
                    Maximum Order Qty
                  </label>
                  <input
                    type="number"
                    id="edit_maximum_order_qty"
                    className="input-inventory-items-registration"
                    value={itemForm.maximum_order_qty}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, maximum_order_qty: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-row-inventory-items">
                <div className="form-group-inventory-items-registration">
                  <label className="label-inventory-items-registration" htmlFor="edit_reordering_stock_level">
                    Re-ordering Stock Level
                  </label>
                  <input
                    type="number"
                    id="edit_reordering_stock_level"
                    className="input-inventory-items-registration"
                    value={itemForm.reordering_stock_level}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, reordering_stock_level: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group-inventory-items-registration">
                  <label className="label-inventory-items-registration" htmlFor="edit_current_stock">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    id="edit_current_stock"
                    className="input-inventory-items-registration"
                    value={itemForm.current_stock}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, current_stock: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-group-inventory-items-registration">
                <label className="label-inventory-items-registration" htmlFor="edit_status">
                  Status
                </label>
                <select
                  id="edit_status"
                  className="select-inventory-items-registration"
                  value={itemForm.status}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-footer-inventory-items">
                <button type="submit" className="btn-submit-inventory-items-registration">
                  Update Item
                </button>
                <button
                  type="button"
                  className="btn-cancel-inventory-items-registration"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryItemsRegistration;
