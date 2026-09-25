import type { StayPrice } from './pricing.ts';
import { staySaved } from './value.ts';

type Stay = { listingId: string; price: Pick<StayPrice, 'nights' | 'free' | 'paidNights' | 'halfNight'> };

/** What a member's stays have been worth against retail: the nights, and the dollars saved. */
export function staysWorth(stays: Stay[], retailOf: (listingId: string) => number | undefined) {
  return stays.reduce(
    (acc, b) => {
      const retail = retailOf(b.listingId);
      if (retail === undefined) return acc;
      return { nights: acc.nights + b.price.nights, saved: acc.saved + staySaved(retail, b.price.free, b.price.paidNights, b.price.halfNight) };
    },
    { nights: 0, saved: 0 },
  );
}

/** Whole dollars with separators: "$1,320". */
export const dollars = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
