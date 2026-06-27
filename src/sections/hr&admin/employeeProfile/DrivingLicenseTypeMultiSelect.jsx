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
  disabledHint,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selected = normalizeIds(value);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

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

  const remove = (e, licenseId) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selected.filter((x) => x !== licenseId));
  };

  const selectedLicenses = selected
    .map((id) => licenseTypes.find((l) => l.id === id || String(l.id) === String(id)))
    .filter(Boolean);

  const toggleOpen = () => {
    if (!disabled) setOpen((o) => !o);
  };

  const onTriggerKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="ep-license-multi" ref={containerRef}>
      <div
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        aria-haspopup="listbox"
        className={`ep-license-trigger ${open ? 'ep-license-trigger--open' : ''} ${disabled ? 'ep-license-trigger--disabled' : ''}`}
        onClick={toggleOpen}
        onKeyDown={onTriggerKeyDown}
      >
        <div className="ep-license-trigger-body">
          {disabled ? (
            <span className="ep-license-placeholder">{disabledHint || 'Not applicable'}</span>
          ) : selectedLicenses.length === 0 ? (
            <span className="ep-license-placeholder">Select license codes…</span>
          ) : (
            selectedLicenses.map((license) => (
              <span key={license.id} className="ep-license-tag">
                {license.licenseCode}
                <button
                  type="button"
                  className="ep-license-tag-remove"
                  onClick={(e) => remove(e, license.id)}
                  aria-label={`Remove ${license.licenseCode}`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <span className={`ep-license-chevron ${open ? 'ep-license-chevron--open' : ''}`} aria-hidden>
          ▼
        </span>
      </div>

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
                  <span className="ep-license-option-code">{license.licenseCode}</span>
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
