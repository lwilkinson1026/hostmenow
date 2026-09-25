// hostmenow mock data (spec v0.1, section 6)
import type { ImageSourcePropType } from 'react-native';

export type AmenityIcon = 'wifi' | 'kitchen' | 'flame' | 'car' | 'washer' | 'mountain' | 'waves' | 'snowflake' | 'tree';

export type Listing = {
  id: string;
  name: string;
  region: string;
  guests: number;
  bedrooms: number;
  baths: number;
  retailNight: number; // USD
  cleaning: number; // USD
  host: string;
  photos: { src: ImageSourcePropType; alt: string; cropX: number }[]; // cropX = contentPosition x in %
  coords: { lat: number; lng: number };
  description: string;
  amenities: { label: string; icon: AmenityIcon }[];
  rulesSummary: string;
  rules: string[];
  street: string;
  /** Day offsets from today (1..10) when the home is blocked. Source of truth is Hostshare availability. */
  closedDays: number[];
  /**
   * Free member nights still open this month under the host's monthly cap
   * (absent: no cap reached). Past it, members can book at half price.
   */
  freeNightsLeft?: number;
};

const p = (src: ImageSourcePropType, alt: string, cropX = 50) => ({ src, alt, cropX });

const standardRules = ['Check-in after 4 PM. Checkout by 11 AM.', 'No pets. No parties.', 'Quiet after 10 PM.'];

