import React, { useMemo, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
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
import TransportVoucherPrint from '../finance/financialCards/TransportVoucherPrint';

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

const statusChip = (status) => {
  const map = {
    pending: { label: 'Pending', bg: '#fff7e8', color: '#9a6700' },
    approved: { label: 'Approved', bg: '#eaf8ef', color: '#1f7a44' },
    declined: { label: 'Declined', bg: '#fdeff1', color: '#a63640' },
  };
  const cfg = map[status] || { label: status || 'Unknown', bg: '#eef2f7', color: '#475569' };
  return <Chip size="small" label={cfg.label} sx={{ background: cfg.bg, color: cfg.color }} />;
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
  const [actionError, setActionError] = useState(null);

  const { data: pending = [], isLoading: pendingLoading, refetch: refetchPending } =
    useGetPendingFuelTransportVouchersQuery();
  const { data: history = [], isLoading: historyLoading, refetch: refetchHistory } =
    useGetFuelTransportVoucherHistoryQuery();
  const { data: detail, isLoading: detailLoading } = useGetFuelTransportVoucherByIdQuery(selectedId, {
    skip: !selectedId,
  });

  const [approveVoucher, { isLoading: approving }] = useApproveFuelTransportVoucherMutation();
  const [declineVoucher, { isLoading: declining }] = useDeclineFuelTransportVoucherMutation();

  const fuelRows = fuelTab === 0 ? pending : history;
  const fuelLoading = fuelTab === 0 ? pendingLoading : historyLoading;

  const totals = useMemo(
    () => ({
      pendingCount: pending.length,
      pendingAmount: pending.reduce((s, r) => s + (Number(r.total_amount) || 0), 0),
    }),
    [pending]
  );

  const submitApprove = async () => {
    if (!approveConfirm) return;
    try {
      const result = await approveVoucher(approveConfirm.id).unwrap();
      setApproveConfirm(null);
      setPrintVoucher(result);
      refetchPending();
      refetchHistory();
    } catch (e) {
      setActionError(e?.data?.message || 'Failed to approve voucher');
    }
  };

  const submitDecline = async () => {
    if (!decline?.reason?.trim()) return;
    try {
      await declineVoucher({ id: decline.row.id, reason: decline.reason.trim() }).unwrap();
      setDecline(null);
      if (selectedId === decline.row.id) setSelectedId(null);
      refetchPending();
      refetchHistory();
    } catch (e) {
      setActionError(e?.data?.message || 'Failed to decline voucher');
    }
  };

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

            {fuelLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Voucher No</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Checked By</TableCell>
                      <TableCell>Transactions</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fuelRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#64748b' }}>
                          No vouchers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      fuelRows.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{row.voucher_no}</TableCell>
                          <TableCell>{formatDate(row.created_at)}</TableCell>
                          <TableCell>{row.checked_by_name || row.created_by_name || '-'}</TableCell>
                          <TableCell>{row.transaction_count || 0}</TableCell>
                          <TableCell align="right">{formatLkr(row.total_amount)}</TableCell>
                          <TableCell>{statusChip(row.status)}</TableCell>
                          <TableCell align="right">
                            <Button size="small" onClick={() => setSelectedId(row.id)}>
                              View
                            </Button>
                            {fuelTab === 0 && isMd ? (
                              <>
                                <Button
                                  size="small"
                                  color="success"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => setApproveConfirm(row)}
                                  sx={{ ml: 0.5 }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  startIcon={<CancelIcon />}
                                  onClick={() => setDecline({ row, reason: '' })}
                                  sx={{ ml: 0.5 }}
                                >
                                  Decline
                                </Button>
                              </>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {detail.voucher_no} — {formatLkr(detail.total_amount)} ({detail.transaction_count} lines)
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Card Holder</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>HR Approver</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(detail.lines || []).map((line) => (
                    <TableRow key={line.line_id || line.transaction_id}>
                      <TableCell>{line.card_holder || '-'}</TableCell>
                      <TableCell>{formatDate(line.date)}</TableCell>
                      <TableCell>{line.description || '-'}</TableCell>
                      <TableCell>{line.approved_by_name || '-'}</TableCell>
                      <TableCell align="right">{formatLkr(line.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Typography color="text.secondary">Voucher not found</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {detail ? (
            <Button onClick={() => setPrintVoucher(detail)}>Print</Button>
          ) : null}
          <Button onClick={() => setSelectedId(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(approveConfirm)} onClose={() => setApproveConfirm(null)}>
        <DialogTitle>Approve Fuel Transport Voucher</DialogTitle>
        <DialogContent>
          <Typography>
            Approve voucher <strong>{approveConfirm?.voucher_no}</strong> for{' '}
            <strong>{formatLkr(approveConfirm?.total_amount)}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={submitApprove} disabled={approving}>
            {approving ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(decline)} onClose={() => setDecline(null)}>
        <DialogTitle>Decline Voucher</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Decline reason"
            value={decline?.reason || ''}
            onChange={(e) => setDecline((prev) => ({ ...prev, reason: e.target.value }))}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecline(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={submitDecline}
            disabled={declining || !decline?.reason?.trim()}
          >
            {declining ? 'Declining...' : 'Decline'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(actionError)} onClose={() => setActionError(null)}>
        <DialogTitle>Action failed</DialogTitle>
        <DialogContent>{actionError}</DialogContent>
        <DialogActions>
          <Button onClick={() => setActionError(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {printVoucher ? (
        <TransportVoucherPrint
          voucher={printVoucher}
          onClose={() => setPrintVoucher(null)}
          onPrint={() => window.print()}
        />
      ) : null}
    </Box>
  );
};

export default StrategicFinanceApprovals;
