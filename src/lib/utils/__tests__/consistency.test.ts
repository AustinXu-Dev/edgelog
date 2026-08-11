import { describe, it, expect } from 'vitest';
import { calcConsistency } from '../consistency';

describe('calcConsistency', () => {
  it('uses sum of days as basis when no target is set', () => {
    const days = [
      { day_number: 1, value: 100 },
      { day_number: 2, value: 300 },
      { day_number: 3, value: 100 },
    ];
    const result = calcConsistency(days, 20, null);
    // basis = 500, maxPerDay = 20% of 500 = 100
    expect(result.basis).toBe(500);
    expect(result.maxPerDay).toBe(100);
    expect(result.totalSoFar).toBe(500);
    expect(result.remainingToTarget).toBeNull();
    expect(result.breachedDayNumbers).toEqual([2]);
    // day 2's share of the 500 basis is 300/500 = 60%, the current worst-case consistency
    expect(result.currentConsistencyPercent).toBe(60);
    expect(result.dayPercents).toEqual([
      { day_number: 1, percent: 20 },
      { day_number: 2, percent: 60 },
      { day_number: 3, percent: 20 },
    ]);
  });

  it('uses target profit as basis when set', () => {
    const days = [
      { day_number: 1, value: 100 },
      { day_number: 2, value: 50 },
    ];
    const result = calcConsistency(days, 20, 1000);
    // basis = 1000, maxPerDay = 200 — neither day breaches
    expect(result.basis).toBe(1000);
    expect(result.maxPerDay).toBe(200);
    expect(result.totalSoFar).toBe(150);
    expect(result.remainingToTarget).toBe(850);
    expect(result.breachedDayNumbers).toEqual([]);
  });

  it('ignores blank days and returns no breaches when basis is zero', () => {
    const days = [
      { day_number: 1, value: null },
      { day_number: 2, value: null },
    ];
    const result = calcConsistency(days, 20, null);
    expect(result.basis).toBe(0);
    expect(result.maxPerDay).toBe(0);
    expect(result.breachedDayNumbers).toEqual([]);
    expect(result.currentConsistencyPercent).toBe(0);
    expect(result.dayPercents).toEqual([]);
  });
});
