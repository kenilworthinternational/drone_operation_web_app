import React, { useMemo, useState } from 'react';
import {
  useGetTransactionsForApprovalQuery,
  useApproveTransactionMutation,
  useGetTransactionsQuery,
} from '../../../api/services NodeJs/financialCardsApi';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Card,
  Grid,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Pending,
  History,
  Done,
  Close,
  Search,
  Refresh,
} from '@mui/icons-material';

const FinanceApprovals = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [historyApprovalFilter, setHistoryApprovalFilter] = useState('all');
  const [historySettlementFilter, setHistorySettlementFilter] = useState('all');

  const { data: allTransactions = [], isLoading, refetch } = useGetTransactionsForApprovalQuery();
  const {
    data: allHistoryTransactions = [],
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useGetTransactionsQuery();

  const [approveTransaction, { isLoading: isApproving }] = useApproveTransactionMutation();

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const transactions = useMemo(
    () => (allTransactions || []).filter((t) => t.type === 'use'),
    [allTransactions]
  );

  const historyTransactions = useMemo(
    () => (allHistoryTransactions || []).filter((t) => t.type === 'use'),
    [allHistoryTransactions]
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(String(dateString).includes('T') ? dateString : `${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}:\d{2}/)) return timeString;
    return String(timeString);
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount || 0);

  const getApprovalStatusChip = (approved) => {
    if (approved === 0) return <Chip icon={<Pending />} label="Pending" color="warning" size="small" />;
    if (approved === 1) return <Chip icon={<CheckCircle />} label="Approved" color="success" size="small" />;
    if (approved === 2) return <Chip icon={<Close />} label="Rejected" color="error" size="small" />;
    return <Chip label="Unknown" size="small" />;
  };

  const getSettlementStatusChip = (settled) =>
    settled === 1 ? (
      <Chip icon={<Done />} label="Settled" color="success" size="small" />
    ) : (
      <Chip label="Not Settled" size="small" />
    );

  const pendingCount = transactions.length;
  const pendingTotal = transactions.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredPendingTransactions = useMemo(() => {
    if (!normalizedSearch) return transactions;
    return transactions.filter((t) => {
      const hay = [
        t.card_number,
        t.card_holder,
        t.description,
        t.created_by_name,
        t.amount,
      ]
        .map((v) => String(v || '').toLowerCase())
        .join(' ');
      return hay.includes(normalizedSearch);
    });
  }, [transactions, normalizedSearch]);

  const filteredHistoryTransactions = useMemo(() => {
    return historyTransactions.filter((t) => {
      const searchOk =
        !normalizedSearch ||
        [t.card_number, t.card_holder, t.description, t.amount]
          .map((v) => String(v || '').toLowerCase())
          .join(' ')
          .includes(normalizedSearch);

      const approvalOk =
        historyApprovalFilter === 'all' || String(t.approved) === String(historyApprovalFilter);
      const settlementOk =
        historySettlementFilter === 'all' || String(t.settled) === String(historySettlementFilter);

      return searchOk && approvalOk && settlementOk;
    });
  }, [historyTransactions, normalizedSearch, historyApprovalFilter, historySettlementFilter]);

  const handleApprove = async (transactionId) => {
    try {
      await approveTransaction({ transaction_id: transactionId, approved: 1 }).unwrap();
      refetch();
      refetchHistory();
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  const openRejectDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setApprovalDialog(true);
  };

  const handleReject = async () => {
    if (!selectedTransaction) return;
    try {
      await approveTransaction({
        transaction_id: selectedTransaction.id,
        approved: 2,
        reason: rejectionReason,
      }).unwrap();
      setApprovalDialog(false);
      setSelectedTransaction(null);
      setRejectionReason('');
      refetch();
      refetchHistory();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
    }
  };

  if ((tabValue === 0 && isLoading) || (tabValue === 1 && historyLoading)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Card sx={{ mb: 2, borderRadius: 3, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
        <Box sx={{ p: 2, pb: 0 }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
            }}
          >
            <Tab icon={<Pending />} iconPosition="start" label={`Approvals (${pendingCount})`} />
            <Tab icon={<History />} iconPosition="start" label="History" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={tabValue === 0 ? 7 : 4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search card, holder, description, amount..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {tabValue === 1 && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Approval"
                    value={historyApprovalFilter}
                    onChange={(e) => setHistoryApprovalFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="0">Pending</MenuItem>
                    <MenuItem value="1">Approved</MenuItem>
                    <MenuItem value="2">Rejected</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Settlement"
                    value={historySettlementFilter}
                    onChange={(e) => setHistorySettlementFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="0">Not Settled</MenuItem>
                    <MenuItem value="1">Settled</MenuItem>
                  </TextField>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  refetch();
                  refetchHistory();
                }}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {tabValue === 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
              <Typography variant="body2" color="text.secondary">Pending Count</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{pendingCount}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
              <Typography variant="body2" color="text.secondary">Pending Total</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatAmount(pendingTotal)}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
              <Typography variant="body2" color="text.secondary">Visible Rows</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{filteredPendingTransactions.length}</Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 10px 28px rgba(15,23,42,0.08)' }}>
        <TableContainer sx={{ maxHeight: '68vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Card</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Card Holder</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Approval</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Settlement</TableCell>
                {tabValue === 0 && <TableCell sx={{ fontWeight: 700, minWidth: 170 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {(tabValue === 0 ? filteredPendingTransactions : filteredHistoryTransactions).map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{formatTime(transaction.time)}</TableCell>
                  <TableCell>{transaction.card_number || 'N/A'}</TableCell>
                  <TableCell>{transaction.card_holder || 'N/A'}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>{formatAmount(transaction.amount)}</TableCell>
                  <TableCell>{transaction.description || 'N/A'}</TableCell>
                  <TableCell>{getApprovalStatusChip(transaction.approved ?? 0)}</TableCell>
                  <TableCell>{getSettlementStatusChip(transaction.settled ?? 0)}</TableCell>
                  {tabValue === 0 && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(transaction.id)}
                          disabled={isApproving}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Cancel />}
                          onClick={() => openRejectDialog(transaction)}
                          disabled={isApproving}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {(tabValue === 0 ? filteredPendingTransactions.length === 0 : filteredHistoryTransactions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={tabValue === 0 ? 9 : 8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {tabValue === 0 ? 'No pending transactions found.' : 'No history records for selected filters.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={approvalDialog}
        onClose={() => setApprovalDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Cancel color="error" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Reject Transaction
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Confirm rejection for this transaction.
          </Typography>
          {selectedTransaction && (
            <Card sx={{ mt: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="body2"><strong>Amount:</strong> {formatAmount(selectedTransaction.amount)}</Typography>
              <Typography variant="body2"><strong>Card:</strong> {selectedTransaction.card_number || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Description:</strong> {selectedTransaction.description || 'N/A'}</Typography>
            </Card>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason (Optional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            margin="normal"
            placeholder="Enter reason for rejection..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setApprovalDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={isApproving}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isApproving ? <CircularProgress size={20} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinanceApprovals;
