import { accruedPool, poolPerDay, quarterStart } from '../src/lib/poolAccrual.ts';
import { estimate, NETWORK } from '../src/lib/estimate.ts';

const ok = (c: boolean, m: string) => console.log(c ? 'ok  ' : 'FAIL', m);
const DAY = 86400000;
const t0 = new Date(2026, 6, 1).getTime();
const cedar = { id: 'c', rate: 220, openNights: 8, mode: 'both' as const, liveFrom: t0 };
const perDay = estimate({ homes: 1, rate: 220, openPerMonth: 8 }, NETWORK.launch).pool / 365;

ok(Math.abs(poolPerDay(cedar) - perDay) < 1e-9, 'per-day rate is the yearly pool share / 365');
ok(Math.abs(accruedPool([cedar], [], t0, t0 + 10 * DAY) - 10 * perDay) < 1e-6, '10 open days accrue 10 days');
ok(Math.abs(accruedPool([cedar], [{ listingId: 'c', from: t0 + 2 * DAY, to: t0 + 5 * DAY }], t0, t0 + 10 * DAY) - 7 * perDay) < 1e-6, 'a 3-day pause removes 3 days');
ok(Math.abs(accruedPool([cedar], [{ listingId: 'c', from: t0 + 4 * DAY }], t0, t0 + 10 * DAY) - 4 * perDay) < 1e-6, 'still paused: accrual stops at the pause');
ok(accruedPool([{ ...cedar, liveFrom: t0 + 20 * DAY }], [], t0, t0 + 10 * DAY) === 0, 'nothing before the listing joins');
const paid = accruedPool([{ ...cedar, mode: 'paid' }], [], t0, t0 + 10 * DAY);
ok(paid > 0 && paid < 10 * perDay, 'paid stays only accrues less');
ok(quarterStart(new Date(2026, 8, 24)).getTime() === new Date(2026, 6, 1).getTime(), 'quarter of Sep 24 starts Jul 1');
