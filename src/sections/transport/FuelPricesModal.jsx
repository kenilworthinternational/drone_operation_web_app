import React, { useEffect, useState } from 'react';
import FuelTypesMasterPanel from '../ict/masterData/FuelTypesMasterPanel';
import '../../styles/masterdata.css';

const FuelPricesModal = ({ open, onClose }) => {
  const [panelMessage, setPanelMessage] = useState(null);

  useEffect(() => {
    if (!open) setPanelMessage(null);
  }, [open]);

  if (!open) return null;

  return (
    <div className="quick-add-overlay-transport-hr" onClick={onClose} role="presentation">
      <div
        className="quick-add-modal-transport-hr quick-add-modal-transport-hr--wide fuel-prices-modal-transport-hr"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fuel-prices-modal-title"
      >
        <div className="quick-add-modal-toolbar-transport-hr">
          <div>
            <h3 id="fuel-prices-modal-title" className="quick-add-modal-title-transport-hr">
              Fuel Prices
            </h3>
            <p className="quick-add-modal-hint-transport-hr">
              Manage linked fuel types and prices. Adding new fuel types is done in ICT Master Data only.
            </p>
          </div>
          <button type="button" className="action-btn-secondary-transport-hr" onClick={onClose}>
            Close
          </button>
        </div>
        {panelMessage ? (
          <div
            className={`fuel-prices-modal-message-transport-hr fuel-prices-modal-message-transport-hr--${panelMessage.type}`}
            role="status"
          >
            {panelMessage.text}
          </div>
        ) : null}
        <div className="quick-add-modal-body-transport-hr fuel-prices-modal-body-transport-hr">
          <FuelTypesMasterPanel showAddButton={false} onMessage={setPanelMessage} />
        </div>
      </div>
    </div>
  );
};

export default FuelPricesModal;
