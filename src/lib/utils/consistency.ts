export interface ConsistencyDayInput {
  day_number: number;
  value: number | null;
}

export interface ConsistencyResult {
  basis: number;
  maxPerDay: number;
  totalSoFar: number;
  remainingToTarget: number | null;
  breachedDayNumbers: number[];
  dayPercents: { day_number: number; percent: number }[];
  currentConsistencyPercent: number;
}

export function calcConsistency(
  days: ConsistencyDayInput[],
  consistencyPercent: number,
  targetProfit: number | null
): ConsistencyResult {
  const totalSoFar = days.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const basis = targetProfit && targetProfit > 0 ? targetProfit : totalSoFar;
  const maxPerDay = basis > 0 ? (consistencyPercent / 100) * basis : 0;

  // Each day's share of the basis — this is the "consistency %" that day is actually using.
  const dayPercents = basis > 0
    ? days
        .filter((d) => d.value !== null)
        .map((d) => ({ day_number: d.day_number, percent: ((d.value as number) / basis) * 100 }))
    : [];

  const breachedDayNumbers = basis > 0
    ? days.filter((d) => d.value !== null && d.value > maxPerDay).map((d) => d.day_number)
    : [];

  // The current worst-case consistency in use right now — compare this against the target consistency %.
  const currentConsistencyPercent = dayPercents.length > 0
    ? Math.max(...dayPercents.map((d) => d.percent))
    : 0;

  return {
    basis,
    maxPerDay,
    totalSoFar,
    remainingToTarget: targetProfit && targetProfit > 0 ? targetProfit - totalSoFar : null,
    breachedDayNumbers,
    dayPercents,
    currentConsistencyPercent,
  };
}
