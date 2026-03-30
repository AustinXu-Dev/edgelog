export function formatCurrency(value: number, decimals = 2): string {
  const formatted = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatR(value: number | null): string {
  if (value === null) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}R`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPnl(value: number | null): string {
  if (value === null) return '—';
  return formatCurrency(value);
}

export function pnlColor(value: number | null): string {
  if (value === null || value === 0) return 'text-gray-500';
  return value > 0 ? 'text-emerald-600' : 'text-red-600';
}

export function toInputDatetime(iso: string): string {
  // Convert ISO string to datetime-local input format YYYY-MM-DDTHH:MM
  return iso.slice(0, 16);
}

export function fromInputDatetime(value: string): string {
  // Convert datetime-local input to ISO string
  return new Date(value).toISOString();
}
