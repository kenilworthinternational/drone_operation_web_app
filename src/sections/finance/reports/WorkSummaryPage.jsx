import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EstateSprayedAreaReport from './EstateSprayedAreaReport';
import PlantationInvoiceHistory from './PlantationInvoiceHistory';
import WorkSummaryPdfHistory from './WorkSummaryPdfHistory';
import PlantationInvoicePrint from './PlantationInvoicePrint';
import WorkSummaryPdfDetailModal from './WorkSummaryPdfDetailModal';

const TABS = [
  { id: 'create', label: 'Create Work Summary / Invoice' },
  { id: 'history', label: 'Invoice History' },
  { id: 'work-summary-history', label: 'Work Summary History' },
];

export default function WorkSummaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [previewPdfDoc, setPreviewPdfDoc] = useState(null);

  const tabParam = searchParams.get('tab');
  const activeTab =
    tabParam === 'history' || tabParam === 'work-summary-history' || tabParam === 'pdf-history'
      ? tabParam === 'pdf-history'
        ? 'work-summary-history'
        : tabParam
      : 'create';

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
        ) : activeTab === 'history' ? (
          <PlantationInvoiceHistory onInvoicePreview={setPreviewInvoice} />
        ) : activeTab === 'work-summary-history' ? (
          <WorkSummaryPdfHistory onPdfPreview={setPreviewPdfDoc} />
        ) : null}
      </div>

      {previewInvoice ? (
        <PlantationInvoicePrint
          invoice={previewInvoice}
          variant="preview"
          onClose={() => setPreviewInvoice(null)}
        />
      ) : null}

      {previewPdfDoc ? (
        <WorkSummaryPdfDetailModal document={previewPdfDoc} onClose={() => setPreviewPdfDoc(null)} />
      ) : null}
    </div>
  );
}
