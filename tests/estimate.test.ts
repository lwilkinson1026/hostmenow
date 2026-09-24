import { estimate, NETWORK } from '../src/lib/estimate.ts';

// Revision 02, section 6 fixtures (quality 1.0). Allow ±$1.
const fixtures: [keyof typeof NETWORK, number, number, number, number, number, number, number, number][] = [
  ['launch', 1, 220, 8, 337, 252, 84, 581, 917],
  ['launch', 3, 210, 8, 964, 723, 241, 1663, 2627],
  ['launch', 1, 400, 5, 383, 287, 96, 660, 1043],
  ['growing', 1, 220, 8, 539, 404, 135, 929, 1468],
  ['growing', 3, 210, 8, 1542, 1157, 386, 2661, 4203],
  ['growing', 1, 400, 5, 612, 459, 153, 1056, 1668],
];
const near = (a: number, b: number) => Math.abs(a - b) <= 1;
for (const [stage, homes, rate, open, pool, hosted, avail, paid, total] of fixtures) {
  const e = estimate({ homes, rate, openPerMonth: open }, NETWORK[stage]);
  const ok = near(e.pool, pool) && near(e.poolHosted, hosted) && near(e.poolAvail, avail) && near(e.paid, paid) && near(e.total, total);
  console.log(ok ? 'ok  ' : 'FAIL', `${stage} ${homes} homes $${rate} ${open}/mo -> pool ${e.pool.toFixed(1)} hosted ${e.poolHosted.toFixed(1)} open ${e.poolAvail.toFixed(1)} paid ${e.paid.toFixed(1)} total ${e.total.toFixed(1)}`);
}
// Paid stays only: no hosted points, available points at half.
const both = estimate({ homes: 1, rate: 220, openPerMonth: 8 }, NETWORK.launch);
const paidOnly = estimate({ homes: 1, rate: 220, openPerMonth: 8, paidOnly: true }, NETWORK.launch);
console.log(paidOnly.poolHosted === 0 && near(paidOnly.poolAvail, both.poolAvail / 2) && near(paidOnly.paid, both.paid) ? 'ok  ' : 'FAIL', 'paid stays only');