export const listings: Listing[] = [
  {
    id: 'cedar-a-frame', name: 'Cedar A-Frame', region: 'Leavenworth, WA',
    guests: 4, bedrooms: 2, baths: 1, retailNight: 220, cleaning: 85, host: 'Marcus',
    photos: [
      p(require('../../assets/photos/cedar.jpg'), 'Cedar A-Frame at golden hour'),
      p(require('../../assets/photos/cedar-living.jpg'), 'Living room with wood stove', 42),
      p(require('../../assets/photos/cedar-loft.jpg'), 'Sleeping loft', 48),
      p(require('../../assets/photos/cedar-porch.jpg'), 'Deck at dusk', 56),
    ],
    coords: { lat: 47.5962, lng: -120.6615 },
    description:
      'A steep-roofed cabin in the pines, ten minutes from town. Morning light fills the loft through a wall of glass. Wood stove, deep porch, and a trail to the river from the back door.',
    amenities: [
      { label: 'Wifi', icon: 'wifi' },
      { label: 'Kitchen', icon: 'kitchen' },
      { label: 'Wood stove', icon: 'flame' },
      { label: 'Parking', icon: 'car' },
      { label: 'Washer', icon: 'washer' },
      { label: 'Mountain view', icon: 'mountain' },
      { label: 'River trail', icon: 'waves' },
      { label: 'Dryer', icon: 'washer' },
    ],
    rulesSummary: 'Check-in after 4 PM · Checkout by 11 AM · No pets',
    rules: standardRules,
    street: 'Cedar Ridge Rd',
    closedDays: [7],
  },
  {
    id: 'lake-cabin-pend-oreille', name: 'Lake Cabin on Pend Oreille', region: 'Sandpoint, ID',
    guests: 6, bedrooms: 3, baths: 2, retailNight: 340, cleaning: 120, host: 'Dana',
    photos: [p(require('../../assets/photos/lake.jpg'), 'Lake cabin with dock in morning mist', 4)],
    coords: { lat: 48.2766, lng: -116.5535 },
    description:
      'A timber cabin with its own dock on the quiet side of the lake. Coffee on the water at dawn, a fire on the shore at night. Kayaks in the boathouse.',
    amenities: [
      { label: 'Wifi', icon: 'wifi' },
      { label: 'Kitchen', icon: 'kitchen' },
      { label: 'Lakefront', icon: 'waves' },
      { label: 'Fire pit', icon: 'flame' },
      { label: 'Parking', icon: 'car' },
      { label: 'Washer', icon: 'washer' },
    ],
    rulesSummary: 'Check-in after 4 PM · Checkout by 11 AM · No pets',
    rules: standardRules,
    street: 'Lakeshore Dr',
    closedDays: [4, 5, 8],
    freeNightsLeft: 0,
  },
  {
    id: 'desert-modern', name: 'Desert Modern', region: 'Joshua Tree, CA',
    guests: 4, bedrooms: 2, baths: 2, retailNight: 280, cleaning: 95, host: 'Priya',
    photos: [p(require('../../assets/photos/desert.jpg'), 'White modern house among boulders')],
    coords: { lat: 34.1347, lng: -116.3131 },
    description:
      'A white house set low among the boulders. Floor-to-ceiling glass, a cold plunge on the deck, and nothing but stars after dark.',
    amenities: [
      { label: 'Wifi', icon: 'wifi' },
      { label: 'Kitchen', icon: 'kitchen' },
      { label: 'Fire pit', icon: 'flame' },
      { label: 'Parking', icon: 'car' },
      { label: 'Washer', icon: 'washer' },
      { label: 'Desert view', icon: 'mountain' },
    ],
    rulesSummary: 'Check-in after 4 PM · Checkout by 11 AM · No pets',
    rules: standardRules,
    street: 'Boulder Wash Rd',
    closedDays: [2, 3],
  },
  {
    id: 'orchard-house', name: 'Orchard House', region: 'Yakima, WA',
    guests: 8, bedrooms: 4, baths: 3, retailNight: 260, cleaning: 110, host: 'Landon',
    photos: [p(require('../../assets/photos/orchard.jpg'), 'White farmhouse at the end of an apple orchard')],
    coords: { lat: 46.6021, lng: -120.5059 },
    description:
      'A white farmhouse at the end of an apple orchard. A long table for eight, a porch that faces west, and fruit for the picking in season.',
    amenities: [
      { label: 'Wifi', icon: 'wifi' },
      { label: 'Kitchen', icon: 'kitchen' },
      { label: 'Orchard', icon: 'tree' },
      { label: 'Fireplace', icon: 'flame' },
      { label: 'Parking', icon: 'car' },
      { label: 'Washer', icon: 'washer' },
    ],
    rulesSummary: 'Check-in after 4 PM · Checkout by 11 AM · No pets',
    rules: standardRules,
    street: 'Orchard Ln',
    closedDays: [5, 6],
    freeNightsLeft: 1,
  },
  {
    id: 'coast-loft', name: 'Coast Loft', region: 'Cannon Beach, OR',
    guests: 2, bedrooms: 1, baths: 1, retailNight: 190, cleaning: 70, host: 'Sam',
    photos: [p(require('../../assets/photos/coast.jpg'), 'Shingled beach house in coastal fog', 14)],
    coords: { lat: 45.8918, lng: -123.9615 },
    description:
      'A shingled loft two streets from the beach. Fog in the morning, the sound of the surf all night, and a window seat made for reading.',
    amenities: [
      { label: 'Wifi', icon: 'wifi' },
      { label: 'Kitchen', icon: 'kitchen' },
      { label: 'Near the beach', icon: 'waves' },
      { label: 'Fireplace', icon: 'flame' },
      { label: 'Parking', icon: 'car' },
      { label: 'Washer', icon: 'washer' },
    ],
    rulesSummary: 'Check-in after 4 PM · Checkout by 11 AM · No pets',
    rules: standardRules,
    street: 'Hemlock St',
    closedDays: [1, 9],
  },
  {
    id: 'ski-chalet', name: 'Ski Chalet', region: 'Whitefish, MT',
    guests: 6, bedrooms: 3, baths: 2, retailNight: 410, cleaning: 140, host: 'Alex',
    photos: [p(require('../../assets/photos/chalet.jpg'), 'Glass-front chalet in fresh snow', 48)],
    coords: { lat: 48.4106, lng: -114.3376 },
    description:
      'A glass-front chalet below the ski hill. Boots off at the door, a fire going, and the lifts a five minute drive away.',
    amenities: [
      { label: 'Wifi', icon: 'wifi' },
      { label: 'Kitchen', icon: 'kitchen' },
      { label: 'Near the lifts', icon: 'snowflake' },
      { label: 'Fireplace', icon: 'flame' },
      { label: 'Parking', icon: 'car' },
      { label: 'Mountain view', icon: 'mountain' },
    ],
    rulesSummary: 'Check-in after 4 PM · Checkout by 11 AM · No pets',
    rules: standardRules,
    street: 'Big Mountain Rd',
    closedDays: [3, 4, 5],
  },
];

