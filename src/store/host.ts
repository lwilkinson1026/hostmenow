import { create } from 'zustand';

import { host, hostListings, pastPauses } from '@/data/host';
import { fromISODate } from '@/lib/dates';
import type { PauseSpan } from '@/lib/poolAccrual';
import { estimate, networkFor, round10 } from '@/lib/estimate';

export type OptInMode = 'both' | 'paid';
/** `on`: opted in to hostmenow. `paused`: opted in, but not taking new member bookings or earning pool income. */
export type Row = { id: string; on: boolean; mode: OptInMode; paused: boolean };

type State = {
  rows: Row[];
  booking: 'instant' | 'approve';
  damageHold: boolean;
  w9: { legal: string; tin: string; address: string };
  w9OnFile: boolean;
  agreed: boolean;
  optedIn: boolean;
  invited: string[];
  linksShared: number;
  /** Paused stretches, for the running pool total. */
  pauses: PauseSpan[];
};

type Actions = {
  toggle: (id: string) => void;
  /** Pause or reopen a listing. Instant; stays already booked still happen. */
  setPaused: (id: string, paused: boolean) => void;
  /** Save edited listings after opt-in. Turning every listing off opts the host out. */
  saveRows: (rows: Row[]) => void;
  setMode: (id: string, mode: OptInMode) => void;
  setBooking: (b: State['booking']) => void;
  setDamageHold: (v: boolean) => void;
  setW9: (patch: Partial<State['w9']>) => void;
  setAgreed: (v: boolean) => void;
  optIn: () => void;
  invite: (guestId: string) => void;
  shareLink: () => void;
  reset: () => void;
};

const initial = (): State => ({
  // Every live listing is on by default, set to paid and free stays.
  rows: hostListings.filter((l) => l.eligible).map((l) => ({ id: l.id, on: true, mode: 'both', paused: false })),
  booking: 'instant',
  damageHold: false,
  w9: { legal: '', tin: '', address: '' },
  w9OnFile: host.w9OnFile,
  agreed: false,
  optedIn: false,
  invited: [],
  linksShared: 0,
  pauses: pastPauses.map((p) => ({ listingId: p.listingId, from: fromISODate(p.from).getTime(), to: fromISODate(p.to).getTime() })),
});

export const useHost = create<State & Actions>()((set) => ({
  ...initial(),
  toggle: (id) => set((s) => ({ rows: s.rows.map((r) => (r.id === id ? { ...r, on: !r.on } : r)) })),
  setPaused: (id, paused) =>
    set((s) => {
      const now = Date.now();
      const pauses = paused
        ? [...s.pauses, { listingId: id, from: now }]
        : s.pauses.map((p) => (p.listingId === id && p.to === undefined ? { ...p, to: now } : p));
      return { rows: s.rows.map((r) => (r.id === id ? { ...r, paused } : r)), pauses };
    }),
  setMode: (id, mode) => set((s) => ({ rows: s.rows.map((r) => (r.id === id ? { ...r, mode } : r)) })),
  // Pausing applies instantly, so keep the store's pause state over the draft's.
  saveRows: (rows) =>
    set((s) => {
      const next = rows.map((r) => ({ ...r, paused: s.rows.find((x) => x.id === r.id)?.paused ?? false }));
      return { rows: next, optedIn: next.some((r) => r.on) };
    }),
  setBooking: (booking) => set({ booking }),
  setDamageHold: (damageHold) => set({ damageHold }),
  setW9: (patch) => set((s) => ({ w9: { ...s.w9, ...patch } })),
  setAgreed: (agreed) => set({ agreed }),
  optIn: () => set((s) => ({ optedIn: s.rows.some((r) => r.on), w9OnFile: true, w9: { legal: '', tin: '', address: '' } })),
  invite: (id) => set((s) => (s.invited.includes(id) ? s : { invited: [...s.invited, id] })),
  shareLink: () => set((s) => ({ linksShared: s.linksShared + 1 })),
  reset: () => set(initial()),
}));

/** Per-listing yearly estimate from the shared estimate(), rounded to $10 for display. */
export function listingEstimate(id: string, mode: OptInMode) {
  const l = hostListings.find((x) => x.id === id)!;
  return round10(estimate({ homes: 1, rate: l.rate, openPerMonth: l.openNights, paidOnly: mode === 'paid' }, networkFor('launch')).total);
}

/**
 * The signed-in host's prefill (Revision 02): live listings, their average rate,
 * and average open nights. Real version: Hostshare/Hospitable calendar history,
 * falling back to 8 with under 60 days of history, and the host's real quality.
 */
export function hostPrefill() {
  const live = hostListings.filter((l) => l.eligible);
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  return {
    homes: live.length,
    rate: Math.round(avg(live.map((l) => l.rate)) / 10) * 10,
    openPerMonth: Math.round(avg(live.map((l) => l.openNights))) || 8,
    quality: 1.0,
  };
}

export const invitesLeft = (s: Pick<State, 'invited' | 'linksShared'>) => Math.max(0, host.invites - s.invited.length - s.linksShared);

// Dev only: lets the web preview jump straight into a state while testing.
if (__DEV__ && typeof window !== 'undefined') {
  (window as unknown as { __host: typeof useHost }).__host = useHost;
}
