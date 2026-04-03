import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import {
  useLazySearchFieldsQuery,
  useLazyGetFieldByIdQuery,
  useUpdateFieldAreaMutation,
  useLazyGetPlanDivisionFieldsByFieldIdQuery,
  useUpdatePlanDivisionFieldAreaMutation,
} from '../../../api/services NodeJs/fieldSizeAdjustmentsApi';
import '../../../styles/fieldSizeAdjustments.css';

const DEBOUNCE_MS = 300;

const FieldSizeAdjustments = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [fieldDetails, setFieldDetails] = useState(null);
  const [fieldAreaEdit, setFieldAreaEdit] = useState('');
  const [pdfRows, setPdfRows] = useState([]);
  const [pdfAreaEdits, setPdfAreaEdits] = useState({});
  const [saveFieldMsg, setSaveFieldMsg] = useState('');
  const [saveFieldMsgType, setSaveFieldMsgType] = useState('success');
  const [savePdfMsg, setSavePdfMsg] = useState({});
  const inputContainerRef = useRef(null);
  const [dropdownRect, setDropdownRect] = useState(null);

  const [triggerSearch, { data: searchData, isFetching: searchFetching }] = useLazySearchFieldsQuery();
  const [triggerGetField, { data: fieldData }] = useLazyGetFieldByIdQuery();
  const [triggerGetPdf] = useLazyGetPlanDivisionFieldsByFieldIdQuery();
  const [updateFieldArea, { isLoading: updatingField }] = useUpdateFieldAreaMutation();
  const [updatePdfArea, { isLoading: updatingPdf }] = useUpdatePlanDivisionFieldAreaMutation();

  const fetchFieldDetails = useCallback(
    async (fieldId) => {
      const result = await triggerGetField(fieldId);
      const field = result.data?.data ?? result.data;
      if (field) {
        setFieldDetails(field);
        setFieldAreaEdit(String(field.area ?? ''));
      } else {
        setFieldDetails(null);
        setFieldAreaEdit('');
      }
    },
    [triggerGetField]
  );

  const fetchPdfRows = useCallback(
    async (fieldId) => {
      const result = await triggerGetPdf(fieldId);
      const rows = result.data?.data ?? result.data ?? [];
      setPdfRows(rows);
      const edits = {};
      rows.forEach((r) => {
        edits[r.id] = r.field_area != null ? String(r.field_area) : '';
      });
      setPdfAreaEdits(edits);
    },
    [triggerGetPdf]
  );

  useEffect(() => {
    if (!selectedFieldId) {
      setFieldDetails(null);
      setFieldAreaEdit('');
      setPdfRows([]);
      setPdfAreaEdits({});
      return;
    }
    fetchFieldDetails(selectedFieldId);
    fetchPdfRows(selectedFieldId);
  }, [selectedFieldId, fetchFieldDetails, fetchPdfRows]);

  // On mount and when user types: empty q = all fields, otherwise filter by id/name/short name
  useEffect(() => {
    const t = setTimeout(() => {
      const q = (searchInput || '').trim();
      triggerSearch({ q, limit: q ? 500 : 10000 });
    }, searchInput ? DEBOUNCE_MS : 0);
    return () => clearTimeout(t);
  }, [searchInput, triggerSearch]);

  useEffect(() => {
    const list = Array.isArray(searchData) ? searchData : (searchData?.data ?? []);
    setSuggestions(list);
  }, [searchData]);

  useEffect(() => {
    if (!showSuggestions) {
      setDropdownRect(null);
      return;
    }
    const measure = () => {
      if (inputContainerRef.current) {
        setDropdownRect(inputContainerRef.current.getBoundingClientRect());
      }
    };
    measure();
    const t = setTimeout(measure, 0);
    return () => clearTimeout(t);
  }, [showSuggestions]);

  const handleSelectSuggestion = (f) => {
    setSelectedFieldId(f.id);
    setSearchInput(`${f.short_name || f.field || ''} (${f.id})`);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSaveFieldArea = async () => {
    if (selectedFieldId == null || fieldAreaEdit === '') return;
    setSaveFieldMsg('');
    try {
      await updateFieldArea({ fieldId: selectedFieldId, area: parseFloat(fieldAreaEdit) }).unwrap();
      setSaveFieldMsg('Field area updated.');
      setSaveFieldMsgType('success');
      try {
        await fetchFieldDetails(selectedFieldId);
      } catch (refetchErr) {
        /* Refetch after save can fail; keep success message and current value */
      }
    } catch (e) {
      const msg = e?.data?.message ?? e?.data?.error ?? e?.message ?? 'Failed to update.';
      setSaveFieldMsg(msg);
      setSaveFieldMsgType('error');
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setShowSuggestions(true);
    triggerSearch({ q: '', limit: 10000 });
    inputContainerRef.current?.querySelector('.search-input-fieldsize-adjust')?.focus();
  };

  const handleSavePdfArea = async (pdfId, fieldId) => {
    const value = pdfAreaEdits[pdfId];
    if (value === '' || value == null) return;
    setSavePdfMsg((prev) => ({ ...prev, [pdfId]: '' }));
    try {
      await updatePdfArea({ id: pdfId, field_area: parseFloat(value), fieldId }).unwrap();
      setSavePdfMsg((prev) => ({ ...prev, [pdfId]: 'Updated.' }));
      fetchPdfRows(fieldId);
    } catch (e) {
      setSavePdfMsg((prev) => ({ ...prev, [pdfId]: e?.data?.message || 'Failed' }));
    }
  };

  return (
    <div className="container-fieldsize-adjust">
      <div className="header-fieldsize-adjust">
        <button
          type="button"
          className="back-btn-fieldsize-adjust"
          onClick={() => navigate({ pathname: '/home/workflowDashboard', search: routerLocation.search })}
          title="Back to Workflow Dashboard"
        >
          <FaArrowLeft />
        </button>
        <h1 className="title-fieldsize-adjust">Field Size Adjustments</h1>
      </div>

      <div className="search-section-fieldsize-adjust">
        <label className="search-label-fieldsize-adjust">Search field (by ID, name or short name)</label>
        <div ref={inputContainerRef} className="input-wrap-fieldsize-adjust">
          <input
            type="text"
            className="search-input-fieldsize-adjust"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => {
              setShowSuggestions(true);
              if (!searchInput.trim()) triggerSearch({ q: '', limit: 10000 });
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Click to show all fields; type to filter by ID, name or short name..."
          />
          {searchInput ? (
            <button
              type="button"
              className="search-clear-btn-fieldsize-adjust"
              onClick={handleClearSearch}
              onMouseDown={(e) => e.preventDefault()}
              title="Clear search"
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          ) : null}
          {searchFetching && <span className="searching-fieldsize-adjust">Searching...</span>}
          {showSuggestions && dropdownRect &&
            createPortal(
              <ul
                className="dropdown-list-fieldsize-adjust"
                style={{
                  left: dropdownRect.left,
                  top: dropdownRect.bottom + 2,
                  width: dropdownRect.width,
                }}
              >
                {searchFetching && suggestions.length === 0 ? (
                  <li className="dropdown-message-fieldsize-adjust">Loading...</li>
                ) : suggestions.length === 0 ? (
                  <li className="dropdown-message-fieldsize-adjust">No fields found</li>
                ) : (
                  suggestions.map((f) => (
                    <li
                      key={f.id}
                      className="dropdown-item-fieldsize-adjust"
                      onClick={() => handleSelectSuggestion(f)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <span className="dropdown-item-title-fieldsize-adjust">{f.short_name || f.field || '—'}</span>
                      {f.field && f.field !== (f.short_name || '') && (
                        <span className="dropdown-item-sub-fieldsize-adjust">{f.field}</span>
                      )}
                      <span className="dropdown-item-meta-fieldsize-adjust">(ID: {f.id}, Area: {f.area ?? '—'})</span>
                    </li>
                  ))
                )}
              </ul>,
              document.body
            )}
        </div>
      </div>

      {fieldDetails && (
        <>
          <div className="field-details-card-fieldsize-adjust">
            <h3 className="field-details-title-fieldsize-adjust">Field details</h3>
            {fieldDetails.estate_finalized === 1 && (
              <p className="field-details-locked-msg-fieldsize-adjust">Field area cannot be changed: estate is finalized.</p>
            )}
            <div className="field-details-row-fieldsize-adjust">
              <div className="field-detail-item-fieldsize-adjust">
                <label className="field-detail-label-fieldsize-adjust">Field name</label>
                <span className="field-detail-value-fieldsize-adjust">{fieldDetails.field ?? '—'}</span>
              </div>
              <div className="field-detail-item-fieldsize-adjust">
                <label className="field-detail-label-fieldsize-adjust">Short name</label>
                <span className="field-detail-value-fieldsize-adjust">{fieldDetails.short_name ?? '—'}</span>
              </div>
              <div className="field-detail-item-fieldsize-adjust field-detail-area-wrap-fieldsize-adjust">
                <label className="field-detail-label-fieldsize-adjust">Area</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="area-input-fieldsize-adjust"
                  value={fieldAreaEdit}
                  onChange={(e) => setFieldAreaEdit(e.target.value)}
                  disabled={fieldDetails.estate_finalized === 1}
                  readOnly={fieldDetails.estate_finalized === 1}
                  title={fieldDetails.estate_finalized === 1 ? 'Field area is locked because estate is finalized' : ''}
                />
                <button
                  type="button"
                  className="save-area-btn-fieldsize-adjust"
                  onClick={handleSaveFieldArea}
                  disabled={updatingField || fieldDetails.estate_finalized === 1}
                  title={fieldDetails.estate_finalized === 1 ? 'Cannot save: estate is finalized' : ''}
                >
                  {updatingField ? 'Saving...' : 'Save area'}
                </button>
              </div>
            </div>
            {saveFieldMsg && (
              <p className={`save-field-msg-fieldsize-adjust save-field-msg-${saveFieldMsgType}-fieldsize-adjust`}>
                {saveFieldMsg}
              </p>
            )}
          </div>

          <div className="pdf-section-fieldsize-adjust">
            <h3 className="pdf-title-fieldsize-adjust">Plan division fields (for this field)</h3>
            <table className="pdf-table-fieldsize-adjust">
              <thead>
                <tr className="pdf-thead-row-fieldsize-adjust">
                  <th className="pdf-th-fieldsize-adjust">ID</th>
                  <th className="pdf-th-fieldsize-adjust">Plan</th>
                  <th className="pdf-th-fieldsize-adjust">Date</th>
                  <th className="pdf-th-fieldsize-adjust">Estate name</th>
                  <th className="pdf-th-fieldsize-adjust">Field name</th>
                  <th className="pdf-th-fieldsize-adjust">Field area</th>
                  <th className="pdf-th-fieldsize-adjust">Action</th>
                </tr>
              </thead>
              <tbody>
                {pdfRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="pdf-empty-cell-fieldsize-adjust">
                      No plan division fields found for this field.
                    </td>
                  </tr>
                ) : (
                  pdfRows.map((row) => (
                    <tr key={row.id} className="pdf-tbody-row-fieldsize-adjust">
                      <td className="pdf-td-fieldsize-adjust">{row.id}</td>
                      <td className="pdf-td-fieldsize-adjust">{row.plan}</td>
                      <td className="pdf-td-fieldsize-adjust">{row.plan_date ?? '—'}</td>
                      <td className="pdf-td-fieldsize-adjust">{row.estate_name ?? '—'}</td>
                      <td className="pdf-td-fieldsize-adjust">{row.field_name ?? row.field_short_name ?? '—'}</td>
                      <td className="pdf-td-fieldsize-adjust">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          className="pdf-input-fieldsize-adjust"
                          value={pdfAreaEdits[row.id] ?? ''}
                          onChange={(e) => setPdfAreaEdits((prev) => ({ ...prev, [row.id]: e.target.value }))}
                        />
                      </td>
                      <td className="pdf-td-fieldsize-adjust">
                        <button
                          type="button"
                          className="pdf-save-btn-fieldsize-adjust"
                          onClick={() => handleSavePdfArea(row.id, selectedFieldId)}
                          disabled={updatingPdf}
                        >
                          Save
                        </button>
                        {savePdfMsg[row.id] && (
                          <span className="pdf-save-msg-fieldsize-adjust">{savePdfMsg[row.id]}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!fieldDetails && selectedFieldId && (
        <p className="loading-text-fieldsize-adjust">Loading field details…</p>
      )}
    </div>
  );
};

export default FieldSizeAdjustments;
