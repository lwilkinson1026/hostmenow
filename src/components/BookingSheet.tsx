import { forwardRef, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { freeNightsAt, type Listing } from '@/data/mock';
import { addDays, fullDate, longDay, plural, shortDay, toISODate, today } from '@/lib/dates';
import { money, priceStay } from '@/lib/pricing';
import { nightsIn, rangeOpen, type Range, type RangeRules } from '@/lib/range';
import { haptics, payments } from '@/services';
import { freeNightsOf, unlockDate, useApp, useFreeNights, useIsOpen, type Booking } from '@/store/app';
import { colors } from '@/theme';
import { PayButton } from './Buttons';
import { RangeChips } from './RangeChips';
import { LineItem } from './Rows';
import { Sheet, type SheetRef } from './Sheet';
import { Stepper } from './Stepper';
import { T } from './Text';

const MAX_NIGHTS = 7;
const DAYS_SHOWN = 10;

type Props = { listing: Listing; onBooked: (b: Booking) => void };

type PanelProps = Props & {
  onPayingChange?: (paying: boolean) => void;
  /** Checks before paying (paused membership, ID). Resolve false to stop. */
  beforePay?: () => Promise<boolean>;
};

/** E. Book, as a bottom sheet (phones). */
export const BookingSheet = forwardRef<SheetRef, Props>(function BookingSheet({ listing, onBooked }, ref) {
  const [paying, setPaying] = useState(false);
  return (
    <Sheet ref={ref} dismissible={!paying}>
      <BookingPanel listing={listing} onBooked={onBooked} onPayingChange={setPaying} />
    </Sheet>
  );
});

/** E. Book. Tap the first and last night, guests, the breakdown, Apple Pay. Inline on the desktop listing page. */
export function BookingPanel({ listing, onBooked, onPayingChange, beforePay }: PanelProps) {
  const usable = useFreeNights();
  const { range: exploreRange, book, nightGrants, unlockDays } = useApp();
  const banked = freeNightsOf(nightGrants);
  const isOpenFor = useIsOpen();
  const isOpen = (d: number) => isOpenFor(listing, d);
  const rules: RangeRules = { maxStart: 5, maxNights: MAX_NIGHTS, isOpen };

  // Start from the nights chosen on Explore when they work here, else the first open night.
  const initial = useMemo<Range | null>(() => {
    if (exploreRange && rangeOpen(exploreRange, isOpen)) return exploreRange;
    const first = [1, 2, 3, 4, 5].find(isOpen);
    return first ? { start: first, end: first } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploreRange, listing.id, isOpenFor]);

  const [range, setRange] = useState<Range | null>(initial);
  const [guests, setGuests] = useState(Math.min(2, listing.guests));
  const [useFree, setUseFree] = useState(true);
  const [paying, setPaying] = useState(false);

  // Reset the nights when the starting point changes (adjusting state during render, not in an effect).
  const [seenInitial, setSeenInitial] = useState(initial);
  if (seenInitial !== initial) {
    setSeenInitial(initial);
    setRange(initial);
  }

  const nights = range ? nightsIn(range) : 0;
  // Free nights here are the member's bank, within the host's monthly cap.
  const freeHere = freeNightsAt(listing, usable);
  const capReached = usable > 0 && freeHere === 0;
  const price = priceStay(listing, Math.max(nights, 1), freeHere, useFree);
  const inDate = range ? addDays(today(), range.start) : null;
  const outDate = range ? addDays(today(), range.end + 1) : null;
  const locked = banked > 0 && usable === 0;
  const firstUnlock = nightGrants.map((g) => unlockDate(g, unlockDays)).find((d) => d.getTime() > today().getTime());

  const pay = async () => {
    if (paying || !range || !inDate) return;
    if (beforePay && !(await beforePay())) return;
    setPaying(true);
    onPayingChange?.(true);
    await payments.payStay(price.total, 'apple_pay');
    haptics.success();
    const booking = book({ listingId: listing.id, checkIn: toISODate(inDate), nights, guests, price, paidWith: 'apple_pay' });
    setPaying(false);
    onPayingChange?.(false);
    onBooked(booking);
  };

  return (
    <>
      <T variant="heading" style={{ marginBottom: 4 }}>Your stay</T>
      <T variant="caption" color="inkSecondary" style={{ marginBottom: 12 }}>
        {range && inDate && outDate
          ? `${longDay(inDate)} to ${longDay(outDate)} · ${plural(nights, 'night')}`
          : 'Tap your first night, then your last.'}
      </T>
      <RangeChips days={DAYS_SHOWN} value={range} onChange={setRange} rules={rules} />
      {range && range.start === range.end ? (
        <T variant="caption" color="inkSecondary" style={{ marginTop: 8 }}>
          Out {shortDay(outDate!)}. Tap a later day to stay longer.
        </T>
      ) : null}

      <View style={{ marginTop: 12 }}>
        <Stepper label="Guests" noun="guests" value={guests} min={1} max={listing.guests} onChange={setGuests} />
      </View>

      <View style={{ marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line }}>
        {price.free > 0 ? <LineItem label={`${plural(price.free, 'free night')} (from your bank)`} value="$0" /> : null}
        {price.paidNights > 0 ? <LineItem label={`${plural(price.paidNights, 'night')} at 50%`} value={money(price.nightsCost)} /> : null}
        <LineItem label="Cleaning" value={money(price.cleaning)} />
        <LineItem label="Taxes" value={money(price.taxes)} />
        <LineItem label="Booking fee" value={money(price.bookingFee)} />
        <LineItem strong label="Total" value={money(price.total)} />
      </View>

      {freeHere > 0 ? (
        <View style={{ marginTop: 8, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T>Use free nights</T>
          <Switch
            accessibilityLabel="Use free nights"
            value={useFree}
            onValueChange={(v) => {
              haptics.tapLight();
              setUseFree(v);
            }}
            trackColor={{ true: colors.light.ink, false: colors.light.line }}
            thumbColor="#FFFFFF"
            {...({ activeThumbColor: '#FFFFFF' } as object)}
          />
        </View>
      ) : capReached ? (
        <T variant="caption" color="inkSecondary" style={{ marginTop: 12 }}>
          This home's free nights are taken for this month. You can still stay at half price.
        </T>
      ) : locked && firstUnlock ? (
        <T variant="caption" color="inkSecondary" style={{ marginTop: 12 }}>
          Your free nights unlock {fullDate(toISODate(firstUnlock))}.
        </T>
      ) : null}

      <PayButton style={{ marginTop: 24 }} loading={paying} disabled={!range} onPress={pay} />
    </>
  );
}
