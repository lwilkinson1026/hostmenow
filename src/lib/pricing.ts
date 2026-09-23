import type { Listing } from '@/data/mock';

export const TAX_RATE = 0.092; // mock; matches the spec example ($18 tax on $110 + $85)

export type StayPrice = {
  nights: number;
  free: number;
  paidNights: number;
  halfNight: number;
  nightsCost: number;
  cleaning: number;
  taxes: number;
  total: number;
};

/**
 * Price a stay. The free-night rule is an open decision (see CLAUDE.md, decision 1),
 * so it lives here and nowhere else.
 *
 * Current rule: use every free night available (up to the length of the stay),
 * then charge 50% of the retail rate for the rest. Cleaning and taxes always apply.
 * To add a per-stay cap, clamp `free` below.
 */
export function priceStay(l: Listing, nights: number, freeNightsAvailable: number, useFree = true): StayPrice {
  const free = useFree ? Math.max(0, Math.min(nights, freeNightsAvailable)) : 0;
  const paidNights = nights - free;
  const halfNight = Math.round(l.retailNight / 2);
  const nightsCost = paidNights * halfNight;
  const taxes = Math.round((nightsCost + l.cleaning) * TAX_RATE);
  return { nights, free, paidNights, halfNight, nightsCost, cleaning: l.cleaning, taxes, total: nightsCost + l.cleaning + taxes };
}

export const money = (n: number) => `$${n.toLocaleString('en-US')}`;
