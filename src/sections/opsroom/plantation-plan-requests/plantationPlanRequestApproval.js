/**
 * Shared approve/decline helpers for plantation calendar plan requests.
 */

/** Original plan slots requested (immutable after submit); falls back to plan_count for older rows. */
export function originalRequestedSlots(row) {
  if (row == null) return 0;
  const raw =
    row.requested_plan_count != null && row.requested_plan_count !== ''
      ? row.requested_plan_count
      : row.plan_count;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDropdownList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object' && (raw.status === 'true' || raw.status === true)) {
    return Object.keys(raw)
      .filter((k) => !isNaN(Number(k)) && k !== 'status' && k !== 'count')
      .map((k) => raw[k]);
  }
  if (typeof raw === 'object') {
    return Object.keys(raw)
      .filter((k) => !isNaN(Number(k)))
      .map((k) => raw[k]);
  }
  return [];
}

export function buildMissionLabel(missionTypes, idOrCode) {
  const key = String(idOrCode ?? '');
  const list = normalizeDropdownList(missionTypes);
  const m = list.find(
    (x) =>
      String(x.id) === key ||
      String(x.mission_type_code ?? '').toLowerCase() === key.toLowerCase()
  );
  const code = String(m?.mission_type_code || m?.mission_type || key).toLowerCase();
  if (code === 'spy') return 'Spray';
  if (code === 'spd') return 'Spread';
  return m?.mission_type_name || m?.mission_type || idOrCode || '—';
}

export function buildCropLabel(cropTypes, id) {
  const list = normalizeDropdownList(cropTypes);
  const c = list.find((x) => String(x.id) === String(id));
  return c?.crop || c?.name || (id != null ? `#${id}` : 'N/A');
}

/** Map Node API row to legacy ad-hoc tile shape for RequestsQueue / RequestProceed. */
export function mapPlantationRowToAdhocTile(row, { missionTypes = [], cropTypes = [] } = {}) {
  if (!row) return null;
  const picked = String(row.picked_date || '').slice(0, 10);
  const slots = originalRequestedSlots(row);
  return {
    request_id: row.id,
    id: row.id,
    status: 'p',
    estate: row.estate_name || (row.estate_id != null ? `Estate #${row.estate_id}` : 'N/A'),
    estate_id: row.estate_id,
    estate_name: row.estate_name,
    estateId: row.estate_id,
    crop: buildCropLabel(cropTypes, row.crop_type_id),
    crop_type_id: row.crop_type_id,
    mission_type: buildMissionLabel(missionTypes, row.mission_type_id),
    mission_type_id: row.mission_type_id,
    dates: picked,
    picked_date: picked,
    requested_plan_count: slots,
    plan_count: row.plan_count,
    group_id: row.group_id,
    region_id: row.region_id,
    plantation_id: row.plantation_id,
    requester_name: row.requester_name,
    _plantationRow: row,
  };
}

export function missionCodeLabel(code) {
  const c = String(code || '').toLowerCase();
  if (c === 'spy') return 'Spray';
  if (c === 'spd') return 'Spread';
  return c || '—';
}

/**
 * Approve via Node API (creates plans flag=ap server-side, then marks request approved).
 * @returns {{ ok: boolean, created: number, expected: number, createdPlanIds?: number[], error?: string }}
 */
export async function approvePlantationPlanRequest({
  row,
  planCount,
  pickedDate,
  approveMutation,
}) {
  const id = row.id;
  const n = parseInt(planCount, 10) || 0;
  if (!Number.isFinite(n) || n < 1 || n > 100) {
    return { ok: false, created: 0, expected: n, error: 'Plan count must be between 1 and 100.' };
  }

  const dateStr = String(pickedDate || row.picked_date || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { ok: false, created: 0, expected: n, error: 'A valid plan date is required.' };
  }

  try {
    const result = await approveMutation({ id, planCount: n, pickedDate: dateStr }).unwrap();
    const data = result?.data ?? result;
    const created = data?.plansCreated ?? n;
    const createdPlanIds = Array.isArray(data?.createdPlanIds) ? data.createdPlanIds : [];
    return { ok: true, created, expected: n, createdPlanIds, pickedDate: dateStr };
  } catch (e) {
    const detail = e?.data?.message || e?.message || 'Approval failed';
    return { ok: false, created: 0, expected: n, error: detail };
  }
}

export async function declinePlantationPlanRequest({ id, declineMutation, declineReason = '' }) {
  await declineMutation({ id, declineReason }).unwrap();
  return { ok: true };
}
