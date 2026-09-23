/**
 * Share-night credits from hostmenow free stays (Revision 01).
 *
 * Reference model for the Hostshare side, where the real ledger lives. Rules:
 * - Each free night a member stays credits the host nights x the listing's earn
 *   rate, exactly like a Hostshare host-traveler night. The earn rate is locked
 *   when the booking is made.
 * - Paid hostmenow nights never credit share nights.
 * - Credit is pending from confirmation and final when the stay completes.
 *   A member no-show counts as completed (the host held the night).
 * - A member cancellation reverses pending credit. A host cancellation leaves no
 *   credit (and the host's $100 fee goes to the pool; see pool engine).
 * - One credit per (booking, night). Replaying an event never double-credits.
 * - This adds a credit source. It never changes how existing credits are calculated.
 */

export const SOURCE = 'hostmenow_free_stay' as const;

export type NightKind = 'free' | 'paid';

/** What a reservation webhook carries: which nights were free vs paid. */
export type ReservationNights = {
  bookingId: string;
  listingId: string;
  hostId: string;
  /** Earn rate at booking time. */
  earnRate: number;
  nights: { date: string; kind: NightKind }[];
};

export type ReservationEvent =
  | { type: 'confirmed'; reservation: ReservationNights }
  | { type: 'completed' | 'no_show' | 'cancelled_by_member' | 'cancelled_by_host'; bookingId: string };

export type ShareCredit = {
  key: string; // `${bookingId}:${date}`
  source: typeof SOURCE;
  bookingId: string;
  listingId: string;
  hostId: string;
  night: string;
  earnRate: number;
  credit: number;
  status: 'pending' | 'final' | 'reversed';
};

export type Ledger = Record<string, ShareCredit>;

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Apply one event. Pure and idempotent: applying the same event twice gives the same ledger. */
export function applyEvent(ledger: Ledger, e: ReservationEvent): Ledger {
  const next = { ...ledger };
  if (e.type === 'confirmed') {
    const r = e.reservation;
    for (const n of r.nights) {
      if (n.kind !== 'free') continue;
      const key = `${r.bookingId}:${n.date}`;
      if (next[key]) continue; // already recorded: replay is a no-op
      next[key] = {
        key,
        source: SOURCE,
        bookingId: r.bookingId,
        listingId: r.listingId,
        hostId: r.hostId,
        night: n.date,
        earnRate: r.earnRate,
        credit: round1(r.earnRate),
        status: 'pending',
      };
    }
    return next;
  }
  const status = e.type === 'completed' || e.type === 'no_show' ? 'final' : 'reversed';
  for (const c of Object.values(next)) {
    if (c.bookingId !== e.bookingId || c.status !== 'pending') continue;
    next[c.key] = { ...c, status };
  }
  return next;
}

export const replay = (events: ReservationEvent[], start: Ledger = {}) => events.reduce(applyEvent, start);

/** Share nights covered by hostmenow for a host: final credits only. */
export function covered(ledger: Ledger, hostId: string, from?: string, to?: string) {
  return round1(
    Object.values(ledger)
      .filter((c) => c.hostId === hostId && c.status === 'final' && (!from || c.night >= from) && (!to || c.night < to))
      .reduce((s, c) => s + c.credit, 0),
  );
}

export const pending = (ledger: Ledger, hostId: string) =>
  round1(Object.values(ledger).filter((c) => c.hostId === hostId && c.status === 'pending').reduce((s, c) => s + c.credit, 0));

/** "2.8" or "3" */
export const fmtNights = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
