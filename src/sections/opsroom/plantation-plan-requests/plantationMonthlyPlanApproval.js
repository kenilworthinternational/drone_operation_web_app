/**
 * Shared helpers for monthly plantation plan request approval (flag=np).
 */

import { buildMissionLabel, buildCropLabel } from './plantationPlanRequestApproval';

export function formatTargetMonthLabel(ym) {
  if (!ym || !/^\d{4}-\d{2}$/.test(String(ym))) return ym || '—';
  const [y, m] = String(ym).split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-LK', { month: 'long', year: 'numeric' });
}

export function mapMonthlyRowToTile(row, { missionTypes = [], cropTypes = [] } = {}) {
  if (!row) return null;
  return {
    request_id: row.id,
    id: row.id,
    status: 'p',
    estate: row.estate_name || (row.estate_id != null ? `Estate #${row.estate_id}` : 'N/A'),
    estate_id: row.estate_id,
    estateId: row.estate_id,
    target_year_month: row.target_year_month,
    targetMonthLabel: formatTargetMonthLabel(row.target_year_month),
    date_count: row.date_count ?? 0,
    total_requested_lines: row.total_requested_lines ?? 0,
    total_requested_plans: row.total_requested_plans ?? 0,
    total_approved_plans: row.total_approved_plans ?? 0,
    requester_name: row.requester_name,
    group_id: row.group_id,
    region_id: row.region_id,
    plantation_id: row.plantation_id,
    _monthlyRow: row,
  };
}

export function mapMonthlyDetailLines(lines, { missionTypes = [], cropTypes = [] } = {}) {
  const rows = Array.isArray(lines) ? lines : [];
  return rows.map((line) => ({
    lineId: line.id,
    id: line.id,
    picked_date: String(line.picked_date || '').slice(0, 10),
    mission_type_id: line.mission_type_id,
    mission_label: buildMissionLabel(missionTypes, line.mission_type_id),
    crop_type_id: line.crop_type_id,
    crop_label: line.crop_name || buildCropLabel(cropTypes, line.crop_type_id),
    requested_plan_count: line.requested_plan_count ?? 0,
    approved_plan_count:
      line.approved_plan_count != null ? line.approved_plan_count : line.requested_plan_count ?? 0,
    ops_selected: line.ops_selected !== 0 && line.ops_selected !== '0',
    line_status: line.line_status || 'pending',
  }));
}

export async function approveMonthlyPlanRequest({ id, lines, approveMutation }) {
  if (!id) {
    return { ok: false, error: 'Request id is required.' };
  }
  const payload = {
    id,
    lines: (lines || []).map((l) => ({
      lineId: l.lineId ?? l.id,
      approvedPlanCount: parseInt(l.approvedPlanCount ?? l.approved_plan_count, 10) || 0,
      opsSelected: Boolean(l.opsSelected ?? l.ops_selected),
    })),
  };
  const result = await approveMutation(payload).unwrap();
  const data = result?.data ?? result;
  return {
    ok: true,
    plansCreated: data?.plansCreated ?? 0,
    status: data?.status,
  };
}

export async function declineMonthlyPlanRequest({ id, declineMutation, declineReason = '' }) {
  await declineMutation({ id, declineReason }).unwrap();
  return { ok: true };
}

/** Build bulk-approve payload from selected slot keys (`requestId:lineId:slotIndex`). */
export function buildBulkApprovePayload(requestedSlots, selectedSlotKeys) {
  const selected = selectedSlotKeys instanceof Set ? selectedSlotKeys : new Set(selectedSlotKeys || []);
  if (!selected.size || !Array.isArray(requestedSlots)) {
    return { requestApprovals: [] };
  }

  const slotIndicesByLine = new Map();
  const linesByRequest = new Map();

  for (const slot of requestedSlots) {
    const reqId = Number(slot.requestId);
    const lineId = Number(slot.lineId);
    if (!linesByRequest.has(reqId)) linesByRequest.set(reqId, new Set());
    linesByRequest.get(reqId).add(lineId);
  }

  for (const key of selected) {
    const parts = String(key).split(':');
    if (parts.length < 3) continue;
    const lineKey = `${parts[0]}:${parts[1]}`;
    const slotIndex = parseInt(parts[2], 10);
    if (!Number.isFinite(slotIndex)) continue;
    if (!slotIndicesByLine.has(lineKey)) slotIndicesByLine.set(lineKey, []);
    slotIndicesByLine.get(lineKey).push(slotIndex);
  }

  const requestApprovals = [];
  for (const [reqId, lineIdSet] of linesByRequest) {
    const lines = [...lineIdSet]
      .map((lineId) => {
        const lineKey = `${reqId}:${lineId}`;
        const slotIndices = [...new Set(slotIndicesByLine.get(lineKey) || [])].sort((a, b) => a - b);
        if (!slotIndices.length) return null;
        return {
          lineId,
          opsSelected: true,
          approvedPlanCount: slotIndices.length,
          slotIndices,
        };
      })
      .filter(Boolean);

    if (lines.length) {
      requestApprovals.push({ requestId: reqId, lines });
    }
  }

  return { requestApprovals };
}

/** Build bulk-reject payload from selected pending slot keys. */
export function buildBulkRejectPayload(requestedSlots, selectedSlotKeys) {
  const selected = selectedSlotKeys instanceof Set ? selectedSlotKeys : new Set(selectedSlotKeys || []);
  if (!selected.size || !Array.isArray(requestedSlots)) {
    return { requestRejections: [] };
  }

  const slotIndicesByLine = new Map();
  const linesByRequest = new Map();
  const slotByKey = new Map(requestedSlots.map((slot) => [slot.slotKey, slot]));

  for (const slot of requestedSlots) {
    const reqId = Number(slot.requestId);
    const lineId = Number(slot.lineId);
    if (!linesByRequest.has(reqId)) linesByRequest.set(reqId, new Set());
    linesByRequest.get(reqId).add(lineId);
  }

  for (const key of selected) {
    const slot = slotByKey.get(key);
    if (!slot || slot.slotStatus !== 'pending') continue;
    const parts = String(key).split(':');
    if (parts.length < 3) continue;
    const lineKey = `${parts[0]}:${parts[1]}`;
    const slotIndex = parseInt(parts[2], 10);
    if (!Number.isFinite(slotIndex)) continue;
    if (!slotIndicesByLine.has(lineKey)) slotIndicesByLine.set(lineKey, []);
    slotIndicesByLine.get(lineKey).push(slotIndex);
  }

  const requestRejections = [];
  for (const [reqId, lineIdSet] of linesByRequest) {
    const lines = [...lineIdSet]
      .map((lineId) => {
        const lineKey = `${reqId}:${lineId}`;
        const slotIndices = [...new Set(slotIndicesByLine.get(lineKey) || [])].sort((a, b) => a - b);
        if (!slotIndices.length) return null;
        return {
          lineId,
          rejectedPlanCount: slotIndices.length,
          slotIndices,
        };
      })
      .filter(Boolean);

    if (lines.length) {
      requestRejections.push({ requestId: reqId, lines });
    }
  }

  return { requestRejections };
}
