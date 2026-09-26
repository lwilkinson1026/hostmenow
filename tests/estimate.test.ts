import { PRICING_CONFIGS } from '../src/config.ts';
import { estimate, NETWORK, PRICING, pricingFor } from '../src/lib/estimate.ts';

// Revision 03 fixtures: priced under pricing-v3 ($25 a month) on the Revision 03 network (avg rate $200).
const V3 = pricingFor(PRICING_CONFIGS.find((c) => c.id === 'pricing-v3')!);
const R03 = {
  launch: { ...NETWORK.launch, avgRate: 200 },
  growing: { ...NETWORK.growing, avgRate: 200 },
};

// Revision 03, section 4 fixtures (quality 1.0). Allow ±$1.
const fixtures: [keyof typeof NETWORK, number, number, number, number, number, number, number, number][] = [
  ['launch', 1, 220, 8, 322, 241, 80, 542, 864],
  ['launch', 3, 210, 8, 921, 691, 230, 1552, 2473],
  ['launch', 1, 400, 5, 366, 274, 91, 616, 981],
  ['growing', 1, 220, 8, 515, 386, 129, 867, 1382],
  ['growing', 3, 210, 8, 1474, 1106, 369, 2483, 3957],
  ['growing', 1, 400, 5, 585, 439, 146, 985, 1570],
];
const near = (a: number, b: number) => Math.abs(a - b) <= 1;
for (const [stage, homes, rate, open, pool, hosted, avail, paid, total] of fixtures) {
  const e = estimate({ homes, rate, openPerMonth: open }, R03[stage], V3);
  const ok = near(e.pool, pool) && near(e.poolHosted, hosted) && near(e.poolAvail, avail) && near(e.paid, paid) && near(e.total, total);
  console.log(ok ? 'ok  ' : 'FAIL', `${stage} ${homes} homes $${rate} ${open}/mo -> pool ${e.pool.toFixed(1)} hosted ${e.poolHosted.toFixed(1)} open ${e.poolAvail.toFixed(1)} paid ${e.paid.toFixed(1)} total ${e.total.toFixed(1)}`);
}
console.log(V3.membershipPerYear === 300 && V3.poolShareOfMembership === 0.45 && V3.platformTake === 0.15 && V3.hostCardFee === 0.029 ? 'ok  ' : 'FAIL', 'pricing-v3 matches Revision 03');
console.log(PRICING.membershipPerYear === 79 * 12 ? 'ok  ' : 'FAIL', 'PRICING is the config in force (pricing-v4, $79 a month)');
// At $79 and $350 homes, a hosted free night pays close to a half-price night.
const lux = estimate({ homes: 1, rate: 300, openPerMonth: 8 }, NETWORK.launch);
const perFree = lux.poolHosted / lux.freeStays;
const halfNet = 300 * 0.5 * (1 - 0.15 - 0.029);
console.log(perFree > halfNet * 0.5 ? 'ok  ' : 'FAIL', `$79: a hosted free night on a $300 home pays $${perFree.toFixed(0)} (half-price night nets $${halfNet.toFixed(0)})`);
// Paid stays only: no hosted points, available points at half.
const both = estimate({ homes: 1, rate: 220, openPerMonth: 8 }, NETWORK.launch);
const paidOnly = estimate({ homes: 1, rate: 220, openPerMonth: 8, paidOnly: true }, NETWORK.launch);
console.log(paidOnly.poolHosted === 0 && near(paidOnly.poolAvail, both.poolAvail / 2) && near(paidOnly.paid, both.paid) ? 'ok  ' : 'FAIL', 'paid stays only');

// Monthly free-night cap: limits hosted free nights; no cap leaves the fixtures unchanged.
const busy = { homes: 1, rate: 220, openPerMonth: 13 };
const uncapped = estimate(busy, NETWORK.growing);
const capped = estimate({ ...busy, freeCapPerMonth: 1 }, NETWORK.growing);
console.log(near(estimate({ ...busy, freeCapPerMonth: null }, NETWORK.growing).total, uncapped.total) ? 'ok  ' : 'FAIL', 'no cap: unchanged');
console.log(capped.freeStays <= 12 + 1e-9 && capped.poolHosted < uncapped.poolHosted && near(capped.paid, uncapped.paid) ? 'ok  ' : 'FAIL', `cap of 1 a month: ${capped.freeStays.toFixed(1)} free nights a year (was ${uncapped.freeStays.toFixed(1)}), paid stays unchanged`);
