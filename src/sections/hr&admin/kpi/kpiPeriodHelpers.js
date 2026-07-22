export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function defaultPeriodKey(periodType) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (periodType === 'year') return String(y);
  if (periodType === 'quarter') return `${y}-Q${Math.floor((m - 1) / 3) + 1}`;
  return `${y}-${pad2(m)}`;
}

export function periodLabel(periodType, periodKey) {
  if (periodType === 'month') {
    const [y, mo] = String(periodKey || '').split('-');
    const d = new Date(Number(y), Number(mo) - 1, 1);
    if (Number.isNaN(d.getTime())) return periodKey;
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }
  if (periodType === 'quarter') return String(periodKey || '').replace('-', ' ');
  return periodKey;
}

export function buildMonthOptions(count = 18) {
  const options = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`);
  }
  return options;
}

export function buildQuarterOptions(count = 8) {
  const options = [];
  const now = new Date();
  let y = now.getFullYear();
  let q = Math.floor(now.getMonth() / 3) + 1;
  for (let i = 0; i < count; i += 1) {
    options.push(`${y}-Q${q}`);
    q -= 1;
    if (q < 1) {
      q = 4;
      y -= 1;
    }
  }
  return options;
}

export function buildYearOptions(count = 5) {
  const y = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => String(y - i));
}

export function buildPeriodOptions(periodType) {
  if (periodType === 'quarter') return buildQuarterOptions();
  if (periodType === 'year') return buildYearOptions();
  return buildMonthOptions();
}
