export const formatFuelEntryDate = (value) => {
  if (!value) return null;
  const normalized = String(value).includes('T') ? value : `${value}T00:00:00`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
};

export const formatFuelMoney = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const getFuelLineDisplayParts = (tx) => {
  const liters = tx?.fuel_liters ?? tx?.quantity ?? tx?.liters;
  const cost = tx?.fuel_cost ?? tx?.amount;
  const fuelDate = tx?.fuel_entry_date || tx?.date;

  return {
    fuelDate: fuelDate ? formatFuelEntryDate(fuelDate) : '—',
    liters:
      liters != null && Number.isFinite(Number(liters))
        ? Number(liters).toFixed(2)
        : '—',
    amount:
      cost != null && Number.isFinite(Number(cost))
        ? formatFuelMoney(cost)
        : '—',
  };
};

export const formatFuelVoucherDescription = (tx) => {
  if (!tx) return '-';
  if (tx.fuel_description) return tx.fuel_description;

  const liters = tx.fuel_liters ?? tx.quantity ?? tx.liters;
  const cost = tx.fuel_cost ?? tx.amount;
  const fuelDate = tx.fuel_entry_date || tx.date;
  const hasFuel =
    (tx.fuel_record_id != null && tx.fuel_record_id !== '') ||
    (tx.generator_fuel_record_id != null && tx.generator_fuel_record_id !== '');

  if (!hasFuel && liters == null && cost == null && !fuelDate) {
    return tx.description || '-';
  }

  const parts = [];
  if (fuelDate) parts.push(formatFuelEntryDate(fuelDate));
  if (liters != null && Number.isFinite(Number(liters))) {
    parts.push(`${Number(liters).toFixed(2)} L`);
  }
  if (cost != null && Number.isFinite(Number(cost))) {
    parts.push(`LKR ${Number(cost).toFixed(2)}`);
  }

  return parts.length ? parts.join(' · ') : (tx.description || '-');
};
