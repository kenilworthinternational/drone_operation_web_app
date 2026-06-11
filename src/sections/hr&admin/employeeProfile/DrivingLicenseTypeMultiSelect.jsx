import React, { useEffect, useRef, useState } from 'react';

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return value.map((id) => {
    const n = parseInt(id, 10);
    return Number.isNaN(n) ? id : n;
  });
}

export default function DrivingLicenseTypeMultiSelect({
  value = [],
  onChange,
  licenseTypes = [],
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selected = normalizeIds(value);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const toggle = (licenseId) => {
    if (disabled) return;
    const id = typeof licenseId === 'number' ? licenseId : parseInt(licenseId, 10);
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const remove = (licenseId) => {
    if (disabled) return;
    onChange(selected.filter((x) => x !== licenseId));
  };

  const selectedLicenses = selected
    .map((id) => licenseTypes.find((l) => l.id === id || String(l.id) === String(id)))
    .filter(Boolean);

  return (
    <div className="ep-license-multi" ref={containerRef}>
      {selectedLicenses.length > 0 && (
        <div className="ep-license-tags">
          {selectedLicenses.map((license) => (
            <span key={license.id} className="ep-license-tag">
              {license.licenseCode}
              {!disabled && (
                <button
                  type="button"
                  className="ep-license-tag-remove"
                  onClick={() => remove(license.id)}
                  aria-label={`Remove ${license.licenseCode}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`ep-license-trigger ${disabled ? 'ep-license-trigger--disabled' : ''}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-expanded={open}
      >
        <span className="ep-license-trigger-text">
          {disabled
            ? 'Not applicable (no driving license)'
            : selected.length === 0
              ? 'Select license codes…'
              : `${selected.length} selected`}
        </span>
        <span className={`ep-license-chevron ${open ? 'ep-license-chevron--open' : ''}`}>▼</span>
      </button>

      {open && !disabled && (
        <div className="ep-license-dropdown" role="listbox" aria-multiselectable="true">
          {licenseTypes.length === 0 ? (
            <p className="ep-license-empty">No license types available.</p>
          ) : (
            licenseTypes.map((license) => {
              const isSelected = selected.includes(license.id);
              return (
                <button
                  key={license.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`ep-license-option ${isSelected ? 'ep-license-option--selected' : ''}`}
                  onClick={() => toggle(license.id)}
                >
                  <span>{license.licenseCode}</span>
                  <span className={`ep-license-check ${isSelected ? 'ep-license-check--on' : ''}`}>
                    {isSelected ? '✓' : ''}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
