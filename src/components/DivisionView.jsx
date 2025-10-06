import React from 'react';
import { LineWave } from 'react-loader-spinner';
import '../styles/divisionView.css';
import { format } from 'date-fns';

const DivisionView = ({
  divisionName,
  fields,
  handleCheckboxChange,
  fetchedFields,
  selectedFields,
  loading,
  showAddHoc,
  calendarData,
  selectedDate,
  selectedMissionType
}) => {
  // Calculate the sum of field areas for checked fields in this division
  const divisionSum = fields
    .filter((field) => selectedFields.has(field.field_id))
    .reduce((sum, field) => sum + field.field_area, 0)
    .toFixed(2); // Ensure two decimal places

  // Calculate the total area of all fields in this division
  const divisionTotal = fields
    .reduce((sum, field) => sum + field.field_area, 0)
    .toFixed(2); // Ensure two decimal places

  console.log("#################",fetchedFields)
  
  return (
    <div className="division-box-new">
      <h3>{divisionName} - ({divisionSum}Ha/{divisionTotal}Ha)</h3>
      <hr />
      
      {loading ? (
        <div className="loading-container">
          <LineWave
            height="100"
            width="100"
            color="#4C74AFFF"
            ariaLabel="triangle-loading"
            wrapperStyle={{}}
            visible={true}
          />
        </div>
      ) : (
        <div className="division-grid-view">
          {fields.map((field) => {
            let isChecked = selectedFields.has(field.field_id);
            let isDisabled = fetchedFields.includes(field.field_id);
            // Determine restriction based on selected mission type
            const missionTypeLabel = selectedMissionType?.group?.toString().toLowerCase() || selectedMissionType?.id?.toString().toLowerCase() || '';
            const isSpray = missionTypeLabel.includes('spray');
            const isSpread = missionTypeLabel.includes('spread');
            
            // Only apply restrictions based on the selected mission type
            let isRestricted = false;
            let restrictionReason = '';
            
            if (isSpray) {
              // Only check can_spray when mission type is spray
              isRestricted = Number(field.can_spray) === 1;
              restrictionReason = isRestricted ? (field.can_spray_text || 'Cannot spray') : '';
            } else if (isSpread) {
              // Only check can_spread when mission type is spread
              isRestricted = Number(field.can_spread) === 1;
              restrictionReason = isRestricted ? (field.can_spread_text || 'Cannot spread') : '';
            }
            if (showAddHoc) {
              isChecked = selectedFields.has(field.field_id); // Reflect user selection
              isDisabled = false; // Start with enabled checkboxes
              // Check if the field is already scheduled on the selected date for the same mission type
              if (selectedDate && calendarData && selectedMissionType) {
                const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
                const isFieldScheduledOnDate = calendarData.some(
                  (entry) =>
                    entry.date === formattedSelectedDate &&
                    entry.fieldIds.includes(field.field_id)
                );
                // Disable if the field is already scheduled on the selected date for the same mission type
                if (isFieldScheduledOnDate) {
                  isDisabled = true;
                }
              }
            } else {
              // Existing logic for non-Ad-Hoc plans (unchanged)
              isChecked = selectedFields.has(field.field_id) || fetchedFields.includes(field.field_id);
              isDisabled = fetchedFields.includes(field.field_id);
            }
            // Add conditional class for disabled fields in Ad-Hoc mode
            const checkboxClass = `field-checkbox-new ${showAddHoc && isDisabled ? 'disabled-adhoc' : ''} ${isRestricted ? 'restricted-field' : ''}`;
            return (
              <div key={field.field_id} className={checkboxClass} title={isRestricted ? restrictionReason : undefined}>
                <input
                  type="checkbox"
                  id={`field-${field.field_id}`}
                  onChange={(e) => handleCheckboxChange(field.field_id, field.field_area, e.target.checked)}
                  checked={isChecked}
                  disabled={isDisabled}
                />
                <label htmlFor={`field-${field.field_id}`}>
                  {field.field_name} - {field.field_area}Ha
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DivisionView;