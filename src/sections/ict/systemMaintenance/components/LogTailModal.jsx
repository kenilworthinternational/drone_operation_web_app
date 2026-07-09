import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Bars } from 'react-loader-spinner';

const LogTailModal = ({ appName, onClose, onFetch, isLoading, content, error }) => {
  const [lines, setLines] = useState(100);

  const handleLoad = () => {
    if (appName) onFetch({ appName, lines });
  };

  React.useEffect(() => {
    if (appName) handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appName]);

  return (
    <div className="sysmaint-modal-overlay" onClick={onClose} role="presentation">
      <div className="sysmaint-modal sysmaint-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="sysmaint-modal-header">
          <h3>PM2 Logs — {appName}</h3>
          <button type="button" className="sysmaint-modal-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="sysmaint-modal-toolbar">
          <label>
            Lines
            <select value={lines} onChange={(e) => setLines(Number(e.target.value))}>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </label>
          <button type="button" className="sysmaint-btn-secondary" onClick={handleLoad}>
            Reload
          </button>
        </div>
        <div className="sysmaint-modal-body">
          {isLoading ? (
            <div className="sysmaint-loading">
              <Bars height={32} width={32} color="#1a73e8" />
              <span>Loading logs…</span>
            </div>
          ) : error ? (
            <div className="sysmaint-error">{error}</div>
          ) : (
            <pre className="sysmaint-log-pre">{content || 'No log output.'}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogTailModal;
