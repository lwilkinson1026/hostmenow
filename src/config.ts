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

export const MEMBERSHIP_MONTHLY = 20;

/** The name in running text. The logo (wordmark, labels, badges) never carries the mark. */
export const BRAND = 'hostmenow™';
