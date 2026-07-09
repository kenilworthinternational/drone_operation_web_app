import React from 'react';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import CoordinateMapPicker from './CoordinateMapPicker';
import './coordinateModal.css';

const CoordinateModalFrame = ({
  title,
  footnote,
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  onPick,
  onClose,
  onSave,
  saving = false,
}) => (
  <div className="geo-coord-modal-overlay" onClick={onClose}>
    <div className="geo-coord-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
      <header className="geo-coord-modal__header">
        <h3 className="geo-coord-modal__title">
          <FaEdit aria-hidden />
          {title}
        </h3>
        <button type="button" className="geo-coord-modal__close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
      </header>

      <div className="geo-coord-modal__body">
        <div className="geo-coord-modal__coord-row">
          <div className="geo-coord-modal__field">
            <label htmlFor="geo-coord-lat">Latitude</label>
            <input
              id="geo-coord-lat"
              type="number"
              min="-90"
              max="90"
              step="0.0000001"
              placeholder="e.g. 6.8747931"
              value={latitude}
              onChange={(e) => onLatitudeChange(e.target.value)}
            />
          </div>
          <div className="geo-coord-modal__field">
            <label htmlFor="geo-coord-lon">Longitude</label>
            <input
              id="geo-coord-lon"
              type="number"
              min="-180"
              max="180"
              step="0.0000001"
              placeholder="e.g. 79.8887541"
              value={longitude}
              onChange={(e) => onLongitudeChange(e.target.value)}
            />
          </div>
          <div className="geo-coord-modal__picked">
            <span className="geo-coord-modal__picked-label">Selected point</span>
            <span className="geo-coord-modal__picked-value">
              {latitude || '—'}, {longitude || '—'}
            </span>
          </div>
        </div>

        <CoordinateMapPicker latitude={latitude} longitude={longitude} onPick={onPick} />

        {footnote ? <p className="geo-coord-modal__footnote">{footnote}</p> : null}
      </div>

      <footer className="geo-coord-modal__footer">
        <button type="button" className="geo-coord-modal__btn geo-coord-modal__btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="geo-coord-modal__btn geo-coord-modal__btn--primary"
          onClick={onSave}
          disabled={saving}
        >
          <FaSave aria-hidden />
          {saving ? 'Saving…' : 'Save coordinates'}
        </button>
      </footer>
    </div>
  </div>
);

export default CoordinateModalFrame;
