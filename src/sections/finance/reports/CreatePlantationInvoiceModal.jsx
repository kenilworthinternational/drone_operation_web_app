import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  useGetInvoiceOrganizationsQuery,
  useGetInvoiceTaxTypesQuery,
  useGetPlantationInvoiceDraftMutation,
  useCreatePlantationInvoiceMutation,
  useListPlantationInvoicesQuery,
  useLazyGetPlantationInvoiceByIdQuery,
} from '../../../api/services NodeJs/plantationInvoiceApi';
import '../../../styles/plantationInvoice.css';

const formatMoney = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDisplayDate = (d) => {
  if (!d) return '—';
  const text = String(d).trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[2]}/${match[3]}/${match[1]}`;
  return text;
};

function computePreviewTaxes(subtotal, taxTypes, selectedIds) {
  const selected = taxTypes.filter((t) => selectedIds.includes(Number(t.id)));
  const sorted = [...selected].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  const lines = [];
  let taxTotal = 0;
  let running = subtotal;
  for (const tax of sorted) {
    const base = tax.apply_on === 'subtotal' ? subtotal : running;
    const taxAmount = Math.round(base * (Number(tax.rate_percent) / 100) * 100) / 100;
    lines.push({
      tax_type_id: tax.id,
      tax_name: tax.tax_name,
      rate_percent: tax.rate_percent,
      net_amount: Math.round(base * 100) / 100,
      tax_amount: taxAmount,
    });
    taxTotal = Math.round((taxTotal + taxAmount) * 100) / 100;
    running = Math.round((running + taxAmount) * 100) / 100;
  }
  return { tax_lines: lines, tax_total: taxTotal, total: Math.round((subtotal + taxTotal) * 100) / 100 };
}

export default function CreatePlantationInvoiceModal({
  open,
  onClose,
  onCreated,
  plantationId,
  plantationName,
  estateIds,
  startDate,
  endDate,
  missionFilter,
}) {
  const { data: organizations = [] } = useGetInvoiceOrganizationsQuery(undefined, { skip: !open });
  const { data: taxTypes = [] } = useGetInvoiceTaxTypesQuery(undefined, { skip: !open });
  const [fetchDraft, { isLoading: draftLoading }] = useGetPlantationInvoiceDraftMutation();
  const [createInvoice, { isLoading: saving }] = useCreatePlantationInvoiceMutation();
  const { data: history = [], refetch: refetchHistory } = useListPlantationInvoicesQuery(
    { plantation_id: plantationId, limit: 20 },
    { skip: !open || !plantationId }
  );
  const [loadInvoice] = useLazyGetPlantationInvoiceByIdQuery();

  const [draft, setDraft] = useState(null);
  const [organizationId, setOrganizationId] = useState('');
  const [selectedTaxIds, setSelectedTaxIds] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!open || !plantationId || !estateIds?.length) return;

    const load = async () => {
      try {
        const data = await fetchDraft({
          plantation_id: plantationId,
          start_date: startDate,
          end_date: endDate,
          estates: estateIds,
          mission_filter: missionFilter || 'all',
        }).unwrap();

        setDraft(data);
        setInvoiceNo(data?.suggested_invoice_no || '');
        const today = new Date().toISOString().slice(0, 10);
        setInvoiceDate(today);
        const due = new Date();
        due.setDate(due.getDate() + 10);
        setDueDate(due.toISOString().slice(0, 10));
      } catch (err) {
        toast.error(err?.data?.message || err?.message || 'Failed to build invoice draft');
        onClose();
      }
    };
    load();
  }, [open, plantationId, estateIds, startDate, endDate, missionFilter, fetchDraft, onClose]);

  useEffect(() => {
    if (organizations.length && !organizationId) {
      setOrganizationId(String(organizations[0].id));
    }
  }, [organizations, organizationId]);

  useEffect(() => {
    if (taxTypes.length && selectedTaxIds.length === 0) {
      setSelectedTaxIds(taxTypes.map((t) => Number(t.id)));
    }
  }, [taxTypes, selectedTaxIds.length]);

  const preview = useMemo(() => {
    if (!draft) return null;
    const subtotal = draft.subtotal || 0;
    return computePreviewTaxes(subtotal, taxTypes, selectedTaxIds);
  }, [draft, taxTypes, selectedTaxIds]);

  const toggleTax = (id) => {
    setSelectedTaxIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!organizationId) {
      toast.error('Select an organization');
      return;
    }
    if (!draft?.line_items?.length) {
      toast.error('No billable lines (check spray/spread rates and billing Ha)');
      return;
    }
    if (!selectedTaxIds.length) {
      toast.error('Select at least one tax');
      return;
    }

    try {
      const created = await createInvoice({
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        due_date: dueDate,
        plantation_id: plantationId,
        organization_id: Number(organizationId),
        period_start: startDate,
        period_end: endDate,
        estates: estateIds,
        selected_tax_ids: selectedTaxIds,
        line_items: draft.line_items,
      }).unwrap();

      toast.success('Invoice created');
      refetchHistory();
      const full = await loadInvoice(created.id).unwrap();
      onCreated?.(full);
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Failed to save invoice');
    }
  };

  const openPrevious = async (id) => {
    try {
      const full = await loadInvoice(id).unwrap();
      onCreated?.(full);
      onClose();
    } catch {
      toast.error('Could not load invoice');
    }
  };

  if (!open) return null;

  return (
    <div className="plantation-invoice-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="plantation-invoice-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="plantation-invoice-modal-header">
          <div>
            <h3 style={{ margin: 0 }}>Create Tax Invoice</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              {plantationName} · {startDate} to {endDate}
            </p>
          </div>
          <button type="button" className="plantation-invoice-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="plantation-invoice-modal-body">
          {draftLoading || !draft ? (
            <p>Loading invoice data…</p>
          ) : (
            <>
              <div className="plantation-invoice-form-grid">
                <div>
                  <label htmlFor="inv-org">Organization</label>
                  <select
                    id="inv-org"
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                  >
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.org_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="inv-no">Invoice No</label>
                  <input
                    id="inv-no"
                    className="plantation-invoice-input-readonly"
                    value={invoiceNo}
                    readOnly
                    aria-readonly="true"
                    title="Invoice number is assigned automatically"
                  />
                </div>
                <div>
                  <label htmlFor="inv-date">Invoice Date</label>
                  <input
                    id="inv-date"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="inv-due">Due Date</label>
                  <input id="inv-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div>
                <strong style={{ fontSize: 13 }}>Taxes</strong>
                <div className="plantation-invoice-tax-list">
                  {taxTypes.map((t) => (
                    <label key={t.id}>
                      <input
                        type="checkbox"
                        checked={selectedTaxIds.includes(Number(t.id))}
                        onChange={() => toggleTax(Number(t.id))}
                      />
                      {t.tax_name} ({t.rate_percent}%)
                    </label>
                  ))}
                </div>
              </div>

              {draft.line_items.length === 0 ? (
                <p style={{ color: '#b45309' }}>
                  No invoice lines. Ensure plantation has spray/spread rates in Corporate Customers and billing Ha
                  &gt; 0 for selected estates.
                </p>
              ) : (
                <table className="plantation-invoice-preview-table">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>QTY (Ha)</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.line_items.map((row) => (
                      <tr key={row.mission_type}>
                        <td>
                          <div>{row.activity}</div>
                          <small style={{ color: '#64748b' }}>{row.description}</small>
                        </td>
                        <td>{formatMoney(row.qty)}</td>
                        <td>{formatMoney(row.rate)}</td>
                        <td>{formatMoney(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {preview ? (
                <div className="plantation-invoice-totals">
                  <div>
                    <span>Subtotal</span>
                    <span>{formatMoney(draft.subtotal)}</span>
                  </div>
                  <div>
                    <span>Tax</span>
                    <span>{formatMoney(preview.tax_total)}</span>
                  </div>
                  <div className="balance">
                    <span>Total</span>
                    <span>LKR {formatMoney(preview.total)}</span>
                  </div>
                </div>
              ) : null}

              <div className="plantation-invoice-history">
                <h4>Previous invoices ({plantationName})</h4>
                {history.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#64748b' }}>No saved invoices yet.</p>
                ) : (
                  history.map((inv) => (
                    <div key={inv.id} className="plantation-invoice-history-item">
                      <span>
                        #{inv.invoice_no} · {formatDisplayDate(inv.invoice_date)} · LKR {formatMoney(inv.total)}
                      </span>
                      <button
                        type="button"
                        className="plantation-invoice-btn plantation-invoice-btn-link"
                        onClick={() => openPrevious(inv.id)}
                      >
                        View
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <footer className="plantation-invoice-modal-footer">
          <button type="button" className="plantation-invoice-btn plantation-invoice-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="plantation-invoice-btn plantation-invoice-btn-primary"
            disabled={saving || draftLoading || !draft?.line_items?.length}
            onClick={handleCreate}
          >
            {saving ? 'Saving…' : 'Create'}
          </button>
        </footer>
      </div>
    </div>
  );
}
