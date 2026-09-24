import { create } from 'zustand';

import { host, hostListings } from '@/data/host';
import { estimate, networkFor, round10 } from '@/lib/estimate';

export type OptInMode = 'both' | 'paid';
export type Row = { id: string; on: boolean; mode: OptInMode };

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
};

type Actions = {
  toggle: (id: string) => void;
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
  rows: hostListings.filter((l) => l.eligible).map((l) => ({ id: l.id, on: true, mode: 'both' })),
  booking: 'instant',
  damageHold: false,
  w9: { legal: '', tin: '', address: '' },
  w9OnFile: host.w9OnFile,
  agreed: false,
  optedIn: false,
  invited: [],
  linksShared: 0,
});

export const useHost = create<State & Actions>()((set) => ({
  ...initial(),
  toggle: (id) => set((s) => ({ rows: s.rows.map((r) => (r.id === id ? { ...r, on: !r.on } : r)) })),
  setMode: (id, mode) => set((s) => ({ rows: s.rows.map((r) => (r.id === id ? { ...r, mode } : r)) })),
  saveRows: (rows) => set({ rows, optedIn: rows.some((r) => r.on) }),
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
