// Mock Hostshare host for the opt-in prototype (handoff section 4).

export type HostListing = {
  id: string;
  name: string;
  city: string;
  rate: number;
  /** Historical nights a month still open 5 days out. */
  openNights: number;
  eligible: boolean;
  reason?: string;
};

export const host = {
  firstName: 'Landon',
  initial: 'L',
  travelNights: 21,
  upcomingGuests: 2,
  payoutAccount: 'Checking ····1234',
  w9OnFile: false,
  invites: 5,
};

export const hostListings: HostListing[] = [
  { id: 'orchard', name: 'Orchard House', city: 'Yakima, WA', rate: 260, openNights: 8, eligible: true },
  { id: 'cedar', name: 'Cedar A-Frame', city: 'Leavenworth, WA', rate: 220, openNights: 8, eligible: true },
  { id: 'loft', name: 'Downtown Loft', city: 'Yakima, WA', rate: 150, openNights: 8, eligible: true },
  { id: 'chelan', name: 'Lake Chelan Cabin', city: 'Chelan, WA', rate: 240, openNights: 8, eligible: false, reason: 'Not live on Hostshare yet' },
];

export const pastGuests = [
  { id: 'j', name: 'Jordan Ellis', meta: 'Stayed at Orchard House in August' },
  { id: 'p', name: 'Priya Shah', meta: 'Stayed at Cedar A-Frame in July' },
  { id: 's', name: 'Sam Keller', meta: 'Stayed at Downtown Loft in June' },
];

/** Mock quarter activity shown on the earnings card after opt-in. */
export const quarter = {
  paidStays: { nights: 5, amount: 484 },
  pool: { freeStays: 4, amount: 160 },
  latest: 'Jordan E. booked Orchard House for Friday. 2 free nights.',
};

export const hostTerms = [
  'Members only book nights within 5 days of check-in.',
  'Paid stays are 50% of your nightly rate. hostmenow keeps 12%. Cleaning fees are yours.',
  "Pool shares are paid quarterly. Estimates aren't guaranteed.",
  "You can't decline a member based on their photo or video.",
  'Cancelling a confirmed stay lowers your pool share.',
  'Leave any time. Stays already booked still happen.',
];

export const memberVetting = [
  'Invited by someone who vouches for them',
  'Government ID verified',
  'Video intro you can watch once they book',
  "Signed house rules. One strike and they're out.",
];
