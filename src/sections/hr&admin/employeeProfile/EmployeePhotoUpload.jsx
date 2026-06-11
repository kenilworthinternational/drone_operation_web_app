import React, { useRef, useState } from 'react';
import { useUpdateEmployeeRegistrationMutation } from '../../../api/services NodeJs/jdManagementApi';
import { employeeInitials, getEmployeePhotoUrl } from './employeeProfileUtils';

export default function EmployeePhotoUpload({
  employeeId,
  employee,
  onUploaded,
  size = 'hero',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [updateEmployee] = useUpdateEmployeeRegistrationMutation();

  const photoUrl = previewUrl || getEmployeePhotoUrl(employee);
  const name = employee?.employeeName || employee?.preferredName || 'Employee';
  const initials = employeeInitials(name);
  const isHero = size === 'hero';

  const handleFile = async (file) => {
    if (!file || !employeeId) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('id', String(employeeId));
      fd.append('employeePhoto', file);
      await updateEmployee(fd).unwrap();
      onUploaded?.();
    } catch {
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`ep-photo-upload ep-photo-upload--${size}`}>
      <button
        type="button"
        className="ep-photo-trigger"
        onClick={() => !uploading && inputRef.current?.click()}
        disabled={uploading || !employeeId}
        title="Upload employee photo"
      >
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="ep-photo-img" />
        ) : (
          <span className="ep-photo-initials">{initials || '?'}</span>
        )}
        <span className="ep-photo-overlay">
          {uploading ? 'Uploading…' : 'Change photo'}
        </span>
      </button>
      {isHero && !photoUrl && (
        <p className="ep-photo-hint">JPG, PNG or WEBP</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="ep-photo-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
