import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { FaEye, FaPrint } from 'react-icons/fa';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  useGetPendingFuelTransportVouchersQuery,
  useGetFuelTransportVoucherHistoryQuery,
  useGetFuelTransportVoucherByIdQuery,
  useApproveFuelTransportVoucherMutation,
  useDeclineFuelTransportVoucherMutation,
} from '../../api/services NodeJs/fuelTransportVoucherApi';
import { getUserData } from '../../utils/authUtils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TransportVoucherPrint from '../finance/financialCards/TransportVoucherPrint';
import {
  formatFuelMoney,
  formatFuelVoucherDescription,
  getFuelLineDisplayParts,
} from '../finance/financialCards/fuelVoucherDescription';
import {
  getVoucherApprovalTypeLabel,
  getVoucherDecidedBy,
  isPdfProofUrl,
  voucherStatusLabel,
} from '../finance/financialCards/fuelTransportVoucherUi';
import { resolveVoucherDriverName } from '../finance/financialCards/transportVoucherPrintUtils';
import '../../styles/financialCards.css';

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(String(value).includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatLkr = (value) =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(
    Number(value) || 0
  );

const spmDialogPaperSx = {
  borderRadius: '12px',
  border: '1px solid #d9e5ef',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
  overflow: 'hidden',
};

const spmDialogActionsSx = {
  px: 3,
  py: 2,
  gap: 1,
  borderTop: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
};

const spmVoucherSummaryBoxSx = {
  mt: 1.5,
  p: 1.5,
  background: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const StrategicFinanceApprovals = () => {
  const userData = getUserData();
  const isMd = String(userData?.job_role || '').trim().toLowerCase() === 'md';

  const [mainTab, setMainTab] = useState(0);
  const [fuelTab, setFuelTab] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [decline, setDecline] = useState(null);
  const [approveConfirm, setApproveConfirm] = useState(null);
  const [printVoucher, setPrintVoucher] = useState(null);
  const [printVoucherId, setPrintVoucherId] = useState(null);
  const [settlementProofPreviewUrl, setSettlementProofPreviewUrl] = useState(null);
  const [voucherSearch, setVoucherSearch] = useState('');

  const { data: pending = [], isLoading: pendingLoading, refetch: refetchPending } =
    useGetPendingFuelTransportVouchersQuery();
  const { data: history = [], isLoading: historyLoading, refetch: refetchHistory } =
    useGetFuelTransportVoucherHistoryQuery();
  const { data: detail, isLoading: detailLoading } = useGetFuelTransportVoucherByIdQuery(selectedId, {
    skip: !selectedId,
  });
  const { data: printDetail } = useGetFuelTransportVoucherByIdQuery(printVoucherId, {
    skip: !printVoucherId,
  });

  const [approveVoucher, { isLoading: approving }] = useApproveFuelTransportVoucherMutation();
  const [declineVoucher, { isLoading: declining }] = useDeclineFuelTransportVoucherMutation();

  const sourceRows = fuelTab === 0 ? pending : history;
  const fuelLoading = fuelTab === 0 ? pendingLoading : historyLoading;

  useEffect(() => {
    if (printDetail && printVoucherId) {
      setPrintVoucher(printDetail);
      setPrintVoucherId(null);
    }
  }, [printDetail, printVoucherId]);

  const filteredRows = useMemo(() => {
    if (!voucherSearch.trim()) return sourceRows;
    const q = voucherSearch.toLowerCase();
    return sourceRows.filter(
      (row) =>
        row.voucher_no?.toLowerCase().includes(q) ||
        row.created_by_name?.toLowerCase().includes(q) ||
        row.checked_by_name?.toLowerCase().includes(q) ||
        getVoucherDecidedBy(row).toLowerCase().includes(q) ||
        String(row.total_amount || '').includes(q) ||
        String(row.transaction_count || '').includes(q)
    );
  }, [sourceRows, voucherSearch]);

  const totals = useMemo(
    () => ({
      pendingCount: pending.length,
      pendingAmount: pending.reduce((s, r) => s + (Number(r.total_amount) || 0), 0),
    }),
    [pending]
  );

  const openSettlementProof = (url) => {
    if (!url) return;
    if (isPdfProofUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    setSettlementProofPreviewUrl(url);
  };

  const openVoucherPrint = (row) => {
    if (row?.lines?.length) {
      setPrintVoucher(row);
      return;
    }
    setPrintVoucherId(row.id);
  };

  const submitApprove = async () => {
    if (!approveConfirm) return;
    try {
      const result = await approveVoucher(approveConfirm.id).unwrap();
      setApproveConfirm(null);
      setPrintVoucher(result);
      toast.success('Voucher approved');
      refetchPending();
      refetchHistory();
    } catch (e) {
      toast.error(e?.data?.message || 'Failed to approve voucher');
    }
  };

  const submitDecline = async () => {
    if (!decline?.reason?.trim()) return;
    try {
      await declineVoucher({ id: decline.row.id, reason: decline.reason.trim() }).unwrap();
      setDecline(null);
      if (selectedId === decline.row.id) setSelectedId(null);
      toast.success('Voucher declined');
      refetchPending();
      refetchHistory();
    } catch (e) {
      toast.error(e?.data?.message || 'Failed to decline voucher');
    }
  };

  const renderSettledCell = (voucher) => (
    <td className="voucher-settled-cell-financial-cards">
      {Number(voucher.settled) === 1 ? (
        voucher.settlement_proof_image_url ? (
          isPdfProofUrl(voucher.settlement_proof_image_url) ? (
            <button
              type="button"
              className="voucher-settlement-proof-link-financial-cards"
              onClick={() => openSettlementProof(voucher.settlement_proof_image_url)}
            >
              View proof
            </button>
          ) : (
            <button
              type="button"
              className="voucher-settlement-proof-thumb-btn-financial-cards"
              onClick={() => openSettlementProof(voucher.settlement_proof_image_url)}
              title="View settlement proof"
              aria-label="View settlement proof"
            >
              <img
                src={voucher.settlement_proof_image_url}
                alt="Settlement proof"
                className="voucher-settlement-proof-thumb-financial-cards"
              />
            </button>
          )
        ) : (
          <span className="voucher-settled-label-financial-cards">Settled</span>
        )
      ) : (
        <span className="voucher-not-settled-financial-cards">Not settled</span>
      )}
    </td>
  );

  const renderActionsCell = (row) => (
    <td className="voucher-history-actions-cell-financial-cards">
      <div className="voucher-history-actions-financial-cards">
        <button
          type="button"
          className="voucher-action-btn-financial-cards voucher-action-btn-outline-financial-cards"
          onClick={() => setSelectedId(row.id)}
          title="View details"
          aria-label="View voucher details"
        >
          <FaEye />
        </button>
        <button
          type="button"
          className="voucher-action-btn-financial-cards voucher-action-btn-outline-financial-cards"
          onClick={() => openVoucherPrint(row)}
          title="Print"
          aria-label="Print voucher"
        >
          <FaPrint />
        </button>
        {fuelTab === 0 && isMd ? (
          <>
            <button
              type="button"
              className="voucher-action-btn-financial-cards voucher-action-btn-success-financial-cards"
              onClick={() => setApproveConfirm(row)}
              title="Approve voucher"
              aria-label="Approve voucher"
            >
              <CheckCircleIcon fontSize="small" />
            </button>
            <button
              type="button"
              className="voucher-action-btn-financial-cards voucher-action-btn-danger-financial-cards"
              onClick={() => setDecline({ row, reason: '' })}
              title="Decline voucher"
              aria-label="Decline voucher"
            >
              <CancelIcon fontSize="small" />
            </button>
          </>
        ) : null}
      </div>
    </td>
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#f3f7fb', minHeight: '100vh' }}>
      <Card elevation={0} sx={{ mb: 2, border: '1px solid #d9e5ef', borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#102739' }}>
            Finance Approvals
          </Typography>
          <Typography variant="body2" sx={{ color: '#5f7383', mt: 0.5 }}>
            Strategic Planning and Monitoring wing — system approvals for finance vouchers.
          </Typography>
          <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ mt: 2 }}>
            <Tab label="Fuel Transport Approvals" />
            <Tab label="More approvals (coming soon)" disabled />
          </Tabs>
        </CardContent>
      </Card>

      {mainTab === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid #d9e5ef', borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#102739' }}>
                  Fuel Transport Vouchers
                </Typography>
                <Typography variant="caption" sx={{ color: '#5f7383' }}>
                  MD system approval for finance-created fuel transport vouchers.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                <Chip size="small" label={`Pending: ${totals.pendingCount}`} sx={{ background: '#fff7e8', color: '#9a6700' }} />
                <Chip
                  size="small"
                  label={`Pending total: ${formatLkr(totals.pendingAmount)}`}
                  sx={{ background: '#eef4ff', color: '#1d4ed8' }}
                />
              </Box>
            </Box>

            <Tabs value={fuelTab} onChange={(_, v) => setFuelTab(v)} sx={{ mb: 1.5 }}>
              <Tab label={`Pending (${pending.length})`} />
              <Tab label={`History (${history.length})`} />
            </Tabs>

            <div className="settlements-filters-financial-cards" style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Search voucher no, preparer, amount..."
                value={voucherSearch}
                onChange={(e) => setVoucherSearch(e.target.value)}
                className="settlement-search-input-financial-cards"
              />
            </div>

            {fuelLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <div className="settlements-table-container-financial-cards">
                <table className="voucher-history-table-financial-cards">
                  <thead>
                    <tr>
                      <th>Voucher No</th>
                      <th>Created</th>
                      <th>Status</th>
                      {fuelTab === 1 ? <th>Approved / Declined By</th> : <th>Prepared By</th>}
                      <th>Details</th>
                      <th>Amount</th>
                      {fuelTab === 1 ? <th>Settled</th> : null}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={fuelTab === 1 ? 8 : 7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No vouchers found
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.voucher_no}</td>
                          <td>{formatDate(row.created_at)}</td>
                          <td>
                            <span className={`voucher-status-pill-financial-cards ${row.status}`}>
                              {voucherStatusLabel(row.status)}
                            </span>
                          </td>
                          <td>
                            {fuelTab === 1
                              ? getVoucherDecidedBy(row)
                              : row.checked_by_name || row.created_by_name || '-'}
                          </td>
                          <td className="voucher-details-cell-financial-cards">
                            <div className="voucher-details-main-financial-cards">
                              {getVoucherApprovalTypeLabel(row)} ({row.transaction_count || 0})
                            </div>
                            <div className="voucher-details-sub-financial-cards">
                              {row.transaction_count || 0} transaction
                              {(row.transaction_count || 0) === 1 ? '' : 's'}
                            </div>
                          </td>
                          <td>LKR {Number(row.total_amount || 0).toFixed(2)}</td>
                          {fuelTab === 1 ? renderSettledCell(row) : null}
                          {renderActionsCell(row)}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={Boolean(selectedId)} onClose={() => setSelectedId(null)} maxWidth="md" fullWidth>
        <DialogTitle>Voucher Detail</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <CircularProgress size={24} />
          ) : detail ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#334155' }}>
                {detail.voucher_no} — LKR {formatFuelMoney(detail.total_amount)} ({detail.transaction_count} transaction
                {(detail.transaction_count || 0) === 1 ? '' : 's'})
              </Typography>
              <div className="settlements-table-container-financial-cards">
                <table className="voucher-history-table-financial-cards">
                  <thead>
                    <tr>
                      <th>Driver</th>
                      <th>Fuel Date</th>
                      <th>Time</th>
                      <th>Fuel Details</th>
                      <th>Admin Approver</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.lines || []).map((line) => {
                      const parts = getFuelLineDisplayParts(line);
                      return (
                        <tr key={line.line_id || line.transaction_id}>
                          <td>{resolveVoucherDriverName(line)}</td>
                          <td>{parts.fuelDate}</td>
                          <td>{line.time || '-'}</td>
                          <td className="fuel-details-cell-financial-cards">
                            {formatFuelVoucherDescription(line)}
                          </td>
                          <td>{line.approved_by_name || '-'}</td>
                          <td>LKR {formatFuelMoney(line.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Box>
          ) : (
            <Typography color="text.secondary">Voucher not found</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {detail ? (
            <Button onClick={() => openVoucherPrint(detail)}>Print</Button>
          ) : null}
          <Button onClick={() => setSelectedId(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(approveConfirm)}
        onClose={() => !approving && setApproveConfirm(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: spmDialogPaperSx }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 2.5,
            pb: 1,
            fontWeight: 700,
            color: '#102739',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CheckCircleIcon sx={{ color: '#15803d', fontSize: 22 }} />
          Approve Fuel Transport Voucher
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1, pb: 2.5 }}>
          <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.55 }}>
            Confirm system approval for voucher{' '}
            <strong>{approveConfirm?.voucher_no}</strong> totaling{' '}
            <strong>{formatLkr(approveConfirm?.total_amount)}</strong>.
          </Typography>
          {approveConfirm ? (
            <Box sx={spmVoucherSummaryBoxSx}>
              <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mb: 0.5 }}>
                Voucher summary
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {approveConfirm.transaction_count || 0} transaction
                {(approveConfirm.transaction_count || 0) === 1 ? '' : 's'} ·{' '}
                {getVoucherApprovalTypeLabel(approveConfirm)}
              </Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={spmDialogActionsSx}>
          <Button
            variant="outlined"
            onClick={() => setApproveConfirm(null)}
            disabled={approving}
            sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={submitApprove}
            disabled={approving}
            sx={{ textTransform: 'none', minWidth: 110, boxShadow: 'none' }}
          >
            {approving ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(decline)}
        onClose={() => !declining && setDecline(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: spmDialogPaperSx }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 2.5,
            pb: 1,
            fontWeight: 700,
            color: '#102739',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CancelIcon sx={{ color: '#b91c1c', fontSize: 22 }} />
          Decline Fuel Transport Voucher
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1, pb: 2.5 }}>
          <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.55, mb: 1.5 }}>
            Please provide a reason for declining this voucher. Finance will see the declined status
            and can create a new voucher if needed.
          </Typography>
          {decline?.row ? (
            <Box sx={{ ...spmVoucherSummaryBoxSx, mt: 0, mb: 2 }}>
              <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mb: 0.5 }}>
                Voucher
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {decline.row.voucher_no} · {formatLkr(decline.row.total_amount)} ·{' '}
                {decline.row.transaction_count || 0} transaction
                {(decline.row.transaction_count || 0) === 1 ? '' : 's'}
              </Typography>
            </Box>
          ) : null}
          <Typography
            component="label"
            htmlFor="spm-decline-reason"
            variant="caption"
            sx={{ display: 'block', fontWeight: 600, color: '#475569', mb: 0.75 }}
          >
            Decline reason
          </Typography>
          <TextField
            id="spm-decline-reason"
            autoFocus
            fullWidth
            multiline
            minRows={4}
            placeholder="Enter reason for declining this voucher..."
            value={decline?.reason || ''}
            onChange={(e) => setDecline((prev) => (prev ? { ...prev, reason: e.target.value } : prev))}
            disabled={declining}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#fff',
                fontSize: '0.9rem',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={spmDialogActionsSx}>
          <Button
            variant="outlined"
            onClick={() => setDecline(null)}
            disabled={declining}
            sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={submitDecline}
            disabled={declining || !decline?.reason?.trim()}
            sx={{
              textTransform: 'none',
              minWidth: 110,
              boxShadow: 'none',
              '&.Mui-disabled': {
                backgroundColor: '#fecaca',
                color: '#fff',
              },
            }}
          >
            {declining ? 'Declining...' : 'Decline'}
          </Button>
        </DialogActions>
      </Dialog>

      {settlementProofPreviewUrl ? (
        <div
          className="modal-overlay-financial-cards settlement-proof-overlay-financial-cards"
          onClick={() => setSettlementProofPreviewUrl(null)}
        >
          <div
            className="settlement-proof-preview-modal-financial-cards"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-financial-cards">
              <h2>Settlement Proof</h2>
              <button
                type="button"
                className="modal-close-financial-cards"
                onClick={() => setSettlementProofPreviewUrl(null)}
              >
                ×
              </button>
            </div>
            <div className="settlement-proof-preview-body-financial-cards">
              <img
                src={settlementProofPreviewUrl}
                alt="Settlement proof"
                className="settlement-proof-preview-image-financial-cards"
              />
            </div>
          </div>
        </div>
      ) : null}

      {printVoucher ? (
        <TransportVoucherPrint
          voucher={printVoucher}
          onClose={() => setPrintVoucher(null)}
          onPrint={() => window.print()}
        />
      ) : null}

      <ToastContainer position="top-right" autoClose={4000} closeOnClick pauseOnHover />
    </Box>
  );
};

export default StrategicFinanceApprovals;
