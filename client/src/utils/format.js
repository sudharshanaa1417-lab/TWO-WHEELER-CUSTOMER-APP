export function formatINR(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export function normalizeVehicleNumber(raw = '') {
  return String(raw)
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatShortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function estimateTenureMonths(financeAmount, monthlyPayment) {
  const f = Number(financeAmount) || 0;
  const m = Number(monthlyPayment) || 0;
  if (f <= 0 || m <= 0) return null;
  return Math.max(1, Math.round(f / m));
}
