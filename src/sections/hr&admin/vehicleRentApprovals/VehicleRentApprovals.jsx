import React, { useState, useMemo } from 'react';
import {
  useGetDailyVerificationQueueQuery,
  useGetPendingApprovalsQuery,
  useLazyGetVehicleRentDailyDetailsQuery,
  useVerifyVehicleDayRecordMutation,
  useApproveVehicleDateMutation,
} from '../../../api/services NodeJs/vehicleRentApi';
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
  Card,
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
  DirectionsCar,
  Search,
  Refresh,
  Visibility,
  FilterList,
  CalendarToday,
  Done,
  Close,
  HelpOutline,
} from '@mui/icons-material';
import { getUserData } from '../../../utils/authUtils';
import '../../../styles/vehicleRentApprovals.css';

function nonEmptySrc(value) {
  const s = String(value == null ? '' : value).trim();
  return s || undefined;
}

/** Stacking above Transport HR detail overlay (z-index 3000) and other app layers */
const NESTED_OVERLAY_Z_INDEX = 5000;

const nestedDialogSlotProps = {
  root: {
    sx: { zIndex: NESTED_OVERLAY_Z_INDEX },
  },
};

/** Transport HR `.details-overlay-transport-hr` is z-index 3000; MUI portaled layers default ~1300 and sit behind it */
const HOST_OVERLAY_Z = 3000;
const Z_ABOVE_HOST_OVERLAY = HOST_OVERLAY_Z + 500;
/** Tooltip / Popper-based overlays */
const popperAboveHostOverlaySlotProps = {
  popper: { sx: { zIndex: Z_ABOVE_HOST_OVERLAY } },
};
/**
 * Select opens a Menu (Popover/Modal), not a Popper — slotProps.popper does nothing.
 * Without this, the menu stays under the host overlay and filters feel non-interactive.
 */
const selectMenuPropsAboveHostOverlay = {
  slotProps: {
    root: {
      sx: { zIndex: Z_ABOVE_HOST_OVERLAY },
    },
    paper: {
      sx: { zIndex: Z_ABOVE_HOST_OVERLAY },
    },
  },
};

