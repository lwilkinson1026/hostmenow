import { SEAT_RULES } from '../src/config.ts';
import { liveDays, openSeats, regionStatus, seatsForHost, seatsForListing, seatsOpen, splitSeats } from '../src/lib/seats.ts';

const check = (ok: boolean, label: string) => console.log(ok ? 'ok  ' : 'FAIL', label);
const DAY = 86400000;

check(SEAT_RULES.membersPerListing === 3, 'three members per listing');
check(seatsForListing({ openPerMonth: 8, freeCap: 4 }) === 3, 'default home (8 open, cap 4) opens 3');
check(seatsForListing({ openPerMonth: 8, freeCap: null }) === 3, 'no cap still tops out at 3');
check(seatsForListing({ openPerMonth: 8, freeCap: 2 }) === 3, 'cap of 2 carries 3');
check(seatsForListing({ openPerMonth: 8, freeCap: 1 }) === 1, 'cap of 1 carries 1');
check(seatsForListing({ openPerMonth: 0, freeCap: 4 }) === 0, 'no open nights opens none');
check(seatsForListing({ openPerMonth: 8, freeCap: 4, mode: 'paid' }) === 0, 'paid stays only opens none');
check(seatsForListing({ openPerMonth: 8, freeCap: 4, on: false }) === 0, 'opted-out listing opens none');
check(seatsForHost([{ openPerMonth: 8, freeCap: 4 }, { openPerMonth: 8, freeCap: 1 }]) === 4, 'host total sums listings');

const s3 = splitSeats(3);
check(s3.referrer === 1 && s3.host === 1 && s3.waitlist === 1, 'three seats: one each');
const s9 = splitSeats(9);
check(s9.referrer === 3 && s9.host === 3 && s9.waitlist === 3, 'nine seats: three each');
const s1 = splitSeats(1);
check(s1.referrer === 1 && s1.host === 0, 'one seat goes to the referrer');
const solo = splitSeats(3, false);
check(solo.referrer === 0 && solo.host === 1 && solo.waitlist === 2, 'unreferred host: referrer seat goes to the waitlist');

const t0 = Date.UTC(2026, 8, 1);
check(liveDays(t0, [], t0 + 30 * DAY) === 30, '30 live days');
check(liveDays(t0, [{ from: t0 + 5 * DAY, to: t0 + 15 * DAY }], t0 + 30 * DAY) === 20, 'paused days do not count');
check(liveDays(t0, [{ from: t0 + 25 * DAY }], t0 + 30 * DAY) === 25, 'an open pause counts to now');
check(!seatsOpen(t0, [], t0 + 29 * DAY).open && seatsOpen(t0, [], t0 + 29 * DAY).daysLeft === 1, 'day 29: one day left');
check(seatsOpen(t0, [], t0 + 30 * DAY).open, 'day 30: open');

check(openSeats(2900, 1000 * 3) === 100 && openSeats(3100, 3000) === 0, 'open seats');
check(regionStatus(0.9, 0) === 'open', 'fill 90%: open');
check(regionStatus(0.8, 0) === 'slow', 'fill 80%: slow');
check(regionStatus(0.65, 2) === 'slow', 'fill 65% for 2 weeks: still slow');
check(regionStatus(0.65, 4) === 'waitlist', 'fill 65% for 4 weeks: waitlist');
