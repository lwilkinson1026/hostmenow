import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { HostIcon, type HostIconName } from '@/components/host/HostIcon';
import { hs, money0 } from '@/components/host/HostUI';
import { PressScale } from '@/components/PressScale';
import { T } from '@/components/Text';
import { host, hostListings, quarter } from '@/data/host';
import { monthDay, plural } from '@/lib/dates';
import { useInsets } from '@/lib/insets';
import { nextPoolPayout, roundTo } from '@/lib/pool';
import { haptics } from '@/services';
import { invitesLeft, listingEstimate, useHost } from '@/store/host';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <T variant="caption" color="inkSecondary">{label}</T>
      <T variant="heading" style={{ fontSize: 22 }}>{value}</T>
    </View>
  );
}

/** Before opt-in: the personal estimate. */
function InviteCard() {
  const eligible = hostListings.filter((l) => l.eligible);
  const total = roundTo(eligible.reduce((s, l) => s + listingEstimate(l.id, 'both'), 0), 100);
  return (
    <View style={styles.dark}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T variant="captionStrong" style={{ color: '#F5F5F4' }}>hostmenow</T>
        <View style={styles.newPill}>
          <T variant="caption" style={{ color: hs.muted, fontSize: 12, lineHeight: 16 }}>New</T>
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <T style={{ color: '#F5F5F4', fontSize: 40, lineHeight: 44, letterSpacing: -1.2 }} variant="bodyStrong">{money0(total)}</T>
        <T variant="callout" style={{ color: hs.muted, lineHeight: 21 }}>
          What your empty nights could earn in a year, from your {eligible.length} listings.
        </T>
      </View>
      <PressScale
        accessibilityRole="button"
        onPress={() => {
          haptics.tapLight();
          router.push('/host/value');
        }}
        style={styles.lightButton}
      >
        <T variant="calloutStrong">See how</T>
      </PressScale>
    </View>
  );
}

/** After opt-in: this quarter's earnings. */
function EarningsCard() {
  const s = useHost();
  const live = s.rows.filter((r) => r.on).length;
  const total = quarter.paidStays.amount + quarter.pool.amount;
  const paidPct = (quarter.paidStays.amount / total) * 100;
  return (
    <View style={styles.light}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T variant="captionStrong">hostmenow</T>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/host/listings', params: { mode: 'manage' } })} hitSlop={8} style={{ paddingVertical: 8 }}>
          <T variant="captionStrong">Manage</T>
        </Pressable>
      </View>
      <T variant="caption" color="inkSecondary" style={{ marginTop: 8 }}>This quarter</T>
      <T variant="bodyStrong" style={{ fontSize: 40, lineHeight: 44, letterSpacing: -1.2, fontVariant: ['tabular-nums'] }}>{money0(total)}</T>
      <View style={styles.bar}>
        <View style={{ width: `${paidPct}%`, backgroundColor: hs.ink }} />
        <View style={{ flex: 1, backgroundColor: hs.accent }} />
      </View>
      <View style={styles.row}>
        <View style={styles.legend}>
          <View style={[styles.dot, { backgroundColor: hs.ink }]} />
          <T variant="callout">Paid stays · {quarter.paidStays.nights} nights</T>
        </View>
        <T variant="calloutStrong" style={{ fontVariant: ['tabular-nums'] }}>{money0(quarter.paidStays.amount)}</T>
      </View>
      <View style={styles.row}>
        <View style={styles.legend}>
          <View style={[styles.dot, { backgroundColor: hs.accent }]} />
          <T variant="callout">Pool estimate · {quarter.pool.freeStays} free stays</T>
        </View>
        <T variant="calloutStrong" style={{ fontVariant: ['tabular-nums'] }}>{money0(quarter.pool.amount)}</T>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, gap: 8 }}>
        <T variant="caption" color="inkSecondary">Pool paid {monthDay(nextPoolPayout())}</T>
        <T variant="caption" color="inkSecondary">
          {plural(live, 'listing')} live · {plural(invitesLeft(s), 'invite')} left
        </T>
      </View>
    </View>
  );
}

const tabs: { icon: HostIconName; label: string }[] = [
  { icon: 'home', label: 'Home' },
  { icon: 'calendar', label: 'Calendar' },
  { icon: 'pin', label: 'Travel' },
  { icon: 'inbox', label: 'Inbox' },
];

/** The Hostshare dashboard with the hostmenow card. */
export default function HostDashboard() {
  const insets = useInsets();
  const optedIn = useHost((s) => s.optedIn);
  return (
    <View style={{ flex: 1, backgroundColor: hs.page }}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top - 24 }]}>
        <T variant="heading" style={{ letterSpacing: -0.4 }}>Hostshare</T>
        <View style={styles.avatar}>
          <T variant="calloutStrong" style={{ fontSize: 14 }}>{host.initial}</T>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, gap: 20 }}>
        <T variant="title">{greeting()}</T>
        {optedIn ? <EarningsCard /> : <InviteCard />}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Stat label="Travel nights" value={host.travelNights} />
          <Stat label="Upcoming guests" value={host.upcomingGuests + (optedIn ? 1 : 0)} />
        </View>
        {optedIn ? (
          <View style={styles.notice}>
            <View style={styles.badge}>
              <T variant="captionStrong" style={{ color: '#FFFFFF', fontSize: 12, lineHeight: 16 }}>hostmenow</T>
            </View>
            <T variant="callout" style={{ flex: 1 }}>{quarter.latest}</T>
          </View>
        ) : (
          <View>
            <T variant="bodyStrong" style={{ marginBottom: 4 }}>Your listings</T>
            {hostListings
              .filter((l) => l.eligible)
              .map((l, i, all) => (
                <View key={l.id} style={[styles.listingRow, i < all.length - 1 && styles.divider]}>
                  <T variant="callout">{l.name}</T>
                  <T variant="callout" color="inkSecondary">{l.city}</T>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
      <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        {tabs.map((t, i) => (
          <View key={t.label} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <HostIcon name={t.icon} size={22} color={i === 0 ? hs.ink : hs.secondary} />
            <T variant={i === 0 ? 'tabStrong' : 'tab'} style={{ color: i === 0 ? hs.ink : hs.secondary }}>{t.label}</T>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { height: 64 + 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: hs.line, alignItems: 'center', justifyContent: 'center' },
  dark: { backgroundColor: hs.ink, borderRadius: 16, paddingTop: 22, paddingHorizontal: 22, paddingBottom: 20, gap: 14 },
  newPill: { borderWidth: 1, borderColor: '#44403C', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  lightButton: { height: 48, borderRadius: 999, backgroundColor: '#F5F5F4', alignItems: 'center', justifyContent: 'center' },
  light: { backgroundColor: hs.card, borderWidth: 1, borderColor: hs.line, borderRadius: 16, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8 },
  bar: { flexDirection: 'row', height: 6, borderRadius: 999, overflow: 'hidden', gap: 2, marginTop: 14, marginBottom: 6, backgroundColor: hs.subtle },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: hs.line },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stat: { flex: 1, backgroundColor: hs.card, borderWidth: 1, borderColor: hs.line, borderRadius: 12, padding: 16, gap: 4 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: hs.card, borderWidth: 1, borderColor: hs.line, borderRadius: 12 },
  badge: { backgroundColor: hs.ink, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  listingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: hs.line },
  nav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: hs.line, backgroundColor: hs.card, paddingTop: 10 },
});
