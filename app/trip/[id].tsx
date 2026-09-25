import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import { Alert, Platform, Pressable, PressableProps, ScrollView, StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { Avatar } from '@/components/Avatar';
import { TextButton } from '@/components/Buttons';
import { CircleButton } from '@/components/CircleButton';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/PressScale';
import { LineItem } from '@/components/Rows';
import { StaticMap } from '@/components/StaticMap';
import { T } from '@/components/Text';
import { cardLabel, getListing, member } from '@/data/mock';
import { addDays, fromISODate, longDay, longRange, plural } from '@/lib/dates';
import { CONTENT_MAX, DESKTOP_GUTTER, useDesktop } from '@/lib/layout';
import { money } from '@/lib/pricing';
import { haptics } from '@/services';
import { freeNightsRefundable, useApp } from '@/store/app';
import { colors, radius } from '@/theme';

function Section({ title, children, first, last }: { title: string; children: ReactNode; first?: boolean; last?: boolean }) {
  return (
    <View style={[styles.section, first && { paddingTop: 0 }, last && { borderBottomWidth: 0 }]}>
      <T variant="heading">{title}</T>
      {children}
    </View>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}>
      <T variant="callout" color="inkSecondary">{k}</T>
      <T variant="callout" align="right">{v}</T>
    </View>
  );
}

function confirm(title: string, detail: string | undefined, action: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(detail ? `${title}\n\n${detail}` : title)) onYes();
    return;
  }
  Alert.alert(title, detail, [
    { text: 'Keep trip', style: 'cancel' },
    { text: action, style: 'destructive', onPress: onYes },
  ]);
}

