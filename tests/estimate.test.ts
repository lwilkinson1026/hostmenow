import { estimate, NETWORK, PRICING } from '../src/lib/estimate.ts';

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
  const e = estimate({ homes, rate, openPerMonth: open }, NETWORK[stage]);
  const ok = near(e.pool, pool) && near(e.poolHosted, hosted) && near(e.poolAvail, avail) && near(e.paid, paid) && near(e.total, total);
  console.log(ok ? 'ok  ' : 'FAIL', `${stage} ${homes} homes $${rate} ${open}/mo -> pool ${e.pool.toFixed(1)} hosted ${e.poolHosted.toFixed(1)} open ${e.poolAvail.toFixed(1)} paid ${e.paid.toFixed(1)} total ${e.total.toFixed(1)}`);
}
console.log(PRICING.membershipPerYear === 300 && PRICING.poolShareOfMembership === 0.45 && PRICING.platformTake === 0.15 && PRICING.hostCardFee === 0.029 ? 'ok  ' : 'FAIL', 'PRICING comes from the Revision 03 config');
// Paid stays only: no hosted points, available points at half.
const both = estimate({ homes: 1, rate: 220, openPerMonth: 8 }, NETWORK.launch);
const paidOnly = estimate({ homes: 1, rate: 220, openPerMonth: 8, paidOnly: true }, NETWORK.launch);
console.log(paidOnly.poolHosted === 0 && near(paidOnly.poolAvail, both.poolAvail / 2) && near(paidOnly.paid, both.paid) ? 'ok  ' : 'FAIL', 'paid stays only');
