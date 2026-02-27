import React, { useState } from 'react';
import {
  useGetTransactionsForApprovalQuery,
  useApproveTransactionMutation,
  useGetTransactionsQuery,
} from '../../../api/services NodeJs/financialCardsApi';
import {
  Box,
  Paper,
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Pending, 
  History, 
  Done, 
  Close, 
  Search,
  FilterList,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import { getUserData } from '../../../utils/authUtils';

const FinanceApprovals = () => {
  const [tabValue, setTabValue] = useState(0);
  const userData = getUserData();
  const userId = userData?.id;
  
  // Financial Cards queries
  const { data: allTransactions = [], isLoading, error, refetch } = useGetTransactionsForApprovalQuery();
  const { data: allHistoryTransactions = [], isLoading: historyLoading, refetch: refetchHistory } = useGetTransactionsQuery();
  
  // Filter to only show 'use' type transactions (exclude 'add' type)
  const transactions = allTransactions.filter(t => t.type === 'use');
  const historyTransactions = (allHistoryTransactions || []).filter(t => t.type === 'use');
  
  const [approveTransaction, { isLoading: isApproving }] = useApproveTransactionMutation();
  
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async (transactionId) => {
    try {
      await approveTransaction({
        transaction_id: transactionId,
        approved: 1,
      }).unwrap();
      setApprovalDialog(false);
      setSelectedTransaction(null);
      setRejectionReason('');
      refetch();
      refetchHistory();
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
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


  const getApprovalStatusChip = (approved) => {
    if (approved === 0) {
      return <Chip icon={<Pending />} label="Pending" color="warning" size="small" />;
    } else if (approved === 1) {
      return <Chip icon={<CheckCircle />} label="Approved" color="success" size="small" />;
    } else if (approved === 2) {
      return <Chip icon={<Close />} label="Rejected" color="error" size="small" />;
    }
    return <Chip label="Unknown" size="small" />;
  };

  const getSettlementStatusChip = (settled) => {
    if (settled === 1) {
      return <Chip icon={<Done />} label="Settled" color="success" size="small" />;
    } else {
      return <Chip label="Not Settled" color="default" size="small" />;
    }
  };

  const openRejectDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setApprovalDialog(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Handle different date formats
      let date;
      if (typeof dateString === 'string' && dateString.includes('T')) {
        date = new Date(dateString);
      } else if (typeof dateString === 'string') {
        // Handle YYYY-MM-DD format
        date = new Date(dateString + 'T00:00:00');
      } else {
        date = new Date(dateString);
      }
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // If timeString is in HH:MM:SS format, return as is
    if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}:\d{2}/)) {
      return timeString;
    }
    return timeString;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Show loading only for active tab
  if ((tabValue === 0 && isLoading) || (tabValue === 1 && historyLoading)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a202c', mb: 1 }}>
          Finance Approvals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and approve financial transactions and vehicle rent requests
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 64,
            },
          }}
        >
          <Tab icon={<Pending />} iconPosition="start" label="Financial Cards" />
          <Tab icon={<History />} iconPosition="start" label="Transaction History" />
        </Tabs>
      </Card>

      {/* Financial Cards Tab */}
      {tabValue === 0 && (
        <>
          {transactions.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Typography variant="body1" color="text.secondary">
                No pending transactions for approval
              </Typography>
            </Card>
          ) : (
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Card</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Card Holder</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id} 
                        hover
                        sx={{ 
                          '&:hover': { backgroundColor: '#f8f9fa' },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{formatTime(transaction.time)}</TableCell>
                        <TableCell>{transaction.card_number || 'N/A'}</TableCell>
                        <TableCell>{transaction.card_holder || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type === 'add' ? 'Add' : 'Use'}
                            color={transaction.type === 'add' ? 'success' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{formatAmount(transaction.amount)}</TableCell>
                        <TableCell>{transaction.description || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            icon={<Pending />}
                            label="Pending"
                            color="warning"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApprove(transaction.id)}
                              disabled={isApproving}
                              sx={{ textTransform: 'none', fontWeight: 500 }}
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
                              sx={{ textTransform: 'none', fontWeight: 500 }}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </>
      )}

      {/* Transaction History Tab */}
      {tabValue === 1 && (
        <>
          {historyTransactions.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <History sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No transaction history found
              </Typography>
            </Card>
          ) : (
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Card</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Card Holder</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Approval Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Settlement Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyTransactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id} 
                        hover
                        sx={{ 
                          '&:hover': { backgroundColor: '#f8f9fa' },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{formatTime(transaction.time)}</TableCell>
                        <TableCell>{transaction.card_number || 'N/A'}</TableCell>
                        <TableCell>{transaction.card_holder || 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{formatAmount(transaction.amount)}</TableCell>
                        <TableCell>{transaction.description || 'N/A'}</TableCell>
                        <TableCell>
                          {getApprovalStatusChip(transaction.approved)}
                        </TableCell>
                        <TableCell>
                          {getSettlementStatusChip(transaction.settled)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </>
      )}

      {/* Financial Card Rejection Dialog */}
      <Dialog 
        open={approvalDialog} 
        onClose={() => setApprovalDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Cancel color="error" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Reject Transaction
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom color="text.secondary">
            Are you sure you want to reject this transaction?
          </Typography>
          {selectedTransaction && (
            <Card sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Amount:</strong> {formatAmount(selectedTransaction.amount)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Card:</strong> {selectedTransaction.card_number || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {selectedTransaction.type === 'add' ? 'Add' : 'Use'}
              </Typography>
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
          <Button 
            onClick={() => setApprovalDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained" 
            disabled={isApproving}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            {isApproving ? <CircularProgress size={20} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default FinanceApprovals;

