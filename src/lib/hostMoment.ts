import { estimate, networkFor } from './estimate.ts';

/**
 * What one hosted free member night earns a listing from the pool: its yearly
 * hosted pool share from estimate(), over the free member nights it expects to host.
 * Paid-only listings host no free nights, so they earn nothing this way.
 */
export function hostedNightEarning(l: { rate: number; openNights: number; mode: 'both' | 'paid'; freeCap?: number | null }) {
  const e = estimate(
    { homes: 1, rate: l.rate, openPerMonth: l.openNights, paidOnly: l.mode === 'paid', freeCapPerMonth: l.freeCap ?? null },
    networkFor('launch'),
  );
  return e.freeStays > 0 ? e.poolHosted / e.freeStays : 0;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** The night just gone, by name: "Thursday". */
export const lastNightName = (now: Date = new Date()) => DAYS[(now.getDay() + 6) % 7];
