import { listingEligibility } from '../src/lib/eligibility.ts';

const check = (ok: boolean, label: string) => console.log(ok ? 'ok  ' : 'FAIL', label);
const good = { rate: 300, rating: 4.92, reviews: 64, eligible: true };

check(listingEligibility(good).ok, 'a $300 home rated 4.92 with 64 reviews joins');
check(listingEligibility({ ...good, rate: 249 }).reason === 'Below the $250 nightly minimum', 'under $250 is out');
check(listingEligibility({ ...good, rating: 4.79 }).reason === 'Rated 4.79. Homes need 4.8 or higher', 'rated under 4.8 is out');
check(listingEligibility({ ...good, rating: 4.8 }).ok, 'exactly 4.8 is in');
check(listingEligibility({ ...good, reviews: 9 }).reason === 'Needs 10 reviews to join (has 9)', 'fewer than 10 reviews is out');
check(listingEligibility({ ...good, eligible: false, reason: 'Not live on Hostshare yet' }).reason === 'Not live on Hostshare yet', "Hostshare's own reason comes first");
