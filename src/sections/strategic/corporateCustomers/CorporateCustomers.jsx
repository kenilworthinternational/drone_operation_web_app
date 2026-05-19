import React, { useMemo, useState } from 'react';
import { FaSearch, FaEdit, FaEye, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetMappingPlantationsQuery,
  useUpdateMappingPlantationMutation,
} from '../../../api/services NodeJs/mappingHierarchyApi';
import '../../../styles/corporateCustomers.css';
import { CustomerDetailsModal, formatRate } from './corporateCustomerModal';

const EMPTY_FORM = {
  spray_rate: '',
  spray_units: '',
  spray_max_chemical: '12',
  spread_rate: '',
  spread_units: '',
  scout_rate: '',
  address: '',
  bill_to_address: '',
  ship_to_address: '',
};

function formatText(v, maxLen = 48) {
  if (v == null || String(v).trim() === '') return '—';
  const s = String(v).trim();
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen)}…`;
}

function rowToForm(row) {
  return {
    spray_rate: row.spray_rate != null ? String(row.spray_rate) : '',
    spray_units: row.spray_units ?? '',
    spray_max_chemical:
      row.spray_max_chemical != null && row.spray_max_chemical !== ''
        ? String(row.spray_max_chemical)
        : '12',
    spread_rate: row.spread_rate != null ? String(row.spread_rate) : '',
    spread_units: row.spread_units ?? '',
    scout_rate: row.scout_rate != null ? String(row.scout_rate) : '',
    address: row.address ?? '',
    bill_to_address: row.bill_to_address ?? '',
    ship_to_address: row.ship_to_address ?? '',
  };
}

function buildUpdatePayload(id, form) {
  const payload = { id, ratesAndAddressesOnly: true };
  ['spray_rate', 'spread_rate', 'scout_rate', 'spray_max_chemical'].forEach((key) => {
    const raw = String(form[key] ?? '').trim();
    if (key.endsWith('_max_chemical')) {
      payload[key] = raw === '' ? 12 : Number(raw);
    } else {
      payload[key] = raw === '' ? null : Number(raw);
    }
  });
  ['spray_units', 'spread_units', 'address', 'bill_to_address', 'ship_to_address'].forEach((key) => {
    const raw = String(form[key] ?? '').trim();
    payload[key] = raw === '' ? null : raw;
  });
  return payload;
}

function CorporateCustomers() {
  const { data: response, isLoading, isError, refetch } = useGetMappingPlantationsQuery({});
  const [updatePlantation, { isLoading: saving }] = useUpdateMappingPlantationMutation();

  const [search, setSearch] = useState('');
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const plantations = useMemo(() => {
    const list = response?.data;
    return Array.isArray(list) ? list : [];
  }, [response]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plantations;
    return plantations.filter((p) => {
      const name = String(p.plantation || p.name || '').toLowerCase();
      return name.includes(q);
    });
  }, [plantations, search]);

  const closeModals = () => {
    setViewRow(null);
    setEditRow(null);
    setForm(EMPTY_FORM);
  };

  const onFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editRow?.id) return;

    for (const key of [
      'spray_rate',
      'spread_rate',
      'scout_rate',
      'spray_max_chemical',
    ]) {
      const raw = String(form[key] ?? '').trim();
      if (raw !== '' && !Number.isFinite(Number(raw))) {
        toast.error(`Invalid ${key.replace(/_/g, ' ')}`);
        return;
      }
      if (key.endsWith('_max_chemical') && raw !== '' && Number(raw) <= 0) {
        toast.error(`${key.replace(/_/g, ' ')} must be greater than zero`);
        return;
      }
    }

    try {
      const res = await updatePlantation(buildUpdatePayload(editRow.id, form)).unwrap();
      if (res?.status === true) {
        toast.success(res.message || 'Plantation customer details updated');
        closeModals();
        refetch();
      } else {
        toast.error(res?.message || 'Update failed');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Update failed');
    }
  };

  return (
    <div className="cc-page">
      <header
        className="cc-header"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${process.env.PUBLIC_URL}/assets/images/cover.png)`,
        }}
      >
        <div className="cc-header-text">
          <h1 className="cc-title">
            <FaBuilding className="cc-title-icon" aria-hidden />
            Corporate Customer
          </h1>
          <p className="cc-subtitle">
            View plantation billing rates and addresses. Plantation name cannot be changed here.
          </p>
        </div>
        <div className="cc-search-wrap">
          <input
            type="search"
            className="cc-search"
            placeholder="Search plantation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FaSearch className="cc-search-icon" aria-hidden />
        </div>
      </header>

      <div className="cc-body">
        {isLoading && <p className="cc-status">Loading plantations…</p>}
        {isError && (
          <p className="cc-status cc-status--error">Could not load plantations. Check API and migration.</p>
        )}

        {!isLoading && !isError && (
          <div className="cc-table-wrap">
          <table className="cc-table">
            <thead>
              <tr>
                <th>Plantation</th>
                <th>Spray rate</th>
                <th>Spray units</th>
                <th>Spray max (kg/Ha)</th>
                <th>Spread rate</th>
                <th>Spread units</th>
                <th>Scout rate</th>
                <th>Address</th>
                <th>Bill-to</th>
                <th>Ship-to</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="cc-empty">
                    No plantations found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="cc-name">{row.plantation || row.name || `#${row.id}`}</td>
                    <td>{formatRate(row.spray_rate)}</td>
                    <td>{row.spray_units || '—'}</td>
                    <td>{formatRate(row.spray_max_chemical ?? 12)}</td>
                    <td>{formatRate(row.spread_rate)}</td>
                    <td>{row.spread_units || '—'}</td>
                    <td>{formatRate(row.scout_rate)}</td>
                    <td className="cc-cell-text" title={row.address || undefined}>
                      {formatText(row.address)}
                    </td>
                    <td className="cc-cell-text" title={row.bill_to_address || undefined}>
                      {formatText(row.bill_to_address)}
                    </td>
                    <td className="cc-cell-text" title={row.ship_to_address || undefined}>
                      {formatText(row.ship_to_address)}
                    </td>
                    <td className="cc-actions">
                      <button type="button" className="cc-btn cc-btn--ghost" onClick={() => setViewRow(row)}>
                        <FaEye /> View
                      </button>
                      <button
                        type="button"
                        className="cc-btn cc-btn--primary"
                        onClick={() => {
                          setEditRow(row);
                          setForm(rowToForm(row));
                        }}
                      >
                        <FaEdit /> Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>


      {viewRow && (
        <CustomerDetailsModal
          title="View customer details"
          titleId="cc-view-title"
          subtitle="Rates, chemical limits, and addresses for this plantation."
          row={viewRow}
          readOnly
          formState={form}
          onChange={onFormChange}
          onClose={closeModals}
          footer={
            <button type="button" className="cc-btn cc-btn--ghost" onClick={closeModals}>
              Close
            </button>
          }
        />
      )}

      {editRow && (
        <CustomerDetailsModal
          title="Update customer details"
          titleId="cc-edit-title"
          subtitle="Change billing rates, kg-per-Ha limits, and addresses. Plantation name cannot be edited."
          row={editRow}
          readOnly={false}
          formState={form}
          onChange={onFormChange}
          onClose={closeModals}
          formProps={{ onSubmit: handleSave }}
          footer={
            <>
              <button type="button" className="cc-btn cc-btn--ghost" onClick={closeModals}>
                Cancel
              </button>
              <button type="submit" className="cc-btn cc-btn--primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </>
          }
        />
      )}
    </div>
  );
}

export default CorporateCustomers;
