import React from 'react';
import "../css/divisionView.css"; 

const DivisionView = ({ divisionName, fields, handleCheckboxChange }) => {
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
              onChange={(e) => handleCheckboxChange(field.field_id, field.field_area, e.target.checked)}
            />
            <label htmlFor={`field-${field.field_id}`}>{field.field_name}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DivisionView;
