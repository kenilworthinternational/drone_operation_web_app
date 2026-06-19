export function formatVehicleOwnershipLabel(ownership) {
  return String(ownership || 'o').trim().toLowerCase() === 'r' ? 'Rented' : 'KWIL';
}

export function formatVehicleOwnershipFromRecord(record) {
  const ownership = record?.ownership ?? record?.vehicle_ownership ?? 'o';
  return formatVehicleOwnershipLabel(ownership);
}
