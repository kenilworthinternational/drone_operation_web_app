export const formatVoucherDisplayDate = (value) => {
  if (!value) return '—';
  const text = String(value).trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[2]}/${match[3]}/${match[1]}`;
  const slice = text.slice(0, 10);
  const [y, m, day] = slice.split('-');
  if (y && m && day) return `${m}/${day}/${y}`;
  return slice || '—';
};

export const resolveVoucherApprovedBy = (voucher) => {
  if (voucher?.approval_mode === 'print') {
    return voucher?.physical_approved_by_name || voucher?.approved_by_name || '';
  }
  return voucher?.approved_by_display || voucher?.approved_by_name || '';
};

export const resolveVoucherApprovalType = (voucher) => {
  const mode = String(voucher?.approval_mode || '').trim().toLowerCase();
  if (mode === 'system') return 'System Approval';
  if (mode === 'print') return 'Physical Approval';
  if (voucher?.status === 'declined') {
    return voucher?.approval_mode === 'finance' ? 'Finance Declined' : 'Declined';
  }
  return '';
};

export const hasVoucherApprovalInfo = (voucher) => {
  const approvedBy = resolveVoucherApprovedBy(voucher);
  const approvalType = resolveVoucherApprovalType(voucher);
  return Boolean(approvedBy || approvalType);
};

export const resolveVoucherDriverName = (line) =>
  line?.driver_name || line?.pilot_name || line?.driver || '—';

export const groupDriverLabel = (transactions = []) => {
  const names = [...new Set(transactions.map((t) => t.driver_name).filter(Boolean))];
  if (!names.length) return '—';
  return names.join(', ');
};
