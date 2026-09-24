import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { HostIcon, type HostIconName } from '@/components/host/HostIcon';
import { hs, money0 } from '@/components/host/HostUI';
import { PressScale } from '@/components/PressScale';
import { T } from '@/components/Text';
import { host, hostListings, memberStayEvents, notices, quarterStays } from '@/data/host';
import { fromISODate, monthDay, plural } from '@/lib/dates';
import { useInsets } from '@/lib/insets';
import { estimate, money10, networkFor, nextPoolPayout } from '@/lib/estimate';
import { accruedPool, poolPerDay, quarterStart } from '@/lib/poolAccrual';
import { hostPayout, priceStay } from '@/lib/pricing';
import { covered, fmtNights, replay } from '@/lib/shareLedger';
import { haptics } from '@/services';
import { hostPrefill, invitesLeft, useHost } from '@/store/host';
import { BRAND, PRICING_CONFIG } from '@/config';

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

/** Before opt-in: the host's prefilled estimate, leading with the pool (Revision 02). */
function InviteCard() {
  const prefill = hostPrefill();
  const e = estimate(prefill, networkFor('launch'));
  return (
    <View style={styles.dark}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T variant="captionStrong" style={{ color: '#F5F5F4' }}>hostmenow</T>
        <View style={styles.newPill}>
          <T variant="caption" style={{ color: hs.muted, fontSize: 12, lineHeight: 16 }}>New</T>
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <T style={{ color: '#F5F5F4', fontSize: 40, lineHeight: 44, letterSpacing: -1.2 }} variant="bodyStrong">
          {money10(e.pool)}
          <T style={{ color: hs.muted }}> a year from the pool</T>
        </T>
        <T variant="callout" style={{ color: hs.muted, lineHeight: 21 }}>
          Nearly half of every membership goes to hosts. About {money10(e.total)} a year in all from your {prefill.homes} listings.
        </T>
      </View>
      <PressScale
        accessibilityRole="button"
        onPress={() => {
          haptics.tapLight();
          router.push('/preview/hostshare/value');
        }}
        style={styles.lightButton}
      >
        <T variant="calloutStrong">See how</T>
      </PressScale>
    </View>
  );
}

/** Share-night credits from member stays, from the reservation events Hostshare receives. */
const ledger = replay(memberStayEvents);

/** This quarter's payout statement (Revision 03): card fees come off stays and cleaning, never the pool. */
const statement = quarterStays.reduce(
  (acc, st) => {
    const l = hostListings.find((x) => x.id === st.listingId)!;
    const nights = st.freeNights + st.paidNights;
    const p = hostPayout(priceStay({ retailNight: l.rate, cleaning: l.cleaning }, nights, st.freeNights));
    return { paidNights: acc.paidNights + st.paidNights, stays: acc.stays + p.stays, cleaning: acc.cleaning + p.cleaning, cardFees: acc.cardFees + p.cardFees };
  },
  { paidNights: 0, stays: 0, cleaning: 0, cardFees: 0 },
);
const pct = (r: number) => `${+(r * 100).toFixed(1)}%`;
const payoutNet = statement.stays + statement.cleaning - statement.cardFees;

/** Re-render every `ms` so the running total keeps up with the clock. */
function useNow(ms: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

const money2 = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Counts up to `value` when the card opens, then follows it. */
function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const a = from.current;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1400);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = a + (value - a) * eased;
      setShown(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <T variant="bodyStrong" style={{ fontSize: 40, lineHeight: 44, letterSpacing: -1.2, fontVariant: ['tabular-nums'] }}>
      {money2(shown)}
    </T>
  );
}

