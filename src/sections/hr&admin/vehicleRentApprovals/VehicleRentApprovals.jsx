import React, { useState, useMemo } from 'react';
import {
  useGetPendingApprovalsQuery,
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
} from '@mui/icons-material';
import { getUserData } from '../../../utils/authUtils';
import '../../../styles/vehicleRentApprovals.css';

const VehicleRentApprovals = () => {
  const userData = getUserData();
  const userId = userData?.id;
  
  // Month selector - default to current month (must be declared before use in query)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Status filter - default to 'p' (pending)
  const [statusFilter, setStatusFilter] = useState('p');

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
  
  const [approveVehicleDate, { isLoading: isApprovingVehicle }] = useApproveVehicleDateMutation();
  
  const [selectedVehicleRent, setSelectedVehicleRent] = useState(null);
  const [vehicleRentDialog, setVehicleRentDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageDialog, setImageDialog] = useState({ open: false, imageUrl: '', title: '' });

  // Vehicle Rent handlers
  const handleApproveVehicleRent = async (id) => {
    try {
      await approveVehicleDate({
        id,
        status: 'a',
        approvedBy: userId,
      }).unwrap();
      refetchVehicleRents();
    } catch (error) {
      console.error('Error approving vehicle rent:', error);
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
    setImageDialog({ open: true, imageUrl, title });
  };

  const closeImageDialog = () => {
    setImageDialog({ open: false, imageUrl: '', title: '' });
  };

  // Filter vehicle rents
  const filteredVehicleRents = pendingVehicleRents.filter((rent) => {
    const matchesSearch = !searchTerm || 
      (rent.vehicle_no || rent.vehicle)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rent.driver_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = !vehicleFilter || 
      (rent.vehicle_no || rent.vehicle) === vehicleFilter;
    return matchesSearch && matchesVehicle;
  });

  // Extract unique vehicles using vehicle_no (preferred) or vehicle as fallback
  const uniqueVehicles = [...new Set(
    pendingVehicleRents
      .map(r => r.vehicle_no || r.vehicle)
      .filter(Boolean)
  )].sort();

  const formatVehicleDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00');
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

  if (vehicleRentLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="vehicle-rent-approvals-container" sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Filters */}
      <Card 
        className="vehicle-rent-approvals-filter-card"
        sx={{ 
          mb: 3, 
          p: 3, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #fafbfc)',
          border: '1px solid #e5e7eb'
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a202c' }}>
            Search & Filter
          </Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl 
              fullWidth 
              size="medium"
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl 
              fullWidth 
              size="medium"
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
              >
                <MenuItem value="p">Pending</MenuItem>
                <MenuItem value="a">Approved</MenuItem>
                <MenuItem value="d">Declined</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Search by vehicle number or driver name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl 
              fullWidth 
              size="medium"
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
          <Grid item xs={12} sm={12} md={2} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={() => refetchVehicleRents()} 
                color="primary"
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
              <Tooltip title="Clear Filters">
                <IconButton 
                  onClick={() => {
                    setSearchTerm('');
                    setVehicleFilter('');
                    setStatusFilter('p');
                    const now = new Date();
                    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
                  }}
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

      {/* Vehicle Rent Table */}
      {filteredVehicleRents.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
        <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Meter & Image</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Meter & Image</TableCell>
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
                    <TableCell>{formatVehicleDate(rent.date)}</TableCell>
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
                    <TableCell>{rent.start_time || 'N/A'}</TableCell>
                    <TableCell>{rent.end_time || 'N/A'}</TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {rent.start_meter || 'N/A'}
                        </Typography>
                        {rent.start_image_url || rent.start_image ? (
                          <Tooltip title="View Start Image">
                            <IconButton
                              size="small"
                              onClick={() => openImageDialog(
                                rent.start_image_url || `https://drone-admin-test.kenilworthinternational.com/storage/image/vehicle_day/${rent.start_image}`,
                                `Start Meter - ${rent.vehicle_no || rent.vehicle}`
                              )}
                              sx={{ 
                                backgroundColor: 'primary.light',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'primary.main',
                                },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">No Image</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {rent.end_meter || 'N/A'}
                        </Typography>
                        {rent.end_image_url || rent.end_image ? (
                          <Tooltip title="View End Image">
                            <IconButton
                              size="small"
                              onClick={() => openImageDialog(
                                rent.end_image_url || `https://drone-admin-test.kenilworthinternational.com/storage/image/vehicle_day/${rent.end_image}`,
                                `End Meter - ${rent.vehicle_no || rent.vehicle}`
                              )}
                              sx={{ 
                                backgroundColor: 'secondary.light',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'secondary.main',
                                },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">No Image</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {rent.approved === 'p' ? (
                        <Chip
                          icon={<Pending />}
                          label="Pending"
                          color="warning"
                          size="small"
                        />
                      ) : rent.approved === 'a' ? (
                        <Chip
                          icon={<Done />}
                          label="Approved"
                          color="success"
                          size="small"
                        />
                      ) : rent.approved === 'd' ? (
                        <Chip
                          icon={<Close />}
                          label="Declined"
                          color="error"
                          size="small"
                        />
                      ) : (
                        <Chip
                          label={rent.approved || 'Unknown'}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {rent.approved === 'p' ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          -
                        </Typography>
                      ) : (
                        <Chip 
                          label={rent.approved_by_name || 'N/A'} 
                          size="small"
                          color={rent.approved === 'a' ? 'success' : 'error'}
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {rent.approved === 'p' ? (
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApproveVehicleRent(rent.id)}
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
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {rent.approved === 'a' ? 'Already Approved' : rent.approved === 'd' ? 'Declined' : 'N/A'}
                        </Typography>
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
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Cancel color="error" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                <strong>Date:</strong> {formatVehicleDate(selectedVehicleRent.date)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Vehicle:</strong> {selectedVehicleRent.vehicle_no || selectedVehicleRent.vehicle}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Driver:</strong> {selectedVehicleRent.driver_name || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {selectedVehicleRent.start_time || 'N/A'} - {selectedVehicleRent.end_time || 'N/A'}
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

      {/* Image View Dialog - Full Screen */}
      <Dialog
        open={imageDialog.open}
        onClose={closeImageDialog}
        fullScreen
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
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
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
            <img
              src={imageDialog.imageUrl}
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
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VehicleRentApprovals;
