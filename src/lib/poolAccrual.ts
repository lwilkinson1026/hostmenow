import { estimate, networkFor } from './estimate.ts';

/**
 * A host's running share of the pool (estimated). Each live listing accrues its
 * yearly pool share from estimate(), spread evenly across the year. Paused time
 * accrues nothing. The real figure comes from the quarterly ledger; this is the
 * clearly-labelled estimate hosts see in between.
 */

const DAY = 24 * 60 * 60 * 1000;

export type AccrualListing = {
  id: string;
  rate: number;
  openNights: number;
  mode: 'both' | 'paid';
  /** Free member nights allowed a month (null: no limit). */
  freeCap?: number | null;
  /** When the listing joined hostmenow (ms). */
  liveFrom: number;
};

/** A paused stretch for one listing. `to` is open while it's still paused. */
export type PauseSpan = { listingId: string; from: number; to?: number };

/** A listing's estimated pool share per day while open. */
export function poolPerDay(l: Pick<AccrualListing, 'rate' | 'openNights' | 'mode' | 'freeCap'>): number {
  return (
    estimate({ homes: 1, rate: l.rate, openPerMonth: l.openNights, paidOnly: l.mode === 'paid', freeCapPerMonth: l.freeCap ?? null }, networkFor('launch')).pool / 365
  );
}

const overlap = (a0: number, a1: number, b0: number, b1: number) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));

/** Estimated pool share accrued between `from` and `now` across the listings. */
export function accruedPool(listings: AccrualListing[], pauses: PauseSpan[], from: number, now: number): number {
  return listings.reduce((sum, l) => {
    const start = Math.max(from, l.liveFrom);
    if (now <= start) return sum;
    const paused = pauses
      .filter((p) => p.listingId === l.id)
      .reduce((ms, p) => ms + overlap(start, now, p.from, p.to ?? now), 0);
    return sum + ((now - start - paused) / DAY) * poolPerDay(l);
  }, 0);
}

/** First moment of the calendar quarter containing `d` (local time). */
export function quarterStart(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
}