const VehicleRentApprovals = ({ embedded = false }) => {
  const userData = getUserData();
  const userId = userData?.id;
  
  // Month selector - default to current month (must be declared before use in query)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Status filter - default to 'p' (pending)
  const [statusFilter, setStatusFilter] = useState('p');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Generate list of months (last 12 months)
  const months = useMemo(() => {
    const monthsList = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthsList.push({ value: `${year}-${month}`, label: monthName });
    }
    return monthsList;
  }, []);
  
  // Vehicle Rent queries - filter by selected month and status
  const { data: pendingVehicleRents = [], isLoading: vehicleRentLoading, refetch: refetchVehicleRents } = useGetPendingApprovalsQuery({ 
    yearMonth: selectedMonth,
    status: statusFilter
  });
  const { data: dailyVerificationRows = [], isLoading: verificationQueueLoading, refetch: refetchVerificationQueue } = useGetDailyVerificationQueueQuery({
    yearMonth: selectedMonth,
    vehicle: vehicleFilter || undefined,
  });
  
  const [approveVehicleDate, { isLoading: isApprovingVehicle }] = useApproveVehicleDateMutation();
  const [verifyVehicleDayRecord, { isLoading: isVerifyingDay }] = useVerifyVehicleDayRecordMutation();
  
  const [selectedVehicleRent, setSelectedVehicleRent] = useState(null);
  const [vehicleRentDialog, setVehicleRentDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [dailyDetailsDialog, setDailyDetailsDialog] = useState(false);
  const [dailyDetailsRows, setDailyDetailsRows] = useState([]);
  const [dailyDetailsTarget, setDailyDetailsTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveBillNote, setApproveBillNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [editVerifyDialogOpen, setEditVerifyDialogOpen] = useState(false);
  const [editVerifyTargetRow, setEditVerifyTargetRow] = useState(null);
  const [editStartMeter, setEditStartMeter] = useState('');
  const [editEndMeter, setEditEndMeter] = useState('');
  const [editVerifyReason, setEditVerifyReason] = useState('');
  const [imageDialog, setImageDialog] = useState({ open: false, imageUrl: null, title: '' });
  const [fetchDailyDetails, { isFetching: loadingDailyDetails }] = useLazyGetVehicleRentDailyDetailsQuery();

  // Vehicle Rent handlers
  const openApproveDialog = (rent) => {
    setApproveTarget(rent);
    setApproveBillNote('');
    setApproveDialog(true);
  };

  const handleApproveVehicleRent = async () => {
    if (!approveTarget?.id) return;
    try {
      await approveVehicleDate({
        id: approveTarget.id,
        status: 'a',
        approvedBy: userId,
        bill_note: approveBillNote || null,
      }).unwrap();
      setApproveDialog(false);
      setApproveTarget(null);
      setApproveBillNote('');
      refetchVehicleRents();
    } catch (error) {
      console.error('Error approving vehicle rent:', error);
      alert(error?.data?.message || 'Failed to approve vehicle rent');
    }
  };

  const handleRejectVehicleRent = async () => {
    if (!selectedVehicleRent) return;
    try {
      await approveVehicleDate({
        id: selectedVehicleRent.id,
        status: 'd',
        approvedBy: userId,
      }).unwrap();
      setVehicleRentDialog(false);
      setSelectedVehicleRent(null);
      setRejectionReason('');
      refetchVehicleRents();
    } catch (error) {
      console.error('Error declining vehicle rent:', error);
    }
  };

  const openVehicleRentRejectDialog = (vehicleRent) => {
    setSelectedVehicleRent(vehicleRent);
    setVehicleRentDialog(true);
  };

  const openImageDialog = (imageUrl, title) => {
    const src = nonEmptySrc(imageUrl);
    if (!src) return;
    setImageDialog({ open: true, imageUrl: src, title });
  };

  const closeImageDialog = () => {
    setImageDialog({ open: false, imageUrl: null, title: '' });
  };

  const formatDuration = (minutes) => {
    if (minutes == null || Number.isNaN(Number(minutes))) return '-';
    const total = Number(minutes);
    if (total < 0) return '-';
    const hrs = Math.floor(total / 60);
    const mins = total % 60;
    return `${hrs}h ${mins}m`;
  };

  const openDailyDetailsDialog = async (rent) => {
    const vehicleRef = rent?.vehicle_id || rent?.vehicle_no || rent?.vehicle;
    if (!vehicleRef) return;
    setDailyDetailsTarget(rent);
    setDailyDetailsRows([]);
    setDailyDetailsDialog(true);
    try {
      const rows = await fetchDailyDetails({
        yearMonth: selectedMonth,
        vehicle: vehicleRef,
      }).unwrap();
      setDailyDetailsRows(rows || []);
    } catch (error) {
      console.error('Error fetching daily rent details:', error);
      setDailyDetailsRows([]);
    }
  };

  const handleVerifyDayRecord = async (row) => {
    try {
      await verifyVehicleDayRecord({
        id: row.id,
        verified: 1,
        verifiedBy: userId,
      }).unwrap();
      if (dailyDetailsTarget) {
        const vehicleRef = dailyDetailsTarget?.vehicle_id || dailyDetailsTarget?.vehicle_no || dailyDetailsTarget?.vehicle;
        const rows = await fetchDailyDetails({
          yearMonth: selectedMonth,
          vehicle: vehicleRef,
        }).unwrap();
        setDailyDetailsRows(rows || []);
      }
      refetchVehicleRents();
      refetchVerificationQueue();
    } catch (error) {
      alert(error?.data?.message || 'Failed to verify record');
    }
  };

  const openEditVerifyDialog = (row) => {
    setEditVerifyTargetRow(row);
    setEditStartMeter(String(row?.start_meter ?? ''));
    setEditEndMeter(String(row?.end_meter ?? ''));
    setEditVerifyReason(String(row?.not_verified_reason ?? ''));
    setEditVerifyDialogOpen(true);
  };

  const handleEditAndVerifyDayRecord = async () => {
    if (!editVerifyTargetRow?.id) return;
    if (!String(editStartMeter).trim() || !String(editEndMeter).trim()) return;
    try {
      await verifyVehicleDayRecord({
        id: editVerifyTargetRow.id,
        verified: 1,
        verifiedBy: userId,
        start_meter: Number(editStartMeter),
        end_meter: Number(editEndMeter),
        verification_reason: String(editVerifyReason || '').trim() || null,
      }).unwrap();
      if (dailyDetailsTarget) {
        const vehicleRef = dailyDetailsTarget?.vehicle_id || dailyDetailsTarget?.vehicle_no || dailyDetailsTarget?.vehicle;
        const rows = await fetchDailyDetails({
          yearMonth: selectedMonth,
          vehicle: vehicleRef,
        }).unwrap();
        setDailyDetailsRows(rows || []);
      }
      refetchVehicleRents();
      refetchVerificationQueue();
      setEditVerifyDialogOpen(false);
      setEditVerifyTargetRow(null);
      setEditStartMeter('');
      setEditEndMeter('');
      setEditVerifyReason('');
    } catch (error) {
      alert(error?.data?.message || 'Failed to edit and verify record');
    }
  };

  // Filter vehicle rents (client-side search + vehicle dropdown)
  const filteredVehicleRents = useMemo(() => {
    const q = String(searchTerm || '').trim().toLowerCase();
    return pendingVehicleRents.filter((rent) => {
      const matchesSearch =
        !q ||
        String(rent.vehicle_no || rent.vehicle || '').toLowerCase().includes(q) ||
        String(rent.driver_name || '').toLowerCase().includes(q);
      const matchesVehicle =
        !vehicleFilter || (rent.vehicle_no || rent.vehicle) === vehicleFilter;
      return matchesSearch && matchesVehicle;
    });
  }, [pendingVehicleRents, searchTerm, vehicleFilter]);

  /** Daily queue API has no text search; narrow by vehicle / make / model in the UI */
  const filteredDailyVerificationRows = useMemo(() => {
    const q = String(searchTerm || '').trim().toLowerCase();
    if (!q) return dailyVerificationRows;
    return dailyVerificationRows.filter((row) => {
      const vn = String(row.vehicle_no || row.vehicle || '').toLowerCase();
      const meta = `${row.make || ''} ${row.model || ''}`.toLowerCase();
      return vn.includes(q) || meta.includes(q);
    });
  }, [dailyVerificationRows, searchTerm]);

  // Extract unique vehicles using vehicle_no (preferred) or vehicle as fallback
  const uniqueVehicles = [...new Set(
    pendingVehicleRents
      .map(r => r.vehicle_no || r.vehicle)
      .filter(Boolean)
  )].sort();

  const formatVehicleDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const raw = String(dateString).trim();
      const normalizedInput = raw.includes('T') ? raw : `${raw}T00:00:00`;
      const date = new Date(normalizedInput);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (value) => `LKR ${Number(value || 0).toFixed(2)}`;

  const renderRentCalculationTooltip = (rent) => {
    const monthlyRate = Number(rent?.monthly_rate || 0);
    const totalDays = Number(rent?.total_days || 0);
    const workingDaysRaw = rent?.working_days;
    const workingDays = workingDaysRaw == null || workingDaysRaw === '' ? null : Number(workingDaysRaw);
    const totalKm = Number(rent?.total_km || 0);
    const kmLimit = Number(rent?.km_limit || 0);
    const extraKm = Number(
      rent?.extra_km != null ? rent.extra_km : Math.max(totalKm - kmLimit, 0)
    ) || 0;
    const ratePerKm = Number(rent?.rate_per_km || 0);
    const extraCharge = Number((extraKm * ratePerKm).toFixed(2));
    const grossRent = Number(rent?.monthly_rent || 0);
    const advanceDeduction = Number(rent?.advance_paid_total || 0);
    const netPayable = Number(rent?.net_monthly_rent ?? grossRent);

    return (
      <Box sx={{ p: 0.5, minWidth: 260 }}>
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
          Rent calculation
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          Configured monthly rate: {formatCurrency(monthlyRate)}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          Verified days: {totalDays}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          Configured working days: {workingDays == null || Number.isNaN(workingDays) ? '-' : workingDays}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          Total KM: {totalKm.toFixed(1)} | Limit: {kmLimit.toFixed(1)}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          Extra KM x Rate/KM: {extraKm.toFixed(1)} x {formatCurrency(ratePerKm)} = {formatCurrency(extraCharge)}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          Gross rent (after day/KM rules): {formatCurrency(grossRent)}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          Advance deduction: {formatCurrency(advanceDeduction)}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
          Net payable: {formatCurrency(netPayable)}
        </Typography>
      </Box>
    );
  };

  const shellSx = embedded
    ? { p: '6px', m: 0, backgroundColor: 'transparent', minHeight: 'auto' }
    : { p: { xs: 2, sm: 3 }, backgroundColor: '#f3f7fb', minHeight: '100vh' };

  if (vehicleRentLoading || verificationQueueLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={embedded ? 220 : 400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="vehicle-rent-approvals-container" sx={shellSx}>
      {/* Filters */}
      <Card 
        className="vehicle-rent-approvals-filter-card"
        sx={{ 
          mb: 1.5,
          p: 1.6,
          boxShadow: 'none',
          borderRadius: 2,
          background: 'linear-gradient(180deg, #fdfefe 0%, #f6fbff 100%)',
          border: '1px solid #d9e5ef'
        }}
      >
        <Box sx={{ mb: 1.25, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <FilterList sx={{ color: 'primary.main', fontSize: 18 }} />
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a202c' }}>
            Search & Filter
          </Typography>
        </Box>
        <Grid container spacing={1.25} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl 
              fullWidth 
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
            >
              <InputLabel>Select Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Select Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
                MenuProps={selectMenuPropsAboveHostOverlay}
                startAdornment={
                  <InputAdornment position="start" sx={{ ml: 1 }}>
                    <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                }
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl 
              fullWidth 
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                MenuProps={selectMenuPropsAboveHostOverlay}
              >
                <MenuItem value="p">Pending</MenuItem>
                <MenuItem value="a">Approved</MenuItem>
                <MenuItem value="d">Declined</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ position: 'relative', zIndex: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by vehicle number or driver name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                position: 'relative',
                zIndex: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl 
              fullWidth 
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
            >
              <InputLabel>Filter by Vehicle</InputLabel>
              <Select
                value={vehicleFilter}
                label="Filter by Vehicle"
                onChange={(e) => setVehicleFilter(e.target.value)}
                MenuProps={selectMenuPropsAboveHostOverlay}
                startAdornment={
                  <InputAdornment position="start" sx={{ ml: 1 }}>
                    <DirectionsCar sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Vehicles</MenuItem>
                {uniqueVehicles.map((vehicle) => (
                  <MenuItem key={vehicle} value={vehicle}>
                    {vehicle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 2 }} sx={{ display: 'flex', gap: 0.75, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Tooltip title="Refresh Data" slotProps={popperAboveHostOverlaySlotProps}>
              <IconButton 
                onClick={() => {
                  refetchVehicleRents();
                  refetchVerificationQueue();
                }} 
                color="primary"
                size="small"
                sx={{ 
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            {(searchTerm || vehicleFilter || selectedMonth !== months[0]?.value || statusFilter !== 'p') ? (
              <Tooltip title="Clear Filters" slotProps={popperAboveHostOverlaySlotProps}>
                <IconButton 
                  onClick={() => {
                    setSearchTerm('');
                    setVehicleFilter('');
                    setStatusFilter('p');
                    const now = new Date();
                    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
                  }}
                  size="small"
                  sx={{ 
                    backgroundColor: 'error.light',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'error.main',
                    },
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  <Cancel />
                </IconButton>
              </Tooltip>
            ) : null}
          </Grid>
        </Grid>
      </Card>

      <Alert severity="info" sx={{ mb: 1.5, border: '1px solid #d6e8f4', borderRadius: 2 }}>
        Base rent is prorated by verified days vs configured working days for each vehicle.
      </Alert>

      <Card sx={{ mb: 2, boxShadow: 'none', border: '1px solid #d9e5ef', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Daily Verification Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            HR must verify each day record first. Monthly rent rows are calculated from verified records.
          </Typography>
        </Box>
        {filteredDailyVerificationRows.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {dailyVerificationRows.length === 0
                ? 'No day records found for selected filters'
                : 'No day records match your search. Try another vehicle or clear the search box.'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Meter</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Meter</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Image</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Image</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDailyVerificationRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatVehicleDate(row.date)}</TableCell>
                    <TableCell>{row.vehicle_no || row.vehicle || '-'}</TableCell>
                    <TableCell>{row.start_meter || '-'}</TableCell>
                    <TableCell>{row.end_meter || '-'}</TableCell>
                    <TableCell>
                      {nonEmptySrc(row.start_image_url) ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => openImageDialog(row.start_image_url, `Start Meter - ${formatVehicleDate(row.date)}`)}
                          sx={{ textTransform: 'none' }}
                        >
                          View
                        </Button>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {nonEmptySrc(row.end_image_url) ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => openImageDialog(row.end_image_url, `End Meter - ${formatVehicleDate(row.date)}`)}
                          sx={{ textTransform: 'none' }}
                        >
                          View
                        </Button>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {Number(row.verified) === 1 ? 'Verified' : Number(row.verified) === 0 ? 'Not Verified' : 'Pending'}
                    </TableCell>
                    <TableCell>{row.not_verified_reason || '-'}</TableCell>
                    <TableCell>
                      {Number(row.verified) === 1 ? (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            disabled={isVerifyingDay}
                            onClick={() => handleVerifyDayRecord(row)}
                            sx={{ textTransform: 'none' }}
                          >
                            Verify
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            disabled={isVerifyingDay}
                            onClick={() => openEditVerifyDialog(row)}
                            sx={{ textTransform: 'none' }}
                          >
                            Edit
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Vehicle Rent Table */}
      {filteredVehicleRents.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', boxShadow: 'none', border: '1px solid #d9e5ef', borderRadius: 2 }}>
          <DirectionsCar sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {statusFilter === 'p' ? 'No pending vehicle rent approvals' : 
             statusFilter === 'a' ? 'No approved vehicle rent records' :
             statusFilter === 'd' ? 'No declined vehicle rent records' :
             'No vehicle rent records found'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pendingVehicleRents.length === 0 
              ? 'Try adjusting your filters or select a different month'
              : 'Try adjusting your filters'}
          </Typography>
        </Card>
      ) : (
        <Card sx={{ boxShadow: 'none', border: '1px solid #d9e5ef', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date Range</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Days</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total KM</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rent (Net)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Advance (Month)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Approved By</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVehicleRents.map((rent) => (
                  <TableRow 
                    key={rent.id} 
                    hover
                    sx={{ 
                      '&:hover': { backgroundColor: '#f8f9fa' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>{rent.month_key || '-'}</TableCell>
                    <TableCell>{formatVehicleDate(rent.start_date)} - {formatVehicleDate(rent.end_date)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {rent.vehicle_no || rent.vehicle}
                        </Typography>
                        {(rent.make || rent.model) && (
                          <Typography variant="caption" color="text.secondary">
                            {rent.make} {rent.model}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{rent.driver_name || 'N/A'}</TableCell>
                    <TableCell>{rent.total_days || 0}</TableCell>
                    <TableCell>{Number(rent.total_km || 0).toFixed(1)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {formatCurrency(rent.net_monthly_rent ?? rent.monthly_rent)}
                        </Typography>
                        <Tooltip
                          title={renderRentCalculationTooltip(rent)}
                          arrow
                          placement="top"
                          slotProps={popperAboveHostOverlaySlotProps}
                        >
                          <IconButton size="small" sx={{ p: 0.25, color: 'info.main' }}>
                            <HelpOutline sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {Number(rent.advance_paid_total || 0) > 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          Base {formatCurrency(rent.monthly_rent)} - Advance {formatCurrency(rent.advance_paid_total)}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell sx={{ color: Number(rent.advance_paid_total || 0) > 0 ? 'error.main' : 'text.secondary', fontWeight: 600 }}>
                      {formatCurrency(rent.advance_paid_total || 0)}
                    </TableCell>
                    <TableCell>
                      {rent.approval === 'p' ? (
                        <Chip
                          icon={<Pending />}
                          label="Pending"
                          color="warning"
                          size="small"
                        />
                      ) : rent.approval === 'a' ? (
                        <Chip
                          icon={<Done />}
                          label="Approved"
                          color="success"
                          size="small"
                        />
                      ) : rent.approval === 'd' ? (
                        <Chip
                          icon={<Close />}
                          label="Declined"
                          color="error"
                          size="small"
                        />
                      ) : (
                        <Chip
                          label={rent.approval || 'Unknown'}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {rent.approval === 'p' ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          -
                        </Typography>
                      ) : (
                        <Chip 
                          label={rent.approved_by_name || 'N/A'} 
                          size="small"
                          color={rent.approval === 'a' ? 'success' : 'error'}
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {rent.approval === 'p' ? (
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => openDailyDetailsDialog(rent)}
                            sx={{ textTransform: 'none', fontWeight: 500, width: '100%' }}
                          >
                            View
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => openApproveDialog(rent)}
                            disabled={isApprovingVehicle}
                            sx={{ textTransform: 'none', fontWeight: 500, width: '100%' }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Cancel />}
                            onClick={() => openVehicleRentRejectDialog(rent)}
                            disabled={isApprovingVehicle}
                            sx={{ textTransform: 'none', fontWeight: 500, width: '100%' }}
                          >
                            Decline
                          </Button>
                        </Box>
                      ) : (
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => openDailyDetailsDialog(rent)}
                            sx={{ textTransform: 'none', fontWeight: 500, width: '100%' }}
                          >
                            View
                          </Button>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                            {rent.approval === 'a' ? 'Approved & Billed' : rent.approval === 'd' ? 'Declined' : 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Vehicle Rent Rejection Dialog */}
      <Dialog 
        open={vehicleRentDialog} 
        onClose={() => setVehicleRentDialog(false)} 
        maxWidth="sm" 
        fullWidth
        slotProps={nestedDialogSlotProps}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Cancel color="error" />
            <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
              Decline Vehicle Rent Request
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom color="text.secondary">
            Are you sure you want to decline this vehicle rent request?
          </Typography>
          {selectedVehicleRent && (
            <Card sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Month:</strong> {selectedVehicleRent.month_key || '-'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Vehicle:</strong> {selectedVehicleRent.vehicle_no || selectedVehicleRent.vehicle}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Driver:</strong> {selectedVehicleRent.driver_name || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Rent:</strong> LKR {Number(selectedVehicleRent.monthly_rent || 0).toFixed(2)}
              </Typography>
            </Card>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Decline Reason (Optional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            margin="normal"
            placeholder="Enter reason for declining..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={() => setVehicleRentDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRejectVehicleRent} 
            color="error" 
            variant="contained" 
            disabled={isApprovingVehicle}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            {isApprovingVehicle ? <CircularProgress size={20} /> : 'Decline'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Daily Details Dialog */}
      <Dialog
        open={dailyDetailsDialog}
        onClose={() => setDailyDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
        slotProps={nestedDialogSlotProps}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            minHeight: 480,
            maxHeight: '86vh',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5, borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Visibility color="info" />
              <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
                Daily Usage Details
              </Typography>
            </Box>
            <Chip
              label={`${dailyDetailsRows.length} records`}
              size="small"
              color="info"
              variant="outlined"
            />
          </Box>
          {dailyDetailsTarget && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {(dailyDetailsTarget.vehicle_no || dailyDetailsTarget.vehicle || 'Vehicle')} - {selectedMonth}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 2, backgroundColor: '#ffffff' }}>
          {loadingDailyDetails ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
              <CircularProgress size={30} />
            </Box>
          ) : dailyDetailsRows.length === 0 ? (
            <Alert severity="info">No day-by-day records found for this month and vehicle.</Alert>
          ) : (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                mt: 0.5,
                borderRadius: 2,
                borderColor: '#e5e7eb',
                maxHeight: '58vh',
                overflow: 'auto',
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>Start Meter</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>End Meter</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>Start Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>End Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>Daily KM</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>Start Image</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>End Image</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>Verify</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dailyDetailsRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{formatVehicleDate(row.date)}</TableCell>
                      <TableCell>{row.start_meter || '-'}</TableCell>
                      <TableCell>{row.end_meter || '-'}</TableCell>
                      <TableCell>{row.start_time || '-'}</TableCell>
                      <TableCell>{row.end_time || '-'}</TableCell>
                      <TableCell>{formatDuration(row.duration_minutes)}</TableCell>
                      <TableCell>{Number(row.daily_km || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {nonEmptySrc(row.start_image_url) ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => openImageDialog(row.start_image_url, `Start Meter - ${formatVehicleDate(row.date)}`)}
                            sx={{ textTransform: 'none' }}
                          >
                            View
                          </Button>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {nonEmptySrc(row.end_image_url) ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => openImageDialog(row.end_image_url, `End Meter - ${formatVehicleDate(row.date)}`)}
                            sx={{ textTransform: 'none' }}
                          >
                            View
                          </Button>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {Number(row.verified) === 1 ? 'Verified' : Number(row.verified) === 0 ? 'Not Verified' : 'Pending'}
                      </TableCell>
                      <TableCell>
                        {Number(row.verified) === 1 ? (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              disabled={isVerifyingDay}
                              onClick={() => handleVerifyDayRecord(row)}
                              sx={{ textTransform: 'none' }}
                            >
                              Verify
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              disabled={isVerifyingDay}
                              onClick={() => openEditVerifyDialog(row)}
                              sx={{ textTransform: 'none' }}
                            >
                              Edit
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
          <Button onClick={() => setDailyDetailsDialog(false)} variant="contained" sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle Rent Approval Dialog */}
      <Dialog
        open={approveDialog}
        onClose={() => setApproveDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={nestedDialogSlotProps}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
              Approve Vehicle Rent
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {approveTarget && (
            <Card sx={{ mt: 1, p: 2, backgroundColor: '#f8f9fa' }}>
              <Typography variant="body2">
                <strong>Date Range:</strong>{' '}
                {approveTarget.start_date && approveTarget.end_date
                  ? `${formatVehicleDate(approveTarget.start_date)} - ${formatVehicleDate(approveTarget.end_date)}`
                  : (approveTarget.month_key || 'N/A')}
              </Typography>
              <Typography variant="body2"><strong>Vehicle:</strong> {approveTarget.vehicle_no || approveTarget.vehicle}</Typography>
              <Typography variant="body2"><strong>Driver:</strong> {approveTarget.driver_name || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Base Rent:</strong> {formatCurrency(approveTarget.monthly_rent)}</Typography>
              <Typography variant="body2"><strong>Advance Deduction:</strong> {formatCurrency(approveTarget.advance_paid_total)}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                <strong>Net Payable:</strong> {formatCurrency(approveTarget.net_monthly_rent ?? approveTarget.monthly_rent)}
              </Typography>
              {Number(approveTarget.advance_paid_total || 0) > 0 ? (
                <Alert severity="info" sx={{ mt: 1 }}>
                  This month has {Number(approveTarget.advance_paid_count || 0)} paid advance payment(s). Finance should pay only net payable amount.
                </Alert>
              ) : null}
            </Card>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Approval Note (Optional)"
            value={approveBillNote}
            onChange={(e) => setApproveBillNote(e.target.value)}
            margin="normal"
            placeholder="Enter approval note..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setApproveDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleApproveVehicleRent}
            color="success"
            variant="contained"
            disabled={isApprovingVehicle}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            {isApprovingVehicle ? <CircularProgress size={20} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editVerifyDialogOpen}
        onClose={() => setEditVerifyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={nestedDialogSlotProps}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit and Verify Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Update meter values and add edit reason, then submit as verified.
          </Typography>
          <TextField
            fullWidth
            label="Start Meter"
            value={editStartMeter}
            onChange={(e) => setEditStartMeter(e.target.value)}
            type="number"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="End Meter"
            value={editEndMeter}
            onChange={(e) => setEditEndMeter(e.target.value)}
            type="number"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Edit Reason"
            value={editVerifyReason}
            onChange={(e) => setEditVerifyReason(e.target.value)}
            placeholder="Why this was adjusted..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditVerifyDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleEditAndVerifyDayRecord}
            color="success"
            variant="contained"
            disabled={
              isVerifyingDay ||
              !String(editStartMeter || '').trim() ||
              !String(editEndMeter || '').trim()
            }
            sx={{ textTransform: 'none' }}
          >
            {isVerifyingDay ? <CircularProgress size={18} /> : 'Submit Verified'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image View Dialog - Full Screen — above Transport HR overlay */}
      <Dialog
        open={imageDialog.open}
        onClose={closeImageDialog}
        fullScreen
        slotProps={{
          root: {
            sx: { zIndex: NESTED_OVERLAY_Z_INDEX + 1 },
          },
        }}
        PaperProps={{
          sx: { 
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            m: 0,
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            p: 2,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography component="span" variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            {imageDialog.title}
          </Typography>
          <IconButton 
            onClick={closeImageDialog} 
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s ease',
            }}
            size="large"
          >
            <Cancel fontSize="large" />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            p: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 80px)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              p: 2,
            }}
          >
            {nonEmptySrc(imageDialog.imageUrl) ? (
              <img
                src={nonEmptySrc(imageDialog.imageUrl)}
                alt={imageDialog.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            ) : null}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VehicleRentApprovals;
