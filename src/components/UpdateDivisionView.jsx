import React, { useState, useEffect } from 'react';

const UpdateDivisionView = ({ 
  divisionName, 
  fields, 
  handleCheckboxChange, 
  divisionTotal, 
  estateId, 
  missionTypeId, 
  cropTypeId, 
  pickedDate, 
  selectedFieldsSet
}) => {
  const [state, setState] = useState({
    selectedFieldIds: Array.from(selectedFieldsSet || []), // Convert to array
    totalExtent: divisionTotal || 0,
  });

  const handleCheckboxChangeWrapper = (fieldId, field, isChecked) => {
    const updatedFieldIds = new Set(state.selectedFieldIds);
    let updatedDivExtent = state.totalExtent;

    if (isChecked) {
      updatedFieldIds.add(fieldId);
      updatedDivExtent += field.field_area;
    } else {
      updatedFieldIds.delete(fieldId);
      updatedDivExtent -= field.field_area;
    }

    setState({
      selectedFieldIds: Array.from(updatedFieldIds),
      totalExtent: parseFloat(updatedDivExtent.toFixed(2)),
    });

    setTimeout(() => {
      handleCheckboxChange(fieldId); // Passing to parent
    }, 0);
  };

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      selectedFieldIds: Array.from(selectedFieldsSet || []),
    }));
  }, [selectedFieldsSet]);

  return (
    <div className="update-division-view">
      <h3>{divisionName}</h3>
      <div className="fields-list">
        {fields && fields.map((field) => {
          const isChecked = state.selectedFieldIds.includes(field.field_id);
          return (
            <div key={field.field_id} className="field-item">
              <input 
                type="checkbox" 
                checked={isChecked} 
                onChange={() => handleCheckboxChangeWrapper(field.field_id, field, !isChecked)} 
              />
              <label>{field.field_name} - {field.field_area} ha</label>
            </div>
          );
        })}
      </div>
      <div className="division-total">
        <strong>Total Area: </strong>{state.totalExtent} ha
      </div>
    </div>
  );
};

export default UpdateDivisionView;
