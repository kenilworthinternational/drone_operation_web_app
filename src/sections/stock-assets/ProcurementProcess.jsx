import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/procurementProcessNew.css';
import {
  useCreateGrnMutation,
  useCreateProcurementRequestMutation,
  useCreatePurchaseOrderMutation,
  useCreateRfqMutation,
  useCreateSupplierQuotationMutation,
  useFinalizeQuotationMutation,
  useGetApprovedProcureQueueQuery,
  useGetGrnsQuery,
  useGetInventoryItemsQuery,
  useGetNeedToProcureQueueQuery,
  useGetPendingQuotationsQueueQuery,
  useGetProcurementRequestQuery,
  useGetProcurementRequestsQuery,
  useGetPurchaseOrderQuery,
  useGetPurchaseOrdersQuery,
  useGetRfqsQuery,
  useGetSupplierQuotationsQuery,
  useGetSuppliersQuery,
  useSaveQuotationEvaluationMutation,
  useSaveTechnicalEvaluationMutation,
  useUpdateProcurementRequestStatusMutation,
} from '../../api/services NodeJs/allEndpoints';

const TABS = [
  { key: 'requests', label: 'Procurement Requests', path: '/home/stock-assets/procurement-process/requests' },
  { key: 'approved', label: 'Approved Procure Queue', path: '/home/stock-assets/procurement-process/approved-queue' },
  { key: 'rfq', label: 'Request Quotations', path: '/home/stock-assets/procurement-process/request-quotations' },
  { key: 'pending', label: 'Pending Quotations Queue', path: '/home/stock-assets/procurement-process/pending-quotations' },
  { key: 'eval', label: 'Quotations Evaluation', path: '/home/stock-assets/procurement-process/quotations-evaluation' },
  { key: 'tech', label: 'Tech Evaluation', path: '/home/stock-assets/procurement-process/tech-evaluation' },
  { key: 'finalize', label: 'Finalize Quotations', path: '/home/stock-assets/procurement-process/finalize-quotations' },
  { key: 'po', label: 'Purchasing Order Issue', path: '/home/stock-assets/procurement-process/purchase-order-issue' },
  { key: 'grn', label: 'Good Received Note', path: '/home/stock-assets/procurement-process/grn' },
];

const detectTabFromPath = (path) => {
  if (path.includes('/approved-queue')) return 'approved';
  if (path.includes('/request-quotations')) return 'rfq';
  if (path.includes('/pending-quotations')) return 'pending';
  if (path.includes('/quotations-evaluation')) return 'eval';
  if (path.includes('/tech-evaluation')) return 'tech';
  if (path.includes('/finalize-quotations')) return 'finalize';
  if (path.includes('/purchase-order-issue')) return 'po';
  if (path.includes('/grn')) return 'grn';
  return 'requests';
};

