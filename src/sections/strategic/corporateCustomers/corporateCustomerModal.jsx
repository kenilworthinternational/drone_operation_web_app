import React from 'react';
import { FaTimes, FaBuilding } from 'react-icons/fa';

export function formatRate(v) {
  if (v == null || v === '') return '—';
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 4 }) : String(v);
}

function PlantationBanner({ row }) {
  const name = row.plantation || row.name || '—';
  const group = row.group_name || row.group;
  return (
    <div className="cc-plantation-banner">
      <div className="cc-plantation-banner__icon" aria-hidden>
        <FaBuilding />
      </div>
      <div className="cc-plantation-banner__text">
        <span className="cc-plantation-banner__label">Plantation</span>
        <span className="cc-plantation-banner__name">{name}</span>
        {group ? <span className="cc-plantation-banner__group">Group: {group}</span> : null}
      </div>
      <span className="cc-plantation-banner__badge">Name cannot be changed</span>
    </div>
  );
}

function DetailField({ fieldKey, label, hint, type, readOnly, dataSource, formState, onChange }) {
  const id = `cc-field-${fieldKey}`;
  return (
    <div className={`cc-field ${type === 'textarea' ? 'cc-field--full' : ''}`}>
      <label className="cc-label" htmlFor={readOnly ? undefined : id}>
        {label}
      </label>
      {hint ? <p className="cc-field-hint">{hint}</p> : null}
      {readOnly ? (
        <div className="cc-readonly" id={id}>
          {type === 'number' ? formatRate(dataSource[fieldKey]) : dataSource[fieldKey] || '—'}
        </div>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          className="cc-input cc-textarea"
          rows={3}
          value={formState[fieldKey]}
          onChange={(e) => onChange(fieldKey, e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="cc-input"
          type={type}
          step={type === 'number' ? 'any' : undefined}
          value={formState[fieldKey]}
          onChange={(e) => onChange(fieldKey, e.target.value)}
        />
      )}
    </div>
  );
}

const FORM_SECTIONS = [
  {
    id: 'spray',
    title: 'Spray (spy)',
    description: 'Billing and chemical limits for spray missions.',
    gridClass: '',
    fields: [
      { key: 'spray_rate', label: 'Rate', hint: 'Service billing rate.', type: 'number' },
      { key: 'spray_units', label: 'Units (kg / Ha)', hint: 'Standard kg applied per 1 Ha.', type: 'text' },
      {
        key: 'spray_max_chemical',
        label: 'Max chemical (kg / Ha)',
        hint: 'Max total kg of all chemicals per 1 Ha.',
        type: 'number',
      },
    ],
  },
  {
    id: 'spread',
    title: 'Spread (spd)',
    description: 'Billing rates for spread missions (no max chemical limit).',
    gridClass: 'cc-section-grid--pair',
    fields: [
      { key: 'spread_rate', label: 'Rate', hint: 'Service billing rate.', type: 'number' },
      { key: 'spread_units', label: 'Units (kg / Ha)', hint: 'Standard kg applied per 1 Ha.', type: 'text' },
    ],
  },
  {
    id: 'scout',
    title: 'Scout',
    description: null,
    gridClass: 'cc-section-grid--single',
    fields: [{ key: 'scout_rate', label: 'Scout rate', hint: 'Scout service billing rate.', type: 'number' }],
  },
  {
    id: 'addresses',
    title: 'Addresses',
    description: 'Used for billing and shipping documents.',
    gridClass: 'cc-section-grid--stack',
    fields: [
      { key: 'address', label: 'Main address', hint: null, type: 'textarea' },
      { key: 'bill_to_address', label: 'Bill-to', hint: null, type: 'textarea' },
      { key: 'ship_to_address', label: 'Ship-to', hint: null, type: 'textarea' },
    ],
  },
];

function DetailFormSections({ readOnly, dataSource, formState, onChange }) {
  return (
    <div className="cc-form-sections">
      {FORM_SECTIONS.map((section) => (
        <section key={section.id} className="cc-section" aria-labelledby={`cc-section-${section.id}`}>
          <div className="cc-section-head">
            <h3 id={`cc-section-${section.id}`} className="cc-section-title">
              {section.title}
            </h3>
            {section.description ? <p className="cc-section-desc">{section.description}</p> : null}
          </div>
          <div className={`cc-section-grid ${section.gridClass}`.trim()}>
            {section.fields.map((f) => (
              <DetailField
                key={f.key}
                fieldKey={f.key}
                label={f.label}
                hint={f.hint}
                type={f.type}
                readOnly={readOnly}
                dataSource={dataSource}
                formState={formState}
                onChange={onChange}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CustomerDetailsModal({
  title,
  titleId,
  subtitle,
  row,
  readOnly,
  formState,
  onChange,
  onClose,
  footer,
  formProps,
}) {
  const content = (
    <>
      <div className="cc-modal-head">
        <div>
          <h2 id={titleId}>{title}</h2>
          {subtitle ? <p className="cc-modal-subtitle">{subtitle}</p> : null}
        </div>
        <button type="button" className="cc-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
      </div>
      <div className="cc-modal-body">
        <PlantationBanner row={row} />
        <DetailFormSections
          readOnly={readOnly}
          dataSource={row}
          formState={formState}
          onChange={onChange}
        />
      </div>
      <div className="cc-modal-foot">{footer}</div>
    </>
  );

  return (
    <div className="cc-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="cc-modal cc-modal--details"
        role="dialog"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        {formProps ? <form {...formProps}>{content}</form> : content}
      </div>
    </div>
  );
}
