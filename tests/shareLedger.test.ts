import { applyEvent, covered, pending, replay, type ReservationNights } from '../src/lib/shareLedger.ts';
const ok = (c: boolean, m: string) => console.log(c ? 'ok  ' : 'FAIL', m);
const res = (id: string, kinds: ('free' | 'paid')[], rate = 1.2): ReservationNights => ({
  bookingId: id, listingId: 'cedar', hostId: 'h1', earnRate: rate,
  nights: kinds.map((k, i) => ({ date: `2026-10-0${i + 1}`, kind: k })),
});
// free-only completes
let L = replay([{ type: 'confirmed', reservation: res('a', ['free', 'free']) }, { type: 'completed', bookingId: 'a' }]);
ok(covered(L, 'h1') === 2.4, `free-only: 2 nights x 1.2 = ${covered(L, 'h1')}`);
// paid-only
L = replay([{ type: 'confirmed', reservation: res('b', ['paid', 'paid']) }, { type: 'completed', bookingId: 'b' }]);
ok(Object.keys(L).length === 0, 'paid-only: no credit');
// mixed 2 free + 2 paid
L = replay([{ type: 'confirmed', reservation: res('c', ['free', 'free', 'paid', 'paid'], 1) }, { type: 'completed', bookingId: 'c' }]);
ok(covered(L, 'h1') === 2 && Object.keys(L).length === 2, 'mixed: 2 credits');
// member cancels
L = replay([{ type: 'confirmed', reservation: res('d', ['free']) }, { type: 'cancelled_by_member', bookingId: 'd' }]);
ok(covered(L, 'h1') === 0 && pending(L, 'h1') === 0, 'member cancel reverses pending');
// host cancels
L = replay([{ type: 'confirmed', reservation: res('e', ['free']) }, { type: 'cancelled_by_host', bookingId: 'e' }]);
ok(covered(L, 'h1') === 0, 'host cancel: no credit');
// no-show counts as completed
L = replay([{ type: 'confirmed', reservation: res('f', ['free']) }, { type: 'no_show', bookingId: 'f' }]);
ok(covered(L, 'h1') === 1.2, 'no-show final');
// duplicate webhook delivery
const conf = { type: 'confirmed' as const, reservation: res('g', ['free', 'free']) };
L = replay([conf, conf, { type: 'completed', bookingId: 'g' }, { type: 'completed', bookingId: 'g' }, conf]);
ok(Object.keys(L).length === 2 && covered(L, 'h1') === 2.4, 'duplicates: exactly one credit per night');
// late cancel after completion can't reverse final
L = applyEvent(L, { type: 'cancelled_by_member', bookingId: 'g' });
ok(covered(L, 'h1') === 2.4, 'final credit not reversed by stray cancel');
