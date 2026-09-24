// Mock Hostshare host for the opt-in prototype (handoff section 4).
import type { ReservationEvent } from '@/lib/shareLedger';
import { BRAND } from '@/config';

export type HostListing = {
  id: string;
  name: string;
  city: string;
  rate: number;
  /** Historical nights a month still open 5 days out. */
  openNights: number;
  /** Hostshare earn rate (0.5x to 4x), used for share-night credit. */
  earnRate: number;
  cleaning: number;
  eligible: boolean;
  reason?: string;
};

export const host = {
  id: 'host-landon',
  firstName: 'Landon',
  /** Pro and Pro+ have a share pledge; Starter and Starter+ earn Wallet travel nights instead. */
  tier: 'Pro' as 'Starter' | 'Starter+' | 'Pro' | 'Pro+',
  /** Share nights pledged this membership year (earn-rate weighted, like earned-back progress). */
  pledge: 12,
  membershipYearStart: '2026-09-01',
  /** When this host's listings joined hostmenow (the demo host has been live since the quarter began). */
  optedInAt: '2026-07-01',
  initial: 'L',
  travelNights: 21,
  upcomingGuests: 2,
  payoutAccount: 'Checking ····1234',
  w9OnFile: false,
  invites: 5,
};

export const hostListings: HostListing[] = [
  { id: 'orchard', name: 'Orchard House', city: 'Yakima, WA', rate: 260, openNights: 8, earnRate: 1.4, cleaning: 110, eligible: true },
  { id: 'cedar', name: 'Cedar A-Frame', city: 'Leavenworth, WA', rate: 220, openNights: 8, earnRate: 1.2, cleaning: 85, eligible: true },
  { id: 'loft', name: 'Downtown Loft', city: 'Yakima, WA', rate: 150, openNights: 8, earnRate: 0.8, cleaning: 65, eligible: true },
  // Opting in requires last-minute (5-day) availability turned on in Share Settings.
  { id: 'river', name: 'River Studio', city: 'Ellensburg, WA', rate: 130, openNights: 0, earnRate: 0.7, cleaning: 60, eligible: false, reason: 'Turn on last-minute availability first' },
  { id: 'chelan', name: 'Lake Chelan Cabin', city: 'Chelan, WA', rate: 240, openNights: 8, earnRate: 1.3, cleaning: 95, eligible: false, reason: 'Not live on Hostshare yet' },
];

export const pastGuests = [
  { id: 'j', name: 'Jordan Ellis', meta: 'Stayed at Orchard House in August' },
  { id: 'p', name: 'Priya Shah', meta: 'Stayed at Cedar A-Frame in July' },
  { id: 's', name: 'Sam Keller', meta: 'Stayed at Downtown Loft in June' },
];

/** Member stays completed on this host's listings this quarter, for the payout statement. */
export const quarterStays = [
  { bookingId: 'hm-095', listingId: 'cedar', freeNights: 0, paidNights: 2 },
  { bookingId: 'hm-090', listingId: 'orchard', freeNights: 0, paidNights: 2 },
  { bookingId: 'hm-101', listingId: 'cedar', freeNights: 2, paidNights: 0 },
  { bookingId: 'hm-102', listingId: 'loft', freeNights: 1, paidNights: 1 },
  { bookingId: 'hm-103', listingId: 'cedar', freeNights: 1, paidNights: 0 },
];

/** Recent hostmenow activity on the host's listings, newest first. */
export const notices = [
  'Jordan E. booked Orchard House for Friday. 2 free nights.',
  'Priya S. checked out of Cedar A-Frame. 1 free night. Counted toward your sharing.',
];

export const hostTerms = [
  'Members only book nights within 5 days of check-in.',
  `Paid stays are 50% of your nightly rate. ${BRAND} keeps 15%. Card fees of 2.9% come out of your stay and cleaning payouts.`,
  "Free member stays count toward your Hostshare share nights. Paid stays don't.",
  "Pool shares are paid quarterly. Estimates aren't guaranteed.",
  "You can't decline a member based on their photo or video.",
  'Cancelling a confirmed stay lowers your pool share.',
  'Pause a listing or leave any time. Stays already booked still happen.',
];

export const memberVetting = [
  'Invited by someone who vouches for them',
  'Government ID verified',
  'Video intro you can watch once they book',
  "Signed house rules. One strike and they're out.",
];

/**
 * Member stays on this host's listings as reservation events, the way Hostshare
 * would receive them. Replayed into the share ledger for the earnings card.
 */
const res = (bookingId: string, listingId: string, earnRate: number, nights: [string, 'free' | 'paid'][]) => ({
  type: 'confirmed' as const,
  reservation: { bookingId, listingId, hostId: host.id, earnRate, nights: nights.map(([date, kind]) => ({ date, kind })) },
});

export const memberStayEvents: ReservationEvent[] = [
  res('hm-101', 'cedar', 1.2, [['2026-09-05', 'free'], ['2026-09-06', 'free']]),
  { type: 'completed', bookingId: 'hm-101' },
  res('hm-102', 'loft', 0.8, [['2026-09-12', 'free'], ['2026-09-13', 'paid']]),
  { type: 'completed', bookingId: 'hm-102' },
  res('hm-103', 'cedar', 1.2, [['2026-09-19', 'free']]),
  { type: 'completed', bookingId: 'hm-103' },
  res('hm-104', 'orchard', 1.4, [['2026-09-25', 'free'], ['2026-09-26', 'free']]),
];

/** Past pauses on this host's listings, for the running pool total. */
export const pastPauses = [{ listingId: 'loft', from: '2026-08-10', to: '2026-08-24' }];