/** H. Trip detail. */
export default function Trip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useInsets();
  const desktop = useDesktop();
  const booking = useApp((s) => s.bookings.find((b) => b.id === id));
  const cancelBooking = useApp((s) => s.cancelBooking);
  const [now] = useState(Date.now);
  const listing = booking && getListing(booking.listingId);
  if (!booking || !listing) return null;

  const inDate = fromISODate(booking.checkIn);
  const outDate = addDays(inDate, booking.nights);
  const arrive = new Date(inDate);
  arrive.setHours(16, 0, 0, 0);
  const reveal = new Date(arrive.getTime() - 24 * 60 * 60 * 1000);
  const revealed = now >= reveal.getTime();
  const cover = listing.photos[0];
  const p = booking.price;

  // Free nights and the booking fee come back together when a free stay is cancelled 24h+ ahead.
  // Otherwise the booking fee follows the paid-night policy for the booking.
  const cancelDetail = () => {
    if (p.free === 0) return undefined;
    const n = plural(p.free, 'free night');
    return freeNightsRefundable(booking)
      ? `Your ${n} and the ${money(p.bookingFee)} booking fee go back to you.`
      : `It's less than 24 hours to check-in, so your ${n} won't come back.`;
  };

  const back = () => (router.canGoBack() ? router.back() : router.replace('/trips'));

  const heading = (
    <View style={{ gap: 4, paddingBottom: 8 }}>
      <T variant="title" accessibilityRole="header">{listing.name}</T>
      <T variant="callout" color="inkSecondary">
        {longRange(inDate, outDate)} · {plural(booking.guests, 'guest')}
      </T>
    </View>
  );

  const checkIn = (
    <Section title="Check-in" first={desktop}>
      <Pair k="Arrive" v={`${longDay(inDate)} after 4:00 PM`} />
      <Pair k="Leave" v={`${longDay(outDate)} by 11:00 AM`} />
      <View style={styles.code}>
        <Icon name="lock" size={22} color={colors.light.inkSecondary} />
        <View style={{ gap: 2 }}>
          <T variant="bodyStrong" style={{ letterSpacing: revealed ? 2 : 5.1 }}>{revealed ? booking.doorCode : '••••'}</T>
          <T variant="caption" color="inkSecondary">
            {revealed ? 'Door code' : `Door code appears ${longDay(reveal)} at 4:00 PM`}
          </T>
        </View>
      </View>
    </Section>
  );

  const address = (
    <Section title="Address" last={desktop}>
      <T>
        {listing.street}
        {'\n'}
        {listing.region}
      </T>
      <StaticMap height={desktop ? 240 : 150} marker="pin" />
    </Section>
  );

  const rest = (
    <>
      <Section title="Host">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar initials={listing.host[0]} />
          <T style={{ flex: 1 }}>{listing.host}</T>
          <MessageButton onPress={() => haptics.tapLight()} />
        </View>
      </Section>

      <Section title="House rules">
        {listing.rules.map((r) => (
          <T key={r} variant="callout">{r}</T>
        ))}
      </Section>

      <Section title="Receipt">
        <View>
          {p.free > 0 ? <LineItem pad={8} label={plural(p.free, 'free night')} value="$0" /> : null}
          {p.paidNights > 0 ? <LineItem pad={8} label={`${plural(p.paidNights, 'night')} at 50%`} value={money(p.nightsCost)} /> : null}
          <LineItem pad={8} label="Cleaning" value={money(p.cleaning)} />
          <LineItem pad={8} label="Taxes" value={money(p.taxes)} />
          {p.bookingFee ? <LineItem pad={8} label="Booking fee" value={money(p.bookingFee)} /> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
            <T variant="calloutStrong">Paid · {booking.paidWith === 'apple_pay' ? 'Apple Pay' : cardLabel(member.card)}</T>
            <T variant="calloutStrong">{money(p.total)}</T>
          </View>
        </View>
      </Section>
    </>
  );

  const cancel = (
    <TextButton
      label="Cancel trip"
      color="danger"
      style={desktop ? { alignSelf: 'flex-start' } : undefined}
      onPress={() =>
        confirm(`Cancel your trip to ${listing.name}?`, cancelDetail(), 'Cancel trip', () => {
          cancelBooking(booking.id);
          if (router.canGoBack()) router.back();
          else router.dismissTo('/trips');
        })
      }
    />
  );

  if (desktop) {
    // Desktop: photo and the address on the left, the stay's details and actions on the right.
    return (
      <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={{
            width: '100%',
            maxWidth: CONTENT_MAX + DESKTOP_GUTTER * 2,
            alignSelf: 'center',
            paddingHorizontal: DESKTOP_GUTTER,
            paddingTop: 24,
            paddingBottom: 80,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to trips"
            onPress={back}
            style={({ hovered }: { hovered?: boolean }) => [styles.back, hovered && { backgroundColor: colors.light.bgSubtle }]}
          >
            <Icon name="chevron-left" size={20} />
            <T variant="callout">Trips</T>
          </Pressable>
          <View style={{ marginTop: 20 }}>{heading}</View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 64, marginTop: 24 }}>
            <View style={{ flex: 7, minWidth: 0 }}>
              <Image
                source={cover.src}
                accessibilityLabel={listing.name}
                contentFit="cover"
                contentPosition={{ left: `${cover.cropX}%`, top: '50%' }}
                style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: radius.card }}
              />
              {address}
            </View>
            <View style={{ flex: 5, minWidth: 0 }}>
              {checkIn}
              {rest}
              <View style={{ paddingTop: 20 }}>{cancel}</View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={cover.src}
          accessibilityLabel={listing.name}
          contentFit="cover"
          contentPosition={{ left: `${cover.cropX}%`, top: '50%' }}
          style={{ width: '100%', height: 300 }}
        />
        <View style={{ padding: 24, paddingBottom: 0 }}>
          {heading}
          {checkIn}
          {address}
          {rest}
          <View style={{ paddingTop: 20, paddingBottom: 48 + insets.bottom }}>{cancel}</View>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', top: insets.top - 5, left: 16 }}>
        <CircleButton icon="chevron-left" label="Back" onPress={back} />
      </View>
    </View>
  );
}

function MessageButton({ onPress }: Pick<PressableProps, 'onPress'>) {
  return (
    <PressScale accessibilityRole="button" onPress={onPress} style={styles.message}>
      <Icon name="message" size={18} />
      <T variant="calloutStrong">Message</T>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12, paddingVertical: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.line },
  code: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    backgroundColor: colors.light.bgSubtle,
  },
  back: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingLeft: 6,
    paddingRight: 14,
    marginLeft: -6,
    borderRadius: radius.pill,
  },
  message: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.light.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
