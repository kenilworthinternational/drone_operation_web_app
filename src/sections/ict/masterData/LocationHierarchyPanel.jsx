import React, { useMemo, useState } from 'react';
import {
  useGetProvincesQuery,
  useSaveProvinceMutation,
  useGetDistrictsQuery,
  useSaveDistrictMutation,
  useGetDSCSQuery,
  useSaveDSCSMutation,
  useGetASCSQuery,
  useSaveASCSMutation,
} from '../../../api/services NodeJs/jdManagementApi';
import './LocationHierarchyPanel.unique.css';

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.data)) return v.data;
  return [];
}

function resolveName(row, preferredKeys = []) {
  if (!row || typeof row !== 'object') return String(row || '').trim();
  for (const key of preferredKeys) {
    const v = row[key];
    if (v !== null && v !== undefined && String(v).trim()) return String(v).trim();
  }
  const fallback = Object.values(row).find((v) => typeof v === 'string' && v.trim());
  return fallback ? String(fallback).trim() : '';
}

function ManageCard({ title, count, items, nameKeys, onAdd, onEdit }) {
  return (
    <div className="lhp-card">
      <div className="lhp-card-head">
        <h4 className="lhp-card-title">{title}</h4>
        <button type="button" className="lhp-btn lhp-btn-primary" onClick={onAdd}>+ Add</button>
      </div>
      <p className="lhp-count">{count} records</p>

      <div className="lhp-list">
        {items.length === 0 ? (
          <div className="lhp-empty">No records for selected filters.</div>
        ) : (
          items.map((row, idx) => {
            const label = resolveName(row, nameKeys) || '(Unnamed)';
            const rowKey = row?.id || row?.code || `${title}-${idx}`;
            return (
              <div key={rowKey} className="lhp-row">
                <span className="lhp-row-name">{label}</span>
                <button type="button" className="lhp-btn" onClick={() => onEdit(row)}>Edit</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, onSave }) {
  return (
    <div
      role="presentation"
      onClick={onClose}
      className="lhp-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="lhp-modal"
      >
        <div className="lhp-modal-head">
          <h4 className="lhp-modal-title">{title}</h4>
          <button type="button" className="lhp-btn" onClick={onClose}>Close</button>
        </div>
        <div className="lhp-modal-body">{children}</div>
        <div className="lhp-modal-actions">
          <button type="button" className="lhp-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="lhp-btn lhp-btn-primary" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function LocationHierarchyPanel({ onMessage }) {
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [dscsId, setDscsId] = useState('');
  const [modal, setModal] = useState(null); // { type, mode, draft }

  const { data: provincesRaw = [], refetch: refetchProvinces } = useGetProvincesQuery();
  const { data: districtsRaw = [], refetch: refetchDistricts } = useGetDistrictsQuery(provinceId ? { provinceId } : undefined);
  const { data: dscsRaw = [], refetch: refetchDscs } = useGetDSCSQuery(districtId ? { districtId } : undefined);
  const { data: ascsRaw = [], refetch: refetchAscs } = useGetASCSQuery({ districtId: districtId || undefined, dscsId: dscsId || undefined });

  const [saveProvince] = useSaveProvinceMutation();
  const [saveDistrict] = useSaveDistrictMutation();
  const [saveDSCS] = useSaveDSCSMutation();
  const [saveASCS] = useSaveASCSMutation();

  const provinces = useMemo(() => toArray(provincesRaw), [provincesRaw]);
  const districts = useMemo(() => toArray(districtsRaw), [districtsRaw]);
  const dscs = useMemo(() => toArray(dscsRaw), [dscsRaw]);
  const ascs = useMemo(() => toArray(ascsRaw), [ascsRaw]);

  const selectedProvinceName = useMemo(() => provinces.find((p) => String(p.id) === String(provinceId))?.province || 'All', [provinces, provinceId]);
  const selectedDistrictName = useMemo(() => districts.find((d) => String(d.id) === String(districtId))?.district || 'All', [districts, districtId]);
  const selectedDscName = useMemo(() => dscs.find((d) => String(d.id) === String(dscsId))?.dse || 'All', [dscs, dscsId]);

  const notify = (type, text) => onMessage?.({ type, text });
  const refreshAll = async () => Promise.all([refetchProvinces(), refetchDistricts(), refetchDscs(), refetchAscs()]);

  const openAdd = (type) => {
    if (type === 'district' && !provinceId) return notify('error', 'Select province first');
    if (type === 'dscs' && !districtId) return notify('error', 'Select district first');
    if (type === 'asc' && (!districtId || !dscsId)) return notify('error', 'Select district and divisional secretariat first');

    const defaults = {
      province: { province: '' },
      district: { district: '', province_id: provinceId || '', activated: 1 },
      dscs: { dse: '', district_id: districtId || '' },
      asc: { ascs: '', province_id: provinceId || '', district_id: districtId || '', dscs_id: dscsId || '', activated: 1 },
    };
    setModal({ type, mode: 'add', draft: defaults[type] });
  };

  const openEdit = (type, row) => {
    const mapped = {
      province: { id: row.id, province: row.province || '' },
      district: { id: row.id, district: row.district || '', province_id: row.province_id || provinceId || '', activated: Number(row.activated) === 0 ? 0 : 1 },
      dscs: { id: row.id, dse: row.dse || '', district_id: row.district_id || districtId || '' },
      asc: { id: row.id, ascs: row.ascs || '', province_id: row.province_id || provinceId || '', district_id: row.district_id || districtId || '', dscs_id: row.dscs_id || dscsId || '', activated: Number(row.activated) === 0 ? 0 : 1 },
    };
    setModal({ type, mode: 'edit', draft: mapped[type] });
  };

  const onModalChange = (key, value) => setModal((prev) => ({ ...prev, draft: { ...prev.draft, [key]: value } }));

  const saveModal = async () => {
    if (!modal) return;
    const { type, mode, draft } = modal;
    try {
      if (type === 'province') {
        if (!String(draft.province || '').trim()) return notify('error', 'Province name is required');
        await saveProvince({ ...(mode === 'edit' ? { id: draft.id } : {}), province: draft.province.trim() }).unwrap();
      } else if (type === 'district') {
        if (!String(draft.district || '').trim()) return notify('error', 'District name is required');
        if (!draft.province_id) return notify('error', 'Province is required');
        await saveDistrict({ ...(mode === 'edit' ? { id: draft.id } : {}), district: draft.district.trim(), province_id: draft.province_id, activated: Number(draft.activated) === 0 ? 0 : 1 }).unwrap();
      } else if (type === 'dscs') {
        if (!String(draft.dse || '').trim()) return notify('error', 'Divisional secretariat name is required');
        if (!draft.district_id) return notify('error', 'District is required');
        await saveDSCS({ ...(mode === 'edit' ? { id: draft.id } : {}), dse: draft.dse.trim(), district_id: draft.district_id }).unwrap();
      } else if (type === 'asc') {
        if (!String(draft.ascs || '').trim()) return notify('error', 'ASC name is required');
        if (!draft.district_id || !draft.dscs_id) return notify('error', 'District and divisional secretariat are required');
        await saveASCS({ ...(mode === 'edit' ? { id: draft.id } : {}), ascs: draft.ascs.trim(), province_id: draft.province_id || null, district_id: draft.district_id, dscs_id: draft.dscs_id, activated: Number(draft.activated) === 0 ? 0 : 1 }).unwrap();
      }
      notify('success', `${modal.mode === 'edit' ? 'Updated' : 'Added'} successfully`);
      setModal(null);
      await refreshAll();
    } catch (e) {
      notify('error', e?.data?.message || 'Save failed');
    }
  };

  return (
    <div className="lhp-root">
      <div className="lhp-filters">
        <div className="lhp-field">
          <label>Province</label>
          <select
            className="lhp-input"
            value={provinceId}
            onChange={(e) => {
              setProvinceId(e.target.value);
              setDistrictId('');
              setDscsId('');
            }}
          >
            <option value="">All</option>
            {provinces.map((p) => <option key={p.id} value={p.id}>{p.province}</option>)}
          </select>
        </div>
        <div className="lhp-field">
          <label>District</label>
          <select
            className="lhp-input"
            value={districtId}
            onChange={(e) => {
              setDistrictId(e.target.value);
              setDscsId('');
            }}
          >
            <option value="">All</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.district}</option>)}
          </select>
        </div>
        <div className="lhp-field">
          <label>Divisional Secretariat</label>
          <select className="lhp-input" value={dscsId} onChange={(e) => setDscsId(e.target.value)}>
            <option value="">All</option>
            {dscs.map((d) => <option key={d.id} value={d.id}>{d.dse}</option>)}
          </select>
        </div>
      </div>

      <p className="lhp-active-filters">
        Active filters: <strong>{selectedProvinceName}</strong> / <strong>{selectedDistrictName}</strong> / <strong>{selectedDscName}</strong>
      </p>

      <div className="lhp-grid">
          <ManageCard title="Provinces" count={provinces.length} items={provinces} nameKeys={['province', 'name', 'label']} onAdd={() => openAdd('province')} onEdit={(r) => openEdit('province', r)} />
          <ManageCard title="Districts" count={districts.length} items={districts} nameKeys={['district', 'name', 'label']} onAdd={() => openAdd('district')} onEdit={(r) => openEdit('district', r)} />
          <ManageCard title="Divisional Secretariats" count={dscs.length} items={dscs} nameKeys={['dse', 'divisional_secretariat', 'name', 'label']} onAdd={() => openAdd('dscs')} onEdit={(r) => openEdit('dscs', r)} />
          <ManageCard title="ASCs" count={ascs.length} items={ascs} nameKeys={['ascs', 'asc', 'name', 'label']} onAdd={() => openAdd('asc')} onEdit={(r) => openEdit('asc', r)} />
      </div>

      {modal && (
        <Modal title={`${modal.mode === 'edit' ? 'Edit' : 'Add'} ${modal.type === 'dscs' ? 'Divisional Secretariat' : modal.type.toUpperCase()}`} onClose={() => setModal(null)} onSave={saveModal}>
          {modal.type === 'province' && (
            <div className="lhp-field">
              <label>Province name</label>
              <input className="lhp-input" value={modal.draft.province || ''} onChange={(e) => onModalChange('province', e.target.value)} />
            </div>
          )}

          {modal.type === 'district' && (
            <div className="lhp-filters">
              <div className="lhp-field">
                <label>District name</label>
                <input className="lhp-input" value={modal.draft.district || ''} onChange={(e) => onModalChange('district', e.target.value)} />
              </div>
              <div className="lhp-field">
                <label>Province</label>
                <select className="lhp-input" value={modal.draft.province_id || ''} onChange={(e) => onModalChange('province_id', e.target.value)}>
                  <option value="">-- Select --</option>
                  {provinces.map((p) => <option key={p.id} value={p.id}>{p.province}</option>)}
                </select>
              </div>
            </div>
          )}

          {modal.type === 'dscs' && (
            <div className="lhp-filters">
              <div className="lhp-field">
                <label>Divisional Secretariat name</label>
                <input className="lhp-input" value={modal.draft.dse || ''} onChange={(e) => onModalChange('dse', e.target.value)} />
              </div>
              <div className="lhp-field">
                <label>District</label>
                <select className="lhp-input" value={modal.draft.district_id || ''} onChange={(e) => onModalChange('district_id', e.target.value)}>
                  <option value="">-- Select --</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.district}</option>)}
                </select>
              </div>
            </div>
          )}

          {modal.type === 'asc' && (
            <div className="lhp-filters">
              <div className="lhp-field">
                <label>ASC name</label>
                <input className="lhp-input" value={modal.draft.ascs || ''} onChange={(e) => onModalChange('ascs', e.target.value)} />
              </div>
              <div className="lhp-field">
                <label>Province</label>
                <select className="lhp-input" value={modal.draft.province_id || ''} onChange={(e) => onModalChange('province_id', e.target.value)}>
                  <option value="">-- Select --</option>
                  {provinces.map((p) => <option key={p.id} value={p.id}>{p.province}</option>)}
                </select>
              </div>
              <div className="lhp-field">
                <label>District</label>
                <select className="lhp-input" value={modal.draft.district_id || ''} onChange={(e) => onModalChange('district_id', e.target.value)}>
                  <option value="">-- Select --</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.district}</option>)}
                </select>
              </div>
              <div className="lhp-field">
                <label>Divisional Secretariat</label>
                <select className="lhp-input" value={modal.draft.dscs_id || ''} onChange={(e) => onModalChange('dscs_id', e.target.value)}>
                  <option value="">-- Select --</option>
                  {dscs.map((d) => <option key={d.id} value={d.id}>{d.dse}</option>)}
                </select>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
