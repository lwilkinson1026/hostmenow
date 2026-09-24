import { hostPayout, priceStay } from '../src/lib/pricing.ts';
import { PRICING_CONFIG } from '../src/config.ts';

const ok = (c: boolean, m: string) => console.log(c ? 'ok  ' : 'FAIL', m);
const near = (a: number, b: number) => Math.abs(a - b) < 0.005;
const home = { retailNight: 220, cleaning: 85 };

// Free-only: member pays cleaning + $20 (+ taxes); host gets cleaning less 2.9%; no nightly payout.
const free = priceStay(home, 2, 5);
const freePay = hostPayout(free);
ok(free.nightsCost === 0 && free.bookingFee === 20 && free.total === 85 + 20 + free.taxes, `free-only: member pays cleaning + $20 booking fee + taxes ($${free.total})`);
ok(freePay.stays === 0 && near(freePay.net, 85 - 0.029 * 85), `free-only: host gets cleaning less 2.9% ($${freePay.net.toFixed(2)})`);

// Paid-only, 2 nights at $220 retail: member pays 2 x $110 + cleaning + $20.
const paid = priceStay(home, 2, 0);
const paidPay = hostPayout(paid);
ok(paid.nightsCost === 220 && paid.total === 220 + 85 + 20 + paid.taxes, `paid-only: member pays 2 x $110 + cleaning + $20 + taxes ($${paid.total})`);
ok(near(paidPay.stays, 2 * 110 * 0.85) && near(paidPay.cardFees, 0.029 * (220 + 85)), 'paid-only: host gets 2 x $110 x 0.85, less 2.9% of stay and cleaning');
ok(near(paidPay.platformFee, 220 * 0.15) && near(paidPay.platformFeeToPool, 220 * 0.15 * 0.25), 'paid-only: platform fee 15%, 25% of it to the pool');

// Mixed: one booking fee, not two.
const mixed = priceStay(home, 4, 2);
ok(mixed.free === 2 && mixed.paidNights === 2 && mixed.bookingFee === 20, 'mixed: one $20 booking fee');

// Booking fee is taxed only where the market hook says so.
const taxed = priceStay(home, 2, 0, true, { ...PRICING_CONFIG, booking_fee_taxable: () => true });
ok(taxed.taxes > paid.taxes, 'booking fee tax goes through the per-market hook');
ok(paid.pricingConfigId === PRICING_CONFIG.id, 'bookings record their pricing config version');
