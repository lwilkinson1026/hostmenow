# hostmenow: Design Specification v0.1

## 1. What we're designing

hostmenow is an invite-only travel membership. Members get 5 free nights a year at private homes (paying only the cleaning fee), bookable only within 5 days of check-in. After their free nights, they get 50% off the home's retail rate, same 5-day window. Homes come from Hostshare, a host-to-host exchange network.

Design a standalone mobile app (iPhone first) plus a one-page locked web landing. Clickable prototype, mock data.

**The feeling:** a private club with an unmarked door. Hard to get into, effortless once you're in. Think Jony Ive era Apple: reduce until only the essential remains, then make that essential feel inevitable. Calm, confident, quiet luxury. Never salesy.

**Pitch line:** 5 nights free. 5 days out.

## 2. Design principles

1. **Locked front door.** The public surface shows almost nothing. No pricing, no listing previews, no signup without an invite.
2. **One thing per screen.** Onboarding shows a single question or action at a time, full screen.
3. **Photography carries the product.** Homes are full-bleed photos. Text is secondary.
4. **Restraint.** No badges, banners, gamification, confetti, upsells or promotional color.
5. **Airbnb-familiar inside.** Search, listing, book, trip. No new mental model.
6. **The nights bank is the only number that matters.** Always visible, never shouted.
7. **Motion with purpose.** Soft, physical transitions. Nothing decorative.
8. **Generous whitespace.** When in doubt, remove.

## 3. Visual system

### Color

| Token | Hex | Use |
|---|---|---|
| `bg` | #FFFFFF | Primary background |
| `bg-subtle` | #F5F5F4 | Cards on white, input fields, grouped sections |
| `ink` | #111111 | Primary text, primary buttons |
| `ink-secondary` | #6B6B6B | Secondary text, captions |
| `ink-tertiary` | #A3A3A3 | Placeholders, disabled |
| `line` | #E7E5E4 | Hairline dividers (0.5 to 1 px) |
| `accent` | #8A7A63 | Warm stone. Used sparingly: "Free" label, selected dates, focus rings |
| `danger` | #B42318 | Errors only |

Dark mode: invert to `bg` #0B0B0B, `ink` #F5F5F4, keep accent. Onboarding and the locked landing are dark by default for drama; the app interior is light by default.

### Typography

- Family: SF Pro (iOS), Inter (web fallback). Two weights only: Regular 400 and Semibold 600.
- Wordmark: "hostmenow" all lowercase, Semibold, tight tracking (-2%).

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| Display | 40 / 44 | Semibold, -2% tracking | Onboarding headlines, landing |
| Title | 28 / 34 | Semibold | Screen titles |
| Heading | 20 / 26 | Semibold | Listing names, section headers |
| Body | 17 / 24 | Regular | Default text |
| Callout | 15 / 20 | Regular | Card metadata, prices |
| Caption | 13 / 18 | Regular | Fine print, expiry dates |

### Spacing, shape, elevation

- 4 pt base grid. Common spacings: 8, 16, 24, 32, 48.
- Screen side margin: 24.
- Corner radius: 12 for cards and images, 999 (pill) for buttons and chips, 20 for bottom sheets.
- No drop shadows except bottom sheets (very soft, 0 8 32 rgba(0,0,0,0.08)).
- Dividers are hairlines, never boxes.

### Iconography

- SF Symbols style, 1.5 px stroke, outline only. Filled only for the selected tab.
- Icons never stand alone as decoration.

### Imagery

- Full-bleed, natural light architectural and interior photography. Warm, uncluttered, no people.
- Mood: Pacific Northwest cabins, desert modern, mountain A-frames, coastal houses.
- Onboarding backgrounds: a single slowly drifting (Ken Burns, 20 s) home photo under a 60% black overlay.

### Motion

- Step transitions: horizontal push, 350 ms, ease-out spring (damping high, no bounce).
- Sheet presentation: rise from bottom, 300 ms.
- Buttons: 0.97 scale on press.
- Progress line at top of onboarding fills smoothly between steps.
- Haptic: light impact on primary actions, success notification on payment and booking.

## 4. Components

