export const voucherStatusLabel = (status) => {
  const map = {
    not_create: 'Not Created',
    pending: 'Pending',
    approved: 'Approved',
    declined: 'Declined',
    finance_declined: 'Finance Declined',
  };
  return map[status] || status || 'Not Created';
};

export const getVoucherApprovedBy = (voucher) => {
  if (!voucher || voucher.status !== 'approved') return '-';
  return (
    voucher.approved_by_display
    || voucher.physical_approved_by_name
    || voucher.approved_by_name
    || '-'
  );
};

/** Who approved or declined the voucher (history tables). */
export const getVoucherDecidedBy = (voucher) => {
  if (!voucher || !['approved', 'declined'].includes(voucher.status)) return '-';
  return (
    voucher.approved_by_display
    || voucher.physical_approved_by_name
    || voucher.approved_by_name
    || '-'
  );
};

export const getVoucherApprovalTypeLabel = (voucher) => {
  const mode = String(voucher?.approval_mode || '').trim().toLowerCase();
  if (mode === 'system') return 'System';
  if (mode === 'print') return 'Physical';
  if (voucher?.status === 'pending') return 'Pending';
  if (voucher?.status === 'declined') {
    return voucher?.approval_mode === 'finance' ? 'Finance Declined' : 'Declined';
  }
  return '—';
};

export const isPdfProofUrl = (url) => String(url || '').toLowerCase().includes('.pdf');
