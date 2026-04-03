import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Box,
  Button,
  Card,
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
import Download from '@mui/icons-material/Download';
import { useGetLeaveDaysForHrQuery } from '../../../api/services NodeJs/vehicleRentApi';

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

function toDateOnly(value) {
  if (!value) return '';
  const parsed = value instanceof Date ? value : (() => {
    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    return new Date(text.includes('T') ? text : `${text}T00:00:00`);
  })();
  if (typeof parsed === 'string') return parsed;
  if (Number.isNaN(parsed.getTime())) return String(value);
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Transport HR detail overlay uses z-index 3000; MUI Select menus default ~1300 */
const Z_ABOVE_HOST_OVERLAY = 3500;
const selectMenuPropsAboveHostOverlay = {
  slotProps: {
    root: { sx: { zIndex: Z_ABOVE_HOST_OVERLAY } },
    paper: { sx: { zIndex: Z_ABOVE_HOST_OVERLAY } },
  },
};

const DriverLeaveDatesHr = ({ embedded = false }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const monthOptions = useMemo(() => getRollingMonthOptions(24), []);

  const { data: rows = [], isLoading } = useGetLeaveDaysForHrQuery({ yearMonth: selectedMonth });

  const selectedMonthLabel =
    monthOptions.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  const formatDisplayDate = (value) => {
    if (!value) return '-';
    const parsed = value instanceof Date ? value : new Date(String(value).trim());
    if (Number.isNaN(parsed.getTime())) return String(value);
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDownloadExcel = () => {
    if (!rows.length) return;
    const flat = rows.map((r) => ({
      'Year-Month': selectedMonth,
      Month: selectedMonthLabel,
      'Leave date': toDateOnly(r.leave_date),
      Driver: r.requested_by_name || '',
      'Vehicle no': r.vehicle_no || '',
      Reason: r.reason || '',
      'Record ID': r.id,
    }));
    const worksheet = XLSX.utils.json_to_sheet(flat);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave dates');
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Driver_leave_dates_${selectedMonth}_${stamp}.xlsx`);
  };

  const shellSx = embedded
    ? { p: '5px', m: '5px', backgroundColor: 'transparent', minHeight: 'auto' }
    : { p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' };

  return (
    <Box sx={shellSx}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, m: 0 }}>
          Driver Leave Dates (HR)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', ml: 'auto' }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="driver-leave-hr-month-label">Month</InputLabel>
            <Select
              labelId="driver-leave-hr-month-label"
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
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadExcel}
            disabled={!rows.length || isLoading}
            sx={{ textTransform: 'none' }}
          >
            Download Excel
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card elevation={embedded ? 0 : 1} sx={{ border: embedded ? '1px solid #e5e7eb' : undefined }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Leave Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Driver</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{formatDisplayDate(r.leave_date)}</TableCell>
                    <TableCell>{r.requested_by_name || '-'}</TableCell>
                    <TableCell>{r.vehicle_no || '-'}</TableCell>
                    <TableCell>{r.reason || '-'}</TableCell>
                  </TableRow>
                ))}
                {!rows.length ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No leave dates for {selectedMonthLabel}.
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

export default DriverLeaveDatesHr;
