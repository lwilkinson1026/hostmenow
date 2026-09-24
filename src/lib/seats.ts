/**
 * Membership seats: how many members the network can take, tied to the homes on it.
 * All numbers come from SEAT_RULES in config; screens call these, never the math.
 */
import { SEAT_RULES } from '../config.ts';

export type SeatRules = typeof SEAT_RULES;
export type SeatHolder = SeatRules['order'][number];

export type SeatListing = {
  /** Nights still empty 5 days out in a typical month. */
  openPerMonth: number;
  /** Host's monthly free-night cap; null is no limit. */
  freeCap: number | null;
  /** 'paid' listings take paid member stays only, so they add no free nights. */
  mode?: 'both' | 'paid';
  on?: boolean;
};

/**
 * Seats one home opens: the members its free nights can carry, up to 3.
 * 8 open nights at the default cap of 4 carries 3; a cap of 1 carries 1.
 */
export function seatsForListing(l: SeatListing, rules: SeatRules = SEAT_RULES): number {
  if (l.on === false || l.mode === 'paid') return 0;
  const freePerMonth = Math.min(l.openPerMonth, l.freeCap ?? Infinity);
  const carried = Math.floor((freePerMonth * 12 * rules.usableShareOfFreeNights) / rules.freeNightsPerMember);
  return Math.max(0, Math.min(rules.membersPerListing, carried));
}

export const seatsForHost = (listings: SeatListing[], rules: SeatRules = SEAT_RULES) =>
  listings.reduce((sum, l) => sum + seatsForListing(l, rules), 0);

/** Hand seats out in turn: referrer, host, waitlist, referrer... A host nobody referred passes theirs to the waitlist. */
export function splitSeats(n: number, referred = true, rules: SeatRules = SEAT_RULES): Record<SeatHolder, number> {
  const out: Record<SeatHolder, number> = { referrer: 0, host: 0, waitlist: 0 };
  for (let i = 0; i < n; i++) {
    const who = rules.order[i % rules.order.length];
    out[who === 'referrer' && !referred ? 'waitlist' : who] += 1;
  }
  return out;
}

export type Span = { from: number; to?: number };
const DAY = 86400000;

/** Days live since `liveSince`, not counting paused stretches. */
export function liveDays(liveSince: number, pauses: Span[], now: number): number {
  if (now <= liveSince) return 0;
  const paused = pauses.reduce((sum, p) => {
    const a = Math.max(p.from, liveSince);
    const b = Math.min(p.to ?? now, now);
    return sum + Math.max(0, b - a);
  }, 0);
  return Math.floor((now - liveSince - paused) / DAY);
}

/** Whether a home's seats are open yet, and how many live days are left if not. */
export function seatsOpen(liveSince: number, pauses: Span[], now: number, rules: SeatRules = SEAT_RULES) {
  const days = liveDays(liveSince, pauses, now);
  return { open: days >= rules.liveDaysToOpen, daysLeft: Math.max(0, rules.liveDaysToOpen - days) };
}

/** Seats not yet taken across the network (or a region). */
export const openSeats = (members: number, seats: number) => Math.max(0, seats - members);

export type RegionStatus = 'open' | 'slow' | 'waitlist';

/**
 * The brake: `fillRate` is the share of free-night searches in a region that end in
 * a free booking. Below 85%, invites from the cities that feed it are halved; below
 * 70% for 4 weeks, new members for that region go to the waitlist.
 */
export function regionStatus(fillRate: number, weeksBelowWaitlistLine: number, rules: SeatRules = SEAT_RULES): RegionStatus {
  const b = rules.brake;
  if (fillRate < b.waitlistBelow && weeksBelowWaitlistLine >= b.waitlistAfterWeeks) return 'waitlist';
  if (fillRate < b.slowBelow) return 'slow';
  return 'open';
}