export const getListing = (id: string) => listings.find((l) => l.id === id);

/** Is the home open on the night that is `day` days from today? */
export const isOpenOn = (l: Listing, day: number) => !l.closedDays.includes(day);

/** Free nights a member can use at this home: their bank, within the host's monthly cap. */
export const freeNightsAt = (l: Listing, bank: number) => Math.min(bank, l.freeNightsLeft ?? Infinity);

/** "Visa ····4242" */
export const cardLabel = (c: { brand: string; last4: string }) => `${c.brand} ····${c.last4}`;

export type NightGrant = { nights: number; used: number; granted: string; expires: string };

export const member = {
  name: 'Jordan Ellis',
  initials: 'JE',
  memberSince: '2026-09',
  invitedBy: { name: 'Sarah Chen', initials: 'SC' },
  joined: '2026-09-23',
  /** Saved when they paid for the membership (Apple Pay saves the card behind it). Stays charge this card. */
  card: { brand: 'Visa', last4: '4242' },
  nightGrants: [{ nights: 5, used: 0, granted: '2026-09-23', expires: '2031-09-23' }] as NightGrant[],
};

export type SentInvite = { name: string | null; initials: string | null; status: string };

export const sentInvites: SentInvite[] = [
  { name: 'Maya Ortiz', initials: 'MO', status: 'Joined Sep 20' },
  { name: null, initials: null, status: 'Link sent Sep 22 · expires in 5 days' },
];

/**
 * Hosts this member brought to hostmenow. Invites come from these: each home that
 * joins opens seats (src/lib/seats.ts) once it has been live 30 days, one in three
 * for the member who brought the host.
 */
export type HostReferral = {
  id: string;
  name: string | null;
  initials: string | null;
  /** Homes live on hostmenow, with the seats they open (from seatsForHost). */
  homes: number;
  seats: number;
  /** Days ago the homes went live; null until the host joins. */
  liveDaysAgo: number | null;
  /** Shown until the host joins. */
  status?: string;
};

export const hostReferrals: HostReferral[] = [
  { id: 'dana', name: 'Dana Whitfield', initials: 'DW', homes: 3, seats: 9, liveDaysAgo: 41 },
  { id: 'marcus', name: 'Marcus Lee', initials: 'ML', homes: 1, seats: 3, liveDaysAgo: 12 },
  { id: 'pending-1', name: null, initials: null, homes: 0, seats: 0, liveDaysAgo: null, status: 'Link sent Sep 21' },
];

/** Referral codes on host links (hostmenow.com/hosts?ref=...). Mock: the real lookup is the invites API. */
export const referralCodes: Record<string, string> = { je: 'Jordan Ellis' };

export const houseRules = [
  'Treat every home like a friend lent it to you.',
  'Problems go to the host first, calmly.',
  'Leave it the way you found it.',
  "One strike and you're out. Your inviter will hear about it too.",
];

export const introQuestions = [
  'Who invited you, and how do you know them?',
  "You arrive and something isn't right. What do you do first?",
  'How do you leave a place when you check out?',
];

export const MAGIC_BAD_CODE = 'BADCODE';
