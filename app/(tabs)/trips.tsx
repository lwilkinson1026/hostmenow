import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/PressScale';
import { Segmented } from '@/components/Segmented';
import { T } from '@/components/Text';
import { getListing } from '@/data/mock';
import { addDays, fromISODate, plural, shortRange, today } from '@/lib/dates';
import { useApp, type Booking } from '@/store/app';
import { colors, radius } from '@/theme';

const checkout = (b: Booking) => addDays(fromISODate(b.checkIn), b.nights);

function TripRow({ b }: { b: Booking }) {
  const l = getListing(b.listingId);
  if (!l) return null;
  const cover = l.photos[0];
  const inDate = fromISODate(b.checkIn);
  return (
    <PressScale
      accessibilityRole="link"
      accessibilityLabel={`${l.name}, ${shortRange(inDate, checkout(b))}, ${b.status}`}
      onPress={() => router.push({ pathname: '/trip/[id]', params: { id: b.id } })}
      scaleTo={0.985}
      style={styles.row}
    >
      <Image source={cover.src} contentFit="cover" contentPosition={{ left: `${cover.cropX}%`, top: '50%' }} style={styles.thumb} />
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="bodyStrong">{l.name}</T>
        <T variant="callout" color="inkSecondary">
          {shortRange(inDate, checkout(b))} · {plural(b.nights, 'night')}
        </T>
        <T variant="caption" color={b.status === 'Confirmed' ? 'ink' : 'inkSecondary'}>{b.status}</T>
      </View>
      <Icon name="chevron-right" size={20} color={colors.light.inkTertiary} />
    </PressScale>
  );
}

/** G. Trips. */
export default function Trips() {
  const insets = useInsets();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { bookings, tripsEmpty } = useApp();
  const now = today().getTime();
  const all = tripsEmpty ? [] : bookings;
  const shown = all
    .filter((b) => (tab === 'upcoming' ? checkout(b).getTime() >= now : checkout(b).getTime() < now))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 39, paddingHorizontal: 24, paddingBottom: 40, gap: 20 }}>
        <T variant="title" accessibilityRole="header">Trips</T>
        <Segmented
          options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' },
          ]}
          value={tab}
          onChange={setTab}
        />
        {shown.length ? (
          <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line }}>
            {shown.map((b) => (
              <TripRow key={b.id} b={b} />
            ))}
          </View>
        ) : tab === 'upcoming' || all.length === 0 ? (
          <View style={{ paddingTop: 140, paddingHorizontal: 16, alignItems: 'center', gap: 20 }}>
            <T color="inkSecondary" align="center" style={{ maxWidth: 260 }}>
              No trips yet. Something's always open within 5 days.
            </T>
            <PressScale accessibilityRole="button" onPress={() => router.navigate('/explore')} style={styles.explore}>
              <T variant="calloutStrong">Explore homes</T>
            </PressScale>
          </View>
        ) : (
          <T color="inkSecondary" align="center" style={{ paddingTop: 140 }}>No past trips yet.</T>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.line,
  },
  thumb: { width: 72, height: 72, borderRadius: radius.card },
  explore: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.light.line,
    justifyContent: 'center',
  },
});
