import React, { useState, useMemo } from 'react';
import {
  useGetApprovedForFinanceQuery,
  useGetMonthlySummaryByVehicleQuery,
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
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
} from '@mui/material';
import {
  DirectionsCar,
  CalendarToday,
  TrendingUp,
  Refresh,
  Download,
  FilterList,
  Visibility,
  Cancel,
} from '@mui/icons-material';
import '../../../styles/vehicleRent.css';

const VehicleRent = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [tabValue, setTabValue] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [imageDialog, setImageDialog] = useState({ open: false, imageUrl: '', title: '' });

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

  // Queries
  const { 
    data: approvedData = [], 
    isLoading: approvedLoading, 
    error: approvedError,
    refetch: refetchApproved 
  } = useGetApprovedForFinanceQuery({ yearMonth: selectedMonth, vehicle: selectedVehicle || undefined });

  const { 
    data: monthlySummary = [], 
    isLoading: summaryLoading, 
    error: summaryError,
    refetch: refetchSummary 
  } = useGetMonthlySummaryByVehicleQuery({ yearMonth: selectedMonth });

  // Filter approved data by vehicle if selected (using vehicle_no)
  const filteredApprovedData = useMemo(() => {
    if (!selectedVehicle) return approvedData;
    return approvedData.filter(item => 
      (item.vehicle_no || item.vehicle) === selectedVehicle
    );
  }, [approvedData, selectedVehicle]);

  // Get unique vehicles from approved data (prioritize vehicle_no)
  const uniqueVehicles = useMemo(() => {
    const vehicles = new Set();
    approvedData.forEach(item => {
      const vehicleNo = item.vehicle_no || item.vehicle;
      if (vehicleNo) vehicles.add(vehicleNo);
    });
    return Array.from(vehicles).sort();
  }, [approvedData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDays = filteredApprovedData.length;
    const uniqueVehiclesCount = new Set(filteredApprovedData.map(item => item.vehicle_no || item.vehicle)).size;
    const totalVehiclesInMonth = monthlySummary.length;
    const totalApprovedDays = monthlySummary.reduce((sum, item) => sum + (item.approved_days || 0), 0);

    return {
      totalDays,
      uniqueVehiclesCount,
      totalVehiclesInMonth,
      totalApprovedDays,
    };
  }, [filteredApprovedData, monthlySummary]);

  const formatDate = (dateString) => {
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

  const handleRefresh = () => {
    refetchApproved();
    refetchSummary();
  };

  const openImageDialog = (imageUrl, title) => {
    setImageDialog({ open: true, imageUrl, title });
  };

  const closeImageDialog = () => {
    setImageDialog({ open: false, imageUrl: '', title: '' });
  };

  if (approvedLoading || summaryLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (approvedError || summaryError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading data: {approvedError?.message || summaryError?.message || 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="vehicle-rent-container" sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a202c', mb: 1 }}>
            Vehicle Rent Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage approved vehicle rent records by month
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} color="primary" sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filters */}
      <Card 
        className="vehicle-rent-filter-card"
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
            Filters
          </Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={5}>
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
          <Grid item xs={12} sm={6} md={5}>
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
                value={selectedVehicle}
                label="Filter by Vehicle"
                onChange={(e) => setSelectedVehicle(e.target.value)}
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
            {(selectedVehicle || selectedMonth !== months[0]?.value) ? (
              <Tooltip title="Clear Filters">
                <IconButton 
                  onClick={() => {
                    setSelectedVehicle('');
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

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="vehicle-rent-stats-card" sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Total Days
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.totalDays}
                </Typography>
              </Box>
              <CalendarToday sx={{ fontSize: 40, opacity: 0.3 }} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="vehicle-rent-stats-card" sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white', 
            boxShadow: '0 4px 12px rgba(245, 87, 108, 0.4)'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Vehicles Used
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.uniqueVehiclesCount}
                </Typography>
              </Box>
              <DirectionsCar sx={{ fontSize: 40, opacity: 0.3 }} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="vehicle-rent-stats-card" sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            color: 'white', 
            boxShadow: '0 4px 12px rgba(79, 172, 254, 0.4)'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Total Vehicles
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.totalVehiclesInMonth}
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.3 }} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="vehicle-rent-stats-card" sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
            color: 'white', 
            boxShadow: '0 4px 12px rgba(67, 233, 123, 0.4)'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Approved Days
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.totalApprovedDays}
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.3 }} />
            </Box>
          </Card>
        </Grid>
      </Grid>

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
          <Tab icon={<DirectionsCar />} iconPosition="start" label="Vehicle Summary" />
          <Tab icon={<CalendarToday />} iconPosition="start" label="Daily Records" />
        </Tabs>
      </Card>

      {/* Vehicle Summary Tab */}
      {tabValue === 0 && (
        <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {monthlySummary.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <DirectionsCar sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No vehicle data for selected month
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Make & Model</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Total Days</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Approved Days</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>First Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlySummary.map((summary, index) => (
                    <TableRow 
                      key={`${summary.vehicle_no || summary.vehicle}-${index}`}
                      hover
                      sx={{ 
                        '&:hover': { backgroundColor: '#f8f9fa' },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {summary.vehicle_no || summary.vehicle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {summary.make || 'N/A'} {summary.model || ''}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={summary.total_days || 0} 
                          color="primary" 
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={summary.approved_days || 0} 
                          color="success" 
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(summary.first_date)}</TableCell>
                      <TableCell>{formatDate(summary.last_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* Daily Records Tab */}
      {tabValue === 1 && (
        <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {filteredApprovedData.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No approved records for selected filters
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Make & Model</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Start Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>End Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Start Meter</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>End Meter</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Start Image</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>End Image</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Approved By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApprovedData.map((record) => (
                    <TableRow 
                      key={record.id}
                      hover
                      sx={{ 
                        '&:hover': { backgroundColor: '#f8f9fa' },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {record.vehicle_no || record.vehicle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.make || 'N/A'} {record.model || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>{record.driver_name || 'N/A'}</TableCell>
                      <TableCell>{record.start_time || 'N/A'}</TableCell>
                      <TableCell>{record.end_time || 'N/A'}</TableCell>
                      <TableCell>{record.start_meter || 'N/A'}</TableCell>
                      <TableCell>{record.end_meter || 'N/A'}</TableCell>
                      <TableCell>
                        {record.start_image_url || record.start_image ? (
                          <Tooltip title="View Start Image">
                            <IconButton
                              size="small"
                              onClick={() => openImageDialog(
                                record.start_image_url || `https://drone-admin-test.kenilworthinternational.com/storage/image/vehicle_day/${record.start_image}`,
                                `Start Meter - ${record.vehicle_no || record.vehicle}`
                              )}
                            >
                              <Visibility fontSize="small" color="primary" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {record.end_image_url || record.end_image ? (
                          <Tooltip title="View End Image">
                            <IconButton
                              size="small"
                              onClick={() => openImageDialog(
                                record.end_image_url || `https://drone-admin-test.kenilworthinternational.com/storage/image/vehicle_day/${record.end_image}`,
                                `End Meter - ${record.vehicle_no || record.vehicle}`
                              )}
                            >
                              <Visibility fontSize="small" color="primary" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.approved_by_name || 'N/A'} 
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

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

export default VehicleRent;