- **Primary button:** full width minus margins, 56 tall, pill, `ink` fill with white label (inverted in dark). One per screen.
- **Secondary button:** text only, `ink`, Body Semibold.
- **Apple Pay button:** native style, black.
- **Progress line:** 2 px tall, full width at very top, fills left to right across onboarding. No step numbers.
- **Listing card:** 4:5 photo, radius 12, below it: place name (Heading), region (Callout secondary), price line (Callout). Price line is either "Free · cleaning $85" with "Free" in `accent`, or "$110 night" with the retail "$220" struck through in `ink-tertiary`.
- **Nights pill:** top right of Explore. "5 nights" in Callout Semibold on `bg-subtle` pill. Taps to Nights bank.
- **Date chips:** horizontal row of the next 5 days only (e.g. Thu 24, Fri 25, Sat 26, Sun 27, Mon 28). Selected = `ink` fill. Unavailable = `ink-tertiary`.
- **Tab bar:** three tabs, icon + label: Explore, Trips, You. Hairline top border, no background tint.
- **Segmented toggle:** List / Map.
- **Bottom sheet:** used for booking summary and filters.
- **Avatar:** circular, 40 (lists) or 64 (profile).
- **Video tile:** 9:16 rounded 12, play glyph centered, used on profile.

## 5. Screens

Frame: iPhone 15/16, 393 x 852. Web landing: 1440 wide plus a 393 mobile version.

### A. Locked landing (web and app first launch)

- Dark. Full-bleed drifting home photo under overlay.
- Center: wordmark "hostmenow".
- Below: "5 nights free. 5 days out." in Body, `ink-secondary` on dark.
- Bottom: single text field "Invite code" with an arrow button. Nothing else. No nav, no footer beyond a tiny "Privacy" caption.
- State: invalid code shakes the field once, caption "That code isn't valid."

### B. Onboarding (dark, one card per step, progress line at top)

**B1. Invite welcome**
- Inviter avatar (64) centered, above: "Sarah Chen invited you."
- Display headline: "Welcome to hostmenow."
- Body: "A private network of homes. Five nights on us each year."
- Button: "Continue"

**B2. Sign in**
- Title: "Let's get you in."
- Buttons stacked: Continue with Apple, Continue with Google, Use phone number.
- Caption: "No passwords. Ever."

**B3. ID scan (two sub-steps)**
- B3a: Title "Your ID." Live camera frame with a rounded rectangle guide. Caption "Driver's license or passport. We never share it." Auto-captures.
- B3b: Title "Now you." Circular selfie guide. Auto-captures.
- After capture: small caption "Verifying in the background" with a subtle spinner. User moves on immediately.

**B4. House rules**
- Title: "The house rules."
- Four lines, generous spacing (placeholder copy):
  - Treat every home like a friend lent it to you.
  - Problems go to the host first, calmly.
  - Leave it the way you found it.
  - One strike and you're out. Your inviter will hear about it too.
- Button: "I'm in"

**B5. Video intro (intro + 3 question screens)**
- B5 intro: Title "Say hello." Body "Three quick questions. 15 seconds each. Hosts see this only after you book." Button "Start"
- B5 question screens: full-screen front camera. Question in Heading at top on a soft dark gradient. Circular countdown ring around the record button (15 s). Small "Retake" text after recording. Auto-advances.
  - Q1 (placeholder): "Who invited you, and how do you know them?"
  - Q2 (placeholder): "You arrive and something isn't right. What do you do first?"
  - Q3 (placeholder): "How do you leave a place when you check out?"

**B6. Pay**
- Title: "Your membership."
- Large: "$99" Display, caption "First year. Then $20 a month. Cancel anytime."
- Line items (hairline separated): "5 free nights every year", "50% off every night after that", "Nights roll over for 5 years".
- Apple Pay button. Secondary: "Pay with card".

**B7. You're in**
- Display: "5 nights are yours."
- Body: "Anywhere on hostmenow, within 5 days of arrival."
- Button: "Start exploring" (transitions from dark onboarding to the light app with a soft cross-fade).

### C. Explore (tab 1)

- Top: wordmark left, Nights pill right ("5 nights").
- Search field: "Where to?" on `bg-subtle` pill.
- Date chips row: next 5 days.
- List / Map toggle.
- Vertical feed of listing cards, one per row, generous spacing.
- Map view: minimal monochrome map (Mapbox style, grayscale), price pills as markers ("Free" or "$110"), selected marker opens a compact card at bottom.
- Empty state: "Nothing open nearby in the next 5 days. Check back tomorrow, homes open up daily."

### D. Listing detail

