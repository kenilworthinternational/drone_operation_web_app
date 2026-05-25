import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Bars } from 'react-loader-spinner';
import {
  useListPlantationInvoicesQuery,
  useLazyGetPlantationInvoiceByIdQuery,
} from '../../../api/services NodeJs/plantationInvoiceApi';
import { useLazyGetPlantationsListQuery } from '../../../api/services NodeJs/plantationDashboardApi';

const formatMoney = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDisplayDate = (d) => {
  if (!d) return '—';
  const text = String(d).trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[2]}/${match[3]}/${match[1]}`;
  return text;
};

const extractListData = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
  return [];
};

export default function PlantationInvoiceHistory({ onInvoicePreview }) {
  const [triggerPlantationsList] = useLazyGetPlantationsListQuery();
  const [plantations, setPlantations] = useState([]);
  const [plantationFilter, setPlantationFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loadInvoice, { isLoading: loadingOne }] = useLazyGetPlantationInvoiceByIdQuery();

  const { data: invoices = [], isLoading, isFetching, refetch } = useListPlantationInvoicesQuery({
    plantation_id: plantationFilter || undefined,
    limit: 200,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const result = await triggerPlantationsList(undefined, true);
        setPlantations(extractListData(result?.data));
      } catch {
        setPlantations([]);
      }
    };
    load();
  }, [triggerPlantationsList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const hay = [
        inv.invoice_no,
        inv.plantation_name,
        inv.organization_name,
        inv.period_start,
        inv.period_end,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [invoices, search]);

  const openInvoice = async (id) => {
    try {
      const full = await loadInvoice(id).unwrap();
      onInvoicePreview?.(full);
    } catch {
      toast.error('Could not load invoice');
    }
  };

  const loading = isLoading || isFetching;

  return (
    <div className="finance plantation-invoice-history">
      <div className="plantation-invoice-history-toolbar">
        <div className="plantation-invoice-history-filters">
          <div>
            <label htmlFor="inv-history-plantation">Plantation</label>
            <select
              id="inv-history-plantation"
              value={plantationFilter}
              onChange={(e) => setPlantationFilter(e.target.value)}
            >
              <option value="">All plantations</option>
              {plantations.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plantation}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="inv-history-search">Search</label>
            <input
              id="inv-history-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Invoice no, plantation, organization…"
              autoComplete="off"
            />
          </div>
        </div>
        <button
          type="button"
          className="plantation-invoice-btn plantation-invoice-btn-secondary"
          onClick={() => refetch()}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="plantation-invoice-history-loading">
          <Bars height={48} width={48} color="#1d4ed8" ariaLabel="loading" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="plantation-invoice-history-empty">No saved invoices found.</p>
      ) : (
        <div className="finance-table-container">
          <table className="finance-report-table plantation-invoice-history-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Plantation</th>
                <th>Organization</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Period</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.invoice_no}</td>
                  <td>{row.plantation_name || '—'}</td>
                  <td>{row.organization_name || '—'}</td>
                  <td>{formatDisplayDate(row.invoice_date)}</td>
                  <td>{formatDisplayDate(row.due_date)}</td>
                  <td>
                    {formatDisplayDate(row.period_start)} – {formatDisplayDate(row.period_end)}
                  </td>
                  <td>{formatMoney(row.subtotal)}</td>
                  <td>{formatMoney(row.tax_total)}</td>
                  <td>{formatMoney(row.total)}</td>
                  <td>
                    <button
                      type="button"
                      className="plantation-invoice-btn plantation-invoice-btn-link"
                      disabled={loadingOne}
                      onClick={() => openInvoice(row.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
