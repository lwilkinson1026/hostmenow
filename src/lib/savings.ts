import { PRICING_CONFIG, type PricingConfig } from '../config.ts';
import { priceStay, TAX_RATE } from './pricing.ts';

/** Assumptions for the Learn More savings slider. Stated on the page beside it. */
export const SAVINGS_ASSUMPTIONS = {
  rate: 300, // a night: between the $250 minimum and the network average
  nightsPerStay: 3,
  cleaning: 110, // a stay
  airbnbServiceFee: 0.14, // Airbnb's guest service fee, on nights and cleaning
  freeNights: 5,
};

/**
 * A year of `nights` spent at homes like these, booked on Airbnb vs on hostmenow
 * (membership included). Both pay cleaning and taxes; hostmenow's first 5 nights
 * are free and the rest are half price, via the same priceStay the app books with.
 */
export function yearOfTravel(nights: number, a = SAVINGS_ASSUMPTIONS, config: PricingConfig = PRICING_CONFIG) {
  const stays = Math.ceil(nights / a.nightsPerStay);
  const home = { retailNight: a.rate, cleaning: a.cleaning };

  const airbnbBase = nights * a.rate + stays * a.cleaning;
  const airbnb = airbnbBase * (1 + a.airbnbServiceFee + TAX_RATE);

  let free = Math.min(a.freeNights, nights);
  let left = nights;
  let stayCosts = 0;
  for (let i = 0; i < stays; i++) {
    const n = Math.min(a.nightsPerStay, left);
    const p = priceStay(home, n, free, true, config);
    free -= p.free;
    left -= n;
    stayCosts += p.total;
  }
  const membership = config.membership_monthly_usd * 12;
  const hostmenow = stayCosts + membership;
  return { stays, airbnb, hostmenow, membership, saved: airbnb - hostmenow };
}