- Full-bleed photo carousel (top 55% of screen), page dots, back and share buttons floating in white circles.
- Name (Title), region and "Hosted by Marcus" with avatar (40).
- Three facts in a row with icons: guests, bedrooms, baths.
- Short description (3 lines, "More" expands).
- Amenities as a row of icons with labels, max 6, "All amenities" link.
- Location: static monochrome map, approximate area.
- House rules summary line.
- Sticky bottom bar: price on left ("Free · cleaning $85" or "$110 night" with "$220" struck), button right: "Stay free" or "Book".

### E. Book (bottom sheet)

- Date chips (5-day window) for check-in and a stepper for nights.
- Guests stepper.
- Breakdown (hairline rows):
  - 2 free nights (from your bank) · $0
  - 1 night at 50% · $110
  - Cleaning · $85
  - Taxes · $18
  - Total · $213
- Toggle: "Use free nights" (on by default).
- Apple Pay button.

### F. Booking confirmed

- Light screen, the home's photo at top, rounded.
- Title: "You're going to Cedar A-Frame."
- Dates, "Check-in details arrive 24 hours before."
- Nights pill updates animated from 5 to 3.
- Buttons: "View trip", secondary "Back to explore".

### G. Trips (tab 2)

- Title "Trips". Segments: Upcoming / Past.
- Trip rows: square thumbnail (radius 12), name, dates, status caption ("Confirmed", "Awaiting host").
- Empty: "No trips yet. Something's always open within 5 days."

### H. Trip detail

- Photo header, name, dates.
- Sections separated by hairlines: Check-in (time, door code revealed 24 h before, shown locked until then), Address (with map), Host (avatar, "Message"), House rules, Receipt, Cancel trip (secondary, `danger` text).

### I. You (tab 3)

- Avatar (64), name, "Member since Sep 2026", "Invited by Sarah Chen".
- Video tile (own intro), "Re-record".
- Grouped list rows:
  - Nights bank · "5 nights" >
  - Invites · "3 left" >
  - Membership · "$99 · renews Sep 2027" >
  - Payment methods >
  - House rules >
  - Help >
  - Sign out

### J. Nights bank

- Big number: "5" Display, caption "free nights".
- Grant list (hairline rows): "5 nights · granted Sep 23, 2026 · expires Sep 23, 2031".
- Caption at bottom: "Free nights are used oldest first. You get 5 more every year."

### K. Invites

- Title "Invite someone good."
- Body: "You have 3 invites. You're vouching for them."
- Button: "Send an invite" (native share sheet with a personal link).
- List of sent invites: name or "Pending", status caption.

### L. States to include

- ID still verifying when trying to book: sheet "One moment. We're still checking your ID." with spinner, resolves to success.
- ID failed: calm dark screen "We need one more look." with "Try again" and "Get help".
- Membership lapsed: Explore shows a subtle top banner "Your membership is paused. Your 5 nights are safe." Button "Resume".

## 6. Mock data

**Member:** Jordan Ellis, member since Sep 2026, invited by Sarah Chen, 5 nights banked, 3 invites.

**Listings (all available in the next 5 days):**

| Name | Region | Guests / bd / ba | Retail night | Cleaning | Host |
|---|---|---|---|---|---|
| Cedar A-Frame | Leavenworth, WA | 4 / 2 / 1 | $220 | $85 | Marcus |
| Lake Cabin on Pend Oreille | Sandpoint, ID | 6 / 3 / 2 | $340 | $120 | Dana |
| Desert Modern | Joshua Tree, CA | 4 / 2 / 2 | $280 | $95 | Priya |
| Orchard House | Yakima, WA | 8 / 4 / 3 | $260 | $110 | Landon |
| Coast Loft | Cannon Beach, OR | 2 / 1 / 1 | $190 | $70 | Sam |
| Ski Chalet | Whitefish, MT | 6 / 3 / 2 | $410 | $140 | Alex |

Show a mix of cards in "Free" state and "50%" state (e.g. after the member has used their nights).

## 7. Deliverables

1. Locked landing: web 1440 and mobile 393
2. Onboarding flow B1 to B7 (dark)
3. App screens C to K (light), plus Explore map view
4. States in L
5. A small component sheet: buttons, cards, chips, tab bar, nights pill, sheet
6. Link screens into a clickable prototype: landing → onboarding → Explore → listing → book → confirmed → trip
