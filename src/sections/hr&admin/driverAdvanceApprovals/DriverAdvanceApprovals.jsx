import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import Download from '@mui/icons-material/Download';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  useGetAdvanceRequestsForHrQuery,
  useHrApproveAdvanceRequestMutation,
} from '../../../api/services NodeJs/vehicleRentApi';

function getRollingMonthOptions(monthsBack = 24) {
  const now = new Date();
  const out = [];
  for (let i = 0; i < monthsBack; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    out.push({ value, label });
  }
  return out;
}

function formatDateOnly(value) {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(String(value).trim());
  if (Number.isNaN(d.getTime())) return String(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const statusLabel = (code) => {
  if (code === 'a') return 'Approved';
  if (code === 'd') return 'Declined';
  return 'Pending';
};

const yesNoLabel = (value) => (Number(value) === 1 ? 'Paid' : 'Not Paid');

/** Transport HR detail overlay uses z-index 3000; MUI Select menus default ~1300 */
const Z_ABOVE_HOST_OVERLAY = 3500;
const selectMenuPropsAboveHostOverlay = {
  slotProps: {
    root: { sx: { zIndex: Z_ABOVE_HOST_OVERLAY } },
    paper: { sx: { zIndex: Z_ABOVE_HOST_OVERLAY } },
  },
};

const DriverAdvanceApprovals = ({ embedded = false }) => {
  const [statusFilter, setStatusFilter] = useState('p');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const monthOptions = useMemo(() => getRollingMonthOptions(24), []);

  const { data: rows = [], isLoading, refetch } = useGetAdvanceRequestsForHrQuery({
    yearMonth: selectedMonth,
    status: statusFilter,
  });
  const [hrApprove, { isLoading: actionLoading }] = useHrApproveAdvanceRequestMutation();

  const selectedMonthLabel =
    monthOptions.find((m) => m.value === selectedMonth)?.label || selectedMonth;
  const pendingCount = rows.filter((r) => String(r.approval || 'p') === 'p').length;
  const approvedCount = rows.filter((r) => String(r.approval || '') === 'a').length;
  const declinedCount = rows.filter((r) => String(r.approval || '') === 'd').length;

  const handleAction = async (id, status) => {
    try {
      await hrApprove({ id, status }).unwrap();
      refetch();
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(error?.data?.message || 'Failed to update request');
    }
  };

  const handleDownloadExcel = () => {
    if (!rows.length) return;
    const flat = rows.map((r) => ({
      'Request date': formatDateOnly(r.request_date),
      'Advance month': r.month_key || '',
      Driver: r.requested_by_name || '',
      'Vehicle no': r.vehicle_no || '',
      'Amount (LKR)': Number(r.amount || 0).toFixed(2),
      Reason: r.reason || '',
      'HR Status': statusLabel(r.approval),
      'Finance Approval': statusLabel(String(r.finance_approval || 'p')),
      'Finance Paid': yesNoLabel(r.finance_paid),
      'Paid Document': r.payment_image_url || r.payment_image || '',
      'Request ID': r.id,
    }));
    const worksheet = XLSX.utils.json_to_sheet(flat);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Advance requests');
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(
      workbook,
      `Driver_advance_approvals_${selectedMonth}_${statusFilter}_${stamp}.xlsx`
    );
  };

  const shellSx = embedded
    ? { p: '6px', m: 0, backgroundColor: 'transparent', minHeight: 'auto' }
    : { p: 3, backgroundColor: '#f3f7fb', minHeight: '100vh' };

  return (
    <Box sx={shellSx}>
      <Card
        elevation={0}
        sx={{
          mb: 1.5,
          border: '1px solid #d9e5ef',
          borderRadius: 2,
          background: 'linear-gradient(180deg, #fdfefe 0%, #f6fbff 100%)',
        }}
      >
        <CardContent sx={{ p: '14px !important' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#102739', m: 0 }}>
                Driver Advance Approvals (HR)
              </Typography>
              <Typography variant="caption" sx={{ color: '#5f7383' }}>
                Month: {selectedMonthLabel}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
              <Chip size="small" label={`Pending: ${pendingCount}`} sx={{ background: '#fff7e8', color: '#9a6700' }} />
              <Chip size="small" label={`Approved: ${approvedCount}`} sx={{ background: '#eaf8ef', color: '#1f7a44' }} />
              <Chip size="small" label={`Declined: ${declinedCount}`} sx={{ background: '#fdeff1', color: '#a63640' }} />
            </Box>
          </Box>
          <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel id="driver-advance-hr-month-label">Month</InputLabel>
              <Select
                labelId="driver-advance-hr-month-label"
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
                MenuProps={selectMenuPropsAboveHostOverlay}
              >
                {monthOptions.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="driver-advance-hr-status-label">Status</InputLabel>
              <Select
                labelId="driver-advance-hr-status-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                MenuProps={selectMenuPropsAboveHostOverlay}
              >
                <MenuItem value="p">Pending</MenuItem>
                <MenuItem value="a">Approved</MenuItem>
                <MenuItem value="d">Declined</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadExcel}
              disabled={!rows.length || isLoading}
              sx={{
                textTransform: 'none',
                borderColor: '#b9cad9',
                color: '#0f3f5d',
                '&:hover': { borderColor: '#004b71', backgroundColor: '#eff6fb' },
              }}
            >
              Download Excel
            </Button>
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card
          elevation={0}
          sx={{
            border: '1px solid #d9e5ef',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          <TableContainer sx={{ maxHeight: embedded ? '64vh' : 'unset' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f4f8fc' }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Request Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Month</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Driver</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Amount (LKR)</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>HR Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Finance Approval</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Finance Paid</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Paid Document</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover sx={{ '&:nth-of-type(even)': { backgroundColor: '#fbfdff' } }}>
                    <TableCell>{formatDateOnly(r.request_date)}</TableCell>
                    <TableCell>{r.month_key || '-'}</TableCell>
                    <TableCell>{r.requested_by_name || '-'}</TableCell>
                    <TableCell>{r.vehicle_no || '-'}</TableCell>
                    <TableCell>{Number(r.amount || 0).toFixed(2)}</TableCell>
                    <TableCell>{r.reason || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={r.approval === 'a' ? 'success' : r.approval === 'd' ? 'error' : 'warning'}
                        label={statusLabel(r.approval)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={
                          String(r.finance_approval || 'p') === 'a'
                            ? 'success'
                            : String(r.finance_approval || 'p') === 'd'
                              ? 'error'
                              : 'warning'
                        }
                        label={statusLabel(String(r.finance_approval || 'p'))}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={Number(r.finance_paid) === 1 ? 'success' : 'default'}
                        label={yesNoLabel(r.finance_paid)}
                        variant={Number(r.finance_paid) === 1 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      {r.payment_image_url || r.payment_image ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            window.open(r.payment_image_url || r.payment_image, '_blank', 'noopener,noreferrer')
                          }
                          sx={{ textTransform: 'none' }}
                        >
                          View
                        </Button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {r.approval === 'p' ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={actionLoading}
                            onClick={() => handleAction(r.id, 'a')}
                            sx={{ textTransform: 'none', minWidth: 88 }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={actionLoading}
                            onClick={() => handleAction(r.id, 'd')}
                            sx={{ textTransform: 'none', minWidth: 88 }}
                          >
                            Decline
                          </Button>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!rows.length ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      No advance requests for {selectedMonthLabel} with the selected status.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default DriverAdvanceApprovals;