/** After opt-in: the running pool share leads, then the rest of the quarter. */
function EarningsCard() {
  const s = useHost();
  const now = useNow(30_000);
  const opted = s.rows.filter((r) => r.on);
  const paused = opted.filter((r) => r.paused);
  const open = opted.filter((r) => !r.paused);
  const listing = (id: string) => hostListings.find((l) => l.id === id)!;
  const toAccrual = (r: (typeof opted)[number]) => {
    const l = listing(r.id);
    return { id: r.id, rate: l.rate, openNights: l.openNights, mode: r.mode, freeCap: r.freeCap, liveFrom: fromISODate(host.optedInAt).getTime() };
  };
  const pool = accruedPool(opted.map(toAccrual), s.pauses, quarterStart(new Date(now)).getTime(), now);
  const perDay = (rows: typeof opted) => rows.reduce((sum, r) => sum + poolPerDay(toAccrual(r)), 0);
  const total = payoutNet + pool;

  return (
    <View style={styles.light}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T variant="captionStrong">hostmenow</T>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/preview/hostshare/listings', params: { mode: 'manage' } })} hitSlop={8} style={{ paddingVertical: 8 }}>
          <T variant="captionStrong">Manage</T>
        </Pressable>
      </View>
      <T variant="caption" color="inkSecondary" style={{ marginTop: 8 }}>Your pool share this quarter</T>
      <CountUp value={pool} />
      <T variant="caption" color="inkSecondary">Estimated. Paid {monthDay(nextPoolPayout())}.</T>
      <T variant="captionStrong" style={{ color: hs.accentText, marginTop: 10 }}>
        {open.length === 0
          ? `All listings paused. Reopening adds ${money2(perDay(paused))} a day.`
          : paused.length > 0
            ? `+${money2(perDay(open))} a day. Reopening ${paused.length === 1 ? 'your paused listing' : `${paused.length} paused listings`} adds ${money2(perDay(paused))} more.`
            : `+${money2(perDay(open))} a day while your listings are open`}
      </T>

      <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: hs.line }}>
        <View style={styles.row}>
          <T variant="callout">Paid stays · {statement.paidNights} nights, after {pct(PRICING_CONFIG.platform_take_on_paid_stays)} fee</T>
          <T variant="calloutStrong" style={{ fontVariant: ['tabular-nums'] }}>{money0(statement.stays)}</T>
        </View>
        <View style={styles.row}>
          <T variant="callout">Cleaning fees · {quarterStays.length} stays</T>
          <T variant="calloutStrong" style={{ fontVariant: ['tabular-nums'] }}>{money0(statement.cleaning)}</T>
        </View>
        <View style={styles.row}>
          <T variant="callout">Card fees ({pct(PRICING_CONFIG.host_card_fee_rate)})</T>
          <T variant="calloutStrong" style={{ fontVariant: ['tabular-nums'] }}>-{money0(statement.cardFees)}</T>
        </View>
        {host.tier === 'Pro' || host.tier === 'Pro+' ? (
          <View style={styles.row}>
            <T variant="callout" style={{ flexShrink: 1 }}>Share nights covered by {BRAND}</T>
            <T variant="calloutStrong" style={{ fontVariant: ['tabular-nums'] }}>
              {fmtNights(covered(ledger, host.id, host.membershipYearStart))} of {host.pledge}
            </T>
          </View>
        ) : null}
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <T variant="calloutStrong">This quarter so far</T>
          <T variant="calloutStrong" style={{ fontVariant: ['tabular-nums'] }}>{money0(total)}</T>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 12 }}>
        <T variant="caption" color="inkSecondary">
          {plural(open.length, 'listing')} live{paused.length ? ` · ${paused.length} paused` : ''} · {plural(invitesLeft(s), 'invite')} left
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
          <View style={{ gap: 8 }}>
            {notices.map((n) => (
              <View key={n} style={styles.notice}>
                <View style={styles.badge}>
                  <T variant="captionStrong" style={{ color: '#FFFFFF', fontSize: 12, lineHeight: 16 }}>hostmenow</T>
                </View>
                <T variant="callout" style={{ flex: 1 }}>{n}</T>
              </View>
            ))}
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
