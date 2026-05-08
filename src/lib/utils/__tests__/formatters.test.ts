import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatR,
  pnlColor,
  toInputDatetime,
  fromInputDatetime,
  formatPnl,
} from '../formatters';

describe('formatCurrency', () => {
  it('formats positive values with $', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats negative values with leading -$', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('respects custom decimals', () => {
    expect(formatCurrency(100, 0)).toBe('$100');
    expect(formatCurrency(1.5555, 4)).toBe('$1.5555');
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('formatPercent', () => {
  it('formats with one decimal by default', () => {
    expect(formatPercent(55.555)).toBe('55.6%');
  });

  it('respects custom decimals', () => {
    expect(formatPercent(75, 0)).toBe('75%');
  });
});

describe('formatR', () => {
  it('returns em dash for null', () => {
    expect(formatR(null)).toBe('—');
  });

  it('adds + sign for positive values', () => {
    expect(formatR(2.5)).toBe('+2.50R');
  });

  it('no + sign for negative values', () => {
    expect(formatR(-1.5)).toBe('-1.50R');
  });

  it('adds + sign for zero', () => {
    expect(formatR(0)).toBe('+0.00R');
  });
});

describe('pnlColor', () => {
  it('returns gray for null', () => {
    expect(pnlColor(null)).toBe('text-gray-500');
  });

  it('returns gray for zero', () => {
    expect(pnlColor(0)).toBe('text-gray-500');
  });

  it('returns green for positive', () => {
    expect(pnlColor(100)).toBe('text-emerald-600');
  });

  it('returns red for negative', () => {
    expect(pnlColor(-100)).toBe('text-red-600');
  });
});

describe('formatPnl', () => {
  it('returns em dash for null', () => {
    expect(formatPnl(null)).toBe('—');
  });

  it('formats non-null values as currency', () => {
    expect(formatPnl(250)).toBe('$250.00');
    expect(formatPnl(-100)).toBe('-$100.00');
  });
});

describe('toInputDatetime', () => {
  it('slices to YYYY-MM-DDTHH:MM', () => {
    expect(toInputDatetime('2024-01-15T09:30:00.000Z')).toBe('2024-01-15T09:30');
  });
});

describe('fromInputDatetime', () => {
  it('converts datetime-local string to ISO', () => {
    const result = fromInputDatetime('2024-01-15T09:30');
    expect(result).toMatch(/2024-01-15T/);
    expect(result).toMatch(/\.000Z$/);
  });
});
