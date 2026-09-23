import { useCallback } from 'react';
import { create } from 'zustand';

import { CHECK_IN_HOUR, FREE_NIGHT_REFUND_CUTOFF_HOURS, FREE_NIGHTS_UNLOCK_AFTER_DAYS } from '@/config';

import { getListing, isOpenOn, member, sentInvites, type Listing, type NightGrant, type SentInvite } from '@/data/mock';
import { addDays, fromISODate, monthDay, toISODate, today } from '@/lib/dates';
import type { Range } from '@/lib/range';
import { priceStay, type StayPrice } from '@/lib/pricing';
import type { IdStatus } from '@/services/identity';
import type { PayMethod } from '@/services/payments';

export type Booking = {
  id: string;
  listingId: string;
  checkIn: string; // ISO date
  nights: number;
  guests: number;
  price: StayPrice;
  status: 'Confirmed' | 'Awaiting host';
  paidWith: PayMethod;
  doorCode: string;
  /** Free nights in the bank just before this booking, for the confirmed screen animation. */
  bankBefore: number;
};

type State = {
  isMember: boolean;
  nightGrants: NightGrant[];
  membership: 'active' | 'paused';
  idStatus: IdStatus;
  exploreEmpty: boolean;
  tripsEmpty: boolean;
  bookings: Booking[];
  invitesLeft: number;
  sentInvites: SentInvite[];
  /** Selected nights on Explore, as offsets from today. Null shows every home open in the window. */
  range: Range | null;
  /** Days after a grant before its free nights can be used. See config. */
  unlockDays: number;
};

type Actions = {
  completeOnboarding: () => void;
  signOut: () => void;
  setRange: (r: Range | null) => void;
  book: (b: Omit<Booking, 'id' | 'doorCode' | 'bankBefore' | 'status'>) => Booking;
  cancelBooking: (id: string) => void;
  sendInvite: () => void;
  setIdStatus: (s: IdStatus) => void;
  setMembership: (s: 'active' | 'paused') => void;
  // dev menu
  setFreeNights: (n: 0 | 5) => void;
  setExploreEmpty: (v: boolean) => void;
  setTripsEmpty: (v: boolean) => void;
  setUnlockDays: (d: number) => void;
};

/** Every unused free night in the bank, locked or not. */
export const freeNightsOf = (grants: NightGrant[]) => grants.reduce((sum, g) => sum + g.nights - g.used, 0);

export const unlockDate = (g: NightGrant, unlockDays: number) => addDays(fromISODate(g.granted), unlockDays);

/** Free nights a member can spend right now: unlocked grants, and not while paused (nights freeze). */
export function usableNightsOf(s: Pick<State, 'nightGrants' | 'unlockDays' | 'membership'>) {
  if (s.membership === 'paused') return 0;
  const now = today().getTime();
  return s.nightGrants.reduce((sum, g) => sum + (unlockDate(g, s.unlockDays).getTime() <= now ? g.nights - g.used : 0), 0);
}

/** Day offset from today for an ISO date. */
const offsetOf = (iso: string) => Math.round((fromISODate(iso).getTime() - today().getTime()) / 86400000);

/** Check-in moment of a booking. */
export function checkInAt(b: Booking) {
  const d = fromISODate(b.checkIn);
  d.setHours(CHECK_IN_HOUR, 0, 0, 0);
  return d;
}

/** Free nights come back only if the trip is cancelled far enough ahead. */
export const freeNightsRefundable = (b: Booking, now = Date.now()) =>
  checkInAt(b).getTime() - now >= FREE_NIGHT_REFUND_CUTOFF_HOURS * 3600 * 1000;

/** Oldest grants are used first (grants are kept sorted oldest first). */
function consume(grants: NightGrant[], n: number): NightGrant[] {
  let left = n;
  return grants.map((g) => {
    const take = Math.min(left, g.nights - g.used);
    left -= take;
    return { ...g, used: g.used + take };
  });
}

