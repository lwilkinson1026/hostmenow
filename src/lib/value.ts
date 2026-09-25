import type { Listing } from '../data/mock.ts';

/**
 * What free nights are worth, in retail dollars at the homes a member can drive to.
 * Shown quietly on the Nights bank ("about $1,250 at homes near you"), never shouted.
 */
export function nightValue(listings: Pick<Listing, 'retailNight' | 'travel'>[]) {
  const near = listings.filter((l) => l.travel.mode === 'drive');
  const pool = near.length ? near : listings;
  return pool.reduce((sum, l) => sum + l.retailNight, 0) / Math.max(1, pool.length);
}

/** Round to a friendly figure: nearest $50 over $500, else nearest $10. */
export const aboutMoney = (n: number) => `$${(n >= 500 ? Math.round(n / 50) * 50 : Math.round(n / 10) * 10).toLocaleString('en-US')}`;

/** What a stay saved against the home's retail rate: free nights in full, paid nights by half. */
export const staySaved = (retailNight: number, free: number, paidNights: number, halfNight: number) =>
  free * retailNight + paidNights * (retailNight - halfNight);