const ProcurementProcess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(detectTabFromPath(location.pathname));
  const [isManualRequestModalOpen, setIsManualRequestModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({ inventory_item_id: '', quantity: '', notes: '' });
  const [selectedNeedToProcure, setSelectedNeedToProcure] = useState({});
  const [selectedSuppliers, setSelectedSuppliers] = useState({});
  const [rfqForm, setRfqForm] = useState({ procurement_request_id: '', closing_date: '', closing_time: '' });
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [quotationForm, setQuotationForm] = useState({ supplier_id: '', unit_price: '', total_price: '', delivery_time_days: '' });
  const [evaluationForm, setEvaluationForm] = useState({ quotation_id: '', score: '', comments: '' });
  const [techForm, setTechForm] = useState({ quotation_id: '', status: 'pending', comments: '' });
  const [finalizeQuotationId, setFinalizeQuotationId] = useState('');
  const [poForm, setPoForm] = useState({ procurement_request_id: '', quotation_id: '', supplier_id: '' });
  const [selectedPoId, setSelectedPoId] = useState('');
  const [grnItemMap, setGrnItemMap] = useState({});

  const { data: procurementRequests = [], refetch: refetchProcurementRequests } = useGetProcurementRequestsQuery({});
  const { data: approvedQueue = [] } = useGetApprovedProcureQueueQuery({});
  const { data: rfqs = [], refetch: refetchRfqs } = useGetRfqsQuery({});
  const { data: pendingQueue = [] } = useGetPendingQuotationsQueueQuery({});
  const { data: quotations = [], refetch: refetchQuotations } = useGetSupplierQuotationsQuery(
    selectedRfqId ? { rfq_id: selectedRfqId } : {},
    { skip: !selectedRfqId }
  );
  const { data: needToProcureQueue = [], refetch: refetchNeedQueue } = useGetNeedToProcureQueueQuery({});
  const { data: suppliers = [] } = useGetSuppliersQuery({});
  const { data: inventoryItems = [] } = useGetInventoryItemsQuery({});
  const { data: purchaseOrders = [], refetch: refetchPurchaseOrders } = useGetPurchaseOrdersQuery({});
  const { data: selectedPurchaseOrder } = useGetPurchaseOrderQuery(selectedPoId, { skip: !selectedPoId });
  const { data: grns = [], refetch: refetchGrns } = useGetGrnsQuery({});
  const { data: selectedProcurementRequest } = useGetProcurementRequestQuery(poForm.procurement_request_id, {
    skip: !poForm.procurement_request_id,
  });

  const [createProcurementRequest, { isLoading: creatingProcRequest }] = useCreateProcurementRequestMutation();
  const [updateProcurementRequestStatus] = useUpdateProcurementRequestStatusMutation();
  const [createRfq, { isLoading: creatingRfq }] = useCreateRfqMutation();
  const [createSupplierQuotation, { isLoading: creatingQuotation }] = useCreateSupplierQuotationMutation();
  const [saveQuotationEvaluation] = useSaveQuotationEvaluationMutation();
  const [saveTechnicalEvaluation] = useSaveTechnicalEvaluationMutation();
  const [finalizeQuotation] = useFinalizeQuotationMutation();
  const [createPurchaseOrder, { isLoading: creatingPo }] = useCreatePurchaseOrderMutation();
  const [createGrn, { isLoading: creatingGrn }] = useCreateGrnMutation();

  React.useEffect(() => {
    setActiveTab(detectTabFromPath(location.pathname));
  }, [location.pathname]);

  const selectedNeedIds = useMemo(
    () => Object.keys(selectedNeedToProcure).filter((id) => selectedNeedToProcure[id]).map(Number),
    [selectedNeedToProcure]
  );

  const selectedSupplierIds = useMemo(
    () => Object.keys(selectedSuppliers).filter((id) => selectedSuppliers[id]).map(Number),
    [selectedSuppliers]
  );
  const selectedSupplierOptionValues = useMemo(
    () => Object.keys(selectedSuppliers).filter((id) => selectedSuppliers[id]),
    [selectedSuppliers]
  );

  const supplierList = useMemo(() => {
    if (Array.isArray(suppliers)) return suppliers;
    if (Array.isArray(suppliers?.suppliers)) return suppliers.suppliers;
    if (Array.isArray(suppliers?.data)) return suppliers.data;
    return [];
  }, [suppliers]);

  const pendingProcurementRequests = useMemo(
    () => procurementRequests.filter((row) => String(row.status || '').toLowerCase() === 'pending'),
    [procurementRequests]
  );

  const handleCreateManualProcurement = async (e) => {
    e.preventDefault();
    if (!manualForm.inventory_item_id || !manualForm.quantity) {
      alert('Item and quantity are required');
      return;
    }
    try {
      await createProcurementRequest({
        notes: manualForm.notes,
        items: [{
          inventory_item_id: Number(manualForm.inventory_item_id),
          quantity: Number(manualForm.quantity),
        }],
      }).unwrap();
      setManualForm({ inventory_item_id: '', quantity: '', notes: '' });
      setIsManualRequestModalOpen(false);
      refetchProcurementRequests();
      alert('Procurement request created');
    } catch (error) {
      alert(error?.data?.message || 'Failed to create procurement request');
    }
  };

  const handleCreateFromQueue = async () => {
    if (!selectedNeedIds.length) {
      alert('Select at least one need-to-procure record');
      return;
    }
    try {
      await createProcurementRequest({
        need_to_procure_ids: selectedNeedIds,
      }).unwrap();
      setSelectedNeedToProcure({});
      refetchProcurementRequests();
      refetchNeedQueue();
      alert('Queue items converted to procurement request');
    } catch (error) {
      alert(error?.data?.message || 'Failed to convert queue items');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateProcurementRequestStatus({ id, status }).unwrap();
      refetchProcurementRequests();
    } catch (error) {
      alert(error?.data?.message || 'Failed to update status');
    }
  };

  const handleCreateRfq = async () => {
    if (!rfqForm.procurement_request_id || !selectedSupplierIds.length) {
      alert('Select procurement request and suppliers');
      return;
    }
    try {
      await createRfq({
        procurement_request_id: Number(rfqForm.procurement_request_id),
        closing_date: rfqForm.closing_date || null,
        closing_time: rfqForm.closing_time || null,
        supplier_ids: selectedSupplierIds,
      }).unwrap();
      setSelectedSuppliers({});
      setRfqForm({ procurement_request_id: '', closing_date: '', closing_time: '' });
      refetchRfqs();
      refetchProcurementRequests();
      alert('RFQ created');
    } catch (error) {
      alert(error?.data?.message || 'Failed to create RFQ');
    }
  };

  const handleCreateQuotation = async () => {
    if (!selectedRfqId || !quotationForm.supplier_id || !quotationForm.total_price) {
      alert('RFQ, supplier and price are required');
      return;
    }
    try {
      await createSupplierQuotation({
        rfq_id: Number(selectedRfqId),
        supplier_id: Number(quotationForm.supplier_id),
        unit_price: Number(quotationForm.unit_price || 0),
        total_price: Number(quotationForm.total_price),
        delivery_time_days: quotationForm.delivery_time_days ? Number(quotationForm.delivery_time_days) : null,
      }).unwrap();
      setQuotationForm({ supplier_id: '', unit_price: '', total_price: '', delivery_time_days: '' });
      refetchQuotations();
      alert('Quotation saved');
    } catch (error) {
      alert(error?.data?.message || 'Failed to save quotation');
    }
  };

  const handleSaveEvaluation = async () => {
    if (!selectedRfqId || !evaluationForm.quotation_id) {
      alert('Select quotation');
      return;
    }
    try {
      await saveQuotationEvaluation({
        rfq_id: Number(selectedRfqId),
        quotation_id: Number(evaluationForm.quotation_id),
        score: evaluationForm.score ? Number(evaluationForm.score) : null,
        comments: evaluationForm.comments,
      }).unwrap();
      alert('Commercial evaluation saved');
    } catch (error) {
      alert(error?.data?.message || 'Failed to save evaluation');
    }
  };

  const handleSaveTechEvaluation = async () => {
    if (!selectedRfqId || !techForm.quotation_id) {
      alert('Select quotation');
      return;
    }
    try {
      await saveTechnicalEvaluation({
        rfq_id: Number(selectedRfqId),
        quotation_id: Number(techForm.quotation_id),
        status: techForm.status,
        comments: techForm.comments,
      }).unwrap();
      alert('Technical evaluation saved');
    } catch (error) {
      alert(error?.data?.message || 'Failed to save technical evaluation');
    }
  };

  const handleFinalize = async () => {
    if (!selectedRfqId || !finalizeQuotationId) {
      alert('Select RFQ and quotation');
      return;
    }
    try {
      await finalizeQuotation({
        rfq_id: Number(selectedRfqId),
        quotation_id: Number(finalizeQuotationId),
      }).unwrap();
      refetchRfqs();
      refetchProcurementRequests();
      alert('Quotation finalized');
    } catch (error) {
      alert(error?.data?.message || 'Failed to finalize quotation');
    }
  };

  const handleCreatePo = async () => {
    if (!poForm.procurement_request_id || !poForm.supplier_id) {
      alert('Procurement request and supplier are required');
      return;
    }
    try {
      await createPurchaseOrder({
        procurement_request_id: Number(poForm.procurement_request_id),
        quotation_id: poForm.quotation_id ? Number(poForm.quotation_id) : null,
        supplier_id: Number(poForm.supplier_id),
      }).unwrap();
      setPoForm({ procurement_request_id: '', quotation_id: '', supplier_id: '' });
      refetchPurchaseOrders();
      refetchProcurementRequests();
      alert('Purchase order created');
    } catch (error) {
      alert(error?.data?.message || 'Failed to create PO');
    }
  };

  const handleCreateGrn = async () => {
    if (!selectedPoId || !selectedPurchaseOrder?.items?.length) {
      alert('Select PO first');
      return;
    }
    const items = selectedPurchaseOrder.items
      .map((item) => ({
        po_item_id: item.id,
        received_qty: Number(grnItemMap[item.id]?.received_qty || 0),
        rejected_qty: Number(grnItemMap[item.id]?.rejected_qty || 0),
        damaged_qty: Number(grnItemMap[item.id]?.damaged_qty || 0),
      }))
      .filter((x) => x.received_qty > 0);
    if (!items.length) {
      alert('Enter at least one received quantity');
      return;
    }
    try {
      await createGrn({ po_id: Number(selectedPoId), items }).unwrap();
      setGrnItemMap({});
      refetchGrns();
      refetchPurchaseOrders();
      alert('GRN posted');
    } catch (error) {
      alert(error?.data?.message || 'Failed to create GRN');
    }
  };

  return (
    <div className="procurement-process-page">
      <div className="procurement-process-header-row">
        <h2 className="procurement-process-title">Procurement Process</h2>
        {activeTab === 'requests' && (
          <button
            type="button"
            className="procurement-process-manual-btn"
            onClick={() => setIsManualRequestModalOpen(true)}
          >
            Manual Request
          </button>
        )}
      </div>
      <div className="procurement-process-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              navigate(tab.path);
            }}
            className={`procurement-process-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'requests' && (
        <div className="procurement-process-section-grid">
          <div>
            <div className="procurement-process-heading-row">
              <h4>Convert Need-To-Procure to Procurement Request</h4>
              <div className="procurement-process-heading-actions">
                <button
                  type="button"
                  className="procurement-process-queue-btn"
                  onClick={handleCreateFromQueue}
                >
                  Create Procurement
                </button>
              </div>
            </div>
            <table width="100%" cellPadding="6">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Request</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {needToProcureQueue.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={Boolean(selectedNeedToProcure[row.id])}
                        onChange={(e) => setSelectedNeedToProcure((prev) => ({ ...prev, [row.id]: e.target.checked }))}
                      />
                    </td>
                    <td>{row.request_no}</td>
                    <td>{row.item_name}</td>
                    <td>{row.quantity}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h4>Procurement Requests</h4>
            <table width="100%" cellPadding="6">
              <thead>
                <tr>
                  <th>Procurement No</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total Qty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingProcurementRequests.map((row) => (
                  <tr key={row.id}>
                    <td>{row.procurement_no}</td>
                    <td>{row.source_type || 'manual'}</td>
                    <td>{row.status}</td>
                    <td>{row.item_count}</td>
                    <td>{row.total_qty}</td>
                    <td>
                      <button type="button" onClick={() => handleStatusUpdate(row.id, 'approved')}>Approve</button>{' '}
                      <button type="button" onClick={() => handleStatusUpdate(row.id, 'rejected')}>Reject</button>
                    </td>
                  </tr>
                ))}
                {!pendingProcurementRequests.length && (
                  <tr>
                    <td colSpan={6}>No pending procurement requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'requests' && isManualRequestModalOpen && (
        <div
          className="procurement-process-modal-overlay"
          onClick={() => setIsManualRequestModalOpen(false)}
        >
          <div
            className="procurement-process-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="procurement-process-modal-header">
              <h4 className="procurement-process-modal-title">Manual Procurement Request</h4>
              <button
                type="button"
                className="procurement-process-modal-close-btn"
                onClick={() => setIsManualRequestModalOpen(false)}
                aria-label="Close manual procurement request popup"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateManualProcurement} className="procurement-process-form">
              <select
                value={manualForm.inventory_item_id}
                onChange={(e) => setManualForm((prev) => ({ ...prev, inventory_item_id: e.target.value }))}
                required
              >
                <option value="">Select Item</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_code} - {item.item_name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={manualForm.quantity}
                onChange={(e) => setManualForm((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="Quantity"
                required
              />
              <textarea
                rows={2}
                value={manualForm.notes}
                onChange={(e) => setManualForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes"
              />
              <div className="procurement-process-modal-actions">
                <button
                  type="button"
                  className="procurement-process-modal-cancel-btn"
                  onClick={() => setIsManualRequestModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creatingProcRequest}>
                  {creatingProcRequest ? 'Creating...' : 'Create Manual Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'approved' && (
        <div>
          <h4>Approved Procure Queue</h4>
          <table width="100%" cellPadding="6">
            <thead>
              <tr>
                <th>Procurement No</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total Qty</th>
              </tr>
            </thead>
            <tbody>
              {approvedQueue.map((row) => (
                <tr key={row.id}>
                  <td>{row.procurement_no}</td>
                  <td>{row.status}</td>
                  <td>{row.item_count}</td>
                  <td>{row.total_qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'rfq' && (
        <div className="procurement-process-stack-md">
          <h4>Request Quotations</h4>
          <select
            value={rfqForm.procurement_request_id}
            onChange={(e) => setRfqForm((prev) => ({ ...prev, procurement_request_id: e.target.value }))}
          >
            <option value="">Select Approved Procurement</option>
            {approvedQueue.map((row) => (
              <option key={row.id} value={row.id}>
                {row.procurement_no}
              </option>
            ))}
          </select>
          <div className="procurement-process-row-two">
            <input
              type="date"
              value={rfqForm.closing_date}
              onChange={(e) => setRfqForm((prev) => ({ ...prev, closing_date: e.target.value }))}
            />
            <input
              type="time"
              value={rfqForm.closing_time}
              onChange={(e) => setRfqForm((prev) => ({ ...prev, closing_time: e.target.value }))}
            />
          </div>
          <div className="procurement-process-panel">
            <strong>Select Suppliers</strong>
            <select
              multiple
              size={Math.min(8, Math.max(4, supplierList.length || 4))}
              value={selectedSupplierOptionValues}
              onChange={(e) => {
                const nextMap = {};
                Array.from(e.target.selectedOptions).forEach((opt) => {
                  nextMap[opt.value] = true;
                });
                setSelectedSuppliers(nextMap);
              }}
            >
              {supplierList.map((sup) => (
                <option key={sup.id} value={String(sup.id)}>
                  {sup.supplier_name}
                </option>
              ))}
            </select>
            {!supplierList.length && <div>No suppliers found</div>}
          </div>
          <button type="button" disabled={creatingRfq} onClick={handleCreateRfq}>
            {creatingRfq ? 'Creating RFQ...' : 'Create RFQ'}
          </button>
          <hr />
          <h4>Submit Supplier Quotation (Demo Input)</h4>
          <select value={selectedRfqId} onChange={(e) => setSelectedRfqId(e.target.value)}>
            <option value="">Select RFQ</option>
            {rfqs.map((rfq) => (
              <option key={rfq.id} value={rfq.id}>{rfq.rfq_no}</option>
            ))}
          </select>
          <select
            value={quotationForm.supplier_id}
            onChange={(e) => setQuotationForm((prev) => ({ ...prev, supplier_id: e.target.value }))}
          >
            <option value="">Select Supplier</option>
            {supplierList.map((s) => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
          </select>
          <div className="procurement-process-row-three">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Unit Price"
              value={quotationForm.unit_price}
              onChange={(e) => setQuotationForm((prev) => ({ ...prev, unit_price: e.target.value }))}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Total Price"
              value={quotationForm.total_price}
              onChange={(e) => setQuotationForm((prev) => ({ ...prev, total_price: e.target.value }))}
            />
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Delivery Days"
              value={quotationForm.delivery_time_days}
              onChange={(e) => setQuotationForm((prev) => ({ ...prev, delivery_time_days: e.target.value }))}
            />
          </div>
          <button type="button" disabled={creatingQuotation} onClick={handleCreateQuotation}>
            {creatingQuotation ? 'Saving Quotation...' : 'Save Quotation'}
          </button>
        </div>
      )}

      {activeTab === 'pending' && (
        <div>
          <h4>Pending Quotations Queue</h4>
          <table width="100%" cellPadding="6">
            <thead>
              <tr>
                <th>RFQ</th>
                <th>Procurement</th>
                <th>Closing</th>
                <th>Requested</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingQueue.map((row) => (
                <tr key={row.id}>
                  <td>{row.rfq_no}</td>
                  <td>{row.procurement_no}</td>
                  <td>{row.closing_date} {row.closing_time || ''}</td>
                  <td>{row.suppliers_requested}</td>
                  <td>{row.quotations_received}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(activeTab === 'eval' || activeTab === 'tech' || activeTab === 'finalize') && (
        <div className="procurement-process-stack-md">
          <select value={selectedRfqId} onChange={(e) => setSelectedRfqId(e.target.value)}>
            <option value="">Select RFQ</option>
            {rfqs.map((rfq) => (
              <option key={rfq.id} value={rfq.id}>{rfq.rfq_no} ({rfq.status})</option>
            ))}
          </select>
          <table width="100%" cellPadding="6">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier</th>
                <th>Quotation No</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.supplier_name}</td>
                  <td>{q.quotation_no}</td>
                  <td>{q.unit_price}</td>
                  <td>{q.total_price}</td>
                  <td>{q.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'eval' && (
        <div className="procurement-process-stack-sm procurement-process-mt">
          <h4>Commercial Evaluation</h4>
          <select
            value={evaluationForm.quotation_id}
            onChange={(e) => setEvaluationForm((prev) => ({ ...prev, quotation_id: e.target.value }))}
          >
            <option value="">Select Quotation</option>
            {quotations.map((q) => <option key={q.id} value={q.id}>{q.quotation_no} - {q.supplier_name}</option>)}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Score"
            value={evaluationForm.score}
            onChange={(e) => setEvaluationForm((prev) => ({ ...prev, score: e.target.value }))}
          />
          <textarea
            rows={2}
            placeholder="Comments"
            value={evaluationForm.comments}
            onChange={(e) => setEvaluationForm((prev) => ({ ...prev, comments: e.target.value }))}
          />
          <button type="button" onClick={handleSaveEvaluation}>Save Evaluation</button>
        </div>
      )}

      {activeTab === 'tech' && (
        <div className="procurement-process-stack-sm procurement-process-mt">
          <h4>Technical Evaluation</h4>
          <select
            value={techForm.quotation_id}
            onChange={(e) => setTechForm((prev) => ({ ...prev, quotation_id: e.target.value }))}
          >
            <option value="">Select Quotation</option>
            {quotations.map((q) => <option key={q.id} value={q.id}>{q.quotation_no} - {q.supplier_name}</option>)}
          </select>
          <select value={techForm.status} onChange={(e) => setTechForm((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="pending">Pending</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>
          <textarea
            rows={2}
            placeholder="Comments"
            value={techForm.comments}
            onChange={(e) => setTechForm((prev) => ({ ...prev, comments: e.target.value }))}
          />
          <button type="button" onClick={handleSaveTechEvaluation}>Save Tech Evaluation</button>
        </div>
      )}

      {activeTab === 'finalize' && (
        <div className="procurement-process-stack-sm procurement-process-mt">
          <h4>Finalize Quotations</h4>
          <select value={finalizeQuotationId} onChange={(e) => setFinalizeQuotationId(e.target.value)}>
            <option value="">Select Winning Quotation</option>
            {quotations.map((q) => <option key={q.id} value={q.id}>{q.quotation_no} - {q.supplier_name}</option>)}
          </select>
          <button type="button" onClick={handleFinalize}>Finalize Selected Quotation</button>
        </div>
      )}

      {activeTab === 'po' && (
        <div className="procurement-process-stack-md">
          <h4>Purchasing Order Issue</h4>
          <select
            value={poForm.procurement_request_id}
            onChange={(e) => setPoForm((prev) => ({ ...prev, procurement_request_id: e.target.value }))}
          >
            <option value="">Select Procurement Request</option>
            {procurementRequests.filter((x) => ['finalized', 'approved', 'rfq'].includes(x.status)).map((row) => (
              <option key={row.id} value={row.id}>{row.procurement_no} ({row.status})</option>
            ))}
          </select>
          <select
            value={poForm.quotation_id}
            onChange={(e) => setPoForm((prev) => ({ ...prev, quotation_id: e.target.value }))}
          >
            <option value="">Select Quotation (optional)</option>
            {quotations.map((q) => <option key={q.id} value={q.id}>{q.quotation_no} - {q.supplier_name}</option>)}
          </select>
          <select
            value={poForm.supplier_id}
            onChange={(e) => setPoForm((prev) => ({ ...prev, supplier_id: e.target.value }))}
          >
            <option value="">Select Supplier</option>
            {supplierList.map((s) => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
          </select>
          {selectedProcurementRequest?.items?.length > 0 && (
            <div className="procurement-process-panel">
              <strong>Selected Procurement Items</strong>
              {selectedProcurementRequest.items.map((item) => (
                <div key={item.id}>{item.item_code} - {item.item_name} / Qty: {item.quantity}</div>
              ))}
            </div>
          )}
          <button type="button" disabled={creatingPo} onClick={handleCreatePo}>
            {creatingPo ? 'Creating PO...' : 'Create PO'}
          </button>

          <table width="100%" cellPadding="6">
            <thead>
              <tr>
                <th>PO No</th>
                <th>Procurement No</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Items</th>
                <th>Received Qty</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id}>
                  <td>{po.po_no}</td>
                  <td>{po.procurement_no}</td>
                  <td>{po.supplier_name}</td>
                  <td>{po.status}</td>
                  <td>{po.item_count}</td>
                  <td>{po.total_received_qty || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'grn' && (
        <div className="procurement-process-stack-md">
          <h4>Good Received Note</h4>
          <select value={selectedPoId} onChange={(e) => setSelectedPoId(e.target.value)}>
            <option value="">Select Purchase Order</option>
            {purchaseOrders.map((po) => (
              <option key={po.id} value={po.id}>{po.po_no} ({po.status})</option>
            ))}
          </select>
          {selectedPurchaseOrder?.items?.length > 0 && (
            <div className="procurement-process-panel procurement-process-panel-rounded">
              {selectedPurchaseOrder.items.map((item) => (
                <div key={item.id} className="procurement-process-grn-item-row">
                  <div>{item.item_code} - {item.item_name} (PO Qty: {item.quantity}, Received: {item.received_qty})</div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Received"
                    value={grnItemMap[item.id]?.received_qty || ''}
                    onChange={(e) => setGrnItemMap((prev) => ({
                      ...prev,
                      [item.id]: { ...(prev[item.id] || {}), received_qty: e.target.value },
                    }))}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Rejected"
                    value={grnItemMap[item.id]?.rejected_qty || ''}
                    onChange={(e) => setGrnItemMap((prev) => ({
                      ...prev,
                      [item.id]: { ...(prev[item.id] || {}), rejected_qty: e.target.value },
                    }))}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Damaged"
                    value={grnItemMap[item.id]?.damaged_qty || ''}
                    onChange={(e) => setGrnItemMap((prev) => ({
                      ...prev,
                      [item.id]: { ...(prev[item.id] || {}), damaged_qty: e.target.value },
                    }))}
                  />
                </div>
              ))}
              <button type="button" disabled={creatingGrn} onClick={handleCreateGrn}>
                {creatingGrn ? 'Posting GRN...' : 'Post GRN'}
              </button>
            </div>
          )}

          <table width="100%" cellPadding="6">
            <thead>
              <tr>
                <th>GRN No</th>
                <th>PO</th>
                <th>Status</th>
                <th>Received Date</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {grns.map((grn) => (
                <tr key={grn.id}>
                  <td>{grn.grn_no}</td>
                  <td>{grn.po_no}</td>
                  <td>{grn.status}</td>
                  <td>{grn.received_date}</td>
                  <td>{grn.item_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProcurementProcess;