/** Refunds go back to the newest grant that has used nights. */
function refund(grants: NightGrant[], n: number): NightGrant[] {
  let left = n;
  return [...grants]
    .reverse()
    .map((g) => {
      const give = Math.min(left, g.used);
      left -= give;
      return { ...g, used: g.used - give };
    })
    .reverse();
}

function seedBookings(): Booking[] {
  const coast = getListing('coast-loft')!;
  return [
    {
      id: 'seed-coast-loft',
      listingId: coast.id,
      checkIn: toISODate(addDays(today(), 3)),
      nights: 1,
      guests: 2,
      price: priceStay(coast, 1, 0, false),
      status: 'Awaiting host',
      paidWith: 'card',
      doorCode: '5190',
      bankBefore: 5,
    },
  ];
}

const initial = (): State => ({
  isMember: false,
  nightGrants: member.nightGrants.map((g) => ({ ...g })),
  membership: 'active',
  idStatus: 'verified',
  exploreEmpty: false,
  tripsEmpty: false,
  bookings: seedBookings(),
  invitesLeft: member.invitesLeft,
  sentInvites: [...sentInvites],
  range: null,
  unlockDays: FREE_NIGHTS_UNLOCK_AFTER_DAYS,
});

export const useApp = create<State & Actions>()((set, get) => ({
  ...initial(),

  completeOnboarding: () => set({ isMember: true }),
  signOut: () => set(initial()),
  setRange: (range) => set({ range }),

  book: (b) => {
    const bankBefore = freeNightsOf(get().nightGrants);
    const booking: Booking = {
      ...b,
      id: `bk-${Date.now().toString(36)}`,
      status: 'Confirmed',
      doorCode: String(1000 + Math.floor(Math.random() * 9000)),
      bankBefore,
    };
    set((s) => ({
      bookings: [booking, ...s.bookings],
      nightGrants: consume(s.nightGrants, b.price.free),
      tripsEmpty: false,
    }));
    return booking;
  },

  cancelBooking: (id) =>
    set((s) => {
      const b = s.bookings.find((x) => x.id === id);
      if (!b) return s;
      return {
        bookings: s.bookings.filter((x) => x.id !== id),
        nightGrants: freeNightsRefundable(b) ? refund(s.nightGrants, b.price.free) : s.nightGrants,
      };
    }),

  sendInvite: () =>
    set((s) => ({
      invitesLeft: Math.max(0, s.invitesLeft - 1),
      sentInvites: [...s.sentInvites, { name: null, initials: null, status: `Link sent ${monthDay(today())} · expires in 5 days` }],
    })),

  setIdStatus: (idStatus) => set({ idStatus }),
  setMembership: (membership) => set({ membership }),

  setFreeNights: (n) =>
    set((s) => ({ nightGrants: s.nightGrants.map((g) => ({ ...g, used: n === 0 ? g.nights : 0 })) })),
  setExploreEmpty: (exploreEmpty) => set({ exploreEmpty }),
  setTripsEmpty: (tripsEmpty) => set({ tripsEmpty }),
  setUnlockDays: (unlockDays) => set({ unlockDays }),
}));

/** Free nights the member can use now. Drives prices and booking. */
export const useFreeNights = () => useApp(usableNightsOf);

/** Everything in the bank, including locked or frozen nights. Drives the nights pill and bank. */
export const useBankedNights = () => useApp((s) => freeNightsOf(s.nightGrants));

/**
 * Availability for a home on a night. A night the member already has a stay
 * (at any home) counts as taken, so they can't double-book themselves.
 */
export function useIsOpen() {
  const bookings = useApp((s) => s.bookings);
  return useCallback(
    (l: Listing, day: number) =>
      isOpenOn(l, day) && !bookings.some((b) => day >= offsetOf(b.checkIn) && day < offsetOf(b.checkIn) + b.nights),
    [bookings],
  );
}

// Dev only: lets the web preview jump straight into a state while testing.
if (__DEV__ && typeof window !== 'undefined') {
  (window as unknown as { __hmn: typeof useApp }).__hmn = useApp;
}
