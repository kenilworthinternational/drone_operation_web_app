import React, { useState } from 'react';
import '../../styles/procurementProcess.css';

const ProcurementProcess = () => {
  const [formData, setFormData] = useState({
    procurementNumber: '',
    supplier: '',
    item: '',
    quantity: '',
    unitPrice: '',
    totalAmount: '',
    requestDate: '',
    expectedDeliveryDate: '',
    status: 'pending',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate total amount
      if (name === 'quantity' || name === 'unitPrice') {
        const qty = name === 'quantity' ? value : prev.quantity;
        const price = name === 'unitPrice' ? value : prev.unitPrice;
        updated.totalAmount = qty && price ? (parseFloat(qty) * parseFloat(price)).toFixed(2) : '';
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call when backend is ready
    console.log('Procurement Process Data:', formData);
  };

  return (
    <div className="procurement-process-container">
      <div className="procurement-process-header">
        <h1 className="heading-procurement-process">Procurement Process</h1>
      </div>

      <div className="procurement-process-content">
        <form className="form-procurement-process" onSubmit={handleSubmit}>
          <div className="form-group-procurement-process">
            <label className="label-procurement-process" htmlFor="procurementNumber">
              Procurement Number <span className="required-procurement-process">*</span>
            </label>
            <input
              type="text"
              id="procurementNumber"
              name="procurementNumber"
              className="input-procurement-process"
              value={formData.procurementNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-procurement-process">
            <label className="label-procurement-process" htmlFor="supplier">
              Supplier <span className="required-procurement-process">*</span>
            </label>
            <select
              id="supplier"
              name="supplier"
              className="select-procurement-process"
              value={formData.supplier}
              onChange={handleChange}
              required
            >
              <option value="">Select Supplier</option>
              {/* TODO: Populate from API */}
            </select>
          </div>

          <div className="form-group-procurement-process">
            <label className="label-procurement-process" htmlFor="item">
              Item <span className="required-procurement-process">*</span>
            </label>
            <select
              id="item"
              name="item"
              className="select-procurement-process"
              value={formData.item}
              onChange={handleChange}
              required
            >
              <option value="">Select Item</option>
              {/* TODO: Populate from API */}
            </select>
          </div>

          <div className="form-row-procurement-process">
            <div className="form-group-procurement-process">
              <label className="label-procurement-process" htmlFor="quantity">
                Quantity <span className="required-procurement-process">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className="input-procurement-process"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group-procurement-process">
              <label className="label-procurement-process" htmlFor="unitPrice">
                Unit Price <span className="required-procurement-process">*</span>
              </label>
              <input
                type="number"
                id="unitPrice"
                name="unitPrice"
                className="input-procurement-process"
                value={formData.unitPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group-procurement-process">
              <label className="label-procurement-process" htmlFor="totalAmount">
                Total Amount
              </label>
              <input
                type="text"
                id="totalAmount"
                name="totalAmount"
                className="input-procurement-process"
                value={formData.totalAmount}
                readOnly
              />
            </div>
          </div>

          <div className="form-row-procurement-process">
            <div className="form-group-procurement-process">
              <label className="label-procurement-process" htmlFor="requestDate">
                Request Date <span className="required-procurement-process">*</span>
              </label>
              <input
                type="date"
                id="requestDate"
                name="requestDate"
                className="input-procurement-process"
                value={formData.requestDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group-procurement-process">
              <label className="label-procurement-process" htmlFor="expectedDeliveryDate">
                Expected Delivery Date
              </label>
              <input
                type="date"
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                className="input-procurement-process"
                value={formData.expectedDeliveryDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group-procurement-process">
            <label className="label-procurement-process" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="select-procurement-process"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="ordered">Ordered</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-actions-procurement-process">
            <button type="submit" className="btn-submit-procurement-process">
              Submit Procurement
            </button>
            <button type="button" className="btn-cancel-procurement-process" onClick={() => setFormData({
              procurementNumber: '',
              supplier: '',
              item: '',
              quantity: '',
              unitPrice: '',
              totalAmount: '',
              requestDate: '',
              expectedDeliveryDate: '',
              status: 'pending',
            })}>
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcurementProcess;

