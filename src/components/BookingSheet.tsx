import { forwardRef, useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import type { Listing } from '@/data/mock';
import { addDays, plural, shortDay, toISODate, today } from '@/lib/dates';
import { money, priceStay } from '@/lib/pricing';
import { haptics, payments } from '@/services';
import { useApp, useFreeNights, type Booking } from '@/store/app';
import { colors } from '@/theme';
import { PayButton } from './Buttons';
import { DateChips } from './DateChips';
import { LineItem } from './Rows';
import { Sheet, type SheetRef } from './Sheet';
import { Stepper } from './Stepper';
import { T } from './Text';

const MAX_NIGHTS = 7;

type Props = { listing: Listing; onBooked: (b: Booking) => void };

/** E. Book. Check-in chips, nights and guests, the breakdown, Apple Pay. */
export const BookingSheet = forwardRef<SheetRef, Props>(function BookingSheet({ listing, onBooked }, ref) {
  const bank = useFreeNights();
  const { arrivalOffset, book } = useApp();
  const firstOpen = [arrivalOffset, 1, 2, 3, 4, 5].find((d) => !listing.closedDays.includes(d)) ?? 1;
  const [checkIn, setCheckIn] = useState(firstOpen);
  const [nights, setNights] = useState(3);
  const [guests, setGuests] = useState(Math.min(2, listing.guests));
  const [useFree, setUseFree] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => setCheckIn(firstOpen), [firstOpen]);

  const price = priceStay(listing, nights, bank, useFree);
  const inDate = addDays(today(), checkIn);
  const outDate = addDays(inDate, nights);

  const pay = async () => {
    if (paying) return;
    setPaying(true);
    await payments.payStay(price.total, 'apple_pay');
    haptics.success();
    const booking = book({ listingId: listing.id, checkIn: toISODate(inDate), nights, guests, price, paidWith: 'apple_pay' });
    setPaying(false);
    onBooked(booking);
  };

  return (
    <Sheet ref={ref} dismissible={!paying}>
      <T variant="heading" style={{ marginBottom: 16 }}>Your stay</T>
      <T variant="caption" color="inkSecondary" style={{ marginBottom: 8 }}>Check-in</T>
      <DateChips selected={checkIn} onSelect={setCheckIn} unavailable={listing.closedDays} />

      <View style={{ marginTop: 12 }}>
        <Stepper label="Nights" caption={`Out ${shortDay(outDate)}`} noun="nights" value={nights} min={1} max={MAX_NIGHTS} onChange={setNights} />
        <Stepper label="Guests" noun="guests" value={guests} min={1} max={listing.guests} onChange={setGuests} />
      </View>

      <View style={{ marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line }}>
        {price.free > 0 ? <LineItem label={`${plural(price.free, 'free night')} (from your bank)`} value="$0" /> : null}
        {price.paidNights > 0 ? <LineItem label={`${plural(price.paidNights, 'night')} at 50%`} value={money(price.nightsCost)} /> : null}
        <LineItem label="Cleaning" value={money(price.cleaning)} />
        <LineItem label="Taxes" value={money(price.taxes)} />
        <LineItem strong label="Total" value={money(price.total)} />
      </View>

      {bank > 0 ? (
        <View style={{ marginTop: 8, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T nativeID="use-free-label">Use free nights</T>
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
      ) : null}

      <PayButton style={{ marginTop: 24 }} loading={paying} onPress={pay} />
    </Sheet>
  );
});
