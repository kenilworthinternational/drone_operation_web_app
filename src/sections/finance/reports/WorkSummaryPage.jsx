import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EstateSprayedAreaReport from './EstateSprayedAreaReport';
import PlantationInvoiceHistory from './PlantationInvoiceHistory';
import PlantationInvoicePrint from './PlantationInvoicePrint';

const TABS = [
  { id: 'create', label: 'Create Work Summary / Invoice' },
  { id: 'history', label: 'Invoice History' },
];

export default function WorkSummaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const activeTab = searchParams.get('tab') === 'history' ? 'history' : 'create';

  const setTab = (tabId) => {
    const next = new URLSearchParams(searchParams);
    if (tabId === 'create') {
      next.delete('tab');
    } else {
      next.set('tab', tabId);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="work-summary-page">
      <div className="work-summary-tabs" role="tablist" aria-label="Work summary sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`work-summary-tab${activeTab === tab.id ? ' work-summary-tab--active' : ''}`}
            onClick={() => setTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="work-summary-tab-panel" role="tabpanel">
        {activeTab === 'create' ? (
          <EstateSprayedAreaReport onInvoicePreview={setPreviewInvoice} />
        ) : (
          <PlantationInvoiceHistory onInvoicePreview={setPreviewInvoice} />
        )}
      </div>

      {previewInvoice ? (
        <PlantationInvoicePrint
          invoice={previewInvoice}
          variant="preview"
          onClose={() => setPreviewInvoice(null)}
        />
      ) : null}
    </div>
  );
}
