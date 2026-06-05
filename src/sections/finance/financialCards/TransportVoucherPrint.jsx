import React, { useMemo } from 'react';

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(String(value).includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatLkr = (value) =>
  `LKR ${(Number(value) || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TransportVoucherPrint = ({ voucher, onClose, onPrint }) => {
  const linesByCard = useMemo(() => {
    const map = new Map();
    (voucher?.lines || []).forEach((line) => {
      const key = line.card_holder || `Card #${line.card_id}`;
      if (!map.has(key)) {
        map.set(key, { card_holder: key, card_no: line.card_no_encrypted || '****', lines: [] });
      }
      map.get(key).lines.push(line);
    });
    return Array.from(map.values());
  }, [voucher]);

  const approvedBy =
    voucher?.approval_mode === 'print'
      ? voucher?.physical_approved_by_name
      : voucher?.approved_by_display || voucher?.approved_by_name;

  return (
    <div className="transport-voucher-print-overlay">
      <div className="transport-voucher-print-sheet">
        <div className="transport-voucher-print-header">
          <div>
            <h2>Fuel Transport Voucher</h2>
            <p className="transport-voucher-print-subtitle">DSMS Finance Settlement Document</p>
          </div>
          <div className="transport-voucher-print-meta">
            <div><strong>Voucher No:</strong> {voucher?.voucher_no || '-'}</div>
            <div><strong>Date:</strong> {formatDate(voucher?.created_at)}</div>
            <div><strong>Status:</strong> {voucher?.status || 'pending'}</div>
          </div>
        </div>

        <table className="transport-voucher-print-table">
          <thead>
            <tr>
              <th>Card Holder</th>
              <th>Date</th>
              <th>Time</th>
              <th>Description</th>
              <th>HR Approver</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {linesByCard.map((group) =>
              group.lines.map((line, idx) => (
                <tr key={line.line_id || `${group.card_holder}-${idx}`}>
                  {idx === 0 ? (
                    <td rowSpan={group.lines.length} className="transport-voucher-card-cell">
                      <strong>{group.card_holder}</strong>
                    </td>
                  ) : null}
                  <td>{formatDate(line.date)}</td>
                  <td>{line.time || '-'}</td>
                  <td>{line.description || '-'}</td>
                  <td>{line.approved_by_name || '-'}</td>
                  <td className="transport-voucher-amount-cell">{formatLkr(line.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="transport-voucher-total-label">Total ({voucher?.transaction_count || 0} transactions)</td>
              <td className="transport-voucher-amount-cell">{formatLkr(voucher?.total_amount)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="transport-voucher-print-footer">
          <div>
            <span className="transport-voucher-footer-label">Checked by:</span>{' '}
            {voucher?.checked_by_name || voucher?.created_by_name || 'Finance'}
          </div>
          <div>
            <span className="transport-voucher-footer-label">Approved by:</span>{' '}
            {approvedBy || '________________________'}
          </div>
        </div>

        {voucher?.notes ? (
          <div className="transport-voucher-print-notes">
            <strong>Notes:</strong> {voucher.notes}
          </div>
        ) : null}

        <div className="transport-voucher-print-actions no-print">
          <button type="button" className="btn-secondary-voucher-print" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary-voucher-print" onClick={onPrint}>
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportVoucherPrint;
