import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useUpdateMappingEstateMutation } from '../../../api/services NodeJs/mappingHierarchyApi';
import CoordinateModalFrame from './CoordinateModalFrame';
import { parseOptionalCoordinateInput, validateCoordinates } from './coordinateUtils';

const EstateCoordinateModal = ({ estate, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [updateEstate, { isLoading: saving }] = useUpdateMappingEstateMutation();

  useEffect(() => {
    if (!estate) {
      setForm(null);
      return;
    }
    setForm({
      estateId: estate.id,
      estateName: estate.estate || `Estate #${estate.id}`,
      latitude: estate.latitude != null && estate.latitude !== '' ? String(estate.latitude) : '',
      longitude: estate.longitude != null && estate.longitude !== '' ? String(estate.longitude) : '',
    });
  }, [estate]);

  if (!estate || !form) return null;

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
      const result = await updateEstate({
        id: form.estateId,
        latitude,
        longitude,
      }).unwrap();
      if (result?.status) {
        toast.success(result.message || 'Estate coordinates updated');
        onSaved?.();
        onClose?.();
      } else {
        toast.error(result?.message || 'Failed to update estate coordinates');
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to update estate coordinates');
    }
  };

  return (
    <CoordinateModalFrame
      title={`Estate coordinates — ${form.estateName}`}
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

export default EstateCoordinateModal;
