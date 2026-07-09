import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useUpdateMappingDivisionMutation } from '../../../api/services NodeJs/mappingHierarchyApi';
import CoordinateModalFrame from './CoordinateModalFrame';
import { parseOptionalCoordinateInput, validateCoordinates } from './coordinateUtils';

const DivisionCoordinateModal = ({ division, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [updateDivision, { isLoading: saving }] = useUpdateMappingDivisionMutation();

  useEffect(() => {
    if (!division) {
      setForm(null);
      return;
    }
    setForm({
      divisionId: division.id,
      divisionName: division.division || `Division #${division.id}`,
      latitude: division.latitude != null && division.latitude !== '' ? String(division.latitude) : '',
      longitude: division.longitude != null && division.longitude !== '' ? String(division.longitude) : '',
    });
  }, [division]);

  if (!division || !form) return null;

  const handleSave = async () => {
    const latRaw = form.latitude.trim();
    const lonRaw = form.longitude.trim();
    const coordErr = validateCoordinates(latRaw, lonRaw);
    if (coordErr) {
      toast.error(coordErr);
      return;
    }
    const latitude = parseOptionalCoordinateInput(latRaw, -90, 90);
    const longitude = parseOptionalCoordinateInput(lonRaw, -180, 180);

    try {
      const result = await updateDivision({
        id: form.divisionId,
        latitude,
        longitude,
      }).unwrap();
      if (result?.status) {
        toast.success(result.message || 'Division coordinates updated');
        onSaved?.();
        onClose?.();
      } else {
        toast.error(result?.message || 'Failed to update division coordinates');
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to update division coordinates');
    }
  };

  return (
    <CoordinateModalFrame
      title={`Division coordinates — ${form.divisionName}`}
      footnote="Leave empty to clear coordinates. Weather prediction uses these values for this division."
      latitude={form.latitude}
      longitude={form.longitude}
      onLatitudeChange={(value) => setForm((prev) => ({ ...prev, latitude: value }))}
      onLongitudeChange={(value) => setForm((prev) => ({ ...prev, longitude: value }))}
      onPick={(lat, lon) =>
        setForm((prev) => ({
          ...prev,
          latitude: lat.toFixed(7),
          longitude: lon.toFixed(7),
        }))
      }
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    />
  );
};

export default DivisionCoordinateModal;
