import { create } from 'zustand';

import { getListing, member, sentInvites, type NightGrant, type SentInvite } from '@/data/mock';
import { addDays, monthDay, toISODate, today } from '@/lib/dates';
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
  /** Selected arrival day on Explore, as an offset from today (1..5). */
  arrivalOffset: number;
};

type Actions = {
  completeOnboarding: () => void;
  signOut: () => void;
  setArrivalOffset: (offset: number) => void;
  book: (b: Omit<Booking, 'id' | 'doorCode' | 'bankBefore' | 'status'>) => Booking;
  cancelBooking: (id: string) => void;
  sendInvite: () => void;
  setIdStatus: (s: IdStatus) => void;
  setMembership: (s: 'active' | 'paused') => void;
  // dev menu
  setFreeNights: (n: 0 | 5) => void;
  setExploreEmpty: (v: boolean) => void;
  setTripsEmpty: (v: boolean) => void;
};

export const freeNightsOf = (grants: NightGrant[]) => grants.reduce((sum, g) => sum + g.nights - g.used, 0);

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
      checkIn: toISODate(addDays(today(), 4)),
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
  arrivalOffset: 1,
});

export const useApp = create<State & Actions>()((set, get) => ({
  ...initial(),

  completeOnboarding: () => set({ isMember: true }),
  signOut: () => set(initial()),
  setArrivalOffset: (arrivalOffset) => set({ arrivalOffset }),

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
      return { bookings: s.bookings.filter((x) => x.id !== id), nightGrants: refund(s.nightGrants, b.price.free) };
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
}));

export const useFreeNights = () => useApp((s) => freeNightsOf(s.nightGrants));

// Dev only: lets the web preview jump straight into a state while testing.
if (__DEV__ && typeof window !== 'undefined') {
  (window as unknown as { __hmn: typeof useApp }).__hmn = useApp;
}
