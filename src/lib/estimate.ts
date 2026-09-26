/**
 * estimate(): the single source of truth for host earnings (Revision 02).
 *
 * Ported from reference/host-earnings-estimate.html. The public /hosts page, the
 * Hostshare dashboard card, the opt-in Value screen and the per-listing figures
 * all call this. Do not reimplement the math anywhere else.
 *
 * In production, PRICING comes from config and NETWORK from
 * GET /hostmenow/network-stats, with the honesty floor below.
 */

import { PRICING_CONFIG, type PricingConfig } from '../config.ts';

/** From a versioned pricing config, plus the pool engine's fixed rules. */
export const pricingFor = (c: PricingConfig) => ({
  membershipPerYear: c.membership_monthly_usd * 12,
  poolShareOfMembership: c.pool_share_of_membership, // 45%
  platformTake: c.platform_take_on_paid_stays, // 15% of 50% paid stays
  hostCardFee: c.host_card_fee_rate, // 2.9%, deducted from host payouts
  poolShareOfTake: c.pool_share_of_take,
  hostedSplit: 0.75, // pool split: hosted points vs available points
  paidDiscount: c.paid_night_discount,
  rateWeightBase: 150, // W = clamp(rate / 150, 0.5, 3)
});

export type Pricing = ReturnType<typeof pricingFor>;

/** The config in force today (pricing-v4: $79 a month). */
export const PRICING = pricingFor(PRICING_CONFIG);

export type NetworkStats = {
  members: number;
  listings: number;
  freeNightsUsed: number;
  paidNightsPerMember: number;
  avgRate: number;
  avgOpenPerMonth: number;
};

export const NETWORK = {
  // Homes start at $250 a night (pricing-v4), so the network average sits well above it.
  launch: { members: 2000, listings: 1000, freeNightsUsed: 4, paidNightsPerMember: 3, avgRate: 350, avgOpenPerMonth: 8 },
  growing: { members: 8000, listings: 2500, freeNightsUsed: 4, paidNightsPerMember: 3, avgRate: 350, avgOpenPerMonth: 8 },
} satisfies Record<string, NetworkStats>;

export type Stage = keyof typeof NETWORK;

/**
 * Honesty floor: until the live network has 2,000 paying members and 90 days of
 * data, use the launch constants. Never estimate from assumptions more
 * optimistic than live data.
 */
export function networkFor(stage: Stage, live?: NetworkStats & { daysOfData: number }): NetworkStats {
  if (stage === 'growing') return NETWORK.growing;
  if (!live || live.members < 2000 || live.daysOfData < 90) return NETWORK.launch;
  return live;
}

export type EstimateInput = {
  homes: number;
  rate: number;
  openPerMonth: number;
  /** Host quality multiplier, 0.8 to 1.2. The public estimate uses 1.0. */
  quality?: number;
  /**
   * Prototype addition for the opt-in "Paid stays only" setting: no free member
   * stays (no hosted points) and available points at 50%, per HANDOFF section 6.
   */
  paidOnly?: boolean;
  /**
   * Host-set limit on free member nights per listing per month (null or absent:
   * no limit). Free demand past the limit isn't hosted, so it earns no hosted points.
   */
  freeCapPerMonth?: number | null;
};

export function estimate(
  { homes, rate, openPerMonth, quality = 1.0, paidOnly = false, freeCapPerMonth = null }: EstimateInput,
  net: NetworkStats,
  P: Pricing = PRICING,
) {
  const W = (r: number) => Math.min(3, Math.max(0.5, r / P.rateWeightBase));

  const netAvail = net.listings * net.avgOpenPerMonth * 12;
  const netFree = net.members * net.freeNightsUsed;
  const netPaid = net.members * net.paidNightsPerMember;
  const fill = Math.min(1, (netFree + netPaid) / netAvail);
  const freeShare = netFree / (netFree + netPaid || 1);

  const pool =
    P.poolShareOfMembership * net.members * P.membershipPerYear +
    P.poolShareOfTake * P.platformTake * netPaid * net.avgRate * P.paidDiscount;

  const hostAvail = homes * openPerMonth * 12;
  const hostFilled = hostAvail * fill;
  const freeCap = freeCapPerMonth === null ? Infinity : freeCapPerMonth * 12 * homes;
  const hostFree = paidOnly ? 0 : Math.min(hostFilled * freeShare, freeCap);
  const hostPaid = hostFilled * (1 - freeShare);

  const wH = W(rate) * quality;
  const wN = W(net.avgRate);
  const poolHosted = (P.hostedSplit * pool * (hostFree * wH)) / (Math.min(netFree, netAvail) * wN);
  const poolAvail = ((1 - P.hostedSplit) * pool * (hostAvail * wH * (paidOnly ? 0.5 : 1))) / (netAvail * wN);
  // Host card fees come out of paid-stay payouts (never out of pool payouts).
  const paid = hostPaid * rate * P.paidDiscount * (1 - P.platformTake - P.hostCardFee);

  return {
    poolHosted,
    poolAvail,
    pool: poolHosted + poolAvail,
    paid,
    total: poolHosted + poolAvail + paid,
    freeStays: hostFree,
    paidNights: hostPaid,
    memberRate: rate * P.paidDiscount,
  };
}

export type Estimate = ReturnType<typeof estimate>;

/** Every dollar figure is shown rounded to the nearest $10. */
export const round10 = (n: number) => Math.round(n / 10) * 10;
export const money10 = (n: number) => `$${round10(n).toLocaleString('en-US')}`;

/** Pool shares pay 15 days after the quarter closes. */
export function nextPoolPayout(from: Date = new Date()): Date {
  const qEndMonth = Math.floor(from.getMonth() / 3) * 3 + 3;
  return new Date(from.getFullYear(), qEndMonth, 15);
}
