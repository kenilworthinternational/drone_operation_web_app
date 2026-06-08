/**
 * Shared approve/decline helpers for plantation plan reschedule requests.
 */

export function mapRescheduleRowToTile(row) {
  if (!row) return null;
  const requested = String(row.requested_picked_date || '').slice(0, 10);
  const previous = String(row.previous_picked_date || '').slice(0, 10);
  return {
    request_id: row.id,
    id: row.id,
    plan: row.plan_id,
    plan_id: row.plan_id,
    status: 'p',
    estate: row.estate_name || (row.estate_id != null ? `Estate #${row.estate_id}` : 'N/A'),
    estate_id: row.estate_id,
    estateId: row.estate_id,
    plan_date: previous,
    previous_picked_date: previous,
    previous_flag: row.previous_flag || null,
    requested_dates: requested,
    requested_picked_date: requested,
    reason: row.reason_text || '',
    requester_name: row.requester_name,
    _rescheduleRow: row,
  };
}

export async function approveRescheduleRequest({ row, pickedDate, approveMutation }) {
  const id = row?.id ?? row?.request_id;
  const dateStr = String(pickedDate || row?.requested_picked_date || '').slice(0, 10);
  if (!id) {
    return { ok: false, error: 'Request id is required.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { ok: false, error: 'A valid plan date is required.' };
  }
  await approveMutation({ id, pickedDate: dateStr }).unwrap();
  return { ok: true, planId: row.plan_id, pickedDate: dateStr };
}

export async function declineRescheduleRequest({ id, declineMutation, declineReason = '' }) {
  await declineMutation({ id, declineReason }).unwrap();
  return { ok: true };
}
