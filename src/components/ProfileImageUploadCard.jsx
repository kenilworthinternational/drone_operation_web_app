import React, { useEffect, useId, useMemo } from 'react';
import '../styles/vehicleProfile.css';

/**
 * Single-slot image upload card — same UI as vehicle profile document gallery.
 */
export default function ProfileImageUploadCard({
  label = 'Profile photo',
  file = null,
  existingUrl = null,
  accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  disabled = false,
  onFileSelect,
  onClear,
}) {
  const inputId = useId();

  const previewUrl = useMemo(() => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return existingUrl || null;
  }, [file, existingUrl]);

  useEffect(() => {
    if (!(file instanceof File)) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [file, previewUrl]);

  const hasFile = file instanceof File || Boolean(existingUrl && !file);

  return (
    <div className="vehicle-profile-gallery profile-image-upload-gallery">
      <div className="vehicle-profile-gallery-card">
        <div className="vehicle-profile-gallery-preview">
          {previewUrl ? (
            <img src={previewUrl} alt={label} />
          ) : (
            <div className="vehicle-profile-gallery-empty">No file yet</div>
          )}
        </div>
        <span className="vehicle-profile-gallery-label">{label}</span>
        <div className="vehicle-profile-gallery-actions">
          <input
            id={inputId}
            type="file"
            accept={accept}
            className="vehicle-profile-gallery-file-input"
            disabled={disabled}
            onChange={(e) => {
              const picked = e.target.files?.[0];
              if (picked && onFileSelect) onFileSelect(picked);
              e.target.value = '';
            }}
          />
          <label htmlFor={inputId} className="vehicle-profile-gallery-upload-btn">
            {hasFile ? 'Replace' : 'Upload'}
          </label>
          {hasFile && onClear ? (
            <button
              type="button"
              className="profile-image-upload-clear-btn"
              disabled={disabled}
              onClick={onClear}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
