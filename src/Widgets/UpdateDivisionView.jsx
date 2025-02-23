import React, { useEffect, useState } from 'react';
import "../css/divisionView.css";
import { getUpdateMissionDetails } from '../Controller/api/api';

const UpdateDivisionView = ({ divisionName, fields, handleCheckboxChange, estateId, missionTypeId, cropTypeId, pickedDate }) => {
  const [state, setState] = useState({
    selectedFieldIds: [],
    totalExtent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissionDetails = async () => {
      try {
        const payload = {
          estateId,
          missionTypeId,
          cropTypeId,
          pickedDate: pickedDate.toLocaleDateString('en-CA')
        };

        const response = await getUpdateMissionDetails(payload);

        if (response && response.divisions) {
          const fieldIds = [];
          let totalArea = 0;

          response.divisions.forEach((division) => {
            division.checkedFields.forEach((field) => {
              fieldIds.push(field.field_id);
              totalArea += field.field_area;
            });
          });

          setState({
            selectedFieldIds: fieldIds,
            totalExtent: parseFloat(totalArea.toFixed(2))
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching update mission details:', error);
        setLoading(false);
      }
    };

    fetchMissionDetails();
  }, [estateId, missionTypeId, cropTypeId, pickedDate]);

  const handleCheckboxChangeWrapper = (fieldId, fieldArea, isChecked) => {
    // Only call handleCheckboxChange after updating the local state
    setState((prevState) => {
      const updatedFieldIds = new Set(prevState.selectedFieldIds);

      const area = parseFloat(fieldArea);
      if (isNaN(area)) {
        console.error("Invalid field area:", fieldArea);
        return prevState;
      }

      if (isChecked) {
        updatedFieldIds.add(fieldId);
      } else {
        updatedFieldIds.delete(fieldId);
      }

      // Return the updated state without updating the totalExtent
      return {
        selectedFieldIds: Array.from(updatedFieldIds),
        totalExtent: prevState.totalExtent
      };
    });

    // Now call the parent function asynchronously, outside of render
    setTimeout(() => {
      handleCheckboxChange(fieldId, fieldArea, isChecked);
    }, 0);
  };

  if (loading) {
    return <div>Loading fields...</div>;
  }

  return (
    <div className="division-box">
      <h3>{divisionName}</h3>
      <hr />
      <div className="division-grid">
        {fields.map((field) => (
          <div key={field.field_id} className="field-checkbox">
            <input
              type="checkbox"
              id={`field-${field.field_id}`}
              checked={state.selectedFieldIds.includes(field.field_id)}
              onChange={(e) => handleCheckboxChangeWrapper(field.field_id, field.field_area, e.target.checked)}
            />
            <label htmlFor={`field-${field.field_id}`}>{field.field_name}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdateDivisionView;
