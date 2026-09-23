# hostmenow

Invite-only travel membership. 5 nights free. 5 days out.

Clickable prototype on mock data: Expo SDK 57, Expo Router, TypeScript. iPhone first, plus the locked web landing at 1440.

## Run it

```bash
pnpm install
pnpm start        # scan the QR code with Expo Go on an iPhone
pnpm web          # web: landing at full width, the app as a centered phone column
pnpm typecheck
pnpm lint
pnpm test         # range picking and share-credit ledger rules
```

Cameras only run on a real device. On the simulator and on web, the ID, selfie and video screens show a dark placeholder and still auto-advance.

## The prototype path

Landing (any code works, `BADCODE` shows the invalid state) → Welcome → Sign in → ID → Selfie → House rules → Say hello → Q1 → Q2 → Q3 → Pay → You're in → Explore → Cedar A-Frame → Stay free → Confirmed → Trip.

Also wired: the three tabs, the List / Map toggle, search, date chips, the nights pill opening the Nights bank, You opening Nights bank, Invites and House rules, Re-record, Sign out returning to the landing, and Cancel trip (refunds free nights).

**Dev menu:** long-press the `hostmenow` wordmark on Explore to switch mock states: nights bank 5 or 0, membership paused, ID verifying or failed, empty Explore, empty Trips.

## Host opt-in (Hostshare hosts)

"Earn as a Host" at the bottom of the landing opens the host flow as it would appear inside the Hostshare app: dashboard card → value → choose listings → who you'll host → payouts and W-9 → terms → live with 5 host invites → the dashboard card becomes quarterly earnings ("Manage" edits listings).

**Revision 01 (free member stays count toward Hostshare share nights):** the prototype carries the host copy, the "Share nights covered by hostmenow" row, and a reference share-credit ledger in `src/lib/shareLedger.ts` (earn-rate weighted, pending at booking, final on completion or no-show, reversed on member cancel, none on host cancel, idempotent per booking night). Bookings record which nights were free or paid and send that in the reservation payload (`src/services/reservations.ts`). The real ledger, webhooks and backfill belong in the Hostshare backend, which isn't in this repo.

Estimates use the pool model from the handoff calculator (`src/lib/pool.ts`) with each listing's rate and open nights. Opt-in is mocked in `src/services/hostshare.ts`; the real version writes `hostmenow_optins` records against the host's Hostshare session.

## Layout

```
app/            routes (Expo Router, typed routes on)
src/theme.ts    design tokens
src/data/       mock member, listings, invites
src/lib/        pricing (priceStay), dates, insets
src/store/      zustand app state (member, nights bank, bookings)
src/services/   the only seam to real providers: auth, identity, payments, invites/share, haptics
src/components/ shared UI (buttons, cards, chips, sheet, tab bar, map, camera)
docs/           design spec and the approved screen references
```

Every mocked provider lives in `src/services/` and resolves after a short, realistic delay. Swap in `expo-apple-authentication`, Stripe and the ID vendor there without touching screens.

## Open decisions (for Landon)

1. **Free nights per stay.** `priceStay` in `src/lib/pricing.ts` uses every free night available, then 50% for the rest. With 5 nights banked, the default 3-night Cedar stay is fully free ($93 total) and the pill goes 5 to 2, not the spec's 5 to 3. Is there a per-stay cap? It's a one-line change.
2. **Accent contrast.** `#8A7A63` is kept as specified. It sits just under WCAG AA for the small "Free" label; `#7A6B55` would pass.
3. **Real services:** auth provider, ID verification vendor, payments (Stripe with Apple Pay?), and the Hostshare listings API.

## Notes and small calls I made

- The booking sheet is a component presented over the listing (the brief's `book/[id]` route was a suggestion). No filters sheet: there's no design for one.
- iOS maps use Apple's muted style. The grayscale JSON style only applies with the Google provider. Web shows the static map from the designs.
- Mock data additions: descriptions, amenities and street names for the five non-Cedar homes, a seeded Coast Loft trip ("Awaiting host", matching the Trips design), and Lake Cabin closed on day 5 to show an unavailable date chip.
- New copy not in the spec, for review: "No past trips yet.", "You've used your invites for this year.", "Your membership is paused." (when 0 nights), "Cancel your trip to Cedar A-Frame?" / "Keep trip", "2 of 5 nights left".
- Not wired yet (tap does nothing): Message host, Help, Get help, Payment methods, Privacy.
