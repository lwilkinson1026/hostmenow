import { PRICING_CONFIG, type PricingConfig } from '../config.ts';

export const TAX_RATE = 0.092; // mock; matches the spec example ($18 tax on $110 + $85)

/** What pricing needs from a listing. */
export type PricedListing = { retailNight: number; cleaning: number };

export type StayPrice = {
  nights: number;
  free: number;
  paidNights: number;
  halfNight: number;
  nightsCost: number;
  cleaning: number;
  /** Per booking, not per night, on free and paid stays (Revision 03). Platform revenue. */
  bookingFee: number;
  taxes: number;
  total: number;
  /** The pricing config version this was priced under. */
  pricingConfigId: string;
};

/**
 * Price a stay. The free-night rule is an open decision (see CLAUDE.md, decision 1),
 * so it lives here and nowhere else.
 *
 * Current rule: use every free night available (up to the length of the stay),
 * then charge 50% of the retail rate for the rest. Cleaning, the booking fee and
 * taxes always apply. To add a per-stay cap, clamp `free` below.
 *
 * Taxes cover nights and cleaning. Whether the booking fee is taxed is decided per
 * market by counsel (config.booking_fee_taxable), so it goes through that hook.
 */
export function priceStay(
  l: PricedListing,
  nights: number,
  freeNightsAvailable: number,
  useFree = true,
  config: PricingConfig = PRICING_CONFIG,
  market = 'default',
): StayPrice {
  const free = useFree ? Math.max(0, Math.min(nights, freeNightsAvailable)) : 0;
  const paidNights = nights - free;
  const halfNight = Math.round(l.retailNight * config.paid_night_discount);
  const nightsCost = paidNights * halfNight;
  const bookingFee = config.booking_fee_usd;
  const taxBase = nightsCost + l.cleaning + (config.booking_fee_taxable(market) ? bookingFee : 0);
  const taxes = Math.round(taxBase * TAX_RATE);
  return {
    nights,
    free,
    paidNights,
    halfNight,
    nightsCost,
    cleaning: l.cleaning,
    bookingFee,
    taxes,
    total: nightsCost + l.cleaning + bookingFee + taxes,
    pricingConfigId: config.id,
  };
}

export type HostPayout = {
  /** Paid nights at 50%, after the platform fee. */
  stays: number;
  cleaning: number;
  /** Card fees on the stay and cleaning amounts, deducted from the host payout. */
  cardFees: number;
  net: number;
  /** What hostmenow keeps on paid nights, and the part of it that goes to the pool. */
  platformFee: number;
  platformFeeToPool: number;
};

/**
 * What the host receives for a booking (Revision 03, 3.4 and 3.5). Pool payouts
 * are separate and never carry card fees. The booking fee is platform revenue and
 * never reaches the host or the pool.
 */
export function hostPayout(p: StayPrice, config: PricingConfig = PRICING_CONFIG): HostPayout {
  const platformFee = p.nightsCost * config.platform_take_on_paid_stays;
  const stays = p.nightsCost - platformFee;
  const cardFees = config.host_card_fee_rate * (p.nightsCost + p.cleaning);
  return {
    stays,
    cleaning: p.cleaning,
    cardFees,
    net: stays + p.cleaning - cardFees,
    platformFee,
    platformFeeToPool: platformFee * config.pool_share_of_take,
  };
}

export const money = (n: number) => `$${n.toLocaleString('en-US')}`;
