import React from 'react';
import { FaDownload, FaRedoAlt, FaTimes, FaUndoAlt } from 'react-icons/fa';
import { getResourceUrl } from '../utils/media';

export default function ImageViewerModal({
  imageUrl,
  rotation,
  onClose,
  onRotate,
  onDownload,
}) {
  if (!imageUrl) return null;

  return (
    <div className="accidentreports-image-viewer-overlay" onClick={onClose} role="presentation">
      <div className="accidentreports-image-viewer-content" onClick={(e) => e.stopPropagation()}>
        <div className="accidentreports-image-viewer-header">
          <div className="accidentreports-image-viewer-controls">
            <button type="button" onClick={() => onRotate('left')} className="accidentreports-image-viewer-btn" title="Rotate left">
              <FaUndoAlt />
            </button>
            <button type="button" onClick={() => onRotate('right')} className="accidentreports-image-viewer-btn" title="Rotate right">
              <FaRedoAlt />
            </button>
            <button
              type="button"
              onClick={() => onDownload(imageUrl, `image-${Date.now()}.jpg`)}
              className="accidentreports-image-viewer-btn"
              title="Download"
            >
              <FaDownload />
            </button>
          </div>
          <button type="button" onClick={onClose} className="accidentreports-image-viewer-close" title="Close">
            <FaTimes />
          </button>
        </div>
        <div className="accidentreports-image-viewer-image-container">
          <img
            src={getResourceUrl(imageUrl)}
            alt="Full size view"
            className="accidentreports-image-viewer-image"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </div>
      </div>
    </div>
  );
}
