import React, { useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import {
  useGetVehicleCategoriesQuery,
  useGetVehicleMakesQuery,
  useGetVehicleModelsQuery,
} from '../api/services/assetsApi';
import {
  useSaveVehicleCategoryMutation,
  useSaveVehicleMakeMutation,
  useSaveVehicleModelMutation,
} from '../api/services NodeJs/jdManagementApi';
import '../styles/vehicleMasterSelect.css';

const ADD_MODAL_NONE = null;

const normMasterLabel = (value) => String(value ?? '').trim().toLowerCase();

const isNumericId = (value) => /^\d+$/.test(String(value ?? '').trim());

/**
 * Category / make / model selects with inline "Add" actions (inventory-style).
 * Form stores make & model as master row IDs; resolve labels on submit via vehicleMakes/vehicleModels.
 */
export function resolveVehicleMasterIds(asset, categories = [], makes = [], models = []) {
  let categoryId = '';
  if (asset?.vehicle_category_id != null && asset.vehicle_category_id !== '') {
    categoryId = String(asset.vehicle_category_id);
  } else if (asset?.vehicle_category != null && isNumericId(asset.vehicle_category)) {
    categoryId = String(asset.vehicle_category).trim();
  } else {
    const categoryLabel = normMasterLabel(
      asset?.vehicle_category_name || asset?.vehicle_category
    );
    if (categoryLabel) {
      const catRow = categories.find((c) => normMasterLabel(c.category) === categoryLabel);
      if (catRow?.id != null) categoryId = String(catRow.id);
    }
  }

  const makeRaw = asset?.make;
  let makeId = '';
  if (makeRaw != null && makeRaw !== '' && makes.some((m) => String(m.id) === String(makeRaw))) {
    makeId = String(makeRaw);
  } else {
    const makeText = normMasterLabel(makeRaw);
    const makeRow = makes.find((m) => normMasterLabel(m.make) === makeText);
    makeId = makeRow?.id != null ? String(makeRow.id) : '';
  }

  const modelRaw = asset?.model;
  let modelId = '';
  if (modelRaw != null && modelRaw !== '' && models.some((m) => String(m.id) === String(modelRaw))) {
    modelId = String(modelRaw);
  } else {
    const modelText = normMasterLabel(modelRaw);
    const modelRow = models.find((m) => normMasterLabel(m.model) === modelText);
    modelId = modelRow?.id != null ? String(modelRow.id) : '';
  }

  return {
    vehicle_category: categoryId,
    make: makeId,
    model: modelId,
  };
}

export function vehicleMasterLabelsFromIds(makeId, modelId, makes = [], models = []) {
  const selectedMake = makes.find((row) => String(row.id) === String(makeId));
  const selectedModel = models.find((row) => String(row.id) === String(modelId));
  return {
    make: (selectedMake?.make || '').trim(),
    model: (selectedModel?.model || '').trim(),
  };
}

export default function VehicleMasterSelectFields({
  values,
  onValuesChange,
  required = false,
  variant = 'assets',
  onNotify,
}) {
  const [addModal, setAddModal] = useState(ADD_MODAL_NONE);
  const [draftName, setDraftName] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetVehicleCategoriesQuery();
  const categoryId = values?.vehicle_category || '';
  const makeId = values?.make || '';

  const { data: makesResponse, isLoading: makesLoading } = useGetVehicleMakesQuery(
    { vehicle_category_id: categoryId || null },
    { skip: !categoryId }
  );
  const { data: modelsResponse, isLoading: modelsLoading } = useGetVehicleModelsQuery(
    { vehicle_make_id: makeId || null },
    { skip: !makeId }
  );

  const [saveVehicleCategory] = useSaveVehicleCategoryMutation();
  const [saveVehicleMake] = useSaveVehicleMakeMutation();
  const [saveVehicleModel] = useSaveVehicleModelMutation();

  const vehicleCategories = useMemo(() => {
    if (!categoriesResponse) return [];
    if (Array.isArray(categoriesResponse)) return categoriesResponse;
    if (Array.isArray(categoriesResponse?.data)) return categoriesResponse.data;
    return [];
  }, [categoriesResponse]);

  const vehicleMakes = useMemo(() => {
    if (!makesResponse) return [];
    if (Array.isArray(makesResponse)) return makesResponse;
    if (Array.isArray(makesResponse?.data)) return makesResponse.data;
    return [];
  }, [makesResponse]);

  const vehicleModels = useMemo(() => {
    if (!modelsResponse) return [];
    if (Array.isArray(modelsResponse)) return modelsResponse;
    if (Array.isArray(modelsResponse?.data)) return modelsResponse.data;
    return [];
  }, [modelsResponse]);

  const prefix = variant === 'registration' ? 'assets-reg' : 'assets';
  const requiredMarkClass =
    variant === 'registration' ? 'required-assets-reg' : 'required-indicator-assets';

  const patch = (partial) => onValuesChange?.({ ...values, ...partial });

  const notify = (type, message) => {
    if (onNotify) onNotify({ type, message });
  };

  const openAdd = (type) => {
    setDraftName('');
    setAddModal(type);
  };

  const closeAdd = () => {
    setAddModal(ADD_MODAL_NONE);
    setDraftName('');
  };

  const handleSaveAdd = async () => {
    const name = String(draftName || '').trim();
    if (!name) {
      notify('error', 'Name is required.');
      return;
    }
    setSaving(true);
    try {
      if (addModal === 'category') {
        const res = await saveVehicleCategory({ category: name, activated: 1 }).unwrap();
        const row = res?.data ?? res;
        const newId = row?.id;
        if (newId) patch({ vehicle_category: String(newId), make: '', model: '' });
        notify('success', 'Vehicle category added.');
      } else if (addModal === 'make') {
        if (!categoryId) {
          notify('error', 'Select a vehicle category first.');
          return;
        }
        const res = await saveVehicleMake({
          vehicle_category_id: categoryId,
          make: name,
          activated: 1,
        }).unwrap();
        const row = res?.data ?? res;
        const newId = row?.id;
        if (newId) patch({ make: String(newId), model: '' });
        notify('success', 'Vehicle make added.');
      } else if (addModal === 'model') {
        if (!makeId) {
          notify('error', 'Select a make first.');
          return;
        }
        const res = await saveVehicleModel({
          vehicle_make_id: makeId,
          model: name,
          activated: 1,
        }).unwrap();
        const row = res?.data ?? res;
        const newId = row?.id;
        if (newId) patch({ model: String(newId) });
        notify('success', 'Vehicle model added.');
      }
      closeAdd();
    } catch (err) {
      notify('error', err?.data?.message || err?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const modalTitle =
    addModal === 'category' ? 'Add vehicle category' : addModal === 'make' ? 'Add make' : addModal === 'model' ? 'Add model' : '';

  return (
    <>
      <div className={`form-row-vehicle-master form-row-vehicle-master--${prefix}`}>
        <div className={`form-group-vehicle-master form-group-${prefix}`}>
          <label htmlFor="vehicle_category">
            Vehicle Category{required ? <span className={requiredMarkClass}> *</span> : null}
          </label>
          <div className="input-with-add-vehicle-master">
            <select
              id="vehicle_category"
              name="vehicle_category"
              value={values?.vehicle_category || ''}
              onChange={(e) => patch({ vehicle_category: e.target.value, make: '', model: '' })}
              disabled={categoriesLoading}
            >
              <option value="">{categoriesLoading ? 'Loading...' : 'Select vehicle category'}</option>
              {vehicleCategories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.category}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-add-vehicle-master"
              onClick={() => openAdd('category')}
              title="Add vehicle category"
            >
              <FaPlus aria-hidden /> Add
            </button>
          </div>
        </div>
        <div className={`form-group-vehicle-master form-group-${prefix}`}>
          <label htmlFor="make">
            Make{required ? <span className={requiredMarkClass}> *</span> : null}
          </label>
          <div className="input-with-add-vehicle-master">
            <select
              id="make"
              name="make"
              value={values?.make || ''}
              onChange={(e) => patch({ make: e.target.value, model: '' })}
              disabled={!categoryId || makesLoading}
              required={required}
            >
              <option value="">
                {!categoryId
                  ? 'Select vehicle category first'
                  : makesLoading
                    ? 'Loading makes...'
                    : 'Select make'}
              </option>
              {vehicleMakes.map((makeRow) => (
                <option key={makeRow.id} value={String(makeRow.id)}>
                  {makeRow.make}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-add-vehicle-master"
              onClick={() => openAdd('make')}
              title="Add make"
              disabled={!categoryId}
            >
              <FaPlus aria-hidden /> Add
            </button>
          </div>
        </div>
      </div>

      <div className={`form-row-vehicle-master form-row-vehicle-master--${prefix}`}>
        <div className={`form-group-vehicle-master form-group-${prefix}`}>
          <label htmlFor="model">
            Model{required ? <span className={requiredMarkClass}> *</span> : null}
          </label>
          <div className="input-with-add-vehicle-master">
            <select
              id="model"
              name="model"
              value={values?.model || ''}
              onChange={(e) => patch({ model: e.target.value })}
              disabled={!makeId || modelsLoading}
              required={required}
            >
              <option value="">
                {!makeId ? 'Select make first' : modelsLoading ? 'Loading models...' : 'Select model'}
              </option>
              {vehicleModels.map((modelRow) => (
                <option key={modelRow.id} value={String(modelRow.id)}>
                  {modelRow.model}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-add-vehicle-master"
              onClick={() => openAdd('model')}
              title="Add model"
              disabled={!makeId}
            >
              <FaPlus aria-hidden /> Add
            </button>
          </div>
        </div>
      </div>

      {addModal ? (
        <div className="vehicle-master-add-overlay" role="presentation" onClick={closeAdd}>
          <div
            className="vehicle-master-add-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-master-add-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="vehicle-master-add-title">{modalTitle}</h4>
            <input
              type="text"
              className="vehicle-master-add-input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Enter name"
              autoFocus
            />
            <div className="vehicle-master-add-actions">
              <button type="button" className="vehicle-master-add-cancel" onClick={closeAdd} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="vehicle-master-add-save" onClick={handleSaveAdd} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
