// Product rules that are still being decided live here, not in screens.

/**
 * Free nights unlock this many days after a member's grant is issued, to stop
 * "join, burn 5 nights, cancel". Open decision (handoff section 3): the handoff
 * proposes 60. Off (0) in the prototype until Landon decides; the dev menu can
 * switch it on to preview.
 */
export const FREE_NIGHTS_UNLOCK_AFTER_DAYS = 0;
export const FREE_NIGHTS_UNLOCK_PREVIEW_DAYS = 60;

/** Free nights return to the bank when a trip is cancelled at least this long before check-in. */
export const FREE_NIGHT_REFUND_CUTOFF_HOURS = 24;

/** Check-in and checkout times used across trips. */
export const CHECK_IN_HOUR = 16;
export const CHECKOUT_HOUR = 11;

/**
 * Pricing (Revision 03, margin plan). One versioned record: bookings, pool
 * quarters and payouts store the version they used, so past quarters can be
 * recalculated exactly as they were paid. Add a new version rather than editing
 * one that has been in force.
 */
export type PricingConfig = {
  id: string;
  effective_from: string;
  membership_monthly_usd: number;
  booking_fee_usd: number;
  pool_share_of_membership: number;
  platform_take_on_paid_stays: number;
  pool_share_of_take: number;
  host_card_fee_rate: number;
  paid_night_discount: number;
  /** Tax hook: whether the booking fee is taxed in a market. Counsel to decide per market (open). */
  booking_fee_taxable: (market: string) => boolean;
};

export const PRICING_CONFIGS: PricingConfig[] = [
  {
    id: 'pricing-v3',
    effective_from: '2026-09-24',
    membership_monthly_usd: 25,
    booking_fee_usd: 20,
    pool_share_of_membership: 0.45,
    platform_take_on_paid_stays: 0.15,
    pool_share_of_take: 0.25,
    host_card_fee_rate: 0.029,
    paid_night_discount: 0.5,
    booking_fee_taxable: () => false,
  },
];

/** The config in force on a date (defaults to today). */
export function pricingOn(date: Date = new Date()): PricingConfig {
  const iso = date.toISOString().slice(0, 10);
  const inForce = PRICING_CONFIGS.filter((c) => c.effective_from <= iso).sort((a, b) => b.effective_from.localeCompare(a.effective_from));
  return inForce[0] ?? PRICING_CONFIGS[0];
}

export const PRICING_CONFIG = pricingOn();
export const MEMBERSHIP_MONTHLY = PRICING_CONFIG.membership_monthly_usd;
export const BOOKING_FEE = PRICING_CONFIG.booking_fee_usd;

/** The name in running text. The logo (wordmark, labels, badges) never carries the mark. */
export const BRAND = 'hostmenow™';
