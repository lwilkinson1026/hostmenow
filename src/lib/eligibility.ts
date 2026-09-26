import { MIN_NIGHTLY_RATE, QUALITY_BAR } from '../config.ts';

export type EligibilityInput = {
  rate: number;
  rating: number;
  reviews: number;
  /** Hostshare's own checks (last-minute availability on, live on Hostshare). */
  eligible: boolean;
  reason?: string;
};

/** Whether a listing can join the club, and the first reason it can't. */
export function listingEligibility(l: EligibilityInput, minRate = MIN_NIGHTLY_RATE, bar = QUALITY_BAR): { ok: boolean; reason?: string } {
  if (!l.eligible) return { ok: false, reason: l.reason };
  if (l.rate < minRate) return { ok: false, reason: `Below the $${minRate} nightly minimum` };
  if (l.reviews < bar.minReviews) return { ok: false, reason: `Needs ${bar.minReviews} reviews to join (has ${l.reviews})` };
  if (l.rating < bar.minRating) return { ok: false, reason: `Rated ${l.rating.toFixed(2)}. Homes need ${bar.minRating} or higher` };
  return { ok: true };
}
