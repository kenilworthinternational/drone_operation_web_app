import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiDownload, FiSettings, FiX } from 'react-icons/fi';

const OpsroomPerfSummaryExportControls = ({
  columns,
  exportDisabled = false,
  onExportExcel,
  onExportPdf,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(() => columns.map((c) => c.key));

  useEffect(() => {
    setSelectedKeys((prev) => {
      const valid = columns.map((c) => c.key);
      const kept = prev.filter((k) => valid.includes(k));
      const added = valid.filter((k) => !kept.includes(k));
      return [...kept, ...added];
    });
  }, [columns]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const selectedColumns = useMemo(
    () => columns.filter((c) => selectedKeys.includes(c.key)),
    [columns, selectedKeys],
  );

  const toggleColumn = (key) => {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        if (prev.length <= 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const selectAllColumns = () => setSelectedKeys(columns.map((c) => c.key));
  const clearAllColumns = () => {
    const first = columns[0]?.key;
    if (first) setSelectedKeys([first]);
  };

  const canExport = !exportDisabled && selectedColumns.length > 0;

  return (
    <div className="ops-perf-summary__export-bar">
      <div className="ops-perf-summary__export-center">
        <button
          type="button"
          className={`ops-perf-summary__btn ops-perf-summary__btn--export${open ? ' ops-perf-summary__btn--export-open' : ''}`}
          onClick={() => setOpen(true)}
          disabled={exportDisabled}
          aria-haspopup="dialog"
        >
          <FiSettings /> Export
        </button>
      </div>

      <div className="ops-perf-summary__export-right">
        <button
          type="button"
          className="ops-perf-summary__btn"
          onClick={() => onExportExcel(selectedColumns)}
          disabled={!canExport}
        >
          <FiDownload /> Excel
        </button>
        <button
          type="button"
          className="ops-perf-summary__btn"
          onClick={() => onExportPdf(selectedColumns)}
          disabled={!canExport}
        >
          <FiDownload /> PDF
        </button>
      </div>

      {open &&
        createPortal(
          <div
            className="ops-perf-summary__export-overlay"
            role="presentation"
            onClick={() => setOpen(false)}
          >
            <div
              className="ops-perf-summary__export-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ops-perf-export-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ops-perf-summary__export-modal-header">
                <h3 id="ops-perf-export-title">Select export columns</h3>
                <button
                  type="button"
                  className="ops-perf-summary__export-modal-close"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>

              <div className="ops-perf-summary__export-modal-actions">
                <button type="button" className="ops-perf-summary__link-btn" onClick={selectAllColumns}>
                  Select all
                </button>
                <button type="button" className="ops-perf-summary__link-btn" onClick={clearAllColumns}>
                  Clear all
                </button>
              </div>

              <div className="ops-perf-summary__export-checks">
                {columns.map((col) => {
                  const checked = selectedKeys.includes(col.key);
                  const onlyOne = selectedKeys.length === 1 && checked;
                  return (
                    <label key={col.key} className="ops-perf-summary__export-check">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={onlyOne}
                        onChange={() => toggleColumn(col.key)}
                      />
                      <span>{col.label}</span>
                    </label>
                  );
                })}
              </div>

              <p className="ops-perf-summary__export-hint">
                At least one column must stay selected. Then use Excel or PDF on the toolbar.
              </p>

              <div className="ops-perf-summary__export-modal-footer">
                <button
                  type="button"
                  className="ops-perf-summary__btn"
                  onClick={() => setOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default OpsroomPerfSummaryExportControls;
