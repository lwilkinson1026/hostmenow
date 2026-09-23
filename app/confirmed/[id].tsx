import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { PrimaryButton, TextButton } from '@/components/Buttons';
import { NightsPillChange } from '@/components/NightsPill';
import { T } from '@/components/Text';
import { getListing } from '@/data/mock';
import { addDays, fromISODate, longRange } from '@/lib/dates';
import { useApp, useBankedNights } from '@/store/app';
import { colors, radius } from '@/theme';

/** F. Booking confirmed. The nights pill settles on the new count. */
export default function Confirmed() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useInsets();
  const booking = useApp((s) => s.bookings.find((b) => b.id === id));
  const bank = useBankedNights();
  const listing = booking && getListing(booking.listingId);
  if (!booking || !listing) return null;

  const inDate = fromISODate(booking.checkIn);
  const cover = listing.photos[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg, paddingHorizontal: 24 }}>
      <StatusBar style="dark" />
      <View style={{ marginTop: insets.top - 5, height: 44, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        <NightsPillChange from={booking.bankBefore} to={bank} />
      </View>
      <Image
        source={cover.src}
        accessibilityLabel={listing.name}
        contentFit="cover"
        contentPosition={{ left: `${cover.cropX}%`, top: '50%' }}
        style={{ marginTop: 20, width: '100%', height: 300, borderRadius: radius.card }}
      />
      <View style={{ marginTop: 32, gap: 10 }}>
        <T variant="title" accessibilityRole="header">You're going to {listing.name}.</T>
        <T>{longRange(inDate, addDays(inDate, booking.nights))}</T>
        <T variant="callout" color="inkSecondary">Check-in details arrive 24 hours before.</T>
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ gap: 4, paddingBottom: Math.max(insets.bottom, 16) }}>
        <PrimaryButton
          label="View trip"
          onPress={() => {
            // Land the trip on top of Trips, so back goes where people expect.
            router.dismissTo('/trips');
            router.push({ pathname: '/trip/[id]', params: { id: booking.id } });
          }}
        />
        <TextButton label="Back to explore" onPress={() => router.dismissTo('/explore')} />
      </View>
    </View>
  );
}
