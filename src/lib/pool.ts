/**
 * Host earnings estimate. Mirrors update() in the reference calculator
 * (handoff: reference/host-earnings-calculator.html). Estimates only; the real
 * pool is closed quarterly from the ledger.
 */

export type Network = {
  members: number;
  netListings: number;
  /** Free nights used per member per year. */
  freeUsed: number;
  /** Paid nights per member per year. */
  paidPer: number;
  netRate: number;
  /** Membership revenue per member per year. */
  fee: number;
};

/** Defaults from the reference calculator. */
export const NETWORK: Network = { members: 2000, netListings: 1000, freeUsed: 4, paidPer: 3, netRate: 200, fee: 240 };

export const PLATFORM_TAKE = 0.12;
export const MEMBER_RATE = 0.5;

/** Rate weight: clamp(retail / 150, 0.5, 3.0). */
export const rateWeight = (rate: number) => Math.min(3, Math.max(0.5, rate / 150));

export type ListingEstimate = { paid: number; poolHosted: number; poolAvailable: number; total: number };

/**
 * Yearly estimate for one listing.
 * `open` is the host's historical count of nights a month still open 5 days out.
 * "Paid stays only" listings host no free nights and earn available points at 50%.
 */
export function estimateListing(
  rate: number,
  open: number,
  mode: 'both' | 'paid',
  quality = 1,
  net: Network = NETWORK,
): ListingEstimate {
  const netAvail = net.netListings * 8 * 12; // network average: 8 open nights a listing a month
  const netFree = net.members * net.freeUsed;
  const netPaid = net.members * net.paidPer;
  const demand = netFree + netPaid;
  const fill = Math.min(1, demand / netAvail);
  const freeShare = demand > 0 ? netFree / demand : 0;

  const paidVolume = netPaid * net.netRate * MEMBER_RATE;
  const pool = 0.6 * net.members * net.fee + 0.25 * PLATFORM_TAKE * paidVolume;

  const hostAvail = open * 12;
  const hostFilled = hostAvail * fill;
  const hostFree = mode === 'both' ? hostFilled * freeShare : 0;
  const hostPaid = hostFilled * (1 - freeShare);

  const wH = rateWeight(rate);
  const wN = rateWeight(net.netRate);
  const netHostedPts = Math.min(netFree, netAvail) * wN;
  const netAvailPts = netAvail * wN;
  const hostedPts = hostFree * wH * quality;
  const availPts = hostAvail * wH * quality * (mode === 'paid' ? 0.5 : 1);

  const poolHosted = netHostedPts > 0 ? 0.75 * pool * (hostedPts / netHostedPts) : 0;
  const poolAvailable = 0.25 * pool * (availPts / netAvailPts);
  const paid = hostPaid * rate * MEMBER_RATE * (1 - PLATFORM_TAKE);
  return { paid, poolHosted, poolAvailable, total: paid + poolHosted + poolAvailable };
}

export const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/** Pool shares pay 15 days after the quarter closes. */
export function nextPoolPayout(from: Date = new Date()): Date {
  const qEndMonth = Math.floor(from.getMonth() / 3) * 3 + 3; // first month of next quarter
  return new Date(from.getFullYear(), qEndMonth, 15);
}
