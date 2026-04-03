import React from 'react';
import { COMPANY } from '../../config/companyConstants';

/**
 * Printable Purchase Order document (company + supplier + line items + totals).
 * Use with window.print() or "Print" → "Save as PDF".
 */
export default function PurchaseOrderDocument({ po }) {
  if (!po) return null;
  const items = po.items || [];
  const subtotal = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unit_price || 0)), 0);
  const taxRate = Number(po.tax_rate) || 0;
  const discount = Number(po.discount) || 0;
  const tax = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + tax;
  const poDate = po.created_at ? new Date(po.created_at).toLocaleDateString() : '';
  return (
    <div className="purchase-order-document" style={{ fontFamily: 'Arial, sans-serif', maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <img src={COMPANY.logoPath} alt={COMPANY.name} style={{ maxHeight: 60, marginBottom: 8 }} />
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>{COMPANY.name}</div>
          <div>{COMPANY.address}</div>
          <div>{COMPANY.city}</div>
          <div>Postal Code: {COMPANY.postalCode}</div>
          <div>{COMPANY.email}</div>
        </div>
        <h1 style={{ color: '#e67e22', fontSize: 28, margin: 0 }}>Purchase Order</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, marginBottom: 24, padding: 12, backgroundColor: '#fff5e6', borderRadius: 4 }}>
        <div>
          <strong>Bill To</strong>
          <div>{po.supplier_name}</div>
          {po.address && <div>{po.address}</div>}
          {po.contact_person && <div>{po.contact_person}</div>}
          {po.email && <div>{po.email}</div>}
          {po.phone && <div>{po.phone}</div>}
        </div>
        <div>
          <div><strong>Purchase Order #:</strong> {po.po_no}</div>
          <div><strong>Date:</strong> {poDate}</div>
          <div><strong>Procurement No:</strong> {po.procurement_no}</div>
        </div>
      </div>

      <table width="100%" style={{ borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Description</th>
            <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>Quantity</th>
            <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>Rate</th>
            <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const qty = Number(item.quantity) || 0;
            const rate = Number(item.unit_price) || 0;
            const amount = qty * rate;
            return (
              <tr key={item.id}>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.item_name || item.item_code || '-'}</td>
                <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>{qty}</td>
                <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>{rate.toFixed(2)}</td>
                <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>{amount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ padding: 12, backgroundColor: '#fff5e6', borderRadius: 4, marginBottom: 16, maxWidth: 320, marginLeft: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Subtotal:</span><span>{subtotal.toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Tax Rate (%):</span><span>{taxRate.toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Discount:</span><span>{discount.toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Tax:</span><span>{tax.toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 16 }}><span>Total:</span><span>{total.toFixed(2)}</span></div>
      </div>

      {po.notes && (
        <div style={{ marginTop: 16 }}>
          <strong>Notes:</strong>
          <div style={{ marginTop: 4 }}>{po.notes}</div>
        </div>
      )}
    </div>
  );
}
